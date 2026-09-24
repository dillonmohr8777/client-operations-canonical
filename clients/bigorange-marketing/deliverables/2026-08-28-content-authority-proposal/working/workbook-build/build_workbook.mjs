import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const ROOT = "C:/Users/dillo/Documents/Codex/projects/client-operations/clients/bigorange-marketing/deliverables/2026-08-28-content-authority-proposal";
const PILOT = "C:/Users/dillo/Documents/Codex/projects/client-operations/clients/bigorange-marketing/deliverables/2026-08-03-custom-home-builder-authority-hub-pilot";
const OUT = path.join(ROOT, "outputs", "01a04906-96f3-7072-b3bf-0c2589aed6fa");
const QA = path.join(ROOT, "working", "workbook-build", "qa");
const OUTPUT_FILE = path.join(OUT, "BigOrange-Authority-System-Keyword-and-Content-Plan-2026-08-28.xlsx");

const C = {
  orange: "#F47721",
  deepOrange: "#B94800",
  ink: "#111111",
  charcoal: "#2F3032",
  paper: "#F6F2EA",
  white: "#FFFFFF",
  line: "#D8D0C4",
  muted: "#69645E",
  green: "#2F6B45",
  greenLight: "#E7F3EA",
  amber: "#8A5A00",
  amberLight: "#FFF3D6",
  red: "#8F2D2D",
  redLight: "#FCE8E8",
  blue: "#2F5D7C",
  blueLight: "#E8F0F6",
  grayLight: "#EEEEEC"
};

function colName(n) {
  let s = "";
  let x = n;
  while (x > 0) {
    x--;
    s = String.fromCharCode(65 + (x % 26)) + s;
    x = Math.floor(x / 26);
  }
  return s;
}

function safeString(v) {
  return v === null || v === undefined ? "" : String(v);
}

function titleBlock(sheet, title, subtitle, widthCols) {
  const last = colName(widthCols);
  sheet.getRange(`A1:${last}1`).merge();
  sheet.getRange("A1").values = [[title]];
  sheet.getRange(`A1:${last}1`).format = {
    fill: C.ink,
    font: { name: "Arial", size: 18, bold: true, color: C.white },
    verticalAlignment: "center",
    rowHeight: 34
  };
  sheet.getRange(`A2:${last}2`).merge();
  sheet.getRange("A2").values = [[subtitle]];
  sheet.getRange(`A2:${last}2`).format = {
    fill: C.paper,
    font: { name: "Arial", size: 10, color: C.muted, italic: true },
    wrapText: true,
    verticalAlignment: "center",
    rowHeight: 32,
    borders: { bottom: { style: "thin", color: C.line } }
  };
}

function styleHeader(range) {
  range.format = {
    fill: C.orange,
    font: { name: "Arial", size: 10, bold: true, color: C.ink },
    wrapText: true,
    verticalAlignment: "center",
    horizontalAlignment: "center",
    rowHeight: 30,
    borders: { bottom: { style: "medium", color: C.deepOrange } }
  };
}

function styleBody(range) {
  range.format = {
    font: { name: "Arial", size: 9, color: C.ink },
    verticalAlignment: "center",
    wrapText: true,
    borders: { insideHorizontal: { style: "thin", color: C.line } }
  };
}

function styleStatus(range) {
  range.conditionalFormats.add("containsText", { text: "Complete", format: { fill: C.greenLight, font: { color: C.green, bold: true } } });
  range.conditionalFormats.add("containsText", { text: "Blocked", format: { fill: C.redLight, font: { color: C.red, bold: true } } });
  range.conditionalFormats.add("containsText", { text: "Requires", format: { fill: C.amberLight, font: { color: C.amber } } });
  range.conditionalFormats.add("containsText", { text: "Not included", format: { fill: C.blueLight, font: { color: C.blue } } });
  range.conditionalFormats.add("containsText", { text: "Rejected", format: { fill: C.grayLight, font: { color: C.muted } } });
  range.conditionalFormats.add("containsText", { text: "hold", format: { fill: C.redLight, font: { color: C.red, bold: true } } });
}

