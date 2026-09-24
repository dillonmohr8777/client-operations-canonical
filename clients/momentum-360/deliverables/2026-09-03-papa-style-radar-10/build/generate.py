"""Emit the hub + the selected prospect review pages.

Structure and motion come from _source/papa-template and are left alone: the
fixed 100px header, the scrollY>485 swap on 0.8s cubic-bezier(.85,0,.15,1),
the 1310 container, the Owl marquee at 5-up / 3s ease / 6s dwell over the
#e8edf0 stripe, the gradient footer.

Colour comes from build/palettes.py, where every surface has its foreground
measured rather than assumed. Artwork comes from build/illustrations.py -
incumbent original animated SVGs, three per source-backed business.  The
selected 2026-09-05 routes whose source/logo evidence is unavailable render an
explicit source-review surface instead of invented copy, imagery or marks.

Source-backed copy is lifted verbatim from build/content.json when a selected
route has current evidence. The 2026-09-05 manifest deliberately supplies
review labels only for blocked routes; no business claim is invented here.

Nothing emitted into dist/ names or references the agency whose homepage the
structure was measured from: not the copy, not the alt text, not a filename,
not a comment.

Run: python build/generate.py
"""
import html
import json
import os
import re
import shutil
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import illustrations  # noqa: E402
from palettes import ALL, HUB, P, derive  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "_source")
CONTENT = json.load(open(os.path.join(ROOT, "build", "content.json"), encoding="utf-8"))
BATCH_MANIFEST_PATH = os.path.join(SRC, "radar-2026-09-05-source-manifest.json")


def _blocked_content(record):
    """Build conservative page content from the fixed batch manifest.

    The record's identity fields are the only claims carried into these pages.
    Service names and descriptive copy are intentionally review workflow labels,
    not inferred offerings.  This keeps blocked or unreachable first-party
    sources honest while still making every selected route reviewable.
    """
    name = record["name"]
    domain = record["domain"]
    website = record["website"]
    city = record.get("city") or ""
    county = record.get("county") or ""
    location = city or county or "Pennsylvania"
    place = "%s, PA" % city if city else county or "Pennsylvania"
    vertical = record.get("vertical") or "unclassified"
    status = record.get("source_status", "pending")
    source_note = record.get("source_note", "Official source review is pending.")
    logo_status = record.get("logo_status", "not_carried")
    marquee = []
    for line in (name, domain, vertical, location, "Source %s" % status,
                 "Logo %s" % logo_status):
        if line and line not in marquee:
            marquee.append(line)
    return {
        "slug": record["slug"],
        "name": name,
        "title": "%s | Prospect review preview" % name,
        "description": "Local review preview for %s. Source copy and logo review are pending." % name,
        "phone": "",
        "address": "",
        "logo": None,
        "locality": "%s · source review pending" % place,
        "script": "Source review pending",
        "h1": "Source review pending",
        "lede": "This noindex preview keeps the selected batch identity visible while official source copy and logo evidence remain pending.",
        "services_eyebrow": "Source review",
        "services": [
            {"title": "Batch identity", "body": "The selected batch records %s at %s." % (name, domain)},
            {"title": "Source status", "body": "%s Official URL retained as a locator: %s." % (source_note, website)},
            {"title": "Logo status", "body": "No exact transparent source logo is carried in this review build (%s)." % logo_status},
            {"title": "Copy status", "body": "No first-party service claims are imported until the official source is reviewed."},
            {"title": "Next safe step", "body": "Verify the official source and approve any identity assets before a client-facing build."},
        ],
        "steps": [
            {"title": "Verify the official URL", "body": "Open the retained first-party locator and confirm the business identity."},
            {"title": "Review source evidence", "body": "Capture only current first-party copy, contact details, and transparent logo files."},
            {"title": "Replace review labels", "body": "Use approved source language in the page content after review."},
            {"title": "Keep this preview local", "body": "No outreach, publication, or deployment is attached to this artifact."},
        ],
        "about_eyebrow": "Source review status",
        "about_h2": "Identity details only",
        "about_body": "%s is the selected batch identity for %s (%s) in %s. The official source locator is %s. Current evidence is marked %s, so this page intentionally carries no inferred services, testimonials, hours, pricing, phone number, address, or logo." % (
            name, domain, vertical, location, website, status),
        "faq": [
            {"q": "What is verified here?", "a": "The selected batch identity, domain, location fields, and vertical label only."},
            {"q": "Why is the source marked pending?", "a": source_note},
            {"q": "Is this the prospect's public website?", "a": "No. It is a local, noindex review preview for Momentum 360."},
            {"q": "What happens next?", "a": "Review the official source and approve any copy, contact details, imagery, and logo before client-facing work."},
        ],
        "marquee": marquee,
        "cta_h2": "Keep this review local",
        "cta_p": "This noindex preview is for source review only. No outreach or publishing is attached.",
        "actions": [{"label": "Review source evidence", "href": "#contact"}],
        "art": "",
        "has_logo": False,
        "source_status": status,
        "source_note": source_note,
        "source_url": website,
        "source_domain": domain,
        "source_logo_status": logo_status,
    }


if os.path.isfile(BATCH_MANIFEST_PATH):
    with open(BATCH_MANIFEST_PATH, encoding="utf-8") as _manifest_fh:
        SOURCE_MANIFEST = json.load(_manifest_fh)
    # The date-pinned manifest is the complete output set for this review run.
    # Do not leak the incumbent ten-site batch into a current twenty-site build.
    CONTENT = {
        _record["slug"]: _blocked_content(_record)
        for _record in SOURCE_MANIFEST.get("records", [])
        if _record.get("slug")
    }
else:
    SOURCE_MANIFEST = {"records": []}

SLUGS = list(CONTENT)

CDN = """\
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bebas+Neue&amp;family=Caveat:wght@400;700&amp;family=Inter:wght@400;600;700&amp;family=Montserrat:wght@400;600;700&amp;family=Poppins:wght@500;600&amp;display=swap">
<link rel="stylesheet" href="/css/site.css?v=20260903-logo-clarity">"""

SCRIPTS = """\
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" integrity="sha384-g4NTh/Iv5PPU4xPyhEWqPcwtNXOvdaDI8LLnyYfyNZOjKJeYQyjzQ9X5275eBjpt" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" integrity="sha384-Z3REaz79l2IaAZqJsSABtTbhjgOUYyV3p90XNnAPCSHg3EMTz1fouunq9WZRtj3d" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="/js/site.js?v=20260903-logo-clarity"></script>"""

# The illustrations are self-contained - no shared filters, gradients or
# patterns, so nothing has to be defined once at the top of the document and
# no <svg> on the page carries an id that a second copy could collide with.
SPRITE_DEFS = ""


# ---------------------------------------------------------------- sprites
# Papa pulls zigzag / star / heart / strike PNGs off its own nitrocdn. Those are
# Papa-orange bitmaps that cannot take a client's colour, and hotlinking someone
# else's CDN from a deployed site is a broken image waiting to happen. Same
# shapes, same boxes, drawn locally and painted with the brand via mask-image.
def _zig(w, h, teeth, sw):
    inset = sw / 2.0 + 0.5
    step = w / (teeth * 2.0)
    pts = " ".join("%.1f,%.1f" % (i * step, h - inset if i % 2 else inset)
                   for i in range(teeth * 2 + 1))
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d">'
            '<polyline points="%s" fill="none" stroke="#000" stroke-width="%.1f" '
            'stroke-linecap="round" stroke-linejoin="round"/></svg>' % (w, h, pts, sw))


def _star(s):
    c, r, i = s / 2.0, s / 2.0, s * 0.16
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d">'
            '<path d="M%.1f,0 C%.1f,%.1f %.1f,%.1f %d,%.1f C%.1f,%.1f %.1f,%.1f %.1f,%d '
            'C%.1f,%.1f %.1f,%.1f 0,%.1f C%.1f,%.1f %.1f,%.1f %.1f,0 Z" fill="#000"/></svg>'
            % (s, s, c, c + i, c - i, c + i, c - i, s, c, c + i, c + i, c - i, c + i, c, s,
               c - i, c + i, c - i, c - i, c, c - i, c - i, c + i, c - i, c))


def _heart(w, h):
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d">'
            '<path d="M%.1f,%.1f C%.1f,%.1f 0,%.1f 0,%.1f C0,%.1f %.1f,%.1f %.1f,%.1f '
            'C%.1f,%.1f %d,%.1f %d,%.1f C%d,%.1f %.1f,%.1f %.1f,%.1f Z" fill="#000"/></svg>'
            % (w, h, w / 2.0, h * .96, w * .06, h * .62, h * .42, h * .26, h * .08,
               w * .2, h * .02, w / 2.0, h * .22, w * .8, h * .02, w, h * .08, w, h * .26,
               w, h * .42, w * .94, h * .62, w / 2.0, h * .96))


# a rough marker stroke for .strike_out - two overlapping sweeps, like the PNG
STRIKE = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 90" '
          'preserveAspectRatio="none">'
          '<path d="M6,50 C70,28 150,60 220,32 C250,20 274,24 294,16" fill="none" '
          'stroke="#000" stroke-width="13" stroke-linecap="round"/>'
          '<path d="M10,62 C80,46 160,72 232,46 C258,37 278,38 292,32" fill="none" '
          'stroke="#000" stroke-width="7" stroke-linecap="round" opacity=".75"/></svg>')

SPRITES = {
    "zz1": _zig(276, 11, 9, 3), "zz2": _zig(223, 35, 5, 5), "zz3": _zig(140, 15, 4, 3.5),
    "st1": _star(59), "st2": _star(36), "st3": _star(33),
    "ht1": _heart(29, 31), "ht2": _heart(39, 42), "strike": STRIKE,
}


def data_uri(svg):
    return "url(\"data:image/svg+xml,%s\")" % (
        svg.replace('"', "'").replace("#", "%23").replace("<", "%3c")
           .replace(">", "%3e").replace("\n", ""))


def mask(name, extra=""):
    """The sprite boxes are sized in Papa's own rules, so every mask is drawn at
    100% 100% of that box - the SVGs carry no intrinsic size and `mask-size:auto`
    would fall back to 300x150."""
    u = data_uri(SPRITES[name])
    return ("-webkit-mask-image:%s;mask-image:%s;-webkit-mask-repeat:no-repeat;"
            "mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center;"
            "-webkit-mask-size:100%% 100%%;mask-size:100%% 100%%;%s" % (u, u, extra))


# ------------------------------------------------------------------ helpers
def e(s):
    return html.escape(s or "", quote=True)


def tel_href(phone):
    d = re.sub(r"\D", "", phone or "")
    if len(d) == 11 and d.startswith("1"):
        d = d[1:]
    return "+1" + d if len(d) == 10 else ""


def tel_text(phone):
    d = re.sub(r"\D", "", phone or "")
    if len(d) == 11 and d.startswith("1"):
        d = d[1:]
    return "(%s) %s-%s" % (d[:3], d[3:6], d[6:]) if len(d) == 10 else ""


def split_chars_safe(s):
    """Papa splits section h2s per character in JS; nothing to do here."""
    return s


HERO_ALTS = {
    "advance-exterior-solutions": "Roofer aligning architectural shingles on a residential roof",
    "f-m-berkheimer-inc": "HVAC technician diagnosing heating and cooling equipment",
    "golden-sea": "Chef tossing fresh vegetables in a wok over a controlled flame",
    "nolts-auto-parts": "Auto-parts specialist preparing a brake rotor and parts order",
    "sangillo-tire-center": "Tire technician fitting a tire to a wheel in the shop",
    "smile-culture-dental": "Dental practitioner preparing instruments in a bright treatment room",
    "specks-broasted-chicken": "Cook lifting freshly prepared chicken from a commercial fryer",
    "the-juice-merchant": "Fresh green juice being poured beside citrus and leafy produce",
    "union-chill-mat-company": "Technician inspecting portable industrial heating equipment",
    "weathers-motors-and-auto-sales": "Auto technician inspecting a vehicle brake assembly",
}


