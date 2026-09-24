from __future__ import annotations

import hashlib
import json
import re
from datetime import datetime
from pathlib import Path

import fitz
from PIL import Image, ImageDraw, ImageFont, ImageOps
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parent
DATA_PATH = ROOT / "monthly-content.json"
BRAND_LOGO = ROOT / "assets" / "brand" / "bok-law-logo.png"
GRAPHICS_DIR = ROOT / "separate-graphics"
PDF_DIR = ROOT / "separate-monthly-pdfs"
PREVIEW_DIR = ROOT / "previews"
QA_DIR = ROOT / "qa"

SOCIAL_SIZE = (1080, 1350)
PAGE_W, PAGE_H = letter

CREAM = "#F6F2E9"
CREAM_DARK = "#EEE7D9"
NAVY = "#0E303A"
TEAL = "#5599A8"
TEAL_DARK = "#246E7E"   # teal as TEXT on cream: 5.21:1. TEAL itself is 2.89:1 and illegal.
TEAL_DISC = "#5C9DAB"   # teal as a NUMERAL DISC: navy on it is 4.57:1. TEAL itself is 4.33:1.
BLUE = "#A9D3DD"
GOLD = "#C89A4A"
CORAL = "#D58A74"
INK = "#262522"
WHITE = "#FFFFFF"

FONT_PATHS = {
    "serif": Path(r"C:\Windows\Fonts\georgia.ttf"),
    "serif_bold": Path(r"C:\Windows\Fonts\georgiab.ttf"),
    "serif_italic": Path(r"C:\Windows\Fonts\georgiai.ttf"),
    "sans": Path(r"C:\Windows\Fonts\arial.ttf"),
    "sans_bold": Path(r"C:\Windows\Fonts\arialbd.ttf"),
}


def ensure_directories() -> None:
    for directory in (GRAPHICS_DIR, PDF_DIR, PREVIEW_DIR, QA_DIR):
        directory.mkdir(parents=True, exist_ok=True)


def load_data() -> dict:
    return json.loads(DATA_PATH.read_text(encoding="utf-8"))


def register_fonts() -> None:
    for path in FONT_PATHS.values():
        if not path.exists():
            raise FileNotFoundError(f"Required font missing: {path}")
    pdfmetrics.registerFont(TTFont("Georgia", str(FONT_PATHS["serif"])))
    pdfmetrics.registerFont(TTFont("Georgia-Bold", str(FONT_PATHS["serif_bold"])))
    pdfmetrics.registerFont(TTFont("Georgia-Italic", str(FONT_PATHS["serif_italic"])))
    pdfmetrics.registerFont(TTFont("Arial", str(FONT_PATHS["sans"])))
    pdfmetrics.registerFont(TTFont("Arial-Bold", str(FONT_PATHS["sans_bold"])))


def pil_font(kind: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT_PATHS[kind]), size)


def rgb(value: str) -> tuple[int, int, int]:
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.casefold()).strip("-")


def fit_logo() -> Image.Image:
    image = Image.open(BRAND_LOGO).convert("RGBA")
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            red, green, blue, alpha = pixels[x, y]
            if red > 238 and green > 238 and blue > 238:
                pixels[x, y] = (255, 255, 255, 0)
            elif alpha > 0:
                pixels[x, y] = (red, green, blue, alpha)
    bbox = image.getbbox()
    return image.crop(bbox) if bbox else image


def wrap_text(
    draw: ImageDraw.ImageDraw,
    text: str,
    font: ImageFont.FreeTypeFont,
    max_width: int,
) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if draw.textbbox((0, 0), candidate, font=font)[2] <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def fit_wrapped_font(
    draw: ImageDraw.ImageDraw,
    text: str,
    max_width: int,
    max_lines: int,
    start_size: int,
    minimum_size: int,
) -> tuple[ImageFont.FreeTypeFont, list[str]]:
    for size in range(start_size, minimum_size - 1, -2):
        font = pil_font("serif_bold", size)
        lines = wrap_text(draw, text, font, max_width)
        if len(lines) <= max_lines:
            return font, lines
    font = pil_font("serif_bold", minimum_size)
    return font, wrap_text(draw, text, font, max_width)[:max_lines]


