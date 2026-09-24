from __future__ import annotations

import hashlib
import json
import math
import re
from datetime import datetime
from pathlib import Path

import fitz
from PIL import Image, ImageDraw, ImageFont, ImageOps
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import KeepInFrame, Paragraph


ROOT = Path(__file__).resolve().parent
CONTENT_PATH = ROOT / "content.json"
ASSETS = ROOT / "assets"
GRAPHICS = ROOT / "social-graphics"
PDFS = ROOT / "pdf"
PREVIEWS = ROOT / "previews"
COPY_DIR = ROOT / "copy"
QA_DIR = ROOT / "qa"
LOGO_PATH = ASSETS / "bok-law-logo.png"

PAGE_W, PAGE_H = LETTER
SOCIAL_SIZE = 1200

CREAM = "#F8F5EE"
CREAM_DARK = "#E7DDCE"
NAVY = "#0B2630"
INK = "#263238"
BLUE = "#A8CFD9"
TEAL = "#4F9EB1"
TEAL_DARK = "#286D7D"
LAVENDER = "#B9A8C8"
LAVENDER_DARK = "#7A668D"
GOLD = "#D8BE91"
CORAL = "#DCA99C"
MUTED = "#657176"
WHITE = "#FFFFFF"

SERIES_ACCENTS = {
    "Truth Tuesday": (LAVENDER, LAVENDER_DARK),
    "Wednesday Wisdom": (BLUE, TEAL_DARK),
    "Turn the Page Thursday": (GOLD, NAVY),
    "Family Friday": (CORAL, NAVY),
    "Team Recognition": (BLUE, NAVY),
}

FONT_DIR = Path("C:/Windows/Fonts")
PIL_FONTS = {
    "serif": FONT_DIR / "georgia.ttf",
    "serif_bold": FONT_DIR / "georgiab.ttf",
    "serif_italic": FONT_DIR / "georgiai.ttf",
    "sans": FONT_DIR / "arial.ttf",
    "sans_bold": FONT_DIR / "arialbd.ttf",
}


def load_content() -> dict:
    return json.loads(CONTENT_PATH.read_text(encoding="utf-8"))


def ensure_directories() -> None:
    for path in (ASSETS, GRAPHICS, PDFS, PREVIEWS, COPY_DIR, QA_DIR):
        path.mkdir(parents=True, exist_ok=True)
    if not LOGO_PATH.exists():
        raise FileNotFoundError(f"Missing required logo: {LOGO_PATH}")


def register_pdf_fonts() -> None:
    pdfmetrics.registerFont(TTFont("Georgia", str(PIL_FONTS["serif"])))
    pdfmetrics.registerFont(TTFont("Georgia-Bold", str(PIL_FONTS["serif_bold"])))
    pdfmetrics.registerFont(TTFont("Georgia-Italic", str(PIL_FONTS["serif_italic"])))
    pdfmetrics.registerFont(TTFont("Arial", str(PIL_FONTS["sans"])))
    pdfmetrics.registerFont(TTFont("Arial-Bold", str(PIL_FONTS["sans_bold"])))


def pil_font(kind: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(PIL_FONTS[kind]), size=size)


def rgba(hex_color: str, alpha: int = 255) -> tuple[int, int, int, int]:
    value = hex_color.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4)) + (alpha,)


def slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def human_date(value: str) -> str:
    return datetime.strptime(value, "%Y-%m-%d").strftime("%A · %B %-d").replace("%-d", str(int(value[-2:])))


def packet_date(value: str) -> str:
    dt = datetime.strptime(value, "%Y-%m-%d")
    return f"{dt.strftime('%B')} {dt.day}, {dt.year}"


def safe_human_date(value: str) -> str:
    parsed = datetime.strptime(value, "%Y-%m-%d")
    return f"{parsed.strftime('%A')} - {parsed.strftime('%B')} {parsed.day}"


def html_escape(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("\n\n", "<br/><br/>")
        .replace("\n", "<br/>")
    )


def transparent_logo() -> Image.Image:
    logo = Image.open(LOGO_PATH).convert("RGBA")
    pixels = logo.load()
    for y in range(logo.height):
        for x in range(logo.width):
            r, g, b, a = pixels[x, y]
            if r > 244 and g > 244 and b > 244:
                pixels[x, y] = (r, g, b, 0)
            elif a:
                pixels[x, y] = (r, g, b, a)
    bbox = logo.getbbox()
    if bbox:
        logo = logo.crop(bbox)
    return logo


