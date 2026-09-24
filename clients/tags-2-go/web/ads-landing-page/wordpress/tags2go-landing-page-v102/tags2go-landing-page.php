<?php
/**
 * Plugin Name: Tags 2 Go Advertising Landing Page
 * Description: Publishes the approved advertising landing page and keeps its stable URL available through WordPress.
 * Version: 1.0.2
 * Author: DM Marketing Specialist
 */

if (!defined('ABSPATH')) {
    exit;
}

define('TAGS2GO_LANDING_PAGE_PLUGIN_FILE', __FILE__);

function tags2go_landing_v102_ensure_page(): void
{
    $existing = get_page_by_path('philadelphia-title-registration-services', OBJECT, 'page');
    if ($existing instanceof WP_Post) {
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
register_activation_hook(__FILE__, 'tags2go_landing_v102_ensure_page');

function tags2go_landing_v102_template(string $template): string
{
    if (is_page('philadelphia-title-registration-services')) {
        return plugin_dir_path(__FILE__) . 'landing-template.php';
    }

    return $template;
}
add_filter('template_include', 'tags2go_landing_v102_template', 99);
