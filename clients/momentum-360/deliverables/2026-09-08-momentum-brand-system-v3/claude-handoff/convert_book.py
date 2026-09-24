"""One v3 book HTML -> one native DCLogic artboard. Also builds the brand-art overview.

Root's HTML/CSS/JS/assets are inputs only; every output lands in claude-handoff/build/.

Two things the native artboard cannot inherit from the local site:
  * plain <script> is inert in native Play, so app.js is reimplemented;
  * a bare #href resolves against the artifact origin inside the srcdoc iframe and navigates the
    preview away, so every in-document link becomes a handler-bound button.

Split of responsibility, chosen to keep the DCLogic dialect surface small:
  * DCLogic bindings, onClick only (the pattern already proven in native Play): motion pause,
    mobile contents menu, the four-step diagram, and every in-document jump.
  * Installed once and written straight to the DOM: chapter search, scroll-spy, reading progress,
    checklist count. These are either per-frame or driven by browser-owned control state, and
    neither belongs in setState.

No content-visibility is introduced: that containment is what made the previous edition's cold
jumps land on placeholder geometry.
"""
import base64, json, pathlib, re, sys
from typing import NoReturn

HERE = pathlib.Path(__file__).resolve().parent
V3 = HERE.parent
BUILD = HERE / "build"

# Only the display face is inlined. NunitoSans is 558 KB; six artboards of that is 4.4 MB of base64
# and font weight of exactly that kind stalled the native preview in the previous edition.
BODY_STACK = 'system-ui,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif'



def fail(msg) -> NoReturn:
    sys.exit("convert_book: " + msg)


def font_css():
    ttf = V3 / "assets" / "ArchivoBlack-Regular.ttf"
    if not ttf.exists():
        fail(f"missing display font {ttf}")
    return ("@font-face{font-family:Archivo;src:url(data:font/ttf;base64,"
            + base64.b64encode(ttf.read_bytes()).decode()
            + ") format('truetype');font-weight:900;font-display:swap}")


# Anchor-shaped buttons, deterministic scrolling, body-face fallback. Appended after style.css so
# it wins on equal specificity; style.css itself is never edited.
OVERRIDES = """
html{scroll-behavior:auto}
:root{--body:BODYSTACK}
.chapter-links button,.search-results button{-webkit-appearance:none;appearance:none;background:none;border:0;font:inherit;color:inherit;text-align:left;width:100%;display:block;cursor:pointer}
.chapter-links button{padding:9px 10px;border-radius:5px;line-height:1.45;color:var(--muted);border-left:2px solid transparent}
.chapter-links button:hover,.chapter-links button.active{background:var(--pale);color:var(--navy);border-left-color:var(--gold)}
.search-results button{padding:10px;background:var(--pale);border-radius:5px;font-size:13px;margin-bottom:10px}
.search-results button strong{display:block;color:var(--navy)}
button.skip{-webkit-appearance:none;appearance:none;border:0;font:inherit;cursor:pointer;position:fixed;top:-100px;left:20px;z-index:50;padding:12px;background:var(--gold);color:var(--night)}
button.skip:focus{top:10px}
.artboard-ref{display:inline-flex;align-items:center;gap:10px;padding:10px 16px;border:1px dashed var(--line);border-radius:8px;font-size:13px;font-weight:900;color:var(--muted);align-self:flex-start;text-decoration:none}
.brand-gallery .artboard-ref{margin-top:14px;font-size:12px;padding:8px 12px}
.artboard-note{font-size:13px;line-height:1.6;color:var(--muted);background:var(--pale);border-left:3px solid var(--gold);border-radius:0 8px 8px 0;padding:14px 18px;margin:18px 0 4px;max-width:none;display:flex;flex-wrap:wrap;align-items:center;gap:10px}
.artboard-note strong{color:var(--navy);font-weight:900}
.artboard-note .artboard-ref{margin:0;font-size:12px;padding:7px 12px;background:var(--paper)}
""".replace("BODYSTACK", BODY_STACK)


