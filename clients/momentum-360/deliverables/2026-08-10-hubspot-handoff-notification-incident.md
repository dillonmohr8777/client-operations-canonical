# Momentum 360 HubSpot handoff and notification incident

Date: 2026-08-10

Status: Production repair applied and live-path verified

## Incident evidence

- Jason Fallon reported at 10:09 AM ET that the assistant claimed a conversation had been routed before it collected visitor contact information.
- Jason reported no email alert for a live-intervention request. Sean Boyle confirmed at 10:12 AM ET that he was not receiving alerts.
- Source: Slack group DM `C0B2N20A0SW`, messages `1786370965.709839` through `1786371212.217739`.
- HubSpot account: Momentum 360, portal `50612503`.
- Affected visitor thread: the 10:07 AM ET live chat from Billy Bob containing `hi` and `can i get a quote on photos?`, tracked as Help Desk ticket `#47487409156`.

## Read-only findings

1. The exact affected conversation did create Help Desk ticket `#47487409156` at 10:07 AM ET and associated it with the visitor contact, but the ticket had `No owner`. A separate anonymous 21-day-old Inbox thread was also open and illustrated why fresh-session testing was required.
2. The assistant's handoff process targets Help Desk, assigns Sean Boyle, uses load-balanced distribution, and keeps the chat open.
3. `Assign to available users only` was enabled. HubSpot stated that tickets would remain unassigned if all selected users were Away. Sean and Jason were both Away when inspected.
4. Customer Agent email capture was set to `After answering the first question`, not explicitly before a human handoff.
5. The handoff message began with `I have routed this to the Momentum 360 team`, even when the underlying ticket and assignment had not completed.
6. Jason's personal email notifications were already enabled for chats assigned to him, reassigned to him, and new unassigned chats. Sean's personal preferences are private to Sean's account and cannot be changed or verified from Jason's account.
7. The active website chatflow is connected to the legacy Inbox. Help Desk's Chat channel row is not connected. Migrating the channel is excluded from this repair because HubSpot does not provide a self-service rollback for that migration.
8. The active knowledge source contains an approved photography price response, and the current guidelines already require name, email, and phone before a qualified handoff. A separate stale conversation reused across several dates was present in the legacy Inbox, but the reported 10:07 AM exchange was a fresh Help Desk ticket.
9. Customer Agent reports showed no recorded handoffs for the inspected reporting period. No relevant routing error appeared in the available audit and coaching views.

## Proposed production changes

1. Change Customer Agent email capture from `After answering the first question` to `Before handing off to a human`.
2. Disable `Assign to available users only` for the existing asynchronous Help Desk handoff to Sean Boyle, so Away status cannot suppress ticket assignment.
3. Replace the handoff confirmation with accurate language that states the request was sent only after the handoff completes and asks for any remaining project details without falsely claiming an earlier route.

Proposed message:

> Thanks. I've sent your request to the Momentum 360 team for follow-up. If you have not already shared them, please add your name, phone number, and any helpful project details. For consultations, audits, quotes, and general inquiries, you can also use https://www.momentumvirtualtours.com/contact/. Keep this chat open for a teammate's reply.

## Rollback

1. Restore email capture to `After answering the first question`.
2. Re-enable `Assign to available users only`.
3. Restore the prior handoff message beginning with `I have routed this to the Momentum 360 team`.
4. Leave the website chat channel in the legacy Inbox; no Help Desk migration is included in either the change or rollback.

## Verification plan

1. Start a fresh Customer Agent test conversation rather than reuse the affected visitor thread.
2. Request a photography quote and confirm the assistant uses its approved knowledge before escalating.
3. Explicitly request a human without supplying an email and confirm contact capture occurs before the handoff completes.
4. Use clearly labeled synthetic QA contact details.
5. Confirm the resulting Help Desk ticket is assigned to Sean even while he is Away and that the chat remains open.
6. Confirm the routing event is visible in the relevant HubSpot record and ask Sean to verify receipt of the external email alert.

## Change and test record

- At approximately 11:20 AM ET, Customer Agent email capture was changed to `Before handing off to a human` and reread after page reload.
- At approximately 11:21 AM ET, `Assign to available users only` was disabled for the Help Desk handoff to Sean Boyle. The setting was reread after save and remained disabled.
- The handoff confirmation was replaced with the proposed accurate message. `Keep the chat open` remained enabled and was reread after save.
- The stranded incident ticket `#47487409156` was assigned to Sean Boyle. The ticket was reread and showed Sean as owner even though he remained Away.
- The Customer Agent live tester requested an email before processing a photography handoff.
- A separate fresh live website conversation was started at 11:27 AM ET with a clearly labeled QA request. The assistant asked for an email before saying the request was sent.
- After the synthetic email was supplied, HubSpot created Help Desk ticket `#47446862915`, associated the QA contact, and automatically assigned the ticket to Sean Boyle while he was Away.
- Help Desk `All Open` increased from 163 to 164, while `Unassigned` decreased from 2 to 1 after the stranded incident ticket was assigned. The new QA ticket was not added to the unassigned count.
- HubSpot's in-app record confirms creation and assignment. External email receipt still requires confirmation from Sean's mailbox; the notification message requests that confirmation.