def wrap_by_width(
    draw: ImageDraw.ImageDraw,
    text: str,
    font: ImageFont.FreeTypeFont,
    width: int,
) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        trial = word if not current else f"{current} {word}"
        if draw.textbbox((0, 0), trial, font=font)[2] <= width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def fit_title(
    draw: ImageDraw.ImageDraw,
    text: str,
    width: int,
    max_height: int,
    start_size: int = 88,
    min_size: int = 52,
) -> tuple[ImageFont.FreeTypeFont, list[str], int]:
    for size in range(start_size, min_size - 1, -2):
        font = pil_font("serif_bold", size)
        lines = wrap_by_width(draw, text, font, width)
        line_height = int(size * 1.03)
        if len(lines) <= 4 and line_height * len(lines) <= max_height:
            return font, lines, line_height
    font = pil_font("serif_bold", min_size)
    lines = wrap_by_width(draw, text, font, width)
    return font, lines, int(min_size * 1.03)


def draw_leaf_sprig(
    layer: Image.Image,
    origin: tuple[int, int],
    length: int,
    angle_deg: float,
    color: str,
    alpha: int = 90,
) -> None:
    draw = ImageDraw.Draw(layer, "RGBA")
    angle = math.radians(angle_deg)
    x0, y0 = origin
    x1 = x0 + math.cos(angle) * length
    y1 = y0 + math.sin(angle) * length
    draw.line((x0, y0, x1, y1), fill=rgba(color, alpha), width=5)
    for step in range(1, 6):
        t = step / 6
        cx = x0 + (x1 - x0) * t
        cy = y0 + (y1 - y0) * t
        leaf_w = 42 - step * 2
        leaf_h = 20
        for side in (-1, 1):
            perp = angle + side * math.pi / 2
            lx = cx + math.cos(perp) * 18
            ly = cy + math.sin(perp) * 18
            draw.ellipse(
                (lx - leaf_w, ly - leaf_h, lx + leaf_w, ly + leaf_h),
                fill=rgba(color, max(28, alpha - 25)),
            )


def render_social_graphic(post: dict, week: dict, post_index: int, logo: Image.Image) -> Path:
    week_dir = GRAPHICS / f"week-{week['week']:02d}"
    week_dir.mkdir(parents=True, exist_ok=True)
    output = week_dir / f"{post_index + 1:02d}-{slugify(post['series'])}-{slugify(post['title'])}.png"

    accent, accent_dark = SERIES_ACCENTS.get(post["series"], (BLUE, NAVY))
    img = Image.new("RGBA", (SOCIAL_SIZE, SOCIAL_SIZE), rgba(CREAM))
    decor = Image.new("RGBA", img.size, (0, 0, 0, 0))
    decor_draw = ImageDraw.Draw(decor, "RGBA")

    variant = (week["week"] + post_index) % 4
    if variant == 0:
        decor_draw.ellipse((760, -240, 1360, 360), outline=rgba(accent, 120), width=10)
        decor_draw.ellipse((835, -165, 1285, 285), outline=rgba(accent_dark, 55), width=4)
        draw_leaf_sprig(decor, (1030, 650), 410, 108, accent_dark, 75)
    elif variant == 1:
        decor_draw.rounded_rectangle((865, 315, 1235, 940), radius=90, fill=rgba(accent, 55))
        decor_draw.ellipse((940, 390, 1160, 610), outline=rgba(accent_dark, 65), width=5)
        draw_leaf_sprig(decor, (980, 1030), 310, -78, accent_dark, 80)
    elif variant == 2:
        decor_draw.polygon(
            [(780, 260), (1190, 80), (1260, 610), (920, 730)],
            fill=rgba(accent, 42),
        )
        for row in range(6):
            for col in range(5):
                x = 915 + col * 45
                y = 270 + row * 45
                decor_draw.ellipse((x, y, x + 8, y + 8), fill=rgba(accent_dark, 85))
        draw_leaf_sprig(decor, (1070, 980), 300, -120, accent_dark, 70)
    else:
        decor_draw.arc((710, 220, 1370, 880), 90, 275, fill=rgba(accent_dark, 90), width=9)
        decor_draw.arc((780, 290, 1300, 810), 90, 275, fill=rgba(accent, 125), width=18)
        draw_leaf_sprig(decor, (1000, 1030), 380, -100, accent_dark, 75)

    img = Image.alpha_composite(img, decor)
    draw = ImageDraw.Draw(img, "RGBA")

    draw.rounded_rectangle((70, 62, 430, 122), radius=28, fill=rgba(accent_dark))
    series_font = pil_font("sans_bold", 26)
    draw.text((95, 77), post["series"].upper(), font=series_font, fill=rgba(WHITE))

    date_font = pil_font("sans_bold", 20)
    date_label = safe_human_date(post["date"]).upper()
    draw.text((72, 148), date_label, font=date_font, fill=rgba(TEAL_DARK))

    logo_copy = logo.copy()
    logo_copy.thumbnail((225, 190), Image.Resampling.LANCZOS)
    logo_x = SOCIAL_SIZE - logo_copy.width - 55
    logo_y = 40
    img.alpha_composite(logo_copy, (logo_x, logo_y))

    title_font, title_lines, line_height = fit_title(draw, post["title"], 760, 350)
    title_y = 230
    for line in title_lines:
        draw.text((72, title_y), line, font=title_font, fill=rgba(NAVY))
        title_y += line_height

    rule_y = max(515, title_y + 25)
    draw.rounded_rectangle((72, rule_y, 205, rule_y + 13), radius=6, fill=rgba(accent_dark))

    line_font = pil_font("sans_bold", 32 if len(post["graphic_lines"]) <= 3 else 29)
    line_y = rule_y + 65
    for idx, item in enumerate(post["graphic_lines"], start=1):
        circle_y = line_y + 22
        draw.ellipse((76, circle_y - 25, 126, circle_y + 25), fill=rgba(accent))
        num_font = pil_font("sans_bold", 22)
        num_text = f"{idx:02d}"
        bbox = draw.textbbox((0, 0), num_text, font=num_font)
        draw.text(
            (101 - (bbox[2] - bbox[0]) / 2, circle_y - (bbox[3] - bbox[1]) / 2 - 2),
            num_text,
            font=num_font,
            fill=rgba(NAVY),
        )
        wrapped = wrap_by_width(draw, item, line_font, 680)
        for line_index, line in enumerate(wrapped[:2]):
            draw.text((154, line_y + line_index * 39), line, font=line_font, fill=rgba(INK))
        line_y += max(80, len(wrapped[:2]) * 39 + 26)

    footer_top = SOCIAL_SIZE - 116
    draw.rectangle((0, footer_top, SOCIAL_SIZE, SOCIAL_SIZE), fill=rgba(BLUE))
    footer_font = pil_font("sans_bold", 28)
    draw.text((72, footer_top + 39), "BOKLAWFIRM.COM", font=footer_font, fill=rgba(NAVY))
    firm_font = pil_font("serif_bold", 24)
    firm = "BOK LAW & MEDIATION SERVICES"
    bbox = draw.textbbox((0, 0), firm, font=firm_font)
    draw.text((SOCIAL_SIZE - bbox[2] - 72, footer_top + 40), firm, font=firm_font, fill=rgba(NAVY))

    img.convert("RGB").save(output, "PNG", optimize=True)
    return output


