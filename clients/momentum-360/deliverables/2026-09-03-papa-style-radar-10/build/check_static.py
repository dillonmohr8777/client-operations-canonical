"""Static gate over every emitted page. The browser harnesses (/verify.html and
/audit.html) measure rendered geometry; this covers the selected twenty routes
can be checked without a renderer - dead local references, leaked third-party
asset hosts, malformed markup, duplicated ids, missing alt text, the contrast
table, and the artwork/plate rules the client asked for.

Run: python build/check_static.py     (exit 1 on any failure)
"""
import hashlib
import json
import os
import re
import sys
import html as htmlmod
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "build"))
import illustrations  # noqa: E402
from palettes import ALL, P, contrast, text_pairs  # noqa: E402

PAGES = [("hub", "index.html")] + [
    (s, os.path.join("sites", s, "index.html")) for s in sorted(P)]
EXTRA = ["all.html", "verify.html", "audit.html"]

BANNED = ["papaadvertising.com", "cdn-ilblndn", "use.typekit.net", "nitrocdn"]


def png_width(slug):
    """The mark's real pixel width, read off the file that ships."""
    f = open(os.path.join(ROOT, "assets", "logos", slug + ".png"), "rb").read()
    assert f[12:16] == b"IHDR", slug
    return int.from_bytes(f[16:20], "big")


# Nothing in the publish set may name the agency the structure was measured
# from - not in copy, alt text, filenames, class names or comments (comments
# included, which is why this list is checked against the raw source).
BANNED_ALL = ["papa", "PAPA", "Papa", "wpbdmv", "paypah", "lottie", "-man.svg"]
fails = []


class Scan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.imgs, self.h1, self.local, self.anchors = [], [], 0, [], []
        self.tags = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get("id"):
            self.ids.append(a["id"])
        if tag == "img":
            self.imgs.append(a)
        if tag == "h1":
            self.h1 += 1
        for key in ("src", "href"):
            v = a.get(key)
            if v and v.startswith("/") and not v.startswith("//"):
                self.local.append(v)
        if tag == "a" and a.get("href", "").startswith("#"):
            self.anchors.append(a["href"][1:])


