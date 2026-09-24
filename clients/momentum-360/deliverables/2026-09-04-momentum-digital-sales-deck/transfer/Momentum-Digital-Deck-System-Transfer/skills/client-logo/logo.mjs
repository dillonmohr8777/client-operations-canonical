#!/usr/bin/env node
// client-logo: find a client's real logo, clean it up, and give it motion.
//
//   node logo.mjs pull    <domain>        --out DIR [--html FILE] [--asset URL]
//   node logo.mjs render  <file>          --out DIR
//   node logo.mjs animate <renderDir>     --out DIR [--style rise|wipe|split|sweep|stamp] [--seconds 2]
//   node logo.mjs kit     <domain>        --out DIR [--html FILE] [--asset URL] [--brand ID]
//
// Provenance is the point: assets come from the client's own domain, and every file is
// recorded in provenance.json with the URL it came from. No third party logo APIs, which
// serve stale and sometimes simply wrong marks.

import fs from "node:fs/promises";
import fss from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import sharp from "sharp";

const run = promisify(execFile);
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

// ─────────────────────────────────────────────────────────────── helpers

const args = process.argv.slice(2);
const cmd = args[0];
const positional = args.slice(1).filter((a) => !a.startsWith("--"));
function opt(name, fallback) {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : fallback;
}
const has = (name) => args.includes(`--${name}`);

const log = (...m) => console.log(...m);
const warn = (...m) => console.warn("  !", ...m);

function originOf(input) {
  const u = input.startsWith("http") ? input : `https://${input}`;
  return new URL(u);
}

async function getText(url) {
  const r = await fetch(url, { headers: { "user-agent": UA, accept: "text/html,*/*" }, redirect: "follow" });
  const body = await r.text();
  // SiteGround, Cloudflare and friends answer a scripted client with a tiny challenge
  // page. Detect it rather than parsing 200 bytes of meta refresh as a homepage.
  const blocked = body.length < 2000 &&
    /sgcaptcha|captcha|challenge|cf-browser-verification|Just a moment|Enable JavaScript/i.test(body);
  return { status: r.status, body, blocked };
}

async function getBinary(url) {
  const r = await fetch(url, { headers: { "user-agent": UA }, redirect: "follow" });
  if (!r.ok) throw new Error(`${r.status} for ${url}`);
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length < 400) throw new Error(`suspiciously small response (${buf.length} bytes) for ${url}`);
  return { buf, type: r.headers.get("content-type") || "" };
}

const hex = (r, g, b) => "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn;
  const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  let h;
  if (mx === r) h = ((g - b) / d + (g < b ? 6 : 0));
  else if (mx === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h / 6, s, l];
}

