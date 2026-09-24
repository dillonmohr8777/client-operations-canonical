"""Per-prospect brand palettes, plus the derived colours and the WCAG gate.

Every base colour below is either lifted from the prospect's own logo pixels
(see `source`) or, for the two prospects with no logo file, chosen for the
category and labelled as such.

Nothing in the layout assumes a foreground any more. For every surface this
module computes `on_<surface>` by measuring both candidates (paper white and
ink) and keeping whichever wins, and it derives darkened variants for the
colours that have to carry text regardless of how pale the brand is. The CSS
consumes `--on-<surface>`; no rule hardcodes #fff on a brand field.

`python build/palettes.py --all` prints the full pair table.
"""

import json
import os

ROLES = """
brand      display headings, statement copy            >= 4.5 on paper
brand_lt   footer gradient top  (lightest stop)        carries --on-footer
brand_dp   footer gradient bottom, deep art detail     carries --on-footer
hero       bright accent inside the illustrations      - no text
accent     buttons, menu panel, illustration fills     carries --on-accent
script     header tagline, footer link hover           >= 4.5 on header, >= 3 on gradient
header     fixed 100px band                            carries --on-header

derived    accent_ink  accent deepened until it reads on paper
           field/wash  light tints the illustrations are drawn on
           on_*        computed foreground for each surface above
"""

P = {
    "advance-exterior-solutions": dict(
        brand="#1d4e6d", brand_lt="#2a6a90", hero="#3a86b4", brand_dp="#12384f",
        accent="#b8551a", on_accent="#ffffff", script="#f0a05a", header="#172936",
        logo="wordmark",
        source="No logo file (flagged Logo placeholder upstream). Slate blue + rust "
               "chosen for the roofing/exteriors category; it also matches the "
               "--brand/--accent this prospect's current page already declares."),
    "f-m-berkheimer-inc": dict(
        brand="#6c243c", brand_lt="#8a3350", hero="#a03d5e", brand_dp="#4a1728",
        accent="#8a6420", on_accent="#ffffff", script="#e0b978", header="#33121e",
        logo="png",
        source="Maroon #6c243c is 67% of the logo's saturated pixels (the shield). "
               "Accent is the shield's cream/brass lettering, deepened to carry white text."),
    "golden-sea": dict(
        brand="#8a6512", brand_lt="#8f6a14", hero="#c9972f", brand_dp="#5e4409",
        accent="#2b2622", on_accent="#ffffff", script="#8a6512", header="#f4efe7",
        logo="png",
        source="Gold #e4a83c is 55% of the logo's saturated pixels (the border and the "
               "金海 characters); deepened for heading contrast. Accent is the ink of the "
               "'Golden Sea' wordmark."),
    "nolts-auto-parts": dict(
        brand="#a81c14", brand_lt="#b8231a", hero="#d43c2a", brand_dp="#761009",
        accent="#e2621f", on_accent="#1a1207", script="#a81c14", header="#f5eee8",
        logo="png",
        source="Deep red from the NOLTS wordmark (#9c0c0c/#b42418 cluster); accent is the "
               "orange-red of the Auto Plus tile (#cc3c24/#c04830). Orange button takes "
               "near-black text to clear AA."),
    "sangillo-tire-center": dict(
        brand="#036b96", brand_lt="#0a7099", hero="#12a4dc", brand_dp="#02506f",
        accent="#3d4a54", on_accent="#ffffff", script="#6fcdf2", header="#1f2a31",
        logo="png",
        source="Cyan #00a8e4 is 30% of the logo's saturated pixels (the wordmark); "
               "deepened for heading contrast, kept bright for the hero field and the "
               "header script. Accent is the graphite of the tire glyph."),
    "smile-culture-dental": dict(
        brand="#3f5b78", brand_lt="#4e7093", hero="#6d8fb0", brand_dp="#2b4159",
        accent="#0f7268", on_accent="#ffffff", script="#93b4d2", header="#22354a",
        logo="png",
        source="Slate blue #6c849c is 44% of the logo's saturated pixels, deepened for "
               "contrast. The mark is monochrome, so the teal accent is a chosen "
               "harmonising colour, not extracted."),
    "specks-broasted-chicken": dict(
        brand="#cc1417", brand_lt="#c81f1c", hero="#e03a2c", brand_dp="#8f0e10",
        accent="#f4e7a8", on_accent="#2a1608", script="#8f0e10", header="#f4efe7",
        logo="png",
        source="Red #fc0000 is 46% of the logo's saturated pixels (the Broasted Foods "
               "oval), deepened for AA. Accent is the logo's cream field #fcfccc, "
               "deepened off white; cream button takes dark text."),
    "the-juice-merchant": dict(
        brand="#2f7d4f", brand_lt="#2f7d4f", hero="#3fa268", brand_dp="#1f5636",
        accent="#c26a10", on_accent="#1a1005", script="#f0aa4e", header="#1b3a2a",
        logo="wordmark",
        source="No logo file (flagged Logo placeholder upstream). Green + citrus chosen "
               "for the cold-pressed juice category; no brand evidence exists to derive from."),
    "union-chill-mat-company": dict(
        brand="#c2201f", brand_lt="#bd1f1e", hero="#d42b2b", brand_dp="#7d1414",
        accent="#20456e", on_accent="#ffffff", script="#20456e", header="#eef3f6",
        logo="png",
        source="Red #cc2424 (20%) is the UCMC letterforms; navy #243048/#245484 (32% "
               "combined) is the wordmark and flame. Both lifted from the logo."),
    "weathers-motors-and-auto-sales": dict(
        brand="#0c3078", brand_lt="#224990", hero="#2f5fb8", brand_dp="#081f4e",
        accent="#b4181f", on_accent="#ffffff", script="#d9b93a", header="#0a1a3a",
        logo="png",
        source="Navy #0c3078 (9%) is the 'Weathers Motors' lettering, red #b42430/#b41818 "
               "(15% combined) is 'Sales & Service', gold #d8d878 is the oval border - "
               "used for the header script."),
}



