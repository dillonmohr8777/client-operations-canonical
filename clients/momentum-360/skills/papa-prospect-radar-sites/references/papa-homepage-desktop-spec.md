# PAPA Advertising homepage — desktop spec (live capture)

Source: `https://papaadvertising.com/` — captured live in the Claude Code in-app
browser pane at a true **1440×900** viewport on 2026-09-02.
Body content width resolves to **1425px** (15px scrollbar). Document height **4915px**.

All numbers below are computed styles / `getBoundingClientRect()` from the live
page, not inferred from a phone capture. `y` values are absolute document offsets.

The site sits behind a SiteGround bot challenge ("Robot Challenge Screen"). It
clears itself after ~16s of waiting — no CAPTCHA interaction. Budget that wait
before any re-capture.

---

## Design tokens

### Fonts (Adobe Typekit — `typekit.css` in `.tmp/papa-source/assets/`)

| Role | Family | Notes |
|---|---|---|
| Display headings | `bebas-neue-pro` | 700, uppercase, condensed |
| Script / accent | `verveine` | 400, handwritten, used for "Let's Build" |
| Body / UI | `montserrat` | 400 body, 700 buttons + statement |
| Secondary | `pt-sans` | present in stylesheet, minor use |
| Icons | Font Awesome 6 Brands | social icons |

### Color

| Token | Value | Use |
|---|---|---|
| Brand blue | `#006BAB` / `rgb(0,107,171)` | section headings, footer base |
| Light blue | `#159ED3` / `rgb(21,158,211)` | footer gradient top, hero field |
| Orange | `#DF7B11` / `rgb(223,123,17)` | all pill buttons |
| Orange alt | `#EF8B22` @ .9 | overlay accent |
| Charcoal | `#40494E` / `rgb(64,73,78)` | fixed header bg, body copy |
| Ink | `#2C2927` / `rgb(44,41,39)` | accordion button text |
| Grey | `#666` | inherited default (rarely visible) |
| White | `#FFF` | footer + hero text |

### Layout

- Container `max-width: 1310px`, `padding: 0 15px`, centered → gutter `x: 58`, content `x: 73`.
- Row: `display:flex`, `margin: 0 -15px`.
- Page wrapper `padding-top: 100px` to clear the fixed header.

### Buttons (`a.btn.btn-warning`)

```
background: #DF7B11; color: #FFF;
font: 700 20px montserrat; text-transform: uppercase;
height: 60px; padding: 0 40px; border-radius: 50px;
display: inline-flex;
transition: color .15s, background-color .15s, border-color .15s, box-shadow .15s;
box-shadow: none;
```
Observed widths: 300px (LEARN MORE, VIEW MORE, services CTA), 270px (START TODAY).

---

## Components (top to bottom)

### 1. Header — `header.header`
`position: fixed`, `y: 0`, `h: 100`, full width, `background: #40494E`.

- Left `div.logo` at `x: 73, y: 29, 235×42` — two lines: the *verveine* script
  tagline "We solve problems." above the PAPA wordmark link.
- Right: "MENU" label + hamburger, `x ≈ 1290`.
- Nav (overlay, opened by MENU): **Services, Portfolio, About, Contact** — 4 items only.

### 2. Hero — `section.homevideo_box#site-content`
`y: 764, h: 602`, `margin: -136px 0 135px` (pulls up under the header band).

- Full-bleed blue field with the animated PAPA wordmark (Lottie: `logo-hero.json`).
- An orange "dot" sits over the first A and the last A — part of the Lottie, not CSS.
- Inline SVG child at `x: 382, y: 648, 220×143` (the hanging/climbing figure line art).
- Video/still card centered below, container-width.

### 3. Statement — `section.aboutinfo_box`
`y: 1501, h: 633`, `padding-bottom: 215px`.

