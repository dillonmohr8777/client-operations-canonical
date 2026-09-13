'use client'

import { motion } from 'motion/react'
import { Header } from './Header'
import { LightboxProvider } from './Lightbox'
import { AioCard, CaptureButton, SerpFeature } from './Captures'
import { CountUp, GrowBar, Magnetic, Pop, PopChild, PopGroup, PopWords, TiltCard } from './motion-primitives'
import {
  AIO_CITED_COUNT,
  AIO_SHOTS,
  AIO_TRACKED_QUERIES,
  ALIGN_VISIBLE_COUNT,
  CAPTURED_ON,
  CAPTURE_COUNT,
  HERO_STATS,
  KEYWORD_FOOTNOTES,
  LEAD_FLOW,
  LEAD_QUALITY,
  METHOD,
  RANK_ROWS,
  REACH,
  RECOVERY_LEDGER,
  TIERS,
  TOTAL_POSITIONS,
  type Stat,
} from '@/lib/data'

const TONE_CHROME = {
  orange: 'chrome-orange',
  good: '',
  navy: 'chrome-navy',
} as const

function StatTile({ stat }: { stat: Stat }) {
  return (
    <PopChild className="h-full">
      <TiltCard max={6} className="h-full">
        <div className="pop-box relative h-full overflow-hidden p-5">
          <span className="sheen" aria-hidden />
          <strong
            className={`block disp text-[clamp(30px,4.4vw,46px)] font-extrabold leading-none tracking-[-0.04em] ${
              stat.tone ? TONE_CHROME[stat.tone] : ''
            }`}
            style={stat.tone === 'good' ? { color: 'var(--good)' } : undefined}
          >
            <CountUp to={stat.value} prefix={stat.prefix} suffix={stat.suffix} decimals={stat.decimals ?? 0} />
          </strong>
          <b className="mt-2.5 block disp text-sm text-[var(--navy)]">{stat.label}</b>
          <span className="mt-1 block text-[12.5px] text-[var(--dim)]">{stat.note}</span>
        </div>
      </TiltCard>
    </PopChild>
  )
}

function SectionHead({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string
  title: React.ReactNode
  lede?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <Pop variant="rise" className="mb-[clamp(34px,4.6vw,54px)] max-w-[62ch]">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="h2">{title}</h2>
      {lede && <p className="lede">{lede}</p>}
      {children}
    </Pop>
  )
}

