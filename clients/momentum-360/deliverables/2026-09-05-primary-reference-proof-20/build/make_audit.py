import pathlib,json
R=pathlib.Path(__file__).resolve().parents[1]
slugs=[x['slug'] for x in json.loads((R/'sources/manifest.json').read_text())['records']]
doc='''<!doctype html><meta charset="utf-8"><title>Homepage verification</title><style>body{font:16px system-ui;padding:30px;background:#f7f7f2;color:#192c24}pre{white-space:pre-wrap}iframe{position:absolute;left:-9000px;top:0;border:0}button{padding:14px}</style><h1>Homepage verification</h1><p id="state">Running desktop, mobile and 4K layout checks…</p><pre id="result"></pre><script>
const slugs=SLUGS,widths=[360,390,768,1440,3840],results=[];
const jobs=slugs.flatMap(slug=>widths.map(width=>({slug,width})));let next=0;
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function check({slug,width}){
 const f=document.createElement('iframe');f.width=width;f.height=900;f.src='/sites/'+slug+'/';document.body.append(f);
 await new Promise((r,j)=>{f.onload=r;setTimeout(r,7000)});const w=f.contentWindow,d=f.contentDocument;await d.fonts.ready;await delay(130);
 const issues=[];const rect=e=>e.getBoundingClientRect();
 if(d.documentElement.scrollWidth>width+1)issues.push('horizontal overflow '+d.documentElement.scrollWidth);
 if(d.querySelectorAll('h1').length!==1)issues.push('heading count');
 if(d.querySelectorAll('.spatial-illo').length!==3)issues.push('illustration count');
 if(d.querySelectorAll('.opening-photo>img').length!==1)issues.push('opening photo count');
 if([...d.images].some(i=>!i.complete||!i.naturalWidth))issues.push('image not loaded');
 for(const e of d.querySelectorAll('h1,h2,h3,.identity-caption,.identity-actions,.service-copy,.footer .content')){
  const b=rect(e);if(b.width>0&&(b.left< -1||b.right>width+1))issues.push('content outside viewport: '+e.tagName+' '+e.className);
  if(e.scrollWidth>e.clientWidth+2&&e.clientWidth>0)issues.push('text overflow: '+e.textContent.slice(0,35));
 }
 const menu=d.querySelector('#nav-icon3');menu.click();if(menu.getAttribute('aria-expanded')!=='true'||d.querySelector('#mainnav').inert)issues.push('menu did not open');
 d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));if(menu.getAttribute('aria-expanded')!=='false'||!d.querySelector('#mainnav').inert)issues.push('menu did not close');
 const acc=d.querySelector('.accordion-button');acc.click();if(acc.getAttribute('aria-expanded')!=='true')issues.push('accordion did not open');acc.click();if(acc.getAttribute('aria-expanded')!=='false')issues.push('accordion did not close');
 w.scrollTo({top:900,behavior:'instant'});await delay(80);if(!d.querySelector('.header').classList.contains('animated'))issues.push('header logo did not swap');
 const err=w.__ERR__||[];issues.push(...err);
 const result={slug,width,issues,logos:d.querySelectorAll('img[alt$="logo"]').length,footer_font:w.getComputedStyle(d.querySelector('.footer h2')).fontSize,logo_motion:w.getComputedStyle(d.querySelector('.home_logo img')).animationName};
 results.push(result);f.remove();document.querySelector('#state').textContent=results.length+' / '+jobs.length+' checks complete';
}
Promise.all(Array.from({length:3},async()=>{while(next<jobs.length){try{await check(jobs[next++])}catch(e){results.push({error:String(e)})}}})).then(()=>{
 window.auditResults={checks:results.length,failed:results.filter(x=>x.error||x.issues?.length),results};document.querySelector('#result').textContent=JSON.stringify(window.auditResults,null,2);document.querySelector('#state').textContent='COMPLETE: '+results.length+' layouts; '+window.auditResults.failed.length+' need attention';
});</script>'''.replace('SLUGS',json.dumps(slugs))
(R/'dist/qa.html').write_text(doc)
