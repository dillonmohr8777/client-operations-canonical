import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const pkg = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(.:)/,"$1")), "..");
const assets = path.resolve(pkg, "..", "2026-07-16-capability-showcase", "assets");
const out = path.join(pkg, "output", "pptx");
const render = path.join(pkg, "tmp", "pptx-render");
await fs.mkdir(out,{recursive:true}); await fs.mkdir(render,{recursive:true});

const C={orange:"#F36F21",deep:"#2A1308",ink:"#1D1B19",slate:"#615B55",paper:"#FFF9F3",cream:"#F4E8DC",pale:"#FFE6D4",white:"#FFFFFF",green:"#197A4A",red:"#A83824"};
const W=1280,H=720;
const deck=Presentation.create({slideSize:{width:W,height:H}});
const logoOrange=await fs.readFile(path.join(assets,"bigorange-logo-orange.png"));
const logoWhite=await fs.readFile(path.join(assets,"bigorange-logo-white.png"));
const imgBrand=await fs.readFile(path.join(assets,"bigorange-instagram-brand-team.jpg"));
const imgAeo=await fs.readFile(path.join(assets,"bigorange-instagram-aeo.jpg"));
const imgStory=await fs.readFile(path.join(assets,"bigorange-instagram-story.jpg"));

function rect(slide,x,y,w,h,fill,r=18,line="none") { return slide.shapes.add({geometry:r?"roundRect":"rect",position:{left:x,top:y,width:w,height:h},fill,line:{style:"solid",fill:line,width:line==="none"?0:1},borderRadius:r?"rounded-xl":undefined}); }
function text(slide,txt,x,y,w,h,size=24,color=C.ink,bold=false,align="left") { const s=slide.shapes.add({geometry:"textbox",position:{left:x,top:y,width:w,height:h},fill:"none",line:{style:"solid",fill:"none",width:0}}); s.text=txt; s.text.style={fontFamily:"Arial",fontSize:size,color,bold,alignment:align,verticalAlignment:"middle"}; return s; }
function line(slide,x,y,w,color=C.orange,width=3){ return rect(slide,x,y,w,width,color,0); }
function logo(slide,dark=false,x=1035,y=34,w=170,h=52){ const b=dark?logoWhite:logoOrange; slide.images.add({blob:b,contentType:"image/png",alt:"BigOrange.Marketing logo",fit:"contain",position:{left:x,top:y,width:w,height:h}}); }
function base(kicker,title,n,{dark=false}={}){ const s=deck.slides.add(); s.background.fill=dark?C.deep:C.paper; logo(s,dark); text(s,kicker.toUpperCase(),64,38,690,26,13,dark?C.orange:C.orange,true); text(s,title,64,78,1030,82,34,dark?C.white:C.ink,true); line(s,64,166,112, C.orange,5); text(s,String(n).padStart(2,"0"),1170,650,48,24,12,dark?C.cream:C.slate,true,"right"); return s; }
function note(s,body,sources=[]){ s.speakerNotes.textFrame.setText(`${body}\n\n[Sources]\n${sources.length?sources.join("\n"):"Internal BigOrange working package; September 2, 2026."}\n[/Sources]`); }
function card(s,x,y,w,h,eyebrow,headline,body,{fill=C.white,accent=C.orange}={}){ rect(s,x,y,w,h,fill,18,"#E3D5C9"); rect(s,x,y,8,h,accent,18); text(s,eyebrow.toUpperCase(),x+26,y+18,w-48,24,12,accent,true); text(s,headline,x+26,y+50,w-48,55,25,C.ink,true); text(s,body,x+26,y+112,w-48,h-130,15,C.slate,false); }
function metric(s,x,y,value,label,accent=C.orange){ rect(s,x,y,245,130,C.white,18,"#E3D5C9"); text(s,value,x+18,y+15,209,55,39,accent,true,"center"); text(s,label,x+22,y+72,201,42,14,C.slate,true,"center"); }
function pill(s,txt,x,y,w,fill=C.pale,color=C.deep){ rect(s,x,y,w,34,fill,17,"none"); text(s,txt,x+10,y+2,w-20,30,12,color,true,"center"); }
function imagePanel(s,bytes,alt,x,y,w,h){ s.images.add({blob:bytes,contentType:"image/jpeg",alt,fit:"cover",position:{left:x,top:y,width:w,height:h},geometry:"roundRect",borderRadius:"rounded-xl"}); }

