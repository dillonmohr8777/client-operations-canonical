'use client'

import { motion, useSpring } from 'motion/react'
import { useEffect } from 'react'
import { useScrollProgress } from './motion-primitives'

export function Header() {
  const raw = useScrollProgress()
  const scaleX = useSpring(0, { stiffness: 220, damping: 34, restDelta: 0.001 })

  useEffect(() => {
    const unsub = raw.on('change', (v) => scaleX.set(v))
    return unsub
  }, [raw, scaleX])

  return (
    <motion.header
      data-pop
      className="sticky top-0 z-[60] border-b border-[var(--line)] bg-white/90 backdrop-blur-xl backdrop-saturate-150 no-print"
      initial={{ y: -70 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.7, ease: [0.17, 0.4, 0.02, 0.99], delay: 0.1 }}
    >
      <div className="shell flex min-h-[62px] items-center justify-between gap-4 py-2.5">
        <a
          href="https://www.alignhcm.com/"
          aria-label="Align HCM home"
          className="inline-flex min-h-[42px] flex-none items-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/align-hcm-logo.png" alt="Align HCM" width={700} height={311} className="h-[30px] w-auto sm:h-[34px]" />
        </a>
        <div className="flex items-center gap-3 text-right text-[12.5px] font-semibold text-[var(--dim)]">
          <span className="hidden sm:inline">Growth &amp; attribution</span>
          <span className="flex-none whitespace-nowrap rounded-full border border-[rgba(240,90,40,0.4)] bg-[rgba(240,90,40,0.07)] px-3 py-1 text-[12px] font-bold uppercase tracking-wider text-[var(--orange-ink)]">
            July 2026
          </span>
        </div>
      </div>
      <motion.div
        aria-hidden
        className="absolute bottom-[-1px] left-0 h-0.5 w-full origin-left"
        style={{ scaleX, background: 'linear-gradient(90deg, var(--orange), var(--orange-hot))' }}
      />
    </motion.header>
  )
}
