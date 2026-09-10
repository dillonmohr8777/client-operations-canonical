from pathlib import Path
import re,json,shutil,hashlib
root=Path(__file__).resolve().parents[1]
source=Path(r'C:\Users\dillo\Documents\Codex\2026-08-04\we-can-help-right-research-this-2')
current=root.parent/'2026-09-04-dashboard-design-refresh'
for f in ['index.html','styles.css','app.js']:
 shutil.copy2(source/f,root/f)
for f in ['_headers','robots.txt']:
 shutil.copy2(source/'netlify-dashboard'/f,root/f)
shutil.copytree(source/'assets',root/'assets',dirs_exist_ok=True)
shutil.copy2(current/'status.js',root/'status.js')
shutil.copy2(source/'DESIGN.md',root/'DESIGN.md')
shutil.copy2(source/'PRODUCT.md',root/'PRODUCT.md')
shutil.copytree(source/'.impeccable',root/'.impeccable',dirs_exist_ok=True)
# Preserve the entire original animation implementation; only update its data.
j=(root/'app.js').read_text(encoding='utf-8')
fresh=(current/'app.js').read_text(encoding='utf-8')
j=fresh[:fresh.index('const storageKey =')]+j[j.index('const storageKey ='):]
j=j.replace('function saveAnswers() {\n  localStorage.setItem(storageKey, JSON.stringify(answers));\n}', '''function saveAnswers() {
  try { localStorage.setItem(storageKey, JSON.stringify(answers)); return true; }
  catch (_) { showFeedback("Browser storage is unavailable. Export your answers before leaving to keep a copy."); return false; }
}''')
j=j.replace('      saveAnswers();\n      showFeedback("Evidence note saved in this browser.");','      if (saveAnswers()) showFeedback("Evidence note saved in this browser.");')
# Keep all original motion enabled. Give people an explicit pause control.
motion='''
function setupMotionControl() {
  const control = document.querySelector("#motion-toggle");
  let paused = false;
  function apply() {
    document.documentElement.classList.toggle("motion-paused", paused || document.hidden);
    control.textContent = paused ? "Resume motion" : "Pause motion";
    control.setAttribute("aria-pressed", String(paused));
  }
  control.addEventListener("click", () => { paused = !paused; apply(); });
  document.addEventListener("visibilitychange", apply);
  const view = new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle("motion-offscreen", !entry.isIntersecting)));
  document.querySelectorAll(".hole-mark").forEach(mark => view.observe(mark));
  apply();
}
'''
j=j.replace('document.addEventListener("DOMContentLoaded", () => {', motion+'\ndocument.addEventListener("DOMContentLoaded", () => {')
j=j.replace('  renderCourseMarks();','  renderCourseMarks();\n  setupMotionControl();')
(root/'app.js').write_text(j,encoding='utf-8')
h=(root/'index.html').read_text(encoding='utf-8')
# One fresh intro play for the restored release, without touching answers.
h=h.replace('putteryIntroSeen','putteryIntroSeenMotionRestored20260904')
h=h.replace('<button class="action-button secondary" id="export-answers"', '<button class="action-button secondary" id="motion-toggle" type="button" aria-pressed="false">Pause motion</button>\n        <button class="action-button secondary" id="export-answers"')
s=json.loads((root/'status.js').read_text().split('Object.freeze(',1)[1].rsplit(');',1)[0])
import html
for key,val in s.items():
 if isinstance(val,str):
  h=re.sub(r'(<[^>]+data-status-field="'+key+r'"[^>]*>).*?(</[^>]+>)',lambda m:m[1]+html.escape(val)+m[2],h,flags=re.S)
