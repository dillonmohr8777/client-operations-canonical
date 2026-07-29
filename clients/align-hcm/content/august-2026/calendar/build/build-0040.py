"""August 2026 content calendar, revision 0039 -> 0040.

Rewrites the Aug 12 post as industry solutions so the copy matches the still that
now sits on it. The Align Academy training angle comes off the slate.

Aug 12 and Aug 19 both draw on the 64.6s industries film, so they are given
different cuts of it rather than the same message twice: Aug 19 keeps the thesis,
`different work, one standard for operational trust`, and Aug 12 takes the
`how Align helps` panel that the still already shows, the four operating decisions
behind one shared foundation.
"""
import fitz

CAL = '/home/user/client-operations-canonical/clients/align-hcm/content/august-2026/calendar/'
SRC = CAL + 'Align_August_Calendar_0039.pdf'
OUT = 'Align_August_Calendar_0040.pdf'

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

BASE, LINE, PGAP = 0.86, 13.9, 24.5
ROW_LABEL_TOP = [137.8, 158.3, 179.5, 200.1]
ROW_VALUE_TOP = [137.9, 159.1, 179.7, 200.8]
ROW_LABEL_X, ROW_VALUE_X = 74.5, 134.6
VALUE_MAX_W = 544.2 - ROW_VALUE_X - 12
BODY_X, BODY_W, BODY_TOP = 82.8, 424.0, 516.3
PANEL_BOTTOM = 689.4
FOOT = 'Align Human Capital Management \xa0·\xa0 August 2026 Content Calendar'

TITLE = 'One Foundation, Not One Size'
POST = dict(
    eyebrow='WEDNESDAY, AUGUST 12',
    eyebrow_w=122.6,
    rows=[
        ('TARGET',   'HRIS and operations leaders standardizing across sites', 'body'),
        ('ASSET',    'Video · 1920x1080 · segment of the 64.6s industries film', 'body'),
        ('HEADLINE', 'One workforce foundation, without flattening industry complexity.', 'sb'),
        ('SUBHEAD',  'Design for the work, connect coverage and pay, make risk visible, stay relevant.', 'body'),
    ],
    paras=[
        'One workforce foundation, without flattening industry complexity.',
        'Design for the work itself. Roles, rules, workflows, and access should match the '
        'people, locations, and commitments each industry carries.',
        'Connect coverage, time, and pay, so frontline decisions run through timekeeping and '
        'payroll without losing the reason behind the work.',
        'Make workforce risk visible. Keep the platform relevant as needs change.',
        '#IndustrySolutions #WorkforceManagement #HCM',
        'First comment: Explore Align HCM industry solutions: https://www.alignhcm.com/industries',
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


def wrap(text, font, size, width):
    lines, cur = [], ''
    for w in text.split():
        t = f'{cur} {w}'.strip()
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


doc = fitz.open(SRC)
assert doc.page_count == 14

page = doc[5]
assert 'AUGUST12' in page.get_text().replace('\xa0', '').replace(' ', '')
assert 'Align Academy' in page.get_text(), 'page 6 is not the Align Academy post'

# strip every glyph, leaving the still, the card, the table rules and the panel
rs = []
for blk in page.get_text('dict')['blocks']:
    if blk['type'] != 0:
        continue
    for line in blk['lines']:
        for span in line['spans']:
            r = fitz.Rect(span['bbox']); r.y0 -= 1.4; r.y1 += 1.4; r.x1 += 2.0
            rs.append(r)
redact(page, rs)

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
print(f'page  6  {TITLE:<30} {total} copy lines, last top {y:.1f}')

put(page, (67.8, 709.2), FOOT, F['body'], 7.0, GREY_F)
pl = 'Page 6'
put(page, (544.2 - F['body'].text_length(pl, 7.0), 709.2), pl, F['body'], 7.0, GREY_F)
put(page, (67.8, 724.6), 'Confidential Information', F['body'], 6.7, GREY_C)

# ---- page 1 grid cell for Aug 12 -------------------------------------------
one = doc[0]
CELL = fitz.Rect(258.7, 378.3, 353.9, 436.2)      # Wednesday, week 2
r = fitz.Rect(CELL); r.x0 += 1; r.y0 += 1; r.x1 -= 1; r.y1 -= 1
redact(one, [r])
one.draw_rect(CELL, fill=(0.9843, 0.9333, 0.8941), color=None)
put(one, (264.3, 384.1), '12', F['caps'], 9.5, INK)
tl = wrap(TITLE, F['caps'], 7.2, 82.0)
assert len(tl) <= 3, f'grid title needs {len(tl)} lines'
for i, ln in enumerate(tl):
    put(one, (264.3, 400.0 + i * 9.45), ln, F['caps'], 7.2, ORANGE)
put(one, (264.3, 420.8 if len(tl) <= 2 else 430.25), 'Original animation', F['label'], 6.4, GRID_L)
print('page  1  Aug 12 grid cell updated')

doc.save(OUT, garbage=4, deflate=True)
doc.close()

# ---- verify -----------------------------------------------------------------
import re
old, new = fitz.open(SRC), fitz.open(OUT)
for i in range(new.page_count):
    if i in (0, 5):
        continue
    a = re.sub(r'\s+', ' ', old[i].get_text()).strip()
    b = re.sub(r'\s+', ' ', new[i].get_text()).strip()
    assert a == b, f'page {i+1} changed unexpectedly'
t6 = new[5].get_text()
assert 'Align Academy' not in t6 and 'Train for the Job' not in t6
assert 'industry complexity' in t6
# the still must be untouched, and page 4/12 must still be right
assert [x['xref'] for x in new[5].get_image_info(xrefs=True) if x['xref']] == \
       [x['xref'] for x in old[5].get_image_info(xrefs=True) if x['xref']]
print('\nother pages unchanged; Align Academy copy removed; still untouched')
print(f'wrote {OUT}: {new.page_count} pages')
