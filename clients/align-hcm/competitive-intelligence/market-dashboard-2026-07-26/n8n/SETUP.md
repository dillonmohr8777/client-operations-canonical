# Weekly Refresh Setup

The workflow is import-ready and intentionally inactive.

## What it does

Every Monday at 7:00 AM America/New_York, it runs the local Firecrawl refresh script. The script:

• Scrapes the nine approved official source pages with Firecrawl v2.

• Compares content hashes with the prior run.

• Saves a timestamped local snapshot and change log.

• Rebuilds the portable dashboard.

• Never changes semantic competitor claims automatically.

• Never sends, posts, publishes, deploys, or writes to a CRM.

## Before activation

1. Complete the local n8n owner setup at `http://127.0.0.1:5678` if it has not already been completed.

2. Add `FIRECRAWL_API_KEY` to the environment used by the n8n process. Do not put the key in this workflow file or repository.

3. Import `align-hcm-weekly-competitive-intelligence.workflow.json`.

4. Confirm the workflow timezone is `America/New_York`.

5. Run the command below outside n8n to validate the local path and dashboard build without calling Firecrawl:

```powershell
node .\scripts\refresh-with-firecrawl.mjs --dry-run
```

6. Run one manual n8n execution and review the local snapshot before activating the schedule.

## Review rule

A changed page is a review signal, not permission to rewrite the competitive brief automatically. Update source-backed claims only after reviewing the saved page content.