await fs.mkdir(OUT, { recursive: true });
await fs.mkdir(QA, { recursive: true });

const [planText, keywordCsv, claimsCsv] = await Promise.all([
  fs.readFile(path.join(ROOT, "working", "content-plan.json"), "utf8"),
  fs.readFile(path.join(PILOT, "keyword-opportunity-map-reconciled-2026-08-20.csv"), "utf8"),
  fs.readFile(path.join(ROOT, "evidence", "permission-and-claims-register.csv"), "utf8")
]);
const plan = JSON.parse(planText);

const workbook = await Workbook.fromCSV(keywordCsv, { sheetName: "Raw Keyword Evidence" });
const rawSheet = workbook.worksheets.getItem("Raw Keyword Evidence");
const raw = rawSheet.getUsedRange().values;
const rawHeaders = raw[0].map(safeString);
const rawRows = raw.slice(1);
const idx = Object.fromEntries(rawHeaders.map((h, i) => [h, i]));

const assetById = new Map(plan.assets.map((a) => [a.asset_id, a]));
const ownerRows = rawRows.map((row) => {
  const query = safeString(row[idx["Proposed Query"]]);
  const assetId = plan.keyword_owner[query];
  const rejected = assetId.startsWith("REJECT-");
  const asset = rejected ? null : assetById.get(assetId);
  const rejectionReason = assetId === "REJECT-CONSUMER"
    ? "Consumer wants a builder or cost answer, not builder-marketing services"
    : assetId === "REJECT-GENERIC"
      ? "Too broad and misaligned to the builder pilot"
      : "";
  return [
    row[idx["Priority"]],
    query,
    row[idx["Topic Cluster"]],
    row[idx["Semrush Intent"]],
    row[idx["Funnel Stage"]],
    row[idx["US Volume"]],
    row[idx["KD %"]],
    row[idx["CPC USD"]],
    assetId,
    rejected ? rejectionReason : asset.title,
    rejected ? "No content owner" : asset.slug,
    rejected ? "Rejected" : "Assigned",
    rejected ? "Rejected from builder-marketing plan" : asset.scope_state,
    rejected ? "Do not build" : asset.build_window,
    row[idx["Recommended Asset"]],
    row[idx["Decision"]],
    row[idx["Validation Status"]],
    row[idx["Moz SERP Date"]],
    row[idx["Moz Desktop Rank"]],
    row[idx["Moz Mobile Rank"]],
    row[idx["Moz Volume Range"]],
    row[idx["Evidence Note"]],
    row[idx["Why Selected"]]
  ];
});

// Summary
const summary = workbook.worksheets.add("Summary");
summary.showGridLines = false;
titleBlock(summary, "BigOrange Builder Authority System", "Decision workbook | 62-keyword ownership, production scope, content sequence, claims, and release gates | Prepared August 28, 2026", 12);
summary.getRange("A4:C4").merge();
summary.getRange("A4").values = [["EXECUTIVE STATE"]];
summary.getRange("A4:C4").format = { fill: C.orange, font: { name: "Arial", size: 11, bold: true, color: C.ink }, rowHeight: 24 };

