// Momentum Digital sales deck.
// Content only. Every layout decision lives in the client-deck skill.
// Every figure on a slide traces to a row in SOURCES.md.

import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const KIT = path.join(os.homedir(), ".claude", "skills", "client-deck", "lib", "deck-kit.mjs");
const { Deck } = await import(pathToFileURL(KIT).href);

const d = new Deck("momentum-digital", {
  title: "Momentum Digital, marketing that makes the phone ring",
  subject: "Capabilities, case studies and pricing",
});
const C = d.C;
const SITE = "needmomentum.com, captured September 4, 2026.";

// ───────────────────────────────────────────────────────────────── 01 opener
{
  const s = d.title({
    kicker: "Philadelphia · Since 2015",
    title: "Marketing that\nmakes the\nphone ring.",
    sub: "SEO, paid media, social, design, content and AI automation for small and local businesses, run by a team that shows you the numbers.",
    foot: "needmomentum.com   ·   (215) 876-2954   ·   hi@needmomentum.com",
  });
  d.notes(s, "Open on the promise, not the service list. Momentum sells measurable local demand: calls, forms and booked appointments. Every claim in this deck traces to a published Momentum source.", [SITE]);
}

// ───────────────────────────────────────────────────────────────── 02 who we are
{
  const s = d.slide({
    kicker: "Who we are",
    title: "A Philadelphia agency\nbuilt for small business",
    titleW: 7.4,
    panel: { side: "right", size: 4.35, fill: C.navy }, logoDark: true,
    motif: { x: 10.5, y: 4.5, w: 4.3, dark: true, transparency: 90 },
  });
  d.statRow(s, [
    { value: "1,000+", label: "Small businesses served", sub: "Philadelphia region, since 2015" },
    { value: "2015", label: "Founded in Philadelphia", sub: "1635 Market St. #1601" },
    { value: "16", label: "Clutch reviews", sub: "Verified client feedback" },
  ], { y: 3.05, x: d.M, w: 8.1, size: 38, bottom: 5.05 });

  d.hair(s, { x: d.M, y: 5.2, w: 8.1, color: C.line });
  d.flow(s, "Momentum Digital was founded in 2015 to help small businesses grow online without breaking the bank. Mac Frederick started his career at Google, working directly with small and medium businesses, and built Momentum around that experience.", {
    x: d.M, y: 5.45, w: 7.9, size: 13.5, color: C.slate, spacing: 1.34,
  });

  d.block(s, {
    x: 9.35, y: 1.55, w: 3.4, h: 4.6, dark: true, pad: 0,
    eyebrow: "Who we work with",
    head: "Local, and\nstaying local",
    headSize: 22,
    bullets: [
      "Small businesses building a digital presence",
      "Local service providers and trades",
      "Entrepreneurs and startups that need affordable scale",
      "Healthcare, construction, real estate and retail",
    ],
    bodySize: 12,
  });
  d.foot(s, "Typical projects and retainers run $500 to $5,000 and last one to twelve months.");
  d.notes(s, "Lead with the founder story: Google experience applied to businesses Google's own sales org never had time for. The 1,000+ figure and the $500 to $5,000 range are both published on the site.", [
    "needmomentum.com/about-us/",
    "needmomentum.com/marketing-case-studies/",
  ]);
}

// ───────────────────────────────────────────────────────────────── 03 credentials
{
  const s = d.slide({ kicker: "Credentials", title: "Recognized by the platforms we run on" });
  d.rows(s, [
    { head: "Google Partner", body: "Certified on Google Ads and Google Business Profile." },
    { head: "Meta Business Partner", body: "Certified on Facebook and Instagram advertising." },
    { head: "HubSpot", body: "CRM, lifecycle and marketing automation." },
    { head: "Inc. 5000 Regionals", body: "Recognized among the fastest growing regional companies." },
    { head: "ThreeBestRated", body: "Independently ranked among the top local agencies." },
    { head: "RankWatch", body: "Recognized for search performance." },
  ], { x: d.M, y: 2.55, w: d.CW, headW: 3.5, headSize: 17, bodySize: 13, gap: 0.34, bottom: d.BOT });
  d.foot(s, "Momentum Digital is also ranked among Philadelphia's top PPC agencies on its own published awards page.");
  d.notes(s, "Credibility slide. Do not add badges Momentum has not published. Every name here appears as a badge or in copy on needmomentum.com.", [SITE]);
}

// ───────────────────────────────────────────────────────────────── 04 section
d.section({
  num: 1, kicker: "Section one", title: "What we do",
  sub: "Seven service lines that share one strategy, one measurement system and one team.",
});

// ───────────────────────────────────────────────────────────────── 05 service map
{
  const s = d.slide({ kicker: "Capabilities", title: "Seven lines, one growth system" });
  d.rows(s, [
    { head: "SEO", body: "Local, technical and ecommerce SEO, Google Business Profile, audits, and programs built by industry and by city." },
    { head: "PPC and paid social", body: "Google, Microsoft, Amazon, Facebook and Instagram, managed against calls and forms." },
    { head: "Social media", body: "Facebook, Instagram, TikTok, Pinterest and LinkedIn, posted and grown on a real calendar." },
    { head: "Design and web", body: "WordPress and Shopify builds, UI and UX, logo, graphic and brochure design." },
    { head: "Content and video", body: "Blogging, email, HD photography, drone video and 360 virtual tours." },
    { head: "AI marketing and automation", body: "Workflow automation, AI chat and lead routing, wired into your CRM." },
    { head: "Fractional CMO", body: "Senior marketing leadership on retainer, for when you are not ready to hire one." },
  ], { x: d.M, y: 2.2, w: d.CW, headW: 3.4, headSize: 16, bodySize: 12.5, gap: 0.2, bottom: d.BOT });
  d.notes(s, "The menu slide. Ask which two lines are already running and which are not, then jump straight to the matching service slide.", [SITE]);
}

