/**
 * Pure builders for the environment meshes (valley + foreground massif + its erosion map).
 * They run in a Web Worker (terrain.worker.ts) so the few million noise samples never block the main
 * thread while the page loads; the main thread only wraps the finished arrays in BufferGeometries.
 * No three.js here: the worker stays small, normals are computed exactly like
 * BufferGeometry.computeVertexNormals (area-weighted face normals, normalised).
 */
import { config } from '../../config'
import { smoothstep } from '../../utils/math'
import { createTerrainHeight } from './terrainHeight'
import { FOREGROUND, buildForegroundDetail, sampleForeground } from './foregroundHeight'

export interface MeshArrays {
  position: Float32Array
  normal: Float32Array
  index: Uint32Array
  uv?: Float32Array
}

export interface EnvironmentData {
  terrain: MeshArrays
  foreground: MeshArrays
  detail: Uint8Array
}

function gridIndex(nx: number, nz: number) {
  const idx = new Uint32Array((nx - 1) * (nz - 1) * 6)
  let o = 0
  for (let j = 0; j < nz - 1; j++) {
    for (let i = 0; i < nx - 1; i++) {
      const a = j * nx + i
      const b = a + 1
      const c = a + nx
      const d = c + 1
      idx[o++] = a
      idx[o++] = b
      idx[o++] = c
      idx[o++] = b
      idx[o++] = d
      idx[o++] = c
    }
  }
  return idx
}

function vertexNormals(pos: Float32Array, idx: Uint32Array) {
  const n = new Float32Array(pos.length)
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t] * 3
    const b = idx[t + 1] * 3
    const c = idx[t + 2] * 3
    // cb × ab, as three.js does
    const cbx = pos[c] - pos[b], cby = pos[c + 1] - pos[b + 1], cbz = pos[c + 2] - pos[b + 2]
    const abx = pos[a] - pos[b], aby = pos[a + 1] - pos[b + 1], abz = pos[a + 2] - pos[b + 2]
    const x = cby * abz - cbz * aby
    const y = cbz * abx - cbx * abz
    const z = cbx * aby - cby * abx
    n[a] += x; n[a + 1] += y; n[a + 2] += z
    n[b] += x; n[b + 1] += y; n[b + 2] += z
    n[c] += x; n[c + 1] += y; n[c + 2] += z
  }
  for (let i = 0; i < n.length; i += 3) {
    const l = Math.hypot(n[i], n[i + 1], n[i + 2]) || 1
    n[i] /= l
    n[i + 1] /= l
    n[i + 2] /= l
  }
  return n
}

/** The valley: non-uniform grid (dense near the camera and the valley axis, sparse far away). */
export function buildTerrainArrays(): MeshArrays {
  const T = config.terrain
  const height = createTerrainHeight(T.seed, T.floor)
  const nx = T.segmentsX + 1
  const nz = T.segmentsZ + 1
  const position = new Float32Array(nx * nz * 3)
  for (let j = 0; j < nz; j++) {
    const tz = j / (nz - 1)
    const z = T.zNear - (T.zNear - T.zFar) * Math.pow(tz, 1.75)
    for (let i = 0; i < nx; i++) {
      const u = (i / (nx - 1)) * 2 - 1
      const x = Math.sign(u) * Math.pow(Math.abs(u), 1.45) * (T.width / 2)
      const k = (j * nx + i) * 3
      position[k] = x
      position[k + 1] = height(x, z)
      position[k + 2] = z
    }
  }
  // winding so the surface faces +Y (z decreases with j)
  const index = gridIndex(nx, nz)
  return { position, index, normal: vertexNormals(position, index) }
}

/** The foreground massif patch; its rim sinks smoothly below the valley floor (no visible edge). */
export function buildForegroundArrays(heights: Float32Array): MeshArrays {
  const n = FOREGROUND.size
  const half = FOREGROUND.extent / 2
  const position = new Float32Array(n * n * 3)
  const uv = new Float32Array(n * n * 2)
  for (let iz = 0; iz < n; iz++) {
    const tz = iz / (n - 1)
    for (let ix = 0; ix < n; ix++) {
      const tx = ix / (n - 1)
      const h = heights[iz * n + ix]
      const edge = Math.min(tx, 1 - tx, tz, 1 - tz)
      const mask = smoothstep(0.0, 0.14, edge)
      const k = iz * n + ix
      position[k * 3] = -half + tx * FOREGROUND.extent
      position[k * 3 + 1] = h * mask - (1 - mask) * 60
      position[k * 3 + 2] = -(-half + tz * FOREGROUND.extent)
      uv[k * 2] = tx
      uv[k * 2 + 1] = tz
    }
  }
  const index = gridIndex(n, n)
  return { position, uv, index, normal: vertexNormals(position, index) }
}

export function buildEnvironmentData(): EnvironmentData {
  const heights = sampleForeground()
  return {
    terrain: buildTerrainArrays(),
    foreground: buildForegroundArrays(heights),
    detail: buildForegroundDetail(heights),
  }
}

/** Buffers handed over to the main thread without a copy. */
export function transferables(d: EnvironmentData): ArrayBuffer[] {
  const m = (a: MeshArrays) => [a.position.buffer, a.normal.buffer, a.index.buffer, ...(a.uv ? [a.uv.buffer] : [])]
  return [...m(d.terrain), ...m(d.foreground), d.detail.buffer] as ArrayBuffer[]
}
