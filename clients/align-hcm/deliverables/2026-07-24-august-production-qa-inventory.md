# Align HCM August 2026 production — independent QA inventory

**Work item:** `wi-20260723-0004`  
**Inventory snapshot:** 2026-07-24T12:25:18Z  
**Scope:** local read-only inspection of the Align client repository plus this client-scoped QA record.  
**Canonical mutation:** none. This file does not update the queue, `CONTROL.md`, `state/`, the Align worktree, or any external system.

## Status standard

- **Verified present** means the named file was found and its media/image metadata was independently read in this audit.
- **Pending until file exists** means no corresponding final output was found in the inspected Align worktree at the snapshot time; a brief, prompt, source, or prior status statement is not a finished deliverable.
- Prior QA reports are cited as supporting records, not treated as a substitute for the independent metadata checks below.

## Current production inventory

| Item | Current QA state | Independent evidence | Remaining gate |
|---|---|---|---|
| AN01 — Implementation Starts Before Kickoff | **Verified present; local master** | `deliverables/align-implementation-starts-before-kickoff-30s/master-1080x1350.mp4`; ffprobe: 30.000000 s, 1080×1350, H.264, yuv420p, TV range, 30/1 fps, 5,048,508 bytes; SHA-256 `508e40a1bb01365f9182972f227ae5223b52a0947efa4d4e3568197f8d742912`. Full decode with `ffmpeg -v error ... -f null -` completed with no error output. | Owner creative/content review. The file contains video only; the prior QA report says it is intentionally silent and has no approved voice track. |
| AN02 — Train for the Job, Not the Screen | **Verified present; final local master** | `deliverables/align-academy-train-for-the-job-45s/master-1080x1350.mp4`; independent ffprobe: 45.000 s, 1080×1350, H.264, yuv420p, 30 fps. Full decode passed. Poster is 1080×1350 and the final-frame contact sheet is nonblank. | Owner creative/content review; approved voiceover remains a separate production input. |
| AN03 — Go Live Is the Starting Line | **Verified present; final local master** | `deliverables/align-smartcare-starting-line-60s/master-1080x1350.mp4`; independent ffprobe: 60.000 s, 1080×1350, H.264, yuv420p, 30 fps. Full decode passed. Poster is 1080×1350 and the final-frame contact sheet is nonblank. | Owner creative/content review; approved voiceover remains a separate production input. |
| AN04 — Public Service Cannot Pause | **Verified present; final local master** | `deliverables/align-public-service-cannot-pause-60s/master-1080x1350.mp4`; independent ffprobe: 60.000 s, 1080×1350, H.264, yuv420p, 30 fps. Full decode passed. Poster is 1080×1350 and the final-frame contact sheet is nonblank. | Owner creative/content review; approved voiceover remains a separate production input. |
| AN05 — GTAA: 12 Priority WFM Needs in Six Months | **Verified present; final local master** | `deliverables/align-gtaa-12-needs-six-months-60s/master-1080x1350.mp4`; independent ffprobe: 60.000 s, 1080×1350, H.264, yuv420p, 30 fps. Full decode passed. Poster is 1080×1350 and the final-frame contact sheet is nonblank. | Owner creative/content review; approved voiceover remains a separate production input. |
| AN06 — Different Missions. Same Workforce Pressure. | **Verified present; final local master** | `deliverables/align-different-missions-same-pressure-60s/master-1080x1350.mp4`; independent ffprobe: 60.000 s, 1080×1350, H.264, yuv420p, 30 fps. Full decode passed. Poster is 1080×1350 and the final-frame contact sheet is nonblank. | Owner creative/content review; approved voiceover remains a separate production input. |
| AUG05R — Beumer carousel | **Verified present; six-slide set** | Six PNGs exist at `assets/generated-static/beumer-carousel/AUG05R-beumer-01.png` through `-06.png`. Pillow opened and verified every file: PNG, RGB, 1080×1350. Byte sizes: 825,314; 815,516; 812,180; 821,381; 815,664; 843,933. SHA-256 values are recorded below. `index.html`, `render.js`, contact sheet, and `qa-report.md` are present. | Owner creative/content review. This audit did not repeat the prior visual contact-sheet review or independently retrieve the live case-study page. |
| AUG08R — Troon proof card | **Verified present; static PNG** | `assets/generated-static/troon-case-study-proof-card.png`; Pillow open/verify: PNG, RGB, 1080×1350, 2,387,602 bytes; SHA-256 `10f2ee383628cac71f7ec4a4fa531d4a05bf45ec0d6a27aa97ca61627ab0eea4`. Reproducible source block exists in `assets/generated-static/static-proof-cards.html` and contains the locally approved 30,000 employees / 900+ locations / 35+ countries copy. | Owner visual/content review. No dedicated Troon QA report was found; this audit verifies file integrity and dimensions, not pixel-level composition or live-page claim currency. |
| AUG12 — Treat the Platform Like a Product podcast recut | **Verified present; final local master** | `deliverables/maher-brent-podcast-recuts/PC01-treat-the-platform-like-a-product-1080x1350.mp4`; independent ffprobe: 59.445 s, 1080×1350, H.264, yuv420p, 30 fps, AAC stereo at 48 kHz. Full decode passed. Offline captions now end on the complete phrase “the cycle.” | Owner editorial/caption review. |
| AUG16 — Speak the CFO's Language podcast recut | **Verified present; final local master** | `deliverables/maher-brent-podcast-recuts/PC02-speak-the-cfos-language-1080x1350.mp4`; independent ffprobe: 58.544 s, 1080×1350, H.264, yuv420p, 30 fps, AAC stereo at 48 kHz. Full decode passed. Offline captions now end on the complete phrase “with the CFO.” | Owner editorial/caption review; one ambiguous short source span remains intentionally uncaptioned rather than guessed. |
| AUG10 — Joann video | **Recording/topic gate; not production-ready** | `FINAL-AUGUST-CONTENT-LIST.md` and `august-2026-content-relevance-audit.md` explicitly supersede the old testing concept: topic, footage, and copy remain open. No final Joann media was claimed or found. | Approve topic first, then obtain recording or approved footage before scripting/editing. |
| AUG14R — Moe, Four Decisions Every HCM Integration Needs | **Recording gate** | Script and recording direction exist in `august-2026-content-relevance-audit.md`; current slate says “Record Moe; brief and script ready.” No final Moe media was claimed or found. | Record Moe, then edit motion overlays and QA the final output. |

