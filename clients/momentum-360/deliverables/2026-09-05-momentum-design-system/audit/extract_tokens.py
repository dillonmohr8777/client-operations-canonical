"""Extract every :root custom property from the ten live radar builds and
report where they disagree.

Input:  the fetched HTML of each /sites/<slug>/ page.
Output: audit/tokens-by-site.json  (resolved token -> value per site)
        audit/drift.json           (per-token value spread + coverage)

Later :root blocks override earlier ones, so blocks are applied in document
order and the last value wins - that is what the browser does and it is the
only way the late "accent contrast fix" overrides show up correctly.
"""
import json
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent
RADAR = HERE / "radar"

ROOT_BLOCK = re.compile(r":root\s*\{(.*?)\}", re.S)
DECL = re.compile(r"(--[A-Za-z0-9_-]+)\s*:\s*([^;]+?)\s*(?=;|$)", re.S)


def strip_comments(css: str) -> str:
    return re.sub(r"/\*.*?\*/", "", css, flags=re.S)


def style_css(html: str) -> str:
    return "\n".join(
        strip_comments(m) for m in re.findall(r"<style[^>]*>(.*?)</style>", html, re.S)
    )


def root_tokens(css: str) -> dict:
    """Apply every :root block in order; last declaration wins."""
    out = {}
    for block in ROOT_BLOCK.findall(css):
        for name, value in DECL.findall(block):
            out[name] = " ".join(value.split())
    return out


def main() -> int:
    sites = sorted(p for p in RADAR.glob("*.html") if p.stem != "index")
    if not sites:
        print(f"no site html under {RADAR}", file=sys.stderr)
        return 1

    by_site = {}
    for path in sites:
        html = path.read_text(encoding="utf-8", errors="replace")
        by_site[path.stem] = root_tokens(style_css(html))

    names = sorted({n for t in by_site.values() for n in t})
    drift = {}
    for name in names:
        values = {s: t[name] for s, t in by_site.items() if name in t}
        distinct = sorted(set(values.values()))
        drift[name] = {
            "defined_on": len(values),
            "of_sites": len(by_site),
            "distinct_values": len(distinct),
            "values": {v: sorted(s for s, val in values.items() if val == v) for v in distinct},
        }

    (HERE / "tokens-by-site.json").write_text(json.dumps(by_site, indent=2), encoding="utf-8")
    (HERE / "drift.json").write_text(json.dumps(drift, indent=2), encoding="utf-8")

    universal = [n for n, d in drift.items() if d["defined_on"] == d["of_sites"]]
    stable = [n for n in universal if drift[n]["distinct_values"] == 1]
    print(f"sites: {len(by_site)}  tokens seen: {len(names)}")
    print(f"defined on all sites: {len(universal)}  of those identical everywhere: {len(stable)}")
    print(f"partial coverage: {len(names) - len(universal)}")
    return 0


def demo():
    css = ":root{--a:#111;--b:2px}\n:root{--a:#222}"
    assert root_tokens(css) == {"--a": "#222", "--b": "2px"}, "last :root block must win"
    assert root_tokens(strip_comments(":root{/*x*/--a:1}")) == {"--a": "1"}
    print("ok")


if __name__ == "__main__":
    if "--demo" in sys.argv:
        demo()
    else:
        raise SystemExit(main())
