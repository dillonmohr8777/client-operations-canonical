# Page 5894 — audit page repair draft

**State:** Copy repair saved and previewed in unpublished clone29608; see CMS-DRAFT.md. Page5894 remains live and unchanged. Its saved body is WPBakery copy with no working main form. Its current offer promises an audit “in minutes.” The draft removes that promise and the duplicate body H1. Original page title: **Free Website SEO Audit**. Preserve the original URL, SEO title, metadata, and official logo on release. Form integration remains pending.

## Proposed replacement copy

**Heading hierarchy:** Retain the theme's existing H1, “Free Website SEO Audit.” Change the body offer heading from H1 to **H2: Request a website & search visibility audit**. The September23 browser read confirmed two H1s; do not add another.

**Body:** Request a focused review of your public website. We’ll check website quality, SEO, answer-engine readiness, and conversion signals, then prepare up to three evidence-based observations and one suggested next step. This review uses public website information; it does not include private analytics, Search Console, CMS, or advertising-account data. Each request enters human report review before delivery. There is no promised turnaround time.

**CTA:** Get my free website + search visibility audit

**Form heading:** Request your audit

**Fields (all required):** Name; Phone number; Email; Website; Brief business description; Goals.

**Required consent:** “I’m requesting a one-time audit of the public website above. Please email the report to me and call me once to review it.” Link the approved privacy notice. Keep any marketing consent separate, optional, and unchecked.

**After accepted submission:** “Thanks. We’ve received your audit request. Your report is awaiting review.” Show the non-PII receipt identifier only after durable intake acceptance. Keep names, contact details and business descriptions out of public token/status pages. Never say the report is ready while status is `qa_pending`. Add verified delivery/follow-up expectations only once those integrations pass their release checks.

## Apply and verify (draft-first)

1. Before enabling the audit CTA or publishing, require the audit service’s public HTTPS `/intake` endpoint and delivery/CRM integrations to be deployed and confirmed. They are currently missing or dry-run; the local intake produces `qa_pending`. Copy-only draft preparation can proceed. Until release acceptance, leave the published page unchanged and do not expose a localhost endpoint.
2. Clone WordPress page **5894** into an unpublished draft before editing; capture original content and relevant metadata for rollback. A published page's Update button writes live, so do not use it for staging. Replace only the audit-offer copy and heading level; retain the intended original permalink in the release mapping, SEO title/metadata, official logo, and unrelated content.
3. The supplied `elementor-audit-cta.html` is for an Elementor HTML widget, while page 5894 uses WPBakery. Do not paste it unchanged. Insert its accessible dialog/iframe CTA through the site’s approved WPBakery script-capable embed or shortcode path, configured to the verified HTTPS `/intake` URL. Confirm WordPress preserves the required script and modal behavior in preview; if it strips scripts, stop and use an approved integration point. Keep the external-tab form fallback.
4. Preview desktop and mobile. After the service owner enables a test flow, submit one approved test and verify the durable receipt, `qa_pending` state, and visible “awaiting review” message. Confirm no email/report delivery or CRM write is claimed from dry-run output. Publish only after the endpoint, consent text, and delivery path pass their release checks.

**Conversion rule:** Fire one lead conversion only after a real form POST is durably accepted and returns its receipt/status; never on CTA click, validation error, failed request, or duplicate replay. Keep report-delivery success separate and count it only after human QA approval and provider-confirmed delivery.

**Readback / rollback:** After any approved publish, read page 5894 back in WordPress and the public page; confirm URL/title/logo, copy, six fields, working submission and success state, and removal of the obsolete audit block. If any check fails, restore the saved revision and verify the public page again.
