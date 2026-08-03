/* ==========================================================================
   DESIGN A — behaviour
   No CDN, no framework. The house _headers set script-src 'self', so every
   mechanic here is hand-rolled and the whole file is progressive enhancement:
   remove it and the page is still readable, navigable and submittable.
   ========================================================================== */
(() => {
  "use strict";

  const root = document.documentElement;
  root.setAttribute("data-js", "");

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const STORE = "momentum-motion";

  /* --- motion toggle: user control, persisted, respected everywhere ------ */
  const toggle = document.getElementById("motionToggle");
  const stored = (() => {
    try {
      return localStorage.getItem(STORE);
    } catch {
      return null;
    }
  })();

  let motionOn = stored ? stored === "on" : !prefersReduced.matches;

  function applyMotion() {
    root.dataset.motion = motionOn ? "on" : "off";
    if (toggle) {
      toggle.setAttribute("aria-pressed", String(motionOn));
      toggle.querySelector(".motion-toggle__label").textContent = motionOn ? "Motion on" : "Motion off";
    }
  }
  applyMotion();

  toggle?.addEventListener("click", () => {
    motionOn = !motionOn;
    try {
      localStorage.setItem(STORE, motionOn ? "on" : "off");
    } catch {
      /* private mode — the toggle still works for this session */
    }
    applyMotion();
  });

  const still = () => !motionOn || prefersReduced.matches;

  /* --- boot overlay ------------------------------------------------------- */
  const boot = document.getElementById("boot");
  const bootStatus = document.getElementById("bootStatus");

  if (boot) {
    if (still()) {
      boot.setAttribute("data-done", "");
    } else {
      const lines = [
        "INITIALISING SPATIAL LINK…",
        "LOCKING GEOSPATIAL DATA…",
        "RESOLVING BRAND LOCKUP…",
        "LINK SYNCHRONISED",
      ];
      let i = 0;
      const tick = setInterval(() => {
        i += 1;
        if (i < lines.length && bootStatus) bootStatus.textContent = lines[i];
        if (i >= lines.length - 1) clearInterval(tick);
      }, 460);

      const dismiss = () => {
        clearInterval(tick);
        boot.setAttribute("data-done", "");
      };
      // Whichever is later: load, or 1.9s. Hard failsafe at 2.6s so a slow
      // network can never leave a visitor staring at the overlay.
      const min = new Promise((r) => setTimeout(r, 1900));
      const loaded = document.readyState === "complete"
        ? Promise.resolve()
        : new Promise((r) => window.addEventListener("load", r, { once: true }));
      Promise.all([min, loaded]).then(dismiss);
      setTimeout(dismiss, 2600);
    }
  }

  /* --- scroll reveals ---------------------------------------------------- */
  // Only needed where CSS scroll-driven animations are unavailable
  // (Firefox stable as of Aug 2026). Elsewhere CSS already handled it.
  const reveals = document.querySelectorAll(".reveal");
  if (still()) {
    reveals.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  }

  /* --- sticky nav sentinel (fallback for scroll-state queries) ----------- */
  const navShell = document.querySelector(".nav-shell");
  if (navShell && !CSS.supports("container-type", "scroll-state")) {
    const sentinel = document.createElement("div");
    sentinel.setAttribute("aria-hidden", "true");
    sentinel.style.cssText = "position:absolute;top:0;height:1px;width:1px;";
    navShell.parentNode.insertBefore(sentinel, navShell);
    new IntersectionObserver(
      ([entry]) => navShell.classList.toggle("is-stuck", !entry.isIntersecting),
      { threshold: 1 }
    ).observe(sentinel);
  }

  /* --- mobile nav: focus trap, Esc, scroll lock -------------------------- */
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

  /* --- globe: pointer parallax + live coordinate HUD --------------------- */
  const globe = document.getElementById("globe");
  const hud = document.getElementById("globeHud");

  if (globe) {
    let raf = 0;
    globe.addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch" || still()) return;
      const r = globe.getBoundingClientRect();
      const px = ((e.clientX - r.left) / r.width) * 2 - 1;
      const py = ((e.clientY - r.top) / r.height) * 2 - 1;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        globe.style.setProperty("--px", px.toFixed(3));
        globe.style.setProperty("--py", py.toFixed(3));
      });
    });
    globe.addEventListener("pointerleave", () => {
      globe.style.setProperty("--px", "0");
      globe.style.setProperty("--py", "0");
      if (hud) hud.textContent = "LAT 39.9526° N · LON 75.1652° W";
    });
    // Philadelphia jitter while the pointer is inside: reads as a live lock.
    globe.addEventListener("pointerenter", () => {
      if (still() || !hud) return;
      const j = () => {
        const la = (39.9526 + Math.random() * 0.008).toFixed(4);
        const lo = (75.1652 + Math.random() * 0.008).toFixed(4);
        hud.textContent = `LOCKING ${la}° N · ${lo}° W`;
      };
      j();
      const iv = setInterval(j, 140);
      globe.addEventListener("pointerleave", () => clearInterval(iv), { once: true });
    });
  }

  /* --- 3D tilt on cards -------------------------------------------------- */
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

  /* --- proof numbers count up ------------------------------------------- */
  const nums = document.querySelectorAll("[data-count]");
  if (nums.length) {
    const numObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          numObs.unobserve(el);
          const target = Number(el.dataset.count);
          const prefix = el.dataset.prefix || "";
          if (still()) {
            el.textContent = prefix + target;
            return;
          }
          const dur = 1100;
          const t0 = performance.now();
          const step = (now) => {
            const t = Math.min(1, (now - t0) / dur);
            const eased = 1 - Math.pow(1 - t, 4);
            el.textContent = prefix + Math.round(target * eased);
            if (t < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
      },
      { threshold: 0.5 }
    );
    nums.forEach((n) => numObs.observe(n));
  }

  /* --- SERP status flip -------------------------------------------------- */
  const serpStatus = document.getElementById("serpStatus");
  if (serpStatus) {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        const done = () => {
          serpStatus.textContent = "✓ ROW ONE ACTIVE";
          serpStatus.setAttribute("data-done", "");
        };
        still() ? done() : setTimeout(done, 4000);
      },
      { threshold: 0.4 }
    );
    obs.observe(serpStatus);
  }

  /* --- YouTube click-to-play facades ------------------------------------ */
  // Zero third-party JS until the visitor asks for the video.
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

  /* --- form: real states, and the form never jumps under the visitor ---- */
  const form = document.querySelector(".form");
  form?.addEventListener("submit", (e) => {
    const status = form.querySelector(".form__status");
    if (!status) return;
    // Netlify handles the POST. Show a pending state without moving anything.
    status.textContent = "SENDING…";
    e.submitter && (e.submitter.disabled = true);
  });
})();
