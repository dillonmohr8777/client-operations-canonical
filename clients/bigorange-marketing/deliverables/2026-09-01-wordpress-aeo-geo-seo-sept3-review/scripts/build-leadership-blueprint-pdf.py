from __future__ import annotations

import csv
import json
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.platypus import (
    HRFlowable,
    KeepTogether,
    LongTable,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


HERE = Path(__file__).resolve()
SEPT_PACKAGE = HERE.parents[1]
CLIENT_DELIVERABLES = SEPT_PACKAGE.parent
CONTENT_PACKAGE = CLIENT_DELIVERABLES / "2026-08-28-content-authority-proposal"
OUTPUT_DIR = SEPT_PACKAGE / "output" / "pdf"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_PDF = OUTPUT_DIR / "BigOrange-WordPress-Growth-and-Content-Blueprint-2026-09-01.pdf"

ORANGE = colors.HexColor("#F47721")
ORANGE_DARK = colors.HexColor("#B94800")
INK = colors.HexColor("#202124")
SLATE = colors.HexColor("#53606D")
MUTED = colors.HexColor("#74808B")
PAPER = colors.HexColor("#FFF9F4")
CREAM = colors.HexColor("#F5EFE8")
BLUE = colors.HexColor("#075CA8")
LIGHT_BLUE = colors.HexColor("#EDF5FC")
GREEN = colors.HexColor("#16784A")
WHITE = colors.white
RULE = colors.HexColor("#D9D3CC")


def register_fonts() -> tuple[str, str]:
    candidates = [
        (Path("C:/Windows/Fonts/aptos.ttf"), Path("C:/Windows/Fonts/aptos-bold.ttf")),
        (Path("C:/Windows/Fonts/arial.ttf"), Path("C:/Windows/Fonts/arialbd.ttf")),
    ]
    for regular, bold in candidates:
        if regular.exists() and bold.exists():
            pdfmetrics.registerFont(TTFont("BOMRegular", str(regular)))
            pdfmetrics.registerFont(TTFont("BOMBold", str(bold)))
            return "BOMRegular", "BOMBold"
    return "Helvetica", "Helvetica-Bold"


FONT, FONT_BOLD = register_fonts()


def pstyle(name: str, **kwargs) -> ParagraphStyle:
    defaults = dict(fontName=FONT, textColor=INK, fontSize=9.2, leading=13)
    defaults.update(kwargs)
    return ParagraphStyle(name, **defaults)


styles = {
    "body": pstyle("body", spaceAfter=7),
    "small": pstyle("small", fontSize=7.8, leading=10.5, textColor=SLATE),
    "tiny": pstyle("tiny", fontSize=6.8, leading=8.8, textColor=SLATE),
    "eyebrow": pstyle(
        "eyebrow", fontName=FONT_BOLD, fontSize=8, leading=10, textColor=ORANGE_DARK,
        spaceAfter=6, uppercase=True,
    ),
    "h1": pstyle(
        "h1", fontName=FONT_BOLD, fontSize=27, leading=30, textColor=INK,
        spaceAfter=12,
    ),
    "h2": pstyle(
        "h2", fontName=FONT_BOLD, fontSize=16, leading=20, textColor=INK,
        spaceBefore=7, spaceAfter=8,
    ),
    "h3": pstyle(
        "h3", fontName=FONT_BOLD, fontSize=11.5, leading=14, textColor=ORANGE_DARK,
        spaceBefore=5, spaceAfter=5,
    ),
    "callout": pstyle("callout", fontSize=10.4, leading=15, textColor=INK),
    "table": pstyle("table", fontSize=7.2, leading=9.3),
    "table_bold": pstyle("table_bold", fontName=FONT_BOLD, fontSize=7.2, leading=9.3),
    "table_white": pstyle("table_white", fontName=FONT_BOLD, fontSize=7.2, leading=9.3, textColor=WHITE),
    "kpi": pstyle("kpi", fontName=FONT_BOLD, fontSize=19, leading=21, textColor=ORANGE_DARK, alignment=TA_CENTER),
    "kpi_label": pstyle("kpi_label", fontSize=7.2, leading=9, textColor=SLATE, alignment=TA_CENTER),
    "cover_sub": pstyle("cover_sub", fontSize=12.5, leading=18, textColor=SLATE),
}


def para(text: str, style: str = "body") -> Paragraph:
    return Paragraph(text, styles[style])


def bullet(text: str, level: int = 0) -> Paragraph:
    return Paragraph(
        text,
        pstyle(
            f"bullet-{level}",
            leftIndent=12 + 11 * level,
            firstLineIndent=-7,
            bulletIndent=4 + 11 * level,
            bulletFontName=FONT_BOLD,
            bulletFontSize=7,
            spaceAfter=4,
        ),
        bulletText="•",
    )


def section_header(title: str, kicker: str | None = None):
    items = []
    if kicker:
        items.append(para(kicker.upper(), "eyebrow"))
    items.append(para(title, "h2"))
    items.append(HRFlowable(width="100%", thickness=1.2, color=ORANGE, spaceAfter=10))
    return items


def callout(title: str, body: str, background=PAPER, border=ORANGE):
    content = [
        Paragraph(title, pstyle("callout-title", fontName=FONT_BOLD, fontSize=11, leading=14, textColor=INK, spaceAfter=4)),
        Paragraph(body, styles["callout"]),
    ]
    table = Table([[content]], colWidths=[6.9 * inch])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), background),
        ("BOX", (0, 0), (-1, -1), 0.8, border),
        ("LINEBEFORE", (0, 0), (0, -1), 4, border),
        ("LEFTPADDING", (0, 0), (-1, -1), 15),
        ("RIGHTPADDING", (0, 0), (-1, -1), 15),
        ("TOPPADDING", (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
    ]))
    return table


