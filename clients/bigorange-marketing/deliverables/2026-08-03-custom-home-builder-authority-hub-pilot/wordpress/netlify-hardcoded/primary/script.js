(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  document.documentElement.classList.add('js');

  const progressBar = document.querySelector('.progress span');
  const opening = document.querySelector('.opening');
  const openingOne = document.querySelector('.opening__line--one');
  const openingTwo = document.querySelector('.opening__line--two');
  const openingCanvas = document.querySelector('.opening__particles');
  const openingMark = document.querySelector('.opening__mark');

  function fadeWindow(progress, start, peakStart, peakEnd, end) {
    if (progress <= start || progress >= end) return 0;
    if (progress < peakStart) return (progress - start) / (peakStart - start);
    if (progress <= peakEnd) return 1;
    return 1 - ((progress - peakEnd) / (end - peakEnd));
  }

  function updateScrollScene() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    if (progressBar) progressBar.style.width = `${progress * 100}%`;

    if (!opening || reducedMotion) return;
    const travel = Math.max(1, opening.offsetHeight - window.innerHeight);
    const scene = clamp(-opening.getBoundingClientRect().top / travel, 0, 1);
    const one = scene <= .18 ? 1 : clamp(1 - ((scene - .18) / .13), 0, 1);
    const mark = fadeWindow(scene, .22, .34, .69, .84);
    const two = fadeWindow(scene, .68, .79, .93, 1);
    openingOne.style.opacity = one.toFixed(3);
    openingOne.style.transform = `translateY(${(1 - one) * 28}px)`;
    openingMark.style.opacity = mark.toFixed(3);
    openingMark.style.transform = `scale(${.94 + mark * .06})`;
    openingTwo.style.opacity = two.toFixed(3);
    openingTwo.style.transform = `translateY(${(1 - two) * 28}px)`;
  }

  let scrollQueued = false;
  window.addEventListener('scroll', () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      updateScrollScene();
      scrollQueued = false;
    });
  }, { passive: true });
  window.addEventListener('resize', updateScrollScene, { passive: true });
  updateScrollScene();

  const revealItems = Array.from(document.querySelectorAll('[data-reveal]'));
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: .12, rootMargin: '0px 0px -7% 0px' });
    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index % 4, 3) * 55}ms`;
      revealObserver.observe(item);
    });
  }

  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.getElementById('site-menu');
  function closeMenu() {
    if (!menuButton || !menu) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  }
  if (menuButton && menu) {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
      document.querySelector('.glass-nav')?.classList.remove('is-scroll-hidden');
    });
    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    window.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || menuButton.getAttribute('aria-expanded') !== 'true') return;
      closeMenu();
      menuButton.focus();
    });
  }

  const glassNav = document.querySelector('.glass-nav');
  let lastNavY = scrollY;
  let navFrame = 0;
  window.addEventListener('scroll', () => {
    if (navFrame) return;
    navFrame = requestAnimationFrame(() => {
      navFrame = 0;
      const nextY = scrollY;
      const menuOpen = menu?.classList.contains('is-open');
      if (innerWidth <= 900 && nextY > 150 && nextY > lastNavY + 6 && !menuOpen) {
        glassNav?.classList.add('is-scroll-hidden');
      } else if (nextY < 100 || nextY < lastNavY - 6 || menuOpen) {
        glassNav?.classList.remove('is-scroll-hidden');
      }
      lastNavY = nextY;
    });
  }, { passive: true });

  const rail = document.querySelector('.work-rail__viewport');
  const previous = document.querySelector('[data-rail-prev]');
  const next = document.querySelector('[data-rail-next]');
  if (rail) {
    const card = rail.querySelector('.work-card');
    const step = () => card ? card.getBoundingClientRect().width + 20 : rail.clientWidth * .82;
    previous?.addEventListener('click', () => rail.scrollBy({ left: -step(), behavior: reducedMotion ? 'auto' : 'smooth' }));
    next?.addEventListener('click', () => rail.scrollBy({ left: step(), behavior: reducedMotion ? 'auto' : 'smooth' }));
    rail.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      rail.scrollBy({ left: event.key === 'ArrowRight' ? step() : -step(), behavior: reducedMotion ? 'auto' : 'smooth' });
    });

    let dragging = false;
    let startX = 0;
    let startScroll = 0;
    rail.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      dragging = true;
      startX = event.clientX;
      startScroll = rail.scrollLeft;
      rail.setPointerCapture(event.pointerId);
    });
    rail.addEventListener('pointermove', (event) => {
      if (!dragging) return;
      rail.scrollLeft = startScroll - (event.clientX - startX) * 1.25;
    });
    const stopDrag = (event) => {
      dragging = false;
      if (rail.hasPointerCapture(event.pointerId)) rail.releasePointerCapture(event.pointerId);
    };
    rail.addEventListener('pointerup', stopDrag);
    rail.addEventListener('pointercancel', stopDrag);
  }

  const tabs = Array.from(document.querySelectorAll('[data-workspace-tab]'));
  const panels = Array.from(document.querySelectorAll('[data-workspace-panel]'));
  function activateTab(target, focus) {
    tabs.forEach((tab) => {
      const active = tab.dataset.workspaceTab === target;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focus) tab.focus();
    });
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.workspacePanel !== target;
    });
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab.dataset.workspaceTab, false));
    tab.addEventListener('keydown', (event) => {
      let nextIndex = index;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = tabs.length - 1;
      else return;
      event.preventDefault();
      activateTab(tabs[nextIndex].dataset.workspaceTab, true);
    });
  });
  if (tabs.length) activateTab(tabs.find((tab) => tab.getAttribute('aria-selected') === 'true')?.dataset.workspaceTab || tabs[0].dataset.workspaceTab, false);

  document.querySelectorAll('.answers details').forEach((detail) => {
    detail.addEventListener('toggle', () => {
      if (!detail.open) return;
      document.querySelectorAll('.answers details[open]').forEach((other) => {
        if (other !== detail) other.open = false;
      });
    });
  });

  const glow = document.querySelector('.cursor-glow');
  if (glow && !reducedMotion && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('pointermove', (event) => {
      glow.style.transform = `translate(${event.clientX - 272}px, ${event.clientY - 272}px)`;
    }, { passive: true });
  }

  if (window.BrandParticles) {
    const openingParticleCanvas = document.getElementById('opening-particles');
    const finaleParticleCanvas = document.getElementById('finale-particles');
    if (openingParticleCanvas) {
      new window.BrandParticles(openingParticleCanvas, {
        src: openingParticleCanvas.dataset.logo,
        count: 5200,
        seed: 5546,
        assembleMs: 1400,
        holdMs: 4300,
        dissolveMs: 1050,
        pointSize: 1.16,
        loop: false,
        settle: true
      });
    }
    if (finaleParticleCanvas) {
      new window.BrandParticles(finaleParticleCanvas, {
        src: finaleParticleCanvas.dataset.logo,
        count: 5000,
        seed: 8777,
        assembleMs: 1800,
        holdMs: 5200,
        dissolveMs: 1500,
        pointSize: 1.3,
        opacity: .92,
        loop: false,
        settle: true
      });
    }
  }
})();
