from pathlib import Path
from functools import lru_cache

from PIL import Image
from reportlab.lib.colors import Color, HexColor, white
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph


W, H = letter
M = 42

BLACK = HexColor("#0B0C0D")
INK = HexColor("#151515")
ORANGE = HexColor("#FF6900")
ORANGE_2 = HexColor("#F4510A")
CREAM = HexColor("#F5EFE5")
PAPER = HexColor("#FFF9EF")
MIST = HexColor("#D9D4CC")
GRAY = HexColor("#989795")
LIGHT = HexColor("#FDFBF7")
GREEN = HexColor("#2FC579")
AMBER = HexColor("#F4B241")
BLUE = HexColor("#69B8FF")

PROJECT = Path(
    r"C:\Users\dillo\Documents\Codex\projects\client-operations\clients"
    r"\bigorange-marketing\deliverables"
    r"\2026-08-03-custom-home-builder-authority-hub-pilot"
)
SHOT_DIR = Path(
    r"C:\Users\dillo\.codex\visualizations\2026\08\21"
    r"\01a0222a-0843-7a61-8a55-fb40dd9bf7a5\bigorange-final"
)
OUT = PROJECT / "output" / "pdf" / "BigOrange-Authority-Hub-Executive-Delivery-Review-2026-08-21.pdf"
LOGO = PROJECT / "wordpress" / "netlify-hardcoded" / "assets" / "bigorange-logo-particle-8777.png"

INDUSTRY_URL = "https://bigorange-marketing-homepage.netlify.app/"
PRIMARY_URL = "https://bigorange-marketing-homepage.netlify.app/primary/"
SHEET_URL = (
    "https://docs.google.com/spreadsheets/d/"
    "1UO-4yWfqc43jFjj2u3nfMdd4GGDclnQuXfVawllq90s/edit"
)


def register_fonts():
    fonts = {
        "Arial": r"C:\Windows\Fonts\arial.ttf",
        "ArialBold": r"C:\Windows\Fonts\arialbd.ttf",
        "ArialBlack": r"C:\Windows\Fonts\ariblk.ttf",
        "Georgia": r"C:\Windows\Fonts\georgia.ttf",
        "GeorgiaItalic": r"C:\Windows\Fonts\georgiai.ttf",
        "Consolas": r"C:\Windows\Fonts\consola.ttf",
        "ConsolasBold": r"C:\Windows\Fonts\consolab.ttf",
    }
    for name, path in fonts.items():
        pdfmetrics.registerFont(TTFont(name, path))


def color_with_alpha(hex_value, alpha):
    base = HexColor(hex_value)
    return Color(base.red, base.green, base.blue, alpha=alpha)


def rounded_card(c, x, y, w, h, fill, stroke=None, radius=18, shadow=True, sw=1):
    if shadow:
        c.saveState()
        c.setFillColor(Color(0, 0, 0, alpha=0.17))
        c.roundRect(x + 5, y - 7, w, h, radius, fill=1, stroke=0)
        c.restoreState()
    c.saveState()
    c.setFillColor(fill)
    if stroke:
        c.setStrokeColor(stroke)
        c.setLineWidth(sw)
        stroke_flag = 1
    else:
        stroke_flag = 0
    c.roundRect(x, y, w, h, radius, fill=1, stroke=stroke_flag)
    c.restoreState()


def pill(c, text, x, y, fill=ORANGE, text_color=BLACK, font="ConsolasBold", size=7.4, pad_x=10, h=20):
    width = pdfmetrics.stringWidth(text, font, size) + pad_x * 2 + 7
    c.setFillColor(fill)
    c.roundRect(x, y, width, h, h / 2, fill=1, stroke=0)
    c.setFillColor(text_color)
    c.setFont(font, size)
    c.drawCentredString(x + width / 2, y + (h - size) / 2 + 1.4, text)
    return width


def draw_logo(c, x, y, width=120, on_orange=False):
    height = width * 338 / 1000
    c.saveState()
    c.setFillAlpha(1)
    c.setStrokeAlpha(1)
    if on_orange:
        c.setFillColor(BLACK)
        c.roundRect(x - 9, y - 7, width + 18, height + 14, 12, fill=1, stroke=0)
    c.drawImage(str(LOGO), x, y, width=width, height=height, mask="auto")
    c.restoreState()
    return height


