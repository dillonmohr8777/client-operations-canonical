# September 5 Nexla tracking review

GTM-K7B389B workspace 73 is accessible. Live version is 60, Pausing Warmly & ZoomInfo. Seven existing changes remain unpublished; no Nexla production change was applied during this review.

Full workspace export is saved beside this receipt as 2026-09-05-gtm-workspace73-reviewed-unpublished.json. It contains 30 tags, 16 triggers, 24 variables and 4 templates. Existing pending work modifies the HubSpot listener and Google Ads form tag, adds MCP success, legacy exclusion and listener-page triggers, adds a GA4 generate_lead tag and a client-side known-spam guard.

Reviewed mapping: HubSpot form 663d7e71-eb1c-4e1b-94fe-61cac6f16a90, page /lp/mcp-servers/, custom event hubspot-form-success from onFormSubmitted. Google Ads tag uses conversion ID 10857703077 and label lf1HCMiSo_4ZEKXNrbko, once per page. Legacy form_submit excludes the MCP landing page. GA4 generate_lead uses G-31E5ZZR019 and the same scoped success trigger. The public landing page loads this container and exact form.

Remaining verification: preview the full accepted-submission and tag-firing sequence, verify campaign goal membership against the exact conversion action, and validate CRM lifecycle/qualified outcomes in HubSpot portal 3222786. Listener null/origin handling and duplicate success events warrant hardening before publication. The staged spam guard is browser-side only and does not replace server-side spam controls. No claims of qualified leads, offline import repair or live publication are made.

Tag Assistant was opened at its connection dialog. No new successful form submission was established in this review. Live version 60 remains the production baseline.

## Continuation verification

Reopened workspace 73 in the authenticated in-app browser: still seven changes. Tag Assistant connected to a preview of GTM-K7B389B and displayed the HubSpot listener and known-spam guard each fired once, alongside the conversion linker and configuration tags. Console displayed 0 errors. This establishes page-load execution only.

A separately opened MCP landing-page tab was filled with marked test NEXLA-20260905-01. Submission was rejected with “This form does not accept addresses from gmail.com.” It did not establish an accepted lead. That tab's debug overlay reported not connected, so the other connected preview cannot be used as evidence for this submission attempt. Requested an authorized business test mailbox from Dillon. Do not count this attempt or claim conversion firing.
