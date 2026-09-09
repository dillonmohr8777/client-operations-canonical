# Shadow Heating & Cooling website, analytics, and form report

Report date: July 23, 2026

## Executive status

- Website: live at `https://shadow-heating.com/`.
- Forms: both production forms pass end-to-end verification.
- Notifications: both `service-request` and `contact` forms notify `Shadowhvac1@gmail.com` and `dillonmohr8777@gmail.com`.
- Latest production deploy: `6a624386bdab853a67cef79b`.
- GA4: dedicated account, property, and web stream are live under Dillon Mohr's authorized Google account.
- GA4 measurement ID: `G-3LBKY5NWQQ`.
- Lead conversion: the successful contact submission emitted `generate_lead`, confirmed in GA4 Realtime with event count 1.
- Reporting: a weekly PDF Analytics report is scheduled to Dillon through July 24, 2027.
- Monitoring: a daily scheduled health check validates Shadow's homepage, GA4 tag, both forms, and AMI's form and chatbot. It emails Dillon only when a check fails.
- Search Console: active and collecting Google organic visibility.

## Form issue found and repaired

The multi-step service request could submit during the transition from Details to Contact. This produced a success message and a stored lead without name, phone, or email.

Production repair:

- The form can submit only from the final Contact step.
- Name, phone, and email are required before submission.
- Back and Continue explicitly cancel browser submit behavior.
- Both forms include defensive field-length limits and submission guards.

Live verification:

- Service request completed all three steps and stored name, phone, email, service, address, urgency, and message.
- Contact form stored name, phone, email, and message.
- Both resulting notification emails reached Dillon's Gmail inbox.
- All three QA records, including the original incomplete record, were deleted after verification.

## Lead notification routing

Both live forms have two notification hooks:

- Mike: `Shadowhvac1@gmail.com`.
- Dillon: `dillonmohr8777@gmail.com`.

No routing change is required.

## Google organic search

Search Console performance, data available July 13 through July 20:

- Clicks: 0.
- Impressions: 43.
- CTR: 0%.
- Average position: 17.2.
- Top query: `shadow heating and cooling`, 11 impressions.
- Other visible queries: `shadow heating and cooling hampshire reviews`, 6 impressions; `shadow heating`, 6 impressions; `air conditioning service near me`, 1 impression.

The site is newly visible in Google and already averaging page-two placement, but it has not earned an organic click yet.

## Analytics gap

Resolved July 23:

- Account: `Shadow Heating & Cooling`.
- Property: `Shadow Heating & Cooling Website`.
- Stream URL: `https://shadow-heating.com`.
- Measurement ID: `G-3LBKY5NWQQ`.
- Successful `service-request` and `contact` submissions send `generate_lead` only after Netlify returns success.
- Event parameters distinguish `service_booking` from `contact` without transmitting name, email, phone, address, or other lead PII.
- GA4 Realtime confirmed `page_view`, `session_start`, `first_visit`, `user_engagement`, and `generate_lead`.
- `generate_lead` is awaiting GA4's standard processed-events table, which can take up to 24 hours before the star/key-event control becomes available.
- The scheduled weekly PDF reports traffic, acquisition, engagement, and lead conversions to Dillon.
- Netlify separately alerts Dillon only if the daily health monitor detects a failure.

## Performance lab snapshot

Initial Lighthouse run July 23:

- Performance: 47.
- Accessibility: 96.
- Best Practices: 96.
- SEO: 100.
- Largest Contentful Paint: 9.7 seconds.
- Cumulative Layout Shift: 0.

Post-optimization Lighthouse run:

- Performance: 65.
- Accessibility: 96.
- Best Practices: 100.
- SEO: 100.
- Largest Contentful Paint: 6.2 seconds.
- Total Blocking Time: 0.49 seconds, down from 1.35 seconds.

The hero's 3D scene now waits for user interaction or a delayed fallback, while the above-the-fold copy renders immediately. These are lab results, not field Core Web Vitals.
