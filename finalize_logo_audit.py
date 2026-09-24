import requests,os,hashlib,io,json,re,shutil
from PIL import Image
root=r'C:\Users\dillo\Documents\Codex\projects\client-operations\questionable-logo-audit-20260812'
verified=os.path.join(root,'verified'); quarantine=os.path.join(root,'quarantine')
os.makedirs(verified,exist_ok=True);os.makedirs(quarantine,exist_ok=True)
items=[
('Ciocca Pre-Owned Autos','https://pictures.dealer.com/c/cioccadealerships/1234/06f638b9bbf845a28eded997042bdc6b.png','ciocca-automotive.png',False,'Official Ciocca Automotive first-party asset, but it reads “Ciocca Automotive,” not “Ciocca Pre-Owned Autos”; exact prospect identity cannot be proved.','Official Ciocca Automotive search result/page asset; visual inspection.'),
('Legacy Jewelers','http://www.legacyjewelers.net/wp-content/uploads/2013/02/new-reside-logo.png','legacy-jewelers.png',True,'Complete first-party Legacy Jewelers wordmark/banner, including tagline; geometry and pixels unchanged.','Official homepage <img src> at legacyjewelers.net.'),
('Faulkner Buick GMC','https://pictures.dealer.com/f/faulknerponbuigmcinc/1789/54da609f174b6e0e3a42a1802afb0c05x.jpg','faulkner.png',False,'Official first-party header asset reads “Faulkner / TO BE SURE” but omits Buick GMC; no single complete exact prospect logo asset was provable.','Official faulknerauto.com image result served from its Dealer.com tenant.'),
('Hamburg Animal Hospital','https://www.hamburganimalhospital.com/sites/site-2100/images/064a4f38-7f00-0001-0699-a7e9df105492.jpg','hamburg-animal-hospital.jpg',True,'Complete first-party Hamburg Animal Hospital identity composite, including business name, veterinarian name, phone, and animal artwork; unchanged.','Official first-party About Us image; search result identifies it as the page image and prior page extraction labels it Hamburg Animal Hospital logo.'),
('Dinse Dental Care','http://www.dinsedentalcare.com/images/resources/dinsedentallogo.png','dinse-dental-care.png',True,'Complete first-party “dinse DENTAL CARE” logo, unchanged; supersedes the questionable half-height file.','Official homepage <img class="main-logo" alt="Dinse Dental Logo">.'),
('OSS Health','https://osshealth.com/uploads/images/logos/oss_logo.svg','oss-health.svg',True,'Complete official OSS Health vector logo, unchanged; supersedes the icon-only asset.','Official OSS Health Hanover page image result points directly to /uploads/images/logos/oss_logo.svg.'),
("Nicky's Thai Kitchen",'https://nickysthaikitchen.com/ntkimages/logo.JPG.png','nickys-thai-kitchen.png',True,'Complete first-party Nicky’s Thai Kitchen logo with both figures and full wording; unchanged.','Official homepage <img alt="Nicky’s Thai Kitchen">.'),
("Harry's Hotdogs",'https://harryshotdogs.com/wp-content/themes/wp-adora/images/brown/classic-logo.png','harrys-hotdogs.png',True,'Complete official standalone brand mark (H plus hotdog), unchanged; the official site intentionally uses the mark without word text.','Official theme CSS assigns classic-logo.png to #header; the overlaid .logo anchor is titled “Harry’s Hotdogs”.'),
('Riley Rodzianko & Clymer LLP','http://www.rrccpa.com/images/logo/335c4766a40b332763347d246eb08259.gif','riley-rodzianko-clymer.gif',False,'Official first-party header graphic reads only “CERTIFIED PUBLIC ACCOUNTANTS”; it omits the firm name, so a complete exact firm logo cannot be proved.','Official homepage #header_logo <img>; visual inspection shows no firm name.')]
s=requests.Session();s.headers['User-Agent']='Mozilla/5.0'
report=[]
for name,url,fn,ok,reason,evidence in items:
 r=s.get(url,timeout=40);r.raise_for_status();dest=os.path.join(verified if ok else quarantine,fn);open(dest,'wb').write(r.content)
 sha=hashlib.sha256(r.content).hexdigest();ctype=r.headers.get('content-type','')
 if 'svg' in ctype or fn.endswith('.svg'):
  m=re.search(rb'<svg[^>]*\bwidth="([^"]+)"[^>]*\bheight="([^"]+)"',r.content)
  dims={'width':int(float(m.group(1))) if m else None,'height':int(float(m.group(2))) if m else None}
 else:
  im=Image.open(io.BytesIO(r.content));dims={'width':im.width,'height':im.height}
 report.append({'business':name,'source_url':url,'local_downloaded_file_path':dest,'sha256':sha,'dimensions':dims,'complete_exact_logo':ok,'status':'verified' if ok else 'quarantined','evidence':evidence,'assessment':reason,'http_status':r.status_code,'content_type':ctype,'bytes':len(r.content)})
out={'audit_scope':'Nine questionable active-batch logo assets; official first-party sites/assets only. Batch was not edited or deployed.','summary':{'verified_complete_exact':sum(x['complete_exact_logo'] for x in report),'quarantined_not_provable':sum(not x['complete_exact_logo'] for x in report)},'items':report}
open(os.path.join(root,'report.json'),'w',encoding='utf-8').write(json.dumps(out,indent=2,ensure_ascii=False))
print(json.dumps(out,indent=2,ensure_ascii=False))