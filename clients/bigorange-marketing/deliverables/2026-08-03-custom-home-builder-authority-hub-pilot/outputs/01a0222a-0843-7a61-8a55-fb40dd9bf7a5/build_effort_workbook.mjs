import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/, (m) => m.slice(1)));
const normalizedOutputDir = decodeURIComponent(outputDir).replaceAll("/", path.sep);
await fs.mkdir(normalizedOutputDir, { recursive: true });

const projectRoot = "C:\\Users\\dillo\\Documents\\Codex\\projects\\client-operations\\clients\\bigorange-marketing\\deliverables\\2026-08-03-custom-home-builder-authority-hub-pilot";
const logoPath = path.join(projectRoot, "wordpress", "netlify-hardcoded", "assets", "bigorange-logo-particle-8777.png");
const logoDataUrl = `data:image/png;base64,${(await fs.readFile(logoPath)).toString("base64")}`;

const workbook = Workbook.create();
const summary = workbook.worksheets.add("Executive Summary");
const effort = workbook.worksheets.add("Effort Log");
const alignment = workbook.worksheets.add("Proposal Alignment");
const evidence = workbook.worksheets.add("Evidence Index");

const C = {
  orange: "#F47721",
  deepOrange: "#B94800",
  ink: "#151515",
  charcoal: "#2F3032",
  paper: "#F6F2EA",
  white: "#FFFFFF",
  line: "#D8D0C4",
  muted: "#69645E",
  paleOrange: "#FFE7D5",
  softInk: "#232323",
};

const border = (color = C.line) => ({
  top: { style: "thin", color },
  bottom: { style: "thin", color },
  left: { style: "thin", color },
  right: { style: "thin", color },
});

const setColumnWidths = (sheet, widths) => {
  widths.forEach(([range, width]) => {
    sheet.getRange(range).format.columnWidth = width;
  });
};

const date = (iso) => new Date(`${iso}T12:00:00Z`);

