# Momentum DeerFlow deployment — September 20, 2026

**DEPLOYED and verified at 01:09 UTC September 21 (September 20 Eastern).**

- [Open Command Center on the private network](https://desktop-4ahkec4.tailade026.ts.net:8443/workspace/command-center)
- [Open the 46-channel Slack knowledge project](https://desktop-4ahkec4.tailade026.ts.net:8443/workspace/projects/70d0a5eaf2f54e65accdc224227b124c)
- Local access: http://localhost:2026/workspace/command-center

## Version and preserved data

Built the latest fetched upstream main, `29d28573` (27 additional upstream commits), with Momentum's current customizations. Upstream main identifies as `2.1.0-rc0`; this is a current-main deployment, not a claim that 2.1 is a stable release. The isolated deployment source is commit `4c532752` in `C:/Users/dillo/Documents/Qwen/deer-flow-deploy-20260920`, branch `codex/deploy-momentum-20260920`. The shared dirty checkout was preserved. Compatible upstream dependency locks were retained; nginx:alpine and redis:7-alpine were refreshed. Arbitrary major dependency upgrades were not introduced.

The existing project retains 47 documents: one index and all 46 joined Slack channels, covering August 21–September 20 Eastern. It contains 4,116 messages including 674 replies; 61 sensitive messages were withheld and eight channels were empty in the window. This remains a dated knowledge snapshot; continuous Slack synchronization was not added by this deployment.

## Verification

- Production frontend build and TypeScript checks passed; 53 frontend tests passed.
- 97 focused backend migration/document/artifact tests passed. The final gateway image passed four strict WeChat event-loop regression tests after a two-line MIME detection fix.
- Copied-live database migration preserved all 1,485 existing rows across 29 tables. Live database integrity is `ok`, revision `0028_merge_org_mcp`.
- On the final running image, all 47 document contents match their saved SHA-256 hashes through the API and native project retrieval tools (107 pages). Three foreign-owner API requests returned 404; native foreign-owner retrieval was also denied.
- The authenticated browser showed `Showing 47 of 47`, the current Command Center, and 12 owner-visible run receipts. Receipt Escape dismissal restored focus. At 320px, page and receipt widths were 320px; high-contrast receipt text remained readable. The project uses its existing dark theme; Command Center retains its branded light design. Temporary browser emulation was reset.
- Gateway and Redis report healthy; frontend and nginx are running and serve the verified authenticated workspace. The only published Docker port is localhost 127.0.0.1:2026. Private HTTPS routing reaches the sign-in page; an authenticated phone session was not tested.

No full backend-suite or new live model-answer-quality claim is made. Forty configured models remain available through the API. Tests did not initiate a paid model run.

## Evidence and operation

`deployment-receipt.json` records exact running image digests and checks. `deerflow-feed/deployment-live-verification.json` and `deerflow-feed/native-retrieval-verification.json` contain the post-restart retrieval evidence. Relevant test/migration logs are adjacent.

Use the original `docker/docker-compose.yaml` plus this folder's `deployment.compose.json`. Before future Compose operations, dot-source `load_deployment_secrets.ps1`; it reuses service-only credentials stored in the private gateway volume. Do not print environment values or commit credential files. Existing user JWT/sign-in data was preserved.

## Rollback

Before cutover, all services were stopped and both persistent volumes were copied and byte-hash verified: gateway 225 files / 31,625,767 bytes; Redis four files / 6,860,332 bytes. Old image tags are recorded in `deployment-before.json`. Backup volumes are `deer-flow-gateway-backup-20260920-latest` and `deer-flow-redis-backup-20260920-latest`.

For rollback, stop the current stack, retain or snapshot current volumes if preserving post-deployment work, load the service environment, and run the original Compose file with `deployment.rollback.compose.json` as the last override, using `up -d --no-build --wait`. That override mounts the saved pre-upgrade volumes and old images; starting it writes to those restored volumes, so clone the backups first if an immutable recovery copy must be retained. Restoring the snapshots discards later writes from the restored application view. Do not start old gateway code against the newly migrated database. Backups were verified, but no destructive rollback rehearsal was performed on the live stack.
