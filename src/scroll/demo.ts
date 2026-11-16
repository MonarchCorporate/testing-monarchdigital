/**
 * `?demo=1`: a scripted take for previews and videos. The scroll is not used: the same timeline is driven
 * from the scene clock (store.time), so every frame is a pure function of time and a capture on a virtual
 * clock is frame-exact. τ = 0 when the hero titles start (the preloader's circle is opening).
 */
import { config } from '../config'
import { smootherstep } from '../utils/math'

export const demo = {
  on: typeof location !== 'undefined' && new URLSearchParams(location.search).get('demo') === '1',
  /** store.time at τ = 0 (−1 until the titles start). */
  start: -1,
  /** Seconds into the take (read by capture scripts as window.__keycapDemo.t). */
  t: 0,
  tl: null as gsap.core.Timeline | null,
}

/** Scroll progress at τ seconds: holds and eased moves between the config.demo.keys stops. */
export function demoProgress(t: number) {
  const K = config.demo.keys
  if (t <= K[0][0]) return K[0][1]
  for (let i = 0; i < K.length - 1; i++) {
    const [t0, p0] = K[i]
    const [t1, p1] = K[i + 1]
    if (t <= t1) return p0 + (p1 - p0) * smootherstep(t0, t1, t)
  }
  return K[K.length - 1][1]
}
