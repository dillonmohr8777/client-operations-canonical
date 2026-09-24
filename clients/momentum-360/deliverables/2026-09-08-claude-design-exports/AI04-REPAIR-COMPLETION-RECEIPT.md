# AI04 Break the Frame repair completion receipt

Verified 2026-09-09T01:29:27.1625050Z. **COMPLETE FOR LOCAL REVIEW.** The existing Claude Design repair completed without another prompt. Its downloaded source was preserved byte for byte, then independently tested. That test exposed two remaining portrait defects, so a narrow local AI04-only correction was applied without using more Claude generation.

## What changed

- The approved `MAKE IT WHAT IS` typography remains exact.
- The portrait returned `WHAT IS` word was centered and reduced from scale 0.44 to 0.40. Landscape values are unchanged.
- The already-authored portrait end-card line break is now used: `Give your` / `impossible` / `some Momentum.`
- AI04 imports [film-kit-ai04.js](<C:/Users/dillo/Documents/Codex/projects/client-operations/clients/momentum-360/deliverables/2026-09-08-claude-design-exports/ai04-repair-completion/source/film-kit-ai04.js>). The preserved shared runtime remains unchanged, so the other films are not affected.

The exact Claude-completed download is preserved at [AI 04 - Break the Frame.claude-completed.dc.html](<C:/Users/dillo/Documents/Codex/projects/client-operations/clients/momentum-360/deliverables/2026-09-08-claude-design-exports/ai04-repair-completion/upstream/AI 04 - Break the Frame.claude-completed.dc.html>) with SHA-256 `7de44b9707b6c0c357beb7816deb188a85bb7fb1aef58110f008ac5327bd314f`. The accepted local source is [AI 04 - Break the Frame.dc.html](<C:/Users/dillo/Documents/Codex/projects/client-operations/clients/momentum-360/deliverables/2026-09-08-claude-design-exports/ai04-repair-completion/source/AI 04 - Break the Frame.dc.html>) with SHA-256 `a10de10fb8849136014539006aa9fc867ab4bed5b8199eee1aa84845504e0926`. Full provenance is recorded in [source-integrity.json](<C:/Users/dillo/Documents/Codex/projects/client-operations/clients/momentum-360/deliverables/2026-09-08-claude-design-exports/ai04-repair-completion/source-integrity.json>).

## Verification

- Actual 1920x1080 and 1080x1920 PNG captures were inspected at 1.4, 5.5, 9.4, 13.0, and 17.97 seconds over Momentum navy.
- Both aspects passed dimension, runtime-error, alpha, and repeated frame 300 to 120 to 300 determinism checks. Every sampled transparent pixel had zero dirty RGB.
- At 13 seconds, the returned word is inside frame in landscape (`x0 -0.918`, `x1 0.879`) and portrait (`x0 -0.831`, `x1 0.895`).
- At 17.97 seconds, the portrait end-card plane is inside frame (`x0 -0.795`, `x1 0.788`), and the extracted-frame review confirms all three headline lines are fully readable.
- Full rendering produced exactly 540 deterministic RGBA PNG frames per aspect. Both accepted MP4s fully decoded with no errors.

Evidence: [qa-receipt.json](<C:/Users/dillo/Documents/Codex/projects/client-operations/clients/momentum-360/deliverables/2026-09-08-claude-design-exports/ai04-repair-completion/qa-receipt.json>), [render-receipt.json](<C:/Users/dillo/Documents/Codex/projects/client-operations/clients/momentum-360/deliverables/2026-09-08-claude-design-exports/ai04-repair-completion/render-receipt.json>), [mp4-verification.json](<C:/Users/dillo/Documents/Codex/projects/client-operations/clients/momentum-360/deliverables/2026-09-08-claude-design-exports/ai04-repair-completion/mp4-verification.json>), [landscape MP4 contact sheet](<C:/Users/dillo/Documents/Codex/projects/client-operations/clients/momentum-360/deliverables/2026-09-08-claude-design-exports/ai04-repair-completion/opaque-review-mp4/ai04-16x9-mp4-contact.jpg>), and [portrait MP4 contact sheet](<C:/Users/dillo/Documents/Codex/projects/client-operations/clients/momentum-360/deliverables/2026-09-08-claude-design-exports/ai04-repair-completion/opaque-review-mp4/ai04-9x16-mp4-contact.jpg>).

## Accepted replacements

| Review file | Dimensions | Duration / frames / fps | Audio | SHA-256 |
|---|---:|---:|---|---|
| [ai04-16x9-opaque-navy-review.mp4](<C:/Users/dillo/Documents/Codex/projects/client-operations/clients/momentum-360/deliverables/2026-09-08-claude-design-exports/ai04-repair-completion/opaque-review-mp4/ai04-16x9-opaque-navy-review.mp4>) | 1920x1080 | 18 s / 540 / 30 | Silent | `aa6a5fe731dec288e1d324a8ff3f3118dbe857b03e896ed619b980e04ad9a08a` |
| [ai04-9x16-opaque-navy-review.mp4](<C:/Users/dillo/Documents/Codex/projects/client-operations/clients/momentum-360/deliverables/2026-09-08-claude-design-exports/ai04-repair-completion/opaque-review-mp4/ai04-9x16-opaque-navy-review.mp4>) | 1080x1920 | 18 s / 540 / 30 | Silent | `26e1a6d16b1a97118351f33010860d8d2e506f45aa83e92d4567817cafced6d3` |

These two files supersede the earlier AI04 review pair for current review. Historical files remain preserved. No email, Slack message, publication, deployment, purchase, subscription, new Claude project, new Claude chat, or Chain Reaction derivative was created.

Package: [AI04-BREAK-THE-FRAME-REPAIRED-REVIEWS.zip](<C:/Users/dillo/Documents/Codex/projects/client-operations/clients/momentum-360/deliverables/2026-09-08-claude-design-exports/AI04-BREAK-THE-FRAME-REPAIRED-REVIEWS.zip>) with 13 entries, 2 MP4s, CRC PASS, 11541632 bytes, and SHA-256 `0b472d557eb9f0413c416ac8b1c8fd186384886059d4f8393180bca9506844dc`.
