# GT Clinic meeting follow-up register

Meeting: Ghazala F. x Momentum | SEO Chat  
Date: 2026-08-26, 11:00–11:25 EDT  
Calendar event: `2q7k3mtu4upucdrvb5ptdl0n13`  
Status: meeting occurred; Otter notetaker was not admitted; no transcript is available.

## Controlling decisions from Dillon

- Start with a $1,000 per month budget.
- The issued quote already states a $900 per month service fee and separately labels advertising budget as TBD. The strongest current interpretation is that today's $1,000 figure is the initial advertising media budget, but it still needs written confirmation.
- Do not treat the $1,000 figure as automatically replacing the earlier $1,200 per month Option 3 proposal until Dillon and Ghazala confirm the distinction in writing.
- Prepare screenshots for every page of the exact audit sent to Ghazala.

## Jesse's Slack notes

Source: Slack `#ai-tech-news`, channel `C04HXSVN2CS`, Jesse DiLaura messages `1787758807.991229` and `1787764079.681739` on 2026-08-26.

Ghazala needs answers about:

- Hosting
- SSL
- Email changes, compatibility, and possible downtime
- Boulevard EMR compatibility and ownership boundaries
- Whether Momentum will build landing pages to support paid advertising

Jesse also reported that Ghazala said she is firing her current agency and going with Momentum. Treat this as strong sales-stage evidence, but not as a signed contract, accepted quote, completed onboarding, or authorization to publish, migrate, or spend.

## Exact sent-material evidence

- Proposal and quote thread: Gmail `1a026842dcaf10fb`
- Exact audit attachment message: Gmail `1a0310e89a870dc0`
- Exact sent PDF screenshots: `exact-sent-audit-screenshots-2026-08-26/`
- Corrected screenshot archive: `GT-Clinic-Exact-Sent-Audit-Screenshots-2026-08-26.zip`
- Complete sent-materials archive: `GT-Clinic-Complete-Sent-Materials-Screenshots-2026-08-26.zip`

## Commercial reconciliation required

- The live proposal currently shows $600, $900, and $1,200 monthly options and identifies the $1,200 option as SEO/AEO, Google Ads, and Meta Ads.
- Gmail says the quote reflected Option 3, but quote `7776543` actually states a $900 monthly service fee while listing Google Ads and Meta campaign work.
- The live proposal says ad spend is paid directly to the platform. The quote says the agency pays and is reimbursed by the client.
- Before a client follow-up or contract acceptance, issue one written scope that clearly separates Momentum's monthly fee, the $1,000 media budget, included channels, landing-page work, six-month term, cancellation terms, and who pays the platforms.

## Required answers before migration or launch

### Hosting and SSL

- Identify the current domain registrar, DNS host, website host, CMS administrator, and current agency owner of each credential.
- Confirm whether Momentum is taking over the existing site or rebuilding it.
- Preserve the current site, DNS records, SSL certificate state, redirects, analytics, forms, and rollback path before any change.
- Do not promise a zero-downtime migration until the current environment and DNS TTLs are inspected.

### Email continuity

- Identify the clinic's email provider and capture all current MX, SPF, DKIM, and DMARC records before DNS changes.
- Keep website and email migrations separate. A hosting change should not require mailbox changes when DNS is handled correctly.
- Inventory aliases, forwarding, contact forms, SMTP services, and notification recipients.
- Do not change MX records or mailboxes without a written migration plan and explicit approval.

### Boulevard EMR

- Confirm what the current website sends to Boulevard: booking links, embedded widgets, forms, webhooks, pixels, or API integrations.
- Establish the privacy boundary. Patient or treatment data must not enter advertising, analytics, AI-monitoring, or general marketing workflows.
- Validate conversion measurement using privacy-safe booking milestones rather than protected health information.
- Confirm Boulevard account ownership and obtain the correct non-secret access route only after onboarding.

### Paid landing pages

- Momentum can build dedicated landing pages, but the exact number, services, offers, approvals, hosting location, and ownership must be included in the amended scope.
- Each page should have one service and intent, physician-reviewed claims, a clear consultation action, fast mobile performance, and privacy-safe tracking.
- No ads should launch until the page, conversion event, budget split, geography, and platform access are approved.

## Screenshot and substantiation plan

The exact 16-page sent audit is now captured page by page. A second source-evidence package is still needed if Ghazala wants proof behind every audit claim. That package should include dated screenshots or exports for:

- Semrush Domain Overview, Organic Research, and AI Visibility
- Ahrefs public Website Authority Checker
- Lighthouse mobile results
- Live-site headings, metadata, canonicals, schema, sitemap, and sampled templates
- Current local-search examples and competitor framing
- The access-gaps table clearly labeled as pending owned-account validation

Do not fabricate provider screenshots if the original snapshot is no longer available. Re-run current checks and label the new date when necessary.

## Next action

Confirm whether the $1,000 starting budget is media spend, service fee, or a combined ceiling. Then prepare one client-facing follow-up draft that answers the five operational questions, states the clarified budget, separates confirmed scope from items pending technical access, and links the exact 16-page screenshot archive. Keep the draft unsent until Dillon reviews the exact recipients, amended commercial scope, and wording.

## Live implementation readback on 2026-08-26

- Public DNS points the website to SiteGround nameservers and the live site resolves to `35.212.53.114`.
- Email is routed through Microsoft 365 at `thegtclinic-com.mail.protection.outlook.com`. A hosting move does not require moving mailboxes or changing MX records.
- Current public SPF is `v=spf1 include:secureserver.net -all`; DMARC is monitoring only with `p=none`. No public `selector1` or `selector2` DKIM record was returned in the current lookup. Revalidate these records inside the owned tenant before any DNS change.
- The live website is WordPress with Elementor and Contact Form 7. The public consultation form posts through Contact Form 7 on `/contact-us/`.
- Every visible `Book Appointment`, `Schedule Consultation`, and related consultation CTA currently routes to the contact form. No Boulevard booking link, embedded widget, or Boulevard script was found on the live homepage or contact page.
- Current measurement includes GTM `GTM-58ZHKTSC`, Google tag `GT-MR8NN5JF`, and Meta Pixel `1434551353940066`.
- No GT Clinic, Boulevard, WordPress, SiteGround, Microsoft 365, domain registrar, or GTM access route is currently registered in Access Broker.

## Ordered onboarding and launch sequence

1. Reissue one commercial document separating the $900 monthly service fee from the $1,000 starting media budget, included channels, landing-page work, term, cancellation, and platform billing.
2. Obtain non-secret access routes for registrar and DNS, SiteGround, WordPress, Microsoft 365 administration, GTM and analytics, Meta, Google Ads, Google Business Profile, Search Console, and Boulevard.
3. Capture a reversible backup and the complete DNS, SSL, analytics, form, redirect, and email baseline before any migration.
4. Replace the contact-form-only booking path with the clinic-approved Boulevard scheduling route. Track privacy-safe milestones only and never pass treatment selections, symptoms, patient records, or other protected health information into advertising or analytics.
5. Build the first service-specific paid landing page, validate mobile performance and the consultation path, and complete GTM and platform conversion testing before any campaign activation.
