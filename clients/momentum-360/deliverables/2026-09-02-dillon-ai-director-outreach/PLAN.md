# How to run Erie and Pittsburgh from Dillon's Gmail

> Historical execution plan prepared 2026-09-02. This is not an active send instruction. Live Gmail reconciliation on 2026-09-03 verified 241 unique SENT messages across two completed waves. See `sends/gmail-reconciliation-2026-09-03.json` for the current aggregate truth state.

## Identity

- From: `dillonmohr8777@gmail.com`
- Title: AI Marketing Director
- Signature: Momentum HTML signature, Need Momentum URL
- Erie notes: Dillon grew up in Erie. Use `drafts/template-erie.html` and `personalization/erie-hometown.md`. Signature geography is Erie, Pennsylvania.
- CC: empty
- Proof sites: `needmomentum.com` and `momentumvirtualtours.com`
- Not used: Immortal, Philadelphia radar, UPS

## Historical daily machine

1. Pick the next Erie or Pittsburgh official site from `list/first-review-batch.json`, then `list/priority-candidates.json`. Alternate cities so the batch is not one town.
2. Run the Grok 4.5 prompt once per business.
3. Reopen the official URL and confirm the one-sentence observation.
4. Drop anyone with a current Momentum relationship, a suppression hit, or an existing draft.
5. If the row is Erie, fill `drafts/template-erie.html` using `personalization/erie-hometown.md`. If the row is Pittsburgh, fill `drafts/template.html`. Save a named preview.
6. Stop. Put the exact preview in Dillon's Gmail. Under the original plan, send to the business only after he approves that preview.

Grok is cheap research. It is not the sender.

## Historical volume guardrail

The mailbox was Dillon's personal Gmail because that was the send identity he named. The original guardrail was to review 15 drafts before any send and raise daily volume only after reply and bounce results were visible. It is preserved here as the planned control, not as the actual execution record.

## Reconciled outcome and next action

- Gmail SENT contains 41 wave 1 messages and 200 wave 2 messages, with 241 unique recipients and no duplicate recipient and subject pairs.
- Two explicit bounce notices, two automated absence replies, and zero verified human replies were found.
- The absence of an explicit bounce for 239 messages does not prove delivery.
- The wave 1 local log covers 7 of the 41 Gmail SENT messages. Do not fabricate the 34 missing local message IDs.
- Twenty one wave 1 Gmail subjects differ from the planned local subjects; wave 2 matches the local recipient and subject manifest exactly.
- No additional send, resend, or follow-up is authorized by this historical plan. A future action needs current reply and suppression checks plus a newly approved exact preview.

## What the pitch can say

Dillon can call this Pennsylvania's most current AI marketing operation because the recent work is film, scroll web, AEO pages, and live site systems. Do not pretend the Need Momentum homepage already uses that line. That homepage still reads as a Philadelphia SEO and ads agency. The futuristic proof is the work links, not a slogan on the WordPress home.
