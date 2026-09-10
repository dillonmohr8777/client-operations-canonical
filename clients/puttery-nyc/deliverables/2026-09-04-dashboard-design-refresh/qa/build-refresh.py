from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
h = (root / 'qa/baseline/index.html').read_text(encoding='utf-8')
# Retain the verified application structure and question database. Replace only
# its operational hierarchy and decorative presentation.
h = re.sub(r'    <!--.*?    <a class="skip-link"', '    <a class="skip-link"', h, count=1, flags=re.S)
h = h.replace('family=Caveat:wght@600&', '')
h = h.replace('    <link rel="stylesheet" href="styles.css" />', '    <link rel="stylesheet" href="styles.css" />\n    <link rel="icon" href="assets/favicon.svg" type="image/svg+xml" />')
h = h.replace('Skip to pilot overview', 'Skip to dashboard')
h = h.replace('<span class="location-tag">NEW YORK CITY</span>\n        <span class="pilot-tag">ATTRIBUTION PILOT</span>', '<span class="location-tag">New York City</span><span class="pilot-tag">Attribution workspace</span>')
period = re.search(r'        <label class="period-control".*?</label>', h, re.S).group(0)
h = h.replace(period, '')
h = h.replace('>Export answers</button>', '><span data-icon="download"></span>Export answers</button>')
h = h.replace('>Reset view</button>', '><span data-icon="reset"></span>Reset view</button>')
h = re.sub(r'    <aside class="truth-strip".*?</aside>', '''    <aside class="truth-strip" aria-label="Dashboard data boundary">
      <span data-icon="shield"></span><strong>Attribution pilot</strong>
      <span>Dated integration evidence. Performance examples remain modeled; this page contains no guest records.</span>
    </aside>''', h, count=1, flags=re.S)
