from pathlib import Path
root=Path(r'C:/Users/dillo/Documents/Codex/projects/client-operations/clients/puttery-nyc/deliverables/2026-09-04-dashboard-motion-restored/public')
def change(s,a,b):
    if a not in s: raise ValueError('Expected source missing: '+a[:70])
    return s.replace(a,b,1)
s=(root/'index.html').read_text(encoding='utf-8')
s=change(s,'<button class="topbar-button" id="export-answers" type="button">Export answers</button>','') if '<button class="topbar-button" id="export-answers" type="button">Export answers</button>' in s else s
s=s.replace('aria-label="Mobile discovery readiness"','aria-label="Current build stage"').replace('<span>Discovery</span><strong id="mobile-readiness-percent">0%</strong>','<span>Build stage</span><strong id="mobile-build-stage">Reporting</strong>')
s=s.replace('<div class="mobile-score-track" aria-hidden="true"><span id="mobile-score-fill"></span></div>','')
s=s.replace('Continue integration discovery','What remains to finish').replace('every gate here is a real shot, not a status colour','Reservation reporting is live. Attribution is next.')
s=s.replace('aria-label="Pilot readiness summary"','aria-label="Verified build status"')
a=s.index('            <div class="scoreboard-head">'); b=s.index('            <p id="readiness-explainer">',a)
s=s[:a]+'''            <div class="scoreboard-head build-stage-head"><span>Current build stage</span><strong id="build-stage">Reporting</strong></div>
            <dl class="score-grid">
              <div><dt>Available now</dt><dd>Reservation reporting</dd></div>
              <div><dt>Connected source</dt><dd id="connected-systems">Checking Tock</dd></div>
              <div><dt>Next milestone</dt><dd id="current-gate">Tagged booking proof</dd></div>
              <div><dt>Revenue reporting</dt><dd>Validation pending</dd></div>
            </dl>
'''+s[b:]
s=s.replace('<a class="text-action" href="#discovery">What remains to finish</a>','<a class="text-action" href="#rollout">What remains to finish</a>')
a=s.index('          <div class="metric-scorecard"'); b=s.index('          <div class="aggregate-two-column">',a)
s=s[:a]+'''          <div class="metric-scorecard reservation-summary" aria-label="Reservation reporting summary">
            <div><span>Selected period</span><strong data-aggregate="records">Pending</strong><small>Distinct reservation records</small></div>
            <div><span>Imported history</span><strong data-aggregate="allRecords">Pending</strong><small>All dates, including future reservations</small></div>
            <div><span>Campaign attribution</span><strong>Pending</strong><small>Requires a verified tagged booking</small></div>
          </div>
          <p class="aggregate-note">Reservation records are not completed visits or attributed ad conversions. Revenue reporting remains pending validation.</p>
'''+s[b:]
a=s.index('          <div class="aggregate-module"><h3>Source reconciliation'); b=s.index('          <div class="pending-measures">',a)
s=s[:a]+'          <details class="aggregate-detail technical-details"><summary>Technical source checks and field availability</summary>\n'+s[a:b]+'          </details>\n'+s[b:]
s=s.replace('Discovery answers export separately from the header.','Implementation notes export separately below.')
a=s.index('          <div class="portfolio-later">'); b=s.index('        </section>',a)
s=s[:a]+s[b:]
s=s.replace('<h2 id="discovery-title">Integration discovery lab</h2>','<h2 id="discovery-title">Implementation notes</h2>')
s=s.replace('Work through every question with the client. Answers save only in this browser and can be exported as JSON for implementation planning.','Optional working notes for account access and implementation. These are browser notes, not the build status. Existing answers are preserved.')
a=s.index('            <div class="discovery-summary"'); b=s.index('          <div class="discovery-controls">',a)
s=s[:a]+'''          </div>
          <details id="implementation-notes" class="implementation-notes">
            <summary>Open the optional implementation worksheet</summary>
            <p id="discovery-summary-text">Saved notes stay in this browser.</p>
'''+s[b:]
needle='          <p id="empty-questions" class="empty-state" hidden>No questions match these filters. Clear a filter to continue.</p>'
s=change(s,needle,needle+'\n          </details>')
s=s.replace('<option value="resolved">Resolved</option>','<option value="resolved">Answer recorded</option>')
s=s.replace('<h2 id="rollout-title">Puttery pilot plan</h2>','<h2 id="rollout-title">Where the build stands</h2>')
s=s.replace('The sequence reduces risk before engineering and before any advertising decision is made from incomplete outcomes.','The reservation reporting MVP is live. Campaign attribution and validated revenue reporting are the two major capabilities still to complete.')
a=s.index('          <div class="phase-track">');b=s.index('          <div class="acceptance-board">',a)
s=s[:a]+'''          <div class="phase-track">
            <article><span>Built and operating</span><h3>Tock data connection</h3><p>Protected access, reservation webhooks, historical exports and automatic refresh are working.</p><strong>One source exception remains under review</strong></article>
            <article><span>Built and live</span><h3>Reservation reporting</h3><p>Live counts, service-date filters, trends and downloads are available on desktop and mobile.</p><strong>Current usable MVP</strong></article>
            <article><span>Next milestone</span><h3>Campaign attribution</h3><p>Verify the exact analytics and ad accounts, consent and one tagged booking from campaign to reservation.</p><strong>Needs access and end-to-end proof</strong></article>
            <article><span>Still to complete</span><h3>Validated revenue</h3><p>Connect the approved revenue sources, agree attendance and financial definitions, then reconcile before calculating ROAS.</p><strong>Needs source access and approved definitions</strong></article>
          </div>

'''+s[b:]
a=s.index('            <div class="commercial-scope">'); b=s.index('          </div>\n        </section>',a)
s=s[:a]+'''            <div class="commercial-scope"><h3>What determines completion</h3><p>The remaining work depends on verified account access, a controlled booking and approved source definitions. A completion percentage or calendar promise would hide those dependencies.</p></div>
'''+s[b:]
s=s.replace('Open the discovery lab','Open implementation notes').replace('Discovery lab</strong>','Implementation notes</strong>').replace('Answer every blocker','Optional working notes').replace('Pilot plan</strong>','Build status</strong>')
(root/'index.html').write_text(s,encoding='utf-8')
s=(root/'app.js').read_text(encoding='utf-8')
s=s.replace('          <span class="platform-progress">${resolved} of ${related.length} questions resolved</span>','')
s=s.replace('Review ${platform.name} questions','Review ${platform.name} notes')
s=s.replace('      document.querySelector("#discovery").scrollIntoView','      document.querySelector("#implementation-notes").open = true;\n      document.querySelector("#discovery").scrollIntoView')
s=s.replace('${resolved} of ${platformQuestions.length} resolved','${resolved} answers recorded')
a=s.index('function updateProgress() {');b=s.index('\nfunction exportAnswers()',a)
s=s[:a]+'''function updateProgress() {
  const recorded = questions.filter(q => answers[q.id]?.status && answers[q.id].status !== "unanswered").length;
  const operational = window.PUTTERY_OPERATIONAL_STATUS;
  const gate = operational?.currentGate || 'Source check pending';
  const set = (id,value) => { const node=document.getElementById(id); if(node) node.textContent=value; };
  set('build-stage','Reporting'); set('mobile-build-stage','Reporting');
  set('current-gate',gate); set('mobile-current-gate',gate);
  set('readiness-explainer','The reservation reporting MVP is built. Campaign attribution and validated revenue reporting are the two major capabilities still to complete.');
  set('discovery-summary-text',recorded ? `${recorded} worksheet answers recorded in this browser. These notes do not set the build status.` : 'No local worksheet answers recorded. The live build status is independent of these optional notes.');
  set('rail-progress','Reservation reporting'); set('rail-gate',gate);
  document.querySelector('.status-dot')?.classList.toggle('ready',operational?.liveFeed==='Connected');
}
'''+s[b:]
(root/'app.js').write_text(s,encoding='utf-8')
s=(root/'dashboard-data.js').read_text(encoding='utf-8').replace('const values = {...view,totalPriceField:','const values = {...view,allRecords:data.totals.reservationStates,totalPriceField:')
(root/'dashboard-data.js').write_text(s,encoding='utf-8')
print('Dashboard copy and structure updated')
