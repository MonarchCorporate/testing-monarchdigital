/**
 * Node test for the pure choreography (run: npx tsx scripts/test-choreography.ts).
 * - counts keycap overlaps (oriented-box SAT) across the whole scroll
 * - checks the sphere is restored after scrolling back
 * - checks phrase keys land in their slots
 */
// run with tsx (Node); typed here so the project needs no @types/node
declare const process: { env: Record<string, string | undefined> }

import { buildLayout } from '../src/choreography/layout'
import { computePose, phaseWeights, ringSpinSpeed, type FrameInput } from '../src/choreography/choreography'
import { config } from '../src/config'
import { finalCameraDistance, phraseWorldCenter, phraseLocalWidth } from '../src/choreography/framing'
import { type Q4, type V3, vrotate, v3, q4, vlen, vsub } from '../src/utils/math'

const L = buildLayout()
const N = L.keys.length
console.log(`keys ${N} (sphere ${L.sphereKeys.length}, phrase ${L.phraseKeys.length})`)
console.log('per ring', L.rings.map((r) => r.count).join(' '))

// conservative box around the keycap: base 2x2, height 1.19 (top is narrower, so this over-reports)
// tapered proxy = two stacked boxes (lower skirt + narrower top), matching the measured profile
type Box = { c: V3; ax: [V3, V3, V3]; h: V3 }
const KS = config.sphere.keyScale
const PARTS: { y: number; h: V3 }[] = [
  { y: 0.3 * KS, h: [1.0 * KS, 0.3 * KS, 1.0 * KS] },
  { y: 0.89 * KS, h: [0.86 * KS, 0.3 * KS, 0.86 * KS] },
]
const MODE = process.env.PROXY || 'tapered'
function box(p: V3, q: Q4): Box[] {
  const ax: [V3, V3, V3] = [vrotate(v3(), [1, 0, 0], q), vrotate(v3(), [0, 1, 0], q), vrotate(v3(), [0, 0, 1], q)]
  const parts = MODE === 'tapered' ? PARTS : [{ y: 0.595 * KS, h: [0.98 * KS, 0.59 * KS, 0.98 * KS] as V3 }]
  return parts.map((pt) => ({ c: [p[0] + ax[1][0] * pt.y, p[1] + ax[1][1] * pt.y, p[2] + ax[1][2] * pt.y] as V3, ax, h: pt.h }))
}
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
function overlapKey(A: Box[], B: Box[]) {
  for (const a of A) for (const b of B) if (overlap(a, b)) return true
  return false
}
function overlap(A: Box, B: Box) {
  const d: V3 = [B.c[0] - A.c[0], B.c[1] - A.c[1], B.c[2] - A.c[2]]
  if (vlen(d) > 3.4 * KS) return false
  const axes: V3[] = [...A.ax, ...B.ax]
  for (const a of A.ax) for (const b of B.ax) { const c = cross(a, b); if (vlen(c) > 1e-6) axes.push(c) }
  for (const ax of axes) {
    const ra = A.h[0] * Math.abs(dot(A.ax[0], ax)) + A.h[1] * Math.abs(dot(A.ax[1], ax)) + A.h[2] * Math.abs(dot(A.ax[2], ax))
    const rb = B.h[0] * Math.abs(dot(B.ax[0], ax)) + B.h[1] * Math.abs(dot(B.ax[1], ax)) + B.h[2] * Math.abs(dot(B.ax[2], ax))
    if (Math.abs(dot(d, ax)) > ra + rb) return false
  }
  return true
}

const ringAngle = new Float64Array(L.rings.length)
const push = new Float32Array(N)
const pos = Array.from({ length: N }, () => v3())
const quat = Array.from({ length: N }, () => q4())
function frame(p: number, time: number): FrameInput {
  return { p, time, idleYaw: time * config.sphere.idleRotationSpeed, bob: 0, tiltX: 0, tiltZ: 0, ringAngle, push }
}
function poseAll(f: FrameInput) {
  const w = phaseWeights(f.p)
  for (let i = 0; i < N; i++) computePose(L, i, f, w, pos[i], quat[i])
}

// simulate a 12-second scroll forward and back at 60fps
const dt = 1 / 60
let t = 0
const steps = Number(process.env.STEPS || 720)
let worst = { p: 0, n: 0 }
const report: Record<string, number> = {}
const pairs: Record<string, number> = {}
for (let s = 0; s <= steps * 2; s++) {
  const p = s <= steps ? s / steps : 2 - s / steps
  const w = phaseWeights(p)
  for (let r = 0; r < L.rings.length; r++) ringAngle[r] += dt * ringSpinSpeed(L, r, w)
  t += dt
  if (s % 6 !== 0) continue
  poseAll(frame(p, t))
  const boxes = pos.map((pp, i) => box(pp, quat[i]))
  let n = 0
  for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) if (overlapKey(boxes[i], boxes[j])) {
    n++
    const tag = `${L.keys[i].letter >= 0 || L.keys[j].letter >= 0 ? 'phrase' : 'sphere'}@${p.toFixed(2)}`
    const nm = (k: number) => `r${L.keys[k].ring}${L.keys[k].letter >= 0 ? 'L' + L.keys[k].letter : ''}`
    const pr = `${nm(i)}-${nm(j)}@${p.toFixed(2)}`
    pairs[pr] = (pairs[pr] || 0) + 1
    report[tag] = (report[tag] || 0) + 1
  }
  if (n > worst.n) worst = { p, n }
}
console.log('worst overlap frame', worst)
const keys = Object.keys(report).sort()
console.log('overlaps by phase', keys.length ? keys.map((k) => `${k}:${report[k]}`).join(' ') : 'none')

