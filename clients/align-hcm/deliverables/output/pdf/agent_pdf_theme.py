#!/usr/bin/env python3
"""Shared design system for the Align HCM Customer Agent PDF deliverables.

The visual language matches the July 23 designed package: full-bleed navy
covers with an orange corner glow, cream interior pages, navy phase headers,
stat cards, and verdict pills. Poppins carries display type, Mulish carries
body type; both ship with the repo so the build is reproducible offline.
"""

from __future__ import annotations

import base64
import subprocess
from pathlib import Path

PDF_DIR = Path(__file__).resolve().parent
ASSETS = PDF_DIR.parent.parent / "assets" / "customer-agent"
FONTS = ASSETS / "fonts"

CHROME_CANDIDATES = (
    "/usr/bin/google-chrome-stable",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
)


def find_chrome() -> str:
    for path in CHROME_CANDIDATES:
        if Path(path).exists():
            return path
    matches = sorted(Path("/opt/pw-browsers").glob("chromium-*/chrome-linux/chrome"))
    if matches:
        return str(matches[-1])
    raise RuntimeError("No Chrome/Chromium binary found for PDF rendering.")


def data_uri(path: Path) -> str:
    suffix = path.suffix.lower()
    mime = {
        ".png": "image/png",
        ".svg": "image/svg+xml",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".ttf": "font/ttf",
    }[suffix]
    return f"data:{mime};base64,{base64.b64encode(path.read_bytes()).decode('ascii')}"


def _font_faces() -> str:
    faces = []
    for family, weights in (("Poppins", (500, 600, 700, 800)), ("Mulish", (400, 500, 600, 700))):
        for weight in weights:
            ttf = FONTS / f"{family}-{weight}.ttf"
            faces.append(
                "@font-face{font-family:'%s';font-style:normal;font-weight:%d;"
                "src:url(%s) format('truetype');}" % (family, weight, data_uri(ttf))
            )
    return "\n".join(faces)


LOGO = data_uri(ASSETS / "align-hcm-logo.png")
ROBOT = data_uri(ASSETS / "align-customer-agent-robot-hubspot-1024.png")
MONOGRAM = data_uri(ASSETS / "align-customer-agent-monogram-hubspot-1024.png")


