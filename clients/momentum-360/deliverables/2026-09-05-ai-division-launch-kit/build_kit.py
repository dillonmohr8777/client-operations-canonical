"""Build the AI division launch kit from offers.json (v2, lanes) +
pending-decisions.json + economics-v2.json.

Styling comes from the design system, read in place - not copied - so the kit
cannot drift from the tokens:

    ../2026-09-05-momentum-design-system/tokens/momentum.tokens.css
    ../2026-09-05-momentum-design-system/tokens/momentum.components.css

Emits:
    index.html        the internal launch page (screen)
    one-pagers.html   five print-ready sheets: division summary + four flagships

The builder refuses to emit if the PROPOSED marking is missing, because the
one thing this collateral must never do is read as agreed terms.

    python economics_v2.py && python build_kit.py
"""
from __future__ import annotations

import html
import json
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent
DS = HERE.parent / "2026-09-05-momentum-design-system" / "tokens"
TOKENS_SOURCE_OF_TRUTH = pathlib.Path(r"C:\Users\dillo\Documents\Codex\momentum-design-system\tokens.css")
DATE = "2026-09-05"
E = html.escape
sys.path.insert(0, str(HERE.parent / "_print"))
from momentum_print import LOGO, document, to_pdf  # noqa: E402

# Fixed 2026-09-07: this kit's local tokens.css had forked into its own palette
# (--m-brand #1e73be, --m-accent #f58320) instead of the decided source of
# truth (--m-brand #155E86, --m-signal #E27113). Local components.css only
# CONSUMES color variables (verified: it defines none), so aliasing the old
# names to the real tokens fixes every color reference without touching it.
TOKEN_ALIAS_FIX = """
:root {
  /* Alias to the source-of-truth tokens above; never redefine a hex here. */
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

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">'
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Nunito+Sans:wght@400;600;800'
         '&family=Caveat:wght@700&family=IBM+Plex+Mono:wght@400;600&display=swap" rel="stylesheet">')


def load():
    offers = json.loads((HERE / "offers.json").read_text(encoding="utf-8"))
    decisions = json.loads((HERE / "pending-decisions.json").read_text(encoding="utf-8"))
    econ = json.loads((HERE / "economics-v2.json").read_text(encoding="utf-8"))
    assert offers["schema"] == "momentum-offers/2"
    assert "PROPOSED" in offers["status"], "offers.json must carry the PROPOSED marking"
    assert all(d["state"] == "open" for d in decisions["decisions"]), \
        "a decision marked agreed must be evidenced, not asserted here"
    assert econ["state"] == "ASSUMPTIONS_ONLY_NOT_FORECAST"
    return offers, decisions, econ


def css() -> str:
    tok = TOKENS_SOURCE_OF_TRUTH.read_text(encoding="utf-8")
    cmp_ = (DS / "momentum.components.css").read_text(encoding="utf-8")
    return (
        f"/* tokens: read in place from {TOKENS_SOURCE_OF_TRUTH} */\n{tok}\n"
        f"{TOKEN_ALIAS_FIX}\n"
        f"/* components: read in place from {DS.name}/ */\n{cmp_}"
    )


PAGE_CSS = """
.k-status { background: var(--m-accent); color: var(--m-on-accent);
  font-weight: var(--m-weight-bold); font-size: var(--m-fs-sm);
  padding: var(--m-s-3) var(--m-gutter); text-align: center; letter-spacing: .02em; }
.k-skip { position: absolute; left: -9999px; }
.k-skip:focus { left: var(--m-s-4); top: var(--m-s-4); z-index: 40;
  background: var(--m-accent); color: var(--m-on-accent);
  padding: var(--m-s-3) var(--m-s-5); border-radius: var(--m-r-pill); }
.k-h5 { font-size: var(--m-fs-micro); text-transform: uppercase;
  letter-spacing: var(--m-track-caps); font-weight: var(--m-weight-bold);
  color: var(--m-muted); margin: 0 0 var(--m-s-3); }
.k-note { font-size: var(--m-fs-sm); color: var(--m-muted); max-width: var(--m-measure); }
.k-list { margin: 0; padding-left: 1.1rem; display: grid; gap: var(--m-s-2); font-size: var(--m-fs-sm); }
.k-list.k-out li::marker { color: var(--m-danger); }
.k-honest { border-left: 3px solid var(--m-line-strong);
  padding: var(--m-s-3) 0 var(--m-s-3) var(--m-s-4);
  font-size: var(--m-fs-sm); color: var(--m-muted); margin-top: var(--m-s-5); }
.k-cols { display: grid; grid-template-columns: 1fr 1fr; gap: var(--m-s-6); }
@media (max-width: 700px) { .k-cols { grid-template-columns: 1fr; } }

