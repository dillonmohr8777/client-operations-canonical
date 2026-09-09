# AMI website, analytics, and lead report

Report date: July 23, 2026

## Executive status

- Website: live at `https://www.ami-cleaning.com/`.
- GA4: active with measurement ID `G-LKE0ZTG564`.
- Public walkthrough form: repaired and verified end to end on the live `www` homepage.
- AMI website assistant: deployed as a Bluehost must-use plugin and verified for service guidance, coverage, and walkthrough capture.
- Lead storage: both the public form and assistant create private `AMI Walkthrough Lead` records in WordPress.
- Lead notification routing: verified by a delivered WordPress email to Dillon. Per Dillon's July 23 instruction, Corinne is temporarily excluded for July 23 and automatically resumes July 24.
- Production version: AMI Site Operations `1.0.4`, loaded from `public_html/wp-content/mu-plugins/`.

## GA4 snapshot

GA4 Home, Last 7 days, viewed July 23:

- Active users: 108, up 129.8%.
- New users: 116, up 146.8%.
- Event count: 438, up 154.7%.
- Key-event count: 0. `generate_lead` is already configured as a key event for the AMI Website stream, but no successful lead event was recorded in the period.
- Channel sessions: Direct 99, Organic Search 12, Referral 2, Unassigned 2.
- Recorded events: page_view 140, session_start 122, first_visit 116, user_engagement 27, scroll 23, outbound_click 6, form_submit 2.
- Thirty-day active users: 155.

Interpretation:

- Traffic increased strongly, but the configured `generate_lead` key event recorded no conversions, consistent with the broken public form.
- Direct traffic dominates, and the country mix includes significant non-local traffic. Lead quality and bot filtering should be watched before treating user growth as commercial growth.
- After the form fix is deployed, verify the existing `generate_lead` key event and report leads, source, landing page, and conversion rate.

## Google organic search

Search Console performance, data available July 2 through July 20:

- Clicks: 13.
- Impressions: 2,800.
- CTR: 0.5%.
- Average position: 45.3.
- Branded query examples: `ami cleaning` generated 2 clicks from 16 impressions; `ami commercial cleaning` generated 1 click from 5 impressions.
- Highest visible non-brand opportunity: `commercial cleaning services` with 116 impressions and no clicks.

## Form and lead verification

- The original browser submission from the live `www` homepage failed with HTTP 403, confirming the origin defect.
- The deployed endpoint now accepts both `ami-cleaning.com` and `www.ami-cleaning.com`.
- The live public form produced its success confirmation and stored QA lead ID 1542.
- The live assistant produced its success confirmation and stored QA lead ID 1541.
- Dillon received the form notification for lead 1542 as the sole recipient under the July 23 pause.
- QA lead IDs 1537, 1541, and 1542 were moved to WordPress Trash after verification.
- A July 12 submission under the name Shari Horsley was investigated. The first follow-up bounced because the address was copied incorrectly.
- WordPress verification showed the record was an unsolicited SEO sales pitch submitted as `Test Company`, not a commercial-cleaning prospect. No corrected follow-up was sent, and lead 1534 was moved to recoverable Trash.

## Performance lab snapshot

Lighthouse run July 23:

- Performance: 54.
- Accessibility: 93.
- Best Practices: 73.
- SEO: 100.
- Largest Contentful Paint: 5.6 seconds.
- Cumulative Layout Shift: 0.

These are lab results from one run, not field Core Web Vitals. The main performance priority is reducing the large visual load time.

## Reporting and notification standard

- Every website walkthrough and assistant lead is stored privately in WordPress.
- Notifications normally go to `dillonmohr8777@gmail.com` and `corinne@ami-cleaning.com`.
- July 23 exception: Dillon only. Corinne resumes automatically on July 24.
- Notification Reply-To is the lead's email.
- Daily report should include users, organic clicks and impressions, leads, lead source, conversion rate, and unresolved leads.

## July 23 completion update

- A daily `AMI Commercial Cleaning Daily Analytics` PDF is scheduled in GA4 to Dillon through July 24, 2027.
- A shared daily monitor validates AMI's public walkthrough form and chatbot along with Shadow's website and forms. Failure alerts go only to Dillon.
- Current Lighthouse rerun: Performance 69, Accessibility 93, Best Practices 73, SEO 100, and Largest Contentful Paint 2.2 seconds. Performance improved from 54 and LCP from 5.6 seconds in the earlier run.
- The Shari Horsley record was rechecked in WordPress and is confirmed spam, not a cleaning prospect. The company was `Test Company`, and the message was an unsolicited SEO sales pitch asking AMI to reply for rankings and pricing.
- The first follow-up used `sharihorsley@gmail.com` and bounced. The submitted address was `shariharsley@gmail.com`, but no corrected follow-up was sent because the submission is spam.
- WordPress lead 1534 was moved to Trash and remains recoverable there.
