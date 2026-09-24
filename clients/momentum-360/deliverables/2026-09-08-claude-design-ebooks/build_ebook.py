"""Momentum AI Field Notes — archival edition, native Claude Design (DCLogic).

Usage: python build_ebook.py <manuscript.md> <canvas_dir> <book_no> <fonts_dir> <brand_dir>

Emits <canvas_dir>/Ebook<N>.dc.html   native artboard: DCLogic component, {{ }} bindings
      ../out/ebook<N>-standalone.html  same markup, expanded, for PDF/screenshots

Native-runtime contract (verified inert otherwise by Root, 2026-09-08): plain <script> does NOT
run inside the Play artboard. All interactivity therefore goes through the supported pattern —
<script data-dc-script> + class Component extends DCLogic + renderVals() + {{ }} bindings +
onClick handlers, as used by EbookScorecard.dc.html. Everything that cannot be expressed that way
is done with no script at all: chapter navigation is real anchors, the Contents disclosure is
<details> (collapsed on mobile, forced open on desktop by CSS), and reveal motion is CSS
scroll-driven (animation-timeline: view()) behind @supports, defaulting to fully visible.

Visual authority: 2026-09-08-momentum-brand-system-v2 — tokens.css, scrapbook.css (.scrapbook,
sb-* vocabulary, sb-title/sb-settle .play), assets/paper-fibers.svg, icons-agents-etched.svg,
icons-marketing-etched.svg. Read-only: sprite bodies and the fibre texture are parsed at build
time, never edited. Logos stay byte-exact. Review draft, private.
"""
import sys, re, json, html, base64, random, pathlib, markdown

md_path, canvas_dir, book_no, fonts_dir, brand_dir = (pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2]), int(sys.argv[3]),
                                                      pathlib.Path(sys.argv[4]), pathlib.Path(sys.argv[5]))
raw = md_path.read_text(encoding="utf-8"); E = html.escape

# ---------- frontmatter ----------
fm, body, fm_raw = {}, raw, ""
m = re.match(r"^---\n(.*?)\n---\n(.*)$", raw, re.S)
if m:
    fm_raw, body = m.group(1), m.group(2); key = None
    for line in fm_raw.splitlines():
        if re.match(r"^\S", line):
            k, _, v = line.partition(":"); key = k.strip(); v = v.strip()
            fm[key] = [] if v == "" else ("" if v in (">", ">-") else v.strip("\"'"))
        elif key is not None:
            s = line.strip()
            if s.startswith("- "): fm[key] = (fm[key] if isinstance(fm[key], list) else []) + [s[2:].strip("\"'")]
            elif isinstance(fm[key], str): fm[key] = (fm[key] + " " + s).strip()
g = lambda k, d="": fm[k] if isinstance(fm.get(k), str) and fm.get(k) else d
lst = lambda k: fm[k] if isinstance(fm.get(k), list) else []
title, sub, author, series = g("title", "Untitled"), g("subtitle"), g("author"), g("series")
status, publishable = g("status", "draft"), str(fm.get("publishable", "false")).lower()
reason, words = g("publishable_reason"), g("word_count")
gates = [x.strip() for x in re.split(r"(?=\(\d\))", reason) if x.strip()] or [reason or "Review draft."]
sources, keywords = lst("sources"), lst("primary_keywords")

# ---------- review comments -> visible notes; markdown -> html ----------
def rev(mo):
    t = mo.group(1).strip()
    return (f'\n\n<aside class="rev"><b>Review note</b><pre>{E(t)}</pre></aside>\n\n' if "\n" in t
            else f' <mark class="rev">review note &middot; {E(t)}</mark> ')
body = re.sub(r"<!--(.*?)-->", rev, body, flags=re.S)
h = markdown.markdown(body, extensions=["tables", "sane_lists"])
h = re.sub(r"<hr\s*/?>", "", h)
h = re.sub(r"\[source: (.*?)\]", lambda x: f'<cite class="src">{x.group(1)}</cite>', h)
h = h.replace("<table>", '<div class="tw"><table>').replace("</table>", "</table></div>").replace("<h1>", "<h1 hidden>")
parts = re.split(r"(?=<h2>)", h); pre, chunks = parts[0], parts[1:]

# ---------- shared brand assets, parsed read-only ----------
def symbols(p):
    t = (brand_dir / "assets" / p).read_text(encoding="utf-8")
    return dict(re.findall(r'<symbol id="([^"]+)"[^>]*>(.*?)</symbol>', t, re.S))
AG, MK = symbols("icons-agents-etched.svg"), symbols("icons-marketing-etched.svg")
ICONS = dict(MK); ICONS.update(AG)  # agent ids win on collision (handoff)
FIBRE = base64.b64encode((brand_dir / "assets" / "paper-fibers.svg").read_bytes()).decode()
def ic(name, cls="icon sb-icon-etched"):
    return f'<svg class="{cls}" viewBox="0 0 32 32" aria-hidden="true">{ICONS[name]}</svg>'
ROUTE = {1: ["search", "content", "reporting", "brand"], 2: ["crm", "funnel", "conversion", "handoff"],
         3: ["designer", "reviewer", "video", "brand"], 4: ["planner", "automator", "memory", "coordinator"],
         5: ["reporting", "conversion", "crm", "analyst"]}
LANES = [("01 &middot; AEO / GEO", "search"), ("02 &middot; AI Design", "designer"),
         ("03 &middot; AI Marketing", "campaign"), ("04 &middot; AI Automation", "automator")]
