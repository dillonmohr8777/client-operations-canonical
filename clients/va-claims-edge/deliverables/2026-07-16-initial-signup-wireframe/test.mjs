import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("./", import.meta.url);
const html = await readFile(new URL("index.html", root), "utf8");
const css = await readFile(new URL("styles.css", root), "utf8");
const js = await readFile(new URL("app.js", root), "utf8");

for (const required of [
  "Create your account",
  "Confirm the basics",
  "Email address",
  "Password",
  "Full name",
  "Mobile phone",
  "Preferred account alerts",
  "Create account",
  "Enter portal preview",
]) assert.ok(html.includes(required), `missing signup requirement: ${required}`);

assert.ok(html.includes("No account is created and no information is transmitted or stored."));
assert.ok(html.includes("medical details belong inside the secure portal"));
assert.ok(html.includes("aria-live=\"polite\""));
assert.ok(html.includes("autocomplete=\"new-password\""));
assert.ok(html.includes("https://6a58117812cadf5a771ad0ac--vace-wireframes.netlify.app"));
assert.ok(html.includes('assets/va-claims-edge-logo.png'));
assert.ok(css.includes('assets/shield-motion-ribbons.png'));
for (const brandToken of ["#323763", "#a83232", "#f7f5ef", "#61d8d0", "#080d1b"]) {
  assert.ok(css.includes(brandToken), `missing portal brand token: ${brandToken}`);
}
assert.match(js, /validateStepOne/);
assert.match(js, /validateStepTwo/);
assert.match(js, /form\.reset\(\)/);
assert.doesNotMatch(js, /fetch\s*\(/, "review prototype must make no network submissions");
assert.doesNotMatch(js, /localStorage|sessionStorage/, "review prototype must not retain entered data");
assert.match(css, /@media \(max-width: 560px\)/);
assert.match(css, /prefers-reduced-motion/);

console.log("VA Claims Edge signup wireframe checks passed.");
