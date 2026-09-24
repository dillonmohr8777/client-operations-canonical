"""Estate-wide design-token scan.

Walks every repo under a root, pulls the design tokens out of every CSS and
HTML file that declares them, and reports:

  1. token drift per repo - how many palettes, fonts, radii, curves each one
     actually ships;
  2. anti-slop violations, as a machine check rather than folklore: AI purple,
     neon glow, glassmorphism, floating gradient orbs, three-equal-card rows;
  3. WCAG AA contrast for any file using the radar/Momentum token vocabulary,
     via the same audit/contrast.py the design system is held to.

    python scan_repos.py [root]        default root: C:/Users/dillo/repos

Writes repo-scan.json next to this file.
"""
from __future__ import annotations

import colorsys
import json
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from contrast import RADAR_PAIRS, check, parse_hex  # noqa: E402

DEFAULT_ROOT = pathlib.Path("C:/Users/dillo/repos")
EXTS = {".css", ".scss", ".html", ".htm"}
SKIP_DIRS = {
    "node_modules", ".git", "__pycache__", ".next", ".venv", "venv",
    "vendor", ".cache", "coverage", ".turbo", "site-packages",
}
MAX_BYTES = 3_000_000

ROOT_BLOCK = re.compile(r"(?::root|\[data-theme[^\]]*\]|html)\s*\{(.*?)\}", re.S)
DECL = re.compile(r"(--[A-Za-z0-9_-]+)\s*:\s*([^;]+?)\s*(?=;|$)", re.S)
HEX = re.compile(r"#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b")
FONT_FAMILY = re.compile(r"font-family\s*:\s*([^;}]+)", re.I)
RADIUS = re.compile(r"border-radius\s*:\s*([^;}]+)", re.I)
TIMING = re.compile(r"(?:transition|animation)(?:-duration|-timing-function)?\s*:\s*([^;}]+)", re.I)

# --- anti-slop detectors --------------------------------------------------
GLASS = re.compile(r"backdrop-filter\s*:\s*[^;}]*blur", re.I)
ORB = re.compile(r"filter\s*:\s*blur\(\s*(\d+)", re.I)
RADIAL = re.compile(r"radial-gradient", re.I)
THREE_EQUAL = re.compile(r"grid-template-columns\s*:\s*(?:repeat\(\s*3\s*,\s*1fr\s*\)|1fr\s+1fr\s+1fr)\s*[;}]", re.I)
SHADOW = re.compile(r"box-shadow\s*:\s*([^;}]+)", re.I)


def strip_comments(css: str) -> str:
    return re.sub(r"/\*.*?\*/", "", css, flags=re.S)


def css_of(path: pathlib.Path, text: str) -> str:
    if path.suffix.lower() in (".html", ".htm"):
        return "\n".join(
            strip_comments(m) for m in re.findall(r"<style[^>]*>(.*?)</style>", text, re.S)
        )
    return strip_comments(text)


def hsl(hex_str: str):
    c = parse_hex(hex_str)
    if not c:
        return None
    r, g, b = (x / 255 for x in c[:3])
    h, light, s = colorsys.rgb_to_hls(r, g, b)
    return h * 360, s, light


def is_ai_purple(hex_str: str) -> bool:
    """Indigo/violet at real saturation and mid lightness - the #6366f1 family."""
    got = hsl(hex_str)
    if not got:
        return False
    h, s, light = got
    return 235 <= h <= 300 and s >= 0.30 and 0.28 <= light <= 0.78


def is_glow(shadow: str) -> bool:
    """A saturated, non-neutral, spread-out shadow: a glow, not depth."""
    if "inset" in shadow.lower():
        return False
    for hx in HEX.findall(shadow):
        got = hsl(hx)
        if got and got[1] >= 0.55 and 0.30 <= got[2] <= 0.80:
            return True
    for m in re.finditer(r"rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)", shadow):
        r, g, b = (int(x) for x in m.groups())
        mx, mn = max(r, g, b), min(r, g, b)
        if mx > 90 and (mx - mn) / max(mx, 1) >= 0.55:
            return True
    return False


