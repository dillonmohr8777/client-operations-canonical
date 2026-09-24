from pathlib import Path
import json,subprocess,io,math,hashlib
from PIL import Image,ImageDraw,ImageFont,ImageFilter
R=Path(__file__).resolve().parent; V=R.parent; OUT=R/'renders';OUT.mkdir(exist_ok=True)
refs=sorted((V/'supplied-clips').glob('*.MP4'));paper=Image.open(R/'paper.png').convert('RGB').resize((1920,1080))
font=ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf',62)
small=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',22)
# Source-derived recuts retain the supplied animation, exact typography and material.
# No generated media, replacement soundtrack, or unverified interface copy.
films=[
 {'id':'momentum-compound-reference','title':'Great ads compound.','shots':[(0,0.0,8.7),(0,21.0,29.708)],'frame':(0,6.3)},
 {'id':'momentum-answer-engine-reference','title':'Be part of the answer.','shots':[(0,14.4,21.05),(1,10.7,15.2),(0,24.7,29.708)],'frame':(0,16.2)},
 {'id':'momentum-everywhere-reference','title':'Everywhere they ask.','shots':[(0,8.65,14.5),(0,18.45,24.25),(0,24.9,29.708)],'frame':(0,12.8)},
 {'id':'momentum-chatgpt-ads-reference','title':'The next conversation.','shots':[(1,4.75,15.25),(1,17.75,23.65),(1,24.4,28.709)],'frame':(1,12.8)},
 {'id':'momentum-before-after-reference','title':'Same market. Different answer.','shots':[(0,0.0,8.7),(1,16.0,20.0),(0,21.0,29.708)],'frame':(0,7.0)},
 {'id':'momentum-momo-reference','title':'Meet Momo.','shots':[(2,0.0,3.6),(1,0.65,15.25),(1,17.75,28.709)],'frame':(2,3.0)}
]
def cmd(args):subprocess.run(args,check=True,stdout=subprocess.DEVNULL)
def grab(k,t):
 b=subprocess.check_output(['ffmpeg','-v','error','-ss',str(t),'-i',str(refs[k]),'-frames:v','1','-f','image2pipe','-vcodec','mjpeg','-']);return Image.open(io.BytesIO(b)).convert('RGB')
def intro_frame(shot,title,t):
 im=paper.copy();d=ImageDraw.Draw(im)
 # X reference: framed source contracts to a small image insertion between brackets.
 p=min(1,max(0,(t-.25)/1.0));e=1-(1-p)**3
 ww=int(1580*(1-e)+178*e);hh=int(ww*9/16);thumb=shot.resize((ww,hh),Image.Resampling.LANCZOS)
 x=(1920-ww)//2;y=int(510-hh/2-140*e)
 shadow=Image.new('RGBA',im.size);sd=ImageDraw.Draw(shadow);sd.rectangle((x+10,y+20,x+ww+10,y+hh+20),fill=(57,44,29,70));shadow=shadow.filter(ImageFilter.GaussianBlur(22));im=Image.alpha_composite(im.convert('RGBA'),shadow);im.paste(thumb,(x,y))
 d=ImageDraw.Draw(im)
 if t>.85:
  alpha=min(1,(t-.85)/.35);color=tuple(int(235+(v-235)*alpha) for v in (24,26,25));txt='{ '+title+' }';box=d.textbbox((0,0),txt,font=font);d.text(((1920-box[2])/2,590),txt,font=font,fill=color)
  d.rectangle((730,356,738,364),fill=color);d.rectangle((1182,420,1190,428),fill=color)
 return im.convert('RGB')
def make_intro(f):
 p=OUT/(f['id']+'-intro.mp4');shot=grab(*f['frame']);proc=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s','1920x1080','-r','24','-i','-','-an','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p',str(p)],stdin=subprocess.PIPE)
 for i in range(48):proc.stdin.write(intro_frame(shot,f['title'],i/24).tobytes())
 proc.stdin.close();assert proc.wait()==0;return p
if __name__=='__main__':
 import sys
 if '--preview' in sys.argv:
  sheet=Image.new('RGB',(1280,720),'#eee')
  for i,f in enumerate(films):
   a=intro_frame(grab(*f['frame']),f['title'],1.6);a.thumbnail((640,360));sheet.paste(a,(i%2*640,i//2*240))
  sheet.save(R/'preview-intros.jpg');print('Preview ready',flush=True)
 else:
  receipt=[]
  for f in films:
   intro=make_intro(f);args=['ffmpeg','-v','error','-y','-i',str(intro)]
   for k,a,b in f['shots']:args+=['-ss',str(a),'-t',str(b-a),'-i',str(refs[k])]
   filters=[]
   for i in range(len(f['shots'])+1):filters.append(f'[{i}:v]fps=24,scale=1920:1080:flags=lanczos,setsar=1,setpts=PTS-STARTPTS[v{i}]')
   filters.append(''.join(f'[v{i}]' for i in range(len(f['shots'])+1))+f'concat=n={len(f["shots"])+1}:v=1:a=0[v]')
   output=OUT/(f['id']+'.mp4');cmd(args+['-filter_complex',';'.join(filters),'-map','[v]','-an','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',str(output)])
   info=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration:stream=codec_type,width,height','-of','json',str(output)]));row={**f,'file':str(output),'bytes':output.stat().st_size,'sha256':hashlib.sha256(output.read_bytes()).hexdigest(),'probe':info,'status':'rendered_review_cut','audio':'silent; no replacement music added','method':'source-preserving recut with X-inspired framed-to-type opening'};receipt.append(row);(R/'render-receipt.json').write_text(json.dumps(receipt,indent=2));print(json.dumps({'rendered':f['id'],'bytes':row['bytes']}),flush=True)
  print('All six review recuts rendered',flush=True)