// ───────────────────────────────────────────────────────────────── 06 SEO
{
  const s = d.slide({
    kicker: "Service line", title: "SEO",
    sub: "Get found by the people already searching for what you sell.",
    titleW: 7.0,
    panel: { side: "right", size: 5.0, fill: C.navy }, logoDark: true,
    motif: { x: 9.4, y: -1.1, w: 4.6, dark: true, transparency: 91 },
  });
  d.block(s, {
    x: 8.9, y: 1.5, w: 3.85, h: 4.9, dark: true, pad: 0,
    eyebrow: "What is included", head: "The full\nsearch surface", headSize: 22,
    bullets: [
      "Local SEO and Google Business Profile",
      "Technical SEO, speed and Core Web Vitals",
      "Ecommerce SEO for Shopify and WooCommerce",
      "Free SEO and website audits",
      "Citations, listings and backlinks",
      "Content and page creation",
      "Programs by industry and by city",
    ],
    bodySize: 12,
  });
  d.stat(s, {
    x: d.M, y: 3.1, w: 7.5, value: "2,175 clicks", size: 40,
    label: "MicroTech Systems, Boise IT services",
    sub: "765K impressions in ten months. Non branded IT terms taken from invisible to first page, with \"Microtech Boise\" at position 1.35.",
  });
  d.hair(s, { x: d.M, y: 5.02, w: 7.5, color: C.line });
  d.stat(s, {
    x: d.M, y: 5.24, w: 7.5, value: "1,180 → 1,374 keywords", size: 30,
    label: "Everyday Life Insurance, four months",
    sub: "Top five placements grew from 138 to 169. In the tracked cluster, 63% sit in the top five.",
  });
  d.notes(s, "SEO is the anchor line. Both proof points are non branded search, which answers the objection most prospects raise: we already rank for our own name.", [
    "needmomentum.com/marketing-case-studies/it-services-seo-microtech-systems-boise/",
    "needmomentum.com/marketing-case-studies/on-page-seo-case-study/",
  ]);
}

// ───────────────────────────────────────────────────────────────── 07 paid media
{
  const s = d.slide({
    kicker: "Service line", title: "Paid media",
    sub: "Managed against booked calls and qualified forms, not impressions.",
    dark: true, titleW: 7.6,
    motif: { x: 10.2, y: -1.3, w: 4.2, dark: true, transparency: 91 },
  });
  d.rows(s, [
    { head: "Where we buy", body: "Google Ads, Microsoft Ads, Amazon Ads, Facebook Ads and Instagram Ads." },
    { head: "How the account is run", body: "Audit and rebuild, conversion tracking through Google Tag Manager, search term review with negatives, budget shifted to winners." },
  ], { x: d.M, y: 3.1, w: d.CW, headW: 3.5, headSize: 16, bodySize: 13, gap: 0.26, dark: true });
  d.statRow(s, [
    { value: "+314%", label: "Phone call conversions", sub: "The Kind Insurance, 2025 vs 2024" },
    { value: "$38.88", label: "Average cost per lead", sub: "Bedford Housing, 1,130 form conversions" },
    { value: "$19.58", label: "Cost per lead", sub: "Jade International freight" },
    { value: "4.90%", label: "Average click through rate", sub: "LaserSkin MedSpa, Google Ads" },
  ], { y: 5.15, size: 34, bottom: d.BOT, dark: true });
  d.foot(s, "Management is $1,500 per month plus your ad media budget. Media spend is paid to the platform, never to us.", { dark: true });
  d.notes(s, "The Kind Insurance number is the headline: phone calls went from 154 in 2024 to 638 in 2025. Cost per conversion rose to $42.09 because the account stopped optimizing for cheap non call conversions.", [
    "needmomentum.com/marketing-case-studies/ppc-phone-call-lead-generation/",
    "needmomentum.com/marketing-case-studies/google-ads-case-study/",
    "needmomentum.com/marketing-case-studies/freight-company-google-ads/",
    "needmomentum.com/marketing-case-studies/med-spa-google-ads-case-study/",
  ]);
}

