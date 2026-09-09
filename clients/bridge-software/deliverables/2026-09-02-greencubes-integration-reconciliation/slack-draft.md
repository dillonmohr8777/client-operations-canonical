# Slack reply to Miraj — DRAFT, NOT SENT

**Channel:** #bridge-software-development (C0BGWRK03B2)
**Reply to:** Miraj's 2026-09-02 dev update
**Status: IN DILLON'S SLACK DRAFTS, NOT YET POSTED (2026-09-02 22:15 EDT).** Dillon approved sending; the connector cannot post to this Slack Connect channel, so the exact body below was saved as an attached draft on #bridge-software-development for Dillon to click Send.
**Body length:** 191 words.

---

Thanks Miraj, real progress. I reviewed PR #13 and probed the API directly. Server-side RBAC
holds up — admin routes reject missing and forged tokens, CORS is exactly our three origins,
headers are right. That was the main ask from the 31st.

Three things before I can merge to development.

1. The repo pointer in CLAUDE.md, CLAUDE_BUILD_SPEC.md and CLAUDE_SESSION_PROMPT.md was
switched to getonthebridge0-max/thebridge. That repo 404s to my admin token. Please revert
those four lines — canonical stays dillonmohr8777/bridge-software-frontend.

2. test:phase3 fails because credentials: "include" was commented out, and the API is missing
Access-Control-Allow-Credentials: true. Add that header and we keep cookie sessions, which
fixes the test and gets tokens out of browser storage. If you'd rather stay on bearer, tell me
and I'll record it — but the refresh token can't sit in sessionStorage either way.

3. /join lost Step 1. The role cards are still in product approval with Melissa and Tori and
that's where we capture role. Restore it; the signup form is good, it just needs its own screen.

Still waiting on backend repo/branch/commit, the route table, token TTL and refresh policy, the
remaining session claims (ageEligible first), and the evidence-upload design.

Still on for Thursday.
