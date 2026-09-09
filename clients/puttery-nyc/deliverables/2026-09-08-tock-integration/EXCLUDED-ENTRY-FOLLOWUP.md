# Excluded entry investigation

Laura requested the exact source file and lookup details in Gmail message `1a081f38cc57b48c` on September 8, 2026. Two read-only scans reproduced one missing-ID row across the same six reservation files, with matching file hashes and 27,639 source rows. No guest export was downloaded and no raw reservation payload was persisted.

The entry is record 289 (array index 288) in `reservation-4.json`, last modified September 8 at 06:57:36 UTC. Its service time is June 16, 2025 at 5:30 PM New York time, party size 2. The JSON object has no `id` property and has a populated `walkinId`. Whether this is an expected walk-in record in reservation exports remains a vendor question, not a confirmed defect. It remains excluded from the normalized reservation record count.

Detailed support identifiers and hashes are in the existing protected ClientAccess storage at `PutteryNYC/vendor-diagnostics/2026-09-08/`. The project diagnostic is redacted. The diagnostic script uses the existing protected launcher, shared parser, and receiver validator without modifying the snapshot or ingestion pipeline. `check-excluded-diagnostic.mjs` verifies the source locator, absent ID, party size, venue-local timestamp, and output boundary using the protected evidence.

The existing Gmail draft was updated with the exact lookup information and a question about expected walk-in handling. To: Resy API Integrations; Cc: Tom Luciano and Joe Pedevillano. The draft was read back, its body matched, and DRAFT was verified. No message was sent. See `excluded-entry-draft-receipt.json`.

Independent review passed the factual investigation. Its two findings were applied: explicitly scope the excluded count to our normalized records, and keep detailed identifiers/hashes in protected storage while redacting the project copy.

Update: following Dillon's subsequent authorization, the detailed reply was sent in the existing thread and read back. Message `1a08208206222425` has SENT, the intended Resy recipient, Tom and Joe copied, and a matching new body. See `excluded-entry-sent-receipt.json`. The draft status above records the earlier stage.