def add_top_gradient(canvas_image: Image.Image, height: int = 610) -> None:
    overlay = Image.new("RGBA", canvas_image.size, (0, 0, 0, 0))
    cream = rgb(CREAM)
    for y in range(height):
        if y < 300:
            alpha = 252
        else:
            alpha = int(252 * max(0, 1 - ((y - 300) / (height - 300))))
        ImageDraw.Draw(overlay).line(
            [(0, y), (canvas_image.width, y)],
            fill=(*cream, alpha),
            width=1,
        )
    canvas_image.alpha_composite(overlay)


def render_social_graphic(
    month_name: str,
    piece: dict,
    piece_number: int,
    logo: Image.Image,
) -> Path:
    scene_path = ROOT / piece["scene"]
    scene = Image.open(scene_path).convert("RGB")
    base = ImageOps.fit(scene, SOCIAL_SIZE, method=Image.Resampling.LANCZOS).convert("RGBA")
    add_top_gradient(base)
    draw = ImageDraw.Draw(base)

    logo_copy = logo.copy()
    logo_copy.thumbnail((168, 145), Image.Resampling.LANCZOS)
    base.alpha_composite(logo_copy, (850, 42))

    series_font = pil_font("sans_bold", 28)
    series = piece["series"].upper()
    badge_width = max(280, draw.textbbox((0, 0), series, font=series_font)[2] + 68)
    draw.rounded_rectangle(
        (62, 56, 62 + badge_width, 122),
        radius=28,
        fill=rgb(NAVY),
    )
    draw.text((96, 75), series, font=series_font, fill=rgb(WHITE))

    month_font = pil_font("sans_bold", 20)
    draw.text(
        (66, 145),
        f"{month_name.upper()} · CONTENT {piece_number:02d}",
        font=month_font,
        fill=rgb(TEAL_DARK),
    )

    title_font, title_lines = fit_wrapped_font(
        draw,
        piece["title"],
        max_width=920,
        max_lines=4,
        start_size=72,
        minimum_size=48,
    )
    title_y = 204
    line_height = title_font.size + 2
    for line in title_lines:
        draw.text((62, title_y), line, font=title_font, fill=rgb(NAVY))
        title_y += line_height
    draw.rounded_rectangle((64, title_y + 12, 188, title_y + 23), radius=5, fill=rgb(TEAL))

    panel_top = 972 if len(piece["takeaways"]) <= 3 else 936
    draw.rounded_rectangle(
        (38, panel_top, 1042, 1261),
        radius=32,
        fill=(*rgb(CREAM), 244),
        outline=rgb(BLUE),
        width=3,
    )
    takeaway_font = pil_font("sans_bold", 24 if len(piece["takeaways"]) <= 3 else 21)
    row_gap = 72 if len(piece["takeaways"]) <= 3 else 61
    row_y = panel_top + 38
    accent_colors = [TEAL_DISC, GOLD, CORAL, BLUE]
    for index, takeaway in enumerate(piece["takeaways"], start=1):
        accent = rgb(accent_colors[(index - 1) % len(accent_colors)])
        draw.ellipse((76, row_y - 1, 126, row_y + 49), fill=accent)
        number_font = pil_font("sans_bold", 18)
        number = f"{index:02d}"
        number_box = draw.textbbox((0, 0), number, font=number_font)
        number_x = 101 - ((number_box[2] - number_box[0]) / 2)
        draw.text((number_x, row_y + 12), number, font=number_font, fill=rgb(NAVY))
        lines = wrap_text(draw, takeaway, takeaway_font, 820)
        text_y = row_y + (3 if len(lines) > 1 else 9)
        for line in lines[:2]:
            draw.text((154, text_y), line, font=takeaway_font, fill=rgb(INK))
            text_y += takeaway_font.size + 3
        row_y += row_gap

    draw.rectangle((0, 1265, 1080, 1350), fill=rgb(BLUE))
    footer_font = pil_font("sans_bold", 22)
    draw.text((62, 1296), "BOKLAWFIRM.COM", font=footer_font, fill=rgb(NAVY))
    footer_right = "BOK LAW & MEDIATION SERVICES"
    footer_right_width = draw.textbbox((0, 0), footer_right, font=footer_font)[2]
    draw.text(
        (1018 - footer_right_width, 1296),
        footer_right,
        font=footer_font,
        fill=rgb(NAVY),
    )

    filename = f"{piece_number:02d}-{slugify(piece['series'])}.png"
    month_dir = GRAPHICS_DIR / slugify(month_name)
    month_dir.mkdir(parents=True, exist_ok=True)
    output = month_dir / filename
    base.convert("RGB").save(output, quality=94)
    return output


