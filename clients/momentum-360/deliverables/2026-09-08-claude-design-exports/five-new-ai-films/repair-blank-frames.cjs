const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {chromium}=require('C:/Users/dillo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sharp=require('C:/Users/dillo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const base=__dirname, hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const endcard=process.argv.includes('--endcard');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});const results=[];
 try{
 const page=await browser.newPage({viewport:{width:2048,height:2200},deviceScaleFactor:1});
 await page.goto((process.env.FILM_PREVIEW_URL||'http://127.0.0.1:51075/')+'AI%2005%20-%20System%20Awake.dc.html',{waitUntil:'networkidle'});
 await page.waitForFunction(()=>window.__momentumFilm?.ai05);
 await page.evaluate(()=>document.fonts.ready);
 await page.evaluate(()=>{const f=window.__momentumFilm.ai05;f.setAspect('16:9');const s=document.querySelector('[data-om-exportable-video-with-duration-secs]');Object.assign(s.style,{width:'1920px',height:'1080px',maxWidth:'none',aspectRatio:'16/9',borderRadius:'0'});f.renderFrameAt(0)});
 await page.waitForTimeout(150);
 const capture=async n=>{await page.evaluate(n=>window.__momentumFilm.ai05.renderFrameAt(n),n);await page.waitForTimeout(25);return Buffer.from((await page.evaluate(()=>window.__momentumFilm.ai05.capturePNG())).split(',')[1],'base64')};
 for(let n=endcard?432:147;n<=(endcard?539:182);n++){
  const a=await capture(n);await capture(0);const b=await capture(n);
  if(hash(a)!==hash(b))throw Error('Non-deterministic repair '+n);
  const meta=await sharp(a).metadata(),stats=await sharp(a).stats();
  if(meta.width!==1920||meta.height!==1080||stats.channels[3].max===0)throw Error('Blank repair '+n);
  const filename='frame_'+String(n).padStart(4,'0')+'.png',p=path.join(base,'rgba-frames','ai05-16x9',filename),rejected=path.join(base,endcard?'REJECTED-incomplete-endcard':'REJECTED-blank-captures','ai05-16x9');fs.mkdirSync(rejected,{recursive:true});
  const old=fs.readFileSync(p);fs.writeFileSync(path.join(rejected,filename),old);fs.writeFileSync(p,a);
  results.push({frame:n,originalSHA256:hash(old),acceptedSHA256:hash(a),repeatedCaptureMatches:true});
 }
 fs.writeFileSync(path.join(base,endcard?'landscape-endcard-repair.json':'blank-frame-repair.json'),JSON.stringify({status:'PASS',sourceModified:false,film:'ai05-16x9',reason:'Fresh native deterministic recapture replaces unexpected blank or incomplete frames; rejected PNGs retained.',results},null,2));
 console.log(JSON.stringify({repaired:results.length,status:'PASS'}));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