- `p` at `x: 118, y: 1676, 1190×149` — the manifesto.
  `montserrat 700, 36px / 49.68px, uppercase, color #006BAB`, `margin-bottom: 34px`.
  Copy: "WE LISTEN. WE ASK A LOT OF QUESTIONS. WE SHARE IDEAS. AND THEN, WE CREATE
  STRATEGIC MARKETING PROGRAMS WITH INNOVATIVE SOLUTIONS THAT DELIVER REAL RESULTS."
- CTA **LEARN MORE**, centered, `x: 563, y: 1859, 300×60`.
- Three decorative SVG doodles flanking the block:
  - `div.design_left` `x: 8, y: 1573, 500×369` (svg 205 wide)
  - `div.design_middle` `x: 588, y: 1501, 249×150` (svg 149 wide)
  - `div.design_right` `x: 888, y: 1576, 500×122` (svg 205 wide)

### 4. Recent work — `section.recent_work_wrapper`
`y: 2134, h: 1144`, `padding-bottom: 162px`.

- `h2` "recent work" — `bebas-neue-pro 700, 100px / 100px, uppercase, #006BAB`,
  `x: 73, y: 2134, 1280×142`, `padding-bottom: 42px`.
  **`innerText` is empty → the heading is letter-split for animation.** Reproduce
  with a per-character split, not a plain `<h2>`.
- 3×2 grid of 6 project images, each **396×296**:
  - row 1 `y: 2286` at `x: 83 / 514 / 946`
  - row 2 `y: 2669` at same x
  - horizontal gap 431 − 396 = **35px**; vertical gap 2669 − 2582 = **87px**
- Projects: NWIRC, Wavepoint, French Creek Nursery, The Electric Materials Company,
  MFG Tray, Erie Cancer Wellness. Each has a visible title label above the image.
- CTA **VIEW MORE** centered, `x: 563, y: 3056, 300×60`.
- `div.recent_man` decorative SVG at `x: 58, y: 2051, 1235×230` (svg 438 wide at x 854).

### 5. Client logo wall — `section.client_wrapper`
`y: 3278, h: 283`. **80 logo `img` elements.**

- Each logo **210×158** (a few 200×150), all at `y: 3331`.
- Laid out on one long flex row translated far off-screen left (measured x values
  run from −12028 upward, step **269px**) → this is a **JS-driven marquee**, not a
  CSS `animation` (computed `animation: none`, `transform: none` on `.col-md-12`;
  the motion is applied to an inner track by `custom.js`).
- Sample logos: H Jack's Plumbing & Heating, Scott Enterprises, Rick Griffith
  Properties, Great Lakes Institute of Technology, The YMCA, Chautauqua Institution.

### 6. Services accordion — `section.our_services_wrapper`
`y: 3561, h: 648`, `padding: 175px 0 135px`. Two-column.

**Left column** (`x: 73`, 540 wide):
- `h2` markup is literally:
  `Our <span class="strike_out">SERVICES<strong class="strike_replace">Niche</strong></span>`
  → "SERVICES" is **struck through** and replaced with handwritten "Niche".
  `bebas-neue-pro 700, 100px / 100px, uppercase, #006BAB`, `y: 3736, 540×130`,
  `padding-bottom: 30px`. Also letter-split (empty `innerText`).
- `p` `montserrat 400, 18px / 25.92px, ls .55px, #40494E`, `y: 3866, 540×104`,
  `margin-bottom: 44px`.
- CTA `y: 4013, 300×60`.

**Right column** — Bootstrap accordion, `x: 708`, **645 wide**, all collapsed by default:
- `button.accordion-button` — `h: 80`, `padding: 15px`, `display: flex`,
  `montserrat 700, 28px, uppercase, color #2C2927`, transparent bg.
- Items at `y: 3738 / 3820 / 3902 / 3984` → **82px pitch** (80 + 2px rule).
- **BRANDING** — "We are passionate about building, rebuilding, and managing BA brands…"
- **MARKETING** — "We do not reuse cookie-cutter solutions, run B- and C-level teams…"
- **WEBSITES** — "If you like stats, you'll love playing in the online advertising arena…"
- **TRAFFIC** — "Truth be told, we nerds love a well-laid-out plan. Strategy is everything…"
- Panel body `p`: `montserrat 400, 18px / 23.94px, ls .55px, #40494E, margin-bottom: 22px`.

