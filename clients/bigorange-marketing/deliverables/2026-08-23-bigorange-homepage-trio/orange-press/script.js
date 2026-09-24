(function () {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reducedMotion) document.documentElement.classList.add("motion-ready");
  const menuButton = document.querySelector(".menu-toggle");
  const menu = document.getElementById("menu");

  if (menuButton && menu) {
    const closeMenu = () => {
      menuButton.setAttribute("aria-expanded", "false");
      menu.classList.remove("is-open");
      document.body.classList.remove("menu-open");
    };

    menuButton.addEventListener("click", () => {
      const open = menuButton.getAttribute("aria-expanded") !== "true";
      menuButton.setAttribute("aria-expanded", String(open));
      menu.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
    });

    menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menu.classList.contains("is-open")) {
        closeMenu();
        menuButton.focus();
      }
    });
  }

  document.querySelectorAll("details").forEach((disclosure) => {
    disclosure.addEventListener("toggle", () => {
      if (!disclosure.open) return;
      document.querySelectorAll("details[open]").forEach((openDisclosure) => {
        if (openDisclosure !== disclosure) openDisclosure.open = false;
      });
    });
  });

  const railCleanups = [];

  const initializeSnapRail = ({
    viewport,
    cards,
    previousButton,
    nextButton,
    status,
    autoAdvanceMs = 0,
    noteSelector = null
  }) => {
    if (!viewport || !cards.length) return () => {};

    let activeIndex = Math.max(0, cards.findIndex((card) => card.classList.contains("is-active")));
    let autoDirection = 1;
    let interactionPauseUntil = 0;
    let isVisible = false;
    let scrollFrame = 0;
    let drag = null;
    let snapTargetIndex = null;
    let snapReleaseTimer = 0;
    let autoTimer = 0;

    const currentIndex = () => {
      const center = viewport.scrollLeft + viewport.clientWidth / 2;
      let bestIndex = 0;
      let bestDistance = Infinity;
      cards.forEach((card, index) => {
        const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      });
      return bestIndex;
    };

    const keepNoteInView = (index) => {
      if (!noteSelector) return;
      cards.forEach((card) => card.querySelector(noteSelector)?.style.removeProperty("--press-nudge"));
      const note = cards[index]?.querySelector(noteSelector);
      if (!note) return;
      requestAnimationFrame(() => {
        const noteRect = note.getBoundingClientRect();
        const viewportRect = viewport.getBoundingClientRect();
        const inset = 12;
        let nudge = 0;
        if (noteRect.left < viewportRect.left + inset) nudge = viewportRect.left + inset - noteRect.left;
        if (noteRect.right + nudge > viewportRect.right - inset) {
          nudge += viewportRect.right - inset - (noteRect.right + nudge);
        }
        note.style.setProperty("--press-nudge", `${Math.round(nudge)}px`);
      });
    };

    const setActive = (index) => {
      const nextIndex = Math.max(0, Math.min(cards.length - 1, index));
      activeIndex = nextIndex;
      cards.forEach((card, cardIndex) => {
        const active = cardIndex === nextIndex;
        card.classList.toggle("is-active", active);
        if (active) card.setAttribute("aria-current", "true");
        else card.removeAttribute("aria-current");
      });
      if (status) status.textContent = `${nextIndex + 1} / ${cards.length}`;
      keepNoteInView(nextIndex);
    };

    const targetScroll = (index) => {
      const card = cards[index];
      return card.offsetLeft - (viewport.clientWidth - card.offsetWidth) / 2;
    };

    const pauseForInteraction = (duration = 7600) => {
      interactionPauseUntil = performance.now() + duration;
      scheduleAutoAdvance(duration + 250);
    };

    const goTo = (index, { user = false } = {}) => {
      const nextIndex = Math.max(0, Math.min(cards.length - 1, index));
      if (user) pauseForInteraction();
      if (snapReleaseTimer) window.clearTimeout(snapReleaseTimer);
      snapTargetIndex = nextIndex;
      setActive(nextIndex);
      viewport.scrollTo({
        left: targetScroll(nextIndex),
        behavior: reducedMotion ? "auto" : "smooth"
      });
      snapReleaseTimer = window.setTimeout(() => {
        snapTargetIndex = null;
        setActive(currentIndex());
      }, reducedMotion ? 0 : 760);
    };

    const moveBy = (amount) => goTo(activeIndex + amount, { user: true });

    const onScroll = () => {
      if (scrollFrame || (snapTargetIndex !== null && !drag)) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        setActive(currentIndex());
      });
    };

    const finishDrag = (event) => {
      if (!drag) return;
      if (viewport.hasPointerCapture?.(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
      drag = null;
      viewport.classList.remove("is-dragging");
      goTo(currentIndex(), { user: true });
    };

    const onPointerDown = (event) => {
      pauseForInteraction();
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      event.preventDefault();
      if (snapReleaseTimer) window.clearTimeout(snapReleaseTimer);
      snapTargetIndex = null;
      drag = { pointerId: event.pointerId, startX: event.clientX, startScroll: viewport.scrollLeft };
      viewport.setPointerCapture(event.pointerId);
      viewport.classList.add("is-dragging");
    };

    const onPointerMove = (event) => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      viewport.scrollLeft = drag.startScroll - (event.clientX - drag.startX);
      event.preventDefault();
    };

    previousButton?.addEventListener("click", () => moveBy(-1));
    nextButton?.addEventListener("click", () => moveBy(1));
    viewport.addEventListener("scroll", onScroll, { passive: true });
    viewport.addEventListener("pointerdown", onPointerDown);
    viewport.addEventListener("pointermove", onPointerMove);
    viewport.addEventListener("pointerup", finishDrag);
    viewport.addEventListener("pointercancel", finishDrag);
    viewport.addEventListener("touchstart", () => pauseForInteraction(), { passive: true });
    viewport.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveBy(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        moveBy(1);
      } else if (event.key === "Home") {
        event.preventDefault();
        goTo(0, { user: true });
      } else if (event.key === "End") {
        event.preventDefault();
        goTo(cards.length - 1, { user: true });
      }
    });

    cards.forEach((card, index) => {
      card.addEventListener("mouseenter", () => {
        pauseForInteraction();
        setActive(index);
      });
      card.addEventListener("focus", () => {
        if (!drag) goTo(index, { user: true });
      });
    });

    const clearAutoAdvance = () => {
      if (!autoTimer) return;
      window.clearTimeout(autoTimer);
      autoTimer = 0;
    };

    const runAutoAdvance = () => {
      autoTimer = 0;
      const now = performance.now();
      if (!isVisible || document.visibilityState !== "visible" || drag) {
        scheduleAutoAdvance(650);
        return;
      }
      if (now < interactionPauseUntil) {
        scheduleAutoAdvance(interactionPauseUntil - now + 250);
        return;
      }
      if (activeIndex >= cards.length - 1) autoDirection = -1;
      if (activeIndex <= 0) autoDirection = 1;
      goTo(activeIndex + autoDirection);
      scheduleAutoAdvance(autoAdvanceMs);
    };

    function scheduleAutoAdvance(delay = autoAdvanceMs) {
      if (reducedMotion || autoAdvanceMs <= 0) return;
      clearAutoAdvance();
      autoTimer = window.setTimeout(runAutoAdvance, Math.max(250, delay));
    }

    const visibilityObserver = new IntersectionObserver((entries) => {
      const wasVisible = isVisible;
      isVisible = entries.some((entry) => entry.isIntersecting);
      if (isVisible && !wasVisible) scheduleAutoAdvance(Math.min(1750, autoAdvanceMs));
      if (!isVisible) clearAutoAdvance();
    }, { threshold: 0.28 });
    visibilityObserver.observe(viewport);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && isVisible) scheduleAutoAdvance(900);
      else clearAutoAdvance();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    requestAnimationFrame(() => {
      setActive(activeIndex);
      viewport.scrollLeft = targetScroll(activeIndex);
    });

    return () => {
      clearAutoAdvance();
      if (snapReleaseTimer) window.clearTimeout(snapReleaseTimer);
      if (scrollFrame) cancelAnimationFrame(scrollFrame);
      visibilityObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  };

  const systemRail = document.querySelector("[data-system-rail]");
  const systemCards = systemRail ? Array.from(systemRail.querySelectorAll("article")) : [];
  railCleanups.push(initializeSnapRail({
    viewport: systemRail,
    cards: systemCards,
    previousButton: document.querySelector("[data-system-prev]"),
    nextButton: document.querySelector("[data-system-next]"),
    status: document.querySelector("[data-system-status]"),
    autoAdvanceMs: 4400
  }));

  const swim = document.querySelector("[data-swim]");
  const swimCards = swim ? Array.from(swim.querySelectorAll(".swim-card")) : [];
  railCleanups.push(initializeSnapRail({
    viewport: swim,
    cards: swimCards,
    previousButton: document.querySelector("[data-swim-prev]"),
    nextButton: document.querySelector("[data-swim-next]"),
    status: document.querySelector("[data-swim-status]"),
    autoAdvanceMs: 4800,
    noteSelector: ".press-note"
  }));

  const brickBuild = document.querySelector("[data-brick-build]");

  if (brickBuild) {
    let brickStarted = false;
    let brickResolved = false;
    let brickSafetyTimer;
    const exactBrickLogo = brickBuild.querySelector(".brick-build__exact");

    const resolveBrickBuild = () => {
      if (brickResolved) return;
      brickResolved = true;
      window.clearTimeout(brickSafetyTimer);
      brickBuild.classList.remove("is-building", "is-paused");
      brickBuild.classList.add("is-built");
    };

    const startBrickBuild = () => {
      if (brickStarted) return;
      brickStarted = true;
      brickBuild.classList.add("is-building");
      brickSafetyTimer = window.setTimeout(resolveBrickBuild, 7600);
    };

    if (reducedMotion) {
      resolveBrickBuild();
    } else {
      brickBuild.classList.add("is-armed");
      exactBrickLogo?.addEventListener("animationend", resolveBrickBuild, { once: true });

      if (typeof IntersectionObserver === "function") {
        const brickObserver = new IntersectionObserver(
          (entries) => {
            const visible = entries.some((entry) => entry.isIntersecting);
            if (visible) startBrickBuild();
            if (brickStarted && !brickResolved) brickBuild.classList.toggle("is-paused", !visible);
          },
          { rootMargin: "80px", threshold: 0.25 }
        );
        brickObserver.observe(brickBuild);
        railCleanups.push(() => brickObserver.disconnect());
      } else {
        startBrickBuild();
      }
    }
  }

  const logoStage = document.querySelector("[data-particle-stage]");
  const particleMark = logoStage?.querySelector(".particle-mark");
  const particleCanvas = document.getElementById("particle-logo");

  if (!logoStage || !particleMark || !particleCanvas) return;

  let particleSystem;
  let safetyTimer;
  let didStart = false;
  let didResolve = false;

  const resolveLogo = () => {
    if (didResolve) return;
    didResolve = true;
    window.clearTimeout(safetyTimer);
    logoStage.classList.add("is-resolved");
    window.setTimeout(() => particleSystem?.destroy(), 520);
  };

  if (reducedMotion || typeof window.BrandParticles !== "function") {
    resolveLogo();
    return;
  }

  const startParticles = () => {
    if (didStart) return;
    didStart = true;
    safetyTimer = window.setTimeout(resolveLogo, 6500);

    particleCanvas.addEventListener("brandready", (event) => {
      if (!event.detail?.pointCount) {
        resolveLogo();
        return;
      }
      logoStage.classList.add("is-particle-ready", "is-animating");
    }, { once: true });
    particleCanvas.addEventListener("brandlocked", () => {
      logoStage.classList.add("is-locked");
    }, { once: true });
    particleCanvas.addEventListener("branderror", resolveLogo, { once: true });
    particleCanvas.addEventListener("brandresolved", resolveLogo, { once: true });

    try {
      particleSystem = new window.BrandParticles(particleCanvas, {
        src: particleMark.dataset.logo,
        seed: 8777,
        assembleMs: window.innerWidth < 640 ? 2550 : 2900,
        holdMs: 900,
        gridStep: 4,
        particleScale: window.innerWidth < 640 ? 0.9 : 0.82,
        opacity: 1
      });
    } catch (error) {
      resolveLogo();
    }
  };

  if (typeof IntersectionObserver === "function") {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          startParticles();
        }
      },
      { rootMargin: "120px", threshold: 0.2 }
    );
    observer.observe(logoStage);
  } else {
    startParticles();
  }

  window.addEventListener(
    "pagehide",
    () => {
      railCleanups.forEach((cleanup) => cleanup());
      particleSystem?.destroy();
    },
    { once: true }
  );
})();
