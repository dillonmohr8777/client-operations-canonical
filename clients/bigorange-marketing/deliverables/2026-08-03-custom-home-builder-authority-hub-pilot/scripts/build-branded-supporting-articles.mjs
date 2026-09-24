import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const sourceDirectory = path.join(projectRoot, "wordpress");
const outputDirectory = path.join(sourceDirectory, "branded-articles");

const logoUrl = "https://bigorange.marketing/wp-content/uploads/2026/08/bigorange-logo-orange.png";

const articles = [
  {
    id: "bom-article-5550",
    source: "supporting-article-01.html",
    output: "supporting-article-01-branded.html",
    preview: "supporting-article-01-preview.html",
    title: "What a Custom Home Builder Website Must Include",
    summary: "A practical field guide to the pages, proof, and decision support that help qualified home buyers trust the process.",
    image: "https://bigorange.marketing/wp-content/uploads/2026/08/builder-blueprint-hero.webp",
    imageAlt: "A custom builder and architect reviewing full-size plans inside a modern home",
    imageCaption: "Make the decision process as visible as the finished work.",
    descriptor: "Website field guide",
    note: "Complete supporting article",
    ctaTitle: "A stronger website starts with a clearer buyer decision.",
    ctaBody: "The authority hub brings positioning, proof, useful answers, search visibility, and the next conversation into one connected builder-marketing system."
  },
  {
    id: "bom-article-5552",
    source: "supporting-article-02.html",
    output: "supporting-article-02-branded.html",
    preview: "supporting-article-02-preview.html",
    title: "Five Articles Every Custom Home Builder Blog Needs",
    summary: "A five-article editorial foundation that answers real buyer questions and turns a builder blog into a patient sales teammate.",
    image: "https://bigorange.marketing/wp-content/uploads/2026/08/builder-materials-studio.webp",
    imageAlt: "A design team comparing materials and plans in a working studio",
    imageCaption: "Useful content shows how good decisions get made.",
    descriptor: "Editorial field guide",
    note: "Complete supporting article",
    ctaTitle: "Turn one expert conversation into a useful content system.",
    ctaBody: "The authority-hub workflow connects firsthand expertise, publishable answers, internal links, search intent, and a low-pressure next step."
  }
];

