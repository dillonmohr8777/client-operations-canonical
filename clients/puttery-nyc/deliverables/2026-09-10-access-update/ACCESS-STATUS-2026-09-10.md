# Puttery NYC access status — 2026-09-10 update

Written by The CEO during live Joe/Tom call + post-call. Supplements ACCESS-STATUS-2026-09-08.md (kept). Cite or do not claim.

## Cleared today / verified

| Surface | Status | Evidence |
|---|---|---|
| Tock Business Group 28086 / NYC Business 37824 | Operational | Prior Sep 8 verification; live relay status HTTP 200 |
| Tock reservation webhook + Data Exports | Operational | Dashboard + relay live |
| GTM account "Puttery" | **Accepted 2026-09-10** | Invite `1a08cd7eca5e2dd8`; Publish on web `GTM-KMZKBB3` and server `GTM-TDT2KKP9`; account role User |
| Meta / Facebook login | **Client-confirmed on call** | Dillon stated login works; exact Business Portfolio / ad account / Pixel IDs **not yet mapped in writing** |

## Still needed to integrate into the attribution dashboard

Dashboard current gate (live UI): **Tagged booking proof**. Reservation aggregates are connected; ad spend / visits / revenue / campaign matching remain pending.

1. **Google Ads** — Standard (min) user invite to `dillonmohr8777@gmail.com` on exact NYC customer ID. As of ~16:28 ET: **no Ads invite email** in mailbox yet (2FA mentioned on call). Google bills client card per engagement norms; we need conversion-setup visibility.
2. **GA4** — Editor on the authoritative property + exact web stream (user invite, not core login). **Update 2026-09-10 ~15:53 ET:** grant email from `dsbrandusa@gmail.com` (thread `1a08ce1d3e3f9e2c`) — access already granted; property name / Editor role / stream IDs still need live verification.
3. **CMS** — Editor/Publisher on NYC pages to verify GTM snippet placement, booking CTA/UTM path, consent. Public presence of GTM only proves container exists.
4. **Meta map** — Business Portfolio ID, NYC ad account, Page, IG, Pixel/Dataset, CAPI, verified domain (login alone is not the map).
5. **Toast** — Confirm NYC use; if yes, location reporting access + location ID.
6. **Tripleseat / CRM** — Confirm use + owners (public Tripleseat form observed only).
7. **Two NYC venue days** of reservation/payment/cancel/refund for reconciliation (secure share).
8. **Finance defs** — attendance, booking value, realized revenue, refunds, timezone.
9. **Consent owner** — permitted fields, retention, unsubscribe.

## Standing access rule (Dillon 2026-09-10)

Invite `dillonmohr8777@gmail.com` as a **user** on the property/account. **Never** share or use the core/owner password.

## Dashboard integration order (configure what we can)

1. Inventory GTM-KMZKBB3 / GTM-TDT2KKP9 tags + triggers (read-only first).
2. Once Ads + GA4 + Meta IDs are known: link conversion destinations; do not publish GTM without Dillon go.
3. Controlled consented tagged booking through site → GA4 → Tock.
4. Only then flip dashboard attribution gates from pending to validated.

## Signature

All Puttery client-facing email drafts/sends use Momentum live signature:
`clients/momentum-360/deliverables/2026-09-04-responsive-signature/gmail-live-signature.html`

## Crew / shared computer

Grok Bot agents share one computer (browser logins persist across agents). Cursor/Codex on DESKTOP-4AHKEC4 is separate and currently degraded per Dillon. The CEO owns Puttery e2e while Cursor is down. GT Clinic Plan Desk (`e7f527e6-15ec-4cb1-8a66-191fa7b9e6dc`) owns GT Clinic only.
