"""August 2026 content calendar, revision 0040 -> 0041.

Deletes the Aug 12 post so the industries film backs one post rather than two.
Aug 19 keeps it. 14 pages to 13, thirteen posts to twelve.

Knock-on effects handled here:
* Aug 12 returns to an unscheduled weekday on the page 1 grid.
* Original animations drop from four to three, so the slate summary is reflowed.
* The week of Aug 10 now carries two posts, which contradicted the cover's
  `three or four posts per week`, so that line now reads `two to four`.
"""
import hashlib
import io
import re

import fitz
import numpy as np
from PIL import Image

CAL = '/home/user/client-operations-canonical/clients/align-hcm/content/august-2026/calendar/'
SRC = CAL + 'Align_August_Calendar_0040.pdf'
OUT = 'Align_August_Calendar_0041.pdf'
STATICS = CAL + 'case-study-statics/'

F = {
    'caps':  fitz.Font(fontfile='fonts/PlusJakartaSans-700.ttf'),
    'body':  fitz.Font(fontfile='fonts/DMSans-400.ttf'),
}
INTRO  = (0x35/255, 0x41/255, 0x55/255)
GREY_F = (0x8a/255, 0x8f/255, 0x98/255)
DIM    = (0xb6/255, 0xba/255, 0xc1/255)
BASE   = 0.86

FRAME = fitz.Rect(310.5, 130.7, 538.6, 536.9)
FILES = {'GTAA': 'gtaa-12-priority-needs.jpeg',
         'Beumer': 'beumer-seven-years-hr-history.jpeg',
         'Troon': 'troon-one-workforce-standard.jpeg',
         'Peco': 'peco-foods-practice-that-holds.jpeg'}


def put(page, xy, text, font, size, color, tracking=0.0):
    x, top = xy
    y = top + BASE * size
    tw = fitz.TextWriter(page.rect)
    if tracking:
        for ch in text:
            tw.append((x, y), ch, font=font, fontsize=size)
            x += font.text_length(ch, size) + tracking
    else:
        tw.append((x, y), text, font=font, fontsize=size)
    tw.write_text(page, color=color)


def wrap(text, font, size, width):
    lines, cur = [], ''
    for w in text.split(' '):
        t = f'{cur} {w}' if cur else w
        if font.text_length(t, size) <= width or not cur:
            cur = t
        else:
            lines.append(cur); cur = w
    if cur:
        lines.append(cur)
    return lines


def redact(page, rects):
    for r in rects:
        page.add_redact_annot(r)
    page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE,
                          graphics=fitz.PDF_REDACT_LINE_ART_NONE)


def visible_on_frame(doc, page):
    """Hash the artwork on the portrait case-study frame, or None if there is none.

    Returns the LAST image landing on the frame, since an overlay sits on top of the
    original in content-stream order.
    """
    cands = [i for i in page.get_image_info(xrefs=True)
             if i['xref'] and fitz.Rect(i['bbox']).intersects(FRAME)
             and abs(fitz.Rect(i['bbox']).width - FRAME.width) < 6]
    if not cands:
        return None
    img = doc.extract_image(cands[-1]['xref'])
    a = np.asarray(Image.open(io.BytesIO(img['image'])).convert('RGB')).astype(np.uint8)
    return hashlib.sha256(a.tobytes()).hexdigest()


def audit_case_studies(doc, label):
    want = {k: hashlib.sha256(np.asarray(Image.open(STATICS + v).convert('RGB'))
                              .astype(np.uint8).tobytes()).hexdigest()
            for k, v in FILES.items()}
    print(f'{label}:')
    ok, seen = True, 0
    for i in range(doc.page_count):
        got = visible_on_frame(doc, doc[i])
        if got is None:          # not a portrait case-study page
            continue
        # expected client comes from the page's own headline
        title = doc[i].get_text().split('\n')[1]
        which = next((n for n in FILES if n in title), None)
        assert which, f'page {i+1} has a case-study frame but no known client in {title!r}'
        actual = next((n for n, h in want.items() if h == got), 'UNKNOWN')
        good = actual == which
        ok &= good; seen += 1
        print(f'    page {i+1:>2}  expect {which:<7} actual {actual:<8} {"OK" if good else "<<< WRONG"}')
    assert seen == 4, f'expected 4 case-study pages, found {seen}'
    return ok


doc = fitz.open(SRC)
assert doc.page_count == 14

# ---- delete the Aug 12 post --------------------------------------------------
p12 = doc[5]
assert 'AUGUST12' in p12.get_text().replace('\xa0', '').replace(' ', '')
assert 'One Foundation, Not One Size' in p12.get_text()
doc.delete_page(5)
assert doc.page_count == 13
print('deleted the Aug 12 post (was page 6)')

