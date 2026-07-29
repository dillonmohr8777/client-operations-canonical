"""August 2026 content calendar, revision 0041 -> 0042.

Rebalances the month to three posts a week by moving one post rather than several.

0041 left an uneven slate: 3 / 2 / 3 / 4 across the four working weeks, with Aug 7,
12, 26 and 31 empty. Moving `HR at the Table` from Aug 24 to Aug 12 gives 3 / 3 / 3
/ 3 and needs a single date change.

Why that post and not another. Only three of the four week-four posts have a
finished asset, and two assets on the slate are still unproduced: the Joann video
on Aug 20 and Moe's Four Decisions on Aug 27, whose ASSET row still reads
`to record`. Moving either of those earlier would compress a production runway, so
both stay put. Of the produced candidates:

* Peco on Aug 25 would put two case studies in week two, and Beumer and Peco are
  both manufacturing stories.
* Different Missions on Aug 28 would land two days from Public Service Cannot
  Pause, and both are public-sector animations.
* HR at the Table is a finished 2m13s cut, and it gives week two a case study, a
  podcast and an animation.

The result keeps exactly one case study per week and no two adjacent posts on the
same theme.
"""
import hashlib
import io
import re

import fitz
import numpy as np
from PIL import Image

CAL = '/home/user/client-operations-canonical/clients/align-hcm/content/august-2026/calendar/'
SRC = CAL + 'Align_August_Calendar_0041.pdf'
OUT = 'Align_August_Calendar_0042.pdf'
STATICS = CAL + 'case-study-statics/'

F = {
    'caps':  fitz.Font(fontfile='fonts/PlusJakartaSans-700.ttf'),
    'body':  fitz.Font(fontfile='fonts/DMSans-400.ttf'),
    'label': fitz.Font(fontfile='fonts/DMSans-500.ttf'),
}
INTRO   = (0x35/255, 0x41/255, 0x55/255)
GREY_F  = (0x8a/255, 0x8f/255, 0x98/255)
DIM     = (0xb6/255, 0xba/255, 0xc1/255)
INK     = (0x11/255, 0x18/255, 0x20/255)
ORANGE  = (0xf0/255, 0x5a/255, 0x28/255)
EYEBROW = (0xff/255, 0x6b/255, 0x35/255)
GRID_L  = (0x7a/255, 0x80/255, 0x89/255)
PEACH   = (0.9843, 0.9333, 0.8941)
BASE    = 0.86

FRAME = fitz.Rect(310.5, 130.7, 538.6, 536.9)
FILES = {'GTAA': 'gtaa-12-priority-needs.jpeg',
         'Beumer': 'beumer-seven-years-hr-history.jpeg',
         'Troon': 'troon-one-workforce-standard.jpeg',
         'Peco': 'peco-foods-practice-that-holds.jpeg'}

# page 1 grid: column x by weekday, and the row bands
COL = {'Mon': 73.9, 'Tue': 169.1, 'Wed': 264.3, 'Thu': 359.4, 'Fri': 454.6}
CELL_X = {'Mon': (68.4, 163.5), 'Tue': (163.5, 258.7), 'Wed': (258.7, 353.9),
          'Thu': (353.9, 449.0), 'Fri': (449.0, 544.2)}
ROW_Y = [(320.5, 378.3), (378.3, 436.2), (436.2, 494.1), (494.1, 558.1), (558.1, 616.0)]
ROW_TOPS = [(326.2, 342.1, 362.9), (384.1, 400.0, 420.8), (441.9, 457.9, 478.7),
            (499.8, 515.8, 536.5), (564.4, 580.3, 601.1)]


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


def put_fit(page, xy, text, font, size, color, target_w):
    nat = font.text_length(text, size)
    put(page, xy, text, font, size, color,
        tracking=(target_w - nat) / max(len(text) - 1, 1))


