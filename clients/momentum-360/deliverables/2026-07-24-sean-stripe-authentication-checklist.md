# Sean handoff: Stripe activation for the Jeanne Walcroft Legacy Foundation

## What is needed

The donation page and Stripe Checkout integration are already built. The remaining blocker is activating a dedicated Stripe account for the Jeanne Walcroft Legacy Foundation.

Sean, please complete the account setup with an authorized Foundation representative. Stripe requires the organization or its authorized representative to enter and verify this information directly. Do not send identity documents, tax IDs, bank details, passwords, verification codes, or API keys to Dillon in Slack or email.

## Before starting

Have the following available:

- The Foundation's exact legal name as shown on its IRS and state records
- Entity type and tax identification information
- Registered business address and primary phone number
- Public website: https://jeanne-walcroft-legacy-foundation.netlify.app
- A plain-language description of the Foundation's activities and how donations will be used
- An authorized account representative who can accept Stripe's terms
- The representative's identity information and a current government-issued ID if Stripe requests it
- Details for any owners, directors, or executives Stripe asks the organization to identify
- The Foundation bank account that should receive payouts
- A bank statement, voided check, or bank letter if Stripe asks for account-ownership proof
- A customer-facing support email and phone number
- A recognizable card-statement descriptor, using the Foundation's name or a clear abbreviation

## Complete the Stripe account

1. Create or sign in to the Stripe account that belongs only to the Jeanne Walcroft Legacy Foundation. Do not use the existing Cactus Practice account or another unrelated business.
2. In Stripe, choose **Activate payments** and complete every item under **Business details**.
3. Enter the Foundation's legal and tax information exactly as it appears on official records.
4. Add the authorized account representative and complete any identity verification Stripe requests.
5. Add the Foundation bank account for payouts and complete any bank-ownership verification.
6. Review the public business information, support contact, statement descriptor, payout schedule, and donation-purpose description.
7. Enable two-step authentication. Give additional people access through Stripe's team roles instead of sharing one login.
8. Return to the Stripe Dashboard and clear every remaining verification alert or requested-information item.
9. Confirm that live payments and payouts are enabled. If Stripe shows a restriction or asks for another document, complete that request before handing the account back.

## Stop point for Sean

Once Stripe shows that the Foundation can accept live payments and receive payouts, Sean's authentication work is complete. Send Dillon a simple confirmation that the account is active. Do not send credentials, verification codes, identity documents, bank information, API keys, or webhook secrets.

The technical team will separately create the least-privilege production key, register the donation webhook, add protected Netlify environment variables, redeploy, and run the live donation test.

## Official Stripe guidance

- Create and activate a Stripe account: https://docs.stripe.com/get-started/account
- Stripe account go-live checklist: https://docs.stripe.com/get-started/account/checklist
- Bank account ownership verification: https://support.stripe.com/questions/verify-your-bank-account-ownership
- Stripe team and security guidance: https://docs.stripe.com/get-started/account/checklist

## Existing technical destination

- Donation site: https://jeanne-walcroft-legacy-foundation.netlify.app
- Webhook endpoint for the technical team: https://jeanne-walcroft-legacy-foundation.netlify.app/.netlify/functions/api?route=stripe-webhook