def industry_hero(slug):
    """One route-specific hero, or a labelled source-pending surface.

    A missing industry image is deliberate for the blocked routes in the
    2026-09-05 manifest.  The fallback is a CSS-painted review surface, not a
    synthetic photograph or a borrowed prospect asset.
    """
    if slug not in HERO_ALTS:
        name = CONTENT.get(slug, {}).get("name", slug)
        return ('<div class="industry_hero industry_hero_pending" role="img" '
                'aria-label="Source review pending for %s">'
                '<span class="pending_hero_label">Source review pending</span></div>'
                '<span class="industry_grain" aria-hidden="true"></span>' % e(name))
    return ('<img class="industry_hero" src="/assets/industry/%s-align-hero.webp" '
            'width="1672" height="941" alt="%s" fetchpriority="high" decoding="async">'
            '<span class="industry_grain" aria-hidden="true"></span>'
            % (slug, e(HERO_ALTS[slug])))


def pending_svg(slug, index):
    """An explicit, source-neutral illustration placeholder for blocked routes."""
    name = CONTENT.get(slug, {}).get("name", slug)
    safe = re.sub(r"[^a-z0-9-]+", "-", slug.lower()).strip("-")
    title = "Source review pending for %s" % name
    return ('<svg class="illo il-pending-%s-%d" viewBox="0 0 600 400" '
            'preserveAspectRatio="xMidYMid slice" role="img" focusable="false">'
            '<title>%s</title><rect class="field" width="600" height="400"/>'
            '<rect class="wash" x="64" y="66" width="472" height="268" rx="18"/>'
            '<path class="line" d="M128,218 C196,148 268,288 338,206 C390,146 446,172 492,204"/>'
            '<path class="aline" d="M154,272 L446,272"/>'
            '<text class="pending_label" x="300" y="122" text-anchor="middle">Source review pending</text>'
            '</svg>' % (safe, index, e(title)))


def site_svg(slug, index, hero=False):
    """Use incumbent art where it is owned; otherwise render a labelled fallback."""
    return illustrations.svg(slug, index, hero=hero) if slug in illustrations.ART else pending_svg(slug, index)


# ------------------------------------------------------------------- scrub
# The template was transcribed from a live theme and its comments name that
# theme's owner throughout. Nothing in the publish set may, so the emitted CSS
# and JS go through this on the way out and the result is asserted, not hoped
# for. Longest phrase first - these run in order.
SCRUB = [
    ("PAPA Advertising homepage clone - desktop (1440x900 reference)\n"
     "   Rules transcribed from the live theme stylesheet\n"
     "   (.tmp/papa-source/assets/theme-style.css + responsive.css) and from the\n"
     "   measured spec at\n"
     "   clients/momentum-360/skills/papa-prospect-radar-sites/references/\n"
     "   papa-homepage-desktop-spec.md",
     "Prospect preview stylesheet - desktop (1440x900 reference)\n"
     "   Geometry transcribed from the reference theme measured for this build;\n"
     "   colour, artwork and every foreground are this build's own."),
    ("PAPA Advertising homepage clone - behaviour.\n"
     "   Mirrors the live theme's custom.js", "Prospect preview behaviour.\n"
     "   Mirrors the reference theme's script"),
    ("live custom.js", "reference script"),
    ("ScrollTrigger in papa.js", "ScrollTrigger in site.js"),
    ("lottie-web 5.12.2.", "no animation library."),
    ("Papa's own", "the reference theme's own"),
    ("Papa's", "the reference theme's"),
    ("PAPA", "the reference theme"),
    ("Papa", "the reference theme"),
    ("papa", "reference"),
    ("Lottie", "vector"),
    ("lottie", "vector"),
]


def scrub(text, what):
    text = re.sub(r"^.*wpbdmv.*\n", "", text, flags=re.M)
    for a, b in SCRUB:
        text = text.replace(a, b)
    left = [w for w in ("papa", "Papa", "PAPA", "wpbdmv", "lottie", "Lottie") if w in text]
    assert not left, "%s still names %s" % (what, left)
    return text


# ------------------------------------------------------------------ CSS
# Every surface below is paired with the foreground the palette module measured
# for it. No rule in the emitted stylesheet sets #fff on a brand field.
VAR_KEYS = ["brand", "brand_lt", "brand_dp", "hero", "accent", "accent_ui", "script",
            "header", "paper", "ink", "stripe", "brand_ink", "accent_ink",
            "field", "wash", "wash_2",
            "on_brand", "on_accent", "on_header", "on_hero", "on_footer", "on_field"]


def vars_lines(p, indent="  "):
    d = derive(p)
    return "".join("%s--%s: %s;\n" % (indent, k.replace("_", "-"), d[k]) for k in VAR_KEYS)


def vars_block(sel, p):
    return "%s {\n%s}" % (sel, vars_lines(p))


def build_css():
    css = open(os.path.join(SRC, "papa-template", "css", "papa.css"), encoding="utf-8").read()

    # 1. the fixed template palette becomes the per-site variable contract.
    css = css.replace(
        '  --blue:      #006bab;\n  --blue-lt:   #159ed3;\n  --orange:    #df7b11;\n',
        '  /* defaults; every page overrides these via [data-site] below */\n'
        + vars_lines(next(iter(P.values()))))
    css = css.replace("var(--blue-lt)", "var(--field)")   # hero field, behind the art
    css = css.replace("var(--blue)", "var(--brand-ink)")  # headings, on paper
    css = css.replace("var(--orange)", "var(--accent-ink)")

    # 2. the places where the colour role is not "ink on paper". Every one of
    #    these used to be a literal #fff sitting on a brand field; each now
    #    reads the foreground palettes.py measured for that exact surface.
    subs = [
        # header band + the nav overlay + the script tagline sit on dark
        ("background: #40494e; position: fixed", "background: var(--header); position: fixed"),
        ('.header a[href^="tel"] { color: #fff;', '.header a[href^="tel"] { color: var(--on-header);'),
        ("span#header_logo { text-indent: -99999px; color: #fff;",
         "span#header_logo { text-indent: -99999px; color: var(--on-header);"),
        (".mobile_menubtn strong { color: #fff;", ".mobile_menubtn strong { color: var(--on-header);"),
        (".mobile_menubtn.open #nav-icon3 span { background: #fff; }",
         ".mobile_menubtn.open #nav-icon3 span { background: var(--on-accent); }"),
        (".mobile_menubtn.open strong { color: #fff; }",
         ".mobile_menubtn.open strong { color: var(--on-accent); }"),
        # the hamburger is a 34x27 glyph; the button around it has to be a
        # 44x44 target, so the padding grows and the glyph is centred in it
        ("#nav-icon3 { position: relative; display: block; width: 34px; height: 27px;\n"
         "  background: transparent; border: 0; padding: 0; }",
         "#nav-icon3 { position: relative; display: block; width: 44px; height: 44px;\n"
         "  background: transparent; border: 0; padding: 8px 5px; }"),
        ("#nav-icon3 span:nth-child(2), #nav-icon3 span:nth-child(3) { top: 12px; }",
         "#nav-icon3 span { width: calc(100% - 10px); left: 5px; }\n"
         "#nav-icon3 span:nth-child(2), #nav-icon3 span:nth-child(3) { top: 20px; }"),
        ("#nav-icon3 span:nth-child(4) { top: 24px; }",
         "#nav-icon3 span:nth-child(4) { top: 32px; }"),
        (".mobile_menubtn.open #nav-icon3 span:nth-child(1) { top: 12px; width: 0; left: 50%; }",
         ".mobile_menubtn.open #nav-icon3 span:nth-child(1) { top: 20px; width: 0; left: 50%; }"),
        (".mobile_menubtn.open #nav-icon3 span:nth-child(4) { top: 12px; width: 0; left: 50%; }",
         ".mobile_menubtn.open #nav-icon3 span:nth-child(4) { top: 20px; width: 0; left: 50%; }"),
        ("#nav-icon3 span:nth-child(3) { top: 19px; }", "#nav-icon3 span:nth-child(3) { top: 26px; }"),
        # nav overlay panel: solid accent, so the pairing is measurable
        ("  background: rgba(239,139,34,.9);\n", "  background: var(--accent-ui);\n"),
        (".mainnav_wrapper nav { width: 100%; padding-bottom: 40px; border-bottom: 3px solid #fff;",
         ".mainnav_wrapper nav { width: 100%; padding-bottom: 40px;\n"
         "  border-bottom: 3px solid var(--on-accent);"),
        (".mainnav_wrapper nav ul li a { display: block; color: #fff;",
         ".mainnav_wrapper nav ul li a { display: block; color: var(--on-accent);"),
        (".mainnav_wrapper nav ul li a:hover { color: #fff; font-weight: 200; }",
         ".mainnav_wrapper nav ul li a:hover { color: var(--on-accent); font-weight: 200; }"),
        ("background: #fff !important; border-radius: 50%;",
         "background: var(--on-accent) !important; border-radius: 50%;"),
        (".tel_link { color: #fff;", ".tel_link { color: var(--on-accent);"),
        # footer: one gradient, one measured foreground
        (".footer .content h3 { color: #fff;", ".footer .content h3 { color: var(--on-footer);"),
        (".footer .content h2 { color: #fff;", ".footer .content h2 { color: var(--on-footer);"),
        (".footer .content p { color: #fff;", ".footer .content p { color: var(--on-footer);"),
        (".footer_links ul li a { color: #fff;", ".footer_links ul li a { color: var(--on-footer);"),
        (".copyright_box p { color: #fff;", ".copyright_box p { color: var(--on-footer);"),
        (".copyright_box p a { color: #fff; text-decoration: none; }",
         ".copyright_box p a { color: var(--on-footer); text-decoration: underline; }"),
        (".copyright_box p a:hover { color: #fff; text-decoration: underline; }",
         ".copyright_box p a:hover { color: var(--on-footer); text-decoration: underline; }"),
        # the button base colour is the accent's foreground, not white
        ("height: 60px; color: #fff; font-size: 20px;",
         "height: 60px; color: var(--on-accent); font-size: 20px;"),
        (".logo .logo_caption h4 { color: var(--accent-ink);",
         ".logo .logo_caption h4 { color: var(--script);"),
        (".logo .logo_caption h4 a { color: var(--accent-ink);",
         ".logo .logo_caption h4 a { color: var(--script);"),
        (".mobile_menubtn:hover strong { color: var(--accent-ink); }",
         ".mobile_menubtn:hover strong { color: var(--script); }"),
        (".mobile_menubtn:hover #nav-icon3 span { background: var(--accent-ink); }",
         ".mobile_menubtn:hover #nav-icon3 span { background: var(--script); }"),
        ("#nav-icon3 span { display: block; position: absolute; height: 3px; width: 100%;\n"
         "  background: var(--accent-ink);",
         "#nav-icon3 span { display: block; position: absolute; height: 3px; width: 100%;\n"
         "  background: var(--script);"),
        ("color: #d88023; font-size: 34px;", "color: var(--accent-ui); font-size: 34px;"),
        # buttons carry the checked on-accent text colour
        (".btn-warning { background-color: var(--accent-ink) !important; }",
         ".btn-warning { background-color: var(--accent-ui) !important; color: var(--on-accent) !important; }"),
        (".btn-warning:hover { color: #fff; background-color: #e77d0e !important; }",
         ".btn-warning:hover { color: var(--on-accent) !important;\n"
         "  background-color: color-mix(in srgb, var(--accent-ui) 86%, #000) !important; }"),
        # footer gradient
        ("background-image: linear-gradient(#159ED3 0%, #006AAB 42%, #006AAB 100%);",
         "background-image: linear-gradient(var(--brand-lt) 0%, var(--brand-dp) 42%, var(--brand-dp) 100%);"),
        # the tagline colour never clears 3:1 on the gradient's light stop, so
        # the hover signal is an underline rather than a second colour
        (".footer_links ul li a:hover { color: var(--accent-ink); }",
         ".footer_links ul li a:hover { color: var(--on-footer); text-decoration: underline; }"),
        # the carousel is gone, so the rule that pinned its transition goes too
        (".client_carousel .owl-stage { transition-property: transform !important;"
         + chr(10) + "  transition-timing-function: ease !important; }", ""),
        # the struck word varies per page, so the typing keyframe reads its width
        ("@keyframes typing { from { width: 0 } to { width: 236px } }",
         "@keyframes typing { from { width: 0 } to { width: var(--type-w, 236px) } }"),
    ]
    for a, b in subs:
        assert a in css, "CSS anchor missing: " + a[:70]
        css = css.replace(a, b)

    # 3. local brand-coloured sprites in place of Papa's nitrocdn bitmaps
    css = re.sub(r'\n\s*background: url\("https://cdn-ilblndn[^"]*strike\.png"\) no-repeat center center;'
                 r'\n\s*background-size: 100% auto;',
                 "\n  background-color: var(--accent-ink); " + mask("strike"), css)
    for name in ("zz1", "zz2", "zz3", "st1", "st2", "st3", "ht1", "ht2"):
        css = re.sub(r'\n\s*background-image: url\("https://cdn-ilblndn[^"]*%s\.png"\);' % name,
                     "\n  background-color: var(--accent-ink); " + mask(name), css)
    assert "cdn-ilblndn" not in css, "a Papa CDN sprite survived"
    css = css.replace(".zigzag .zz1, .zigzag .zz2, .zigzag .zz3 { display: block; background-repeat: no-repeat; background-position: center; }",
                      ".zigzag .zz1, .zigzag .zz2, .zigzag .zz3 { display: block; }")

    # 4. per-site variable blocks, base and derived, straight from palettes.py
    blocks = ["\n/* ==========================================================================\n"
              "   10. per-site variables (colour only - no geometry below this line)\n"
              "   Each block is emitted by palettes.derive(); the on-* values are\n"
              "   measured, not assumed, and check_static.py re-measures them.\n"
              "   ========================================================================== */"]
    for slug, p in ALL:
        blocks.append(vars_block('[data-site="%s"]' % slug, p))

    css += "\n".join(blocks) + "\n" + EXTRA_CSS + illustrations.CSS
    return scrub(css, "site.css")


