"""Insert the Peco Foods case-study page into the August 2026 content calendar.

Clones the design chrome from an existing case-study page (page 4), strips its
text, and redraws the Peco content using the calendar's own typefaces:
Plus Jakarta Sans for display, DM Sans for body. Then renumbers the footers on
the pages that shift, and updates the page 1 at-a-glance grid and slate counts.
"""
import fitz

SRC = 'Align_August_Calendar_0035.pdf'
OUT = 'Align_August_Calendar_0036.pdf'
ART = '/root/.claude/uploads/a8be5f11-e73e-58fb-a6c8-0acb65e8b5cf/f0013549-IMG_4113.jpeg'

TEMPLATE_PAGE = 3        # 0-indexed: page 4, the GTAA case study
PECO_INDEX    = 12       # 0-indexed slot the Peco page occupies: page 13, after Mon Aug 24

F = {
    'display': fitz.Font(fontfile='fonts/PlusJakartaSans-800.ttf'),
    'caps':    fitz.Font(fontfile='fonts/PlusJakartaSans-700.ttf'),
    'body':    fitz.Font(fontfile='fonts/DMSans-400.ttf'),
    'bodysb':  fitz.Font(fontfile='fonts/DMSans-700.ttf'),
    'label':   fitz.Font(fontfile='fonts/DMSans-500.ttf'),
}

NAVY   = (0x17 / 255, 0x32 / 255, 0x4d / 255)
INK    = (0x11 / 255, 0x18 / 255, 0x20 / 255)
WHITE  = (1, 1, 1)
ORANGE = (0xf0 / 255, 0x5a / 255, 0x28 / 255)
EYEBROW = (0xff / 255, 0x6b / 255, 0x35 / 255)
GREY_F = (0x8a / 255, 0x8f / 255, 0x98 / 255)
GREY_C = (0xa2 / 255, 0xa7 / 255, 0xaf / 255)

BASE = 0.86              # baseline offset as a fraction of font size, matched to the original
LINE = 12.25             # body leading
PGAP = 21.1              # paragraph advance (first baseline to first baseline)

# ---------------------------------------------------------------- text helpers

def put(page, xy, text, font, size, color, tracking=0.0):
    """Draw a single line, optionally letterspaced. xy is (x, span-top)."""
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
    """Draw a line letterspaced so its total advance equals target_w."""
    nat = font.text_length(text, size)
    tr = (target_w - nat) / max(len(text) - 1, 1)
    put(page, xy, text, font, size, color, tracking=tr)


def wrap(text, font, size, width):
    lines, cur = [], ''
    for word in text.split():
        trial = f'{cur} {word}'.strip()
        if font.text_length(trial, size) <= width or not cur:
            cur = trial
        else:
            lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    return lines


# ---------------------------------------------------------------- peco content

EYEBROW_TXT = 'TUESDAY, AUGUST 25'
TITLE       = 'Peco Foods: Stability After a Rocky Go Live'

ROWS = [
    ('TARGET',   'Food manufacturing and multi plant operations and HR leaders', 'body'),
    ('ASSET',    'Static · 1080x1350 and 1080x1920', 'body'),
    ('HEADLINE', 'Stability after go live is what turns a new platform into a working practice.', 'sb'),
    ('SUBHEAD',  '7,000 employees, three states, three unions, a dependable practice in under six months.', 'body'),
]

PARAS = [
    'Stability after go live is what turns a new platform into a working practice.',
    'Peco Foods runs union represented poultry plants across three states, where '
    'every assignment lands on output, safety, and a real paycheck.',
    'Right after go live the cracks showed. Complex plant shifts, three union '
    'agreements pulling different ways, and time and pay that could not afford a bad week.',
    'Align HCM steadied the configuration, cleared the exception backlog, and handed '
    'the team the knowledge to run the platform on its own.',
    'Inside six months Peco went from recurring fires to a workforce management '
    'practice the operation leans on every week.',
    '#FoodManufacturing #WorkforceManagement #PostGoLive',
    'First comment: Read the Peco Foods client story: https://www.alignhcm.com/case-studies',
]

# ---------------------------------------------------------------- build

doc = fitz.open(SRC)
# fullcopy_page inserts the clone *at* the given index, pushing later pages down.
doc.fullcopy_page(TEMPLATE_PAGE, PECO_INDEX)
page = doc[PECO_INDEX]
_prev = doc[PECO_INDEX - 1].get_text().replace('\xa0', '').replace(' ', '')
assert 'MONDAY,AUGUST24' in _prev, 'page before the Peco slot is not Mon Aug 24'

# 1. strip every glyph from the clone, leaving fills, borders, and images intact
for blk in page.get_text('dict')['blocks']:
    if blk['type'] != 0:
        continue
    for line in blk['lines']:
        for span in line['spans']:
            r = fitz.Rect(span['bbox'])
            r.y0 -= 1.2
            r.y1 += 1.2
            r.x1 += 1.5
            page.add_redact_annot(r)
page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE,
                      graphics=fitz.PDF_REDACT_LINE_ART_NONE)

# 2. header
put_fit(page, (83.4, 76.1), EYEBROW_TXT, F['caps'], 7.5, EYEBROW, 108.5)
_nat = F['display'].text_length(TITLE, 15.0)
assert _nat <= 460.8 - 83.4, f'headline too long for the bar: {_nat:.1f}pt'
put_fit(page, (83.4, 90.1), TITLE, F['display'], 15.0, WHITE, _nat * 0.9776)

