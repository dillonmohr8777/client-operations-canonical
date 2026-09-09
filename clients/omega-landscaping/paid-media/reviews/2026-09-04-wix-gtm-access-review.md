# Omega tracking and container access review

Verified September 5, 2026, approximately 03:05 through 03:10 UTC. Exact site: https://www.omegalandscapingandconcrete.com/; Wix site 07c01d59-c0b8-4ae7-aba2-d196398abbab.

## Verified configuration

- Authenticated Wix account: dillonmohr8777@gmail.com. The existing Google Tag Manager integration is connected to **GTM-TRPJ69M7**. The connection's Advanced consent mode checkbox was already checked; it was not changed.
- The separate Wix Google Tag integration shows Connect. That is not proof the public site lacks a Google Ads tag: AW-16794883273 was already observed publicly and may be provided through GTM or custom code.
- Wix Event Manager was initially unscanned. A native scan completed, reporting **11 event types: nine automatic and two contact**. These are detected event types, not counts of actual leads, calls, purchases or bookings.
- The automatic Generate lead row lists Google Tag Manager as its destination and shows Add conversion in Wix's Google Ads column. That does not establish whether GTM already has a conversion tag for that event.
- The two contact rows are Email click and Phone click. The phone destination matches the published `tel:+17198960663`. Both contact checkboxes are unchecked and have no selected marketing tool in this Event Manager view.
- No Update Tracking action, Google Ads mapping, container edit, consent change, telephone call or form submission was performed.

## Exact remaining access gap

Google Tag Manager under dillonmohr8777@gmail.com showed BigOrange and Nexla containers; GTM-TRPJ69M7 was absent. The existing dillon@immohrtalmarketing.com session showed no Tag Manager accounts. Neither checked identity exposed the Omega container. No new account was created or permission changed, and no unrelated client's container was used.

The next step is to resolve the authorized owner/session for GTM-TRPJ69M7, then inspect its published version, Generate lead trigger, form scope, conversion label and deduplication. Do not install a second base tag or add a Wix conversion merely to work around missing container visibility. A controlled successful-form receipt and qualified-lead reconciliation remain pending.

Source UI routes: [Wix integration](https://manage.wix.com/dashboard/07c01d59-c0b8-4ae7-aba2-d196398abbab/marketing-integration/widget/GOOGLE_TAG_MANAGER_CONSENT_MODE_SWITCHING), [Wix Event Manager](https://manage.wix.com/dashboard/07c01d59-c0b8-4ae7-aba2-d196398abbab/marketing-integration/tracking-chef), [GTM account selector](https://tagmanager.google.com/#/home).