const effortRows = [
  [date("2026-08-03"), "Discovery & Audit", "Audit the live builder page, content structure, mobile experience, and technical baseline.", "Original Proposal", 2.00, "Complete", "Current-site audit", "live-site-technical-audit-2026-08-20.md"],
  [date("2026-08-03"), "Discovery & Audit", "Review builder-agency competitors, page patterns, positioning gaps, and proof conventions.", "Original Proposal", 2.00, "Complete", "Competitor research", "competitor-research.md"],
  [date("2026-08-04"), "Search Strategy", "Reconcile Emilia's historical Moz export with current Semrush evidence and filter the usable commercial-intent set.", "Original Proposal", 3.00, "Complete", "Keyword research and rationale", "keyword-strategy-2026-08-20.md"],
  [date("2026-08-04"), "Content System", "Map the authority hub, buyer questions, supporting pages, proof sequence, and conversion path.", "Original Proposal", 1.50, "Complete", "Content architecture", "content-architecture.md"],
  [date("2026-08-05"), "Content System", "Complete internal-link routes and the protect, improve, build, reject search-intent architecture.", "Original Proposal", 1.50, "Complete", "Content architecture", "keyword-strategy-2026-08-20.md"],
  [date("2026-08-05"), "Search Strategy", "Build the AEO/GEO answer, entity, evidence, and citation-readiness strategy.", "Original Proposal", 1.50, "Complete", "AI-search strategy", "ai-search-strategy.md"],
  [date("2026-08-06"), "Content System", "Write and structure the first half of the custom home builder pillar production candidate.", "Original Proposal", 2.00, "Production candidate", "One complete pillar", "wordpress/pillar-page.md"],
  [date("2026-08-07"), "Content System", "Finish the pillar copy, proof blocks, calls to action, and WordPress-ready structure.", "Original Proposal", 2.00, "Production candidate", "One complete pillar", "wordpress/pillar-page.html"],
  [date("2026-08-08"), "Content System", "Write supporting article one around builder website must-haves and lead quality.", "Original Proposal", 1.25, "Production candidate", "Two supporting articles", "wordpress/supporting-article-01.md"],
  [date("2026-08-08"), "Content System", "Write supporting article two around essential home builder blog topics.", "Original Proposal", 1.25, "Production candidate", "Two supporting articles", "wordpress/supporting-article-02.md"],
  [date("2026-08-09"), "Content System", "Create the visible FAQ set and matching answer-ready schema copy.", "Original Proposal", 1.50, "Production candidate", "FAQ set", "wordpress/pillar-page.html"],
  [date("2026-08-10"), "Technical & WordPress", "Specify title, description, canonical, social metadata, and production URL handling.", "Original Proposal", 0.75, "Complete spec", "Metadata and canonicals", "wordpress/seo-metadata.json"],
  [date("2026-08-10"), "Technical & WordPress", "Build the Organization, WebSite, WebPage, Service, Breadcrumb, and FAQ schema graph.", "Original Proposal", 0.75, "Complete spec", "Schema", "wordpress/schema-graph.json"],
  [date("2026-08-10"), "Technical & WordPress", "Document breadcrumbs, sitemap, and internal-link implementation requirements.", "Original Proposal", 1.00, "Complete spec", "Breadcrumbs, XML sitemap, and internal links", "wordpress/qa-checklist.md"],
  [date("2026-08-11"), "Technical & WordPress", "Create the mobile, payload, image, JavaScript, and Core Web Vitals work order.", "Original Proposal", 1.00, "Complete work order", "Core Web Vitals and mobile plan", "wordpress/qa-checklist.md"],
  [date("2026-08-12"), "Technical & WordPress", "Assemble the editable Beaver Builder and native-editor production candidate modules.", "Original Proposal", 2.00, "Private review build", "WordPress implementation", "wordpress/beaver-builder-assembly-guide.md"],
  [date("2026-08-12"), "Technical & WordPress", "QA the reversible WordPress package, metadata, content order, and staging checklist.", "Original Proposal", 1.00, "Private review build", "WordPress implementation", "wordpress/qa-checklist.md"],
  [date("2026-08-13"), "Roadmaps & Workflow", "Build the 90-day implementation roadmap with dependencies and acceptance gates.", "Original Proposal", 1.00, "Complete", "90-day roadmap", "90-day-roadmap.md"],
  [date("2026-08-13"), "Roadmaps & Workflow", "Extend the operating plan into a 12-month opportunity and measurement roadmap.", "Original Proposal", 0.50, "Complete", "12-month bonus roadmap", "12-month-roadmap.md"],
  [date("2026-08-14"), "Roadmaps & Workflow", "Document the human-approved AI editorial workflow and two-hour production target.", "Original Proposal", 0.75, "Complete", "AI-assisted editorial workflow", "ai-assisted-editorial-workflow.md"],
  [date("2026-08-14"), "Roadmaps & Workflow", "Build Janice's SME interview guide and factual-approval handoff.", "Original Proposal", 0.75, "Complete guide", "SME interview workflow", "janice-sme-interview-guide.md"],
  [date("2026-08-14"), "Roadmaps & Workflow", "Create the builder marketing readiness checklist and downloadable PDF.", "Original Proposal", 0.75, "Complete", "Downloadable asset", "downloads/BigOrange-Builder-Marketing-Readiness-Checklist.pdf"],
  [date("2026-08-20"), "Review & Handoff", "Reconcile the proposal line by line, package evidence, and build the final review story.", "Original Proposal", 1.75, "Updated candidate", "Final presentation", "delivery-completion-matrix-2026-08-20.md"],
  [date("2026-08-21"), "Added-Value Experiences", "Design, code, humanize, optimize, deploy, and QA the Industry Signal hardcoded experience.", "Added Value", 1.75, "Live review build", "Industry Signal experience", "https://bigorange-marketing-homepage.netlify.app/"],
  [date("2026-08-21"), "Added-Value Experiences", "Design, code, humanize, optimize, deploy, and QA the Primary Portfolio hardcoded experience.", "Added Value", 1.75, "Live review build", "Primary Portfolio experience", "https://bigorange-marketing-homepage.netlify.app/primary/"],
];

