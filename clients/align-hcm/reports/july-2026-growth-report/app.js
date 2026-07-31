/* Align HCM | July 2026 Growth & Attribution Report
   Progressive enhancement only. With JS off, every section and every
   screenshot is still fully visible and readable. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Scroll progress ------------------------------------------ */
  var bar = document.querySelector('.scroll-progress');
  if (bar) {
    var ticking = false;
    var setProgress = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      bar.style.setProperty('--p', p.toFixed(4));
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(setProgress); }
    }, { passive: true });
    window.addEventListener('resize', setProgress, { passive: true });
    setProgress();
  }

  /* ---------- Reveal on scroll -----------------------------------------
     Deliberately scroll-position driven rather than IntersectionObserver.
     A fast flick, a jump-link, or a resize can outrun observer callbacks and
     leave a panel stuck at opacity 0 — unacceptable in a report where the
     content is the deliverable. This re-checks every pending element against
     the live viewport, so nothing can stay hidden. */
  var pending = [].slice.call(document.querySelectorAll('.reveal'));

  function revealAll() {
    pending.forEach(function (el) { el.classList.add('in'); });
    pending = [];
  }

  if (reduceMotion) {
    revealAll();
  } else {
    var scheduled = false;
    var sweep = function () {
      scheduled = false;
      var limit = window.innerHeight * 0.94;
      pending = pending.filter(function (el) {
        if (el.getBoundingClientRect().top < limit) { el.classList.add('in'); return false; }
        return true;
      });
    };
    var request = function () {
      if (!scheduled) { scheduled = true; requestAnimationFrame(sweep); }
    };
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request, { passive: true });
    window.addEventListener('load', request);
    sweep();
    // Last resort: never let an animation be the reason content is unreadable.
    window.setTimeout(revealAll, 8000);
  }

  /* ---------- Lightbox -------------------------------------------------- */
  var lb        = document.getElementById('lightbox');
  var lbImg     = document.getElementById('lb-img');
  var lbQuery   = document.getElementById('lb-query');
  var lbNote    = document.getElementById('lb-note');
  var lbPrev    = document.getElementById('lb-prev');
  var lbNext    = document.getElementById('lb-next');
  var lbZoom    = document.getElementById('lb-zoom');
  var lbClose   = document.getElementById('lb-close');
  var lbView    = document.getElementById('lb-viewport');
  if (!lb || !lbImg) { return; }

  // Every element carrying data-shot, in document order, is one slide.
  // Duplicate sources (the same capture referenced twice) collapse to one slide.
  var triggers = [].slice.call(document.querySelectorAll('[data-shot]'));
  var slides = [];
  var indexBySrc = {};
  triggers.forEach(function (el) {
    var src = el.getAttribute('data-shot');
    if (!src) { return; }
    if (!(src in indexBySrc)) {
      indexBySrc[src] = slides.length;
      slides.push({
        src: src,
        query: el.getAttribute('data-query') || '',
        note: el.getAttribute('data-note') || ''
      });
    }
  });

  var current = -1;
  var lastFocus = null;

  function decodeEntities(s) {
    var t = document.createElement('textarea');
    t.innerHTML = s;
    return t.value;
  }

  function setZoom(on) {
    lb.classList.toggle('is-zoomed', on);
    lbZoom.setAttribute('aria-pressed', on ? 'true' : 'false');
    lbZoom.textContent = on ? 'Fit' : 'Full size';
    if (on) { lbView.scrollTop = 0; lbView.scrollLeft = 0; }
  }

  function show(i) {
    if (i < 0 || i >= slides.length) { return; }
    current = i;
    var s = slides[i];
    lbImg.src = s.src;
    lbImg.alt = 'Google result captured July 31, 2026 for the query ' + decodeEntities(s.query);
    lbQuery.textContent = decodeEntities(s.query);
    lbNote.textContent = decodeEntities(s.note);
    lbPrev.disabled = (i === 0);
    lbNext.disabled = (i === slides.length - 1);
    setZoom(false);
  }

  function open(src) {
    if (!(src in indexBySrc)) { return; }
    lastFocus = document.activeElement;
    lb.hidden = false;
    lb.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    show(indexBySrc[src]);
    lbClose.focus();
  }

  function close() {
    lb.classList.remove('is-open');
    lb.hidden = true;
    document.body.style.overflow = '';
    setZoom(false);
    lbImg.removeAttribute('src');
    if (lastFocus && lastFocus.focus) { lastFocus.focus(); }
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-shot]') : null;
    if (t) {
      e.preventDefault();
      open(t.getAttribute('data-shot'));
    }
  });

  lbClose.addEventListener('click', close);
  lbPrev.addEventListener('click', function () { show(current - 1); });
  lbNext.addEventListener('click', function () { show(current + 1); });
  lbZoom.addEventListener('click', function () { setZoom(!lb.classList.contains('is-zoomed')); });
  lbImg.addEventListener('click', function () { setZoom(!lb.classList.contains('is-zoomed')); });

  // Click the backdrop (but not the image or the bars) to dismiss.
  lbView.addEventListener('click', function (e) {
    if (e.target === lbView) { close(); }
  });

  document.addEventListener('keydown', function (e) {
    if (lb.hidden) { return; }
    if (e.key === 'Escape') { close(); }
    else if (e.key === 'ArrowLeft') { show(current - 1); }
    else if (e.key === 'ArrowRight') { show(current + 1); }
    else if (e.key === 'Tab') {
      // Keep focus inside the dialog while it is open.
      var focusables = [].slice.call(lb.querySelectorAll('button:not([disabled])'));
      if (!focusables.length) { return; }
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
})();
