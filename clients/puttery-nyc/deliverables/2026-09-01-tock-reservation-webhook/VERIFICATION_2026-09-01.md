# Puttery NYC Tock Receiver Verification

## Result

The canonical receiver package passes local code, protected credential, syntax, JSON, and secret-hygiene checks. Production remains held.

## Verified on September 1, 2026

- `npm test`: 13 passed, 0 failed.
- Windows PowerShell 5.1 protected end-to-end test: passed.
- Health check: passed.
- Target Business ID `37824` insertion: passed.
- Identical delivery retry suppression: passed.
- Non-target business filtering: passed.
- Raw guest data stored by the end-to-end test: false.
- Secret exposed by the end-to-end test: false.
- JSON files parsed: 5, with 0 parse failures.
- PowerShell files parsed: 5, with 0 syntax failures.
- JWT-shaped values found in the package: 0.
- Existing Gmail vendor reply draft updated in the original thread and verified with label `DRAFT`.
- Vendor draft ID: `r343221723841933233`.
- Vendor draft message ID: `1a05e7e9138bb544`.
- Vendor thread ID: `1a049e62f063f279`.
- Vendor draft sender: `dillonmohr8777@gmail.com`.
- Vendor draft recipient: `api-integration@resy.com`.
- Vendor draft copies: `tluciano@driveshack.com`, `joe@highlinecomedy.com`.
- Vendor draft sent: false.

## Data Exports probe boundary

- Official endpoint used: `https://api.exploretock.com/api/data/export/urls`.
- Unauthenticated response: HTTP `403`.
- One exact-scope, credentialed, read-only response: HTTP `503`.
- Rechecked at `2026-09-01T20:31:35Z`: the exact-scope credentialed request still returned HTTP `503`.
- Authentication and provisioning are not considered validated.
- Credential or signed URL exposed: false.
- Outbound email or Slack message sent during this recheck: false.

## Unverified here

Docker is not installed on this machine, so the new multi-stage container definition was not built locally. Its build stage is configured to run the same 13-test suite before producing the runtime image. An approved host must build and verify it before deployment.

No durable HTTPS host, live webhook registration, controlled Tock payload, production booking value, or ad-platform delivery was created or claimed.