// ───────────────────────────────────────────────────────────────── 08 social
{
  const s = d.slide({
    kicker: "Service line", title: "Social media",
    sub: "A real calendar, real design, and a channel that compounds.",
    titleW: 7.2,
    panel: { side: "right", size: 5.35, fill: C.navy }, logoDark: true,
    motif: { x: 9.1, y: 3.3, w: 5.4, dark: true, transparency: 91 },
  });
  d.rows(s, [
    { head: "Channels", body: "Facebook, Instagram, TikTok, Pinterest and LinkedIn." },
    { head: "Every month", body: "A content calendar built a month ahead, posts designed in your brand, three posts a week, stories and hashtags." },
    { head: "And then", body: "Engagement and follower growth work, with analytics reported every month." },
  ], { x: d.M, y: 3.05, w: 6.9, headW: 2.0, headSize: 15, bodySize: 12.5, gap: 0.26, bottom: d.BOT });

  let py = d.kicker(s, "Proof · Grand Entry Doors", { x: 8.45, y: 1.5, w: 4.1, dark: true });
  py = d.flow(s, "A dormant Pinterest account turned into a growth channel", {
    x: 8.45, y: py, w: 4.1, size: 19, color: C.onDark, bold: true, spacing: 1.1, gapAfter: 0.42,
  });
  const gp = [
    { value: "6.09M", label: "Impressions in 2025" },
    { value: "217.59K", label: "Engagements" },
    { value: "34.66K", label: "Saves" },
    { value: "91.89K", label: "Engaged audience" },
  ];
  gp.forEach((it, i) => {
    d.stat(s, {
      x: 8.45 + (i % 2) * 2.15, y: py + Math.floor(i / 2) * 1.42,
      w: 1.95, value: it.value, label: it.label, size: 28, dark: true, color: C.blueLift,
    });
  });
  d.foot(s, "Social media management starts at $1,000 per month and scales with post volume.");
  d.notes(s, "Grand Entry Doors is the strongest organic social proof: 775,990 impressions in September 2025 alone. Good answer to whether organic social actually does anything.", [
    "needmomentum.com/marketing-case-studies/pinterest-organic-case-study/",
  ]);
}

// ───────────────────────────────────────────────────────────────── 09 design & web
{
  const s = d.slide({
    kicker: "Service line", title: "Design and web",
    sub: "Sites built to load fast, read well on a phone and convert.",
  });
  d.rows(s, [
    { head: "What we build", body: "Website design and development, WordPress and Shopify builds, UI and UX, logo and brand identity, graphic design and brochures, design for conversions." },
  ], { x: d.M, y: 2.5, w: d.CW, headW: 2.6, headSize: 16, bodySize: 13, rule: false });

  d.hair(s, { x: d.M, y: 3.35, w: d.CW, color: C.line });
  let ny = d.kicker(s, "Proof · Nenner Law, Philadelphia criminal defense", { x: d.M, y: 3.6, w: 8.0 });
  d.flow(s, "A mobile first rebuild that moved every number", {
    x: d.M, y: ny, w: 8.6, size: 23, color: C.ink, bold: true, spacing: 1.08,
  });
  d.statRow(s, [
    { value: "24 → 54", label: "Mobile performance score" },
    { value: "50 → 64", label: "Desktop performance score" },
    { value: "+816%", label: "Conversions", color: C.green },
    { value: "+75%", label: "Users", color: C.green },
  ], { y: 4.95, size: 34, bottom: d.BOT });
  d.foot(s, "Design and branding is a $3,000 one time package, about three months, with unlimited edits and full ownership.");
  d.notes(s, "Conversions rose by up to 816% and sessions by 66%. Say up to, exactly as the case study does. The performance scores are before and after samples, not permanent scores.", [
    "needmomentum.com/marketing-case-studies/wordpress-website-redesign/",
    "needmomentum.com/marketing-prices/",
  ]);
}

// ───────────────────────────────────────────────────────────────── 10 content & 360
{
  const s = d.slide({
    kicker: "Service line", title: "Content, video and virtual tours",
    panel: { side: "bottom", size: 2.95, fill: C.navy },
    motif: { x: 10.1, y: 3.9, w: 4.5, dark: true, transparency: 91 },
  });
  d.rows(s, [
    { head: "Content and blogging", body: "Keyword research, four blogs or pages a month, edits and review, optimized for search and internal linking, promoted on your site and reported on. $1,000 per month." },
    { head: "Email and lifecycle", body: "Campaign execution, list segmentation and the follow up sequences that turn a first click into a returning customer." },
  ], { x: d.M, y: 2.2, w: d.CW, headW: 3.4, headSize: 17, bodySize: 13, gap: 0.34, bottom: 4.3 });

  let by = d.kicker(s, "Momentum 360 · a division within Momentum", { x: d.M, y: 4.9, w: 8.0, dark: true });
  by = d.flow(s, "Virtual tours, HD photography and drone video", {
    x: d.M, y: by, w: 9.4, size: 25, color: C.onDark, bold: true, spacing: 1.06, gapAfter: 0.18,
  });
  d.flow(s, "360 Google virtual tours, professional photography and aerial video for property, retail and hospitality. Tours feed Google Business Profile and local SEO directly, which is why the media team and the search team sit together.", {
    x: d.M, y: by, w: 8.6, size: 12, color: C.onDarkSoft, spacing: 1.3,
  });
  d.notes(s, "Momentum 360 is the differentiator against pure play SEO shops: the same agency shoots the media that makes the local listing work. momentumvirtualtours.com", [SITE]);
}

