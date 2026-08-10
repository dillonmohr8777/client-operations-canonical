#!/usr/bin/env python3
"""Align HCM · Top 30 Command Deck — dark interactive dashboard, single HTML file.

Data: source shortlist workbook (verbatim) + HubSpot portal 242825734 reads
(10 Aug 2026, read-only): per-client deal rollups, won/open splits, engagement
years, portal pulse, owner roster. Brand: shipped Align token set; categorical
palette validated for the dark surface (#F05A28 #4E86C8 #1FA98C #BA841A).
"""
import base64, json, os, html
import openpyxl

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = "/root/.claude/uploads/9e045f79-a3fe-5e0b-b800-e5900182d04c/fc733806-Align_HCM_Top30_Story_Shortlist.xlsx"
LOGO = os.path.join(HERE, "logos/align-hcm-logo-reverse.png")
OUT = os.path.join(HERE, "build/Align_HCM_Top30_Command_Deck.html")
STAMP = "10 Aug 2026 · 21:40 UTC"
PORTAL = "242825734"
HS_BASE = f"https://app-na2.hubspot.com/contacts/{PORTAL}/company/"

# ---------------------------------------------------------------- source data
wb = openpyxl.load_workbook(SRC, data_only=True)
s30, sref, sgap, srm = (wb[n] for n in ("Top 30 Shortlist","Reference Candidates","Representation Gaps","Read Me"))
def v(ws,r,c):
    x = ws.cell(row=r,column=c).value
    return "" if x is None else x

STORIES = []
for r in range(6,36):
    STORIES.append(dict(
        rank=int(v(s30,r,1)), sid=v(s30,r,2), client=v(s30,r,3), industry=v(s30,r,4),
        size=str(v(s30,r,5)), geo=v(s30,r,6), platform=v(s30,r,7), stype=v(s30,r,8),
        yr=int(v(s30,r,9)), value=round(float(v(s30,r,10))), narr=v(s30,r,11),
        quote=v(s30,r,12), needs=v(s30,r,13), owner=v(s30,r,14)))
REFS = []
for r in range(5, sref.max_row+1):
    if v(sref,r,2):
        REFS.append(dict(tier=v(sref,r,1), client=v(sref,r,2), industry=v(sref,r,3),
            size=str(v(sref,r,4)), geo=v(sref,r,5), eng=int(v(sref,r,6)),
            value=round(float(v(sref,r,7))), yr=int(v(sref,r,8))))
GAPS, cur = [], None
for r in range(3, sgap.max_row+1):
    a = str(v(sgap,r,1))
    if not any(str(v(sgap,r,c)) != "" for c in range(1,6)): continue
    if a.isupper() and v(sgap,r,2) == "":
        cur = dict(dim=a, rows=[]); GAPS.append(cur)
    elif a == "Value" or cur is None:
        continue
    else:
        cur["rows"].append([a, int(v(sgap,r,2)), int(v(sgap,r,3)), round(float(v(sgap,r,4))), str(v(sgap,r,5)).strip()])

# client -> (public domain for logos/links, CRM rollup domain key, HQ, employees)
ENRICH = {
 "Leyad": ("leyad.ca","leyad.ca","Ontario, Canada",300),
 "GES": ("ges.com","ges.com","Las Vegas, NV",""),
 "Curtin Maritime": ("curtinmaritime.com","curtinmaritime.com","",500),
 "EverQuote": ("everquote.com","everquote.com","",350),
 "BURNCO": ("burnco.com","burnco.com","Calgary, AB",1500),
 "OhioHealth": ("ohiohealth.com","ohiohealthems.com","Columbus, OH",30000),
 "McLeod Software": ("mcleodsoftware.com","mcleodsoftware.com","Birmingham, AL",700),
 "PrimeFlight": ("primeflight.com","primeflight.com","Sugar Land, TX",9400),
 "Vacasa": ("vacasa.com","vacasa.com","Portland, OR",6800),
 "MW Components": ("mwcomponents.com","mwcomponents.com","Charlotte, NC",2100),
 "Distributor Wire & Cable": ("distributorwireandcable.com","distributorwireandcable.com","",""),
 "Bethany Christian Services": ("bethany.org","bethany.org","",""),
 "TriState Health": ("tsh.org","tsh.org","Clarkson, WA",""),
 "KW Property Management": ("kwpmc.com","kwpmc.com","Miami, FL",2700),
 "Troon": ("troon.com","troon.com","Scottsdale, AZ",30000),
 "JACAM Catalyst": ("jacamcatalyst.com",None,"Sterling, KS",""),
 "Chautauqua Institution": ("chq.org","chq.org","",1400),
 "Excelsior University": ("excelsior.edu","excelsior.edu","Albany, NY",""),
 "Eagle Materials": ("eaglematerials.com","eaglematerials.com","Dallas, TX",2657),
 "MTA NY": ("mta.info","mtany.org","",70000),
 "Grand River Health": ("grandriverhealth.org","grandriverhealth.org","Rifle, CO",850),
 "Bayshore HealthCare": ("bayshore.ca","bayshore.ca","Etobicoke, ON",3500),
 "Rollins": ("rollins.com","rollins.com","Atlanta, GA",13000),
 "Driscoll's": ("driscolls.com","driscolls.com","Watsonville, CA",6200),
 "Trimac Transportation": ("trimac.com","trimac.com","Calgary, AB",""),
 "Coastal Community Credit Union": ("cccu.ca","cccu.ca","",""),
 "REI": ("rei.com","rei.com","",""),
 "UBE": ("ube.com","ube.com","",""),
 "Ace Parking": ("aceparking.com",None,"",5000),
 "McCain Foods": ("mccain.com","mccain.ca","Ontario, Canada",20000),
}

# ------------------------------------------------ HubSpot reads (10 Aug 2026)
ROLLUP_TSV = """bayshore.ca|bayshore healthcare|123711651550|4|555511.41
bethany.org|bethany christian services|123255253734|5|186095
burnco.com|burnco rock products ltd.|123183723207|13|567352.88
cccu.ca|coastal community credit union|314030019312|1|213815.30
chq.org|chautauqua institution|123255253744|5|126875
curtinmaritime.com|curtin maritime, corp.|217755393775|2|168000
distributorwireandcable.com|distributor wire & cable|123181851364|1|54000
driscolls.com|driscoll's inc|123181851369|22|1274698.01
eaglematerials.com|eagle materials inc.|123155562231|20|741000
everquote.com|everquote|123180069576|3|119425
excelsior.edu|excelsior university|123185434320|2|79000
ges.com|ges|123155562214|4|279500
grandriverhealth.org|grand river health|123255253725|5|426650
kwpmc.com|kw property management & consulting|123713450713|3|230500
leyad.ca|leyad|326104277736|2|76112.14
mccain.ca|mccain foods|231724321469|1|83426.60
mcleodsoftware.com|mcleod software|123672827600|1|96875
mtany.org|mta ny|123152084691|4|5296000
mwcomponents.com|mw components|123150291674|4|290550
ohiohealthems.com|ohiohealth corporation|320024648395|4|2932695
primeflight.com|primeflight aviation services, inc.|123181851383|14|1984250
rei.com|recreational equipment inc.|271741020870|4|990950
rollins.com|rollins, inc.|123713450709|4|52750
trimac.com|trimac transportation|123726965453|3|475656.52
troon.com|troon golf, llc|123155562216|14|564500
tsh.org|tristate health|123227122411|1|142950
ube.com|ube corporation americas inc|219952394992|2|229900
vacasa.com|vacasa llc|123181851374|2|360000"""

