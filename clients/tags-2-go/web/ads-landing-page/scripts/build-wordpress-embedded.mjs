import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const outputDir = path.join(root, 'wordpress', 'tags2go-landing-page-v106');
let governmentServicesHtml = await readFile(path.join(dist, 'index.html'), 'utf8');
let notaryDocumentsHtml = await readFile(path.join(dist, 'notary-documents.html'), 'utf8');

for (const file of [
  ['hero-current.jpg', 'image/jpeg'],
  ['registration-certificate.png', 'image/png'],
  ['service-office.jpg', 'image/jpeg'],
  ['tags2go-logo.jpeg', 'image/jpeg'],
]) {
  const bytes = await readFile(path.join(dist, 'assets', file[0]));
  const dataUrl = `data:${file[1]};base64,${bytes.toString('base64')}`;
  governmentServicesHtml = governmentServicesHtml.replaceAll(`src="assets/${file[0]}"`, `src="${dataUrl}"`);
  notaryDocumentsHtml = notaryDocumentsHtml.replaceAll(`src="assets/${file[0]}"`, `src="${dataUrl}"`);
}

const encodedGovernmentServicesHtml = Buffer.from(governmentServicesHtml, 'utf8').toString('base64');
const encodedNotaryDocumentsHtml = Buffer.from(notaryDocumentsHtml, 'utf8').toString('base64');
const plugin = `<?php
/**
 * Plugin Name: Tags 2 Go Advertising Landing Page Production Embedded
 * Description: Serves the finalized advertising landing pages at stable public URLs with self-contained assets.
 * Version: 1.0.6
 * Author: DM Marketing Specialist
 */

if (!defined('ABSPATH')) { exit; }

function tags2go_landing_v106_ensure_pages(): void
{
    $pages = [
        'philadelphia-title-registration-services' => 'Philadelphia Title and Registration Services',
        'philadelphia-notary-document-services' => 'Philadelphia Notary and Document Services',
    ];

    $created = false;
    foreach ($pages as $slug => $title) {
        if (get_page_by_path($slug, OBJECT, 'page') instanceof WP_Post) { continue; }
        wp_insert_post([
            'post_title' => $title,
            'post_name' => $slug,
            'post_status' => 'publish',
            'post_type' => 'page',
            'post_content' => '',
            'comment_status' => 'closed',
        ]);
        $created = true;
    }

    if ($created) { flush_rewrite_rules(false); }
}
register_activation_hook(__FILE__, 'tags2go_landing_v106_ensure_pages');
add_action('init', 'tags2go_landing_v106_ensure_pages');

function tags2go_landing_v106_render(): void
{
    if (is_page('philadelphia-title-registration-services')) {
        $payload = '${encodedGovernmentServicesHtml}';
    } elseif (is_page('philadelphia-notary-document-services')) {
        $payload = '${encodedNotaryDocumentsHtml}';
    } else {
        return;
    }

    status_header(200);
    header('Content-Type: text/html; charset=UTF-8');
    header('Cache-Control: public, max-age=300');
    echo base64_decode($payload);
    exit;
}
add_action('template_redirect', 'tags2go_landing_v106_render', -20);
`;

await mkdir(outputDir, { recursive: true });
await writeFile(path.join(outputDir, 'tags2go-landing-page.php'), plugin, 'utf8');
console.log('Built embedded WordPress landing plugin.');