def wrap(text, font, size, width, sep=None):
    lines, cur = [], ''
    for w in (text.split(' ') if sep == ' ' else text.split()):
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
    cands = [i for i in page.get_image_info(xrefs=True)
             if i['xref'] and fitz.Rect(i['bbox']).intersects(FRAME)
             and abs(fitz.Rect(i['bbox']).width - FRAME.width) < 6]
    if not cands:
        return None
    img = doc.extract_image(cands[-1]['xref'])
    a = np.asarray(Image.open(io.BytesIO(img['image'])).convert('RGB')).astype(np.uint8)
    return hashlib.sha256(a.tobytes()).hexdigest()


def audit_case_studies(doc):
    want = {k: hashlib.sha256(np.asarray(Image.open(STATICS + v).convert('RGB'))
                              .astype(np.uint8).tobytes()).hexdigest()
            for k, v in FILES.items()}
    ok, seen = True, 0
    for i in range(doc.page_count):
        got = visible_on_frame(doc, doc[i])
        if got is None:
            continue
        title = doc[i].get_text().split('\n')[1]
        which = next((n for n in FILES if n in title), None)
        assert which, f'page {i+1} has a case-study frame but no known client'
        actual = next((n for n, h in want.items() if h == got), 'UNKNOWN')
        good = actual == which
        ok &= good; seen += 1
        print(f'    page {i+1:>2}  expect {which:<7} actual {actual:<8} {"OK" if good else "<<< WRONG"}')
    assert seen == 4, f'expected 4 case-study pages, found {seen}'
    return ok


doc = fitz.open(SRC)
assert doc.page_count == 13

MOVER = 9                     # idx of the Aug 24 HR at the Table page
assert 'AUGUST24' in doc[MOVER].get_text().replace('\xa0', '').replace(' ', '')
assert 'HR at the Table' in doc[MOVER].get_text()

# 1. reorder so the deck stays chronological: Aug 12 sits between Aug 10 and Aug 14
order = [0, 1, 2, 3, 4, MOVER, 5, 6, 7, 8, 10, 11, 12]
assert sorted(order) == list(range(13))
doc.select(order)
print('reordered: HR at the Table now sits between Aug 10 and Aug 14')

# 2. redate that page
page = doc[5]
assert 'HR at the Table' in page.get_text()
hits = page.search_for('M O N D A Y')
band = fitz.Rect(80.0, 72.0, 300.0, 87.0)
redact(page, [band])
put_fit(page, (83.4, 76.1), 'WEDNESDAY, AUGUST 12', F['caps'], 7.5, EYEBROW, 122.6)
assert 'AUGUST12' in doc[5].get_text().replace('\xa0', '').replace(' ', '')
print('redated to WEDNESDAY, AUGUST 12')

# 3. renumber every content footer, since the order changed
FOOTNOTE = 'Align Human Capital Management \xa0·\xa0 August 2026 Content Calendar'
for idx in range(1, doc.page_count):
    p = doc[idx]
    h = p.search_for('Page ')[0]
    redact(p, [fitz.Rect(h.x0 - 2, h.y0 - 3, 548, h.y1 + 3)])
    pl = f'Page {idx + 1}'
    put(p, (544.2 - F['body'].text_length(pl, 7.0), 709.2), pl, F['body'], 7.0, GREY_F)
print('footers renumbered')

# 4. page 1: move the cell, clear Aug 24, restore the cadence claim
one = doc[0]
AUG12 = ('Wed', 1)      # Wednesday, week of Aug 10
AUG24 = ('Mon', 3)      # Monday, week of Aug 24

rs = []
for col, row in (AUG12, AUG24):
    x0, x1 = CELL_X[col]; y0, y1 = ROW_Y[row]
    rs.append(fitz.Rect(x0 + 1, y0 + 1, x1 - 1, y1 - 1))
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

# Aug 24 reverts to an unscheduled weekday
x0, x1 = CELL_X[AUG24[0]]; y0, y1 = ROW_Y[AUG24[1]]
one.draw_rect(fitz.Rect(x0, y0, x1, y1), fill=(1, 1, 1), color=None)
put(one, (COL[AUG24[0]], ROW_TOPS[AUG24[1]][0]), '24', F['caps'], 9.5, DIM)