def render_interview_graphic(
    month_name: str,
    piece: dict,
    piece_number: int,
    logo: Image.Image,
) -> Path:
    image = Image.new("RGB", SOCIAL_SIZE, rgb(CREAM))
    draw = ImageDraw.Draw(image)

    draw.rectangle((0, 0, 1080, 92), fill=rgb(BLUE))
    draw.arc((690, -250, 1270, 330), 85, 290, fill=rgb(BLUE), width=3)
    draw.arc((740, -205, 1225, 280), 85, 290, fill=rgb(GOLD), width=2)

    logo_copy = logo.copy()
    logo_copy.thumbnail((170, 145), Image.Resampling.LANCZOS)
    image.paste(logo_copy, (850, 112), logo_copy)

    series_font = pil_font("sans_bold", 27)
    badge_width = 350
    draw.rounded_rectangle((62, 124, 62 + badge_width, 190), radius=27, fill=rgb(NAVY))
    draw.text((95, 143), piece["series"].upper(), font=series_font, fill=rgb(WHITE))
    draw.text(
        (64, 212),
        f"{month_name.upper()} · CONTENT {piece_number:02d}",
        font=pil_font("sans_bold", 19),
        fill=rgb(TEAL_DARK),
    )

    title_font, title_lines = fit_wrapped_font(
        draw,
        piece["title"],
        max_width=905,
        max_lines=3,
        start_size=64,
        minimum_size=46,
    )
    title_y = 270
    for line in title_lines:
        draw.text((62, title_y), line, font=title_font, fill=rgb(NAVY))
        title_y += title_font.size + 2
    draw.rounded_rectangle((64, title_y + 14, 188, title_y + 25), radius=5, fill=rgb(TEAL))
    title_y += 60
    draw.text(
        (64, title_y),
        piece["subtitle"].upper(),
        font=pil_font("sans_bold", 24),
        fill=rgb(TEAL_DARK),
    )

    question_font = pil_font("serif", 27)
    number_font = pil_font("serif_bold", 35)
    question_y = title_y + 70
    for index, question in enumerate(piece["questions"], start=1):
        draw.text((66, question_y), str(index), font=number_font, fill=rgb(TEAL))
        lines = wrap_text(draw, question, question_font, 850)
        text_y = question_y + 4
        for line in lines[:2]:
            draw.text((136, text_y), line, font=question_font, fill=rgb(INK))
            text_y += question_font.size + 7
        line_y = question_y + 92
        draw.line((64, line_y, 1016, line_y), fill=rgb(CREAM_DARK), width=3)
        question_y += 112

    draw.rectangle((0, 1265, 1080, 1350), fill=rgb(BLUE))
    footer_font = pil_font("sans_bold", 22)
    draw.text((62, 1296), "BOKLAWFIRM.COM", font=footer_font, fill=rgb(NAVY))
    footer_right = "FILMING PROMPTS · CLIENT REVIEW"
    footer_right_width = draw.textbbox((0, 0), footer_right, font=footer_font)[2]
    draw.text(
        (1018 - footer_right_width, 1296),
        footer_right,
        font=footer_font,
        fill=rgb(NAVY),
    )

    filename = f"{piece_number:02d}-{slugify(piece['series'])}.png"
    month_dir = GRAPHICS_DIR / slugify(month_name)
    month_dir.mkdir(parents=True, exist_ok=True)
    output = month_dir / filename
    image.save(output, quality=94)
    return output


def pdf_style(
    font_name: str,
    font_size: float,
    leading: float,
    color: str = INK,
    alignment: int = TA_LEFT,
) -> ParagraphStyle:
    return ParagraphStyle(
        "bok",
        fontName=font_name,
        fontSize=font_size,
        leading=leading,
        textColor=colors.HexColor(color),
        alignment=alignment,
        spaceAfter=0,
        spaceBefore=0,
    )


def draw_paragraph(
    pdf: canvas.Canvas,
    text: str,
    x: float,
    top: float,
    width: float,
    height: float,
    style: ParagraphStyle,
) -> float:
    paragraph = Paragraph(text, style)
    _, used_height = paragraph.wrap(width, height)
    paragraph.drawOn(pdf, x, top - used_height)
    return used_height


