# Momentum design system — drift audit and provenance

2026-09-05 · Momentum Digital / Momentum 360 · private, internal

Everything below is measured. Where a value could not be measured it says so.

---

## 1. What was measured, and how

| Source | Method | Confidence |
|---|---|---|
| Ten live radar builds, `momentum-prospect-radar-next10-2026-09-02c.netlify.app/sites/<slug>/` | Shipped HTML fetched, every `:root` block parsed in document order (last wins) by `audit/extract_tokens.py`; contrast computed from those tokens by `audit/contrast.py`; independently re-measured in-browser from `getComputedStyle` on every element owning a visible text node | **Measured.** Both paths agree. |
| `needmomentum.com` | Computed styles read in a real browser at 1440×900. The site sits behind the same SiteGround bot challenge as papaadvertising.com; it clears itself after a wait, no interaction | **Measured.** |
| `papaadvertising.com` | Not re-fetched. Read from the captured spec at `clients/momentum-360/skills/papa-prospect-radar-sites/references/papa-homepage-desktop-spec.md` | **See §5.** |

Ten sites × 12 token pairs = **120 pairs measured**. **37 fail WCAG AA.**
The new system: **31 pairs, 0 fail.**

The contrast script reads `tokens/momentum.tokens.css` itself rather than a
transcription of it, so a token cannot pass the audit and ship a different
value. `build.py` refuses to render the page if any pair fails.

One methodology note worth keeping: the first version of the in-browser probe
treated `color(srgb 0.87 0.89 0.89)` — what `color-mix()` computes to — as
0–255 rather than 0–1, and reported roughly a dozen false failures at 1.2:1.
Every number here is from the corrected probe. A contrast tool that has not
been checked against a known value is not evidence; `contrast.py` asserts
21.00:1 for white-on-black and 4.54:1 for `#767676`-on-white before it runs.

---

## 2. The drift, quantified

### 2.1 Inside the radar batch: 68 tokens, 61 identical, 7 varying

All ten builds define the same 68 custom properties. No site is missing one.
Seven vary, and they are exactly the seven that *should* vary — the per-prospect
tint: `--brand`, `--brand-2`, `--accent`, `--ink`, `--paper`, `--on-deep`,
`--on-accent`. Structure (type, space, radius, motion, shadow) is identical
across all ten.

**That is the good news, and it should be said plainly: the kit is disciplined.**
The three fonts are the same on all ten. The six radii are the same on all ten.
The easing curve is `cubic-bezier(.2, .7, .2, 1)` on all ten.

### 2.2 The three real defects

**(a) `--accent` on `--brand` — the circular seal. 6 of 10 sites.**

| Site | accent | brand | ratio | needs |
|---|---|---|---|---|
| golden-sea | `#8a5215` | `#2f6b52` | **1.01:1** | 4.5 |
| the-juice-merchant | `#b15819` | `#4f7a23` | **1.03:1** | 4.5 |
| smile-culture-dental | `#835527` | `#3f6b64` | **1.06:1** | 4.5 |
| f-m-berkheimer-inc | `#9c4f16` | `#2f6e94` | **1.07:1** | 4.5 |
| specks-broasted-chicken | `#7e5816` | `#c1272d` | **1.09:1** | 4.5 |
| union-chill-mat-company | `#a83c0f` | `#39474f` | **1.52:1** | 4.5 |
| nolt's / weathers | `#d4762a` | `#1d4e6d` | **2.72:1** | 4.5 |
| advance-exterior | `#aa5e22` | `#1d4e6d` | **1.83:1** | 4.5 |
| sangillo-tire-center | `#9d620a` | `#583e7d` | **1.74:1** | 4.5 |

At 1.01:1 the seal text is literally invisible. This is not a per-site tinting
mistake — it is one token used for two incompatible jobs. `--accent` is chosen
to work as a *field* (a button someone taps) and then printed as *text* on
another saturated field. No orange can do both: `#f58320` scores 7.19:1 against
near-black as a field and 2.58:1 as text on white.

**(b) `--muted` on `--panel` — 9 of 10 sites, 4.28:1 to 4.49:1.**

