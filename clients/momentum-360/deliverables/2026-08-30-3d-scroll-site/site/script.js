(() => {
  const story = document.querySelector('.scroll-story');
  const frames = [...document.querySelectorAll('.scene-frame')];
  const chapters = [...document.querySelectorAll('.chapter')];
  const journeyLinks = [...document.querySelectorAll('.journey-nav a')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (!story || frames.length === 0 || chapters.length !== frames.length) return;

  let ticking = false;
  let activeScene = 0;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function renderScene() {
    ticking = false;
    const rect = story.getBoundingClientRect();
    const travel = Math.max(1, story.offsetHeight - window.innerHeight);
    const progress = clamp(-rect.top / travel, 0, 1);
    const scenePosition = progress * (frames.length - 1);
    const nextActive = clamp(Math.round(scenePosition), 0, frames.length - 1);

    frames.forEach((frame, index) => {
      const distance = Math.abs(index - scenePosition);
      const opacity = clamp(1 - distance, 0, 1);
      const signedDistance = scenePosition - index;
      const shift = reducedMotion.matches ? 0 : clamp(signedDistance * 9, -9, 9);
      const scale = reducedMotion.matches ? 1 : 1.055 + Math.min(distance, 1) * 0.018;

      frame.style.setProperty('--scene-opacity', opacity.toFixed(4));
      frame.style.setProperty('--scene-shift', `${shift.toFixed(3)}vh`);
      frame.style.setProperty('--scene-scale', scale.toFixed(4));
      frame.classList.toggle('is-active', index === nextActive);
    });

    if (nextActive !== activeScene) {
      activeScene = nextActive;
      chapters.forEach((chapter, index) => chapter.classList.toggle('is-current', index === activeScene));
      journeyLinks.forEach((link, index) => {
        link.classList.toggle('is-active', index === activeScene);
        if (index === activeScene) link.setAttribute('aria-current', 'step');
        else link.removeAttribute('aria-current');
      });
    }

    window.__M360_SCROLL_STATE__ = {
      progress: Number(progress.toFixed(4)),
      scenePosition: Number(scenePosition.toFixed(4)),
      activeScene,
      reducedMotion: reducedMotion.matches,
    };
  }

  function requestRender() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(renderScene);
  }

  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', requestRender, { passive: true });
  reducedMotion.addEventListener('change', requestRender);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) requestRender();
  });

  renderScene();
})();
