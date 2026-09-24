# Lead Operations: six proposed acceptance cases

Status: Codex-reviewed test designs. Not executed. This subset does not establish pilot acceptance.

Source: [PLAN.md](PLAN.md), Lead Operations scope and acceptance rules. Full acceptance still requires all 30 agreed cases passing, destination readback for accepted records, zero unresolved critical defects, five successful operator cases, and written client acceptance through the account owner.

Use an isolated test workspace and synthetic accounts. Agree required fields, deduplication key, destination mapping, retry limits and operator permissions before execution. HTTP codes, email requirements and alerts are implementation decisions, not established source requirements.

| Case | Synthetic setup and action | Expected result | Evidence to collect |
|---|---|---|---|
| Duplicate | Submit LEAD-001 twice concurrently with the same agreed idempotency key and account. | Exactly one destination record; both requests resolve to that record or an explicitly tracked duplicate disposition. | Correlated request receipts, destination query and matching record identifier. |
| Missing input | Omit one field explicitly required by the agreed intake contract. | Reject or quarantine according to that contract; no destination write. | Validation reason, exception/rejection receipt, destination lookup. |
| Timeout and retry | Commit LEAD-002, suppress its response, then retry with the same account-scoped key. | Resolve uncertain commit status without duplicating the record. Any retry policy remains proposed until agreed. | Original commit receipt, retry trace and one-record destination readback. |
| Cross-account | Route an account A request toward synthetic account B without authorization. | Deny before writing. Account B remains unchanged; exception stays within account A's authorized boundary. | Sanitized denial receipt and before/after destination comparison. |
| Readback mismatch | In the isolated destination, cause one contracted field to differ from the submitted value. | Flag the mismatch, retain it for review and withhold successful-acceptance status. | Submitted payload, readback, field-level difference and exception record. |
| Operator exception | Present one known recoverable validation failure to the named operator. | Operator identifies the cause, follows the agreed correction/retry procedure, obtains readback and closes the exception with a traceable disposition. | Supervised action record, corrected destination readback and closed exception. This is one candidate case toward the required five operator cases. |

Model contribution: Qwen3.8-27B generated the initial six-case JSON in 9.833 seconds, using 214 prompt tokens and 649 completion tokens, with finish reason `stop`. Structural checks passed. Codex removed unsupported API/field requirements, tightened account isolation and required actual operator resolution. These are design checks, not executed system tests.
