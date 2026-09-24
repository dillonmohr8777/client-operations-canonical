import io, json
CREAM='#F2EFE9'; INK='#1A1510'; NAVY='#0B4A75'; BLUE='#2A7FC2'; ORANGE='#D06214'; GOLD='#FACD00'; MUTED='#6B6A66'
HEAD='''<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@800&amp;family=Poppins:wght@500&amp;family=Caveat:wght@600&amp;display=swap">
  <style>
    body { margin: 0; background: %s; }
    a { color: #0B4A75; } a:hover { color: #2A7FC2; }
  </style>
</helmet>
'''
TAIL='''</x-dc>
</body>
</html>
'''
D="font-family: Montserrat, 'Arial Black', sans-serif; font-weight: 800; letter-spacing: -0.02em; line-height: 0.98;"
P="font-family: Poppins, 'Segoe UI', sans-serif; font-weight: 500;"
H="font-family: Caveat, 'Segoe Script', cursive; font-weight: 600;"

def eyebrow(text, color=NAVY, rule=GOLD, size=12):
    return (f'<div style="display: flex; flex-direction: column; gap: 8px;">'
            f'<div style="{P} font-size: {size}px; letter-spacing: 0.22em; text-transform: uppercase; color: {color};">{text}</div>'
            f'<div style="width: 56px; height: 3px; background: {rule};"></div></div>')

def lockup(width=220, white=False, ai_color=BLUE):
    h=round(width*172/800); ai=round(h*0.86); inv='filter: invert(1);' if white else ''
    return (f'<div style="display: flex; align-items: center; gap: {round(width*0.03)}px;">'
            f'<img src="momentum-logo.png" alt="Momentum" style="width: {width}px; height: {h}px; {inv}">'
            f'<div style="{D} font-size: {ai}px; color: {ai_color}; padding-bottom: {round(h*0.06)}px;">AI</div></div>')

files={}
lanes=[('01 · AEO / GEO','Get found by AI.','AI-crawler allowlist. Entity and schema. Answer architecture. Measured monthly on the questions your buyers ask.'),
       ('02 · AI Design','Prototype in a week.','Five working days after kickoff. Built from your real assets and first-party facts.'),
       ('03 · AI Marketing','Content that moves.','A brand film and a set of stills, every month. Your logo never touches a model.'),
       ('04 · AI Automation','The attribution spine.','One intake to one destination. Duplicates and exceptions included. Replies stay internal drafts.')]

# ---------- Main: landing hero 1440x900 ----------
lane_cols=''.join(
    f'<div style="display: flex; flex-direction: column; gap: 8px;">'
    f'<div style="{P} font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: {NAVY};">{a}</div>'
    f'<div style="{D} font-size: 20px; color: {INK};">{b}</div>'
    f'<div style="{P} font-size: 13px; line-height: 1.45; color: {MUTED};">{c}</div></div>' for a,b,c in lanes)
