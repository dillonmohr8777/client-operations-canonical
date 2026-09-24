import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { marked } = require("marked");

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(.:)/, "$1")), "..");
const plan = JSON.parse(fs.readFileSync(path.join(root, "working", "content-plan.json"), "utf8"));
const release = path.join(root, "release");
const htmlDir = path.join(release, "wordpress-ready-html");
const schemaDir = path.join(release, "schema");
fs.mkdirSync(htmlDir, { recursive: true });
fs.mkdirSync(schemaDir, { recursive: true });

const sourceById = {
  "HUB-01": "content/pillar-page-interview-integrated.md",
  "ART-01": "content/supporting-article-01-interview-integrated.md",
  "ART-02": "content/supporting-article-02-interview-integrated.md",
  "STR-01": "content/production-drafts/STR-01-home-builder-marketing-plan.md",
  "VIS-01": "content/production-drafts/VIS-01-seo-local-ai-visibility-home-builders.md",
  "WEB-01": "content/production-drafts/WEB-01-home-builder-website-design.md",
  "AUD-01": "content/production-drafts/AUD-01-custom-home-builder-target-market-segments.md",
  "LEAD-01": "content/production-drafts/LEAD-01-home-builder-lead-generation.md",
  "LOCAL-01": "content/production-drafts/LOCAL-01-local-seo-home-builders.md",
  "NUR-01": "content/production-drafts/NUR-01-home-builder-email-marketing-crm.md",
  "AUTO-01": "content/production-drafts/AUTO-01-home-builder-marketing-automation.md",
  "SOC-01": "content/production-drafts/SOC-01-social-media-marketing-home-builders.md",
  "CNT-01": "content/production-drafts/CNT-01-home-builder-content-marketing.md",
  "GAL-01": "content/production-drafts/GAL-01-best-home-builder-websites.md",
  "TPL-01": "content/production-drafts/TPL-01-home-builder-website-templates.md",
  "SEOCHK-01": "content/production-drafts/SEOCHK-01-home-builder-website-seo-checklist.md",
  "MKTRES-01": "content/production-drafts/MKTRES-01-home-builder-market-research.md",
  "PPC-01": "content/production-drafts/PPC-01-ppc-home-builders.md",
  "CONSULT-01": "content/production-drafts/CONSULT-01-home-builder-marketing-consulting.md"
};

function scalar(value = "") {
  const v = value.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) return v.slice(1, -1);
  return v;
}

function splitFrontmatter(text) {
  const match = text.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n/);
  if (!match) return { meta: {}, body: text };
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const pair = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (pair) meta[pair[1]] = scalar(pair[2]);
  }
  return { meta, body: text.slice(match[0].length) };
}

function schemaBlocks(body) {
  const blocks = [];
  let cleaned = body.replace(/```json\s*([\s\S]*?)```/gi, (whole, raw) => {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && (parsed["@context"] || parsed["@type"] || parsed["@graph"])) {
        blocks.push(parsed);
        return "";
      }
    } catch {}
    return whole;
  });
  cleaned = cleaned.replace(/```html\s*<script\s+type=["']application\/ld\+json["']>\s*([\s\S]*?)\s*<\/script>\s*```/gi, (whole, raw) => {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && (parsed["@context"] || parsed["@type"] || parsed["@graph"])) {
        blocks.push(parsed);
        return "";
      }
    } catch {}
    return whole;
  });
  cleaned = cleaned.replace(/<script\s+type=["']application\/ld\+json["']>\s*([\s\S]*?)\s*<\/script>/gi, (whole, raw) => {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && (parsed["@context"] || parsed["@type"] || parsed["@graph"])) {
        blocks.push(parsed);
        return "";
      }
    } catch {}
    return whole;
  }).replace(/^##\s+(?:JSON-LD(?: candidate)?|Structured Data|Schema(?: Markup)?)\s*$/gim, "");
  return { blocks, cleaned };
}

function articleSchema(asset, meta) {
  const canonical = `https://bigorange.marketing${asset.slug}`;
  return {
    "@type": "Article",
    "@id": `${canonical}#article`,
    headline: asset.title,
    description: meta.meta_description || "",
    mainEntityOfPage: canonical,
    dateModified: "2026-08-28",
    author: { "@type": "Organization", name: "BigOrange Marketing", url: "https://bigorange.marketing/" },
    publisher: { "@type": "Organization", name: "BigOrange Marketing", url: "https://bigorange.marketing/" },
    isPartOf: { "@id": "https://bigorange.marketing/marketing-agency-for-builders/#authority-system" }
  };
}

