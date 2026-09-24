import fs from 'node:fs/promises';
import path from 'node:path';
import { marked } from 'marked';

const ROOT = path.resolve(process.argv[2] || '.');
const BLOG_DIR = path.join(ROOT, 'blogs');
const HTML_DIR = path.join(ROOT, 'wordpress');
const SCHEMA_DIR = path.join(ROOT, 'schema');

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error('Missing frontmatter');
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z0-9_]+):\s*"?([\s\S]*?)"?\s*$/);
    if (m) meta[m[1]] = m[2];
  }
  return { meta, body: match[2] };
}

function extractFaqs(md) {
  const start = md.indexOf('## Frequently asked questions');
  if (start < 0) return [];
  const tail = md.slice(start + '## Frequently asked questions'.length);
  const end = tail.search(/\n## (?!#)/);
  const section = end >= 0 ? tail.slice(0, end) : tail;
  const parts = section.split(/\n### /).slice(1);
  return parts.map((part) => {
    const [question, ...rest] = part.split(/\r?\n/);
    const answer = rest.join(' ').replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1').replace(/[*_`>#]/g, '').replace(/\s+/g, ' ').trim();
    return { question: question.trim(), answer };
  }).filter(x => x.question && x.answer);
}

function stripH1(html) {
  return html.replace(/^\s*<h1[^>]*>[\s\S]*?<\/h1>\s*/i, '');
}

function wpHtml(meta, bodyHtml, schema) {
  const id = meta.asset_id.toLowerCase();
  const description = meta.meta_description;
  return `<!-- wp:html -->
<style id="${id}-styles">
#${id}{--orange:#f47721;--deep:#b94800;--ink:#111;--paper:#f6f2ea;--white:#fff;--muted:#5f5a54;--rule:#d8d0c4;margin:0;background:var(--paper);color:var(--ink);font-family:"Open Sans",Arial,sans-serif;font-size:18px;line-height:1.72;overflow:hidden}
#${id} *{box-sizing:border-box} #${id} a{color:var(--deep);font-weight:700} #${id} a:focus-visible{outline:3px solid var(--orange);outline-offset:4px}
#${id} .hero{position:relative;padding:clamp(4rem,9vw,8rem) clamp(1.4rem,7vw,7rem);background:var(--ink);color:var(--white);border-bottom:14px solid var(--orange)}
#${id} .mark{max-width:250px;margin:0 0 4rem} #${id} .eyebrow{color:var(--orange);font:800 13px/1.2 Raleway,Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase}
#${id} h1,#${id} h2,#${id} h3{font-family:Raleway,Arial,sans-serif;letter-spacing:-.025em;text-wrap:balance} #${id} h1{max-width:1000px;margin:1rem 0;font-size:clamp(3.1rem,7vw,6.4rem);line-height:.96}
#${id} .dek{max-width:760px;color:#d0cdc6;font-size:1.18rem} #${id} .meta{margin-top:2rem;color:#fff;font-size:.85rem}
#${id} .layout{display:grid;grid-template-columns:minmax(180px,250px) minmax(0,780px);gap:clamp(2rem,7vw,7rem);justify-content:center;padding:clamp(4rem,8vw,8rem) clamp(1.4rem,6vw,6rem)}
#${id} .rail{align-self:start;position:sticky;top:32px;padding-top:1rem;border-top:4px solid var(--orange);font:800 14px/1.5 Raleway,Arial,sans-serif;text-transform:uppercase;letter-spacing:.08em}
#${id} .body{min-width:0} #${id} .body>p:first-child{font-size:1.24rem;font-weight:650;color:var(--ink)}
#${id} .body h2{margin:4.5rem 0 1.2rem;padding-top:1.1rem;border-top:1px solid var(--ink);font-size:clamp(2rem,4vw,3.5rem);line-height:1.04} #${id} .body h3{margin:2.2rem 0 .6rem;font-size:1.45rem;line-height:1.2}
#${id} .body p,#${id} .body li{color:#303033} #${id} .body li{margin:.55rem 0} #${id} blockquote{margin:2rem 0;padding:1.3rem 1.5rem;border:1px solid var(--ink);border-left:7px solid var(--orange);background:var(--white)} #${id} blockquote p{margin:0!important;color:var(--ink)!important}
#${id} table{width:100%;border-collapse:collapse;margin:2rem 0;background:var(--white);font-size:.92rem} #${id} th,#${id} td{padding:.85rem;border:1px solid var(--rule);text-align:left;vertical-align:top} #${id} th{background:var(--ink);color:var(--white);font-family:Raleway,Arial,sans-serif}
#${id} .close{display:grid;grid-template-columns:1.4fr .6fr;gap:3rem;align-items:end;padding:clamp(4rem,8vw,7rem) clamp(1.4rem,7vw,7rem);background:var(--orange)} #${id} .close h2{margin:0;font-size:clamp(2.6rem,6vw,5.5rem);line-height:.98} #${id} .close a{display:block;padding:1rem 1.25rem;background:var(--ink);color:var(--white);text-align:center;text-decoration:none}
@media(max-width:800px){#${id} .layout{grid-template-columns:1fr}#${id} .rail{position:static}#${id} .close{grid-template-columns:1fr}#${id} table{font-size:.82rem}}
</style>
<article id="${id}" itemscope itemtype="https://schema.org/BlogPosting">
  <header class="hero">
    <img class="mark" src="https://bigorange.marketing/wp-content/uploads/2026/08/bigorange-logo-orange.png" alt="BigOrange Marketing">
    <div class="eyebrow">Custom Home Builder Growth Guide</div>
    <h1 itemprop="headline">${meta.title}</h1>
    <p class="dek" itemprop="description">${description}</p>
    <p class="meta">Private review draft | Updated September 2, 2026</p>
  </header>
  <div class="layout">
    <aside class="rail">Answer-first content<br>SEO + AEO + GEO<br>Factual review required</aside>
    <div class="body" itemprop="articleBody">${bodyHtml}</div>
  </div>
  <footer class="close"><div><h2>Make the next right decision easier.</h2><p>Clear answers, credible proof, and a connected follow-up path turn attention into better conversations.</p></div><a href="https://bigorange.marketing/book-appointment/">Talk with BigOrange</a></footer>
</article>
<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>
<!-- /wp:html -->`;
}

await fs.mkdir(HTML_DIR, { recursive: true });
await fs.mkdir(SCHEMA_DIR, { recursive: true });
const files = (await fs.readdir(BLOG_DIR)).filter(x => /^BLOG-\d\d\.md$/.test(x)).sort();
const manifest = [];
for (const file of files) {
  const raw = await fs.readFile(path.join(BLOG_DIR, file), 'utf8');
  const { meta, body } = parseFrontmatter(raw);
  const faqs = extractFaqs(body);
  const canonical = `https://bigorange.marketing/${meta.proposed_slug}/`;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting', '@id': canonical + '#article', headline: meta.title,
        description: meta.meta_description, mainEntityOfPage: canonical,
        dateModified: '2026-09-02', inLanguage: 'en-US',
        author: { '@type': 'Organization', name: 'BigOrange Marketing', url: 'https://bigorange.marketing/' },
        publisher: { '@type': 'Organization', name: 'BigOrange Marketing', url: 'https://bigorange.marketing/', logo: { '@type': 'ImageObject', url: 'https://bigorange.marketing/wp-content/uploads/2026/08/bigorange-logo-orange.png' } },
        isPartOf: { '@id': 'https://bigorange.marketing/marketing-agency-for-builders/#authority-system' },
        keywords: [meta.primary_query, ...(meta.secondary_queries || '').split(';').map(x => x.trim()).filter(Boolean)]
      },
      {
        '@type': 'BreadcrumbList', '@id': canonical + '#breadcrumb', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bigorange.marketing/' },
          { '@type': 'ListItem', position: 2, name: 'Marketing Agency for Builders', item: 'https://bigorange.marketing/marketing-agency-for-builders/' },
          { '@type': 'ListItem', position: 3, name: meta.title, item: canonical }
        ]
      },
      { '@type': 'FAQPage', '@id': canonical + '#faq', mainEntity: faqs.map(x => ({ '@type': 'Question', name: x.question, acceptedAnswer: { '@type': 'Answer', text: x.answer } })) }
    ]
  };
  marked.setOptions({ gfm: true });
  const htmlBody = stripH1(await marked.parse(body));
  const out = wpHtml(meta, htmlBody, schema);
  await fs.writeFile(path.join(HTML_DIR, `${meta.asset_id}-${meta.proposed_slug}.html`), out, 'utf8');
  await fs.writeFile(path.join(SCHEMA_DIR, `${meta.asset_id}.schema.json`), JSON.stringify(schema, null, 2) + '\n', 'utf8');
  const words = body.replace(/[`#>*_|\[\]()]/g, ' ').split(/\s+/).filter(Boolean).length;
  manifest.push({ ...meta, canonical_candidate: canonical, word_count: words, faq_count: faqs.length, html_file: `${meta.asset_id}-${meta.proposed_slug}.html` });
}
await fs.writeFile(path.join(ROOT, 'blog-manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log(JSON.stringify({ count: manifest.length, items: manifest.map(x => ({ id: x.asset_id, words: x.word_count, faqs: x.faq_count, slug: x.proposed_slug })) }, null, 2));
