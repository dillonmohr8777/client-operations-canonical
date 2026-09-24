# Netlify Deployment

## Production

• Site: `align-hcm-competitor-intel-20260701`

• Site ID: `4ce73b68-25c2-4b5a-8536-0765a912cb5a`

• Production URL: `https://align-hcm-competitor-intel-20260701.netlify.app`

• Production deploy ID: `6a66bb6b38fa3d3e6fa2968b`

• Immutable deploy URL: `https://6a66bb6b38fa3d3e6fa2968b--align-hcm-competitor-intel-20260701.netlify.app`

• Netlify admin: `https://app.netlify.com/projects/align-hcm-competitor-intel-20260701`

## Publish directory

`dist\`

The directory contains only `index.html` and `_headers`. Research files, n8n workflow files, screenshots, source data, and build scripts are not published.

## Rebuild and deploy

```powershell
node .\scripts\build-dashboard.mjs
netlify deploy --prod --dir .\dist --site 4ce73b68-25c2-4b5a-8536-0765a912cb5a
```

## Verification

The production deployment returned HTTP 200 with the expected title, one embedded chart payload, two chart hosts, two rendered charts, four platform filters, nine official source links, no document overflow, and no browser console errors or warnings.

