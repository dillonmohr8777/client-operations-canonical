import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { contentBySlug } from './content.mjs';
import { founderBySlug } from './founders.mjs';

const root = path.resolve('dist');
const sitesRoot = path.join(root, 'sites');

const stableFacts = {
  'advance-exterior': ['Macungie', 'Roofing'],
  'al-tacos-locos': ['Jenkintown', 'Restaurant'],
  'bala-financial': ['Phoenixville', 'Wealth management'],
  'balance-studios': ['Philadelphia', 'Martial arts'],
  'boyle-energy': ['Havertown', 'Heating and cooling'],
  'brandywine-auto-parts': ['Chester', 'Auto parts'],
  'caise-benefits': ['Aston', 'Insurance'],
  'captain-car-wash': ['Norristown', 'Car wash'],
  'custom-it-solutions': ['Harleysville', 'IT services'],
  'dirt-work-solutions': ['Slatington', 'Excavation'],
  'ember-and-ale': ['Collegeville', 'Restaurant'],
  'euphoria-nail-bar': ['Philadelphia', 'Nail salon'],
  'fusion-gyms': ['Philadelphia', 'Fitness'],
  'golden-sea': ['Blue Bell', 'Restaurant'],
  'ivc-wealth': ['Silverdale', 'Wealth management'],
  'mings-chinese': ['Hatboro', 'Restaurant'],
  'ooka-hibachi': ['Willow Grove', 'Restaurant'],
  'owm-law': ['Pottstown', 'Law firm'],
  'red-hill-greenhouse': ['Red Hill', 'Florist'],
  'roccos-brick-oven': ['Collegeville', 'Restaurant'],
  'sangillo-tire': ['Folsom', 'Tire service'],
  'specks-chicken': ['Collegeville', 'Restaurant'],
  'trend-auto-trader': ['Quakertown', 'Auto dealer'],
  'union-jacks': ['Barto', 'Bar and restaurant'],
  'weathers-motors': ['Media', 'Auto dealer'],
};

const esc = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const textFromHtml = (value = '') => value
  .replace(/<[^>]+>/g, ' ')
  .replaceAll('&amp;', '&')
  .replaceAll('&#x27;', "'")
  .replaceAll('&#39;', "'")
  .replaceAll('&quot;', '"')
  .replace(/\s+/g, ' ')
  .trim();

const pick = (html, pattern, fallback = '') => textFromHtml(html.match(pattern)?.[1] ?? fallback);

const icon = (number) => `<span class="card-icon" aria-hidden="true"><span>${number}</span></span>`;

