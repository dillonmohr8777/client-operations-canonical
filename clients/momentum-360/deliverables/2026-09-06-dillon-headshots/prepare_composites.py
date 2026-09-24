import json
from pathlib import Path
import numpy as np
import cv2
from PIL import Image, ImageDraw
ROOT=Path(__file__).parent
cfg=json.loads((ROOT/'composite-inputs.json').read_text())
src=cv2.imread(cfg['source'])
h,w=src.shape[:2]
qa=ROOT/'qa'; qa.mkdir(exist_ok=True)
sift=cv2.SIFT_create(nfeatures=5000)
mask=np.zeros((h,w),np.uint8); mask[120:900,180:710]=255
k1,d1=sift.detectAndCompute(cv2.cvtColor(src,cv2.COLOR_BGR2GRAY),mask)
thumbs=[]
for name,f in cfg['files'].items():
    if not f: arr=src.copy()
    else:
        arr=cv2.imread(str(Path(cfg['generated_dir'])/f))
        arr=cv2.resize(arr,(w,h))
        k2,d2=sift.detectAndCompute(cv2.cvtColor(arr,cv2.COLOR_BGR2GRAY),None)
        pairs=cv2.BFMatcher().knnMatch(d2,d1,k=2)
        good=[a for a,b in pairs if a.distance < 0.76*b.distance]
        p2=np.float32([k2[m.queryIdx].pt for m in good])
        p1=np.float32([k1[m.trainIdx].pt for m in good])
        mat,inliers=cv2.estimateAffinePartial2D(p2,p1,method=cv2.RANSAC,ransacReprojThreshold=5)
        print(name,len(good),int(inliers.sum()) if inliers is not None else 0,mat.tolist() if mat is not None else None)
        if mat is not None:
            arr=cv2.warpAffine(arr,mat,(w,h),flags=cv2.INTER_CUBIC,borderMode=cv2.BORDER_REFLECT_101)
    cv2.imwrite(str(qa/(name+'-aligned.png')),arr)
    im=Image.fromarray(cv2.cvtColor(arr,cv2.COLOR_BGR2RGB)).resize((256,384))
    draw=ImageDraw.Draw(im)
    for y in range(0,1280,100):
        draw.line((0,y*.3,256,y*.3),fill=(255,0,0),width=1)
        draw.text((1,y*.3),str(y),fill='yellow')
    for x in range(0,853,100):
        draw.line((x*.3,0,x*.3,384),fill=(255,0,0),width=1)
        draw.text((x*.3,15),str(x),fill='yellow')
    thumbs.append((name,im))
sheet=Image.new('RGB',(256*5,414*2),'#eeeeee')
draw=ImageDraw.Draw(sheet)
for i,(name,im) in enumerate(thumbs):
    x=(i%5)*256;y=(i//5)*414
    sheet.paste(im,(x,y));draw.text((x+5,y+388),name,fill='black')
sheet.save(qa/'aligned-contact.jpg')

