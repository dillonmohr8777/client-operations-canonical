"""August 2026 content calendar, revision 0042 -> 0043.

Replaces the Fri Aug 28 post. `Different Missions. Same Workforce Pressure.` comes
off and Align Academy goes on, with a still from the 45s Academy film and fresh
copy.

This also closes the gap flagged in 0040: after Aug 26 was cut and Aug 12 was
rewritten, Align Academy had no post left in August. It has one again.

Copy is drawn from the film's own spine: a system either transforms your
operations or it gathers dust, and the difference lies entirely in training. The
page's copy panel stopped at y=676.1 because the old post's copy was short, so it
is extended to the 689.4 bottom the rest of the deck uses.
"""
import hashlib
import io
import re

import fitz
import numpy as np
from PIL import Image

CAL = '/home/user/client-operations-canonical/clients/align-hcm/content/august-2026/calendar/'
SRC = CAL + 'Align_August_Calendar_0042.pdf'
OUT = 'Align_August_Calendar_0043.pdf'
STATICS = CAL + 'case-study-statics/'
SHOT = 'pick/shots/align-academy.png'

F = {
    'display': fitz.Font(fontfile='fonts/PlusJakartaSans-800.ttf'),
    'caps':    fitz.Font(fontfile='fonts/PlusJakartaSans-700.ttf'),
    'body':    fitz.Font(fontfile='fonts/DMSans-400.ttf'),
    'label':   fitz.Font(fontfile='fonts/DMSans-500.ttf'),
    'bodysb':  fitz.Font(fontfile='fonts/DMSans-700.ttf'),
}
NAVY    = (0x17/255, 0x32/255, 0x4d/255)
INK     = (0x11/255, 0x18/255, 0x20/255)
WHITE   = (1, 1, 1)
ORANGE  = (0xf0/255, 0x5a/255, 0x28/255)
EYEBROW = (0xff/255, 0x6b/255, 0x35/255)
GREY_F  = (0x8a/255, 0x8f/255, 0x98/255)
GREY_C  = (0xa2/255, 0xa7/255, 0xaf/255)
GRID_L  = (0x7a/255, 0x80/255, 0x89/255)
PANEL   = (0.98, 0.98, 0.98)
BORDER  = (0.851, 0.863, 0.878)
PEACH   = (0.9843, 0.9333, 0.8941)
BASE, LINE, PGAP = 0.86, 13.9, 24.5

ROW_LABEL_TOP = [137.8, 158.3, 179.5, 200.1]
ROW_VALUE_TOP = [137.9, 159.1, 179.7, 200.8]
ROW_LABEL_X, ROW_VALUE_X = 74.5, 134.6
VALUE_MAX_W = 544.2 - ROW_VALUE_X - 12
BODY_X, BODY_W, BODY_TOP = 82.8, 424.0, 516.3
PANEL_BOTTOM = 689.4
FOOT = 'Align Human Capital Management \xa0·\xa0 August 2026 Content Calendar'

FRAME = fitz.Rect(310.5, 130.7, 538.6, 536.9)
FILES = {'GTAA': 'gtaa-12-priority-needs.jpeg',
         'Beumer': 'beumer-seven-years-hr-history.jpeg',
         'Troon': 'troon-one-workforce-standard.jpeg',
         'Peco': 'peco-foods-practice-that-holds.jpeg'}

TITLE = 'Transform, or Gather Dust'
POST = dict(
    eyebrow='FRIDAY, AUGUST 28',
    eyebrow_w=110.0,
    rows=[
        ('TARGET',   'HR, enablement, and training leaders driving adoption', 'body'),
        ('ASSET',    'Video · 1920x1080 · 45.0s · H.264', 'body'),
        ('HEADLINE', 'A system either transforms your operations, or it gathers dust.', 'sb'),
        ('SUBHEAD',  'The difference lies entirely in training. Align Academy builds it around the role.', 'body'),
    ],
    paras=[
        'A system either transforms your operations, or it gathers dust. The difference lies '
        'entirely in training.',
        'Align Academy trains administrators, managers, and employees separately, because each '
        'one needs something different from the same platform.',
        'Role based design, custom learning paths, safe practice environments, and post launch '
        'reinforcement, because training is not a one time event.',
        'Adoption climbs. Ticket volume falls. Workarounds disappear.',
        '#AlignAcademy #HCMAdoption #RoleBasedTraining',
        'First comment: Explore Align Academy: https://www.alignhcm.com/services/training',
    ],
)


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
    c = [i for i in page.get_image_info(xrefs=True)
         if i['xref'] and fitz.Rect(i['bbox']).intersects(FRAME)
         and abs(fitz.Rect(i['bbox']).width - FRAME.width) < 6]
    if not c:
        return None
    img = doc.extract_image(c[-1]['xref'])
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
        which = next((n for n in FILES if n in doc[i].get_text()), None)
        assert which, f'page {i+1} has a case-study frame but no known client'
        actual = next((n for n, h in want.items() if h == got), 'UNKNOWN')
        good = actual == which
        ok &= good; seen += 1
        print(f'    page {i+1:>2}  expect {which:<7} actual {actual:<8} {"OK" if good else "<<< WRONG"}')
    assert seen == 4, f'expected 4 case-study pages, found {seen}'
    return ok


doc = fitz.open(SRC)
assert doc.page_count == 13

IDX = 12
page = doc[IDX]
assert 'AUGUST28' in page.get_text().replace('\xa0', '').replace(' ', '')
assert 'Different Missions' in page.get_text()
xref = max(i['xref'] for i in page.get_image_info(xrefs=True))