// ───────────────────────────────────────────────────────────────── 11 AI marketing
{
  const s = d.slide({
    kicker: "Service line", title: "AI marketing and automation",
    sub: "Repetitive marketing work, handed to a system that does not forget.",
  });
  d.steps(s, [
    { head: "Discovery", body: "Goals, offers, audiences and the metrics the automation has to move." },
    { head: "Stack audit", body: "CRM, forms, ads, email, SMS and tracking reviewed for gaps." },
    { head: "Build workflows", body: "Triggers, segments and messages built for each funnel stage." },
    { head: "QA", body: "Every path tested, tagging and consent validated, data confirmed." },
    { head: "Launch", body: "Published, first runs watched, timing and routing tuned daily." },
    { head: "Report", body: "KPIs tracked, copy, rules and steps optimized for ongoing lift." },
  ], { y: 2.68, height: 1.7, bottom: 4.9 });

  d.hair(s, { x: d.M, y: 4.95, w: d.CW, color: C.line });
  let ay = d.kicker(s, "Proof · The Kind Insurance", { x: d.M, y: 5.2, w: 6.0 });
  ay = d.flow(s, "An AI chatbot and CRM build that closed a policy in month one", {
    x: d.M, y: ay, w: 8.0, size: 21, color: C.ink, bold: true, spacing: 1.08, gapAfter: 0.16,
  });
  d.flow(s, "Five qualified chatbot conversations and one closed won policy in thirty days, with every lead synced into the CRM and zero manual entry.", {
    x: d.M, y: ay, w: 8.0, size: 12, color: C.slate, spacing: 1.3,
  });
  let ky = d.kicker(s, "Packaged", { x: 8.9, y: 5.2, w: 3.85 });
  ky = d.flow(s, "Tiers by business type", {
    x: 8.9, y: ky, w: 3.85, size: 17, color: C.ink, bold: true, spacing: 1.1, gapAfter: 0.14,
  });
  d.flow(s, "Starter, Growth and Enterprise for ecommerce. Essential, Premium and Elite for real estate.", {
    x: 8.9, y: ky, w: 3.85, size: 12, color: C.slate, spacing: 1.3,
  });
  d.notes(s, "Small numbers, told honestly. Five conversations and one closed policy in the first thirty days is a real result for an insurance brokerage, and more credible than a vague automation promise.", [
    "needmomentum.com/ai-powered-marketing-automation/",
    "needmomentum.com/marketing-case-studies/lead-automation/",
  ]);
}

// ───────────────────────────────────────────────────────────────── 12 AEO (NEW)
{
  const s = d.slide({
    kicker: "New service line · draft for approval",
    title: "Answer engine optimization",
    sub: "A growing share of research happens inside ChatGPT, AI Overviews, Perplexity and Copilot, where there is no blue link to rank for.",
    panel: { side: "right", size: 4.1, fill: C.navy }, logoDark: true,
    titleW: 8.2,
    motif: { x: 10.6, y: 1.4, w: 4.1, dark: true, transparency: 91 },
  });
  d.rows(s, [
    { head: "Entity and citation audit", body: "What the models currently say about the business, and which pages they cite." },
    { head: "Answer formatting", body: "Direct answers, definitions, FAQs and schema that mirror the visible page." },
    { head: "Source authority", body: "Third party citations, reviews and listings the models actually read." },
    { head: "AI visibility tracking", body: "Prompt sets tracked monthly across the major assistants, reported like rankings." },
  ], { x: d.M, y: s._top + 0.16, w: 8.0, headW: 2.9, headSize: 15, bodySize: 12, gap: 0.26, bottom: d.BOT });

  d.kicker(s, "Already proven in one account", { x: 9.6, y: 2.5, w: 3.2, dark: true });
  d.stat(s, {
    x: 9.6, y: 2.9, w: 3.2, value: "35", size: 72, color: C.blueLift, dark: true,
    label: "AI visibility score, Detroit Dispensing Solutions",
    sub: "Grown with more cited pages. ChatGPT appears in the December lead mix as a real traffic source.",
  });
  d.foot(s, "Draft scope. Momentum has no published AEO page or price. Scope and pricing need Mac's sign off before this slide is used with a prospect.");
  d.notes(s, "The one slide in the deck not built from published Momentum material. It carries no invented metrics: the only figure on it, AI visibility 35, comes from the Detroit Dispensing Solutions case study. Do not quote a price until Mac sets one.", [
    "needmomentum.com/marketing-case-studies/b2b-seo-lead-generation/",
  ]);
}

// ───────────────────────────────────────────────────────────────── 13 industries
{
  const s = d.slide({ kicker: "Industries", title: "Twenty industries, a specialist playbook for each" });
  const inds = [
    "Beauty and salons", "Breweries", "Cafes and coffee", "Cannabis", "Car dealerships",
    "Dentists", "Ecommerce", "Flooring", "Gyms and fitness", "Healthcare and hospice",
    "Home contractors", "IT and MSP", "Lawyers", "Mechanics", "Pressure washing",
    "Real estate", "Restaurants", "Retail", "Roofing", "Tattoo studios",
  ];
  const cols = 4, rows = 5;
  const cw = d.CW / cols;
  for (let c = 1; c < cols; c += 1) {
    d.vrule(s, { x: d.M + c * cw - 0.3, y: 2.78, h: 3.6, color: C.line });
  }
  inds.forEach((n, i) => {
    const col = Math.floor(i / rows), row = i % rows;
    const x = d.M + col * cw;
    const y = 2.78 + row * 0.72;
    d.text(s, n, { x, y, w: cw - 0.6, h: 0.62, size: 14, color: C.ink, bold: true, lineSpacingMultiple: 1.08 });
    if (row < rows - 1) d.hair(s, { x, y: y + 0.62, w: cw - 0.6, color: C.line });
  });
  d.foot(s, "Momentum also runs an ecommerce partnership with Dutchie for cannabis retailers.");
  d.notes(s, "Do not read the grid. Point at the prospect's industry and move to the matching case study.", [SITE]);
}

