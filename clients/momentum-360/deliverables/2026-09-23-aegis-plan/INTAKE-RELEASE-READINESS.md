# NeedMomentum audit intake release readiness

Updated: 2026-09-24  
Scope: verified private `/intake` staging and the remaining public release dependencies.

## Decision

The private synthetic intake path passed staged submission, persistent queue,
QA approval, report-access gating, and separate database restore checks. See
`staging-flow-receipt.json` and `stage-restore-receipt.json` for dated acceptance
evidence. This is not a live public NeedMomentum funnel. Current authority is
draft/stage only under Claude coordination; prior release language below is
superseded. Production publishing, real delivery and security/access changes
retain their gates. The implemented six-field request is
saved, deduplicated, queued as `intake.audit`, scanned from the submitted public
URL, rendered into a draft report, and paused at `qa_pending` (`lib/pipeline.ts:60-104`,
`lib/pipeline.ts:215-251`, `lib/pipeline.ts:397-401`). The local end-to-end test
passes this path and confirms no email, CRM handoff, or pre-QA report access
(`tests/engine.test.ts:372-479`).

## Actual local path

1. Provide durable Postgres and run `node --experimental-strip-types bin/radar-v2.js migrate`.
   `migrate` applies `001_init`, `002_intake_six_fields`, and
   `003_nullable_prospect_identity` when `DATABASE_URL` is present
   (`lib/store.ts:363-390`). The Docker file is explicitly local-only
   (`docker-compose.yml:1-2`).
2. Set `RADAR_V2_PUBLIC_ORIGIN` to the eventual HTTPS origin before creating
   reports. It is the source for report and booking links
   (`lib/config.ts:24-27`, `lib/pipeline.ts:361-372`). Keep the Node listener on
   loopback behind an approved TLS reverse proxy; `radar-v2.js serve` starts a
   plain HTTP listener and its intake worker (`bin/radar-v2.js:69-92`). Private
   staging now has a verified Tailscale HTTPS route on port8446 to loopback4343.
   It requires tailnet access and the Windows host. A public production route
   and application reboot recovery are still unverified.
3. Set a non-empty `RADAR_V2_QA_TOKEN`; otherwise `/qa` refuses access and every
   report remains human-review gated (`lib/web.ts:145-150`, `lib/pipeline.ts:405-430`).
   Set `RADAR_V2_FIELD_KEY` to a 32-byte hex key for sensitive intake/contact
   columns before accepting real submissions (`.env.example:20-21`, `lib/store.ts:241-243`).
4. Keep `RADAR_V2_KILL_SWITCH=true` and email/CRM/report-delivery flags false
   until separate approvals and adapters exist. Email is explicitly dry-run and
   CRM only writes a redacted preview (`lib/adapters.ts:65-72`, `lib/adapters.ts:87-101`).

## Hard blockers before public release

- **Production durability remains unverified; local restart rehearsal passed.** The serve entry point now fails closed when
  `DATABASE_URL` is missing. Any configured URL also fails closed on probe,
  schema, or hydration errors, closes the pool, and never falls back to
  `MemoryStore`; no-URL test/slice/retain callers retain intentional memory mode
  (`bin/radar-v2.js:69-74`, `lib/store.ts:396-422`,
  `tests/serve-readiness.test.ts`). The September23 disposable Postgres16 rehearsal applied migrations, submitted one synthetic intake, restarted the database, and read back exactly one intake, one audit job and one intake.submitted event. Email and growth goals were encrypted at rest and decrypted on hydration. See intake-postgres-rehearsal.txt and rehearse-intake.cjs. Both disposable test containers are stopped; no production service was changed. Production still needs its own restart/restore receipt.
- **Public production HTTPS and recovery remain missing.** Private tailnet HTTPS
  staging is verified at https://desktop-4ahkec4.tailade026.ts.net:8446 with valid
  TLS. Its synthetic runner is not a public endpoint. Set
  `RADAR_V2_PUBLIC_ORIGIN` to the approved production origin before release and
  verify that host's restart/recovery path.
- **Production CAPTCHA is not live.** Turnstile Siteverify validates the token, requires an expected hostname, checks the configured action, times out after five seconds, rejects redirects and fails closed. The production-capable form renders a widget only when its keys, expected hostname and live flag are configured; otherwise submission is disabled. Its hidden response field matches `captcha_token`. Focused tests and actual Cloudflare dummy-key endpoint checks passed. Production keys, hostname configuration and real widget/browser acceptance remain release gates. The private synthetic runner intentionally has CAPTCHA disabled and must not be exposed publicly.
- **Delivery is not wired.** Email and CRM remain dry-run; there is no provider
  receipt, CRM field-map readback, or conversion verification
  (`CMS-DRAFT.md:10`, `lib/adapters.ts:65-101`).
- **Public CMS release remains pending.** WordPress draft29608 revision29613 has
  a saved CTA to private staging, with browser navigation verified in
  `CMS-DRAFT.md`. Published original5894 is unchanged. The private test CTA must
  not be published as the public audit funnel.

## Minimum release evidence

Before asking for release approval, capture all of the following in one
reproducible staging run:

- migration output and Postgres-backed intake readback after a restart;
- HTTPS GET `/health`, GET `/intake`, one invalid POST, and one approved test
  submission with its status token redacted;
- queue receipt through `qa_pending`, QA approval receipt, and report URL readback;
- email/CRM sandbox receipts with `liveWrite=false` until their separate gates
  are approved;
- WordPress CTA/form readback and one conversion reconciliation.

