# Google Ads manager account and customer IDs

Verified live 2026-09-09 from the Google Ads account picker signed in as
`dillonmohr8777@gmail.com`, and cross-checked against
`GOOGLEADS_LIST_ACCESSIBLE_CUSTOMERS`, which returned the same 16 accounts.

## The manager account

**`703-867-3437` — Dillon Mohr Hermes Agent.** This is the only account in the
picker flagged **Manager**. It is Dillon's MC ID.

### Correcting a number that is circulating

`743-802-1996` appears in this estate as "Momentum Ads Manager", including in the
titles of `dillon-os` PR #331 which tried to pin the Nexla manager link to it.
**That is not Dillon's manager account.** It does not appear in his accessible
customer list, and API calls against it return `USER_PERMISSION_DENIED`. It is
presumably Momentum's agency MCC, administered by someone else. Any task that
needs a link to that MCC depends on whoever owns it, not on Dillon.

## Customer IDs

| Account | Customer ID |
|---|---|
| **Dillon Mohr Hermes Agent (Manager)** | **703-867-3437** |
| Nexla | 791-780-2207 |
| Bar Crawl USA | 435-710-2897 |
| Omega Landscaping | 285-398-1364 |
| Shadow Heating and Cooling | 314-136-4176 |
| Kimberly James Bridal | 814-550-6229 |
| Kimberly James Bridal (New) — **Cancelled** | 721-491-4099 |
| Replenish | 627-501-4654 |
| New Kensington Community Development Corporation | 100-209-6937 |
| Onsite Concrete & Landscape | 103-371-5894 |
| Commercial Cleaners Alliance | 996-681-9458 |
| Capsule & Tonic (NEW) | 715-518-1643 |
| Mac YT Ads | 741-199-9445 |
| BOM | 772-955-2145 |
| Revive Fitness / Mike Over LSA | 648-634-5529 |
| LinkEZE | 809-600-6448 |

## Why the API path does not work, and why that is not a re-auth problem

`connector-health.json` recorded this on 2026-08-27 and it was reproduced in full
on 2026-09-09:

- `GOOGLEADS_LIST_ACCESSIBLE_CUSTOMERS` **succeeds** and returns all 16 accounts.
- Every per-account `GAQL searchStream` call **fails 403**. All 16 were tested
  individually on 2026-09-09. Most return `USER_PERMISSION_DENIED` carrying
  Google's own hint that *"the manager's customer id must be set in the
  `login-customer-id` header"*. A few return `CUSTOMER_NOT_ENABLED`.
- The Composio connection's default customer is `690-859-2139`, which is
  **deactivated**, so even an unqualified call fails.

**The Composio `googleads` tool exposes no parameter for `login-customer-id`.**
`GOOGLEADS_SEARCH_STREAM_GAQL` accepts only `query`, `customer_id` and
`summary_row_setting`. `COMPOSIO_MANAGE_CONNECTIONS` supports only add, rename,
list and remove, so the manager ID cannot be attached to the existing connection
either. This is a capability gap in the tool, not a credential problem.
**Re-authenticating will not fix it.**

## What to use instead

Persistent Chrome, signed in as `dillonmohr8777@gmail.com`, which already holds
the MCC session. That is the documented execution surface for this roster and it
is what produced the verification above.

For programmatic access the options are a direct Google Ads API client that sets
the `login-customer-id` header to `703-867-3437`, or a connector that exposes it.
Neither exists in the current stack.

## Standing rules

Ad accounts are read-only unless Dillon asks for a specific change. Never pause,
enable, or alter a budget or campaign without an explicit instruction naming the
account and the change.
