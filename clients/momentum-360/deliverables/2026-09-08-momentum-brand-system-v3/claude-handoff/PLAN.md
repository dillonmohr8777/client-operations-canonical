# v3 → Claude Design native conversion plan

Status: **tooling prepared, nothing seeded or published.** Waiting on Root's READY after the six
mascot images gain the superhero M chest emblem and pass QA.

Target: the existing private artifact
`https://claude.ai/code/artifact/e9ce7032-81b1-4970-9aca-4d39a23eafc0` (contract `0.1.31`,
capabilities `self` + `downloads`, carried forward — never re-declared).

## What gets imported

Six new artboards on a new page group, built from the v3 source:

| Artboard | From | Frame |
|---|---|---|
| `BrandArt.dc.html` | `index.html` + `books-manifest.json` + the full image set | 1440 × ~4200 |
| `Book1.dc.html` … `Book5.dc.html` | the five full book HTML files | 1440 × measured (`print: "flow"`, `is_interactive: true`) |

The existing v2 artboards (`Main`, `OnePager`, `Cover1-5`, `Carousel1-4`, `Ebook1-5`) are **carried
through untouched** by default — the seed re-lists every current file, and `canvas.json` gains pages
without renumbering the old ones. If Dillon wants the rejected v2 `Ebook1-5` artboards retired, that is
a one-line change in `build_canvas.py` (`RETIRE_V2 = True`) and a decision for Root, not for the tool.

## Read-only boundary

`convert_book.py` never writes above `claude-handoff/`. It reads `../*.html`, `../style.css`,
`../app.js`, `../books-manifest.json` and `../assets/*` and emits everything into
`claude-handoff/build/`. Root's v3 HTML/CSS/JS/assets are inputs only.

## The four hard problems, and how the tooling solves them

### 1. Images: 16 MB of source art into a 16 MB document

`assets/` is 16 MB — six mascots at 1.6–1.8 MB, three engravings at 1.2–2.7 MB. Canvas images are
stored as **bare base64 files entries**, which inflates by ~33%, so the raw set alone would be ~21 MB
against a 16 MB rendered cap, and `philly-engraving.png` (2685 KB) exceeds the editor's 2 MB per-entry
limit on its own. Inlining them as `data:` URIs inside the artboards is worse — the same bytes, times
however many artboards reference them.

`pack_assets.py` derives a packaged set into `claude-handoff/build/assets/`:

- **Logos are copied byte-for-byte.** `momentum-logo.png` (67 KB) and `momentum-mark.png` (29 KB) pass
  through untouched — same pixels, same alpha, same proportions. SHA-256 of source and packaged copy
  are compared and printed; a mismatch aborts the build.
- **Mascots** → WebP q80 at 1200 px wide. Displayed at ≤720 px (`.cover-art` is half of a 1440 grid,
  `.book-card img` ~700 px), so 1200 px still covers a 2× raster.
- **Engravings** → WebP q80 at 900 px. Displayed at ~400 px square in `.engraving`.
- Measured on the current assets: **11 files, 490 KB total (~653 KB as base64)** — the mascots land
  at 20–34 KB each, the engravings at 55–112 KB. The script **fails loudly** if any single packaged
  file exceeds 400 KB or the set exceeds 3 MB.

Each artboard references them by bare filename (`<img src="search-mascot.webp">`), which is how the
canvas runtime substitutes files entries. `convert_book.py` rewrites `assets/search-mascot.png` →
`search-mascot.webp` from the map `pack_assets.py` emits, so a renamed or re-exported source cannot
silently produce a broken image — an unmapped `src` aborts the build.

**Re-run `pack_assets.py` after Root's mascot update.** It reads `../assets/` live, so the emblem
revision is picked up with no code change.

### 2. Fonts: inline the display face only

`NunitoSans.ttf` is 558 KB. Inlined into six artboards that is 4.4 MB of base64 for body text, and
font weight of exactly that kind is what stalled the native preview in the previous edition. So:

- **Archivo Black (89 KB) is inlined** as base64 — it is the playbook's voice and it is only used for
  display sizes. ~119 KB per artboard, ~714 KB across six.
- **Nunito Sans is not inlined.** The body stack falls back to `system-ui, "Segoe UI", Roboto,
  sans-serif`. Body metrics shift slightly against the local HTML; the layout is fluid and does not
  depend on the exact face.
- **`style.css`'s own two `@font-face` rules are stripped from the inlined copy** (`site_css()`).
  They point at relative `assets/*.ttf` that cannot resolve inside an artboard, and the Archivo rule
  sits *after* the inlined data-URI face in source order, so leaving it in would override the
  embedded font and drop the display face entirely. The converter fails if it does not find exactly
  the two rules it expects, so a font change in `style.css` surfaces instead of silently breaking.
