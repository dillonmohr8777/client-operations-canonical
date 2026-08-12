"""Build: Align HCM — Bosley HairClub UKG Pro Merger, Implementation Proposal.

Content is transcribed from the source Bosley deck screenshots; the visual
system is the Align HCM house template (see brand.py for provenance).
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.enum.text import MSO_ANCHOR
from pptx.oxml.ns import qn
import copy

from brand import (
    ORANGE, ORANGE_DEEP, NAVY, NAVY_DEEP, NAVY_ELEV, SLATE, SLATE_LT, BORDER,
    BORDER_BRIGHT, BORDER_SOFT, CARD_DARK_LINE, CARD_NAVY_LINE, ICON_CIRCLE,
    INK, INK_2, WHITE, CARD_BG, RAMP, FONT_BODY, FONT_HEAD,
    SLIDE_W, SLIDE_H, MARGIN, CONTENT_W, BODY_TOP, FOOTER_Y,
    rect, ellipse, textbox, write, anchor_middle, header, footer, blank, bg, picture,
)

HERE = os.path.dirname(os.path.abspath(__file__))
A = lambda n: os.path.join(HERE, "assets", n)
OUT = os.path.join(HERE, "Align_HCM_Bosley_HairClub_UKG_Pro_Merger.pptx")


# ---------------------------------------------------------------- table utils
def _set_border(cell, spec):
    """Apply cell edges. `spec` maps edge -> (color, width_pt).

    CT_TableCell declares lnL, lnR, lnT, lnB as an ordered sequence, so all four
    are rebuilt in one pass and inserted in that order — writing them per-edge
    lands them reversed.
    """
    tcPr = cell._tc.get_or_add_tcPr()
    for edge in ("L", "R", "T", "B"):
        for old in tcPr.findall(qn(f"a:ln{edge}")):
            tcPr.remove(old)

    at = 0
    for edge in ("L", "R", "T", "B"):
        if edge not in spec:
            continue
        color, width_pt = spec[edge]
        ln = tcPr.makeelement(qn(f"a:ln{edge}"),
                              {"w": str(int(width_pt * 12700)), "cap": "flat",
                               "cmpd": "sng", "algn": "ctr"})
        fill = ln.makeelement(qn("a:solidFill"), {})
        clr = ln.makeelement(qn("a:srgbClr"), {"val": str(color)})
        fill.append(clr)
        ln.append(fill)
        tcPr.insert(at, ln)
        at += 1


def _cell(cell, text, size=10, bold=False, color=INK, fill=None, align="l",
          font=FONT_BODY, pad=0.09):
    cell.margin_left = cell.margin_right = Inches(pad)
    cell.margin_top = cell.margin_bottom = Inches(0.055)
    cell.vertical_anchor = MSO_ANCHOR.MIDDLE
    if fill is not None:
        cell.fill.solid()
        cell.fill.fore_color.rgb = fill
    else:
        cell.fill.background()
    write(cell.text_frame, [{"text": text}],
          {"size": size, "bold": bold, "color": color, "align": align, "font": font,
           "line_spacing": 0.95})


def dark_card(slide, x, y, w, h, on_navy=False, name=None):
    """The deck's one card treatment: navy fill, lit edge, orange icon inside.

    A single card style everywhere is what keeps the light and dark slides
    reading as one deck rather than two.
    """
    return rect(slide, x, y, w, h,
                fill=NAVY_DEEP if on_navy else NAVY,
                line=CARD_NAVY_LINE if on_navy else CARD_DARK_LINE,
                line_w=1.25, radius=0.13, name=name)


def orange_icon(slide, icon, x, y, disc=0.58):
    """Orange glyph on a raised navy disc, centred on (x, y) as the disc origin.

    The disc carries the same lit edge as the cards, so the ring reads as one
    system with the card outlines rather than as a separate decoration.
    """
    from pptx.enum.shapes import MSO_SHAPE
    shp = slide.shapes.add_shape(MSO_SHAPE.OVAL, Inches(x), Inches(y),
                                 Inches(disc), Inches(disc))
    shp.fill.solid()
    shp.fill.fore_color.rgb = ICON_CIRCLE
    shp.line.color.rgb = CARD_DARK_LINE
    shp.line.width = Pt(1.0)
    shp.shadow.inherit = False
    glyph = disc * 0.50
    picture(slide, os.path.join(HERE, "assets", "icons-orange", icon),
            x + (disc - glyph) / 2, y + (disc - glyph) / 2, w=glyph)


def add_table(slide, x, y, col_w, row_h, name=None):
    shp = slide.shapes.add_table(len(row_h), len(col_w), Inches(x), Inches(y),
                                 Inches(sum(col_w)), Inches(sum(row_h)))
    tbl = shp.table
    # kill the default banded blue look
    tblPr = tbl._tbl.find(qn("a:tblPr"))
    tblPr.set("firstRow", "0")
    tblPr.set("bandRow", "0")
    for old in tblPr.findall(qn("a:tableStyleId")):
        tblPr.remove(old)
    for i, w in enumerate(col_w):
        tbl.columns[i].width = Inches(w)
    for i, h in enumerate(row_h):
        tbl.rows[i].height = Inches(h)
    if name:
        shp.name = name
    return tbl


# --------------------------------------------------------------------- slides
def slide_title(prs):
    s = blank(prs)
    bg(s, NAVY)
    rect(s, 8.90, 0, SLIDE_W - 8.90, SLIDE_H, fill=NAVY_DEEP, name="RightPanel")
    rect(s, 8.87, 0, 0.035, SLIDE_H, fill=ORANGE, name="PanelDivider")

    picture(s, A("align-hcm-logo.png"), 0.90, 0.78, w=2.75, name="AlignHCM_Logo")

    _, tf = textbox(s, 0.90, 3.02, 7.4, 0.30)
    write(tf, [{"text": "Implementation Proposal"}],
          {"size": 11.5, "bold": True, "color": ORANGE, "caps": True, "spacing": 1.8})

    _, tf = textbox(s, 0.90, 3.38, 7.6, 0.95)
    write(tf, [{"text": "Bosley HairClub"}],
          {"size": 50, "bold": True, "color": WHITE, "font": FONT_HEAD})

    _, tf = textbox(s, 0.90, 4.42, 7.6, 0.42)
    write(tf, [{"text": "UKG Pro Merger"}], {"size": 22, "color": SLATE_LT})

    rect(s, 0.90, 5.12, 0.85, 0.045, fill=ORANGE)

    _, tf = textbox(s, 0.90, 5.42, 7.6, 0.32)
    write(tf, [{"text": "August 2026"}], {"size": 13, "bold": True, "color": SLATE})

    # Client mark: the supplied logo is white type, so it sits straight on the
    # dark panel — no plate needed, and it mirrors the Align lockup opposite.
    panel_x, panel_w = 8.90, SLIDE_W - 8.90
    _, tf = textbox(s, panel_x, 3.02, panel_w, 0.26)
    write(tf, [{"text": "Prepared for"}],
          {"size": 9.5, "color": SLATE, "align": "c", "caps": True, "spacing": 1.6})

    logo_w = 2.90
    logo_h = logo_w / 2.907                      # measured from the extracted PNG
    picture(s, A("bosley-hairclub-logo-white.png"),
            panel_x + (panel_w - logo_w) / 2, 3.46, w=logo_w,
            name="BosleyHairClub_Logo")

    rect(s, panel_x + (panel_w - 0.60) / 2, 3.46 + logo_h + 0.34, 0.60, 0.035, fill=ORANGE)

    _, tf = textbox(s, 0.90, FOOTER_Y, 6.0, 0.24)
    write(tf, [{"text": "© 2026 AlignHCM  ·  Confidential"}], {"size": 9, "color": SLATE})
    _, tf = textbox(s, SLIDE_W - MARGIN - 3.0, FOOTER_Y, 3.0, 0.24)
    write(tf, [{"text": "Align HCM   ·   01"}], {"size": 9, "color": SLATE, "align": "r"})
    return s


def slide_exec_summary(prs):
    s = blank(prs)
    bg(s, WHITE)
    header(s, "Bosley HairClub  ·  UKG Pro Merger", "Executive Summary",
           "Bosley HairClub is bringing approximately 400 employees onto HairClub's "
           "existing UKG Pro environment, migrating them off ADP.")

    cards = [
        ("icon-person.png", "400 employees, ADP to UKG Pro",
         "Bosley HairClub's ~400 employees move from ADP onto HairClub's existing "
         "UKG Pro environment."),
        ("icon-shield.png", "Existing business rules apply",
         "Bosley employees will be set up under HairClub's existing business rules, "
         "pay rules, and accrual rules already in production."),
        ("icon-config.png", "Scope: Pro, WFM, data & onboarding",
         "Project management, UKG Pro / WFM system configuration, and data conversion."),
        ("icon-calendar.png", "16-week timeline",
         "12 weeks of implementation plus 4 weeks of post go-live support, targeting a "
         "January 1, 2027 go-live (actual go-live is the first pay in January and first "
         "punch on the first day of that pay period)."),
    ]

    gap = 0.34
    cw = (CONTENT_W - gap) / 2
    ch = 1.94
    top = 2.34
    for i, (icon, title, body) in enumerate(cards):
        cx = MARGIN + (cw + gap) * (i % 2)
        cy = top + (ch + gap) * (i // 2)
        dark_card(s, cx, cy, cw, ch, name=f"ExecCard{i+1}")
        orange_icon(s, icon, cx + 0.36, cy + 0.34)
        _, tf = textbox(s, cx + 1.14, cy + 0.47, cw - 1.50, 0.46)
        write(tf, [{"text": title}], {"size": 13.5, "bold": True, "color": WHITE})
        _, tf = textbox(s, cx + 0.36, cy + 1.04, cw - 0.72, ch - 1.26)
        write(tf, [{"text": body}], {"size": 11, "color": SLATE_LT, "line_spacing": 1.22})

    footer(s, 2)
    return s


def slide_timeline(prs):
    s = blank(prs)
    bg(s, WHITE)
    header(s, "16 Weeks to Go-Live", "Proposed Timeline",
           "16 weeks total: 12-week implementation + 4 weeks of post go-live support.")

    phases = [
        ("Kickoff &\nPlanning", "Wk 1-2", 2),
        ("Analysis &\nValidation", "Wk 2-5", 4),
        ("Configuration\n& Build", "Wk 4-8", 5),
        ("Data\nConversion", "Wk 7-10", 4),
        ("Testing &\nUAT", "Wk 9-11", 3),
        ("Post Go-Live\nSupport", "Wk 13-16", 4),
    ]
    gap = 0.07
    units = sum(p[2] for p in phases)
    usable = CONTENT_W - gap * (len(phases) - 1)
    top, ch = 3.00, 1.20

    x = MARGIN
    xs = []
    for i, (label, weeks, span) in enumerate(phases):
        w = usable * span / units
        xs.append((x, w))
        rect(s, x, top, w, ch, fill=RAMP[i], radius=0.09, name=f"Phase{i+1}")
        _, tf = textbox(s, x + 0.08, top + 0.22, w - 0.16, 0.58)
        write(tf, [{"text": t} for t in label.split("\n")],
              {"size": 10.5, "bold": True, "color": WHITE, "align": "c",
               "line_spacing": 1.02})
        _, tf = textbox(s, x + 0.08, top + 0.84, w - 0.16, 0.24)
        write(tf, [{"text": weeks}], {"size": 9.5, "color": SLATE_LT, "align": "c"})
        x += w + gap

    # go-live marker sits on the seam before Post Go-Live Support, and stops at
    # the chip baseline so it never crosses the band captions below
    seam = xs[5][0] - gap / 2
    rect(s, seam - 0.011, top - 0.34, 0.022, ch + 0.44, fill=ORANGE, name="GoLiveMarker")
    _, tf = textbox(s, seam - 1.10, top - 0.86, 2.20, 0.44)
    write(tf, [{"text": "GO-LIVE"}, {"text": "Week 12"}],
          {"size": 9.5, "bold": True, "color": ORANGE, "align": "c", "line_spacing": 1.05})

    cap_y = top + ch + 0.34
    impl_w = xs[5][0] - gap - MARGIN - 0.45
    _, tf = textbox(s, MARGIN, cap_y, impl_w, 0.26)
    write(tf, [{"text": "Weeks 1-12  ·  Implementation"}],
          {"size": 10, "italic": True, "color": INK_2, "align": "c"})
    _, tf = textbox(s, xs[5][0] - 0.34, cap_y, xs[5][1] + 0.34, 0.26)
    write(tf, [{"text": "Weeks 13-16  ·  Post Go-Live"}],
          {"size": 10, "italic": True, "color": INK_2, "align": "c"})

    note_y = 5.34
    dark_card(s, MARGIN, note_y, CONTENT_W, 0.96, name="TimelineNote")
    orange_icon(s, "icon-calendar.png", MARGIN + 0.32, note_y + 0.19)
    _, tf = textbox(s, MARGIN + 1.06, note_y + 0.26, CONTENT_W - 1.40, 0.50)
    write(tf, [{"text": "Target go-live: January 1, 2027, with true go-live defined as "
                        "the start of the first supported pay period."}],
          {"size": 11.5, "color": SLATE_LT, "line_spacing": 1.2})

    footer(s, 3)
    return s


def slide_milestones(prs):
    s = blank(prs)
    bg(s, WHITE)
    header(s, "Phase by Phase", "Milestones by Phase",
           "What gets delivered, and when, across the 16-week engagement.")

    rows = [
        ("Kickoff & Planning", "Wk 1-2",
         "Project kickoff, team alignment, environment access, project plan finalized"),
        ("Analysis & Validation", "Wk 2-5",
         "Validate Bosley population against HairClub's existing business, pay, and accrual "
         "rules; confirm component company structure"),
        ("Configuration & Build", "Wk 4-8",
         "Component company setup in UKG Pro, WFM configuration walkthroughs, integration updates"),
        ("Data Conversion", "Wk 7-10",
         "Convert and load Bosley employee data from ADP; validate demographic, pay, and accrual data"),
        ("Testing & UAT", "Wk 9-11",
         "Parallel payroll testing, user acceptance testing, sign-off"),
        ("Go-Live", "Wk 12",
         "Bosley employees live on UKG Pro; first supported payroll processed"),
        ("Post Go-Live Support", "Wk 13-16",
         "Hypercare support, issue resolution, transition to steady state"),
    ]
    col_w = [3.00, 1.25, 7.5833]
    row_h = [0.44] + [0.545] * len(rows)
    tbl = add_table(s, MARGIN, 2.42, col_w, row_h, name="MilestonesTable")

    ncols = 3
    for j, head in enumerate(["Phase", "Weeks", "Key Milestones"]):
        _cell(tbl.cell(0, j), head, size=10.5, bold=True, color=WHITE, fill=NAVY)
        _set_border(tbl.cell(0, j), {e: (NAVY, 1.0) for e in "LRTB"})

    for i, (phase, weeks, ms) in enumerate(rows, start=1):
        zebra = WHITE if i % 2 else CARD_BG
        _cell(tbl.cell(i, 0), phase, size=10.5, bold=True, color=NAVY, fill=zebra)
        _cell(tbl.cell(i, 1), weeks, size=10, bold=True, color=ORANGE, fill=zebra, align="c")
        _cell(tbl.cell(i, 2), ms, size=10, color=INK_2, fill=zebra)
        last = i == len(rows)
        for j in range(ncols):
            _set_border(tbl.cell(i, j), {
                "T": (BORDER_BRIGHT, 1.0),
                "B": (BORDER_BRIGHT, 1.25 if last else 1.0),
                "L": (BORDER_BRIGHT if j == 0 else BORDER_SOFT, 1.0),
                "R": (BORDER_BRIGHT if j == ncols - 1 else BORDER_SOFT, 1.0),
            })

    footer(s, 4)
    return s


def slide_investment(prs):
    s = blank(prs)
    bg(s, NAVY)
    header(s, "Phase 1 Investment", "AlignHCM — Planned Investment",
           "Total project cost for a January 1, 2027 go-live.", on_dark=True)

    top, ch = 2.46, 2.36
    gap = 0.34
    lw = 5.20
    rw = CONTENT_W - lw - gap

    dark_card(s, MARGIN, top, lw, ch, on_navy=True, name="PriceCard")
    _, tf = textbox(s, MARGIN + 0.30, top + 0.44, lw - 0.60, 1.00)
    write(tf, [{"text": "$93,955"}],
          {"size": 60, "bold": True, "color": WHITE, "font": FONT_HEAD, "align": "c"})
    _, tf = textbox(s, MARGIN + 0.30, top + 1.44, lw - 0.60, 0.28)
    write(tf, [{"text": "Total project investment  ·  1/1/2027 go-live"}],
          {"size": 11, "bold": True, "color": ORANGE, "align": "c"})
    _, tf = textbox(s, MARGIN + 0.55, top + 1.80, lw - 1.10, 0.46)
    write(tf, [{"text": "Includes project management, UKG Pro & WFM system "
                        "configuration, and employee data conversion."}],
          {"size": 10, "color": SLATE_LT, "align": "c", "line_spacing": 1.18})

    rx = MARGIN + lw + gap
    dark_card(s, rx, top, rw, ch, on_navy=True, name="EarlyGoLiveCard")
    orange_icon(s, "icon-arrow-up.png", rx + 0.34, top + 0.34)
    _, tf = textbox(s, rx + 1.08, top + 0.42, rw - 1.42, 0.40)
    write(tf, [{"text": "+$12,900 for an earlier go-live"}],
          {"size": 15, "bold": True, "color": WHITE})
    _, tf = textbox(s, rx + 0.34, top + 1.06, rw - 0.68, 1.05)
    write(tf, [{"text": "If Bosley HairClub goes live sooner than 1/1/2027, an additional "
                        "$12,900 applies for the extra data conversion work required to "
                        "bring over opening balances."}],
          {"size": 11, "color": SLATE_LT, "line_spacing": 1.24})

    by = top + ch + gap
    dark_card(s, MARGIN, by, CONTENT_W, 1.30, on_navy=True, name="ScopeCard")
    orange_icon(s, "icon-calendar.png", MARGIN + 0.34, by + 0.36)
    _, tf = textbox(s, MARGIN + 1.08, by + 0.24, CONTENT_W - 1.42, 0.34)
    write(tf, [{"text": "12 weeks of implementation + 4 weeks of post go-live support "
                        "= 16 weeks total"}],
          {"size": 14, "bold": True, "color": WHITE})
    _, tf = textbox(s, MARGIN + 1.06, by + 0.64, CONTENT_W - 1.40, 0.56)
    write(tf, [{"text": "Pricing reflects Phase 1 only: bringing Bosley HairClub's 400 "
                        "employees onto HairClub's existing UKG Pro environment. Phase 2 "
                        "(Benefits Hub) will be scoped and priced separately."}],
          {"size": 11, "color": SLATE_LT, "line_spacing": 1.22})

    footer(s, 5, on_dark=True)
    return s


def slide_engagement(prs):
    s = blank(prs)
    bg(s, WHITE)
    header(s, "Your Team's Role", "What We'll Need From Your Team",
           "Estimated level of engagement by project phase.")

    heads = ["Resource", "Kickoff", "Analysis", "Build & Convert", "Test", "Go-Live"]
    rows = [
        ("Project Lead",        ["Medium", "Medium", "Medium", "Medium", "Low"]),
        ("HR / Payroll SME",    ["Low", "High", "Medium", "High", "Medium"]),
        ("System Administrator", ["Low", "Medium", "High", "Medium", "Medium"]),
        ("IT / Data Contact",   ["Low", "Low", "High", "Low", "Low"]),
    ]
    # INK_2 rather than SLATE for "Low": #8792A3 on white is ~2.9:1, below AA
    level_col = {"Low": INK_2, "Medium": ORANGE, "High": ORANGE_DEEP}

    col_w = [3.20] + [1.7267] * 5
    row_h = [0.46] + [0.52] * len(rows)
    tbl = add_table(s, MARGIN, 2.42, col_w, row_h, name="EngagementTable")

    ncols = len(heads)
    for j, head in enumerate(heads):
        _cell(tbl.cell(0, j), head, size=10.5, bold=True, color=WHITE, fill=NAVY,
              align="l" if j == 0 else "c")
        _set_border(tbl.cell(0, j), {e: (NAVY, 1.0) for e in "LRTB"})

    for i, (res, levels) in enumerate(rows, start=1):
        zebra = WHITE if i % 2 else CARD_BG
        _cell(tbl.cell(i, 0), res, size=11, bold=True, color=NAVY, fill=zebra)
        for j, lv in enumerate(levels, start=1):
            _cell(tbl.cell(i, j), lv, size=10.5, bold=True, color=level_col[lv],
                  fill=zebra, align="c")
        last = i == len(rows)
        for j in range(ncols):
            _set_border(tbl.cell(i, j), {
                "T": (BORDER_BRIGHT, 1.0),
                "B": (BORDER_BRIGHT, 1.25 if last else 1.0),
                "L": (BORDER_BRIGHT if j == 0 else BORDER_SOFT, 1.0),
                "R": (BORDER_BRIGHT if j == ncols - 1 else BORDER_SOFT, 1.0),
            })

    cy = 2.42 + sum(row_h) + 0.40
    dark_card(s, MARGIN, cy, CONTENT_W, 1.44, name="EngagementCallout")
    orange_icon(s, "icon-person.png", MARGIN + 0.34, cy + 0.43)
    _, tf = textbox(s, MARGIN + 1.10, cy + 0.28, CONTENT_W - 1.44, 0.34)
    write(tf, [{"text": "Your team stays focused on decisions and validation"}],
          {"size": 13.5, "bold": True, "color": WHITE})
    _, tf = textbox(s, MARGIN + 1.10, cy + 0.68, CONTENT_W - 1.44, 0.62)
    write(tf, [{"text": "HairClub's team confirms that Bosley employees fit existing "
                        "business rules, validates converted data, and supports UAT "
                        "sign-off. AlignHCM leads configuration, data conversion, and "
                        "testing coordination."}],
          {"size": 11, "color": SLATE_LT, "line_spacing": 1.22})

    footer(s, 6)
    return s


def slide_contact(prs):
    s = blank(prs)
    bg(s, NAVY_DEEP)
    rect(s, 4.60, 0, SLIDE_W - 4.60, SLIDE_H, fill=NAVY, name="RightPanel")
    rect(s, 4.57, 0, 0.035, SLIDE_H, fill=ORANGE, name="PanelDivider")

    picture(s, A("align-hcm-logo.png"), 0.85, 3.05, w=2.90, name="AlignHCM_Logo")

    _, tf = textbox(s, 5.35, 2.10, 6.9, 0.30)
    write(tf, [{"text": "Next Step"}],
          {"size": 11.5, "bold": True, "color": ORANGE, "caps": True, "spacing": 1.8})
    _, tf = textbox(s, 5.35, 2.46, 6.9, 0.85)
    write(tf, [{"text": "Let's stay connected!"}],
          {"size": 40, "bold": True, "color": WHITE, "font": FONT_HEAD})
    rect(s, 5.35, 3.52, 0.85, 0.045, fill=ORANGE)

    contacts = [
        ("icon-person.png", "Allison Cox", "Client Executive"),
        ("icon-envelope.png", "allison.cox@alignhcm.com", None),
        ("icon-phone.png", "317-690-7960", None),
    ]
    disc, step = 0.66, 0.98
    y = 3.84
    for icon, primary, secondary in contacts:
        orange_icon(s, icon, 5.35, y, disc=disc)
        if secondary:
            _, tf = textbox(s, 6.30, y - 0.01, 6.0, 0.38)
            write(tf, [{"text": primary}], {"size": 23, "bold": True, "color": WHITE})
            _, tf = textbox(s, 6.30, y + 0.39, 6.0, 0.26)
            write(tf, [{"text": secondary}], {"size": 12.5, "color": SLATE})
        else:
            _, tf = textbox(s, 6.30, y + 0.14, 6.0, 0.38)
            write(tf, [{"text": primary}], {"size": 20, "color": WHITE})
        y += step

    _, tf = textbox(s, 5.35, FOOTER_Y, 4.0, 0.24)
    write(tf, [{"text": "alignhcm.com"}], {"size": 9, "color": SLATE})
    _, tf = textbox(s, SLIDE_W - MARGIN - 4.0, FOOTER_Y, 4.0, 0.24)
    write(tf, [{"text": "© 2026 AlignHCM  ·  Confidential   ·   07"}],
          {"size": 9, "color": SLATE, "align": "r"})
    return s


def main():
    prs = Presentation()
    prs.slide_width = Inches(SLIDE_W)
    prs.slide_height = Inches(SLIDE_H)

    slide_title(prs)
    slide_exec_summary(prs)
    slide_timeline(prs)
    slide_milestones(prs)
    slide_investment(prs)
    slide_engagement(prs)
    slide_contact(prs)

    prs.save(OUT)
    print("wrote", OUT, os.path.getsize(OUT) // 1024, "KB")


if __name__ == "__main__":
    main()
