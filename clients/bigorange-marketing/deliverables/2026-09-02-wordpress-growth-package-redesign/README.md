# BigOrange WordPress growth package — redesign (2026-09-02)

Complete visual rebuild of the seven review-package files sent to Dillon on 2026-09-02
("BigOrange Complete WordPress Growth Package | Final Review Copy"). Every design decision from the earlier versions was discarded. v2 (same day) rewrote all
copy into the BigOrange voice with Sonnet 5 under locked facts: titles, queries, slugs, meta
descriptions, numbers, dates, and disclaimers are byte-identical to v1; structure is unchanged.

## Files

| File | What it is |
|------|------------|
| `BigOrange-Complete-WordPress-SEO-AEO-GEO-Growth-Plan-2026-09-02.pdf` | Master plan, 11 pages |
| `BLOG-01` … `BLOG-05` PDFs | Five branded article PDFs with implementation brief covers |
| `BigOrange-Thursday-WordPress-Growth-Review-2026-09-03.pptx` | 15-slide Thursday review deck, speaker notes preserved |
| `BigOrange-Brand-Voice-Guide.pdf` | Standalone Brand Voice Guide v1.0 (source: `src/brand-voice-guide.md`) |

## Design system

- Logo: exact BigOrange.Marketing PNG (orange on light, white on dark). Brand orange sampled from the logo: `#FF7C00`.
- Palette: orange `#FF7C00`, ink `#121212`, peel `#FFF3E8`, pith `#F6F1EA`.
- Type: Montserrat (display, matches the wordmark), Source Serif 4 (long-form reading), Inter (tables and data). Deck body uses Arial for portability.
- Motif: the logo's square block plus oversized chapter numerals.

## Rebuild

```
cd src
npm i playwright pdf-lib @pdf-lib/fontkit pptxgenjs sharp react react-dom react-icons
# drop Montserrat[wght].ttf, Montserrat-Italic[wght].ttf, SourceSerif4[opsz,wght].ttf,
# SourceSerif4-Italic[opsz,wght].ttf, Inter[opsz,wght].ttf (Google Fonts, OFL) into assets/
node render.js blog-01.html BLOG-01.pdf "Blog 01 · Private review draft · BigOrange.Marketing"
node render.js plan.html plan.pdf "Complete WordPress SEO + AEO + GEO Growth Plan · Private review draft · BigOrange.Marketing"
node deck.js
```

Status: private review draft. Nothing here is authorized for client release; the Gmail draft to Margee, Paula, Emelia and Janice is untouched.