# hub palette. Neutral slate + amber, owned by this deliverable - deliberately
# not borrowed from any agency's brand, because the hub is a generic index.
HUB = dict(
    brand="#233240", brand_lt="#33495c", hero="#4a6a86", brand_dp="#16222c",
    accent="#a8500f", script="#e6b06a", header="#141c24", logo="none",
    source="Chosen here. Slate carries the ten client palettes without competing "
           "with any of them; amber is the one warm note.")

# ---------------------------------------------------------------- bridge
# The green section's palette. These eleven values are measured off the
# client's own Bridge project and are used verbatim; nothing here is derived
# from a prospect's brand, which is the point - the section is deliberately
# the same on every page.
BRIDGE = dict(
    brand="#173c2c", brand_strong="#0d2d20", accent="#4f6f57", accent_soft="#e5eee4",
    canvas="#f6f5ef", surface="#fffefa", surface_alt="#ebece1",
    signal="#b45f2a", signal_soft="#f9e8da", text="#1d2c24", muted="#647067",
    border="#d4d9cd", radius="18px", shadow="0 18px 50px #173c2c1c",
)
# Two more, computed here rather than in the stylesheet, because the drawings
# inside the section need a line colour and an accent line colour that clear
# 3:1 on BOTH gradient stops and on the inner ground. Raw --signal is 2.68 on
# #173c2c, so it is a fill colour in there, never a stroke.
BRIDGE_LINE = BRIDGE["accent_soft"]      # 10.29 / 12.51 on the two stops
BRIDGE_ACCENT_LINE = "#dd9a63"           #  5.16 /  6.28 on the two stops
BRIDGE_WASH = "#1f4a37"                  # the soft shape inside a bridge drawing


def bridge_pairs():
    """Every text and line pair the green section can produce, against BOTH
    stops of its gradient. Same on all eleven pages, so it is appended to each
    palette's table and re-measured with it."""
    B, top, base = BRIDGE, BRIDGE["brand"], BRIDGE["brand_strong"]
    rows = []
    for stop, where in ((top, "green top"), (base, "green base")):
        rows += [
            ("bridge eyebrow on " + where,          B["signal_soft"],   stop, 4.5),
            ("bridge heading on " + where,          B["surface"],       stop, 3.0),
            ("bridge body on " + where,             B["accent_soft"],   stop, 4.5),
            ("bridge proof label on " + where,      B["accent_soft"],   stop, 4.5),
            ("bridge illo line on " + where,        BRIDGE_LINE,        stop, 3.0),
            ("bridge illo accent on " + where,      BRIDGE_ACCENT_LINE, stop, 3.0),
        ]
    rows += [
        ("bridge illo line on inner wash",   BRIDGE_LINE,        BRIDGE_WASH, 3.0),
        ("bridge illo accent on inner wash", BRIDGE_ACCENT_LINE, BRIDGE_WASH, 3.0),
    ]
    return rows


PAPER = "#ffffff"
INK = "#2c2927"          # the body ink the stylesheet already uses
WHITE = "#ffffff"
CHARCOAL = "#40494e"     # body copy, from the template
WORK_H5 = "#7b8388"      # work-card caption, from the template


def rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def hexs(t):
    return "#%02x%02x%02x" % tuple(max(0, min(255, int(round(v)))) for v in t)


