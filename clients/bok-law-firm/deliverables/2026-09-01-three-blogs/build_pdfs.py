from __future__ import annotations

import html
import re
from pathlib import Path

from pypdf import PdfReader
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.platypus import (
    BaseDocTemplate,
    Flowable,
    Frame,
    Image,
    KeepTogether,
    ListFlowable,
    ListItem,
    PageTemplate,
    Paragraph,
    Spacer,
)


ROOT = Path(__file__).resolve().parent
DRAFTS = ROOT / "drafts"
PDF_DIR = ROOT / "pdf"
QA_DIR = ROOT / "qa"
LOGO = ROOT.parent / "2026-07-28-august-september-social-content" / "assets" / "bok-law-logo.png"

BRAND = "BOK Law &amp; Mediation Services"
BRAND_PLAIN = "BOK Law & Mediation Services"
WEBSITE = "https://www.boklawfirm.com/"
PHONE = "412.941.9410"

NAVY = colors.HexColor("#0A3139")
TEAL = colors.HexColor("#167E87")
AQUA = colors.HexColor("#8FD3D8")
PALE_AQUA = colors.HexColor("#EAF7F7")
BLUE = colors.HexColor("#2E63C5")
GOLD = colors.HexColor("#C88B3A")
CREAM = colors.HexColor("#F6F0E5")
INK = colors.HexColor("#17363D")
MUTED = colors.HexColor("#60777B")

ARTICLES = [
    (
        "01-mediation-confidentiality.md",
        "BOK_Mediation_Confidentiality_in_Pennsylvania.pdf",
        "MEDIATION & PRIVACY",
    ),
    (
        "02-date-of-separation.md",
        "BOK_Date_of_Separation_in_a_Pennsylvania_Divorce.pdf",
        "DIVORCE & PROPERTY",
    ),
    (
        "03-digital-assets.md",
        "BOK_Digital_Assets_in_a_Pennsylvania_Divorce.pdf",
        "DIVORCE & DIGITAL PROPERTY",
    ),
]


class Rule(Flowable):
    def __init__(self, width: float, color=BLUE, thickness: float = 1.2):
        super().__init__()
        self.width = width
        self.height = thickness + 2
        self.color = color
        self.thickness = thickness

    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(self.thickness)
        self.canv.line(0, self.height / 2, self.width, self.height / 2)


class AccentCard(Flowable):
    def __init__(self, width: float, kicker: str, title: str):
        super().__init__()
        self.width = width
        self.height = 84
        self.kicker = kicker
        self.title = title

    def draw(self):
        c = self.canv
        c.setFillColor(PALE_AQUA)
        c.roundRect(0, 0, self.width, self.height, 8, stroke=0, fill=1)
        c.setFillColor(GOLD)
        c.roundRect(0, 0, 8, self.height, 4, stroke=0, fill=1)
        c.setFillColor(TEAL)
        c.setFont("Helvetica-Bold", 8.5)
        c.drawString(24, 59, self.kicker)
        c.setFillColor(NAVY)
        c.setFont("Helvetica-Bold", 12.5)
        max_width = self.width - 48
        words = self.title.split()
        lines, current = [], ""
        for word in words:
            candidate = f"{current} {word}".strip()
            if stringWidth(candidate, "Helvetica-Bold", 12.5) <= max_width:
                current = candidate
            else:
                lines.append(current)
                current = word
        if current:
            lines.append(current)
        y = 40
        for line in lines[:2]:
            c.drawString(24, y, line)
            y -= 16
        c.setFillColor(MUTED)
        c.setFont("Helvetica", 8)
        c.drawRightString(self.width - 18, 12, "Updated September 1, 2026  •  Primary sources linked")


def markdown_links(value: str) -> str:
    value = html.escape(value, quote=False)
    pattern = re.compile(r"\[([^\]]+)\]\((https?://[^)]+)\)")

    def repl(match: re.Match[str]) -> str:
        label = match.group(1)
        url = match.group(2).replace("&amp;", "&")
        safe_url = html.escape(url, quote=True)
        return f'<link href="{safe_url}" color="#167E87"><u>{label}</u></link>'

    value = pattern.sub(repl, value)
    value = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", value)
    value = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<i>\1</i>", value)
    # Client-facing copy uses clean prose without dash-style punctuation.
    parts = re.split(r"(<[^>]+>)", value)
    for index in range(0, len(parts), 2):
        parts[index] = re.sub(r"[-\u2010-\u2015]", " ", parts[index])
        parts[index] = re.sub(r" {2,}", " ", parts[index])
    return "".join(parts)