const proposalRows = [
  ["Current-site audit", "Complete", "live-site-technical-audit-2026-08-20.md", "No remaining research gate", "Original proposal"],
  ["Competitor research", "Complete", "competitor-research.md", "No remaining research gate", "Original proposal"],
  ["Keyword research and rationale", "Complete", "keyword-strategy-2026-08-20.md", "Preserve the current ranking moat while improving weaker exact-fit terms", "Original proposal"],
  ["Content architecture", "Complete", "content architecture plus internal-link plan", "Apply inside the approved WordPress build", "Original proposal"],
  ["AI-search strategy", "Complete", "AEO/GEO answer and entity strategy", "Validate citations and AI-referral measurement after launch", "Original proposal"],
  ["90-day roadmap", "Complete", "90-day-roadmap.md", "Begin after Janice and staging gates", "Original proposal"],
  ["12-month bonus roadmap", "Complete", "12-month-roadmap.md", "Sequence against real capacity and results", "Original proposal bonus"],
  ["One complete pillar", "Production candidate", "wordpress/pillar-page.md and .html", "Janice factual review, final CMS metadata, and publication approval", "Original proposal"],
  ["Two supporting articles", "Production candidate", "wordpress/supporting-article-01/02", "Janice review, category, featured image, and staging QA", "Original proposal"],
  ["FAQ set", "Production candidate", "visible answers plus matching FAQ schema", "Janice review and final visible/schema parity check", "Original proposal"],
  ["Metadata and canonicals", "Complete spec", "wordpress/seo-metadata.json", "Apply and verify in staging", "Original proposal"],
  ["Schema", "Complete spec", "wordpress/schema-graph.json", "Validate in staging and prevent plugin duplication", "Original proposal"],
  ["Breadcrumbs, XML sitemap, and internal links", "Complete spec", "wordpress/qa-checklist.md", "Apply and verify in staging and production", "Original proposal"],
  ["Core Web Vitals and mobile plan", "Complete work order", "wordpress/qa-checklist.md", "Theme and plugin implementation plus confirmation run", "Original proposal"],
  ["WordPress implementation", "Private review build", "Beaver Builder and native-editor packages", "Choose assembly path, stage, QA, and approve", "Original proposal"],
  ["AI-assisted editorial workflow", "Complete", "ai-assisted-editorial-workflow.md", "Measure the first real editorial cycle", "Original proposal"],
  ["SME interview workflow", "Complete guide", "janice-sme-interview-guide.md", "Conduct Janice interview and record approvals", "Original proposal"],
  ["Downloadable asset", "Complete", "Builder Marketing Readiness Checklist PDF", "Approve placement and form path", "Original proposal"],
  ["Final presentation", "Updated candidate", "new executive delivery PDF plus completion matrix", "Insert Janice-approved examples and staging results", "Original proposal"],
  ["Editorial target at or below two hours", "Designed; measurement pending", "AI-assisted editorial workflow", "Measure the first approved production cycle", "Original proposal"],
  ["Final acceptance and publication", "Gated", "delivery-completion-matrix-2026-08-20.md", "Janice approval, CMS settings, staging QA, and explicit publication approval", "Original proposal"],
  ["Industry Signal experience", "Live review build", "Netlify review URL", "Select if this becomes the production direction", "Added value"],
  ["Primary Portfolio experience", "Live review build", "Netlify /primary/ review URL", "Select if this becomes the production direction", "Added value"],
];

