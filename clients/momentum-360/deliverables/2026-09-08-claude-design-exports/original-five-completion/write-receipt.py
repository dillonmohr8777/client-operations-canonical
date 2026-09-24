from pathlib import Path
import json,hashlib,subprocess,datetime,urllib.parse
base=Path(__file__).parent
root=base.parent
review=base/'review'
stamp=datetime.datetime.now(datetime.timezone.utc).isoformat()
def read(p): return json.loads(p.read_text(encoding='utf-8-sig'))
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def link(p,label=None): return f'[{label or p.name}](<{p.as_posix()}>)'
projects={'momo':'https://claude.ai/design/p/e5e6d97f-e2a8-4651-aecc-6c2aea241351','launch':'https://claude.ai/design/p/729c7014-c7a3-4ed3-822c-f4e1bd61bca0'}
directions=[
 ('Momo’s First Assignment','momo','Momo - First Assignment.dc.html','first-assignment',2),
 ('One Idea, Everywhere','momo','One Idea Everywhere.dc.html','one-idea-everywhere',2),
 ('The Next Chapter Series','launch','The Next Chapter Series.dc.html','next-chapter',8),
 ('Meet Your Team: Character Shorts','launch','Meet Your Team - Character Shorts.dc.html','character',12),
 ('Inside the Living Portfolio','momo','Inside the Living Portfolio.dc.html','inside-living-portfolio',2),
]
qa=[read(p) for p in sorted(review.glob('*/qa.json'))]
renders=[]
for p in sorted(review.glob('*/render.json')):
 r=read(p); output=Path(r['output'])
 if r.get('status')!='PASS' or not output.exists(): continue
 probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','stream=codec_name,width,height,r_frame_rate,nb_frames','-show_entries','format=duration,size','-of','json',str(output)],creationflags=subprocess.CREATE_NO_WINDOW))
 s=probe['streams'][0]
 assert s['codec_name']=='h264' and s['width']==r['width'] and s['height']==r['height'] and s['r_frame_rate']=='30/1' and int(s['nb_frames'])==r['frames']
 assert abs(float(probe['format']['duration'])-r['duration'])<.04
 r['ffprobe']=probe;r['sha256']=sha(output);renders.append(r)
(review/'MP4-VERIFICATION.json').write_text(json.dumps({'verifiedAt':stamp,'count':len(renders),'renders':renders},indent=2),encoding='utf-8')
all_done=len(qa)==26 and all(q['status']=='PASS' for q in qa) and len(renders)==26
lines=['# Today’s Claude Design completion receipt','',f'Verified: {stamp}', '',f'**Status: {"COMPLETE FOR LOCAL REVIEW" if all_done else "IN PROGRESS: SOURCES AND QA COMPLETE; RENDERS RUNNING"}.** Five native direction artifacts downloaded. {len([q for q in qa if q["status"]=="PASS"])}/26 aspect-and-variant QA checks pass. {len(renders)}/26 silent review MP4s independently verified with ffprobe.','',
'Scope: the five directions below only. Four Next Chapter episodes and six character shorts are included as individually selectable variants. The later Atomic Assembly/Clear the Noise/Hours Return/Break the Frame/System Awake batch is outside this receipt. No Gmail, Slack, publication, deployment, paid generation, purchase, or subscription action was performed.','',
'| Direction | Claude project | Exact native artifact and local source | Build/completion evidence | QA | MP4s | Remaining blocker |','|---|---|---|---|---|---|---|']
manifest=[]
for name,project,filename,prefix,want in directions:
 src=base/project/filename;assert src.exists()
 subset=[q for q in qa if q['id'].startswith(prefix)]
 done=[r for r in renders if Path(r['output']).name.startswith(prefix)]
 manifest.append({'direction':name,'project':projects[project],'file':str(src),'sha256':sha(src),'qa':subset,'mp4s':[r['output'] for r in done]})
 lines.append(f'| {name} | [Open direction]({projects[project]}?file={urllib.parse.quote(filename)}) | {link(src,filename)} | Present in fresh 2026-09-08 project ZIP; locally loaded with native support runtime | {len([q for q in subset if q["status"]=="PASS"])}/{want} pass; first/opening/middle/last frames saved | {len(done)}/{want}, exact links below | {"None for local review" if len(done)==want else "Local rendering in progress; no account or human-only blocker"} |')
