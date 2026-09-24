from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    KeepTogether,
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "BigOrange-Page-Speed-Follow-Up-2026-09-04.pdf"

ORANGE = colors.HexColor("#F47721")
ORANGE_DARK = colors.HexColor("#843400")
INK = colors.HexColor("#18202B")
MUTED = colors.HexColor("#535E6D")
LINE = colors.HexColor("#D8DEE7")
WASH = colors.HexColor("#FFF5EB")
GREEN = colors.HexColor("#245E3D")
RED = colors.HexColor("#8C2E0A")


def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.line(doc.leftMargin, 0.53 * inch, letter[0] - doc.rightMargin, 0.53 * inch)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(doc.leftMargin, 0.34 * inch, "BigOrange Marketing | Page speed follow-up | September 4, 2026")
    canvas.drawRightString(letter[0] - doc.rightMargin, 0.34 * inch, f"{doc.page}")
    canvas.restoreState()


styles = getSampleStyleSheet()
styles.add(
    ParagraphStyle(
        name="TitleBO",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=29,
        leading=32,
        textColor=INK,
        alignment=TA_LEFT,
        spaceAfter=12,
    )
)
styles.add(
    ParagraphStyle(
        name="MetaBO",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=14,
        textColor=MUTED,
        spaceAfter=18,
    )
)
styles.add(
    ParagraphStyle(
        name="HeadingBO",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=17,
        leading=21,
        textColor=INK,
        spaceBefore=17,
        spaceAfter=9,
        keepWithNext=True,
    )
)
styles.add(
    ParagraphStyle(
        name="SubheadingBO",
        parent=styles["Heading3"],
        fontName="Helvetica-Bold",
        fontSize=11.2,
        leading=14,
        textColor=INK,
        spaceAfter=3,
        keepWithNext=True,
    )
)
styles.add(
    ParagraphStyle(
        name="BodyBO",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=10.2,
        leading=15.2,
        textColor=INK,
        spaceAfter=9,
    )
)
styles.add(
    ParagraphStyle(
        name="BodySmallBO",
        parent=styles["BodyBO"],
        fontSize=8.5,
        leading=12.5,
        textColor=MUTED,
    )
)
styles.add(
    ParagraphStyle(
        name="SummaryBO",
        parent=styles["BodyBO"],
        fontSize=11,
        leading=16,
        textColor=INK,
        spaceAfter=0,
    )
)
styles.add(
    ParagraphStyle(
        name="MetricBO",
        parent=styles["BodyBO"],
        fontName="Helvetica-Bold",
        fontSize=19,
        leading=21,
        textColor=INK,
        alignment=TA_RIGHT,
        spaceAfter=1,
    )
)
styles.add(
    ParagraphStyle(
        name="MetricLabelBO",
        parent=styles["BodySmallBO"],
        alignment=TA_RIGHT,
        spaceAfter=0,
    )
)


def p(text, style="BodyBO"):
    return Paragraph(text, styles[style])


def metric_cell(number, label):
    return [p(number, "MetricBO"), p(label, "MetricLabelBO")]


def repair_item(number, title, body):
    return KeepTogether(
        [
            p(f"{number}. {title}", "SubheadingBO"),
            p(body),
            Spacer(1, 3),
        ]
    )


doc = SimpleDocTemplate(
    str(OUTPUT),
    pagesize=letter,
    rightMargin=0.66 * inch,
    leftMargin=0.66 * inch,
    topMargin=0.62 * inch,
    bottomMargin=0.72 * inch,
    title="BigOrange Builder Hub Page Speed Follow-Up",
    author="Dillon Mohr",
    subject="Dated Lighthouse findings and recommended repair sequence",
)

story = []

story.append(Table([["", "BIGORANGE MARKETING"]], colWidths=[0.23 * inch, 6.8 * inch], style=TableStyle([
    ("BACKGROUND", (0, 0), (0, 0), ORANGE),
    ("TEXTCOLOR", (1, 0), (1, 0), ORANGE_DARK),
    ("FONTNAME", (1, 0), (1, 0), "Helvetica-Bold"),
    ("FONTSIZE", (1, 0), (1, 0), 9),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("LEFTPADDING", (0, 0), (0, 0), 0),
    ("RIGHTPADDING", (0, 0), (0, 0), 0),
    ("TOPPADDING", (0, 0), (-1, -1), 5),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ("BOX", (0, 0), (0, 0), 0, ORANGE),
])))
story.append(Spacer(1, 22))
story.append(p("Builder hub page speed<br/>follow-up", "TitleBO"))
story.append(p("Prepared September 4, 2026 &nbsp; | &nbsp; Page reviewed: <font name='Courier'>/marketing-agency-for-builders/</font>", "MetaBO"))