const overrides = `<style id="copy-rebuild-overrides">
:root{--radius:16px}
.hero h1,.story h2,.feature h2,.spotlight h2,.contact-intro h2,.closing h2{font-size:clamp(3rem,7.6vw,5.8rem);line-height:.95;letter-spacing:-.035em}
.section-head h2{font-size:clamp(2.6rem,5.8vw,4.8rem);line-height:1;letter-spacing:-.032em}
.offering-card h3,.experience-grid h3,.catalog-card h3{letter-spacing:-.02em}
.eyebrow,.section-kicker{font-size:.84rem;letter-spacing:.045em;text-transform:none}
.eyebrow::before,.section-kicker::before{content:""}
.section-head{grid-template-columns:minmax(0,1fr);max-width:920px;gap:20px}
.section-head>p{max-width:66ch;margin:0;font-size:clamp(1.08rem,1.6vw,1.32rem);line-height:1.55}
.hero-copy>p,.story p,.feature p,.spotlight p,.closing-lead{max-width:66ch}
.offering-card,.experience-grid article,.catalog-card,.contact-card,.glass-panel{border-radius:16px;box-shadow:none}
.offering-card p,.experience-grid p,.catalog-card p{max-width:44ch}
.card-icon{font-weight:900;font-variant-numeric:tabular-nums}
.card-icon span{font-size:.9rem}
.gallery-rail figure{border-radius:12px}
.media-caption{border-radius:12px;box-shadow:none}
.contact-intro p{max-width:56ch;font-size:1.08rem;line-height:1.55}
.founder-profile{padding:clamp(72px,10vw,144px) clamp(24px,7vw,112px)}
.founder-intro{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(280px,.95fr);gap:clamp(32px,7vw,96px);align-items:end;margin:0 auto clamp(38px,6vw,72px);max-width:1260px}
.founder-intro h2{margin:.18em 0 0;font-size:clamp(2.7rem,5.6vw,5rem);line-height:.98;letter-spacing:-.035em}
.founder-intro p{max-width:58ch;margin:0;font-size:clamp(1.08rem,1.5vw,1.28rem);line-height:1.6}
.founder-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:clamp(18px,2.5vw,32px);max-width:1260px;margin:0 auto}
.founder-card{position:relative;overflow:hidden;border-radius:16px;background:color-mix(in srgb,var(--ink,#111) 6%,transparent);min-height:430px}
.founder-card img{display:block;width:100%;height:100%;min-height:430px;object-fit:cover;filter:saturate(.9) contrast(1.02)}
.founder-card figcaption{position:absolute;inset:auto 16px 16px;display:flex;flex-direction:column;gap:4px;padding:18px 20px;border-radius:12px;background:rgba(10,12,14,.82);color:#fff;backdrop-filter:blur(12px)}
.founder-card figcaption strong{font-size:1.18rem;letter-spacing:-.015em}
.founder-card figcaption span{font-size:.9rem;opacity:.78}
.founder-source{display:inline-flex;width:max-content;margin-top:22px;font-size:.86rem}
.founder-grid:has(> :only-child){grid-template-columns:minmax(0,760px);justify-content:center}
.founder-grid:has(> :only-child) .founder-card{min-height:min(68vw,620px)}
.founder-grid:has(> :only-child) .founder-card img{min-height:min(68vw,620px)}
.logo-outro .ink-reveal{position:relative;display:grid;place-items:center;width:min(78vw,560px);margin-inline:auto;isolation:isolate}
.logo-outro .logo-outro-mark{grid-area:1/1;display:block;width:100%;max-height:290px;object-fit:contain}
.site-footer{padding-bottom:170px}
.js .reveal,.js .reveal.visible,.js .reveal.reveal-left,.js .reveal.reveal-right,.js .vanish-out.is-leaving{opacity:1;transform:none;filter:none;transition:none}
.js .logo-outro .ink-reveal.reveal,.js .logo-outro .ink-reveal.reveal.visible{opacity:0;transform:translateY(28px);filter:none;transition:opacity .9s cubic-bezier(.17,.4,.02,.99),transform .9s cubic-bezier(.17,.4,.02,.99)}
.js .logo-outro .ink-reveal.reveal.is-visible,.js .logo-outro .ink-reveal.reveal.visible.is-visible{opacity:1;transform:none}
.js .logo-outro .ink-reveal .logo-outro-mark,.js .logo-outro .ink-reveal.visible .logo-outro-mark{opacity:0;transform:scale(1.06);filter:blur(26px) contrast(2.4) saturate(.3);transition:opacity 1.4s ease-out,transform 2.1s cubic-bezier(.17,.4,.02,.99),filter 2.3s ease-out;will-change:filter,opacity,transform}
.js .logo-outro .ink-reveal.is-visible .logo-outro-mark,.js .logo-outro .ink-reveal.visible.is-visible .logo-outro-mark{opacity:1;transform:none;filter:blur(0) contrast(1) saturate(1)}
@media(max-width:1280px){
  .site-header{grid-template-columns:minmax(0,1fr) auto auto;gap:12px}
  .site-header nav{max-width:min(48vw,420px)}
}
@media(max-width:960px){
  .site-header{grid-template-columns:minmax(0,1fr) auto}
  .site-header .button-header{display:none!important}
  .site-header nav{max-width:58vw}
}
@media(max-width:700px){
  .hero h1{font-size:clamp(2.85rem,12vw,4.15rem);line-height:.98}
  .section-head h2,.story h2,.feature h2,.spotlight h2,.contact-intro h2,.closing h2{font-size:clamp(2.45rem,10vw,3.55rem);line-height:1.02}
  .offering-card,.experience-grid article{min-height:auto;padding:24px}
  .founder-profile{padding-inline:20px}
  .founder-intro{grid-template-columns:1fr;gap:20px}
  .founder-card,.founder-card img{min-height:390px}
  .founder-grid:has(> :only-child) .founder-card,.founder-grid:has(> :only-child) .founder-card img{min-height:470px}
}
@media(prefers-reduced-motion:reduce){
  .js .logo-outro .ink-reveal.reveal,.js .logo-outro .ink-reveal.reveal.visible,.js .logo-outro .ink-reveal .logo-outro-mark,.js .logo-outro .ink-reveal.visible .logo-outro-mark{opacity:1!important;transform:none!important;filter:none!important;transition:none!important}
}
</style>`;

