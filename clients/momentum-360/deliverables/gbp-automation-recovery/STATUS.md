# GBP automation recovery

Status: local disabled server-side pilot built and independently reviewed; 36 offline checks pass. Live repair remains blocked on authenticated website access and incomplete Google app configuration. No website edits, Google authorization, or public posts performed.

## Verified September 4, 2026

- The public page at https://www.momentumvirtualtours.com/gbp-automation/ loads in the in-app browser.
- A synthetic test using business name `Example Test Bakery`, type `Bakery`, and the default seasonal post type returned `Error: model: claude-sonnet-4-20250514` in both `m360-results` and `m360-grid`. The button changed to `Regenerate`. Successful content generation is not verified. The error alone does not establish whether the cause is model availability, backend configuration, or provider access.
- The page exposes no Google connection control in its rendered interface.
- The WordPress login form loads in the in-app browser, but no authenticated admin session has been established.
- An earlier authorized Chrome login attempt encountered a site challenge. The latest September 4 EDT check now shows a normal empty WordPress login in both Chrome and the in-app browser, with no authenticated admin session. No challenge was bypassed. Secure recovery found no exact mapped Momentum WordPress Bitwarden item.

## Recovered live implementation

Read-only developer inspection recovered the JavaScript already loaded by the public page, without requesting a challenge bypass. Source: `wp-content/uploads/siteground-optimizer-assets/siteground-optimizer-combined-js-45f63957564ea999184604a3b332228d.js`. Do not edit this generated cache bundle directly; identify its source snippet in WordPress and regenerate the cache after repair.

- The generator is an inline IIFE exported as `window.m360Generate = generate` and `window.m360Copy = copy`.
- `callAI` sends the prompt directly from the visitor's browser to `https://api.anthropic.com/v1/messages` with the retired `claude-sonnet-4-20250514` model and the direct-browser-access header. There is no WordPress text-generation proxy in this flow.
- An Anthropic credential is embedded in the publicly delivered script. Its value has deliberately not been retained in this recovery artifact. Treat it as exposed; migration requires a server-side replacement and revocation of the exposed credential by an authorized credential owner. No credential rotation has been performed.
- The image flow already calls the same-site route `POST /wp-json/ai-image-generator/v1/generate` with `{prompt}` and expects `{image}`. Its server implementation and permission checks remain uninspected.
- The button calls `m360Generate(); generateAIImage();` independently. Image work can therefore start even if the text generator rejects empty business inputs. The image function does not catch network or JSON errors or check `response.ok`.
- The prompts expressly invent offers, events, changed hours, awards, and partnerships. These must become verified business inputs or clearly labeled illustrative drafts before any automated public posting.
- `renderCard` interpolates generated text into `innerHTML` and an inline copy handler without complete HTML/attribute escaping. Error messages are also inserted into HTML. Replace those paths with text nodes and event listeners before permitting model-generated content in the live interface.

The direct Anthropic route plus the documented model retirement now identifies the retired model as a concrete cause of generation failure. A model-only change would leave the exposed credential and unsafe rendering paths unresolved.

## Slack evidence

- February 13: the initial deliverable was described as a functional prospect demo; full backend automation could require developer work. https://momentum3d.slack.com/archives/D0A6ECLQ0S1/p1771029412873449
- March 11: Sean requested automatic GBP posting after opt-in. https://momentum3d.slack.com/archives/D0A6ECLQ0S1/p1773231045538289
- May 5: Dillon identified Google OAuth as the integration bottleneck. https://momentum3d.slack.com/archives/C0B1Y5ZB9GC/p1778011630283249
- May 6: Obaid asked about callback implementation, hosting, token storage, agency app registration, privacy policy, and expected client scale. He subsequently suggested Supabase for token storage. https://momentum3d.slack.com/archives/C0B1Y5ZB9GC/p1778057900638359
- May 7: Dillon asked for direction on locating the callback URL. No completion evidence was found in the reviewed exchange. https://momentum3d.slack.com/archives/C0B1Y5ZB9GC/p1778176675493039
- August 10: Muhammad supplied replacement website-access information after Dillon reported the old login failed. Credentials are intentionally omitted. https://momentum3d.slack.com/archives/C0BAWLY6MKR/p1786345593891559