summary = Table(
    [[p("<b>The short version:</b> The August 20 Lighthouse evidence points to a mobile front-end payload and execution problem, not a slow origin server. Desktop was serviceable. Mobile was not. The practical fix is to make the first screen dramatically lighter, delay nonessential forms and tracking, and stop loading page-builder assets the page does not use.", "SummaryBO")]],
    colWidths=[7.05 * inch],
)
summary.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, -1), WASH),
    ("BOX", (0, 0), (-1, -1), 0.75, colors.HexColor("#EFC7AA")),
    ("LEFTPADDING", (0, 0), (-1, -1), 14),
    ("RIGHTPADDING", (0, 0), (-1, -1), 14),
    ("TOPPADDING", (0, 0), (-1, -1), 12),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
]))
story.append(summary)
story.append(p("What the dated lab run measured", "HeadingBO"))

metric_data = [
    [p("Metric", "BodySmallBO"), p("Mobile", "BodySmallBO"), p("Desktop", "BodySmallBO")],
    [p("Performance score"), p("<font color='#8C2E0A'><b>32</b></font>"), p("<font color='#245E3D'><b>75</b></font>")],
    [p("First Contentful Paint"), p("<font color='#8C2E0A'><b>14.2 seconds</b></font>"), p("<font color='#245E3D'><b>1.3 seconds</b></font>")],
    [p("Largest Contentful Paint"), p("<font color='#8C2E0A'><b>36.1 seconds</b></font>"), p("<font color='#245E3D'><b>2.7 seconds</b></font>")],
    [p("Speed Index"), p("<font color='#8C2E0A'><b>14.5 seconds</b></font>"), p("<font color='#245E3D'><b>2.8 seconds</b></font>")],
    [p("Total Blocking Time"), p("<font color='#8C2E0A'><b>1.11 seconds</b></font>"), p("<font color='#245E3D'><b>20 milliseconds</b></font>")],
    [p("SEO score"), p("92"), p("92")],
]
metric_table = Table(metric_data, colWidths=[3.35 * inch, 1.85 * inch, 1.85 * inch], repeatRows=1)
metric_table.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F3F5F8")),
    ("TEXTCOLOR", (0, 0), (-1, 0), MUTED),
    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
    ("GRID", (0, 0), (-1, -1), 0.45, LINE),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 9),
    ("RIGHTPADDING", (0, 0), (-1, -1), 9),
    ("TOPPADDING", (0, 0), (-1, -1), 6),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
]))
story.append(metric_table)
story.append(Spacer(1, 10))
story.append(p("The approximately 40 millisecond root document response was healthy in both runs. That narrows the diagnosis: the origin server was not the primary cause of the slow mobile result."))

story.append(PageBreak())
story.append(p("Where the weight came from", "TitleBO"))
story.append(p("Mobile Lighthouse resource and execution profile from the saved August 20 run.", "MetaBO"))

metrics = Table(
    [
        [metric_cell("7.5 MB", "total transfer"), metric_cell("219", "network requests"), metric_cell("71", "JavaScript files")],
        [metric_cell("4.16 MB", "images"), metric_cell("2.59 MB", "scripts"), metric_cell("2.91 MB", "third party")],
    ],
    colWidths=[2.35 * inch] * 3,
)
metrics.setStyle(TableStyle([
    ("BOX", (0, 0), (-1, -1), 0.6, LINE),
    ("INNERGRID", (0, 0), (-1, -1), 0.6, LINE),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 11),
    ("RIGHTPADDING", (0, 0), (-1, -1), 11),
    ("TOPPADDING", (0, 0), (-1, -1), 11),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
]))
story.append(metrics)
story.append(Spacer(1, 16))
story.append(p("Lighthouse estimated about <b>703 KB of avoidable JavaScript</b> and <b>62 KB of avoidable CSS</b>. The largest image files were roughly 0.8 MB to 1.2 MB each."))
story.append(p("The page also loaded HubSpot forms and meetings code, reCAPTCHA, several Google analytics and advertising libraries, Beaver Builder and PowerPack assets, multiple font families, and a Font Awesome file that returned a 404."))
story.append(p("Primary diagnosis", "HeadingBO"))
diagnosis_data = [
    [p("Images", "SubheadingBO"), p("Oversized hero and content imagery dominated transfer size. The dated trace appeared to request both an original PNG and a WebP derivative.")],
    [p("Scripts", "SubheadingBO"), p("Third party conversion and measurement tools added execution work before a visitor interacted with them.")],
    [p("Builder assets", "SubheadingBO"), p("Page builder, carousel, popup, icon, and layout assets were present even where their associated component appeared unused.")],
    [p("Server", "SubheadingBO"), p("The root document arrived in roughly 40 milliseconds. Server response was healthy in this lab evidence.")],
]
diagnosis_table = Table(diagnosis_data, colWidths=[1.35 * inch, 5.7 * inch])
diagnosis_table.setStyle(TableStyle([
    ("LINEBELOW", (0, 0), (-1, -2), 0.5, LINE),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 7),
    ("RIGHTPADDING", (0, 0), (-1, -1), 7),
    ("TOPPADDING", (0, 0), (-1, -1), 7),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
]))
story.append(diagnosis_table)

