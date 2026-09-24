from pathlib import Path
from textwrap import wrap

from PIL import Image, ImageEnhance, ImageOps
from reportlab.lib.colors import Color, HexColor, white
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"
OUT = ROOT / "output" / "pdf" / "HRchitect-Growth-Opportunity-Brief-2026-08-20.pdf"
TMP = ROOT / "tmp" / "pdfs"
OUT.parent.mkdir(parents=True, exist_ok=True)
TMP.mkdir(parents=True, exist_ok=True)

PAGE_W = 960
PAGE_H = 540

INK = HexColor("#08131F")
INK_2 = HexColor("#17324D")
MUTED = HexColor("#5D6B78")
LINE = HexColor("#D9E5EC")
PAPER = HexColor("#F7FAFC")
BLUE = HexColor("#47AEE3")
BLUE_DARK = HexColor("#155D96")
BLUE_PALE = HexColor("#EAF6FC")
GRAY = HexColor("#929497")
ORANGE = HexColor("#F05A28")
GREEN = HexColor("#159B63")
RED = HexColor("#C64A4A")


def register_fonts():
    fonts = Path("C:/Windows/Fonts")
    pdfmetrics.registerFont(TTFont("UI", str(fonts / "segoeui.ttf")))
    pdfmetrics.registerFont(TTFont("UI-Bold", str(fonts / "segoeuib.ttf")))
    pdfmetrics.registerFont(TTFont("UI-Italic", str(fonts / "segoeuii.ttf")))
    pdfmetrics.registerFont(TTFont("Serif-Italic", str(fonts / "georgiai.ttf")))


register_fonts()


def prepare_images():
    logo_page = Image.open(ASSETS / "hrchitect-logo-page.png").convert("RGB")
    logo = logo_page.crop((0, 0, 306, 55)).resize((1224, 220), Image.Resampling.LANCZOS)
    logo.save(ASSETS / "hrchitect-logo.png", quality=96)

    for name in [
        "semrush-domain-overview-2026-08-20.png",
        "semrush-organic-rankings-2026-08-19.png",
        "semrush-keyword-gap-2026-08-19.png",
        "google-ai-overview-paychex-vs-paylocity-live-2026-08-20.png",
        "google-ai-overview-data-conversion-live-2026-08-20.png",
    ]:
        path = ASSETS / name
        image = Image.open(path).convert("RGB")
        image = ImageEnhance.Sharpness(image).enhance(1.08)
        image.save(TMP / name, quality=94)


prepare_images()


def para(c, text, x, top, width, font="UI", size=13, leading=None, color=INK, align=TA_LEFT):
    if leading is None:
        leading = size * 1.3
    style = ParagraphStyle(
        name="p",
        fontName=font,
        fontSize=size,
        leading=leading,
        textColor=color,
        alignment=align,
        spaceAfter=0,
        spaceBefore=0,
    )
    p = Paragraph(text, style)
    _, h = p.wrap(width, PAGE_H)
    p.drawOn(c, x, top - h)
    return h


def label(c, text, x, y, color=BLUE_DARK, size=9):
    c.setFillColor(color)
    c.setFont("UI-Bold", size)
    c.drawString(x, y, text.upper())


def metric(c, x, y, w, h, value, title, note="", accent=BLUE):
    c.setFillColor(white)
    c.setStrokeColor(LINE)
    c.setLineWidth(1)
    c.roundRect(x, y, w, h, 13, fill=1, stroke=1)
    c.setFillColor(accent)
    c.roundRect(x, y + h - 7, w, 7, 7, fill=1, stroke=0)
    c.setFillColor(INK)
    c.setFont("UI-Bold", 25)
    c.drawString(x + 15, y + h - 38, value)
    c.setFillColor(INK_2)
    c.setFont("UI-Bold", 10.5)
    c.drawString(x + 15, y + h - 57, title)
    if note:
        para(c, note, x + 15, y + h - 71, w - 30, size=8.4, leading=10.3, color=MUTED)


