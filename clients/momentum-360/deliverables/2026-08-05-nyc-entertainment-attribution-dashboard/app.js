/* ==========================================================================
   NYC Entertainment Portfolio · Attribution Pass
   --------------------------------------------------------------------------
   MODEL RULE: only independent facts are stored. Everything that can be
   computed IS computed (see derive()), because the previous build stored
   `matched`, `roas` and a second copy of every figure in the markup, and the
   three drifted apart - the page shipped $28,470 booked in HTML against
   $9,000 in the model, and "8.0x" ROAS against the 2.1x the model implied.

   RENDER RULE: paintValues() runs on every animation frame, so it only ever
   writes text and widths. Anything that builds DOM or attaches a listener
   (tickets, tooltips) is bound once or on discrete state change - never
   inside the frame loop.

   ENCODING RULE: one ordinal blue ramp carries every quantity. Brand orange
   is chrome. Status is glyph + word + ink, never hue alone.
   ========================================================================== */

/* ── the model: independent facts only ──────────────────────────────────── */
const VENUES = {
  portfolio: {
    label: "Portfolio model",
    spend: 2500, clicks: 3842, sourceCoverage: 78,
    bookings: 214, leads: 18, booked: 9000,
    completed: 168, covers: 412, loss: 21,
    revenue: 7200, unmatched: 1900, exactCoverage: 61,
  },
  puttery: {
    label: "Puttery NYC model",
    spend: 850, clicks: 1224, sourceCoverage: 88,
    bookings: 82, leads: 3, booked: 3200,
    completed: 68, covers: 164, loss: 7,
    revenue: 2600, unmatched: 620, exactCoverage: 72,
  },
  highline: {
    label: "High Line Comedy Club model",
    spend: 700, clicks: 1086, sourceCoverage: 74,
    bookings: 61, leads: 4, booked: 2600,
    completed: 49, covers: 118, loss: 8,
    revenue: 2100, unmatched: 510, exactCoverage: 64,
  },
  rorys: {
    label: "Rory’s Rooftop model",
    spend: 520, clicks: 842, sourceCoverage: 69,
    bookings: 39, leads: 6, booked: 1800,
    completed: 31, covers: 76, loss: 4,
    revenue: 1320, unmatched: 480, exactCoverage: 49,
  },
  "easy-tiger": {
    label: "Easy Tiger model",
    spend: 430, clicks: 690, sourceCoverage: 71,
    bookings: 32, leads: 5, booked: 1400,
    completed: 25, covers: 54, loss: 2,
    revenue: 1180, unmatched: 290, exactCoverage: 58,
  },
  unknown: {
    label: "Unresolved venue",
    spend: 0, clicks: 0, sourceCoverage: 0,
    bookings: 0, leads: 0, booked: 0,
    completed: 0, covers: 0, loss: 0,
    revenue: 0, unmatched: 0, exactCoverage: 0,
  },
};

const VENUE_ORDER = ["portfolio", "puttery", "highline", "rorys", "easy-tiger", "unknown"];
const TIERS = ["all", "exact", "source", "unmatched"];

