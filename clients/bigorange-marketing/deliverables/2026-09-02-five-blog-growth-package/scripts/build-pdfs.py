from __future__ import annotations

import json
import re
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    HRFlowable, Image, KeepTogether, LongTable, PageBreak, Paragraph,
    SimpleDocTemplate, Spacer, Table, TableStyle,
)

HERE = Path(__file__).resolve()
PKG = HERE.parents[1]
CLIENT = PKG.parents[1]
BLOG_DIR = PKG / "blogs"
OUT = PKG / "output" / "pdf"
OUT.mkdir(parents=True, exist_ok=True)
ASSETS = CLIENT / "deliverables" / "2026-07-16-capability-showcase" / "assets"
LOGO_ORANGE = ASSETS / "bigorange-logo-orange.png"
LOGO_WHITE = ASSETS / "bigorange-logo-white.png"

ORANGE = colors.HexColor("#F36F21")
DEEP = colors.HexColor("#2A1308")
INK = colors.HexColor("#1D1B19")
SLATE = colors.HexColor("#5E5A55")
PAPER = colors.HexColor("#FFF9F3")
CREAM = colors.HexColor("#F4E8DC")
PALE = colors.HexColor("#FFE6D4")
GREEN = colors.HexColor("#197A4A")
WHITE = colors.white
RULE = colors.HexColor("#DCCFC4")


def fonts():
    candidates = [
        (Path("C:/Windows/Fonts/aptos.ttf"), Path("C:/Windows/Fonts/aptos-bold.ttf")),
        (Path("C:/Windows/Fonts/arial.ttf"), Path("C:/Windows/Fonts/arialbd.ttf")),
    ]
    for reg, bold in candidates:
        if reg.exists() and bold.exists():
            pdfmetrics.registerFont(TTFont("BOReg", str(reg)))
            pdfmetrics.registerFont(TTFont("BOBold", str(bold)))
            return "BOReg", "BOBold"
    return "Helvetica", "Helvetica-Bold"


FONT, BOLD = fonts()


def ps(name, **kw):
    base = dict(fontName=FONT, fontSize=9.25, leading=13.2, textColor=INK, spaceAfter=6)
    base.update(kw)
    return ParagraphStyle(name, **base)


S = {
    "body": ps("body"),
    "small": ps("small", fontSize=7.8, leading=10.6, textColor=SLATE),
    "tiny": ps("tiny", fontSize=6.8, leading=8.6, textColor=SLATE),
    "eyebrow": ps("eyebrow", fontName=BOLD, fontSize=8, leading=10, textColor=ORANGE, spaceAfter=6),
    "h1": ps("h1", fontName=BOLD, fontSize=25, leading=28, textColor=INK, spaceAfter=12),
    "h2": ps("h2", fontName=BOLD, fontSize=15, leading=18, textColor=DEEP, spaceBefore=11, spaceAfter=6),
    "h3": ps("h3", fontName=BOLD, fontSize=11, leading=14, textColor=INK, spaceBefore=7, spaceAfter=4),
    "quote": ps("quote", fontName=BOLD, fontSize=10, leading=14, textColor=DEEP, leftIndent=12, rightIndent=8),
    "cover": ps("cover", fontName=BOLD, fontSize=29, leading=32, textColor=WHITE, spaceAfter=12),
    "cover_sub": ps("cover_sub", fontSize=12, leading=17, textColor=WHITE),
    "metric": ps("metric", fontName=BOLD, fontSize=18, leading=20, textColor=ORANGE, alignment=TA_CENTER),
    "metric_label": ps("metric_label", fontSize=7.4, leading=9.3, textColor=SLATE, alignment=TA_CENTER),
    "table_head": ps("table_head", fontName=BOLD, fontSize=7.6, leading=9, textColor=WHITE),
    "table": ps("table", fontSize=7.2, leading=9.2),
}


def safe(txt):
    txt = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2" color="#B94800">\1</a>', txt)
    txt = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", txt)
    txt = re.sub(r"\*(.+?)\*", r"<i>\1</i>", txt)
    return txt.replace("&", "&amp;").replace("&amp;lt;", "&lt;").replace("&amp;gt;", "&gt;").replace("&amp;quot;", "&quot;").replace("&amp;#", "&#").replace('&amp;<', '<').replace('&amp;"', '"')


