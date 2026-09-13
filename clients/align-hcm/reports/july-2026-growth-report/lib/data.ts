/**
 * Every number and every capture in the report, in one place.
 *
 * `serp` paths are the full search result (used by the lightbox at native
 * 1182px). `aio` paths are crops of the AI Overview answer block only, so the
 * answer text is the content instead of 60% dead whitespace.
 *
 * Nothing here is upscaled from a smaller original. See README.md for the
 * per-capture audit of what each screenshot actually shows.
 */

export const CAPTURED_ON = 'July 31, 2026'

/* ── headline ────────────────────────────────────────────────── */

export type Stat = {
  value: number
  /** rendered as `prefix + animatedNumber + suffix` */
  prefix?: string
  suffix?: string
  decimals?: number
  label: string
  note: string
  tone?: 'orange' | 'good' | 'navy'
}

export const HERO_STATS: Stat[] = [
  { value: 9, label: 'corrected leads', note: '6 organic + 3 AI referrals', tone: 'orange' },
  { value: 51.2, prefix: '+', suffix: '%', decimals: 1, label: 'traffic, year to date', note: 'Semrush, July export', tone: 'good' },
  { value: 15, label: 'number-one queries', note: 'of 436 tracked positions', tone: 'navy' },
  { value: 11, label: 'AI Overview queries', note: '10 captured on July 31', tone: 'navy' },
]

/* ── leads and attribution ───────────────────────────────────── */

export const LEAD_FLOW = {
  native: { value: 6, tag: 'Native July reporting', note: '4 organic search + 2 AI referrals, as HubSpot reported them before correction.' },
  corrected: { value: 9, tag: 'Corrected July total', note: '6 organic search + 3 AI referrals once Direct-misfiled sources were resolved.' },
}

export const RECOVERY_LEDGER = [
  { title: '2 organic recovered', note: 'Google-origin leads that native reporting had filed as Direct.' },
  { title: '1 AI referral recovered', note: 'A ChatGPT-origin lead, also misfiled as Direct.' },
  { title: 'First AI-sourced deal', note: 'That corrected ChatGPT record became the first identified AI-sourced deal.' },
]

export const LEAD_QUALITY: Stat[] = [
  { value: 25, suffix: '%', label: 'Organic contact→deal', note: '5 deals from 20 organic contacts', tone: 'navy' },
  { value: 5.6, suffix: '%', decimals: 1, label: 'Direct contact→deal', note: '7 deals from 124 Direct contacts', tone: 'navy' },
  { value: 4.5, suffix: '×', decimals: 1, label: 'Organic advantage', note: 'versus the Direct cohort', tone: 'orange' },
  { value: 54, prefix: '$', suffix: 'K', label: 'Verified organic win', note: 'the only verified currency figure here', tone: 'orange' },
]

/* ── keyword portfolio ───────────────────────────────────────── */

export const TIERS = [
  { name: 'Top 3', count: 24 },
  { name: 'Top 5', count: 39 },
  { name: 'Top 10', count: 76 },
  { name: 'Top 25', count: 209 },
  { name: 'Top 100', count: 436 },
]

export const TOTAL_POSITIONS = 436

export const KEYWORD_FOOTNOTES: Stat[] = [
  { value: 211, label: 'blog positions', note: 'across 180 distinct queries', tone: 'navy' },
  { value: 44, label: 'blog positions', note: 'on page one', tone: 'navy' },
  { value: 17, label: 'blog positions', note: 'in the top 3', tone: 'navy' },
  { value: 25, label: 'Authority Score', note: 'unchanged from June', tone: 'navy' },
]

/* ── the #1 portfolio ────────────────────────────────────────── */

export type RankRow = {
  query: string
  asset: string
  /** full-SERP capture, or null when July 31 produced nothing usable */
  serp: string | null
  /** what the capture actually shows, shown in the lightbox caption */
  note: string
  /** true when Align HCM is visible in the captured result area */
  alignVisible?: boolean
}

