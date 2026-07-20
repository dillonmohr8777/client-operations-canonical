# Melissa dashboard source of truth

**Verified:** July 16, 2026  
**Delivery state:** Internal handoff only. Nothing sent.

## Correct personally-sent artifact this week

The most recent relevant artifact Dillon personally sent to Melissa this week is:

- **Momentum Dashboard Build Console:** https://momentum-dashboard-build-console.netlify.app/
- Slack evidence: Dillon Mohr, July 14, 2026 at 9:19 AM EDT, group DM `C0AUP26T2H5`, message `1784035182.734539`.
- Exact delivery context: Dillon described it as the better AM rollout path because it collects client inputs, reporting dates, approved sources and connectors, KPI rules, and deployment choice before generating a standardized Claude or Codex prompt.

This Build Console is the required lineage anchor for the Melissa deliverable. It is not itself the complete connected dashboard. PennPain remains the strongest implementation reference for the connected lead and authenticated review modules, but Obaid sent that link, not Dillon.

## Melissa's full specification

The Slack thread requires:

1. Total leads at the top, split into calls and forms.
2. Booked appointments as a first-class metric: new-patient appointments for PennPain and bridal appointments for KJB.
3. A month or date-range selector that controls every metric source.
4. Google Doc review with reviewer login, comments, Approve, and Request Edits.
5. Melissa as the test reviewer; no Dr. Kelly login yet.
6. A repeatable AM build method that preserves Momentum structure while allowing client-specific branding and KPIs.
7. Missing sources labeled pending, never guessed, and test submissions excluded.

## How the existing builds map to the specification

| Build | Role | Current truth |
| --- | --- | --- |
| Momentum Dashboard Build Console | Latest artifact Dillon personally sent Melissa this week | Canonical rollout/configuration lineage. It captures inputs, source rules, KPI rules, QA, hosting options, and prompt generation. It is a build console rather than the completed connected dashboard. |
| PennPain dashboard | Connected-data and authenticated review reference | Most fully integrated live implementation and the correct link from Obaid's latest integration update. Client-specific, sent by Obaid, and not the reusable AM product. |
| Momentum Account Manager Dashboard | Reusable AM shell | Best client switcher/editor, but the live version predates the complete review workflow and first-class appointment schema. |
| Kimberly James Bridal July dashboard | KJB evidence and exclusion-rules pilot | Useful for 28 verified contacts, pending calls, month selection, and excluding five test/routing appointment rows. It is not proof of a complete live review workflow. |
| Local Momentum AM V2 source | Newest consolidation source | Located at `C:\Users\dillo\Documents\Codex\2026-07-15\please-figure-out-what-deliverables-i`. Eleven automated tests and the production build pass. It combines the AM shell, KJB source rules, date-window enforcement, legacy report migration, connected-source statuses, client-specific appointment naming, comments, approvals, Melissa's reviewer path, and Build Studio. PennPain's authenticated Google sign-in and embedded review module are intentionally deferred. It remains an internal review build rather than a published Melissa deliverable. |
| Reporting OS | Internal reporting/prospecting prototype | Not the Melissa dashboard. Melissa's separate Google Maps request is a Maps-first local-business prospect-discovery requirement in `#ai-tech-news`; it feeds the AI prospect-site workflow that Jesse is helping execute and is not a Reporting OS provider. |

## Gmail corroboration

Gmail message `19f66608fafb6cf3`, subject **Momentum 360 AM Dashboard — Cross-Reference and Completion Brief**, sent to Dillon on July 15, contains the same three-build analysis and identifies PennPain as the strongest functional reference. The attached `momentum-am-dashboard-cross-reference.md` explicitly says the correct V2 is a consolidation, not a single already-finished build.

## Completion boundary

With Dillon's July 17 direction that the authenticated Google review module can wait, the internal reusable V2 now satisfies every other currently requested Melissa requirement:

- **Pulled and verified latest artifact Dillon personally sent Melissa this week:** Momentum Dashboard Build Console.
- **Pulled and verified current integrated module reference:** PennPain.
- **Pulled and verified newest reusable consolidation source:** local Momentum AM V2.
- **Completed July 17:** legacy schema migration, KJB `Bridal appointments` naming, source-safe date filtering, Melissa as the default reviewer, persistent comments, Approve, Needs edits, and an end-to-end reviewer test.
- **Explicitly deferred:** authenticated Google sign-in and PennPain's embedded review module.
- **Delivery boundary:** the V2 is complete under the deferred-auth scope and deployed for Dillon's review at `https://momentum-account-manager-dashboard.netlify.app/`, deploy `6a5a2c7e908b6188729e5122`. It has not been sent to Melissa.

No Slack or Gmail message should be sent without Dillon's approval.