STYLESHEETS = ["style.css", "exercises.css"]


def site_css():
    """Every stylesheet the pages link, in order, minus style.css's @font-face rules. Those point at
    relative assets/*.ttf that do not resolve inside an artboard, and the Archivo rule would
    otherwise override the inlined data-URI face declared before it, dropping the display font."""
    out = []
    for name in STYLESHEETS:
        p = V3 / name
        if not p.exists():
            fail(f"stylesheet not found: {name}")
        css = p.read_text(encoding="utf-8")
        if name == "style.css":
            css, n = re.subn(r"@font-face\{[^}]*\}", "", css)
            if n < 2:
                fail(f"style.css: expected 2 @font-face rules to strip, found {n}")
        out.append(css)
    return "".join(out)


def check_stylesheets(raw, page):
    """The pages must not gain a stylesheet the converter does not inline."""
    linked = re.findall(r'<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"', raw)
    missed = [h for h in linked if h not in STYLESHEETS]
    if missed:
        fail(f"{page}: stylesheet(s) not inlined: {', '.join(missed)}")
    return linked


def jk(tid):
    return "j" + re.sub(r"[^A-Za-z0-9]", "_", tid)


# ---------------------------------------------------------------- source surgery

def body_of(html):
    m = re.search(r'<body([^>]*)>(.*)</body>', html, re.S)
    if not m:
        fail("no <body> found")
    cls = re.search(r'class="([^"]*)"', m.group(1))
    return (cls.group(1) if cls else ""), m.group(2)


def rewrite_assets(html, amap):
    """assets/foo.png -> packaged filename. An unmapped src aborts the build: the canvas renders a
    missing files entry as a broken image with no warning at all."""
    def one(m):
        whole, src = m.group(0), m.group(1)
        if not src.startswith("assets/"):
            return whole
        if src not in amap:
            fail(f"unmapped image reference {src!r} — re-run pack_assets.py")
        return whole.replace('"' + src + '"', '"' + amap[src] + '"')
    return re.sub(r'<img[^>]*?src="([^"]+)"[^>]*>', one, html)


def rewrite_anchors(html):
    """Every in-document anchor becomes a handler-bound button carrying data-target for scroll-spy."""
    ids = []

    def one(m):
        attrs, inner = m.group(1), m.group(2)
        h = re.search(r'href="#([^"]*)"', attrs)
        if not h:
            return m.group(0)
        tid = h.group(1) or "main"
        if tid not in ids:
            ids.append(tid)
        rest = re.sub(r'\s*href="#[^"]*"', "", attrs)
        return (f'<button type="button"{rest} data-target="{tid}" '
                f'onClick="{{{{ {jk(tid)} }}}}">{inner}</button>')

    return re.sub(r'<a([^>]*href="#[^"]*"[^>]*)>(.*?)</a>', one, html, flags=re.S), ids


GALLERY_CATS = ["agents", "services", "imagery"]


def gallery_sets():
    """The 15-asset gallery lives in app.js as `const sets={...}` and is injected at runtime.
    Read it from there rather than restating it, so the artboard cannot drift from the site."""
    t = (V3 / "app.js").read_text(encoding="utf-8")
    i = t.find("const sets=")
    if i < 0:
        fail("app.js: gallery `const sets=` not found")
    out, total = {}, 0
    for cat in GALLERY_CATS:
        j = t.find(cat + ":[", i)
        if j < 0:
            fail(f"app.js: gallery category {cat!r} not found")
        depth, k = 0, t.index("[", j)
        for k in range(t.index("[", j), len(t)):
            if t[k] == "[":
                depth += 1
            elif t[k] == "]":
                depth -= 1
                if depth == 0:
                    break
        rows = re.findall(r"\['([^']*)','([^']*)','([^']*)'\]", t[j:k + 1])
        if not rows:
            fail(f"app.js: no entries parsed for gallery category {cat!r}")
        out[cat] = rows
        total += len(rows)
    if total != 15:
        fail(f"app.js: expected 15 gallery assets, parsed {total}")
    return out