def lum(h):
    def ch(v):
        v /= 255.0
        return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = rgb(h)
    return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)


def contrast(a, b):
    la, lb = lum(a), lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return round((hi + 0.05) / (lo + 0.05), 2)


def on(bg, *also):
    """The foreground for `bg`: whichever of paper/ink measures higher.

    `also` lets one foreground serve several surfaces (the footer gradient has
    two stops but one text colour); the winner is the candidate with the best
    worst case across all of them.
    """
    fields = (bg,) + also
    return max((PAPER, INK), key=lambda fg: min(contrast(fg, f) for f in fields))


def deepen(c, target=4.5, against=PAPER):
    """Darken `c` until it reads on paper - equivalently, until it can carry
    paper-white text. Hue is preserved; only the level moves."""
    r, g, b = rgb(c)
    k = 1.0
    while k > 0.02:
        cand = hexs((r * k, g * k, b * k))
        if contrast(cand, against) >= target:
            return cand
        k -= 0.01
    return "#000000"


def mix(c, other, pct):
    """`pct`% of `c` into `other` - the light tints the illustrations sit on."""
    a, b = rgb(c), rgb(other)
    return hexs(tuple(a[i] * pct / 100.0 + b[i] * (1 - pct / 100.0) for i in range(3)))


def derive(p):
    """Every custom property a page needs, base and computed, as literal hex.

    Literals rather than color-mix() is deliberate: the gate in check_static.py
    then measures exactly the numbers that ship.
    """
    d = dict(brand=p["brand"], brand_lt=p["brand_lt"], brand_dp=p["brand_dp"],
             hero=p["hero"], accent=p["accent"], script=p["script"],
             header=p["header"], paper=PAPER, ink=INK, stripe="#e8edf0")
    # A mid-tone accent can carry neither paper nor ink at 4.5. Where that is
    # true the *surface* is deepened until it can, and the raw accent stays
    # available for fills inside the artwork.
    a = p["accent"]
    d["accent_ui"] = a if max(contrast(PAPER, a), contrast(INK, a)) >= 4.6 else deepen(a,target=4.6)
    d["on_brand"] = on(p["brand"])
    d["on_accent"] = on(d["accent_ui"])
    d["on_header"] = on(p["header"])
    d["on_hero"] = on(p["hero"])
    d["on_footer"] = on(p["brand_lt"], p["brand_dp"])       # one gradient, two stops
    d["brand_ink"] = deepen(p["brand"])                     # heading colour on paper
    d["accent_ink"] = deepen(p["accent"])                   # accent that survives paper
    d["field"] = mix(p["hero"], PAPER, 9)                   # hero illustration ground
    d["wash"] = mix(p["brand"], PAPER, 13)                  # card illustration ground
    # Second card ground. Three of the ten have a near-neutral accent (the ink
    # of a wordmark, the graphite of a tyre glyph); tinted 16% into paper that
    # is a flat grey next to two warm cards, so those fall back to the bright
    # hero note instead.
    chroma = max(rgb(a)) - min(rgb(a))
    d["wash_2"] = mix(a if chroma > 40 else p["hero"], PAPER, 16)
    d["on_field"] = on(d["field"])
    return d


def text_pairs(p):
    """Every text/background pair the emitted CSS can produce, with the AA
    minimum for the size it is set at: 3.0 where the type is >= 24px or
    >= 18.66px bold, 4.5 otherwise. The footer gradient is measured against
    both stops so the lightest one has to pass too."""
    d = derive(p)
    P_, I_ = d["paper"], d["ink"]
    return [
        ("h2/h3 display on paper",             d["brand_ink"],  P_,            4.5),
        ("statement copy on paper",            d["brand_ink"],  P_,            4.5),
        ("work caption on paper",              WORK_H5,         P_,            3.0),
        ("body copy on paper",                 CHARCOAL,        P_,            4.5),
        ("accordion button on paper",          I_,              P_,            4.5),
        ("accordion hover + bullet on paper",  d["accent_ink"], P_,            4.5),
        ("headline on brand panel",            d["on_brand"],   d["brand"],    4.5),
        ("eyebrow on brand panel",             d["on_brand"],   d["brand"],    4.5),
        ("button label on accent",             d["on_accent"],  d["accent_ui"], 4.5),
        ("menu links on accent panel",         d["on_accent"],  d["accent_ui"], 3.0),
        ("menu tel on accent panel",           d["on_accent"],  d["accent_ui"], 4.5),
        ("header menu label on band",          d["on_header"],  d["header"],   4.5),
        ("header tagline on band",             d["script"],     d["header"],   3.0),
        ("footer copy on gradient top",        d["on_footer"],  d["brand_lt"], 4.5),
        ("footer copy on gradient base",       d["on_footer"],  d["brand_dp"], 4.5),
        ("marquee mark text on stripe",        CHARCOAL,        d["stripe"],   4.5),
        ("hero wordmark on hero field",        d["brand_ink"],  d["field"],    3.0),
        ("illustration line on hero field",    d["brand_ink"],  d["field"],    3.0),
        # the lower half: a third drawing ground, and the captions under them
        ("illustration accent on hero field",  d["accent_ink"], d["field"],    3.0),
        ("lower-half caption on paper",        d["brand_ink"],  P_,            3.0),
        ("lower-half rule on paper",           d["accent_ink"], P_,            3.0),
        ("illustration line on card wash",     d["brand_ink"],  d["wash"],     3.0),
        ("illustration accent on card wash",   d["accent_ink"], d["wash"],     3.0),
        ("illustration line on second wash",   d["brand_ink"],  d["wash_2"],   3.0),
        ("illustration accent on second wash", d["accent_ink"], d["wash_2"],   3.0),
    ] + bridge_pairs()


