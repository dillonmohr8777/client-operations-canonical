# Deborah Mara — lead capture install runbook

Prepared 2026-09-15. Partially executed; current checkpoint below supersedes the historical starting-state claims and sequencing.

## Current checkpoint — September 15, 2026
- Status: partial; Chrome authenticated as Dillion Mohr on the exact Deborah staging host. In-app browser remains signed out.
- Saved and reloaded WP Mail SMTP From Name: Deborah Mara | RE/MAX Homeland; Force From Name enabled. Mailer remains Default (none); delivery is not verified.
- Corrected Form 112 field 4 from Single Line Text to Phone; latest saved revision visibly renders Name, Email, Comment or Message, Phone.
- Verified notifications: Deborah and Dillon Gmail recipients, New lead from page-title smart tag, Reply-To field 2 Email, all-fields body; modern anti-spam checkbox checked.
- Gmail identity verified as Dillon; targeted in:anywhere search found no recent WP Mail SMTP test. No new test email or client message sent in this pass.
- Evidence: Chrome SMTP settings reload, Form 112 builder, and authenticated saved-form preview at https://deborah.azldigital.com/?wpforms_form_preview=112&new_window=1. No pages published in this pass.
- Next: Dillon identifies existing provider/account or chooses a new free provider; connect through supported credentials/consent, replace legacy forced sender, then verify SMTP and form delivery before publication. SendLayer 200 emails are a trial, per https://sendlayer.com/docs/creating-your-account/.

## Why this exists

Deb emailed at 12:58 ET today: "I need everything to start so I can get new
leads." Her site cannot currently produce one. The 2026-09-14 backend receipt
records three facts that together mean a lead has nowhere to land:

- WPForms reports **no forms created**.
- WP Mail SMTP is set to **Default (none)**, so delivery is neither configured
  nor tested.
- **No GA4 or GTM identifier** was found in the homepage HTML.

The four answer pages (IDs 101, 103, 105, 107) already exist as drafts with
approved copy. Publishing them without capture would send traffic to pages
that cannot convert. Capture comes first, then publish.

This runbook is the shortest path from the current state to a working lead.
It needs no input from Deb.

## Sequence

Do these in order. Each step has a readback that must pass before the next.

### 1. Mail delivery first

Nothing else matters if the notification never arrives.

- WP Mail SMTP: move off Default (none). Use an authenticated sender on a
  domain that can pass SPF and DKIM.
- Send the plugin's own test email to `dillonmohr8777@gmail.com`.
- **Readback:** test email received, and it lands in inbox rather than spam.
  Record which mailbox and which folder.

Do not configure the form until this passes. A form built on top of broken
delivery looks like it works and silently loses every lead.

### 2. Build one form, reuse it everywhere

Two fields only, per the approved 2026-09-12 page brief: name, and email or
phone. Every added field costs completions.

- Field 1: Name (required).
- Field 2: Email or Phone (required, at least one).
- Hidden field: source page URL.
- Optional, visible, not required: "How did you hear about us?"

Notification:

- To `marasurrealestate@gmail.com` **and** `dillonmohr8777@gmail.com`.
  Deb gets her lead directly. Momentum gets the copy that proves the path
  works. Do not route Deb's leads through Momentum only.
- Subject line must carry the source page so attribution survives without
  a dashboard.
- Reply-to set to the submitted address so Deb can reply from her phone.

Spam: enable the plugin's built-in anti-spam token. Do not add a CAPTCHA on
a two-field form. It costs more completions than the spam it stops.

- **Readback:** submit a real test from a phone on cell data, not office
  wifi. Confirm arrival in both inboxes. Keep the test submission.

### 3. Tappable phone

The 2026-09-09 audit found no tappable phone anywhere on the site.

- Working number: `917.747.5055`. Verified twice, on the public homepage and
  in Deb's own Gmail signature dated 2026-09-10.
- Markup: `tel:+19177475055`.
- **Do not use** the `(551) 888-3140` shown on her Homes.com profile. That
  number is unreconciled against her own site and signature. Reconciling the
  two profiles is a separate task and must not block this one.
- **Readback:** tap the link on an actual phone, confirm the dialer opens
  with the right number.

### 4. Measurement

- Create the GA4 property if none exists, and a Search Console property for
  both the staging host and `soldbymara.com`.
- Fire `generate_lead` on form submit.
- **Readback:** the test submission from step 2 appears in GA4 realtime.

Open question that belongs to the account owner, not to this runbook: who
owns the GA4 property and the Search Console property, Deb or Momentum. The
2026-09-14 receipt shows this was asked of Melissa and the reply was still
pending. Create under Deb's ownership if there is any doubt. Moving a
property later is worse than starting it in the right place.

### 5. Identity and schema

Yoast organization fields and logo are still unset, and local
`RealEstateAgent` schema is still outstanding.

- Fill Yoast organization identity and upload the logo.
- Paste the JSON-LD from `schema-realestateagent.json` in this folder.
- **Readback:** the page passes a structured data test with no errors.

### 6. Only now, publish

- Publish pages 101, 103, 105, 107 with capture live on each.
- **Readback:** one form submission from each of the four published pages,
  each arriving with the correct source page in the subject line.

## What stays blocked, and on whom

- **Staging noindex stays on.** The 2026-09-14 receipt set it deliberately.
  Removing it belongs to the production launch checklist on the production
  host only, never on staging.
- **ChatGPT Ads remains blocked** and is not part of this runbook. Per
  OpenAI's current guidance each advertiser needs its own account, and the
  setup flow does not let an agency create a client advertiser account. Deb
  creates it, then invites Momentum. That is a client action, and it should
  be asked for on its own, once, in plain language, and not bundled with
  website work.
- **Brokerage disclosures and IDX** approval sit with RE/MAX Homeland and
  gate production launch, not lead capture.

## What this runbook deliberately does not do

It does not ask Deb to click anything, log into anything, or send a
screenshot. She has already granted administrator access once, through
Muhammad on 2026-09-11. The remaining access problem is a credential on
Momentum's side, and it is not hers to solve.
