# Align HCM Competitive Intelligence System

This folder contains a local, read-only competitive intelligence dashboard and an inactive n8n workflow for weekly refreshes.

## Open the dashboard

Open `dashboard.html` in a browser. The file is portable and self-contained. Its charts have static fallbacks and a packaged interactive runtime.

## Rebuild

Run:

```powershell
node .\scripts\build-dashboard.mjs
```

The build also writes the public Netlify package to `dist\`. Only the portable dashboard and response headers are included in that directory.

## Netlify

This deliverable is mapped to the existing Netlify site `align-hcm-competitor-intel-20260701`, site ID `4ce73b68-25c2-4b5a-8536-0765a912cb5a`.

Production: `https://align-hcm-competitor-intel-20260701.netlify.app`

See `NETLIFY.md` for the deployment ID, immutable URL, publish boundary, and verification record.

## Weekly refresh

The importable workflow is at `n8n\align-hcm-weekly-competitive-intelligence.workflow.json`. It is intentionally inactive. See `n8n\SETUP.md` before importing or activating it.

## Safety boundary

The system reads public sources and writes only to this local folder. It does not send messages, post to Slack, publish content, change CRM records, or deploy a website.

## Evidence boundary

The capability matrix records only what was confirmed on the official pages reviewed on July 26, 2026. A blank cell means not confirmed in this review, not that the firm lacks the capability.