nav = [('overview','overview','Overview','Pilot at a glance'), ('live-status','activity','Current status','Evidence & next step'), ('integrations','plug','Integrations','Access & source readiness'), ('discovery','checklist','Discovery lab','Your saved worksheet'), ('outcomes','flag','Outcome map','What success means'), ('reconciliation','layers','Revenue truth','Definitions & matching'), ('rollout','route','Pilot plan','Phases & acceptance'), ('next-action','arrow','Next action','Owners & dependencies')]
navhtml = ''.join(f'<a class="rail-link {"active" if i==0 else ""}" href="#{id}"><span class="nav-icon" data-icon="{icon}"></span><span class="nav-copy"><span>{title}</span><small>{sub}</small></span></a>' for i,(id,icon,title,sub) in enumerate(nav))
h = re.sub(r'<p class="rail-title">.*?</nav>', f'<p class="rail-title">Pilot control</p><nav>{navhtml}</nav>', h, count=1, flags=re.S)
start = h.index('        <section id="overview"')
end = h.index('        <section id="live-status"')
h = h[:start] + '''        <section id="overview" class="hero-section section-block" aria-labelledby="overview-title">
          <div class="hero-copy">
            <h1 id="overview-title">Attribution pilot</h1>
            <p class="hero-summary">A clear route from marketing to booked guests, completed visits, and collected revenue.</p>
            <div class="hero-meta"><span><span data-icon="pin"></span>Puttery NYC</span><span><span data-icon="clock"></span><span data-status-field="snapshotLabel">September 4, 2026 snapshot</span></span></div>
            <div class="hero-actions"><a class="action-button primary" href="#live-status">Review next step<span data-icon="arrow"></span></a><a class="text-action" href="#discovery">Open discovery lab</a></div>
          </div>
          <div class="pilot-scoreboard" aria-label="Discovery worksheet summary">
            <div class="scoreboard-head"><span><span data-icon="checklist"></span>Discovery worksheet</span><strong id="readiness-percent">0%</strong></div>
            <div class="score-track putt-track" aria-hidden="true"><span id="score-fill"></span></div>
            <dl class="score-grid"><div><dt>Questions resolved</dt><dd id="questions-resolved">0 / 69</dd></div><div><dt>Blocking answers</dt><dd id="blocking-open">0 open</dd></div></dl>
            <p class="worksheet-note">Your answers save in this browser. Progress is separate from verified integration status.</p>
            <div class="mobile-scoreboard" aria-label="Discovery gate"><span id="mobile-readiness-percent">0%</span><span id="mobile-current-gate">Reconciliation pending</span><span id="mobile-score-fill" hidden></span></div>
            <span id="current-gate" hidden></span><p id="readiness-explainer" hidden></p>
          </div>
        </section>

''' + h[end:]
h = h.replace(' data-split', '')
h = h.replace('<div class="status-route-layout">', '<div class="status-route-layout">')
h = h.replace('<div>\n              <h3>Launch path</h3>\n              <ol id="status-milestones"', '<details class="launch-details"><summary><span data-icon="route"></span><span>Launch path & evidence</span><span class="details-hint">View all checkpoints</span></summary>\n              <ol id="status-milestones"')
h = h.replace('</ol>\n            </div>\n            <div class="status-next"', '</ol>\n            </details>\n            <div class="status-next"', 1)
h = h.replace('<h3 id="vendor-action-title">Tock response needed</h3>', '<h3 id="vendor-action-title"><span data-icon="arrow"></span>Next action</h3>')
# Keep modeled charts available, but require explicit disclosure before viewing.
start = h.index('        <section class="metric-section')
end = h.index('        <section id="outcomes"')
model = h[start:end]
model = model.replace('<section class="metric-section section-block" aria-labelledby="modeled-title">', '<section class="metric-section section-block"><details class="modeled-disclosure"><summary><span data-icon="chart"></span><span><strong>Preview the finished reporting view</strong><small>Modeled demonstration data · not Puttery performance</small></span><span class="details-hint">Show example</span></summary><div class="modeled-body">')
model = model.replace('<h2 id="modeled-title">What the finished view can show</h2>', '<h2 id="modeled-title">Modeled demonstration data</h2>')
model = model.replace('<div class="metric-scorecard">', period + '<div class="metric-scorecard">')
model = model.replace('        </section>', '</div></details>        </section>')
h = h[:start] + h[end:]
# Place the example after the outcome questions rather than ahead of work.
pos = h.index('        <section id="integrations"')
h = h[:pos] + model + h[pos:]
h = h.replace('Seven systems form the pilot. Tock identifiers and Reservation Webhook eligibility are now confirmed; registration, a controlled payload, Data Exports access, and every other live source still require verification.', 'Ten source lanes, each with an explicit access state. Open a lane to inspect its evidence, missing access, and fallback. Toast remains deferred from Phase 1.')
h = h.replace('The pilot must answer three business questions','Three outcomes worth proving')
h = h.replace('Revenue truth and reconciliation', 'Revenue truth')
h = re.sub(r'<img class="outcome-mark"[^>]+>', '<span class="outcome-icon" data-icon="flag"></span>', h, count=1)
h = re.sub(r'<img class="outcome-mark"[^>]+>', '<span class="outcome-icon" data-icon="check"></span>', h, count=1)
h = re.sub(r'<img class="outcome-mark"[^>]+>', '<span class="outcome-icon" data-icon="receipt"></span>', h, count=1)
h = h.replace('<p id="empty-questions" class="empty-state" hidden>No questions match these filters. Clear a filter to continue.</p>', '<div id="empty-questions" class="empty-state" hidden><span data-icon="search"></span><p>No questions match these filters.</p><button id="clear-question-filters" class="action-button secondary" type="button">Clear question filters</button></div>')
h = h.replace('<div class="discovery-controls">', '<p class="save-state" id="save-state" role="status"><span data-icon="device"></span>Saved locally in this browser. Export a copy before switching devices.</p><div class="discovery-controls">')
h = h.replace('<h2 id="next-title">The next move is one controlled Tock delivery.</h2>', '<h2 id="next-title">Turn the next delivery into proof.</h2>')
h = h.replace('Tock completes the secure registration and rotation steps, then sends one Puttery NYC event. Momentum verifies Business 37824 routing and reconciles the event before any production reporting is enabled.', '<span data-status-field="nextAction">Confirm the controlled event and reconcile the resulting record before enabling production reporting.</span>')
h = h.replace('Confirm secure packet access, rotate the prior credential through the approved secure route, register the Reservation Webhook, send one controlled NYC event, and confirm Data Exports.', 'Confirm which delivery is the intended NYC test, its event details, the secure credential route, and Data Exports access.')
h = h.replace('Verify the delivery, preserve only privacy-safe reservation facts, and document the exact value and recovery behavior.', 'Reconcile the received event to the intended NYC record, confirm update and recovery behavior, and document the result without guest data.')
(root / 'index.html').write_text(h, encoding='utf-8')

j = (root / 'qa/baseline/app.js').read_text(encoding='utf-8')
j = j[:j.index('/* Section headings resolve')] + j[j.index('document.addEventListener("DOMContentLoaded"'):]
j = j.replace('  animateHeadings();\n  renderCourseMarks();', '  renderIcons();\n  restoreViewState();')
j = j.replace('function saveAnswers() {\n  localStorage.setItem(storageKey, JSON.stringify(answers));\n}', '''function saveAnswers() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(answers));
    document.querySelector("#save-state").textContent = "Saved locally in this browser. Export a copy before switching devices.";
  } catch (_) {
    document.querySelector("#save-state").textContent = "Browser storage is unavailable. Your current answers are still here; export a copy before leaving.";
    showFeedback("Could not save in this browser. Export your answers to keep a copy.");
  }
}''')
j = j.replace('return JSON.parse(localStorage.getItem(storageKey)) || {};', '''const stored = JSON.parse(localStorage.getItem(storageKey));
    if (!stored || typeof stored !== "object" || Array.isArray(stored)) return {};
    return Object.fromEntries(Object.entries(stored).filter(([id, answer]) => questions.some(q => q.id === id) && answer && ["unanswered", "yes", "no", "na"].includes(answer.status)).map(([id, answer]) => [id, { status: answer.status, note: typeof answer.note === "string" ? answer.note : "" }]));''')
