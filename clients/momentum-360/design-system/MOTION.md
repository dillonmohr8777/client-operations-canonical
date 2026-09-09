# Automatic editable presentation animation

## Current engine

The September 4 installed `client-deck` implementation uses `Deck.save()` to call `scripts/choreograph.py`. Shapes receive semantic `objectName` tags such as `role:title`, `role:figure`, and `role:foot`. The choreographer writes native PowerPoint timing into the PPTX. That keeps text, shapes, charts/tables, and imagery editable.

The installed default is currently **bold**. This supersedes the earlier same-day COM/subtle implementation described in older notes. The new proof selects **subtle** explicitly so its behavior is stable if a later session changes the default. The original `animate-pptx.ps1` still exists as a fallback for externally created decks without role tags.

## Motion grammar

| Role | Existing motion | Purpose |
| --- | --- | --- |
| Panels | Wipe from the edge | Establish the structural field |
| Motif | Slower fade | Background context without competing with copy |
| Logo | Short fade | Brand arrival with intact artwork |
| Kicker, title, display, subtitle | Fade and small upward movement | Establish reading order |
| Hero / figure | Fade and restrained scale | Draw attention to the principal point |
| Section numeral | Settle from a slightly larger scale | Mark an act change |
| Horizontal/vertical rules | Wipe | Draw the reading structure |
| Step number | Small pop | Clarify ordered progression |
| Footer / static | No animation | Keep page numbers and notes stable |

Structure starts first; content follows in reading order. The installed script caps staggered content at 18 effects per slide; excess content stays static. This is a presentation pacing limit, not a reason to add more text. Grouped nested shapes are outside the current kit's top-level shape reader. The installed script's actual timings and style values remain the runtime source. Do not scatter timing overrides through individual deck scripts.

## Authoring contract

```javascript
import { Deck } from '/path/to/existing/client-deck/lib/deck-kit.mjs';
const deck = new Deck('momentum-digital', {
  title: 'Momentum presentation',
  animationStyle: 'subtle'
});
deck.title({ kicker: 'Momentum Digital', title: 'One clear idea.', sub: 'A useful supporting sentence.' });
await deck.save('Momentum.pptx');
```

Use the layout helpers for ordinary content so roles are retained automatically. If custom shapes are necessary, assign the supported role that reflects their job; arbitrary object names will not acquire the intended choreography. Reuse the same engine with the exact named client's brand profile for future clients.

## Existing decks

Role-tagged decks can be rechoreographed with the installed Python script on a **new output copy**. That script replaces existing transitions/timing, so it must not be applied blindly to a hand-authored deck with valuable animation sequences. The older COM fallback follows different preservation behavior; inspect its options before using it on an arbitrary client file.

Before modifying an external deck, inventory editable objects, grouped shapes, animations, notes, transitions, media, and embedded fonts. Choose one of three paths: preserve intentional timelines; map meaningful roles on a working copy; or use a transition-only copy. Do not promise identical animation quality on a flat image-only deck.

## Static and reduced-animation variants

- `Deck.save()` with `animationStyle: 'none'` skips the choreography step in the current kit. It adds neither entrance effects nor transitions to a newly generated deck.
- Directly running `choreograph.py --style none` instead writes a transition-only file. These two entry points currently differ; choose the entry point deliberately.
- `{ animate: false }` passed to `save()` also skips the choreography step for a newly generated deck.
- PowerPoint does not automatically apply browser `prefers-reduced-motion`. Provide an explicitly static deck/PDF when needed.
- PDF removes motion. It is the reading/printing reference, not proof of animation playback.
- Google Slides, Keynote, browser previewers, and screen-sharing systems may interpret native PowerPoint motion differently. Only the application actually tested can be described as verified.
- Video is an optional distribution format; it sacrifices object editability. It is not needed for universal deck animation.

## Verification contract

Verify that the file opens in real PowerPoint; validate both transition and object timing counts, supported role coverage, static footers, and source notes. Count editable native shapes separately from raster images. Rerun on a copy and compare counts to detect doubled timelines. Export every slide and inspect composition after the final edit. Capture clipping warnings and record theme/font substitutions if observed.

The new proof and its measured receipts live in `output/motion-proof/` and `evidence/motion-proof*.json`. Native timeline checks establish that PowerPoint accepted the animations; static PNG/PDF renders establish the resting layout. Neither alone proves that every third-party viewer plays motion correctly.
