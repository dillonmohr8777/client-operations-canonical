#!/usr/bin/env python3
"""Role-aware entrance choreography for a kit-built .pptx.

The deck kit stamps every shape with `role:<name>`. This reads those names and writes a
native PowerPoint animation timeline per slide, so each element moves in a way that suits
what it is: panels wipe in from the edge they bleed off, figures pop, rules draw, copy
rises. That beats one uniform fade applied by guessing from geometry.

The effects are ordinary OOXML timing nodes, so the deck stays editable, plays offline,
and needs no video.

    python choreograph.py deck.pptx [--out out.pptx] [--style subtle|bold|none] [--json]

Requires nothing but the standard library.
"""

import argparse
import json
import re
import shutil
import sys
import zipfile
from pathlib import Path

SLIDE_RE = re.compile(r"ppt/slides/slide(\d+)\.xml$")
# Top level drawing elements. Our decks never nest shapes in groups.
SHAPE_RE = re.compile(r"<p:(sp|pic|graphicFrame|cxnSp)\b.*?</p:\1>", re.S)
CNVPR_RE = re.compile(r'<p:cNvPr\b[^>]*\bid="(\d+)"[^>]*\bname="([^"]*)"')
OFF_RE = re.compile(r'<a:off\b[^>]*\bx="(-?\d+)"[^>]*\by="(-?\d+)"')

# ── the vocabulary ────────────────────────────────────────────────────────────
#
# Each role maps to (kind, duration_ms, magnitude). Durations are deliberately short:
# the deck has to feel quick in a live meeting, not cinematic.
#
#   fade   plain opacity
#   rise   opacity plus a small upward translate, magnitude = slide heights
#   pop    opacity plus a scale up from magnitude (percent), the emphasis move
#   settle opacity plus a scale down from magnitude, for something already large
#   wipe   directional reveal, magnitude = OOXML filter direction

CHOREOGRAPHY = {
    # structure, first and fast
    "panel-left":   ("wipe", 420, "right"),
    "panel-right":  ("wipe", 420, "left"),
    "panel-top":    ("wipe", 420, "down"),
    "panel-bottom": ("wipe", 420, "up"),
    "motif":        ("fade", 900, 0),
    "logo":         ("fade", 320, 0),
    # headings
    "kicker":       ("rise", 280, 0.020),
    "display":      ("rise", 480, 0.038),
    "title":        ("rise", 420, 0.032),
    "sub":          ("rise", 340, 0.024),
    "numeral":      ("settle", 900, 106000),
    # figures: the number is the hero, so it is the only thing that scales
    "hero":         ("pop", 520, 84000),
    "figure":       ("pop", 420, 88000),
    "figure-label": ("fade", 260, 0),
    # lists and process
    "row-head":     ("rise", 300, 0.018),
    "row-body":     ("fade", 280, 0),
    "step-num":     ("pop", 320, 88000),
    "step-head":    ("rise", 280, 0.018),
    # rules draw rather than appear
    "rule-h":       ("wipe", 460, "right"),
    "rule-v":       ("wipe", 340, "down"),
    # everything else
    "block":        ("fade", 320, 0),
    "body":         ("fade", 280, 0),
}

# Never animated: they are furniture and should simply be on the slide.
STATIC_ROLES = {"static", "foot"}

# Structure lands before content, at zero delay, so the slide is composed the instant
# it arrives and only the content staggers in.
STRUCTURE_ROLES = {"panel-left", "panel-right", "panel-top", "panel-bottom", "motif", "logo"}

STAGGER_MS = 55
MAX_CONTENT_EFFECTS = 18


class Ids:
    """Timing node ids have to be unique within a slide."""

    def __init__(self, start=1):
        self.n = start

    def __call__(self):
        self.n += 1
        return self.n - 1


def esc(v):
    return str(v)


def behaviour_fade(ids, spid, dur, decel=70000):
    return (f'<p:animEffect transition="in" filter="fade"><p:cBhvr>'
            f'<p:cTn id="{ids()}" dur="{dur}" decel="{decel}"/>'
            f'<p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl></p:cBhvr></p:animEffect>')