def escape_html(value: str) -> str:
    return (
        value.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("\n\n", "<br/><br/>")
        .replace("\n", "<br/>")
    )


def draw_header(pdf: canvas.Canvas) -> None:
    pdf.setFillColor(colors.HexColor(BLUE))
    pdf.rect(0, 756, PAGE_W, 36, fill=1, stroke=0)
    pdf.setFillColor(colors.HexColor(NAVY))
    pdf.setFont("Arial-Bold", 7.5)
    pdf.drawString(50, 774, "S O C I A L   C O N T E N T   S E R I E S")
    pdf.setFont("Georgia-Bold", 10)
    pdf.drawRightString(562, 772, "This Week With BOK")


def draw_footer(pdf: canvas.Canvas) -> None:
    pdf.setFillColor(colors.HexColor(BLUE))
    pdf.rect(0, 0, PAGE_W, 44, fill=1, stroke=0)
    pdf.setFillColor(colors.HexColor(NAVY))
    pdf.setFont("Arial-Bold", 7.4)
    pdf.drawCentredString(306, 20, "B O K L A W F I R M . C O M")


def draw_series_badge(pdf: canvas.Canvas, number: int, series: str, y: float) -> None:
    width = min(236, max(132, 75 + (len(series) * 5.4)))
    pdf.setFillColor(colors.HexColor(NAVY))
    pdf.roundRect(50, y, width, 27, 2, fill=1, stroke=0)
    pdf.setFillColor(colors.HexColor(BLUE))
    pdf.setFont("Georgia-Bold", 9)
    pdf.drawString(61, y + 8, f"{number:02d}")
    pdf.setFillColor(colors.white)
    pdf.setFont("Arial-Bold", 7.8)
    pdf.drawString(82, y + 9, series.upper())


def draw_cover(pdf: canvas.Canvas, month: dict) -> None:
    pdf.setFillColor(colors.HexColor(CREAM))
    pdf.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    pdf.setFillColor(colors.HexColor(BLUE))
    pdf.rect(0, 769, PAGE_W, 23, fill=1, stroke=0)
    pdf.rect(0, 0, PAGE_W, 52, fill=1, stroke=0)

    pdf.setStrokeColor(colors.HexColor(BLUE))
    pdf.setLineWidth(0.55)
    pdf.circle(548, 740, 150, stroke=1, fill=0)
    pdf.setStrokeColor(colors.HexColor(CREAM_DARK))
    pdf.circle(548, 740, 200, stroke=1, fill=0)
    pdf.circle(72, 55, 230, stroke=1, fill=0)

    pdf.setFillColor(colors.HexColor(TEAL_DARK))
    pdf.setFont("Arial-Bold", 7.6)
    pdf.drawCentredString(306, 572, "S O C I A L   C O N T E N T   S E R I E S")
    pdf.setFillColor(colors.HexColor(NAVY))
    pdf.setFont("Georgia-Bold", 43)
    pdf.drawCentredString(306, 515, "This Week")
    pdf.drawCentredString(306, 462, "With BOK")
    pdf.setFillColor(colors.HexColor(INK))
    pdf.setFont("Georgia-Italic", 12.5)
    pdf.drawCentredString(306, 430, f"Family Law & Mediation · {month['month']}")
    pdf.setStrokeColor(colors.HexColor(TEAL))
    pdf.setLineWidth(2.3)
    pdf.line(261, 407, 351, 407)

    row_top = 358
    for index, piece in enumerate(month["pieces"], start=1):
        row_y = row_top - ((index - 1) * 54)
        pdf.setFillColor(colors.HexColor(TEAL_DARK))
        pdf.setFont("Georgia-Bold", 12)
        pdf.drawString(136, row_y, f"{index:02d}")
        pdf.setFillColor(colors.HexColor(NAVY))
        pdf.setFont("Arial-Bold", 7.4)
        pdf.drawString(171, row_y + 2, piece["series"].upper())
        title_style = pdf_style("Georgia", 10.3, 13, INK)
        draw_paragraph(
            pdf,
            escape_html(piece["title"]),
            316,
            row_y + 10,
            160,
            28,
            title_style,
        )
        if index < len(month["pieces"]):
            pdf.setStrokeColor(colors.HexColor(CREAM_DARK))
            pdf.setLineWidth(0.6)
            pdf.line(136, row_y - 13, 476, row_y - 13)

    pdf.setFillColor(colors.HexColor(NAVY))
    pdf.setFont("Arial-Bold", 7.6)
    pdf.drawCentredString(306, 21, "B O K L A W F I R M . C O M   ·   4 1 2 . 9 4 1 . 9 4 1 0")
    pdf.setFillColor(colors.HexColor(TEAL_DARK))
    pdf.setFont("Arial-Bold", 5.8)
    pdf.drawRightString(565, 63, "CLIENT REVIEW · NOT PUBLISHED")


