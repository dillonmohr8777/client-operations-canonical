import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {buildDashboard,calendarDate} from './dashboard-core.mjs';
const {validateDashboard}=await import(pathToFileURL('C:/Users/dillo/Documents/Codex/worktrees/client-ops-claude-creative-factory-20260902/clients/puttery-nyc/deliverables/2026-09-01-tock-reservation-webhook/public-relay/lib/dashboard-schema.mjs'));
const now='2026-09-08T17:00:00.000Z';
const make=(date,patch={})=>({row:{safe_summary_json:JSON.stringify({businessId:'37824',currency:'USD',serviceDateTime:date,
  lifecycle:{isCancelled:false,transferredOut:false,partyState:'EXPECTED'},amounts:{totalPriceCents:100,netAmountPaidCents:80,amountDueCents:20},
  keyValueNames:[],...patch})}});
const snapshot={rows:[make('2026-08-31T23:00'),make('2026-09-01T00:00',{lifecycle:{isCancelled:true,partyState:'CANCELLED'}}),
  make('2026-09-07T20:00',{lifecycle:{isCancelled:false,partyState:'LEFT'},keyValueNames:['utm_source','utm_source','gclid'],payments:{count:1}}),
  make('2026-09-08T10:00'),make('2026-09-09T10:00'),make(null),
  make('2026-09-02T10:00',{serviceStartAt:'2026-09-03T14:00:00Z',amounts:{totalPriceCents:100,netAmountPaidCents:80,amountDueCents:99}}),
  make('2026-02-30T10:00',{serviceStartAt:'2026-09-04T03:59:00Z',lifecycle:{isCancelled:false,partyState:'NO_SHOW'}})],
  stats:{combinedStates:8,exportStates:8,liveStates:0,exportOnly:8,liveOnly:0,exportNewer:0,liveNewer:0,matched:0,
    openConflicts:0,normalizedMismatch:0,webhookDeliveries:0}};
const exp={status:'synced_with_exclusions',businessId:'37824',businessGroupId:'28086',completedAt:now,invalid:1,exportFiles:1};
const relay={venue:'37824',ok:true,pending:0,acked:1};
const d=buildDashboard(snapshot,exp,relay,now);
assert.ok(validateDashboard(d,Date.parse(now)));assert.equal(d.windows.all.records,8);assert.equal(d.windows['30d'].records,5);assert.equal(d.windows['7d'].records,4);
assert.equal(Object.hasOwn(d.windows.all,'sourceStates'),false);assert.equal(Object.hasOwn(d.daily[0],'cancelled'),false);
assert.equal(d.windows['7d'].keyPresence.utm_source,1);assert.equal(d.windows['7d'].recordsWithRecognizedKeys,1);
assert.equal(d.windows.all.amountEquationChecked,8);assert.equal(d.windows.all.amountEquationMismatch,1);
assert.equal(d.coverage.serviceDateMissing,1);assert.equal(d.coverage.serviceDateMismatch,1);assert.equal(d.calendar.todayRecords,1);assert.equal(d.calendar.futureRecords,1);
assert.equal(d.daily.find(v=>v.date==='2026-09-03').records,1);assert.equal(calendarDate('2026-02-30'),null);
assert.equal(d.totals.ackDifference,1);
for(const mutate of [x=>x.guest={email:'private@example.test'},x=>x.windows.all.financialFieldPresence.totalPriceCents='123',
  x=>x.windows.all.keyPresence.secret=1,x=>x.daily[0].reservationId='123',x=>x.windows.all.records++,x=>x.totals.reservationStates++,
  x=>x.businessId='999',x=>x.checkedAt='2027-01-01T00:00:00Z',x=>x.daily.reverse(),x=>x.monthly.push(x.monthly[0]),
  x=>x.daily[0].noShow=1,x=>x.windows.all.sourceStates={LEFT:1}]){
  const bad=structuredClone(d);mutate(bad);assert.equal(validateDashboard(bad,Date.parse(now)),null);
}
assert.throws(()=>buildDashboard(snapshot,{...exp,status:'failed'},relay,now),/not_verified/);
const lastGood=buildDashboard(snapshot,{...exp,latestAttemptStatus:'failed'},relay,now);
assert.equal(lastGood.exportStatus,'failed');assert.equal(lastGood.totals.excludedRows,1);assert.ok(validateDashboard(lastGood,Date.parse(now)));
console.log(JSON.stringify({passed:true,coverage:['service-day-window','today-and-future-separation','timezone-midnight','invalid-date-fallback',
  'no-public-lifecycle-breakdowns','unique-key-name-count','amount-presence-and-equation','merge-grain','strict-nested-privacy-schema','failed-attempt-retains-last-good-exclusions']}));
