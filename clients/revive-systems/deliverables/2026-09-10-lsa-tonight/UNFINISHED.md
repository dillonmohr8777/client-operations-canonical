# Revive Systems / Mike Over — UNFINISHED deliverables STATUS
as_of: 2026-09-10 ~7:00 PM ET
privacy: internal ops (read-only inventory)
sources: client-ops vault (`Documents\Codex\projects\client-operations`), CONTROL / queue, Gmail (read-only), live public site checks
external_action: none (no email / Slack sends)

## Executive snapshot

| Priority focus | Status tonight | One-line |
|---|---|---|
| 5 blogs published or not | **NOT published** | Local HTML+PDF package Done; live CMS upload never done; guessed slugs resolve to webinar LP |
| GHL pricing cleanup | **Unfinished** | Pricing/checkout gated; Inner Circle still needs verified order summary; live site does not show agreed 3-in-30 / $797 / VIP $5k path |
| LSA insurance / license docs | **Failed / open** | BG check passed; campaign eligible; insurance + license document checks still rejected; Mike awaiting upload guidance |
| Jacob strategy notes | **Waiting on Mike** | First call only; Mike asked to wait for second call / notes; Dillon asked for notes to map site edits |
| Offer clarity on site | **Unfinished / client-confirmed** | Mike: site must clearly show the offer; live homepage still multi-offer (Reset / Inner Circle / VIP + webinar) without clear 3-in-30 entry |

---

## 1) Five blogs — published or not?

**Verdict: NOT published live.**

Vault / client-ops:
- Deliverable: `deliverables/2026-07-16-aeo-geo-seo-blog-cluster/`
- Manifest (`01-completion-manifest.md`, verified 2026-07-17): **“Complete for internal review. Nothing published or sent.”**
- Explicitly deferred: no sitemap submission, no robots publish, no live CMS upload, no client delivery without Dillon approval.
- Work item `wi-20260717-0006` = **Done** for *review-ready drafts only* (not live publish).
- Revision `wi-20260717-0010` = **Done** (data tracking language in local review blog only).

The five packaged blogs:
1. How to Choose a Weight-Loss Program That Fits Real Life
2. Getting Strong Again After 40
3. The Minimum-Viable Routine for Stressful Weeks
4. Health Coach, Personal Trainer, or Dietitian?
5. What Health Coaching Looks Like in Chambersburg

Gmail / weekly report evidence:
- Sep 1–8 weekly email (thread `1a081d3d58d765a3`): organic content package prepared, **“has not been published during the hold.”**
- `reviewed-evidence.json` background: five-piece organic package + sitemap path still subject to a publication decision.

Live site check (2026-09-10 ET):
- `/blog`, `/choose-a-weight-loss-program`, `/blog/choose-a-weight-loss-program`, `/strength-training-after-40` all resolve to **“Revive Systems | Free 30 Day Fix Webinar”** — not the five articles.
- No evidence any of the five HTML drafts are live CMS posts.

Related unfinished (publish path):
- `wi-20260717-0002` **Deferred (P1):** live site cleanup + sitemap submission still needs mapped HighLevel auth, backup, publish reviewed updates, lead-path test, authorized GSC submit.
- Mac Slack alignment (2026-07-16): live HighLevel implementation + mobile QA still required; GSC historically `siteUnverifiedUser`.

---

## 2) GHL pricing cleanup

**Verdict: Unfinished / approval-gated production work.**

What “pricing cleanup” means in evidence (not a separate Done WI):
- CLIENT.md production rule: no checkout, **pricing**, workflow, billing, or live HighLevel change without exact authorization + backup.
- Gmail “Revive GHL page direction” (`19eeb512b6780fef`, Jun 2026):
  - Dillon explicitly did **not** touch pricing/checkout/refunds.
  - Inner Circle: verify checkout/order summary; earlier **$199** structure called out as needing confirmation.
  - Mike later: Inner Circle possible at **$299.99**/mo (50% off first month); entry offer **Revive’s 3 in 30 at $797** applying toward **VIP $5k / 16 weeks**; kill visible 7-day as main offer.
- Aug 28 Mike ask: open GHL and fix remaining page items (Nigeria helper); Dillon named remaining must-fixes: clipped final mobile button, peptide/medical language, tracking, proof, privacy, quiz-result handoff — **separate HighLevel production gate** (operator-inbox `2026-08-28-revive-lsa-mike-card.md`). Ops packets still list **GHL production** as do-not-run without approval.
- clients.json: `accessMappingRequired: true` — live HighLevel edit route must be mapped before production change.
- Sep 1: new sub-account admin added (access prerequisite only; not proof pricing cleaned).

Live site (2026-09-10): homepage still presents **Revive Reset / Inner Circle / VIP** (+ free webinar / assessment) without an obvious public **3-in-30 / $797** entry offer or cleaned checkout path. Competing offers remain.

**Still open:** map exact GHL location → backup → align pricing/checkout to current offer (3-in-30 $797 → VIP $5k; Inner Circle price if kept) → remaining page QA → test leads. No evidence this cleanup shipped.

---

## 3) LSA insurance / license docs

**Verdict: Open blockers (docs failed). Background check cleared.**

Gmail thread `1a081d3d58d765a3` (Dillon → Mike, 2026-09-10 ~10:23 AM ET):
- Google **passed background check**.
- Campaign **on** and marked **eligible to serve**; Dillon still **not** claiming Local Services leads/traffic.
- Two document checks still **failed**:
  1. **Insurance** — wrong document type; file on record also past listed date.
  2. **License** — wrong document; Google looked at a **Maryland health club registration**.