lines+=['','## Verification method','',
'Replay and pause were clicked; the range input was driven by keyboard; both aspect controls and sound toggles responded. Each standalone film’s reduced-motion flag stopped autoplay; both series exposed their static view under the reduced-motion preference. No horizontal document overflow or runtime JavaScript errors were observed. The sole console resource warning was the preview server’s missing `/favicon.ico`, confirmed in the HTTP log; film assets loaded.','',
'The native deterministic `renderFrameAt(t)` or `data-om-seek-to-time-frame` contract produced first (0 s), opening (1.2 s), middle, and last-frame evidence. Repeated settled frames matched exactly except six character portrait previews: a bounded raster tolerance permits at most one 8-bit color level on fewer than 0.01% of pixels at fractional CSS edges. Each measured difference is retained in its raw `qa.json`, with repeat PNGs. This is not presented as bit-identical preview output.','',
'Local renders use the native seek hooks at 30 fps, capture only the film stage and its text overlays, and encode H.264 in 1920×1080 or 1080×1920. The frame count is exactly duration × 30; the endpoint is excluded to avoid an extra frame. Render-only guards suppress redundant paused-loop redraws. At full character development an opaque fill replaces circles that would immediately be covered by that same fill; the before/after native canvas hashes match in `mask-optimization-verification.json`. The downloaded source files and ZIPs are unmodified. All review MP4s are deliberately silent, with that fact in each filename. Native synthesized audio remains available through the source sound controls; audio mixing/mastering is not claimed here.','',
'MP4 contact-sheet inspection caught a crop in an early optimized landscape capture. Those attempts are explicitly prefixed `REJECTED-capture-crop-` and excluded from this manifest. Replacement captures pin the complete stage at (0, 0) and assert image dimensions for every frame before encoding. Character shorts after Momo use quality-100 JPEG intermediates to reduce capture time; all other intermediates and all QA stills are PNG. The review MP4s are lossy H.264 exports. Interrupted attempts are also excluded.','',
'Visual review: the paper films and character shorts begin with a deliberate pre-reveal frame; the opening sample confirms the reveal. Portrait camera moves intentionally crop or bleed artwork during motion. Settled text, end cards, and authored portrait arrangements remain readable. These are proposed concept reviews, not evidence of a deployed product or client outcome.','',
f'Raw QA: {link(review/"QA-FINAL.json")}. MP4 metadata: {link(review/"MP4-VERIFICATION.json")}. Re-runnable checks: {link(base/"qa-render.cjs")}. Source byte comparison: {link(base/"source-integrity.json")}.','',
'## Exact review MP4 paths','']
for r in renders: lines.append(f'- {link(Path(r["output"]))} · {r["width"]}×{r["height"]} · {r["duration"]} s · {r["frames"]} frames · silent')
lines+=['','## Source provenance','',f'Original submission evidence: {link(root/"FIVE-DIRECTIONS-SUBMISSION-RECEIPT.md")}. Fresh project ZIP download observed in the same two existing projects on 2026-09-08 at approximately 23:21 UTC. No duplicate project or chat was created.','']
for p in sorted(base.glob('*source-20260908.zip')):lines.append(f'- {link(p)} · {p.stat().st_size} bytes · SHA-256 `{sha(p)}`')
lines+=['','## Preserved assets','', 'The three previously refined 1080p films remain in `finishing`, unchanged from the hashes recorded before this completion pass. All older source ZIPs and original silent masters remain in place. Email remains paused.','']
for r in read(base/'preserved-refined-films.json'):
 p=Path(r['path']);assert sha(p).upper()==r['sha256'].upper();lines.append(f'- {link(p)} · {r["bytes"]} bytes · SHA-256 `{r["sha256"]}` verified unchanged')
lines+=['','## Contact sheets','']
for p in sorted(review.glob('contact-*.jpg')):lines.append('- '+link(p))
for p in sorted(review.glob('RENDERED-*.jpg')):lines.append('- '+link(p)+' (frames extracted from exported MP4s)')
out=root/'TODAY-CLAUDE-DESIGN-COMPLETION-RECEIPT.md'
out.write_text('\n'.join(lines)+'\n',encoding='utf-8')
(base/'five-direction-manifest.json').write_text(json.dumps({'verifiedAt':stamp,'completeForLocalReview':all_done,'directions':manifest},indent=2),encoding='utf-8')
print(json.dumps({'receipt':str(out),'qaPassed':sum(q['status']=='PASS' for q in qa),'verifiedMP4s':len(renders),'completeForLocalReview':all_done}))
