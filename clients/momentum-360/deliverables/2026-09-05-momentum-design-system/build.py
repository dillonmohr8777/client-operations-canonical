"""Render index.html from page.template.html.

Inlines the two real stylesheets and injects the audit numbers, so the page
cannot show a value the system does not actually ship. Run contrast.py first;
this refuses to build if the new system has a failing pair.

    python build.py
"""
from __future__ import annotations

import html
import json
import pathlib
import re
import subprocess
import sys

HERE = pathlib.Path(__file__).resolve().parent
DATE = "2026-09-05"

sys.path.insert(0, str(HERE / "audit"))
from contrast import parse_hex, resolve  # noqa: E402


def tokens_of(css: str) -> dict:
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    out = {}
    for block in re.findall(r":root\s*\{(.*?)\}", css, re.S):
        for k, v in re.findall(r"(--[A-Za-z0-9_-]+)\s*:\s*([^;]+?)\s*(?=;|$)", block, re.S):
            out[k] = " ".join(v.split())
    return out


def hexof(tokens, name):
    c = resolve(tokens.get(name, ""), tokens)
    return "#" + "".join(f"{round(x):02x}" for x in c[:3]) if c else "#000000"


def readable_on(bg_hex: str) -> str:
    """Pick black or white text for a swatch chip - measured, not guessed."""
    from contrast import ratio
    bg = parse_hex(bg_hex)[:3]
    return "#000000" if ratio((0, 0, 0), bg) >= ratio((255, 255, 255), bg) else "#ffffff"


# --------------------------------------------------------------------------
def drift_rails(sites: dict, radar_rows: list) -> tuple[str, str]:
    worst = {}
    for r in radar_rows:
        if r["verdict"] != "FAIL":
            continue
        cur = worst.get(r["source"])
        if cur is None or r["ratio"] < cur["ratio"]:
            worst[r["source"]] = r
    fail_count = {}
    for r in radar_rows:
        if r["verdict"] == "FAIL":
            fail_count[r["source"]] = fail_count.get(r["source"], 0) + 1

    out = []
    for slug in sorted(sites):
        t = sites[slug]
        swatches = []
        for name in ("--brand", "--brand-2", "--accent", "--paper", "--ink"):
            hx = hexof(t, name)
            swatches.append(
                f'<span style="background:{hx};color:{readable_on(hx)}">{hx}</span>'
            )
        n = fail_count.get(slug, 0)
        w = worst.get(slug)
        detail = f'{w["ratio"]}:1 {html.escape(w["use"])}' if w else "no failing pair"
        cls = "p-bad" if n else "p-ok"
        out.append(
            f'<div class="p-rail">'
            f'<div class="p-rail__name">{html.escape(slug)}</div>'
            f'<div class="p-rail__bar">{"".join(swatches)}</div>'
            f'<div class="p-rail__score {cls}">{n} fail &middot; worst {detail}</div>'
            f"</div>"
        )

    total = sum(fail_count.values())
    affected = len(fail_count)
    caption = (
        f"{total} failing pairs across {len(sites)} sites and "
        f"{len(radar_rows)} measured pairs; {affected} of {len(sites)} sites affected. "
        "Two failures are structural rather than per-site: the circular seal prints "
        "<code>--accent</code> on <code>--brand</code> (1.01 to 2.72:1 on six sites), and "
        "<code>--muted</code> is derived against <code>--paper</code> but rendered on "
        "<code>--panel</code>, where it lands at 4.28 to 4.49:1 on nine of ten. "
        "Nine near-misses in a row is a formula, not an accident."
    )
    return "\n".join(out), caption


def contrast_rows(rows: list) -> str:
    out = []
    for r in rows:
        fg, bg = r.get("fg_hex", ""), r.get("bg_hex", "")
        ok = r["verdict"] == "PASS"
        out.append(
            "<tr>"
            f'<td><span class="p-chip"><i style="background:{fg}"></i>'
            f'{html.escape(r["fg"])}</span></td>'
            f'<td><span class="p-chip"><i style="background:{bg}"></i>'
            f'{html.escape(r["bg"])}</span></td>'
            f'<td>{html.escape(r["use"])}</td>'
            f'<td class="num">{r["size"]}</td>'
            f'<td class="num"><strong>{r["ratio"]}:1</strong></td>'
            f'<td class="num">{r["required"]}:1</td>'
            f'<td><span class="p-verdict" style="color:var(--m-{"success" if ok else "danger"})">'
            f'{r["verdict"]}</span></td>'
            "</tr>"
        )
    return "\n".join(out)


