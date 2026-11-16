import { useEffect, useRef, useState } from 'react'
import { Experience } from './scene/Experience'
import { Interface } from './ui/Interface'
import { Cursor } from './ui/Cursor'
import { CaseStudy } from './ui/CaseStudy'
import { useScrollTimeline } from './scroll/useScrollTimeline'
import { store } from './state/store'
import styles from './App.module.css'

export default function App() {
  const stage = useRef<HTMLDivElement>(null)
  // the 3D scene only runs while its stage is on screen (it pauses under the case study)
  const [sceneActive, setSceneActive] = useState(true)
  useScrollTimeline(stage)

  useEffect(() => {
    const move = (e: PointerEvent) => {
      store.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      store.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1
      store.pointer.active = true
    }
    const leave = () => (store.pointer.active = false)
    window.addEventListener('pointermove', move, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    window.addEventListener('blur', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('pointerleave', leave)
      window.removeEventListener('blur', leave)
    }
  }, [])

  useEffect(() => {
    const el = stage.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([entry]) => setSceneActive(entry.isIntersecting), { threshold: 0 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <>
      <main>
        <div className={styles.stage} ref={stage}>
          <Experience active={sceneActive} />
          <Interface />
        </div>
        <CaseStudy />
      </main>
      {/* outside the pinned stage: a fixed element inside a pinned/transformed parent would stay behind */}
      <Cursor />
    </>
  )
}