export const RANK_ROWS: RankRow[] = [
  {
    query: 'align hcm',
    asset: 'Align HCM homepage',
    serp: '/assets/serp/rank-one-01-align-hcm.jpg',
    note: 'Align HCM ranked first, with the Business Profile knowledge panel alongside it.',
    alignVisible: true,
  },
  {
    query: 'align human capital management',
    asset: 'Align HCM homepage',
    serp: '/assets/serp/rank-one-02-align-human-capital-management.jpg',
    note: 'Align HCM ranked first, with the Business Profile knowledge panel alongside it.',
    alignVisible: true,
  },
  {
    query: 'ukg pro implementation partner',
    asset: 'UKG partner page',
    serp: '/assets/serp/rank-one-13-ukg-pro-implementation-partner.jpg',
    note: 'Align HCM named inside the AI Overview answer, and ranking in the organic results.',
    alignVisible: true,
  },
  {
    query: 'paychex vs paylocity',
    asset: 'Paylocity comparison guide',
    serp: '/assets/serp/google-ai-overview-2.jpg',
    note: 'Align HCM appears as a source pill inside the AI Overview.',
    alignVisible: true,
  },
  {
    query: 'hr data integration services',
    asset: 'System Integration service page',
    serp: '/assets/serp/google-ai-overview-1.jpg',
    note: 'AI Overview present; Align HCM holds the first organic result beneath it.',
    alignVisible: true,
  },
  {
    query: 'data conversion strategy',
    asset: 'Data conversion checklist',
    serp: '/assets/serp/google-ai-overview-3.jpg',
    note: 'AI Overview present; Align HCM holds the first organic result beneath it.',
    alignVisible: true,
  },
  {
    query: 'ukg pro vs ukg ready',
    asset: "Strategic Buyer's Guide to UKG",
    serp: '/assets/serp/rank-one-14-ukg-pro-vs-ukg-ready.jpg',
    note: "AI Overview rendered. UKG's own page held the visible first result at capture time.",
  },
  {
    query: 'ukg ready vs ukg pro',
    asset: "Strategic Buyer's Guide to UKG",
    serp: '/assets/serp/rank-one-15-ukg-ready-vs-ukg-pro.jpg',
    note: "AI Overview rendered. UKG's own page held the visible first result at capture time.",
  },
  {
    query: 'implementing workday',
    asset: 'Workday implementation guide',
    serp: '/assets/serp/rank-one-09-implementing-workday.jpg',
    note: "AI Overview rendered. Workday's own page held the visible first result at capture time.",
  },
  {
    query: 'data conversion migration',
    asset: 'Data conversion checklist',
    serp: '/assets/serp/rank-one-05-data-conversion-migration.jpg',
    note: 'AI Overview rendered. A third-party page held the visible first result at capture time.',
  },
  {
    query: 'paylocity payroll cost',
    asset: 'Paylocity comparison guide',
    serp: '/assets/serp/rank-one-12-paylocity-payroll-cost.jpg',
    note: "AI Overview rendered. Paylocity's own pricing page held the visible first result at capture time.",
  },
  {
    query: 'common challenges in hcm implementation',
    asset: 'HCM implementation challenges blog',
    serp: '/assets/serp/rank-one-03-common-challenges-in-hcm-implementation.jpg',
    note: 'AI Overview rendered. A competitor page held the visible first result at capture time.',
  },
  {
    query: 'hcm services m&a',
    asset: 'M&A assistance services page',
    serp: '/assets/serp/rank-one-07-hcm-services-m-a.jpg',
    note: 'Capture caught the AI Overview mid-render, so the panel reads faded.',
  },
  {
    query: 'common challenges with hcm implementation',
    asset: 'HCM implementation challenges blog',
    serp: null,
    note: 'Capture caught Google mid-load, so there is no usable result screen.',
  },
  {
    query: 'paylocity implementation checklist',
    asset: "Strategic Buyer's Guide to Paylocity",
    serp: null,
    note: 'The AI Overview container rendered empty, so there is no usable result screen.',
  },
]

export const ALIGN_VISIBLE_COUNT = RANK_ROWS.filter((r) => r.alignVisible).length
export const CAPTURE_COUNT = RANK_ROWS.filter((r) => r.serp).length

/* ── AI Overview evidence ────────────────────────────────────── */