const TICKETS = [
  {
    id: "DEMO-0257", venues: ["portfolio", "puttery"], match: "Exact", cls: "exact",
    glyph: "✓", confidence: 96,
    cells: [
      ["Marketing touch", "Mini golf intent", "Google Ads · Search · $189.60 modeled spend", "touch_demo_0257"],
      ["Booking / inquiry", "Tock reservation", "4 guests · $240 booked value", "tock_demo_7TQ8K2"],
      ["Visit / event", "Completed visit", "4 covers · attended", "service_demo_0529"],
      ["Realized revenue", "$307.20 collected", "Toast check · net, tip excluded", "toast_demo_CHK257"],
    ],
  },
  {
    id: "DEMO-0258", venues: ["portfolio", "rorys"], match: "Source", cls: "source",
    glyph: "~", confidence: 63,
    cells: [
      ["Marketing touch", "Rooftop weekend", "Meta · paid social · $142.40 modeled spend", "touch_demo_0258"],
      ["Booking / inquiry", "Resy reservation", "2 guests · no campaign token proven", "resy_demo_9KJ3L1"],
      ["Visit / event", "Completed visit", "2 covers · platform source only", "service_demo_0531"],
      ["Realized revenue", "$152.10 collected", "Toast check · aggregate source lane", "toast_demo_CHK258"],
    ],
  },
  {
    id: "DEMO-0259", venues: ["portfolio", "highline"], match: "Unmatched", cls: "unmatched",
    glyph: "✕", confidence: 28,
    cells: [
      ["Marketing touch", "Comedy night search", "Google Ads · Search · $118.00 modeled spend", "touch_demo_0259"],
      ["Booking / inquiry", "Eventbrite order", "3 tickets · $180 ticket gross", "eventbrite_demo_54281"],
      ["Visit / event", "Attendee check-in", "3 scanned · refund state checked", "attendee_demo_831"],
      ["Realized revenue", "$0 exact POS link", "Toast check not linked to ticket order", "recon_demo_open_12"],
    ],
  },
  {
    id: "DEMO-0260", venues: ["portfolio", "easy-tiger"], match: "Source", cls: "source",
    glyph: "~", confidence: 57,
    cells: [
      ["Marketing touch", "Late-night social", "Meta · paid social · $91.20 modeled spend", "touch_demo_0260"],
      ["Booking / inquiry", "Resy reservation", "4 guests · source category retained", "resy_demo_B2K9PL"],
      ["Visit / event", "Completed visit", "4 covers · status complete", "service_demo_0601"],
      ["Realized revenue", "$286.40 collected", "Toast check · source-level match", "toast_demo_CHK260"],
    ],
  },
];

const BLOCKED_TICKET = {
  id: "BLOCKED", match: "Blocked", cls: "unmatched", glyph: "✕", confidence: 0,
  cells: [
    ["Venue identity", "Fifth concept not named", "The recovered proposal says “lounge,” but the exact brand is not in the source.", "venue_key_pending"],
    ["Booking system", "Not mapped", "Tock, Resy, Eventbrite, or another platform must be confirmed.", "source_account_pending"],
    ["POS / event", "Not mapped", "No Toast restaurant GUID or Tripleseat location ID supplied.", "merchant_location_pending"],
    ["Required recovery", "Name + IDs + owner", "Do not include this concept in portfolio totals until the crosswalk is complete.", "gate_01_open"],
  ],
};

/* ── formatting ─────────────────────────────────────────────────────────── */
const money = (v) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
const num = (v) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(v);
const pct = (v, d = 1) => `${v.toFixed(d)}%`;
const whole = (v) => `${Math.round(v)}%`;
const safeDiv = (a, b) => (b > 0 ? a / b : 0);

/* ── derivation: the single place any dependent number is produced ──────── */
function derive(key, periodDays) {
  const base = VENUES[key];
  const factor = periodDays === 7 ? 0.24 : 1;
  const s = (v) => Math.round(v * factor);

  const spend = s(base.spend);
  const clicks = s(base.clicks);
  const bookings = s(base.bookings);
  const completed = s(base.completed);
  const revenue = s(base.revenue);
  const unmatched = s(base.unmatched);

  const matched = Math.max(revenue - unmatched, 0);
  const exactValue = Math.round(revenue * (base.exactCoverage / 100));
  const sourceValue = Math.max(matched - exactValue, 0);

  return {
    key,
    label: base.label,
    spend,
    clicks,
    sourceCoverage: base.sourceCoverage,
    bookings,
    leads: s(base.leads),
    booked: s(base.booked),
    completed,
    covers: s(base.covers),
    loss: s(base.loss),
    revenue,
    unmatched,
    matched,
    exactCoverage: base.exactCoverage,
    exactValue,
    sourceValue,
    /* every rate is computed, never stored */
    roas: safeDiv(matched, spend),
    bookingRate: safeDiv(bookings, clicks) * 100,
    showRate: safeDiv(completed, bookings) * 100,
    captureRate: safeDiv(matched, revenue) * 100,
    notBooked: Math.max(clicks - bookings, 0),
    notShown: Math.max(bookings - completed, 0),
    isEmpty: base.revenue === 0,
  };
}

