# Nexla HubSpot Form Spam Review

Date: 2026-08-31

Status: Review complete. HubSpot configuration change blocked on exact Nexla portal access. Client follow-up prepared as an unsent Gmail draft.

## Scope

- Client: Nexla
- Gmail thread: `1a0219ad3ad53df0`
- Shared evidence sheet: `1bMIq29JUOfyu5cr3W0AdAkKvz7-5FW6teflfR7SAAJI`
- HubSpot portal: `3222786`
- HubSpot form: `663d7e71-eb1c-4e1b-94fe-61cac6f16a90`
- Form name in notifications: `Nexla Demo Request`
- Live placements reviewed:
  - `https://nexla.com/demo/`
  - `https://nexla.com/lp/mcp-servers/`
  - `https://nexla.com/lp/mcp-for-agents/`

## Verified findings

- The shared sheet contains 11 submissions from 2026-08-28 through 2026-08-30.
- One submission is the explicitly labeled Momentum measurement test and should not be treated as a prospect.
- The remaining entries show strong junk or test signals: repeated fake identities, keyboard-mash text, repeated use of the placeholder phone number `1-201-555-0123`, and recurring low-confidence domains.
- Seven of the 11 submissions contain a GCLID with `utm_source=adwords`, `utm_medium=ppc`, and campaign `G_US_PMAX_NB_MCP-Agentic`. The sheet's current source note says eight; the row-level evidence supports seven.
- A GCLID is a Google Ads click identifier. Its presence identifies paid-search traffic and is not itself a spam signal.
- The published HubSpot form definition reports `captchaEnabled: false`.
- The form's default free/disposable-email block list is enabled.
- The form has an existing manual email-domain block list for named competitor domains.
- The clearly labeled Momentum test was present in both the native HubSpot notification evidence and the team-channel cross-check. This verifies the submission notification path, not the full Google Ads or GA4 conversion chain.

## Recommended mitigation

1. Enable reCAPTCHA on the `Nexla Demo Request` form.
2. Enable account-wide gibberish detection under HubSpot Settings > Marketing > Forms > Submission Settings, if the Nexla subscription supports it.
3. Review recurring observed domains before adding them to the form-specific block list; do not broadly block every domain in the sample or every GCLID-bearing submission.
4. Keep paid-search quality review separate from form spam controls. The campaign may be attracting non-qualifying clicks, but GCLID-based blocking would suppress legitimate ad leads.

HubSpot documents reCAPTCHA as the recommended control for automated submissions and gibberish detection for nonsensical text. Form-level email-domain blocking can supplement those controls.

## Access and delivery state

- The connected HubSpot app requires reauthentication and is not mapped to Nexla portal `3222786`.
- The in-app browser remembered a different Momentum HubSpot identity, so it was not used for Nexla.
- No HubSpot settings were changed.
- The Google Sheet is readable but not editable by the connected Google account. A correction attempt received a permission-denied response; the sheet was not changed.
- The existing Gmail draft in the client thread should be replaced with the completed findings and a request for Dana to apply the HubSpot settings or grant exact Nexla portal access.

## Source references

- HubSpot: Prevent and filter spam in form submissions: `https://knowledge.hubspot.com/forms/prevent-spam-form-submissions`
- HubSpot: Block form submissions from specific email domains: `https://knowledge.hubspot.com/forms/block-form-submissions-from-specific-email-domains`
