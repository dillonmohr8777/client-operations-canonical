import { execFileSync } from "node:child_process";
import { createWriteStream, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const packageRoot = resolve(root, "..", "2026-08-28-ten-blog-package");
const postsDir = join(packageRoot, "posts");
const imagesDir = join(packageRoot, "images");
const brandDir = join(root, "brand");
const fontsDir = join(brandDir, "fonts");
const htmlDir = join(root, "html");
const pdfDir = join(root, "pdfs");
const reviewDir = join(root, "review");
const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const MANIFEST = [
  { file: "01-commercial-cleaning-checklist-facility-managers.md", image: "01-commercial-cleaning-checklist.webp", n: 1 },
  { file: "02-how-often-should-office-be-cleaned.md", image: "02-office-cleaning-frequency.webp", n: 2 },
  { file: "03-day-porter-vs-nightly-janitorial-service.md", image: "03-day-porter-vs-janitorial.webp", n: 3 },
  { file: "04-vct-floor-care-stripping-waxing-maintenance.md", image: "04-vct-floor-care.webp", n: 4 },
  { file: "05-post-construction-cleaning-checklist.md", image: "05-post-construction-cleanup.webp", n: 5 },
  { file: "06-medical-office-cleaning-guide.md", image: "06-medical-office-cleaning.webp", n: 6 },
  { file: "07-school-childcare-cleaning-routine.md", image: "07-school-childcare-cleaning.webp", n: 7 },
  { file: "08-warehouse-cleaning-plan.md", image: "08-warehouse-cleaning-plan.webp", n: 8 },
  { file: "09-commercial-restroom-cleaning-standards.md", image: "09-commercial-restroom-standards.webp", n: 9 },
  { file: "10-prepare-commercial-cleaning-walkthrough.md", image: "10-cleaning-walkthrough.webp", n: 10 },
];

function ensureDirs() {
  for (const dir of [fontsDir, htmlDir, pdfDir, reviewDir]) mkdirSync(dir, { recursive: true });
}

async function download(url, dest, headers = {}) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
}

async function ensureFonts() {
  const facesPath = join(fontsDir, "faces.css");
  if (existsSync(facesPath) && readdirSync(fontsDir).some((name) => /\.(woff2|ttf)$/i.test(name))) return;
  const cssUrl =
    "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;600;700&display=swap";
  const cssRes = await fetch(cssUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    },
  });
  if (!cssRes.ok) throw new Error(`Font CSS ${cssRes.status}`);
  let css = await cssRes.text();
  writeFileSync(join(fontsDir, "google.css"), css);
  const urls = [
    ...new Set(
      [...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.(?:woff2|ttf))\)/g)].map((m) => m[1]),
    ),
  ];
  if (!urls.some((u) => /fraunces/i.test(u)) || !urls.some((u) => /inter/i.test(u))) {
    throw new Error("Could not resolve Fraunces or Inter font URLs from Google Fonts CSS");
  }
  let index = 0;
  for (const url of urls) {
    index += 1;
    const ext = url.toLowerCase().endsWith(".ttf") ? "ttf" : "woff2";
    const local = `face-${index}.${ext}`;
    await download(url, join(fontsDir, local));
    css = css.replaceAll(url, `./${local}`);
  }
  writeFileSync(facesPath, css);
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error("Missing frontmatter");
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    meta[key] = value;
  }
  return { meta, body: match[2] };
}

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inline(s) {
  let out = escapeHtml(s);
  out = out.replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2">$1</a>');
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return out;
}

function markdownToBlocks(md) {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let i = 0;
  let skippedH1 = false;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i += 1;
      continue;
    }
    if (line.startsWith("# ") && !skippedH1) {
      skippedH1 = true;
      i += 1;
      continue;
    }
    if (line.startsWith("### ")) {
      blocks.push({ type: "h3", text: line.slice(4) });
      i += 1;
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push({ type: "h2", text: line.slice(3) });
      i += 1;
      continue;
    }
    if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i += 1;
      }
      blocks.push({ type: "ol", items });
      continue;
    }
    if (/^[-*]\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s/, ""));
        i += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }
    const para = [];
    while (i < lines.length && lines[i].trim() && !/^#{1,3}\s/.test(lines[i]) && !/^[-*]\s/.test(lines[i]) && !/^\d+\.\s/.test(lines[i])) {
      para.push(lines[i]);
      i += 1;
    }
    blocks.push({ type: "p", text: para.join(" ") });
  }
  return blocks;
}

function renderBlocks(blocks) {
  return blocks
    .map((block, idx) => {
      if (block.type === "h2") return `<h2>${inline(block.text)}</h2>`;
      if (block.type === "h3") return `<h3>${inline(block.text)}</h3>`;
      if (block.type === "ul") {
        return `<ul>${block.items.map((item) => `<li>${inline(item)}</li>`).join("")}</ul>`;
      }
      if (block.type === "ol") {
        return `<ol>${block.items.map((item) => `<li>${inline(item)}</li>`).join("")}</ol>`;
      }
      const cls = idx === 0 ? ' class="lead"' : "";
      return `<p${cls}>${inline(block.text)}</p>`;
    })
    .join("\n");
}

