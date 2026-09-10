/* Exact Puttery glyphs are revealed by the same path travelled by the ball.
   Hand-drawn golfer and ink choreography are deterministic, with no video. */
(() => {
  let active;
  window.playPutteryChampionIntro = ({onFallback,onStarted,exportMode=false}={}) => {
    const spec=window.PUTTERY_INTRO_MEDIA?.champion;
    if(!spec?.src||matchMedia('(prefers-reduced-motion: reduce)').matches)return false;
    active?.close(false);
    const previous=document.activeElement,stage=document.createElement('div');
    stage.className='champion-intro'+(exportMode?' export-intro':'');stage.setAttribute('role','dialog');stage.setAttribute('aria-modal','true');stage.setAttribute('aria-label','Puttery hand-drawn introduction');
    stage.innerHTML='<div class="sketch-scene"></div><div class="champion-intro-controls"><button type="button" class="champion-pause" aria-pressed="false">Pause intro</button><button type="button" class="champion-skip">Skip intro</button></div>';
    const pause=stage.querySelector('.champion-pause'),skip=stage.querySelector('.champion-skip');
    let closed=false,paused=false,frame=0,elapsed=0,last=0,started=false;
    const loading=setTimeout(fallback,2500);
    function close(restore=true){if(closed)return;closed=true;clearTimeout(loading);cancelAnimationFrame(frame);document.removeEventListener('keydown',keydown);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('resize',resize);stage.remove();active=null;if(restore&&previous?.isConnected&&previous!==document.body)previous.focus({preventScroll:true});}
    function fallback(){if(closed)return;close(false);onFallback?.();}
    function keydown(e){if(e.key==='Escape'){e.preventDefault();close();}if(e.key==='Tab'){if(e.shiftKey&&document.activeElement===pause){e.preventDefault();skip.focus();}else if(!e.shiftKey&&document.activeElement===skip){e.preventDefault();pause.focus();}}}
    function visibility(){last=0;}
    let render=()=>{},resize=()=>{};
    pause.addEventListener('click',()=>{paused=!paused;last=0;pause.textContent=paused?'Resume intro':'Pause intro';pause.setAttribute('aria-pressed',String(paused));});skip.addEventListener('click',()=>close());
    document.body.appendChild(stage);active={close};skip.focus({preventScroll:true});document.addEventListener('keydown',keydown);document.addEventListener('visibilitychange',visibility);
    fetch(spec.src).then(r=>{if(!r.ok)throw Error('Drawing unavailable');return r.text();}).then(source=>{
      if(closed)return;stage.querySelector('.sketch-scene').innerHTML=source;
      const svg=stage.querySelector('svg'),golfer=stage.querySelector('.sketch-golfer'),arms=stage.querySelector('.golfer-arms'),club=stage.querySelector('.golfer-club'),swish=stage.querySelector('.putt-swish'),word=stage.querySelector('.written-wordmark'),ball=stage.querySelector('.writing-ball'),spin=stage.querySelector('.ball-spin');
      const routes=[...stage.querySelectorAll('.write-route')],seals=[...stage.querySelectorAll('.ink-seal')];
      if(!svg||routes.length!==7)throw Error('Drawing is incomplete');
      const durations=[880,460,490,490,590,440,590],lengths=routes.map(p=>p.getTotalLength());let layout;
      resize=()=>{const mobile=innerWidth<=720;layout=mobile?{gx:66,gy:-22,lx:33,ly:395,scale:2.78,view:'0 0 520 610'}:{gx:15,gy:0,lx:422,ly:170,scale:3.5,view:'0 0 1100 480'};svg.setAttribute('viewBox',layout.view);golfer.setAttribute('transform',`translate(${layout.gx} ${layout.gy})`);word.setAttribute('transform',`translate(${layout.lx} ${layout.ly}) scale(${layout.scale})`);render(elapsed);};
      const clamp=n=>Math.max(0,Math.min(1,n)),ease=n=>n*n*(3-2*n);
      function point(i,p){const v=routes[i].getPointAtLength(lengths[i]*clamp(p));return{x:layout.lx+v.x*layout.scale,y:layout.ly+v.y*layout.scale};}
      function lerp(a,b,p,arc=0){return{x:a.x+(b.x-a.x)*p,y:a.y+(b.y-a.y)*p-Math.sin(p*Math.PI)*arc};}
      render=t=>{
        const start={x:313+layout.gx,y:357+layout.gy};let pos=start;
        const backswing=ease(clamp((t-250)/480)),strike=ease(clamp((t-780)/380));
        arms.setAttribute('transform',`rotate(${-7*backswing+10*strike} 130 190)`);club.setAttribute('transform',`rotate(${-11*backswing+16*strike} 197 249)`);
        swish.setAttribute('opacity',String(t>930&&t<1270?Math.sin((t-930)/340*Math.PI)*.65:0));
        let cursor=1560,activeGlyph=-1;
        routes.forEach((path,i)=>{const p=clamp((t-cursor)/durations[i]);path.style.opacity=p>0?'1':'0';path.style.strokeDashoffset=String(1-p);seals[i].setAttribute('opacity',String(ease(clamp((p-.94)/.06))));if(t>=cursor&&t<=cursor+durations[i]){pos=point(i,p);activeGlyph=i;}if(t>cursor+durations[i])pos=point(i,1);const hop=90;if(i<6&&t>cursor+durations[i]&&t<cursor+durations[i]+hop)pos=lerp(point(i,1),point(i+1,0),ease((t-cursor-durations[i])/hop),10);cursor+=durations[i]+(i<6?hop:0);});
        if(t<1560){pos=t<1060?start:lerp(start,point(0,0),ease(clamp((t-1060)/500)),layout.scale===2.78?18:30);}
        const finish=cursor;if(t>finish)pos=point(6,1);
        const merge=t>finish?1-ease(clamp((t-finish)/220)):1;
        ball.setAttribute('transform',`translate(${pos.x} ${pos.y}) scale(${merge})`);spin.setAttribute('transform',`rotate(${t*.48})`);ball.style.opacity=String(merge);
        stage.dataset.elapsed=String(Math.round(t));stage.dataset.glyph=String(activeGlyph);stage.dataset.phase=t<1060?'putt':t<1560?'roll':t<finish?'write':'hold';
      };
      resize();window.addEventListener('resize',resize);clearTimeout(loading);started=true;onStarted?.();
      function tick(time){if(closed)return;const delta=last?Math.min(70,time-last):0;last=time;if(!paused&&!document.hidden)elapsed+=delta;render(elapsed);if(elapsed>=spec.durationMs&&!exportMode){close();return;}frame=requestAnimationFrame(tick);}
      frame=requestAnimationFrame(tick);
    }).catch(fallback);
    return true;
  };

  document.addEventListener('DOMContentLoaded',()=>{
    const spec=window.PUTTERY_INTRO_MEDIA?.loop;
    const slot=document.querySelector('[data-golf-loop-slot]');
    if(!spec?.src || !slot)return;
    const fallbackNodes=Array.from(slot.childNodes);
    const video=document.createElement('video');video.muted=true;video.loop=true;video.playsInline=true;video.preload='auto';video.setAttribute('aria-hidden','true');video.src=spec.src;if(spec.poster)video.poster=spec.poster;
    let visible=false,ready=false;
    function sync(){
      const paused=!visible||document.hidden||document.documentElement.classList.contains('motion-paused')||matchMedia('(prefers-reduced-motion: reduce)').matches;
      if(paused)video.pause();else if(ready)video.play().catch(()=>{});
    }
    video.addEventListener('canplay',()=>{if(!ready){ready=true;slot.replaceChildren(video);}sync();},{once:true});
    video.addEventListener('error',()=>{ready=false;video.pause();slot.replaceChildren(...fallbackNodes);},{once:true});
    const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();});observer.observe(slot);
    new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
    document.addEventListener('visibilitychange',sync);
    video.load();
  });
})();
