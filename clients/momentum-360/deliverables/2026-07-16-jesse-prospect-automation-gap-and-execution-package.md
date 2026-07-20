# Jesse prospect-site automation: exact remaining work

**Verified:** July 16, 2026  
**State:** Build complete through local draft generation. Outreach remains disabled.

## Bottom line

The site-building and draft-compilation pieces are not the bottleneck.

- 32 private staged concepts exist: seven fully packaged pilot records and 25 additional researched concepts.
- The first seven include a site, audit/ad concept, postcard proof, QR asset, tracking ID, and CRM row.
- The email draft compiler works, makes zero network calls, caps the first pilot at two prospects, and keeps `send_enabled=false`.
- Two automation tests pass.
- Current run: seven draft payloads generated, zero approval-ready, seven blocked.

Jesse's remaining work is the verified prospect-to-approval bridge and the eventual Zap, not more site generation.

## Correct Google Maps routing and request ownership

Melissa originated the Google Maps requirement in `#ai-tech-news`. Her July 14 request was to make the prospect-discovery flow work more like the original example by pulling local businesses from Google Maps instead of starting from Instagram links, because that connects more directly to Momentum 360 services.

Operationally, that requirement belongs upstream in the AI prospect-site workflow Jesse is helping execute. It is not a metric or provider inside Melissa's AM reporting dashboard, and it is not a Jesse-originated requirement. Google Maps is the research and identity-verification source before any site concept, CRM promotion, or outreach review.

For each current or future prospect, the research record must begin with or be reconciled against Google Maps and retain:

- Google Maps URL and place ID
- exact business name
- primary category
- formatted address
- public phone
- official website
- rating and review count as observed facts only
- query and market used
- verification timestamp
- conflicts between Maps, the official site, and the existing CRM record

The attached `maps-prospect-intake.schema.json` is the required contract. No Maps record is allowed to imply that a public email or decision maker came from Maps when it did not.

## Current seven-record blockers

All seven are blocked by the same core gates:

1. No verified decision-maker name or title.
2. Claims and imagery are not approved.
3. `no_contact` remains true.
4. No record is in the approved two-prospect pilot stage.
5. Sender email, physical address, opt-out language, campaign approver, and approval reference are not configured.
6. Sales owner is unassigned.
7. Mailing addresses still need confirmation.

Two records have one additional blocker: Authorized Motor Service and Overhill Flowers have no verified public email in the CRM.

## Fastest honest pilot path

### Phase A: Maps reconciliation

1. Reconcile the seven prebuilt businesses in Google Maps using the new schema.
2. Reject any record with a material identity, address, phone, category, or website conflict.
3. Keep Maps facts and official-site facts separately attributed.

### Phase B: choose two only

Start evaluation with `PHL-SITE-001` Peter Mechanical and `PHL-SITE-002` The Roof Doctor because both already have a public business email and the full creative package. This is a review order, not approval to contact them.

The final two require:

- verified decision maker and title from a defensible public source;
- verified business email and suppression check;
- approved site facts, copy claims, imagery, audit language, and postcard proof;
- named sales owner and campaign approver;
- exact sender identity, physical address, and opt-out language;
- explicit Dillon approval of the exact two messages and recipients.

### Phase C: build the paused Zap

Only after the data and owner fields above are complete:

1. Connect the correct Zapier workspace and approved sender account.
2. Trigger only on the exact approved CRM stage.
3. Validate the payload schema and idempotency key.
4. Create a draft or internal approval record first.
5. Keep email, phone, print, form, ad, and CRM-write actions paused.
6. Add suppression, retry limits, audit logging, and stop conditions.
7. Require a separate explicit activation approval.

## Definition of ready for Dillon's approval

A prospect is ready for approval only when a single review packet contains:

- Google Maps verification record
- official-site verification record
- decision-maker evidence
- final concept URL with `noindex` verified
- approved factual claims and imagery
- final email body and subject
- sender identity, required address, and opt-out language
- suppression result
- named sales owner and approver
- the exact proposed send action, still disabled

## Current ownership gap

| Role | Current state |
| --- | --- |
| Campaign sponsor | Mac Frederick recorded |
| Creative owner | Dillon Mohr recorded |
| Audit/ad partner | Jesse DiLaura recorded |
| Research owner | Unassigned |
| Sales owner | Unassigned |
| Compliance reviewer | Unassigned |
| Campaign approver | Not recorded |

That ownership gap is why the automation cannot honestly advance to live outreach today.

## No-send boundary

Nothing in this package authorizes prospect contact. The compiler remains draft-only, no Slack or Gmail message has been sent, and no Zap has been activated.
