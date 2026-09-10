(() => {
  'use strict';
  const endpoint = 'https://puttery-tock-relay.netlify.app/tock/dashboard';
  const count = value => Number.isSafeInteger(value) && value >= 0;
  const fmt = value => count(value) ? value.toLocaleString('en-US') : 'Pending';
  const text = (id, value) => { const node = document.getElementById(id); if (node) node.textContent = value; };
  const escape = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const fieldKeys = ['gclid','gbraid','wbraid','fbclid','fbc','fbp','utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
  const moneyLabels = {subtotalCents:'Subtotal',totalPriceCents:'Total price',netAmountPaidCents:'Net amount paid',amountDueCents:'Amount due',completedRefundCents:'Completed refund',paymentAmountCents:'Payment amount'};
  let loading = false;
  let period = '30d';
  let lastAttempt = null;
  const dashboard = window.PUTTERY_DASHBOARD = {data:null, source:null, refreshState:'loading', render, refresh};
  const dateOnly = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') && Number.isFinite(Date.parse(value));
  function timestamp(value) {
    const time = Date.parse(value);
    return Number.isFinite(time) ? new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'}).format(new Date(time)) : 'Unavailable';
  }
  function ageValid(value, limit) { const age = Date.now() - Date.parse(value); return Number.isFinite(age) && age >= -60000 && age <= limit; }
  function validate(data) {
    if (data?.schemaVersion !== 1 || data.businessId !== '37824' || data.businessGroupId !== '28086' || data.timeZone !== 'America/New_York'
      || !Number.isFinite(Date.parse(data.checkedAt)) || Date.parse(data.checkedAt) > Date.now() + 60000 || !dateOnly(data.today)) throw new Error('Invalid source scope or timestamp');
    for (const key of ['reservationStates','exportStates','webhookStates','exportOnly','webhookOnly','exportNewer','webhookNewer','equalVersions','openConflicts','tieMismatches','excludedRows','exportFiles','webhookDeliveries','relayPending','relayAcked']) {
      if (!count(data.totals?.[key])) throw new Error('Invalid total');
    }
    if (!Number.isSafeInteger(data.totals.ackDifference)) throw new Error('Invalid reconciliation difference');
    for (const key of ['serviceDateMissing','serviceDateMismatch','usdRecords','otherCurrencyRecords','unknownCurrencyRecords']) if (!count(data.coverage?.[key])) throw new Error('Invalid coverage');
    if (!count(data.calendar?.todayRecords) || !count(data.calendar?.futureRecords)) throw new Error('Invalid calendar');
    for (const key of ['7d','30d','all']) {
      const view = data.windows?.[key];
      if (!view || (!dateOnly(view.start) && view.start !== null) || (!dateOnly(view.end) && view.end !== null)) throw new Error('Invalid period');
      for (const name of ['records','recordsWithRecognizedKeys','amountEquationChecked','amountEquationMismatch']) if (!count(view[name])) throw new Error('Invalid period count');
      const allowed = ['start','end','records','keyPresence','recordsWithRecognizedKeys','financialFieldPresence','amountEquationChecked','amountEquationMismatch'];
      if (Object.keys(view).some(name => !allowed.includes(name))) throw new Error('Unexpected period field');
      for (const name of fieldKeys) if (!count(view.keyPresence?.[name])) throw new Error('Invalid campaign field');
      for (const name of Object.keys(moneyLabels)) if (!count(view.financialFieldPresence?.[name])) throw new Error('Invalid financial field');
    }
    for (const key of ['daily','monthly']) {
      if (!Array.isArray(data[key]) || data[key].length > 1200) throw new Error('Invalid trend');
      for (const row of data[key]) if (!/^\d{4}-\d{2}(-\d{2})?$/.test(row.date) || !count(row.records) || Object.keys(row).some(name => !['date','records'].includes(name))) throw new Error('Invalid trend row');
    }
    return data;
  }
  function selectedTrend() {
    const data = dashboard.data;
    const view = data.windows[period];
    return period === 'all' ? data.monthly : data.daily.filter(row => row.date >= view.start && row.date <= view.end);
  }
  function renderFreshness() {
    const data = dashboard.data;
    if (!data) {
      text('aggregate-state', loading ? 'Loading reservation aggregates' : 'Reservation data unavailable');
      text('aggregate-checked', loading ? 'Checking the live feed and saved snapshot…' : 'The live feed and saved snapshot could not be loaded. Use Refresh data to retry.');
      text('connected-systems','Verification pending');
      return;
    }
    const fresh = ageValid(data.checkedAt,15 * 60000);
    const exportFresh = ageValid(data.exportCheckedAt,36 * 60 * 60000) && ['synced','synced_with_exclusions'].includes(data.exportStatus);
    const offline = dashboard.refreshState === 'unavailable';
    const label = offline ? 'Refresh unavailable · last verified snapshot' : dashboard.source === 'saved' ? 'Saved snapshot · live refresh unavailable' : !fresh ? 'Stale source snapshot' : !exportFresh ? 'Webhook current · export refresh pending' : 'Live reservation aggregates';
    text('aggregate-state', label);
    text('aggregate-checked', `Source checked ${timestamp(data.checkedAt)}. Exports checked ${timestamp(data.exportCheckedAt)}.${lastAttempt ? ` Page checked ${timestamp(lastAttempt)}.` : ''}`);
    text('connected-systems', offline || !fresh || dashboard.source === 'saved' ? 'Tock · dated snapshot' : '1 · Tock');
    document.querySelector('.aggregate-status')?.classList.toggle('needs-review', offline || !fresh || !exportFresh || dashboard.source === 'saved');
  }
  function render(value) {
    if (['7d','30d','all'].includes(value)) period = value;
    renderFreshness();
    const data = dashboard.data;
    if (!data) return;
    const view = data.windows[period];
    text('aggregate-period', `${view.start || 'No start date'} through ${view.end || 'No end date'} · ${period === 'all' ? 'All service dates, including today and future reservations' : `Last ${period === '7d' ? 7 : 30} complete service days; today is excluded`} · America/New_York.`);
    const values = {...view,allRecords:data.totals.reservationStates,totalPriceField:view.financialFieldPresence.totalPriceCents,netPaidField:view.financialFieldPresence.netAmountPaidCents};
    document.querySelectorAll('[data-aggregate]').forEach(node => { node.textContent = fmt(values[node.dataset.aggregate]); });
    const rows = selectedTrend();
    const maximum = Math.max(1,...rows.map(row => row.records));
    text('trend-description', `${period === 'all' ? 'Monthly' : 'Daily'} reservation states. Vertical scale: 0 to ${fmt(maximum)}. Focus or point to a bar for exact counts.`);
    const chart = document.getElementById('reservation-trend');
    const activeDate = chart.contains(document.activeElement) ? document.activeElement.dataset.serviceDate : null;
    chart.replaceChildren();
    const bars = document.createElement('div');
    bars.className = 'trend-bars';
    for (const row of rows) {
      const bar = document.createElement('button');
      bar.type = 'button'; bar.className = 'trend-bar'; bar.dataset.serviceDate = row.date;
      bar.style.setProperty('--bar-height',`${row.records / maximum * 100}%`);
      const description = `${row.date}: ${fmt(row.records)} reservation states.`;
      bar.setAttribute('aria-label',description); bar.title = description;
      const fill = document.createElement('span'); fill.className = 'trend-bar-fill'; fill.setAttribute('aria-hidden','true'); bar.append(fill);
      const show = () => text('trend-inspect',description);
      bar.addEventListener('focus',show); bar.addEventListener('mouseenter',show); bar.addEventListener('click',show);
      bars.append(bar);
    }
    chart.append(bars);
    const axis = document.createElement('div'); axis.className = 'trend-axis';
    for (const label of [rows[0]?.date || '',rows[rows.length - 1]?.date || '']) { const node = document.createElement('span'); node.textContent = label; axis.append(node); }
    chart.append(axis);
    const inspect = document.createElement('p'); inspect.id = 'trend-inspect'; inspect.className = 'aggregate-note'; inspect.setAttribute('aria-live','polite');
    inspect.textContent = rows.length ? `${fmt(view.records)} reservation states across this selected service period.` : 'No dated reservation states in this period.'; chart.append(inspect);
    if (activeDate) [...bars.children].find(bar => bar.dataset.serviceDate === activeDate)?.focus({preventScroll:true});
    document.getElementById('trend-table').innerHTML = rows.map(row => `<tr><th scope="row">${escape(row.date)}</th><td>${fmt(row.records)}</td></tr>`).join('');
    text('selected-readiness',`${fmt(view.records)} distinct reservation states are available for the selected service period. ${fmt(view.recordsWithRecognizedKeys)} have at least one recognized campaign field name. Field presence alone does not establish usable values, consent or campaign attribution.`);
    const totals = data.totals;
    const quality = [
      ['Distinct reservation states',totals.reservationStates],['Export snapshot states',totals.exportStates],['Webhook snapshot states',totals.webhookStates],['Export only',totals.exportOnly],['Webhook only',totals.webhookOnly],['Export newer version',totals.exportNewer],['Webhook newer version',totals.webhookNewer],['Equal versions',totals.equalVersions],['Open conflicts',totals.openConflicts],['Equal-version mismatches',totals.tieMismatches],['Rows held outside reservations',totals.excludedRows],['Export files',totals.exportFiles],['Webhook deliveries',totals.webhookDeliveries],['Relay acknowledgements',totals.relayAcked],['Relay queue pending',totals.relayPending],['Delivery counter difference',totals.ackDifference],['Service date missing',data.coverage.serviceDateMissing],['Service date mismatch',data.coverage.serviceDateMismatch],['Today’s reservation states',data.calendar.todayRecords],['Future reservation states',data.calendar.futureRecords]
    ];
    document.getElementById('source-quality').innerHTML = quality.map(([label,value]) => `<div><dt>${escape(label)}</dt><dd>${Number.isSafeInteger(value) ? value.toLocaleString('en-US') : 'Pending'}</dd></div>`).join('');
    text('source-coverage',`Service coverage: ${data.coverage.earliestServiceDate || 'Unavailable'} to ${data.coverage.latestServiceDate || 'Unavailable'}. ${fmt(data.coverage.usdRecords)} USD records; ${fmt(data.coverage.otherCurrencyRecords)} other-currency records; ${fmt(data.coverage.unknownCurrencyRecords)} without a known currency. ${totals.excludedRows ? `${fmt(totals.excludedRows)} row(s) held outside the reservation count for source review. ` : ''}Delivery and acknowledgement counts include updates. ${totals.ackDifference ? 'Counter reconciliation is pending. The difference is relay acknowledgements minus processed deliveries and does not establish lost reservations. ' : ''}Version categories reconcile records, not new bookings.`);
    document.getElementById('campaign-fields').innerHTML = fieldKeys.map(key => `<tr><th scope="row">${key}</th><td>${fmt(view.keyPresence[key])}</td></tr>`).join('');
    document.getElementById('financial-fields').innerHTML = Object.entries(moneyLabels).map(([key,label]) => `<tr><th scope="row">${label}</th><td>${fmt(view.financialFieldPresence[key])}</td></tr>`).join('');
    text('campaign-readiness',`${fmt(view.recordsWithRecognizedKeys)} selected records contain at least one recognized campaign field name. Attribution reporting is pending a controlled tagged-booking and consent check.`);
    text('value-readiness',`${fmt(view.amountEquationChecked)} source amount-equation checks; ${fmt(view.amountEquationMismatch)} mismatches. These source consistency checks do not establish an approved revenue measure; no amounts are published.`);
    ['download-csv','download-json'].forEach(id => { document.getElementById(id).disabled = false; });
    document.dispatchEvent(new CustomEvent('puttery:dashboard'));
  }
  async function getData(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(),10000);
    try { const response = await fetch(url,{cache:'no-store',signal:controller.signal}); if (!response.ok) throw new Error('Source unavailable'); return validate(await response.json()); }
    finally { clearTimeout(timeout); }
  }
  async function refresh() {
    if (loading || document.hidden) return;
    loading = true;
    const button = document.getElementById('refresh-data');
    button.disabled = true; button.textContent = 'Refreshing…';
    try {
      const next = await getData(endpoint);
      if (dashboard.data && Date.parse(next.checkedAt) < Date.parse(dashboard.data.checkedAt)) throw new Error('Older snapshot');
      dashboard.data = next; dashboard.source = 'live'; dashboard.refreshState = 'loaded';
    } catch {
      dashboard.refreshState = 'unavailable';
      if (!dashboard.data) {
        try { dashboard.data = await getData('tock-summary.json'); dashboard.source = 'saved'; }
        catch { /* Keep unavailable values instead of inventing a baseline. */ }
      }
    } finally {
      lastAttempt = new Date().toISOString(); loading = false;
      button.disabled = false; button.textContent = 'Refresh data'; render();
    }
  }
  function download(kind) {
    const data = dashboard.data;
    if (!data) return;
    const payload = {schemaVersion:1,venue:'Puttery NYC',businessId:data.businessId,timeZone:data.timeZone,checkedAt:data.checkedAt,exportCheckedAt:data.exportCheckedAt,source:dashboard.source,refreshState:dashboard.refreshState,period,definitions:'Distinct latest reservation states by service date, not guests, verified visits or conversions. Attendance detail stays in protected source records. Field presence is not attribution, usable value or consent. Revenue remains pending.',window:data.windows[period],trend:selectedTrend(),totals:data.totals,coverage:data.coverage};
    let content = JSON.stringify(payload,null,2);
    if (kind === 'csv') {
      const rows = [['section','metric_or_service_date','value'],['metadata','checked_at',data.checkedAt],['metadata','export_checked_at',data.exportCheckedAt],['metadata','time_zone',data.timeZone],['metadata','source',dashboard.source],['metadata','refresh_state',dashboard.refreshState],['metadata','period',period],['metadata','start',payload.window.start],['metadata','end',payload.window.end],['metadata','definitions',payload.definitions]];
      for (const key of ['records','recordsWithRecognizedKeys','amountEquationChecked','amountEquationMismatch']) rows.push(['selected_period',key,payload.window[key]]);
      for (const [group,values] of Object.entries({campaign_field_presence:payload.window.keyPresence,financial_field_presence:payload.window.financialFieldPresence,all_history_ingestion:data.totals})) for (const [key,value] of Object.entries(values)) rows.push([group,key,value]);
      for (const row of payload.trend) rows.push(['trend',row.date,row.records]);
      content = rows.map(row => row.map(cell => `"${String(cell ?? '').replaceAll('"','""')}"`).join(',')).join('\r\n');
    }
    const url = URL.createObjectURL(new Blob([content],{type:kind === 'csv' ? 'text/csv;charset=utf-8' : 'application/json'}));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `puttery-reservation-aggregates-${period}-${data.today}.${kind}`; document.body.append(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url),1000);
    showFeedback(`Selected-period aggregate ${kind.toUpperCase()} downloaded.`);
  }
  async function loadSourceVerification() {
    try {
      const response = await fetch('source-verification.json',{cache:'no-store'});
      if (!response.ok) return;
      const evidence = await response.json();
      if (evidence.schemaVersion !== 1 || !Number.isFinite(Date.parse(evidence.checkedAt)) || Date.parse(evidence.checkedAt) > Date.now() + 60000 || !Array.isArray(evidence.sources)) return;
      for (const source of evidence.sources) {
        if (source.key === 'Tock') continue;
        const platform = platformDetails.find(item => item.key === source.key);
        if (!platform || !['ready','verify','gated'].includes(source.state)) continue;
        const card = [...document.querySelectorAll('.platform-card')].find(item => item.querySelector('h3')?.textContent === platform.name);
        for (const key of ['confirmed','unknown','fallback','stateLabel']) if (typeof source[key] === 'string' && source[key].length <= 2500) platform[key] = source[key];
        platform.state = source.state;
        if (card) {
          const label = card.querySelector('.platform-state'); label.textContent = platform.stateLabel; label.className = `platform-state ${platform.state}`;
          ['confirmed','unknown','fallback'].forEach((key,index) => { card.querySelectorAll('dd')[index].textContent = platform[key]; });
        }
      }
    } catch { /* Retain the explicit baseline pending evidence. */ }
  }
  document.addEventListener('DOMContentLoaded',() => {
    if (typeof ResizeObserver !== 'undefined') {
      const strip = document.querySelector('.truth-strip');
      new ResizeObserver(entries => { document.documentElement.style.setProperty('--truth-strip-height', `${entries[0].target.getBoundingClientRect().height}px`); }).observe(strip);
    }
    document.getElementById('refresh-data').addEventListener('click',() => { refresh(); document.dispatchEvent(new CustomEvent('puttery:refresh')); });
    document.getElementById('download-csv').addEventListener('click',() => download('csv'));
    document.getElementById('download-json').addEventListener('click',() => download('json'));
    refresh(); loadSourceVerification(); setInterval(() => { renderFreshness(); refresh(); },60000);
  });
  document.addEventListener('visibilitychange',() => { if (!document.hidden) refresh(); });
})();