- Dillon asked Mike to upload current insurance certificate + correct registration in Local Services verification, or say if MD health-club reg is wrong for Revive.

Mike replies (same day):
- ~10:29 AM ET: Mac said not to worry about insurance; Mike questions necessity (home / health coaching not PT); will grab cheap policy only if necessary; can redo license; wants upload location guidance; will send Jacob notes after.
- ~6:20 PM ET: still asking whether to get insurance and **where to upload license**.

Historical context (Aug): Evident submission complete; long BG-check wait; cases closed/reopened; Mac hypothesized G Ads LSA migration delays. `wi-20260806-0002` historically **Done** for earlier verification/reply package — **does not** close tonight’s failed insurance/license docs.

Tonight folder: `deliverables/2026-09-10-lsa-tonight/screenshots/` exists (empty listing at write time) — LSA capture work staged locally.

**Unfinished client/ops actions:** confirm whether insurance is required vs Mac’s guidance; identify correct license type Google wants; give Mike exact upload path; re-check portal after new uploads; do not claim lead production until docs clear + leads appear.

---

## 4) Jacob strategy notes

**Verdict: Not received — waiting on Mike / second Jacob call.**

- Sep 7: Mike hired new coach; meeting Wednesday; asked to hold further work (thread `1a0792d00becd6b0`) — agreed in weekly report.
- Sep 9 ~1:10 AM ET (reply on weekly): “I will update you after my call with **Jacob**…” + attached `Revive-Systems-Offer.pdf` and `revive lab package.pdfRSS.pdf`.
- Sep 10 Dillon: “Send me **Jacob’s notes** after the call and I will map the first site edits against those docs.”
- Sep 10 Mike: first call was intake only; Jacob will put things together after reviewing content; **maybe wait for second call** for a game plan; notes still promised / not evidenced as delivered in mailbox inventory tonight.

Also adjacent (not Jacob): Sep 9 Bedros Keullian webinar note (`1a083b3acfd37b59`) — irresistible offer / lab package; formalize offer; audience/visibility concern. Draft-desk treats Revive Mike + Bedros as **offer clarity / waiting**.

---

## 5) Offer clarity on site

**Verdict: Unfinished — client explicitly flagged; live site still unclear.**

Agreed offer architecture (Jun 24 Gmail, still the last clear structure):
- Entry: **Revive’s 3 in 30** ($797; 3 inches / 30 days; Brain / Body / Bloodwork).
- Backend: **VIP** (~$5k / 16 weeks; apply $797 toward it).
- Kill visible 7-day as primary; Inner Circle as possible downsell / mid offer only if priced cleanly.
- Site should sell the entry path first, then VIP — not every competing offer.

Mike Sep 9: “make sure the site clearly shows the offer and is CLEAR.”
Dillon Sep 8 weekly: priority remains **clear offer + website that supports it**; hold until after Wednesday review.
Live homepage 2026-09-10 still: duplicated sections, free webinar, free assessment, Revive Reset, Inner Circle, VIP, “all programs” — **no clear primary 3-in-30 offer page** (`/3-in-30` resolves to webinar LP). Matches operating-context finding (2026-07-16) of multiple competing entry actions.

Inputs received but not implemented on site:
- Offer PDFs (Sep 9 attachments + earlier offer docs).
- Lab package PDF.
- Organic acquisition package (`2026-07-16-organic-acquisition-and-sitemap-package.md`) still local/reviewable.

---

## Other unfinished / related open items (inventory)

| Item | Status | Evidence |
|---|---|---|
| Live HighLevel site cleanup (meta/H1/CTA/proof/mobile/lead path) | Deferred WI `wi-20260717-0002` | CONTROL + organic package checklists unchecked for live |
| Sitemap submit via authorized GSC | Deferred with site cleanup | Manifest deferred; Mac alignment blocked historically |
| Search performance reporting | Pending property verification | Sep 1–8 weekly email |
| GHL remaining LP fixes (mobile clip, peptide language, tracking/proof/privacy/quiz handoff) | Open since Aug 28 | Gmail `1a04587435c429e0` + overnight Mike card |
| Email deliverability (two domains, ~10% opens) | Parked until after site/SEO | Mike Jun 24; Dillon agreed later |
| Quiz / FB test path | Explicitly later, not Google Search | Aug 28 Dillon recommendation |
| Brand OS revive skill | Stub on box | `/workspace/brand-os/clients/revive-systems` stub |
| Unsent / gated client drafts | Do not send without Dillon | Draft-desk: Mike weekly `r-8380105611262064532`; Bedros `r-1381221045740134970`; older hold drafts superseded |

Done / not unfinished (for clarity):
- Five review-ready blog **drafts** (`wi-20260717-0006`, `wi-20260717-0010`) — Done as local package only.
- Ads-readiness local draft (`wi-20260719-0001`) — Done local.
- Historical LSA verification reply package (`wi-20260806-0002`) — Done; superseded by tonight’s live doc failures.
- Sep 1–8 weekly report email — sent; does not close open workstreams above.

---

## Suggested next batch (no actions taken by this inventory)

1. Reply Mike (human): insurance necessity vs Mac + exact LSA upload path for correct license/insurance files.
2. Receive / chase Jacob second-call notes; map against offer PDF + lab package.
3. Approve first GHL production batch: offer clarity (3-in-30 primary), pricing/checkout cleanup, remaining LP QA — after account mapping/backup.
4. Publish decision on five blogs + sitemap only after offer/path cleanup (Mac sequencing).
5. Recheck LSA portal for leads only after docs pass; do not claim traffic early.

## Gates honored this pass
- Read-only inventory.
- No email send.
- No Slack send.
- No GHL / Ads / GSC writes.