def pdf_style(
    name: str,
    font: str = "Georgia",
    size: float = 10,
    leading: float = 15,
    color: colors.Color = colors.HexColor(INK),
    align: int = TA_LEFT,
) -> ParagraphStyle:
    return ParagraphStyle(
        name,
        fontName=font,
        fontSize=size,
        leading=leading,
        textColor=color,
        alignment=align,
    )


PDF_TITLE = pdf_style("title", "Georgia-Bold", 31, 34, colors.HexColor(NAVY))
PDF_PAGE_TITLE = pdf_style("page-title", "Georgia-Bold", 23, 26, colors.HexColor(NAVY))
PDF_BODY = pdf_style("body", "Georgia", 9.4, 14.1, colors.HexColor(INK))
PDF_BODY_BOLD = pdf_style("body-bold", "Georgia-Bold", 9.8, 14.4, colors.HexColor(NAVY))
PDF_SMALL = pdf_style("small", "Georgia", 7.6, 10.4, colors.HexColor(MUTED))
PDF_KICKER = pdf_style("kicker", "Arial-Bold", 7.2, 8.5, colors.HexColor(TEAL_DARK))
PDF_WHITE_KICKER = pdf_style("white-kicker", "Arial-Bold", 6.4, 7.5, colors.white)


def paragraph(
    c: canvas.Canvas,
    html: str,
    x: float,
    top: float,
    width: float,
    height: float,
    style: ParagraphStyle,
) -> float:
    item = Paragraph(html, style)
    frame = KeepInFrame(width, height, [item], mode="shrink", vAlign="top")
    _, used = frame.wrapOn(c, width, height)
    frame.drawOn(c, x, top - used)
    return used


def draw_pdf_header(c: canvas.Canvas) -> None:
    c.setFillColor(colors.HexColor(BLUE))
    c.rect(0, PAGE_H - 52, PAGE_W, 52, fill=1, stroke=0)
    c.setFillColor(colors.HexColor(NAVY))
    c.setFont("Arial-Bold", 7)
    c.drawString(50, PAGE_H - 31, "S O C I A L   C O N T E N T   S E R I E S")
    c.setFont("Georgia-Bold", 9.2)
    c.drawRightString(PAGE_W - 50, PAGE_H - 31, "This Week With BOK")