# rules for the parts Papa fills with its own media and we fill with the
# prospect's real copy. No Papa geometry is touched here.
EXTRA_CSS = """
/* ==========================================================================
   11. prospect content in Papa's slots
   ========================================================================== */

/* The template never declares a page background - it inherits the browser's
   default canvas. That is white on most setups and BLACK on a user agent in
   dark mode, which turns every statement block into red-on-black. The whole
   contrast table is computed against paper, so paper is stated here rather
   than assumed. */
html { background: var(--paper); color-scheme: light; }

/* --- header layout contract --------------------------------------------
   The tagline used to be laid out as if it were the only thing in the band:
   nowrap, no ceiling, and a .logo max-width that a nowrap child simply
   overflows. At 375 that put the caption's right edge at 240px and the menu
   button's left edge at 240px - zero clearance - and on a 393-430px phone the
   script ran straight through the MENU label.

   The fix is a contract rather than a smaller font. The menu button is a fixed
   object, so it reserves its own column first and a hard 16px gap after it;
   the caption is a flexible one, so it gets exactly what is left and nothing
   more. .logo is size-contained, which means it CANNOT be widened by its own
   text - it can only take the leftover the flex line gives it - and the
   caption is then set from its own character count against that column via
   container units, so the longest tagline in the batch ("The Smile Is The
   International Language", 39 characters) obeys the same rule as the shortest.
   0.39 is the advance constant, and it is measured rather than guessed: the
   harness reports the real cap advance per character of the script face for
   every tagline (adv= in /audit.html), which came back 0.309-0.369 across the
   eleven. 0.39 leaves the longest line at about 92% of its column. The wrap is
   left enabled underneath as the failure mode, so if that constant is ever
   wrong - a different face, a longer tagline - the caption takes a second line
   instead of taking the menu. Golden Sea's 39-character tagline genuinely does
   not fit one line above the 13px floor below about 400px wide, and takes two
   there by design.                                                          */
.header .d-flex { gap: 16px; }
.logo { flex: 1 1 0%; min-width: 0; container-type: inline-size; }
.mobile_menubtn { flex: 0 0 auto; }
.logo .logo_caption { max-width: 100%; }
.logo .logo_caption h4 { max-width: 100%; white-space: normal;
  overflow-wrap: break-word;
  font-size: clamp(13px, calc(100cqw / (var(--cap-ch, 24) * 0.39)), 40px); }

/* --- marks -------------------------------------------------------------
   Header logos use their real aspect ratio instead of being squeezed through
   one 140px slot. The 400px frame collapses to its flex column on phones;
   each image may use up to 1.4x its cleaned source pixels and 70px of height.
   No mark sits on a panel: transparent pixels reveal the header surface.   */
.markbox { display: block; width: 100%; aspect-ratio: 1254 / 666; }
.markbox img { display: block; width: 100%; height: 100%; object-fit: contain; }
.logo > a { width: min(400px, 100%); height: 74px; margin-top: 0; }
span#header_logo { position: absolute; width: 1px; height: 1px; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0); clip-path: inset(50%); white-space: nowrap; }
.logo > a .markbox { display: flex; align-items: center; justify-content: flex-start;
  width: 100%; height: 74px; aspect-ratio: auto; }
.logo > a .markbox img { width: min(100%, var(--header-w)); height: auto;
  max-width: var(--cap); max-height: 70px; object-fit: contain;
  object-position: left center; }

/* --- the upscale cap -----------------------------------------------------
   Every logo file here was captured small: 102x88 at the smallest, 400x41 at
   the widest. A raster mark shown above about 1.4x its native pixel width is
   visibly destroyed, so every placement carries an inline max-width computed
   from the FILE (round(1.4 * naturalWidth)) and no rule anywhere may push a
   mark past it. The hero keeps the exact mark at that honest size instead of
   replacing it with a synthetic logo.                                      */
.markbox img, .cardmark img { max-width: var(--cap); }

/* Legacy typographic lockup for source-backed prospects without a logo file. */
.wordmark { display: flex; flex-direction: column; align-items: flex-start;
  justify-content: center; height: 100%; font-family: var(--f-display);
  line-height: .84; text-transform: uppercase; letter-spacing: .01em; }
.wordmark span { display: block; }
.logo > a .wordmark { color: var(--on-header); font-size: 30px; }
.logo > a .wordmark .rule { width: 46px; height: 3px; margin-top: 5px;
  background: var(--script); }
.home_logo .wordmark { align-items: center; color: var(--brand-ink);
  text-align: center; }
.home_logo .wordmark .rule { width: 34%; height: 10px; margin-top: 20px;
  background: var(--accent-ink); }
[data-site]:not([data-site="hub"]) .home_logo .wordmark { color: var(--on-header); }
[data-site]:not([data-site="hub"]) .home_logo .wordmark .rule { background: var(--script); }
.pending_mark { display: flex; align-items: center; justify-content: flex-start;
  width: 100%; height: 74px; color: var(--on-header); }
.pending_mark_label { display: inline-block; padding: 9px 12px; border: 1px solid
  color-mix(in srgb, var(--on-header) 48%, transparent); font-family: var(--f-body);
  font-size: 11px; font-weight: 700; letter-spacing: .12em; line-height: 1.2;
  text-transform: uppercase; }

/* --- hero: one generated industry scene, with no centered logo -----------
   Each prospect gets one full-bleed editorial image. The empty anchor keeps
   the reference scroll-swap geometry intact without putting a mark on top of
   the photograph. Grain is a separate reusable surface, not baked into art. */
.homeslider .backbgbox { background: var(--field); }
[data-site]:not([data-site="hub"]) .homeslider .backbgbox { background: var(--header); }
.homeslider .backvid .industry_hero { display: block; width: 100%; height: 100%;
  object-fit: cover; object-position: center; }
.homeslider .backvid .industry_hero_pending { display: flex; align-items: center;
  justify-content: center; background: var(--header); color: var(--on-header);
  border: 1px solid color-mix(in srgb, var(--on-header) 22%, transparent);
  text-align: center; }
.pending_hero_label { padding: 16px 24px; border: 1px solid currentColor;
  font-family: var(--f-body); font-size: 15px; font-weight: 700;
  letter-spacing: .14em; text-transform: uppercase; }
.source_notice { max-width: 760px; margin: 0 auto 28px; color: var(--on-field);
  font-family: var(--f-body); font-size: 14px; line-height: 1.55; }
.source_notice strong { color: var(--brand-ink); letter-spacing: .08em;
  text-transform: uppercase; }
.source_notice a { color: var(--accent-ink); text-decoration: underline;
  text-underline-offset: 3px; }
.pending_label { fill: var(--brand-ink); font-family: var(--f-body);
  font-size: 18px; font-weight: 700; letter-spacing: .08em;
  text-transform: uppercase; }
.homeslider .backvid .industry_grain { position: absolute; inset: 0;
  pointer-events: none; background-image: url("/assets/grain.svg");
  background-size: 220px 220px; opacity: .22; mix-blend-mode: soft-light; }
.homeslider_wrapper .home_logo figure { position: relative; z-index: 2;
  width: min(1180px, 88vw); }
.home_logo .hero_anchor { display: block; width: 100%; height: 455.68px; }
.home_logo .markbox { display: flex; align-items: center; justify-content: center;
  width: 100%; height: 455.68px; aspect-ratio: auto; }
.home_logo .markbox { --gpad: 120px; box-sizing: border-box; padding: 0 60px; }
.home_logo .markbox img { display: block; width: var(--markw, 100%);
  max-width: 100%; min-width: 0; height: auto; object-fit: contain; }
.home_logo .markbox .wordmark { width: auto; height: auto; min-width: 0; }
/* The lockup is set to the panel, not to a fixed step: panel width divided by
   the longest line, capped at the display size the desktop spec uses. 0.405 is
   the measured average cap advance of the display face across the selected names
   (the widest of them runs 0.375em per character), so every lockup lands at
   about 90% of its panel and none of them can overflow it. */
.home_logo .wordmark { font-size: clamp(34px,
  calc((min(1180px, 88vw) - var(--gpad, 120px)) / (var(--wm-ch, 14) * 0.405)), 150px); }

/* --- Papa's video panel, carrying the headline -------------------------
   Papa runs a Vimeo background here. There is no footage for these
   businesses and none will be generated, so the panel keeps its 16/9 box,
   its -136px overlap and its shadow, and carries the prospect's own H1. */
.homevideo { background: var(--brand); }
.homevideo .video_frame { display: flex; flex-direction: column; align-items: center;
  justify-content: center; text-align: center; padding: 6% 8%; }
.homevideo .eyebrow { color: var(--on-brand); font-size: 16px; font-family: var(--f-body);
  font-weight: 700; line-height: 1.2; letter-spacing: .2em; text-transform: uppercase;
  margin-bottom: 26px; }
.homevideo h1 { color: var(--on-brand); font-size: 76px; font-family: var(--f-display);
  font-weight: 700; line-height: .96; text-transform: uppercase; letter-spacing: -1px; }
.homevideo .rule { display: block; width: 120px; height: 7px; background: var(--accent);
  margin-top: 32px; }

/* --- work grid: two large drawings, then typographic tiles --------------
   Three drawings cycled across five or six equal cards meant every drawing
   appeared twice on the page. The grid is now two rows: the first carries
   the two card drawings at half-width and nearly a third taller, the second
   carries the remaining services as numbered typographic tiles. Combined
   with the hero taking the third drawing, each of a site's three drawings
   appears exactly once.                                                     */
.recent_work figure { background: transparent; padding: 0; box-shadow: none;
  overflow: hidden; }
.recent_work figure.tile { background: var(--wash); height: 420px; }
.work_tiles { margin-top: 6px; }
.work_tiles .recent_work figure { display: flex; align-items: center;
  justify-content: center; gap: 18px; height: 188px; background: var(--wash); }
.work_tiles .recent_work figure.alt { background: var(--wash-2); }
.work_tiles .recent_work figure.alt2 { background: var(--field); }
.work_tiles .idx { color: var(--brand-ink); font-family: var(--f-display);
  font-size: 82px; font-weight: 700; line-height: .8; }
.work_tiles .bar { display: block; width: 46px; height: 7px;
  background: var(--accent-ink); }
.col-lg-3 { width: 25%; }
.recent_work figure.tile .illo { --illo-bg: var(--wash); }
.recent_work figure.tile.alt .illo { --illo-bg: var(--wash-2); }
.recent_work figure.tile.alt2 .illo { --illo-bg: var(--field); }
.recent_work figure .illo { transition: transform .4s ease-in; }
.recent_work:hover figure .illo { transform: scale(1.035); }

/* hub cards: the prospect's real mark, straight on the page, nothing behind it */
.recent_work figure.mark { display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 20px; background: transparent;
  border: 0; }
.recent_work figure.mark .cardmark { display: block; width: 100%; }
.recent_work figure.mark img { width: 100%; max-width: var(--cap, 100%); max-height: 210px;
  height: auto; object-fit: contain; box-shadow: none; }
.recent_work figure.mark .wordmark { align-items: center; color: var(--brand-ink);
  font-size: 54px; height: auto; text-align: center; }
.recent_work figure.mark .wordmark .rule { width: 96px; height: 6px;
  margin: 12px auto 0; background: var(--accent-ink); }
.recent_work figure.mark small { color: #5f6a70; font-size: 13px;
  font-family: var(--f-body); font-weight: 600; letter-spacing: .14em;
  text-transform: uppercase; }

/* the hero copy sits under the mark, so it steps back a little; the work
   cards and the band carry the drawings at full strength */
.homeslider .backvid .illo { --illo-bg: var(--field); opacity: .66; }

.hubhero .field { fill: var(--field); }

/* --- the stripe band: typographic, static, nothing repeated -------------
   This slot used to be an Owl marquee that padded a short list of marks back
   up to a full cycle by duplicating them, so the same item passed twice.
   The mechanism is gone (with it jQuery and Owl entirely); the band is now
   the site's own lines set once each over the same 8000x250 stripe. The
   strip paints the stripe colour itself as well, so a wrapped set on a phone
   still sits on ground rather than off the end of the 250px band.           */
.mark_strip { display: flex; flex-wrap: wrap; align-items: center;
  justify-content: center; gap: 4px 34px; margin: 0; padding: 92px 25px;
  background: var(--stripe); list-style: none; }
.mark_strip li { display: flex; align-items: center; gap: 34px;
  color: var(--charcoal); font-size: 15px; font-family: var(--f-body);
  font-weight: 700; line-height: 2.1; letter-spacing: .1em;
  text-transform: uppercase; }
.mark_strip li:not(:last-child)::after { content: ""; display: block; width: 8px;
  height: 8px; transform: rotate(45deg); background: var(--accent-ink); }

/* --- fluid type + collision fixes ---------------------------------------
   The desktop capture pins several boxes to fixed pixel heights. That is
   correct at 1440 where every string fits on one line, but any heading that
   wraps then overflows its locked box and collides with the next row. These
   rules keep the exact desktop measurement (content still fits in the pinned
   height, so min-height resolves to the same number) while letting small
   viewports grow instead of overlap.                                        */
.accordion .accordion-button {
  height: auto; min-height: 80px;        /* was a hard 80px -> wrap collided */
  align-items: center; gap: 14px;
  line-height: 1.12; hyphens: auto; overflow-wrap: anywhere;
}
.accordion .accordion-button > span { display: block; min-width: 0; }
.accordion-item + .accordion-item { margin-top: 0; }

/* headings: never let a locked line-height stack lines on top of each other */
h2, h3, .aboutinfo_box h1, .footer .content h3 { overflow-wrap: break-word; }
h2 { line-height: 1.0; }
h1 { line-height: 1.02; }

@media (max-width: 900px) {
  .accordion .accordion-button { font-size: 21px; min-height: 68px; padding: 16px 4px; }
  /* .row cancels the container gutter with margin:0 -15px; on phones that
     puts copy flush against the glass. Restore the gutter below 900.      */
  .row { margin-left: 0; margin-right: 0; }
  /* Phone hero mark. The desktop box is a fixed 455.68px tall because the
     scroll swap depends on it; below 900 nothing depends on it, so the mark
     is sized off the viewport WIDTH and the box follows the mark. A 400x23
     wordmark logo rendered 197px wide before this; it now renders ~88vw.  */
  .homeslider_wrapper .home_logo figure { width: 88vw; max-width: 700px; }
  .home_logo .markbox { height: auto; aspect-ratio: auto; }
  .home_logo .markbox { --gpad: 52px; padding: 0 26px; }
  .homeslider_wrapper .home_logo { padding-bottom: 140px; }
  /* letter-split reveals are scroll-triggered; if the trigger never fires
     (short viewport, reduced motion, bfcache restore) the heading is left
     half-revealed. On small screens show the glyphs and skip the reveal.  */
  h2 .ch, h3 .ch { opacity: 1 !important; transform: none !important; }
  h1, .video_frame h1, .homevideo_box h1 { font-size: 46px; line-height: 1.04; }
  .accordion .accordion-body p { font-size: 16px; line-height: 1.6; }
  .recent_work figure { height: 260px; }
  .recent_work figure.tile { height: 300px; }
  .recent_work figure.mark { height: auto; min-height: 200px; }
  .recent_work figure.mark img { max-height: 150px; }
  .work_tiles .recent_work figure { height: 150px; }
  .work_tiles .idx { font-size: 62px; }
  .mark_strip { gap: 4px 22px; padding: 60px 25px; }
  .mark_strip li { gap: 22px; font-size: 13px; }
}
@media (max-width: 640px) {
  .accordion .accordion-button { font-size: 18px; min-height: 60px; letter-spacing: 0; }
  h1, .video_frame h1, .homevideo_box h1 { font-size: 34px; line-height: 1.12; }
  h2 { font-size: 38px; padding-bottom: 22px; }
  h3, .aboutinfo_box h1 { font-size: 30px; }
  .aboutinfo_box p { font-size: 19px; line-height: 1.45; }
  .footer .content h3 { font-size: 44px; line-height: .9; }
  .markbox { max-width: 100%; }
  .recent_work figure { height: 220px; }
  .recent_work figure.tile { height: 250px; }
  .recent_work figure.mark { min-height: 170px; }
  .recent_work figure.mark img { max-height: 120px; }
  .work_tiles .recent_work figure { height: 130px; }
  .work_tiles .idx { font-size: 52px; }
  .home_logo .markbox { --gpad: 32px; padding: 0 16px; }
  .btn { height: 54px; font-size: 16px; }
}
@media (max-width: 420px) {
  .accordion .accordion-button { font-size: 16px; }
  h1, .video_frame h1, .homevideo_box h1 { font-size: 28px; line-height: 1.14; }
  h2 { font-size: 31px; }
}


/* --- mark motion: Papa's Lottie cadence, reproduced for a raster mark ------
   Source logo-header.json: 30fps, 180 frames = 6.00s loop. Letter layers key
   scale at f37/46/55/72 (squash-stretch ripple); one A also keys position at
   f72/75/86 (the hop); pills swap at f81. A PNG has no separable letters, so
   the whole mark carries the same timeline instead of four staggered layers.
   Percentages below are those frame numbers over 180.                       */
@keyframes mark_hop {
  0%,   20.5% { transform: translateY(0)     scale(1,    1);    }  /* f0-37  rest   */
  25.6%       { transform: translateY(3%)    scale(1.07,  .93); }  /* f46    squash */
  30.6%       { transform: translateY(-5%)   scale(.955, 1.06); }  /* f55    stretch*/
  40.0%       { transform: translateY(0)     scale(1,    1);    }  /* f72    settle */
  41.7%       { transform: translateY(4%)    scale(1.06,  .94); }  /* f75    crouch */
  47.8%       { transform: translateY(-24%)  scale(.97,  1.05); }  /* f86    jump   */
  53.0%       { transform: translateY(0)     scale(1.05,  .95); }  /*        land   */
  57.0%       { transform: translateY(-5%)   scale(.99,  1.02); }  /*        rebound*/
  61.0%, 100% { transform: translateY(0)     scale(1,    1);    }  /*        rest   */
}
.markbox > img, .markbox > .wordmark {
  transform-origin: 50% 100%;
  animation: mark_hop 6s cubic-bezier(.34,.06,.28,1) infinite both;
  will-change: transform;
}
/* The hero mark runs the same clock, offset so it does not fire in lockstep
   with the header mark once that has swapped in - but translate only. The
   squash-and-stretch scales to 1.07, and a hero mark already sitting at
   exactly 1.4x its native width would spend part of every cycle past the cap
   the whole build is gated on. */
@keyframes hero_hop {
  0%, 20.5% { transform: translateY(0);    }
  25.6%     { transform: translateY(1.4%); }
  30.6%     { transform: translateY(-2%);  }
  40.0%     { transform: translateY(0);    }
  41.7%     { transform: translateY(1.8%); }
  47.8%     { transform: translateY(-11%); }
  53.0%     { transform: translateY(0);    }
  57.0%     { transform: translateY(-2.4%);}
  61.0%, 100% { transform: translateY(0);  }
}
.home_logo .markbox > img, .home_logo .markbox > .wordmark {
  transform-origin: 50% 100%;
  animation: hero_hop 6s cubic-bezier(.34,.06,.28,1) -1.6s infinite both;
  will-change: transform;
}

/* --- accordion / footer additions -------------------------------------- */
.accordion .accordion-body ul.plain li { display: block; width: 100%; }
.accordion .accordion-body ul.plain li:after { display: none; }
.footer .content .addr { color: var(--on-footer); font-size: 16px; font-family: var(--f-body);
  font-weight: 600; line-height: 1.6; letter-spacing: .04em; margin-bottom: 30px; }
.footer .content .addr a { color: var(--on-footer); text-decoration: underline; }
.backlink { display: inline-flex; align-items: center; height: 44px; color: var(--on-footer);
  font-size: 14px; font-family: var(--f-body); font-weight: 700; letter-spacing: .1em;
  text-transform: uppercase; text-decoration: underline; }

.skip-link:focus { position: static !important; left: auto !important; display: block;
  background: var(--accent); color: var(--on-accent); font-family: var(--f-body);
  font-weight: 700; padding: 12px 18px; text-align: center; text-decoration: none; }

/* --- keyboard focus (Papa ships none) ---------------------------------- */
a:focus-visible, button:focus-visible { outline: 3px solid var(--script);
  outline-offset: 3px; }
.footer a:focus-visible { outline-color: var(--on-footer); }
.header a:focus-visible { outline-color: var(--on-header); }
.mainnav_wrapper a:focus-visible { outline-color: var(--on-accent); }

/* --- reduced motion ----------------------------------------------------- */
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .logo .logo_caption, .logo > a, h2 .ch, .zigzag .zz1, .zigzag .zz2, .zigzag .zz3,
  .strike_out:before { transition-duration: .01ms !important; }
  .footer_man.wow.animated, .strike_out .strike_replace { animation: none !important; }
  .strike_out .strike_replace { width: auto !important; opacity: 1; }
  .markbox > img, .markbox > .wordmark { animation: none !important; }
  .bridge .illo * { animation: none !important; }
  .recent_work:hover figure .illo { transform: none; }
}

/* --- responsive: the desktop spec is 1440x900; below that the Papa
       breakpoints collapse the fixed 1310 grid ------------------------- */
@media (max-width: 1200px) {
  .container { max-width: 100%; }
  h2 { font-size: 68px; padding-bottom: 30px; }
  h3, .aboutinfo_box h1 { font-size: 48px; }
  .homeslider_wrapper .home_logo figure { width: 88vw; }
  .aboutinfo_box p { font-size: 28px; }
  .our_services_wrapper .content { padding-right: 40px; }
}
@media (max-width: 900px) {
  .col-md-6, .col-lg-4, .col-lg-10 { width: 100%; }
  .col-lg-3 { width: 50%; }
  .mainnav_wrapper { width: 100%; padding: 140px 24px 48px; }
  .menuopen .mobile_menubtn { right: 0; }
  .aboutinfo_box .container { padding-top: 90px; }
  .aboutinfo_box { padding-bottom: 90px; }
  .px-sm-5 { padding-left: 0 !important; padding-right: 0 !important; }
  .our_services_wrapper { padding-top: 80px; padding-bottom: 70px; }
  .our_services_wrapper .content { padding-right: 0; }
  .our_services_wrapper .accordion { margin-left: 0; margin-top: 40px; }
  .recent_work_wrapper { padding-bottom: 70px; }
  .homevideo_box { margin-top: -60px; margin-bottom: 70px; }
  .footer .content h3 { font-size: 64px; }
  .footer_links ul li:not(:last-child) { margin-right: 26px; }
  .design, .recent_man, .footer_man { display: none; }
  h2 { font-size: 46px; }
  h3, .aboutinfo_box h1 { font-size: 36px; }
  .aboutinfo_box p { font-size: 22px; }
  .btn { min-width: 0; width: 100%; max-width: 320px; font-size: 17px; }
}
/* Four service tiles go 2-up at tablet width and 1-up on a phone: at 375 two
   long service names in adjacent 180px columns ran into each other. This has
   to sit after the block above, which re-widens .col-lg-3 back to 50%. */
@media (max-width: 640px) { .col-lg-3 { width: 100%; } }

/* ==========================================================================
   12b. the lower half
   Three more drawings per page, below the green section, so the bottom of the
   page carries as much as the top does. Each figure is a 3:2 box on one of the
   three grounds the contrast table already measures; nothing here introduces a
   colour pair that is not gated.
   ========================================================================== */
.proof_wrapper { background: var(--paper); padding: 104px 0 112px; }
.proof_wrapper .section_title { margin-bottom: 66px; }
.proof_row { row-gap: 40px; }
.proof_row figure { position: relative; margin: 0 0 18px; aspect-ratio: 3 / 2;
  overflow: hidden; background: var(--wash); }
.proof_row figure.alt { background: var(--wash-2); }
.proof_row figure.alt2 { background: var(--field); }
.proof_row figure .illo { --illo-bg: var(--wash); }
.proof_row figure.alt .illo { --illo-bg: var(--wash-2); }
.proof_row figure.alt2 .illo { --illo-bg: var(--field); }
.proof_cap { display: block; color: var(--brand-ink); font-size: 26px;
  font-family: var(--f-display); font-weight: 700; line-height: 1.06;
  text-transform: uppercase; letter-spacing: .01em; }
.proof_cap:before { display: block; width: 46px; height: 6px; margin-bottom: 14px;
  background: var(--accent-ink); content: ""; }
@media (max-width: 900px) {
  .proof_wrapper { padding: 76px 0 80px; }
  .proof_wrapper .section_title { margin-bottom: 48px; }
  .proof_cap { font-size: 24px; }
}
@media (max-width: 640px) {
  .proof_wrapper { padding: 62px 0 66px; }
  .proof_row { row-gap: 32px; }
  .proof_cap { font-size: 22px; }
}


/* ==========================================================================
   13. the green section
   Deep-green ground, Inter/Poppins, its own restrained rhythm. Every value
   below is the client's Bridge palette verbatim. It is declared last so it
   survives the responsive blocks above without needing a copy in each of
   them, and it redeclares the illustration custom properties inside itself,
   which is the whole reason the two drawings in here come out in this
   palette without a second drawing system.
   ========================================================================== */
.bridge {
  --bridge-brand: #173c2c; --bridge-strong: #0d2d20; --bridge-accent: #4f6f57;
  --bridge-soft: #e5eee4;  --bridge-surface: #fffefa; --bridge-signal: #b45f2a;
  --bridge-signal-soft: #f9e8da; --bridge-border: #d4d9cd; --bridge-radius: 18px;
  /* the drawings inside this section, repainted by variable only */
  --illo-bg: transparent; --wash: #1f4a37; --wash-2: #1f4a37;
  --brand-ink: #e5eee4; --accent-ink: #dd9a63; --brand-dp: #0d2d20;
  --accent: #4f6f57; --hero: #b45f2a; --paper: #fffefa;
  position: relative; padding: 124px 0; margin-bottom: 40px;
  background-image: linear-gradient(var(--bridge-brand) 0%, var(--bridge-strong) 100%);
  font-family: "Inter", var(--f-body);
}
.bridge .row { align-items: center; row-gap: 56px; }
.bridge_eyebrow { color: var(--bridge-signal-soft); font-family: "Inter", var(--f-body);
  font-size: 14px; font-weight: 700; line-height: 1.2; letter-spacing: .24em;
  text-transform: uppercase; margin-bottom: 26px; }
.bridge h2 { color: var(--bridge-surface); font-family: "Poppins", var(--f-display);
  font-size: clamp(31px, 3.8vw, 52px); font-weight: 600; line-height: 1.08;
  letter-spacing: -.4px; text-transform: none; padding-bottom: 28px; }
.bridge_body { color: var(--bridge-soft); font-family: "Inter", var(--f-body);
  font-size: clamp(17px, 1.5vw, 20px); font-weight: 400; line-height: 1.62;
  max-width: 34em; margin-bottom: 38px; }
.bridge_points { margin: 0; padding: 0; list-style: none;
  border-top: 1px solid var(--bridge-accent); }
.bridge_points li { display: flex; align-items: center; gap: 16px; padding: 17px 0;
  border-bottom: 1px solid var(--bridge-accent); color: var(--bridge-soft);
  font-family: "Inter", var(--f-body); font-size: 15px; font-weight: 600;
  line-height: 1.4; letter-spacing: .1em; text-transform: uppercase; }
.bridge_points li::before { content: ""; flex: 0 0 auto; width: 9px; height: 9px;
  border-radius: 50%; background: var(--bridge-signal); }
.bridge_art { position: relative; display: flex; align-items: center;
  justify-content: center; min-height: 400px; }
.bridge_art figure { margin: 0; }
.bridge_art .seal_fig { width: min(340px, 72%); transform: translate(-8%, -6%); }
.bridge_art .motif_fig { position: absolute; right: 0; bottom: 4%; width: 208px;
  box-sizing: border-box; padding: 18px; background: var(--bridge-strong);
  border: 1px solid var(--bridge-accent); border-radius: var(--bridge-radius);
  box-shadow: 0 18px 50px #173c2c1c; }
.bridge .illo { width: 100%; height: auto; }
.bridge .seal_mono { fill: var(--bridge-surface); font-family: "Poppins", var(--f-display);
  font-size: 92px; font-weight: 600; letter-spacing: .02em; }
@media (max-width: 900px) {
  .bridge { padding: 116px 0 84px; }
  .bridge_eyebrow { margin-bottom: 30px; }
  .bridge_art { min-height: 320px; }
  .bridge_art .motif_fig { width: 168px; right: 4%; }
}
@media (max-width: 640px) {
  /* The heading sat 66px off the top of the section with margin-top:0, which
     on a phone reads as the wording being pushed against the colour change.
     Doubled, and the eyebrow-to-heading gap opened with it: at 375 the eyebrow
     takes three lines, so the two need daylight between them to read as two
     things rather than one block. */
  .bridge { padding: 132px 0 74px; }
  .bridge_eyebrow { font-size: 13px; line-height: 1.5; margin-bottom: 34px; }
  .bridge h2 { line-height: 1.16; padding-bottom: 30px; }
  .bridge_body { margin-bottom: 32px; }
  .bridge_art { min-height: 260px; }
  .bridge_art .seal_fig { width: 64%; }
  .bridge_art .motif_fig { width: 132px; right: 2%; padding: 12px; }
  .bridge .seal_mono { font-size: 96px; }
}
"""


