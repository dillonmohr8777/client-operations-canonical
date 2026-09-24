# Onsite: calls, ad delivery, website visibility, and the analytics gap

Prepared September 8, 2026. Google Ads customer **103-371-5894**. Website **onsiteconcretelandscape.com**. Google Ads window **April 1 through September 8, 2026**, in the account's Pacific time zone. September 8 is partial. This is an internal evidence audit and an unsent response draft.

The direct Google Ads record contradicts the literal claim that the ads produced “not even 1” call. The call-detail report contains **three records marked Received**: one lasting 38 seconds on April 27 and two lasting 10 and 7 seconds on June 17. It does not establish how many calls became useful conversations, estimates, or jobs.

The wider account history shows **65 website phone-click events, 32 website form events, and 1 ad-call conversion event**, alongside **3,522 ad clicks and 114,944 impressions on $1,042.99 of spend**. Those are meaningful recorded interactions on a modest actual spend. They are not 98 verified leads or 66 answered calls.

The useful organic-search finding is narrower: Semrush's organic-keyword metric increased from **38 in April to 41 in September**, or **7.9%**. The available evidence does not prove that total website traffic increased, and it cannot attribute organic rankings to ad spend.

## 1. The strongest call evidence

| Date and time as Google displays them | Duration | Status | Source | Campaign |
| --- | ---: | --- | --- | --- |
| April 27, 2026, 9:00 AM | 38 seconds | Received | Ad, mobile click-to-call | Leads-Performance Max-1 |
| June 17, 2026, 3:00 PM | 10 seconds | Received | Ad, mobile click-to-call | Leads-Performance Max-1 |
| June 17, 2026, 3:00 PM | 7 seconds | Received | Ad, mobile click-to-call | Leads-Performance Max-1 |

