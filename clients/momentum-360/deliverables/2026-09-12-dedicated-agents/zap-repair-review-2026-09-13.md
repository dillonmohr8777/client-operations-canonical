# Lead alert repair review

Observed September 13, 2026 through the authenticated Zapier editor. Local proposal only; no test run, publish, replay, or toggle.

## Verified current state

- Workspace connector: Momentum Digital Agency, team `T066HGS7N`. This verifies the existing connector, not a new Workmate app installation.
- Public channel `#360leads`, `C05R2B1ULF6`, is unarchived and described as the 360 sales follow-up channel.
- Companion Zap `365085675` remains ON, published v2 `new channel`, with an existing draft owned by Mac Frederick.
- Both published and draft Slack message templates end in a literal empty `Source =` and contain no CRM link.
- The HubSpot trigger's default property list does not include source, campaign, or owner. Its additional-properties list is empty. Merely inserting a Slack field mapping cannot repair fields that the trigger does not retrieve.
- Existing draft inspected without editing its fields. The old title and published version were preserved.

## Concrete change set

1. Add `utm_source`, `utm_campaign`, and `hubspot_owner_id` to the trigger's additional-properties list. These exact internal IDs were verified in the authenticated property selector on September 13. Preserve all existing default properties. `hubspot_owner_id` is an owner ID, not a person's name; label it accordingly unless separately resolved.
2. Use those returned values in the Slack template. An absent property must render `Unknown`, never an empty label or an inferred channel source.
3. Include the trigger's `hs_object_id` in `https://app.hubspot.com/contacts/50612503/contact/{hs_object_id}`. A missing or invalid ID holds the alert for review rather than emitting a malformed CRM reference.
4. Keep the source-specific Meta Zap separate until provider event IDs have been traced to the exact CRM and Slack records. A contact ID is not an inquiry ID and must not suppress a later inquiry.
5. Correct the future literal `Facebok` to `facebook` in source Zap `379667050` only in a separately reviewed change. Retain historical source values.

## Review template

```text
Momentum lead review
Source: {source or Unknown}
Campaign: {campaign or Unknown}
Owner: {owner or Unknown}
CRM: {verified portal 50612503 contact URL}
Inquiry mapping: {verified provider event reference or Mapping required}
Next action: Review the existing CRM task before creating another follow-up.
```

This template deliberately avoids copying names, phone numbers or email addresses into the local package. The controlled first Workmate message uses synthetic data and is prepared with the receiver acceptance fixtures.

## Release evidence required

Preserve the pre-edit trigger properties and message mapping; review the existing draft's other changes before publication. Run one approved synthetic inquiry, its retry, and a distinct second inquiry. Require provider ID → CRM ID → Slack timestamp and readback. Rollback returns only the reviewed changed fields/version and preserves the ledger. Do not replay historical runs.