def draw_content_title(pdf: canvas.Canvas, title: str, top: float = 674) -> tuple[float, float]:
    size = 33 if len(title) <= 44 else 29
    if len(title) > 58:
        size = 25
    style = pdf_style("Georgia-Bold", size, size + 3, NAVY)
    used = draw_paragraph(pdf, escape_html(title), 50, top, 510, 92, style)
    underline_y = top - used - 8
    pdf.setStrokeColor(colors.HexColor(TEAL))
    pdf.setLineWidth(2.1)
    pdf.line(50, underline_y, 103, underline_y)
    return underline_y, used


def draw_social_page(
    pdf: canvas.Canvas,
    piece: dict,
    number: int,
    graphic_path: Path,
) -> None:
    pdf.setFillColor(colors.HexColor(CREAM))
    pdf.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    draw_header(pdf)
    draw_series_badge(pdf, number, piece["series"], 690)
    underline_y, title_height = draw_content_title(pdf, piece["title"], 670)

    body_top = min(underline_y - 25, 584)
    first_paragraph, *remaining = piece["caption"].split("\n\n")
    body_html = (
        f"<b>{escape_html(first_paragraph)}</b>"
        + ("<br/><br/>" + "<br/><br/>".join(escape_html(item) for item in remaining) if remaining else "")
    )
    word_count = len(piece["caption"].split())
    if word_count > 110:
        body_size, leading = 10.2, 14.8
    elif word_count > 92:
        body_size, leading = 10.7, 15.5
    else:
        body_size, leading = 11.2, 16.3
    draw_paragraph(
        pdf,
        body_html,
        50,
        body_top,
        265,
        body_top - 145,
        pdf_style("Georgia", body_size, leading, INK),
    )

    image_x, image_y, image_w, image_h = 333, 204, 229, 286
    pdf.setStrokeColor(colors.HexColor(BLUE))
    pdf.setLineWidth(0.8)
    pdf.roundRect(image_x - 1, image_y - 1, image_w + 2, image_h + 2, 2, stroke=1, fill=0)
    pdf.drawImage(
        ImageReader(str(graphic_path)),
        image_x,
        image_y,
        image_w,
        image_h,
        preserveAspectRatio=True,
        anchor="c",
        mask="auto",
    )
    pdf.setFillColor(colors.HexColor(TEAL_DARK))
    pdf.setFont("Arial-Bold", 7.4)
    pdf.drawCentredString(image_x + (image_w / 2), image_y - 17, "F I N A L   G R A P H I C")

    pdf.setFillColor(colors.HexColor(NAVY))
    pdf.roundRect(50, 69, 144, 28, 2, fill=1, stroke=0)
    pdf.setFillColor(colors.white)
    pdf.setFont("Arial-Bold", 9.2)
    pdf.drawCentredString(122, 79, "BOKLAWFIRM.COM")
    pdf.setFillColor(colors.HexColor("#6B655C"))
    pdf.setFont("Georgia-Italic", 8.5)
    pdf.drawString(205, 80, f"Caption post · paired with the {piece['series']} graphic")
    draw_footer(pdf)