## Independently verified source dependency

`source/podcast/full-episode.mp4` is present and usable as the source for both pending recuts.

- ffprobe format duration: **1423.361000 s** (23:43.361)
- Format size: **368,503,881 bytes**
- Video: **H.264**, 1920×1080, yuv420p, TV range, 24/1 fps
- Audio: **Opus**, 48 kHz, 2 channels
- SHA-256: `9835e30b9cb9dd5662f527921ba23df16f52b2c0ce3ce8c51415232d52c28a83`

The source-access dependency is resolved and both recut deliverables are now present and independently decoded.

## Beumer file ledger

| Slide | Bytes | SHA-256 |
|---|---:|---|
| `AUG05R-beumer-01.png` | 825,314 | `a20a2ff76d69363452b86fafd0da9a17ad91a6137a68976ee5d1e883582c4405` |
| `AUG05R-beumer-02.png` | 815,516 | `482fb03f680fac88b1bc31c17d2929b740f97279659acd81309868c57fb1d25f` |
| `AUG05R-beumer-03.png` | 812,180 | `98e53ad01d1aed8fa5c0bfbcb574abd176600aaad87f758950060a552a28aec2` |
| `AUG05R-beumer-04.png` | 821,381 | `00e9b261433fafa37bd8f148f06527ed4f85e06b44be5c5908ee1548355b3718` |
| `AUG05R-beumer-05.png` | 815,664 | `81a890ebc64b8567419084a8986ada4039d8d1551d2f83c0b63b118ed526e0fc` |
| `AUG05R-beumer-06.png` | 843,933 | `04c8c843c3a297174720e64cc3ad5c8faa29038d09620465b1251165bc6b1931` |

## Source-of-truth and discrepancy notes

Inspected local sources:

- `clients/align-hcm/CLIENT.md`
- `clients/align-hcm/context/operating-context.md`
- `clients/align-hcm/deliverables/2026-07-23-august-production-execution-status.md`
- `FINAL-AUGUST-CONTENT-LIST.md` (declares itself the production source of truth)
- `august-2026-content-relevance-audit.md`
- `august-2026-creative-and-video-briefs.md`
- the six production prompt files and existing asset QA reports

Two older-brief conflicts were resolved conservatively in this inventory:

1. The older creative brief describes an earlier 35 s reserve AN04, “The Handoff Is Part of the Build.” The final slate and current prompt supersede it with **AN04 Public Service Cannot Pause, 60 s**.
2. The older creative brief contains a Joann testing script. The final slate and relevance audit explicitly say that concept is not approved for August. Joann remains a topic-and-recording gate; this inventory does not treat the old script as production authorization.

## Boundary

Media rendering and local QA were completed only inside the exact Align client workspace. Nothing was scheduled, uploaded, published, or delivered, and no external account was changed.
