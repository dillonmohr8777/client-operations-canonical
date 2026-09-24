"""Render existing manuscripts into a private review library; no model calls."""
from pathlib import Path
import re, json, shutil, hashlib, html, urllib.request
import yaml, markdown, fitz
from bs4 import BeautifulSoup, NavigableString
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, Image, KeepTogether
import sys
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / '_print'))
from ebook import render as render_ebook  # one ebook renderer, shared with the Claude Design edition's manuscripts

ROOT = Path(__file__).resolve().parent
BASE = ROOT.parent
BATCH = BASE / '2026-09-07-google-aistudio-batch'
OUT = ROOT / 'library'
for d in ['01_PDFs', '02_Artwork', '03_Videos', '04_Review_Extras', '05_Editable_Sources']:
    (OUT / d).mkdir(parents=True, exist_ok=True)
(ROOT / 'qa').mkdir(exist_ok=True)
(ROOT / 'fonts').mkdir(exist_ok=True)
font = ROOT / 'fonts/ArchivoBlack-Regular.ttf'
if not font.exists():
    urllib.request.urlretrieve('https://raw.githubusercontent.com/google/fonts/main/ofl/archivoblack/ArchivoBlack-Regular.ttf', font)
for name, path in [('Display', font), ('Body', Path('C:/Windows/Fonts/georgia.ttf')), ('BodyBold', Path('C:/Windows/Fonts/georgiab.ttf')), ('BodyItalic', Path('C:/Windows/Fonts/georgiai.ttf')), ('Sans', Path('C:/Windows/Fonts/calibri.ttf')), ('SansBold', Path('C:/Windows/Fonts/calibrib.ttf'))]:
    pdfmetrics.registerFont(TTFont(name, str(path)))
pdfmetrics.registerFontFamily('Body', normal='Body', bold='BodyBold', italic='BodyItalic', boldItalic='BodyBold')
pdfmetrics.registerFontFamily('Sans', normal='Sans', bold='SansBold', italic='Sans', boldItalic='SansBold')
INK, BLUE, PAPER, MUTED = map(colors.HexColor, ['#14181b', '#1e73be', '#fbfaf7', '#565f64'])
LOGO = BATCH / 'design/momentum-logo.png'
records = []

def sha(p):
    h = hashlib.sha256()
    with p.open('rb') as f:
        for chunk in iter(lambda:f.read(1024*1024), b''): h.update(chunk)
    return h.hexdigest()

def inline(node):
    if isinstance(node, NavigableString): return html.escape(str(node))
    inside = ''.join(inline(x) for x in node.children)
    if node.name in ('strong','b'): return '<b>'+inside+'</b>'
    if node.name in ('em','i'): return '<i>'+inside+'</i>'
    if node.name == 'br': return '<br/>'
    if node.name == 'a' and node.get('href','').startswith(('https://','http://')):
        return '<link href="'+html.escape(node['href'],quote=True)+'" color="#1e73be">'+inside+'</link>'
    if node.name in ('code','pre'): return inside
    return inside

def source(p):
    raw=p.read_text(encoding='utf-8-sig')
    meta={}
    if raw.startswith('---\n') or raw.startswith('---\r\n'):
        parts=raw.split('---',2)
        if len(parts)==3:
            try: meta=yaml.safe_load(parts[1]) or {}; raw=parts[2].strip()
            except yaml.YAMLError: pass
    title=meta.get('title') or (re.search(r'^#\s+(.+)',raw,re.M).group(1) if re.search(r'^#\s+(.+)',raw,re.M) else p.stem.replace('-',' '))
    return str(title),meta,raw