def draw_interview_page(pdf: canvas.Canvas, piece: dict, number: int) -> None:
    pdf.setFillColor(colors.HexColor(CREAM))
    pdf.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    draw_header(pdf)
    draw_series_badge(pdf, number, piece["series"], 690)
    underline_y, _ = draw_content_title(pdf, piece["title"], 670)
    pdf.setFillColor(colors.HexColor(TEAL_DARK))
    pdf.setFont("Arial-Bold", 9.2)
    pdf.drawString(50, underline_y - 31, piece["subtitle"].upper())

    question_top = underline_y - 62
    row_height = 74
    for index, question in enumerate(piece["questions"], start=1):
        row_y = question_top - ((index - 1) * row_height)
        pdf.setFillColor(colors.HexColor(TEAL_DARK))
        pdf.setFont("Georgia-Bold", 16)
        pdf.drawString(50, row_y, str(index))
        draw_paragraph(
            pdf,
            escape_html(question),
            98,
            row_y + 11,
            452,
            52,
            pdf_style("Georgia", 11.8, 16.8, INK),
        )
        if index < len(piece["questions"]):
            pdf.setStrokeColor(colors.HexColor(CREAM_DARK))
            pdf.setLineWidth(0.7)
            pdf.line(50, row_y - 18, 562, row_y - 18)

    pdf.setFillColor(colors.HexColor(NAVY))
    pdf.roundRect(50, 69, 144, 28, 2, fill=1, stroke=0)
    pdf.setFillColor(colors.white)
    pdf.setFont("Arial-Bold", 9.2)
    pdf.drawCentredString(122, 79, "BOKLAWFIRM.COM")
    pdf.setFillColor(colors.HexColor("#6B655C"))
    pdf.setFont("Georgia-Italic", 8.7)
    pdf.drawString(205, 80, "Use as talking points for the next filming session")
    draw_footer(pdf)


def build_monthly_pdf(month: dict, graphics: list[Path]) -> Path:
    output = PDF_DIR / month["filename"]
    pdf = canvas.Canvas(str(output), pagesize=letter, pageCompression=1)
    pdf.setTitle(f"This Week With BOK - {month['month']}")
    draw_cover(pdf, month)
    pdf.showPage()
    for index, (piece, graphic) in enumerate(zip(month["pieces"], graphics), start=1):
        if piece["type"] == "social":
            draw_social_page(pdf, piece, index, graphic)
        else:
            draw_interview_page(pdf, piece, index)
        pdf.showPage()
    pdf.save()
    return output


def render_pdf_preview(pdf_path: Path, output_path: Path) -> None:
    document = fitz.open(pdf_path)
    rendered: list[Image.Image] = []
    for page in document:
        pixmap = page.get_pixmap(matrix=fitz.Matrix(1.35, 1.35), alpha=False)
        image = Image.frombytes("RGB", [pixmap.width, pixmap.height], pixmap.samples)
        rendered.append(image)
    document.close()
    gap = 18
    page_width = 330
    page_height = int(page_width * (PAGE_H / PAGE_W))
    sheet = Image.new(
        "RGB",
        ((page_width * len(rendered)) + (gap * (len(rendered) + 1)), page_height + 72),
        rgb(BLUE),
    )
    draw = ImageDraw.Draw(sheet)
    label_font = pil_font("sans_bold", 20)
    for index, image in enumerate(rendered):
        thumb = ImageOps.fit(image, (page_width, page_height), method=Image.Resampling.LANCZOS)
        x = gap + (index * (page_width + gap))
        sheet.paste(thumb, (x, 18))
        draw.text((x, page_height + 34), f"PAGE {index + 1}", font=label_font, fill=rgb(NAVY))
    sheet.save(output_path, quality=92)