const slugify = (value) => value
  .toLowerCase()
  .replace(/&(?:amp;|#39;)/g, "and")
  .replace(/<[^>]+>/g, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "")
  .slice(0, 72);

const extractArticleBody = (source) => source
  .replace(/<!--\s*wp:html\s*-->/gi, "")
  .replace(/<!--\s*\/wp:html\s*-->/gi, "")
  .replace(/<!--\s*BigOrange WordPress production draft[^>]*-->/gi, "")
  .replace(/^\s*<div\s+class=["']bom-supporting-article["']>\s*/i, "")
  .replace(/\s*<\/div>\s*$/i, "")
  .replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, "")
  .replace(/<blockquote>\s*<\/blockquote>/gi, "")
  .trim();

const brandStyles = (id) => `
body:has(#${id}) .fl-post-header,
body:has(#${id}) .entry-header { display: none !important; }
body:has(#${id}) .fl-builder-content-2154 > .fl-row.fl-node-61080ba897e17 { display: none !important; }
body:has(#${id}) .fl-content-full.container,
body:has(#${id}) .site-content,
body:has(#${id}) .content-area { width: 100% !important; max-width: none !important; padding: 0 !important; }
body:has(#${id}) .fl-content-full.container > .row { margin: 0 !important; }
body:has(#${id}) .fl-content.col-md-12,
body:has(#${id}) .site-main { width: 100% !important; margin: 0 !important; padding: 0 !important; }
body:has(#${id}) .fl-post,
body:has(#${id}) .fl-post-content,
body:has(#${id}) .entry-content { margin: 0 !important; padding: 0 !important; overflow-x: clip; }
#${id} {
  --orange: #f47721;
  --orange-deep: #b94800;
  --ink: #111111;
  --paper: #f6f2ea;
  --white: #ffffff;
  --muted: #69645e;
  --rule: #d8d0c4;
  --display: Raleway, Arial, sans-serif;
  --body: "Open Sans", Arial, sans-serif;
  min-width: 0;
  margin: 0;
  color: var(--ink);
  background: var(--paper);
  font-family: var(--body);
  font-size: 1rem;
  line-height: 1.72;
  isolation: isolate;
}
#${id} *, #${id} *::before, #${id} *::after { box-sizing: border-box; }
#${id} img { display: block; width: 100%; height: auto; }
#${id} a { color: inherit; }
#${id} a:focus-visible { outline: 3px solid var(--orange); outline-offset: 5px; }
#${id} .bom-article-hero {
  display: grid;
  grid-template-columns: minmax(0, 0.96fr) minmax(0, 1.04fr);
  min-height: 48rem;
  color: var(--white);
  background: var(--ink);
}
#${id} .bom-article-hero-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  justify-content: center;
  padding: clamp(3.5rem, 7vw, 7rem) clamp(1.3rem, 5vw, 5.5rem);
}
#${id} .bom-article-logo { width: min(19rem, 72%); margin-bottom: clamp(3.5rem, 7vw, 6rem); }
#${id} h1, #${id} h2, #${id} h3 {
  margin: 0;
  font-family: var(--display);
  letter-spacing: -0.032em;
  text-wrap: balance;
}
#${id} h1 {
  max-width: 11ch;
  font-size: clamp(3.45rem, 7vw, 6rem);
  font-weight: 800;
  line-height: 0.96;
}
#${id} .bom-article-summary {
  max-width: 39rem;
  margin: 2rem 0 0;
  color: #b9b7b1;
  background: var(--ink);
  font-size: 1rem;
}
#${id} .bom-article-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  margin: clamp(2.5rem, 5vw, 4rem) 0 0;
  border-top: 1px solid rgba(255,255,255,.24);
  border-bottom: 1px solid rgba(255,255,255,.24);
}
#${id} .bom-article-meta div { padding: 1rem 1rem 1rem 0; }
#${id} .bom-article-meta div + div { padding-left: 1rem; border-left: 1px solid rgba(255,255,255,.24); }
#${id} .bom-article-meta strong {
  display: block;
  color: var(--orange);
  background: var(--ink);
  font-size: .75rem;
  font-weight: 850;
  letter-spacing: .08em;
  text-transform: uppercase;
}
#${id} .bom-article-meta span { display: block; margin-top: .2rem; color: var(--white); font-size: 1rem; }
#${id} .bom-article-hero-media { position: relative; min-height: 42rem; overflow: hidden; }
#${id} .bom-article-hero-media::before {
  content: "";
  position: absolute;
  z-index: 1;
  inset: 0;
  background: linear-gradient(90deg, rgba(16,16,16,.26), transparent 38%);
  pointer-events: none;
}
#${id} .bom-article-hero-media img { height: 100%; object-fit: cover; }
#${id} .bom-article-hero-media figcaption {
  position: absolute;
  z-index: 2;
  right: clamp(1rem, 3vw, 2.5rem);
  bottom: clamp(1rem, 3vw, 2.5rem);
  left: clamp(1rem, 3vw, 2.5rem);
  max-width: 31rem;
  margin-left: auto;
  padding: 1rem 1.1rem;
  color: var(--white);
  background: rgba(16,16,16,.92);
  font-size: .75rem;
  font-weight: 720;
}
#${id} .bom-article-layout {
  display: grid;
  grid-template-columns: minmax(12rem, 17rem) minmax(0, 48rem);
  justify-content: center;
  gap: clamp(3rem, 7vw, 7rem);
  padding: clamp(5rem, 9vw, 9rem) clamp(1.3rem, 5vw, 5.5rem);
}
#${id} .bom-article-index { align-self: start; position: sticky; top: 7rem; }
#${id} .bom-article-index strong {
  display: block;
  padding-bottom: .85rem;
  border-bottom: 1px solid var(--ink);
  font-size: .75rem;
  font-weight: 850;
  letter-spacing: .08em;
  text-transform: uppercase;
}
#${id} .bom-article-index ol { margin: 0; padding: 0; list-style: none; counter-reset: article-index; }
#${id} .bom-article-index li { counter-increment: article-index; border-bottom: 1px solid var(--rule); }
#${id} .bom-article-index a { display: grid; grid-template-columns: 2.2rem 1fr; gap: .75rem; padding: .9rem 0; text-decoration: none; font-size: 1rem; line-height: 1.35; }
#${id} .bom-article-index a::before { content: counter(article-index, decimal-leading-zero); color: var(--orange-deep); font-weight: 850; }
#${id} .bom-article-index a:hover { color: var(--orange-deep); }
#${id} .bom-article-body { min-width: 0; }
#${id} .bom-article-body > p:first-child {
  margin-top: 0;
  font-size: 1rem;
  font-weight: 620;
  line-height: 1.45;
  letter-spacing: -.018em;
}
#${id} .bom-article-body p, #${id} .bom-article-body li { color: #2f3032; }
#${id} .bom-article-body p { margin: 1.25rem 0; }
#${id} .bom-article-body h2 {
  margin: clamp(4.75rem, 8vw, 7rem) 0 1.35rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--ink);
  font-size: clamp(2rem, 3.4vw, 3.75rem);
  font-weight: 780;
  line-height: 1.02;
  scroll-margin-top: 6rem;
}
#${id} .bom-article-body h3 { margin: 2.5rem 0 1rem; font-size: 2rem; line-height: 1.15; }
#${id} .bom-article-body ul, #${id} .bom-article-body ol { margin: 1.4rem 0 1.8rem; padding-left: 1.4rem; }
#${id} .bom-article-body li { margin: .7rem 0; padding-left: .35rem; }
#${id} .bom-article-body li::marker { color: var(--orange-deep); font-weight: 850; }
#${id} .bom-article-body code { padding: .12rem .3rem; background: #d8d0c4; font-size: .9em; }
#${id} .bom-article-close {
  display: grid;
  grid-template-columns: minmax(0, .9fr) minmax(16rem, .45fr);
  gap: clamp(2rem, 7vw, 7rem);
  align-items: end;
  padding: clamp(5rem, 9vw, 9rem) clamp(1.3rem, 5vw, 5.5rem);
  background: var(--orange);
}
#${id} .bom-article-close > * { min-width: 0; }
#${id} .bom-article-close h2 { max-width: 13ch; font-size: clamp(2.9rem, 5.9vw, 6rem); font-weight: 800; line-height: .98; }
#${id} .bom-article-close p { max-width: 36rem; margin: 1.5rem 0 0; color: #111111; font-size: 1rem; }
#${id} .bom-article-close a {
  display: inline-flex;
  min-height: 3.6rem;
  align-items: center;
  justify-content: center;
  padding: .85rem 1.15rem;
  color: var(--white);
  background: var(--ink);
  font-size: .75rem;
  font-weight: 850;
  text-decoration: none;
  transition: background 220ms ease, color 220ms ease, transform 320ms cubic-bezier(.16,1,.3,1);
}
#${id} .bom-article-close a:hover, #${id} .bom-article-close a:focus-visible { color: var(--ink); background: var(--white); transform: translateY(-3px); }
@media (max-width: 900px) {
  #${id} .bom-article-hero { grid-template-columns: 1fr; min-height: auto; }
  #${id} .bom-article-hero-copy { min-height: 42rem; }
  #${id} .bom-article-hero-media { min-height: 33rem; }
  #${id} .bom-article-layout { grid-template-columns: 1fr; }
  #${id} .bom-article-index { position: static; }
  #${id} .bom-article-close { grid-template-columns: 1fr; }
  #${id} .bom-article-close a { justify-self: start; }
}
@media (max-width: 560px) {
  #${id} .bom-article-hero-copy { min-height: 38rem; padding-top: 3rem; padding-bottom: 3.5rem; }
  #${id} .bom-article-logo { width: min(16rem, 78%); margin-bottom: 3.5rem; }
  #${id} h1 { font-size: clamp(2.9rem, 12vw, 3.45rem); }
  #${id} .bom-article-hero-media { min-height: 27rem; }
  #${id} .bom-article-layout { padding-top: 4.25rem; padding-bottom: 5.5rem; }
  #${id} .bom-article-body h2 { font-size: clamp(2rem, 9vw, 2.9rem); }
  #${id} .bom-article-close { padding-top: 4.75rem; padding-bottom: 5rem; }
  #${id} .bom-article-close h2 { font-size: clamp(2rem, 9vw, 2.9rem); overflow-wrap: anywhere; }
}
@media (prefers-reduced-motion: reduce) {
  #${id} *, #${id} *::before, #${id} *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; animation-duration: .01ms !important; }
}
@media print {
  #${id} .bom-article-hero { min-height: auto; color: var(--ink); background: var(--white); }
  #${id} .bom-article-hero-media, #${id} .bom-article-index, #${id} .bom-article-close a { display: none; }
  #${id} .bom-article-layout, #${id} .bom-article-close { display: block; padding: 2rem 0; }
}`;

const buildArticle = (config, body) => {
  const headings = [];
  const content = body.replace(/<h2>([\s\S]*?)<\/h2>/gi, (_match, heading) => {
    const id = slugify(heading);
    headings.push({ id, text: heading.replace(/<[^>]+>/g, "") });
    return `<h2 id="${id}">${heading}</h2>`;
  });

  const index = headings
    .map(({ id, text }) => `<li><a href="#${id}">${text}</a></li>`)
    .join("\n");

  return `<style id="${config.id}-styles">${brandStyles(config.id)}</style>
<article id="${config.id}" class="bom-branded-article" aria-labelledby="${config.id}-title">
  <header class="bom-article-hero">
    <div class="bom-article-hero-copy">
      <img class="bom-article-logo" src="${logoUrl}" alt="BigOrange Marketing, a content and inbound marketing agency" width="1000" height="338">
      <h1 id="${config.id}-title">${config.title}</h1>
      <p class="bom-article-summary">${config.summary}</p>
      <div class="bom-article-meta" aria-label="Article details">
        <div><strong>Format</strong><span>${config.descriptor}</span></div>
        <div><strong>Status</strong><span>${config.note}</span></div>
      </div>
    </div>
    <figure class="bom-article-hero-media">
      <img src="${config.image}" alt="${config.imageAlt}" width="1672" height="941" fetchpriority="high" decoding="async">
      <figcaption>${config.imageCaption}</figcaption>
    </figure>
  </header>
  <div class="bom-article-layout">
    <nav class="bom-article-index" aria-label="Article sections">
      <strong>In this article</strong>
      <ol>${index}</ol>
    </nav>
    <div class="bom-article-body">${content}</div>
  </div>
  <footer class="bom-article-close">
    <div>
      <h2>${config.ctaTitle}</h2>
      <p>${config.ctaBody}</p>
    </div>
    <a href="https://bigorange.marketing/marketing-agency-for-builders/">Explore builder marketing</a>
  </footer>
</article>`;
};

await mkdir(outputDirectory, { recursive: true });
const results = [];

for (const config of articles) {
  const source = await readFile(path.join(sourceDirectory, config.source), "utf8");
  const body = extractArticleBody(source);
  const article = buildArticle(config, body);
  const wordpress = `<!-- wp:html -->\n${article}\n<!-- /wp:html -->\n`;
  const preview = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${config.title}</title></head><body style="margin:0">${article}</body></html>\n`;
  const outputPath = path.join(outputDirectory, config.output);
  const previewPath = path.join(outputDirectory, config.preview);
  await Promise.all([
    writeFile(outputPath, wordpress, "utf8"),
    writeFile(previewPath, preview, "utf8")
  ]);
  results.push({ source: config.source, outputPath, previewPath, characters: wordpress.length });
}

console.log(JSON.stringify({ outputDirectory, results }, null, 2));