@lru_cache(maxsize=64)
def cropped_reader(path_text, width_key, height_key):
    path = Path(path_text)
    target_ratio = width_key / height_key
    with Image.open(path) as opened:
        im = opened.convert("RGB")
        src_ratio = im.width / im.height
        if src_ratio > target_ratio:
            new_w = int(im.height * target_ratio)
            left = max(0, (im.width - new_w) // 2)
            im = im.crop((left, 0, left + new_w, im.height))
        else:
            new_h = int(im.width / target_ratio)
            top = max(0, (im.height - new_h) // 2)
            im = im.crop((0, top, im.width, top + new_h))
        im = im.copy()
    return ImageReader(im)


def cover_image(c, path, x, y, w, h, radius=0, overlay=None, border=None):
    c.saveState()
    if radius:
        clip = c.beginPath()
        clip.roundRect(x, y, w, h, radius)
        c.clipPath(clip, stroke=0, fill=0)
    c.drawImage(
        cropped_reader(str(path), round(w, 3), round(h, 3)),
        x,
        y,
        width=w,
        height=h,
        mask="auto",
    )
    if overlay:
        c.setFillColor(overlay)
        c.rect(x, y, w, h, fill=1, stroke=0)
    c.restoreState()
    if border:
        c.setStrokeColor(border)
        c.setLineWidth(1)
        c.roundRect(x, y, w, h, radius, fill=0, stroke=1)


def para(
    c,
    text,
    x,
    y_top,
    width,
    font="Arial",
    size=10,
    leading=None,
    color=INK,
    align=TA_LEFT,
    max_height=1000,
):
    if leading is None:
        leading = size * 1.34
    style = ParagraphStyle(
        name="inline",
        fontName=font,
        fontSize=size,
        leading=leading,
        textColor=color,
        alignment=align,
        spaceAfter=0,
        spaceBefore=0,
        allowWidows=0,
        allowOrphans=0,
    )
    # ReportLab's embedded Arial metrics are fractionally optimistic at this
    # output scale. A deliberate right-side safety inset keeps every line
    # inside its card or page column after PDF rasterization.
    safe_width = max(24, width - max(12, width * 0.08))
    p = Paragraph(text, style)
    _, ph = p.wrap(safe_width, max_height)
    p.drawOn(c, x, y_top - ph)
    return ph


def label(c, text, x, y, color=ORANGE, size=7.4):
    t = c.beginText(x, y)
    t.setFont("ConsolasBold", size)
    t.setFillColor(color)
    t.setCharSpace(1.25)
    t.textLine(text.upper())
    c.drawText(t)


def headline(c, lines, x, y_top, size=42, leading=None, colors=None, font="ArialBlack"):
    if leading is None:
        leading = size * 0.94
    current = y_top
    for index, line in enumerate(lines):
        current -= size
        c.setFont(font, size)
        if colors:
            c.setFillColor(colors[min(index, len(colors) - 1)])
        else:
            c.setFillColor(INK)
        c.drawString(x, current, line)
        current -= max(0, leading - size)
    return current


def number_icon(c, number, x, y, fill=ORANGE, text_color=BLACK, size=22):
    c.setFillColor(fill)
    c.roundRect(x, y, size, size, 7, fill=1, stroke=0)
    c.setFillColor(text_color)
    c.setFont("ConsolasBold", 8)
    c.drawCentredString(x + size / 2, y + 7.2, str(number))


def status_dot(c, x, y, status):
    lookup = {
        "complete": GREEN,
        "candidate": AMBER,
        "gated": ORANGE,
        "live": BLUE,
    }
    c.setFillColor(lookup[status])
    c.circle(x, y, 4, fill=1, stroke=0)


def page_header(c, page_num, section, bg="light"):
    dark = bg == "dark"
    orange_bg = bg == "orange"
    text_color = LIGHT if dark or orange_bg else INK
    label_color = LIGHT if orange_bg else ORANGE
    label(c, f"{page_num:02d} / {section}", M, H - 38, label_color)
    draw_logo(c, W - M - 104, H - 51, width=104, on_orange=orange_bg)
    c.setFillColor(text_color)


def page_footer(c, page_num, source="", bg="light"):
    dark = bg == "dark"
    orange_bg = bg == "orange"
    text_color = Color(1, 1, 1, alpha=0.58) if dark or orange_bg else HexColor("#716E69")
    c.setFillColor(text_color)
    c.setFont("Consolas", 6.7)
    c.drawString(M, 22, "BIGORANGE.MARKETING  /  AUTHORITY HUB DELIVERY REVIEW")
    if source:
        c.drawRightString(W - M - 28, 22, source.upper())
    c.setFillColor(ORANGE if not orange_bg else BLACK)
    c.roundRect(W - M - 22, 14, 22, 18, 5, fill=1, stroke=0)
    c.setFillColor(BLACK if not orange_bg else LIGHT)
    c.setFont("ConsolasBold", 7.2)
    c.drawCentredString(W - M - 11, 20.2, f"{page_num:02d}")


def page_background(c, color):
    c.setFillColor(color)
    c.rect(0, 0, W, H, fill=1, stroke=0)


def micro_rule(c, x, y, w, color=ORANGE):
    c.setFillColor(color)
    c.roundRect(x, y, w, 4, 2, fill=1, stroke=0)


def metric_card(c, x, y, w, h, value, caption, fill=BLACK, value_color=ORANGE, caption_color=LIGHT):
    rounded_card(c, x, y, w, h, fill, stroke=Color(1, 1, 1, alpha=0.10), radius=16, shadow=True)
    c.setFont("ArialBlack", 28)
    c.setFillColor(value_color)
    c.drawString(x + 16, y + h - 40, value)
    para(c, caption, x + 16, y + h - 50, w - 32, font="ConsolasBold", size=7.5, leading=9.6, color=caption_color)


def check_row(c, x, y, text, color=INK, dot_color=ORANGE, width=210, size=8.6):
    c.setFillColor(dot_color)
    c.roundRect(x, y - 3, 14, 14, 4, fill=1, stroke=0)
    c.setStrokeColor(BLACK if dot_color != BLACK else LIGHT)
    c.setLineWidth(1.4)
    c.line(x + 3.8, y + 3.1, x + 6.3, y + 0.6)
    c.line(x + 6.2, y + 0.6, x + 10.5, y + 6.1)
    para(c, text, x + 22, y + 10, width - 22, font="ArialBold", size=size, leading=size * 1.22, color=color)


def draw_device(c, image_path, x, y, w, h, label_text):
    rounded_card(c, x, y, w, h, HexColor("#242526"), stroke=HexColor("#48494B"), radius=18, shadow=True)
    cover_image(c, image_path, x + 5, y + 12, w - 10, h - 24, radius=13)
    c.setFillColor(BLACK)
    c.roundRect(x + w * 0.31, y + h - 9, w * 0.38, 5, 2.5, fill=1, stroke=0)
    c.setFillColor(Color(1, 1, 1, alpha=0.74))
    c.setFont("ConsolasBold", 5.7)
    c.drawCentredString(x + w / 2, y + 3.5, label_text.upper())


def add_link(c, url, x, y, w, h):
    c.linkURL(url, (x, y, x + w, y + h), relative=0, thickness=0)


def build_pdf():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=letter, pageCompression=1)
    c.setTitle("BigOrange Marketing — Authority Hub Executive Delivery Review")
    c.setAuthor("DM Marketing Specialist")
    c.setSubject("Proposal-aligned delivery review, search authority system, and experience directions")
    c.setKeywords("BigOrange Marketing, authority hub, SEO, AEO, GEO, home builder marketing")

    # 01 — Cover
    page_background(c, BLACK)
    cover_image(
        c,
        SHOT_DIR / "primary-desktop-hero.png",
        0,
        0,
        W,
        300,
        overlay=Color(0.03, 0.03, 0.03, alpha=0.38),
    )
    c.setFillColor(Color(1, 0.30, 0, alpha=0.22))
    c.roundRect(300, 258, 354, 288, 44, fill=1, stroke=0)
    draw_logo(c, M, H - 94, width=188)
    label(c, "Executive delivery review / August 21, 2026", M, H - 126, ORANGE)
    y = headline(
        c,
        ["AUTHORITY", "HUB.", "BUILT TO", "BE CHOSEN."],
        M,
        H - 138,
        size=55,
        leading=49,
        colors=[LIGHT, ORANGE, LIGHT, LIGHT],
    )
    para(
        c,
        "Proposal delivery, search authority system, and two fully coded experience directions.",
        M,
        y - 18,
        430,
        font="Arial",
        size=13.2,
        leading=18,
        color=HexColor("#DDD8D1"),
    )
    rounded_card(c, M, 42, W - 2 * M, 54, Color(0.05, 0.05, 0.05, alpha=0.89), stroke=Color(1, 1, 1, alpha=0.16), radius=16, shadow=False)
    label(c, "BigOrange.Marketing", M + 18, 72, LIGHT, 7)
    c.setFillColor(ORANGE)
    c.setFont("GeorgiaItalic", 11)
    c.drawRightString(W - M - 18, 66, "Show the thinking. Build the authority.")
    c.showPage()

    # 02 — Executive readout
    page_background(c, CREAM)
    page_header(c, 2, "Executive readout", "light")
    label(c, "The short version", M, 710, ORANGE)
    y = headline(c, ["THE WORK IS", "BIGGER THAN", "A PAGE."], M, 704, size=44, leading=41, colors=[INK, INK, ORANGE])
    para(
        c,
        "The pilot now includes research, authority architecture, a production-ready content system, implementation specs, and two live noindex experiences that make the choice tangible.",
        M,
        y - 18,
        510,
        font="Arial",
        size=11.6,
        leading=16,
        color=INK,
    )
    card_y = 405
    gap = 10
    card_w = (W - 2 * M - gap * 3) / 4
    metric_card(c, M, card_y, card_w, 102, "35.00", "TOTAL RECONSTRUCTED HOURS")
    metric_card(c, M + (card_w + gap), card_y, card_w, 102, "31.50", "ORIGINAL PROPOSAL HOURS")
    metric_card(c, M + 2 * (card_w + gap), card_y, card_w, 102, "3.50", "ADDED-VALUE HOURS")
    metric_card(c, M + 3 * (card_w + gap), card_y, card_w, 102, "2", "LIVE EXPERIENCE DIRECTIONS")
    rounded_card(c, M, 238, W - 2 * M, 130, PAPER, stroke=HexColor("#D8CFC2"), radius=22, shadow=True)
    pill(c, "ONE HONEST PRODUCTION GATE", M + 20, 326, ORANGE, BLACK)
    c.setFont("ArialBlack", 15.5)
    c.setFillColor(INK)
    c.drawString(M + 20, 294, "Decisions are ready. Facts come first.")
    para(
        c,
        "Janice’s factual review, the WordPress direction, staging settings, technical QA, and publication approval still separate review from production. Both Netlify experiences remain noindex by design.",
        M + 20,
        278,
        W - 2 * M - 40,
        font="Arial",
        size=10.2,
        leading=14.4,
        color=INK,
    )
    rounded_card(c, M, 72, W - 2 * M, 125, ORANGE, radius=22, shadow=True)
    c.setFont("ArialBlack", 23)
    c.setFillColor(BLACK)
    c.drawString(M + 22, 151, "THE RESULT")
    para(
        c,
        "A clear strategy. A full content and technical handoff. A stronger visual standard. And a clean path from factual review to launch.",
        M + 22,
        133,
        W - 2 * M - 44,
        font="ArialBold",
        size=12,
        leading=16,
        color=BLACK,
    )
    page_footer(c, 2, "Proposal + delivery matrix", "light")
    c.showPage()

    # 03 — Proposal promise
    page_background(c, BLACK)
    page_header(c, 3, "The original promise", "dark")
    label(c, "Proposal alignment", M, 708, ORANGE)
    headline(c, ["WHAT THE", "PROPOSAL", "PROMISED."], M, 702, size=45, leading=41, colors=[LIGHT, LIGHT, ORANGE])
    cards = [
        ("RESEARCH FOUNDATION", "Current-site audit, competitor review, Moz and Semrush keyword intelligence.", "complete"),
        ("AUTHORITY ARCHITECTURE", "Pillar structure, supporting content, FAQ logic, internal links, and AI-search strategy.", "complete"),
        ("PRODUCTION CONTENT", "One full pillar, two supporting articles, FAQ set, metadata, schema, and download.", "candidate"),
        ("TECHNICAL IMPLEMENTATION", "WordPress assembly path, breadcrumbs, sitemap, Core Web Vitals plan, and QA.", "candidate"),
        ("OPERATING SYSTEM", "AI-assisted editorial workflow, SME interview process, and the two-hour editorial target.", "complete"),
        ("ROADMAP + HANDOFF", "90-day launch roadmap, 12-month expansion path, and final acceptance sequence.", "gated"),
    ]
    start_y = 418
    cw = (W - 2 * M - 14) / 2
    ch = 112
    for idx, (title, body, state) in enumerate(cards):
        col = idx % 2
        row = idx // 2
        x = M + col * (cw + 14)
        y0 = start_y - row * (ch + 14)
        rounded_card(c, x, y0, cw, ch, HexColor("#171819"), stroke=HexColor("#303234"), radius=18, shadow=True)
        status_dot(c, x + 18, y0 + ch - 22, state)
        state_label = {"complete": "COMPLETE", "candidate": "PRODUCTION CANDIDATE", "gated": "FINAL GATE"}[state]
        label(c, state_label, x + 30, y0 + ch - 25, ORANGE if state != "complete" else GREEN, 6.4)
        c.setFont("ArialBlack", 11.5)
        c.setFillColor(LIGHT)
        c.drawString(x + 18, y0 + ch - 48, title)
        para(c, body, x + 18, y0 + ch - 60, cw - 36, font="Arial", size=8.7, leading=11.8, color=HexColor("#C8C5C0"))
    para(
        c,
        "<b>Complete</b> = evidence exists. <b>Production candidate</b> = built and awaiting factual or CMS review.<br/><b>Final gate</b> = publication has not been claimed.",
        M,
        74,
        W - 2 * M,
        font="Arial",
        size=8.6,
        leading=12.2,
        color=HexColor("#B9B7B2"),
    )
    page_footer(c, 3, "Completion matrix / Aug 20", "dark")
    c.showPage()

    # 04 — Delivery stack
    page_background(c, PAPER)
    page_header(c, 4, "Delivery stack", "light")
    label(c, "Artifacts, not adjectives", M, 710, ORANGE)
    headline(c, ["THE STACK", "IS REAL."], M, 704, size=49, leading=45, colors=[INK, ORANGE])
    para(
        c,
        "The proposal is represented by usable work products—not a strategy summary that disappears after the meeting.",
        M,
        594,
        490,
        font="Arial",
        size=11,
        leading=15.5,
        color=INK,
    )
    columns = [
        ("DISCOVER", [
            "Current-site authority audit",
            "Competitor positioning review",
            "Moz ranking and keyword moat",
            "Semrush opportunity crosscheck",
            "Search-intent rationale",
        ]),
        ("BUILD", [
            "Authority-hub architecture",
            "Complete pillar page",
            "Two supporting articles",
            "Visible FAQ answer set",
            "Downloadable planning asset",
        ]),
        ("IMPLEMENT", [
            "Metadata and canonicals",
            "Schema and parity rules",
            "Breadcrumb and sitemap plan",
            "Internal-link map",
            "Core Web Vitals work order",
        ]),
        ("OPERATE", [
            "90-day launch roadmap",
            "12-month content roadmap",
            "SME interview workflow",
            "AI-assisted editorial workflow",
            "Acceptance and publication gates",
        ]),
    ]
    box_w = (W - 2 * M - 12) / 2
    box_h = 205
    for idx, (title, items) in enumerate(columns):
        col = idx % 2
        row = idx // 2
        x = M + col * (box_w + 12)
        y0 = 340 - row * (box_h + 12)
        fill = BLACK if idx in (0, 3) else CREAM
        title_color = ORANGE
        text_color = LIGHT if fill == BLACK else INK
        rounded_card(c, x, y0, box_w, box_h, fill, stroke=HexColor("#D6CFC4") if fill != BLACK else HexColor("#303234"), radius=20, shadow=True)
        c.setFont("ArialBlack", 17)
        c.setFillColor(title_color)
        c.drawString(x + 18, y0 + box_h - 34, title)
        ry = y0 + box_h - 62
        for item in items:
            check_row(c, x + 18, ry, item, color=text_color, dot_color=ORANGE, width=box_w - 36, size=8.4)
            ry -= 28
    page_footer(c, 4, "Evidence index + source packet", "light")
    c.showPage()

    # 05 — Search moat
    page_background(c, BLACK)
    page_header(c, 5, "Search moat", "dark")
    label(c, "Protect what already works", M, 710, ORANGE)
    headline(c, ["PROTECT THE", "SEARCH MOAT."], M, 704, size=44, leading=41, colors=[LIGHT, ORANGE])
    para(
        c,
        "The strategy protects rankings BigOrange already owns, then strengthens the builder-specific language and proof around them.",
        M,
        592,
        500,
        font="Arial",
        size=10.7,
        leading=15,
        color=HexColor("#CFCBC4"),
    )
    table_x, table_y, table_w, row_h = M, 218, W - 2 * M, 45
    headers = [("KEYWORD", 0.60), ("POSITION", 0.17), ("VOLUME", 0.23)]
    x = table_x
    c.setFillColor(ORANGE)
    c.roundRect(table_x, table_y + row_h * 6 + 8, table_w, 34, 10, fill=1, stroke=0)
    for title, frac in headers:
        c.setFillColor(BLACK)
        c.setFont("ConsolasBold", 7.2)
        c.drawString(x + 12, table_y + row_h * 6 + 20, title)
        x += table_w * frac
    rows = [
        ("agency for home builders", "1", "101–200"),
        ("home builder marketing agency", "1", "51–100"),
        ("marketing agency for home builders", "1", "51–100"),
        ("digital home builder marketing agency", "1", "51–100"),
        ("home builder digital marketing agency", "2", "51–100"),
        ("home builder marketing company", "2", "51–100"),
    ]
    for idx, (kw, pos, volume) in enumerate(rows):
        y0 = table_y + (5 - idx) * row_h
        fill = HexColor("#171819") if idx % 2 == 0 else HexColor("#111213")
        c.setFillColor(fill)
        c.roundRect(table_x, y0, table_w, row_h - 5, 9, fill=1, stroke=0)
        c.setFillColor(LIGHT)
        c.setFont("ArialBold", 9.2)
        c.drawString(table_x + 12, y0 + 15, kw)
        c.setFillColor(ORANGE)
        c.setFont("ArialBlack", 16)
        c.drawString(table_x + table_w * 0.60 + 12, y0 + 11, pos)
        c.setFillColor(HexColor("#CCC8C1"))
        c.setFont("ConsolasBold", 8.2)
        c.drawString(table_x + table_w * 0.77 + 12, y0 + 15, volume)
    rounded_card(c, M, 82, W - 2 * M, 94, Color(1, 0.39, 0, alpha=0.14), stroke=ORANGE, radius=18, shadow=False)
    c.setFont("ArialBlack", 16)
    c.setFillColor(ORANGE)
    c.drawString(M + 18, 139, "THE MOVE")
    para(
        c,
        "Keep the proven agency language. Add deeper builder-specific answers, proof, internal links, and stronger conversion paths around it.",
        M + 18,
        125,
        W - 2 * M - 36,
        font="ArialBold",
        size=10,
        leading=13.5,
        color=LIGHT,
    )
    page_footer(c, 5, "Moz ranking snapshot", "dark")
    c.showPage()

    # 06 — Opportunity layer
    page_background(c, ORANGE)
    page_header(c, 6, "Keyword opportunity", "orange")
    label(c, "Build where intent is obvious", M, 710, BLACK)
    headline(c, ["TURN BUILDER", "QUESTIONS INTO", "ENTRY POINTS."], M, 704, size=42, leading=39, colors=[BLACK, BLACK, LIGHT])
    para(
        c,
        "The opportunity set is specific enough to support useful content and close enough to BigOrange’s offer to deserve a place in the authority system.",
        M,
        570,
        505,
        font="ArialBold",
        size=10.7,
        leading=14.8,
        color=BLACK,
    )
    opportunities = [
        ("1,000", "KD 17", "custom home builder target market segments"),
        ("1,000", "KD 28", "home builder marketing"),
        ("880", "KD 4", "home builder website not generating leads"),
        ("590", "KD 2", "SEO for home builders"),
        ("480", "KD 9", "custom home builder marketing"),
        ("480", "KD 15", "home builder website design"),
    ]
    cw = (W - 2 * M - 12) / 2
    ch = 94
    for idx, (volume, kd, kw) in enumerate(opportunities):
        col = idx % 2
        row = idx // 2
        x = M + col * (cw + 12)
        y0 = 440 - row * (ch + 12)
        rounded_card(c, x, y0, cw, ch, BLACK, stroke=Color(1, 1, 1, alpha=0.20), radius=18, shadow=True)
        c.setFillColor(ORANGE)
        c.setFont("ArialBlack", 22)
        c.drawString(x + 16, y0 + 55, volume)
        pill(c, kd, x + cw - 63, y0 + 60, LIGHT, BLACK, size=6.6, pad_x=8, h=17)
        para(c, kw, x + 16, y0 + 42, cw - 32, font="ArialBold", size=9.1, leading=11.4, color=LIGHT)
    rounded_card(c, M, 72, W - 2 * M, 100, CREAM, radius=19, shadow=True)
    label(c, "What was intentionally left out", M + 18, 146, ORANGE, 6.8)
    para(
        c,
        "Generic agency terms. Generic SEO terms. Homeowner “near me” traffic.",
        M + 18,
        124,
        W - 2 * M - 36,
        font="ArialBlack",
        size=12.4,
        leading=14.6,
        color=BLACK,
    )
    para(c, "Traffic that cannot plausibly turn into a builder relationship is not a strategy.", M + 18, 84, W - 2 * M - 36, font="GeorgiaItalic", size=9.2, leading=11.5, color=INK)
    page_footer(c, 6, "Semrush opportunity snapshot", "orange")
    c.showPage()

    # 07 — AEO / GEO
    page_background(c, CREAM)
    page_header(c, 7, "AEO + GEO", "light")
    label(c, "Search answers need proof", M, 710, ORANGE)
    headline(c, ["MAKE THE", "ANSWER EASY", "TO TRUST."], M, 704, size=44, leading=41, colors=[INK, INK, ORANGE])
    para(
        c,
        "AEO and GEO work when a page gives people a sharp answer, gives machines a clean structure, and gives both enough evidence to believe it.",
        M,
        575,
        500,
        font="Arial",
        size=11,
        leading=15.2,
        color=INK,
    )
    steps = [
        ("CLEAR QUESTION", "Use the words a builder would type or say."),
        ("SHORT ANSWER", "Answer first. Explain second."),
        ("REAL EVIDENCE", "Connect the answer to BigOrange’s process, expertise, and proof."),
        ("ENTITY CONTEXT", "Link people, services, topics, and related pages into one coherent system."),
        ("VISIBLE = SCHEMA", "Keep on-page answers and structured data in exact parity."),
    ]
    sy = 433
    for idx, (title, body) in enumerate(steps, start=1):
        x = M if idx % 2 == 1 else M + 270
        row = (idx - 1) // 2
        y0 = sy - row * 112
        width = 256 if idx < 5 else W - 2 * M
        if idx == 5:
            x = M
        rounded_card(c, x, y0, width, 94, PAPER, stroke=HexColor("#D9CFC2"), radius=18, shadow=True)
        number_icon(c, idx, x + 14, y0 + 58, ORANGE, BLACK, 22)
        c.setFont("ArialBlack", 11)
        c.setFillColor(INK)
        c.drawString(x + 45, y0 + 66, title)
        para(c, body, x + 45, y0 + 54, width - 59, font="Arial", size=8.6, leading=11.4, color=HexColor("#484542"))
    rounded_card(c, M, 75, W - 2 * M, 82, BLACK, radius=18, shadow=True)
    c.setFont("GeorgiaItalic", 15)
    c.setFillColor(LIGHT)
    c.drawString(M + 20, 125, "The rule that keeps the system honest:")
    para(
        c,
        "THE PAGE SAYS THE SAME THING<br/>TO PEOPLE AND MACHINES.",
        M + 20,
        111,
        W - 2 * M - 40,
        font="ArialBlack",
        size=12.6,
        leading=14.2,
        color=ORANGE,
    )
    page_footer(c, 7, "AI-search strategy + FAQ parity", "light")
    c.showPage()

    # 08 — Content system
    page_background(c, BLACK)
    page_header(c, 8, "Content system", "dark")
    label(c, "One hub / many entry points", M, 710, ORANGE)
    headline(c, ["ONE HUB.", "A WHOLE", "SYSTEM."], M, 704, size=47, leading=43, colors=[LIGHT, LIGHT, ORANGE])
    para(
        c,
        "The pillar does not have to carry every question alone. Each supporting asset has one clear job and a deliberate path back to the offer.",
        M,
        570,
        500,
        font="Arial",
        size=10.6,
        leading=14.8,
        color=HexColor("#CCC8C2"),
    )
    system_cards = [
        ("PILLAR", "Marketing Agency for Builders", "Own the category language and frame the full decision."),
        ("ARTICLE", "How Should a Home Builder Market?", "Meet strategy questions early and pull readers into the system."),
        ("ARTICLE", "What Should Builders Expect?", "Turn comparison intent into fit, process, and proof."),
        ("FAQ + DOWNLOAD", "Answers people can use", "Handle objections, earn answer-engine visibility, and create a practical next step."),
    ]
    cw = (W - 2 * M - 12) / 2
    for idx, (kind, title, body) in enumerate(system_cards):
        col = idx % 2
        row = idx // 2
        x = M + col * (cw + 12)
        y0 = 376 - row * 136
        rounded_card(c, x, y0, cw, 120, HexColor("#171819"), stroke=HexColor("#303234"), radius=18, shadow=True)
        label(c, kind, x + 16, y0 + 95, ORANGE, 6.5)
        c.setFont("ArialBlack", 11.4)
        c.setFillColor(LIGHT)
        c.drawString(x + 16, y0 + 69, title)
        para(c, body, x + 16, y0 + 55, cw - 32, font="Arial", size=8.6, leading=11.6, color=HexColor("#BDBAB5"))
    label(c, "Editorial operating rhythm", M, 194, ORANGE, 6.8)
    workflow = ["SME", "DRAFT", "FACT", "SEO / AEO", "STAGE", "PUBLISH", "REFRESH"]
    available = W - 2 * M
    gap = 6
    wf_w = (available - gap * 6) / 7
    for idx, item in enumerate(workflow):
        x = M + idx * (wf_w + gap)
        fill = ORANGE if idx in (0, 2, 5) else CREAM
        rounded_card(c, x, 118, wf_w, 55, fill, radius=11, shadow=False)
        para(c, item, x + 5, 154, wf_w - 10, font="ConsolasBold", size=6.2, leading=8.1, color=BLACK, align=TA_CENTER)
    para(
        c,
        "The two-hour target is built into the workflow. Measure it during the first approved production cycle.",
        M,
        100,
        W - 2 * M,
        font="Arial",
        size=8.2,
        leading=11.2,
        color=HexColor("#AFAAA4"),
    )
    page_footer(c, 8, "Pillar + articles + workflow", "dark")
    c.showPage()

    # 09 — Industry Signal direction
    page_background(c, PAPER)
    page_header(c, 9, "Experience direction one", "light")
    label(c, "Industry Signal", M, 710, ORANGE)
    headline(c, ["BOLD ENOUGH", "TO STOP", "THE SCROLL."], M, 704, size=42, leading=39, colors=[INK, INK, ORANGE])
    para(
        c,
        "A harder-edged, editorial direction built around construction imagery, dimensional type, decisive contrast, and an explicit content system.",
        M,
        575,
        490,
        font="Arial",
        size=10.3,
        leading=14.2,
        color=INK,
    )
    cover_image(c, SHOT_DIR / "industry-desktop-hero.png", M, 309, 355, 235, radius=20, border=HexColor("#CFC6B8"))
    draw_device(c, SHOT_DIR / "industry-mobile-system.png", 423, 309, 132, 235, "system")
    rounded_card(c, M, 117, W - 2 * M, 166, BLACK, radius=20, shadow=True)
    label(c, "Design logic", M + 18, 253, ORANGE, 6.8)
    checks = [
        "Real builder imagery in a split-field hero",
        "Dimensional icons and bolder cards",
        "Swipeable process rail",
        "Images spaced across the long form",
        "Exact logo in a dedicated final chamber",
    ]
    for idx, item in enumerate(checks):
        col = idx % 2
        row = idx // 2
        x = M + 18 + col * 248
        y0 = 220 - row * 40
        check_row(c, x, y0, item, color=LIGHT, dot_color=ORANGE, width=230, size=8.1)
    c.setFillColor(ORANGE)
    c.roundRect(M, 74, W - 2 * M, 28, 10, fill=1, stroke=0)
    c.setFillColor(BLACK)
    c.setFont("ConsolasBold", 7.4)
    c.drawString(M + 12, 84, INDUSTRY_URL)
    add_link(c, INDUSTRY_URL, M, 74, W - 2 * M, 28)
    page_footer(c, 9, "Live noindex review build", "light")
    c.showPage()

    # 10 — Primary Portfolio direction
    page_background(c, BLACK)
    page_header(c, 10, "Experience direction two", "dark")
    label(c, "Primary Portfolio", M, 710, ORANGE)
    headline(c, ["A FASTER,", "MORE CINEMATIC", "STORY."], M, 704, size=41, leading=38, colors=[LIGHT, LIGHT, ORANGE])
    para(
        c,
        "This direction borrows the pace and typographic confidence of the Primary Portfolio, then rebuilds it around BigOrange’s audience, colors, proof, and home-builder category.",
        M,
        575,
        500,
        font="Arial",
        size=10.3,
        leading=14.2,
        color=HexColor("#CCC8C2"),
    )
    cover_image(c, SHOT_DIR / "primary-desktop-hero.png", M, 320, 354, 224, radius=20, border=HexColor("#333638"))
    draw_device(c, SHOT_DIR / "primary-mobile-modules.png", 423, 320, 132, 224, "modules")
    rounded_card(c, M, 115, W - 2 * M, 178, HexColor("#171819"), stroke=HexColor("#303234"), radius=20, shadow=True)
    label(c, "Design logic", M + 18, 263, ORANGE, 6.8)
    checks = [
        "Shorter cinematic opening",
        "Stacked type with real depth and shadow",
        "Liquid-glass tabs and workspaces",
        "Faster cadence with the same substance",
        "Mobile tuned independently from desktop",
    ]
    for idx, item in enumerate(checks):
        col = idx % 2
        row = idx // 2
        x = M + 18 + col * 248
        y0 = 229 - row * 42
        check_row(c, x, y0, item, color=LIGHT, dot_color=ORANGE, width=230, size=8.1)
    c.setFillColor(ORANGE)
    c.roundRect(M, 72, W - 2 * M, 28, 10, fill=1, stroke=0)
    c.setFillColor(BLACK)
    c.setFont("ConsolasBold", 7.4)
    c.drawString(M + 12, 82, PRIMARY_URL)
    add_link(c, PRIMARY_URL, M, 72, W - 2 * M, 28)
    page_footer(c, 10, "Live noindex review build", "dark")
    c.showPage()

    # 11 — Logo handoff
    page_background(c, CREAM)
    page_header(c, 11, "Logo resolution", "light")
    label(c, "The ending now belongs to the brand", M, 710, ORANGE)
    headline(c, ["THE PARTICLES", "END IN THE", "REAL LOGO."], M, 704, size=42, leading=39, colors=[INK, INK, ORANGE])
    para(
        c,
        "The animation does not approximate the mark. It hands off to the exact BigOrange asset at full clarity, inside a dedicated final section with nothing fighting for attention.",
        M,
        575,
        500,
        font="Arial",
        size=10.5,
        leading=14.5,
        color=INK,
    )
    rounded_card(c, M, 388, W - 2 * M, 148, BLACK, radius=22, shadow=True)
    draw_logo(c, M + 54, 429, width=W - 2 * M - 108)
    cover_image(c, SHOT_DIR / "industry-desktop-logo.png", M, 205, 256, 153, radius=18, border=HexColor("#D0C6B7"))
    cover_image(c, SHOT_DIR / "primary-desktop-logo.png", M + 272, 205, 256, 153, radius=18, border=HexColor("#D0C6B7"))
    specs = [
        ("EXACT SOURCE", "1000 × 338 transparent asset"),
        ("DEDICATED CHAMBER", "No competing copy or decoration"),
        ("RESPONSIVE", "Wide and mobile layouts keep the mark isolated"),
        ("ACCESSIBLE MOTION", "Reduced motion resolves directly to the logo"),
    ]
    for idx, (title, body) in enumerate(specs):
        x = M + (idx % 2) * 272
        y0 = 126 - (idx // 2) * 55
        label(c, title, x, y0 + 29, ORANGE, 6.2)
        para(c, body, x, y0 + 20, 250, font="ArialBold", size=8.2, leading=10.6, color=INK)
    page_footer(c, 11, "Exact asset + particle handoff", "light")
    c.showPage()

    # 12 — Mobile craft
    page_background(c, BLACK)
    page_header(c, 12, "Responsive craft", "dark")
    label(c, "Mobile is a real design", M, 710, ORANGE)
    headline(c, ["NOT A SMALL", "DESKTOP."], M, 704, size=47, leading=43, colors=[LIGHT, ORANGE])
    para(
        c,
        "The content order, type scale, controls, cards, and logo chamber were tuned for narrow screens—not simply compressed until they fit.",
        M,
        602,
        500,
        font="Arial",
        size=10.4,
        leading=14.5,
        color=HexColor("#CAC6C0"),
    )
    phone_y = 310
    phone_w = 122
    phone_h = 250
    phone_gap = (W - 2 * M - phone_w * 4) / 3
    phone_images = [
        ("industry-mobile-hero.png", "industry hero"),
        ("industry-mobile-system.png", "industry system"),
        ("primary-mobile-hero.png", "portfolio hero"),
        ("primary-mobile-modules.png", "portfolio modules"),
    ]
    for idx, (name, title) in enumerate(phone_images):
        x = M + idx * (phone_w + phone_gap)
        draw_device(c, SHOT_DIR / name, x, phone_y, phone_w, phone_h, title)
    metrics = [
        ("0", "HORIZONTAL OVERFLOW"),
        ("4", "VIEWPORT WIDTHS TESTED"),
        ("7", "VISIBLE FAQS / DIRECTION"),
        ("40×40", "BRANDED ICON SYSTEM"),
    ]
    mw = (W - 2 * M - 12 * 3) / 4
    for idx, (value, caption) in enumerate(metrics):
        x = M + idx * (mw + 12)
        rounded_card(c, x, 169, mw, 103, HexColor("#171819"), stroke=HexColor("#303234"), radius=16, shadow=False)
        c.setFont("ArialBlack", 22)
        c.setFillColor(ORANGE)
        c.drawCentredString(x + mw / 2, 225, value)
        para(c, caption, x + 8, 209, mw - 16, font="ConsolasBold", size=6.4, leading=8.4, color=LIGHT, align=TA_CENTER)
    para(
        c,
        "Menus, rails, tabs, FAQs, focus behavior, and responsive spacing all passed in-browser QA.",
        M,
        130,
        W - 2 * M,
        font="Arial",
        size=8.8,
        leading=12.2,
        color=HexColor("#B5B1AB"),
    )
    page_footer(c, 12, "390 / 768 / 1024 / 1440 QA", "dark")
    c.showPage()

    # 13 — WordPress and technical handoff
    page_background(c, PAPER)
    page_header(c, 13, "WordPress + technical", "light")
    label(c, "From review build to production", M, 710, ORANGE)
    headline(c, ["READY TO MOVE", "INTO WORDPRESS."], M, 704, size=43, leading=40, colors=[INK, ORANGE])
    para(
        c,
        "The hardcoded experiences establish the standard. Production still needs to preserve editability, exact CMS behavior, and the controls that keep search and performance clean.",
        M,
        606,
        505,
        font="Arial",
        size=10.5,
        leading=14.5,
        color=INK,
    )
    layers = [
        ("REVIEW LAYER", "Two fully coded, responsive, noindex experience directions.", "live"),
        ("CONTENT LAYER", "Editable modular sections, reusable proof blocks, FAQ, and calls to action.", "complete"),
        ("SEARCH LAYER", "Metadata, canonicals, schema, breadcrumbs, sitemap, and internal links.", "candidate"),
        ("PERFORMANCE LAYER", "Core Web Vitals work order, image handling, plugin audit, and duplicate-schema check.", "candidate"),
    ]
    y0 = 458
    for idx, (title, body, state) in enumerate(layers):
        rounded_card(c, M, y0 - idx * 94, W - 2 * M, 78, CREAM if idx % 2 == 0 else BLACK, stroke=HexColor("#D8CEC1") if idx % 2 == 0 else HexColor("#303234"), radius=18, shadow=True)
        status_dot(c, M + 20, y0 - idx * 94 + 52, state)
        c.setFont("ArialBlack", 11.2)
        c.setFillColor(INK if idx % 2 == 0 else LIGHT)
        c.drawString(M + 35, y0 - idx * 94 + 46, title)
        para(c, body, M + 208, y0 - idx * 94 + 57, W - 2 * M - 228, font="Arial", size=8.2, leading=10.9, color=INK if idx % 2 == 0 else HexColor("#C4C0BA"))
    rounded_card(c, M, 75, W - 2 * M, 102, ORANGE, radius=18, shadow=True)
    label(c, "Production sequence", M + 18, 149, BLACK, 6.6)
    para(
        c,
        "<b>Janice fact review</b>  →  <b>choose direction</b>  →  <b>stage in the exact WordPress environment</b>  →  <b>validate schema, performance, mobile, and accessibility</b>  →  <b>approve publication</b>",
        M + 18,
        134,
        W - 2 * M - 36,
        font="Arial",
        size=9.2,
        leading=13.2,
        color=BLACK,
    )
    page_footer(c, 13, "WordPress work order + acceptance gate", "light")
    c.showPage()

    # 14 — 90-day roadmap
    page_background(c, ORANGE)
    page_header(c, 14, "90-day roadmap", "orange")
    label(c, "The next phase has a job", M, 710, BLACK)
    headline(c, ["NINETY DAYS.", "NO MYSTERY."], M, 704, size=46, leading=43, colors=[BLACK, LIGHT])
    para(
        c,
        "The launch path is sequenced to protect the facts, protect the existing rankings, and get the authority system into market without creating technical debt.",
        M,
        602,
        500,
        font="ArialBold",
        size=10.5,
        leading=14.5,
        color=BLACK,
    )
    roadmap = [
        ("DAYS 0–30", "VALIDATE", [
            "Run Janice’s factual review",
            "Select the visual direction",
            "Confirm WordPress modules and plugins",
            "Stage the pillar, FAQ, and metadata",
            "Validate visible and schema parity",
        ]),
        ("DAYS 31–60", "LAUNCH", [
            "Publish the authority hub",
            "Release both supporting articles",
            "Connect breadcrumbs and internal links",
            "Ship the downloadable asset",
            "Confirm sitemap and indexation",
        ]),
        ("DAYS 61–90", "LEARN", [
            "Review qualified-query coverage",
            "Refresh weak or ambiguous answers",
            "Measure the first editorial cycle",
            "Expand the proof and FAQ backlog",
            "Prioritize the next builder questions",
        ]),
    ]
    gap = 12
    cw = (W - 2 * M - gap * 2) / 3
    for idx, (period, title, items) in enumerate(roadmap):
        x = M + idx * (cw + gap)
        rounded_card(c, x, 169, cw, 380, BLACK if idx != 1 else CREAM, stroke=Color(1, 1, 1, alpha=0.25), radius=22, shadow=True)
        text_color = LIGHT if idx != 1 else BLACK
        pill(c, period, x + 16, 505, ORANGE if idx != 1 else BLACK, BLACK if idx != 1 else LIGHT, size=6.5, pad_x=8, h=18)
        c.setFont("ArialBlack", 22)
        c.setFillColor(ORANGE if idx != 1 else ORANGE_2)
        c.drawString(x + 16, 463, title)
        yy = 423
        for item in items:
            check_row(c, x + 16, yy, item, color=text_color, dot_color=ORANGE, width=cw - 32, size=8.1)
            yy -= 53
    rounded_card(c, M, 76, W - 2 * M, 67, CREAM, radius=17, shadow=True)
    c.setFont("GeorgiaItalic", 13)
    c.setFillColor(BLACK)
    c.drawString(M + 18, 116, "The goal is not more content.")
    para(
        c,
        "MORE USEFUL AUTHORITY.<br/>AROUND QUESTIONS THAT CREATE FIT.",
        M + 18,
        111,
        W - 2 * M - 36,
        font="ArialBlack",
        size=11.2,
        leading=12.6,
        color=ORANGE_2,
    )
    page_footer(c, 14, "90-day implementation roadmap", "orange")
    c.showPage()

    # 15 — 12-month flywheel
    page_background(c, BLACK)
    page_header(c, 15, "12-month expansion", "dark")
    label(c, "Compounding authority", M, 710, ORANGE)
    headline(c, ["A YEAR THAT", "GETS SHARPER", "EVERY QUARTER."], M, 704, size=40, leading=38, colors=[LIGHT, LIGHT, ORANGE])
    para(
        c,
        "The bonus roadmap turns the pilot into an operating rhythm: protect, deepen, segment, and refresh.",
        M,
        580,
        500,
        font="Arial",
        size=10.5,
        leading=14.5,
        color=HexColor("#CAC6C0"),
    )
    quarters = [
        ("Q1", "FOUNDATION", "Launch the hub, articles, FAQ, internal links, download, and baseline."),
        ("Q2", "PROOF + DEPTH", "Add builder examples, process proof, decision-stage answers, and SME-led content."),
        ("Q3", "SEGMENTS", "Expand around custom builders, growth-stage teams, markets, and service-specific problems."),
        ("Q4", "REFRESH", "Consolidate overlap, strengthen winners, update answers, and plan the next annual cycle."),
    ]
    for idx, (quarter, title, body) in enumerate(quarters):
        y0 = 448 - idx * 104
        rounded_card(c, M, y0, W - 2 * M, 86, HexColor("#171819"), stroke=HexColor("#303234"), radius=18, shadow=True)
        c.setFont("ArialBlack", 27)
        c.setFillColor(ORANGE)
        c.drawString(M + 18, y0 + 28, quarter)
        c.setFont("ArialBlack", 13)
        c.setFillColor(LIGHT)
        c.drawString(M + 92, y0 + 48, title)
        para(c, body, M + 92, y0 + 38, W - 2 * M - 112, font="Arial", size=8.8, leading=11.8, color=HexColor("#BEBAB4"))
    rounded_card(c, M, 72, W - 2 * M, 68, ORANGE, radius=17, shadow=True)
    label(c, "Measure what matters", M + 18, 116, BLACK, 6.4)
    para(
        c,
        "Qualified visibility  /  assisted inquiries  /  answer freshness  /  editorial throughput",
        M + 18,
        106,
        W - 2 * M - 36,
        font="ArialBold",
        size=8.8,
        leading=11.8,
        color=BLACK,
    )
    page_footer(c, 15, "12-month authority roadmap", "dark")
    c.showPage()

    # 16 — Added value
    page_background(c, CREAM)
    page_header(c, 16, "Above the original scope", "light")
    label(c, "The experience layer went further", M, 710, ORANGE)
    headline(c, ["THE STRATEGY", "NOW HAS A", "STAGE."], M, 704, size=46, leading=42, colors=[INK, INK, ORANGE])
    para(
        c,
        "The proposal called for an authority-hub pilot. The delivery now includes two complete coded worlds that let BigOrange react to the work instead of imagining it.",
        M,
        575,
        505,
        font="Arial",
        size=10.7,
        leading=14.8,
        color=INK,
    )
    value_items = [
        ("TWO CODED DIRECTIONS", "Two coded worlds on one strategic spine."),
        ("LIQUID-GLASS UI", "Layered cards, tabs, rails, and controls with clear hierarchy."),
        ("BRANDED ICON SYSTEM", "Citrus cues. No generic number tiles."),
        ("PARTICLE LOGO HANDOFF", "Animation resolves into the exact logo asset."),
        ("FULL RESPONSIVE QA", "Desktop, tablet, and mobile layouts exercised in-browser."),
        ("LIVE REVIEW DEPLOY", "Both directions published as noindex Netlify previews."),
        ("HUMANIZED COPY", "Direct builder language. No assistant fog."),
        ("AEO / GEO LAYER", "FAQ parity, entity context, and answer-first structure."),
    ]
    cw = (W - 2 * M - 12) / 2
    for idx, (title, body) in enumerate(value_items):
        x = M + (idx % 2) * (cw + 12)
        y0 = 448 - (idx // 2) * 100
        fill = BLACK if idx % 3 != 1 else ORANGE
        text_color = LIGHT if fill == BLACK else BLACK
        rounded_card(c, x, y0, cw, 85, fill, radius=17, shadow=True)
        label(c, title, x + 15, y0 + 60, ORANGE if fill == BLACK else BLACK, 6.1)
        para(c, body, x + 15, y0 + 50, cw - 30, font="ArialBold", size=8.2, leading=10.9, color=text_color)
    rounded_card(c, M, 73, W - 2 * M, 67, PAPER, stroke=HexColor("#D7CDC0"), radius=17, shadow=True)
    c.setFont("GeorgiaItalic", 12.5)
    c.setFillColor(INK)
    c.drawString(M + 18, 112, "Above scope does not mean outside the strategy.")
    para(
        c,
        "IT MAKES THE STRATEGY EASIER TO SEE, JUDGE, AND CHOOSE.",
        M + 18,
        98,
        W - 2 * M - 36,
        font="ArialBlack",
        size=10.8,
        leading=12.6,
        color=ORANGE_2,
    )
    page_footer(c, 16, "Two noindex experience directions", "light")
    c.showPage()

    # 17 — Effort allocation
    page_background(c, PAPER)
    page_header(c, 17, "Effort allocation", "light")
    label(c, "Transparent reconstruction", M, 710, ORANGE)
    headline(c, ["35 HOURS,", "ACCOUNTED FOR."], M, 704, size=46, leading=43, colors=[INK, ORANGE])
    para(
        c,
        "Built from dated artifacts and completed work categories. This is not a precise stopwatch record.",
        M,
        608,
        505,
        font="Arial",
        size=10.4,
        leading=14.4,
        color=INK,
    )
    metric_card(c, M, 480, 252, 92, "31.50", "HOURS ALIGNED TO THE ORIGINAL PROPOSAL")
    metric_card(c, M + 264, 480, 264, 92, "3.50", "HOURS FOR THE TWO ADDED-VALUE EXPERIENCES", fill=ORANGE, value_color=BLACK, caption_color=BLACK)
    workstreams = [
        ("Discovery & Audit", 4.00),
        ("Search Strategy", 4.50),
        ("Content System", 11.00),
        ("Technical & WordPress", 6.50),
        ("Roadmaps & Workflow", 3.75),
        ("Review & Handoff", 1.75),
        ("Added-Value Experiences", 3.50),
    ]
    max_hours = max(v for _, v in workstreams)
    chart_x = M
    chart_y = 190
    chart_w = W - 2 * M
    bar_label_w = 162
    for idx, (name, hours) in enumerate(workstreams):
        y0 = 431 - idx * 40
        c.setFillColor(INK)
        c.setFont("ArialBold", 8.4)
        c.drawString(chart_x, y0 + 7, name)
        base_x = chart_x + bar_label_w
        available = chart_w - bar_label_w - 40
        c.setFillColor(HexColor("#E2D8CB"))
        c.roundRect(base_x, y0, available, 15, 7.5, fill=1, stroke=0)
        bar_w = available * hours / max_hours
        c.setFillColor(ORANGE if name != "Added-Value Experiences" else BLACK)
        c.roundRect(base_x, y0, bar_w, 15, 7.5, fill=1, stroke=0)
        c.setFillColor(INK)
        c.setFont("ConsolasBold", 8)
        c.drawRightString(chart_x + chart_w, y0 + 4, f"{hours:.2f}")
    rounded_card(c, M, 74, W - 2 * M, 86, BLACK, radius=18, shadow=True)
    label(c, "Open the live Google Sheet", M + 18, 132, ORANGE, 6.4)
    c.setFillColor(LIGHT)
    c.setFont("ArialBold", 9)
    c.drawString(M + 18, 106, "BIGORANGE AUTHORITY HUB — LIVE EFFORT WORKBOOK")
    c.setFillColor(ORANGE)
    c.setFont("ConsolasBold", 6.6)
    c.drawRightString(W - M - 18, 106, "4 TABS  /  CHART  /  35 HOURS")
    add_link(c, SHEET_URL, M, 74, W - 2 * M, 86)
    page_footer(c, 17, "Live effort workbook", "light")
    c.showPage()

    # 18 — Closing
    page_background(c, BLACK)
    cover_image(
        c,
        SHOT_DIR / "industry-desktop-logo.png",
        0,
        0,
        W,
        300,
        overlay=Color(0.02, 0.02, 0.02, alpha=0.42),
    )
    draw_logo(c, M, H - 91, width=178)
    label(c, "Final production decision", M, 677, ORANGE)
    y = headline(c, ["READY WHEN", "THE FACTS ARE."], M, 670, size=48, leading=44, colors=[LIGHT, ORANGE])
    para(
        c,
        "The system is built. The experiences are live for review. The remaining work is deliberate: verify, choose, stage, validate, approve.",
        M,
        y - 18,
        490,
        font="Arial",
        size=11.4,
        leading=15.8,
        color=HexColor("#D1CDC7"),
    )
    next_steps = [
        "Janice completes the factual review.",
        "BigOrange chooses the experience direction.",
        "The approved direction moves into editable WordPress modules.",
        "Search, accessibility, performance, and mobile QA run on staging.",
        "Publication happens only after the final approval.",
    ]
    y0 = 397
    for idx, step in enumerate(next_steps, start=1):
        rounded_card(c, M, y0 - (idx - 1) * 53, W - 2 * M, 40, HexColor("#171819"), stroke=HexColor("#303234"), radius=12, shadow=False)
        number_icon(c, idx, M + 10, y0 + 8 - (idx - 1) * 53, ORANGE, BLACK, 22)
        c.setFillColor(LIGHT)
        c.setFont("ArialBold", 9.3)
        c.drawString(M + 43, y0 + 14 - (idx - 1) * 53, step)
    rounded_card(c, M, 64, W - 2 * M, 73, ORANGE, radius=18, shadow=True)
    c.setFillColor(BLACK)
    c.setFont("ArialBlack", 17)
    c.drawString(M + 18, 106, "BUILD SOMETHING WORTH CHOOSING.")
    c.setFont("ConsolasBold", 7)
    c.drawString(M + 18, 84, "INDUSTRY SIGNAL")
    c.drawRightString(W - M - 18, 84, "PRIMARY PORTFOLIO")
    add_link(c, INDUSTRY_URL, M, 64, (W - 2 * M) / 2, 73)
    add_link(c, PRIMARY_URL, W / 2, 64, (W - 2 * M) / 2, 73)
    c.setFillColor(Color(1, 1, 1, alpha=0.55))
    c.setFont("Consolas", 6.7)
    c.drawString(M, 26, "BIGORANGE.MARKETING  /  AUTHORITY HUB DELIVERY REVIEW")
    c.drawRightString(W - M, 26, "AUGUST 21, 2026")
    c.showPage()

    c.save()
    return OUT


if __name__ == "__main__":
    register_fonts()
    output = build_pdf()
    print(output)