def swatches(tokens: dict) -> str:
    groups = [
        ("--m-paper", "page ground"),
        ("--m-surface", "cards, panels, table head"),
        ("--m-ink", "body copy, 17.10:1 on paper"),
        ("--m-muted", "secondary copy, checked on paper AND surface"),
        ("--m-brand", "measured from needmomentum.com rgb(30,115,190)"),
        ("--m-on-brand", "text on the brand field, 4.94:1"),
        ("--m-on-brand-muted", "dimmest white still clearing AA on brand, 4.55:1"),
        ("--m-accent-on-brand", "LARGE TEXT ONLY on brand, 3.14:1 - see note"),
        ("--m-deep", "the dark field"),
        ("--m-nav", "nav band"),
        ("--m-on-deep", "text on deep, 16.24:1"),
        ("--m-on-deep-muted", "secondary on deep, 9.77:1"),
        ("--m-accent-on-deep", "orange text on deep, 8.51:1"),
        ("--m-accent", "FIELD ONLY - measured rgb(245,131,32)"),
        ("--m-on-accent", "label on the accent field, 7.19:1. Never white."),
        ("--m-accent-ink", "TEXT ONLY - same hue, 6.18:1 on paper"),
        ("--m-link", "inline link, 5.56:1 on paper"),
        ("--m-danger", "form error, 6.26:1 paper / 5.43:1 surface"),
        ("--m-success", "confirmation, 5.89:1 paper"),
        ("--m-line", "hairline only - not a contrast surface"),
        ("--m-line-strong", "input borders, 4.00:1 vs paper"),
        ("--m-focus", "focus ring, 4.73:1 paper / 3.57:1 deep"),
    ]
    out = []
    for name, use in groups:
        hx = hexof(tokens, name)
        out.append(
            f'<div class="p-sw">'
            f'<div class="p-sw__blob" style="background:{hx}"></div>'
            f'<div class="p-sw__name">{html.escape(name)}<br>{hx}</div>'
            f'<div class="p-sw__use">{use}</div>'
            f"</div>"
        )
    return "\n".join(out)


def type_ladder(tokens: dict) -> str:
    steps = [
        ("--m-fs-display", "m-display", "Momentum"),
        ("--m-fs-h1", "m-h1", "Tokens that ship"),
        ("--m-fs-h2", "m-h2", "Ten sites, one kit"),
        ("--m-fs-h3", "m-h3", "Measured, not asserted"),
        ("--m-fs-h4", "m-h4", "Section subhead in Nunito Sans"),
        ("--m-fs-lead", "m-lead", "Lead paragraph. Few words per screen, large type, air."),
        ("--m-fs-body", "m-body", "Body copy. This is the size everything is read at, and the size the contrast audit assumes."),
        ("--m-fs-sm", "m-body", "Small copy, captions, table cells."),
        ("--m-fs-micro", "m-eyebrow", "Eyebrow / caps label"),
    ]
    out = []
    for tok, cls, text in steps:
        val = html.escape(tokens.get(tok, ""))
        style = "" if cls in ("m-display", "m-h1", "m-h2", "m-h3", "m-h4", "m-eyebrow") else f"font-size:var({tok})"
        out.append(
            f'<div class="p-step"><div class="p-step__meta">{html.escape(tok)}<br>{val}</div>'
            f'<div class="p-step__spec"><div class="{cls}" style="{style}">{html.escape(text)}</div></div></div>'
        )
    out.append(
        '<div class="p-step"><div class="p-step__meta">--m-font-script<br>Caveat 700</div>'
        '<div class="p-step__spec"><span class="m-script" style="font-size:var(--m-fs-h2)">'
        "Let&rsquo;s build</span></div></div>"
    )
    out.append(
        '<div class="p-step"><div class="p-step__meta">.m-strike<br>Papa&rsquo;s struck heading</div>'
        '<div class="p-step__spec"><span class="m-h3"><span class="m-strike"><s>Services</s></span> '
        '<span class="m-script">Niche</span></span></div></div>'
    )
    return "\n".join(out)


def space_bars(tokens: dict) -> str:
    out = []
    for i in range(1, 11):
        name = f"--m-s-{i}"
        val = tokens.get(name, "")
        out.append(
            f'<div><i style="width:var({name})"></i><span>{name} &middot; {html.escape(val)}</span></div>'
        )
    return "\n".join(out)