def kpi_table(items: list[tuple[str, str]]):
    cells = [[para(value, "kpi"), para(label, "kpi_label")] for value, label in items]
    # Transpose to create one value row and one label row.
    data = [[c[0] for c in cells], [c[1] for c in cells]]
    table = Table(data, colWidths=[6.9 * inch / len(items)] * len(items))
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PAPER),
        ("BOX", (0, 0), (-1, -1), 0.7, RULE),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, RULE),
        ("TOPPADDING", (0, 0), (-1, 0), 10),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 2),
        ("TOPPADDING", (0, 1), (-1, 1), 2),
        ("BOTTOMPADDING", (0, 1), (-1, 1), 9),
    ]))
    return table


def load_assets():
    qa_path = CONTENT_PACKAGE / "release" / "qa" / "content-system-qa.json"
    manifest_path = CONTENT_PACKAGE / "release" / "publication-manifest.csv"
    qa = json.loads(qa_path.read_text(encoding="utf-8"))
    by_id = {row["asset_id"]: row for row in qa["assets"]}
    with manifest_path.open("r", encoding="utf-8-sig", newline="") as handle:
        manifest = list(csv.DictReader(handle))
    for row in manifest:
        row["words"] = int(by_id[row["asset_id"]]["words"])
    return qa, manifest


def footer(canvas, doc):
    canvas.saveState()
    width, height = letter
    canvas.setStrokeColor(RULE)
    canvas.setLineWidth(0.5)
    canvas.line(0.62 * inch, 0.52 * inch, width - 0.62 * inch, 0.52 * inch)
    canvas.setFont(FONT, 7)
    canvas.setFillColor(MUTED)
    canvas.drawString(0.62 * inch, 0.33 * inch, "BigOrange WordPress Growth and Content Blueprint | Private leadership review")
    canvas.drawRightString(width - 0.62 * inch, 0.33 * inch, f"{doc.page}")
    canvas.restoreState()


def cover(canvas, doc):
    canvas.saveState()
    width, height = letter
    canvas.setFillColor(PAPER)
    canvas.rect(0, 0, width, height, fill=1, stroke=0)
    canvas.setFillColor(ORANGE)
    canvas.rect(0, height - 1.1 * inch, width, 1.1 * inch, fill=1, stroke=0)
    canvas.setFillColor(ORANGE_DARK)
    canvas.circle(width - 0.8 * inch, height - 0.55 * inch, 0.22 * inch, fill=1, stroke=0)
    canvas.setFont(FONT_BOLD, 13)
    canvas.setFillColor(WHITE)
    canvas.drawString(0.62 * inch, height - 0.69 * inch, "BIGORANGE MARKETING")
    canvas.setFont(FONT, 8.5)
    canvas.drawRightString(width - 1.15 * inch, height - 0.67 * inch, "SEPTEMBER 3 LEADERSHIP REVIEW")
    canvas.restoreState()


