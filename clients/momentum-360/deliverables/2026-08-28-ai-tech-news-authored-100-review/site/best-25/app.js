const elements = {
  search: document.querySelector('#prospect-search'),
  clearSearch: document.querySelector('#clear-search'),
  jump: document.querySelector('#prospect-jump'),
  tabs: [...document.querySelectorAll('[data-cohort]')],
  tabCounts: [...document.querySelectorAll('[data-cohort-count]')],
  list: document.querySelector('#prospect-list'),
  finderList: document.querySelector('#finder-list'),
  empty: document.querySelector('#empty-state'),
  count: document.querySelector('#result-count'),
  finder: document.querySelector('#finder'),
  openFinder: document.querySelector('#open-finder'),
  closeFinder: document.querySelector('#close-finder'),
  stage: document.querySelector('#review-stage'),
  frameField: document.querySelector('#frame-field'),
  frame: document.querySelector('#concept-frame'),
  loading: document.querySelector('#preview-loading'),
  business: document.querySelector('#active-business'),
  position: document.querySelector('#active-position'),
  note: document.querySelector('#active-note'),
  scope: document.querySelector('#active-scope'),
  phone: document.querySelector('#active-phone'),
  official: document.querySelector('#official-site'),
  openDemo: document.querySelector('#open-demo'),
  previous: document.querySelector('#previous-prospect'),
  next: document.querySelector('#next-prospect'),
  progress: document.querySelector('#progress-fill'),
  viewportButtons: [...document.querySelectorAll('[data-viewport]')],
};

const state = {
  prospects: [],
  visible: [],
  cohort: 'all',
  query: '',
  activeSlug: null,
};

const cohortNames = {
  batch2: 'Batch 2',
  batch4: 'Batch 4',
  unslop25: 'Unslop',
};

const normalize = (value) => String(value || '').toLowerCase().replaceAll('_', ' ');

const formatScope = (value) => normalize(value).replace(/\b\w/g, (letter) => letter.toUpperCase());

const prospectSearchText = (prospect) => normalize([
  prospect.business,
  prospect.phone,
  prospect.pitch_scope,
  cohortNames[prospect.cohort],
].join(' '));

const buttonForSlug = (slug) => elements.list.querySelector(`[data-slug="${CSS.escape(slug)}"]`);

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function updateHash(slug) {
  const nextUrl = `${window.location.pathname}${window.location.search}#${encodeURIComponent(slug)}`;
  window.history.replaceState(null, '', nextUrl);
}

function filteredProspects() {
  const query = normalize(state.query).trim();
  return state.prospects.filter((prospect) => {
    const cohortMatches = state.cohort === 'all' || prospect.cohort === state.cohort;
    const queryMatches = !query || prospectSearchText(prospect).includes(query);
    return cohortMatches && queryMatches;
  });
}

function renderFilmstrip() {
  const visibleSlugs = new Set(state.visible.map((prospect) => prospect.slug));
  const queryActive = Boolean(normalize(state.query).trim()) || state.cohort !== 'all';

  elements.list.replaceChildren();
  const fragment = document.createDocumentFragment();

  for (const prospect of state.prospects) {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'prospect-button';
    button.dataset.slug = prospect.slug;
    button.setAttribute('aria-current', String(prospect.slug === state.activeSlug));
    button.setAttribute('aria-label', `${String(prospect.rank).padStart(2, '0')} ${prospect.business}`);
    button.title = prospect.business;
    button.textContent = String(prospect.rank).padStart(2, '0');
    if (queryActive && !visibleSlugs.has(prospect.slug)) button.classList.add('is-dimmed');
    button.addEventListener('click', () => activateProspect(prospect.slug, true));
    item.append(button);
    fragment.append(item);
  }

  elements.list.append(fragment);
}

