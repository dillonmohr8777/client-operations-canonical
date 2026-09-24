import requests,os,hashlib,io,json
from PIL import Image,ImageOps,ImageDraw
urls={
'legacy':'http://www.legacyjewelers.net/wp-content/uploads/2013/02/new-reside-logo.png',
'hamburg_header':'https://www.hamburganimalhospital.com/images/html/bamboo_responsive/style04/1.0/images/b/headerimage.png',
'hamburg_portrait':'https://www.hamburganimalhospital.com/sites/site-2100/images/064a4f38-7f00-0001-0699-a7e9df105492.jpg',
'dinse':'http://www.dinsedentalcare.com/images/resources/dinsedentallogo.png',
'nicky':'https://nickysthaikitchen.com/ntkimages/logo.JPG.png',
'harry_classic':'https://harryshotdogs.com/wp-content/themes/wp-adora/images/brown/classic-logo.png',
'harry_transp':'https://harryshotdogs.com/wp-content/themes/wp-adora/images/brown/transp-logo.png',
'harry_hero':'http://harryshotdogs.com/wp-content/uploads/2011/05/hotdoghighres-850x250.png',
'riley':'http://www.rrccpa.com/images/logo/335c4766a40b332763347d246eb08259.gif',
'oss_icon':'https://osshealth.com/apple-touch-icon.png',
'ciocca_bad':'https://www.cioccasubaru.com/static/v8/global/images/franchise-logos/auto/s/subaru/white/183x125.png?r=1786363328000',
'faulkner_bad':'https://pictures.dealer.com/d/demogm/1234/53db39049c6f4b34a0bd1a1dc44c31d8.png'}
out=r'C:\Users\dillo\Documents\Codex\projects\client-operations\logo-audit-candidates';os.makedirs(out,exist_ok=True)
res=[]; thumbs=[]
for n,u in urls.items():
 try:
  r=requests.get(u,headers={'User-Agent':'Mozilla/5.0'},timeout=30); ext='.svg' if 'svg' in r.headers.get('content-type','') else '.png'; p=os.path.join(out,n+ext);open(p,'wb').write(r.content)
  im=Image.open(io.BytesIO(r.content)); res.append({'name':n,'url':u,'status':r.status_code,'path':p,'bytes':len(r.content),'sha256':hashlib.sha256(r.content).hexdigest(),'dimensions':im.size,'mode':im.mode})
  im.thumbnail((500,260)); bg=Image.new('RGB',(540,320),'#dddddd'); x=(540-im.width)//2;y=30+(260-im.height)//2
  if im.mode=='RGBA': bg.paste(im,(x,y),im)
  else: bg.paste(im.convert('RGB'),(x,y))
  ImageDraw.Draw(bg).text((10,295),n,fill='black'); thumbs.append(bg)
 except Exception as e: res.append({'name':n,'url':u,'error':str(e)})
W=1080;H=((len(thumbs)+1)//2)*320; sheet=Image.new('RGB',(W,H),'white')
for i,im in enumerate(thumbs):sheet.paste(im,((i%2)*540,(i//2)*320))
sheet.save(os.path.join(out,'contact-sheet.jpg'),quality=90)
print(json.dumps(res,indent=2))