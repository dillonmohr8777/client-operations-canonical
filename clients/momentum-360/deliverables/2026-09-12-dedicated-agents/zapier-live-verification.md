# Published lead automation verification

State: READ_ONLY_VERIFIED on 2026-09-12 after desktop restart. Source: authenticated Zapier published editor in Momentum Digital account. No Edit, Test, Run, Replay, Publish, toggle or credential action was taken. Saved summaries omit personal contact values.

| Automation | Published state | Actual flow | Observation |
|---|---|---|---|
| [379667050: Momentum - Facebook Suspension leads to Sheets to Slack to Hubspot](https://zapier.com/editor/379667050/published) | ON, v3, UI says in use 2 days ago | Facebook New Lead -> Sheets Create Row -> HubSpot Create or Update Contact -> Slack Send Channel Message | Campaign Name maps to UTM Campaign; Adset Name to UTM Content; medium literal cpc; source literal Facebok; Ad Name to UTM Term. Slack destination 360leads, template includes Meta Lead Ads campaign, form answers, and HubSpot portal50612503 link from step3 Vid. |
| [365085675: 360 Hubspot Leads to Slack (Test 5/20/26)](https://zapier.com/editor/365085675/published) | ON, v2 new channel, in use May20; separate unpublished draft exists | HubSpot New Contact, 1 minute polling -> Slack Send Channel Message | Destination360leads. Generic contact template includes contact fields followed by literal empty Source =. No intervening filter or dedup step in published flow. No CRM link in shown template. |

Source history: two runs under displayed Last30days filter, Successful Sep11 02:14pm (3tasks), Sep10 11:55am (2tasks). Run IDs 002d283d-4d2b-a0ab-c363-644e14461814 and 002d283d-b038-ab5f-b5aa-950b12492d24. Companion history:408 runs Last30days; latest shown Successful Sep12 06:06am, ID002d283d-bff9-a4b8-f992-83ed234babe4. Times copied as displayed; account timezone unverified. Run success is provider status, not a separately checked Slack receipt. Individual payloads were not traced to these two CRM records.

The source Slack step also displays a field labelled Send Channel Message? = false, while the companion displays true. Its exact legacy-connector semantics were not established; do not equate that field with Zap disabled or infer a missing delivery. Source top-level ON and history are independently observed.

Finding: the blank-source defect is confirmed in the companion's published configuration. The overlapping source-specific and generic-contact paths match the Sept10 team's duplicate explanation; exact per-event cross-path correlation still requires run payload mapping. Current CRM snapshot independently shows populated campaign and owner for both target records. Do not fix this by guessing source from names or timestamps.

## Smallest repair to stage for approval

1. Preserve existing unpublished draft365085675; obtain its owner intent before editing it. Capture published version references and exact step mappings.
2. Companion step2: map source and campaign from current HubSpot properties, showing Unknown when absent; include canonical portal50612503 contact link and owner. Resolve exact Zapier token names from current trigger output before saving. This repairs blank alerts even before dedup work.
3. Source step3: change future UTM source spelling Facebok to facebook with reporting-owner agreement; preserve original source in historical evidence. No historical bulk rewrite.
4. Persist each provider lead event ID, source identity and resulting step3 CRM ID in an inquiry-level ledger. Route both notification paths through the same event ledger only after explicit mapping exists. ContactID alone cannot suppress a new inquiry. Unknown mappings enter review and preserve both records.
5. Controlled approval test: one new synthetic Meta inquiry, exact retry, and same-contact second inquiry; record source-eventID->CRM ID->Slack timestamp. Prove one alert per inquiry, no duplicate on retry, and a second alert for second inquiry. Include source/campaign/owner/link. A successful Zap run without a Slack readback does not satisfy delivery.
6. Rollback: restore captured published versions only with approval, stop new dispatch first, retain event and delivery receipts. Do not bulk replay histories.

Adjacent observation: Zapier asset page reports40 held runs until Sep13. Account-wide banner only; these were not attributed to Momentum lead Zaps or replayed.