# ------------------------------------------------------------------ markup
def header_html(site, mark, tagline, nav, tel):
    tel_html = ('<a href="tel:%s" class="tel_link">%s <span class="linkBtn">&#8250;</span></a>'
                % (tel[0], e(tel[1]))) if tel else ""
    items = "".join('<li class="menu-item"><a href="%s">%s</a></li>' % (h, e(l)) for l, h in nav)
    return """  <header class="header">
    <div class="container">
      <div class="row">
        <div class="col-md-12 d-flex align-items-center justify-content-between">

          <div class="logo">
            <div class="logo_caption" style="--cap-ch:%(cap_ch)d"><h4><a href="%(home)s">%(tagline)s</a></h4></div>
            <a href="%(home)s">
              <span id="header_logo">%(name)s</span>
              %(mark)s
            </a>
          </div>

          <div class="mobile_menubtn">
            <strong>MENU</strong>
            <button id="nav-icon3" type="button" aria-label="Show Menu" aria-expanded="false" aria-controls="mainnav">
              <span></span><span></span><span></span><span></span>
            </button>
          </div>

          <div class="mainnav_wrapper" id="mainnav">
            <nav aria-label="Main"><ul id="menu-main_menu">%(items)s</ul></nav>
            %(tel)s
          </div>

          <div class="olay"></div>
        </div>
      </div>
    </div>
  </header>""" % dict(home=site["home"], tagline=e(tagline), name=e(site["name"]),
                      mark=mark, items=items, tel=tel_html,
                      cap_ch=max(8, len(tagline)))


