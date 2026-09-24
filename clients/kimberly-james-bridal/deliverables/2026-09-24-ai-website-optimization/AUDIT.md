# Kimberly James Bridal — AI website optimization run

Status: audited, staged recommendations; publication blocked pending client facts and Squarespace access
Client: `kimberly-james-bridal`
Run date: 2026-09-24 (ET)
Commitment source: Gmail message `1a0a2ccc404824eb`, sent 2026-09-14 to `kimberly@kimberlyjamesbridal.com`

## Scope

Read-only crawl of the public Squarespace site focused on AI answer readiness, entity consistency, appointment conversion paths, structured data, and crawl/index hygiene. No Squarespace edit, redirect, sitemap mutation, client message, ad change, or publication was performed.

## Current live evidence

Direct HTTP checks returned `200` for `/`, `/scheduling`, `/schedule-today`, `/bridal-appointment-request`, `/faq`, `/size-inclusive-gowns`, `/wedding-dress-alteration-1`, and `/wedding-dress-timeline`.

- The visible footer on all checked pages says **8333 Germantown Avenue, Philadelphia, PA 19118**, phone **267.809.5784**, with hours Tue 10–7, Wed 10–8, Thu/Fri 10–7, Sat/Sun 9–5.
- The homepage, `/scheduling`, `/schedule-today`, and `/bridal-appointment-request` each publish `Organization` and `LocalBusiness` JSON-LD with **15 West Highland Avenue** and LocalBusiness hours beginning with a leading comma (`", Tu 11:00-19:00..."`). The visible address and structured entity disagree.
- `/faq` is the only checked route with `FAQPage` JSON-LD. `/scheduling`, `/size-inclusive-gowns`, `/wedding-dress-alteration-1`, and `/wedding-dress-timeline` contain substantial FAQ or question-answer copy without that schema.
- `/scheduling` and `/schedule-today` are both `200`, self-canonical, and expose the same appointment offer. The homepage links to `/scheduling`; `/schedule-today` is a duplicate candidate. `/bridal-appointment-request` is a distinct `200` campaign-style route and is not in the sitemap.
- `/scheduling` says initial appointments allow the bride plus up to 4 guests and VIP up to 8; its FAQ says initial up to 6 and VIP up to 8/9. This is a conversion and answer-quality conflict.
- Commercial facts conflict across live pages: `/scheduling` says gowns `$1,500–$3,000`; `/wedding-dress-timeline` and `/size-inclusive-gowns` say `$1,000–$3,500`; `/about-new` says `$800–$3,000`; `/designers-` says `$1,500–$3,000`.
- Size claims conflict: `/scheduling` FAQ says samples 6–16 plus a size-inclusive mix 18–34; `/size-inclusive-gowns` says Michelle Bridal 14–32; `/wedding-dress-timeline` footer says sizes 0–40. Freeze the actual inventory before adding or expanding AI-facing claims.
- Designer claims conflict: navigation exposes Madi Lane, Serene, Evie Young, and Mila Isabella; `/designers-` describes two main designers plus Mila Isabella; the legacy `/designers` page lists Mori Lee, Mila Isabella, Madi Lane, and Michelle Bridal. The exact current designer roster needs one owner-approved source of truth.
- `sitemap.xml` currently contains **178** URLs (maximum `<lastmod>` observed: `2026-09-23`). It includes `/home`, `/scheduling`, `/schedule-today`, `/about-new`, `/designers-`, `/size-inclusive-gowns`, and `/wedding-dress-alteration-1`; the root `/` and `/bridal-appointment-request` are absent. The trailing-hyphen and `-1` slugs are avoidable crawl and brand-signal debt.
- `robots.txt` returns `200` and groups AI crawlers such as `GPTBot`, `ClaudeBot`, `Google-Extended`, and `anthropic-ai` without an AI-specific `Disallow`; this keeps discovery open unless Kim wants a different policy. `/llms.txt` returns `404`.

## Prioritized recommendations

### P0 — confirm facts before any edit

1. Confirm the legal public address, phone, hours, and whether the visible footer hours are the operating hours to publish in structured data.
2. Confirm one organic booking URL. Provisional recommendation: keep `/scheduling` because the homepage links to it. Keep `/bridal-appointment-request` separate only if it remains an intentional paid/campaign route with independent tracking. Redirect `/schedule-today` only after the owner approves the destination and paid routing is checked.
3. Confirm one price range, one guest policy per appointment type, one sample-size range, and one designer roster. Remove or update conflicting claims across the pages above.

### P1 — structured entity and answer coverage

4. Regenerate `Organization` and `LocalBusiness` JSON-LD from the approved NAP/hours. Remove `15 West Highland Avenue` and the leading comma in `openingHours`.
5. Add accurate `FAQPage` JSON-LD only to pages whose visible Q&A is approved and complete: `/scheduling`, `/size-inclusive-gowns`, `/wedding-dress-alteration-1`, `/wedding-dress-timeline`, and `/designers-` are candidates. Keep answers identical to visible copy.
6. Publish a concise `/llms.txt` after P0 facts are frozen. Include canonical URL, location, services, approved price/size/designer facts, booking route, and a last-reviewed date. Keep robots AI discovery open unless Kim explicitly requests restrictions.

### P2 — crawl and content hygiene

7. Make `/scheduling` the only organic appointment page; choose a redirect/noindex treatment for `/schedule-today` after route confirmation. Preserve `/bridal-appointment-request` until paid destination and conversion measurement are reconciled.
8. Remove `/home` from the indexable set if it duplicates `/`; decide whether `/designers-`, `/about-new`, and `/wedding-dress-alteration-1` are canonical pages or legacy drafts, then align titles, H1s, canonicals, and sitemap entries.
9. Clean visible copy errors and awkward phrases that reduce trust in AI answers (for example “gown s,” “4months,” “your curious,” and repeated testimonials on `/about-new`).

## Verification receipt

- Source URLs: `https://www.kimberlyjamesbridal.com/`, `/scheduling`, `/schedule-today`, `/bridal-appointment-request`, `/faq`, `/size-inclusive-gowns`, `/wedding-dress-alteration-1`, `/wedding-dress-timeline`, `/designers-`, `/about-new`, `/robots.txt`, `/sitemap.xml`, `/llms.txt`.
- HTTP results: all checked HTML routes `200`; `robots.txt` `200`; `sitemap.xml` `200`; `llms.txt` `404`.
- Fresh capture hashes: homepage HTML SHA-256 `b422fa766fb81ab3364ab330ba61023372ef24fb724a59f8378c7f3c09c06adf`; sitemap XML SHA-256 `2e6d81d1631641572f5aaab0112bfd8e56f856aa4060691b1babaa4ea42c06c8`.
- Previous implementation artifact remains relevant: [`2026-09-22-seo-booking-correction/IMPLEMENTATION.md`](../2026-09-22-seo-booking-correction/IMPLEMENTATION.md).

## Release state

**Audited and staged.** A publish-ready patch cannot be applied safely until Kimberly confirms the P0 facts and the authenticated Squarespace editor is available. The findings and confirmation request were sent in the existing Gmail thread; provider message ID `1a0d42799814cefb`, label `SENT`, and a full Gmail readback confirmed the exact recipient and body.
