#!/usr/bin/env node
// Query the Google Ads API with the manager account set as login-customer-id.
// This is the header no connector in the stack sets, and its absence is why every
// Composio GAQL call returns USER_PERMISSION_DENIED.
//
//   node scripts/google-ads-query.mjs <customerId> "<GAQL>"
//   node scripts/google-ads-query.mjs --accounts          list accounts under the MCC
//   node scripts/google-ads-query.mjs --selfcheck         verify config without calling out
//
// Credentials come from the environment only. Never hard-code them, never commit
// them, and never print them. Set in PowerShell for the current session:
//
//   $env:GOOGLE_ADS_CLIENT_ID     = "..."
//   $env:GOOGLE_ADS_CLIENT_SECRET = "..."
//   $env:GOOGLE_ADS_REFRESH_TOKEN = "..."
//   $env:GOOGLE_ADS_DEVELOPER_TOKEN = "..."   # still sent as a header
//
// Requires Explorer access or above on the Cloud project. Test-level access only
// reaches test accounts and returns permission errors against production.

const MANAGER_ID = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || "7038673437"; // Dillon Mohr Hermes Agent
const API_VERSION = "v23";

const REQUIRED = [
  "GOOGLE_ADS_CLIENT_ID",
  "GOOGLE_ADS_CLIENT_SECRET",
  "GOOGLE_ADS_REFRESH_TOKEN",
  "GOOGLE_ADS_DEVELOPER_TOKEN",
];

const digits = (s) => String(s || "").replace(/\D/g, "");

function checkEnv() {
  const missing = REQUIRED.filter((k) => !process.env[k]);
  return { ok: missing.length === 0, missing };
}

async function accessToken() {
  const body = new URLSearchParams({
    client_id: process.env.GOOGLE_ADS_CLIENT_ID,
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
    refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
    grant_type: "refresh_token",
  });
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const j = await r.json();
  // Surface the error type but never the token itself.
  if (!r.ok) throw new Error(`token exchange failed ${r.status}: ${j.error || "unknown"}`);
  return j.access_token;
}

async function gaql(customerId, query) {
  const token = await accessToken();
  const cid = digits(customerId);
  const r = await fetch(
    `https://googleads.googleapis.com/${API_VERSION}/customers/${cid}/googleAds:searchStream`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "developer-token": process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
        // The whole point. Without this, production child accounts return
        // USER_PERMISSION_DENIED even when the user can see them in the UI.
        "login-customer-id": digits(MANAGER_ID),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    },
  );
  const text = await r.text();
  if (!r.ok) throw new Error(`googleAds ${r.status}\n${text.slice(0, 900)}`);
  const batches = JSON.parse(text);
  return batches.flatMap((b) => b.results || []);
}

const ACCOUNTS_QUERY = `
  SELECT customer_client.id, customer_client.descriptive_name,
         customer_client.manager, customer_client.status, customer_client.level
  FROM customer_client
  WHERE customer_client.status = 'ENABLED'`;

const [arg1, arg2] = process.argv.slice(2);

if (arg1 === "--selfcheck") {
  const { ok, missing } = checkEnv();
  console.log(
    JSON.stringify(
      {
        loginCustomerId: digits(MANAGER_ID),
        apiVersion: API_VERSION,
        credentialsPresent: ok,
        missing, // names only, never values
      },
      null,
      2,
    ),
  );
  process.exit(ok ? 0 : 1);
}

const { ok, missing } = checkEnv();
if (!ok) {
  console.error(`Missing environment variables: ${missing.join(", ")}`);
  console.error("Set them in your shell. This script never reads them from a file.");
  process.exit(1);
}

try {
  if (arg1 === "--accounts") {
    const rows = await gaql(MANAGER_ID, ACCOUNTS_QUERY);
    for (const r of rows) {
      const c = r.customerClient || {};
      console.log(
        `${String(c.id).padEnd(12)} ${c.manager ? "MANAGER" : "client "} L${c.level ?? "?"}  ${c.descriptiveName || ""}`,
      );
    }
    console.log(`\n${rows.length} accounts under ${digits(MANAGER_ID)}`);
  } else if (arg1 && arg2) {
    const rows = await gaql(arg1, arg2);
    console.log(JSON.stringify(rows, null, 2));
  } else {
    console.error('usage: google-ads-query.mjs <customerId> "<GAQL>" | --accounts | --selfcheck');
    process.exit(1);
  }
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
