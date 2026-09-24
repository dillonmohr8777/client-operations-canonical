// client-deck kit — brand-locked PowerPoint primitives.
//
// Visual language: editorial, not "cards on a grid". Full-bleed color panels that touch
// the slide edge, a wide type scale, figures set large against open space, hairline rules
// instead of boxes, and one recurring motif — the brand monogram, oversized and faded,
// bleeding off an edge.
//
// Everything is in inches. Colors are 6-digit hex WITHOUT '#' (pptxgenjs corrupts the
// file otherwise). One `new PptxGenJS()` per output file.

import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import PptxGenJS from "pptxgenjs";

const SKILL_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function choreograph(file, style) {
  // Role aware entrance choreography. The kit stamps every shape with role:<name>, and
  // the script turns those into native PowerPoint timing nodes: panels wipe in from the
  // edge they bleed off, figures pop, rules draw, copy rises. It edits the OOXML
  // directly, so it needs no PowerPoint install and runs on any platform.
  const script = path.join(SKILL_ROOT, "scripts", "choreograph.py");
  const args = [script, path.resolve(file), "--style", style, "--json"];
  return new Promise((resolve, reject) => {
    const child = spawn("python", args, { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "", stderr = "";
    child.stdout.on("data", (c) => { stdout += c; });
    child.stderr.on("data", (c) => { stderr += c; });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`choreography failed (${code}): ${stderr.trim() || stdout.trim()}`));
        return;
      }
      try { resolve(JSON.parse(stdout.trim().split(/\r?\n/).pop())); }
      catch { resolve(null); }
    });
  });
}

// Arial average advance width as a fraction of the point size. Deliberately generous so
// the estimate reserves more room rather than less.
const ADV = { regular: 0.52, bold: 0.55, boldCaps: 0.63, caps: 0.58 };

/** Estimated wrapped line count for `str` in a box `wIn` inches wide at `pt`. */
export function estLines(str, wIn, pt, bold = false) {
  if (!str) return 0;
  const caps = str === String(str).toUpperCase() && /[A-Z]/.test(str);
  const adv = bold ? (caps ? ADV.boldCaps : ADV.bold) : (caps ? ADV.caps : ADV.regular);
  const perLine = Math.max(6, Math.floor((wIn * 72) / (pt * adv)));
  return String(str).split("\n").reduce((n, para) => {
    const words = para.split(/\s+/).filter(Boolean);
    if (!words.length) return n + 1;
    let lines = 1, len = 0;
    for (const w of words) {
      const add = len ? w.length + 1 : w.length;
      if (len + add > perLine) { lines += 1; len = w.length; } else { len += add; }
    }
    return n + lines;
  }, 0);
}

/** Height in inches that `str` needs in a box `wIn` wide at `pt`. */
export function estHeight(str, wIn, pt, { bold = false, spacing = 1.2, pad = 0.06 } = {}) {
  return estLines(str, wIn, pt, bold) * (pt * spacing) / 72 + pad;
}

export function loadBrand(id) {
  const p = path.join(SKILL_ROOT, "brands", `${id}.json`);
  const b = JSON.parse(fs.readFileSync(p, "utf8"));
  for (const k of ["light", "dark", "mark", "markDark"]) {
    if (b.logo?.[k]) b.logo[k] = path.join(SKILL_ROOT, b.logo[k]);
  }
  return b;
}

export class Deck {
  constructor(brandId, { title, author, subject, animationStyle = "bold" } = {}) {
    this.b = typeof brandId === "string" ? loadBrand(brandId) : brandId;
    const L = this.b.layout;
    this.W = L.w; this.H = L.h; this.M = L.margin; this.GAP = L.gap; this.GAPW = L.gapWide;
    this.CW = this.W - this.M * 2;
    this.BOT = this.H - this.M + 0.06;   // content floor; the page number sits below it
    this.C = this.b.color;
    this.T = this.b.type;
    this.F = this.T.face;
    this.n = 0;
    this.warnings = [];
    this.animationStyle = animationStyle;

    this.p = new PptxGenJS();
    this.p.defineLayout({ name: "BRAND", width: this.W, height: this.H });
    this.p.layout = "BRAND";
    this.p.title = title ?? `${this.b.name} deck`;
    this.p.author = author ?? this.b.name;
    this.p.subject = subject ?? "";
    this.p.company = this.b.name;
  }

