from pathlib import Path
import json,hashlib,subprocess,datetime,zipfile,sys
from PIL import Image,ImageDraw
base=Path(__file__).parent
root=base.parent
out=base/'opaque-review-mp4'
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def link(p,label=None):return f'[{label or p.name}](<{p.as_posix()}>)'
def run(args):return subprocess.check_output(args,creationflags=subprocess.CREATE_NO_WINDOW)
films=read(out/'encode-receipt.json')
if isinstance(films,dict):films=[films]
verified=[]
for film in films:
    path=Path(film['path'])
    probe=json.loads(run(['ffprobe','-v','error','-show_entries','stream=codec_type,codec_name,width,height,r_frame_rate,nb_frames','-show_entries','format=duration,size','-of','json',str(path)]))
    streams=probe['streams']; s=streams[0]
    dims=(1920,1080) if '16x9' in film['name'] else (1080,1920)
    assert len(streams)==1 and s['codec_type']=='video' and s['codec_name']=='h264'
    assert (s['width'],s['height'])==dims and s['r_frame_rate']=='30/1' and int(s['nb_frames'])==540
    assert abs(float(probe['format']['duration'])-18)<.001
    assert sha(path).upper()==film['sha256'].upper()
    contact=out/(film['name']+'-mp4-contact.jpg')
    if not contact.exists():
        samples=[0,90,210,330,420,539]
        selector='+'.join('eq(n\\,'+str(n)+')' for n in samples)
        width=480 if dims[0]>dims[1] else 270
        run(['ffmpeg','-hide_banner','-loglevel','error','-i',str(path),'-vf','select='+selector+',scale='+str(width)+':-1,tile=3x2','-frames:v','1','-q:v','2',str(contact)])
        im=Image.open(contact).convert('RGB'); sheet=Image.new('RGB',(im.width,im.height+30),'#e8edf1');sheet.paste(im,(0,30))
        ImageDraw.Draw(sheet).text((8,8),film['name']+' | 0, 3, 7, 11, 14, 17.97 seconds | extracted MP4',fill='#102d49');sheet.save(contact,quality=92)
    verified.append({'name':film['name'],'path':str(path),'sha256':sha(path),'probe':probe,'contact':str(contact),'audio':'silent','alpha':False})
for aspect in ['16x9','9x16']:
    contacts=[Path(f['contact']) for f in verified if aspect in f['name']]
    images=[Image.open(p).convert('RGB') for p in contacts]
    if not images:continue
    sheet=Image.new('RGB',(max(i.width for i in images),sum(i.height for i in images)),'#e8edf1');y=0
    for im in images:sheet.paste(im,(0,y));y+=im.height
    sheet.save(out/f'RENDERED-FIVE-{aspect}.jpg',quality=90)
