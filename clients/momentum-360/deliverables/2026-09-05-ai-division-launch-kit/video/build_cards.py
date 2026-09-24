"""Render the video title cards from the design tokens (v2: lanes + lockup).

These frames carry the mark and the prices - exactly the material a video
model must never draw. Built from momentum.tokens.css read in place, and from
offers.json, so a card cannot show a colour or a price the system does not
ship. The verified Momentum Digital wordmark is embedded as a data URI so the
page is self-contained for frame capture; its SHA-256 is recorded in
assets/PROVENANCE.json and re-checked here.

Output: title-cards.html - a 1920x1080 stage (9:16 via ?v=1), one card per
screen, arrow keys to step, R to replay, ?card=N&still=1 for capture.

    python build_cards.py
"""
from __future__ import annotations

import base64
import hashlib
import html
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
KIT = HERE.parent
DS = KIT.parent / "2026-09-05-momentum-design-system" / "tokens"
E = html.escape


def mark_data_uri() -> str:
    p = HERE / "assets" / "momentum-logo-white.png"
    prov = json.loads((HERE / "assets" / "PROVENANCE.json").read_text(encoding="utf-8"))
    b = p.read_bytes()
    got = hashlib.sha256(b).hexdigest()
    assert got == prov[p.name]["sha256"], "mark on disk does not match its recorded provenance hash"
    return "data:image/png;base64," + base64.b64encode(b).decode("ascii")


def cards(offers):
    out = [{
        "id": "A", "kind": "open", "eyebrow": "Momentum Digital &middot; Philadelphia",
        "script": "need momentum?", "display": "Four lanes.<br>One machine.",
        "sub": E(offers["division"]["positioning"]), "price": "",
    }]
    for l in offers["lanes"]:
        f = l["flagship"]
        price = f"{E(f['setup'])} setup" + (f" &middot; {E(f['monthly'])}/month" if f["monthly"] else " &middot; fixed")
        out.append({
            "id": l["n"], "kind": "lane",
            "eyebrow": f"Lane {E(l['n'])} &middot; {E(l['name'])}",
            "script": E(l["line"]), "display": E(f["name"]),
            "sub": E(f["outcome"]), "price": price,
        })
    out.append({
        "id": "Z", "kind": "close", "eyebrow": "",
        "script": "Let&rsquo;s build", "display": "Something<br>measurable",
        "sub": "needmomentum.com", "price": "",
    })
    return out


