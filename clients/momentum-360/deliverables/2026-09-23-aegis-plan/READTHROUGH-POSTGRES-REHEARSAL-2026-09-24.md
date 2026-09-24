# PostgreSQL readthrough rehearsal — 2026-09-24

Script: `readthrough-rehearsal.cjs`

Command: `node --experimental-strip-types readthrough-rehearsal.cjs` with `DATABASE_URL=postgres://radar:***@127.0.0.1:25433/aegis_readthrough`

Disposable database: `postgres:16-alpine`, container `aegis-intake-readthrough-20260924-1`, container id `9892decc34c47e1db0cfadcb4577148a90e52896b915fdd5a03c8a5fe450d02e`, bound to `127.0.0.1:25433`; stopped and removed after the pass.

Receipt:

```json
{"pass":true,"store":"postgres","independentStores":2,"initialCacheMisses":2,"readThroughHydrated":["campaigns","intake_submissions","suppressions"],"processIntakeAuditJob":{"skipped":true,"reason":"suppressed domain"},"submissions":1,"auditJobs":1,"submittedEvents":1,"prospects":1,"externalFetches":0,"syntheticOnly":true,"observedAt":"2026-09-24T14:08:13.123Z"}
```

The reader store was created before the writer committed synthetic campaign and intake rows. Its local cache missed both rows, then `readThrough` hydrated them from PostgreSQL. The job path read the hydrated submission and campaign, loaded a synthetic domain suppression, and returned before any public scan; the fetch trap recorded zero external calls.

Limitation: this is a readthrough and job-lookup acceptance check. The synthetic suppression intentionally stops before public scanning, report rendering, delivery, or any external provider call.