const evidenceRows = [
  ["Live-site technical audit", "Audit", "Current-site audit", "Complete", "live-site-technical-audit-2026-08-20.md", date("2026-08-20")],
  ["Competitor research", "Research", "Competitor research", "Complete", "competitor-research.md", date("2026-08-20")],
  ["Keyword strategy", "Research", "Keyword research and rationale", "Complete", "keyword-strategy-2026-08-20.md", date("2026-08-20")],
  ["Pillar production candidate", "Content", "One complete pillar", "Production candidate", "wordpress/pillar-page.html", date("2026-08-21")],
  ["Supporting article one", "Content", "Two supporting articles", "Production candidate", "wordpress/supporting-article-01.html", date("2026-08-20")],
  ["Supporting article two", "Content", "Two supporting articles", "Production candidate", "wordpress/supporting-article-02.html", date("2026-08-20")],
  ["SEO metadata", "Technical", "Metadata and canonicals", "Complete spec", "wordpress/seo-metadata.json", date("2026-08-20")],
  ["Schema graph", "Technical", "Schema", "Complete spec", "wordpress/schema-graph.json", date("2026-08-20")],
  ["Beaver Builder assembly guide", "WordPress", "WordPress implementation", "Private review build", "wordpress/beaver-builder-assembly-guide.md", date("2026-08-20")],
  ["90-day roadmap", "Roadmap", "90-day roadmap", "Complete", "90-day-roadmap.md", date("2026-08-20")],
  ["12-month roadmap", "Roadmap", "12-month bonus roadmap", "Complete", "12-month-roadmap.md", date("2026-08-20")],
  ["AI editorial workflow", "Workflow", "AI-assisted editorial workflow", "Complete", "ai-assisted-editorial-workflow.md", date("2026-08-20")],
  ["Janice SME interview guide", "Workflow", "SME interview workflow", "Complete guide", "janice-sme-interview-guide.md", date("2026-08-20")],
  ["Builder Marketing Readiness Checklist", "Download", "Downloadable asset", "Complete", "downloads/BigOrange-Builder-Marketing-Readiness-Checklist.pdf", date("2026-08-20")],
  ["Delivery completion matrix", "Handoff", "Final presentation", "Complete", "delivery-completion-matrix-2026-08-20.md", date("2026-08-20")],
  ["Industry Signal", "Live review experience", "Industry Signal experience", "Live, noindex", "https://bigorange-marketing-homepage.netlify.app/", date("2026-08-21")],
  ["Primary Portfolio", "Live review experience", "Primary Portfolio experience", "Live, noindex", "https://bigorange-marketing-homepage.netlify.app/primary/", date("2026-08-21")],
  ["Netlify deployment", "Deployment receipt", "Two live review experiences", "Production deploy complete", "deploy 6a88c72d33044244bcca1e01", date("2026-08-21")],
];

// Executive Summary
summary.getRange("A1:N30").format.fill = C.paper;
summary.getRange("A1:N3").format.fill = C.ink;
summary.mergeCells("A1:D3");
summary.images.add({ dataUrl: logoDataUrl, anchor: { from: { row: 0, col: 0 }, extent: { widthPx: 245, heightPx: 82 } } });
summary.mergeCells("E1:N2");
summary.getRange("E1").values = [["AUTHORITY HUB // DELIVERY REVIEW"]];
summary.getRange("E1").format = { font: { bold: true, color: C.white, size: 22 }, verticalAlignment: "center" };
summary.mergeCells("E3:N3");
summary.getRange("E3").values = [["Proposal alignment, reconstructed effort, and release evidence · August 21, 2026"]];
summary.getRange("E3").format = { font: { color: "#C9C3BB", size: 10 }, verticalAlignment: "center" };

summary.getRange("A5:N5").format.fill = C.orange;
summary.mergeCells("A5:N5");
summary.getRange("A5").values = [["THE READOUT"]];
summary.getRange("A5").format = { font: { bold: true, color: C.ink, size: 10 }, verticalAlignment: "center" };

