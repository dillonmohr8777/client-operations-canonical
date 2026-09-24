# THESIS: The audit is a curated evidence catalog, not an orange-and-black contractor brochure or text laid over project photography.
# OWN-WORLD: Mineral white, carbon black, exact Meza orange, grout-like gutters, crisp image plates, architectural schedules, and square catalog blocks.
# STORY: The reader sees the opportunity, understands the proof, moves through the priority system, and leaves with a sequenced 90-day plan.
# FIRST VIEWPORT: Exact logo and large title occupy a quiet white field; three verified project images lock into a masonry grid below; preparation details sit in one orange corner block.
# FORM: Museum material catalog, fifth grounded direction, seed key 92729d08.
# FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md

from __future__ import annotations

import json
import math
import os
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Flowable,
    Frame,
    HRFlowable,
    Image,
    KeepTogether,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.lib.utils import ImageReader


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
TMP = ROOT / "tmp" / "pdfs"
OUT = ROOT / "output" / "pdf" / "Meza-Tile-and-Stone-Website-SEO-AI-Visibility-Audit.pdf"
TMP.mkdir(parents=True, exist_ok=True)
OUT.parent.mkdir(parents=True, exist_ok=True)

PAGE_W, PAGE_H = letter
ORANGE = colors.HexColor("#F27405")
ORANGE_2 = colors.HexColor("#FF7A0A")
INK = colors.HexColor("#111111")
CHARCOAL = colors.HexColor("#1A1A1A")
GRAPHITE = colors.HexColor("#30302E")
MID = colors.HexColor("#66645F")
LINE = colors.HexColor("#D8D4CB")
PAPER = colors.HexColor("#F7F6F2")
STONE = colors.HexColor("#ECE9E2")
WHITE = colors.white
PALE_ORANGE = colors.HexColor("#FFF1E6")
PALE_GREEN = colors.HexColor("#E8F0EA")
GREEN = colors.HexColor("#2E7452")
PALE_BLUE = colors.HexColor("#E7EEF2")
BLUE = colors.HexColor("#345D70")


def _install_font_instances() -> dict[str, str]:
    import sys
    local_deps = TMP / "pydeps"
    if local_deps.exists():
        sys.path.insert(0, str(local_deps))

    archivo = ASSETS / "Archivo-VariableFont_wdth_wght.ttf"
    source = ASSETS / "SourceSans3-VariableFont_wght.ttf"
    source_italic = ASSETS / "SourceSans3-Italic-VariableFont_wght.ttf"
    instances = {
        "Archivo-Regular": (archivo, {"wght": 400, "wdth": 100}),
        "Archivo-Semibold": (archivo, {"wght": 600, "wdth": 100}),
        "Archivo-Bold": (archivo, {"wght": 700, "wdth": 100}),
        "Archivo-ExtraBold": (archivo, {"wght": 800, "wdth": 100}),
        "Archivo-ExtraBoldNarrow": (archivo, {"wght": 800, "wdth": 88}),
        "Archivo-BlackNarrow": (archivo, {"wght": 900, "wdth": 86}),
        "SourceSans3": (source, {"wght": 400}),
        "SourceSans3-Semibold": (source, {"wght": 600}),
        "SourceSans3-Bold": (source, {"wght": 700}),
        "SourceSans3-Italic": (source_italic, {"wght": 400}),
    }
    registered = {}
    try:
        from fontTools.ttLib import TTFont as FTFont
        from fontTools.varLib.instancer import instantiateVariableFont

        for name, (font_source, axes) in instances.items():
            target = TMP / f"{name}.ttf"
            if not target.exists():
                variable_font = FTFont(str(font_source))
                static_font = instantiateVariableFont(variable_font, axes, inplace=False)
                static_font.save(str(target))
            pdfmetrics.registerFont(TTFont(name, str(target)))
            registered[name] = name
    except Exception:
        pdfmetrics.registerFont(TTFont("Archivo-Regular", str(archivo)))
        pdfmetrics.registerFont(TTFont("SourceSans3", str(source)))
        pdfmetrics.registerFont(TTFont("SourceSans3-Italic", str(source_italic)))
        for name in instances:
            if name == "SourceSans3-Italic":
                registered[name] = "SourceSans3-Italic"
            elif name.startswith("Archivo"):
                registered[name] = "Archivo-Regular"
            else:
                registered[name] = "SourceSans3"
    registered.update({
        "Montserrat": registered["SourceSans3"],
        "Montserrat-Semibold": registered["SourceSans3-Semibold"],
        "Montserrat-Bold": registered["Archivo-Bold"],
        "Montserrat-ExtraBold": registered["Archivo-ExtraBold"],
        "Montserrat-Italic": registered["SourceSans3-Italic"],
    })
    return registered


FONTS = _install_font_instances()


def font(name: str) -> str:
    return FONTS.get(name, FONTS.get("SourceSans3", "Helvetica"))


styles = getSampleStyleSheet()
styles.add(
    ParagraphStyle(
        name="Kicker",
        fontName=font("SourceSans3-Semibold"),
        fontSize=7.2,
        leading=9,
        tracking=0.8,
        textColor=ORANGE,
        spaceAfter=0,
        uppercase=True,
    )
)
styles.add(
    ParagraphStyle(
        name="PageTitle",
        fontName=font("Archivo-Bold"),
        fontSize=23,
        leading=25.5,
        textColor=INK,
        spaceAfter=7,
    )
)
styles.add(
    ParagraphStyle(
        name="Deck",
        fontName=font("SourceSans3"),
        fontSize=9.5,
        leading=13.4,
        textColor=MID,
        spaceAfter=12,
    )
)
styles.add(
    ParagraphStyle(
        name="H2x",
        fontName=font("Archivo-Semibold"),
        fontSize=12.5,
        leading=15,
        textColor=INK,
        spaceBefore=10,
        spaceAfter=6,
    )
)
styles.add(
    ParagraphStyle(
        name="H3x",
        fontName=font("SourceSans3-Bold"),
        fontSize=9.4,
        leading=13,
        textColor=GRAPHITE,
        spaceBefore=5,
        spaceAfter=3,
    )
)
styles.add(
    ParagraphStyle(
        name="Bodyx",
        fontName=font("SourceSans3"),
        fontSize=8.5,
        leading=11.9,
        textColor=GRAPHITE,
        spaceAfter=5,
    )
)
styles.add(
    ParagraphStyle(
        name="BodySmall",
        fontName=font("SourceSans3"),
        fontSize=7.2,
        leading=9.8,
        textColor=GRAPHITE,
        spaceAfter=3,
    )
)
styles.add(
    ParagraphStyle(
        name="Bulletx",
        fontName=font("SourceSans3"),
        fontSize=8.2,
        leading=11.6,
        leftIndent=10,
        firstLineIndent=-10,
        bulletIndent=0,
        textColor=GRAPHITE,
        spaceAfter=3,
    )
)
styles.add(
    ParagraphStyle(
        name="TableHead",
        fontName=font("SourceSans3-Bold"),
        fontSize=7.1,
        leading=8.7,
        textColor=WHITE,
    )
)
styles.add(
    ParagraphStyle(
        name="TableCell",
        fontName=font("SourceSans3"),
        fontSize=6.9,
        leading=8.9,
        textColor=GRAPHITE,
    )
)
styles.add(
    ParagraphStyle(
        name="TableCellBold",
        fontName=font("SourceSans3-Semibold"),
        fontSize=6.9,
        leading=8.9,
        textColor=INK,
    )
)
styles.add(
    ParagraphStyle(
        name="CalloutTitle",
        fontName=font("Archivo-Semibold"),
        fontSize=9.3,
        leading=11,
        textColor=INK,
        spaceAfter=4,
    )
)
styles.add(
    ParagraphStyle(
        name="CalloutBody",
        fontName=font("SourceSans3"),
        fontSize=7.9,
        leading=10.9,
        textColor=GRAPHITE,
    )
)
styles.add(
    ParagraphStyle(
        name="Source",
        fontName=font("SourceSans3"),
        fontSize=6.6,
        leading=9,
        textColor=MID,
        spaceAfter=4,
    )
)


