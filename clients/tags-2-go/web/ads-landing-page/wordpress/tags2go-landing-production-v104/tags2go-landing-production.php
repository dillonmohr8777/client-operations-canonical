<?php
/**
 * Plugin Name: Tags 2 Go Advertising Landing Page Production
 * Description: Serves the finalized advertising landing page at its stable public URL.
 * Version: 1.0.4
 * Author: DM Marketing Specialist
 */

if (!defined('ABSPATH')) {
    exit;
}

function tags2go_landing_production_v104_ensure_page(): void
{
    if (get_page_by_path('philadelphia-title-registration-services', OBJECT, 'page') instanceof WP_Post) {
        return;
    }

    wp_insert_post([
        'post_title' => 'Philadelphia Title and Registration Services',
        'post_name' => 'philadelphia-title-registration-services',
        'post_status' => 'publish',
        'post_type' => 'page',
        'post_content' => '',
        'comment_status' => 'closed',
    ]);
    flush_rewrite_rules(false);
}
register_activation_hook(__FILE__, 'tags2go_landing_production_v104_ensure_page');

function tags2go_landing_production_v104_serve(): void
{
    $path = trim((string) wp_parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH), '/');
    $base = 'philadelphia-title-registration-services';

    if ($path !== $base) {
        return;
    }

    $file = plugin_dir_path(__FILE__) . 'site' . DIRECTORY_SEPARATOR . 'index.html';
    if (!is_readable($file)) {
        return;
    }

    status_header(200);
    header('Content-Type: text/html; charset=UTF-8');
    header('Cache-Control: public, max-age=300');
    readfile($file);
    exit;
}
add_action('template_redirect', 'tags2go_landing_production_v104_serve', -10);