  // ───────────────────────────────────────────────────────────── atoms

  text(s, str, { x, y, w, h, size = this.T.body, color = this.C.ink, bold = false,
                 align = "left", valign = "top", italic = false, charSpacing,
                 lineSpacingMultiple, wrap = true, role = "body" } = {}) {
    // A text box with h <= 0 makes PowerPoint refuse the whole presentation, while
    // python-pptx and the XSD both accept it. Never let one through.
    if (!(h > 0.08)) {
      this.warnings.push(`clamped text height ${Number(h).toFixed(2)}" for: ${String(str).slice(0, 44)}`);
      h = 0.2;
    }
    const o = {
      x, y, w, h, isTextBox: true, margin: 0, fontFace: this.F, fontSize: size,
      color, bold, italic, align, valign, wrap, objectName: `role:${role}`,
    };
    if (charSpacing !== undefined) o.charSpacing = charSpacing;
    if (lineSpacingMultiple !== undefined) o.lineSpacingMultiple = lineSpacingMultiple;
    s.addText(str, o);
    return s;
  }

  /** Auto-height text. Returns the y the next element should start at. */
  flow(s, str, { x, y, w, size = this.T.body, spacing = 1.2, gapAfter = 0.1, ...rest }) {
    const h = estHeight(str, w, size, { bold: rest.bold, spacing, pad: 0.07 });
    this.text(s, str, { x, y, w, h, size, lineSpacingMultiple: spacing, ...rest });
    return y + h + gapAfter;
  }

  rect(s, { x, y, w, h, fill, r = 0, line, lineWidth = 1, role = "block" }) {
    s.addShape(r ? this.p.ShapeType.roundRect : this.p.ShapeType.rect, {
      x, y, w, h, objectName: `role:${role}`,
      fill: fill ? { color: fill } : { type: "solid", color: "FFFFFF", transparency: 100 },
      line: line ? { color: line, width: lineWidth } : { width: 0 },
      ...(r ? { rectRadius: r } : {}),
    });
    return s;
  }

  /** Hairline rule. Used between list rows and columns only, never under a title. */
  hair(s, { x, y, w, color, weight = 0.75, role = "rule-h" }) {
    s.addShape(this.p.ShapeType.line, {
      x, y, w, h: 0, line: { color: color ?? this.C.hair, width: weight },
      objectName: `role:${role}`,
    });
    return s;
  }

  vrule(s, { x, y, h, color, weight = 0.75, role = "rule-v" }) {
    s.addShape(this.p.ShapeType.line, {
      x, y, w: 0, h, line: { color: color ?? this.C.line, width: weight },
      objectName: `role:${role}`,
    });
    return s;
  }

  /** Full-bleed color region anchored to a slide edge. */
  panel(s, { side = "left", size, fill, from = 0, to }) {
    const end = to ?? (side === "left" || side === "right" ? this.H : this.W);
    const role = `panel-${side}`;
    if (side === "left")   return this.rect(s, { x: 0, y: from, w: size, h: end - from, fill, role });
    if (side === "right")  return this.rect(s, { x: this.W - size, y: from, w: size, h: end - from, fill, role });
    if (side === "top")    return this.rect(s, { x: from, y: 0, w: end - from, h: size, fill, role });
    return this.rect(s, { x: from, y: this.H - size, w: end - from, h: size, fill, role });
  }

  /** The motif: the brand monogram, oversized and faded, bleeding off an edge. */
  mark(s, { x, y, w, dark = false, transparency = 88 }) {
    const src = dark ? this.b.logo.markDark : this.b.logo.mark;
    if (!src) return s;
    s.addImage({ path: src, x, y, w, h: w / this.b.logo.markAspect, transparency,
                 altText: "", objectName: "role:motif" });
    return s;
  }

  logo(s, { dark = false, x, y, w } = {}) {
    const width = w ?? this.b.logo.markWidth;
    s.addImage({
      path: dark ? this.b.logo.dark : this.b.logo.light,
      x: x ?? this.W - this.M - width,
      y: y ?? this.M - 0.06,
      w: width, h: width / this.b.logo.aspect,
      altText: `${this.b.name} logo`, objectName: "role:logo",
    });
    return s;
  }

