/* Enabled only after the parent verifies the locally generated video/poster.
   The logo is the locked SVG overlay; no generated text is used. */
(() => {
  let active;
  window.playPutteryChampionIntro = ({onFallback, onStarted} = {}) => {
    const spec = window.PUTTERY_INTRO_MEDIA?.champion;
    if (!spec?.src || matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    if (active) active.close(false);
    const previous = document.activeElement;
    const stage = document.createElement('div');
    stage.className = 'champion-intro';
    stage.setAttribute('role', 'dialog');
    stage.setAttribute('aria-modal', 'true');
    stage.setAttribute('aria-label', 'Puttery introduction');
    stage.innerHTML = '<div class="champion-film"><video class="champion-video" muted playsinline preload="auto" aria-hidden="true"></video></div><div class="champion-logo-track" aria-hidden="true"><img class="champion-logo" src="assets/puttery-logo.svg" alt="" width="163" height="40" /></div><div class="champion-intro-controls"><button type="button" class="champion-pause">Pause intro</button><button type="button" class="champion-skip">Skip intro</button></div>';
    const video = stage.querySelector('video');
    const pauseButton = stage.querySelector('.champion-pause');
    const skipButton = stage.querySelector('.champion-skip');
    video.muted = true;
    video.src = spec.src;
    if (spec.poster) video.poster = spec.poster;
    let closed = false, started = false, manuallyPaused = false, frame = 0, settleTimer, loadTimer;
    const strike = spec.strikeTime ?? 3;
    const revealEnd = spec.revealEnd ?? 4.8;
    stage.style.setProperty('--champion-logo-y', (spec.logoY ?? 48) + '%');
    stage.style.setProperty('--champion-logo-x', (spec.logoX ?? 64) + '%');
    function close(restore = true) {
      if (closed) return;
      closed = true;clearTimeout(loadTimer);clearTimeout(settleTimer);cancelAnimationFrame(frame);video.pause();
      document.removeEventListener('keydown', keydown);document.removeEventListener('visibilitychange', visibility);
      stage.remove();active = null;
      if (restore && previous?.isConnected && previous !== document.body) previous.focus({preventScroll:true});
    }
    function fallback() { if (closed) return; close(false); onFallback?.(); }
    function keydown(event) {
      if (event.key === 'Escape') { event.preventDefault(); close(); }
      if (event.key === 'Tab') {
        if (event.shiftKey && document.activeElement === pauseButton) {event.preventDefault();skipButton.focus();}
        else if (!event.shiftKey && document.activeElement === skipButton) {event.preventDefault();pauseButton.focus();}
      }
    }
    function visibility() {
      if (closed || !started) return;
      if (document.hidden || manuallyPaused) video.pause(); else video.play().catch(fallback);
    }
    function animate() {
      if (closed) return;
      const progress = Math.max(0, Math.min(1, (video.currentTime - strike) / Math.max(.25, revealEnd - strike)));
      const eased = 1 - Math.pow(1-progress,3);
      stage.style.setProperty('--champion-reveal', ((1-progress)*100)+'%');
      stage.style.setProperty('--champion-travel', ((1-eased)*-60)+'vw');
      stage.classList.toggle('champion-struck', progress>0);
      stage.classList.toggle('champion-settled', progress>=1);
      frame = requestAnimationFrame(animate);
    }
    pauseButton.addEventListener('click', () => {
      manuallyPaused = !manuallyPaused;
      pauseButton.textContent = manuallyPaused ? 'Resume intro' : 'Pause intro';
      pauseButton.setAttribute('aria-pressed', String(manuallyPaused));
      visibility();
    });
    skipButton.addEventListener('click', () => close());
    video.addEventListener('error',fallback,{once:true});
    video.addEventListener('playing', () => {
      clearTimeout(loadTimer);
      if (!started) {started=true;onStarted?.();animate();}
      if (manuallyPaused || document.hidden) video.pause();
    });
    video.addEventListener('ended', () => {
      stage.style.setProperty('--champion-reveal','0%');stage.style.setProperty('--champion-travel','0vw');
      stage.classList.add('champion-settled');settleTimer=setTimeout(()=>close(),spec.settleMs ?? 650);
    },{once:true});
    document.body.appendChild(stage);active={close};skipButton.focus({preventScroll:true});
    document.addEventListener('keydown',keydown);document.addEventListener('visibilitychange',visibility);
    loadTimer=setTimeout(fallback,5000);
    video.play().catch(fallback);
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
