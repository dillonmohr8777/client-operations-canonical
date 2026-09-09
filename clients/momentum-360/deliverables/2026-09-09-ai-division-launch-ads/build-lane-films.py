"""Generate the four lane films.

One 15s spot per Momentum AI lane. Same three-beat spine as the launch ads,
but each lane gets its own surface rotation and its own dimensional hero so
the set reads as a series rather than a template.

All copy is lifted from POSITIONING.md's five-value map. Nothing is invented,
and the doc's "what we do not say" guardrails are respected: no ranking
promise, no guaranteed leads, no invented numbers.

    python build-lane-films.py
"""
from __future__ import annotations
import pathlib

HERE = pathlib.Path(__file__).parent
OUT = HERE / "compositions"

# (id, lane no, lane name, promise lines, sub-line, surfaces A/B/C, fg A/B/C, geometry, spin)
LANES = [
    dict(
        cid="lane01", slug="lane-01-aeo-geo", no="LANE 01", name="AEO / GEO",
        promise=["GET FOUND WHERE", "AI WRITES", "THE ANSWER."],
        sub="Twenty buyer questions, measured on two named engines. No ranking promise.",
        sa="s-deep", sb="s-brand", sc="s-deep",
        fa="on-deep", fa2="on-deep-brand", fb="on-brand", fc="on-deep", fc2="on-deep-brand",
        rule_a="", rule_c="lanes-rule",
        geom="new THREE.DodecahedronGeometry(1.7, 0)", spin="0.4",
    ),
    dict(
        cid="lane02", slug="lane-02-ai-design", no="LANE 02", name="AI DESIGN",
        promise=["SEE THE THING", "IN FIVE", "WORKING DAYS."],
        sub="A working prototype built from your verified logo and your own first-party facts.",
        sa="s-panel", sb="s-deep", sc="s-raised",
        fa="on-light", fa2="on-light-brand", fb="on-deep", fc="on-deep", fc2="on-deep-brand",
        rule_a="rule-brand", rule_c="lanes-rule",
        geom="new THREE.BoxGeometry(2.1, 2.1, 2.1, 4, 4, 4)", spin="0.5",
    ),
    dict(
        cid="lane03", slug="lane-03-ai-marketing", no="LANE 03", name="AI MARKETING",
        promise=["CONTENT THAT MOVES.", "YOUR LOGO", "NEVER MODEL-DRAWN."],
        sub="A monthly film and stills in your identity, with the rights ledger attached.",
        sa="s-deep", sb="s-paper", sc="s-brand",
        fa="on-deep", fa2="on-deep-brand", fb="on-light", fc="on-brand", fc2="on-brand",
        rule_a="", rule_c="lanes-rule lanes-rule-white",
        geom="new THREE.TorusKnotGeometry(1.2, 0.38, 220, 36, 3, 4)", spin="0.55",
    ),
    dict(
        cid="lane04", slug="lane-04-ai-automation", no="LANE 04", name="AI AUTOMATION",
        promise=["EVERY ACCEPTED", "LEAD HAS", "A RECEIPT."],
        sub="One intake to one destination. Dedupe, an exception queue, destination readback.",
        sa="s-paper", sb="s-deep", sc="s-deep",
        fa="on-light", fa2="on-light-brand", fb="on-deep", fc="on-deep", fc2="on-deep-brand",
        rule_a="rule-brand", rule_c="lanes-rule",
        geom="new THREE.OctahedronGeometry(1.85, 0)", spin="0.46",
    ),
]

