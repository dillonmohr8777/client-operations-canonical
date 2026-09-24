"""Composite the approved original head into clothing/background plates.
Original head pixels remain unchanged inside the saved protected-face mask.
"""
import json, hashlib, zipfile, sys
from pathlib import Path
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont
ROOT=Path(__file__).parent
CLEAN='--clean' in sys.argv
cfg=json.loads((ROOT/'composite-inputs.json').read_text(encoding='utf-8-sig'))
src=cv2.imread(cfg['source'])
h,w=src.shape[:2]
qa=ROOT/'qa';final=ROOT/('clean-portraits' if CLEAN else 'final');final.mkdir(exist_ok=True)

# Source alpha: GrabCut uses explicit foreground/background seeds around the head.
mask=np.zeros((h,w),np.uint8)
outer=np.array([(160,420),(155,305),(181,216),(230,160),(320,121),(430,111),(530,119),(607,151),(660,222),(674,354),(677,431),(710,478),(713,551),(690,629),(675,700),(650,772),(592,841),(541,879),(429,891),(352,845),(298,785),(255,716),(221,644),(204,557),(204,500)])
cv2.fillPoly(mask,[outer],cv2.GC_PR_FGD)
inner=np.array([(205,389),(205,306),(232,230),(284,179),(386,152),(490,153),(578,192),(627,269),(641,386),(637,475),(665,512),(663,574),(645,666),(612,755),(552,819),(481,845),(405,821),(334,771),(279,689),(250,608),(240,534)])
cv2.fillPoly(mask,[inner],cv2.GC_FGD)
# Neck is part of foreground for segmentation, but separately blended at the collar.
cv2.rectangle(mask,(330,810),(620,980),cv2.GC_PR_FGD,-1)
cv2.rectangle(mask,(390,835),(550,950),cv2.GC_FGD,-1)
cv2.grabCut(src,mask,None,np.zeros((1,65),np.float64),np.zeros((1,65),np.float64),7,cv2.GC_INIT_WITH_MASK)
binary=np.uint8((mask==cv2.GC_FGD)|(mask==cv2.GC_PR_FGD))
# Keep source head solid; softly blend only at the outside silhouette.
dist=cv2.distanceTransform(binary,cv2.DIST_L2,3)
edge_y=np.indices((h,w))[0]
source_hsv=cv2.cvtColor(src,cv2.COLOR_BGR2HSV)
background_fringe=(edge_y>450)&(source_hsv[:,:,1]<28)&(source_hsv[:,:,2]>80)&(dist<25)
binary[background_fringe]=0
dist=cv2.distanceTransform(binary,cv2.DIST_L2,3)
alpha=np.clip((dist-3.0)/4.0,0,1)
# Terminate below jaw; source neck blends into each donor neck.
yy,xx=np.indices((h,w))
bottom=np.clip((916-yy)/47,0,1)
alpha*=bottom
# The outer source neck below the jaw must not paint over collars.
neck_width=np.clip((yy-810)/100,0,1)
left=300+neck_width*70
right=647-neck_width*62
neck_edges=np.minimum(np.clip((xx-left)/18,0,1),np.clip((right-xx)/18,0,1))
alpha[yy>830]*=neck_edges[yy>830]
alpha=np.clip(alpha,0,1)
cv2.imwrite(str(qa/'source-head-alpha.png'),np.uint8(alpha*255))
# Verification includes all internal head pixels, not just a small eye/mouth sample.
protected=np.uint8(alpha>=0.99999)
cv2.imwrite(str(qa/'protected-face-mask.png'),protected*255)
logo=Image.open(cfg['logo']).convert('RGBA')
logo=logo.crop(logo.getbbox())
def embroidered_mark(width):
    """Satin stitch texture clipped to the exact official artwork, at 4x sampling."""
    scale=4
    height=round(width*logo.height/logo.width)
    mark=logo.resize((width*scale,height*scale),Image.Resampling.LANCZOS)
    arr=np.array(mark).astype(np.float32)
    a=arr[:,:,3]/255
    ty,tx=np.indices(a.shape)
    rng=np.random.default_rng(630)
    # Fine oblique threads with gentle raised edges, no flat rectangular backing.
    threads=0.94+0.095*np.cos((tx*0.72+ty)*2*np.pi/(2.05*scale))
    threads+=0.025*np.cos((tx-ty*0.15)*2*np.pi/(0.8*scale))
    threads+=rng.normal(0,0.016,a.shape)
    bump=cv2.GaussianBlur(a,(0,0),0.5*scale)
    gx=cv2.Sobel(bump,cv2.CV_32F,1,0,ksize=3)
    gy=cv2.Sobel(bump,cv2.CV_32F,0,1,ksize=3)
    bevel=np.clip((-gx-gy)*0.07,-0.16,0.18)
    arr[:,:,:3]=np.clip(arr[:,:,:3]*(threads+bevel)[:,:,None],0,255)
    mark=Image.fromarray(arr.astype(np.uint8),'RGBA').resize((width,height),Image.Resampling.LANCZOS)
    mark=mark.rotate(1.3,Image.Resampling.BICUBIC,expand=True)
    return mark