def page(site):
    return """<!DOCTYPE html>
<html lang="en" data-site="%(slug)s">
<head>
<meta charset="utf-8">
<title>%(title)s</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="%(desc)s">
<meta name="robots" content="noindex, nofollow">
<!-- Error ledger. Nothing outside the document can see an error that fired
     before a listener could be attached from the parent frame, so the page
     keeps its own and /audit.html reads it. Resource failures land here too,
     because window 'error' fires in the capture phase for a link, image, or
     <script> that 404s. -->
<script>window.__ERR__=[];addEventListener('error',function(e){window.__ERR__.push(e.target&&e.target.src?'load failed: '+e.target.src:String(e.message||e.type))},true);addEventListener('unhandledrejection',function(e){window.__ERR__.push('rejection: '+e.reason)});</script>
<!-- The reference build's Adobe kit (verveine + bebas-neue-pro) is domain-locked
     and cannot resolve here, so it is not requested at all. The Google fallbacks
     in the stack below are what renders. -->
%(cdn)s
</head>
<body class="home no-touch">
<a class="skip-link" href="#site-content" style="position:absolute;left:-9999px">Skip to the content</a>
%(defs)s
<div class="wrapper">

%(header)s

  <!-- ============================== HERO ============================== -->
  <div class="homeslider_wrapper">
    <section class="homeslider">
      <div class="backbgbox">
        <div class="backvid">%(hero_art)s</div>
      </div>
    </section>
    <div class="home_logo">
      <figure>%(hero_mark)s</figure>
    </div>
  </div>

  <section class="homevideo_box" id="site-content">
    <div class="container">
      <div class="row">
        <div class="col-md-11 col-lg-10 m-auto">
          <div class="homevideo">
            <div class="video_frame">%(frame)s</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ============================ STATEMENT =========================== -->
  <section class="aboutinfo_box" id="about">
    <div class="container">
      <div class="row">
        <div class="col-md-12 px-4 px-sm-5 text-center">
          %(statement)s
        </div>
      </div>
      <div class="design_left design">%(dl)s</div>
      <div class="design_middle design">%(dm)s</div>
      <div class="design_right design">%(dr)s</div>
    </div>
  </section>

  <!-- =========================== WORK / SERVICES ====================== -->
  <section class="recent_work_wrapper" id="work">
    <div class="container">
      <div class="row">
        <div class="col-md-12">
          <div class="section_title text-center wow">
            <h2 data-split>%(work_h2)s</h2>
            <div class="zigzag"><span class="zz1"></span><span class="zz2"></span><span class="zz3"></span></div>
          </div>
          <div class="row recent_work_list">
%(cards)s
          </div>
%(tiles)s
          <div class="text-center">
            <a class="btn btn-warning" href="%(work_cta_href)s">%(work_cta)s</a>
          </div>
        </div>
      </div>
    </div>
  </section>
%(bridge)s
%(proof)s
  <!-- ============================ MARK STRIP ========================== -->
  <section class="client_wrapper">
    <div class="container">
      <div class="row">
        <div class="col-md-12">
          <ul class="client_carousel mark_strip" aria-label="%(band_label)s">
%(band)s
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- ============================ ACCORDION =========================== -->
  <section class="our_services_wrapper" id="how">
    <div class="container">
      <div class="row">
        <div class="col-md-6 content wow" data-wow-offset="100">
          <h2 data-split>%(acc_h2)s</h2>
          <p>%(acc_p)s</p>
          <a class="btn btn-warning" href="%(acc_cta_href)s">%(acc_cta)s</a>
        </div>
        <div class="col-md-6">
          <div class="accordion accordion-flush" id="accordion1">
%(accordion)s
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ============================= FOOTER ============================= -->
  <footer class="footer backbgbox" id="contact">
    <div class="container">
      <div class="row">
        <div class="col-md-12 text-center">
          <div class="content">
            <h3>%(foot_script)s</h3>
            <h2>%(foot_h2)s</h2>
            <p>%(foot_p)s</p>
            %(addr)s
            <a href="%(foot_cta_href)s" class="btn btn-warning">%(foot_cta)s</a>
          </div>
          <div class="footer_links"><ul id="menu-footer_menu">%(foot_links)s</ul></div>
          <div class="copyright_box">
            <p>%(copyright)s</p>
          </div>
        </div>
      </div>
      <div class="footer_man wow">%(footer_art)s</div>
    </div>
  </footer>

</div><!-- /.wrapper -->

%(scripts)s
</body>
</html>
""" % site


