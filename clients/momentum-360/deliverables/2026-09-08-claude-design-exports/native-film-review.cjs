const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {chromium}=require('C:/Users/dillo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sharp=require('C:/Users/dillo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const config=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const full=process.argv.includes('--full'),base=path.dirname(path.resolve(process.argv[2]));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const log=x=>console.log(JSON.stringify(x));
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const receipt={started:new Date().toISOString(),mode:full?'full-render':'functional-and-frame-QA',sourceFile:config.filename,results:[]};
 try{
  for(const aspect of ['16:9','9:16']){
   const [w,h]=aspect==='16:9'?[1920,1080]:[1080,1920];
   const page=await browser.newPage({viewport:aspect==='16:9'?{width:1280,height:900}:{width:390,height:844},deviceScaleFactor:1});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(config.url+encodeURIComponent(config.filename),{waitUntil:'networkidle'});
   await page.waitForFunction(id=>window.__momentumFilm?.[id],config.id);
   await page.evaluate(()=>document.fonts.ready);
   const controls={};
   if(!full){
    controls.initialDuration=await page.getByLabel('Playback duration',{exact:true}).inputValue();
    if(controls.initialDuration!=='18')throw Error('Initial duration mismatch');
    controls.layout=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth}));
    if(controls.layout.scrollWidth>controls.layout.width+1)throw Error('Native UI horizontal overflow');
    await page.getByRole('button',{name:'Replay',exact:true}).click();await page.waitForTimeout(80);
    await page.getByRole('button',{name:'Pause',exact:true}).click();
    const scrub=page.getByLabel('Scrub the film',{exact:true});await scrub.focus();await scrub.press('Home');await scrub.press('ArrowRight');
    controls.scrubValue=await scrub.inputValue();
    await page.getByRole('button',{name:'Sound off',exact:true}).click();
    controls.soundEnabled=await page.getByRole('button',{name:'Sound on',exact:true}).count()===1;
    await page.getByRole('button',{name:'Sound on',exact:true}).click();
    await page.getByLabel('Composition frame',{exact:true}).selectOption(aspect);
    controls.aspect=await page.getByLabel('Composition frame',{exact:true}).inputValue();
   }
   await page.evaluate(({id,aspect,w,h})=>{
    const f=window.__momentumFilm[id];f.setAspect(aspect);
    const s=document.querySelector('[data-om-exportable-video-with-duration-secs]');
    Object.assign(s.style,{width:w+'px',height:h+'px',maxWidth:'none',aspectRatio:aspect.replace(':','/'),borderRadius:'0'});
    f.renderFrameAt(0);
   },{id:config.id,aspect,w,h});
   await page.waitForTimeout(100);
   const capture=async n=>Buffer.from((await page.evaluate(({id,n})=>{const f=window.__momentumFilm[id];f.renderFrameAt(0);f.renderFrameAt(n);return f.capturePNG()},{id:config.id,n})).split(',')[1],'base64');
   const repeated=[];
   for(const n of [36,165,300,390,539]){
    const a=await capture(n);await capture(120);const b=await capture(n);
    if(sha(a)!==sha(b))throw Error('Nondeterministic frame '+n+' '+aspect);
    repeated.push({frame:n,sha256:sha(a)});
   }
   const dir=path.join(base,full?'rgba-frames':'qa',aspect.replace(':','x'));fs.mkdirSync(dir,{recursive:true});
   const frames=full?Array.from({length:540},(_,i)=>i):[0,15,36,42,60,165,282,300,330,390,420,492,539];
   const stats=[],frameHashes=[];
   for(const n of frames){
    let png=await capture(n);
    const meta=await sharp(png).metadata();if(meta.width!==w||meta.height!==h)throw Error('Dimension mismatch frame '+n);
    const expected=repeated.find(x=>x.frame===n);
    if(expected&&expected.sha256!==sha(png))throw Error('Preflight/full-frame mismatch '+n+' '+aspect);
    if(full){
     const alphaStats=await sharp(png).stats();
     if(alphaStats.channels[3].max===0&&!(config.allowedBlankFrames||[0]).includes(n))throw Error('Unexpected blank frame '+n+' '+aspect);
     frameHashes.push({frame:n,sha256:sha(png)});
    }
    if(!full||n%30===0||n===539){
     const raw=await sharp(png).ensureAlpha().raw().toBuffer();let visible=0,dirty=0;
     for(let i=0;i<raw.length;i+=4){if(raw[i+3])visible++;else if(raw[i]||raw[i+1]||raw[i+2])dirty++;}
     if(dirty)throw Error('Dirty alpha frame '+n);
     stats.push({frame:n,visible,dirty});
     log({aspect,frame:n,total:frames.length,visible});
    }
    fs.writeFileSync(path.join(dir,'frame_'+String(n).padStart(4,'0')+'.png'),png);
    if(!full)await sharp(png).flatten({background:'#03172e'}).resize({width:aspect==='16:9'?640:360}).png().toFile(path.join(dir,'navy_'+n+'.png'));
   }
   if(!full){
    await page.emulateMedia({reducedMotion:'reduce'});await page.reload({waitUntil:'networkidle'});
    await page.getByRole('button',{name:'Motion version',exact:true}).waitFor({state:'visible'});
    controls.reducedMotionStatic=true;
   }
   if(errors.length)throw Error(errors.join(';'));
   const result={aspect,width:w,height:h,fps:30,frames:frames.length,duration:18,controls,repeated,stats,frameHashes,errors,status:'PASS'};
   receipt.results.push(result);fs.writeFileSync(path.join(base,full?'render-receipt.json':'qa-receipt.json'),JSON.stringify(receipt,null,2));
   await page.close();
  }
  receipt.status='PASS';receipt.completed=new Date().toISOString();
 }catch(e){receipt.status='FAIL';receipt.error=e.message;throw e;}
 finally{fs.writeFileSync(path.join(base,full?'render-receipt.json':'qa-receipt.json'),JSON.stringify(receipt,null,2));await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
