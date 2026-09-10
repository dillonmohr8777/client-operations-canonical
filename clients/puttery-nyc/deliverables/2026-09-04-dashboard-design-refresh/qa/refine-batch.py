from pathlib import Path
import re,json
root=Path(__file__).resolve().parents[1]
h=(root/'index.html').read_text(encoding='utf-8')
s=json.loads((root/'status.js').read_text().split('Object.freeze(',1)[1].rsplit(');',1)[0])
s.update({'venueScope':'New York City','venueDetail':'One venue · location filter verified','webhookState':'Receiving','webhookDetail':'Dated engineering evidence','exportState':'Pending','exportDetail':'Access and recovery to confirm','attributionState':'Pending','attributionDetail':'Reconciliation before reporting'})
s['milestones'][1]={'state':'complete','statusLabel':'Documented','label':'Local test baseline','detail':'The source package records 13 receiver checks and 18 relay checks. These are the existing engineering test baseline, separate from the current health readback.'}
idx=h.index('<div class="hero-actions">')
end=h.index('</div>',idx)+6
h=h[:end]+'<a class="mobile-progress-link" href="#discovery"><span data-icon="checklist"></span>Discovery worksheet <strong id="mobile-summary-count">0 of 69 resolved</strong><span data-icon="arrow"></span></a>'+h[end:]
a=h.index('        <section id="live-status"');b=h.index('        <section class="route-section ')
part=h[a:b]
head=part[:part.index('          <div class="status-scorecard"')]
next_start=part.index('<div class="status-next"');next_end=part.index('</div>',next_start)+6
next_action=part[next_start:next_end]
launch_start=part.index('<details class="launch-details"');launch_end=part.index('</details>',launch_start)+10
launch=part[launch_start:launch_end]
launch=re.sub(r'(<strong>Local delivery checks</strong><p>).*?(</p>)',lambda m:'<strong>Local test baseline</strong><p>'+s['milestones'][1]['detail']+m[2],launch)
metrics='''<div class="status-scorecard" aria-label="Pilot source readiness">
<div><span>Venue scope</span><strong data-status-field="venueScope">New York City</strong><small data-status-field="venueDetail">One venue · location filter verified</small></div>
<div><span>Reservation webhook</span><strong data-status-field="webhookState">Receiving</strong><small data-status-field="webhookDetail">Dated engineering evidence</small></div>
<div><span>Data Exports</span><strong data-status-field="exportState">Pending</strong><small data-status-field="exportDetail">Access and recovery to confirm</small></div>
<div><span>Attribution</span><strong data-status-field="attributionState">Pending</strong><small data-status-field="attributionDetail">Reconciliation before reporting</small></div>
</div>'''
h=h[:a]+head+next_action+metrics+launch+'\n        </section>\n\n'+h[b:]
(root/'index.html').write_text(h,encoding='utf-8')
(root/'status.js').write_text('window.PUTTERY_OPERATIONAL_STATUS = Object.freeze('+json.dumps(s,indent=2)+');\n',encoding='utf-8')
j=(root/'app.js').read_text(encoding='utf-8')
j=j.replace('document.querySelector("#questions-resolved").textContent = `${resolved} / ${questions.length}`;', 'document.querySelector("#questions-resolved").textContent = `${resolved} / ${questions.length}`;\n  document.querySelector("#mobile-summary-count").textContent = `${resolved} of ${questions.length} resolved`;')
j=j.replace('document.querySelector("#save-state").textContent = "Saved locally in this browser. Export a copy before switching devices.";', 'document.querySelector("#save-state").textContent = "Saved locally in this browser. Export a copy before switching devices.";\n    return true;')
j=j.replace('showFeedback("Could not save in this browser. Export your answers to keep a copy.");', 'showFeedback("Could not save in this browser. Export your answers to keep a copy.");\n    return false;')
j=j.replace('      saveAnswers();\n      showFeedback("Evidence note saved in this browser.");', '      if (saveAnswers()) showFeedback("Evidence note saved in this browser.");')
(root/'app.js').write_text(j,encoding='utf-8')
c=(root/'styles.css').read_text(encoding='utf-8')
c+='''
/* One bounded visual correction: action first, compact mobile worksheet. */
.app-shell{background:var(--black-soft)}
.section-rail{height:calc(100dvh - 116px)}
.status-next{margin-bottom:var(--s6)}
.mobile-progress-link{display:none}
@media(max-width:980px){.section-rail{height:auto}}
@media(max-width:720px){
 .hero-section{padding-top:var(--s6);padding-bottom:var(--s6)}
 .hero-summary{margin-bottom:var(--s4)}
 .hero-meta,.hero-actions,.pilot-scoreboard{display:none}
 .mobile-progress-link{display:flex;align-items:center;gap:var(--s2);font-size:.6875rem;color:var(--dark-muted);text-decoration:none}
 .mobile-progress-link strong{font-size:.6875rem;color:var(--teal);font-weight:700}
 .mobile-progress-link .icon{width:16px;height:16px;flex-basis:16px}
 .mobile-progress-link:hover{text-decoration:underline}
 .status-next{margin-bottom:var(--s5)}
}
'''
(root/'styles.css').write_text(c,encoding='utf-8')
t=(root/'qa/inspect.cjs').read_text(encoding='utf-8').replace("==='1 of 8 resolved'", "==='1 of 5 resolved'")
t=t.replace(".includes('Export a copy')", ".toLowerCase().includes('export a copy')")
t=t.replace("await page.locator('#discovery').scrollIntoViewIfNeeded();\n  await page.screenshot", "await page.locator('#discovery').evaluate(el=>el.scrollIntoView({block:'start'}));\n  await page.screenshot")
t=t.replace("await page.locator('#live-status').scrollIntoViewIfNeeded();", "await page.locator('#live-status').evaluate(el=>el.scrollIntoView({block:'start'}));")
t=t.replace("  check(name+' current state'", "  const nextBox=await page.locator('.status-next').boundingBox();check(name+' next action visible in opening viewport',nextBox.y<height);\n  check(name+' current state'")
(root/'qa/inspect.cjs').write_text(t,encoding='utf-8')
print('Batched product, mobile, storage, and test-expectation corrections applied.')
