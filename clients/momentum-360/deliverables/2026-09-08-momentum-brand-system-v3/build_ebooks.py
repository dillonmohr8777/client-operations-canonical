from pathlib import Path
import re,json,html,hashlib,shutil
import markdown,yaml

ROOT=Path(__file__).resolve().parent
SOURCE=ROOT.parent/'2026-09-07-google-aistudio-batch/content/ebooks'
ASSETS=['search-mascot.png','phone-mascot.png','build-mascot.png','operations-mascot.png','audience-mascot.png']
TOPICS=['AI search','Lead response','Creative production','AI operations','Audience intelligence']
ARROW='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6"/></svg>'
SEARCH_ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/></svg>'
def escape(v):return html.escape(str(v),quote=True)
def search(label,ident):return f'<label class="search-wrap">{SEARCH_ICON}<input type="search" id="{ident}" placeholder="{label}" aria-label="{label}"></label>'
def head(title,book=False):return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{escape(title)} · Momentum</title><link rel="stylesheet" href="style.css"><link rel="stylesheet" href="exercises.css"></head><body class="{'book-page' if book else 'library-page'}"><!-- THESIS: Momo brings full Momentum business guides to life. OWN-WORLD: User-pinned blue/gold Playbook, white reading pages, ceramic illustrations and blue engravings. STORY: recognize, choose, read, inspect sources, apply, reuse. FIRST VIEWPORT: exact identity or strong book title with Momo and a clear gold action. FORM: user-pinned code-led world; seed 0a4990b2. FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance --><a class="skip" href="#main">Skip to content</a><header class="topbar"><div class="wrap"><a href="index.html" aria-label="Momentum library"><img class="small-logo" src="assets/momentum-logo.png" alt="Momentum"><span class="header-tagline">Ideas into momentum.</span></a><nav aria-label="Primary"><a href="index.html#library">Library</a><a class="optional" href="brand.html">Brand system</a><button class="text-button" id="motion-toggle" aria-pressed="false">Pause motion</button></nav></div></header>'''
def foot():return '<footer class="footer wrap"><span>Momentum Digital · AI Field Notes</span><span>Private review edition · September 2026</span><a href="index.html">Back to the library</a></footer><script src="app.js"></script><script src="exercises.js"></script></body></html>'
def rendering(body, prefix='note'):
 citations=[]
 def cite(m):
  citations.append(m.group(0));n=len(citations)
  return f'<sup class="citation-ref"><a href="#{prefix}-source-{n}" aria-label="Open source {n}">[{n}]</a></sup>'
 cleaned=re.sub(r'\[sources?:[^\]]+\]',cite,body,flags=re.I)
 rendered=markdown.markdown(cleaned,extensions=['extra','sane_lists'],output_format='html')
 if citations:
  entries=[]
  for n,source in enumerate(citations,1):
   escaped=escape(source)
   escaped=re.sub(r'https?://[^\s<]+',lambda m:'<a href="'+m.group(0).rstrip(',.;)]')+'" target="_blank" rel="noopener noreferrer">'+m.group(0).rstrip(',.;)]')+'</a>'+m.group(0)[len(m.group(0).rstrip(',.;)]')):],escaped)
   entries.append(f'<details id="{prefix}-source-{n}"><summary>Source {n}</summary><p>{escaped}</p></details>')
  rendered+='<div class="chapter-citations" aria-label="Chapter sources">'+''.join(entries)+'</div>'
 return rendered
books=[]
(ROOT/'source').mkdir(exist_ok=True)
for i,path in enumerate(sorted(SOURCE.glob('*.md'))):
 raw=path.read_text(encoding='utf-8');shutil.copyfile(path,ROOT/'source'/path.name)
 fm,body=raw.split('---',2)[1:];meta=yaml.safe_load(fm);title=meta['title'];subtitle=meta['subtitle'];slug=path.stem;url=slug+'.html'
 chunks=re.split(r'^## (.+)$',body,flags=re.M)
 first=re.sub(r'^# .+\n','',chunks[0],count=1,flags=re.M).strip()
 sections=[]
 if first:sections.append(('Opening note',first))
 for n in range(1,len(chunks),2):sections.append((chunks[n].strip(),chunks[n+1]))
 # Each original section is converted without summarizing or removing manuscript text.
 rendered=[];chapters=[]
 for n,(heading,text) in enumerate(sections):
  ident=f'chapter-{n+1}';chapters.append({'id':ident,'title':heading,'text':re.sub(r'\s+',' ',text).strip()})
  illustration=''
  if n in [2,6]:illustration=f'<figure class="chapter-art"><img src="assets/{ASSETS[i]}" alt="Momo, the original blue ceramic character, illustrating {escape(TOPICS[i])}" loading="lazy"><figcaption>Momentum AI Field Notes · Original collection artwork</figcaption></figure>'
  if n==8:
   engraving=['bird-engraving.png','botanical-engraving.png','philly-engraving.png','botanical-engraving.png','bird-engraving.png'][i]
   illustration+=f'<aside class="engraving"><img src="assets/{engraving}" alt="Original engraved study from the Momentum collection" loading="lazy"><div><h3>Look closely.<br>Build deliberately.</h3><p>Pause between chapters. Keep a note of the claim, workflow or assumption you want to check next.</p></div></aside>'
  rendered.append(f'<section class="chapter" id="{ident}"><h2>{escape(heading)}</h2>{rendering(text,ident)}{illustration}</section>')
 toc=''.join(f'<a href="#{c["id"]}">{escape(c["title"])}</a>' for c in chapters)
 manuscript_status=f'''<details class="source-status" id="review-status"><summary>Manuscript review status and original source</summary><p>This edition preserves the source manuscript and its open review conditions. Design completion does not establish factual approval or publication readiness.</p><pre>{escape(fm.strip())}</pre><a href="source/{path.name}" download>Download the exact original manuscript</a></details>'''
 tools='''<section class="reader-tools" id="workbench"><div id="exercise-root"></div><p id="diagram-detail" hidden></p><h3 style="margin:30px 0 20px">Your reading checklist</h3><div class="checklist"><label><input type="checkbox" data-check="question">Write down the question this book needs to answer for your business.</label><label><input type="checkbox" data-check="workflow">Choose one workflow or claim to inspect.</label><label><input type="checkbox" data-check="source">Check the source and the date before relying on a number.</label><label><input type="checkbox" data-check="owner">Name the person who will review the next step.</label></div><p class="check-status" id="check-status" role="status">Saved only in this browser. Nothing is sent.</p></section>'''
 data={'slug':slug,'title':title,'chapters':chapters}
 page=head(title,True)+f'''<main id="main"><section class="book-cover"><div class="cover-copy"><h1>{escape(title)}<span class="gold-dot">.</span></h1><div class="card-meta">Field Notes {i+1:02d} · {TOPICS[i]}</div><p>{escape(subtitle)}</p><a class="button" href="#{chapters[0]['id']}">Start reading {ARROW}</a></div><img class="cover-art" src="assets/{ASSETS[i]}" alt="Momo illustrating {escape(TOPICS[i])}"></section><div class="book-review">By Dillon Mohr · Source manuscript: draft / not publishable · <a href="#review-status">Read the open review conditions</a></div><div class="book-layout wrap"><button class="reader-mobile-menu" id="mobile-menu" aria-expanded="false" aria-controls="reader-nav">Contents &amp; search</button><aside class="reader-nav" id="reader-nav">{search('Search this book','book-search')}<div class="search-results" id="search-results" aria-live="polite"></div><h2>In this field guide</h2><nav class="chapter-links" aria-label="Chapters">{toc}<a href="#workbench">Your reading workbench</a><a href="#review-status">Review status &amp; source</a></nav><p class="progress-label">Reading progress</p><progress id="reading-progress" value="0" max="100" aria-label="Reading progress"></progress></aside><article class="reader">{''.join(rendered)}{tools}{manuscript_status}</article></div></main><script type="application/json" id="book-data">{json.dumps(data,ensure_ascii=False).replace('</','<\\/')}</script>'''+foot()
 (ROOT/url).write_text(page,encoding='utf-8')
 books.append({'title':title,'subtitle':subtitle,'url':url,'topic':TOPICS[i],'image':ASSETS[i],'sections':len(chapters),'source':path.name,'sourceSha256':hashlib.sha256(path.read_bytes()).hexdigest(),'status':meta.get('status'),'publishable':meta.get('publishable'),'bodyCharacters':len(body)})
cards=[]
for i,b in enumerate(books):cards.append(f'''<article class="book-card" data-search="{escape((b['title']+' '+b['subtitle']+' '+b['topic']+(' design video content' if i==2 else '')).lower())}"><figure><a href="{b['url']}" aria-label="Read {escape(b['title'])}"><img src="assets/{b['image']}" alt="Momo illustrating {escape(b['topic'])}" {'loading="lazy"' if i else ''}></a></figure><div class="card-copy"><h2>{escape(b['title'])}</h2><div class="card-meta"><span>Field Notes {i+1:02d}</span><span>{b['topic']}</span></div><p>{escape(b['subtitle'])}</p><a class="button" href="{b['url']}">Open the field guide {ARROW}</a></div></article>''')
index=head('The AI Field Notes')+f'''<section class="brand-hero" id="brand-hero" aria-label="Momentum identity"><img class="brand-lockup" src="assets/momentum-logo.png" alt="Momentum"></section><main id="main" class="wrap"><section class="library-intro"><h1>Big ideas.<br>Useful field notes<span class="gold-dot">.</span></h1><p>Five illustrated guides to the work behind AI. Read deeply, follow the sources, and turn a useful idea into a clear next step.</p></section><p class="notice">Private design review. All five complete manuscripts retain their original source notes and open publication conditions.</p><section id="library"><div class="library-tools">{search('Find a field guide','library-search')}<p id="library-count">Five complete field guides</p></div><div class="book-grid">{''.join(cards)}</div><p id="library-empty" hidden class="empty-message">No matching field guide. Try search, leads, websites, operations or audience.</p></section><section class="library-close" id="about"><div><img src="assets/hero-mascot.png" alt="Momo, Momentum’s blue ceramic guide" loading="lazy" style="border-radius:14px"><h2 style="margin-top:24px">Explore with curiosity.<br>Act with clarity.</h2></div><div><p>This collection brings bold blue and gold, Momo, original ceramic scenes and engraved studies into a substantial reading experience. The logo stays exact. The thinking stays inspectable.</p><p style="margin-top:20px">Search chapters, follow the source notes, and save a small checklist as you read. Your checklist stays in this browser.</p></div></section></main>'''+foot()
(ROOT/'index.html').write_text(index,encoding='utf-8')
(ROOT/'books-manifest.json').write_text(json.dumps({'version':'3-review','books':books,'sourcePreservation':'Original source files copied byte-for-byte; full body converted with Python Markdown. Frontmatter retained in review disclosure.'},indent=2),encoding='utf-8')
print(f'Built library + {len(books)} complete ebooks / {sum(b["sections"] for b in books)} original sections')