platformfn = '''function renderPlatforms() {
  const container = document.querySelector("#platform-grid");
  const openKeys = new Set([...container.querySelectorAll("details[open]")].map(el => el.dataset.platform));
  container.innerHTML = platformDetails.map((platform) => {
    const related = questions.filter((question) => question.platform === platform.key);
    const resolved = related.filter((question) => answers[question.id]?.status && answers[question.id].status !== "unanswered").length;
    return `<details class="platform-card" data-platform="${platform.key}" ${openKeys.has(platform.key) ? "open" : ""}>
      <summary><span class="platform-icon">${icon(platformIcon[platform.key] || "plug")}</span><span class="platform-name"><strong>${platform.name}</strong><small>${platform.role}</small></span><span class="platform-state ${platform.state}">${platform.stateLabel}</span><span class="platform-chevron">${icon("chevron")}</span></summary>
      <div class="platform-copy"><dl><div><dt>Documented</dt><dd>${platform.confirmed}</dd></div><div><dt>Still needed</dt><dd>${platform.unknown}</dd></div><div><dt>Fallback</dt><dd>${platform.fallback}</dd></div></dl>
      <div class="platform-detail-footer"><span>${resolved} of ${related.length} questions resolved</span><button class="platform-jump" type="button" data-platform-jump="${platform.key}">Review ${platform.name} questions ${icon("arrow")}</button></div></div></details>`;
  }).join("");
  container.querySelectorAll("[data-platform-jump]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelector("#platform-filter").value = button.dataset.platformJump;
      document.querySelector("#status-filter").value = "all";
      document.querySelector("#question-search").value = "";
      renderQuestions();
      history.replaceState(null, "", `${location.pathname}${location.search}#discovery`);
      document.querySelector("#discovery").scrollIntoView({ behavior: motionBehavior() });
      document.querySelector("#platform-filter").focus({ preventScroll: true });
    });
  });
}

'''
a = j.index('function renderPlatforms()'); b = j.index('function populatePlatformFilter()')
j = j[:a] + platformfn + j[b:]
# Include refreshed state in the Tock evidence row after status is loaded.
j = j.replace('  renderOperationalStatus();', '''  const tock = platformDetails.find(p => p.key === "Tock");
  if (window.PUTTERY_OPERATIONAL_STATUS?.tockConfirmed) {
    tock.confirmed = window.PUTTERY_OPERATIONAL_STATUS.tockConfirmed;
    tock.unknown = window.PUTTERY_OPERATIONAL_STATUS.tockPending;
    tock.stateLabel = "Delivery received";
    tock.state = "verify";
  }
  renderOperationalStatus();''')
j = j.replace('  const filtered = getFilteredQuestions();', '  const filtered = getFilteredQuestions();\n  syncViewState();')
j = j.replace('      renderPlatforms();\n    });', '''      renderPlatforms();
      const group = select.closest(".question-group");
      if (group) {
        const selections = [...group.querySelectorAll("[data-answer-select]")];
        group.querySelector(".question-group-progress").textContent = `${selections.filter(s => s.value !== "unanswered").length} of ${selections.length} resolved`;
        const blockers = [...group.querySelectorAll(".question-item")].filter(q => q.querySelector(".blocking"));
        const openCount = blockers.filter(q => ["unanswered", "no"].includes(q.querySelector("select").value)).length;
        group.querySelector(".question-group-blockers").textContent = `${openCount} blocker${openCount === 1 ? "" : "s"} open`;
      }
    });''')
j = j.replace('  const view = metricViews[period];', '  const view = metricViews[period] || metricViews["30d"];\n  syncViewState();')
j = j.replace('behavior: "smooth"', 'behavior: motionBehavior()')
j = j.replace('links.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`));', '''links.forEach((link) => {
      const active = link.getAttribute("href") === `#${visible.target.id}`;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "location"); else link.removeAttribute("aria-current");
    });''')
j = j.replace('  document.querySelector("#reset-view").addEventListener("click", resetView);', '''  document.querySelector("#reset-view").addEventListener("click", resetView);
  document.querySelector("#clear-question-filters").addEventListener("click", () => {
    document.querySelector("#platform-filter").value = "all";
    document.querySelector("#status-filter").value = "all";
    document.querySelector("#question-search").value = "";
    renderQuestions();
    document.querySelector("#question-search").focus();
  });''')
