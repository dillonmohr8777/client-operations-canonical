'use client'

import { motion } from 'motion/react'
import { useEffect } from 'react'
import { useLightbox } from './Lightbox'
import { TiltCard } from './motion-primitives'
import { CAPTURED_ON, type AioShot } from '@/lib/data'

/** Registers a capture with the lightbox sequence without rendering anything. */
export function RegisterShot({ src, query, note }: { src: string; query: string; note: string }) {
  const { register } = useLightbox()
  useEffect(() => {
    register({ src, query, note })
  }, [register, src, query, note])
  return null
}

const BADGE_TONE = {
  cited: 'bg-[rgba(61,220,151,0.16)] text-[var(--good-bright)]',
  aio: 'bg-[rgba(138,180,248,0.2)] text-[#a8c7fa]',
  partial: 'bg-white/12 text-white/72',
} as const

const BADGE_TONE_LIGHT = {
  cited: 'bg-[rgba(18,128,90,0.15)] text-[var(--good)]',
  aio: 'bg-[rgba(66,133,244,0.14)] text-[#1a56c4]',
  partial: 'bg-[rgba(92,106,123,0.16)] text-[var(--slate)]',
} as const

export function Badge({ tone, children, dark }: { tone: keyof typeof BADGE_TONE; children: React.ReactNode; dark?: boolean }) {
  const cls = dark ? BADGE_TONE[tone] : BADGE_TONE_LIGHT[tone]
  return (
    <span
      className={`inline-flex flex-none items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 disp text-[11.5px] font-extrabold uppercase tracking-wide ${cls}`}
    >
      {children}
    </span>
  )
}

/**
 * An AI Overview answer card.
 *
 * The image is the cropped answer block, rendered at 1.0x–1.6x of Google's
 * own pixels so the text is readable. Opening the card swaps to the full
 * search result at native resolution.
 */
export function AioCard({ shot, dark = true }: { shot: AioShot; dark?: boolean }) {
  const { open } = useLightbox()
  return (
    <>
      <RegisterShot src={shot.serp} query={shot.query} note={`${shot.note} Captured ${CAPTURED_ON}.`} />
      <TiltCard max={5} lift={-5}>
        <figure className="pop-box relative m-0 overflow-hidden">
          <span className="sheen" aria-hidden />
          <div className="shot-scroll relative">
            <button
              type="button"
              onClick={() => open(shot.serp)}
              className="block w-full cursor-zoom-in border-0 bg-white p-0 leading-[0]"
              aria-label={`Open the full Google result for ${shot.query}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="shot-img"
                src={shot.aio}
                width={shot.aioWidth}
                height={shot.aioHeight}
                loading={shot.featured ? 'eager' : 'lazy'}
                decoding="async"
                alt={shot.alt}
              />
            </button>
          </div>

          <p
            className={`shot-hint items-center gap-2 border-t border-dashed px-4 py-2.5 text-[12.5px] font-semibold ${
              dark ? 'border-white/15 bg-white text-[var(--dim)]' : 'border-[var(--line)] text-[var(--dim)]'
            }`}
          >
            Swipe to read the full answer <span aria-hidden>→</span>
          </p>

          <figcaption
            className={`flex flex-wrap items-center gap-x-3 gap-y-2 border-t px-4 py-3.5 text-sm sm:px-5 ${
              dark ? 'border-white/12 bg-[var(--navy)] text-white/82' : 'border-[var(--line)] text-[var(--slate)]'
            }`}
          >
            <span className={`disp font-bold ${dark ? 'text-white' : 'text-[var(--navy-deep)]'}`}>
              {shot.query}
            </span>
            <Badge tone={shot.badge.tone} dark={dark}>
              {shot.badge.text}
            </Badge>
            <span>{shot.caption}</span>
          </figcaption>
        </figure>
      </TiltCard>
    </>
  )
}

/** The brand SERP shown full-frame in the rankings section. */
export function SerpFeature({ src, query, note, alt }: { src: string; query: string; note: string; alt: string }) {
  const { open } = useLightbox()
  return (
    <>
      <RegisterShot src={src} query={query} note={note} />
      <TiltCard max={6}>
        <figure className="pop-box relative m-0 overflow-hidden">
          <span className="sheen" aria-hidden />
          <button
            type="button"
            onClick={() => open(src)}
            className="block w-full cursor-zoom-in border-0 bg-white p-0 leading-[0]"
            aria-label={`Open the full Google result for ${query}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="shot-img" src={src} width={1182} height={692} loading="lazy" decoding="async" alt={alt} />
          </button>
          <figcaption className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-[var(--line)] px-4 py-3.5 text-sm text-[var(--slate)] sm:px-5">
            <span className="disp font-bold text-[var(--navy-deep)]">{query}</span>
            <Badge tone="cited">Align at #1</Badge>
            <span>Captured {CAPTURED_ON} — tap to enlarge</span>
          </figcaption>
        </figure>
      </TiltCard>
    </>
  )
}

/** Row-level "open the capture" control used by the #1 list. */
export function CaptureButton({ src, query, note }: { src: string | null; query: string; note: string }) {
  const { open } = useLightbox()

  if (!src) {
    return (
      <span
        className="inline-flex min-h-[38px] items-center justify-center rounded-full border border-dashed border-[var(--line)] px-4 text-[12.5px] font-bold text-[var(--dim)] opacity-70"
        title={note}
      >
        No clean capture
      </span>
    )
  }

  return (
    <>
      <RegisterShot src={src} query={query} note={note} />
      <motion.button
        type="button"
        onClick={() => open(src)}
        whileHover={{ scale: 1.045 }}
        whileTap={{ scale: 0.96 }}
        className="inline-flex min-h-[38px] items-center justify-center gap-2 rounded-full border border-[rgba(23,50,77,0.22)] px-4 disp text-[12.5px] font-bold text-[var(--navy)] transition-colors hover:border-[var(--navy)] hover:bg-[var(--navy)] hover:text-white"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
        </svg>
        Capture
      </motion.button>
    </>
  )
}
