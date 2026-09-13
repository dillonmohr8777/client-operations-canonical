"""August 2026 content calendar, revision 0036 -> 0037.

Consolidates the three Maher podcast posts into one 2-minute conversation post,
swaps the Aug 19 SmartCare post for the finished industries video, and adds the
new Who We Are brand video as the month's opener. Each rebuilt page gets a frame
grab from its own asset plus fresh copy.

Typefaces were matched to the original by glyph advance: Plus Jakarta Sans 800
for display, PJS 700 for letterspaced caps, DM Sans 400 for body, DM Sans 500 for
grid type labels, DM Sans 700 for the semibold HEADLINE row.
"""
import fitz

SRC = '/home/user/client-operations-canonical/clients/align-hcm/content/august-2026/calendar/Align_August_Calendar_0036.pdf'
OUT = 'Align_August_Calendar_0037.pdf'
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
GRID_T  = ORANGE
GRID_L  = (0x7a/255, 0x80/255, 0x89/255)
INTRO   = (0x35/255, 0x41/255, 0x55/255)
PEACH   = (0.9843, 0.9333, 0.8941)
DIM     = (0xb6/255, 0xba/255, 0xc1/255)

BASE = 0.86              # baseline offset as a fraction of font size
LINE = 13.9              # body leading on a video page
PGAP = 24.5              # paragraph advance

# ---- video page geometry, lifted from the existing Aug 19 page --------------
BAR       = (67.8, 63.4, 544.2, 116.2)
EYE_XY    = (83.4, 76.1)
EYE_W     = 122.6                      # 'WEDNESDAY, AUGUST 19' letterspaced
TITLE_XY  = (83.4, 90.1)
ROW_LABEL_X, ROW_VALUE_X = 74.5, 134.6
ROW_LABEL_TOP = [137.8, 158.3, 179.5, 200.1]
ROW_VALUE_TOP = [137.9, 159.1, 179.7, 200.8]
VALUE_MAX_W = 544.2 - ROW_VALUE_X - 12
POSTCOPY_XY = (67.8, 483.7)
POSTCOPY_W  = 62.3
BODY_X, BODY_W, BODY_TOP = 82.8, 424.0, 516.3
PANEL_BOTTOM = 689.4
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
    tr = (target_w - nat) / max(len(text) - 1, 1)
    put(page, xy, text, font, size, color, tracking=tr)


def wrap(text, font, size, width):
    lines, cur = [], ''
    for w in text.split():
        t = f'{cur} {w}'.strip()
        if font.text_length(t, size) <= width or not cur:
            cur = t
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def strip_text(page):
    for blk in page.get_text('dict')['blocks']:
        if blk['type'] != 0:
            continue
        for line in blk['lines']:
            for span in line['spans']:
                r = fitz.Rect(span['bbox'])
                r.y0 -= 1.4; r.y1 += 1.4; r.x1 += 2.0
                page.add_redact_annot(r)
    page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE,
                          graphics=fitz.PDF_REDACT_LINE_ART_NONE)


# ---------------------------------------------------------------- content ----

