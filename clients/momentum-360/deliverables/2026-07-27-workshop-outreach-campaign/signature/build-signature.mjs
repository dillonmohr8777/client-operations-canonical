import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const here = path.dirname(fileURLToPath(import.meta.url));
const logoPath = path.resolve(here, "../assets/momentum-360-logo.png");
const outputPath = path.resolve(here, "../assets/dillon-momentum-signature.jpg");

const width = 1280;
const height = 453;

const textLayer = Buffer.from(`
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#ffffff"/>
  <rect x="358" y="70" width="7" height="313" rx="3.5" fill="#f2b84b"/>
  <text x="414" y="135" font-family="Arial, Helvetica, sans-serif" font-size="54" font-weight="700" fill="#075ca8">Dillon Mohr</text>
  <text x="414" y="199" font-family="Arial, Helvetica, sans-serif" font-size="31" font-weight="700" fill="#14314f">AI Marketing Director</text>
  <text x="746" y="199" font-family="Arial, Helvetica, sans-serif" font-size="31" font-weight="700" fill="#f2b84b">|</text>
  <text x="772" y="199" font-family="Arial, Helvetica, sans-serif" font-size="31" font-weight="700" fill="#14314f">Account Manager</text>
  <text x="414" y="263" font-family="Arial, Helvetica, sans-serif" font-size="27" fill="#526679">814.873.5333</text>
  <circle cx="644" cy="254" r="4" fill="#f2b84b"/>
  <text x="670" y="263" font-family="Arial, Helvetica, sans-serif" font-size="27" font-weight="700" fill="#075ca8">needmomentum.com</text>
  <text x="414" y="324" font-family="Arial, Helvetica, sans-serif" font-size="25" font-weight="700" fill="#075ca8">MOMENTUM 360</text>
  <text x="620" y="324" font-family="Arial, Helvetica, sans-serif" font-size="25" fill="#728294">Philadelphia</text>
  <rect x="414" y="355" width="560" height="3" rx="1.5" fill="#dce5ec"/>
</svg>
`);

const logo = await sharp(logoPath)
  .resize(256, 256, { fit: "contain" })
  .png()
  .toBuffer();

await sharp({
  create: {
    width,
    height,
    channels: 3,
    background: "#ffffff",
  },
})
  .composite([
    { input: textLayer, left: 0, top: 0 },
    { input: logo, left: 62, top: 98 },
  ])
  .jpeg({ quality: 92, chromaSubsampling: "4:4:4" })
  .toFile(outputPath);

console.log(outputPath);
