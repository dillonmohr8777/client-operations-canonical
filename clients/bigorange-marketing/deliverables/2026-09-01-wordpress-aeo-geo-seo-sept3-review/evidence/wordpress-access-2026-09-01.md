# WordPress access attempt — 2026-09-01

**Target:** `https://bigorange.marketing/wp-admin/`  
**Credential locator only:** Windows Credential Manager `Codex.ClientAccess.BigOrange.WordPress`  
**Result:** credential present; automated dashboard session not established.

## What was verified

- Credential record exists (non-secret: username length 6, blob present).
- Public origin recovered: homepage, `/wp-json/`, and sitemap index returned HTTP 200 on 2026-09-01.
- Private drafts 5546, 5585, 5550, and 5552 were **not** re-read from authenticated WordPress.

## What failed

1. `Test-BigOrangeWordPressAccess.ps1` stopped because Windows PowerShell is in NonInteractive mode and `Invoke-WebRequest` tried to prompt.
2. Passkey / Wordfence enrollment remains a human gate. This session must not bypass it.

No password, token, cookie, or passkey material was written to this package.

## Authorized next human step

1. Dillon signs in with the existing passkey.
2. Paste `wordpress/5550-must-include-upgraded.html` into private post 5550.
3. Paste `wordpress/5552-five-articles-upgraded.html` into private post 5552.
4. Keep both posts Private. Do not publish. Do not edit public 1381.
5. Read back the two private previews before the September 3 conversation.

See `wordpress/WORDPRESS-INSTALL-NOTES.md`.
