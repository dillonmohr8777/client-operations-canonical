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

---

## End-to-end API path, traced 2026-09-09

Traced through the Google Ads UI and Google Cloud console in persistent Chrome as
`dillonmohr8777@gmail.com`. This supersedes the developer-token assumptions above.

### 1. Google no longer gates on developer tokens

The API Center for `703-867-3437` now carries this notice verbatim:

> Google Ads API access has changed. Developer tokens are no longer required for
> using the Google Ads API. API access levels are now managed exclusively in the
> Google Cloud Console. The levels displayed on this page may no longer be
> accurate and cannot be upgraded from this page.

So "apply for Basic access from the API Center" is **obsolete advice**. Do not
plan around it.

### 2. What already exists

- A developer token is present on the MCC, masked behind a **View token** control.
  It was deliberately **not viewed, copied or recorded**. It is no longer the gate
  in any case.
- Access level still displays **Test Account**, which under the old model meant
  production accounts return permission errors. The page itself warns this display
  "may no longer be accurate".
- Developer details are already complete: API contact `dillonmohr8777@gmail.com`,
  company **Dillon Mohr Hermes Agency**, URL `momentumvirtualtours.com`, type
  **Agency/SEM**, principal place of business United States, intended use recorded
  as internal marketing operations and client reporting automation.

### 3. The actual blocker

In Google Cloud project **`momentum-360-489301`** (display name "Momentum 360"),
the **Google Ads API is not enabled**. The API library page renders an **Enable**
button rather than a management panel.

Nothing downstream can work until that is enabled, regardless of tokens, MCC
choice or connector.

### 4. Creating a new manager account would not help

A new MCC changes none of the above. The Composio connector still exposes no
`login-customer-id` parameter, and the Cloud project still would not have the API
enabled. **Do not create a new MCC to solve API access.**

### 5. Order of operations if API access is wanted

1. Decide whether `momentum-360-489301` is the right project. It is a Momentum
   project, so enabling an API there may be Momentum's decision rather than
   Dillon's. A personal Cloud project is the cleaner alternative.
2. Enable the Google Ads API on the chosen project.
3. Create an OAuth client and generate a refresh token for `dillonmohr8777@gmail.com`.
4. Build a direct API client that sets `login-customer-id: 7038673437` on every
   call. No connector in the current stack sets that header.
5. Until then, persistent Chrome remains the working surface, as it has been.

---

## Resolved 2026-09-09 evening

| Step | State |
|---|---|
| Manager account identified | **703-867-3437**, Dillon Mohr Hermes Agent |
| Google Ads API on `momentum-360-489301` | **Enabled** |
| API access level | **Explorer**, approved on application |
| Production API operations | **2,880 per day**, plus 15,000 on test accounts |
| Client that sets `login-customer-id` | `scripts/google-ads-query.mjs` |
| Refresh-token helper | `scripts/google-ads-get-refresh-token.mjs` |
| Remaining | OAuth client and refresh token, Dillon's to create |

Explorer covers campaign management and reporting on production accounts. **Basic
was deliberately not requested**: it requires Brand Verification and consent to
share Cloud branding information, and Explorer's 2,880 daily production operations
are ample for reporting across this roster.

### Finishing it

1. Create an OAuth client, type **Web application**, in `momentum-360-489301`,
   with redirect URI `http://localhost:8720/oauth2callback`. An existing client
   named "Momentum 360 GBP Connect" is present but its redirect URIs are scoped to
   that integration, so a dedicated client is cleaner.
2. `node scripts/google-ads-get-refresh-token.mjs` and approve as
   `dillonmohr8777@gmail.com`. **Run this yourself.** It prints a refresh token to
   the terminal, which is a credential.
3. Set `GOOGLE_ADS_CLIENT_ID`, `GOOGLE_ADS_CLIENT_SECRET`, `GOOGLE_ADS_REFRESH_TOKEN`
   and `GOOGLE_ADS_DEVELOPER_TOKEN` in the shell.
4. `node scripts/google-ads-query.mjs --accounts` should list the accounts under
   the MCC. That is the end-to-end proof.

Neither script reads a credential from disk or writes one. `--selfcheck` reports
only which variable **names** are missing, never a value.

### What this replaces

The Composio `googleads` route stays broken and is not worth further effort: the
tool exposes no `login-customer-id` parameter, so it cannot reach production child
accounts no matter how access levels are configured.