def card(c, x, y, w, h, title, body, accent=BLUE, number=None, fill=white):
    c.setFillColor(fill)
    c.setStrokeColor(LINE)
    c.setLineWidth(1)
    c.roundRect(x, y, w, h, 15, fill=1, stroke=1)
    if number is not None:
        c.setFillColor(accent)
        c.circle(x + 25, y + h - 26, 13, fill=1, stroke=0)
        c.setFillColor(white)
        c.setFont("UI-Bold", 10)
        c.drawCentredString(x + 25, y + h - 29.5, str(number))
        tx = x + 48
    else:
        c.setFillColor(accent)
        c.roundRect(x + 15, y + h - 25, 23, 5, 2.5, fill=1, stroke=0)
        tx = x + 15
    para(c, f"<b>{title}</b>", tx, y + h - 18, w - (tx - x) - 15, size=11.5, leading=14, color=INK)
    para(c, body, x + 15, y + h - 48, w - 30, size=9.6, leading=13, color=MUTED)


def topbar(c, section, title, subtitle=None, dark=False):
    if dark:
        c.setFillColor(INK)
        c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
        fg, sub = white, HexColor("#BFD0DD")
    else:
        c.setFillColor(PAPER)
        c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
        fg, sub = INK, MUTED
    label(c, section, 54, 497, BLUE if dark else BLUE_DARK, 9)
    para(c, title, 54, 479, 850, font="UI-Bold", size=27, leading=31, color=fg)
    if subtitle:
        para(c, subtitle, 54, 438, 840, size=10.5, leading=14, color=sub)
    c.setStrokeColor(HexColor("#294155") if dark else LINE)
    c.line(54, 418, 906, 418)


def footer(c, page_num, source=None, dark=False):
    fg = HexColor("#8EA2B0") if dark else HexColor("#70808C")
    c.setFillColor(fg)
    c.setFont("UI", 7.5)
    c.drawString(54, 20, "Prepared by Dillon Mohr | 20 Aug 2026")
    if source:
        c.drawCentredString(PAGE_W / 2, 20, source)
    c.setFont("UI-Bold", 8)
    c.drawRightString(906, 20, f"{page_num:02d}")