- No external font URLs — the preview iframe has no network egress.
- `fontTools` is not installed on this machine, so subsetting Archivo Black is not available. If it is
  installed later, subsetting to Latin-1 would cut the inline payload to roughly a quarter.

### 3. The anchor defect must not recur

In the previous edition, bare `#anchor` hrefs resolved against the artifact origin inside the srcdoc
artboard and navigated the preview away. The v3 books carry a lot of them — book 1 measured **97
distinct targets**: `#chapter-1`…`#chapter-13`, `#main`, `#workbench`, `#review-status`, and a
per-chapter citation anchor for every source note (`#chapter-8-source-14`) — plus search-result links
built at runtime. That count grew from 16 while this plan was being written, because Root is still
editing v3; the converter derives the list from the live source on every run rather than hardcoding it.

**Every in-document link becomes a DCLogic handler in the native variant.** `convert_book.py`:

- rewrites each `<a href="#id">` to `<button type="button" onClick="{{ j<id> }}">`,
- emits one handler per id from a `JUMPS` array, and
- **asserts zero `href="#"` remain** in the emitted artboard, failing the build if any survive.

Anchor-shaped styling is preserved by `native-overrides.css` (generated by the converter, appended
after the inlined `style.css`) so `.chapter-links button` and `.search-results button` render exactly
as the anchors did. Root's `style.css` is not edited.

The scroll itself is simply:

```js
function go(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ block: 'start', behavior: 'instant' });
}
```

**No `content-visibility` anywhere.** The v3 source does not use it and the converter does not add it —
that containment is precisely what made the previous edition's cold jumps land on placeholder
geometry. Nothing needs lifting, so the jump is exact on the first try. `style.css` already gives
`html{scroll-padding-top:100px}` and `.chapter{scroll-margin-top:100px}`, which land the heading clear
of the sticky topbar; the overrides force `scroll-behavior:auto` so the landing is deterministic rather
than animated.

Artboards stay light without containment because the weight that caused the original stall was fonts
and repeated gradients, not markup: each book is ~118 KB of HTML (of which ~50 KB is the `book-data`
search index) plus ~14 KB of CSS and ~119 KB of inlined display font — roughly 290 KB, comparable to
the 230 KB artboards that loaded in ~280 ms.

### 4. Native interactions must actually run

Plain `<script>` is inert in native Play. Everything in `app.js` is reimplemented against the DCLogic
contract (`class Component extends DCLogic`, `renderVals()`, `{{ }}` bindings, `onClick`,
`this.state` / `this.setState`). Two deliberate patterns, both proven in the previous edition's
authenticated native test:

**Discrete state through `renderVals()`, as flat scalars and handlers** — no `sc-for` / `sc-if`, to
keep dialect risk low:

**Bound through `renderVals()`, `onClick` only** — the one binding shape already proven to work in
native Play, so the dialect surface stays as small as possible:

| Interaction | Binding |
|---|---|
| Motion pause | `rootCls` on the root div, `moLabel` / `moOn` on the button |
| Mobile contents menu | `navCls`, `menuExpanded`, `toggleMenu` |
| Diagram 4-step selector | `d0on…d3on`, `d0pick…d3pick`, `stepDetail` |
| Every in-document jump | one `j<id>` handler per target (97 in book 1) |
| Checklist count line | `checkStatus` (written by the imperative half, read through state) |

**Everything else is installed once and writes straight to the DOM** — chapter search and its result
list, the scroll-spy that highlights the active chapter, the reading progress bar, and the checklist
count. Two reasons, not one: these fire per scroll frame or from browser-owned control state, so
`setState` would re-render the component continuously across a 40 000 px document; and they would
otherwise need `onInput` / `checked` bindings whose behaviour in native Play is unverified. Routing
them imperatively removes that uncertainty completely. Search results are built as `<button>`
elements calling `go()`, never anchors.

**Scripts beyond `app.js` are carried verbatim, never reimplemented.** `external_scripts()` collects
every `<script src>` each page loads. `app.js` is the single exception — its behaviour is bound to
component state (motion, menu, diagram, jumps), so it is reimplemented against DCLogic. Everything
else, `exercises.js` and any future sibling, is **inlined exactly as written** and executed once by
`runExtras()` at the end of `wire()`, on a mounted DOM, so its `querySelectorAll` and
`addEventListener` calls bind to real nodes exactly as they do on the local site. Restating those
handlers would create a second implementation to keep in sync; dropping them would silently remove
the exercises. Three guards: a referenced script that is missing **fails the build**; a
`<script src>` surviving in the emitted markup **fails the build**; and if fewer scripts run than
were inlined, the artboard logs which ones did not. Each block is individually try/caught so one
failure cannot take the rest of the initialisation down with it. `wire()` now gates on `.topbar`
rather than on reader controls, so the brand page — which has no search or progress bar — still
reaches `runExtras()`.

