from pathlib import Path
import json, shutil, zipfile, hashlib, subprocess, sys
from PIL import Image, ImageDraw

ROOT=Path(__file__).resolve().parent
BASE=ROOT.parent
BATCH=BASE/'2026-09-07-google-aistudio-batch'
OUT=ROOT/'library'
def contact(files,target,cols=5,cell=(310,450)):
    rows=(len(files)+cols-1)//cols
    out=Image.new('RGB',(cols*cell[0],rows*cell[1]),'#e9e9e9'); draw=ImageDraw.Draw(out)
    for i,f in enumerate(files):
        im=Image.open(f).convert('RGB'); im.thumbnail((cell[0]-12,cell[1]-45))
        x=(i%cols)*cell[0]; y=(i//cols)*cell[1]
        out.paste(im,(x,y)); draw.text((x+3,y+cell[1]-38),f.name[:39],fill='black')
    out.save(target)
contact(sorted((ROOT/'qa').glob('*-p1.png')),ROOT/'qa/covers-contact.jpg',6,(250,340))
contact(sorted((ROOT/'qa').glob('Ebook-*-p3.png')),ROOT/'qa/reading-contact.jpg',5,(400,610))
contact([p for p in sorted((ROOT/'qa').glob('Ebook-*.png')) if not p.name.endswith(('-p1.png','-p3.png'))],ROOT/'qa/ebook-body-contact.jpg',5,(300,430))

def copy_folder(src,dest,extensions):
    if not src.exists(): return
    for f in src.rglob('*'):
        if f.is_file() and f.suffix.lower() in extensions:
            target=dest/f.relative_to(src); target.parent.mkdir(parents=True,exist_ok=True); shutil.copy2(f,target)

copy_folder(BATCH/'stills',OUT/'02_Artwork/28_Source_Stills',{'.png'})
copy_folder(BATCH/'design',OUT/'05_Editable_Sources/Launch_Collateral',{'.html','.json','.jpg','.png'})
copy_folder(BASE/'2026-09-07-ai-division-collateral-canvas',OUT/'05_Editable_Sources/Division_Collateral',{'.html','.json','.jpg','.png'})
copy_folder(BATCH/'audio',OUT/'02_Artwork/Music',{'.mp3','.wav'})
for name in ['momentum-logo.png','momentum-mark.png']:
    shutil.copy2(BATCH/'design'/name,OUT/'02_Artwork'/name)
copy_folder(BATCH/'clips',OUT/'04_Review_Extras/Source_Clips',{'.mp4'})
copy_folder(BATCH/'composites',OUT/'04_Review_Extras/Composites',{'.mp4'})
copy_folder(BASE/'2026-09-07-ai-division-video-prompts/rendered_assets',OUT/'04_Review_Extras/Alternate_Direction',{'.mp4','.png','.jpg'})
current=['30s_v5','15s_v3','6s_v3','30s_v5_9x16','30s_v5_1x1','15s_v3_9x16','6s_v3_9x16']
for suffix in current:
    for music in ['', '_music']:
        name='momentum_ai_launch_'+suffix+music+'.mp4'
        src=BATCH/'spot'/name
        dest=OUT/('03_Videos' if music else '04_Review_Extras/Silent_Launch_Versions')/name
        dest.parent.mkdir(parents=True,exist_ok=True); shutil.copy2(src,dest)
for f in (BATCH/'spot').glob('*.mp4'):
    if not any(f.stem=='momentum_ai_launch_'+x+m for x in current for m in ['','_music']):
        dest=OUT/'04_Review_Extras/Superseded_Cuts'/f.name; dest.parent.mkdir(parents=True,exist_ok=True); shutil.copy2(f,dest)
motion=BASE/'2026-09-07-ai-division-video-batch'
for f in motion.glob('*.mp4'):
    dest=OUT/('04_Review_Extras/Unapproved_Momo' if 'UNAPPROVED' in f.name else '03_Videos/Motion_Studies')/f.name
    corrected=ROOT/'corrected-videos'/f.name
    dest.parent.mkdir(parents=True,exist_ok=True); shutil.copy2(corrected if corrected.exists() else f,dest)
shutil.copy2(BATCH/'reel/momentum_ai_launch_REEL_16x9_web.mp4',OUT/'03_Videos/00-LAUNCH-REEL.mp4')
(OUT/'04_Review_Extras/READ-ME.txt').write_text('REFERENCE AND REVIEW ONLY\nSuperseded edits, raw generations, silent variants and unapproved mascot material. These are included for completeness, not recommended for publication. Raw generations include known visual defects.\n',encoding='utf-8')
(OUT/'03_Videos/READ-ME.txt').write_text('CURRENT REVIEW EXPORTS\nThe seven music cuts are the existing latest launch versions. Motion studies are separate creative studies and some are silent by design. This package does not imply public approval of mascot, claims, pricing or likeness. See the source notes in the PDF library.\n',encoding='utf-8')
checks=[]
ffprobe=shutil.which('ffprobe'); ffmpeg=shutil.which('ffmpeg')
assert ffprobe and ffmpeg
skip='--reuse-video-checks' in sys.argv
if skip: checks=json.loads((ROOT/'video-checks.json').read_text(encoding='utf-8'))
for f in ([] if skip else sorted((OUT/'03_Videos').rglob('*.mp4'))):
    result=subprocess.run([ffprobe,'-v','error','-show_entries','format=duration:stream=codec_name,codec_type,width,height','-of','json',str(f)],capture_output=True,text=True,check=True)
    data=json.loads(result.stdout)
    decoded=subprocess.run([ffmpeg,'-v','error','-threads','2','-i',str(f),'-f','null','NUL'],capture_output=True,text=True)
    assert decoded.returncode==0 and not decoded.stderr.strip(),(f.name,decoded.stderr[:200])
    checks.append({'file':str(f.relative_to(OUT)),'decode_pass':True,**data})
    print('Verified '+f.name,flush=True)
(ROOT/'video-checks.json').write_text(json.dumps(checks,indent=2),encoding='utf-8')
for f in [ROOT/'pdf-manifest.json',ROOT/'video-checks.json',ROOT/'DELIVERY-INDEX.md']:
    shutil.copy2(f,OUT/f.name)
bundles=[]
for filename,folders in [('Momentum-AI-PDF-Library.zip',['01_PDFs']),('Momentum-AI-Artwork-and-Editable-Sources.zip',['02_Artwork','05_Editable_Sources']),('Momentum-AI-Current-Videos.zip',['03_Videos']),('Momentum-AI-Review-Extras.zip',['04_Review_Extras'])]:
    target=ROOT/filename
    with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED,compresslevel=1) as z:
        for folder in folders:
            for f in sorted((OUT/folder).rglob('*')):
                if f.is_file(): z.write(f,f.relative_to(OUT))
        for f in [ROOT/'pdf-manifest.json',ROOT/'video-checks.json',ROOT/'DELIVERY-INDEX.md']: z.write(f,f.name)
    with zipfile.ZipFile(target) as z: assert z.testzip() is None
    h=hashlib.sha256()
    with target.open('rb') as f:
        for chunk in iter(lambda:f.read(1024*1024),b''):h.update(chunk)
    bundles.append({'file':filename,'bytes':target.stat().st_size,'sha256':h.hexdigest()})
(ROOT/'bundles.json').write_text(json.dumps(bundles,indent=2),encoding='utf-8')
print(json.dumps(bundles))