def build_pdf():
    qa, assets = load_assets()
    total_words = sum(row["words"] for row in assets)
    output = str(OUTPUT_PDF)
    doc = SimpleDocTemplate(
        output,
        pagesize=letter,
        rightMargin=0.62 * inch,
        leftMargin=0.62 * inch,
        topMargin=0.7 * inch,
        bottomMargin=0.68 * inch,
        title="BigOrange WordPress Growth and Content Blueprint",
        author="Dillon Mohr",
        subject="Consolidated paid pilot, WordPress, content production, and sitewide SEO/AEO/GEO recommendations",
    )

    story = []
    story.append(Spacer(1, 1.22 * inch))
    story.append(para("PRIVATE LEADERSHIP REVIEW", "eyebrow"))
    story.append(para("BigOrange WordPress Growth and Content Blueprint", "h1"))
    story.append(para(
        "One consolidated view of the approved paid pilot, the completed no-charge production extension, the live WordPress review set, exact content lengths, and the sitewide SEO, AEO, GEO, and conversion roadmap.",
        "cover_sub",
    ))
    story.append(Spacer(1, 0.18 * inch))
    story.append(kpi_table([
        ("19", "complete local review assets"),
        (f"{total_words:,}", "words across the content system"),
        ("370", "published WordPress URLs scored"),
        ("39", "priority URLs with full write-ups"),
    ]))
    story.append(Spacer(1, 0.25 * inch))
    story.append(callout(
        "What I added on my own time",
        "The approved pilot remains 35 hours at $30 per hour, or $1,050. I completed 16 additional full content assets, the 370-URL site playbook, and the answer-ready article upgrades without increasing the approved fee. I wanted the team to see how invested I am in BigOrange, how much I want to help build this system, and how seriously I take the opportunity to do this work for your clients.",
        background=LIGHT_BLUE,
        border=BLUE,
    ))
    story.append(Spacer(1, 0.22 * inch))
    story.append(para("Prepared for Margee, Paula, Emelia, and Janice", "h3"))
    story.append(para("Prepared September 1, 2026 | Review target September 3, 2026", "small"))
    story.append(PageBreak())

    story.extend(section_header("Executive readout", "What leadership can decide now"))
    story.append(para(
        "The original brief asked for a repeatable authority-hub system built from real subject-matter expertise. The paid proof of concept is complete at the review level: strategy, research, architecture, one pillar, two supporting articles, two private visual directions, technical guidance, roadmaps, workflow documentation, and presentation materials.",
    ))
    story.append(para(
        "The extension shows how that pilot becomes an operating product. The release now contains 19 complete content assets, 19 WordPress-ready HTML fragments, 19 schema candidates, 66 internal-link relationships, a 39-URL deep matrix, and a recommendation ledger for all 370 published WordPress URLs.",
    ))
    story.append(callout(
        "Current state",
        "Everything described as complete is a local or private review artifact. The public builder hub at post 1381 remains unchanged. Nothing in this package is represented as published, indexed, or producing outcomes.",
    ))
    story.append(Spacer(1, 0.14 * inch))
    story.append(para("The four decisions that unlock the next step", "h3"))
    for text in [
        "Choose Orange Press, Cinematic Authority, or a tightly bounded combination.",
        "Approve Janice-derived language, the qualified-lead definition, and permitted project proof.",
        "Confirm the production URL sequence, imagery, implementation owner, and release approvers.",
        "Decide whether BigOrange wants to productize this same page-by-page contract for MSP, StoryBrand, manufacturing, landscaping, electrical, and other client verticals.",
    ]:
        story.append(bullet(text))
    story.append(Spacer(1, 0.15 * inch))
    story.append(para("Commercial truth", "h3"))
    commercial = Table([
        [para("Approved effort", "table_bold"), para("35 hours", "table")],
        [para("Approved rate", "table_bold"), para("$30 per hour", "table")],
        [para("Approved total", "table_bold"), para("$1,050", "table")],
        [para("No-charge extension", "table_bold"), para("16 additional full content assets plus the sitewide playbook and review upgrades", "table")],
        [para("Still needed", "table_bold"), para("Invoice recipient, billing details, payment method, due date, acceptance and revision mechanics", "table")],
    ], colWidths=[1.55 * inch, 5.35 * inch])
    commercial.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), CREAM),
        ("GRID", (0, 0), (-1, -1), 0.5, RULE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    story.append(commercial)
    story.append(PageBreak())

    story.extend(section_header("Paid pilot deliverables", "Exact approved scope"))
    paid_groups = [
        ("Discovery and strategy", [
            "Current website and technical SEO audit, including architecture, internal links, Core Web Vitals, content gaps, and AI-search readiness.",
            "Competitor and professional keyword research with intent, priority, and inclusion or rejection rationale.",
            "Complete content calendar and authority-hub architecture with URLs, internal links, FAQs, resources, case-study direction, and downloadable opportunities.",
            "Google search and AI-answer strategy for Google AI Overviews, ChatGPT, Claude, Gemini, and Perplexity.",
            "90-day implementation plan, realistic milestones, expected SEO timeline, and a bonus 12-month authority roadmap.",
        ]),
        ("Working proof of concept", [
            "One complete Custom Home Builder Marketing authority pillar with headings, internal links, FAQs, schema, calls to action, and metadata.",
            "Two complete supporting articles demonstrating topic clustering, internal linking, search intent, and answer-ready optimization.",
            "WordPress implementation guidance for schema, sitemap, metadata, canonicals, breadcrumbs, speed, maintenance, and marketer editability.",
            "Two private design directions in WordPress: Cinematic Authority and Orange Press.",
        ]),
        ("SME and operating workflow", [
            "Janice interview workflow that turns one hour of expert time into months of content while keeping factual and public-use approval human-owned.",
            "Documented research, drafting, editing, fact-checking, QA, WordPress, and publication process.",
            "45-60 minute final presentation covering architecture, SEO, AI search, scale, improvements, and timing.",
        ]),
    ]
    for title, items in paid_groups:
        story.append(para(title, "h3"))
        for item in items:
            story.append(bullet(item))
    story.append(Spacer(1, 0.1 * inch))
    story.append(callout(
        "Phase 2 items mapped, not claimed as paid production",
        "Social posts, a broader downloadable guide, video, and webinar production were named as Phase 2. The architecture can support them, but this blueprint does not misstate those production items as completed paid scope.",
        background=CREAM,
        border=ORANGE_DARK,
    ))
    story.append(PageBreak())

    story.extend(section_header("What exists in WordPress today", "Private review set"))
    wp_rows = [
        [para("Item", "table_white"), para("ID", "table_white"), para("State", "table_white"), para("Leadership job", "table_white")],
        [para("Orange Press pillar direction", "table_bold"), para("Page 5585", "table"), para("Private", "table"), para("Evaluate the bolder BigOrange visual and interaction system", "table")],
        [para("Cinematic Authority pillar direction", "table_bold"), para("Page 5546", "table"), para("Private", "table"), para("Evaluate the premium editorial and architectural direction", "table")],
        [para("What a Custom Home Builder Website Must Include", "table_bold"), para("Post 5550", "table"), para("Private", "table"), para("Review the current must-include reader job and six answer-ready FAQs", "table")],
        [para("Five Articles Every Custom Home Builder Blog Needs", "table_bold"), para("Post 5552", "table"), para("Private", "table"), para("Review the starter editorial framework and six answer-ready FAQs", "table")],
        [para("Current Custom Home Builder Marketing hub", "table_bold"), para("Post 1381", "table"), para("Public and unchanged", "table"), para("Protect the existing ranking URL until the exact replacement is approved", "table")],
    ]
    wp_table = LongTable(wp_rows, colWidths=[2.3 * inch, 0.82 * inch, 1.12 * inch, 2.66 * inch], repeatRows=1)
    wp_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), INK),
        ("GRID", (0, 0), (-1, -1), 0.45, RULE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, PAPER]),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    story.append(wp_table)
    story.append(Spacer(1, 0.15 * inch))
    story.append(para("The two upgraded supporting articles now include", "h3"))
    for item in [
        "A direct-answer block in the opening section.",
        "A standalone definition box and decision table.",
        "Six visible FAQ pairs with matching FAQPage candidate markup.",
        "Live internal links only, review-state labeling, and no unapproved Homearama claim.",
        "Exact private-state installation instructions and rollback references.",
    ]:
        story.append(bullet(item))
    story.append(PageBreak())

    story.extend(section_header("The complete 19-asset authority system", "Exact titles and lengths"))
    story.append(para(
        f"The full release contains {len(assets)} owned URL assets and {total_words:,} words. Each asset has a complete editable source draft, WordPress-ready HTML, a schema candidate, metadata, CTA, internal-link assignments, and an explicit approval gate. Automated content QA passed all 19 assets with zero errors and zero warnings.",
    ))
    story.append(callout(
        "Blog scope clarified",
        "The approved proof of concept requires two supporting articles. The StoryBrand example in the original packet describes a larger model of one pillar, three sub-pillars, and nine blogs. My extension brings the system to 19 complete URL owners, but 17 are recommended as evergreen page-type assets and two are post-type articles. I recommend adding the nine-blog editorial cadence after leadership approves the core architecture, rather than mislabeling service and resource pages as blogs.",
        background=LIGHT_BLUE,
        border=BLUE,
    ))
    story.append(Spacer(1, 0.14 * inch))

    asset_header = [
        para("ID", "table_white"),
        para("Asset title", "table_white"),
        para("Type", "table_white"),
        para("Words", "table_white"),
        para("Proposed URL", "table_white"),
    ]
    asset_rows = [asset_header]
    for row in assets:
        asset_rows.append([
            para(row["asset_id"], "table_bold"),
            para(row["title"], "table"),
            para(row["suggested_wordpress_type"].title(), "table"),
            para(f"{row['words']:,}", "table"),
            para(row["slug"], "tiny"),
        ])
    asset_table_style = TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), ORANGE_DARK),
        ("GRID", (0, 0), (-1, -1), 0.4, RULE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, PAPER]),
        ("ALIGN", (2, 1), (3, -1), "CENTER"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ])
    first_asset_rows = [asset_rows[0]] + asset_rows[1:10]
    second_asset_header = [
        para("ID", "table_white"),
        para("Asset title", "table_white"),
        para("Type", "table_white"),
        para("Words", "table_white"),
        para("Proposed URL", "table_white"),
    ]
    second_asset_rows = [second_asset_header] + asset_rows[10:]
    first_asset_table = LongTable(first_asset_rows, colWidths=[0.55 * inch, 3.15 * inch, 0.55 * inch, 0.55 * inch, 2.1 * inch], repeatRows=1)
    first_asset_table.setStyle(asset_table_style)
    story.append(first_asset_table)
    story.append(PageBreak())
    second_asset_table = LongTable(second_asset_rows, colWidths=[0.55 * inch, 3.15 * inch, 0.55 * inch, 0.55 * inch, 2.1 * inch], repeatRows=1)
    second_asset_table.setStyle(asset_table_style)
    story.append(second_asset_table)
    story.append(PageBreak())

    story.extend(section_header("Live site and ranking evidence", "Current evidence, dated correctly"))
    story.append(kpi_table([
        ("370", "published URLs"),
        ("349", "sitemap URLs"),
        ("171", "Moz snapshot keywords"),
        ("27", "keywords in positions 1-3"),
    ]))
    story.append(Spacer(1, 0.16 * inch))
    story.append(para(
        "The public site crawl was captured September 1, 2026. The ranking evidence comes from Emelia's August 14, 2026 Moz snapshot and is not presented as live current rank data.",
        "small",
    ))
    story.append(para("Builder lane", "h3"))
    for item in [
        "21 tracked builder terms: 17 ranked and 4 unranked.",
        "13 builder terms in positions 1-3, 1 term in positions 4-10, and 3 terms in positions 11-20.",
        "Every ranked builder term in that snapshot points to /marketing-agency-for-builders/.",
        "Eight additional live builder satellite URLs own zero tracked builder keywords in the snapshot, which supports a stronger hub-and-spoke architecture.",
    ]:
        story.append(bullet(item))
    story.append(para("Rest-of-site lane", "h3"))
    for item in [
        "150 tracked terms across MSP, StoryBrand, manufacturing, inbound, and Cincinnati topics.",
        "61 ranked and 89 unranked terms across 27 ranking URLs.",
        "14 terms in positions 1-3, 27 in positions 4-10, and 20 in positions 11-20.",
        "These pages should be upgraded page by page before BigOrange assumes new content is the only growth lever.",
    ]:
        story.append(bullet(item))
    story.append(PageBreak())

    story.extend(section_header("Website recommendations", "Priority order"))
    priority_rows = [
        [para("Priority", "table_white"), para("Issue", "table_white"), para("Recommendation", "table_white")],
        [para("P0", "table_bold"), para("Homepage typo in meta, Open Graph, and schema", "table"), para("Correct Stategic to Strategic everywhere and verify the rendered metadata and schema.", "table")],
        [para("P0", "table_bold"), para("AI search services page has four H1 tags", "table"), para("Reduce to one clear H1, turn the other visual headlines into descriptive H2 or styled text, and recheck outline order.", "table")],
        [para("P0", "table_bold"), para("AI search services page is index, nofollow", "table"), para("Review Yoast intent and switch to follow only if the page is meant to pass authority. Fifteen published pages currently carry nofollow.", "table")],
        [para("P1", "table_bold"), para("21 published pages are absent from the page sitemap", "table"), para("Classify confirmation and campaign URLs intentionally. Include strategic indexed pages and keep utility sinks noindex.", "table")],
        [para("P1", "table_bold"), para("Builder hub mobile performance", "table"), para("Re-test after the approved design is selected. The August 20 sample showed performance 32 and LCP near 36 seconds; optimize the real critical path before any public swap.", "table")],
        [para("P1", "table_bold"), para("Homepage image accessibility", "table"), para("Fix the eight sampled images with missing or unusable alt text and verify focus, labels, headings, contrast, and keyboard flow.", "table")],
        [para("P1", "table_bold"), para("Ranking pages lack consistent answer-ready structure", "table"), para("Apply one URL per reader job, direct answers, definitions, tables, visible FAQs, entities, evidence dates, and matched schema where supported.", "table")],
        [para("P2", "table_bold"), para("Sitewide refresh and consolidation", "table"), para("Use the 370-row ledger to update, consolidate, redirect, noindex, or retain each URL based on owner, intent, proof, freshness, and search value.", "table")],
    ]
    priority_table = LongTable(priority_rows, colWidths=[0.55 * inch, 2.35 * inch, 4.0 * inch], repeatRows=1)
    priority_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), INK),
        ("GRID", (0, 0), (-1, -1), 0.45, RULE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, PAPER]),
        ("TEXTCOLOR", (0, 1), (0, 3), ORANGE_DARK),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(priority_table)
    story.append(PageBreak())

    story.extend(section_header("Recommended 90-day sequence", "Protect, stage, prove, scale"))
    phases = [
        ("Days 1-14: protect and decide", [
            "Fix the three P0 technical defects and classify the 21 sitemap gaps.",
            "Select the visual direction and reconcile Janice language, proof permissions, and the qualified-lead definition.",
            "Confirm the existing /marketing-agency-for-builders/ URL as the one authority hub and record rollback ownership.",
        ]),
        ("Days 15-45: stage the core cluster", [
            "Stage the approved hub revision and the two supporting posts in private or staging state.",
            "Prioritize the strongest adjacent URL owners: marketing plan, SEO and AI visibility, website design, target market, lead generation, and local SEO.",
            "Verify metadata, canonical, schema, forms, analytics, CRM handoff, accessibility, speed, internal links, and sitemap behavior.",
        ]),
        ("Days 46-75: add proof and editorial depth", [
            "Publish only exact approved revisions, then read back live URLs, metadata, schema, links, forms, and analytics.",
            "Build the nine-blog editorial cadence from approved builder questions, SME stories, and search gaps.",
            "Turn approved examples into attributable project stories, visual proof, short-form content, email nurture, and sales follow-up material.",
        ]),
        ("Days 76-90: productize for clients", [
            "Apply the same export-to-page-map contract to MSP and StoryBrand pages already earning tracked terms.",
            "Create a blank client page map for the next vertical and preserve one source, one owner, one approval path, and one measurable reader job per URL.",
            "Report delivery, engagement, qualified inquiries, CRM outcomes, and content freshness without inventing ranking or revenue promises.",
        ]),
    ]
    for title, items in phases:
        story.append(KeepTogether([para(title, "h3")] + [bullet(item) for item in items]))
    story.append(PageBreak())

    story.extend(section_header("The repeatable Authority Hub Factory", "How BigOrange can use this for clients"))
    story.append(para(
        "The production system stays stable while the subject-matter expertise, market evidence, proof, and client voice change. That is the difference between a reusable operating model and a stack of generic pages.",
    ))
    factory_rows = [
        [para("Stage", "table_white"), para("Input", "table_white"), para("Output", "table_white"), para("Control", "table_white")],
        [para("1. Discover", "table_bold"), para("Site inventory, search data, CRM questions, competitor gaps", "table"), para("Reader-job map and priority ledger", "table"), para("Current evidence with dates and source ownership", "table")],
        [para("2. Interview", "table_bold"), para("One hour with the SME", "table"), para("Transcript, claims register, story candidates, FAQs", "table"), para("Permission codes and no invented proof", "table")],
        [para("3. Architect", "table_bold"), para("Keywords, intent, offers, proof", "table"), para("One URL per reader job, cluster links, content calendar", "table"), para("Cannibalization and duplicate-page checks", "table")],
        [para("4. Produce", "table_bold"), para("Approved brief and evidence", "table"), para("Editable copy, HTML, metadata, images, schema candidates", "table"), para("Human voice, sources, and factual review", "table")],
        [para("5. Stage and QA", "table_bold"), para("Exact implementation candidate", "table"), para("Private WordPress revision", "table"), para("Desktop, mobile, accessibility, performance, links, forms, analytics, rollback", "table")],
        [para("6. Release and learn", "table_bold"), para("Exact approved staged revision", "table"), para("Verified public page and measurement loop", "table"), para("Live readback, CRM truth, refresh trigger, no unsupported promises", "table")],
    ]
    factory_table = LongTable(factory_rows, colWidths=[1.0 * inch, 1.8 * inch, 2.05 * inch, 2.05 * inch], repeatRows=1)
    factory_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), ORANGE_DARK),
        ("GRID", (0, 0), (-1, -1), 0.45, RULE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, PAPER]),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(factory_table)
    story.append(Spacer(1, 0.16 * inch))
    story.append(callout(
        "What scales and what does not",
        "The workflow, QA contract, page map, content modules, and release gates scale. Client facts, offers, voice, proof, imagery, permissions, and outcomes do not transfer between clients. Those must be sourced and approved every time.",
        background=LIGHT_BLUE,
        border=BLUE,
    ))
    story.append(PageBreak())

    story.extend(section_header("Release gates and meeting checklist", "No shortcuts around factual truth"))
    gate_items = [
        "Janice or another named SME approves the exact factual and public-use language.",
        "Leadership approves the audience, offer, positioning, proof, CTA, imagery, ownership, and exact revision.",
        "The WordPress target, implementation owner, rollback owner, and publication sequence are named.",
        "Metadata, canonical, breadcrumbs, internal links, sitemap behavior, and schema are verified without duplication.",
        "Visible FAQ wording and FAQPage candidate markup match exactly.",
        "Desktop, mobile, keyboard, focus, reduced motion, overflow, accessibility, console, network, forms, tracking, and performance pass.",
        "Publication is approved for the exact staged revision, then the live URL is read back after release.",
    ]
    for item in gate_items:
        story.append(bullet(item))

    story.append(Spacer(1, 0.15 * inch))
    story.append(para("September 3 meeting checklist", "h3"))
    decisions = [
        "Visual direction: Orange Press, Cinematic Authority, or bounded combination.",
        "Canonical hub and release sequence.",
        "Janice language, Homearama permission, approved stories, and imagery.",
        "Qualified-lead definition, CTA, CRM handoff, and reporting owner.",
        "Which content assets enter the first staging wave.",
        "Whether BigOrange wants the sitewide 370-URL plan and client-scale factory as the next operating product.",
        "Invoice recipient, billing details, payment method, due date, acceptance, revisions, ownership, confidentiality, and portfolio use.",
    ]
    for index, item in enumerate(decisions, 1):
        story.append(Paragraph(
            f"<b>{index}.</b> {item}",
            pstyle(f"decision-{index}", leftIndent=18, firstLineIndent=-18, spaceAfter=6),
        ))

    story.append(Spacer(1, 0.2 * inch))
    story.append(callout(
        "Bottom line",
        "The paid pilot proves the concept. The no-charge extension proves the operating system. The next step is not to publish everything at once. It is to choose the direction, approve the truth, protect the URL that already ranks, stage the strongest cluster in order, verify the measurement path, and then scale the same disciplined system to BigOrange clients.",
        background=PAPER,
        border=ORANGE,
    ))
    story.append(Spacer(1, 0.25 * inch))
    story.append(para("Prepared by Dillon Mohr", "h3"))
    story.append(para("Private leadership review | Not publication approval | Evidence dates: Moz August 14, 2026; public crawl September 1, 2026", "small"))

    doc.build(story, onFirstPage=cover, onLaterPages=footer)
    return OUTPUT_PDF


if __name__ == "__main__":
    result = build_pdf()
    print(result)