WONOPEN_TSV = """bayshore.ca|false|1|97221.82;bayshore.ca|true|3|458289.59;bethany.org|false|1|18000;bethany.org|true|4|168095;burnco.com|false|1|3294.41;burnco.com|true|12|564058.46;cccu.ca|true|1|213815.30;chq.org|false|1|11000;chq.org|true|4|115875;curtinmaritime.com|false|1|84000;curtinmaritime.com|true|1|84000;distributorwireandcable.com|true|1|54000;driscolls.com|false|4|345970;driscolls.com|true|18|928728.01;eaglematerials.com|false|1|10000;eaglematerials.com|true|19|731000;everquote.com|false|2|40625;everquote.com|true|1|78800;excelsior.edu|true|2|79000;ges.com|false|2|134000;ges.com|true|2|145500;grandriverhealth.org|true|5|426650;kwpmc.com|false|1|52500;kwpmc.com|true|2|178000;leyad.ca|true|2|76112.14;mccain.ca|true|1|83426.60;mcleodsoftware.com|true|1|96875;mtany.org|false|1|4000000;mtany.org|true|3|1296000;mwcomponents.com|false|2|35000;mwcomponents.com|true|2|255550;ohiohealthems.com|true|4|2932695;primeflight.com|false|3|566400;primeflight.com|true|11|1417850;rei.com|false|2|611000;rei.com|true|2|379950;rollins.com|true|4|52750;trimac.com|true|3|475656.52;troon.com|false|4|115000;troon.com|true|10|449500;tsh.org|true|1|142950;ube.com|false|1|73600;ube.com|true|1|156300;vacasa.com|false|1|120000;vacasa.com|true|1|240000"""

YEARS_TSV = """2024|bayshore.ca|4|555511;2024|bethany.org|1|153495;2025|bethany.org|2|13000;2026|bethany.org|2|19600;2024|burnco.com|2|111294;2025|burnco.com|8|193225;2026|burnco.com|3|262833;2026|cccu.ca|1|213815;2024|chq.org|1|78375;2025|chq.org|2|19500;2026|chq.org|2|29000;2025|curtinmaritime.com|1|84000;2026|curtinmaritime.com|1|84000;2025|distributorwireandcable.com|1|54000;2019|driscolls.com|1|8053;2020|driscolls.com|4|75500;2021|driscolls.com|5|158935;2022|driscolls.com|1|72000;2023|driscolls.com|4|505050;2024|driscolls.com|2|70000;2025|driscolls.com|3|325160;2026|driscolls.com|2|60000;2022|eaglematerials.com|1|120000;2023|eaglematerials.com|4|140000;2024|eaglematerials.com|9|278000;2025|eaglematerials.com|5|163000;2026|eaglematerials.com|1|40000;2025|everquote.com|1|78800;2026|everquote.com|2|40625;2024|excelsior.edu|1|75000;2025|excelsior.edu|1|4000;2024|ges.com|2|134000;2025|ges.com|1|143000;2026|ges.com|1|2500;2025|grandriverhealth.org|1|317700;2026|grandriverhealth.org|4|108950;2024|kwpmc.com|1|138000;2025|kwpmc.com|2|92500;2026|leyad.ca|2|76112;2026|mccain.ca|1|83427;2025|mcleodsoftware.com|1|96875;2024|mtany.org|1|432000;2025|mtany.org|2|4432000;2026|mtany.org|1|432000;2023|mwcomponents.com|1|35000;2024|mwcomponents.com|1|231550;2025|mwcomponents.com|1|24000;2026|mwcomponents.com|1|0;2024|ohiohealthems.com|2|2165175;2025|ohiohealthems.com|1|460020;2026|ohiohealthems.com|1|307500;2022|primeflight.com|1|6400;2023|primeflight.com|2|1090360;2024|primeflight.com|5|296490;2025|primeflight.com|4|31000;2026|primeflight.com|2|560000;2026|rei.com|4|990950;2022|rollins.com|1|46500;2025|rollins.com|3|6250;2026|trimac.com|3|475657;2023|troon.com|3|290000;2024|troon.com|4|137000;2025|troon.com|6|137500;2026|troon.com|1|0;2024|tsh.org|1|142950;2026|ube.com|2|229900;2024|vacasa.com|1|240000;2025|vacasa.com|1|120000"""

PULSE = [
  dict(name="UKG Sales Pipeline", won_n=755, won=53681656, open_n=711, open=100086750),
  dict(name="Dayforce Sales Pipeline", won_n=4, won=584487, open_n=44, open=14421746),
  dict(name="Paylocity Sales Pipeline", won_n=0, won=0, open_n=3, open=660000),
]
OWNERS_ACTIVE = {"Mike Emsley": True, "Maher El-Abdallah": True, "Dianna Hammond": True,
                 "Michael Lederman": True, "Miranda Sarwan": False}

roll = {}
for line in ROLLUP_TSV.strip().splitlines():
    d, nm, oid, n, amt = line.split("|")
    roll[d] = dict(crm_name=nm, crm_id=oid, deals=int(n), lifetime=round(float(amt)))
wonopen = {}
for part in WONOPEN_TSV.split(";"):
    d, w, n, amt = part.split("|")
    e = wonopen.setdefault(d, dict(won_n=0, won=0, open_n=0, open=0))
    if w == "true": e["won_n"] += int(n); e["won"] += round(float(amt))
    else: e["open_n"] += int(n); e["open"] += round(float(amt))
years = {}
for part in YEARS_TSV.split(";"):
    y, d, n, amt = part.split("|")
    years.setdefault(d, {})[int(y)] = [int(n), round(float(amt))]

for s in STORIES:
    pub, crm_dom, hq, emp = ENRICH[s["client"]]
    s.update(domain=pub, hq=hq, emp=emp, ownerActive=OWNERS_ACTIVE.get(s["owner"]),
             hs=None)
    if crm_dom and crm_dom in roll:
        r = roll[crm_dom]; wo = wonopen.get(crm_dom, {})
        s["hs"] = dict(crm_name=r["crm_name"], crm_id=r["crm_id"], deals=r["deals"],
                       lifetime=r["lifetime"], won=wo.get("won",0), won_n=wo.get("won_n",0),
                       open=wo.get("open",0), open_n=wo.get("open_n",0),
                       years=years.get(crm_dom, {}))
for rr in REFS:
    e = ENRICH.get(rr["client"]); rr["domain"] = e[0] if e else None

DATA = dict(stories=STORIES, refs=REFS, gaps=GAPS, pulse=PULSE, stamp=STAMP,
            portal=PORTAL, hsbase=HS_BASE)
b64 = base64.b64encode(open(LOGO,"rb").read()).decode()

HTML = r"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Align HCM · Top 30 Command Deck</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&family=Syne:wght@700;800&display=swap');
:root{
  --bg:#071120; --surface:#0A1628; --panel:#0E1E33;
  --line:rgba(255,255,255,.09); --line2:rgba(255,255,255,.16);
  --ink:#E9EEF6; --ink2:#9FB1C7; --ink3:#64778F;
  --orange:#F05A28; --orange-b:#FF6B2B; --steel:#4E86C8; --teal:#1FA98C; --gold:#BA841A;
  --crit:#E5484D; --grad:linear-gradient(135deg,#F05A28 0%,#FF6B35 100%);
}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:'DM Sans',-apple-system,'Segoe UI',Arial,sans-serif;background:var(--bg);color:var(--ink);
  font-size:14px;line-height:1.5;min-height:100vh}
body::before,body::after{content:"";position:fixed;border-radius:50%;pointer-events:none;z-index:0}
body::before{width:640px;height:640px;right:-200px;top:-320px;background:radial-gradient(circle,rgba(240,90,40,.22),transparent 62%);filter:blur(120px)}
body::after{width:560px;height:560px;left:-240px;bottom:-320px;background:radial-gradient(circle,rgba(27,79,114,.38),transparent 60%);filter:blur(110px)}
.wrap{max-width:1340px;margin:0 auto;padding:0 26px;position:relative;z-index:1}
a{color:var(--orange-b)}
/* ---------------- top bar ---------------- */
header{position:sticky;top:0;z-index:50;background:rgba(7,17,32,.82);backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);border-bottom:1px solid var(--line)}
.bar{display:flex;align-items:center;gap:22px;padding:14px 0;flex-wrap:wrap}
.bar img.logo{width:185px;height:auto;display:block}
nav{display:flex;gap:4px;flex-wrap:wrap}
nav button{font:inherit;font-size:12.5px;font-weight:700;letter-spacing:.04em;color:var(--ink2);
  background:transparent;border:1px solid transparent;border-radius:999px;padding:7px 15px;cursor:pointer}
nav button:hover{color:var(--ink);border-color:var(--line2)}
nav button.on{color:#fff;background:var(--grad);box-shadow:0 4px 18px rgba(240,90,40,.35)}
.bar .sp{flex:1}
.stampbox{text-align:right;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink3);line-height:1.7}
.stampbox b{color:var(--teal);letter-spacing:.14em}
#q{font:inherit;font-size:13px;color:var(--ink);background:var(--panel);border:1px solid var(--line2);
  border-radius:999px;padding:8px 16px;min-width:180px}