# ---- renumber footers on the pages that shifted -----------------------------
for idx in range(5, doc.page_count):
    p = doc[idx]
    hits = p.search_for('Page ')
    assert hits, f'no page number on idx{idx}'
    h = hits[0]
    redact(p, [fitz.Rect(h.x0 - 2, h.y0 - 3, 548, h.y1 + 3)])
    pl = f'Page {idx + 1}'
    put(p, (544.2 - F['body'].text_length(pl, 7.0), 709.2), pl, F['body'], 7.0, GREY_F)
print(f'renumbered footers for idx 5..{doc.page_count - 1}')

# ---- page 1: clear the Aug 12 cell, fix the cadence line and the summary -----
one = doc[0]
CELL = fitz.Rect(258.7, 378.3, 353.9, 436.2)      # Wednesday, week of Aug 10

rs = []
r = fitz.Rect(CELL); r.x0 += 1; r.y0 += 1; r.x1 -= 1; r.y1 -= 1
rs.append(r)
# the intro cadence line and the slate summary, matched by their own spans
for blk in one.get_text('dict')['blocks']:
    if blk['type'] != 0:
        continue
    for line in blk['lines']:
        for span in line['spans']:
            if 200.0 < span['bbox'][1] < 262.0:
                q = fitz.Rect(span['bbox'])
                q.x0 -= 2; q.y0 -= 2; q.x1 += 4; q.y1 += 2
                rs.append(q)
redact(one, rs)

# Aug 12 back to an unscheduled weekday: no tint, dimmed number
one.draw_rect(CELL, fill=(1, 1, 1), color=None)
put(one, (264.3, 384.1), '12', F['caps'], 9.5, DIM)

INTRO_TXT = ('Prepared for the Align Page and the Maher, Moe, and Joann profiles \xa0·\xa0 '
             'Monday through Friday operation \xa0·\xa0 two to four posts per week.')
for i, ln in enumerate(wrap(INTRO_TXT, F['body'], 8.6, 471.0)):
    put(one, (70.0, 206.0 + i * 14.4), ln, F['body'], 8.6, INTRO)

SUMMARY = ('The full month runs twelve posts: three original animations, four static case '
           'studies, one brand video, one founder blog post, one podcast conversation, and two '
           'expert and talking head videos.')
sl = wrap(SUMMARY, F['body'], 8.6, 463.0)
assert len(sl) <= 2, f'summary needs {len(sl)} lines'
for i, ln in enumerate(sl):
    put(one, (70.0, 234.4 + i * 14.4), ln, F['body'], 8.6, INTRO)
print('page 1: Aug 12 cell cleared, cadence line and summary reflowed')

doc.save(OUT, garbage=4, deflate=True)
doc.close()

# ---- verify -----------------------------------------------------------------
old, new = fitz.open(SRC), fitz.open(OUT)
print()
assert audit_case_studies(new, 'case-study artwork'), 'case-study artwork mismatched'

days = []
for i in range(1, new.page_count):
    m = re.search(r'AUGUST(\d{1,2})', new[i].get_text().replace('\xa0', '').replace(' ', ''))
    if m:
        days.append(int(m.group(1)))
print(f'\nposts: {days}  ({len(days)})')
assert 12 not in days and len(days) == 12

# old idx -> new idx after removing old idx5
pairs = [(i, i) for i in range(5)] + [(i, i - 1) for i in range(6, 14)]
for o, n in pairs:
    if n == 0:
        continue
    a = re.sub(r'Page \d+', 'Page N', re.sub(r'\s+', ' ', old[o].get_text())).strip()
    b = re.sub(r'Page \d+', 'Page N', re.sub(r'\s+', ' ', new[n].get_text())).strip()
    assert sorted(a.split()) == sorted(b.split()), f'content changed: old{o+1} -> new{n+1}'
print('all surviving pages carry identical content')

# normalise first: the wrap splits the cadence phrase across two lines
t = re.sub(r'\s+', ' ', new[0].get_text().replace('\xa0', ' '))
assert 'two to four posts per week' in t, 'cadence line not updated'
assert 'twelve posts' in t, 'slate summary not updated'
assert 'three or four posts' not in t, 'old cadence text still present'
assert 'thirteen posts' not in t, 'old post count still present'
assert 'One Foundation' not in ''.join(new[i].get_text() for i in range(new.page_count))
print(f'wrote {OUT}: {new.page_count} pages')