### 7. Footer — `footer.footer.backbgbox`
`y: 4208, h: 707`, `padding-bottom: 24px`.

```css
background-image: linear-gradient(#159ED3 0%, #006AAB 42%, #006AAB 100%);
```

- Decorative SVG `x: 636, y: 4190, 154×142` (overlaps the section boundary above).
- `h3` "Let's Build" — **verveine 400, 102px / 79.56px, letter-spacing −1px,
  text-transform capitalize, #FFF**, `x: 73, y: 4332, 1280×100`, `padding-bottom: 20px`.
- `h2` "SOMETHING AWESOME" — `bebas-neue-pro 700, 100px / 100px, uppercase, #FFF`,
  `y: 4432, 1280×128`, `padding-bottom: 28px`. (This one *does* have `innerText`.)
- `p` — `montserrat 400, 18px / 23.94px, ls .55px, #FFF`, `y: 4560, 1280×48`,
  `margin-bottom: 35px`: "We've been building BA brands since 1990. We do not dabble
  in this arena; we dominate it."
- CTA **START TODAY** `x: 578, y: 4643, 270×60`.
- `div.footer_man.wow.fadeInRight` — SVG figure `x: 814, y: 4542, 450×349`
  (svg 180 wide at x 1084). Class `wow fadeInRight` → **WOW.js scroll reveal**.
- Copyright `p` — `montserrat 400, 11px, #FFF`, `y: 4877`:
  "© Copyright 2026. PAPA Advertising, Inc, Erie, PA. All Rights Reserved. |
  Privacy Policy | …"

---

## Motion inventory

| Element | Mechanism |
|---|---|
| Header + hero PAPA wordmark | Lottie — `logo-header.json`, `logo-hero.json`, `paypah.json` |
| Section `h2`s (recent work, Our Services) | letter-split, empty `innerText` |
| Client logo wall | JS marquee in `custom.js` (no CSS keyframes) |
| Footer figure | WOW.js `fadeInRight` |
| Buttons | 150ms ease-in-out on color/bg/border/shadow only |
| Page scroll | `html { scroll-behavior: smooth }` |

## Local assets already captured

`Codex/projects/client-operations/.tmp/papa-source/`
- `live-papa-dom.html` (759KB full desktop DOM), `live-papa-2.png` (full-page shot)
- `assets/theme-style.css` (56KB), `responsive.css` (24KB), `typekit.css`,
  `index-theme.js`, `custom.js`
- `extract/header-hero-live.html`, `mid-sections-live.html`, `bodymovin.json`
- `extract/lottie/` and `.../deliverables/2026-09-02-papa-skeleton-prospect-radar/`
  — `logo-header.json`, `logo-hero.json`, `paypah.json`

---

## Motion addendum — measured frame by frame (live, 1440×900)

### Header scroll swap (caption out, PAPA mark in)

**Trigger.** GSAP ScrollTrigger on the hero wordmark figure
`.homeslider_wrapper .home_logo figure` (doc y 130→585, 858×456),
`start: "bottom top+=100px"` → fires at **scrollY > 485** (binary-searched: 485 off, 486 on).
`onEnter` adds `header.animated`; `onLeaveBack` removes it. Nothing is scroll-linked —
it is a class toggle and CSS transitions do the rest.

```css
.header { background:#40494e; position:fixed; left:0; top:0; width:100%; height:100px;
          box-shadow:0 6px 13px rgba(0,0,0,.15); transition:.25s ease-in; z-index:9999; }
.logo   { position:relative; }                      /* 235×42 at x:73 y:29 */
.logo .logo_caption { transition:.8s cubic-bezier(.85,0,.15,1); }
.logo .logo_caption h4 { color:#df7b11; font:400 40px/1.05 verveine,sans-serif; padding-bottom:0; }
.logo > a { position:absolute; left:0; top:50%; display:block; width:140px;
            transform:translate(-500px,-50%); opacity:0;
            transition:.8s cubic-bezier(.85,0,.15,1); }
.animated .logo .logo_caption { opacity:0; transform:translate(-500px,0); }
.animated .logo a            { opacity:1; transform:translate(0,-50%); }
span#header_logo { text-indent:-99999px; color:#fff; display:block; }   /* a11y text */
```

