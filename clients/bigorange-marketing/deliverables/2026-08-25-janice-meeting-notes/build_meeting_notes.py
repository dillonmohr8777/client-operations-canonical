from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    Image,
    KeepTogether,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


HERE = Path(__file__).resolve().parent
LOGO = HERE.parent / "2026-08-23-bigorange-homepage-trio" / "orange-press" / "assets" / "bigorange-logo-orange.png"
OUT = HERE / "BigOrange-Janice-Working-Session-Notes-2026-08-25.pdf"

ORANGE = colors.HexColor("#F47721")
DARK = colors.HexColor("#202124")
MUTED = colors.HexColor("#5F6368")
CREAM = colors.HexColor("#FFF7F0")
PALE = colors.HexColor("#F6F2EC")
LINE = colors.HexColor("#E9D8C8")


styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="Kicker", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=8.5, leading=11, textColor=ORANGE, spaceAfter=6))
styles.add(ParagraphStyle(name="TitleBO", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=24, leading=27, textColor=DARK, alignment=TA_LEFT, spaceAfter=8))
styles.add(ParagraphStyle(name="SubBO", parent=styles["Normal"], fontName="Helvetica", fontSize=10.5, leading=15, textColor=MUTED, spaceAfter=12))
styles.add(ParagraphStyle(name="H1BO", parent=styles["Heading1"], fontName="Helvetica-Bold", fontSize=15, leading=19, textColor=DARK, spaceBefore=5, spaceAfter=8))
styles.add(ParagraphStyle(name="H2BO", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=11, leading=14, textColor=DARK, spaceBefore=4, spaceAfter=4))
styles.add(ParagraphStyle(name="BodyBO", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.4, leading=13.2, textColor=DARK, spaceAfter=6))
styles.add(ParagraphStyle(name="BulletBO", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.2, leading=12.7, textColor=DARK, leftIndent=13, firstLineIndent=-8, bulletIndent=0, spaceAfter=4))
styles.add(ParagraphStyle(name="SmallBO", parent=styles["BodyText"], fontName="Helvetica", fontSize=8, leading=10.8, textColor=MUTED, spaceAfter=3))
styles.add(ParagraphStyle(name="CalloutBO", parent=styles["BodyText"], fontName="Helvetica-Bold", fontSize=10.2, leading=14.2, textColor=DARK, spaceAfter=0))
styles.add(ParagraphStyle(name="TableHeadBO", parent=styles["BodyText"], fontName="Helvetica-Bold", fontSize=8.2, leading=10, textColor=colors.white, spaceAfter=0))


def bullet(text):
    return Paragraph("• " + text, styles["BulletBO"])


def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.line(0.65 * inch, 0.52 * inch, 7.85 * inch, 0.52 * inch)
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(0.65 * inch, 0.34 * inch, "BigOrange Marketing | Janice working session | August 25, 2026")
    canvas.drawRightString(7.85 * inch, 0.34 * inch, f"{doc.page}")
    canvas.restoreState()


doc = BaseDocTemplate(
    str(OUT),
    pagesize=letter,
    rightMargin=0.65 * inch,
    leftMargin=0.65 * inch,
    topMargin=0.55 * inch,
    bottomMargin=0.68 * inch,
    title="BigOrange Janice Working Session Notes",
    author="Dillon Mohr",
    subject="Custom Home Builder Marketing authority hub working session",
)
frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="normal")
doc.addPageTemplates([PageTemplate(id="all", frames=[frame], onPage=footer)])

story = []
story.append(Image(str(LOGO), width=3.35 * inch, height=1.13 * inch))
story.append(Spacer(1, 0.08 * inch))
story.append(Paragraph("WORKING SESSION • 11:30 AM TO 12:00 PM", styles["Kicker"]))
story.append(Paragraph("Custom Home Builder Marketing Authority Hub", styles["TitleBO"]))
story.append(Paragraph("Prepared for Janice Weiser • August 25, 2026", styles["SubBO"]))

callout = Table([[Paragraph("Outcome for today: capture Janice's real builder marketing expertise, choose the strongest page direction, and leave with the factual decisions needed to finish one publication candidate.", styles["CalloutBO"])]], colWidths=[doc.width])
callout.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, -1), CREAM),
    ("BOX", (0, 0), (-1, -1), 1, ORANGE),
    ("LEFTPADDING", (0, 0), (-1, -1), 14),
    ("RIGHTPADDING", (0, 0), (-1, -1), 14),
    ("TOPPADDING", (0, 0), (-1, -1), 12),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
]))
story.append(callout)
story.append(Spacer(1, 0.12 * inch))

