import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const pages = JSON.parse(await readFile(path.join(root, 'pages.json'), 'utf8'));

function elementId(seed) {
  return createHash('sha256').update(seed).digest('hex').slice(0, 8);
}

const publication = [];

for (const page of pages) {
  const fragmentPath = path.join(root, 'fragments', `${page.slug}.html`);
  const html = await readFile(fragmentPath, 'utf8');
  const elementorData = [
    {
      id: elementId(`${page.id}:section`),
      elType: 'section',
      settings: {
        layout: 'full_width',
        gap: 'no',
        height: 'default',
        structure: '10'
      },
      elements: [
        {
          id: elementId(`${page.id}:column`),
          elType: 'column',
          settings: {
            _column_size: 100,
            _inline_size: null
          },
          elements: [
            {
              id: elementId(`${page.id}:html`),
              elType: 'widget',
              widgetType: 'html',
              settings: { html },
              elements: []
            }
          ],
          isInner: false
        }
      ],
      isInner: false
    }
  ];

  publication.push({
    id: page.id,
    slug: page.slug,
    expectedUrl: `https://barcrawlusa.com/${page.slug}/`,
    seo: {
      title: page.title,
      description: page.meta
    },
    draftPayload: {
      title: page.title,
      slug: page.slug,
      content: html,
      status: 'draft',
      meta: {
        _elementor_edit_mode: 'builder',
        _elementor_template_type: 'wp-page',
        _elementor_data: JSON.stringify(elementorData),
        _elementor_page_settings: {
          hide_title: 'yes'
        }
      }
    }
  });
}

const ids = publication.map((page) => page.id);
const slugs = publication.map((page) => page.slug);
if (publication.length !== 10 || new Set(ids).size !== 10 || new Set(slugs).size !== 10) {
  throw new Error('Publication packet must contain ten unique page IDs and slugs.');
}

await writeFile(
  path.join(root, 'publication-payloads.json'),
  `${JSON.stringify(publication, null, 2)}\n`,
  'utf8'
);

console.log(`Prepared ${publication.length} draft-first Elementor publication payloads.`);