  pageNo(s, { dark = false } = {}) {
    this.n += 1;
    this.text(s, String(this.n).padStart(2, "0"), {
      x: this.W - this.M - 0.6, y: this.H - 0.46, w: 0.6, h: 0.24,
      size: this.T.caption, color: dark ? this.C.navyEdge : this.C.hair,
      bold: true, align: "right", charSpacing: 1, role: "static",
    });
    return s;
  }

  kicker(s, str, { x, y, w, dark = false, color, role = "kicker" }) {
    this.text(s, str.toUpperCase(), {
      x, y, w, h: 0.22, size: this.T.kicker, role,
      color: color ?? (dark ? this.C.blueLift : this.C.blue),
      bold: true, charSpacing: 2.4,
    });
    return y + 0.36;
  }

  // ───────────────────────────────────────────────────────────── slide shells

  /** Editorial opener: navy full bleed, oversized monogram bleeding off the right. */
  title({ kicker, title, sub, foot }) {
    const s = this.p.addSlide();
    s.background = { color: this.C.navy };
    this.rect(s, { x: 7.75, y: 0, w: this.W - 7.75, h: this.H, fill: this.C.navyLift,
                   role: "panel-right" });
    this.mark(s, { x: 9.5, y: 1.15, w: 6.4, dark: true, transparency: 90 });
    this.logo(s, { dark: true, x: this.M, y: 0.72, w: this.b.logo.titleWidth });

    let y = 1.98;
    if (kicker) y = this.kicker(s, kicker, { x: this.M, y, w: 6.6, dark: true });
    y = this.flow(s, title, {
      x: this.M, y, w: 6.9, size: this.T.display, color: this.C.onDark, role: "display",
      bold: true, spacing: 1.0, gapAfter: 0.46,
    });
    if (sub) {
      this.fit("title sub", y + estHeight(sub, 6.4, this.T.h2 - 6, { spacing: 1.32 }), this.H - 1.24);
      this.flow(s, sub, {
        x: this.M, y, w: 6.4, size: this.T.h2 - 6, color: this.C.onDarkSoft, spacing: 1.32,
        role: "sub",
      });
    }
    if (foot) {
      this.text(s, foot, {
        x: this.M, y: this.H - 0.92, w: 7.0, h: 0.26, size: this.T.caption + 0.5,
        color: this.C.onDarkSoft, bold: true, charSpacing: 1.2, role: "foot",
      });
    }
    return s;
  }

  /** Act divider: a giant ghosted numeral behind the section title. */
  section({ num, kicker, title, sub }) {
    const s = this.p.addSlide();
    s.background = { color: this.C.navy };
    this.text(s, String(num).padStart(2, "0"), {
      x: 4.9, y: 0.55, w: 8.9, h: 7.6, size: 430, color: this.C.navyLift,
      bold: true, align: "right", lineSpacingMultiple: 1, role: "numeral",
    });
    this.logo(s, { dark: true });
    let y = 3.35;
    y = this.kicker(s, kicker, { x: this.M, y, w: 7.4, dark: true });
    y = this.flow(s, title, {
      x: this.M, y, w: 8.2, size: this.T.h1 + 5, color: this.C.onDark, role: "title",
      bold: true, spacing: 1.02, gapAfter: 0.28,
    });
    if (sub) {
      this.flow(s, sub, {
        x: this.M, y, w: 7.4, size: this.T.body + 1, color: this.C.onDarkSoft, spacing: 1.3,
        role: "sub",
      });
    }
    return s;
  }

  /**
   * Standard slide. `panel` optionally bleeds a color region off one edge:
   *   panel: { side: "left", size: 4.6, fill: C.navy }
   * Sets `_top` to the first free y under the title block.
   */
  slide({ kicker, title, sub, dark = false, panel, motif, titleW, titleX, logoDark } = {}) {
    const s = this.p.addSlide();
    s.background = { color: dark ? this.C.navy : this.C.paper };
    if (panel) this.panel(s, panel);
    if (motif) this.mark(s, motif);
    this.logo(s, { dark: logoDark ?? dark });
    const tx = titleX ?? this.M;
    let y = this.M - 0.06;
    if (kicker) y = this.kicker(s, kicker, { x: tx, y, w: this.CW - 2.2, dark });
    if (title) {
      y = this.flow(s, title, {
        x: tx, y, w: titleW ?? this.CW - 2.4, size: this.T.h1, role: "title",
        color: dark ? this.C.onDark : this.C.ink, bold: true, spacing: 1.02, gapAfter: 0.16,
      });
    }
    if (sub) {
      y = this.flow(s, sub, {
        x: tx, y, w: Math.min(titleW ?? this.CW, 8.8), size: this.T.h2 - 7, role: "sub",
        color: dark ? this.C.onDarkSoft : this.C.slate, spacing: 1.28, gapAfter: 0.3,
      });
    }
    s._top = y + 0.14;
    this.pageNo(s, { dark });
    return s;
  }