def parse_markdown(path: Path) -> tuple[str, list[tuple[str, object]]]:
    raw = path.read_text(encoding="utf-8").replace("\r\n", "\n")
    lines = raw.splitlines()
    title = ""
    blocks: list[tuple[str, object]] = []
    paragraph: list[str] = []
    bullets: list[str] = []

    def flush_paragraph():
        if paragraph:
            blocks.append(("p", " ".join(x.strip() for x in paragraph).strip()))
            paragraph.clear()

    def flush_bullets():
        if bullets:
            blocks.append(("ul", bullets.copy()))
            bullets.clear()

    for line in lines:
        stripped = line.strip()
        if stripped.startswith("# ") and not title:
            title = stripped[2:].strip()
            continue
        if stripped.startswith("## "):
            flush_paragraph()
            flush_bullets()
            blocks.append(("h2", stripped[3:].strip()))
        elif stripped.startswith("### "):
            flush_paragraph()
            flush_bullets()
            blocks.append(("h3", stripped[4:].strip()))
        elif re.match(r"^[-*]\s+", stripped):
            flush_paragraph()
            bullets.append(re.sub(r"^[-*]\s+", "", stripped))
        elif not stripped:
            flush_paragraph()
            flush_bullets()
        else:
            flush_bullets()
            paragraph.append(stripped)

    flush_paragraph()
    flush_bullets()
    if not title:
        raise ValueError(f"Missing H1 title in {path}")
    return title, blocks


def styles():
    sample = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "Title",
            parent=sample["Title"],
            fontName="Helvetica-Bold",
            fontSize=26,
            leading=29,
            textColor=NAVY,
            spaceAfter=9,
            alignment=TA_LEFT,
        ),
        "deck": ParagraphStyle(
            "Deck",
            parent=sample["BodyText"],
            fontName="Times-Italic",
            fontSize=13.8,
            leading=17,
            textColor=INK,
            spaceAfter=16,
        ),
        "h2": ParagraphStyle(
            "H2",
            parent=sample["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=16,
            leading=19,
            textColor=NAVY,
            spaceBefore=11,
            spaceAfter=5,
            keepWithNext=True,
        ),
        "h3": ParagraphStyle(
            "H3",
            parent=sample["Heading3"],
            fontName="Helvetica-Bold",
            fontSize=11.5,
            leading=14,
            textColor=TEAL,
            spaceBefore=8,
            spaceAfter=4,
            keepWithNext=True,
        ),
        "body": ParagraphStyle(
            "Body",
            parent=sample["BodyText"],
            fontName="Helvetica",
            fontSize=9.7,
            leading=13.2,
            textColor=INK,
            spaceAfter=7,
            allowWidows=0,
            allowOrphans=0,
        ),
        "bullet": ParagraphStyle(
            "Bullet",
            parent=sample["BodyText"],
            fontName="Helvetica",
            fontSize=9.5,
            leading=12.8,
            textColor=INK,
            leftIndent=15,
            firstLineIndent=-10,
            bulletFontName="Helvetica",
            bulletFontSize=8,
            bulletColor=TEAL,
            spaceAfter=3,
        ),
        "legal": ParagraphStyle(
            "Legal",
            parent=sample["BodyText"],
            fontName="Helvetica",
            fontSize=8.3,
            leading=11.2,
            textColor=MUTED,
            borderColor=colors.HexColor("#D8C7A8"),
            borderWidth=0.7,
            borderPadding=9,
            backColor=CREAM,
            spaceBefore=8,
            spaceAfter=8,
        ),
        "source": ParagraphStyle(
            "Source",
            parent=sample["BodyText"],
            fontName="Helvetica",
            fontSize=8.7,
            leading=11.5,
            textColor=INK,
            leftIndent=2,
            spaceAfter=4,
        ),
    }


def draw_chrome(canvas, doc):
    canvas.saveState()
    width, height = letter
    if LOGO.exists():
        canvas.drawImage(str(LOGO), 0.72 * inch, height - 0.82 * inch, width=0.47 * inch, height=0.47 * inch, preserveAspectRatio=True, mask="auto")
    canvas.setFillColor(NAVY)
    canvas.setFont("Helvetica-Bold", 9.2)
    canvas.drawRightString(width - 0.72 * inch, height - 0.51 * inch, "BOK LAW & MEDIATION SERVICES")
    canvas.setStrokeColor(AQUA)
    canvas.setLineWidth(1.4)
    canvas.line(1.31 * inch, height - 0.63 * inch, width - 0.72 * inch, height - 0.63 * inch)

    canvas.setStrokeColor(colors.HexColor("#DCE7E8"))
    canvas.setLineWidth(0.5)
    canvas.line(0.72 * inch, 0.55 * inch, width - 0.72 * inch, 0.55 * inch)
    canvas.setFillColor(NAVY)
    canvas.setFont("Helvetica", 8)
    canvas.drawString(0.72 * inch, 0.36 * inch, "BOKLAWFIRM.COM")
    canvas.drawCentredString(width / 2, 0.36 * inch, PHONE)
    canvas.drawRightString(width - 0.72 * inch, 0.36 * inch, f"PAGE {doc.page}")
    canvas.restoreState()