def P(text: str, style: str = "Bodyx") -> Paragraph:
    return Paragraph(text, styles[style])


def bullet(text: str) -> Paragraph:
    return Paragraph(f"- {text}", styles["Bulletx"])


def section_header(kicker: str, title: str, deck: str):
    return [
        P(title, "PageTitle"),
        P(deck, "Deck"),
        HRFlowable(width="100%", thickness=1.2, color=ORANGE, spaceBefore=0, spaceAfter=10),
    ]


class StatusChip(Flowable):
    def __init__(self, label: str, color=ORANGE, width=1.1 * inch):
        super().__init__()
        self.label = label
        self.color = color
        self.width = width
        self.height = 18

    def draw(self):
        self.canv.setFillColor(self.color)
        self.canv.roundRect(0, 0, self.width, self.height, 9, fill=1, stroke=0)
        self.canv.setFillColor(WHITE)
        self.canv.setFont(font("Montserrat-Bold"), 6.5)
        self.canv.drawCentredString(self.width / 2, 6.2, self.label.upper())


class MetricStrip(Flowable):
    def __init__(self, metrics: list[tuple[str, str, str]], width=6.9 * inch):
        super().__init__()
        self.metrics = metrics
        self.width = width
        self.height = 60

    def draw(self):
        count = len(self.metrics)
        cell = self.width / count
        self.canv.setStrokeColor(INK)
        self.canv.setLineWidth(0.8)
        self.canv.line(0, self.height - 1, self.width, self.height - 1)
        for index, (value, label, tone) in enumerate(self.metrics):
            x = index * cell
            accent = {"orange": ORANGE, "green": GREEN, "blue": BLUE}.get(tone, MID)
            if index:
                self.canv.setStrokeColor(LINE)
                self.canv.setLineWidth(0.55)
                self.canv.line(x, 7, x, self.height - 7)
            self.canv.setFillColor(accent)
            self.canv.rect(x, self.height - 6, cell - 1, 5, fill=1, stroke=0)
            self.canv.setFillColor(INK)
            self.canv.setFont(font("Archivo-Bold"), 18)
            self.canv.drawString(x + 8, 27, value)
            self.canv.setFillColor(MID)
            self.canv.setFont(font("SourceSans3-Semibold"), 6.3)
            self.canv.drawString(x + 8, 11, label.upper())


class Callout(Flowable):
    def __init__(self, title: str, body: str, tone="orange", width=6.9 * inch):
        super().__init__()
        self.title = title
        self.body = body
        self.width = width
        self.tone = tone
        self.title_p = P(title, "CalloutTitle")
        self.body_p = P(body, "CalloutBody")
        self.height = 62

    def wrap(self, availWidth, availHeight):
        self.width = min(self.width, availWidth)
        tw, th = self.title_p.wrap(self.width - 34, availHeight)
        bw, bh = self.body_p.wrap(self.width - 34, availHeight)
        self.height = max(58, th + bh + 23)
        return self.width, self.height

    def draw(self):
        fill = {"orange": PALE_ORANGE, "green": PALE_GREEN, "blue": PALE_BLUE}.get(self.tone, PAPER)
        accent = {"orange": ORANGE, "green": GREEN, "blue": BLUE}.get(self.tone, MID)
        self.canv.setFillColor(fill)
        self.canv.rect(0, 0, self.width, self.height, fill=1, stroke=0)
        self.canv.setStrokeColor(accent)
        self.canv.setLineWidth(1.2)
        self.canv.line(0, self.height, self.width, self.height)
        tw, th = self.title_p.wrap(self.width - 34, self.height)
        bw, bh = self.body_p.wrap(self.width - 34, self.height)
        self.title_p.drawOn(self.canv, 16, self.height - th - 11)
        self.body_p.drawOn(self.canv, 16, self.height - th - bh - 14)


class BarChart(Flowable):
    def __init__(self, rows: list[tuple[str, int, str]], width=6.8 * inch):
        super().__init__()
        self.rows = rows
        self.width = width
        self.height = 28 * len(rows) + 8

    def draw(self):
        label_w = 1.55 * inch
        bar_w = self.width - label_w - 0.55 * inch
        for index, (label, score, note) in enumerate(self.rows):
            y = self.height - 25 - index * 28
            self.canv.setFillColor(GRAPHITE)
            self.canv.setFont(font("Montserrat-Semibold"), 6.6)
            self.canv.drawString(0, y + 5, label.upper())
            self.canv.setFillColor(colors.HexColor("#E7E8EA"))
            self.canv.roundRect(label_w, y, bar_w, 10, 5, fill=1, stroke=0)
            tone = GREEN if score >= 90 else ORANGE if score >= 70 else colors.HexColor("#C44536")
            self.canv.setFillColor(tone)
            self.canv.roundRect(label_w, y, bar_w * score / 100, 10, 5, fill=1, stroke=0)
            self.canv.setFillColor(INK)
            self.canv.setFont(font("Montserrat-Bold"), 7)
            self.canv.drawRightString(self.width, y + 4, f"{score} {note}")


def table(data, widths, header=True, font_size=6.7, row_bgs=True, valign="TOP"):
    converted = []
    for r, row in enumerate(data):
        converted.append([
            cell if isinstance(cell, Flowable) else P(str(cell), "TableHead" if header and r == 0 else "TableCell")
            for cell in row
        ])
    t = Table(converted, colWidths=widths, repeatRows=1 if header else 0, hAlign="LEFT")
    commands = [
        ("VALIGN", (0, 0), (-1, -1), valign),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 5.5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5.5),
        ("LINEBELOW", (0, 0), (-1, -1), 0.35, LINE),
        ("LINEAFTER", (0, 0), (-2, -1), 0.25, LINE),
    ]
    if header:
        commands += [("BACKGROUND", (0, 0), (-1, 0), INK), ("TEXTCOLOR", (0, 0), (-1, 0), WHITE)]
    if row_bgs:
        for idx in range(1 if header else 0, len(data)):
            if idx % 2 == 0:
                commands.append(("BACKGROUND", (0, idx), (-1, idx), colors.HexColor("#F1EFEA")))
    t.setStyle(TableStyle(commands))
    return t