CSS = """
html, body { margin: 0; background: #000; }
body, .stage { font-family: var(--m-font-text); }
*, *::before, *::after { box-sizing: border-box; }
.stage { position: relative; width: 1920px; height: 1080px; transform-origin: top left; overflow: hidden; background: var(--m-deep); }
body.v .stage { width: 1080px; height: 1920px; }
.card { position: absolute; inset: 0; display: grid; align-content: center; padding: 132px 148px;
  background: var(--m-deep); color: var(--m-on-deep); opacity: 0; visibility: hidden; }
body.v .card { padding: 160px 96px 260px; align-content: end; }
.card.is-on { opacity: 1; visibility: visible; }
.card[data-kind="close"] { background: var(--m-brand); color: var(--m-on-brand); }

.rule { width: 168px; height: 10px; background: var(--m-accent); transform: scaleX(0); transform-origin: left center; margin-bottom: 44px; }
.eyebrow { font: 800 22px/1 var(--m-font-text); letter-spacing: var(--m-track-caps); text-transform: uppercase; color: var(--m-accent-on-deep); margin: 0 0 28px; }
.card[data-kind="close"] .eyebrow { color: var(--m-on-brand-muted); }
.script { font: 700 88px/1 var(--m-font-script); color: var(--m-accent-on-deep); margin: 0 0 10px; transform: rotate(-2.5deg); display: inline-block; }
.card[data-kind="close"] .script { color: var(--m-accent-on-brand); }
.display { font-family: var(--m-font-display); font-size: 140px; line-height: .94; text-transform: uppercase; letter-spacing: -.02em; margin: 0; }
body.v .display { font-size: 112px; }
.sub { font: 400 34px/1.4 var(--m-font-text); max-width: 24ch; color: var(--m-on-deep-muted); margin: 36px 0 0; }
.card[data-kind="close"] .sub { color: var(--m-on-brand-muted); max-width: none; }
.price { display: inline-block; margin-top: 40px; padding: 16px 34px; border-radius: var(--m-r-pill); background: var(--m-accent);
  color: var(--m-on-accent); font: 800 30px/1 var(--m-font-text); letter-spacing: .02em; }
.price small { display: block; font: 800 17px/1 var(--m-font-text); letter-spacing: var(--m-track-caps); text-transform: uppercase; opacity: .78; margin-top: 8px; }

/* The lockup. The wordmark is the verified PNG; AI is type. Position, opacity
   and scale only - never skew, never recolour, never re-letter. */
.mark { position: absolute; right: 148px; bottom: 120px; display: flex; align-items: center; gap: 22px; opacity: 0; transform: translateY(24px); }
body.v .mark { right: 96px; bottom: 120px; }
.mark img { height: 64px; width: auto; display: block; }
.mark .ai { font-family: var(--m-font-display); font-size: 64px; line-height: 1; text-transform: uppercase; color: var(--m-accent-on-deep); }
.card[data-kind="close"] .mark .ai { color: var(--m-accent-on-brand); }

.stage.run .card.is-on .rule { animation: wipe .62s var(--m-ease-swap) both; }
.stage.run .card.is-on .eyebrow, .stage.run .card.is-on .display, .stage.run .card.is-on .script { animation: rise .72s var(--m-ease) both; }
.stage.run .card.is-on .display { animation-delay: .08s; }
.stage.run .card.is-on .sub { animation: rise .72s var(--m-ease) .18s both; }
.stage.run .card.is-on .price { animation: rise .72s var(--m-ease) .28s both; }
.stage.run .card.is-on .mark { animation: markin .8s var(--m-ease-swap) .34s both; }
.card.is-on .mark { opacity: 1; transform: none; }
@keyframes wipe { from { transform: scaleX(0) } to { transform: scaleX(1) } }
@keyframes rise { from { opacity: 0; transform: translateY(28px) } to { opacity: 1; transform: none } }
@keyframes markin { from { opacity: 0; transform: translateY(24px) scale(.96) } to { opacity: 1; transform: none scale(1) } }
@media (prefers-reduced-motion: reduce) {
  .stage.run .card.is-on * { animation: none !important; }
  .rule { transform: scaleX(1); } .mark { opacity: 1; transform: none; }
}
/* ?bg=0: transparent grounds so the type and mark can be composited over a plate */
body.nobg, body.nobg .stage, body.nobg .card { background: transparent !important; }
.hud { position: fixed; left: 12px; bottom: 12px; z-index: 9; font: 600 12px/1.4 var(--m-font-mono); color: #fff; background: #0009; padding: 8px 12px; border-radius: 8px; }
.hud b { color: var(--m-accent-on-deep); }
body.still .hud { display: none; }
"""