/* ── dom handles ────────────────────────────────────────────────────────── */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const el = {
  context: $("#board-context"),
  tabs: $$(".vtab"),
  period: $("#period-select"),
  tier: $("#tier-select"),
  themeBtn: $("#theme-toggle"),
  themeLabel: $("#theme-label"),
  reset: $("#reset-view"),
  hero: $("#hero-coverage"),
  heroNote: $("#hero-coverage-note"),
  meter: $("#coverage-meter"),
  meterDesc: $("#meter-desc"),
  meterAxisEnd: $("#meter-axis-end"),
  legend: $("#coverage-legend"),
  coverBody: $("#cover-table-body"),
  passBody: $("#pass-table-body"),
  reconBooked: $("#recon-booked"),
  reconBookedBar: $("#recon-booked-bar"),
  reconCollected: $("#recon-collected"),
  reconCollectedBar: $("#recon-collected-bar"),
  segMatched: $("#recon-seg-matched"),
  segUnmatched: $("#recon-seg-unmatched"),
  reconMatched: $("#recon-matched"),
  reconUnmatched: $("#recon-unmatched"),
  reconTotal: $("#recon-total"),
  reconAxisMid: $("#recon-axis-mid"),
  reconAxisEnd: $("#recon-axis-end"),
  ticketList: $("#ticket-list"),
  ticketCount: $("#ticket-count"),
  ribbons: $$(".ribbon"),
  method: $(".method"),
};

const segs = {
  exact: $('[data-seg="exact"]', el.meter),
  source: $('[data-seg="source"]', el.meter),
  unmatched: $('[data-seg="unmatched"]', el.meter),
};

