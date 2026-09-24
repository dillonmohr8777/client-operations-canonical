"""Render an AI Search Snapshot report from runs/<host>/snapshot.json.

Momentum design system, read in place. Print-ready at Letter. Every finding
carries its state (verified / pending / not observed) and its evidence, and
the report never scores, ranks or promises.

    python render.py runs/needmomentum.com
"""
from __future__ import annotations

import html
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
KIT = HERE.parent
DS = KIT.parent / "2026-09-05-momentum-design-system" / "tokens"
TOKENS_SOURCE_OF_TRUTH = pathlib.Path(r"C:\Users\dillo\Documents\Codex\momentum-design-system\tokens.css")
E = html.escape

# Fixed 2026-09-07: see build_kit.py for the full note. Local components.css
# only consumes color variables (defines none), so this alias is a safe fix.
TOKEN_ALIAS_FIX = """
:root {
  --m-surface: var(--m-panel);
  --m-on-brand-muted: var(--m-on-brand);
  --m-accent: var(--m-signal);
  --m-on-accent: var(--m-on-signal);
  --m-accent-ink: var(--m-signal-ink);
  --m-accent-on-deep: var(--m-signal);
  --m-accent-on-brand: var(--m-on-brand);
  --m-link: var(--m-brand);
}
"""

STATE_LABEL = {"verified": "Verified now", "pending": "Pending access", "not_observed": "Not observed"}
WEIGHT_LABEL = {"high": "Fix first", "medium": "Fix next", "low": "Tidy", "info": "Observed"}

CSS = """
@page { size: Letter; margin: 14mm; }
.r-wrap { max-width: 186mm; margin: 0 auto; padding-block: var(--m-s-7); }
.r-band { display: inline-block; background: var(--m-accent); color: var(--m-on-accent); font-size: var(--m-fs-micro);
  font-weight: var(--m-weight-bold); text-transform: uppercase; letter-spacing: var(--m-track-caps);
  padding: var(--m-s-2) var(--m-s-4); border-radius: var(--m-r-sm); margin-bottom: var(--m-s-4); }
.r-rule { height: 6px; background: var(--m-accent); width: 5rem; margin-bottom: var(--m-s-4); }
.r-cover { background: var(--m-deep); color: var(--m-on-deep); padding: var(--m-s-8) var(--m-s-7); border-radius: var(--m-r-lg); margin-bottom: var(--m-s-7); }
.r-cover .m-eyebrow { color: var(--m-accent-on-deep); }
.r-cover .m-muted { color: var(--m-on-deep-muted); }
.r-stats { display: flex; flex-wrap: wrap; gap: var(--m-s-6); margin-top: var(--m-s-6); }
.r-stats div b { display: block; font-family: var(--m-font-display); font-size: var(--m-fs-h2); line-height: 1; }
.r-stats div span { font-size: var(--m-fs-micro); text-transform: uppercase; letter-spacing: var(--m-track-caps); font-weight: var(--m-weight-bold); color: var(--m-on-deep-muted); }
.r-f { display: grid; grid-template-columns: 7rem 1fr; gap: var(--m-s-5); padding-block: var(--m-s-4); border-bottom: 1px solid var(--m-line); }
.r-f .tag { font-size: var(--m-fs-micro); text-transform: uppercase; letter-spacing: var(--m-track-caps); font-weight: var(--m-weight-bold); }
.r-f .tag b { display: block; color: var(--m-accent-ink); }
.r-f .tag.pending b { color: var(--m-muted); }
.r-f h3 { margin: 0 0 var(--m-s-2); font-family: var(--m-font-text); font-size: var(--m-fs-body); font-weight: var(--m-weight-bold); text-transform: none; letter-spacing: 0; }
.r-f p { margin: 0 0 var(--m-s-2); font-size: var(--m-fs-sm); }
.r-f pre { margin: 0; font: 11px/1.45 var(--m-font-mono); background: var(--m-surface); padding: var(--m-s-3); border-radius: var(--m-r-sm); white-space: pre-wrap; word-break: break-word; max-height: 12rem; overflow: auto; }
.r-fix { border-left: 3px solid var(--m-accent); padding-left: var(--m-s-3); color: var(--m-ink); }
.r-honest { border-left: 3px solid var(--m-line-strong); padding: var(--m-s-3) 0 var(--m-s-3) var(--m-s-4); font-size: var(--m-fs-sm); color: var(--m-muted); margin-top: var(--m-s-6); }
.r-foot { margin-top: var(--m-s-7); padding-top: var(--m-s-3); border-top: 1px solid var(--m-line); font-size: var(--m-fs-xs); color: var(--m-muted); }
@media print { .r-cover { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .r-f { page-break-inside: avoid; } }
@media (max-width: 640px) { .r-f { grid-template-columns: 1fr; } }
"""


