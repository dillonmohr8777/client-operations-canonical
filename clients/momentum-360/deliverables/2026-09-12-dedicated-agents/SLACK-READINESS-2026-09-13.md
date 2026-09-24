# Slack readiness

Read-only checks completed September 13, 2026.

- Existing connector authenticated installation lists Momentum Digital Agency, `T066HGS7N`.
- Channel lookup verifies unarchived public `#360leads`, `C05R2B1ULF6`.
- The current browser identity's Your Apps page lists only existing `Momemtum Webhook`, `A0ATZDPMGFM`. No Momentum Workmate app appears in that inventory.
- Existing webhook app Socket Mode is off, the toggle is disabled, and event subscriptions are not enabled. Do not repurpose or expand this existing app as a shortcut.
- No Slack or Momentum environment-variable names were present in the checked Python execution environment; no matching Slack/Momentum secret filename was found under `.codex/secrets`. This bounded check does not prove that no credential exists anywhere else.
- No credentials were entered, copied to source, regenerated, or changed. No app created, permission granted, or message sent.

## Remaining external step

The proposed new app is Momentum Workmate, restricted by runtime to team `T066HGS7N` and channel `C05R2B1ULF6`. The existing draft manifest requests `app_mentions:read`, `channels:history`, and `chat:write`; Socket Mode additionally requires an app-level `connections:write` token.

Installation creates new access and cannot be inferred from the working user connector. The exact app identity, approved human user IDs, and externally stored credentials must be verified before a real connection. Credentials must be configured through the protected local route or native UI, never pasted into a chat or repository.

Local transport and fixture checks do not prove a Slack event was received. Positive delivery and readback require separately authorized synthetic posts; historical lead mappings remain unverified until source-event/CRM/Slack linkage is traced. All five organization roles remain in local shadow review until their respective acceptance criteria pass.
