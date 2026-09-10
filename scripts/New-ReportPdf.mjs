#!/usr/bin/env node
// Turn a markdown report or a designed HTML page into a client-ready PDF.
//
//   node scripts/New-ReportPdf.mjs <input.md|input.html> [output.pdf]
//
// Markdown gets the house report styling. HTML is rendered exactly as authored,
// so bespoke designs keep their own CSS. Same Playwright engine the weekly client
// report builders already use, so PDFs come out consistent across the estate.

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname, basename, extname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const RUNTIME =
  "C:/Users/dillo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";
const require = createRequire(import.meta.url);
const { chromium } = require(`${RUNTIME}/playwright`);
const { marked } = require(`${RUNTIME}/marked`);

const input = process.argv[2];
if (!input || !existsSync(input)) {
  console.error("usage: node scripts/New-ReportPdf.mjs <input.md|input.html> [output.pdf]");
  process.exit(1);
}

const inPath = resolve(input);
const outPath = resolve(
  process.argv[3] || join(dirname(inPath), basename(inPath, extname(inPath)) + ".pdf"),
);
const isHtml = /\.html?$/i.test(inPath);
const raw = readFileSync(inPath, "utf8");

// House report styling. Only applied to markdown — authored HTML keeps its own design.
const SHELL = (body) => `<!doctype html><meta charset="utf-8">
<style>
  @page { size: Letter; margin: 18mm 16mm; }
  :root { --navy:#0B2A4A; --ink:#1a1d21; --muted:#5A5F66; --rule:#dfe3e8; --accent:#0B2A4A; }
  * { box-sizing: border-box; }
  body { font: 10.5pt/1.55 "Segoe UI", -apple-system, Helvetica, Arial, sans-serif;
         color: var(--ink); margin: 0; }
  h1 { font-size: 21pt; line-height:1.2; color: var(--navy); margin: 0 0 4pt;
       border-bottom: 2.5pt solid var(--navy); padding-bottom: 7pt; }
  h2 { font-size: 13.5pt; color: var(--navy); margin: 20pt 0 7pt;
       border-bottom: .75pt solid var(--rule); padding-bottom: 4pt; break-after: avoid; }
  h3 { font-size: 11.5pt; margin: 14pt 0 5pt; break-after: avoid; }
  p, li { orphans: 3; widows: 3; }
  table { width: 100%; border-collapse: collapse; margin: 10pt 0; font-size: 9pt;
          break-inside: avoid; }
  th { background: var(--navy); color: #fff; text-align: left; padding: 6pt 8pt;
       font-weight: 600; }
  td { padding: 5.5pt 8pt; border-bottom: .5pt solid var(--rule); vertical-align: top; }
  tr:nth-child(even) td { background: #f7f9fb; }
  code { font: 9pt "Cascadia Mono", Consolas, monospace; background: #f0f3f6;
         padding: 1pt 3pt; border-radius: 2pt; }
  pre { background: #f0f3f6; padding: 9pt; border-radius: 3pt; overflow-x: auto;
        break-inside: avoid; }
  pre code { background: none; padding: 0; }
  blockquote { margin: 10pt 0; padding: 7pt 12pt; border-left: 3pt solid var(--accent);
               background: #f7f9fb; break-inside: avoid; }
  blockquote p { margin: 0; }
  hr { border: 0; border-top: .75pt solid var(--rule); margin: 16pt 0; }
  a { color: var(--navy); }
  strong { color: #000; }
  ul, ol { padding-left: 16pt; }
  li { margin: 2.5pt 0; }
  input[type=checkbox] { margin-right: 4pt; }
</style>
${body}`;

const html = isHtml ? raw : SHELL(marked.parse(raw));

const browser = await chromium.launch();
const page = await browser.newPage();
if (isHtml) {
  // Load from disk so relative assets, fonts and images resolve.
  await page.goto(pathToFileURL(inPath).href, { waitUntil: "networkidle" });
} else {
  await page.setContent(html, { waitUntil: "networkidle" });
}
await page.emulateMedia({ media: "print" });
await page.pdf({
  path: outPath,
  format: "Letter",
  printBackground: true,
  preferCSSPageSize: true,
  margin: isHtml ? undefined : { top: 0, right: 0, bottom: 0, left: 0 },
});
await browser.close();

const { statSync } = await import("node:fs");
console.log(JSON.stringify({ input: inPath, pdf: outPath, bytes: statSync(outPath).size }, null, 2));