(base/'mp4-verification.json').write_text(json.dumps({'count':len(verified),'verifiedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'films':verified},indent=2))
print(json.dumps({'verifiedMP4s':len(verified),'contacts':len(verified)}))
if '--final' not in sys.argv:sys.exit(0)
assert len(verified)==10
visual=read(base/'visual-review.json');assert visual['status']=='PASS' and len(visual['reviewedMP4s'])==10
src=read(base/'source-integrity.json');assert src['status']=='PASS'
rr=read(base/'render-receipt.json');assert rr['status']=='passed' and len(rr['films'])==10
assert all(f['frames']==540 and not f['errors'] and f['deterministic'] for f in rr['films'])
old=read(root/'original-five-completion/review/MP4-VERIFICATION.json');assert old['count']==26
for f in old['renders']:assert sha(Path(f['output']))==f['sha256']
preserved=read(root/'original-five-completion/preserved-refined-films.json')
for f in preserved:assert sha(Path(f['path'])).upper()==f['sha256'].upper()
stamp=datetime.datetime.now(datetime.timezone.utc).isoformat()
lines=['# Five new AI films completion receipt','',f'Verified {stamp}. **COMPLETE FOR LOCAL REVIEW: 5 native films, 10/10 QA cases, 10/10 verified MP4s.**','',
'All accepted exports are opaque navy, silent H.264 review copies: 18 seconds, 30 fps, 540 frames each; 1920×1080 landscape and 1080×1920 portrait. These are not transparent MP4s or audio masters. The complete 5,400-frame RGBA PNG sequences remain local. No email, Slack, publication, deployment, spend, new Claude project/chat, or gameplay action was performed.','',
'## Source provenance and integrity','',f'Existing [Launch Claude project]({src["project"]}). The local archive is byte-identical to the previously observed download from that project. No new Claude generation or project was needed. All {len(src["files"])} extracted files match the archive, including the five native films and shared runtime. Source files were not edited.','',f'Source archive: {link(Path(src["archive"]))}. SHA-256 `{src["archiveSHA256"]}`. Integrity record: {link(base/"source-integrity.json")}.','',
'| Native film | Source SHA-256 |','|---|---|']
for f in src['nativeFilmSources']:lines.append(f'| {link(base/"source"/f["file"])} | `{f["sha256"]}` |')
lines+=['','## Accepted MP4s','', '| Film and aspect | Dimensions | Duration / frames / fps | SHA-256 |','|---|---|---|---|']
for f in verified:
    s=f['probe']['streams'][0];lines.append(f'| {link(Path(f["path"]))} | {s["width"]}×{s["height"]} | 18 s / 540 / 30 | `{f["sha256"]}` |')
lines+=['','## Verification and visual review','',
'The existing QA receipt passes all ten cases, using eight authored-frame samples per case, repeated-frame SHA comparison, expected canvas dimensions, runtime-error capture, and alpha data checks. Full rendering subsequently captured frames 0 through 539 via the native deterministic hook. Each export was ffprobe-checked for codec, dimensions, frame rate, frame count and duration, and fully decoded by ffmpeg. Accepted file hashes were independently rechecked.','',
'The stopped loopback server was restarted. An initial full-render attempt stopped at Atomic Assembly frame 90 because the driver incorrectly required fully transparent pixels in every sampled frame. The authored impulse sphere fills the camera view briefly with translucent pixels (corner alpha 19/255 at that frame). The driver now permits that authored full-frame coverage while retaining dimensional and dirty-transparent-pixel checks. No source geometry or color was changed. The incomplete PNG attempt never produced an MP4. A later scan found 36 unexpected transparent frames (147–182) in System Awake landscape. Fresh native recaptures restored those frames, with two matching captures per frame; rejected originals are retained under REJECTED-blank-captures and excluded from the deliverable ZIP. The raw render receipt retains its original sample counts; blank-frame-repair.json records the accepted replacements. No failed or cropped MP4 is included.','',
'Actual MP4 inspection also caught portrait end-card headline clipping. The render-only response changes the portrait card scale from 0.92 to 0.70 and recaptures frames 432–539; two last-frame captures matched for each film. Original source files are unchanged, and all five initial portrait MP4s plus replaced PNGs are retained under REJECTED-cropped-portrait-exports. Accepted portrait MP4s use the corrected sequence. See portrait-endcard-repair.json.','',
'System Awake landscape also lost end-card text during its initial capture. Frames 432–539 were recaptured from the unchanged native source, with two matching captures per frame, and the MP4 was replaced. Rejected files are preserved under REJECTED-incomplete-endcard. See landscape-endcard-repair.json.','',
'Visual inspection used contact sheets extracted from every actual MP4 at 0, 3, 7, 11, 14 and 17.97 seconds, including both aspect ratios. '+visual['notes'],'',
f'Evidence: {link(base/"qa-receipt.json")}, {link(base/"render-receipt.json")}, {link(base/"mp4-verification.json")}, {link(base/"visual-review.json")}, {link(out/"encode-receipt.json")}.','',
'The native source manifest’s earlier “not produced” export statements describe its pre-export state. This receipt records the subsequent local exports. Source reference descriptions and conceptual claims are not independent proof of real client outcomes.','',
'## Blockers','', 'None for this local-review scope. Audio mastering, transparent video mastering, and external delivery are not claimed. Email remains paused.']
for aspect in ['16x9','9x16']:lines+=['',link(out/f'RENDERED-FIVE-{aspect}.jpg')]
receipt=root/'FIVE-NEW-AI-FILMS-COMPLETION-RECEIPT.md';receipt.write_text('\n'.join(lines)+'\n',encoding='utf-8')
package=root/'FIVE-NEW-AI-FILMS-REVIEW.zip'
files=[Path(f['path']) for f in verified]+[receipt,base/'mp4-verification.json',base/'source-integrity.json',base/'qa-receipt.json',base/'render-receipt.json',base/'blank-frame-repair.json',base/'portrait-endcard-repair.json',base/'landscape-endcard-repair.json',base/'visual-review.json',out/'encode-receipt.json']+sorted(out.glob('*-mp4-contact.jpg'))
with zipfile.ZipFile(package,'w',compression=zipfile.ZIP_STORED) as z:
    for p in files:z.write(p,p.name)
with zipfile.ZipFile(package) as z:assert z.testzip() is None and sum(n.endswith('.mp4') for n in z.namelist())==10
packageRecord={'path':str(package),'bytes':package.stat().st_size,'sha256':sha(package),'crc':'PASS','mp4Count':10}
(base/'package-verification.json').write_text(json.dumps(packageRecord,indent=2))
status=['# All today Claude Design status','',f'Verified {stamp}. **Both existing batches are complete for local review. Chain Reaction derivative refinement is next.**','',
'| Group | Verified result | Evidence |','|---|---|---|',
f'| Three previously refined films | All three preserved unchanged, SHA-256 rechecked | {link(root/"original-five-completion/preserved-refined-films.json")} |',
f'| Earlier five approved directions | 26 Full HD review MP4s, both aspects; hashes rechecked; silent | {link(root/"TODAY-CLAUDE-DESIGN-COMPLETION-RECEIPT.md")} |',
f'| Later five AI films | 10 Full HD review MP4s, both aspects; 18 s / 540 frames / 30 fps each; silent | {link(receipt)} |','',
'Total for completed batches: three preserved refined films plus 36 new silent review MP4s. The 36 reviews cover 18 narrative segments across ten direction artifacts: 13 segments in the earlier five directions and five in the later batch. Aspect variants are not new stories. The newly authorized Chain Reaction Refined derivative is pending production and is not included in these counts. Native sources and prior refined files remain intact. Audio mastering is not claimed for any new review export. Email remains paused. Nothing sent, published, deployed, or purchased.','',
f'Earlier package: {link(root/"ORIGINAL-FIVE-REVIEW-MP4S.zip")}. Later package: {link(package)} ({packageRecord["bytes"]} bytes; CRC PASS; SHA-256 `{packageRecord["sha256"]}`).','']
for f in preserved:status.append('- '+link(Path(f['path'])))
(root/'ALL-TODAY-CLAUDE-DESIGN-STATUS.md').write_text('\n'.join(status)+'\n',encoding='utf-8')
print(json.dumps({'complete':True,'receipt':str(receipt),'package':packageRecord,'prior26Hashes':'PASS','preserved3Hashes':'PASS'}))
