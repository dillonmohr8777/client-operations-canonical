from pathlib import Path
import json,re,html
root=Path(__file__).resolve().parents[1]
s={
 'schemaVersion':1,
 'snapshotDate':'2026-09-04T23:03:21Z',
 'snapshotLabel':'September 4, 2026 · 7:03 PM ET',
 'productionState':'hold','stateLabel':'Reporting held','currentGate':'Reconciliation pending',
 'headline':'Reservation webhook receiving.',
 'summary':'NYC filtering is verified. Reconcile the received deliveries and confirm source access before turning this engineering progress into attribution reporting.',
 'readinessExplainer':'Webhook receipt is verified. Controlled-event confirmation, delivery reconciliation, export recovery, and the remaining source access still gate reporting.',
 'accountRoute':'NYC 37824','accountRouteDetail':'Business group 28086 · venue filter verified',
 'receiverTests':'13 / 13','receiverTestsDetail':'Receiver checks · September 4',
 'relayTests':'18 / 18','relayTestsDetail':'Relay checks · September 4',
 'liveFeed':'Receiving','liveFeedDetail':'Reservation webhook · not performance reporting',
 'nextAction':'Confirm the intended test event with Tock, reconcile relay-to-receiver delivery totals, and establish Data Exports recovery. Confirm web tracking and advertising account access next.',
 'dataBoundary':'Webhook health is engineering evidence. It does not prove completed visits, attributed revenue, or media conversions. Guest records stay outside this page.',
 'tockConfirmed':'Reservation webhook receipt and NYC business 37824 filtering were verified on September 4 at 7:03 PM ET. Delivery events include record updates and must not be counted as separate bookings.',
 'tockPending':'Controlled-event confirmation, delivery reconciliation, Data Exports recovery, the secure credential route, GA4 settings, and campaign-field preservation.',
 'milestones':[
  {'state':'complete','statusLabel':'Verified','label':'NYC route bound','detail':'Business group 28086 is filtered to Puttery NYC business 37824. Retained records in the inspected receiver use the NYC business ID.'},
  {'state':'complete','statusLabel':'Verified','label':'Local delivery checks','detail':'The receiver and relay passed their current 13 and 18 automated checks on September 4.'},
  {'state':'complete','statusLabel':'Receiving','label':'Reservation webhook','detail':'The public relay and local receiver were healthy and receiving on September 4. This is an engineering snapshot, not a live dashboard feed.'},
  {'state':'current','statusLabel':'Pending','label':'Reconcile deliveries','detail':'Confirm the intended test event with Tock, resolve the cumulative relay-to-receiver difference, and verify replay and export recovery.'},
  {'state':'waiting','statusLabel':'Access needed','label':'Tracking and source access','detail':'Confirm Data Exports, the website and tag container, GA4, Google Ads, Meta, and applicable event-system access for the NYC pilot.'},
  {'state':'locked','statusLabel':'Held','label':'Production reporting','detail':'Daily source totals, approved measurement definitions, consent, commercial readiness, and exact account mapping must pass before attribution or media feedback.'}
 ]
}
(root/'status.js').write_text('window.PUTTERY_OPERATIONAL_STATUS = Object.freeze('+json.dumps(s,indent=2)+');\n',encoding='utf-8')
h=(root/'index.html').read_text(encoding='utf-8')
for key,val in s.items():
 if isinstance(val,str):
  h=re.sub(r'(<[^>]+data-status-field="'+key+r'"[^>]*>).*?(</[^>]+>)',lambda m:m[1]+html.escape(val)+m[2],h,flags=re.S)
h=h.replace('<span>Production feed</span>','<span>Reservation webhook</span>')
h=h.replace('datetime="2026-09-04"','datetime="2026-09-04T23:03:21Z"')
items=''.join(f'<li class="{m["state"]}"><span class="milestone-marker">{i+1}</span><div><strong>{html.escape(m["label"])}</strong><p>{html.escape(m["detail"])}</p></div><span class="milestone-status">{m["statusLabel"]}</span></li>' for i,m in enumerate(s['milestones']))
h=re.sub(r'(<ol id="status-milestones"[^>]*>).*?(</ol>)',lambda m:m[1]+items+m[2],h,flags=re.S)
(root/'index.html').write_text(h,encoding='utf-8')
print('Dated engineering state updated; no delivery or booking counts are shown.')
