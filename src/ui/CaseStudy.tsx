/**
 * Case study: the reference page below the pinned experience.
 * Plain DOM in the same Swiss system as the interface (tokens.css): an intro with project facts, the idea,
 * the six phases, the design system (type, palette, a row of CSS keycaps), the technology and a closing call.
 * The 3D scene pauses while this part is on screen (App.tsx), so it scrolls like a normal page.
 * Reveals are CSS transitions started once per element by a rAF-throttled scroll check — nothing runs per frame.
 */
import { Fragment, useEffect, useRef, type CSSProperties } from 'react'
import { content } from '../content'
import { restartExperience } from '../scroll/useScrollTimeline'
import styles from './CaseStudy.module.css'

const delay = (i: number) => ({ '--d': `${i * 70}ms` }) as CSSProperties

function SectionHead({ index, label, title }: { index: string; label: string; title: string }) {
  return (
    <div className={styles.head}>
      <p className={`t-micro ${styles.index}`} data-reveal>
        <span>{index}</span>
        <span className={styles.dim}>— {label}</span>
      </p>
      <h3 className={`t-display ${styles.h3}`} data-reveal style={delay(1)}>
        {title}
      </h3>
    </div>
  )
}

export function CaseStudy() {
  const root = useRef<HTMLElement>(null)
  const C = content.caseStudy

  useEffect(() => {
    const el = root.current
    if (!el) return
    // reveal everything whose top has passed 92 % of the window — including elements a fast scroll (or a
    // dragged scrollbar) skipped entirely, so nothing above the reader is ever left hidden
    let pending = Array.from(el.querySelectorAll<HTMLElement>('[data-reveal]'))
    let raf = 0
    const check = () => {
      raf = 0
      const line = window.innerHeight * 0.92
      pending = pending.filter((item) => {
        if (item.getBoundingClientRect().top > line) return true
        item.classList.add(styles.in)
        return false
      })
      if (!pending.length) window.removeEventListener('scroll', onScroll)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    check()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <section className={styles.case} ref={root} aria-label="Case study">
      {/* intro */}
      <div className={styles.intro}>
        <p className="t-label" data-reveal>
          {C.eyebrow}
        </p>
        <h2 className={`t-display ${styles.h2}`} data-reveal style={delay(1)}>
          {C.title.split('\n').map((line, i) => (
            <span className={styles.line} key={i}>
              {line}
            </span>
          ))}
        </h2>
        <div className={styles.introGrid}>
          <p className={styles.lead} data-reveal style={delay(2)}>
            {C.intro}
          </p>
          <dl className={styles.meta} data-reveal style={delay(3)}>
            {C.meta.map(([k, v]) => (
              <Fragment key={k}>
                <dt className="t-micro">{k}</dt>
                <dd>{v}</dd>
              </Fragment>
            ))}
          </dl>
        </div>
      </div>

      {/* the idea */}
      <div className={styles.section}>
        <SectionHead index="01" label={C.idea.label} title={C.idea.title} />
        <div className={styles.columns}>
          {C.idea.paragraphs.map((p, i) => (
            <p className={styles.text} key={i} data-reveal style={delay(i + 2)}>
              {p}
            </p>
          ))}
        </div>
      </div>

      {/* the six phases */}
      <div className={styles.section}>
        <SectionHead index="02" label={C.phases.label} title={C.phases.title} />
        <ol className={styles.phases}>
          {C.phases.items.map(([n, name, text], i) => (
            <li className={styles.phase} key={n} data-reveal style={delay(i)}>
              <span className={`t-micro ${styles.phaseNum}`}>{n}</span>
              <span className={styles.phaseName}>{name}</span>
              <span className={styles.phaseText}>{text}</span>
              <span className={styles.phaseBar} aria-hidden>
                <span style={{ transform: `scaleX(${(i + 1) / C.phases.items.length})` }} />
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* design system */}
      <div className={styles.section}>
        <SectionHead index="03" label={C.system.label} title={C.system.title} />
        <p className={`${styles.text} ${styles.offset}`} data-reveal style={delay(2)}>
          {C.system.text}
        </p>
        <div className={styles.typeGrid}>
          <div className={styles.specimen} data-reveal>
            <span className={styles.specDisplay} aria-hidden>
              Aa
            </span>
            <span className={styles.specName}>{C.system.typeDisplay[0]}</span>
            <span className={`t-micro ${styles.dim}`}>{C.system.typeDisplay[1]}</span>
          </div>
          <div className={styles.specimen} data-reveal style={delay(1)}>
            <span className={styles.specText} aria-hidden>
              Aa
            </span>
            <span className={styles.specName}>{C.system.typeText[0]}</span>
            <span className={`t-micro ${styles.dim}`}>{C.system.typeText[1]}</span>
          </div>
        </div>
        <ul className={styles.palette}>
          {C.system.palette.map(([name, hex], i) => (
            <li key={hex} data-reveal style={delay(i)}>
              <span className={styles.swatch} style={{ background: hex }} />
              <span className={styles.swatchName}>{name}</span>
              <span className={`t-micro ${styles.dim}`}>{hex}</span>
            </li>
          ))}
        </ul>
        <div className={styles.keys} aria-label={C.system.keys} data-reveal>
          {Array.from(C.system.keys).map((ch, i) => (
            <span className={styles.key} key={i} style={delay(i)} aria-hidden>
              <span>{ch}</span>
            </span>
          ))}
        </div>
      </div>

      {/* technology */}
      <div className={styles.section}>
        <SectionHead index="04" label={C.tech.label} title={C.tech.title} />
        <p className={`${styles.text} ${styles.offset}`} data-reveal style={delay(2)}>
          {C.tech.text}
        </p>
        <ul className={styles.stats}>
          {C.tech.stats.map(([n, label], i) => (
            <li key={label} data-reveal style={delay(i)}>
              <span className={styles.statNum}>{n}</span>
              <span className={styles.statLabel}>{label}</span>
            </li>
          ))}
        </ul>
        <dl className={styles.stack} data-reveal>
          {C.tech.stack.map(([k, v]) => (
            <Fragment key={k}>
              <dt className="t-micro">{k}</dt>
              <dd>{v}</dd>
            </Fragment>
          ))}
        </dl>
      </div>

      {/* closing */}
      <div className={styles.closing}>
        <h3 className={`t-display ${styles.h2}`} data-reveal>
          {C.closing.title}
        </h3>
        <p className={styles.closingText} data-reveal style={delay(1)}>
          {C.closing.text}
        </p>
        <div className={styles.actions} data-reveal style={delay(2)}>
          <a className={styles.cta} href={C.closing.ctaHref} target="_blank" rel="noopener noreferrer">
            {C.closing.cta}
          </a>
          <button type="button" className={styles.replay} onClick={restartExperience}>
            {C.closing.replay}
          </button>
        </div>
      </div>

      <footer className={styles.footer}>
        <span className={styles.wordmark}>{content.brand}</span>
        <span className="t-label">{C.footer.credit}</span>
        <span className={`t-label ${styles.dim}`}>{C.footer.year}</span>
      </footer>
    </section>
  )
}
