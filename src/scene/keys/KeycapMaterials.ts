/**
 * Keycap material: physically-based, slightly matte off-white ABS/PBT plastic,
 * with legends printed from the glyph atlas through the model's own cap UVs.
 *
 * - The glyph is placed only where aCap = 1 (dished top surface) — never on the walls.
 * - Glyph local coords come from the cap UV (planar, isotropic → no stretching).
 * - Ink is dark grey and a touch glossier than the plastic, like pad-printed legends.
 */
import * as THREE from 'three'
import { ATLAS_GRID } from '../../choreography/glyphs'

export interface KeycapMaterialOptions {
  color?: THREE.ColorRepresentation
  ink?: THREE.ColorRepresentation
  /** Fraction of the cap width covered by a glyph cell. */
  glyphScale?: number
  wireColor?: THREE.ColorRepresentation
  wireIntensity?: number
  /** Wire lattice cells per model unit. */
  wireDensity?: number
}

/** Cap UV width measured on the source model (u range 0.382…0.617). */
const CAP_UV_WIDTH = 0.235

export function createKeycapMaterial(atlas: THREE.Texture, opts: KeycapMaterialOptions = {}) {
  const material = new THREE.MeshPhysicalMaterial({
    color: opts.color ?? '#e6e4de',
    roughness: 0.33,
    metalness: 0,
    specularIntensity: 0.8,
    clearcoat: 0.35,
    clearcoatRoughness: 0.22,
    envMapIntensity: 1.15,
  })

  const uniforms = {
    uAtlas: { value: atlas },
    uInk: { value: new THREE.Color(opts.ink ?? '#2a2d2f') },
    uGlyphSpan: { value: CAP_UV_WIDTH * (opts.glyphScale ?? 0.64) },
    uInkRoughness: { value: 0.26 },
    uXrayBody: { value: new THREE.Color('#0a1430') },
    uXrayGlow: { value: new THREE.Color('#0b2a7a').multiplyScalar(0.25) },
    uXrayWire: { value: new THREE.Color(opts.wireColor ?? '#3d7bff').multiplyScalar(opts.wireIntensity ?? 1.4) },
    uXrayDensity: { value: opts.wireDensity ?? 6 },
  }
  const G = ATLAS_GRID.toFixed(1)

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        /* glsl */ `#include <common>
attribute float aGlyph;
attribute float aCap;
attribute vec2 aKeyUv;
attribute float aXray;
varying float vXray;
varying vec3 vLocalPos;
varying vec3 vLocalNrm;
varying float vGlyph;
varying float vCap;
varying vec2 vKeyUv;`,
      )
      .replace(
        '#include <begin_vertex>',
        /* glsl */ `#include <begin_vertex>
vGlyph = aGlyph;
vCap = aCap;
vKeyUv = aKeyUv;
vXray = aXray;
vLocalPos = position;
vLocalNrm = normal;`,
      )

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        /* glsl */ `#include <common>
uniform sampler2D uAtlas;
uniform vec3 uInk;
uniform float uGlyphSpan;
uniform float uInkRoughness;
uniform vec3 uXrayBody;
uniform vec3 uXrayGlow;
uniform vec3 uXrayWire;
uniform float uXrayDensity;
varying float vXray;
varying vec3 vLocalPos;
varying vec3 vLocalNrm;
varying float vGlyph;
varying float vCap;
varying vec2 vKeyUv;

// blue wireframe lattice in the key's own space (triplanar: on each face only the two in-plane axes
// draw lines), anti-aliased with screen derivatives — the key's "inner structure" under x-ray
float keycapWire() {
  vec3 p = vLocalPos * uXrayDensity;
  vec3 g = abs( fract( p - 0.5 ) - 0.5 ) / max( fwidth( p ), vec3( 1e-4 ) );
  vec3 l = 1.0 - clamp( g * 0.9, 0.0, 1.0 ); // ~1 px lines per axis
  vec3 n = abs( normalize( vLocalNrm ) );
  vec3 w = smoothstep( 0.35, 0.9, n );
  float onX = max( l.y, l.z ) * w.x; // face facing ±x shows y/z lines
  float onY = max( l.x, l.z ) * w.y;
  float onZ = max( l.x, l.y ) * w.z;
  // silhouette-ish edges where the faces bend
  float edge = 1.0 - smoothstep( 0.0, 0.25, abs( max( max( n.x, n.y ), n.z ) - 0.72 ) );
  return clamp( max( max( onX, onY ), max( onZ, edge * 0.6 ) ), 0.0, 1.0 );
}

float keycapInk() {
  // cap UV → glyph cell coords (x right, y up on the printed face)
  vec2 g = vec2( 0.5 + ( vKeyUv.x - 0.5 ) / uGlyphSpan, 0.5 - ( vKeyUv.y - 0.778 ) / uGlyphSpan );
  vec2 inside2 = step( vec2( 0.0 ), g ) * step( g, vec2( 1.0 ) );
  float inside = inside2.x * inside2.y;
  vec2 gc = clamp( g, 0.002, 0.998 );
  float id = floor( vGlyph + 0.5 );
  float col = mod( id, ${G} );
  float row = floor( id / ${G} );
  vec2 auv = vec2( ( col + gc.x ) / ${G}, ( ${G} - row - 1.0 + gc.y ) / ${G} );
  float cov = texture2D( uAtlas, auv ).r;
  return cov * inside * smoothstep( 0.55, 0.95, vCap );
}`,
      )
      .replace(
        '#include <map_fragment>',
        /* glsl */ `#include <map_fragment>
float keyInk = keycapInk();
diffuseColor.rgb = mix( diffuseColor.rgb, uInk, keyInk );
// x-ray (third section, under the cursor): the plastic turns to dark glass so the blue wireframe
// drawn on top reads as the key's inner structure
diffuseColor.rgb = mix( diffuseColor.rgb, uXrayBody, vXray * 0.9 );`,
      )
      .replace(
        '#include <roughnessmap_fragment>',
        /* glsl */ `#include <roughnessmap_fragment>
roughnessFactor = mix( roughnessFactor, uInkRoughness, keyInk );`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        /* glsl */ `#include <emissivemap_fragment>
if ( vXray > 0.002 ) totalEmissiveRadiance += ( uXrayGlow + uXrayWire * keycapWire() ) * vXray;`,
      )
      .replace(
        '#include <dithering_fragment>',
        /* glsl */ `// never let a NaN/Inf pixel reach bloom (one bad pixel would flash the whole frame)
if ( any( isnan( gl_FragColor.rgb ) ) || any( isinf( gl_FragColor.rgb ) ) ) gl_FragColor.rgb = vec3( 0.0 );
#include <dithering_fragment>`,
      )
  }
  material.customProgramCacheKey = () => 'keycap-keycap-v3'

  return { material, uniforms }
}
