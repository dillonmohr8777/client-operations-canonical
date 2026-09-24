from pathlib import Path
import zipfile,json,hashlib
root=Path(__file__).resolve().parent
source=root.parent/'2026-09-08-claude-design-ebooks'
out=source/'out'
names=['Show Up When They Ask AI','From Missed Call to Booked Job','Built Not Prompted','The Small Business AI Operating System','Names Not Numbers']
readme='''MOMENTUM AI FIELD NOTES: ARCHIVAL INTERACTIVE EDITIONS

Private design/content review. Existing publication gates remain visible.

Extract this entire ZIP before opening any ebookN-standalone.html in your browser.
Keep the included image files beside the HTML files. The HTML editions contain
the motion, Contents navigation, source controls and interactive worksheets.
The PDF folder contains static reading companions; PDF does not preserve motion.

Native Claude Design canvas (requires your authenticated Claude account):
https://claude.ai/code/artifact/e9ce7032-81b1-4970-9aca-4d39a23eafc0
Use its Pages menu to select a book, then Play interactive artboard.

Books:
'''+''.join(f'{i+1}. {n}\n' for i,n in enumerate(names))+'''
The editable folder includes the native canvas bundle and generator.
These editions supersede the earlier locally typeset ebook text proofs.
'''
dest=root/'Momentum-Five-Interactive-Ebooks-Archival.zip'
with zipfile.ZipFile(dest,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
    z.writestr('START-HERE.txt',readme)
    for i,name in enumerate(names,1):
        z.write(out/f'ebook{i}-standalone.html',f'ebook{i}-standalone.html')
        z.write(out/f'ebook{i}-REVIEW-DRAFT.pdf',f'PDF/{i:02d}-{name}-REVIEW-DRAFT.pdf')
    for f in out.glob('*.jpg'):z.write(f,f.name)
    for name in ('momentum-logo.png','momentum-mark.png'):z.write(out/name,name)
    for name in ('build_ebook.py','momentum-ai-launch-collateral.html','RECEIPT.md'):
        f=source/name
        if f.exists():z.write(f,'editable/'+name)
    for f in source.glob('*RECEIPT*.md'):
        if f.name!='RECEIPT.md':z.write(f,'editable/'+f.name)
    z.write(root/'book-content-checks.json','verification/book-content-checks.json')
with zipfile.ZipFile(dest) as z:assert z.testzip() is None
receipt={'file':str(dest),'bytes':dest.stat().st_size,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'books':names,'native_canvas':'https://claude.ai/code/artifact/e9ce7032-81b1-4970-9aca-4d39a23eafc0'}
(root/'designed-book-bundle.json').write_text(json.dumps(receipt,indent=2))
print(json.dumps(receipt))