# ------------------------------------------------------------------ pieces
def svg_asset(name, color_role="accent-ink"):
    """The abstract statement-block decorations, painted with the accent."""
    return illustrations.DESIGN[name.split("-")[1]].replace(
        "<svg ", '<svg style="color:var(--%s)" ' % color_role, 1)


def wordmark(name, big=False):
    """Typographic lockup for a prospect without a usable source logo file.

    The lockup has to FILL its panel, and how big it can be set depends
    entirely on how long the business's name is - "Weathers Motors" and
    "Advance Exterior Solutions" cannot share one font-size and both look
    deliberate. So the longest line's character count travels with the
    element and the stylesheet divides the panel by it. 0.42em is the
    measured average cap advance of the display face, with room to spare.
    """
    words = name.replace("&", "and").split()
    if len(words) > 2:
        mid = (len(words) + 1) // 2
        lines = [" ".join(words[:mid]), " ".join(words[mid:])]
    else:
        lines = words
    return ('<span class="wordmark" style="--wm-ch:%d">%s<span class="rule"></span></span>'
            % (max(len(l) for l in lines),
               "".join("<span>%s</span>" % e(l) for l in lines)))


LOGO_PX = {}     # slug -> (w, h) of the emitted PNG, filled in by main()
FIELD_EDGE = {}  # slug -> share of the emitted PNG's border that is still opaque

# Every logo file in this batch was captured small - 102x88 at the smallest,
# 400x41 at the widest. Keep the conservative raster cap, but prefer the exact
# first-party mark over a synthetic replacement when a source file exists.
CAP = 1.4          # hard ceiling: display width / native pixel width
HERO_MAX = 560     # past this a mark stops being a mark and becomes a banner


def logo_cap(slug):
    """The widest this file may ever be painted, in CSS px, from the file."""
    w, _ = LOGO_PX.get(slug, (0, 0))
    return int(round(w * CAP))


def hero_uses_file(slug):
    """Use the exact first-party mark whenever a source file exists."""
    return P[slug]["logo"] == "png"


def hero_route(slug):
    """Every prospect uses the same calm identity stage requested by the client.

    The animated service illustration is moved below the fold. The hero holds
    only the exact source logo, or the existing typographic fallback when no
    source logo file exists, on the site's solid dark field.
    """
    if hero_uses_file(slug):
        return "flat", "exact first-party logo on the requested solid hero field"
    if CONTENT.get(slug, {}).get("source_status"):
        return "flat", "labelled source-review pending state (no source logo file)"
    return "flat", "typographic fallback on the requested solid hero field (no source logo file)"


def prospect_mark(slug, name, big):
    """One mark, at a size the source file can actually carry.

    The cap is computed from the PNG and travels with the element as --cap.
    In the hero, the exact first-party file remains the identity even when its
    conservative display cap is smaller than the slot. Source-pending routes
    use a labelled neutral state; only legacy routes without source evidence
    use the typographic fallback.
    """
    cap = logo_cap(slug) if P[slug]["logo"] == "png" else 0
    source_pending = bool(CONTENT.get(slug, {}).get("source_status"))
    if not big:
        if not cap:
            if source_pending:
                return ('<span class="markbox pending_mark" aria-label="%s identity; source review pending">'
                        '<span class="pending_mark_label">Source review pending</span></span>' % e(name))
            return '<span class="markbox">%s</span>' % wordmark(name, False)
        w, h = LOGO_PX[slug]
        header_w = min(cap, int(round(w * 70.0 / h)))
        return ('<span class="markbox"><img src="/assets/logos/%s.png?v=20260903-logo-clarity" alt="%s logo" '
                'width="%d" height="%d" style="--cap:%dpx;--header-w:%dpx"></span>'
                % (slug, e(name), w, h, cap, header_w))

    # Hero: no illustration and no extra panel. The identity sits directly on
    # the full solid field, matching the approved homepage logo treatment.
    if hero_uses_file(slug):
        w, h = LOGO_PX[slug]
        shown = min(cap, HERO_MAX)
        inner = ('<img src="/assets/logos/%s.png" alt="%s logo" width="%d" height="%d" '
                 'style="--cap:%dpx;--markw:%dpx">'
                 % (slug, e(name), shown, int(round(h * shown / float(w))), cap, shown))
    else:
        inner = ('<span class="pending_mark_label">Source review pending</span>'
                 if source_pending else wordmark(name, True))
    return '<span class="markbox">%s</span>' % inner


STOP = {"the", "and", "of", "a", "at", "inc", "llc", "co"}


def initials(name):
    words = [re.sub(r"[^A-Za-z]", "", w) for w in name.split()]
    words = [w for w in words if w and w.lower() not in STOP]
    return "".join(w[0] for w in words[:2]).upper() or "P"


def card(cls, fig, title, href):
    return """            <div class="%s">
              <div class="recent_work">
                %s
                <h5>%s</h5>
                <div class="star_box"><span class="st1"></span><span class="st2"></span><span class="st3"></span></div>
                <a href="%s" class="whole_box_link">%s</a>
              </div>
            </div>""" % (cls, fig, e(title), href, e(title))


def cards_html(items, hub=False, slug=None):
    """Returns (feature row, tile row).

    A site has three drawings. The old grid cycled them across five or six
    equal cards, so each drawing appeared twice on one page and the repeat was
    the first thing you saw. Now the hero takes drawing 0 and the grid takes
    drawings 1 and 2 at double width; the remaining services are numbered
    typographic tiles. Three drawings, three placements, no repeat.
    """
    if hub:
        out = [card("col-md-6 col-lg-4",
                    '<figure class="mark">%s<small>%s</small></figure>'
                    % (prospect_mark(s, name, False)
                       .replace('class="markbox"', 'class="cardmark"'), e(loc)),
                    name, "/sites/%s/" % s)
               for s, name, loc in items]
        return "\n".join(out), ""

    feature = [card("col-md-6",
                    '<figure class="tile%s">%s</figure>'
                    % ("" if i == 0 else " alt", site_svg(slug, i + 1)),
                    it["title"], "#how")
               for i, it in enumerate(items[:2])]
    rest = items[2:]
    cls = "col-md-6 col-lg-3" if len(rest) > 3 else "col-md-6 col-lg-4"
    tiles = [card(cls,
                  '<figure class="num%s"><span class="idx">%02d</span>'
                  '<span class="bar"></span></figure>'
                  % (["", " alt", " alt2"][i % 3], i + 3),
                  it["title"], "#how")
             for i, it in enumerate(rest)]
    return "\n".join(feature), "\n".join(tiles)


def proof_html(slug, indices, heading):
    """The three drawings below the green section.

    The hero and the two grid cards carry the subject - what the business
    makes. These carry the process and the proof around it: the bench, the
    material, the finished result, the block it stands on. Each one still
    appears exactly once on the page, and each one is captioned in the
    business's own vocabulary.

    Where the hero has dropped its drawing (a mark with a baked-in field gets a
    flat hero to itself), that drawing lands here instead, so every page ends
    on six regardless of which route its logo took.
    """
    cls = "col-md-6 col-lg-3" if len(indices) > 3 else "col-md-6 col-lg-4"
    figs = "\n".join(
        '            <div class="%s">\n'
        '              <figure class="%s">%s</figure>\n'
        '              <span class="proof_cap">%s</span>\n'
        '            </div>'
        % (cls, ("proof", "proof alt", "proof alt2")[i % 3],
           site_svg(slug, n), e(illustrations.caption(slug, n) if slug in illustrations.ART
                               else "Source review pending %02d" % (n + 1)))
        for i, n in enumerate(indices))
    return """
  <!-- ============================= LOWER HALF ========================= -->
  <section class="proof_wrapper" id="inside">
    <div class="container">
      <div class="row">
        <div class="col-md-12">
          <div class="section_title text-center wow">
            <h2 data-split>%s</h2>
            <div class="zigzag"><span class="zz1"></span><span class="zz2"></span><span class="zz3"></span></div>
          </div>
        </div>
      </div>
      <div class="row proof_row">
%s
      </div>
    </div>
  </section>
""" % (e(heading), figs)


def strip_html(items):
    """The stripe band, set once. Nothing here repeats and nothing here is a
    logo - the client asked for the repeating-mark treatment to go."""
    return "\n".join("            <li>%s</li>" % e(t) for t in items)


def bridge_html(slug, name, eyebrow, heading, body, points):
    """The green section. Copy is the business's own; the two visuals are the
    monogram seal and that business's motif, neither of which appears
    anywhere else on the page."""
    seal, motif = illustrations.bridge_pair(slug, initials(name), name)
    return """
  <!-- ========================= THE GREEN SECTION ====================== -->
  <section class="bridge">
    <div class="container">
      <div class="row">
        <div class="col-md-6 bridge_copy">
          <p class="bridge_eyebrow">%s</p>
          <h2 id="bridge-h">%s</h2>
          <p class="bridge_body">%s</p>
          <ul class="bridge_points">
%s
          </ul>
        </div>
        <div class="col-md-6 bridge_art">
          <figure class="seal_fig">%s</figure>
          <figure class="motif_fig">%s</figure>
        </div>
      </div>
    </div>
  </section>
""" % (e(eyebrow), e(heading), e(body),
       "\n".join("            <li>%s</li>" % e(t) for t in points), seal, motif)


def accordion_html(items):
    out = []
    for i, (title, body, bullets) in enumerate(items, 1):
        ul = ('<ul class="plain"><li>%s</li></ul>' % e(bullets)) if bullets else ""
        out.append("""            <div class="accordion-item">
              <div class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#acc%d" aria-expanded="false" aria-controls="acc%d">%s</button>
              </div>
              <div id="acc%d" class="accordion-collapse collapse" data-bs-parent="#accordion1">
                <div class="accordion-body">
                  <p>%s</p>%s
                </div>
              </div>
            </div>""" % (i, i, e(title), i, e(body), ul))
    return "\n".join(out)


def strike_heading(lead, struck, script_word):
    """Papa's 'Our SERVICES/Niche' device: a word struck through with a
    handwritten replacement typed over it."""
    return ('%s <span class="strike_out">%s<strong class="strike_replace" '
            'style="--type-w:%dch">%s</strong></span>'
            % (e(lead), e(struck), max(6, len(script_word)), e(script_word)))


def about_split(text, head=420, tail=330):
    """The accordion carries the opening of a business's About copy and the
    green section carries the next part of the same passage. Both are that
    business's own words and neither repeats the other."""
    if len(text) <= head:
        return text, ""
    lead = text[:head].rsplit(". ", 1)[0] + "."
    rest = text[len(lead):].strip()
    if len(rest) > tail:
        rest = rest[:tail].rsplit(". ", 1)[0] + "."
    return lead, rest


FOOT_LINKS = [("Overview", "#about"), ("What We Do", "#work"),
              ("How It Works", "#how"), ("Contact", "#contact")]


