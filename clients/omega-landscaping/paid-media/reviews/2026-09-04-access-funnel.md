# Omega access and funnel audit — 2026-09-04

Scope: read-only inspection of the actual Search destination, `https://www.omegalandscapingandconcrete.com/`. No Google Ads changes, site edits, form submissions, calls, messages, or queue writes were made.

## Decision-grade result

The primary destination is live (HTTP 200) and the Wix contact form renders with six required fields and a Submit button. Availability is not a hard restart blocker. The landing-page call path is broken: the published `719-896-0663` appears as text, but the rendered page contains **zero** `a[href^="tel:"]` links. Form delivery and successful-submit conversion firing remain unverified because this audit did not create a lead.

![Primary homepage at 1280×800](2026-09-04-primary-homepage.png)

![Visible Wix contact form and plain-text phone number](2026-09-04-primary-contact-form.png)

## Access state

- Canonical route: active client `omega-landscaping`; public platform is Wix, not WordPress.
- Access Broker JSON validated and maps this client to Wix Studio, Google Ads, GoHighLevel, and a Bitwarden secure-note reference. It contains no Omega WordPress system.
- Current authenticated Wix session/role: **unverified**. The July 30 registry observation says `Billing Manager` and `website-editing-not-authorized`; that is historical metadata, not proof of today's permission.
- Bitwarden bridge: `Status` returned locked at rest. The sanitized bridge resolved the opaque reference to secure-note metadata with no HTTPS host; it did not establish a Wix login or disclose a secret. The authorized vault identity remains `pollotharuler@gmail.com` per policy.
- Required repair access: a current session on the exact Omega Wix site with permission to edit page links/form behavior and manage the site's marketing integrations. MFA, passkey, CAPTCHA, recovery, or new consent would remain a human handoff.

## Live stack and breakpoints

1. **Wix native form.** Rendered form id: `form-8a433ef2-0fb1-4282-8933-a6e8eca4ebe8`. First name, last name, email, phone, subject, and project description are required. The live DOM exposes a homepage GET action and unnamed fields before Wix runtime handling, so successful delivery depends on Wix JavaScript. Do not infer a lead or conversion from a Submit click.
2. **Call path.** Three visible occurrences of `719-896-0663` were found in live source/DOM and none is a telephone link. This prevents a visitor from tapping the number to call and prevents a site `tel:` click trigger from firing.
3. **Measurement.** The rendered page loads Google tag `AW-16794883273` and GTM container `GTM-TRPJ69M7`. The public GTM container contains form-submit and consent-related code, but this does not prove the current Wix form emits the expected success event or that the correct Ads conversion label fires once. No conversion was triggered in this audit.
4. **Consent.** Privacy, terms, and cookie-policy links exist. No consent control was observed while the Google scripts loaded. Validate the container's Consent Mode defaults and regional banner behavior before treating measurement as privacy-safe.

Sources: live HTTP and rendered DOM inspections on 2026-09-04 ET; `AppData/Local/Codex/AccessBroker/registry.json`; sanitized Bitwarden bridge status/metadata; canonical `registry/clients.json`; live GTM container response. Historical Netlify landing-page tags were excluded from proof because Ads points to the primary Wix domain.

## Minimal rollback-ready repair

1. Verify current edit permission on the exact Omega Wix site. Save/duplicate the current site revision before changing anything.
2. In Wix, convert every visible `719-896-0663` element (contact block plus any header/footer occurrence) into `tel:+17198960663`, retaining the visible formatted number and adding an accessible call label. Publish, then confirm each link on desktop and mobile. Rollback: restore the saved Wix revision.
3. Leave form conversion logic unchanged until a controlled test is approved. In Wix, verify the exact form recipient and success behavior. In GTM Preview/Tag Assistant, submit one clearly labeled internal test, then confirm: Wix reports success, the recipient receives it, and exactly one current Google Ads form conversion fires **after** success. Obtain the current conversion action/label from the Ads owner; do not reuse the historical Netlify label by assumption.
4. If Wix emits no reliable success event, use the smallest deterministic fallback: redirect this form after success to a dedicated noindex Wix thank-you page and fire the current Ads conversion only on that page. Version the GTM container before publishing. Rollback: restore the prior container version and Wix form behavior.
5. After `tel:` links exist, verify a dedicated site-call click event in GTM Preview and the current Ads conversion action. Separately read back any Google Ads call asset; a call asset does not repair the website's plain-text number.
6. Verify Consent Mode defaults before tag initialization and updates only after the applicable Wix consent choice. Record Tag Assistant screenshots and event order as release evidence.

Launch posture: the site loads and offers a usable visual form, but website-call readiness is currently false and form delivery/conversion reporting is pending validation.
