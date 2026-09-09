# Current outcome: published and ON, version 1

September 8, 2026, 14:14 EDT. Dillon confirmed #pritzker-law-group C0BB04ZFZ26 is the intended destination and authorized completion, deletion of the prior update, and a corrected message without mentioning the automation.

Deleted only the top-level 13:40:32 EDT message 1788889232.120289. The initial real Slack test returned channel_not_found. Adding the existing Zapier app to this exact channel resolved it. A corrected top-level approval-status message was delivered at 14:10:08 EDT and read back: https://momentum3d.slack.com/archives/C0BB04ZFZ26/p1788891008028529 . No automation claims are in that message.

The Google Sheets receipt action saved the real permalink and timestamp, reset readiness to No, and preserved the other row values. Before/after workbook comparison confirms all four original worksheets unchanged. A complete test run then stopped at the filter on the already-sent row (run 002d283d-f809-acc4-8175-e1f3baa180e4). The workflow is published and ON using v1: https://zapier.com/editor/379405193 . Existing unrelated automations were not altered.

Schedule: Mondays at 10 AM America/New_York. Each week still needs a current source-reviewed status row for that Monday marked Ready to Send Yes. Missing, duplicate, unready, or sent rows are configured to halt. No future status has been invented, and the first scheduled production run has not yet occurred. The controlled delivery and receipt actions passed; the full already-sent run passed its stop check. No account or destination blocker remains. See live-verification-receipt.json for exact evidence.

Everything below is historical and is superseded where it describes an OFF draft or a missing destination.

---

# Pritzker Law Group: investigation and saved Zapier draft

Updated September 8, 2026. Shared access verified; six-step workflow saved as an OFF, unpublished draft. No Slack or email sent after Dillon prohibited further communications. This is not a live workflow.

Draft: https://zapier.com/editor/379405193
Status source: https://docs.google.com/spreadsheets/d/1zq1SSbu8nyZ0eMmTBLwfAvoSlhA99buq4J8JFWVGBTk/edit?gid=112045044#gid=112045044

## Verified current state

- Shared account hi@needmomentum.com, Momentum Digital Organization, verified in live account settings after Dillon completed sign-in. Editor owner is Mac Frederick. Non-secret access reference recorded in Access Broker; no password read or copied.
- Created only the Pritzker draft and a Status Updates worksheet in the existing calendar. All four original worksheets retain identical cell values in before/after exports. Existing automations were not edited, enabled, disabled, or replayed.
- Schedule: Monday 10 AM, America/New_York. Formatter converts the scheduled timestamp to YYYY-MM-DD in that timezone. Cadence is a proposed setup choice; Sean left cadence flexible.
- Lookup: exact Status Updates worksheet, Week Starting equals formatter output. Missing and multiple matching rows are configured to halt. Automatic row creation is unchecked. Row count 10 applies to returning line items, which this draft does not use.
- Filter: all nine AND rules verified directly: Client exactly Pritzker Law Group; Ready to Send exactly Yes; Reviewed By, Reviewed At, Reviewed Status, Next Step, Owner, Source Links exist; Sent At does not exist.
- Slack message fields map reviewed status, exact approval requests, next step, owner, and source links. Existing Momentum Slack connection reused. Client-facing channel remains unset. Automatic app addition, automation link, link expansion, and automatic username/channel linking are No.
- Final Sheets update targets the dynamic row from the lookup. Ready to Send is No, Sent At uses the native Current time: UTC (ISO) variable, and Overwrite All Columns is False. Slack Message URL is intentionally empty: the native output selector requires the Slack step to be completed first. An unverified Copilot-generated permalink reference was removed.
- Draft persisted after editor reload. Turn Zap on is unchecked and disabled; Publish and full Test run are disabled. Neither Slack sending nor the Sheets update action was tested.

## Tests and remaining release work

Schedule and formatter tests completed. A real read-only Google Sheets lookup returned row 2 with Ready to Send No. The filter test explicitly reported that the Zap would not have continued, rejecting No and missing reviewer fields. The duplicate-result halt setting was subsequently verified in configuration, but not exercised with duplicate live rows. Positive, already-sent, missing-row, and end-to-end delivery tests remain pending; no claim of production readiness is made.

The sole source row is an explicitly unreviewed, disabled example dated September 8 to match the safe test. Future weekly rows must use the scheduled Monday date, contain current reviewed facts and exact asset/version requests, and be intentionally marked ready by the owner. Sheet fields alone do not authenticate who performed review; maintain appropriate sheet access.

