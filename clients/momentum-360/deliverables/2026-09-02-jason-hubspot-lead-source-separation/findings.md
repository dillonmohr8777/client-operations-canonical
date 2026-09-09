# Momentum 360 HubSpot: Digital vs 360 lead-source separation

Status: research complete, no changes made. Recommendation pending Jason/Sean execution.

## Handoff header

- Portal ID: `50612503` (Jason Fallon / Momentum 360), portal guard passed
- Access path: `agent/Invoke-JasonHubSpotAgent.ps1 lead-source-audit` in
  `jason-fallon-hubspot-agent`, Windows DPAPI credential, read-only
- Evidence timestamps: 2026-09-02 22:45-22:47 America/New_York
  (HubSpot API 2026-09-03T02:45Z-02:47Z)
- Read/write boundary: read-only. No CRM record, property, form, workflow, integration,
  or settings change was made. The launcher implements no write path.
- Reporting windows, America/New_York:
  - Incident window: 2026-08-31 00:00 through 2026-09-02 22:45
  - Lookback window: 2026-07-05 00:00 through 2026-09-02 22:45
- Sources checked: `/integrations/v1/me`, `/crm/v3/properties/contacts`,
  `/crm/v3/objects/contacts/search`, `/marketing/v3/forms`, `/automation/v4/flows`,
  and four ads-API endpoint families
- Unavailable sources: Conversations (`403 MISSING_SCOPES`, known and unrelated),
  marketing campaigns (`403 MISSING_SCOPES`), all ads endpoints (`404`),
  marketing events (`405`)
- Readiness: `status: degraded`, `readyForReadReporting: true`, `readyForWrites: false`.
  Degraded is caused only by the Conversations scope gap.
- Output paths (aggregate, PII-safe):
  - `jason-fallon-hubspot-agent/evidence/2026-09-02-lead-source-audit-window-aug31-sep02.json`
  - `jason-fallon-hubspot-agent/evidence/2026-09-02-lead-source-audit-lookback-60d.json`
- PII: none. No names, emails, phone numbers, or contact record IDs appear in any
  artifact. High-cardinality tails are collapsed to a withheld-count bucket.

## Headline

Melissa's read is correct. Zapier is not creating contacts in HubSpot. The Facebook/Meta
lead-ads connection on portal `50612503` is syncing lead forms from **both** Momentum
Digital and Momentum 360 campaigns. Over the last 60 days, **74 of 150** Meta lead-ad
contacts (49 percent) arrived on Momentum Digital forms. The fix is one setting in the
HubSpot Ads tool, executed by Jason or Sean.

There is no 17hats or WhatConverts data in this portal at all. Nothing to remove there.

## 1. Contacts created in the incident window

Window: 2026-08-31 00:00 through 2026-09-02 22:45 America/New_York.
Total contacts created: **69**.

By day, America/New_York:

| Day | Contacts created |
|---|---|
| 2026-08-31 | 26 |
| 2026-09-01 | 24 |
| 2026-09-02 | 19 |

By how HubSpot recorded the record (`hs_object_source_label`):

| Source label | Contacts | What it is |
|---|---|---|
| INTEGRATION | 33 | CallRail 30, Square 3 |
| FORM | 22 | 17 Meta lead-ad forms, 5 website/HubSpot forms |
| CRM_UI | 11 | Manual creation by HubSpot users |
| PAYMENTS | 2 | HubSpot Payments contact creator |
| CONVERSATIONS | 1 | AI agent / chat capture |

By first-touch analytics source (`hs_analytics_source`):

| Analytics source | Contacts |
|---|---|
| OTHER_CAMPAIGNS | 30 |
| PAID_SOCIAL | 18 |
| OFFLINE | 15 |
| DIRECT_TRAFFIC | 4 |
| ORGANIC_SEARCH | 2 |

The 30 `OTHER_CAMPAIGNS` records are the CallRail integration (app id `28280`).
The 18 `PAID_SOCIAL` records are the Meta lead-ads sync.

## 2. Ingest-path map

Every path that created a contact in the 60-day lookback, by integration app id:

| Path | App / source id | Contacts (60d) | Contacts (window) | Creates contacts? |
|---|---|---|---|---|
| CallRail | `28280` | 540 | 30 | Yes |
| Meta / Facebook lead ads | per-submission GUID, PAID_SOCIAL | 150 | 17 | Yes |
| Manual CRM UI | `userId:*` | 93 | 11 | Yes |
| Square | `236006` | 23 | 3 | Yes |
| Calendly | `199720` | 16 | 0 | Yes |
| Website / HubSpot forms | form GUID, non-paid-social | 72 | 5 | Yes |
| Conversations / AI agent | `aiAgentUserId:89602231` | 14 | 1 | Yes |
| HubSpot Payments | `Payments Customer Contact Creator` | 10 | 2 | Yes |
| Email integration, quotes, internal | assorted | 7 | 0 | Yes |
| **Zapier** | none observed | **0** | **0** | **No** |
| **17hats** | none observed | **0** | **0** | **No** |
| **WhatConverts** | none observed | **0** | **0** | **No** |