CSS = """
@page { size: Letter; margin: 0; }
:root {
  --navy-900:#0A2340; --navy-800:#0E2B48; --navy-700:#123A5E;
  --ink:#0B2743; --ink-soft:#3E5A75; --muted:#7D8896; --muted-l:#98A1AC;
  --cream:#FAFAF6; --white:#FFFFFF; --line:#E7E8E2; --panel:#F5F6F9;
  --orange:#F0762A; --orange-l:#F6993D; --coral:#FF5C4E;
  --teal:#12A594; --teal-l:#41CFB5; --amber:#C4841A;
  --peach:#FDE9DF; --mint:#E7F6F3;
}
* { box-sizing:border-box; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
html,body { margin:0; padding:0; }
body {
  font-family:'Mulish','Liberation Sans',sans-serif;
  color:var(--ink); font-size:9.6pt; line-height:1.5;
}
p { margin:0 0 0.5em; }
strong { font-weight:700; }
em { font-style:italic; }

/* ---------- page shell ---------- */
.page {
  position:relative; width:8.5in; height:11in; overflow:hidden;
  background:var(--cream); page-break-after:always; break-after:page;
}
.page:last-of-type { page-break-after:auto; break-after:auto; }
.pad { position:absolute; inset:0.5in 0.62in 0.52in; display:flex; flex-direction:column; }
.flow { flex:1 1 auto; min-height:0; }

/* ---------- running head / foot ---------- */
.rhead {
  display:flex; justify-content:space-between; align-items:baseline;
  margin-bottom:0.30in;
}
.rhead .doc { font-size:7.8pt; font-weight:600; color:var(--muted-l); }
.rhead .sect {
  font-family:'Poppins',sans-serif; font-size:7.4pt; font-weight:700;
  letter-spacing:0.16em; text-transform:uppercase; color:var(--orange);
}
.rfoot {
  display:flex; justify-content:space-between; align-items:baseline;
  border-top:1px solid var(--line); padding-top:0.09in; margin-top:0.14in;
  font-size:7.4pt;
}
.rfoot .l { font-weight:500; color:var(--muted); }
.rfoot .l b { color:var(--ink); font-weight:700; }
.rfoot .c { color:var(--muted-l); letter-spacing:0.10em; font-weight:500; }
.rfoot .r { color:var(--orange); font-weight:700; letter-spacing:0.06em; }

/* ---------- cover ---------- */
.cover {
  background:
    radial-gradient(120% 90% at 88% 4%, rgba(70,120,175,0.42) 0%, rgba(70,120,175,0) 55%),
    radial-gradient(90% 70% at 8% 96%, rgba(240,118,42,0.16) 0%, rgba(240,118,42,0) 60%),
    linear-gradient(160deg,#12324F 0%,#0B2742 45%,#081F37 100%);
  color:#fff;
}
.sun {
  position:absolute; top:-1.30in; right:-0.72in; width:3.05in; height:3.05in;
  border-radius:50%;
  background:radial-gradient(circle at 34% 74%, #F79A4A 0%, #F0762A 46%, #E2611F 100%);
}
.sun-tag {
  position:absolute; top:1.02in; right:0.86in;
  border:1px solid rgba(255,255,255,0.45); border-radius:0.07in;
  padding:0.055in 0.115in; background:rgba(12,38,64,0.30);
  font-family:'Poppins',sans-serif; font-size:7.4pt; font-weight:700;
  letter-spacing:0.15em; text-transform:uppercase; color:#fff;
}
.cover .pad { inset:0.62in 0.72in 0.58in; }
.logo-tile {
  width:1.52in; background:#fff; border-radius:0.11in; padding:0.13in 0.15in;
  box-shadow:0 0.05in 0.16in rgba(3,16,30,0.30);
}
.logo-tile img { display:block; width:100%; }
.cover-kicker {
  font-family:'Poppins',sans-serif; font-size:8.4pt; font-weight:700;
  letter-spacing:0.20em; text-transform:uppercase; color:var(--orange-l);
  margin-bottom:0.10in;
}
.cover h1 {
  font-family:'Poppins',sans-serif; font-weight:800; font-size:38pt;
  line-height:1.02; letter-spacing:-0.020em; margin:0;
}
.cover h1 .coral { color:var(--coral); display:block; }
.cover .lede {
  margin-top:0.20in; max-width:4.55in; font-size:10.1pt; line-height:1.58;
  color:rgba(255,255,255,0.86);
}
.tickrule { width:0.72in; height:0.043in; background:var(--orange); border-radius:0.03in; margin:0.30in 0 0.22in; }
.cover-facts { display:flex; gap:0.44in; }
.cover-facts .k {
  font-family:'Poppins',sans-serif; font-size:7.2pt; font-weight:700;
  letter-spacing:0.15em; text-transform:uppercase; color:rgba(255,255,255,0.55);
  margin-bottom:0.035in;
}
.cover-facts .v { font-family:'Poppins',sans-serif; font-size:11.6pt; font-weight:700; }
.dots { position:absolute; right:1.20in; bottom:3.55in; }
.dots i { display:block; border-radius:50%; background:var(--orange); }
.decision {
  border:1px solid rgba(255,255,255,0.20); border-radius:0.13in;
  background:rgba(255,255,255,0.055); padding:0.20in 0.22in;
}
.decision .k {
  font-family:'Poppins',sans-serif; font-size:7.4pt; font-weight:700;
  letter-spacing:0.18em; text-transform:uppercase; color:rgba(255,255,255,0.62);
  margin-bottom:0.11in;
}
.decision .verdictbar {
  display:inline-block; background:rgba(255,92,78,0.14);
  border:1px solid rgba(255,92,78,0.30); border-radius:0.055in;
  padding:0.075in 0.14in; margin-bottom:0.13in;
  font-family:'Poppins',sans-serif; font-size:8.6pt; font-weight:700;
  letter-spacing:0.055em; text-transform:uppercase; color:var(--coral);
}
.decision .verdictbar .bullet { color:var(--coral); }
.decision p { margin:0; font-size:9.5pt; line-height:1.56; color:rgba(255,255,255,0.86); }
.decision p strong { color:#fff; }
.cover-strip {
  display:flex; gap:0.10in; flex-wrap:wrap; margin-top:0.20in;
}
.cover-strip span {
  border:1px solid rgba(255,255,255,0.22); border-radius:0.35in;
  padding:0.055in 0.14in; font-size:8.1pt; color:rgba(255,255,255,0.80);
}
.cover-strip span b { color:#fff; font-weight:700; }
.cover-foot {
  display:flex; justify-content:space-between; align-items:baseline;
  border-top:1px solid rgba(255,255,255,0.16); padding-top:0.11in; margin-top:0.20in;
  font-size:7.8pt; color:rgba(255,255,255,0.55);
}
.cover-foot b { color:#fff; font-weight:700; }
.cover-foot .orange { color:var(--orange-l); font-weight:700; }
.bignum {
  display:flex; align-items:flex-end; gap:0.18in; margin:0.30in 0 0.22in;
}
.bignum .n {
  font-family:'Poppins',sans-serif; font-weight:800; font-size:52pt;
  line-height:0.86; color:var(--orange);
}
.bignum .t { padding-bottom:0.07in; }
.bignum .t .a {
  font-family:'Poppins',sans-serif; font-size:9.2pt; font-weight:700;
  letter-spacing:0.15em; text-transform:uppercase;
}
.bignum .t .b {
  font-family:'Poppins',sans-serif; font-size:7.8pt; font-weight:600;
  letter-spacing:0.13em; text-transform:uppercase; color:rgba(255,255,255,0.50);
}
.minirow { display:flex; gap:0.55in; border-top:1px solid rgba(255,255,255,0.16); padding-top:0.17in; }
.minirow .n { font-family:'Poppins',sans-serif; font-weight:800; font-size:16pt; line-height:1; }
.minirow .n.o { color:var(--orange); }
.minirow .n.b { color:#7FB2DE; }
.minirow .n.w { color:#fff; }
.minirow .s { font-size:8.4pt; color:rgba(255,255,255,0.72); margin-top:0.03in; }

/* ---------- interior headings ---------- */
.eyebrow {
  font-family:'Poppins',sans-serif; font-size:8.0pt; font-weight:700;
  letter-spacing:0.19em; text-transform:uppercase; color:var(--orange);
  margin-bottom:0.06in;
}
.eyebrow .n { color:var(--orange); }
.eyebrow .g { color:var(--muted-l); }
h2.disp {
  font-family:'Poppins',sans-serif; font-weight:800; font-size:22pt;
  line-height:1.10; letter-spacing:-0.017em; color:var(--ink); margin:0;
}
h2.disp.sm { font-size:18pt; }
.dotrule { display:flex; align-items:center; gap:0.055in; margin:0.13in 0 0.20in; }
.dotrule .bar { width:0.52in; height:0.033in; border-radius:0.02in; background:var(--orange); }
.dotrule i { width:0.052in; height:0.052in; border-radius:50%; background:var(--orange); display:block; }
.dotrule i.f1 { opacity:0.30; } .dotrule i.f2 { opacity:0.50; } .dotrule i.f3 { opacity:0.72; }
.lede { font-size:9.8pt; line-height:1.56; color:var(--ink-soft); max-width:6.5in; margin:0 0 0.20in; }
h3.tick {
  font-family:'Poppins',sans-serif; font-weight:700; font-size:12.4pt; color:var(--ink);
  margin:0.24in 0 0.13in; padding-left:0.14in; position:relative; letter-spacing:-0.008em;
}
h3.tick::before {
  content:''; position:absolute; left:0; top:0.035in; width:0.045in; height:0.155in;
  background:var(--orange); border-radius:0.02in;
}
h4.mini {
  font-family:'Poppins',sans-serif; font-weight:700; font-size:8.2pt; color:var(--ink);
  letter-spacing:0.13em; text-transform:uppercase; margin:0.20in 0 0.10in;
}

/* ---------- phase header ---------- */
.phase {
  position:relative; overflow:hidden; border-radius:0.14in; color:#fff;
  padding:0.22in 0.26in; display:flex; align-items:center; gap:0.20in;
  background:
    radial-gradient(90% 160% at 92% 8%, rgba(240,118,42,0.30) 0%, rgba(240,118,42,0) 58%),
    linear-gradient(100deg,#0B2742 0%,#123A5E 62%,#0C2846 100%);
  margin-bottom:0.20in;
}
.phase .num {
  font-family:'Poppins',sans-serif; font-weight:800; font-size:30pt; line-height:0.9;
  color:rgba(255,255,255,0.17); letter-spacing:-0.02em;
}
.phase .txt { flex:1 1 auto; }
.phase .k {
  font-family:'Poppins',sans-serif; font-size:7.6pt; font-weight:700;
  letter-spacing:0.17em; text-transform:uppercase; color:var(--orange-l);
  margin-bottom:0.045in;
}
.phase h2 {
  font-family:'Poppins',sans-serif; font-weight:800; font-size:18pt; line-height:1.08;
  margin:0; letter-spacing:-0.015em;
}
.phase .tile {
  width:0.50in; height:0.50in; border-radius:0.10in; flex:0 0 auto;
  background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.16);
  display:flex; align-items:center; justify-content:center; font-size:17pt;
}

/* ---------- stat cards ---------- */
.stats { display:grid; gap:0.115in; margin:0 0 0.20in; }
.stats.c4 { grid-template-columns:repeat(4,1fr); }
.stats.c3 { grid-template-columns:repeat(3,1fr); }
.stat {
  border-radius:0.10in; padding:0.145in 0.145in 0.16in; color:#fff;
  border-top:0.036in solid var(--orange);
  background:linear-gradient(150deg,#0E2B48 0%,#0A2340 100%);
}
.stat.teal { border-top-color:var(--teal-l); background:linear-gradient(150deg,#0D3A44 0%,#0A2A38 100%); }
.stat.coral { border-top-color:var(--coral); background:linear-gradient(150deg,#2A2540 0%,#141C33 100%); }
.stat .label {
  font-family:'Poppins',sans-serif; font-size:6.9pt; font-weight:700;
  letter-spacing:0.13em; text-transform:uppercase; color:var(--orange-l);
  min-height:0.20in;
}
.stat.teal .label { color:var(--teal-l); }
.stat.coral .label { color:#FF8B7F; }
.stat .num {
  font-family:'Poppins',sans-serif; font-weight:800; font-size:24pt; line-height:1.02;
  color:var(--orange); margin:0.025in 0 0.055in; letter-spacing:-0.02em;
}
.stat .num.sm { font-size:16.5pt; }
.stat.teal .num { color:var(--teal-l); }
.stat.coral .num { color:var(--coral); }
.stat .sub { font-size:7.9pt; line-height:1.35; color:rgba(255,255,255,0.74); }

/* ---------- accent-bar cards ---------- */
.split { display:grid; grid-template-columns:1fr 1fr; gap:0.16in; }
.acard {
  background:#fff; border:1px solid var(--line); border-left:0.042in solid var(--teal);
  border-radius:0.09in; padding:0.16in 0.18in;
}
.acard.coral { border-left-color:var(--coral); }
.acard.orange { border-left-color:var(--orange); }
.acard.navy { border-left-color:var(--navy-700); }
.acard h4 {
  font-family:'Poppins',sans-serif; font-weight:700; font-size:11.4pt; color:var(--ink);
  margin:0 0 0.10in; letter-spacing:-0.008em;
}
.acard ul { list-style:none; margin:0; padding:0; }
.acard li { position:relative; padding-left:0.155in; margin-bottom:0.085in; font-size:9.1pt; line-height:1.42; }
.acard li:last-child { margin-bottom:0; }
.acard li::before {
  content:''; position:absolute; left:0; top:0.062in; width:0.055in; height:0.055in;
  border-radius:50%; background:var(--teal);
}
.acard.coral li::before { background:var(--coral); }
.acard.orange li::before { background:var(--orange); }
.acard.navy li::before { background:var(--navy-700); }

/* ---------- chip cards ---------- */
.chips { display:grid; gap:0.10in; }
.chips.c5 { grid-template-columns:repeat(5,1fr); }
.chips.c4 { grid-template-columns:repeat(4,1fr); }
.chips.c3 { grid-template-columns:repeat(3,1fr); }
.chip { background:#fff; border:1px solid var(--line); border-radius:0.09in; padding:0.13in 0.13in 0.145in; }
.chip .ic {
  width:0.20in; height:0.20in; border-radius:0.045in; background:var(--peach);
  color:var(--orange); display:flex; align-items:center; justify-content:center;
  font-size:8.4pt; font-weight:700; margin-bottom:0.09in;
}
.chip .ic.teal { background:var(--mint); color:var(--teal); }
.chip .t { font-family:'Poppins',sans-serif; font-weight:700; font-size:9.2pt; color:var(--ink); margin-bottom:0.045in; line-height:1.2; }
.chip .d { font-size:7.9pt; line-height:1.36; color:var(--ink-soft); }

/* ---------- field rows ---------- */
.frow { background:var(--panel); border:1px solid var(--line); border-radius:0.075in; padding:0.10in 0.14in; margin-bottom:0.075in; }
.frow .k { font-family:'Poppins',sans-serif; font-size:7.0pt; font-weight:700; letter-spacing:0.13em; text-transform:uppercase; color:var(--muted); }
.frow .v { font-family:'Poppins',sans-serif; font-weight:600; font-size:9.7pt; color:var(--ink); margin-top:0.02in; }
.frow .v.q { font-family:'Mulish',sans-serif; font-style:italic; font-weight:500; }
.frow .v.mono { font-family:'DejaVu Sans Mono',monospace; font-size:8.6pt; font-weight:400; }

/* ---------- alerts / dark note ---------- */
.alert {
  background:var(--peach); border-left:0.045in solid var(--coral);
  border-radius:0.02in 0.085in 0.085in 0.02in; padding:0.15in 0.18in; margin-top:0.20in;
}
.alert .t {
  font-family:'Poppins',sans-serif; font-weight:700; font-size:8.6pt; color:#C43A22;
  letter-spacing:0.055em; text-transform:uppercase; margin-bottom:0.07in;
}
.alert p { margin:0; font-size:9.1pt; line-height:1.48; color:var(--ink); }
.alert.mint { background:var(--mint); border-left-color:var(--teal); }
.alert.mint .t { color:#0B7A6C; }
.alert.gray { background:var(--panel); border-left-color:var(--orange); }
.alert.gray .t { color:var(--orange); }
.notedark {
  border-radius:0.12in; color:#fff; padding:0.19in 0.22in; margin:0.20in 0;
  background:
    radial-gradient(80% 150% at 94% 6%, rgba(240,118,42,0.26) 0%, rgba(240,118,42,0) 60%),
    linear-gradient(100deg,#0B2742 0%,#123A5E 68%,#0C2846 100%);
}
.notedark .t {
  font-family:'Poppins',sans-serif; font-weight:700; font-size:8.0pt; color:var(--orange-l);
  letter-spacing:0.15em; text-transform:uppercase; margin-bottom:0.09in;
}
.notedark p { margin:0; font-size:9.4pt; line-height:1.55; color:rgba(255,255,255,0.86); }
.notedark p strong { color:#fff; }

/* ---------- tables ---------- */
table.ev { width:100%; border-collapse:collapse; }
table.ev th {
  font-family:'Poppins',sans-serif; font-size:6.9pt; font-weight:700;
  letter-spacing:0.13em; text-transform:uppercase; color:var(--muted);
  text-align:left; padding:0 0.10in 0.075in; border-bottom:1.2px solid var(--ink);
}
table.ev td {
  padding:0.093in 0.10in; border-bottom:1px solid var(--line);
  font-size:8.4pt; line-height:1.36; vertical-align:top;
}
table.ev tr:last-child td { border-bottom:none; }
table.ev td.name { font-family:'Poppins',sans-serif; font-weight:700; font-size:8.5pt; color:var(--ink); white-space:nowrap; }
table.ev td.q { color:var(--ink-soft); }
table.ev td.vd { text-align:right; white-space:nowrap; }
table.ev.zebra tr:nth-child(even) td { background:rgba(245,246,249,0.75); }
table.ev.dense th { font-size:6.6pt; padding-bottom:0.06in; }
table.ev.dense td { padding:0.070in 0.085in; font-size:7.9pt; line-height:1.32; }
table.ev.dense td.name { font-size:8.0pt; }
.tight .frow { margin-bottom:0.055in; padding:0.082in 0.13in; }
.tight .frow .v { font-size:9.3pt; }
.srcgrid.one { grid-template-columns:1fr; }
.steps.tight .step { padding:0.058in 0; }
.pill {
  display:inline-block; border-radius:0.30in; padding:0.032in 0.095in;
  font-family:'Poppins',sans-serif; font-weight:700; font-size:6.8pt;
  letter-spacing:0.075em; text-transform:uppercase; white-space:nowrap;
}
.pill.pass { background:var(--mint); color:#0B7A6C; }
.pill.fail { background:#FDE4E1; color:#C0271A; }
.pill.partial { background:#FBEFD9; color:#9A6510; }
.pill.deferred { background:var(--panel); color:var(--muted); }
.pill.pend { background:#FBEFD9; color:#9A6510; }
.pill.off { background:#E9EDF2; color:var(--navy-700); }

/* ---------- gates ---------- */
.gate { display:flex; gap:0.13in; align-items:flex-start; padding:0.088in 0; border-bottom:1px solid var(--line); }
.gate:last-child { border-bottom:none; }
.gate .m {
  flex:0 0 auto; width:0.175in; height:0.175in; border-radius:50%; margin-top:0.015in;
  display:flex; align-items:center; justify-content:center; font-size:7.4pt; font-weight:700; color:#fff;
}
.gate .m.p { background:var(--teal); }
.gate .m.f { background:var(--coral); }
.gate .m.w { background:var(--amber); }
.gate .m.o { background:var(--navy-700); }
.gate .b { flex:1 1 auto; }
.gate .b .t { font-family:'Poppins',sans-serif; font-weight:700; font-size:9.3pt; color:var(--ink); }
.gate .b .d { font-size:8.3pt; color:var(--ink-soft); line-height:1.38; margin-top:0.012in; }
.gate .r { flex:0 0 auto; padding-top:0.022in; }

/* ---------- numbered steps ---------- */
.steps { counter-reset:s; }
.step { display:flex; gap:0.135in; align-items:flex-start; padding:0.075in 0; }
.step .n {
  flex:0 0 auto; counter-increment:s; width:0.20in; height:0.20in; border-radius:50%;
  background:var(--orange); color:#fff; display:flex; align-items:center; justify-content:center;
  font-family:'Poppins',sans-serif; font-weight:700; font-size:7.8pt; margin-top:0.012in;
}
.step .n::before { content:counter(s); }
.step .x { font-size:9.2pt; line-height:1.46; }
.step .x b { font-family:'Poppins',sans-serif; font-weight:700; color:var(--ink); }
.finalbox {
  border:1px solid var(--line); border-top:0.05in solid var(--coral); border-radius:0.10in;
  background:#fff; padding:0.20in 0.22in; margin-top:0.20in;
}
.finalbox .k {
  font-family:'Poppins',sans-serif; font-weight:700; font-size:7.8pt; color:var(--coral);
  letter-spacing:0.16em; text-transform:uppercase; margin-bottom:0.09in;
}
.finalbox h3 {
  font-family:'Poppins',sans-serif; font-weight:800; font-size:15pt; line-height:1.15;
  color:var(--ink); margin:0 0 0.11in; letter-spacing:-0.014em;
}
.finalbox p { margin:0; font-size:9.3pt; line-height:1.52; color:var(--ink-soft); }

/* ---------- misc blocks ---------- */
.rulebox {
  background:#0B2742; border-radius:0.09in; padding:0.15in 0.17in; margin:0.10in 0 0.16in;
  font-family:'DejaVu Sans Mono',monospace; font-size:7.5pt; line-height:1.52;
  color:#D8E4F0; white-space:pre-wrap;
}
.rulebox .h { color:var(--orange-l); font-weight:700; }
.rulebox .no { color:#FF8B7F; }
.two { display:grid; grid-template-columns:1fr 1fr; gap:0.20in; }
.two.wide { grid-template-columns:1.25fr 1fr; }
.avpair { display:grid; grid-template-columns:1fr 1fr; gap:0.16in; margin-bottom:0.04in; }
.avcard { background:#fff; border:1px solid var(--line); border-left:0.042in solid var(--orange); border-radius:0.09in; padding:0.15in 0.16in; display:flex; gap:0.14in; align-items:flex-start; }
.avcard.navy { border-left-color:var(--navy-700); }
.avcard .im {
  flex:0 0 auto; width:0.72in; height:0.72in; border-radius:0.14in; overflow:hidden;
  background:var(--panel); display:flex; align-items:center; justify-content:center;
}
.avcard .im img { width:100%; height:100%; object-fit:contain; }
.avcard .im.ghost { color:var(--muted-l); font-size:22pt; }
.avcard .tag {
  display:inline-block; border-radius:0.30in; padding:0.03in 0.10in; margin-bottom:0.06in;
  font-family:'Poppins',sans-serif; font-weight:700; font-size:6.6pt;
  letter-spacing:0.115em; text-transform:uppercase; background:var(--peach); color:#C4581F;
}
.avcard .tag.blue { background:#E7EFF7; color:var(--navy-700); }
.avcard .tag.teal { background:var(--mint); color:#0B7A6C; }
.avcard .t { font-family:'Poppins',sans-serif; font-weight:700; font-size:10.2pt; color:var(--ink); margin-bottom:0.045in; }
.avcard .d { font-size:8.4pt; line-height:1.40; color:var(--ink-soft); }
.blist { list-style:none; margin:0; padding:0; }
.blist li { position:relative; padding-left:0.15in; margin-bottom:0.072in; font-size:8.9pt; line-height:1.42; }
.blist li::before { content:''; position:absolute; left:0; top:0.058in; width:0.052in; height:0.052in; border-radius:50%; background:var(--orange); }
.blist.teal li::before { background:var(--teal); }
.blist.coral li::before { background:var(--coral); }
.blist.navy li::before { background:var(--navy-700); }
.mono { font-family:'DejaVu Sans Mono',monospace; font-size:8.2pt; }
.tiny { font-size:7.9pt; line-height:1.42; color:var(--muted); }
.scopenote { font-size:8.0pt; line-height:1.44; color:var(--muted); font-style:italic; margin-top:0.16in; }

/* ---------- knowledge-core specifics ---------- */
.svcgrid { display:grid; grid-template-columns:1fr 1fr; gap:0.15in; }
.svc { background:#fff; border:1px solid var(--line); border-radius:0.09in; padding:0.15in 0.16in; }
.svc .t { font-family:'Poppins',sans-serif; font-weight:700; font-size:10.4pt; line-height:1.16; color:var(--ink); margin-bottom:0.075in; letter-spacing:-0.008em; }
.svc .d { font-size:8.4pt; line-height:1.44; color:var(--ink-soft); }
.svc .s { margin-top:0.085in; font-family:'DejaVu Sans Mono',monospace; font-size:7.3pt; color:var(--orange); word-break:break-all; }
.svc .s::before { content:'\\21B3  '; }
.levels { display:grid; grid-template-columns:repeat(4,1fr); gap:0.115in; }
.level { border-radius:0.10in; padding:0.145in 0.145in 0.16in; color:#fff; background:linear-gradient(150deg,#0E2B48 0%,#0A2340 100%); position:relative; }
.level .k { font-family:'Poppins',sans-serif; font-size:6.9pt; font-weight:700; letter-spacing:0.13em; text-transform:uppercase; color:var(--orange-l); }
.level .n { position:absolute; top:0.13in; right:0.145in; font-family:'Poppins',sans-serif; font-weight:800; font-size:9.4pt; color:rgba(255,255,255,0.26); }
.level .t { font-family:'Poppins',sans-serif; font-weight:800; font-size:14pt; margin:0.035in 0 0.075in; letter-spacing:-0.015em; }
.level .d { font-size:7.9pt; line-height:1.36; color:rgba(255,255,255,0.76); }
.pubgrid { display:grid; grid-template-columns:repeat(3,1fr); gap:0.13in; margin-top:0.16in; }
.pub { background:#fff; border:1px solid var(--line); border-radius:0.09in; padding:0.14in 0.15in; }
.pub .hd { display:flex; justify-content:space-between; align-items:center; margin-bottom:0.06in; }
.pub .k { font-family:'Poppins',sans-serif; font-size:6.9pt; font-weight:700; letter-spacing:0.13em; text-transform:uppercase; color:var(--muted); }
.pub .tag { border-radius:0.30in; padding:0.026in 0.085in; font-family:'Poppins',sans-serif; font-weight:700; font-size:6.4pt; background:#E7EFF7; color:var(--navy-700); }
.pub .t { font-family:'Poppins',sans-serif; font-weight:700; font-size:11pt; line-height:1.14; color:var(--ink); margin-bottom:0.05in; letter-spacing:-0.01em; }
.pub .d { font-size:8.1pt; line-height:1.38; color:var(--ink-soft); }
.plats { display:grid; grid-template-columns:repeat(3,1fr); gap:0.115in; }
.plat { background:#fff; border:1px solid var(--line); border-radius:0.08in; padding:0.115in 0.14in; display:flex; justify-content:space-between; align-items:center; }
.plat .n { font-family:'Poppins',sans-serif; font-weight:700; font-size:11pt; color:var(--ink); }
.plat .g { font-family:'Poppins',sans-serif; font-weight:700; font-size:6.3pt; letter-spacing:0.11em; text-transform:uppercase; color:var(--teal); }
.qa { border-top:1px solid var(--line); padding:0.105in 0; }
.qa:first-of-type { border-top:none; padding-top:0; }
.qa .q { display:flex; gap:0.10in; align-items:baseline; margin-bottom:0.045in; }
.qa .q .m { font-family:'Poppins',sans-serif; font-weight:800; font-size:8.6pt; color:var(--orange); }
.qa .q .t { font-family:'Poppins',sans-serif; font-weight:700; font-size:9.4pt; color:var(--ink); }
.qa .a { font-size:8.6pt; line-height:1.44; color:var(--ink-soft); padding-left:0.20in; }
.srcgrid { display:grid; grid-template-columns:1fr 1fr; gap:0.055in 0.16in; }
.src { display:flex; justify-content:space-between; gap:0.10in; padding:0.062in 0.11in; background:var(--panel); border-radius:0.055in; font-size:8.2pt; }
.src .n { font-weight:600; color:var(--ink); }
.src .u { font-family:'DejaVu Sans Mono',monospace; font-size:7.1pt; color:var(--orange); text-align:right; }
.stamp { border:1px solid var(--line); border-radius:0.09in; background:#fff; padding:0.15in 0.17in; margin-top:0.16in; }
.stamp p { margin:0; font-size:8.2pt; line-height:1.46; color:var(--muted); }
.ck { list-style:none; margin:0; padding:0; }
.ck li { position:relative; padding-left:0.24in; margin-bottom:0.088in; font-size:9.0pt; line-height:1.42; }
.ck li::before {
  content:''; position:absolute; left:0; top:0.022in; width:0.135in; height:0.135in;
  border:1.3px solid var(--muted-l); border-radius:0.028in;
}
.rounds { display:grid; grid-template-columns:repeat(3,1fr); gap:0.14in; }
.round { background:#fff; border:1px solid var(--line); border-top:0.04in solid var(--orange); border-radius:0.09in; padding:0.15in 0.15in 0.16in; }
.round.b { border-top-color:var(--navy-700); }
.round.c { border-top-color:var(--coral); }
.round .k { font-family:'Poppins',sans-serif; font-weight:700; font-size:7.2pt; letter-spacing:0.14em; text-transform:uppercase; color:var(--orange); }
.round.b .k { color:var(--navy-700); } .round.c .k { color:var(--coral); }
.round .t { font-family:'Poppins',sans-serif; font-weight:700; font-size:10.2pt; color:var(--ink); margin:0.035in 0 0.08in; line-height:1.18; }
.round .d { font-size:8.2pt; line-height:1.40; color:var(--ink-soft); }
.round .bar { margin-top:0.10in; padding-top:0.085in; border-top:1px solid var(--line); font-size:7.8pt; line-height:1.38; color:var(--ink); }
.round .bar b { font-family:'Poppins',sans-serif; font-weight:700; }
"""


