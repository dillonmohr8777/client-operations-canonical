# Tags 2 Go Google Ads access-mapping baseline (redacted)

- Captured: 2026-08-07
- Work item: `wi-20260807-0001`
- Client: `tags-2-go`
- Privacy: redacted; no secrets, passwords, MFA material, or raw communications

## Access mapping status

- Canonical client route is active and exact.
- Access Broker registry has no `tags-2-go` client record.
- No exact Bitwarden item locator (`bw://item/<guid>`) is available for Tags 2 Go Google Ads.
- Bitwarden CLI is not available on this host, and no local Bitwarden desktop data directory was found for automated item discovery.
- Slack-shared credential material must not be imported into the vault or repository. Treat chat-exposed credentials as rotation candidates once an agency-controlled route exists.
- Preferred authorized path remains: agency Google identity with admin invite to the child account, then Access Broker registration of an opaque locator only.

## Admin-invite / authorized login path

- Prior operator work referenced an admin-invite approach to reduce repeated verification loops.
- Live admin-invite status for Dillon's authorized Google identity is unverified in this episode.
- MFA, CAPTCHA, number-match, recovery, and provider consent remain human gates.
- No live Google Ads login, account mutation, spend, or campaign rebuild was attempted.

## Account-health baseline from verified redacted sources

- Portfolio owner: Momentum 360.
- Current verified commercial lane: Google Ads only.
- Public site confirmed: `https://tags2go.pro/`.
- Prior Google Ads delivery was policy-flagged for government-related keywords and shut down.
- SEO context exists but is out of paid scope unless Dillon expands it.
- Commission discussion and prior operator decline are recorded in redacted Slack evidence; they do not authorize spend or live mutation.
- Daily paid-media roster entry should wait until an opaque Access Broker account reference exists.

## Definition-of-done evaluation

1. Access Broker or Bitwarden locator for Tags 2 Go Google Ads: not satisfied.
2. Admin-invite or authorized login path documented without secrets: preferred path documented; live invite state remains human-gated.
3. Redacted account-health baseline under `clients/tags-2-go/evidence`: this artifact.

## Safe next human actions

1. Create or confirm a Bitwarden vault item under the primary vault without pasting chat credentials into agents or canonical state.
2. Prefer admin invite to the agency-controlled Google identity; confirm invite acceptance in the Google Ads UI.
3. Register only opaque Access Broker metadata and `bw://item/<guid>` or authorized OAuth locator after the vault or invite path is real.
4. Rotate any password that lived in Slack once the authorized route works.
5. Keep rebuild, spend, and roster promotion blocked until mapping and standing authority are current.

## Source locators

- `slack://channel/C0BMDSVT4JG/message/1786110229.200619`
- `clients/tags-2-go/evidence/2026-08-07-slack-handoff-redacted.md`
- `clients/tags-2-go/CLIENT.md`
- `clients/tags-2-go/context/operating-context.md`
- `clients/tags-2-go/paid-media/launch-config.json`