CAPTION = {"hero-polyhedron.jpg": "Folded polyhedron, blue cardstock with gilt nodes", "fold.jpg": "The fold, raking light on cable and cardstock",
           "page-writes.jpg": "Page writes itself, bars in sequence", "bird-plate.jpg": "Bird plate, specimen at rest",
           "paper-city.jpg": "Paper city, rowhouse elevation", "scrapbook.jpg": "Scrapbook opener, layered leaves",
           "momo.jpg": "Momo, assistant character, three-quarter view", "particles-cream.jpg": "Particle ring, converging on cream"}
COVER = {1: "particles-cream.jpg", 2: "page-writes.jpg", 3: "fold.jpg", 4: "hero-polyhedron.jpg", 5: "bird-plate.jpg"}
IMGS = ["hero-polyhedron.jpg", "fold.jpg", "page-writes.jpg", "bird-plate.jpg", "paper-city.jpg", "scrapbook.jpg", "momo.jpg", "particles-cream.jpg"]
route, cover_img = ROUTE.get(book_no, ROUTE[1]), COVER.get(book_no, IMGS[-1])
b64 = lambda p: base64.b64encode((fonts_dir / p).read_bytes()).decode()
# Only the display face is inlined. Nunito Sans as base64 was 760KB per artboard and stalled the
# native preview (Root, 2026-09-08); the body stack falls back to Segoe UI / system-ui, which is
# metrically close at reading sizes. Archivo Black is the brand-critical voice and is only 91KB.
FONTS = (f"@font-face{{font-family:'Archivo Black';src:url(data:font/ttf;base64,{b64('ArchivoBlack-Regular.ttf')}) format('truetype');font-weight:400;font-display:swap}}")
rnd = random.Random(book_no * 97)
fox = ",".join(f"radial-gradient(circle at {rnd.randint(2,98)}% {rnd.randint(1,99)}%, rgba({rnd.randint(120,165)},{rnd.randint(85,120)},{rnd.randint(40,70)},.{rnd.randint(30,70):02d}) 0, transparent {rnd.randint(4,13)}px)" for _ in range(8))
words_span = lambda t: " ".join(f'<span>{E(w)}</span>' for w in t.split())

# ---------- sections ----------
toc, sections, shorts, ws_items, n = [], [], {}, [], 0
for c in chunks:
    head = re.match(r"<h2>(.*?)</h2>", c, re.S)
    if not head: continue
    text, rest = head.group(1), c[head.end():]
    num = re.match(r"(?:Chapter\s+)?(\d+)[.:]\s+(.*)", text)
    if num:
        n += 1; nn, ttl, sid = f"{n:02d}", num.group(2), f"ch-{n}"
        sa = re.search(r"<p><strong>Short answer[.:]?</strong>\s*(.*?)</p>", rest, re.S) or re.search(r"<p>(.*?)</p>", rest, re.S)
        if sa: shorts[n] = re.sub(r"<.*?>", "", sa.group(1))[:400]
        img = IMGS[(n - 1 + book_no) % len(IMGS)]
        toc.append((sid, nn, ttl))
        sections.append((n, sid, nn, ttl,
            f'<header class="op rv"><div class="ghost" aria-hidden="true">{nn}</div><div class="rule"></div>'
            f'<span class="sb-tab">Chapter {nn}</span><h2 class="ttl sb-title play" id="{sid}" tabindex="-1">{words_span(ttl)}</h2>'
            f'<figure class="spec sb-settle play"><div class="mat sb-frame"><img src="{img}" alt=""></div>'
            f'<figcaption class="sb-cutout-caption">Pl. {nn} &middot; {CAPTION.get(img, "Specimen")}</figcaption></figure></header>', rest, ""))
    else:
        sid = "sec-" + re.sub(r"[^a-z]+", "-", text.lower()).strip("-")
        kind = "ws" if "Monday" in text else ""
        if "About" in text:
            rest += '<div class="lanes">' + "".join(f'<div class="lane sb-trace"><span class="glyph">{ic(k)}</span><div class="ln">{l}</div></div>' for l, k in LANES) + "</div>"
        if kind:  # pull the worksheet list out so each row can be individually bound
            lm = re.search(r"<(ol|ul)>(.*?)</\1>", rest, re.S)
            if lm:
                ws_items = [re.sub(r"^\s*\[[ xX]?\]\s*", "", x).strip() for x in re.findall(r"<li>(.*?)</li>", lm.group(2), re.S)]
                rest = rest[:lm.start()] + "@@WORKSHEET@@" + rest[lm.end():]
        toc.append((sid, "", text))
        sections.append((0, sid, "", text,
            f'<header class="op rv"><div class="rule"></div><h2 class="ttl sb-title play" id="{sid}" tabindex="-1">{words_span(text)}</h2></header>', rest, kind))
pre = re.sub(r"<p><strong>How to read the (brackets|citations)\.</strong>(.*?)</p>",
             r'<aside class="note sb-paper"><div class="eyebrow">Reader&#39;s note &middot; how to read the \1</div><p>\2</p></aside>', pre, flags=re.S)
pre = re.sub(r"<p><em>(.*?)</em></p>", "", pre, count=1)
pre = re.sub(r"<p><strong>Momentum AI Field Notes.*?</strong></p>", "", pre, flags=re.S)
pre = re.sub(r"<p>Momentum AI Field Notes, No\. \d+\..*?</p>", "", pre, flags=re.S)
chs = [(s[0], s[1], s[2], s[3]) for s in sections if s[0]]
diag = [(k, dict((c[1], c[3]) for c in chs)[f"ch-{k}"], v) for k, v in shorts.items()]
label = lambda t: E(" ".join(t.split()[:5]) + ("…" if len(t.split()) > 5 else ""))
# Every in-document jump target. In the native artboard a bare #href resolves against
# the artifact origin and navigates the srcdoc preview away, so the dc variant routes
# all of them through DCLogic handlers named j<sanitised-id>; standalone keeps anchors.
JUMP_IDS = list(dict.fromkeys(["top", "ch-1"] + [s[0] for s in toc] + [c[1] for c in chs] + [f"ch-{k}" for k, _, _ in diag]))
def JK(tid): return "j" + re.sub(r"[^A-Za-z0-9]", "_", tid)
def lnk(dc, tid, inner, cls="", extra=""):
    if dc:
        c = (cls + " lnkb").strip()
        return f'<button type="button" class="{c}" onClick="{{{{ {JK(tid)} }}}}"{extra}>{inner}</button>'
    c = f' class="{cls}"' if cls else ""
    return f'<a{c} href="#{tid}"{extra}>{inner}</a>'
