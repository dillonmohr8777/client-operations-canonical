from __future__ import annotations

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "Momentum-Deck-System-Transfer-Installer.pdf"

BLUE = colors.HexColor("#2A80C2")
NAVY = colors.HexColor("#10263A")
INK = colors.HexColor("#17212B")
MUTED = colors.HexColor("#5F6B76")
PALE = colors.HexColor("#EAF4FB")
LINE = colors.HexColor("#D7E0E7")
WHITE = colors.white


def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.line(0.65 * inch, 0.52 * inch, 7.85 * inch, 0.52 * inch)
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(0.65 * inch, 0.32 * inch, "MOMENTUM DIGITAL  /  TRANSFER PACKET  /  2026-09-04")
    canvas.drawRightString(7.85 * inch, 0.32 * inch, f"{doc.page}")
    canvas.restoreState()


def make_styles():
    base = getSampleStyleSheet()
    return {
        "eyebrow": ParagraphStyle(
            "eyebrow",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8,
            leading=10,
            textColor=BLUE,
            spaceAfter=8,
        ),
        "cover": ParagraphStyle(
            "cover",
            parent=base["Title"],
            fontName="Helvetica-Bold",
            fontSize=32,
            leading=34,
            textColor=WHITE,
            alignment=TA_LEFT,
            spaceAfter=18,
        ),
        "cover_sub": ParagraphStyle(
            "cover_sub",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=13,
            leading=18,
            textColor=colors.HexColor("#DDEBF5"),
        ),
        "h1": ParagraphStyle(
            "h1",
            parent=base["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=23,
            leading=26,
            textColor=NAVY,
            spaceAfter=12,
        ),
        "h2": ParagraphStyle(
            "h2",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=13,
            leading=16,
            textColor=INK,
            spaceBefore=9,
            spaceAfter=5,
        ),
        "body": ParagraphStyle(
            "body",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=9.6,
            leading=14,
            textColor=INK,
            spaceAfter=7,
        ),
        "small": ParagraphStyle(
            "small",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=8,
            leading=11,
            textColor=MUTED,
        ),
        "code": ParagraphStyle(
            "code",
            parent=base["Code"],
            fontName="Courier",
            fontSize=7.7,
            leading=11,
            textColor=NAVY,
            leftIndent=8,
            rightIndent=8,
            spaceBefore=4,
            spaceAfter=7,
        ),
        "callout": ParagraphStyle(
            "callout",
            parent=base["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=10,
            leading=14,
            textColor=NAVY,
            borderColor=BLUE,
            borderWidth=1,
            borderPadding=10,
            backColor=PALE,
            spaceAfter=10,
        ),
        "center": ParagraphStyle(
            "center",
            parent=base["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=10,
            leading=14,
            textColor=NAVY,
            alignment=TA_CENTER,
        ),
    }


def bullet(text, styles):
    return Paragraph(f"&#8226;&nbsp;&nbsp;{text}", styles["body"])


def build_pdf():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    styles = make_styles()
    doc = BaseDocTemplate(
        str(OUTPUT),
        pagesize=letter,
        rightMargin=0.65 * inch,
        leftMargin=0.65 * inch,
        topMargin=0.62 * inch,
        bottomMargin=0.72 * inch,
        title="Momentum Deck System Transfer Installer",
        author="Momentum Digital",
        subject="Portable installation and verification packet for the Momentum deck system",
    )
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="body")
    doc.addPageTemplates([PageTemplate(id="default", frames=[frame], onPage=footer)])

    story = []

    cover_block = Table(
        [[
            Paragraph(
                "MOMENTUM DIGITAL<br/><font size='9'>PORTABLE SYSTEM HANDOFF</font>",
                ParagraphStyle(
                    "brand",
                    fontName="Helvetica-Bold",
                    fontSize=15,
                    leading=18,
                    textColor=WHITE,
                ),
            ),
            Paragraph("26 SLIDES<br/><font size='9'>423 NATIVE EFFECTS</font>", styles["center"]),
        ]],
        colWidths=[5.25 * inch, 1.65 * inch],
        rowHeights=[0.72 * inch],
    )
    cover_block.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, 0), NAVY),
        ("BACKGROUND", (1, 0), (1, 0), BLUE),
        ("TEXTCOLOR", (1, 0), (1, 0), WHITE),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 14),
        ("RIGHTPADDING", (0, 0), (-1, -1), 14),
    ]))
    story += [cover_block, Spacer(1, 0.55 * inch)]
    title_box = Table([[Paragraph("Momentum Deck System<br/>Transfer + Installer", styles["cover"]),
                        Paragraph("A complete, portable handoff of the editable PowerPoint, motion render, source record, brand assets, and the two skills that produced it.", styles["cover_sub"])]],
                      colWidths=[4.15 * inch, 2.75 * inch], rowHeights=[3.15 * inch])
    title_box.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), NAVY),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 22),
        ("RIGHTPADDING", (0, 0), (-1, -1), 22),
        ("TOPPADDING", (0, 0), (-1, -1), 26),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 20),
        ("LINEBEFORE", (1, 0), (1, 0), 1, colors.HexColor("#36516A")),
    ]))
    story += [title_box, Spacer(1, 0.35 * inch)]
    story.append(Paragraph("TRANSFER CONTRACT", styles["eyebrow"]))
    story.append(Paragraph(
        "Upload this PDF together with the companion ZIP and ask the receiving coding agent to install the package. "
        "The ZIP contains the real files. This PDF supplies the install contract, validation rules, and a ready-to-paste instruction.",
        styles["callout"],
    ))
    story.append(Paragraph("Built for Claude Code and Codex. Usable as reference context in general ChatGPT work.", styles["small"]))
    story.append(PageBreak())

    story += [Paragraph("01  /  What is inside", styles["eyebrow"]), Paragraph("One package. No missing pieces.", styles["h1"])]
    contents = [
        ("Editable presentation", "Momentum-Digital-Sales-Deck.pptx", "26 slides; native PowerPoint motion; fully editable"),
        ("Printable presentation", "Momentum-Digital-Sales-Deck.pdf", "Static review and sharing copy"),
        ("Self-playing motion", "Momentum-Digital-Sales-Deck.mp4", "Rendered deck motion for playback and delivery"),
        ("Build source", "deck-project/", "Deck script, package lock, brand assets, README, and sources"),
        ("Skill 1", "skills/client-logo/", "First-party logo retrieval, cleanup, variants, provenance, and logo motion"),
        ("Skill 2", "skills/client-deck/", "Brand system, layout kit, motion canvas, OOXML choreography, PDF/video/QA tools"),
        ("Reference", "documentation/SKILLS-REFERENCE.pdf", "Human-readable reference for the two installed skills"),
        ("Installers", "install.ps1 and install.sh", "Claude, Codex, or both; backups on forced replacement"),
        ("Integrity", "MANIFEST-SHA256.txt", "Per-file checksums for the complete archive payload"),
    ]
    table_data = [[Paragraph("ITEM", styles["small"]), Paragraph("PATH", styles["small"]), Paragraph("PURPOSE", styles["small"])]]
    for a, b, c in contents:
        table_data.append([Paragraph(a, styles["body"]), Paragraph(b, styles["code"]), Paragraph(c, styles["small"])])
    t = Table(table_data, colWidths=[1.35 * inch, 2.65 * inch, 2.9 * inch], repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("GRID", (0, 0), (-1, -1), 0.4, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, colors.HexColor("#F7FAFC")]),
    ]))
    story += [t, Spacer(1, 0.18 * inch)]
    story.append(Paragraph(
        "Dependency caches and temporary render probes are intentionally excluded. Both skills retain package.json and package-lock.json so dependencies can be rebuilt deterministically for the destination computer.",
        styles["callout"],
    ))
    story.append(PageBreak())

    story += [Paragraph("02  /  Install", styles["eyebrow"]), Paragraph("Restore the system in the target agent.", styles["h1"])]
    story.append(Paragraph("Windows PowerShell", styles["h2"]))
    story.append(Paragraph(
        "Expand the ZIP, open PowerShell in the expanded folder, and run one of the following:", styles["body"]
    ))
    story.append(Paragraph(
        ".\\install.ps1 -Target Claude<br/>.\\install.ps1 -Target Codex<br/>.\\install.ps1 -Target Both",
        styles["code"],
    ))
    story.append(Paragraph("macOS or Linux", styles["h2"]))
    story.append(Paragraph(
        "chmod +x install.sh<br/>./install.sh claude<br/>./install.sh codex<br/>./install.sh both",
        styles["code"],
    ))
    story.append(Paragraph("What the installer does", styles["h2"]))
    for item in [
        "Copies client-logo and client-deck into the selected agent's user skill directory.",
        "Stops on an existing installation unless overwrite is explicitly requested.",
        "Creates a timestamped backup before any forced replacement.",
        "Runs npm ci from each pinned package lock unless dependency installation is skipped.",
        "Checks that each SKILL.md and Momentum brand payload arrived at the destination.",
    ]:
        story.append(bullet(item, styles))
    story.append(Paragraph("Required runtime", styles["h2"]))
    story.append(Paragraph(
        "Node.js is required. PowerPoint automation and editable native motion require Microsoft PowerPoint on Windows. "
        "Video export and animated logo output require ffmpeg. The core deck and logo workflows can still install when those optional runtimes are absent; the installer reports the missing capability.",
        styles["body"],
    ))
    story.append(Paragraph(
        "General ChatGPT cannot silently write to a local skill directory from a PDF upload. In that environment, the packet acts as source context until a coding workspace or connected filesystem is available.",
        styles["callout"],
    ))
    story.append(PageBreak())

    story += [Paragraph("03  /  Ready-to-paste handoff", styles["eyebrow"]), Paragraph("Give the receiving agent this instruction.", styles["h1"])]
    prompt = (
        "Use Momentum-Digital-Deck-System-Transfer.zip as the installation source and treat this PDF as the transfer contract. "
        "Inspect MANIFEST-SHA256.txt, verify the archive payload, and install the bundled client-logo and client-deck skills for the current agent environment. "
        "Preserve the exact directory hierarchy and file contents. If an existing skill would be replaced, create a timestamped backup first and report the conflict before forcing replacement. "
        "Run the appropriate bundled installer, restore dependencies from each package-lock.json, validate that both SKILL.md files load, validate the Momentum brand JSON and four logo assets, and report the installed paths plus validation results. "
        "Do not send email, publish, deploy, spend money, or alter unrelated files. After installation, use the bundled deck project as the reference implementation and keep sources and speaker-note provenance attached to future decks."
    )
    prompt_box = Table([[Paragraph(prompt, styles["body"])]], colWidths=[6.9 * inch])
    prompt_box.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PALE),
        ("BOX", (0, 0), (-1, -1), 1.2, BLUE),
        ("LEFTPADDING", (0, 0), (-1, -1), 16),
        ("RIGHTPADDING", (0, 0), (-1, -1), 16),
        ("TOPPADDING", (0, 0), (-1, -1), 16),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 16),
    ]))
    story += [prompt_box, Spacer(1, 0.22 * inch)]
    story.append(Paragraph("Success receipt", styles["h2"]))
    receipt = [
        ["Check", "Expected result"],
        ["Skill discovery", "client-logo and client-deck are listed by the receiving agent"],
        ["Brand payload", "momentum-digital.json and four Momentum PNG assets are present"],
        ["Deck tooling", "deck-kit.mjs plus choreography, PDF, video, and QA scripts are present"],
        ["Dependencies", "npm ci completes from the two included lockfiles"],
        ["Integrity", "MANIFEST-SHA256.txt matches every payload file"],
        ["Reference build", "the bundled PPTX remains 26 slides with 423 native effects"],
    ]
    rt = Table([[Paragraph(x, styles["small"]) for x in row] for row in receipt], colWidths=[1.65 * inch, 5.25 * inch])
    rt.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("GRID", (0, 0), (-1, -1), 0.4, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, colors.HexColor("#F7FAFC")]),
    ]))
    story += [rt, Spacer(1, 0.15 * inch)]
    story.append(Paragraph("The PowerPoint remains the editable source of truth; the MP4 is the fixed self-playing presentation.", styles["callout"]))
    story.append(PageBreak())

    story += [Paragraph("04  /  Integrity + boundaries", styles["eyebrow"]), Paragraph("Portable, inspectable, reversible.", styles["h1"])]
    story.append(Paragraph("Verified source artifacts", styles["h2"]))
    hash_rows = [
        ["File", "SHA-256"],
        ["Momentum-Digital-Sales-Deck.pptx", "9889C0EB9E88532FA4E3F9DAB70E60CCE1BE9614D2B42AC66E10A3D7D787AB45"],
        ["Momentum-Digital-Sales-Deck.pdf", "48C8540AED3E980296AE4E3AB192B74F1A31D9966B19C8ABDC0D5E6A7CCDC32B"],
        ["Momentum-Digital-Sales-Deck.mp4", "84FD6B93D437B27E3F0EFB4032308ACDC073E6CB24FF0404B3913BEBF2830E4C"],
        ["README.md", "88AC85C0EB0FD378EA49C2768D8BB071D9272051BC219393B5E81E319685EA38"],
        ["SOURCES.md", "923B055975FA5093FEB5E49FD7DC889B4887049406467D94064263DFDCF98011"],
        ["SKILLS-REFERENCE.pdf", "F6E5C2BF649D7C141A0482E2D100D0F2F62EDEAF34AB3BA4CC200621E3E51B5E"],
    ]
    ht = Table(
        [[Paragraph(row[0], styles["small"]), Paragraph(row[1], styles["code"])] for row in hash_rows],
        colWidths=[2.45 * inch, 4.45 * inch],
    )
    ht.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("GRID", (0, 0), (-1, -1), 0.4, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story += [ht, Spacer(1, 0.15 * inch)]
    story.append(Paragraph("Operating boundaries", styles["h2"]))
    for item in [
        "The PDF is an instruction artifact. It cannot execute code by itself.",
        "The companion ZIP is the complete transfer payload and must accompany the PDF for real installation.",
        "Install only after the recipient explicitly requests it and the environment permits filesystem changes.",
        "Keep client data, credentials, publication, spending, and external delivery behind the receiving environment's normal approval rules.",
        "Before sharing the deck externally, recheck the sign-off items documented in the bundled README and SOURCES files.",
    ]:
        story.append(bullet(item, styles))
    story.append(Paragraph(
        "The archive's MANIFEST-SHA256.txt is generated after assembly and is the definitive per-file integrity record for this transfer.",
        styles["callout"],
    ))

    doc.build(story)
    print(OUTPUT)


if __name__ == "__main__":
    build_pdf()