def draw_pdf_footer(c: canvas.Canvas, review_note: str = "REVIEW READY · NOT PUBLISHED") -> None:
    c.setFillColor(colors.HexColor(BLUE))
    c.rect(0, 0, PAGE_W, 36, fill=1, stroke=0)
    c.setFillColor(colors.HexColor(NAVY))
    c.setFont("Arial-Bold", 6.8)
    c.drawString(50, 14, "B O K L A W F I R M . C O M")
    c.drawRightString(PAGE_W - 50, 14, review_note)


def weekly_cover(c: canvas.Canvas, week: dict) -> None:
    c.setFillColor(colors.HexColor(CREAM))
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(colors.HexColor(BLUE))
    c.rect(0, PAGE_H - 24, PAGE_W, 24, fill=1, stroke=0)
    c.rect(0, 0, PAGE_W, 40, fill=1, stroke=0)

    c.setStrokeColor(colors.HexColor(CREAM_DARK))
    c.setLineWidth(0.7)
    c.circle(PAGE_W - 62, PAGE_H - 80, 135, fill=0, stroke=1)
    c.setStrokeColor(colors.HexColor(BLUE))
    c.circle(PAGE_W - 62, PAGE_H - 80, 90, fill=0, stroke=1)
    c.setStrokeColor(colors.HexColor(CREAM_DARK))
    c.circle(55, 30, 245, fill=0, stroke=1)

    paragraph(
        c,
        "S O C I A L&nbsp;&nbsp; C O N T E N T&nbsp;&nbsp; S E R I E S",
        0,
        570,
        PAGE_W,
        18,
        pdf_style("cover-kicker", "Arial-Bold", 7.5, 9, colors.HexColor(TEAL_DARK), TA_CENTER),
    )
    paragraph(c, "This Week<br/>With BOK", 138, 542, 336, 105, PDF_TITLE)
    paragraph(
        c,
        f"{html_escape(week['theme'])} · Week of {packet_date(week['week_of'])}",
        0,
        426,
        PAGE_W,
        26,
        pdf_style("cover-sub", "Georgia-Italic", 10.5, 13, colors.HexColor(INK), TA_CENTER),
    )
    c.setStrokeColor(colors.HexColor(TEAL))
    c.setLineWidth(2.2)
    c.line(266, 391, 346, 391)

    y = 333
    for num, post in enumerate(week["posts"], start=1):
        c.setFont("Georgia-Bold", 10.5)
        c.setFillColor(colors.HexColor(TEAL_DARK))
        c.drawString(79, y, f"{num:02d}")
        c.setFont("Arial-Bold", 6.5)
        c.setFillColor(colors.HexColor(NAVY))
        c.drawString(116, y + 1, post["series"].upper())
        date_text = datetime.strptime(post["date"], "%Y-%m-%d").strftime("%b").upper() + f" {int(post['date'][-2:])}"
        c.setFont("Arial-Bold", 6.5)
        c.setFillColor(colors.HexColor(TEAL_DARK))
        c.drawString(240, y + 1, date_text)
        paragraph(
            c,
            html_escape(post["title"]),
            302,
            y + 11,
            230,
            30,
            pdf_style(f"row-{week['week']}-{num}", "Georgia", 8.5, 10.8, colors.HexColor(INK)),
        )
        c.setStrokeColor(colors.HexColor(CREAM_DARK))
        c.setLineWidth(0.55)
        c.line(79, y - 14, 532, y - 14)
        y -= 52

    draw_pdf_footer(c, f"WEEK {week['week']:02d} · REVIEW READY")
    c.showPage()


