# Slack draft — reply to Obaid and James, #va-claims

**STATUS: SENT 2026-09-02 22:14 EDT by Dillon approval via Claude.** https://momentum3d.slack.com/archives/C0AU6GMGY73/p1788401677566349

**Channel:** #va-claims
**Reply to:** Obaid's 2026-09-02 19:10 EDT Phase 3 completion message
**Word count:** 168 (message body only)

---

Obaid, went through main at f00141e. Every route under src/app/api requires an authenticated user, and I confirmed it unauthenticated on production — clients, advisors, notes, documents, settings, payment-watch all return 401. No secrets in git history. Tests 18/18, lint and build clean.

Three for you. The signed-url route signs whatever file_url the caller passes with no ownership check — better keyed off document_id. The digest's "already notified today" lookup uses the client's id but the insert writes null, so it never matches. And I can't find the cron: no vercel.json, no route under api/cron, and /api/notify is POST-only behind a session cookie. Can you send the cron definition and one delivery receipt?

Mine: no UI yet for the storage API you shipped, and settings still isn't wired to its endpoints. I'm taking both. Draft PR up for a Next 16 fix — the proxy file was in the wrong directory and never ran, so sessions weren't refreshing.

James, can you get the Resend sender domain from David? We're on the test sender, which won't reach real recipients. Assuming vaclaimsedge.com.
