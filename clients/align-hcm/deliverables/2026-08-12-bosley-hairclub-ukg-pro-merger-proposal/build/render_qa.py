"""Rasterize a .pptx with PIL for visual QA.

LibreOffice is not functional in this sandbox, so this walks the real shape tree
of the built file and draws it. Font metrics are approximated: Calibri is mapped
to Liberation Sans and Cambria to Liberation Serif, both of which run WIDER than
their Office counterparts. Text that fits here therefore also fits in PowerPoint
— overflow flagged by this renderer is a conservative (pessimistic) signal.
"""

import sys, os, math
from PIL import Image, ImageDraw, ImageFont
from pptx import Presentation
from pptx.util import Emu
from pptx.enum.shapes import MSO_SHAPE_TYPE
from pptx.oxml.ns import qn

DPI = 110
SANS = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
SANS_B = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
SANS_I = "/usr/share/fonts/truetype/liberation/LiberationSans-Italic.ttf"
SERIF = "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf"
SERIF_B = "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf"
_cache = {}
OVERFLOW = []


def font(name, size_pt, bold, italic):
    serif = (name or "").lower().startswith(("cambria", "times", "georgia", "book"))
    if serif:
        path = SERIF_B if bold else SERIF
    else:
        path = SANS_B if bold else (SANS_I if italic else SANS)
    px = max(6, int(round(size_pt * DPI / 72.0)))
    key = (path, px)
    if key not in _cache:
        _cache[key] = ImageFont.truetype(path, px)
    return _cache[key]


def px(emu):
    return Emu(emu).inches * DPI


def wrap(draw, text, fnt, max_w):
    out = []
    for hard in text.split("\n"):
        if not hard:
            out.append("")
            continue
        words, line = hard.split(" "), ""
        for w in words:
            trial = w if not line else line + " " + w
            if draw.textlength(trial, font=fnt) <= max_w or not line:
                line = trial
            else:
                out.append(line)
                line = w
        out.append(line)
    return out


def rounded(dr, box, r, fill, outline=None, width=1):
    if r and r > 1:
        dr.rounded_rectangle(box, radius=r, fill=fill, outline=outline, width=width)
    else:
        dr.rectangle(box, fill=fill, outline=outline, width=width)


def shape_fill(shape):
    try:
        if shape.fill.type is not None and shape.fill.type == 1:
            return "#" + str(shape.fill.fore_color.rgb)
    except Exception:
        pass
    return None


def shape_line(shape):
    try:
        if shape.line.fill.type == 1:
            w = shape.line.width.pt if shape.line.width else 1
            return "#" + str(shape.line.color.rgb), max(1, int(w * DPI / 72))
    except Exception:
        pass
    return None, 0


def draw_text_frame(dr, tf, x, y, w, h, label):
    """Render paragraphs top-anchored (or middle when the frame says so)."""
    anchor = tf.vertical_anchor
    paras = []
    for p in tf.paragraphs:
        runs = [(r.text, r.font) for r in p.runs if r.text]
        if not runs:
            paras.append((p, [], 0))
            continue
        f0 = runs[0][1]
        size = f0.size.pt if f0.size else 12
        fnt = font(f0.name, size, bool(f0.bold), bool(f0.italic))
        text = "".join(t for t, _ in runs)
        lines = wrap(dr, text, fnt, w)
        ls = p.line_spacing if isinstance(p.line_spacing, float) else 1.0
        lh = size * DPI / 72.0 * 1.20 * ls
        paras.append((p, [(l, fnt, f0, lh) for l in lines], lh))

    total = 0
    for p, lines, lh in paras:
        total += len(lines) * lh
        if p.space_before:
            total += p.space_before.pt * DPI / 72.0
        if p.space_after:
            total += p.space_after.pt * DPI / 72.0

    cy = y + (h - total) / 2 if anchor == 3 else y  # 3 == MSO_ANCHOR.MIDDLE
    if total > h + 2:
        OVERFLOW.append((label, round(total - h, 1), round(w, 1)))

    for p, lines, lh in paras:
        if p.space_before:
            cy += p.space_before.pt * DPI / 72.0
        for text, fnt, f0, _lh in lines:
            tw = dr.textlength(text, font=fnt)
            al = p.alignment
            tx = x
            if al == 2:      # CENTER
                tx = x + (w - tw) / 2
            elif al == 3:    # RIGHT
                tx = x + w - tw
            col = "#333333"
            try:
                col = "#" + str(f0.color.rgb)
            except Exception:
                pass
            dr.text((tx, cy), text, font=fnt, fill=col)
            cy += lh
        if p.space_after:
            cy += p.space_after.pt * DPI / 72.0
    return total