rs = []
for blk in page.get_text('dict')['blocks']:
    if blk['type'] != 0:
        continue
    for line in blk['lines']:
        for span in line['spans']:
            r = fitz.Rect(span['bbox']); r.y0 -= 1.4; r.y1 += 1.4; r.x1 += 2.0
            rs.append(r)
redact(page, rs)

# Extend the copy panel from 676.1 to the 689.4 bottom the rest of the deck uses.
page.draw_rect(fitz.Rect(67.8, 673.0, 544.2, PANEL_BOTTOM), fill=PANEL, color=None)
page.draw_rect(fitz.Rect(67.8, 673.0, 68.4, PANEL_BOTTOM), fill=BORDER, color=None)
page.draw_rect(fitz.Rect(543.6, 673.0, 544.2, PANEL_BOTTOM), fill=BORDER, color=None)
page.draw_rect(fitz.Rect(67.8, PANEL_BOTTOM - 0.6, 544.2, PANEL_BOTTOM), fill=BORDER, color=None)

put_fit(page, (83.4, 76.1), POST['eyebrow'], F['caps'], 7.5, EYEBROW, POST['eyebrow_w'])
nat = F['display'].text_length(TITLE, 15.0)
assert nat <= 544.2 - 83.4 - 12, f'title too long ({nat:.0f}pt)'
put_fit(page, (83.4, 90.1), TITLE, F['display'], 15.0, WHITE, nat * 0.9776)

for (label, value, style), lt, vt in zip(POST['rows'], ROW_LABEL_TOP, ROW_VALUE_TOP):
    put_fit(page, (ROW_LABEL_X, lt), label, F['caps'], 6.4, NAVY,
            F['caps'].text_length(label, 6.4) + 0.78 * (len(label) - 1))
    fo = F['bodysb'] if style == 'sb' else F['body']
    assert fo.text_length(value, 7.3) <= VALUE_MAX_W, f'row too wide: {value}'
    put(page, (ROW_VALUE_X, vt), value, fo, 7.3, NAVY if style == 'sb' else INK)

put_fit(page, (67.8, 483.7), 'POST COPY', F['caps'], 8.3, ORANGE, 62.3)

y, total = BODY_TOP, 0
for pi, para in enumerate(POST['paras']):
    lines = wrap(para, F['body'], 8.1, BODY_W)
    for li, ln in enumerate(lines):
        put(page, (BODY_X, y), ln, F['body'], 8.1, INK)
        total += 1
        if li < len(lines) - 1:
            y += LINE
    if pi < len(POST['paras']) - 1:
        y += PGAP
assert y + 8.1 <= PANEL_BOTTOM - 6, f'copy overflows ({total} lines, last top {y:.1f})'
print(f'page {IDX+1}  {TITLE:<28} {total} copy lines, last top {y:.1f}')

put(page, (67.8, 709.2), FOOT, F['body'], 7.0, GREY_F)
pl = f'Page {IDX + 1}'
put(page, (544.2 - F['body'].text_length(pl, 7.0), 709.2), pl, F['body'], 7.0, GREY_F)
put(page, (67.8, 724.6), 'Confidential Information', F['body'], 6.7, GREY_C)
page.replace_image(xref, filename=SHOT)

# ---- page 1 grid cell: Friday, week of Aug 24 -------------------------------
one = doc[0]
CELL = fitz.Rect(449.0, 494.1, 544.2, 558.1)
r = fitz.Rect(CELL); r.x0 += 1; r.y0 += 1; r.x1 -= 1; r.y1 -= 1
redact(one, [r])
one.draw_rect(CELL, fill=PEACH, color=None)
put(one, (454.6, 499.8), '28', F['caps'], 9.5, INK)
tl = wrap(TITLE, F['caps'], 7.2, 82.0)
assert len(tl) <= 3, f'grid title needs {len(tl)} lines'
for i, ln in enumerate(tl):
    put(one, (454.6, 515.8 + i * 9.45), ln, F['caps'], 7.2, ORANGE)
put(one, (454.6, 536.5 if len(tl) <= 2 else 545.95), 'Original animation', F['label'], 6.4, GRID_L)
print('page  1  Aug 28 grid cell updated')

doc.save(OUT, garbage=4, deflate=True)
doc.close()

# ---- verify -----------------------------------------------------------------
old, new = fitz.open(SRC), fitz.open(OUT)
print('\ncase-study artwork:')
assert audit_case_studies(new)

for i in range(new.page_count):
    if i in (0, IDX):
        continue
    a = re.sub(r'\s+', ' ', old[i].get_text()).strip()
    b = re.sub(r'\s+', ' ', new[i].get_text()).strip()
    assert a == b, f'page {i+1} changed unexpectedly'

t = new[IDX].get_text()
assert 'Different Missions' not in t and 'Workforce Pressure' not in t
assert 'Align Academy' in t and 'gathers dust' in t
assert 'AUGUST28' in t.replace('\xa0', '').replace(' ', '')

days = [int(re.search(r'AUGUST(\d{1,2})', new[i].get_text().replace('\xa0', '').replace(' ', '')).group(1))
        for i in range(1, new.page_count)]
assert days == [3, 5, 6, 10, 12, 14, 17, 19, 20, 25, 27, 28], days
print(f'\nposts unchanged in date: {days}')
c1 = re.sub(r'\s+', ' ', new[0].get_text().replace('\xa0', ' '))
assert 'twelve posts' in c1 and 'three original animations' in c1
print('slate composition still accurate; Align Academy is back on the slate')
print(f'wrote {OUT}: {new.page_count} pages')
