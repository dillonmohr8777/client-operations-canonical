# Onsite Concrete & Landscape — Weekly Update, 2026-09-14

**DRAFT ONLY.** File created, nothing sent, nothing posted, nothing deployed.

## Recipients

- **To:** `onsiteclp@gmail.com`
  Source: `registry/clients.json` → `clients[].id == "onsite-concrete-landscape"`
  → `contacts[0].email` (role: "authorized client contact route").
- **CC:** `sean@needmomentum.com`, `mac@needmomentum.com`, `melissarobinn@gmail.com`
  No Onsite-specific sent-email receipt exists on disk in this worktree
  (checked every `deliverables/*` folder — no `email-delivery-receipt.json`
  or `STAGING.json`). This CC list is the standing internal-team pattern,
  verified from `clients/nexla/deliverables/2026-09-08-weekly-report-2026-09-01-to-2026-09-08/email-delivery-receipt.json`
  (`status: sent_verified`) and corroborated by
  `clients/bar-crawl-usa/deliverables/2026-09-09-andy-access-replies/README.md`.
  Applied here by analogy, not from an Onsite-specific receipt — flagging
  that explicitly.

## Subject

Onsite Concrete & Landscape — Weekly Update, Sep 7–13

## Evidence per claim

| Claim | Evidence path |
| --- | --- |
| Three calls marked Received (38s Apr 27; 10s + 7s Jun 17), all PMax mobile click-to-call | `clients/onsite-concrete-landscape/deliverables/2026-09-08-call-evidence-audit/AUDIT.md`, section "1. The strongest call evidence" — exact match, including source screenshot and live report link cited there. |
| $1,042.99 spend / 3,522 clicks / 114,944 impressions over 161 days = $6.48/day, ~$0.30 blended CPC | Same file, section "3. Actual spend and ad-click trend" — exact match, monthly breakdown and totals table. Also `source-data.json` in the same folder. |
| GA4 property 477847660 linked, "Import app and web metrics" Off | Same file (`AUDIT.md`) and `source-data.json`, both matched on a direct search for the property ID and setting name. |

## Do not send

**DO NOT SEND.** This is a draft for review only. No email client, Slack
client, or send tool was invoked to produce this file.

## Other flags

- **98 "conversion events" deliberately omitted from the client-facing
  draft.** `AUDIT.md` section 2 shows this figure (65 web phone-click events
  + 32 web form events + 1 ad-call conversion = 98) and explicitly warns:
  "Do not add the three call records to the 98 events." To eliminate any
  risk of that conflation, this draft reports only the three Received calls
  and omits the 98-event figure entirely rather than trying to caveat both
  in the same email.
- The "losing 74% of searches" line from an older draft is not used anywhere
  — per the brief, it has no traceable source.
- No conversion-to-named-lead match-back language, and no claim that
  anything was posted to Slack.
