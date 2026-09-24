# Momentum Workmate receiver core

State: STAGED. This is the local restricted receiver core for the first `#360leads` pilot. It does not open a socket, contact Slack, install an app, send a message, mutate CRM, or spend model/API budget.

What it now does:

- accepts only directed human `app_mention` envelopes for an allowlisted Slack team, app, human, and channel;
- rejects bot events, wrong team/app/channel/user, missing mentions, wrong lead source, and malformed CRM input;
- deduplicates Slack event IDs durably in SQLite;
- deduplicates repeated provider lead events into one delivery intent;
- preserves a second provider event for the same CRM contact as a separate inquiry;
- stages the exact Slack message body as a `DRAFT_APPROVAL_REQUIRED` delivery intent;
- records a verified Slack readback receipt after a future approved send;
- stops cleanly on a human `stop`, `cancel`, or `halt` mention.

Run the local check:

```powershell
python slack-receiver\receiver.py --self-test
```

Generate the staged first test payload and draft result:

```powershell
python slack-receiver\receiver.py --demo --event-output slack-receiver\run\first-test-event.json --out slack-receiver\run\first-test-result.json
```

The demo allowlist uses placeholder staged Slack identity values. Before live install, replace them with actual Slack readback values for the Momentum workspace and app. The approved channel remains `C05R2B1ULF6`.

Live activation is still gated by Slack app install consent, protected token storage, actual workspace/app/user readback, Slack manifest validation through an approved route, and approval for one controlled test post.
