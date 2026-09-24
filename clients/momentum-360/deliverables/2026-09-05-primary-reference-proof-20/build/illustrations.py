"""Thirty original animated illustrations - three for each of the ten prospects.

Every one is drawn here as SVG geometry: bezier contours, layered fills, no
raster, no external request, no generated imagery. Each is about the business
it belongs to and is taken from that prospect's own copy in
_source/content/<slug>.json - a furnace cutaway for the 1950 HVAC shop, a wok
over the flame for the Chinese kitchen, an exploded rotor for the parts
wholesaler, and so on.

Colour is never hardcoded. Every fill and stroke reads a custom property, so
one drawing inherits ten different palettes:

    --illo-bg    the field the drawing sits on (hero tint / card wash)
    --wash-2     the soft ground shape
    --brand-ink  brand, deepened until it reads on that field   (primary line)
    --brand-dp   the deep detail
    --accent-ink accent, deepened until it reads on that field  (accent line)
    --accent     the raw accent, large fills only
    --hero       the bright note
    --paper      highlights

Motion lives in CSS below rather than inline, so a page that uses one drawing
eight times still carries one copy of the keyframes. Every loop is 4-14s,
nothing strobes, and the whole vocabulary is switched off under
prefers-reduced-motion.

Layout: the drawings are 600x400 and are always slice-cropped into their slot,
so nothing that matters sits outside x 40-560, y 40-360.
"""
import math

VIEWBOX = "0 0 600 400"

CSS = """
/* ==========================================================================
   12. illustrations  (drawn in build/illustrations.py)
   ========================================================================== */
.illo { display: block; width: 100%; height: 100%; }
.illo .field { fill: var(--illo-bg, transparent); }
.illo .wash  { fill: var(--wash-2); }
.illo .wash2 { fill: var(--wash); }
.illo .line  { fill: none; stroke: var(--brand-ink); stroke-width: 7;
               stroke-linecap: round; stroke-linejoin: round; }
.illo .thin  { fill: none; stroke: var(--brand-ink); stroke-width: 4;
               stroke-linecap: round; stroke-linejoin: round; }
.illo .aline { fill: none; stroke: var(--accent-ink); stroke-width: 7;
               stroke-linecap: round; stroke-linejoin: round; }
.illo .athin { fill: none; stroke: var(--accent-ink); stroke-width: 4;
               stroke-linecap: round; stroke-linejoin: round; }
.illo .pline { fill: none; stroke: var(--paper); stroke-width: 4;
               stroke-linecap: round; stroke-linejoin: round; }
.illo .solid { fill: var(--brand-ink); }
.illo .deep  { fill: var(--brand-dp); }
.illo .acc   { fill: var(--accent); }
.illo .accd  { fill: var(--accent-ink); }
.illo .hot   { fill: var(--hero); }
.illo .pap   { fill: var(--paper); }
.illo .glass { fill: var(--paper); opacity: .58; }
.illo .soft  { opacity: .5; }

/* --- the motion vocabulary: sixteen loops, 4-14s, shared across all thirty */
@keyframes il-spin   { to { transform: rotate(360deg); } }
@keyframes il-spinr  { to { transform: rotate(-360deg); } }
@keyframes il-rise   { 0%   { transform: translateY(16px) scaleX(.8); opacity: 0; }
                       22%  { opacity: .85; }
                       100% { transform: translateY(-96px) scaleX(1.25); opacity: 0; } }
@keyframes il-sway   { 0%, 100% { transform: rotate(-4deg); } 50% { transform: rotate(4deg); } }
@keyframes il-sweep  { 0%, 100% { transform: rotate(-22deg); } 50% { transform: rotate(22deg); } }
@keyframes il-bob    { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
@keyframes il-pulse  { 0%, 100% { opacity: .24; } 50% { opacity: .7; } }
@keyframes il-flick  { 0%, 100% { transform: scale(1.04, .93); } 50% { transform: scale(.96, 1.09); } }
@keyframes il-dash   { to { stroke-dashoffset: -64; } }
@keyframes il-drop   { 0%   { transform: translateY(-10px); opacity: 0; }
                       18%  { opacity: 1; }
                       100% { transform: translateY(76px); opacity: 0; } }
@keyframes il-slide  { 0%       { transform: translateX(-34px); opacity: 0; }
                       24%, 70% { transform: translateX(0); opacity: 1; }
                       100%     { transform: translateX(28px); opacity: 0; } }
@keyframes il-press  { 0%, 100% { transform: translateY(0); } 45%, 60% { transform: translateY(24px); } }
@keyframes il-lift   { 0%, 100% { transform: translateY(14px); } 45%, 62% { transform: translateY(-12px); } }
@keyframes il-drift  { 0%   { transform: translateX(-26px); opacity: 0; }
                       28%  { opacity: .85; }
                       100% { transform: translateX(52px); opacity: 0; } }
@keyframes il-glint  { 0%, 68%, 100% { opacity: 0; transform: scale(.6); }
                       80% { opacity: 1; transform: scale(1); } }
@keyframes il-nudge  { 0%, 100% { transform: translateX(-7px); } 50% { transform: translateX(7px); } }

.illo .spin  { animation: il-spin  14s linear infinite; }
.illo .spinf { animation: il-spin   6s linear infinite; }
.illo .spinr { animation: il-spinr 11s linear infinite; }
.illo .rise  { animation: il-rise   7s ease-out infinite; }
.illo .sway  { animation: il-sway   6s ease-in-out infinite; }
.illo .sweep { animation: il-sweep  8s ease-in-out infinite; }
.illo .bob   { animation: il-bob    5s ease-in-out infinite; }
.illo .pulse { animation: il-pulse  5s ease-in-out infinite; }
.illo .flick { animation: il-flick  4s ease-in-out infinite; }
.illo .dash  { stroke-dasharray: 18 14; animation: il-dash 5s linear infinite; }
.illo .drop  { animation: il-drop   4s linear infinite; }
.illo .slide { animation: il-slide  8s ease-in-out infinite; }
.illo .press { animation: il-press  6s ease-in-out infinite; }
.illo .lift  { animation: il-lift   9s ease-in-out infinite; }
.illo .drift { animation: il-drift  9s ease-in-out infinite; }
.illo .glint { animation: il-glint  6s ease-in-out infinite; }
.illo .nudge { animation: il-nudge 10s ease-in-out infinite; }
.illo .d1 { animation-delay: -1.3s; } .illo .d2 { animation-delay: -2.6s; }
.illo .d3 { animation-delay: -3.9s; } .illo .d4 { animation-delay: -5.2s; }

@media (prefers-reduced-motion: reduce) {
  .illo * { animation: none !important; }
  .illo .rise, .illo .drop, .illo .drift, .illo .slide, .illo .glint { opacity: .55; }
}
"""


# ------------------------------------------------------------- primitives
def org(x, y):
    return 'style="transform-origin:%gpx %gpx"' % (x, y)


def ground(y=332, cls="wash"):
    """The soft horizon every drawing stands on - a curve, never a rule."""
    return ('<path class="%s" d="M0,%g C110,%g 190,%g 300,%g C410,%g 500,%g 600,%g '
            'L600,400 L0,400 Z"/>' % (cls, y, y - 16, y + 10, y - 6, y - 20, y + 6, y - 12))


def blob(cx, cy, r):
    """An organic backdrop - deliberately not a rectangle behind the subject."""
    return ('<path class="wash2" d="M%g,%g C%g,%g %g,%g %g,%g C%g,%g %g,%g %g,%g '
            'C%g,%g %g,%g %g,%g C%g,%g %g,%g %g,%g Z"/>'
            % (cx - r, cy,
               cx - r, cy - r * .62, cx - r * .58, cy - r, cx, cy - r * .94,
               cx + r * .6, cy - r * .88, cx + r, cy - r * .5, cx + r * .97, cy + r * .06,
               cx + r * .94, cy + r * .6, cx + r * .55, cy + r, cx - r * .02, cy + r * .96,
               cx - r * .6, cy + r * .92, cx - r, cy + r * .56, cx - r, cy))


def wisp(x, y, cls="rise", h=1.0):
    """One curling ribbon - steam, heat, exhaust, chilled air."""
    return ('<path class="thin %s" d="M%g,%g C%g,%g %g,%g %g,%g C%g,%g %g,%g %g,%g"/>'
            % (cls, x, y, x - 15 * h, y - 20 * h, x + 15 * h, y - 34 * h, x, y - 54 * h,
               x - 14 * h, y - 70 * h, x + 12 * h, y - 82 * h, x + 2, y - 100 * h))


def flame(x, y, h, cls="hot flick"):
    """A teardrop flame with an inner tongue, pivoting on its own base.

    Painted with --hero, not --accent: three of the ten have a near-black
    accent (a wordmark's ink), and a flame in that colour reads as a lump of
    coal. --hero is the bright note in every palette by construction.
    """
    w = h * .44
    outer = ('<path class="%s" %s d="M%g,%g C%g,%g %g,%g %g,%g C%g,%g %g,%g %g,%g Z"/>'
             % (cls, org(x, y),
                x, y, x - w, y - h * .26, x - w * .92, y - h * .64, x - w * .12, y - h,
                x + w * .78, y - h * .6, x + w, y - h * .24, x, y))
    inner = ('<path class="pap soft" d="M%g,%g C%g,%g %g,%g %g,%g C%g,%g %g,%g %g,%g Z"/>'
             % (x, y - h * .06, x - w * .5, y - h * .24, x - w * .46, y - h * .44,
                x - w * .05, y - h * .62, x + w * .4, y - h * .42, x + w * .5, y - h * .22,
                x, y - h * .06))
    return outer + inner


def star4(cx, cy, r, cls="accd glint"):
    """A four-point sparkle with concave sides - a curved star, not a plus."""
    i = r * .26
    return ('<path class="%s" %s d="M%g,%g C%g,%g %g,%g %g,%g C%g,%g %g,%g %g,%g '
            'C%g,%g %g,%g %g,%g C%g,%g %g,%g %g,%g Z"/>'
            % (cls, org(cx, cy), cx, cy - r,
               cx + i, cy - i, cx + i, cy - i, cx + r, cy,
               cx + i, cy + i, cx + i, cy + i, cx, cy + r,
               cx - i, cy + i, cx - i, cy + i, cx - r, cy,
               cx - i, cy - i, cx - i, cy - i, cx, cy - r))


def roadwheel(cx, cy, r, spokes=6, cls="spin"):
    """Tyre, rim, hub and spokes; the whole group turns on its own axle."""
    sp = "".join('<path class="thin" transform="rotate(%g %g %g)" d="M%g,%g L%g,%g"/>'
                 % (i * 360.0 / spokes, cx, cy, cx, cy - r * .2, cx, cy - r * .62)
                 for i in range(spokes))
    return ('<g class="%s" %s>'
            '<circle class="solid" cx="%g" cy="%g" r="%g"/>'
            '<circle class="pap" cx="%g" cy="%g" r="%g"/>'
            '%s<circle class="accd" cx="%g" cy="%g" r="%g"/></g>'
            % (cls, org(cx, cy), cx, cy, r, cx, cy, r * .64, sp, cx, cy, r * .18))


def ring(cx, cy, ro, ri, cls="accd"):
    """A filled annulus (evenodd), for guards, rims and wrench heads."""
    return ('<path class="%s" fill-rule="evenodd" d="M%g,%g a%g,%g 0 1,0 .1,0 Z '
            'M%g,%g a%g,%g 0 1,1 -.1,0 Z"/>'
            % (cls, cx, cy - ro, ro, ro, cx, cy - ri, ri, ri))


def polar(cx, cy, r, deg):
    a = math.radians(deg)
    return cx + r * math.cos(a), cy + r * math.sin(a)


# ============================================================ F.M. BERKHEIMER
# HVAC, Mechanicsburg, third generation, founded 1950.
def _fm_furnace():
    tubes = ("M216,250 C216,166 258,166 258,250 C258,166 300,166 300,250 "
             "C300,166 342,166 342,250 C342,178 364,178 364,224")
    burners = "".join(flame(226 + i * 38, 286, 30 + (i % 2) * 8,
                            "hot flick d%d" % (i % 4 + 1)) for i in range(4))
    vanes = "".join('<path class="pline" transform="rotate(%g 300 312)" '
                    'd="M300,290 C308,294 310,300 306,306"/>' % (i * 45) for i in range(8))
    return (ground(336) + blob(300, 200, 152)
            + wisp(250, 84, "rise") + wisp(300, 78, "rise d2") + wisp(350, 84, "rise d3")
            + '<path class="pap" d="M234,56 L366,56 L366,100 L234,100 Z"/>'
            + '<path class="line" d="M234,100 L234,56 L366,56 L366,100"/>'
            + '<rect class="pap" x="190" y="98" width="200" height="244" rx="14"/>'
            + '<rect class="line" x="190" y="98" width="200" height="244" rx="14"/>'
            + '<path class="aline" style="stroke-width:11" d="%s"/>' % tubes
            + '<path class="line" d="M204,262 L376,262"/>'
            + burners
            + '<g class="spinf" %s><circle class="solid" cx="300" cy="312" r="30"/>'
              '<circle class="accd" cx="300" cy="312" r="9"/>%s</g>' % (org(300, 312), vanes)
            + '<path class="line" d="M150,244 L190,244 M150,300 L190,300 '
              'M150,244 L150,300"/>'
            + "".join('<path class="athin" d="M%g,246 L%g,298"/>' % (156 + i * 10, 150 + i * 10)
                      for i in range(4))
            + '<path class="line" d="M372,98 L372,64 C372,54 396,54 396,64 L396,110"/>'
            + '<circle class="accd" cx="356" cy="122" r="7"/>'
            + '<circle class="hot pulse" cx="356" cy="144" r="7"/>')


def _fm_van():
    body = ("M138,300 L138,214 C138,200 148,192 162,192 L346,192 L394,240 "
            "L432,250 C446,253 452,262 452,274 L452,300 Z")
    rack = ('<path class="line" d="M150,186 L344,186"/>'
            '<path class="thin" d="M168,186 L168,194 M256,186 L256,194 M330,186 L330,194"/>'
            '<path class="line" d="M170,176 L326,176 M170,162 L326,162"/>'
            + "".join('<path class="thin" d="M%g,176 L%g,162"/>' % (192 + i * 34, 192 + i * 34)
                      for i in range(4)))
    return (ground(338) + blob(300, 210, 150)
            + '<path class="solid" d="%s"/>' % body
            + '<path class="pap" d="M352,204 L388,240 L352,240 Z"/>'
            + '<path class="pline" d="M148,262 L336,262 M336,196 L336,296"/>'
            + '<path class="accd" d="M172,224 L268,224 L268,248 L172,248 Z"/>'
            + rack
            + '<circle class="acc" cx="440" cy="266" r="8"/>'
            + roadwheel(204, 302, 32, 6, "spin")
            + roadwheel(398, 302, 32, 6, "spin")
            + '<path class="line" d="M60,340 L540,340"/>'
            + '<path class="athin dash" style="stroke-width:6" d="M60,356 L540,356"/>'
            + "".join('<path class="thin drift %s" d="M%g,%g L%g,%g"/>'
                      % ("d%d" % (i + 1), 60, 208 + i * 26, 122, 208 + i * 26)
                      for i in range(3)))


def _fm_thermostat():
    ticks = "".join('<path class="athin" transform="rotate(%g 300 200)" '
                    'd="M300,102 L300,%g"/>' % (i * 15, 114 if i % 3 else 122)
                    for i in range(24))
    return (blob(300, 200, 168)
            + '<rect class="pap" x="168" y="62" width="264" height="276" rx="26"/>'
            + '<rect class="line" x="168" y="62" width="264" height="276" rx="26"/>'
            + '<circle class="pap" cx="300" cy="200" r="106"/>'
            + '<circle class="line" cx="300" cy="200" r="106"/>'
            + ticks
            + '<path class="aline" style="stroke-width:10" '
              'd="M214,262 A106,106 0 0,1 232,124"/>'
            + '<g class="sweep" %s><path class="line" style="stroke-width:9" '
              'd="M300,200 L300,116"/></g>' % org(300, 200)
            + '<circle class="solid" cx="300" cy="200" r="14"/>'
            + '<path class="athin pulse" d="M262,246 C282,232 318,232 338,246"/>'
            + '<path class="athin pulse d2" d="M248,268 C278,246 322,246 352,268"/>'
            + '<rect class="accd" x="268" y="288" width="64" height="26" rx="8"/>'
            + '<path class="pline" d="M280,301 L296,301 M306,301 L320,301"/>'
            + star4(398, 108, 18, "accd glint d2"))


# ================================================================= GOLDEN SEA
# Family Chinese kitchen, Blue Bell, since 1992.
def _gs_wok():
    toss = "".join(
        '<g class="bob %s">%s</g>' % ("d%d" % (i + 1), s) for i, s in enumerate([
            '<rect class="pap" x="338" y="142" width="22" height="18" rx="5"/>',
            '<circle class="hot" cx="380" cy="118" r="11"/>',
            '<path class="acc" d="M406,116 C420,104 440,110 442,124 C432,120 418,122 406,116 Z"/>',
            '<path class="accd" d="M432,148 L450,140 L452,158 Z"/>']))
    return (ground(336)
            + flame(252, 322, 62, "hot flick") + flame(300, 332, 86, "hot flick d2")
            + flame(348, 322, 62, "hot flick d1")
            + '<path class="solid" d="M152,214 C160,320 440,320 448,214 Z"/>'
            + '<ellipse class="deep" cx="300" cy="214" rx="148" ry="26"/>'
            + '<ellipse class="pap soft" cx="300" cy="212" rx="128" ry="16"/>'
            + '<path class="line" style="stroke-width:12" d="M448,208 L534,176"/>'
            + '<path class="line" d="M152,210 C130,202 126,186 140,178"/>'
            + '<path class="athin dash" d="M330,196 C358,110 428,114 452,180"/>'
            + toss
            + '<path class="accd" d="M256,206 C266,192 288,192 296,206 Z"/>'
            + '<circle class="hot" cx="330" cy="204" r="9"/>'
            + wisp(240, 196, "rise") + wisp(300, 190, "rise d2") + wisp(360, 196, "rise d3"))