MIME = {".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg"}


def gallery_data(amap):
    """Gallery rows carrying their image bytes inline as data: URIs.

    The gallery is rendered by swapping innerHTML, exactly as app.js does, because exercises.js
    watches #brand-gallery with a MutationObserver and indexes `querySelectorAll('figure')` against
    a six-entry role list. Pre-rendering all fifteen figures as siblings would hand it fifteen and
    inject undefined motion studies into nine of them.

    But a packaged filename only resolves where the canvas runtime can see it: it substitutes files
    entries by literal filename in the STATIC source, and never touches a src assembled at runtime.
    A relative name written by innerHTML therefore resolves against the artifact origin and 404s —
    which is exactly what broke every gallery image in the published artboard. So these fifteen
    carry their own bytes. They cost ~650 KB of base64 on this one artboard, duplicated from the
    files entries the static <img> tags use; that is the price of a runtime-built gallery.
    """
    rows = []
    for cat, entries in gallery_sets().items():
        for f, title, copy in entries:
            key = "assets/%s.png" % f
            if key not in amap:
                fail(f"gallery asset {key!r} is not in the packaged set")
            packed = BUILD / "assets" / amap[key]
            if not packed.exists():
                fail(f"packaged file missing: {packed} — run pack_assets.py first")
            mime = MIME.get(packed.suffix.lower())
            if not mime:
                fail(f"no mime type for packaged gallery asset {packed.name}")
            uri = "data:%s;base64,%s" % (
                mime, base64.b64encode(packed.read_bytes()).decode())
            rows.append({"cat": cat, "file": uri, "orig": f + ".png",
                         "title": title, "copy": copy})
    return rows