def post_page(c: canvas.Canvas, week: dict, post: dict, graphic_path: Path, num: int) -> None:
    c.setFillColor(colors.HexColor(CREAM))
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    draw_pdf_header(c)

    tag = f"{num:02d}   {post['series'].upper()}   -   {safe_human_date(post['date']).upper()}"
    c.setFillColor(colors.HexColor(NAVY))
    c.roundRect(50, 677, 294, 26, 2, fill=1, stroke=0)
    paragraph(c, html_escape(tag), 62, 695, 270, 14, PDF_WHITE_KICKER)

    paragraph(c, html_escape(post["title"]), 50, 653, 520, 62, PDF_PAGE_TITLE)
    c.setStrokeColor(colors.HexColor(TEAL))
    c.setLineWidth(2)
    c.line(50, 579, 102, 579)

    first_paragraph, *rest = post["caption"].split("\n\n")
    paragraph(c, html_escape(first_paragraph), 50, 554, 245, 76, PDF_BODY_BOLD)
    remaining_text = "\n\n".join(rest)
    paragraph(c, html_escape(remaining_text), 50, 466, 245, 302, PDF_BODY)

    image_size = 252
    image_x = 322
    image_y = 263
    c.setFillColor(colors.white)
    c.setStrokeColor(colors.HexColor(BLUE))
    c.setLineWidth(0.8)
    c.roundRect(image_x - 4, image_y - 4, image_size + 8, image_size + 8, 3, fill=1, stroke=1)
    c.drawImage(
        ImageReader(str(graphic_path)),
        image_x,
        image_y,
        image_size,
        image_size,
        preserveAspectRatio=True,
        mask="auto",
    )
    paragraph(
        c,
        "F I N A L&nbsp;&nbsp; S O C I A L&nbsp;&nbsp; G R A P H I C",
        image_x,
        image_y - 12,
        image_size,
        12,
        pdf_style(f"graphic-{week['week']}-{num}", "Arial-Bold", 6.0, 7.2, colors.HexColor(TEAL_DARK), TA_CENTER),
    )

    paragraph(
        c,
        html_escape(post["hashtags"]),
        50,
        128,
        525,
        32,
        pdf_style(f"hashtags-{week['week']}-{num}", "Arial-Bold", 7.2, 9.5, colors.HexColor(TEAL_DARK)),
    )
    draw_pdf_footer(c)
    c.showPage()


def build_weekly_pdf(week: dict, graphic_paths: list[Path]) -> Path:
    output = PDFS / f"This-Week-With-BOK-{week['week_of']}.pdf"
    c = canvas.Canvas(str(output), pagesize=LETTER, pageCompression=1)
    c.setTitle(f"This Week With BOK · Week of {packet_date(week['week_of'])}")
    c.setAuthor("Dillon Mohr")
    c.setSubject("BOK Law & Mediation Services weekly social content review packet")
    c.setKeywords("BOK Law, family law, mediation, social content, Western Pennsylvania")
    weekly_cover(c, week)
    for num, (post, graphic) in enumerate(zip(week["posts"], graphic_paths), start=1):
        post_page(c, week, post, graphic, num)
    c.save()
    return output


def build_master_cover(data: dict) -> Path:
    output = PDFS / "_master-cover.pdf"
    c = canvas.Canvas(str(output), pagesize=LETTER, pageCompression=1)
    c.setTitle("BOK August and September 2026 Social Content Master")
    c.setAuthor("Dillon Mohr")
    c.setFillColor(colors.HexColor(CREAM))
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(colors.HexColor(NAVY))
    c.rect(0, 0, 18, PAGE_H, fill=1, stroke=0)
    c.setFillColor(colors.HexColor(BLUE))
    c.rect(18, 0, 6, PAGE_H, fill=1, stroke=0)
    paragraph(c, "B O K&nbsp;&nbsp; L A W&nbsp;&nbsp; &amp;&nbsp;&nbsp; M E D I A T I O N&nbsp;&nbsp; S E R V I C E S", 58, 716, 500, 18, PDF_KICKER)
    paragraph(c, "August–September<br/>Social Content System", 58, 666, 490, 104, PDF_TITLE)
    paragraph(
        c,
        "Eight weeks of practical, compassionate, family-focused content prepared for client review.",
        58,
        532,
        475,
        54,
        pdf_style("master-deck", "Georgia", 13, 18, colors.HexColor(INK)),
    )
    c.setStrokeColor(colors.HexColor(TEAL))
    c.setLineWidth(3)
    c.line(58, 455, 158, 455)

    stats = [
        ("08", "weekly packets"),
        ("32", "finished social posts"),
        ("32", "square branded graphics"),
        ("41", "pages in the master PDF"),
    ]
    y = 396
    for value, label in stats:
        c.setFillColor(colors.HexColor(BLUE))
        c.roundRect(58, y - 11, 58, 38, 5, fill=1, stroke=0)
        c.setFillColor(colors.HexColor(NAVY))
        c.setFont("Georgia-Bold", 17)
        c.drawCentredString(87, y + 1, value)
        c.setFont("Arial-Bold", 8.4)
        c.drawString(138, y + 2, label.upper())
        y -= 58

    c.setFillColor(colors.HexColor(NAVY))
    c.roundRect(58, 82, 500, 58, 6, fill=1, stroke=0)
    paragraph(
        c,
        "<b>STATUS:</b> Review ready · not scheduled · not published<br/>Final legal wording, creative pairing, and release dates remain client approval-gated.",
        78,
        127,
        460,
        42,
        pdf_style("master-status", "Georgia", 8.4, 12.4, colors.white),
    )
    draw_pdf_footer(c, "MASTER REVIEW PACKET")
    c.save()
    return output