const cards = [
  ["A5:B7", "Keywords evaluated", "=COUNTA('Keyword Master'!$B$5:$B$66)", "Dated Semrush + Moz decision ledger"],
  ["D5:E7", "Assigned to one owner", "=COUNTIF('Keyword Master'!$L$5:$L$66,\"Assigned\")", "No unowned production query"],
  ["G5:H7", "Explicitly rejected", "=COUNTIF('Keyword Master'!$L$5:$L$66,\"Rejected\")", "Generic or consumer intent"],
  ["J5:K7", "Current-pilot drafts", "=COUNTIF('Asset Register'!$I$5:$I$23,\"Complete interview-integrated draft\")", "Pillar + two full articles"]
];
for (const [block, label, formula, note] of cards) {
  const [start, end] = block.split(":");
  const startCol = start.match(/[A-Z]+/)[0];
  const endCol = end.match(/[A-Z]+/)[0];
  const startRow = Number(start.match(/\d+/)[0]);
  const endRow = Number(end.match(/\d+/)[0]);
  summary.getRange(`${startCol}${startRow}:${endCol}${startRow}`).merge();
  summary.getRange(`${startCol}${startRow}`).values = [[label]];
  summary.getRange(`${startCol}${startRow}:${endCol}${startRow}`).format = { fill: C.charcoal, font: { name: "Arial", size: 10, bold: true, color: C.white }, horizontalAlignment: "center" };
  summary.getRange(`${startCol}${startRow + 1}:${endCol}${startRow + 1}`).merge();
  summary.getRange(`${startCol}${startRow + 1}`).formulas = [[formula]];
  summary.getRange(`${startCol}${startRow + 1}:${endCol}${startRow + 1}`).format = { fill: C.paper, font: { name: "Arial", size: 20, bold: true, color: C.deepOrange }, horizontalAlignment: "center" };
  summary.getRange(`${startCol}${endRow}:${endCol}${endRow}`).merge();
  summary.getRange(`${startCol}${endRow}`).values = [[note]];
  summary.getRange(`${startCol}${endRow}:${endCol}${endRow}`).format = { fill: C.paper, font: { name: "Arial", size: 8, color: C.muted }, horizontalAlignment: "center", wrapText: true };
  summary.getRange(`${startCol}${startRow}:${endCol}${endRow}`).format.borders = { preset: "outside", style: "thin", color: C.line };
}

summary.getRange("A9:D9").merge();
summary.getRange("A9").values = [["Decision summary"]];
summary.getRange("A9:D9").format = { fill: C.ink, font: { name: "Arial", size: 11, bold: true, color: C.white } };
summary.getRange("A10:D14").values = [
  ["Canonical hub", "Keep and evolve", "https://bigorange.marketing/marketing-agency-for-builders/", "Do not create a competing pillar"],
  ["Current production", "3 complete drafts", "HUB-01, ART-01, ART-02", "Janice + leadership approval required"],
  ["Interview insight", "90 days is short", "Six months is the first realistic momentum window", "No lead or ranking promise"],
  ["Permission boundary", "1 approved paraphrase", "Homearama example", "All other interview language remains on hold"],
  ["Commercial truth", "$1,050 approved pilot", "35 hours at $30/hour", "Invoice/payment and acceptance mechanics open"]
];
styleBody(summary.getRange("A10:D14"));
summary.getRange("A10:A14").format.font = { name: "Arial", size: 9, bold: true, color: C.deepOrange };
summary.getRange("A10:D14").format.borders = { preset: "all", style: "thin", color: C.line };

summary.getRange("F9:H9").values = [["Scope bucket", "Asset count", "Meaning"]];
styleHeader(summary.getRange("F9:H9"));
summary.getRange("F10:F14").values = [["Current pilot drafts"], ["Next phase"], ["Phase 2 explicit exclusion"], ["Backlog"], ["Intent validation first"]];
summary.getRange("G10").formulas = [["=COUNTIF('Asset Register'!$G$5:$G$23,\"Current pilot\")"]];
summary.getRange("G11").formulas = [["=COUNTIF('Asset Register'!$G$5:$G$23,\"Next phase\")"]];
summary.getRange("G12").formulas = [["=COUNTIF('Asset Register'!$G$5:$G$23,\"Phase 2\")"]];
summary.getRange("G13").formulas = [["=COUNTIF('Asset Register'!$G$5:$G$23,\"Backlog\")"]];
summary.getRange("G14").formulas = [["=COUNTIF('Asset Register'!$G$5:$G$23,\"Validate first\")"]];
summary.getRange("H10:H14").values = [["Pillar and two full articles"], ["Production requires a separate decision"], ["Mapped, not included production"], ["After foundation and proof"], ["Do not build on ambiguous intent"]];
styleBody(summary.getRange("F10:H14"));
summary.getRange("F10:H14").format.borders = { preset: "all", style: "thin", color: C.line };