def para(txt, style="body"):
    # Convert links/bold safely without double-escaping the tags created above.
    placeholders = []
    def hold(m):
        placeholders.append(m.group(0))
        return f"@@TAG{len(placeholders)-1}@@"
    txt = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", lambda m: hold(re.match(r".*", f'<a href="{m.group(2)}" color="#B94800">{m.group(1)}</a>')), txt)
    txt = re.sub(r"\*\*(.+?)\*\*", lambda m: hold(re.match(r".*", f"<b>{m.group(1)}</b>")), txt)
    txt = re.sub(r"\*(.+?)\*", lambda m: hold(re.match(r".*", f"<i>{m.group(1)}</i>")), txt)
    txt = txt.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    for i, tag in enumerate(placeholders):
        txt = txt.replace(f"@@TAG{i}@@", tag)
    return Paragraph(txt, S[style])


def parse_frontmatter(path):
    raw = path.read_text(encoding="utf-8")
    _, fm, body = raw.split("---", 2)
    meta = {}
    for line in fm.splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            meta[k.strip()] = v.strip().strip('"')
    return meta, body.strip()


def markdown_flow(body):
    out, paragraph = [], []
    lines = body.splitlines()
    i = 0
    def flush():
        nonlocal paragraph
        if paragraph:
            out.append(para(" ".join(x.strip() for x in paragraph)))
            paragraph = []
    while i < len(lines):
        line = lines[i].rstrip()
        if not line:
            flush(); i += 1; continue
        if line.startswith("| "):
            flush()
            block = []
            while i < len(lines) and lines[i].startswith("|"):
                block.append(lines[i]); i += 1
            rows = [[c.strip() for c in row.strip("|").split("|")] for row in block]
            rows = [rows[0]] + rows[2:]
            data = [[Paragraph(re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", c), S["table_head"] if ridx == 0 else S["table"]) for c in row] for ridx, row in enumerate(rows)]
            cols = len(data[0])
            widths = [6.85*inch/cols]*cols
            table = LongTable(data, colWidths=widths, repeatRows=1)
            table.setStyle(TableStyle([
                ("BACKGROUND", (0,0), (-1,0), DEEP), ("TEXTCOLOR", (0,0), (-1,0), WHITE),
                ("GRID", (0,0), (-1,-1), .35, RULE), ("VALIGN", (0,0), (-1,-1), "TOP"),
                ("BACKGROUND", (0,1), (-1,-1), PAPER), ("LEFTPADDING", (0,0), (-1,-1), 5),
                ("RIGHTPADDING", (0,0), (-1,-1), 5), ("TOPPADDING", (0,0), (-1,-1), 5),
                ("BOTTOMPADDING", (0,0), (-1,-1), 5),
            ]))
            out += [table, Spacer(1, 7)]
            continue
        if line.startswith("# "):
            flush(); i += 1; continue
        if line.startswith("## "):
            flush(); out.append(para(line[3:], "h2")); i += 1; continue
        if line.startswith("### "):
            flush(); out.append(para(line[4:], "h3")); i += 1; continue
        if line.startswith("> "):
            flush()
            q = line[2:]
            box = Table([[para(q, "quote")]], colWidths=[6.65*inch])
            box.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,-1), PALE), ("BOX", (0,0), (-1,-1), 1.3, ORANGE), ("LEFTPADDING", (0,0), (-1,-1), 12), ("RIGHTPADDING", (0,0), (-1,-1), 10), ("TOPPADDING", (0,0), (-1,-1), 9), ("BOTTOMPADDING", (0,0), (-1,-1), 9)]))
            out += [box, Spacer(1, 8)]; i += 1; continue
        m = re.match(r"^(\d+)\.\s+(.*)", line)
        if m:
            flush(); out.append(para(f"**{m.group(1)}.** {m.group(2)}")); i += 1; continue
        if line.startswith("*Private review draft"):
            flush(); out.append(HRFlowable(width="100%", thickness=.7, color=RULE, spaceBefore=8, spaceAfter=8)); out.append(para(line.strip("*"), "small")); i += 1; continue
        paragraph.append(line); i += 1
    flush()
    return out