def merge_master(cover: Path, weekly_pdfs: list[Path]) -> Path:
    output = PDFS / "BOK-August-September-2026-Content-Master.pdf"
    master = fitz.open()
    for path in [cover, *weekly_pdfs]:
        source = fitz.open(path)
        master.insert_pdf(source)
        source.close()
    master.set_metadata(
        {
            "title": "BOK August–September 2026 Social Content Master",
            "author": "Dillon Mohr",
            "subject": "Eight weekly BOK social content review packets",
            "keywords": "BOK Law, family law, mediation, social content",
        }
    )
    master.save(output, garbage=4, deflate=True)
    master.close()
    cover.unlink(missing_ok=True)
    return output


def make_contact_sheet(images: list[Path], output: Path, columns: int = 4, thumb: int = 330) -> None:
    rows = math.ceil(len(images) / columns)
    label_h = 44
    margin = 24
    sheet = Image.new(
        "RGB",
        (
            margin * 2 + columns * thumb + (columns - 1) * margin,
            margin * 2 + rows * (thumb + label_h) + (rows - 1) * margin,
        ),
        rgba(BLUE)[:3],
    )
    draw = ImageDraw.Draw(sheet)
    label_font = pil_font("sans_bold", 17)
    for idx, path in enumerate(images):
        row, col = divmod(idx, columns)
        x = margin + col * (thumb + margin)
        y = margin + row * (thumb + label_h + margin)
        image = Image.open(path).convert("RGB")
        image = ImageOps.fit(image, (thumb, thumb), method=Image.Resampling.LANCZOS)
        sheet.paste(image, (x, y))
        label = path.stem[:44]
        draw.text((x, y + thumb + 10), label, font=label_font, fill=rgba(NAVY)[:3])
    sheet.save(output, "PNG", optimize=True)


def render_pdf_contact_sheet(pdf_path: Path, output: Path) -> None:
    doc = fitz.open(pdf_path)
    rendered: list[Image.Image] = []
    for page in doc:
        pix = page.get_pixmap(matrix=fitz.Matrix(1.15, 1.15), alpha=False)
        rendered.append(Image.frombytes("RGB", [pix.width, pix.height], pix.samples))
    doc.close()
    thumb_w = 300
    thumb_h = int(thumb_w * PAGE_H / PAGE_W)
    margin = 24
    columns = min(5, len(rendered))
    sheet = Image.new(
        "RGB",
        (margin * 2 + columns * thumb_w + (columns - 1) * margin, margin * 2 + thumb_h + 40),
        rgba(BLUE)[:3],
    )
    draw = ImageDraw.Draw(sheet)
    font = pil_font("sans_bold", 18)
    for idx, image in enumerate(rendered):
        x = margin + idx * (thumb_w + margin)
        y = margin
        thumb = ImageOps.fit(image, (thumb_w, thumb_h), method=Image.Resampling.LANCZOS)
        sheet.paste(thumb, (x, y))
        draw.text((x, y + thumb_h + 9), f"PAGE {idx + 1}", font=font, fill=rgba(NAVY)[:3])
    sheet.save(output, "PNG", optimize=True)