const figureNodes = new Map(
  $$("[data-figure]").map((node) => [node.dataset.figure, node])
);
const rateNodes = $$("[data-rate]").sort((a, b) => a.dataset.rate - b.dataset.rate);
const leakNodes = $$("[data-leak]").sort((a, b) => a.dataset.leak - b.dataset.leak);
const legendNodes = {
  exact: $('[data-legend="exact"]', el.legend),
  source: $('[data-legend="source"]', el.legend),
  unmatched: $('[data-legend="unmatched"]', el.legend),
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let state = { venue: "portfolio", period: 30, tier: "all" };
let shown = null; /* the model currently painted, so counting starts from it */

/* ── ribbon geometry: vertical thickness carries the pass-through rate ───── */
/* preserveAspectRatio="none" means horizontal stretch is cosmetic while the
   vertical proportion - the actual encoding - stays exact. The 3-unit floor
   keeps a very low rate visible; the exact value is always direct-labelled
   and in the table view, so the floor never stands in for the number.       */
function ribbonPath(rate) {
  const H = 100, W = 60;
  const h = Math.max((rate / 100) * H, 3);
  const t = (H - h) / 2;
  const b = (H + h) / 2;
  const c = W * 0.5;
  return `M0,0 C${c},0 ${c},${t} ${W},${t} L${W},${b} C${c},${b} ${c},${H} 0,${H} Z`;
}

/* the svg is built once; frames only rewrite the path's d attribute */
const ribbonPaths = el.ribbons.map((node) => {
  const host = $(".ribbon-viz", node);
  if (!host) return null;
  host.innerHTML =
    '<svg viewBox="0 0 60 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">' +
    '<path fill="var(--d-mid)"/></svg>';
  return $("path", host);
});

/* ── tooltip layer: one element, delegated listeners, bound once ─────────── */
const tip = document.createElement("div");
tip.className = "tip";
tip.setAttribute("role", "tooltip");
tip.hidden = true;
document.body.appendChild(tip);

function showTip(target) {
  const text = target.dataset.tip;
  if (!text) return;
  tip.textContent = text;
  tip.hidden = false;
  const r = target.getBoundingClientRect();
  const t = tip.getBoundingClientRect();
  const left = Math.max(8, Math.min(r.left + r.width / 2 - t.width / 2, window.innerWidth - t.width - 8));
  let top = r.top - t.height - 10;
  if (top < 8) top = r.bottom + 10;
  tip.style.left = `${left + window.scrollX}px`;
  tip.style.top = `${top + window.scrollY}px`;
}
const hideTip = () => { tip.hidden = true; };

document.addEventListener("pointerover", (e) => {
  const t = e.target.closest?.("[data-tip]");
  if (t) showTip(t); else hideTip();
});
document.addEventListener("focusin", (e) => {
  const t = e.target.closest?.("[data-tip]");
  if (t) showTip(t); else hideTip();
});
document.addEventListener("focusout", hideTip);
window.addEventListener("scroll", hideTip, { passive: true });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") hideTip(); });

/* ── painting values (safe to call every frame: text and widths only) ────── */
function setSeg(node, value, total, label) {
  const share = safeDiv(value, total) * 100;
  node.style.width = `${share}%`;
  const on = value > 0.5;
  node.hidden = !on;
  node.tabIndex = on ? 0 : -1;
  node.dataset.tip = `${label}: ${money(value)} · ${pct(share)} of collected`;
  return on;
}

/* the rounded data-end belongs on the last segment that is actually drawn */
function markEnd(nodes) {
  nodes.forEach((n) => (n.style.borderRadius = "0"));
  const visible = nodes.filter((n) => !n.hidden);
  if (visible.length) visible[visible.length - 1].style.borderRadius = "0 4px 4px 0";
}

function paintValues(m) {
  const periodLabel = state.period === 7 ? "7-day" : "30-day";

  el.context.textContent = m.isEmpty
    ? "Source mapping blocked · the fifth concept cannot enter portfolio totals yet."
    : `${m.label} · ${periodLabel} illustrative view · not live performance.`;

  /* hero + coverage meter */
  el.hero.textContent = m.isEmpty ? "—" : whole(m.exactCoverage);
  el.heroNote.textContent = m.isEmpty
    ? "No source access, so no coverage can be claimed."
    : `of ${money(m.revenue)} collected carries a platform token or ID`;

  setSeg(segs.exact, m.exactValue, m.revenue, "Exact match");
  setSeg(segs.source, m.sourceValue, m.revenue, "Platform source");
  setSeg(segs.unmatched, m.unmatched, m.revenue, "Unmatched");
  markEnd([segs.exact, segs.source, segs.unmatched]);

  el.meterAxisEnd.textContent = money(m.revenue);
  el.meterDesc.textContent = m.isEmpty
    ? "No collected revenue to split — source mapping is blocked."
    : `Of ${money(m.revenue)} collected: ${money(m.exactValue)} exact match, ` +
      `${money(m.sourceValue)} platform source, ${money(m.unmatched)} unmatched.`;

  legendNodes.exact.textContent = money(m.exactValue);
  legendNodes.source.textContent = money(m.sourceValue);
  legendNodes.unmatched.textContent = money(m.unmatched);

  /* stage figures */
  const fig = {
    clicks: num(m.clicks),
    spend: money(m.spend),
    sourceCoverage: whole(m.sourceCoverage),
    bookings: num(m.bookings),
    leads: num(m.leads),
    booked: money(m.booked),
    completed: num(m.completed),
    covers: num(m.covers),
    loss: num(m.loss),
    revenue: money(m.revenue),
    matched: money(m.matched),
    roas: m.spend > 0 ? `${m.roas.toFixed(1)}×` : "Pending",
  };
  for (const [k, v] of Object.entries(fig)) {
    const node = figureNodes.get(k);
    if (node) node.textContent = v;
  }

  /* ribbons */
  const rates = [m.bookingRate, m.showRate, m.captureRate];
  ribbonPaths.forEach((p, i) => p && p.setAttribute("d", ribbonPath(rates[i])));

  const leaks = [
    `${num(m.notBooked)} tagged visits did not book`,
    `${num(m.notShown)} no-show or refunded`,
    `${money(m.unmatched)} collected without a trail`,
  ];
  rates.forEach((r, i) => {
    if (rateNodes[i]) rateNodes[i].textContent = m.isEmpty ? "—" : pct(r);
    if (leakNodes[i]) leakNodes[i].textContent = m.isEmpty ? "Pending source mapping" : leaks[i];
  });

  /* reconciliation: two bars, one dollar axis scaled to the larger */
  const axisMax = Math.max(m.booked, m.revenue, 1);
  el.reconBookedBar.style.width = `${safeDiv(m.booked, axisMax) * 100}%`;
  el.reconBookedBar.dataset.tip = `Booked value: ${money(m.booked)} — a commitment, not cash collected`;
  el.reconBookedBar.tabIndex = m.booked > 0 ? 0 : -1;
  el.reconCollectedBar.style.width = `${safeDiv(m.revenue, axisMax) * 100}%`;
  setSeg(el.segMatched, m.matched, m.revenue, "Matched collected");
  setSeg(el.segUnmatched, m.unmatched, m.revenue, "Unmatched collected");
  markEnd([el.segMatched, el.segUnmatched]);

  el.reconBooked.textContent = money(m.booked);
  el.reconCollected.textContent = money(m.revenue);
  el.reconMatched.textContent = money(m.matched);
  el.reconUnmatched.textContent = money(m.unmatched);
  el.reconTotal.textContent = money(m.revenue);
  el.reconAxisMid.textContent = money(Math.round(axisMax / 2));
  el.reconAxisEnd.textContent = money(axisMax);
}

/* ── table twins (discrete state only, not per frame) ───────────────────── */
function paintTables(m) {
  el.coverBody.innerHTML = [
    ["Exact match", m.exactValue, "Platform token or ID present on the record"],
    ["Platform source", m.sourceValue, "Platform-reported source at aggregate grain"],
    ["Unmatched", m.unmatched, "No trail — investigation queue, not attributed"],
  ]
    .map(
      ([name, value, method]) =>
        `<tr><th scope="row">${name}</th><td>${money(value)}</td>` +
        `<td>${pct(safeDiv(value, m.revenue) * 100)}</td><td>${method}</td></tr>`
    )
    .join("");

  el.passBody.innerHTML = [
    ["1 · Marketing touch", num(m.clicks), "tagged visits", m.isEmpty ? "—" : pct(m.bookingRate), "bookings ÷ tagged visits"],
    ["2 · Booking or inquiry", num(m.bookings), "bookings", m.isEmpty ? "—" : pct(m.showRate), "completed ÷ bookings"],
    ["3 · Visit or event", num(m.completed), "completed visits", m.isEmpty ? "—" : pct(m.captureRate), "$ matched ÷ $ collected"],
    ["4 · Realized revenue", money(m.revenue), "Toast net sales", "—", "terminal stage"],
  ]
    .map(
      ([stage, headline, unit, rate, basis]) =>
        `<tr><th scope="row">${stage}</th><td>${headline}</td><td>${unit}</td><td>${rate}</td><td>${basis}</td></tr>`
    )
    .join("");
}

/* ── counting animation: interpolate the model so nothing desyncs ────────── */
const NUMERIC = [
  "spend", "clicks", "bookings", "leads", "booked", "completed", "covers",
  "loss", "revenue", "unmatched", "matched", "exactValue", "sourceValue",
  "roas", "bookingRate", "showRate", "captureRate", "notBooked", "notShown",
  "sourceCoverage", "exactCoverage",
];

let frame = 0;

function paintAnimated(next) {
  cancelAnimationFrame(frame);
  paintTables(next);

  if (reduceMotion.matches || !shown) {
    shown = next;
    paintValues(next);
    return;
  }

  const from = shown;
  const start = performance.now();
  const DUR = 440;
  const ease = (t) => 1 - Math.pow(1 - t, 3);

  const step = (now) => {
    const t = Math.min((now - start) / DUR, 1);
    const k = ease(t);
    const mid = { ...next };
    for (const key of NUMERIC) {
      const a = from[key] ?? 0;
      const b = next[key] ?? 0;
      mid[key] = a + (b - a) * k;
    }
    paintValues(mid);
    if (t < 1) frame = requestAnimationFrame(step);
    else { shown = next; paintValues(next); }
  };
  frame = requestAnimationFrame(step);
}

/* ── tickets (rebuilt only on venue / tier change) ──────────────────────── */
const COPY_ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="9" y="9" width="11" height="11" rx="1.5"/>' +
  '<path d="M15 5.5A1.5 1.5 0 0 0 13.5 4H5.5A1.5 1.5 0 0 0 4 5.5v8A1.5 1.5 0 0 0 5.5 15"/></svg>';

function ticketMarkup(t) {
  const cells = t.cells
    .map(
      ([label, head, meta, id]) => `
      <div class="tcell">
        <span class="tcell-label">${label}</span>
        <strong>${head}</strong>
        <small>${meta}</small>
        <button class="ticket-id" type="button" data-copy="${id}" data-tip="Copy ${id} to the clipboard">
          ${COPY_ICON}<span>${id}</span>
        </button>
      </div>`
    )
    .join("");

  return `
    <article class="ticket" aria-label="${t.match} modeled evidence ticket ${t.id}">
      <div class="ticket-stub"><span>${t.id}</span></div>
      ${cells}
      <div class="tmatch">
        <span class="stamp stamp--${t.cls}"><i aria-hidden="true">${t.glyph}</i>${t.match}</span>
        <small>${t.confidence}% confidence</small>
        <span class="conf" role="img" aria-label="${t.confidence} percent match confidence">
          <i style="width:${t.confidence}%"></i>
        </span>
      </div>
    </article>`;
}

function renderTickets() {
  const rows =
    state.venue === "unknown" ? [BLOCKED_TICKET] : TICKETS.filter((t) => t.venues.includes(state.venue));
  const filtered = state.tier === "all" ? rows : rows.filter((t) => t.cls === state.tier);

  el.ticketList.innerHTML = filtered.length
    ? filtered.map(ticketMarkup).join("")
    : `<p class="tickets-empty">No ${state.tier} evidence records in this model. Switch the evidence tier to see the rest.</p>`;

  const total = rows.length;
  el.ticketCount.textContent =
    state.tier === "all"
      ? `${total} illustrative record${total === 1 ? "" : "s"} — match methods stay separate, never blended.`
      : `${filtered.length} of ${total} record${total === 1 ? "" : "s"} at the ${state.tier} tier.`;
}

/* clipboard: delegated, so re-rendered tickets never need re-binding */
async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the textarea path */
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.cssText = "position:fixed;left:-9999px;top:0";
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try { ok = document.execCommand("copy"); } catch { ok = false; }
  ta.remove();
  return ok;
}

