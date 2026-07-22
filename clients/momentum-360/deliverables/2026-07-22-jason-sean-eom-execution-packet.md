# Jason and Sean EOM execution packet

Verified: 2026-07-22

## 1. Chatbot

Status: **built; current anonymous public verification blocked by SiteGround**.

- Jason/Momentum HubSpot token is valid for portal `50612503`.
- The existing Momentum agents application production build passes on Next.js 15.5.20. Routes `/`, `/api/ask`, `/api/chat`, `/api/geo`, `/api/lead`, and `/api/route` compile.
- The HubSpot live-chat rollout and knowledge package already exist. Prior browser evidence proved the widget can fully render when SiteGround does not intercept the request.
- A fresh 2026-07-22 anonymous check was redirected to `/.well-known/captcha/` and returned the SiteGround Robot Challenge Screen. It did not reach the page, so it neither proves nor disproves current widget execution.

Remaining exact action: use a logged-in human browser or SiteGround allowlist/cache path to perform one fresh homepage load and confirm the HubSpot iframe reaches `loaded=true`. Do not change the chatflow or automated copy during verification.

## 2. CallRail after-hours and SMS

Status: **implementation-ready decision packet; account mutation and sending remain approval-gated**.

Current known boundary:

- HubSpot contains CallRail-style attribution and call records, but no current evidence identifies the exact CallRail account, eligible tracking numbers, business-hours schedule, SMS sender, or compliance owner.
- The existing open-loop artifact correctly requires trigger, copy, opt-out, routing, suppression, test, rollback, and ownership decisions before activation.

Required configuration contract:

| Field | Required value |
|---|---|
| Account | Exact authorized CallRail account ID |
| Numbers | Exact tracking numbers eligible for after-hours response |
| Trigger | Missed inbound call, voicemail, or both |
| Hours | Timezone and weekly business-hours schedule |
| Delay | Minimum delay before the response |
| Suppression | Existing conversation, repeated caller, DNC, opt-out, spam, and emergency handling |
| Copy | Approved first response and fallback |
| Opt-out | Approved STOP language and compliance owner |
| Routing | Human owner, HubSpot owner mapping, escalation, and booking link |
| Test | Approved test numbers and success criteria |
| Rollback | Disable switch, audit locator, and owner |

No activation is safe until every row is filled and Dillon approves the exact account-changing action.

## 3. Internal Agent workflows and setups

Status: **local Slack command intake built and tested; Slack OAuth and sole-writer deployment remain**.

Artifact: `clients/momentum-360/deliverables/2026-07-22-slack-ai-command-intake/`

Verified behavior:

- Exact workspace, user, shared-channel, and client allowlists.
- Shared-channel and DM command syntax.
- Slack timestamp replay deduplication.
- External/action-changing wording is flagged for approval.
- Unauthorized users fail closed.
- Four local assertions pass.
- Output uses the existing Agent OS `task.json` contract; the existing sync remains the only redacted intake path and Marketing Chief remains the only Canonical Queue writer.

Remaining exact action: reconnect Slack OAuth on the sole-writer desktop, populate the runtime-only allowlist with verified IDs, connect the Slack event receiver, and run the four production canaries before team enablement.

## EOM completion truth

- Chatbot: build complete; one human-session public verification remains.
- CallRail/SMS: design and guardrails complete; exact account decisions and activation approval remain.
- Internal Agent: local adapter complete; OAuth, sole-writer installation, and production canaries remain.

No Slack message, SMS, CallRail change, HubSpot workflow change, publish, deployment, or account mutation was performed.