def write_copy_artifacts(data: dict) -> tuple[Path, Path, Path]:
    calendar_path = COPY_DIR / "content-calendar.md"
    copy_path = COPY_DIR / "complete-social-copy.md"
    readme_path = ROOT / "README.md"

    calendar_lines = [
        "# BOK August–September 2026 Content Calendar",
        "",
        "Status: review ready, not scheduled, not published.",
        "",
        "| Week | Date | Series | Post | Review status |",
        "| ---: | --- | --- | --- | --- |",
    ]
    copy_lines = [
        "# BOK August–September 2026 Complete Social Copy",
        "",
        "All content is review ready and requires client approval before scheduling or publication.",
        "",
    ]
    for week in data["weeks"]:
        copy_lines.extend(
            [
                f"## Week {week['week']}: {week['theme']}",
                "",
                f"Week of {packet_date(week['week_of'])}",
                "",
            ]
        )
        for post in week["posts"]:
            calendar_lines.append(
                f"| {week['week']} | {post['date']} | {post['series']} | {post['title']} | Approval required |"
            )
            copy_lines.extend(
                [
                    f"### {post['date']} · {post['series']}",
                    "",
                    f"**{post['title']}**",
                    "",
                    post["caption"],
                    "",
                    post["hashtags"],
                    "",
                    "Source basis:",
                    "",
                    *[f"- {source}" for source in post["source_basis"]],
                    "",
                ]
            )
            if post.get("release_gate"):
                copy_lines.extend([f"Release gate: {post['release_gate']}", ""])

    calendar_path.write_text("\n".join(calendar_lines) + "\n", encoding="utf-8")
    copy_path.write_text("\n".join(copy_lines) + "\n", encoding="utf-8")

    readme = """# BOK August–September 2026 Social Content

This production package contains eight weeks of review-ready BOK Law & Mediation Services social content.

## Deliverables

- `content.json`: canonical content data and source basis
- `copy/content-calendar.md`: eight-week publishing calendar
- `copy/complete-social-copy.md`: all 32 finished captions and hashtags
- `social-graphics/`: 32 branded 1200×1200 PNG graphics
- `pdf/This-Week-With-BOK-*.pdf`: eight five-page weekly review packets
- `pdf/BOK-August-September-2026-Content-Master.pdf`: combined 41-page review packet
- `previews/`: visual QA contact sheets
- `qa/qa-report.md`: deterministic content and artifact checks
- `manifest.json`: output hashes and byte sizes

## Approval boundary

Nothing in this package is scheduled or published. Final legal wording, graphic pairing, dates, and platform placement require BOK approval and a duplicate check. The Best Lawyers post is separately embargoed until the morning of August 20, 2026.

## Source basis

- BOK public website and mediation/service pages
- Pennsylvania Unified Judicial System public family-law resources
- BOK's established weekly social series and recent client corrections
- Client-verified Best Lawyers distinctions and release date

## Rebuilding

Update `content.json`, then run:

```powershell
python .\\build_content_packets.py
```
"""
    readme_path.write_text(readme, encoding="utf-8")
    return calendar_path, copy_path, readme_path


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest().upper()


def run_qa(
    data: dict,
    graphic_paths: list[Path],
    weekly_pdfs: list[Path],
    master_pdf: Path,
) -> dict:
    errors: list[str] = []
    warnings: list[str] = []
    posts = [post for week in data["weeks"] for post in week["posts"]]

    if len(data["weeks"]) != 8:
        errors.append(f"Expected 8 weeks, found {len(data['weeks'])}.")
    if len(posts) != 32:
        errors.append(f"Expected 32 posts, found {len(posts)}.")
    if len({post["title"] for post in posts}) != len(posts):
        errors.append("Post titles are not unique.")
    if len(graphic_paths) != 32:
        errors.append(f"Expected 32 social graphics, found {len(graphic_paths)}.")

    for path in graphic_paths:
        with Image.open(path) as image:
            if image.size != (SOCIAL_SIZE, SOCIAL_SIZE):
                errors.append(f"Incorrect social graphic dimensions: {path.name} {image.size}.")

    for week, pdf_path in zip(data["weeks"], weekly_pdfs):
        doc = fitz.open(pdf_path)
        if doc.page_count != 5:
            errors.append(f"{pdf_path.name} has {doc.page_count} pages; expected 5.")
        extracted = "\n".join(page.get_text() for page in doc)
        normalized_extracted = re.sub(r"\s+", "", extracted).casefold()
        for post in week["posts"]:
            normalized_title = re.sub(r"\s+", "", post["title"]).casefold()
            if normalized_title not in normalized_extracted:
                errors.append(f"Missing title in {pdf_path.name}: {post['title']}")
        doc.close()

    master_doc = fitz.open(master_pdf)
    if master_doc.page_count != 41:
        errors.append(f"Master PDF has {master_doc.page_count} pages; expected 41.")
    master_doc.close()

    for post in posts:
        if post["series"] != "Team Recognition" and data["global_disclaimer"] not in post["caption"]:
            errors.append(f"Missing disclaimer: {post['title']}")
        if re.search(r"\bPittsburgh\b|\bAllegheny County\b", post["caption"], flags=re.IGNORECASE):
            errors.append(f"Geographic scope regression in caption: {post['title']}")
        if len(post["caption"].split()) < 70:
            warnings.append(f"Short caption under 70 words: {post['title']}")
        if len(post["caption"].split()) > 190:
            warnings.append(f"Long caption over 190 words: {post['title']}")

    recognition = [post for post in posts if post["series"] == "Team Recognition"]
    if len(recognition) != 1 or recognition[0]["date"] != "2026-08-20":
        errors.append("Best Lawyers recognition date or count is incorrect.")
    elif not recognition[0].get("release_gate"):
        errors.append("Best Lawyers recognition is missing its release gate.")

    return {
        "status": "pass" if not errors else "fail",
        "generated_at": datetime.now().astimezone().isoformat(),
        "counts": {
            "weeks": len(data["weeks"]),
            "posts": len(posts),
            "graphics": len(graphic_paths),
            "weekly_pdfs": len(weekly_pdfs),
            "master_pdf_pages": 41,
        },
        "checks": {
            "unique_titles": len({post["title"] for post in posts}) == len(posts),
            "graphics_1200_square": not any("dimensions" in item for item in errors),
            "weekly_pdfs_five_pages": not any("expected 5" in item for item in errors),
            "master_pdf_41_pages": not any("expected 41" in item for item in errors),
            "disclaimer_present": not any("Missing disclaimer" in item for item in errors),
            "western_pa_scope_preserved": not any("Geographic scope" in item for item in errors),
            "recognition_gate_preserved": not any("Best Lawyers" in item for item in errors),
        },
        "errors": errors,
        "warnings": warnings,
    }


