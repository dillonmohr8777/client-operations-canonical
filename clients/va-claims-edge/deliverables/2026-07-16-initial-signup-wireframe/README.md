# VA Claims Edge initial signup wireframe

## Outcome

This adds the initial signup step requested by James Frederick after he approved the July 15 clickable end-user wireframe.

The flow intentionally asks for only the minimum account data:

1. Email and password.
2. Full name, optional mobile number, alert preference, and consent.
3. Review-only success state that opens the already-approved portal preview.

Claim details, medical information, service history, and file uploads are deferred to the authenticated portal. The prototype makes no network requests and stores no entered values.

## Review

Open `https://va-claims-edge-design-sprint.netlify.app/`. Complete both steps, test validation and password reveal, then choose **Enter portal preview** to confirm the handoff into the approved VA Claims Edge wireframe.

## Verification

Run:

```powershell
node test.mjs
```

## Production handoff

Obaid's implementation can reuse the visual structure and validation rules while connecting account creation to the Phase 2 authentication stack. Production must add email verification, server-side validation, rate limiting, consent versioning, audit events, and the approved security policies before collecting real data.

The review-only build is published at the Netlify URL above as deploy `6a5a302136562594b26fc1cf`. It uses the exact logo and shield-ribbon assets from the approved portal plus the same Epilogue typeface and navy, red, ivory, and cyan design tokens. It has not been sent to the client. Netlify retains the previous deploys for rollback.
