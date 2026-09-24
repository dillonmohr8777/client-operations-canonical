const { chromium } = require('C:/Users/dillo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');
const film = process.argv[2] || 'A';
const mode = process.argv[3] || 'stills';
const original = process.argv.includes('--original');
const duration = {A:26,B:25,M:30}[film];
const root = path.resolve(__dirname,'..');
const names = {A:'Film A - Your Next Chapter',B:'Film B - Meet Your Next Team',M:'Momo - Living Portfolio Film'};
const port = film === 'M' ? 61843 : 61828;
const filename = names[film] + (original ? '' : '.finishing') + '.dc.html';
const out = path.join(__dirname,`${film}-${original?'before':'after'}-${mode}`);
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser = await chromium.launch({channel:'chrome',headless:true,args:['--autoplay-policy=no-user-gesture-required']});
 const errors=[];
 try {
  const page=await browser.newPage({viewport:{width:1920,height:2052},deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${port}/${encodeURIComponent(filename)}`,{waitUntil:'networkidle',timeout:60000});
  if(film==='M'){
   await page.waitForFunction(()=>document.querySelector('momo-film-stage')?.ready===true,{timeout:90000});
   await page.evaluate(()=>{const s=document.querySelector('momo-film-stage'),r=s.closest('[data-momo-root]');s.pause();Object.assign(r.style,{maxWidth:'none',width:'1920px',height:'1080px'});Object.assign(s.style,{aspectRatio:'auto',width:'100%',height:'100%'});s.resize();});
  } else {
   await page.waitForFunction(()=>{const s=document.querySelector('[data-om-exportable-video-with-duration-secs]');return s&&s.querySelector('canvas')?.width>500&&[...s.querySelectorAll('img')].every(i=>i.complete&&i.naturalWidth>0);},{timeout:60000});
   await page.evaluate(()=>{const s=document.querySelector('[data-om-exportable-video-with-duration-secs]');Object.assign(s.style,{width:'1920px',height:'1080px',maxWidth:'none',borderRadius:'0'});for(const n of s.querySelectorAll('div'))if(n.textContent.trim()==='Drag to turn · ← →')n.style.display='none';});
  }
  await page.waitForTimeout(800);
  const times=mode==='stills'?[0,1.5,4,6,12,20,duration-1]:Array.from({length:30*(mode==='sample'?6:duration)},(_,i)=>i/30);
  for(let i=0;i<times.length;i++){
   const t=times[i];
   if(film==='M'){
    await page.evaluate(t=>document.querySelector('momo-film-stage').renderFrameAt(t),t);
    await page.waitForFunction(()=>document.querySelector('momo-film-stage').videos.every(v=>!v.attached||v.el.readyState>=2),{timeout:15000});
    await page.evaluate(async t=>{const s=document.querySelector('momo-film-stage');await s.renderFrameAt(t);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));s.draw();},t);
   } else await page.evaluate(async t=>{document.querySelector('[data-om-exportable-video-with-duration-secs]').dispatchEvent(new CustomEvent('data-om-seek-to-time-frame',{detail:{time:t}}));await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));},t);
   await page.locator(film==='M'?'[data-momo-root]':'[data-om-exportable-video-with-duration-secs]').screenshot({path:path.join(out,`f${String(i).padStart(5,'0')}.png`)});
   if(mode==='stills'||i%60===0)console.log(JSON.stringify({film,mode,original,frame:i,time:t}));
  }
  fs.writeFileSync(path.join(out,'receipt.json'),JSON.stringify({film,mode,original,filename,frames:times.length,errors},null,2));
  if(errors.length)throw Error(errors.join('; '));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