export function Report() {
  return (
    <LightboxProvider>
      <a className="skip" href="#main">
        Skip to report
      </a>
      <Header />

      <main id="main">
        {/* ════════════════ HERO ════════════════ */}
        <section className="relative overflow-hidden border-b border-[var(--line-warm)] pb-[clamp(38px,5vw,62px)] pt-[clamp(48px,7vw,88px)] grain"
          style={{ background: 'radial-gradient(120% 90% at 12% 0%, #ffffff 0%, var(--warm) 58%, var(--warm-2) 100%)' }}
        >
          <div className="shell relative">
            <motion.p
              data-pop
              className="eyebrow"
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.17, 0.4, 0.02, 0.99] }}
            >
              President-level summary
            </motion.p>

            <PopWords
              text="Organic is now sourcing deals."
              accentFrom={3}
              className="max-w-[20ch] text-[clamp(37px,7.4vw,82px)] text-[var(--navy-deep)]"
            />

            <motion.p
              data-pop
              className="mt-7 max-w-[56ch] text-[clamp(17px,1.9vw,21px)] text-[var(--slate)]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.17, 0.4, 0.02, 0.99], delay: 0.42 }}
            >
              <strong className="font-bold text-[var(--navy)]">Nine corrected organic and AI-sourced leads in July</strong> — the
              strongest month of 2026 — on top of a 436-position keyword portfolio, 15 number-one rankings and 11 tracked
              Google AI Overview queries.
            </motion.p>

            <motion.div
              data-pop
              className="mt-7 flex flex-wrap gap-3 no-print"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.17, 0.4, 0.02, 0.99], delay: 0.54 }}
            >
              <Magnetic>
                <a
                  href="#leads"
                  className="inline-flex items-center rounded-full bg-gradient-to-br from-[var(--orange)] to-[var(--orange-hot)] px-6 py-3.5 disp text-[15px] font-bold text-white no-underline shadow-[var(--glow-orange)] transition-shadow hover:shadow-[0_18px_40px_-6px_rgba(240,90,40,0.62)]"
                >
                  See the lead recovery
                </a>
              </Magnetic>
              <Magnetic>
                <a
                  href="#ai-overviews"
                  className="inline-flex items-center rounded-full border border-[rgba(23,50,77,0.28)] bg-white/70 px-6 py-3.5 disp text-[15px] font-bold text-[var(--navy)] no-underline transition-colors hover:border-[var(--navy)] hover:bg-white"
                >
                  View AI Overview evidence
                </a>
              </Magnetic>
            </motion.div>

            <PopGroup className="mt-[clamp(38px,5vw,58px)] grid grid-cols-2 gap-3 lg:grid-cols-4" stagger={0.1} delayChildren={0.35}>
              {HERO_STATS.map((s) => (
                <StatTile key={s.label} stat={s} />
              ))}
            </PopGroup>
          </div>
        </section>

        {/* ════════════════ LEADS ════════════════ */}
        <section className="section" id="leads">
          <div className="shell">
            <SectionHead
              eyebrow="Leads & attribution"
              title="Attribution finally caught the work."
              lede="Deterministic source capture went live July 17. Inside the first ten captured form conversions it recovered three leads that native reporting had filed as Direct — including the first identified AI-sourced deal."
            />

            <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center">
              <Pop delay={0.05}>
                <TiltCard max={5}>
                  <div className="pop-box relative overflow-hidden p-[clamp(24px,3.4vw,34px)]">
                    <span className="sheen" aria-hidden />
                    <span className="block text-xs font-bold uppercase tracking-[0.1em] text-[var(--dim)]">{LEAD_FLOW.native.tag}</span>
                    <strong className="chrome-navy mt-3 block disp text-[clamp(58px,9vw,96px)] font-extrabold leading-[0.86] tracking-[-0.05em]">
                      <CountUp to={LEAD_FLOW.native.value} />
                    </strong>
                    <p className="mt-3.5 text-[15px] text-[var(--dim)]">{LEAD_FLOW.native.note}</p>
                  </div>
                </TiltCard>
              </Pop>

              <motion.div
                aria-hidden
                data-pop
                className="grid place-items-center text-2xl font-bold text-[var(--orange)]"
                initial={{ opacity: 0, scale: 0.6 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 240, damping: 18, delay: 0.35 }}
              >
                <span className="rotate-90 lg:rotate-0">→</span>
              </motion.div>

              <Pop delay={0.18}>
                <TiltCard max={5}>
                  <div
                    className="pop-box relative overflow-hidden p-[clamp(24px,3.4vw,34px)]"
                    style={{ borderColor: 'rgba(240,90,40,0.42)', background: 'linear-gradient(170deg,#fff 0%,#fff7f3 100%)' }}
                  >
                    <span className="sheen" aria-hidden />
                    <span className="block text-xs font-bold uppercase tracking-[0.1em] text-[var(--dim)]">{LEAD_FLOW.corrected.tag}</span>
                    <strong className="chrome-orange mt-3 block disp text-[clamp(58px,9vw,96px)] font-extrabold leading-[0.86] tracking-[-0.05em]">
                      <CountUp to={LEAD_FLOW.corrected.value} />
                    </strong>
                    <p className="mt-3.5 text-[15px] text-[var(--dim)]">{LEAD_FLOW.corrected.note}</p>
                  </div>
                </TiltCard>
              </Pop>
            </div>

            <PopGroup className="mt-5 grid gap-3.5 sm:grid-cols-3">
              {RECOVERY_LEDGER.map((l) => (
                <PopChild key={l.title}>
                  <TiltCard max={5} className="h-full">
                    <div className="pop-box relative h-full overflow-hidden border-l-[3px] border-l-[var(--orange)] p-5">
                      <span className="sheen" aria-hidden />
                      <b className="block disp text-[17px] text-[var(--navy)]">{l.title}</b>
                      <p className="mt-1.5 text-[14.5px] text-[var(--dim)]">{l.note}</p>
                    </div>
                  </TiltCard>
                </PopChild>
              ))}
            </PopGroup>

            <Pop variant="rise" className="mt-[clamp(48px,6vw,76px)] max-w-[62ch]">
              <h2 className="h2" style={{ fontSize: 'clamp(25px,3.2vw,36px)' }}>
                And organic leads convert 4.5&times; better.
              </h2>
              <p className="lede">
                The corrected count matters because of what the organic cohort does next. Historical contact-to-deal rates, all
                cohorts to date:
              </p>
            </Pop>

            <PopGroup className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {LEAD_QUALITY.map((s) => (
                <StatTile key={s.label} stat={s} />
              ))}
            </PopGroup>
          </div>
        </section>

        {/* ════════════════ KEYWORDS ════════════════ */}
        <section className="section section-warm relative grain" id="keywords">
          <div className="shell relative">
            <SectionHead
              eyebrow="Keywords that rank"
              title="436 tracked positions, and the shape underneath them."
              lede="Counted straight from the July Semrush export: 436 position rows across 362 distinct queries and 58 ranking URLs. No search-volume estimates."
            />

            <div className="grid gap-[clamp(30px,4vw,52px)] lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-center">
              <Pop>
                <strong className="chrome-orange block disp text-[clamp(88px,15vw,168px)] font-extrabold leading-[0.8] tracking-[-0.06em]">
                  <CountUp to={TOTAL_POSITIONS} duration={1.9} />
                </strong>
                <b className="mt-5 block disp text-[clamp(19px,2.2vw,24px)] text-[var(--navy)]">
                  tracked keyword positions
                </b>
                <p className="mt-3 max-w-[34ch] text-[15px] text-[var(--dim)]">
                  The complete July footprint. Every tier below is a subset of this number.
                </p>
              </Pop>

              <PopGroup className="grid gap-4" as="ul">
                {TIERS.map((t) => (
                  <PopChild key={t.name} as="li" variant="rise">
                    <div className="grid grid-cols-[70px_1fr_58px] items-center gap-3.5">
                      <span className="disp text-[15px] font-bold text-[var(--navy)]">{t.name}</span>
                      <GrowBar
                        pct={(t.count / TOTAL_POSITIONS) * 100}
                        className="block h-3 overflow-hidden rounded-full bg-[#e0d7c9]"
                        fillClassName="rounded-full bg-gradient-to-r from-[var(--orange)] to-[var(--orange-hot)]"
                      />
                      <span className="text-right disp text-[19px] font-extrabold text-[var(--navy-deep)]">
                        <CountUp to={t.count} />
                      </span>
                    </div>
                  </PopChild>
                ))}
              </PopGroup>
            </div>

            <PopGroup className="mt-[clamp(34px,4.5vw,50px)] grid grid-cols-2 gap-3.5 lg:grid-cols-4">
              {KEYWORD_FOOTNOTES.map((s, i) => (
                <PopChild key={i}>
                  <TiltCard max={5} className="h-full">
                    <div className="relative h-full overflow-hidden rounded-[16px] border border-[var(--line-warm)] bg-white/70 p-[18px]">
                      <span className="sheen" aria-hidden />
                      <strong className="chrome-navy block disp text-[clamp(26px,3.2vw,34px)] font-extrabold leading-none">
                        <CountUp to={s.value} />
                      </strong>
                      <span className="mt-2 block text-[13px] text-[var(--dim)]">
                        {s.label} — {s.note}
                      </span>
                    </div>
                  </TiltCard>
                </PopChild>
              ))}
            </PopGroup>
          </div>
        </section>

        {/* ════════════════ #1 PORTFOLIO ════════════════ */}
        <section className="section" id="number-one">
          <div className="shell">
            <SectionHead
              eyebrow="The number-one portfolio"
              title="Fifteen queries at position one."
              lede={`The strongest proof layer in the report. These 15 distinct queries hold position #1 in the July Semrush export, spanning Align's brand, implementation, integration, comparison and migration expertise. Open any row to see the Google result captured on ${CAPTURED_ON}.`}
            />

            <div className="grid gap-[clamp(24px,3.4vw,40px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:items-center">
              <Pop variant="rise">
                <h3 className="text-[clamp(23px,2.6vw,31px)] text-[var(--navy-deep)]">Brand search is fully owned.</h3>
                <p className="mt-3.5 text-[15.5px] text-[var(--dim)]">
                  Both brand queries return the Align HCM homepage at #1 with the sitelink stack and the Google Business Profile
                  knowledge panel alongside it — the whole first screen belongs to Align.
                </p>
              </Pop>
              <Pop delay={0.12}>
                <SerpFeature
                  src="/assets/serp/rank-one-01-align-hcm.jpg"
                  query="align hcm"
                  note="Align HCM ranked first, with the Business Profile knowledge panel alongside it."
                  alt="Google result for “align hcm” showing the Align HCM homepage ranked first with sitelinks, next to the Align HCM Google Business Profile knowledge panel."
                />
              </Pop>
            </div>

            <PopGroup
              as="ol"
              stagger={0.045}
              className="mt-[clamp(38px,4.8vw,58px)] grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 xl:grid-cols-3"
            >
              {RANK_ROWS.map((r) => (
                <PopChild key={r.query} as="li">
                  <TiltCard max={5} className="h-full">
                    <div className="pop-box relative grid h-full grid-cols-[auto_1fr] gap-x-3.5 gap-y-1 overflow-hidden p-[18px]">
                      <span className="sheen" aria-hidden />
                      <span className="row-span-2 grid h-[38px] w-[38px] flex-none place-items-center self-start rounded-[10px] bg-[var(--navy)] disp text-base font-extrabold text-white">
                        1
                      </span>
                      <span className="break-words disp text-[16.5px] font-bold text-[var(--navy-deep)]">
                        {r.query}
                      </span>
                      <span className="text-[13.5px] text-[var(--dim)]">{r.asset}</span>
                      <span className="col-start-2 mt-2.5 justify-self-start">
                        <CaptureButton src={r.serp} query={r.query} note={r.note} />
                      </span>
                    </div>
                  </TiltCard>
                </PopChild>
              ))}
            </PopGroup>

            <Pop variant="rise" className="mt-[clamp(28px,3.6vw,40px)]">
              <p className="rounded-[16px] border border-dashed border-[var(--line)] bg-[var(--warm)] px-5 py-4 text-[14.5px] text-[var(--slate)]">
                <b className="disp text-[var(--navy)]">How to read this: </b>
                The #1 positions are the July Semrush export — that is the stable ranking source. The captures are a separate live
                check run on {CAPTURED_ON}. {ALIGN_VISIBLE_COUNT} of the {RANK_ROWS.length} captures show Align HCM inside the
                visible result area; Google result pages and AI Overviews shift by time, account and location, so the two are
                reported separately rather than merged.
              </p>
            </Pop>
          </div>
        </section>

        {/* ════════════════ AI OVERVIEWS ════════════════ */}
        <section className="section section-dark" id="ai-overviews">
          <div className="shell">
            <Pop variant="rise" className="mb-[clamp(34px,4.6vw,54px)] max-w-[62ch]">
              <p className="eyebrow">Answer-engine visibility</p>
              <h2 className="h2 flex flex-wrap items-center gap-3.5">
                <motion.svg
                  viewBox="0 0 471 471"
                  className="h-[clamp(26px,3.4vw,40px)] w-[clamp(26px,3.4vw,40px)] flex-none text-[#8ab4f8]"
                  aria-hidden
                  animate={{ rotate: [0, 12, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <path
                    fill="currentColor"
                    d="M235.5 471C235.5 438.423 229.22 407.807 216.66 379.155C204.492 350.503 187.811 325.579 166.616 304.384C145.421 283.189 120.498 266.508 91.845 254.34C63.1925 241.78 32.5775 235.5 0 235.5C32.5775 235.5 63.1925 229.416 91.845 217.249C120.498 204.689 145.421 187.811 166.616 166.616C187.811 145.421 204.492 120.497 216.66 91.845C229.22 63.1925 235.5 32.5775 235.5 0C235.5 32.5775 241.584 63.1925 253.751 91.845C266.311 120.497 283.189 145.421 304.384 166.616C325.579 187.811 350.503 204.689 379.155 217.249C407.807 229.416 438.423 235.5 471 235.5C438.423 235.5 407.807 241.78 379.155 254.34C350.503 266.508 325.579 283.189 304.384 304.384C283.189 325.579 266.311 350.503 253.751 379.155C241.584 407.807 235.5 438.423 235.5 471Z"
                  />
                </motion.svg>
                Google AI Overview
              </h2>
              <p className="lede">
                Semrush tracked {AIO_TRACKED_QUERIES} distinct AI Overview queries in July, de-duplicated from 14 export rows.
                Every answer panel below is a real Google capture from {CAPTURED_ON}, cropped to the answer itself so the text is
                actually readable. Tap any panel for the full search result at full size.
              </p>
            </Pop>

            <div className="mb-[clamp(38px,5vw,60px)] grid gap-[clamp(24px,3.2vw,38px)] lg:grid-cols-[minmax(0,0.62fr)_minmax(0,1.38fr)] lg:items-center">
              <Pop>
                <strong className="chrome-light block disp text-[clamp(86px,14vw,152px)] font-extrabold leading-[0.8] tracking-[-0.06em]">
                  <CountUp to={AIO_CITED_COUNT} />
                </strong>
                <b className="mt-4 block disp text-[clamp(18px,2.1vw,23px)] text-white">
                  answers cite Align HCM directly
                </b>
                <p className="mt-3 max-w-[34ch] text-[15px] text-white/70">
                  On two of the eleven, Align HCM is inside the AI Overview itself — named in the answer text or carried as a
                  source pill.
                </p>
              </Pop>
              <Pop delay={0.12}>
                <AioCard shot={AIO_SHOTS[0]} />
              </Pop>
            </div>

            <PopGroup className="grid gap-[clamp(16px,2vw,24px)]" stagger={0.08}>
              {AIO_SHOTS.slice(1).map((shot) => (
                <PopChild key={shot.query}>
                  <AioCard shot={shot} />
                </PopChild>
              ))}
            </PopGroup>

            <Pop variant="rise" className="mt-[clamp(28px,3.6vw,40px)]">
              <p className="rounded-[16px] border border-dashed border-white/16 bg-white/5 px-5 py-4 text-[14.5px] text-white/76">
                <b className="disp text-white">Coverage: </b>
                {AIO_SHOTS.length} captures cover 10 of the {AIO_TRACKED_QUERIES} tracked AI Overview queries — two captures each
                serve a matched query pair. The eleventh, <em>paylocity implementation checklist</em>, returned an empty AI
                Overview container on {CAPTURED_ON}, so there is no honest capture to show. AI Overviews are generated per
                session, so the Semrush export stays the source of truth for tracking and these screens preserve the live
                evidence moment.
              </p>
            </Pop>
          </div>
        </section>

        {/* ════════════════ REACH ════════════════ */}
        <section className="section section-warm relative grain" id="reach">
          <div className="shell relative">
            <SectionHead
              eyebrow="Audience reach"
              title="LinkedIn is pacing to 216K annual impressions."
              lede="Two accounts, one trajectory: Maher's profile and the Align HCM Page. Both figures are 12-month pace projections, not booked outcomes."
            />

            <div className="grid gap-[clamp(28px,4vw,46px)] lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-center">
              <Pop>
                <strong className="chrome-orange block disp text-[clamp(70px,12vw,130px)] font-extrabold leading-[0.82] tracking-[-0.055em]">
                  <CountUp to={REACH.total} suffix="K" duration={1.7} />
                </strong>
                <b className="mt-4 block disp text-[clamp(17px,2vw,22px)] text-[var(--navy)]">
                  combined annualized pace
                </b>
                <p className="mt-2.5 text-[15px] text-[var(--dim)]">
                  <span className="font-bold text-[var(--good)]">+70%</span> versus the prior reporting period.
                </p>
              </Pop>

              <PopGroup className="grid gap-6">
                {REACH.rows.map((r) => (
                  <PopChild key={r.name} variant="rise">
                    <div>
                      <div className="mb-2.5 flex flex-wrap justify-between gap-x-3.5 gap-y-1">
                        <span className="disp text-[15.5px] font-bold text-[var(--navy)]">{r.name}</span>
                        <span className="text-sm text-[var(--dim)]">{r.label}</span>
                      </div>
                      <GrowBar
                        pct={(r.value / REACH.rows[0].value) * 100}
                        className="block h-3 overflow-hidden rounded-full bg-[#e0d7c9]"
                        fillClassName="rounded-full bg-gradient-to-r from-[var(--navy)] to-[#2f5f8c]"
                      />
                      <p className="mt-2 text-[13px] text-[var(--dim)]">{r.note}</p>
                    </div>
                  </PopChild>
                ))}
              </PopGroup>
            </div>
          </div>
        </section>

        {/* ════════════════ METHOD ════════════════ */}
        <section className="section" id="methodology">
          <div className="shell">
            <SectionHead
              eyebrow="Method"
              title="Sources and boundaries."
              lede="Every metric keeps its source and its timing visible, so a live Google screen never gets confused with the stable July export."
            />
            <Pop variant="rise" className="border-t border-[var(--line)]">
              {METHOD.map((m) => (
                <details key={m.title} open={m.open} className="border-b border-[var(--line)]">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 disp text-[clamp(17px,2vw,21px)] font-bold text-[var(--navy-deep)] [&::-webkit-details-marker]:hidden">
                    {m.title}
                    <span
                      aria-hidden
                      className="h-3 w-3 flex-none -translate-y-[3px] rotate-45 border-b-2 border-r-2 border-[var(--orange)] transition-transform"
                    />
                  </summary>
                  <ul className="mb-6 list-disc pl-5 text-[15.5px] text-[var(--slate)]">
                    {m.items.map((it, i) => (
                      <li key={i} className="mt-2.5 [&_b]:text-[var(--navy)]" dangerouslySetInnerHTML={{ __html: it }} />
                    ))}
                  </ul>
                </details>
              ))}
            </Pop>
          </div>
        </section>
      </main>

      <div className="border-t border-white/16 bg-[var(--navy-deep)] py-6 text-white/74">
        <div className="shell grid gap-2 lg:grid-cols-[auto_1fr] lg:items-baseline lg:gap-5">
          <b className="whitespace-nowrap disp text-white">Verified July evidence</b>
          <span className="text-sm">
            Semrush July export &middot; {CAPTURE_COUNT} live Google captures from {CAPTURED_ON} &middot; HubSpot attribution
            &middot; LinkedIn analytics.
          </span>
        </div>
      </div>

      <footer className="bg-[var(--navy-ink)] py-6 text-[13px] text-white/60">
        <div className="shell grid gap-1.5 sm:grid-cols-[1fr_auto]">
          <span>Align HCM &mdash; July 2026 Growth &amp; Attribution Report</span>
          <span>Public-safe aggregate view. No PII.</span>
        </div>
      </footer>
    </LightboxProvider>
  )
}
