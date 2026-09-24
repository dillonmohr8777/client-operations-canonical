(() => {
  const trackingKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'wbraid', 'gbraid'];
  const query = new URLSearchParams(window.location.search);

  const pushEvent = (event, details = {}) => {
    if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event, ...details });
    if (typeof window.gtag === 'function') window.gtag('event', event, details);
  };

  trackingKeys.forEach((key) => {
    const value = query.get(key);
    if (!value) return;
    document.querySelectorAll(`input[name="${key}"]`).forEach((input) => { input.value = value; });
  });

  document.querySelectorAll('a[href^="https://www.omegalandscapingandconcrete.com"]').forEach((link) => {
    const url = new URL(link.href);
    trackingKeys.forEach((key) => { if (query.get(key)) url.searchParams.set(key, query.get(key)); });
    link.href = url.toString();
  });

  const tabs = [...document.querySelectorAll('[data-service-tab]')];
  const panels = [...document.querySelectorAll('[data-service-panel]')];
  const serviceSelect = document.querySelector('[data-service-select]');

  const selectService = (name, focus = false) => {
    tabs.forEach((tab) => {
      const active = tab.dataset.serviceTab === name;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focus) tab.focus();
    });
    panels.forEach((panel) => {
      const active = panel.dataset.servicePanel === name;
      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
    });
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectService(tab.dataset.serviceTab));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
      event.preventDefault();
      const step = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1;
      const next = tabs[(index + step + tabs.length) % tabs.length];
      selectService(next.dataset.serviceTab, true);
    });
  });
  selectService('landscape');

  document.querySelectorAll('a[href="#estimate"]').forEach((link) => {
    link.addEventListener('click', () => {
      const service = link.dataset.serviceChoice || '';
      if (service && serviceSelect) serviceSelect.value = service;
      pushEvent('estimate_start', { service: service || 'unspecified', placement: link.closest('header') ? 'header' : 'page' });
    });
  });

  document.querySelectorAll('.tracked-phone').forEach((link) => {
    link.addEventListener('click', () => pushEvent('phone_call', { phone: '7198960663' }));
  });

  const form = document.querySelector('[data-estimate-form]');
  form?.addEventListener('submit', () => {
    const service = new FormData(form).get('service') || 'unspecified';
    pushEvent('form_submit', { service });
    // Do NOT fire the Ads conversion here. This handler runs on click, before
    // Netlify has accepted the POST and before netlify-honeypot="bot-field"
    // has filtered bots -- so firing here counts rejected and bot submissions
    // as conversions. Instead mark the attempt; /thank-you/ fires the
    // conversion, and Netlify only serves that page on a genuine acceptance.
    try {
      sessionStorage.setItem('omega_submit_pending', '1');
    } catch (err) {
      /* private mode: the thank-you page falls back to its referrer check */
    }
    const button = form.querySelector('button[type="submit"]');
    if (button) {
      button.disabled = true;
      button.textContent = 'Sending project details…';
    }
  });

  if (form && 'IntersectionObserver' in window) {
    const formObserver = new IntersectionObserver(([entry]) => {
      document.body.classList.toggle('form-in-view', entry.isIntersecting);
    }, { threshold: 0.08 });
    formObserver.observe(form.closest('#estimate') || form);
  }

  const runway = document.querySelector('.runway');
  if (runway && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        runway.classList.add('is-visible');
        observer.disconnect();
      }
    }, { threshold: 0.35 });
    observer.observe(runway);
  } else {
    runway?.classList.add('is-visible');
  }
})();