Nothing above is a real email/CRM delivery receipt. Current evidence includes
private HTTPS staging acceptance and a synthetic database restore. Public
hosting, application reboot recovery, production CAPTCHA, real delivery and
conversion reconciliation remain unverified. Use the dated September24 receipts
below to distinguish completed staging checks from remaining release gates.

## September23 verification update

- submitIntake now flushes intake.submitted before returning success. Pending-write, failed-write and HTTP-success checks passed3/3; independent source review passed.
- Actual Postgres restart readback passed at23:11:49Z. Existing PostgreSQL integration test plus six CAPTCHA tests passed7/7, zero skips. The pg dependency was already declared but absent locally; installed it and saved package-lock.json.
- The rehearsal uses synthetic records and a known test-only field key. It is not a template for production key management. No real customer data, provider verification, email or CRM write occurred.
- Superseding fix: PgStore.commitIntake writes submission, optional audit job and event in one PostgreSQL transaction and updates cache only after COMMIT. Failure rolls back all three; retries can repair a missing legacy job. Independent single-process review passed, then its cross-campaign recovery finding was fixed and the focused regression passed. Full worker suite:41 passed/1 database skip; separate disposable PostgreSQL rollback/retry/restart verification passed. Rate-limit counts remain outside the transaction. Subsequent PgStore read-through now refreshes the claimed intake and campaign, decoding and decrypting DB rows; two independent-store regression checks passed against a shared fake database. September24 real disposable PostgreSQL check passed with two independent stores and initial cache misses: campaign/submission/suppression read-through and processIntakeAuditJob lookup succeeded. Synthetic suppression stopped before scan/report/delivery; this is not end-to-end delivery or production acceptance. See READTHROUGH-POSTGRES-REHEARSAL-2026-09-24.md; container stopped and removed.

## Mac's September23 delivery direction

Mac's [18:13 Eastern Slack message](https://momentum3d.slack.com/archives/C1CFQBC79/p1790201627631859) accepts the existing Leads Sheet, with Zapier routing to CRM/email, Claude for analysis, Momentum Digital branding and a final next-steps/why-hire-us CTA page. LEADS-SHEET-MAP.md now identifies the existing Momentum-Website-Leads workbook and its tabs. The exact destination tab/additive field schema, writable credential, Zap mapping, recipient routing and delivery acceptance remain unverified. Preserve the existing six-field request and obtain sandbox readback before enabling any sends.

## September24 staging implementation update
- Existing Tailscale Serve route added on private tailnet HTTPS8446 -> loopback4343. TLS validates without exceptions; other443/8443/8444/8445 mappings retained. App readiness remains separate from proxy readiness.
- Parsed POST bodies now share a64KiB limit before intake/QA/webhook processing. Focused regression exercised fixed-length and chunked rejection on all3routes; normalform/health remainedavailable. Stagingflag adds synthetic-only notice; exactMomentumPNGlogo reused from reportasset.
- Actual Cloudflare Siteverify endpoint tested via existing captchaAdapter with Cloudflare's published dummy keys: validtokenaccepted, rejectedtestkeyrefused, wronghostname refused. Receipt: turnstile-sandbox-receipt.json; rerun: node --experimental-strip-types verify-turnstile-sandbox.cjs. No realcustomerdata orproductionwidgetkeyused. This is provider sandbox verification, notproductionhostname acceptance. Officialreference: https://developers.cloudflare.com/turnstile/troubleshooting/testing/ .
- Existing PGcompose supports scopedcredential/database/volumenvsettings and binds127.0.0.1 only. Durable stagingrunner/fullflow acceptance subsequently passed; see the dated September24 verified private staging acceptance below.
- Repo-wide mandatedSecondBraincheck:9errors/683warnings outside radar-engine edits; no unrelatedvaultcleanup undertaken.

## September24 verified private staging acceptance
- Private HTTPS https://desktop-4ahkec4.tailade026.ts.net:8446 is healthy with valid TLS; /intake is browser-visible. It is Tailscale Serve on this Windows host, not a public production endpoint. Node binds127.0.0.1:4343 and PostgreSQL binds127.0.0.1:5433; volume aegis_radar_staging_pg persists DB data. Application reboot recovery is not yet verified.
- staging-flow-receipt.json at2026-09-24T15:50:40.384Z: pass:true; invalid POST400, accepted POST303, persistent job succeeded, QA approval303, report200. Report was inaccessible before approval. Scanner uses only a local fictional fixture; no real business audit was performed.
- Email sent:false/dryRun:true and CRM liveWrite:false/written:false. These establish disabled delivery behavior only; providerDeliveryVerified:false. Existing Zap123578416 requires account sign-in before field-map and recipient verification.
- CMS-DRAFT.md records saved draft29608 revision29613 and browser-verified CTA navigation to private staging. Original5894 unchanged.
- Actual Cloudflare dummy-key provider proof is already recorded separately; production widget keys/hostname/browser verification remain absent. Do not expose the CAPTCHA-off synthetic runner publicly.
- Remaining public release dependencies: approved production host and durable process recovery, verified production CAPTCHA, exact Zap field/recipient mapping and actual sandbox delivery, final production content review and rollback. Latest authority is draft/stage only; earlier release authorization is superseded. Synthetic acceptance does not satisfy these dependencies or authorize publication.
- Backup/restore PASS at2026-09-24T16:01:54.954Z: stage-restore-receipt.json. PostgreSQL custom dump57617bytes saved privately, SHA256 3f086278079992444c459232c2181fa3ed8e1ce9cd4b21772367fa79d1a1ec84. Restored into a new disposable database; all10key table counts match, including1intake/1job/1report/14events/13evidence items. Disposable database removed; original staging DB/app preserved. This verifies synthetic PostgreSQL backup restoration, not production hosting or app reboot recovery.
