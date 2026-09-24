/* AI Search Snapshot - browser vantage capture.
 *
 * Open the site in a normal browser that can actually see it (a bot challenge
 * cleared, a normal residential connection), open DevTools, paste this whole
 * file into the Console, press Enter. It copies a JSON blob to the clipboard
 * and prints it. Save it as runs/<host>/browser-vantage.json and run:
 *
 *   python snapshot.py https://<host>/ --browser-vantage runs/<host>/browser-vantage.json
 *
 * This exists because a datacenter IP gets challenged by SiteGround and
 * similar hosts for every identity, which makes "AI crawlers are blocked"
 * indistinguishable from "this IP is blocked". A real browser session on a
 * real connection is the second vantage point that resolves it.
 *
 * It reads only what the page already shows. No credentials, no cookies, no
 * form values, nothing private. Nothing is sent anywhere.
 */
(async () => {
  const get = async (u) => { try { const r = await fetch(u, { cache: 'no-store' }); return { status: r.status, text: r.ok ? await r.text() : '' }; } catch (e) { return { status: null, text: '' }; } };
  const robots = await get('/robots.txt');
  let sitemap = null;
  for (const u of ['/sitemap_index.xml', '/sitemap.xml']) {
    const s = await get(u);
    if (s.status === 200 && /<(urlset|sitemapindex)/.test(s.text)) {
      sitemap = { url: location.origin + u, url_count: (s.text.match(/<loc>/g) || []).length, is_index: s.text.includes('<sitemapindex') };
      break;
    }
  }
  const body = document.body.innerText || '';
  const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap(x => {
    try { const o = JSON.parse(x.textContent); const t = []; const w = v => { if (Array.isArray(v)) v.forEach(w); else if (v && typeof v === 'object') { if (v['@type']) t.push(v['@type']); Object.values(v).forEach(w); } }; w(o); return t.flat(); }
    catch (e) { return ['(unparseable JSON-LD)']; }
  });
  const meta = n => document.querySelector(`meta[name="${n}"]`)?.content ?? null;
  const out = {
    captured_at: new Date().toISOString(),
    how: 'capture-vantage.js pasted into DevTools on ' + location.href + ' from a browser session that could see the page',
    robots_status: robots.status,
    robots_txt: robots.status === 200 && !/sgcaptcha|Robot Challenge/i.test(robots.text) ? robots.text : null,
    sitemap,
    page: {
      title: document.title,
      h1: [...document.querySelectorAll('h1')].map(h => h.textContent.trim().slice(0, 160)),
      h1_count: document.querySelectorAll('h1').length,
      canonical: document.querySelector('link[rel="canonical"]')?.href ?? null,
      lang: document.documentElement.lang || null,
      viewport: meta('viewport'),
      noindex: /noindex/i.test(meta('robots') || ''),
      jsonld_types: [...new Set(ld)].sort(),
      jsonld_blocks: document.querySelectorAll('script[type="application/ld+json"]').length,
      faq_signal: /\bFAQ|frequently asked/i.test(body) || ld.includes('FAQPage'),
      phone_found: /(?:\+?1[\s.-]?)?\(?\b\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/.test(body),
      address_found: /\b\d{1,6}\s+[A-Z][A-Za-z.]+(?:\s+[A-Z][A-Za-z.]+)*\s+(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Dr|Drive|Ln|Lane|Way|Pike|Hwy|Highway)\b\.?/i.test(body),
      text_chars: body.length,
    },
  };
  if (/Robot Challenge|sgcaptcha/i.test(document.title + body.slice(0, 500))) {
    out.warning = 'This page is a bot-challenge screen, not the site. Clear the challenge and run again.';
  }
  const json = JSON.stringify(out, null, 2);
  try { await navigator.clipboard.writeText(json); console.log('copied to clipboard'); } catch (e) { console.log('clipboard blocked; copy from below'); }
  console.log(json);
  return out;
})();
