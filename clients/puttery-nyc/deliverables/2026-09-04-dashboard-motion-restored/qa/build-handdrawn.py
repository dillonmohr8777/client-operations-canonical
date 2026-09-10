from pathlib import Path
import xml.etree.ElementTree as ET
import json,shutil

root=Path(__file__).resolve().parents[1]
backup=root/'qa'/'superseded-realistic-intro';backup.mkdir(exist_ok=True)
for name in ['champion-intro.js','media.js','styles.css','index.html']:
 if not (backup/name).exists():shutil.copy2(root/name,backup/name)
paths=ET.fromstring((root/'assets/puttery-logo.svg').read_text()).findall('.//{http://www.w3.org/2000/svg}path')
glyphs=[paths[i].attrib['d'] for i in [6,0,1,2,3,4,5]]
routes=[
 'M4.2 39.6 L4.2 10.2 L8.5 13 C12 7 22.5 7.8 22.5 19 C22.5 31 7.5 30.8 7.5 20 C7.5 9 19 10 19 19 C19 26 10 27 10 20 L16 17 L16 24',
 'M32.2 7.1 L32.2 21 C32.2 31 48.3 31 48.3 21 L48.3 7.1',
 'M61.5 3.1 L61.5 22.5 Q61.5 28.2 68 28.2 L71.4 28.2 L68 28.2 Q61.5 28.2 61.5 22.5 L61.5 9.7 L55.8 9.7 L71.3 9.7',
 'M81.3 3.1 L81.3 22.5 Q81.3 28.2 87.8 28.2 L91.2 28.2 L87.8 28.2 Q81.3 28.2 81.3 22.5 L81.3 9.7 L75.6 9.7 L91.1 9.7',
 'M98 18.1 L113.8 18.1 C113 3.5 96 7 95.9 19 C95.9 31.8 110.7 32 113.2 25.3',
 'M122.7 31.1 L122.7 10 L124.8 15 C126 8.4 130 9.8 133.5 9.8',
 'M139.7 7.4 L149.8 29.5 L159.1 7.4 L149.2 30.3 C147.5 36 145.8 37 139 36.9'
]
defs='';marks=''
for i,(d,route) in enumerate(zip(glyphs,routes)):
 defs+=f'<mask id="ink-{i}" maskUnits="userSpaceOnUse" x="0" y="0" width="164" height="42"><path class="write-route" data-glyph="{i}" d="{route}" fill="none" stroke="white" stroke-width="8.5" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/><rect class="ink-seal" data-glyph="{i}" x="0" y="0" width="164" height="42" fill="white" opacity="0"/></mask>'
 marks+=f'<path class="exact-glyph" data-letter="{"puttery"[i]}" d="{d}" fill="white" mask="url(#ink-{i})"/>'
art='''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 480" class="sketch-canvas" aria-hidden="true">
<defs>DEFINITIONS</defs>
<g class="sketch-golfer" fill="none" stroke="white" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">
 <path d="M79 365 Q178 366 319 365" stroke-opacity=".24" stroke-width="1.4"/>
 <g class="golfer-body">
  <path d="M118 104 Q127 88 147 94 Q162 96 171 110 L181 113 Q184 117 176 120 L151 116 Q135 113 117 118 Z"/>
  <path d="M122 120 Q121 139 132 148 L143 151 L151 165 M152 118 Q163 121 164 130 L172 135 L164 139 Q162 152 150 153 L145 151"/>
  <path d="M151 130 l3 1 M155 145 q-6 2-10-2" stroke-width="2"/>
  <path d="M130 151 L119 161 L147 183 L161 166 L151 159 M132 170 L130 182 L137 185"/>
  <path d="M119 162 Q103 169 98 186 L89 233 Q111 249 143 252 L159 211 M161 166 Q179 177 191 202 L173 216 L149 193"/>
  <path d="M101 224 Q125 231 148 230 M91 234 Q119 245 143 242" stroke-width="2"/>
  <path d="M92 240 L81 292 L81 348 Q89 357 105 351 L116 295 L128 270 L134 308 L151 351 Q163 354 175 345 L158 293 L144 248"/>
  <path d="M104 251 L98 297 L95 338 M139 259 L147 300 L160 337" stroke-opacity=".55" stroke-width="1.7"/>
  <path d="M80 347 Q77 352 76 360 L99 362 Q110 361 111 355 L104 348 M151 348 L151 357 Q164 364 190 361 L192 355 L174 346"/>
  <path d="M84 357 L101 357 M158 357 L180 358" stroke-width="1.5"/>
 </g>
 <g class="golfer-arms">
  <path d="M104 185 Q111 209 142 227 L178 249 Q186 254 194 249 M174 209 L189 229 L201 243 Q204 249 197 254 L188 256 Q181 255 179 249"/>
  <path d="M112 191 Q119 207 145 218 L182 243 M180 211 L199 232 L207 244" stroke-width="2.2"/>
  <path d="M183 244 l8 4 M190 242 l9 5 M194 252 l9-4" stroke-width="1.7"/>
  <g class="golfer-club"><path d="M197 249 L290 355" stroke-width="2.8"/><path d="M193 245 L205 257" stroke-width="5"/><path d="M281 352 L300 355 L301 361 L281 358 Z" fill="black" stroke-width="2.8"/></g>
 </g>
 <g class="putt-swish" stroke-opacity=".6" opacity="0" stroke-width="1.7"><path d="M259 348 Q265 359 276 362 M257 356 l8 9"/></g>
</g>
<g class="written-wordmark">MARKS</g>
<g class="writing-ball"><circle r="7.7" fill="black"/><circle r="5.7" fill="white"/><g class="ball-spin" stroke="black" stroke-width=".85" fill="none"><path d="M-2.8 -2.1 q1.2-1.2 2.1-.4 M1.9 -.8 q1.2 1.1 .4 2.2 M-1 2 q-1.3 1.1-2.2-.1"/></g></g>
</svg>'''.replace('DEFINITIONS',defs).replace('MARKS',marks)
(root/'assets/puttery-handdrawn-intro.svg').write_text(art,encoding='utf-8')
old=(root/'champion-intro.js').read_text()
rail=old[old.index("  document.addEventListener('DOMContentLoaded'"):]
(root/'champion-intro.js').write_text((root/'qa/handdrawn-runtime.js').read_text()+ '\n'+rail,encoding='utf-8')
media={'champion':{'kind':'handdrawn','src':'assets/puttery-handdrawn-intro.svg','durationMs':7100},'loop':{'src':'assets/puttery-golf-loop.mp4','poster':'assets/puttery-golf-loop.jpg'}}
(root/'media.js').write_text('window.PUTTERY_INTRO_MEDIA = '+json.dumps(media,indent=2)+';\n')
p=(root/'index.html').read_text();p=p.replace('putteryChampionIntroSeen20260904','putteryHanddrawnIntroSeen20260904v1');(root/'index.html').write_text(p,encoding='utf-8')
css=(root/'styles.css').read_text();marker='/* One new user-directed focal sequence; the original full page motion remains. */';css=css[:css.index(marker)]+(root/'qa/handdrawn.css').read_text();(root/'styles.css').write_text(css,encoding='utf-8')
print('Hand-drawn intro built; exact seven glyphs retained; realistic intro is superseded.')
