# Where Onsite's form submissions actually go

Traced September 8, 2026 (read-only). Question from Dillon: the 32 "Web Contact Form" conversions in Google Ads, where do they land? Netlify?

## Short answer

Two separate form systems exist, and the 32 Google Ads conversions come from only one of them.

| System | Page | What counts it | Where a submission goes | Volume |
| --- | --- | --- | --- | --- |
| WordPress site form | `onsiteconcretelandscape.com` (SiteGround-hosted WordPress) | GTM container `GTM-PFJ633DF` fires the Google Ads "Web Contact Form" conversion on the `gtm.formSubmit` trigger | Whatever the WordPress form plugin is configured to email. **Not verified**; WP admin login was required and the password-manager route did not complete. Most likely the client mailbox `onsiteclp@gmail.com`, but that is an inference. | **All 32** Google Ads form conversions, Apr 1 to Sep 8 |
| Netlify landing page form | `onsite-gads-landing-page.netlify.app` (site `cd00c17e-a7f3-498a-80dd-fbfbd3bb79f2`) | Nothing. The page pushes a `dataLayer` event but loads no GTM container or gtag, so its submissions never reach Google Ads | Netlify Forms, with two live notification hooks: an email to Dillon's Gmail (`d*************@gmail.com`) and a Zapier catch hook (`hooks.zapier.com/hooks/catch/2958868/43nt8tl/`) | **3 total, ever** |

## Netlify detail (from the authenticated Netlify CLI, `netlify api listSiteForms` / `listSiteSubmissions` / `listHooksBySiteId`)

Forms defined on the site:

- `quote-form`, created Apr 22, 2026: 2 submissions (Jun 18 17:33 UTC, Jul 7 22:04 UTC)
- `call-click-form`, created May 6, 2026: 1 submission (Jul 7 22:04 UTC, same minute as the quote-form one, so likely the same visitor)
- `onsite-consultation`, created Aug 2, 2026 with the current page: **0 submissions**

So the Netlify page has existed in some form since April 22, has produced 3 form events total, and the version live since August 1 (which the Search campaign points at) has produced none.

Notification hooks on `submission_created`: one email hook to Dillon's own Gmail, one URL hook to Zapier. Both enabled. Submission bodies were not read for this trace.

## Why this matters for the Nicky conversation

1. The 32 form events happened on the WordPress site, driven by the PMax and Smart campaigns that sent traffic there (PMax alone carried 28 of the 32 per `source-data.json`). If the WordPress plugin emails a mailbox Nicky does not watch, or lands in spam, she could genuinely believe no leads arrived while 32 were recorded. **Before Friday's call, confirm the WordPress form recipient address and notification settings.** That needs WP admin access.
2. The Search campaign launched Jul 30 sends traffic to the Netlify page, where the form is silent to Google Ads and has zero submissions since Aug 2. Any lead from that page would show up in Dillon's Gmail and the Zapier hook, not in the client's inbox and not in Ads. If the Search campaign is going to be the lane going forward, either the Netlify page needs the GTM container / Ads conversion tag, or the reporting has to read Netlify Forms directly.
3. The Zapier catch hook destination was not inspected. The internal `Zapier Lead Intake` sheet reviewed earlier had no Onsite rows, which suggests the hook may route elsewhere or nowhere. Worth a look in Zapier.

## What was not done

No WordPress login, no Netlify configuration change, no Zapier inspection, no submission bodies read. Nothing sent.
