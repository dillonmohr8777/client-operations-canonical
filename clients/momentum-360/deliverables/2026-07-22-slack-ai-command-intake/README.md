# Slack AI command intake

This is a reviewable adapter for Mac's request to command AI from a shared Slack channel or DM. It converts a verified Slack event into the existing Agent OS `task.json` shape. It does not call Slack, mutate the Canonical Queue, or execute external actions.

## Command syntax

Shared channel:

`/ai momentum-360: prepare a local chatbot QA report`

Direct message:

`ai: va-claims-edge: verify the Phase 2 handoff package`

The client must be an exact configured canonical client ID. A command from an unlisted workspace, user, or shared channel fails closed. Replayed Slack timestamps produce the same run ID and do not create another task. Commands containing external delivery, publishing, deployment, spend, authentication, deletion, SMS, or phone-routing terms are marked `approval_required`.

## Activate after OAuth repair

1. Reconnect Slack in Codex on the sole-writer desktop.
2. Copy `config.example.json` to a runtime-only path and fill it with verified Slack IDs. Do not commit the runtime config.
3. Have the Slack event receiver write the event body to a private runtime path.
4. Call `Convert-SlackAiCommand.ps1` with the event, runtime config, and the existing private Agent OS runs directory.
5. Keep `Sync-AgentOsIntake.ps1` as the only redacted intake sync. Marketing Chief remains the only Canonical Queue writer.
6. Run one allowed command, one replay, one unauthorized-user command, and one approval-gated command before enabling team use.

## Check

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\Test-SlackAiCommand.ps1
```

No token, cookie, raw Slack event, or runtime allowlist belongs in this repository.
