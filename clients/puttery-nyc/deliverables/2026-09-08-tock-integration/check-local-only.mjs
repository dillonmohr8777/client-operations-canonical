import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,existsSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {buildSnapshot} from './export-core.mjs';
const temp=mkdtempSync(join(tmpdir(),'puttery-local-check-'));
try {
  const root=join(temp,'Codex/ClientAccess/PutteryNYC');mkdirSync(root,{recursive:true});
  const stats=await buildSnapshot([[{id:'1',versionId:'1',business:{id:'37824',businessGroupId:'28086'},dateTime:'2026-09-01T12:00:00'}]],join(root,'tock-export-snapshot.sqlite'));
  writeFileSync(join(root,'tock-export-latest.json'),JSON.stringify({...stats,status:'synced',businessId:'37824',businessGroupId:'28086',completedAt:new Date().toISOString()}));
  const moduleUrl=new URL('./publish-dashboard-status.mjs',import.meta.url).href;
  const result=spawnSync(process.execPath,['--input-type=module','-e',`process.argv.push('--local-only');globalThis.fetch=async(url,options)=>{if(options.method && options.method!=='GET')throw new Error('WRITE_ATTEMPT');if(!url.endsWith('/tock/health'))throw new Error('UNEXPECTED_ROUTE');return {ok:true,json:async()=>({ok:true,venue:'37824',pending:0,acked:0})}};await import(${JSON.stringify(moduleUrl)});`],{env:{...process.env,LOCALAPPDATA:temp,TOCK_RELAY_DRAIN_TOKEN:'synthetic-test-only'},encoding:'utf8'});
  assert.equal(result.status,0,result.stdout+result.stderr);assert.match(result.stdout,/"published":false/);
  assert.equal(JSON.parse(readFileSync(join(root,'tock-dashboard-staged.json'))).totals.reservationStates,1);
  assert.equal(existsSync(join(root,'tock-dashboard-latest.json')),false);
  console.log(JSON.stringify({passed:true,checks:['GET-health-only','local-staging','published-receipt-untouched']}));
} finally { rmSync(temp,{recursive:true,force:true}); }
