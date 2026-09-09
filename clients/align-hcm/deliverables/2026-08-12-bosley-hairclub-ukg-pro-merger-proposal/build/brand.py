"""Align HCM deck brand system.

Tokens and layout grid extracted from the two most recent Align HCM decks:
  - Align_HCM_SmartCare_Services.pptx (June 2026)  -> palette, 13.333in grid, footer + header block
  - Align_HCM_TPI_Composites_FIXED.pptx (April 2026) -> client-proposal slide order

Every hex below is lifted from those files, not invented.
"""

from pptx.dml.color import RGBColor
from pptx.util import Inches, Pt, Emu

# --- palette (exact, from ppt/slides/*.xml of the source decks) ---------------
ORANGE      = RGBColor(0xE9, 0x77, 0x22)   # #E97722 primary accent
ORANGE_DEEP = RGBColor(0xC0, 0x52, 0x1A)   # darkened accent for heat scale

# Brand orange is only 2.95:1 on white, so it fails as small text there while
# being perfectly fine on navy (5:1). These are same-hue darkenings used ONLY
# for orange type on light backgrounds — fills, rules and icons stay #E97722.
ORANGE_TEXT      = RGBColor(0xB0, 0x55, 0x12)  # 5.1:1 on white, 4.8:1 on the zebra tint
ORANGE_TEXT_DEEP = RGBColor(0x94, 0x48, 0x0F)  # 6.6:1 on white
NAVY        = RGBColor(0x23, 0x2E, 0x3E)   # #232E3E primary dark
NAVY_DEEP   = RGBColor(0x1D, 0x27, 0x35)   # #1D2735 deepest
NAVY_ELEV   = RGBColor(0x2B, 0x38, 0x49)   # #2B3849 raised panel on navy
SLATE       = RGBColor(0x87, 0x92, 0xA3)   # #8792A3 muted
SLATE_LT    = RGBColor(0xAE, 0xB9, 0xC8)   # #AEB9C8 light slate
BORDER      = RGBColor(0xDC, 0xE2, 0xE9)   # #DCE2E9 hairline
INK         = RGBColor(0x33, 0x33, 0x33)   # #333333 body copy
INK_2       = RGBColor(0x55, 0x60, 0x6E)   # #55606E secondary
WHITE       = RGBColor(0xFF, 0xFF, 0xFF)
CARD_BG     = RGBColor(0xF6, 0xF8, 0xFA)   # subtle tint of BORDER for light cards

# --- text -------------------------------------------------------------------
# SLATE / SLATE_LT / INK_2 came out of the source decks but were being used for
# running copy, where they read as washed-out gray. Body text now uses these
# instead; the source tokens stay for fills and rules only.
TEXT_ON_DARK   = RGBColor(0xED, 0xF2, 0xF8)  # body on navy — 12:1, reads white
MUTED_ON_DARK  = RGBColor(0xC7, 0xD2, 0xDF)  # labels/footers on navy — 7.8:1
TEXT_ON_LIGHT  = RGBColor(0x2B, 0x38, 0x49)  # body on white — 11:1
MUTED_ON_LIGHT = RGBColor(0x4A, 0x55, 0x63)  # footers/captions on white — 7.5:1

# --- edges ------------------------------------------------------------------
# The original #DCE2E9 hairline all but vanished on screen. Edges are brightened
# in two steps: a defining rule that carries structure, and a soft one for
# secondary separators that should be felt rather than seen.
BORDER_BRIGHT = RGBColor(0xC5, 0xCE, 0xDA)  # table row rules, outer edges
BORDER_SOFT   = RGBColor(0xE3, 0xE8, 0xEE)  # column separators inside tables
CARD_DARK_LINE = RGBColor(0x4A, 0x5C, 0x75)  # lit edge on a dark card, light bg
CARD_NAVY_LINE = RGBColor(0x55, 0x60, 0x6E)  # lit edge on a dark card, navy bg
ICON_CIRCLE    = NAVY_ELEV                   # disc behind an orange glyph

# navy ramp used by the timeline chips (light -> dark reads left -> right)
RAMP = [
    RGBColor(0x1D, 0x27, 0x35),
    RGBColor(0x26, 0x33, 0x4A),
    RGBColor(0x2F, 0x40, 0x59),
    RGBColor(0x3A, 0x4E, 0x6B),
    RGBColor(0x46, 0x5C, 0x7E),
    RGBColor(0x55, 0x60, 0x6E),
]

# --- type --------------------------------------------------------------------
# Body/UI is Calibri to match the house decks; headings are Cambria, which keeps
# the serif character of the source Bosley deck. Both ship with Office.
FONT_BODY = "Calibri"
FONT_HEAD = "Cambria"

# --- grid (from the SmartCare deck, 13.333 x 7.5in) --------------------------
SLIDE_W, SLIDE_H = 13.3333, 7.5
MARGIN = 0.75
CONTENT_W = 11.8333          # 0.75 -> 12.5833
EYEBROW_Y = 0.48
TITLE_Y = 0.78
RULE_Y = 1.52
SUB_Y = 1.62
BODY_TOP = 2.20
FOOTER_Y = 7.12


def _solid(shape, color):
    if color is None:
        shape.fill.background()
    else:
        shape.fill.solid()
        shape.fill.fore_color.rgb = color


def rect(slide, x, y, w, h, fill=None, line=None, line_w=0.75, radius=None, name=None):
    """Rounded or square rectangle at inch coordinates."""
    from pptx.enum.shapes import MSO_SHAPE
    shp = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE if radius else MSO_SHAPE.RECTANGLE,
        Inches(x), Inches(y), Inches(w), Inches(h))
    _solid(shp, fill)
    if line is None:
        shp.line.fill.background()
    else:
        shp.line.color.rgb = line
        shp.line.width = Pt(line_w)
    if radius:
        # adjustment is a fraction of the shorter side
        shp.adjustments[0] = min(0.5, radius / min(w, h))
    shp.shadow.inherit = False
    if name:
        shp.name = name
    return shp