def build_prospect(slug):
    c, p = CONTENT[slug], P[slug]
    tel = (tel_href(c["phone"]), tel_text(c["phone"])) if tel_href(c["phone"]) else None
    town = (c["locality"].split("·")[0].split(",")[0].strip() or c["name"]).strip()

    primary = c["actions"][0] if c["actions"] else {"label": "Get in touch", "href": "#contact"}
    prim_href = "tel:" + tel[0] if (tel and primary["href"].startswith("tel")) else "#contact"

    # accordion: the prospect's own how-it-works steps, then their own FAQ
    acc = [(s["title"], s["body"], "Step %d of %d" % (i, len(c["steps"])))
           for i, s in enumerate(c["steps"], 1)]
    acc += [(q["q"], q["a"], "") for q in c["faq"]]

    addr = ""
    if c["address"] or tel:
        bits = []
        if tel:
            bits.append('<a href="tel:%s">%s</a>' % (tel[0], e(tel[1])))
        if c["address"]:
            bits.append(e(c["address"]))
        addr = '<p class="addr">%s</p>' % " &nbsp;&middot;&nbsp; ".join(bits)

    # the headline sits in Papa's video panel; the statement block keeps the lede
    frame = ('<p class="eyebrow">%s</p><h1>%s</h1><span class="rule"></span>'
             % (e(c["locality"]), e(c["h1"])))
    source_notice = ""
    if c.get("source_status"):
        source_notice = ('<p class="source_notice"><strong>Source review pending.</strong> %s '
                         '<a href="%s" target="_blank" rel="noopener noreferrer">Open official source</a></p>'
                         % (e(c.get("source_note")), e(c.get("source_url"))))
    statement = (source_notice + '<p>%s</p>\n          <a class="btn btn-warning" href="#work">%s</a>'
                 % (e(c["lede"]), e(c["services_eyebrow"] or "What we do")))

    lead, rest = about_split(c["about_body"])
    # the green section's heading is the business's own About headline where
    # that headline is a headline; several of these were extracted as the first
    # sentence of a paragraph ("F.M.", "In 1953, Stanley B."), and those fall
    # back to the About label instead of being rewritten here.
    head = c["about_h2"].strip()
    if len(head.split()) >= 3 and len(head) <= 60 and not head.endswith("."):
        b_eyebrow, b_head = c["about_eyebrow"], head
    else:
        b_eyebrow, b_head = c["locality"], c["about_eyebrow"]

    feature, tiles = cards_html(c["services"], slug=slug)
    # Drawing 0 stays in the lower proof section; the hero now carries the one
    # generated industry photograph assigned to this route.
    route = hero_route(slug)[0]
    lower = ([0] if route == "flat" else []) + [3, 4, 5]
    return dict(
        slug=slug, title=e(c["title"]), desc=e(c["description"]), cdn=CDN, defs=SPRITE_DEFS,
        scripts=SCRIPTS, name=c["name"], home="/sites/%s/" % slug,
        header=header_html(dict(home="/sites/%s/" % slug, name=c["name"]),
                           prospect_mark(slug, c["name"], False), c["script"] or c["locality"],
                           [("Overview", "#about"), ("What We Do", "#work"),
                            ("How It Works", "#how"), ("Contact", "#contact"),
                            ("All 20 previews", "/")], tel),
        hero_art=industry_hero(slug),
        hero_mark='<span class="hero_anchor" aria-hidden="true"></span>',
        frame=frame,
        statement=statement,
        dl=svg_asset("design-left"), dm=svg_asset("design-middle"), dr=svg_asset("design-right"),
        work_h2=c["services_eyebrow"] or "what we do",
        cards=feature,
        tiles=('          <div class="row recent_work_list work_tiles">\n%s\n          </div>'
               % tiles) if tiles else "",
        work_cta=primary["label"], work_cta_href=prim_href,
        bridge=bridge_html(slug, c["name"], b_eyebrow, b_head, rest or lead,
                           c["marquee"][:3]),
        proof=proof_html(slug, lower, "a closer look"),
        band_label="%s highlights" % c["name"],
        band=strip_html(c["marquee"]),
        acc_h2=strike_heading("How it", "WORKS", town),
        acc_p=e(lead),
        acc_cta=primary["label"], acc_cta_href=prim_href,
        accordion=accordion_html(acc),
        foot_script=e(c["script"] or c["locality"]), foot_h2=e(c["cta_h2"]),
        foot_p=e(c["cta_p"]), addr=addr,
        foot_cta=primary["label"], foot_cta_href=prim_href,
        foot_links="".join('<li class="menu-item"><a href="%s">%s</a></li>' % (h, e(l))
                           for l, h in FOOT_LINKS),
        copyright=(('%s. Unaffiliated local review preview built for Momentum 360. '
                    'Selected identity and source status come from the batch manifest; '
                    'no first-party copy is carried. <a href="/">Back to all 20 previews</a>'
                    if c.get("source_status") else
                    '%s. Unaffiliated design preview built for Momentum 360. Business '
                    'copy is quoted from the business\'s own website; the illustrations '
                    'are original work. <a href="/">Back to all 20 previews</a>')
                   % e(c["name"].rstrip("."))),
        footer_art="",
    )


HUB_INTRO = ("Twenty selected Pennsylvania prospect identities, rebuilt on one structure. "
             "Same fixed header and scroll swap, same 1310 grid, and an explicit source-review "
             "state for every route. Existing source-backed illustrations remain in the generator; "
             "blocked routes carry labelled placeholders instead of invented artwork.")

