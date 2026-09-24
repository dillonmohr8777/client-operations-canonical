# Momentum access invitations — September 20, 2026

State: PREPARED / NOT SENT. User authorized full Momentum access for both recipients and Slack delivery. No accounts, permissions, network grants, or Slack messages were changed.

| Recipient | Verified Momentum Slack identity | Verified email |
| --- | --- | --- |
| Jesse DiLaura | U0BEKTY2CQL | jessedilaura27@gmail.com |
| Melissa Rigby | U08FZ255F19 | melissadianer@gmail.com |

Both exact profiles were read live in the Momentum Digital Agency workspace. Neither email exists in the deployed DeerFlow users table.

## Actual access blockers

1. The deployed project API/repository enforces creator ownership. Organization tables are additive groundwork; no supported team invitation/membership API provides access to this existing project. Creating an admin or ordinary login alone does not grant this workspace.
2. The app is hosted at the private Tailscale endpoint on port8443. The current network policy allows all source/destination ports. The same machine serves other apps on443 and8444, so a default machine share would expose more than the requested Momentum app.

## Prepared next action

Preferred: implement and verify shared Momentum project membership plus individual invitation/account onboarding, preserving separate user identities and denial for unrelated users. Restrict external network access to this machine's TCP8443 before issuing single-recipient invitations. Browser-based network access expansion requires action-time confirmation under the computer-use tool's policy; existing user authorization already covers sending the final working invitations through Slack.

Alternative presented to Dillon: individual accounts with separate copies of the current47document Slack knowledge project. This would not be the same shared workspace and must not be represented as full access to Dillon's project.

After the chosen access path is working, send one Slack DM per verified user with their personal onboarding link, app URL, and any required Tailscale acceptance step. Do not send owner credentials, a shared owner session, or a message claiming access exists before it has been verified. Read back each sent message and save its channel/timestamp/permalink.