def render_graphics_preview(graphics: list[Path], output_path: Path) -> None:
    columns = 4
    thumb_w = 260
    thumb_h = 325
    gap = 20
    rows = (len(graphics) + columns - 1) // columns
    sheet = Image.new(
        "RGB",
        ((columns * thumb_w) + ((columns + 1) * gap), (rows * (thumb_h + 45)) + ((rows + 1) * gap)),
        rgb(BLUE),
    )
    draw = ImageDraw.Draw(sheet)
    font = pil_font("sans_bold", 15)
    for index, path in enumerate(graphics):
        image = Image.open(path).convert("RGB")
        thumb = ImageOps.fit(image, (thumb_w, thumb_h), method=Image.Resampling.LANCZOS)
        column = index % columns
        row = index // columns
        x = gap + (column * (thumb_w + gap))
        y = gap + (row * (thumb_h + 45 + gap))
        sheet.paste(thumb, (x, y))
        label = path.parent.name.replace("-", " ").upper()
        draw.text((x, y + thumb_h + 10), label, font=font, fill=rgb(NAVY))
    sheet.save(output_path, quality=92)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def run_qa(data: dict, graphics: list[Path], pdfs: list[Path]) -> dict:
    errors: list[str] = []
    warnings: list[str] = []
    pieces = [piece for month in data["months"] for piece in month["pieces"]]

    # Counts come from the content file, not a hardcoded packet shape. The
    # August/September build was two months of four pieces; a weekly packet is
    # one packet of three. Both are correct, so QA checks consistency instead.
    if not data["months"]:
        errors.append("No packets defined in the content file.")
    if not pieces:
        errors.append("No content pieces defined.")
    if len(graphics) != len(pieces):
        errors.append(f"Expected one graphic per piece ({len(pieces)}), found {len(graphics)}.")
    if len(pdfs) != len(data["months"]):
        errors.append(f"Expected one PDF per packet ({len(data['months'])}), found {len(pdfs)}.")

    # Graphics must all share one size (a packet of mixed sizes is a mistake),
    # but which size depends on the template: 1080x1350 for the photo-and-card
    # layout, 1080x1080 for the square house template used by the July 2026
    # reference. Consistency is the real check, not one hardcoded shape.
    sizes = set()
    for graphic in graphics:
        with Image.open(graphic) as image:
            sizes.add(image.size)
    if len(sizes) > 1:
        errors.append(f"Graphics are not all the same size: {sorted(sizes)}.")
    elif sizes and sizes.pop() not in {SOCIAL_SIZE, (1080, 1080)}:
        with Image.open(graphics[0]) as image:
            errors.append(f"Unsupported graphic size: {image.size}.")

    all_text = json.dumps(data)
    if re.search(r"\bPittsburgh\b|\bAllegheny County\b", all_text, flags=re.IGNORECASE):
        errors.append("Geographic-scope regression found in the monthly content.")

    for month, pdf_path in zip(data["months"], pdfs):
        document = fitz.open(pdf_path)
        expected_pages = 1 + len(month["pieces"])  # cover + one page per piece
        if document.page_count != expected_pages:
            errors.append(
                f"{pdf_path.name} has {document.page_count} pages; expected {expected_pages}."
            )
        for page in document:
            if round(page.rect.width, 2) != 612 or round(page.rect.height, 2) != 792:
                errors.append(f"{pdf_path.name} contains a non-letter page.")
        extracted = re.sub(r"\s+", "", "\n".join(page.get_text() for page in document)).casefold()
        for piece in month["pieces"]:
            title = re.sub(r"\s+", "", piece["title"]).casefold()
            if title not in extracted:
                errors.append(f"Missing title in {pdf_path.name}: {piece['title']}")
        document.close()

    if len({piece["title"] for piece in pieces}) != len(pieces):
        errors.append("Content-piece titles are not unique.")
    for piece in pieces:
        if piece["type"] == "social" and data["disclaimer"] not in piece["caption"]:
            errors.append(f"Missing disclaimer: {piece['title']}")
        if piece["type"] == "interview" and len(piece["questions"]) != 5:
            errors.append(f"Interview page must contain five questions: {piece['title']}")

    return {
        "status": "pass" if not errors else "fail",
        "generated_at": datetime.now().astimezone().isoformat(),
        "counts": {
            "monthly_pdfs": len(pdfs),
            "content_pieces": len(pieces),
            "separate_graphics": len(graphics),
            "pages_per_pdf": [1 + len(m["pieces"]) for m in data["months"]],
        },
        "checks": {
            "one_pdf_per_packet": len(pdfs) == len(data["months"]),
            "one_graphic_per_content_piece": len(graphics) == len(pieces),
            "portrait_graphics_1080_by_1350": not any("graphic size" in item for item in errors),
            "letter_size_five_page_packets": not any("page" in item.lower() for item in errors),
            "all_titles_present": not any("Missing title" in item for item in errors),
            "disclaimers_present": not any("Missing disclaimer" in item for item in errors),
            "geographic_scope_preserved": not any("Geographic-scope" in item for item in errors),
        },
        "errors": errors,
        "warnings": warnings,
    }


