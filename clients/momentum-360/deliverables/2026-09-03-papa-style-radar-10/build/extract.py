"""Pull the real copy out of _source/pages/<slug>.html into one normalised record
per prospect. The staged pages all share the same generator markup (hero /
services / stats / process / split / faq / marquee / cta), so one set of
patterns covers all ten. Nothing here invents content: every field is a verbatim
lift, and a missing field stays empty rather than being filled in.

Run:  python build/extract.py     ->  build/content.json
Check: python build/extract.py --check   (asserts the shape of all ten records)
"""
import html
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES = os.path.join(ROOT, "_source", "pages")
CONTENT = os.path.join(ROOT, "_source", "content")
LOGOS = os.path.join(ROOT, "_source", "logos")

SLUGS = [
    "advance-exterior-solutions", "f-m-berkheimer-inc", "golden-sea",
    "nolts-auto-parts", "sangillo-tire-center", "smile-culture-dental",
    "specks-broasted-chicken", "the-juice-merchant", "union-chill-mat-company",
    "weathers-motors-and-auto-sales",
]


def text(fragment):
    """Strip tags, unescape entities, collapse whitespace."""
    s = re.sub(r"<script.*?</script>", " ", fragment or "", flags=re.S | re.I)
    s = re.sub(r"<style.*?</style>", " ", s, flags=re.S | re.I)
    s = re.sub(r"<[^>]+>", " ", s)
    s = html.unescape(s)
    # the source pages use U+00B7 / mojibake separators inconsistently
    s = s.replace("�", "·")
    return re.sub(r"\s+", " ", s).strip()


def section(src, name):
    m = re.search(r'<section class="%s[^"]*"[^>]*>(.*?)</section>' % name, src, re.S)
    return m.group(1) if m else ""


def pairs(fragment, wrapper):
    """[(h3, p)] for <article class="card"> / <li class="step"> blocks."""
    out = []
    for block in re.findall(r"<%s[^>]*>(.*?)</%s>" % (wrapper, wrapper.split()[0]),
                            fragment, re.S):
        h = re.search(r"<h3[^>]*>(.*?)</h3>", block, re.S)
        p = re.search(r"<p[^>]*>(.*?)</p>", block, re.S)
        if h and p:
            out.append({"title": text(h.group(1)), "body": text(p.group(1))})
    return out


def extract(slug):
    src = open(os.path.join(PAGES, slug + ".html"), encoding="utf-8", errors="replace").read()
    meta = json.load(open(os.path.join(CONTENT, slug + ".json"), encoding="utf-8"))
    hero, split, cta = section(src, "hero"), section(src, "split"), section(src, "cta")

    def first(pattern, frag=src, group=1):
        m = re.search(pattern, frag, re.S)
        return text(m.group(group)) if m else ""

    services = pairs(section(src, "services"), 'article class="card"')
    steps = pairs(section(src, "process"), 'li class="step"')

    stats = []
    for block in re.findall(r'<div class="stat"[^>]*>(.*?)</div>\s*</div>', src, re.S):
        v = re.search(r'<(?:strong|span|div)[^>]*class="[^"]*(?:stat-value|value|num)[^"]*"[^>]*>(.*?)</', block, re.S)
        stats.append(text(block)) if not v else None

    faq = []
    for block in re.findall(r"<details[^>]*>(.*?)</details>", src, re.S):
        q = re.search(r"<summary[^>]*>(.*?)</summary>", block, re.S)
        a = re.search(r"<p[^>]*>(.*?)</p>", block, re.S)
        if q and a:
            faq.append({"q": text(q.group(1)), "a": text(a.group(1))})

    # marquee is one long ' <sep> ' delimited run, doubled for the CSS loop
    marquee_raw = text(section(src, "marquee"))
    seen, marquee = set(), []
    for part in re.split(r"\s*[·•–—|]\s*", marquee_raw):
        part = part.strip()
        if part and part.lower() not in seen:
            seen.add(part.lower())
            marquee.append(part)

    # the per-prospect illustration staged inside the hero
    art = ""
    m = re.search(r'(<svg[^>]*class="pa-hero pa-hero-[a-z0-9-]+"[^>]*>.*?</svg>)', src, re.S)
    if m:
        art = m.group(1)

    # buttons: label + href, hero first then cta
    actions = []
    for frag in (hero, cta):
        for a in re.findall(r'<a class="btn[^"]*"\s+href="([^"]+)"[^>]*>(.*?)</a>', frag, re.S):
            label, href = text(a[1]), html.unescape(a[0])
            if label and not any(x["label"] == label for x in actions):
                actions.append({"label": label, "href": href})

    return {
        "slug": slug,
        "name": meta.get("name", ""),
        "title": meta.get("title", ""),
        "description": meta.get("description", ""),
        "phone": meta.get("phone", ""),
        "address": meta.get("address", ""),
        "logo": meta.get("logo") or None,
        "locality": first(r'<p class="eyebrow"[^>]*>(.*?)</p>', hero),
        "script": first(r'<p class="script"[^>]*>(.*?)</p>', hero),
        "h1": first(r"<h1[^>]*>(.*?)</h1>", hero),
        "lede": first(r'<p class="lede"[^>]*>(.*?)</p>', hero),
        "services_eyebrow": first(r'<p class="eyebrow"[^>]*>(.*?)</p>', section(src, "services")),
        "services": services,
        "steps": steps,
        "about_eyebrow": first(r'<p class="eyebrow"[^>]*>(.*?)</p>', split),
        "about_h2": first(r"<h2[^>]*>(.*?)</h2>", split),
        "about_body": first(r'<div class="split-copy"[^>]*>.*?<h2[^>]*>.*?</h2>\s*<p[^>]*>(.*?)</p>', split),
        "faq": faq,
        "marquee": marquee,
        "cta_h2": first(r"<h2[^>]*>(.*?)</h2>", cta),
        "cta_p": first(r"<p[^>]*>(.*?)</p>", cta),
        "actions": actions,
        "art": art,
        "has_logo": os.path.exists(os.path.join(LOGOS, slug + ".png")),
    }


def main():
    records = {s: extract(s) for s in SLUGS}
    if "--check" in sys.argv:
        for s, r in records.items():
            assert r["h1"], s + ": no h1"
            assert r["lede"], s + ": no lede"
            assert len(r["services"]) >= 5, "%s: %d services" % (s, len(r["services"]))
            assert len(r["steps"]) >= 3, "%s: %d steps" % (s, len(r["steps"]))
            assert len(r["faq"]) == 4, "%s: %d faq" % (s, len(r["faq"]))
            assert len(r["marquee"]) >= 6, "%s: %d marquee" % (s, len(r["marquee"]))
            assert r["about_body"], s + ": no about body"
            assert r["cta_h2"] and r["cta_p"], s + ": no cta"
            assert r["art"].startswith("<svg"), s + ": no hero art"
            assert r["actions"], s + ": no actions"
        print("extract --check OK for %d prospects" % len(records))
        return
    out = os.path.join(ROOT, "build", "content.json")
    json.dump(records, open(out, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    print("wrote", out)
    for s, r in records.items():
        print("  %-32s services=%d steps=%d faq=%d marquee=%2d logo=%s art=%dB" % (
            s, len(r["services"]), len(r["steps"]), len(r["faq"]),
            len(r["marquee"]), r["has_logo"], len(r["art"])))


if __name__ == "__main__":
    main()