def _gs_basket():
    """Two stacked bamboo tiers under a woven lid. The slats are the wide,
    uneven splits of a real steamer, not a uniform grille."""
    def tier(y, h, x0, x1):
        slats = "".join('<path class="athin" d="M%g,%g L%g,%g" opacity=".45"/>'
                        % (x, y + 8, x, y + h - 8) for x in range(x0 + 26, x1 - 10, 34))
        return ('<path class="pap" d="M%g,%g L%g,%g L%g,%g L%g,%g Z"/>'
                '<path class="line" d="M%g,%g L%g,%g L%g,%g L%g,%g Z"/>%s'
                '<path class="aline" style="stroke-width:9" d="M%g,%g L%g,%g"/>'
                % (x0, y, x1, y, x1, y + h, x0, y + h,
                   x0, y, x1, y, x1, y + h, x0, y + h, slats,
                   x0, y + h * .34, x1, y + h * .34))
    weave = "".join('<path class="athin" d="M%g,194 C%g,%g %g,%g %g,194" opacity=".55"/>'
                    % (182 + i * 16, 182 + i * 16, 194 - 52 + i * 7,
                       418 - i * 16, 194 - 52 + i * 7, 418 - i * 16) for i in range(4))
    return (ground(340) + blob(300, 206, 156)
            + wisp(224, 138, "rise") + wisp(300, 128, "rise d2") + wisp(376, 138, "rise d3")
            + tier(250, 62, 164, 436) + tier(194, 58, 172, 428)
            + '<path class="pap" d="M172,194 C172,132 428,132 428,194 Z"/>'
            + '<path class="line" d="M172,194 C172,132 428,132 428,194 Z"/>' + weave
            + '<path class="accd" d="M282,146 C282,132 318,132 318,146 C318,156 282,156 282,146 Z"/>'
            + '<path class="line" style="stroke-width:7" d="M454,312 L524,196 M476,316 L546,200"/>'
            + '<ellipse class="wash" cx="300" cy="318" rx="152" ry="13"/>')


def _gs_noodles():
    strands = "".join('<path class="athin" d="M%g,%g C%g,%g %g,%g %g,%g"/>'
                      % (200 + i * 26, 246 + (i % 2) * 8, 214 + i * 26, 228,
                         232 + i * 26, 262, 250 + i * 26, 242) for i in range(7))
    hang = "".join('<path class="thin" d="M%g,238 C%g,272 %g,290 %g,318"/>'
                   % (302 + i * 12, 292 + i * 12, 312 + i * 12, 300 + i * 12) for i in range(3))
    return (ground(340) + blob(300, 214, 150)
            + wisp(226, 224, "rise") + wisp(374, 218, "rise d2")
            + '<path class="solid" d="M158,236 C166,336 434,336 442,236 Z"/>'
            + '<ellipse class="deep" cx="300" cy="236" rx="142" ry="24"/>'
            + '<ellipse class="pap soft" cx="300" cy="234" rx="122" ry="15"/>'
            + '<path class="line" d="M256,336 L264,354 L336,354 L344,336"/>' + strands
            + '<circle class="hot" cx="238" cy="240" r="9"/>'
            + '<circle class="hot" cx="366" cy="244" r="7"/>'
            + '<path class="accd" d="M318,232 C332,216 356,220 358,236 C344,230 330,234 318,232 Z"/>'
            + '<g class="bob"><path class="line" style="stroke-width:8" '
              'd="M356,128 L296,240 M382,138 L322,250"/>%s</g>' % hang
            + star4(452, 154, 16, "accd glint d3"))


# ============================================================ NOLT'S AUTO PARTS
# Factory-warehouse parts wholesaler to the dealer trade, since 1959.
def _na_brake():
    slots = "".join('<rect class="pap" x="232" y="100" width="16" height="36" rx="8" '
                    'transform="rotate(%g 240 196)"/>' % (i * 45) for i in range(8))
    vanes = "".join('<path class="pline soft" transform="rotate(%g 240 196)" '
                    'd="M240,124 L240,146"/>' % (i * 22.5) for i in range(16))
    lugs = "".join('<circle class="pap" cx="%g" cy="%g" r="7"/>'
                   % polar(240, 196, 26, i * 72 - 90) for i in range(5))
    caliper = ("M332,132 C374,132 390,152 390,180 L390,214 C390,242 374,262 332,262 "
               "L332,240 C356,240 366,228 366,208 L366,186 C366,166 356,154 332,154 Z")
    return (blob(250, 196, 176) + ground(348)
            + '<g class="spin" %s><circle class="solid" cx="240" cy="196" r="114"/>'
              '<circle class="pap" cx="240" cy="196" r="66"/>%s%s'
              '<circle class="accd" cx="240" cy="196" r="42"/>%s</g>'
              % (org(240, 196), slots, vanes, lugs)
            + '<path class="accd" d="%s"/>' % caliper
            + '<path class="line" d="M390,164 L418,164 M390,230 L418,230"/>'
            + '<g class="nudge"><rect class="solid" x="424" y="146" width="26" height="92" rx="9"/>'
              '<rect class="pap" x="424" y="146" width="26" height="16" rx="8"/></g>'
            + '<g class="nudge d2"><rect class="solid" x="466" y="158" width="26" height="92" rx="9"/>'
              '<rect class="pap" x="466" y="158" width="26" height="16" rx="8"/></g>'
            + '<path class="athin dash" d="M354,120 L440,96 M354,272 L456,300"/>'
            + '<circle class="accd" cx="452" cy="92" r="9"/>'
            + '<circle class="accd" cx="468" cy="304" r="9"/>')


def _na_wall():
    pegs = "".join('<circle class="athin soft" cx="%g" cy="%g" r="2.6" fill="none"/>'
                   % (146 + c * 54, 124 + r * 52) for c in range(7) for r in range(4))
    shelves = "".join('<path class="line" d="M120,%g L470,%g"/>' % (y, y) for y in (176, 254, 332))
    bins = ""
    for row, y in enumerate((176, 254)):
        for i in range(4):
            x = 132 + i * 84
            cls = "slide" if (row == 1 and i == 1) else ""
            bins += ('<g class="%s"><path class="pap" d="M%g,%g L%g,%g L%g,%g L%g,%g Z"/>'
                     '<path class="line" d="M%g,%g L%g,%g L%g,%g L%g,%g Z"/>'
                     '<path class="accd" d="M%g,%g L%g,%g L%g,%g L%g,%g Z"/></g>'
                     % (cls, x, y - 54, x + 72, y - 54, x + 64, y, x + 8, y,
                        x, y - 54, x + 72, y - 54, x + 64, y, x + 8, y,
                        x + 10, y - 24, x + 62, y - 24, x + 58, y - 12, x + 14, y - 12))
    return (blob(300, 214, 190)
            + pegs + shelves + bins
            + '<path class="line" d="M120,110 L120,332 M470,110 L470,332"/>'
            + '<path class="aline" d="M430,120 L430,332 M478,120 L478,332"/>'
            + "".join('<path class="athin" d="M430,%g L478,%g"/>' % (y, y)
                      for y in range(140, 330, 32))
            + '<circle class="accd spin" cx="454" cy="112" r="12" %s/>' % org(454, 112)
            + '<path class="athin" d="M164,150 C172,138 188,138 196,150"/>'
            + '<path class="athin" d="M252,142 C258,152 266,132 272,142 C278,152 286,132 292,142"/>'
            + '<circle class="hot" cx="360" cy="146" r="10"/>')


def _na_wrench():
    hexa = " ".join("%s%g,%g" % ("M" if i == 0 else "L", *polar(300, 200, 48, i * 60 - 90))
                    for i in range(6)) + " Z"
    hexi = " ".join("%s%g,%g" % ("M" if i == 0 else "L", *polar(300, 200, 28, i * 60 - 90))
                    for i in range(6)) + " Z"
    return (blob(300, 200, 168) + ground(352)
            + '<path class="solid" d="%s"/><path class="pap" d="%s"/>' % (hexa, hexi)
            + '<g class="sweep" %s>' % org(300, 200)
            + ring(300, 200, 74, 50, "accd")
            + '<path class="accd" d="M368,178 L474,168 C484,167 492,175 492,186 '
              'L492,214 C492,225 484,233 474,232 L368,222 Z"/>'
            + '<path class="accd" d="M490,160 L548,150 L548,176 L516,182 L516,218 '
              'L548,224 L548,250 L490,240 Z"/>'
            + '</g>'
            + '<path class="athin dash" d="M226,120 C258,88 342,88 374,120"/>'
            + '<path class="accd" d="M374,104 L390,124 L366,132 Z"/>'
            + star4(226, 106, 16, "accd glint")
            + star4(408, 258, 13, "accd glint d2"))


# =========================================================== SANGILLO TIRE CENTER
# Family tyre shop on MacDade Blvd, Folsom, 60 years.
def _st_tread():
    blocks = "".join('<rect class="pap" x="278" y="66" width="24" height="34" rx="7" '
                     'transform="rotate(%g 290 200)"/>' % (i * 20) for i in range(18))
    grooves = "".join('<path class="pline soft" transform="rotate(%g 290 200)" '
                      'd="M290,104 L290,120"/>' % (i * 20 + 10) for i in range(18))
    spokes = "".join('<path class="solid" transform="rotate(%g 290 200)" '
                     'd="M282,142 L298,142 L294,190 L286,190 Z"/>' % (i * 72) for i in range(5))
    return (ground(348) + blob(290, 198, 176)
            + '<g class="spin" %s><circle class="solid" cx="290" cy="200" r="138"/>'
              '%s%s<circle class="deep" cx="290" cy="200" r="106"/>'
              '<circle class="pline soft" cx="290" cy="200" r="118" fill="none"/>'
              '<circle class="pap" cx="290" cy="200" r="76"/>%s'
              '<circle class="accd" cx="290" cy="200" r="24"/></g>'
              % (org(290, 200), blocks, grooves, spokes)
            + '<ellipse class="wash" cx="290" cy="346" rx="140" ry="14"/>'
            + '<path class="athin drift" d="M452,150 C486,142 508,152 528,146"/>'
            + '<path class="athin drift d2" d="M452,188 C490,178 516,190 540,182"/>'
            + '<path class="athin drift d3" d="M452,226 C482,218 502,228 522,222"/>')


def _st_balancer():
    bars = "".join('<rect class="accd pulse %s" x="%g" y="%g" width="10" height="%g" rx="4"/>'
                   % ("d%d" % (i + 1), 176 + i * 18, 138 - i * 6, 18 + i * 6) for i in range(3))
    return (ground(342) + blob(320, 196, 178)
            + '<path class="solid" d="M136,290 L284,290 L284,332 L136,332 Z"/>'
            + '<rect class="pap" x="152" y="112" width="52" height="180"/>'
            + '<rect class="line" x="152" y="112" width="52" height="180"/>'
            + '<rect class="pap" x="152" y="96" width="128" height="64" rx="10"/>'
            + '<rect class="line" x="152" y="96" width="128" height="64" rx="10"/>'
            + '<rect class="deep" x="166" y="110" width="100" height="40" rx="6"/>' + bars
            + '<path class="line" style="stroke-width:11" d="M204,196 L336,196"/>'
            + '<path class="accd" d="M330,172 L330,220 L352,208 L352,184 Z"/>'
            + roadwheel(400, 196, 88, 5, "spinf")
            + '<circle class="line" cx="400" cy="196" r="88" fill="none"/>'
            + '<path class="line" d="M160,332 L280,332 M172,290 L172,332"/>'
            + '<circle class="hot pulse" cx="256" cy="176" r="8"/>')


def _st_align():
    tread = "".join('<path class="pline" d="M%g,%g L%g,%g"/>' % (x, 150, x, 250)
                    for x in (140, 156, 172))
    tread2 = "".join('<path class="pline" d="M%g,%g L%g,%g"/>' % (x, 150, x, 250)
                     for x in (428, 444, 460))
    return (blob(300, 200, 190)
            + '<path class="athin dash" d="M300,66 L300,344"/>'
            + '<path class="line" style="stroke-width:13" d="M176,200 L424,200"/>'
            + '<circle class="accd" cx="300" cy="200" r="17"/>'
            + '<g class="sway" %s><rect class="solid" x="126" y="140" width="60" height="120" rx="16"/>%s</g>'
              % (org(156, 200), tread)
            + '<g class="sway d2" %s><rect class="solid" x="414" y="140" width="60" height="120" rx="16"/>%s</g>'
              % (org(444, 200), tread2)
            + '<path class="athin dash" d="M156,132 L296,90 M444,132 L304,90"/>'
            + '<circle class="pap" cx="300" cy="84" r="22"/>'
            + '<circle class="aline" cx="300" cy="84" r="22" fill="none"/>'
            + '<circle class="accd pulse" cx="300" cy="84" r="10"/>'
            + '<path class="athin" d="M156,282 C186,296 256,300 296,300"/>'
            + '<path class="athin" d="M444,282 C414,296 344,300 304,300"/>'
            + '<path class="aline" d="M232,336 C266,326 334,326 368,336"/>')


# =========================================================== SMILE CULTURE DENTAL
# Huntingdon Valley practice: preventative, implants, veneers, Invisalign.
def _sc_tooth():
    crown = ("M200,152 C200,100 248,76 300,76 C352,76 400,100 400,152 "
             "C400,190 384,208 378,242 C374,268 366,304 348,304 C330,304 326,266 320,242 "
             "C316,224 300,222 296,242 C290,266 286,304 268,304 C250,304 242,266 238,242 "
             "C232,208 200,190 200,152 Z")
    return (blob(300, 190, 178)
            + '<path class="pap" d="%s"/><path class="line" d="%s"/>' % (crown, crown)
            + '<path class="pline" style="stroke-width:9" d="M244,128 C258,110 284,102 306,104"/>'
            + '<path class="aline" style="stroke-width:11" d="M176,300 C232,330 368,330 424,300"/>'
            + '<path class="athin dash" d="M206,128 C254,88 346,88 394,128"/>'
            + star4(404, 112, 21, "accd glint")
            + star4(430, 164, 13, "accd glint d2")
            + star4(196, 108, 15, "accd glint d3")
            + '<circle class="hot pulse" cx="300" cy="342" r="10"/>')


def _sc_aligner():
    teeth, tray_o, tray_i = "", [], []
    for i in range(11):
        deg = 200 + i * 14
        x, y = polar(300, 176, 148, deg)
        w = 30 if 3 <= i <= 7 else 24
        teeth += ('<g transform="rotate(%g %g %g)">'
                  '<rect class="pap" x="%g" y="%g" width="%g" height="38" rx="10"/>'
                  '<rect class="thin" x="%g" y="%g" width="%g" height="38" rx="10"/></g>'
                  % (deg + 90, x, y, x - w / 2, y - 19, w, x - w / 2, y - 19, w))
        ox, oy = polar(300, 176, 176, deg)
        ix, iy = polar(300, 176, 122, deg)
        tray_o.append((ox, oy))
        tray_i.append((ix, iy))
    path = "M%g,%g " % tray_o[0] + " ".join("L%g,%g" % p for p in tray_o[1:])
    path += " L%g,%g " % tray_i[-1] + " ".join("L%g,%g" % p for p in reversed(tray_i[:-1])) + " Z"
    return (blob(300, 200, 186) + teeth
            + '<g class="press"><path class="glass" d="%s"/>'
              '<path class="thin" d="%s"/></g>' % (path, path)
            + '<path class="pline glint" style="stroke-width:10" d="M212,120 L268,84"/>'
            + star4(430, 128, 18, "accd glint d2")
            + '<path class="aline" d="M226,330 C266,344 334,344 374,330"/>')


def _sc_lamp():
    tools = "".join('<path class="line" style="stroke-width:6" d="M%g,300 L%g,266"/>'
                    % (462 + i * 18, 462 + i * 18) for i in range(3))
    return (blob(320, 190, 180)
            + '<path class="line" style="stroke-width:9" d="M110,84 L188,84 C214,84 214,120 '
              '240,120 L286,120"/>'
            + '<circle class="accd" cx="188" cy="84" r="11"/>'
            + '<circle class="accd" cx="240" cy="120" r="11"/>'
            + '<path class="hot pulse" d="M300,164 L232,330 L438,330 L410,164 Z"/>'
            + '<path class="solid" d="M286,104 L426,104 C438,104 444,112 444,124 '
              'L444,150 C444,162 438,170 426,170 L300,170 C288,170 282,162 282,150 Z"/>'
            + '<path class="pap" d="M296,150 L430,150 L426,166 L300,166 Z"/>'
            + '<path class="solid" d="M198,336 C198,300 236,286 268,286 L372,286 '
              'C404,286 424,304 424,336 Z"/>'
            + '<path class="pap" d="M232,300 C256,292 348,292 384,300 L384,318 L232,318 Z"/>'
            + '<rect class="accd" x="452" y="300" width="66" height="14" rx="6"/>' + tools
            + star4(154, 138, 15, "accd glint d3"))


# ======================================================= SPECK'S BROASTED CHICKEN
# Collegeville counter, family owned since 1953.
def _sp_bucket():
    def drumstick(x, y, rot):
        return ('<g transform="rotate(%g %g %g)" class="bob %s">'
                '<path class="accd" d="M%g,%g C%g,%g %g,%g %g,%g C%g,%g %g,%g %g,%g Z"/>'
                '<path class="pap" d="M%g,%g L%g,%g C%g,%g %g,%g %g,%g Z"/></g>'
                % (rot, x, y, "d%d" % (abs(rot) % 4 + 1),
                   x - 22, y, x - 26, y - 30, x - 8, y - 44, x + 8, y - 38,
                   x + 26, y - 30, x + 22, y + 4, x - 22, y,
                   x - 14, y + 4, x - 4, y + 34, x + 8, y + 40, x + 16, y + 30, x + 6, y + 6))
    stripes = "".join('<path class="athin soft" d="M%g,196 L%g,318"/>' % (x, x + 4)
                      for x in range(212, 400, 26))
    return (ground(340) + blob(300, 214, 158)
            + wisp(238, 150, "rise d1", .7) + wisp(360, 146, "rise d3", .7)
            + drumstick(246, 176, -16) + drumstick(300, 160, 4) + drumstick(354, 178, 15)
            + '<path class="pap" d="M198,190 L402,190 L376,326 C374,338 226,338 224,326 Z"/>'
            + '<path class="line" d="M198,190 L402,190 L376,326 C374,338 226,338 224,326 Z"/>'
            + stripes
            + '<rect class="accd" x="188" y="174" width="224" height="28" rx="14"/>'
            + '<ellipse class="accd" cx="300" cy="262" rx="76" ry="40"/>'
            + '<ellipse class="pap" cx="300" cy="262" rx="62" ry="29"/>'
            + '<path class="aline" d="M262,262 C278,250 322,250 338,262"/>'
            + '<circle class="hot" cx="300" cy="276" r="8"/>')


