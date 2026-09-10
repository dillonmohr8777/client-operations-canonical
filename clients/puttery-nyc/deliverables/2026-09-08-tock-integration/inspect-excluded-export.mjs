// Read-only vendor diagnostic. Reuses the production parser and validator; no guest data is saved.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { parseSourceJson, isNYC } from './export-core.mjs';
const runtime='C:/Users/dillo/Documents/Codex/worktrees/client-ops-claude-creative-factory-20260902/clients/puttery-nyc/deliverables/2026-09-01-tock-reservation-webhook';
const {summarizeReservation,hashPayload}=await import(pathToFileURL(runtime+'/receiver/src/tock.mjs'));
const report={checkedAt:new Date().toISOString(),businessId:'37824',businessGroupId:'28086',files:[],excluded:[],guestDataPersisted:false,signedUrlsPersisted:false};
const sha=s=>createHash('sha256').update(s).digest('hex');
async function read(url,headers={}) {
  const r=await fetch(url,{headers,redirect:'error',signal:AbortSignal.timeout(90000)});
  if(!r.ok) throw Object.assign(new Error('http_failure'),{status:r.status});
  const raw=await r.text(); if(raw.length>150_000_000) throw new Error('too_large');
  return {rows:parseSourceJson(raw),fileSha256:sha(raw),lastModified:r.headers.get('last-modified')};
}
try {
  if(!process.env.TOCK_EXPORT_API_KEY) throw new Error('missing_protected_credential');
  const listing=await read('https://api.exploretock.com/api/data/export/urls',{
    'X-Tock-Authorization':process.env.TOCK_EXPORT_API_KEY,
    'X-Tock-Scope':JSON.stringify({businessId:'37824',businessGroupId:'28086'}),
    'User-Agent':'Momentum360-PutteryNYC-Attribution/1.0'});
  delete process.env.TOCK_EXPORT_API_KEY;
  const urls=listing.rows.result?.reservationDataUrls;
  if(!Array.isArray(urls)||!urls.length||urls.length>100) throw new Error('invalid_listing');
  for(let f=0;f<urls.length;f++) {
    const u=new URL(urls[f]);
    if(u.protocol!=='https:'||!(u.hostname==='storage.googleapis.com'||u.hostname.endsWith('.storage.googleapis.com'))) throw new Error('unexpected_host');
    const filename=decodeURIComponent(u.pathname.split('/').at(-1));
    const {rows,fileSha256,lastModified}=await read(u);
    if(!Array.isArray(rows)||rows.length>5000) throw new Error('invalid_shape');
    const file={fileNumber:f+1,filename,lastModified,fileSha256,rows:rows.length};
    report.files.push(file);
    for(let i=0;i<rows.length;i++) {
      const row=rows[i]; if(!isNYC(row)) throw new Error('wrong_venue');
      try {summarizeReservation(row,hashPayload(row));} catch(error) {
        const reason=/missing a valid uint64 (id|business.id|versionId)/.exec(error.message)?.[1]??'invalid_shape';
        const fields={};
        for(const k of ['partySize','guestCount','numberOfGuests','size','sequenceId','serviceDateTimestamp','createdTimestamp','lastUpdatedTimestamp']) if(typeof row[k]==='number'&&Number.isSafeInteger(row[k])) fields[k]=row[k];
        if(typeof row.dateTime==='string'&&/^[0-9T: .+Z-]{1,60}$/.test(row.dateTime)) fields.dateTime=row.dateTime;
        if(typeof row.partyState==='string'&&/^[A-Za-z_ ]{1,50}$/.test(row.partyState)) fields.partyState=row.partyState;
        report.excluded.push({...file,arrayIndex:i,recordNumber:i+1,reason,topLevelFields:Object.keys(row),
          idPresent:Object.hasOwn(row,'id'),idType:typeof row.id,idNumericValue:/^[0-9]{1,30}$/.test(String(row.id))?String(row.id):null,
          versionId:/^[0-9]{1,30}$/.test(String(row.versionId))?String(row.versionId):null,
          walkinId:/^[0-9]{1,30}$/.test(String(row.walkinId))?String(row.walkinId):null,
          isCancelled:typeof row.isCancelled==='boolean'?row.isCancelled:null,fields,recordSha256:hashPayload(row)});
      }
    }
    console.log(JSON.stringify({fileNumber:f+1,rows:rows.length,excludedSoFar:report.excluded.length}));
  }
  report.completedAt=new Date().toISOString();report.status='verified';
  const privateRoot=join(process.env.LOCALAPPDATA,'Codex/ClientAccess/PutteryNYC/vendor-diagnostics/2026-09-08');
  mkdirSync(privateRoot,{recursive:true});
  writeFileSync(join(privateRoot,'excluded-export-diagnostic.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify({status:report.status,files:report.files.length,excluded:report.excluded.length,protectedEvidenceSaved:true}));
}catch(e){console.log(JSON.stringify({status:'failed',type:e.name,httpStatus:e.status}));process.exitCode=1;}
finally{delete process.env.TOCK_EXPORT_API_KEY;}
