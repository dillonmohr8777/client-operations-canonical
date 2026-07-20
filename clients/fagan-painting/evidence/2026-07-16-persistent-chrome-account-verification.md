# Persistent Chrome account verification

Observed: 2026-07-16 EDT

## Confirmed

- The persistent authenticated Chrome session opened Meta Ads Manager.
- The account selector and page context both showed `Fagan Painting LLC (892789268275012)`.
- The account ID matches the canonical Fagan Access Broker endpoint exactly.
- Campaign rows were visible in the account, confirming this was account access rather than a login or selector screen.
- The read-only Access Broker event was recorded as successful.

## Other account checks

- The Fagan Gmail route reached the exact account password gate, but the approved vault autofill path did not complete. No credential was exposed or copied. This remains a human authentication handoff.
- The currently authenticated Zapier workspace contained no Fagan workflows after the owner filter was removed. It is not evidence of the required Fagan Zapier account, so workflow state remains unverified.

## Lead reconciliation

- Two July 15 lead records remain direct-notification verified but operational disposition is still awaiting the human owner response.
- One lead is the commercial exterior request acknowledged in the Fagan Slack channel.
- No prospect contact details are stored in this artifact.
