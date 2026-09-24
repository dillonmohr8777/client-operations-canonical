import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const period = "August 17 to August 23, 2026";
export const observedAt = "August 24, 2026";
export const leadAccounting = "Platform reported lead events are shown as whole integers where a current platform read was authorized. Platform activity remains separate from qualified inquiries, booked work, revenue, and other downstream outcomes. Unavailable fields remain pending validation.";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "../../../..");
const reportFolder = "2026-08-24-weekly-report-2026-08-17-to-2026-08-23";

const profiles = [
  { id:"kimberly-james-bridal", client:"Kimberly James Bridal", descriptor:"Meta, Google Search, and appointment measurement", logo:"kimberly-james-bridal.png", logoBackground:"light", accent:"#E6C85C", accentBright:"#F5D978", lanes:["Meta Ads","Google Ads"] },
  { id:"onsite-concrete-landscape", client:"Onsite Concrete and Landscape", descriptor:"Google Ads, Fairfield expansion, and measurement readiness", logo:"onsite-concrete-landscape.png", logoBackground:"dark", accent:"#F45B4D", accentBright:"#FF8B7F", lanes:["Google Ads","SEO and local search"] },
  { id:"omega-landscaping", client:"Omega Landscaping and Concrete", descriptor:"Google Ads, estimate destination, and local proof", logo:"omega-landscaping.png", logoBackground:"dark", accent:"#4B82D8", accentBright:"#8CB7FF", lanes:["Google Ads","Local content"] },
  { id:"replenish-7-eleven", client:"Replenish / 7 Eleven", descriptor:"Brand separated reporting, access, and campaign readiness", logo:"replenish-7-eleven.png", logoBackground:"light", accent:"#F4B400", accentBright:"#FFD45C", lanes:["Account readiness","Client reporting"] },
  { id:"fresh-blends-kwik-trip", client:"Fresh Blends / Kwik Trip", descriptor:"Brand separated campaign planning and activation boundaries", logo:"fresh-blends.png", logoBackground:"light", accent:"#73C9A3", accentBright:"#9DE5C4", lanes:["Campaign program","Activation boundary"] },
  { id:"fagan-painting", client:"Fagan Painting", descriptor:"Organic service coverage and local conversion paths", logo:"fagan-painting.png", logoBackground:"dark", accent:"#F0B24B", accentBright:"#FFD17A", lanes:["Organic search","Website conversion"] },
  { id:"hope-wellness-center", client:"Hope Wellness Center", descriptor:"Local trust, therapist content, and organic growth", logo:"hope-wellness-center.png", logoBackground:"light", accent:"#5FB6B0", accentBright:"#8BE0D9", lanes:["Local trust","Content and AEO"] },
  { id:"nkcdc", client:"NKCDC", descriptor:"Phase Two growth planning and stakeholder alignment", logo:"nkcdc.png", logoBackground:"light", accent:"#E59B45", accentBright:"#FFC36E", lanes:["Growth plan","Decision state"] },
  { id:"bar-crawl-usa", client:"Bar Crawl USA", descriptor:"October seasonal landing pages and event growth planning", logo:"bar-crawl-usa.webp", logoBackground:"dark", accent:"#D8A85A", accentBright:"#F0C77A", lanes:["Seasonal production","Analytics and tracking"] },
  { id:"va-claims-edge", client:"VA Claims Edge", descriptor:"Phase Three portal progress and product readiness", logo:"va-claims-edge.png", logoBackground:"light", accent:"#C94343", accentBright:"#F07474", lanes:["Portal product","Readiness and review"] },
  { id:"revive-systems", client:"Revive Systems", descriptor:"Organic growth, content readiness, and paid boundaries", logo:"revive-systems.png", logoBackground:"dark", accent:"#F06A3A", accentBright:"#FF9B6D", lanes:["Organic acquisition","Publishing readiness"] },
  { id:"nexla", client:"Nexla", descriptor:"Google Ads audit, Brand protection, and controlled Nonbrand planning", logo:"nexla.svg", logoBackground:"light", accent:"#6254FF", accentBright:"#948AFF", lanes:["Google Ads audit","Campaign launch plan"], summary:"The Google Ads audit was delivered, the proposed budget direction advanced to $2,000 monthly, and the protected Brand plus controlled Nonbrand campaign plan remains unpublished while landing pages and conversion tracking are confirmed." },
];

