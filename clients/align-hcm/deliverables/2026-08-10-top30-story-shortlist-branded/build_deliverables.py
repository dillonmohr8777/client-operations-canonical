#!/usr/bin/env python3
"""Build the Align HCM branded Top 30 Story Shortlist: XLSX + HTML twin.

Brand tokens extracted from shipped Align editorial PDFs (Aug 2026) and the
alignhcm-brand skill. Data copied verbatim from the source workbook; the only
additions are the masthead, styling, and three HubSpot-verified columns.
"""
import base64, html, json, os
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from openpyxl.drawing.image import Image as XLImage

SRC = "/root/.claude/uploads/9e045f79-a3fe-5e0b-b800-e5900182d04c/fc733806-Align_HCM_Top30_Story_Shortlist.xlsx"
OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "build")
LOGO = os.path.join(os.path.dirname(os.path.abspath(__file__)), "logos/align-hcm-logo-reverse.png")
os.makedirs(OUT_DIR, exist_ok=True)

# ---------------------------------------------------------------- brand tokens
NAVY      = "0A1628"   # primary ink / masthead
NAVY_SOFT = "33506F"
STEEL     = "1B4F72"
STEEL_TINT= "EDF3F8"
BODY      = "2D3748"
MUTED     = "646E7C"
ORANGE    = "F05A28"
ORANGE_B  = "FF6B2B"
RUST      = "AD3D1B"
ORANGE_TINT="FDF1EA"
TEAL      = "136E61"
TEAL_TINT = "E9F7F4"
PAPER     = "FCFAF7"
PANEL     = "F5F1EA"
HAIR      = "E9E4DC"
CREAM_TOT = "F4EFE7"   # source total-row cream
YELLOW    = "FFF2CC"   # source editable columns
BLUE_MUTED= "B9C6D8"

# ------------------------------------------------- domain + CRM enrichment map
# domain = public primary domain used for the logo + Website column.
# hq / emp = HubSpot CRM values (portal 242825734, read 10 Aug 2026); "" = not in CRM.
ENRICH = {
    "Leyad":                          ("leyad.ca",                    "Ontario, Canada", 300),
    "GES":                            ("ges.com",                     "Las Vegas, NV", ""),
    "Curtin Maritime":                ("curtinmaritime.com",          "", 500),
    "EverQuote":                      ("everquote.com",               "", 350),
    "BURNCO":                         ("burnco.com",                  "Calgary, AB", 1500),
    "OhioHealth":                     ("ohiohealth.com",              "Columbus, OH", 30000),
    "McLeod Software":                ("mcleodsoftware.com",          "Birmingham, AL", 700),
    "PrimeFlight":                    ("primeflight.com",             "Sugar Land, TX", 9400),
    "Vacasa":                         ("vacasa.com",                  "Portland, OR", 6800),
    "MW Components":                  ("mwcomponents.com",            "Charlotte, NC", 2100),
    "Distributor Wire & Cable":       ("distributorwireandcable.com", "", ""),
    "Bethany Christian Services":     ("bethany.org",                 "", ""),
    "TriState Health":                ("tsh.org",                     "Clarkson, WA", ""),
    "KW Property Management":         ("kwpmc.com",                   "Miami, FL", 2700),
    "Troon":                          ("troon.com",                   "Scottsdale, AZ", 30000),
    "JACAM Catalyst":                 ("jacamcatalyst.com",           "Sterling, KS", ""),
    "Chautauqua Institution":         ("chq.org",                     "", 1400),
    "Excelsior University":           ("excelsior.edu",               "Albany, NY", ""),
    "Eagle Materials":                ("eaglematerials.com",          "Dallas, TX", 2657),
    "MTA NY":                         ("mta.info",                    "", 70000),
    "Grand River Health":             ("grandriverhealth.org",        "Rifle, CO", 850),
    "Bayshore HealthCare":            ("bayshore.ca",                 "Etobicoke, ON", 3500),
    "Rollins":                        ("rollins.com",                 "Atlanta, GA", 13000),
    "Driscoll's":                     ("driscolls.com",               "Watsonville, CA", 6200),
    "Trimac Transportation":          ("trimac.com",                  "Calgary, AB", ""),
    "Coastal Community Credit Union": ("cccu.ca",                     "", ""),
    "REI":                            ("rei.com",                     "", ""),
    "UBE":                            ("ube.com",                     "", ""),
    "Ace Parking":                    ("aceparking.com",              "", 5000),
    "McCain Foods":                   ("mccain.com",                  "Ontario, Canada", 20000),
}

# ------------------------------------------------------------- read the source
swb = openpyxl.load_workbook(SRC)  # formulas preserved
s30, sref, sgap, srm = (swb[n] for n in
    ("Top 30 Shortlist", "Reference Candidates", "Representation Gaps", "Read Me"))

def v(ws, r, c):
    x = ws.cell(row=r, column=c).value
    return "" if x is None else x

TITLE_30, SUB_30, EDIT_NOTE = v(s30,1,1), v(s30,2,1), v(s30,3,1)
HDR_30 = [v(s30,5,c) for c in range(1,18)]
ROWS_30 = [[v(s30,r,c) for c in range(1,18)] for r in range(6,36)]
TITLE_REF, SUB_REF = v(sref,1,1), v(sref,2,1)
HDR_REF = [v(sref,4,c) for c in range(1,11)]
ROWS_REF = [[v(sref,r,c) for c in range(1,11)] for r in range(5, sref.max_row+1) if v(sref,r,2)]
TITLE_GAP, SUB_GAP = v(sgap,1,1), v(sgap,2,1)
GAP_LINES = [[v(sgap,r,c) for c in range(1,6)] for r in range(3, sgap.max_row+1)]
GAP_LINES = [row for row in GAP_LINES if any(str(x) != "" for x in row)]
README_LINES = [v(srm,r,1) for r in range(1, srm.max_row+1)]