function articleHtml(entry, meta, bodyHtml) {
  const logoFile = existsSync(join(brandDir, "ami-logo-transparent.png"))
    ? "ami-logo-transparent.png"
    : "ami-logo-transparent.webp";
  const logo = pathToFileURL(join(brandDir, logoFile)).href;
  const image = pathToFileURL(join(imagesDir, entry.image)).href;
  const css = pathToFileURL(join(root, "print", "ami-article.css")).href;
  const title = meta.title;
  const excerpt = meta.excerpt;
  const n = String(entry.n).padStart(2, "0");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)} | AMI Commercial Cleaning Services</title>
<link rel="stylesheet" href="${css}">
</head>
<body>
  <section class="page field cover">
    <a class="brand-lockup" href="https://www.ami-cleaning.com/">
      <img src="${logo}" alt="AMI Commercial Cleaning Services" width="589" height="401">
    </a>
    <div class="cover-copy">
      <h1>${escapeHtml(title)}</h1>
      <p class="lede">${escapeHtml(excerpt)}</p>
    </div>
    <div class="cover-meta">
      <div>
        <strong class="series">August facility series ${n} of 10</strong>
        Review draft for Corinne and Russ. Not published on ami-cleaning.com yet.
      </div>
      <div>ami-cleaning.com</div>
    </div>
  </section>

  <section class="page figure-page">
    <div class="figure-frame">
      <img src="${image}" alt="${escapeHtml(meta.image_alt)}" width="1600" height="900">
    </div>
    <div class="figure-caption">
      <p>${escapeHtml(meta.image_caption)}</p>
      <small>${escapeHtml(meta.image_credit)} Editorial art for this article. Not a photograph of AMI staff or an AMI job site.</small>
    </div>
  </section>

  <section class="page body-page">
    <div class="body-bar">
      <span class="brand-lockup">
        <img src="${logo}" alt="AMI Commercial Cleaning Services" width="589" height="401">
      </span>
    </div>
    <article class="prose">
      ${bodyHtml}
    </article>
    <div class="prose-foot">
      <span>AMI Commercial Cleaning Services</span>
      <span>${escapeHtml(title)}</span>
    </div>
  </section>

  <section class="page field endcard">
    <a class="brand-lockup" href="https://www.ami-cleaning.com/">
      <img src="${logo}" alt="AMI Commercial Cleaning Services" width="589" height="401">
    </a>
    <div class="end-copy">
      <h2>Walk the building. Then write the plan.</h2>
      <p>AMI scopes rooms, traffic, access, surfaces and standards before shift one across Delaware, Eastern Maryland and Southeastern Pennsylvania.</p>
      <p><a href="https://www.ami-cleaning.com/contact/">ami-cleaning.com/contact</a></p>
    </div>
    <div class="end-meta">
      <div>
        <strong>Exact live logo</strong>
        Locked artwork from ami-cleaning.com. Spelling, geometry and colors are unchanged.
      </div>
      <div>Review draft ${n} / 10</div>
    </div>
  </section>
</body>
</html>
`;
}

function printPdf(htmlPath, pdfPath) {
  if (!existsSync(chrome)) throw new Error("Chrome not found");
  execFileSync(
    chrome,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-extensions",
      "--hide-scrollbars",
      "--no-pdf-header-footer",
      "--virtual-time-budget=8000",
      `--print-to-pdf=${pdfPath}`,
      pathToFileURL(htmlPath).href,
    ],
    { stdio: "inherit", windowsHide: true },
  );
}

function screenshotHtml(htmlPath, pngPath) {
  execFileSync(
    chrome,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--hide-scrollbars",
      "--window-size=816,1056",
      `--screenshot=${pngPath}`,
      pathToFileURL(htmlPath).href,
    ],
    { stdio: "inherit", windowsHide: true },
  );
}

async function main() {
  ensureDirs();
  await ensureFonts();
  const logo = join(brandDir, "ami-logo-transparent.webp");
  if (!existsSync(logo)) throw new Error("Verified AMI logo missing");

  const built = [];
  for (const entry of MANIFEST) {
    const raw = readFileSync(join(postsDir, entry.file), "utf8");
    const { meta, body } = parseFrontmatter(raw);
    if (meta.featured_image !== entry.image) {
      throw new Error(`Image mismatch for ${entry.file}: ${meta.featured_image} vs ${entry.image}`);
    }
    if (!existsSync(join(imagesDir, entry.image))) {
      throw new Error(`Missing image ${entry.image}`);
    }
    const html = articleHtml(entry, meta, renderBlocks(markdownToBlocks(body)));
    const stem = entry.file.replace(/\.md$/, "");
    const htmlPath = join(htmlDir, `${stem}.html`);
    const pdfPath = join(pdfDir, `AMI-August-2026-${String(entry.n).padStart(2, "0")}-${meta.slug}.pdf`);
    writeFileSync(htmlPath, html);
    printPdf(htmlPath, pdfPath);
    built.push({
      n: entry.n,
      title: meta.title,
      slug: meta.slug,
      html: htmlPath,
      pdf: pdfPath,
      image: entry.image,
    });
  }

  screenshotHtml(built[0].html, join(reviewDir, "01-cover.png"));
  screenshotHtml(built[9].html, join(reviewDir, "10-cover.png"));
  writeFileSync(join(root, "pdf-manifest.json"), JSON.stringify({ generatedAt: new Date().toISOString(), items: built }, null, 2));
  console.log(JSON.stringify({ ok: true, count: built.length, pdfDir }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
