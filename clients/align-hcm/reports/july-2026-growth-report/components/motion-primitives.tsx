'use client'

import { animate, motion, useMotionValue, useReducedMotion, useSpring, type MotionValue } from 'motion/react'
import { Fragment, useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react'

/* ════════════════════════════════════════════════════════════
   The Immohrtal motion vocabulary, expressed in Framer Motion.

   Immohrtal's "pop" is a card arriving as an object: it rises, un-tilts out
   of a 9deg rotateX, and scales up from 0.94 over ~0.85s on a very slow-out
   easing. Everything here builds on that one idea, and every primitive
   respects prefers-reduced-motion.
   ════════════════════════════════════════════════════════════ */

const EASE_HOVER = [0.17, 0.4, 0.02, 0.99] as const

/**
 * Grid and flex items default to `min-width: auto`, which means their minimum
 * size is the min-content of their subtree. One 730px screenshot inside a
 * 1fr track is then enough to push the whole page wider than the viewport.
 * Every wrapper here opts out.
 */
const SAFE: CSSProperties = { minWidth: 0 }

/**
 * Scroll-position driven in-view latch.
 *
 * Deliberately not IntersectionObserver (and so not motion's own
 * `whileInView`): IO callbacks are async and coalesced, so a fast flick, a
 * jump-link, or a programmatic scroll can outrun them and leave a panel
 * stranded at opacity 0. In a report the content *is* the deliverable, so the
 * trigger re-checks live geometry on every frame it matters and latches once
 * true.
 */
function useLatchedInView(ref: RefObject<HTMLElement | null>, at = 0.94): boolean {
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    if (seen) return
    let queued = false
    const check = () => {
      queued = false
      const el = ref.current
      if (!el) return
      if (el.getBoundingClientRect().top < window.innerHeight * at) setSeen(true)
    }
    const onScroll = () => {
      if (!queued) {
        queued = true
        requestAnimationFrame(check)
      }
    }
    check()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ref, seen, at])

  return seen
}

/** Immohrtal's .reveal-pop, as a variant pair. */
const popVariants = {
  hidden: { opacity: 0, y: 48, rotateX: 9, scale: 0.94 },
  shown: { opacity: 1, y: 0, rotateX: 0, scale: 1 },
}

/** The gentler .reveal, for prose that shouldn't tilt. */
const riseVariants = {
  hidden: { opacity: 0, y: 28 },
  shown: { opacity: 1, y: 0 },
}

type PopProps = {
  children: ReactNode
  /** 'pop' tilts in 3D like an object; 'rise' just lifts. */
  variant?: 'pop' | 'rise'
  delay?: number
  className?: string
  style?: CSSProperties
}

export function Pop({ children, variant = 'pop', delay = 0, className, style }: PopProps) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const seen = useLatchedInView(ref)

  return (
    <motion.div
      ref={ref}
      data-pop
      className={className}
      style={{ transformPerspective: 900, ...SAFE, ...style }}
      initial={reduce ? false : 'hidden'}
      animate={reduce || seen ? 'shown' : 'hidden'}
      variants={variant === 'pop' ? popVariants : riseVariants}
      transition={{ duration: 0.85, ease: EASE_HOVER, delay }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Stagger container. Children rendered as <PopChild> arrive in sequence,
 * which is what makes a grid of tiles land rather than simply appear.
 * Immohrtal did this with .reveal-late / .reveal-later delay classes.
 */
export function PopGroup({
  children,
  className,
  stagger = 0.09,
  delayChildren = 0,
  as = 'div',
}: {
  children: ReactNode
  className?: string
  stagger?: number
  delayChildren?: number
  as?: 'div' | 'ul' | 'ol'
}) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const seen = useLatchedInView(ref)
  const Comp = motion[as]

  return (
    <Comp
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={className}
      style={SAFE}
      initial={reduce ? false : 'hidden'}
      animate={reduce || seen ? 'shown' : 'hidden'}
      variants={{
        hidden: {},
        shown: { transition: { staggerChildren: stagger, delayChildren } },
      }}
    >
      {children}
    </Comp>
  )
}

export function PopChild({
  children,
  className,
  variant = 'pop',
  as = 'div',
  style,
}: {
  children: ReactNode
  className?: string
  variant?: 'pop' | 'rise'
  as?: 'div' | 'li' | 'article' | 'figure'
  style?: CSSProperties
}) {
  const Comp = motion[as]
  return (
    <Comp
      data-pop
      className={className}
      style={{ transformPerspective: 900, ...SAFE, ...style }}
      variants={variant === 'pop' ? popVariants : riseVariants}
      transition={{ duration: 0.72, ease: EASE_HOVER }}
    >
      {children}
    </Comp>
  )
}

/**
 * Pointer-tracked 3D tilt. Ported from Immohrtal's TiltBox, spring-damped so
 * the card settles instead of snapping, and it publishes pointer position as
 * --mx/--my for the .sheen highlight.
 *
 * Fine pointers only: on touch, a tilt that never un-tilts just looks broken.
 */
export function TiltCard({
  children,
  max = 7,
  className = '',
  lift = -6,
}: {
  children: ReactNode
  max?: number
  className?: string
  lift?: number
}) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)

  const rect = useRef<DOMRect | null>(null)
  const rx = useSpring(0, { stiffness: 260, damping: 26 })
  const ry = useSpring(0, { stiffness: 260, damping: 26 })
  const y = useSpring(0, { stiffness: 260, damping: 26 })
  const s = useSpring(1, { stiffness: 260, damping: 26 })

  if (reduce) {
    return (
      <div className={className} style={SAFE}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      ref={ref}
      className={`tilt-target ${className}`}
      style={{ rotateX: rx, rotateY: ry, y, scale: s, transformPerspective: 900, ...SAFE }}
      onPointerEnter={(e) => {
        if (e.pointerType !== 'mouse') return
        rect.current = ref.current?.getBoundingClientRect() ?? null
      }}
      onPointerMove={(e) => {
        const r = rect.current
        if (!r) return
        const px = (e.clientX - r.left) / r.width - 0.5
        const py = (e.clientY - r.top) / r.height - 0.5
        ry.set(px * max)
        rx.set(py * -max)
        y.set(lift)
        s.set(1.015)
        ref.current?.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`)
        ref.current?.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`)
      }}
      onPointerLeave={() => {
        rect.current = null
        rx.set(0)
        ry.set(0)
        y.set(0)
        s.set(1)
      }}
    >
      {children}
    </motion.div>
  )
}

