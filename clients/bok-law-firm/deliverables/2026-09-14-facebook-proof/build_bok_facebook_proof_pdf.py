from pathlib import Path

from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas


ROOT = Path(r"C:\Users\dillo\Documents\Codex\projects\client-operations\clients\bok-law-firm\deliverables")
SOURCE = ROOT / "2026-09-12-sunburst-social"
OUT = ROOT / "2026-09-14-facebook-proof" / "BOK-Facebook-Content-Proof-2026-09-14.pdf"


def draw_lines(pdf, lines, x, y, leading=15):
    for line in lines:
        pdf.drawString(x, y, line)
        y -= leading
    return y


def add_review_page(pdf, image_path):
    page_w, page_h = letter
    img = ImageReader(str(image_path))
    iw, ih = img.getSize()
    scale = min(page_w / iw, page_h / ih)
    w = iw * scale
    h = ih * scale
    pdf.drawImage(img, (page_w - w) / 2, (page_h - h) / 2, width=w, height=h)
    pdf.showPage()


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    pdf = canvas.Canvas(str(OUT), pagesize=letter)
    pdf.setTitle("BOK Facebook Content Proof 2026-09-14")

    pdf.setFont("Helvetica-Bold", 18)
    pdf.drawString(54, 730, "BOK Facebook Content Proof")
    pdf.setFont("Helvetica", 11)
    lines = [
        "Client: BOK Law & Mediation Services, PLLC",
        "Facebook page ID: 116652527977793",
        "Prepared: 2026-09-14",
        "",
        "Live Meta Business Suite capture status:",
        "Blocked at the Meta Business login page. The page showed Continue with Facebook,",
        "but semantic, keyboard, and coordinate activation did not advance to Planner.",
        "",
        "Local delivery evidence from 2026-09-12-sunburst-social/DELIVERY.md:",
        "Saturday Solutions: published on Facebook on 2026-09-12 at 3:41 PM.",
        "Published-content ID: 1093004923698100.",
        "Monday Reset: scheduled for Facebook on 2026-09-14 at 5:00 PM.",
        "Details ID: 2330074904404742.",
        "Facebook only. No Instagram, stories, ad mode, boosting, client email, or Slack.",
        "",
        "The next pages are the rendered post-review pages containing the final graphics",
        "and captions for the BOK content that was made or scheduled.",
    ]
    draw_lines(pdf, lines, 54, 695)
    pdf.showPage()

    add_review_page(pdf, SOURCE / "BOK-Law-Social-Review-2026-09-12-page-1.png")
    add_review_page(pdf, SOURCE / "BOK-Law-Social-Review-2026-09-12-page-2.png")
    pdf.save()
    print(OUT)


if __name__ == "__main__":
    main()