def check(slug, rel):
    path = os.path.join(ROOT, rel)
    src = open(path, encoding="utf-8").read()

    for bad in BANNED + BANNED_ALL:
        if bad in src:
            fails.append("%s: leaks %r" % (slug, bad))

    p = Scan()
    p.feed(src)

    dupes = {i for i in p.ids if p.ids.count(i) > 1}
    if dupes:
        fails.append("%s: duplicate id(s) %s" % (slug, sorted(dupes)))
    if p.h1 != 1:
        fails.append("%s: %d <h1> (want 1)" % (slug, p.h1))

    for img in p.imgs:
        if not img.get("alt"):
            fails.append("%s: <img> without alt: %s" % (slug, img.get("src")))
        f = os.path.join(ROOT, img.get("src", "").lstrip("/").split("?")[0])
        if not os.path.exists(f):
            fails.append("%s: missing image file %s" % (slug, img.get("src")))

    for ref in set(p.local):
        f = os.path.join(ROOT, ref.lstrip("/").split("?")[0])
        if ref.endswith("/"):
            f = os.path.join(f, "index.html")
        if not os.path.exists(f):
            fails.append("%s: dead local reference %s" % (slug, ref))

    for frag in set(p.anchors):
        if frag and frag not in p.ids:
            fails.append("%s: anchor #%s has no target" % (slug, frag))

    # accordion wiring: every button target exists and is unique
    targets = re.findall(r'data-bs-target="#([^"]+)"', src)
    for tgt in targets:
        if targets.count(tgt) > 1:
            fails.append("%s: accordion target #%s reused" % (slug, tgt))
        if tgt not in p.ids:
            fails.append("%s: accordion target #%s missing" % (slug, tgt))

    # The stripe band is typographic and static now. Two things are checked:
    # it still carries content, and no line in it is used twice - the whole
    # point of dropping the carousel was that it padded a short list back up
    # to ten by repeating it.
    strip = re.findall(r"<li>([^<]+)</li>", src.split('class="client_carousel')[-1]
                       .split("</ul>")[0]) if 'class="client_carousel' in src else []
    band = len(strip)
    if band < 5:
        fails.append("%s: only %d band lines (want >= 5)" % (slug, band))
    if len(set(strip)) != band:
        fails.append("%s: the band repeats a line" % slug)
    for gone in ("owl-carousel", "owlCarousel", "jquery", "mark_text"):
        if gone in src:
            fails.append("%s: the carousel treatment survived (%r)" % (slug, gone))

    # No drawing may appear twice on one page. Every illustration carries its
    # own il-<key> class, so this is countable rather than a matter of taste.
    keys = re.findall(r'<svg class="illo il-([a-z0-9-]+)', src)
    if len(set(keys)) != len(keys):
        fails.append("%s: a drawing is used twice (%s)" % (slug, sorted(keys)))

    # The green section: present once, with both of its visuals.
    if src.count('<section class="bridge">') != 1:
        fails.append("%s: no green section" % slug)
    for want in ('class="illo bridge_seal"', 'class="illo bridge_motif"'):
        if want not in src:
            fails.append("%s: green section is missing %s" % (slug, want))

    # The upscale cap. Every <img> that is a mark carries --cap in px, and it
    # must equal round(1.4 * the PNG's own width) - measured from the file
    # here, not trusted from the generator.
    for m in re.finditer(r'src="/assets/logos/([a-z0-9-]+)\.png(?:\?v=[^"]+)?"[^>]*'
                         r'style="--cap:(\d+)px(?:;--markw:(\d+)px)?"', src):
        native = png_width(m.group(1))
        cap, shown = int(m.group(2)), int(m.group(3) or 0)
        if cap != round(native * 1.4):
            fails.append("%s: %s --cap is %d, file is %dpx wide (want %d)"
                         % (slug, m.group(1), cap, native, round(native * 1.4)))
        if shown > cap:
            fails.append("%s: %s is painted %dpx over a %dpx cap"
                         % (slug, m.group(1), shown, cap))
    for img in p.imgs:
        if "/assets/logos/" in (img.get("src") or "") and "--cap:" not in (img.get("style") or ""):
            fails.append("%s: %s is placed with no cap" % (slug, img.get("src")))

    # the per-site palette has to be wired up
    m = re.search(r'<html lang="en" data-site="([^"]+)"', src)
    if not m:
        fails.append("%s: no data-site on <html>" % slug)
    elif m.group(1) != slug:
        fails.append("%s: data-site is %s" % (slug, m.group(1)))
    else:
        css = open(os.path.join(ROOT, "css", "site.css"), encoding="utf-8").read()
        if '[data-site="%s"]' % slug not in css:
            fails.append("%s: no palette block in site.css" % slug)

    # the client's notes, as build failures rather than eyeballing.
    # "markground" is the white panel that used to sit behind the hero mark:
    # it produced a box around Golden Sea's mark, which carries a field of its
    # own, and the client has now twice said no boxes. Nothing may reintroduce
    # it - not a class, not a background, not a shadow behind a mark.
    for gone in ('class="markbox plated"', 'figure class="plate"', "markground"):
        if gone in src:
            fails.append("%s: a panel behind the mark survived (%r)" % (slug, gone))
    if 'background: #fff' in src or "background:#fff" in src:
        fails.append("%s: a white plate background survived" % slug)
    illos = len(re.findall(r'<svg class="illo', src))
    # hub: hero, three in the lower half, two green-section visuals.
    # prospect: two cards, four in the lower half, two green-section visuals.
    # The prospect hero is illustration-free and carries one generated photo.
    want = 6 if slug == "hub" else 8
    if illos != want:
        fails.append("%s: %d illustrations (want %d)" % (slug, illos, want))
    hero = src.split('<div class="home_logo">', 1)[0].split(
        '<div class="homeslider_wrapper">', 1)[-1]
    if slug != "hub" and 'class="illo' in hero:
        fails.append("%s: an illustration survived in the generated hero" % slug)
    if slug != "hub":
        hero_nodes = re.findall(r'class="industry_hero(?:\s+[^"]+)?"', hero)
        if len(hero_nodes) != 1:
            fails.append("%s: hero does not contain exactly one industry surface" % slug)
        expected = '/assets/industry/%s-align-hero.webp' % slug
        if 'industry_hero_pending' in hero:
            if expected in hero:
                fails.append("%s: pending hero unexpectedly references an image asset" % slug)
        elif expected not in hero:
            fails.append("%s: hero image is not the route-specific asset" % slug)
        home_logo = src.split('<div class="home_logo">', 1)[-1].split('</div>', 1)[0]
        if '/assets/logos/' in home_logo or 'class="wordmark"' in home_logo:
            fails.append("%s: a centered hero logo survived" % slug)

    # the lower half is present, once, with its drawings captioned
    if src.count('<section class="proof_wrapper"') != 1:
        fails.append("%s: no lower-half section" % slug)
    caps = re.findall(r'<span class="proof_cap">([^<]+)</span>', src)
    if len(caps) < 3:
        fails.append("%s: %d captioned drawings below the green section (want >= 3)"
                     % (slug, len(caps)))
    if len(set(caps)) != len(caps):
        fails.append("%s: the lower half repeats a caption" % slug)

    # the header contract: the caption's own character count has to travel with
    # it or the stylesheet cannot size it off the column it was given
    m = re.search(r'<div class="logo_caption" style="--cap-ch:(\d+)"><h4><a[^>]*>([^<]*)<',
                  src)
    if not m:
        fails.append("%s: header caption carries no --cap-ch" % slug)
    elif int(m.group(1)) < len(htmlmod.unescape(m.group(2))):
        # the count has to be of the RENDERED tagline: "Family Owned &amp; Operated"
        # is 27 characters of source and 23 of type, and the stylesheet sizes type
        fails.append("%s: --cap-ch is %s for a %d-character tagline"
                     % (slug, m.group(1), len(htmlmod.unescape(m.group(2)))))
    for svg in re.findall(r'<svg class="illo.*?</svg>', src, re.S):
        if not re.search(r"<title>[^<]{10,}</title>", svg):
            fails.append("%s: an illustration has no usable <title>" % slug)
        if 'role="img"' not in svg:
            fails.append("%s: an illustration is not role=img" % slug)
        if re.search(r'(fill|stroke)="#', svg):
            fails.append("%s: an illustration hardcodes a colour" % slug)

    return dict(imgs=len(p.imgs), band=band, illos=illos)