def draw_crop(canvas, image_path, x, y, w, h):
    image = ImageReader(str(image_path))
    iw, ih = image.getSize()
    scale = max(w / iw, h / ih)
    draw_w, draw_h = iw * scale, ih * scale
    canvas.saveState()
    path = canvas.beginPath()
    path.rect(x, y, w, h)
    canvas.clipPath(path, stroke=0)
    canvas.drawImage(image, x + (w - draw_w) / 2, y + (h - draw_h) / 2, draw_w, draw_h, mask="auto")
    canvas.restoreState()


def draw_cover(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(PAPER)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)

    white_h = 4.05 * inch
    photo_h = PAGE_H - white_h
    gutter = 5
    left_w = 4.7 * inch
    right_x = left_w + gutter
    right_w = PAGE_W - right_x

    draw_crop(canvas, ASSETS / "blue-kitchen-tile.jpg", 0, 0, left_w, photo_h)
    draw_crop(canvas, ASSETS / "green-tile.jpg", right_x, 3.18 * inch, right_w, photo_h - 3.18 * inch)
    draw_crop(canvas, ASSETS / "white-shower-tile.jpg", right_x, 1.60 * inch, right_w, 1.50 * inch)

    canvas.setFillColor(PAPER)
    canvas.rect(0, photo_h, PAGE_W, white_h, fill=1, stroke=0)
    canvas.setFillColor(WHITE)
    canvas.rect(left_w, 0, gutter, photo_h, fill=1, stroke=0)
    canvas.rect(right_x, 3.10 * inch, right_w, gutter, fill=1, stroke=0)
    canvas.rect(right_x, 1.52 * inch, right_w, gutter, fill=1, stroke=0)

    logo = ImageReader(str(ASSETS / "logo-official-transparent.png"))
    canvas.drawImage(logo, 0.48 * inch, PAGE_H - 1.28 * inch, 2.48 * inch, 1.18 * inch, mask="auto", preserveAspectRatio=True)

    canvas.saveState()
    canvas.setFillColor(INK)
    canvas.setStrokeColor(INK)
    canvas.setLineWidth(0.7)
    title = canvas.beginText()
    title.setTextOrigin(0.48 * inch, PAGE_H - 2.08 * inch)
    title.setFont(font("Archivo-BlackNarrow"), 36)
    title.setLeading(0.59 * inch)
    title.setTextRenderMode(2)
    title.textLine("SEO + AI VISIBILITY")
    title.textLine("OPPORTUNITY REPORT")
    canvas.drawText(title)
    canvas.restoreState()
    deck = canvas.beginText()
    deck.setTextOrigin(0.51 * inch, PAGE_H - 3.25 * inch)
    deck.setFont(font("SourceSans3-Semibold"), 8.2)
    deck.setCharSpace(1.75)
    deck.setFillColor(INK)
    deck.textLine("A STRATEGIC ANALYSIS OF DIGITAL VISIBILITY")
    deck.textLine("& GROWTH OPPORTUNITIES")
    canvas.drawText(deck)

    canvas.setFillColor(ORANGE)
    canvas.rect(right_x, 0, right_w, 1.52 * inch, fill=1, stroke=0)
    canvas.setFillColor(WHITE)
    canvas.setFont(font("SourceSans3-Semibold"), 8)
    canvas.drawString(right_x + 0.32 * inch, 1.12 * inch, "PREPARED FOR")
    canvas.setFont(font("Archivo-Bold"), 16)
    canvas.drawString(right_x + 0.32 * inch, 0.78 * inch, "Bill Gallipo")
    canvas.setStrokeColor(WHITE)
    canvas.setLineWidth(0.6)
    canvas.line(right_x + 0.32 * inch, 0.60 * inch, PAGE_W - 0.32 * inch, 0.60 * inch)
    canvas.setFont(font("SourceSans3-Semibold"), 7.4)
    canvas.drawString(right_x + 0.32 * inch, 0.30 * inch, "AUGUST 28, 2026")
    canvas.restoreState()


def draw_body(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(PAPER)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.5)
    canvas.line(0.62 * inch, PAGE_H - 0.55 * inch, PAGE_W - 0.62 * inch, PAGE_H - 0.55 * inch)
    canvas.line(0.62 * inch, 0.48 * inch, PAGE_W - 0.62 * inch, 0.48 * inch)
    logo = ImageReader(str(ASSETS / "logo-official-transparent.png"))
    canvas.drawImage(logo, 0.66 * inch, PAGE_H - 0.51 * inch, 1.0 * inch, 0.47 * inch, mask="auto", preserveAspectRatio=True)
    canvas.setFont(font("SourceSans3-Semibold"), 6.2)
    canvas.setFillColor(MID)
    canvas.drawRightString(PAGE_W - 0.67 * inch, PAGE_H - 0.34 * inch, "SEO + AI VISIBILITY OPPORTUNITY REPORT")
    canvas.setFont(font("SourceSans3"), 6.4)
    canvas.drawString(0.66 * inch, 0.28 * inch, "Prepared for Bill Gallipo  |  August 28, 2026")
    canvas.setFillColor(ORANGE)
    canvas.rect(PAGE_W - 0.97 * inch, 0, 0.97 * inch, 0.48 * inch, fill=1, stroke=0)
    canvas.setFillColor(WHITE)
    canvas.setFont(font("SourceSans3-Bold"), 7)
    canvas.drawCentredString(PAGE_W - 0.485 * inch, 0.19 * inch, f"{max(1, doc.page - 1):02d}")
    canvas.restoreState()


doc = BaseDocTemplate(
    str(OUT),
    pagesize=letter,
    leftMargin=0.66 * inch,
    rightMargin=0.66 * inch,
    topMargin=0.70 * inch,
    bottomMargin=0.62 * inch,
    title="Meza Tile & Stone Website SEO + AI Visibility Audit",
    author="Website Growth Audit",
    subject="SEO, local search, conversion, technical performance, and AI visibility recommendations",
)

cover_frame = Frame(0, 0, PAGE_W, PAGE_H, leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0, id="cover")
body_frame = Frame(
    doc.leftMargin,
    doc.bottomMargin,
    PAGE_W - doc.leftMargin - doc.rightMargin,
    PAGE_H - doc.topMargin - doc.bottomMargin,
    leftPadding=0,
    rightPadding=0,
    topPadding=0,
    bottomPadding=0,
    id="body",
)
doc.addPageTemplates([
    PageTemplate(id="Cover", frames=[cover_frame], onPage=draw_cover),
    PageTemplate(id="Body", frames=[body_frame], onPage=draw_body),
])

story = [Spacer(1, PAGE_H - 2), NextPageTemplate("Body"), PageBreak()]


