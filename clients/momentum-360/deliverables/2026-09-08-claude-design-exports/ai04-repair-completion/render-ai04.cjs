const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {chromium} = require('C:/Users/dillo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sharp = require('C:/Users/dillo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const full = process.argv.includes('--full');
const root = __dirname;
const films = fs.readdirSync(path.join(root,'source')).filter(f => /^AI 04 - .*\.html$/.test(f)).sort();
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const log = o => process.stdout.write(JSON.stringify(o)+'\n');
(async()=>{
 const browser = await chromium.launch({channel:'chrome',headless:true});
 const receipt = {
  started:new Date().toISOString(), full,
  sourceSHA256:hash(fs.readFileSync(path.join(root,'source','AI 04 - Break the Frame.dc.html'))),
  runtimeSHA256:hash(fs.readFileSync(path.join(root,'source','film-kit-ai04.js'))),
  films:[]
 };
 try {
  for(const filename of films){
   const id='ai'+filename.slice(3,5);
   const page = await browser.newPage({viewport:{width:2048,height:2200},deviceScaleFactor:1});
   const errors=[]; page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:63387/'+encodeURIComponent(filename),{waitUntil:'networkidle',timeout:60000});
   await page.waitForFunction(id=>window.__momentumFilm?.[id],id,{timeout:60000});
   await page.evaluate(()=>document.fonts.ready);
   await page.getByLabel('Playback duration').selectOption('18');
   for(const aspect of ['16:9','9:16']){
    const [w,h]=aspect==='16:9'?[1920,1080]:[1080,1920];
    const name=id+'-'+aspect.replace(':','x');
    const out=path.join(root,full?'rgba-frames':'qa',name); fs.mkdirSync(out,{recursive:true});
    await page.evaluate(({id,aspect,w,h})=>{
     const f=window.__momentumFilm[id]; f.setAspect(aspect);
     const s=document.querySelector('[data-om-exportable-video-with-duration-secs]');
     Object.assign(s.style,{width:w+'px',height:h+'px',maxWidth:'none',aspectRatio:aspect.replace(':','/'),borderRadius:'0'});
     f.renderFrameAt(0);
    },{id,aspect,w,h});
    await page.waitForTimeout(150);
    const capture=async n=>Buffer.from((await page.evaluate(({id,n})=>{const f=window.__momentumFilm[id];f.renderFrameAt(n);return f.capturePNG()},{id,n})).split(',')[1],'base64');
    const a=await capture(300); await capture(120);const b=await capture(300);
    if(hash(a)!==hash(b)) throw new Error(name+' nondeterministic capture');
    const samples=[];
    const frames=full?Array.from({length:540},(_,i)=>i):[42,165,282,390,539];
    for(const n of frames){
     const png=await capture(n);
     fs.writeFileSync(path.join(out,'frame_'+String(n).padStart(4,'0')+'.png'),png);
     if(!full || n%30===0){
      const {data,info}=await sharp(png).ensureAlpha().raw().toBuffer({resolveWithObject:true});
      let clear=0,soft=0,dirty=0,visible=0;
      for(let i=0;i<data.length;i+=4){const alpha=data[i+3];if(alpha===0){clear++;if(data[i]||data[i+1]||data[i+2])dirty++;}else{visible++;if(alpha<255)soft++;}}
      // The authored impulse sphere can cover the view with translucent pixels.
      // Fully clear pixels are not required on those frames; record their count.
      if(info.width!==w||info.height!==h||dirty) throw new Error(name+' alpha/dimension failure at '+n);
      const bounds = await page.evaluate(({id})=>window.__momentumFilm[id].messageBounds?.() || null,{id});
      samples.push({frame:n,width:info.width,height:info.height,clear,soft,dirty,visible,bounds});
      log({name,frame:n,total:frames.length,visible});
      if(!full){
       await sharp(png).flatten({background:'#03172e'}).resize({width:aspect==='16:9'?640:360}).png().toFile(path.join(out,'navy_'+n+'.png'));
       await sharp(png).flatten({background:'#ffffff'}).resize({width:aspect==='16:9'?640:360}).png().toFile(path.join(out,'white_'+n+'.png'));
      }
     }
    }
    const result={name,filename,aspect,width:w,height:h,fps:30,frames:frames.length,deterministic:true,samples,errors:[...errors],completed:new Date().toISOString()};
    fs.writeFileSync(path.join(out,'receipt.json'),JSON.stringify(result,null,2));receipt.films.push(result);
    fs.writeFileSync(path.join(root,full?'render-receipt.json':'qa-receipt.json'),JSON.stringify(receipt,null,2));
    if(errors.length)throw new Error(name+': '+errors.join(';'));
   }
   await page.close();
  }
  receipt.completed=new Date().toISOString();receipt.status='passed';
 }catch(e){receipt.status='failed';receipt.error=e.message;throw e;}
 finally{fs.writeFileSync(path.join(root,full?'render-receipt.json':'qa-receipt.json'),JSON.stringify(receipt,null,2));await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