def footer(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(DEEP)
    canvas.rect(0, 0, letter[0], .32*inch, fill=1, stroke=0)
    canvas.setFont(FONT, 7)
    canvas.setFillColor(WHITE)
    canvas.drawString(.55*inch, .12*inch, "BigOrange.Marketing | Private review draft")
    canvas.drawRightString(letter[0]-.55*inch, .12*inch, str(doc.page))
    canvas.restoreState()


def cover_story(meta, asset_id):
    logo = Image(str(LOGO_WHITE), width=1.75*inch, height=.52*inch)
    card = Table([
        [logo],
        [Spacer(1, .2*inch)],
        [Paragraph(meta["title"], S["cover"])],
        [Paragraph(f"A separate SEO, AEO and GEO content deliverable for <b>{meta['primary_query']}</b>", S["cover_sub"])],
        [Spacer(1, .35*inch)],
        [Table([[para(asset_id, "eyebrow"), para(meta["status"], "small")]], colWidths=[1.3*inch, 4.7*inch], style=TableStyle([("BACKGROUND",(0,0),(-1,-1),WHITE), ("BOX",(0,0),(-1,-1),0.6,WHITE), ("LEFTPADDING",(0,0),(-1,-1),10), ("TOPPADDING",(0,0),(-1,-1),8), ("BOTTOMPADDING",(0,0),(-1,-1),8)]))],
    ], colWidths=[6.5*inch])
    card.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),DEEP), ("LEFTPADDING",(0,0),(-1,-1),22), ("RIGHTPADDING",(0,0),(-1,-1),22), ("TOPPADDING",(0,0),(-1,-1),16), ("BOTTOMPADDING",(0,0),(-1,-1),16)]))
    details = Table([
        [para("PRIMARY QUERY", "eyebrow"), para("PROPOSED URL", "eyebrow")],
        [para(meta["primary_query"], "h3"), para("/"+meta["proposed_slug"]+"/", "h3")],
        [para("TITLE TAG", "eyebrow"), para("META DESCRIPTION", "eyebrow")],
        [para(meta["title_tag"], "small"), para(meta["meta_description"], "small")],
    ], colWidths=[2.1*inch,4.2*inch])
    details.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),PAPER), ("GRID",(0,0),(-1,-1),.45,RULE), ("VALIGN",(0,0),(-1,-1),"TOP"), ("LEFTPADDING",(0,0),(-1,-1),9), ("RIGHTPADDING",(0,0),(-1,-1),9), ("TOPPADDING",(0,0),(-1,-1),7), ("BOTTOMPADDING",(0,0),(-1,-1),7)]))
    return [card, Spacer(1,.22*inch), details, Spacer(1,.2*inch), para("This PDF contains the complete article plus its on-page implementation brief. The corresponding WordPress version remains a private draft until editorial, factual, image-permission and release review are complete.", "small"), PageBreak()]


def build_blog(path):
    meta, body = parse_frontmatter(path)
    output = OUT / f"{meta['asset_id']}-{meta['proposed_slug']}.pdf"
    doc = SimpleDocTemplate(str(output), pagesize=letter, rightMargin=.55*inch, leftMargin=.55*inch, topMargin=.55*inch, bottomMargin=.52*inch, title=meta["title"], author="BigOrange.Marketing")
    story = cover_story(meta, meta["asset_id"])
    story += [para(meta["title"], "h1"), para(f"Implementation target: {meta['parent']}", "small"), HRFlowable(width="100%", thickness=1.2, color=ORANGE, spaceAfter=10)]
    story += markdown_flow(body)
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    return output


