# Revive Systems enterprise-agent pilot — independent QA

**Reviewed:** 2026-09-20  
**Scope:** `01-organic-calendar.md` and `02-reactivation-call-agenda.md`  
**QA posture:** read-only; no client contact, credential use, send, post, publish,
account change, or production mutation performed.

## Release verdict

**PARTIAL as an internal planning packet. FAIL / HOLD for external delivery,
scheduling, publishing, outreach, or Facebook/Meta action.**

The drafts are correctly routed to Revive Systems, fit the documented brand,
and contain unusually strong health, privacy, and access guardrails. They are
not execution-ready because the calendar calls its source direction
“approved” without an approval receipt, the public CTA destinations and live
article URLs remain unverified, the social accounts/creative/cadence are not
approved, and the reactivation and Facebook decisions are intentionally open.

## QA matrix

| Check | Result | Evidence and finding |
|---|---|---|
| Client identity and separation | **PASS** | Both drafts name `Revive Systems` / `revive-systems` (`01`:1–5; `02`:1–9). `CLIENT.md` and the canonical registry agree that the client is active and routed as `revive-systems`. The Slack channel ID in `02`:19 is corroborated by the existing Revive vault overview and prior Revive receipt; no other client identity appears. |
| Source support and provenance | **PARTIAL** | The offer path, organic-first direction, local audience, voice, and production gates trace to `marketing-context.md`, `context/operating-context.md`, and the 2026-07-16 organic package. However, `01`:10 says “approved direction” while `marketing-context.md` labels itself a V1 internal draft and no exact approval receipt was supplied. `02`:16–19 and 209–212 retain a safe Slack locator, but this review did not read the raw source message; the local context supports the topic, not the exact wording of the ask. |
| Brand fit | **PASS** | Direct, useful, practical, non-judgmental copy matches the documented voice. The eight posts consistently use the supported themes of sustainable progress, strength, nutrition, recovery, accountability, Chambersburg, and Franklin County (`01`:14–92). No hype, shaming, unsupported superlative, price, capacity, or invented testimonial appears. |
| Health and medical-claim safety | **PASS** | Each higher-risk post includes a specific boundary against guarantees, diagnosis, treatment, injury advice, universal prescriptions, or public health disclosure (`01`:21, 31, 41, 51, 61, 71, 81, 91). The agenda separately prohibits medical-treatment claims and routes out-of-scope questions away from coaching (`02`:87–89, 151–157). The linked article files exist and contain educational-scope notices. |
| Privacy, contact permission, and suppression | **PARTIAL** | The agenda fails closed: no historical membership is treated as permission; list source, channel consent, opt-outs, suppression, and minimum data are explicit open decisions (`02`:60–68, 74–96, 142–163). The calendar warns against collecting health information in comments/DMs (`01`:49–51, 89–92), but it does not yet name a moderator, response route, retention rule, or escalation step if someone discloses sensitive information anyway. |
| CTA and publication truth | **PARTIAL** | The calendar clearly says local draft/not scheduled and correctly states that all five articles lack a live CMS receipt (`01`:3–10, 94–104). It also holds scheduling until exact URLs and imagery are verified (`01`:106–112). The CTAs still refer to an “approved application path” or future 3 in 30 destination without a verified URL (`01`:19, 29, 69, 79, 89), so none is publish-ready. |
| Facebook/Meta and access gates | **PASS** | The agenda treats the exact asset, owner, role state, problem, desired state, and safe evidence route as unknown (`02`:65–68, 111–140). It prohibits password/MFA requests, role changes, access requests, invitations, publishing, ads, and workflow edits (`02`:21–27, 158–163, 193–205). No account change is authorized. |
| Dates and local links | **PASS** | All eight dates match the stated Mon/Wed/Fri/Sun cadence from 2026-09-21 through 2026-10-04. All five article links, the completion manifest, the organic package, marketing context, and operating context resolve to existing local files. The dates are suggestions, not approval (`01`:5). |
| Missing decisions and operating ownership | **PARTIAL** | `01`:108–112 correctly lists the missing account, URL, creative, cadence, exact-caption, metric, and stop/review decisions. `02`:56–68 and 165–191 correctly leave cohort, permission, message, CTA, reply owner, Facebook asset/state, evidence route, owners, due dates, and approval status open. These are good gates, but they block execution. |
| Accidental authorization risk | **PASS** | `01`:3–5 and 106–114 keep the calendar draft-only and require exact caption/creative approval. `02`:11–27 and 193–205 explicitly deny authority for contact, sends, posts, scheduling, audience upload, access changes, workflow changes, spend, or publishing. Nothing in either artifact is a send/post/account-change instruction. Conducting or scheduling the client call is also client-facing and remains approval-required under `02`:6 and 205. |

## Ordered material fixes

1. **Correct the approval overstatement.** In `01`:10, replace “approved
   direction” with “documented internal direction,” or attach the exact approval
   receipt that makes “approved” true.
2. **Keep the entire calendar on hold until the real destinations exist.**
   Verify and record the canonical 3 in 30 URL, application URL, and any live
   article/GBP destination; then replace every placeholder CTA. A local article
   path is not a public link.
3. **Close the social release gate in one signed decision.** Name the exact
   Instagram and Facebook assets, access owner, approved eight captions and
   creatives, cadence/window, primary metric, stop/review date, response owner,
   and approval identity. Do not infer approval from this draft.
4. **Add a sensitive-response plan before question posts.** Name who monitors
   comments/DMs, the approved private route, what to do when health information
   is disclosed, and what is retained. Do not copy health details into this
   project artifact.
5. **Verify the source ask before treating the agenda as client-ready.** Read
   the exact Slack source through the authorized route and record only a
   redacted confirmation that the reactivation/Facebook scope is current. The
   locator alone proves traceability, not current intent.
6. **Complete R1–R5 and F1–F4, then request separate exact approvals.** No
   reactivation pilot may start until cohort ownership, channel permission,
   suppression, CTA, reply handling, and measurement are documented. No Meta
   action may start until the exact asset and desired state are verified.
7. **Re-date if the approval window slips.** Preserve the four-post weekly
   cadence only if the dates remain operationally current; the existing dates
   are accurate but are not evergreen.

## Confirmed safe state

- Eight draft posts and five local article cross-links exist.
- No live article, public CTA destination, social asset, outreach cohort, or
  Facebook asset state is represented as verified when it is not.
- No send, post, publish, schedule, credential use, list upload, access change,
  workflow mutation, or spend is authorized by this packet.
- Release remains **HOLD** until the ordered fixes and exact human approvals are
  evidenced.
