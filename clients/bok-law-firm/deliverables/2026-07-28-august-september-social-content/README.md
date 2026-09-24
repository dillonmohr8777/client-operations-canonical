# BOK August–September 2026 Social Content

> **Superseded after client-format clarification.** The review-ready output that matches the supplied July PDF is in `monthly-final/`. Use the two separate monthly PDFs and eight separate graphics there. The weekly batch below is retained only as an earlier production draft.

This production package contains eight weeks of review-ready BOK Law & Mediation Services social content.

## Deliverables

- `content.json`: canonical content data and source basis
- `copy/content-calendar.md`: eight-week publishing calendar
- `copy/complete-social-copy.md`: all 32 finished captions and hashtags
- `social-graphics/`: 32 branded 1200×1200 PNG graphics
- `pdf/This-Week-With-BOK-*.pdf`: eight five-page weekly review packets
- `pdf/BOK-August-September-2026-Content-Master.pdf`: combined 41-page review packet
- `previews/`: visual QA contact sheets
- `qa/qa-report.md`: deterministic content and artifact checks
- `manifest.json`: output hashes and byte sizes

## Approval boundary

Nothing in this package is scheduled or published. Final legal wording, graphic pairing, dates, and platform placement require BOK approval and a duplicate check. The Best Lawyers post is separately embargoed until the morning of August 20, 2026.

## Source basis

- BOK public website and mediation/service pages
- Pennsylvania Unified Judicial System public family-law resources
- BOK's established weekly social series and recent client corrections
- Client-verified Best Lawyers distinctions and release date

## Rebuilding

Update `content.json`, then run:

```powershell
python .\build_content_packets.py
```