def _blocked_palette(record):
    """Return a neutral review palette when a prospect logo is not verified.

    These colours belong to the local review surface, not to the prospect.  The
    source manifest records that distinction so the generator can render all
    selected routes without manufacturing a brand mark or claiming a sampled
    colour is first-party identity.
    """
    seeds = {
        "legal": ("#214b63", "#356d88", "#4a90ae", "#163344", "#a04c1b", "#e5a46f", "#17272f"),
        "food": ("#6b3b24", "#8c5132", "#b9794f", "#452416", "#bb6b1d", "#f0b26a", "#2b1a14"),
        "home-services": ("#2f5d55", "#477b72", "#639e94", "#1b3833", "#bd681d", "#efb164", "#172825"),
        "industrial": ("#405466", "#5d7086", "#8497ad", "#293846", "#b05f24", "#e8ab73", "#1e2b35"),
        "medical": ("#2f5e76", "#467c97", "#639dbb", "#1a3747", "#b45b25", "#eeb07a", "#163044"),
        "spa-wellness": ("#6c4b62", "#8b6380", "#aa829b", "#3e2838", "#b45b2a", "#edb185", "#30202e"),
        "auto": ("#365b77", "#4d7c99", "#6d9fbe", "#1d3447", "#b44f2c", "#edaa80", "#182936"),
    }
    brand, brand_lt, hero, brand_dp, accent, script, header = seeds.get(
        record.get("vertical"), seeds["legal"])
    return dict(
        brand=brand, brand_lt=brand_lt, hero=hero, brand_dp=brand_dp,
        accent=accent, script=script, header=header, logo="none",
        source="Neutral review palette only; no verified first-party logo or colour sample was carried.")


def _load_blocked_manifest():
    path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                        "_source", "radar-2026-09-05-source-manifest.json")
    if not os.path.isfile(path):
        return
    with open(path, encoding="utf-8") as fh:
        payload = json.load(fh)
    incumbent = dict(P)
    selected = {}
    for record in payload.get("records", []):
        slug = record.get("slug")
        if slug:
            selected[slug] = incumbent.get(slug, _blocked_palette(record))
    # A dated manifest is a complete output set. Keeping old routes here would
    # make the CSS/checker emit palettes for prospects that are not in this run.
    if selected:
        P.clear()
        P.update(selected)


_load_blocked_manifest()
ALL = list(P.items()) + [("hub", HUB)]


def failures(p):
    return [(l, fg, bg, contrast(fg, bg), m)
            for l, fg, bg, m in text_pairs(p) if contrast(fg, bg) < m]


def main():
    import sys
    show_all = "--all" in sys.argv
    print(ROLES)
    bad = 0
    for slug, p in ALL:
        rows = [(l, fg, bg, contrast(fg, bg), m) for l, fg, bg, m in text_pairs(p)]
        worst = min(rows, key=lambda r: r[3] / r[4])
        bad += worst[3] < worst[4]
        print("%-4s %-32s worst %5.2f (min %.1f)  %s" % (
            "FAIL" if worst[3] < worst[4] else "OK", slug, worst[3], worst[4], worst[0]))
        for l, fg, bg, ratio, m in rows:
            if show_all or ratio < m:
                print("       %-38s %-18s %6.2f  min %.1f  %s" % (
                    l, "%s on %s" % (fg, bg), ratio, m, "ok" if ratio >= m else "**FAIL**"))
    print("\n%d/%d palettes pass every pair" % (len(ALL) - bad, len(ALL)))
    return bad


if __name__ == "__main__":
    raise SystemExit(1 if main() else 0)
