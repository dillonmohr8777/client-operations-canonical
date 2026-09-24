from __future__ import annotations

import json
import textwrap
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFont
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parent
SOCIAL_DIR = ROOT / "social"
PDF_IMAGE_DIR = SOCIAL_DIR / "pdf-images"
PDF_DIR = ROOT / "pdf"
QA_DIR = ROOT / "qa"
BACKGROUND_DIR = ROOT / "source" / "generated-backgrounds"
LOGO = ROOT.parent / "2026-07-28-august-september-social-content" / "assets" / "bok-law-logo.png"

W = H = 1080
SAFE = 62
NAVY = "#0A3139"
TEAL = "#167E87"
AQUA = "#8FD3D8"
PALE = "#EAF7F7"
CREAM = "#F6F0E5"
INK = "#17363D"
MUTED = "#60777B"
GOLD = "#C88B3A"
WHITE = "#FFFFFF"

ARIAL = Path(r"C:\Windows\Fonts\arial.ttf")
ARIAL_BOLD = Path(r"C:\Windows\Fonts\arialbd.ttf")
GEORGIA = Path(r"C:\Windows\Fonts\georgia.ttf")
GEORGIA_BOLD = Path(r"C:\Windows\Fonts\georgiab.ttf")


CARDS = [
    {
        "slug": "BOK_Wednesday_Wisdom",
        "background": "separation-background.png",
        "kicker": "WEDNESDAY WISDOM",
        "headline": "THE DATE YOU SEPARATE CAN CHANGE THE FINANCIAL PICTURE",
        "deck": "Pennsylvania can recognize separation even while spouses share a home.",
        "items": [
            ("MARK THE MOMENT", "Record the facts that show separate lives."),
            ("SAVE THE STATEMENTS", "Preserve financial records from the transition."),
            ("GET ADVICE EARLY", "Understand the property timeline before you negotiate."),
        ],
        "accent": GOLD,
        "post_title": "Why the date of separation matters",
        "post_copy": (
            "The date of separation can affect how Pennsylvania courts evaluate property, debt, "
            "and the financial timeline of a divorce. Spouses do not always need separate addresses. "
            "Intent and conduct can matter, so contemporaneous records may become important. "
            "A focused legal review can help identify the evidence that fits your circumstances."
        ),
    },
    {
        "slug": "BOK_Truth_Thursday",
        "background": "mediation-background.png",
        "kicker": "TRUTH THURSDAY",
        "headline": "CONFIDENTIAL DOES NOT MEAN CASUAL",
        "deck": "Pennsylvania protects mediation communications, with specific exceptions.",
        "items": [
            ("PROTECTED", "Mediation communications and documents."),
            ("ENFORCEABLE", "A signed settlement may support enforcement."),
            ("INDEPENDENT", "Existing records do not become protected merely because they are discussed."),
        ],
        "accent": AQUA,
        "post_title": "What mediation confidentiality really means",
        "post_copy": (
            "Pennsylvania law generally protects mediation communications from disclosure, but "
            "confidentiality has defined exceptions. A signed agreement may be used when enforcement "
            "is at issue, and evidence that existed independently does not become unavailable simply "
            "because it was discussed during mediation. Good preparation still matters."
        ),
    },
    {
        "slug": "BOK_Saturday_Solutions",
        "background": "digital-assets-background.png",
        "kicker": "SATURDAY SOLUTIONS",
        "headline": "BUILD A DIGITAL ASSET INVENTORY BEFORE YOU NEGOTIATE",
        "deck": "Property does not stop at bank accounts and the house.",
        "items": [
            ("CRYPTOCURRENCY", "Wallets, exchanges, and transaction history."),
            ("ONLINE VALUE", "Businesses, payment accounts, rewards, and stored value."),
            ("DIGITAL RIGHTS", "Domains, royalties, licenses, and valuable files."),
        ],
        "accent": GOLD,
        "post_title": "Digital property belongs on the divorce checklist",
        "post_copy": (
            "Digital property can include cryptocurrency, online businesses, payment accounts, "
            "rewards, domains, royalties, and other electronically stored value. An inventory should "
            "identify where an asset is held, who controls access, and what records can establish its "
            "history and value. Early organization can reduce gaps before negotiation begins."
        ),
    },
]


def font(path: Path, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(path), size=size)


def fit_cover(source: Image.Image, size: tuple[int, int]) -> Image.Image:
    source = source.convert("RGB")
    target_ratio = size[0] / size[1]
    source_ratio = source.width / source.height
    if source_ratio > target_ratio:
        new_width = int(source.height * target_ratio)
        left = (source.width - new_width) // 2
        source = source.crop((left, 0, left + new_width, source.height))
    else:
        new_height = int(source.width / target_ratio)
        top = (source.height - new_height) // 2
        source = source.crop((0, top, source.width, top + new_height))
    return source.resize(size, Image.Resampling.LANCZOS)


