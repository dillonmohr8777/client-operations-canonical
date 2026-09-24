/* Bridge Field Notes motion.
   Rules: transform + opacity only, one rAF loop for the scrubbed section,
   and a full prefers-reduced-motion path that shows everything at rest. */
(() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const intro   = $('[data-intro]');

  /* Failsafe: whatever else happens, the hero copy becomes visible. */
  const revealIntro = () => intro && intro.classList.add('go');
  const failsafe = window.setTimeout(revealIntro, 4600);

  /* ───────────────────────── 1 · letter-cycling intro ───────────────────────── */
  const letters = $$('[data-wm]');
  const TREATMENTS = ['t0', 't1', 't2', 't3', 't4', 't5', 't6'];

  function spark(el) {
    el.classList.remove('sparking');
    void el.offsetWidth;
    el.classList.add('sparking');
    window.setTimeout(() => el.classList.remove('sparking'), 460);
  }

  function playIntro() {
    if (reduced.matches || !letters.length) { revealIntro(); return; }

    /* pin each slot to the width of its true glyph first, so the swaps
       happen in place, the way Apple's do, instead of reflowing the word */
    letters.forEach(el => { el.style.width = el.getBoundingClientRect().width.toFixed(2) + 'px'; });

    const timers = [];
    const at = (ms, fn) => timers.push(window.setTimeout(fn, ms));

    const START = 480;      // a beat of the true wordmark, still and centred
    const SWAP  = 140;      // fast swaps, Apple pacing
    const RUNS  = 10;       // swaps per letter
    const RESOLVE = START + RUNS * SWAP;   // 1880

    letters.forEach((el, i) => {
      const offset = i * 38;
      let last = -1;
      for (let n = 0; n < RUNS; n++) {
        at(START + offset + n * SWAP, () => {
          let pick = Math.floor(Math.random() * TREATMENTS.length);
          if (pick === last) pick = (pick + 1) % TREATMENTS.length;
          last = pick;
          el.className = 'wm ' + TREATMENTS[pick];
          spark(el);
        });
      }
      /* the resolve, staggered, each landing on the true mark with a spark */
      at(RESOLVE + 120 + i * 62, () => { el.className = 'wm'; spark(el); });
    });

    /* a beat of stillness on the resolved wordmark, then the object rises */
    at(RESOLVE + 120 + letters.length * 62 + 320, revealIntro);

    /* if they start reading before we finish showing off, get out of the way */
    const bail = () => {
      timers.forEach(window.clearTimeout);
      letters.forEach(el => { el.className = 'wm'; });
      revealIntro();
      window.removeEventListener('scroll', bail);
    };
    window.addEventListener('scroll', bail, { once: true, passive: true });
  }

  /* ───────────────────────── 2 · reveal on scroll ───────────────────────── */
  const lifts = $$('[data-lift]');
  if (!('IntersectionObserver' in window) || reduced.matches) {
    lifts.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    lifts.forEach(el => io.observe(el));
  }

  /* ───────────────────── 3 · pinned, scroll-scrubbed centrepiece ───────────────────── */
  const pin      = $('[data-pin]');
  const rig      = $('[data-rig]');
  const turn     = $('[data-turn]');

  /* The turnaround is 73 frames, about 1 MB. A phone never scrubs it, so the
     markup ships one frame and the rest are built here only on a wide viewport.
     On a phone that single frame is swapped for a three-quarter pose instead. */
  const wide = window.matchMedia('(min-width: 621px)');

  function buildFrames() {
    if (!turn || turn.dataset.built) return;
    turn.dataset.built = '1';
    const total = Number(turn.dataset.frames) || 0;
    const base  = turn.dataset.src || '';
    /* the markup carries the still; the scrub needs frame 000 in that slot */
    turn.firstElementChild.src = base + '000.webp';
    const frag  = document.createDocumentFragment();
    for (let n = 1; n < total; n++) {
      const img = new Image(400, 490);
      img.src = base + String(n).padStart(3, '0') + '.webp';
      img.alt = '';
      img.setAttribute('aria-hidden', 'true');
      img.decoding = 'async';
      frag.appendChild(img);
    }
    turn.appendChild(frag);
  }

  /* reduced motion keeps the still too, so it never pays for 73 frames either */
  if (wide.matches && !reduced.matches) buildFrames();

  const frames   = turn ? Array.prototype.slice.call(turn.children) : [];
  const NF       = frames.length;
  const callouts = $$('.callout');
  const caps     = $$('.cap');
  const sticky   = pin && pin.querySelector('.pin-sticky');

  let target = 0;      // raw scroll progress, 0..1
  let cur    = 0;      // eased value actually rendered
  let running = false;
  let stage  = -1;
  let lit    = -1;     // index of the frame pair currently carrying opacity
  let spin   = 0;      // free rotation, so the mascot keeps turning between scrolls

  function fitRig() {
    if (!rig) return;
    const rs = Math.max(0.46, Math.min(1, (window.innerWidth - 48) / 350, (window.innerHeight - 400) / 430));
    rig.style.setProperty('--rs', rs.toFixed(3));
  }

  function readProgress() {
    if (!pin) return 0;
    const travel = Math.max(1, pin.offsetHeight - window.innerHeight);
    return clamp((window.scrollY - pin.offsetTop) / travel);
  }

  function paint() {
    const rotPhase = clamp(cur / 0.80);        // scroll position drives the stages
    const spun     = rotPhase * 2 + spin;      // two turns across the scrub, plus free spin
    const turned   = spun * Math.PI * 2;
    const q        = clamp((cur - 0.80) / 0.20);

    /* scrub the turnaround. two neighbouring frames carry opacity at once, so
       the sequence dissolves rather than cutting, and only opacity is touched. */
    const p = ((spun % 1) + 1) % 1 * NF;
    const i = Math.floor(p) % NF;
    const j = (i + 1) % NF;
    const t = p - Math.floor(p);
    if (i !== lit) {
      if (lit >= 0) { frames[lit].style.opacity = '0'; frames[(lit + 1) % NF].style.opacity = '0'; }
      frames[i].style.opacity = '1';
      lit = i;
    }
    frames[j].style.opacity = t.toFixed(3);

    sticky.style.setProperty('--q', q.toFixed(4));
    /* the plume tracks the raised hand as the mascot comes round */
    rig.style.setProperty('--px', (50 + 23 * Math.cos(turned)).toFixed(2) + '%');
    rig.style.setProperty('--sh', (0.80 + 0.20 * Math.abs(Math.cos(turned))).toFixed(3));
    sticky.style.setProperty('--rail', (cur > 0.05 && q < 0.30) ? '1' : '0');

    const next = q > 0.22 ? -1 : rotPhase < 0.34 ? 0 : rotPhase < 0.68 ? 1 : 2;
    if (next !== stage) {
      stage = next;
      callouts.forEach(c => c.classList.toggle('show', Number(c.dataset.at) === stage));
      caps.forEach(c => c.classList.toggle('show', Number(c.dataset.cap) === stage));
    }
  }

  function loop() {
    const diff = target - cur;
    cur += diff * 0.16;                       // eased scrub, no jitter, no timers
    spin += 0.0016;                           // keeps turning when the reader stops
    if (Math.abs(diff) < 0.00015) cur = target;
    paint();
    if (running) window.requestAnimationFrame(loop);
  }

  if (pin && NF > 1 && rig && sticky && !reduced.matches && wide.matches) {
    const pinIO = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) { running = true; target = readProgress(); window.requestAnimationFrame(loop); }
      else if (!e.isIntersecting) { running = false; }
    }, { rootMargin: '20% 0px' });
    pinIO.observe(pin);
    fitRig();
    target = cur = readProgress();
    paint();
  }

  /* ───────────────────────── 4 · topbar + scroll bus ───────────────────────── */
  const topbar = $('[data-topbar]');
  let frame = 0;

  function onScrollFrame() {
    frame = 0;
    if (topbar) topbar.dataset.scrolled = String(window.scrollY > 14);
    if (running) target = readProgress();
  }
  function onScroll() { if (!frame) frame = window.requestAnimationFrame(onScrollFrame); }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { if (running) fitRig(); onScroll(); }, { passive: true });

  /* ───────────────────────── 5 · route carousel ───────────────────────── */
  const track  = $('[data-track]');
  const slides = $$('[data-slide]');
  const prev   = $('[data-prev]');
  const next   = $('[data-next]');
  const count  = $('[data-count]');
  let index = 0;

  function nearest() {
    if (!track) return 0;
    const mid = track.scrollLeft + track.clientWidth / 2;
    let best = 0, bestD = Infinity;
    slides.forEach((s, i) => {
      const d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - mid);
      if (d < bestD) { bestD = d; best = i; }
    });
    return best;
  }

  function syncCarousel() {
    index = nearest();
    if (count) count.textContent = `${index + 1} / ${slides.length}`;
    if (prev) prev.disabled = index <= 0;
    if (next) next.disabled = index >= slides.length - 1;
  }

  function goTo(i) {
    const t = clamp(i, 0, slides.length - 1);
    const s = slides[t];
    if (!s || !track) return;
    track.scrollTo({
      left: s.offsetLeft - (track.clientWidth - s.offsetWidth) / 2,
      behavior: reduced.matches ? 'auto' : 'smooth'
    });
  }

  if (track) {
    prev?.addEventListener('click', () => goTo(index - 1));
    next?.addEventListener('click', () => goTo(index + 1));
    let cFrame = 0;
    track.addEventListener('scroll', () => {
      if (cFrame) return;
      cFrame = window.requestAnimationFrame(() => { cFrame = 0; syncCarousel(); });
    }, { passive: true });
    track.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      goTo(index + (e.key === 'ArrowRight' ? 1 : -1));
    });
    syncCarousel();
  }

  /* ───────────────────────── 6 · the intern watches your cursor ───────────────────────── */
  const buddy = $('[data-buddy]');
  const stageEl = $('[data-stage]');

  if (buddy && stageEl && !reduced.matches) {
    buddy.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      const b = buddy.getBoundingClientRect();
      stageEl.style.setProperty('--px', clamp((e.clientX - b.left) / b.width * 2 - 1, -1, 1).toFixed(3));
      stageEl.style.setProperty('--py', clamp((e.clientY - b.top) / b.height * 2 - 1, -1, 1).toFixed(3));
    }, { passive: true });
    buddy.addEventListener('pointerleave', () => {
      stageEl.style.setProperty('--px', '0');
      stageEl.style.setProperty('--py', '0');
    });
  }

  /* ───────────────────────── go ───────────────────────── */
  reduced.addEventListener('change', () => { if (reduced.matches) revealIntro(); });

  const start = () => {
    onScrollFrame();
    try { playIntro(); } catch (err) { revealIntro(); }
    window.clearTimeout(failsafe);
    window.setTimeout(revealIntro, 4600);   // belt and braces
    document.body.dataset.ready = 'true';
  };

  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });
})();
