import pptxgen from "file:///C:/Users/dillo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pptxgenjs/dist/pptxgen.cjs.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const output = path.join(root, "Replenish-August-2026-Monthly-Performance.pptx");
const logo = path.join(root, "assets", "replenish-7-eleven.png");
const benchmarkUrl = "https://www.wordstream.com/blog/2026-google-ads-benchmarks";

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "Momentum 360";
pptx.subject = "Replenish August 2026 campaign performance";
pptx.title = "Replenish August 2026 Monthly Performance";
pptx.company = "Momentum 360";
pptx.lang = "en-US";
pptx.theme = {
  headFontFace: "Aptos Display",
  bodyFontFace: "Aptos",
  lang: "en-US",
};
pptx.defineSlideMaster({
  title: "MOMENTUM",
  background: { color: "F7F5EF" },
  objects: [
    { rect: { x: 0, y: 0, w: 13.333, h: 0.10, fill: { color: "007243" }, line: { color: "007243" } } },
    { text: { text: "REPLENISH  |  7 ELEVEN", options: { x: 0.72, y: 0.30, w: 4.2, h: 0.24, fontFace: "Aptos", fontSize: 9, bold: true, color: "007243", margin: 0 } } },
    { text: { text: "AUGUST 1 TO AUGUST 31, 2026", options: { x: 9.1, y: 0.30, w: 3.5, h: 0.24, fontFace: "Aptos", fontSize: 9, bold: true, color: "66706A", align: "right", margin: 0 } } },
    { line: { x: 0.72, y: 7.10, w: 11.88, h: 0, line: { color: "D7DAD5", width: 1 } } },
    { text: { text: "Momentum 360  |  Verified Google Ads delivery as of August 31, 2026", options: { x: 0.72, y: 7.18, w: 9.8, h: 0.18, fontFace: "Aptos", fontSize: 7.5, color: "66706A", margin: 0 } } },
  ],
  slideNumber: { x: 12.1, y: 7.17, w: 0.5, h: 0.18, fontFace: "Aptos", fontSize: 7.5, bold: true, color: "66706A", align: "right", margin: 0 },
});

const C = { ink: "18201B", muted: "5B6760", paper: "F7F5EF", white: "FFFFFF", green: "007243", greenDark: "004E30", greenSoft: "E2F0E8", orange: "F47A20", orangeSoft: "FDECDD", red: "E0232C", rule: "D7DAD5", navy: "0A1A32" };
const campaigns = [
  ["Torrey Del Mar", 127.25, 176, "2.37%"],
  ["Carmel Mountain", 110.78, 99, "2.81%"],
  ["Coral Springs", 85.72, 26, "0.46%"],
  ["Boca", 82.68, 51, "1.40%"],
  ["Pompano", 67.80, 95, "2.11%"],
];

function addTitle(slide, title, subtitle = "") {
  slide.addText(title, { x: 0.72, y: 0.68, w: 8.9, h: 0.48, fontFace: "Aptos Display", fontSize: 25, bold: true, color: C.ink, margin: 0, breakLine: false });
  if (subtitle) slide.addText(subtitle, { x: 0.72, y: 1.18, w: 11.2, h: 0.38, fontFace: "Aptos", fontSize: 11.5, color: C.muted, margin: 0, breakLine: false });
}
function addMetric(slide, x, y, w, value, label, note = "") {
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h: 1.28, rectRadius: 0.05, fill: { color: C.white }, line: { color: C.rule, width: 1 } });
  slide.addText(value, { x: x + 0.18, y: y + 0.18, w: w - 0.36, h: 0.42, fontFace: "Aptos Display", fontSize: 25, bold: true, color: C.ink, margin: 0 });
  slide.addText(label.toUpperCase(), { x: x + 0.18, y: y + 0.69, w: w - 0.36, h: 0.19, fontFace: "Aptos", fontSize: 8.5, bold: true, color: C.green, charSpacing: 0.5, margin: 0 });
  if (note) slide.addText(note, { x: x + 0.18, y: y + 0.96, w: w - 0.36, h: 0.19, fontFace: "Aptos", fontSize: 8.5, color: C.muted, margin: 0 });
}
function addBulletList(slide, items, x, y, w, h, color = C.ink) {
  const runs = [];
  items.forEach((item, index) => {
    runs.push({ text: item, options: { bullet: { indent: 15 }, breakLine: index < items.length - 1 } });
  });
  slide.addText(runs, { x, y, w, h, fontFace: "Aptos", fontSize: 13, color, breakLine: false, paraSpaceAfterPt: 11, margin: 0.03, valign: "top", bullet: { indent: 15 } });
}

