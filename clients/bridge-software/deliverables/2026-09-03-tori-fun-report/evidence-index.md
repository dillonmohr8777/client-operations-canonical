# Evidence index — Bridge Field Notes (Tori companion report)

**Date:** 2026-09-03
**Deliverable:** `index.html` (deployed) + `Bridge-Field-Notes-2026-09-03.pdf`
**Status:** Internal. **Not sent to Tori or anyone else.** Dillon sends it himself.

This page is a *companion* to the serious report. It introduces **no new claims**. Every
number, status and quotation below traces to the source named in the right-hand column.

## Sources

| Key | Path |
|---|---|
| **REPORT** | `clients/bridge-software/deliverables/2026-09-03-milestones-1-3-report/report.html` |
| **EVID** | `clients/bridge-software/deliverables/2026-09-03-milestones-1-3-report/evidence-index.md` |
| **EMAIL** | `clients/bridge-software/deliverables/2026-09-03-milestones-1-3-report/email-draft.md` |
| **PHASEMAP** | `clients/bridge-software/deliverables/2026-09-02-phase-and-proposal-map/phase-map.md` |
| **SHOTS** | `clients/bridge-software/deliverables/2026-09-03-milestones-1-3-report/shots/*.png` |
| **BRAND** | `clients/bridge-software/artifacts/2026-07-20-tori-source-package/Bridge-Branding-Guide.png` |
| **MARK** | `C:\Users\dillo\repos\bridge-software-frontend\public\bridge-mark.svg` |
| **TOKENS** | `C:\Users\dillo\repos\bridge-software-frontend\app\globals.css` · `app\layout.tsx` |

---

## 1 · Milestone statuses — these must match exactly, and do

| Companion page says | REPORT says | Match |
|---|---|---|
| **M1 · Discovery, Requirements and Architecture — "Delivered and paid"** | "Status: delivered and paid." | ✅ |
| M1 note: warmly received, *never captured as a dated acceptance*, "worth closing retrospectively" | "the client's written response on August 5 was 'the specs are awesome, the research is top tier' — warm, but not a formal milestone acceptance. No dated acceptance artifact was recorded, which is worth closing retrospectively." | ✅ |
| **M2 · UX, Product Flow and the Data Model — "Delivered · live for review"** | "Status: delivered and live for review; client route-by-route sign-off is still outstanding." | ✅ |
| M2 note: **"Not signed off."** Acceptance record's decision column still empty for all five routes | "The acceptance record's decision column remains empty for all five routes today." · "No client acceptance is claimed here, because none has been recorded." | ✅ |
| **M3 · Accounts, Authentication and Verification — "In progress"** | "In progress. The front end is complete; the backend contract is the open half." | ✅ |
| M3 note: hardening branch **not merged**; backend data contract has not landed; three M3 routes return 404 in production | "Milestone 3 is in progress. Its frontend work is built and passing checks but is not merged and not live." · "Three routes built in Milestone 3 — sign-in, account creation and the admin entry redirect — are not counted as live: they return 404 in production today because the branch that adds them has not been merged." | ✅ |
| **M4 · Directory MVP — "Not started"** | "Milestone 4, the Directory MVP, has not started." · "The Directory MVP is the next contracted milestone and no work has begun on it." | ✅ |
| M4 note: Explore/profile are M2 UX on sample data, not a directory | "The Explore and profile screens on the review build are Milestone 2 UX running on sample data — they are not a directory. Production directory data, connected search, the claim and correction workflow and contact-request routing are all Milestone 4 scope." | ✅ |

No status on the companion page is ahead of the serious report. Nothing is described as
approved, accepted, merged or live that the report does not describe that way.

---

## 2 · Every number on the page

