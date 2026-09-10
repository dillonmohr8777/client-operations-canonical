const fs=require('fs'),path=require('path');
const {chromium}=require('C:/Users/dillo/Documents/Codex/2026-08-04/we-can-help-right-research-this-2/node_modules/@playwright/test');
const checks=[];const ok=(name,pass,details)=>checks.push({name,pass,details});
const ready=async(p,t)=>p.waitForFunction(t=>Number(document.querySelector('.champion-intro')?.dataset.elapsed)>=t,t);
(async()=>{const browser=await chromium.launch({headless:true});
 for(const [name,width,height] of [['desktop',1280,720],['mobile',390,844]]){
  const c=await browser.newContext({viewport:{width,height},reducedMotion:'no-preference'}),p=await c.newPage();
  await p.goto('http://127.0.0.1:65515/',{waitUntil:'domcontentloaded'});await ready(p,600);await p.screenshot({path:path.join(__dirname,name+'-ink-putt.png')});
  ok(name+' no ink before ball arrives',await p.locator('.write-route').evaluateAll(es=>es.every(e=>getComputedStyle(e).opacity==='0')));
  await ready(p,1920);await p.screenshot({path:path.join(__dirname,name+'-ink-p.png')});
  ok(name+' unreached letters have no mask fragments',await p.locator('.write-route').evaluateAll(es=>es[0].style.opacity==='1'&&es.slice(1).every(e=>e.style.opacity==='0')));
  await ready(p,3500);await p.screenshot({path:path.join(__dirname,name+'-ink-letters.png')});
  await ready(p,6410);await p.screenshot({path:path.join(__dirname,name+'-ink-final.png')});
  ok(name+' clean exact finish',await p.locator('.champion-intro').evaluate(s=>[...s.querySelectorAll('.ink-seal')].every(e=>e.getAttribute('opacity')==='1')&&s.querySelector('.writing-ball').style.opacity==='0'));
  await c.close();
 }
 const dir=path.join(__dirname,'handdrawn-recording');fs.mkdirSync(dir,{recursive:true});
 const rc=await browser.newContext({viewport:{width:1280,height:720},reducedMotion:'no-preference',recordVideo:{dir,size:{width:1280,height:720}}});
 await rc.addInitScript(()=>{new MutationObserver(()=>{document.querySelector('.champion-intro')?.classList.add('export-intro')}).observe(document,{childList:true,subtree:true});});
 const rp=await rc.newPage(),video=rp.video();await rp.goto('http://127.0.0.1:65515/',{waitUntil:'domcontentloaded'});await ready(rp,6900);
 const final=await rp.locator('.champion-intro').evaluate(e=>({elapsed:Number(e.dataset.elapsed),phase:e.dataset.phase,controls:getComputedStyle(e.querySelector('.champion-intro-controls')).visibility}));ok('export ends on clean logo, no dashboard or controls',final.phase==='hold'&&final.controls==='hidden',final);await rc.close();const recording=await video.path();fs.writeFileSync(path.join(__dirname,'handdrawn-recording-path.txt'),recording);
 await browser.close();fs.writeFileSync(path.join(__dirname,'ink-confirm.json'),JSON.stringify({checkedAt:new Date().toISOString(),checks,recording,export:{captureAtElapsedMs:final.elapsed,intendedTrimStartSeconds:0.15,intendedEnd:'Final frame is a held exact logo, before dashboard dismissal.'}},null,2));console.log(JSON.stringify({passed:checks.filter(c=>c.pass).length,total:checks.length,recording,failures:checks.filter(c=>!c.pass)},null,2));if(checks.some(c=>!c.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