TPL = """<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <link rel="stylesheet" href="assets/momentum.css" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      #three-layer {{
        position: absolute;
        inset: 0;
        width: 1920px;
        height: 1080px;
        display: block;
        z-index: 0;
      }}
      #a {{ padding: 0; }}
      #a-type {{
        position: absolute;
        left: 148px;
        top: 50%;
        transform: translateY(-50%);
        z-index: 1;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        text-align: left;
        max-width: 900px;
      }}
      #lane-name {{
        display: block;
        font-family: var(--m-font-display);
        font-weight: 400;
        font-size: 116px;
        line-height: 1.0;
        letter-spacing: -0.03em;
      }}
      #sub {{
        display: block;
        font-family: var(--m-font-text);
        font-weight: 600;
        font-size: 46px;
        line-height: 1.34;
        max-width: 1380px;
        text-align: center;
      }}
    </style>
  </head>
  <body>
    <div
      id="root"
      data-composition-id="{cid}"
      data-start="0"
      data-duration="15"
      data-width="1920"
      data-height="1080"
    >
      <!-- A · lane title + hero -->
      <div id="a" class="slide {sa} clip" data-start="0" data-duration="5" data-track-index="1">
        <canvas id="three-layer"></canvas>
        <div id="a-type">
          <span class="eyebrow {fa2} al">{no}</span>
          <span id="lane-name" class="{fa} al" style="margin-top: 26px">{name}</span>
          <span class="rule {rule_a} ar"></span>
        </div>
      </div>

      <!-- B · the promise -->
      <div id="b" class="slide {sb} a-center clip" data-start="5" data-duration="5" data-track-index="2">
        <span class="d d-md {fb} bl">{p0}</span>
        <span class="d d-md {fb} bl">{p1}</span>
        <span class="d d-md {fb} bl">{p2}</span>
      </div>

      <!-- C · payoff -->
      <div id="c" class="slide {sc} payoff clip" data-start="10" data-duration="5" data-track-index="3">
        <span id="sub" class="{fc} cs">{sub}</span>
        <span class="{rule_c} cr"></span>
        <span class="lockup d-md {fc} cm">MOMENTUM <em class="{fc2}">AI</em></span>
        <span class="url {fc2} cu">needmomentum.com</span>
      </div>

      <div id="wipe1" class="wipe clip" data-start="4.6" data-duration="0.8" data-track-index="9"></div>
      <div id="wipe2" class="wipe clip" data-start="9.6" data-duration="0.8" data-track-index="9"></div>
    </div>

    <script type="module">
      import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.181.2/+esm";
      import {{ mountHero }} from "./assets/hero.js";

      mountHero({{
        canvas: "three-layer",
        geometry: {geom},
        x: 2.35,
        scale: 1.0,
        spin: {spin},
      }});
    </script>

    <script>
      const E = "expo.out";
      const tl = gsap.timeline({{ paused: true }});

      tl.fromTo(".al", {{ yPercent: 110, opacity: 0 }}, {{ yPercent: 0, opacity: 1, duration: 0.9, ease: E, stagger: 0.14 }}, 0.15);
      tl.fromTo(".ar", {{ scaleX: 0 }}, {{ scaleX: 1, duration: 0.8, ease: E }}, 0.9);
      tl.to(".al", {{ yPercent: -18, opacity: 0, duration: 0.5, ease: "power2.in", stagger: 0.05 }}, 4.4);
      tl.to(".ar", {{ scaleX: 0, duration: 0.4, ease: "power2.in" }}, 4.4);

      tl.fromTo(".bl", {{ yPercent: 110, opacity: 0 }}, {{ yPercent: 0, opacity: 1, duration: 0.85, ease: E, stagger: 0.13 }}, 5.15);
      tl.to(".bl", {{ yPercent: -16, opacity: 0, duration: 0.5, ease: "power2.in", stagger: 0.05 }}, 9.4);

      tl.fromTo(".cs", {{ y: 30, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.75, ease: E }}, 10.15);
      tl.fromTo(".cr", {{ scaleX: 0 }}, {{ scaleX: 1, duration: 0.8, ease: E }}, 10.7);
      tl.fromTo(".cm", {{ y: 30, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.7, ease: E }}, 10.95);
      tl.fromTo(".cu", {{ y: 20, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.6, ease: E }}, 11.55);

      tl.fromTo("#wipe1", {{ xPercent: -105 }}, {{ xPercent: 0, duration: 0.22, ease: "power3.in" }}, 4.78);
      tl.to("#wipe1", {{ xPercent: 105, duration: 0.26, ease: "power3.out" }}, 5.0);
      tl.fromTo("#wipe2", {{ xPercent: -105 }}, {{ xPercent: 0, duration: 0.22, ease: "power3.in" }}, 9.78);
      tl.to("#wipe2", {{ xPercent: 105, duration: 0.26, ease: "power3.out" }}, 10.0);

      window.__timelines["{cid}"] = tl;
    </script>
  </body>
</html>
"""

for L in LANES:
    html = TPL.format(p0=L["promise"][0], p1=L["promise"][1], p2=L["promise"][2], **L)
    (OUT / f"{L['slug']}.html").write_text(html, encoding="utf-8")
    print(f"wrote compositions/{L['slug']}.html  ({L['name']})")
