# Momentum 360 live CRM evidence

- **Read state:** `live-read-only`, captured 2026-09-12 22:47:53Z through the purpose-built Jason/Momentum HubSpot bridge.
- **Registry route:** canonical client `momentum-360`; verified account alias `jason-momentum`; portal `50612503`; stable mapping key `hubspot-jason-momentum-50612503`.
- **Identity proof:** bridge identity returned `valid=true`, exact portal `50612503`, and `mode=read-only`. No credential was returned or persisted.
- **Core access:** compact snapshot passed contacts, companies, deals, owners, pipelines, forms, calls, meetings, and tasks checks. Snapshot generated at `2026-09-12T22:47:17.366Z`.
- **Conversation limitation:** `/conversations/v3/conversations/threads?limit=1` returned HTTP 403 because the app lacks the required conversations scopes. This is a permission denial, not a route or record-not-found failure.

## Targeted redacted records

Both supplied contact IDs resolved in portal `50612503`. They are assigned to opaque owner ID `84251079`, have lead status `NEW`, and expose the same campaign mapping:

- analytics source: `PAID_SOCIAL`
- UTM source: `Facebok` (preserved exactly as returned)
- UTM medium: `cpc`
- UTM campaign: `2026 Suspension Ads`
- latest source: `OFFLINE`; latest source data: `INTEGRATION` / `25200`

Contact `247699043386` was created `2026-09-10T16:38:33.451Z`, modified `2026-09-11T01:03:15.489Z`, and has `notes_last_updated=2026-09-10T20:00:00Z`. Its associated opaque task `116697661742` is `HIGH`, `NOT_STARTED`, timestamped `2026-09-10T20:00:00Z`. No associated calls or meetings were returned.

Contact `247699997344` was created `2026-09-10T16:50:00.635Z`, modified `2026-09-11T13:47:40.810Z`, and has `notes_last_updated=2026-09-11T13:45:00Z`. Its associated opaque task `116694308362` is `HIGH`, `IN_PROGRESS`, timestamped `2026-09-11T13:45:00Z`. No associated calls or meetings were returned.

## Field and fixture boundaries

`null` means the requested property was returned empty, while omitted properties were outside this bounded request. Names, emails, phones, task subjects, raw notes, and other personal or free text were intentionally excluded. The JSON companion contains the redacted record shape and opaque IDs suitable for a synthetic integration fixture. No CRM writes, enrollments, communications, credential operations, or account-wide audit were performed.

Source refs: `mcp://hubspot_jason_momentum/jason_hubspot_identity`, `mcp://hubspot_jason_momentum/jason_hubspot_snapshot`, `/crm/v3/objects/contacts/247699043386`, `/crm/v3/objects/contacts/247699997344`, `/crm/v3/objects/tasks/116697661742`, `/crm/v3/objects/tasks/116694308362`, `/conversations/v3/conversations/threads?limit=1`.
