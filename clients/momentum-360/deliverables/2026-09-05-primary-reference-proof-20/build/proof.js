/* Native implementation of the approved fixed-header swap and scroll choreography. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('.header');
  const figure = document.querySelector('.home_logo figure');
  const nav = document.getElementById('mainnav');
  const button = document.getElementById('nav-icon3');
  const menu = document.querySelector('.mobile_menubtn');
  function swap() {
    if (header && figure) header.classList.toggle('animated', figure.getBoundingClientRect().bottom <= 100);
    if(header) header.style.setProperty('--read-progress', Math.min(1,scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)));
  }
  let scheduled = false;
  addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(() => { swap(); scheduled = false; }); } }, {passive:true});
  addEventListener('resize', swap);
  addEventListener('load', swap);
  swap();
  function setMenu(open, restore = true) {
    document.body.classList.toggle('menuopen', open);
    menu.classList.toggle('open', open);
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Close menu' : 'Show menu');
    nav.inert = !open;
    if (open) requestAnimationFrame(() => { if (document.body.classList.contains('menuopen')) nav.querySelector('a')?.focus(); });
    else if (restore) button.focus();
  }
  nav.inert = true;
  button.addEventListener('click', () => setMenu(button.getAttribute('aria-expanded') !== 'true'));
  document.querySelector('.olay')?.addEventListener('click', () => setMenu(false));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false, false)));
  document.addEventListener('keydown', e => {
    if (button.getAttribute('aria-expanded') !== 'true') return;
    if (e.key === 'Escape') { e.preventDefault(); setMenu(false); }
    if (e.key === 'Tab') {
      const items = [button, ...nav.querySelectorAll('a,button')];
      const i = items.indexOf(document.activeElement);
      if ((e.shiftKey && i <= 0) || (!e.shiftKey && i === items.length - 1)) {
        e.preventDefault(); items[e.shiftKey ? items.length - 1 : 0].focus();
      }
    }
  });
  document.querySelectorAll('.accordion-button').forEach(b => {
    b.addEventListener('click', () => {
      const panel = document.querySelector(b.dataset.bsTarget);
      const open = b.getAttribute('aria-expanded') !== 'true';
      document.querySelectorAll('.accordion-button').forEach(other => {
        const p = document.querySelector(other.dataset.bsTarget);
        const active = other === b && open;
        other.setAttribute('aria-expanded', String(active));
        other.classList.toggle('collapsed', !active);
        p.classList.toggle('show', active);
        p.hidden = !active;
        p.style.height = active ? 'auto' : '0px';
      });
    });
    document.querySelector(b.dataset.bsTarget).hidden = true;
  });
  const reveals = document.querySelectorAll('.wow');
  if (!reduced.matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('animated'); observer.unobserve(entry.target); }
    }), {threshold:0.08});
    reveals.forEach(el => observer.observe(el));
  } else reveals.forEach(el => el.classList.add('animated'));
  reduced.addEventListener('change', () => reveals.forEach(el => el.classList.add('animated')));
  if ('IntersectionObserver' in window) {
    const drawings = new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle('is-active', entry.isIntersecting)), {threshold:.1});
    document.querySelectorAll('.chapter-art').forEach(el => drawings.observe(el));
  }
  const services=document.getElementById('work');
  const footer=document.getElementById('contact');
  const action=document.querySelector('.context-action');
  if (action && services && footer && 'IntersectionObserver' in window) {
    let afterServices=false, atFooter=false;
    const updateAction=()=>{ action.hidden=!afterServices || atFooter || document.body.classList.contains('menuopen'); };
    new IntersectionObserver(entries=>{afterServices=entries[0].boundingClientRect.top<100;updateAction();},{threshold:[0,.1,1]}).observe(services);
    new IntersectionObserver(entries=>{atFooter=entries[0].isIntersecting;updateAction();},{rootMargin:'0px 0px 100px 0px'}).observe(footer);
    new MutationObserver(updateAction).observe(document.body,{attributes:true,attributeFilter:['class']});
    const symbols=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-seen');symbols.unobserve(entry.target);}}),{threshold:.35});
    document.querySelectorAll('.service-feature').forEach(el=>symbols.observe(el));
  }
})();
