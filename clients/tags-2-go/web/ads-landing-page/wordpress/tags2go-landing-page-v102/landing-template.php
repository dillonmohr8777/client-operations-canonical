<?php
if (!defined('ABSPATH')) {
    exit;
}

$html_file = plugin_dir_path(TAGS2GO_LANDING_PAGE_PLUGIN_FILE) . 'site/index.html';
if (!is_readable($html_file)) {
    status_header(500);
    exit('Landing page asset is unavailable.');
}

$html = file_get_contents($html_file);
$asset_base = trailingslashit(plugins_url('site/assets', TAGS2GO_LANDING_PAGE_PLUGIN_FILE));
$html = str_replace('src="assets/', 'src="' . esc_url($asset_base), $html);

status_header(200);
header('Content-Type: text/html; charset=UTF-8');
header('Cache-Control: public, max-age=300');
echo $html;
