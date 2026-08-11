#!/usr/bin/env python3
"""Build the Project HOPE one-pager.

Variants (both one page, 8.5 x 11in, identical copy and type scale):
  a  contact as a full-width hero band across the bottom
  b  contact as a tall panel beside vertically stacked referral steps

  python3 build.py            # build both, with previews
  python3 build.py a          # build one
  python3 build.py --measure  # dump band heights in pt for fit work
"""
import base64, pathlib, re, subprocess, sys

HERE = pathlib.Path(__file__).parent
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
FONTDIR = HERE / "fonts"

VARIANTS = {
    "tall": ("template-tall.html", "project-hope-onepager"),
}
PAGE_IN = (8.5, 14)          # page size the templates declare

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

def svg_symbol(path, sym_id):
    """Wrap an svg file's guts in a <symbol> so it can be <use>d many times."""
    svg = pathlib.Path(path).read_text()
    inner = re.search(r"<svg[^>]*>(.*)</svg>", svg, re.S).group(1).strip()
    vb = re.search(r'viewBox="([^"]+)"', svg)
    vb = vb.group(1) if vb else "0 0 100 100"
    return f'<symbol id="{sym_id}" viewBox="{vb}">{inner}</symbol>', vb

MEASURE = """
<script>
document.fonts.ready.then(function(){
  var PT=96/72, pt=function(px){return +(px/PT).toFixed(1)}, rows=[];
  var add=function(l,el){ if(el) rows.push(l+'='+pt(el.getBoundingClientRect().height)); };
  document.querySelectorAll('.page').forEach(function(p,i){ add('page'+(i+1),p); });
  add('topbar',document.querySelector('.topbar'));
  add('header',document.querySelector('.hdr'));
  add('footer',document.querySelector('.ftr'));
  document.querySelectorAll('.main').forEach(function(m,i){
    var cs=getComputedStyle(m);
    var inner=m.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom);
    var used=0;
    m.querySelectorAll(':scope > section').forEach(function(s){
      used+=s.getBoundingClientRect().height; });
    rows.push('main'+(i+1)+'_inner='+pt(inner));
    rows.push('main'+(i+1)+'_sections='+pt(used));
    rows.push('main'+(i+1)+'_slack='+pt(inner-used));
  });
  ['s1','s2','s3','s4'].forEach(function(id){ add(id,document.getElementById(id)); });
  document.title='MEASURE '+rows.join(' ');
});
</script>
"""

def build(variant, measure=False):
    tpl, _ = VARIANTS[variant]
    html = (HERE / tpl).read_text()
    html = html.replace("/*FONTS*/", font_css())
    align, _ = svg_symbol(HERE / "align-logo-reversed.svg", "align-logo")
    ukg, _ = svg_symbol(HERE / "ukg-logo.svg", "ukg-logo")
    html = html.replace("<!--SYMBOLS-->", align + "\n" + ukg)
    if measure:
        html = html.replace("<!--MEASURE-->", MEASURE)
    out = HERE / (f"_measure-{variant}.html" if measure else f"_build-{variant}.html")
    out.write_text(html)
    return out

def measure(variant):
    src = build(variant, measure=True)
    r = subprocess.run([CHROME, "--headless", "--no-sandbox", "--disable-gpu",
                        "--virtual-time-budget=4000", "--dump-dom", str(src)],
                       capture_output=True, text=True, check=True)
    m = re.search(r"<title>MEASURE ([^<]*)</title>", r.stdout)
    print(f"\n=== variant {variant} (page = {PAGE_IN[1]*72:.0f}pt tall) ===")
    if not m:
        print("  !! no measurement captured"); return
    for kv in m.group(1).split():
        k, v = kv.split("="); print(f"  {k:>18}: {v}")

def render(variant):
    from PIL import Image
    src = build(variant)
    _, stem = VARIANTS[variant]
    pdf = HERE / f"{stem}.pdf"
    base = ["--headless", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
            "--force-color-profile=srgb", "--font-render-hinting=none"]
    subprocess.run([CHROME, *base, "--no-pdf-header-footer",
                    f"--print-to-pdf={pdf}", str(src)], check=True, capture_output=True)
    d = pdf.read_bytes()
    pages = len(re.findall(rb"/Type\s*/Page[^s]", d))
    mb = re.search(rb"/MediaBox\s*\[([^\]]*)\]", d).group(1).decode().split()
    print(f"{stem}.pdf  pages={pages}  "
          f"{float(mb[2])/72:.2f}x{float(mb[3])/72:.2f}in  {len(d)//1024}KB")

    W, H, S = int(PAGE_IN[0]*96), int(PAGE_IN[1]*96), 2
    shot = HERE / f"{stem}-preview.png"
    npages = 1
    subprocess.run([CHROME, *base, f"--force-device-scale-factor={S}",
                    f"--screenshot={shot}",
                    f"--window-size={W},{H*npages+200}", str(src)],
                   check=True, capture_output=True)
    im = Image.open(shot)
    im.crop((0, 0, W * S, min(H * npages * S, im.height))).save(shot)
    print(f"  preview: {shot.name} {Image.open(shot).size}")

if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    which = args or list(VARIANTS)
    for v in which:
        if "--measure" in sys.argv:
            measure(v)
        else:
            render(v)