def bind_controls(html, mode, amap=None):
    """Attach the onClick-bound controls. Each pattern must match, or the build fails: a v3 markup
    change should surface here rather than silently dropping an interaction."""
    n = {}
    is_book = mode == "book"

    def need(name, pattern, repl, count=1):
        nonlocal html
        html, k = re.subn(pattern, repl, html, flags=re.S)
        if k != count:
            fail(f"control {name!r}: matched {k} times, expected {count}")
        n[name] = k

    need("motion-toggle",
         r'<button class="text-button" id="motion-toggle"[^>]*>.*?</button>',
         '<button class="text-button" id="motion-toggle" aria-pressed="{{ moOn }}" '
         'onClick="{{ toggleMotion }}">{{ moLabel }}</button>')

    # The brand gallery and the identity demo stay unbound on purpose: both are app.js behaviour,
    # reimplemented imperatively below so exercises.js's MutationObserver sees the same innerHTML
    # swap it was written against. Binding them would break that contract.

    if is_book:
        need("mobile-menu", r'<button([^>]*id="mobile-menu"[^>]*)>(.*?)</button>',
             lambda m: ('<button' + re.sub(r'\s*aria-expanded="[^"]*"', "", m.group(1))
                        + ' aria-expanded="{{ menuExpanded }}" onClick="{{ toggleMenu }}">'
                        + m.group(2) + '</button>'))
        need("reader-nav", r'<aside class="reader-nav" id="reader-nav">',
             '<aside class="{{ navCls }}" id="reader-nav">')
        need("check-status", r'<p([^>]*id="check-status"[^>]*)>.*?</p>',
             lambda m: '<p' + m.group(1) + '>{{ checkStatus }}</p>')

        # The generic four-step diagram is gone from the final source; #diagram-detail survives as a
        # hidden node the exercises own. Bind the steps only while they exist, and never touch
        # #diagram-detail when they do not — blanking it would take content the exercises write.
        def step(m):
            i = m.group(2)
            head = re.sub(r'\s*aria-pressed="[^"]*"', "", m.group(1) + m.group(3))
            return (f'<button{head} data-step="{i}" aria-pressed="{{{{ d{i}on }}}}" '
                    f'onClick="{{{{ d{i}pick }}}}">')
        html, k = re.subn(r'<button([^>]*?)data-step="(\d)"([^>]*)>', step, html)
        if k not in (0, 4):
            fail(f"diagram steps: matched {k}, expected 0 or 4")
        n["diagram-steps"] = k
        if k == 4:
            need("diagram-detail", r'<p([^>]*id="diagram-detail"[^>]*)>.*?</p>',
                 lambda m: '<p' + m.group(1) + '>{{ stepDetail }}</p>')

        # #book-data STAYS: exercises.js reads it for the book slug that keys its saved state.
        if 'id="book-data"' not in html:
            fail("book-data script missing — exercises.js depends on it")

        # exercises.js exports through URL.createObjectURL + a.click(), which the viewer sandbox
        # blocks. The button stays (it is not ours to change) but must not look simply broken, so
        # say what happens and where the editable copy lives, right beside the controls.
        need("export-note", r'(<div id="exercise-root"></div>)',
             lambda m: m.group(1) + (
                 '<p class="artboard-note"><strong>Reading this in the embedded viewer:</strong> '
                 'the exercise works and your entries stay on screen, but they are held in memory '
                 'for this view only — browser storage is unavailable here, so nothing is '
                 'saved and a reload clears it. File export (CSV/report) is blocked for the same '
                 'reason. The exercise never sends anything anywhere either way. '
                 f'<a class="artboard-ref" href="{BUNDLE_URL}" target="_blank" rel="noopener">'
                 'Open the editable bundle</a></p>'))

    # Every <script src> tag goes; app.js is reimplemented above, and the rest are re-executed
    # verbatim by the component after mount (see external_scripts).
    html = re.sub(r'<script src="[^"]+"></script>', "", html)
    return html, n


# ---------------------------------------------------------------- the component