def write_qa(qa: dict) -> tuple[Path, Path]:
    json_path = QA_DIR / "qa-report.json"
    md_path = QA_DIR / "qa-report.md"
    json_path.write_text(json.dumps(qa, indent=2), encoding="utf-8")
    md_lines = [
        "# BOK Content Package QA",
        "",
        f"Status: **{qa['status'].upper()}**",
        "",
        "## Counts",
        "",
        *[f"- {key.replace('_', ' ').title()}: {value}" for key, value in qa["counts"].items()],
        "",
        "## Checks",
        "",
        *[f"- {'PASS' if value else 'FAIL'} · {key.replace('_', ' ')}" for key, value in qa["checks"].items()],
        "",
        "## Errors",
        "",
        *([f"- {item}" for item in qa["errors"]] or ["- None"]),
        "",
        "## Warnings",
        "",
        *([f"- {item}" for item in qa["warnings"]] or ["- None"]),
        "",
        "## Manual approval gates",
        "",
        "- Final legal wording and creative pairing require BOK review.",
        "- Duplicate-check each post before scheduling.",
        "- Best Lawyers recognition remains embargoed until the morning of August 20, 2026.",
        "- Nothing in this package has been emailed, scheduled, or published.",
    ]
    md_path.write_text("\n".join(md_lines) + "\n", encoding="utf-8")
    return json_path, md_path


def write_manifest() -> Path:
    manifest_path = ROOT / "manifest.json"
    files = []
    for path in sorted(ROOT.rglob("*")):
        if path.is_file() and path != manifest_path and "__pycache__" not in path.parts:
            files.append(
                {
                    "path": path.relative_to(ROOT).as_posix(),
                    "bytes": path.stat().st_size,
                    "sha256": sha256(path),
                }
            )
    manifest_path.write_text(
        json.dumps(
            {
                "schema_version": 1,
                "generated_at": datetime.now().astimezone().isoformat(),
                "status": "review-ready-not-published",
                "file_count": len(files),
                "files": files,
            },
            indent=2,
        ),
        encoding="utf-8",
    )
    return manifest_path


def build() -> None:
    ensure_directories()
    register_pdf_fonts()
    data = load_content()
    logo = transparent_logo()

    all_graphics: list[Path] = []
    weekly_pdfs: list[Path] = []
    for week in data["weeks"]:
        weekly_graphics = [
            render_social_graphic(post, week, index, logo)
            for index, post in enumerate(week["posts"])
        ]
        all_graphics.extend(weekly_graphics)
        weekly_pdf = build_weekly_pdf(week, weekly_graphics)
        weekly_pdfs.append(weekly_pdf)
        render_pdf_contact_sheet(
            weekly_pdf,
            PREVIEWS / f"week-{week['week']:02d}-packet-contact-sheet.png",
        )

    make_contact_sheet(
        all_graphics,
        PREVIEWS / "all-32-social-graphics-contact-sheet.png",
        columns=4,
        thumb=300,
    )
    master_cover = build_master_cover(data)
    master_pdf = merge_master(master_cover, weekly_pdfs)
    write_copy_artifacts(data)
    qa = run_qa(data, all_graphics, weekly_pdfs, master_pdf)
    write_qa(qa)
    manifest = write_manifest()

    print(
        json.dumps(
            {
                "status": qa["status"],
                "weeks": len(data["weeks"]),
                "posts": sum(len(week["posts"]) for week in data["weeks"]),
                "graphics": len(all_graphics),
                "weekly_pdfs": [str(path) for path in weekly_pdfs],
                "master_pdf": str(master_pdf),
                "manifest": str(manifest),
                "errors": qa["errors"],
                "warnings": qa["warnings"],
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    build()
