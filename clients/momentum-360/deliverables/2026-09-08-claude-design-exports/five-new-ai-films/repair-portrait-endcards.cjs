const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {chromium}=require('C:/Users/dillo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=__dirname,hash=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});const results=[];
try{for(const filename of fs.readdirSync(path.join(base,'source')).filter(x=>/^AI 0[1-5] - .*html$/.test(x)).sort()){
 const id='ai'+filename.slice(3,5),page=await browser.newPage({viewport:{width:2048,height:2200},deviceScaleFactor:1});
 await page.route('**/*.dc.html',async route=>{const response=await route.fetch();let body=await response.text();if(!body.includes('this.card.scale.setScalar(mob ? 0.92 : 1)'))throw Error('Missing scale target');body=body.replace('this.card.scale.setScalar(mob ? 0.92 : 1)','this.card.scale.setScalar(mob ? 0.70 : 1)');await route.fulfill({response,body});});
 await page.goto('http://127.0.0.1:58000/'+encodeURIComponent(filename),{waitUntil:'networkidle'});await page.waitForFunction(id=>window.__momentumFilm?.[id],id);await page.evaluate(()=>document.fonts.ready);
 await page.evaluate(id=>{const f=window.__momentumFilm[id];f.setAspect('9:16');const s=document.querySelector('[data-om-exportable-video-with-duration-secs]');Object.assign(s.style,{width:'1080px',height:'1920px',maxWidth:'none',aspectRatio:'9/16',borderRadius:'0'});f.renderFrameAt(0)},id);await page.waitForTimeout(150);
 const capture=async n=>Buffer.from((await page.evaluate(({id,n})=>{const f=window.__momentumFilm[id];f.renderFrameAt(n);return f.capturePNG()},{id,n})).split(',')[1],'base64');
 const first=await capture(539);await capture(0);const again=await capture(539);if(hash(first)!==hash(again))throw Error('Endcard mismatch');
 const dir=path.join(base,'corrected-endcards',id+'-9x16');fs.mkdirSync(dir,{recursive:true});
 for(let n=432;n<540;n++){fs.writeFileSync(path.join(dir,'frame_'+String(n).padStart(4,'0')+'.png'),await capture(n));}
 results.push({id,aspect:'9:16',startFrame:432,endFrame:539,frames:108,portraitEndCardScale:0.70,originalScale:0.92,sourceModified:false,lastFrameSHA256:hash(first),deterministic:true});console.log(JSON.stringify(results.at(-1)));await page.close();
 }fs.writeFileSync(path.join(base,'portrait-endcard-repair.json'),JSON.stringify({status:'PASS',results},null,2));}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