# Executive summary
story += section_header(
    "Executive summary",
    "A strong rebuild is live. The next win is turning it into a local authority engine.",
    "The site now has a credible visual identity, useful service depth, and clean crawl fundamentals. The highest-return work is not a wholesale rewrite. It is a focused pass on mobile speed, index refresh, location ownership, proof, schema consistency, and conversion measurement.",
)
story += [
    MetricStrip([
        ("26", "indexable sitemap URLs", "green"),
        ("56", "mobile Lighthouse performance", "orange"),
        ("96", "automated accessibility", "green"),
        ("100", "Lighthouse SEO checks", "green"),
    ]),
    Spacer(1, 10),
    Callout(
        "Bottom line",
        "Meza has more on-site substance than its stale search snapshot suggests. The commercial priority is to help Google recrawl the refreshed pages, make the best proof easier to find, and give every valuable query one clear page owner.",
        "orange",
    ),
    Spacer(1, 10),
    P("What is already working", "H2x"),
    table([
        ["Verified strength", "Why it matters"],
        ["One H1 on every crawled page", "Clear page-level topic hierarchy."],
        ["Unique titles and canonicals across the live crawl", "Reduces basic duplication and indexing ambiguity."],
        ["Descriptive alt text across crawled images", "Supports accessibility and image understanding."],
        ["LocalBusiness and service-oriented schema are present", "Provides an entity foundation to extend consistently."],
        ["Strong visual identity and an above-fold call CTA", "The site looks like a real contractor brand, not a directory template."],
    ], [2.45 * inch, 4.35 * inch]),
    Spacer(1, 10),
    P("Top five priorities", "H2x"),
    table([
        ["Priority", "Action", "Expected effect"],
        ["1", "Fix the mobile LCP path: hero image delivery, preload, redirects, caching, render-blocking CSS/JS.", "Faster first impression and stronger mobile UX."],
        ["2", "Submit the refreshed sitemap and request recrawl of the homepage and core service pages.", "Replace stale indexed copy and old service snippets."],
        ["3", "Noindex or consolidate the duplicate tile category archive; noindex the feedback utility page.", "Cleaner index and less intent dilution."],
        ["4", "Build verified project case studies and credential proof into service pages.", "More trust, differentiation, and AI-citable evidence."],
        ["5", "Create only evidence-backed location owners for priority markets beyond Centennial and Denver.", "Local relevance without thin doorway pages."],
    ], [0.55 * inch, 3.55 * inch, 2.7 * inch]),
    PageBreak(),
]


# Scope and brand
story += section_header(
    "Audit scope",
    "What was reviewed and how the brand was preserved",
    "This report uses the live site as the primary authority. Traffic, rankings, booked jobs, Search Console, analytics, and Google Business Profile owner data were not available and were not estimated.",
)
brand_img = Image(str(ASSETS / "logo-official-transparent.png"), width=2.55 * inch, height=1.21 * inch)
brand_table = Table([
    [brand_img, [
        P("Verified visual system", "H2x"),
        bullet("Official transparent Meza Tile & Stone stair/pyramid mark, free of a boxed background."),
        bullet("Primary accent: Meza orange with mineral white and near-black."),
        bullet("Website typography: Placa display face and Montserrat body family."),
        bullet("Report typography: architectural Archivo headings with highly legible Source Sans 3 body copy."),
    ]],
], colWidths=[2.8 * inch, 4.0 * inch])
brand_table.setStyle(TableStyle([
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("LEFTPADDING", (0, 0), (-1, -1), 0),
    ("RIGHTPADDING", (0, 0), (-1, -1), 10),
    ("TOPPADDING", (0, 0), (-1, -1), 0),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
]))
story += [brand_table, Spacer(1, 12)]
story += [
    P("Evidence reviewed", "H2x"),
    table([
        ["Layer", "Evidence"],
        ["Website", "27 live URL fetches: 26 canonical apex URLs plus the www redirect check."],
        ["Crawl", "Titles, descriptions, canonicals, H1-H3 hierarchy, words, images, alt text, forms, internal links, schema types, robots.txt, and XML sitemaps."],
        ["Performance", "Local Lighthouse 13.x lab runs on mobile and desktop against the live homepage."],
        ["Search demand", "Current Google autocomplete samples plus representative local web searches. No keyword volume was invented."],
        ["Competition", "Public first-party pages from Centennial, Denver, Castle Rock, and Colorado Springs competitors."],
        ["Entity consistency", "First-party schema and public directory/search references, treated as conflict signals rather than authoritative truth."],
    ], [1.25 * inch, 5.55 * inch]),
    Spacer(1, 10),
    Callout(
        "Important freshness finding",
        "The live homepage has been substantially refreshed, but web search still surfaced a five-month-old snapshot with placeholder service copy. That is not a live-site defect now. It is an index freshness issue and a reason to request recrawl after final QA.",
        "blue",
    ),
    Spacer(1, 10),
    P("Brand and conversion observations", "H2x"),
    bullet("The stair/pyramid mark is distinctive and consistent across desktop and mobile."),
    bullet("The orange CTA has strong contrast against the dark hero image."),
    bullet("The hero says what Meza does and where, but the single action is phone-first. Add a second path for visitors who prefer an estimate form."),
    bullet("The 'Licensed & Insured' lockup is valuable trust language. Publish the applicable license, insurance, and certification details only after they are verified."),
    PageBreak(),
]


# Technical performance
story += section_header(
    "Technical performance",
    "Mobile speed is the clearest measured weakness",
    "The site passes many automated checks, but the mobile experience waits too long for the largest visual element. Lighthouse is lab evidence, not field Core Web Vitals, so the next step is to validate the fix in Search Console once deployed.",
)
story += [
    BarChart([
        ("Mobile performance", 56, "/100"),
        ("Desktop performance", 77, "/100"),
        ("Accessibility", 96, "/100"),
        ("Best practices", 100, "/100"),
        ("SEO checks", 100, "/100"),
    ]),
    Spacer(1, 8),
    table([
        ["Metric", "Mobile", "Desktop", "Interpretation"],
        ["First Contentful Paint", "4.8 s", "1.5 s", "Mobile content appears late."],
        ["Largest Contentful Paint", "12.5 s", "2.8 s", "Mobile hero delivery is the main risk."],
        ["Total Blocking Time", "240 ms", "10 ms", "Some mobile main-thread delay remains."],
        ["Cumulative Layout Shift", "0.005", "0", "Visual stability is strong."],
        ["Speed Index", "6.2 s", "1.9 s", "Mobile visual completion needs work."],
    ], [1.55 * inch, 0.85 * inch, 0.85 * inch, 3.55 * inch]),
    Spacer(1, 10),
    P("Measured opportunities", "H2x"),
    table([
        ["Finding", "Measured signal", "Fix"],
        ["Hero and image delivery", "Estimated savings: 428-485 KiB; mobile LCP 12.5 s.", "Serve properly sized AVIF/WebP, compress, preload the LCP asset, add fetchpriority=high, and avoid CSS background loading when possible."],
        ["Canonical host redirect", "www adds one 301; Lighthouse estimated 2.1 s mobile savings in this run.", "Use https://mezatilestone.com in GBP, ads, citations, social profiles, internal links, and collateral."],
        ["Document latency", "Root document roughly 780 ms in the mobile run.", "Enable full-page caching where safe, tune hosting/PHP, and use Cloudflare cache rules for public pages."],
        ["Render-blocking requests", "Estimated 820 ms mobile savings.", "Inline critical CSS, defer non-critical theme CSS, and use font-display: swap."],
        ["Unused JavaScript", "Roughly 91 KiB mobile savings.", "Remove unused plugin assets per template and defer scripts that are not needed above the fold."],
        ["Untitled embedded frame", "Only automated accessibility failure.", "Give the scheduling/map iframe a concise descriptive title."],
    ], [1.35 * inch, 1.55 * inch, 3.9 * inch]),
    PageBreak(),
]


