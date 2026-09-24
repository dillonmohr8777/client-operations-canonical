# Momentum backend and access map

Research date: September 4, 2026, America/New_York. Source messages were retrieved from authorized Slack/Gmail access during this task. Their original dates are preserved below. These establish the working access trail; current hosting dashboard membership and WordPress administrator rights have not been verified.

## Need Momentum / Momentum Digital

Site: https://www.needmomentum.com/

**Start with Obaidullah Shaikh (Obaid); escalate to Mac Frederick.** Obaid is the strongest evidenced technical access contact. Mac is the owner-side route. Obaid's current ability to issue Dillon an invitation still needs direct confirmation.

| Finding | Source |
| --- | --- |
| Mac says Obaid manages their SiteGround | [April 6, 2026, #momentumsites](https://momentum3d.slack.com/archives/C1CFQBC79/p1775490665166659) |
| Eric asks Obaid for Need Momentum backend access | [June 2, 2026](https://momentum3d.slack.com/archives/C1CFQBC79/p1780429428983839) |
| Mac assigns WordPress plugin administration to Obaid | [July 8, 2026](https://momentum3d.slack.com/archives/C1CFQBC79/p1783515328555759) |
| A wp-admin login problem is routed to Obaid | [August 24, 2026](https://momentum3d.slack.com/archives/C1CFQBC79/p1787590001321749) |

Technical evidence supports **WordPress and SiteGround**. The content-builder state is mixed: Mac's [June 30 direction](https://momentum3d.slack.com/archives/C1CFQBC79/p1782855410399249) was Elementor for internal/design pages, with blogs moving from WPBakery to Gutenberg/default. [August 26 builder questions](https://momentum3d.slack.com/archives/C1CFQBC79/p1787787323634759) and a [staging question](https://momentum3d.slack.com/archives/C1CFQBC79/p1787791640758209) mean that completion and staging availability must not be assumed.

Admin route referenced in the source: `https://www.needmomentum.com/wp-admin/`. WordPress appearance/Elementor/global-template permission has not been tested for Dillon. The active theme, Elementor kit, custom CSS owner, plugin versions, staging hostname, and backup owner remain unverified.

### Draft for Obaid, with Mac as escalation — not sent

Hey Obaid, I'm building out a reusable Momentum design system so our website, presentations, and client materials stay consistent. Could you get me an individual WordPress invite for needmomentum.com and point me to the staging site? I'll need to review the current theme, templates, global colors and fonts, and the Elementor, WPBakery, and Gutenberg setup. Please send the invite to my existing Dillon work account and let me know who owns the SiteGround staging and backup workflow. Thanks!

The recipient account for any invitation should be confirmed against the existing work identity before sending. Do not send shared credentials in the conversation.

## Momentum 360 / MVT

Site: https://www.momentumvirtualtours.com/

**Coordinate Jason Fallon or Sean Boyle with Muhammad U, the active website developer.** Jason has historical evidence of granting website access. Muhammad is evidenced doing website work today. These are stronger routes than assuming earlier implementers still have access.

| Finding | Source |
| --- | --- |
| Jason states he gave a colleague website access | [March 4, 2026, #m360-website](https://momentum3d.slack.com/archives/C06CL0R09A4/p1772650228398029) |
| Sean identifies SiteGround hosting | [April 16, 2026](https://momentum3d.slack.com/archives/C06CL0R09A4/p1776354077863399) |
| Muhammad describes WordPress caching work with WP Rocket and SiteGround | [April 17, 2026](https://momentum3d.slack.com/archives/C06CL0R09A4/p1776416495319479) |
| Muhammad is identified as website manager | [June 9, 2026](https://momentum3d.slack.com/archives/C06CL0R09A4/p1781023570774369) |
| Muhammad reports the About-menu fix and portfolio work | [August 20, 2026](https://momentum3d.slack.com/archives/C06CL0R09A4/p1787233511435159) |
| Muhammad reports current M360 website work | [September 4, 2026](https://momentum3d.slack.com/archives/C06CL0R09A4/p1788530109178009) |

Technical evidence supports **WordPress and SiteGround**. The active theme, exact page builder, current caches, site-wide design settings, staging, and Dillon's current CMS role remain unverified. Do not use the separate M360 Orbit or Signal prototype as the corporate website's theme source.

### Draft for Jason/Sean, coordinated with Muhammad — not sent

Hey Jason and Sean, I'm building the shared Momentum design foundation and want to include the current Momentum 360 website properly. Could you coordinate an individual WordPress invite and the staging URL with Muhammad? I want to audit the actual theme, templates, brand assets, forms, and global styles so the system matches what the site uses today. It would also help to know who owns the SiteGround backup and release process. Thanks!

## Google Cloud and GBP OAuth coordination update

Reconciled September 5, 2026 at 01:48:24 UTC (September 4 in America/New_York), from the recovery folder's [verification.json](../deliverables/gbp-automation-recovery/verification.json), verified there at 01:43:03 UTC, and its final status receipt. Source: coordinating recovery thread `01a06ec8-d989-7d90-9618-43b7a355e926`. These local receipts were read here; Cloud settings were not independently rechecked by this design-system thread. The earlier 01:42:51 UTC observation is preserved in `evidence/gbp-cloud-coordination-20260905T014251Z.json`; the final reconciliation is recorded separately in `evidence/gbp-recovery-final-coordination-20260905T014824Z.json`.

| Non-secret field | Reported observed value |
| --- | --- |
| Authenticated Google Cloud identity | `dillonmohr8777@gmail.com` in the Codex in-app browser |
| Existing project name | `Momentum 360` |
| Project ID | `momentum-360-489301` |
| Project number | `150963436905` |
| Enabled API inventory | 22 enabled APIs; no Business Profile APIs in the inspected list |
| Existing OAuth client name | `Momentum 360 GBP Connect` |
| Client type | Web |
| Creation date | March 4, 2026 |
| Authorized JavaScript origin | `https://momentumvirtualtours.com` |
| Exact registered redirect URI | `https://momentumvirtualtours.com/wp-json/m360/v1/oauth/callback` |
| Audience and publishing state | External / Testing; 0 test users |
| Configured scopes | 0 |
| Branding | Incomplete warning; application homepage, privacy-policy link, and terms-of-service link blank |
| App name / authorized domain | `Momentum 360` / `momentumvirtualtours.com` |
| Cloud warning | Client unused for five months; subject to deletion in 30 days, as displayed during the recovery inspection |

The registered origin and callback omit `www`. Preserve their exact host and path; the observed WordPress login uses `www`, so any production integration must deliberately resolve the canonical origin rather than treating the hosts as interchangeable. This is the observed OAuth configuration, not proof that a callback is deployed, that its handler works, or that GBP consent, refresh, account/location binding, or posting works. The callback navigation returned `ERR_BLOCKED_BY_CLIENT` before useful route evidence: deployment remains **unverified, not proven absent**. GBP API approval also remains unverified. Do not substitute a historical example callback URL.

No Google configuration changes, consent, secret reads, or production mutations were reported in this Cloud inspection. The recovery thread's final receipt records a disabled, admin-only server draft with 36 passing offline checks and independent confirmation. Those checks use WordPress/provider doubles, zero network calls, and no real credentials; they do not establish real WordPress authentication, database concurrency, hosting compatibility, or provider integration. The pilot is not installed, its front end is not adapted, the exposed key has not been rotated, Google is not connected, nothing has been posted, and Sean has not been messaged. That pilot is owned by the recovery thread and is not a design-system or production backend dependency. **End-to-end recovery is incomplete; no completion message to Sean is authorized by this receipt.**

### Recovered public implementation and source-location limits

The recovery folder's [STATUS.md](../deliverables/gbp-automation-recovery/STATUS.md), read during this coordination update, documents a recovered **generated cache bundle**:

`wp-content/uploads/siteground-optimizer-assets/siteground-optimizer-combined-js-45f63957564ea999184604a3b332228d.js`

It identifies public generator entry points `window.m360Generate` and `window.m360Copy`, a browser-direct Anthropic text-generation flow, and a same-site image route `POST /wp-json/ai-image-generator/v1/generate`. The authoritative WordPress source snippet and the image route's server implementation/permission checks remain uninspected. Do not edit the generated cache bundle directly.

The recovery report identifies a publicly exposed provider credential and unsafe output handling; no credential value is stored here. Source preservation, server-side migration, credential-owner remediation, and GBP implementation stay with the recovery thread. Its current source of truth is `clients/momentum-360/deliverables/gbp-automation-recovery/`; this handoff provides references only.

## Access and live-read limits

- At the September 5 01:25 UTC refresh, Access Broker contained Momentum HubSpot and CallRail entries, but no verified WordPress/SiteGround mapping for these websites. The separately authenticated Google Cloud session reported above does not establish WordPress/SiteGround membership. This is not a claim that no credentials or memberships exist elsewhere.
- Public browser inspection of Need Momentum reached a robot/security challenge. Plain public HTTP checks of both homepages returned challenge responses with HTTP 202. No challenge was solved or bypassed; these responses do not reveal the active theme. The local result is recorded in `evidence/public-sites.json`.
- The recovery thread's later Momentum 360 check reached a normal, empty WordPress login form in both Chrome and the in-app browser at `https://www.momentumvirtualtours.com/login-bypass-secured928592/`. The earlier Chrome challenge cleared without bypass; neither browser recovered an authenticated WordPress session. Its bounded Access Broker recovery found no exact secure Momentum WordPress `bw://item` locator. A visible login form is not backend access, and this later M360 observation does not clear the separate Need Momentum challenge.
- Public text retrieval remained available and today's local deck source ledger provides useful site evidence. Neither establishes logged-in backend access.
- The existing HubSpot portal `50612503` belongs to the Momentum/Jason route, but CRM access does not establish WordPress or hosting access. The Need Momentum homepage also exposes a 17hats audit destination; verify current form routing in the actual CMS before connecting it to any CRM.
- No WordPress/SiteGround account was created, no role or permission changed, and no access request was sent during this audit.

## September 23 NeedMomentum login refresh

- Verified current protected login: `https://www.needmomentum.com/momentumob123/`; it rendered the NeedMomentum WordPress login form. `/wp-admin/` redirected to `/404/`.
- Route source: [June 2 Momentum Sites message](https://momentum3d.slack.com/archives/C1CFQBC79/p1780430074943409). Existing shared-account source: [Obaid's pinned June 2 message](https://momentum3d.slack.com/archives/C1CFQBC79/p1780430370576279). Credentials are not copied here.
- Dillon authorized finding and using the existing login. One submission was made in the in-app browser. After a temporary browser timeout, the authenticated WordPress dashboard and page/form editors were verified under Obaid. Login is **confirmed**; hidden tab 5 was preserved for continued work.
- SiteGround opened a logged-out screen. No account creation, password reset, or permissions change was made; Mac was not contacted.

Once access exists, verify the exact site and role, inspect templates and globals without editing, confirm staging and reversible release workflow, then record only non-secret access metadata through the approved Access Broker mechanism. That is the remaining gate for a production-grounded website design-system implementation.

