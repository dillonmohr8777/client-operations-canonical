# How to attach resume PDFs on job-search mail

Mailbox: `dillonmohr8777@gmail.com`
Never use the IMMOHRTAL signature on this lane.

## Files

| Lane | Local PDF | Source |
|---|---|---|
| Default / growth / demand / leadership | `Dillon-Mohr-Resume-Growth-Marketing-Leadership.pdf` | `growth.b64` in the 1 Sep harvest folder |
| SEO / AEO | `Dillon-Mohr-Resume-Remote-Marketing-SEO-AEO.pdf` | `seo.b64` |
| Web / digital experience | `Dillon-Mohr-Resume-Web-Digital-Experience.pdf` | `web.b64` |
| Latest Drive original | `Dillon_Mohr_Resume.pdf` | Drive `1Ct9IwsOE36DsI3Ire_YKw1O5Pr_mzss9` |

Decode the `.b64` sidecars before attaching. They are gitignored PDFs, not secrets.

```
python -c "from pathlib import Path; import base64; raw=Path('growth.b64').read_text().strip(); raw=raw.split(',',1)[1] if ',' in raw[:80] else raw; Path('Dillon-Mohr-Resume-Growth-Marketing-Leadership.pdf').write_bytes(base64.b64decode(raw))"
```

## Gmail send contract

Use Gmail `send_message` with:

- `to`: one published hiring inbox
- `subject`: `{Role} at {Company} | Dillon Mohr`
- `htmlBody`: note + AI Marketing Director signature
- `attachments`: one object
  - `filename`: exact resume filename
  - `mimeType`: `application/pdf`
  - `content`: raw base64 of the PDF bytes, no `data:application/pdf;base64,` prefix
  - `inline`: false

Keep combined attachments under 25 MB. Prefer the 112 KB growth PDF for ATS uploads. Keep the Drive viewer link in the body as a backup.

Cursor Gmail MCP cannot carry the 112 KB growth PDF. A 736-character tiny PDF attach was receipt-proven. The 20 KB to 33 KB grayscale email/compact variants still fail or truncate in this MCP path. Until that changes, outbound notes stay Drive-link-only and must not claim a file is attached. ATS forms should still upload the original 111,799-byte growth PDF.

## After send

Read the sent message back. Confirm `SENT`, the exact recipient, the exact filename, and `mimeType=application/pdf`. A Drive link alone is not an attachment.