def is_legal_block(text: str) -> bool:
    lowered = re.sub(r"<[^>]+>", "", text).lower()
    return "not legal advice" in lowered or "attorney-client relationship" in lowered


def build_one(md_name: str, pdf_name: str, kicker: str):
    md_path = DRAFTS / md_name
    pdf_path = PDF_DIR / pdf_name
    PDF_DIR.mkdir(parents=True, exist_ok=True)
    title, blocks = parse_markdown(md_path)
    style = styles()

    doc = BaseDocTemplate(
        str(pdf_path),
        pagesize=letter,
        leftMargin=0.8 * inch,
        rightMargin=0.8 * inch,
        topMargin=0.98 * inch,
        bottomMargin=0.72 * inch,
        title=title,
        author=BRAND_PLAIN,
        subject="Pennsylvania family law educational content",
    )
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="article", leftPadding=0, rightPadding=0, topPadding=4, bottomPadding=0)
    doc.addPageTemplates([PageTemplate(id="BOK", frames=[frame], onPage=draw_chrome)])

    story = [
        Spacer(1, 6),
        Paragraph("BOK LAW CONTENT SERIES &nbsp; • &nbsp; SEPTEMBER 2026", ParagraphStyle("Kicker", fontName="Helvetica-Bold", fontSize=9.5, leading=12, textColor=GOLD, spaceAfter=12)),
        Paragraph(markdown_links(title), style["title"]),
        Rule(doc.width),
        Spacer(1, 9),
    ]

    # Use the first substantive paragraph as the deck and keep it in the article body.
    first_paragraph = next((str(value) for kind, value in blocks if kind == "p" and not is_legal_block(str(value))), "A practical Pennsylvania family law guide with current primary-source links.")
    story.append(Paragraph(markdown_links(first_paragraph), style["deck"]))
    story.append(AccentCard(doc.width, kicker, title))
    story.append(Spacer(1, 12))

    first_consumed = False
    in_sources = False
    for kind, value in blocks:
        if kind == "h2":
            text = str(value)
            in_sources = "source" in text.lower() or "authority" in text.lower()
            story.append(Paragraph(markdown_links(text), style["h2"]))
        elif kind == "h3":
            story.append(Paragraph(markdown_links(str(value)), style["h3"]))
        elif kind == "p":
            text = str(value)
            if not first_consumed and text == first_paragraph:
                first_consumed = True
                continue
            target = style["legal"] if is_legal_block(text) else (style["source"] if in_sources else style["body"])
            story.append(Paragraph(markdown_links(text), target))
        elif kind == "ul":
            for item in value:  # type: ignore[union-attr]
                item_style = style["source"] if in_sources else style["bullet"]
                story.append(Paragraph(markdown_links(str(item)), item_style, bulletText="•"))
            story.append(Spacer(1, 3))

    doc.build(story)
    return pdf_path


def verify(pdf_paths: list[Path]):
    QA_DIR.mkdir(parents=True, exist_ok=True)
    results = []
    for path in pdf_paths:
        reader = PdfReader(str(path))
        text = "\n".join(page.extract_text() or "" for page in reader.pages)
        annots = sum(len(page.get("/Annots", [])) for page in reader.pages)
        result = {
            "file": path.name,
            "bytes": path.stat().st_size,
            "pages": len(reader.pages),
            "links": annots,
            "brand_ok": BRAND_PLAIN.upper() in text.upper(),
            "website_ok": "BOKLAWFIRM.COM" in text.upper(),
            "phone_ok": PHONE in text,
            "legal_disclaimer_ok": "not legal advice" in text.lower(),
            "title_present": bool(reader.metadata and reader.metadata.title),
        }
        if result["pages"] < 2 or result["links"] < 2 or not all(result[k] for k in ("brand_ok", "website_ok", "phone_ok", "legal_disclaimer_ok", "title_present")):
            raise RuntimeError(f"PDF verification failed: {result}")
        results.append(result)

    import json

    (QA_DIR / "pdf-verification.json").write_text(json.dumps(results, indent=2), encoding="utf-8")
    return results


def main():
    missing = [name for name, _, _ in ARTICLES if not (DRAFTS / name).exists()]
    if missing:
        raise FileNotFoundError(f"Missing article drafts: {missing}")
    paths = [build_one(*item) for item in ARTICLES]
    results = verify(paths)
    for result in results:
        print(result)


if __name__ == "__main__":
    main()
