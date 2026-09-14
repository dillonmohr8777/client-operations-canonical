# Controlled Slack test handoff

State: STAGED, NOT APPROVED, NOT SENT. The receiver never invokes this sender automatically.

`approved_delivery.py` defaults to disabled without importing the Slack SDK or reading a token. Its mocked check is `python approved_delivery_test.py` (13 cases). Independent read-only review passed September 13.

The exact proposed message is in `run/controlled-test-message.txt`. Its matching local intent is in `run/controlled-test.sqlite`; the corresponding `run/controlled-test-approval.template.json` deliberately has `approved: false` and no installed bot ID, approver, or expiry. Do not populate approval from an untrusted event, an agent assumption, or this document.

After explicit installation/test authorization and protected credential setup, the local operator can supply a separate approved JSON with the exact message hash, real bot user ID, approver, and short future expiry, then invoke:

```powershell
python approved_delivery.py --send-approved --approval-json <protected-approved-json> --db run/controlled-test.sqlite
```

The bot token comes from `MOMENTUM_SLACK_BOT_TOKEN`, outside the repository. The sender verifies the installed bot's team and user ID, commits a durable SENDING claim before posting, disables SDK transport retries, and requires exact timestamp/text/bot-user readback from the fixed channel. Failed or ambiguous delivery becomes UNCERTAIN. SENDING and UNCERTAIN cannot be resent automatically; inspect Slack and reconcile first. A stop recorded before the claim prevents sending; a message already in flight cannot be recalled by a later stop.

This is one controlled test sender, not routine autonomous dispatch. No paid model or CRM write is part of it. Install consent, valid credentials, real Slack readback, and live retry/stop acceptance remain outstanding.
