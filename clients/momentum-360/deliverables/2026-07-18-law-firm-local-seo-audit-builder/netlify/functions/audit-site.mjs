import dns from "node:dns/promises";
import net from "node:net";

const MAX_BYTES = 2_000_000;
const TIMEOUT_MS = 10_000;

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "content-type",
  },
});

function isPrivateIp(address) {
  if (net.isIPv4(address)) {
    const [a, b] = address.split(".").map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
  }
  const normalized = address.toLowerCase();
  return normalized === "::1" || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe80:") || normalized === "::";
}

async function validatePublicUrl(input) {
  const candidate = /^https?:\/\//i.test(input) ? input : `https://${input}`;
  const url = new URL(candidate);
  if (!/^https?:$/.test(url.protocol)) throw new Error("Only public HTTP or HTTPS websites can be checked.");
  if (url.username || url.password) throw new Error("URLs containing credentials are not supported.");
  if (["localhost", "localhost.localdomain"].includes(url.hostname.toLowerCase())) throw new Error("Private hosts cannot be checked.");
  const records = await dns.lookup(url.hostname, { all: true });
  if (!records.length || records.some((record) => isPrivateIp(record.address))) throw new Error("Private or unresolved hosts cannot be checked.");
  return url;
}

async function fetchHtml(initialUrl) {
  let url = initialUrl;
  for (let redirects = 0; redirects <= 3; redirects += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let response;
    try {
      response = await fetch(url, {
        redirect: "manual",
        signal: controller.signal,
        headers: { "user-agent": "MomentumDigitalPublicSiteAudit/1.0" },
      });
    } finally {
      clearTimeout(timer);
    }

    if (response.status >= 300 && response.status < 400 && response.headers.get("location")) {
      url = await validatePublicUrl(new URL(response.headers.get("location"), url).href);
      continue;
    }
    if (!response.ok) throw new Error(`The website returned HTTP ${response.status}.`);
    const type = response.headers.get("content-type") || "";
    if (!type.includes("text/html")) throw new Error("The URL did not return an HTML page.");
    const declaredLength = Number(response.headers.get("content-length") || 0);
    if (declaredLength > MAX_BYTES) throw new Error("The page is too large for this bounded check.");
    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > MAX_BYTES) throw new Error("The page is too large for this bounded check.");
    return { html: new TextDecoder().decode(buffer), finalUrl: url.href };
  }
  throw new Error("The website redirected too many times.");
}

const first = (html, regex) => (html.match(regex)?.[1] || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const count = (html, regex) => [...html.matchAll(regex)].length;
const includesTerm = (text, term) => term && text.toLowerCase().includes(term.toLowerCase());

function analyze(html, finalUrl, city, practice) {
  const title = first(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const description = first(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i)
    || first(html, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["'][^>]*>/i);
  const h1Count = count(html, /<h1\b[^>]*>/gi);
  const canonical = /<link[^>]+rel=["'][^"']*canonical[^"']*["'][^>]*>/i.test(html);
  const viewport = /<meta[^>]+name=["']viewport["']/i.test(html);
  const schemaText = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1]).join(" ");
  const localSchema = /"@type"\s*:\s*(?:\[[^\]]*)?["'](?:Attorney|LegalService|LocalBusiness)["']/i.test(schemaText);
  const visibleText = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  const phone = /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/.test(visibleText);
  const address = /\b\d{1,6}\s+[A-Za-z0-9.' -]+\s(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Way|Court|Ct)\b/i.test(visibleText);
  const cityPresent = includesTerm(`${title} ${description} ${visibleText}`, city);
  const practicePresent = includesTerm(`${title} ${description} ${visibleText}`, practice);
  const https = finalUrl.startsWith("https://");

  const findings = [];
  const add = (label, status, detail, points, earned) => findings.push({ label, status, detail, points, earned });
  add("Secure website", https ? "pass" : "fail", https ? "The final page uses HTTPS." : "The final page is not served over HTTPS.", 8, https ? 8 : 0);
  add("Mobile setup", viewport ? "pass" : "fail", viewport ? "A mobile viewport is declared." : "No mobile viewport declaration was found.", 8, viewport ? 8 : 0);
  add("Page title", title.length >= 20 && title.length <= 65 ? "pass" : "warn", title ? `Title length: ${title.length} characters.` : "No page title was found.", 10, title.length >= 20 && title.length <= 65 ? 10 : title ? 4 : 0);
  add("Search description", description.length >= 70 && description.length <= 165 ? "pass" : "warn", description ? `Description length: ${description.length} characters.` : "No meta description was found.", 10, description.length >= 70 && description.length <= 165 ? 10 : description ? 4 : 0);
  add("Primary heading", h1Count === 1 ? "pass" : "warn", h1Count === 1 ? "One clear H1 was found." : `${h1Count} H1 headings were found.`, 8, h1Count === 1 ? 8 : 2);
  add("Canonical URL", canonical ? "pass" : "warn", canonical ? "A canonical URL is declared." : "No canonical URL was found.", 6, canonical ? 6 : 0);
  add("Law-firm schema", localSchema ? "pass" : "fail", localSchema ? "Attorney, LegalService, or LocalBusiness schema was found." : "No Attorney, LegalService, or LocalBusiness schema was found.", 12, localSchema ? 12 : 0);
  add("City relevance", cityPresent ? "pass" : "warn", cityPresent ? `${city} appears in visible search signals.` : `${city || "The target city"} was not found in the main page signals.`, 8, cityPresent ? 8 : 0);
  add("Practice relevance", practicePresent ? "pass" : "warn", practicePresent ? `${practice} appears in visible search signals.` : `${practice || "The practice area"} was not found in the main page signals.`, 8, practicePresent ? 8 : 0);
  add("Contact signals", phone && address ? "pass" : "warn", phone && address ? "A phone number and street address were found." : `Phone: ${phone ? "found" : "missing"}. Address: ${address ? "found" : "missing"}.`, 10, (phone ? 5 : 0) + (address ? 5 : 0));
  add("Public response", "pass", "The public home page returned successfully.", 10, 10);

  const available = findings.reduce((sum, item) => sum + item.points, 0);
  const earned = findings.reduce((sum, item) => sum + item.earned, 0);
  const score = Math.round((earned / available) * 100);
  const gaps = findings.filter((item) => item.status !== "pass").length;
  return {
    score,
    findings,
    summary: gaps ? `${gaps} priority signal${gaps === 1 ? "" : "s"} need review before the local profile and website can reinforce each other.` : "The checked home page has a strong technical and local-relevance foundation.",
  };
}

export default async (request) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type" } });
  if (request.method !== "POST") return json({ error: "Use POST for a bounded public website check." }, 405);
  try {
    const body = await request.json();
    const rawUrl = String(body.url || "").trim();
    if (!rawUrl) return json({ error: "A public website URL is required." }, 400);
    const url = await validatePublicUrl(rawUrl);
    const { html, finalUrl } = await fetchHtml(url);
    const result = analyze(html, finalUrl, String(body.city || "").trim(), String(body.practice || "").trim());
    return json({ ...result, finalUrl, observedAt: new Date().toISOString() });
  } catch (error) {
    const message = error.name === "AbortError" ? "The website check timed out." : error.message;
    return json({ error: message || "The website could not be checked." }, 400);
  }
};
