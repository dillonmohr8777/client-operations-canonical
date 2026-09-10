import fs from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {validateDashboard} from 'file:///C:/Users/dillo/Documents/Codex/worktrees/client-ops-claude-creative-factory-20260902/clients/puttery-nyc/deliverables/2026-09-01-tock-reservation-webhook/public-relay/lib/dashboard-schema.mjs';
const root='C:/Users/dillo/Documents/Codex/projects/client-operations/clients/puttery-nyc/deliverables/2026-09-04-dashboard-motion-restored/public',out='C:/Users/dillo/Documents/Codex/projects/client-operations/clients/puttery-nyc/deliverables/2026-09-08-tock-integration';
const base='https://nyc-entertainment-attribution-dashboard-20260804.netlify.app/';
const hash=b=>createHash('sha256').update(b).digest('hex');
const paths=['index.html','app.js','dashboard-data.js','integration-status.js','status.js','styles.css','tock-summary.json','source-verification.json'];
const files=await Promise.all(paths.map(async name=>{
 const r=await fetch(base+name,{cache:'no-store',signal:AbortSignal.timeout(20000)});
 const bytes=Buffer.from(await r.arrayBuffer());return{name,status:r.status,sha256:hash(bytes),matches:r.ok&&hash(bytes)===hash(fs.readFileSync(join(root,name)))};
}));
const api=await fetch('https://puttery-tock-relay.netlify.app/tock/dashboard',{signal:AbortSignal.timeout(15000)});
const data=await api.json();
const unauth=await fetch('https://puttery-tock-relay.netlify.app/tock/dashboard',{method:'POST',headers:{'content-type':'application/json'},body:'{}',signal:AbortSignal.timeout(15000)});
const downloadFiles=fs.readdirSync('C:/Users/dillo/Downloads').filter(n=>n.startsWith('puttery-reservation-aggregates-30d-2026-09-08')&&n.endsWith('.json'));
const downloaded=downloadFiles.map(n=>({name:n,data:JSON.parse(fs.readFileSync(join('C:/Users/dillo/Downloads',n),'utf8'))})).find(x=>x.data.source==='live');
const csvFiles=fs.readdirSync('C:/Users/dillo/Downloads').filter(n=>n.startsWith('puttery-reservation-aggregates-30d-2026-09-08')&&n.endsWith('.csv'));
const csv=csvFiles.map(n=>({name:n,body:fs.readFileSync(join('C:/Users/dillo/Downloads',n),'utf8')})).find(x=>x.body.includes('"source","live"'));
const passed=files.every(x=>x.matches)&&api.ok&&!!validateDashboard(data)&&unauth.status===401&&!!downloaded&&!!csv;
const receipt={checkedAt:new Date().toISOString(),passed,files,api:{status:api.status,schemaValid:!!validateDashboard(data),checkedAt:data.checkedAt,records:data.totals.reservationStates},unauthenticatedPostStatus:unauth.status,
 downloads:{json:downloaded?{filename:downloaded.name,source:downloaded.data.source,period:downloaded.data.period,records:downloaded.data.window.records,trendRows:downloaded.data.trend.length,definitions:!!downloaded.data.definitions}:null,
 csv:csv?{filename:csv.name,hasLiveSource:true,hasDefinitions:csv.body.includes('"definitions"'),hasSelectedRecords:csv.body.includes('"records","820"')}:null}};
fs.writeFileSync(join(out,'dashboard-full-release-check.json'),JSON.stringify(receipt,null,2));
fs.writeFileSync(join(out,'dashboard-aggregate-verification.json'),JSON.stringify(data,null,2));
console.log(JSON.stringify({passed,files:files.length,allFilesMatch:files.every(x=>x.matches),apiStatus:api.status,unauthenticatedPost:unauth.status,downloads:receipt.downloads}));
if(!passed)process.exitCode=1;
