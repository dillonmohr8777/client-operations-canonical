# IMMOHRTAL UPS Store daily outreach

Dillon approved 50 sends per America/New_York day until the 5801 MX-ok UPS Store location mailboxes are finished.

## Hard rules

- From mailbox must be `dillon@immohrtalmarketing.com`.
- Never send from `dillonmohr8777@gmail.com`, AgentMail, or a Momentum mailbox.
- Use the IMMOHRTAL signature only with that From mailbox.
- Do not import to HubSpot.
- Do not post in Momentum Slack.
- Do not write `queue/work-items.json` or `registry/clients.json`.
- Reply `stop` suppresses that address. Add it to `suppressed.jsonl` and skip it forever.

## Daily run

1. Confirm the live sender identity is `dillon@immohrtalmarketing.com`.
2. From this folder run `python select_batch.py`.
3. Send each row in `batches/YYYY-MM-DD.json`.
4. Write the send results JSON and run `python record_sends.py --input <results.json>`.
5. If `remaining` is 0, stop the daily timer. The campaign is complete.

## Files

- `campaign.json` — mailbox, limit, approval
- `template.html` / `template.txt` — copy
- `select_batch.py` — next 50 unsent, unsuppressed rows
- `record_sends.py` — append-only send log
- `sent.jsonl` — delivered addresses
- `suppressed.jsonl` — stop and bounce addresses
- `state.json` — current counts
