from pathlib import Path
import subprocess, shutil, json, io, zipfile, hashlib
from PIL import Image, ImageStat, ImageDraw

root=Path(__file__).resolve().parent
receipts=[]
sheet=Image.new('RGB',(1080,540),'white')
for i,file in enumerate(sorted((root/'corrected-videos').glob('*.mp4'))):
    decoded=subprocess.run(['ffmpeg','-v','error','-i',str(file),'-f','null','NUL'],capture_output=True,text=True)
    assert decoded.returncode==0 and not decoded.stderr.strip(),decoded.stderr
    frames=[]
    for second in (1,3,5):
        raw=subprocess.run(['ffmpeg','-v','error','-ss',str(second),'-i',str(file),'-frames:v','1','-f','image2pipe','-vcodec','png','-'],capture_output=True,check=True).stdout
        im=Image.open(io.BytesIO(raw)).convert('RGB')
        assert max(ImageStat.Stat(im).var)>100, 'Blank video '+file.name
        frames.append(im)
    assert frames[0].tobytes()!=frames[-1].tobytes(), 'Static motion study '+file.name
    frames[1].thumbnail((270,500));sheet.paste(frames[1],(i*270,0))
    ImageDraw.Draw(sheet).text((i*270+8,280),file.name,fill='black')
    target=root/'library/03_Videos/Motion_Studies'/file.name
    shutil.copy2(file,target)
    receipts.append({'file':file.name,'decode_pass':True,'nonblank_seconds':[1,3,5],'motion_verified':True,'sha256':hashlib.sha256(file.read_bytes()).hexdigest()})
sheet.save(root/'qa/corrected-square-contact.png')
(root/'corrected-video-checks.json').write_text(json.dumps(receipts,indent=2))
# Rebuild only the previously unuploaded final current-video part, preserving membership.
part=root/'upload-parts/Momentum-AI-Current-Videos-06-of-06.zip'
with zipfile.ZipFile(part) as z: names=z.namelist()
with zipfile.ZipFile(part,'w',zipfile.ZIP_DEFLATED,compresslevel=1) as z:
    for name in names:z.write(root/'library'/name,name)
    z.write(root/'corrected-video-checks.json','corrected-video-checks.json')
with zipfile.ZipFile(part) as z:assert z.testzip() is None
print(json.dumps({'corrected':len(receipts),'archive':str(part),'bytes':part.stat().st_size}))