def behaviour_wipe(ids, spid, dur, direction):
    return (f'<p:animEffect transition="in" filter="wipe({direction})"><p:cBhvr>'
            f'<p:cTn id="{ids()}" dur="{dur}"/>'
            f'<p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl></p:cBhvr></p:animEffect>')


def behaviour_translate_y(ids, spid, dur, dy, decel=70000):
    return (f'<p:anim calcmode="lin" valueType="num"><p:cBhvr additive="base">'
            f'<p:cTn id="{ids()}" dur="{dur}" decel="{decel}" fill="hold"/>'
            f'<p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl>'
            f'<p:attrNameLst><p:attrName>ppt_y</p:attrName></p:attrNameLst></p:cBhvr>'
            f'<p:tavLst>'
            f'<p:tav tm="0"><p:val><p:strVal val="#ppt_y+{dy}"/></p:val></p:tav>'
            f'<p:tav tm="100000"><p:val><p:strVal val="#ppt_y"/></p:val></p:tav>'
            f'</p:tavLst></p:anim>')


def behaviour_scale(ids, spid, dur, frm, decel=70000):
    return (f'<p:animScale><p:cBhvr>'
            f'<p:cTn id="{ids()}" dur="{dur}" decel="{decel}" fill="hold"/>'
            f'<p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl></p:cBhvr>'
            f'<p:from x="{frm}" y="{frm}"/><p:to x="100000" y="100000"/></p:animScale>')


def effect_par(ids, spid, kind, dur, mag, delay):
    """One entrance effect as a <p:par> node."""
    preset = {"wipe": ("22", "1"), "pop": ("23", "0"), "settle": ("23", "0")}.get(kind, ("10", "0"))
    par_id = ids()
    show = (f'<p:set><p:cBhvr><p:cTn id="{ids()}" dur="1" fill="hold">'
            f'<p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn>'
            f'<p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl>'
            f'<p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst>'
            f'</p:cBhvr><p:to><p:strVal val="visible"/></p:to></p:set>')

    if kind == "wipe":
        moves = behaviour_wipe(ids, spid, dur, mag)
    elif kind == "rise":
        moves = behaviour_fade(ids, spid, dur) + behaviour_translate_y(ids, spid, dur, mag)
    elif kind in ("pop", "settle"):
        moves = behaviour_fade(ids, spid, dur) + behaviour_scale(ids, spid, dur, mag)
    else:
        moves = behaviour_fade(ids, spid, dur)

    return (f'<p:par><p:cTn id="{par_id}" presetID="{preset[0]}" presetClass="entr" '
            f'presetSubtype="{preset[1]}" fill="hold" grpId="0" nodeType="withEffect">'
            f'<p:stCondLst><p:cond delay="{delay}"/></p:stCondLst>'
            f'<p:childTnLst>{show}{moves}</p:childTnLst></p:cTn></p:par>')


def read_shapes(xml):
    """Every top level shape with its id, role and position, in document order."""
    out = []
    for m in SHAPE_RE.finditer(xml):
        block = m.group(0)
        cn = CNVPR_RE.search(block)
        if not cn:
            continue
        shape_id, name = int(cn.group(1)), cn.group(2)
        role = name[5:] if name.startswith("role:") else None
        off = OFF_RE.search(block)
        x, y = (int(off.group(1)), int(off.group(2))) if off else (0, 0)
        out.append({"spid": shape_id, "role": role, "x": x, "y": y,
                    "kind": m.group(1)})
    return out


def plan(shapes, style):
    """Decide what animates, in what order, with what delay."""
    steps = []
    structure, content = [], []
    for sh in shapes:
        role = sh["role"]
        if role in STATIC_ROLES:
            continue
        if role is None:
            # An untagged shape is almost always a table or a chart the kit does not
            # name. A quiet fade is right; guessing anything louder is not.
            if sh["kind"] in ("graphicFrame", "pic"):
                role = "block"
            else:
                continue
        if role not in CHOREOGRAPHY:
            role = "body"
        (structure if role in STRUCTURE_ROLES else content).append((sh, role))

    for sh, role in structure:
        kind, dur, mag = CHOREOGRAPHY[role]
        steps.append((sh["spid"], kind, dur, mag, 0))

    # Reading order: down the slide, then across.
    content.sort(key=lambda pair: (pair[0]["y"], pair[0]["x"]))
    for i, (sh, role) in enumerate(content[:MAX_CONTENT_EFFECTS]):
        kind, dur, mag = CHOREOGRAPHY[role]
        if style == "bold":
            dur = int(dur * 1.15)
            if kind == "rise":
                mag = round(mag * 1.6, 4)
            if kind == "pop":
                mag = max(70000, mag - 6000)
        steps.append((sh["spid"], kind, dur, mag, i * STAGGER_MS))
    return steps


