# Impeccable detector evidence

Command:

```powershell
node C:\Users\dillo\.agents\skills\impeccable\scripts\detect.mjs --json site-v2/index.html site-v2/styles.css site-v2/script.js
```

Result: exit code `1`. The detector emitted warnings/advisories only: overused-font notices for the intentional local Space Grotesk/Anton pairing, plus documented-system ramp/color notices inherited from the isolated v2 surface. No blocking error-severity finding was emitted. The intentional typography exception and private-review scope are recorded in `BUILD-REPORT-v2.md`.