| Figure | Where it appears | REPORT source |
|---|---|---|
| **13** routes returning 200 in production | Receipts wall, pin callout | "Routes live in production · 13 · Direct HTTP probe of every route on bridge-connected-signal.netlify.app, 2026-09-03. All returned 200." |
| **45** automated tests passing, zero failing | Receipts wall, pin callout | "Tests passing · 45 · Recorded in the Milestone 3 build report from a clean install, and independently re-run by continuous integration." · gates table "24 passing → 45 passing, 0 failing" |
| **12** member roles defined and built | Receipts wall, pin callout, Step 1 copy | "Member roles · 12 · Counted on the live /join screen and in the shared role catalogue that both join steps read from." |
| **36** static pages in the production build | Receipts wall | "Static pages built · 36 · Production build output on the Milestone 3 branch, against 33 on the baseline." |
| **7** contrast failures found and fixed | Receipts wall, pin callout, claim block | "Contrast failures fixed · 7 · Five in the admin panel plus two pre-existing theme-token failures." |
| **3** themes checked for AA compliance | Receipts wall | "Themes verified · 3 · Modern Network, Trusted Current and Botanical." |
| **77** commits on the development branch | Receipts wall | "Commits on development · 77 · Commit count on the development branch, first commit 2026-07-11." |
| **15 / 9** pull requests opened, then merged | Receipts wall | "Pull requests · 15 opened · 9 merged · Repository pull-request history, 2026-08-31 to 2026-09-03." |
| **2** deploy environments running | Receipts wall | "Deploy environments · 2 · Production and preview both probed." |
| **3** legacy paths redirecting correctly | Receipts wall, pin callout | "Legacy redirects · 3 · /studio → /create, /business → /my-profile, /signal → /explore, each a 301 to the correct target." |
| **50+** states plus D.C. on Explore | Receipts wall, pin callout, Explore card | "Geographic coverage · 50 states + D.C. · State selector enumerated on the live Explore route." |
| **0** client acceptances recorded with a date | Receipts wall | "No client acceptance is claimed anywhere in this report, because none has been recorded with a date and a source." |
| **2.22:1 → 6.02:1** form error text | Contrast claim block + chart | "form error text at 2.22:1 — effectively unreadable — now 6.02:1" |
| **2.88:1** worst admin-panel failure, against a **4.5:1** requirement | Contrast claim block | "the worst was 2.88:1 against a 4.5:1 requirement" |
| **401 / 403 / 400·422 / 409** status mapping | HTTP-client claim block diagram | "one status mapping (401 unauthenticated, 403 forbidden, 400/422 validation, 409 conflict)" |
| **404** — three M3 routes in production | M3 card | REPORT, verified-metrics footnote (quoted in §1 above) |
| **Step 1 of 4 … Step 4 of 4**, and their routes `/join`, `/join/account` | Join ladder | REPORT join-sequence table, verbatim step titles, routes and states |
| **6** sample cases awaiting review, days-waiting column | Simulated admin queue | Row values are **invented sample data**, clearly labelled "Sample queue" on the panel and "Sample data" in the caption — mirroring REPORT: "It is running on a clearly-labelled sample queue." No real case data is used. |
| **1440 px / 390 px** capture widths | Mobile strip caption | "Desktop captured at 1440 px, mobile at 390 px, both from production on September 3, 2026." |
| **13-page** report | Intro, mascot line, footer | REPORT paginates 01–13 ("13 · Evidence and method") |
| **27 May – 3 Sept 2026** evidence window | Intro meta line | "Evidence window May 27 – September 3, 2026" |

**No contract dollar amounts, milestone prices, totals, deposits or payment terms appear
anywhere on the page or in the PDF.** Verified by regex scan of `index.html` for currency,
digit-plus-currency-word, "payment terms", "invoice", "contract value" and the specific
figure carried in PHASEMAP. The only hit is the footer's own negative statement that no
pricing appears. The public $349 founding-member price was permitted but is **not used** —
the serious report does not state it, and every number here matches that report.

---

## 3 · Narrative claims