def build_timing(steps):
    ids = Ids(1)
    root_id, seq_id, hold_id, group_id = ids(), ids(), ids(), ids()
    effects = "".join(effect_par(ids, spid, kind, dur, mag, delay)
                      for spid, kind, dur, mag, delay in steps)
    return (
        "<p:timing><p:tnLst><p:par>"
        f'<p:cTn id="{root_id}" dur="indefinite" restart="never" nodeType="tmRoot">'
        "<p:childTnLst>"
        '<p:seq concurrent="1" nextAc="seek">'
        f'<p:cTn id="{seq_id}" dur="indefinite" nodeType="mainSeq"><p:childTnLst>'
        f'<p:par><p:cTn id="{hold_id}" fill="hold">'
        '<p:stCondLst><p:cond delay="indefinite"/>'
        f'<p:cond evt="onBegin" delay="0"><p:tn val="{seq_id}"/></p:cond></p:stCondLst>'
        "<p:childTnLst>"
        f'<p:par><p:cTn id="{group_id}" fill="hold">'
        '<p:stCondLst><p:cond delay="0"/></p:stCondLst>'
        f"<p:childTnLst>{effects}</p:childTnLst>"
        "</p:cTn></p:par>"
        "</p:childTnLst></p:cTn></p:par>"
        "</p:childTnLst></p:cTn>"
        '<p:prevCondLst><p:cond evt="onPrev" delay="0">'
        "<p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>"
        '<p:nextCondLst><p:cond evt="onNext" delay="0">'
        "<p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst>"
        "</p:seq></p:childTnLst></p:cTn></p:par></p:tnLst></p:timing>"
    )


def rewrite_slide(xml, style):
    shapes = read_shapes(xml)
    steps = plan(shapes, style)

    # Strip anything already there so re-running is idempotent.
    xml = re.sub(r"<p:transition\b.*?(?:/>|</p:transition>)", "", xml, flags=re.S)
    xml = re.sub(r"<p:timing\b.*?</p:timing>", "", xml, flags=re.S)

    if style == "none" or not steps:
        block = '<p:transition spd="med"><p:fade/></p:transition>'
    else:
        block = '<p:transition spd="med"><p:fade/></p:transition>' + build_timing(steps)

    # CT_Slide requires cSld, clrMapOvr, transition, timing in that order.
    return xml.replace("</p:sld>", block + "</p:sld>"), len(steps)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("pptx")
    ap.add_argument("--out")
    ap.add_argument("--style", default="subtle", choices=["subtle", "bold", "none"])
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()

    src = Path(a.pptx).resolve()
    dst = Path(a.out).resolve() if a.out else src
    if dst != src:
        shutil.copyfile(src, dst)

    zin = zipfile.ZipFile(src, "r")
    items = zin.infolist()
    slides = sorted((n for n in zin.namelist() if SLIDE_RE.match(n)),
                    key=lambda s: int(SLIDE_RE.match(s).group(1)))
    edited, total = {}, 0
    for name in slides:
        xml = zin.read(name).decode("utf8")
        new, count = rewrite_slide(xml, a.style)
        edited[name] = new.encode("utf8")
        total += count

    tmp = dst.with_suffix(".choreo.tmp")
    with zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
        for item in items:
            data = edited.get(item.filename)
            if data is None:
                data = zin.read(item.filename)
            zout.writestr(item, data)
    zin.close()
    tmp.replace(dst)

    summary = {"file": str(dst), "slides": len(slides), "effects": total, "style": a.style}
    if a.json:
        print(json.dumps(summary))
    else:
        print(f"choreographed {len(slides)} slides, {total} effects, style {a.style}")
    if total == 0 and a.style != "none":
        print("no role tags found; was this deck built by the client-deck kit?",
              file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