COMPONENT = r"""<script data-dc-script data-props='{"$preview":{"width":1440,"height":900}}'>
// BOOK is read from the page's own #book-data at mount, not embedded here: exercises.js reads the
// same node for the slug that keys its saved state, so the tag has to stay in the markup and there
// is no reason to carry 50 KB of chapter text twice.
let BOOK = {};
const JUMPS = __JUMPS__;
const STEPS = __STEPS__;
const GALLERY = __GALLERY__;
const BUNDLE = __BUNDLE__;
__EXTRAS__

function go(id) {
  const el = document.getElementById(id);
  if (!el) return;
  // Numbered citations point at <details> in .chapter-citations: open it before scrolling, so the
  // reader lands on expanded source text and the scroll uses settled geometry.
  if (el.tagName === 'DETAILS') el.open = true;
  const host = el.closest ? el.closest('details') : null;
  if (host) host.open = true;
  el.scrollIntoView({ block: 'start', behavior: 'instant' });
}

// Installed once. Everything here is either per-scroll-frame or driven by browser-owned control
// state (checkbox checked, input value), so it writes to the DOM directly instead of re-rendering
// the component across a 40 000px document.
let wired = false;
function wire(setStatus) {
  if (wired) return;
  const links = [].slice.call(document.querySelectorAll('.chapter-links button'));
  const chapters = [].slice.call(document.querySelectorAll('.chapter'));
  const bar = document.getElementById('reading-progress');
  const reader = document.querySelector('.reader');
  const input = document.getElementById('book-search') || document.getElementById('library-search');
  // Every v3 page carries the topbar, so its absence means the artboard has not mounted yet. The
  // brand page has no reader controls at all, and must still reach runExtras() below.
  if (!document.querySelector('.topbar')) return;
  wired = true;

  const bookData = document.getElementById('book-data');
  if (bookData) { try { BOOK = JSON.parse(bookData.textContent); } catch (e) { BOOK = {}; } }

  // app.js's gallery, reimplemented as it is written: an innerHTML swap plus data-category. That
  // exact mutation is what exercises.js observes to attach role motion to the six service icons.
  const gal = document.getElementById('brand-gallery');
  if (gal && GALLERY.length) {
    const tabs = [].slice.call(document.querySelectorAll('[data-gallery]'));
    const show = function (name) {
      gal.dataset.category = name;
      gal.innerHTML = GALLERY.filter(function (g) { return g.cat === name; }).map(function (g) {
        return '<figure><img src="' + g.file + '" alt="' + g.title + '" loading="lazy">'
          + '<figcaption><h3>' + g.title + '</h3><p>' + g.copy + '</p>'
          + '<a class="artboard-ref" href="' + BUNDLE + '" target="_blank" rel="noopener"'
          + ' title="Opens the private editable bundle on Google Drive">Download '
          + g.orig + ' (bundle)</a></figcaption></figure>';
      }).join('');
      tabs.forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.dataset.gallery === name));
      });
    };
    tabs.forEach(function (b) {
      b.addEventListener('click', function () { show(b.dataset.gallery); });
    });
    show('agents');
  }

  // Identity demo: toggles .compact, which style.css animates with transform — the logo is moved
  // and scaled, never redrawn or stretched.
  const replay = document.getElementById('identity-replay');
  const demo = document.getElementById('identity-demo');
  if (replay && demo) {
    replay.addEventListener('click', function () {
      const compact = demo.classList.toggle('compact');
      replay.setAttribute('aria-pressed', String(compact));
      replay.textContent = compact ? 'Return to full identity' : 'Preview header transition';
    });
  }

  if (links.length && chapters.length) {
    const obs = new IntersectionObserver(function (entries) {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        links.forEach(function (l) { l.classList.toggle('active', l.dataset.target === e.target.id); });
      }
    }, { rootMargin: '-100px 0px -65% 0px' });
    chapters.forEach(function (c) { obs.observe(c); });
  }

  if (bar && reader) {
    const update = function () {
      const r = reader.getBoundingClientRect();
      bar.value = Math.max(0, Math.min(100, (-r.top + 100) / (r.height - innerHeight + 100) * 100));
    };
    addEventListener('scroll', update, { passive: true });
    update();
  }

  // Book search: results are buttons calling go(), never anchors — a bare #href here would
  // navigate the whole preview away.
  const results = document.getElementById('search-results');
  if (input && results && BOOK.chapters) {
    input.addEventListener('input', function () {
      const q = input.value.trim().toLowerCase();
      results.replaceChildren();
      results.classList.toggle('show', q.length > 1);
      if (q.length < 2) return;
      const hits = BOOK.chapters.filter(function (c) {
        return (c.title + ' ' + c.text).toLowerCase().indexOf(q) >= 0;
      });
      if (!hits.length) { results.textContent = 'No matching passage. Try another word.'; return; }
      hits.slice(0, 12).forEach(function (c) {
        const b = document.createElement('button');
        b.type = 'button';
        const s = document.createElement('strong');
        s.textContent = c.title;
        b.append(s);
        const pos = c.text.toLowerCase().indexOf(q);
        const at = Math.max(0, pos - 40);
        b.append(document.createTextNode(c.text.slice(at, at + 150) + '…'));
        b.addEventListener('click', function () { go(c.id); });
        results.append(b);
      });
    });
  }

  // Library filter on the overview artboard.
  const cards = [].slice.call(document.querySelectorAll('.book-card'));
  const count = document.getElementById('library-count');
  const empty = document.getElementById('library-empty');
  if (input && cards.length) {
    input.addEventListener('input', function () {
      const q = input.value.toLowerCase().trim();
      let k = 0;
      cards.forEach(function (c) {
        const hit = (c.dataset.search || '').includes(q);
        c.hidden = !hit;
        if (hit) k++;
      });
      if (count) count.textContent = k + ' field guide' + (k === 1 ? '' : 's');
      if (empty) empty.hidden = k !== 0;
    });
  }

  // The checkboxes and the review <details> stay browser-owned: the browser paints their state
  // with no binding, and the component only composes the count line.
  const boxes = [].slice.call(document.querySelectorAll('[data-check]'));
  if (boxes.length && setStatus) {
    const key = 'momentum-v3-checklist:' + (BOOK.slug || 'book');
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(key) || '{}'); } catch (e) { saved = {}; }
    boxes.forEach(function (b) { b.checked = !!saved[b.dataset.check]; });
    const report = function () {
      const k = boxes.filter(function (b) { return b.checked; }).length;
      let note = ' Saved only in this browser.';
      try {
        boxes.forEach(function (b) { saved[b.dataset.check] = b.checked; });
        localStorage.setItem(key, JSON.stringify(saved));
      } catch (e) { note = ' Browser storage is unavailable; checks last for this visit only.'; }
      setStatus(k + ' of ' + boxes.length + ' complete.' + note);
    };
    boxes.forEach(function (b) { b.addEventListener('change', report); });
    report();
  }

  // A native artboard runs in a sandboxed iframe that blocks form submission outright: Chromium
  // refuses it before dispatching 'submit', so exercises.js's submit listener never runs and its
  // buttons look dead. Turn the click into the event that listener is already waiting for.
  // preventDefault cancels the implicit submission, so where forms ARE allowed this cannot
  // double-fire. Delegated and capture-phase, so it survives exercises.js re-rendering the form.
  document.addEventListener('click', function (e) {
    const t = e.target;
    if (!t || !t.closest) return;
    const btn = t.closest('button[type="submit"],input[type="submit"]');
    if (!btn) return;
    const form = btn.form || btn.closest('form');
    if (!form) return;
    e.preventDefault();
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  }, true);

  // The page's other scripts run last, on a mounted DOM, so their querySelectorAll and
  // addEventListener calls bind to real nodes exactly as they would on the local site.
  const ran = runExtras();
  if (EXTRAS.length && ran.length !== EXTRAS.length) {
    console.error('artboard: only ' + ran.length + '/' + EXTRAS.length + ' extra scripts ran');
  }
}

class Component extends DCLogic {
  renderVals() {
    const st = this.state || {};
    const paused = !!st.paused, menu = !!st.menu;
    const pick = st.pick === undefined ? 0 : st.pick;
    const self = this;
    const vals = {
      rootCls: paused ? 'motion-paused' : '',
      moOn: paused, moLabel: paused ? 'Resume motion' : 'Pause motion',
      navCls: menu ? 'reader-nav open' : 'reader-nav',
      menuExpanded: menu ? 'true' : 'false',
      checkStatus: st.checkStatus || 'Nothing ticked yet. Your checklist stays in this browser.',
      toggleMotion: () => this.setState({ paused: !paused }),
      toggleMenu: () => this.setState({ menu: !menu }),
    };
    JUMPS.forEach(function (id) {
      vals['j' + id.replace(/[^A-Za-z0-9]/g, '_')] = function () { go(id); };
    });
    STEPS.forEach(function (s, i) {
      vals['d' + i + 'on'] = pick === i;
      vals['d' + i + 'pick'] = function () { self.setState({ pick: i }); };
    });
    vals.stepDetail = STEPS[pick] || STEPS[0] || '';
    setTimeout(function () {
      wire(function (t) {
        if (t !== (self.state || {}).checkStatus) self.setState({ checkStatus: t });
      });
    }, 0);
    return vals;
  }
}
</script>"""


