# Momentum Workmate installation receipt

Date: September 14, 2026
State: LIVE OWNER DM VERIFIED
Client: momentum-360
Authority: Dillon requested a new OpenAI key, installation of the Slack teammate, access across the existing organizational plan, and completion through computer use.

## Latest scope and operator route

Dillon clarified that Workmate must expose Marketing Chief's operator capabilities and all daily workflows, in addition to the five owner modes. Use the local Codex app-server integration, not the earlier proposed narrow SDK reasoner. The standalone official `@openai/codex` 0.154.0 is installed in `%LOCALAPPDATA%/Dillon/MomentumWorkmate/codex-runtime`; version and stdio initialization succeeded.

Read-only runtime discovery returned `account/read` auth type `chatgpt`, plan `pro`; `skills/list` returned 912 enabled skills; `app/installed` returned 32 callable apps. These include Gmail, Slack, Google Drive, Google Calendar, Google Contacts, HubSpot, GitHub, Canva, Figma, Vercel, Sites, Adobe, Higgsfield, HeyGen, Semrush, and Windsor.ai. Discovery does not prove each tool's live account access or desktop-only feature parity.

No new API key is required for this local operator route. The earlier OpenAI Platform browser/connector failure remains historical evidence for the separately requested API key; it is no longer the Workmate activation blocker.

The owner identity `U0A6MD920MA` was read back through the Slack connector as Dillon Mohr in Momentum Digital Agency. Full operator dispatch is scoped to that owner's verified private DM with this bot. Mode selection changes focus; it does not remove the operator's tools. Shared channels and other requesters require their own scoped access rather than receiving Dillon's entire estate.

Slack's saved description now names Marketing Chief and says runtime activation is pending. The saved starting prompts are Run my day, Build and deliver, Investigate a problem, and Five operating modes (`modes`). These replace the earlier prompt labels recorded below.

`Start-WorkmateOperator.ps1` reuses the existing Windows Credential Manager helper. It stores no raw credential file and changes no global Codex settings. Default invocation probes only. `-ConfigureCredentials` accepts hidden local input for this exact app; `-Start` loads the two protected tokens into the child process environment and restores the parent environment on exit. Both tokens are stored in Windows Credential Manager and were validated against the installed app identity without printing them.

The remaining live access step is to generate that Socket Mode credential, securely store it together with the installed app's bot token, start the bridge, and verify the bot identity and a real private reply. No credentials, Slack messages, model-turn results, or running service are implied by the capability counts above.

## Operator implementation and verified execution

The bridge is implemented in `org-modes/operator_bridge.py`; run `operator_bridge_test.py` for the offline check. The check passed identity, malformed input, private-DM membership, secret screening, duplicate/replay handling, mode and conversation continuity, text/native cancellation, uncertain execution/delivery, and interactive-approval denial. Independent review found no material issue, including the final activation-permission delta.

Two real Codex subscription turns completed in the same persisted thread `01a0a105-8b72-7461-bdd1-eca17ee222fd`. The first executed a terminal read with exit code 0 and returned the current organizational heading. The second completed the connected `slack.slack_read_user_profile` tool and verified Dillon's Momentum identity. The app-server thread readback confirms both completed tool records. Exact evidence and source hashes are in [OPERATOR-READINESS-2026-09-14.json](OPERATOR-READINESS-2026-09-14.json).

Activation uses the full local operator execution profile only when explicitly enabled, with `on-request` approvals and fail-closed interactive requests. Probe and smoke modes use the narrower workspace-write profile. The bridge reuses Codex configuration and installed capabilities rather than copying connectors, skills, or credentials. Its default focus is Marketing Chief; `modes` lists all five additional focuses and `mode <name> <task>` selects one. Each conversation/mode retains its Codex thread. Native Slack processing and stop are wired; status writes and actual Slack delivery still require live acceptance.

The implementation has one serial worker, at most 20 pending requests, a 30-minute turn deadline, durable claims before execution/send, and no automatic retry after an uncertain result. A restart preserves uncertain work for reconciliation. No second canonical queue, scheduler, or global Codex configuration was created. A supervised always-on service is not yet installed. Desktop-only/browser capabilities and individual provider actions require live task verification; callable-app discovery is not universal access certification.

**Current state: LIVE OWNER DM VERIFIED.** The full local operator is enabled for Dillon's private DM. `Momentum360-WorkmateOperator` is running as a hidden per-user scheduled task, starts at logon, ignores duplicate instances, and retries one minute after failure.

Workmate uses the Codex in-app browser for browser operations. Chrome is not part of its normal operating route.

## Verified external action

Created and installed **Momentum Workmate** in **Momentum Digital Agency**, team `T066HGS7N`, using the signed-in Chrome Slack app management UI.

- App ID: `A0C2K8ZU6AU`.
- Creation readback: `https://api.slack.com/apps/A0C2K8ZU6AU?created=1` displayed Momentum Workmate and the correct team.
- Installation readback: `https://api.slack.com/apps/A0C2K8ZU6AU/install-on-team?success=1` followed the Allow action on the named app's consent screen.
- Agent readback: `https://api.slack.com/apps/A0C2K8ZU6AU/app-assistant` showed the agent switch enabled and the five-mode description.
- Four fixed prompts saved: Lead desk; Operations; Reporting; Production and delivery.
- Existing app `A0ATZDPMGFM` was left unchanged.
- No Slack message was posted and no model request was run.

