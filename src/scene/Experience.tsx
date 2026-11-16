/**
 * Canvas + renderer setup.
 *  - sRGB output, ACES filmic applied in the post chain (renderer itself is `flat`: NoToneMapping);
 *  - soft PCF shadows (keys only), DPR capped once at start (never switched at runtime) by a pixel budget;
 *  - the frame loop stops while the stage is scrolled out of view (the case study below), so the page
 *    underneath scrolls without a WebGL scene competing for the GPU.
 */
import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { config } from '../config'
import { store } from '../state/store'
import { patchFogChunks } from './environment/fogChunks'
import { environmentData } from './environment/terrainData'
import { Scene } from './Scene'
import styles from '../App.module.css'

patchFogChunks()
// start building the valley in its worker right away, in parallel with the keycap download
void environmentData()

function initialDpr() {
  const P = config.performance
  const css = Math.max(1, window.innerWidth * window.innerHeight)
  const budget = Math.sqrt(P.pixelBudget / css)
  return Math.max(P.dpr[0], Math.min(window.devicePixelRatio || 1, P.dpr[1], budget))
}

export function Experience({ active = true }: { active?: boolean }) {
  const [dpr] = useState<number>(initialDpr)

  return (
    <Canvas
      className={styles.webgl}
      dpr={dpr}
      frameloop={active ? 'always' : 'never'}
      flat
      shadows="soft"
      gl={{ antialias: false, powerPreference: 'high-performance', stencil: false, alpha: false, depth: true }}
      camera={{
        fov: config.camera.fov,
        near: config.camera.near,
        far: config.camera.far,
        position: config.camera.hero.position as unknown as [number, number, number],
      }}
      onCreated={(state) => {
        const { gl } = state
        // dev-only handle for debugging from the console: window.__keycap.scene / .camera / .gl
        if (import.meta.env.DEV) (window as unknown as { __keycap: unknown }).__keycap = { ...state, get: state.get, store }
        gl.outputColorSpace = THREE.SRGBColorSpace
        gl.toneMappingExposure = config.lighting.exposure
        gl.setClearColor(new THREE.Color(config.atmosphere.voidColor), 1)
      }}
    >
      {/* No runtime quality switching: changing the pixel ratio mid-session re-creates the drawing buffer and
          the post targets, which shows up as a black frame (it used to fire right as the preloader left). */}
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  )
}
