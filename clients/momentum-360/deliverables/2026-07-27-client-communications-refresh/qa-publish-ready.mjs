import fs from "node:fs/promises";
import path from "node:path";

const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const manifest = JSON.parse(
  await fs.readFile(path.join(root, "publish-ready-manifest.json"), "utf8"),
);
const failures = [];

const requiredDashboards = {
  "kimberly-james-bridal":
    "https://kimberly-james-bridal-2026-06-06.netlify.app",
  "onsite-concrete-landscape":
    "https://onsite-concrete-construction-2026-06-06.netlify.app",
  "omega-landscaping":
    "https://omega-landscaping-2026-06-06.netlify.app",
  "fagan-painting": "https://fagan-painting-2026-07-06.netlify.app",
  "fresh-blends": "https://fresh-blends-2026-05-31-report.netlify.app",
  "replenish-7-eleven": "https://replenish-2026-06-06.netlify.app",
};

const stripTargets = (value) =>
  value
    .replace(/href="[^"]+"/gi, "")
    .replace(/\]\([^)]+\)/g, "]")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");

for (const email of manifest.emails) {
  const html = await fs.readFile(email.bodyFile, "utf8");
  const editorialBody = html.split("<p style=\"margin:24px 0 0;\">Thanks,")[0];
  if (email.wordCount < 400 || email.wordCount > 500) {
    failures.push(`${email.slug}: email word count ${email.wordCount}`);
  }
  if (!email.to || !email.cc) failures.push(`${email.slug}: missing To or Cc`);
  if (!email.standalone) failures.push(`${email.slug}: email is not standalone`);
  if (/On .+ wrote:|quoted history/i.test(html)) {
    failures.push(`${email.slug}: quoted history marker`);
  }
  if (/border-radius|background:|<table/i.test(editorialBody)) {
    failures.push(`${email.slug}: card, box, or table styling`);
  }
  if (/[–—]/.test(stripTargets(editorialBody))) {
    failures.push(`${email.slug}: dash punctuation`);
  }
  if (requiredDashboards[email.slug] && !html.includes(requiredDashboards[email.slug])) {
    failures.push(`${email.slug}: missing dashboard`);
  }
  for (const attachment of email.attachments) {
    try {
      await fs.access(attachment);
    } catch {
      failures.push(`${email.slug}: missing attachment ${attachment}`);
    }
  }
}

for (const slack of manifest.slacks) {
  const body = await fs.readFile(slack.bodyFile, "utf8");
  if (slack.wordCount < 400 || slack.wordCount > 500) {
    failures.push(`${slack.slug}: Slack word count ${slack.wordCount}`);
  }
  if (!slack.channelId) failures.push(`${slack.slug}: missing Slack channel`);
  if (/[–—]/.test(stripTargets(body))) {
    failures.push(`${slack.slug}: Slack dash punctuation`);
  }
  if (/â€¢|Ã|�/.test(body)) {
    failures.push(`${slack.slug}: Slack contains broken character encoding`);
  }
  if (!/^- /m.test(body) && body.includes("at a glance")) {
    failures.push(`${slack.slug}: Slack KPI section is not a native list`);
  }
  if (requiredDashboards[slack.slug] && !body.includes(requiredDashboards[slack.slug])) {
    failures.push(`${slack.slug}: Slack missing dashboard`);
  }
}

const bySlug = Object.fromEntries(
  await Promise.all(
    manifest.emails.map(async (email) => [
      email.slug,
      await fs.readFile(email.bodyFile, "utf8"),
    ]),
  ),
);

if (!/58% lower/.test(bySlug["kimberly-james-bridal"])) {
  failures.push("Kimberly benchmark comparison missing");
}
if (!/\$57\.75/.test(bySlug["kimberly-james-bridal"])) {
  failures.push("Kimberly verified Meta spend missing");
}
if (!/Lower lead volume with a stronger level of interest/.test(bySlug["kimberly-james-bridal"])) {
  failures.push("Kimberly qualified bride interest pattern missing");
}
if (/landing page/i.test(bySlug["kimberly-james-bridal"])) {
  failures.push("Kimberly Meta update mentions landing pages");
}
if (!/98% lower/.test(bySlug["onsite-concrete-landscape"])) {
  failures.push("Onsite benchmark comparison missing");
}
if (!/27% lower/.test(bySlug["omega-landscaping"])) {
  failures.push("Omega benchmark comparison missing");
}
for (const requiredFaganTerm of [
  "Legacy Paint Holdings",
  "Benson",
  "AEO",
  "GEO",
  "SEO",
]) {
  if (!bySlug["fagan-painting"].includes(requiredFaganTerm)) {
    failures.push(`Fagan missing ${requiredFaganTerm}`);
  }
}
if (/payment/i.test(bySlug["fagan-painting"])) {
  failures.push("Fagan contains prohibited payment language");
}
if (/WordStream|benchmark report/.test(bySlug["fresh-blends"])) {
  failures.push("Fresh Blends contains an inactive benchmark claim");
}
for (const campaign of [
  "Torrey Del Mar",
  "Miramar",
  "Carmel Mountain",
  "Solana Beach",
]) {
  if (!bySlug["replenish-7-eleven"].includes(campaign)) {
    failures.push(`Replenish missing ${campaign}`);
  }
}
for (const excluded of ["Coral Springs", "Miami", "Pampano", "Pompano"]) {
  if (bySlug["replenish-7-eleven"].includes(excluded)) {
    failures.push(`Replenish includes excluded location ${excluded}`);
  }
}
for (const requiredKpi of [
  "$93.47",
  "3,411",
  "244",
  "7.15%",
  "$0.38",
  "10.05%",
]) {
  if (!bySlug["replenish-7-eleven"].includes(requiredKpi)) {
    failures.push(`Replenish missing required KPI ${requiredKpi}`);
  }
}

console.log(
  JSON.stringify(
    {
      status: failures.length ? "failed" : "passed",
      emailCount: manifest.emails.length,
      slackCount: manifest.slacks.length,
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) process.exitCode = 1;
