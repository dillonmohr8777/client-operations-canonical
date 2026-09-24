"""Independent local content check; no generation or source edits."""
from pathlib import Path
import re, json, difflib, unicodedata
import markdown, fitz
from bs4 import BeautifulSoup

root=Path(__file__).resolve().parent
src=root.parent/'2026-09-07-google-aistudio-batch/content/ebooks'
out=root.parent/'2026-09-08-claude-design-ebooks/out'
def words(text):
    text=unicodedata.normalize('NFKC',text).lower()
    return re.findall(r'[a-z0-9]+',text)
records=[]
for i,md in enumerate(sorted(src.glob('0*.md')),1):
    source=md.read_text(encoding='utf-8')
    source=re.sub(r'^---\s*\n.*?\n---\s*\n','',source,flags=re.S)
    source=re.sub(r'<!--[\s\S]*?-->','',source)
    source=re.sub(r'\[source:[^\]]*\]','',source)
    expected=BeautifulSoup(markdown.markdown(source,extensions=['tables','fenced_code']),'html.parser').get_text(' ')
    expected_words=words(expected)
    soup=BeautifulSoup((out/f'ebook{i}-standalone.html').read_text(encoding='utf-8'),'html.parser')
    for el in soup.select('style,script'):el.decompose()
    actual_words=words((soup.select_one('main') or soup).get_text(' '))
    match=difflib.SequenceMatcher(None,expected_words,actual_words,autojunk=False)
    matched=sum(block.size for block in match.get_matching_blocks())
    pdf=fitz.open(out/f'ebook{i}-REVIEW-DRAFT.pdf')
    records.append({'book':i,'source':md.name,'source_words':len(expected_words),'html_words':len(actual_words),'ordered_source_token_coverage':round(matched/len(expected_words),5),'pdf_pages':len(pdf),'pdf_words':sum(len(p.get_text().split()) for p in pdf),'nearly_blank_pages':[n+1 for n,p in enumerate(pdf) if len(p.get_text().strip())<20]})
(root/'book-content-checks.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
print(json.dumps(records))