// Cover
{
  const s = pptx.addSlide();
  s.background = { color: C.navy };
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.18, h: 7.5, fill: { color: C.green }, line: { color: C.green } });
  s.addShape(pptx.ShapeType.rect, { x: 0.18, y: 0, w: 13.153, h: 0.12, fill: { color: C.orange }, line: { color: C.orange } });
  s.addImage({ path: logo, x: 10.45, y: 0.70, w: 1.45, h: 1.45, transparency: 0 });
  s.addText("MONTHLY PERFORMANCE", { x: 0.85, y: 0.85, w: 4.2, h: 0.28, fontFace: "Aptos", fontSize: 11, bold: true, color: "62C390", charSpacing: 1.4, margin: 0 });
  s.addText("Replenish campaign\nperformance report", { x: 0.85, y: 1.45, w: 8.8, h: 1.40, fontFace: "Aptos Display", fontSize: 36, bold: true, color: C.white, margin: 0, breakLine: false });
  s.addText("One clear August view of spend, traffic efficiency, and store level campaign performance across the nine location program.", { x: 0.85, y: 3.18, w: 7.55, h: 0.72, fontFace: "Aptos", fontSize: 17, color: "C8D1CD", margin: 0.02, breakLine: false });
  s.addShape(pptx.ShapeType.line, { x: 0.85, y: 4.45, w: 10.9, h: 0, line: { color: "385065", width: 1.2 } });
  s.addText("REPORTING PERIOD", { x: 0.85, y: 4.76, w: 2.2, h: 0.2, fontFace: "Aptos", fontSize: 9, bold: true, color: "9AACA4", charSpacing: 0.7, margin: 0 });
  s.addText("August 1 to August 31, 2026", { x: 0.85, y: 5.08, w: 4.5, h: 0.4, fontFace: "Aptos Display", fontSize: 20, bold: true, color: C.white, margin: 0 });
  s.addText("Prepared August 31, 2026  |  Replenish and 7 Eleven only", { x: 0.85, y: 5.62, w: 5.3, h: 0.3, fontFace: "Aptos", fontSize: 10, color: "9AACA4", margin: 0 });
  s.addText("Momentum 360", { x: 9.5, y: 6.42, w: 2.25, h: 0.32, fontFace: "Aptos Display", fontSize: 15, bold: true, color: C.white, align: "right", margin: 0 });
}

