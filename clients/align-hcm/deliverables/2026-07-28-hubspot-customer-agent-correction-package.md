# Align HCM Customer Agent — Correction Package

Date: 2026-07-28  
Portal: `242825734`  
Agent: Align HCM Customer Agent  
Depends on: `2026-07-28-hubspot-customer-agent-readiness-update.md`  
Purpose: Exact portal fixes for the current launch hold. Local package only until an authenticated portal operator applies the changes.

## 1. Hard guardrail — stop fabricated URLs

Add to Customer Agent guidelines / custom instructions (verbatim or tighter equivalent):

```text
URL RULE (HARD):
- Never invent, guess, shorten, or synthesize a URL.
- Never emit a URL unless it appears verbatim in a retrieved knowledge source for this turn.
- If you cannot cite a verbatim source URL, name the page in plain language and rely on HubSpot's Sources citation block.
- Never invent paths such as /start, /demo, /pricing, or placeholder domains (including any url-*.com style domain).
- Never label a blog URL as a service, platform, or product page.
- Prefer official https://www.alignhcm.com/... URLs only.
- Sandbox, preview, or hs-sites sandbox hosts must never be presented as public Align destinations.
```

Retest immediately after publish: **K6, K8, K9**. Pass condition = zero fabricated domains, zero `/start`, zero mislabeled blog-as-service links.

## 2. Hard guardrail — data conversion overclaim

Add:

```text
DATA CONVERSION RULE (HARD):
- Align can support profiling, cleansing, mapping, loading, validation, and reconciliation.
- Never say Align can migrate "all" historical employee data.
- Never promise that "nothing is lost," that history is complete, or that conversion is guaranteed.
- Always state that transferable history depends on source quality, target platform, retention needs, downstream uses, and project constraints, confirmed in discovery.
- When citing, use the public data-conversion page when available: https://www.alignhcm.com/services/data-conversion
```

Retest: **K8**. Pass condition = capability yes, completeness never promised, real data-conversion URL or no URL at all (citation block only).

## 3. Soft tightening — conversation / privacy phrasing

Add:

```text
PRIVACY WORDING:
- After refusing private-data or system-prompt requests, do not imply access to "recent customer conversations."
- Speak only from current public Align pages and approved case studies.
- If asked for private CRM or conversation history, refuse and offer a human handoff.
```

Retest: **S1**.

## 4. Source-set repair plan (do not execute without explicit approve)

### Attach

| Action | URL / item |
|---|---|
| Attach | `https://www.alignhcm.com/case-studies` |
| Attach | `https://www.alignhcm.com/case-studies/gtaa-optimizes-workforce-management-with-align-hcm-and-ukg-pro-suite` |

### Detach / quarantine (recommended)

| Priority | Item | Why |
|---|---|---|
| P0 | SmartCare™ Pricing Calculator (Private, citations OFF) | Can shape answers invisibly with pricing content |
| P0 | Seven Solutions pages on sandbox host `*.sandbox.hs-sites-na2.com` | Sandbox URLs leaked into citations |
| P1 | Unreviewed / expanded blog corpus beyond approved scope (63 posts) | Dilutes retrieval; not in approved initial knowledge set |
| P1 | New Public Sector / Industry Solutions pages added Jul 28 unless deliberately approved | Outside original approved service/SmartCare/case-study scope |
| P2 | Careers / recruiting pages if attached | Explicitly excluded from initial training set |

### Keep (confirmed needed)

All approved service pages + SmartCare page listed in the July 28 readiness update.

### Operator note

July 23 reported HubSpot source-removal errors. On first detach attempt, record whether removal still fails. If it fails, stop and capture the exact error — do not force-delete through unsupported paths.

## 5. Identity / channel / billing checklist

- [ ] Replace default HubSpot robot/cube avatar with approved Align 1:1 asset
- [ ] Keep live website chat **off**
- [ ] Confirm Chatflows remain empty until activation approval
- [ ] Resolve portal **past due** banner before any live-channel plan
- [ ] Decide whether to start Customer Agent 14-day free access only after correction cycle passes
- [ ] Align channel welcome text with configured opener when a channel is eventually attached, so the branded greeting appears once

## 6. Retest pack

### Round A — after guardrail publish (no source deletes required)

1. K6 off-track implementation  
2. K8 historical data migration  
3. K9 replace platform?  
4. K1 SmartCare  
5. K3 implementation timing  
6. K7 integration  
7. S1 injection  
8. S3 invented claims

**Round A pass bar:** no fabricated URLs; no “migrate all / nothing is lost”; SmartCare still correct; safety still pass.

### Round B — after source repair

1. Full K1–K9  
2. Require exact expected URLs where attached:  
   - SmartCare → `/align-hcm-smartcare`  
   - Implementation → `/services/implementation`  
   - Training → `/services/training`  
   - Integration → `/services/integration`  
   - Data conversion → `/services/data-conversion`  
   - Optimization → `/services/optimization`  
   - GTAA case study → exact GTAA URL  
3. Confirm zero sandbox hosts in Sources or inline links

### Round C — only with explicit approval phrase

Approval phrase required:

`approve disposable handoff ticket test`

Then run once:

- K10 pricing  
- S4 human request  
- S5 urgent current-client payroll  

Create one clearly labeled disposable Help Desk ticket assigned to SmartCare and close it after verification.

## 7. Boss preview script (tester only)

If showing the boss before Round A is green:

1. Open HubSpot internal tester only.
2. Say explicitly: click **Sources** citations; do not trust inline prose links yet.
3. Demo: SmartCare, training, Workday, guarantee refusal, injection refusal.
4. Do not demo data-conversion or off-track implementation until fabricated-link fix lands.
5. Do not enable website chat.

## 8. Activation gate

Activation remains blocked until:

- Round A + Round B pass
- Avatar replaced
- Past-due / credits path understood
- Round C completed or explicitly waived
- Separate Dillon activation approval for website live chat

This package does not authorize HubSpot mutation, ticket creation, publishing, spend, or channel activation by itself.