function csv(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

let hubFaq = null;
const faqText = fs.readFileSync(path.join(root, "content", "faq-set-and-schema-candidate.md"), "utf8");
for (const block of schemaBlocks(faqText).blocks) if (block["@type"] === "FAQPage") hubFaq = block;

const manifest = [["asset_id", "title", "source_file", "slug", "canonical_candidate", "suggested_wordpress_type", "draft_state", "original_scope_state", "cta", "approval_gate", "html_fragment", "schema_file"]];
const links = [["source_asset_id", "source_slug", "target_asset_id", "target_slug", "relationship"]];
const indexRows = [];

for (const asset of plan.assets) {
  const rel = sourceById[asset.asset_id];
  if (!rel || !fs.existsSync(path.join(root, rel))) throw new Error(`Missing source for ${asset.asset_id}: ${rel}`);
  const raw = fs.readFileSync(path.join(root, rel), "utf8");
  const { meta, body } = splitFrontmatter(raw);
  const { blocks, cleaned } = schemaBlocks(body);
  const graph = [articleSchema(asset, meta)];
  if (asset.asset_id === "HUB-01" && hubFaq) graph.push(hubFaq);
  for (const block of blocks) {
    if (Array.isArray(block["@graph"])) graph.push(...block["@graph"].filter(x => x?.["@type"] !== "Article"));
    else if (block["@type"] !== "Article") graph.push(block);
  }
  const schema = { "@context": "https://schema.org", "@graph": graph };
  const html = `<!-- REVIEW DRAFT: factual, permission, leadership, imagery, staging, and publication approval required. -->\n${marked.parse(cleaned, { gfm: true })}`;
  const htmlName = `${asset.asset_id}-${asset.slug.replaceAll("/", "") || "home"}.html`;
  const schemaName = `${asset.asset_id}.schema.json`;
  fs.writeFileSync(path.join(htmlDir, htmlName), html, "utf8");
  fs.writeFileSync(path.join(schemaDir, schemaName), `${JSON.stringify(schema, null, 2)}\n`, "utf8");
  const wpType = asset.asset_id.startsWith("ART-") ? "post" : "page";
  manifest.push([
    asset.asset_id, asset.title, rel, asset.slug, `https://bigorange.marketing${asset.slug}`, wpType,
    "complete local review draft; not approved for staging or publication", asset.scope_state, asset.cta,
    asset.asset_id === "CONSULT-01" ? "leadership offer definition plus standard publication gates" : "Janice or SME review where applicable; leadership; imagery; staging; exact-revision publication approval",
    `wordpress-ready-html/${htmlName}`, `schema/${schemaName}`
  ]);
  indexRows.push(`| ${asset.asset_id} | ${asset.title} | ${rel} | ${asset.slug} | Complete local review draft |`);
  for (const targetId of asset.internal_links.split(/\s*,\s*/).filter(Boolean)) {
    const target = plan.assets.find(x => x.asset_id === targetId);
    if (target) links.push([asset.asset_id, asset.slug, targetId, target.slug, targetId === "HUB-01" ? "supporting-to-hub" : "related-reader-job"]);
  }
}

fs.writeFileSync(path.join(release, "publication-manifest.csv"), `${manifest.map(r => r.map(csv).join(",")).join("\r\n")}\r\n`, "utf8");
fs.writeFileSync(path.join(release, "internal-link-map.csv"), `${links.map(r => r.map(csv).join(",")).join("\r\n")}\r\n`, "utf8");

const readme = `# BigOrange 19-Asset Content Production Release\n\nPrepared: August 28, 2026\n\nStatus: Complete local review package. Nothing in this release is approved for staging, publication, sending, or performance claims.\n\n## Package truth\n\n- 19 of 19 owned URL assets have complete local review drafts.\n- 62 keyword decisions remain owned by one URL or rejected.\n- HTML fragments and JSON-LD are implementation candidates, not live WordPress state.\n- The original pilot included three production drafts. The other 16 are a Dillon-authorized local production extension and do not change the original 35-hour, $30/hour, $1,050 commercial record.\n- Janice-derived language remains held wherever public-use permission is unresolved.\n- CONSULT-01 remains blocked on a leadership offer definition even though its decision-support draft is complete.\n\n## Asset register\n\n| ID | Asset | Source | Proposed slug | Current state |\n| --- | --- | --- | --- | --- |\n${indexRows.join("\n")}\n\n## Implementation files\n\n- \`publication-manifest.csv\`: title, target, suggested WordPress type, source, and exact gate.\n- \`internal-link-map.csv\`: reciprocal cluster-link specification.\n- \`wordpress-ready-html/\`: body fragments with a review-state warning comment.\n- \`schema/\`: one candidate JSON-LD graph per URL. Verify against the final visible page and existing plugin output before installation.\n- \`qa/\`: machine-readable and human-readable content QA.\n\n## Human gates still open\n\n1. Janice factual and public-use review for interview-derived language.\n2. Leadership approval of audience, offers, claims, direction, imagery, owners, and qualified-lead definition.\n3. Exact WordPress staging target, rollback owner, and implementation owner.\n4. Final visible-copy-to-schema match, duplicate-schema check, accessibility, performance, analytics, CRM, link, form, mobile, and desktop QA.\n5. Publication approval for the exact staged revision and separate live readback.\n`;
const packagedReadme = readme.replace(
  "- `qa/`: machine-readable and human-readable content QA.",
  "- `qa/`: machine-readable and human-readable content QA.\n- `qa/release-integrity.json` and `.md`: external sidecars that validate the final ZIP and are intentionally excluded from that archive."
);
fs.writeFileSync(path.join(release, "CONTENT-SYSTEM-INDEX.md"), packagedReadme, "utf8");

console.log(JSON.stringify({ root, release, assets: plan.assets.length, html: fs.readdirSync(htmlDir).length, schema: fs.readdirSync(schemaDir).length }, null, 2));
