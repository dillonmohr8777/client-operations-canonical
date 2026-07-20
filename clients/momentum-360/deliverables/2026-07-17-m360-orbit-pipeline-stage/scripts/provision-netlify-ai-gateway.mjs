import { readFile } from "node:fs/promises";
import { NetlifyAPI } from "file:///C:/Users/dillo/AppData/Roaming/npm/node_modules/netlify-cli/node_modules/@netlify/api/lib/index.js";

const siteId = "23593af3-5616-48ac-be33-ede055a79b48";
const accountId = "6998945d3cc9912eb1897c08";
const configPath = "C:/Users/dillo/AppData/Roaming/netlify/Config/config.json";

const config = JSON.parse(await readFile(configPath, "utf8"));
const user = Object.values(config.users || {})[0];
if (!user?.auth?.token) throw new Error("Netlify CLI authentication is unavailable.");

const api = new NetlifyAPI(user.auth.token);

const managedKeys = ["NETLIFY_AI_GATEWAY_KEY", "NETLIFY_AI_GATEWAY_URL"];
if (process.argv.includes("--remove")) {
  const existing = await api.getEnvVars({ accountId, siteId });
  const existingKeys = new Set(existing.map(({ key }) => key));
  for (const key of managedKeys) {
    if (existingKeys.has(key)) await api.deleteEnvVar({ accountId, siteId, key });
  }
  console.log(JSON.stringify({ removed: true, siteId, variables: managedKeys }));
  process.exit(0);
}

const gateway = await api.getAIGatewayToken({ siteId });
if (!gateway?.token || !gateway?.url) throw new Error("Netlify did not return a project AI Gateway credential.");

const desired = [
  { key: "NETLIFY_AI_GATEWAY_KEY", value: gateway.token },
  { key: "NETLIFY_AI_GATEWAY_URL", value: gateway.url },
];
const existing = await api.getEnvVars({ accountId, siteId });

for (const variable of desired) {
  const body = {
    key: variable.key,
    is_secret: true,
    scopes: ["functions"],
    values: [
      { context: "production", value: variable.value },
      { context: "deploy-preview", value: variable.value },
      { context: "branch-deploy", value: variable.value },
    ],
  };
  if (existing.some((entry) => entry.key === variable.key)) {
    await api.updateEnvVar({ accountId, siteId, key: variable.key, body });
  } else {
    await api.createEnvVars({ accountId, siteId, body: [body] });
  }
}

const expiresInMinutes = gateway.expires_at ? Math.max(0, Math.round((gateway.expires_at * 1000 - Date.now()) / 60000)) : null;
console.log(JSON.stringify({ provisioned: true, siteId, variables: desired.map(({ key }) => key), expiresInMinutes }));
