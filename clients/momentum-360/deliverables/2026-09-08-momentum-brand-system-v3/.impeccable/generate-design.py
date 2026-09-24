"""Generate extension-only design metadata from DESIGN.md and shipped CSS."""
from pathlib import Path
import re, json, math
from datetime import datetime, timezone

root = Path(__file__).resolve().parent.parent
doc = (root / 'DESIGN.md').read_text(encoding='utf-8')
css = (root / 'style.css').read_text(encoding='utf-8')
front = doc.split('---', 2)[1]
def section(name):
    return doc.split('## '+name+'\n',1)[1].split('\n## ',1)[0].strip()
def ramp(value):
    h=value.lstrip('#')
    if len(h)==3: h=''.join(x*2 for x in h)
    rgb=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    r,g,b=[x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in rgb]
    l=(.4122214708*r+.5363325363*g+.0514459929*b)**(1/3)
    m=(.2119034982*r+.6806995451*g+.1073969566*b)**(1/3)
    s=(.0883024619*r+.2817188376*g+.6299787005*b)**(1/3)
    a=1.9779984951*l-2.428592205*m+.4505937099*s
    bb=.0259040371*l+.7827717662*m-.808675766*s
    c=math.hypot(a,bb); hue=math.degrees(math.atan2(bb,a))%360
    return [f'oklch({15+i*80/7:.2f}% {c:.5f} {hue:.2f})' for i in range(8)]
colors=dict(re.findall(r'^  ([\w-]+): "(#[0-9a-f]+)"$',front.split('typography:')[0],re.M))
overview=section('Overview')
north=re.search(r'\*\*Creative North Star: "(.+?)"\*\*',overview).group(1)
paragraphs=overview.split('\n\n')[1:3]
characteristics=re.findall(r'^- (.+)$',overview,re.M)
rules=[]
for heading,tag in [('Colors','colors'),('Typography','typography'),('Elevation & Depth','elevation')]:
    for name,body in re.findall(r'\*\*The (.+?) Rule\.\*\* (.+)',section(heading)):
        rules.append({'name':'The '+name+' Rule','body':body,'section':tag})
guards=section("Do's and Don'ts")
def bullets(part): return re.findall(r'^- (.+)$',part,re.M)
focus=':focus-visible{outline:3px solid var(--gold);outline-offset:5px}'
def snippet(name,kind,ref,html,styles,description):
    return {'name':name,'kind':kind,'refersTo':ref,'description':description,'html':html,'css':styles}
button='display:inline-flex;align-items:center;justify-content:center;gap:18px;padding:12px 22px;background:var(--gold);border:1px solid var(--gold);border-radius:8px;color:var(--night);font:900 18px/1.7 var(--body);text-decoration:none;transition:background .2s,transform .2s;cursor:pointer'
components=[]
for variant in ['primary','secondary']:
    cls='ds-button-'+variant
    style=button+(' ;background:transparent;border-color:var(--line);color:var(--ink)' if variant=='secondary' else '')
    styles=f'.{cls}{{{style}}}.{cls}:hover{{background:#ffcf54;transform:translateY(-2px)}}.{cls}'+focus+f'.{cls}:disabled{{opacity:.5;cursor:not-allowed}}@media(prefers-reduced-motion:reduce){{.{cls}{{transition:none}}}}'
    components.append(snippet(variant.title()+' button','button','button-'+variant,f'<button class="{cls}">Open the field guide</button>',styles,'Shared guide and exercise action.'))
