# Replenish × 7-Eleven report deployment

- Published at: 2026-07-26
- Existing production site: `replenish-2026-06-06`
- Site ID: `2e6ffe87-6093-4a2a-85a0-17dda80ecc05`
- Final corrected deploy ID: `6a669019791e1bf65fe2dc74`
- Live report: https://replenish-2026-06-06.netlify.app/
- Compatibility route: https://replenish-2026-06-06.netlify.app/presentation/
- PDF: https://replenish-2026-06-06.netlify.app/downloads/Replenish-Weekly-Performance-2026-07-20-to-2026-07-26.pdf
- PowerPoint: https://replenish-2026-06-06.netlify.app/downloads/Replenish-Weekly-Performance-2026-07-20-to-2026-07-26.pptx
- Deploy log: https://app.netlify.com/projects/replenish-2026-06-06/deploys/6a669019791e1bf65fe2dc74

## Verification

- Live report: HTTP 200.
- Compatibility route: HTTP 200 and redirects to the current report.
- Exact 7-Eleven logo: HTTP 200.
- Presentation cover image: HTTP 200.
- PDF and PowerPoint: HTTP 200.
- Live DOM contains the July 20–26 reporting period and verified $153.72, 5,049, 288, 5.70%, and $0.53 KPI set.
- Live source contains no generic blue dashboard markers, deprecated directions language, old reporting dates, or unrelated client reporting.
- The horizontally scrollable campaign table is keyboard focusable and exposed as a labeled region.
- Desktop and 390 × 844 responsive browser checks passed.

The production root is now the Replenish × 7-Eleven client report. The prior generic blue root and superseded July 13–19 artifacts were removed from the current deliverable. The deleted files remain recoverable from Git history.