def tabs_html(dc):
    return "".join(lnk(dc, sid, f'<span class="tn">{nn or "&bull;"}</span><span class="tt">{E(t)}</span>',
                       cls="tab", extra=f' aria-label="{E(t)}"') for sid, nn, t in toc)
nodes = "".join(f'<g class="node sb-trace" tabindex="0" role="img" aria-label="{k}" transform="translate({80 + i * 160},78)">'
                f'<title>{k}</title><circle r="27"/>{ic(k, "icon sb-icon-etched ni")}<text y="52">{k.replace("-", " ")}</text></g>' for i, k in enumerate(route))
ROUTE_SVG = (f'<svg class="routemap diagram" viewBox="0 0 640 150" aria-label="Route: {" then ".join(route)}">'
             f'<path class="route" d="M80 78C150 18 170 138 240 78S330 18 400 78 490 138 560 78"/>'
             f'<path class="pulse" d="M80 78C150 18 170 138 240 78S330 18 400 78 490 138 560 78"/>{nodes}</svg>')

CSS = FONTS + r"""
.scrapbook{--archive-paper:#f5ecd5;--archive-sheet:#faf3e1;--archive-ink:#39372e;--archive-patina:#a18b66;--archive-line:#b8a887;
 --archive-caption:'Cormorant Garamond',Georgia,'Times New Roman',serif;--paper:var(--archive-sheet);--surface:#e9dfc8;
 --ink:var(--archive-ink);--muted:#645b48;--blue:#1e73be;--orange:#f58320;--orange-ink:#96490b;--deep:#0e1a22;--on-deep:#f2f6f8;--white:#fff;
 --type-small:.875rem;--ease:cubic-bezier(.16,1,.3,1);--dur:260ms;--rail:286px;--fibre:FIBREDATA;
 background-color:var(--archive-paper);color:var(--ink)}
*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:5rem}
body{margin:0;font:1.0625rem/1.68 'Nunito Sans','Segoe UI',system-ui,-apple-system,sans-serif;background-color:#f5ecd5;
 background-image:FIBREURL,FOXING,
  radial-gradient(ellipse at 16% 8%,rgba(161,139,102,.16),transparent 44%),
  radial-gradient(ellipse at 86% 24%,rgba(161,139,102,.13),transparent 40%),
  radial-gradient(ellipse at 50% 96%,rgba(161,139,102,.14),transparent 46%)}
::selection{background:var(--orange);color:var(--archive-ink)}
a{color:var(--blue);text-underline-offset:.2em}
:focus-visible{outline:2.5px solid var(--blue);outline-offset:4px;box-shadow:0 0 0 4px rgba(250,243,225,.9)}
button{font:inherit;cursor:pointer}
.disp,h2{font-family:'Archivo Black','Arial Black',Impact,sans-serif;font-weight:400;letter-spacing:-.03em;line-height:1.02}
.lnkb{appearance:none;-webkit-appearance:none;background:none;border:0;padding:0;margin:0;font:inherit;color:inherit;text-align:left;cursor:pointer;display:inline}
.skip{position:absolute;left:-999px;top:8px;background:var(--deep);color:var(--on-deep);padding:8px 14px;z-index:9}.skip:focus{left:8px}
/* shared physical vocabulary (scrapbook.css) */
.sb-paper{position:relative;background-color:var(--archive-sheet);background-image:FIBREURL;border:1px solid var(--archive-line);padding:34px;color:var(--archive-ink)}
.sb-layer{box-shadow:5px 5px 0 var(--surface),6px 6px 0 var(--archive-line),0 14px 30px rgb(57 55 46/10%)}
.sb-frame{padding:20px;border:1px solid var(--archive-line);outline:1px solid var(--archive-line);outline-offset:-8px;box-shadow:inset 0 2px 4px rgb(57 55 46/8%)}
.sb-tab{display:inline-block;background:var(--blue);color:var(--white);padding:6px 16px;font-size:var(--type-small);border-radius:3px 3px 0 0;font-weight:800;letter-spacing:.1em;text-transform:uppercase}
.sb-label{display:inline-flex;border:1px solid var(--archive-line);padding:4px 10px;font-size:var(--type-small);background:var(--archive-sheet);letter-spacing:.02em}
.sb-tape{position:relative}.sb-tape:before{content:'';position:absolute;top:-10px;left:34%;width:30%;height:22px;background:rgb(203 180 125/35%);border-top:1px solid rgb(161 139 102/25%);border-bottom:1px solid rgb(161 139 102/25%);transform:rotate(-3deg);pointer-events:none}
.sb-cutout-caption{display:inline-block;padding:8px 14px;background:var(--archive-sheet);border:1px solid var(--archive-line);clip-path:polygon(0 3%,99% 0,100% 96%,2% 100%);font-family:var(--archive-caption);font-style:italic;font-size:1.15rem;color:var(--archive-ink)}
.sb-index{border-top:3px double var(--archive-line);border-bottom:3px double var(--archive-line);padding:20px 0;display:grid;gap:10px}
.sb-source{display:block;border-top:1px solid var(--archive-line);padding-top:12px;margin-top:20px;font:var(--type-small)/1.5 'Nunito Sans',sans-serif;color:var(--muted)}
.sb-icon-etched{color:var(--archive-ink);stroke-width:1.2}
.icon{fill:none;stroke:currentColor;stroke-width:1.2;stroke-linecap:round;stroke-linejoin:round;display:block}
.sb-title>span{display:inline-block}.sb-settle{will-change:transform}
@keyframes sb-etch{from{stroke-dasharray:4 18;stroke-dashoffset:18}to{stroke-dasharray:40 0;stroke-dashoffset:0}}
@keyframes sb-type{from{clip-path:inset(0 0 92% 0);transform:translateY(8px);opacity:0}to{clip-path:inset(0);transform:none;opacity:1}}
@keyframes sb-settle{from{transform:translateY(6px) rotate(-.35deg);opacity:0}to{transform:none;opacity:1}}
.sb-trace:hover .sb-icon-etched,.sb-trace:focus .sb-icon-etched,.node:hover .sb-icon-etched,.node:focus .sb-icon-etched{animation:sb-etch 900ms var(--ease)}
/* ribbon */
.ribbon{position:sticky;top:0;z-index:8;background:var(--deep);color:var(--on-deep);font-size:12px;font-weight:800;letter-spacing:.12em;
 text-transform:uppercase;padding:8px 18px;display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap}
.ribbon .st{color:var(--orange)}.ribbon .nv{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.ribbon button{background:transparent;color:var(--on-deep);border:1px solid #6c7a83;font:inherit;letter-spacing:.08em;padding:5px 10px}
.ribbon button:hover{border-color:var(--orange)}.ribbon button[aria-pressed=true]{background:var(--orange);color:#241f18;border-color:var(--orange)}
.wrap{display:grid;grid-template-columns:var(--rail) minmax(0,1fr);min-height:100vh}
/* index tabs */
nav.toc{position:sticky;top:34px;align-self:start;height:calc(100vh - 34px);overflow:auto;padding:22px 0 40px 20px;
 border-right:1px solid var(--archive-line);background:linear-gradient(180deg,rgba(233,223,200,.7),rgba(233,223,200,.25))}
nav.toc summary{display:none}nav.toc .lk img{height:26px;width:auto;display:block;margin:0 0 16px 4px}
.eyebrow{font-size:12px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:var(--muted)}.eyebrow.on{color:var(--orange-ink)}
nav.toc .eyebrow{margin:0 0 10px 4px}
.tab{display:grid;grid-template-columns:30px 1fr;gap:8px;align-items:baseline;padding:9px 10px 9px 8px;margin:0 0 3px 0;text-decoration:none;
 color:var(--ink);font-size:13.5px;font-weight:700;line-height:1.32;background:rgba(250,243,225,.6);border:1px solid var(--archive-line);
 border-right:0;border-radius:3px 0 0 3px;transition:background var(--dur) var(--ease),transform var(--dur) var(--ease)}
.tab .tn{font-family:'Archivo Black',sans-serif;color:var(--archive-patina);font-size:14px}
.tab:hover,.tab:focus{background:var(--archive-sheet);transform:translateX(-3px)}
main{min-width:0}
/* cover */
.cover{padding:38px 52px 42px}
.cover .sheet{padding:48px 52px 40px;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:26px 44px;align-items:center}
.cover .lk,.cover .meta{grid-column:1/-1}.cover .lk img{height:38px;width:auto;display:block}
.cover .big{font-size:clamp(2.5rem,5.9vw,5.4rem);margin:10px 0 0;text-wrap:balance}
.cover .sub{font-family:var(--archive-caption);font-style:italic;font-size:clamp(1.3rem,2vw,1.7rem);line-height:1.3;color:var(--archive-ink);max-width:32ch;margin-top:14px}
.cover .meta{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;border-top:3px double var(--archive-line);padding-top:16px}
.cover .meta b{display:block;font-size:15px}.cover .meta small{color:var(--muted);font-weight:700;letter-spacing:.14em;text-transform:uppercase;font-size:11px}
.cover .mark{height:44px;width:auto}
.spec{margin:0}.mat{background:var(--archive-sheet);background-image:FIBREURL}
.mat img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;filter:sepia(.32) saturate(.7) contrast(1.05)}
figcaption{margin-top:12px}
/* review board + route */
.board{display:grid;grid-template-columns:1fr 1fr;background:var(--deep);color:var(--on-deep);margin:0 52px;border:12px solid var(--archive-sheet);outline:1px solid var(--archive-line)}
.board .copy{padding:34px 40px;display:flex;flex-direction:column;gap:16px;justify-content:space-between}
.board .copy .eyebrow{color:var(--orange)}.board .copy ol{margin:0;padding-left:20px;font-size:14.5px;line-height:1.55;color:#d6dde1}
.board .map{background-color:var(--archive-paper);background-image:FIBREURL;box-shadow:inset 0 0 0 1px var(--archive-line),inset 0 0 0 6px var(--archive-sheet);color:var(--archive-ink);padding:28px;display:flex;align-items:center}
.routemap{width:100%;height:auto;overflow:visible}
.routemap text{font:800 12px 'Nunito Sans',sans-serif;fill:currentColor;text-anchor:middle;text-transform:capitalize}
.routemap .route{fill:none;stroke:currentColor;stroke-width:1.5}
.routemap .pulse{fill:none;stroke:var(--blue);stroke-width:3;stroke-dasharray:30 600;animation:flow 5s linear infinite}
.routemap .node circle{fill:var(--archive-paper);stroke:currentColor;stroke-width:1.5;transition:fill var(--dur) var(--ease)}
.routemap .node .ni{width:30px;height:30px;x:-15px;y:-15px;overflow:visible}
.routemap .node:hover circle,.routemap .node:focus circle{fill:var(--archive-sheet)}.routemap .node:focus{outline:none}
@keyframes flow{to{stroke-dashoffset:-630}}
.glyph{display:inline-block;width:52px;height:52px;color:var(--archive-ink)}.glyph .icon{width:100%;height:100%}
/* reading */
section.ch{content-visibility:auto;contain-intrinsic-size:auto 1600px}
section.ch [id],main[id]{scroll-margin-top:48px}
.rd,.note,.pre{max-width:722px;padding:0 52px}.pre{padding-top:34px}
.op{position:relative;overflow:hidden;padding:72px 52px 32px;margin-top:48px;border-top:1px solid var(--archive-line)}
.ghost{position:absolute;top:-24px;right:-3%;font-family:'Archivo Black',sans-serif;font-size:clamp(170px,21vw,300px);line-height:1;letter-spacing:-.04em;color:rgba(161,139,102,.20);user-select:none}
.rule{position:absolute;left:34px;top:74px;width:2px;height:260px;background:var(--archive-patina)}
h2{font-size:clamp(1.95rem,3.9vw,3.5rem);max-width:min(16ch,66%);margin:12px 0 0;position:relative;text-wrap:balance}
.op .spec{margin-top:28px;max-width:560px}
.rd h3{font-size:1.45rem;font-weight:800;line-height:1.22;margin:36px 0 8px}.rd h4{font-size:1.08rem;margin:26px 0 6px}
.rd p{margin:0 0 18px}.rd li{margin:6px 0}
.rd blockquote{margin:22px 0;padding:16px 24px;border-left:2px solid var(--orange);background:rgba(250,243,225,.75)}
.rd strong{font-weight:800}.rd code{font:600 .92em ui-monospace,Consolas,monospace;background:rgba(233,223,200,.7);padding:1px 5px}
.tw{overflow-x:auto;margin:22px -8px}table{border-collapse:collapse;min-width:100%;font-size:14.5px}
th{text-align:left;font-size:11.5px;letter-spacing:.13em;text-transform:uppercase;color:var(--muted);padding:10px 8px;border-bottom:1.5px solid var(--archive-patina)}
td{padding:9px 8px;border-top:1px solid var(--archive-line);vertical-align:top}
.src{display:inline;font-style:italic;font-size:11.5px;color:var(--muted);background:rgba(250,243,225,.85);border:1px solid var(--archive-line);padding:1px 6px;margin-left:4px;vertical-align:1px}
.src::before{content:"source · ";font-style:normal;letter-spacing:.08em;text-transform:uppercase;font-size:9.5px}
.nosrc .src{display:none}
mark.rev{background:rgba(245,131,32,.16);color:var(--orange-ink);font-size:12.5px;font-weight:700;padding:1px 6px;border-left:2px solid var(--orange)}
aside.rev{margin:22px 0;background:rgba(245,131,32,.10);border-left:2px solid var(--orange);padding:13px 17px;font-size:13px}
aside.rev pre{white-space:pre-wrap;margin:8px 0 0;font:12.5px/1.5 ui-monospace,Consolas,monospace;color:var(--orange-ink)}
.note{margin:26px auto 0 0}.note p{margin:8px 0 0;font-size:15px;color:var(--muted)}
/* chapter foot nav: real anchors, no script */
.chnav{max-width:722px;padding:26px 52px 0;margin-top:26px;display:flex;justify-content:space-between;gap:16px;border-top:1px solid var(--archive-line)}
.chnav a,.chnav button{font-size:13px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;text-decoration:none;color:var(--muted)}
.chnav a:hover,.chnav button:hover{color:var(--orange-ink)}.chnav [aria-disabled=true]{opacity:.35;pointer-events:none}
/* diagram + worksheet */
.dgm{margin:40px 52px;max-width:900px;background:var(--deep);color:var(--on-deep);padding:26px 30px 24px;border:10px solid var(--archive-sheet);outline:1px solid var(--archive-line)}
.dgm .eyebrow{color:var(--orange)}.dgm .nodes{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0}
.dgm .nodes button{background:transparent;color:var(--on-deep);border:1px solid #6c7a83;font:800 13px 'Nunito Sans',sans-serif;padding:10px 14px;text-align:left;border-radius:3px}
.dgm .nodes button[aria-pressed=true]{background:var(--orange);color:#241f18;border-color:var(--orange)}
.dgm .out{font-size:16px;line-height:1.55;min-height:3.4em;margin-top:8px}.dgm .out a,.dgm .out button{color:#8fc6f2;text-decoration:underline}
.wsl{list-style:none;padding:0;margin:18px 0;border-bottom:1px solid var(--archive-line)}
.wsl li{display:grid;grid-template-columns:26px 1fr;gap:14px;align-items:start;padding:10px 12px;margin:0;border-top:1px solid var(--archive-line);cursor:pointer}
.wsl .bx{width:23px;height:23px;border:1.5px solid var(--archive-patina);margin-top:3px;display:grid;place-items:center;background:rgba(250,243,225,.8)}
.wsl li.done{background:rgba(250,243,225,.9)}.wsl li.done .bx{background:var(--archive-patina);border-color:var(--archive-patina)}
.wsl li.done .bx::after{content:"";width:10px;height:6px;border:2.2px solid var(--archive-sheet);border-top:0;border-right:0;transform:translateY(-2px) rotate(-45deg)}
.score{margin:24px 52px 8px;max-width:722px;background:var(--deep);color:var(--on-deep);padding:18px 24px;display:grid;grid-template-columns:120px 1fr;gap:20px;align-items:center}
.score .n{font-family:'Archivo Black',sans-serif;font-size:50px;line-height:1;color:var(--orange)}
.score .bar{height:5px;background:#1c2b35;margin-top:12px}.score .bar i{display:block;height:5px;background:var(--orange);transition:width .5s var(--ease)}
.lanes{display:grid;grid-template-columns:repeat(auto-fit,minmax(148px,1fr));gap:18px;margin:26px 0}
.lane{border-top:1.5px solid var(--archive-patina);padding-top:12px}.lane .glyph{width:42px;height:42px}
.ln{font-size:11.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin-top:8px}
.back{padding:46px 52px 72px;border-top:3px double var(--archive-line);max-width:900px}
.back ul{font-size:12.5px;color:var(--muted);line-height:1.5;padding-left:18px;word-break:break-all}
.back pre{white-space:pre-wrap;font:12px/1.5 ui-monospace,Consolas,monospace;color:var(--muted);background:rgba(250,243,225,.8);padding:16px;margin-top:10px;word-break:break-all}
.back .kw{font-size:12px;color:var(--muted)}
/* motion: CSS scroll-driven, no script. Default = fully visible. */
@supports (animation-timeline: view()){
 .rv .ghost{animation:g 1s var(--ease) both;animation-timeline:view();animation-range:entry 0% entry 40%}
 .sb-title.play>span{animation:sb-type .8s var(--ease) both;animation-timeline:view();animation-range:entry 0% entry 38%}
 .sb-title.play>span:nth-child(2){animation-delay:.06s}.sb-title.play>span:nth-child(3){animation-delay:.12s}
 .sb-title.play>span:nth-child(4){animation-delay:.18s}.sb-title.play>span:nth-child(n+5){animation-delay:.24s}
 .sb-settle.play{animation:sb-settle .9s var(--ease) both;animation-timeline:view();animation-range:entry 0% entry 42%}
}
@keyframes g{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:none}}
.paused *{animation-play-state:paused!important}
@media(max-width:1099px){
 .wrap{grid-template-columns:1fr}
 nav.toc{position:sticky;top:33px;z-index:7;height:auto;border-right:0;border-bottom:1px solid var(--archive-line);
  padding:7px 10px;background:var(--archive-sheet);display:flex;align-items:center;gap:6px;overflow-x:auto;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch}
 nav.toc .lk,nav.toc .eyebrow{display:none}
 nav.toc .tabs{display:flex;gap:6px}
 .tab{flex:0 0 auto;display:block;padding:7px 11px;margin:0;border:1px solid var(--archive-line);border-radius:3px;min-width:40px;text-align:center}
 .tab .tt{display:none}.tab .tn{font-size:13.5px}
 .tab:hover,.tab:focus{transform:none;background:var(--archive-paper)}
 .cover{padding:14px}.cover .sheet{grid-template-columns:1fr;padding:28px 22px 26px;gap:20px}
 .board{grid-template-columns:1fr;margin:0 14px;border-width:8px}.board .copy{padding:24px 20px}
 .op,.dgm,.score,.chnav{padding-left:20px;padding-right:20px}.dgm,.score{margin-left:14px;margin-right:14px}
 .rd,.note,.pre,.back{padding-left:20px;padding-right:20px}.rule{left:8px}h2{max-width:none}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*::before,*::after{animation:none!important;transition:none!important}}
@media print{.ribbon,nav.toc,.dgm .nodes,.chnav{display:none!important}.wrap{display:block}
 section.ch{content-visibility:visible!important}
 html,body{margin:0;padding:0}main{padding-bottom:0}
 .back{padding-bottom:0;break-after:avoid}main>section:last-child,main>section:last-child>*:last-child{margin-bottom:0}

 body{background:#f6f1e4!important;font-size:12.4px}.ch{break-before:page}.cover{break-after:avoid;padding:0}
 .board{break-after:page;margin:0;border-width:6px}.op{page-break-inside:avoid}
 *{animation:none!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}}
""".replace("FIBREDATA", f"url(data:image/svg+xml;base64,{FIBRE})").replace("FIBREURL", "var(--fibre)").replace("FOXING", fox)

