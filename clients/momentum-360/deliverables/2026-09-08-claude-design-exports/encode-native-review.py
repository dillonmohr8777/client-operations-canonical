from pathlib import Path
import json,subprocess,hashlib,sys,datetime
from PIL import Image,ImageDraw
configPath=Path(sys.argv[1]).resolve();base=configPath.parent
config=json.loads(configPath.read_text())
receipt=json.loads((base/'render-receipt.json').read_text())
assert receipt['status']=='PASS' and len(receipt['results'])==2
def run(args):return subprocess.check_output(args,creationflags=subprocess.CREATE_NO_WINDOW)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
results=[];review=base/'review';review.mkdir(exist_ok=True)
for r in receipt['results']:
    assert r['frames']==540 and r['fps']==30 and r['duration']==18
    aspect=r['aspect'].replace(':','x');frames=base/'rgba-frames'/aspect
    assert len(list(frames.glob('frame_*.png')))==540
    mp4=review/(config['outputPrefix']+'-'+aspect+'-silent-review.mp4')
    run(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','lavfi','-i',f'color=c=0x03172e:s={r["width"]}x{r["height"]}:r=30:d=18','-framerate','30','-i',str(frames/'frame_%04d.png'),'-filter_complex','[0:v][1:v]overlay=shortest=1:format=auto,format=yuv420p[v]','-map','[v]','-c:v','libx264','-threads','2','-preset','medium','-crf','18','-frames:v','540','-an','-movflags','+faststart',str(mp4)])
    probe=json.loads(run(['ffprobe','-v','error','-show_entries','stream=codec_type,codec_name,width,height,r_frame_rate,nb_frames','-show_entries','format=duration,size','-of','json',str(mp4)]))
    s=probe['streams'][0];assert len(probe['streams'])==1 and s['codec_name']=='h264'
    assert s['width']==r['width'] and s['height']==r['height'] and s['r_frame_rate']=='30/1' and int(s['nb_frames'])==540
    assert abs(float(probe['format']['duration'])-18)<.001
    run(['ffmpeg','-hide_banner','-loglevel','error','-i',str(mp4),'-f','null','-'])
    samples=[0,15,36,60,165,282,330,390,539]
    selector='+'.join('eq(n\\,'+str(n)+')' for n in samples)
    contact=review/(aspect+'-actual-mp4-contact.jpg');width=480 if r['width']>r['height'] else 270
    run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(mp4),'-vf','select='+selector+',scale='+str(width)+':-1,tile=3x3','-frames:v','1','-q:v','2',str(contact)])
    im=Image.open(contact).convert('RGB');sheet=Image.new('RGB',(im.width,im.height+30),'#e8edf1');sheet.paste(im,(0,30));ImageDraw.Draw(sheet).text((8,8),aspect+' | 0, 0.5, 1.2, 2, 5.5, 9.4, 11, 13, 17.97 s | actual MP4',fill='#102d49');sheet.save(contact,quality=93)
    item={'aspect':r['aspect'],'path':str(mp4),'sha256':sha(mp4),'probe':probe,'fullDecode':'PASS','audio':'silent','alpha':False,'contact':str(contact)}
    results.append(item);(base/'mp4-verification.json').write_text(json.dumps({'verifiedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'results':results,'status':'PASS' if len(results)==2 else 'IN PROGRESS'},indent=2))
    print(json.dumps({'verified':aspect,'path':str(mp4)}),flush=True)