icons = {
 'overview':'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
 'activity':'<path d="M3 12h4l3-8 4 16 3-8h4"/>', 'plug':'<path d="M9 3v4m6-4v4M7 7h10v4a5 5 0 0 1-5 5v5m-5-14v4a5 5 0 0 0 5 5"/>',
 'checklist':'<rect x="5" y="4" width="15" height="17" rx="2"/><path d="M9 4V2h6v2M8 10l1.5 1.5L12 9m2 2h3M8 16l1.5 1.5L12 15m2 2h3"/>',
 'flag':'<path d="M5 22V3m0 1c5-5 9 5 15 0v9c-6 5-10-5-15 0"/>', 'layers':'<path d="m12 3 10 6-10 6L2 9l10-6Zm-9 11 9 6 9-6M3 18l9 5 9-5"/>',
 'route':'<circle cx="5" cy="6" r="2"/><circle cx="19" cy="18" r="2"/><path d="M7 6h9a4 4 0 0 1 0 8H8a4 4 0 0 0 0 8h4"/>', 'arrow':'<path d="M4 12h16m-6-6 6 6-6 6"/>',
 'download':'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>', 'reset':'<path d="M3 4v6h6M3 10a9 9 0 1 1 2 8"/>',
 'shield':'<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>', 'pin':'<path d="M19 10c0 6-7 11-7 11S5 16 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
 'clock':'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>', 'chart':'<path d="M4 3v17h17M8 15v-4m5 4V7m5 8V4"/>', 'check':'<path d="m5 12 4 4L20 5"/>',
 'receipt':'<path d="M5 3h14v19l-3-2-4 2-4-2-3 2V3Zm4 5h6m-6 4h6m-6 4h3"/>', 'search':'<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
 'device':'<rect x="3" y="3" width="18" height="13" rx="2"/><path d="M8 21h8m-4-5v5"/>','chevron':'<path d="m7 10 5 5 5-5"/>',
 'globe':'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>', 'calendar':'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6m10-6v6M3 11h18m-13 5h4"/>',
 'users':'<circle cx="9" cy="8" r="3"/><path d="M2 21v-3a7 7 0 0 1 14 0v3M16 5a3 3 0 0 1 0 6m3 10v-3a6 6 0 0 0-2-5"/>','tag':'<path d="M3 3h8l10 10-8 8L3 11V3Z"/><circle cx="8" cy="8" r="1"/>','megaphone':'<path d="m3 10 15-6v15L3 14v-4Zm4 6 2 6h4l-2-4m10-9v6"/>',
}
import json
utilities = '\nconst icons = ' + json.dumps(icons) + ';\n' + '''function icon(name) { return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${icons[name] || icons.plug}</svg>`; }
function renderIcons() { document.querySelectorAll("[data-icon]").forEach(el => { el.innerHTML = icon(el.dataset.icon); el.setAttribute("aria-hidden", "true"); }); }
const platformIcon = { Website:"globe", Tock:"calendar", Toast:"receipt", Tripleseat:"users", GA4:"chart", "Google Ads":"megaphone", Meta:"megaphone", "Tock Guest":"users", "Tock Walk-in":"flag", GTM:"tag" };
function motionBehavior() { return matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"; }
let restoringView = true;
function syncViewState() {
  if (restoringView) return;
  const url = new URL(location.href);
  const values = { period: document.querySelector("#period-select").value, platform: document.querySelector("#platform-filter").value, answers: document.querySelector("#status-filter").value, q: document.querySelector("#question-search").value };
  for (const [key, value] of Object.entries(values)) {
    if (!value || value === "all" || (key === "period" && value === "30d")) url.searchParams.delete(key); else url.searchParams.set(key, value);
  }
  history.replaceState(null, "", url);
}
function restoreViewState() {
  const params = new URLSearchParams(location.search);
  for (const [key, id] of [["period", "period-select"], ["platform", "platform-filter"], ["answers", "status-filter"]]) {
    const el = document.getElementById(id); const val = params.get(key);
    if ([...el.options].some(option => option.value === val)) el.value = val;
  }
  document.querySelector("#question-search").value = params.get("q") || "";
  restoringView = false;
  renderQuestions();
  setMetricView(document.querySelector("#period-select").value);
}
'''
j = j.replace('document.addEventListener("DOMContentLoaded"', utilities + '\ndocument.addEventListener("DOMContentLoaded"')
(root / 'app.js').write_text(j, encoding='utf-8')
(root / 'assets/favicon.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#010000"/><path d="M10 26V6m0 1h13l-3 5 3 5H10" fill="none" stroke="#00bfb2" stroke-width="2.5"/><circle cx="22" cy="25" r="3" fill="#e63e62"/></svg>')
print('HTML and app refresh created from verified live baseline.')
