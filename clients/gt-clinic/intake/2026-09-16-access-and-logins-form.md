# GT Clinic — Access & Logins Questionnaire

Client: `gt-clinic` (GT Aesthetic & Functional Medicine)
Respondent: Ghazala Farooqui, MD. Business name confirmed on the form as "GT Aesthetic & Functional Medicine".
Form due date: 2026-09-16. Posted to `#gt-clinic` (`C0C0RR57B25`) by mac 2026-09-16 with an `@channel`.
Source: 17hats questionnaire `yf092xj-m91W`.
Exported to this repo: 2026-09-21.

> **This form contains live credentials. They are deliberately not reproduced here.**
> This file records *what access exists and where the secret lives*, nothing more. To use any of it,
> open the source questionnaire under an authorised session, or map it into Bitwarden / the access
> broker first. Never paste a value from that form into this repository, a ticket, a Slack message or
> a prompt.

The form's standing text tells the client Momentum will not share the information outside the
organisation, gives `hi@needmomentum.com` and (215) 876-2954 as fallbacks, and offers to collect access
on the onboarding call instead. The client answered **yes** to sharing the information with Momentum for
the purpose of the marketing contract.

---

## What the client said she was providing

She ticked four categories: **Website Login or Access**, **Google My Business**, **Google Ads**,
**Google Analytics**.

## Access map

| Account | What the form says | Where the secret lives | State |
|---|---|---|---|
| Google Analytics | "Already added Dillon" | n/a — delegated access, no shared secret | **Granted by delegation.** Property ID still unrecorded |
| Google Ads | "Already Added Dillon" | n/a — delegated access, no shared secret | **Granted by delegation.** Customer ID still unrecorded |
| Google Business Profile | "Already added Dillon" | n/a — delegated access, no shared secret | **Granted by delegation.** This is the written receipt |
| WordPress admin | Login URL `https://thegtclinic.com/wp-admin` plus a username and password typed into the form | 17hats questionnaire `yf092xj-m91W`, "Website Access" field | Supplied. Not yet mapped to Bitwarden |
| SiteGround hosting | An account email and password typed into the form. The account is under a personal `gmail.com` address for Dr. Farooqui — **not** the `gtfarooqui@yahoo.com` kickoff contact on file | 17hats questionnaire `yf092xj-m91W`, "Other Accounts, Logins, or Questions?" field | Supplied. Not yet mapped to Bitwarden |
| Social media logins | Left blank; the form offered to defer to onboarding | — | Not provided |
| Facebook Ads Manager ID | Left blank; the form offered to defer to onboarding | — | Not provided |
| Google Search Console | **Not on the form at all.** Never requested, never offered | — | **Genuinely outstanding** |
| Domain / DNS registrar | **Not on the form at all** | — | **Genuinely outstanding** |

---

## What this changes in the record

Findings only. No client contact, credential use, publication or spend is authorised by this file.

1. **The Google Business Profile owner grant now has a durable written receipt.** The client wrote
   "Already added Dillon" on a dated form she filled out herself. Open item 3 is closed. No session should
   ask for GBP access again.
2. **Google Ads and Google Analytics access were also already granted,** by the same route, on the same
   form. The record previously carried Ads as "account existence unresolved, no access". Both of those were
   wrong as of 2026-09-16. Combined with the intake form — where the client says she has been running her
   own Google ad since 05/2026 — there is a live Ads account with four months of history that Dillon can
   already open.
3. **The drafted access request email of 2026-09-18 must not be sent as written.** It asks for SiteGround
   and WordPress admin as "the one that is actually blocking us", and offers to create Analytics "if it is
   not set up yet". All three were supplied on this form two days earlier. Sending it would re-ask for
   things the client already gave — the exact failure mode the client record warns damages trust here.
   Rewrite it down to what is genuinely missing: **Search Console owner access, and domain / DNS registrar
   access.** Both are real asks; neither has ever been requested.
4. **The real blocker was never the client.** Hosting and WordPress credentials have been sitting in this
   questionnaire since 2026-09-16. What is missing is the mapping step into Bitwarden or the access broker
   so a session can use them without a human pasting a secret. That mapping is an internal task, not a
   client ask, and it unfreezes the entire technical workstream including the SiteGround anti-bot condition.
5. **The SiteGround account owner address differs from the kickoff contact on file.** Hosting-related
   correspondence sent to the `yahoo.com` address may not reach the mailbox tied to the hosting account.
   Worth knowing before any hosting change, DNS change or password reset is attempted.
6. Nothing in this form grants permission to log in, change a setting, or touch the live site. Credential
   use is a separate action under the normal approval rules.