def document(title: str, pages: str) -> str:
    return (
        '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">'
        f"<title>{title}</title><style>{_font_faces()}\n{CSS}</style></head>"
        f"<body>{pages}</body></html>"
    )


def render(html: str, out_pdf: Path, work_dir: Path) -> None:
    work_dir.mkdir(parents=True, exist_ok=True)
    html_path = work_dir / (out_pdf.stem + ".html")
    html_path.write_text(html, encoding="utf-8")
    out_pdf.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            find_chrome(),
            "--headless=new",
            "--disable-gpu",
            "--no-sandbox",
            "--hide-scrollbars",
            "--no-pdf-header-footer",
            "--virtual-time-budget=6000",
            f"--print-to-pdf={out_pdf}",
            html_path.as_uri(),
        ],
        check=True,
        capture_output=True,
        text=True,
    )


def head(doc: str, section: str) -> str:
    return f'<div class="rhead"><div class="doc">{doc}</div><div class="sect">{section}</div></div>'


def foot(left: str, center: str, right: str) -> str:
    return (
        f'<div class="rfoot"><div class="l">{left}</div>'
        f'<div class="c">{center}</div><div class="r">{right}</div></div>'
    )


def page(body: str, *, doc: str, section: str, foot_left: str, foot_center: str, foot_right: str) -> str:
    return (
        '<section class="page"><div class="pad">'
        + head(doc, section)
        + f'<div class="flow">{body}</div>'
        + foot(foot_left, foot_center, foot_right)
        + "</div></section>"
    )