def component(ids, steps, extras=(), gallery=()):
    return (COMPONENT.replace("__JUMPS__", json.dumps(ids))
                     .replace("__STEPS__", json.dumps(steps))
                     .replace("__GALLERY__", json.dumps(list(gallery)))
                     .replace("__BUNDLE__", json.dumps(BUNDLE_URL))
                     .replace("__EXTRAS__", extras_js(list(extras))))


def artboard(css, markup, root_cls, comp):
    return ('<!doctype html>\n<html>\n<head>\n  <meta charset="utf-8">\n'
            '  <script src="./support.js"></script>\n</head>\n<body>\n<x-dc>\n'
            f'<helmet>\n  <style>{css}</style>\n</helmet>\n'
            f'<div class="{root_cls} {{{{ rootCls }}}}">\n{markup}\n</div>\n</x-dc>\n{comp}\n'
            '</body>\n</html>\n')


def steps_from_app_js():
    """Diagram copy, read from app.js when it is still there.

    The generic four-step diagram was removed from the final source — the book-specific exercises
    replaced it — so an absent or unparsable `const steps` is expected, not an error. Returning an
    empty list simply means bind_controls has no step buttons to bind.
    """
    try:
        t = (V3 / "app.js").read_text(encoding="utf-8")
        m = re.search(r"const steps=\[(.*?)\];", t, re.S)
        if m:
            got = re.findall(r"'((?:[^'\\]|\\.)*)'", m.group(1))
            if len(got) == 4:
                return [g.replace("\\'", "'") for g in got]
    except OSError:
        pass
    return []


