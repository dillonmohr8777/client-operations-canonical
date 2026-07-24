# Jeanne Walcroft Legacy Foundation Stripe activation handoff

Date: 2026-07-24
Owner: Momentum 360
Requested by: Sean

## Current verified state

- Production site: `https://jeanne-walcroft-legacy-foundation.netlify.app`
- Production site returned HTTP 200 on July 24, 2026.
- Stripe Checkout supports one-time and monthly contributions from $5 to $25,000.
- Card details are handled only by Stripe-hosted Checkout.
- Checkout return status and webhook signature verification are implemented.
- Production remains fail-closed: the health route reports `configured: false` and `mode: unconfigured`.
- Netlify production currently contains `PUBLIC_BASE_URL` and `STRIPE_ALLOW_LIVE`.
- `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are absent.
- The authenticated Stripe identity resolves to the unrelated `Cactus Practice` business.
- No Jeanne Walcroft Legacy Foundation Stripe account or approved `bw://item/<guid>` locator is available.
- The unrelated Stripe business was not changed.

## Verification completed

- Local Netlify build passed.
- JavaScript syntax checks passed.
- Automated integration tests cover:
  - fail-closed unconfigured mode
  - explicit live-mode gate
  - one-time Checkout Session creation
  - monthly subscription Checkout Session creation
  - same-origin checkout protection
  - valid webhook signature acceptance
  - stale webhook signature rejection

## Sole remaining activation gate

A human authorized to represent The Jeanne Walcroft Legacy Foundation must create or authenticate its dedicated Stripe business and complete Stripe's identity, business, banking, tax, terms, and any CAPTCHA or MFA steps.

After that:

1. Save the foundation Stripe login in the approved `pollotharuler@gmail.com` Bitwarden vault and register only its opaque `bw://item/<guid>` locator.
2. Create a restricted production key with the minimum permissions required for Checkout Sessions and session retrieval.
3. Create a Stripe webhook endpoint at:
   `https://jeanne-walcroft-legacy-foundation.netlify.app/.netlify/functions/api?route=stripe-webhook`
4. Subscribe it to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, and `checkout.session.async_payment_failed`.
5. Store `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in the site's protected Netlify production environment.
6. Confirm `STRIPE_ALLOW_LIVE=true` only after the foundation account identity is verified.
7. Redeploy, confirm the health route reports live mode, and run one low-risk live donation test with webhook and receipt verification.

Do not use the `Cactus Practice` Stripe account for this foundation.