positions={
'01-classic-studio':(619,1120,150),
'02-navy-blazer':(115,1100,135),
'03-white-polo':(635,1150,140),
'04-blue-studio':(115,1105,135),
'05-creative-loft':(95,1110,140),
'06-black-polo':(628,1118,145),
'07-rooftop':(40,1140,135),
'08-brand-office':(641,1100,140),
'09-casual-hoodie':(625,1120,145),
'10-signature-blue':(634,1100,145)}
reports=[]; thumbs=[]
for name,f in cfg['files'].items():
    donor=cv2.imread(str(qa/(name+'-aligned.png')))
    # Remove decorative generated background wordmarks as whole background regions.
    if name=='03-white-polo':
        top_color=np.median(donor[210:230,0:175],axis=(0,1))
        bottom_color=np.median(donor[535:555,0:175],axis=(0,1))
        t=np.clip((yy-220)/325,0,1)
        clean=top_color[None,None,:]*(1-t[:,:,None])+bottom_color[None,None,:]*t[:,:,None]
        wall=np.clip((195-xx)/20,0,1)*np.clip((yy-220)/20,0,1)*np.clip((545-yy)/20,0,1)
        donor=np.uint8(np.rint(donor*(1-wall[:,:,None])+clean*wall[:,:,None]))
    if name=='06-black-polo':
        head_guard=protected.astype(float)
        background=(1-head_guard)*np.clip((310-yy)/60,0,1)
        left_color=np.median(donor[310:390,0:40],axis=(0,1))
        right_color=np.median(donor[310:390,810:850],axis=(0,1))
        clean=left_color[None,None,:]*(1-xx[:,:,None]/w)+right_color[None,None,:]*(xx[:,:,None]/w)
        donor=np.uint8(np.rint(donor*(1-background[:,:,None])+clean*background[:,:,None]))
    if name=='01-classic-studio':
        out=src.copy()
    else:
        # Remove generated clothing logos; official artwork is inserted below.
        hsv=cv2.cvtColor(donor,cv2.COLOR_BGR2HSV)
        old_logo_regions={'03-white-polo':(590,1185,852,1279),'04-blue-studio':(450,1140,730,1240),'06-black-polo':(585,1190,852,1279)}
        blue=np.zeros((h,w),bool)
        if name in old_logo_regions:
            bx,by,bx2,by2=old_logo_regions[name]
            blue=((hsv[:,:,0]>87)&(hsv[:,:,0]<120)&(hsv[:,:,1]>105)&(yy>by)&(yy<by2)&(xx>bx)&(xx<bx2))
        cleanup=np.uint8(blue)*255
        cleanup=cv2.dilate(cleanup,np.ones((9,9),np.uint8))
        if cleanup.any():
            donor=cv2.inpaint(donor,cleanup,5,cv2.INPAINT_TELEA)
        # Match only exposed donor-neck color to the source near the lower blend.
        s_patch=src[875:920,420:520].astype(float)
        d_patch=donor[875:920,420:520].astype(float)
        offset=np.median(s_patch,axis=(0,1))-np.median(d_patch,axis=(0,1))
        neck_weight=np.clip((yy-820)/50,0,1)*np.clip((1110-yy)/150,0,1)
        skin=((hsv[:,:,0]<23)&(hsv[:,:,1]>25)&(hsv[:,:,1]<165)&(hsv[:,:,2]>75)&(xx>310)&(xx<650))
        neck_weight*=skin
        donor=np.uint8(np.clip(donor.astype(float)+offset[None,None,:]*neck_weight[:,:,None]*0.85,0,255))
        out=np.uint8(np.rint(src.astype(float)*alpha[:,:,None]+donor.astype(float)*(1-alpha[:,:,None])))
        out[protected.astype(bool)]=src[protected.astype(bool)]
    # Exact existing logo artwork, resized once without redrawing.
    im=Image.fromarray(cv2.cvtColor(out,cv2.COLOR_BGR2RGB)).convert('RGBA')
    if not CLEAN:
        x,y,lw=positions[name]
        mark=embroidered_mark(lw)
        # A small thread-contact shadow follows only the mark, not a badge/plate.
        ma=np.array(mark.getchannel('A'))
        shadow_alpha=np.uint8(cv2.GaussianBlur(ma.astype(float),(0,0),0.55)*0.24)
        shadow=Image.new('RGBA',mark.size,(8,18,25,0))
        shadow.putalpha(Image.fromarray(shadow_alpha))
        im.alpha_composite(shadow,(x+1,y+1))
        # Follow the local garment lighting without changing the mark's geometry.
        garment=np.array(im.crop((x,y,x+mark.width,y+mark.height)))[:,:,:3].mean(axis=2)
        garment=cv2.GaussianBlur(garment.astype(np.float32),(0,0),4)
        shading=np.clip(1+(garment-garment.mean())/255*0.25,0.94,1.06)
        mark_arr=np.array(mark)
        mark_arr[:,:,:3]=np.uint8(np.clip(mark_arr[:,:,:3]*shading[:,:,None],0,255))
        mark=Image.fromarray(mark_arr)
        im.alpha_composite(mark,(x,y))
    im=im.convert('RGB')
    path=final/(name+'.png');im.save(path,optimize=True)
    result=cv2.imread(str(path))
    max_delta=int(np.abs(result[protected.astype(bool)].astype(int)-src[protected.astype(bool)].astype(int)).max())
    reports.append({'file':path.name,'width':w,'height':h,'protected_pixels':int(protected.sum()),'max_face_channel_difference':max_delta,'face_exact':max_delta==0,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
    thumbs.append((name,im.resize((256,384),Image.Resampling.LANCZOS)))
sheet=Image.new('RGB',(1280,856),'#f1f0ec');draw=ImageDraw.Draw(sheet)
for i,(name,im) in enumerate(thumbs):
    x=(i%5)*256;y=(i//5)*428
    sheet.paste(im,(x,y))
    draw.text((x+8,y+394),name,fill='#17202a')
sheet.save(ROOT/('CLEAN-PREVIEW.jpg' if CLEAN else 'HEADSHOTS-PREVIEW.jpg'),quality=94)
(qa/('clean-verification.json' if CLEAN else 'verification.json')).write_text(json.dumps({'method':'Lossless original source head composite; donor-only transforms; unbranded clothing' if CLEAN else 'Lossless original source head composite; donor-only transforms; official logo source composited','results':reports},indent=2))
print(json.dumps({'files':len(reports),'face_exact_all':all(r['face_exact'] for r in reports),'protected_pixels':int(protected.sum()),'max_face_channel_difference':max(r['max_face_channel_difference'] for r in reports)}))