def external_scripts(raw):
    """Every <script src> the page loads, in document order.

    app.js is the one exception: its behaviour is bound to component state (motion, menu, diagram,
    jumps), so it is reimplemented against DCLogic. Everything else — exercises.js and any future
    sibling — is inlined VERBATIM and executed once after mount. Those handlers are the deliverable;
    restating them differently would be a second implementation to keep in sync, and dropping them
    would silently remove the exercises. A referenced file that is missing fails the build.
    """
    out = []
    for src in re.findall(r'<script[^>]*\ssrc="([^"]+)"', raw):
        if src == "app.js":
            continue
        p = V3 / src
        if not p.exists():
            fail(f"referenced script not found: {src} (expected at {p})")
        body = p.read_text(encoding="utf-8")
        # An artboard carries this inside a <script>; a literal close tag would end it early.
        out.append((src, body.replace("</script>", "<\\/script>")))
    return out


def extras_js(extras):
    if not extras:
        return "const EXTRAS = [];\nfunction runExtras() {}\n"
    blocks = []
    for name, body in extras:
        blocks.append(
            "  try {\n"
            f"    // ---- {name}, verbatim ----\n"
            f"{body}\n"
            f"    ran.push({json.dumps(name)});\n"
            "  } catch (e) {\n"
            f"    console.error('artboard: {name} failed', e);\n"
            "  }")
    return ("const EXTRAS = %s;\n"
            "// Scripts the page loads besides app.js, re-executed once after the artboard mounts.\n"
            "function runExtras() {\n  const ran = [];\n%s\n  return ran;\n}\n"
            % (json.dumps([n for n, _ in extras]), "\n".join(blocks)))


EXTERNAL = re.compile(r"^(https?:|mailto:|tel:)", re.I)

# Private Drive copy of the editable bundle. A local `download` href cannot work from an artboard —
# the file is not there and the viewer sandbox blocks page-initiated downloads — so those routes
# point here instead of being dropped.
BUNDLE_URL = "https://drive.google.com/file/d/1NpjfuJkJE-a0hvpd65I7s0cJo2Gkx3IV/view"