## Required next work

Anthropic's official model lifecycle documentation lists `claude-sonnet-4-20250514` as retired on June 15, 2026 and recommends `claude-sonnet-4-6`: https://platform.claude.com/docs/en/about-claude/model-deprecations . The recovered code uses the direct Anthropic API, so that retirement schedule applies. Verify the replacement with the authorized server-side account after migration.

Access was rechecked after three goal turns: the in-app browser still opens an empty WordPress login form. The secure credential bridge has no mapped exact WordPress item in the inspected Access Broker client record, and no authenticated admin session has been recovered. Resume after an authorized login or usable secure credential route is available.

1. Establish authenticated WordPress access through an authorized existing session or secure autofill.
2. Preserve the source snippet, migrate text generation to a server-side route with appropriate abuse controls, remove browser credentials, update the retired model, and repair unescaped output handling. Coordinate credential revocation with the authorized owner.
3. Complete the inspected existing Google app configuration after verifying exact backend ownership and deployment. See the live findings below; historical storage proposals are not deployed architecture.
4. Implement and verify the authorization callback, CSRF protection, exact account/location binding, encrypted server-side refresh-token storage, refresh/revocation handling, and isolation between clients.
5. Verify content generation and prepare a single controlled post for the exact authorized GBP location. Public posting remains subject to approval of the concrete destination and content.

Completion requires successful authenticated integration and verified behavior, not merely a public landing page or a local implementation.

## Resume findings: September 4, 2026 EDT (September 5 UTC)

Google Cloud is authenticated in the in-app browser as `dillonmohr8777@gmail.com`. The existing **Momentum 360** project is `momentum-360-489301` (number `150963436905`), not the separate radar or calendar project.

- [Enabled APIs](https://console.cloud.google.com/apis/dashboard?project=momentum-360-489301): 22 APIs, none for Business Profile. API approval/quota is not verified.
- [OAuth clients](https://console.cloud.google.com/auth/clients?project=momentum-360-489301): **Momentum 360 GBP Connect**, web application, created March 4, 2026. Console warns it has been unused for five months and is subject to deletion if unused for the next 30 days.
- Saved JavaScript origin is `https://momentumvirtualtours.com`. Saved redirect is `https://momentumvirtualtours.com/wp-json/m360/v1/oauth/callback`. Only these non-secret fields were inspected; no client secret was read. This differs from the proposed Slack callback. Browser navigation to the registered callback returned `ERR_BLOCKED_BY_CLIENT`; deployed route behavior remains unverified, not proven missing.
- [Audience](https://console.cloud.google.com/auth/audience?project=momentum-360-489301): External, Testing, zero test users. Console explicitly reports incomplete OAuth configuration and directs completion of Branding.
- [Data Access](https://console.cloud.google.com/auth/scopes?project=momentum-360-489301): no configured non-sensitive, sensitive, or restricted scopes.
- [Branding](https://console.cloud.google.com/auth/branding?project=momentum-360-489301): app name Momentum 360, authorized domain momentumvirtualtours.com, support/developer contact dillonmohr8777@gmail.com. Home-page, privacy-policy, and terms links are blank. No settings were saved.

The nearby design-system task has no recovered authenticated backend either. Its access handoff identifies Muhammad as the current Momentum 360 developer, coordinated through Jason/Sean. NeedMomentum's Obaid/Mac lane must remain distinct.

`m360-gbp-pilot.php` is a native, disabled, administrator-only server draft route. Independent QA identified an initial rate-claim race; the implementation was corrected to prepared `INSERT IGNORE` and conditional expiry `UPDATE`, and 36 offline tests plus syntax validation independently passed. These mocks do not prove actual WordPress auth, concurrent database requests, hosting compatibility, or provider responses. See `README.md` and `verification.json`.

The live browser credential remains exposed until the original source is removed and its owner rotates it. The public frontend, image endpoint, Google OAuth/token storage, and posting flow remain unchanged. Sean has not been messaged: the user's requested condition was verified end-to-end completion.