  // ───────────────────────────────────────────────────────────── content blocks

  /** A figure. The label and any sub flow beneath it. Returns the y just past the block. */
  stat(s, { x, y, w, value, label, sub, color, size, dark = false, align = "left", labelColor }) {
    const fs = size ?? this.T.stat;
    let cy = this.flow(s, value, {
      x, y, w, size: fs, color: color ?? this.C.blue, bold: true, role: "figure",
      spacing: 1.0, gapAfter: 0.06, align,
    });
    if (label) {
      cy = this.flow(s, label, {
        x, y: cy, w, size: this.T.statLabel, bold: true, align, role: "figure-label",
        color: labelColor ?? (dark ? this.C.onDark : this.C.ink), spacing: 1.2, gapAfter: 0.07,
      });
    }
    if (sub) {
      cy = this.flow(s, sub, {
        x, y: cy, w, size: this.T.caption, align, role: "figure-label",
        color: dark ? this.C.onDarkSoft : this.C.slate, spacing: 1.2, gapAfter: 0,
      });
    }
    return cy;
  }

  /** Row of figures separated by hairlines rather than boxed in cards. */
  statRow(s, items, { y, dark = false, size, rules = true, height, x, w, bottom }) {
    const bx = x ?? this.M, bw = w ?? this.CW;
    const cw = bw / items.length;
    const iw = cw - 0.56;
    const fs = size ?? this.T.stat;
    const vH = Math.max(...items.map((it) => estHeight(it.value, iw, fs, { bold: true, spacing: 1.0, pad: 0.04 })));
    const lH = Math.max(...items.map((it) => (it.label ? estHeight(it.label, iw, this.T.statLabel, { bold: true, spacing: 1.2 }) : 0)));
    const sH = Math.max(...items.map((it) => (it.sub ? estHeight(it.sub, iw, this.T.caption, { spacing: 1.2 }) : 0)));
    const labelY = y + vH + 0.06;
    const subY = labelY + lH + 0.07;
    const bottomY = subY + sH;
    items.forEach((it, i) => {
      const cx = bx + i * cw;
      if (rules && i > 0) {
        this.vrule(s, {
          x: cx - 0.26, y, h: height ?? (bottomY - y + 0.12),
          color: dark ? this.C.lineDark : this.C.line,
        });
      }
      this.text(s, it.value, {
        x: cx, y, w: iw, h: vH, size: fs, color: it.color ?? this.C.blue,
        bold: true, lineSpacingMultiple: 1.0, role: "figure",
      });
      if (it.label) {
        this.text(s, it.label, {
          x: cx, y: labelY, w: iw, h: lH, size: this.T.statLabel, bold: true,
          color: dark ? this.C.onDark : this.C.ink, lineSpacingMultiple: 1.2,
          role: "figure-label",
        });
      }
      if (it.sub) {
        this.text(s, it.sub, {
          x: cx, y: subY, w: iw, h: sH, size: this.T.caption,
          color: dark ? this.C.onDarkSoft : this.C.slate, lineSpacingMultiple: 1.2,
          role: "figure-label",
        });
      }
    });
    if (bottom !== undefined) this.fit("statRow", bottomY, bottom);
    return bottomY;
  }