**Browser-owned state stays browser-owned.** The four checklist boxes remain real
`<input type="checkbox">` and the review disclosure remains a real `<details>` — the browser paints
their state with no binding at all, and the component only composes the count line.
`localStorage` persistence is kept but wrapped in try/catch, because storage can throw outright in a
sandboxed iframe; on failure the checklist still works for the session and the status line says so,
which is the behaviour `app.js` already specifies.

The library filter on `BrandArt.dc.html` is imperative in the same way. Its "Open the field guide"
buttons cannot navigate — separate artboards are not linkable — so the converter renders them as
`Artboard: Book 1` labels rather than dead links.

## Files in this directory

| File | Role |
|---|---|
| `PLAN.md` | this document |
| `pack_assets.py` | derives the packaged image set; verifies logo bytes; writes `build/assets/` + `asset-map.json` |
| `convert_book.py` | one v3 book HTML → one native `Book<N>.dc.html`; also builds `BrandArt.dc.html` |
| `build_canvas.py` | orchestrator: pack → convert all six → merge `canvas.json` → print the exact seed command |
| `verify.mjs` | Playwright harness for READY time: completeness, zero bare anchors, jump accuracy, overflow, measured height |
| `build/` | all generated output (git-ignorable, safe to delete and rebuild) |

`build/` holds the **last full build, taken before the exercises work landed** — 7 v3 artboards plus
11 archived ones and a merged `canvas.json`. It is stale by design: source moved again straight
afterwards, and nothing has been verified or staged. Rebuild from scratch at READY.

## Artboards

Seven from v3, replacing the simplified sampler the first draft of this plan described:

| Artboard | Source | Mode |
|---|---|---|
| `BrandArt.dc.html` | `brand.html` — the full interactive brand system | `brand` |
| `Library.dc.html` | `index.html` — the five-guide library | `library` |
| `Book1…5.dc.html` | the five complete manuscripts | `book` |

`BrandArt` is the real brand page, not a text-and-art summary: identity demo, type specimens,
swatches, guidelines and the **15-asset gallery**. The site injects that gallery through
`innerHTML`; an artboard cannot, so all 15 figures ship in the markup with `data-set`, and
`data-category` on `#brand-gallery` shows the active category — a class toggle rather than a rebuild,
which also means every one of the 15 images is verifiable. `pack_assets.py` asserts all 15 are
present, and `gallery_markup()` reads the category lists out of `app.js` rather than restating them,
so the artboard cannot drift from the site.

## Canvas order

`launch` opens on `page-v3-brand`. v3 pages lead: Brand system (BrandArt + Library side by side),
then one page per book. The rejected v2 `Ebook1-5` artboards are **dropped from the visible canvas**
and deleted from the bundle directory; their local originals stay untouched in
`../2026-09-08-claude-design-ebooks/canvas-v2/`. Unrelated earlier work — `Main`, `OnePager`,
`Cover1-5`, `Carousel1-4` — is kept but pushed behind the v3 pages with an `Archive · ` page-name
prefix. Last measured: 18 artboards (7 v3, 11 archived) across 9 pages.

## Identity language

The rendered Momo chest emblem is **artwork, not the logo**. Only `momentum-logo.png` and
`momentum-mark.png` are byte-exact, verified by SHA-256 on every pack. The identity demo moves the
logo with `transform` (Root's correction) so it is translated and scaled, never redrawn or stretched.
Nothing in the artboards claims the rendered emblem is a byte-exact logo.

## Sequence at READY

1. `python claude-handoff/build_canvas.py` — packs assets, converts six artboards, merges `canvas.json`.
2. `node claude-handoff/verify.mjs` — per-artboard checks; writes measured heights into `canvas.json`.
3. Seed with the design helper (the exact command is printed by step 1), then `--check`.
4. Publish to the artifact URL above with `contract: "0.1.31"` and **no** `capabilities` argument.
5. Root runs the authenticated native interaction test and owns delivery.

Steps 3–5 do not run before Root sends READY.

## Known limitations to carry into the receipt

- Body text renders in the system sans fallback, not Nunito Sans (§2).
- Mascot and engraving art is recompressed to WebP for packaging; the two logos are byte-exact (§1).
- Cross-artboard navigation does not exist, so the overview's book buttons are labels (§4).
- `PRODUCT.md` cites `assets/manifest.json` for hashes and font provenance; that file is not present in
  `assets/`. Not blocking — `pack_assets.py` writes its own `asset-map.json` with source SHA-256 for
  every packaged file — but worth reconciling in Root's receipt.
