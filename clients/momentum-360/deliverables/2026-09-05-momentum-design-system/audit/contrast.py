"""WCAG 2.x contrast, computed from color tokens read out of the shipped
stylesheet - never from a hand-copied palette.

Two jobs:
  1. audit the ten live radar builds (tokens-by-site.json) for every
     text-on-background pair the kit actually uses;
  2. audit tokens/momentum.tokens.css, the new system, the same way.

Resolves var() chains and the subset of color-mix(in srgb, A p%, B) that the
radar kit uses. Anything it cannot resolve is reported as UNRESOLVED rather
than silently skipped, because a skipped pair is an unmeasured pair.
"""
from __future__ import annotations

import json
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent

NAMED = {"transparent": (0, 0, 0, 0.0), "white": (255, 255, 255, 1.0), "black": (0, 0, 0, 1.0)}
MIX = re.compile(
    r"color-mix\(\s*in\s+srgb\s*,\s*(.+?)\s+([\d.]+)%\s*,\s*(.+?)\s*\)$", re.I | re.S
)
VAR = re.compile(r"var\(\s*(--[A-Za-z0-9_-]+)\s*(?:,\s*(.+))?\)$", re.S)


def parse_hex(s: str):
    s = s.strip().lstrip("#")
    if len(s) == 3:
        s = "".join(c * 2 for c in s)
    if len(s) == 8:
        r, g, b, a = (int(s[i : i + 2], 16) for i in (0, 2, 4, 6))
        return (r, g, b, a / 255)
    if len(s) == 6:
        return tuple(int(s[i : i + 2], 16) for i in (0, 2, 4)) + (1.0,)
    return None


def resolve(value: str, tokens: dict, depth: int = 0):
    """value -> (r, g, b, a) or None."""
    if value is None or depth > 24:
        return None
    v = " ".join(str(value).split())
    low = v.lower()
    if low in NAMED:
        return NAMED[low]
    if v.startswith("#"):
        return parse_hex(v)
    m = VAR.match(v)
    if m:
        name, fallback = m.group(1), m.group(2)
        if name in tokens:
            got = resolve(tokens[name], tokens, depth + 1)
            if got:
                return got
        return resolve(fallback, tokens, depth + 1) if fallback else None
    m = MIX.match(v)
    if m:
        a = resolve(m.group(1), tokens, depth + 1)
        b = resolve(m.group(3), tokens, depth + 1)
        if not a or not b:
            return None
        p = float(m.group(2)) / 100.0
        return tuple(a[i] * p + b[i] * (1 - p) for i in range(4))
    m = re.match(r"rgba?\(([^)]*)\)$", low)
    if m:
        parts = [x.strip() for x in re.split(r"[,\s/]+", m.group(1)) if x.strip()]
        if len(parts) >= 3:
            n = [float(x.rstrip("%")) for x in parts[:3]]
            alpha = float(parts[3].rstrip("%")) if len(parts) > 3 else 1.0
            if len(parts) > 3 and parts[3].endswith("%"):
                alpha /= 100
            return (n[0], n[1], n[2], alpha)
    return None


def flatten(fg, bg):
    """Composite a translucent foreground over an opaque background."""
    if fg[3] >= 1:
        return fg[:3]
    return tuple(fg[i] * fg[3] + bg[i] * (1 - fg[3]) for i in range(3))


def lum(c):
    def ch(x):
        x = min(255.0, max(0.0, x)) / 255.0
        return x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4

    return 0.2126 * ch(c[0]) + 0.7152 * ch(c[1]) + 0.0722 * ch(c[2])


def ratio(fg, bg):
    a, b = lum(fg), lum(bg)
    hi, lo = max(a, b), min(a, b)
    return (hi + 0.05) / (lo + 0.05)


def hexs(c):
    return "#" + "".join(f"{round(min(255, max(0, x))):02x}" for x in c[:3])


def check(tokens, pairs, label):
    """pairs: list of (fg_token, bg_token, use, size_class)."""
    rows = []
    for fg_t, bg_t, use, size in pairs:
        fg = resolve(tokens.get(fg_t, fg_t), tokens)
        bg = resolve(tokens.get(bg_t, bg_t), tokens)
        if not fg or not bg:
            rows.append(
                {"source": label, "fg": fg_t, "bg": bg_t, "use": use, "size": size,
                 "ratio": None, "required": None, "verdict": "UNRESOLVED"}
            )
            continue
        req = 3.0 if size == "large" else 4.5
        r = ratio(flatten(fg, bg[:3]), bg[:3])
        rows.append(
            {"source": label, "fg": fg_t, "fg_hex": hexs(fg), "bg": bg_t, "bg_hex": hexs(bg),
             "use": use, "size": size, "ratio": round(r, 2), "required": req,
             "verdict": "PASS" if r >= req else "FAIL"}
        )
    return rows


# The pairs the radar kit actually renders, named in kit terms.
RADAR_PAIRS = [
    ("--ink", "--paper", "body copy on page", "small"),
    ("--muted", "--paper", "secondary copy on page", "small"),
    ("--brand", "--paper", "section heading on page", "large"),
    ("--accent", "--paper", "accent label on page", "small"),
    ("--on-brand", "--brand", "text on brand field", "small"),
    ("--on-deep", "--brand-2", "text on deep field", "small"),
    ("--on-accent", "--accent", "pill button label", "small"),
    ("--accent", "--brand", "seal / eyebrow on brand field", "small"),
    ("--accent", "--brand-2", "seal on deep field", "small"),
    ("--ink", "--panel", "card copy on panel", "small"),
    ("--muted", "--panel", "card secondary copy on panel", "small"),
    ("--brand", "--brand-2", "heading on deep field", "large"),
]


