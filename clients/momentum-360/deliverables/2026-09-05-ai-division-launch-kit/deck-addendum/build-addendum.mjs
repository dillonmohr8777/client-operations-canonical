// Momentum AI division: eight-slide addendum to the 26-slide Momentum Digital deck.
// Content only. Every layout decision lives in the client-deck skill, so this
// lands in the same brand system as the deck Mac already has.
// Every figure comes from offers.json, pending-decisions.json or
// economics-v2.json in the kit folder, never typed here.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const KIT_DIR = path.join(HERE, "..");
const read = (f) => JSON.parse(fs.readFileSync(path.join(KIT_DIR, f), "utf8"));
const offers = read("offers.json");
const decisions = read("pending-decisions.json");
const econ = read("economics-v2.json");

if (!/PROPOSED/.test(offers.status)) throw new Error("offers.json must carry the PROPOSED marking");
if (!decisions.decisions.every((d) => d.state === "open")) throw new Error("a decision is not open; evidence it first");

const DECK_KIT = path.join(os.homedir(), ".claude", "skills", "client-deck", "lib", "deck-kit.mjs");
const { Deck } = await import(pathToFileURL(DECK_KIT).href);

const d = new Deck("momentum-digital", {
  title: "Momentum AI: the division",
  subject: "Addendum for the Friday conversation. Every figure is a proposal.",
});
const C = d.C;
const SRC = {
  division: "clients/momentum-360/deliverables/2026-09-05-ai-division-launch-kit/DIVISION.md",
  offers: "clients/momentum-360/deliverables/2026-09-05-ai-division-launch-kit/offers.json",
  register: "clients/momentum-360/deliverables/2026-09-05-ai-division-launch-kit/pending-decisions.json",
  econ: "clients/momentum-360/deliverables/2026-09-05-ai-division-launch-kit/economics-v2.json (engine: 2026-09-04-ai-division-plan/economics.py)",
  gmail: "clients/momentum-360/deliverables/2026-09-02-dillon-ai-director-outreach/sends/gmail-reconciliation-2026-09-03.json",
  audits: "clients/momentum-360/deliverables/2026-08-21-pre-sale-ai-search-audits/PACKAGE-STATUS.md",
  lanes: "Mac Frederick, Slack #ai-tech-news, July 28 and August 3, 2026",
};
const PROPOSED = "Every price, hour budget and capacity figure on this slide is a proposal until recorded as agreed.";
const dv = offers.division;
const lanes = offers.lanes;

// ───────────────────────────────────────────────────────────────── A1 section
d.section({
  num: 4, kicker: "Section four · draft for the Friday conversation",
  title: "The AI division",
  sub: "Four lanes Mac already named. One launch-ready flagship and one roadmap offer behind each. One free opener.",
});

// ───────────────────────────────────────────────────────────────── A2 the division
{
  const s = d.slide({
    kicker: "Momentum AI · proposed",
    title: "Momentum built the machine.\nNow we build yours.",
    titleW: 8.3,
    panel: { side: "right", size: 4.35, fill: C.navy }, logoDark: true,
    motif: { x: 10.5, y: 4.5, w: 4.3, dark: true, transparency: 90 },
  });
  d.statRow(s, [
    { value: "1,000+", label: "Businesses served", sub: "Philadelphia region, since 2015" },
    { value: "4", label: "Lanes", sub: "AEO/GEO · AI Design · AI Marketing · AI Automation" },
    { value: "4 + 4", label: "Flagships + roadmap", sub: "One of each behind every lane" },
  ], { y: s._top + 0.12, x: d.M, w: 8.1, size: 38, bottom: 5.05 });
  d.hair(s, { x: d.M, y: 5.2, w: 8.1, color: C.line });
  d.flow(s, dv.positioning_note, { x: d.M, y: 5.45, w: 7.9, size: 13, color: C.slate, spacing: 1.34 });
  d.block(s, {
    x: 9.35, y: 1.55, w: 3.4, h: 4.6, dark: true, pad: 0,
    eyebrow: "The thesis",
    head: "Every offer ships\nwith its agent.",
    headSize: 22,
    bullets: [
      "Hours per client is an acceptance metric of the offer itself, measured monthly",
      "A division whose product is one person's hours is a consultancy with a chatbot",
      "The lockup is the existing mark plus AI. No new logo (decision D19)",
    ],
    bodySize: 12,
  });
  d.foot(s, PROPOSED);
  d.notes(s, "Lead with what has already run: Puttery attribution spine with passing suites, ten prospect homepages from one engine, this deck from a brand file, two 4K films for 278 credits, two 16-page audits that reached the quote stage. The division sells that.", [SRC.division, SRC.lanes]);
}

