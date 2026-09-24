# NeedMomentum backend baseline — 2026-09-23
Scope: authenticated WordPress UI reads only. No configuration, content, membership, message, plugin, or security changes. This is an initial backend audit, not a complete hosting/database/traffic investigation.

| Finding | Observed evidence | Proposed staged response |
|---|---|---|
| Lead funnel gap | Published page 5894 saved body has no form/shortcode; footer CF7 6776 has four fields, internal recipients only, requester autoresponder off | Complete six-field audit flow, durable lead receipt, report QA and delivery test before replacing old embed |
| Maintenance debt | 40 installed plugins, 39 active; Elementor 4.3.0 + Pro 4.2.2; WPBakery 6.7.0 with update offered; multiple Elementor/WPBakery add-on suites | Build page-to-plugin dependency map; test compatible updates in staging; remove only proven unused components after approval |
| Update blocks | Thrive Quiz Builder connection lost; Ultimate WPBakery Addons license required; Slider Revolution Cluster and Transitionpack registration notices | Verify licenses/owners; stage compatibility matrix; no auto-purchases or bulk updates |
| Health failures | Site Health: 2 critical issues (core and theme updates), 5 recommendations | Backup and restore proof first; staged core/theme/plugin compatibility checks |
| Scheduled job late | action_scheduler_run_queue_rucss | Determine queue age/owner and whether obsolete inactive-plugin queue; do not blindly purge/replay |
| Server caching | Site Health reports OPcache absent and persistent object cache absent; Memcached appears supported; WP Rocket inactive, Asset CleanUp active | Verify hosting cache configuration; benchmark representative pages before changing caching |
| Firewall state | Wordfence Firewall explicitly says Learning Mode Enabled; WAF/rules currently learning; community feed, paid IP list unavailable | Inspect learning expiry, host WAF, recent changes and legitimate flows; propose tested hardening. No hack or compromise established |
| Reporting to reuse | Custom Needmomentum Weekly Report v1.0.0 active; Monday09 site time enabled; last automatic run label Sep21, next Sep28;13 updates pending; GA4 and WhatConverts configured | Reuse existing integrations and reconcile native delivery receipt. Do not create a duplicate weekly email |
| Lead storage | CF7 Google Sheets mapping populated and connected; CFDB7 active | Verify approved synthetic submission reaches correct record, no duplicate sends, ownership and retention |
| Attribution identity | GTM4WP settings contain GTM-57PVS88; existing weekly report has GA4 property318849928 and WhatConverts profile150674 | Verify ownership and native conversion readbacks before modifying tags |
| Email DNS | Public DNS has one observed SPF policy referencing Google and dnssmarthost; DMARC is p=none at 100% with aggregate/forensic destinations configured | Review alignment and authorized senders before proposing enforcement; this is monitoring policy, not proof of email delivery failure. DKIM not assessed |

Source screens: `/wp-admin/plugins.php`, `/wp-admin/site-health.php`, `/wp-admin/admin.php?page=WordfenceWAF`, `/wp-admin/options-general.php?page=nmwr-settings`, page5894 editor and CF7 form6776 editor. Credentials, source keys and visitor/login IPs omitted.

Still unverified: hosting backups/restore, staging host, server logs/PHP config, actual WAF enforcement outside Wordfence, complete page/plugin dependencies, GSC rank/index trend, Core Web Vitals field data, SMTP delivery/bounce logs, CRM ownership, DNS authentication, malware scans, live release/rollback path.