console.log('pairs', Object.entries(pairs).sort((a, b) => b[1] - a[1]).slice(0, 30).map(([k, v]) => `${k}:${v}`).join(' '))
// restoration: at p=0 every key sits on the sphere with its top facing outward
poseAll(frame(0, t))
let maxR = 0
let maxN = 0
for (let i = 0; i < N; i++) {
  const r = vlen(pos[i])
  maxR = Math.max(maxR, Math.abs(r - config.sphere.radius))
  const up = vrotate(v3(), [0, 1, 0], quat[i])
  const n = [pos[i][0] / r, pos[i][1] / r, pos[i][2] / r] as V3
  maxN = Math.max(maxN, 1 - dot(up, n))
}
console.log(`restore: max radial error ${maxR.toFixed(4)}, max normal error ${maxN.toExponential(2)}`)

// final: phrase keys at their slots, legends facing +Z
poseAll(frame(1, t))
let maxSlot = 0
for (const lt of L.letters) {
  const d = vlen(vsub(v3(), pos[lt.key], lt.slot))
  maxSlot = Math.max(maxSlot, d)
}
const facing = L.letters.map((lt) => vrotate(v3(), [0, 1, 0], quat[lt.key])[2])
console.log(`final: max slot distance (incl. float) ${maxSlot.toFixed(3)}, min facing z ${Math.min(...facing).toFixed(3)}`)
// all sphere keys must be out of the final frame (simple cone check from the final camera, world space)
const WS = config.sphere.worldScale
const pc = phraseWorldCenter()
const cam = [pc[0], pc[1], pc[2] + finalCameraDistance(1.6)]
let visible = 0
for (const id of L.sphereKeys) {
  const d: V3 = [pos[id][0] * WS - cam[0], pos[id][1] * WS - cam[1], pos[id][2] * WS - cam[2]]
  const vHalf = (config.camera.final.fov * Math.PI) / 360
  const hHalf = Math.atan(Math.tan(vHalf) * 1.6)
  if (d[2] < 0 && Math.abs(Math.atan2(d[1], -d[2])) < vHalf + 0.03 && Math.abs(Math.atan2(d[0], -d[2])) < hHalf + 0.03) visible++
}
console.log(`final: sphere keys still inside the final frustum: ${visible}`)
console.log('phrase:', L.letters.map((l) => l.char).join(''), 'slots x', L.letters.map((l) => l.slot[0].toFixed(1)).join(' '))

console.log(`final camera distance @16:10 ${finalCameraDistance(1.6).toFixed(1)} (phrase local width ${phraseLocalWidth().toFixed(1)})`)
// sweep: does any leaving ring come close to the hero camera?
{
  const camH = config.camera.hero.position
  let minD = Infinity
  for (let s = 0; s <= 400; s++) {
    const p = 0.4 + (0.4 * s) / 400
    poseAll(frame(p, t))
    for (const id of L.sphereKeys) {
      const d = Math.hypot(pos[id][0] * WS - camH[0], pos[id][1] * WS - camH[1], pos[id][2] * WS - camH[2])
      minD = Math.min(minD, d)
    }
  }
  console.log(`closest sphere key to the hero camera during disassembly: ${minD.toFixed(1)} world units`)
}

// third section: anagram re-spelling — collisions among phrase keys while they travel
{
  let worstM = 0
  let at = 0
  const mp = new Set<string>()
  for (let s = 0; s <= 300; s++) {
    const m = s / 300
    const fr = frame(1, t + s / 60)
    fr.material = m
    const w = phaseWeights(1)
    for (const lt of L.letters) computePose(L, lt.key, fr, w, pos[lt.key], quat[lt.key])
    const ids = L.letters.map((l) => l.key)
    const bx = ids.map((id) => box(pos[id], quat[id]))
    let n = 0
    for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) if (overlapKey(bx[i], bx[j])) { n++; mp.add(`${L.letters[i].char}${i}-${L.letters[j].char}${j}`) }
    if (n > worstM) { worstM = n; at = m }
  }
  const fr = frame(1, t)
  fr.material = 1
  for (const lt of L.letters) computePose(L, lt.key, fr, phaseWeights(1), pos[lt.key], quat[lt.key])
  const word = L.letters
    .filter((l) => l.materialSlot)
    .sort((a, b) => a.materialSlot![0] - b.materialSlot![0])
    .map((l) => l.char)
    .join('')
  const fallen = L.letters.filter((l) => !l.materialSlot).map((l) => `${l.char}@y${(pos[l.key][1]).toFixed(0)}`)
  console.log(`material: word ${word}, fallen ${fallen.join(' ')}, worst overlap ${worstM} at m=${at.toFixed(2)}`, [...mp].join(' '))
}
