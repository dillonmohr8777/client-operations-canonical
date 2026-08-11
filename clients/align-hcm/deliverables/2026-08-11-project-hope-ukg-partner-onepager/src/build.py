#!/usr/bin/env python3
"""Build the Project HOPE one-pager: inline fonts + logo, render PDF and preview PNG."""
import base64, pathlib, re, subprocess, sys

HERE = pathlib.Path(__file__).parent
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
FONTDIR = HERE / "fonts"

def font_css():
    css = []
    for w in (400, 500, 600, 700, 800):
        f = FONTDIR / f"plus-jakarta-sans-latin-{w}-normal.woff2"
        b64 = base64.b64encode(f.read_bytes()).decode()
        css.append(
            "@font-face{font-family:'Plus Jakarta Sans';font-style:normal;"
            f"font-weight:{w};font-display:block;"
            f"src:url(data:font/woff2;base64,{b64}) format('woff2')}}"
        )
    return "\n".join(css)

def logo_symbol():
    svg = (HERE / "align-logo-reversed.svg").read_text()
    inner = re.search(r"<svg[^>]*>(.*)</svg>", svg, re.S).group(1)
    return inner.strip()

MEASURE = """
<script>
document.fonts.ready.then(function(){
  var PT = 96/72;                       // css px per pt
  var pt = function(px){ return +(px/PT).toFixed(1); };
  var rows = [];
  var add = function(label, el){
    if(!el) return;
    rows.push(label + '=' + pt(el.getBoundingClientRect().height));
  };
  add('topbar', document.querySelector('.topbar'));
  add('header', document.querySelector('.hdr'));
  add('main',   document.querySelector('.main'));
  add('footer', document.querySelector('.ftr'));
  ['s1','s2','s3','s4'].forEach(function(id){ add(id, document.getElementById(id)); });

  var main = document.querySelector('.main');
  var cs = getComputedStyle(main);
  var inner = main.clientHeight
            - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  var used = ['s1','s2','s3','s4'].reduce(function(a,id){
    return a + document.getElementById(id).getBoundingClientRect().height; }, 0);
  rows.push('main_inner=' + pt(inner));
  rows.push('sections_total=' + pt(used));
  rows.push('slack=' + pt(inner - used));
  rows.push('gap_each=' + pt((inner - used)/3));
  rows.push('page_scroll_overflow=' + pt(
    document.documentElement.scrollHeight - document.documentElement.clientHeight));
  document.title = 'MEASURE ' + rows.join(' ');
});
</script>
"""

# Drop the official UKG logo in as `ukg-logo.svg` (or .png) beside this script and
# rebuild: it is picked up automatically and replaces the typographic stand-in.
UKG_STANDIN = '<div class="ukg-mark">UKG</div>'

def ukg_mark():
    svg = HERE / "ukg-logo.svg"
    if svg.exists():
        inner = re.search(r"<svg([^>]*)>(.*)</svg>", svg.read_text(), re.S)
        vb = re.search(r'viewBox="([^"]+)"', inner.group(1))
        vb = vb.group(1) if vb else "0 0 512 171"
        print("ukg:  using official ukg-logo.svg")
        return (f'<svg class="ukg-svg" viewBox="{vb}" role="img" aria-label="UKG">'
                f'{inner.group(2)}</svg>')
    for ext in ("png", "jpg", "jpeg", "webp"):
        f = HERE / f"ukg-logo.{ext}"
        if f.exists():
            b64 = base64.b64encode(f.read_bytes()).decode()
            print(f"ukg:  using official ukg-logo.{ext}")
            return f'<img class="ukg-svg" alt="UKG" src="data:image/{ext};base64,{b64}">'
    print("ukg:  no ukg-logo.* found, using typographic stand-in")
    return UKG_STANDIN

def build(measure=False):
    html = (HERE / "template.html").read_text()
    html = html.replace("/*FONTS*/", font_css())
    html = html.replace("<!--LOGO-->", logo_symbol())
    html = html.replace("<!--UKG_MARK-->", ukg_mark())
    if measure:
        html = html.replace("<!--MEASURE-->", MEASURE)
    out = HERE / ("hope-measure.html" if measure else "hope-onepager.html")
    out.write_text(html)
    print(f"html: {out}  ({len(html)/1024:.0f} KB)")
    return out

def measure():
    src = build(measure=True)
    r = subprocess.run([CHROME, "--headless", "--no-sandbox", "--disable-gpu",
                        "--virtual-time-budget=4000", "--dump-dom", str(src)],
                       capture_output=True, text=True, check=True)
    m = re.search(r"<title>MEASURE ([^<]*)</title>", r.stdout)
    if not m:
        print("!! no measurement captured"); return
    print("\n--- heights in pt (page = 792pt tall) ---")
    for kv in m.group(1).split():
        k, v = kv.split("=")
        print(f"  {k:>22}: {v}")

def render(src, pdf, png=True):
    base = ["--headless", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
            "--force-color-profile=srgb", "--font-render-hinting=none"]
    subprocess.run([CHROME, *base, "--no-pdf-header-footer",
                    f"--print-to-pdf={pdf}", str(src)],
                   check=True, capture_output=True)
    print(f"pdf:  {pdf}")
    if png:
        shot = str(pdf).replace(".pdf", "-preview.png")
        subprocess.run([CHROME, *base, f"--screenshot={shot}",
                        "--window-size=1275,1650", str(src)],
                       check=True, capture_output=True)
        print(f"png:  {shot}")

def preview(src, out, scale=2):
    """Shoot taller than the page (headless reserves ~87px of chrome), then crop
    back to exactly 8.5x11in so the preview matches the PDF 1:1."""
    from PIL import Image
    W, H = 816, 1056                      # css px for 8.5 x 11in at 96dpi
    subprocess.run([CHROME, "--headless", "--no-sandbox", "--disable-gpu",
                    "--hide-scrollbars", "--force-color-profile=srgb",
                    "--font-render-hinting=none",
                    f"--force-device-scale-factor={scale}",
                    f"--screenshot={out}", f"--window-size={W},{H+200}", str(src)],
                   check=True, capture_output=True)
    im = Image.open(out)
    if im.height > H * scale:
        im.crop((0, 0, W * scale, H * scale)).save(out)
    print(f"png:  {out}  ({Image.open(out).size[0]}x{Image.open(out).size[1]})")

if __name__ == "__main__":
    if "--measure" in sys.argv:
        measure()
    else:
        src = build()
        render(src, HERE / "hope-onepager.pdf", png=False)
        preview(src, HERE / "hope-onepager-preview.png")