el.ticketList.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-copy]");
  if (!btn) return;
  const ok = await copyText(btn.dataset.copy);
  btn.classList.toggle("is-copied", ok);
  setTimeout(() => btn.classList.remove("is-copied"), 1100);
});

/* ── state, url and tabs ────────────────────────────────────────────────── */
function render() {
  paintAnimated(derive(state.venue, state.period));
}

function writeHash(replace = false) {
  const p = new URLSearchParams();
  if (state.venue !== "portfolio") p.set("venue", state.venue);
  if (state.period !== 30) p.set("period", String(state.period));
  if (state.tier !== "all") p.set("tier", state.tier);
  const url = location.pathname + location.search + (p.toString() ? `#${p}` : "");
  try {
    if (replace) history.replaceState(null, "", url);
    else history.pushState(null, "", url);
  } catch {
    /* file:// and sandboxed contexts reject history writes - state still works */
  }
}

function readHash() {
  const p = new URLSearchParams(location.hash.slice(1));
  const venue = p.get("venue");
  const period = Number(p.get("period"));
  const tier = p.get("tier");
  if (venue && VENUES[venue]) state.venue = venue;
  if (period === 7 || period === 30) state.period = period;
  if (TIERS.includes(tier)) state.tier = tier;
  el.period.value = String(state.period);
  el.tier.value = state.tier;
  syncTabs();
}