| Companion page says | REPORT source |
|---|---|
| "Every screen … runs against a typed mock adapter, and every screen says so on the page." | "Every screen on the review URL runs against a typed mock adapter, and each one says so on the page." |
| "Turning mock mode off is one environment variable … waits on Greencubes returning the backend repository, branch, commit and staging origin." | "Turning mock mode off is a single environment variable, and it waits on Greencubes returning the backend repository, branch, commit and staging origin." |
| Explore / Create / My Profile self-declared limits (favourites on device, local drafts, pending email reminder) | "Explore says sample records are limited and favourites stay on the device. Create says draft, library and review actions remain local … My Profile says the email reminder integration is pending." |
| "Nothing on the review build implies a capability that isn't there." | Verbatim from REPORT. |
| Five review routes and their descriptions (Home, Community News, Create, My Profile, Explore) | REPORT §"The five review routes and what each one does" — condensed, no meaning changed. Acceptance column reproduced: four "Pending Tori", Community News "Pending — default view undecided". |
| "Sent for sign-off on 17 August. A review was promised on the 18th, again on the 23rd, and again on 1 September. On 21 August we wrote … not officially approved yet." | "The build was sent for sign-off on August 17. A review was promised on August 18, again on August 23, and again on September 1. On August 21 Momentum wrote to the client, in writing, that the five routes are not officially approved yet." |
| "No token in browser storage … a test asserts no client file touches web storage." | "No token in browser storage — the session is read from the API on each load … A test asserts no client file touches web storage." |
| "The return-path parameter accepts only same-origin paths — absolute URLs and protocol-relative hosts get rejected." | Verbatim in substance from REPORT §"Session handling and role-aware routing". |
| "Client-side routing is presentation only and never authorization — the API must still enforce it." | Verbatim from REPORT. |
| "A second, parallel client that had bypassed that contract was folded back in." | "A second, parallel HTTP client that had bypassed that contract was folded back in." |
| "Only a curated user-facing message is shown, so a stack or a raw backend string can never reach the screen." | REPORT §"Required states across every route". |
| Automated contrast check reads colour tokens out of the stylesheet, asserts AA in all three themes | "An automated check implements the published contrast formulas, reads the colour tokens directly out of the stylesheet … and asserts the AA threshold for every rendered text-on-background pair in all three themes." |
| Admin queue: organization, type, market, status, days waiting; sortable; live count; case detail needs the verification-case contract | "The queue renders real case rows — organization, type, market, verification status and days waiting — with a sortable order and a live count … Case detail … is the part that needs the backend's verification-case contract, which has not been supplied." |
| Steps 3 and 4 need member identity, org-scoped drafts, protected evidence storage, a review case, plus a product answer on evidence per role and what "Verified" promises | REPORT §"Steps 2 and 4 need a product decision from Melissa and Tori". |
| Step 2 / Step 4 approval still with Melissa and Tori; not represented as client-approved | "Step 2 and Step 4 product approval is still with Melissa and Tori — do not represent those screens as client approved." |
| The three asks + the longer list (evidence per role, Verified badge, field visibility, first market and priority role, brand approval of the purple) | REPORT §"With the client — Product decisions", complete and unaltered. |
| "The single most useful thing that can happen this week: a dated, written accept-or-revise on the five review routes… The build is ready for it." | Verbatim from REPORT §"What happens next". |
| Milestone 1 inputs — four client concepts, branding guide, verification requirements, compliance strategy — became the product spec | REPORT §"The prototype families and the brand source" + EMAIL paragraph on Milestone 1. |
| "Founding-member callout" on Join Step 1 | REPORT join-sequence table, Step 1 description. |
| 21+ confirmation blocks every route before entry; it came from the client's legal and compliance strategy | "the 21+ confirmation that blocks every route before entry" · "Legal and compliance platform strategy — drove the 21+ adult-entry requirement". |
| "Connect. Grow. Fight Together." | BRAND tagline; also carried in REPORT's own cover and footer. |
| "the specs are awesome, the research is top tier" | REPORT §Milestone 1, quoting the client's 5 August written response. |

**Deliberately omitted** from the companion page (present in REPORT, but out of scope or
not appropriate for a light read): the credential-exposure/rotation item, the
Phase-vs-Milestone vocabulary warning, the six missing session claims and the missing
response header, the chronology table, and the Greencubes "half done / almost done"
self-reporting. Omitting them does not make any status look better than it is — the page
still states plainly that the backend contract has not landed and the branch is not merged.

---

## 4 · Imagery provenance

| Asset | Provenance |
|---|---|
| `assets/bridge-mark.svg` | **Tori's real mark**, copied byte-for-byte from MARK (`bridge-software-frontend/public/bridge-mark.svg`). Never redrawn, never traced. Used for the favicon, the topbar, the intro resolve, the 3D object's front face and the footer. |
| Wordmark "BRIDGE" | Set in **Poppins ExtraBold**, the brand's declared header face per BRAND ("HEADERS – BOLD. CONFIDENT. MODERN. POPPINS") and TOKENS (`next/font/google` Poppins → `--font-bridge`). Subheads in **Montserrat SemiBold**, body in **Inter** — both also per BRAND. All four families plus Caveat and IBM Plex Mono are self-hosted woff2 (latin subset) in `assets/fonts/`. No CDN. |
| Palette | Deep Purple `#4B0082` from BRAND. `#7C3AED` is the mark file's own gradient stop. Ground `#0A0610` and surface tones derive from TOKENS' production "Modern Network" theme. |
| `assets/shots/d-*.webp`, `m-*.webp` | Re-encoded from SHOTS — the same production captures used in the serious report, taken from `bridge-connected-signal.netlify.app` on 2026-09-03. Resized to 1240 px (desktop) / 420 px (mobile), WebP q80. No retouching. |
| `assets/mascot-wave.svg`, `mascot-peek.svg`, `mascot-sit.svg` | **Higgsfield MCP**, model `recraft_v4_1` (`model_type: vector`), text-to-image, 2026-09-03. An **original** robot character of our own design — rounded-square head, single horizontal visor eye, bulb antenna. It is not, and does not resemble, Anthropic's Claude character or any third-party mascot. |
| `assets/leaf-doodles.svg` | Higgsfield `recraft_v4_1` vector — botanical seven-point leaf linework. |
| `assets/smoke-motif.svg` | Higgsfield `recraft_v4_1` vector — drifting smoke ribbons, used decoratively behind the mascot. |
| `assets/ephemera.svg` | Higgsfield `recraft_v4_1` vector — washi tape, paper booklet, paper clip, torn edge. Used as the polaroid tape. |
| `assets/arrows.svg` | Higgsfield `recraft_v4_1` vector — hand-drawn annotation arrows. |
| `assets/stamp-1.png` | Derived from a Higgsfield `recraft_v4_1` vector stamp sheet: the sheet was rasterised, the starburst ring isolated by connected-component analysis, cropped square and alpha-masked. Recoloured per status with CSS `hue-rotate` (purple DONE, green LIVE, amber WIP, red 0%). |
| Ambient smoke | Not an image. Three fixed layers of a radial violet gradient masked by a **baked** `feTurbulence` + `feGaussianBlur` SVG data-URI. The filter rasterises once; only `transform` animates. |
| Diagrams | Hand-authored inline SVG. Not generated, not traced. |

