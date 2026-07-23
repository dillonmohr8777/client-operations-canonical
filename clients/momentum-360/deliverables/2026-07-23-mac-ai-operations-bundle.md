# Mac AI Operations Bundle

Date: 2026-07-23
Client: Momentum 360
Owner: Dillon Mohr
Requester: Mac
Status: Built, safety-gated, and ready for account handoff

## Outcome

Mac's four requested outcomes now have concrete operating artifacts:

1. A 32-prospect Google Sheet is ready for QR and direct-mail automation.
2. A two-step Google Sheets to QRTIGER Zap exists as an unpublished draft.
3. A two-step Google Sheets to PostGrid Zap exists as an unpublished draft.
4. Slackbot AI was verified live inside the Momentum Digital Agency Slack workspace.
5. A narrated AI-in-Slack walkthrough and reusable recording script are ready.

No mail was submitted, no Zap was published, no spend was incurred, and no new vendor account was created.

## Campaign control sheet

[Open the Google Sheet](https://docs.google.com/spreadsheets/d/1Zc_THSYHKDbv_eDcbUpUnW7OtED-hRTjwqcpqHvyT10/edit)

Source lineage:

- 32 Philadelphia prospect records
- Tracked URLs and attribution parameters preserved
- Normalized public business mailing addresses preserved
- Existing QR files preserved

Operational controls added:

- `qr_status`
- `qr_url`
- `qr_generated_at`
- `address_status`
- `direct_mail_ready`
- `suppression_reason`
- `mail_provider`
- `mail_template_id`
- `approval_status`
- `mail_job_id`
- `mail_status`
- `last_automation_at`
- `automation_error`
- `owner`
- `notes`

All 32 existing rows are marked `existing_verified_asset` for QR status. Every row remains `direct_mail_ready = FALSE`, `approval_status = pending_owner_approval`, and `mail_status = not_sent`.

## QR Zap draft

[Open the QRTIGER Zap draft](https://zapier.com/webintent/edit-zap/373745040)

Name: `M360 - Sheets to QRTIGER QR - Draft`

Structure:

1. Google Sheets: New or Updated Spreadsheet Row
2. QRTIGER QR Code: Create Static QR Code from `tracked_url`

Current state:

- Saved in Dillon Mohr's Personal Zapier workspace
- Unpublished
- Off
- No test run performed
- QRTIGER connection incomplete; the login is staged at Google's account chooser

Activation gate:

- QRTIGER account email
- QRTIGER API key from the vendor's account settings
- One controlled test row
- Verified QR output

The Zapier Free plan supports this exact two-step workflow. Writing the generated QR URL back into the same row would require a third step and therefore a Zapier plan upgrade or a separate automation design.

## Direct-mail Zap draft

[Open the PostGrid Zap draft](https://zapier.com/webintent/edit-zap/373745971)

Name: `M360 - Sheets Ready to PostGrid Mail - Draft OFF`

Structure:

1. Google Sheets: New or Updated Spreadsheet Row watching `direct_mail_ready`
2. PostGrid Print & Mail: Create Postcard

Current state:

- Saved in Dillon Mohr's Personal Zapier workspace
- Unpublished
- Off
- No test mail submitted
- PostGrid connection incomplete

Activation gates:

- Approved PostGrid account
- PostGrid API key
- Verified sender identity and return address
- Approved postcard template
- Approved budget and test quantity
- Provider address validation
- One explicitly approved test recipient

## Slack AI verification

Workspace: Momentum Digital Agency

Verified behavior:

- The `Chat with Slackbot AI` control is present in the Slack top bar.
- Slackbot reports that it is set up with the user's permitted channel and document context.
- A controlled test prompt returned the exact expected response: `Slack AI is working.`

How to open it:

- Click `Chat with Slackbot AI` in Slack's top bar.
- Keyboard shortcut on Windows: `Ctrl + Shift + O`.

Slackbot is personal to each user and follows that user's Slack permissions. Reviewed answers can be forwarded into a channel for team use.

The separate official ChatGPT app for Slack was not installed because the OpenAI sign-in reached an MFA identity-verification gate. That installation is optional because Slackbot AI is already functioning.

## Training deliverables

[Narrated 1080p walkthrough](./2026-07-23-mac-ai-in-slack-5-minute-walkthrough.mp4)

[Five-minute recording script](./2026-07-23-mac-ai-in-slack-5-minute-walkthrough.md)

[InVideo generation plan](https://ai.invideo.io/workspace/7b9f42f3-d7ae-4e6b-863b-8c6775d89ae8/v40-copilot/b5dbef7d-f90a-46f8-936b-68a260b17989)

The local walkthrough is 4 minutes 37 seconds, 1920 by 1080, and includes eight focused narrated slides. The InVideo plan remains available as an optional alternate render; InVideo requires the account holder to select `Generate video` in its authenticated widget.

## Safe activation sequence

1. Keep all existing campaign rows suppressed.
2. Connect the approved QRTIGER account.
3. Configure the QR Zap against the campaign sheet.
4. Add one new controlled test row and verify the QR resolves to the tracked URL.
5. Connect the approved PostGrid account.
6. Validate the sender, template, and address.
7. Explicitly approve one test recipient and budget.
8. Run one test postcard.
9. Record provider IDs and outcomes in the campaign sheet.
10. Only then consider enabling a production batch.

## Workshop follow-through

Mac and Sean's production workshop experience was upgraded and deployed at
https://momentum-workshop-pilot.netlify.app. The live Netlify registration form
was verified end to end, consent-first calendar links were verified, and all
synthetic submissions were removed after QA. The audience invitation remains
unsent until the final date, meeting URL, sender, and permissioned audience are
confirmed.