# Crawl and infrastructure
story += section_header(
    "Crawl, indexation and infrastructure",
    "The crawl is clean, but the index can be made more selective",
    "Every sitemap URL returned 200 in the audit, all 80 sampled internal links resolved successfully, and robots.txt does not block major AI crawlers. The main opportunities are utility-page index control, archive duplication, schema graph consistency, and hosting modernization.",
)
story += [
    table([
        ["Check", "Current state", "Recommendation"],
        ["robots.txt", "Allows the public site and declares the XML sitemap.", "Keep Googlebot and AI discovery bots accessible unless policy intentionally changes."],
        ["XML sitemap", "26 apex URLs across page, post, and category sitemaps.", "Remove non-search utility URLs and resubmit in Search Console."],
        ["HTTP status", "All sitemap URLs returned 200.", "Monitor monthly and after theme/plugin changes."],
        ["Internal links", "80 unique sampled internal URLs returned 200.", "Retain automated link checks in release QA."],
        ["Canonicals", "Present and self-referencing on canonical pages.", "Normalize all outbound uses to the apex host."],
        ["AI bot access", "No explicit GPTBot, ClaudeBot, PerplexityBot, or Google-Extended block.", "Document the desired policy and monitor server logs."],
    ], [1.2 * inch, 2.45 * inch, 3.15 * inch]),
    Spacer(1, 10),
    P("Index cleanup", "H2x"),
    table([
        ["URL", "Finding", "Action"],
        ["/category/tile-installation/", "No meta description and 0.85 five-gram similarity to /blog/ because both list the same posts.", "Noindex and remove from the sitemap, or make it a genuinely useful topic hub with unique copy and pagination."],
        ["/feedback/", "A 186-word utility page appears in the page sitemap.", "Noindex and remove from the sitemap unless it is intentionally a search landing page."],
        ["/reviews/", "Extensive embedded review text but a generic 29-character title.", "Use a descriptive local title and link reviews to their original sources where permitted."],
        ["/gallery/", "61 images and roughly 148 words.", "Turn the strongest projects into indexable case studies with city, scope, materials, challenge, method, and result."],
    ], [1.8 * inch, 2.65 * inch, 2.35 * inch]),
    Spacer(1, 10),
    Callout(
        "Security and hosting priority",
        "The live response exposes X-Powered-By: PHP/7.4.33. PHP 7.4 reached end of life in November 2022, and WordPress now recommends PHP 8.3 or newer. Upgrade in staging, test the custom theme and plugins, then deploy with rollback and post-launch QA.",
        "orange",
    ),
    Spacer(1, 9),
    P("Additional hardening", "H2x"),
    bullet("Remove the X-Powered-By version disclosure after the runtime upgrade."),
    bullet("Add HSTS, X-Content-Type-Options, Referrer-Policy, and a tested Content-Security-Policy where compatible."),
    bullet("Confirm automated backups, malware scanning, least-privilege admin accounts, and plugin update ownership."),
    PageBreak(),
]


# Content architecture
story += section_header(
    "Content architecture",
    "Give every valuable intent one page owner",
    "The service footprint is already substantial. The next step is to reduce intent overlap, strengthen proof, and decide which locations deserve dedicated pages based on real project evidence and business priority.",
)
story += [
    P("Page ownership decisions", "H2x"),
    table([
        ["Current URL", "Primary owner", "Recommended decision"],
        ["/", "Brand + remodeling contractor Centennial", "Keep as the broad commercial entry. Add compact service proof and a secondary estimate CTA."],
        ["/tile-installation/", "Tile installation Centennial", "Keep as the Centennial tile pillar and link every tile specialty page beneath it."],
        ["/tile-installation-in-denver/", "Tile installation Denver", "Keep as the Denver owner; add real Denver projects, neighborhoods, and source-backed proof."],
        ["/bathroom-tile-installation/", "Bathroom tile installation Centennial", "Keep tile-specific; link to full bathroom remodeling without duplicating its intent."],
        ["/remodeling/bathrooms/", "Bathroom remodeling Centennial", "Own full-scope remodel intent: planning, demo, plumbing, waterproofing, fixtures, finish work."],
        ["/countertops/", "Countertop installation Centennial", "Clarify installed materials and service model. Add only material claims Meza can verify."],
        ["/tile-repair/", "Tile and grout repair Centennial", "Expand diagnosis, repair limits, matching constraints, and when replacement is smarter."],
        ["/gallery/", "Project proof hub", "Convert into filters and case-study links, not an image-only endpoint."],
        ["Two tile-cost posts", "General cost vs floor-specific cost", "Differentiate with explicit scopes and internal links, or merge and redirect if Search Console shows cannibalization."],
    ], [1.92 * inch, 1.75 * inch, 3.13 * inch]),
    Spacer(1, 10),
    P("Proof blocks to add to every commercial page", "H2x"),
    table([
        ["Block", "What it should contain"],
        ["Named expertise", "Installer or reviewer name, role, years of experience, verified credentials, and a profile link."],
        ["Project evidence", "City, scope, materials, challenge, method, duration only when documented, and original photos."],
        ["Process", "Five to seven verb-first steps from consultation through walkthrough."],
        ["Quality standard", "Substrate preparation, waterproofing, movement joints, layout approval, cleanup, and warranty terms only if applicable."],
        ["Specific CTA", "Request an estimate, schedule a project discussion, or call. State response timing only if operationally true."],
    ], [1.65 * inch, 5.15 * inch]),
    Spacer(1, 10),
    Callout(
        "Do not create 20 near-duplicate city pages",
        "A location page should exist only when Meza can support it with real projects, service details, travel/coverage reality, testimonials, photos, and unique local context. Otherwise, keep the market in areaServed and prioritize a smaller set of proof-rich pages.",
        "blue",
    ),
    PageBreak(),
]


# Local SEO
story += section_header(
    "Local SEO and entity consistency",
    "Make the same business appear everywhere",
    "The first-party schema points to a Centennial address and defined hours. Public directories surfaced different cities, hours, domains, and review counts. Those records are conflict signals that should be reconciled against the owner-controlled Google Business Profile before any bulk edits.",
)
story += [
    table([
        ["Entity field", "First-party site", "Observed conflict signal", "Action"],
        ["Website", "mezatilestone.com", "Some directories reference mezatileandstone.com.", "Use the apex canonical everywhere and redirect any owned legacy domain."],
        ["Primary location", "Centennial address in LocalBusiness schema", "Some listings present Denver or Colorado Springs as the location.", "Confirm the exact GBP business model: storefront vs service-area business."],
        ["Hours", "Weekday and weekend hours in schema", "Some listings say 24 hours.", "Choose one operational truth and synchronize owned profiles."],
        ["Reviews", "Site says 100+ five-star reviews", "Third parties report different historical totals.", "Pull current counts from GBP and link to the review source; never hard-code stale totals without an update owner."],
    ], [1.0 * inch, 1.7 * inch, 2.35 * inch, 1.75 * inch]),
    Spacer(1, 10),
    P("Google Business Profile operating checklist", "H2x"),
    table([
        ["Weekly", "Monthly", "Quarterly"],
        ["Respond to new reviews with specific, natural language.", "Upload original project photos with honest captions and service context.", "Audit categories, services, hours, areas, appointment URL, and users."],
        ["Check calls, messages, website clicks, and booking links.", "Publish one project update or service post when there is real work to show.", "Reconcile citations and suppress inaccurate duplicates."],
        ["Watch for profile edits and suggested changes.", "Review the queries and actions surfaced in GBP performance.", "Compare GBP leads with call and form outcomes."],
    ], [2.27 * inch, 2.27 * inch, 2.27 * inch]),
    Spacer(1, 10),
    P("Priority market sequence", "H2x"),
    table([
        ["Market", "Current site state", "Recommendation"],
        ["Centennial", "Strong service-page ownership across tile and remodeling.", "Defend and deepen with local projects, proof, and GBP alignment."],
        ["Denver", "Dedicated tile-installation page exists.", "Add Denver-specific case studies and decide whether remodeling deserves a separate owner."],
        ["Castle Rock", "Listed as served; no dedicated owner in the crawl.", "Create a page only after verifying demand, delivery capacity, and project proof."],
        ["Colorado Springs", "Listed as served; public web references associate Meza with the market.", "Confirm the current GBP/location relationship before building a dedicated page."],
        ["Other listed cities", "Area list only.", "Use areaServed and project mentions first; promote only markets with sustained job evidence."],
    ], [1.1 * inch, 2.35 * inch, 3.35 * inch]),
    PageBreak(),
]