/* lockup: the verified mark is an image; the word AI is type. Never a new logo. */
.k-lockup { display: inline-flex; align-items: baseline; gap: .35em;
  font-family: var(--m-font-display); text-transform: uppercase; letter-spacing: .02em; }
/* the AI word takes the accent that is legal on the ground it sits on:
   accent-ink on paper (6.18:1), accent-on-deep on deep/nav (8.51:1),
   accent-on-brand on the footer gradient's worst stop (3.14:1, large) */
.k-lockup b { color: var(--m-accent-ink); font-weight: 400; }
.m-nav .k-lockup b, .m-hero .k-lockup b, .m-section--deep .k-lockup b { color: var(--m-accent-on-deep); }
.m-footer .k-lockup b { color: var(--m-accent-on-brand); }

/* the finding: one big number, one sentence */
.k-finding { display: grid; grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); gap: var(--m-s-7); align-items: end; }
@media (max-width: 860px) { .k-finding { grid-template-columns: 1fr; } }
.k-big { font-family: var(--m-font-display); font-size: var(--m-fs-display); line-height: .9;
  color: var(--m-accent-on-deep); margin: 0; }
.k-big small { display: block; font-family: var(--m-font-text); font-size: var(--m-fs-micro);
  letter-spacing: var(--m-track-caps); text-transform: uppercase; color: var(--m-on-deep-muted); margin-top: var(--m-s-3); }

/* lanes: each lane is a numbered band; the flagship split alternates */
.k-lane { padding-block: var(--m-s-8); border-top: 3px solid var(--m-line-strong); }
.k-lane__head { display: grid; grid-template-columns: 5rem 1fr; gap: var(--m-s-5); align-items: baseline; margin-bottom: var(--m-s-6); }
.k-lane__n { font-family: var(--m-font-display); font-size: var(--m-fs-h1); line-height: 1; color: var(--m-accent-ink); }
.k-lane__line { font-family: var(--m-font-script); font-size: var(--m-fs-h3); color: var(--m-accent-ink);
  display: inline-block; transform: rotate(-2deg); margin-left: .4em; }
.k-flag { display: grid; grid-template-columns: 4fr 6fr; gap: var(--m-s-7); align-items: start; }
.k-lane:nth-of-type(even) .k-flag { grid-template-columns: 6fr 4fr; }
.k-lane:nth-of-type(even) .k-flag__aside { order: 2; }
@media (max-width: 900px) { .k-flag, .k-lane:nth-of-type(even) .k-flag { grid-template-columns: 1fr; }
  .k-lane:nth-of-type(even) .k-flag__aside { order: 0; } .k-lane__head { grid-template-columns: 3.5rem 1fr; } }
.k-price { display: flex; flex-wrap: wrap; gap: var(--m-s-5); margin: var(--m-s-5) 0; }
.k-price div { border-left: 3px solid var(--m-accent); padding-left: var(--m-s-4); }
.k-price b { display: block; font-family: var(--m-font-display); font-size: var(--m-fs-h3); line-height: 1; }
.k-price span { font-size: var(--m-fs-micro); text-transform: uppercase; letter-spacing: var(--m-track-caps);
  font-weight: var(--m-weight-bold); color: var(--m-muted); }
.k-agent { background: var(--m-surface); border-radius: var(--m-r-md); padding: var(--m-s-4) var(--m-s-5);
  font-size: var(--m-fs-sm); margin-top: var(--m-s-5); }
.k-agent b { display: block; font-size: var(--m-fs-micro); text-transform: uppercase; letter-spacing: var(--m-track-caps); color: var(--m-accent-ink); margin-bottom: var(--m-s-2); }
.k-next { margin-top: var(--m-s-7); display: grid; grid-template-columns: minmax(0, 12rem) 1fr auto; gap: var(--m-s-5);
  align-items: center; padding: var(--m-s-4) 0; border-top: 1px dashed var(--m-line-strong); font-size: var(--m-fs-sm); }
.k-next .k-h5 { margin: 0; }
.k-next em { font-style: normal; font-weight: var(--m-weight-bold); }
.k-next .price { font-family: var(--m-font-mono); white-space: nowrap; }
@media (max-width: 760px) { .k-next { grid-template-columns: 1fr; } }

.k-t { border-collapse: collapse; width: 100%; font-size: var(--m-fs-sm); }
.k-t th, .k-t td { text-align: left; padding: var(--m-s-3) var(--m-s-4); border-bottom: 1px solid var(--m-line); vertical-align: top; }
.k-t th { font-size: var(--m-fs-micro); text-transform: uppercase; letter-spacing: var(--m-track-caps); color: var(--m-muted); }
.k-t td.min { white-space: nowrap; font-family: var(--m-font-mono); font-variant-numeric: tabular-nums; }
.k-wrapx { overflow-x: auto; }