story.append(PageBreak())
story.append(p("Recommended repair order", "TitleBO"))
story.append(p("Sequence matters: make the first screen light, then remove avoidable execution, then remeasure consistently.", "MetaBO"))
story.extend([
    repair_item(1, "Make the first screen light and deterministic", "Choose one correctly sized hero image, serve responsive modern formats, give it explicit dimensions, and preload only the asset the browser will actually paint."),
    repair_item(2, "Delay forms, meetings, and reCAPTCHA until intent", "Load HubSpot form or meeting dependencies when the form is near the viewport or after the visitor chooses to interact. The first screen should not pay for conversion tools that are not yet visible."),
    repair_item(3, "Reconcile analytics and advertising tags", "Audit the active GTM, Google Analytics, and Google Ads loads so the same job is not performed by overlapping containers or direct tags. Preserve required measurement, remove duplication, and fire noncritical tags later."),
    repair_item(4, "Unload unused page-builder assets", "Conditionally remove Beaver Builder, PowerPack, carousel, Swiper, Magnific Popup, icon, and layout assets when the page does not use those components."),
    repair_item(5, "Reduce font work and fix the failed font request", "Keep only the weights used above the fold, use a sensible fallback stack, apply font display behavior, and repair or remove the Font Awesome request that returned 404."),
    repair_item(6, "Rebuild, then measure the same way", "Run at least three mobile and three desktop lab tests after the approved repair, use the median result, and compare field Core Web Vitals separately when enough traffic data is available."),
])

story.append(PageBreak())
story.append(p("What this means for search", "TitleBO"))
story.append(p("A useful diagnostic, not a ranking promise.", "MetaBO"))
story.append(p("Page experience can matter, but a Lighthouse score is not a direct ranking promise. The right goal is a page that loads quickly enough for real visitors, preserves the measurement and conversion functions the team needs, and still carries the strongest answer, proof, internal links, and editorial quality."))
story.append(Spacer(1, 10))

boundary = Table(
    [[p("<b>Evidence boundary</b><br/><br/>These numbers come from saved Lighthouse lab reports captured August 20, 2026. They should be rechecked on the live page before remediation and measured again after the approved changes.<br/><br/><b>No live site changes are claimed in this brief.</b>", "SummaryBO")]],
    colWidths=[7.05 * inch],
)
boundary.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, -1), WASH),
    ("BOX", (0, 0), (-1, -1), 0.75, colors.HexColor("#EFC7AA")),
    ("LEFTPADDING", (0, 0), (-1, -1), 16),
    ("RIGHTPADDING", (0, 0), (-1, -1), 16),
    ("TOPPADDING", (0, 0), (-1, -1), 16),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 16),
]))
story.append(boundary)
story.append(Spacer(1, 24))
story.append(p("Recommended validation after implementation", "HeadingBO"))
validation = [
    "Run three mobile and three desktop Lighthouse tests under the same conditions and report the median.",
    "Confirm the actual Largest Contentful Paint element and the exact request that serves it.",
    "Validate required form, meeting, analytics, and advertising events after deferring or removing assets.",
    "Review Search Console field Core Web Vitals separately when enough live traffic data exists.",
]
story.append(ListFlowable([ListItem(p(item), leftIndent=16) for item in validation], bulletType="bullet", leftIndent=18, bulletColor=ORANGE_DARK))

doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(OUTPUT)