// ───────────────────────────────────────────────────────────────── 14 section
d.section({
  num: 2, kicker: "Section two", title: "Proof",
  sub: "Every figure on the next eight slides is published on needmomentum.com, and is repeated in the speaker notes with its source.",
});

// ───────────────────────────────────────────────────────────────── 15 results
{
  const s = d.slide({
    kicker: "Results", title: "A year of client outcomes, in eight numbers",
    dark: true,
    motif: { x: 10.4, y: -1.6, w: 4.2, dark: true, transparency: 91 },
  });
  d.statRow(s, [
    { value: "+314%", label: "Phone call conversions", sub: "The Kind Insurance", color: C.blueLift },
    { value: "+129%", label: "Organic clicks year on year", sub: "Detroit Dispensing Solutions", color: C.blueLift },
    { value: "+121%", label: "Search visibility", sub: "UnderX ecommerce SEO", color: C.blueLift },
    { value: "+933%", label: "Organic sessions", sub: "Drip IV, Q1 2025", color: C.blueLift },
  ], { y: 3.05, size: 40, dark: true });
  d.hair(s, { x: d.M, y: 4.98, w: d.CW, color: C.lineDark });
  d.statRow(s, [
    { value: "+816%", label: "Conversions after redesign", sub: "Nenner Law", color: C.green },
    { value: "3.3x", label: "Return on ad spend", sub: "Drip IV, Google Ads", color: C.green },
    { value: "1,130", label: "Form conversions", sub: "Bedford Housing, $38.88 CPL", color: C.green },
    { value: "6.09M", label: "Pinterest impressions", sub: "Grand Entry Doors, 2025", color: C.green },
  ], { y: 5.2, size: 40, bottom: d.BOT, dark: true });
  d.notes(s, "The fast version for a short meeting. Each figure has a full slide behind it. Nothing here is an average or a blended agency claim; every number belongs to one named client.", [SITE]);
}

// ───────────────────────────────────────────────────────────────── 16 UnderX
{
  const s = d.p.addSlide();
  d.caseStudy(s, {
    client: "UnderX",
    industry: "Ecommerce apparel · twelve months\nKeyword clustering, topical mapping, SEO landing pages, schema, GA4 reporting",
    hero: { value: "+121%", label: "Search visibility, 512K to 1.12M SERP impressions" },
    stats: [
      { value: "+79%", label: "Monthly clicks", sub: "4.24K to 7.6K" },
      { value: "+28%", label: "Total sales revenue", color: C.green },
      { value: "+11%", label: "Conversion rate", color: C.green },
      { value: "+11.2%", label: "Purchase revenue", color: C.green },
    ],
    before: {
      head: "Traffic that did not translate",
      items: [
        "Visibility flat across product categories",
        "Thin metadata and weak topical coverage",
        "No measurement of SEO against revenue",
      ],
    },
    after: {
      head: "Search built around what people buy",
      items: [
        "Keyword clustering and topical mapping by category",
        "SEO aligned landing pages and rewritten meta content",
        "Internal linking and schema for crawlability",
      ],
    },
  });
  d.notes(s, "The point of this one is that SEO was measured on revenue, not sessions. First measurable movement inside three months, full result over twelve.", [
    "needmomentum.com/ecommerce-seo-case-study-underx/",
  ]);
}

// ───────────────────────────────────────────────────────────────── 17 DDS
{
  const s = d.p.addSlide();
  d.caseStudy(s, {
    client: "Detroit Dispensing\nSolutions",
    industry: "B2B equipment manufacturer · six months\nNon branded SEO, new service pages, AISEO, lead tracking, LinkedIn retargeting",
    hero: { value: "334", label: "Tracked leads, June to December: 176 calls and 158 forms" },
    stats: [
      { value: "+129%", label: "Organic clicks year on year", sub: "3,095 total" },
      { value: "+70%", label: "Impressions year on year", sub: "136,000+" },
      { value: "+67%", label: "New users", sub: "45,740" },
      { value: "35", label: "AI visibility score", sub: "More cited pages", color: C.orange },
    ],
    before: {
      head: "Invisible for the searches that matter",
      items: [
        "Almost no non branded visibility for equipment terms",
        "Content gaps across high intent product searches",
        "Lead attribution unclear across calls and forms",
      ],
    },
    after: {
      head: "Product intent search, tracked",
      items: [
        "cfm 1800 ranks #1, concentrate dispenser machine #3",
        "December delivered 85 inbound leads, organic and paid",
        "ChatGPT now appears in the monthly lead mix",
      ],
    },
  });
  d.notes(s, "The best AEO story Momentum has today. AI visibility grew to 35 and ChatGPT shows up as a named source in the December lead mix. Use it when a prospect asks about AI search. LinkedIn retargeting CTR was 2.92%, up 356% on prospecting.", [
    "needmomentum.com/marketing-case-studies/b2b-seo-lead-generation/",
  ]);
}

