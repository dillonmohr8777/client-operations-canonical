const pptxgen=require('pptxgenjs'); const fs=require('fs'); const sharp=require('sharp'); const React=require('react'); const RD=require('react-dom/server');
const I=require('react-icons/fi');
const O='FF7C00', INK='121212', INK2='2B2B2B', MUTE='6E6A66', PITH='F6F1EA', PEEL='FFF3E8', LINE='E4DDD4', W='FFFFFF', SOFT='CFC8C0';
const H='Montserrat', B='Arial';
const pres=new pptxgen(); pres.layout='LAYOUT_WIDE'; pres.author='BigOrange.Marketing'; pres.title='BigOrange Thursday WordPress Growth Review';
const LOGO_O='assets/bigorange-logo-orange.png', LOGO_W='assets/bigorange-logo-white.png';
async function icon(Comp,color,size=256){const svg=RD.renderToStaticMarkup(React.createElement(Comp,{color:'#'+color,size:size,strokeWidth:1.6})); const buf=await sharp(Buffer.from(svg)).png().toBuffer(); return 'image/png;base64,'+buf.toString('base64');}
const T=(s,txt,o)=>s.addText(txt,Object.assign({isTextBox:true,margin:0,fontFace:B,color:INK,valign:'top'},o));
function chrome(s,n,dark=false){ // logo + slide number + footer label
  s.addImage({path:dark?LOGO_W:LOGO_O,x:0.6,y:0.42,h:0.42,w:1.24});
  T(s,'THURSDAY LEADERSHIP REVIEW  ·  SEPTEMBER 3, 2026  ·  PRIVATE REVIEW DRAFT',{x:0.6,y:6.95,w:8,h:0.25,fontFace:H,fontSize:7,bold:true,charSpacing:2,color:dark?SOFT:MUTE});
  s.addShape(pres.shapes.RECTANGLE,{x:12.02,y:7.0,w:0.11,h:0.11,fill:{color:O},line:{color:O,width:0}});
  T(s,String(n).padStart(2,'0'),{x:12.2,y:6.92,w:0.55,h:0.3,fontFace:H,fontSize:10,bold:true,color:dark?W:INK,align:'right'});
}
function head(s,eyebrow,title,dark=false,titleW=11.8){
  T(s,eyebrow.toUpperCase(),{x:0.6,y:1.12,w:9,h:0.26,fontFace:H,fontSize:9,bold:true,charSpacing:3,color:O});
  T(s,title,{x:0.6,y:1.4,w:titleW,h:0.95,fontFace:H,fontSize:30,bold:true,color:dark?W:INK,valign:'top'});
}
function notes(s,t){s.addNotes(t);}
function stat(s,x,y,w,h,v,l,hot=false,vSize=44){
  s.addShape(pres.shapes.RECTANGLE,{x,y,w,h,fill:{color:hot?O:PITH},line:{color:hot?O:PITH,width:0}});
  T(s,v,{x:x+0.25,y:y+0.22,w:w-0.4,h:0.9,fontFace:H,fontSize:vSize,bold:true,color:hot?W:INK,charSpacing:-2});
  T(s,l,{x:x+0.25,y:y+h-0.7,w:w-0.4,h:0.55,fontFace:B,fontSize:10.5,color:hot?W:INK2,valign:'bottom'});
}
function card(s,x,y,w,h,kicker,title,body,opts={}){
  const dark=opts.dark; s.addShape(pres.shapes.RECTANGLE,{x,y,w,h,fill:{color:dark?INK:PITH},line:{color:dark?INK:PITH,width:0}});
  T(s,kicker.toUpperCase(),{x:x+0.3,y:y+0.28,w:w-0.6,h:0.24,fontFace:H,fontSize:8,bold:true,charSpacing:2.5,color:O});
  T(s,title,{x:x+0.3,y:y+0.55,w:w-0.6,h:0.5,fontFace:H,fontSize:opts.titleSize||16,bold:true,color:dark?W:INK});
  T(s,body,{x:x+0.3,y:y+1.1,w:w-0.6,h:h-1.3,fontFace:B,fontSize:opts.bodySize||11.5,color:dark?'EDE7E0':INK2,paraSpaceAfter:6});
}
(async()=>{
// ---------- 1 Title (dark) ----------
{ const s=pres.addSlide(); s.background={color:INK};
  s.addShape(pres.shapes.RECTANGLE,{x:9.6,y:0,w:3.733,h:3.6,fill:{color:O},line:{color:O,width:0}});
  s.addShape(pres.shapes.RECTANGLE,{x:8.95,y:3.6,w:0.65,h:0.65,fill:{color:O},line:{color:O,width:0}});
  s.addImage({path:LOGO_W,x:0.6,y:0.55,h:0.6,w:1.775});
  T(s,'THURSDAY LEADERSHIP REVIEW',{x:0.6,y:2.05,w:8,h:0.3,fontFace:H,fontSize:10,bold:true,charSpacing:4,color:O});
  T(s,'WordPress growth, made operational.',{x:0.6,y:2.4,w:8.2,h:1.9,fontFace:H,fontSize:50,bold:true,color:W,charSpacing:-2});
  T(s,'A 370 URL technical plan, a 24 asset authority system, five new builder blogs, and the release controls that turn content into qualified demand.',{x:0.6,y:4.45,w:7.6,h:1.0,fontFace:B,fontSize:15,color:'EDE7E0'});
  T(s,'September 3, 2026',{x:0.6,y:6.35,w:5,h:0.35,fontFace:H,fontSize:11,bold:true,color:W,charSpacing:1});
  T(s,'PRIVATE REVIEW DRAFT',{x:8.6,y:6.35,w:4.13,h:0.35,fontFace:H,fontSize:8,bold:true,charSpacing:3,color:SOFT,align:'right'});
  notes(s,'Open with the decision: this is a controlled growth system, not a publish-everything content dump.\n\n[Sources]\nInternal BigOrange working package; September 2, 2026.\n[/Sources]');
}
// ---------- 2 Original agreement ----------
{ const s=pres.addSlide(); s.background={color:W}; chrome(s,2); head(s,'Original agreement','What the paid pilot actually asked for');
  const cols=[['Milestone 1','15 hours','Discovery, audit, keyword and content strategy, architecture, priorities and implementation planning.'],
              ['Milestone 2','20 hours','One pillar page, two supporting articles, technical SEO and WordPress implementation support.'],
              ['Commercial frame','$1,050 total','35 hours at $30 per hour. Phase 2 social, downloadable and webinar production remained a future scope, not part of the paid pilot.']];
  cols.forEach((c,i)=>{const x=0.6+i*3.95, y=2.75, w=3.75, h=3.7; const hot=i===2;
    s.addShape(pres.shapes.RECTANGLE,{x,y,w,h,fill:{color:hot?INK:PITH},line:{color:hot?INK:PITH,width:0}});
    T(s,c[0].toUpperCase(),{x:x+0.35,y:y+0.35,w:w-0.7,h:0.25,fontFace:H,fontSize:8.5,bold:true,charSpacing:2.5,color:O});
    T(s,c[1],{x:x+0.35,y:y+0.7,w:w-0.7,h:0.9,fontFace:H,fontSize:34,bold:true,color:hot?W:INK,charSpacing:-1});
    T(s,c[2],{x:x+0.35,y:y+1.75,w:w-0.7,h:1.7,fontFace:B,fontSize:12.5,color:hot?'EDE7E0':INK2});
  });
  notes(s,'Re-anchor the room in the signed scope before discussing the additional work.\n\n[Sources]\nOriginal BigOrange proposal and working packet.\n[/Sources]');
}
// ---------- 3 Expanded investment ----------
{ const s=pres.addSlide(); s.background={color:W}; chrome(s,3); head(s,'Expanded investment','What is now ready for review');
  const st=[['19','existing authority assets'],['5','separate new blogs'],['24','total authority assets'],['6,093','new blog words']];
  st.forEach((v,i)=>stat(s,0.6+i*1.72,2.75,1.6,2.0,v[0],v[1],i===3,v[0].length>3?28:36));
  card(s,7.6,2.75,5.13,3.85,'No-charge proof of commitment','More than the paid pilot','The five new blogs, deeper page-level optimization framework, six branded PDFs, implementation packaging and this leadership deck are included as additional proof of how invested I am in BigOrange and the work you deliver for clients.\n\nPublic release, imagery and factual claims still require BigOrange approval.',{dark:true,bodySize:12});
  T(s,'Additional work, delivered at no charge, on top of the signed 35 hour pilot.',{x:0.6,y:5.0,w:6.6,h:1.2,fontFace:H,fontSize:18,bold:true,color:INK});
  notes(s,'Use the no-charge language exactly as a statement of investment, not as an unlimited ongoing scope.\n\n[Sources]\nInternal BigOrange working package; September 2, 2026.\n[/Sources]');
}
// ---------- 4 Current state ----------
{ const s=pres.addSlide(); s.background={color:W}; chrome(s,4); head(s,'Current state','One system: crawlability, answers, proof and conversion');
  const st=[['370','published URLs'],['299','posts'],['71','pages'],['349','URLs in sitemap']];
  st.forEach((v,i)=>stat(s,0.6+i*1.72,2.75,1.6,2.0,v[0],v[1],i===0,36));
  card(s,7.6,2.75,5.13,3.85,'Private review boundary','Nothing new is public yet','The new blogs and collateral are staged for private review. Existing public content stays untouched until a named owner approves facts, images, metadata, links, schema and release timing.',{bodySize:12.5});
  const ic=await icon(I.FiLock,O); s.addImage({data:ic,x:0.6,y:5.1,w:0.5,h:0.5});
  T(s,'Current public builder hub remains unchanged.',{x:1.25,y:5.12,w:6,h:0.5,fontFace:H,fontSize:14,bold:true,color:INK,valign:'middle'});
  notes(s,'Make the governance boundary explicit. Current public hub remains unchanged.\n\n[Sources]\nSeptember 1, 2026 public crawl and WordPress inventory.\n[/Sources]');
}
// ---------- 5 Evidence baseline ----------
{ const s=pres.addSlide(); s.background={color:W}; chrome(s,5); head(s,'Evidence baseline','Where site health is leaking authority');
  const st=[['8','P0 priorities'],['38','P1 priorities'],['21','pages missing from sitemap'],['15','published nofollow pages']];
  st.forEach((v,i)=>stat(s,0.6+i*1.72,2.75,1.6,2.0,v[0],v[1],i===0,36));
  card(s,7.6,2.75,5.13,3.85,'Highest-impact fixes','Correct signals before scaling content','Fix the homepage “Stategic” typo across meta, Open Graph and schema. Reduce the AI services page from four H1s to one. Review nofollow page by page. Repair sitemap eligibility. Re-test the builder hub mobile critical path after media and script work.',{dark:true,bodySize:12});
  const ic=await icon(I.FiAlertTriangle,O); s.addImage({data:ic,x:0.6,y:5.1,w:0.5,h:0.5});
  T(s,'These affect interpretation, discovery, rendering or distribution.',{x:1.25,y:5.12,w:6.1,h:0.5,fontFace:H,fontSize:14,bold:true,color:INK,valign:'middle'});
  notes(s,'These are leverage fixes because they affect interpretation, discovery, rendering or distribution.\n\n[Sources]\nSeptember 1, 2026 public crawl.\nAugust 20, 2026 builder hub mobile performance sample.\n[/Sources]');
}
// ---------- 6 Technical priority (dark) ----------
{ const s=pres.addSlide(); s.background={color:INK}; chrome(s,6,true); head(s,'Technical priority','The builder hub has a performance problem, not a cosmetic one',true);
  s.addShape(pres.shapes.RECTANGLE,{x:0.6,y:2.75,w:3.6,h:3.3,fill:{color:O},line:{color:O,width:0}});
  T(s,'32',{x:0.85,y:2.95,w:3.1,h:1.7,fontFace:H,fontSize:96,bold:true,color:W,charSpacing:-4});
  T(s,'mobile performance sample',{x:0.85,y:5.2,w:3.1,h:0.6,fontFace:B,fontSize:12,color:W});
  s.addShape(pres.shapes.RECTANGLE,{x:4.45,y:2.75,w:3.6,h:3.3,fill:{color:INK2},line:{color:INK2,width:0}});
  T(s,'~36s',{x:4.7,y:2.95,w:3.2,h:1.7,fontFace:H,fontSize:80,bold:true,color:W,charSpacing:-4});
  T(s,'sample largest contentful paint',{x:4.7,y:5.2,w:3.1,h:0.6,fontFace:B,fontSize:12,color:SOFT});
  const ic=await icon(I.FiActivity,O); s.addImage({data:ic,x:8.55,y:2.8,w:0.55,h:0.55});
  T(s,'Re-measure after image sizing, format, preload, font, third-party script and critical CSS work. A single sample is a diagnostic baseline, not a permanent score.',{x:8.55,y:3.55,w:4.2,h:2.5,fontFace:B,fontSize:14,color:'EDE7E0'});
  notes(s,'Keep the language disciplined: sample, then remeasure.\n\n[Sources]\nAugust 20, 2026 builder hub mobile performance sample.\n[/Sources]');
}
// ---------- 7 Keyword truth ----------
{ const s=pres.addSlide(); s.background={color:W}; chrome(s,7); head(s,'Keyword truth','Protect what ranks. Build where the gaps are real.');
  const st=[['171','unique tracked keywords'],['27','positions 1–3'],['28','positions 4–10'],['93','unranked']];
  st.forEach((v,i)=>stat(s,0.6+i*1.72,2.75,1.6,1.85,v[0],v[1],i===3,34));
  card(s,7.6,2.75,5.13,1.85,'Builder lane','17 of 21 terms rank','Thirteen builder terms are already in positions 1–3, all pointing to the builder hub. That page remains the commercial owner.',{titleSize:15,bodySize:10.5});
  card(s,0.6,4.8,12.13,1.85,'Opportunity','Four exact gaps + one page-two term','Advertising for builders, home builder marketing solutions, home builder marketing automation, marketing ideas for homebuilders, and custom home builder marketing agency.',{dark:true,titleSize:15,bodySize:11.5});
  notes(s,'Moz is a dated snapshot, not a live ranking guarantee.\n\n[Sources]\nMoz snapshot dated August 14, 2026.\n[/Sources]');
}
// ---------- 8 Page contract ----------
{ const s=pres.addSlide(); s.background={color:W}; chrome(s,8); head(s,'Every indexable page','The page contract: ten layers, one accountable owner');
  const L=[['01','Intent','query family + job'],['02','Structure','one H1 + direct answer'],['03','Proof','author + approved evidence'],['04','Metadata','title + canonical + robots'],['05','AEO','definitions + concise answers'],
           ['06','GEO','entities + sources + context'],['07','Schema','only what content supports'],['08','Media','size + alt + permissions'],['09','Links','parent + siblings + action'],['10','Measurement','search to sales truth']];
  L.forEach((l,i)=>{const c=i%5,r=Math.floor(i/5); const x=0.6+c*2.45, y=2.7+r*1.95, w=2.3, h=1.75;
    s.addShape(pres.shapes.RECTANGLE,{x,y,w,h,fill:{color:i===9?O:PITH},line:{color:i===9?O:PITH,width:0}});
    T(s,l[0],{x:x+0.22,y:y+0.18,w:1.2,h:0.55,fontFace:H,fontSize:24,bold:true,color:i===9?W:O,charSpacing:-1});
    T(s,l[1],{x:x+0.22,y:y+0.78,w:w-0.4,h:0.35,fontFace:H,fontSize:13,bold:true,color:i===9?W:INK});
    T(s,l[2],{x:x+0.22,y:y+1.12,w:w-0.4,h:0.5,fontFace:B,fontSize:10.5,color:i===9?W:INK2});
  });
  notes(s,'This is the universal release contract. The wording and proof pattern still vary by template.\n\n[Sources]\nGoogle Search Central: creating helpful, reliable, people-first content.\nGoogle Search Central: Article structured data.\n[/Sources]');
}
// ---------- 9 Authority model ----------
{ const s=pres.addSlide(); s.background={color:W}; chrome(s,9); head(s,'Authority model','24 assets should behave like one system');
  const N=[['1','commercial builder hub',O,W],['5','new gap-led blogs',INK,W],['19','existing authority assets',PITH,INK],['CRM','qualified outcome truth',PEEL,INK]];
  N.forEach((n,i)=>{const x=0.6+i*3.1, y=2.75, w=2.7, h=2.6;
    s.addShape(pres.shapes.RECTANGLE,{x,y,w,h,fill:{color:n[2]},line:{color:n[2],width:0}});
    T(s,n[0],{x:x+0.25,y:y+0.2,w:w-0.5,h:1.4,fontFace:H,fontSize:n[0]==='CRM'?40:60,bold:true,color:n[3],charSpacing:-2,valign:'middle'});
    T(s,n[1],{x:x+0.25,y:y+1.75,w:w-0.5,h:0.7,fontFace:B,fontSize:12.5,color:n[3]});
    if(i<3){ s.addShape(pres.shapes.RECTANGLE,{x:x+w+0.13,y:y+1.22,w:0.14,h:0.14,fill:{color:O},line:{color:O,width:0}}); }
  });
  T(s,'Parent ownership prevents cannibalization. Contextual links move readers toward the right answer and the right next step.',{x:0.6,y:5.7,w:11,h:0.9,fontFace:H,fontSize:16,bold:true,color:INK});
  notes(s,'Explain that the service page remains the commercial destination while articles answer narrower questions.\n\n[Sources]\nBigOrange authority package inventory and internal-link map.\n[/Sources]');
}
// ---------- 10 Five blogs ----------
{ const s=pres.addSlide(); s.background={color:W}; chrome(s,10); head(s,'Five separate blogs','Each owns one verified gap');
  const Bl=[['BLOG 01','marketing ideas for homebuilders','11 ideas that build trust'],['BLOG 02','advertising for builders','where to spend + measure'],['BLOG 03','home builder marketing automation','7 follow-ups worth automating'],['BLOG 04','home builder marketing solutions','choose a system, not tactics'],['BLOG 05','custom home builder marketing agency','when to hire + how to judge']];
  Bl.forEach((b,i)=>{const x=0.6+i*2.45, y=2.75, w=2.3, h=3.75;
    s.addShape(pres.shapes.RECTANGLE,{x,y,w,h,fill:{color:PITH},line:{color:PITH,width:0}});
    s.addShape(pres.shapes.RECTANGLE,{x:x+0.22,y:y+0.25,w:0.22,h:0.22,fill:{color:O},line:{color:O,width:0}});
    T(s,String(i+1).padStart(2,'0'),{x:x+0.22,y:y+0.6,w:w-0.4,h:0.9,fontFace:H,fontSize:44,bold:true,color:INK,charSpacing:-2});
    T(s,b[0],{x:x+0.22,y:y+1.6,w:w-0.4,h:0.25,fontFace:H,fontSize:8,bold:true,charSpacing:2.5,color:O});
    T(s,b[1],{x:x+0.22,y:y+1.9,w:w-0.44,h:0.8,fontFace:B,fontSize:11,color:MUTE,italic:true});
    T(s,b[2],{x:x+0.22,y:y+2.7,w:w-0.44,h:0.9,fontFace:H,fontSize:13,bold:true,color:INK});
  });
  notes(s,'All five are complete standalone articles, not sections of one article.\n\n[Sources]\nFive-blog package manifest dated September 2, 2026.\n[/Sources]');
}
// ---------- 11 Answer-engine readiness ----------
{ const s=pres.addSlide(); s.background={color:W}; chrome(s,11); head(s,'Answer-engine readiness','What is baked into every blog');
  const Q=[['Answer first','Fast comprehension','A direct answer, definition and descriptive headings make the page easy for people and machines to parse.',I.FiZap],
           ['Decision support','Information gain','Tables, steps, tradeoffs and specific review questions create usefulness beyond generic summaries.',I.FiGrid],
           ['Trust','Proof boundaries','Current sources, explicit caveats, named review gates and no invented results or guarantees.',I.FiShield],
           ['Machine context','Structured data','BlogPosting and Breadcrumb candidates mirror visible content. FAQs stay reader-first without a rich-result promise.',I.FiCode]];
  for(let i=0;i<4;i++){const c=i%2,r=Math.floor(i/2); const x=0.6+c*6.15, y=2.7+r*1.98, w=5.98, h=1.82;
    s.addShape(pres.shapes.RECTANGLE,{x,y,w,h,fill:{color:PITH},line:{color:PITH,width:0}});
    s.addShape(pres.shapes.OVAL,{x:x+0.28,y:y+0.3,w:0.7,h:0.7,fill:{color:O},line:{color:O,width:0}});
    const ic=await icon(Q[i][3],W); s.addImage({data:ic,x:x+0.45,y:y+0.47,w:0.36,h:0.36});
    T(s,Q[i][0].toUpperCase(),{x:x+1.2,y:y+0.28,w:w-1.45,h:0.24,fontFace:H,fontSize:8,bold:true,charSpacing:2.5,color:O});
    T(s,Q[i][1],{x:x+1.2,y:y+0.52,w:w-1.45,h:0.4,fontFace:H,fontSize:15,bold:true,color:INK});
    T(s,Q[i][2],{x:x+1.2,y:y+0.95,w:w-1.45,h:0.8,fontFace:B,fontSize:11,color:INK2});
  }
  notes(s,'Visible usefulness comes first. Schema supports interpretation; it does not manufacture authority.\n\n[Sources]\nGoogle Search Central: creating helpful, reliable, people-first content.\nGoogle Search Central: Article structured data.\n[/Sources]');
}
// ---------- 12 WordPress backend flow ----------
{ const s=pres.addSlide(); s.background={color:W}; chrome(s,12); head(s,'WordPress backend','Draft → review → release → verify');
  const F=[['Draft','post, slug, author, category'],['Review','facts, links, images, permissions'],['SEO QA','meta, canonical, robots, one H1'],['Render QA','mobile, keyboard, forms, speed'],['Release','approved timing + owner'],['Verify','schema, sitemap, URL inspection']];
  F.forEach((f,i)=>{const x=0.6+i*2.04, y=2.75, w=1.9, h=2.7; const hot=i===4;
    s.addShape(pres.shapes.RECTANGLE,{x,y,w,h,fill:{color:hot?O:INK},line:{color:hot?O:INK,width:0}});
    T(s,String(i+1),{x:x+0.22,y:y+0.2,w:1,h:0.7,fontFace:H,fontSize:30,bold:true,color:hot?W:O});
    T(s,f[0].toUpperCase(),{x:x+0.22,y:y+1.05,w:w-0.4,h:0.3,fontFace:H,fontSize:10,bold:true,charSpacing:2,color:W});
    T(s,f[1],{x:x+0.22,y:y+1.4,w:w-0.4,h:1.1,fontFace:B,fontSize:10.5,color:hot?W:'EDE7E0'});
    if(i<5) s.addShape(pres.shapes.RECTANGLE,{x:x+w+0.02,y:y+1.28,w:0.1,h:0.1,fill:{color:O},line:{color:O,width:0}});
  });
  const ic=await icon(I.FiEyeOff,O); s.addImage({data:ic,x:0.6,y:5.85,w:0.5,h:0.5});
  T(s,'No draft enters the sitemap. No public publish occurs without a named release owner.',{x:1.25,y:5.78,w:10.5,h:0.65,fontFace:H,fontSize:15,bold:true,color:INK,valign:'middle'});
  notes(s,'This is the private WordPress staging gate. Emphasize reversible drafts and explicit approval.\n\n[Sources]\nInternal BigOrange working package; September 2, 2026.\n[/Sources]');
}
// ---------- 13 Measurement chain ----------
{ const s=pres.addSlide(); s.background={color:W}; chrome(s,13); head(s,'Measurement','Rankings become useful when they connect to sales truth');
  const C=[['Discovery','query + landing page'],['Engagement','useful next behavior'],['Action','verified hand raise'],['Qualification','sales acceptance'],['Outcome','opportunity + revenue']];
  C.forEach((c,i)=>{const x=0.6+i*2.45, y=2.75, w=2.3, h=2.6; const hot=i===4;
    s.addShape(pres.shapes.RECTANGLE,{x,y,w,h,fill:{color:hot?O:PITH},line:{color:hot?O:PITH,width:0}});
    T(s,String(i+1),{x:x+0.22,y:y+0.2,w:1,h:0.75,fontFace:H,fontSize:34,bold:true,color:hot?W:O});
    T(s,c[0].toUpperCase(),{x:x+0.22,y:y+1.1,w:w-0.4,h:0.3,fontFace:H,fontSize:10,bold:true,charSpacing:2,color:hot?W:INK});
    T(s,c[1],{x:x+0.22,y:y+1.45,w:w-0.4,h:0.9,fontFace:B,fontSize:11.5,color:hot?W:INK2});
    if(i<4) s.addShape(pres.shapes.RECTANGLE,{x:x+w+0.03,y:y+1.25,w:0.1,h:0.1,fill:{color:O},line:{color:O,width:0}});
  });
  s.addShape(pres.shapes.RECTANGLE,{x:0.6,y:5.65,w:12.13,h:0.75,fill:{color:INK},line:{color:INK,width:0}});
  T(s,'Search Console  +  analytics  +  verified events  +  CRM source  +  sales feedback',{x:0.9,y:5.65,w:11.5,h:0.75,fontFace:H,fontSize:13,bold:true,color:W,valign:'middle'});
  notes(s,'Do not equate a rank or a view with revenue. Preserve the chain.\n\n[Sources]\nInternal BigOrange working package; September 2, 2026.\n[/Sources]');
}
// ---------- 14 90-day rollout ----------
{ const s=pres.addSlide(); s.background={color:W}; chrome(s,14); head(s,'90-day rollout','Repair first. Release in waves. Learn before scaling.');
  const R=[['Days 1–14','Fix P0/P1 + approve facts and imagery'],['Days 15–30','Release first two + verify events and indexing'],['Days 31–60','Release remaining three + strengthen proof'],['Days 61–90','Review query ownership + qualified demand']];
  R.forEach((r,i)=>{const x=0.6+i*3.1, y=2.75, w=2.9, h=2.75; const hot=i===0;
    s.addShape(pres.shapes.RECTANGLE,{x,y,w,h,fill:{color:hot?O:PITH},line:{color:hot?O:PITH,width:0}});
    T(s,String(i+1).padStart(2,'0'),{x:x+0.25,y:y+0.2,w:1.5,h:0.9,fontFace:H,fontSize:40,bold:true,color:hot?W:INK,charSpacing:-2});
    T(s,r[0].toUpperCase(),{x:x+0.25,y:y+1.2,w:w-0.5,h:0.3,fontFace:H,fontSize:10,bold:true,charSpacing:2,color:hot?W:O});
    T(s,r[1],{x:x+0.25,y:y+1.55,w:w-0.5,h:1.1,fontFace:B,fontSize:12.5,color:hot?W:INK2});
  });
  T(s,'12-month scale: expand only where Search Console, client questions and sales feedback justify the next asset.',{x:0.6,y:5.8,w:11.8,h:0.7,fontFace:H,fontSize:14,bold:true,color:INK,valign:'middle'});
  notes(s,'The cadence is deliberately controlled so the team can learn and protect existing rankings.\n\n[Sources]\nInternal BigOrange working package; September 2, 2026.\n[/Sources]');
}
// ---------- 15 Thursday close (dark) ----------
{ const s=pres.addSlide(); s.background={color:INK}; chrome(s,15,true); head(s,'Thursday close','Seven decisions that unlock the work',true);
  const D=['Approve the five topics and keyword ownership','Name the factual reviewer','Approve or replace image briefs','Assign the technical repair sprint','Choose the first two releases','Confirm web-to-CRM measurement','Decide whether to scope Phase 2'];
  D.forEach((d,i)=>{const c=i%4,r=Math.floor(i/4); const x=0.6+c*3.1, y=2.65+r*1.55, w=2.9, h=1.4; const hot=i===6;
    s.addShape(pres.shapes.RECTANGLE,{x,y,w,h,fill:{color:hot?O:INK2},line:{color:hot?O:INK2,width:0}});
    T(s,String(i+1).padStart(2,'0'),{x:x+0.22,y:y+0.15,w:1,h:0.5,fontFace:H,fontSize:20,bold:true,color:hot?W:O});
    T(s,d,{x:x+0.22,y:y+0.6,w:w-0.44,h:0.75,fontFace:H,fontSize:11.5,bold:true,color:W});
  });
  s.addShape(pres.shapes.RECTANGLE,{x:9.9,y:4.2,w:2.83,h:1.4,fill:{color:INK},line:{color:INK,width:0}});
  T(s,'The goal is a named owner, a release sequence and a measurement contract — not a longer idea list.',{x:0.6,y:5.85,w:11.8,h:0.7,fontFace:B,fontSize:14,color:'EDE7E0',valign:'middle'});
  notes(s,'Close by assigning owners and the first release dates. Keep Phase 2 as a separate commercial decision.\n\n[Sources]\nInternal BigOrange working package; September 2, 2026.\n[/Sources]');
}
await pres.writeFile({fileName:'out/BigOrange-Thursday-WordPress-Growth-Review-2026-09-03.pptx'}); console.log('deck written');
})().catch(e=>{console.error(e);process.exit(1)});