// Overview
{
  const s = pptx.addSlide("MOMENTUM");
  addTitle(s, "August account overview", "Verified top line Google Ads delivery across the Replenish store program.");
  addMetric(s, 0.72, 1.82, 2.75, "$684.74", "Google spend", "August 1 to 31");
  addMetric(s, 3.66, 1.82, 2.75, "705", "Clicks", "38,690 impressions");
  addMetric(s, 6.60, 1.82, 2.75, "$0.97", "Average CPC", "1.82% account CTR");
  addMetric(s, 9.54, 1.82, 2.75, "9", "Store campaigns", "Replenish scope");
  s.addShape(pptx.ShapeType.roundRect, { x: 0.72, y: 3.48, w: 7.42, h: 2.56, rectRadius: 0.05, fill: { color: C.green }, line: { color: C.green } });
  s.addText("August signal", { x: 1.00, y: 3.77, w: 2.1, h: 0.23, fontFace: "Aptos", fontSize: 10, bold: true, color: "CBE8D7", charSpacing: 0.8, margin: 0 });
  s.addText("Replenish generated 705 clicks from 38,690 impressions while maintaining an average cost below one dollar per click.", { x: 1.00, y: 4.18, w: 6.70, h: 0.92, fontFace: "Aptos Display", fontSize: 23, bold: true, color: C.white, margin: 0, breakLine: false, fit: "shrink" });
  s.addText("Conversion reporting is pending validation. Click to get directions remains a separate site reporting KPI.", { x: 1.00, y: 5.31, w: 6.65, h: 0.42, fontFace: "Aptos", fontSize: 11.5, color: "DCEBE3", margin: 0 });
  s.addShape(pptx.ShapeType.roundRect, { x: 8.43, y: 3.48, w: 3.86, h: 2.56, rectRadius: 0.05, fill: { color: C.white }, line: { color: C.rule, width: 1 } });
  s.addText("Industry efficiency", { x: 8.72, y: 3.77, w: 2.9, h: 0.25, fontFace: "Aptos", fontSize: 11, bold: true, color: C.green, margin: 0 });
  s.addText([{ text: "53% lower", options: { hyperlink: { url: benchmarkUrl }, color: C.green, underline: { color: C.green }, bold: true } }], { x: 8.72, y: 4.20, w: 2.9, h: 0.50, fontFace: "Aptos Display", fontSize: 28, bold: true, color: C.ink, margin: 0 });
  s.addText("August average CPC than the 2026 Restaurants and Food search benchmark of $2.05.", { x: 8.72, y: 4.88, w: 2.95, h: 0.66, fontFace: "Aptos", fontSize: 12, color: C.muted, margin: 0 });
}

// Locations
{
  const s = pptx.addSlide("MOMENTUM");
  addTitle(s, "Store campaign leaders", "The five highest spend campaigns represented $474.23 of August media delivery.");
  const max = 127.25;
  campaigns.forEach(([name, spend, clicks, ctr], i) => {
    const y = 1.80 + i * 0.86;
    s.addText(name, { x: 0.72, y, w: 2.15, h: 0.28, fontFace: "Aptos", fontSize: 12, bold: true, color: C.ink, margin: 0 });
    s.addShape(pptx.ShapeType.roundRect, { x: 2.94, y: y + 0.03, w: 5.20, h: 0.22, rectRadius: 0.04, fill: { color: "E0E4DF" }, line: { color: "E0E4DF" } });
    s.addShape(pptx.ShapeType.roundRect, { x: 2.94, y: y + 0.03, w: 5.20 * (spend / max), h: 0.22, rectRadius: 0.04, fill: { color: i < 2 ? C.green : C.greenDark }, line: { color: i < 2 ? C.green : C.greenDark } });
    s.addText(`$${spend.toFixed(2)}`, { x: 8.40, y: y - 0.01, w: 1.08, h: 0.28, fontFace: "Aptos", fontSize: 12, bold: true, color: C.ink, align: "right", margin: 0 });
    s.addText(`${clicks} clicks`, { x: 9.78, y: y - 0.01, w: 1.02, h: 0.28, fontFace: "Aptos", fontSize: 11, color: C.muted, align: "right", margin: 0 });
    s.addText(`${ctr} CTR`, { x: 11.15, y: y - 0.01, w: 1.14, h: 0.28, fontFace: "Aptos", fontSize: 11, bold: i < 2, color: i < 2 ? C.green : C.muted, align: "right", margin: 0 });
    s.addShape(pptx.ShapeType.line, { x: 0.72, y: y + 0.55, w: 11.57, h: 0, line: { color: C.rule, width: 0.8 } });
  });
  s.addShape(pptx.ShapeType.roundRect, { x: 0.72, y: 6.23, w: 11.57, h: 0.56, rectRadius: 0.03, fill: { color: C.greenSoft }, line: { color: C.greenSoft } });
  s.addText("Carmel Mountain led click through rate at 2.81%. Torrey Del Mar led both spend and click volume.", { x: 0.98, y: 6.41, w: 11.0, h: 0.22, fontFace: "Aptos", fontSize: 11, bold: true, color: C.greenDark, margin: 0 });
}