const metricCards = [
  ["A7:C9", "A7", "TOTAL RECONSTRUCTED", "A8", "=SUM('Effort Log'!$E$7:$E$31)", "hours"],
  ["D7:F9", "D7", "ORIGINAL PROPOSAL", "D8", "=SUMIF('Effort Log'!$D$7:$D$31,\"Original Proposal\",'Effort Log'!$E$7:$E$31)", "hours"],
  ["G7:I9", "G7", "ADDED VALUE", "G8", "=SUMIF('Effort Log'!$D$7:$D$31,\"Added Value\",'Effort Log'!$E$7:$E$31)", "hours"],
  ["J7:N9", "J7", "REVIEW STATE", "J8", "2 LIVE DIRECTIONS", "both noindex"],
];
for (const [mergeRange, labelCell, label, valueCell, value, note] of metricCards) {
  summary.getRange(mergeRange).format = { fill: C.white, borders: border("#E2D8CB") };
  summary.mergeCells(labelCell === "J7" ? "J7:N7" : `${labelCell}:${String.fromCharCode(labelCell.charCodeAt(0) + 2)}7`);
  summary.getRange(labelCell).values = [[label]];
  summary.getRange(labelCell).format = { font: { bold: true, color: C.deepOrange, size: 9 }, verticalAlignment: "center" };
  const valueMerge = valueCell === "J8" ? "J8:N8" : `${valueCell}:${String.fromCharCode(valueCell.charCodeAt(0) + 2)}8`;
  summary.mergeCells(valueMerge);
  if (String(value).startsWith("=")) summary.getRange(valueCell).formulas = [[value]];
  else summary.getRange(valueCell).values = [[value]];
  summary.getRange(valueCell).format = { font: { bold: true, color: C.ink, size: valueCell === "J8" ? 16 : 24 }, verticalAlignment: "center" };
  const noteCell = valueCell === "J8" ? "J9" : `${valueCell[0]}9`;
  const noteMerge = valueCell === "J8" ? "J9:N9" : `${noteCell}:${String.fromCharCode(noteCell.charCodeAt(0) + 2)}9`;
  summary.mergeCells(noteMerge);
  summary.getRange(noteCell).values = [[note]];
  summary.getRange(noteCell).format = { font: { color: C.muted, size: 9 }, verticalAlignment: "center" };
}
summary.getRange("A8:I8").format.numberFormat = "0.00";

summary.mergeCells("A11:F11");
summary.getRange("A11").values = [["EFFORT BY WORKSTREAM"]];
summary.getRange("A11").format = { fill: C.ink, font: { bold: true, color: C.white, size: 10 } };
summary.getRange("A12:B19").values = [
  ["Workstream", "Hours"],
  ["Discovery & Audit", null],
  ["Search Strategy", null],
  ["Content System", null],
  ["Technical & WordPress", null],
  ["Roadmaps & Workflow", null],
  ["Review & Handoff", null],
  ["Added-Value Experiences", null],
];
summary.getRange("A12:B12").format = { fill: C.paleOrange, font: { bold: true, color: C.ink }, borders: border() };
summary.getRange("A13:A19").format = { fill: C.white, font: { color: C.ink }, borders: border() };
summary.getRange("B13").formulas = [["=SUMIF('Effort Log'!$B$7:$B$31,A13,'Effort Log'!$E$7:$E$31)"]];
summary.getRange("B13:B19").fillDown();
summary.getRange("B13:B19").format = { fill: C.white, numberFormat: "0.00", font: { bold: true, color: C.deepOrange }, borders: border() };

const hoursChart = summary.charts.add("bar", summary.getRange("A12:B19"));
hoursChart.title = "Where the 35 reconstructed hours went";
hoursChart.hasLegend = false;
hoursChart.xAxis = { axisType: "textAxis", textStyle: { fontSize: 9 } };
hoursChart.yAxis = { numberFormatCode: "0.0", min: 0 };
hoursChart.setPosition("D11", "N20");
if (hoursChart.series.items[0]) hoursChart.series.items[0].fill = C.orange;