Nine consecutive near-misses is a formula, not an accident. `--muted` is
derived as `color-mix(in srgb, var(--ink) 66%, var(--paper))` — mixed against
`--paper` — and then rendered inside `.card`, whose ground is `--panel`. It is
validated on a surface it never actually appears on. `the-juice-merchant` misses
by 0.01.

**(c) `--brand` on `--brand-2` — headings on the deep field. 7 of 10 sites,
1.78:1 to 2.86:1**, against a 3.0 requirement for large text. Both are derived
from the same hue, so the darker one is always too close to the lighter one.

### 2.3 Two smaller ones

- **`the-juice-merchant` loads five font families**, not three: `Georgia` and
  `system-ui` leak in alongside the kit's Archivo Black / Nunito Sans / Caveat.
  Every other site loads exactly three.
- **`sangillo-tire-center` ships `--brand: #583E7D`** — a violet, and the only
  uppercase hex string in the whole batch. It is the closest any live build
  comes to the AI-purple line. Worth a deliberate decision rather than leaving
  it as an artifact of a generator: if Sangillo's real identity is purple, it
  stays and gets noted; if it was picked, it should not have been.

### 2.4 Against needmomentum.com: the marketing site is the outlier

| | radar builds (×10) | needmomentum.com |
|---|---|---|
| Font families rendered | **3** (identical on all ten) | **5** — Roboto, Open Sans, Poppins, Hind, bare `sans-serif` |
| Distinct border radii | **6** (identical on all ten) | **20** |
| Distinct transition duration/easing pairs | **6** | **14** |
| Brand oranges | 1 per site | **2 on one page** — `#f58320` and `#fb8300` |
| Section rhythm | one token, `clamp(72px, 9vw, 128px)` | none; Elementor per-section inline |
| Body default | tokenised | `#888888` on `#f5f5f5` = **3.25:1**, a WordPress default nobody chose |

The prospect sites are more coherent than the agency's own homepage. That is a
finding, not a slight — the kit is newer and was built once. It also means the
radar kit, not needmomentum.com, is the right substrate.

---

## 3. What was kept, and what was decided

The brand-system skill says Momentum's own brand is being rewritten, so the
choices below are stated out loud rather than inherited silently.

**Kept because it ships and passes:**
- `--m-brand: #1e73be` — measured off needmomentum.com. White on it is 4.94:1,
  which already clears AA. Not "modernised."
- `--m-accent: #f58320` — measured off needmomentum.com's primary CTA. It is
  the one of the site's two oranges that appears on the main button.
- Archivo Black / Nunito Sans / Caveat — measured off all ten radar builds.
- The space scale, section rhythm, gutter, `--maxw`, easing curve, `.5s`
  duration and the shadow — all measured off the radar kit verbatim, so
  existing markup ports without re-measuring.
- The pill button geometry (60px tall, 40px inline padding, full radius,
  uppercase, 150ms on colour) and the 80px accordion row — measured off Papa.

**Decided, with the reason:**
- The accent is split into three tokens by **job**: `--m-accent` (field only),
  `--m-on-accent` (label on that field, 7.19:1 — never white, which is 2.58:1),
  and `--m-accent-ink` (text on paper, 6.18:1). This is the structural fix for
  §2.2(a). One token cannot do both jobs; two tokens can.
- `--m-muted` is validated on **both** paper and surface (6.25:1 / 5.43:1)
  rather than derived from one. Fix for §2.2(b).
- `--m-deep` is a fixed field with its own measured on-colours instead of being
  derived from `--m-brand`. Fix for §2.2(c).
- Radii cut from six to four. Elevation is two neutral steps; no coloured or
  saturated shadow exists in the system, which is also the anti-glow rule made
  structural rather than advisory.

**The one pair that cannot be made to pass at body size:** orange text on the
brand-blue field tops out at 3.44:1 for any orange still readable as the brand
orange. `--m-accent-on-brand` is therefore declared **large-text-only** at
3.14:1, and small orange text is routed onto `--m-deep`, where
`--m-accent-on-deep` is 8.51:1. Stated rather than shipped as a silent failure.