def master_cover():
    logo = Image(str(LOGO_WHITE), width=2.2*inch, height=.65*inch)
    t = Table([
        [logo], [Spacer(1,.28*inch)],
        [Paragraph("Complete WordPress<br/>SEO + AEO + GEO<br/>Growth Plan", S["cover"])],
        [Paragraph("370 URL audit • 24 asset authority system • five new blogs • backend release plan • Thursday decision deck", S["cover_sub"])],
        [Spacer(1,.4*inch)],
        [Paragraph("Prepared for BigOrange leadership • September 3 review", S["cover_sub"])],
    ], colWidths=[6.55*inch])
    t.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),DEEP), ("LEFTPADDING",(0,0),(-1,-1),24), ("RIGHTPADDING",(0,0),(-1,-1),24), ("TOPPADDING",(0,0),(-1,-1),18), ("BOTTOMPADDING",(0,0),(-1,-1),18)]))
    return [t, Spacer(1,.22*inch), para("Purpose", "eyebrow"), para("Turn the original pilot into a complete, reviewable operating plan: what was promised, what has been added at no charge, what WordPress needs next, what each page must prove, and how content performance should connect to qualified business outcomes."), PageBreak()]


def section(title, kicker, body):
    return [para(kicker.upper(), "eyebrow"), para(title, "h1"), HRFlowable(width="100%", thickness=1.4, color=ORANGE, spaceAfter=10), para(body)]


def bullet(items):
    return [para(f"**{i+1}.** {x}") for i,x in enumerate(items)]


def grid(rows, widths=None):
    data = [[para(str(c), "table_head" if i==0 else "table") for c in row] for i,row in enumerate(rows)]
    t=LongTable(data, colWidths=widths, repeatRows=1)
    t.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),DEEP), ("GRID",(0,0),(-1,-1),.45,RULE), ("VALIGN",(0,0),(-1,-1),"TOP"), ("ROWBACKGROUNDS",(0,1),(-1,-1),[WHITE,PAPER]), ("LEFTPADDING",(0,0),(-1,-1),6), ("RIGHTPADDING",(0,0),(-1,-1),6), ("TOPPADDING",(0,0),(-1,-1),6), ("BOTTOMPADDING",(0,0),(-1,-1),6)]))
    return t


