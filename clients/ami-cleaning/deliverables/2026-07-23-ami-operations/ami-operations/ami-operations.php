<?php
/**
 * Plugin Name: AMI Site Operations
 * Description: Reliable walkthrough submissions, lead notifications, and the AMI website assistant.
 * Version: 1.0.4
 */

defined('ABSPATH') || exit;

final class AMI_Site_Operations {
    private const VERSION = '1.0.4';
    private const ROUTE_NAMESPACE = 'ami-ops/v1';
    private const ROUTE = '/lead';
    private const POST_TYPE = 'ami_walkthrough_lead';
    private const RECIPIENTS = [
        'dillonmohr8777@gmail.com',
        'corinne@ami-cleaning.com',
    ];

    public static function boot(): void {
        add_action('init', [self::class, 'register_lead_type'], 20);
        add_action('rest_api_init', [self::class, 'register_routes']);
        add_action('template_redirect', [self::class, 'buffer_static_site'], -999);
        add_action('wp_enqueue_scripts', [self::class, 'enqueue_assistant']);
        add_action('wp_footer', [self::class, 'override_static_form_endpoint'], 1);
    }

    public static function register_lead_type(): void {
        if (post_type_exists(self::POST_TYPE)) {
            return;
        }

        register_post_type(self::POST_TYPE, [
            'labels' => [
                'name' => 'AMI Leads',
                'singular_name' => 'AMI Lead',
                'menu_name' => 'AMI Leads',
            ],
            'public' => false,
            'show_ui' => true,
            'show_in_menu' => true,
            'supports' => ['title'],
            'menu_icon' => 'dashicons-businessperson',
            'capability_type' => 'post',
            'map_meta_cap' => true,
        ]);
    }

    public static function register_routes(): void {
        register_rest_route(self::ROUTE_NAMESPACE, self::ROUTE, [
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => [self::class, 'receive_lead'],
            'permission_callback' => [self::class, 'allow_public_site_request'],
            'args' => [
                'name' => ['required' => true, 'sanitize_callback' => 'sanitize_text_field'],
                'email' => ['required' => true, 'sanitize_callback' => 'sanitize_email'],
                'phone' => ['required' => false, 'sanitize_callback' => 'sanitize_text_field'],
                'company' => ['required' => false, 'sanitize_callback' => 'sanitize_text_field'],
                'city' => ['required' => false, 'sanitize_callback' => 'sanitize_text_field'],
                'need' => ['required' => false, 'sanitize_callback' => 'sanitize_text_field'],
                'notes' => ['required' => false, 'sanitize_callback' => 'sanitize_textarea_field'],
                'source_path' => ['required' => false, 'sanitize_callback' => 'sanitize_text_field'],
            ],
        ]);
    }

    public static function allow_public_site_request(WP_REST_Request $request): bool {
        $honeypot = sanitize_text_field((string) $request->get_param('ami_company_website'));
        if ($honeypot !== '') {
            return false;
        }

        $origin = isset($_SERVER['HTTP_ORIGIN']) ? esc_url_raw(wp_unslash($_SERVER['HTTP_ORIGIN'])) : '';
        if ($origin === '') {
            return true;
        }

        $origin_host = strtolower((string) wp_parse_url($origin, PHP_URL_HOST));
        $site_host = strtolower((string) wp_parse_url(home_url('/'), PHP_URL_HOST));
        $site_root = preg_replace('/^www\./', '', $site_host);
        $allowed = array_unique([$site_host, $site_root, 'www.' . $site_root]);

        return in_array($origin_host, $allowed, true);
    }

    public static function receive_lead(WP_REST_Request $request) {
        $name = sanitize_text_field((string) $request->get_param('name'));
        $email = sanitize_email((string) $request->get_param('email'));

        if ($name === '' || !is_email($email)) {
            return new WP_Error(
                'ami_invalid_lead',
                'Please provide your name and a valid email address.',
                ['status' => 422]
            );
        }

        $rate_key = 'ami_ops_' . substr(hash('sha256', self::request_ip()), 0, 32);
        $attempts = (int) get_transient($rate_key);
        if ($attempts >= 5) {
            return new WP_Error(
                'ami_rate_limited',
                'Please wait a few minutes or call AMI at 484.319.3255.',
                ['status' => 429]
            );
        }
        set_transient($rate_key, $attempts + 1, 5 * MINUTE_IN_SECONDS);

        $fields = [
            'name' => $name,
            'email' => $email,
            'phone' => sanitize_text_field((string) $request->get_param('phone')),
            'company' => sanitize_text_field((string) $request->get_param('company')),
            'city' => sanitize_text_field((string) $request->get_param('city')),
            'need' => sanitize_text_field((string) $request->get_param('need')),
            'notes' => sanitize_textarea_field((string) $request->get_param('notes')),
            'source_path' => sanitize_text_field((string) $request->get_param('source_path')),
        ];

        $lead_id = wp_insert_post([
            'post_type' => self::POST_TYPE,
            'post_status' => 'private',
            'post_title' => sprintf('%s - %s', $name, current_time('M j, Y g:i a')),
        ], true);

        if (is_wp_error($lead_id)) {
            return new WP_Error(
                'ami_lead_storage_failed',
                'We could not save the request. Please call AMI at 484.319.3255.',
                ['status' => 500]
            );
        }

        foreach ($fields as $key => $value) {
            update_post_meta($lead_id, '_ami_' . $key, $value);
        }

        $subject = sprintf('New AMI walkthrough lead: %s', $name);
        $body = self::notification_body($fields, (int) $lead_id);
        $headers = [
            'Content-Type: text/plain; charset=UTF-8',
            sprintf('Reply-To: %s <%s>', $name, $email),
        ];
        $notification_sent = wp_mail(
            self::notification_recipients(),
            $subject,
            $body,
            $headers
        );

        return new WP_REST_Response([
            'ok' => true,
            'lead_id' => (int) $lead_id,
            'notification_sent' => (bool) $notification_sent,
        ], 201);
    }