# 3. detail table. Row label baselines and value blocks keyed off the cloned grid.
ROW_TOP = [131.3, 162.4, 183.6, 224.8]
ROW_BOT = [162.4, 183.0, 224.2, 265.9]
LABEL_X, VALUE_X, VALUE_W = 74.5, 134.6, 268.2 - 134.6 - 15.0

for (label, value, style), top, bot in zip(ROWS, ROW_TOP, ROW_BOT):
    lines = wrap(value, F['body'], 7.3, VALUE_W)
    # vertically centre the value block in its row
    block_h = len(lines) * 10.2
    vy = top + (bot - top - block_h) / 2 + 0.6
    put_fit(page, (LABEL_X, top + (bot - top) / 2 - 3.2), label, F['caps'], 6.4, NAVY,
            F['caps'].text_length(label, 6.4) + 0.78 * (len(label) - 1))
    for i, ln in enumerate(lines):
        font = F['bodysb'] if style == 'sb' else F['body']
        col = NAVY if style == 'sb' else INK
        put(page, (VALUE_X, vy + i * 10.2), ln, font, 7.3, col)

# 4. POST COPY heading + body panel
put_fit(page, (67.8, 281.1), 'POST COPY', F['caps'], 8.3, ORANGE, 62.3)

BODY_X, BODY_W, BODY_TOP = 80.6, 175.0, 311.9
PANEL_LIMIT = 597.0

y = BODY_TOP
total = 0
for pi, para in enumerate(PARAS):
    lines = wrap(para, F['body'], 7.5, BODY_W)
    for li, ln in enumerate(lines):
        put(page, (BODY_X, y), ln, F['body'], 7.5, INK)
        total += 1
        if li < len(lines) - 1:
            y += LINE
    if pi < len(PARAS) - 1:
        y += PGAP

print(f'body: {total} lines, last baseline top {y:.1f} (panel limit {PANEL_LIMIT})')
assert y <= PANEL_LIMIT, f'copy overflows the panel by {y - PANEL_LIMIT:.1f}pt'

# 5. artwork
xref = max(i['xref'] for i in page.get_image_info(xrefs=True))
page.replace_image(xref, filename=ART)

# 6a. the Peco page lost its whole footer in the text strip, so rebuild it
FOOT = 'Align Human Capital Management  ·  August 2026 Content Calendar'
put(page, (67.8, 709.2), FOOT, F['body'], 7.0, GREY_F)
_pl = f'Page {PECO_INDEX + 1}'
put(page, (544.2 - F['body'].text_length(_pl, 7.0), 709.2), _pl, F['body'], 7.0, GREY_F)
put(page, (67.8, 724.6), 'Confidential Information', F['body'], 6.7, GREY_C)

# 6b. renumber the footers on every page that shifted down
for idx in range(PECO_INDEX + 1, doc.page_count):
    p = doc[idx]
    for hit in p.search_for('Page '):
        band = fitz.Rect(hit.x0 - 2, hit.y0 - 3, 548, hit.y1 + 3)
        p.add_redact_annot(band)
        p.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE,
                           graphics=fitz.PDF_REDACT_LINE_ART_NONE)
        label = f'Page {idx + 1}'
        w = F['body'].text_length(label, 7.0)
        put(p, (544.2 - w, 709.2), label, F['body'], 7.0, GREY_F)
        break


# ---------------------------------------------------------------- page 1

PEACH   = (0.9843, 0.9333, 0.8941)
GRID_T  = (0xf0 / 255, 0x5a / 255, 0x28 / 255)
GRID_L  = (0x7a / 255, 0x80 / 255, 0x89 / 255)
INTRO   = (0x35 / 255, 0x41 / 255, 0x55 / 255)

one = doc[0]

# 7a. strip the grey "25" and the two-line slate summary
for rect in [fitz.Rect(167.5, 498.0, 184.0, 511.0),
             fitz.Rect(69.0, 232.5, 535.0, 245.0),
             fitz.Rect(69.0, 247.0, 297.0, 259.5)]:
    one.add_redact_annot(rect)
one.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE,
                     graphics=fitz.PDF_REDACT_LINE_ART_NONE)

# 7b. promote Aug 25 to a posting day
one.draw_rect(fitz.Rect(163.5, 494.1, 258.7, 558.1), fill=PEACH, color=None)

CELL_X = 169.1
put(one, (CELL_X, 499.8), '25', F['caps'], 9.5, INK)

title_lines = wrap(TITLE, F['caps'], 7.2, 82.0)
assert len(title_lines) <= 3, f'Aug 25 cell title needs {len(title_lines)} lines'
for i, ln in enumerate(title_lines):
    put(one, (CELL_X, 515.8 + i * 9.45), ln, F['caps'], 7.2, GRID_T)
label_y = 536.5 if len(title_lines) <= 2 else 546.0
put(one, (CELL_X, label_y), 'Static case study', F['label'], 6.4, GRID_L)

# 7c. reflow the slate summary for sixteen posts / four static case studies
SUMMARY = ('The full month runs sixteen posts: five original animations, four static case '
           'studies, two expert videos, three podcast clips, one founder article post, and '
           'one training carousel.')
sum_lines = wrap(SUMMARY, F['body'], 8.6, 463.0)
assert len(sum_lines) <= 2, f'slate summary needs {len(sum_lines)} lines, only 2 fit'
for i, ln in enumerate(sum_lines):
    put(one, (70.0, 234.4 + i * 14.4), ln, F['body'], 8.6, INTRO)
print(f'page 1: Aug 25 title {len(title_lines)} lines, summary {len(sum_lines)} lines')

doc.save(OUT, garbage=4, deflate=True)
print(f'wrote {OUT}: {doc.page_count} pages')