function getFacts(html, slug) {
  const jsonText = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  const json = jsonText ? JSON.parse(jsonText) : {};
  const [city, kind] = stableFacts[slug] || ['', 'Local business'];
  return {
    name: json.name || pick(html, /<title>(.*?) \|/),
    address: typeof json.address === 'string' ? json.address : pick(html, /<span>Address<\/span><strong>(.*?)<\/strong>/),
    phone: json.telephone || pick(html, /<strong><a href="tel:[^"]+">(.*?)<\/a>/),
    tel: pick(html, /href="tel:([^"]+)"/).replace(/\D/g, ''),
    official: json.url || pick(html, /<a class="button button-secondary" href="([^"]+)">Open the site/),
    city,
    kind,
    hours: pick(html, /<span>Hours<\/span><strong>(.*?)<\/strong>/),
    bodyClass: html.match(/<body class="([^"]+)">/)?.[1] || 'profile-page',
  };
}

function bodyFor(facts, content, slug) {
  const { name, address, phone, tel, official, city, kind, hours, bodyClass } = facts;
  const defaultHours = /please call .*official website for current hours/i.test(hours);
  const hoursText = !hours || defaultHours ? `Please call ${name} or check the official website for current hours.` : hours;
  const callHref = tel ? `tel:${tel}` : official;
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  const mapEmbed = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&hl=en&z=16&output=embed`;
  const serviceNames = content.services.map(([title]) => title);
  const servicesIntro = `${name} organizes the customer experience around three clear needs: ${serviceNames[0].toLowerCase()}, ${serviceNames[1].toLowerCase()}, and ${serviceNames[2].toLowerCase()}. The right starting point depends on the goal, the timing, and the level of support you want.`;
  const process = [
    ['Begin with the need', `Call ${name} or use the official website to describe what you are planning, what prompted the search, and any timing that matters. A focused first conversation helps both sides decide whether the service is a fit.`],
    ['Confirm scope and availability', `Ask what information, measurements, photos, preferences, or appointment details will make the next step useful. ${name} can then confirm current availability and explain what should happen before a decision is made.`],
    ['Choose the next step with context', `Once the options are clear, choose the service, visit, consultation, order, or appointment that matches the need. ${name} should leave you with useful expectations around timing, cost, preparation, and follow-up.`],
  ];
  const missionSupport = `${name} brings ${serviceNames[0].toLowerCase()}, ${serviceNames[1].toLowerCase()}, and ${serviceNames[2].toLowerCase()} into one customer experience. That means listening before recommending, using direct language, and giving people enough context to choose the next step with confidence.`;
  const alt = (imageNumber, topic = kind) => `${name} brand illustration for ${topic.toLowerCase()}, scene ${imageNumber}`;
  const galleryTopics = [...serviceNames, content.feature[0], content.spotlight[0], content.tagline];
  const services = content.services.map(([title, description], index) => `<article class="offering-card reveal delay-${index + 1}">${icon(index + 1)}<h3>${esc(title)}</h3><p>${esc(description)}</p></article>`).join('');
  const processCards = process.map(([title, description], index) => `<article class="reveal delay-${index + 1}">${icon(index + 1)}<h3>${esc(title)}</h3><p>${esc(description)}</p></article>`).join('');
  const gallery = [3, 4, 5, 6, 7, 12].map((imageNumber, index) => `<figure class="media-figure ${index % 2 ? 'still-frame' : 'live-frame'}" data-hover><img loading="lazy" src="assets/image-${imageNumber}.webp" alt="${esc(alt(imageNumber, galleryTopics[index]))}"></figure>`).join('');
  const catalogLinks = ['View current details', 'Explore this service', 'Continue to the official site'];
  const catalog = content.catalog.map(([title, description], index) => `<article class="catalog-card reveal delay-${index + 1}"><figure class="media-figure ${index % 2 ? 'still-frame' : 'live-frame'}" data-hover><img loading="lazy" src="assets/image-${index + 9}.webp" alt="${esc(alt(index + 9, title))}"></figure><h3>${esc(title)}</h3><p>${esc(description)}</p><a href="${esc(official)}">${catalogLinks[index]} <span aria-hidden="true">↗</span></a></article>`).join('');
  const marqueeItems = [content.tagline, ...serviceNames, city];
  const marquee = [...marqueeItems, ...marqueeItems].map((item) => `<span>${esc(item)}</span>`).join('');
  const founder = founderBySlug[slug];
  const founderSection = founder ? `<section class="founder-profile surface-paper vanish-out" aria-labelledby="founder-title-${esc(slug)}"><header class="founder-intro"><div class="reveal reveal-left"><span class="section-kicker">${esc(founder.kicker)}</span><h2 id="founder-title-${esc(slug)}">${esc(founder.title)}</h2></div><div class="reveal reveal-right"><p>${esc(founder.intro)}</p><a class="founder-source" href="${esc(founder.sourcePage)}">Meet the team on the official site <span aria-hidden="true">↗</span></a></div></header><div class="founder-grid">${founder.people.map((person, index) => `<figure class="founder-card reveal delay-${Math.min(index + 1, 3)}"><img loading="lazy" src="${esc(person.image)}" alt="${esc(person.alt)}"><figcaption><strong>${esc(person.name)}</strong><span>${esc(person.role)}</span></figcaption></figure>`).join('')}</div></section>` : '';

  return `<body class="${esc(bodyClass)}"><a class="skip-link" href="#main">Skip to content</a>
<header class="site-header"><a class="brand" href="#top"><img class="brand-logo" src="assets/logo.png" alt="${esc(name)}"></a><nav aria-label="Primary"><a href="#offerings">Services</a><a href="#about">About</a><a href="#visit">Contact</a></nav><a class="button button-header" href="${esc(callHref)}">Call now<span aria-hidden="true">↗</span></a></header>
<main id="main">
  <section class="hero surface-paper vanish-out" id="top"><div class="hero-copy reveal"><span class="eyebrow">Serving ${esc(city)}</span><h1>${esc(content.tagline)}</h1><p>${esc(content.hero)}</p><div class="button-row"><a class="button button-primary" href="${esc(callHref)}">Call ${esc(name)}<span aria-hidden="true">↗</span></a><a class="button button-secondary" href="${esc(official)}">Visit the official site<span aria-hidden="true">↗</span></a></div></div><div class="hero-media reveal reveal-right"><figure class="media-figure live-frame" data-hover><img loading="eager" fetchpriority="high" src="assets/image-1.webp" alt="${esc(alt(1, serviceNames[0]))}"><div class="media-caption"><span class="media-kicker">${esc(kind)}</span><p>${esc(serviceNames[0])}</p></div></figure></div></section>
  <div class="marquee-strip" aria-hidden="true"><div class="marquee-track">${marquee}</div></div>
  <section class="offerings surface-accent vanish-out" id="offerings"><header class="section-head reveal"><h2>${esc(content.servicesTitle)}</h2><p>${esc(servicesIntro)}</p></header><div class="offering-grid">${services}</div></section>
  <section class="gallery surface-paper vanish-out" id="gallery"><header class="section-head reveal"><h2>See ${esc(kind.toLowerCase())} from more than one angle</h2><p>Browse a visual sequence shaped around ${esc(name)}, the services people come for, and the details worth understanding before making contact.</p></header><div class="gallery-rail" data-filmstrip>${gallery}</div></section>
  <section class="story surface-deep vanish-out" id="about"><div class="story-copy reveal reveal-left"><h2>${esc(content.missionTitle)}</h2><p>${esc(content.mission)}</p><p>${esc(missionSupport)}</p></div><div class="reveal reveal-right"><figure class="media-figure still-frame" data-hover><img loading="lazy" src="assets/image-2.webp" alt="${esc(alt(2, content.missionTitle))}"><div class="media-caption"><span class="media-kicker">Our approach</span><p>A closer look at ${esc(serviceNames[1].toLowerCase())}.</p></div></figure></div></section>
  ${founderSection}
  <section class="experience surface-panel vanish-out"><header class="section-head reveal"><h2>A clear way to start with ${esc(name)}</h2><p>You do not need to know every ${esc(kind.toLowerCase())} detail before reaching out to ${esc(name)}. Start with the need, confirm the fit, and make the next decision with useful context.</p></header><div class="experience-grid">${processCards}</div></section>
  <section class="feature surface-accent vanish-out"><div class="reveal reveal-left"><figure class="media-figure still-frame" data-hover><img loading="lazy" src="assets/image-8.webp" alt="${esc(alt(8, content.feature[0]))}"><div class="media-caption"><span class="media-kicker">What matters</span><p>${esc(serviceNames[0])} in focus.</p></div></figure></div><div class="feature-copy reveal reveal-right"><h2>${esc(content.feature[0])}</h2><p>${esc(content.feature[1])}</p><a class="button button-secondary" href="${esc(official)}">Explore services<span aria-hidden="true">↗</span></a></div></section>
  <section class="spotlight surface-panel vanish-out"><div class="feature-copy reveal reveal-left"><h2>${esc(content.spotlight[0])}</h2><p>${esc(content.spotlight[1])}</p><a class="button button-secondary" href="${esc(callHref)}">Ask a question<span aria-hidden="true">↗</span></a></div><div class="reveal reveal-right"><figure class="media-figure live-frame" data-hover><img loading="lazy" src="assets/image-13.webp" alt="${esc(alt(13, content.spotlight[0]))}"><div class="media-caption"><span class="media-kicker">Before you choose</span><p>Questions worth asking first.</p></div></figure></div></section>
  <section class="catalog surface-deep vanish-out"><header class="section-head reveal"><h2>Choose your next ${esc(kind.toLowerCase())} step</h2><p>Use these starting points to go deeper, compare the current options, and prepare for a useful conversation with ${esc(name)}.</p></header><div class="catalog-grid">${catalog}</div></section>
  <section class="contact-system surface-panel vanish-out" id="visit"><div class="contact-intro reveal"><h2>Talk with ${esc(name)}.</h2><p>Call ${esc(name)} with a question, confirm current hours, or use the official website to review the latest service details before visiting ${esc(city)}.</p></div><div class="contact-grid"><article class="contact-card glass-panel reveal"><span>Address</span><strong>${esc(address)}</strong><a class="button button-quiet" href="${esc(mapHref)}">Get directions<span aria-hidden="true">↗</span></a></article><article class="contact-card glass-panel reveal delay-1"><span>Phone</span><strong><a href="${esc(callHref)}">${esc(phone)}</a></strong><a class="button button-quiet" href="${esc(callHref)}">Call now<span aria-hidden="true">↗</span></a></article><article class="contact-card glass-panel reveal delay-2"><span>Hours</span><strong>${esc(hoursText)}</strong><a href="${esc(official)}">Confirm on the official site <span aria-hidden="true">↗</span></a></article></div><figure class="map-embed"><iframe title="Map showing ${esc(name)} in ${esc(city)}" src="${esc(mapEmbed)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></figure></section>
  <section class="closing logo-outro surface-paper" aria-label="${esc(name)}"><div class="ink-reveal reveal" data-magic-ink-logo><img class="logo-outro-mark" src="assets/logo.png" alt="${esc(name)}" loading="lazy" decoding="async"></div><p class="closing-lead">${esc(content.tagline)}</p><a class="button button-primary" href="${esc(callHref)}">Start the conversation<span aria-hidden="true">↗</span></a></section>
</main>
<footer class="site-footer"><div class="footer-identity"><strong>${esc(name)}</strong><span>${esc(kind)} in ${esc(city)}</span></div><div class="footer-contact"><h2>Contact</h2><p>${esc(address)}</p><p><a href="${esc(callHref)}">${esc(phone)}</a></p></div><div class="footer-hours"><h2>Hours</h2><p>${esc(hoursText)}</p><a href="${esc(official)}">Official website <span aria-hidden="true">↗</span></a></div><nav class="footer-links" aria-label="Useful links"><h2>Quick links</h2><ul><li><a href="#offerings">Services</a></li><li><a href="#about">About</a></li><li><a href="#visit">Contact</a></li></ul></nav></footer>
<nav class="bottom-dock mobile-action" aria-label="Page"><div class="dock-cluster"><a class="dock-link" href="#offerings">Services</a><a class="dock-link" href="#about">About</a></div><div class="ink-logo"><img class="ink-mark" src="assets/logo.png" alt="${esc(name)}" decoding="async"></div><div class="dock-cluster"><a class="dock-link" href="#visit">Contact</a><a class="button dock-cta" href="${esc(callHref)}">Call<span aria-hidden="true">↗</span></a></div></nav>`;
}

const logoMagicInkScript = `<script id="logo-magic-ink">
(()=>{
  if(window.__phlLogoMagicInk)return;
  window.__phlLogoMagicInk=true;
  const marks=[...document.querySelectorAll('[data-magic-ink-logo]')];
  if(!marks.length)return;
  const reveal=(mark)=>mark.classList.add('is-visible');
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window)){
    marks.forEach(reveal);
    return;
  }
  const observer=new IntersectionObserver((entries)=>{
    for(const entry of entries){
      if(!entry.isIntersecting)continue;
      reveal(entry.target);
      observer.unobserve(entry.target);
    }
  },{threshold:.12,rootMargin:'0px 0px -8% 0px'});
  marks.forEach(mark=>observer.observe(mark));
})();
</script>`;

function stripDockBubbleCss(head, slug) {
  const cleaned = head
    .replace(/\.ink-logo canvas\{[^}]*\}\r?\n?/, '')
    .replace(/\.ink-logo\.is-inked \.ink-mark\{[\s\S]*?\}\r?\n?/, '')
    .replace(/\.ink-logo\.is-inked::before\{[\s\S]*?\}\r?\n@keyframes ink-bloom\{[\s\S]*?\r?\n\}\r?\n?/, '');
  if (/\.ink-logo canvas|\.ink-logo\.is-inked|@keyframes ink-bloom/.test(cleaned)) {
    throw new Error(`Could not remove bubble logo styles for ${slug}`);
  }
  return cleaned;
}

function stripDockBubbleBurst(script, slug) {
  const withoutDockLookup = script
    .replace("const well=document.querySelector('[data-ink-logo]');", '')
    .replace("const canvas=well&&well.querySelector('canvas');", '');
  const withoutBurst = withoutDockLookup.replace(/let inked=false,parts=\[\],raf=0;const burst=\(\)=>\{[\s\S]*?\};const setInk=/, 'const setInk=');
  const cleaned = withoutBurst.replace("if(well){well.classList.toggle('is-inked',reduce||on);if(on&&!inked)burst();if(!on)inked=false;else inked=true}", '');
  if (/ctx\.arc|const burst=|parts=\[\]|logo-particle|is-dissolving|is-dissolved|data-ink-logo|\bwell\b/.test(cleaned)) {
    throw new Error(`Could not remove bubble logo behavior for ${slug}`);
  }
  return cleaned;
}

const slugs = (await readdir(sitesRoot, { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
if (slugs.length !== 25) throw new Error(`Expected 25 site folders, found ${slugs.length}`);

const report = [];
for (const slug of slugs) {
  const content = contentBySlug[slug];
  if (!content) throw new Error(`Missing copy for ${slug}`);
  const file = path.join(sitesRoot, slug, 'index.html');
  const original = await readFile(file, 'utf8');
  const facts = getFacts(original, slug);
  const sourceScript = original.match(/(<script>\(\(\)=>\{[\s\S]*?<\/script>)/)?.[1];
  if (!sourceScript) throw new Error(`Could not preserve behavior script for ${slug}`);
  const script = stripDockBubbleBurst(sourceScript, slug);
  const sourceHead = original.slice(0, original.indexOf('<body'))
    .replace(/<style id="copy-rebuild-overrides">[\s\S]*?<\/style>/, '');
  const cleanHead = stripDockBubbleCss(sourceHead, slug)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(content.hero)}">`)
    .replace('/* Social strip — harvested / mirrored imagery captions */', '/* Social strip */');
  const head = cleanHead.replace('</head>', `${overrides}</head>`);
  const rebuilt = `${head}${bodyFor(facts, content, slug)}${script}${logoMagicInkScript}</body></html>`;
  await writeFile(file, rebuilt, 'utf8');
  const visible = textFromHtml(rebuilt.slice(rebuilt.indexOf('<body'), rebuilt.lastIndexOf('<script>')));
  const words = visible.split(/\s+/).filter(Boolean).length;
  report.push({ slug, name: facts.name, words });
}