assert len(ROWS_30) == 30 and all(r[2] in ENRICH for r in ROWS_30), "client map incomplete"

# =============================================================== XLSX build ==
wb = openpyxl.Workbook()
wb.remove(wb.active)

thin_hair  = Side(style="thin", color=HAIR)
thin_navy  = Side(style="thin", color=NAVY)
dbl_orange = Side(style="double", color=ORANGE)

def fill(hexrgb): return PatternFill("solid", fgColor=hexrgb)
def band(ws, r1, r2, c1, c2, hexrgb):
    for r in range(r1, r2+1):
        for c in range(c1, c2+1):
            ws.cell(row=r, column=c).fill = fill(hexrgb)

def masthead(ws, ncols, title, subtitle, kicker, big_logo=False):
    """Navy brand band. Returns next free row."""
    band(ws, 1, 4 if big_logo else 3, 1, ncols, NAVY)
    tc = 6 if big_logo else 1
    if big_logo:
        ws.row_dimensions[1].height = 20
        ws.row_dimensions[2].height = 30
        ws.row_dimensions[3].height = 22
        ws.row_dimensions[4].height = 14
        img = XLImage(LOGO)
        img.width, img.height = 240, 97           # 268x108 asset, kept sharp
        ws.add_image(img, "A1")
        nxt = 5
    else:
        ws.row_dimensions[1].height = 16
        ws.row_dimensions[2].height = 24
        ws.row_dimensions[3].height = 16
        nxt = 4
    krow = 1
    ws.cell(row=krow, column=tc, value=kicker).font = Font(name="Arial", size=8, bold=True, color=ORANGE_B)
    ws.cell(row=krow+1, column=tc, value=title).font = Font(name="Arial", size=16, bold=True, color="FFFFFF")
    ws.cell(row=krow+2, column=tc, value=subtitle).font = Font(name="Arial", size=9, color=BLUE_MUTED)
    for rr in range(1, (5 if big_logo else 4)):
        ws.row_dimensions[rr].outlineLevel = 0
    return nxt

def style_header_row(ws, r, ncols):
    ws.row_dimensions[r].height = 24
    for c in range(1, ncols+1):
        cell = ws.cell(row=r, column=c)
        cell.fill = fill(NAVY)
        cell.font = Font(name="Arial", size=9, bold=True, color="FFFFFF")
        cell.alignment = Alignment(vertical="center", wrap_text=True)
        cell.border = Border(bottom=Side(style="medium", color=ORANGE))

def body_cell(ws, r, c, value, alt=False, yellow=False, numfmt=None, bold=False,
              color=BODY, align=None):
    cell = ws.cell(row=r, column=c, value=value)
    cell.font = Font(name="Arial", size=9, bold=bold, color=color)
    cell.fill = fill(YELLOW) if yellow else (fill(PANEL) if alt else fill(PAPER))
    cell.border = Border(bottom=thin_hair)
    cell.alignment = Alignment(vertical="center", wrap_text=True,
                               horizontal=align if align else None)
    if numfmt: cell.number_format = numfmt
    return cell

# ---------------------------------------------------------- tab 1: Top 30
ws = wb.create_sheet("Top 30 Shortlist")
ws.sheet_view.showGridLines = False
HDR = HDR_30 + ["Website", "HQ (CRM)", "Employees (CRM)"]
N = len(HDR)  # 20
nxt = masthead(ws, N, "Top 30 Story Shortlist",
               SUB_30 or "Recommendation for Objective 1",
               "ALIGN HCM  ·  INTERNAL USE  ·  PREPARED 10 AUG 2026", big_logo=True)
enote = ws.cell(row=nxt, column=1, value=EDIT_NOTE)
enote.font = Font(name="Arial", size=9, bold=True, color=RUST)
band(ws, nxt, nxt, 1, N, ORANGE_TINT)
ws.row_dimensions[nxt].height = 18
nxt += 1
ws.row_dimensions[nxt].height = 6
band(ws, nxt, nxt, 1, N, PAPER)
hdr_r = nxt + 1
for i, h in enumerate(HDR, start=1):
    ws.cell(row=hdr_r, column=i, value=h)
style_header_row(ws, hdr_r, N)
first, last = hdr_r+1, hdr_r+30
for i, row in enumerate(ROWS_30):
    r = first + i
    alt = i % 2 == 1
    client = row[2]
    dom, hq, emp = ENRICH[client]
    ws.row_dimensions[r].height = 15
    for c, val in enumerate(row, start=1):
        yellow = c in (15, 16, 17)
        kw = {}
        if c == 1:  kw = dict(bold=True, color=ORANGE if i < 5 else NAVY, align="center")
        if c == 2:  kw = dict(color=MUTED)
        if c == 3:  kw = dict(bold=True, color=NAVY)
        if c == 7:  kw = dict(color=STEEL, bold=True)
        if c == 9:  kw = dict(align="center", numfmt="0")
        if c == 10: kw = dict(numfmt="$#,##0", align="right", bold=True)
        if c == 11: kw = dict(color=TEAL if val == "Yes" else MUTED, align="center")
        if c == 12: kw = dict(color=ORANGE if val == "Raven" else MUTED, align="center")
        if c == 13: kw = dict(color=TEAL if str(val).startswith("Ready") else RUST)
        body_cell(ws, r, c, val, alt=alt, yellow=yellow, **kw)
    body_cell(ws, r, 18, dom, alt=alt, color=STEEL)
    ws.cell(row=r, column=18).hyperlink = f"https://{dom}"
    body_cell(ws, r, 19, hq, alt=alt, color=MUTED)
    body_cell(ws, r, 20, emp if emp != "" else None, alt=alt, numfmt="#,##0", align="right", color=MUTED)