function syncTabs() {
  el.tabs.forEach((tab) => {
    const on = tab.dataset.venue === state.venue;
    tab.classList.toggle("is-active", on);
    tab.setAttribute("aria-selected", String(on));
    tab.tabIndex = on ? 0 : -1;
  });
}

function selectVenue(venue, { focus = false, push = true } = {}) {
  if (!VENUES[venue] || venue === state.venue) {
    if (focus) el.tabs.find((t) => t.dataset.venue === venue)?.focus();
    return;
  }
  state.venue = venue;
  syncTabs();
  if (focus) el.tabs.find((t) => t.dataset.venue === venue)?.focus();
  if (push) writeHash();
  render();
  renderTickets();
}

el.tabs.forEach((tab, i) => {
  tab.addEventListener("click", () => selectVenue(tab.dataset.venue));
  tab.addEventListener("keydown", (e) => {
    const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    let n = i;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") n = (i + 1) % el.tabs.length;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = (i - 1 + el.tabs.length) % el.tabs.length;
    if (e.key === "Home") n = 0;
    if (e.key === "End") n = el.tabs.length - 1;
    selectVenue(el.tabs[n].dataset.venue, { focus: true });
  });
});

el.period.addEventListener("change", () => {
  state.period = Number(el.period.value);
  writeHash();
  render();
});

