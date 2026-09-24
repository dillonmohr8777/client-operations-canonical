import fs from 'node:fs';
import vm from 'node:vm';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../2026-09-04-dashboard-motion-restored/public/',import.meta.url));
const data=JSON.parse(fs.readFileSync(join(process.env.LOCALAPPDATA,'Codex/ClientAccess/PutteryNYC',process.argv.includes('--local-only')?'tock-dashboard-staged.json':'tock-dashboard-latest.json'),'utf8'));
const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(join(root,'status.js'),'utf8'),sandbox);
const t=data.totals,fmt=n=>n.toLocaleString('en-US');
const old=sandbox.window.PUTTERY_OPERATIONAL_STATUS;
const state={...old,snapshotDate:data.checkedAt,
  snapshotLabel:new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',dateStyle:'long',timeStyle:'short'}).format(new Date(data.checkedAt))+' ET',
  currentGate:'Attribution validation',headline:'Reservation data connected.',
  summary:fmt(t.webhookStates)+' webhook reservation records and '+fmt(t.exportStates)+' export records feed '+fmt(t.reservationStates)+' distinct reservation states. '+(t.excludedRows ? fmt(t.excludedRows)+' row(s) remain outside normalized reservation counts.' : 'No export rows are held outside the reservation count.'),
  liveFeed:'Dated snapshot',liveFeedDetail:fmt(t.relayAcked)+' relay acknowledgements · '+t.relayPending+' pending',
  nextAction:'Prove a controlled tagged booking. Verify exact analytics and advertising accounts, consent, attendance and booking-value definitions. Reconcile the one delivery-counter difference.',
  dataBoundary:'Saved source snapshot; the page checks the live feed on load. Automatic processing requires the Windows host online. Reservation states are not completed visits, revenue or ad conversions.',
  tockConfirmed:'NYC business 37824 and group 28086 are verified. '+fmt(t.exportStates)+' states from '+t.exportFiles+' export files combine with webhook updates.',
  tockPending:'Walk-in identifier handling is confirmed. The latest export has '+fmt(t.excludedRows)+' excluded rows. Delivery-counter reconciliation, controlled-booking proof, consent and booking-value definitions remain pending.',
  receiverTests:'14 / 14',receiverTestsDetail:'Receiver checks · September 8',
  relayTests:'18 / 18',relayTestsDetail:'Existing relay checks · September 8',
  webhookState:'Dated snapshot',webhookDetail:fmt(t.webhookDeliveries)+' processed deliveries',
  exportState:data.exportStatus === 'synced' ? 'Snapshot · synced' : 'Snapshot · review',exportDetail:t.exportFiles+' files · '+fmt(t.exportStates)+' records',
  milestones:[
    {state:'complete',statusLabel:'Verified',label:'NYC source route',detail:'Business 37824 is bound to group 28086.'},
    {state:'current',statusLabel:'Dated snapshot',label:'Reservation sources',detail:fmt(t.reservationStates)+' combined reservation states at the stated check time; live refresh begins on page load.'},
    {state:'current',statusLabel:'Counts checked',label:'Source quality and attribution',detail:fmt(t.openConflicts)+' open conflicts; '+fmt(t.tieMismatches)+' equal-version mismatches; '+fmt(t.excludedRows)+' excluded export rows. Counter reconciliation, controlled-booking tracking, consent and approved value definitions remain.'}
  ]};
fs.writeFileSync(join(root,'status.js'),'window.PUTTERY_OPERATIONAL_STATUS = Object.freeze('+JSON.stringify(state,null,2)+');\n');
fs.writeFileSync(join(root,'tock-summary.json'),JSON.stringify(data,null,2)+'\n');
console.log(JSON.stringify({prepared:true,checkedAt:data.checkedAt,records:t.reservationStates}));