// Delivery
{
  const s = pptx.addSlide("MOMENTUM");
  addTitle(s, "What we completed in August", "Campaign delivery, reporting, and measurement work completed for Replenish.");
  s.addShape(pptx.ShapeType.roundRect, { x: 0.72, y: 1.78, w: 5.65, h: 4.78, rectRadius: 0.05, fill: { color: C.white }, line: { color: C.rule, width: 1 } });
  s.addText("Delivered", { x: 1.02, y: 2.08, w: 2.2, h: 0.30, fontFace: "Aptos Display", fontSize: 19, bold: true, color: C.green, margin: 0 });
  addBulletList(s, [
    "Completed the August top line campaign read across nine store campaigns.",
    "Delivered two weekly performance packets and preserved the location level view.",
    "Reconciled billing, account access, and campaign readiness follow ups.",
    "Kept Replenish reporting and media evidence separate from Fresh Blends.",
  ], 1.02, 2.65, 4.98, 3.32);
  s.addShape(pptx.ShapeType.roundRect, { x: 6.66, y: 1.78, w: 5.63, h: 4.78, rectRadius: 0.05, fill: { color: C.navy }, line: { color: C.navy } });
  s.addText("Measurement boundary", { x: 6.98, y: 2.08, w: 3.2, h: 0.30, fontFace: "Aptos Display", fontSize: 19, bold: true, color: C.white, margin: 0 });
  s.addText("The campaign KPIs are complete. Click to get directions remains in the existing site reporting layer and will be added separately before the client presentation.", { x: 6.98, y: 2.75, w: 4.92, h: 1.22, fontFace: "Aptos Display", fontSize: 19, bold: true, color: C.white, margin: 0, fit: "shrink" });
  s.addShape(pptx.ShapeType.line, { x: 6.98, y: 4.45, w: 4.75, h: 0, line: { color: "385065", width: 1 } });
  s.addText("TOP LINE CAMPAIGN KPIS", { x: 6.98, y: 4.75, w: 2.8, h: 0.20, fontFace: "Aptos", fontSize: 8.5, bold: true, color: "9AACA4", charSpacing: 0.5, margin: 0 });
  s.addText("Complete", { x: 6.98, y: 5.09, w: 1.8, h: 0.34, fontFace: "Aptos Display", fontSize: 19, bold: true, color: "62C390", margin: 0 });
  s.addText("DIRECTIONS KPI", { x: 9.50, y: 4.75, w: 1.7, h: 0.20, fontFace: "Aptos", fontSize: 8.5, bold: true, color: "9AACA4", charSpacing: 0.5, margin: 0 });
  s.addText("Pending", { x: 9.50, y: 5.09, w: 1.8, h: 0.34, fontFace: "Aptos Display", fontSize: 19, bold: true, color: C.orange, margin: 0 });
}