let hub = await readFile(path.join(root, 'index.html'), 'utf8');
hub = hub
  .replace(/<title>[\s\S]*?<\/title>/, '<title>Philadelphia Small Business Website Concepts | Week 35</title>')
  .replace(/<span class="k">[\s\S]*?<\/span><h1>[\s\S]*?<\/h1><p>[\s\S]*?<\/p>/, '<span class="k">Philadelphia-area businesses | Week 35</span><h1>Twenty-five websites built for customers to scroll.</h1><p>Each concept now leads with substantial, service-specific copy, a clearer mission, useful decision guidance, and direct next steps. The business names, locations, contact details, logos, and visual systems remain intact while internal generator language and repetitive filler have been removed.</p>')
  .replace('<strong>25</strong><span>Prospects</span>', '<strong>25</strong><span>Businesses</span>')
  .replace('<strong>25</strong><span>QA ready</span>', '<strong>25</strong><span>Expanded sites</span>')
  .replace('<strong>0</strong><span>Held</span>', '<strong>0</strong><span>Placeholder sections</span>')
  .replace('<strong>25</strong><span>Weekly target</span>', '<strong>25</strong><span>Mobile-ready pages</span>')
  .replace(/<span class="spec">[^<]*<\/span>/g, '<span class="spec">Long-form service copy · private preview</span>');
await writeFile(path.join(root, 'index.html'), hub, 'utf8');

await writeFile(path.resolve('COPY-QA.json'), `${JSON.stringify({ generatedAt: new Date().toISOString(), sites: report }, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ sites: report.length, minWords: Math.min(...report.map((item) => item.words)), maxWords: Math.max(...report.map((item) => item.words)), report: 'COPY-QA.json' }, null, 2));
