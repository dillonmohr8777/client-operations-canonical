const fs=require('fs'),path=require('path');
const {chromium}=require('C:/Users/dillo/Documents/Codex/2026-08-04/we-can-help-right-research-this-2/node_modules/@playwright/test');
const checks=[];function ok(name,pass,details){checks.push({name,pass,details})}
(async()=>{const b=await chromium.launch({headless:true});
for(const [name,width,height] of [['desktop',1280,720],['mobile',390,844]]){
 const c=await b.newContext({viewport:{width,height},reducedMotion:'no-preference',...(name==='desktop'?{recordVideo:{dir:path.join(__dirname,'intro-recording'),size:{width,height}}}:{})});
 const p=await c.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));const failed=[];p.on('requestfailed',r=>failed.push(r.url()));
 await p.goto('http://127.0.0.1:65515/',{waitUntil:'domcontentloaded'});await p.waitForSelector('.champion-intro');
 await p.waitForFunction(()=>document.querySelector('.champion-video')?.currentTime>=1.2);await p.screenshot({path:path.join(__dirname,name+'-champion-putt.png')});
 ok(name+' real clip playing',await p.locator('.champion-video').evaluate(v=>v.currentTime>1&&!v.paused&&v.videoWidth===1280));
 await p.waitForFunction(()=>document.querySelector('.champion-video')?.currentTime>=4.4);await p.screenshot({path:path.join(__dirname,name+'-champion-wordmark.png')});
 const logo=await p.locator('.champion-logo').evaluate(e=>({src:e.getAttribute('src'),clip:getComputedStyle(e).clipPath,box:e.getBoundingClientRect().toJSON()}));
 ok(name+' exact SVG reveal',logo.src==='assets/puttery-logo.svg'&&logo.clip==='inset(0px 0% 0px 0px)',logo);
 ok(name+' wordmark in bounds',logo.box.left>=0&&logo.box.right<=width&&logo.box.top>=0&&logo.box.bottom<=height,logo.box);
 ok(name+' whole golfer composition',await p.locator('.champion-video').evaluate(v=>getComputedStyle(v).objectFit==='contain'));
 await p.locator('.champion-intro').waitFor({state:'detached',timeout:12000});await p.waitForTimeout(400);
 ok(name+' original motion resumes',await p.locator('.brand-lockup img').evaluate(e=>getComputedStyle(e).animationName==='mark_hop'));
 ok(name+' guest data boundary',(await p.locator('#status-title').textContent())==='Reservation webhook receiving.');
 if(name==='desktop'){await c.close();const files=fs.readdirSync(path.join(__dirname,'intro-recording')).filter(f=>f.endsWith('.webm'));fs.writeFileSync(path.join(__dirname,'intro-recording-path.txt'),path.join(__dirname,'intro-recording',files[files.length-1]));}
 else{
  await p.getByRole('button',{name:'Replay intro',exact:true}).click();await p.waitForSelector('.champion-intro');await p.locator('.champion-pause').click();const time=await p.locator('.champion-video').evaluate(v=>v.currentTime);await p.waitForTimeout(400);ok('intro pause',await p.locator('.champion-video').evaluate(v=>v.paused)&&Math.abs((await p.locator('.champion-video').evaluate(v=>v.currentTime))-time)<.15);await p.keyboard.press('Escape');ok('intro Escape',await p.locator('.champion-intro').count()===0);await c.close();
 }
 ok(name+' clean scripts',errors.length===0,errors);ok(name+' no failed assets',failed.length===0,failed);
}
const cc=await b.newContext({reducedMotion:'no-preference'});const cp=await cc.newPage();await cp.route('**/puttery-champion-intro.mp4',r=>r.abort());await cp.goto('http://127.0.0.1:65515/');await cp.waitForSelector('.pilot-intro');ok('media failure original fallback',await cp.locator('.pilot-intro .pi-stamp').count()===1);await cc.close();
const rc=await b.newContext({reducedMotion:'reduce'});const rp=await rc.newPage();await rp.goto('http://127.0.0.1:65515/');ok('reduced motion no video intro',await rp.locator('.champion-intro,.pilot-intro').count()===0);await rc.close();
await b.close();fs.writeFileSync(path.join(__dirname,'champion-checks.json'),JSON.stringify({checkedAt:new Date().toISOString(),checks},null,2));console.log(JSON.stringify({passed:checks.filter(c=>c.pass).length,total:checks.length,failures:checks.filter(c=>!c.pass)},null,2));})().catch(e=>{console.error(e);process.exitCode=1});
