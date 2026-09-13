'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { CAPTURED_ON } from '@/lib/data'

/* ════════════════════════════════════════════════════════════
   Full-resolution capture viewer.

   The point of this component is that a 1182px screenshot never has to be
   squeezed into a phone. "Full size" renders at native pixels inside a
   pannable viewport, so the evidence is legible rather than suggestive.
   ════════════════════════════════════════════════════════════ */

type Slide = { src: string; query: string; note: string }

type Ctx = {
  register: (s: Slide) => void
  open: (src: string) => void
}

const LightboxCtx = createContext<Ctx | null>(null)

export function useLightbox() {
  const ctx = useContext(LightboxCtx)
  if (!ctx) throw new Error('useLightbox must be used inside <LightboxProvider>')
  return ctx
}

/**
 * Slides are collected at render time from every trigger on the page, so
 * prev/next walks the whole evidence set in document order. Duplicate
 * sources (the same capture referenced from two sections) collapse to one
 * slide rather than producing a dead stop in the sequence.
 */
export function LightboxProvider({ children }: { children: ReactNode }) {
  const slidesRef = useRef<Slide[]>([])
  const [index, setIndex] = useState<number | null>(null)
  const [zoom, setZoom] = useState(false)
  const restoreFocus = useRef<HTMLElement | null>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  const register = useCallback((s: Slide) => {
    if (!slidesRef.current.some((x) => x.src === s.src)) slidesRef.current.push(s)
  }, [])

  const open = useCallback((src: string) => {
    const i = slidesRef.current.findIndex((x) => x.src === src)
    if (i < 0) return
    restoreFocus.current = document.activeElement as HTMLElement
    setZoom(false)
    setIndex(i)
  }, [])

  const close = useCallback(() => {
    setIndex(null)
    setZoom(false)
    restoreFocus.current?.focus?.()
  }, [])

  const step = useCallback((d: number) => {
    setIndex((i) => {
      if (i === null) return i
      const n = i + d
      return n < 0 || n >= slidesRef.current.length ? i : n
    })
    setZoom(false)
  }, [])

  // Background scroll lock while the dialog owns the screen.
  useEffect(() => {
    if (index === null) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeBtn.current?.focus()
    return () => {
      document.body.style.overflow = prev
    }
  }, [index])

  useEffect(() => {
    if (index === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowLeft') step(-1)
      else if (e.key === 'ArrowRight') step(1)
      else if (e.key === 'Tab') {
        // Keep focus inside the dialog.
        const f = dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled])')
        if (!f || !f.length) return
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, close, step])

  const ctx = useMemo(() => ({ register, open }), [register, open])
  const slide = index === null ? null : slidesRef.current[index]
  const activeIndex = index ?? 0
  const total = slidesRef.current.length

  return (
    <LightboxCtx.Provider value={ctx}>
      {children}
      <AnimatePresence>
        {slide && (
          <motion.div
            className={`fixed inset-0 z-[200] grid grid-rows-[auto_1fr_auto] ${zoom ? 'lb-zoom' : 'lb-fit'}`}
            style={{ background: 'rgba(7,21,33,0.96)', backdropFilter: 'blur(6px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Google result capture for ${slide.query}`}
            ref={dialogRef}
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-3 sm:px-6">
              <p className="min-w-0">
                <span className="block truncate disp text-[15px] font-bold text-white">
                  {slide.query}
                </span>
                <span className="mt-0.5 block text-[12.5px] text-white/60">{slide.note}</span>
              </p>
              <div className="flex flex-none items-center gap-2">
                <LbBtn onClick={() => step(-1)} disabled={activeIndex === 0} label="Previous capture">
                  &#8592;
                </LbBtn>
                <LbBtn onClick={() => step(1)} disabled={activeIndex === total - 1} label="Next capture">
                  &#8594;
                </LbBtn>
                <LbBtn onClick={() => setZoom((z) => !z)} pressed={zoom} wide>
                  {zoom ? 'Fit' : 'Full size'}
                </LbBtn>
                <LbBtn onClick={close} label="Close" ref={closeBtn}>
                  &#10005;
                </LbBtn>
              </div>
            </div>

            <motion.div
              className="lb-viewport"
              onClick={(e) => {
                if (e.target === e.currentTarget) close()
              }}
              initial={reduce ? undefined : { scale: 0.965, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={slide.src}
                src={slide.src}
                alt={`Google result captured ${CAPTURED_ON} for the query ${slide.query}`}
                onClick={() => setZoom((z) => !z)}
                style={{ cursor: zoom ? 'zoom-out' : 'zoom-in' }}
              />
            </motion.div>

            <p className="border-t border-white/10 px-3 py-3 text-[13px] text-white/60 sm:px-6">
              Live Google result, captured {CAPTURED_ON}. Results vary by time, account and location.
              {total > 1 && <span className="ml-2 text-white/40">{activeIndex + 1} / {total}</span>}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </LightboxCtx.Provider>
  )
}

function LbBtn({
  children,
  onClick,
  disabled,
  label,
  pressed,
  wide,
  ref,
}: {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
  label?: string
  pressed?: boolean
  wide?: boolean
  ref?: React.Ref<HTMLButtonElement>
}) {
  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={pressed}
      whileHover={disabled ? undefined : { scale: 1.06 }}
      whileTap={disabled ? undefined : { scale: 0.94 }}
      className={`grid h-10 place-items-center rounded-[10px] border border-white/25 bg-white/10 disp text-sm font-bold text-white disabled:opacity-35 ${
        wide ? 'px-3' : 'min-w-10 px-2'
      }`}
    >
      {children}
    </motion.button>
  )
}
