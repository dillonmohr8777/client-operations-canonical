> LIVE UPDATE: user approved launch after the Contributor data-use disclosure. Existing Windows task Momentum360-TeamAnswers is running with meta/muse-spark-1.3-contributor through OpenRouter. A real cited reply was independently verified at https://momentum3d.slack.com/archives/C0C2VSTBQ9W/p1790217176842859. The dedicated key binding is present. Earlier staged-state notes below describe pre-launch verification. This is still Windows-hosted.

# Momentum Answers: team assistant setup

Updated September 23, 2026. State: OpenRouter migration draft; FAQ listener and
provider are disabled. The September 15 Slack acceptance is historical evidence,
not proof that the current migration is running. Employee guide: ../TEAM-QUICKSTART.md.

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

## Implementation and current gate

- Reuses agent-contracts.json and the installed Workmate Python environment.
- Reuses the existing Momentum Answers app, retrieval, Slack scopes, queue and ledger.
- The migration targets `meta/muse-spark-1.3-contributor` through the fixed
  `https://openrouter.ai/api/v1/chat/completions` endpoint. Ollama is no longer
  a runtime dependency.
- The key is referenced as `OPENROUTER_API_KEY`; the launcher reads the
  Credential Manager target `MarketingChief-FAQ-OpenRouter` into the child
  process and restores the prior environment afterward. This change does not
  create or verify that credential.
- `enabled`, `provider_enabled` and `external_data_approved` are all false.
  The launcher refuses to start or register the reply listener while these
  gates are false. No staff-corpus inference or Slack replies are enabled.
- Two synthetic OpenRouter probes verified the model and strict JSON-schema
  response shape. A 128-token probe returned empty content after using 125
  reasoning tokens; a 2048-token request with low reasoning returned the
  synthetic passage ID. Combined probe cost was $0.0000707. No staff corpus or
  Slack message was used; the offline suite below makes no provider calls.
- As checked September 23, the dedicated Credential Manager target
  `MarketingChief-FAQ-OpenRouter` is absent. The launcher does not copy an
  inherited key into that target; secure credential binding remains required
  before launch.
- The model provider receives the prompt and selected passages. OpenRouter's
  model page says prompts and outputs may be used to improve Meta products;
  keep this gate closed until the owner approves data handling for the reviewed
  corpus and team prompts. [Model and data-use details](https://openrouter.ai/meta/muse-spark-1.3-contributor).
- Provider calls use a bounded timeout and response size, fixed model and
  endpoint, no tools, and structured JSON output for passage selection.
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
6. Keep all three activation gates false until external-data handling is
   approved. After approval, stage the provider credential through the
   protected credential path, then set `external_data_approved=true`,
   `provider_enabled=true` and `enabled=true` for the approved channel.
   Preflight verifies the OpenRouter credential, `auth.test`, `bots.info` and
   the configured Slack app. Do not start the listener before that approval.
7. A real team member mentions it with a training question. Verify the reply
   through Slack readback and the local ledger. Repeat in the same thread with
   a role draft and a follow-up. Test stop and a non-owner team member.
8. Only after acceptance, use -RegisterTask and Start-ScheduledTask
   Momentum360-TeamAnswers for automatic operation at user logon.

Historical September 15 acceptance: Slack readback verified a Monday FAQ and a
three-concept role draft. A delayed draft with an unsupported availability
claim was withdrawn and corrected. The non-owner employee test was unverified.
That acceptance preceded this provider migration; it does not establish current
credentials, listener state, scheduled-task state or OpenRouter readiness.

## Availability and operation

When enabled, this host must remain on, signed in and connected to Slack. The
prepared task is independent of the Codex app but is NOT a 24/7 service. A logon
task does not solve sign-out or machine power loss. Production 24/7 operation
needs an approved always-on host and its own installation check. Do not move or
broaden Workmate's credentials to solve availability.

Stop: keep `enabled=false`; it is rechecked before each outgoing reply. The
migration configuration currently stays disabled. Do not restart or register a
listener as part of this draft. Do not roll back Workmate.

Review source changes before updating corpus_sha256. The catalog is a reviewed
snapshot, not live monitoring of private channels. Refresh review by October 15,
or sooner when Melissa updates the source process.

## Runnable checks

From org-modes:
python faq_bridge_test.py
python shadow_runtime.py --self-test
python faq_bridge.py --probe
# The following make live OpenRouter requests; run only after data approval and activation.
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
- OpenRouter model and data-use details:
  https://openrouter.ai/meta/muse-spark-1.3-contributor
- OpenRouter privacy and logging:
  https://openrouter.ai/docs/features/privacy-and-logging