summary.mergeCells("A22:C22");
summary.getRange("A22").values = [["WHAT THIS SHEET IS"]];
summary.getRange("A22").format = { fill: C.orange, font: { bold: true, color: C.ink, size: 9 } };
summary.mergeCells("A23:F26");
summary.getRange("A23").values = [["A transparent reconstruction of effort from dated artifacts, proposal workstreams, and delivery evidence. It is not minute-by-minute timekeeping. The 35.00-hour total combines 31.50 hours mapped to the original proposal and 3.50 hours of added-value hardcoded experience work."]];
summary.getRange("A23").format = { fill: C.white, font: { color: C.ink, size: 10 }, wrapText: true, verticalAlignment: "top", borders: border() };
summary.mergeCells("H22:N22");
summary.getRange("H22").values = [["HONEST PRODUCTION BOUNDARY"]];
summary.getRange("H22").format = { fill: C.ink, font: { bold: true, color: C.white, size: 9 } };
summary.mergeCells("H23:N26");
summary.getRange("H23").values = [["The proposal artifacts and two review experiences are ready for client review. The WordPress pillar is still gated by Janice's factual approval, final CMS settings, staging QA, and explicit publication approval. The Netlify concepts remain noindex review builds."]];
summary.getRange("H23").format = { fill: C.softInk, font: { color: C.white, size: 10 }, wrapText: true, verticalAlignment: "top", borders: border("#4B4B4B") };
summary.mergeCells("A28:N28");
summary.getRange("A28").values = [["Source window: August 3–21, 2026 · Reconstructed August 21, 2026 · BigOrange Marketing Authority Hub"]];
summary.getRange("A28").format = { font: { color: C.muted, italic: true, size: 9 } };
setColumnWidths(summary, [["A:A", 22], ["B:B", 12], ["C:C", 4], ["D:F", 13], ["G:I", 13], ["J:N", 13]]);
summary.getRange("1:3").format.rowHeight = 27;
summary.getRange("5:5").format.rowHeight = 22;
summary.getRange("7:9").format.rowHeight = 26;
summary.getRange("23:26").format.rowHeight = 24;
summary.freezePanes.freezeRows(5);

// Effort Log
effort.getRange("A1:H34").format.fill = C.paper;
effort.getRange("A1:H3").format.fill = C.ink;
effort.mergeCells("A1:B3");
effort.images.add({ dataUrl: logoDataUrl, anchor: { from: { row: 0, col: 0 }, extent: { widthPx: 210, heightPx: 70 } } });
effort.mergeCells("C1:H2");
effort.getRange("C1").values = [["RECONSTRUCTED EFFORT LOG"]];
effort.getRange("C1").format = { font: { bold: true, color: C.white, size: 22 }, verticalAlignment: "center" };
effort.mergeCells("C3:H3");
effort.getRange("C3").values = [["35.00 hours mapped to dated work products and proposal commitments"]];
effort.getRange("C3").format = { font: { color: "#C9C3BB", size: 10 } };
effort.mergeCells("A5:H5");
effort.getRange("A5").values = [["Method: reconstructed from file evidence and work categories; not presented as precise stopwatch records."]];
effort.getRange("A5").format = { fill: C.paleOrange, font: { color: C.deepOrange, italic: true, size: 10 }, wrapText: true };
effort.getRange("A6:H6").values = [["Date", "Workstream", "Activity", "Scope Class", "Hours", "Status", "Proposal Commitment", "Evidence / Artifact"]];
effort.getRange("A6:H6").format = { fill: C.orange, font: { bold: true, color: C.ink, size: 9 }, borders: border(C.deepOrange), wrapText: true };
effort.getRange("A7:H31").values = effortRows;
effort.getRange("A7:H31").format = { fill: C.white, font: { color: C.ink, size: 9 }, borders: border("#E6DED4"), verticalAlignment: "top", wrapText: true };
effort.getRange("A7:A31").format.numberFormat = "mmm d, yyyy";
effort.getRange("E7:E31").format = { fill: C.white, font: { bold: true, color: C.deepOrange }, numberFormat: "0.00", borders: border("#E6DED4") };
for (let row = 7; row <= 31; row += 1) {
  const scope = effortRows[row - 7][3];
  if (scope === "Added Value") effort.getRange(`A${row}:H${row}`).format.fill = C.paleOrange;
}
effort.getRange("A33:D33").merge();
effort.getRange("A33").values = [["TOTAL RECONSTRUCTED HOURS"]];
effort.getRange("A33").format = { fill: C.ink, font: { bold: true, color: C.white, size: 11 } };
effort.getRange("E33").formulas = [["=SUM(E7:E31)"]];
effort.getRange("E33").format = { fill: C.orange, font: { bold: true, color: C.ink, size: 14 }, numberFormat: "0.00", borders: border(C.deepOrange) };
effort.getRange("F33:H33").merge();
effort.getRange("F33").formulas = [["=TEXT(SUMIF(D7:D31,\"Original Proposal\",E7:E31),\"0.00\")&\" proposal + \"&TEXT(SUMIF(D7:D31,\"Added Value\",E7:E31),\"0.00\")&\" added-value hours\""]];
effort.getRange("F33").format = { fill: C.ink, font: { color: C.white, size: 10 }, wrapText: true };
const effortTable = effort.tables.add("A6:H31", true, "BigOrangeEffortLog");
effortTable.showBandedRows = false;
effort.freezePanes.freezeRows(6);
setColumnWidths(effort, [["A:A", 14], ["B:B", 23], ["C:C", 54], ["D:D", 18], ["E:E", 10], ["F:F", 20], ["G:G", 31], ["H:H", 48]]);
effort.getRange("7:31").format.rowHeight = 46;

