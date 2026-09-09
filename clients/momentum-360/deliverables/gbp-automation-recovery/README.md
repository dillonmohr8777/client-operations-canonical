# Momentum GBP recovery pilot

Local implementation only. Not installed, not an end-to-end repair, and not a public posting tool.

## Files and proof

- `m360-gbp-pilot.php`: disabled-by-default WordPress plugin exposing administrator-only `POST /wp-json/m360-gbp-recovery/v1/draft`.
- `test-pilot.php`: 36 passing offline checks using fake WordPress and provider APIs. Run `php -l m360-gbp-pilot.php` and `php test-pilot.php` with PHP 8+.
- `verification.json`: runtime, hashes, independent review result, limitations, and sanitized live Google Cloud findings.
- `STATUS.md`: recovered live implementation and source-linked remaining work.

Ponytail guided a small native WordPress pilot, not a second platform. The patch keeps the provider key server-side and requires an administrator, WordPress REST nonce, and one explicitly configured HTTPS installation. Generation is draft-only, four supported post types, one site-wide batch per minute. Error bodies and provider credentials are not returned. Model output still needs human factual review and safe frontend rendering.

## Staging installation prerequisites

1. Recover authorized WordPress/SiteGround access and inspect the authoritative source snippet and existing plugins. Back them up before changes. Do not edit SiteGround's generated combined JavaScript file.
2. Confirm PHP 8+ and test actual WordPress cookie/nonce behavior, database claim concurrency, host timeouts, and provider response behavior in staging. Offline doubles do not establish these properties.
3. Install only the plugin PHP file through the approved workflow, initially disabled. Do not upload the offline test harness or local runtime into public web space.
4. Provision `M360_ANTHROPIC_API_KEY` through protected server configuration. Never paste a real value into a command, chat, source file, browser, or this document. Use the credential owner's approved rotation process for the exposed browser key; it has not been rotated.
5. Configure `M360_GBP_PILOT_ORIGIN` to the exact verified WordPress `home_url()` origin. Production public URL currently uses `www`, while the historical Google client uses the bare domain. Resolve this intentionally, not by treating the two origins as interchangeable.
6. Only after staging verification, set `M360_GBP_PILOT_ENABLED=1`. Unset it or use `0` to disable immediately. This flag cannot be enabled from the browser.
7. Build an administrator-only adapter using a freshly generated `wp_rest` nonce in `X-WP-Nonce`; send JSON `businessName`, `businessType`, `facts`, `postType`. Render response text with text nodes, not `innerHTML`, and add event listeners rather than inline handlers. Never embed the provider key. Public multi-client onboarding requires a separately verified authorization and quota design.
8. Remove the original direct-provider browser code in its authoritative source, fix the independent image call, inspect image-route access controls, and regenerate SiteGround cache. Confirm the old exposed credential is absent from all current public assets and separately revoked by its owner.

## Google integration remains unfinished

Existing project: `momentum-360-489301`, project number `150963436905`, visible to `dillonmohr8777@gmail.com`. Existing web client: **Momentum 360 GBP Connect**, created March 4, 2026.

Registered callback: `https://momentumvirtualtours.com/wp-json/m360/v1/oauth/callback`. This is an existing Google configuration value, not proof that the route exists. The earlier Slack `/gbp-automation/auth/callback` URL was only a proposal. Read-only callback navigation was blocked by the browser client; no successful route response was obtained.

As inspected September 4 EDT: no GBP API among 22 enabled APIs; external app in Testing; zero test users; no configured scopes; console reports incomplete branding. Home-page, privacy-policy, and terms-link fields are blank. Google also warns that the OAuth client has been unused for five months and may be deleted if unused for 30 more days. No keepalive, client creation, credential creation, consent, or configuration change was performed.

Before integration, verify API-access approval, precise backend ownership, exact verified business/location, accepted privacy/retention commitments, scopes, callback origin, CSRF state handling, secure isolated token storage, refresh/revocation, and client opt-in. The pilot implements none of these and must not be promoted as automation. Google publishing and a controlled post require the concrete authorized destination and reviewed content.

## Boundaries and rollback

No live files were changed. No OAuth authorization or post occurred. No message was sent to Sean because the requested end-to-end completion condition is unmet. The design-system task owns `clients/momentum-360/design-system`; this task owns this recovery folder.

For a later approved staging install, keep a copy of the original source and database snapshot. Disable the pilot via its environment flag or deactivate its plugin to stop this new route. Credential revocation is not reversible and must be coordinated with its owner. Do not roll back to an exposed browser key.
