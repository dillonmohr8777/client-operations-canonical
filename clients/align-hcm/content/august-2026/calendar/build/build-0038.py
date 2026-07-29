"""August 2026 content calendar, revision 0037 -> 0038.

* Aug 5 becomes the HCM Vendor Selection Checklist blog post, replacing the
  Implementation Starts Before Kickoff animation.
* Aug 7, the Six Things Before Payroll Implementation founder post, is removed.
  Its replacement blog now lives on Aug 5.
* Aug 12 keeps its Align Academy post but takes an interim still from the
  industries video, pending a purpose-made screenshot.
* Aug 26, One System Three Learning Paths, is removed as a duplicate of the
  Aug 12 training message.
* Fixes a British spelling that slipped into the Aug 19 copy in 0037.

Deletions run back to front so page indices stay stable, then the footers on
every page that shifted are renumbered.
"""
import fitz

SRC = '/home/user/client-operations-canonical/clients/align-hcm/content/august-2026/calendar/Align_August_Calendar_0037.pdf'
OUT = 'Align_August_Calendar_0038.pdf'
SHOT = 'pick/shots'

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
INTRO   = (0x35/255, 0x41/255, 0x55/255)
PEACH   = (0.9843, 0.9333, 0.8941)
DIM     = (0xb6/255, 0xba/255, 0xc1/255)

BASE, LINE, PGAP = 0.86, 13.9, 24.5
ROW_LABEL_TOP = [137.8, 158.3, 179.5, 200.1]
ROW_VALUE_TOP = [137.9, 159.1, 179.7, 200.8]
ROW_LABEL_X, ROW_VALUE_X = 74.5, 134.6
VALUE_MAX_W = 544.2 - ROW_VALUE_X - 12
BODY_X, BODY_W, BODY_TOP = 82.8, 424.0, 516.3
FOOT = 'Align Human Capital Management \xa0·\xa0 August 2026 Content Calendar'


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


def strip_text(page):
    rs = []
    for blk in page.get_text('dict')['blocks']:
        if blk['type'] != 0:
            continue
        for line in blk['lines']:
            for span in line['spans']:
                r = fitz.Rect(span['bbox']); r.y0 -= 1.4; r.y1 += 1.4; r.x1 += 2.0
                rs.append(r)
    redact(page, rs)


def footer(page, pageno):
    put(page, (67.8, 709.2), FOOT, F['body'], 7.0, GREY_F)
    pl = f'Page {pageno}'
    put(page, (544.2 - F['body'].text_length(pl, 7.0), 709.2), pl, F['body'], 7.0, GREY_F)
    put(page, (67.8, 724.6), 'Confidential Information', F['body'], 6.7, GREY_C)


AUG5 = dict(
    eyebrow='WEDNESDAY, AUGUST 5',
    eyebrow_w=122.6,
    title='Don’t Let the Demos Decide',
    rows=[
        ('TARGET',   'HR, IT, finance, and operations leaders running a vendor evaluation', 'body'),
        ('ASSET',    'Static · landscape social resize', 'body'),
        ('HEADLINE', 'The best HCM system is not the one with the smoothest demo.', 'sb'),
        ('SUBHEAD',  '15 evaluation questions and a weighted scorecard, for the decision before the demos.', 'body'),
    ],
    paras=[
        'Disciplined HCM evaluations turn into presentation contests more often than anyone admits.',
        'One vendor has a beautiful employee experience. Another has an impressive dashboard. '
        'Everyone leaves with a different favorite, because nobody agreed on the decision before '
        'the demos started.',
        'The fix is a better decision model. Define the outcomes and the decision rights first, '
        'document the hard operating scenarios, bring the right people into the room, and make '
        'every vendor prove the same things.',
        'Maher El-Abdallah put 15 evaluation questions and a weighted scorecard in one place, so '
        'implementation effort, adoption, support, and long term ownership get scored next to '
        'product capability.',
        '#HCMSelection #HRIS #VendorEvaluation',
        'First comment: Read the checklist: https://www.alignhcm.com/blog/hcm-vendor-selection-checklist',
    ],
    shot='vendor-checklist.png',
    panel_bottom=713.9,
)