// Next steps
{
  const s = pptx.addSlide("MOMENTUM");
  addTitle(s, "September action plan", "Complete the measurement layer first, then review store level optimization opportunities.");
  const rows = [
    ["1", "Complete directions KPI", "Dillon", "Add the August click to get directions read from the site reporting layer.", "Before presentation"],
    ["2", "Review top line KPIs", "Ruben and Momentum", "Review campaign delivery by location and surface questions for Mia.", "Early September"],
    ["3", "Prioritize store review", "Paid media", "Focus creative and targeting review on lower engagement locations.", "After KPI review"],
  ];
  rows.forEach(([n, title, owner, detail, timing], i) => {
    const y = 1.82 + i * 1.48;
    s.addShape(pptx.ShapeType.ellipse, { x: 0.76, y: y + 0.03, w: 0.46, h: 0.46, fill: { color: i === 0 ? C.orange : C.green }, line: { color: i === 0 ? C.orange : C.green } });
    s.addText(n, { x: 0.76, y: y + 0.12, w: 0.46, h: 0.20, fontFace: "Aptos", fontSize: 10, bold: true, color: C.white, align: "center", margin: 0 });
    s.addText(title, { x: 1.48, y, w: 2.85, h: 0.31, fontFace: "Aptos Display", fontSize: 17, bold: true, color: C.ink, margin: 0 });
    s.addText(owner.toUpperCase(), { x: 4.48, y: y + 0.04, w: 1.72, h: 0.20, fontFace: "Aptos", fontSize: 8.5, bold: true, color: C.green, charSpacing: 0.4, margin: 0 });
    s.addText(detail, { x: 6.15, y, w: 4.57, h: 0.62, fontFace: "Aptos", fontSize: 12, color: C.ink, margin: 0 });
    s.addText(timing, { x: 10.90, y: y + 0.03, w: 1.39, h: 0.22, fontFace: "Aptos", fontSize: 9, bold: true, color: C.muted, align: "right", margin: 0 });
    s.addShape(pptx.ShapeType.line, { x: 1.48, y: y + 1.05, w: 10.81, h: 0, line: { color: C.rule, width: 0.8 } });
  });
  s.addShape(pptx.ShapeType.roundRect, { x: 0.72, y: 6.35, w: 11.57, h: 0.52, rectRadius: 0.03, fill: { color: C.greenSoft }, line: { color: C.greenSoft } });
  s.addText("Final scope: one Replenish PowerPoint. Fresh Blends is not part of the August presentation.", { x: 0.98, y: 6.51, w: 11.0, h: 0.22, fontFace: "Aptos", fontSize: 11, bold: true, color: C.greenDark, margin: 0 });
}

// Close
{
  const s = pptx.addSlide();
  s.background = { color: C.navy };
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.18, h: 7.5, fill: { color: C.green }, line: { color: C.green } });
  s.addImage({ path: logo, x: 10.55, y: 0.78, w: 1.32, h: 1.32 });
  s.addText("REPLENISH  |  AUGUST 2026", { x: 0.92, y: 1.08, w: 4.6, h: 0.24, fontFace: "Aptos", fontSize: 10, bold: true, color: "62C390", charSpacing: 1.1, margin: 0 });
  s.addText("Efficient traffic delivery.\nClear ownership for the final KPI.", { x: 0.92, y: 1.75, w: 8.3, h: 1.22, fontFace: "Aptos Display", fontSize: 34, bold: true, color: C.white, margin: 0 });
  s.addText("The top line campaign view is complete. Adding the site based directions KPI will finish the client presentation without blending brands or unsupported outcomes.", { x: 0.92, y: 3.45, w: 7.3, h: 0.75, fontFace: "Aptos", fontSize: 16, color: "C8D1CD", margin: 0 });
  s.addShape(pptx.ShapeType.line, { x: 0.92, y: 4.72, w: 10.8, h: 0, line: { color: "385065", width: 1 } });
  s.addText("Momentum 360", { x: 0.92, y: 5.10, w: 3.0, h: 0.34, fontFace: "Aptos Display", fontSize: 19, bold: true, color: C.white, margin: 0 });
  s.addText("Monthly client performance reporting", { x: 0.92, y: 5.55, w: 3.8, h: 0.24, fontFace: "Aptos", fontSize: 10, color: "9AACA4", margin: 0 });
}

await pptx.writeFile({ fileName: output });
console.log(output);