def build_master(manifest):
    output=OUT/"BigOrange-Complete-WordPress-SEO-AEO-GEO-Growth-Plan-2026-09-02.pdf"
    doc=SimpleDocTemplate(str(output),pagesize=letter,rightMargin=.55*inch,leftMargin=.55*inch,topMargin=.55*inch,bottomMargin=.52*inch,title="BigOrange Complete WordPress SEO AEO GEO Growth Plan",author="Dillon Mohr")
    st=master_cover()
    st += section("Executive outcome", "01 • leadership brief", "BigOrange now has a single operating picture for site health, keyword opportunity, content production and release governance. The recommendation is not to publish everything at once. First repair the high-leverage technical defects, then release pages and articles in a controlled sequence with factual review, image permission, schema validation, internal-link QA and measurement attached.")
    metrics=[[para("370","metric"),para("24","metric"),para("171","metric"),para("5","metric")],[para("published URLs\n299 posts + 71 pages","metric_label"),para("authority assets\n19 existing + 5 new","metric_label"),para("Moz snapshot\nunique tracked keywords","metric_label"),para("separate new blogs\n6,093 words total","metric_label")]]
    mt=Table(metrics,colWidths=[1.65*inch]*4); mt.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),PAPER),("BOX",(0,0),(-1,-1),.6,RULE),("INNERGRID",(0,0),(-1,-1),.4,RULE),("TOPPADDING",(0,0),(-1,-1),9),("BOTTOMPADDING",(0,0),(-1,-1),9)])); st += [Spacer(1,8),mt,Spacer(1,10)]
    st += bullet(["Original paid pilot: 35 hours at $30 per hour, totaling $1,050.","Milestone 1: 15 hours of discovery and strategy. Milestone 2: 20 hours for one pillar, two supporting articles, technical SEO and WordPress implementation.","Expanded investment: the five new blogs, deeper page-level framework, branded review collateral and implementation packaging are included as additional no-charge proof of commitment, subject to BigOrange approval and prioritization.","Phase 2 social, downloadable and webinar concepts remain roadmap items rather than included paid production unless the team approves a later scope."])
    st += [PageBreak()]

    st += section("Current site and ranking truth", "02 • evidence baseline", "Site health and ranking are one system. The September 1 public crawl covers all 370 published URLs; Moz figures are the August 14 snapshot and should be refreshed before any external performance claim.")
    st += [grid([["Slice","Verified result"],["Live URLs","370 published: 299 posts and 71 pages"],["Public sitemap","349 URLs; 21 published pages missing"],["Priority ledger","8 P0 • 38 P1 • 176 P2 • 148 P3"],["Moz snapshot","171 unique keywords; 27 positions 1–3; 28 positions 4–10; 23 positions 11–20; 93 unranked"],["Builder lane","21 tracked terms; 17 ranked; 13 positions 1–3; one position 4–10; three positions 11–20"]],[1.45*inch,5.15*inch]),Spacer(1,10)]
    st += [para("Highest-leverage defects", "h2")]
    st += bullet(["Correct homepage “Stategic” to “Strategic” everywhere it appears in metadata, Open Graph output and schema.","Reduce /ai-search-optimization-services/ from four H1 elements to one descriptive page H1.","Remove the unintended nofollow directive from that page and audit the other 15 published nofollow pages individually before changing them.","Restore the 21 published pages missing from the sitemap only after confirming each should be indexable and canonical.","Improve the builder hub mobile critical path. The August 20 sample showed performance 32 with LCP near 36 seconds; remeasure after media and script work.","Repair missing or non-useful alternative text only where an image conveys meaning; keep decorative images empty."])
    st += [PageBreak()]

    st += section("The page-by-page optimization contract", "03 • every indexable page", "Each public page should have one defined job and one accountable owner. SEO creates retrieval clarity, AEO creates answer clarity, GEO creates entity and source clarity, and conversion work makes the next action honest and usable.")
    st += [grid([["Layer","Required page-level checks"],["Intent and query","One primary query family, search intent, audience, funnel job and non-cannibalizing parent relationship"],["Visible structure","One H1; direct answer near the top; descriptive H2s; scannable definitions, steps, comparisons or tables where useful"],["Trust and proof","Named author or reviewer; current dates; approved project evidence; precise attribution; no unsupported guarantees"],["SEO metadata","Unique title and description; canonical; index/follow decision; social title/image; sitemap eligibility"],["AEO","Answer-first passages; quotable definitions; concise FAQs written for readers; entity names and relationships stated plainly"],["GEO","Original information gain; stable citations; local/service context; consistent organization, people, services and locations"],["Schema","Only types supported by visible content; Article/BlogPosting, BreadcrumbList, Organization, Service or LocalBusiness as appropriate"],["Media and access","Descriptive filename, dimensions, compression, lazy loading below the fold, meaningful alt text, keyboard/focus and contrast review"],["Links and action","One parent link, relevant sibling links, contextual CTA, no broken redirects, no orphan page"],["Measurement","Search Console query/page baseline, analytics engagement, form or booking event, CRM source and sales acceptance"]],[1.15*inch,5.45*inch]),PageBreak()]

    st += section("Recommended page classes", "04 • sitewide implementation map", "The same checklist does not mean identical copy. Each template needs a specific answer pattern and proof sequence.")
    st += [grid([["Page class","Primary job","Recommended answer pattern","Schema and conversion"],["Homepage","Route the right visitor","Who BigOrange helps, what changes, proof, capabilities, next step","Organization + WebSite; primary consultation action"],["Service pages","Explain one solution","Problem, approach, deliverables, fit, proof, process, FAQs","Service + Breadcrumb; contextual working session"],["Industry hubs","Own a vertical topic","Audience problem, strategic model, proof, supporting resources, next step","CollectionPage or Service; pillar-to-cluster links"],["Location pages","Prove real local relevance","Service area, local considerations, nearby proof, correct contact path","LocalBusiness only when facts support it"],["Case studies","Show reasoning and evidence","Context, constraint, decision, execution, approved result, lessons","Article; route to related service"],["Blog posts","Answer a real question","Direct answer, definition, decision table, steps, FAQs, sources","BlogPosting + Breadcrumb; parent and booking links"],["About/people","Establish entity trust","Current roles, expertise, responsibilities, affiliations and contact context","AboutPage/Person when accurate"],["Conversion pages","Remove friction","Who it is for, what happens next, privacy expectation, confirmation path","No unnecessary markup; verified event tracking"]],[1.1*inch,1.25*inch,2.55*inch,1.65*inch]),PageBreak()]

    st += section("Five separate blogs tied to verified gaps", "05 • new editorial production", "The builder hub already owns the ranked builder terms. These articles deepen topical coverage around four exact unranked gaps and one page-two opportunity without replacing the commercial service page.")
    rows=[["ID","Primary query","Title","Words"]]+[[m["asset_id"],m["primary_query"],m["title"],str(m["word_count"])] for m in manifest]
    st += [grid(rows,[.55*inch,1.55*inch,3.95*inch,.55*inch]),Spacer(1,10)]
    st += bullet(["Every blog opens with a direct answer and contains a definition, decision support, practical steps, five reader-facing FAQs, a parent-hub link and a low-pressure booking CTA.","Every draft includes title, meta description, proposed slug, featured-image brief, alt text, canonical candidate and BlogPosting/Breadcrumb structured-data candidates.","FAQ content is retained for reader and answer-engine value. No promise is made about FAQ rich results.","Final public use still requires BigOrange factual review, current internal-link verification, approved imagery, accessibility QA and a WordPress preview review."])
    st += [PageBreak()]

    st += section("Architecture and internal linking", "06 • authority system", "The authority model is one commercial parent with supporting educational assets. The service page should remain the primary conversion target; articles should answer narrower questions, earn qualified discovery and pass relevance back to the hub.")
    st += [grid([["Layer","Role","Link behavior"],["Builder hub","Commercial authority for marketing agency for builders","Links to the five articles in a clearly labeled resource section"],["Five blogs","Exact-gap and planning answers","Each links to the builder hub and the booking page; sibling links only when context genuinely helps"],["Existing 19 assets","Cross-industry content and schema package","Keep the current 66 relationship map; add only reviewed links that preserve topic boundaries"],["Navigation and sitemap","Discovery and crawl control","Do not add drafts; add only approved public URLs with final canonicals"],["Case studies and proof","Evidence layer","Link to the service or article whose claim the proof supports"]],[1.2*inch,2.45*inch,2.95*inch]),Spacer(1,10)]
    st += [para("Cannibalization rule", "h2")]
    st += [para("The builder hub owns the broad commercial agency intent. Each blog owns one narrower question. If Search Console later shows two URLs competing for the same query family, strengthen the intended owner, merge redundant passages, update anchor text and consider consolidation only after confirming the evidence.")]
    st += [PageBreak()]

    st += section("WordPress backend release checklist", "07 • stage, verify, then publish", "The five posts should enter WordPress as private drafts. No post becomes public until the release owner confirms the visible content and every technical field.")
    st += bullet(["Create a draft post with the proposed slug; never reuse an existing public slug without a redirect and canonical decision.","Select the correct author, category and review owner. Remove irrelevant default tags.","Add the approved featured image, meaningful alt text, caption or credit when required, and social sharing image.","Set title, meta description, canonical and robots. Confirm index, follow only at release time.","Keep one visible H1 supplied by the theme or editor, not both. Verify heading order in the rendered preview.","Insert the visible article, not metadata notes. Validate every internal and external link.","Add BlogPosting and Breadcrumb structured data only when fields match visible content. Keep FAQ schema as semantic candidate only, without rich-result claims.","Preview desktop and mobile. Check keyboard focus, forms, contrast, overflow, console errors and page speed.","Run schema validation, sitemap discovery and Search Console URL inspection after publication. Sitemap inclusion is not proof of indexing.","Record post ID, final URL, reviewer, approval date, publish date and first 30-day measurement checkpoint."])
    st += [PageBreak()]

    st += section("Measurement from discovery to revenue truth", "08 • reporting", "Ranking and traffic are leading evidence, not the finish line. Reporting should preserve the chain from query and landing page to meaningful action, qualified inquiry, CRM opportunity and sales outcome.")
    st += [grid([["Stage","Evidence","Decision"],["Discovery","Search Console impressions, queries, position and page","Is the intended page being retrieved for the intended query family?"],["Engagement","Analytics engaged sessions, scroll and next-page behavior","Did the answer help the visitor continue?"],["Action","Verified form, booking, phone or email event","Did the page create a real hand raise?"],["Qualification","CRM source, service, market, timing and fit","Was the inquiry accepted by sales?"],["Outcome","Opportunity and closed business","What content assisted a commercially meaningful result?"],["Learning","Sales notes, lost reasons and content requests","What should be improved, expanded or retired?"]],[1.05*inch,2.25*inch,3.3*inch]),Spacer(1,10)]
    st += [para("Recommended cadence", "h2")]
    st += bullet(["Weekly: indexing, broken links, form delivery and anomaly checks.","Monthly: query-to-page ownership, content decay, qualified-inquiry review and editorial backlog.","Quarterly: technical crawl, schema coverage, internal-link graph, page consolidation and conversion-path review."])
    st += [PageBreak()]

    st += section("90-day controlled rollout", "09 • execution sequence", "This sequence protects the current builder rankings while turning the new work into measurable public assets.")
    st += [grid([["Window","Priority work","Exit gate"],["Days 1–14","Repair homepage typo, H1 duplication, nofollow review, sitemap gaps and critical builder-hub performance; approve five blog facts and imagery","P0/P1 defects assigned; clean previews; tracking baseline captured"],["Days 15–30","Release the first two articles; add reviewed hub links; submit sitemap and inspect URLs","Published pages render correctly; schema valid; events verified"],["Days 31–60","Release the remaining three at a sustainable cadence; improve one related proof asset or market page","No cannibalization signal; editorial and sales feedback recorded"],["Days 61–90","Review query ownership, engagement, qualified inquiries and sales use; refresh weak titles, intros or links","Leadership decision on Phase 2 and the next quarter backlog"]],[1.05*inch,3.75*inch,1.8*inch]),Spacer(1,10)]
    st += [para("12-month scale", "h2")]
    st += [para("Build toward the StoryBrand example of one pillar, three subpillars and nine blogs only where Search Console, client questions and sales feedback justify the next asset. Add one factual, approved proof item each month. Refresh winners before creating near-duplicate content.")]
    st += [PageBreak()]

    st += section("Thursday decisions", "10 • leadership close", "The working session should end with named owners and release gates, not a larger unprioritized idea list.")
    st += bullet(["Approve the five blog topics and their intended keyword ownership.","Name one factual reviewer and one WordPress release owner.","Approve or replace the featured-image briefs and confirm permissions.","Confirm the first technical repair sprint and the builder-hub performance owner.","Choose the first two articles for public release after QA.","Confirm the measurement chain from web events to CRM and sales acceptance.","Decide whether Phase 2 social, downloadable and webinar production should be scoped separately."])
    close=Table([[Image(str(LOGO_ORANGE),width=1.75*inch,height=.52*inch),para("Prepared as additional proof of investment in BigOrange and the work BigOrange delivers for its clients. Public claims, imagery and release timing remain subject to BigOrange review.","small")]],colWidths=[2.0*inch,4.35*inch]); close.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),PAPER),("BOX",(0,0),(-1,-1),.6,RULE),("VALIGN",(0,0),(-1,-1),"MIDDLE"),("LEFTPADDING",(0,0),(-1,-1),12),("RIGHTPADDING",(0,0),(-1,-1),12),("TOPPADDING",(0,0),(-1,-1),12),("BOTTOMPADDING",(0,0),(-1,-1),12)])); st += [Spacer(1,16),close]
    doc.build(st,onFirstPage=footer,onLaterPages=footer)
    return output


def main():
    manifest=json.loads((PKG/"blog-manifest.json").read_text(encoding="utf-8"))
    outputs=[build_master(manifest)]
    for item in manifest:
        outputs.append(build_blog(BLOG_DIR/f"{item['asset_id']}.md"))
    print(json.dumps({"created":[str(x) for x in outputs]},indent=2))


if __name__ == "__main__":
    main()
