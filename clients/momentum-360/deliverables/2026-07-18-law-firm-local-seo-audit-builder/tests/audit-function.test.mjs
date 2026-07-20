import auditSite from "../netlify/functions/audit-site.mjs";

const assert = (condition, message) => { if (!condition) throw new Error(message); };

const missing = await auditSite(new Request("http://local.test/.netlify/functions/audit-site", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({}),
}));
assert(missing.status === 400, "Missing URL must fail closed.");

const privateHost = await auditSite(new Request("http://local.test/.netlify/functions/audit-site", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ url: "http://127.0.0.1" }),
}));
assert(privateHost.status === 400, "Private hosts must fail closed.");

const publicSite = await auditSite(new Request("http://local.test/.netlify/functions/audit-site", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ url: "https://example.com", city: "Philadelphia", practice: "Personal Injury" }),
}));
assert(publicSite.status === 200, "A public HTML site must return an audit.");
const payload = await publicSite.json();
assert(Number.isInteger(payload.score), "Audit score must be an integer.");
assert(Array.isArray(payload.findings) && payload.findings.length >= 8, "Audit must return bounded findings.");
assert(payload.finalUrl.startsWith("https://"), "Final URL must be reported.");

console.log(JSON.stringify({ status: "passed", score: payload.score, findingCount: payload.findings.length }));