def ellipse(slide, x, y, d, fill, name=None):
    from pptx.enum.shapes import MSO_SHAPE
    shp = slide.shapes.add_shape(MSO_SHAPE.OVAL, Inches(x), Inches(y), Inches(d), Inches(d))
    _solid(shp, fill)
    shp.line.fill.background()
    shp.shadow.inherit = False
    if name:
        shp.name = name
    return shp


def textbox(slide, x, y, w, h, name=None):
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    if name:
        tb.name = name
    return tb, tf


def write(tf, lines, defaults=None):
    """Fill a text frame.

    `lines` is a list of dicts:
      {text, size, bold, color, font, space_after, space_before, line_spacing,
       align, italic, spacing (char spacing in pt), caps}
    A dict may carry `runs` (list of dicts) instead of `text` for mixed runs.
    """
    from pptx.enum.text import PP_ALIGN
    d = {"size": 12, "bold": False, "color": INK, "font": FONT_BODY,
         "space_after": 0, "space_before": 0, "line_spacing": None,
         "align": "l", "italic": False, "spacing": None, "caps": False}
    if defaults:
        d.update(defaults)
    amap = {"l": PP_ALIGN.LEFT, "c": PP_ALIGN.CENTER, "r": PP_ALIGN.RIGHT, "j": PP_ALIGN.JUSTIFY}

    tf.clear()
    for i, spec in enumerate(lines):
        cfg = dict(d)
        cfg.update({k: v for k, v in spec.items() if k not in ("text", "runs")})
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = amap[cfg["align"]]
        if cfg["space_after"]:
            p.space_after = Pt(cfg["space_after"])
        if cfg["space_before"]:
            p.space_before = Pt(cfg["space_before"])
        if cfg["line_spacing"]:
            p.line_spacing = cfg["line_spacing"]

        runs = spec.get("runs") or [{"text": spec.get("text", "")}]
        for rspec in runs:
            rcfg = dict(cfg)
            rcfg.update({k: v for k, v in rspec.items() if k != "text"})
            r = p.add_run()
            txt = rspec.get("text", "")
            r.text = txt.upper() if rcfg["caps"] else txt
            f = r.font
            f.size = Pt(rcfg["size"])
            f.bold = rcfg["bold"]
            f.italic = rcfg["italic"]
            f.name = rcfg["font"]
            f.color.rgb = rcfg["color"]
            if rcfg["spacing"]:
                f._rPr.set("spc", str(int(rcfg["spacing"] * 100)))
    return tf


def anchor_middle(tf):
    from pptx.enum.text import MSO_ANCHOR
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE


def header(slide, eyebrow, title, subtitle=None, on_dark=False):
    """The standard Align HCM content-slide header block."""
    title_col = WHITE if on_dark else NAVY
    sub_col = TEXT_ON_DARK if on_dark else TEXT_ON_LIGHT

    _, tf = textbox(slide, MARGIN, EYEBROW_Y, 9.0, 0.30, name="Eyebrow")
    write(tf, [{"text": eyebrow}],
          {"size": 10.5, "bold": True, "color": ORANGE if on_dark else ORANGE_TEXT,
           "caps": True, "spacing": 1.4})

    _, tf = textbox(slide, MARGIN, TITLE_Y, CONTENT_W, 0.70, name="Title")
    write(tf, [{"text": title}], {"size": 32, "bold": True, "color": title_col,
                                  "font": FONT_HEAD})

    rect(slide, MARGIN, RULE_Y, 0.85, 0.045, fill=ORANGE, name="TitleRule")

    if subtitle:
        _, tf = textbox(slide, MARGIN, SUB_Y + 0.06, CONTENT_W, 0.34, name="Subtitle")
        write(tf, [{"text": subtitle}], {"size": 13, "color": sub_col})


def footer(slide, page, on_dark=False, total=None):
    """alignhcm.com | Confidential | Align HCM . NN  — the house footer."""
    col = MUTED_ON_DARK if on_dark else MUTED_ON_LIGHT
    _, tf = textbox(slide, MARGIN, FOOTER_Y, 3.0, 0.24, name="FooterLeft")
    write(tf, [{"text": "alignhcm.com"}], {"size": 9, "color": col})

    _, tf = textbox(slide, (SLIDE_W - 3.0) / 2, FOOTER_Y, 3.0, 0.24, name="FooterMid")
    write(tf, [{"text": "© 2026 AlignHCM  ·  Confidential"}],
          {"size": 9, "color": col, "align": "c"})

    _, tf = textbox(slide, SLIDE_W - MARGIN - 3.0, FOOTER_Y, 3.0, 0.24, name="FooterRight")
    write(tf, [{"text": f"Align HCM   ·   {page:02d}"}], {"size": 9, "color": col, "align": "r"})


def blank(prs):
    return prs.slides.add_slide(prs.slide_layouts[6])


def bg(slide, color):
    """Full-bleed background rectangle (sent to back by insertion order)."""
    return rect(slide, 0, 0, SLIDE_W, SLIDE_H, fill=color, name="Background")


def picture(slide, path, x, y, w=None, h=None, name=None):
    kw = {}
    if w:
        kw["width"] = Inches(w)
    if h:
        kw["height"] = Inches(h)
    pic = slide.shapes.add_picture(path, Inches(x), Inches(y), **kw)
    if name:
        pic.name = name
    return pic
