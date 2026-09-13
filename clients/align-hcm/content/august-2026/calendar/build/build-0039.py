"""August 2026 content calendar, revision 0038 -> 0039.

Fixes the GTAA page, which had been showing the Peco Foods artwork since 0036.

Cause: rev 0036 built the Peco page with `fullcopy_page` from the GTAA page. A
full copy shares the image XObject with its source, so calling `replace_image` on
the clone rewrote the object both pages pointed at. Page 4 and page 12 still both
reference xref 40, which is why `replace_image` cannot be used to fix this: it
would put GTAA's artwork on the Peco page as well.

The fix instead overlays the GTAA still as a new image object on page 4 only,
placed on the exact frame the old one occupied so it covers it completely.
"""
import hashlib
import io

import fitz
import numpy as np
from PIL import Image

CAL = '/home/user/client-operations-canonical/clients/align-hcm/content/august-2026/calendar/'
SRC = CAL + 'Align_August_Calendar_0038.pdf'
OUT = 'Align_August_Calendar_0039.pdf'
STATICS = CAL + 'case-study-statics/'

FRAME = fitz.Rect(310.5, 130.7, 538.6, 536.9)   # the portrait case-study frame
EXPECTED = {4: 'GTAA', 5: 'Beumer', 8: 'Troon', 12: 'Peco'}
FILES = {
    'GTAA':   'gtaa-12-priority-needs.jpeg',
    'Beumer': 'beumer-seven-years-hr-history.jpeg',
    'Troon':  'troon-one-workforce-standard.jpeg',
    'Peco':   'peco-foods-practice-that-holds.jpeg',
}


def pixel_hash_file(path):
    a = np.asarray(Image.open(path).convert('RGB')).astype(np.uint8)
    return hashlib.sha256(a.tobytes()).hexdigest()


def pixel_hash_embedded(doc, page):
    """Hash the artwork actually visible in the case-study frame.

    get_image_info returns images in content-stream order, so when an overlay has
    been added the last one landing on the frame is the one on top. Matching on the
    frame also skips the drop-shadow image that sits behind it.
    """
    cands = [i for i in page.get_image_info(xrefs=True)
             if i['xref'] and fitz.Rect(i['bbox']).intersects(FRAME)
             and abs(fitz.Rect(i['bbox']).width - FRAME.width) < 6]
    assert cands, 'no image found on the case-study frame'
    img = doc.extract_image(cands[-1]['xref'])
    a = np.asarray(Image.open(io.BytesIO(img['image'])).convert('RGB')).astype(np.uint8)
    return hashlib.sha256(a.tobytes()).hexdigest()


def audit(doc, label):
    want = {k: pixel_hash_file(STATICS + v) for k, v in FILES.items()}
    rows = []
    for pno, expect in EXPECTED.items():
        got = pixel_hash_embedded(doc, doc[pno - 1])
        actual = next((n for n, h in want.items() if h == got), 'UNKNOWN')
        rows.append((pno, expect, actual, actual == expect))
    print(f'{label}:')
    for pno, expect, actual, ok in rows:
        print(f'    page {pno:>2}  expect {expect:<7} actual {actual:<8} {"OK" if ok else "<<< WRONG"}')
    return all(ok for *_, ok in rows)


doc = fitz.open(SRC)
assert doc.page_count == 14
audit(doc, 'before')

page = doc[3]
assert 'GTAA' in page.get_text(), 'page 4 is not the GTAA post'
shared = [i['xref'] for i in page.get_image_info(xrefs=True) if i['xref']]
peco_xrefs = [i['xref'] for i in doc[11].get_image_info(xrefs=True) if i['xref']]
if set(shared) & set(peco_xrefs):
    print(f'\npage 4 shares image xref {sorted(set(shared) & set(peco_xrefs))} with page 12; '
          f'overlaying a new object instead of replacing')

# New image object on page 4 only. keep_proportion=False so it fills the frame
# exactly the way the original placement did; the still is 0.5625 and the frame is
# 0.5615, a 0.18% difference that is not visible.
page.insert_image(FRAME, filename=STATICS + FILES['GTAA'], keep_proportion=False)

doc.save(OUT, garbage=4, deflate=True)
doc.close()

check = fitz.open(OUT)
print()
ok = audit(check, 'after')
assert ok, 'case-study artwork still mismatched'
# the overlay must not have disturbed anything else
old = fitz.open(SRC)
import re
for i in range(check.page_count):
    a = re.sub(r'\s+', ' ', old[i].get_text()).strip()
    b = re.sub(r'\s+', ' ', check[i].get_text()).strip()
    assert a == b, f'text changed on page {i+1}'
print('\nall page text identical to 0038; only the page 4 artwork changed')
print(f'wrote {OUT}: {check.page_count} pages')