  /** Editorial list. Items are { head, body }. Rows separated by hairlines, not boxes. */
  rows(s, items, { x, y, w, dark = false, headW, headSize, bodySize, gap = 0.22, rule = true, bottom }) {
    const hw = headW ?? Math.min(3.7, w * 0.34);
    const bw = w - hw - 0.45;
    const hs = headSize ?? this.T.bodySm + 3;
    const bs = bodySize ?? this.T.bodySm;
    let cy = y;
    items.forEach((raw, i) => {
      const it = typeof raw === "string" ? { head: raw } : raw;
      const hh = estHeight(it.head, hw, hs, { bold: true, spacing: 1.12 });
      const bh = it.body ? estHeight(it.body, bw, bs, { spacing: 1.28 }) : 0;
      const rowH = Math.max(hh, bh);
      this.text(s, it.head, {
        x, y: cy, w: hw, h: hh, size: hs, bold: true, role: "row-head",
        color: dark ? this.C.onDark : this.C.ink, lineSpacingMultiple: 1.1,
      });
      if (it.body) {
        this.text(s, it.body, {
          x: x + hw + 0.45, y: cy, w: bw, h: bh, size: bs, role: "row-body",
          color: dark ? this.C.onDarkSoft : this.C.slate, lineSpacingMultiple: 1.28,
        });
      }
      cy += rowH + gap;
      if (rule && i < items.length - 1) {
        this.hair(s, { x, y: cy - gap / 2, w, color: dark ? this.C.lineDark : this.C.line });
      }
    });
    const end = cy - gap;
    if (bottom !== undefined) this.fit("rows", end, bottom);
    return end;
  }

  /** Compact bulleted list. Used inside panels, never as a whole-slide layout. */
  bullets(s, items, { x, y, w, h, size, color, dark = false, bottom }) {
    const fs = size ?? this.T.bodySm;
    const need = items.reduce((t, b) => t + estHeight(b, w - 0.18, fs, { spacing: 1.24, pad: 0.09 }), 0);
    if (h !== undefined) this.fit("bullets", need, h);
    if (bottom !== undefined) this.fit("bullets", y + need, bottom);
    s.addText(
      items.map((t, i) => ({
        text: t,
        options: { bullet: { code: "2022" }, breakLine: i !== items.length - 1 },
      })),
      {
        x, y, w, h: Math.max(h ?? need, 0.26), isTextBox: true, margin: 0, fontFace: this.F,
        fontSize: fs, color: color ?? (dark ? this.C.onDarkSoft : this.C.slate),
        paraSpaceAfter: 7, lineSpacingMultiple: 1.24, valign: "top",
      },
    );
    return y + need;
  }

  /**
   * Eyebrow + head + body. Flat fill, no border and no edge stripe. Use sparingly — the
   * default layout language here is rules and open space, not boxes.
   */
  block(s, { x, y, w, h, eyebrow, head, body, bullets, fill, dark = false,
             headSize, headH, bodySize, pad = 0.36 }) {
    if (fill) this.rect(s, { x, y, w, h, fill });
    const px = fill ? pad : 0;
    const iw = w - px * 2;
    let cy = y + (fill ? pad - 0.08 : 0);
    if (eyebrow) cy = this.kicker(s, eyebrow, { x: x + px, y: cy, w: iw, dark });
    if (head) {
      const hs = headSize ?? this.T.sectionHead;
      const hh = headH ?? estHeight(head, iw, hs, { bold: true, spacing: 1.08 });
      this.text(s, head, {
        x: x + px, y: cy, w: iw, h: hh, size: hs,
        color: dark ? this.C.onDark : this.C.ink, bold: true, lineSpacingMultiple: 1.05,
      });
      cy += hh + 0.16;
    }
    const bs = bodySize ?? this.T.bodySm;
    const avail = y + h - cy - (fill ? pad : 0) + 0.08;
    if (body) {
      this.fit(`block "${head ?? eyebrow ?? ""}"`, estHeight(body, iw, bs, { spacing: 1.3 }), avail);
      this.text(s, body, {
        x: x + px, y: cy, w: iw, h: Math.max(avail, 0.26), size: bs,
        color: dark ? this.C.onDarkSoft : this.C.slate, lineSpacingMultiple: 1.3,
      });
    }
    if (bullets) this.bullets(s, bullets, { x: x + px, y: cy, w: iw, h: avail, size: bs, dark });
    return s;
  }

