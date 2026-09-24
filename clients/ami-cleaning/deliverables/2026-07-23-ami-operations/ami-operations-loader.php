<?php
/**
 * Plugin Name: AMI Site Operations Loader
 * Description: Loads AMI's lead routing and website assistant from the MU plugin folder.
 */

defined('ABSPATH') || exit;

$ami_operations_file = WPMU_PLUGIN_DIR . '/ami-operations/ami-operations.php';

if (is_readable($ami_operations_file)) {
    require_once $ami_operations_file;
}