story.append(Paragraph("What is already complete", styles["H1BO"]))
for text in [
    "Research and technical review, competitor analysis, keyword reconciliation, content architecture, and internal linking plan.",
    "A complete authority pillar, two supporting article drafts, FAQ structure, calls to action, buyer journey, and conversion paths.",
    "Two private WordPress page directions. The current public builder page has not been replaced or published over.",
    "Desktop and mobile QA covering responsive layouts, overflow, images, interactions, keyboard focus, reduced motion, and browser console behavior.",
]:
    story.append(bullet(text))

story.append(Paragraph("The two review directions", styles["H1BO"]))
directions = [
    [Paragraph("Cinematic Authority", styles["H2BO"]), Paragraph("Premium editorial storytelling, architectural imagery, layered proof, and a clear consultation path.<br/><font color='#B94800'><b>Private preview:</b></font> bigorange.marketing/?page_id=5546&amp;preview=true", styles["BodyBO"])],
    [Paragraph("Orange Press", styles["H2BO"]), Paragraph("Bolder BigOrange energy, press inspired layouts, interactive content moments, and the resolved particle logo treatment.<br/><font color='#B94800'><b>Private preview:</b></font> bigorange.marketing/?page_id=5585&amp;preview=true", styles["BodyBO"])],
]
t = Table(directions, colWidths=[1.55 * inch, doc.width - 1.55 * inch])
t.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, -1), PALE),
    ("GRID", (0, 0), (-1, -1), 0.5, LINE),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 10),
    ("RIGHTPADDING", (0, 0), (-1, -1), 10),
    ("TOPPADDING", (0, 0), (-1, -1), 8),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
]))
story.append(t)

story.append(Paragraph("30 minute decision agenda", styles["H1BO"]))
agenda = [
    ("11:30 to 11:34", "Fit and audience", "Who is the ideal builder, what is happening when they seek help, and what should this page promise them?"),
    ("11:34 to 11:41", "Buyer trust and positioning", "What makes a homeowner trust a builder, what proof matters, and where builder positioning becomes interchangeable?"),
    ("11:41 to 11:48", "Website, content, and discovery", "What must the site prove, which questions deserve public answers, and what should search and AI systems understand?"),
    ("11:48 to 11:54", "Lead quality and measurement", "What counts as a qualified lead, what can marketing own, and what does a healthy first 90 days look like?"),
    ("11:54 to 12:00", "Page direction and approvals", "Choose Cinematic Authority, Orange Press, or a deliberate combination. Confirm usable stories, FAQs, photography, and next review."),
]
rows = [[Paragraph("TIME", styles["TableHeadBO"]), Paragraph("FOCUS", styles["TableHeadBO"]), Paragraph("DECISION", styles["TableHeadBO"])]]
for tm, focus, decision in agenda:
    rows.append([Paragraph(tm, styles["SmallBO"]), Paragraph(f"<b>{focus}</b>", styles["BodyBO"]), Paragraph(decision, styles["BodyBO"])])
tbl = Table(rows, colWidths=[1.05 * inch, 1.55 * inch, doc.width - 2.60 * inch], repeatRows=1)
tbl.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), ORANGE),
    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
    ("GRID", (0, 0), (-1, -1), 0.5, LINE),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 7),
    ("RIGHTPADDING", (0, 0), (-1, -1), 7),
    ("TOPPADDING", (0, 0), (-1, -1), 6),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
]))
story.append(tbl)

