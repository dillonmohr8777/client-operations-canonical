/* Shared behaviour only. No client data or account configuration lives here. */
(() => {
  'use strict';
  const body = document.body;
  const header = document.querySelector('.site-header');
  const stage = document.querySelector('.logo-stage');
  const menu = document.getElementById('report-menu');
  const menuButton = document.querySelector('.menu-button');
  const motionButton = document.querySelector('.motion-toggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let manualPause = false;
  let frame = 0;

  function setMenu(open) {
    menu.hidden = !open;
    menuButton.setAttribute('aria-expanded', String(open));
    if (open) menu.querySelector('a').focus();
  }
  menuButton.addEventListener('click', () => setMenu(menu.hidden));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) {
      setMenu(false);
      menuButton.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!menu.hidden && !menu.contains(event.target) && !menuButton.contains(event.target)) setMenu(false);
  });
  function motionState() {
    body.classList.toggle('motion-paused', manualPause || document.hidden || reduced.matches);
    motionButton.setAttribute('aria-pressed', String(manualPause));
    motionButton.setAttribute('aria-label', manualPause ? 'Play decorative motion' : 'Pause decorative motion');
    motionButton.querySelector('span').textContent = manualPause ? 'Play motion' : 'Pause motion';
  }
  motionButton.addEventListener('click', () => { manualPause = !manualPause; motionState(); });
  document.addEventListener('visibilitychange', motionState);
  reduced.addEventListener('change', motionState);
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.target === stage) stage.classList.toggle('motion-offscreen', !entry.isIntersecting);
      else entry.target.classList.toggle('is-offscreen', !entry.isIntersecting);
    });
  });
  observer.observe(stage);
  document.querySelectorAll('.marquee,.lift-hero').forEach(el => observer.observe(el));
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = Number(el.dataset.count);
    if (!Number.isFinite(target) || body.classList.contains('motion-paused')) return;
    const start = performance.now();
    const run = now => {
      const t = Math.min(1, (now - start) / 1100);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = '+' + Math.round(target * eased) + '%';
      if (t < 1 && !body.classList.contains('motion-paused')) requestAnimationFrame(run);
      else el.textContent = '+' + target + '%';
    };
    requestAnimationFrame(run);
  });

  function updateScroll() {
    frame = 0;
    header.classList.toggle('has-mark', stage.getBoundingClientRect().bottom <= header.offsetHeight);
    const distance = document.documentElement.scrollHeight - innerHeight;
    header.style.setProperty('--reading-progress', Math.min(1, Math.max(0, distance > 0 ? scrollY / distance : 0)));
  }
  addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(updateScroll); }, { passive: true });
  addEventListener('resize', updateScroll);
  addEventListener('load', updateScroll);
  document.querySelectorAll('[data-print]').forEach(button => button.addEventListener('click', () => print()));
  addEventListener('beforeprint', () => document.querySelectorAll('.channel-details').forEach(el => { el.dataset.wasOpen = String(el.open); el.open = true; }));
  addEventListener('afterprint', () => document.querySelectorAll('.channel-details').forEach(el => { el.open = el.dataset.wasOpen === 'true'; }));
  motionState();
  updateScroll();
})();
