from pathlib import Path
from functools import lru_cache
import subprocess, json, math, io, sys, hashlib
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

R=Path(__file__).resolve().parent; V=R.parent; A=V/'assets'; OUT=R/'renders'
W,H,FPS=1920,1080,24
BLUE=(23,102,171); WHITE=(255,255,255); NAVY=(7,45,83)
FONT=A/'ArchivoBlack-Regular.ttf'; BODY=A/'NunitoSans.ttf'
SOURCE=next((V/'supplied-clips').glob('3-*.MP4'))
LOGO=Image.open(A/'momentum-logo.png').convert('RGBA')

@lru_cache(None)
def font(size,body=False): return ImageFont.truetype(str(BODY if body else FONT),size)
def ease(x):
    x=min(1,max(0,x));return x*x*(3-2*x)
def bg(top,bottom,grain=0):
    rng=np.random.default_rng(19)
    a=np.linspace(0,1,H)[:,None,None]
    c=np.array(top)[None,None,:]*(1-a)+np.array(bottom)[None,None,:]*a
    c=np.broadcast_to(c,(H,W,3)).copy()
    if grain:c+=rng.normal(0,grain,(H,W,1))
    return Image.fromarray(np.uint8(np.clip(c,0,255))).convert('RGBA')
PAPER_BLUE=bg((30,113,182),(8,54,103),1.0)
SYSTEM_BLUE=bg((6,31,67),(17,91,161))

def text(im,lines,x,y,size=114,color=WHITE,alpha=1,body=False,gap=1.08):
    assert color in [BLUE,WHITE], 'All authored typography must be blue or white'
    layer=Image.new('RGBA',im.size); d=ImageDraw.Draw(layer)
    for i,s in enumerate(lines):
        assert d.textbbox((0,0),s,font=font(size,body))[2]+x<=W-55,(s,size,x)
        d.text((x,y+i*size*gap),s,font=font(size,body),fill=(*color,int(255*alpha)))
    im.alpha_composite(layer)

def phase_text(im,t,beats,x,y,size=112,color=WHITE):
    for a,b,lines in beats:
        if a<=t<b:
            fade=min(ease((t-a)/.45),ease((b-t)/.4))
            text(im,lines,x,y+int(18*(1-fade)),size,color,fade)

def logo(im,x,y,width=410,back=True):
    h=round(LOGO.height*width/LOGO.width)
    if back:
        ImageDraw.Draw(im).rounded_rectangle((x-24,y-18,x+width+24,y+h+18),radius=5,fill=WHITE)
    im.alpha_composite(LOGO.resize((width,h),Image.Resampling.LANCZOS),(int(x),int(y)))

def plate(path,width,angle):
    p=Image.open(path).convert('RGBA')
    p=p.resize((width,round(p.height*width/p.width)),Image.Resampling.LANCZOS)
    p=p.rotate(angle,resample=Image.Resampling.BICUBIC,expand=True)
    canvas=Image.new('RGBA',(p.width+100,p.height+100))
    shadow=Image.new('RGBA',canvas.size);shadow.paste((0,13,35,100),(54,66),p.getchannel('A'))
    shadow=shadow.filter(ImageFilter.GaussianBlur(18));canvas.alpha_composite(shadow);canvas.alpha_composite(p,(30,20))
    return canvas
ROOTS=plate(R/'2-Photo-2.jpg',710,-7)
BIRDS=plate(R/'1-Photo-1.jpg',700,8)
PHILLY=plate(A/'philly-engraving.png',730,-5)

def tape(im,x,y,angle=0):
    tile=Image.new('RGBA',(205,56),(255,255,255,172))
    d=ImageDraw.Draw(tile)
    for k in range(5,200,13):d.line((k,0,k+3,56),fill=(255,255,255,35),width=1)
    tile=tile.rotate(angle,expand=True,resample=Image.Resampling.BICUBIC);im.alpha_composite(tile,(int(x),int(y)))

