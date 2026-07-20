document.documentElement.classList.add('motion-ready');

const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('#site-nav');
const menuLabel = menuButton?.querySelector('.sr-only');
let lastFocusedBeforeMenu = null;

const hero = document.querySelector('.hero');
if ('IntersectionObserver' in window && hero) {
  const headerObserver = new IntersectionObserver(([entry]) => {
    header.classList.toggle('scrolled', !entry.isIntersecting);
  }, { threshold: 0.92 });
  headerObserver.observe(hero);
}

const setMenu = (open, moveFocus = false) => {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.classList.toggle('is-open', open);
  nav.classList.toggle('is-open', open);
  if (menuLabel) menuLabel.textContent = open ? 'Close menu' : 'Open menu';
  if (open) {
    lastFocusedBeforeMenu = document.activeElement;
    if (moveFocus) requestAnimationFrame(() => nav.querySelector('a')?.focus());
  } else if (moveFocus && lastFocusedBeforeMenu instanceof HTMLElement) {
    lastFocusedBeforeMenu.focus();
  }
};

menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true', true));

nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    setMenu(false);
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') setMenu(false, true);
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealElements = document.querySelectorAll('.reveal');

const root = document.documentElement;
let progressQueued = false;
const updateScrollProgress = () => {
  const max = root.scrollHeight - window.innerHeight;
  const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
  root.style.setProperty('--scroll-progress', progress.toFixed(4));
  progressQueued = false;
};
window.addEventListener('scroll', () => {
  if (progressQueued) return;
  progressQueued = true;
  requestAnimationFrame(updateScrollProgress);
}, { passive: true });
updateScrollProgress();

if (!reducedMotion && window.gsap && window.ScrollTrigger) {
  document.documentElement.classList.add('gsap-ready');
  window.gsap.registerPlugin(window.ScrollTrigger);
  const heroTimeline = window.gsap.timeline({ defaults: { ease: 'power4.out' } });
  heroTimeline
    .fromTo('.hero-video', { clipPath: 'inset(0 100% 0 0 round 49% 49% 16px 16px)', scale: 1.06 }, { clipPath: 'inset(0 0 0 0 round 49% 49% 16px 16px)', scale: 1, duration: 1.45 }, 0)
    .fromTo('.hero-line > *', { yPercent: 115, skewY: 5 }, { yPercent: 0, skewY: 0, duration: 1.05, stagger: .12 }, .14)
    .fromTo('.hero-kicker', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .6 }, .28)
    .fromTo('.hero-copy, .hero-actions', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: .7, stagger: .1 }, .78)
    .fromTo('.hero-status, .hero-signal, .hero-photo-note, .hero-orange, .hero-leaf', { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: .65, stagger: .07 }, 1.05);

  window.gsap.matchMedia().add('(min-width: 781px)', () => {
    window.gsap.to('.hero-video', {
      yPercent: 8,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  });
}

if (reducedMotion || !('IntersectionObserver' in window)) {
  revealElements.forEach((element) => element.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.style.setProperty('--delay', `${entry.target.dataset.delay || 0}ms`);
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -35px' });

  revealElements.forEach((element) => observer.observe(element));
}

const heroVideo = document.querySelector('.hero-video');
const videoToggle = document.querySelector('.video-toggle');
if (heroVideo && videoToggle) {
  const videoLabel = videoToggle.querySelector('.video-toggle-label');
  const videoIcon = videoToggle.querySelector('.video-toggle-icon');
  const setVideoState = (paused) => {
    if (paused) heroVideo.pause();
    else heroVideo.play().catch(() => {});
    videoToggle.setAttribute('aria-pressed', String(paused));
    videoLabel.textContent = paused ? 'Play motion' : 'Pause motion';
    videoIcon.textContent = paused ? '▶' : 'Ⅱ';
  };
  videoToggle.addEventListener('click', () => setVideoState(!heroVideo.paused));
  if (reducedMotion) setVideoState(true);
}

const statusMessages = ['Checking the numbers…', 'Catching the funny math…', 'Finding the next right step…', 'Ready for BigOrange eyes.'];
const heroStatusCopy = document.querySelector('#hero-status-copy');
if (heroStatusCopy && !reducedMotion) {
  let messageIndex = 0;
  window.setInterval(() => {
    messageIndex = (messageIndex + 1) % statusMessages.length;
    if (window.gsap) {
      window.gsap.to(heroStatusCopy, { opacity: 0, y: -5, duration: .2, onComplete: () => {
        heroStatusCopy.textContent = statusMessages[messageIndex];
        window.gsap.fromTo(heroStatusCopy, { opacity: 0, y: 5 }, { opacity: 1, y: 0, duration: .28 });
      }});
    } else heroStatusCopy.textContent = statusMessages[messageIndex];
  }, 2200);
}

const proofValues = document.querySelectorAll('.proof-ribbon strong');
const animateProofValues = () => {
  proofValues.forEach((element) => {
    if (element.dataset.counted) return;
    element.dataset.counted = 'true';
    const original = element.textContent.trim();
    const numeric = Number(original.replace(/[$,]/g, ''));
    if (!Number.isFinite(numeric)) return;
    const prefix = original.startsWith('$') ? '$' : '';
    const decimals = original.includes('.') ? original.split('.')[1].length : 0;
    const usesComma = original.includes(',');
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / 900);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = numeric * eased;
      element.textContent = `${prefix}${usesComma ? Math.round(current).toLocaleString() : current.toFixed(decimals)}`;
      if (progress < 1) requestAnimationFrame(tick);
      else element.textContent = original;
    };
    requestAnimationFrame(tick);
  });
};