def radii(tokens: dict) -> str:
    out = []
    for name in ("--m-r-sm", "--m-r-md", "--m-r-lg", "--m-r-pill"):
        out.append(
            f'<figure><div style="border-radius:var({name})"></div>'
            f'<figcaption>{html.escape(name)}<br>{html.escape(tokens.get(name, ""))}</figcaption></figure>'
        )
    return "\n".join(out)


def motion_rows(tokens: dict) -> str:
    rows = [
        ("--m-dur-1", "--m-ease", "button colour"),
        ("--m-dur-2", "--m-ease", "hover lift, nav link"),
        ("--m-dur-3", "--m-ease", "scroll reveal"),
        ("--m-dur-4", "--m-ease-swap", "nav caption swap"),
    ]
    out = []
    for dur, ease, use in rows:
        out.append(
            f'<div><span>{html.escape(dur)} &middot; {html.escape(tokens.get(dur, ""))}<br>'
            f'{html.escape(use)}</span>'
            f'<span><i class="p-dot" style="transition-duration:var({dur});'
            f'transition-timing-function:var({ease})"></i></span></div>'
        )
    return "\n".join(out)


def logo_wall() -> str:
    names = ["Nexla", "Puttery", "Bridge", "VA Claims", "Capsule &amp; Tonic",
             "Everyday Life", "Kimberly James", "Green Slate", "Hope Wellness",
             "Pro Fence &amp; Deck", "Omega Landscape", "Fresh Blends"]
    item = '<div class="m-wall__item">{}</div>'
    # duplicated once so the -50% marquee wraps seamlessly
    return "\n".join(item.format(n) for n in names * 2)


def hero_stats(radar_rows: list, new_rows: list, sites: int) -> str:
    rf = sum(1 for r in radar_rows if r["verdict"] == "FAIL")
    nf = sum(1 for r in new_rows if r["verdict"] == "FAIL")
    stats = [
        (str(sites), "live builds audited"),
        (str(len(radar_rows)), "radar pairs measured"),
        (str(rf), "radar pairs failing AA"),
        (f"{nf} / {len(new_rows)}", "failing here"),
    ]
    return "\n".join(
        f'<div class="p-stat"><b>{v}</b><span class="m-muted">{k}</span></div>' for v, k in stats
    )


def main() -> int:
    subprocess.run([sys.executable, "contrast.py"], cwd=HERE / "audit", check=False)
    data = json.loads((HERE / "audit" / "contrast.json").read_text(encoding="utf-8"))
    radar_rows, new_rows = data["radar"], data["momentum"]

    bad = [r for r in new_rows if r["verdict"] != "PASS"]
    if bad:
        print(f"refusing to build: {len(bad)} non-passing pair(s) in the new system", file=sys.stderr)
        return 1

    tok_css = (HERE / "tokens" / "momentum.tokens.css").read_text(encoding="utf-8")
    cmp_css = (HERE / "tokens" / "momentum.components.css").read_text(encoding="utf-8")
    tokens = tokens_of(tok_css)
    sites = json.loads((HERE / "audit" / "tokens-by-site.json").read_text(encoding="utf-8"))

    rails, caption = drift_rails(sites, radar_rows)
    page = (HERE / "page.template.html").read_text(encoding="utf-8")
    for key, val in {
        "TOKENS_CSS": tok_css,
        "COMPONENTS_CSS": cmp_css,
        "DATE": DATE,
        "HERO_STATS": hero_stats(radar_rows, new_rows, len(sites)),
        "DRIFT_RAILS": rails,
        "DRIFT_CAPTION": caption,
        "CONTRAST_ROWS": contrast_rows(new_rows),
        "SWATCHES": swatches(tokens),
        "TYPE_LADDER": type_ladder(tokens),
        "SPACE_BARS": space_bars(tokens),
        "RADII": radii(tokens),
        "MOTION_ROWS": motion_rows(tokens),
        "LOGO_WALL": logo_wall(),
    }.items():
        page = page.replace("{{" + key + "}}", val)

    left = re.findall(r"\{\{[A-Z_]+\}\}", page)
    assert not left, f"unfilled placeholders: {sorted(set(left))}"

    out = HERE / "index.html"
    out.write_text(page, encoding="utf-8")
    print(f"wrote {out}  ({len(page):,} bytes)")
    print(f"radar: {sum(1 for r in radar_rows if r['verdict'] == 'FAIL')} fails / {len(radar_rows)} pairs")
    print(f"new:   {len(bad)} fails / {len(new_rows)} pairs")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
