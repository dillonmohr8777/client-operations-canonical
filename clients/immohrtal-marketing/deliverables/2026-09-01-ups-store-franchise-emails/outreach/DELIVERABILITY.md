# IMMOHRTAL deliverability audit — 2026-09-01

The emails are not failing authentication. Gmail already accepted two Workspace
sends from `dillon@immohrtalmarketing.com` into Inbox on 2026-08-25 and
2026-08-26 with SPF pass, DKIM pass (`s=google`), and DMARC pass (`p=none`).

The 5,801 UPS Store messages have not been sent. The daily job is blocked
because the connected Cursor Gmail identity is `dillonmohr8777@gmail.com`.

## What is live

| Control | Live state |
| --- | --- |
| Site | `https://www.immohrtalmarketing.com/` on Vercel, indexed |
| DNS | Cloudflare (`mariah` / `patrick`) |
| MX | `smtp.google.com` |
| SPF | `v=spf1 include:_spf.google.com ~all` |
| DKIM | `google._domainkey` present |
| DMARC | `v=DMARC1; p=none; pct=100` (no rua) |
| BIMI / MTA-STS / TLSRPT | absent |

## Why a 50/day blast still goes to spam

1. The domain has about one week of mail history.
2. Every recipient is `@theupsstore.com`. That is one corporate filter, not
   5,801 independent inboxes.
3. Sending from personal Gmail, AgentMail, or a From alias on the personal
   mailbox would break alignment and should stay forbidden.
4. DMARC reports are off, so we cannot see other senders or spoofing.

Google's bulk-sender rules (5,000+/day to consumer Gmail) are not the limit
here. Workspace allows 2,000/day. The limit that matters is reputation.

## The path that can work

1. Connect Workspace Gmail as `dillon@immohrtalmarketing.com`.
2. Publish the two Cloudflare records in `dns-desired.json`.
3. Add the domain in Google Postmaster Tools.
4. Send one seed to Dillon's personal Gmail and confirm Inbox plus the same
   SPF / DKIM / DMARC pass headers.
5. Warm up: 10 / 20 / 35 / 50 per America/New_York day.
6. Keep reply `stop`, the Pittsburgh street address, and the exact From
   mailbox. Honor stop within the same day.

Do not import HubSpot. Do not send from personal Gmail. Do not start at 50
on day one.
