(() => {
  const trackingKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'wbraid', 'gbraid'];
  const query = new URLSearchParams(window.location.search);
  const pushEvent = (event, details = {}) => {
    if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event, ...details });
  };

  trackingKeys.forEach((key) => {
    const value = query.get(key);
    if (!value) return;
    document.querySelectorAll(`input[name="${key}"]`).forEach((input) => { input.value = value; });
  });

  document.querySelectorAll('a[href^="https://onsiteconcretelandscape.com"]').forEach((link) => {
    const url = new URL(link.href);
    trackingKeys.forEach((key) => { if (query.get(key)) url.searchParams.set(key, query.get(key)); });
    link.href = url.toString();
  });

  const tabs = [...document.querySelectorAll('[data-service-tab]')];
  const panels = [...document.querySelectorAll('[data-service-panel]')];
  const selector = document.querySelector('.selector');
  const serviceSelect = document.querySelector('[data-service-select]');

  const selectService = (name, focus = false) => {
    selector?.setAttribute('data-active', name);
    tabs.forEach((tab) => {
      const active = tab.dataset.serviceTab === name;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focus) tab.focus();
    });
    panels.forEach((panel) => { panel.hidden = panel.dataset.servicePanel !== name; });
  };

  selectService('concrete');
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

  document.querySelectorAll('a[href="#consultation"]').forEach((link) => {
    link.addEventListener('click', () => {
      const service = link.dataset.serviceChoice || '';
      if (service && serviceSelect) serviceSelect.value = service;
      pushEvent('estimate_start', { service: service || 'unspecified', placement: link.closest('header') ? 'header' : 'page' });
    });
  });
  document.querySelectorAll('.tracked-phone').forEach((link) => {
    link.addEventListener('click', () => pushEvent('phone_call', { phone: '7076285049' }));
  });

  const form = document.querySelector('[data-consultation-form]');
  form?.addEventListener('submit', () => {
    const service = new FormData(form).get('service') || 'unspecified';
    pushEvent('contact_form', { service });
    const button = form.querySelector('button[type="submit"]');
    if (button) {
      button.disabled = true;
      button.textContent = 'Sending request…';
    }
  });

  if (form && 'IntersectionObserver' in window) {
    const formObserver = new IntersectionObserver(([entry]) => {
      document.body.classList.toggle('form-in-view', entry.isIntersecting);
    }, { threshold: 0.08 });
    formObserver.observe(form.closest('#consultation') || form);
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible');
      });
    }, { threshold: 0.3 });
    document.querySelectorAll('.sequence-track, .work-floor').forEach((element) => observer.observe(element));
  } else {
    document.querySelectorAll('.sequence-track, .work-floor').forEach((element) => element.classList.add('is-visible'));
  }
})();
