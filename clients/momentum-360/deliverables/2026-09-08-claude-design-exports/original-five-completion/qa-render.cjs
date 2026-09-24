const {chromium}=require('C:/Users/dillo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawn,execFileSync}=require('node:child_process');
const BASE='http://127.0.0.1:49445/',OUT=path.join(__dirname,'review');
const mode=process.argv[2]||'qa',filter=process.argv[3]||'';
const films=[
 {id:'first-assignment',file:'momo/Momo - First Assignment.dc.html',tag:'momo-assignment-stage',duration:24},
 {id:'one-idea-everywhere',file:'momo/One Idea Everywhere.dc.html',tag:'momo-paper-stage',duration:20},
 {id:'inside-living-portfolio',file:'momo/Inside the Living Portfolio.dc.html',tag:'momo-gallery-stage',duration:20},
 ...['search','design','marketing','automation'].map((v,i)=>({id:'next-chapter-'+v,file:'launch/The Next Chapter Series.dc.html',variant:v,index:i,duration:12})),
 ...['momo','search','response','build','operations','audience'].map((v,i)=>({id:'character-'+v,file:'launch/Meet Your Team - Character Shorts.dc.html',variant:v,index:i,duration:10}))
];
function assert(v,m){if(!v)throw Error(m)}
function hash(b){return crypto.createHash('sha256').update(b).digest('hex')}
function jpegDimensions(b){
 assert(b[0]===255&&b[1]===216,'Invalid JPEG header');
 for(let i=2;i<b.length;){
  assert(b[i++]===255,'Invalid JPEG segment');let marker=b[i++];while(marker===255)marker=b[i++];
  const length=b.readUInt16BE(i);
  if([0xc0,0xc1,0xc2].includes(marker))return {height:b.readUInt16BE(i+3),width:b.readUInt16BE(i+5)};
  assert(length>=2,'Invalid JPEG segment length');i+=length;
 }
 throw Error('JPEG dimensions missing');
}
async function seek(page,f,t){
 await page.evaluate(async({tag,t})=>{
  if(tag){const s=document.querySelector(tag);await s.renderFrameAt(t)}
  else document.querySelector('[data-om-exportable-video-with-duration-secs]').dispatchEvent(new CustomEvent('data-om-seek-to-time-frame',{detail:{time:t}}));
  await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
 },{tag:f.tag,t});
}
async function setup(page,f,aspect,master=false){
 await page.goto(BASE+f.file,{waitUntil:'networkidle',timeout:60000});
 const target=f.tag?'[data-momo-root]':'[data-om-exportable-video-with-duration-secs]';
 await page.waitForFunction(tag=>tag?document.querySelector(tag)?.ready===true:document.querySelector('[data-om-exportable-video-with-duration-secs] canvas')?.width>100,f.tag,{timeout:60000});
 if(f.variant){await page.getByRole('button',{name:new RegExp((f.id.startsWith('next-')?'Episode':'Short')+' 0'+(f.index+1))}).click();}
 if(f.tag)await page.getByRole('button',{name:aspect,exact:true}).click();
 else await page.getByRole('combobox',{name:'Composition frame',exact:true}).selectOption(aspect);
 await seek(page,f,1);
 if(master){
  const w=aspect==='16:9'?1920:1080,h=aspect==='16:9'?1080:1920;
  await page.setViewportSize({width:w+100,height:h+900});
  await page.evaluate(({target,tag,w,h})=>{const root=document.querySelector(target);Object.assign(root.style,{position:'fixed',left:'0',top:'0',zIndex:'999999',width:w+'px',height:h+'px',maxWidth:'none',borderRadius:'0',margin:'0'});if(tag){const s=document.querySelector(tag);Object.assign(s.style,{width:'100%',height:'100%',aspectRatio:'auto',borderRadius:'0'});s.resize();cancelAnimationFrame(s._raf);s._raf=0;}}, {target,tag:f.tag,w,h});
  await page.waitForTimeout(180);
 }
 await page.evaluate(()=>document.fonts.ready);
 return page.locator(target);
}
async function qa(browser,f,aspect){
 const key=f.id+'-'+aspect.replace(':','x'),dir=path.join(OUT,key);fs.mkdirSync(dir,{recursive:true});
 const errors=[],consoleErrors=[],failedRequests=[];
 const page=await browser.newPage({viewport:{width:aspect==='16:9'?1440:390,height:1000},deviceScaleFactor:1});
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')consoleErrors.push({message:m.text(),url:m.location().url})});
 page.on('requestfailed',r=>failedRequests.push({url:r.url(),error:r.failure()?.errorText}));
 const receipt={id:f.id,aspect,file:f.file,at:new Date().toISOString(),duration:f.duration,errors,consoleErrors,failedRequests};
 try{
  const target=await setup(page,f,aspect);
  receipt.layout=await target.evaluate(e=>{const r=e.getBoundingClientRect();return {width:r.width,height:r.height,viewport:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth+1}});
  assert(Math.abs(receipt.layout.width/receipt.layout.height-(aspect==='16:9'?16/9:9/16))<.015,'Composition aspect mismatch');
  assert(!receipt.layout.overflow,'Horizontal document overflow');
  await page.getByRole('button',{name:'Replay',exact:true}).click();await page.waitForTimeout(240);
  assert(await page.getByRole('button',{name:'Pause',exact:true}).count()===1,'Replay did not start');
  await page.getByRole('button',{name:'Pause',exact:true}).click();
  assert(await page.getByRole('button',{name:'Play',exact:true}).count()===1,'Pause did not stop');
  const slider=page.getByRole('slider');await slider.focus();await slider.press('Home');await slider.press('ArrowRight');
  const sliderValue=await slider.inputValue();assert(Number(sliderValue)>0,'Scrub keyboard did not move');
  receipt.controls={replay:true,pause:true,keyboardScrub:true,sliderValue};
  await page.getByRole('button',{name:'Sound off',exact:true}).click();
  assert(await page.getByRole('button',{name:'Sound on',exact:true}).count()===1,'Sound switch did not respond');
  await page.getByRole('button',{name:'Sound on',exact:true}).click();receipt.controls.soundToggle=true;
  receipt.beats=[];
  for(const [name,t]of [['first',0],['opening',1.2],['middle',f.duration/2],['last',f.duration-1/30]]){
   await seek(page,f,t);const p=path.join(dir,name+'.png');const bytes=await target.screenshot({path:p});receipt.beats.push({name,time:t,path:p,sha256:hash(bytes)});
  }
  // A repeated settled frame should be exactly identical on one machine.
  await seek(page,f,f.duration-1);const a=await target.screenshot();await seek(page,f,2);await seek(page,f,f.duration-1);const b=await target.screenshot();
  receipt.deterministicSettledFrame=hash(a)===hash(b);
  if(!receipt.deterministicSettledFrame){
   const pa=path.join(dir,'repeat-a.png'),pb=path.join(dir,'repeat-b.png');fs.writeFileSync(pa,a);fs.writeFileSync(pb,b);
   const code="from PIL import Image,ImageChops; import json,sys; a=Image.open(sys.argv[1]).convert('RGB'); b=Image.open(sys.argv[2]).convert('RGB'); d=ImageChops.difference(a,b); p=list(d.getdata()); print(json.dumps({'pixels':len(p),'changed':sum(max(v)>0 for v in p),'maxChannelDiff':max(map(max,p)),'bbox':d.getbbox()}))";
   receipt.repeatPixelDifference=JSON.parse(execFileSync('python',['-W','ignore','-c',code,pa,pb],{encoding:'utf8',windowsHide:true}));
   const d=receipt.repeatPixelDifference;
   receipt.deterministicWithinPreviewRasterTolerance=d.maxChannelDiff<=1&&d.changed/d.pixels<0.0001;
  }
  assert(receipt.deterministicSettledFrame||receipt.deterministicWithinPreviewRasterTolerance,'Repeated settled frame changed beyond one-level edge rounding');
  await page.emulateMedia({reducedMotion:'reduce'});await page.reload({waitUntil:'networkidle'});
  await page.waitForFunction(tag=>tag?document.querySelector(tag)?.ready===true:!!document.querySelector('[data-om-exportable-video-with-duration-secs]'),f.tag);
  receipt.reducedMotion=await page.evaluate(tag=>tag?{enabled:document.querySelector(tag).reduced,playing:document.querySelector(tag).playing}:{enabled:matchMedia('(prefers-reduced-motion: reduce)').matches,staticVisible:!![...document.querySelectorAll('button')].find(e=>/Motion version/.test(e.textContent))},f.tag);
  if(f.tag)assert(receipt.reducedMotion.enabled&&!receipt.reducedMotion.playing,'Reduced motion autoplay');
  else assert(receipt.reducedMotion.enabled&&receipt.reducedMotion.staticVisible,'Reduced motion static view missing');
  assert(errors.length===0,'Page errors');assert(consoleErrors.filter(e=>!e.url.endsWith('/favicon.ico')).length===0,'Console errors');
  receipt.status='PASS';
 }catch(e){receipt.status='FAIL';receipt.failure=e.message;try{await page.screenshot({path:path.join(dir,'failure.png'),fullPage:true})}catch{}}
 finally{fs.writeFileSync(path.join(dir,'qa.json'),JSON.stringify(receipt,null,2));await page.close()}
 console.log(JSON.stringify({mode:'qa',id:f.id,aspect,status:receipt.status,failure:receipt.failure,errors}));return receipt;
}
async function render(browser,f,aspect){
 const key=f.id+'-'+aspect.replace(':','x'),dir=path.join(OUT,key);fs.mkdirSync(dir,{recursive:true});
 const output=path.join(dir,key+'-review-silent.mp4');
 if(fs.existsSync(output)&&fs.existsSync(path.join(dir,'render.json'))&&JSON.parse(fs.readFileSync(path.join(dir,'render.json'))).status==='PASS') {console.log(JSON.stringify({mode:'render',key,status:'PRESERVED_COMPLETED',output}));return;}
 assert(!fs.existsSync(output),'Existing incomplete render preserved: '+output);
 const page=await browser.newPage({viewport:{width:1440,height:1800},deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 // Render-only performance guard: the public seek handler already draws each
 // requested frame. Suppress redundant paused-loop redraws, preserving archives.
 if(!f.tag)await page.route('**/*.dc.html',route=>{
  let html=fs.readFileSync(path.join(__dirname,f.file),'utf8');
  if(f.id.startsWith('next-'))html=html.replace('    this.applyFrame(this.frameAt(this.t));\n  };','    if (this.playing) this.applyFrame(this.frameAt(this.t));\n  };');
  else {
   html=html.replace('    this.applyFrame(this.t);\n  };\n\n  MARKS','    if (this.playing) this.applyFrame(this.t);\n  };\n\n  MARKS');
   // At full development the native mask ends with an opaque full-canvas fill.
   // Skip drawing the thousands of circles that it immediately covers.
   html=html.replace("    m.fillStyle = '#000';\n    for (let j", "    m.fillStyle = '#000';\n    if (p === 1) { m.fillRect(0, 0, gx, gy); return this.mask; }\n    for (let j");
  }
  return route.fulfill({contentType:'text/html',body:html});
 });
 const target=await setup(page,f,aspect,true),w=aspect==='16:9'?1920:1080,h=aspect==='16:9'?1080:1920;
 const clip=await target.boundingBox();assert(clip.x===0&&clip.y===0&&clip.width===w&&clip.height===h,'Capture bounds must be the complete exact-size frame');
 const jpeg=f.id.startsWith('character');
 const encoder=spawn('ffmpeg',['-hide_banner','-loglevel','error','-f','image2pipe','-vcodec',jpeg?'mjpeg':'png','-framerate','30','-i','pipe:0','-an','-vf',`scale=${w}:${h}`,'-c:v','libx264','-threads','2','-preset','fast','-crf','19','-pix_fmt','yuv420p','-movflags','+faststart',output],{windowsHide:true});
 let stderr='';encoder.stderr.on('data',d=>stderr+=d);const exited=new Promise((resolve,reject)=>{encoder.on('error',reject);encoder.on('exit',c=>c===0?resolve():reject(Error(stderr)))});
 try{
  for(let i=0;i<f.duration*30;i++){
   await seek(page,f,i/30);const bytes=await page.screenshot({clip,...(jpeg?{type:'jpeg',quality:100}:{})});
   const dim=jpeg?jpegDimensions(bytes):{width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)};
   assert(dim.width===w&&dim.height===h,'Capture dimensions changed');
   if(!encoder.stdin.write(bytes))await new Promise(r=>encoder.stdin.once('drain',r));
   if(i%60===0)console.log(JSON.stringify({mode:'render',key,frame:i,total:f.duration*30}));
  }
  encoder.stdin.end();await exited;assert(errors.length===0,'Render page errors');
  fs.writeFileSync(path.join(dir,'render.json'),JSON.stringify({status:'PASS',file:f.file,output,width:w,height:h,fps:30,frames:f.duration*30,duration:f.duration,captureBounds:clip,captureFormat:jpeg?'JPEG quality 100':'PNG',frameDimensionsAsserted:true,audio:'silent review; native sound remains available in source',errors},null,2));
  console.log(JSON.stringify({mode:'render',key,status:'PASS',output}));
 }finally{await page.close();if(!encoder.killed)encoder.kill()}
}
module.exports={films,setup,seek};
if(require.main===module)(async()=>{fs.mkdirSync(OUT,{recursive:true});const browser=await chromium.launch({channel:'chrome',headless:true,args:['--autoplay-policy=no-user-gesture-required']});try{const results=[];for(const f of films.filter(f=>!filter||f.id.startsWith(filter)))for(const aspect of ['16:9','9:16']){if(mode==='qa')results.push(await qa(browser,f,aspect));else await render(browser,f,aspect)}if(mode==='qa')fs.writeFileSync(path.join(OUT,'qa-'+(filter||'all')+'.json'),JSON.stringify(results,null,2));}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