# Keyword map core
story += section_header(
    "Keyword research",
    "Core commercial map: existing pages first",
    "Priority reflects local intent, service fit, current page ownership, and evidence from representative searches and Google autocomplete. It is directional, not a substitute for Search Console or paid keyword-volume data.",
)
story += [
    table([
        ["Priority query cluster", "Intent", "Owner", "Action"],
        ["tile contractor Centennial CO; tile installation Centennial", "Hire", "/tile-installation/", "Keep as the local tile pillar; add estimate CTA and project proof."],
        ["tile installer Denver CO; tile contractor Denver", "Hire", "/tile-installation-in-denver/", "Add real Denver projects and differentiated local context."],
        ["bathroom remodel Centennial CO", "Hire", "/remodeling/bathrooms/", "Strengthen full-scope process, proof, and material choices."],
        ["kitchen remodel Centennial CO", "Hire", "/remodeling/kitchens/", "Add projects, sequencing, surfaces, and CTA proof."],
        ["basement remodel Centennial CO", "Hire", "/remodeling/basements/", "Shorten the title and add local basement-specific proof."],
        ["countertop installation Centennial CO", "Hire", "/countertops/", "Clarify materials, templating/fabrication relationship, and installation scope."],
        ["bathroom tile installation near me", "Hire", "/bathroom-tile-installation/", "Own tile-specific bathroom intent and link to full remodels."],
        ["backsplash installation near me", "Hire", "/backsplash-installation/", "Add patterns, materials, prep, timelines only when sourced."],
        ["tile floor installation near me", "Hire", "/floor-tile-installation/", "Add substrate, leveling, transitions, heated-floor options if offered."],
        ["tile repair near me; grout repair near me", "Hire", "/tile-repair/", "Expand diagnostic decision tree and service boundaries."],
        ["custom tile work near me", "Hire", "/custom-tile-work/", "Feature mosaics, fireplaces, large-format work, and original projects."],
    ], [1.85 * inch, 0.55 * inch, 1.55 * inch, 2.85 * inch]),
    Spacer(1, 8),
    Callout(
        "Owner rule",
        "Each query cluster should have one canonical page owner. Supporting articles link to that owner; they do not repeat the same commercial copy or target the same title/H1 combination.",
        "orange",
    ),
    PageBreak(),
]


# Keyword gaps
story += section_header(
    "Keyword expansion",
    "High-value gaps and question demand",
    "Google autocomplete consistently surfaced cost, near-me, process, labor, and installer-company variations. Build content from real Meza operating knowledge and quote data, not generic national averages copied from other sites.",
)
story += [
    table([
        ["Cluster", "Recommended owner", "Content requirement"],
        ["shower tile installation; shower remodel", "Expand bathroom tile page or create /shower-tile-installation/ if volume and service fit justify it.", "Waterproofing, pan/slope, niches, curbs, glass coordination, project examples."],
        ["large format tile installation", "Section on tile pillar; dedicated page only with project proof.", "Substrate flatness, handling, lippage control, layout, qualified installer proof."],
        ["natural stone installer", "New /natural-stone-installation/ owner.", "Materials actually installed, sealing, substrate, interior/exterior limits, projects."],
        ["fireplace tile installation", "Section or child page under custom tile work.", "Heat suitability, surface prep, design/layout, mantle coordination, project photos."],
        ["heated tile floor installation", "Section on floor tile page if offered.", "System types, electrical coordination, floor height, controls, warranty boundaries."],
        ["tile installation cost", "Keep general cost article as owner.", "Use verified range methodology, cost drivers, exclusions, and update date."],
        ["tile floor installation cost", "Keep floor-specific cost article only if clearly differentiated.", "Labor/material split, prep, removal, leveling, room examples from real estimates."],
        ["bathroom remodel cost Denver/Colorado", "New research-led guide.", "Local cost drivers using Meza quote data, scope tiers, exclusions, update cadence."],
        ["grout repair vs replacement", "Support tile repair pillar.", "Decision table, symptoms, repair limits, matching, warranty and call CTA."],
        ["tile waterproofing failure signs", "Support bathroom tile pillar.", "Named expert review, photos, warning signs, inspection steps, escalation guidance."],
    ], [1.45 * inch, 2.45 * inch, 2.9 * inch]),
    Spacer(1, 10),
    P("Suggested 12-week publishing sequence", "H2x"),
    table([
        ["Week", "Asset", "Primary conversion path"],
        ["1-2", "Refresh tile pillar, Denver page, bathroom remodel page, and gallery proof architecture.", "Estimate request or call."],
        ["3-4", "General tile installation cost guide, reconciled with the floor-cost article.", "Tile installation pillar."],
        ["5-6", "Shower waterproofing/failure guide reviewed by a named installer.", "Bathroom tile page."],
        ["7-8", "Natural stone service page plus one supporting material comparison.", "Natural stone consultation."],
        ["9-10", "One Centennial and one Denver project case study.", "Relevant service/location owner."],
        ["11-12", "Bathroom remodel cost guide built from verified local quote patterns.", "Bathroom remodeling page."],
    ], [0.65 * inch, 3.85 * inch, 2.3 * inch]),
    PageBreak(),
]


