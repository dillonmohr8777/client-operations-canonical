# IMMOHRTAL UPS Store daily outreach

Dillon approved 50 sends per America/New_York day until the 5801 MX-ok UPS Store location mailboxes are finished. Warmup caps that ceiling until the domain has a clean first two weeks. See `DELIVERABILITY.md`.

## Hard rules

- From mailbox must be `dillon@immohrtalmarketing.com`.
- Never send from `dillonmohr8777@gmail.com`, AgentMail, or a Momentum mailbox.
- Use the IMMOHRTAL signature only with that From mailbox.
- Do not import to HubSpot.
- Do not post in Momentum Slack.
- Do not write `queue/work-items.json` or `registry/clients.json`.
- Reply `stop` suppresses that address. Add it to `suppressed.jsonl` and skip it forever.

## Daily run

1. Confirm the live sender identity is `dillon@immohrtalmarketing.com` with `python send_guard.py --live-mailbox <connected-mailbox>`.
2. Run `python preflight_dns.py`. Auth records must still show Google MX, SPF, DKIM, and DMARC.
3. From this folder run `python select_batch.py`. The script applies `warmup.json` unless `--ignore-warmup` is passed.
4. Send each row in `batches/YYYY-MM-DD.json` only after the guard passes.
5. Write the send results JSON and run `python record_sends.py --input <results.json>`.
6. If `remaining` is 0, stop the daily timer. The campaign is complete.

## Warmup

- 2026-09-02 to 2026-09-04: 10
- 2026-09-05 to 2026-09-08: 20
- 2026-09-09 to 2026-09-15: 35
- 2026-09-16 onward: 50

Send one seed to Dillon's personal Gmail from the Workspace mailbox before the first franchise batch. Confirm Inbox placement and SPF / DKIM / DMARC pass.

## Files

- `campaign.json` — mailbox, limit, approval
- `warmup.json` — daily cap ramp
- `dns-desired.json` — Cloudflare records still to publish
- `template.html` / `template.txt` — copy
- `select_batch.py` — next unsent, unsuppressed rows
- `send_guard.py` — refuse the wrong From mailbox
- `preflight_dns.py` — live auth check
- `record_sends.py` — append-only send log
- `sent.jsonl` — delivered addresses
- `suppressed.jsonl` — stop and bounce addresses
- `state.json` — current counts
