/**
 * Environment data loader: starts the terrain worker once (at import time of the scene) and caches its
 * promise, so the meshes can suspend on it with React's `use`. Falls back to the main thread when
 * workers are unavailable.
 */
import * as THREE from 'three'
import type { EnvironmentData, MeshArrays } from './terrainBuild'

let promise: Promise<EnvironmentData> | null = null

function fromWorker(): Promise<EnvironmentData> {
  return new Promise((resolve, reject) => {
    if (typeof Worker === 'undefined') {
      reject(new Error('Web Workers are not available'))
      return
    }
    const worker = new Worker(new URL('./terrain.worker.ts', import.meta.url), { type: 'module' })
    worker.onmessage = (e: MessageEvent<EnvironmentData>) => {
      resolve(e.data)
      worker.terminate()
    }
    worker.onerror = (e) => {
      reject(new Error(e.message || 'terrain worker failed'))
      worker.terminate()
    }
  })
}

export function environmentData(): Promise<EnvironmentData> {
  if (!promise) {
    promise = fromWorker().catch(async (error: unknown) => {
      console.warn('[keycap sphere] terrain worker unavailable, building on the main thread:', error)
      const { buildEnvironmentData } = await import('./terrainBuild')
      return buildEnvironmentData()
    })
  }
  return promise
}

export function toGeometry(m: MeshArrays, uvName?: string) {
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(m.position, 3))
  g.setAttribute('normal', new THREE.BufferAttribute(m.normal, 3))
  if (m.uv && uvName) g.setAttribute(uvName, new THREE.BufferAttribute(m.uv, 2))
  g.setIndex(new THREE.BufferAttribute(m.index, 1))
  g.computeBoundingSphere()
  return g
}