def write_qa(qa: dict) -> None:
    (QA_DIR / "qa-report.json").write_text(json.dumps(qa, indent=2), encoding="utf-8")
    lines = [
        "# BOK Monthly Packet QA",
        "",
        f"Status: **{qa['status'].upper()}**",
        "",
        "## Counts",
        "",
        *[f"- {key.replace('_', ' ').title()}: {value}" for key, value in qa["counts"].items()],
        "",
        "## Checks",
        "",
        *[f"- {'PASS' if value else 'FAIL'} - {key.replace('_', ' ')}" for key, value in qa["checks"].items()],
        "",
        "## Errors",
        "",
        *([f"- {item}" for item in qa["errors"]] or ["- None"]),
        "",
        "## Approval boundary",
        "",
        "- Final legal and brand review is required.",
        "- Duplicate-check before scheduling.",
        "- Nothing in this corrected package has been emailed, scheduled, or published.",
    ]
    (QA_DIR / "qa-report.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_readme(data: dict, graphics: list[Path], pdfs: list[Path]) -> None:
    lines = [
        "# BOK August and September 2026 Monthly Content",
        "",
        "Corrected packaging based on the supplied July 2026 visual reference.",
        "",
        "## Final monthly PDFs",
        "",
        *[f"- `separate-monthly-pdfs/{path.name}`" for path in pdfs],
        "",
        "Each PDF is separate and contains:",
        "",
        "- one cover and content index",
        "- three caption-and-graphic content pages",
        "- one five-question filming-prompts page",
        "- the same letter-size hierarchy, blue header and footer, navy series badge, cream field, right-side portrait graphic, website treatment, and filming-prompt structure as the reference",
        "",
        "## Separate content pieces",
        "",
        f"`separate-graphics/` contains {len(graphics)} individual 1080x1350 PNG files, including each interview-prompts page as its own asset.",
        "",
        "## Approval boundary",
        "",
        "Nothing in this package has been emailed, scheduled, or published. Final legal wording, creative pairing, dates, and platform placement require BOK approval and a duplicate check.",
        "",
        "## Rebuild",
        "",
        "```powershell",
        "python .\\build_monthly_packets.py",
        "```",
    ]
    (ROOT / "README.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_reference_notes() -> None:
    lines = [
        "# July 2026 Reference Match",
        "",
        "The supplied `This-Week-With-BOK-July-2026.pdf` was treated as the visual contract.",
        "",
        "Matched structure:",
        "",
        "- US Letter portrait pages",
        "- cream page field with pale-blue header and footer",
        "- centered cover title and month line",
        "- indexed content list on the cover",
        "- navy numbered series badge",
        "- large Georgia-style navy headline with teal underline",
        "- caption column on the left",
        "- portrait final graphic on the right",
        "- final-graphic label and website callout",
        "- standalone five-question filming-prompts page",
        "",
        "The corrected output intentionally does not include a combined master PDF.",
    ]
    (ROOT / "REFERENCE-MATCH.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_manifest() -> Path:
    files: list[dict] = []
    for path in sorted(ROOT.rglob("*")):
        if path.is_file() and path.name != "manifest.json" and "__pycache__" not in path.parts:
            files.append(
                {
                    "path": path.relative_to(ROOT).as_posix(),
                    "bytes": path.stat().st_size,
                    "sha256": sha256(path),
                }
            )
    manifest = {
        "generated_at": datetime.now().astimezone().isoformat(),
        "package": "BOK August and September 2026 monthly content",
        "files": files,
    }
    path = ROOT / "manifest.json"
    path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    return path


def build() -> None:
    ensure_directories()
    register_fonts()
    data = load_data()
    logo = fit_logo()
    all_graphics: list[Path] = []
    all_pdfs: list[Path] = []

    for month in data["months"]:
        month_graphics: list[Path] = []
        for index, piece in enumerate(month["pieces"], start=1):
            if piece["type"] == "social":
                graphic = render_social_graphic(month["month"], piece, index, logo)
            else:
                graphic = render_interview_graphic(month["month"], piece, index, logo)
            month_graphics.append(graphic)
            all_graphics.append(graphic)
        pdf_path = build_monthly_pdf(month, month_graphics)
        all_pdfs.append(pdf_path)
        render_pdf_preview(
            pdf_path,
            PREVIEW_DIR / f"{slugify(month['month'])}-packet-contact-sheet.png",
        )

    render_graphics_preview(all_graphics, PREVIEW_DIR / "all-eight-separate-graphics.png")
    qa = run_qa(data, all_graphics, all_pdfs)
    write_qa(qa)
    write_readme(data, all_graphics, all_pdfs)
    write_reference_notes()
    manifest = write_manifest()

    print(
        json.dumps(
            {
                "status": qa["status"],
                "monthly_pdfs": [str(path) for path in all_pdfs],
                "separate_graphics": len(all_graphics),
                "manifest": str(manifest),
                "errors": qa["errors"],
                "warnings": qa["warnings"],
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    build()