summary.getRange("A16:C16").values = [["Asset ID", "Asset title", "Keyword count"]];
styleHeader(summary.getRange("A16:C16"));
plan.assets.forEach((asset, i) => {
  const r = 17 + i;
  summary.getRange(`A${r}:B${r}`).values = [[asset.asset_id, asset.title]];
  summary.getRange(`C${r}`).formulas = [[`=COUNTIF('Keyword Master'!$I$5:$I$66,A${r})`]];
});
styleBody(summary.getRange(`A17:C${16 + plan.assets.length}`));
summary.getRange(`A17:C${16 + plan.assets.length}`).format.borders = { preset: "all", style: "thin", color: C.line };
summary.getRange("A17:A35").format.font = { name: "Arial", size: 9, bold: true, color: C.deepOrange };
const chart = summary.charts.add("bar", summary.getRange(`A16:C${16 + plan.assets.length}`));
chart.title = "Keyword ownership by planned asset";
chart.hasLegend = false;
chart.xAxis = { axisType: "textAxis", textStyle: { fontSize: 8 } };
chart.yAxis = { numberFormatCode: "0" };
chart.setPosition("E16", "L35");
summary.freezePanes.freezeRows(2);
summary.getRange("A1:L35").format.font.name = "Arial";
summary.getRange("A1:L35").format.columnWidth = 12;
summary.getRange("A:A").format.columnWidth = 14;
summary.getRange("B:B").format.columnWidth = 34;
summary.getRange("C:C").format.columnWidth = 13;
summary.getRange("D:D").format.columnWidth = 32;
summary.getRange("F:F").format.columnWidth = 24;
summary.getRange("G:G").format.columnWidth = 13;
summary.getRange("H:H").format.columnWidth = 28;

// Keyword master
const keywordSheet = workbook.worksheets.add("Keyword Master");
keywordSheet.showGridLines = false;
titleBlock(keywordSheet, "Keyword Master Map", "Every one of the 62 researched phrases has exactly one owner or an explicit rejection. Semrush evidence is dated August 4, 2026; Moz evidence is dated August 14, 2026.", 23);
const masterHeaders = ["Priority", "Proposed Query", "Topic Cluster", "Semrush Intent", "Funnel Stage", "US Volume", "KD %", "CPC USD", "Asset ID", "Asset Title / Rejection", "Owner URL / Slug", "Disposition", "Scope State", "Build Window", "Original Recommended Asset", "Original Decision", "Validation Status", "Moz SERP Date", "Moz Desktop Rank", "Moz Mobile Rank", "Moz Volume Range", "Evidence Note", "Why Selected"];
keywordSheet.getRange("A4:W4").values = [masterHeaders];
styleHeader(keywordSheet.getRange("A4:W4"));
keywordSheet.getRange(`A5:W${4 + ownerRows.length}`).values = ownerRows;
styleBody(keywordSheet.getRange(`A5:W${4 + ownerRows.length}`));
keywordSheet.getRange(`A5:A${4 + ownerRows.length}`).format.horizontalAlignment = "center";
keywordSheet.getRange(`F5:H${4 + ownerRows.length}`).format.horizontalAlignment = "right";
keywordSheet.getRange(`F5:F${4 + ownerRows.length}`).setNumberFormat("#,##0");
keywordSheet.getRange(`G5:G${4 + ownerRows.length}`).setNumberFormat("0");
keywordSheet.getRange(`H5:H${4 + ownerRows.length}`).setNumberFormat("$0.00");
styleStatus(keywordSheet.getRange(`L5:N${4 + ownerRows.length}`));
keywordSheet.freezePanes.freezeRows(4);
keywordSheet.freezePanes.freezeColumns(2);
keywordSheet.tables.add(`A4:W${4 + ownerRows.length}`, true, "KeywordMasterTable");
const kwWidths = [8, 36, 22, 15, 17, 10, 8, 10, 14, 38, 34, 12, 40, 25, 26, 24, 22, 15, 12, 12, 15, 42, 42];
kwWidths.forEach((w, i) => keywordSheet.getRange(`${colName(i + 1)}:${colName(i + 1)}`).format.columnWidth = w);