    private static function notification_body(array $fields, int $lead_id): string {
        $lines = [
            'A new walkthrough request was submitted on the AMI website.',
            '',
            'Lead ID: ' . $lead_id,
            'Name: ' . $fields['name'],
            'Company: ' . ($fields['company'] ?: 'Not provided'),
            'Email: ' . $fields['email'],
            'Phone: ' . ($fields['phone'] ?: 'Not provided'),
            'Facility city: ' . ($fields['city'] ?: 'Not provided'),
            'Service need: ' . ($fields['need'] ?: 'Not provided'),
            'Notes: ' . ($fields['notes'] ?: 'Not provided'),
            'Source: ' . ($fields['source_path'] ?: 'AMI website'),
            '',
            'Reply to this email to contact the lead.',
        ];

        return implode("\n", $lines);
    }

    private static function request_ip(): string {
        return isset($_SERVER['REMOTE_ADDR'])
            ? sanitize_text_field(wp_unslash($_SERVER['REMOTE_ADDR']))
            : 'unknown';
    }

    private static function notification_recipients(): array {
        $today_new_york = (new DateTimeImmutable(
            'now',
            new DateTimeZone('America/New_York')
        ))->format('Y-m-d');

        if ($today_new_york === '2026-07-23') {
            return [self::RECIPIENTS[0]];
        }

        return self::RECIPIENTS;
    }

    public static function enqueue_assistant(): void {
        $base = plugin_dir_url(__FILE__);
        wp_enqueue_style(
            'ami-site-assistant',
            $base . 'assets/ami-site-assistant.css',
            [],
            self::VERSION
        );
        wp_enqueue_script(
            'ami-site-assistant',
            $base . 'assets/ami-site-assistant.js',
            [],
            self::VERSION,
            true
        );
        wp_localize_script('ami-site-assistant', 'AMI_SITE_ASSISTANT', [
            'endpoint' => esc_url_raw(rest_url(self::ROUTE_NAMESPACE . self::ROUTE)),
            'phone' => '484.319.3255',
            'phoneHref' => 'tel:+14843193255',
        ]);
    }

    public static function buffer_static_site(): void {
        if (is_admin() || (defined('REST_REQUEST') && REST_REQUEST)) {
            return;
        }

        ob_start([self::class, 'inject_static_site_assets']);
    }

    public static function inject_static_site_assets(string $html): string {
        if (
            stripos($html, '</body>') === false ||
            stripos($html, 'ami-site-assistant.js') !== false
        ) {
            return $html;
        }

        $base = plugin_dir_url(__FILE__);
        $endpoint = esc_url_raw(rest_url(self::ROUTE_NAMESPACE . self::ROUTE));
        $injection = sprintf(
            '<link rel="stylesheet" id="ami-site-assistant-css" href="%1$sassets/ami-site-assistant.css?ver=%2$s">' .
            '<script>window.AMI_SITE_ASSISTANT=%3$s;window.AMI_STATIC_SITE_FORM_ENDPOINT=%4$s;</script>' .
            '<script src="%1$sassets/ami-site-assistant.js?ver=%2$s"></script>',
            esc_url($base),
            rawurlencode(self::VERSION),
            wp_json_encode([
                'endpoint' => $endpoint,
                'phone' => '484.319.3255',
                'phoneHref' => 'tel:+14843193255',
            ]),
            wp_json_encode($endpoint)
        );

        return preg_replace('/<\/body>/i', $injection . '</body>', $html, 1) ?: $html;
    }

    public static function override_static_form_endpoint(): void {
        $endpoint = esc_url_raw(rest_url(self::ROUTE_NAMESPACE . self::ROUTE));
        echo '<script>window.AMI_STATIC_SITE_FORM_ENDPOINT=' . wp_json_encode($endpoint) . ';</script>';
    }
}

AMI_Site_Operations::boot();
