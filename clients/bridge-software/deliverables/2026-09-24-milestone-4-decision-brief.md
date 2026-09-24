# Bridge Milestone 4 decision brief

Status: source reviewed; proposals below await Tori's decision, not approved requirements or completed implementation.
Evidence checked September 24, 2026: Gmail thread `1a0cf0823756eb89`, Melissa's September 23 attachment `Bridge_Milestone4_Directory_MVP_Client_Requirements.xlsx`; Slack channel `C0BGWRK03B2`, parent `1790154703.474949` and updates through `1790208827.033859`.

The supplied workbook has 53 questions. Its Client Answer / Decision and Follow-up / Owner cells are blank and each status is Open. Melissa reported Tori was working on it September 23; no returned answer sheet was found in the current exact-thread read. An unsent generic acknowledgment exists; it is not a delivered response.

## Decisions to settle first

| Decision | Workbook references | Proposed decision owner | Concrete output |
|---|---|---|---|
| MVP boundary and audience | Q-01, Q-02, Q-11, Q-52 | Tori, with Melissa | Confirm the four business profile types and included/deferred features. Explicitly settle consumer access, messaging, and subscriptions before expanding scope. |
| Account and organization ownership | Q-03 to Q-08, Q-47 | Tori with Miraj | One matrix for who may create, manage, edit, save drafts, submit, approve and contact each profile type, including multiple managers and rep affiliations. |
| Privacy and directory visibility | Q-10, Q-12 to Q-21, Q-27, Q-28, Q-34 | Tori | Required fields, directory eligibility, public/member/admin visibility, private contact details, final category vocabulary, searchable fields, filters, sort and pagination. |
| EIN integration | Q-22 to Q-26, Q-51 | Tori for account ownership; Miraj for integration | Confirm applicable types, existing backend contract, provider account owner, sandbox route, status/retry behavior. Credentials must use a protected handoff, not the workbook or email. |
| Contact and notification routing | Q-29 to Q-40 | Tori for recipients/provider; Miraj for behavior; Dillon for proposed copy | Named role recipients and fallback, contact form fields, in-app/email event matrix, production sender and provider owner. |
| Approval and acceptance | Q-41 to Q-53 | Tori for approval; Miraj and Dillon for test evidence | State transitions, correction reasons, reapproval rules, retention, representative role accounts and measurable acceptance checks. |

## Proposed MVP defaults for review

- Keep the directory focused on the four business profile types in Miraj's workbook. The professional-only boundary still needs Tori's explicit answer.
- Show only approved, active profiles that meet the agreed completeness rule. Do not expose EIN values or private account metadata on cards or detail pages.
- Route initial contact requests internally; keep email and phone private unless Tori explicitly approves a visibility exception. Require a named fallback recipient rather than silently dropping a request.
- Use text-only contact requests for the MVP; defer attachments, instant messaging and subscriptions until accepted in scope. Business logos can be separately approved under Q-09.
- Reuse the existing backend EIN workflow only after Miraj confirms its actual API contract and authority. Do not treat the workbook's reference to an existing workflow as proof it is configured or working.
- Keep previously approved public data visible while an ordinary edit awaits reapproval, but hide suspended profiles immediately. Tori must approve the field-level exceptions and retention policy.
- Prefer numbered pagination and a simple documented sort. Neither is a substitute for final search/filter decisions.

## Proposed acceptance checks

1. Each of the four profile roles and the admin can perform only its approved actions; an unrelated user cannot edit or approve another organization's profile.
2. Draft, submitted, correction, approved and suspended states produce the agreed visibility; direct URLs obey the same permissions as the directory.
3. Private fields never appear in public search results, cards, detail responses or contact notifications.
4. EIN pending, pass, fail, retry and override paths match the agreed contract; no real credential or business identity is invented for testing.
5. Contact requests reach the intended recipient once, use the explicit fallback when necessary, and do not expose private contacts.
6. Notifications match the approved event matrix without duplicates; email uses the agreed sender and approved test inbox.
7. Search, filters and pagination preserve the chosen role and visibility constraints on mobile and desktop.

## Next handoff

Return Tori's completed workbook in the existing email thread. If it is not finished, settle the six decision groups above first. Miraj should identify the exact backend/API and sandbox dependencies; Dillon can then map screens, labels and test evidence to those accepted rules. No production code, permissions, profile data or client decision was changed by this brief.