function renderFinderList() {
  elements.finderList.replaceChildren();
  const fragment = document.createDocumentFragment();

  for (const prospect of state.visible) {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'finder-choice';
    button.dataset.slug = prospect.slug;
    button.setAttribute('aria-current', String(prospect.slug === state.activeSlug));
    button.innerHTML = `
      <span>${String(prospect.rank).padStart(2, '0')}</span>
      <span>
        <strong>${escapeHtml(prospect.business)}</strong>
        <small>${escapeHtml(cohortNames[prospect.cohort])} / ${escapeHtml(formatScope(prospect.pitch_scope))}</small>
      </span>
    `;
    button.addEventListener('click', () => {
      activateProspect(prospect.slug, true);
      closeFinder();
    });
    item.append(button);
    fragment.append(item);
  }

  elements.finderList.append(fragment);
  elements.empty.hidden = state.visible.length !== 0;
  elements.count.textContent = state.visible.length === state.prospects.length
    ? `All ${state.prospects.length} ranked prospects`
    : `${state.visible.length} of ${state.prospects.length} prospects shown`;
  elements.clearSearch.hidden = !normalize(state.query).trim();
}

function renderLists() {
  state.visible = filteredProspects();
  renderFilmstrip();
  renderFinderList();
  updateNavigationState();
}

function populateJumpMenu() {
  elements.jump.replaceChildren();

  for (const prospect of state.prospects) {
    const option = document.createElement('option');
    option.value = prospect.slug;
    option.textContent = `${String(prospect.rank).padStart(2, '0')} · ${prospect.business}`;
    elements.jump.append(option);
  }

  elements.jump.disabled = false;

  for (const count of elements.tabCounts) {
    const cohort = count.dataset.cohortCount;
    count.textContent = cohort === 'all'
      ? state.prospects.length
      : state.prospects.filter((prospect) => prospect.cohort === cohort).length;
  }
}

function activateProspect(slug, closeSearch = false) {
  const prospect = state.prospects.find((entry) => entry.slug === slug);
  if (!prospect) return;

  state.activeSlug = prospect.slug;
  const absolutePosition = state.prospects.findIndex((entry) => entry.slug === prospect.slug) + 1;

  elements.business.textContent = prospect.business;
  elements.position.textContent = `Prospect ${absolutePosition} of ${state.prospects.length}`;
  elements.note.textContent = prospect.note;
  elements.scope.textContent = formatScope(prospect.pitch_scope);
  elements.phone.textContent = prospect.phone;
  elements.phone.href = `tel:${prospect.phone.replace(/[^\d+]/g, '')}`;
  elements.official.href = prospect.official_url;
  elements.openDemo.href = prospect.demo_url;
  elements.frame.title = `${prospect.business} live concept preview`;
  elements.jump.value = prospect.slug;
  elements.progress.style.transform = `scaleX(${absolutePosition / state.prospects.length})`;

  elements.loading.hidden = false;
  if (elements.frame.src !== prospect.demo_url) elements.frame.src = prospect.demo_url;

  for (const button of elements.list.querySelectorAll('.prospect-button')) {
    button.setAttribute('aria-current', String(button.dataset.slug === prospect.slug));
  }
  for (const button of elements.finderList.querySelectorAll('.finder-choice')) {
    button.setAttribute('aria-current', String(button.dataset.slug === prospect.slug));
  }

  updateHash(prospect.slug);
  updateNavigationState();
  buttonForSlug(prospect.slug)?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  if (closeSearch) elements.search.blur();
}

function updateNavigationState() {
  const sequence = state.visible.length ? state.visible : state.prospects;
  const index = sequence.findIndex((prospect) => prospect.slug === state.activeSlug);
  const previous = sequence[index - 1];
  const next = sequence[index + 1];
  elements.previous.disabled = index <= 0;
  elements.next.disabled = index < 0 || index >= sequence.length - 1;
  elements.previous.setAttribute('aria-label', previous ? `Previous prospect: ${previous.business}` : 'No previous prospect');
  elements.next.setAttribute('aria-label', next ? `Next prospect: ${next.business}` : 'No next prospect');
  elements.previous.title = previous ? `Previous: ${previous.business}` : '';
  elements.next.title = next ? `Next: ${next.business}` : '';
}

function move(delta) {
  const sequence = state.visible.length ? state.visible : state.prospects;
  const index = sequence.findIndex((prospect) => prospect.slug === state.activeSlug);
  const nextProspect = sequence[index + delta];
  if (!nextProspect) return;
  activateProspect(nextProspect.slug);
}