tot = last + 1
band(ws, tot, tot, 1, N, CREAM_TOT)
ws.row_dimensions[tot].height = 18
ws.cell(row=tot, column=9,  value="TOTAL").font = Font(name="Arial", size=9, bold=True, color=NAVY)
jc = ws.cell(row=tot, column=10, value=f"=SUM(J{first}:J{last})")
jc.number_format = "$#,##0"; jc.font = Font(name="Arial", size=10, bold=True, color=RUST)
jc.alignment = Alignment(horizontal="right")
kc = ws.cell(row=tot, column=11, value=f'=COUNTIF(K{first}:K{last},"Yes")')
lc = ws.cell(row=tot, column=12, value=f'=COUNTIF(L{first}:L{last},"Raven")')
for c_ in (kc, lc):
    c_.font = Font(name="Arial", size=9, bold=True, color=NAVY)
    c_.alignment = Alignment(horizontal="center")
for c in range(1, N+1):
    ws.cell(row=tot, column=c).border = Border(top=dbl_orange)
prov = ws.cell(row=tot+2, column=1, value=("Branded edition prepared 10 Aug 2026. Columns R:T verified read-only against "
    "HubSpot portal 242825734 on 10 Aug 2026. Story data rows are unchanged from the 10 Aug shortlist build. "
    "Public web domains are shown where a CRM record used a subsidiary or legacy domain (OhioHealth, MTA NY, McCain Foods); see Read Me."))
prov.font = Font(name="Arial", size=8, italic=True, color=MUTED)
widths = [6,10,27,22,12,9,11,26,8,13,10,8,22,18,16,12,24,24,16,12]
for i, w in enumerate(widths, start=1):
    ws.column_dimensions[get_column_letter(i)].width = w
ws.freeze_panes = f"A{first}"
ws.auto_filter.ref = f"A{hdr_r}:{get_column_letter(N)}{last}"

# ------------------------------------------------- tab 2: Reference Candidates
ws2 = wb.create_sheet("Reference Candidates")
ws2.sheet_view.showGridLines = False
N2 = len(HDR_REF)
nxt = masthead(ws2, N2, TITLE_REF or "Top References", SUB_REF,
               "ALIGN HCM  ·  OBJECTIVE 2")
ws2.row_dimensions[nxt].height = 6
band(ws2, nxt, nxt, 1, N2, PAPER)
hdr_r2 = nxt + 1
for i, h in enumerate(HDR_REF, start=1):
    ws2.cell(row=hdr_r2, column=i, value=h)
style_header_row(ws2, hdr_r2, N2)
for i, row in enumerate(ROWS_REF):
    r = hdr_r2 + 1 + i
    alt = i % 2 == 1
    tier_a = str(row[0]).startswith("A")
    for c, val in enumerate(row, start=1):
        yellow = c in (9, 10)
        kw = {}
        if c == 1: kw = dict(bold=True, color=TEAL if tier_a else STEEL)
        if c == 2: kw = dict(bold=True, color=NAVY)
        if c == 6: kw = dict(align="center")
        if c == 7: kw = dict(numfmt="$#,##0", align="right")
        if c == 8: kw = dict(align="center", numfmt="0")
        body_cell(ws2, r, c, val, alt=alt, yellow=yellow, **kw)
for i, w in enumerate([18,28,24,12,9,12,14,9,18,18], start=1):
    ws2.column_dimensions[get_column_letter(i)].width = w
ws2.freeze_panes = f"A{hdr_r2+1}"

# ------------------------------------------------- tab 3: Representation Gaps
ws3 = wb.create_sheet("Representation Gaps")
ws3.sheet_view.showGridLines = False
nxt = masthead(ws3, 5, TITLE_GAP or "Representation check", SUB_GAP,
               "ALIGN HCM  ·  OBJECTIVE 4")
r = nxt + 1
zebra = 0
for line in GAP_LINES:
    a = str(line[0])
    is_section = a.isupper() and line[1] == ""
    is_hdr = a == "Value"
    ws3.row_dimensions[r].height = 15
    if is_section:
        ws3.row_dimensions[r].height = 22
        cell = ws3.cell(row=r, column=1, value=a)
        cell.font = Font(name="Arial", size=10, bold=True, color=RUST)
        cell.alignment = Alignment(vertical="bottom")
        zebra = 0
    elif is_hdr:
        for c, val in enumerate(line, start=1):
            ws3.cell(row=r, column=c, value=val)
        style_header_row(ws3, r, 5)
        zebra = 0
    else:
        flagged = str(line[4]).strip() != ""
        for c, val in enumerate(line, start=1):
            kw = {}
            if c == 1: kw = dict(bold=True, color=NAVY)
            if c in (2,3): kw = dict(align="center")
            if c == 4: kw = dict(numfmt="$#,##0", align="right")
            if c == 5: kw = dict(bold=True, color=ORANGE)
            cell = body_cell(ws3, r, c, val, alt=zebra % 2 == 1, **kw)
            if flagged: cell.fill = fill(ORANGE_TINT)
        zebra += 1
    r += 1
for i, w in enumerate([30,12,12,20,26], start=1):
    ws3.column_dimensions[get_column_letter(i)].width = w