doc = fitz.open(SRC)
assert doc.page_count == 16

# ---- 1. rebuild Aug 5 (idx 2) ------------------------------------------------
page = doc[2]
assert 'AUGUST5' in page.get_text().replace('\xa0', '').replace(' ', '')
xref = max(i['xref'] for i in page.get_image_info(xrefs=True))
strip_text(page)

put_fit(page, (83.4, 76.1), AUG5['eyebrow'], F['caps'], 7.5, EYEBROW, AUG5['eyebrow_w'])
nat = F['display'].text_length(AUG5['title'], 15.0)
assert nat <= 544.2 - 83.4 - 12, f'title too long ({nat:.0f}pt)'
put_fit(page, (83.4, 90.1), AUG5['title'], F['display'], 15.0, WHITE, nat * 0.9776)

for (label, value, style), lt, vt in zip(AUG5['rows'], ROW_LABEL_TOP, ROW_VALUE_TOP):
    put_fit(page, (ROW_LABEL_X, lt), label, F['caps'], 6.4, NAVY,
            F['caps'].text_length(label, 6.4) + 0.78 * (len(label) - 1))
    fo = F['bodysb'] if style == 'sb' else F['body']
    assert fo.text_length(value, 7.3) <= VALUE_MAX_W, f'row too wide: {value}'
    put(page, (ROW_VALUE_X, vt), value, fo, 7.3, NAVY if style == 'sb' else INK)

put_fit(page, (67.8, 483.7), 'POST COPY', F['caps'], 8.3, ORANGE, 62.3)

y, total = BODY_TOP, 0
for pi, para in enumerate(AUG5['paras']):
    lines = wrap(para, F['body'], 8.1, BODY_W)
    for li, ln in enumerate(lines):
        put(page, (BODY_X, y), ln, F['body'], 8.1, INK)
        total += 1
        if li < len(lines) - 1:
            y += LINE
    if pi < len(AUG5['paras']) - 1:
        y += PGAP
assert y + 8.1 <= AUG5['panel_bottom'] - 6, f'Aug 5 copy overflows ({total} lines, last top {y:.1f})'
print(f'page  3  {AUG5["title"]:<30} {total} copy lines, last top {y:.1f}')

# This page's copy panel ran to 713.9, which in the source deck already crossed
# through the footer text. The new copy is shorter, so normalise the panel to the
# 689.4 bottom every other page uses, then rebuild the chrome that sat below it.
BORDER = (0.851, 0.863, 0.878)
page.draw_rect(fitz.Rect(67.2, 689.4, 544.8, 717.5), fill=(1, 1, 1), color=None)
page.draw_rect(fitz.Rect(67.8, 688.8, 544.2, 689.4), fill=BORDER, color=None)
page.draw_rect(fitz.Rect(67.8, 701.1, 544.2, 702.2), fill=ORANGE, color=None)
footer(page, 3)
page.replace_image(xref, filename=f'{SHOT}/{AUG5["shot"]}')

# ---- 2. Aug 12 (idx 6) gets an interim still from the industries video -------
p12 = doc[6]
assert 'AUGUST12' in p12.get_text().replace('\xa0', '').replace(' ', '')
p12.replace_image(max(i['xref'] for i in p12.get_image_info(xrefs=True)),
                  filename=f'{SHOT}/industries-foundation.png')
print('page  7  Aug 12 still swapped for the industries video frame (interim)')

# ---- 3. fix the British spelling that slipped into Aug 19 in 0037 ------------
p19 = doc[9]
assert 'centre' in p19.get_text()
redact(p19, [fitz.Rect(80.0, 537.0, 520.0, 569.0)])
fix = ('A hospital, a plant floor, and a distribution center do very different work. Their '
       'workforce systems still face the same pressures.')
