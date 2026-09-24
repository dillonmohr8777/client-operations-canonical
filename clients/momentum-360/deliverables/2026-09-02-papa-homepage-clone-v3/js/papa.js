/* PAPA Advertising homepage clone - behaviour.
   Mirrors the live theme's custom.js (Owl config, GSAP ScrollTrigger header swap)
   with WordPress/Bootstrap/WOW/slick dependencies replaced by equivalents that need
   no extra libraries. Library set: jQuery 3.7.1, Owl 2.3.4, GSAP 3.12.5 + ScrollTrigger,
   lottie-web 5.12.2. */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- lottie
     Live page uses the WP Bodymovin plugin: svg renderer, autoplay, loop.
     logo-header.json: 30fps, frames 0-180 (6.0s), native 1254x666.          */
  var LOTTIE = [
    ['lottie-header', 'assets/lottie/logo-header.json'],
    ['lottie-hero',   'assets/lottie/logo-hero.json'],
    ['lottie-paypah', 'assets/lottie/paypah.json']
  ];
  if (window.lottie) {
    LOTTIE.forEach(function (pair) {
      var el = document.getElementById(pair[0]);
      if (!el) return;
      lottie.loadAnimation({
        container: el, renderer: 'svg', loop: true, autoplay: true, path: pair[1]
      });
      el.classList.add('renderer-svg', 'playing');
    });
  }

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

  /* ---------------------------------------------------------- owl carousel
     Config copied verbatim from the live custom.js. At >=1201px Owl derives
     item width = (elementWidth + margin) / items - margin
                = (1330 + 15) / 5 - 15 = 254, pitch 269, step 5 x 269 = 1345,
     and duration = min(max(|slideBy|,1),6) x smartSpeed = 5 x 600 = 3000ms.  */
  if (window.jQuery && jQuery.fn.owlCarousel) {
    jQuery('.client_carousel').owlCarousel({
      loop: true,
      margin: 15,
      responsiveClass: true,
      autoplay: true,
      autoplayTimeout: 6000,
      autoplayHoverPause: true,
      smartSpeed: 600,
      responsive: {
        0:    { items: 2, slideBy: 2, nav: false },
        768:  { items: 3, slideBy: 3, nav: false },
        992:  { items: 4, slideBy: 4, nav: false },
        1201: { items: 5, slideBy: 5, nav: false, loop: true, autoplay: true,
                autoplayTimeout: 6000, autoplayHoverPause: true, smartSpeed: 600 }
      }
    });
  }

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
  }

  /* ----------------------------------------------------------------- menu
     MENU opens the fixed right-hand panel (.mainnav_wrapper, 624px). Same
     body.menuopen / .open class pair the live custom.js toggles.            */
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
