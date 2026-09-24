import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const sourceDirectory = path.join(projectRoot, "orange-press");
const publicOrigin = "https://bigorange-orange-press.netlify.app";
const wordpressMediaOrigin = "https://bigorange.marketing/wp-content/uploads/2026/08";
const wordpressLogoUrl = `${wordpressMediaOrigin}/bigorange-logo-orange.png`;
const wrapperId = "orange-press-wp-20260824";

const [
  documentSource,
  stylesheetSource,
  behaviorSource,
  particlesSource,
  unboundedBuffer,
  manropeBuffer
] = await Promise.all([
  readFile(path.join(sourceDirectory, "index.html"), "utf8"),
  readFile(path.join(sourceDirectory, "styles.css"), "utf8"),
  readFile(path.join(sourceDirectory, "script.js"), "utf8"),
  readFile(path.join(sourceDirectory, "brand-particles.js"), "utf8"),
  readFile(path.join(sourceDirectory, "assets", "fonts", "unbounded.woff2")),
  readFile(path.join(sourceDirectory, "assets", "fonts", "manrope.woff2"))
]);

const criticalAssetUris = {
  "assets/fonts/unbounded.woff2": `data:font/woff2;base64,${unboundedBuffer.toString("base64")}`,
  "assets/fonts/manrope.woff2": `data:font/woff2;base64,${manropeBuffer.toString("base64")}`
};

const inlineAssets = (source, assetPaths) => assetPaths.reduce(
  (result, assetPath) => result.replaceAll(assetPath, criticalAssetUris[assetPath]),
  source
);

const useSameOriginLogo = (source) => source
  .replaceAll("assets/bigorange-logo-orange.png", wordpressLogoUrl)
  .replaceAll("assets/bigorange-logo-particle-8777.png", wordpressLogoUrl);

const bodyMatch = documentSource.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
if (!bodyMatch) throw new Error("Orange Press source is missing a body element.");

const schemaMatch = documentSource.match(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/i);
if (!schemaMatch) throw new Error("Orange Press source is missing its JSON-LD graph.");

