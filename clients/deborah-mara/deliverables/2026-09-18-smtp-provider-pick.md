# Deborah Mara — SMTP provider pick, 2026-09-18

**Pick: Brevo, free tier.** Decided 2026-09-18 on Dillon's "pick it" instruction.
No account created, no DNS changed, nothing connected. Those steps are external
and need Dillon's click.

## Why Brevo

- Free tier is ongoing: up to 300 transactional emails per day. Lead
  notification volume fits with room to spare.
- Supports authenticated sending domain via SPF, DKIM, and DMARC, which is the
  RUNBOOK requirement: an authenticated sender on a domain that can pass SPF
  and DKIM.
- WP Mail SMTP ships a native Brevo mailer, so connection is a supported
  credential handoff, not a custom integration.
- Rejected: SendLayer free is a 200 email trial, then paid, so it expires under
  us. Gmail SMTP cannot authenticate the site domain and the Momentum Google
  account is itself mid rotation. Server default mail is the current unverified
  state and stays rejected.

## Exact connect card (in order, each with a readback)

1. Create the Brevo account and add the sending domain for authentication.
   Human click. Secrets stay in the vault or dashboard, never in this repo.
   Readback: Brevo shows the domain authenticated.
2. Add the SPF, DKIM, and DMARC records Brevo issues at the DNS holder for the
   sending domain. STAGING sender domain is undecided: prefer a subdomain of
   the staging host's domain if Momentum holds that DNS, else decide the
   production sender domain now. Unknown owner: find who holds azldigital.com
   DNS before this step. Readback: records resolve publicly.
3. In WP Mail SMTP on the exact staging host, select the Brevo mailer, connect
   with the Brevo credential through the supported flow, keep Force From Name
   Deborah Mara | RE/MAX Homeland, and replace the legacy forced sender.
   Readback: settings save and reload showing Brevo active.
4. Send the plugin test email to dillonmohr8777@gmail.com. Readback: received
   in inbox, not spam. Record mailbox and folder.
5. Submit one real form test from a phone on cell data. Readback: arrival in
   both marasurrealestate@gmail.com and dillonmohr8777@gmail.com with the
   source page in the subject. Keep the test submission.
6. Only then continue the RUNBOOK sequence: tappable phone check, measurement,
   schema, publish of pages 101, 103, 105, 107.

## Gates that stay with Dillon

- Brevo account creation (external account change).
- DNS record placement (needs the DNS holder).
- Any sender domain choice that touches soldbymara.com production DNS.
