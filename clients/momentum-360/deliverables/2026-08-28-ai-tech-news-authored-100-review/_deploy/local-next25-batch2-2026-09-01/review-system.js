(async () => {
  const broken = [];

  const trackImage = (image) => {
    const report = () => {
      broken.push(image.currentSrc || image.src || 'unknown');
      document.documentElement.dataset.reviewBrokenImages = String(broken.length);
    };

    if (image.complete && image.naturalWidth === 0) report();
    else image.addEventListener('error', report, { once: true });
  };

  document.querySelectorAll('img').forEach(trackImage);

  if (document.fonts?.ready) await document.fonts.ready.catch(() => {});
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

  const h1 = document.querySelector('h1');
  const hero = h1?.closest('section') || document.querySelector('main section');
  const heroImages = [...(hero?.querySelectorAll('img') || [])]
    .filter((image) => !/logo/i.test(image.getAttribute('src') || ''));
  const openingHasImage = heroImages.some((image) => {
    const style = getComputedStyle(image);
    const rect = image.getBoundingClientRect();
    return style.display !== 'none'
      && style.visibility !== 'hidden'
      && Number(style.opacity) > .01
      && rect.width > 1
      && rect.height > 1
      && rect.top < innerHeight
      && rect.bottom > 0;
  });

  if (hero && !openingHasImage) {
    const source = heroImages[0] || [...document.images]
      .find((image) => !/logo/i.test(image.getAttribute('src') || ''));

    if (source) {
      const heroStyle = getComputedStyle(hero);
      const bodyStyle = getComputedStyle(document.body);
      const transparent = /rgba?\(0,\s*0,\s*0(?:,\s*0)?\)/.test(heroStyle.backgroundColor);
      hero.style.setProperty('--review-hero-surface', transparent ? bodyStyle.backgroundColor : heroStyle.backgroundColor);

      const frame = document.createElement('figure');
      frame.className = 'review-opening-media';
      frame.setAttribute('aria-hidden', 'true');

      const image = document.createElement('img');
      image.src = source.currentSrc || source.getAttribute('src');
      image.alt = '';
      image.decoding = 'async';
      image.fetchPriority = 'high';
      trackImage(image);
      frame.append(image);
      hero.prepend(frame);
      document.body.dataset.reviewOpeningMedia = 'fallback';
    }
  }

  /* Release accessibility normalization. The source batches use several
     horizontal galleries on small screens; make every genuinely scrollable
     region keyboard reachable without changing its visual composition. */
  [...document.querySelectorAll('body *')].forEach((element) => {
    if (element.closest('[aria-hidden="true"]')) return;
    const style = getComputedStyle(element);
    const scrollable = /(auto|scroll)/.test(`${style.overflowX} ${style.overflowY}`)
      && (element.scrollWidth > element.clientWidth + 2 || element.scrollHeight > element.clientHeight + 2);
    if (!scrollable || element.tabIndex >= 0) return;
    element.tabIndex = 0;
    if (!element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
      if (!element.getAttribute('role')) element.setAttribute('role', 'region');
      element.setAttribute('aria-label', 'Scrollable content');
    }
  });

  /* The unslop hero dots are tabs in behavior and must expose matching roles. */
  document.querySelectorAll('[role="tablist"]').forEach((tablist) => {
    const tabs = [...tablist.querySelectorAll(':scope > button')];
    tabs.forEach((tab, index) => {
      tab.setAttribute('role', 'tab');
      const selected = tab.classList.contains('is-active') || tab.getAttribute('aria-current') === 'true' || index === 0;
      tab.setAttribute('aria-selected', selected ? 'true' : 'false');
      tab.tabIndex = selected ? 0 : -1;
    });
  });

  /* Give repeated navigation landmarks distinct names. */
  const navs = [...document.querySelectorAll('nav,[role="navigation"]')];
  if (navs.length > 1) {
    navs.forEach((nav, index) => {
      if (!nav.getAttribute('aria-label') && !nav.getAttribute('aria-labelledby')) {
        nav.setAttribute('aria-label', index === 0 ? 'Primary' : `Navigation ${index + 1}`);
      }
    });
  }

  /* Repair stale fragment aliases from the source concepts. These links stay
     inside the page and fall back to the nearest authored information area. */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    const fragment = anchor.getAttribute('href');
    if (!fragment || fragment === '#' || document.getElementById(fragment.slice(1))) return;
    const fallback = ['story', 'services', 'visit', 'main'].find((id) => document.getElementById(id));
    if (fallback) anchor.setAttribute('href', `#${fallback}`);
  });

  document.documentElement.dataset.reviewReady = 'true';
})();
