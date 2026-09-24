<?php
// Offline contract tests. WordPress/provider calls below are fakes; no external traffic or real credentials.
define('ABSPATH', __DIR__);
class WP_Error {
    public function __construct(public $code, public $message, public $data) {}
}
class WP_REST_Response {
    public $headers = [];
    public function __construct(public $data) {}
    public function header($key, $value) { $this->headers[$key] = $value; }
}
class FakeRequest {
    public $nonce = 'test-nonce';
    public function __construct(public $input) {}
    public function get_header($name) { return $this->nonce; }
    public function get_body() { return json_encode($this->input); }
    public function get_json_params() { return $this->input; }
}
function add_action($hook, $callback) { $callback(); }
function register_rest_route($ns, $route, $args) { $GLOBALS['route'] = [$ns, $route, $args]; }
function home_url() { return $GLOBALS['origin']; }
function is_user_logged_in() { return $GLOBALS['loggedIn']; }
function current_user_can($capability) { return $GLOBALS['admin'] && $capability === 'manage_options'; }
function wp_verify_nonce($nonce, $action) { return $nonce === 'test-nonce' && $action === 'wp_rest'; }
function sanitize_textarea_field($text) { return trim(strip_tags($text)); }
function is_wp_error($value) { return $value instanceof WP_Error; }
function wp_json_encode($value) { return json_encode($value); }
function wp_cache_delete($key, $group) {}
class FakeDB {
    public $options = 'wp_options';
    public function prepare($sql, ...$args) { return [$sql, $args]; }
    public function query($prepared) {
        [$sql, $args] = $prepared;
        if ($GLOBALS['dbFailure']) { return false; }
        if (str_starts_with($sql, 'INSERT IGNORE INTO ')) {
            if ($GLOBALS['lock'] !== null) { return 0; }
            $GLOBALS['lock'] = (int) $args[1];
            return 1;
        }
        if (!str_starts_with($sql, 'UPDATE ')) { throw new RuntimeException('Unexpected SQL'); }
        if ($GLOBALS['lock'] <= $args[2]) { $GLOBALS['lock'] = (int) $args[0]; return 1; }
        return 0;
    }
}
function wp_remote_post($url, $args) {
    $GLOBALS['calls'][] = [$url, $args];
    return $GLOBALS['provider'];
}
function wp_remote_retrieve_response_code($response) { return $response['status']; }
function wp_remote_retrieve_body($response) { return $response['body']; }
require __DIR__ . '/m360-gbp-pilot.php';
$wpdb = new FakeDB();
$checks = [];
function check($name, $ok) {
    if (!$ok) { throw new RuntimeException('FAILED: ' . $name); }
    $GLOBALS['checks'][] = $name;
}
function reset_case() {
    putenv('M360_GBP_PILOT_ENABLED=1');
    putenv('M360_GBP_PILOT_ORIGIN=https://www.momentumvirtualtours.com');
    putenv('M360_ANTHROPIC_API_KEY=synthetic-test-value-not-a-credential');
    $GLOBALS['origin'] = 'https://www.momentumvirtualtours.com';
    $GLOBALS['loggedIn'] = true;
    $GLOBALS['admin'] = true;
    $GLOBALS['lock'] = null;
    $GLOBALS['dbFailure'] = false;
    $GLOBALS['calls'] = [];
    $GLOBALS['provider'] = ['status' => 200, 'body' => json_encode([
        'stop_reason' => 'end_turn', 'content' => [['type' => 'text', 'text' => 'Example bakery makes sourdough bread.']],
    ])];
    return new FakeRequest(['businessName' => 'Example Bakery', 'businessType' => 'Bakery',
        'facts' => 'We make sourdough bread.', 'postType' => 'update']);
}
function invoke($request) { return Momentum\GBPRecovery\generate($request); }
function error_is($value, $code) { return is_wp_error($value) && $value->code === $code; }

