(function () {
  'use strict';

  document.body.classList.add('is-enhanced');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  const menuButton = document.querySelector('.menu-button');
  const nav = document.querySelector('#primary-nav');
  function closeMenu() {
    nav?.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }
  menuButton?.addEventListener('click', () => {
    const open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
    document.querySelector('.glass-nav')?.classList.remove('is-scroll-hidden');
  });
  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    closeMenu();
    menuButton?.focus();
  });

  const glassNav = document.querySelector('.glass-nav');
  let lastNavY = scrollY;
  let navFrame = 0;
  function updateNavVisibility() {
    navFrame = 0;
    const nextY = scrollY;
    const menuOpen = nav?.classList.contains('is-open');
    if (innerWidth <= 1120 && nextY > 150 && nextY > lastNavY + 6 && !menuOpen) {
      glassNav?.classList.add('is-scroll-hidden');
    } else if (nextY < 100 || nextY < lastNavY - 6 || menuOpen) {
      glassNav?.classList.remove('is-scroll-hidden');
    }
    lastNavY = nextY;
  }
  addEventListener('scroll', () => {
    if (navFrame) return;
    navFrame = requestAnimationFrame(updateNavVisibility);
  }, { passive: true });

  const reveals = [...document.querySelectorAll('[data-reveal]')];
  if (reduced.matches || !('IntersectionObserver' in window)) {
    reveals.forEach((node) => node.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((node) => observer.observe(node));
  }

  const meter = document.querySelector('.scroll-meter span');
  const proofSection = document.querySelector('.proof-stage');
  const proofLayers = [...document.querySelectorAll('.proof-layer')];
  const proofLabel = document.querySelector('[data-proof-label]');
  const proofCount = document.querySelector('[data-proof-count]');
  let scrollFrame = 0;
  function updateScroll() {
    scrollFrame = 0;
    const max = document.documentElement.scrollHeight - innerHeight;
    if (meter) meter.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    if (!proofSection || reduced.matches) return;
    const rect = proofSection.getBoundingClientRect();
    const travel = Math.max(1, rect.height - innerHeight);
    const progress = Math.max(0, Math.min(.999, -rect.top / travel));
    const index = Math.min(proofLayers.length - 1, Math.floor(progress * proofLayers.length));
    proofLayers.forEach((layer, layerIndex) => layer.classList.toggle('is-active', layerIndex === index));
    if (proofLabel) proofLabel.textContent = proofLayers[index]?.dataset.label || '';
    if (proofCount) proofCount.textContent = `${String(index + 1).padStart(2, '0')} / ${String(proofLayers.length).padStart(2, '0')}`;
  }
  function onScroll() {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(updateScroll);
  }
  addEventListener('scroll', onScroll, { passive: true });
  updateScroll();

  const rail = document.querySelector('.system-rail');
  const cards = rail ? [...rail.querySelectorAll('.system-card')] : [];
  const current = document.querySelector('[data-rail-current]');
  const progressBar = document.querySelector('.rail-progress span');
  let active = 0;
  let railFrame = 0;
  const drag = { active: false, x: 0, left: 0, moved: false };

  function setActive(next, move) {
    active = Math.max(0, Math.min(cards.length - 1, next));
    cards.forEach((card, index) => card.classList.toggle('is-active', index === active));
    if (current) current.textContent = cards[active]?.dataset.label || '';
    if (progressBar) progressBar.style.transform = `scaleX(${(active + 1) / cards.length})`;
    if (move && rail && cards[active]) {
      rail.scrollTo({
        left: cards[active].offsetLeft - Math.max(18, (rail.clientWidth - cards[active].clientWidth) / 2),
        behavior: reduced.matches ? 'auto' : 'smooth'
      });
    }
  }

  function updateActiveFromRail() {
    railFrame = 0;
    if (!rail) return;
    const center = rail.scrollLeft + rail.clientWidth / 2;
    let nearest = 0;
    let distance = Infinity;
    cards.forEach((card, index) => {
      const nextDistance = Math.abs(card.offsetLeft + card.clientWidth / 2 - center);
      if (nextDistance < distance) { nearest = index; distance = nextDistance; }
    });
    setActive(nearest, false);
  }

  rail?.addEventListener('scroll', () => {
    if (railFrame) return;
    railFrame = requestAnimationFrame(updateActiveFromRail);
  }, { passive: true });
  rail?.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') { event.preventDefault(); setActive(active + 1, true); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); setActive(active - 1, true); }
    if (event.key === 'Home') { event.preventDefault(); setActive(0, true); }
    if (event.key === 'End') { event.preventDefault(); setActive(cards.length - 1, true); }
  });
  rail?.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    drag.active = true;
    drag.moved = false;
    drag.x = event.clientX;
    drag.left = rail.scrollLeft;
    rail.classList.add('is-dragging');
    rail.setPointerCapture(event.pointerId);
  });
  rail?.addEventListener('pointermove', (event) => {
    if (!drag.active) return;
    const delta = event.clientX - drag.x;
    if (Math.abs(delta) > 4) drag.moved = true;
    rail.scrollLeft = drag.left - delta * 1.15;
  });
  function endDrag(event) {
    if (!drag.active) return;
    drag.active = false;
    rail.classList.remove('is-dragging');
    if (rail.hasPointerCapture(event.pointerId)) rail.releasePointerCapture(event.pointerId);
    updateActiveFromRail();
    setActive(active, true);
  }
  rail?.addEventListener('pointerup', endDrag);
  rail?.addEventListener('pointercancel', endDrag);
  document.querySelector('[data-rail-prev]')?.addEventListener('click', () => setActive(active - 1, true));
  document.querySelector('[data-rail-next]')?.addEventListener('click', () => setActive(active + 1, true));
  cards.forEach((card) => card.addEventListener('pointermove', (event) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--gx', `${((event.clientX - rect.left) / rect.width) * 100}%`);
    card.style.setProperty('--gy', `${((event.clientY - rect.top) / rect.height) * 100}%`);
  }, { passive: true }));
  setActive(0, false);

  function createAmbientField() {
    const canvas = document.querySelector('#ambient-field');
    const context = canvas?.getContext('2d');
    if (!canvas || !context || reduced.matches) return;
    let points = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    function resize() {
      const dpr = Math.min(devicePixelRatio || 1, 1.35);
      width = innerWidth;
      height = innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = width < 700 ? 120 : 260;
      points = Array.from({ length: count }, (_, index) => ({
        x: (index / count) * width + (Math.random() - .5) * 120,
        y: Math.random() * height,
        speed: .06 + Math.random() * .24,
        radius: .5 + Math.random() * 1.6,
        phase: Math.random() * Math.PI * 2
      }));
    }
    function draw(time) {
      context.clearRect(0, 0, width, height);
      points.forEach((point) => {
        point.y -= point.speed;
        if (point.y < -10) point.y = height + 10;
        const x = point.x + Math.sin(time * .00025 + point.phase) * 18;
        context.fillStyle = point.radius > 1.5 ? 'rgba(244,119,33,.54)' : 'rgba(255,255,255,.28)';
        context.beginPath();
        context.arc(x, point.y, point.radius, 0, Math.PI * 2);
        context.fill();
      });
      frame = requestAnimationFrame(draw);
    }
    resize();
    frame = requestAnimationFrame(draw);
    addEventListener('resize', resize, { passive: true });
    reduced.addEventListener('change', (event) => { if (event.matches) cancelAnimationFrame(frame); });
  }
  createAmbientField();

  if (window.BrandParticles) {
    const hero = document.querySelector('#hero-particles');
    const footer = document.querySelector('#footer-particles');
    if (hero) new BrandParticles(hero, { count: innerWidth < 700 ? 2300 : 4300, seed: 5546, pointSize: 1.05, opacity: .95, loop: false, settle: true });
    if (footer) new BrandParticles(footer, { count: innerWidth < 700 ? 2600 : 5200, seed: 8777, pointSize: 1.15, opacity: .92, loop: false, settle: true, assembleMs: 1650 });
  }
})();
