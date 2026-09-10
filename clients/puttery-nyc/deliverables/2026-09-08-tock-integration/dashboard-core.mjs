// Aggregates only. No identifiers, guest fields, click values, or monetary totals leave this module.
import {pathToFileURL} from 'node:url';
const schemaUrl=pathToFileURL('C:/Users/dillo/Documents/Codex/worktrees/client-ops-claude-creative-factory-20260902/clients/puttery-nyc/deliverables/2026-09-01-tock-reservation-webhook/public-relay/lib/dashboard-schema.mjs');
export const {TRACKING_KEYS,AMOUNT_FIELDS}=await import(schemaUrl);
const zonedDay = new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York'});
const zeroes = names => Object.fromEntries(names.map(name=>[name,0]));
const validAmount = value => Number.isSafeInteger(value) && value >= 0;
export function calendarDate(value) {
  const date=typeof value==='string' && /^\d{4}-\d{2}-\d{2}(?:T|$)/.test(value)?value.slice(0,10):null;
  if(!date) return null;
  const stamp=Date.parse(date+'T12:00:00Z');
  return Number.isFinite(stamp)&&new Date(stamp).toISOString().slice(0,10)===date?date:null;
}
const offset = (day,days) => new Date(Date.parse(day+'T12:00:00Z')+days*86400000).toISOString().slice(0,10);
function windowBucket(start,end) {
  return {start,end,records:0,keyPresence:zeroes(TRACKING_KEYS),recordsWithRecognizedKeys:0,
    financialFieldPresence:zeroes(AMOUNT_FIELDS),amountEquationChecked:0,amountEquationMismatch:0};
}
function countRecord(bucket,summary) {
  bucket.records++;
  const names=new Set(Array.isArray(summary.keyValueNames)?summary.keyValueNames:[]);
  let recognized=false;
  for(const key of TRACKING_KEYS) if(names.has(key)){bucket.keyPresence[key]++;recognized=true;}
  if(recognized) bucket.recordsWithRecognizedKeys++;
  const amounts=summary.amounts??{};
  for(const key of AMOUNT_FIELDS) if(validAmount(amounts[key])) bucket.financialFieldPresence[key]++;
  if(['totalPriceCents','netAmountPaidCents','amountDueCents'].every(k=>validAmount(amounts[k]))) {
    bucket.amountEquationChecked++;
    if(amounts.totalPriceCents-amounts.netAmountPaidCents!==amounts.amountDueCents) bucket.amountEquationMismatch++;
  }
}
function countTrend(bucket) {
  bucket.records++;
}
const trendBucket=date=>({date,records:0});
export function buildDashboard(snapshot,exportReceipt,relay,checkedAt=new Date().toISOString()) {
  if(!['synced','synced_with_exclusions'].includes(exportReceipt.status)) throw new Error('export_refresh_not_verified');
  if(exportReceipt.businessId!=='37824'||exportReceipt.businessGroupId!=='28086'||String(relay.venue)!=='37824'||!relay.ok) throw new Error('wrong_venue');
  const asOf=new Date(checkedAt);if(!Number.isFinite(asOf.getTime()))throw new Error('invalid_timestamp');
  const today=zonedDay.format(asOf), end=offset(today,-1);
  const windows={'7d':windowBucket(offset(today,-7),end),'30d':windowBucket(offset(today,-30),end),'all':windowBucket(null,null)};
  const daily=Array.from({length:30},(_,i)=>trendBucket(offset(today,i-30)));
  const dailyMap=new Map(daily.map(d=>[d.date,d]));
  const monthly=new Map();
  const coverage={earliestServiceDate:null,latestServiceDate:null,serviceDateMissing:0,serviceDateMismatch:0,
    usdRecords:0,otherCurrencyRecords:0,unknownCurrencyRecords:0};
  const calendar={todayRecords:0,futureRecords:0};
  for(const entry of snapshot.rows) {
    const s=JSON.parse(entry.row.safe_summary_json);
    if(s.businessId!=='37824')throw new Error('wrong_venue');
    const direct=calendarDate(s.serviceDateTime);
    const timestamp=typeof s.serviceStartAt==='string'?Date.parse(s.serviceStartAt):NaN;
    const fromTimestamp=Number.isFinite(timestamp)?zonedDay.format(new Date(timestamp)):null;
    if(direct&&fromTimestamp&&direct!==fromTimestamp)coverage.serviceDateMismatch++;
    const day=direct??fromTimestamp;
    countRecord(windows.all,s);
    if(s.currency==='USD')coverage.usdRecords++;else if(s.currency)coverage.otherCurrencyRecords++;else coverage.unknownCurrencyRecords++;
    if(!day){coverage.serviceDateMissing++;continue;}
    if(!coverage.earliestServiceDate||day<coverage.earliestServiceDate)coverage.earliestServiceDate=day;
    if(!coverage.latestServiceDate||day>coverage.latestServiceDate)coverage.latestServiceDate=day;
    if(day===today)calendar.todayRecords++;else if(day>today)calendar.futureRecords++;
    for(const key of ['7d','30d'])if(day>=windows[key].start&&day<=windows[key].end)countRecord(windows[key],s);
    if(dailyMap.has(day))countTrend(dailyMap.get(day),s);
    const month=day.slice(0,7);if(!monthly.has(month))monthly.set(month,trendBucket(month));
    countTrend(monthly.get(month),s);
  }
  windows.all.start=coverage.earliestServiceDate;windows.all.end=coverage.latestServiceDate;
  const s=snapshot.stats;
  if(windows.all.records!==s.combinedStates)throw new Error('snapshot_count_mismatch');
  return {schemaVersion:1,businessId:'37824',businessGroupId:'28086',timeZone:'America/New_York',checkedAt,
    exportCheckedAt:exportReceipt.completedAt??exportReceipt.checkedAt,exportStatus:exportReceipt.latestAttemptStatus??exportReceipt.status,today,
    totals:{reservationStates:s.combinedStates,exportStates:s.exportStates,webhookStates:s.liveStates,
      exportOnly:s.exportOnly,webhookOnly:s.liveOnly,exportNewer:s.exportNewer,webhookNewer:s.liveNewer,
      equalVersions:s.matched,openConflicts:s.openConflicts,tieMismatches:s.normalizedMismatch,
      excludedRows:exportReceipt.invalid??0,exportFiles:exportReceipt.exportFiles,webhookDeliveries:s.webhookDeliveries,
      relayPending:relay.pending,relayAcked:relay.acked,ackDifference:relay.acked-s.webhookDeliveries},
    coverage,windows,daily,monthly:[...monthly.values()].sort((a,b)=>a.date.localeCompare(b.date)),calendar};
}