// Proposal Alignment
alignment.getRange("A1:F31").format.fill = C.paper;
alignment.getRange("A1:F3").format.fill = C.ink;
alignment.mergeCells("A1:F2");
alignment.getRange("A1").values = [["PROPOSAL ALIGNMENT // WHAT EXISTS, WHAT REMAINS"]];
alignment.getRange("A1").format = { font: { bold: true, color: C.white, size: 20 }, verticalAlignment: "center" };
alignment.mergeCells("A3:F3");
alignment.getRange("A3").values = [["Every artifact that can truthfully exist before Janice's interview is present. Publication remains gated."]];
alignment.getRange("A3").format = { font: { color: "#C9C3BB", size: 10 } };
alignment.getRange("A5:F5").values = [["Commitment", "State", "Deliverable / Evidence", "Reconstructed Hours", "Remaining Gate", "Scope"]];
alignment.getRange("A5:F5").format = { fill: C.orange, font: { bold: true, color: C.ink, size: 9 }, borders: border(C.deepOrange), wrapText: true };
const alignmentValues = proposalRows.map(([commitment, state, deliverable, gate, scope]) => [commitment, state, deliverable, null, gate, scope]);
alignment.getRange(`A6:F${5 + proposalRows.length}`).values = alignmentValues;
alignment.getRange(`A6:F${5 + proposalRows.length}`).format = { fill: C.white, font: { color: C.ink, size: 9 }, borders: border("#E6DED4"), verticalAlignment: "top", wrapText: true };
alignment.getRange("D6").formulas = [["=SUMIF('Effort Log'!$G$7:$G$31,A6,'Effort Log'!$E$7:$E$31)"]];
alignment.getRange(`D6:D${5 + proposalRows.length}`).fillDown();
alignment.getRange(`D6:D${5 + proposalRows.length}`).format = { fill: C.white, font: { bold: true, color: C.deepOrange }, numberFormat: "0.00", borders: border("#E6DED4") };
for (let i = 0; i < proposalRows.length; i += 1) {
  const row = i + 6;
  const state = proposalRows[i][1];
  const fill = state === "Gated" ? C.charcoal : state.toLowerCase().includes("candidate") || state.toLowerCase().includes("review") ? C.paleOrange : C.white;
  alignment.getRange(`B${row}`).format = { fill, font: { bold: true, color: state === "Gated" ? C.white : C.deepOrange }, borders: border("#E6DED4"), wrapText: true };
}
const alignTable = alignment.tables.add(`A5:F${5 + proposalRows.length}`, true, "BigOrangeProposalAlignment");
alignTable.showBandedRows = false;
alignment.freezePanes.freezeRows(5);
setColumnWidths(alignment, [["A:A", 34], ["B:B", 25], ["C:C", 46], ["D:D", 17], ["E:E", 58], ["F:F", 22]]);
alignment.getRange(`6:${5 + proposalRows.length}`).format.rowHeight = 46;