**Original evidence:** [received-call screenshot](evidence/google-ads-received-calls.png) and [live Google Ads call-detail report](https://ads.google.com/aw/reporteditor/view?ocid=6908592139&predefinedReportId=122). Reapply the stated date window when opening the live link.

Caller numbers and recordings were unavailable. The two June rows share the displayed hour, so three rows cannot be presented as three different customers. A Received status and duration also do not establish who answered, whether voicemail was involved, service fit, or a booked estimate.

This supports a calm factual correction: there is documented call activity from ads. It does not justify telling the client that she received dozens of good calls or that her concern about business volume is false.

## 2. What the conversion counts actually measure

| Google Ads action name | Count | What the evidence supports |
| --- | ---: | --- |
| Web Phone Calls | 65 | Website telephone-link click events |
| Web Contact Form | 32 | Website form events, pending reconciliation to accepted and delivered inquiries |
| Calls from Smart Campaign Ads | 1 | An ad-call conversion event attributed in this account to Performance Max |
| Total | 98 | Recorded conversion events, not a count of unique qualified leads |

The public Google Tag Manager configuration contains the exact conversion label shown in the live Web Phone Calls action. Its trigger is a link click where the URL begins with `tel:`. This establishes that the configured event can fire when someone taps a telephone link, without proving a completed conversation. The matching form tag uses `gtm.formSubmit`, which does not independently prove server acceptance or inbox delivery. The current public homepage fetch returned a SiteGround challenge, so this audit does not claim a successful live end-to-end form or phone test.

Source: [Google Ads actions](https://ads.google.com/aw/conversions/all?ocid=6908592139), [retained public GTM configuration](evidence/public-gtm.js), and [Google's phone-click tracking definition](https://support.google.com/google-ads/answer/6095878?hl=en).

The phone action uses “One” counting, a 30-day click-through window, and data-driven attribution. That is not lifetime caller deduplication. Its last recorded event was August 23 at 8 AM as displayed, and enhanced-conversion setup issues were visible.

The three call-detail rows and the single call conversion are different measures. Google distinguishes calls from calls meeting a conversion's conditions, and call reports and conversion reports can use different dates. The exact cause of this account's 3-to-1 difference was not verified. Do not add the three call records to the 98 events or claim that the 38-second record is certainly the single converted call. [Google call reporting guidance](https://support.google.com/google-ads/answer/7180997?hl=en).

## 3. Actual spend and ad-click trend

| Month | Ad spend | Ad clicks | Ad impressions | Recorded events |
| --- | ---: | ---: | ---: | ---: |
| April | $152.15 | 157 | 7,234 | 2 |
| May | $312.61 | 661 | 24,224 | 11 |
| June | $236.69 | 811 | 24,317 | 37 |
| July | $247.07 | 1,353 | 45,802 | 44 |
| August | $88.07 | 538 | 13,359 | 4 |
| September 1 to 8, partial | $6.40 | 2 | 8 | Pending validation |
| Total | **$1,042.99** | **3,522** | **114,944** | **98** |

Source: [live campaign report](https://ads.google.com/aw/campaigns?ocid=6908592139), [retained monthly UI evidence](evidence/google-ads-campaigns-monthly-ui.txt), and [audit data transcription](source-data.json). Event counts are displayed as whole integers; original attribution values remain in the UI evidence.

Across the 161 calendar dates in scope, spend averaged **$6.48 per day**, including days with little or no delivery. This is realized spend, not the configured budget or a measure of what an adequate local contractor budget should be.

April to July ad clicks increased **761.8%**, while spend increased **62.4%**. July to August spend fell **64.4%**, and clicks fell **60.2%**. Therefore it is defensible to say ad-click volume grew substantially into July and then fell with much lower spend in August. It is not defensible to say traffic has risen continuously.

The overall average cost per ad click was approximately **$0.30**. Campaign mix matters: Smart contributed 2,819 clicks, Performance Max 701, and Search 2. Cheap blended clicks do not establish high-intent Search traffic or profitable acquisition. Ad clicks are also not interchangeable with GA4 sessions, unique visitors, or landing-page views.

At inspection, Smart and Performance Max were paused. The high-intent Search campaign was enabled at $7 per day and marked learning. Historical paused-campaign rows still contain attributable activity; a current status does not establish the campaign's status on every historical date.

## 4. The keyword and search-intelligence evidence

The authenticated Semrush web app provided native CSV exports after the MCP route lacked usable API/traffic access.

| Semrush US desktop month | Reported organic-keyword metric |
| --- | ---: |
| March | 36 |
| April | 38 |
| May | 34 |
| June | 33 |
| July | 31 |
| August | 39 |
| September | 41 |

The increase is **7.9% since April** and **32.3% from July's low**. This is a recovery after a midyear decline, not uninterrupted growth. Source: [native trend CSV](evidence/semrush-us-desktop-six-month-trend.csv).

The September 7 positions export contains **41 ranking rows covering 33 distinct query texts**, because some queries have more than one ranking URL. Its best position is 14, and it contains no top-10 ranking rows. Some rows involve competitor or materials-supplier queries rather than clear requests for Onsite's services.

| Relevant query | Best exported position |
| --- | ---: |
| concrete repair in vacaville | 14 |
| landscaping dixon ca | 21 |
| landscaping vacaville ca | 21 |
| vacaville landscaping | 26 |
| landscaping davis | 27 |
| dixon landscaping | 28 |
| landscaping fairfield ca | 35 |

Source: [native positions CSV](evidence/semrush-us-desktop-organic-positions-20260907.csv). This is a national desktop database snapshot with individual query observation dates, not a fresh location-specific rank check for every term.

Semrush's estimated organic traffic does **not** show growth: the exported estimate moves from 20 in April to 19 in May, 5 in June, and a rounded estimate of 0 in July through September. These estimates are not measured visits and cannot prove an absence of visitors. Semrush also reports no estimated paid traffic while the authenticated Ads account shows 3,522 clicks, demonstrating why its paid estimate is unsuitable for reconstructing this advertiser's delivery. [Semrush metric definitions](https://www.semrush.com/kb/494-organic-rankings-positions-report).

There is already useful paid-query intelligence in Google Ads. Visible examples include “landscape companies in my area” with 19 clicks, “concrete contractors in my area” with 5, and “concrete contractors in california” with 2. “Dixon landscaping” appears in both the paid-query sample and Semrush's organic rankings. That creates a concrete paid-and-organic research opportunity. The search-term report's named-query totals cover 44 clicks, with another 63 in its other-search-terms row; they are not a complete query-level explanation of all 3,522 cross-campaign clicks. Source: [retained search-term UI evidence](evidence/google-ads-search-terms-ui.txt).

Buying ads does not directly improve organic rank. The supported relationship is that ads provide paid exposure and query evidence that can inform landing pages, content, and targeting. This audit does not establish an indirect causal effect on brand search or organic demand. [Google's explanation of paid and organic reporting](https://support.google.com/google-ads/answer/3097241?hl=en).

## 5. The exact path to stronger analytics

GA4 property **477847660**, named **onsiteconcretelandscape.com**, is already linked to Google Ads, with a link date of **February 12, 2025**. Auto-tagging is enabled. However, **Import app and web metrics is Off**. Audience import is also Off, but audience sharing is not needed to answer this audit.

The authenticated current Google account receives **Missing permissions** when opening that exact GA4 property. Onsite is also absent from its accessible Search Console property list. A link existing inside Ads does not grant the signed-in user access to GA4's reports. WordPress requires login, and the supported password-manager route did not complete; therefore no claim about a fresh WordPress analytics panel is made.

The concrete implementation sequence is:

1. On the existing GA4 link in Ads, enable **Import app and web metrics**, save, add the Google Analytics engagement columns, and verify whether they populate. This setting was inspected but not changed. Google says imports normally become available within an hour, sometimes longer; historical availability must be checked rather than promised. [Official import instructions](https://support.google.com/google-ads/answer/13443326?hl=en).
2. Have the property's existing administrator restore reporting access for the exact authorized account. Then export April through September sessions, engaged sessions, source/medium, landing pages, and accepted lead events. Compare paid, organic, direct, and referral traffic separately.
3. Recover the exact Search Console property, export query/page clicks, impressions, and positions, and link it to Ads if appropriate. Google's combined paid-and-organic report begins collecting organic data from the link date; it does not backfill earlier organic history. Historical Search Console reporting must be obtained separately.
4. Reconcile received calls against the business phone log and accepted forms against delivered inquiries. Track service fit, estimate status, and booked work with protected source identifiers. Preserve phone clicks as an intent measure.

The audit establishes what to inspect and configure next. It does not claim these settings were enabled, access restored, or historical sessions recovered.

## 6. Historical cross-checks and exclusions

The April 27 Slack update reports one direct call through the Google call asset, which is consistent with direct call activity in the live ledger. The older April 20 to 26 report labels a phone lead in that earlier reporting window; the live call occurred April 27. Attribution dates or reporting inconsistency may explain the mismatch, but the audit does not silently move the call into the earlier week. [April 27 source](https://momentum3d.slack.com/archives/C087GM7SEJF/p1777337362503949).

The April 8 to June 6 spreadsheet records seven web-phone events and one ad-call conversion. August 17 to 23 reporting records three website phone actions. These corroborate repeated recorded activity, but their overlapping windows must not be added to the live April-to-September totals. [Historical spreadsheet](https://docs.google.com/spreadsheets/d/1JvJZpmm4TK-KNglohd6wu8fZ2Ov7HQaT5t5kNey0Zrs/edit), [August source](https://momentum3d.slack.com/archives/C087GM7SEJF/p1787598577676479).

The June GBP PDF was recovered and visually checked: it reports 100 profile views, 6 website clicks, and 1 call action. This is a historical report of GBP activity, not a fresh platform export or evidence of an additional unique connected call. It is kept separate from Ads and excluded from the headline argument. [Original June PDF](evidence/gbp-june-original.pdf).

Modeled figures in a May email, unsupported later narrative totals, overlapping weekly summaries, and unrelated clients' call-tracking records were excluded. No available CRM or phone-log reconciliation establishes booked jobs or revenue.

Earlier research notes in this folder predate the live call-detail and Semrush findings. This audit and its source data supersede their statements that no call log or Semrush data was available.

## 7. Unsent internal response draft

I reviewed Onsite's Google Ads account directly, including the call details, rather than relying on the summary reports.

From April 1 through September 8, Google lists three calls from ads as received: 38 seconds on April 27, and 10 and 7 seconds on June 17. It also recorded 65 website phone clicks and 32 website form events. I would keep those categories separate because phone clicks are not the same as completed conversations.

The account spent $1,042.99 over that period and generated 3,522 ad clicks. That averages $6.48 per calendar day. Click volume rose from 157 in April to 1,353 in July, then dropped to 538 in August when spend fell to $88.07.

So the platform record does show calls and repeated contact activity. What I cannot yet verify is how much became qualified estimates or booked work. I also found the analytics gap: GA4 is linked, but importing its website metrics into Ads is switched off and the current account lacks access to the underlying GA4 reports. That gives us a specific way to improve the evidence instead of arguing over the same summary numbers.

## Evidence handling

Native Semrush exports and the original Google Ads call screenshot are retained. Google Ads tabular values in source-data.json are explicitly labeled transcriptions. The requested call CSV download did not produce a recoverable local file. No message was sent and no campaign, budget, tracking, analytics-sharing, or consent change was saved. Opening Semrush Organic Traffic Insights reached project 31146226 and a Google connection prompt; no connection was completed, and whether that empty project already existed was not established.