// ───────────────────────────────────────────────────────────────── 18 Kind Insurance
{
  const s = d.p.addSlide();
  d.caseStudy(s, {
    client: "The Kind Insurance",
    industry: "Insurance brokerage · 2025 against 2024\nCall first conversion setup, budget reallocation, search term control",
    hero: { value: "638", label: "Phone call conversions in 2025, up 314% from 154" },
    stats: [
      { value: "+37%", label: "Clicks", sub: "14,111 to 19,305" },
      { value: "33.06%", label: "Call conversion rate", sub: "Up from 10.91%", color: C.green },
      { value: "$42.09", label: "Cost per conversion", sub: "Up from $13.27" },
      { value: "10.37%", label: "Search impression share", sub: "2025" },
    ],
    before: {
      head: "Cheap conversions that were not calls",
      items: [
        "Phone calls were not consistently the goal",
        "Budget pacing drifted and wasted spend",
        "Too many campaigns slowed optimization",
      ],
    },
    after: {
      head: "One KPI, defended every week",
      items: [
        "Calls set as the main conversion, quality checked",
        "Spend shifted to winners, weak campaigns paused",
        "Search terms reviewed often, negatives added",
      ],
    },
    note: "Cost per conversion rose on purpose. The account stopped buying cheap non call conversions, so call volume more than quadrupled.",
  });
  d.notes(s, "Handle the CPA objection before the prospect raises it. $13.27 to $42.09 looks like a regression until you say what was being counted. Call conversion rate went 10.91% to 33.06%.", [
    "needmomentum.com/marketing-case-studies/ppc-phone-call-lead-generation/",
  ]);
}

// ───────────────────────────────────────────────────────────────── 19 Bedford
{
  const s = d.p.addSlide();
  d.caseStudy(s, {
    client: "Bedford Corporate\nHousing",
    industry: "Corporate housing, Los Angeles\nGoogle Ads rebuilt around qualified form fills, plus SEO from a standing start",
    hero: { value: "1,130", label: "Form conversions on $44K of ad spend" },
    stats: [
      { value: "$38.88", label: "Average cost per lead", sub: "About $25 since Aug 2025", color: C.green },
      { value: "10.12%", label: "Average click through rate" },
      { value: "137", label: "Leads in three weeks", sub: "130 forms and 7 calls" },
      { value: "~80", label: "Forms per month", sub: "Ongoing average" },
    ],
    before: {
      head: "Calls that were the wrong fit",
      items: [
        "Built around calls on a $60 to $70 daily budget",
        "Lead quality and cost both unsatisfactory",
        "No rankings and no Google Maps local pack presence",
      ],
    },
    after: {
      head: "Qualified forms, then scale",
      items: [
        "Rebuilt for qualified form fills, with clean tracking",
        "Targeting tightened to Los Angeles high intent search",
        "48 paid and 48 organic leads in the same three weeks",
      ],
    },
  });
  d.notes(s, "Good slide for a prospect who says their ads bring the wrong people. The fix was changing what the account optimizes toward, then scaling.", [
    "needmomentum.com/marketing-case-studies/google-ads-case-study/",
    "needmomentum.com/marketing-case-studies/corporate-housing-marketing-bedford/",
  ]);
}

// ───────────────────────────────────────────────────────────────── 20 Drip IV
{
  const s = d.p.addSlide();
  d.caseStudy(s, {
    client: "Drip IV",
    industry: "Med spa and IV lounge, Michigan and Florida\nWebsite redesign, SEO and local SEO, citations, Meta Ads and Google Ads",
    hero: { value: "413", label: "Booked calls from organic, Google Business Profile and paid" },
    stats: [
      { value: "+933%", label: "Organic sessions", sub: "Q1 2025" },
      { value: "3.3x", label: "Google Ads return on ad spend", sub: "2.07x blended", color: C.green },
      { value: "$11.88", label: "Cost per lead", sub: "Healthcare lead generation", color: C.green },
      { value: "146", label: "Bookings from Meta sale ads", sub: "Plus 73 from Google Ads calls" },
    ],
    before: {
      head: "Growth ambitions, no system",
      items: [
        "Expansion planned across two states",
        "Low visibility in competitive local markets",
        "No sustainable way to capture and convert leads",
      ],
    },
    after: {
      head: "One funnel, three locations",
      items: [
        "Separate campaigns and profiles per location",
        "Conversion focused site with streamlined booking",
        "$8,035 in tracked revenue from Google Ads",
      ],
    },
  });
  d.notes(s, "The multi location story. Three profiles, three ad campaigns, one funnel. The next phase on the case study page is concierge medicine plus email and SMS retention.", [
    "needmomentum.com/drip-iv-case-study/",
    "needmomentum.com/marketing-case-studies/iv-therapy-paid-ads/",
  ]);
}

