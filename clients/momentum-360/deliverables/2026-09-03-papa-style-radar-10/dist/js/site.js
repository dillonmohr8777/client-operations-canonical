/* Prospect preview behaviour.
   Mirrors the reference theme's script (GSAP ScrollTrigger header swap)
   with WordPress/Bootstrap/WOW/slick dependencies replaced by equivalents that need
   no extra libraries. Library set: GSAP 3.12.5 + ScrollTrigger,
   no animation library. */
(function () {
  'use strict';

  /* --------------------------------------------------- letter-split headings
     Live section h2s report an empty innerText; reproduce with per-character
     spans. The handwritten .strike_replace ("Niche") is left intact - it is
     driven by the typing keyframe and must stay a single run.                */
  function splitChars(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null),
        nodes = [], node, i = 0;
    while ((node = walker.nextNode())) {
      if (!node.parentNode.closest('.strike_replace')) nodes.push(node);
    }
    nodes.forEach(function (n) {
      var frag = document.createDocumentFragment();
      Array.prototype.forEach.call(n.data, function (ch) {
        var s = document.createElement('span');
        s.className = 'ch';
        s.textContent = ch === ' ' ? ' ' : ch;
        s.style.transitionDelay = (i++ * 28) + 'ms';
        frag.appendChild(s);
      });
      n.parentNode.replaceChild(frag, n);
    });
  }
  document.querySelectorAll('h2[data-split]').forEach(splitChars);

  /* ------------------------------------------------------- header swap + wow
     ScrollTrigger on the hero wordmark figure, start "bottom top+=100px".
     onEnter adds .animated to the header, onLeaveBack removes it; the 0.8s
     cubic-bezier(.85,0,.15,1) CSS transitions do the rest. Nothing here is
     scroll-linked. The .wow reveals stand in for WOW.js (same class name).   */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    var header = document.querySelector('.header');

    ScrollTrigger.create({
      trigger: '.homeslider_wrapper .home_logo figure',
      start: 'bottom top+=100px',
      onEnter:      function () { header.classList.add('animated'); },
      onLeaveBack:  function () { header.classList.remove('animated'); }
    });

    document.querySelectorAll('.wow').forEach(function (el) {
      var offset = parseInt(el.getAttribute('data-wow-offset') || '0', 10);
      ScrollTrigger.create({
        trigger: el,
        start: 'top bottom-=' + offset,
        once: true,
        onEnter: function () { el.classList.add('animated'); }
      });
    });

    /* ScrollTrigger caches each trigger's start position when the trigger is
       created. The hero holds a logo image that can decode late, so re-measure
       once the page has settled or the swap point is computed against a stale
       layout. */
    addEventListener('load', function () { ScrollTrigger.refresh(); });
  }

  /* ----------------------------------------------------------------- menu
     MENU opens the fixed right-hand panel (.mainnav_wrapper, 624px). Same
     body.menuopen / .open class pair the reference script toggles.            */
  var menuBtn = document.querySelector('.mobile_menubtn'),
      olay = document.querySelector('.olay'),
      navIcon = document.getElementById('nav-icon3');
  function setMenu(open) {
    menuBtn.classList.toggle('open', open);
    document.body.classList.toggle('menuopen', open);
    navIcon.setAttribute('aria-expanded', String(open));
  }
  if (menuBtn) {
    menuBtn.addEventListener('click', function (e) {
      e.preventDefault();
      setMenu(!document.body.classList.contains('menuopen'));
    });
    olay.addEventListener('click', function () { setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('menuopen')) setMenu(false);
    });
  }

  /* ------------------------------------------------------------ accordion
     Four items, all collapsed by default, single-open within data-bs-parent.
     Replaces Bootstrap's collapse JS; same markup contract.                 */
  document.querySelectorAll('.accordion-button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var panel = document.querySelector(btn.dataset.bsTarget),
          isOpen = panel.classList.contains('show'),
          parent = document.querySelector(panel.dataset.bsParent);

      if (parent) {
        parent.querySelectorAll('.accordion-collapse.show').forEach(function (p) {
          if (p !== panel) close(p);
        });
      }
      isOpen ? close(panel) : open(panel);
      btn.classList.toggle('collapsed', isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });
  function open(panel) {
    panel.classList.add('show');
    panel.style.height = panel.scrollHeight + 'px';
    panel.addEventListener('transitionend', function done() {
      panel.style.height = 'auto';
      panel.removeEventListener('transitionend', done);
    });
  }
  function close(panel) {
    panel.style.height = panel.scrollHeight + 'px';
    requestAnimationFrame(function () {
      panel.classList.remove('show');
      panel.style.height = '0px';
      var b = document.querySelector('[data-bs-target="#' + panel.id + '"]');
      if (b) { b.classList.add('collapsed'); b.setAttribute('aria-expanded', 'false'); }
    });
  }
})();