def scan_file(path: pathlib.Path, text: str) -> dict:
    css = css_of(path, text)
    tokens = {}
    for block in ROOT_BLOCK.findall(css):
        for k, v in DECL.findall(block):
            tokens[k] = " ".join(v.split())

    colors = {h.lower() for h in HEX.findall(css)}
    purple = sorted(h for h in colors if is_ai_purple(h))
    glows = [s.strip()[:90] for s in SHADOW.findall(css) if is_glow(s)]
    orbs = []
    if RADIAL.search(css):
        for m in ORB.finditer(css):
            if int(m.group(1)) >= 24:
                orbs.append(f"blur({m.group(1)}px) + radial-gradient")
                break

    fonts = set()
    for fam in FONT_FAMILY.findall(css):
        first = fam.split(",")[0].strip().strip("'\"")
        if first and not first.startswith("var(") and first.lower() not in (
            "inherit", "initial", "unset", "revert",
        ):
            fonts.add(first)

    radii = {r.strip() for r in RADIUS.findall(css) if r.strip() not in ("0", "0px", "inherit")}
    radii = {r for r in radii if not r.startswith("var(")}

    curves = set()
    for t in TIMING.findall(css):
        for m in re.finditer(r"cubic-bezier\([^)]*\)|\bease-in-out\b|\bease-in\b|\bease-out\b|\blinear\b|\bease\b", t):
            curves.add(m.group(0))

    return {
        "tokens": tokens,
        "colors": sorted(colors),
        "fonts": sorted(fonts),
        "radii": sorted(radii),
        "curves": sorted(curves),
        "purple": purple,
        "glow": glows[:3],
        "glass": len(GLASS.findall(css)),
        "orbs": orbs,
        "three_equal": len(THREE_EQUAL.findall(css)),
    }


def walk(root: pathlib.Path):
    for p in root.rglob("*"):
        if not p.is_file() or p.suffix.lower() not in EXTS:
            continue
        if any(part in SKIP_DIRS for part in p.parts):
            continue
        try:
            if p.stat().st_size > MAX_BYTES:
                continue
            yield p, p.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue


RADAR_VOCAB = {"--brand", "--accent", "--paper", "--ink", "--panel", "--muted", "--brand-2"}