// ───────────────────────────────────────────────────────────────── A3 the finding
{
  const s = d.slide({
    kicker: "The question Mac asked on September 4",
    title: "Has outbound started?\nYes. Here is what it did.",
    titleW: 8.4,
    panel: { side: "right", size: 4.6, fill: C.navy }, logoDark: true,
  });
  let y = d.stat(s, { x: d.M, y: 2.75, w: 3.6, value: "241", size: 84, color: C.orange, label: "Cold emails sent", sub: "Two waves, Sept 2–3, from Dillon's Gmail" });
  d.stat(s, { x: d.M + 4.0, y: 2.75, w: 3.6, value: "0", size: 84, color: C.ink, label: "Verified human replies", sub: "Two bounces, two auto-replies. No bounce is not proof of delivery." });
  d.hair(s, { x: d.M, y: 5.35, w: 7.9, color: C.line });
  d.flow(s, offers.finding_241.contrast, { x: d.M, y: 5.55, w: 7.9, size: 14, color: C.ink, bold: true, spacing: 1.3 });
  d.block(s, {
    x: 9.1, y: 1.55, w: 3.65, h: 4.9, dark: true, pad: 0,
    eyebrow: "What it means",
    head: "The audit is the\nopener that works.",
    headSize: 21,
    bullets: [
      "The Snapshot makes the audit repeatable and lets Jesse run it",
      "Reporting is defined before the next send: sends, replies, quotes, signed, collected, as five counts",
      "No further send is authorised by the September plan (decision D10)",
    ],
    bodySize: 12,
  });
  d.foot(s, "Reconciled from Gmail SENT on September 3, 2026. Audit outcomes from the pre-sale audit package status, verified September 3.");
  d.notes(s, "This is the honest answer to Mac's outbound question, and it is the argument for an audit-led funnel. Say the numbers plainly and move to the opener.", [SRC.gmail, SRC.audits]);
}

// ───────────────────────────────────────────────────────────────── A4 the opener
{
  const op = offers.opener;
  const s = d.slide({
    kicker: `The opener · ${op.price}`,
    title: op.name,
    sub: "A generated, branded audit from one URL: can AI systems read the site, and does it say what the business is.",
  });
  d.steps(s, [
    { head: "One URL", body: "The prospect's homepage. Nothing else is needed to start." },
    { head: "Readiness checks", body: "Can AI crawlers read it, is the business typed correctly, sitemap, canonical, FAQ, phone and address." },
    { head: "Twenty questions", body: "Human-run on two named engines, recorded with date and citations. Never scraped." },
    { head: "Branded report", body: "Three to five pages in the Momentum system. Fifteen minutes to produce." },
    { head: "Next step", body: "Routes to the free audit page. Deeper diagnosis is paid." },
  ], { y: s._top + 0.05, height: 1.75, bottom: 5.25 });
  d.hair(s, { x: d.M, y: 5.35, w: d.CW, color: C.line });
  let ky = d.kicker(s, "Why this and not cold email", { x: d.M, y: 5.5, w: 7.6 });
  d.flow(s, op.why, { x: d.M, y: ky, w: 7.6, size: 12, color: C.slate, spacing: 1.32 });
  let ny = d.kicker(s, "Never", { x: 8.6, y: 5.5, w: 4.1 });
  d.flow(s, op.never, { x: 8.6, y: ny, w: 4.1, size: 12, color: C.ink, bold: true, spacing: 1.3 });
  d.foot(s, "Mac proposed this on August 12. Generator v1 exists and ran on needmomentum.com on September 5: its top finding is that the agency's own robots.txt names no AI crawler.");
  d.notes(s, "Demo this live on Momentum's own domain. Show the host-challenge finding honestly: from a datacenter every automated identity is challenged, so AI-crawler access is reported as not observed, not asserted.", [SRC.offers, "clients/momentum-360/deliverables/2026-09-05-ai-division-launch-kit/snapshot/README.md"]);
}

// ───────────────────────────────────────────────────────────────── A5 four lanes
{
  const s = d.slide({ kicker: "Four lanes, four flagships", title: "What we sell, lane by lane" });
  d.rows(s, lanes.map((l) => ({
    head: `${l.n}  ${l.name}`,
    body: `${l.line}. ${l.flagship.name}: ${l.flagship.outcome}`,
  })), { x: d.M, y: 2.35, w: d.CW, headW: 3.3, headSize: 16, bodySize: 12.5, gap: 0.3, bottom: d.BOT });
  d.foot(s, PROPOSED);
  d.notes(s, "The lanes are Mac's; the flagships are Dillon's proposal for what launches first. Each ships with its agent and an hours-per-client target.", [SRC.lanes, SRC.offers]);
}

