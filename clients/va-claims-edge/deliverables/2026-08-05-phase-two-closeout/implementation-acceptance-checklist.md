# VA Claims Edge Phase Two implementation and acceptance checklist

Status: review site published and verified; no claimant data, booking, DNS, paid media, or client communication mutation performed

## Review surface

- [x] One current unified review URL for claimant and operations paths.
- [x] Existing mapped Netlify review site was redeployed and the three core routes returned HTTP 200.
- [x] Live bundles contain the seven stage process markers and the internal lifecycle controls.
- [x] Review build labels claimant, appointment, rating, file, message, and timing values as illustrative.
- [x] Dashboard shows `Awaiting Nexus Letter`, the 60-day recorded-contact rule, and `Ready to File`.
- [x] Signup requires name, date of birth, email, and phone before the review booking flow continues.
- [x] Client portal exposes the evidence checklist with complete, pending, and not-required states.
- [x] Client portal exposes rating, appointment timezone context, countdown, and stage pacing as review behavior.
- [ ] Client and operator review the seven-stage process model and confirm terminology.
- [ ] Client confirms whether both Central Time and the client's local time should remain visible.
- [ ] Client confirms initial stage-average copy and reminder language.

## Lifecycle behavior to demonstrate locally

- [x] Seven stages are represented with owner, target, alert, entry event, and exit event.
- [x] Client-owned, firm-owned, and VA-owned alert tone is distinguished.
- [x] Stage 4 graduated touchpoints are documented at approximately days 15, 30, and 45, with a day-60 staff escalation.
- [x] Stage 7 clock is documented as starting at the final exam date.
- [x] A terminal outcome control is defined for `successful` and `relationship ended`.
- [x] An unfavorable-decision loop is defined to return to Stage 2 after decision-letter upload.
- [x] The internal review record includes an illustrative master-clock stop, terminal-outcome choice, and Stage 2 restart control.
- [ ] Stage 6 and Stage 7 boundary events are explicitly approved by David.
- [ ] Records-complete criteria and partial-submission ownership are explicitly approved.
- [ ] The `LAPSED_PROSPECT` threshold is confirmed as automatic or staff-confirmed.
- [ ] Terminal-list behavior and post-decision appeal handling are confirmed.
- [ ] Production persistence, audit history, permissions, and claim-cycle reporting are connected and independently verified.

## Booking and measurement gates

- [ ] Minimum advance notice is 24 hours.
- [ ] Maximum booking horizon is 45 days.
- [ ] Primary owner availability is Monday through Friday, 10:30 AM to 4:00 PM Central.
- [ ] Claim-filing duration is 75 minutes.
- [ ] Free consultation and pre-exam briefing remain 30 minutes.
- [ ] Automatic calendar sync is verified.
- [ ] Automatic Google Meet link creation is verified.
- [ ] Confirmation delivery is verified.
- [ ] Exact WordPress or Amelia access route is mapped without exposing a credential.
- [ ] Synthetic booking test is approved, run, and read back without contacting a prospect.
- [ ] Production signup, portal, scheduling, and meeting events are instrumented after booking QA.

## Security and compliance gate

- [x] Slack evidence records Row Level Security, protected routes, HTTPS, and environment-variable API-key storage as current technical controls.
- [ ] Formal compliance review is completed before real claimant data is entered.
- [ ] HIPAA and veteran-specific data applicability is assessed by the appropriate qualified reviewer.
- [ ] Production data fields, permissions, retention, audit, and file-size rules are approved.

## Delivery and ownership

- [ ] David reviews and accepts or revises the lifecycle model.
- [ ] Obaid connects the approved schema and persistence behavior after sign-off.
- [ ] James or the web owner corrects and verifies Amelia/WordPress booking behavior.
- [ ] The team confirms the DNS owner and points `portal.vaclaimsedge.com` only after approval and access verification.
- [ ] Dillon sends the final client update only after the exact draft and delivery timing are approved.

## Closeout rule

The Phase Two design and review package is ready to close when every unchecked item is assigned to an owner or explicitly moved to the Phase Three production gate. The project is not production-complete while booking, compliance, persistence, DNS, or measurement remains unchecked.
