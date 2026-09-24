from pathlib import Path
import json,subprocess,io
from PIL import Image,ImageDraw
r=Path(__file__).resolve().parent
rows=json.loads((r/'render-receipt.json').read_text());assert len(rows)==6
sheet=Image.new('RGB',(1200,6*159),'white');d=ImageDraw.Draw(sheet)
for j,row in enumerate(rows):
 p=Path(row['file']);dur=float(row['probe']['format']['duration'])
 subprocess.run(['ffmpeg','-v','error','-i',str(p),'-f','null','-'],check=True)
 for i,t in enumerate([.4,1.6,3.5,dur*.55,dur-1.0]):
  b=subprocess.check_output(['ffmpeg','-v','error','-ss',str(t),'-i',str(p),'-frames:v','1','-vf','scale=240:-2','-f','image2pipe','-vcodec','mjpeg','-']);im=Image.open(io.BytesIO(b));sheet.paste(im,(i*240,j*159));d.text((i*240+3,j*159+139),f'{row["title"][:24]} {t:.1f}s',fill='black')
 row['decode']='passed'
sheet.save(r/'six-recuts-contact.jpg');(r/'verified-receipt.json').write_text(json.dumps(rows,indent=2));print('Six complete decodes and contact sheet passed')