POSTS = {
    1: dict(   # page 2, Monday August 3
        eyebrow='MONDAY, AUGUST 3',
        title='The Team That Finishes It',
        rows=[
            ('TARGET',   'HR, IT, and finance leaders choosing an HCM partner', 'body'),
            ('ASSET',    'Video · 1920x1080 · 52.6s · H.264', 'body'),
            ('HEADLINE', 'Selection is the easy decision.', 'sb'),
            ('SUBHEAD',  'An implementation, support, and optimization firm built entirely around HCM.', 'body'),
        ],
        paras=[
            'You picked the platform. Now the hard part starts.',
            'Selection is the easy decision. Everything after it is where the value is won or '
            'lost, and every rollout hits the same five walls: data conversion, integrations, '
            'parallel payroll, go live, and adoption.',
            'Align HCM is the team that finishes it. Assessments, implementation, and training, '
            'client side leads and M&A support, and ongoing help after go live through SmartCare.',
            'The point of all of it is moving from system problems to measurable outcomes.',
            '#HCM #Implementation #WorkforceTechnology',
            'First comment: Meet the team: https://www.alignhcm.com',
        ],
        shot='who-we-are.png',
    ),
    9: dict(   # page 10, Wednesday August 19
        eyebrow='WEDNESDAY, AUGUST 19',
        title='Every Industry Depends On It',
        rows=[
            ('TARGET',   'Operations and HR leaders in regulated, multi site industries', 'body'),
            ('ASSET',    'Video · 1920x1080 · 64.6s · H.264', 'body'),
            ('HEADLINE', 'Different work. One standard for operational trust.', 'sb'),
            ('SUBHEAD',  'Healthcare, public sector, manufacturing, retail and hospitality, services and distribution.', 'body'),
        ],
        paras=[
            'Workforce technology for the work every industry depends on.',
            'A hospital, a plant floor, and a distribution centre do very different work. Their '
            'workforce systems still face the same pressures.',
            'Align HCM builds one workforce foundation without flattening industry complexity: '
            'design for the work itself, connect coverage and pay, and keep the platform relevant.',
            'Different work. One standard for operational trust.',
            '#WorkforceManagement #HCM #IndustrySolutions',
            'First comment: Explore Align HCM services: https://www.alignhcm.com/services',
        ],
        shot='industries.png',
    ),
    11: dict(  # page 12, Monday August 24
        eyebrow='MONDAY, AUGUST 24',
        title='HR at the Table',
        rows=[
            ('TARGET',   'HR and business leaders building the executive conversation', 'body'),
            ('ASSET',    'Video · 1200x626 · 2m13s · H.264', 'body'),
            ('HEADLINE', 'A system of record is the smallest version of the job.', 'sb'),
            ('SUBHEAD',  'Maher El-Abdallah and Brent Skinner on building a foundation for decisions.', 'body'),
        ],
        paras=[
            'HR and payroll get seen as systems of record. That is the smallest version of the job.',
            'In this conversation with Brent Skinner, Maher El-Abdallah makes the case for being '
            'intentional about leveraging the platform for decision making, not only for processing.',
            'Building a foundation is the work. Operational efficiency and the ability to leverage '
            'what the system already knows come after it, and only if the foundation is solid.',
            'That is what it takes to bring HR to the table.',
            '#HRLeadership #HCM #PayrollOperations',
            'First comment: Watch the full conversation: https://youtu.be/vOiiwLKa69M',
        ],
        shot='maher.png',
    ),
}

# ---------------------------------------------------------------- build ------

doc = fitz.open(SRC)
assert doc.page_count == 17

# 1. drop the Aug 31 Maher recut. Earlier pages keep their footers, so nothing
#    needs renumbering.
assert 'AUGUST31' in doc[16].get_text().replace('\xa0', '').replace(' ', '')
doc.delete_page(16)

# 2. rebuild the three video pages
for idx, post in POSTS.items():
    page = doc[idx]
    before = page.get_text().replace('\xa0', '').replace(' ', '')
    assert post['eyebrow'].replace(' ', '').replace(',', '') in before.replace(',', ''), \
        f'page {idx+1} is not {post["eyebrow"]}'

    xref = max(i['xref'] for i in page.get_image_info(xrefs=True))
    strip_text(page)

    put_fit(page, EYE_XY, post['eyebrow'], F['caps'], 7.5, EYEBROW, EYE_W)
    nat = F['display'].text_length(post['title'], 15.0)
    assert nat <= BAR[2] - TITLE_XY[0] - 12, f'title too long: {post["title"]}'
    put_fit(page, TITLE_XY, post['title'], F['display'], 15.0, WHITE, nat * 0.9776)

    for (label, value, style), ltop, vtop in zip(post['rows'], ROW_LABEL_TOP, ROW_VALUE_TOP):
        put_fit(page, (ROW_LABEL_X, ltop), label, F['caps'], 6.4, NAVY,
                F['caps'].text_length(label, 6.4) + 0.78 * (len(label) - 1))
        font = F['bodysb'] if style == 'sb' else F['body']
        col = NAVY if style == 'sb' else INK
        assert font.text_length(value, 7.3) <= VALUE_MAX_W, f'row value too wide: {value}'
        put(page, (ROW_VALUE_X, vtop), value, font, 7.3, col)

    put_fit(page, POSTCOPY_XY, 'POST COPY', F['caps'], 8.3, ORANGE, POSTCOPY_W)

    y, total = BODY_TOP, 0
    for pi, para in enumerate(post['paras']):
        lines = wrap(para, F['body'], 8.1, BODY_W)
        for li, ln in enumerate(lines):
            put(page, (BODY_X, y), ln, F['body'], 8.1, INK)
            total += 1
            if li < len(lines) - 1:
                y += LINE
        if pi < len(post['paras']) - 1:
            y += PGAP
    assert y + 8.1 <= PANEL_BOTTOM - 6, \
        f'page {idx+1} copy overflows by {y + 8.1 - PANEL_BOTTOM + 6:.1f}pt ({total} lines)'
    print(f'page {idx+1:>2}  {post["title"]:<30} {total} copy lines, last top {y:.1f}')

    put(page, (67.8, 709.2), FOOT, F['body'], 7.0, GREY_F)
    pl = f'Page {idx + 1}'
    put(page, (544.2 - F['body'].text_length(pl, 7.0), 709.2), pl, F['body'], 7.0, GREY_F)
    put(page, (67.8, 724.6), 'Confidential Information', F['body'], 6.7, GREY_C)

    page.replace_image(xref, filename=f'{SHOT}/{post["shot"]}')