// ───────────────────────────────────────────────────────────────── 21 more proof
{
  const s = d.slide({ kicker: "More proof", title: "Nine more clients, nine more numbers" });
  d.statRow(s, [
    { value: "53", label: "Qualified leads in 30 days", sub: "Tristate Window and Siding, plus 19 booked appointments" },
    { value: "71", label: "Paid leads", sub: "Jade International freight, $19.58 Google CPL" },
    { value: "7.9K", label: "Organic clicks", sub: "Sweetlife NYC, Wix to WordPress with no traffic loss" },
    { value: "172", label: "Tracked conversions", sub: "LaserSkin MedSpa, 21 booked appointments" },
    { value: "24,688", label: "Sessions", sub: "Mosser Legal appellate practice" },
  ], { y: 2.72, size: 34 });
  d.hair(s, { x: d.M, y: 4.62, w: d.CW, color: C.line });
  d.statRow(s, [
    { value: "$594K", label: "Annual sales in 2021", sub: "Alex Mika Jewelry, up from $142K in 2016", color: C.green },
    { value: "5 → 35", label: "Domain authority", sub: "Alex Mika Jewelry, backlinks 224 to 2,408", color: C.green },
    { value: "1,200+", label: "Ranking keywords from zero", sub: "7Bros Apparel Shopify build", color: C.green },
    { value: "130+", label: "New signups", sub: "Sweetlife NYC, QR to form flow in under a month", color: C.green },
    { value: "100K+", label: "Guests and site visitors", sub: "NOTO PHL and NOTO HTX, 200+ reviews", color: C.green },
  ], { y: 4.86, size: 34, bottom: d.BOT });
  d.notes(s, "Rapid fire. Alex Mika ran four years and the page is honest that traffic declined 40% after the contract ended, which is a useful retention argument if a prospect asks what happens when they stop.", [
    "needmomentum.com/marketing-case-studies/home-services-lead-generation/",
    "needmomentum.com/marketing-case-studies/freight-company-google-ads/",
    "needmomentum.com/marketing-case-studies/site-migration-case-study/",
    "needmomentum.com/marketing-case-studies/med-spa-google-ads-case-study/",
    "needmomentum.com/ecommerce-jewelry-marketing-case-study/",
    "needmomentum.com/shopify-seo-case-study/",
    "needmomentum.com/marketing-case-studies/legal-seo-mosser-legal/",
    "needmomentum.com/nightclub-marketing-case-study/",
  ]);
}

// ───────────────────────────────────────────────────────────────── 22 section
d.section({
  num: 3, kicker: "Section three", title: "Working together",
  sub: "How an engagement starts, what it costs, and what you get back every month.",
});

// ───────────────────────────────────────────────────────────────── 23 process
{
  const s = d.slide({
    kicker: "Process", title: "How an engagement runs",
    sub: "It starts with a free audit, and nothing is guessed after that.",
    panel: { side: "bottom", size: 2.05, fill: C.navy },
  });
  d.steps(s, [
    { head: "Free marketing audit", body: "We audit the website, SEO and full digital presence before quoting. Published as a $500 value." },
    { head: "Strategy and goals", body: "We agree the outcome first: calls, forms, bookings or sales, and how each is counted." },
    { head: "Build", body: "Site, tracking, campaigns, content and automations built to that plan, with clear owners." },
    { head: "Launch and optimize", body: "First runs watched closely, then continuous testing on ads, pages and search terms." },
    { head: "Report", body: "Analytics, tracking and consulting are in every retainer. You see the same numbers we do." },
  ], { y: 2.75, height: 1.9, bottom: 5.2 });

  d.kicker(s, "Momentum's own published commitment", { x: d.M, y: 5.72, w: 8.0, dark: true });
  d.flow(s, "\"We guarantee to grow your business online or your money back\"", {
    x: d.M, y: 6.06, w: 11.5, size: 21, color: C.onDark, bold: true, spacing: 1.08,
  });
  d.notes(s, "Read the guarantee wording exactly as published. Do not paraphrase it into a stronger promise, and do not extend it to packages that do not carry it. Individual packages carry their own: guaranteed growth on Kickstart, first page of Google on the twelve month SEO package, a rank increase on GBP management. Confirm with Mac that the language is current.", [
    "needmomentum.com/marketing-prices/",
    "needmomentum.com/marketing-case-studies/",
  ]);
}

// ───────────────────────────────────────────────────────────────── 24 pricing core
{
  const s = d.slide({
    kicker: "Pricing", title: "Three ways to start",
    sub: "Published pricing. Every monthly package runs on a three month minimum.",
  });
  const y = 2.9, h = 3.62, NH = 0.34, SH = 0.24;
  d.priceCol(s, {
    x: d.M, y, w: 3.3, h, nameH: NH, subH: SH,
    name: "Small Business Kickstart", sub: "Local marketing package",
    price: "$999/mo", term: "Monthly · 3 month minimum",
    features: ["Full marketing audit", "Local SEO", "Google Business Profile", "Basic website optimizations", "Analytics and reporting"],
    footnote: "Published as guaranteed growth.",
    rule: false,
  });
  d.priceCol(s, {
    x: d.M + 4.42, y, w: 3.5, h, accent: true, nameH: NH, subH: SH,
    name: "Small Business Growth", sub: "Digital marketing expansion",
    price: "$2,999/mo", term: "Monthly · 3 month minimum",
    features: ["Everything in Kickstart", "Website management and SEO", "Backlinking, content and blogging", "Google Ads, PPC, social and design", "Strategy, analytics and consulting"],
    footnote: "Most complete monthly package.",
  });
  d.priceCol(s, {
    x: d.M + 9.05, y, w: 3.25, h, nameH: NH, subH: SH,
    name: "Ultimate Small Business SEO", sub: "Full service Google SEO",
    price: "$10,000", term: "12 months, or $1,000/mo x 12",
    features: ["Full SEO audit", "Local SEO and GBP marketing", "Website support and SEO", "Google Local Ads", "Strategy and consulting"],
    footnote: "Published guarantee: first page of Google.",
  });
  d.foot(s, "Stated minimum retainers: $1,000 per month for standard packages, $3,000 per month for custom packages. Refer a business and you both get 20% off the next month.");
  d.notes(s, "All three prices are published on needmomentum.com/marketing-prices/. The middle card is the one to anchor on. Custom or specific projects are quoted on a call.", [
    "needmomentum.com/marketing-prices/",
  ]);
}