// Asset register
const assetSheet = workbook.worksheets.add("Asset Register");
assetSheet.showGridLines = false;
titleBlock(assetSheet, "Content Asset Register", "Current-pilot production is separated from next-phase briefs, Phase 2 exclusions, backlog, and validation-first candidates.", 12);
const assetHeaders = ["Asset ID", "Type", "Title", "Owner URL / Slug", "Reader Job", "Funnel Stage", "Scope Bucket", "Build Window", "Scope State", "Primary CTA", "Source / Approval Needs", "Internal Links"];
assetSheet.getRange("A4:L4").values = [assetHeaders];
styleHeader(assetSheet.getRange("A4:L4"));
const assetRows = plan.assets.map(a => {
  const bucket = a.build_window === "Current pilot" ? "Current pilot"
    : a.build_window.includes("next phase") ? "Next phase"
      : a.build_window === "Phase 2" ? "Phase 2"
        : a.build_window.startsWith("Backlog") ? "Backlog"
          : "Validate first";
  return [a.asset_id, a.type, a.title, a.slug, a.reader_job, a.funnel_stage, bucket, a.build_window, a.scope_state, a.cta, a.source_needs, a.internal_links];
});
assetSheet.getRange(`A5:L${4 + assetRows.length}`).values = assetRows;
styleBody(assetSheet.getRange(`A5:L${4 + assetRows.length}`));
styleStatus(assetSheet.getRange(`G5:I${4 + assetRows.length}`));
assetSheet.tables.add(`A4:L${4 + assetRows.length}`, true, "AssetRegisterTable");
assetSheet.freezePanes.freezeRows(4);
assetSheet.freezePanes.freezeColumns(1);
[14, 24, 38, 34, 48, 20, 18, 26, 44, 32, 48, 28].forEach((w, i) => assetSheet.getRange(`${colName(i + 1)}:${colName(i + 1)}`).format.columnWidth = w);

// 90-day calendar
const cal = workbook.worksheets.add("90-Day Calendar");
cal.showGridLines = false;
titleBlock(cal, "90-Day Content and Release Calendar", "The first six weeks finish and verify the approved pilot. Later weeks are next-phase options and do not become commitments without a separate scope decision.", 6);
const calHeaders = ["Window", "Asset / Workstream", "Scope", "Reader or Release Job", "Current State", "Approval Boundary"];
cal.getRange("A4:F4").values = [calHeaders];
styleHeader(cal.getRange("A4:F4"));
const calRows = plan.calendar_90_day.map(x => [x.week, x.asset, x.scope, x.job, x.status, x.scope === "Current pilot" ? "Exact revision approval required before publication" : "Separate next-phase authorization required"]);
cal.getRange(`A5:F${4 + calRows.length}`).values = calRows;
styleBody(cal.getRange(`A5:F${4 + calRows.length}`));
styleStatus(cal.getRange(`C5:F${4 + calRows.length}`));
cal.tables.add(`A4:F${4 + calRows.length}`, true, "Calendar90DayTable");
cal.freezePanes.freezeRows(4);
[14, 30, 18, 58, 30, 42].forEach((w, i) => cal.getRange(`${colName(i + 1)}:${colName(i + 1)}`).format.columnWidth = w);

// 12-month roadmap
const road = workbook.worksheets.add("12-Month Roadmap");
road.showGridLines = false;
titleBlock(road, "12-Month Authority Roadmap", "A sustainable monthly rhythm: one substantial asset, one meaningful refresh, one proof or tool, and one measurement question. No traffic, lead, or revenue forecast is implied.", 6);
const roadHeaders = ["Month", "Focus", "Primary Asset", "Existing Asset Refresh", "Proof or Tool", "Measurement Question"];
road.getRange("A4:F4").values = [roadHeaders];
styleHeader(road.getRange("A4:F4"));
const roadRows = plan.roadmap_12_month.map(x => [Number(x.month), x.focus, x.primary_asset, x.refresh, x.proof_or_tool, x.measurement]);
road.getRange(`A5:F${4 + roadRows.length}`).values = roadRows;
styleBody(road.getRange(`A5:F${4 + roadRows.length}`));
road.getRange(`A5:A${4 + roadRows.length}`).setNumberFormat("0");
road.tables.add(`A4:F${4 + roadRows.length}`, true, "Roadmap12MonthTable");
road.freezePanes.freezeRows(4);
[10, 28, 34, 34, 36, 48].forEach((w, i) => road.getRange(`${colName(i + 1)}:${colName(i + 1)}`).format.columnWidth = w);

