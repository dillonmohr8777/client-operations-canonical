# Vendor reply draft

**Thread:** `Follow Up: Puttery NYC | Tock API integration x Webhooks??`  
**From:** `dillonmohr8777@gmail.com`  
**To:** `api-integration@resy.com`  
**Cc:** `tluciano@driveshack.com`, `joe@highlinecomedy.com`  
**Reply status:** Verified Gmail draft. Do not send until Dillon approves this exact reply.
**Draft ID:** `r-164939560219168303`
**Draft message ID:** `1a05f126a89b5e37`
**Thread ID:** `1a049e62f063f279`
**Verified:** 2026-09-01 18:23 ET with label `DRAFT`

An earlier, shorter reply was sent in this thread at 2026-09-01 16:02 ET. It requested the vendor's next steps and preferred secure exchange route, contained no credential, and did not include the later 503 triage. This draft is the unsent technical follow-up.

Hi Laura,

Thank you for confirming the account identifiers and that Business ID is the authoritative filter for Puttery NYC.

We have bound Business Group ID 28086 and Puttery NYC Business ID 37824 and completed local validation of the Reservation Webhook receiver, including authorization, NYC filtering, and duplicate suppression.

For security, please revoke the role credential that was sent through ordinary email and confirm an approved secure route for the replacement.

We also ran a redacted read only check against the Data Exports endpoint using the exact business and group identifiers. A request with no credential returned HTTP 403. A request with a random invalid credential returned a Cloudflare HTTP 503 origin error, and the stored credential returned the same 503 response shape three times at five minute intervals with no Retry After header. We are not treating access as validated because the service appears unavailable before it can accept or reject the credential.

Could you please confirm whether Data Exports is currently unavailable, still requires provisioning for this account, or uses a different validation route? I can provide the five timestamps and Cloudflare ray IDs from the redacted checks if helpful. Please also confirm the approved secure route for credential replacement so the value originally sent through email can be rotated.

Once our durable HTTPS endpoint is cleared, I will provide the endpoint and authorization header through the approved secure route, then request Reservation Webhook registration and one controlled Puttery NYC test event.

Thank you,

Dillon
