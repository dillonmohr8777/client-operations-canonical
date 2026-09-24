<?php
/**
 * Plugin Name: Tags 2 Go Landing Page Deployer
 * Description: Deploys the approved advertising landing page to its stable public path.
 * Version: 1.0.1
 * Author: DM Marketing Specialist
 */

if (!defined('ABSPATH')) {
    exit;
}

function tags2go_deploy_landing_page(): void
{
    $source = trailingslashit(plugin_dir_path(__FILE__)) . 'site';
    $target = trailingslashit(ABSPATH) . 'philadelphia-title-registration-services';

    if (!is_dir($source) || !wp_mkdir_p($target)) {
        update_option('tags2go_landing_deploy_status', 'error');
        return;
    }

    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($source, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::SELF_FIRST
    );

    foreach ($iterator as $item) {
        $relative = $iterator->getSubPathName();
        $destination = $target . DIRECTORY_SEPARATOR . $relative;

        if ($item->isDir()) {
            wp_mkdir_p($destination);
            continue;
        }

        wp_mkdir_p(dirname($destination));
        copy($item->getPathname(), $destination);
    }

    update_option('tags2go_landing_deploy_status', 'success');
}
register_activation_hook(__FILE__, 'tags2go_deploy_landing_page');

function tags2go_landing_deploy_notice(): void
{
    $status = get_option('tags2go_landing_deploy_status');

    if ($status === 'success') {
        echo '<div class="notice notice-success is-dismissible"><p>Tags 2 Go landing page deployed successfully.</p></div>';
    } elseif ($status === 'error') {
        echo '<div class="notice notice-error"><p>Tags 2 Go landing page deployment failed. Check WordPress file permissions.</p></div>';
    }

    delete_option('tags2go_landing_deploy_status');
}
add_action('admin_notices', 'tags2go_landing_deploy_notice');

function tags2go_serve_landing_page(): void
{
    $path = trim((string) wp_parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH), '/');
    $base = 'philadelphia-title-registration-services';
    $site = trailingslashit(plugin_dir_path(__FILE__)) . 'site';

    if ($path === $base) {
        $file = $site . DIRECTORY_SEPARATOR . 'index.html';

        if (is_readable($file)) {
            status_header(200);
            header('Content-Type: text/html; charset=UTF-8');
            header('Cache-Control: public, max-age=300');
            readfile($file);
            exit;
        }
    }

    $asset_prefix = $base . '/assets/';
    if (strpos($path, $asset_prefix) !== 0) {
        return;
    }

    $asset = substr($path, strlen($asset_prefix));
    $allowed = [
        'hero-current.jpg' => 'image/jpeg',
        'registration-certificate.png' => 'image/png',
        'service-office.jpg' => 'image/jpeg',
        'tags2go-logo.jpeg' => 'image/jpeg',
    ];

    if (!isset($allowed[$asset])) {
        return;
    }

    $file = $site . DIRECTORY_SEPARATOR . 'assets' . DIRECTORY_SEPARATOR . $asset;
    if (!is_readable($file)) {
        return;
    }

    status_header(200);
    header('Content-Type: ' . $allowed[$asset]);
    header('Cache-Control: public, max-age=86400');
    readfile($file);
    exit;
}
add_action('template_redirect', 'tags2go_serve_landing_page', 0);