// ───────────────────────────────────────────────────────────────── 25 pricing add-ons
{
  const s = d.slide({ kicker: "Pricing", title: "Add on and single service pricing" });
  d.table(s, [
    ["Service", "Price", "Term", "What it covers"],
    ["Google My Business management", "$500/mo", "3 month minimum", "GMB audit and makeover, posts, pictures, reviews, content, reporting"],
    ["Backlinking and domain authority", "$500/mo", "3 month minimum", "Citations, directories, profile links, niche blog networks, premium sites"],
    ["Full SEO marketing package", "$1,000/mo", "3 month minimum", "GMB, local and website SEO, speed and mobile, citations, backlinks, content"],
    ["Content and blogging", "$1,000/mo", "3 month minimum", "Four blogs or pages a month, research, writing, edits, SEO and linking"],
    ["Social media marketing", "$1,000/mo", "3 month minimum", "Calendar, design, posting 3x weekly, stories, hashtags, engagement"],
    ["Custom marketing solutions", "from $1,000/mo", "Monthly", "Any combination of web, social, SEO, local SEO, PPC and graphic design"],
    ["Paid advertising management", "$1,500/mo", "3 month minimum", "Audit, setup or takeover, buildout, targeting, creative, conversion tracking"],
    ["Design and branding", "$3,000", "One time, about 3 months", "Strategy, research, mockups, unlimited edits, logo and social design, full rights"],
  ], { x: d.M, y: 2.4, w: d.CW, colW: [3.05, 1.5, 1.9, 5.32], rowH: 0.46, fontSize: 11.5 });
  d.foot(s, "Paid advertising management is quoted plus your ad media budget. Backlinking and social pricing range with volume. All figures published at needmomentum.com/marketing-prices/.");
  d.notes(s, "Nine rows, all published. If a prospect wants to mix services, the answer is the custom package at a $1,000 monthly floor, or $3,000 for a genuinely custom build.", [
    "needmomentum.com/marketing-prices/",
  ]);
}

// ───────────────────────────────────────────────────────────────── 26 close
{
  const s = d.p.addSlide();
  s.background = { color: C.navy };
  d.rect(s, { x: 7.75, y: 0, w: d.W - 7.75, h: d.H, fill: C.navyLift });
  d.mark(s, { x: 9.5, y: 1.15, w: 6.4, dark: true, transparency: 90 });
  d.logo(s, { dark: true, x: d.M, y: 0.72, w: d.b.logo.titleWidth });

  let y = d.kicker(s, "Next step", { x: d.M, y: 2.5, w: 6.4, dark: true });
  y = d.flow(s, "Start with the\nfree audit.", {
    x: d.M, y, w: 7.0, size: d.T.display, color: C.onDark, bold: true, spacing: 0.99, gapAfter: 0.34,
  });
  d.flow(s, "We audit the website, SEO, Google Business Profile and the current digital presence, then walk through what we found and what we would do first. Published on the site as a $500 value.", {
    x: d.M, y, w: 6.6, size: 14, color: C.onDarkSoft, spacing: 1.34,
  });

  d.hair(s, { x: d.M, y: 6.05, w: 6.9, color: C.lineDark });
  d.text(s, "(215) 876-2954", { x: d.M, y: 6.3, w: 3.0, h: 0.34, size: 17, color: C.blueLift, bold: true });
  d.text(s, "hi@needmomentum.com\nneedmomentum.com", {
    x: d.M, y: 6.72, w: 3.0, h: 0.6, size: 11.5, color: C.onDarkSoft, lineSpacingMultiple: 1.3,
  });
  d.text(s, "1635 Market St. #1601\nPhiladelphia, PA 19103\nMon to Fri, 9:00am to 7:00pm", {
    x: d.M + 3.5, y: 6.3, w: 3.4, h: 0.9, size: 11.5, color: C.onDarkSoft, lineSpacingMultiple: 1.3,
  });
  d.notes(s, "Close by booking the audit, not by sending pricing. The audit is the qualification step and it is already published as free. Office: 1635 Market St. #1601, Philadelphia PA 19103, Mon to Fri 9:00am to 7:00pm.", [
    "needmomentum.com/marketing-prices/",
  ]);
}

const out = process.argv[2] ?? "output/Momentum-Digital-Sales-Deck.pptx";
await d.save(out);
console.log(`wrote ${out}, ${d.p.slides.length} slides`);
