(() => {
  const reel = document.querySelector('.reel');
  const stage = document.querySelector('[data-stage]');
  const video = document.querySelector('#film-video');
  const loader = document.querySelector('[data-loader]');
  const loaderProgress = document.querySelector('[data-loader-progress]');
  const loaderBar = document.querySelector('[data-loader-bar]');
  const readyLabel = document.querySelector('[data-ready]');
  const stageShot = document.querySelector('[data-stage-shot]');
  const stageProgress = document.querySelector('[data-stage-progress]');
  const beats = [...document.querySelectorAll('.film-beat')];
  const journeyLinks = [...document.querySelectorAll('.journey-nav a')];
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (!reel || !stage || !video || beats.length === 0) return;

  const mobileFilmQuery = window.matchMedia('(max-width: 800px), (pointer: coarse)');
  const desktopSourcePath = video.dataset.source || 'assets/media/momentum-higgsfield-walkthrough.mp4';
  const mobileSourcePath = video.dataset.sourceMobile || desktopSourcePath;
  const sourcePath = mobileFilmQuery.matches ? mobileSourcePath : desktopSourcePath;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const timeline = [
    { id: 'arrival', label: 'AERIAL ARRIVAL', sourceStart: 0.05, sourceEnd: 3.2 },
    { id: 'pool', label: 'REAR POOL', sourceStart: 3.2, sourceEnd: 7.2 },
    { id: 'marble', label: 'MARBLE LIVING / KITCHEN', sourceStart: 7.2, sourceEnd: 10.3 },
    { id: 'game', label: 'DARK GAME ROOM', sourceStart: 10.3, sourceEnd: 14.5 },
    { id: 'foyer', label: 'FOYER / RED ART / STAIRS', sourceStart: 14.5, sourceEnd: 18.5 },
    { id: 'momentum', label: 'FRONT EXTERIOR HERO', sourceStart: 18.5, sourceEnd: 20.18 },
  ];
  const chapterCount = timeline.length;
  timeline.forEach((chapter, index) => {
    chapter.scrollStart = index / chapterCount;
    chapter.scrollEnd = (index + 1) / chapterCount;
  });

  let ticking = false;
  let forcedTime = null;
  let mediaReady = false;
  let duration = 20.208;
  let openingActive = false;
  let openingCompleted = false;
  let openingHold = timeline[0].sourceStart;
  let openingRaf = 0;
  let desiredTime = timeline[0].sourceStart;
  let seekRaf = 0;
  let lastSeekAt = 0;
  let loaderClosed = false;

  const state = {
    version: 3,
    scrollProgress: 0,
    activeShot: 0,
    activeShotId: 'arrival',
    frameProgress: 0,
    frameIndex: 0,
    opening: {
      active: false,
      completed: false,
      holdTime: timeline[0].sourceStart,
    },
    mediaReadiness: {
      readyState: 0,
      loaded: false,
      duration: 0,
      source: sourcePath,
      transport: 'native-stream',
      bufferedPercent: 0,
    },
    timeline,
    reducedMotion: reducedMotionQuery.matches,
  };

  window.__M360_V2_STATE__ = state;
  window.__M360_V3_STATE__ = state;

  function publishState() {
    state.opening.active = openingActive;
    state.opening.completed = openingCompleted;
    state.opening.holdTime = Number(openingHold.toFixed(3));
    state.mediaReadiness.readyState = video.readyState;
    window.__M360_V2_STATE__ = state;
    window.__M360_V3_STATE__ = state;
  }

  function updateLoader(percent) {
    const value = clamp(Math.round(percent), 0, 100);
    if (loaderProgress) loaderProgress.textContent = `${String(value).padStart(2, '0')}%`;
    if (loaderBar) loaderBar.style.transform = `scaleX(${value / 100})`;
    state.mediaReadiness.bufferedPercent = value;
    publishState();
  }

  function readBuffer() {
    if (!Number.isFinite(video.duration) || video.duration <= 0 || video.buffered.length === 0) {
      updateLoader(Math.max(state.mediaReadiness.bufferedPercent, video.readyState * 14));
      return;
    }
    const bufferedEnd = video.buffered.end(video.buffered.length - 1);
    updateLoader((bufferedEnd / video.duration) * 100);
  }

  function closeLoader() {
    if (loaderClosed) return;
    loaderClosed = true;
    updateLoader(100);
    loader?.classList.add('is-exiting');
    document.documentElement.classList.add('film-entered');
    window.setTimeout(() => {
      if (loader) {
        loader.hidden = true;
        loader.setAttribute('aria-hidden', 'true');
      }
    }, 1100);
  }

  function setReadyLabel(copy, live = false) {
    if (!readyLabel) return;
    readyLabel.innerHTML = `${copy} <span class="status-dot" aria-hidden="true"></span>`;
    readyLabel.classList.toggle('is-live', live);
  }

  function applyChapter(activeShot) {
    beats.forEach((beat, index) => beat.classList.toggle('is-current', index === activeShot));
    journeyLinks.forEach((link, index) => {
      const current = index === activeShot;
      link.classList.toggle('is-active', current);
      if (current) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    });
  }

  function stopSeekLoop() {
    if (seekRaf) cancelAnimationFrame(seekRaf);
    seekRaf = 0;
  }

  function seekTowardTarget(timestamp) {
    if (openingActive || !mediaReady || video.readyState < 1) {
      seekRaf = 0;
      return;
    }
    const delta = desiredTime - video.currentTime;
    if (Math.abs(delta) < 0.025) {
      try { video.currentTime = desiredTime; } catch {}
      seekRaf = 0;
      return;
    }
    const magnitude = Math.abs(delta);
    const cadence = magnitude > 2 ? 24 : magnitude > 0.5 ? 32 : 48;
    if (timestamp - lastSeekAt >= cadence) {
      const gain = magnitude > 2 ? 0.58 : magnitude > 0.5 ? 0.5 : 0.38;
      const limit = magnitude > 2 ? 1.6 : magnitude > 0.5 ? 0.9 : 0.5;
      const step = clamp(delta * gain, -limit, limit);
      try { video.currentTime = clamp(video.currentTime + step, 0, duration - 0.02); } catch {}
      lastSeekAt = timestamp;
    }
    seekRaf = requestAnimationFrame(seekTowardTarget);
  }

  function setSeekTarget(seconds, immediate = false) {
    desiredTime = clamp(seconds, 0, duration - 0.02);
    if (!mediaReady || openingActive || reducedMotionQuery.matches) return;
    if (immediate) {
      stopSeekLoop();
      try { video.currentTime = desiredTime; } catch {}
      return;
    }
    if (!seekRaf) seekRaf = requestAnimationFrame(seekTowardTarget);
  }

  function render(progress) {
    const boundedProgress = clamp(progress, 0, 1);
    const reduced = reducedMotionQuery.matches;
    const scrollShot = clamp(Math.floor(boundedProgress * chapterCount), 0, chapterCount - 1);
    const scrollChapter = timeline[scrollShot];
    const scrollChapterProgress = clamp(
      (boundedProgress - scrollChapter.scrollStart) / (scrollChapter.scrollEnd - scrollChapter.scrollStart),
      0,
      1,
    );
    const forcedChapter = forcedTime === null
      ? null
      : timeline.findIndex((chapter) => forcedTime >= chapter.sourceStart && forcedTime <= chapter.sourceEnd);
    const activeShot = forcedChapter === null || forcedChapter < 0 ? scrollShot : forcedChapter;
    const chapter = timeline[activeShot];
    const chapterProgress = forcedChapter === null || forcedChapter < 0
      ? scrollChapterProgress
      : clamp((forcedTime - chapter.sourceStart) / (chapter.sourceEnd - chapter.sourceStart), 0, 1);

    const arrivalStart = openingCompleted ? Math.max(timeline[0].sourceStart, openingHold) : timeline[0].sourceStart;
    const sourceStart = scrollShot === 0 ? arrivalStart : scrollChapter.sourceStart;
    const targetTime = forcedTime === null
      ? sourceStart + (scrollChapter.sourceEnd - sourceStart) * scrollChapterProgress
      : clamp(forcedTime, 0, duration - 0.02);

    if (reduced) {
      stopSeekLoop();
      if (mediaReady && Math.abs(video.currentTime - timeline[0].sourceStart) > 0.02) {
        try { video.currentTime = timeline[0].sourceStart; } catch {}
      }
    } else if (!openingActive) {
      setSeekTarget(targetTime, forcedTime !== null);
    }

    state.scrollProgress = Number(boundedProgress.toFixed(4));
    state.activeShot = activeShot;
    state.activeShotId = chapter.id;
    state.frameProgress = reduced ? 0 : Number(chapterProgress.toFixed(4));
    state.frameIndex = reduced ? 0 : Math.round(state.frameProgress * 7);
    state.reducedMotion = reduced;
    if (stageShot) stageShot.textContent = `${String(activeShot + 1).padStart(2, '0')} / ${String(chapterCount).padStart(2, '0')}`;
    if (stageProgress) stageProgress.textContent = `${String(Math.round(boundedProgress * 100)).padStart(2, '0')}%`;
    applyChapter(activeShot);
    publishState();
  }

  function requestRender() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const rect = reel.getBoundingClientRect();
      const travel = Math.max(1, reel.offsetHeight - window.innerHeight);
      render(-rect.top / travel);
    });
  }

  function completeOpening() {
    if (!openingActive) return;
    openingActive = false;
    openingCompleted = true;
    openingHold = clamp(video.currentTime, 1.4, 2.35);
    video.pause();
    document.documentElement.classList.remove('film-opening');
    document.documentElement.classList.add('film-directed');
    setReadyLabel('SCROLL TO DIRECT', true);
    publishState();
    requestRender();
  }

  function openingLoop() {
    if (!openingActive) return;
    if (video.currentTime >= 2.32 || video.ended) {
      completeOpening();
      return;
    }
    openingRaf = requestAnimationFrame(openingLoop);
  }

  async function startOpening() {
    if (openingActive || openingCompleted) return;
    if (reducedMotionQuery.matches || window.scrollY > 24) {
      openingCompleted = true;
      openingHold = timeline[0].sourceStart;
      closeLoader();
      setReadyLabel('SCROLL TO DIRECT', true);
      publishState();
      requestRender();
      return;
    }

    openingActive = true;
    document.documentElement.classList.add('film-opening');
    setReadyLabel('FILM OPENING');
    publishState();
    try {
      video.currentTime = timeline[0].sourceStart;
      await video.play();
      closeLoader();
      openingRaf = requestAnimationFrame(openingLoop);
    } catch (error) {
      openingActive = false;
      openingCompleted = true;
      state.mediaReadiness.autoplayError = String(error?.message || error);
      closeLoader();
      setReadyLabel('SCROLL TO DIRECT', true);
      publishState();
      requestRender();
    }
  }

  function cancelOpeningForControl() {
    if (!openingActive) return;
    if (openingRaf) cancelAnimationFrame(openingRaf);
    openingRaf = 0;
    openingActive = false;
    openingCompleted = true;
    openingHold = clamp(video.currentTime, timeline[0].sourceStart, 2.32);
    video.pause();
    closeLoader();
    document.documentElement.classList.remove('film-opening');
    document.documentElement.classList.add('film-directed');
    setReadyLabel('SCROLL TO DIRECT', true);
    publishState();
  }

  function setReady() {
    if (mediaReady || !Number.isFinite(video.duration) || video.duration <= 0) return;
    mediaReady = true;
    duration = video.duration;
    state.mediaReadiness.loaded = true;
    state.mediaReadiness.duration = Number(duration.toFixed(3));
    document.documentElement.classList.add('media-ready');
    window.__M360_V2_READY__ = true;
    window.__M360_V3_READY__ = true;
    readBuffer();
    startOpening();
  }

  window.__M360_V2_SET_TIME__ = (seconds) => {
    cancelOpeningForControl();
    forcedTime = Number(seconds) || 0;
    requestRender();
  };
  window.__M360_V3_SET_TIME__ = window.__M360_V2_SET_TIME__;

  window.__M360_V2_SET_FRAME__ = (shot, frame) => {
    cancelOpeningForControl();
    const shotIndex = clamp(Number(shot) || 0, 0, chapterCount - 1);
    const localFrame = clamp(Number(frame) || 0, 0, 7) / 7;
    const chapter = timeline[shotIndex];
    forcedTime = chapter.sourceStart + localFrame * (chapter.sourceEnd - chapter.sourceStart);
    requestRender();
  };
  window.__M360_V3_SET_FRAME__ = window.__M360_V2_SET_FRAME__;

  function clearForcedOnScroll() {
    if (forcedTime !== null) forcedTime = null;
  }

  function attachFilm() {
    state.mediaReadiness.transport = 'native-stream';
    video.src = new URL(sourcePath, document.baseURI).href;
    video.preload = 'auto';
    video.load();
    publishState();
  }

  video.addEventListener('loadstart', () => updateLoader(8));
  video.addEventListener('loadedmetadata', () => {
    updateLoader(32);
    setReady();
  });
  video.addEventListener('loadeddata', () => updateLoader(70));
  video.addEventListener('progress', readBuffer);
  video.addEventListener('canplay', setReady);
  video.addEventListener('error', () => {
    openingActive = false;
    state.mediaReadiness.error = 'video source failed';
    setReadyLabel('POSTER ACTIVE');
    loader?.classList.add('has-error');
    window.setTimeout(closeLoader, 900);
    publishState();
  });

  window.addEventListener('wheel', cancelOpeningForControl, { passive: true, once: true });
  window.addEventListener('touchmove', cancelOpeningForControl, { passive: true, once: true });
  window.addEventListener('keydown', (event) => {
    if (['ArrowDown', 'PageDown', 'End', ' '].includes(event.key)) cancelOpeningForControl();
  }, { once: true });
  window.addEventListener('scroll', () => {
    clearForcedOnScroll();
    cancelOpeningForControl();
    requestRender();
  }, { passive: true });
  window.addEventListener('resize', requestRender, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) requestRender();
  });
  reducedMotionQuery.addEventListener?.('change', () => {
    cancelOpeningForControl();
    state.reducedMotion = reducedMotionQuery.matches;
    requestRender();
  });

  window.__M360_V2_MEDIA_PROMISE__ = Promise.resolve().then(attachFilm);
  window.__M360_V3_MEDIA_PROMISE__ = window.__M360_V2_MEDIA_PROMISE__;
  requestRender();
})();
