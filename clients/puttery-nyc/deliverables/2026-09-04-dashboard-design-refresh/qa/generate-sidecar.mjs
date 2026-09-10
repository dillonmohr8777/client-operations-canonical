import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseDesignMd} from 'file:///C:/Users/dillo/Documents/Codex/.agents/skills/impeccable/scripts/lib/design-parser.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const md=fs.readFileSync(path.join(root,'DESIGN.md'),'utf8');
const parsed=parseDesignMd(md);
const css=fs.readFileSync(path.join(root,'styles.css'),'utf8');
const fragments=[
 ['Primary action','button','action-primary','<button class="ds-action-button ds-primary">Review next step</button>',['action-button','action-button.primary','action-button.primary:hover']],
 ['Secondary action','button','action-secondary','<button class="ds-action-button ds-secondary">Export answers</button>',['action-button','action-button.secondary','action-button.secondary:hover']],
 ['Active navigation','nav','active-nav','<a class="ds-rail-link ds-active" href="#">Current status</a>',['rail-link','rail-link.active']],
 ['Answer field','input','input','<label>Answer<select class="ds-field"><option>Unanswered</option><option>Yes or verified</option></select></label>',['answer-panel select']],
 ['Status label','chip',null,'<span class="ds-platform-state ds-gated">Reporting held</span>',['platform-state','platform-state.gated']],
 ['Next action','custom','action-panel','<div class="ds-status-next"><strong>Next action</strong><p>Confirm the intended test event and reconcile deliveries.</p></div>',['status-next']]
];
function extract(sel){
 const found=[...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].find(m=>m[1].split(',').map(s=>s.trim()).includes('.'+sel));
 if(!found)return '';
 let selector='.'+sel;
 if(sel==='answer-panel select')selector='.ds-field';
 else selector=selector.replace(/\.([\w-]+)/g,'.ds-$1');
 return selector+'{'+found[2]+'}';
}
const components=fragments.map(([name,kind,refersTo,html,sels])=>({name,kind,...(refersTo?{refersTo}:{}),description:'Extracted from the implemented dashboard.',html,css:sels.map(extract).join('')+':focus-visible{outline:3px solid var(--teal-dark);outline-offset:4px}'}));
const overview=md.split('## Overview')[1].split('## Colors')[0].trim();
const doPart=md.split('### Do:')[1].split("### Don't:")[0];
const dontPart=md.split("### Don't:")[1];
const output={schemaVersion:2,generatedAt:new Date().toISOString(),title:parsed.title,extensions:{shadows:[{name:'feedback',value:'0 8px 24px rgba(1,0,0,.2)',purpose:'Transient feedback only.'}],motion:[{name:'state',value:'160ms ease-out',purpose:'Control state changes only. Disabled for reduced motion.'}],breakpoints:[1220,980,720,430].map(n=>({name:'max-'+n,value:n+'px'}))},components,narrative:{northStar:'The Course Marshal Board',overview,keyCharacteristics:overview.split('**Key Characteristics:**')[1].split('\n').filter(l=>l.startsWith('- ')).map(l=>l.slice(2)),rules:[{name:'The Written Status Rule',body:'Readiness is always named in text, never conveyed by color alone.',section:'colors'}],dos:doPart.split('\n').filter(l=>l.startsWith('- ')).map(l=>l.slice(2)),donts:dontPart.split('\n').filter(l=>l.startsWith('- ')).map(l=>l.slice(2))}};
fs.mkdirSync(path.join(root,'.impeccable'),{recursive:true});
fs.writeFileSync(path.join(root,'.impeccable/design.json'),JSON.stringify(output,null,2)+'\n');
console.log('Generated .impeccable/design.json from DESIGN.md and implemented component CSS.');