def scrapbook(t):
    im=PAPER_BLUE.copy(); d=ImageDraw.Draw(im)
    # Offset sheets and stitched lines remain behind a reserved title area.
    d.polygon([(980,70),(1890,0),(1920,1050),(920,1050),(943,941),(915,895),(949,829),(925,781)],fill=(255,255,255,230))
    d.line([(80,972),(1170,972),(1800,122)],fill=(255,255,255,115),width=2)
    for x in range(90,910,22):d.line((x,944,x+9,944),fill=(255,255,255,130),width=2)
    # Three separate physical compositions, not the same card with swapped copy.
    if t<5.4:
        im.alpha_composite(BIRDS,(1470,-350+int(t*8)))
        im.alpha_composite(ROOTS,(1050-int(45*ease(t/2)),-5-int(t*5)))
        tape(im,1240,50,-7)
    elif t<10.4:
        p=ease((t-5.4)/.6)
        im.alpha_composite(ROOTS,(1460,-310))
        im.alpha_composite(BIRDS,(1010+int(170*(1-p)),-25-int((t-5.4)*7)))
        tape(im,1220,46,8)
    else:
        im.alpha_composite(ROOTS,(1490,-350))
        im.alpha_composite(PHILLY,(1000,-40+int(14*math.sin(t*.4))))
        tape(im,1210,60,-5)
    text(im,['MOMENTUM / FIELD NOTES'],120,105,25,WHITE,body=True)
    phase_text(im,t,[(0,5.4,['Good ideas','take root.']),(5.4,10.4,['Give them','room to','grow.']),(10.4,13.2,['Make','your mark.']),(13.2,16,['Built','to grow.'])],120,330,116)
    if t<13.2:text(im,['Thoughtful strategy. Memorable creative.'],124,758,28,WHITE,body=True)
    else:logo(im,124,788,415)
    return im

def path_line(d,points,fill,width=2): d.line(points,fill=fill,width=width,joint='curve')
def signal(t):
    im=SYSTEM_BLUE.copy();d=ImageDraw.Draw(im)
    # A spatial signal field: nested lenses, moving paths and depth, no scrapbook material.
    drift=18*math.sin(t*.23)
    for j in range(14):
        pts=[]
        for x in range(0,W+20,20):
            y=int(180+j*67+85*math.sin(x/450+t*.18+j*.13))
            pts.append((x,y))
        path_line(d,pts,(76,151,212,34),1)
    cx,cy=1350+drift,532
    for j in range(8,0,-1):
        rx=100+j*47;ry=55+j*29
        d.ellipse((cx-rx,cy-ry,cx+rx,cy+ry),outline=(123,196,249,35+j*8),width=2 if j%2 else 1)
    nodes=[(1100,330,'ASK'),(1555,445,'UNDERSTAND'),(1285,755,'ACT')]
    points=[(1100,330),(1555,445),(1285,755),(1100,330)]
    path_line(d,points,(255,255,255,95),2)
    for a,b in zip(points,points[1:]):
        q=(t*.22)%1;px=a[0]+(b[0]-a[0])*q;py=a[1]+(b[1]-a[1])*q
        d.ellipse((px-5,py-5,px+5,py+5),fill=WHITE)
    for j,(x,y,label) in enumerate(nodes):
        lift=10*math.sin(t*.75+j)
        d.polygon([(x-132,y-38+lift),(x+112,y-70+lift),(x+154,y+40+lift),(x-89,y+71+lift)],fill=(2,25,58,180))
        d.polygon([(x-138,y-61+lift),(x+106,y-93+lift),(x+148,y+17+lift),(x-95,y+48+lift)],fill=(255,255,255,235),outline=(255,255,255,255))
        # Text remains level and whole while the floating base moves beneath it.
        text(im,[label],int(x-110),int(y-42+lift),34,BLUE,body=True)
    d=ImageDraw.Draw(im)
    for ang in [t*.45,t*.45+2.1,t*.45+4.2]:
        x=cx+450*math.cos(ang);y=cy+265*math.sin(ang)
        d.ellipse((x-8,y-8,x+8,y+8),fill=WHITE)
    text(im,['MOMENTUM / SIGNAL SYSTEM'],120,105,25,WHITE,body=True)
    phase_text(im,t,[(0,4.8,['Find the','signal.']),(4.8,9.4,['Make the','next move.']),(9.4,13.1,['See the','whole picture.']),(13.1,16,['Clarity','in motion.'])],120,324,112)
    if t<13.1:text(im,['Ask. Understand. Act.'],124,761,29,WHITE,body=True)
    else:logo(im,124,795,410)
    return im