def draw_image_cover(c, path, x, y, w, h, radius=10, border=True, crop=None):
    image = Image.open(path).convert("RGB")
    if crop:
        image = image.crop(crop)
    target_ratio = w / h
    source_ratio = image.width / image.height
    if source_ratio > target_ratio:
        new_w = int(image.height * target_ratio)
        left = max(0, (image.width - new_w) // 2)
        image = image.crop((left, 0, left + new_w, image.height))
    else:
        new_h = int(image.width / target_ratio)
        top = max(0, (image.height - new_h) // 2)
        image = image.crop((0, top, image.width, top + new_h))
    tmp = TMP / f"crop-{path.stem}-{int(x)}-{int(y)}-{int(w)}-{int(h)}.png"
    image.save(tmp, quality=94)
    c.saveState()
    p = c.beginPath()
    p.roundRect(x, y, w, h, radius)
    c.clipPath(p, stroke=0)
    c.drawImage(ImageReader(tmp), x, y, w, h, mask="auto")
    c.restoreState()
    if border:
        c.setStrokeColor(LINE)
        c.setLineWidth(1)
        c.roundRect(x, y, w, h, radius, fill=0, stroke=1)


def pill(c, x, y, text, fill=BLUE_PALE, fg=BLUE_DARK):
    width = pdfmetrics.stringWidth(text, "UI-Bold", 8.6) + 22
    c.setFillColor(fill)
    c.roundRect(x, y, width, 22, 11, fill=1, stroke=0)
    c.setFillColor(fg)
    c.setFont("UI-Bold", 8.6)
    c.drawCentredString(x + width / 2, y + 7.1, text)
    return width


def table(c, x, top, widths, headers, rows, row_h=31, font_size=8.6, highlight_col=None):
    total_w = sum(widths)
    c.setFillColor(INK)
    c.roundRect(x, top - row_h, total_w, row_h, 7, fill=1, stroke=0)
    cx = x
    for width, header in zip(widths, headers):
        c.setFillColor(white)
        c.setFont("UI-Bold", 8.2)
        c.drawString(cx + 9, top - row_h / 2 - 3, header)
        cx += width
    y = top - row_h
    for idx, row in enumerate(rows):
        y -= row_h
        c.setFillColor(white if idx % 2 == 0 else HexColor("#F0F6F9"))
        c.rect(x, y, total_w, row_h, fill=1, stroke=0)
        cx = x
        for col, (width, value) in enumerate(zip(widths, row)):
            c.setFillColor(BLUE_DARK if highlight_col == col else INK_2)
            c.setFont("UI-Bold" if highlight_col == col else "UI", font_size)
            c.drawString(cx + 9, y + (row_h - font_size) / 2 + 1.5, str(value))
            cx += width
    c.setStrokeColor(LINE)
    c.roundRect(x, y, total_w, top - y, 7, fill=0, stroke=1)
    return y


def bullet(c, text, x, top, width, color=INK_2, accent=BLUE, size=10):
    c.setFillColor(accent)
    c.circle(x + 4, top - 7, 3, fill=1, stroke=0)
    return para(c, text, x + 15, top, width - 15, size=size, leading=size * 1.35, color=color)


def add_url(c, text, url, x, y, size=11, color=BLUE_DARK):
    c.setFont("UI-Bold", size)
    c.setFillColor(color)
    c.drawString(x, y, text)
    width = pdfmetrics.stringWidth(text, "UI-Bold", size)
    c.linkURL(url, (x, y - 2, x + width, y + size + 2), relative=0)


def build():
    c = canvas.Canvas(str(OUT), pagesize=(PAGE_W, PAGE_H), pageCompression=1)
    c.setTitle("HRchitect Growth Opportunity Brief")
    c.setAuthor("Dillon Mohr")
    c.setSubject("SEO, AEO, GEO, and marketing systems opportunity brief")

    # 1. Cover
    c.setFillColor(PAPER)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(BLUE_PALE)
    c.circle(870, 500, 190, fill=1, stroke=0)
    c.setFillColor(Color(0.278, 0.682, 0.89, alpha=0.15))
    c.circle(820, 52, 150, fill=1, stroke=0)
    c.setFillAlpha(1)
    c.drawImage(ImageReader(ASSETS / "hrchitect-logo.png"), 55, 460, 250, 45, mask="auto")
    label(c, "Search + AI visibility opportunity", 55, 423, BLUE_DARK, 9)
    para(c, "HRchitect already has authority.<br/>The next move is <font color='#155D96'>category coverage.</font>", 55, 397, 760, font="UI-Bold", size=37, leading=42, color=INK)
    para(c, "A focused SEO, AEO, and GEO prospect brief for Samantha Coughlin, EVP, Marketing & Strategic Alliances.", 58, 290, 700, size=13.5, leading=18, color=MUTED)
    metric(c, 55, 128, 190, 95, "30", "Authority Score", "A credible base to compound.", BLUE_DARK)
    metric(c, 260, 128, 190, 95, "463", "US organic keywords", "Semrush, 19 Aug 2026.", BLUE)
    metric(c, 465, 128, 190, 95, "326", "Raw missing terms", "Curated before action.", ORANGE)
    metric(c, 670, 128, 190, 95, "10", "AI mentions", "64 cited pages in Semrush.", GREEN)
    para(c, "Built from live Semrush data, current Google AI results, public site inspection, and historical Align HCM evidence.", 55, 94, 805, size=9.2, leading=12, color=MUTED)
    add_url(c, "dillon-mohr-portfolio.netlify.app", "https://dillon-mohr-portfolio.netlify.app", 55, 46, 10.5)
    footer(c, 1)
    c.showPage()

    # 2. Executive read
    topbar(c, "01 / Executive read", "Do not rebuild the brand. Make its expertise easier to extract.", "HRchitect has real authority, service breadth, and proof. The highest leverage move is to organize that authority around buyer questions with measurable commercial intent.")
    para(c, "The signal", 54, 392, 210, font="UI-Bold", size=12, color=BLUE_DARK)
    para(c, "HRchitect is not starting from zero. It already ranks for platform consulting and implementation terms that matter. The opportunity is to protect those wins while building cleaner coverage around integrations, migration, comparisons, and post implementation support.", 54, 368, 330, size=14, leading=20, color=INK)
    card(c, 420, 312, 150, 90, "Protect", "Pages already ranking for UKG, Dayforce, Paylocity, HCM consulting, and vendor selection.", BLUE_DARK, 1)
    card(c, 585, 312, 150, 90, "Expand", "Qualified gaps with low to moderate difficulty and clear buyer relevance.", BLUE, 2)
    card(c, 750, 312, 156, 90, "Connect", "Rankings, AI citations, content QA, HubSpot, and qualified pipeline in one operating view.", GREEN, 3)
    metric(c, 420, 191, 150, 100, "593", "US traffic estimate", "Down 71.3% in the selected Semrush view.", RED)
    metric(c, 585, 191, 150, 100, "2.4K", "Worldwide estimate", "Down 42% in Domain Overview.", ORANGE)
    metric(c, 750, 191, 156, 100, "15", "AI Visibility", "Semrush visibility score.", BLUE)
    c.setFillColor(BLUE_PALE)
    c.roundRect(54, 62, 852, 101, 15, fill=1, stroke=0)
    para(c, "<b>The pitch is not 326 keywords.</b> That raw gap includes irrelevant brand and navigational terms. The pitch is a qualified opportunity model that keeps only the terms HRchitect can credibly own, maps each term to the right page type, and measures the result across search, AI answers, and CRM outcomes.", 76, 136, 808, size=12.4, leading=17, color=INK_2)
    footer(c, 2, "Sources: Semrush Domain Overview 20 Aug 2026; US Organic Rankings 19 Aug 2026")
    c.showPage()

    # 3. Current strengths
    topbar(c, "02 / Current strengths", "Protect the pages that are already earning commercial visibility.", "These rankings prove that HRchitect can win specialized HCM intent. Expansion should reinforce these entities and avoid cannibalizing the pages that already perform.")
    rows = [
        ("paylocity consulting firm", "1", "90", "13", "/paylocity/"),
        ("ukg consultants", "2", "210", "12", "/ukg/"),
        ("dayforce consulting services", "4", "90", "9", "/dayforce/"),
        ("ukg pro implementation partner", "4", "90", "12", "/ukg/"),
        ("hr technology consulting", "5", "480", "18", "/"),
        ("hcm consulting", "7", "720", "22", "/"),
    ]
    table(c, 54, 392, [300, 70, 80, 65, 300], ["Keyword", "Pos.", "Vol.", "KD", "Ranking page"], rows, row_h=34, font_size=8.7, highlight_col=1)
    card(c, 54, 46, 266, 90, "Commercial foundation", "Platform pages already match service intent. Add clearer proof, direct answers, and expert review without changing their core job.", BLUE_DARK)
    card(c, 337, 46, 266, 90, "Content authority", "Migration, vendor selection, and implementation articles can support decision journeys and link back to service pages.", BLUE)
    card(c, 620, 46, 286, 90, "Content hygiene", "Legacy pages attract some off-topic traffic. Consolidate or isolate distractions so topical authority stays centered on HCM outcomes.", ORANGE)
    footer(c, 3, "Source: Semrush US Organic Rankings, desktop, 19 Aug 2026")
    c.showPage()

    # 4. Qualified gaps
    topbar(c, "03 / Qualified gaps", "Five clusters turn a noisy gap into a practical roadmap.", "Volumes are directional and related terms overlap. The point is to prioritize credible buyer problems, not inflate an audience estimate.")
    clusters = [
        ("Integrations", "1,510", "HR integration, HR software integrations, HR system integration, HCM integration, HR data integration services", BLUE_DARK),
        ("Implementation risk", "730", "Workday implementation challenges, issues, and failures", ORANGE),
        ("Comparisons", "770", "Paycom vs Paylocity, Paylocity vs Paychex, Paycor vs Paylocity, UKG vs Workday", BLUE),
        ("Data migration", "780", "Migration checklists, conversion process, conversion vs migration, Workday data migration strategy", GREEN),
        ("Optimization", "300", "Paylocity optimization, UKG optimization, payroll implementation checklist, post implementation support", HexColor("#7559B7")),
    ]
    x = 54
    for name, volume, desc, accent in clusters:
        c.setFillColor(white)
        c.setStrokeColor(LINE)
        c.roundRect(x, 285, 158, 113, 14, fill=1, stroke=1)
        c.setFillColor(accent)
        c.setFont("UI-Bold", 21)
        c.drawString(x + 13, 363, volume)
        c.setFillColor(INK)
        c.setFont("UI-Bold", 10.5)
        c.drawString(x + 13, 342, name)
        para(c, desc, x + 13, 325, 132, size=7.8, leading=10.3, color=MUTED)
        x += 170
    rows = [
        ("workday implementation challenges", "480", "15", "33"),
        ("hr system integration", "320", "13", "48"),
        ("paylocity vs paychex", "140", "11", "9"),
        ("data conversion process", "110", "3", "43"),
        ("hr data integration services", "110", "19", "5"),
        ("workday implementation failures", "110", "8", "13"),
        ("paychex vs paylocity", "90", "8", "4"),
        ("paylocity implementation and optimization", "90", "1", "8"),
        ("payroll implementation checklist", "70", "2", "8"),
        ("workday post implementation support model", "70", "3", "9"),
    ]
    table(c, 54, 259, [510, 90, 90, 145], ["Qualified missing keyword", "Volume", "KD", "Align position"], rows, row_h=17.5, font_size=7.7, highlight_col=2)
    footer(c, 4, "Source: Semrush Keyword Gap, HRchitect vs Align HCM, US desktop, 19 Aug 2026")
    c.showPage()

    # 5. AI search proof
    topbar(c, "04 / AI search proof", "Classic rankings can become answer engine citations.", "Two current Google checks revalidated Align HCM as an AI Overview source. Historical July evidence is included separately and labeled as historical.")
    draw_image_cover(c, TMP / "google-ai-overview-paychex-vs-paylocity-live-2026-08-20.png", 54, 186, 410, 213, 12, True, crop=(0, 0, 1264, 590))
    draw_image_cover(c, TMP / "google-ai-overview-data-conversion-live-2026-08-20.png", 482, 186, 424, 213, 12, True, crop=(0, 0, 1264, 590))
    pill(c, 67, 199, "LIVE 20 AUG 2026", HexColor("#E5F5ED"), GREEN)
    pill(c, 495, 199, "LIVE 20 AUG 2026", HexColor("#E5F5ED"), GREEN)
    para(c, "<b>Paychex vs Paylocity</b><br/>Align HCM appears inside the generated answer as a cited source.", 54, 164, 410, size=9.8, leading=13, color=INK_2)
    para(c, "<b>Data conversion strategy</b><br/>Align HCM appears in the AI Overview source carousel.", 482, 164, 424, size=9.8, leading=13, color=INK_2)
    c.setFillColor(BLUE_PALE)
    c.roundRect(54, 55, 852, 71, 14, fill=1, stroke=0)
    para(c, "<b>How the system earns the chance to be cited:</b> direct answers, specific comparison criteria, extractable headings, source-backed facts, expert review, tight internal linking, indexable pages, and consistent entity language across the site. July 2026 Semrush evidence recorded 11 distinct Align AI Overview keywords. Current results remain volatile and are not guaranteed.", 75, 108, 810, size=10.1, leading=14, color=INK_2)
    footer(c, 5, "Current Google results captured 20 Aug 2026; July evidence labeled historical")
    c.showPage()

    # 6. Technical audit
    topbar(c, "05 / Technical AEO + GEO audit", "The site is crawlable. Now make answers easier to extract.", "Sampled pages: homepage, UKG, Paylocity, and Dayforce. This is a focused public audit, not a full crawl.")
    checks = [
        ("Crawl access", "PASS", "robots.txt returns 200 and allows crawling.", GREEN),
        ("Sitemaps", "PASS", "Yoast index exposes core content, platform, service, leadership, and author maps.", GREEN),
        ("Page hygiene", "PASS", "Sampled pages return 200 with canonicals, one H1, titles, and descriptions.", GREEN),
        ("Baseline schema", "PARTIAL", "Organization, WebPage, WebSite, and BreadcrumbList are present.", ORANGE),
        ("Service schema", "OPPORTUNITY", "Sampled commercial pages did not expose Service or FAQPage schema.", BLUE),
        ("Answer extraction", "OPPORTUNITY", "Add direct answers, comparison tables, process steps, FAQs, authorship, and citations.", BLUE),
    ]
    y = 388
    for title, status, body, accent in checks:
        c.setFillColor(white)
        c.setStrokeColor(LINE)
        c.roundRect(54, y - 42, 510, 51, 11, fill=1, stroke=1)
        c.setFillColor(accent)
        c.roundRect(68, y - 22, 88, 20, 10, fill=1, stroke=0)
        c.setFillColor(white)
        c.setFont("UI-Bold", 7.8)
        c.drawCentredString(112, y - 15.2, status)
        para(c, f"<b>{title}</b><br/>{body}", 174, y + 1, 372, size=8.9, leading=11.5, color=INK_2)
        y -= 55
    c.setFillColor(INK)
    c.roundRect(592, 73, 314, 326, 18, fill=1, stroke=0)
    label(c, "Answer engine framework", 615, 368, BLUE, 8.5)
    para(c, "Structure", 615, 345, 250, font="UI-Bold", size=22, color=white)
    para(c, "Direct answers, useful headings, tables, steps, FAQs, schema, canonical pages.", 615, 314, 255, size=10, leading=14, color=HexColor("#BFD0DD"))
    c.setStrokeColor(HexColor("#294155"))
    c.line(615, 258, 882, 258)
    para(c, "Authority", 615, 238, 250, font="UI-Bold", size=22, color=white)
    para(c, "Named experts, original evidence, client proof, transparent sources, refresh ownership.", 615, 207, 255, size=10, leading=14, color=HexColor("#BFD0DD"))
    c.line(615, 150, 882, 150)
    para(c, "Presence", 615, 142, 250, font="UI-Bold", size=22, color=white)
    para(c, "Consistent entities across search, partner ecosystems, earned media, and trusted third party citations.", 615, 111, 255, size=9.2, leading=13, color=HexColor("#BFD0DD"))
    footer(c, 6, "Public inspection completed 20 Aug 2026")
    c.showPage()

    # 7. 90-day sprint
    topbar(c, "06 / Proposed 90-day sprint", "Move from insight to a measurable publishing system.", "A focused sprint can prove the operating model before wider expansion. Scope should be finalized against internal priorities, capacity, and CRM definitions.")
    phases = [
        ("Weeks 1-2", "Baseline + map", ["Confirm conversion definitions", "Freeze keyword and AI benchmarks", "Map entities, pages, links, and proof", "Prioritize 5 commercial pages"]),
        ("Weeks 3-6", "Build + refresh", ["Refresh priority platform pages", "Publish integration and migration hubs", "Create comparison and failure-prevention assets", "Add supported schema and author review"]),
        ("Weeks 7-10", "Distribute + validate", ["Internal link deployment", "Partner and expert amplification", "Indexing and extraction QA", "AI citation and SERP monitoring"]),
        ("Weeks 11-12", "Measure + decide", ["Search and AI movement", "Qualified landing-page behavior", "HubSpot source and lead review", "Next-quarter investment decision"]),
    ]
    x = 54
    colors = [BLUE_DARK, BLUE, ORANGE, GREEN]
    for idx, ((weeks, title, items), accent) in enumerate(zip(phases, colors), start=1):
        c.setFillColor(white)
        c.setStrokeColor(LINE)
        c.roundRect(x, 142, 196, 258, 15, fill=1, stroke=1)
        c.setFillColor(accent)
        c.roundRect(x, 361, 196, 39, 15, fill=1, stroke=0)
        c.setFillColor(white)
        c.setFont("UI-Bold", 9)
        c.drawString(x + 15, 376, weeks.upper())
        para(c, title, x + 15, 341, 166, font="UI-Bold", size=16, leading=19, color=INK)
        top = 298
        for item in items:
            h = bullet(c, item, x + 15, top, 166, size=9, accent=accent)
            top -= h + 9
        x += 216
    c.setFillColor(BLUE_PALE)
    c.roundRect(54, 62, 852, 57, 13, fill=1, stroke=0)
    para(c, "Success is not a content count. It is a repeatable path from qualified intent to extractable answers, rankings and citations, engaged buyers, and CRM evidence that the right people are moving.", 76, 101, 810, size=11, leading=15, color=INK_2)
    footer(c, 7)
    c.showPage()

    # 8. Operating system
    topbar(c, "07 / The operating system", "One operator. Connected systems. Human judgment in control.", "The advantage is not one tool. It is the infrastructure that moves research, production, QA, publishing, and reporting through one governed loop.", dark=True)
    nodes = [
        ("Semrush + Search Console", "Opportunity and movement", BLUE),
        ("Intent model", "Qualified clusters and page jobs", BLUE_DARK),
        ("Content + brand system", "Briefs, copy, design, proof", ORANGE),
        ("CMS + HubSpot agents", "Metadata, links, schema, CRM", GREEN),
        ("QA + monitoring", "Indexing, citations, errors", HexColor("#7559B7")),
        ("Reporting", "Search, AI, behavior, pipeline", BLUE),
    ]
    coords = [(60, 284), (346, 284), (632, 284), (60, 148), (346, 148), (632, 148)]
    for idx, ((title, body, accent), (x, y)) in enumerate(zip(nodes, coords), start=1):
        c.setFillColor(HexColor("#102436"))
        c.setStrokeColor(HexColor("#294155"))
        c.roundRect(x, y, 268, 91, 15, fill=1, stroke=1)
        c.setFillColor(accent)
        c.circle(x + 29, y + 59, 13, fill=1, stroke=0)
        c.setFillColor(white)
        c.setFont("UI-Bold", 9)
        c.drawCentredString(x + 29, y + 56, str(idx))
        para(c, title, x + 51, y + 74, 197, font="UI-Bold", size=12, leading=15, color=white)
        para(c, body, x + 51, y + 49, 197, size=9, leading=12, color=HexColor("#BFD0DD"))
    for x1, y1, x2, y2 in [(328,329,346,329),(614,329,632,329),(194,284,194,239),(480,284,480,239),(766,284,766,239),(328,193,346,193),(614,193,632,193)]:
        c.setStrokeColor(BLUE)
        c.setLineWidth(2)
        c.line(x1, y1, x2, y2)
    c.setFillColor(HexColor("#102436"))
    c.roundRect(60, 66, 840, 55, 14, fill=1, stroke=0)
    para(c, "Built across specialized skills, harnesses, MCPs, APIs, terminal agents, and integrations. The system accelerates the repeatable work so strategy, evidence, and editorial decisions receive more attention.", 82, 104, 796, size=10.7, leading=15, color=HexColor("#D5E2EA"))
    footer(c, 8, dark=True)
    c.showPage()

    # 9. Semrush evidence appendix
    topbar(c, "Appendix A / Live Semrush evidence", "The source screens behind the opportunity model.", "Authenticated Semrush screenshots captured from the current worldwide overview, US organic rankings, and HRchitect versus Align HCM keyword gap.")
    draw_image_cover(c, TMP / "semrush-domain-overview-2026-08-20.png", 54, 235, 852, 166, 12, True, crop=(0, 0, 1264, 700))
    pill(c, 68, 248, "WORLDWIDE 20 AUG 2026", HexColor("#E5F5ED"), GREEN)
    draw_image_cover(c, TMP / "semrush-organic-rankings-2026-08-19.png", 54, 58, 412, 155, 12, True, crop=(0, 0, 1264, 700))
    pill(c, 68, 70, "US RANKINGS 19 AUG 2026", BLUE_PALE, BLUE_DARK)
    draw_image_cover(c, TMP / "semrush-keyword-gap-2026-08-19.png", 484, 58, 422, 155, 12, True, crop=(0, 0, 1264, 700))
    pill(c, 498, 70, "KEYWORD GAP 19 AUG 2026", BLUE_PALE, BLUE_DARK)
    footer(c, 9, "Semrush estimates vary by database, date, country, and device")
    c.showPage()

    # 10. Historical AI Overview evidence appendix
    topbar(c, "Appendix B / Historical Google evidence", "July AI Overview captures, preserved with their original context.", "These images are historical proof from July 2026. Current results were rechecked separately on 20 Aug 2026 and are shown on page 5.")
    draw_image_cover(c, ASSETS / "align-google-ai-overview-hr-data-integration.png", 54, 233, 412, 169, 12, True, crop=(0, 0, 1264, 680))
    draw_image_cover(c, ASSETS / "align-google-ai-overview-paychex-vs-paylocity.png", 484, 233, 422, 169, 12, True, crop=(0, 0, 1264, 680))
    draw_image_cover(c, ASSETS / "align-google-ai-overview-data-conversion.png", 54, 58, 412, 153, 12, True, crop=(0, 0, 1264, 680))
    c.setFillColor(BLUE_PALE)
    c.roundRect(484, 58, 422, 153, 14, fill=1, stroke=0)
    para(c, "<b>Evidence interpretation</b><br/><br/>Paychex vs Paylocity visibly names Align HCM inside the AI Overview. The integration and data conversion captures show the AI Overview plus Align's corresponding organic result. They support the broader historical Semrush record, but they do not independently prove that Align was one of every collapsed source group.", 508, 185, 374, size=9.5, leading=13.2, color=INK_2)
    pill(c, 67, 246, "HISTORICAL JULY 2026", HexColor("#FFF0E8"), ORANGE)
    pill(c, 497, 246, "HISTORICAL JULY 2026", HexColor("#FFF0E8"), ORANGE)
    pill(c, 67, 70, "HISTORICAL JULY 2026", HexColor("#FFF0E8"), ORANGE)
    footer(c, 10, "Historical evidence labeled to avoid implying a permanent result")
    c.showPage()

    # 11. Close
    c.setFillColor(PAPER)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(BLUE_PALE)
    c.circle(895, 500, 180, fill=1, stroke=0)
    c.drawImage(ImageReader(ASSETS / "hrchitect-logo.png"), 55, 456, 250, 45, mask="auto")
    label(c, "Why I sent this", 55, 410, BLUE_DARK, 9)
    para(c, "You followed me.", 55, 382, 740, font="UI-Bold", size=38, leading=43, color=INK)
    para(c, "It sparked an idea.", 55, 339, 740, font="UI-Bold", size=38, leading=43, color=INK)
    para(c, "This is not tied to a job posting. I put it together because the overlap was interesting, the opportunity was real, and it was a useful way to show what I can build with the marketing systems I have spent the past year creating.", 58, 275, 720, size=14, leading=20, color=INK_2)
    c.setFillColor(white)
    c.setStrokeColor(LINE)
    c.roundRect(55, 126, 770, 97, 16, fill=1, stroke=1)
    para(c, "<b>If this is useful, I would be glad to talk through the model.</b><br/>The goal would be simple: protect what HRchitect already owns, build the missing category coverage, and connect search and AI visibility to qualified demand.", 77, 198, 725, size=12.2, leading=17, color=INK)
    add_url(c, "dillon-mohr-portfolio.netlify.app", "https://dillon-mohr-portfolio.netlify.app", 58, 91, 13)
    para(c, "Dillon Mohr | Marketing systems operator", 58, 67, 500, size=10, leading=13, color=MUTED)
    footer(c, 11)
    c.showPage()

    c.save()
    print(OUT)


if __name__ == "__main__":
    build()