// Evidence Index
evidence.getRange("A1:F25").format.fill = C.paper;
evidence.getRange("A1:F3").format.fill = C.ink;
evidence.mergeCells("A1:F2");
evidence.getRange("A1").values = [["EVIDENCE INDEX // REVIEWABLE SOURCE OF TRUTH"]];
evidence.getRange("A1").format = { font: { bold: true, color: C.white, size: 20 }, verticalAlignment: "center" };
evidence.mergeCells("A3:F3");
evidence.getRange("A3").values = [["Paths are relative to the canonical BigOrange deliverable unless a live URL is shown."]];
evidence.getRange("A3").format = { font: { color: "#C9C3BB", size: 10 } };
evidence.getRange("A5:F5").values = [["Artifact", "Type", "Proposal Link", "Current State", "Path / URL", "Verified Date"]];
evidence.getRange("A5:F5").format = { fill: C.orange, font: { bold: true, color: C.ink, size: 9 }, borders: border(C.deepOrange), wrapText: true };
evidence.getRange(`A6:F${5 + evidenceRows.length}`).values = evidenceRows;
evidence.getRange(`A6:F${5 + evidenceRows.length}`).format = { fill: C.white, font: { color: C.ink, size: 9 }, borders: border("#E6DED4"), verticalAlignment: "top", wrapText: true };
evidence.getRange(`F6:F${5 + evidenceRows.length}`).format.numberFormat = "mmm d, yyyy";
const evidenceTable = evidence.tables.add(`A5:F${5 + evidenceRows.length}`, true, "BigOrangeEvidenceIndex");
evidenceTable.showBandedRows = false;
evidence.freezePanes.freezeRows(5);
setColumnWidths(evidence, [["A:A", 34], ["B:B", 24], ["C:C", 34], ["D:D", 24], ["E:E", 70], ["F:F", 16]]);
evidence.getRange(`6:${5 + evidenceRows.length}`).format.rowHeight = 42;

// Render every sheet for visual QA.
for (const sheetName of ["Executive Summary", "Effort Log", "Proposal Alignment", "Evidence Index"]) {
  const preview = await workbook.render({ sheetName, autoCrop: "all", scale: 1, format: "png" });
  const safeName = sheetName.toLowerCase().replaceAll(" ", "-");
  await fs.writeFile(path.join(normalizedOutputDir, `${safeName}.png`), new Uint8Array(await preview.arrayBuffer()));
}

const workbookPath = path.join(normalizedOutputDir, "BigOrange-Authority-Hub-Reconstructed-Effort-and-Scope-2026-08-21.xlsx");
const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(workbookPath);

const summaryInspection = await workbook.inspect({
  kind: "table",
  range: "Executive Summary!A1:N28",
  include: "values,formulas",
  tableMaxRows: 30,
  tableMaxCols: 14,
});
const errorInspection = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "final formula error scan",
});

console.log(JSON.stringify({
  workbookPath,
  previews: ["executive-summary.png", "effort-log.png", "proposal-alignment.png", "evidence-index.png"],
  summaryInspection: summaryInspection.ndjson,
  errorInspection: errorInspection.ndjson,
}, null, 2));