files['Main.dc.html']=HEAD%CREAM+f'''<div style="width: 1440px; height: 900px; background: {CREAM}; display: flex; flex-direction: column; box-sizing: border-box; padding: 40px 72px 48px; overflow: hidden;">
  <div style="display: flex; justify-content: space-between; align-items: center;">
    {lockup(200)}
    <div style="display: flex; gap: 32px; align-items: center;">
      <div style="{P} font-size: 14px; color: {INK};">Four lanes</div>
      <div style="{P} font-size: 14px; color: {INK};">Momo</div>
      <div style="{P} font-size: 14px; color: {INK};">Field notes</div>
      <div style="{P} font-size: 14px; color: #FFFFFF; background: {NAVY}; border-radius: 999px; padding: 12px 22px;">Book a 15-minute snapshot</div>
    </div>
  </div>
  <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 64px; align-items: center; flex-grow: 1; padding-top: 40px;">
    <div style="display: flex; flex-direction: column; gap: 28px;">
      {eyebrow('Introducing · Momentum AI · Philadelphia')}
      <div style="{D} font-size: 56px; color: {INK};">Momentum built the machine.<br>Now we build yours.</div>
      <div style="{P} font-size: 20px; line-height: 1.5; color: {MUTED}; max-width: 540px;">The AI division of Momentum Digital. Four lanes — AI search, AI design, AI marketing, AI automation — built on the systems we run our own agency on, with evidence of what changed.</div>
      <div style="display: flex; gap: 16px; align-items: center;">
        <div style="{P} font-size: 16px; color: #FFFFFF; background: {NAVY}; border-radius: 999px; padding: 18px 30px;">Book a 15-minute snapshot</div>
        <div style="{P} font-size: 16px; color: {NAVY};">See the four lanes</div>
      </div>
      <div style="{P} font-size: 13px; color: {MUTED};">Three evidenced observations and one suggested next step. No pitch.</div>
    </div>
    <div style="position: relative; display: flex; justify-content: center; align-items: center;">
      <img src="hero-polyhedron.jpg" alt="Folded blue cardstock polyhedron with gold beads" style="width: 600px; height: 338px; object-fit: cover; border-radius: 14px; box-shadow: 0 30px 60px rgba(26, 21, 16, 0.22);">
      <div style="position: absolute; left: 24px; top: -18px; {H} font-size: 42px; color: {INK}; transform: rotate(-3deg);">we built a machine.</div>
    </div>
  </div>
  <div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 40px; border-top: 1px solid rgba(26, 21, 16, 0.12); padding-top: 28px;">{lane_cols}</div>
</div>
'''+TAIL

# ---------- OnePager: Letter 816x1056 ----------
offers=[('Lead Operations Pilot','One intake, one destination, one routing workflow, with duplicates and exceptions handled. Thirty named tests before support begins.'),
        ('AI Visibility Program','Twenty buyer questions across two engines, measured monthly, two page improvements a month, a source-linked report.'),
        ('Campaign Production System','One brief, four original concepts and up to eight size variants a month. Your logo never touches a model.')]
offer_rows=''.join(
    f'<div style="display: grid; grid-template-columns: 200px minmax(0, 1fr) 150px; gap: 20px; padding: 14px 0; border-top: 1px solid rgba(26, 21, 16, 0.14);">'
    f'<div style="{D} font-size: 16px; color: {INK};">{a}</div>'
    f'<div style="{P} font-size: 12.5px; line-height: 1.5; color: {MUTED};">{b}</div>'
    f'<div style="{P} font-size: 12px; color: {NAVY}; text-align: right;">[PRICE — pending sign-off]</div></div>' for a,b in offers)
lane_grid=''.join(
    f'<div style="display: flex; flex-direction: column; gap: 6px; background: #FFFFFF; border-radius: 10px; padding: 18px; box-shadow: 0 6px 18px rgba(26, 21, 16, 0.06);">'
    f'<div style="{P} font-size: 10.5px; letter-spacing: 0.2em; text-transform: uppercase; color: {NAVY};">{a}</div>'
    f'<div style="{D} font-size: 19px; color: {INK};">{b}</div>'
    f'<div style="{P} font-size: 12.5px; line-height: 1.5; color: {MUTED};">{c}</div></div>' for a,b,c in lanes)
