from __future__ import annotations

import json
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from pypdf import PdfReader


ROOT = Path(__file__).parent
OUTPUT = ROOT / "BOK-Law-Social-Review-2026-09-12.pdf"
QA = ROOT / "BOK-Law-Social-Review-2026-09-12-QA.json"

NAVY = HexColor("#07313C")
CREAM = HexColor("#F8F3EA")
MIST = HexColor("#D2E9E8")
GOLD = HexColor("#AF8245")
MUTED = HexColor("#5C6C6F")
PAGE_W, PAGE_H = letter


def wrap(text: str, font: str, size: float, width: float) -> list[str]:
    words = text.split(" ")
    lines: list[str] = []
    line = ""
    for word in words:
        candidate = word if not line else f"{line} {word}"
        if pdfmetrics.stringWidth(candidate, font, size) <= width:
            line = candidate
        else:
            lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines


def draw_caption_line(pdf: canvas.Canvas, line: str, x: float, y: float, size: float) -> None:
    """Draw the exact approved text, using Windows' emoji font only for emoji glyphs."""
    cursor = x
    for fragment in line.replace("\ufe0f", "").splitlines() or [""]:
        start = 0
        for index, character in enumerate(fragment):
            if character in {"☀", "🧺"}:
                if index > start:
                    normal = fragment[start:index]
                    pdf.setFont("BOKRegular", size)
                    pdf.drawString(cursor, y, normal)
                    cursor += pdfmetrics.stringWidth(normal, "BOKRegular", size)
                pdf.setFont("BOKEmoji", size)
                pdf.drawString(cursor, y - 1, character)
                cursor += pdfmetrics.stringWidth(character, "BOKEmoji", size)
                start = index + 1
        if start < len(fragment):
            normal = fragment[start:]
            pdf.setFont("BOKRegular", size)
            pdf.drawString(cursor, y, normal)


def draw_page(pdf: canvas.Canvas, *, label: str, status: str, image_name: str, caption_name: str) -> None:
    caption = (ROOT / caption_name).read_text(encoding="utf-8").strip()
    pdf.setFillColor(CREAM)
    pdf.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    pdf.setFillColor(NAVY)
    pdf.setFont("BOKBold", 18)
    pdf.drawString(48, 748, "BOK Law & Mediation Services")
    pdf.setFont("BOKRegular", 8.5)
    pdf.setFillColor(MUTED)
    pdf.drawRightString(PAGE_W - 48, 750, "Social Post Review")
    pdf.setStrokeColor(GOLD)
    pdf.setLineWidth(1.2)
    pdf.line(48, 735, PAGE_W - 48, 735)

    pdf.setFillColor(NAVY)
    pdf.setFont("BOKBold", 13)
    pdf.drawString(48, 708, label)
    pdf.setFillColor(MIST)
    pdf.roundRect(48, 675, 260, 20, 10, fill=1, stroke=0)
    pdf.setFillColor(NAVY)
    pdf.setFont("BOKBold", 8.5)
    pdf.drawCentredString(178, 682, status.upper())

    image = ImageReader(str(ROOT / image_name))
    image_size = 378
    x = (PAGE_W - image_size) / 2
    y = 274
    pdf.drawImage(image, x, y, image_size, image_size, mask="auto", preserveAspectRatio=True, anchor="c")
    pdf.setStrokeColor(HexColor("#D8D0C4"))
    pdf.setLineWidth(0.5)
    pdf.rect(x, y, image_size, image_size, fill=0, stroke=1)

    text_y = 246
    lines: list[str] = []
    for paragraph in caption.split("\n\n"):
        lines.extend(wrap(paragraph.replace("\ufe0f", ""), "BOKRegular", 8.6, PAGE_W - 96))
        lines.append("")
    if lines[-1] == "":
        lines.pop()
    if len(lines) > 17:
        raise ValueError(f"Caption does not fit: {caption_name}")
    for line in lines:
        if line:
            pdf.setFillColor(NAVY)
            draw_caption_line(pdf, line, 48, text_y, 8.6)
        text_y -= 11.1
    pdf.setFillColor(MUTED)
    pdf.setFont("BOKRegular", 7.3)
    pdf.drawRightString(PAGE_W - 48, 32, "Client review copy")
    pdf.showPage()


def main() -> None:
    pdfmetrics.registerFont(TTFont("BOKRegular", r"C:\Windows\Fonts\segoeui.ttf"))
    pdfmetrics.registerFont(TTFont("BOKBold", r"C:\Windows\Fonts\segoeuib.ttf"))
    pdfmetrics.registerFont(TTFont("BOKEmoji", r"C:\Windows\Fonts\seguiemj.ttf"))
    pdf = canvas.Canvas(str(OUTPUT), pagesize=letter, pageCompression=1)
    pdf.setTitle("BOK Law Social Post Review")
    pdf.setAuthor("BOK Law & Mediation Services")
    draw_page(
        pdf,
        label="Saturday Solutions | September 12, 2026",
        status="Published on Facebook at 3:41 PM",
        image_name="saturday-final.png",
        caption_name="saturday-caption.txt",
    )
    draw_page(
        pdf,
        label="Monday Reset | September 14, 2026",
        status="Scheduled for Facebook at 5:00 PM",
        image_name="monday-final.png",
        caption_name="monday-caption.txt",
    )
    pdf.save()

    reader = PdfReader(str(OUTPUT))
    captions = {
        "saturday": (ROOT / "saturday-caption.txt").read_text(encoding="utf-8").strip(),
        "monday": (ROOT / "monday-caption.txt").read_text(encoding="utf-8").strip(),
    }
    extracted = [page.extract_text() or "" for page in reader.pages]
    qa = {
        "pdf": str(OUTPUT),
        "page_count": len(reader.pages),
        "page_size_points": [PAGE_W, PAGE_H],
        "image_fit": "Each 1024 x 1024 source image is placed at 378 x 378 points without cropping.",
        "caption_source_files": ["saturday-caption.txt", "monday-caption.txt"],
        "caption_text_present": {
            name: all(
                sentence in " ".join(extracted[index].split())
                for sentence in [
                    " ".join(part.replace("☀️", "").replace("🧺", "").split())
                    for part in value.split("\n\n")
                ]
            )
            for index, (name, value) in enumerate(captions.items())
        },
        "page_status": [
            "Published on Facebook at 3:41 PM",
            "Scheduled for Facebook at 5:00 PM",
        ],
    }
    if qa["page_count"] != 2 or not all(qa["caption_text_present"].values()):
        raise ValueError("PDF QA failed")
    QA.write_text(json.dumps(qa, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(qa, indent=2))


if __name__ == "__main__":
    main()