yy = BODY_TOP + PGAP
for i, ln in enumerate(wrap(fix, F['body'], 8.1, BODY_W)):
    put(p19, (BODY_X, yy + i * LINE), ln, F['body'], 8.1, INK)
assert 'centre' not in doc[9].get_text()
print('page 10  Aug 19 copy: centre -> center')

# ---- 4. delete Aug 26 then Aug 7, back to front -----------------------------
assert 'AUGUST26' in doc[13].get_text().replace('\xa0', '').replace(' ', '')
doc.delete_page(13)
assert 'AUGUST7' in doc[4].get_text().replace('\xa0', '').replace(' ', '')
doc.delete_page(4)
assert doc.page_count == 14

# ---- 5. renumber the footers on every page that shifted ---------------------
for idx in range(4, doc.page_count):
    p = doc[idx]
    hits = p.search_for('Page ')
    assert hits, f'no page number found on idx{idx}'
    h = hits[0]
    redact(p, [fitz.Rect(h.x0 - 2, h.y0 - 3, 548, h.y1 + 3)])
    pl = f'Page {idx + 1}'
    put(p, (544.2 - F['body'].text_length(pl, 7.0), 709.2), pl, F['body'], 7.0, GREY_F)
print(f'         footers renumbered for idx 4..{doc.page_count - 1}')

# ---- 6. page 1: grid + summary ----------------------------------------------
one = doc[0]
CELL = {
    'aug5':  fitz.Rect(258.7, 320.5, 353.9, 378.3),
    'aug7':  fitz.Rect(449.0, 320.5, 544.2, 378.3),
    'aug26': fitz.Rect(258.7, 494.1, 353.9, 558.1),
}
rs = []
for r0 in CELL.values():
    r = fitz.Rect(r0); r.x0 += 1; r.y0 += 1; r.x1 -= 1; r.y1 -= 1
    rs.append(r)
# Redact the old slate summary by its actual spans rather than a guessed box; the
# second line ran to x=472 and a narrow rect left its tail showing through.
for blk in one.get_text('dict')['blocks']:
    if blk['type'] != 0:
        continue
    for line in blk['lines']:
        for span in line['spans']:
            if 230.0 < span['bbox'][1] < 262.0:
                r = fitz.Rect(span['bbox'])
                r.x0 -= 2; r.y0 -= 2; r.x1 += 4; r.y1 += 2
                rs.append(r)
redact(one, rs)

# Aug 7 and Aug 26 revert to unscheduled weekdays: no tint, dimmed number
for key, num, col, ntop in (('aug7', '7', 454.6, 326.2), ('aug26', '26', 264.3, 499.8)):
    one.draw_rect(CELL[key], fill=(1, 1, 1), color=None)
    put(one, (col, ntop), num, F['caps'], 9.5, DIM)

one.draw_rect(CELL['aug5'], fill=PEACH, color=None)
put(one, (264.3, 326.2), '5', F['caps'], 9.5, INK)
tl = wrap('Don’t Let the Demos Decide', F['caps'], 7.2, 82.0)
assert len(tl) <= 3, f'Aug 5 grid title needs {len(tl)} lines'
for i, ln in enumerate(tl):
    put(one, (264.3, 342.1 + i * 9.45), ln, F['caps'], 7.2, ORANGE)
put(one, (264.3, 362.9 if len(tl) <= 2 else 372.35), 'Founder blog + static', F['label'], 6.4, GRID_L)

SUMMARY = ('The full month runs thirteen posts: four original animations, four static case '
           'studies, one brand video, one founder blog post, one podcast conversation, and two '
           'expert and talking head videos.')
sl = wrap(SUMMARY, F['body'], 8.6, 463.0)
assert len(sl) <= 2, f'summary needs {len(sl)} lines'
for i, ln in enumerate(sl):
    put(one, (70.0, 234.4 + i * 14.4), ln, F['body'], 8.6, INTRO)
print(f'page  1  grid updated, summary {len(sl)} lines')

doc.save(OUT, garbage=4, deflate=True)
print(f'\nwrote {OUT}: {doc.page_count} pages')