def audit_radar():
    data = json.loads((HERE / "tokens-by-site.json").read_text(encoding="utf-8"))
    rows = []
    for site, tokens in sorted(data.items()):
        rows += check(tokens, RADAR_PAIRS, site)
    return rows


def audit_new():
    css = (HERE.parent / "tokens" / "momentum.tokens.css").read_text(encoding="utf-8")
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    tokens = {}
    for block in re.findall(r":root\s*\{(.*?)\}", css, re.S):
        for name, value in re.findall(r"(--[A-Za-z0-9_-]+)\s*:\s*([^;]+?)\s*(?=;|$)", block, re.S):
            tokens[name] = " ".join(value.split())
    pairs = [
        ("--m-ink", "--m-paper", "body copy on paper", "small"),
        ("--m-muted", "--m-paper", "secondary copy on paper", "small"),
        ("--m-ink", "--m-surface", "card copy on surface", "small"),
        ("--m-muted", "--m-surface", "card secondary copy on surface", "small"),
        ("--m-brand", "--m-paper", "brand heading on paper", "large"),
        ("--m-brand", "--m-surface", "brand heading on surface (large only)", "large"),
        ("--m-link", "--m-paper", "inline link on paper", "small"),
        ("--m-on-brand", "--m-brand", "text on brand field", "small"),
        ("--m-on-brand-muted", "--m-brand", "secondary text on brand field", "small"),
        ("--m-on-deep", "--m-deep", "text on deep field", "small"),
        ("--m-on-deep-muted", "--m-deep", "secondary text on deep field", "small"),
        ("--m-on-accent", "--m-accent", "pill button label", "small"),
        ("--m-accent-ink", "--m-paper", "accent text on paper", "small"),
        ("--m-accent-ink", "--m-surface", "accent text on surface", "small"),
        ("--m-accent-on-deep", "--m-deep", "accent text on deep field", "small"),
        ("--m-accent-on-brand", "--m-brand", "accent text on brand field (large only)", "large"),
        ("--m-on-deep", "--m-nav", "nav link on nav bar", "small"),
        ("--m-on-deep-muted", "--m-nav", "nav secondary on nav bar", "small"),
        ("--m-danger", "--m-paper", "form error text on paper", "small"),
        ("--m-danger", "--m-surface", "form error text on surface", "small"),
        ("--m-success", "--m-paper", "success text on paper", "small"),
        ("--m-focus", "--m-paper", "focus ring on paper", "large"),
        ("--m-focus", "--m-deep", "focus ring on deep field", "large"),
        ("--m-line-strong", "--m-paper", "input border on paper", "large"),
        ("--m-focus", "--m-focus-halo", "focus ring against its halo", "large"),
        ("--m-line-strong", "--m-surface", "input border on surface", "large"),
        ("--m-accent-on-brand", "--m-brand", "footer script at gradient worst stop", "large"),
        ("--m-on-brand-muted", "--m-brand", "footer fine print at gradient worst stop", "small"),
        ("--m-on-brand", "--m-brand", "footer lead at gradient worst stop", "small"),
        ("--m-accent-on-deep", "--m-nav", "nav caption on nav bar", "small"),
        ("--m-on-deep", "--m-brand", "nav mark if nav ever sits on brand", "small"),
    ]
    return check(tokens, pairs, "momentum.tokens.css")


def report(rows, title):
    fails = [r for r in rows if r["verdict"] == "FAIL"]
    unres = [r for r in rows if r["verdict"] == "UNRESOLVED"]
    print(f"\n== {title}: {len(rows)} pairs, {len(fails)} FAIL, {len(unres)} UNRESOLVED")
    for r in rows:
        if r["verdict"] == "PASS":
            continue
        got = f"{r['ratio']}:1" if r["ratio"] else "?"
        print(f"  {r['verdict']:10} {got:>7} (need {r['required']}) "
              f"{r.get('fg_hex','?')} on {r.get('bg_hex','?')}  {r['source']}  {r['use']}")
    return fails


def demo():
    t = {"--a": "#ffffff", "--b": "var(--a)", "--c": "color-mix(in srgb, #000000 50%, #ffffff)"}
    assert resolve("var(--b)", t)[:3] == (255, 255, 255)
    assert abs(resolve("var(--c)", t)[0] - 127.5) < 0.01
    assert abs(ratio((255, 255, 255), (0, 0, 0)) - 21.0) < 0.01, "white on black is 21:1"
    assert abs(ratio((255, 255, 255), (255, 255, 255)) - 1.0) < 0.01
    # known value: #767676 on white is the classic 4.54:1 AA boundary
    assert abs(ratio((118, 118, 118), (255, 255, 255)) - 4.54) < 0.02
    print("contrast self-check ok")


if __name__ == "__main__":
    if "--demo" in sys.argv:
        demo()
        raise SystemExit(0)
    demo()
    out = {}
    if (HERE / "tokens-by-site.json").exists():
        rows = audit_radar()
        out["radar"] = rows
        report(rows, "ten live radar builds")
    if (HERE.parent / "tokens" / "momentum.tokens.css").exists():
        rows = audit_new()
        out["momentum"] = rows
        f = report(rows, "momentum.tokens.css")
        (HERE / "contrast.json").write_text(json.dumps(out, indent=2), encoding="utf-8")
        raise SystemExit(1 if f else 0)
    (HERE / "contrast.json").write_text(json.dumps(out, indent=2), encoding="utf-8")
