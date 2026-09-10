const fs=require('node:fs'), path=require('node:path');
const {chromium}=require('C:/Users/dillo/Documents/Codex/2026-08-04/we-can-help-right-research-this-2/node_modules/@playwright/test');
const base=process.argv[2]||'http://127.0.0.1:56825/';
const live=!base.includes('127.0.0.1');
const accessRoot='C:/Users/dillo/AppData/Local/Codex/ClientAccess/PutteryNYC';
const statusFixture=JSON.parse(fs.readFileSync(path.join(accessRoot,'tock-operational-latest.json'),'utf8'));
const dashboardFixture=JSON.parse(fs.readFileSync(path.join(accessRoot,'tock-dashboard-latest.json'),'utf8'));
const fmt=value=>value.toLocaleString('en-US');
const checks=[]; const ok=(name,pass,detail)=>checks.push({name,pass,...(detail?{detail}:{})});
const statusUrl='https://puttery-tock-relay.netlify.app/tock/status';
const dashboardUrl='https://puttery-tock-relay.netlify.app/tock/dashboard';
(async()=>{
 const browser=await chromium.launch({headless:true});
 for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
  const page=await context.newPage();const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  if(!live){
   await page.route(statusUrl,route=>route.fulfill({json:statusFixture,headers:{'access-control-allow-origin':'*'}}));
   await page.route(dashboardUrl,route=>route.fulfill({json:dashboardFixture,headers:{'access-control-allow-origin':'*'}}));
  }
  const liveResponse=live?page.waitForResponse(r=>r.url()===dashboardUrl&&r.status()===200,{timeout:25000}):null;
  await page.goto(base,{waitUntil:'domcontentloaded'});
  if(liveResponse){
   const data=await (await liveResponse).json();
   await page.waitForFunction(date=>window.PUTTERY_DASHBOARD?.data?.checkedAt===date,data.checkedAt);
   ok(name+' live API readback matches rendered timestamp',true);
  }else await page.waitForFunction(date=>window.PUTTERY_DASHBOARD?.data?.checkedAt===date,dashboardFixture.checkedAt);
  await page.waitForFunction(()=>/^Reservation (data|webhook) connected\.$/.test(document.querySelector('#status-title')?.textContent||''),{timeout:25000});
  await page.waitForFunction(()=>[...document.querySelectorAll('.platform-card')].some(card=>card.querySelector('h3')?.textContent==='Tock walk-ins'&&card.querySelector('.platform-state')?.textContent==='Normalized'));
  const summary=await page.locator('[data-status-field="summary"]').first().textContent();
  const body=await page.locator('body').innerText();
  const walkin=page.locator('.platform-card').filter({hasText:'Tock walk-ins'});
  ok(name+' live operational source',/^Reservation (data|webhook) connected\.$/.test(await page.locator('#status-title').textContent()));
  ok(name+' zero excluded rows stated',summary.includes('No export rows are held outside the reservation count.'));
  ok(name+' current reservation count',summary.includes(fmt(dashboardFixture.totals.reservationStates)),summary);
  ok(name+' receiver suite count is current',(await page.locator('[data-status-field="receiverTests"]').first().textContent()).trim()==='14 / 14');
  ok(name+' walk-in identifier normalized',(await walkin.locator('.platform-state').textContent())==='Normalized'&&(await walkin.innerText()).includes('walkinId'));
  ok(name+' stale exception copy removed',!/(handling pending|excluded walk-in|one source exception remains|resolve the excluded walk-in)/i.test(body));
  ok(name+' owner map is explicit',(await page.locator('.owner-board article').count())===4&&body.includes('Joe · Meta routing')&&body.includes('Puttery platform owners'));
  ok(name+' unique aggregate period id',(await page.locator('#aggregate-period').count())===1);
  ok(name+' attribution remains pending',(await page.locator('#status-state').textContent()).includes('Attribution pending'));
  ok(name+' no overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  ok(name+' reduced motion skips intro',await page.locator('.pilot-intro').count()===0);
  ok(name+' 69 discovery questions retained',await page.locator('.question-item').count()===69);
  await page.keyboard.press('Tab');
  ok(name+' keyboard focus available',await page.evaluate(()=>document.activeElement!==document.body));
  ok(name+' no page errors',errors.length===0,errors.join(' | '));
  await page.locator('#next-action').scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(__dirname,`${live?'live':'local'}-${name}.png`),fullPage:true});
  if(!live&&name==='desktop'){
   const fallback=await page.evaluate(()=>window.PUTTERY_OPERATIONAL_STATUS);
   fs.writeFileSync(path.join(__dirname,'verified-status.json'),JSON.stringify(fallback,null,2));
   await page.unroute(statusUrl);await page.unroute(dashboardUrl);
   await page.route(statusUrl,route=>route.abort());await page.route(dashboardUrl,route=>route.abort());
   await page.reload();
   await page.waitForFunction(()=>window.PUTTERY_OPERATIONAL_STATUS.liveFeed==='Refresh unavailable');
   ok('offline preserves explicit dated fallback',await page.locator('[data-status-field="liveFeed"]').first().textContent()==='Refresh unavailable');
   ok('offline fallback retains current normalized count',(await page.locator('[data-status-field="summary"]').first().textContent()).includes(fmt(dashboardFixture.totals.reservationStates)));
   await page.unroute(statusUrl);await page.unroute(dashboardUrl);
   const staleStatus={...statusFixture,checkedAt:new Date(Date.now()-3600000).toISOString()};
   const staleDashboard={...dashboardFixture,checkedAt:staleStatus.checkedAt};
   await page.route(statusUrl,route=>route.fulfill({json:staleStatus,headers:{'access-control-allow-origin':'*'}}));
   await page.route(dashboardUrl,route=>route.fulfill({json:staleDashboard,headers:{'access-control-allow-origin':'*'}}));
   await page.reload();
   await page.waitForFunction(()=>window.PUTTERY_OPERATIONAL_STATUS.liveFeed==='Stale snapshot');
   ok('stale status marked',await page.locator('[data-status-field="liveFeed"]').first().textContent()==='Stale snapshot');
  }
  await context.close();
 }
 await browser.close();
 const result={checkedAt:new Date().toISOString(),base,localCorsOverride:!live,passed:checks.every(c=>c.pass),checks};
 fs.writeFileSync(path.join(__dirname,`${live?'live':'local'}-browser-check.json`),JSON.stringify(result,null,2));
 console.log(JSON.stringify(result));if(!result.passed)process.exitCode=1;
})().catch(error=>{console.log(JSON.stringify({passed:false,error:error.message.slice(0,500)}));process.exitCode=1;});