JS = """
(function () {
  var stage = document.querySelector('.stage');
  var cards = [].slice.call(document.querySelectorAll('.card'));
  var q = new URLSearchParams(location.search);
  var i = Math.max(0, Math.min(cards.length - 1, parseInt(q.get('card'), 10) || 0));
  var still = q.get('still') === '1';
  var vertical = q.get('v') === '1';
  if (still) document.body.classList.add('still');
  if (vertical) document.body.classList.add('v');
  if (q.get('bg') === '0') document.body.classList.add('nobg');
  var W = vertical ? 1080 : 1920, H = vertical ? 1920 : 1080;
  function fit() {
    // A zero-width viewport (hidden pane, headless capture before layout)
    // would scale the stage to 0 and capture a blank frame. Fall back to 1:1.
    var w = innerWidth || W, h = innerHeight || H;
    var s = Math.min(w / W, h / H);
    if (!(s > 0.01)) s = 1;
    stage.style.transform = 'scale(' + s + ')';
    document.body.style.height = (H * s) + 'px';
  }
  function show(n, animate) {
    i = (n + cards.length) % cards.length;
    stage.classList.remove('run');
    cards.forEach(function (c, k) { c.classList.toggle('is-on', k === i); });
    if (animate) { void stage.offsetWidth; stage.classList.add('run'); }
    var hud = document.getElementById('hud');
    if (hud) hud.innerHTML = '<b>' + (i + 1) + '/' + cards.length + '</b> ' + cards[i].dataset.name +
      ' \\u00b7 \\u2190 \\u2192 step, R replay, ?card=' + i + '&still=1' + (vertical ? '&v=1' : '') + ' to capture';
  }
  addEventListener('resize', fit); fit();
  show(i, !still);
  addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') show(i + 1, true);
    else if (e.key === 'ArrowLeft') show(i - 1, true);
    else if (e.key.toLowerCase() === 'r') show(i, true);
  });
})();
"""


def card_html(c, mark_uri):
    script = f'<p class="script">{c["script"]}</p>' if c["script"] else ""
    eyebrow = f'<p class="eyebrow">{c["eyebrow"]}</p>' if c["eyebrow"] else ""
    price = (f'<span class="price">{c["price"]}<small>Proposed &middot; not agreed</small></span>' if c["price"] else "")
    return f"""
  <section class="card" data-kind="{c['kind']}" data-name="{E(c['id'])}">
    <div>
      <div class="rule"></div>
      {eyebrow}{script}
      <h2 class="display">{c['display']}</h2>
      <p class="sub">{c['sub']}</p>
      {price}
    </div>
    <div class="mark" aria-label="Momentum AI">
      <img src="{mark_uri}" alt="Momentum">
      <span class="ai">AI</span>
    </div>
  </section>"""


def main() -> int:
    if not DS.exists():
        print(f"tokens not found at {DS}", file=sys.stderr)
        return 1
    tok = (DS / "momentum.tokens.css").read_text(encoding="utf-8")
    offers = json.loads((KIT / "offers.json").read_text(encoding="utf-8"))
    uri = mark_data_uri()
    cs = cards(offers)
    doc = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Momentum AI: Title Cards</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Nunito+Sans:wght@400;600;800&family=Caveat:wght@700&family=IBM+Plex+Mono:wght@400;600&display=swap" rel="stylesheet">
<style>{tok}{CSS}</style>
</head>
<body>
<div class="stage">
{"".join(card_html(c, uri) for c in cs)}
</div>
<div class="hud" id="hud"></div>
<script>{JS}</script>
</body></html>"""
    out = HERE / "title-cards.html"
    out.write_text(doc, encoding="utf-8")
    print(f"wrote {out.name}  ({len(doc):,} bytes)  {len(cs)} cards")
    for n, c in enumerate(cs):
        print(f"  card={n}  {c['id']:>2}  {c['kind']}")
    return 0


def demo():
    o = json.loads((KIT / "offers.json").read_text(encoding="utf-8"))
    cs = cards(o)
    assert len(cs) == len(o["lanes"]) + 2, "open + one per lane + close"
    assert all("Proposed" in card_html(c, "x") for c in cs if c["price"]), "every on-screen price must carry the proposed marking"
    assert all('class="ai">AI<' in card_html(c, "x") for c in cs), "the lockup is the mark plus typed AI"
    mark_data_uri()  # hash check against PROVENANCE.json
    print("cards self-check ok")


if __name__ == "__main__":
    demo()
    raise SystemExit(main())