def neutralize_links(html):
    """Only LOCAL routes are rewritten.

    Real http(s) citation links are the evidence trail and must survive untouched — they open in a
    new context from the artboard and are the reader's route back to the source. What cannot work
    is local: a sibling page is a separate artboard with no cross-artboard navigation, and a
    download the page starts itself is inert inside the viewer sandbox. Those become labels that
    say plainly what they point at, rather than affordances that quietly do nothing.
    """
    counts = {"external_kept": 0, "routes": 0, "downloads": 0}

    def dl(m):
        h = re.search(r'href="([^"]*)"', m.group(1))
        href = h.group(1) if h else ""
        if EXTERNAL.match(href):          # a real remote file: leave the link alone
            counts["external_kept"] += 1
            return m.group(0)
        counts["downloads"] += 1
        return ('<a class="artboard-ref" href="%s" target="_blank" rel="noopener"'
                ' title="Opens the private editable bundle on Google Drive">'
                'Download %s (bundle)</a>' % (BUNDLE_URL, href.replace("assets/", "")))
    html = re.sub(r'<a([^>]*\sdownload[^>]*)>.*?</a>', dl, html, flags=re.S)

    def doc(m):
        attrs, inner = m.group(1), m.group(2)
        h = re.search(r'href="([^"]*)"', attrs)
        href = h.group(1) if h else ""
        if href.startswith("#"):
            return m.group(0)             # in-document; rewrite_anchors owns it
        if EXTERNAL.match(href):
            counts["external_kept"] += 1
            return m.group(0)
        counts["routes"] += 1
        name = {"index.html": "Library", "brand.html": "Brand system"}.get(href)
        if name is None and re.match(r"^\d\d-", href):
            name = "Book %d" % int(href[:2])
        rest = re.sub(r'\s*href="[^"]*"', "", attrs)
        if name:
            return f'<span class="artboard-ref"{rest}>Artboard: {name}</span>'
        return f'<span{rest}>{inner}</span>'
    html = re.sub(r'<a([^>]*href="[^"]*"[^>]*)>(.*?)</a>', doc, html, flags=re.S)
    return html, counts


def convert(src_html, amap, css, out_path, mode="book"):
    page = pathlib.Path(src_html).name
    raw = pathlib.Path(src_html).read_text(encoding="utf-8")
    check_stylesheets(raw, page)
    root_cls, body = body_of(raw)
    chapters = 0
    if mode == "book":
        m = re.search(r'<script type="application/json" id="book-data">(.*?)</script>', raw, re.S)
        if not m:
            fail(f"{page}: no #book-data")
        chapters = len(json.loads(m.group(1)).get("chapters", []))

    body = rewrite_assets(body, amap)
    body, links = neutralize_links(body)
    body, ids = rewrite_anchors(body)
    body, controls = bind_controls(body, mode, amap)

    steps = steps_from_app_js()
    extras = external_scripts(raw)
    gallery = gallery_data(amap) if mode == "brand" else []
    html = artboard(css, body, root_cls, component(ids, steps, extras, gallery))

    left = len(re.findall(r'href="#', html))
    if left:
        fail(f"{out_path.name}: {left} bare in-document anchors survived")
    if "content-visibility" in html:
        fail(f"{out_path.name}: content-visibility must not be introduced")
    if re.search(r'<script[^>]*\ssrc="', body):
        fail(f"{out_path.name}: an external <script src> survived in the markup")
    if mode == "brand":
        if len(gallery) != 15:
            fail(f"{out_path.name}: gallery carries {len(gallery)} assets, expected 15")
        # A relative filename here would resolve against the artifact origin and 404 at runtime.
        bad = [g["orig"] for g in gallery if not g["file"].startswith("data:image/")]
        if bad:
            fail(f"{out_path.name}: gallery images not inlined: {', '.join(bad)}")
    out_path.write_text(html, encoding="utf-8", newline="\n")
    return {"file": out_path.name, "bytes": out_path.stat().st_size,
            "jumps": len(ids), "controls": controls, "chapters": chapters,
            "extras": [name for name, _ in extras], "links": links,
            "gallery": len(gallery)}
