# AMI Site Operations

Production-ready WordPress MU plugin package for the AMI Bluehost site.

## What it does

- Replaces the broken public walkthrough endpoint with a same-site REST route that accepts both `ami-cleaning.com` and `www.ami-cleaning.com`.
- Stores every valid submission as a private `AMI Lead` inside WordPress.
- Normally emails every lead to `dillonmohr8777@gmail.com` and `corinne@ami-cleaning.com`.
- Applies Dillon's temporary July 23 notification rule: Dillon only on July 23, with Corinne automatically restored July 24.
- Sets the lead's email as Reply-To for fast follow-up.
- Adds a responsive, keyboard-accessible AMI website assistant for services, coverage, phone handoff, and walkthrough capture.
- Sends `generate_lead` to the existing GA4 property after a successful public-form or assistant submission.
- Includes a honeypot and per-IP rate limiting.

## Bluehost install path

Installed July 23, 2026:

1. `ami-operations-loader.php` is in `public_html/wp-content/mu-plugins/`.
2. The `ami-operations` folder is in `public_html/wp-content/mu-plugins/`.
3. The live homepage form and assistant were verified with labeled QA submissions.
4. WordPress lead storage and Dillon's notification email were verified.
5. QA lead records were moved to Trash.
6. GA4 `generate_lead` is emitted after successful form and assistant submissions.

No API key is required. The plugin uses WordPress lead storage and the site's configured mail delivery.