# Competitor observations
story += section_header(
    "Competitive landscape",
    "The strongest competitors lead with specific proof",
    "This is not a ranking. It is a public first-party pattern review showing what nearby search results make easy for homeowners and search systems to understand.",
)
story += [
    table([
        ["Observed competitor", "Market", "Public pattern worth learning from", "Meza response"],
        ["Divine Design", "Denver", "CTI/GPTP credential numbers, named owner, four-step process, specific service CTAs, long-form local expertise.", "Publish verified credential details, named expertise, process, and original project proof without copying language."],
        ["Spectrum Tile", "Colorado Springs", "46-year local history, owner oversight, concise service descriptions, recognizable project references, free-quote CTA.", "Make Meza's 23 years concrete through people, timeline, projects, and specific local work."],
        ["Talamo Tile & Stone", "Castle Rock", "CTI #1420, NTCA membership, service specialization, local testimonial.", "Link verified association/certification proof and match testimonials to projects and cities."],
        ["Ceramics Plus", "Centennial", "Family/veteran ownership and 25-year experience cues, but visible placeholder content remains.", "Keep Meza's stronger polish and avoid template residue; lean into precise proof."],
    ], [1.18 * inch, 0.75 * inch, 2.72 * inch, 2.15 * inch]),
    Spacer(1, 10),
    P("What Meza can own", "H2x"),
    table([
        ["Differentiator", "How to prove it"],
        ["Communication", "Show the estimate, update, layout-approval, and walkthrough steps; include real project examples."],
        ["Breadth", "Connect tile, stone, countertops, kitchens, bathrooms, basements, and closets through a clear architecture."],
        ["Speed with care", "Use documented project timelines only, paired with scope and quality-control details."],
        ["Craftsmanship", "Before/during/after galleries with materials, prep, cuts, waterproofing, grout alignment, and finish details."],
        ["Local knowledge", "Discuss Colorado substrate movement, dry climate, wet-area assemblies, and market-specific project conditions with expert review."],
    ], [1.45 * inch, 5.35 * inch]),
    Spacer(1, 10),
    Callout(
        "Avoid the generic adjective race",
        "Words such as quality, trusted, expert, and premium are table stakes. Search engines and buyers need verifiable specifics: who performed the work, what system was used, where the project happened, what changed, and how the result was checked.",
        "blue",
    ),
    PageBreak(),
]


# Conversion and visual review
story += section_header(
    "Conversion and visual review",
    "Keep the brand. Reduce friction around the next action.",
    "The current visual language is distinctive: black, white, orange, the stair/pyramid mark, oversized condensed display type, and real project imagery. The next pass should improve choice architecture and mobile delivery without diluting that identity.",
)
desktop = Image(str(ROOT / "research" / "homepage-desktop.png"), width=4.72 * inch, height=3.94 * inch)
mobile = Image(str(ROOT / "research" / "lighthouse-mobile-final.jpg"), width=1.6 * inch, height=3.37 * inch)
shots = Table([[desktop, mobile]], colWidths=[5.0 * inch, 1.8 * inch])
shots.setStyle(TableStyle([
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 0),
    ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ("TOPPADDING", (0, 0), (-1, -1), 0),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
]))
story += [shots, Spacer(1, 8)]
story += [
    table([
        ["Keep", "Improve"],
        ["Exact logo and black/orange palette", "Serve the hero image as a fast, responsive LCP asset."],
        ["Clear local/service headline", "Add a secondary 'Request an estimate' action beside Call Now."],
        ["High-contrast phone CTA", "Make the form promise and next step explicit without inventing response times."],
        ["Real project photography", "Use captioned case studies rather than galleries without context."],
        ["Distinct Placa/Montserrat hierarchy", "Reduce the desktop whitespace gap below the header and verify heading wraps on small screens."],
        ["Mobile call affordance", "Add descriptive title text to the embedded scheduling/map frame."],
    ], [3.4 * inch, 3.4 * inch]),
    Spacer(1, 8),
    Callout(
        "Conversion instrumentation",
        "Track calls, form starts, form completions, schedule clicks, and service-page source. Use thank-you events and CRM outcomes to distinguish inquiries from qualified jobs. Conversion reporting should remain pending validation until tracking and lead outcomes reconcile.",
        "green",
    ),
    PageBreak(),
]


# AI visibility
story += section_header(
    "AI search and answer visibility",
    "Make Meza easy to quote, not merely easy to crawl",
    "AI crawlers can access the public site, but citation selection depends on clear answers, original evidence, entity confidence, and authority. Current platform-by-platform citation presence was not verified and should be monitored explicitly.",
)
story += [
    table([
        ["Pillar", "Current state", "Next action"],
        ["Presence", "robots.txt does not block the major AI discovery bots checked.", "Document bot policy and monitor server logs for GPTBot, ClaudeBot, PerplexityBot, and Google-Extended."],
        ["Structure", "Several pages use FAQPage schema and long-form service copy.", "Lead with 40-70 word direct answers, numbered processes, decision tables, and concise FAQs visible on-page."],
        ["Authority", "Testimonials, 23-year experience claims, partner logos, and project images exist.", "Add named expert reviewers, source-linked credentials, dated projects, and original local data."],
        ["Entity", "HomeAndConstructionBusiness schema exists, but the business @id is blank and the graph is inconsistent across templates.", "Create one stable @id and connect Organization/LocalBusiness, services, people, articles, breadcrumbs, and sameAs references."],
    ], [1.05 * inch, 2.35 * inch, 3.4 * inch]),
    Spacer(1, 10),
    P("Extractable content patterns", "H2x"),
    table([
        ["Query type", "Pattern", "Meza example"],
        ["What is...", "One self-contained definition near the top.", "Define large-format tile installation and when it needs specialized handling."],
        ["How does...", "Five to seven numbered, verb-first steps.", "Show the Meza tile installation process from substrate review to walkthrough."],
        ["X vs Y", "Two-column decision table with conditions.", "Repair vs replacement; porcelain vs natural stone; grout repair vs regrout."],
        ["How much...", "Dated cost methodology with ranges only from verified quote data.", "Tile floor cost drivers in the Denver metro, updated by year."],
        ["Who should...", "Credentialed expert guidance and clear limits.", "When a shower leak needs a tile specialist vs another trade."],
    ], [1.1 * inch, 2.4 * inch, 3.3 * inch]),
    Spacer(1, 10),
    P("Schema plan", "H2x"),
    bullet("Fix LocalBusiness @id and use the same graph on all relevant templates."),
    bullet("Add Organization fields such as primary email, logo, description, and contact methods where verified."),
    bullet("Use Service/OfferCatalog for true services; add areaServed only for operational markets."),
    bullet("Add Article or BlogPosting with headline, image, datePublished, dateModified, and named author/reviewer."),
    bullet("Add BreadcrumbList to service and article templates."),
    bullet("Keep visible FAQ content when useful, but do not promise FAQ rich results: Google generally limits them to authoritative government and health sites."),
    Spacer(1, 8),
    Callout(
        "Citation monitoring",
        "Weekly: test 10 target questions in ChatGPT search, Perplexity, Google AI Overviews, and Copilot. Log citation presence, cited URL, answer block, competitor sources, and date. Treat changes as volatile observations, not guarantees.",
        "orange",
    ),
    PageBreak(),
]