def fetch_table(fetches: dict) -> str:
    rows = "".join(
        f"<tr><td>{E(n)}</td><td class=\"num\">{E(str(v.get('status')))}</td>"
        f"<td>{E(v.get('challenge') or '')}</td><td class=\"num\">{v.get('bytes', 0):,}</td></tr>"
        for n, v in fetches.items())
    return (f'<table class="p-t" style="width:100%;border-collapse:collapse;font-size:var(--m-fs-sm)">'
            f'<thead><tr><th style="text-align:left">Fetched as</th><th style="text-align:left">Status</th>'
            f'<th style="text-align:left">Challenge</th><th style="text-align:left">Bytes</th></tr></thead>'
            f"<tbody>{rows}</tbody></table>")


def finding_html(x: dict) -> str:
    ev = ""
    if x.get("evidence") is not None:
        ev = f"<pre>{E(json.dumps(x['evidence'], indent=1)[:1600])}</pre>"
    fix = f'<p class="r-fix">{E(x["fix"])}</p>' if x.get("fix") else ""
    return f"""
<article class="r-f">
  <div class="tag {E(x['state'])}"><b>{E(STATE_LABEL[x['state']])}</b>{E(WEIGHT_LABEL[x['weight']])}</div>
  <div><h3>{E(x['headline'])}</h3>{fix}{ev}</div>
</article>"""


def render(run_dir: pathlib.Path) -> pathlib.Path:
    snap = json.loads((run_dir / "snapshot.json").read_text(encoding="utf-8"))
    tok = TOKENS_SOURCE_OF_TRUTH.read_text(encoding="utf-8") + TOKEN_ALIAS_FIX
    cmp_ = (DS / "momentum.components.css").read_text(encoding="utf-8")
    pg = snap.get("page") or {}
    s = snap["summary"]
    host = snap["origin"].split("//", 1)[1]
    order = {"high": 0, "medium": 1, "low": 2, "info": 3}
    fs = sorted(snap["findings"], key=lambda x: ({"verified": 0, "not_observed": 1, "pending": 2}[x["state"]], order[x["weight"]]))
    doc = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>AI Search Snapshot: {E(host)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Nunito+Sans:wght@400;600;800&family=Caveat:wght@700&family=IBM+Plex+Mono:wght@400;600&display=swap" rel="stylesheet">
<style>{tok}{cmp_}{CSS}</style>
</head>
<body>
<main class="r-wrap">
  <section class="r-cover">
    <p class="m-eyebrow">AI Search Snapshot &middot; Momentum AI &middot; {E(snap['observed_at'][:10])}</p>
    <h1 class="m-h1">{E(host)}</h1>
    <p class="m-lead m-muted" style="margin-top:var(--m-s-4)">Can the systems that write AI answers read this site, and do they know what the business is? Observed from outside, one fetch per crawler identity, nothing estimated.</p>
    <div class="r-stats">
      <div><b>{s['high']}</b><span>fix first</span></div>
      <div><b>{s['verified']}</b><span>verified findings</span></div>
      <div><b>{s['pending']}</b><span>pending access</span></div>
      <div><b>{s['not_observed']}</b><span>not observed</span></div>
    </div>
  </section>

  <p class="m-eyebrow">What the site says it is</p>
  <p class="m-body" style="font-size:var(--m-fs-sm)"><strong>Title:</strong> {E(pg.get('title') or '(not read)')}<br>
    <strong>H1:</strong> {E('; '.join(pg.get('h1') or []) or '(none)')}<br>
    <strong>Entity types:</strong> {E(', '.join(pg.get('jsonld_types') or []) or '(none)')}<br>
    <strong>Canonical:</strong> {E(pg.get('canonical') or '(none)')} &middot; <strong>lang:</strong> {E(pg.get('lang') or '(none)')}</p>

  <p class="m-eyebrow" style="margin-top:var(--m-s-6)">Who can read it</p>
  {fetch_table(snap['fetches'])}

  <p class="m-eyebrow" style="margin-top:var(--m-s-7)">Findings</p>
  {"".join(finding_html(x) for x in fs)}

  <p class="r-honest"><strong>What this does not do.</strong> It does not score, rank, or predict. It does not scrape any AI engine. What ChatGPT, Perplexity or AI Overviews actually say is observed by a person, twenty frozen questions on two named engines, recorded with date and citations, as the first step of the AI Search Readiness sprint. Anything marked pending stays pending until access exists.</p>

  <p class="r-foot">Momentum AI &middot; Momentum Digital, Philadelphia &middot; Generated by snapshot.py on {E(snap['observed_at'])} &middot;
    Method: {E(snap['method'])} &middot; Next step: needmomentum.com/free-website-seo-audit/</p>
</main>
</body></html>"""
    out = run_dir / "report.html"
    out.write_text(doc, encoding="utf-8")
    return out


def main(argv=None) -> int:
    args = [a for a in (argv or sys.argv[1:]) if not a.startswith("-")]
    if not args:
        print("usage: render.py runs/<host>", file=sys.stderr)
        return 2
    for a in args:
        p = pathlib.Path(a)
        if not p.is_absolute():
            p = HERE / p
        out = render(p)
        print(f"wrote {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
