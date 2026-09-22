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

---

# Addendum 2026-09-21 — Draft 4

**Status: DRAFT. Not sent.** Added after James Frederick asked on 2026-09-18 for an email
giving David steps to try the demo before the rescheduled meeting, and chased it on
2026-09-21 ("progress on the demo email to david?").

Supersedes Draft 3, which asked David for the Resend sender domain. That decision was
closed on 2026-09-15 when James and Obaid set the domain up.

## Draft 4 — email to David Molod, copying James and Obaid

Written so David can form an opinion alone, in about fifteen minutes, without a meeting.
It walks one real claimant end to end rather than listing features, because the seven-stage
journey is the thing he actually needs to judge.

> **Subject: VA Claims Edge portal — 15 minutes to try it yourself before we meet**
>
> Hi David,
>
> Sorry we missed each other Friday. Rather than hold everything for the next meeting,
> here's a way to go through the portal yourself whenever you have fifteen minutes. Then
> the call becomes your questions instead of our walkthrough.
>
> **The portal:** https://vaclaims-portal.vercel.app — sign in at `/login`. If your sign-in
> doesn't work, reply and we'll sort it before you spend any time on this.
>
> The most useful thing you can do is take one imaginary claimant all the way through, the
> way your team actually would:
>
> **1. Add a client.** Clients → Add Client. Put in a test name so it's obvious it isn't
> real. This is the intake path your staff will use day to day.
>
> **2. Open their record.** Click into them from the clients list. Everything about that
> claimant lives on this one screen.
>
> **3. Leave a note.** Add a couple of lines the way your team would after a phone call.
> Notes are append-only and stamped with who wrote them and when — nothing can be quietly
> edited later.
>
> **4. Move them through the stages.** Advance them a stage or two. This is the seven-stage
> journey we built around your process, so this is the part worth being picky about: do the
> stage names and the order match how you actually work?
>
> **5. Flip the onus.** Switch between waiting on us and waiting on the client, and record
> a contact date. This is what drives the alerts.
>
> **6. Stop the clock.** Close them out as successful or non-successful and watch them come
> off the active list.
>
> Then have a look at **Alerts**, **Payment Watch** (the C&P exam timers), and **Advisors**,
> where you can add and deactivate people and reassign their clients.
>
> Last one, and it's the part people tend to enjoy: the **AI assistant**. Ask it something
> in plain English about your client base — "who haven't we contacted in two weeks?" or
> "who's sitting in stage 4?" — and see whether the answers are the ones you'd want.
>
> **What we're really asking:** where does this not match how your firm actually runs? Stage
> names, the order, what counts as contact, what should trigger an alert. Those are cheap to
> change now and expensive to change after go-live, so be blunt.
>
> Two open items on our side, for visibility. The daily alert emails are built and the
> sending domain was set up last week, so those should start landing. And we'd still like a
> decision on whether claimants should be able to register themselves from the website, or
> whether your team adds everyone — that one shapes the next phase.
>
> Whenever you've had a look, send over times and we'll get the walkthrough booked.
>
> Thanks,
> Dillon

## Notes for the sender

- Do not claim the Resend digest is confirmed working. The domain was set up on 2026-09-15
  and moved into authenticating; nobody has confirmed a real digest arriving. The draft says
  "should start landing" deliberately — keep that hedge.
- The draft assumes David has working credentials. Verify before sending, or the first step
  fails and the whole exercise stalls again.
- The self-registration question is carried over from 2026-09-01 and is still genuinely
  undecided.
- David trying the demo is **not** the acceptance gate. The authenticated seven-stage
  walkthrough on Dillon's side still has to happen either way.

---

# Addendum 2026-09-22 — Draft 5 (supersedes Draft 4)

**Status: DRAFT. Not sent.** Approval-gated.

Draft 4 was written on 2026-09-21 before two things were known:

1. **Obaid recorded a Loom demo** at 18:09 EDT that same evening and sent it to James.
2. **David already sent availability on 2026-09-20**; nobody has booked against it.

Draft 4 is now wrong to send as written. It duplicates the video, and it treats scheduling
as stuck when in fact David has already given times. Sending a long self-serve walkthrough
while sitting on his availability would read badly.

Draft 5 is shorter on purpose. It books the call, hands over the video, and keeps only the
part a recording cannot do — the hands-on pass and the one question we actually need
answered.

## Draft 5 — email to David Molod, copying James and Obaid

> **Subject: Portal walkthrough — booking one of your times, plus a 5-minute video first**
>
> Hi David,
>
> Thanks for sending times on Saturday, and sorry for the delay coming back to you — that
> one's on us. **[BOOK ONE OF HIS SENT TIMES HERE AND NAME IT EXPLICITLY.]**
>
> Before the call, Obaid recorded a short walkthrough of the portal: **[LOOM LINK]**. It
> covers the whole claimant journey end to end, so the call can be your questions rather
> than our demo.
>
> If you'd rather poke at it yourself, the portal is at
> https://vaclaims-portal.vercel.app and you can sign in at `/login`. The single most useful
> thing you could do is add one test claimant and walk them through the stages — advance
> them a couple of steps, leave a note, flip the onus between waiting on us and waiting on
> the client, then stop the clock.
>
> That's the part we most need your eye on: **do the seven stages match how your firm
> actually runs?** The names, the order, what counts as contact, what should trigger an
> alert. Those are cheap to change now and expensive after go-live, so please be blunt.
>
> One open question for the next phase: should claimants be able to register themselves from
> the website, or does your team add everyone? Staff intake works today either way.
>
> See you on the call.
>
> Dillon

## Notes for the sender

- **Fill the two brackets before sending.** The booked time and the Loom link are the whole
  point; without them this is just another email that asks David to do something.
- Watch Obaid's video first. If it already covers the seven-stage question well, cut that
  paragraph down to one line rather than asking David to do work the video answers.
- Still do not claim the Resend digest is confirmed working. Draft 5 deliberately says
  nothing about alerts — the domain was set up on 2026-09-15 but no real digest has been
  observed landing.
- The authenticated seven-stage walkthrough on Dillon's side is still owed regardless of
  what David does. His pass is not internal verification.