export type AioShot = {
  query: string
  /** cropped answer block — this is what renders on the page */
  aio: string
  aioWidth: number
  aioHeight: number
  /** full result screen — this is what the lightbox opens */
  serp: string
  alt: string
  badge: { text: string; tone: 'cited' | 'aio' | 'partial' }
  caption: string
  note: string
  /** hero card gets eager loading and sits above the grid */
  featured?: boolean
}

export const AIO_SHOTS: AioShot[] = [
  {
    query: 'ukg pro implementation partner',
    aio: '/assets/aio/rank-one-13-ukg-pro-implementation-partner.jpg',
    aioWidth: 1168,
    aioHeight: 200,
    serp: '/assets/serp/rank-one-13-ukg-pro-implementation-partner.jpg',
    alt: 'Google AI Overview for “ukg pro implementation partner” reading: top implementation partners include HRchitect, Ascend, and Align HCM.',
    badge: { text: 'Named in the answer', tone: 'cited' },
    caption: '“…top implementation partners include HRchitect, Ascend, and Align HCM.”',
    note: 'Align HCM named in the AI Overview answer text.',
    featured: true,
  },
  {
    query: 'paychex vs paylocity',
    aio: '/assets/aio/google-ai-overview-2.jpg',
    aioWidth: 1168,
    aioHeight: 280,
    serp: '/assets/serp/google-ai-overview-2.jpg',
    alt: 'Google AI Overview for “paychex vs paylocity” comparing the two platforms, with an Align HCM source pill attached to the answer.',
    badge: { text: 'Align HCM source pill', tone: 'cited' },
    caption: 'Align is one of the sources Google built the comparison from.',
    note: 'Align HCM carried as a source pill inside the AI Overview.',
  },
  {
    query: 'hr data integration services',
    aio: '/assets/aio/google-ai-overview-1.jpg',
    aioWidth: 1168,
    aioHeight: 280,
    serp: '/assets/serp/google-ai-overview-1.jpg',
    alt: 'Google AI Overview for “hr data integration services” describing API connections and custom data mapping.',
    badge: { text: 'AI Overview', tone: 'aio' },
    caption: 'Align HCM holds the first organic result under this answer.',
    note: 'AI Overview present; Align HCM holds the first organic result beneath it.',
  },
  {
    query: 'data conversion strategy',
    aio: '/assets/aio/google-ai-overview-3.jpg',
    aioWidth: 1168,
    aioHeight: 208,
    serp: '/assets/serp/google-ai-overview-3.jpg',
    alt: 'Google AI Overview for “data conversion strategy” listing data profiling, field mapping and validation testing as key phases.',
    badge: { text: 'AI Overview', tone: 'aio' },
    caption: 'Align HCM holds the first organic result under this answer.',
    note: 'AI Overview present; Align HCM holds the first organic result beneath it.',
  },
  {
    query: 'ukg pro vs ukg ready',
    aio: '/assets/aio/rank-one-14-ukg-pro-vs-ukg-ready.jpg',
    aioWidth: 1168,
    aioHeight: 208,
    serp: '/assets/serp/rank-one-14-ukg-pro-vs-ukg-ready.jpg',
    alt: 'Google AI Overview for “ukg pro vs ukg ready” explaining that UKG Ready suits small-to-midsize businesses and UKG Pro targets large enterprises.',
    badge: { text: 'AI Overview', tone: 'aio' },
    caption: 'Covers both tracked variants of this query.',
    note: 'AI Overview rendered. This capture covers both tracked query variants.',
  },
  {
    query: 'common challenges in hcm implementation',
    aio: '/assets/aio/rank-one-03-common-challenges-in-hcm-implementation.jpg',
    aioWidth: 1168,
    aioHeight: 208,
    serp: '/assets/serp/rank-one-03-common-challenges-in-hcm-implementation.jpg',
    alt: 'Google AI Overview for “common challenges in hcm implementation” citing data migration errors, a flawed first payroll and low employee adoption.',
    badge: { text: 'AI Overview', tone: 'aio' },
    caption: 'Covers both tracked variants of this query.',
    note: 'AI Overview rendered. This capture covers both tracked query variants.',
  },
  {
    query: 'implementing workday',
    aio: '/assets/aio/rank-one-09-implementing-workday.jpg',
    aioWidth: 1168,
    aioHeight: 280,
    serp: '/assets/serp/rank-one-09-implementing-workday.jpg',
    alt: 'Google AI Overview for “implementing workday” describing planning, configuration, testing and go-live over six to twelve months.',
    badge: { text: 'AI Overview', tone: 'aio' },
    caption: "Align's Workday implementation guide is the tracked #1 asset.",
    note: 'AI Overview rendered on July 31, 2026.',
  },
  {
    query: 'data conversion migration',
    aio: '/assets/aio/rank-one-05-data-conversion-migration.jpg',
    aioWidth: 1168,
    aioHeight: 280,
    serp: '/assets/serp/rank-one-05-data-conversion-migration.jpg',
    alt: 'Google AI Overview for “data conversion migration” distinguishing data migration from data conversion.',
    badge: { text: 'AI Overview', tone: 'aio' },
    caption: "Align's data conversion checklist is the tracked #1 asset.",
    note: 'AI Overview rendered on July 31, 2026.',
  },
  {
    query: 'hcm services m&a',
    aio: '/assets/aio/rank-one-07-hcm-services-m-a.jpg',
    aioWidth: 1168,
    aioHeight: 272,
    serp: '/assets/serp/rank-one-07-hcm-services-m-a.jpg',
    alt: 'Partially rendered Google AI Overview for “hcm services m&a” describing transaction advisory, platform integration and workforce transition support.',
    badge: { text: 'Mid-render capture', tone: 'partial' },
    caption: 'Readable, but the panel was still loading when captured.',
    note: 'The capture caught the AI Overview mid-render, so the panel reads faded.',
  },
]

