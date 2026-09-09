# Browser findings — Sep 9 2026 (Fireflies + Eventbrite login request)

Dillon asked Cursor to "spin the in app browser", log in with Google
(`dillonmohr8777@gmail.com`, prompt approval offered), configure Fireflies
and Eventbrite, and draft Andy's answers. Results, honestly:

## What was tried

1. **Playwright MCP** (`browser_navigate`): dead. Returns "Extension
   connection timeout. Make sure the Playwright MCP Bridge extension is
   installed." No extension in Dillon's browser, and installing one is a
   config change needing approval. No in app browser tool exists in Cursor
   sessions (that tool lives inside Codex sessions only).
2. **cua-driver** (background computer use): healthy (`0.22.2`, win32, ok,
   UIA + screen capture pass, session `andy-fireflies-run`). It can launch
   hidden browsers, but a Google login from a fresh hidden profile stops at
   three hard gates: password entry (Cursor has no credential or Bitwarden
   route from its exposed roots), MFA/push approval, and OAuth consent.
   Standing rules require stopping at all three. Attaching to Dillon's
   persistent Chrome profile to reuse his Google session would mean
   reaching into browser profile and auth state outside the exposed roots,
   which is also out of bounds.
3. **Fireflies recap without login** (plain fetch of
   `app.fireflies.ai/view/Deb-Mara-x-Momentum360-Check-In::01M20...`):
   returns only the JS loading shell. Transcript is login walled. No API
   connection exists for Fireflies (Composio: no active connection).
4. **Gmail attachment download** (Andy's `IMG_3093.jpeg`, `IMG_3094.jpeg`):
   native Gmail MCP returns attachment metadata only, no bytes. Composio
   Gmail could download but has no active connection (new OAuth needed).

## What worked without any login

* Search Console live verification + all 10 URL inspections + sitemaps via
  the existing Composio connection (see `verification.json`).
* Full Gmail thread reads (Andy x2, Eventbrite invite, Fireflies notice).
* Andy reply staged as unsent draft (local files + Gmail draft).

## Minimum path to done (Dillon, ~2 minutes, in your own browser)

1. Eventbrite: open the 10:33 AM Gmail invite, hit Get Started (you are
   already logged into Google there, no password needed), accept the org.
2. Fireflies: open the recap link from the 10:32 AM email, copy the
   transcript or summary, paste it back here. No API key needed.
3. Optional, to let Cursor verify Eventbrite directly next time: approve
   the Eventbrite + Fireflies Composio connections (OAuth clicks). Until
   then Cursor verifies via Gmail readback and your pastes.

Nothing was sent, posted, published, or pushed. No credentials touched.
