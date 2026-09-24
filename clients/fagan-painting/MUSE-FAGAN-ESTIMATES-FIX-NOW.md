Muse: CEO assigned Fagan estimates form fix 2026-09-17. Full brief:
C:\Users\dillo\Documents\Codex\projects\muse-asset-hub\PROMPT-MUSE-HUBSPOT-TOKEN-AND-FAGAN-FIX-2026-09-17.md
Live bug: https://faganpainting.com/estimates/ (Chrome black form / captcha broken). No Mac Slack. Write finish to muse-asset-hub\FAGAN-ESTIMATES-FORM-FIX-FINISH.md

STATUS 2026-09-17 ~10:05 PM ET (Muse): ROOT CAUSE PROVEN + FIX STAGED. Whole site behind
SiteGround Robot Challenge (HTTP 202 SG-Captcha); PoW complexity-21/10s-timeout routinely fails
and dumps visitors on broken BotDetect fallback captcha. Gravity Form id 5 itself is intact
(real 702KB page fetched after passing challenge). Durable fix = disable/tune bot protection
in SiteGround Site Tools (preferred) or WP-admin SG Security — needs hosting login Phil/Dillon
hold; Bitwarden locked, no creds on disk. Exact click path + curl re-check in the finish MD.

STATUS 2026-09-18 ~1:20 PM ET (Codex): LIVE BLOCKER RECONFIRMED. Normal desktop, mobile,
Googlebot, Bingbot, and curl user agents all received HTTP 202 plus `SG-Captcha: challenge`.
The existing WordPress admin session is valid, but Security Optimizer exposes only WordPress
hardening controls; it does not expose the hosting-layer Robot Challenge. SiteGround Client
Area is logged out. Bitwarden may be used by autofill only; never reveal or copy a secret.
Prefer a narrow `/estimates/` exception or verified bot/human allowlist. If SiteGround offers
only a sitewide disable, stop for Dillon approval before reducing protection globally. Success
still requires a fresh unauthenticated HTTP 200 with no `SG-Captcha` header and a visual form
load check; do not submit a real lead without separate approval.