The current Slack agent surface is configured through `features.agent_view`, not the legacy `assistant_view`. Reference: [Slack manifest](https://docs.slack.dev/reference/app-manifest/) and [developing agents](https://docs.slack.dev/ai/developing-agents/).

## Installed access

Bot scopes: `app_mentions:read`, `assistant:write`, `channels:history`, `channels:read`, `chat:write`, `files:read`, `groups:history`, `groups:read`, `im:history`, `im:read`, `users:read`.

Subscribed events: `app_mention`, `app_home_opened`, `app_context_changed`, `message.im`, `agent_session_stopped`, `agent_session_title_changed`. Socket Mode is configured in the accepted manifest.

Slack's permission screen explicitly scoped message/file reads to conversations the app has been added to. Installation is not membership in every channel and does not expose unrelated human DMs. No user-token scopes, administrative scopes, or public posting scope were requested.

## Organizational contract retained

Use the existing MOMENTUM-ORG-PLAN.md, agent-contracts.json, lead-agent, and org-modes. One Workmate app supports Jason's lead desk, Sean's operations, Mac's revenue/reporting, Melissa Silber's production, and Melissa Rigby's delivery. Marketing Chief keeps canonical queue authority. Broad access authorization does not make every employee or shared channel an authorized recipient of every client's evidence.

## Original installation gaps (historical)

The operator route and verification above supersede the key/runtime proposals in this original table.

| Surface | Current state | Required next evidence |
| --- | --- | --- |
| OpenAI project key | Creation authorized; not created | Secure new-key creation after OpenAI authentication succeeds |
| OpenAI connector | Reauthentication required | Successful reconnect and secure key picker |
| Browser OpenAI route | ChatGPT and Platform stayed on Cloudflare Verifying | Completed verification/sign-in in the user's browser |
| Slack bot credential | Installation completed; not copied into local runtime | Protected credential wiring and `auth.test` confirming team, app, and bot identity |
| Slack Socket Mode credential | Not provisioned by this session | App-level `connections:write` credential through a protected setup route |
| Existing receiver | Local lead-review implementation, not running as the native agent | Wire installed identity; handle the new native events and all authorized mode contracts; verify persistence and stop |
| Reasoning | JS Agents SDK already installed; no reasoning bridge or live model test | Add the smallest bounded adapter after deterministic validation, then verify output and usage |
| HubSpot | Existing exact portal route is `50612503`; not connected to the new app | Protected connector identity and scoped read tools for Workmate |
| Google Drive, GitHub, reporting/Ads sources | No credentials transferred and no new app connections made | Verify the organizational account and requester access for each connection |
| Zapier | Existing source/companion plans retained | No changes made to Zaps; exact edits remain a separate workflow |
| Slack MCP server connections | Setup form inspected; nothing added | Verified endpoint and auth contract for each integration before saving |

The installed app is an external configuration result, not a functioning daily teammate. Historical 168-check local evidence does not test the newly installed app or its six-event native interface. Do not mark the runtime deployed, grant all requesters unrestricted client context, or infer a reply from installation success.

## Continuation

Resume the installed app; do not create another one. Owner-DM activation is complete. Use current human identity and channel membership evidence before enabling another requester, shared channel, provider account, or normal client dispatch.

## Activation approval and historical interrupted setup — 2026-09-14

Dillon replied "Full approval confiem" to the exact action-time confirmation for Workmate connection-token generation, both Slack tokens in Windows Credential Manager, and full local operator access from his private Workmate DM using Codex Pro. This approval remains valid; no repeated confirmation is needed for the same actions.

The first browser session disconnected during setup. The continuation recovered Chrome, confirmed that both credentials had in fact been saved, started the bridge, and completed the live acceptance below. A new OpenAI API key is not required for this Codex Pro route.

## Live activation acceptance — 2026-09-14

Slack `auth.test` verified Momentum Digital Agency `T066HGS7N`, bot `B0C1QSE409Y`, and bot user `U0C1JMC9JEP` for app `A0C2K8ZU6AU`. The live private DM is `D0C1LJAT1GT` with owner `U0A6MD920MA`.

The final scheduled-task acceptance sent `help` at `1789415784.949619`. Momentum Workmate replied at `1789415786.709189` with the active Marketing Chief focus and all five organizational modes. Slack thread readback verified the bot identity and exact reply, and the local ledger recorded event `Ev0C1BFH19FH` as `DELIVERED`.

The full operator acceptance then entered through the same DM at `1789415927.236989`. Codex Pro completed a real terminal read with exit code 0 in thread `01a0a178-16d5-7ca1-8ad9-3e6337eaaf6d`; Workmate returned the requested heading at `1789415970.083929`. Slack readback verified the bot-authored reply, and event `Ev0C1BG00JFR` is `DELIVERED`.

The receiver now strips the exact ChatGPT connector attribution suffix before parsing owner commands and avoids Slack's angle-bracket text normalization in its help response. The focused offline test passes after both fixes. The earlier interrupted connector probe was reconciled to `STOPPED`; the first externally verified reply was reconciled to `DELIVERED`.