def cell_fill(cell):
    try:
        if cell.fill.type == 1:
            return "#" + str(cell.fill.fore_color.rgb)
    except Exception:
        pass
    return None


def cell_borders(cell):
    """Read the real lnL/lnR/lnT/lnB off the cell rather than assuming a colour.

    Edge brightness is a deliberate design choice here, so the preview has to
    show what the file actually carries.
    """
    out = {}
    tcPr = cell._tc.find(qn("a:tcPr"))
    if tcPr is None:
        return out
    for edge in ("L", "R", "T", "B"):
        ln = tcPr.find(qn(f"a:ln{edge}"))
        if ln is None:
            continue
        clr = ln.find(f'{qn("a:solidFill")}/{qn("a:srgbClr")}')
        if clr is None:
            continue
        w_emu = int(ln.get("w", "12700"))
        out[edge] = ("#" + clr.get("val"), max(1, round(w_emu / 12700 * DPI / 72)))
    return out


def render(path, outdir):
    prs = Presentation(path)
    W = int(Emu(prs.slide_width).inches * DPI)
    H = int(Emu(prs.slide_height).inches * DPI)
    os.makedirs(outdir, exist_ok=True)
    made = []

    for idx, slide in enumerate(prs.slides, 1):
        img = Image.new("RGB", (W, H), "white")
        dr = ImageDraw.Draw(img)

        for shape in slide.shapes:
            x, y = px(shape.left), px(shape.top)
            w, h = px(shape.width), px(shape.height)
            box = [x, y, x + w, y + h]
            name = f"s{idx}:{shape.name}"

            if shape.shape_type == MSO_SHAPE_TYPE.PICTURE:
                try:
                    im = Image.open(shape.image.blob and __import__("io").BytesIO(shape.image.blob))
                    im = im.convert("RGBA").resize((max(1, int(w)), max(1, int(h))), Image.LANCZOS)
                    img.paste(im, (int(x), int(y)), im)
                except Exception as e:
                    print("  picture fail", name, e)
                continue

            if shape.has_table:
                tbl = shape.table
                col_x, cx = [], x
                for c in tbl.columns:
                    col_x.append(cx)
                    cx += px(c.width)
                row_y, cy = [], y
                for r in tbl.rows:
                    row_y.append(cy)
                    cy += px(r.height)
                for i, row in enumerate(tbl.rows):
                    for j, cell in enumerate(row.cells):
                        cw = px(tbl.columns[j].width)
                        chh = px(row.height)
                        x0, y0 = col_x[j], row_y[i]
                        x1, y1 = x0 + cw, y0 + chh
                        f = cell_fill(cell)
                        if f:
                            dr.rectangle([x0, y0, x1, y1], fill=f)
                        edges = cell_borders(cell)
                        for edge, (col, wid) in edges.items():
                            seg = {"L": [x0, y0, x0, y1], "R": [x1, y0, x1, y1],
                                   "T": [x0, y0, x1, y0], "B": [x0, y1, x1, y1]}[edge]
                            dr.line(seg, fill=col, width=wid)
                        ml = px(cell.margin_left) if cell.margin_left else 6
                        mt = px(cell.margin_top) if cell.margin_top else 4
                        draw_text_frame(dr, cell.text_frame,
                                        col_x[j] + ml, row_y[i] + mt,
                                        cw - 2 * ml, chh - 2 * mt,
                                        f"{name}[{i},{j}]")
                continue

            fill = shape_fill(shape)
            lcol, lw = shape_line(shape)
            if fill or lcol:
                try:
                    ast = str(shape.auto_shape_type)
                except Exception:
                    ast = ""
                if "OVAL" in ast:
                    dr.ellipse(box, fill=fill, outline=lcol, width=lw or 1)
                else:
                    r = 0
                    try:
                        if shape.adjustments and len(shape.adjustments):
                            r = shape.adjustments[0] * min(w, h)
                    except Exception:
                        r = 0
                    rounded(dr, box, r, fill, lcol, lw or 1)

            if shape.has_text_frame and shape.text_frame.text.strip():
                ml = px(shape.text_frame.margin_left)
                mt = px(shape.text_frame.margin_top)
                draw_text_frame(dr, shape.text_frame, x + ml, y + mt,
                                w - 2 * ml, h - 2 * mt, name)

        p = os.path.join(outdir, f"slide-{idx}.png")
        img.save(p)
        made.append(p)
        print("rendered", p)

    if OVERFLOW:
        print("\n--- POSSIBLE OVERFLOW (conservative; wider fonts than Office) ---")
        for lbl, over, wd in OVERFLOW:
            print(f"  {lbl}: text exceeds box height by ~{over}px (box w={wd}px)")
    else:
        print("\nno text overflow detected")
    return made


if __name__ == "__main__":
    render(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else "qa")