Four failures were found and fixed **in this build**, by measuring it the same
way the radar sites were measured, which is the only reason they were caught:
the hero and footer were dark fields not picking up the dark-field on-colours
(2.70:1 and 2.74:1); the footer gradient's on-colours had been measured at its
deep end rather than its worst stop; and the nav overflowed the document by
19px at 375 and 23px at 768.

---

## 4. Files

| Path | What |
|---|---|
| `tokens/momentum.tokens.css` | Colour, type, space, radius, elevation, motion. Every colour carries its measured ratio and its provenance in a comment. |
| `tokens/momentum.components.css` | nav, hero, section, pill, card, accordion, logo wall, footer. No literal colour, size, radius, duration or curve — all `var()`. |
| `index.html` | Self-contained, generated. Renders every token and component live and prints the audit numbers. |
| `page.template.html`, `build.py` | Source of `index.html`. `build.py` inlines the real stylesheets and refuses to render if a pair fails. |
| `audit/extract_tokens.py` | Pulls every `:root` token out of the ten shipped builds. |
| `audit/contrast.py` | WCAG maths, self-checked against known values. Reads the stylesheet, not a copy. |
| `audit/tokens-by-site.json`, `drift.json`, `contrast.json`, `radar/` | The raw evidence, including the fetched HTML. |

Regenerate: `python build.py`.

Tested with no horizontal overflow at 320, 375, 390, 768, 1024, 1440 and 1920
CSS pixels. One `<h1>`, landmarks present, skip link, visible focus ring
measured on both grounds, no console errors. The scroll reveal's hidden state
is applied by JS only after JS has confirmed it can remove it, so content is
never invisible without scripting.

---

## 5. Papa provenance — measured vs inferred

The captured Papa spec is
`clients/momentum-360/skills/papa-prospect-radar-sites/references/papa-homepage-desktop-spec.md`.

That spec states its own confidence in its header, and it is worth preserving
precisely because it contradicts a common assumption about it:

> "All numbers below are computed styles / `getBoundingClientRect()` from the
> live page, **not inferred from a phone capture**."

So the numbers this system takes from Papa — the 60px/40px/50px pill, the 100px
fixed header, the 80px accordion row on an 82px pitch, the 0.8s
`cubic-bezier(.85, 0, .15, 1)` header swap with its frame-by-frame opacity and
translate table, the 1310px container, the 269px logo pitch, the 3000ms Owl
step — are **measured at a true 1440×900 desktop viewport on 2026-09-02**, not
inferred. There is no phone-capture-derived value in what was carried across.

Two things that spec marks as **inferred or absent**, and that this system
therefore does not claim:

- **The Adobe Typekit families** (`bebas-neue-pro`, `verveine`, `montserrat`)
  are named from `typekit.css`, but Momentum does not license them. The Google
  substitutes in `--m-font-display` / `--m-font-script` / `--m-font-text` are a
  **substitution, not a match**, and metrics will differ.
- **The Lottie timings** (6.0s header loop, the hero loop) are read from the
  JSON, not from rendered output.

I did not re-fetch papaadvertising.com. Its SiteGround challenge is the same one
needmomentum.com serves, and the existing capture is better than anything a
re-fetch would produce.

The one thing the brief expected that I could not find: a Papa spec containing a
**"Confidence" section** tagging values measured-vs-inferred. No such section
exists in any Papa file on disk. What exists is the header assertion quoted
above plus `papa-quality-bar.md`, which is a translation card, not a measurement
record. If a phone-capture-era spec with a Confidence table existed, it has been
superseded by the desktop capture. This section is the replacement.

---

## 6. Not done

- Not deployed. This is a private local deliverable.
- The logo wall uses client wordmarks as text stand-ins. A live build needs
  source-checked logo assets under the prospect-site evidence standard.
- Dark mode is not in this version. The radar kit ships a
  `prefers-color-scheme` block on its hub page; a dark variant of these tokens
  would need its own full contrast pass and should not be assumed to inherit.