function setCohort(cohort) {
  state.cohort = cohort;
  for (const tab of elements.tabs) tab.setAttribute('aria-selected', String(tab.dataset.cohort === cohort));
  renderLists();
  if (!state.visible.some((prospect) => prospect.slug === state.activeSlug) && state.visible[0]) {
    activateProspect(state.visible[0].slug);
  }
}

function openFinder() {
  if (typeof elements.finder.showModal === 'function' && !elements.finder.open) {
    elements.finder.showModal();
  }
  elements.search.focus();
}

function closeFinder() {
  if (elements.finder.open) elements.finder.close();
}

async function loadManifest() {
  const localPreview = ['127.0.0.1', 'localhost'].includes(window.location.hostname);
  const candidates = localPreview
    ? ['../../best-25-manifest-2026-08-30.json']
    : ['./data.json'];
  let lastError;

  for (const url of candidates) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Manifest request failed with ${response.status}`);
      const manifest = await response.json();
      if (!Array.isArray(manifest.prospects) || manifest.prospects.length !== 25) {
        throw new Error('Manifest does not contain exactly 25 prospects');
      }
      return manifest.prospects.sort((a, b) => a.rank - b.rank);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Unable to load the verified prospect manifest');
}

elements.frame.addEventListener('load', () => {
  window.setTimeout(() => { elements.loading.hidden = true; }, 180);
});

elements.search.addEventListener('input', (event) => {
  state.query = event.target.value;
  renderLists();
  if (!state.visible.some((prospect) => prospect.slug === state.activeSlug) && state.visible[0]) {
    activateProspect(state.visible[0].slug);
  }
});

elements.clearSearch.addEventListener('click', () => {
  elements.search.value = '';
  state.query = '';
  renderLists();
  elements.search.focus();
});

elements.jump.addEventListener('change', () => {
  const slug = elements.jump.value;
  state.query = '';
  state.cohort = 'all';
  elements.search.value = '';
  for (const tab of elements.tabs) tab.setAttribute('aria-selected', String(tab.dataset.cohort === 'all'));
  renderLists();
  activateProspect(slug, true);
  closeFinder();
});

for (const tab of elements.tabs) tab.addEventListener('click', () => setCohort(tab.dataset.cohort));

elements.previous.addEventListener('click', () => move(-1));
elements.next.addEventListener('click', () => move(1));
elements.openFinder.addEventListener('click', openFinder);
elements.closeFinder.addEventListener('click', closeFinder);

for (const button of elements.viewportButtons) {
  button.addEventListener('click', () => {
    const phoneView = button.dataset.viewport === 'phone';
    elements.frameField.classList.toggle('phone-view', phoneView);
    for (const peer of elements.viewportButtons) peer.setAttribute('aria-pressed', String(peer === button));
  });
}

document.addEventListener('keydown', (event) => {
  if (event.defaultPrevented) return;

  const typing = event.target instanceof HTMLInputElement
    || event.target instanceof HTMLTextAreaElement
    || event.target instanceof HTMLSelectElement;

  if (event.key === '/' && !typing) {
    event.preventDefault();
    openFinder();
    return;
  }

  if (event.key === 'Escape' && elements.finder.open) {
    closeFinder();
    return;
  }

  if (!typing && event.key === 'ArrowLeft') move(-1);
  if (!typing && event.key === 'ArrowRight') move(1);

  if (event.target instanceof HTMLElement && event.target.classList.contains('prospect-button') && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
    event.preventDefault();
    const buttons = [...elements.list.querySelectorAll('.prospect-button')];
    const index = buttons.indexOf(event.target);
    const target = buttons[index + (event.key === 'ArrowDown' ? 1 : -1)];
    target?.focus();
  }
});

loadManifest()
  .then((prospects) => {
    state.prospects = prospects;
    populateJumpMenu();
    const requestedSlug = decodeURIComponent(window.location.hash.slice(1));
    const initial = prospects.find((prospect) => prospect.slug === requestedSlug) || prospects[0];
    state.activeSlug = initial.slug;
    renderLists();
    activateProspect(initial.slug);
  })
  .catch((error) => {
    elements.count.textContent = 'The verified prospect list could not be loaded.';
    elements.loading.textContent = 'Preview unavailable';
    elements.empty.hidden = false;
    elements.empty.textContent = 'Refresh the page. If the issue remains, use the verified call sheet while this review surface is repaired.';
    console.error(error);
  });