# Page action register
story += section_header(
    "Page action register",
    "The implementation backlog by URL",
    "This list translates the audit into concrete page work. Owners and dates should be assigned after CMS, hosting, analytics, and Google Business Profile access are confirmed.",
)
story += [
    table([
        ["URL", "Priority", "Required change"],
        ["/", "High", "Optimize hero/LCP; request recrawl; add secondary CTA; strengthen linked proof."],
        ["/tile-installation/", "High", "Make the Centennial pillar; add process, credentials, case studies, and links to specialties."],
        ["/tile-installation-in-denver/", "High", "Add verified Denver projects, neighborhoods served, local proof, and unique internal links."],
        ["/remodeling/bathrooms/", "High", "Clarify full-scope remodel ownership; add project proof, process, and cost-driver support."],
        ["/gallery/", "High", "Create case-study cards and individual project pages with city, scope, materials, and results."],
        ["/category/tile-installation/", "High", "Noindex/remove from sitemap or rebuild as a unique topic hub."],
        ["/feedback/", "High", "Noindex and remove from sitemap unless it has deliberate search value."],
        ["/contact-us/", "Medium", "Expand meta description; add the consistent business graph and iframe title."],
        ["/reviews/", "Medium", "Use a descriptive local title; source reviews; avoid unsupported self-serving rating markup."],
        ["/countertops/", "Medium", "Clarify materials and workflow; add material pages only for verified offerings."],
        ["/remodeling/basements/", "Medium", "Shorten title; add real basement projects and scope detail."],
        ["/blog/", "Medium", "Add article cards with author/date/topic, canonical category logic, and pillar links."],
        ["Cost articles", "Medium", "Differentiate general vs floor-specific intent or consolidate based on GSC cannibalization evidence."],
        ["All commercial pages", "Medium", "Add named expertise, service schema, updated date, local proof, and tracked CTA."],
        ["All article pages", "Medium", "Add Article, author/reviewer, dateModified, sources, summary block, and next-step link."],
    ], [1.62 * inch, 0.52 * inch, 4.66 * inch]),
    PageBreak(),
]


# Roadmap
story += section_header(
    "90-day roadmap",
    "Sequence the work so each layer compounds",
    "Technical speed and index control come first. Then strengthen commercial owners, entity consistency, project proof, and answer content. Every release should include crawl, mobile, accessibility, and conversion verification.",
)
story += [
    table([
        ["Window", "Workstream", "Deliverables", "Verification"],
        ["Days 0-14", "Technical + index", "Stage PHP upgrade; fix LCP path; normalize apex links; noindex utility/archive URLs; submit sitemap and request recrawl.", "Lighthouse mobile/desktop, 200-status crawl, canonical check, Rich Results Test, Search Console inspection."],
        ["Days 15-30", "Commercial pages", "Refresh homepage, tile pillar, Denver tile page, bathroom remodel, contact, reviews, and gallery architecture.", "Desktop/mobile visual QA, form/call events, internal links, schema validation."],
        ["Days 31-60", "Local + proof", "GBP and citation reconciliation; two project case studies; named expert/credential blocks; stable entity graph.", "GBP readback, citation log, NAP checks, index coverage, qualified lead review."],
        ["Days 61-90", "Content + AI visibility", "Publish cost and waterproofing guides; natural stone owner if verified; weekly AI citation log; first market expansion decision.", "GSC query/page map, citation tests, leads by page, content freshness log."],
    ], [0.75 * inch, 1.2 * inch, 3.35 * inch, 1.5 * inch]),
    Spacer(1, 12),
    P("Release gate for every change", "H2x"),
    table([
        ["1. Source", "2. Build", "3. QA", "4. Readback"],
        ["Verify service facts, market, proof, logo, claims, and page owner.", "Implement copy, media, metadata, schema, internal links, CTA, and tracking.", "Crawl, render desktop/mobile, test keyboard/focus, check console, run Lighthouse and schema tests.", "Confirm live URL, canonical, indexability, forms, analytics events, sitemap, and Search Console request."],
    ], [1.7 * inch] * 4),
    Spacer(1, 12),
    Callout(
        "Definition of done",
        "A recommendation is complete only when the live page is verified, the final crawl is clean, desktop and mobile rendering pass, conversion events fire, the sitemap and canonical are correct, and the change is documented for ongoing ownership.",
        "green",
    ),
    Spacer(1, 10),
    P("What success should be measured", "H2x"),
    bullet("Qualified calls and forms by landing page and market."),
    bullet("Google Business Profile actions reconciled to real lead outcomes."),
    bullet("Non-branded impressions, clicks, and average position by page-owner cluster."),
    bullet("Field LCP, INP, and CLS plus lab regression checks."),
    bullet("Indexed canonical pages, excluded utility pages, and crawl errors."),
    bullet("AI citation presence for the 10-question monitoring set."),
    bullet("Project case-study-assisted conversions and internal path completion."),
    PageBreak(),
]


# Sources and limitations
story += section_header(
    "Sources and limitations",
    "Evidence you can audit",
    "All website observations were captured on August 28, 2026. Current search results, reviews, hours, software versions, and platform behavior can change; verify owner-controlled systems before publishing claims or editing profiles.",
)
sources = [
    ("Meza Tile & Stone live site", "https://mezatilestone.com/"),
    ("Meza robots.txt", "https://mezatilestone.com/robots.txt"),
    ("Meza XML sitemap", "https://mezatilestone.com/sitemap.xml"),
    ("Google Search Central: Core Web Vitals", "https://developers.google.com/search/docs/appearance/core-web-vitals"),
    ("Google Search Central: LocalBusiness structured data", "https://developers.google.com/search/docs/appearance/structured-data/local-business"),
    ("Google Search Central: helpful, reliable, people-first content", "https://developers.google.com/search/docs/fundamentals/creating-helpful-content"),
    ("Google Search Central: title links", "https://developers.google.com/search/docs/appearance/title-link"),
    ("Google Search Central: link best practices", "https://developers.google.com/search/docs/crawling-indexing/links-crawlable"),
    ("Google Search Central: Article structured data", "https://developers.google.com/search/docs/appearance/structured-data/article"),
    ("Google Search Central: Breadcrumb structured data", "https://developers.google.com/search/docs/appearance/structured-data/breadcrumb"),
    ("Google Search Central: FAQ/HowTo rich-result changes", "https://developers.google.com/search/blog/2023/08/howto-faq-changes"),
    ("WordPress recommended requirements", "https://wordpress.org/about/requirements/"),
    ("PHP unsupported branches", "https://www.php.net/eol.php"),
    ("Divine Design public site", "https://www.tileinstallersdenver.com/"),
    ("Spectrum Tile public site", "https://www.spectrumtileco.com/"),
    ("Talamo Tile & Stone public site", "https://www.talamotile.com/"),
    ("Ceramics Plus public site", "https://www.ceramicsplustileandstone.com/"),
]
source_rows = [["Source", "URL"]] + [[name, f'<link href="{url}" color="#286A91">{url}</link>'] for name, url in sources]
story += [table(source_rows, [2.3 * inch, 4.5 * inch]), Spacer(1, 10)]
story += [
    P("Limitations", "H2x"),
    bullet("No owner-level Search Console, GA4, call tracking, CRM, Google Business Profile, server logs, or hosting dashboard access was used."),
    bullet("No traffic, ranking, keyword-volume, conversion, revenue, or review-count estimate was invented."),
    bullet("Representative web search results are directional and can vary by location, device, account, and time."),
    bullet("Lighthouse is a single lab snapshot. Field Core Web Vitals and repeated runs should guide final performance decisions."),
    bullet("Third-party directory data is evidence of inconsistency, not the authoritative business record."),
    bullet("Recommendations do not promise rankings, traffic, leads, or AI citations."),
]


doc.build(story)
print(str(OUT))
