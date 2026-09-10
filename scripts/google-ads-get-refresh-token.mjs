#!/usr/bin/env node
// One-time helper: exchange a Google OAuth consent for a refresh token.
//
// RUN THIS YOURSELF. It prints a refresh token to your terminal. Do not paste the
// output into a chat, a file, or a commit. Nothing here writes to disk.
//
//   $env:GOOGLE_ADS_CLIENT_ID     = "...apps.googleusercontent.com"
//   $env:GOOGLE_ADS_CLIENT_SECRET = "..."
//   node scripts/google-ads-get-refresh-token.mjs
//
// The OAuth client must be type "Web application" with this exact redirect URI
// registered: http://localhost:8720/oauth2callback

import { createServer } from "node:http";
import { spawn } from "node:child_process";

const PORT = 8720;
const REDIRECT = `http://localhost:${PORT}/oauth2callback`;
const SCOPE = "https://www.googleapis.com/auth/adwords";

const id = process.env.GOOGLE_ADS_CLIENT_ID;
const secret = process.env.GOOGLE_ADS_CLIENT_SECRET;
if (!id || !secret) {
  console.error("Set GOOGLE_ADS_CLIENT_ID and GOOGLE_ADS_CLIENT_SECRET first.");
  process.exit(1);
}

const state = Math.random().toString(36).slice(2);
const authUrl =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    client_id: id,
    redirect_uri: REDIRECT,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent", // forces a refresh token even if previously granted
    state,
  });

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (url.pathname !== "/oauth2callback") {
    res.writeHead(404).end();
    return;
  }
  if (url.searchParams.get("state") !== state) {
    res.writeHead(400).end("state mismatch");
    server.close();
    process.exit(1);
  }
  const code = url.searchParams.get("code");
  if (!code) {
    res.writeHead(400).end(`no code: ${url.searchParams.get("error") || "unknown"}`);
    server.close();
    process.exit(1);
  }

  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: id,
      client_secret: secret,
      redirect_uri: REDIRECT,
      grant_type: "authorization_code",
    }),
  });
  const j = await r.json();

  res.writeHead(200, { "Content-Type": "text/html" });
  res.end("<h2>Done. Return to your terminal.</h2>");
  server.close();

  if (!j.refresh_token) {
    console.error(`No refresh token returned: ${j.error || "unknown"}`);
    console.error("If you have granted before, revoke at myaccount.google.com/permissions and retry.");
    process.exit(1);
  }
  console.log("\nSet this in your shell, then run google-ads-query.mjs --accounts:\n");
  console.log(`$env:GOOGLE_ADS_REFRESH_TOKEN = "${j.refresh_token}"\n`);
  console.log("Treat it like a password. It does not expire on its own.");
  process.exit(0);
});

server.listen(PORT, () => {
  console.log(`Listening on ${REDIRECT}`);
  console.log("Opening the consent screen. Approve with dillonmohr8777@gmail.com.\n");
  spawn("cmd", ["/c", "start", "", authUrl], { detached: true, stdio: "ignore" }).unref();
});