All eight Higgsfield generations succeeded — **no fallback was needed**. Every asset is
stored locally in `assets/` and served from the deploy. Nothing is hotlinked.

---

## 5 · Verification performed on this deliverable

| Check | Method | Result |
|---|---|---|
| **Contrast (WCAG 2.x AA)** | Every text style screenshotted in its resting state, then re-screenshotted with all text made transparent so only the *painted* ground remained — smoke, gradients, paper and imagery included. Contrast computed against the 3rd- and 97th-percentile luminance pixels behind each element. | **68 unique text styles · 0 failures.** Lowest **4.79:1** (`.face-tag`, needs 4.5). Median **9.23:1**. Highest 19.09:1. All headings clear the 3.0 large-text threshold; all body text clears 4.5. |
| **Frame rate** | Playwright + Chrome, `rAF` timestamps recorded while the pinned section was scrubbed across its full travel. | With the frame cap removed: **median 0.9 ms, p95 2.0 ms** of work per frame across 4,673 frames — roughly **5–12 % of a 16.7 ms (60 fps) budget**; 6 frames exceeded 16.7 ms. Under headless Chrome's fixed 30 Hz cadence: 126/126 frames delivered, median 33.4 ms, worst 33.6 ms — **zero dropped frames**. All animation is `transform`/`opacity` only. |
| **Reduced motion** | Live site loaded with `prefers-reduced-motion: reduce`. | Intro headline and sub visible immediately; all `[data-lift]` elements at opacity 1; the pinned section un-pins to normal flow; all six callouts, all three captions and the full-bleed image visible without motion. Verified on the deployed URL. |
| **Horizontal overflow** | 390 × 844 emulation. | `scrollWidth === clientWidth === 390`. Only the route carousel and the queue table extend beyond the viewport, inside their own scroll containers, by design. |
| **Console / network** | Live site, Chrome. | **0 console errors, 0 page errors, 0 failed requests, 0 broken images.** |
| **Self-containment** | Asset reference audit. | 28 referenced assets, all local. No external script, stylesheet, font or image. |
| **Pricing scan** | Regex over `index.html`. | No dollar amounts, totals or payment terms. |
| **21+ notice** | Present in the topbar chip, the mascot section, and the footer, matching the live product's own gate. | ✅ |
| **PDF** | Chromium `page.pdf()`, A4, `printBackground`, dedicated `@media print` stylesheet (un-pins the scrubbed section, expands the carousel to a grid, kills all motion, keeps the dark design). | 17 pages, ~5.1 MB. |

---

## 6 · Deploy

| | |
|---|---|
| **Live URL** | https://bridge-field-notes-companion.netlify.app |
| **Admin URL** | https://app.netlify.com/projects/bridge-field-notes-companion |
| **Project ID** | `eae5c810-3bc4-4150-aa4c-37c3a056ed0c` |
| **Unlisted / noindex** | `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet, noimageindex` (verified live), `<meta name="robots">`, and `robots.txt: Disallow: /`. No custom domain. |
| **New project** | Created fresh. **No existing Bridge property was touched** — `bridge-connected-signal`, `-dev`, `-safety-20260806`, `bridge-kimi-design` and the three `bridge-preview-*` sites were left untouched. |
| **Deployed contents** | `index.html`, `styles.css`, `app.js`, `assets/`, `_headers`, `robots.txt`, and the PDF. This evidence index is **not** deployed. |

## 7 · Handling

Nothing has been sent. No email, no Slack, no share link issued to Tori, Melissa, Mac or
Miraj. No git operations were performed in `client-operations`.
