# Momentum Design System
**Momentum Digital — Blue & White / AI Field Notes (v3)**

A reusable brand and editorial system for Momentum marketing, interactive ebooks, presentations and web surfaces. Everything here is ported from Momentum's own working code — not reinterpreted.

## Sources given to me
- `uploads/Momentum-Design-System-Source/` — the live production package: `style.css`, `exercises.css`, `index.html` (library), `brand.html` (brand system page), `app.js`, `exercises.js`, `books-manifest.json`, plus `DESIGN.md`, `PRODUCT.md` and `DESIGN-SYNC-NOTES.md`. **This is the ground truth for every value in this system.**
- `uploads/Momentum-Design-System-Source/assets/` — exact logo masters (`momentum-logo.png` 800×172, `momentum-mark.png`) and the two font binaries (Archivo Black, Nunito Sans). All four copied in.
- Visual authority named by the user: **https://momentum-ai-launch-batch.netlify.app/brand** (Momentum brand system v3, verified 8 September 2026). I could not fetch that host from this environment, so the attached package — which is that site's source — was used instead. Its illustration PNGs are still referenced from that host at runtime (see *Artwork* below).
- `assets/reference/brand-page-2026-09-08.png` — screenshot captured from the live `/brand` page in this session: navy display headings on white, gold terminal period, gold "Explore the collection" button, outlined "Pause motion" pill, Momo on a midnight plate at 14px radius. Confirms the shipped treatment this system reproduces.
- Four motion clips selected by Dillon in this session: `hf_20260906_190849…mp4`, `hf_20260906_190850…mp4` (16:9, 1928×1076, 8.04s) and the 720p vertical viewing copies `hf_20260831_184909…-reference-720p.mp4`, `hf_20260831_185018…-reference-720p.mp4` (9:16, 406×720, 15.04s). Poster stills extracted into `assets/footage/`; the originals stay the reference identity.

## Product context
Momentum Digital (needmomentum.com) is a Philadelphia digital agency; its AI division publishes **The AI Field Notes** — five long-form, illustrated, interactive ebooks for local service businesses: *Show Up When They Ask AI*, *From Missed Call to Booked Job*, *Built, Not Prompted*, *The Small Business AI Operating System*, *Names, Not Numbers*. Each is a complete manuscript (45–54k characters, 13–14 sections) in a private review edition, read in-browser with search, progress, source disclosures and local-only workbook exercises.

Two surfaces exist, and both are recreated here as UI kits: the **library** (`index.html`) and the **brand system page** (`brand.html`), plus the per-book **reader**.

Scope rules taken from the sources, and enforced here:
- Momentum Digital identity only. **Momentum 360 is a separate subbrand**; do not blend them, and do not apply this system to other clients' work.
- The logo masters are exact and byte-for-byte. Never redraw, recolour, stretch or typeset the wordmark.
- **Momo** — the blue ceramic guide with the Momentum *m* on his chest like a superhero emblem — is supporting artwork. His chest emblem is **never** promoted to a master logo, and no replacement mascot is ever drawn.
- Illustrations are artwork, never evidence of a client result. Local exercises never call, publish or verify anything.
- Manuscripts are a private review edition; this system does not regenerate or summarise them.

---

## CONTENT FUNDAMENTALS

**Voice.** Plain, declarative, unhurried. Short sentences that state a fact and stop. The reader is a busy owner or operator, addressed as a peer — never sold to.

**Second person, no first person singular.** Copy says *you* ("Record a question, the engine you checked and what you observed"), and the brand refers to itself in the third person ("Momentum's blue and gold"). No "we're excited", no "our team".

**Headline construction: two beats and a full stop.** Nearly every heading is a pair of short clauses split across a line break, each ending in a period:
- "Big ideas. / Useful field notes."
- "One identity. / A whole world."
- "Identity stays exact. / Expression gets room."
- "Bold at a glance. / Calm for the read."
- "A cast with purpose. / A library with range."
- "Explore with curiosity. / Act with clarity."
The terminal period is part of the identity, and on hero headlines it is set in gold. Write new headlines to that shape.

**Named rules.** The design language codifies itself as short titled rules — *The Gold Leads Rule*, *The Still Reading Rule*, *The Material Separation Rule*. Guideline articles use imperative titles with a period: "Give Momo a role.", "Let imagery earn its place.", "Keep the source close."