  /** Numbered process flow, separated by hairlines rather than boxed. */
  steps(s, items, { y, dark = false, x, w, height = 1.9, bottom }) {
    const bx = x ?? this.M, bw = w ?? this.CW;
    const cw = bw / items.length;
    let low = y;
    items.forEach((it, i) => {
      const cx = bx + i * cw;
      if (i > 0) {
        this.vrule(s, { x: cx - 0.28, y, h: height, color: dark ? this.C.lineDark : this.C.line });
      }
      const iw = cw - 0.6;
      this.text(s, String(i + 1).padStart(2, "0"), {
        x: cx, y, w: iw, h: 0.32, size: 15, color: this.C.blue, bold: true, charSpacing: 1,
        role: "step-num",
      });
      let cy = this.flow(s, it.head, {
        x: cx, y: y + 0.46, w: iw, size: this.T.bodySm + 2.5, bold: true, role: "step-head",
        color: dark ? this.C.onDark : this.C.ink, spacing: 1.1, gapAfter: 0.12,
      });
      low = Math.max(low, this.flow(s, it.body, {
        x: cx, y: cy, w: iw, size: this.T.caption,
        color: dark ? this.C.onDarkSoft : this.C.slate, spacing: 1.26, gapAfter: 0,
      }));
    });
    if (bottom !== undefined) this.fit("steps", low, bottom);
    return low;
  }

  table(s, rows, { x, y, w, colW, fontSize, rowH = 0.34, dark = false }) {
    const body = rows.map((r, ri) =>
      r.map((cell) => ({
        text: String(cell),
        options: {
          bold: ri === 0,
          color: ri === 0 ? this.C.onDark : (dark ? this.C.onDarkSoft : this.C.ink),
          fill: ri === 0 ? { color: this.C.navy } : { color: ri % 2 ? this.C.paper : this.C.tint },
        },
      })),
    );
    s.addTable(body, {
      x, y, w, colW, rowH,
      fontFace: this.F, fontSize: fontSize ?? this.T.bodySm,
      border: [
        { type: "none" }, { type: "none" },
        { type: "solid", color: dark ? this.C.lineDark : this.C.line, pt: 0.5 }, { type: "none" },
      ],
      align: "left", valign: "middle", margin: [0.06, 0.16, 0.06, 0.16], autoPage: false,
    });
    return s;
  }

  /**
   * Case study. A navy band across the top carries the client and the hero figure; the
   * supporting figures and the before/after narrative sit on white below. No boxes.
   */
  caseStudy(s, { client, industry, hero, stats, before, after, note }) {
    const bandH = 3.16;
    this.rect(s, { x: 0, y: 0, w: this.W, h: bandH, fill: this.C.navy, role: "panel-top" });
    this.mark(s, { x: 9.55, y: -1.3, w: 4.8, dark: true, transparency: 91 });
    this.logo(s, { dark: true, y: 0.55 });

    let y = this.kicker(s, "Case study", { x: this.M, y: 0.6, w: 6.0, dark: true });
    y = this.flow(s, client, {
      x: this.M, y, w: 6.5, size: this.T.h1 - 5, color: this.C.onDark, role: "title",
      bold: true, spacing: 1.02, gapAfter: 0.14,
    });
    const endY = this.flow(s, industry, {
      x: this.M, y, w: 6.3, size: this.T.bodySm, color: this.C.onDarkSoft, spacing: 1.26,
    });
    this.fit(`caseStudy "${client.replace(/\n/g, " ")}" band`, endY, bandH - 0.14);

    this.text(s, hero.value, {
      x: 7.2, y: 1.16, w: 5.35, h: 1.24, size: this.T.statHero, color: this.C.blueLift,
      bold: true, align: "right", lineSpacingMultiple: 0.95, role: "hero",
    });
    this.flow(s, hero.label, {
      x: 7.2, y: 2.44, w: 5.35, size: this.T.statLabel, color: this.C.onDark,
      bold: true, align: "right", spacing: 1.2, role: "figure-label",
    });

    const statsBottom = this.statRow(s, stats, { y: bandH + 0.34, size: this.T.stat - 9 });

    const ny = statsBottom + 0.26;
    this.hair(s, { x: this.M, y: ny - 0.2, w: this.CW, color: this.C.line });
    const colW = (this.CW - this.GAPW) / 2;
    [[before, "Before"], [after, "What changed"]].forEach(([blk, lbl], i) => {
      const cx = this.M + i * (colW + this.GAPW);
      let cy = this.kicker(s, lbl, { x: cx, y: ny, w: colW });
      cy = this.flow(s, blk.head, {
        x: cx, y: cy, w: colW, size: this.T.sectionHead - 2, bold: true,
        color: this.C.ink, spacing: 1.08, gapAfter: 0.12,
      });
      this.bullets(s, blk.items, {
        x: cx, y: cy, w: colW, size: 11.5, bottom: this.BOT,
      });
    });
    if (note) {
      this.text(s, note, {
        x: this.M, y: this.H - 0.62, w: this.CW - 0.9, h: 0.36, size: this.T.caption - 1,
        color: this.C.slate, italic: true, lineSpacingMultiple: 1.2,
      });
    }
    this.pageNo(s);
    return s;
  }