story.append(Spacer(1, 0.18 * inch))
story.append(Paragraph("Priority questions for Janice", styles["H1BO"]))
question_groups = [
    ("1. Audience and stakes", [
        "Which kind of custom home builder is the best fit for this guidance?",
        "What is usually happening in the business when a builder starts looking for marketing help?",
        "What do builders misunderstand about the time between marketing activity and a qualified project?",
    ]),
    ("2. Buyer trust and differentiation", [
        "What makes a prospective homeowner trust one builder enough to make contact?",
        "Which proof matters most before a consultation: projects, process, people, reviews, pricing guidance, or something else?",
        "What makes builder positioning sound interchangeable, and how do you uncover the real difference?",
        "When do referrals stop being a sufficient growth system?",
    ]),
    ("3. Website and content", [
        "What must a builder website prove above the fold?",
        "Which project details and photography are most persuasive?",
        "What pages or answers are almost always missing?",
        "Which homeowner questions deserve a direct public answer?",
    ]),
    ("4. Search, local, and AI discovery", [
        "How do builders describe their markets and project types in real conversations?",
        "What local proof is both honest and useful?",
        "What should an AI answer engine understand about a BigOrange builder client?",
        "Which category claims should we avoid because the truth is more nuanced?",
    ]),
    ("5. Lead quality and measurement", [
        "What should count as a qualified builder lead?",
        "What can marketing own, and what still depends on sales follow up?",
        "Which leading indicators matter before closed project data is available?",
        "What does a healthy 90 day start look like?",
    ]),
]
for title, qs in question_groups:
    block = [Paragraph(title, styles["H2BO"])] + [bullet(q) for q in qs]
    story.append(KeepTogether(block))

story.append(Spacer(1, 0.08 * inch))
story.append(Paragraph("Stories, proof, and permission", styles["H1BO"]))
for text in [
    "One anonymizable builder example that shows a real starting problem, the work BigOrange did, and the type of change observed without overstating outcomes.",
    "One common failure pattern that builders repeat before asking for help.",
    "One sales objection that deserves a plain English answer on the page.",
    "For every usable example: confirm whether it may be quoted, paraphrased, anonymized, kept internal, or excluded.",
    "Identify any statement that requires client approval or a separate source before publication.",
]:
    story.append(bullet(text))

story.append(Paragraph("Page direction decisions", styles["H1BO"]))
decisions = [
    ["Decision", "Options / notes"],
    ["Overall direction", "Cinematic Authority / Orange Press / deliberate combination"],
    ["Tone", "Premium editorial / bold BigOrange / warmer and simpler"],
    ["Hero promise", "Approve, revise, or replace the current promise"],
    ["Proof", "Stories, examples, client approvals, and missing evidence"],
    ["Photography", "Approved project photography available / illustrative imagery remains provisional"],
    ["FAQ", "Select five to eight questions and note where answers need nuance"],
    ["Consultation path", "Best call to action and what should happen after a click"],
]
dt = Table([[Paragraph(f"<b>{a}</b>" if i else a, styles["BodyBO"]), Paragraph(b, styles["BodyBO"])] for i, (a, b) in enumerate(decisions)], colWidths=[1.55 * inch, doc.width - 1.55 * inch])
dt.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), ORANGE),
    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
    ("GRID", (0, 0), (-1, -1), 0.5, LINE),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ("TOPPADDING", (0, 0), (-1, -1), 6),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
]))
story.append(dt)

story.append(Spacer(1, 0.18 * inch))
story.append(Paragraph("Required closeout before noon", styles["H1BO"]))
for text in [
    "Confirm or revise the page promise and the five operating stages.",
    "Choose the visual direction and identify any elements to combine.",
    "Approve at least one source safe example or clearly mark the proof gap.",
    "Approve five to eight FAQ topics and the preferred consultation call to action.",
    "Confirm photography availability and any client permission needed.",
    "Agree on who reviews the revised publication candidate and when.",
]:
    story.append(bullet(text))

story.append(Paragraph("What happens immediately after the session", styles["H1BO"]))
for text in [
    "Reconcile Janice's factual edits and approved language across the pillar, FAQs, calls to action, and supporting articles.",
    "Combine the selected visual and interaction choices into one final publication candidate.",
    "Replace provisional imagery where approved project photography is available.",
    "Apply and validate metadata, schema, canonical settings, internal links, and required WordPress configuration.",
    "Run final desktop, mobile, accessibility, performance, and browser checks.",
    "Return the exact final page for approval before publication.",
]:
    story.append(bullet(text))

note = Table([[Paragraph("Current publication state: private review only. The public Custom Home Builder Marketing page remains unchanged.", styles["CalloutBO"])]], colWidths=[doc.width])
note.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, -1), CREAM),
    ("BOX", (0, 0), (-1, -1), 1, ORANGE),
    ("LEFTPADDING", (0, 0), (-1, -1), 14),
    ("RIGHTPADDING", (0, 0), (-1, -1), 14),
    ("TOPPADDING", (0, 0), (-1, -1), 10),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
]))
story.append(Spacer(1, 0.1 * inch))
story.append(note)

doc.build(story)
print(OUT)