// 1
{
 const s=deck.slides.add(); s.background.fill=C.deep; logo(s,true,70,55,220,66); pill(s,"THURSDAY LEADERSHIP REVIEW",70,160,240,C.orange,C.white); text(s,"WordPress growth,\nmade operational.",70,220,670,170,54,C.white,true); text(s,"A 370 URL technical plan, a 24 asset authority system, five new builder blogs, and the release controls that turn content into qualified demand.",70,420,650,108,20,C.cream,false); imagePanel(s,imgAeo,"BigOrange AEO social creative",830,120,360,430); text(s,"September 3, 2026",70,620,260,28,14,C.cream,true); note(s,"Open with the decision: this is a controlled growth system, not a publish-everything content dump.");
}
// 2
{
 const s=base("Original agreement","What the paid pilot actually asked for",2); card(s,64,210,340,360,"Milestone 1","15 hours","Discovery, audit, keyword and content strategy, architecture, priorities and implementation planning."); card(s,430,210,340,360,"Milestone 2","20 hours","One pillar page, two supporting articles, technical SEO and WordPress implementation support."); card(s,796,210,420,360,"Commercial frame","$1,050 total","35 hours at $30 per hour. Phase 2 social, downloadable and webinar production remained a future scope, not part of the paid pilot.",{fill:C.pale}); note(s,"Re-anchor the room in the signed scope before discussing the additional work.",["Original BigOrange proposal and working packet."]);
}
// 3
{
 const s=base("Expanded investment","What is now ready for review",3); metric(s,64,220,"19","existing authority assets"); metric(s,329,220,"5","separate new blogs"); metric(s,594,220,"24","total authority assets"); metric(s,859,220,"6,093","new blog words"); card(s,64,390,1040,190,"No-charge proof of commitment","More than the paid pilot","The five new blogs, deeper page-level optimization framework, six branded PDFs, implementation packaging and this leadership deck are included as additional proof of how invested I am in BigOrange and the work you deliver for clients.",{fill:C.deep,accent:C.orange}); text(s,"Public release, imagery and factual claims still require BigOrange approval.",100,545,960,35,14,C.white,true,"center"); note(s,"Use the no-charge language exactly as a statement of investment, not as an unlimited ongoing scope.");
}
// 4
{
 const s=base("Current state","One system: crawlability, answers, proof and conversion",4); metric(s,64,215,"370","published URLs"); metric(s,329,215,"299","posts"); metric(s,594,215,"71","pages"); metric(s,859,215,"349","URLs in sitemap"); card(s,64,385,1120,190,"Private review boundary","Nothing new is public yet","The new blogs and collateral are staged for private review. Existing public content stays untouched until a named owner approves facts, images, metadata, links, schema and release timing.",{fill:C.white}); note(s,"Make the governance boundary explicit. Current public hub remains unchanged.",["September 1, 2026 public crawl and WordPress inventory."]);
}
// 5
{
 const s=base("Evidence baseline","Where site health is leaking authority",5); metric(s,64,220,"8","P0 priorities",C.red); metric(s,329,220,"38","P1 priorities",C.orange); metric(s,594,220,"21","pages missing from sitemap",C.red); metric(s,859,220,"15","published nofollow pages",C.red); card(s,64,395,1120,175,"Highest-impact fixes","Correct signals before scaling content","Fix the homepage “Stategic” typo across meta, Open Graph and schema. Reduce the AI services page from four H1s to one. Review nofollow page by page. Repair sitemap eligibility. Re-test the builder hub mobile critical path after media and script work.",{fill:C.pale}); note(s,"These are leverage fixes because they affect interpretation, discovery, rendering or distribution.",["September 1, 2026 public crawl.","August 20, 2026 builder hub mobile performance sample."]);
}
// 6
{
 const s=base("Technical priority","The builder hub has a performance problem, not a cosmetic one",6,{dark:true}); text(s,"32",72,225,300,120,92,C.orange,true); text(s,"mobile performance sample",78,345,330,35,18,C.white,true); text(s,"~36s",470,225,300,120,92,C.orange,true); text(s,"sample largest contentful paint",470,345,350,35,18,C.white,true); imagePanel(s,imgBrand,"BigOrange brand team social creative",880,215,300,300); text(s,"Re-measure after image sizing, format, preload, font, third-party script and critical CSS work. A single sample is a diagnostic baseline, not a permanent score.",72,470,710,100,20,C.cream,false); note(s,"Keep the language disciplined: sample, then remeasure.",["August 20, 2026 builder hub mobile performance sample."]);
}
// 7
{
 const s=base("Keyword truth","Protect what ranks. Build where the gaps are real.",7); metric(s,64,205,"171","unique tracked keywords"); metric(s,329,205,"27","positions 1–3",C.green); metric(s,594,205,"28","positions 4–10",C.green); metric(s,859,205,"93","unranked",C.red); card(s,64,370,545,210,"Builder lane","17 of 21 terms rank","Thirteen builder terms are already in positions 1–3, all pointing to the builder hub. That page remains the commercial owner."); card(s,635,370,549,210,"Opportunity","Four exact gaps + one page-two term","Advertising for builders, home builder marketing solutions, home builder marketing automation, marketing ideas for homebuilders, and custom home builder marketing agency.",{fill:C.pale}); note(s,"Moz is a dated snapshot, not a live ranking guarantee.",["Moz snapshot dated August 14, 2026."]);
}
// 8
{
 const s=base("Every indexable page","The page contract: ten layers, one accountable owner",8); const items=[["01","Intent","query family + job"],["02","Structure","one H1 + direct answer"],["03","Proof","author + approved evidence"],["04","Metadata","title + canonical + robots"],["05","AEO","definitions + concise answers"],["06","GEO","entities + sources + context"],["07","Schema","only what content supports"],["08","Media","size + alt + permissions"],["09","Links","parent + siblings + action"],["10","Measurement","search to sales truth"]]; items.forEach((it,i)=>{const col=i%5,row=Math.floor(i/5); card(s,64+col*226,205+row*185,208,160,it[0],it[1],it[2],{fill:row?C.pale:C.white});}); note(s,"This is the universal release contract. The wording and proof pattern still vary by template.",["Google Search Central: creating helpful, reliable, people-first content.","Google Search Central: Article structured data."]);
}
// 9
{
 const s=base("Authority model","24 assets should behave like one system",9,{dark:true}); text(s,"1",75,230,120,90,70,C.orange,true,"center"); text(s,"commercial builder hub",65,325,150,55,16,C.white,true,"center"); line(s,220,275,170,C.orange,4); text(s,"5",420,230,120,90,70,C.orange,true,"center"); text(s,"new gap-led blogs",405,325,150,55,16,C.white,true,"center"); line(s,550,275,170,C.orange,4); text(s,"19",750,230,160,90,70,C.orange,true,"center"); text(s,"existing authority assets",745,325,170,55,16,C.white,true,"center"); line(s,920,275,170,C.orange,4); text(s,"CRM",1090,240,130,70,38,C.orange,true,"center"); text(s,"qualified outcome truth",1085,325,140,55,16,C.white,true,"center"); text(s,"Parent ownership prevents cannibalization. Contextual links move readers toward the right answer and the right next step.",150,500,980,70,23,C.cream,true,"center"); note(s,"Explain that the service page remains the commercial destination while articles answer narrower questions.",["BigOrange authority package inventory and internal-link map."]);
}
// 10
{
 const s=base("Five separate blogs","Each owns one verified gap",10); const titles=[["BLOG 01","marketing ideas for homebuilders","11 ideas that build trust"],["BLOG 02","advertising for builders","where to spend + measure"],["BLOG 03","home builder marketing automation","7 follow-ups worth automating"],["BLOG 04","home builder marketing solutions","choose a system, not tactics"],["BLOG 05","custom home builder marketing agency","when to hire + how to judge"]]; titles.forEach((t,i)=>{const y=195+i*88; pill(s,t[0],64,y,105,C.orange,C.white); text(s,t[1],190,y,370,34,16,C.deep,true); text(s,t[2],590,y,590,34,20,C.ink,true); line(s,190,y+51,990,"#E2D5CA",1);}); note(s,"All five are complete standalone articles, not sections of one article.",["Five-blog package manifest dated September 2, 2026."]);
}
// 11
{
 const s=base("Answer-engine readiness","What is baked into every blog",11); imagePanel(s,imgStory,"BigOrange story social creative",64,205,360,360); card(s,455,205,350,170,"Answer first","Fast comprehension","A direct answer, definition and descriptive headings make the page easy for people and machines to parse."); card(s,830,205,350,170,"Decision support","Information gain","Tables, steps, tradeoffs and specific review questions create usefulness beyond generic summaries.",{fill:C.pale}); card(s,455,400,350,170,"Trust","Proof boundaries","Current sources, explicit caveats, named review gates and no invented results or guarantees.",{fill:C.pale}); card(s,830,400,350,170,"Machine context","Structured data","BlogPosting and Breadcrumb candidates mirror visible content. FAQs stay reader-first without a rich-result promise."); note(s,"Visible usefulness comes first. Schema supports interpretation; it does not manufacture authority.",["Google Search Central: creating helpful, reliable, people-first content.","Google Search Central: Article structured data."]);
}
// 12
{
 const s=base("WordPress backend","Draft → review → release → verify",12); const steps=[["1","DRAFT","post, slug, author, category"],["2","REVIEW","facts, links, images, permissions"],["3","SEO QA","meta, canonical, robots, one H1"],["4","RENDER QA","mobile, keyboard, forms, speed"],["5","RELEASE","approved timing + owner"],["6","VERIFY","schema, sitemap, URL inspection"]]; steps.forEach((v,i)=>{const x=64+i*188; rect(s,x,250,166,190,i<2?C.pale:C.white,18,"#E3D5C9"); text(s,v[0],x+18,268,46,46,28,C.orange,true,"center"); text(s,v[1],x+18,322,130,28,15,C.deep,true,"center"); text(s,v[2],x+16,362,134,62,13,C.slate,false,"center"); if(i<5) text(s,"→",x+165,312,24,35,25,C.orange,true,"center");}); text(s,"No draft enters the sitemap. No public publish occurs without a named release owner.",160,500,960,55,24,C.deep,true,"center"); note(s,"This is the private WordPress staging gate. Emphasize reversible drafts and explicit approval.");
}
// 13
{
 const s=base("Measurement","Rankings become useful when they connect to sales truth",13,{dark:true}); const chain=[["DISCOVERY","query + landing page"],["ENGAGEMENT","useful next behavior"],["ACTION","verified hand raise"],["QUALIFICATION","sales acceptance"],["OUTCOME","opportunity + revenue"]]; chain.forEach((v,i)=>{const x=64+i*235; rect(s,x,245,205,180,i===4?C.orange:"#4A2A19",18,i===4?C.orange:"#6B4029"); text(s,String(i+1),x+18,260,45,45,26,i===4?C.white:C.orange,true,"center"); text(s,v[0],x+20,315,165,32,15,C.white,true,"center"); text(s,v[1],x+20,360,165,50,14,C.cream,false,"center"); if(i<4) text(s,"→",x+204,310,31,40,25,C.orange,true,"center");}); text(s,"Search Console + analytics + verified events + CRM source + sales feedback",150,500,980,50,22,C.cream,true,"center"); note(s,"Do not equate a rank or a view with revenue. Preserve the chain.");
}
// 14
{
 const s=base("90-day rollout","Repair first. Release in waves. Learn before scaling.",14); const phases=[["DAYS 1–14","Fix P0/P1 + approve facts and imagery",C.red],["DAYS 15–30","Release first two + verify events and indexing",C.orange],["DAYS 31–60","Release remaining three + strengthen proof",C.green],["DAYS 61–90","Review query ownership + qualified demand",C.deep]]; phases.forEach((p,i)=>{const x=64+i*280; rect(s,x,225,250,250,C.white,18,"#E3D5C9"); rect(s,x,225,250,12,p[2],18); text(s,p[0],x+18,260,214,32,16,p[2],true,"center"); text(s,p[1],x+24,318,202,92,21,C.ink,true,"center"); text(s,`0${i+1}`,x+90,440,70,45,28,C.slate,true,"center");}); text(s,"12-month scale: expand only where Search Console, client questions and sales feedback justify the next asset.",100,535,1080,58,20,C.deep,true,"center"); note(s,"The cadence is deliberately controlled so the team can learn and protect existing rankings.");
}
// 15
{
 const s=base("Thursday close","Seven decisions that unlock the work",15,{dark:true}); const decisions=["Approve the five topics and keyword ownership","Name the factual reviewer","Approve or replace image briefs","Assign the technical repair sprint","Choose the first two releases","Confirm web-to-CRM measurement","Decide whether to scope Phase 2"]; decisions.forEach((d,i)=>{const col=i<4?0:1,row=i<4?i:i-4; const x=70+col*580,y=205+row*86; pill(s,String(i+1).padStart(2,"0"),x,y,56,C.orange,C.white); text(s,d,x+75,y,470,36,19,C.white,true);}); text(s,"The goal is a named owner, a release sequence and a measurement contract — not a longer idea list.",100,590,1080,52,23,C.cream,true,"center"); note(s,"Close by assigning owners and the first release dates. Keep Phase 2 as a separate commercial decision.");
}

for (const [i,s] of deck.slides.items.entries()) {
  const stem=`slide-${String(i+1).padStart(2,"0")}`;
  const png=await deck.export({slide:s,format:"png",scale:1});
  await fs.writeFile(path.join(render,`${stem}.png`),new Uint8Array(await png.arrayBuffer()));
  const layout=await s.export({format:"layout"});
  await fs.writeFile(path.join(render,`${stem}.layout.json`),await layout.text());
}
const montage=await deck.export({format:"png",montage:true,scale:0.45});
await fs.writeFile(path.join(render,"deck-montage.png"),new Uint8Array(await montage.arrayBuffer()));
const pptx=await PresentationFile.exportPptx(deck);
const dest=path.join(out,"BigOrange-Thursday-WordPress-Growth-Review-2026-09-03.pptx");
await pptx.save(dest);
console.log(JSON.stringify({slides:deck.slides.items.length,output:dest},null,2));
