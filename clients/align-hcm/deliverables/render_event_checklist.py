from __future__ import annotations

import html
import re
from pathlib import Path

import markdown


ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "2026-08-13-align-event-readiness-master-checklist.md"
OUTPUT = ROOT / "2026-08-13-align-event-readiness-master-checklist.html"

FONT_ROOT = (
    Path("C:/Users/dillo/Documents/Codex/projects/client-operations/clients/align-hcm/")
    / "worktrees/align-hcm-vib-design-import-20260722/assets/generated-static/fonts"
)


def font_uri(name: str) -> str:
    return (FONT_ROOT / name).as_uri()


def build() -> None:
    source = SOURCE.read_text(encoding="utf-8")
    content_start = source.index("## Current truth")
    body_source = source[content_start:]
    body_source = re.sub(
        r"^- \[ \] ",
        '- <span class="check" aria-hidden="true"></span> ',
        body_source,
        flags=re.MULTILINE,
    )

    major_breaks = {
        "The first 12 moves",
        "August 14 decision sheet",
        "Master calendar",
        "Dayforce Discover: ownership and budget",
        "Dayforce Discover: required brand and listing assets",
        "Dayforce Discover: registration, travel, and staffing",
        "GTMX: discovery and source-of-truth checklist",
        "GTMX: content and asset package",
        "Separate-event controls",
        "Final readiness gate",
    }
    for heading in major_breaks:
        body_source = body_source.replace(
            f"## {heading}", f'<div class="pagebreak"></div>\n\n## {heading}'
        )

    rendered = markdown.markdown(
        body_source,
        extensions=["tables", "fenced_code", "sane_lists"],
        output_format="html5",
    )

    generated = "August 13, 2026"
    title = "Align HCM Event Readiness Master Checklist"
    html_document = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{html.escape(title)}</title>
  <style>
    @font-face {{
      font-family: "Plus Jakarta Sans";
      src: url("{font_uri('plus-jakarta-sans-600.ttf')}") format("truetype");
      font-weight: 600;
    }}
    @font-face {{
      font-family: "Plus Jakarta Sans";
      src: url("{font_uri('plus-jakarta-sans-800.ttf')}") format("truetype");
      font-weight: 800;
    }}
    @font-face {{
      font-family: "DM Sans";
      src: url("{font_uri('dm-sans-400.ttf')}") format("truetype");
      font-weight: 400;
    }}
    @font-face {{
      font-family: "DM Sans";
      src: url("{font_uri('dm-sans-600.ttf')}") format("truetype");
      font-weight: 600;
    }}

    :root {{
      --navy: #0b1d2d;
      --midnight: #071521;
      --navy-2: #17324d;
      --orange: #f05a28;
      --orange-hot: #ff6b35;
      --paper: #f4efe7;
      --sky: #eaf6fc;
      --green: #159b63;
      --ink: #26394a;
      --muted: #66798a;
      --rule: #d7dfe5;
      --white: #ffffff;
      --amber: #a75b00;
    }}

    @page {{
      size: Letter;
      margin: 0.52in 0.55in 0.58in;
    }}

    * {{ box-sizing: border-box; }}

    html {{ background: #dfe6eb; }}

    body {{
      margin: 0;
      background: var(--white);
      color: var(--ink);
      font: 9.2pt/1.38 "DM Sans", "Segoe UI", Arial, sans-serif;
    }}

    .cover {{
      min-height: 9.9in;
      margin: -0.52in -0.55in -0.58in;
      padding: 0.7in 0.7in 0.62in;
      position: relative;
      overflow: hidden;
      break-after: page;
      color: var(--white);
      background:
        radial-gradient(circle at 87% 15%, rgba(240, 90, 40, .52), transparent 28%),
        radial-gradient(circle at 12% 88%, rgba(21, 155, 99, .24), transparent 31%),
        linear-gradient(145deg, var(--midnight), var(--navy-2) 62%, #0a1723);
    }}

    .cover::after {{
      content: "";
      position: absolute;
      width: 4.5in;
      height: 4.5in;
      right: -1.6in;
      bottom: -1.9in;
      border: 2px solid rgba(255,255,255,.15);
      border-radius: 50%;
      box-shadow: 0 0 0 .46in rgba(255,255,255,.04), 0 0 0 .92in rgba(255,255,255,.03);
    }}

    .brand {{
      display: inline-block;
      color: var(--white);
      font: 800 14pt/1 "Plus Jakarta Sans", sans-serif;
      letter-spacing: .4px;
    }}

    .brand::after {{
      content: "";
      display: block;
      width: .48in;
      height: 4px;
      margin-top: 9px;
      background: var(--orange);
    }}

    .cover-main {{ margin-top: 1.25in; max-width: 6.5in; }}

    .kicker {{
      margin-bottom: .18in;
      color: #ffb69a;
      font: 600 8pt/1.2 "Plus Jakarta Sans", sans-serif;
      letter-spacing: 1.6px;
      text-transform: uppercase;
    }}

    .cover h1 {{
      margin: 0;
      color: var(--white);
      font: 800 31pt/1.05 "Plus Jakarta Sans", sans-serif;
      letter-spacing: -1.2px;
    }}

    .cover .subtitle {{
      margin-top: .28in;
      padding-left: .18in;
      border-left: 5px solid var(--orange);
      color: #dfe8ef;
      font-size: 13pt;
      line-height: 1.42;
    }}

    .cover .truth {{
      max-width: 5.8in;
      margin-top: .46in;
      padding: .18in .2in;
      border: 1px solid rgba(255,255,255,.16);
      border-radius: 12px;
      background: rgba(255,255,255,.08);
      color: #e8eef3;
      font-size: 9.6pt;
    }}

    .cover-meta {{
      position: absolute;
      left: .7in;
      right: .7in;
      bottom: .62in;
      display: grid;
      grid-template-columns: 1.2fr 1fr 1fr;
      gap: .14in;
      z-index: 1;
    }}

    .cover-meta div {{
      padding: .12in .14in;
      border-top: 1px solid rgba(255,255,255,.22);
      color: #b7c6d1;
      font-size: 7.5pt;
    }}

    .cover-meta strong {{
      display: block;
      margin-top: 3px;
      color: var(--white);
      font: 600 9pt/1.3 "Plus Jakarta Sans", sans-serif;
    }}

    main {{ max-width: 100%; }}

    .doc-header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: .2in;
      padding-bottom: .1in;
      border-bottom: 1px solid var(--rule);
      color: var(--muted);
      font-size: 7.3pt;
      letter-spacing: .65px;
      text-transform: uppercase;
    }}

    .doc-header strong {{
      color: var(--navy);
      font-family: "Plus Jakarta Sans", sans-serif;
    }}

    .pagebreak {{ break-after: page; height: 0; }}

    h2, h3 {{
      color: var(--navy);
      font-family: "Plus Jakarta Sans", "Segoe UI", sans-serif;
      font-weight: 800;
      break-after: avoid;
      break-inside: avoid;
    }}

    h2 {{
      margin: .08in 0 .14in;
      padding-top: .02in;
      font-size: 19pt;
      line-height: 1.12;
      letter-spacing: -.35px;
    }}

    h2::before {{
      content: "";
      display: block;
      width: .42in;
      height: 4px;
      margin-bottom: .09in;
      background: var(--orange);
    }}

    h3 {{ margin: .18in 0 .08in; font-size: 11.5pt; line-height: 1.2; }}

    p {{ margin: 0 0 .1in; }}

    ul, ol {{ margin: .04in 0 .16in; padding-left: .24in; }}
    li {{ margin: 0 0 .065in; break-inside: avoid; }}

    ul li::marker {{ color: var(--orange); }}

    .check {{
      display: inline-block;
      width: 11px;
      height: 11px;
      margin: 0 7px 0 -1px;
      vertical-align: -1px;
      border: 1.5px solid #6f8495;
      border-radius: 2px;
      background: #fff;
    }}

    strong {{ color: var(--navy); font-weight: 600; }}

    code {{
      color: #44586a;
      font: 7.6pt/1.35 Consolas, monospace;
      overflow-wrap: anywhere;
    }}

    table {{
      width: 100%;
      margin: .08in 0 .18in;
      border-collapse: collapse;
      table-layout: fixed;
      font-size: 7.45pt;
      line-height: 1.3;
    }}

    thead {{ display: table-header-group; }}
    tr {{ break-inside: avoid; }}

    th {{
      padding: 7px 7px;
      border: 1px solid var(--navy-2);
      background: var(--navy);
      color: var(--white);
      text-align: left;
      font: 600 7.15pt/1.25 "Plus Jakarta Sans", sans-serif;
      letter-spacing: .25px;
      text-transform: uppercase;
    }}

    td {{
      padding: 6px 7px;
      border: 1px solid var(--rule);
      vertical-align: top;
      overflow-wrap: anywhere;
    }}

    tbody tr:nth-child(even) td {{ background: #f7fafc; }}

    th:nth-child(1), td:nth-child(1) {{ width: 15%; }}
    th:nth-child(2), td:nth-child(2) {{ width: 14%; }}
    th:nth-child(4), td:nth-child(4) {{ width: 22%; }}

    blockquote {{
      margin: .14in 0;
      padding: .12in .15in;
      border-left: 4px solid var(--orange);
      background: var(--paper);
      color: #4e6171;
    }}

    h2:first-of-type + ul {{
      padding: .16in .2in .12in .34in;
      border: 1px solid #c8dde7;
      border-radius: 12px;
      background: var(--sky);
    }}

    h2:last-of-type ~ p:last-child {{
      padding: .13in .16in;
      border-left: 4px solid var(--orange);
      background: #fff3ec;
    }}

    @media print {{
      html, body {{ background: #fff; }}
      a {{ color: inherit; text-decoration: none; }}
    }}
  </style>
</head>
<body>
  <section class="cover">
    <div class="brand">ALIGN HCM</div>
    <div class="cover-main">
      <div class="kicker">Event operations / master working checklist</div>
      <h1>UKG GTMX +<br>Dayforce Discover 2026</h1>
      <div class="subtitle">One decision sheet, deadline calendar, production checklist, onsite plan, and follow-up gate for both events.</div>
      <div class="truth"><strong style="color:#fff">Dayforce is execution-ready.</strong> The current Silver booth plan and hard deadlines are confirmed. <strong style="color:#fff">GTMX still needs its 2026 source packet.</strong> The checklist begins by forcing those missing facts into the August 14 planning session.</div>
    </div>
    <div class="cover-meta">
      <div>Prepared for<strong>Align HCM</strong></div>
      <div>Prepared<strong>{generated}</strong></div>
      <div>Working session<strong>Aug 14 / 9:00 a.m.</strong></div>
    </div>
  </section>
  <main>
    <div class="doc-header"><strong>Align HCM</strong><span>Event readiness master checklist / {generated}</span></div>
    {rendered}
  </main>
</body>
</html>
"""
    OUTPUT.write_text(html_document, encoding="utf-8", newline="\n")


if __name__ == "__main__":
    build()