# ---------- interactive islands: DC bindings vs expanded static ----------
def ws_block(dc):
    if not ws_items: return ""
    rows = "".join(
        (f'<li class="{{{{ w{i}cls }}}}" onClick="{{{{ w{i}pick }}}}" role="checkbox" aria-checked="{{{{ w{i}on }}}}" tabindex="0">'
         if dc else f'<li role="checkbox" aria-checked="false" tabindex="0">')
        + f'<span class="bx"></span><span class="t">{t}</span></li>' for i, t in enumerate(ws_items))
    return f'<ul class="wsl">{rows}</ul>'
def score_block(dc):
    if not ws_items: return ""
    nv, pv = ("{{ score }}", "{{ pct }}") if dc else ("0", "0")
    return (f'<div class="score" aria-live="polite"><div class="n">{nv} / {len(ws_items)}</div><div>'
            f'<div class="eyebrow on">Monday worksheet</div><div>Tick what you&#39;ve done. Kept in this view only.</div>'
            f'<div class="bar"><i style="width:{pv}%"></i></div></div></div>')
def diag_block(dc):
    if not diag: return ""
    btns = "".join((f'<button onClick="{{{{ d{i}pick }}}}" aria-pressed="{{{{ d{i}on }}}}">' if dc else '<button aria-pressed="false">')
                   + f'{k:02d} &middot; {label(t)}</button>' for i, (k, t, s) in enumerate(diag))
    out = ('<strong>{{ dTitle }}</strong> {{ dText }} <button type="button" class="lnkb" onClick="{{ dJump }}">Read the chapter</button>' if dc
           else 'Pick a chapter. Its own opening answer appears here, in the book&#39;s words.')
    return (f'<section class="dgm" aria-label="The book, chapter by chapter"><div class="eyebrow">The method, chapter by chapter</div>'
            f'<div class="nodes">{btns}</div><div class="out">{out}</div></section>')