export const AIO_TRACKED_QUERIES = 11
export const AIO_CITED_COUNT = AIO_SHOTS.filter((s) => s.badge.tone === 'cited').length

/* ── reach ───────────────────────────────────────────────────── */

export const REACH = {
  total: 216,
  rows: [
    { name: 'Maher profile', value: 110, label: '110K annualized', note: 'Executive voice and buyer reach' },
    { name: 'Align HCM Page', value: 106, label: '106K annualized', note: 'Brand visibility and content distribution' },
  ],
}

/* ── method ──────────────────────────────────────────────────── */

export const METHOD = [
  {
    title: 'Where the numbers come from',
    open: true,
    items: [
      '<b>Semrush July export:</b> 436 position rows, 362 distinct queries, 58 ranking URLs.',
      '<b>Position tiers</b> count position rows: 24 Top 3, 39 Top 5, 76 Top 10, 209 Top 25, 436 Top 100.',
      '<b>Blog tiers</b> count position rows: 17 Top 3, 24 Top 5, 44 Top 10, 118 Top 25, 211 Top 100 across 180 distinct queries.',
      '<b>Fifteen distinct queries</b> sit at position #1 in the July export.',
      '<b>The 11 AI Overview queries</b> are de-duplicated from 14 AI Overview rows in the same export.',
      '<b>Lead counts</b> come from HubSpot, corrected against deterministic source capture live since July 17.',
      '<b>Screenshots</b> were captured from live Google on July 31, 2026, and cropped — never resampled up from a smaller original — to keep the answer text legible.',
    ],
  },
  {
    title: 'What these numbers do not claim',
    open: false,
    items: [
      'Google result pages and AI Overviews are dynamic by time, account and location. The July export and the July 31 captures are reported as two separate things on purpose.',
      'Only July carries deterministic attribution correction. January through June remain native HubSpot counts and are not directly comparable.',
      'Annualized LinkedIn figures are pace projections. 216K = 110K Maher + 106K Align HCM, roughly 70% above the prior reporting period.',
      'Authority Score is unchanged at 25. July’s story is ranking depth, traffic, answer visibility and recovered demand — not authority movement.',
      '$54K is the only verified currency figure in this report. No pipeline or forecast value is implied anywhere else.',
      'Two of the fifteen #1 queries have no clean July 31 capture, and one AI Overview capture caught the panel mid-render. Both are labeled as such rather than substituted.',
    ],
  },
]