.k-dec article { display: grid; grid-template-columns: 4rem 1fr 9rem; gap: var(--m-s-4); padding-block: var(--m-s-4);
  border-bottom: 1px solid var(--m-line); align-items: start; }
.k-dec .id { font-family: var(--m-font-mono); font-weight: 600; color: var(--m-accent-ink); }
.k-dec .who { font-size: var(--m-fs-xs); color: var(--m-muted); text-align: right; }
.k-dec h3 { font-size: var(--m-fs-body); margin: 0 0 var(--m-s-2); font-family: var(--m-font-text);
  font-weight: var(--m-weight-bold); text-transform: none; letter-spacing: 0; }
.k-dec p { margin: 0 0 var(--m-s-2); font-size: var(--m-fs-sm); }
.k-open { display: inline-block; font-size: var(--m-fs-micro); text-transform: uppercase; letter-spacing: var(--m-track-caps);
  font-weight: var(--m-weight-bold); color: var(--m-danger); border: 1px solid currentColor; border-radius: var(--m-r-sm); padding: .1rem .4rem; }
@media (max-width: 760px) { .k-dec article { grid-template-columns: 3rem 1fr; } .k-dec .who { grid-column: 2; text-align: left; } }

.k-obj { display: grid; gap: var(--m-s-5); }
.k-obj div { display: grid; grid-template-columns: minmax(0, 20rem) 1fr; gap: var(--m-s-5); padding-bottom: var(--m-s-4); border-bottom: 1px solid var(--m-line); }
.k-obj q { font-weight: var(--m-weight-bold); font-style: italic; }
@media (max-width: 800px) { .k-obj div { grid-template-columns: 1fr; gap: var(--m-s-2); } }

.k-timeline div { display: grid; grid-template-columns: 10rem 1fr; gap: var(--m-s-5); padding-block: var(--m-s-4); border-bottom: 1px solid var(--m-on-deep-muted); }
.k-timeline b { font-family: var(--m-font-display); text-transform: uppercase; font-size: var(--m-fs-sm); letter-spacing: var(--m-track-caps); }
@media (max-width: 700px) { .k-timeline div { grid-template-columns: 1fr; gap: var(--m-s-2); } }