def _sp_broaster():
    ticks = "".join('<path class="athin" transform="rotate(%g 300 118)" d="M300,84 L300,92"/>'
                    % (i * 30 - 120) for i in range(9))
    return (ground(344) + blob(300, 214, 168)
            + '<path class="solid" d="M168,196 C168,164 432,164 432,196 L432,300 '
              'C432,330 168,330 168,300 Z"/>'
            + '<ellipse class="accd" cx="300" cy="194" rx="132" ry="28"/>'
            + '<ellipse class="deep" cx="300" cy="192" rx="108" ry="19"/>'
            + '<path class="line" style="stroke-width:10" d="M204,178 L396,178"/>'
            + '<path class="line" d="M186,196 L176,232 M414,196 L424,232"/>'
            + '<circle class="pap" cx="300" cy="118" r="44"/>'
            + '<circle class="line" cx="300" cy="118" r="44" fill="none"/>' + ticks
            + '<g class="sweep" %s><path class="aline" d="M300,118 L300,86"/></g>' % org(300, 118)
            + '<circle class="solid" cx="300" cy="118" r="8"/>'
            + '<path class="line" d="M300,162 L300,178"/>'
            + '<path class="pline soft" d="M206,240 L206,296 M394,240 L394,296"/>'
            + '<path class="line" d="M192,324 L192,346 M408,324 L408,346"/>'
            + flame(232, 348, 40, "hot flick") + flame(300, 352, 52, "hot flick d2")
            + flame(368, 348, 40, "hot flick d1"))


def _sp_shake():
    swirl = ('<g class="spinr" %s><path class="athin" d="M300,100 C328,100 340,118 '
             '320,128 C300,136 288,122 302,114"/></g>' % org(300, 120))
    return (ground(344) + blob(276, 206, 156)
            + '<path class="pap" d="M238,148 C238,120 358,120 358,148 Z"/>'
            + '<path class="line" d="M238,148 C238,120 358,120 358,148"/>' + swirl
            + '<path class="aline" style="stroke-width:9" d="M372,74 L336,150"/>'
            + '<circle class="accd" cx="348" cy="88" r="14"/>'
            + '<path class="thin" d="M348,74 C352,62 364,58 372,60"/>'
            + '<path class="acc" d="M248,158 L268,308 C268,316 328,316 328,308 L348,158 Z"/>'
            + '<path class="glass" d="M242,148 L266,318 C266,330 330,330 330,318 L354,148 Z"/>'
            + '<path class="line" d="M242,148 L266,318 C266,330 330,330 330,318 L354,148"/>'
            + '<circle class="pap soft rise" cx="286" cy="290" r="7"/>'
            + '<circle class="pap soft rise d2" cx="308" cy="298" r="5"/>'
            + '<path class="pap" d="M382,268 C382,238 526,238 526,268 C526,296 382,296 382,268 Z"/>'
            + '<path class="line" d="M382,268 C382,238 526,238 526,268 C526,296 382,296 382,268 Z"/>'
            + '<path class="accd" d="M392,264 C412,250 436,276 458,260 C480,246 502,272 518,262"/>'
            + "".join('<circle class="thin" cx="%g" cy="250" r="2.5" fill="none"/>' % x
                      for x in range(406, 510, 24)))


# ========================================================== THE JUICE MERCHANT
# Narberth juice bar: cold-pressed, smoothies, bowls, cleanses.
def _jm_press():
    return (ground(342) + blob(292, 200, 168)
            + '<path class="solid" d="M172,74 L412,74 L412,102 L172,102 Z"/>'
            + '<path class="line" style="stroke-width:11" d="M190,102 L190,332 M394,102 L394,332"/>'
            + '<g class="press"><path class="accd" d="M206,146 L378,146 L378,172 L206,172 Z"/>'
            + '<path class="line" d="M292,146 L292,110"/></g>'
            + '<path class="wash2" d="M212,180 C212,172 372,172 372,180 L366,234 '
              'C364,244 220,244 218,234 Z"/>'
            + '<path class="line" d="M212,180 C212,172 372,172 372,180 L366,234 '
              'C364,244 220,244 218,234 Z"/>'
            + "".join('<path class="athin soft" d="M%g,182 L%g,236"/>' % (x, x)
                      for x in range(232, 366, 26))
            + '<path class="line" d="M232,248 L352,248 L318,268 L266,268 Z"/>'
            + '<path class="line" style="stroke-width:6" d="M292,268 L292,286"/>'
            + "".join('<path class="acc drop %s" d="M292,290 C286,300 286,308 292,308 '
                      'C298,308 298,300 292,290 Z"/>' % ("d%d" % (i + 1)) for i in range(3))
            + '<path class="pap" d="M436,190 L472,190 L472,214 C494,224 496,320 472,330 '
              'L436,330 C412,320 414,224 436,214 Z"/>'
            + '<path class="acc" d="M424,252 C428,246 480,246 484,252 C492,296 486,326 472,330 '
              'L436,330 C422,326 418,296 424,252 Z"/>'
            + '<path class="line" d="M436,190 L472,190 L472,214 C494,224 496,320 472,330 '
              'L436,330 C412,320 414,224 436,214 Z"/>'
            + '<rect class="accd" x="430" y="172" width="48" height="20" rx="7"/>')


def _jm_blender():
    fruit = ('<circle class="acc" cx="300" cy="188" r="20"/>'
             '<circle class="pap" cx="300" cy="188" r="11"/>'
             '<path class="accd" d="M262,232 C262,216 286,216 286,232 C286,250 262,250 262,232 Z"/>'
             '<circle class="hot" cx="336" cy="234" r="15"/>'
             '<path class="solid" d="M296,262 C286,252 306,240 316,250 C324,258 306,272 296,262 Z"/>'
             '<path class="accd" d="M266,178 C280,168 292,178 284,192 C274,202 258,190 266,178 Z"/>')
    blades = "".join('<path class="accd" transform="rotate(%g 300 288)" '
                     'd="M300,288 L342,278 L342,292 Z"/>' % (i * 120) for i in range(3))
    return (ground(344) + blob(300, 200, 160)
            + '<path class="solid" d="M228,300 L372,300 L360,346 L240,346 Z"/>'
            + '<circle class="pap" cx="300" cy="322" r="15"/>'
            + '<path class="athin" d="M300,322 L312,312"/>'
            + '<path class="glass" d="M240,112 L262,292 L338,292 L360,112 Z"/>'
            + '<g class="spin" %s>%s</g>' % (org(300, 216), fruit)
            + '<g class="spinf" %s>%s</g>' % (org(300, 288), blades)
            + '<path class="line" d="M240,112 L262,292 L338,292 L360,112"/>'
            + '<path class="line" d="M360,112 L392,124 L356,138"/>'
            + '<path class="line" d="M356,152 C404,162 404,230 356,240"/>'
            + '<rect class="accd" x="232" y="92" width="136" height="22" rx="9"/>'
            + '<circle class="accd" cx="300" cy="86" r="12"/>'
            + star4(438, 140, 16, "accd glint d2"))


def _jm_bowl():
    top = ""
    for i in range(8):
        x, y = polar(300, 216, 96, i * 45 - 90)
        if i % 4 == 0:
            top += ('<circle class="pap" cx="%g" cy="%g" r="19"/>'
                    '<circle class="acc" cx="%g" cy="%g" r="11"/>' % (x, y, x, y))
        elif i % 4 == 1:
            top += ('<circle class="accd" cx="%g" cy="%g" r="15"/>'
                    '<path class="hot" d="M%g,%g L%g,%g L%g,%g Z"/>'
                    % (x, y, x - 7, y - 13, x + 7, y - 13, x, y - 22))
        elif i % 4 == 2:
            top += ('<circle class="hot" cx="%g" cy="%g" r="17"/>'
                    + "".join('<path class="pline" d="M%g,%g L%g,%g"/>'
                              % ((x, y) + polar(x, y, 13, k * 60))
                              for k in range(6))) % (x, y)
        else:
            top += ('<rect class="solid" x="%g" y="%g" width="18" height="12" rx="5" '
                    'transform="rotate(%g %g %g)"/>' % (x - 9, y - 6, i * 24, x, y))
    return (ground(346) + blob(300, 216, 178)
            + '<path class="pap" d="M150,232 C158,336 442,336 450,232 Z"/>'
            + '<path class="line" d="M150,232 C158,336 442,336 450,232 Z"/>'
            + '<ellipse class="acc" cx="300" cy="232" rx="150" ry="28"/>'
            + '<ellipse class="line" cx="300" cy="232" rx="150" ry="28" fill="none"/>'
            + '<g class="spin" %s>%s</g>' % (org(300, 216), top)
            + '<path class="accd sway" %s d="M300,146 C276,146 268,124 284,116 '
              'C300,110 312,130 300,146 Z"/>' % org(300, 146)
            + '<path class="accd sway d2" %s d="M334,152 C312,158 296,140 310,128 '
              'C326,118 344,140 334,152 Z"/>' % org(334, 140)
            + '<path class="line" style="stroke-width:9" d="M486,158 L470,268"/>'
            + '<ellipse class="solid" cx="490" cy="146" rx="18" ry="26"/>')


# ======================================================= UNION CHILL MAT COMPANY
# Zelienople, since 1946: Ultramatic heaters, Red Rocket radiants, fans, A/C.
def _uc_heater():
    duct = ("M392,206 " + " ".join("q10,-13 20,0" for _ in range(7))
            + " l0,44 " + " ".join("q-10,13 -20,0" for _ in range(7)) + " Z")
    return (ground(344) + blob(296, 208, 176)
            + '<path class="solid" d="M136,300 L472,300 L472,322 L136,322 Z"/>'
            + '<path class="line" d="M156,322 L156,342 M452,322 L452,342 M136,342 L472,342"/>'
            + '<rect class="pap" x="150" y="150" width="244" height="150" rx="12"/>'
            + '<rect class="line" x="150" y="150" width="244" height="150" rx="12"/>'
            + '<path class="athin soft" d="M150,214 L394,214 M150,258 L394,258"/>'
            + '<rect class="accd" x="164" y="164" width="70" height="44" rx="8"/>'
            + '<circle class="pap" cx="184" cy="186" r="8"/>'
            + '<circle class="hot pulse" cx="212" cy="186" r="8"/>'
            + '<path class="line" style="stroke-width:9" d="M400,150 L400,94 '
              'C400,80 428,80 428,94 L428,150"/>'
            + '<path class="line" d="M392,86 L436,86"/>'
            + '<circle class="acc pulse" cx="200" cy="266" r="20"/>'
            + '<circle class="hot" cx="200" cy="266" r="10"/>'
            + '<path class="accd" d="%s"/>' % duct
            + '<path class="thin drift" d="M544,196 C560,190 566,204 580,198"/>'
            + '<path class="thin drift d2" d="M544,228 C562,220 570,236 584,230"/>'
            + '<path class="thin drift d3" d="M544,260 C560,254 566,268 580,262"/>'
            + flame(300, 342, 26, "hot flick d1"))


def _uc_fan():
    guard = "".join('<circle class="athin" cx="300" cy="180" r="%g" fill="none"/>' % r
                    for r in (52, 84, 116, 142))
    spokes = "".join('<path class="athin" transform="rotate(%g 300 180)" '
                     'd="M300,38 L300,128"/>' % (i * 30) for i in range(12))
    blades = "".join('<path class="accd" transform="rotate(%g 300 180)" '
                     'd="M300,180 C332,140 358,116 348,90 C316,106 300,140 300,180 Z"/>'
                     % (i * 90) for i in range(4))
    return (ground(340) + blob(300, 184, 186)
            + guard + spokes
            + '<g class="spinf" %s>%s</g>' % (org(300, 180), blades)
            + '<circle class="solid" cx="300" cy="180" r="28"/>'
            + '<circle class="pap" cx="300" cy="180" r="11"/>'
            + '<circle class="line" cx="300" cy="180" r="142" fill="none"/>'
            + '<path class="line" style="stroke-width:11" d="M300,322 L300,258"/>'
            + '<path class="line" d="M240,344 L360,344 M262,322 L300,344 M338,322 L300,344"/>'
            + '<path class="thin drift" d="M452,140 C482,132 500,146 524,138"/>'
            + '<path class="thin drift d2" d="M456,182 C490,172 512,188 540,180"/>'
            + '<path class="thin drift d3" d="M452,224 C482,216 500,230 524,222"/>')


def _uc_chiller():
    louvre = "".join('<path class="athin" d="M186,%g L354,%g"/>' % (y, y - 10)
                     for y in range(160, 254, 14))
    arms = ""
    for i in range(6):
        x1, y1 = polar(452, 176, 16, i * 60)
        x2, y2 = polar(452, 176, 54, i * 60)
        bx, by = polar(452, 176, 36, i * 60)
        b1 = polar(bx, by, 18, i * 60 - 50)
        b2 = polar(bx, by, 18, i * 60 + 50)
        arms += ('<path class="aline" d="M%g,%g L%g,%g M%g,%g L%g,%g M%g,%g L%g,%g"/>'
                 % (x1, y1, x2, y2, bx, by, b1[0], b1[1], bx, by, b2[0], b2[1]))
    return (ground(344) + blob(276, 208, 172)
            + '<rect class="pap" x="170" y="108" width="200" height="212" rx="14"/>'
            + '<rect class="line" x="170" y="108" width="200" height="212" rx="14"/>'
            + louvre
            + '<rect class="accd" x="186" y="122" width="66" height="26" rx="8"/>'
            + '<circle class="hot pulse" cx="336" cy="135" r="9"/>'
            + '<path class="aline" d="M190,272 C190,258 214,258 214,272 C214,286 238,286 238,272 '
              'C238,258 262,258 262,272 C262,286 286,286 286,272 C286,258 310,258 310,272 '
              'C310,286 334,286 334,272 C334,258 352,258 352,272"/>'
            + '<circle class="solid" cx="204" cy="332" r="14"/>'
            + '<circle class="solid" cx="336" cy="332" r="14"/>'
            + '<g class="spin" %s><g class="pulse">%s</g></g>' % (org(452, 176), arms)
            + '<path class="thin drift" d="M382,196 C410,188 428,202 448,194"/>'
            + '<path class="thin drift d2" d="M382,236 C414,226 434,242 458,234"/>'
            + star4(504, 262, 15, "accd glint d3"))


# ============================================================= WEATHERS MOTORS
# Media family dealership since 1922: sales, service, parts, body, financing.
def _wm_lot():
    body = ("M136,286 L142,244 C146,228 164,222 184,220 L212,190 C222,178 236,174 252,174 "
            "L342,174 C358,174 372,180 380,192 L404,222 L444,232 C458,236 466,246 466,258 "
            "L466,286 Z")
    pen = ""
    for i in range(9):
        x = 84 + i * 54
        y = 92 + math.sin(i / 8.0 * math.pi) * 34
        pen += ('<path class="%s" d="M%g,%g L%g,%g L%g,%g Z"/>'
                % ("acc" if i % 2 else "accd", x - 17, y, x + 17, y, x, y + 40))
    return (ground(330) + blob(300, 214, 186)
            + '<g class="sway" %s><path class="athin" d="M64,86 C200,140 400,140 536,86"/>%s</g>'
              % (org(300, 86), pen)
            + '<path class="solid" d="%s"/>' % body
            + '<path class="pap" d="M224,214 L248,190 L292,190 L292,214 Z"/>'
            + '<path class="pap" d="M302,190 L342,190 L364,214 L302,214 Z"/>'
            + '<path class="pline" d="M296,190 L296,262 M150,262 L452,262"/>'
            + '<circle class="acc" cx="456" cy="248" r="9"/>'
            + '<path class="line" d="M254,244 L276,244"/>'
            + roadwheel(196, 288, 36, 5, "spin")
            + roadwheel(410, 288, 36, 5, "spin")
            + '<path class="line" style="stroke-width:9" d="M528,330 L528,150"/>'
            + '<path class="accd" d="M504,138 L552,138 L546,158 L510,158 Z"/>'
            + '<circle class="hot pulse" cx="528" cy="168" r="10"/>')


def _wm_lift():
    car = ("M198,236 L204,204 C208,190 224,184 240,182 L264,158 C272,148 284,144 296,144 "
           "L372,144 C386,144 398,150 404,160 L424,184 L456,192 C468,196 474,204 474,214 "
           "L474,236 Z")
    return (blob(316, 200, 190) + ground(336)
            + '<path class="line" style="stroke-width:15" d="M158,96 L158,330 M486,96 L486,330"/>'
            + '<path class="solid" d="M132,318 L184,318 L184,336 L132,336 Z"/>'
            + '<path class="solid" d="M460,318 L512,318 L512,336 L460,336 Z"/>'
            + '<path class="athin soft" d="M168,110 L168,314 M476,110 L476,314"/>'
            + '<g class="lift">'
            + '<path class="accd" d="M158,250 L250,250 L250,268 L158,268 Z"/>'
            + '<path class="accd" d="M394,250 L486,250 L486,268 L394,268 Z"/>'
            + '<path class="solid" d="%s"/>' % car
            + '<path class="pap" d="M270,178 L288,158 L326,158 L326,178 Z"/>'
            + '<path class="pap" d="M336,158 L372,158 L392,178 L336,178 Z"/>'
            + '<circle class="deep" cx="252" cy="248" r="26"/>'
            + '<circle class="deep" cx="422" cy="248" r="26"/>'
            + '<circle class="pap" cx="252" cy="248" r="11"/>'
            + '<circle class="pap" cx="422" cy="248" r="11"/>'
            + '</g>'
            + '<path class="line" d="M110,336 L540,336"/>'
            + '<rect class="accd" x="72" y="264" width="66" height="72" rx="8"/>'
            + '<path class="pline" d="M82,286 L128,286 M82,308 L128,308"/>'
            + '<circle class="hot pulse" cx="158" cy="120" r="9"/>')


def _wm_key():
    teeth = ("M240,138 L400,132 L400,158 L384,158 L384,172 L366,172 L366,158 L348,158 "
             "L348,176 L330,176 L330,158 L240,162 Z")
    tag = ("M168,238 L256,238 L276,268 L256,298 L168,298 Z")
    return (blob(300, 190, 182) + ground(348)
            + ring(200, 150, 54, 30, "solid")
            + '<path class="accd" d="%s"/>' % teeth
            + '<g class="sway" %s>'
              '<path class="line" style="stroke-width:6" d="M200,178 L206,238"/>'
              '<path class="pap" d="%s"/><path class="line" d="%s"/>'
              '<circle class="accd" cx="188" cy="268" r="9"/>'
              '<path class="athin" d="M208,258 L262,258 M208,278 L248,278"/>'
              '</g>' % (org(200, 160), tag, tag)
            + '<g class="sway d2" %s>'
              '<path class="thin" d="M234,182 L286,244"/>'
              '<path class="accd" d="M282,240 L340,240 L354,264 L340,288 L282,288 Z"/>'
              '<circle class="pap" cx="298" cy="264" r="8"/></g>' % org(234, 176)
            + star4(430, 108, 20, "accd glint")
            + star4(462, 156, 13, "accd glint d2"))


