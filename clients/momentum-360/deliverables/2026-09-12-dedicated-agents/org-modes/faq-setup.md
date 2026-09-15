# Momentum Answers: team assistant setup

Updated September 15, 2026. State: LIVE; owner FAQ and role-draft acceptance verified.
Current evidence: faq-live-slack-check.json. Employee guide: ../TEAM-QUICKSTART.md.

## What employees can do

Ask for company processes, onboarding, templates and training with a source link.
The reviewed catalog has 23 entries from the AM Master Hub and shared training
resources. Linked videos/documents retain their current access permissions.
The bot does not pretend to know a recording's contents from its title.

The five existing role contracts power these commands:

| Command | Useful output |
| --- | --- |
| draft jason: ... | Lead review and sales follow-up draft |
| draft sean: ... | Operations plan, dependencies and decision packet draft |
| draft mac: ... | Reporting or revenue review draft; missing metrics stay missing |
| draft melissa-silber: ... | Production brief, asset count, next steps and missing inputs |
| draft melissa-rigby: ... | Delivery, milestone, review and acceptance plan draft |

Mention the bot again in the same thread to add details to a draft. Context is
separate for each channel, thread and employee. Use "ask: ..." to return to FAQ
questions, "modes" for help, and "stop" to suppress your pending replies in that
thread. A new message after stop starts a new request.

Generated drafts require review. They are not completed campaigns, CRM changes,
client deliveries, paid generation or approvals. The existing Workmate owner
operator and five-mode shadow runtime are preserved. This entry point does not
give every employee Dillon's operator authority.

## Implementation

- Reuses agent-contracts.json and the installed Workmate Python environment.
- Uses the installed local llama3.2:3b through loopback Ollama. No paid model API.
- No operator import, Codex subprocess, shell, filesystem or MCP tools for the model.
- FAQ generation selects reviewed passage IDs. Only the corresponding curated
  text and source links can leave the answer path.
- The canonical JSON SHA-256 must match the reviewed configuration before each request.
- Dedicated Slack app, exact team/app/bot identities and explicit channel allowlist.
- Public, internal, unshared channels only. Workspace humans accepted; guests,
  Slack Connect, bots, message edits and wrong-channel requests rejected.
- One model worker, bounded queue, durable event deduplication and persisted stop.
- Draft context stored under LOCALAPPDATA/Dillon/MomentumAnswers, not the repo.
- Ambiguous sends become UNCERTAIN and are never automatically replayed.
- POSTED means Slack acknowledged the message; live readback is a separate check.

## Source coverage correction

The old claim that nine local SOP files supplied complete process knowledge was
wrong. Most Facebook SOPs are empty outlines. The old Codex operator=False mode
also allowed workspace writes. Both assumptions have been removed.

The reviewed Master Hub contains real onboarding, Monday and Friday client
communication guidance, reporting templates, Agency Analytics training and task
organization. Some entries are unfinished, including the Friday template and
quarterly-report example. Unknown answers name Melissa or Dillon instead of
inventing policy. The AM Best Practices PDF points to an author's local file:
that broken link was excluded, while the two Loom recordings were retained.

## Slack authorization and installation

Review faq-app-manifest.json. App name: Momentum Answers. Workspace:
Momentum Digital Agency, T066HGS7N. Installed app: A0C23EC7TPB.
Approved team channel: #momentum-help, C0C2VSTBQ9W.
Verified channel bot member: U0C1L5T8F47 (bot B0C256VP1HS).

Bot scopes:
- app_mentions:read: receive explicit mentions.
- channels:read: verify an allowed public channel is internal and unshared.
- chat:write: return the requested answer in its source thread.
- users:read: reject guests, external identities and bots.

Events: subscribe to app_mention, not just its OAuth scope.
Enable Socket Mode; the app-level token needs connections:write.

1. Create the separate app from faq-app-manifest.json in the verified workspace.
2. The workspace administrator approves the OAuth scopes and installs the app.
3. Record app_id and bot_user_id in faq-config.json. Never use Workmate A0C2K8ZU6AU.
4. After explicit authorization, generate the separate app credentials and store
   them locally through the protected prompt or the existing one-use loopback
   credential form, bound to this app's MarketingChief-FAQ-* targets:
   ../Start-MomentumAnswers.ps1 -ConfigureCredentials
   This prompts for hidden values and stores them only in Windows Credential
   Manager under MarketingChief-FAQ-* targets. Do not paste secrets into chat.
5. Create or select the approved public internal FAQ channel, invite only this
   bot, and enter its exact ID in allowed_channels. Empty means no processing.
6. Set enabled=true only for the approved channel, then run the launcher -Start.
   Preflight verifies auth.test, bots.info, the configured app and local model.
7. A real team member mentions it with a training question. Verify the reply
   through Slack readback and the local ledger. Repeat in the same thread with
   a role draft and a follow-up. Test stop and a non-owner team member.
8. Only after acceptance, use -RegisterTask and Start-ScheduledTask
   Momentum360-TeamAnswers for automatic operation at user logon.

Following Dillon's confirmation and delegated computer setup, the separate app,
public internal channel and protected credentials are active. Independent Slack
readback verified the Monday FAQ and three-concept role draft. The Windows logon
task is Running. A delayed draft with an unsupported availability claim was
withdrawn and corrected. Fourteen offline groups pass after the live fixes.
A non-owner employee test remains unverified; no mass invitations were sent.

## Availability and operation

This host must remain on, signed in, connected to Slack and running Ollama.
The prepared task is independent of the Codex app but is NOT a 24/7 service.
A logon task does not solve sign-out or machine power loss. Production 24/7
operation needs an approved always-on host and its own installation check.
Do not move or broaden Workmate's credentials to solve availability.

Stop: set enabled=false; it is rechecked before each outgoing reply.
Then stop Momentum360-TeamAnswers if it has been registered.
Rollback: keep the service disabled and restore the four original FAQ files
from the session's faq-before-20260915 backup. Do not roll back Workmate.

Review source changes before updating corpus_sha256. The catalog is a reviewed
snapshot, not live monitoring of private channels. Refresh review by October 15,
or sooner when Melissa updates the source process.

## Runnable checks

From org-modes:
python faq_bridge_test.py
python shadow_runtime.py --self-test
python faq_bridge.py --probe
python faq_bridge.py --ask "What should go in our Monday client update?"
python faq_bridge.py --ask "draft jason: Draft a follow-up plan using these supplied facts..."

## References

- Mac's request and Melissa's reply:
  https://momentum3d.slack.com/archives/C04HXSVN2CS/p1789479841450309
- AM Master Hub: https://momentum3d.slack.com/canvas/C0223RR7R6D
- Shared training directory:
  https://momentum3d.slack.com/archives/C066HKJ2E/p1785948576639159
- Slack Socket Mode:
  https://docs.slack.dev/tools/bolt-python/concepts/socket-mode/
- Mention event subscription:
  https://docs.slack.dev/reference/events/app_mention/