def main(root: pathlib.Path) -> int:
    repos: dict[str, dict] = {}
    files_seen = 0

    for path, text in walk(root):
        try:
            rel = path.relative_to(root)
        except ValueError:
            continue
        repo = rel.parts[0] if len(rel.parts) > 1 else "(root)"
        info = scan_file(path, text)
        if not (info["tokens"] or info["purple"] or info["glow"] or info["glass"]
                or info["orbs"] or info["three_equal"]):
            continue
        files_seen += 1

        r = repos.setdefault(repo, {
            "files": 0, "token_files": 0, "tokens": set(), "colors": set(),
            "fonts": set(), "radii": set(), "curves": set(),
            "purple": {}, "glow": {}, "glass": {}, "orbs": {}, "three_equal": {},
            "contrast_fail": [], "contrast_pairs": 0,
        })
        r["files"] += 1
        if info["tokens"]:
            r["token_files"] += 1
        r["tokens"] |= set(info["tokens"])
        r["colors"] |= set(info["colors"])
        r["fonts"] |= set(info["fonts"])
        r["radii"] |= set(info["radii"])
        r["curves"] |= set(info["curves"])
        rp = rel.as_posix()
        if info["purple"]:
            r["purple"][rp] = info["purple"]
        if info["glow"]:
            r["glow"][rp] = info["glow"]
        if info["glass"]:
            r["glass"][rp] = info["glass"]
        if info["orbs"]:
            r["orbs"][rp] = info["orbs"]
        if info["three_equal"]:
            r["three_equal"][rp] = info["three_equal"]

        # Contrast, but only where the file speaks the radar vocabulary - an
        # audit of pairs a file does not actually render is not evidence.
        if len(RADAR_VOCAB & set(info["tokens"])) >= 4:
            rows = check(info["tokens"], RADAR_PAIRS, rp)
            rows = [x for x in rows if x["verdict"] != "UNRESOLVED"]
            r["contrast_pairs"] += len(rows)
            r["contrast_fail"] += [x for x in rows if x["verdict"] == "FAIL"]

    out = {}
    for name, r in sorted(repos.items()):
        out[name] = {
            "files_with_design_css": r["files"],
            "files_declaring_tokens": r["token_files"],
            "distinct_tokens": len(r["tokens"]),
            "distinct_hex_colors": len(r["colors"]),
            "distinct_font_families": sorted(r["fonts"]),
            "distinct_radii": len(r["radii"]),
            "distinct_curves": sorted(r["curves"]),
            "contrast_pairs_measured": r["contrast_pairs"],
            "contrast_failures": len(r["contrast_fail"]),
            "worst_contrast": min(
                (x["ratio"] for x in r["contrast_fail"]), default=None
            ),
            "antislop": {
                "ai_purple": r["purple"],
                "neon_glow": r["glow"],
                "glassmorphism": r["glass"],
                "gradient_orbs": r["orbs"],
                "three_equal_card_row": r["three_equal"],
            },
            "contrast_failure_detail": r["contrast_fail"][:40],
        }

    (HERE / "repo-scan.json").write_text(json.dumps(out, indent=2), encoding="utf-8")

    # ---- console report ----
    print(f"root: {root}")
    print(f"repos with design CSS: {len(out)}   files scanned into the report: {files_seen}\n")

    print("ANTI-SLOP, estate-wide (files, not occurrences)")
    for key, label in [
        ("ai_purple", "AI purple"),
        ("neon_glow", "neon glow"),
        ("glassmorphism", "glassmorphism"),
        ("gradient_orbs", "floating gradient orbs"),
        ("three_equal_card_row", "three-equal-card row"),
    ]:
        hits = [(n, len(v["antislop"][key])) for n, v in out.items() if v["antislop"][key]]
        hits.sort(key=lambda x: -x[1])
        total = sum(h[1] for h in hits)
        top = ", ".join(f"{n} ({c})" for n, c in hits[:6])
        print(f"  {label:24} {total:>4} files   {top}")

    tot_pairs = sum(v["contrast_pairs_measured"] for v in out.values())
    tot_fail = sum(v["contrast_failures"] for v in out.values())
    print(f"\nCONTRAST (radar-vocabulary files only): {tot_fail} fail / {tot_pairs} pairs")
    for n, v in sorted(out.items(), key=lambda x: -x[1]["contrast_failures"]):
        if v["contrast_failures"]:
            print(f"  {n:44} {v['contrast_failures']:>4} fail / {v['contrast_pairs_measured']:>4}"
                  f"   worst {v['worst_contrast']}:1")

    print("\nPALETTE + SYSTEM SPREAD (top 15 by distinct hex colours)")
    print(f"  {'repo':44} {'hex':>5} {'fonts':>6} {'radii':>6} {'curves':>7} {'tokens':>7}")
    for n, v in sorted(out.items(), key=lambda x: -x[1]["distinct_hex_colors"])[:15]:
        print(f"  {n:44} {v['distinct_hex_colors']:>5} {len(v['distinct_font_families']):>6}"
              f" {v['distinct_radii']:>6} {len(v['distinct_curves']):>7} {v['distinct_tokens']:>7}")
    return 0


def demo():
    assert is_ai_purple("#6366f1"), "the canonical AI purple must trip"
    assert is_ai_purple("#8b5cf6")
    assert is_ai_purple("#583e7d"), "sangillo's brand is in the violet band"
    assert not is_ai_purple("#2f6e94"), "a slate blue is not purple"
    assert not is_ai_purple("#1e73be"), "brand blue is not purple"
    assert not is_ai_purple("#f58320"), "accent orange is not purple"
    assert not is_ai_purple("#2c2927"), "near-black is not purple"
    assert is_glow("0 0 24px #22d3ee"), "saturated cyan glow"
    assert not is_glow("0 18px 40px -22px rgba(10,12,16,.45)"), "neutral depth shadow"
    assert not is_glow("0 1px 2px rgba(14,26,34,0.10)")
    assert THREE_EQUAL.search("grid-template-columns: repeat(3, 1fr);")
    assert THREE_EQUAL.search("grid-template-columns: 1fr 1fr 1fr;")
    assert not THREE_EQUAL.search("grid-template-columns: 7fr 5fr;")
    print("scan self-check ok")


if __name__ == "__main__":
    demo()
    args = [a for a in sys.argv[1:] if not a.startswith("-")]
    if "--demo" in sys.argv:
        raise SystemExit(0)
    raise SystemExit(main(pathlib.Path(args[0]) if args else DEFAULT_ROOT))
