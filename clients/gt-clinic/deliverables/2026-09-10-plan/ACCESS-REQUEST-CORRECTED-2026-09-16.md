# GT Clinic access request, corrected

Status: DRAFT. Not sent. No external send, post, publication, account change or spend has occurred.
Prepared 2026 09 16. Supersedes the access checklist at lines 112 to 127 of `2026-09-10-kickoff-and-growth-plan.md`.

## What changed and why

**1. Google Business Profile. Stop asking.**
The 2026 09 10 plan asks Ghazala for GBP **manager** access. She has already granted
**owner**, which is strictly the higher role and includes everything manager does.
Asking again reads as though we did not notice what she sent. Removed from the ask.
Now appears only as a confirmation line.

Evidence status: reported by Dillon on 2026 09 16. No written record of the grant
exists in `client-operations` or in the vault as of this draft. Confirm the role in
the GBP interface once, and file the screenshot or the notification email, so the
next session does not re ask on the same missing evidence.

**2. Google Ads. This is a closed point, not an open one.**
The accepted 17hats quote `brgoeLawllWB` already settles billing and ownership:
Google bills the client card directly, Momentum holds management access only, and the
account, campaigns, conversion tracking, audiences, data and assets remain GT Clinic
property. Mac confirmed the same on the commercial thread on 2026 09 02. The plan
phrased this as a request, which invites a settled question to be reopened. Rephrased
as a statement of what the contract already says.

**3. Item 1 is a hard blocker, not a formality.**
On 2026 09 12 the homepage, robots.txt, every sitemap and all 14 attempted URLs
returned HTTP 202 SiteGround captcha challenges. No technical inspection of
thegtclinic.com has ever been possible from outside. Every P0 in the technical audit
is therefore frozen, not assessed. Host access is what unfreezes it. Nothing in the
technical workstream can move until it lands.

## Client facing ask

Anything below the line goes to Ghazala as written. It contains no dashes.

---

Hi Ghazala,

Thank you for the Google Business Profile access. Owner came through, which is
everything we need there, so nothing further on that one.

Three things are still open on our side before the technical work can start.

**1. SiteGround and WordPress admin.** This is the one that is actually blocking us.
When we ran the site audit on September 12, the server returned a security challenge
to every automated request, including the homepage, the robots file and all of the
sitemaps. That is a normal protective setting and it is not a problem with your site.
It does mean we cannot inspect the pages from the outside, so our current technical
findings are unverified rather than complete. Admin access to SiteGround and
WordPress resolves it immediately and lets us confirm what is actually there.

**2. Domain and DNS.** Registrar access, or whoever manages the domain. We need this
before any hosting or site change, and we will document the existing records and a
rollback path before we touch anything.

**3. Google Search Console and Google Analytics.** Please add us as an owner on
Search Console. If Analytics is not set up yet, we can create it, we just need your
go ahead.

On Google Ads, nothing is needed from you right now. Per the signed quote, Google
bills your card directly, we hold management access only, and the account, campaigns,
conversion tracking and data stay your property. When you are ready to set a monthly
media budget we will need that in writing, separate from the retainer, but that is a
later step.

Two decisions when you have a moment, no rush this week:

Whether Book Appointment should keep pointing at the contact form, or move to a
Boulevard path you approve.

Which services you want us to prioritise first for SEO and for the first landing
page. Your call, not ours, and it drives the first two pages we write.

Thanks,
Dillon

---

## Internal notes, not for the client

- The GA4 and GTM line was folded into a single Search Console and Analytics ask.
  Splitting it into three separate account requests made the email read as a demand
  list and buried the one item that is genuinely blocking.
- Brand assets, photo library and the priority service list were not made hard asks.
  They are not blocking and can be collected during the first working session.
- Do not present any P0 from the technical audit as assessed. The correct phrasing in
  any client facing document is that findings are unverified pending host access.
- Registry: `gt-clinic` was added to `registry/clients.json` on 2026 09 16 by
  `momentum-client-intake`. It had been absent since at least 2026 09 12 while four
  dated deliverable packages existed under `clients/gt-clinic/`.
