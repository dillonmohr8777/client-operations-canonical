# Vendor reply draft

**Thread:** `Follow Up: Puttery NYC | Tock API integration x Webhooks??`  
**From:** `dillonmohr8777@gmail.com`  
**To:** `api-integration@resy.com`  
**Cc:** `tluciano@driveshack.com`, `joe@highlinecomedy.com`  
**Reply status:** Draft only. Do not send until Dillon approves this exact reply.

Hi Laura,

Thank you for confirming the account identifiers and that Business ID is the authoritative filter for Puttery NYC.

We have bound Business Group ID 28086 and Puttery NYC Business ID 37824 and completed local validation of the Reservation Webhook receiver, including authorization, NYC filtering, and duplicate suppression.

For security, please revoke the role credential that was sent through ordinary email and confirm an approved secure route for the replacement.

We also made one read only request to the Data Exports endpoint using the exact business and group identifiers. It returned HTTP 503, while an unauthenticated request returned HTTP 403, so we are not treating access as validated. Could you please confirm whether the 503 response is temporary or whether Data Exports still requires provisioning?

Once our durable HTTPS endpoint is cleared, I will provide the endpoint and authorization header through the approved secure route, then request Reservation Webhook registration and one controlled Puttery NYC test event.

Thank you,

Dillon