h=h.replace('datetime="2026-09-04"','datetime="2026-09-04T23:03:21Z"')
h=h.replace('Vendor registration','Reconciliation pending')
h=h.replace('Tock registration, one controlled NYC event, and the remaining launch approvals still gate production.',s['readinessExplainer'])
h=h.replace('Live source feeds','Dashboard source feeds')
h=h.replace('No live Puttery reservation, guest, advertising, or payment data is connected. Verified integration status is reported separately below.','No live guest, advertising, or payment records are loaded into this page. Verified integration status is reported separately below.')
h=h.replace('Seven systems form the pilot. Tock identifiers and Reservation Webhook eligibility are now confirmed; registration, a controlled payload, Data Exports access, and every other live source still require verification.','Ten source lanes support the pilot. The reservation webhook is receiving and NYC filtering is verified. Reconciliation, Data Exports recovery, and additional venue access and usage still require confirmation.')
h=h.replace('Tock response needed','Next verification step')
h=h.replace('The next move is one controlled Tock delivery.','The next move is a reconciled NYC event.')
h=h.replace('Tock completes the secure registration and rotation steps, then sends one Puttery NYC event. Momentum verifies Business 37824 routing and reconciles the event before any production reporting is enabled.',s['nextAction'])
h=h.replace('Confirm secure packet access, rotate the prior credential through the approved secure route, register the Reservation Webhook, send one controlled NYC event, and confirm Data Exports.','Confirm the intended NYC test event, secure credential route, and Data Exports recovery. Expanded access reviews include Toast, guest profile, and walk-in routes.')
h=h.replace('Verify the delivery, preserve only privacy-safe reservation facts, and document the exact value and recovery behavior.','Reconcile received deliveries, preserve only privacy-safe reservation facts, and document value, update, and recovery behavior.')
items=''.join(f'<li class="{m["state"]}"><span class="milestone-marker">{i+1}</span><div><strong>{html.escape(m["label"])}</strong><p>{html.escape(m["detail"])}</p></div><span class="milestone-status">{m["statusLabel"]}</span></li>' for i,m in enumerate(s['milestones']))
h=re.sub(r'(<ol id="status-milestones"[^>]*>).*?(</ol>)',lambda m:m[1]+items+m[2],h,flags=re.S)
h=h.replace('<span>Receiver tests</span>','<span>Receiver test baseline</span>').replace('<span>Relay tests</span>','<span>Relay test baseline</span>').replace('<span>Production feed</span>','<span>Reservation webhook</span>')
(root/'index.html').write_text(h,encoding='utf-8')
# Original CSS, all keyframes and ornaments intact. Only accessibility/overlap fixes.
c=(root/'styles.css').read_text(encoding='utf-8')
c+='''
/* Motion restoration: user explicitly selected the full original direction.
   Pause is opt-in; original choreography stays active by default. */
html.motion-paused *,html.motion-paused *::before,html.motion-paused *::after,
.hole-mark.motion-offscreen * { animation-play-state:paused!important; }
@media(min-width:981px){
 .section-rail{display:flex;flex-direction:column;overflow-y:auto;scrollbar-width:thin}
 .section-rail nav{flex:0 0 auto}
 .rail-status{position:static;flex:0 0 auto;margin-top:24px}
}
'''
(root/'styles.css').write_text(c,encoding='utf-8')
p=(root/'PRODUCT.md').read_text(encoding='utf-8')
p+='''
## September 4 restoration authority

Dillon explicitly rejected the restrained refresh and requested all original Opus Five Max visual character back: original intro, moving logo, animated icons, golf motion, side ornaments, bold headlines, layout and pop. The original implementation is the visual authority; generic restraint advice must not override this request.

Current factual state comes from the September 4, 7:03 PM ET engineering snapshot: reservation webhook receiving, NYC filtering verified, reconciliation and Data Exports recovery pending. Expanded access reviews have been requested for Toast, Tock Guest and Walk-in; actual NYC usage and enablement remain unverified. The public dashboard contains no guest records or live performance feed.
'''
(root/'PRODUCT.md').write_text(p,encoding='utf-8')
d=(root/'DESIGN.md').read_text(encoding='utf-8')
d+='''

<!-- September 4 restoration: Original visual tokens, full intro, moving wordmark,
animated course marks, golf ball motion, side ornament and bold layout restored
at Dillon's explicit request. An optional Pause motion control and an offscreen
pause preserve access; reduced motion remains supported. Sidebar footer flows
after navigation and scrolls at short heights. No replacement art direction. -->
'''
(root/'DESIGN.md').write_text(d,encoding='utf-8')
side=root/'.impeccable/design.json'
if side.exists():
 data=json.loads(side.read_text(encoding='utf-8'))
 from datetime import datetime,timezone
 data['generatedAt']=datetime.now(timezone.utc).isoformat()
 data.setdefault('extensions',{}).setdefault('motion',[]).append({'name':'restoration-control','value':'animation-play-state: paused','purpose':'Explicit Pause motion control and offscreen pause. Original motion active by default.'})
 side.write_text(json.dumps(data,indent=2),encoding='utf-8')
manifest=[]
public=root/'public';public.mkdir(exist_ok=True)
files=['index.html','app.js','status.js','styles.css','_headers','robots.txt']+[p.relative_to(root).as_posix() for p in (root/'assets').rglob('*') if p.is_file() and p.suffix.lower() in ['.svg','.png','.jpg','.webp','.woff','.woff2']]
for f in files:
 dst=public/f;dst.parent.mkdir(parents=True,exist_ok=True);dst.write_bytes((root/f).read_bytes())
 manifest.append({'path':f,'sha256':hashlib.sha256(dst.read_bytes()).hexdigest(),'bytes':dst.stat().st_size})
(root/'qa/public-manifest.json').write_text(json.dumps({'files':manifest},indent=2))
orig=(source/'styles.css').read_text(encoding='utf-8');origapp=(source/'app.js').read_text(encoding='utf-8')
proof={'originalCssPrefixPreserved':c.startswith(orig),'originalKeyframes':re.findall(r'@keyframes\s+([\w-]+)',orig),'restoredKeyframes':re.findall(r'@keyframes\s+([\w-]+)',c),'originalMotionFunctionsPreserved':all(origapp[origapp.index('function '+fn):origapp.index('function '+fn)+100] in j for fn in ['animateHeadings()','renderCourseMarks()']),'sourceFolder':str(source),'publicFiles':len(files)}
(root/'qa/restoration-proof.json').write_text(json.dumps(proof,indent=2))
print(json.dumps({'public':str(public),'files':len(files),'originalCssPreserved':proof['originalCssPrefixPreserved']}))
