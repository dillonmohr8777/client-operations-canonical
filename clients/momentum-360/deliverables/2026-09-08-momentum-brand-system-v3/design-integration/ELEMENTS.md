# Reusable Momentum design elements

A configuration inventory, not a new design pass. Verified against current local files on September 8, 2026. This is a focused starting set from several Momentum sessions, not an exhaustive claim about every past session.

Primary focus: gorgeous, readable, interactive ebooks. Select a few elements that serve the reading experience. Establish one chapter treatment before extending it across the collection.

| Existing element | Useful for | Current source |
|---|---|---|
| Editorial typography | Chapter openings and long-form reading | [DESIGN.md](C:/Users/dillo/Documents/Codex/projects/client-operations/clients/momentum-360/deliverables/2026-09-08-momentum-brand-system-v3/DESIGN.md) · current |
| Complete reader shell | Ebooks | [01-show-up-when-they-ask-ai.html](C:/Users/dillo/Documents/Codex/projects/client-operations/clients/momentum-360/deliverables/2026-09-08-momentum-brand-system-v3/01-show-up-when-they-ask-ai.html) · current |
| Contents, search and progress | Long guides and handbooks | [app.js](C:/Users/dillo/Documents/Codex/projects/client-operations/clients/momentum-360/deliverables/2026-09-08-momentum-brand-system-v3/app.js) · current |
| Expandable source notes | Evidence-rich writing | [build_ebooks.py](C:/Users/dillo/Documents/Codex/projects/client-operations/clients/momentum-360/deliverables/2026-09-08-momentum-brand-system-v3/build_ebooks.py) · current |
| Six reusable icon animations | Small explanatory moments and replayable diagrams | [exercises.js](C:/Users/dillo/Documents/Codex/projects/client-operations/clients/momentum-360/deliverables/2026-09-08-momentum-brand-system-v3/exercises.js) · current |
| Timing, pause and reduced motion | Purposeful animation without continuous distraction | [exercises.css](C:/Users/dillo/Documents/Codex/projects/client-operations/clients/momentum-360/deliverables/2026-09-08-momentum-brand-system-v3/exercises.css) · current |
| Five practical interactive workbenches | End-of-chapter application | [exercises.js](C:/Users/dillo/Documents/Codex/projects/client-operations/clients/momentum-360/deliverables/2026-09-08-momentum-brand-system-v3/exercises.js) · current |
| Saved state and portable downloads | Exercises readers can keep using | [exercises.js](C:/Users/dillo/Documents/Codex/projects/client-operations/clients/momentum-360/deliverables/2026-09-08-momentum-brand-system-v3/exercises.js) · current |
| Exact logo and header transition | Covers and library entrances | [app.js](C:/Users/dillo/Documents/Codex/projects/client-operations/clients/momentum-360/deliverables/2026-09-08-momentum-brand-system-v3/app.js) · current |
| Searchable five-book collection | Collection landing page | [index.html](C:/Users/dillo/Documents/Codex/projects/client-operations/clients/momentum-360/deliverables/2026-09-08-momentum-brand-system-v3/index.html) · current |
| Earlier native ebook spreads | Possible chapter-layout reference | [EbookSpread.dc.html](C:/Users/dillo/Documents/Codex/projects/client-operations/clients/momentum-360/deliverables/2026-09-07-ai-division-collateral-canvas/EbookSpread.dc.html) · reference; superseded styling |
| Earlier interactive scorecard | Possible workbook reference | [EbookScorecard.dc.html](C:/Users/dillo/Documents/Codex/projects/client-operations/clients/momentum-360/deliverables/2026-09-07-ai-division-collateral-canvas/EbookScorecard.dc.html) · reference; not adopted |
| Earlier vector icon family | Possible small functional icons | [icons.svg](C:/Users/dillo/Documents/Codex/projects/client-operations/clients/momentum-360/deliverables/2026-09-08-momentum-brand-system-v2/assets/icons.svg) · reference; not adopted |
| Layered paper film treatment | Possible restrained chapter transition | [build.py](C:/Users/dillo/Documents/Codex/projects/client-operations/clients/momentum-360/deliverables/2026-09-08-momentum-brand-system-v3/three-distinct-films/build.py) · reference; video renderer, not a drop-in web component |

## First configuration to review together

- Keep Archivo Black, Nunito Sans and the current blue/white reading system.
- Choose a chapter opening, body-reading layout, useful callout and exercise pattern.
- Choose two or three small motion behaviors from the existing six roles. Replay on demand; respect reduced motion.
- Reuse source disclosures, search, progress and per-book saved state.
- Treat the supplied Momo clips as supporting references. No illustration-generation work is required to configure the ebook system.

## Connections

[Native five-ebook project](https://claude.ai/design/p/735d088e-aa09-41e7-be15-9afdd92a2948) contains six native pages and 66 preserved sections. [Momentum Design System](https://claude.ai/design/p/09b3bbc0-a8f7-4acc-88ae-8a47648d75a4) is published for reuse, with its organization-wide default removed. The local code and native code are separately maintained copies; automatic bidirectional sync is not verified.

Use `/momentum-design` in Claude Code from this project to select existing pieces and prepare a scoped design brief. The command starts with configuration. A request to configure does not authorize a full redesign.

The working native import uses page-level CSS for manuscript styling and fluid mobile reflow. Native tests fixed distinct per-book storage keys and the empty-search message. Preserve those fixes when moving code back.

## Evidence

`elements.json` records real source locations and hashes. Refresh it against current files before treating this snapshot as current in a later session. The two exact user-supplied MP4s are preserved in `references/`.

Official Claude Code skill format: https://code.claude.com/docs/en/skills