def wrap_text(draw: ImageDraw.ImageDraw, value: str, typeface: ImageFont.FreeTypeFont, width: int) -> list[str]:
    words = value.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if draw.textbbox((0, 0), candidate, font=typeface)[2] <= width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def draw_wrapped(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    value: str,
    typeface: ImageFont.FreeTypeFont,
    fill: str,
    width: int,
    line_gap: int = 8,
    max_lines: int | None = None,
) -> int:
    x, y = xy
    lines = wrap_text(draw, value, typeface, width)
    if max_lines:
        lines = lines[:max_lines]
    ascent, descent = typeface.getmetrics()
    line_height = ascent + descent + line_gap
    for line in lines:
        draw.text((x, y), line, font=typeface, fill=fill)
        y += line_height
    return y


def add_logo(card: Image.Image) -> None:
    logo = Image.open(LOGO).convert("RGBA")
    logo.thumbnail((174, 174), Image.Resampling.LANCZOS)
    box = Image.new("RGBA", (204, 204), (255, 255, 255, 238))
    mask = Image.new("L", box.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, box.width - 1, box.height - 1), radius=28, fill=255)
    box.putalpha(mask.point(lambda p: int(p * 0.94)))
    box.alpha_composite(logo, ((box.width - logo.width) // 2, (box.height - logo.height) // 2))
    card.alpha_composite(box, (W - SAFE - box.width, SAFE))


def make_card(spec: dict[str, object]) -> Path:
    panel_width = 650
    card = Image.new("RGBA", (W, H), CREAM)
    background = fit_cover(Image.open(BACKGROUND_DIR / str(spec["background"])), (W - 420, H))
    background = ImageEnhance.Color(background).enhance(0.88)
    card.alpha_composite(background.convert("RGBA"), (420, 0))

    # The content panel overlaps the illustration and gives the composition a strong editorial spine.
    overlay = Image.new("RGBA", (panel_width, H), (246, 240, 229, 255))
    overlay_draw = ImageDraw.Draw(overlay)
    overlay_draw.polygon([(panel_width - 86, 0), (panel_width, 0), (panel_width - 54, H), (panel_width - 150, H)], fill=(246, 240, 229, 255))
    card.alpha_composite(overlay, (0, 0))
    draw = ImageDraw.Draw(card)

    kicker_font = font(ARIAL_BOLD, 22)
    headline_font = font(GEORGIA_BOLD, 47)
    deck_font = font(GEORGIA, 25)
    item_title_font = font(ARIAL_BOLD, 19)
    item_body_font = font(ARIAL, 17)
    small_font = font(ARIAL_BOLD, 15)
    tiny_font = font(ARIAL, 13)

    kicker = str(spec["kicker"])
    kicker_width = draw.textbbox((0, 0), kicker, font=kicker_font)[2] + 42
    draw.rounded_rectangle((SAFE, SAFE, SAFE + kicker_width, SAFE + 48), radius=24, fill=str(spec["accent"]))
    draw.text((SAFE + 21, SAFE + 12), kicker, font=kicker_font, fill=NAVY)

    y = SAFE + 92
    y = draw_wrapped(draw, (SAFE, y), str(spec["headline"]), headline_font, NAVY, 500, line_gap=4, max_lines=5)
    draw.rectangle((SAFE, y + 11, SAFE + 74, y + 18), fill=str(spec["accent"]))
    y += 43
    y = draw_wrapped(draw, (SAFE, y), str(spec["deck"]), deck_font, INK, 500, line_gap=5, max_lines=3)
    y += 20

    for title, body in spec["items"]:  # type: ignore[index]
        draw.ellipse((SAFE, y + 3, SAFE + 16, y + 19), fill=TEAL)
        draw.text((SAFE + 30, y), title, font=item_title_font, fill=TEAL)
        y += 26
        y = draw_wrapped(draw, (SAFE + 30, y), body, item_body_font, INK, 460, line_gap=2, max_lines=2)
        y += 14

    # Fixed footer remains comfortably inside platform crop and mobile safe areas.
    footer_y = H - 142
    draw.line((SAFE, footer_y, 556, footer_y), fill=AQUA, width=3)
    draw.text((SAFE, footer_y + 20), "FREE ONE HOUR CONSULTATION", font=small_font, fill=NAVY)
    draw.text((SAFE, footer_y + 52), "BOKLAWFIRM.COM  •  412.941.9410", font=small_font, fill=TEAL)
    draw.text((SAFE, footer_y + 83), "GENERAL INFORMATION ONLY", font=tiny_font, fill=MUTED)

    add_logo(card)
    output = SOCIAL_DIR / f"{spec['slug']}.png"
    rgb_card = card.convert("RGB")
    rgb_card.save(output, quality=96, optimize=True)
    rgb_card.save(SOCIAL_DIR / f"{spec['slug']}.jpg", "JPEG", quality=90, optimize=True, progressive=True)
    return output


def draw_pdf_page(c: canvas.Canvas, spec: dict[str, object], image_path: Path, page_number: int) -> None:
    page_w, page_h = letter
    c.setFillColor(colors.HexColor(CREAM))
    c.rect(0, 0, page_w, page_h, fill=1, stroke=0)
    c.setFillColor(colors.HexColor(NAVY))
    c.rect(0, page_h - 80, page_w, 80, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 11)
    c.setFillColor(colors.HexColor(AQUA))
    c.drawString(42, page_h - 33, "BOK LAW & MEDIATION SERVICES")
    c.setFont("Helvetica", 8)
    c.setFillColor(colors.white)
    c.drawRightString(page_w - 42, page_h - 33, f"WEEKLY SOCIAL CONTENT  •  {page_number:02d}")

    image_size = 386
    image_x = 42
    image_y = page_h - 80 - 28 - image_size
    c.drawImage(ImageReader(str(image_path)), image_x, image_y, width=image_size, height=image_size, preserveAspectRatio=True, mask="auto")

    c.setFillColor(colors.HexColor(TEAL))
    c.roundRect(452, image_y + 312, 118, 26, 13, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 7.5)
    c.setFillColor(colors.white)
    c.drawCentredString(511, image_y + 321, "READY TO PUBLISH")

    title = str(spec["post_title"])
    c.setFillColor(colors.HexColor(NAVY))
    c.setFont("Times-Bold", 17)
    title_lines = textwrap.wrap(title, width=18)
    ty = image_y + 286
    for line in title_lines:
        c.drawString(452, ty, line)
        ty -= 20

    c.setFillColor(colors.HexColor(MUTED))
    c.setFont("Helvetica", 8.5)
    c.drawString(452, ty - 5, str(spec["kicker"]).title())
    c.setStrokeColor(colors.HexColor(AQUA))
    c.setLineWidth(2)
    c.line(452, ty - 20, 560, ty - 20)

    copy = str(spec["post_copy"])
    c.setFont("Helvetica", 9)
    c.setFillColor(colors.HexColor(INK))
    cy = ty - 43
    for line in textwrap.wrap(copy, width=28):
        c.drawString(452, cy, line)
        cy -= 12

    c.setFillColor(colors.HexColor(PALE))
    c.roundRect(42, 58, page_w - 84, 176, 12, fill=1, stroke=0)
    c.setFillColor(colors.HexColor(NAVY))
    c.setFont("Helvetica-Bold", 9)
    c.drawString(62, 208, "SUGGESTED POST COPY")
    c.setFont("Helvetica", 9.4)
    c.setFillColor(colors.HexColor(INK))
    py = 187
    for line in textwrap.wrap(copy, width=92):
        c.drawString(62, py, line)
        py -= 13
    py -= 5
    c.setFont("Helvetica-Bold", 9)
    c.setFillColor(colors.HexColor(TEAL))
    c.drawString(62, py, "Free one hour consultation  •  boklawfirm.com  •  412.941.9410")
    c.linkURL("https://www.boklawfirm.com/contact", (62, py - 3, 390, py + 11), relative=0)
    c.setFont("Helvetica-Oblique", 7.5)
    c.setFillColor(colors.HexColor(MUTED))
    c.drawString(62, 74, "General information only. This content is not legal advice.")


def build_pdf(outputs: list[Path]) -> Path:
    pdf_path = PDF_DIR / "BOK_Corrected_Weekly_Social_Content.pdf"
    c = canvas.Canvas(str(pdf_path), pagesize=letter)
    c.setTitle("BOK Law & Mediation Services Corrected Weekly Social Content")
    c.setAuthor("BOK Law & Mediation Services")
    c.setSubject("Corrected weekly social content")
    PDF_IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    pdf_images: list[Path] = []
    for image_path in outputs:
        pdf_image = PDF_IMAGE_DIR / f"{image_path.stem}.jpg"
        pdf_card = Image.open(image_path).convert("RGB").resize((720, 720), Image.Resampling.LANCZOS)
        pdf_card.save(pdf_image, "JPEG", quality=74, optimize=True, progressive=True)
        pdf_images.append(pdf_image)
    for index, (spec, image_path) in enumerate(zip(CARDS, pdf_images), start=1):
        draw_pdf_page(c, spec, image_path, index)
        c.showPage()
    c.save()
    return pdf_path


def main() -> None:
    for directory in (SOCIAL_DIR, PDF_DIR, QA_DIR):
        directory.mkdir(parents=True, exist_ok=True)
    outputs = [make_card(spec) for spec in CARDS]
    pdf_path = build_pdf(outputs)
    verification = {
        "brand": "BOK Law & Mediation Services",
        "social_images": [
            {
                "path": str(path),
                "publish_jpg": str(path.with_suffix(".jpg")),
                "width": Image.open(path).width,
                "height": Image.open(path).height,
                "cta_safe_bottom_px": 62,
                "cta_safe_left_px": 62,
            }
            for path in outputs
        ],
        "pdf": str(pdf_path),
        "pdf_pages": len(CARDS),
        "website": "https://www.boklawfirm.com/contact",
        "phone": "412.941.9410",
        "general_information_disclaimer": True,
        "legal_advice_disclaimer": True,
    }
    (QA_DIR / "social-verification.json").write_text(json.dumps(verification, indent=2), encoding="utf-8")
    print(json.dumps(verification, indent=2))


if __name__ == "__main__":
    main()
