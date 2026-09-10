import {readFileSync,writeFileSync,renameSync,statSync} from 'node:fs';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {setTimeout as wait} from 'node:timers/promises';
import {readCombinedSnapshot} from './export-core.mjs';
import {buildDashboard} from './dashboard-core.mjs';
const schema=await import(pathToFileURL('C:/Users/dillo/Documents/Codex/worktrees/client-ops-claude-creative-factory-20260902/clients/puttery-nyc/deliverables/2026-09-01-tock-reservation-webhook/public-relay/lib/dashboard-schema.mjs'));
const root=join(process.env.LOCALAPPDATA,'Codex/ClientAccess/PutteryNYC');
const read=name=>JSON.parse(readFileSync(join(root,name),'utf8'));
function save(name,value){const p=join(root,name);writeFileSync(p+'.tmp',JSON.stringify(value,null,2));renameSync(p+'.tmp',p);}
async function requestJson(path,options={},code='request_failed'){
  for(let attempt=0;attempt<3;attempt++){
    try{
      const response=await fetch('https://puttery-tock-relay.netlify.app'+path,{...options,signal:AbortSignal.timeout(10000)});
      if(!response.ok)throw Object.assign(new Error(code),{status:response.status,retryable:response.status>=500||[408,429].includes(response.status)});
      return await response.json();
    }catch(error){if(error.retryable===false||attempt===2)throw error;await wait(1000*(attempt+1));}
  }
}
try{
  let latest;try{latest=read('tock-export-latest.json');}catch{throw new Error('export_refresh_not_verified');}
  let exp=latest;
  if(!['synced','synced_with_exclusions'].includes(exp.status)){
    try{exp=read('tock-export-last-good.json');}catch{throw new Error('export_refresh_not_verified');}
    if(!['synced','synced_with_exclusions'].includes(exp.status))throw new Error('export_refresh_not_verified');
  }
  const snapshotPath=join(root,'tock-export-snapshot.sqlite');
  const before=statSync(snapshotPath).mtimeMs;
  if(before>Date.parse(exp.completedAt??exp.checkedAt)+1000)throw new Error('export_metadata_mismatch');
  const snapshot=readCombinedSnapshot(snapshotPath,join(root,'tock-events.sqlite'));
  if(statSync(snapshotPath).mtimeMs!==before||snapshot.stats.exportStates!==exp.snapshotStates)throw new Error('export_metadata_mismatch');
  if(JSON.stringify(read('tock-export-latest.json'))!==JSON.stringify(latest))throw new Error('export_refresh_in_progress');
  if(!process.env.TOCK_RELAY_DRAIN_TOKEN)throw new Error('protected_credential_missing');
  const headers={Authorization:'Bearer '+process.env.TOCK_RELAY_DRAIN_TOKEN};
  const relay=await requestJson('/tock/health',{headers},'relay_health_failed');
  const dashboard=buildDashboard(snapshot,{...exp,latestAttemptStatus:['synced','synced_with_exclusions','failed'].includes(latest.status)?latest.status:'unavailable'},relay);
  if(!schema.validateDashboard(dashboard))throw new Error('aggregate_validation_failed');
  await requestJson('/tock/dashboard',{method:'POST',headers:{...headers,'content-type':'application/json'},body:JSON.stringify(dashboard)},'dashboard_publish_failed');
  const verified=await requestJson('/tock/dashboard',{},'dashboard_readback_failed');
  if(!schema.validateDashboard(verified)||JSON.stringify(verified)!==JSON.stringify(dashboard))throw new Error('dashboard_readback_mismatch');
  const t=dashboard.totals;
  const status={schemaVersion:1,businessId:'37824',checkedAt:dashboard.checkedAt,exportCheckedAt:dashboard.exportCheckedAt,
    exportStatus:dashboard.exportStatus,exportFiles:t.exportFiles,exportStates:t.exportStates,excludedRows:t.excludedRows,
    combinedStates:t.reservationStates,webhookStates:t.webhookStates,webhookDeliveries:t.webhookDeliveries,
    relayPending:t.relayPending,relayAcked:t.relayAcked,openConflicts:t.openConflicts,tieMismatches:t.tieMismatches,
    lastWebhookAt:snapshot.stats.latestWebhookAt};
  await requestJson('/tock/status',{method:'POST',headers:{...headers,'content-type':'application/json'},body:JSON.stringify(status)},'status_publish_failed');
  const checked=await requestJson('/tock/status',{},'status_readback_failed');
  if(Object.entries(status).some(([k,v])=>checked[k]!==v))throw new Error('status_readback_mismatch');
  save('tock-dashboard-latest.json',dashboard);save('tock-operational-latest.json',{...status,merge:snapshot.stats});
  if(['synced','synced_with_exclusions'].includes(latest.status))save('tock-export-last-good.json',latest);
  console.log(JSON.stringify({published:true,verified:true,checkedAt:dashboard.checkedAt,reservationStates:t.reservationStates,
    last30Days:dashboard.windows['30d'].records,last7Days:dashboard.windows['7d'].records,exportStatus:dashboard.exportStatus,excludedRows:t.excludedRows}));
}catch(error){
  const allowed=['export_refresh_not_verified','export_metadata_mismatch','export_refresh_in_progress','protected_credential_missing','relay_health_failed','wrong_venue','aggregate_validation_failed','dashboard_publish_failed','dashboard_readback_failed','dashboard_readback_mismatch','status_publish_failed','status_readback_failed','status_readback_mismatch'];
  console.log(JSON.stringify({published:false,errorType:error.name,errorCode:allowed.includes(error.message)?error.message:'operation_failed',httpStatus:error.status}));process.exitCode=1;
}finally{delete process.env.TOCK_RELAY_DRAIN_TOKEN;}
