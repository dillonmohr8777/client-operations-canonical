<?php
/**
 * Plugin Name: Tags 2 Go Google Ads Tracking
 * Description: Loads the Google Ads tag and records the primary Contact conversion only after a successful Elementor form submission.
 * Version: 1.0.0
 * Author: DM Marketing Specialist
 */

if (!defined('ABSPATH')) {
    exit;
}

const TAGS2GO_GOOGLE_ADS_ID = 'AW-18264347578';
const TAGS2GO_CONTACT_CONVERSION = 'AW-18264347578/wvWLCKfdxMQcELqnj4VE';

function tags2go_google_ads_global_tag(): void
{
    ?>
    <script async src="https://www.googletagmanager.com/gtag/js?id=<?php echo esc_attr(TAGS2GO_GOOGLE_ADS_ID); ?>"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
        window.gtag('js', new Date());
        window.gtag('config', '<?php echo esc_js(TAGS2GO_GOOGLE_ADS_ID); ?>');
    </script>
    <?php
}
add_action('wp_head', 'tags2go_google_ads_global_tag', 1);

function tags2go_elementor_contact_conversion(): void
{
    ?>
    <script>
        (function ($) {
            if (!$) return;

            $(document).on('submit_success', function (event) {
                var form = event && event.target;

                if (form && form.dataset && form.dataset.tags2goConversionTracked === 'true') {
                    return;
                }

                if (form && form.dataset) {
                    form.dataset.tags2goConversionTracked = 'true';
                }

                if (typeof window.gtag === 'function') {
                    window.gtag('event', 'conversion', {
                        send_to: '<?php echo esc_js(TAGS2GO_CONTACT_CONVERSION); ?>'
                    });
                }
            });
        })(window.jQuery);
    </script>
    <?php
}
add_action('wp_footer', 'tags2go_elementor_contact_conversion', 100);