**Sentence case everywhere except meta.** Headings and buttons are sentence case ("Open the field guide", "Download exact logo", "Preview header transition"). Uppercase appears only in the 12px letterspaced meta line ("FIELD NOTES 01 · AI SEARCH") and in the video end card ("NEED MOMENTUM?").

**Honesty copy is a first-class pattern.** Every interactive tool says what it does *not* do, in the same breath as what it does: "This is a manual evidence log, not a live AI-search scan." / "these selections document your review; this page does not call, text or connect to a phone system." / "Checking a box never publishes an asset." / "This is a comparison of user-entered counts, not a verified CRM or attribution match." Status is always textual, never a badge or a colour alone: "2 of 4 complete. Saved only in this browser." / "Browser storage is unavailable. Your checks will last for this page visit only."

**Provenance is content.** Editions, dates and source notes live in the visible copy: "Private review edition · September 2026", "Original ceramic scene · Momentum collection", "Download original PNG".

**No emoji. Ever.** Not in UI, not in copy, not in headings. No exclamation marks. No em-dash-heavy hype, no "unlock/supercharge/game-changing", no invented statistics.

**Numbers spelled out in prose, digits in data.** "Five complete field guides" in copy; "13 sections", "0.8 seconds", "#EFB928" in specification.

---

## VISUAL FOUNDATIONS

**Palette.** Five brand colours and four neutrals, all exact: midnight `#03172E` (identity and image fields), Momentum navy `#072D53` (featured panels, quotations, selected controls), action blue `#1766AB` (links, carets, line art), gold `#EFB928` (actions, progress, focus, selected-state detail), reading field `#F0F5F9`, paper `#FFF`, reading ink `#102D49`, secondary ink `#52677C`, divider `#D5E0E9`. Reversed copy on dark fields is `#D5E4F1`, not pure white. Hover-only gold is `#FFCF54`.

Direction from `DESIGN-SYNC-NOTES.md`, confirmed against the live `/brand` screenshot: **display headings are navy or white; gold stays a material accent** — it keeps its shipped roles on primary buttons, the progress meter, focus rings, selected-state rules and the terminal period of a hero headline, and never becomes a headline colour. Body copy on white is always ink, never gold (*The Gold Leads Rule*). At most two background colours per surface: a dark field and the pale reading field, over white.

**Type.** Two faces only. **Archivo Black** (registered locally as `Archivo`, weight 900) for display — 1.07 leading, −0.025em tracking, `text-wrap: balance`. **Nunito Sans** (registered as `Nunito`, variable 200–900) for everything else — body 18px/1.7, chapter reading 18px/1.85 (17px/1.8 on mobile), labels 14px/900, notes 13px, meta 12px uppercase at 0.08em. The ramp is *role-based and fluid*, not a modular scale: hero `clamp(2.7rem,5.8vw,5.6rem)`, cover title `clamp(2.7rem,4.5vw,4.7rem)`, chapter headline `clamp(2.1rem,3vw,3rem)`. Measures are capped in characters: body 72ch, headline 24ch, lists 70ch, cover deck 38ch.

**Spacing & layout.** Scale: 8 / 12 / 20 / 24 / 28 / 32 / 60. Shell is `min(1440px, 100% − 96px)`; editorial content containers cap at 1344px; gutters drop to 48px at 1000px and 36px at 720px. Reading is a 270px sticky contents column + flexible reader capped at 880px with a 60px gap (220px / 30px at 1000px; a toggled in-flow panel at 720px). Sticky header 78px desktop, 66px mobile. Library grid is two columns (44px/32px gaps) with the first card spanning both as a featured navy composition; brand galleries are three columns. Tables scroll locally instead of widening the viewport.

**Backgrounds.** Solid colour fields, never gradients — no gradient meshes, no glass, no blur, no noise or paper texture, no repeating pattern. The dark field *is* the background system. The only "imagery as background" is the midnight plate behind a contained illustration.

**Imagery.** Two families, both raster PNG. (1) Blue **ceramic** illustration — Momo scenes and service icons: cool blue clay with warm gold detail, soft studio highlights, transparent-to-midnight grounds, 1536×1024 (scenes) and 1254×1254 (icons). (2) Blue **engraved studies** — bird, botanical, Philadelphia — fine-line antique-plate character, quieter, used at chapter intervals. Frames repeat 3:2, square for service icons and engraving panels. Momo scenes use `object-fit: contain` on midnight so the full ceramic form and the chest emblem survive. Photography (video stills) is warm golden-hour or cool dusk Philadelphia with shallow depth of field and heavy bokeh.

