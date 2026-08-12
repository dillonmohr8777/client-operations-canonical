"""Check every text run in a deck against the colour actually behind it.

Backgrounds are resolved by walking the shapes that precede each text box in
z-order and taking the last solid-filled one whose bounds contain the box —
which is how the card, panel, and slide background actually stack here. Table
cells use their own fill. Reports WCAG contrast so "is this readable" is a
measured answer rather than an impression.
"""

import sys
from pptx import Presentation
from pptx.util import Emu

AA_BODY, AA_LARGE = 4.5, 3.0


def lum(rgb):
    def ch(c):
        c /= 255.0
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = rgb
    return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)


def contrast(fg, bg):
    a, b = lum(fg), lum(bg)
    hi, lo = max(a, b), min(a, b)
    return (hi + 0.05) / (lo + 0.05)


def as_tuple(rgb):
    s = str(rgb)
    return tuple(int(s[i:i + 2], 16) for i in (0, 2, 4))


def solid(shape):
    try:
        if shape.fill.type == 1:
            return as_tuple(shape.fill.fore_color.rgb)
    except Exception:
        pass
    return None


def box(shape):
    return (Emu(shape.left).inches, Emu(shape.top).inches,
            Emu(shape.width).inches, Emu(shape.height).inches)


def audit(path):
    prs = Presentation(path)
    issues, checked = [], 0

    for n, slide in enumerate(prs.slides, 1):
        shapes = list(slide.shapes)
        for idx, shape in enumerate(shapes):
            if shape.has_table:
                for i, row in enumerate(shape.table.rows):
                    for j, cell in enumerate(row.cells):
                        bg = (255, 255, 255)
                        try:
                            if cell.fill.type == 1:
                                bg = as_tuple(cell.fill.fore_color.rgb)
                        except Exception:
                            pass
                        for p in cell.text_frame.paragraphs:
                            for r in p.runs:
                                if not r.text.strip():
                                    continue
                                checked += 1
                                fg = as_tuple(r.font.color.rgb)
                                size = r.font.size.pt if r.font.size else 12
                                need = AA_LARGE if (size >= 18 or (size >= 14 and r.font.bold)) else AA_BODY
                                c = contrast(fg, bg)
                                if c < need:
                                    issues.append((n, f"table[{i},{j}]", r.text[:38],
                                                   round(c, 2), need, size))
                continue

            if not shape.has_text_frame or not shape.text_frame.text.strip():
                continue

            x, y, w, h = box(shape)
            cx, cy = x + w / 2, y + h / 2
            bg = (255, 255, 255)
            for under in shapes[:idx]:
                f = solid(under)
                if f is None:
                    continue
                ux, uy, uw, uh = box(under)
                if ux <= cx <= ux + uw and uy <= cy <= uy + uh:
                    bg = f

            for p in shape.text_frame.paragraphs:
                for r in p.runs:
                    if not r.text.strip():
                        continue
                    checked += 1
                    fg = as_tuple(r.font.color.rgb)
                    size = r.font.size.pt if r.font.size else 12
                    need = AA_LARGE if (size >= 18 or (size >= 14 and r.font.bold)) else AA_BODY
                    c = contrast(fg, bg)
                    if c < need:
                        issues.append((n, shape.name, r.text[:38], round(c, 2), need, size))

    print(f"checked {checked} text runs")
    if not issues:
        print("all runs meet WCAG AA for their size")
        return 0
    print(f"\n{len(issues)} run(s) below AA:")
    for n, name, text, c, need, size in issues:
        print(f"  s{n} {name:22s} {size:>5}pt  {c:>5}:1 (need {need})  {text!r}")
    return 1


if __name__ == "__main__":
    sys.exit(audit(sys.argv[1]))
