import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const out = new URL('./refinement-2026-09-04-final/',import.meta.url);
const browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const results=[];
try {
  for (const width of [1280,390,320]) {
    const page=await browser.newPage({viewport:{width,height:844},reducedMotion:'reduce'});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://127.0.0.1:59568/',{waitUntil:'domcontentloaded'});
    await page.locator('[data-loader]').waitFor({state:'hidden'});
    for (const heading of await page.locator('h2').all()) await heading.scrollIntoViewIfNeeded();
    await page.screenshot({path:path.join(fileURLToPath(out), 'full-'+width+'.png'),fullPage:true});
    const checks=await page.evaluate(()=>({
      noOverflow:document.documentElement.scrollWidth<=innerWidth+1,
      imagesLoaded:[...document.images].every(i=>i.complete&&i.naturalWidth>0),
      contactTargets:[...document.querySelectorAll('.jack-founder__contact a')].every(a=>a.getBoundingClientRect().height>=44),
      noForms:document.forms.length===0,
      noindex:!!document.querySelector('meta[name="robots"]')?.content.includes('noindex'),
      labelFloor:parseFloat(getComputedStyle(document.querySelector('.site-nav__action')).fontSize)>=12
    }));
    results.push({width,checks,errors,pass:errors.length===0&&Object.values(checks).every(Boolean)});
    await page.close();
  }
}finally{await browser.close()}
const report={generatedAt:new Date().toISOString(),results,pass:results.every(x=>x.pass)};
await fs.writeFile(new URL('whole-page-report.json',out),JSON.stringify(report,null,2));
console.log(JSON.stringify(report));