# Aug 12 becomes a posting day carrying the podcast
x0, x1 = CELL_X[AUG12[0]]; y0, y1 = ROW_Y[AUG12[1]]
one.draw_rect(fitz.Rect(x0, y0, x1, y1), fill=PEACH, color=None)
ntop, ttop, ltop = ROW_TOPS[AUG12[1]]
put(one, (COL[AUG12[0]], ntop), '12', F['caps'], 9.5, INK)
tl = wrap('HR at the Table', F['caps'], 7.2, 82.0)
assert len(tl) <= 3
for i, ln in enumerate(tl):
    put(one, (COL[AUG12[0]], ttop + i * 9.45), ln, F['caps'], 7.2, ORANGE)
put(one, (COL[AUG12[0]], ltop if len(tl) <= 2 else ltop + 9.45),
    'Podcast video', F['label'], 6.4, GRID_L)

INTRO_TXT = ('Prepared for the Align Page and the Maher, Moe, and Joann profiles \xa0·\xa0 '
             'Monday through Friday operation \xa0·\xa0 three posts per week.')
for i, ln in enumerate(wrap(INTRO_TXT, F['body'], 8.6, 471.0, sep=' ')):
    put(one, (70.0, 206.0 + i * 14.4), ln, F['body'], 8.6, INTRO)

SUMMARY = ('The full month runs twelve posts: three original animations, four static case '
           'studies, one brand video, one founder blog post, one podcast conversation, and two '
           'expert and talking head videos.')
sl = wrap(SUMMARY, F['body'], 8.6, 463.0)
assert len(sl) <= 2
for i, ln in enumerate(sl):
    put(one, (70.0, 234.4 + i * 14.4), ln, F['body'], 8.6, INTRO)
print('page 1: Aug 12 filled, Aug 24 cleared, cadence now three posts per week')

doc.save(OUT, garbage=4, deflate=True)
doc.close()

# ---- verify -----------------------------------------------------------------
old, new = fitz.open(SRC), fitz.open(OUT)
print('\ncase-study artwork:')
assert audit_case_studies(new), 'case-study artwork mismatched'

days = []
for i in range(1, new.page_count):
    days.append(int(re.search(r'AUGUST(\d{1,2})',
                new[i].get_text().replace('\xa0', '').replace(' ', '')).group(1)))
print(f'\nposts: {days}')
assert days == sorted(days), 'deck is not in date order'
assert days == [3, 5, 6, 10, 12, 14, 17, 19, 20, 25, 27, 28]

weeks = {'Aug 3-7': range(3, 8), 'Aug 10-14': range(10, 15), 'Aug 17-21': range(17, 22),
         'Aug 24-28': range(24, 29), 'Aug 31': [31]}
for label, rng in weeks.items():
    print(f'  {label:<10} {len([x for x in days if x in rng])} posts')

# every post survived, only one changed date
def title_of(page):
    """The 15pt display span in the header bar. Reading order is not reliable here:
    on a redated page the redrawn eyebrow is appended after the title."""
    for blk in page.get_text('dict')['blocks']:
        if blk['type'] != 0:
            continue
        for line in blk['lines']:
            for span in line['spans']:
                if abs(span['size'] - 15.0) < 0.3 and span['bbox'][1] < 120:
                    return span['text'].strip()
    raise AssertionError('no display title found')

old_titles = sorted(title_of(old[i]) for i in range(1, old.page_count))
new_titles = sorted(title_of(new[i]) for i in range(1, new.page_count))
assert old_titles == new_titles, 'a post was lost or gained'
t = re.sub(r'\s+', ' ', new[0].get_text().replace('\xa0', ' '))
assert 'three posts per week' in t and 'twelve posts' in t
assert 'two to four' not in t
print('\nall twelve posts present, one date changed, cover consistent')
print(f'wrote {OUT}: {new.page_count} pages')
