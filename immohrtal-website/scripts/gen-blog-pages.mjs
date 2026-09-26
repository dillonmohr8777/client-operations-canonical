/**
 * Generates a static permalink page for every blog post plus the
 * sitemap. Runs automatically before `vite build` (npm prebuild).
 *
 *   node --experimental-strip-types scripts/gen-blog-pages.mjs
 *
 * Each post in src/content/blog.ts becomes blog/<slug>.html: an MPA
 * entry with its own title, meta description, canonical URL, and
 * BlogPosting JSON-LD, mounting src/pages/blog-post-main.tsx.
 * The generated files are build inputs, not source: blog/ is gitignored.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ORIGIN = 'https://immohrtal-site.netlify.app'

const { posts } = await import('../src/content/blog.ts')

const esc = (s) =>
  String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

const pageFor = (post) => {
  const url = `${ORIGIN}/blog/${post.slug}.html`
  const title = `${post.title} | IMMOHRTAL Blog`
  const desc = post.answer.length > 158 ? `${post.answer.slice(0, 155).trimEnd()}...` : post.answer
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${url}#post`,
        mainEntityOfPage: url,
        headline: post.title,
        description: post.answer,
        author: {
          '@type': 'Person',
          '@id': `${ORIGIN}/#dillon-mohr`,
          name: 'Dillon Mohr',
          alternateName: 'IMMOHRTAL',
        },
        image: `${ORIGIN}/og.png`,
      },
    ],
  }
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(desc)}" />
    <link rel="canonical" href="${url}" />
    <meta name="theme-color" content="#05070c" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="IMMOHRTAL" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(desc)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${ORIGIN}/og.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content="${ORIGIN}/og.png" />
    <script type="application/ld+json">
${JSON.stringify(ld, null, 2)}
    </script>
  </head>
  <body data-slug="${esc(post.slug)}">
    <div id="root"></div>
    <script type="module" src="/src/pages/blog-post-main.tsx"></script>
  </body>
</html>
`
}

const blogDir = resolve(ROOT, 'blog')
rmSync(blogDir, { recursive: true, force: true })
mkdirSync(blogDir, { recursive: true })
for (const post of posts) {
  writeFileSync(resolve(blogDir, `${post.slug}.html`), pageFor(post))
}

/* sitemap: static pages + every post permalink */
const today = new Date().toISOString().slice(0, 10)
const urls = [
  ['/', 'weekly', '1.0'],
  ['/about.html', 'monthly', '0.8'],
  ['/blog.html', 'weekly', '0.9'],
  ['/contact.html', 'monthly', '0.6'],
  ...posts.map((p) => [`/blog/${p.slug}.html`, 'monthly', '0.7']),
]
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ([path, freq, pri]) => `  <url>
    <loc>${ORIGIN}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${pri}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`
writeFileSync(resolve(ROOT, 'public/sitemap.xml'), sitemap)

console.log(`generated ${posts.length} blog page(s) + sitemap.xml`)
