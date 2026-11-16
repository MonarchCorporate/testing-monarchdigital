/**
 * Foreground massifs, procedural (foregroundHeight.ts): one snowy peak with its erosion map, built in a
 * Web Worker at load (terrainBuild.ts). One geometry is placed twice — rotated, mirrored and scaled
 * differently — so the copies read as two different mountains. Both use the shared rock material,
 * palette, fog and dissolve; once dissolved they are no longer drawn.
 */
import { use, useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { config } from '../../config'
import { store } from '../../state/store'
import { createRockMaterial } from './rockMaterial'
import { FOREGROUND } from './foregroundHeight'
import { environmentData, toGeometry } from './terrainData'

export function ForegroundMountains() {
  const gl = useThree((s) => s.gl)
  const data = use(environmentData())
  const geometry = useMemo(() => toGeometry(data.foreground, 'aRockUv'), [data])
  const group = useRef<THREE.Group>(null)

  const { material, uniforms, detail } = useMemo(() => {
    const S = FOREGROUND.detailSize
    const detail = new THREE.DataTexture(data.detail, S, S, THREE.RedFormat, THREE.UnsignedByteType)
    detail.colorSpace = THREE.NoColorSpace
    detail.flipY = false
    detail.wrapS = detail.wrapT = THREE.ClampToEdgeWrapping
    detail.magFilter = THREE.LinearFilter
    detail.minFilter = THREE.LinearMipmapLinearFilter
    detail.generateMipmaps = true
    detail.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy())
    detail.needsUpdate = true
    return { detail, ...createRockMaterial({ key: 'foreground', detailMap: detail, detailStrength: 0.85, relief: 1.2, reliefScale: 0.14, snowLine: [-70, 10] }) }
  }, [data, gl])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
      detail.dispose()
    },
    [geometry, material, detail],
  )

  useFrame(() => {
    const e = store.w.environment
    uniforms.uFade.value = e
    if (group.current) group.current.visible = e < 0.999
  })

  return (
    <group ref={group}>
      {config.terrain.foreground.map((f, i) => (
        <mesh
          key={i}
          geometry={geometry}
          material={material}
          position={f.position}
          rotation={[0, f.rotationY, 0]}
          scale={f.scale}
          frustumCulled={false}
        />
      ))}
    </group>
  )
}
