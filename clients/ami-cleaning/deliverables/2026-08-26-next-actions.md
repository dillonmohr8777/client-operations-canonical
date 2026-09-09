# AMI Cleaning — Current Next Actions

Status date: August 26, 2026

## What is confirmed

- The three Amazon SES DKIM records for `outreach.ami-cleaning.com` were published in Bluehost DNS and reported resolving through the authoritative DNS path on August 20.
- Corinne acknowledged the update.
- This confirms the DNS work, not that Leads at Scale has completed its provider-side verification or that production outreach is ready.

## What is still needed

1. **Obtain Leads at Scale's final verification.** Ask them to confirm that their panel recognizes all DKIM records and that their promised configuration sweep is complete.
2. **Run one controlled deliverability test.** Verify the visible From domain plus SPF, DKIM, DMARC, and Return-Path alignment from the received headers before treating the outreach system as live.
3. **Produce the next weekly analytics report.** The last sent report covered August 10–16; the August 17–23 reporting window is now due for reconciliation.
4. **Triage and disposition open walkthrough leads.** The August 18 “Erin cooper” submission has multiple spam-like fields and should remain pending review rather than being counted as a qualified lead. Check the current disposition of the August 14 Dante inquiry as well.
5. **Reconcile CRM ownership before automation.** Confirm where lead status and source-of-truth live before adding any HubSpot routing or follow-up automation.

## Recommended order

Vendor verification → controlled test → weekly report → lead-status cleanup → CRM/automation decision.

No outbound email, campaign launch, or CRM mutation was performed while preparing this brief.