# --------------------------------------------------------- tab 4: Read Me
ws4 = wb.create_sheet("Read Me")
ws4.sheet_view.showGridLines = False
nxt = masthead(ws4, 1, README_LINES[0] or "Read Me", "Method, source, and what this file needs from you",
               "ALIGN HCM  ·  INTERNAL USE")
ws4.column_dimensions["A"].width = 118
r = nxt + 1
SECTION_HEADS = {"Source & scope","One correction you should apply to the source workbook",
                 "Selection method","What the shortlist needs from you",
                 "Unblocking the other 421 engagements","Branded edition, 10 Aug 2026"}
lines = README_LINES[1:] + ["",
    "Branded edition, 10 Aug 2026",
    "This file restyles the 10 Aug shortlist with the Align HCM brand system: navy 0A1628, orange F05A28, cream FCFAF7, and the exact Align logo extracted from the shipped editorial PDF set. Story rows, values, and formulas are unchanged.",
    "Three columns were added on the right of the Top 30 tab: Website, HQ (CRM), and Employees (CRM). They were read from HubSpot portal 242825734 on 10 Aug 2026. Read-only: nothing was created, changed, or sent.",
    "Domain notes: the OhioHealth CRM record carries ohiohealthems.com, MTA NY carries mtany.org, and McCain Foods carries mccain.ca. The public primary domains are shown instead. Ace Parking's CRM record is a project entry (UKG Pro WFM Flip), so its HQ is left blank.",
    "An HTML twin of this file (same data, same brand, client logos rendered) ships alongside it: Align_HCM_Top30_Story_Shortlist_Branded.html.",
]
for text in lines:
    ws4.row_dimensions[r].height = 14
    if text == "":
        r += 1; continue
    cell = ws4.cell(row=r, column=1, value=text)
    if text == README_LINES[0]:
        pass
    elif text in SECTION_HEADS:
        cell.font = Font(name="Arial", size=11, bold=True, color=RUST)
        ws4.row_dimensions[r].height = 26
        cell.alignment = Alignment(vertical="bottom")
    else:
        cell.font = Font(name="Arial", size=9, color=BODY)
        cell.alignment = Alignment(wrap_text=True, vertical="top")
        est = max(1, (len(text) // 110) + (1 if len(text) % 110 else 0))
        ws4.row_dimensions[r].height = 13 * est + 4
    r += 1

wb.calculation.fullCalcOnLoad = True
ws.sheet_properties.tabColor = ORANGE
for _s in (ws2, ws3, ws4):
    _s.sheet_properties.tabColor = NAVY
wb.properties.title = "Align HCM · Top 30 Story Shortlist (Branded)"
wb.properties.creator = "Align HCM"
wb.properties.description = ("Branded edition of the 10 Aug 2026 Top 30 story shortlist. "
                             "Data unchanged; Website/HQ/Employees read from HubSpot portal 242825734.")
xlsx_path = os.path.join(OUT_DIR, "Align_HCM_Top30_Story_Shortlist_Branded.xlsx")
wb.save(xlsx_path)
print("wrote", xlsx_path)

# -- inject cached values for the 3 formula cells (no Calc engine in sandbox;
#    values are deterministic and Excel re-verifies via fullCalcOnLoad) --
import re, zipfile, shutil
total_v = sum(float(r[9]) for r in ROWS_30)
narr_v  = sum(1 for r in ROWS_30 if r[10] == "Yes")
quo_v   = sum(1 for r in ROWS_30 if r[11] == "Raven")
tot_row = tot
cached = {f"J{tot_row}": repr(total_v), f"K{tot_row}": str(narr_v), f"L{tot_row}": str(quo_v)}
tmp = xlsx_path + ".tmp"
with zipfile.ZipFile(xlsx_path) as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        data = zin.read(item.filename)
        if item.filename == "xl/worksheets/sheet1.xml":
            xml = data.decode()
            for ref, val in cached.items():
                pat = re.compile(r'(<c r="%s"[^>]*>)(<f>[^<]*</f>)' % ref)
                xml, n = pat.subn(lambda m: m.group(1) + m.group(2) + "<v>%s</v>" % val, xml)
                assert n == 1, f"cached-value injection failed for {ref}"
            data = xml.encode()
        zout.writestr(item, data)
shutil.move(tmp, xlsx_path)
import openpyxl as _op
chk = _op.load_workbook(xlsx_path, data_only=True)["Top 30 Shortlist"]
got = (chk[f"J{tot_row}"].value, chk[f"K{tot_row}"].value, chk[f"L{tot_row}"].value)
assert got == (total_v, narr_v, quo_v), f"cached readback mismatch: {got}"
print("cached values verified:", got)

# =============================================================== HTML build ==
b64 = base64.b64encode(open(LOGO, "rb").read()).decode()
money = lambda x: "${:,.0f}".format(float(x))
esc = html.escape
MAXV = max(float(r[9]) for r in ROWS_30)
TOTV = sum(float(r[9]) for r in ROWS_30)
inds = sorted({r[3] for r in ROWS_30})
narr = sum(1 for r in ROWS_30 if r[10] == "Yes")
quo  = sum(1 for r in ROWS_30 if r[11] == "Raven")

PLAT_CLASS = {"UKG Pro": "p-pro", "UKG Ready": "p-ready", "Dayforce": "p-day"}
def initials(name):
    parts = [w for w in name.replace("&"," ").split() if w and w[0].isalnum()]
    return (parts[0][0] + (parts[1][0] if len(parts) > 1 else "")).upper()

def logo_chip(client, dom, size=40):
    return (f'<span class="lg" style="--sz:{size}px"><img loading="lazy" '
            f'src="https://logo.clearbit.com/{dom}" alt="{esc(client)} logo" '
            f'onerror="this.parentElement.classList.add(\'fb\')">'
            f'<i>{initials(client)}</i></span>')

def needs_chip(txt):
    t = str(txt)
    cls = "ok" if t.startswith("Ready") else ("fresh" if t.startswith("Fresh") else "todo")
    return f'<span class="chip {cls}">{esc(t)}</span>'

def yn(val, yes_label="Yes"):
    if str(val) == yes_label:
        return f'<span class="mark y">{esc(str(val))}</span>'
    return f'<span class="mark n">{esc(str(val))}</span>'

rows_html = []
for row in ROWS_30:
    (rank, sid, client, ind, size, geo, plat, stype, yr, val, has_n, has_q,
     needs, owner, *_rest) = row
    dom, hq, emp = ENRICH[client]
    pct = max(2.5, round(float(val) / MAXV * 100, 1))
    crm_bits = " · ".join(x for x in (hq, ("{:,} emp".format(emp) if emp != "" else "")) if x)
    crm_line = f'<span class="crm">{esc(crm_bits)}</span>' if crm_bits else ""
    rows_html.append(f"""<tr data-plat="{esc(plat)}" data-q="{esc((client+' '+ind+' '+stype+' '+str(owner)+' '+hq).lower())}" data-rank="{rank}" data-value="{val}" data-client="{esc(client)}">
<td class="rk"><span class="rkb{' top' if int(rank)<=5 else ''}">{rank}</span></td>
<td class="cl">{logo_chip(client, dom)}<span class="cln"><b>{esc(client)}</b><a href="https://{dom}" target="_blank" rel="noopener">{dom}</a>{crm_line}</span></td>
<td>{esc(ind)}</td><td class="nw">{esc(str(size))}</td><td>{esc(str(geo))}</td>
<td><span class="plat {PLAT_CLASS.get(plat,'')}">{esc(plat)}</span></td>
<td>{esc(stype)}</td><td class="nw ctr">{yr}</td>
<td class="val"><span class="v">{money(val)}</span><span class="bar"><i style="width:{pct}%"></i></span></td>
<td class="ctr">{yn(has_n)}</td><td class="ctr">{yn(has_q, "Raven")}</td>
<td>{needs_chip(needs)}</td><td class="mut">{esc(str(owner))}</td>
</tr>""")

ref_html = []
for row in ROWS_REF:
    tier, client, ind, size, geo, eng, val, yr, _st, _own = row
    dom = ENRICH.get(client, ("", "", ""))[0]
    chip = logo_chip(client, dom, 34) if dom else f'<span class="lg fb" style="--sz:34px"><i>{initials(client)}</i></span>'
    a = str(tier).startswith("A")
    ref_html.append(f"""<tr>
<td><span class="tier {'a' if a else 'b'}">{esc(str(tier))}</span></td>
<td class="cl">{chip}<span class="cln"><b>{esc(client)}</b></span></td>
<td>{esc(str(ind))}</td><td class="nw">{esc(str(size))}</td><td>{esc(str(geo))}</td>
<td class="ctr">{eng}</td><td class="val"><span class="v">{money(val)}</span></td><td class="ctr">{yr}</td>
</tr>""")

# gaps: split into sections
gap_secs, cur = [], None
for line in GAP_LINES:
    a = str(line[0])
    if a.isupper() and line[1] == "":
        cur = {"title": a, "rows": []}; gap_secs.append(cur)
    elif a == "Value" or not cur:
        continue
    else:
        cur["rows"].append(line)
gaps_html = ""
for sec in gap_secs:
    trs = ""
    for a,b,c,d,flag in sec["rows"]:
        f = str(flag).strip()
        trs += (f'<tr class="{"flagged" if f else ""}"><td>{esc(str(a))}</td>'
                f'<td class="ctr">{b}</td><td class="ctr">{c}</td>'
                f'<td class="val"><span class="v">{money(d)}</span></td>'
                f'<td>{f"<span class=chipgap>{esc(f)}</span>" if f else ""}</td></tr>')
    gaps_html += f"""<div class="gapcard"><h3>{esc(sec["title"])}</h3>
<table><thead><tr><th>Value</th><th>Shortlist</th><th>Full book</th><th>Book value</th><th></th></tr></thead>
<tbody>{trs}</tbody></table></div>"""

method_items = "".join(
    f"<h3>{esc(t)}</h3>" if t in SECTION_HEADS else (f"<p>{esc(t)}</p>" if t else "")
    for t in README_LINES[1:])

page = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Align HCM · Top 30 Story Shortlist</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&family=Syne:wght@700;800&display=swap');
:root{{
  --navy:#0A1628; --navy-soft:#33506F; --steel:#1B4F72; --steel-t:#EDF3F8;
  --ink:#2D3748; --mut:#646E7C; --orange:#F05A28; --orange-b:#FF6B2B;
  --rust:#AD3D1B; --o-tint:#FDF1EA; --teal:#136E61; --teal-t:#E9F7F4;
  --paper:#FCFAF7; --panel:#F5F1EA; --hair:#E9E4DC; --blue-mut:#B9C6D8;
}}
*{{box-sizing:border-box;margin:0;padding:0}}
body{{font-family:'DM Sans',-apple-system,'Segoe UI',Arial,sans-serif;background:var(--paper);color:var(--ink);font-size:14px;line-height:1.5}}
.wrap{{max-width:1280px;margin:0 auto;padding:0 28px}}
/* ---------- masthead ---------- */
header{{background:var(--navy);color:#fff;position:relative;overflow:hidden}}
header::before{{content:"";position:absolute;width:520px;height:520px;right:-160px;top:-260px;border-radius:50%;
  background:radial-gradient(circle,rgba(240,90,40,.38),transparent 62%);filter:blur(120px)}}
header::after{{content:"";position:absolute;width:420px;height:420px;left:-180px;bottom:-300px;border-radius:50%;
  background:radial-gradient(circle,rgba(27,79,114,.5),transparent 60%);filter:blur(110px)}}
.mast{{position:relative;z-index:1;padding:44px 0 0}}
.mtop{{display:flex;justify-content:space-between;align-items:flex-start;gap:24px;flex-wrap:wrap}}
.mlogo{{width:min(320px,60vw);height:auto;display:block}}
.kick{{font-size:11px;letter-spacing:.22em;font-weight:700;color:var(--orange-b);text-transform:uppercase;text-align:right;line-height:2}}
.kick span{{display:block;color:var(--blue-mut);letter-spacing:.18em}}
h1{{font-family:'Syne','DM Sans',sans-serif;font-weight:800;font-size:clamp(30px,4.6vw,52px);line-height:1.06;margin:34px 0 10px;letter-spacing:-.01em}}
h1 em{{font-style:normal;position:relative;white-space:nowrap}}
h1 em::after{{content:"";position:absolute;left:0;right:0;bottom:2px;height:5px;border-radius:3px;
  background:linear-gradient(135deg,#F05A28 0%,#FF6B35 100%);transform-origin:left;animation:uline .6s .3s both}}
@keyframes uline{{from{{transform:scaleX(0)}}to{{transform:scaleX(1)}}}}
.sub{{color:var(--blue-mut);font-size:15px;max-width:860px}}
.stats{{position:relative;z-index:1;display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin:30px 0 0;padding-bottom:38px}}
.stat{{background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.12);border-radius:14px;
  padding:14px 16px;backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px)}}
.stat b{{display:block;font-family:'Syne',sans-serif;font-size:24px;font-weight:800;color:#fff}}
.stat span{{font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--blue-mut)}}
.stat.hot b{{color:var(--orange-b)}}
.rule{{height:4px;background:linear-gradient(135deg,#F05A28 0%,#FF6B35 55%,#0A1628 100%)}}
/* ---------- sections ---------- */
section{{padding:34px 0 8px}}
.shead{{display:flex;align-items:baseline;gap:14px;flex-wrap:wrap;margin-bottom:6px}}
h2{{font-family:'Syne',sans-serif;font-weight:800;font-size:22px;color:var(--navy)}}
.shead small{{color:var(--mut);font-size:12.5px}}
.snote{{font-size:12px;color:var(--rust);background:var(--o-tint);border:1px solid #F3D9C9;border-radius:8px;padding:7px 12px;margin:10px 0 14px;display:inline-block}}
/* ---------- controls ---------- */
.controls{{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:14px 0}}
.controls input{{font:inherit;font-size:13px;padding:8px 14px;border:1px solid var(--hair);border-radius:999px;background:#fff;min-width:240px;color:var(--ink)}}
.controls input:focus{{outline:2px solid var(--orange);border-color:transparent}}
.fbtn{{font:inherit;font-size:12px;font-weight:700;padding:7px 14px;border-radius:999px;border:1px solid var(--hair);background:#fff;color:var(--mut);cursor:pointer}}
.fbtn.on{{background:var(--navy);color:#fff;border-color:var(--navy)}}
.fbtn.sort.on{{background:var(--orange);border-color:var(--orange)}}
/* ---------- table ---------- */
.tblwrap{{overflow-x:auto;border:1px solid var(--hair);border-radius:16px;background:#fff;box-shadow:0 1px 2px rgba(10,22,40,.04)}}
table{{border-collapse:collapse;width:100%;min-width:1080px}}
thead th{{position:sticky;top:0;background:var(--navy);color:#fff;font-size:10px;letter-spacing:.07em;text-transform:uppercase;
  text-align:left;padding:10px 8px;white-space:nowrap;border-bottom:2px solid var(--orange);z-index:2}}
tbody td{{padding:8px 8px;border-bottom:1px solid var(--hair);vertical-align:middle;font-size:12.5px}}
tbody tr:nth-child(even){{background:var(--panel)}}
tbody tr:hover{{background:var(--o-tint)}}
tbody tr:last-child td{{border-bottom:none}}
.rk{{width:44px}} .rkb{{display:inline-flex;align-items:center;justify-content:center;width:27px;height:27px;border-radius:50%;
  background:var(--steel-t);color:var(--steel);font-weight:700;font-size:12.5px}}
.rkb.top{{background:linear-gradient(135deg,#F05A28,#FF6B35);color:#fff}}
.cl{{display:flex;align-items:center;gap:10px;min-width:215px}}
.cln{{display:flex;flex-direction:column;line-height:1.25}}
.cln b{{color:var(--navy);font-size:13.5px}}
.cln a{{color:var(--mut);font-size:11px;text-decoration:none}}
.cln a:hover{{color:var(--orange)}}
.cln .crm{{color:#98A0AC;font-size:10.5px}}
.tnote{{font-size:11px;color:var(--mut);margin:8px 2px 0}}
.lg{{--sz:40px;width:var(--sz);height:var(--sz);flex:0 0 var(--sz);border-radius:10px;background:#fff;border:1px solid var(--hair);
  display:inline-flex;align-items:center;justify-content:center;overflow:hidden}}
.lg img{{max-width:calc(var(--sz) - 9px);max-height:calc(var(--sz) - 9px);object-fit:contain}}
.lg i{{display:none;font-style:normal;font-weight:700;font-size:calc(var(--sz)*.34);color:var(--navy)}}
.lg.fb{{background:var(--panel);border-color:#DCD5C9}}
.lg.fb img{{display:none}} .lg.fb i{{display:block}}
.plat{{font-size:11px;font-weight:700;padding:3px 9px;border-radius:999px;white-space:nowrap}}
.p-pro{{background:var(--steel-t);color:var(--steel)}} .p-ready{{background:var(--teal-t);color:var(--teal)}}
.p-day{{background:var(--o-tint);color:var(--rust)}}
.val{{min-width:130px}} .val .v{{display:block;font-weight:700;color:var(--navy);font-variant-numeric:tabular-nums;text-align:right}}
.bar{{display:block;height:3px;background:var(--hair);border-radius:2px;margin-top:4px;overflow:hidden}}
.bar i{{display:block;height:100%;background:linear-gradient(135deg,#F05A28,#FF6B35);border-radius:2px}}
.mark{{font-weight:700;font-size:12px}} .mark.y{{color:var(--teal)}} .mark.n{{color:#B7BDC7}}
.chip{{font-size:10.5px;font-weight:600;padding:3px 8px;border-radius:999px;white-space:nowrap}}
.chip.ok{{background:var(--teal-t);color:var(--teal)}} .chip.fresh{{background:var(--steel-t);color:var(--steel)}}
.chip.todo{{background:var(--o-tint);color:var(--rust)}}
.mut{{color:var(--mut)}} .nw{{white-space:nowrap}} .ctr{{text-align:center}}
tfoot td{{background:#F4EFE7;font-weight:700;color:var(--navy);padding:11px 10px;border-top:2px solid var(--orange);font-size:13px}}
/* ---------- reference + gaps ---------- */
.tier{{font-size:11px;font-weight:700;padding:3px 10px;border-radius:999px;white-space:nowrap}}
.tier.a{{background:var(--teal-t);color:var(--teal)}} .tier.b{{background:var(--steel-t);color:var(--steel)}}
.gaps{{display:grid;grid-template-columns:repeat(auto-fit,minmax(470px,1fr));gap:16px}}
.gapcard{{background:#fff;border:1px solid var(--hair);border-radius:16px;padding:16px 18px;overflow-x:auto}}
.gapcard h3{{font-size:12px;letter-spacing:.16em;color:var(--rust);margin-bottom:8px}}
.gapcard table{{min-width:0;width:100%}}
.gapcard thead th{{position:static;background:transparent;color:var(--mut);border-bottom:1px solid var(--hair);font-size:10px;padding:6px}}
.gapcard td{{font-size:12px;padding:5px 6px}}
.gapcard td:first-child{{max-width:150px}}
.gapcard tr.flagged{{background:var(--o-tint)}}
.chipgap{{font-size:10.5px;font-weight:700;color:#fff;background:var(--orange);padding:2px 8px;border-radius:999px;white-space:nowrap}}
/* ---------- method / footer ---------- */
.method{{background:#fff;border:1px solid var(--hair);border-radius:16px;padding:24px 28px;column-gap:44px}}
.method h3{{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--rust);margin:16px 0 6px}}
.method h3:first-child{{margin-top:0}}
.method p{{font-size:13px;color:var(--ink);margin:6px 0;max-width:1000px}}
footer{{background:var(--navy);color:var(--blue-mut);margin-top:44px;position:relative;overflow:hidden}}
footer::before{{content:"";position:absolute;width:380px;height:380px;right:-120px;bottom:-260px;border-radius:50%;
  background:radial-gradient(circle,rgba(240,90,40,.3),transparent 60%);filter:blur(100px)}}
.fin{{position:relative;display:flex;justify-content:space-between;align-items:center;gap:20px;padding:30px 0;flex-wrap:wrap}}
.fin img{{width:180px;height:auto}}
.fin p{{font-size:11.5px;line-height:1.7;text-align:right}}
.fin a{{color:var(--orange-b);text-decoration:none}}
@media print{{
  .controls{{display:none}}
  header::before,header::after,footer::before{{display:none}}
  body{{font-size:11px}}
  .tblwrap{{overflow:visible;border-radius:0}}
  table{{min-width:0}}
  thead th{{position:static}}
  section{{padding:16px 0 4px;break-inside:avoid-page}}
}}
</style></head><body>
<header><div class="wrap mast">
  <div class="mtop">
    <img class="mlogo" src="data:image/png;base64,{b64}" alt="Align HCM. Human Capital Management.">
    <div class="kick">Internal use · Unpublished<span>Prepared 10 Aug 2026 · Source: Client Story Database v8 + HubSpot 242825734</span></div>
  </div>
  <h1>Top 30 <em>Story Shortlist</em></h1>
  <p class="sub">Recommendation for Objective 1. Selected from 453 readable story rows with values restated to true USD. One story per client, max 4 per industry, max 7 per size band, $50k minimum, and Dayforce plus UKG Ready represented. Full method notes sit at the bottom of this page.</p>
  <div class="stats">
    <div class="stat hot"><b>{money(TOTV)}</b><span>True USD, 30 stories</span></div>
    <div class="stat"><b>30</b><span>Clients · 1 story each</span></div>
    <div class="stat"><b>{narr} of 30</b><span>Narratives drafted</span></div>
    <div class="stat"><b>{quo} of 30</b><span>Raven quotes</span></div>
    <div class="stat"><b>{len(inds)}</b><span>Industries</span></div>
    <div class="stat"><b>3</b><span>Platforms</span></div>
  </div>
</div><div class="rule"></div></header>

<div class="wrap">
<section>
  <div class="shead"><h2>The shortlist</h2><small>Ranked by 45% deal value (log-scaled, true USD) + 30% recency + 25% narrative readiness</small></div>
  <div class="snote">{esc(str(EDIT_NOTE))} Editable columns live in the workbook twin; this page is the read view.</div>
  <div class="controls">
    <input id="q" type="search" placeholder="Search client, industry, story type, owner…" aria-label="Search">
    <button class="fbtn on" data-plat="">All platforms</button>
    <button class="fbtn" data-plat="UKG Pro">UKG Pro</button>
    <button class="fbtn" data-plat="UKG Ready">UKG Ready</button>
    <button class="fbtn" data-plat="Dayforce">Dayforce</button>
    <button class="fbtn sort" id="sortBtn" data-mode="rank">Sort: Rank</button>
  </div>
  <div class="tblwrap"><table id="t30">
    <thead><tr><th>#</th><th>Client · HQ · Emp (CRM)</th><th>Industry</th><th>Size (HC)</th><th>Geo</th><th>Platform</th><th>Story type</th><th>Start</th><th>Value (true USD)</th><th>Narrative</th><th>Quote</th><th>What it still needs</th><th>CRM deal owner</th></tr></thead>
    <tbody>{''.join(rows_html)}</tbody>
    <tfoot><tr><td colspan="8">TOTAL · 30 stories</td><td style="text-align:right">{money(TOTV)}</td><td style="text-align:center">{narr}</td><td style="text-align:center">{quo}</td><td colspan="2"></td></tr></tfoot>
  </table></div>
  <p class="tnote">Client marks load from each company's public domain via logo.clearbit.com at view time; monogram tiles show when offline. HQ and employee figures were read from HubSpot on 10 Aug 2026.</p>
</section>

<section>
  <div class="shead"><h2>Reference candidates</h2><small>Objective 2 · ranked by how close each client already is to being usable · Tier A is Raven + recent</small></div>
  <div class="tblwrap"><table>
    <thead><tr><th>Tier</th><th>Client</th><th>Industry</th><th>Size (HC)</th><th>Geo</th><th>Engagements</th><th>Value (true USD)</th><th>Latest yr</th></tr></thead>
    <tbody>{''.join(ref_html)}</tbody>
  </table></div>
</section>

<section>
  <div class="shead"><h2>Representation gaps</h2><small>Objective 4 · shortlist coverage vs the whole book · flags mark unrepresented dimensions</small></div>
  <div class="gaps">{gaps_html}</div>
</section>

<section>
  <div class="shead"><h2>How this was built</h2><small>Verbatim from the shortlist build notes</small></div>
  <div class="method">{method_items}
  <h3>Branded edition, 10 Aug 2026</h3>
  <p>This page is the HTML twin of Align_HCM_Top30_Story_Shortlist_Branded.xlsx. Story data is unchanged from the 10 Aug build. Website, HQ, and employee counts were read from HubSpot portal 242825734 on 10 Aug 2026, read-only. Client logos render from each company's public domain via logo.clearbit.com with a monogram fallback, so no logo files are redistributed with this document. Brand colors, type, and the Align logo follow the shipped Align editorial system.</p>
  </div>
</section>
</div>

<footer><div class="wrap fin">
  <img src="data:image/png;base64,{b64}" alt="Align HCM">
  <p>Align HCM · SmartCare · UKG implementation and support<br>
  <a href="https://www.alignhcm.com">alignhcm.com</a> · Internal use, unpublished · Prepared 10 Aug 2026</p>
</div></footer>

<script>
(function(){{
  const q=document.getElementById('q'),tb=document.querySelector('#t30 tbody');
  const rows=[...tb.rows];let plat='';
  function apply(){{
    const s=(q.value||'').toLowerCase().trim();
    rows.forEach(r=>{{
      const okQ=!s||r.dataset.q.includes(s);
      const okP=!plat||r.dataset.plat===plat;
      r.style.display=okQ&&okP?'':'none';
    }});
  }}
  q.addEventListener('input',apply);
  document.querySelectorAll('.fbtn[data-plat]').forEach(b=>b.addEventListener('click',()=>{{
    document.querySelectorAll('.fbtn[data-plat]').forEach(x=>x.classList.remove('on'));
    b.classList.add('on');plat=b.dataset.plat;apply();
  }}));
  const sb=document.getElementById('sortBtn');
  const modes=[['rank','Sort: Rank'],['value','Sort: Value'],['client','Sort: Client A→Z']];let mi=0;
  sb.addEventListener('click',()=>{{
    mi=(mi+1)%modes.length;const m=modes[mi][0];sb.textContent=modes[mi][1];sb.classList.add('on');
    rows.sort((a,b)=>m==='rank'?a.dataset.rank-b.dataset.rank
      :m==='value'?b.dataset.value-a.dataset.value
      :a.dataset.client.localeCompare(b.dataset.client));
    rows.forEach(r=>tb.appendChild(r));
  }});
}})();
</script>
</body></html>"""

html_path = os.path.join(OUT_DIR, "Align_HCM_Top30_Story_Shortlist_Branded.html")
open(html_path, "w").write(page)
print("wrote", html_path, len(page), "bytes")
print(json.dumps({"total": TOTV, "narratives": narr, "quotes": quo, "industries": len(inds)}))
