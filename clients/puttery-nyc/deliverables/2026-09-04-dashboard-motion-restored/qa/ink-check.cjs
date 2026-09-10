const fs=require('fs'),path=require('path');
const {chromium}=require('C:/Users/dillo/Documents/Codex/2026-08-04/we-can-help-right-research-this-2/node_modules/@playwright/test');
const AxeBuilder=require('C:/Users/dillo/Documents/Codex/2026-08-04/we-can-help-right-research-this-2/node_modules/@axe-core/playwright').default;
const checks=[];const ok=(name,pass,details)=>checks.push({name,pass,details});
const root=path.resolve(__dirname,'..');const original=fs.readFileSync(path.join(root,'assets/puttery-logo.svg'),'utf8');const sourcePaths=[...original.matchAll(/<path d="([^"]+)"/g)].map(m=>m[1]).sort();
const ready=async(p,t)=>p.waitForFunction(t=>Number(document.querySelector('.champion-intro')?.dataset.elapsed)>=t,t);
(async()=>{
 const b=await chromium.launch({headless:true});
 for(const [name,width,height] of [['desktop',1280,720],['mobile',390,844]]){
  const c=await b.newContext({viewport:{width,height},reducedMotion:'no-preference'});const p=await c.newPage();const errors=[],failed=[];p.on('pageerror',e=>errors.push(e.message));p.on('requestfailed',r=>failed.push(r.url()));
  await p.goto('http://127.0.0.1:65515/',{waitUntil:'domcontentloaded'});await p.waitForSelector('.sketch-canvas');
  ok(name+' pure black cartoon, no intro video',await p.locator('.champion-intro').evaluate(e=>getComputedStyle(e).backgroundColor==='rgb(0, 0, 0)'&&e.querySelectorAll('video').length===0&&e.querySelectorAll('.sketch-golfer path').length>15));
  ok(name+' exact seven logo paths',JSON.stringify((await p.locator('.exact-glyph').evaluateAll(es=>es.map(e=>e.getAttribute('d')).sort())))===JSON.stringify(sourcePaths));
  await ready(p,600);await p.screenshot({path:path.join(__dirname,name+'-ink-putt.png')});
  const first=await p.locator('.golfer-club').getAttribute('transform');
  await ready(p,1920);await p.screenshot({path:path.join(__dirname,name+'-ink-p.png')});
  ok(name+' club moves through putt',first!==await p.locator('.golfer-club').getAttribute('transform'));
  const causal=await p.evaluate(()=>{const s=document.querySelector('.champion-intro'),i=Number(s.dataset.glyph),route=s.querySelectorAll('.write-route')[i],p=1-Number(route.style.strokeDashoffset),pt=route.getPointAtLength(route.getTotalLength()*p),screen=new DOMPoint(pt.x,pt.y).matrixTransform(s.querySelector('.written-wordmark').getCTM()),ball=new DOMPoint(0,0).matrixTransform(s.querySelector('.writing-ball').getCTM());return{glyph:i,inkProgress:p,seals:[...s.querySelectorAll('.ink-seal')].map(x=>Number(x.getAttribute('opacity'))),distance:Math.hypot(screen.x-ball.x,screen.y-ball.y)}});
  ok(name+' ball drives partial first glyph',causal.glyph===0&&causal.inkProgress>0&&causal.inkProgress<1&&causal.distance<.01&&causal.seals.slice(1).every(x=>x===0),causal);
  await ready(p,3500);await p.screenshot({path:path.join(__dirname,name+'-ink-letters.png')});
  await ready(p,6410);await p.screenshot({path:path.join(__dirname,name+'-ink-final.png')});
  ok(name+' final exact fill and ball merged',await p.locator('.champion-intro').evaluate(s=>[...s.querySelectorAll('.ink-seal')].every(x=>x.getAttribute('opacity')==='1')&&Number(s.querySelector('.writing-ball').style.opacity)===0));
  const boxes=await p.locator('.sketch-canvas').evaluate(s=>[s.querySelector('.sketch-golfer'),s.querySelector('.written-wordmark')].map(e=>e.getBoundingClientRect().toJSON()));ok(name+' drawing and logo fit',boxes.every(r=>r.left>=0&&r.top>=0&&r.right<=width&&r.bottom<=height),boxes);
  await p.locator('.champion-intro').waitFor({state:'detached'});
  ok(name+' original dashboard preserved',await p.locator('.brand-lockup img').evaluate(e=>getComputedStyle(e).animationName==='mark_hop'));
  if(name==='mobile'){
   await p.getByRole('button',{name:'Replay intro',exact:true}).click();await p.waitForSelector('.sketch-canvas');await p.locator('.champion-pause').click();const t=await p.locator('.champion-intro').getAttribute('data-elapsed');await p.waitForTimeout(250);ok('Pause freezes ball and ink clock',t===await p.locator('.champion-intro').getAttribute('data-elapsed'));
   const a=await new AxeBuilder({page:p}).include('.champion-intro').analyze();ok('intro axe',a.violations.length===0,a.violations.map(v=>({id:v.id,impact:v.impact})));
   await p.locator('.champion-skip').focus();await p.keyboard.press('Tab');ok('focus stays in intro',await p.locator('.champion-pause').evaluate(e=>e===document.activeElement));
   await p.keyboard.press('Escape');ok('Escape closes replay',await p.locator('.champion-intro').count()===0);
   await p.getByRole('button',{name:'Replay intro',exact:true}).click();await p.waitForSelector('.sketch-canvas');await p.getByRole('button',{name:'Skip intro',exact:true}).click();ok('Skip closes intro',await p.locator('.champion-intro').count()===0);
  }
  ok(name+' scripts and asset requests clean',errors.length===0&&failed.length===0,{errors,failed});await c.close();
 }
 const cc=await b.newContext({reducedMotion:'no-preference'}),cp=await cc.newPage();await cp.route('**/puttery-handdrawn-intro.svg',r=>r.abort());await cp.goto('http://127.0.0.1:65515/');await cp.waitForSelector('.pilot-intro');ok('missing drawing uses original fallback',await cp.locator('.pi-stamp').count()===1);await cc.close();
 const rc=await b.newContext({reducedMotion:'reduce'}),rp=await rc.newPage();await rp.goto('http://127.0.0.1:65515/');ok('reduced motion retains static dashboard',await rp.locator('.champion-intro,.pilot-intro').count()===0);await rc.close();await b.close();
 fs.writeFileSync(path.join(__dirname,'ink-checks.json'),JSON.stringify({checkedAt:new Date().toISOString(),checks},null,2));console.log(JSON.stringify({passed:checks.filter(c=>c.pass).length,total:checks.length,failures:checks.filter(c=>!c.pass)},null,2));if(checks.some(c=>!c.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