const absolutizeAssets = (source) => source
  .replace(/(["'(])assets\/([^"'()]+\.webp)/g, `$1${wordpressMediaOrigin}/$2`)
  .replace(/(["'(])assets\//g, `$1${publicOrigin}/assets/`);

let markup = bodyMatch[1]
  .replace(/\s*<script\s+src="(?:brand-particles|script)\.js"\s+defer><\/script>\s*/gi, "\n")
  .trim();

const ids = [...markup.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
for (const id of ids) {
  const prefixedId = `op-${id}`;
  markup = markup
    .replaceAll(`id="${id}"`, `id="${prefixedId}"`)
    .replaceAll(`href="#${id}"`, `href="#${prefixedId}"`)
    .replaceAll(`aria-controls="${id}"`, `aria-controls="${prefixedId}"`)
    .replaceAll(`aria-labelledby="${id}"`, `aria-labelledby="${prefixedId}"`)
    .replaceAll(`aria-describedby="${id}"`, `aria-describedby="${prefixedId}"`);
}

markup = useSameOriginLogo(markup);

markup = absolutizeAssets(markup)
  .replace('<main id="op-main">', '<div id="op-main">')
  .replace("</main>", "</div>");

const fontFaceMatches = [...stylesheetSource.matchAll(/@font-face\s*\{[\s\S]*?\}\s*/g)];
if (fontFaceMatches.length !== 2) {
  throw new Error(`Expected two Orange Press font-face blocks; found ${fontFaceMatches.length}.`);
}

let fontFaces = fontFaceMatches.map((match) => match[0]).join("\n");
let scopedStyles = stylesheetSource;
for (const match of fontFaceMatches) scopedStyles = scopedStyles.replace(match[0], "");

fontFaces = inlineAssets(fontFaces, [
  "assets/fonts/unbounded.woff2",
  "assets/fonts/manrope.woff2"
]);
fontFaces = absolutizeAssets(fontFaces);

scopedStyles = useSameOriginLogo(scopedStyles);
scopedStyles = absolutizeAssets(scopedStyles)
  .replace(/^(\s*):root\s*\{/gm, "$1:scope {")
  .replace(/^(\s*)html\s*\{/gm, "$1:scope {")
  .replace(/^(\s*)body\s*\{/gm, "$1:scope {")
  .replaceAll(".motion-ready", ":scope.motion-ready")
  .replaceAll("body.menu-open", ":scope.menu-open");

let behavior = behaviorSource
  .replace(
    '  "use strict";\n',
    `  "use strict";\n\n  const root = document.getElementById("${wrapperId}");\n  if (!root || root.dataset.orangePressReady === "true") return;\n  root.dataset.orangePressReady = "true";\n`
  )
  .replaceAll('document.documentElement.classList.add("motion-ready")', 'root.classList.add("motion-ready")')
  .replaceAll("document.body.classList", "root.classList")
  .replaceAll('document.getElementById("menu")', 'root.querySelector("#op-menu")')
  .replaceAll('document.getElementById("particle-logo")', 'root.querySelector("#op-particle-logo")')
  .replaceAll("document.querySelectorAll", "root.querySelectorAll")
  .replaceAll("document.querySelector", "root.querySelector")
  .replaceAll("window.BrandParticles", "window.OrangePressBrandParticles")
  .replace("if (menuButton && menu)", "if (menuButton ? Boolean(menu) : false)")
  .replace('event.key === "Escape" && menu.classList.contains("is-open")', 'event.key === "Escape" ? menu.classList.contains("is-open") : false')
  .replace("snapTargetIndex !== null && !drag", "snapTargetIndex !== null ? !drag : false")
  .replace("isVisible && !wasVisible", "isVisible ? !wasVisible : false")
  .replace('document.visibilityState === "visible" && isVisible', 'document.visibilityState === "visible" ? isVisible : false');

let particles = useSameOriginLogo(particlesSource);
particles = absolutizeAssets(particles).replace(
  "window.BrandParticles = BrandParticles;",
  "window.OrangePressBrandParticles = BrandParticles;"
)
  .replace("this.visible && !this.frame && !this.didResolve", "this.visible ? (!this.frame ? !this.didResolve : false) : false")
  .replace("imageRect?.width && imageRect?.height", "imageRect?.width ? imageRect?.height : false")
  .replace("overall >= 1 && !this.didLock", "overall >= 1 ? !this.didLock : false");

const themeReset = `
body:has(#${wrapperId}) .fl-post-header,
body:has(#${wrapperId}) .entry-header { display: none !important; }
body:has(#${wrapperId}) .fl-content-full.container,
body:has(#${wrapperId}) .site-content,
body:has(#${wrapperId}) .content-area { width: 100% !important; max-width: none !important; padding: 0 !important; }
body:has(#${wrapperId}) .fl-content-full.container > .row { margin: 0 !important; }
body:has(#${wrapperId}) .fl-content.col-md-12,
body:has(#${wrapperId}) .site-main { margin: 0 !important; padding: 0 !important; width: 100% !important; }
body:has(#${wrapperId}) .fl-post,
body:has(#${wrapperId}) .fl-post-content,
body:has(#${wrapperId}) .entry-content { margin: 0 !important; padding: 0 !important; overflow-x: clip; }
body:has(#${wrapperId}) .wp-site-blocks { padding: 0 !important; }
body:has(#${wrapperId}) #wpadminbar { display: none !important; }
html:has(#${wrapperId}) { margin-top: 0 !important; scroll-behavior: smooth; }
#${wrapperId} { min-width: 0; isolation: isolate; }
`;

const output = `<!-- wp:html -->
<style id="orange-press-wordpress-styles">
${fontFaces.trim()}
${themeReset.trim()}
@scope (#${wrapperId}) {
${scopedStyles.trim()}
}
</style>
<div id="${wrapperId}" class="orange-press-wordpress-review">
${markup}
</div>
<script type="application/ld+json">
${schemaMatch[1].trim()}
</script>
<script id="orange-press-particles">
${particles.trim()}
</script>
<script id="orange-press-behavior">
${behavior.trim()}
</script>
<!-- /wp:html -->
`;

const outputPath = path.join(sourceDirectory, "wordpress-draft.html");
await writeFile(outputPath, output, "utf8");

console.log(JSON.stringify({
  outputPath,
  characters: output.length,
  idsPrefixed: ids.length,
  relativeAssetsRemaining: (output.match(/(["'(])assets\//g) || []).length,
  wordpressHtmlBlocks: (output.match(/<!-- wp:html -->/g) || []).length
}, null, 2));