// Claims and permissions
const claimsBook = await Workbook.fromCSV(claimsCsv, { sheetName: "Claims & Permissions" });
const claimsSource = claimsBook.worksheets.getItem("Claims & Permissions").getUsedRange().values;
const claims = workbook.worksheets.add("Claims & Permissions");
claims.showGridLines = false;
titleBlock(claims, "Interview Claims and Permission Register", "Only the Homearama example has explicit paraphrase permission. Every other interview-derived public claim remains on hold until Janice approves the edited language.", claimsSource[0].length);
const claimLastCol = colName(claimsSource[0].length);
claims.getRange(`A4:${claimLastCol}4`).values = [claimsSource[0]];
styleHeader(claims.getRange(`A4:${claimLastCol}4`));
claims.getRange(`A5:${claimLastCol}${4 + claimsSource.length - 1}`).values = claimsSource.slice(1);
styleBody(claims.getRange(`A5:${claimLastCol}${4 + claimsSource.length - 1}`));
styleStatus(claims.getRange(`F5:I${4 + claimsSource.length - 1}`));
claims.tables.add(`A4:${claimLastCol}${4 + claimsSource.length - 1}`, true, "ClaimsPermissionsTable");
claims.freezePanes.freezeRows(4);
[12, 20, 13, 58, 20, 12, 28, 46, 20].forEach((w, i) => claims.getRange(`${colName(i + 1)}:${colName(i + 1)}`).format.columnWidth = w);

// Sources and rules
const sources = workbook.worksheets.add("Sources & Rules");
sources.showGridLines = false;
titleBlock(sources, "Sources, Freshness, and Operating Rules", "The workbook separates current live verification from dated keyword exports, professional opinion, and approval-gated client evidence.", 5);
sources.getRange("A4:E4").values = [["Source", "Evidence Date", "Use", "Boundary", "URL or Local Locator"]];
styleHeader(sources.getRange("A4:E4"));
const sourceRows = [
  ["Janice call recordings", "2026-08-28", "Audience, trust, objections, website, timing, example", "Most public permission unresolved", "Local evidence/transcript-synthesis.md"],
  ["Approved paid-pilot proposal", "Reconciled 2026-08-03", "Scope, 35 hours, $30/hour, $1,050", "Invoice/payment and acceptance mechanics open", "gdoc://1_rv8nGWdb6X5QxdByBhLDSQrvEVkRCD853ByH_aYjhA"],
  ["Semrush keyword map", "2026-08-04", "Demand, intent, difficulty, CPC", "Dated source; not a forecast", "keyword-opportunity-map-reconciled-2026-08-20.csv"],
  ["Moz rankings export", "2026-08-14", "Protect existing commercial mappings", "Dated evidence; blank is not zero", "2026-08-17-moz-bom-rankings.csv"],
  ["Current builder page", "2026-08-28", "Live title, canonical, page content, proof", "Current live state, not approved replacement", "https://bigorange.marketing/marketing-agency-for-builders/"],
  ["BigOrange robots.txt", "2026-08-28", "Crawler policy", "Policy decision; do not change reflexively", "https://bigorange.marketing/robots.txt"],
  ["Google AI optimization guide", "Verified 2026-08-28", "Current generative-search guidance", "SEO fundamentals, useful original content, no hacks", "https://developers.google.com/search/docs/fundamentals/ai-optimization-guide"],
  ["Google canonical guidance", "Verified 2026-08-28", "Preserve one representative URL", "Canonical is a signal, not a guarantee", "https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls"],
  ["Google FAQ rich-result change", "Verified 2026-08-28", "Expectation setting", "FAQ markup does not promise a result", "https://developers.google.com/search/blog/2023/08/howto-faq-changes"],
  ["Web Vitals", "Verified 2026-08-28", "Field measurement guidance", "Use field data for actual pass/fail", "https://web.dev/articles/vitals"]
];
sources.getRange(`A5:E${4 + sourceRows.length}`).values = sourceRows;
styleBody(sources.getRange(`A5:E${4 + sourceRows.length}`));
sources.getRange(`A5:E${4 + sourceRows.length}`).format.borders = { preset: "all", style: "thin", color: C.line };
sources.getRange("A17:E17").merge();
sources.getRange("A17").values = [["CANNIBALIZATION AND PUBLICATION RULES"]];
sources.getRange("A17:E17").format = { fill: C.ink, font: { name: "Arial", size: 11, bold: true, color: C.white }, rowHeight: 24 };
plan.cannibalization_rules.forEach((rule, i) => {
  const r = 18 + i;
  sources.getRange(`A${r}`).values = [[i + 1]];
  sources.getRange(`B${r}:E${r}`).merge();
  sources.getRange(`B${r}`).values = [[rule]];
});
styleBody(sources.getRange(`A18:E${17 + plan.cannibalization_rules.length}`));
sources.getRange(`A18:E${17 + plan.cannibalization_rules.length}`).format.borders = { preset: "all", style: "thin", color: C.line };
sources.freezePanes.freezeRows(4);
[28, 18, 42, 46, 66].forEach((w, i) => sources.getRange(`${colName(i + 1)}:${colName(i + 1)}`).format.columnWidth = w);

