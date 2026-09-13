/* ==========================================================================
   DESIGN B — "THE GOLD LINE" · behaviour

   No CDN and no framework: the house _headers set script-src 'self'. Every
   mechanic is hand-rolled and every one is progressive enhancement — delete
   this file and the page is still readable, navigable and submittable.

   Contents
     1. motion toggle (persisted, respected by everything below)
     2. particle assembly — pixel-sampled canvas, used for the logo and the KPIs
     3. the swipe deck — native scroll, snap, progress, keyboard
     4. rail progress fallback (for engines without scroll-driven animations)
     5. photo grade on attention
     6. 3D tilt + pointer-tracked glass sheen
     7. mobile nav (focus trap, Esc, scroll lock)
     8. click-to-play video facades
   ========================================================================== */
(() => {
  "use strict";

  const root = document.documentElement;
  root.setAttribute("data-js", "");

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const STORE = "momentum-motion";

  /* -- 1. motion toggle --------------------------------------------------- */
  const toggle = document.getElementById("motionToggle");
  const stored = (() => {
    try {
      return localStorage.getItem(STORE);
    } catch {
      return null;
    }
  })();
  let motionOn = stored ? stored === "on" : !reduced.matches;

  function applyMotion() {
    root.dataset.motion = motionOn ? "on" : "off";
    if (!toggle) return;
    toggle.setAttribute("aria-pressed", String(motionOn));
    toggle.querySelector(".motion-toggle__label").textContent = motionOn ? "Motion on" : "Motion off";
  }
  applyMotion();

  toggle?.addEventListener("click", () => {
    motionOn = !motionOn;
    try {
      localStorage.setItem(STORE, motionOn ? "on" : "off");
    } catch {
      /* private mode: the toggle still works for this session */
    }
    applyMotion();
  });

  const still = () => !motionOn || reduced.matches;

  /* -- 2. PARTICLE ASSEMBLY ----------------------------------------------
     Sample the target's opaque pixels on a grid, give every sample a random
     start point out on an orbit, then fly it home on a quart-out ease. The
     colour comes from the source pixels, so the logo assembles in its own gold
     and the numbers assemble in whatever the CSS says they are.

     Cost control: DPR capped at 2, sample step scales with DPR, and the point
     budget is halved on narrow screens. Skipped entirely under reduced motion.
     -------------------------------------------------------------------------- */
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const MOBILE = window.matchMedia("(max-width: 47.99rem)").matches;

  function animateAssembly(ctx, points, w, h, done) {
    const duration = 1150;
    const ease = (v) => 1 - Math.pow(1 - v, 4);
    const t0 = performance.now();

    function frame(now) {
      ctx.clearRect(0, 0, w, h);
      let running = false;
      for (const p of points) {
        const raw = Math.max(0, Math.min(1, (now - t0 - p.delay) / duration));
        if (raw < 1) running = true;
        const t = ease(raw);
        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = raw < 0.78 ? Math.min(1, raw * 2.8) : (1 - raw) / 0.22;
        ctx.arc(
          p.sx + (p.tx - p.sx) * t,
          p.sy + (p.ty - p.sy) * t,
          p.size * (1.5 - t * 0.45),
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (running) requestAnimationFrame(frame);
      else {
        ctx.clearRect(0, 0, w, h);
        done?.();
      }
    }
    requestAnimationFrame(frame);
  }

  function samplePixels(data, w, h, step, colorOverride) {
    const points = [];
    const span = Math.max(w, h);
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const i = (y * w + x) * 4;
        if (data[i + 3] < 90) continue;
        const angle = Math.random() * Math.PI * 2;
        const radius = span * (0.34 + Math.random() * 0.66);
        points.push({
          sx: w / 2 + Math.cos(angle) * radius,
          sy: h / 2 + Math.sin(angle) * radius,
          tx: x,
          ty: y,
          delay: Math.random() * 260,
          size: Math.max(1.25, step * 0.2),
          color:
            colorOverride ||
            `rgba(${data[i]},${data[i + 1]},${data[i + 2]},${Math.min(1, data[i + 3] / 255)})`,
        });
      }
    }
    return points;
  }

  /* 2a. the logo assembles from its own gold */
  function assembleLogo(stage) {
    const img = stage.querySelector(".assemble__img");
    const canvas = stage.querySelector(".assemble__canvas");
    if (!img || !canvas || still()) return;

    const run = () => {
      const box = img.getBoundingClientRect();
      if (box.width < 8) return;

      const w = Math.round(box.width * 1.44 * DPR);
      const h = Math.round(box.height * 1.44 * DPR);
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { alpha: true });
      const off = document.createElement("canvas");
      off.width = w;
      off.height = h;
      const octx = off.getContext("2d", { willReadFrequently: true });

      const dw = box.width * DPR;
      const dh = box.height * DPR;
      octx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);

      let data;
      try {
        data = octx.getImageData(0, 0, w, h).data;
      } catch {
        return; // canvas tainted for any reason: leave the real logo visible
      }

      const step = Math.max(4, Math.round((MOBILE ? 6.5 : 4.5) * DPR));
      const points = samplePixels(data, w, h, step);
      if (!points.length) return;

      stage.classList.add("is-running");
      animateAssembly(ctx, points, w, h, () => stage.classList.remove("is-running"));
    };

    if (img.complete && img.naturalWidth) run();
    else img.addEventListener("load", run, { once: true });
  }

  document.querySelectorAll("[data-assemble]").forEach(assembleLogo);

  /* 2b. KPI numbers pop when they scroll into view */
  function burstNumber(el) {
    if (el.dataset.done) return;
    el.dataset.done = "1";
    if (still()) return;

    const style = getComputedStyle(el);
    const color = style.color;
    const box = el.getBoundingClientRect();
    if (box.width < 2 || box.height < 2) return;

    const w = Math.ceil(box.width * 1.4 * DPR);
    const h = Math.ceil(box.height * 1.4 * DPR);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.setAttribute("aria-hidden", "true");
    const ctx = canvas.getContext("2d");
    const off = document.createElement("canvas");
    off.width = w;
    off.height = h;
    const octx = off.getContext("2d", { willReadFrequently: true });

    octx.font = `${style.fontWeight} ${parseFloat(style.fontSize) * DPR}px ${style.fontFamily}`;
    octx.fillStyle = color;
    octx.textAlign = "center";
    octx.textBaseline = "middle";
    octx.fillText(el.dataset.value || el.textContent.trim(), w / 2, h / 2);

    let data;
    try {
      data = octx.getImageData(0, 0, w, h).data;
    } catch {
      return;
    }

    const step = Math.max(4, Math.round((MOBILE ? 6 : 4.5) * DPR));
    const points = samplePixels(data, w, h, step, color);
    if (!points.length) return;

    el.appendChild(canvas);
    el.classList.add("is-running");
    animateAssembly(ctx, points, w, h, () => {
      el.classList.remove("is-running");
      canvas.remove();
    });
  }

  const numObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        burstNumber(e.target);
        numObs.unobserve(e.target);
      });
    },
    { threshold: 0.45 }
  );
  document.querySelectorAll("[data-particle-number]").forEach((n) => numObs.observe(n));

  /* -- 3. the swipe deck -------------------------------------------------- */
  const track = document.getElementById("deckTrack");
  const fill = document.getElementById("deckFill");

  if (track) {
    const step = () => track.querySelector(".card")?.getBoundingClientRect().width + 16 || 320;

    document.querySelectorAll("[data-deck]").forEach((btn) => {
      btn.addEventListener("click", () => {
        track.scrollBy({
          left: btn.dataset.deck === "next" ? step() : -step(),
          behavior: still() ? "auto" : "smooth",
        });
      });
    });

    const updateProgress = () => {
      const max = track.scrollWidth - track.clientWidth;
      const pct = max > 0 ? (track.scrollLeft / max) * 100 : 100;
      // Never let the bar read as empty: the first card is already 1/7 of it.
      const floor = (1 / track.children.length) * 100;
      if (fill) fill.style.width = `${Math.max(floor, pct)}%`;
    };
    updateProgress();
    track.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    // Arrow keys work when the track has focus. The track is tabbable, and each
    // card's link is reachable by Tab, so the sequence is fully keyboard-usable.
    track.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      track.scrollBy({
        left: e.key === "ArrowRight" ? step() : -step(),
        behavior: still() ? "auto" : "smooth",
      });
    });
  }

  /* -- 4. rail progress fallback ----------------------------------------- */
  // Chromium/Safari drive this in CSS with animation-timeline: scroll().
  // Firefox stable does not ship it, so drive --scroll here instead.
  if (!CSS.supports("animation-timeline", "scroll()")) {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        root.style.setProperty("--scroll", max > 0 ? (window.scrollY / max).toFixed(4) : "1");
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  }

  /* -- 5. photo grade on attention --------------------------------------- */
  // Hover and focus are handled in CSS. This adds "centred in the viewport"
  // so the grade also rewards attention on touch devices, where there is no hover.
  const graded = document.querySelectorAll("[data-grade]");
  if (graded.length && !still()) {
    const gradeObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.target.classList.toggle("is-attended", e.isIntersecting));
      },
      { threshold: 0.62 }
    );
    graded.forEach((g) => gradeObs.observe(g));
  } else {
    graded.forEach((g) => g.classList.add("is-attended"));
  }

  /* -- 6. tilt + glass sheen --------------------------------------------- */
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch" || still()) return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty("--tilt-x", `${(-y * 9).toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${(x * 11).toFixed(2)}deg`);
    });
    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    });
  });

  document.querySelectorAll(".glass").forEach((panel) => {
    panel.addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch" || still()) return;
      const r = panel.getBoundingClientRect();
      panel.style.setProperty("--mx", `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
      panel.style.setProperty("--my", `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
    });
  });

  /* -- 7. mobile nav ----------------------------------------------------- */
  const menuBtn = document.getElementById("menuBtn");
  const mobileNav = document.getElementById("mobileNav");

  function closeMenu() {
    if (!mobileNav || mobileNav.hidden) return;
    mobileNav.hidden = true;
    menuBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    menuBtn.focus();
  }

  menuBtn?.addEventListener("click", () => {
    const open = mobileNav.hidden;
    mobileNav.hidden = !open;
    menuBtn.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
    if (open) mobileNav.querySelector("a")?.focus();
  });

  mobileNav?.addEventListener("click", (e) => {
    if (e.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
    if (e.key !== "Tab" || !mobileNav || mobileNav.hidden) return;
    const items = [menuBtn, ...mobileNav.querySelectorAll("a, button")];
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  /* -- 8. video facades -------------------------------------------------- */
  document.querySelectorAll(".facade").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.yt;
      if (!id) return;
      const frame = document.createElement("iframe");
      frame.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
      frame.title = btn.querySelector(".facade__title")?.textContent || "Video";
      frame.allow = "accelerometer; autoplay; encrypted-media; picture-in-picture";
      frame.allowFullscreen = true;
      btn.replaceWith(frame);
      frame.focus();
    });
  });

  /* -- form: pending state without moving the form under the visitor ----- */
  const form = document.querySelector(".form");
  form?.addEventListener("submit", (e) => {
    const status = form.querySelector(".form__status");
    if (status) status.textContent = "SENDING…";
    if (e.submitter) e.submitter.disabled = true;
  });
})();