Both elements share the **same 0.8s cubic-bezier(.85,0,.15,1)** — caption slides left
500px and fades out while the mark slides in from −500px and fades in. Mark renders
**140×74 at x:73, viewport y:10**.

Measured caption curve (t ms → opacity / translateX) — this is what the bezier produces,
use it to verify a rebuild:

| t | 18 | 146 | 245 | 313 | 344 | 381 | 413 | 444 | 478 | 513 | 579 | 646 | ~800 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| opacity | 1.00 | .984 | .937 | .869 | .810 | .709 | .497 | .288 | .189 | .130 | .062 | .027 | 0 |
| x | 0 | −8 | −31 | −66 | −95 | −146 | −251 | −356 | −406 | −435 | −469 | −487 | −500 |

**Lottie in the header mark.** `logo-header.json` — 30 fps, frames 0→180 (**6.0 s**),
native 1254×666, 10 layers. Container `#header_logo` + `.wpbdmv-animation.renderer-svg.playing`
(WP Bodymovin plugin, SVG renderer, autoplay + loop). It plays continuously; the `.animated`
class only reveals it. Reproduce with lottie-web `loadAnimation({renderer:'svg', loop:true,
autoplay:true, path:'logo-header.json'})` inside the 140px-wide anchor.

### Client logo wall (Owl Carousel)

```css
.client_wrapper  { position:relative; }              /* doc y 3278, h 283 */
.client_carousel { position:relative; width:calc(100% + 50px) !important; left:-25px; }
                                                      /* outer box x:48 w:1330 h:265 */
.client_carousel:before { content:""; display:block; position:absolute; left:-3000px; top:50%;
          transform:translate(0,-50%); width:8000px; height:250px; background:#e8edf0; z-index:-1; }
.client_carousel .item { position:relative; display:flex !important; align-items:center;
          justify-content:center; height:265px; }
.client_carousel figure { width:100%; max-width:210px; height:110px; margin:0;
          display:flex; align-items:center; justify-content:center; }
.client_carousel figure a { display:flex; height:100%; align-items:center; justify-content:center; }
.client_carousel figure img { display:block; max-width:100%; max-height:none;
          filter:grayscale(1); opacity:.4; transition:filter .4s ease-in, opacity .4s ease-in; }
.client_carousel figure:hover img { filter:grayscale(0); opacity:1; }
```

That `:before` is the **light-grey full-bleed stripe (#e8edf0, 250px tall)** behind the logos.
Logos render 210×158, greyscale at 40% opacity, full colour on hover.

Owl config at ≥1201px (from `custom.js`):
`items:5, slideBy:5, loop:true, margin:15, autoplay:true, autoplayTimeout:6000,
autoplayHoverPause:true, smartSpeed:600`.
Owl's duration rule: `min(max(|slideBy|,1),6) × smartSpeed` = **5 × 600 = 3000 ms** —
confirmed live: `.owl-stage { transition: transform 3s ease }`.

Measured: item **254 wide + 15 margin = 269 px pitch**, 5 visible, each step translates
**−1345 px over 3 s with `ease`**, then dwells **6 s**. Pauses on hover.

Motion samples (t ms → Δx px): 0→0 · 900→−16 · 1200→−178 · 1500→−467 · 1800→−749 ·
2100→−980 · 2400→−1122 · 2700→−1220 · 3000→−1285 (→ −1345 settled).

80 `<img>` in the DOM including Owl loop clones. Alts seen: H Jack's Plumbing & Heating,
Scott Enterprises, Rick Griffith Properties, Great Lakes Institute of Technology, The YMCA,
Chautauqua Institution, ICEqube, Great Lakes Data Racks & Cabinets.