// Raw evidence formatting without changing values.
rawSheet.showGridLines = false;
rawSheet.getRange(`A1:${colName(rawHeaders.length)}1`).format = { fill: C.ink, font: { name: "Arial", size: 10, bold: true, color: C.white }, wrapText: true, rowHeight: 28 };
styleBody(rawSheet.getRange(`A2:${colName(rawHeaders.length)}${rawRows.length + 1}`));
rawSheet.freezePanes.freezeRows(1);
rawSheet.freezePanes.freezeColumns(2);
rawSheet.tables.add(`A1:${colName(rawHeaders.length)}${rawRows.length + 1}`, true, "RawKeywordEvidenceTable");
rawHeaders.forEach((_, i) => rawSheet.getRange(`${colName(i + 1)}:${colName(i + 1)}`).format.columnWidth = i === 2 ? 38 : (i >= 9 ? 24 : 16));

// Compact verification.
const summaryCheck = await workbook.inspect({ kind: "table", range: "Summary!A4:H14", include: "values,formulas", tableMaxRows: 20, tableMaxCols: 12, maxChars: 5000 });
const keywordCheck = await workbook.inspect({ kind: "table", range: "Keyword Master!A4:N12", include: "values,formulas", tableMaxRows: 12, tableMaxCols: 14, maxChars: 7000 });
const errors = await workbook.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A", options: { useRegex: true, maxResults: 300 }, summary: "final formula error scan", maxChars: 3000 });
console.log(summaryCheck.ndjson);
console.log(keywordCheck.ndjson);
console.log(errors.ndjson);

for (const name of ["Summary", "Keyword Master", "Asset Register", "90-Day Calendar", "12-Month Roadmap", "Claims & Permissions", "Sources & Rules", "Raw Keyword Evidence"]) {
  const preview = await workbook.render({ sheetName: name, autoCrop: "all", scale: name === "Keyword Master" || name === "Raw Keyword Evidence" ? 0.7 : 1, format: "png" });
  const safe = name.toLowerCase().replaceAll(" ", "-").replaceAll("&", "and");
  await fs.writeFile(path.join(QA, `${safe}.png`), new Uint8Array(await preview.arrayBuffer()));
}

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(OUTPUT_FILE);
console.log(JSON.stringify({ output: OUTPUT_FILE, sheets: 8, keywordRows: ownerRows.length, assets: plan.assets.length }, null, 2));