components.append(snippet('Exercise field','input','input','<label class="ds-field">Question you tested<input placeholder="Enter a question"></label>', '.ds-field{display:flex;flex-direction:column;gap:8px;font:900 14px/1.7 var(--body);color:var(--ink)}.ds-field input{font:16px/1.5 var(--body);color:var(--ink);padding:12px;border:1px solid var(--line);border-radius:8px;background:white;caret-color:var(--blue)}.ds-field input'+focus,'Labelled local exercise input.'))
components.append(snippet('Category selector','chip','tab','<button class="ds-tab" aria-pressed="true">Service icons</button>', '.ds-tab{border:1px solid var(--line);background:var(--pale);color:var(--ink);padding:12px 20px;border-radius:8px;font:900 18px/1.7 var(--body);cursor:pointer}.ds-tab[aria-pressed=true]{background:var(--navy);color:white;border-color:var(--navy);box-shadow:inset 0 -3px 0 var(--gold)}.ds-tab'+focus,'Pressed category or step control; source has no separate hover fill.'))
components.append(snippet('Contents navigation','nav',None,'<nav class="ds-nav"><a href="#chapter">Introduction</a><a href="#chapter" class="ds-active" aria-current="location">The next chapter</a></nav>', '.ds-nav{display:flex;flex-direction:column;gap:2px;font:14px/1.45 var(--body)}.ds-nav a{padding:9px 10px;text-decoration:none;border-radius:5px;color:var(--muted)}.ds-nav a:hover,.ds-nav .ds-active{background:var(--pale);color:var(--navy)}.ds-nav .ds-active{font-weight:900}.ds-nav a'+focus,'Final border-free chapter navigation.'))
components.append(snippet('Reading tool','card','reading-tool','<section class="ds-tool"><h2>Your workflow brief</h2><p>Specify one workflow before choosing a tool.</p></section>', '.ds-tool{padding:34px;background:var(--pale);border-radius:var(--radius);color:var(--ink);font:18px/1.7 var(--body)}.ds-tool h2{font:900 2.2rem/1.07 var(--display);letter-spacing:-.025em;margin:0 0 18px}.ds-tool p{font-size:1rem;margin:0 0 24px}@media(max-width:720px){.ds-tool{padding:24px}.ds-tool h2{font-size:1.8rem}}','Flat container shared by the five reading tools.'))
for item in components:
    if item['refersTo'] is None: del item['refersTo']
sidecar={
 'schemaVersion':2,'generatedAt':datetime.now(timezone.utc).isoformat(),'title':'Design System: Momentum Digital AI Field Notes v3',
 'extensions':{
  'colorMeta':{k:{'role':'primary' if k in ('navy','night','blue') else 'secondary' if k=='gold' else 'neutral','displayName':k.title(),'tonalRamp':ramp(v)} for k,v in colors.items()},
  'typographyMeta':{'display':{'displayName':'Archivo Black','purpose':'Heavy display and chapter headings; source alias Archivo.'},'body':{'displayName':'Nunito Sans','purpose':'Reading and interface; source alias Nunito.'}},
  'shadows':[{'name':'selected-inset','value':'inset 0 -3px 0 var(--gold)','purpose':'Selected category and step state; not card elevation.'}],
  'motion':[{'name':'ease','value':re.search(r'--ease:([^;]+)',css).group(1),'purpose':'Identity, title and assembly transitions.'},{'name':'identity-title','value':'0.8s','purpose':'Finite identity and title entrances.'},{'name':'service-study','value':'3.6s','purpose':'User-replayed semantic SVG motion.'},{'name':'control-hover','value':'0.2s','purpose':'Button hover state.'}],
  'breakpoints':[{'name':'compact-desktop','value':'1000px'},{'name':'mobile','value':'720px'}]
 },'components':components,
 'narrative':{'northStar':north,'overview':'\n\n'.join(paragraphs),'keyCharacteristics':characteristics,'rules':rules,'dos':bullets(guards.split('### Do:',1)[1].split('### Don',1)[0]),'donts':bullets(guards.split("### Don't:",1)[1])}
}
out=root/'.impeccable'/'design.json'
out.write_text(json.dumps(sidecar,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
print(f'Generated {out.name}: {len(colors)} color metadata entries, {len(components)} component snippets; primitives remain in DESIGN.md.')