el.tier.addEventListener("change", () => {
  state.tier = el.tier.value;
  writeHash();
  renderTickets();
});

el.reset.addEventListener("click", () => {
  state = { venue: "portfolio", period: 30, tier: "all" };
  el.period.value = "30";
  el.tier.value = "all";
  syncTabs();
  writeHash();
  render();
  renderTickets();
  el.tabs[0].focus();
});

window.addEventListener("hashchange", () => {
  readHash();
  render();
  renderTickets();
});

/* ── theme ──────────────────────────────────────────────────────────────── */
function currentTheme() {
  return (
    document.documentElement.dataset.theme ||
    (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark")
  );
}
function syncThemeBtn() {
  const dark = currentTheme() === "dark";
  el.themeLabel.textContent = dark ? "Daylight" : "Midnight";
  el.themeBtn.setAttribute("aria-pressed", String(!dark));
  el.themeBtn.setAttribute("aria-label", dark ? "Switch to the daylight theme" : "Switch to the midnight theme");
}
el.themeBtn.addEventListener("click", () => {
  const next = currentTheme() === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem("nyc-attr-theme", next); } catch {}
  syncThemeBtn();
});

/* ── table view toggles ─────────────────────────────────────────────────── */
$$("[data-table-toggle]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = document.getElementById(btn.dataset.tableToggle);
    const open = target.hidden;
    target.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
    btn.textContent = open ? "Hide table" : "Table view";
  });
});

/* ── keyboard shortcuts ─────────────────────────────────────────────────── */
document.addEventListener("keydown", (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const tag = document.activeElement?.tagName;
  if (tag === "SELECT" || tag === "INPUT" || tag === "TEXTAREA") return;
  if (/^[1-6]$/.test(e.key)) {
    e.preventDefault();
    selectVenue(VENUE_ORDER[Number(e.key) - 1], { focus: true });
  } else if (e.key.toLowerCase() === "t") {
    el.themeBtn.click();
  }
});

/* ── print: reveal the collapsed methodology, then restore it ───────────── */
let methodWasOpen = false;
window.addEventListener("beforeprint", () => {
  methodWasOpen = el.method.open;
  el.method.open = true;
  $$(".reveal").forEach((n) => n.classList.add("is-visible"));
});
window.addEventListener("afterprint", () => {
  el.method.open = methodWasOpen;
});

/* ── scroll reveal ──────────────────────────────────────────────────────── */
/* Reveals are decoration on secondary blocks only - the two data cards above
   are never animated. A generous rootMargin pre-reveals anything within a
   viewport of the fold, and the timeout is a hard safety net: content must
   never stay stuck at opacity 0 because an observer did not fire (headless
   capture, print-to-PDF, restored scroll position, or a fast flick). */
const revealAll = () => $$(".reveal").forEach((n) => n.classList.add("is-visible"));

if ("IntersectionObserver" in window && !reduceMotion.matches) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        entry.target.style.transitionDelay = `${Math.min(i * 60, 180)}ms`;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px 100% 0px", threshold: 0.01 }
  );
  $$(".reveal").forEach((n) => io.observe(n));
  setTimeout(revealAll, 1600);
} else {
  revealAll();
}

/* ── boot ───────────────────────────────────────────────────────────────── */
readHash();
writeHash(true);
syncThemeBtn();
shown = derive(state.venue, state.period);
paintValues(shown);
paintTables(shown);
renderTickets();
