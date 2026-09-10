(() => {
  'use strict';
  const endpoint = 'https://puttery-tock-relay.netlify.app/tock/status';
  const count = value => Number.isSafeInteger(value) && value >= 0;
  const fmt = value => count(value) ? value.toLocaleString('en-US') : 'Pending';
  const freshAt = (value, limit) => { const age = Date.now() - Date.parse(value); return Number.isFinite(age) && age >= -60000 && age <= limit; };
  let loading = false;
  function apply(data, options = {}) {
    if (!Number.isFinite(Date.parse(data.checkedAt)) || Date.parse(data.checkedAt) > Date.now() + 60000) return;
    const fromDashboard = options.dashboard === true;
    if (!fromDashboard && window.PUTTERY_DASHBOARD?.data) return;
    const fresh = freshAt(data.checkedAt,15 * 60000) && !options.offline;
    const exportFresh = freshAt(data.exportCheckedAt,36 * 60 * 60000);
    const exportsReady = ['synced','synced_with_exclusions'].includes(data.exportStatus) && exportFresh;
    const timestamp = new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',month:'long',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'}).format(new Date(data.checkedAt));
    const exclusion = data.excludedRows ? `${fmt(data.excludedRows)} row(s) held outside the reservation count for source review.` : 'No export rows are held outside the reservation count.';
    const counterNote = data.ackDifference ? 'Delivery counter reconciliation remains pending; the difference does not establish missing reservations.' : 'Delivery counters agree at the latest check.';
    const feedLabel = options.offline ? 'Refresh unavailable' : fresh ? 'Connected' : 'Stale snapshot';
    const exportLabel = data.exportStatus === 'failed' ? 'Refresh failed' : exportsReady ? (data.excludedRows ? 'Synced · review' : 'Synced') : 'Refresh pending';
    window.PUTTERY_OPERATIONAL_STATUS = Object.freeze({ ...window.PUTTERY_OPERATIONAL_STATUS,
      snapshotDate:data.checkedAt,snapshotLabel:timestamp,productionState:'hold',stateLabel:'Attribution pending',
      currentGate:!fresh ? 'Source refresh pending' : data.openConflicts || data.tieMismatches ? 'Source review pending' : 'Attribution validation',
      headline:!fresh ? 'Last verified reservation data.' : exportsReady ? 'Reservation data connected.' : 'Reservation webhook connected.',
      summary:`${fmt(data.webhookStates)} webhook reservation records and ${fmt(data.exportStates)} export records feed ${fmt(data.combinedStates)} distinct reservation states. ${exclusion}`,
      readinessExplainer:'Tock operating aggregates are connected. Campaign matching, attendance, booking value, consent and remaining platform access still need validation. Discovery answers are browser notes, not an integration completion score.',
      liveFeed:feedLabel,liveFeedDetail:`${fmt(data.relayAcked)} relay acknowledgements · ${fmt(data.relayPending)} pending`,
      nextAction:'Prove a controlled tagged booking through the exact website, GA4 and Tock route. Verify consent and advertising account access, then approve attendance and booking-value definitions. Reconcile the one delivery-counter difference.',
      dataBoundary:`${options.offline ? 'Live refresh is unavailable; dated evidence is shown.' : fresh ? 'The operating snapshot refreshes automatically.' : 'The source snapshot is over 15 minutes old.'} Records include historical and future reservations and updates. They are not completed visits, revenue or advertising conversions. Automatic processing requires the Windows host online.`,
      tockConfirmed:`NYC business 37824 is bound to group 28086. The latest complete export snapshot contains ${fmt(data.exportStates)} reservation states across ${fmt(data.exportFiles)} files. Combined export and webhook versions yield ${fmt(data.combinedStates)} distinct reservation states.`,
      tockPending:`Walk-in identifier handling is confirmed. The latest export has ${fmt(data.excludedRows)} excluded rows. ${counterNote} Campaign-field preservation, consent, native GA4 and value definitions remain pending.`,
      webhookState:feedLabel,webhookDetail:`${fmt(data.webhookDeliveries)} processed deliveries`,
      exportState:exportLabel,exportDetail:`${fmt(data.exportFiles)} files · ${fmt(data.exportStates)} reservation records`,
      attributionState:'Pending',attributionDetail:'Tracked booking and value validation',
      milestones:[
        {state:'complete',statusLabel:'Verified',label:'NYC source route',detail:'Business group 28086 is filtered to Puttery NYC business 37824 across webhook and export ingestion.'},
        {state:fresh?'complete':'current',statusLabel:feedLabel,label:'Reservation webhook',detail:`${fmt(data.webhookStates)} reservation states from ${fmt(data.webhookDeliveries)} deliveries. ${fmt(data.relayPending)} are queued at the latest check.`},
        {state:exportsReady?'complete':'current',statusLabel:exportLabel,label:'Daily export recovery',detail:`${fmt(data.exportStates)} reservation states from ${fmt(data.exportFiles)} files. Failed refreshes retain the last complete snapshot.`},
        {state:'current',statusLabel:data.openConflicts || data.tieMismatches ? 'Review' : 'Counts checked',label:'Source quality',detail:`${fmt(data.openConflicts)} open conflicts; ${fmt(data.tieMismatches)} equal-version mismatches. ${exclusion} ${counterNote}`},
        {state:'current',statusLabel:'Pending',label:'Tracking and source access',detail:'Confirm the controlled booking, website tags, GA4, Google Ads and Meta accounts for the NYC pilot.'},
        {state:'locked',statusLabel:'Pending',label:'Attribution and revenue',detail:'Approved attendance and booking-value definitions, consent, finance reconciliation and exact advertising accounts are required before campaign attribution or media feedback.'}
      ]
    });
    renderOperationalStatus();
    renderPlatforms();
    updateProgress();
  }
  function applyDashboard() {
    const dashboard = window.PUTTERY_DASHBOARD;
    if (!dashboard?.data) return;
    const data = dashboard.data;
    apply({...data,...data.totals,combinedStates:data.totals.reservationStates},{dashboard:true,offline:dashboard.refreshState === 'unavailable' || dashboard.source !== 'live'});
  }
  async function refresh() {
    if (loading || document.hidden) return;
    if (window.PUTTERY_DASHBOARD?.data) { applyDashboard(); return; }
    loading = true;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(),10000);
    try {
      const response = await fetch(endpoint,{cache:'no-store',signal:controller.signal});
      if (!response.ok) throw new Error('unavailable');
      const data = await response.json();
      if (data.schemaVersion !== 1 || data.businessId !== '37824' || !Number.isFinite(Date.parse(data.checkedAt)) || Date.parse(data.checkedAt) > Date.now() + 60000
        || !['synced','synced_with_exclusions','failed','unavailable'].includes(data.exportStatus)
        || !['relayAcked','relayPending','webhookStates','webhookDeliveries','combinedStates','exportFiles','exportStates','excludedRows','openConflicts','tieMismatches'].every(key => count(data[key]))) throw new Error('invalid_status');
      apply(data);
    } catch {
      if (window.PUTTERY_DASHBOARD?.data) { applyDashboard(); return; }
      window.PUTTERY_OPERATIONAL_STATUS = Object.freeze({...window.PUTTERY_OPERATIONAL_STATUS,
        headline:'Last verified reservation data.',currentGate:'Source refresh pending',
        liveFeed:'Refresh unavailable',liveFeedDetail:'Dated snapshot only',webhookState:'Refresh unavailable',exportState:'Refresh unverified',
        dataBoundary:'Live status could not be reached. Dated evidence is shown; use Refresh data to retry. Attribution and revenue remain pending validation.'});
      renderOperationalStatus(); renderPlatforms(); updateProgress();
    } finally { clearTimeout(timer); loading = false; }
  }
  document.addEventListener('puttery:dashboard',applyDashboard);
  document.addEventListener('puttery:refresh',refresh);
  document.addEventListener('DOMContentLoaded',() => { refresh(); setInterval(refresh,60000); });
  document.addEventListener('visibilitychange',() => { if (!document.hidden) refresh(); });
})();
