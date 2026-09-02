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
- Gmail thread ID: `1a049e62f063f279`.
- A shorter vendor reply was sent at 2026-09-01 16:02 ET from `dillonmohr8777@gmail.com` to `api-integration@resy.com`, copying `tluciano@driveshack.com` and `joe@highlinecomedy.com`.
- Sent message ID: `1a05e90c3108a1f3`; live Gmail readback showed label `SENT`.
- The sent body requested the next steps and preferred secure method for sharing the webhook endpoint and authorization details. It contained no credential and predated the 503 triage.
- The previously recorded draft ID `r343221723841933233` and message ID `1a05e7e9138bb544` no longer resolve in Gmail.
- The complete 503 and credential-rotation follow-up was recreated in the same thread and verified with label `DRAFT` at 2026-09-01 18:23 ET.
- Current vendor draft ID: `r-164939560219168303`.
- Current vendor draft message ID: `1a05f126a89b5e37`.
- Current vendor draft sent: false.

## Data Exports probe boundary

- Official endpoint used: `https://api.exploretock.com/api/data/export/urls`.
- No-credential control at `2026-09-01T21:35:06Z`: HTTP `403`, empty body, Cloudflare ray `a34767181ddc6665-IAD`.
- Random wrong-credential control at `2026-09-01T21:35:07Z`: HTTP `503`, 9,102-byte `text/html` response with the redacted `unavailable` and `try again` indicators, Cloudflare ray `a347671ebe0ad6a3-IAD`.
- Stored-credential probe 1 at `2026-09-01T21:38:20Z`: HTTP `503`, 9,102-byte Cloudflare origin-error response shape, ray `a3476bd418eae643-IAD`.
- Stored-credential probe 2 at `2026-09-01T21:43:21Z`: HTTP `503`, the same redacted response shape, ray `a347732fa9ff5fa6-IAD`.
- Stored-credential probe 3 at `2026-09-01T21:48:22Z`: HTTP `503`, the same redacted response shape, ray `a3477a899ef7d703-IAD`.
- None of the four responses with an authorization header included `Retry-After`.
- Because both a random value and the stored value reach the same unavailable origin path, this result isolates the current 503 upstream of credential validation. It does not validate the stored credential or provisioning.
- Credential, signed URL, and response body exposed: false.
- Outbound email or Slack message sent during the 21:35Z to 21:48Z probe recheck: false. The current technical follow-up remains an unsent draft.

## Unverified here

Docker is not installed on this machine, so the new multi-stage container definition was not built locally. Its build stage is configured to run the same 13-test suite before producing the runtime image. An approved host must build and verify it before deployment.

No durable HTTPS host, live webhook registration, controlled Tock payload, production booking value, or ad-platform delivery was created or claimed.
