import { spawnSync } from "node:child_process";
import path from "node:path";

const SITE_ID = "18b876ce-8ac2-45d0-a1c0-dc9a51ad1637";
const mode = process.argv[2] || "forms";
const formId = process.argv[3];
const method = mode === "submissions" ? "listFormSubmissions" : "listSiteForms";

if (mode === "submissions" && !formId) {
  throw new Error("Usage: node tools/netlify-form-intake.mjs submissions <form-id>");
}

const netlifyEntry = path.join(
  process.env.APPDATA,
  "npm",
  "node_modules",
  "netlify-cli",
  "bin",
  "run.js",
);
const data =
  mode === "submissions" ? { form_id: formId } : { site_id: SITE_ID };
const result = spawnSync(
  process.execPath,
  [netlifyEntry, "api", method, "--data", JSON.stringify(data)],
  {
    cwd: path.resolve(import.meta.dirname, ".."),
    encoding: "utf8",
    windowsHide: true,
  },
);

if (result.status !== 0) {
  throw new Error(result.stderr.trim() || `Netlify ${method} failed.`);
}

const parsed = JSON.parse(result.stdout);
process.stdout.write(`${JSON.stringify(parsed)}\n`);