@lru_cache(12)
def source_still(t):
    b=subprocess.check_output(['ffmpeg','-v','error','-ss',str(t),'-i',str(SOURCE),'-frames:v','1','-f','image2pipe','-vcodec','mjpeg','-'])
    return Image.open(io.BytesIO(b)).convert('RGBA').resize((W,H))

def momo(t,frame=None):
    # Use one consistent supplied Momo identity. No alternate bot, old UI or burned-in text.
    if t<8:
        im=(frame if frame is not None else source_still(round(t,2))).copy().convert('RGBA')
        text(im,['MOMENTUM / MEET MOMO'],105,94,24,BLUE,body=True)
        # Keep the supplied Momo face unobstructed; the copy lives in the clear upper-right field.
        phase_text(im,t,[(0,3.7,['A little','more Momo.']),(3.7,8,['Small face.','Big ideas.'])],1350,150,64,BLUE)
    else:
        im=Image.new('RGBA',(W,H),WHITE)
        # A clean studio spread with an oversized object crop and cobalt brand panel.
        still=source_still(4.0).crop((700,80,1760,1030)).resize((910,817),Image.Resampling.LANCZOS)
        im.alpha_composite(still,(40,165))
        d=ImageDraw.Draw(im); d.rectangle((1010,0,W,H),fill=BLUE)
        phase_text(im,t,[(8,11.3,['Human ideas.','A sharper','toolkit.']),(11.3,14,['Meet','Momo.'])],1095,320,84,WHITE)
        if t>=11.3:logo(im,1100,760,570)
    return im

FILMS=[('momentum-built-to-grow','Built to Grow',scrapbook,16),('momentum-signal-system','Signal System',signal,16),('momentum-momo-studio','Momo Studio',momo,14)]

def preview():
    sheet=Image.new('RGB',(1536,3*240),'white');d=ImageDraw.Draw(sheet)
    for j,(slug,title,fn,dur) in enumerate(FILMS):
        for i,t in enumerate([1.4,5.9,10.4,dur-1.2]):
            frame=fn(t).convert('RGB');frame.thumbnail((384,216));sheet.paste(frame,(384*i,240*j));d.text((384*i+8,240*j+220),f'{title} / {t:.1f}s',fill='black')
    sheet.save(R/'three-directions-preview.jpg');print('Three distinct direction previews ready',flush=True)

def render():
    rows=[]
    for slug,title,fn,dur in FILMS:
        output=OUT/(slug+'.mp4');decoder=None
        if fn==momo:decoder=subprocess.Popen(['ffmpeg','-v','error','-i',str(SOURCE),'-vf','fps=24,scale=1920:1080','-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE)
        enc=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s','1920x1080','-r',str(FPS),'-i','-','-an','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',str(output)],stdin=subprocess.PIPE)
        for i in range(dur*FPS):
            t=i/FPS
            if decoder is not None and t<8:
                b=decoder.stdout.read(W*H*3);assert len(b)==W*H*3
                im=momo(t,Image.frombytes('RGB',(W,H),b))
            else:im=fn(t)
            enc.stdin.write(im.convert('RGB').tobytes())
        enc.stdin.close();assert enc.wait()==0
        if decoder is not None:decoder.stdout.close();decoder.terminate();decoder.wait()
        subprocess.run(['ffmpeg','-v','error','-i',str(output),'-f','null','-'],check=True)
        row={'title':title,'path':str(output),'bytes':output.stat().st_size,'sha256':hashlib.sha256(output.read_bytes()).hexdigest(),'seconds':dur,'resolution':'1920x1080','fps':FPS,'audio':'silent visual review','fullDecode':'passed'};rows.append(row)
        (R/'render-receipt.json').write_text(json.dumps(rows,indent=2));print(json.dumps(row),flush=True)
    print('Three distinct films rendered and decoded',flush=True)

if __name__=='__main__':
    preview() if '--preview' in sys.argv else render()
