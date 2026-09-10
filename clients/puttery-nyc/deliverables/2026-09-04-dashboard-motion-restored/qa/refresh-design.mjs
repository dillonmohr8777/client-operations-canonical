// Regenerate additive metadata from shipped source and the normative design record.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const side=JSON.parse(read('.impeccable/design.json'));
const sandbox={window:{}};vm.runInNewContext(read('public/media.js'),sandbox);
const media=sandbox.window.PUTTERY_INTRO_MEDIA;
const css=read('public/styles.css');
side.generatedAt=new Date().toISOString();
side.source={designSha256:crypto.createHash('sha256').update(read('DESIGN.md')).digest('hex'),stylesSha256:crypto.createHash('sha256').update(css).digest('hex'),generator:'qa/refresh-design.mjs'};
side.extensions.motion=side.extensions.motion.filter(m=>m.name!=='champion-reveal');
side.extensions.motion.push({name:'champion-reveal',value:`${media.champion.durationMs}ms hand-drawn SVG sequence`,purpose:'The user-requested golfer and moving ball draw the exact logo glyphs on black; reduced motion and skip preserve access.'});
side.components=side.components.filter(c=>c.name!=='Champion intro controls');
const metric=side.components.find(c=>c.name==='Modeled Metric Scorecard'||c.name==='Reservation Metric Scorecard');
if(metric){metric.name='Reservation Metric Scorecard';metric.description='Ruled integer counts retain precise reservation-source and field-presence labels.';metric.html='<section class="ds-metric-scorecard"><div><span>Reservation states</span><strong>Pending</strong><small>Selected service period</small></div><div><span>Campaign field names</span><strong>Pending</strong><small>Records with recognized keys</small></div></section>';}
if(side.narrative?.overview)side.narrative.overview=side.narrative.overview.replace('no live Puttery account, guest, reservation, advertising, or payment data is connected, and modeled figures never masquerade as verified performance.','verified Tock reservation aggregates carry dated source boundaries; advertising, attendance, attribution and financial reporting remain pending.');
if(side.narrative?.keyCharacteristics)side.narrative.keyCharacteristics=side.narrative.keyCharacteristics.map(s=>s.replace('modeled-data boundary','source-data boundary'));
side.components.push({name:'Champion intro controls',kind:'custom',description:'Skip and Pause preserve access to the experience sequence.',html:'<div class="champion-intro-controls"><button>Pause intro</button><button>Skip intro</button></div>',css:css.slice(css.indexOf('.champion-intro-controls{'))});
fs.writeFileSync(path.join(root,'.impeccable/design.json'),JSON.stringify(side,null,2)+'\n');
const findings=JSON.parse(read('qa/champion-detector.json'));
const counts={};for(const f of findings)counts[f.severity]=(counts[f.severity]||0)+1;
fs.writeFileSync(path.join(root,'qa/champion-detector-summary.json'),JSON.stringify({exit:Number(read('qa/champion-detector-exit.txt').trim()),findings:findings.length,severities:counts},null,2));
console.log(JSON.stringify({sidecarGenerated:true,findings:findings.length,severities:counts}));