# ==================================================== ADVANCE EXTERIOR SOLUTIONS
# Macungie roofing and exteriors: roofs, siding, storm damage, gutters, trim.
def _ae_roof():
    courses = ""
    for row in range(4):
        y = 150 + row * 26
        x0 = 300 + row * 30
        n = 4 - row
        cls = "slide" if row == 3 else ""
        courses += '<g class="%s">' % cls
        for i in range(n + 1):
            x = x0 + i * 34
            courses += ('<path class="accd" d="M%g,%g L%g,%g L%g,%g L%g,%g Z"/>'
                        '<path class="pline soft" d="M%g,%g L%g,%g"/>'
                        % (x, y, x + 30, y, x + 30, y + 22, x, y + 22,
                           x + 15, y, x + 15, y + 22))
        courses += '</g>'
    return (ground(344) + blob(300, 200, 190)
            + '<path class="pap" d="M152,222 L152,338 L448,338 L448,222 Z"/>'
            + '<path class="line" d="M152,222 L152,338 L448,338 L448,222"/>'
            + '<path class="wash2" d="M300,110 L120,224 L300,224 Z"/>'
            + '<path class="pap" d="M300,110 L480,224 L300,224 Z"/>'
            + '<path class="line" d="M120,224 L300,110 L480,224"/>'
            + courses
            + '<path class="solid" d="M366,124 L398,124 L398,168 L366,146 Z"/>'
            + '<rect class="accd" x="226" y="254" width="80" height="62" rx="6"/>'
            + '<path class="pline" d="M266,254 L266,316 M226,286 L306,286"/>'
            + '<path class="line" style="stroke-width:6" d="M492,340 L436,196 M516,336 L460,192"/>'
            + "".join('<path class="thin" d="M%g,%g L%g,%g"/>'
                      % (444 + i * 9.5, 220 + i * 24, 468 + i * 9.5, 216 + i * 24)
                      for i in range(5))
            + '<path class="acc drop" d="M180,232 C174,242 174,250 180,250 '
              'C186,250 186,242 180,232 Z"/>'
            + '<path class="acc drop d2" d="M214,232 C208,242 208,250 214,250 '
              'C220,250 220,242 214,232 Z"/>')


def _ae_gutter():
    return (blob(300, 208, 192)
            + '<path class="wash2" d="M100,86 L300,86 L500,86 L520,152 L80,152 Z"/>'
            + "".join('<path class="accd" d="M%g,%g L%g,%g L%g,%g L%g,%g Z"/>'
                      % (x, 108 + (x % 60) * .05, x + 34, 108, x + 34, 130, x, 130)
                      for x in range(96, 500, 38))
            + '<path class="solid" d="M112,152 L512,152 L512,182 L112,182 Z"/>'
            + '<path class="pap" d="M112,182 L512,182 L512,212 C512,230 498,242 480,242 '
              'L144,242 C126,242 112,230 112,212 Z"/>'
            + '<path class="line" d="M112,182 L512,182 L512,212 C512,230 498,242 480,242 '
              'L144,242 C126,242 112,230 112,212 Z"/>'
            + '<path class="aline" style="stroke-width:11" '
              'd="M136,212 L488,212" class="aline dash"/>'
            + '<path class="line" style="stroke-width:22" d="M462,242 L462,306 '
              'C462,322 476,332 494,332"/>'
            + '<path class="pline soft" d="M462,254 L462,300"/>'
            + '<path class="line" d="M436,242 L488,242"/>'
            + "".join('<path class="acc drop %s" d="M%g,342 C%g,352 %g,360 %g,360 '
                      'C%g,360 %g,352 %g,342 Z"/>'
                      % ("d%d" % (i + 1), 512 + i * 2, 506 + i * 2, 506 + i * 2, 512 + i * 2,
                         518 + i * 2, 518 + i * 2, 512 + i * 2) for i in range(3))
            + '<path class="accd drift" d="M180,286 C196,272 224,278 226,296 '
              'C214,306 186,304 180,286 Z"/>'
            + '<path class="accd drift d2" d="M292,318 C306,304 334,310 336,328 '
              'C324,338 298,336 292,318 Z"/>')


def _ae_siding():
    boards = ""
    for i in range(6):
        y = 108 + i * 34
        cls = "slide" if i == 2 else ""
        boards += ('<g class="%s"><path class="pap" d="M132,%g L468,%g L468,%g L132,%g Z"/>'
                   '<path class="line" d="M132,%g L468,%g L468,%g L132,%g Z"/>'
                   '<path class="athin soft" d="M132,%g L468,%g"/></g>'
                   % (cls, y, y, y + 32, y + 32, y, y, y + 32, y + 32, y + 26, y + 26))
    return (blob(300, 210, 196) + boards
            + '<path class="solid" d="M468,100 L500,100 L500,344 L468,344 Z"/>'
            + '<path class="pline soft" d="M484,112 L484,332"/>'
            + '<g><rect class="accd" x="148" y="300" width="304" height="42" rx="10"/>'
            + '<rect class="pap" x="266" y="310" width="68" height="22" rx="11"/>'
            + '<circle class="hot nudge" cx="300" cy="321" r="8"/>'
            + '<path class="pline" d="M286,310 L286,332 M314,310 L314,332"/>'
            + '<rect class="pap" x="176" y="312" width="32" height="18" rx="6"/>'
            + '<rect class="pap" x="392" y="312" width="32" height="18" rx="6"/></g>'
            + "".join('<circle class="accd" cx="%g" cy="%g" r="6"/>' % (x, 124 + (x % 90))
                      for x in (162, 252, 342, 432))
            + star4(180, 82, 15, "accd glint d2"))


# ------------------------------------------------- statement-block marks
# The three decorations either side of the statement copy. The originals in
# _source were Lottie exports and carried __lottie_element ids into every page;
# these are drawn here, take currentColor, and are aria-hidden.
DESIGN = {
    "left": ('<svg viewBox="0 0 220 200" aria-hidden="true" focusable="false" '
             'fill="none" stroke="currentColor" stroke-linecap="round">'
             '<path d="M40,168 C40,96 92,44 164,44" stroke-width="9" opacity=".9"/>'
             '<path d="M70,176 C70,116 112,74 172,74" stroke-width="6" opacity=".6"/>'
             '<path d="M100,184 C100,136 132,104 180,104" stroke-width="4" opacity=".4"/>'
             '<circle cx="188" cy="36" r="10" fill="currentColor" stroke="none"/>'
             '</svg>'),
    "middle": ('<svg viewBox="0 0 120 200" aria-hidden="true" focusable="false" '
               'fill="none" stroke="currentColor" stroke-linecap="round" '
               'stroke-linejoin="round">'
               '<g class="dm-bob"><path d="M60,26 L60,146" stroke-width="9"/>'
               '<path d="M22,110 L60,150 L98,110" stroke-width="9"/></g>'
               '<path d="M28,178 L92,178" stroke-width="6" opacity=".5"/>'
               '<style>.dm-bob{animation:il-bob 6s ease-in-out infinite}'
               '@media (prefers-reduced-motion:reduce){.dm-bob{animation:none}}</style>'
               '</svg>'),
    "right": ('<svg viewBox="0 0 220 200" aria-hidden="true" focusable="false" '
              'fill="none" stroke="currentColor" stroke-linecap="round">'
              '<path d="M180,168 C180,96 128,44 56,44" stroke-width="9" opacity=".9"/>'
              '<path d="M150,176 C150,116 108,74 48,74" stroke-width="6" opacity=".6"/>'
              '<path d="M120,184 C120,136 88,104 40,104" stroke-width="4" opacity=".4"/>'
              '<circle cx="32" cy="36" r="10" fill="currentColor" stroke="none"/>'
              '</svg>'),
}


# ------------------------------------------------- the green section pair
# Two visuals for the deep-green band, drawn from the same primitives and the
# same motion vocabulary as the thirty. They read a *different* set of values
# for --brand-ink / --accent-ink etc, because .bridge redeclares those inside
# itself, so identical geometry comes out in the Bridge palette without a
# second colour system.
#
# Neither repeats a drawing that appears elsewhere on the page: source-backed
# routes may carry their own typographic seal, while blocked routes receive a
# neutral, unlettered pending medallion. Each motif is a single-subject glyph,
# not one of the three scenes.
def _disc(cx, cy, r, cls="wash"):
    return '<circle class="%s" cx="%g" cy="%g" r="%g"/>' % (cls, cx, cy, r)


def seal(initials):
    """The monogram medallion: two rings, the business's own initials in the
    display face, four marks on a slow orbit, one warm arc under them."""
    ticks = "".join('<circle class="accd" cx="%g" cy="%g" r="5"/>'
                    % polar(160, 160, 126, i * 90 - 90) for i in range(4))
    label = ('<text class="seal_mono" x="160" y="190" text-anchor="middle">%s</text>'
             % initials) if initials else ""
    return ('<circle class="line" style="stroke-width:5" cx="160" cy="160" r="140" '
            'fill="none"/>'
            + _disc(160, 160, 118)
            + '<circle class="athin" cx="160" cy="160" r="104" fill="none"/>'
            + '<g class="spin" %s>%s</g>' % (org(160, 160), ticks)
            + '<path class="aline sway" %s d="M64,224 C104,254 216,254 256,224" '
              'fill="none"/>' % org(160, 224)
            + label)


def _mo_roof():
    return (_disc(160, 168, 116)
            + '<path class="line" d="M52,182 L160,96 L268,182"/>'
            + '<path class="thin" d="M74,200 L246,200 M86,224 L234,224 M98,248 L222,248"/>'
            + '<path class="athin drop" d="M196,264 L196,286"/>'
            + '<path class="athin drop d2" d="M132,264 L132,286"/>')


def _mo_dial():
    return (_disc(160, 160, 116)
            + '<circle class="line" cx="160" cy="160" r="86" fill="none"/>'
            + '<path class="aline sweep" %s d="M160,160 L160,92"/>' % org(160, 160)
            + '<circle class="accd" cx="160" cy="160" r="10"/>'
            + "".join('<path class="thin" d="M%g,%g L%g,%g"/>'
                      % (polar(160, 160, 100, a) + polar(160, 160, 112, a))
                      for a in range(180, 361, 30))
            + wisp(214, 276, "rise", .5) + wisp(108, 276, "rise d2", .5))


def _mo_bowl():
    return (_disc(160, 176, 116)
            + '<path class="line" d="M74,170 C74,238 116,272 160,272 C204,272 246,238 '
              '246,170" fill="none"/>'
            + '<path class="athin" d="M62,170 L258,170"/>'
            + '<path class="aline sway" %s d="M186,122 L232,76 M204,134 L250,88"/>'
              % org(232, 104)
            + wisp(130, 150, "rise", .5) + wisp(164, 142, "rise d2", .6))


def _mo_hex():
    pts = " ".join("%g,%g" % polar(160, 160, 92, i * 60) for i in range(6))
    return (_disc(160, 160, 116)
            + '<polygon class="line" points="%s" fill="none"/>' % pts
            + ring(160, 160, 52, 30, "accd")
            + '<g class="spinr" %s>%s</g>'
              % (org(160, 160),
                 "".join('<circle class="pap" cx="%g" cy="%g" r="6"/>'
                         % polar(160, 160, 70, i * 90 + 45) for i in range(4))))


def _mo_tyre():
    tread = "".join('<rect class="pap" x="152" y="66" width="16" height="24" rx="5" '
                    'transform="rotate(%g 160 160)"/>' % (i * 30) for i in range(12))
    return (_disc(160, 160, 116)
            + '<g class="spin" %s><circle class="solid" cx="160" cy="160" r="102"/>%s'
              '<circle class="wash" cx="160" cy="160" r="62"/>'
              '<circle class="accd" cx="160" cy="160" r="20"/></g>'
              % (org(160, 160), tread))


def _mo_tooth():
    d = ("M96,132 C96,96 126,80 160,80 C194,80 224,96 224,132 C224,158 214,170 210,192 "
         "C206,212 200,244 188,244 C176,244 174,216 170,196 C167,182 153,181 150,196 "
         "C146,216 144,244 132,244 C120,244 114,212 110,192 C106,170 96,158 96,132 Z")
    return (_disc(160, 160, 116)
            + '<path class="pap" d="%s"/><path class="line" d="%s"/>' % (d, d)
            + star4(228, 102, 18, "accd glint")
            + star4(96, 96, 12, "accd glint d2"))


def _mo_drum():
    return (_disc(160, 168, 116)
            + '<path class="line" d="M110,234 C88,208 94,166 124,142 C156,116 198,122 '
              '216,150 C234,178 222,216 192,230 C174,238 150,242 134,254" fill="none"/>'
            + '<path class="aline" d="M134,254 L106,284 M134,254 L158,288"/>'
            + wisp(198, 118, "rise", .5) + wisp(148, 110, "rise d2", .45))


def _mo_bottle():
    return (_disc(160, 168, 116)
            + '<path class="line" d="M138,86 L182,86 L182,120 C204,136 208,158 208,186 '
              'L208,254 C208,268 198,276 184,276 L136,276 C122,276 112,268 112,254 '
              'L112,186 C112,158 116,136 138,120 Z" fill="none"/>'
            + '<path class="acc" d="M114,198 L206,198 L206,254 C206,266 198,274 '
              '184,274 L136,274 C122,274 114,266 114,254 Z"/>'
            + '<path class="aline nudge" d="M170,84 L198,44"/>'
            + '<circle class="hot pulse" cx="160" cy="228" r="16"/>')


def _mo_fan():
    blades = "".join('<path class="solid" transform="rotate(%g 160 160)" d="M160,160 '
                     'C186,148 200,116 190,88 C168,92 156,124 160,160 Z"/>' % (i * 90)
                     for i in range(4))
    return (_disc(160, 160, 116)
            + '<g class="spinf" %s>%s</g>' % (org(160, 160), blades)
            + ring(160, 160, 108, 100, "accd")
            + '<circle class="pap" cx="160" cy="160" r="16"/>')


def _mo_key():
    return (_disc(160, 160, 116)
            + ring(118, 130, 42, 24, "solid")
            + '<path class="line" d="M154,150 L244,220"/>'
            + '<path class="aline" d="M210,194 L198,212 M234,212 L222,230"/>'
            + '<g class="sway" %s><path class="accd" d="M186,230 L240,270 L212,298 '
              'L158,258 Z"/></g>' % org(198, 238))