To finish activation: confirm the actual client Slack destination, reconcile current assets and approvals with Madison and Jenny, provide an approved weekly status row, finish the Slack permalink mapping, and authorize a controlled send/receipt test and enablement. The known #pritzker-law-group channel C0BB04ZFZ26 is internal; it was not assumed to be client-facing. If Slack sends but receipt recording fails, inspect Slack before replaying to prevent duplicate messages.

## Investigation findings

1. Communication and approval ownership are the central issue. Friday messages requested the calendar and first three posts; Tuesday messages show the team awaiting Slack responses while the client contacts Sean separately. This does not establish a broken existing Zap.
2. The 19-row Approval Tracker differs from the 19-entry calendar. What We Wish Clients Knew moved from tracker DAY 3 to calendar DAY 2. Calendar DAY 3 is a Philadelphia zoning reel; the tracker retains the older DAY 5 Pritzker Perspective concept. New and duplicate concepts prevent reliable automatic remapping.
3. All 19 tracker entries say Pending for QA, attorney review, and client approval, while only the first three have asset links and versions. Pending does not establish readiness. Remaining calendar revision notes are unresolved recordkeeping, not proof that revisions were never completed elsewhere.
4. The earlier personal-account access blocker is resolved. Older setup and access-blocked messages are historical, not current status.

Local proposed-tracker-reconciliation.csv preserves all 19 current entries with conservative candidate mappings and explicit ambiguities. It has not replaced the live tracker; no approvals were promoted. source-snapshot.json and calendar-observed-2026-09-08.xlsx preserve the inspected source. status-source-verification.json records that all four original worksheets were unchanged.

## Separate account warning

Zapier History displays 30 held runs with a September 9, 2026 retention deadline. Its recovery panel asks to reconnect RingCentral marketing@detroitdispensingsolutions.com and Gmail gmb@campusc.com. These are separate existing connections; their relationship to Pritzker was not established. No reconnection, replay, or unrelated workflow change was performed.

The internal status message sent at 12:46 EDT preceded Dillon's later no-outbound instruction. Its original sent/readback evidence remains in verification-receipt.json. No later Slack/email message was sent.
## Source locators

- [Jenny's Zapier assignment, September 8 at 11:55 EDT](https://momentum3d.slack.com/archives/C0BB04ZFZ26/p1788882906870049).
- [Madison's calendar and first-three-post approval request, September 4 at 14:43 EDT](https://momentum3d.slack.com/archives/C0BB04ZFZ26/p1788547439379909).
- [Madison's Tuesday follow-up, September 8 at 11:29 EDT](https://momentum3d.slack.com/archives/C0BB04ZFZ26/p1788881399206199).
- [Jenny's Friday absence/update context](https://momentum3d.slack.com/archives/C0BB04ZFZ26/p1788553894050919).
- Sean's Slack-generated voice transcripts: [11:38](https://momentum3d.slack.com/archives/C0BB04ZFZ26/p1788881907221239), [11:43](https://momentum3d.slack.com/archives/C0BB04ZFZ26/p1788882217772649), [11:46 cadence clarification](https://momentum3d.slack.com/archives/C0BB04ZFZ26/p1788882416557959), [11:51 client discussion](https://momentum3d.slack.com/archives/C0BB04ZFZ26/p1788882683823699). Transcripts may contain recognition errors; cadence and ownership conclusions were consistent across the inspected messages.
- [Current content calendar and Approval Tracker](https://docs.google.com/spreadsheets/d/1zq1SSbu8nyZ0eMmTBLwfAvoSlhA99buq4J8JFWVGBTk/edit): calendar rows 3–21 and tracker rows 2–20, exported September 8.
- [Existing September 3 stabilization plan](https://momentum3d.slack.com/docs/T066HGS7N/F0BUPNPCMM3): Jenny owns client communication, Madison production, Sean escalation, Dillon tracker/QA. This is existing guidance, not a fresh approval or proof of execution.
- [Zapier scheduling documentation](https://help.zapier.com/hc/en-us/articles/8496288648461-Schedule-Zaps-to-run-at-specific-intervals), [Google Sheets row lookup/update documentation](https://help.zapier.com/hc/en-us/articles/8495978803213-Find-and-update-spreadsheet-rows-in-Google-Sheets-on-Zapier), and [sheet structure requirements](https://help.zapier.com/hc/en-us/articles/8496276985101-Work-with-Google-Sheets-in-Zap-workflows), checked September 8.


## 13:40 EDT update
Dillon explicitly renewed authorization for a standalone Slack update. Sent and read back top-level message https://momentum3d.slack.com/archives/C0BB04ZFZ26/p1788889232120289. Madison clarified that posts 1-3 need final asset approval and posts 4-9 need concept/caption approval before design. This supersedes the earlier uncertainty about which posts await which decision. Jenny was asked for the exact client-facing destination. Workflow remains OFF; no automated client delivery occurred.