// ───────────────────────────────────────────────────────────────── A6 pricing
{
  const s = d.slide({ kicker: "Proposed pricing · not agreed", title: "Four flagships, four roadmap offers" });
  const rows = [["Lane", "Launch flagship", "Setup", "Monthly", "Hours target", "Roadmap · next"]];
  for (const l of lanes) {
    const f = l.flagship;
    rows.push([
      `${l.n} ${l.name}`, f.name, f.setup, f.monthly || "fixed",
      f.hours_target.split(".")[0], `${l.next.name} · ${l.next.price}`,
    ]);
  }
  d.table(s, rows, { x: d.M, y: 2.4, w: d.CW, colW: [1.7, 2.6, 0.95, 0.95, 2.6, 2.97], rowH: 0.62, fontSize: 11 });
  d.hair(s, { x: d.M, y: 5.75, w: d.CW, color: C.line });
  d.flow(s, "Anchors: Fagan Painting bought AEO/GEO at $500/month for 90 days; GT Clinic was quoted $900/month after an audit; Deborah Mara signed a $500/month ChatGPT Ads lane; the Puttery build was proposed at $2,500 to $3,500; published floor $1,000/month, custom $3,000/month, design package $3,000.", {
    x: d.M, y: 5.9, w: d.CW, size: 11, color: C.slate, spacing: 1.3,
  });
  d.foot(s, `${PROPOSED} Decisions D04, D05, D06 and D20.`);
  d.notes(s, "Do not quote any of these to a prospect. They are anchored to what has actually been sold or quoted and they are Mac's to set.", [SRC.offers, SRC.register]);
}

// ───────────────────────────────────────────────────────────────── A7 economics
{
  const s = d.slide({ kicker: "Economics · under the pack's own assumptions", title: "What the cohort contributes" });
  const rows = [["Scenario", "Monthly revenue", "Hours", "Contribution"]];
  for (const r of econ.scenarios) {
    rows.push([r.scenario, `$${r.monthly_revenue.toLocaleString("en-US")}`, String(r.monthly_delivery_hours),
      `${r.monthly_contribution < 0 ? "−" : ""}$${Math.abs(r.monthly_contribution).toLocaleString("en-US")}`]);
  }
  const sb = econ.spec_build_one_time;
  rows.push(["Plus one Spec build in the month", `+$${sb.price.toLocaleString("en-US")} once`, `+${sb.hours}`, `+$${sb.contribution_before_fixed_cost.toLocaleString("en-US")} once`]);
  d.table(s, rows, { x: d.M, y: s._top + 0.1, w: d.CW, colW: [5.2, 2.4, 1.6, 2.57], rowH: 0.5, fontSize: 12 });
  d.hair(s, { x: d.M, y: 5.6, w: d.CW, color: C.line });
  d.flow(s, `${offers.economics.assumptions} ${offers.economics.caveat}`, { x: d.M, y: 5.75, w: d.CW, size: 11, color: C.slate, spacing: 1.3 });
  d.foot(s, "Calculations under assumptions. Not revenue, not profit. Booked, invoiced and collected stay separate.");
  d.notes(s, "The double-hours row is the whole argument for hours-per-client as an acceptance metric: at double hours the recurring cohort loses money. Rows are produced by the September 4 pack's economics engine, not typed.", [SRC.econ]);
}

// ───────────────────────────────────────────────────────────────── A8 decisions
{
  const first = decisions.decisions.filter((x) => ["D01", "D02", "D03", "D04", "D05", "D06", "D07", "D19"].includes(x.id));
  const rest = decisions.decisions.length - first.length;
  const s = d.slide({
    kicker: `Before anything is sold · ${decisions.decisions.length} open decisions`,
    title: "What Friday has to settle",
    sub: `The eight that block the launch. ${rest} more are in the register.`,
  });
  d.rows(s, first.map((x) => ({ head: `${x.id}  ${x.topic}`, body: x.question })),
    { x: d.M, y: s._top, w: d.CW, headW: 3.6, headSize: 13, bodySize: 11, gap: 0.1, bottom: d.BOT });
  d.foot(s, "Nothing here is agreed. Record declined and deferred items too.");
  d.notes(s, "Close on the register, not on enthusiasm. The meeting output is a decision sheet. Owners: prices, compensation, capacity, support coverage and the name are Mac's; the offer architecture and visual direction are Dillon's proposals.", [SRC.register]);
}

// ───────────────────────────────────────────────────────────────── save
const outDir = path.join(HERE, "output");
fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, "Momentum-AI-Division-Addendum.pptx");
await d.save(out);
console.log(`wrote ${out}`);
