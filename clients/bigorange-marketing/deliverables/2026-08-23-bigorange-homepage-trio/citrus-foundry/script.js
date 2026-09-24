(function(){
  'use strict';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const toggle=document.querySelector('.menu-toggle');
  const nav=document.getElementById('site-nav');
  if(toggle&&nav){toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);document.body.classList.toggle('menu-open',open)});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{toggle.setAttribute('aria-expanded','false');nav.classList.remove('is-open');document.body.classList.remove('menu-open')}));addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('is-open')){toggle.click();toggle.focus()}})}
  document.querySelectorAll('details').forEach(d=>d.addEventListener('toggle',()=>{if(!d.open)return;document.querySelectorAll('details[open]').forEach(o=>{if(o!==d)o.open=false})}));
  const stage=document.querySelector('.particle-stage');
  const canvas=document.getElementById('foundry-particles');
  if(!stage||!canvas||reduced){stage?.classList.add('is-settled');return}
  const ctx=canvas.getContext('2d',{alpha:true});
  const source=new Image();source.src=stage.dataset.particleLogo;
  let particles=[],start=0,raf=0,pointer={x:-9999,y:-9999};
  function fit(){const r=stage.getBoundingClientRect();const d=Math.min(devicePixelRatio||1,2);canvas.width=Math.max(1,Math.floor(r.width*d));canvas.height=Math.max(1,Math.floor(r.height*d));ctx.setTransform(d,0,0,d,0,0);return r}
  function build(){const r=fit();const w=r.width,h=r.height,off=document.createElement('canvas'),o=off.getContext('2d');const ratio=source.width/source.height;let dw=w*.72,dh=dw/ratio;if(dh>h*.7){dh=h*.7;dw=dh*ratio}off.width=Math.ceil(w);off.height=Math.ceil(h);const ox=(w-dw)/2,oy=(h-dh)/2;o.drawImage(source,ox,oy,dw,dh);const data=o.getImageData(0,0,off.width,off.height).data;particles=[];const step=Math.max(3,Math.round(w/220));for(let y=0;y<off.height;y+=step){for(let x=0;x<off.width;x+=step){const a=data[(y*off.width+x)*4+3];if(a>100&&Math.random()>.14)particles.push({x:w+Math.random()*w*.55,y:Math.random()*h,tx:x,ty:y,vx:-1-Math.random()*2,vy:(Math.random()-.5)*1.2,size:.65+Math.random()*1.7,delay:(x/w)*460+Math.random()*440})}}start=performance.now();cancelAnimationFrame(raf);animate(start)}
  function animate(now){const r=stage.getBoundingClientRect(),w=r.width,h=r.height;ctx.clearRect(0,0,w,h);const elapsed=now-start;let settled=0;for(const p of particles){const local=Math.max(0,elapsed-p.delay);if(local>0){const dx=p.tx-p.x,dy=p.ty-p.y,dist=Math.hypot(dx,dy)||1;const pdx=p.x-pointer.x,pdy=p.y-pointer.y,pdist=Math.hypot(pdx,pdy)||9999;if(pdist<70){p.vx+=pdx/pdist*1.7;p.vy+=pdy/pdist*1.7}const force=Math.min(.065,.009+local/42000);p.vx=p.vx*.9+dx*force;p.vy=p.vy*.9+dy*force;p.x+=p.vx;p.y+=p.vy;if(dist<1.6){settled++;p.x+=(p.tx-p.x)*.35;p.y+=(p.ty-p.y)*.35}}ctx.fillStyle=`rgba(255,118,0,${Math.min(1,.35+local/900)})`;ctx.fillRect(p.x,p.y,p.size,p.size)}if(settled>particles.length*.8||elapsed>4200)stage.classList.add('is-settled');if(elapsed<7600)raf=requestAnimationFrame(animate)}
  stage.addEventListener('pointermove',e=>{const r=stage.getBoundingClientRect();pointer={x:e.clientX-r.left,y:e.clientY-r.top}});stage.addEventListener('pointerleave',()=>pointer={x:-9999,y:-9999});source.onload=build;let resizeTimer;addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(build,180)},{passive:true});
})();