#q:focus{outline:2px solid var(--orange)}
/* ---------------- layout ---------------- */
.view{display:none;padding:30px 0 60px}
.view.on{display:block}
h1{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(26px,3.4vw,40px);letter-spacing:-.01em;line-height:1.08}
h1 em{font-style:normal;position:relative;white-space:nowrap}
h1 em::after{content:"";position:absolute;left:0;right:0;bottom:1px;height:5px;border-radius:3px;background:var(--grad);
  transform-origin:left;animation:uline .6s .25s both}
@keyframes uline{from{transform:scaleX(0)}to{transform:scaleX(1)}}
h2{font-family:'Syne',sans-serif;font-weight:800;font-size:19px;margin-bottom:4px}
.sub{color:var(--ink2);font-size:13.5px;max-width:900px}
.shead{display:flex;align-items:baseline;gap:14px;margin:26px 0 12px;flex-wrap:wrap}
.shead small{color:var(--ink3);font-size:12px}
.panel{background:linear-gradient(180deg,rgba(255,255,255,.028),rgba(255,255,255,0) 60%),var(--panel);
  border:1px solid var(--line);border-radius:18px;padding:18px 20px;box-shadow:0 10px 30px rgba(0,0,0,.25)}
/* ---------------- KPI tiles ---------------- */
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(168px,1fr));gap:12px;margin-top:18px}
.kpi{background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,.01)),var(--panel);
  border:1px solid var(--line2);border-left:3px solid var(--orange);border-radius:14px;padding:14px 16px;
  backdrop-filter:blur(20px)}
.kpi b{display:block;font-family:'Syne',sans-serif;font-size:25px;font-weight:800;color:#fff;font-variant-numeric:tabular-nums}
.kpi span{font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:var(--ink2)}
.kpi.hot b{background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}
.kpi.live{border-left-color:var(--teal)}
.kpi.warn{border-left-color:var(--gold)}
.livechip{display:inline-flex;align-items:center;gap:6px;font-size:10px;font-weight:700;letter-spacing:.13em;color:var(--teal)}
.livechip::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--teal);box-shadow:0 0 10px var(--teal);animation:pulse 2s infinite}
@keyframes pulse{50%{opacity:.35}}
/* ---------------- constellation ---------------- */
.deck{display:grid;grid-template-columns:minmax(430px,1.15fr) 1fr;gap:20px;align-items:stretch;margin-top:20px}
@media (max-width:1020px){.deck{grid-template-columns:1fr}}
.orbitbox{position:relative;overflow:hidden;min-height:660px;display:flex;align-items:center;justify-content:center}
.orbit{position:relative;width:600px;height:600px;flex:0 0 auto;transform-origin:center}
@media (max-width:1240px){.orbit{transform:scale(.86)}}
@media (max-width:560px){.orbit{transform:scale(.6)}}
.ringpath{position:absolute;inset:0;border:1px dashed rgba(255,255,255,.10);border-radius:50%}
.ring{position:absolute;inset:0;animation:spin var(--dur) linear infinite}
.ring .node{animation:counterspin var(--dur) linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes counterspin{from{transform:translate(-50%,-50%) rotate(0)}to{transform:translate(-50%,-50%) rotate(-360deg)}}
.orbit:hover .ring,.orbit:hover .ring .node{animation-play-state:paused}
@media (prefers-reduced-motion:reduce){.ring,.ring .node{animation:none}}
.node{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:var(--s);height:var(--s);
  border-radius:12px;background:#fff;border:1.5px solid rgba(255,255,255,.65);display:flex;align-items:center;justify-content:center;
  cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.45)}