.k-opener { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: var(--m-s-7); }
@media (max-width: 860px) { .k-opener { grid-template-columns: 1fr; } }
"""

PRINT_CSS = """
@page { size: Letter; margin: 14mm 14mm 16mm; }
body { background: #fff; }
.s-sheet { max-width: 186mm; margin: 0 auto var(--m-s-10); padding-bottom: var(--m-s-8); border-bottom: 2px solid var(--m-line-strong); }
.s-sheet:last-child { border-bottom: 0; }
.s-rule { height: 6px; background: var(--m-accent); width: 5rem; margin-bottom: var(--m-s-4); }
.s-band { background: var(--m-accent); color: var(--m-on-accent); font-size: var(--m-fs-micro); font-weight: var(--m-weight-bold);
  text-transform: uppercase; letter-spacing: var(--m-track-caps); padding: var(--m-s-2) var(--m-s-4); border-radius: var(--m-r-sm);
  display: inline-block; margin-bottom: var(--m-s-4); }
.s-foot { margin-top: var(--m-s-6); padding-top: var(--m-s-3); border-top: 1px solid var(--m-line); font-size: var(--m-fs-xs); color: var(--m-muted); }
.s-lanes { border-collapse: collapse; width: 100%; font-size: var(--m-fs-sm); margin-top: var(--m-s-5); }
.s-lanes th, .s-lanes td { text-align: left; padding: var(--m-s-3) var(--m-s-3); border-bottom: 1px solid var(--m-line); vertical-align: top; }
.s-lanes th { font-size: var(--m-fs-micro); text-transform: uppercase; letter-spacing: var(--m-track-caps); color: var(--m-muted); }
@media print {
  .s-sheet { page-break-after: always; border-bottom: 0; margin-bottom: 0; }
  .s-sheet:last-child { page-break-after: auto; }
  .k-honest, .s-band, .k-agent { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .noprint { display: none !important; }
}
"""


def lis(items, cls="k-list"):
    return f'<ul class="{cls}">' + "".join(f"<li>{E(x)}</li>" for x in items) + "</ul>"


def lockup(cls=""):
    return f'<span class="k-lockup {cls}">Momentum <b>AI</b></span>'


def price_block(f):
    monthly = (f'<div><b>{E(f["monthly"])}</b><span>per month &middot; proposed</span></div>' if f["monthly"]
               else f'<div><b>{E(f["monthly_note"])}</b><span>proposed</span></div>')
    return f'<div class="k-price"><div><b>{E(f["setup"])}</b><span>setup &middot; proposed</span></div>{monthly}</div>'


def lane_block(lane):
    f = lane["flagship"]
    nxt = lane["next"]
    note = f'{E(f["setup_hours"])}. Then {E(f["recurring_hours"])}.'
    if f["monthly"] and f["monthly_note"]:
        note += f' Monthly is {E(f["monthly_note"])}.'
    return f"""
<section class="k-lane" id="lane-{E(lane['id'])}">
  <div class="k-lane__head">
    <div class="k-lane__n">{E(lane['n'])}</div>
    <div><h2 class="m-h3" style="display:inline">{E(lane['name'])}</h2>
      <span class="k-lane__line">{E(lane['line'])}</span></div>
  </div>
  <article class="k-flag">
    <div class="k-flag__aside">
      <p class="k-h5">Launch flagship</p>
      <h3 class="m-h4" style="font-size:var(--m-fs-h3);font-family:var(--m-font-display);text-transform:uppercase;letter-spacing:var(--m-track-display)">{E(f['name'])}</h3>
      <p class="m-body" style="margin-top:var(--m-s-4)">{E(f['outcome'])}</p>
      {price_block(f)}
      <p class="k-note">{note}</p>
      <div class="k-agent"><b>Ships with its agent</b>{E(f['agent'])}<br>
        <span style="color:var(--m-accent-ink);font-weight:var(--m-weight-bold)">Target:</span> {E(f['hours_target'])}</div>
    </div>
    <div>
      <div class="k-cols">
        <div><p class="k-h5">Included</p>{lis(f['included'])}</div>
        <div><p class="k-h5">Not included</p>{lis(f['excluded'], 'k-list k-out')}</div>
      </div>
      <p class="k-h5" style="margin-top:var(--m-s-6)">Acceptance</p>
      <p class="m-body" style="font-size:var(--m-fs-sm)">{E(f['acceptance'])}</p>
      <p class="k-h5" style="margin-top:var(--m-s-5)">Customer dependencies</p>
      <p class="m-body" style="font-size:var(--m-fs-sm)">{E(f['dependencies'])} {E(f['clock'])}</p>
      <p class="k-h5" style="margin-top:var(--m-s-5)">Already proven</p>
      <p class="m-body" style="font-size:var(--m-fs-sm)">{E(f['proof'])}</p>
      <p class="k-h5" style="margin-top:var(--m-s-5)">Priced against</p>
      {lis(f['anchors'])}
      <p class="k-honest"><strong>What we will not claim.</strong> {E(f['honesty'])}</p>
    </div>
  </article>
  <div class="k-next">
    <p class="k-h5">Roadmap &middot; next</p>
    <p style="margin:0"><em>{E(nxt['name'])}.</em> {E(nxt['summary'])}</p>
    <span class="price">{E(nxt['price'])} &middot; proposed</span>
  </div>
</section>"""


def decision_rows(decisions):
    out = []
    for d in decisions["decisions"]:
        note = f'<p class="k-note">{E(d["note"])}</p>' if d.get("note") else ""
        out.append(f"""
<article>
  <div class="id">{E(d['id'])}</div>
  <div>
    <h3>{E(d['topic'])}</h3>
    <p>{E(d['question'])}</p>
    <p class="k-note"><strong>Proposed:</strong> {E(d['proposed'])}</p>
    {note}
    <p class="k-note"><strong>Blocks:</strong> {E(", ".join(d.get("blocks", [])))}</p>
  </div>
  <div class="who"><span class="k-open">Open</span><br>{E(d['owner'])}</div>
</article>""")
    return "\n".join(out)


def econ_rows(econ):
    rows = []
    for s in econ["scenarios"]:
        rows.append(f'<tr><td>{E(s["scenario"])}</td><td class="min">${s["monthly_revenue"]:,}</td>'
                    f'<td class="min">{s["monthly_delivery_hours"]}</td><td class="min">${s["monthly_contribution"]:,.0f}</td></tr>')
    sb = econ["spec_build_one_time"]
    rows.append(f'<tr><td>Plus one Spec build in the month</td><td class="min">+${sb["price"]:,} once</td>'
                f'<td class="min">+{sb["hours"]}</td><td class="min">+${sb["contribution_before_fixed_cost"]:,.0f} once</td></tr>')
    return "".join(rows)


def build_index(offers, decisions, econ) -> str:
    dv, op, fn = offers["division"], offers["opener"], offers["finding_241"]
    disc = "".join(f'<tr><td class="min">{E(a)} min</td><td>{E(b)}</td></tr>' for a, b in offers["discovery"])
    obj = "".join(f"<div><q>{E(q)}</q><p>{E(a)}</p></div>" for q, a in offers["objections"])
    week = "".join(f"<div><b>{E(a)}</b><p>{E(b)}</p></div>" for a, b in offers["week"])
    sc = offers["scoring"]
    n_open = len(decisions["decisions"])
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Momentum AI: Launch Kit</title>
{FONTS}
<style>{css()}{PAGE_CSS}</style>
</head>
<body>
<a class="k-skip" href="#main">Skip to content</a>
<p class="k-status">Internal. Every price, hour budget, capacity figure and support term below is a
  <strong>proposal</strong> until recorded as agreed. No contract, outreach or account change is implied.</p>

<header class="m-nav">
  <div class="m-wrap m-nav__in">
    <div class="m-nav__brand"><span class="m-nav__caption">{lockup()}</span></div>
    <nav aria-label="Sections"><ul class="m-nav__links">
      <li><a href="#finding">The finding</a></li>
      <li><a href="#opener">Opener</a></li>
      <li><a href="#lanes">Four lanes</a></li>
      <li><a href="#decisions">Decisions</a></li>
    </ul></nav>
    <a class="m-btn m-btn--sm" href="#decisions">{n_open} open</a>
  </div>
</header>

<main id="main">
<section class="m-hero">
  <div class="m-wrap m-hero__grid">
    <div>
      <div class="m-hero__rule"></div>
      <p class="m-eyebrow">{E(dv['parent'])} &middot; for Friday {E(decisions['meeting'].split()[-1])}</p>
      <h1 class="m-display">Four lanes.<br>One machine.</h1>
      <p class="m-lead" style="margin-top:var(--m-s-5);color:var(--m-on-deep)">{E(dv['positioning'])}</p>
      <p class="m-body m-muted" style="margin-top:var(--m-s-4)">{E(dv['positioning_note'])}</p>
    </div>
    <div>
      <p class="m-script" style="font-size:var(--m-fs-h2)">The thesis</p>
      <p class="m-lead" style="color:var(--m-on-deep);margin-top:var(--m-s-4);font-size:var(--m-fs-h4)">{E(dv['thesis'])}</p>
      <p style="margin-top:var(--m-s-5)"><a class="m-btn m-btn--ghost m-btn--sm" href="#lanes">See the four lanes</a></p>
    </div>
  </div>
</section>

<section class="m-section m-section--deep" id="finding">
  <div class="m-wrap k-finding">
    <div>
      <p class="m-eyebrow">Mac asked on September 4: has outbound started?</p>
      <p class="k-big">241 <small>cold emails sent, September 2&ndash;3</small></p>
      <p class="k-big" style="margin-top:var(--m-s-5);color:var(--m-on-deep)">0 <small>verified human replies</small></p>
    </div>
    <div>
      <p class="m-body" style="color:var(--m-on-deep)">{E(fn['contrast'])}</p>
      <p class="m-body" style="color:var(--m-on-deep-muted);margin-top:var(--m-s-4)">{E(fn['implication'])}</p>
      <p class="k-note" style="color:var(--m-on-deep-muted);margin-top:var(--m-s-4)">{E(fn['detail'])}</p>
    </div>
  </div>
</section>

<section class="m-section m-section--surface" id="opener">
  <div class="m-wrap k-opener">
    <div>
      <p class="m-eyebrow">The opener &middot; {E(op['price'])}</p>
      <h2 class="m-h2">{E(op['name'])}</h2>
      <p class="m-lead" style="margin-top:var(--m-s-4)">{E(op['what'])}</p>
    </div>
    <div>
      <p class="k-h5">Why this and not cold email</p>
      <p class="m-body" style="font-size:var(--m-fs-sm)">{E(op['why'])}</p>
      <p class="k-h5" style="margin-top:var(--m-s-5)">Engine</p>
      <p class="m-body" style="font-size:var(--m-fs-sm)">{E(op['engine'])} {E(op['cap'])}</p>
      <p class="k-honest"><strong>Never.</strong> {E(op['never'])}</p>
    </div>
  </div>
</section>

<section class="m-section" id="lanes">
  <div class="m-wrap">
    <div class="m-head m-head--split">
      <div><p class="m-eyebrow">{E(dv['lanes_source'])}</p>
        <h2 class="m-h2">Four lanes, four flagships,<br>four on the roadmap</h2></div>
      <p class="k-note">Mac named the lanes. Behind each one sits one launch-ready offer and one next offer.
        Every flagship names what it excludes as precisely as what it includes, ships with its agent,
        and carries an hours-per-client target that is measured.</p>
    </div>
    {"".join(lane_block(l) for l in offers['lanes'])}
  </div>
</section>

<section class="m-section m-section--surface" id="discovery">
  <div class="m-wrap">
    <p class="m-eyebrow">Qualification</p>
    <h2 class="m-h2" style="margin-bottom:var(--m-s-6)">Twenty minutes</h2>
    <div class="k-wrapx"><table class="k-t">
      <caption class="k-skip">Twenty-minute discovery script</caption>
      <thead><tr><th scope="col">Minute</th><th scope="col">Questions and evidence</th></tr></thead>
      <tbody>{disc}</tbody></table></div>
    <div class="k-cols" style="margin-top:var(--m-s-7)">
      <div><p class="k-h5">Score 0&ndash;2 on each</p>{lis(sc['axes'])}
        <p class="k-note" style="margin-top:var(--m-s-3)">{E(sc['rule'])}</p><p class="k-honest">{E(sc['caveat'])}</p></div>
      <div><p class="k-h5">Disqualify or defer</p>{lis(offers['disqualify'], 'k-list k-out')}
        <p class="k-note" style="margin-top:var(--m-s-3)">{E(offers['disqualify_note'])}</p></div>
    </div>
  </div>
</section>

<section class="m-section" id="objections">
  <div class="m-wrap">
    <div class="m-head m-head--split">
      <div><p class="m-eyebrow">The demo, and the ten answers</p>
        <h2 class="m-h2"><span class="m-strike"><s>Handling</s></span> <span class="m-script">answering</span> objections</h2></div>
      <p class="k-note">{E(offers['demo']['snapshot'])} Then the lead-ops demo: &ldquo;{E(offers['demo']['opening'])}&rdquo;
        {E(offers['demo']['rule'])}</p>
    </div>
    <div class="k-obj">{obj}</div>
  </div>
</section>

<section class="m-section m-section--deep">
  <div class="m-wrap">
    <p class="m-eyebrow">Sequence</p>
    <h2 class="m-h2" style="margin-bottom:var(--m-s-6)">Dependency order, not a promise</h2>
    <div class="k-timeline">{week}</div>
  </div>
</section>

<section class="m-section m-section--surface">
  <div class="m-wrap">
    <p class="m-eyebrow">Economics</p>
    <h2 class="m-h2" style="margin-bottom:var(--m-s-4)">Under the pack&rsquo;s own assumptions</h2>
    <p class="k-note" style="margin-bottom:var(--m-s-5)">{E(offers['economics']['assumptions'])}</p>
    <div class="k-wrapx"><table class="k-t">
      <caption class="k-skip">Modelled contribution under stated assumptions</caption>
      <thead><tr><th scope="col">Scenario</th><th scope="col">Monthly revenue</th><th scope="col">Hours</th><th scope="col">Contribution</th></tr></thead>
      <tbody>{econ_rows(econ)}</tbody></table></div>
    <p class="k-note" style="margin-top:var(--m-s-4)">{E(offers['economics']['math'])}</p>
    <p class="k-honest">{E(offers['economics']['caveat'])}</p>
  </div>
</section>

<section class="m-section" id="decisions">
  <div class="m-wrap">
    <div class="m-head m-head--split">
      <div><p class="m-eyebrow">Before anything is sold</p><h2 class="m-h2">{n_open} open decisions</h2></div>
      <p class="k-note">{E(decisions['status_note'])}</p>
    </div>
    <div class="k-dec">{decision_rows(decisions)}</div>
  </div>
</section>
</main>

<footer class="m-footer">
  <div class="m-wrap">
    <p class="m-script">Decide, then</p>
    <h2 class="m-h2" style="margin-top:var(--m-s-3)">Build theirs</h2>
    <p class="m-lead" style="color:var(--m-on-brand-muted);margin-top:var(--m-s-5)">Nothing on this page goes to a buyer until the register above is closed.</p>
    <div class="m-footer__rule"></div>
    <div class="m-footer__fine">
      <span>{lockup()} &middot; Momentum Digital &middot; Philadelphia</span>
      <span>Generated {E(DATE)} from offers.json v2 + pending-decisions.json + economics-v2.json</span>
      <span>Styling: 2026-09-05-momentum-design-system &middot; private, noindex</span>
    </div>
  </div>
</footer>
</body></html>"""


SHEET_CSS = """
.sheet { break-after: page; padding: var(--m-s-7) var(--m-gutter) 0; }
.sheet:last-child { break-after: auto; }
.sheet__top { display: flex; justify-content: space-between; align-items: center; gap: var(--m-s-5); padding-bottom: var(--m-s-4); border-bottom: 2px solid var(--m-ink); }
.sheet__top .brand-logo { width: 11rem; }
.band { background: var(--m-signal); color: var(--m-on-signal); padding: var(--m-s-2) var(--m-s-4); border-radius: var(--m-r-pill); font-size: var(--m-fs-xs); font-weight: 800; letter-spacing: var(--m-track-caps); text-transform: uppercase; white-space: nowrap; }
.sheet .eyebrow { color: var(--m-signal-ink); margin-top: var(--m-s-5); }
.sheet h1 { font-size: var(--m-fs-h1); margin-top: var(--m-s-2); }
.sheet h1 b { color: var(--m-brand); font-weight: 400; }
.sheet .lead { margin-top: var(--m-s-3); max-width: 44rem; }
.split { display: grid; grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr); gap: var(--m-s-6); margin-top: var(--m-s-2); align-items: start; }
.sheet .label { color: var(--m-muted); display: block; margin-bottom: var(--m-s-2); }
.sheet p + .label, .sheet ul + .label, .cols + .label { margin-top: var(--m-s-4); }
.small { font-size: var(--m-fs-sm); }
.cols { display: grid; grid-template-columns: 1fr 1fr; gap: var(--m-s-6); }
.cols.rule { margin-top: var(--m-s-4); padding-top: var(--m-s-4); border-top: 1px solid var(--m-line); }
.list { list-style: none; padding: 0; font-size: var(--m-fs-sm); }
.list li { padding: 2px 0 2px 1rem; position: relative; line-height: 1.45; }
.list li::before { content: ""; position: absolute; left: 0; top: .72em; width: .4rem; height: .4rem; border-radius: var(--m-r-pill); background: var(--m-brand); }
.list.out li::before { background: none; box-shadow: inset 0 0 0 1.5px var(--m-line-strong); }
.band3 { display: grid; grid-template-columns: auto auto minmax(0, 1fr); gap: var(--m-s-6); align-items: start; margin-top: var(--m-s-5); padding: var(--m-s-5) var(--m-s-6); }
.price { min-width: 7rem; }
.price b { display: block; font-family: var(--m-font-display); font-weight: 400; font-size: var(--m-fs-h2); line-height: 1; }
.price span { font-size: var(--m-fs-xs); font-weight: 800; letter-spacing: var(--m-track-caps); text-transform: uppercase; color: var(--m-on-deep-muted); }
.agent { padding-left: var(--m-s-5); border-left: 1px solid var(--m-deep-raised); font-size: var(--m-fs-sm); line-height: 1.5; }
.agent .eyebrow { margin: 0 0 var(--m-s-2); color: var(--m-signal); }
.agent em { color: var(--m-signal); font-style: normal; font-weight: 800; }
.sheet .callout { font-size: var(--m-fs-sm); }
.sheet__foot { margin-top: var(--m-s-5); padding-top: var(--m-s-3); border-top: 1px solid var(--m-line); color: var(--m-muted); font-size: var(--m-fs-xs); }
table.grid .min { white-space: nowrap; }
table.grid .note { display: block; color: var(--m-muted); font-size: var(--m-fs-xs); }
.k-skip { position: absolute; left: -9999px; }
@page sheet { margin: 12mm 14mm 16mm; }
@media print { html { font-size: 13px; } .sheet { padding: 0; page: sheet; } }
@media (max-width: 640px) { .band3 { grid-template-columns: 1fr 1fr; } .agent { grid-column: 1 / -1; padding-left: 0; border-left: 0; } .sheet__top { flex-direction: column; align-items: flex-start; } .cols { grid-template-columns: minmax(0, 1fr); } }
"""


def items(xs, cls="list"):
    return f'<ul class="{cls}">' + "".join(f"<li>{E(x)}</li>" for x in xs) + "</ul>"


def sheet_top(band: str) -> str:
    return (f'<div class="sheet__top"><img class="brand-logo" src="{LOGO}" alt="Momentum Digital" width="260">'
            f'<span class="band">{band}</span></div>')


def sheet_flagship(lane) -> str:
    f = lane["flagship"]
    monthly = (f'<div><b>{E(f["monthly"])}</b><span>per month &middot; proposed</span></div>' if f["monthly"]
               else f'<div><b>{E(f["monthly_note"])}</b><span>proposed</span></div>')
    return f"""
<section class="sheet">
  {sheet_top(f"Proposed scope &middot; not agreed &middot; {E(DATE)}")}
  <p class="eyebrow">Lane {E(lane['n'])} &middot; {E(lane['name'])} &middot; {E(lane['line'])}</p>
  <h1>{E(f['name'])}</h1>
  <p class="lead">{E(f['outcome'])}</p>
  <div class="deep band3">
    <div class="price"><b>{E(f['setup'])}</b><span>setup &middot; proposed</span></div>
    {monthly.replace('<div>', '<div class="price">', 1)}
    <div class="agent"><p class="eyebrow">Ships with its agent</p>{E(f['agent'])}<br><em>Target:</em> {E(f['hours_target'])}</div>
  </div>
  <div class="cols rule">
    <div><span class="label">Included</span>{items(f['included'])}</div>
    <div><span class="label">Not included</span>{items(f['excluded'], 'list out')}</div>
  </div>
  <div class="cols rule">
    <div><span class="label">Acceptance</span><p class="small">{E(f['acceptance'])}</p></div>
    <div><span class="label">Customer dependencies</span><p class="small">{E(f['dependencies'])} {E(f['clock'])}</p></div>
  </div>
  <p class="callout callout--quiet"><strong>What we will not claim.</strong> {E(f['honesty'])}</p>
  <p class="sheet__foot">Momentum AI &middot; Momentum Digital, Philadelphia &middot; {E(f['setup_hours'])}; then {E(f['recurring_hours'])} &middot;
    Support Monday to Friday, 9am to 5pm Eastern, one business day to acknowledge a blocking incident: an acknowledgement commitment, not an SLA.</p>
</section>"""


def sheet_summary(offers) -> str:
    dv, op = offers["division"], offers["opener"]
    rows = "".join(
        f"<tr><td class=\"min\">{E(l['n'])}</td><td><strong>{E(l['name'])}</strong><span class=\"note\">{E(l['line'])}</span></td>"
        f"<td>{E(l['flagship']['name'])}</td><td class=\"min\">{E(l['flagship']['setup'])}"
        f"{' + ' + E(l['flagship']['monthly']) + '/mo' if l['flagship']['monthly'] else ' fixed'}</td>"
        f"<td>{E(l['next']['name'])}<span class=\"note\">{E(l['next']['price'])}</span></td></tr>"
        for l in offers["lanes"])
    return f"""
<section class="sheet">
  {sheet_top(f"Internal &middot; proposed &middot; not agreed &middot; {E(DATE)}")}
  <h1 style="margin-top:var(--m-s-6)">{lockup()}</h1>
  <p class="lead">{E(dv['positioning'])}</p>
  <p class="small muted" style="margin-top:var(--m-s-3);max-width:44rem">{E(dv['thesis'])}</p>
  <table class="grid" style="margin-top:var(--m-s-6)">
    <caption class="k-skip">Four lanes with flagship and roadmap offers</caption>
    <thead><tr><th>#</th><th>Lane</th><th>Launch flagship</th><th>Proposed</th><th>Roadmap</th></tr></thead>
    <tbody>{rows}</tbody>
  </table>
  <div class="deep" style="margin-top:var(--m-s-6)">
    <p class="eyebrow">Opener &middot; {E(op['price'])}</p>
    <p class="small" style="margin-top:var(--m-s-2)"><strong>{E(op['name'])}.</strong> {E(op['what'])}</p>
  </div>
  <p class="callout callout--quiet">{E(offers['finding_241']['title'])} {E(offers['finding_241']['contrast'])}</p>
  <p class="sheet__foot">Every figure is a proposal for the Friday conversation. Twenty decisions are open; see the register.</p>
</section>"""


def build_sheets(offers) -> str:
    body = sheet_summary(offers) + "".join(sheet_flagship(l) for l in offers["lanes"])
    return document("Momentum AI: Service Sheets", body, SHEET_CSS,
                    foot="Momentum AI · Service sheets · Proposed, not agreed")


def main() -> int:
    if not DS.exists():
        print(f"design system tokens not found at {DS}", file=sys.stderr)
        return 1
    offers, decisions, econ = load()
    for name, doc in (("index.html", build_index(offers, decisions, econ)), ("one-pagers.html", build_sheets(offers))):
        assert not re.search(r"\{\{[A-Z_]+\}\}", doc), f"unfilled placeholder in {name}"
        assert "proposed" in doc.lower(), f"{name} lost its proposed marking"
        (HERE / name).write_text(doc, encoding="utf-8")
        print(f"wrote {name}  ({len(doc):,} bytes)")
        if name == "one-pagers.html":
            print(f"wrote {to_pdf(HERE / name, HERE / 'one-pagers.pdf', html=doc).name}")
    print(f"lanes: {len(offers['lanes'])}   open decisions: {len(decisions['decisions'])}")
    return 0


def demo():
    o, _, _ = load()
    assert len(o["lanes"]) == 4 and all("flagship" in l and "next" in l for l in o["lanes"])
    assert all(k in o["lanes"][0]["flagship"] for k in ("setup", "excluded", "honesty", "agent", "hours_target", "anchors"))
    assert lis(["a<b"]).count("&lt;") == 1, "list items must be escaped"
    assert "Momentum <b>AI</b>" in lockup(), "the lockup is type, not a generated logo"
    print("kit self-check ok")


if __name__ == "__main__":
    demo()
    raise SystemExit(main())