def make_pdf(src, filename, category, number):
    title,meta,raw=source(src)
    ebook=category=='EBOOK'
    size=(468,648) if ebook else (612,792)
    margin=43 if ebook else 48
    width=size[0]-2*margin
    target=OUT/'01_PDFs'/filename
    styles={
      'p':ParagraphStyle('p',fontName='Body',fontSize=10.3 if ebook else 10.5,leading=15.2,textColor=INK,spaceAfter=8,splitLongWords=True),
      'h1':ParagraphStyle('h1',fontName='Display',fontSize=23,leading=28,textColor=BLUE,spaceBefore=16,spaceAfter=12,keepWithNext=True),
      'h2':ParagraphStyle('h2',fontName='Display',fontSize=18,leading=22,textColor=BLUE,spaceBefore=16,spaceAfter=10,keepWithNext=True),
      'h3':ParagraphStyle('h3',fontName='SansBold',fontSize=13,leading=17,textColor=INK,spaceBefore=12,spaceAfter=7,keepWithNext=True),
      'small':ParagraphStyle('small',fontName='Sans',fontSize=8.5,leading=11.5,textColor=MUTED,spaceAfter=7,splitLongWords=True),
      'cell':ParagraphStyle('cell',fontName='Sans',fontSize=8.2,leading=11,textColor=INK,splitLongWords=True),
      'cover':ParagraphStyle('cover',fontName='Display',fontSize=35 if ebook else 38,leading=40 if ebook else 44,textColor=INK,spaceAfter=20),
    }
    story=[]
    story.append(Paragraph(f'MOMENTUM AI / {category} {number:02d}',styles['small']))
    story.append(Spacer(1,28))
    story.append(Paragraph(html.escape(title),styles['cover']))
    subtitle=meta.get('subtitle','')
    if subtitle: story.append(Paragraph(html.escape(str(subtitle)),styles['p']))
    story.append(Paragraph('Dillon Mohr · Momentum Digital',styles['small']))
    if ebook:
        covers=['bird-plate.jpg','page-writes.jpg','fold.jpg','paper-city.jpg','particles-cream.jpg']
        art=BATCH/'design'/covers[(number-1)%5]
        if art.exists():
            im=Image(str(art)); ratio=im.imageHeight/im.imageWidth
            im.drawWidth=width; im.drawHeight=min(width*ratio,190)
            if im.drawHeight!=width*ratio: im.drawWidth=im.drawHeight/ratio
            im.hAlign='LEFT'; story.extend([Spacer(1,8),im])
    story.extend([Spacer(1,18),Paragraph('PRIVATE REVIEW EDITION · SEPTEMBER 2026',styles['small']),Paragraph('Complete source draft, formatted for your review. Publication status and open decisions are preserved inside.',styles['small']),PageBreak()])
    story.append(Paragraph('Before this goes public',styles['h1']))
    note=meta.get('publishable_reason') or 'This is an internal review copy. Offers, pricing, first-person claims, client examples and delivery promises require their existing approvals before public use. This PDF export does not change the source approval status.'
    story.append(Paragraph(html.escape(str(note)),styles['p']))
    story.append(Paragraph('Source: '+html.escape(src.name),styles['small']))
    story.append(Paragraph('Typography: Archivo Black display, Georgia reading text and Calibri utility text. Georgia is a print-specific reading choice; the existing Momentum web design system is unchanged.',styles['small']))
    soup=BeautifulSoup(markdown.markdown(raw,extensions=['tables','fenced_code','sane_lists']), 'html.parser')
    headings=[h.get_text(' ',strip=True) for h in soup.find_all('h2')]
    if headings:
        if ebook: story.append(PageBreak())
        story.append(Paragraph('Inside',styles['h2']))
        for i,h in enumerate(headings,1): story.append(Paragraph(f'{i:02d} / '+html.escape(h),styles['small']))
    story.append(PageBreak())
    for node in soup.children:
        if isinstance(node,NavigableString): continue
        tag=node.name
        if tag in ('h1','h2','h3','h4','h5','h6'):
            style=styles[tag] if tag in styles else styles['h3']
            story.append(Paragraph(inline(node),style))
        elif tag=='p': story.append(Paragraph(inline(node),styles['p']))
        elif tag in ('ul','ol'):
            for i,li in enumerate(node.find_all('li',recursive=False),1):
                bullet=str(i)+'.' if tag=='ol' else '•'
                ps=ParagraphStyle('li',parent=styles['p'],leftIndent=13,firstLineIndent=-10)
                story.append(Paragraph(bullet+' '+inline(li),ps))
        elif tag=='table':
            rows=[]
            for tr in node.find_all('tr'):
                cells=tr.find_all(['th','td'],recursive=False)
                if cells: rows.append([Paragraph(inline(c),styles['cell']) for c in cells])
            if rows:
                cols=max(map(len,rows)); rows=[r+[Paragraph('',styles['cell'])]*(cols-len(r)) for r in rows]
                table=Table(rows,colWidths=[width/cols]*cols,repeatRows=1,hAlign='LEFT')
                table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#eceae4')),('VALIGN',(0,0),(-1,-1),'TOP'),('LINEBELOW',(0,0),(-1,0),0.8,BLUE),('LINEBELOW',(0,1),(-1,-1),0.3,colors.HexColor('#dddddd')),('LEFTPADDING',(0,0),(-1,-1),6),('RIGHTPADDING',(0,0),(-1,-1),6),('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6)]))
                story.extend([table,Spacer(1,10)])
        elif tag in ('blockquote','pre'):
            story.append(Paragraph(html.escape(node.get_text('\n',strip=True)).replace('\n','<br/>'),styles['small']))
        elif tag=='hr': story.append(Spacer(1,12))
        else:
            text=node.get_text(' ',strip=True)
            if text: story.append(Paragraph(html.escape(text),styles['p']))
    def page(c,doc):
        c.saveState(); w,h=size
        c.setStrokeColor(BLUE); c.setLineWidth(1); c.line(margin,h-26,w-margin,h-26)
        c.setFont('Sans',7); c.setFillColor(MUTED)
        c.drawString(margin,23,'MOMENTUM AI · PRIVATE REVIEW · '+category)
        c.drawRightString(w-margin,23,str(doc.page))
        if doc.page==1 and LOGO.exists():
            c.drawImage(str(LOGO),margin,42,width=105,height=24,mask='auto',preserveAspectRatio=True,anchor='sw')
        c.restoreState()
    doc=SimpleDocTemplate(str(target),pagesize=size,leftMargin=margin,rightMargin=margin,topMargin=43,bottomMargin=49,title=title,author='Dillon Mohr',allowSplitting=True)
    if ebook: render_ebook(src, target, number)  # Momentum tokens + print kit; the QA below still applies
    else: doc.build(story,onFirstPage=page,onLaterPages=page)
    with fitz.open(target) as pdf:
        extracted=' '.join(p.get_text() for p in pdf)
        assert len(extracted)>max(100,len(soup.get_text())*.85), (target,'text completeness')
        bounds=[]
        for i,p in enumerate(pdf):
            for block in p.get_text('dict')['blocks']:
                for line in block.get('lines',[]):
                    for span in line['spans']:
                        x0,y0,x1,y1=span['bbox']
                        if x0 < -1 or y0 < -1 or x1 > p.rect.width+1 or y1 > p.rect.height+1: bounds.append(i+1)
        assert not bounds,(target,'out of page text',bounds)
        if ebook:
            pdf[0].get_pixmap(matrix=fitz.Matrix(1.5,1.5)).save(OUT/'02_Artwork'/f'ebook-{number:02d}-cover.png')
        sample=sorted(set([0,min(2,len(pdf)-1),len(pdf)//2,len(pdf)-1]))
        for i in sample: pdf[i].get_pixmap(matrix=fitz.Matrix(.8,.8)).save(ROOT/'qa'/f'{filename[:-4]}-p{i+1}.png')
        rec={'file':str(target.relative_to(OUT)), 'title':title,'category':category,'pages':len(pdf),'status':'PRIVATE REVIEW DRAFT','source':str(src),'source_sha256':sha(src),'sha256':sha(target),'bytes':target.stat().st_size,'publication_notes':str(note)}
    records.append(rec)
    shutil.copy2(src,OUT/'05_Editable_Sources'/f'{category.lower()}-{src.name}')
    print(f'{filename}: {rec["pages"]} pages',flush=True)

def main():
    for i,p in enumerate(sorted((BATCH/'content/ebooks').glob('*.md')),1): make_pdf(p,'Ebook-'+p.stem+'.pdf','EBOOK',i)
    if '--ebooks' in sys.argv: return print(json.dumps({'ebooks':len(records),'pages':sum(r['pages'] for r in records)}))
    for i,p in enumerate(sorted((BATCH/'content/blog').glob('[0-9]*.md')),1): make_pdf(p,'Article-'+p.stem+'.pdf','ARTICLE',i)
    plans=BASE/'2026-09-07-ai-division-claude-design'
    for i,name in enumerate(['MARKETING-PLAN','POSITIONING','PRICE','VIDEO-PLAN','MAC-ASKS'],1): make_pdf(plans/(name+'.md'),name+'.pdf','PLANNING',i)
    for i,p in enumerate([BASE/'2026-09-04-ai-division-plan/PLAN.md',BASE/'2026-09-05-ai-division-launch-kit/DIVISION.md'],6):
        if p.exists(): make_pdf(p,('BUSINESS-PLAN' if p.name=='PLAN.md' else 'DIVISION-BLUEPRINT')+'.pdf','PLANNING',i)
    deck=BASE/'2026-09-05-ai-division-launch-kit/deck-addendum/output/Momentum-AI-Division-Addendum.pdf'
    if deck.exists():
        dest=OUT/'01_PDFs/REVIEW-Momentum-AI-Division-Addendum.pdf'
        pdf=fitz.open(deck)
        for page in pdf:
            page.insert_text((18,page.rect.height-10),'PRIVATE REVIEW COPY | Existing proposal | Approval status unchanged',fontsize=7,color=(.3,.3,.3))
        pdf.save(dest); pages=len(pdf); pdf.close()
        records.append({'file':str(dest.relative_to(OUT)),'title':'Momentum AI Division deck addendum','category':'DECK','pages':pages,'status':'PRIVATE REVIEW DRAFT','source':str(deck),'sha256':sha(dest),'bytes':dest.stat().st_size})
    index=ROOT/'DELIVERY-INDEX.md'
    index.write_text('# Momentum AI launch library\n\nPrepared for Dillon Mohr. Private review delivery.\n\n## PDFs\n\n'+ '\n'.join(f'- {r["title"]}: {r["pages"]} pages. File: {Path(r["file"]).name}' for r in records)+'\n\n## What is ready to review\n\nFive complete ebook manuscripts, ten articles, the existing strategy and offer documents, and the deck addendum. Original approval notes are included in each generated PDF.\n\n## Videos and creative assets\n\nCurrent launch exports, existing motion studies, source clips, stills, exact logo assets, music and editable collateral are packaged separately. Superseded cuts and unapproved concepts are labeled as review extras. Technical file checks are not a claim of public release approval.\n\n## Review decisions\n\nRead and approve first-person claims. Confirm offer scope and pricing with Mac. Resolve the attribution book dependency before publication. Review mascot and likeness content separately.\n\n## Typography\n\nArchivo Black gives covers and chapter headings a stronger voice. Georgia is used for extended reading, with Calibri for tables and source notes. This is a print-only treatment, using Momentum blue and the existing artwork.\n',encoding='utf-8')
    make_pdf(index,'00-START-HERE.pdf','INDEX',0)
    (ROOT/'pdf-manifest.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
    print(json.dumps({'pdfs':len(records),'pages':sum(r['pages'] for r in records)}))

if __name__=='__main__': main()
