const fs=require('fs'),path=require('path');
const {chromium}=require('C:/Users/dillo/Documents/Codex/2026-08-04/we-can-help-right-research-this-2/node_modules/@playwright/test');
const AxeBuilder=require('C:/Users/dillo/Documents/Codex/2026-08-04/we-can-help-right-research-this-2/node_modules/@axe-core/playwright').default;
const checks=[];const ok=(name,pass,details)=>checks.push({name,pass,details});
(async()=>{const browser=await chromium.launch({headless:true});
for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
 const context=await browser.newContext({viewport:{width,height},reducedMotion:'no-preference'});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:65515/',{waitUntil:'domcontentloaded'});
 ok(name+' original intro',await page.locator('.pilot-intro').count()===1);
 await page.waitForTimeout(450);await page.screenshot({path:path.join(__dirname,name+'-intro.png')});
 await page.locator('.pilot-intro').waitFor({state:'detached'});
 ok(name+' original headline',(await page.locator('#overview-title').textContent()).includes('Know which marketing creates booked guests'));
 ok(name+' logo moves',(await page.locator('.brand-lockup img').evaluate(e=>getComputedStyle(e).animationName))==='mark_hop');
 ok(name+' course ornaments',await page.locator('.hole-mark').count()>=7);
 ok(name+' original golf course asset',await page.locator('.course-band img').getAttribute('src')==='assets/higgsfield-course-band.svg');
 ok(name+' 69 questions',await page.locator('.question-item').count()===69);
 ok(name+' 10 sources',await page.locator('.platform-card').count()===10);
 ok(name+' current state',(await page.locator('#status-title').textContent())==='Reservation webhook receiving.');
 ok(name+' no overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:path.join(__dirname,name+'-overview.png')});
 await page.getByRole('button',{name:'Pause motion',exact:true}).click();
 ok(name+' explicit pause',await page.locator('.brand-lockup img').evaluate(e=>getComputedStyle(e).animationPlayState)==='paused');
 await page.getByRole('button',{name:'Resume motion',exact:true}).click();
 ok(name+' resume',await page.locator('.brand-lockup img').evaluate(e=>getComputedStyle(e).animationPlayState)==='running');
 await page.getByRole('button',{name:'Replay intro'}).click();ok(name+' replay',await page.locator('.pilot-intro').count()===1);await page.keyboard.press('Escape');await page.locator('.pilot-intro').waitFor({state:'detached'});
 await page.getByRole('button',{name:'Review Tock questions'}).click();ok(name+' filter',await page.locator('.question-item').count()===8);
 const first=page.locator('[data-answer-select]').first();await first.selectOption('yes');
 const note=page.locator('[data-answer-note]').first();await note.fill('Restoration QA');await note.blur();
 await page.reload();ok(name+' answers kept',await page.evaluate(()=>JSON.parse(localStorage.getItem('putteryPilotDiscoveryV2'))['tock-01'].note==='Restoration QA'));
 await page.getByRole('button',{name:'Reset view',exact:true}).click();ok(name+' reset preserves',await page.evaluate(()=>JSON.parse(localStorage.getItem('putteryPilotDiscoveryV2'))['tock-01'].status==='yes'));
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Export answers'}).click();const file=await download;const payload=JSON.parse(fs.readFileSync(await file.path(),'utf8'));ok(name+' export',payload.questions.length===69&&file.suggestedFilename()==='puttery-pilot-discovery-answers.json');
 await page.locator('#live-status').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(__dirname,name+'-status.png')});
 const axe=await new AxeBuilder({page}).analyze();ok(name+' axe',axe.violations.length===0,axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})));
 ok(name+' script errors',errors.length===0,errors);
 if(name==='desktop'){await page.setViewportSize({width:1265,height:714});ok('short-height sidebar footer flow',await page.evaluate(()=>document.querySelector('.rail-status').getBoundingClientRect().top>=document.querySelector('.section-rail nav').getBoundingClientRect().bottom));}
 await context.close();
}
const reduced=await browser.newContext({reducedMotion:'reduce'});const rp=await reduced.newPage();await rp.goto('http://127.0.0.1:65515/');ok('reduced-motion skips intro',await rp.locator('.pilot-intro').count()===0);ok('reduced-motion course stopped',await rp.locator('.hole-mark').first().evaluate(e=>[...e.querySelectorAll('*')].every(n=>getComputedStyle(n).animationName==='none')));await reduced.close();await browser.close();fs.writeFileSync(path.join(__dirname,'checks.json'),JSON.stringify({checkedAt:new Date().toISOString(),checks},null,2));console.log(JSON.stringify({passed:checks.filter(c=>c.pass).length,total:checks.length,failures:checks.filter(c=>!c.pass)},null,2));})().catch(e=>{console.error(e);process.exitCode=1});
