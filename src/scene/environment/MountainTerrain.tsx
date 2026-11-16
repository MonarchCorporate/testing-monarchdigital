/**
 * Mountain valley: a heightfield (ridged multifractal + domain warp, see terrainHeight.ts) built in a Web
 * Worker (terrainBuild.ts) on a non-uniform grid, shaded with a slope/altitude rock–snow shader and
 * fragment-level micro relief. Once it has dissolved into the void it is no longer drawn.
 */
import { use, useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { store } from '../../state/store'
import { createRockMaterial } from './rockMaterial'
import { environmentData, toGeometry } from './terrainData'

export function MountainTerrain() {
  const data = use(environmentData())
  const geometry = useMemo(() => toGeometry(data.terrain), [data])
  const mesh = useRef<THREE.Mesh>(null)

  const { material, uniforms } = useMemo(() => createRockMaterial({ key: 'valley' }), [])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material],
  )

  useFrame(() => {
    // the valley dissolves into darkness during the disassembly; fully dissolved, it costs nothing
    const e = store.w.environment
    uniforms.uFade.value = e
    if (mesh.current) mesh.current.visible = e < 0.999
  })

  return <mesh ref={mesh} geometry={geometry} material={material} frustumCulled={false} />
}