def dotrule() -> str:
    return (
        '<div class="dotrule"><span class="bar"></span>'
        '<i class="f1"></i><i class="f2"></i><i class="f3"></i><i></i></div>'
    )


# ---------------------------------------------------------------------------
# Inline line icons. Monochrome and stroke-based so they inherit the
# surrounding colour instead of dropping colour emoji into the layout.
# ---------------------------------------------------------------------------

_ICON_PATHS = {
    "idcard": '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/>'
              '<circle cx="8.5" cy="11" r="2.2"/><path d="M5.2 16.4a3.6 3.6 0 0 1 6.6 0"/>'
              '<path d="M14.8 10h4.2M14.8 13.4h4.2"/>',
    "flask": '<path d="M9 3h6M10 3v5.2L4.9 17.2A2.4 2.4 0 0 0 7 20.8h10a2.4 2.4 0 0 0 2.1-3.6L14 8.2V3"/>'
             '<path d="M7.4 14.4h9.2"/>',
    "traffic": '<rect x="7" y="2.6" width="10" height="18.8" rx="3"/>'
               '<circle cx="12" cy="7.2" r="1.7"/><circle cx="12" cy="12" r="1.7"/>'
               '<circle cx="12" cy="16.8" r="1.7"/>',
    "robot": '<rect x="4" y="8" width="16" height="11" rx="3"/><path d="M12 4.4V8"/>'
             '<circle cx="12" cy="3.2" r="1.5"/><circle cx="9.2" cy="13" r="1.3"/>'
             '<circle cx="14.8" cy="13" r="1.3"/><path d="M9.6 16.4h4.8M1.8 12v3M22.2 12v3"/>',
    "exchange": '<path d="M4 9h13l-3.2-3.2M20 15H7l3.2 3.2"/>',
    "question": '<circle cx="12" cy="12" r="9"/>'
                '<path d="M9.4 9.2a2.7 2.7 0 1 1 3.7 2.5c-.8.3-1.1.9-1.1 1.7v.4"/>'
                '<circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none"/>',
    "corner": '<path d="M8 4v8.5a2.5 2.5 0 0 0 2.5 2.5H19M15.4 11.2 19 15l-3.6 3.8"/>',
    "check": '<path d="M4.6 12.6 9.4 17.4 19.4 6.8"/>',
    "bang": '<path d="M12 4.2v9.4"/>'
            '<circle cx="12" cy="18.2" r="1.1" fill="currentColor" stroke="none"/>',
    "link": '<path d="M10.2 13.8a3.6 3.6 0 0 0 5.1 0l3-3a3.6 3.6 0 0 0-5.1-5.1l-1.3 1.3"/>'
            '<path d="M13.8 10.2a3.6 3.6 0 0 0-5.1 0l-3 3a3.6 3.6 0 0 0 5.1 5.1l1.3-1.3"/>',
}


def icon(name: str, size: str = "1em", width: str = "1.7") -> str:
    return (
        f'<svg viewBox="0 0 24 24" width="{size}" height="{size}" fill="none" '
        f'stroke="currentColor" stroke-width="{width}" stroke-linecap="round" '
        f'stroke-linejoin="round" style="display:block">{_ICON_PATHS[name]}</svg>'
    )