if (!reducedMotion && 'IntersectionObserver' in window) {
  const proofObserver = new IntersectionObserver(([entry], observerInstance) => {
    if (!entry.isIntersecting) return;
    animateProofValues();
    observerInstance.disconnect();
  }, { threshold: .45 });
  const proofRibbon = document.querySelector('.proof-ribbon');
  if (proofRibbon) proofObserver.observe(proofRibbon);
}

document.querySelectorAll('.project-screen img').forEach((image) => {
  const markLoaded = () => image.closest('.project-screen')?.classList.add('is-loaded');
  if (image.complete) markLoaded();
  else image.addEventListener('load', markLoaded, { once: true });
});

const livePulse = document.querySelector('#live-pulse');
if (livePulse) {
  const liveRefreshButton = document.querySelector('#live-pulse-refresh');
  const livePulseAge = document.querySelector('#live-pulse-age');
  let lastLivePull = null;
  let livePullInFlight = false;

  const setLiveText = (id, value) => {
    const target = document.getElementById(id);
    if (target) target.textContent = value;
  };

  const formatFreshness = (dateValue) => {
    if (!dateValue) return 'Unknown';
    const elapsedSeconds = Math.max(0, Math.round((Date.now() - new Date(dateValue).getTime()) / 1000));
    if (elapsedSeconds < 10) return 'Just now';
    if (elapsedSeconds < 60) return `${elapsedSeconds}s ago`;
    const minutes = Math.floor(elapsedSeconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'America/New_York' }).format(new Date(dateValue));
  };

  const formatContentTouch = (dateValue) => {
    if (!dateValue) return 'Unknown';
    const date = new Date(dateValue);
    const today = new Date();
    const sameDay = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(date) === new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(today);
    return sameDay ? 'Today' : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'America/New_York' }).format(date);
  };

  const safeBigOrangeLink = (value) => {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && url.hostname === 'bigorange.marketing' ? url.toString() : 'https://bigorange.marketing/';
    } catch {
      return 'https://bigorange.marketing/';
    }
  };

  const renderLivePulse = (data) => {
    const isLive = data.state === 'live';
    const mcpProtected = data.integrations?.mcpRouteDiscovered && data.integrations?.mcpServerProtected;
    const botsReady = data.robots?.searchBotsAllowed && data.robots?.trainingBotsBlocked;
    const indexable = Number(data.content?.indexableTotal || 0);
    const responseMs = Number(data.site?.originResponseMs || 0);

    livePulse.classList.toggle('is-partial', !isLive);
    setLiveText('live-site-state', data.site?.online ? 'Online' : 'Needs a look');
    setLiveText('live-site-detail', data.site?.online ? `HTTP ${data.site.status} · origin answered in ${responseMs.toLocaleString()} ms` : 'The homepage did not answer this pull.');
    setLiveText('live-indexable-total', indexable ? indexable.toLocaleString() : 'Pending');
    setLiveText('live-indexable-detail', `${Number(data.content?.sitemapPosts || 0).toLocaleString()} posts · ${Number(data.content?.sitemapPages || 0).toLocaleString()} pages in the live sitemap.`);
    setLiveText('live-content-touch', formatContentTouch(data.content?.lastContentTouch));
    setLiveText('live-mcp-state', mcpProtected ? 'Protected' : data.integrations?.mcpRouteDiscovered ? 'Discovered' : 'Not found');
    setLiveText('live-mcp-detail', mcpProtected ? `The route exists. Auth is protected.${data.integrations?.semrushRoutesDiscovered ? ' Semrush hooks are published.' : ''}` : 'The public discovery route was checked.');
    setLiveText('live-bot-state', botsReady ? 'Search welcome' : 'Review rules');
    setLiveText('live-bot-detail', botsReady ? 'Search agents are allowed. Training bots stay blocked.' : 'The published robots rules need a closer look.');
    setLiveText('live-latest-title', data.content?.latestUpdated?.title || 'No recent public article returned.');
    setLiveText('live-inventory-detail', `WordPress REST: ${Number(data.content?.publishedPosts || 0).toLocaleString()} published posts / ${Number(data.content?.publishedPages || 0).toLocaleString()} pages. Sitemap: ${Number(data.content?.sitemapPosts || 0).toLocaleString()} posts / ${Number(data.content?.sitemapPages || 0).toLocaleString()} pages.`);
    setLiveText('live-pulse-status', `${Number(data.evidence?.respondingSources || 0)}/${Number(data.evidence?.checkedSources || 0)} public sources answered · refreshes automatically every ${Number(data.refreshSeconds || 60)} seconds.`);
    setLiveText('live-inline-indexable', indexable ? indexable.toLocaleString() : 'the current');
    setLiveText('hero-live-site', data.site?.online ? 'Live' : 'Check');
    setLiveText('hero-live-indexable', indexable ? indexable.toLocaleString() : '—');
    setLiveText('hero-live-sync', isLive ? 'Now' : 'Partial');

    const latestLink = document.querySelector('#live-latest-link');
    if (latestLink) latestLink.href = safeBigOrangeLink(data.content?.latestUpdated?.link);
    lastLivePull = new Date(data.generatedAt || Date.now());
    livePulse.classList.remove('is-updated');
    void livePulse.offsetWidth;
    livePulse.classList.add('is-updated');
  };

  const loadLivePulse = async () => {
    if (livePullInFlight) return;
    livePullInFlight = true;
    livePulse.classList.add('is-loading');
    liveRefreshButton.disabled = true;
    setLiveText('live-pulse-status', 'Pulling the current public site, WordPress, sitemap, MCP, Semrush, and robots signals…');
    try {
      const response = await fetch('/.netlify/functions/bigorange-live', { cache: 'no-store', headers: { Accept: 'application/json' } });
      const data = await response.json();
      if (!response.ok && data.state === 'offline') throw new Error('Live sources unavailable');
      renderLivePulse(data);
    } catch {
      livePulse.classList.add('is-partial');
      setLiveText('live-pulse-status', 'The live pull got stuck. The verified snapshot stays visible while we try again.');
      setLiveText('hero-live-sync', 'Retrying');
    } finally {
      livePullInFlight = false;
      livePulse.classList.remove('is-loading');
      liveRefreshButton.disabled = false;
    }
  };

  const updateLiveAge = () => {
    if (lastLivePull) livePulseAge.textContent = `Pulled ${formatFreshness(lastLivePull)} · public data only`;
  };

  liveRefreshButton.addEventListener('click', loadLivePulse);
  window.setInterval(() => {
    updateLiveAge();
    if (document.visibilityState === 'visible') loadLivePulse();
  }, 60000);
  window.setInterval(updateLiveAge, 1000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && (!lastLivePull || Date.now() - lastLivePull.getTime() > 60000)) loadLivePulse();
  });
  loadLivePulse();
}