# 3. page 1: grid cells and the slate summary
one = doc[0]
CELLS = {
    'aug3':  dict(col=73.9, num='3',  ntop=326.2, ttop=342.1, ltop=362.9,
                  title='The Team That Finishes It', kind='Brand video'),
    'aug19': dict(col=264.3, num='19', ntop=441.9, ttop=457.9, ltop=478.7,
                  title='Every Industry Depends On It', kind='Original animation'),
    'aug24': dict(col=73.9, num='24', ntop=499.8, ttop=515.8, ltop=536.5,
                  title='HR at the Table', kind='Podcast video'),
}
CELL_RECTS = {
    'aug3':  fitz.Rect(68.4, 320.5, 163.5, 378.3),
    'aug19': fitz.Rect(258.7, 436.2, 353.9, 494.1),
    'aug24': fitz.Rect(68.4, 494.1, 163.5, 558.1),
    'aug31': fitz.Rect(68.4, 558.1, 163.5, 616.0),
}

# strip the old cell contents and the summary
for key in ('aug3', 'aug19', 'aug24', 'aug31'):
    r = fitz.Rect(CELL_RECTS[key]); r.x0 += 1; r.y0 += 1; r.x1 -= 1; r.y1 -= 1
    one.add_redact_annot(r)
one.add_redact_annot(fitz.Rect(69.0, 232.5, 535.0, 245.0))
one.add_redact_annot(fitz.Rect(69.0, 247.0, 300.0, 259.5))
one.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE,
                     graphics=fitz.PDF_REDACT_LINE_ART_NONE)

# Aug 31 loses its post, so the cell goes back to an unscheduled weekday: no tint,
# dimmed number.
one.draw_rect(CELL_RECTS['aug31'], fill=(1, 1, 1), color=None)
put(one, (73.9, 564.4), '31', F['caps'], 9.5, DIM)

for key, c in CELLS.items():
    one.draw_rect(CELL_RECTS[key], fill=PEACH, color=None)
    put(one, (c['col'], c['ntop']), c['num'], F['caps'], 9.5, INK)
    tl = wrap(c['title'], F['caps'], 7.2, 82.0)
    assert len(tl) <= 3, f'{key} title needs {len(tl)} lines'
    for i, ln in enumerate(tl):
        put(one, (c['col'], c['ttop'] + i * 9.45), ln, F['caps'], 7.2, GRID_T)
    ly = c['ltop'] if len(tl) <= 2 else c['ltop'] + 9.45
    put(one, (c['col'], ly), c['kind'], F['label'], 6.4, GRID_L)

SUMMARY = ('The full month runs fifteen posts: five original animations, four static case '
           'studies, one brand video, one podcast conversation, two expert and talking head '
           'videos, one founder article post, and one training carousel.')
sl = wrap(SUMMARY, F['body'], 8.6, 463.0)
assert len(sl) <= 2, f'summary needs {len(sl)} lines'
for i, ln in enumerate(sl):
    put(one, (70.0, 234.4 + i * 14.4), ln, F['body'], 8.6, INTRO)
print(f'page  1  grid updated, summary {len(sl)} lines')

doc.save(OUT, garbage=4, deflate=True)
print(f'\nwrote {OUT}: {doc.page_count} pages')