Answering Jason's questions directly:

- **Which lead sources are connected via Zapier?** None that create contacts. Over
  60 days and 925 created contacts, zero records carry a Zapier integration source.
  The only Zapier object in play is the "New HubSpot Lead / Contact" notification Zap
  Alexandra found. That Zap reads new HubSpot contacts and posts a Slack alert. It is
  downstream of the problem, not the cause. That is why an alert fired for a Digital
  lead: the contact was already in HubSpot before the Zap ran.
- **Remove anything from 17hats/WhatConverts.** There is nothing to remove. No
  contacts, no source values, and no contact properties referencing either tool exist
  in portal `50612503`. If either was ever connected, it is inactive.

## 3. Meta lead-ad forms currently syncing into HubSpot

This is the actual defect. Nine distinct Meta lead forms synced into portal `50612503`
in the last 60 days, spanning two separate businesses.

Incident window (2026-08-31 through 2026-09-02), 17 Meta lead-ad contacts:

| Meta lead form | Meta campaign | Contacts | Belongs to |
|---|---|---|---|
| July - Alexandra - Form #3 - 360 | alexandra - 360 - leads campaign - aug | 6 | Momentum 360 |
| July - Alexandra - Form-2 | leads campaign - alexandra - test - seo lead form | 5 | Unconfirmed |
| 2026_Mel BOOK YOUR FREE CALL-WEBSITE REDESIGN | new leads campaign: website mel aug test | 3 | Momentum Digital |
| Google Business Profile Suspended? We Can Help.-copy-copy | suspension_testing_adset_budget_2026 | 1 | Momentum 360 |
| Competitor Audit -Verify Number-Mac calendly | competitor audit general leads | 1 | Momentum Digital |
| Local Visibility Leads Form-Verify Number- Mac schedule link | organic facebook lead | 1 | Momentum Digital |

One additional contact was created manually in the CRM UI carrying the
`alexandra - 360 - leads campaign - aug` campaign.

Window totals: **7 confirmed 360**, **5 confirmed Momentum Digital**,
**5 unconfirmed** (the unlabeled Alexandra form).

60-day lookback, 150 Meta lead-ad contacts:

| Meta lead form | Contacts | Belongs to |
|---|---|---|
| July - Alexandra - Form-2 | 30 | Unconfirmed |
| 2026_Mel Test_ BOOK YOUR FREE CALL | 29 | Momentum Digital |
| 2026_Mel BOOK YOUR FREE CALL-WEBSITE REDESIGN | 26 | Momentum Digital |
| July - Alexandra - Form | 19 | Unconfirmed |
| Competitor Audit -Verify Number-Mac calendly | 15 | Momentum Digital |
| July - Alexandra - Form #3 - 360 | 11 | Momentum 360 |
| Google Business Profile Suspended? We Can Help.-copy | 10 | Momentum 360 |
| Google Business Profile Suspended? We Can Help.-copy-copy | 6 | Momentum 360 |
| Momentum Digital New Remarketing Form 2025 | 3 | Momentum Digital |
| Local Visibility Leads Form-Verify Number- Mac schedule link | 1 | Momentum Digital |

60-day totals: **27 confirmed 360**, **74 confirmed Momentum Digital**,
**49 unconfirmed**, plus 5 CRM-UI records carrying a paid-social campaign.

Basis for the Digital classification: form and campaign names carrying Mel, Mac, md,
Momentum Digital, website-redesign and competitor-audit offers. Basis for the 360
classification: the explicit `- 360` suffix and the Google Business Profile suspension
program, which `REPORTING_REQUIREMENTS.md` lists as a 360 channel.

**Open question for Jason:** the two unlabeled Alexandra forms (July - Alexandra - Form
and July - Alexandra - Form-2, 49 contacts over 60 days) run under the campaign
`leads campaign - alexandra - test - seo lead form`. A third form by the same author is
explicitly suffixed `- 360`, which implies the unsuffixed two may not be. Confirm before
selecting or deselecting them.

The claim that the connection is set to all forms is consistent with the evidence: nine
distinct forms from at least two businesses, including test and duplicate -copy-copy
forms, all flowing in without curation.

## 4. Recommended change

HubSpot exposes no read API for the Facebook lead-sync form selection. Every ads
endpoint returned 404 and the campaigns endpoint returned 403. The setting must be
changed in the HubSpot UI, and the exact on-screen label should be confirmed there.

**Executed by: Jason Fallon or Sean.** A HubSpot Super Admin on portal `50612503` is
required. Melissa cannot do this; her HubSpot access was removed on 2026-09-02.

### Option A, per-form selection (minimum change)