files['OnePager.dc.html']=HEAD%CREAM+f'''<div style="width: 816px; height: 1056px; background: {CREAM}; display: flex; flex-direction: column; box-sizing: border-box; padding: 56px 64px 48px; gap: 20px; overflow: hidden;">
  <div style="display: flex; justify-content: space-between; align-items: center;">
    {lockup(180)}
    <div style="{P} font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: {MUTED};">Philadelphia · Since 2015</div>
  </div>
  <div style="display: flex; flex-direction: column; gap: 14px;">
    {eyebrow('Introducing the AI division')}
    <div style="{D} font-size: 40px; color: {INK};">Momentum built the machine.<br>Now we build yours.</div>
    <div style="{P} font-size: 14px; line-height: 1.55; color: {MUTED}; max-width: 620px;">We spent a year building the systems we run our own agency on — the reporting, the prospecting, the design gate, the video pipeline. Momentum AI puts that machine to work for established local service businesses: easier to discover, faster to respond, simpler to operate, with evidence of what changed.</div>
  </div>
  <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px;">{lane_grid}</div>
  <div style="display: flex; flex-direction: column; gap: 4px;">
    <div style="{P} font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: {NAVY};">Three ways to start</div>
    {offer_rows}
  </div>
  <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: auto; border-top: 1px solid rgba(26, 21, 16, 0.14); padding-top: 16px;">
    <div style="display: flex; flex-direction: column; gap: 4px;">
      <div style="{D} font-size: 15px; color: {INK};">Start with a 15-minute snapshot.</div>
      <div style="{P} font-size: 12px; color: {MUTED};">Three evidenced observations and one suggested next step. No pitch.</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 3px; text-align: right;">
      <div style="{P} font-size: 12px; color: {INK};">needmomentum.com</div>
      <div style="{P} font-size: 12px; color: {NAVY};">[PHONE] · [EMAIL]</div>
    </div>
  </div>
</div>
'''+TAIL

# ---------- Ebook covers 576x864 ----------
covers=[('Show Up When They Ask AI','how local businesses get found in ChatGPT, Gemini and AI answers','particles-cream.jpg','No. 1'),
        ('From Missed Call to Booked Job','AI receptionists, follow-up, and the leads you already pay for','page-writes.jpg','No. 2'),
        ('Built, Not Prompted','AI in design, video and content — without losing the brand','fold.jpg','No. 3'),
        ('The Small Business AI Operating System','agents and workflows for a business that wants to run bigger','hero-polyhedron.jpg','No. 4'),
        ('Names, Not Numbers','attribution — knowing which real people your marketing produced','bird-plate.jpg','No. 5')]
for i,(t,sub,img,no) in enumerate(covers,1):
    files[f'Cover{i}.dc.html']=HEAD%CREAM+f'''<div style="width: 576px; height: 864px; background: {CREAM}; display: flex; flex-direction: column; box-sizing: border-box; overflow: hidden;">
  <img src="{img}" alt="" style="width: 576px; height: 400px; object-fit: cover;">
  <div style="display: flex; flex-direction: column; gap: 18px; padding: 36px 44px 32px; flex-grow: 1;">
    {eyebrow('Momentum AI · Field Notes · '+no)}
    <div style="{D} font-size: 46px; color: {INK};">{t}</div>
    <div style="{H} font-size: 27px; line-height: 1.15; color: {NAVY}; transform: rotate(-1.5deg); transform-origin: left center;">{sub}</div>
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: auto;">
      <div style="display: flex; flex-direction: column; gap: 2px;">
        <div style="{P} font-size: 14px; color: {INK};">Dillon Mohr</div>
        <div style="{P} font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: {MUTED};">Momentum Digital · Philadelphia</div>
      </div>
      <img src="momentum-mark.png" alt="Momentum mark" style="width: 38px; height: 45px;">
    </div>
  </div>
</div>
'''+TAIL

# ---------- Carousel 1080x1080 ----------
def square(body, bg=CREAM):
    return HEAD%bg+f'<div style="width: 1080px; height: 1080px; background: {bg}; display: flex; flex-direction: column; box-sizing: border-box; padding: 88px; overflow: hidden;">{body}</div>'+TAIL
foot=(f'<div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">'
      f'<img src="momentum-mark.png" alt="Momentum mark" style="width: 44px; height: 52px;">'
      f'<div style="{P} font-size: 18px; letter-spacing: 0.18em; text-transform: uppercase; color: {MUTED};">needmomentum.com</div></div>')
files['Carousel1.dc.html']=square(
    f'<div style="display: flex; flex-direction: column; gap: 40px;">{eyebrow("Momentum AI · 1 of 4", size=16)}'
    f'<div style="{D} font-size: 86px; color: {INK};">Most local businesses run <span style="color: {ORANGE};">ads.</span></div>'
    f'<div style="{D} font-size: 86px; color: {INK};">Great ones build momentum.</div></div>{foot}')