**Corner radii.** 8px controls, 14px surfaces (`--radius`), 5px nav links and search results, 3px inline code, 24px on the outlined header pill. Nothing is fully rounded except that pill; nothing is square except full-bleed fields and table cells.

**Cards.** Two shapes, and no shadow in either. A standard library card is *not* a container at all — 3:2 image, copy, and a single 1px `#D5E0E9` bottom rule; the featured card is a navy split panel with 14px radius, 44px copy inset and no border. Reader tools and gallery figures are pale 14px-radius surfaces. **There is no ambient drop-shadow system anywhere in the interface** (*The Material Separation Rule*: ceramic depth belongs to the artwork; interface surfaces stay flat). The single box-shadow in the whole system is `inset 0 -3px 0 var(--gold)` under a selected tab or step — a state marker, not elevation.

**Borders.** 1px `#D5E0E9` hairlines carry all structure: card bottoms, chapter separators, section tops, table cells, form fields, footer. On dark fields the hairline is `rgb(255 255 255 / 14%)`.

**Transparency & blur.** Essentially unused. Only two alpha values exist — the dark-field hairline and the 50% disabled state. No backdrop-filter, no translucent overlays, no protection gradients: text on imagery is avoided by putting text *beside* imagery on a solid field instead.

**Animation.** Three durations, one curve. `cubic-bezier(.85,0,.15,1)` — a hard-in/hard-out curve — at **0.8s** for identity moments (logo reveal, header transition, title clip-path arrival, card image scale); **0.2s** for hover state (colour + `translateY(-2px)`); **3.6s** for a finite, replayable service study with 0.15s stagger between assembly layers. Motion is always finite and re-triggerable, never looping ambience. Reading text never animates (*The Still Reading Rule*): the cover title may arrive once, then everything holds still. A global **Pause motion** toggle and `prefers-reduced-motion` both kill animation *and* transition, and reduced motion also disables smooth scrolling.

**Motion evidence from Dillon's four selected clips.** Vertical 9:16 social films (15.04s): cold open on a near-black navy void with a single lit stone shard; the shard **breaks open into a portal** — shattered glass edges and blue sparkle particles — revealing live footage of the team with real local business owners (sidewalk handshake, corner-store counter); one behind-the-scenes beat shows the actual 3D tracking overlay rather than pretending the composite is magic; close on a **navy end card**: circular blue *m* mark centred above "NEED MOMENTUM?" in white letterspaced caps, founders on a navy set. The 16:9 clips (8.04s) are locked-off portraits — no camera move — with Philadelphia City Hall centred on axis behind the subject, golden hour in one and dusk bokeh in the other. Principles to carry forward: start dark and reveal; break through a hard edge rather than cross-fade; blue sparks are the only particle; end on the mark over letterspaced caps; keep the camera still and let the city sit behind the person. That break-open reveal is the film-scale sibling of the web system's 0.8s clip-path title arrival — same hard-in/hard-out timing.

**Hover & press.** Primary button: fill lightens to `#FFCF54` and lifts 2px over 0.2s (the source applies that same hover to secondary buttons). Card image: `scale(1.025)` over 0.8s — and the copy beside it does not move. Nav links: underline on hover. Contents links: pale fill + navy + weight 900 when active. There is **no distinct press state and no shrink**; the system relies on hover and focus.

**Focus.** `3px solid #EFB928` with a 5px offset on buttons, links, inputs and summaries. Disabled: 50% opacity and `not-allowed`. Text selection is gold on midnight. Custom scrollbar colour: blue on pale.

**Print.** A real output, not an afterthought: navigation, tools and buttons hide, chapters break to new pages, headings drop to 28pt and body to 11pt, artwork is capped at 160mm and contained, and colour printing is forced exact.

---

## ICONOGRAPHY

There is **no icon font, no sprite sheet and no icon library** — no Lucide, no Heroicons, nothing from a CDN. Icons come in two unrelated forms, and mixing in a third would break the system:

1. **Two inline UI glyphs, hand-authored in the source and reproduced verbatim in the components.** A magnifier (`<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/>`) in every search field, and an arrow (`<path d="M4 12h16m-6-6 6 6-6 6"/>`) inside primary buttons. Both inherit `currentColor` under the global SVG defaults: `fill:none; stroke:currentColor; stroke-width:1.7; stroke-linecap:round; stroke-linejoin:round`. 22px in the library search, 16px in the sidebar, 20px in buttons.
2. **Six ceramic PNG "service icons"** — search, response, build, operations, audience, proof — 1254×1254 raster illustrations on midnight, used as gallery/navigation imagery, not as UI glyphs. They are artwork and are never recoloured or inlined.
3. **Six semantic line-art SVG studies** (search, response, build, operations, audience, proof) exist in `exercises.js` as the animated 190×70 motion studies — 2px blue stroke, gold on the focus/check accents. These are diagram illustrations tied to the 3.6s replay, not an icon set to draw from.

Emoji are never used. Unicode is used as punctuation only — the middle dot `·` as a separator in meta and footers. If a genuinely new glyph is needed, author it in the same 24-viewBox, 1.7-stroke, round-cap style rather than importing a set.

**Assets in this project:** `assets/momentum-logo.png`, `assets/momentum-mark.png` (exact masters), `assets/fonts/*.ttf`, `assets/footage/*.png` (six stills from the four selected clips).

### Artwork
All 15 illustration masters are local in `assets/artwork/`: 6 Momo scenes (`hero-`, `search-`, `phone-`, `build-`, `operations-`, `audience-mascot.png`), 6 ceramic service icons (`icon-search`, `icon-phone`, `icon-build`, `icon-operations`, `icon-audience`, `icon-proof`) and 3 engraved studies (`bird-`, `botanical-`, `philly-engraving.png`). Supplied by Dillon as exact masters; the review host remains only a fallback of record. Inventory: `assets/artwork.json`.

---

## Index

| Path | What it is |
| --- | --- |
| `styles.css` | Consumer entry point — `@import` list only |
| `tokens/` | `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `radius.css`, `motion.css`, `semantic.css`, `base.css` |
| `assets/` | Exact logo + mark, `artwork/` (15 masters), font binaries, footage stills, `artwork.json` |
| `guidelines/` | 18 specimen cards (Colors, Type, Spacing, Motion, Brand) |
| `components/` | React primitives, grouped by concern — see below |
| `ui_kits/field-notes/` | Library + reader recreation (interactive) |
| `ui_kits/brand-system/` | Brand system page recreation (interactive) |
| `templates/field-guide-chapter/` | Starting template: one chapter page with tools and sources |
| `SKILL.md` | Agent-Skills wrapper for use outside this project |

### Components
Core — **Button**, **TextButton**, **Notice**, **Swatch**
Forms — **SearchField**, **ExerciseField**, **Checklist**
Navigation — **TopBar**, **ChapterNav**, **SegmentedTabs**, **SiteFooter**
Editorial — **BookCard**, **BookCover**, **PullQuote**, **ChapterArt**, **EngravingPanel**, **CitationRef**, **SourceDisclosure**
Reading — **ReaderTools**, **DiagramSteps**, **ExercisePanel**, **ReadingProgress**

Each component directory holds `<Name>.jsx`, `<Name>.d.ts`, `<Name>.prompt.md` and one card HTML.

### Intentional additions
The source is vanilla HTML/CSS/JS with no component library, so the inventory above is a 1:1 factoring of the patterns `style.css` and `exercises.css` actually define — every component maps to an existing class family. Two conveniences were added:
- **Swatch** — the brand page's inline `.brand-swatches > div` pattern, extracted so palette specimens are reusable.
- **ReadingProgress** — the sidebar's `progress` + label pair, extracted from `ChapterNav` so it can stand alone.

Nothing else was invented: no Toast, Avatar, Modal, Dialog, Tooltip or Accordion, because the source defines none.

## Not done / open
- The named visual authority `/brand` on the review host was unreachable from this environment; the attached package (its source) plus the session screenshot were used.
- Two of the four clips arrived only as 720p viewing copies; the >20MB originals remain the reference identity.
- Manuscript bodies are deliberately not reproduced. Demo chapters exist in this system only; the five complete manuscripts and their real exercises live in the separate native ebook project `735d088e-aa09-41e7-be15-9afdd92a2948`, which owns that content.
