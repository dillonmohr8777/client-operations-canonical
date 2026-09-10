// Fails if any Google Ads asset would be rejected at upload: over its character
// limit, a duplicate headline inside an ad group, or an RSA short on assets.
// Run: node check-rsa.mjs
import { readFileSync } from "node:fs";

const a = JSON.parse(readFileSync(new URL("./rsa-assets.json", import.meta.url), "utf8"));
const L = a.limits;
const errors = [];
const warn = [];

const over = (s, max, where) => {
  if (s.length > max) errors.push(`${where}: ${s.length}/${max} chars — "${s}"`);
};

for (const g of a.adGroups) {
  if (g.headlines.length < 15) warn.push(`${g.name}: ${g.headlines.length}/15 headlines`);
  if (g.descriptions.length < 4) warn.push(`${g.name}: ${g.descriptions.length}/4 descriptions`);

  const seen = new Set();
  for (const h of g.headlines) {
    over(h.text, L.headline, `${g.name} headline`);
    if (seen.has(h.text)) errors.push(`${g.name}: duplicate headline "${h.text}"`);
    seen.add(h.text);
  }
  for (const d of g.descriptions) over(d.text, L.description, `${g.name} description`);

  // Google needs unpinned assets in each position to rotate; pinning everything kills learning.
  const pinned = g.headlines.filter((h) => h.pin !== null).length;
  if (pinned > 3) warn.push(`${g.name}: ${pinned} pinned headlines — leaves little for Google to test`);
}

for (const s of a.sharedAssets.sitelinks) {
  over(s.text, L.sitelinkText, "sitelink text");
  over(s.d1, L.sitelinkDescription, "sitelink desc1");
  over(s.d2, L.sitelinkDescription, "sitelink desc2");
}
for (const c of a.sharedAssets.callouts) over(c, L.callout, "callout");
for (const v of a.sharedAssets.structuredSnippets.values) over(v, L.snippetValue, "snippet value");

if (errors.length) {
  console.error("FAIL\n" + errors.join("\n"));
  process.exit(1);
}
const counts = a.adGroups.map((g) => `${g.name} (${g.headlines.length}h/${g.descriptions.length}d)`);
console.log(`OK — ${a.adGroups.length} ad groups: ${counts.join(", ")}`);
if (warn.length) console.log("\nWarnings:\n" + warn.join("\n"));
