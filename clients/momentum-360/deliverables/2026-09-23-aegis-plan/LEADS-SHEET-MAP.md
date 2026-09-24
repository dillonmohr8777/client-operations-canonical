# NeedMomentum audit intake: existing Leads Sheet route (2026-09-23)

**State:** read-only source map. No audit lead was submitted, no Sheet or Zap was changed, and no CRM/email delivery was verified. This is the NeedMomentum / Momentum Digital route, not Momentum 360's HubSpot route.

## Exact workbook and tab evidence

- [Mac's Leads Sheet link](https://momentum3d.slack.com/archives/C1CFQBC79/p1752674398549719) points to [Momentum-Website-Leads](https://docs.google.com/spreadsheets/d/1ZmKXwD-uV_WJdBNOQWriQLCF0_6ZuHxohRExUS_oiVE/edit?gid=0#gid=0), spreadsheet ID `1ZmKXwD-uV_WJdBNOQWriQLCF0_6ZuHxohRExUS_oiVE`. Google Sheets metadata read on September 23 confirms that workbook title.
- The linked `gid=0` tab is **MySiteAuditor - SEO Opt in**, with headers: `Time & Date`, `your-name`, `phone`, `your-email`, `website`. Its Date column returned no values below the header in the bounded read (`A2:A1128`); that alone does not prove the entire tab empty.
- The same workbook has **MySiteAudit - New 2025** (`gid=446030942`), with headers: `Date`, `Name`, `Email`, `Website Link`, `Keyword`, `Other/Notes and ID Number`, `Form Url`. Its Date column contains 79 values below the header, last at row 80 on `2026-09-23 15:31:15`. This proves recent data in that tab, not what created the row or that a new audit submission would route there.
- Other existing tabs: `freemarketingaudit` (`gid=494603`: `your-name`, `phone-number`, `your-email`, `Business-Name`, `website`, `TypeofMarketingAudit`); `generalcontactform` (`gid=240902742`: `your-name`, `your-email`, `phone-number`, `your-business`, `your-message`); `Old Leads` (`gid=986543814`). Only headers and Date column observations were used; no lead row details were copied.
- [Melissa's September 21 mention](https://momentum3d.slack.com/archives/C1CFQBC79/p1790023775827529) says a lead sheet has sources and sales notes for reporting but contains no Sheet URL in the message. It is not proof that her reporting sheet is this workbook.

## Proposed audit fields against existing headers

| [Mac's six requested fields](https://momentum3d.slack.com/archives/C1CFQBC79/p1790181113356099) | Linked `gid=0` tab | Recent `MySiteAudit - New 2025` tab |
|---|---|---|
| Name | `your-name` | `Name` |
| Phone | `phone` | No phone header |
| Email | `your-email` | `Email` |
| Website | `website` | `Website Link` |
| Brief business description | No dedicated header | No dedicated header |
| Goals | No dedicated header | No dedicated header |

Neither tab has dedicated columns for audit job/report ID, delivery state, or source consent. A single exact destination tab and additive column plan remain necessary before writing real submissions; an existing Zap may depend on today's header names and positions.

## Zapier, CRM, email, and recipients

- [Mac's September 23 answer](https://momentum3d.slack.com/archives/C1CFQBC79/p1790201627631859): the audit **can** save to the Leads Sheet, then Zapier **can** send to CRM and email. This is approval of a direction, not a Zap ID, field mapping, enabled-state readback, or delivery receipt.
- [January 9](https://momentum3d.slack.com/archives/C1CFQBC79/p1767986105663619): Mac said ordinary contact forms reached Sheet, Zapier, and Slack, while his email did not receive them. [March 25](https://momentum3d.slack.com/archives/C1CFQBC79/p1774470069000759): Mac said website leads no longer seemed to create 17hats leads; [Obaid's test](https://momentum3d.slack.com/archives/C1CFQBC79/p1774470828093699) confirmed a contact-form row in Sheets, then asked whether Zapier connected Sheets to 17hats. [Mac's follow-up](https://momentum3d.slack.com/archives/C1CFQBC79/p1774470907461699) said he received the website form but it reached neither 17hats nor Slack. These are historical failures, not proof of current failure or recovery.
- The historical CRM candidate is **17hats**. Mac's September 23 wording only says “CRM”; no current audit-specific Zap ID, trigger tab, field map, enabled-state, run history, CRM object, mail provider, or test receipt was found in the narrow accessible Slack/Gmail search. No Zapier connector was available for a direct status read.
- [Mac's audit request](https://momentum3d.slack.com/archives/C1CFQBC79/p1790181113356099) says send the completed report to the lead and CC **Mac** (`U06JZRN11`) and **Jesse DiLaura** (`U0BEKTY2CQL`). Their Slack profile addresses are `mjfrederick334@gmail.com` and `jessedilaura27@gmail.com`, respectively; those are candidate identities, not a verified sending list or outbound provider configuration. The lead address would come from the submitted email field.

## Next integration proof

Read the exact audit destination tab choice and its Zap trigger/field mapping in the authenticated Zapier account, including any 17hats and mail actions. Add the missing six-field columns without breaking existing triggers, then run a **synthetic** staged submission and inspect its Sheet row, Zap task history, CRM object, and email provider receipt/readback. Keep real sends and CRM writes behind the existing action-specific approval gate.

## September24 access and mapping recovery (supersedes missing-Zap-ID statement)
- Exact existing audit Zap recovered: https://zapier.com/editor/123578416/published. Mac supplied it in https://momentum3d.slack.com/archives/C1CFQBC79/p1752674301333789 (July16,2025).
- July22 follow-up confirms the integration used the new tab gid446030942: https://momentum3d.slack.com/archives/C1CFQBC79/p1753191215676839, with confirmation in p1753192971960369. This is historical routing evidence, not a current Zap configuration readback.
- September24 metadata + bounded A1:Z1 read reconfirmed exact existing tab MySiteAudit - New 2025, gid446030942, 1079x26 grid; headers A:G remain Date, Name, Email, Website Link, Keyword, Other/Notes and ID Number, Form Url. No lead row data read or written.
- Hidden IAB opened that exact Zap and reached login. Existing Team Momentum Google session (momentumlocalseo@gmail.com) succeeded at Google re-sign-in, then Zapier required the existing Zapier password to finish. No password guess/reset, account creation, permission expansion, Zap test or action enabled.
- Scoped Slack/Gmail/access-file checks did not supply a verified Zapier credential. Required account detail: existing Zapier sign-in for that account, or an already authenticated session authorized for Zap123578416. No Mac message sent.
- Preserve A:G and avoid overloading Keyword with goals. Proposed additional fields after verified Zap review: Phone, Business Description, Goals, Audit Submission ID, Report URL, Delivery State, Analysis Consent, Submitted Source. These remain a proposal until the actual Zap mapping and safe sandbox destination are inspected.