check('route requires POST and permission callback', $route[2]['methods'] === 'POST' && is_callable($route[2]['permission_callback']));
$q = reset_case(); putenv('M360_GBP_PILOT_ENABLED');
check('disabled by default', error_is(invoke($q), 'pilot_disabled') && !$calls);
$q = reset_case(); $origin = 'https://www.needmomentum.com';
check('different site rejected', error_is(invoke($q), 'site_not_configured') && !$calls);
$q = reset_case(); putenv('M360_GBP_PILOT_ORIGIN');
check('explicit site required', error_is(invoke($q), 'site_not_configured') && !$calls);
$q = reset_case(); $loggedIn = false;
check('anonymous denied before provider call', error_is(invoke($q), 'admin_required') && !$calls);
$q = reset_case(); $admin = false;
check('non-administrator denied', error_is(invoke($q), 'admin_required') && !$calls);
$q = reset_case(); $q->nonce = 'invalid';
check('invalid nonce denied', error_is(invoke($q), 'invalid_nonce') && !$calls);
foreach ([null, [], ['businessName' => []]] as $bad) {
    $q = reset_case(); $q->input = $bad;
    check('invalid JSON shape ' . count($checks), error_is(invoke($q), 'invalid_input') && !$calls);
}
foreach (['businessName', 'businessType', 'facts', 'postType'] as $field) {
    $q = reset_case(); $q->input[$field] = '<b></b>';
    check('empty sanitized ' . $field . ' rejected', error_is(invoke($q), 'invalid_input') && !$calls);
}
$q = reset_case(); $q->input['facts'] = str_repeat('x', 3001);
check('field limit enforced', error_is(invoke($q), 'invalid_input') && !$calls);
$q = reset_case(); $q->input['facts'] = str_repeat('x', 11000);
check('body limit enforced', error_is(invoke($q), 'input_too_large') && !$calls);
$q = reset_case(); $q->input['postType'] = 'publish';
check('unknown type denied', error_is(invoke($q), 'invalid_type') && !$calls);
$q = reset_case(); putenv('M360_ANTHROPIC_API_KEY');
check('missing protected key fails closed', error_is(invoke($q), 'provider_not_configured') && !$calls);
$q = reset_case(); $result = invoke($q); $body = json_decode($calls[0][1]['body'], true);
check('successful draft only', $result instanceof WP_REST_Response && $result->data['posted'] === false && $result->data['requiresReview'] === true);
check('response not cached', $result->headers['Cache-Control'] === 'no-store, private');
check('fixed provider and current model', $calls[0][0] === 'https://api.anthropic.com/v1/messages' && $body['model'] === 'claude-sonnet-4-6');
check('redirects disabled and bounded response', $calls[0][1]['redirection'] === 0 && $calls[0][1]['limit_response_size'] === 24000);
check('key absent from client response', !str_contains(json_encode($result), 'synthetic-test-value'));
check('second batch rate limited', error_is(invoke($q), 'rate_limited') && count($calls) === 1);
$lock = time() - 1; $result = invoke($q);
check('expired lock reclaimed', $result instanceof WP_REST_Response && count($calls) === 2);
$q = reset_case(); $lock = time() - 1; $dbFailure = true;
check('database error fails closed', error_is(invoke($q), 'rate_limited') && !$calls);
$q = reset_case(); $dbFailure = true;
check('initial insertion database error fails closed', error_is(invoke($q), 'rate_limited') && !$calls);
$q = reset_case();
$claim = 'INSERT IGNORE INTO wp_options (option_name, option_value, autoload) VALUES (%s, %s, %s)';
$first = $wpdb->query($wpdb->prepare($claim, 'm360_gbp_recovery_next_batch', '2000000060', 'no'));
$second = $wpdb->query($wpdb->prepare($claim, 'm360_gbp_recovery_next_batch', '2000000061', 'no'));
check('different initial expiry cannot overwrite existing claim in database double', $first === 1 && $second === 0 && $lock === 2000000060);
$q = reset_case(); $q->input['postType'] = 'all'; $result = invoke($q);
check('all four existing draft types supported', count($result->data['posts']) === 4 && count($calls) === 4);
$q = reset_case(); $provider = new WP_Error('network', 'private provider detail', []);
check('network error sanitized', error_is(invoke($q), 'generation_unavailable'));
$q = reset_case(); $provider = ['status' => 401, 'body' => 'private provider detail']; $result = invoke($q);
check('provider error body withheld', error_is($result, 'generation_unavailable') && !str_contains(json_encode($result), 'private provider detail'));
foreach (['not-json', '{}', '{"stop_reason":"max_tokens","content":[]}', '{"stop_reason":"end_turn","content":[]}'] as $bad) {
    $q = reset_case(); $provider['body'] = $bad;
    check('incomplete provider response ' . count($checks), error_is(invoke($q), 'invalid_generation'));
}
$q = reset_case(); $provider['body'] = json_encode(['stop_reason' => 'end_turn', 'content' => [['type' => 'text', 'text' => '<img src=x onerror=alert(1)>Plain draft']]]);
$result = invoke($q);
check('HTML tags removed from text', $result->data['posts'][0]['text'] === 'Plain draft');
echo json_encode(['passed' => true, 'checks' => count($checks), 'tests' => $checks,
    'scope' => 'offline PHP contract tests with WordPress and provider doubles; not live WordPress integration',
    'networkCalls' => 0, 'realCredentialsUsed' => false], JSON_PRETTY_PRINT) . PHP_EOL;
