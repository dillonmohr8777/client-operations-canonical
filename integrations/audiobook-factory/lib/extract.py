#!/usr/bin/env python3
"""Source extraction for the audiobook factory.

Reads one source file and emits markdown-ish text on stdout: '# ' prefixed
headings, blank-line-separated paragraphs. Structure matters more than fidelity
here because the scripting stage chapterizes off the headings.
"""
import sys, os, re, zipfile, html


def from_docx(path):
    with zipfile.ZipFile(path) as z:
        xml = z.read('word/document.xml').decode('utf8', 'ignore')
    out = []
    # Each <w:p> is a paragraph; its pStyle tells us if it is a heading.
    for para in re.findall(r'<w:p[ >].*?</w:p>|<w:p/>', xml, re.S):
        style = re.search(r'<w:pStyle[^>]*w:val="([^"]+)"', para)
        texts = re.findall(r'<w:t[^>]*>(.*?)</w:t>', para, re.S)
        text = html.unescape(re.sub(r'<[^>]+>', '', ''.join(texts))).strip()
        if not text:
            continue
        lvl = 0
        if style:
            m = re.match(r'Heading(\d)', style.group(1), re.I)
            if m:
                lvl = min(int(m.group(1)), 4)
            elif style.group(1).lower() in ('title',):
                lvl = 1
        out.append(('#' * lvl + ' ' + text) if lvl else text)
    return '\n\n'.join(out)


def from_pdf(path):
    from pypdf import PdfReader
    reader = PdfReader(path)
    pages = []
    for page in reader.pages:
        t = page.extract_text() or ''
        pages.append(t)
    body = '\n\n'.join(pages)
    # Drop standalone page numbers and repeated running headers/footers.
    lines = [l.rstrip() for l in body.split('\n')]
    freq = {}
    for l in lines:
        s = l.strip()
        if s:
            freq[s] = freq.get(s, 0) + 1
    npages = max(1, len(pages))
    kept = []
    for l in lines:
        s = l.strip()
        if re.fullmatch(r'\d{1,4}', s):
            continue
        if re.fullmatch(r'(page\s+)?\d{1,4}\s*(of|/)\s*\d{1,4}', s, re.I):
            continue
        # A short line repeated on most pages is a running head, not content.
        if s and freq.get(s, 0) >= max(3, npages * 0.5) and len(s) < 80:
            continue
        kept.append(l)
    text = '\n'.join(kept)
    # Rejoin words hyphenated across a line break.
    text = re.sub(r'(\w)-\n(\w)', r'\1\2', text)
    out = []
    for block in re.split(r'\n\s*\n', text):
        b = ' '.join(x.strip() for x in block.split('\n')).strip()
        if not b:
            continue
        if is_heading(b):
            out.append('# ' + b)
        else:
            out.append(b)
    return '\n\n'.join(out)


def is_heading(b):
    """Short, title-ish, unpunctuated lines read as headings."""
    if len(b) > 90:
        return False
    if re.match(r'^(chapter|module|lesson|section|part|unit|appendix)\b', b, re.I):
        return True
    if b.isupper() and 3 < len(b) <= 90:
        return True
    words = b.split()
    if 1 < len(words) <= 10 and not b.endswith(('.', ',', ';', ':', '?', '!')):
        caps = sum(1 for w in words if w[:1].isupper())
        if caps / len(words) >= 0.6:
            return True
    return False


def from_captions(path):
    """SRT / WebVTT -> continuous prose. Video-course transcripts land here."""
    raw = open(path, encoding='utf8', errors='ignore').read()
    raw = raw.replace('﻿', '')
    cues = []
    for block in re.split(r'\n\s*\n', raw):
        lines = [l.strip() for l in block.strip().split('\n') if l.strip()]
        if not lines:
            continue
        keep = []
        for l in lines:
            if l.upper().startswith('WEBVTT') or re.fullmatch(r'\d+', l):
                continue
            if '-->' in l:
                continue
            if re.match(r'^(NOTE|STYLE|REGION)\b', l):
                continue
            keep.append(re.sub(r'<[^>]+>', '', l))
        if keep:
            cues.append(' '.join(keep).strip())
    # Caption tools repeat the tail of the previous cue; drop consecutive dupes.
    deduped = []
    for c in cues:
        if deduped and (c == deduped[-1] or deduped[-1].endswith(c)):
            continue
        deduped.append(c)
    text = ' '.join(deduped)
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'\[(inaudible|music|applause|laughter)[^\]]*\]', '', text, flags=re.I)
    # Speaker labels become paragraph breaks.
    text = re.sub(r'\s*([A-Z][A-Za-z .]{1,28}):\s', r'\n\n\1: ', text)
    return text.strip()


def from_html(path):
    raw = open(path, encoding='utf8', errors='ignore').read()
    raw = re.sub(r'(?is)<(script|style|nav|footer|header)[^>]*>.*?</\1>', ' ', raw)
    for i in range(1, 5):
        raw = re.sub(r'(?is)<h%d[^>]*>(.*?)</h%d>' % (i, i), lambda m, i=i: '\n\n' + '#' * i + ' ' + m.group(1) + '\n\n', raw)
    raw = re.sub(r'(?is)</(p|div|li|br)>', '\n\n', raw)
    raw = re.sub(r'<[^>]+>', ' ', raw)
    raw = html.unescape(raw)
    blocks = [re.sub(r'\s+', ' ', b).strip() for b in re.split(r'\n\s*\n', raw)]
    return '\n\n'.join(b for b in blocks if b)


def main():
    path = sys.argv[1]
    ext = os.path.splitext(path)[1].lower()
    if ext == '.docx':
        text = from_docx(path)
    elif ext == '.pdf':
        text = from_pdf(path)
    elif ext in ('.srt', '.vtt'):
        text = from_captions(path)
    elif ext in ('.html', '.htm'):
        text = from_html(path)
    elif ext in ('.txt', '.md', '.markdown', ''):
        text = open(path, encoding='utf8', errors='ignore').read()
    else:
        sys.stderr.write('unsupported source type: %s\n' % ext)
        sys.exit(2)
    sys.stdout.write(text)


if __name__ == '__main__':
    main()