  /** Pricing column. Typographic, separated by hairlines; the accent one gets a fill. */
  priceCol(s, { x, y, w, h, name, sub, price, term, features, footnote, accent = false,
                rule = true, nameH, subH }) {
    if (accent) this.rect(s, { x: x - 0.4, y: y - 0.3, w: w + 0.8, h: h + 0.66, fill: this.C.navy });
    else if (rule) this.vrule(s, { x: x - 0.42, y: y - 0.1, h: h + 0.4, color: this.C.line });
    const onDark = accent;
    const nh = nameH ?? estHeight(name, w, this.T.bodySm + 3.5, { bold: true, spacing: 1.1, pad: 0.07 });
    this.text(s, name, {
      x, y, w, h: nh, size: this.T.bodySm + 3.5, bold: true,
      color: onDark ? this.C.onDark : this.C.ink, lineSpacingMultiple: 1.1,
    });
    const sh = subH ?? estHeight(sub, w, this.T.caption, { spacing: 1.2, pad: 0.07 });
    this.text(s, sub, {
      x, y: y + nh + 0.05, w, h: sh, size: this.T.caption,
      color: onDark ? this.C.onDarkSoft : this.C.slate, lineSpacingMultiple: 1.2,
    });
    let cy = y + nh + 0.05 + sh + 0.18;
    cy = this.flow(s, price, {
      x, y: cy, w, size: 30, bold: true, role: "figure",
      color: onDark ? this.C.blueLift : this.C.blue, spacing: 1.0, gapAfter: 0.04,
    });
    cy = this.flow(s, term, {
      x, y: cy, w, size: this.T.caption, color: onDark ? this.C.onDarkSoft : this.C.slate,
      spacing: 1.2, gapAfter: 0.22,
    });
    this.hair(s, { x, y: cy - 0.15, w, color: onDark ? this.C.lineDark : this.C.line });
    this.bullets(s, features, {
      x, y: cy, w, size: this.T.caption - 0.5,
      color: onDark ? this.C.onDarkSoft : this.C.slate,
      bottom: y + h - (footnote ? 0.44 : 0),
    });
    if (footnote) {
      this.text(s, footnote, {
        x, y: y + h - 0.3, w, h: 0.3, size: this.T.caption - 1, italic: true,
        color: onDark ? this.C.onDarkSoft : this.C.slate,
      });
    }
    return s;
  }

  /** Footnote pinned under the content floor. */
  foot(s, str, { dark = false, w } = {}) {
    this.text(s, str, {
      x: this.M, y: this.H - 0.5, w: w ?? this.CW - 0.9, h: 0.26, role: "foot",
      size: this.T.caption - 1, color: dark ? this.C.onDarkSoft : this.C.slateSoft, italic: true,
    });
    return s;
  }

  fit(what, need, avail) {
    if (need > avail - 0.02) {
      this.warnings.push(`${what}: needs ${need.toFixed(2)}" but has ${avail.toFixed(2)}"`);
    }
    return avail;
  }

  notes(s, body, sources = []) {
    s.addNotes(`${body}\n\n[Sources]\n${sources.length ? sources.join("\n") : "Client source material."}\n[/Sources]`);
    return s;
  }

  async save(file, { animate = true, animationStyle = this.animationStyle } = {}) {
    await this.p.writeFile({ fileName: file });
    if (animate && animationStyle !== "none") {
      const receipt = await choreograph(file, animationStyle);
      if (receipt) {
        console.log(`choreographed ${receipt.slides} slides with ${receipt.effects} entrance effects (${receipt.style})`);
      }
    }
    if (this.warnings.length) {
      console.warn(`\n${this.warnings.length} fit warning(s) — these become visible clipping:`);
      for (const w of this.warnings) console.warn(`  · ${w}`);
      console.warn("");
    }
    return file;
  }
}

export default Deck;