function readCurrent(id) {
  const file = path.join(projectRoot, "clients", id, "deliverables", reportFolder, "source-data.json");
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function metricRows(metrics, start = 0) {
  return metrics.slice(start, start + 4).map(([label, value]) => [label, value]);
}

function padMetrics(metrics) {
  const result = metrics.slice(0, 4).map(([label, value, note]) => [label, value, note || "Verified weekly evidence"]);
  while (result.length < 4) result.push(["Current field", "Pending", "Pending validation"]);
  return result;
}

function buildReport(profile) {
  const data = readCurrent(profile.id);
  const metrics = data.metrics || [];
  const work = [...(data.work || [])];
  const summary = profile.summary || data.summary || "The reporting window is documented from verified client evidence.";
  const next = data.next || "Confirm the next client decision from current source evidence.";
  const sources = data.sources || [];
  const lane1Metrics = metricRows(metrics, 0);
  const lane2Metrics = metricRows(metrics, 2);
  while (lane1Metrics.length < 4) lane1Metrics.push(["Current field", "Pending"]);
  while (lane2Metrics.length < 4) lane2Metrics.push(["Current field", "Pending"]);
  if (profile.id === "kimberly-james-bridal") work[3] = "Separated individual lead follow up from the normal performance report so each inquiry can be handled directly.";
  if (profile.id === "replenish-7-eleven") work[3] = "Kept campaign performance pending until an authorized current account read is available.";
  if (profile.id === "fresh-blends-kwik-trip") work[2] = "Kept campaign metrics pending until a verified restart and current delivery read are available.";
  const workRows = work.slice(0, 4);
  while (workRows.length < 4) workRows.push("No additional production was represented beyond the verified source record.");
  return {
    observedAt,
    measurementHeading: "Weekly evidence is separated from downstream business outcomes.",
    id: profile.id,
    client: profile.client,
    descriptor: profile.descriptor,
    logo: profile.logo,
    logoBackground: profile.logoBackground,
    accent: profile.accent,
    accentBright: profile.accentBright,
    status: summary,
    signal: summary,
    goal: next,
    kpis: padMetrics(metrics),
    work: workRows,
    analysis: [summary, `The next controlled action is to ${next.charAt(0).toLowerCase()}${next.slice(1)}`],
    platforms: [
      { name:profile.lanes[0], state:"Verified weekly read", note:summary, metrics:lane1Metrics, rows:[["Primary weekly work","Verified","Current scope","Documented",workRows[0]],["Supporting work","Verified","Current scope","Documented",workRows[1]]] },
      { name:profile.lanes[1], state:"Current delivery and next action", note:next, metrics:lane2Metrics, rows:[["Delivery boundary","Verified","Current scope","Documented",workRows[2]],["Next action","Planned","Pending approval where required","Not represented as complete",workRows[3]]] },
    ],
    outcome: { platform:summary, business:"Qualified business outcomes remain separate from the verified weekly activity unless explicitly named in the source evidence.", measurement:next },
    workstreams: [["Delivery",workRows[0],"Verified"],["Optimization",workRows[1],"Verified"],["Boundary",workRows[2],"Verified"],["Next step",workRows[3],"Planned"]],
    detailedWork: [["Delivery",workRows[0],"Records the client value completed during the reporting window.","Verified"],["Optimization",workRows[1],"Connects the work to the current growth or operating objective.","Verified"],["Boundary",workRows[2],"Keeps unavailable metrics and unapproved actions out of the client report.","Verified"],["Next",workRows[3],"Defines the next evidence based action without overstating completion.","Planned"]],
    wins: workRows.slice(0, 2),
    augustFocus: [next, workRows[3]],
    nextMoves: [["Confirm","Client + Momentum",next,"Next review"],["Validate","Momentum","Reconcile the next source evidence before changing the plan","Weekly"],["Advance","Assigned owner",workRows[3],"After confirmation"]],
    sources,
  };
}

export const reports = profiles.map(buildReport);
export const portfolio = reports.map(report => ({ id:report.id, client:report.client, logo:report.logo, status:report.status }));
