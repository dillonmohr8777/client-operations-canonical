# Momentum AI review decision packet

**Meeting:** Monday, July 20, 2026, 3:00 PM Eastern  
**Attendees expected:** Dillon, Jason, Sean  
**Canonical work item:** `wi-20260718-0002`  
**Packet status:** Local review draft, redacted, no external delivery  
**Built:** 2026-07-19 from current canonical artifacts

---

## 1. Purpose of this review

Leave with clear owners and yes/no decisions on:

1. Orbit readiness for a capped pilot
2. Maps-first prospect execution path
3. HubSpot chat agent and CallRail follow-up automation
4. First pilot record / approval boundaries
5. What is allowed to go live vs stays local

---

## 2. What is already done

| Area | Status | Evidence |
|---|---|---|
| HubSpot branded chat agent | Live, routes into HubSpot | Communication open-loops review |
| CallRail / Voice Assist into HubSpot | Enough activity for reporting | Communication open-loops review |
| Approval-gated prospect-site draft compiler | Complete locally; no network delivery | `wi-20260717-0001` done |
| M360 Orbit deep build | Reviewable stage: specialists, evidence rules, handoffs, gates | `2026-07-17-m360-orbit-deep-knowledge-base/` |
| Maps-first pilot sites | Three staged with verified Google Maps directions | Open-loops review |
| Philadelphia website batch / workflow | Delivered for review | Open-loops review |
| Jesse Maps-first gap package | Local package defined | `2026-07-16-jesse-prospect-automation-gap-and-execution-package.md` |
| Law-firm local SEO audit builder | Done locally | `wi-20260718-0006` done |

---

## 3. Decision agenda for July 20

### A. Orbit / Maps-first pilot

**Ask Jason and Sean:**

1. Approve a capped first pilot of how many prospect records? (Recommended: 1 to 2)
2. Who is the named approver before any CRM write or outreach?
3. Confirm nothing auto-sends until human approval on the exact prospect, facts, deliverable, and message.

**Recommended decision fields to fill in-meeting:**

- Pilot cap: ____
- Approver: ____
- Allowed outputs before approval: local site draft / review PDF only
- Forbidden until approval: CRM write, email/SMS send, ad spend, account changes

### B. Caller auto-response (CallRail to HubSpot text)

**Separate work item:** `wi-20260718-0003` (needs approval; do not implement in this meeting without explicit yes)

Still required before build:

- Exact trigger (missed call, completed call, after-hours, etc.)
- Approved reply copy and opt-out language
- Business-hours behavior
- Assignment / routing owner
- Exact CallRail account and HubSpot object mapping
- Test plan and rollback plan

**Ask:** Approve discovery + draft only, or approve implementation after draft review?

### C. HubSpot Leads object

Keep Leads deactivated unless an administrator intentionally adds Leads to the agent workflow and approves the change.

### D. Ads pause recommendation

Rocco recommended pausing non-converting ads. No ad was changed. Any pause needs fresh account readback and exact approval. Not an automatic action from this packet.

### E. Training follow-on

AI / Fable training remains Wednesday, July 22, 4:00 to 5:00 PM Eastern. Separate packet: `wi-20260718-0004`.

---

## 4. Caller-response breakdown (for decision, not implementation)

| Bucket | Content |
|---|---|
| Decisions needed | Trigger, copy, opt-out, hours, owner, accounts |
| Access required | CallRail admin, HubSpot workflow/automation permission |
| Implementation steps | Map trigger → draft message → route → test → enable |
| Test evidence | Sandbox or controlled test call, message receipt, CRM association |
| Rollback | Disable workflow, revert assignment, confirm no further sends |

---

## 5. First pilot record checklist

Before any external action on a Maps-first prospect:

- [ ] Exact prospect identity and address verified
- [ ] Facts and imagery provenance reviewed
- [ ] Local draft site / packet approved by named approver
- [ ] Suppression / do-not-contact checks complete
- [ ] Exact CRM fields and outreach message approved
- [ ] Cap not exceeded

---

## 6. Meeting capture template

| Decision | Owner | Due | Notes |
|---|---|---|---|
| Pilot cap | | | |
| Pilot approver | | | |
| Auto-response: discovery only / implement | | | |
| Leads object stay off / change | | | |
| Ads pause follow-up | | | |
| July 22 training confirm | | | |

---

## 7. Explicit non-actions

This packet does not authorize:

- Sending email, Slack, SMS, or CRM writes
- CallRail or HubSpot configuration changes
- Ad pause, enablement, or spend
- Publishing or deploying prospect sites
- Enrolling any Orbit founding cohort client

---

## 8. Source ledger

- `clients/momentum-360/deliverables/2026-07-17-communication-open-loops-review.md`
- `clients/momentum-360/deliverables/2026-07-17-callrail-hubspot-auto-response-open-loop.md`
- `clients/momentum-360/deliverables/2026-07-16-jesse-prospect-automation-gap-and-execution-package.md`
- `clients/momentum-360/deliverables/2026-07-17-m360-orbit-deep-knowledge-base/`
- Canonical queue revision 111; work item `wi-20260718-0002`