def build(dc):
    root = 'class="scrapbook {{ rootCls }}"' if dc else 'class="scrapbook"'
    srcb = ('<button onClick="{{ toggleSrc }}" aria-pressed="{{ srcOn }}">{{ srcLabel }}</button>'
            '<button onClick="{{ toggleMotion }}" aria-pressed="{{ moOn }}">{{ moLabel }}</button>') if dc else \
           ('<button aria-pressed="false">Sources: shown</button><button aria-pressed="false">Motion: on</button>')
    secs = []
    for idx, (num, sid, nn, ttl, opener, rest, kind) in enumerate(sections):
        rest = rest.replace("@@WORKSHEET@@", ws_block(dc) + score_block(dc)) if kind else rest
        nav = ""
        if num:
            p = next((c for c in chs if c[0] == num - 1), None); q = next((c for c in chs if c[0] == num + 1), None)
            nav = ('<nav class="chnav" aria-label="Chapter navigation">'
                   + (lnk(dc, p[1], f'&lsaquo; {p[2]} {E(" ".join(p[3].split()[:4]))}') if p else '<a aria-disabled="true">&lsaquo; Start</a>')
                   + (lnk(dc, q[1], f'{q[2]} {E(" ".join(q[3].split()[:4]))} &rsaquo;') if q else lnk(dc, "top", "Back to cover &rsaquo;"))
                   + '</nav>')
        secs.append(f'<section class="ch{" " + kind if kind else ""}"{f" data-n={num}" if num else ""}>{opener}<div class="rd">{rest}</div>{nav}</section>')
    return f"""<div {root}>
{lnk(dc, "ch-1", "Skip to chapter one", cls="skip")}
<div class="ribbon" role="status"><div>Review draft &middot; <span class="st">not publishable</span> &middot; status: {E(status)} &middot; No. {book_no}</div><div class="nv">{srcb}</div></div>
<div class="wrap">
<nav class="toc" aria-label="Contents"><div class="lk"><img src="momentum-logo.png" alt="Momentum"></div><div class="eyebrow">Plates &amp; chapters</div><div class="tabs">{tabs_html(dc)}</div></nav>
<main id="top">
<section class="cover"><div class="sheet sb-paper sb-layer"><div class="lk"><img src="momentum-logo.png" alt="Momentum"></div>
<div><span class="sb-tab">{E(series)}</span><h1 class="disp big ttl sb-title play">{words_span(title)}</h1><div class="sub">{E(sub)}</div></div>
<figure class="spec sb-settle play"><div class="mat sb-frame"><img src="{cover_img}" alt=""></div><figcaption class="sb-cutout-caption">Frontispiece &middot; {CAPTION.get(cover_img, "Specimen")}</figcaption></figure>
<div class="meta"><div><b>{E(author)}</b><small>Momentum Digital &middot; Philadelphia &middot; {E(words)} words</small></div><img class="mark" src="momentum-mark.png" alt="Momentum mark"></div></div></section>
<section class="board" aria-label="Publication review and route"><div class="copy"><div><div class="eyebrow">Publication review &middot; publishable: {E(publishable)}</div><ol>{"".join(f"<li>{E(x)}</li>" for x in gates)}</ol></div><div class="eyebrow">The route this book runs</div></div><div class="map">{ROUTE_SVG}</div></section>
<div class="pre">{pre}</div>
{diag_block(dc)}
{"".join(secs)}
<section class="back"><div class="eyebrow">Frontmatter sources ({len(sources)})</div><ul>{"".join(f"<li>{E(s)}</li>" for s in sources)}</ul><p class="kw">Target query: {E(g("target_query"))} &middot; Keywords: {E(", ".join(keywords))}</p><div class="eyebrow">Manuscript frontmatter, verbatim</div><pre>{E(fm_raw)}</pre></section>
</main></div></div>"""