1. HubSpot, portal `50612503`
2. **Marketing > Ads**
3. Top right, **Settings** (or the gear icon on the Ads dashboard)
4. Select the connected **Facebook / Meta ad account**
5. Open **Lead syncing**
6. Turn **off** the option that syncs every lead form, worded in the HubSpot UI as
   "sync all lead ads forms" or "automatically sync leads from new forms"
7. Select **only** the approved Momentum 360 forms. Based on this audit that is
   July - Alexandra - Form #3 - 360 and the two Google Business Profile Suspended
   forms, plus the two unlabeled Alexandra forms if Jason confirms they are 360.
8. Deselect all five Momentum Digital forms: 2026_Mel Test_ BOOK YOUR FREE CALL,
   2026_Mel BOOK YOUR FREE CALL-WEBSITE REDESIGN,
   Competitor Audit -Verify Number-Mac calendly,
   Momentum Digital New Remarketing Form 2025,
   Local Visibility Leads Form-Verify Number- Mac schedule link
9. Save

If the connection was made as an app rather than through the Ads tool, the same panel
is at **Settings (gear) > Integrations > Connected Apps > Facebook Ads >** the ad
account **> Lead syncing**.

### Option B, disconnect the Digital ad account (durable change, preferred)

If Momentum Digital runs its Meta campaigns from a separate ad account or page, the
better fix is to remove that account from portal `50612503` entirely:

1. **Marketing > Ads > Ad accounts** (or **Settings > Integrations > Connected Apps >
   Facebook Ads**)
2. Disconnect the Momentum Digital ad account and any Momentum Digital Facebook page
3. Leave only the Momentum 360 ad account and page connected

Option B is preferred because it survives new form creation. Under Option A, any new
Momentum Digital lead form can reappear in the 360 portal if the auto-sync setting is
ever re-enabled or if the connection is re-authorized.

### What Melissa should remove or change on the Zapier side

Nothing for ingest. The evidence shows no Zap creates HubSpot contacts, so disabling
Zaps will not stop Digital leads from landing in HubSpot.

The one relevant Zap is the New HubSpot Lead / Contact notification Zap Alexandra
identified. It only posts Slack alerts. Once the Meta form selection is corrected, that
Zap stops alerting on Digital leads on its own, because those contacts will no longer
exist in HubSpot. If Digital lead alerts should continue, they need a separate trigger
sourced from Digital's own system, not from portal `50612503`.

### Second, larger issue to verify separately

CallRail is the single biggest ingest path into this portal: **540 of 925** contacts
over 60 days, 58 percent, and 30 of 69 in the incident window. The repository daily-health
gate records the connected CallRail account as Momentum Digital LLC, account 671942387.
If that CallRail account also carries Momentum Digital tracking numbers, it is a second
and much larger Digital-to-360 crossover than the Meta forms. This audit cannot confirm
that from the HubSpot API. It needs a look at the CallRail account tracking-number list.
Do not treat this as a confirmed defect yet, and do not close the separation work
without checking it.

## 5. Cleanup decision still owed

Five contacts created in the incident window, and 74 over 60 days, came in on Momentum
Digital Meta forms. Correcting the setting stops new ones; it does not remove those.
Jason and Sean need to decide between deleting them and tagging them for exclusion from
360 reporting. Until that decision is made, any 360 lead-volume or cost-per-lead number
computed from this portal over the last 60 days is overstated by up to 74 contacts, and
by up to 123 if the unlabeled Alexandra forms are also Digital.

## 6. Verification plan after the change

1. Note the exact timestamp of the setting change, America/New_York.
2. At 24 hours, run the launcher command
   `lead-source-audit --start CHANGE_ISO_TIME --end NOW_ISO_TIME`.
3. Pass criteria:
   - `distributions.paidSocialByFormAndCampaign` contains only approved 360 form names
   - zero contacts on any Mel, Mac, md, or Momentum Digital form
   - `contactsCreatedInWindow` falls by roughly the Digital share, about 2 per day at
     the current rate
4. Repeat at 7 days to catch forms that sync intermittently.
5. Re-run the 60-day lookback monthly to catch a re-enabled auto-sync.
6. Separately verify the CallRail account scope before declaring the lanes separated.

## 7. Limitations

- Business ownership of each form is inferred from form and campaign names, not from a
  HubSpot field. Jason should confirm the mapping, especially the two unlabeled
  Alexandra forms.
- The Facebook lead-sync form selection cannot be read through the API. The conclusion
  that it is set to all forms is supported by the breadth of forms observed, not by
  reading the setting itself.
- `/marketing/v3/forms` returns only the 17 native HubSpot forms. Meta lead forms are
  not listed there; they are visible only through the contact-source properties of the
  records they created.
- The 60-day lookback rules out Zapier, 17hats, and WhatConverts for that window only.
  It does not prove they were never connected.
- Contact-source properties describe how HubSpot recorded a record. They are not an
  approved business attribution, and none of these counts are verified or qualified
  leads under `REPORTING_REQUIREMENTS.md`.
- Conversations remains `403 MISSING_SCOPES`. That gap is known, pre-existing, and does
  not affect this finding.
