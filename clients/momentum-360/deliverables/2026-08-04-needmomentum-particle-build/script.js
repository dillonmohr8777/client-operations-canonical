/* ==========================================================================
   Need Momentum — MOTION build
   Two mechanics, hand-rolled, no dependencies (house CSP is script-src 'self').

     1. nmField    — one ambient particle field across the WHOLE page, tinted
                     per section so it reads on navy, white AND yellow.
     2. nmResolve  — particles that ASSEMBLE into the real logo / real text and
                     then hand off to it. Fires once. Never loops.

   The architectural rule that makes #2 work, and that the previous build was
   missing: THE PARTICLES ARE NEVER THE FINAL STATE. The real <img> and the real
   <p> are in the DOM from the first byte. The canvas is a temporary overlay that
   dies. That is why the end state is fully crisp at any DPR, why the text stays
   selectable, why it works with JS disabled, and why it costs nothing after
   ~1.4s. A canvas treated as the destination can never resolve.
   ========================================================================== */
(() => {
  "use strict";

  const root = document.documentElement;
  root.setAttribute("data-js", "");

  const reduceMQ = matchMedia("(prefers-reduced-motion: reduce)");
  const DPR = Math.min(devicePixelRatio || 1, 2);
  const MOBILE = matchMedia("(max-width: 767px)").matches;
  const STORE = "nm-motion";

  /* ---------------------------------------------------------------- motion */
  const toggle = document.getElementById("motionToggle");
  let stored = null;
  try {
    stored = localStorage.getItem(STORE);
  } catch {}
  let motionOn = stored ? stored === "on" : !reduceMQ.matches;

  function applyMotion() {
    root.dataset.motion = motionOn ? "on" : "off";
    if (!toggle) return;
    toggle.setAttribute("aria-pressed", String(motionOn));
    const l = toggle.querySelector(".mt__label");
    if (l) l.textContent = motionOn ? "Motion on" : "Motion off";
  }
  applyMotion();

  const still = () => !motionOn || reduceMQ.matches;

  /* --------------------------------------------------------------------------
     Canvas sizing. THE bug this build fixes: the previous hero canvas set
     canvas.width = cssWidth * dpr and never set canvas.style.width. A canvas
     with no CSS width lays out at its ATTRIBUTE width in CSS pixels, so
     234 * 2 = 468 became a 468px-wide element inside a 390px viewport and got
     clipped. Both pairs must be set, and the size must come from the parent's
     measured box — never window.innerWidth, which includes the desktop
     scrollbar and disagrees with the visual viewport on iOS.
     -------------------------------------------------------------------------- */
  function sizeCanvas(cv, boxW, boxH) {
    cv.width = Math.max(1, Math.round(boxW * DPR));
    cv.height = Math.max(1, Math.round(boxH * DPR));
    cv.style.width = boxW + "px";
    cv.style.height = boxH + "px";
    const ctx = cv.getContext("2d");
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    return ctx;
  }

  /* ==========================================================================
     1. AMBIENT FIELD
     One fixed canvas, above the sections at low alpha (a field *under* opaque
     sections would simply be invisible), tinted per section from a
     document-space registry so it works on navy, paper and yellow alike.

     Why not mix-blend-mode: `screen` is a mathematical no-op against near-white
     — the particles would literally vanish on half the page — and `multiply` is
     the exact inverse. Per-particle tint is the only option that spans both.

     Why Canvas2D not WebGL: the budget is ~700-2200 points, and WebGL's
     advantage starts around 50k. Shader compile costs 8-40ms on mid-range
     Android and lands during LCP for zero visual gain, and skipping it deletes
     the entire webglcontextlost failure class.
     ========================================================================== */

  // Perceptual asymmetry: a dark dot on white needs MORE radius and LESS alpha
  // than a bright dot on navy to read as the same visual weight. Ship different
  // geometry per band, not just a different colour.
  const BANDS = {
    navy: { c: "#7be7ff", a: 0.30, r: 1.15, warm: "#ffc72c", warmMix: 0.2 },
    "navy-mid": { c: "#4ca6ff", a: 0.26, r: 1.2 },
    paper: { c: "#0b2149", a: 0.14, r: 1.6 },
    "paper-2": { c: "#1b4f99", a: 0.12, r: 1.55 },
    yellow: { c: "#071632", a: 0.16, r: 1.6 },
    gold: { c: "#ffc72c", a: 0.28, r: 1.3 },
  };

  function budget() {
    let net = null;
    try {
      net = navigator.connection || null;
    } catch {}
    if (net && net.saveData === true) return 0; // respect Save-Data entirely
    const cores = navigator.hardwareConcurrency || 4;
    let n = innerWidth < 768 ? 700 : innerWidth < 1100 ? 1300 : 2200;
    if (cores <= 4) n = Math.round(n * 0.55);
    if ((devicePixelRatio || 1) >= 3) n = Math.round(n * 0.75); // fill-rate bound
    return n;
  }

  function initField() {
    const cv = document.getElementById("nmField");
    if (!cv) return null;
    if (still()) return null;
    const COUNT = budget();
    if (!COUNT) return null;

    let ctx = sizeCanvas(cv, innerWidth, innerHeight);
    let W = innerWidth,
      H = innerHeight;

    // Pre-rendered sprites: one soft dot per band. drawImage of a cached sprite
    // is markedly cheaper than arc()+fill() per particle per frame.
    const sprites = {};
    function buildSprites() {
      for (const [k, b] of Object.entries(BANDS)) {
        const rad = b.r * 3.2;
        const s = document.createElement("canvas");
        const d = Math.ceil(rad * 2 * DPR);
        s.width = s.height = d;
        const c = s.getContext("2d");
        c.scale(DPR, DPR);
        const g = c.createRadialGradient(rad, rad, 0, rad, rad, rad);
        g.addColorStop(0, b.c);
        g.addColorStop(0.45, b.c);
        g.addColorStop(1, "transparent");
        c.fillStyle = g;
        c.beginPath();
        c.arc(rad, rad, rad, 0, Math.PI * 2);
        c.fill();
        sprites[k] = { cv: s, rad, alpha: b.a };
      }
    }
    buildSprites();

    // --- document-space band registry -------------------------------------
    // Every [data-band] section contributes a document-Y range. A particle
    // picks its tint from wherever it currently sits, so a single continuous
    // field crosses section boundaries instead of reading as separate tiles.
    let bands = [];
    function readBands() {
      const y = scrollY;
      bands = [...document.querySelectorAll("[data-band]")].map((el) => {
        const r = el.getBoundingClientRect();
        return { top: r.top + y, bottom: r.bottom + y, key: el.dataset.band };
      });
    }

    // --- coarse text-occupancy grid ---------------------------------------
    // Particles never sit on top of running text. A per-particle rect test each
    // frame would be O(n*m); a 32px occupancy grid makes it a single O(1)
    // lookup. Rebuilt only on resize and on a throttled scroll.
    const CELL = 32;
    let occ = new Set();
    function readOcc() {
      occ = new Set();
      const sel = "h1,h2,h3,p,li,a,button,figcaption,label,input,textarea,summary";
      for (const el of document.querySelectorAll(sel)) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -80 || r.top > H + 80 || r.width < 4) continue;
        const x0 = Math.floor((r.left - 6) / CELL),
          x1 = Math.ceil((r.right + 6) / CELL);
        const y0 = Math.floor((r.top - 4) / CELL),
          y1 = Math.ceil((r.bottom + 4) / CELL);
        for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) occ.add(x + "," + y);
      }
    }
    const onText = (x, y) => occ.has(Math.floor(x / CELL) + "," + Math.floor(y / CELL));

    // --- particles ---------------------------------------------------------
    const P = [];
    function seed(n) {
      P.length = 0;
      for (let i = 0; i < n; i++) {
        P.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.16,
          vy: (Math.random() - 0.5) * 0.16 - 0.05,
          s: 0.65 + Math.random() * 0.85,
          ph: Math.random() * Math.PI * 2,
        });
      }
    }
    seed(COUNT);

    let live = COUNT;
    let mx = -9999,
      my = -9999;
    addEventListener(
      "pointermove",
      (e) => {
        if (e.pointerType === "touch") return;
        mx = e.clientX;
        my = e.clientY;
      },
      { passive: true }
    );
    addEventListener("pointerleave", () => {
      mx = my = -9999;
    });

    function bandAt(docY) {
      for (let i = 0; i < bands.length; i++) {
        const b = bands[i];
        if (docY >= b.top && docY < b.bottom) return b.key;
      }
      return "navy";
    }

    // Adaptive governor: a static device gate cannot catch a thermally
    // throttled phone. Watch a rolling mean and shed points if we fall behind.
    let times = [],
      slow = 0,
      fast = 0,
      raf = 0,
      dead = false,
      last = performance.now();

    function frame(now) {
      if (dead) return;
      const dt = Math.min(48, now - last);
      last = now;
      const t0 = performance.now();

      ctx.clearRect(0, 0, W, H);
      const sy = scrollY;

      for (let i = 0; i < live; i++) {
        const p = P[i];
        p.x += p.vx * dt * 0.06;
        p.y += p.vy * dt * 0.06;
        // gentle mouse repulsion, hero-strength only
        if (mx > -9998) {
          const dx = p.x - mx,
            dy = p.y - my,
            d2 = dx * dx + dy * dy;
          if (d2 < 14400 && d2 > 1) {
            const f = (1 - Math.sqrt(d2) / 120) * 0.55;
            p.x += dx * f * 0.06;
            p.y += dy * f * 0.06;
          }
        }
        if (p.x < -8) p.x = W + 8;
        else if (p.x > W + 8) p.x = -8;
        if (p.y < -8) p.y = H + 8;
        else if (p.y > H + 8) p.y = -8;

        if (onText(p.x, p.y)) continue; // keep type clean

        const key = bandAt(p.y + sy);
        const sp = sprites[key] || sprites.navy;
        const tw = Math.sin(p.ph + now * 0.0007) * 0.28 + 0.72;
        ctx.globalAlpha = sp.alpha * tw;
        const r = sp.rad * p.s;
        ctx.drawImage(sp.cv, p.x - r, p.y - r, r * 2, r * 2);
      }
      ctx.globalAlpha = 1;

      const cost = performance.now() - t0;
      times.push(cost);
      if (times.length > 30) times.shift();
      const mean = times.reduce((a, b) => a + b, 0) / times.length;
      if (mean > 20) {
        if (++slow > 60) {
          live = Math.max(300, Math.round(live * 0.75));
          slow = 0;
          times = [];
        }
      } else slow = 0;
      if (mean < 10 && live < COUNT) {
        if (++fast > 240) {
          live = Math.min(COUNT, Math.round(live * 1.15));
          fast = 0;
        }
      } else fast = 0;

      raf = requestAnimationFrame(frame);
    }

    function resize() {
      W = innerWidth;
      H = innerHeight;
      ctx = sizeCanvas(cv, W, H);
      buildSprites();
      readBands();
      readOcc();
      seed(budget() || COUNT);
      live = P.length;
    }

    let sTick = 0;
    const onScroll = () => {
      if (sTick) return;
      sTick = requestAnimationFrame(() => {
        sTick = 0;
        readOcc();
      });
    };

    readBands();
    readOcc();
    addEventListener("resize", resize);
    addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(frame);

    return {
      destroy() {
        dead = true;
        cancelAnimationFrame(raf);
        removeEventListener("resize", resize);
        removeEventListener("scroll", onScroll);
        ctx.clearRect(0, 0, W, H);
      },
    };
  }

  let field = initField();
  // Honour a mid-session change of heart in either direction.
  reduceMQ.addEventListener?.("change", () => {
    field?.destroy();
    field = initField();
  });
  toggle?.addEventListener("click", () => {
    motionOn = !motionOn;
    try {
      localStorage.setItem(STORE, motionOn ? "on" : "off");
    } catch {}
    applyMotion();
    field?.destroy();
    field = initField();
  });

  /* ==========================================================================
     2. RESOLVE — assemble, then hand off to the real thing.
     ========================================================================== */

  const quartOut = (v) => 1 - Math.pow(1 - v, 4);
  const DUR = 1150;
  const MAX_DELAY = 260;

  function shuffle(a) {
    // Shuffle BEFORE any decimation. Decimating a lattice in index order strips
    // whole rows and produces visible moire banding.
    for (let i = a.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function samplePoints(data, w, h, step, cap, tint) {
    const pts = [];
    const span = Math.max(w, h);
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const i = (y * w + x) * 4;
        if (data[i + 3] < 90) continue;
        const ang = Math.random() * Math.PI * 2;
        const rad = span * (0.34 + Math.random() * 0.66);
        pts.push({
          sx: w / 2 + Math.cos(ang) * rad,
          sy: h / 2 + Math.sin(ang) * rad,
          tx: x,
          ty: y,
          dl: Math.random() * MAX_DELAY,
          sz: Math.max(1.15, step * 0.22),
          co: tint || `rgba(${data[i]},${data[i + 1]},${data[i + 2]},${Math.min(1, data[i + 3] / 255)})`,
        });
      }
    }
    shuffle(pts);
    return cap && pts.length > cap ? pts.slice(0, cap) : pts;
  }

  /* The handoff. The alpha curve already fades particles out over the last 22%
     of the timeline, so the real element is faded IN across exactly that window.
     quartOut has covered 99.8% of the travel distance by v=0.78, so particle and
     target are pixel-coincident before the crossfade starts — the eye reads it
     as focus snapping in, not as anything moving.

     Three anti-flash rules, all load-bearing:
       1. Hide the real element in the SAME task as canvas insertion, never in a
          rAF callback, or the browser ships one frame with the crisp asset
          visible and no canvas over it.
       2. opacity:0 — never visibility/display. Those change layout, which
          invalidates the glyph rects we sampled, and drop the node out of the
          accessibility tree. opacity keeps the text selectable and readable to
          a screen reader for the whole 1.4s.
       3. Remove the canvas after a DOUBLE rAF, so the final opacity:1 write has
          composited before the overlay leaves. */
  function run(ctx, cv, pts, w, h, real, done) {
    const t0 = performance.now();
    const total = DUR + MAX_DELAY;
    function frame(now) {
      ctx.clearRect(0, 0, w, h);
      let running = false;
      for (const p of pts) {
        const raw = Math.max(0, Math.min(1, (now - t0 - p.dl) / DUR));
        if (raw < 1) running = true;
        const t = quartOut(raw);
        ctx.globalAlpha = raw < 0.78 ? Math.min(1, raw * 2.8) : (1 - raw) / 0.22;
        ctx.fillStyle = p.co;
        const r = p.sz * (1.5 - t * 0.45);
        ctx.beginPath();
        ctx.arc(p.sx + (p.tx - p.sx) * t, p.sy + (p.ty - p.sy) * t, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      const g = Math.max(0, Math.min(1, (now - t0) / total));
      if (real) real.style.opacity = String(Math.max(0, Math.min(1, (g - 0.78) / 0.22)));

      if (running) requestAnimationFrame(frame);
      else {
        if (real) real.style.opacity = "1";
        requestAnimationFrame(() => requestAnimationFrame(() => cv.remove()));
        done && done();
      }
    }
    requestAnimationFrame(frame);
  }

  /* --- 2a. the hero logo: assembles, ends FULLY CRISP --------------------- */
  function assembleLogo(stage) {
    if (stage.dataset.done) return;
    stage.dataset.done = "1";
    const img = stage.querySelector("img");
    if (!img) return;
    if (still()) return; // crisp logo is already visible; nothing to do

    const go = () => {
      const box = img.getBoundingClientRect();
      if (box.width < 24) return;
      const cv = document.createElement("canvas");
      cv.className = "nm-cv";
      cv.setAttribute("aria-hidden", "true");
      const PAD = 1.4;
      const w = box.width * PAD,
        h = box.height * PAD;
      const ctx = sizeCanvas(cv, w, h);

      const off = document.createElement("canvas");
      off.width = Math.round(w * DPR);
      off.height = Math.round(h * DPR);
      const octx = off.getContext("2d", { willReadFrequently: true });
      octx.drawImage(
        img,
        ((w - box.width) / 2) * DPR,
        ((h - box.height) / 2) * DPR,
        box.width * DPR,
        box.height * DPR
      );
      let data;
      try {
        data = octx.getImageData(0, 0, off.width, off.height).data;
      } catch {
        return; // tainted canvas: leave the crisp logo alone
      }

      const step = Math.max(4, Math.round((MOBILE ? 6 : 4.5) * DPR));
      const pts = samplePoints(data, off.width, off.height, step, MOBILE ? 2600 : 5200);
      if (!pts.length) return;
      // sampled in device px, drawn in CSS px
      for (const p of pts) {
        p.sx /= DPR;
        p.sy /= DPR;
        p.tx /= DPR;
        p.ty /= DPR;
        p.sz /= DPR;
      }

      // Rule 1: both mutations in one task.
      stage.appendChild(cv);
      img.style.opacity = "0";
      run(ctx, cv, pts, w, h, img);
    };

    if (img.complete && img.naturalWidth) go();
    else img.addEventListener("load", go, { once: true });
  }

  /* --- 2b. bio text: assembles into REAL selectable text ------------------
     Only the lead sentence assembles. A full 3-paragraph bio is ~8,500 points
     (5-6ms/frame, over budget) and reads as noise besides. The lead line is the
     most persuasive sentence in each bio, and the remaining paragraphs fade in
     behind it — cheaper AND better.

     The step must be derived from font size. A flat step of 4.5 CSS px steps
     straight over a 2px body stem, which turns a paragraph into illegible
     confetti; that step was tuned for a 96px display headline. */
  function assembleText(el) {
    if (el.dataset.done) return;
    el.dataset.done = "1";
    if (still()) return;

    const cs = getComputedStyle(el);
    const box = el.getBoundingClientRect();
    if (box.width < 40 || box.height < 8) return;

    const cv = document.createElement("canvas");
    cv.className = "nm-cv";
    cv.setAttribute("aria-hidden", "true");
    const PAD = 1.12;
    const w = box.width * PAD,
      h = box.height * PAD;
    const ctx = sizeCanvas(cv, w, h);

    const off = document.createElement("canvas");
    off.width = Math.round(w * DPR);
    off.height = Math.round(h * DPR);
    const octx = off.getContext("2d", { willReadFrequently: true });
    const fs = parseFloat(cs.fontSize);
    const lh = parseFloat(cs.lineHeight) || fs * 1.6;
    octx.font = `${cs.fontWeight} ${fs * DPR}px ${cs.fontFamily}`;
    octx.fillStyle = cs.color;
    octx.textBaseline = "alphabetic";

    // fillText is single-line, so wrap manually at the element's real width
    const words = (el.textContent || "").trim().split(/\s+/);
    const maxW = box.width * DPR;
    const lines = [];
    let cur = "";
    for (const word of words) {
      const test = cur ? cur + " " + word : word;
      if (octx.measureText(test).width > maxW && cur) {
        lines.push(cur);
        cur = word;
      } else cur = test;
    }
    if (cur) lines.push(cur);

    const padX = ((w - box.width) / 2) * DPR;
    const padY = ((h - box.height) / 2) * DPR;
    lines.forEach((ln, i) => {
      octx.fillText(ln, padX, padY + (i + 0.78) * lh * DPR);
    });

    let data;
    try {
      data = octx.getImageData(0, 0, off.width, off.height).data;
    } catch {
      return;
    }

    // font-size-derived lattice: 20px@dpr2 -> 4, 96px@dpr2 -> 21. One formula.
    const coef = MOBILE ? 0.16 : 0.11;
    const step = Math.min(24, Math.max(3, Math.round(fs * coef * DPR)));
    const pts = samplePoints(data, off.width, off.height, step, MOBILE ? 1800 : 4000);
    if (!pts.length) return;
    for (const p of pts) {
      p.sx /= DPR;
      p.sy /= DPR;
      p.tx /= DPR;
      p.ty /= DPR;
      p.sz /= DPR;
    }

    el.style.position = el.style.position || "relative";
    el.appendChild(cv);
    el.style.opacity = "0";
    run(ctx, cv, pts, w, h, el);
  }

  /* --- fire once, never loop -------------------------------------------- */
  const once = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target;
        once.unobserve(el); // <- this is why it never loops
        if (el.hasAttribute("data-assemble-logo")) assembleLogo(el);
        else assembleText(el);
      }
    },
    { threshold: 0.45 }
  );
  document
    .querySelectorAll("[data-assemble-logo],[data-assemble-text]")
    .forEach((el) => once.observe(el));

  /* --- plain scroll reveals --------------------------------------------- */
  const rises = document.querySelectorAll(".rise");
  if (still()) rises.forEach((e) => e.classList.add("in"));
  else {
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    rises.forEach((e) => io.observe(e));
  }

  /* --- services deck: native scroll, arrows, keyboard ------------------- */
  const track = document.getElementById("deck");
  if (track) {
    const stepBy = () => (track.querySelector(".card")?.getBoundingClientRect().width || 320) + 20;
    document.querySelectorAll("[data-deck]").forEach((b) =>
      b.addEventListener("click", () =>
        track.scrollBy({
          left: b.dataset.deck === "next" ? stepBy() : -stepBy(),
          behavior: still() ? "auto" : "smooth",
        })
      )
    );
    const fill = document.getElementById("deckFill");
    const upd = () => {
      const max = track.scrollWidth - track.clientWidth;
      const pct = max > 0 ? (track.scrollLeft / max) * 100 : 100;
      if (fill) fill.style.width = Math.max(100 / track.children.length, pct) + "%";
    };
    upd();
    track.addEventListener("scroll", upd, { passive: true });
    addEventListener("resize", upd);
    track.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      track.scrollBy({
        left: e.key === "ArrowRight" ? stepBy() : -stepBy(),
        behavior: still() ? "auto" : "smooth",
      });
    });
  }

  /* --- mobile nav: focus trap, Esc, scroll lock ------------------------- */
  const mb = document.getElementById("menuBtn");
  const mn = document.getElementById("mobileNav");
  const closeMenu = () => {
    if (!mn || mn.hidden) return;
    mn.hidden = true;
    mb.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    mb.focus();
  };
  mb?.addEventListener("click", () => {
    const open = mn.hidden;
    mn.hidden = !open;
    mb.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
    if (open) mn.querySelector("a")?.focus();
  });
  mn?.addEventListener("click", (e) => e.target.closest("a") && closeMenu());
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
    if (e.key !== "Tab" || !mn || mn.hidden) return;
    const items = [mb, ...mn.querySelectorAll("a,button")];
    const first = items[0],
      last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  /* --- form pending state ------------------------------------------------ */
  const form = document.querySelector(".form");
  form?.addEventListener("submit", (e) => {
    const s = form.querySelector(".form__status");
    if (s) s.textContent = "SENDING…";
    if (e.submitter) e.submitter.disabled = true;
  });
})();