# ---------- DCLogic component ----------
DIAGJS = json.dumps([{"n": k, "t": t, "s": s} for k, t, s in diag])
DC_SCRIPT = f"""<script data-dc-script data-props='{{"$preview":{{"width":1200,"height":900}}}}'>
const DIAG = {DIAGJS};
const WS = {len(ws_items)};
const JUMPS = {json.dumps(JUMP_IDS)};
// In-document navigation: resolve the full layout before reading the target.
// Keep sections visible after navigation so placeholder heights cannot shift it.
function go(id) {{
  const el = document.getElementById(id); if (!el) return;
  const ss = [].slice.call(document.querySelectorAll('section.ch'));
  ss.forEach(function (x) {{ x.style.contentVisibility = 'visible'; }});
  void document.documentElement.offsetHeight;
  el.scrollIntoView({{ block: 'start', behavior: 'instant' }});
}}
class Component extends DCLogic {{
  renderVals() {{
    const st = this.state || {{}};
    const on = st.on || {{}};
    const nosrc = !!st.nosrc, paused = !!st.paused;
    const pick = st.pick === undefined ? 0 : st.pick;
    const vals = {{
      rootCls: (nosrc ? 'nosrc ' : '') + (paused ? 'paused' : ''),
      srcOn: nosrc, srcLabel: nosrc ? 'Sources: hidden' : 'Sources: shown',
      moOn: paused, moLabel: paused ? 'Motion: paused' : 'Motion: on',
      toggleSrc: () => this.setState({{ nosrc: !nosrc }}),
      toggleMotion: () => this.setState({{ paused: !paused }}),
    }};
    let done = 0;
    for (let i = 0; i < WS; i++) {{
      const isOn = !!on[i];
      if (isOn) done++;
      vals['w' + i + 'cls'] = isOn ? 'done' : '';
      vals['w' + i + 'on'] = isOn;
      vals['w' + i + 'pick'] = () => {{
        const next = Object.assign({{}}, on); next[i] = !isOn; this.setState({{ on: next }});
      }};
    }}
    vals.score = done;
    vals.pct = WS ? Math.round((100 * done) / WS) : 0;
    DIAG.forEach((d, i) => {{
      vals['d' + i + 'on'] = pick === i;
      vals['d' + i + 'pick'] = () => this.setState({{ pick: i }});
    }});
    const cur = DIAG[pick] || DIAG[0];
    vals.dTitle = cur ? cur.t : '';
    vals.dText = cur ? cur.s : '';
    vals.dJump = () => go(cur ? 'ch-' + cur.n : 'top');
    JUMPS.forEach(function (id) {{ vals['j' + id.replace(/[^A-Za-z0-9]/g, '_')] = function () {{ go(id); }}; }});
    return vals;
  }}
}}
</script>"""
# standalone keeps a classic script purely so the PDF/screenshot pass can exercise the same states
SA_SCRIPT = """<script>
(function(){var B=document.querySelector('.scrapbook');var b=document.querySelectorAll('.ribbon button');
b[0]&&(b[0].onclick=function(){var o=B.classList.toggle('nosrc');b[0].textContent=o?'Sources: hidden':'Sources: shown';b[0].setAttribute('aria-pressed',o)});
b[1]&&(b[1].onclick=function(){var o=B.classList.toggle('paused');b[1].textContent=o?'Motion: paused':'Motion: on';b[1].setAttribute('aria-pressed',o)});
var D=DIAGDATA,btn=document.querySelectorAll('.dgm button'),out=document.querySelector('.dgm .out');
btn.forEach(function(x,i){x.onclick=function(){btn.forEach(function(y){y.setAttribute('aria-pressed','false')});x.setAttribute('aria-pressed','true');
 out.innerHTML='<strong>'+D[i].t+'</strong> '+D[i].s+' <a href="#ch-'+D[i].n+'">Read the chapter</a>'}});
var li=document.querySelectorAll('.wsl li'),sc=document.querySelector('.score .n'),bar=document.querySelector('.score .bar i');
function upd(){var k=0;li.forEach(function(l){if(l.classList.contains('done'))k++});if(sc)sc.firstChild.textContent=k+' ';if(bar)bar.style.width=(li.length?100*k/li.length:0)+'%'}
li.forEach(function(l){function t(){l.classList.toggle('done');l.setAttribute('aria-checked',l.classList.contains('done'));upd()}
 l.onclick=t;l.onkeydown=function(e){if(e.key===' '||e.key==='Enter'){e.preventDefault();t()}}});
addEventListener('keydown',function(e){if(/INPUT|TEXTAREA|BUTTON|SUMMARY|A/.test(e.target.tagName))return;
 var ids=[].map.call(document.querySelectorAll('section.ch [id]'),function(x){return x});if(!ids.length)return;
 var y=scrollY+120,i=0;ids.forEach(function(hh,k){if(hh.offsetTop<=y)i=k});
 if(e.key==='ArrowRight'||e.key===']'){var t1=ids[Math.min(i+1,ids.length-1)];t1&&t1.scrollIntoView()}
 if(e.key==='ArrowLeft'||e.key==='['){var t2=ids[Math.max(i-1,0)];t2&&t2.scrollIntoView()}});
})();
</script>""".replace("DIAGDATA", DIAGJS)

