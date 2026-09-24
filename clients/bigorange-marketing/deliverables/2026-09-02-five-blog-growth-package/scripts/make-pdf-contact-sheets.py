from pathlib import Path
from PIL import Image, ImageDraw

root=Path(__file__).resolve().parents[1]/"tmp"/"pdf-render"
for folder in sorted(p for p in root.iterdir() if p.is_dir()):
    files=sorted(folder.glob("*.png"))
    if not files: continue
    thumbs=[]
    for f in files:
        im=Image.open(f).convert("RGB")
        im.thumbnail((306,396))
        canvas=Image.new("RGB",(326,430),"white")
        canvas.paste(im,((326-im.width)//2,10))
        ImageDraw.Draw(canvas).text((12,410),f.name,fill="black")
        thumbs.append(canvas)
    cols=4; rows=(len(thumbs)+cols-1)//cols
    sheet=Image.new("RGB",(cols*326,rows*430),(225,225,225))
    for i,im in enumerate(thumbs): sheet.paste(im,((i%cols)*326,(i//cols)*430))
    sheet.save(root/f"{folder.name}-contact-sheet.png")
