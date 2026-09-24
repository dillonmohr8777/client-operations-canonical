"""Generate the Friday decision sheet from pending-decisions.json.
Never hand-type the D01-D20 table -- this script is the single source.
Usage: python build_decision_sheet.py
Writes decision-sheet.html beside this script.
"""
import json
from pathlib import Path
from datetime import date

HERE = Path(__file__).parent
KIT = HERE.parent / "2026-09-05-ai-division-launch-kit"
TOKENS_CSS = r"C:\Users\dillo\Documents\Codex\momentum-design-system\tokens.css"

data = json.loads((KIT / "pending-decisions.json").read_text(encoding="utf-8"))
decisions = data["decisions"]
assert len(decisions) == 20, f"expected 20 decisions, found {len(decisions)}"

rows = []
for d in decisions:
    blocks = ", ".join(d.get("blocks", [])) or "&mdash;"
    rows.append(f"""
    <tr>
      <td class="id">{d['id']}</td>
      <td class="topic">{d['topic']}</td>
      <td class="q">{d['question']}</td>
      <td class="proposed">{d['proposed']}</td>
      <td class="owner">{d['owner']}</td>
      <td class="blocks">{blocks}</td>
      <td class="sign"></td>
    </tr>""")

html = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Momentum AI Division &mdash; Friday decision sheet</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Nunito+Sans:wght@400;700;800&display=swap">
<link rel="stylesheet" href="file:///{TOKENS_CSS.replace(chr(92), '/')}">
<style>
  @page {{ size: Letter; margin: 16mm 14mm; }}
  * {{ box-sizing: border-box; }}
  body {{ margin: 0; font-family: 'Nunito Sans', 'Segoe UI', system-ui, sans-serif; color: var(--m-ink); background: var(--m-paper); font-size: 9.5pt; }}
  h1 {{ font-family: 'Archivo Black', 'Arial Black', Impact, sans-serif; font-size: 20pt; letter-spacing: -0.01em; margin: 0 0 2pt; }}
  .sub {{ color: var(--m-muted); font-size: 9pt; margin-bottom: 10pt; }}
  .meta {{ display: flex; justify-content: space-between; font-size: 8.5pt; color: var(--m-muted); border-bottom: 1px solid var(--m-line-strong); padding-bottom: 8pt; margin-bottom: 10pt; }}
  table {{ width: 100%; border-collapse: collapse; }}
  th {{ text-align: left; font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.06em; color: var(--m-brand); border-bottom: 1.5px solid var(--m-line-strong); padding: 4pt 5pt; }}
  td {{ vertical-align: top; padding: 5pt 5pt; border-bottom: 0.75px solid var(--m-line); font-size: 8.5pt; line-height: 1.35; }}
  td.id {{ font-weight: 800; color: var(--m-brand); white-space: nowrap; }}
  td.topic {{ font-weight: 700; white-space: nowrap; max-width: 70pt; }}
  td.owner {{ white-space: nowrap; color: var(--m-muted); }}
  td.blocks {{ color: var(--m-muted); font-size: 7.8pt; }}
  td.sign {{ width: 46pt; border-left: 1px solid var(--m-line); }}
  tr {{ page-break-inside: avoid; }}
  .foot {{ margin-top: 10pt; font-size: 8pt; color: var(--m-muted); }}
</style>
</head>
<body>
  <h1>Momentum AI Division &mdash; decision sheet</h1>
  <div class="sub">Every row here is generated from <code>pending-decisions.json</code>. Nothing on this page is agreed until it is signed.</div>
  <div class="meta">
    <span>For the meeting: {data.get('meeting', 'Friday, 2026-09-11')}</span>
    <span>Prepared {data.get('prepared', '')}{" &middot; revised " + data['revised'] if data.get('revised') else ""}</span>
    <span>Generated {date.today().isoformat()}</span>
  </div>
  <table>
    <thead><tr><th>#</th><th>Topic</th><th>Question</th><th>Proposed</th><th>Owner</th><th>Blocks</th><th>Sign</th></tr></thead>
    <tbody>{''.join(rows)}</tbody>
  </table>
  <div class="foot">{data.get('status_note', 'All rows are proposals, not agreements, until signed above.')}</div>
</body>
</html>"""

out = HERE / "decision-sheet.html"
out.write_text(html, encoding="utf-8")
print(f"wrote {out} ({len(decisions)} decisions)")