/** Buttons that lean toward the cursor. Small effect, big "alive" payoff. */
export function Magnetic({ children, className, strength = 5 }: { children: ReactNode; className?: string; strength?: number }) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const x = useSpring(0, { stiffness: 300, damping: 22 })
  const y = useSpring(0, { stiffness: 300, damping: 22 })

  if (reduce) return <span className={className}>{children}</span>

  return (
    <motion.span
      ref={ref}
      className={className}
      style={{ x, y, display: 'inline-flex' }}
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse') return
        const r = ref.current?.getBoundingClientRect()
        if (!r) return
        x.set(((e.clientX - r.left) / r.width - 0.5) * strength * 2)
        y.set(((e.clientY - r.top) / r.height - 0.5) * strength * 2)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.span>
  )
}

/**
 * Count-up numerals. Reduced motion lands on the final value immediately —
 * the number is data, so it is never allowed to be wrong or absent, only
 * un-animated. The server-rendered value is the final one for the same
 * reason.
 */
export function CountUp({
  to,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1.5,
  className,
}: {
  to: number
  prefix?: string
  suffix?: string
  decimals?: number
  duration?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const seen = useLatchedInView(ref, 0.88)
  const [display, setDisplay] = useState(() => to.toFixed(decimals))

  useEffect(() => {
    if (reduce || !seen) return
    const controls = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v.toFixed(decimals)),
      onComplete: () => setDisplay(to.toFixed(decimals)),
    })
    return () => controls.stop()
  }, [seen, to, decimals, duration, reduce])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  )
}

/** Scroll-linked progress rail in the header. */
export function useScrollProgress(): MotionValue<number> {
  const p = useMotionValue(0)
  useEffect(() => {
    let queued = false
    const read = () => {
      queued = false
      const max = document.documentElement.scrollHeight - window.innerHeight
      p.set(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0)
    }
    const onScroll = () => {
      if (!queued) {
        queued = true
        requestAnimationFrame(read)
      }
    }
    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [p])
  return p
}

/** A bar that grows to `pct` when scrolled into view. */
export function GrowBar({ pct, className, fillClassName }: { pct: number; className?: string; fillClassName?: string }) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const seen = useLatchedInView(ref, 0.9)

  return (
    <span ref={ref} className={className}>
      <motion.span
        className={fillClassName}
        style={{ display: 'block', height: '100%', width: `${pct}%`, transformOrigin: 'left' }}
        initial={reduce ? false : { scaleX: 0 }}
        animate={{ scaleX: reduce || seen ? 1 : 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      />
    </span>
  )
}

/** Headline that lands word by word. */
export function PopWords({ text, className, accentFrom }: { text: string; className?: string; accentFrom?: number }) {
  const reduce = useReducedMotion()
  const words = text.split(' ')
  return (
    <motion.h1
      className={className}
      style={SAFE}
      initial={reduce ? false : 'hidden'}
      animate="shown"
      variants={{ hidden: {}, shown: { transition: { staggerChildren: 0.055, delayChildren: 0.06 } } }}
    >
      {words.map((w, i) => (
        // The gap between words is a real text node *between* the masks, not
        // whitespace inside one: an inline-block with overflow:hidden collapses
        // its own trailing space, which silently welds the headline into a
        // single word — and takes copy-paste and screen readers with it.
        // The padding keeps descenders from being clipped by the mask.
        <Fragment key={i}>
          <span
            style={{
              display: 'inline-block',
              overflow: 'hidden',
              verticalAlign: 'bottom',
              paddingBottom: '0.12em',
            }}
          >
            <motion.span
              data-pop
              style={{ display: 'inline-block', color: accentFrom !== undefined && i >= accentFrom ? 'var(--orange)' : undefined }}
              variants={{ hidden: { y: '108%', opacity: 0 }, shown: { y: 0, opacity: 1 } }}
              transition={{ duration: 0.78, ease: EASE_HOVER }}
            >
              {w}
            </motion.span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </motion.h1>
  )
}

export { EASE_HOVER }
