# Slack drafts — VA Claims Phase 3 closeout (2026-09-02)

**Status: DRAFT. Not sent.** External sending is approval-gated. Approve before posting.

---

## Draft 1 — `#va-claims`, reply to Obaid

Replies to Obaid's 2026-09-02 19:10 EDT Phase 3 completion message
(`slack://channel/C0AU6GMGY73/message/1788390625.269229`). Dillon already said he would
check once he was set up again, so this is the promised follow-up.

> @Obaid Back at it — power's restored. I went through production and everything you called
> out checks out on my side.
>
> Verified independently:
>
> • All eleven routes live and returning 200, including `/dashboard/clients/new` — that was
>   the intake gap we talked through Monday, so that one's closed
> • Protected APIs still return 401 unauthenticated — clients, payment-watch, advisors, and
>   settings all confirmed, so the security patch held through the Phase 3 merges
>
> Genuinely strong work on this one. The intake form landing is what makes it usable for
> David rather than just demoable.
>
> Three things I still owe on my side before we put it in front of David:
>
> 1. A full authenticated walkthrough of the 7-stage journey — I can verify routes and auth
>    from outside, but not stage transitions, onus toggle, stop clock, or note append
> 2. Confirming the operations dashboard reflects the 7 stages, not the old 4-stage grouping
> 3. Confirming the large-text pass for older claimants survived the merges
>
> I'll have those done and will flag anything that comes up.
>
> On your two open items — agreed on both. Self-registration should be a later phase; staff
> intake covers what David actually needs today. I'll get him to confirm the Resend sender
> domain so the alert engine can come off the test sender, since that's the one thing
> holding back real notifications.

---

## Draft 2 — `#va-claims`, to James Frederick

Answers James's 2026-09-01 "both self onboarding and staff onboarding should be on the
table" so he is not left waiting on a decision.

> @James Frederick On onboarding — staff intake is live now, so David's team can add clients
> directly from the clients page today.
>
> Self-registration from the website is the bigger build: it needs public account creation,
> identity checks, and a review path before an unvetted signup can become a real claimant
> record. My recommendation is we scope it as its own phase rather than bolt it onto Phase
> 3, so it gets designed properly instead of rushed.
>
> Both stay on the table — I'd just sequence them.

---

## Draft 3 — David Molod, DM

Gets the two decisions Obaid needs. Deliberately short: it asks for two answers, nothing
else.

> Hey David — Phase 3 development is complete and live on the portal. Your team can now add
> clients through the staff intake form, work a client through all seven stages, add
> timestamped notes, toggle onus, record contact dates, stop the clock with a successful or
> non-successful outcome, monitor Payment Watch for C&P timers, manage advisors, and ask the
> AI assistant questions about the client base.
>
> I'm doing a full authenticated walkthrough before I hand it to you formally, and I'll book
> time to take you through it.
>
> Two decisions I need from you, both quick:
>
> **1. Sending domain for alerts.** The daily alert engine is built — critical, warning, and
> no-contact digests — but it's on a test sender, so alerts aren't reaching real inboxes
> yet. Can you confirm you want them sent from `vaclaimsedge.com`? Once you confirm, Obaid
> sets it up in Resend and alerts go live.
>
> **2. Website self-registration.** Right now your team adds clients through the portal.
> James raised letting claimants register themselves from the website. That's a larger build
> and I'd recommend a later phase rather than squeezing it in — but tell me whether you want
> it scoped now or parked.

---

## Notes for the sender

- Draft 1 and 2 are safe to post as written.
- Draft 3 states development is complete and simultaneously says a walkthrough is pending.
  That is deliberate and accurate — do not tighten it into an unqualified "it's ready."
- Do not claim the daily cron or the Resend digest is verified. Neither was observed running
  from this side.