const luminance = (r, g, b) => {
  const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const contrast = (l1, l2) => (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

function shift(hexStr, amount) {
  const n = parseInt(hexStr.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) =>
    Math.max(0, Math.min(255, Math.round(amount > 0 ? v + (255 - v) * amount : v * (1 + amount)))));
  return hex(...c);
}

// ─────────────────────────────────────────────────────────────── pull

/**
 * Score every logo candidate in a page. Deliberately biased toward the header wordmark
 * and toward vector, and away from favicons, sprites and social share images (an og:image
 * is usually a marketing banner, not the mark).
 */
const unentity = (s) => s
  .replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">")
  .replace(/&quot;/gi, '"').replace(/&#0?39;/g, "'")
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#([0-9]+);/g, (_, d) => String.fromCodePoint(+d));

function discover(html, base) {
  // URLs come straight out of raw HTML, so "?w=585&amp;q=90" arrives escaped and 400s.
  const abs = (u) => { try { return new URL(unentity(u), base).href; } catch { return null; } };
  const out = [];
  const add = (url, score, why, extra = {}) => {
    const a = abs(url);
    if (!a || a.startsWith("data:")) return;
    out.push({ url: a, score, why, ...extra });
  };

  // <link rel="...icon"> including apple-touch-icon and mask-icon
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = m[0];
    const rel = (tag.match(/rel=["']([^"']+)/i) || [])[1] || "";
    const href = (tag.match(/href=["']([^"']+)/i) || [])[1];
    if (!href || !/icon/i.test(rel)) continue;
    const sizes = (tag.match(/sizes=["'](\d+)/i) || [])[1];
    const px = sizes ? parseInt(sizes, 10) : (/apple-touch/i.test(rel) ? 180 : 32);
    add(href, 24 + Math.min(px, 512) / 16, `link rel="${rel}"${sizes ? ` ${sizes}` : ""}`, { px });
  }

  // JSON-LD Organization.logo is the most explicit statement a site makes about its mark
  for (const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const walk = (node) => {
        if (!node || typeof node !== "object") return;
        if (Array.isArray(node)) return node.forEach(walk);
        const l = node.logo ?? node.image;
        if (typeof l === "string") add(l, 90, "JSON-LD logo");
        else if (l && typeof l === "object" && typeof l.url === "string") add(l.url, 90, "JSON-LD logo.url");
        Object.values(node).forEach(walk);
      };
      walk(JSON.parse(m[1].trim()));
    } catch { /* a malformed block is not worth failing the run over */ }
  }

  // web app manifest icons
  const manifest = (html.match(/<link[^>]+rel=["']manifest["'][^>]+href=["']([^"']+)/i) || [])[1];
  if (manifest) add(manifest, 1, "manifest (followed separately)", { manifest: true });

  // <img> tags, weighted by how much they look and sit like a logo
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = m[0];
    const src = (tag.match(/\bsrc=["']([^"']+)/i) || [])[1]
             || (tag.match(/\bdata-src=["']([^"']+)/i) || [])[1];
    if (!src) continue;
    const alt = (tag.match(/\balt=["']([^"']*)/i) || [])[1] || "";
    const cls = (tag.match(/\bclass=["']([^"']*)/i) || [])[1] || "";
    const w = parseInt((tag.match(/\bwidth=["']?(\d+)/i) || [])[1] || "0", 10);
    const hay = `${src} ${alt} ${cls}`.toLowerCase();
    let sc = 0;
    if (/logo|wordmark|brandmark/.test(hay)) sc += 70;
    if (/\.svg(\?|$)/i.test(src)) sc += 25;
    if (/header|navbar|nav-|site-|masthead/.test(hay)) sc += 15;
    if (/sprite|placeholder|lazy|blank|spacer|1x1/.test(hay)) sc -= 60;
    if (/footer/.test(hay)) sc -= 10;
    if (/badge|award|partner|client|review|trustindex|payment/.test(hay)) sc -= 45;
    if (w && w < 40) sc -= 25;
    // earlier in the document usually means the header
    sc += Math.max(0, 12 - Math.floor(m.index / (html.length / 12)));
    if (sc > 0) add(src, sc, `img alt="${alt.slice(0, 40)}"`);
  }

  // inline <svg> inside a header, saved as its own file
  const svgs = [];
  for (const m of html.matchAll(/<svg\b[\s\S]{40,20000}?<\/svg>/gi)) {
    const before = html.slice(Math.max(0, m.index - 400), m.index).toLowerCase();
    if (/logo|brand|header|navbar|masthead/.test(before) || /logo|brand/i.test(m[0].slice(0, 300))) {
      svgs.push(m[0]);
    }
  }

  const best = new Map();
  for (const c of out) {
    const prev = best.get(c.url);
    if (!prev || c.score > prev.score) best.set(c.url, c);
  }
  return { candidates: [...best.values()].sort((a, b) => b.score - a.score), inlineSvgs: svgs };
}

async function cmdPull(o = {}) {
  const target = o.target ?? positional[0];
  if (!target) throw new Error("usage: logo.mjs pull <domain> --out DIR");
  const out = o.out ?? opt("out", "brand-raw");
  const htmlFile = o.html ?? opt("html");
  const assetUrl = o.asset ?? opt("asset");
  await fs.mkdir(out, { recursive: true });
  const origin = originOf(target);
  const provenance = { source: origin.href, fetchedAt: new Date().toISOString(), assets: [] };

  if (assetUrl) {
    const url = assetUrl;
    const { buf } = await getBinary(url);
    const ext = path.extname(new URL(url).pathname) || ".png";
    const file = path.join(out, `source${ext}`);
    await fs.writeFile(file, buf);
    provenance.assets.push({ file: path.basename(file), url, why: "supplied with --asset" });
    await fs.writeFile(path.join(out, "provenance.json"), JSON.stringify(provenance, null, 2));
    log(`saved ${file} (${buf.length} bytes) from --asset`);
    return;
  }

  let html;
  if (htmlFile) {
    html = await fs.readFile(htmlFile, "utf8");
    provenance.htmlFrom = htmlFile;
    log(`reading page from ${htmlFile}`);
  } else {
    const r = await getText(origin.href);
    if (r.blocked || r.body.length < 2000) {
      throw new Error(
        `${origin.host} answered a scripted request with a bot challenge (${r.status}, ${r.body.length} bytes).\n` +
        `  Open it in the browser tool, save the HTML, and rerun with --html <file>.\n` +
        `  If you already know the logo URL, pass --asset <url> instead.`);
    }
    html = r.body;
  }

  const { candidates, inlineSvgs } = discover(html, origin.href);
  if (inlineSvgs.length) {
    const f = path.join(out, "inline-header.svg");
    await fs.writeFile(f, inlineSvgs[0]);
    provenance.assets.push({ file: "inline-header.svg", url: origin.href, why: "inline <svg> in the page header" });
    log(`saved inline header svg -> ${f}`);
  }
  if (!candidates.length && !inlineSvgs.length) throw new Error("no logo candidates found in the page");

  log(`${candidates.length} candidate(s):`);
  for (const c of candidates.slice(0, 8)) log(`  ${String(Math.round(c.score)).padStart(4)}  ${c.why}\n        ${c.url}`);

  let saved = 0, tried = 0;
  for (const c of candidates) {
    if (saved >= 4 || tried >= 10) break;
    if (c.manifest) continue;
    // Below this score a candidate is a content image, not a mark. Chasing every one of
    // them turns a single pull into a hundred failed requests.
    if (c.score < 20) continue;
    tried += 1;
    try {
      const { buf } = await getBinary(c.url);
      const ext = (path.extname(new URL(c.url).pathname) || ".png").split("?")[0];
      const name = `cand${saved + 1}${ext}`;
      await fs.writeFile(path.join(out, name), buf);
      provenance.assets.push({ file: name, url: c.url, why: c.why, score: Math.round(c.score) });
      log(`  saved ${name} (${buf.length} bytes)`);
      saved += 1;
    } catch (e) {
      warn(`skipped ${c.url}: ${e.message}`);
    }
  }
  if (!saved && !inlineSvgs.length) {
    throw new Error("every candidate download failed, most likely a bot wall on the asset host");
  }
  await fs.writeFile(path.join(out, "provenance.json"), JSON.stringify(provenance, null, 2));
  log(`\nwrote ${out}/provenance.json`);
  log("Look at the candidates and pass the best one to `render`.");
}

// ─────────────────────────────────────────────────────────────── render

/** Knock out a uniform background, trim to the ink, and report what was found. */
async function cleanUp(file) {
  const input = sharp(file, { density: 900 });   // density only matters for svg input
  const meta = await input.metadata();
  let img = sharp(await input.png().toBuffer()).ensureAlpha();
  let { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: CH } = info;

  // A logo saved as JPEG or a flattened PNG arrives on a solid ground. If all four
  // corners agree and the pixel is opaque, treat that color as the background.
  const at = (x, y) => { const i = (y * W + x) * CH; return [data[i], data[i + 1], data[i + 2], data[i + 3]]; };
  const corners = [at(0, 0), at(W - 1, 0), at(0, H - 1), at(W - 1, H - 1)];
  const same = corners.every((c) => c[3] > 250 && Math.abs(c[0] - corners[0][0]) < 8 &&
    Math.abs(c[1] - corners[0][1]) < 8 && Math.abs(c[2] - corners[0][2]) < 8);
  let knockedOut = null;
  if (same) {
    const [br, bg, bb] = corners[0];
    const tol = 26;
    for (let i = 0; i < data.length; i += CH) {
      const d = Math.abs(data[i] - br) + Math.abs(data[i + 1] - bg) + Math.abs(data[i + 2] - bb);
      if (d < tol * 3) data[i + 3] = 0;
    }
    knockedOut = hex(br, bg, bb);
  }

  // trim to the real ink box
  let minX = W, minY = H, maxX = -1, maxY = -1;
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      if (data[(y * W + x) * CH + 3] > 12) {
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) throw new Error("the image is fully transparent after background knockout");

  const trimmed = await sharp(data, { raw: { width: W, height: H, channels: CH } })
    .extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 })
    .png().toBuffer();

  return {
    buffer: trimmed,
    format: meta.format,
    original: { w: W, h: H },
    trimmedTo: { w: maxX - minX + 1, h: maxY - minY + 1 },
    knockedOut,
    isVector: meta.format === "svg",
  };
}

/** Rank the ink colors by how much brand signal they carry, not just by frequency. */
async function palette(buf) {
  const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
  const CH = info.channels;
  const bins = new Map();
  let inkLumSum = 0, inkCount = 0;
  for (let i = 0; i < data.length; i += CH) {
    if (data[i + 3] < 200) continue;
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    inkLumSum += luminance(r, g, b); inkCount += 1;
    const key = `${r >> 3},${g >> 3},${b >> 3}`;
    const e = bins.get(key) || { r: 0, g: 0, b: 0, n: 0 };
    e.r += r; e.g += g; e.b += b; e.n += 1;
    bins.set(key, e);
  }
  if (!inkCount) throw new Error("no opaque pixels to sample");
  const all = [...bins.values()].map((e) => {
    const r = Math.round(e.r / e.n), g = Math.round(e.g / e.n), b = Math.round(e.b / e.n);
    const [, s, l] = rgbToHsl(r, g, b);
    return { hex: hex(r, g, b), n: e.n, s, l };
  }).sort((a, b) => b.n - a.n);

  // The primary is the most-used color that actually carries hue. A logo that is pure
  // black or pure white has no brand color, and saying so is more useful than inventing
  // one from an antialiasing artifact.
  const chromatic = all.filter((c) => c.s > 0.18 && c.l > 0.12 && c.l < 0.92)
    .sort((a, b) => b.n * (0.5 + b.s) - a.n * (0.5 + a.s));
  return {
    primary: chromatic[0]?.hex ?? null,
    all: all.slice(0, 6).map((c) => ({ hex: c.hex, share: +(c.n / inkCount).toFixed(3) })),
    meanInkLuminance: inkLumSum / inkCount,
  };
}

/** Recolor every opaque pixel, keeping the antialiased edges intact. */
async function recolor(buf, hexColor) {
  const n = parseInt(hexColor.slice(1), 16);
  const [R, G, B] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += info.channels) {
    if (data[i + 3] === 0) continue;
    data[i] = R; data[i + 1] = G; data[i + 2] = B;
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } })
    .png().toBuffer();
}

/**
 * Split a horizontal lockup into its mark and its wordmark by finding the widest gap of
 * empty columns. Only returns a split when the gap is convincing, because guessing wrong
 * ships a cropped logo.
 */
async function splitLockup(buf) {
  const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: CH } = info;
  const ink = new Array(W).fill(false);
  for (let x = 0; x < W; x += 1) {
    for (let y = 0; y < H; y += 1) {
      if (data[(y * W + x) * CH + 3] > 12) { ink[x] = true; break; }
    }
  }
  const gaps = [];
  let runStart = -1;
  for (let x = 0; x <= W; x += 1) {
    if (x < W && !ink[x]) { if (runStart < 0) runStart = x; }
    else if (runStart >= 0) {
      if (runStart > 0 && x < W) gaps.push({ start: runStart, len: x - runStart });
      runStart = -1;
    }
  }
  if (gaps.length < 2) return null;
  const sorted = [...gaps].sort((a, b) => b.len - a.len);
  const best = sorted[0];
  // A lockup gap has to stand out from the letter spacing around it. Comparing against
  // the median of the other gaps beats a fixed fraction of the width, which either misses
  // tight lockups or splits an evenly spaced wordmark between two letters.
  const others = sorted.slice(1).map((g) => g.len).sort((a, b) => a - b);
  const median = others[Math.floor(others.length / 2)] || 0;
  if (best.len < Math.max(W * 0.02, median * 1.6)) return null;
  if (best.start < W * 0.08 || best.start > W * 0.62) return null;
  const mark = await sharp(buf).extract({ left: 0, top: 0, width: best.start, height: H }).png().toBuffer();
  const word = await sharp(buf)
    .extract({ left: best.start + best.len, top: 0, width: W - best.start - best.len, height: H })
    .png().toBuffer();
  return { mark, word, gap: best };
}

async function cmdRender(o = {}) {
  const src = o.src ?? positional[0];
  if (!src) throw new Error("usage: logo.mjs render <file> --out DIR");
  const out = o.out ?? opt("out", "brand");
  await fs.mkdir(out, { recursive: true });

  const clean = await cleanUp(src);
  const pal = await palette(clean.buffer);
  const { w, h } = clean.trimmedTo;

  await fs.writeFile(path.join(out, "logo.png"), clean.buffer);
  if (clean.isVector) await fs.copyFile(src, path.join(out, "logo.svg"));

  await fs.writeFile(path.join(out, "logo-white.png"), await recolor(clean.buffer, "#FFFFFF"));
  await fs.writeFile(path.join(out, "logo-ink.png"), await recolor(clean.buffer, "#0F151B"));

  const split = await splitLockup(clean.buffer);
  if (split) {
    await fs.writeFile(path.join(out, "mark.png"), split.mark);
    await fs.writeFile(path.join(out, "mark-white.png"), await recolor(split.mark, "#FFFFFF"));
    await fs.writeFile(path.join(out, "mark-ink.png"), await recolor(split.mark, "#0F151B"));
    await fs.writeFile(path.join(out, "wordmark.png"), split.word);
    await fs.writeFile(path.join(out, "wordmark-white.png"), await recolor(split.word, "#FFFFFF"));
    await fs.writeFile(path.join(out, "wordmark-ink.png"), await recolor(split.word, "#0F151B"));
  }

  // Deck and web sizes, from the widest source available so nothing is upscaled.
  const sizes = [2400, 1200, 600, 300];
  for (const s of sizes.filter((s) => s <= Math.max(w, 2400))) {
    await sharp(clean.isVector ? src : clean.buffer, { density: 900 })
      .resize({ width: s }).png().toFile(path.join(out, `logo-${s}.png`));
  }

  const lum = pal.meanInkLuminance;
  const onWhite = contrast(lum, 1.0);
  const onDark = contrast(lum, luminance(10, 24, 37));
  const report = {
    source: path.resolve(src),
    format: clean.format,
    originalPx: clean.original,
    trimmedPx: clean.trimmedTo,
    aspect: +(w / h).toFixed(4),
    backgroundKnockedOut: clean.knockedOut,
    palette: pal,
    lockup: split ? { markAspect: null, split: true } : { split: false },
    contrast: {
      onWhite: +onWhite.toFixed(2),
      onDarkNavy: +onDark.toFixed(2),
      needsKnockout: onDark < 3,
      needsInkVersion: onWhite < 3,
    },
    files: (await fs.readdir(out)).filter((f) => f.endsWith(".png") || f.endsWith(".svg")).sort(),
  };
  if (split) {
    const mm = await sharp(split.mark).metadata();
    report.lockup.markAspect = +(mm.width / mm.height).toFixed(4);
  }
  await fs.writeFile(path.join(out, "logo.json"), JSON.stringify(report, null, 2));

  log(`trimmed ${clean.original.w}x${clean.original.h} -> ${w}x${h}${clean.knockedOut ? `, knocked out ${clean.knockedOut}` : ""}`);
  log(`primary color ${pal.primary ?? "none (achromatic mark)"}`);
  log(`contrast on white ${onWhite.toFixed(2)}:1, on dark navy ${onDark.toFixed(2)}:1`);
  if (report.contrast.needsKnockout) warn("the full color mark disappears on dark. Use logo-white.png there.");
  if (report.contrast.needsInkVersion) warn("the full color mark disappears on white. Use logo-ink.png there.");
  if (split) log(`lockup split into mark.png and wordmark.png`);
  else log("no clean mark/wordmark split found, which is normal for a single word logo");
  log(`wrote ${out}/logo.json`);
}

// ─────────────────────────────────────────────────────────────── animate

const EASE = (t) => 1 - Math.pow(1 - t, 3);          // out-cubic
const EASE_IO = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - Math.pow(-2 * t + 2, 3) / 2);
// Out-back: overshoots slightly then settles. This is what reads as "pop" rather than
// "fade". Keep the overshoot small; a logo that bounces looks cheap.
const EASE_BACK = (t, s = 1.34) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);

/**
 * A soft white band used as a specular sweep. Composited onto the mark with blend
 * "atop", so it lights only the logo itself and never the background.
 */
async function sweepBand(height, width, hexColor) {
  // The band has to differ from the mark it crosses. On a dark ground the mark is
  // already white, so a white band would be invisible; the brand color is what reads.
  const n = parseInt(hexColor.slice(1), 16);
  const [R, G, B] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const data = Buffer.alloc(width * height * 4);
  for (let x = 0; x < width; x += 1) {
    const u = x / (width - 1);
    const a = Math.round(255 * Math.pow(Math.sin(Math.PI * u), 2));
    for (let y = 0; y < height; y += 1) {
      const i = (y * width + x) * 4;
      data[i] = R; data[i + 1] = G; data[i + 2] = B; data[i + 3] = a;
    }
  }
  return sharp(data, { raw: { width, height, channels: 4 } }).png().toBuffer();
}

async function alphaScaled(buf, factor) {
  if (factor >= 0.999) return buf;
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 3; i < data.length; i += info.channels) data[i] = Math.round(data[i] * factor);
  return sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } })
    .png().toBuffer();
}

async function cmdAnimate(o = {}) {
  const dir = o.dir ?? positional[0];
  if (!dir) throw new Error("usage: logo.mjs animate <renderDir> --out DIR");
  const out = o.out ?? opt("out", path.join(dir, "motion"));
  const style = o.style ?? opt("style", "rise");
  const seconds = parseFloat(o.seconds ?? opt("seconds", "2.2"));
  const onLightGround = o.light ?? has("light");
  const fps = 30;
  const W = 1920, H = 1080;
  const frames = Math.round(seconds * fps);
  await fs.mkdir(path.join(out, "frames"), { recursive: true });

  const meta = JSON.parse(await fs.readFile(path.join(dir, "logo.json"), "utf8"));
  const brand = meta.palette.primary || "#2A80C2";
  const ground = onLightGround ? "#FFFFFF" : shift(brand, -0.86);
  const onLight = ground.toUpperCase() === "#FFFFFF";
  const logoFile = path.join(dir, onLight ? "logo.png" : "logo-white.png");
  const markFile = path.join(dir, onLight ? "mark.png" : "mark-white.png");
  const wordFile = path.join(dir, onLight ? "wordmark.png" : "wordmark-white.png");
  const hasMark = fss.existsSync(markFile) && fss.existsSync(wordFile);

  const targetW = Math.round(W * 0.42);
  const logo = await sharp(logoFile).resize({ width: targetW }).png().toBuffer();
  const lm = await sharp(logo).metadata();
  const lx = Math.round((W - lm.width) / 2), ly = Math.round((H - lm.height) / 2);

  log(`style ${style}, ${frames} frames at ${fps}fps, ground ${ground}, brand ${brand}`);

  for (let f = 0; f < frames; f += 1) {
    const t = f / (frames - 1);
    const layers = [];

    if (style === "wipe") {
      // A brand-color bar sweeps across and leaves the mark behind it.
      const p = EASE_IO(Math.min(1, t / 0.78));
      const revealW = Math.max(1, Math.round(lm.width * p));
      layers.push({
        input: await sharp(logo).extract({ left: 0, top: 0, width: revealW, height: lm.height }).png().toBuffer(),
        left: lx, top: ly,
      });
      if (p < 1) {
        const barX = Math.min(W - 6, lx + revealW);
        layers.push({
          input: await sharp({ create: { width: 6, height: lm.height + 40, channels: 4, background: brand } }).png().toBuffer(),
          left: barX, top: ly - 20,
        });
      }
    } else if (style === "split" && hasMark) {
      // The monogram lands first, then the wordmark slides out from behind it.
      const markSrc = await sharp(markFile).resize({ height: lm.height }).png().toBuffer();
      const mm = await sharp(markSrc).metadata();
      const pa = Math.min(1, t / 0.45);
      const a = EASE(pa);
      const b = EASE(Math.max(0, (t - 0.35) / 0.65));
      const mx = Math.round(lx + (1 - EASE_BACK(pa)) * 90);
      layers.push({ input: await alphaScaled(markSrc, a), left: mx, top: ly });
      if (b > 0.01) {
        const wordSrc = await sharp(wordFile).resize({ height: lm.height }).png().toBuffer();
        const wm = await sharp(wordSrc).metadata();
        const clipW = Math.max(1, Math.round(wm.width * b));
        layers.push({
          input: await sharp(wordSrc).extract({ left: 0, top: 0, width: clipW, height: wm.height }).png().toBuffer(),
          left: lx + mm.width + Math.round(lm.width * 0.03), top: ly,
        });
      }
    } else if (style === "sweep") {
      // sweep: the mark settles, then a specular band travels across it. The band is
      // masked to the mark, so it lights the logo and never the ground.
      const p = Math.min(1, t / 0.42);
      const a = EASE(p);
      const scale = 0.955 + 0.045 * EASE_BACK(p);
      const scaled = await sharp(logo).resize({ width: Math.round(lm.width * scale) }).png().toBuffer();
      const sm = await sharp(scaled).metadata();
      let art = await alphaScaled(scaled, a);
      const g = (t - 0.34) / 0.56;
      if (g > 0 && g < 1) {
        const bw = Math.round(sm.width * 0.34);
        const band = await sweepBand(sm.height, bw, onLight ? brand : (meta.palette.primary || brand));
        const bx = Math.round(-bw + EASE_IO(g) * (sm.width + bw * 2));
        art = await sharp(art)
          .composite([{ input: band, left: bx, top: 0, blend: "atop" }])
          .png().toBuffer();
      }
      layers.push({
        input: art,
        left: Math.round((W - sm.width) / 2), top: Math.round((H - sm.height) / 2),
      });
    } else if (style === "stamp") {
      // stamp: the mark drops in from above and lands hard, then a brand rule snaps
      // out from the centre in both directions.
      const p = Math.min(1, t / 0.5);
      const e = EASE_BACK(p, 1.7);
      const drop = Math.round((1 - e) * 120);
      const scale = 1.05 - 0.05 * EASE(p);
      const scaled = await sharp(logo).resize({ width: Math.round(lm.width * scale) }).png().toBuffer();
      const sm = await sharp(scaled).metadata();
      layers.push({
        input: await alphaScaled(scaled, Math.min(1, p * 2.2)),
        left: Math.round((W - sm.width) / 2),
        top: Math.round((H - sm.height) / 2) - drop,
      });
      const r = EASE(Math.max(0, (t - 0.46) / 0.4));
      if (r > 0.01) {
        const rw = Math.max(2, Math.round(lm.width * 0.5 * r));
        layers.push({
          input: await sharp({ create: { width: rw, height: 5, channels: 4, background: brand } }).png().toBuffer(),
          left: Math.round((W - rw) / 2), top: ly + lm.height + 48,
        });
      }
    } else {
      // rise: the mark scales up and settles just past its size, with a brand rule
      // drawing underneath it.
      const p = Math.min(1, t / 0.62);
      const a = EASE(p);
      const scale = 0.94 + 0.06 * EASE_BACK(p);
      const scaled = await sharp(logo).resize({ width: Math.round(lm.width * scale) }).png().toBuffer();
      const sm = await sharp(scaled).metadata();
      const rise = Math.round((1 - a) * 26);
      layers.push({
        input: await alphaScaled(scaled, a),
        left: Math.round((W - sm.width) / 2), top: Math.round((H - sm.height) / 2) + rise,
      });
      const r = EASE(Math.max(0, (t - 0.42) / 0.58));
      if (r > 0.01) {
        const rw = Math.max(2, Math.round(lm.width * 0.42 * r));
        layers.push({
          input: await sharp({ create: { width: rw, height: 4, channels: 4, background: brand } }).png().toBuffer(),
          left: Math.round((W - rw) / 2), top: ly + lm.height + 46,
        });
      }
    }

    await sharp({ create: { width: W, height: H, channels: 4, background: ground } })
      .composite(layers).png()
      .toFile(path.join(out, "frames", `f${String(f).padStart(4, "0")}.png`));
  }

  const pattern = path.join(out, "frames", "f%04d.png");
  const mp4 = path.join(out, `logo-${style}.mp4`);
  await run("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(fps), "-i", pattern,
    "-vf", "format=yuv420p", "-c:v", "libx264", "-crf", "17", "-movflags", "+faststart", mp4]);
  const webm = path.join(out, `logo-${style}-alpha.webm`);
  await run("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(fps), "-i", pattern,
    "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-crf", "24", "-b:v", "0", webm]);
  const gif = path.join(out, `logo-${style}.gif`);
  await run("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(fps), "-i", pattern,
    "-vf", "fps=20,scale=800:-1:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse", gif]);

  // A CSS version, for a site header or an email, that needs no video file at all.
  const b64 = (await fs.readFile(logoFile)).toString("base64");
  const html = `<title>Logo motion</title>
<style>
  :root { color-scheme: light dark; }
  body { margin:0; min-height:100vh; display:grid; place-items:center; background:${ground}; }
  .stage { text-align:center; }
  .logo { width:min(42vw,620px); display:block;
          animation: rise 900ms cubic-bezier(.22,.8,.28,1) both; }
  .rule { height:4px; width:0; background:${brand}; margin:46px auto 0;
          animation: draw 700ms cubic-bezier(.22,.8,.28,1) 380ms both; }
  @keyframes rise { from { opacity:0; transform:translateY(26px) scale(.955); }
                    to   { opacity:1; transform:none; } }
  @keyframes draw { to { width:42%; } }
  @media (prefers-reduced-motion: reduce) {
    .logo, .rule { animation: none; opacity: 1; width: 42%; }
    .logo { width: min(42vw,620px); }
  }
</style>
<div class="stage">
  <img class="logo" alt="" src="data:image/png;base64,${b64}">
  <div class="rule"></div>
</div>`;
  await fs.writeFile(path.join(out, "logo-motion.html"), html);

  if (!has("keep-frames")) await fs.rm(path.join(out, "frames"), { recursive: true, force: true });
  log(`wrote ${mp4}`);
  log(`wrote ${webm} (transparent, for overlaying on video)`);
  log(`wrote ${gif}`);
  log(`wrote ${path.join(out, "logo-motion.html")} (CSS only, respects prefers-reduced-motion)`);
}

// ─────────────────────────────────────────────────────────────── kit

async function cmdKit() {
  const target = positional[0];
  if (!target) throw new Error("usage: logo.mjs kit <domain> --out DIR");
  const out = opt("out", "brand");
  const raw = path.join(out, "_raw");
  await cmdPull({ target, out: raw, html: opt("html"), asset: opt("asset") });

  const files = (await fs.readdir(raw)).filter((f) => /\.(svg|png|jpg|jpeg|webp|ico)$/i.test(f));
  const ranked = [];
  for (const f of files) {
    try {
      const m = await sharp(path.join(raw, f), { density: 900 }).metadata();
      const vector = /\.svg$/i.test(f);
      // Prefer vector, then a wide lockup, then raw pixel count. A near-square file is
      // usually a favicon rather than the lockup.
      ranked.push({ f, score: (vector ? 1e9 : 0) + (m.width || 0) * (m.height || 0) * ((m.width / m.height > 1.6) ? 2 : 1) });
    } catch { /* ico and friends that sharp cannot read are simply not candidates */ }
  }
  ranked.sort((a, b) => b.score - a.score);
  if (!ranked.length) throw new Error("nothing in the pull is readable as an image");
  const chosen = path.join(raw, ranked[0].f);
  log(`\nchose ${ranked[0].f} as the primary asset`);

  await cmdRender({ src: chosen, out });
  await cmdAnimate({ dir: out, out: path.join(out, "motion"), style: opt("style", "rise") });

  // A brand file the client-deck skill can consume as is.
  const meta = JSON.parse(await fs.readFile(path.join(out, "logo.json"), "utf8"));
  const id = opt("brand", originOf(target).host.replace(/^www\./, "").split(".")[0]);
  const primary = meta.palette.primary || "#2A80C2";
  const brand = {
    id,
    name: id,
    site: originOf(target).host,
    sourceOfTruth: `Logo and colors pulled from ${originOf(target).href} on ${new Date().toISOString().slice(0, 10)}. See _raw/provenance.json.`,
    layout: { w: 13.333, h: 7.5, margin: 0.78, gap: 0.34, gapWide: 0.62 },
    color: {
      blue: primary.slice(1),
      blueLift: shift(primary, 0.3).slice(1),
      blueDeep: shift(primary, -0.35).slice(1),
      navy: shift(primary, -0.86).slice(1),
      navyLift: shift(primary, -0.74).slice(1),
      navyEdge: shift(primary, -0.6).slice(1),
      ink: "0F151B", slate: "5A6772", slateSoft: "8A97A2",
      paper: "FFFFFF", tint: "F1F6FA", tintDeep: "DCE9F4",
      line: "E2EAF1", hair: "CBD8E3", lineDark: shift(primary, -0.55).slice(1),
      onDark: "FFFFFF", onDarkSoft: "9DB5C8",
      orange: "F58320", green: "23A455", red: "C0392B",
    },
    type: {
      face: "Arial", display: 54, h1: 39, h2: 25, kicker: 10.5, sectionHead: 19,
      body: 14, bodySm: 12.5, caption: 10.5,
      stat: 40, statHero: 92, statXl: 62, statLabel: 12,
    },
    logo: {
      light: `assets/${id}/logo.png`,
      dark: `assets/${id}/logo-white.png`,
      mark: `assets/${id}/mark.png`,
      markDark: `assets/${id}/mark-white.png`,
      aspect: meta.aspect,
      markAspect: meta.lockup.markAspect ?? meta.aspect,
      markWidth: 1.5, titleWidth: 3.15,
    },
    contact: {},
  };
  await fs.writeFile(path.join(out, `${id}.brand.json`), JSON.stringify(brand, null, 2));
  log(`\nwrote ${out}/${id}.brand.json`);
  log(`To wire it into client-deck:`);
  log(`  cp ${out}/${id}.brand.json ~/.claude/skills/client-deck/brands/${id}.json`);
  log(`  mkdir -p ~/.claude/skills/client-deck/assets/${id} && cp ${out}/logo*.png ${out}/mark*.png ~/.claude/skills/client-deck/assets/${id}/`);
  log(`Then set name, contact and titleWidth by hand, and check the palette against the`);
  log(`client's own brand guide before shipping anything to a prospect.`);
}

// ─────────────────────────────────────────────────────────────── main

const commands = { pull: cmdPull, render: cmdRender, animate: cmdAnimate, kit: cmdKit };
if (!commands[cmd]) {
  console.error(`usage: logo.mjs <pull|render|animate|kit> ...\n${await fs.readFile(new URL(import.meta.url)).then((b) => b.toString().split("\n").slice(2, 12).join("\n"))}`);
  process.exit(1);
}
try {
  await commands[cmd]();
} catch (e) {
  // exitCode rather than exit(): killing the process while fetch keepalive sockets are
  // still open trips a libuv assertion on Windows and buries the real error message.
  console.error(`\n${e.message}`);
  process.exitCode = 1;
}