lane_rows=''.join(
    f'<div style="display: grid; grid-template-columns: 240px minmax(0, 1fr); gap: 24px; align-items: baseline; padding: 22px 0; border-top: 1px solid rgba(26, 21, 16, 0.14);">'
    f'<div style="{P} font-size: 16px; letter-spacing: 0.2em; text-transform: uppercase; color: {NAVY};">{a}</div>'
    f'<div style="{D} font-size: 40px; color: {INK};">{b}</div></div>' for a,b,_ in lanes)
files['Carousel2.dc.html']=square(
    f'<div style="display: flex; flex-direction: column; gap: 36px;">{eyebrow("Momentum AI · 2 of 4", size=16)}'
    f'<div style="{D} font-size: 78px; color: {INK};">Four lanes.<br>One machine.</div>'
    f'<div style="display: flex; flex-direction: column;">{lane_rows}</div></div>{foot}')
files['Carousel3.dc.html']=square(
    f'<div style="display: flex; flex-direction: column; gap: 36px; flex-grow: 1;">{eyebrow("Momentum AI · 3 of 4", size=16)}'
    f'<div style="display: flex; align-items: center; gap: 48px; flex-grow: 1;">'
    f'<img src="momo.jpg" alt="Momo" style="width: 380px; height: 380px; object-fit: cover; border-radius: 24px;">'
    f'<div style="display: flex; flex-direction: column; gap: 22px;"><div style="{D} font-size: 64px; color: {INK};">Every offer ships with its agent.</div>'
    f'<div style="{H} font-size: 40px; color: {NAVY}; transform: rotate(-2deg);">say hi to Momo.</div></div></div></div>{foot}')
files['Carousel4.dc.html']=square(
    f'<div style="display: flex; flex-direction: column; gap: 44px; align-items: center; justify-content: center; flex-grow: 1; text-align: center;">'
    f'{lockup(620)}'
    f'<div style="{P} font-size: 26px; color: {INK};">The AI division of Momentum Digital</div>'
    f'<div style="{P} font-size: 16px; letter-spacing: 0.22em; text-transform: uppercase; color: {MUTED};">Philadelphia · Since 2015 · needmomentum.com</div></div>')

for k,v in files.items():
    io.open(k,'w',encoding='utf-8',newline='\n').write(v)

canvas={
 "pages":[{"id":"page-1","name":"Launch"},{"id":"page-2","name":"Ebooks"},{"id":"page-3","name":"Social"}],
 "artboards":[
  {"file":"Main.dc.html","title":"Landing hero","x":0,"y":0,"w":1440,"h":900,"page":"page-1"},
  {"file":"OnePager.dc.html","title":"One-pager (Letter)","x":1540,"y":0,"w":816,"h":1056,"page":"page-1"},
 ]+[{"file":f"Cover{i}.dc.html","title":f"Ebook cover {i}","x":(i-1)*680,"y":0,"w":576,"h":864,"page":"page-2"} for i in range(1,6)]
  +[{"file":f"Carousel{i}.dc.html","title":f"Carousel {i} of 4","x":(i-1)*1180,"y":0,"w":1080,"h":1080,"page":"page-3"} for i in range(1,5)],
 "annotations":[
  {"id":"note-prices","x":1540,"y":-140,"w":420,"text":"Prices are bracketed on purpose: the AI division plan marks them proposed, pending Mac's sign-off.","page":"page-1"},
  {"id":"note-titles","x":0,"y":-140,"w":460,"text":"Titles from the AEO/GEO keyword scout, 2026-09-07. Book 1 leads: \"what is aeo\" is 4,400/mo and growing. Book 5 ships only after the match-back fix lands.","page":"page-2"}],
 "launch":{"view":"canvas","page":"page-1"}}
json.dump(canvas, io.open('canvas.json','w',encoding='utf-8'), indent=2)
print('artboards:', len(files), '| canvas.json written')
