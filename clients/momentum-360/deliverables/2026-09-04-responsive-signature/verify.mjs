import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire('C:/Users/dillo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/runtime.cjs');
const { chromium } = require('playwright');
const html = await fs.readFile(path.join(dir, 'signature.html'), 'utf8');
const files = new Map([['/preview.html', ['text/html', 'preview.html']], ['/assets/momentum-360-logo.png', ['image/png', 'assets/momentum-360-logo.png']]]);
const server = http.createServer(async (req,res) => {
  const f = files.get(req.url);
  if(!f){res.writeHead(404);res.end();return;}
  res.writeHead(200,{'content-type':f[0]});res.end(await fs.readFile(path.join(dir, f[1])));
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser = await chromium.launch({channel:'chrome',headless:true});
const result = {verifiedAt:new Date().toISOString(),scope:'Local Chromium rendering only. No Gmail, Outlook, Apple Mail, send, or setting changes.', checks:[], views:[], limitations:['Mailbox paste and real email-client rendering not tested.','No GIF was created or hosted.','Forced email dark mode is client-controlled and not certified.']};
function check(name, pass, details){result.checks.push({name,pass,details});}
const errors=[];
try {
  check('No external CSS, scripts, media queries, flex, grid, data URLs or cross-brand marker',!/<script|<style|<link|@media|display\s*:\s*(flex|grid)|data:|immohrtal/i.test(html));
  check('Exact approved phone',html.includes('href="tel:+18148735333"'));
  check('Exact website',html.includes('href="https://www.needmomentum.com/"'));
  const localLogo = await fs.readFile(path.join(dir,'assets/momentum-360-logo.png'));
  const oldLogo = await fs.readFile(path.resolve(dir,'../2026-07-27-workshop-outreach-campaign/assets/momentum-360-logo.png'));
  check('Brand logo bytes preserved',localLogo.equals(oldLogo),{sha256:crypto.createHash('sha256').update(localLogo).digest('hex')});
  const sourceUrl=html.match(/src="([^"]+)"/)[1];
  try {const response=await fetch(sourceUrl);const remote=Buffer.from(await response.arrayBuffer());check('Existing hosted logo HTTP 200 and byte match',response.ok && remote.equals(localLogo),{status:response.status,url:sourceUrl});}catch(e){check('Existing hosted logo HTTP 200 and byte match',false,{error:e.message});}
  for(const width of [820,320]) {
    const context=await browser.newContext({viewport:{width,height:720},reducedMotion:'reduce'});
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/preview.html`,{waitUntil:'networkidle'});
    const metrics=await page.evaluate(()=>({viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,signatureWidth:document.querySelector('#signature table').getBoundingClientRect().width,logoLoaded:document.querySelector('img').naturalWidth>0,anchors:[...document.querySelectorAll('#signature a')].map(a=>({text:a.textContent,href:a.getAttribute('href'),width:a.getBoundingClientRect().width,height:a.getBoundingClientRect().height}))}));
    check(`No horizontal overflow at ${width}px`,metrics.scrollWidth<=width,metrics);
    check(`Contact targets at least 44px high at ${width}px`,metrics.anchors.every(a=>a.height>=44));
    await page.keyboard.press('Tab');
    const focus=await page.evaluate(()=>({href:document.activeElement.getAttribute('href'),outline:getComputedStyle(document.activeElement).outlineStyle}));
    check(`Keyboard reaches phone with focus at ${width}px`,focus.href==='tel:+18148735333'&&focus.outline!=='none',focus);
    await page.screenshot({path:path.join(dir,`preview-${width}.png`),fullPage:true});
    await page.route('**/assets/momentum-360-logo.png*',r=>r.abort());
    await page.reload({waitUntil:'networkidle'});
    const fallback=await page.locator('#signature').innerText();
    check(`Images-blocked essential content at ${width}px`,['Dillon Mohr','AI Marketing Director','Account Manager','814.873.5333','needmomentum.com','Momentum 360','Philadelphia'].every(t=>fallback.includes(t)));
    if(width===320)await page.screenshot({path:path.join(dir,'preview-320-images-blocked.png'),fullPage:true});
    result.views.push({width,metrics,imagesBlockedEssentialText:true,reducedMotion:'reduce'});
    await context.close();
  }
  function lum(hex){const v=hex.match(/\w\w/g).map(c=>parseInt(c,16)/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4);return .2126*v[0]+.7152*v[1]+.0722*v[2];}
  for(const color of ['075ca8','14314f','526679']){const ratio=1.05/(lum(color)+.05);check(`Text contrast #${color} on white`,ratio>=4.5,{ratio:+ratio.toFixed(2)});}
  check('No browser page errors',errors.length===0,errors);
  result.passed=result.checks.every(c=>c.pass);
  await fs.writeFile(path.join(dir,'verification.json'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({passed:result.passed,checks:result.checks.length,failed:result.checks.filter(c=>!c.pass)},null,2));
  if(!result.passed)process.exitCode=1;
}finally{await browser.close();await new Promise(r=>server.close(r));}