def _mo_grid():
    pages = "".join('<g class="pulse d%d"><rect class="pap" x="%g" y="%g" width="30" '
                    'height="40" rx="5"/><rect class="accd" x="%g" y="%g" width="30" '
                    'height="7" rx="3.5"/></g>'
                    % (i % 4 + 1, 92 + (i % 3) * 46, 96 + (i // 3) * 52,
                       92 + (i % 3) * 46, 96 + (i // 3) * 52)
                    for i in range(10))
    return _disc(160, 160, 116) + pages


def _mo_pending():
    """A source-neutral motif for routes whose prospect art is not verified."""
    return (_disc(160, 160, 116)
            + '<path class="line" d="M82,196 C106,132 148,112 176,140 '
              'C202,166 228,152 244,112" fill="none"/>'
            + '<path class="aline" d="M86,226 L234,226"/>'
            + '<circle class="hot pulse" cx="160" cy="226" r="12"/>'
            + star4(108, 102, 14, "accd glint")
            + star4(220, 236, 12, "accd glint d2"))


MOTIF = {
    "hub": ("Ten preview pages laid out on one grid", _mo_grid),
    "advance-exterior-solutions": ("A gable roof going on course by course with rain "
                                   "running off the eave", _mo_roof),
    "f-m-berkheimer-inc": ("A round thermostat dial, its needle sweeping while warm air "
                           "rises past it", _mo_dial),
    "golden-sea": ("A noodle bowl with chopsticks resting across it and steam curling "
                   "off the top", _mo_bowl),
    "nolts-auto-parts": ("A hex fastener around a turning bearing race", _mo_hex),
    "sangillo-tire-center": ("A tyre turning on its rim with the tread blocks running "
                             "round the shoulder", _mo_tyre),
    "smile-culture-dental": ("A polished molar with sparkles coming up off the crown",
                             _mo_tooth),
    "specks-broasted-chicken": ("A broasted drumstick with the heat still coming off it",
                                _mo_drum),
    "the-juice-merchant": ("A cold-press bottle with a straw and the juice filling it",
                           _mo_bottle),
    "union-chill-mat-company": ("An industrial fan turning inside its guard", _mo_fan),
    "weathers-motors-and-auto-sales": ("A key on its ring with the dealer tag swinging "
                                       "off it", _mo_key),
}

BRIDGE_VIEWBOX = "0 0 320 320"


def bridge_svg(kind, title, body):
    return ('<svg class="illo bridge_%s" viewBox="%s" preserveAspectRatio="xMidYMid meet" '
            'role="img" focusable="false"><title>%s</title>%s</svg>'
            % (kind, BRIDGE_VIEWBOX, title, body))


def bridge_pair(slug, initials, name):
    """Return the green-section pair without inventing blocked identities.

    Source-backed routes can use their established motif and initials. A route
    outside the incumbent motif registry is source-pending, so its seal is
    deliberately unlettered and its second visual is the neutral pending glyph.
    """
    if slug not in MOTIF:
        return (bridge_svg("seal", "Source review pending medallion", seal("")),
                bridge_svg("motif", "Source review pending for %s" % name, _mo_pending()))
    mtitle, fn = MOTIF[slug]
    return (bridge_svg("seal", "Monogram medallion for %s" % name, seal(initials)),
            bridge_svg("motif", mtitle, fn()))


# ------------------------------------------------------------------ registry
# =============================================================== THE LOWER HALF
# Three more per business, placed below the green section. The first three of
# each set are the subject (what the business makes); these are the process and
# the proof around it - the bench it is made on, the material it is made from,
# the finished result, and the block it stands on. Deliberately different
# compositions from the hero set: interiors, flat elevations, plan views and
# still lifes rather than six variations of one object.


def pegholes(x0, y0, x1, y1, step=22):
    """Pegboard: a field of small holes, drawn not tiled from an image."""
    return "".join('<circle class="deep soft" cx="%g" cy="%g" r="3"/>' % (x, y)
                   for x in range(x0, x1, step) for y in range(y0, y1, step))


def dial(cx, cy, r, ticks=8, cls="sweep"):
    """A round gauge with a needle that sweeps its own arc."""
    t = "".join('<path class="athin" transform="rotate(%g %g %g)" d="M%g,%g L%g,%g"/>'
                % (i * 300.0 / (ticks - 1) - 150, cx, cy, cx, cy - r * .84, cx, cy - r * .64)
                for i in range(ticks))
    return ('<circle class="pap" cx="%g" cy="%g" r="%g"/>'
            '<circle class="line" cx="%g" cy="%g" r="%g" fill="none"/>%s'
            '<g class="%s" %s><path class="aline" d="M%g,%g L%g,%g"/></g>'
            '<circle class="solid" cx="%g" cy="%g" r="%g"/>'
            % (cx, cy, r, cx, cy, r, t, cls, org(cx, cy),
               cx, cy, cx, cy - r * .74, cx, cy, r * .13))


def slats(x0, y0, w, h, n, cls="athin"):
    """Evenly split horizontal bands - a roll-up door, a crate, a shutter."""
    return "".join('<path class="%s" d="M%g,%g L%g,%g"/>'
                   % (cls, x0, y0 + h * (i + 1) / float(n + 1),
                      x0 + w, y0 + h * (i + 1) / float(n + 1)) for i in range(n))


def bottle(x, y, w, h, cls="acc"):
    """A capped bottle: shoulders, neck, cap, and a highlight down one side."""
    return ('<path class="%s" d="M%g,%g L%g,%g C%g,%g %g,%g %g,%g L%g,%g '
            'C%g,%g %g,%g %g,%g Z"/>'
            '<rect class="accd" x="%g" y="%g" width="%g" height="%g" rx="3"/>'
            '<path class="pap soft" d="M%g,%g L%g,%g"/>'
            % (cls, x - w * .18, y, x - w * .18, y + h * .16,
               x - w * .5, y + h * .24, x - w * .5, y + h * .34, x - w * .5, y + h,
               x + w * .5, y + h, x + w * .5, y + h * .34, x + w * .5, y + h * .24,
               x + w * .18, y + h * .16,
               x - w * .26, y - h * .1, w * .52, h * .12,
               x - w * .3, y + h * .42, x - w * .3, y + h * .86))


# ------------------------------------------------------------ F.M. BERKHEIMER
def _fm_bench():
    """The shop bench under a pegboard wall: the gauge manifold set with its two
    dials and hoses, and the hand tools hanging above it."""
    tools = "".join(
        '<g class="sway %s" %s>'
        '<path class="thin" d="M%g,%g L%g,%g"/>'
        '<path class="accd" d="M%g,%g C%g,%g %g,%g %g,%g Z"/></g>'
        % ("d%d" % (i + 1), org(x, 118), x, 132, x, 186,
           x - 9, 132, x - 11, 112, x + 11, 112, x + 9, 132)
        for i, x in enumerate((452, 492, 532)))
    return ('<rect class="wash2" x="60" y="82" width="480" height="150" rx="8"/>'
            + pegholes(78, 100, 540, 224)
            + '<rect class="wash" x="40" y="244" width="520" height="16" rx="8"/>'
            + '<path class="line" d="M78,260 L78,352 M522,260 L522,352"/>'
            + '<path class="thin" d="M78,318 L522,318"/>'
            # manifold body
            + '<rect class="solid" x="196" y="150" width="208" height="60" rx="12"/>'
            + dial(240, 152, 40) + dial(360, 152, 40, cls="sweep d2")
            + '<path class="aline" style="stroke-width:9" d="M300,168 L300,206"/>'
            + '<circle class="hot" cx="300" cy="212" r="10"/>'
            # hoses down to the bench
            + '<path class="line dash" d="M212,208 C176,246 150,236 132,244"/>'
            + '<path class="aline dash" d="M388,208 C424,248 450,238 470,246"/>'
            + '<path class="thin" d="M300,220 C300,238 292,238 292,246"/>'
            + tools
            + '<rect class="accd" x="120" y="222" width="84" height="22" rx="6"/>'
            + '<rect class="acc" x="404" y="216" width="62" height="28" rx="6"/>'
            + '<path class="pline soft" d="M416,224 L454,224"/>')


def _fm_filter():
    """A pleated filter drawn out of the return slot, dust carried off it."""
    pleat = "M180,150"
    for i in range(11):
        pleat += " L%g,%g L%g,%g" % (190 + i * 22, 236, 201 + i * 22, 150)
    motes = "".join('<circle class="deep soft drift %s" cx="%g" cy="%g" r="%g"/>'
                    % ("d%d" % (i % 4 + 1), 452 + (i % 3) * 26, 130 + (i * 23) % 120,
                       3 + (i % 3)) for i in range(9))
    return (blob(300, 200, 168)
            + '<path class="line" d="M96,96 L96,304 L156,304 L156,96"/>'
            + '<rect class="wash" x="100" y="100" width="52" height="200"/>'
            + '<g class="slide">'
            + '<rect class="pap" x="168" y="140" width="264" height="106" rx="5"/>'
            + '<path class="line" d="M168,140 L432,140 L432,246 L168,246 Z"/>'
            + '<path class="athin" d="%s"/>' % pleat
            + '<path class="accd" d="M168,132 L432,132 L432,142 L168,142 Z"/>'
            + '<path class="accd" d="M168,244 L432,244 L432,254 L168,254 Z"/></g>'
            + '<path class="thin" d="M446,168 C486,168 496,182 528,182" '
              'stroke-dasharray="16 12"/>'
            + motes
            + '<path class="aline" d="M300,282 L300,318 M282,302 L300,320 L318,302"/>'
            + '<ellipse class="wash" cx="300" cy="340" rx="176" ry="14"/>')


def _fm_tank():
    """A water heater: welded cylinder, the two pipes off its crown, the gauge
    and the burner glow at the skirt."""
    return (ground(348)
            + '<path class="solid" d="M198,144 C198,110 402,110 402,144 L402,318 '
              'C402,336 198,336 198,318 Z"/>'
            + '<ellipse class="deep" cx="300" cy="144" rx="102" ry="26"/>'
            + '<ellipse class="pap soft" cx="300" cy="142" rx="82" ry="17"/>'
            + '<path class="pline soft" d="M232,190 L232,300 M368,190 L368,300"/>'
            + '<path class="line" style="stroke-width:10" '
              'd="M244,132 L244,74 C244,58 292,58 292,74 L292,96"/>'
            + '<path class="aline" style="stroke-width:10" '
              'd="M356,132 L356,74 C356,58 308,58 308,74 L308,96"/>'
            + '<circle class="hot" cx="300" cy="96" r="12"/>'
            + dial(300, 220, 42)
            + '<rect class="accd" x="252" y="276" width="96" height="20" rx="10"/>'
            + '<path class="line" d="M222,336 L214,358 M378,336 L386,358"/>'
            + flame(268, 336, 34, "hot flick d1") + flame(300, 342, 44, "hot flick")
            + flame(332, 336, 34, "hot flick d2")
            + wisp(300, 60, "rise", .7) + wisp(346, 66, "rise d3", .5))


# ------------------------------------------------------------------ GOLDEN SEA

def _gs_board():
    """The prep board: the cleaver coming down on it, spring onion already cut
    into rounds, and ginger and garlic waiting at the far end."""
    rounds = "".join('<circle class="acc" cx="%g" cy="284" r="11"/>'
                     '<circle class="pap soft" cx="%g" cy="284" r="5"/>' % (x, x)
                     for x in (188, 214, 240, 266))
    cleaver = (
        '<g transform="rotate(-16 262 168)">'
        '<path class="solid" d="M176,96 L316,96 L316,204 C316,214 176,216 176,204 Z"/>'
        '<path class="pline soft" d="M190,112 L302,112"/>'
        '<circle class="deep" cx="212" cy="140" r="7"/>'
        '<circle class="deep" cx="252" cy="140" r="7"/>'
        '<path class="aline" style="stroke-width:6" d="M180,206 C230,214 268,214 312,204"/>'
        '<rect class="deep" x="316" y="118" width="20" height="70" rx="4"/>'
        '<path class="accd" d="M336,132 L432,140 L432,172 L336,178 Z"/>'
        '<circle class="pap" cx="404" cy="156" r="6"/></g>')
    return (blob(300, 210, 172) + ground(348)
            + '<path class="wash" d="M112,236 L470,236 C486,236 486,318 470,318 '
              'L112,318 C100,318 100,236 112,236 Z"/>'
            + '<path class="line" d="M112,236 L470,236 C486,236 486,318 470,318 '
              'L112,318 C100,318 100,236 112,236 Z"/>'
            + '<circle class="thin" cx="466" cy="277" r="9" fill="none"/>' + rounds
            + '<path class="acc" d="M300,272 C300,258 336,254 342,270 '
              'C346,286 312,292 300,272 Z"/>'
            + '<path class="athin" d="M308,268 C318,262 332,264 338,272"/>'
            + '<path class="accd" d="M372,266 C392,254 418,266 414,286 '
              'C396,294 378,284 372,266 Z"/>'
            + '<path class="athin" d="M378,274 L406,282 M382,284 L404,272"/>'
            + '<g class="press" %s>%s</g>' % (org(262, 168), cleaver)
            + '<path class="athin" d="M212,216 C216,202 208,194 214,182" '
              'stroke-dasharray="8 8"/>'
            + star4(136, 176, 15, "accd glint d2"))


def _gs_carton():
    """The order that leaves the counter: the folded takeout carton with its
    wire bail up, the chopsticks in their sleeve, and the slip alongside."""
    return (ground(346) + blob(292, 208, 158)
            + wisp(262, 152, "rise d1", .6) + wisp(336, 146, "rise d3", .6)
            + '<g class="sway" %s>' % org(300, 128)
            + '<path class="thin" d="M226,178 C236,110 364,110 374,178"/></g>'
            # the folded top: two flaps meeting at a notch
            + '<path class="accd" d="M214,196 L262,164 L338,164 L386,196 Z"/>'
            + '<path class="line" d="M214,196 L262,164 L338,164 L386,196"/>'
            + '<path class="thin" d="M300,164 L300,196"/>'
            # the tapered body
            + '<path class="pap" d="M214,196 L386,196 L358,322 C356,334 244,334 '
              '242,322 Z"/>'
            + '<path class="line" d="M214,196 L386,196 L358,322 C356,334 244,334 '
              '242,322 Z"/>'
            + '<path class="athin" d="M232,232 L368,232"/>'
            + '<path class="acc" d="M252,250 L348,250 L342,286 L258,286 Z"/>'
            + '<path class="pline" d="M270,266 L330,266"/>'
            + '<path class="athin" d="M262,196 L252,322 M338,196 L348,322" '
              'opacity=".45"/>'
            + '<path class="aline" style="stroke-width:9" d="M428,128 L450,300"/>'
            + '<path class="aline" style="stroke-width:9" d="M456,124 L480,296"/>'
            + '<path class="acc" d="M424,122 L488,114 L492,154 L428,162 Z"/>'
            + '<g class="bob d2"><path class="pap" d="M108,246 L188,232 L200,290 '
              'L120,304 Z"/><path class="line" d="M108,246 L188,232 L200,290 L120,304 Z"/>'
            + '<path class="athin" d="M124,260 L184,250 M128,274 L178,266"/></g>'
            + star4(474, 216, 14, "accd glint"))

def _gs_lantern():
    """The Blue Bell storefront after dark: the awning, two lanterns swinging
    under it, and the light in the window."""
    lamp = lambda x, d: (
        '<g class="sway %s" %s><path class="thin" d="M%g,152 L%g,178"/>'
        '<path class="hot" d="M%g,178 C%g,164 %g,164 %g,178 C%g,214 %g,214 %g,178 Z"/>'
        '<path class="aline" d="M%g,178 C%g,164 %g,164 %g,178 C%g,214 %g,214 %g,178 Z"/>'
        '<path class="accd" d="M%g,214 L%g,226 M%g,216 L%g,232 M%g,216 L%g,232"/></g>'
        % (d, org(x, 152), x, x,
           x - 26, x - 26, x + 26, x + 26, x + 26, x - 26, x - 26,
           x - 26, x - 26, x + 26, x + 26, x + 26, x - 26, x - 26,
           x - 10, x - 12, x, x, x + 10, x + 12))
    return ('<rect class="wash2" x="60" y="86" width="480" height="266" rx="6"/>'
            + '<path class="solid" d="M60,86 L540,86 L540,142 L60,142 Z"/>'
            + "".join('<path class="acc" d="M%g,142 L%g,142 L%g,178 Z"/>'
                      % (76 + i * 78, 154 + i * 78, 115 + i * 78) for i in range(6))
            + '<path class="line" d="M60,142 L540,142"/>'
            + lamp(184, "") + lamp(416, "d2")
            + '<rect class="pap" x="130" y="216" width="140" height="116" rx="5"/>'
            + '<path class="line" d="M130,216 L270,216 L270,332 L130,332 Z"/>'
            + '<path class="athin" d="M200,216 L200,332 M130,274 L270,274"/>'
            + '<rect class="hot soft pulse" x="140" y="226" width="50" height="38"/>'
            + '<rect class="wash" x="330" y="200" width="112" height="152" rx="5"/>'
            + '<path class="line" d="M330,200 L442,200 L442,352"/>'
            + '<circle class="accd" cx="422" cy="284" r="8"/>'
            + '<path class="accd" d="M348,232 L424,232 L424,244 L348,244 Z"/>'
            + '<path class="thin" d="M60,352 L540,352"/>'
            + star4(504, 176, 16, "accd glint d3"))


# ------------------------------------------------------------- NOLT'S AUTO PARTS
def _na_battery():
    """A battery on the tester: the case and its terminals, the clamp on the
    post, and the charge stepping up the readout."""
    bars = "".join('<rect class="hot pulse %s" x="%g" y="%g" width="52" height="14" rx="7"/>'
                   % ("d%d" % (i + 1), 452, 250 - i * 22) for i in range(4))
    return (ground(346) + blob(272, 214, 158)
            + '<path class="solid" d="M148,180 L392,180 L392,320 C392,332 148,332 148,320 Z"/>'
            + '<path class="deep" d="M148,180 L392,180 L392,206 L148,206 Z"/>'
            + '<rect class="accd" x="176" y="150" width="46" height="34" rx="6"/>'
            + '<rect class="acc" x="318" y="150" width="46" height="34" rx="6"/>'
            + '<path class="pline" d="M188,166 L210,166 M330,166 L352,166 M341,156 L341,176"/>'
            + '<rect class="pap" x="178" y="228" width="184" height="66" rx="6"/>'
            + '<path class="athin" d="M196,250 L344,250 M196,272 L308,272"/>'
            + '<path class="aline dash" d="M222,150 C222,104 442,104 442,152"/>'
            + '<path class="line" d="M364,152 C364,120 470,118 476,160"/>'
            + '<rect class="wash" x="430" y="160" width="96" height="132" rx="10"/>'
            + '<path class="line" d="M430,160 L526,160 L526,292 L430,292 Z"/>' + bars
            + '<path class="accd" d="M462,278 L494,278 L494,286 L462,286 Z"/>'
            + '<path class="thin" d="M168,332 L162,352 M372,332 L378,352"/>'
            + star4(120, 158, 14, "accd glint d2"))


def _na_counter():
    """The trade counter: the catalog open on it, the phone off the hook and a
    boxed part sliding across to the dealer."""
    pages = "".join('<path class="athin" d="M%g,%g L%g,%g"/>'
                    % (x, 236 + i * 14, x + 68, 236 + i * 14)
                    for x in (150, 246) for i in range(4))
    return ('<rect class="wash2" x="40" y="72" width="520" height="150" rx="8"/>'
            + "".join('<rect class="wash" x="%g" y="%g" width="96" height="52" rx="5"/>'
                      '<path class="athin" d="M%g,%g L%g,%g"/>'
                      % (66 + (i % 5) * 100, 86 + (i // 5) * 66,
                         78 + (i % 5) * 100, 138 + (i // 5) * 66,
                         150 + (i % 5) * 100, 138 + (i // 5) * 66) for i in range(10))
            + '<path class="line" d="M40,222 L560,222"/>'
            + '<path class="wash" d="M40,222 L560,222 L560,268 L40,268 Z"/>'
            + '<path class="pap" d="M138,220 L300,232 L300,296 L138,286 Z"/>'
            + '<path class="pap" d="M300,232 L462,220 L462,286 L300,296 Z"/>'
            + '<path class="line" d="M138,220 L300,232 L462,220 M300,232 L300,296 '
              'M138,220 L138,286 L300,296 L462,286 L462,220"/>' + pages
            + '<g class="slide"><rect class="accd" x="330" y="304" width="120" '
              'height="58" rx="6"/><path class="pline" d="M330,326 L450,326 '
              'M390,304 L390,362"/></g>'
            + '<path class="line" style="stroke-width:11" d="M104,300 C88,332 120,352 148,344"/>'
            + '<circle class="solid" cx="100" cy="296" r="14"/>'
            + '<circle class="solid" cx="152" cy="340" r="14"/>'
            + '<path class="aline" d="M76,270 C60,256 62,232 78,222" stroke-dasharray="9 9"/>')


def _na_map():
    """Nine stores across the county: the outline, the pins, and the one that is
    the store this page belongs to."""
    pins = "".join('<g class="bob %s"><path class="accd" d="M%g,%g '
                   'C%g,%g %g,%g %g,%g C%g,%g %g,%g %g,%g Z"/>'
                   '<circle class="pap" cx="%g" cy="%g" r="6"/></g>'
                   % ("d%d" % (i % 4 + 1), x, y,
                      x - 17, y - 12, x - 17, y - 40, x, y - 44,
                      x + 17, y - 40, x + 17, y - 12, x, y,
                      x, y - 26)
                   for i, (x, y) in enumerate(
                       ((150, 190), (214, 148), (268, 226), (330, 168),
                        (392, 240), (446, 176), (492, 252), (204, 288))))
    return ('<path class="wash2" d="M84,132 C140,88 236,74 316,92 C404,112 466,90 '
            '520,124 C548,142 540,214 516,262 C492,310 420,336 336,330 '
            'C252,324 168,340 118,300 C74,264 62,168 84,132 Z"/>'
            + '<path class="line" d="M84,132 C140,88 236,74 316,92 C404,112 466,90 '
              '520,124 C548,142 540,214 516,262 C492,310 420,336 336,330 '
              'C252,324 168,340 118,300 C74,264 62,168 84,132 Z"/>'
            + '<path class="athin" d="M120,214 C204,196 300,238 384,206 C438,186 484,200 '
              '520,190" stroke-dasharray="14 12"/>'
            + '<path class="athin" d="M282,96 C266,164 300,228 286,326" '
              'stroke-dasharray="14 12"/>' + pins
            + '<g class="pulse"><circle class="hot" cx="300" cy="272" r="34"/></g>'
            + '<path class="solid" d="M300,286 C280,262 280,232 300,222 '
              'C320,232 320,262 300,286 Z"/>'
            + '<circle class="pap" cx="300" cy="248" r="8"/>'
            + star4(496, 118, 15, "accd glint d3"))


# --------------------------------------------------------- SANGILLO TIRE CENTER
def _st_stack():
    """The stock: tyres stacked to the ceiling with the sidewall band showing,
    and one more rolling in to the top of the pile."""
    def tyre(cx, cy, rx, ry):
        return ('<ellipse class="solid" cx="%g" cy="%g" rx="%g" ry="%g"/>'
                '<ellipse class="deep" cx="%g" cy="%g" rx="%g" ry="%g"/>'
                '<path class="aline" d="M%g,%g C%g,%g %g,%g %g,%g"/>'
                % (cx, cy, rx, ry, cx, cy - ry * .16, rx * .62, ry * .58,
                   cx - rx, cy, cx - rx * .5, cy + ry * .8,
                   cx + rx * .5, cy + ry * .8, cx + rx, cy))
    stack = "".join(tyre(238, 320 - i * 44, 104, 30) for i in range(5))
    stack2 = "".join(tyre(438, 328 - i * 44, 86, 26) for i in range(3))
    return (ground(352) + blob(300, 210, 176) + stack + stack2
            + '<g class="lift"><g class="spin" %s>' % org(452, 128)
            + '<circle class="solid" cx="452" cy="128" r="62"/>'
            + '<circle class="pap" cx="452" cy="128" r="36"/>'
            + '<circle class="accd" cx="452" cy="128" r="14"/>'
            + "".join('<path class="athin" transform="rotate(%g 452 128)" '
                      'd="M452,72 L452,86"/>' % (i * 45) for i in range(8))
            + '</g></g>'
            + '<path class="aline" d="M136,110 C136,84 176,80 190,98" '
              'stroke-dasharray="12 10"/>'
            + star4(146, 168, 16, "accd glint d2")
            + '<ellipse class="wash" cx="300" cy="360" rx="212" ry="14"/>')


def _st_gun():
    """An impact wrench on the lug nuts: the socket over the stud, the trigger,
    and the burst rings coming off the head."""
    studs = "".join('<circle class="deep" cx="%g" cy="%g" r="11"/>'
                    % polar(196, 220, 62, i * 72 - 90) for i in range(5))
    burst = "".join('<circle class="athin nudge %s" cx="196" cy="220" r="%g" fill="none" '
                    'opacity=".5"/>' % ("d%d" % (i + 1), 96 + i * 24) for i in range(3))
    return (blob(240, 214, 168) + ground(350) + burst
            + '<circle class="solid" cx="196" cy="220" r="90"/>'
            + '<circle class="pap" cx="196" cy="220" r="70"/>' + studs
            + '<circle class="accd" cx="196" cy="220" r="24"/>'
            + '<g class="nudge">'
            + '<rect class="solid" x="262" y="192" width="146" height="58" rx="16"/>'
            + '<path class="solid" d="M330,250 L400,250 L418,340 C420,352 350,352 348,340 Z"/>'
            + '<rect class="accd" x="240" y="200" width="40" height="42" rx="8"/>'
            + '<rect class="acc" x="336" y="256" width="26" height="42" rx="8"/>'
            + '<path class="pline soft" d="M282,208 L392,208"/>'
            + '<rect class="deep" x="404" y="204" width="66" height="34" rx="10"/>'
            + '<path class="athin" d="M470,216 C512,208 520,236 508,254"/></g>'
            + '<path class="aline" d="M120,320 L288,320" stroke-dasharray="16 12"/>'
            + star4(468, 142, 16, "accd glint"))


def _st_bay():
    """The bay itself: the roll-up door part open, the car on stands over the
    pit, and the disposal bin by the wall."""
    return ('<rect class="wash2" x="52" y="60" width="496" height="292" rx="8"/>'
            + '<rect class="solid" x="92" y="60" width="416" height="96" rx="4"/>'
            + slats(92, 60, 416, 96, 4, "pline soft")
            + '<path class="line" d="M92,156 L508,156"/>'
            + '<path class="wash" d="M92,156 L508,156 L508,300 L92,300 Z"/>'
            # the car on stands
            + '<path class="solid" d="M162,254 C176,206 206,192 254,190 C304,188 334,204 '
              '356,232 L420,244 C438,248 442,256 440,266 L166,266 C158,264 158,258 162,254 Z"/>'
            + '<path class="glass" d="M196,236 C206,212 226,204 252,204 C282,204 300,216 '
              '314,236 Z"/>'
            + '<path class="athin" d="M254,204 L254,236"/>'
            + '<path class="line" d="M204,266 L204,318 M186,318 L222,318 '
              'M392,266 L392,318 M374,318 L410,318"/>'
            + '<path class="accd" d="M188,300 L220,300 L212,320 L196,320 Z"/>'
            + '<path class="accd" d="M376,300 L408,300 L400,320 L384,320 Z"/>'
            + '<path class="thin" d="M120,332 L480,332" stroke-dasharray="20 14"/>'
            + '<path class="acc" d="M462,238 L534,238 L526,318 L470,318 Z"/>'
            + '<path class="line" d="M462,238 L534,238 L526,318 L470,318 Z"/>'
            + '<path class="athin" d="M472,262 L524,262"/>'
            + '<g class="lift"><ellipse class="solid" cx="498" cy="212" rx="34" ry="12"/>'
            + '<ellipse class="deep" cx="498" cy="208" rx="20" ry="7"/></g>'
            + '<rect class="hot pulse" x="118" y="88" width="44" height="40" rx="6"/>')


# ----------------------------------------------------------- SMILE CULTURE DENTAL
def _sc_xray():
    """The panoramic film up on the viewer: the arch of teeth on the light box,
    with the box glowing evenly behind it."""
    def teeth(y, flip):
        out = ""
        for i in range(11):
            x = 168 + i * 27
            d = 22 + (6 if 3 <= i <= 7 else 0)
            out += ('<path class="pap" d="M%g,%g C%g,%g %g,%g %g,%g L%g,%g Z"/>'
                    '<path class="athin" d="M%g,%g C%g,%g %g,%g %g,%g"/>'
                    % (x, y, x, y + flip * d, x + 20, y + flip * d, x + 20, y,
                       x + 20, y, x,
                       y, x, y + flip * d, x + 20, y + flip * d, x + 20, y))
        return out
    return ('<rect class="wash2" x="76" y="70" width="448" height="266" rx="12"/>'
            + '<rect class="pap" x="104" y="94" width="392" height="218" rx="8"/>'
            + '<g class="pulse"><rect class="hot" x="104" y="94" width="392" '
              'height="218" rx="8" opacity=".35"/></g>'
            + '<path class="line" d="M104,94 L496,94 L496,312 L104,312 Z"/>'
            + '<path class="aline" d="M150,196 C170,120 430,120 450,196"/>'
            + '<path class="aline" d="M150,224 C170,300 430,300 450,224"/>'
            + teeth(198, -1) + teeth(222, 1)
            + '<path class="athin" d="M300,120 L300,296" stroke-dasharray="10 10"/>'
            + '<rect class="accd" x="104" y="70" width="392" height="14" rx="7"/>'
            + '<path class="line" d="M140,336 L140,356 M460,336 L460,356"/>'
            + star4(520, 130, 16, "accd glint d2")
            + star4(80, 274, 13, "accd glint d4"))


def _sc_tray():
    """The instrument tray laid out before the appointment: mirror, explorer,
    scaler and the gauze roll, on the cloth."""
    def handle(x, tip):
        return ('<path class="line" style="stroke-width:9" d="M%g,268 L%g,168"/>'
                '<path class="accd" d="M%g,268 L%g,318 L%g,318 L%g,268 Z"/>%s'
                % (x, x, x - 7, x - 7, x + 7, x + 7, tip))
    return (blob(300, 212, 178)
            + '<path class="wash" d="M120,300 L480,300 C500,300 500,344 480,344 '
              'L120,344 C100,344 100,300 120,300 Z"/>'
            + '<path class="line" d="M120,300 L480,300 C500,300 500,344 480,344 '
              'L120,344 C100,344 100,300 120,300 Z"/>'
            + handle(196, '<g class="sway" %s><circle class="pap" cx="196" cy="150" r="26"/>'
                          '<circle class="line" cx="196" cy="150" r="26" fill="none"/>'
                          '<path class="athin" d="M182,142 C190,132 204,134 208,144"/></g>'
                     % org(196, 168))
            + handle(266, '<path class="thin" d="M266,168 C266,140 250,132 244,116"/>')
            + handle(336, '<path class="thin" d="M336,168 C336,142 352,138 358,120 '
                          'C362,110 356,102 348,104"/>')
            + '<g class="bob d2"><rect class="pap" x="398" y="236" width="86" '
              'height="52" rx="26"/><path class="line" d="M398,262 C398,236 484,236 '
              '484,262 C484,288 398,288 398,262 Z"/>'
            + '<path class="athin" d="M420,244 L420,280 M442,240 L442,284 '
              'M464,244 L464,280"/></g>'
            + star4(452, 152, 17, "accd glint")
            + star4(140, 196, 13, "accd glint d3")
            + '<path class="athin" d="M120,320 L480,320" stroke-dasharray="12 10"/>')


def _sc_implant():
    """The implant going in: the threaded post seating into the ridge, the
    abutment on it, and the crown coming down onto the abutment."""
    threads = "".join('<path class="pline" d="M%g,%g L%g,%g"/>'
                      % (284, 258 + i * 14, 316, 252 + i * 14) for i in range(5))
    return (blob(300, 208, 172)
            + '<path class="wash" d="M104,272 C180,244 420,244 496,272 L496,352 '
              'L104,352 Z"/>'
            + '<path class="line" d="M104,272 C180,244 420,244 496,272"/>'
            + '<path class="accd" d="M104,272 C180,244 420,244 496,272 '
              'C420,262 180,262 104,272 Z"/>'
            + '<path class="solid" d="M280,244 L320,244 L312,340 C310,350 290,350 288,340 Z"/>'
            + threads
            + '<path class="deep" d="M286,206 L314,206 L318,246 L282,246 Z"/>'
            + '<g class="press"><path class="pap" d="M252,120 C252,88 348,88 348,120 '
              'C348,166 336,196 318,202 L282,202 C264,196 252,166 252,120 Z"/>'
            + '<path class="line" d="M252,120 C252,88 348,88 348,120 '
              'C348,166 336,196 318,202 L282,202 C264,196 252,166 252,120 Z"/>'
            + '<path class="athin" d="M276,118 C286,104 314,104 324,118"/></g>'
            + '<path class="aline" d="M400,132 L400,196 M384,178 L400,198 L416,178"/>'
            + '<path class="athin" d="M180,150 C160,178 160,214 180,240" '
              'stroke-dasharray="10 10"/>'
            + star4(438, 232, 15, "accd glint d2"))


# ------------------------------------------------------ SPECK'S BROASTED CHICKEN
def _sp_slaw():
    """The secret-recipe coleslaw: the tub, the scoop coming out of it, and the
    shredded curls falling back."""
    curls = "".join('<path class="athin" d="M%g,%g C%g,%g %g,%g %g,%g"/>'
                    % (x, 200, x + 12, 186, x + 26, 214, x + 38, 198)
                    for x in range(196, 372, 44))
    fall = "".join('<path class="accd drop %s" d="M%g,150 C%g,158 %g,166 %g,172 '
                   'L%g,166 C%g,160 %g,154 %g,150 Z"/>'
                   % ("d%d" % (i + 1), 404 + i * 18, 396 + i * 18, 412 + i * 18,
                      404 + i * 18, 398 + i * 18, 390 + i * 18, 406 + i * 18, 398 + i * 18)
                   for i in range(4))
    return (ground(348) + blob(292, 214, 166)
            + '<path class="pap" d="M156,198 L444,198 L418,326 C416,338 184,338 182,326 Z"/>'
            + '<path class="line" d="M156,198 L444,198 L418,326 C416,338 184,338 182,326 Z"/>'
            + '<ellipse class="acc" cx="300" cy="198" rx="144" ry="30"/>'
            + '<ellipse class="pap soft" cx="300" cy="196" rx="120" ry="21"/>' + curls
            + '<path class="accd" d="M212,224 C226,212 250,214 258,228 '
              'C240,232 224,230 212,224 Z"/>'
            + '<circle class="hot" cx="352" cy="216" r="9"/>'
            + '<g class="lift"><path class="line" style="stroke-width:11" '
              'd="M444,178 L520,110"/>'
            + '<path class="pap" d="M400,182 C400,154 464,154 464,182 '
              'C464,208 400,208 400,182 Z"/>'
            + '<path class="line" d="M400,182 C400,154 464,154 464,182 '
              'C464,208 400,208 400,182 Z"/></g>' + fall
            + '<path class="athin" d="M180,258 L420,258" stroke-dasharray="14 12"/>'
            + '<rect class="accd" x="240" y="272" width="120" height="34" rx="8"/>'
            + '<path class="pline" d="M258,289 L342,289"/>')


def _sp_counter():
    """The order counter: the pegboard menu on the wall, the bag waiting on the
    pass, and the bell that says it is up."""
    pegs = "".join('<rect class="pap" x="%g" y="%g" width="%g" height="12" rx="6"/>'
                   % (108 + (i % 2) * 156, 104 + (i // 2) * 30, 120 - (i % 3) * 18)
                   for i in range(8))
    return ('<rect class="solid" x="84" y="80" width="360" height="152" rx="8"/>'
            + pegs
            + '<rect class="accd" x="108" y="200" width="140" height="16" rx="8"/>'
            + '<path class="line" d="M40,246 L560,246"/>'
            + '<path class="wash" d="M40,246 L560,246 L560,296 L40,296 Z"/>'
            + '<path class="pap" d="M300,152 L392,152 L392,246 L300,246 Z"/>'
            + '<path class="line" d="M300,152 L392,152 L392,246 L300,246 Z"/>'
            + '<path class="athin" d="M300,176 L392,176"/>'
            + '<path class="accd" d="M314,192 L378,192 L378,206 L314,206 Z"/>'
            + '<g class="bob"><path class="line" style="stroke-width:8" '
              'd="M320,152 C320,132 372,132 372,152"/></g>'
            + '<g class="nudge"><path class="pap" d="M456,168 C456,150 532,150 532,168 '
              'L532,246 L456,246 Z"/>'
            + '<path class="line" d="M456,168 C456,150 532,150 532,168 L532,246 L456,246 Z"/>'
            + '<circle class="accd" cx="494" cy="200" r="16"/></g>'
            + '<path class="thin" d="M84,296 L84,352 M444,296 L444,352"/>'
            + '<path class="athin" d="M120,320 L400,320" stroke-dasharray="16 12"/>'
            + wisp(348, 140, "rise d2", .5)
            + star4(524, 116, 15, "accd glint d3"))


def _sp_landmark():
    """The Collegeville landmark from the road: the low building, the sign on
    its pole, and a car turning into the lot."""
    return ('<path class="wash2" d="M0,214 C120,190 220,206 300,196 C400,184 480,204 '
            '600,190 L600,400 L0,400 Z"/>'
            + '<path class="solid" d="M132,206 L444,206 L444,308 L132,308 Z"/>'
            + '<path class="deep" d="M120,206 L456,206 L444,180 L132,180 Z"/>'
            + '<rect class="pap" x="164" y="234" width="72" height="58" rx="4"/>'
            + '<rect class="pap" x="264" y="234" width="72" height="58" rx="4"/>'
            + '<rect class="accd" x="366" y="228" width="52" height="80" rx="4"/>'
            + '<path class="athin" d="M200,234 L200,292 M300,234 L300,292"/>'
            + '<path class="line" style="stroke-width:10" d="M500,192 L500,320"/>'
            + '<g class="sway" %s>' % org(500, 192)
            + '<path class="acc" d="M446,84 L554,84 L554,178 L446,178 Z"/>'
            + '<path class="line" d="M446,84 L554,84 L554,178 L446,178 Z"/>'
            + '<path class="pline" d="M464,112 L536,112 M464,136 L516,136"/></g>'
            + '<path class="thin" d="M0,330 L600,330" stroke-dasharray="26 18"/>'
            + '<g class="slide"><path class="accd" d="M76,340 C88,314 108,304 142,304 '
              'C176,304 194,314 208,336 L226,342 C236,344 238,350 236,356 L78,356 '
              'C70,354 70,346 76,340 Z"/>'
            + '<path class="glass" d="M100,332 C108,316 122,310 142,310 '
              'C164,310 176,318 186,332 Z"/>'
            + '<circle class="deep" cx="110" cy="356" r="13"/>'
            + '<circle class="deep" cx="200" cy="356" r="13"/></g>'
            + '<circle class="hot pulse" cx="300" cy="120" r="30"/>'
            + wisp(232, 172, "rise d4", .5))


# ---------------------------------------------------------- THE JUICE MERCHANT
def _jm_crate():
    """What goes into the press: the crate on the bench with oranges, a kale
    bunch, ginger and lemons."""
    kale = "".join('<path class="acc" d="M%g,%g C%g,%g %g,%g %g,%g '
                   'C%g,%g %g,%g %g,%g Z"/>'
                   % (x, 214, x - 30, 194, x - 24, 148, x, 138,
                      x + 26, 150, x + 30, 196, x, 214)
                   for x in (388, 428))
    return (ground(346)
            + '<path class="wash" d="M112,200 L470,200 L452,332 C450,344 134,344 132,332 Z"/>'
            + '<path class="line" d="M112,200 L470,200 L452,332 C450,344 134,344 132,332 Z"/>'
            + slats(126, 216, 330, 104, 3)
            + '<path class="line" d="M112,200 L470,200"/>'
            + '<circle class="hot" cx="196" cy="180" r="38"/>'
            + '<circle class="hot" cx="272" cy="168" r="42"/>'
            + '<circle class="hot" cx="344" cy="182" r="34"/>'
            + '<path class="athin" d="M196,150 C192,140 200,132 208,134 '
              'M272,126 C266,116 276,108 284,112 M344,148 C340,138 348,132 356,134"/>'
            + '<path class="accd" d="M180,168 C192,158 210,164 212,178"/>'
            + '<path class="accd" d="M256,156 C268,146 288,152 290,168"/>' + kale
            + '<path class="thin" d="M388,214 L388,150 M428,214 L428,152"/>'
            + '<path class="accd" d="M470,244 C500,232 528,252 518,278 '
              'C506,304 470,296 464,272 C462,258 464,248 470,244 Z"/>'
            + '<path class="athin" d="M478,254 C492,258 504,270 508,282"/>'
            + '<ellipse class="wash" cx="300" cy="352" rx="190" ry="12"/>'
            + star4(140, 154, 16, "accd glint d2"))


def _jm_fridge():
    """The cleanse case: the glass door, three shelves of bottles ready to go,
    and the one that is lit."""
    rows = ""
    for r, y in enumerate((156, 232, 308)):
        for i in range(5):
            cls = "hot" if (r == 1 and i == 2) else ("acc" if r % 2 == 0 else "accd")
            rows += bottle(180 + i * 60, y - 44, 40, 56, cls)
    return ('<rect class="wash2" x="118" y="72" width="368" height="292" rx="12"/>'
            + '<path class="line" d="M118,72 L486,72 L486,364 L118,364 Z"/>' + rows
            + '<path class="athin" d="M136,168 L468,168 M136,244 L468,244 '
              'M136,320 L468,320"/>'
            + '<rect class="glass" x="128" y="82" width="348" height="272" rx="8"/>'
            + '<path class="pline soft" d="M180,96 L180,340 M204,96 L204,340"/>'
            + '<path class="line" style="stroke-width:9" d="M302,82 L302,354"/>'
            + '<rect class="solid" x="440" y="180" width="18" height="72" rx="9"/>'
            + '<g class="pulse"><rect class="hot" x="128" y="82" width="348" '
              'height="272" rx="8" opacity=".22"/></g>'
            + '<rect class="accd" x="188" y="42" width="224" height="24" rx="12"/>'
            + star4(516, 118, 16, "accd glint")
            + star4(88, 296, 13, "accd glint d3"))


def _jm_awning():
    """The Narberth shopfront: the striped awning, the window, the board on the
    pavement and the bike at the rack."""
    stripes = "".join('<path class="%s" d="M%g,142 L%g,142 L%g,196 L%g,196 Z"/>'
                      % ("acc" if i % 2 else "pap",
                         116 + i * 46, 162 + i * 46, 150 + i * 46, 104 + i * 46)
                      for i in range(8))
    return ('<rect class="wash2" x="72" y="76" width="456" height="270" rx="8"/>'
            + '<path class="solid" d="M72,76 L528,76 L528,134 L72,134 Z"/>' + stripes
            + '<path class="line" d="M104,196 L482,196"/>'
            + '<rect class="pap" x="128" y="214" width="180" height="118" rx="5"/>'
            + '<path class="line" d="M128,214 L308,214 L308,332 L128,332 Z"/>'
            + '<path class="athin" d="M128,258 L308,258 M218,214 L218,332"/>'
            + bottle(172, 268, 34, 50, "hot") + bottle(264, 268, 34, 50, "acc")
            + '<rect class="wash" x="344" y="214" width="108" height="118" rx="5"/>'
            + '<path class="line" d="M344,214 L452,214 L452,332"/>'
            + '<circle class="accd" cx="434" cy="278" r="8"/>'
            + '<g class="sway" %s><path class="pap" d="M470,258 L534,258 L544,336 '
              'L460,336 Z"/><path class="line" d="M470,258 L534,258 L544,336 L460,336 Z"/>'
              '<path class="athin" d="M482,282 L524,282 M478,304 L516,304"/></g>'
            % org(502, 258)
            + '<path class="thin" d="M72,346 L528,346"/>'
            + '<g class="bob d2"><circle class="thin" cx="86" cy="316" r="26" fill="none"/>'
            + '<path class="thin" d="M86,316 L118,290 L146,316 M118,290 L118,268 '
              'L104,268"/></g>'
            + star4(504, 112, 15, "accd glint d4"))


# ------------------------------------------------------- UNION CHILL MAT COMPANY
def _uc_rocket():
    """The Red Rocket radiant heater: the tube burner on its stand, the reflector
    behind it, and the radiant heat coming off the face."""
    rays = "".join('<path class="athin pulse %s" d="M%g,%g L%g,%g"/>'
                   % ("d%d" % (i % 4 + 1), 400, 128 + i * 26, 470 + (i % 2) * 24,
                      128 + i * 26) for i in range(7))
    return (ground(348) + blob(268, 200, 162)
            + '<path class="solid" d="M132,110 C112,180 112,244 132,314 '
              'L188,300 C172,242 172,182 188,124 Z"/>'
            + '<rect class="deep" x="184" y="126" width="42" height="172" rx="10"/>'
            + '<g class="pulse"><rect class="hot" x="226" y="140" width="168" '
              'height="144" rx="14"/></g>'
            + '<rect class="accd" x="226" y="140" width="168" height="144" rx="14"/>'
            + "".join('<path class="pline soft" d="M%g,158 L%g,266"/>' % (x, x)
                      for x in range(248, 384, 26))
            + '<path class="line" d="M226,140 L394,140 L394,284 L226,284 Z"/>' + rays
            + '<path class="line" style="stroke-width:9" d="M180,300 L150,352 '
              'M330,290 L360,352 M150,352 L360,352"/>'
            + '<path class="aline" d="M160,326 L342,326"/>'
            + flame(300, 300, 44, "hot flick d2")
            + '<circle class="accd" cx="426" cy="200" r="18"/>'
            + '<path class="thin" d="M426,182 C430,166 448,164 456,174"/>'
            + star4(468, 296, 15, "accd glint d3"))


def _uc_genset():
    """A generator set on its road trailer: the enclosure, the control panel with
    the needle live, and the exhaust stack."""
    return (ground(348)
            + '<path class="line" style="stroke-width:9" d="M96,306 L520,306"/>'
            + '<path class="solid" d="M140,168 L468,168 L468,300 L140,300 Z"/>'
            + '<path class="deep" d="M140,168 L468,168 L468,196 L140,196 Z"/>'
            + "".join('<path class="pline soft" d="M%g,212 L%g,286"/>' % (x, x)
                      for x in range(164, 300, 22))
            + '<rect class="pap" x="320" y="212" width="126" height="76" rx="6"/>'
            + '<path class="line" d="M320,212 L446,212 L446,288 L320,288 Z"/>'
            + dial(360, 244, 24, 6) + dial(414, 244, 24, 6, "sweep d3")
            + '<rect class="accd" x="336" y="270" width="94" height="12" rx="6"/>'
            + '<path class="line" style="stroke-width:11" d="M440,168 L440,104"/>'
            + '<rect class="accd" x="424" y="88" width="34" height="20" rx="6"/>'
            + wisp(441, 84, "rise", .8) + wisp(452, 92, "rise d2", .5)
            + '<path class="line" style="stroke-width:9" d="M140,306 L96,306 '
              'C82,306 82,330 96,330"/>'
            + '<circle class="thin" cx="88" cy="330" r="12" fill="none"/>'
            + roadwheel(210, 330, 32, 6, "spin")
            + roadwheel(300, 330, 32, 6, "spin d2")
            + roadwheel(414, 330, 32, 6, "spin d3")
            + '<rect class="acc" x="152" y="286" width="52" height="14" rx="7"/>'
            + star4(516, 158, 15, "accd glint d2"))


def _uc_plant():
    """Where the equipment goes: the mill sheds, the stack, and the hangar arch
    at the end of the line."""
    saw = "".join('<path class="solid" d="M%g,246 L%g,206 L%g,206 L%g,246 Z"/>'
                  '<path class="glass" d="M%g,208 L%g,208 L%g,236 L%g,236 Z"/>'
                  % (96 + i * 62, 96 + i * 62, 128 + i * 62, 158 + i * 62,
                     100 + i * 62, 126 + i * 62, 126 + i * 62, 100 + i * 62)
                  for i in range(4))
    return ('<path class="wash2" d="M0,250 C140,232 260,246 380,238 C470,232 530,244 '
            '600,236 L600,400 L0,400 Z"/>' + saw
            + '<path class="solid" d="M96,246 L344,246 L344,338 L96,338 Z"/>'
            + "".join('<rect class="accd" x="%g" y="272" width="34" height="40" rx="3"/>'
                      % x for x in range(120, 330, 56))
            + '<path class="line" style="stroke-width:12" d="M392,338 L392,118 '
              'C392,108 414,108 414,118 L414,338"/>'
            + '<path class="accd" d="M386,140 L420,140 L420,152 L386,152 Z"/>'
            + wisp(403, 112, "rise", 1.1) + wisp(418, 122, "rise d2", .8)
            + wisp(388, 124, "rise d3", .6)
            + '<path class="deep" d="M448,338 C448,244 560,244 560,338 Z"/>'
            + '<path class="line" d="M448,338 C448,244 560,244 560,338"/>'
            + '<path class="pap" d="M484,338 L484,290 C484,278 524,278 524,290 L524,338 Z"/>'
            + '<g class="drift"><path class="accd" d="M40,150 L102,150 L118,160 L40,164 Z"/>'
            + '<path class="accd" d="M62,150 L72,128 L82,128 L78,150 Z"/></g>'
            + '<path class="thin" d="M0,348 L600,348"/>'
            + '<g class="pulse"><circle class="hot" cx="220" cy="292" r="20"/></g>')


# --------------------------------------------------------------- WEATHERS MOTORS
def _wm_inspection():
    """The state inspection: the sticker going into the corner of the screen,
    with the checklist beside it ticking down."""
    ticks = "".join('<g class="pulse %s"><path class="athin" d="M%g,%g L%g,%g L%g,%g"/></g>'
                    '<path class="athin" d="M%g,%g L%g,%g"/>'
                    % ("d%d" % (i + 1), 388, 172 + i * 40, 400, 184 + i * 40,
                       424, 158 + i * 40, 442, 178 + i * 40, 524, 178 + i * 40)
                    for i in range(4))
    return (blob(240, 202, 170)
            + '<path class="solid" d="M96,290 C110,196 152,138 216,120 '
              'C272,104 316,132 336,196 L340,290 Z"/>'
            + '<path class="glass" d="M124,276 C136,204 168,158 218,144 '
              'C264,132 298,156 314,208 L318,276 Z"/>'
            + '<path class="pline soft" d="M218,144 L218,276"/>'
            + '<path class="line" d="M96,290 L340,290"/>'
            + '<g class="press"><path class="accd" d="M136,182 L192,168 L204,216 '
              'L148,230 Z"/><path class="pline" d="M150,192 L188,182 M154,206 L182,198"/></g>'
            + '<rect class="wash" x="364" y="132" width="180" height="212" rx="10"/>'
            + '<path class="line" d="M364,132 L544,132 L544,344 L364,344 Z"/>'
            + '<rect class="accd" x="392" y="106" width="124" height="24" rx="12"/>' + ticks
            + '<path class="aline" d="M388,318 L520,318"/>'
            + '<path class="thin" d="M96,318 L340,318" stroke-dasharray="14 12"/>'
            + star4(78, 156, 15, "accd glint d2"))


def _wm_paint():
    """The body shop: the gun laying colour across a masked panel, the mist
    arcing off it."""
    mist = "".join('<circle class="acc drift %s" cx="%g" cy="%g" r="%g" opacity=".45"/>'
                   % ("d%d" % (i % 4 + 1), 236 + (i % 4) * 20, 176 + (i * 29) % 90,
                      4 + (i % 3) * 2) for i in range(11))
    return (blob(300, 200, 176)
            + '<path class="wash" d="M96,120 L360,120 C376,120 376,326 360,326 '
              'L96,326 C82,326 82,120 96,120 Z"/>'
            + '<path class="line" d="M96,120 L360,120 C376,120 376,326 360,326 '
              'L96,326 C82,326 82,120 96,120 Z"/>'
            + '<path class="accd" d="M96,120 L360,120 L360,140 L96,140 Z"/>'
            + '<path class="accd" d="M96,306 L360,306 L360,326 L96,326 Z"/>'
            + '<g class="slide"><path class="acc" d="M110,168 L348,168 L348,246 '
              'L110,246 Z" opacity=".85"/></g>'
            + '<path class="pline soft" d="M120,196 L338,196"/>' + mist
            + '<g class="nudge">'
            + '<path class="solid" d="M410,164 L520,150 L524,206 L414,220 Z"/>'
            + '<path class="deep" d="M414,220 L470,214 L484,318 C486,330 442,334 '
              '438,322 Z"/>'
            + '<path class="line" style="stroke-width:12" d="M410,190 L362,196"/>'
            + '<circle class="accd" cx="470" cy="132" r="24"/>'
            + '<path class="thin" d="M470,108 C470,90 494,86 502,98"/>'
            + '<rect class="acc" x="440" y="240" width="42" height="18" rx="6"/></g>'
            + '<path class="athin" d="M540,236 C560,268 552,306 528,326" '
              'stroke-dasharray="10 10"/>'
            + star4(140, 348, 14, "accd glint d3"))


def _wm_street():
    """The Media block the dealership has stood on for a century: the storefront
    row, the lamp, and one car waiting at the kerb."""
    fronts = ""
    for i, (x, w, h) in enumerate(((62, 118, 150), (188, 96, 186), (292, 108, 162),
                                   (408, 126, 196))):
        fronts += ('<path class="%s" d="M%g,%g L%g,%g L%g,%g L%g,%g Z"/>'
                   '<path class="line" d="M%g,%g L%g,%g L%g,%g L%g,%g"/>'
                   % ("solid" if i % 2 else "deep", x, 288, x, 288 - h,
                      x + w, 288 - h, x + w, 288,
                      x, 288, x, 288 - h, x + w, 288 - h, x + w, 288))
        for r in range(2):
            fronts += ('<rect class="%s" x="%g" y="%g" width="%g" height="30" rx="3"/>'
                       % ("hot pulse d%d" % ((i + r) % 4 + 1) if (i + r) % 3 == 0 else "glass",
                          x + 18, 288 - h + 28 + r * 46, w - 36))
    return ('<path class="wash2" d="M0,288 L600,288 L600,400 L0,400 Z"/>' + fronts
            + '<path class="line" d="M0,288 L600,288"/>'
            + '<path class="accd" d="M188,120 L284,120 L284,140 L188,140 Z"/>'
            + '<path class="line" style="stroke-width:9" d="M540,288 L540,140"/>'
            + '<path class="line" d="M540,140 C540,124 566,124 566,140"/>'
            + '<g class="pulse"><circle class="hot" cx="566" cy="152" r="20"/></g>'
            + '<circle class="accd" cx="566" cy="150" r="10"/>'
            + '<path class="thin" d="M0,332 L600,332" stroke-dasharray="24 18"/>'
            + '<g class="bob"><path class="solid" d="M112,316 C126,284 150,272 '
              '190,272 C230,272 252,284 268,312 L292,318 C304,320 306,328 304,334 '
              'L114,334 C104,332 106,322 112,316 Z"/>'
            + '<path class="glass" d="M140,306 C150,288 166,282 190,282 '
              'C214,282 228,290 240,306 Z"/>'
            + '<path class="athin" d="M190,282 L190,306"/>'
            + '<circle class="deep" cx="150" cy="334" r="15"/>'
            + '<circle class="deep" cx="256" cy="334" r="15"/>'
            + '<circle class="accd" cx="150" cy="334" r="6"/>'
            + '<circle class="accd" cx="256" cy="334" r="6"/></g>'
            + star4(60, 122, 15, "accd glint d2"))


# --------------------------------------------------- ADVANCE EXTERIOR SOLUTIONS
def _ae_storm():
    """Storm damage, assessed: the wind across the roof plane, three tabs lifted
    off it, and the circle drawn round the failure."""
    tabs = "".join('<g class="sway %s" %s><path class="accd" d="M%g,%g L%g,%g '
                   'L%g,%g L%g,%g Z"/></g>'
                   % ("d%d" % (i + 1), org(238 + i * 66, 214),
                      238 + i * 66, 214, 296 + i * 66, 204,
                      302 + i * 66, 236, 244 + i * 66, 246)
                   for i in range(3))
    courses = "".join('<path class="athin" d="M%g,%g L%g,%g"/>'
                      % (120 + i * 14, 296 - i * 6, 470 + i * 14, 218 - i * 6)
                      for i in range(1))
    return ('<path class="wash2" d="M0,196 C120,178 200,206 300,190 C400,174 500,200 '
            '600,184 L600,400 L0,400 Z"/>'
            + '<path class="solid" d="M92,318 L300,140 L508,318 Z"/>'
            + "".join('<path class="pline soft" d="M%g,%g L%g,%g"/>'
                      % (92 + i * 30, 318 - i * 26, 508 - i * 30, 318 - i * 26)
                      for i in range(1, 6))
            + courses + tabs
            + '<circle class="aline" cx="330" cy="222" r="74" fill="none" '
              'stroke-dasharray="18 14"/>'
            + '<g class="drift"><path class="athin" d="M40,120 C120,104 180,132 260,112" '
              'stroke-dasharray="20 14"/></g>'
            + '<g class="drift d2"><path class="athin" d="M60,164 C140,148 210,176 '
              '290,156" stroke-dasharray="20 14"/></g>'
            + '<path class="line" d="M92,318 L508,318"/>'
            + '<path class="deep" d="M132,318 L468,318 L468,362 L132,362 Z"/>'
            + '<rect class="accd" x="272" y="330" width="56" height="32" rx="4"/>'
            + '<circle class="hot pulse" cx="330" cy="222" r="16"/>'
            + star4(534, 150, 16, "accd glint d3"))



def _ae_nailer():
    """The tools: the coil nailer nose-down on the deck, the chalk line snapped
    across it, and the bundle of shingles waiting to go on."""
    nailer = (
        # coil magazine
        '<circle class="solid" cx="212" cy="212" r="58"/>'
        '<circle class="deep" cx="212" cy="212" r="40"/>'
        '<circle class="accd" cx="212" cy="212" r="16"/>'
        + "".join('<path class="pline soft" transform="rotate(%g 212 212)" '
                  'd="M212,176 L212,190"/>' % (i * 45) for i in range(8)) +
        # body over the magazine, nose down at the front
        '<path class="solid" d="M240,132 C240,120 348,120 348,132 L348,186 '
        'C348,198 240,198 240,186 Z"/>'
        '<path class="pline soft" d="M256,144 L332,144"/>'
        '<path class="deep" d="M252,196 L292,196 L292,262 L252,262 Z"/>'
        '<path class="accd" d="M252,262 L292,262 L286,282 L258,282 Z"/>'
        # grip going back and up, with the trigger under it
        '<path class="solid" d="M340,124 L416,102 C428,98 436,124 424,128 '
        'L352,150 Z"/>'
        '<path class="acc" d="M348,152 L376,144 L382,168 L354,176 Z"/>')
    return (ground(352) + blob(300, 204, 172)
            + '<path class="wash" d="M92,282 L508,282 L508,312 L92,312 Z"/>'
            + '<path class="aline" d="M104,276 L496,268" stroke-dasharray="16 12"/>'
            + '<circle class="accd" cx="100" cy="276" r="10"/>'
            + '<circle class="accd" cx="500" cy="268" r="10"/>'
            + '<g class="press">%s</g>' % nailer
            + '<path class="athin" d="M436,116 C476,110 494,136 486,162" '
              'stroke-dasharray="10 10"/>'
            + '<path class="solid" d="M366,206 L520,206 L520,262 L366,262 Z"/>'
            + '<path class="deep" d="M366,192 L520,192 L520,208 L366,208 Z"/>'
            + slats(366, 208, 154, 52, 2, "pline soft")
            + '<path class="line" d="M366,192 L520,192 L520,262 L366,262 L366,192"/>'
            + '<path class="athin" d="M404,262 L404,282 M462,262 L462,282"/>'
            + star4(124, 148, 16, "accd glint d2"))

def _ae_house():
    """The finished job: the elevation with its new roof, siding and gutters,
    and the light on it."""
    boards = "".join('<path class="pline soft" d="M%g,%g L%g,%g"/>'
                     % (152, 244 + i * 22, 448, 244 + i * 22) for i in range(5))
    return ('<path class="wash2" d="M0,296 C140,280 240,300 340,290 C440,280 520,300 '
            '600,288 L600,400 L0,400 Z"/>'
            + '<g class="pulse"><circle class="hot" cx="504" cy="108" r="46"/></g>'
            + '<circle class="accd" cx="504" cy="108" r="26"/>'
            + '<path class="solid" d="M112,226 L300,104 L488,226 Z"/>'
            + "".join('<path class="pline soft" d="M%g,%g L%g,%g"/>'
                      % (112 + i * 32, 226 - i * 21, 488 - i * 32, 226 - i * 21)
                      for i in range(1, 5))
            + '<path class="deep" d="M152,226 L448,226 L448,346 L152,346 Z"/>' + boards
            + '<path class="accd" d="M104,222 L496,222 L496,240 L104,240 Z"/>'
            + '<path class="aline" style="stroke-width:9" d="M116,240 L116,340"/>'
            + '<path class="aline" style="stroke-width:9" d="M484,240 L484,340"/>'
            + '<path class="pap" d="M270,262 L330,262 L330,346 L270,346 Z"/>'
            + '<path class="line" d="M270,262 L330,262 L330,346 L270,346"/>'
            + '<circle class="accd" cx="318" cy="306" r="7"/>'
            + '<rect class="glass" x="184" y="264" width="60" height="54" rx="4"/>'
            + '<rect class="glass" x="356" y="264" width="60" height="54" rx="4"/>'
            + '<path class="athin" d="M214,264 L214,318 M184,291 L244,291 '
              'M386,264 L386,318 M356,291 L416,291"/>'
            + '<path class="line" style="stroke-width:12" d="M380,164 L380,110 '
              'L410,110 L410,186"/>'
            + wisp(395, 106, "rise d2", .6)
            + '<path class="thin" d="M0,352 L600,352"/>'
            + '<path class="acc" d="M96,318 C96,286 132,286 132,318 L132,346 L96,346 Z"/>')


# ------------------------------------------------------------------------- HUB
def _hub_chips():
    """The eleven palettes as chips fanned out on the table, each one breathing
    on its own delay."""
    chips = "".join('<g class="pulse d%d" transform="rotate(%g 300 300)">'
                    '<rect class="%s" x="272" y="96" width="56" height="150" rx="10"/>'
                    '<rect class="pap soft" x="282" y="112" width="36" height="34" rx="6"/>'
                    '</g>'
                    % (i % 4 + 1, (i - 5) * 9,
                       ("solid", "accd", "acc", "deep", "hot")[i % 5])
                    for i in range(11))
    return ('<circle class="wash2" cx="300" cy="300" r="188"/>' + chips
            + '<circle class="solid" cx="300" cy="300" r="26"/>'
            + '<circle class="pap" cx="300" cy="300" r="12"/>'
            + star4(112, 118, 18, "accd glint") + star4(492, 140, 15, "accd glint d2"))


def _hub_swap():
    """The header swap, drawn: the script line leaving on the left, the mark
    arriving in its place, and the scroll distance that triggers it."""
    return ('<rect class="wash2" x="56" y="98" width="488" height="124" rx="10"/>'
            + '<path class="solid" d="M56,98 L544,98 L544,158 L56,158 Z"/>'
            + '<g class="slide"><path class="aline" d="M92,132 C118,112 134,150 '
              '160,128 C186,108 202,146 228,126"/></g>'
            + '<g class="slide d3"><rect class="accd" x="92" y="118" width="88" '
              'height="24" rx="6"/><rect class="acc" x="188" y="118" width="42" '
              'height="24" rx="6"/></g>'
            + '<rect class="pap" x="452" y="116" width="70" height="28" rx="6"/>'
            + '<path class="pline soft" d="M470,110 L470,150 M494,110 L494,150"/>'
            + '<path class="line" d="M56,222 L544,222"/>'
            + '<path class="aline" style="stroke-width:9" d="M300,242 L300,326 '
              'M272,300 L300,330 L328,300"/>'
            + '<g class="pulse"><rect class="hot" x="140" y="252" width="120" '
              'height="18" rx="9"/></g>'
            + '<rect class="accd" x="140" y="288" width="180" height="18" rx="9"/>'
            + '<rect class="wash" x="140" y="324" width="96" height="18" rx="9"/>'
            + '<path class="athin" d="M370,250 L500,250 M370,290 L470,290 '
              'M370,330 L520,330" stroke-dasharray="14 12"/>'
            + star4(80, 300, 16, "accd glint d2"))


def _hub_pen():
    """How every drawing here was made: a nib on a curve, with the control
    handles that shape it still showing."""
    return (blob(300, 208, 178)
            + '<path class="aline" d="M92,304 C168,140 292,376 384,196" '
              'stroke-dasharray="300 90" style="stroke-width:9"/>'
            + '<path class="athin" d="M92,304 L168,140 M384,196 L292,376" '
              'stroke-dasharray="8 8"/>'
            + '<circle class="accd" cx="168" cy="140" r="11"/>'
            + '<circle class="accd" cx="292" cy="376" r="11"/>'
            + '<circle class="pap" cx="92" cy="304" r="13"/>'
            + '<circle class="line" cx="92" cy="304" r="13" fill="none"/>'
            + '<g class="bob"><path class="solid" d="M406,180 L500,88 '
              'C512,76 536,100 524,112 L430,204 L396,216 Z"/>'
            + '<path class="accd" d="M406,180 L430,204 L396,216 Z"/>'
            + '<path class="pline soft" d="M440,150 L482,108"/></g>'
            + '<circle class="hot pulse" cx="384" cy="196" r="16"/>'
            + star4(140, 128, 16, "accd glint d3")
            + star4(516, 300, 13, "accd glint d2"))


ART = {
    "f-m-berkheimer-inc": [
        ("furnace", "Cutaway of a gas furnace: lit burners, a serpentine heat exchanger, "
                    "the blower turning and warm air rising out of the supply plenum",
         _fm_furnace),
        ("van", "A service van with a roof ladder rack running its route, wheels turning "
                "over a moving centre line", _fm_van),
        ("thermostat", "A round wall thermostat, its needle sweeping the dial while comfort "
                       "waves pulse below", _fm_thermostat),
        ("bench", "The shop bench under a pegboard wall: the gauge manifold set with both dials sweeping, its hoses run down to the bench and hand tools swinging above",
         _fm_bench, "Diagnosed on the bench"),
        ("filter", "A pleated air filter drawn out of the return slot, dust carried off it and away on the airstream",
         _fm_filter, "Indoor air quality"),
        ("tank", "A water heater: welded cylinder, the two pipes off its crown, the gauge needle live and the burner alight at the skirt",
         _fm_tank, "Water heaters"),
    ],
    "golden-sea": [
        ("wok", "A wok over an open flame with the contents tossing through the air",
         _gs_wok),
        ("basket", "A stack of bamboo steamer baskets with the lid on and steam curling off",
         _gs_basket),
        ("noodles", "A noodle bowl with chopsticks lifting a strand clear of the broth",
         _gs_noodles),
        ("board", "The prep board: the cleaver coming down, spring onion cut into rounds, ginger and garlic waiting at the top of the board",
         _gs_board, "Cooked fresh to order"),
        ("carton", "The order leaving the counter: a folded takeout carton on its wire handle, chopsticks in the sleeve and the slip alongside",
         _gs_carton, "Now open for takeout"),
        ("lantern", "The Blue Bell storefront after dark: the awning, two lanterns swinging beneath it and the light in the window",
         _gs_lantern, "Blue Bell since 1992"),
    ],
    "nolts-auto-parts": [
        ("brake", "An exploded brake assembly: slotted rotor turning, caliper, and two pads "
                  "pulled out on their leader lines", _na_brake),
        ("wall", "The parts wall: pegboard, three shelves of bins, a rolling ladder, and one "
                 "bin sliding out to be picked", _na_wall),
        ("wrench", "A combination wrench working a hex bolt, turning back and forth under a "
                   "torque arrow", _na_wrench),
        ("battery", "A battery on the tester: the case and its terminals, the clamp on the post and the charge stepping up the readout",
         _na_battery, "Batteries in every size"),
        ("counter", "The trade counter: the catalog open on it, the phone off the hook and a boxed part sliding across to the dealer",
         _na_counter, "Parts catalog on request"),
        ("map", "Nine stores across the county: the outline, the pins, and the one that is this store pulsing on it",
         _na_map, "Nine locations, one trade"),
    ],
    "sangillo-tire-center": [
        ("tread", "A tyre rotating on its rim, tread blocks and sidewall grooves turning with it",
         _st_tread),
        ("balancer", "A computer wheel balancer with the wheel spinning on the spindle and the "
                     "readout stepping", _st_balancer),
        ("align", "An alignment rig seen from above: both wheels toeing against the centreline "
                  "with the target lines live", _st_align),
        ("stack", "Stock on the floor: tyres stacked with the sidewall band showing, and one more turning as it goes up on the pile",
         _st_stack, "Most major brands"),
        ("gun", "An impact wrench on the lug nuts: the socket over the studs, the trigger, and the burst rings coming off the head",
         _st_gun, "Rotation and balancing"),
        ("bay", "The bay: the roll-up door part open, a car up on stands over the floor and the disposal bin against the wall",
         _st_bay, "Free tire disposal"),
    ],
    "smile-culture-dental": [
        ("tooth", "A molar with its roots, a polished highlight and sparkles coming up off the "
                  "crown", _sc_tooth),
        ("aligner", "A clear aligner tray seating down over a full arch of teeth", _sc_aligner),
        ("lamp", "An operatory light on its jointed arm over the chair, the beam pulsing, "
                 "instruments laid out", _sc_lamp),
        ("xray", "A panoramic film up on the viewer, the full arch of teeth laid across the light box with the box glowing evenly behind it",
         _sc_xray, "Exam and plan"),
        ("tray", "The instrument tray laid out before the appointment: mirror, explorer, scaler and the gauze roll on the cloth",
         _sc_tray, "Preventative care"),
        ("implant", "An implant going in: the threaded post seating into the ridge, the abutment on it and the crown coming down onto it",
         _sc_implant, "Dental implants"),
    ],
    "specks-broasted-chicken": [
        ("bucket", "A bucket of broasted chicken with drumsticks standing out of the top and "
                   "steam coming off them", _sp_bucket),
        ("broaster", "The pressure fryer: clamped lid, gauge needle sweeping, burners lit "
                     "underneath", _sp_broaster),
        ("shake", "A milkshake with a swirled top, straw and cherry, next to a hoagie roll",
         _sp_shake),
        ("slaw", "The coleslaw: the tub, the scoop lifting out of it and the shredded curls dropping back in",
         _sp_slaw, "Secret recipe coleslaw"),
        ("counter", "The order counter: the pegboard menu on the wall, the bag waiting on the pass and the bell that says it is up",
         _sp_counter, "Order your way"),
        ("landmark", "The landmark from the road: the low building, the sign up on its pole and a car turning into the lot",
         _sp_landmark, "A Collegeville landmark"),
    ],
    "the-juice-merchant": [
        ("press", "A cold press: the plate coming down on the bag and juice dropping into the "
                  "bottle", _jm_press),
        ("blender", "A blender jar with the fruit turning inside it and the blades running",
         _jm_blender),
        ("bowl", "A smoothie bowl with a slowly turning ring of banana, berries, kiwi and "
                 "granola, mint on top", _jm_bowl),
        ("crate", "What goes into the press: the crate on the bench with oranges, a kale bunch, ginger and lemons",
         _jm_crate, "Made fresh to order"),
        ("fridge", "The cleanse case: the glass door, three shelves of bottles ready to go and the one that is lit",
         _jm_fridge, "Juice cleanses"),
        ("awning", "The Narberth shopfront: the striped awning, the window, the board on the pavement and a bike at the rack",
         _jm_awning, "Serving Narberth, PA"),
    ],
    "union-chill-mat-company": [
        ("heater", "A skid-mounted indirect-fired heater with its flue, burner glow and a "
                   "corrugated duct pushing hot air out", _uc_heater),
        ("fan", "An industrial fan: four blades turning inside the guard, air streaming off it",
         _uc_fan),
        ("chiller", "A portable air-conditioning cabinet on casters, louvres and coil, chilled "
                    "air off the front and a turning snowflake", _uc_chiller),
        ("rocket", "The radiant heater: the tube burner on its stand, the reflector behind it and the radiant heat coming off the face",
         _uc_rocket, "Red Rocket radiant heaters"),
        ("genset", "A generator set on its road trailer: the enclosure, the control panel with both needles live and the exhaust stack",
         _uc_genset, "Generators"),
        ("plant", "Where the equipment goes: the mill sheds, the stack running, and the hangar arch at the end of the line",
         _uc_plant, "Steel, aviation and power"),
    ],
    "weathers-motors-and-auto-sales": [
        ("lot", "A pre-owned car on the lot under a swinging pennant line and the lot light",
         _wm_lot),
        ("lift", "A car up on a two-post lift, the carriage rising and settling, tool chest "
                 "alongside", _wm_lift),
        ("key", "A key on its ring with the dealer tag swinging off it", _wm_key),
        ("inspection", "The state inspection: the sticker going into the corner of the screen with the checklist beside it ticking down",
         _wm_inspection, "PA state inspection"),
        ("paint", "The body shop: the gun laying colour across a masked panel with the mist arcing off it",
         _wm_paint, "Body shop"),
        ("street", "The block it has stood on for a century: the storefront row, the lamp and one car waiting at the kerb",
         _wm_street, "Media, PA since 1922"),
    ],
    "advance-exterior-solutions": [
        ("roof", "A gable roof being shingled course by course, ladder up, rain running off "
                 "the eave", _ae_roof),
        ("gutter", "A section of K-style gutter and downspout running water off a shingled "
                   "edge, leaves drifting past", _ae_gutter),
        ("siding", "A lap-siding wall going up board by board with a spirit level across it",
         _ae_siding),
        ("storm", "Storm damage assessed: wind moving across the roof plane, three tabs lifted off it and the circle drawn round the failure",
         _ae_storm, "Storm damage assessment"),
        ("nailer", "The tools: the coil nailer, the chalk line snapped across the deck and the bundle of shingles waiting to go on",
         _ae_nailer, "The work gets done and checked"),
        ("house", "The finished job: the elevation with its new roof, siding and gutters, with the light on it",
         _ae_house, "Roofing, siding and gutters"),
    ],
}


# The hub is not a prospect and has no business to draw from, so its three
# lower-half drawings are about the build itself and live here rather than
# among the ten, which are keyed by slug.
ART["hub"] = [
    ("chips", "Eleven palette chips fanned out on the table, each one breathing on its "
              "own delay", _hub_chips, "Eleven palettes"),
    ("swap", "The header swap drawn as a diagram: the script line leaving to the left, "
             "the mark arriving in its place, and the scroll distance that fires it",
     _hub_swap, "One structure"),
    ("pen", "A nib drawing a bezier, with the control handles that shape the curve still "
            "showing", _hub_pen, "Every drawing original"),
]


# The hero slot is 1440x800 and carries the mark on top, so the same drawing is
# emitted there through a padded viewBox: the whole scene stays visible at about
# 59% of the card scale instead of being slice-cropped to an enlarged fragment.
HERO_VIEWBOX = "-210 -140 1020 680"


def caption(slug, index):
    """The short label the lower-half row prints under a drawing. Only the
    three drawings below the green section carry one; the hero and the two
    grid cards are captioned by the service they illustrate."""
    e = ART[slug][index % len(ART[slug])]
    return e[3] if len(e) > 3 else ""


def svg(slug, index, hero=False):
    """One illustration, ready to drop straight into the page."""
    e = ART[slug][index % len(ART[slug])]
    key, title, fn = e[0], e[1], e[2]
    return ('<svg class="illo il-%s%s" viewBox="%s" preserveAspectRatio="xMidYMid slice" '
            'role="img" focusable="false"><title>%s</title>'
            '<rect class="field" x="-210" y="-140" width="1020" height="680"/>%s</svg>'
            % (key, " illo_hero" if hero else "", HERO_VIEWBOX if hero else VIEWBOX,
               title, fn()))


def count():
    """Drawings that belong to a prospect. The hub's three are counted
    apart: they are about the build, not about a business."""
    return sum(len(v) for k, v in ART.items() if k != "hub")


def hub_count():
    return len(ART["hub"])


def bridge_count():
    return len(MOTIF) + 1   # ten motifs plus the one shared seal


if __name__ == "__main__":
    import re
    print("%d prospect drawings + %d hub across %d pages"
          % (count(), hub_count(), len(ART)))
    for slug in sorted(ART):
        for i, ent in enumerate(ART[slug]):
            key, fn = ent[0], ent[2]
            title = ent[1]
            m = fn()
            shapes = len(re.findall(r"<(path|circle|rect|ellipse|g)\b", m))
            assert "#" not in m, "%s/%s hardcodes a colour" % (slug, key)
            print("  %-32s %-9s %3d shapes  %5d bytes  %s"
                  % (slug, key, shapes, len(m), title[:54]))