dc_html = (f'<!doctype html>\n<html>\n<head>\n  <meta charset="utf-8">\n  <script src="./support.js"></script>\n</head>\n<body>\n'
           f'<x-dc>\n<helmet>\n  <style>{CSS}</style>\n</helmet>\n{build(True)}\n</x-dc>\n{DC_SCRIPT}\n</body>\n</html>\n')
sa_html = (f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
           f'<title>{E(title)} — review draft</title><style>{CSS}</style></head><body>{build(False)}{SA_SCRIPT}</body></html>')
(canvas_dir / f"Ebook{book_no}.dc.html").write_text(dc_html, encoding="utf-8", newline="\n")
out = canvas_dir.parent / "out"; out.mkdir(exist_ok=True)
(out / f"ebook{book_no}-standalone.html").write_text(sa_html, encoding="utf-8", newline="\n")

cj = canvas_dir / "canvas.json"; c = json.loads(cj.read_text(encoding="utf-8"))
pid, fn = f"page-ebook-{book_no}", f"Ebook{book_no}.dc.html"
c["pages"] = [p for p in c.get("pages", []) if p["id"] != pid] + [{"id": pid, "name": f"Ebook {book_no} · {title}"}]
c["artboards"] = [a for a in c.get("artboards", []) if a["file"] != fn] + [
    {"file": fn, "title": f"Ebook {book_no} · interactive (review draft)", "x": 0, "y": 0, "w": 1200, "h": 36000,
     "page": pid, "expand": "fill", "print": "flow", "is_interactive": True}]
c["annotations"] = [a for a in c.get("annotations", []) if a["id"] != f"note-ebook-{book_no}"] + [
    {"id": f"note-ebook-{book_no}", "x": 0, "y": -150, "w": 540,
     "text": (f"REVIEW DRAFT. publishable: {publishable}. Full manuscript ({words} words), archival plate edition. "
              "Native interactions run on DCLogic: Sources toggle, Motion pause, method diagram, Monday worksheet. "
              "Chapter navigation and the Contents disclosure are plain anchors/<details>, so they work with no script."), "page": pid}]
cj.write_text(json.dumps(c, indent=2), encoding="utf-8")
print(f"book {book_no}: {n} ch, {len(toc)} sec, {len(diag)} nodes, {len(ws_items)} worksheet rows, {len(gates)} gates, route {'+'.join(route)}")
