# Cursor Slack Intake Contract

This is the only supported bridge from the Cursor Slack agent into the
canonical Marketing Chief queue.

## Roles

- Cursor in Slack is the conversational intake relay.
- `MarketingChief-Watchtower` on Dillon's Windows machine is the guarded
  executor and the only component allowed to materialize the relayed request.
- `queue/work-items.json` remains the one canonical queue.

Cursor must not execute the requested client deliverable in its cloud
environment. It creates one intake pull request and lets the Windows worker
route and execute the request.

## Accepted request

Create one pull request in
`dillonmohr8777/client-operations-canonical` with:

- base branch `main`
- title beginning `[Marketing Chief Intake]`
- exactly one added file
- file path
  `intake/cursor-slack-requests/pending/slack-<message-seconds>-<message-micros>.json`
- no other file, queue, control, client, or state changes

The JSON shape is:

```json
{
  "schemaVersion": 1,
  "requestId": "slack-1784922105-135699",
  "source": {
    "workspaceId": "T066HGS7N",
    "channelId": "D0BJEC2MM6V",
    "messageTs": "1784922105.135699",
    "requesterUserId": "U0A6MD920MA",
    "cursorUserId": "U0BJCELQYLS"
  },
  "clientId": "exact-registry-client-id",
  "title": "Short redacted outcome title",
  "instruction": "The requested outcome, summarized without secrets or unnecessary personal data.",
  "mode": "prepare",
  "priority": "P2",
  "dueAt": null,
  "testOnly": false
}
```

Allowed modes:

- `analyze`
- `prepare`
- `execute_safe`
- `draft_for_approval`
- `monitor`

The mode never overrides action safety. The Windows bridge independently
classifies sending, publishing, deployment, spend, account changes,
destructive work, authentication, and business decisions as approval-gated.

## Required Slack command

Dillon should name the exact client and say:

`@Cursor agent Route this through Marketing Chief for <exact client>: <requested outcome>. Follow docs/CURSOR_SLACK_INTAKE.md in dillonmohr8777/client-operations-canonical.`

If the client cannot be resolved exactly through `registry/clients.json`,
Cursor must stop and ask Dillon which client record applies. It must never
default unrelated work to Momentum 360.

## Trust and privacy

The Windows bridge accepts only:

- an open pull request authored by `dillonmohr8777`
- the exact private canonical repository and `main` base
- the exact Dillon, Cursor, workspace, and DM identifiers above
- one safe request file
- one exact active registry client

Secret-shaped text, direct identifiers, raw message headers, extra files,
duplicate requests, stale canonical state, and ambiguous or inactive clients
fail closed. Pull requests are not merged automatically.
