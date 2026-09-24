import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const designPath = join(root, "DESIGN.md");
const sidecarPath = join(root, ".impeccable", "design.json");
const markdown = readFileSync(designPath, "utf8");
const sidecar = JSON.parse(readFileSync(sidecarPath, "utf8"));

function section(name, nextName) {
  const start = markdown.indexOf(`## ${name}`);
  if (start < 0) return "";
  const end = nextName ? markdown.indexOf(`## ${nextName}`, start + 3) : markdown.length;
  return markdown.slice(start, end < 0 ? markdown.length : end);
}

const overviewSection = section("Overview", "Colors");
const northStar = overviewSection.match(/\*\*Creative North Star: "([^"]+)"\*\*/)?.[1] || "";
const overview = overviewSection
  .replace(/^## Overview\s*/m, "")
  .replace(/\*\*Creative North Star:[^\n]+\*\*\s*/m, "")
  .split("**Key Characteristics:**")[0]
  .trim();
const keyCharacteristics = (overviewSection.split("**Key Characteristics:**")[1] || "")
  .split("\n")
  .map((line) => line.match(/^- (.+)$/)?.[1])
  .filter(Boolean);

const ruleSections = [
  ["colors", section("Colors", "Typography")],
  ["typography", section("Typography", "Layout")],
  ["layout", section("Layout", "Elevation & Depth")],
  ["elevation", section("Elevation & Depth", "Shapes")],
  ["shapes", section("Shapes", "Components")]
];
const rules = ruleSections.flatMap(([sectionName, text]) =>
  [...text.matchAll(/\*\*The ([^*]+ Rule)\.\*\*\s*([^\n]+)/g)].map((match) => ({
    name: `The ${match[1]}`,
    body: match[2].trim(),
    section: sectionName
  }))
);

const dosDonts = section("Do's and Don'ts", null);
const [dosText = "", dontsText = ""] = dosDonts.split("### Don't:");
const dos = dosText
  .split("\n")
  .map((line) => line.match(/^- \*\*Do\*\* (.+)$/)?.[1])
  .filter(Boolean)
  .map((line) => `Do ${line}`);
const donts = dontsText
  .split("\n")
  .map((line) => line.match(/^- \*\*Don't\*\* (.+)$/)?.[1])
  .filter(Boolean)
  .map((line) => `Don't ${line}`);

sidecar.generatedAt = new Date().toISOString();
sidecar.extensions.motion = sidecar.extensions.motion
  .filter((entry) => !["press-pulse", "press-builder-swim", "press-system-snap"].includes(entry.name))
  .map((entry) =>
    entry.name === "logo-resolve"
      ? {
          ...entry,
          value: "2700ms total; 650ms canvas exit",
          purpose: "Orange Press keeps the exact logo sharp throughout, then removes the bottom-stage particle canvas completely."
        }
      : entry
  );
sidecar.extensions.motion.push({
  name: "press-builder-swim",
  value: "first step within 1750ms; one centered card every 4800ms; reversible at rail edges",
  purpose: "Snaps the five canonical builder scenes in readable steps with mouse drag, touch swipe, arrow, Home, End, focus, and reduced-motion parity."
});
sidecar.extensions.motion.push({
  name: "press-system-snap",
  value: "first step within 1750ms; one centered card every 4400ms",
  purpose: "Moves the six connected marketing disciplines with the same active-index and direct-manipulation grammar as the builder rail."
});

const pressAction = sidecar.components.find((component) => component.name === "Press Primary Action");
if (pressAction) {
  pressAction.description = "Hard-edged ink action using the canonical low-pressure appointment language.";
  pressAction.html = '<a class="ds-btn-press" href="#">Schedule a Non-Sales Call</a>';
}

const mediaCaption = sidecar.components.find((component) => component.name === "Media Caption");
if (mediaCaption) {
  mediaCaption.description = "Compact builder-context label for a real working decision or proof role.";
  mediaCaption.html = '<span class="ds-media-caption">The thinking behind the work belongs in the foreground.</span>';
}

const existingSwim = sidecar.components.findIndex((component) => component.name === "Orange Press Builder Swim");
const swimComponent = {
  name: "Orange Press Builder Swim",
  kind: "custom",
  description: "Five source-approved home-building scenes in a one-card snap rail with visible press-note pop, mouse drag, touch swipe, controls, and keyboard parity.",
  html: '<div class="ds-builder-swim" tabindex="0"><figure><img alt="Builder reviewing plans"><figcaption>Where do you build, and what belongs in your wheelhouse?</figcaption></figure><figure><img alt="Builder walkthrough"><figcaption>What does working with your team actually feel like?</figcaption></figure></div>',
  css: ".ds-builder-swim{display:flex;width:100%;overflow-x:auto;border:1px solid #090909;background:#f47721}.ds-builder-swim figure{width:24rem;flex:0 0 auto;margin:0;border-right:1px solid #090909;background:#f3eee4}.ds-builder-swim img{display:block;width:100%;height:15rem;object-fit:cover}.ds-builder-swim figcaption{padding:1.4rem;font:700 1.15rem/1.15 Unbounded,Arial,sans-serif;letter-spacing:-.03em}.ds-builder-swim:focus-visible{outline:3px solid #090909;outline-offset:5px}"
};
if (existingSwim >= 0) sidecar.components[existingSwim] = swimComponent;
else sidecar.components.push(swimComponent);

sidecar.narrative = { northStar, overview, keyCharacteristics, rules, dos, donts };
writeFileSync(sidecarPath, `${JSON.stringify(sidecar, null, 2)}\n`);
console.log(sidecarPath);