.node img{max-width:78%;max-height:72%;object-fit:contain}
.node i{display:none;font-style:normal;font-weight:800;font-family:'Syne',sans-serif;color:#0A1628;font-size:calc(var(--s)*.33)}
.node.fb img{display:none}.node.fb i{display:block}
.node:hover{outline:3px solid var(--orange);z-index:5}
.core{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;z-index:2;pointer-events:none}
.core img{width:138px;height:auto;filter:drop-shadow(0 0 24px rgba(240,90,40,.45))}
.core b{display:block;font-family:'Syne',sans-serif;font-size:30px;font-weight:800;margin-top:6px}
.core span{font-size:9.5px;letter-spacing:.22em;color:var(--ink2);text-transform:uppercase}
.ringlab{position:absolute;left:50%;transform:translateX(-50%);font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:var(--ink3);background:var(--bg);padding:0 8px;z-index:3}
.legendrow{display:flex;gap:16px;flex-wrap:wrap;margin-top:10px;font-size:11px;color:var(--ink2)}
.legendrow .sw{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:6px;vertical-align:-1px}
/* ---------------- charts ---------------- */
.chart{margin-top:8px}
.brow{display:grid;grid-template-columns:190px 1fr 88px;align-items:center;gap:10px;padding:5px 0}
.brow .lab{font-size:12px;color:var(--ink2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:right}
.brow .val{font-size:12px;font-weight:700;font-variant-numeric:tabular-nums;color:var(--ink)}
.track{height:16px;border-radius:5px;background:rgba(255,255,255,.05);position:relative;overflow:visible}
.fill{position:absolute;top:2px;bottom:2px;left:0;border-radius:4px;min-width:2px}
.fill.o{background:var(--orange)} .fill.s{background:var(--steel)} .fill.t{background:var(--teal)} .fill.g{background:var(--gold)}
.duo .track{height:22px}
.duo .fill.a{top:2px;height:8px}
.duo .fill.b{top:12px;height:8px}
.heat{display:grid;gap:3px;margin-top:6px}
.heatrow{display:grid;grid-template-columns:170px repeat(8,1fr) 80px;gap:3px;align-items:center}
.heatrow .hl{font-size:11.5px;color:var(--ink2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:right;padding-right:6px}
.cell{height:20px;border-radius:5px;background:rgba(255,255,255,.045);cursor:default}
.heathead{font-size:10px;color:var(--ink3);text-align:center;letter-spacing:.08em}
.heattot{font-size:11px;font-weight:700;color:var(--ink2);text-align:right;font-variant-numeric:tabular-nums}
#tip{position:fixed;z-index:99;background:#050D1A;border:1px solid var(--line2);border-radius:10px;padding:9px 12px;
  font-size:12px;color:var(--ink);pointer-events:none;display:none;max-width:280px;box-shadow:0 8px 26px rgba(0,0,0,.5)}
#tip b{color:#fff}#tip .m{color:var(--ink2)}
/* ---------------- stories ---------------- */
.controls{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:14px 0 18px}
.fbtn{font:inherit;font-size:12px;font-weight:700;padding:7px 14px;border-radius:999px;border:1px solid var(--line2);
  background:transparent;color:var(--ink2);cursor:pointer}
.fbtn.on{background:#fff;color:#0A1628;border-color:#fff}
.fbtn.orange.on{background:var(--grad);color:#fff;border-color:transparent}
select.fbtn{appearance:none;padding-right:26px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:14px}
.card{background:linear-gradient(180deg,rgba(255,255,255,.03),rgba(255,255,255,0)),var(--panel);
  border:1px solid var(--line);border-radius:16px;padding:16px;cursor:pointer;position:relative;transition:transform .15s,border-color .15s}
.card:hover{transform:translateY(-3px);border-color:rgba(240,90,40,.6)}
.card .top{display:flex;gap:12px;align-items:center;padding-right:48px}
.lg{--sz:46px;width:var(--sz);height:var(--sz);flex:0 0 var(--sz);border-radius:12px;background:#fff;
  display:flex;align-items:center;justify-content:center;overflow:hidden;border:1px solid rgba(255,255,255,.35)}
.lg img{max-width:80%;max-height:74%;object-fit:contain}
.lg i{display:none;font-style:normal;font-weight:800;font-family:'Syne',sans-serif;color:#0A1628;font-size:calc(var(--sz)*.34)}
.lg.fb img{display:none}.lg.fb i{display:block}
.card h3{font-size:15.5px;color:#fff;line-height:1.2}
.card .sid{font-size:10.5px;color:var(--ink3);letter-spacing:.08em}
.card .rank{position:absolute;top:12px;right:12px;font-family:'Syne',sans-serif;font-weight:800;font-size:13px;
  color:var(--steel);background:rgba(78,134,200,.14);border-radius:999px;padding:3px 10px}
.card .rank.top{color:#fff;background:var(--grad)}
.card .money{font-family:'Syne',sans-serif;font-weight:800;font-size:23px;margin:10px 0 2px;font-variant-numeric:tabular-nums}
.mline{font-size:11.5px;color:var(--ink2);margin-bottom:9px}
.chips{display:flex;gap:6px;flex-wrap:wrap}
.chip{font-size:10.5px;font-weight:700;padding:3px 9px;border-radius:999px;white-space:nowrap}
.c-pro{background:rgba(78,134,200,.16);color:#9CC0EA}.c-ready{background:rgba(31,169,140,.16);color:#5BD6BC}
.c-day{background:rgba(240,90,40,.16);color:#FF9E6E}
.c-ok{background:rgba(31,169,140,.16);color:#5BD6BC}.c-todo{background:rgba(240,90,40,.14);color:#FF9E6E}
.c-fresh{background:rgba(78,134,200,.16);color:#9CC0EA}.c-warn{background:rgba(186,132,26,.2);color:#E8B95C}
.c-crit{background:rgba(229,72,77,.16);color:#F58A8E}
.hsrow{margin-top:11px;padding-top:10px;border-top:1px dashed var(--line);display:flex;gap:14px;font-size:11px;color:var(--ink2);flex-wrap:wrap}
.hsrow b{color:var(--ink);font-variant-numeric:tabular-nums}
.hsrow .open b{color:var(--orange-b)}
/* ---------------- drawer ---------------- */
#ov{position:fixed;inset:0;background:rgba(3,8,16,.6);backdrop-filter:blur(3px);z-index:80;display:none}
#drawer{position:fixed;top:0;right:-560px;width:min(560px,94vw);height:100vh;background:var(--surface);
  border-left:1px solid var(--line2);z-index:90;transition:right .25s ease;overflow-y:auto;padding:26px}
#drawer.on{right:0}
#drawer .close{position:absolute;top:16px;right:18px;font:inherit;background:transparent;color:var(--ink2);border:1px solid var(--line2);
  border-radius:999px;width:32px;height:32px;cursor:pointer}
.dhead{display:flex;gap:14px;align-items:center;margin-bottom:6px}
.dgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:16px 0}
.dcell{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:10px 12px}
.dcell span{display:block;font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink3)}
.dcell b{font-size:14px;color:var(--ink)}
.hslink{display:inline-block;margin:8px 0;font-size:12.5px;font-weight:700;text-decoration:none;color:#fff;
  background:var(--grad);border-radius:999px;padding:8px 16px}
.ministrip{display:flex;gap:4px;margin-top:8px}
.ministrip .yc{flex:1;text-align:center}
.ministrip .yb{height:34px;border-radius:5px;background:rgba(255,255,255,.05);position:relative;overflow:hidden}
.ministrip .yb i{position:absolute;left:0;right:0;bottom:0;background:var(--orange)}
.ministrip span{font-size:9px;color:var(--ink3)}
.checkrow{display:flex;align-items:center;gap:10px;background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:10px 12px;margin-top:8px}
.checkrow input{width:17px;height:17px;accent-color:#F05A28}
#drawer textarea{width:100%;min-height:70px;background:var(--panel);border:1px solid var(--line2);border-radius:12px;
  color:var(--ink);font:inherit;font-size:12.5px;padding:10px;margin-top:8px}
/* ---------------- ops ---------------- */
.alert{display:flex;gap:14px;align-items:flex-start;background:linear-gradient(90deg,rgba(229,72,77,.14),rgba(229,72,77,.03));
  border:1px solid rgba(229,72,77,.4);border-left:4px solid var(--crit);border-radius:14px;padding:14px 18px;margin:16px 0}
.alert .ic{font-size:18px;line-height:1}
.alert b{color:#F58A8E}
.owners{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px}
.ocard .oh{display:flex;align-items:center;gap:12px;margin-bottom:10px}
.avatar{width:40px;height:40px;border-radius:50%;background:var(--grad);display:flex;align-items:center;justify-content:center;
  font-family:'Syne',sans-serif;font-weight:800;color:#fff;font-size:14px}
.avatar.gray{background:linear-gradient(135deg,#39445A,#22304a)}
.ocard h3{font-size:14.5px}
.ocard .ost{font-size:10.5px;color:var(--ink3)}
.olist{display:flex;flex-direction:column;gap:6px}
.oitem{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--ink2);background:rgba(255,255,255,.03);
  border:1px solid var(--line);border-radius:10px;padding:7px 10px}
.oitem b{color:var(--ink);font-weight:700}
.oitem .sp{flex:1}
.copybtn{font:inherit;font-size:11px;font-weight:700;color:var(--ink);background:transparent;border:1px solid var(--line2);
  border-radius:999px;padding:6px 13px;cursor:pointer;margin-top:10px}
.copybtn:hover{border-color:var(--orange);color:var(--orange-b)}
.meter{height:12px;border-radius:6px;background:rgba(255,255,255,.06);overflow:hidden;margin-top:8px}
.meter i{display:block;height:100%;background:var(--grad);border-radius:6px;transition:width .3s}
/* ---------------- coverage / bench ---------------- */
.covgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(470px,1fr));gap:14px}
@media (max-width:560px){.covgrid{grid-template-columns:1fr}}
.gaprow{display:grid;grid-template-columns:150px 1fr 64px 92px;gap:10px;align-items:center;padding:4px 0;font-size:12px}
.gaprow .lab{color:var(--ink2);text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gaprow .n{color:var(--ink3);font-variant-numeric:tabular-nums}
table.bench{width:100%;border-collapse:collapse}
table.bench th{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink3);text-align:left;padding:9px 10px;border-bottom:1px solid var(--line2)}
table.bench td{padding:9px 10px;border-bottom:1px solid var(--line);font-size:12.5px;color:var(--ink2)}
table.bench td b{color:var(--ink)}
table.bench tr:hover td{background:rgba(255,255,255,.025)}
.tier{font-size:10.5px;font-weight:700;padding:3px 10px;border-radius:999px;white-space:nowrap}
.tier.a{background:rgba(31,169,140,.16);color:#5BD6BC}.tier.b{background:rgba(78,134,200,.16);color:#9CC0EA}
.foot{border-top:1px solid var(--line);margin-top:30px;padding:26px 0 40px;display:flex;gap:18px;align-items:center;justify-content:space-between;flex-wrap:wrap}
.foot img{width:150px}
.foot p{font-size:11px;color:var(--ink3);text-align:right;line-height:1.7}
@media print{header,nav,#q,.controls,.copybtn{display:none}.view{display:block!important;padding:12px 0}body::before,body::after{display:none}}
</style></head><body data-palette="#F05A28,#4E86C8,#1FA98C,#BA841A">
<div id="tip"></div>
<header><div class="wrap bar">
  <img class="logo" src="data:image/png;base64,@@LOGO@@" alt="Align HCM. Human Capital Management.">
  <nav id="nav">
    <button data-v="overview" class="on">Command Deck</button>
    <button data-v="stories">Stories</button>
    <button data-v="pipeline">Pipeline · Live</button>
    <button data-v="ops">Validation Ops</button>
    <button data-v="coverage">Coverage</button>
    <button data-v="bench">Bench</button>
  </nav>
  <div class="sp"></div>
  <input id="q" type="search" placeholder="Search the book…  ( / )">
  <div class="stampbox"><span class="livechip">HubSpot @@PORTAL@@</span><br>Read @@STAMP@@ · read-only</div>
</div></header>

<div class="wrap">

<!-- ================= OVERVIEW ================= -->
<section class="view on" id="v-overview">
  <h1>Top 30 <em>Command Deck</em></h1>
  <p class="sub">One deck for the story shortlist and the live book behind it. Story data is the 10 Aug build; every deal figure on this page was read from HubSpot portal @@PORTAL@@ on @@STAMP@@, read-only. Client marks load from each company's public domain.</p>
  <div class="kpis" id="kpis"></div>
  <div class="deck">
    <div class="panel orbitbox">
      <div class="orbit" id="orbit"></div>
    </div>
    <div>
      <div class="panel">
        <h2>Highest-value stories</h2>
        <small style="color:var(--ink3)">Story true USD · single measure, brand orange</small>
        <div class="chart" id="topbars"></div>
      </div>
      <div class="panel" style="margin-top:14px">
        <h2>Readiness</h2>
        <div class="chart" id="ready"></div>
        <div class="legendrow" id="readylegend"></div>
      </div>
    </div>
  </div>
</section>

<!-- ================= STORIES ================= -->
<section class="view" id="v-stories">
  <h1>The <em>thirty</em></h1>
  <p class="sub">Click any card for the full record: story status, CRM footprint, engagement history, validation checklist. Filters stack with the global search.</p>
  <div class="controls" id="storyfilters">
    <button class="fbtn orange on" data-f="plat" data-val="">All platforms</button>
    <button class="fbtn orange" data-f="plat" data-val="UKG Pro">UKG Pro</button>
    <button class="fbtn orange" data-f="plat" data-val="UKG Ready">UKG Ready</button>
    <button class="fbtn orange" data-f="plat" data-val="Dayforce">Dayforce</button>
    <span style="width:10px"></span>
    <button class="fbtn" data-f="ready" data-val="">Any status</button>
    <button class="fbtn" data-f="ready" data-val="ready">Ready</button>
    <button class="fbtn" data-f="ready" data-val="fresh">Fresh quote</button>
    <button class="fbtn" data-f="ready" data-val="todo">Needs narrative</button>
    <span style="width:10px"></span>
    <select class="fbtn" id="sortsel">
      <option value="rank">Sort · Rank</option>
      <option value="value">Sort · Story value</option>
      <option value="open">Sort · Open pipeline</option>
      <option value="lifetime">Sort · CRM lifetime</option>
      <option value="client">Sort · Client A to Z</option>
    </select>
    <button class="fbtn" id="csv">⬇ CSV</button>
  </div>
  <div class="grid" id="cards"></div>
</section>

<!-- ================= PIPELINE ================= -->
<section class="view" id="v-pipeline">
  <h1>Live <em>pipeline</em></h1>
  <p class="sub">The CRM truth behind the shortlist. 28 of 30 clients matched to HubSpot company records by domain; JACAM Catalyst and Ace Parking have no domain on their CRM records, so they carry story data only.</p>
  <div class="kpis" id="pulse"></div>
  <div class="shead"><h2>Won vs open, per shortlist client</h2><small>Two series · won in steel, open in orange · hover for exact figures</small></div>
  <div class="panel">
    <div class="legendrow"><span><span class="sw" style="background:var(--steel)"></span>Closed won, lifetime</span><span><span class="sw" style="background:var(--orange)"></span>Open pipeline now</span></div>
    <div class="chart duo" id="wonopen"></div>
  </div>
  <div class="shead"><h2>Engagement history, 2019 to 2026</h2><small>Deals closed per client per year · shade is closed value, sequential orange · hover any cell</small></div>
  <div class="panel"><div class="heat" id="heat"></div></div>
</section>

<!-- ================= OPS ================= -->
<section class="view" id="v-ops">
  <h1>Validation <em>ops</em></h1>
  <p class="sub">Reference Status, Validator, and Validation Notes are blank on all 453 source rows. This board turns the 30 into owner-sized ask lists. Checklist state saves in this browser only.</p>
  <div class="alert" id="opsalert"></div>
  <div class="panel" style="margin:0 0 16px">
    <b id="progresslab" style="font-family:Syne;font-size:16px"></b>
    <div class="meter"><i id="progressbar" style="width:0%"></i></div>
  </div>
  <div class="owners" id="owners"></div>
</section>

<!-- ================= COVERAGE ================= -->
<section class="view" id="v-coverage">
  <h1>Coverage <em>radar</em></h1>
  <p class="sub">Shortlist coverage against the whole 453-row book, by dimension. Bars are book value; the count chip is how many shortlist stories cover that slice. Flags mark unrepresented dimensions.</p>
  <div class="covgrid" id="cov"></div>
</section>

<!-- ================= BENCH ================= -->
<section class="view" id="v-bench">
  <h1>Reference <em>bench</em></h1>
  <p class="sub">Objective 2. Ranked by how close each client already is to usable: Tier A is Raven plus recent, Tier B is Raven but older. Cross-checked against live CRM lifetime value.</p>
  <div class="panel" style="overflow-x:auto"><table class="bench" id="bench"></table></div>
</section>

<div class="foot">
  <img src="data:image/png;base64,@@LOGO@@" alt="Align HCM">
  <p>Align HCM · SmartCare · UKG implementation and support · Internal use, unpublished<br>
  Story data: 10 Aug 2026 shortlist build · CRM reads: HubSpot portal @@PORTAL@@, @@STAMP@@, read-only · Client marks load from public domains at view time</p>
</div>
</div>

<div id="ov"></div>
<aside id="drawer" aria-label="Story detail"></aside>

<script>
const DATA = @@DATA@@;
const HSB = DATA.hsbase;
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const fmt = n => "$" + Math.round(n).toLocaleString("en-US");
const fmtM = n => n >= 1e6 ? "$" + (n/1e6).toFixed(2) + "M" : n >= 1e3 ? "$" + Math.round(n/1e3) + "k" : fmt(n);
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const initials = n => n.replace(/&/g," ").split(/\s+/).filter(w=>/[A-Za-z0-9]/.test(w[0])).slice(0,2).map(w=>w[0]).join("").toUpperCase();
const readiness = s => s.needs.startsWith("Ready") ? "ready" : s.needs.startsWith("Fresh") ? "fresh" : "todo";
const READY_LABEL = {ready:"Ready · spot-check", fresh:"Needs fresh quote", todo:"Needs narrative + quote"};
const READY_COLOR = {ready:"var(--teal)", fresh:"var(--steel)", todo:"var(--orange)"};
const PLATC = {"UKG Pro":"c-pro","UKG Ready":"c-ready","Dayforce":"c-day"};
const logoChip = (s, sz, cls="lg") =>
  `<span class="${cls}" style="--sz:${sz}px"><img loading="lazy" src="https://logo.clearbit.com/${s.domain}" alt="" onerror="this.parentElement.classList.add('fb')"><i>${initials(s.client)}</i></span>`;

/* ---------- tooltip ---------- */
const tip = $("#tip");
function bindTips(root){
  root.querySelectorAll("[data-tip]").forEach(el=>{
    el.addEventListener("mousemove", e=>{
      tip.innerHTML = el.dataset.tip; tip.style.display = "block";
      const w = tip.offsetWidth, x = Math.min(e.clientX+14, innerWidth-w-10);
      tip.style.left = x+"px"; tip.style.top = (e.clientY+16)+"px";
    });
    el.addEventListener("mouseleave", ()=> tip.style.display="none");
  });
}

/* ---------- nav ---------- */
function show(v){
  $$("nav button").forEach(b=>b.classList.toggle("on", b.dataset.v===v));
  $$(".view").forEach(s=>s.classList.toggle("on", s.id==="v-"+v));
  location.hash = v; window.scrollTo({top:0});
}
$("#nav").addEventListener("click", e=>{ if(e.target.dataset.v) show(e.target.dataset.v); });
addEventListener("keydown", e=>{
  if(e.key==="/" && document.activeElement!==$("#q")){ e.preventDefault(); $("#q").focus(); }
  if(e.key==="Escape") closeDrawer();
});

/* ---------- KPIs ---------- */
const S = DATA.stories;
const bookVal = S.reduce((a,s)=>a+s.value,0);
const withHS = S.filter(s=>s.hs);
const openTot = withHS.reduce((a,s)=>a+s.hs.open,0), openN = withHS.reduce((a,s)=>a+s.hs.open_n,0);
const wonTot = withHS.reduce((a,s)=>a+s.hs.won,0), dealTot = withHS.reduce((a,s)=>a+s.hs.deals,0);
const inactive = S.filter(s=>s.ownerActive===false);
$("#kpis").innerHTML = `
  <div class="kpi hot"><b>${fmtM(bookVal)}</b><span>Story book · true USD</span></div>
  <div class="kpi"><b>30</b><span>Stories · one per client</span></div>
  <div class="kpi"><b>${S.filter(s=>s.narr==="Yes").length}<span style="font-size:14px;color:var(--ink3)"> /30</span></b><span>Narratives drafted</span></div>
  <div class="kpi"><b>${S.filter(s=>s.quote==="Raven").length}<span style="font-size:14px;color:var(--ink3)"> /30</span></b><span>Raven quotes</span></div>
  <div class="kpi live"><b>${fmtM(wonTot)}</b><span>Lifetime won · these 30 <span class="livechip"></span></span></div>
  <div class="kpi live"><b>${fmtM(openTot)}</b><span>Open pipeline now · ${openN} deals</span></div>
  <div class="kpi warn"><b>${inactive.length}</b><span>Stories on an inactive owner</span></div>`;

/* ---------- constellation ---------- */
(function(){
  const rings = {ready:{r:152,dur:"90s",ph:11}, fresh:{r:206,dur:"115s",ph:45}, todo:{r:258,dur:"145s",ph:18}};
  const C = 300;
  const groups = {ready:[],fresh:[],todo:[]};
  S.forEach(s=>groups[readiness(s)].push(s));
  const vmax = Math.max(...S.map(s=>s.value));
  let htmlStr = `<div class="core"><img src="data:image/png;base64,@@LOGO@@" alt=""><b>${fmtM(bookVal)}</b><span>30 stories · 3 rings by readiness</span></div>`;
  for(const key of ["ready","fresh","todo"]){
    const {r,dur,ph} = rings[key];
    htmlStr += `<div class="ringpath" style="inset:${C-r}px"></div>`;
    htmlStr += `<div class="ringlab" style="top:${C-r-8}px">${READY_LABEL[key]} · ${groups[key].length}</div>`;
    htmlStr += `<div class="ring" style="--dur:${dur}">`;
    groups[key].forEach((s,i)=>{
      const ang = (i/groups[key].length)*2*Math.PI - Math.PI/2 + ph*Math.PI/180;
      const sz = Math.round(28 + 24*Math.sqrt(s.value/vmax));
      const x = C + r*Math.cos(ang), y = C + r*Math.sin(ang);
      htmlStr += `<div class="node" data-client="${esc(s.client)}" data-tip="<b>${esc(s.client)}</b><br>${fmt(s.value)} · ${READY_LABEL[key]}<br><span class=m>#${s.rank} · ${esc(s.platform)} · click for detail</span>" style="--s:${sz}px;left:${x}px;top:${y}px;border-color:${READY_COLOR[key]}">
        <img loading="lazy" src="https://logo.clearbit.com/${s.domain}" alt="" onerror="this.parentElement.classList.add('fb')"><i>${initials(s.client)}</i></div>`;
    });
    htmlStr += `</div>`;
  }
  $("#orbit").innerHTML = htmlStr;
  $("#orbit").addEventListener("click", e=>{
    const n = e.target.closest(".node"); if(n) openDrawer(n.dataset.client);
  });
  bindTips($("#orbit"));
})();

/* ---------- top bars (single measure) ---------- */
(function(){
  const top = [...S].sort((a,b)=>b.value-a.value).slice(0,8);
  const max = top[0].value;
  $("#topbars").innerHTML = top.map(s=>`
    <div class="brow" data-tip="<b>${esc(s.client)}</b><br>${fmt(s.value)} story value · #${s.rank}">
      <span class="lab">${esc(s.client)}</span>
      <span class="track"><span class="fill o" style="width:${Math.max(2,100*s.value/max)}%"></span></span>
      <span class="val">${fmtM(s.value)}</span>
    </div>`).join("");
  bindTips($("#topbars"));
})();

/* ---------- readiness meter ---------- */
(function(){
  const g = {ready:0,fresh:0,todo:0}; S.forEach(s=>g[readiness(s)]++);
  const rows = [["ready","Ready · spot-check only",g.ready,"t"],["fresh","Needs a fresh quote",g.fresh,"s"],["todo","Needs narrative + quote",g.todo,"o"]];
  $("#ready").innerHTML = rows.map(([k,lab,n,cls])=>`
    <div class="brow" data-tip="<b>${lab}</b><br>${n} of 30 stories">
      <span class="lab">${lab}</span>
      <span class="track"><span class="fill ${cls}" style="width:${100*n/30}%"></span></span>
      <span class="val">${n} <span style="color:var(--ink3)">/ 30</span></span>
    </div>`).join("");
  $("#readylegend").innerHTML = `<span><span class="sw" style="background:var(--teal)"></span>Ready</span>
    <span><span class="sw" style="background:var(--steel)"></span>Fresh quote</span>
    <span><span class="sw" style="background:var(--orange)"></span>Narrative + quote</span>`;
  bindTips($("#ready"));
})();

/* ---------- stories grid ---------- */
const filters = {plat:"", ready:"", q:""};
function cardHTML(s){
  const r = readiness(s);
  const ownerBit = s.ownerActive===false
    ? `<span class="chip c-crit" data-tip="<b>${esc(s.owner)}</b> is inactive in HubSpot.<br>Reassign before validation outreach.">⚠ ${esc(s.owner)}</span>`
    : `<span class="chip" style="background:rgba(255,255,255,.06);color:var(--ink2)">${esc(s.owner)}</span>`;
  const hs = s.hs ? `<div class="hsrow">
      <span data-tip="Closed-won lifetime across ${s.hs.deals} CRM deals">Won <b>${fmtM(s.hs.won)}</b></span>
      <span class="open" data-tip="Open pipeline right now (${s.hs.open_n} deals)">Open <b>${s.hs.open? fmtM(s.hs.open):"·"}</b></span>
      <span data-tip="All deals on the company record">Deals <b>${s.hs.deals}</b></span>
      <span style="margin-left:auto"><span class="livechip">LIVE</span></span></div>`
    : `<div class="hsrow"><span style="color:var(--ink3)">No CRM domain link · story data only</span></div>`;
  return `<article class="card" data-client="${esc(s.client)}" data-plat="${esc(s.platform)}" data-ready="${r}"
    data-q="${esc((s.client+" "+s.industry+" "+s.stype+" "+s.owner+" "+s.geo).toLowerCase())}">
    <span class="rank ${s.rank<=5?"top":""}">#${s.rank}</span>
    <div class="top">${logoChip(s,46)}<div><h3>${esc(s.client)}</h3><div class="sid">${esc(s.sid)} · ${esc(s.domain)}</div></div></div>
    <div class="money">${fmt(s.value)}</div>
    <div class="mline">${esc(s.industry)} · ${esc(s.size)} HC · ${esc(s.geo)}${s.hq? " · HQ "+esc(s.hq):""}</div>
    <div class="chips">
      <span class="chip ${PLATC[s.platform]||""}">${esc(s.platform)}</span>
      <span class="chip" style="background:rgba(255,255,255,.06);color:var(--ink2)">${esc(s.stype)}</span>
      <span class="chip ${r==="ready"?"c-ok":r==="fresh"?"c-fresh":"c-todo"}">${READY_LABEL[r]}</span>
      ${ownerBit}
    </div>${hs}</article>`;
}
function renderCards(){
  let list = S.filter(s=>
    (!filters.plat || s.platform===filters.plat) &&
    (!filters.ready || readiness(s)===filters.ready) &&
    (!filters.q || (s.client+" "+s.industry+" "+s.stype+" "+s.owner+" "+s.geo).toLowerCase().includes(filters.q)));
  const m = $("#sortsel").value;
  list.sort((a,b)=> m==="rank"? a.rank-b.rank : m==="value"? b.value-a.value :
    m==="open"? (b.hs?b.hs.open:0)-(a.hs?a.hs.open:0) : m==="lifetime"? (b.hs?b.hs.lifetime:0)-(a.hs?a.hs.lifetime:0) :
    a.client.localeCompare(b.client));
  $("#cards").innerHTML = list.map(cardHTML).join("") || `<p style="color:var(--ink3)">Nothing matches. Clear a filter.</p>`;
  bindTips($("#cards"));
}
$("#storyfilters").addEventListener("click", e=>{
  const b = e.target.closest("[data-f]"); if(!b) return;
  filters[b.dataset.f] = b.dataset.val;
  $$(`#storyfilters [data-f="${b.dataset.f}"]`).forEach(x=>x.classList.toggle("on", x===b));
  renderCards();
});
$("#sortsel").addEventListener("change", renderCards);
$("#cards").addEventListener("click", e=>{
  const c = e.target.closest(".card"); if(c && !e.target.closest("[data-tip]")) openDrawer(c.dataset.client);
  else if(c && e.target.closest(".card")) openDrawer(c.dataset.client);
});
$("#q").addEventListener("input", e=>{ filters.q = e.target.value.toLowerCase().trim(); renderCards();
  if(!$("#v-stories").classList.contains("on") && filters.q) show("stories"); });
$("#csv").addEventListener("click", ()=>{
  const head = "rank,story_id,client,industry,size_hc,geo,platform,story_type,start_yr,story_value_usd,narrative,quote,needs,crm_owner,owner_active,domain,hq,employees_crm,crm_deals,crm_won_usd,crm_open_usd,crm_company_id";
  const rows = S.map(s=>[s.rank,s.sid,`"${s.client}"`,`"${s.industry}"`,`"${s.size}"`,s.geo,`"${s.platform}"`,`"${s.stype}"`,s.yr,s.value,s.narr,s.quote,`"${s.needs}"`,`"${s.owner}"`,s.ownerActive===false?"INACTIVE":"active",s.domain,`"${s.hq||""}"`,s.emp||"",s.hs?s.hs.deals:"",s.hs?s.hs.won:"",s.hs?s.hs.open:"",s.hs?s.hs.crm_id:""].join(","));
  const blob = new Blob([head+"\n"+rows.join("\n")], {type:"text/csv"});
  const a = Object.assign(document.createElement("a"), {href:URL.createObjectURL(blob), download:"align_top30_command_deck.csv"});
  a.click(); URL.revokeObjectURL(a.href);
});

/* ---------- drawer ---------- */
const store = {
  get k(){ return "align-top30-validation"; },
  read(){ try{ return JSON.parse(localStorage.getItem(this.k))||{} }catch(e){ return {} } },
  write(o){ localStorage.setItem(this.k, JSON.stringify(o)); }
};
function openDrawer(client){
  const s = S.find(x=>x.client===client); if(!s) return;
  const r = readiness(s), st = store.read()[s.sid]||{};
  const yrs = s.hs? s.hs.years : null;
  let strip = "";
  if(yrs){
    const ys = []; for(let y=2019;y<=2026;y++) ys.push([y, yrs[y]||null]);
    const ymax = Math.max(1,...ys.map(([,v])=>v?v[1]:0));
    strip = `<div class="ministrip">`+ys.map(([y,vv])=>`
      <div class="yc"><div class="yb" data-tip="${vv? `<b>${y}</b><br>${vv[0]} deal${vv[0]>1?"s":""} · ${fmt(vv[1])}` : `<b>${y}</b><br>No closed deals`}">
        ${vv? `<i style="height:${Math.max(8,100*vv[1]/ymax)}%"></i>`:""}</div><span>${String(y).slice(2)}</span></div>`).join("")+`</div>`;
  }
  $("#drawer").innerHTML = `
    <button class="close" aria-label="Close">✕</button>
    <div class="dhead">${logoChip(s,54)}<div>
      <h2 style="font-size:21px">${esc(s.client)}</h2>
      <div class="sid" style="color:var(--ink3);font-size:11px">#${s.rank} · ${esc(s.sid)} · <a href="https://${s.domain}" target="_blank" rel="noopener">${s.domain}</a></div>
    </div></div>
    <div class="chips" style="margin:8px 0 2px">
      <span class="chip ${PLATC[s.platform]||""}">${esc(s.platform)}</span>
      <span class="chip" style="background:rgba(255,255,255,.06);color:var(--ink2)">${esc(s.stype)}</span>
      <span class="chip ${r==="ready"?"c-ok":r==="fresh"?"c-fresh":"c-todo"}">${READY_LABEL[r]}</span>
    </div>
    <div class="dgrid">
      <div class="dcell"><span>Story value · true USD</span><b style="font-family:Syne;font-size:19px">${fmt(s.value)}</b></div>
      <div class="dcell"><span>Start year</span><b>${s.yr}</b></div>
      <div class="dcell"><span>Industry</span><b>${esc(s.industry)}</b></div>
      <div class="dcell"><span>Size · Geo</span><b>${esc(s.size)} · ${esc(s.geo)}</b></div>
      <div class="dcell"><span>Narrative</span><b style="color:${s.narr==="Yes"?"var(--teal)":"var(--orange-b)"}">${esc(s.narr)}</b></div>
      <div class="dcell"><span>Quote</span><b style="color:${s.quote==="Raven"?"var(--teal)":"var(--orange-b)"}">${esc(s.quote)}</b></div>
      <div class="dcell"><span>CRM deal owner</span><b>${esc(s.owner)}${s.ownerActive===false?' <span class="chip c-crit">inactive</span>':""}</b></div>
      <div class="dcell"><span>What it still needs</span><b>${esc(s.needs)}</b></div>
      ${s.hq?`<div class="dcell"><span>HQ (CRM)</span><b>${esc(s.hq)}</b></div>`:""}
      ${s.emp?`<div class="dcell"><span>Employees (CRM)</span><b>${Number(s.emp).toLocaleString()}</b></div>`:""}
    </div>
    ${s.hs? `<h2 style="font-size:15px;margin-top:6px">HubSpot record <span class="livechip" style="margin-left:6px">LIVE @@STAMP@@</span></h2>
      <div class="dgrid">
        <div class="dcell"><span>CRM company</span><b>${esc(s.hs.crm_name)}</b></div>
        <div class="dcell"><span>Deals on record</span><b>${s.hs.deals}</b></div>
        <div class="dcell"><span>Closed won · lifetime</span><b style="color:var(--teal)">${fmt(s.hs.won)} · ${s.hs.won_n}</b></div>
        <div class="dcell"><span>Open pipeline now</span><b style="color:var(--orange-b)">${s.hs.open? fmt(s.hs.open):"None"}${s.hs.open_n? " · "+s.hs.open_n:""}</b></div>
      </div>
      ${strip}
      <a class="hslink" href="${HSB}${s.hs.crm_id}" target="_blank" rel="noopener">Open in HubSpot ↗</a>`
    : `<p style="color:var(--ink3);font-size:12.5px;margin:10px 0">No CRM company record matched by domain. Story data only.</p>`}
    <h2 style="font-size:15px;margin-top:14px">Validation checklist <span style="font-size:10px;color:var(--ink3)">saved in this browser</span></h2>
    ${["Narrative approved","Quote sourced","Reference status set","Client cleared for public naming"].map((lab,i)=>`
      <label class="checkrow"><input type="checkbox" data-ck="${i}" ${st["c"+i]?"checked":""}> ${lab}</label>`).join("")}
    <textarea placeholder="Validation notes for ${esc(s.client)}…" data-note>${esc(st.note||"")}</textarea>`;
  $("#drawer").classList.add("on"); $("#ov").style.display="block";
  $("#drawer .close").onclick = closeDrawer; $("#ov").onclick = closeDrawer;
  $$("#drawer [data-ck]").forEach(cb=>cb.addEventListener("change", ()=>{
    const o = store.read(); o[s.sid] = o[s.sid]||{}; o[s.sid]["c"+cb.dataset.ck] = cb.checked; store.write(o); renderOps();
  }));
  $("#drawer [data-note]").addEventListener("input", e=>{
    const o = store.read(); o[s.sid] = o[s.sid]||{}; o[s.sid].note = e.target.value; store.write(o);
  });
  bindTips($("#drawer"));
}
function closeDrawer(){ $("#drawer").classList.remove("on"); $("#ov").style.display="none"; }

/* ---------- pipeline view ---------- */
(function(){
  const p = DATA.pulse;
  const totW = p.reduce((a,x)=>a+x.won,0), totO = p.reduce((a,x)=>a+x.open,0);
  $("#pulse").innerHTML = `
    <div class="kpi live"><b>${fmtM(totW)}</b><span>Portal closed won · all time</span></div>
    <div class="kpi"><b>${fmtM(totO)}</b><span>Portal open pipeline</span></div>` +
    p.map(x=>`<div class="kpi" style="border-left-color:var(--steel)"><b>${fmtM(x.won+x.open)}</b>
      <span>${esc(x.name)} · ${x.won_n} won / ${x.open_n} open</span></div>`).join("");
  const rows = withHS.map(s=>({s, won:s.hs.won, open:s.hs.open})).sort((a,b)=>(b.won+b.open)-(a.won+a.open));
  const max = Math.max(...rows.map(r=>Math.max(r.won,r.open)));
  $("#wonopen").innerHTML = rows.map(({s,won,open})=>`
    <div class="brow" data-tip="<b>${esc(s.client)}</b><br>Won lifetime: ${fmt(won)} (${s.hs.won_n})<br>Open now: ${open?fmt(open):"none"} ${s.hs.open_n?"("+s.hs.open_n+")":""}">
      <span class="lab">${esc(s.client)}</span>
      <span class="track"><span class="fill s a" style="width:${Math.max(1.5,100*won/max)}%"></span><span class="fill o b" style="width:${open?Math.max(1.5,100*open/max):0}%"></span></span>
      <span class="val">${fmtM(won+open)}</span>
    </div>`).join("");
  const ymax = Math.max(...withHS.flatMap(s=>Object.values(s.hs.years).map(v=>v[1])));
  const shade = v => v<=0? "rgba(240,90,40,.10)" : `rgba(240,90,40,${(.16+.84*Math.sqrt(v/ymax)).toFixed(2)})`;
  let h = `<div class="heatrow"><span class="hl"></span>${[2019,2020,2021,2022,2023,2024,2025,2026].map(y=>`<span class="heathead">${y}</span>`).join("")}<span class="heathead" style="text-align:right">Lifetime</span></div>`;
  h += [...withHS].sort((a,b)=>b.hs.lifetime-a.hs.lifetime).map(s=>{
    const cells = [];
    for(let y=2019;y<=2026;y++){
      const vv = s.hs.years[y];
      cells.push(`<span class="cell" ${vv?`style="background:${shade(vv[1])}"`:""} data-tip="<b>${esc(s.client)} · ${y}</b><br>${vv? vv[0]+" deal"+(vv[0]>1?"s":"")+" · "+fmt(vv[1]) : "No closed deals"}"></span>`);
    }
    return `<div class="heatrow"><span class="hl">${esc(s.client)}</span>${cells.join("")}<span class="heattot">${fmtM(s.hs.lifetime)}</span></div>`;
  }).join("");
  $("#heat").innerHTML = h;
  bindTips($("#wonopen")); bindTips($("#heat")); bindTips($("#pulse"));
})();

/* ---------- ops ---------- */
function renderOps(){
  const st = store.read();
  const done = S.filter(s=>{ const o=st[s.sid]; return o&&o.c0&&o.c1&&o.c2&&o.c3; }).length;
  $("#progresslab").textContent = `${done} of 30 stories fully validated`;
  $("#progressbar").style.width = (100*done/30)+"%";
  const inact = S.filter(s=>s.ownerActive===false);
  $("#opsalert").innerHTML = `<span class="ic">⚠</span><div>
    <b>${inact.length} of 30 stories are owned by an inactive CRM user (${esc(inact[0]?.owner||"")}).</b>
    <div style="font-size:12.5px;color:var(--ink2);margin-top:4px">Owner is inactive in HubSpot as of @@STAMP@@. Reassign these before validation outreach:
    ${inact.map(s=>esc(s.client)).join(" · ")}</div></div>`;
  const byOwner = {};
  S.forEach(s=>{ (byOwner[s.owner] = byOwner[s.owner]||[]).push(s); });
  $("#owners").innerHTML = Object.entries(byOwner).sort((a,b)=>b[1].length-a[1].length).map(([owner,list])=>{
    const active = list[0].ownerActive, unassigned = owner.includes("not in CRM");
    const val = list.reduce((a,s)=>a+s.value,0);
    return `<div class="panel ocard">
      <div class="oh"><span class="avatar ${active===false||unassigned?"gray":""}">${unassigned?"?":initials(owner)}</span>
        <div><h3>${esc(unassigned? "Unassigned in CRM": owner)} ${active===false?'<span class="chip c-crit">inactive</span>': active?'<span class="chip c-ok">active</span>':""}</h3>
        <div class="ost">${list.length} stories · ${fmtM(val)} story value</div></div></div>
      <div class="olist">${list.map(s=>{
        const o = st[s.sid], k = o&&o.c0&&o.c1&&o.c2&&o.c3;
        return `<div class="oitem"><b>#${s.rank}</b> ${esc(s.client)}<span class="sp"></span>
          <span class="chip ${k?"c-ok":readiness(s)==="ready"?"c-fresh":"c-todo"}">${k?"validated":esc(s.needs)}</span></div>`;}).join("")}</div>
      <button class="copybtn" data-owner="${esc(owner)}">Copy ask list</button></div>`;
  }).join("");
  $$("#owners .copybtn").forEach(b=>b.addEventListener("click", ()=>{
    const list = byOwner[b.dataset.owner];
    const txt = `Validation asks for ${b.dataset.owner} (Align Top 30, @@STAMP@@):\n` +
      list.map(s=>`• #${s.rank} ${s.client} (${s.sid}): ${s.needs}. Story value ${fmt(s.value)}.`).join("\n");
    navigator.clipboard.writeText(txt).then(()=>{ b.textContent="Copied ✓"; setTimeout(()=>b.textContent="Copy ask list",1600); });
  }));
}
renderOps();

/* ---------- coverage ---------- */
(function(){
  $("#cov").innerHTML = DATA.gaps.map(g=>{
    const max = Math.max(...g.rows.map(r=>r[3]));
    return `<div class="panel"><h2 style="font-size:13px;letter-spacing:.14em;color:#E8B95C">${esc(g.dim)}</h2>
      <div class="chart">${g.rows.map(([lab,inS,inB,val,flag])=>`
        <div class="gaprow" data-tip="<b>${esc(lab)}</b><br>${inS} shortlisted of ${inB} in book<br>Book value ${fmt(val)}${flag?"<br>"+esc(flag):""}">
          <span class="lab">${esc(lab)}</span>
          <span class="track"><span class="fill ${flag.startsWith("GAP")?"o":"s"}" style="width:${Math.max(2,100*val/max)}%"></span></span>
          <span class="n">${inS} / ${inB}</span>
          <span>${flag? `<span class="chip ${flag.startsWith("GAP")?"c-todo":"c-warn"}">${esc(flag.startsWith("GAP")?"GAP":"low value")}</span>`:""}</span>
        </div>`).join("")}</div></div>`;
  }).join("");
  bindTips($("#cov"));
})();

/* ---------- bench ---------- */
(function(){
  $("#bench").innerHTML = `<thead><tr><th>Tier</th><th>Client</th><th>Industry</th><th>Size</th><th>Geo</th>
    <th>Engagements</th><th>Sheet value</th><th>CRM lifetime · live</th><th>Latest yr</th></tr></thead><tbody>` +
    DATA.refs.map(r=>{
      const s = S.find(x=>x.client===r.client);
      const live = s&&s.hs? fmtM(s.hs.lifetime) : "·";
      return `<tr><td><span class="tier ${r.tier.startsWith("A")?"a":"b"}">${esc(r.tier)}</span></td>
      <td><b>${esc(r.client)}</b></td><td>${esc(r.industry)}</td><td>${esc(r.size)}</td><td>${esc(r.geo)}</td>
      <td>${r.eng}</td><td><b>${fmt(r.value)}</b></td><td>${live}</td><td>${r.yr}</td></tr>`;
    }).join("") + "</tbody>";
})();

renderCards();
if(location.hash){ const v = location.hash.slice(1); if($("#v-"+v)) show(v); }
</script>
</body></html>"""

page = (HTML.replace("@@DATA@@", json.dumps(DATA, separators=(",",":")))
            .replace("@@LOGO@@", b64)
            .replace("@@STAMP@@", STAMP)
            .replace("@@PORTAL@@", PORTAL))
os.makedirs(os.path.dirname(OUT), exist_ok=True)
open(OUT, "w").write(page)
print("wrote", OUT, f"{len(page)/1024:.0f} KB")
print("KPIs:", dict(book=sum(s['value'] for s in STORIES),
    won=sum(s['hs']['won'] for s in STORIES if s['hs']),
    open=sum(s['hs']['open'] for s in STORIES if s['hs']),
    matched=sum(1 for s in STORIES if s['hs'])))