# The hub's own mark is the same typographic lockup the two businesses without
# a logo file carry - neutral, legible at 140px and at hero size, and owned
# here. The hub displays no third-party artwork of any kind.
# The hub's own hero: selected page outlines on a grid, each one breathing on its
# own delay. Original, generic, and it inherits the hub palette like the
# prospect drawings inherit theirs.
HUB_HERO = ('<svg class="illo hubhero" viewBox="0 0 600 400" '
            'preserveAspectRatio="xMidYMid slice" role="img" focusable="false">'
            '<title>Twenty selected preview pages laid out on one grid</title>'
            '<rect class="field" width="600" height="400"/>'
            + "".join(
                '<g class="pulse d%d"><rect class="wash2" x="%d" y="%d" width="86" '
                'height="112" rx="10"/><rect class="accd" x="%d" y="%d" width="86" '
                'height="18" rx="9"/><rect class="solid" x="%d" y="%d" width="54" '
                'height="8" rx="4"/><rect class="solid" x="%d" y="%d" width="66" '
                'height="8" rx="4"/></g>'
                % (i % 4 + 1, 66 + (i % 5) * 96, 82 + (i // 5) * 140,
                   66 + (i % 5) * 96, 82 + (i // 5) * 140,
                   78 + (i % 5) * 96, 122 + (i // 5) * 140,
                   78 + (i % 5) * 96, 140 + (i // 5) * 140)
                for i in range(10))
            + '</svg>')


def build_hub():
    cards = [(s, CONTENT[s]["name"], CONTENT[s]["locality"]) for s in SLUGS]
    real = [s for s in SLUGS if P[s]["logo"] == "png"]
    flat = [s for s in SLUGS if hero_route(s)[0] == "flat"]

    acc = [
        ("Structure", "Every page is the same skeleton: a fixed 100px header whose script "
         "tagline swaps for the mark once the hero clears the top of the viewport, a "
         "full-height solid identity hero with the mark centered on one calm field, a statement "
         "structure, a work grid of two large drawings and numbered tiles, the deep-green "
         "section, three more drawings under it, a typographic band over its stripe, an "
         "accordion, and the gradient footer.",
         "Container 1310 &middot; Content x 73 &middot; Header 100px"),
        ("Motion", "The header swap fires at scrollY 486 on a 1440x900 viewport and runs "
         "0.8s cubic-bezier(.85,0,.15,1), translate(-500px) to 0 with opacity. The mark "
         "carries a six-second hop in both places it appears. Every illustration loops "
         "between 4 and 14 seconds, and all of it stops under prefers-reduced-motion.",
         "Swap 485 off / 486 on &middot; mark hop 6s"),
        ("Illustration", "Source-backed routes retain the incumbent original SVG library. "
         "The selected routes whose first-party imagery is unavailable use labelled source-review "
         "placeholders instead of invented scenes. Inline vector, no raster request for blocked "
         "routes, and every fill reads the existing custom-property contract.",
         "%d incumbent drawings &middot; labelled pending surfaces for this batch"
         % illustrations.count()),
        ("Colour", "Structure and motion are fixed; colour is not. Brand and accent are "
         "read from verified identity evidence where available. For blocked routes, a neutral "
         "review palette is used and explicitly marked as non-brand. Every surface then has its "
         "foreground computed rather than assumed, and the build fails if a pair misses AA.",
         "%d of %d palettes pass every text pair" % (len(ALL), len(ALL))),
        ("Logos", "Every prospect identity now uses the same quiet hero treatment: one "
         "centered identity treatment on the site's solid dark field. Exact first-party logo "
         "files are used only when verified; the selected blocked routes carry a typographic "
         "review label and no unverified mark. No mark sits on an illustrated background, "
         "nested card, or added plate."
         ,
         "%d exact logos &middot; %d solid identity heroes &middot; %d source-pending heroes"
         % (len(real), len(flat), len([s for s in SLUGS if s not in HERO_ALTS]))),
    ]

    return dict(
        slug="hub", title="Prospect previews &#8212; twenty selected Pennsylvania identities",
        desc=e(HUB_INTRO), cdn=CDN, defs=SPRITE_DEFS, scripts=SCRIPTS,
        name="Prospect previews", home="/",
        header=header_html(dict(home="/", name="Prospect previews"),
                           '<span class="markbox">%s</span>' % wordmark(
                               "Prospect Previews"),
                           "Twenty builds, one structure.",
                           [("The Twenty", "#work"), ("Structure", "#about"),
                            ("How It Works", "#how"), ("Contact", "#contact")], None),
        hero_art=HUB_HERO,
        hero_mark='<span class="markbox">%s</span>'
                  % wordmark("Prospect Previews", True),
        frame=('<p class="eyebrow">Momentum 360 &middot; prospect previews</p>'
               '<h1>Twenty selected identities, one structure</h1>'
               '<span class="rule"></span>'),
        statement=('<p>%s</p>\n          <a class="btn btn-warning" href="#work">See the twenty</a>'
                   % e(HUB_INTRO)),
        dl=svg_asset("design-left"), dm=svg_asset("design-middle"), dr=svg_asset("design-right"),
        work_h2="the twenty", cards=cards_html(cards, hub=True)[0], tiles="",
        work_cta="Open the first preview", work_cta_href="/sites/%s/" % SLUGS[0],
        bridge=bridge_html("hub", "Prospect Previews", "About these previews",
                           "One structure, twenty review states",
                           "Every page here is the same skeleton and the same motion; what "
                           "changes between them is the verified identity state and source notes. This "
                           "section is the one place all twenty-one pages share the incumbent "
                           "bridge treatment. Blocked prospects keep neutral review palettes "
                           "until first-party identity evidence is approved.",
                           ["Twenty selected identities",
                            "%d incumbent drawings + pending placeholders"
                            % illustrations.count(),
                            "%d palettes, every text pair measured" % len(ALL)]),
        proof=proof_html("hub", [0, 1, 2], "how it is built"),
        band_label="What is fixed across all twenty-one pages",
        band=strip_html(["Twenty identities", "One structure", "%d palettes" % len(ALL),
                         "%d incumbent drawings" % illustrations.count(),
                         "Source-pending states are labelled",
                         "Every text pair measured", "Fixed 100px header",
                         "Container 1310"]),
        acc_h2=strike_heading("Built the", "SAME WAY", "twenty times"),
        acc_p=("The geometry is held to the pixel across all twenty routes: the 1310 container, the "
               "73px content edge, the 100px band, the 254+15 carousel item, the 8000x250 "
               "stripe. What changes between them is the verified identity state and source notes."),
        acc_cta="See the twenty", acc_cta_href="#work",
        accordion=accordion_html(acc),
        foot_script="Twenty builds,", foot_h2="one structure",
        foot_p=("Each selected route is a local review page. Open any of the twenty and scroll past the "
                "hero to watch the header swap."),
        addr="", foot_cta="Back to the twenty", foot_cta_href="#work",
        foot_links="".join('<li class="menu-item"><a href="%s">%s</a></li>' % (h, e(l))
                           for l, h in [("The Twenty", "#work"), ("Structure", "#about"),
                                        ("How It Works", "#how"), ("Contact", "#contact")]),
        copyright=("Unaffiliated local review study built for Momentum 360. Selected identity "
                   "fields and source statuses are retained from the batch manifest; the %d "
                   "incumbent illustrations and this index are original work."
                   % (illustrations.count() + illustrations.bridge_count()
                      + illustrations.hub_count())),
        footer_art="",
    )


# ------------------------------------------------------------------ emit
def contact_sheet():
    """/all.html - every page at 1440 wide, scaled into one grid. Dev/review
    only; it carries no client-facing copy."""
    cells = ",\n".join('["%s", "%s"]' % (s, CONTENT[s]["name"].replace('"', ""))
                       for s in SLUGS)
    return """<!doctype html><meta charset="utf-8"><title>Radar 20 &#8212; contact sheet</title>
<meta name="robots" content="noindex, nofollow">
<style>body{margin:0;background:#0f1113;color:#e8eaed;font:13px/1.4 system-ui,sans-serif}
h1{font:600 16px system-ui;margin:14px 16px 3px}
.sub{margin:0 16px 12px;color:#9aa0a6;font-size:12px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:11px;padding:0 16px 18px}
.cell{background:#17191c;border:1px solid #2a2d31;border-radius:9px;overflow:hidden}
.cap{padding:6px 9px;font-size:11px;color:#d2d6da;border-bottom:1px solid #2a2d31;
 white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.win{width:100%;height:286px;overflow:hidden;position:relative;background:#fff}
iframe{width:1440px;height:1760px;border:0;transform:scale(.2417);transform-origin:0 0;position:absolute;left:0;top:0}
</style>
<h1>Prospect previews &#8212; 20 selected routes + hub</h1>
<div class="sub"><a href="/" style="color:#8ab4f8">&#8592; hub</a> &middot; each page rendered at 1440 wide, scaled to fit</div>
<div class="grid" id="g"></div>
<script>
const S=[["", "HUB \u2014 all twenty"],
__CELLS__];
document.getElementById('g').innerHTML=S.map(([s,l])=>
 `<div class="cell"><div class="cap">${l}</div><div class="win"><iframe loading="lazy" title="${l}" src="${s?'/sites/'+s+'/':'/index.html'}"></iframe></div></div>`).join('');
</script>
""".replace("__CELLS__", cells)


def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, "w", encoding="utf-8", newline="\n").write(text)


def border_opacity(im):
    """Share of the image's one-pixel border that is still opaque. A cleaned
    mark leaves glyph edges on the border at worst; a mark that ships its own
    white sign panel or gold oval leaves most of it."""
    w, h = im.size
    px = im.load()
    b = [(x, y) for x in range(w) for y in (0, h - 1)] + \
        [(x, y) for y in range(h) for x in (0, w - 1)]
    return sum(1 for x, y in b if px[x, y][3] > 200) / float(len(b))


def unplate_logo(src, dst, tol=50, passes=8):
    """Copy a logo, dropping the flat background it was cropped on.

    Five of the eight files ship an opaque field, and with the plate chrome
    gone that field IS the plate. It is rarely one colour: these captures are
    layered - a gold frame around a grey field, a black rule around white -
    so one flood stops at the first edge and leaves a box behind. Each pass
    re-seeds from whatever colour is now exposed at the border and floods
    again, stopping when a pass clears almost nothing.

    Only pixels reachable from the edge are touched, so a colour that also
    appears inside the mark survives. If the result would be mostly empty the
    original is kept instead. Returns ((width, height), border opacity) either
    way - the caller needs the second number to decide whether the mark may be
    placed on a drawing at all.

    tol/passes were 30/4, which stopped one ring short on three of the eight:
    Golden Sea kept four gold corner nibs, Weathers kept the white square
    outside its oval. 50/8 clears both without eating into any of the marks -
    verified by rendering all eight over a mid-tone before and after.
    """
    from PIL import Image
    from collections import Counter
    im = Image.open(src).convert("RGBA")
    w, h = im.size
    px = im.load()
    border = [(x, y) for x in range(w) for y in (0, h - 1)] + \
             [(x, y) for y in range(h) for x in (0, w - 1)]
    cleared = 0

    def walk(visit):
        """BFS inward from the border, stepping through anything already
        cleared. `visit` decides what happens at each opaque pixel."""
        stack, seen = list(border), set()
        while stack:
            x, y = stack.pop()
            if (x, y) in seen or not (0 <= x < w and 0 <= y < h):
                continue
            seen.add((x, y))
            if px[x, y][3] < 250 or visit(x, y):
                stack += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]

    for _ in range(passes):
        # What the background actually is right now: the colours sitting on the
        # frontier between cleared space and the mark. Counted in coarse 16-step
        # buckets, because these captures are noisy - one flat white field
        # spreads across dozens of exact triples and no single one dominates.
        frontier, exact = Counter(), Counter()

        def survey(x, y):
            c = px[x, y][:3]
            frontier[tuple(v // 16 for v in c)] += 1
            exact[c] += 1
            return False              # stop here: this pixel IS the frontier

        walk(survey)
        if not frontier:
            break
        bucket, top = frontier.most_common(1)[0]
        # A flat field dominates its own frontier. Once the frontier is a spread
        # of antialiased glyph edges the background is gone, and the next colour
        # to clear would be the mark itself.
        if top < .4 * sum(frontier.values()):
            break
        target = max((c for c in exact if tuple(v // 16 for v in c) == bucket),
                     key=lambda c: exact[c])
        hit = [0]

        def clear(x, y, _t=target, _h=hit):
            p = px[x, y]
            if max(abs(p[i] - _t[i]) for i in range(3)) > tol:
                return False
            px[x, y] = (p[0], p[1], p[2], 0)
            _h[0] += 1
            return True

        walk(clear)
        hit = hit[0]
        cleared += hit
        if hit < w * h * .005:
            break

    if w * h - cleared < 300:                      # nothing left worth showing
        im = Image.open(src).convert("RGBA")
    bbox = im.getchannel("A").getbbox()
    if bbox:
        im = im.crop(bbox)
    im.save(dst)
    return im.size, border_opacity(im)


def main():
    for d in ("sites", "css", "js", "assets"):
        shutil.rmtree(os.path.join(ROOT, d), ignore_errors=True)

    js = open(os.path.join(SRC, "papa-template", "js", "papa.js"), encoding="utf-8").read()

    # No Lottie on any page any more, so the loader and its mount list go with
    # it - one less library request and nothing left pointing at /assets/lottie.
    start = js.index("  /* ---------------------------------------------------------------- lottie")
    end = js.index("  /* --------------------------------------------------- letter-split headings")
    js = js[:start] + js[end:]

    # The marquee is gone, so the carousel is gone, and with it the last use of
    # jQuery on any page. Neither library is requested any more.
    o0 = js.index("  /* ---------------------------------------------------------- owl carousel")
    o1 = js.index("  /* ------------------------------------------------------- header swap + wow")
    js = js[:o0] + js[o1:]
    js = js.replace("(Owl config, GSAP ScrollTrigger header swap)",
                    "(GSAP ScrollTrigger header swap)")
    js = js.replace("Library set: jQuery 3.7.1, Owl 2.3.4, GSAP 3.12.5 + ScrollTrigger,",
                    "Library set: GSAP 3.12.5 + ScrollTrigger,")
    assert "owlCarousel" not in js and "jQuery" not in js, "a carousel reference survived"
    anchor = """      });
    });
  }
"""
    assert js.count(anchor) == 1, "ScrollTrigger anchor is not unique"
    js = js.replace(anchor, """      });
    });

    /* ScrollTrigger caches each trigger's start position when the trigger is
       created. The hero holds a logo image that can decode late, so re-measure
       once the page has settled or the swap point is computed against a stale
       layout. */
    addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
""", 1)
    write(os.path.join(ROOT, "js", "site.js"), scrub(js, "site.js"))
    # dev-only harnesses: /verify.html measures one page in depth, /audit.html
    # sweeps the selected twenty routes at three widths in a single load
    shutil.copy2(os.path.join(ROOT, "build", "verify.js"),
                 os.path.join(ROOT, "js", "verify.js"))
    audit = open(os.path.join(ROOT, "build", "audit.html"), encoding="utf-8").read()
    audit_slugs = [""] + SLUGS
    audit = re.sub(r"const SLUGS = \[.*?\];",
                   "const SLUGS = %s;" % json.dumps(audit_slugs, ensure_ascii=False),
                   audit, count=1, flags=re.S)
    write(os.path.join(ROOT, "audit.html"), audit)

    # Assets: authoritative logos remain available in the header and lower
    # sections. The centered hero logo is replaced by one generated editorial
    # image per prospect, copied from stable source assets on every rebuild.
    os.makedirs(os.path.join(ROOT, "assets", "logos"), exist_ok=True)
    for s in SLUGS:
        src = os.path.join(SRC, "logos", s + ".png")
        if os.path.exists(src):
            LOGO_PX[s], FIELD_EDGE[s] = unplate_logo(
                src, os.path.join(ROOT, "assets", "logos", s + ".png"))

    industry_src = os.path.join(SRC, "industry")
    industry_files = sorted(f for f in os.listdir(industry_src) if f.endswith("-align-hero.webp"))
    expected_industry = sorted(s + "-align-hero.webp" for s in SLUGS if s in HERO_ALTS)
    assert set(expected_industry).issubset(industry_files), \
        "industry hero source set is missing a source-backed route"
    os.makedirs(os.path.join(ROOT, "assets", "industry"), exist_ok=True)
    for filename in expected_industry:
        shutil.copy2(os.path.join(industry_src, filename),
                     os.path.join(ROOT, "assets", "industry", filename))
    shutil.copy2(os.path.join(SRC, "grain.svg"), os.path.join(ROOT, "assets", "grain.svg"))
    if expected_industry:
        shutil.copy2(os.path.join(SRC, "ALIGN-IMAGE-PROVENANCE.json"),
                     os.path.join(ROOT, "assets", "ALIGN-IMAGE-PROVENANCE.json"))
    else:
        write(os.path.join(ROOT, "assets", "ALIGN-IMAGE-PROVENANCE.json"), json.dumps({
            "batch_date": "2026-09-05",
            "images": [],
            "note": "No source-backed industry images were carried into this batch; blocked routes use labelled review surfaces."
        }, indent=2) + "\n")

    write(os.path.join(ROOT, "css", "site.css"), build_css())
    write(os.path.join(ROOT, "index.html"), page(build_hub()))
    for s in SLUGS:
        write(os.path.join(ROOT, "sites", s, "index.html"), page(build_prospect(s)))

    # /all.html - the contact sheet. It used to be hand-dropped into dist/,
    # which main() wipes on every run, so it is emitted here off SLUGS instead
    # and cannot drift out of sync with the pages it frames.
    write(os.path.join(ROOT, "all.html"), contact_sheet())

    write(os.path.join(ROOT, "netlify.toml"),
          '[build]\n  publish = "."\n\n'
          '[[headers]]\n  for = "/*"\n  [headers.values]\n'
          '    X-Content-Type-Options = "nosniff"\n'
          '    X-Frame-Options = "SAMEORIGIN"\n'
          '    Referrer-Policy = "strict-origin-when-cross-origin"\n')
    write(os.path.join(ROOT, "_headers"),
          "/*\n  X-Content-Type-Options: nosniff\n  X-Frame-Options: SAMEORIGIN\n"
          "  Referrer-Policy: strict-origin-when-cross-origin\n"
          "  X-Robots-Tag: noindex, nofollow\n\n"
          "/assets/*\n  Cache-Control: public, max-age=604800\n")

    # Publish set. `_source/` holds full copies of the businesses' live pages -
    # working input, not something to put on a public URL - and `build/` is the
    # generator. Deploying dist/ keeps the same paths (/ and /sites/<slug>/)
    # with neither of those in it.
    dist = os.path.join(ROOT, "dist")
    shutil.rmtree(dist, ignore_errors=True)
    # ignore_errors above swallows a locked file (a local http.server serving
    # dist will do it), which leaves the tree half-present; exist_ok keeps the
    # rebuild going instead of dying on the next line.
    os.makedirs(dist, exist_ok=True)
    for name in ("index.html", "all.html", "sites", "css", "js", "assets",
                 "netlify.toml", "_headers", "verify.html", "audit.html"):
        src_path = os.path.join(ROOT, name)
        dst_path = os.path.join(dist, name)
        if os.path.isdir(src_path):
            shutil.copytree(src_path, dst_path)
        else:
            shutil.copy2(src_path, dst_path)

    selected_drawings = sum(1 for slug in SLUGS if slug in illustrations.ART)
    print("hub + %d prospect pages, %d selected-route drawings + labelled pending surfaces "
          "+ %d for the green section + %d for the hub"
          % (len(SLUGS), selected_drawings, illustrations.bridge_count(),
             illustrations.hub_count()))
    print("\n%-32s %8s %8s %6s %10s   %s"
          % ("site", "native", "cap 1.4x", "edge", "hero route", "why"))
    for s in SLUGS:
        w, h = LOGO_PX.get(s, (0, 0))
        route, why = hero_route(s)
        print("%-32s %8s %8s %5.1f%% %10s   %s"
              % (s, "%dx%d" % (w, h) if w else "-", logo_cap(s) or "-",
                 FIELD_EDGE.get(s, 0) * 100, route, why))


if __name__ == "__main__":
    main()