def contrast_gate():
    """Re-measure every text/background pair that the emitted CSS can produce.
    Fails the build; the table it prints is the report."""
    print("\n%-32s %-38s %-19s %6s %5s %s" % (
        "site", "pair", "fg on bg", "ratio", "min", ""))
    worst_overall = 99
    for slug, p in ALL:
        for label, fg, bg, minimum in text_pairs(p):
            r = contrast(fg, bg)
            worst_overall = min(worst_overall, r / minimum)
            if r < minimum:
                fails.append("%s: %s is %.2f, needs %.1f (%s on %s)"
                             % (slug, label, r, minimum, fg, bg))
        rows = [(l, contrast(f, b), m) for l, f, b, m in text_pairs(p)]
        w = min(rows, key=lambda x: x[1] / x[2])
        print("%-32s %-38s %-19s %6.2f %5.1f %s" % (
            slug, "worst of %d pairs: %s" % (len(rows), w[0]), "", w[1], w[2],
            "ok" if w[1] >= w[2] else "FAIL"))
    return worst_overall


def main():
    provenance_path = os.path.join(ROOT, "assets", "ALIGN-IMAGE-PROVENANCE.json")
    provenance = json.load(open(provenance_path, encoding="utf-8"))
    records = provenance.get("images", [])
    expected_images = [s for s in P if os.path.isfile(
        os.path.join(ROOT, "assets", "industry", s + "-align-hero.webp"))]
    if len(records) != len(expected_images):
        fails.append("image provenance: %d records, want %d" % (len(records), len(expected_images)))
    for rec in records:
        rel = rec.get("file", "")
        path = os.path.join(ROOT, "assets", rel)
        if not os.path.isfile(path):
            fails.append("image provenance: missing %s" % rel)
            continue
        digest = hashlib.sha256(open(path, "rb").read()).hexdigest()
        if digest != rec.get("sha256"):
            fails.append("image provenance: hash mismatch for %s" % rel)

    print("%-32s %5s %5s %6s" % ("page", "imgs", "band", "illos"))
    for slug, rel in PAGES:
        r = check(slug, rel)
        print("%-32s %5d %5d %6d" % (slug, r["imgs"], r["band"], r["illos"]))

    if illustrations.count() != 60:
        fails.append("illustrations: %d drawn, want 60" % illustrations.count())
    if illustrations.hub_count() != 3:
        fails.append("hub: %d drawn, want 3" % illustrations.hub_count())
    if illustrations.bridge_count() != 12:
        fails.append("green section: %d drawn, want 12" % illustrations.bridge_count())
    # every drawing distinct across the whole build, so "six per page" cannot be
    # met by drawing the same thing twice under two names
    bodies = {}
    for slug, ents in illustrations.ART.items():
        for ent in ents:
            bodies.setdefault(ent[2](), []).append("%s/%s" % (slug, ent[0]))
    for who in bodies.values():
        if len(who) > 1:
            fails.append("illustrations: %s are the same drawing" % who)
    for css_name in ("site.css", ):
        css = open(os.path.join(ROOT, "css", css_name), encoding="utf-8").read()
        for bad in BANNED + BANNED_ALL + ["markground", "ground_hop"]:
            if bad in css:
                fails.append("%s: leaks %r" % (css_name, bad))
        # the header contract, as three rules that have to be present together:
        # the menu reserves its column, the caption cannot widen its own box,
        # and the size is computed from the column rather than stepped.
        for want in ("container-type: inline-size", ".header .d-flex { gap:",
                     "100cqw / (var(--cap-ch"):
            if want not in css:
                fails.append("site.css: header layout contract is missing %r" % want)
    js = open(os.path.join(ROOT, "js", "site.js"), encoding="utf-8").read()
    for bad in BANNED + BANNED_ALL:
        if bad in js:
            fails.append("site.js: leaks %r" % bad)

    for rel in EXTRA:
        f = os.path.join(ROOT, rel)
        if not os.path.exists(f):
            fails.append("%s is not emitted" % rel)
            continue
        raw = open(f, encoding="utf-8").read()
        for bad in BANNED + BANNED_ALL:
            if bad in raw:
                fails.append("%s: leaks %r" % (rel, bad))

    margin = contrast_gate()
    print()
    if fails:
        for f in fails:
            print("FAIL " + f)
        print("\n%d static failures" % len(fails))
        return 1
    print("static check OK across %d pages, %d illustrations; "
          "worst contrast pair sits %.0f%% above its minimum"
          % (len(PAGES), illustrations.count(), (margin - 1) * 100))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