const dashboard = document.querySelector('#live-dashboard');
if (dashboard) {
  const dashboardState = { data: null, client: 'ami', range: null };
  const byId = (id) => document.getElementById(id);
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);

  const renderTable = (target, table) => {
    target.innerHTML = `<table><thead><tr>${table.columns.map((column) => `<th>${escapeHtml(column)}</th>`).join('')}</tr></thead><tbody>${table.rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  };

  const renderLineChart = (target, series) => {
    const width = 760;
    const height = 270;
    const pad = { left: 38, right: 18, top: 24, bottom: 38 };
    const max = Math.max(1, ...series.flatMap((point) => [point.sessions || 0, point.views || 0]));
    const x = (index) => pad.left + (series.length === 1 ? 0 : index * (width - pad.left - pad.right) / (series.length - 1));
    const y = (value) => pad.top + (height - pad.top - pad.bottom) * (1 - value / max);
    const path = (key) => series.map((point, index) => `${index ? 'L' : 'M'} ${x(index).toFixed(1)} ${y(point[key] || 0).toFixed(1)}`).join(' ');
    const grid = [0, .25, .5, .75, 1].map((ratio) => {
      const gy = pad.top + (height - pad.top - pad.bottom) * ratio;
      return `<line x1="${pad.left}" y1="${gy}" x2="${width - pad.right}" y2="${gy}"/><text x="${pad.left - 8}" y="${gy + 4}" text-anchor="end">${Math.round(max * (1 - ratio))}</text>`;
    }).join('');
    const labels = series.map((point, index) => `<text x="${x(index)}" y="${height - 10}" text-anchor="middle">${escapeHtml(point.label)}</text>`).join('');
    const dots = (key, className) => series.map((point, index) => `<circle class="${className}" cx="${x(index)}" cy="${y(point[key] || 0)}" r="4"><title>${escapeHtml(point.label)}: ${point[key] || 0}</title></circle>`).join('');
    target.innerHTML = `<div class="chart-legend"><span><i class="views"></i>Page views</span><span><i class="sessions"></i>Sessions</span></div><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Daily sessions and page views"><g class="chart-grid">${grid}${labels}</g><path class="chart-area" d="${path('views')} L ${x(series.length - 1)} ${height - pad.bottom} L ${x(0)} ${height - pad.bottom} Z"/><path class="chart-line views" d="${path('views')}"/><path class="chart-line sessions" d="${path('sessions')}"/>${dots('views', 'chart-dot views')}${dots('sessions', 'chart-dot sessions')}</svg>`;
  };

  const renderFunnel = (target, series) => {
    const max = Math.max(...series.map((item) => item.value), 1);
    target.innerHTML = `<div class="funnel-chart">${series.map((item) => `<div><span>${escapeHtml(item.label)}</span><i style="--bar:${Math.max(8, item.value / max * 100)}%"></i><strong>${item.value.toLocaleString()}</strong></div>`).join('')}</div>`;
  };

  const renderDashboard = () => {
    dashboard.classList.remove('dashboard-motion');
    const client = dashboardState.data.clients[dashboardState.client];
    dashboardState.range = dashboardState.range && client.ranges[dashboardState.range] ? dashboardState.range : client.defaultRange;
    const range = client.ranges[dashboardState.range];
    byId('dashboard-eyebrow').textContent = client.eyebrow;
    byId('dashboard-title').textContent = client.title;
    byId('dashboard-source').textContent = `${client.source} · Refreshed ${new Date(dashboardState.data.generated).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}`;
    byId('dashboard-alert').className = `dashboard-alert ${client.alert.tone}`;
    byId('dashboard-alert').textContent = client.alert.text;
    byId('dashboard-kpis').innerHTML = range.kpis.map((kpi, index) => `<article class="${index === 0 ? 'primary' : ''}" style="--i:${index}"><span>${escapeHtml(kpi.label)}</span><strong>${escapeHtml(kpi.value)}</strong><p>${escapeHtml(kpi.note)}</p></article>`).join('');
    byId('range-switcher').innerHTML = Object.entries(client.ranges).map(([key, item]) => `<button type="button" data-range="${escapeHtml(key)}" aria-pressed="${key === dashboardState.range}">${escapeHtml(item.label)}<span>${escapeHtml(item.period)}</span></button>`).join('');
    byId('chart-title').textContent = client.chart.title;
    byId('chart-note').textContent = client.chart.note;
    if (client.chart.type === 'funnel') renderFunnel(byId('dashboard-chart'), client.chart.series);
    else renderLineChart(byId('dashboard-chart'), client.chart.series);
    byId('breakdown-title').textContent = client.breakdown.title;
    byId('detail-title').textContent = client.detail.title;
    renderTable(byId('dashboard-breakdown'), client.breakdown);
    renderTable(byId('dashboard-detail'), client.detail);
    byId('dashboard-status').innerHTML = client.status.map((item) => `<article><span>${escapeHtml(item.label)}</span><strong class="${escapeHtml(item.tone)}">${escapeHtml(item.state)}</strong><p>${escapeHtml(item.detail)}</p></article>`).join('');
    dashboard.querySelectorAll('[data-client]').forEach((button) => button.setAttribute('aria-selected', String(button.dataset.client === dashboardState.client)));
    byId('range-switcher').querySelectorAll('[data-range]').forEach((button) => button.addEventListener('click', () => {
      dashboardState.range = button.dataset.range;
      renderDashboard();
    }));
    void dashboard.offsetWidth;
    requestAnimationFrame(() => dashboard.classList.add('dashboard-motion'));
  };

  const loadDashboard = () => {
    byId('dashboard-source').textContent = 'Checking for anything fresher…';
    fetch(`dashboard-data.json?ts=${Date.now()}`, { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((data) => {
        dashboardState.data = data;
        dashboardState.range = null;
        renderDashboard();
      })
      .catch((error) => {
        byId('dashboard-source').textContent = `That pull got stuck: ${error.message}`;
        byId('dashboard-alert').className = 'dashboard-alert crit';
        byId('dashboard-alert').textContent = 'The page showed up. The data file did not. Hit “Pull fresh numbers” and we’ll try again.';
      });
  };

  dashboard.querySelectorAll('[data-client]').forEach((button) => button.addEventListener('click', () => {
    dashboardState.client = button.dataset.client;
    dashboardState.range = null;
    renderDashboard();
  }));
  byId('dashboard-reload').addEventListener('click', loadDashboard);
  loadDashboard();
}
