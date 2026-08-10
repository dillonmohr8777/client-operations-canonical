from __future__ import annotations

import base64
import io
import json
from pathlib import Path

from PIL import Image

from build_align_top30_pdf import ROOT, ascii_text, extract_align_logo, load_data


OUTPUT = Path("/workspace/align-top30-living-shortlist.html")
STANDALONE = ROOT / "output" / "html" / "Align_HCM_Top30_Story_Shortlist_Living.html"
LOGO_DIR = ROOT / "tmp" / "pdfs" / "logo-artifact-production" / "extracted" / "tmp" / "pdfs" / "client-logos"


def slug(value: str) -> str:
    return "".join(ch if ch.isalnum() else "-" for ch in value.lower()).strip("-")


def compact_image_uri(path: Path, max_size=(260, 96), quality=82) -> str:
    image = Image.open(path).convert("RGBA")
    image.thumbnail(max_size, Image.Resampling.LANCZOS)
    out = io.BytesIO()
    try:
        image.save(out, "WEBP", quality=quality, method=6)
        mime = "image/webp"
    except Exception:
        image.save(out, "PNG", optimize=True)
        mime = "image/png"
    encoded = base64.b64encode(out.getvalue()).decode("ascii")
    return f"data:{mime};base64,{encoded}"


def json_ready(value):
    if value is None or isinstance(value, (str, int, float, bool)):
        return value
    return ascii_text(value)


def build_payload():
    stories, totals, references, gaps, methods = load_data()
    payload_stories = []
    for story in stories:
        item = {key: json_ready(value) for key, value in story.items()}
        logo_path = LOGO_DIR / f"{slug(str(story['Website']))}.png"
        if not logo_path.exists():
            raise FileNotFoundError(f"Missing logo for {story['Client']}: {logo_path}")
        item["logo"] = compact_image_uri(logo_path)
        payload_stories.append(item)
    return {
        "stories": payload_stories,
        "totals": totals,
        "references": [{key: json_ready(value) for key, value in row.items()} for row in references],
        "gaps": [
            {
                "title": section["title"],
                "headers": section["headers"],
                "rows": [[json_ready(value) for value in row] for row in section["rows"]],
            }
            for section in gaps
        ],
        "methods": methods,
    }


FRAGMENT = r'''<div id="align-top30-living" class="align-living">
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Syne:wght@500&display=swap');

#align-top30-living {
  --align-navy: color-mix(in srgb, var(--background) 12%, #0A1628 88%);
  --align-orange: color-mix(in srgb, var(--viz-series-1) 22%, #F05A28 78%);
  --align-orange-bright: color-mix(in srgb, var(--viz-series-2) 18%, #FF6B2B 82%);
  --align-rust: color-mix(in srgb, var(--destructive) 24%, #AD3D1B 76%);
  --align-teal: color-mix(in srgb, var(--viz-series-3) 24%, #136E61 76%);
  --align-paper: color-mix(in srgb, var(--card) 95%, #FCFAF7 5%);
  color: var(--foreground);
  font-family: Inter, system-ui, sans-serif;
  isolation: isolate;
  max-width: 100%;
  position: relative;
}

#align-top30-living * { box-sizing: border-box; }
#align-top30-living h2,
#align-top30-living h3 { font-family: Syne, Inter, system-ui, sans-serif; font-weight: 500; }

#align-top30-living .living-hero {
  background:
    radial-gradient(circle at 82% 10%, color-mix(in srgb, var(--align-orange) 26%, transparent), transparent 36%),
    radial-gradient(circle at 12% 94%, color-mix(in srgb, var(--align-teal) 20%, transparent), transparent 34%),
    linear-gradient(135deg, var(--align-navy), color-mix(in srgb, var(--align-navy) 80%, var(--align-rust)));
  color: var(--primary-foreground);
  min-height: 270px;
  overflow: hidden;
  padding: clamp(24px, 5vw, 58px);
  position: relative;
}

#align-top30-living .living-hero::before,
#align-top30-living .living-hero::after {
  border: 1px solid color-mix(in srgb, var(--primary-foreground) 16%, transparent);
  border-radius: 999px;
  content: "";
  pointer-events: none;
  position: absolute;
}

#align-top30-living .living-hero::before { height: 250px; right: -90px; top: -85px; width: 250px; }
#align-top30-living .living-hero::after { bottom: -145px; height: 310px; left: 18%; width: 310px; }

#align-top30-living .hero-grid {
  align-items: end;
  display: grid;
  gap: 28px;
  grid-template-columns: minmax(0, 1fr) minmax(170px, 270px);
  position: relative;
  z-index: 1;
}

#align-top30-living .eyebrow { color: color-mix(in srgb, var(--primary-foreground) 72%, transparent); letter-spacing: .12em; text-transform: uppercase; }
#align-top30-living .hero-title { color: var(--primary-foreground); margin: 10px 0; max-width: 720px; }
#align-top30-living .hero-subtitle { color: color-mix(in srgb, var(--primary-foreground) 78%, transparent); margin: 0; max-width: 720px; }
#align-top30-living .align-mark { filter: drop-shadow(0 18px 40px color-mix(in srgb, var(--align-orange) 25%, transparent)); justify-self: end; max-height: 112px; max-width: 100%; object-fit: contain; }

#align-top30-living .signal-line {
  background: linear-gradient(90deg, var(--align-orange), var(--align-orange-bright), transparent);
  height: 4px;
  margin-top: 24px;
  overflow: hidden;
  position: relative;
  width: min(340px, 70%);
}

#align-top30-living .signal-line::after {
  background: color-mix(in srgb, var(--primary-foreground) 74%, transparent);
  content: "";
  inset: 0 auto 0 -38%;
  position: absolute;
  width: 34%;
  animation: align-scan 3.8s ease-in-out infinite;
}

#align-top30-living .logo-river {
  background: color-mix(in srgb, var(--align-navy) 88%, transparent);
  color: var(--primary-foreground);
  overflow: hidden;
  padding: 12px 0;
}

#align-top30-living .logo-river-track { align-items: center; display: flex; gap: 10px; width: max-content; animation: align-river 48s linear infinite; }
#align-top30-living .logo-river:hover .logo-river-track { animation-play-state: paused; }
#align-top30-living .river-logo { align-items: center; background: color-mix(in srgb, var(--card) 92%, transparent); display: flex; height: 48px; justify-content: center; padding: 7px 12px; width: 126px; }
#align-top30-living .river-logo img { height: 100%; max-width: 100%; object-fit: contain; }

#align-top30-living .living-shell { padding: clamp(20px, 4vw, 42px) 0; }
#align-top30-living .metric-grid { margin-bottom: 24px; }
#align-top30-living .viz-stat { min-width: 0; }
#align-top30-living .viz-stat-value { color: var(--foreground); }
#align-top30-living .living-tabs { margin: 6px 0 24px; }
#align-top30-living .living-tabs .btn[aria-pressed="true"] { background: linear-gradient(135deg, var(--align-orange), var(--align-orange-bright)); color: var(--primary-foreground); }

#align-top30-living .section-panel[hidden] { display: none; }
#align-top30-living .section-heading { align-items: end; display: flex; gap: 14px; justify-content: space-between; margin-bottom: 18px; }
#align-top30-living .section-heading h2 { margin: 0; }
#align-top30-living .section-kicker { color: var(--muted-foreground); margin: 0; }

#align-top30-living .overview-layout { display: grid; gap: 26px; grid-template-columns: minmax(0, .88fr) minmax(0, 1.12fr); }
#align-top30-living .story-grid { display: grid; gap: 10px; grid-template-columns: repeat(3, minmax(0, 1fr)); }
#align-top30-living .story-tile { align-items: center; display: grid; gap: 9px; grid-template-columns: auto 54px minmax(0, 1fr); min-height: 76px; text-align: left; }
#align-top30-living .story-tile .rank { color: var(--muted-foreground); font-variant-numeric: tabular-nums; }
#align-top30-living .story-tile .logo-box { align-items: center; background: var(--align-paper); display: flex; height: 44px; justify-content: center; padding: 5px; }
#align-top30-living .story-tile img { height: 100%; max-width: 100%; object-fit: contain; }
#align-top30-living .tile-copy { min-width: 0; }
#align-top30-living .tile-name { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#align-top30-living .tile-meta { color: var(--muted-foreground); display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#align-top30-living .story-tile[data-ready="true"] { background: color-mix(in srgb, var(--align-teal) 13%, transparent); }

#align-top30-living .selected-story { min-width: 0; position: sticky; top: 12px; }
#align-top30-living .selected-top { align-items: center; display: grid; gap: 16px; grid-template-columns: 112px minmax(0, 1fr) auto; }
#align-top30-living .selected-logo { align-items: center; background: var(--align-paper); display: flex; height: 74px; justify-content: center; padding: 9px; }
#align-top30-living .selected-logo img { height: 100%; max-width: 100%; object-fit: contain; }
#align-top30-living .selected-client h3 { margin: 0 0 4px; }
#align-top30-living .selected-client p { color: var(--muted-foreground); margin: 0; }
#align-top30-living .selected-value { color: var(--foreground); font-variant-numeric: tabular-nums; text-align: right; }
#align-top30-living .selected-value span { color: var(--muted-foreground); display: block; }
#align-top30-living .story-meta { display: grid; gap: 14px; grid-template-columns: repeat(3, minmax(0, 1fr)); margin-top: 20px; }
#align-top30-living .story-meta dt { color: var(--muted-foreground); }
#align-top30-living .story-meta dd { margin: 4px 0 0; }
#align-top30-living .readiness { display: grid; gap: 12px; grid-template-columns: repeat(3, minmax(0, 1fr)); margin-top: 18px; }
#align-top30-living .readiness-item { background: color-mix(in srgb, var(--muted) 42%, transparent); padding: 12px; }
#align-top30-living .readiness-item strong { display: block; margin-top: 4px; }
#align-top30-living .value-stage { margin-top: 28px; }
#align-top30-living .value-row { align-items: center; display: grid; gap: 10px; grid-template-columns: minmax(110px, 1fr) minmax(140px, 2.2fr) auto; margin: 10px 0; }
#align-top30-living .value-track { background: color-mix(in srgb, var(--muted) 48%, transparent); height: 10px; overflow: hidden; }
#align-top30-living .value-bar { background: linear-gradient(90deg, var(--align-orange), var(--align-orange-bright)); height: 100%; transform-origin: left; transition: width .55s ease; width: 0; }
#align-top30-living .value-number { font-variant-numeric: tabular-nums; text-align: right; }

#align-top30-living .reference-table td:nth-child(7),
#align-top30-living .reference-table th:nth-child(7) { text-align: right; }
#align-top30-living .tier-a { color: var(--align-teal); }
#align-top30-living .tier-b { color: var(--align-rust); }

#align-top30-living .gap-toolbar { margin-bottom: 18px; }
#align-top30-living .gap-list { display: grid; gap: 13px; }
#align-top30-living .gap-row { display: grid; gap: 10px; grid-template-columns: minmax(150px, 1fr) minmax(180px, 2.4fr) auto; }
#align-top30-living .gap-label strong { display: block; }
#align-top30-living .gap-label span { color: var(--muted-foreground); }
#align-top30-living .gap-track { align-self: center; background: color-mix(in srgb, var(--muted) 48%, transparent); height: 12px; overflow: hidden; position: relative; }
#align-top30-living .gap-fill { background: linear-gradient(90deg, var(--align-teal), var(--align-orange)); height: 100%; transition: width .5s ease; width: 0; }
#align-top30-living .gap-flag { align-self: center; }

#align-top30-living .method-stack { display: grid; gap: 10px; }
#align-top30-living .method-stack details { border-bottom: 1px solid var(--border); padding: 12px 0; }
#align-top30-living .method-stack summary { cursor: pointer; font-family: Syne, Inter, system-ui, sans-serif; }
#align-top30-living .method-stack p { color: var(--muted-foreground); max-width: 84ch; }

@keyframes align-river { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes align-scan { 0%, 18% { transform: translateX(0); } 72%, 100% { transform: translateX(430%); } }

@media (max-width: 760px) {
  #align-top30-living .hero-grid,
  #align-top30-living .overview-layout { grid-template-columns: 1fr; }
  #align-top30-living .align-mark { justify-self: start; max-width: 210px; }
  #align-top30-living .story-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  #align-top30-living .selected-story { position: static; }
  #align-top30-living .story-meta,
  #align-top30-living .readiness { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  #align-top30-living .gap-row { grid-template-columns: minmax(120px, 1fr) minmax(110px, 1.5fr); }
  #align-top30-living .gap-flag { grid-column: 1 / -1; }
}

@media (max-width: 480px) {
  #align-top30-living .story-grid { grid-template-columns: 1fr; }
  #align-top30-living .selected-top { grid-template-columns: 84px minmax(0, 1fr); }
  #align-top30-living .selected-value { grid-column: 1 / -1; text-align: left; }
  #align-top30-living .story-meta,
  #align-top30-living .readiness { grid-template-columns: 1fr; }
  #align-top30-living .value-row { grid-template-columns: minmax(100px, 1fr) 1fr; }
  #align-top30-living .value-number { grid-column: 1 / -1; text-align: left; }
}

@media (prefers-reduced-motion: reduce) {
  #align-top30-living .logo-river-track,
  #align-top30-living .signal-line::after { animation: none; }
  #align-top30-living .value-bar,
  #align-top30-living .gap-fill { transition: none; }
}
</style>

<section class="living-hero" aria-labelledby="living-title">
  <div class="hero-grid">
    <div>
      <div class="eyebrow text-small">Internal editorial intelligence · 10 Aug 2026</div>
      <h2 id="living-title" class="hero-title">Top 30 Story Shortlist</h2>
      <p class="hero-subtitle">One living view of narrative readiness, reference potential, portfolio value, representation gaps, and the next action behind every story.</p>
      <div class="signal-line" aria-hidden="true"></div>
    </div>
    <img class="align-mark" src="__ALIGN_LOGO__" alt="Align Human Capital Management">
  </div>
</section>

<div class="logo-river" aria-label="Thirty verified client identities">
  <div class="logo-river-track" id="living-logo-river"></div>
</div>

<main class="living-shell">
  <section class="viz-grid metric-grid" id="living-metrics" aria-label="Shortlist summary"></section>

  <nav class="viz-row living-tabs" aria-label="Shortlist sections">
    <button type="button" class="btn" data-section="stories" aria-pressed="true">Stories</button>
    <button type="button" class="btn btn-ghost" data-section="references" aria-pressed="false">References</button>
    <button type="button" class="btn btn-ghost" data-section="gaps" aria-pressed="false">Coverage gaps</button>
    <button type="button" class="btn btn-ghost" data-section="method" aria-pressed="false">Method</button>
  </nav>

  <section class="section-panel" data-panel="stories">
    <div class="section-heading">
      <div><h2>Ranked story portfolio</h2><p class="section-kicker" id="story-count"></p></div>
    </div>
    <div class="viz-controls">
      <label class="form-label">Search<input id="story-search" class="form-control" type="search" placeholder="Client, industry, owner, story type"></label>
      <label class="form-label">Platform<select id="platform-filter" class="form-select"><option value="all">All platforms</option></select></label>
      <label class="form-label">Readiness<select id="readiness-filter" class="form-select"><option value="all">All stories</option><option value="ready">Narrative + Raven</option><option value="work">Needs work</option></select></label>
      <label class="form-label">Sort<select id="story-sort" class="form-select"><option value="rank">Shortlist rank</option><option value="value">True USD</option><option value="year">Most recent</option></select></label>
    </div>
    <div class="overview-layout">
      <div><div class="story-grid" id="story-grid" aria-label="Selectable story clients"></div></div>
      <aside class="card selected-story" id="selected-story" aria-live="polite"></aside>
    </div>
    <div class="value-stage" aria-labelledby="value-stage-title">
      <div class="section-heading"><div><h3 id="value-stage-title">Highest-value stories in view</h3><p class="section-kicker">True USD, filtered with the portfolio above</p></div></div>
      <div id="value-bars"></div>
    </div>
  </section>

  <section class="section-panel" data-panel="references" hidden>
    <div class="section-heading"><div><h2>Reference candidates</h2><p class="section-kicker">Candidates only. Blank status does not indicate public-use clearance.</p></div></div>
    <div class="table-responsive"><table class="table table-sm reference-table"><thead><tr><th>Tier</th><th>Client</th><th>Industry</th><th>Size</th><th>Geo</th><th>Engagements</th><th>True USD</th><th>Latest year</th><th>Status</th></tr></thead><tbody id="reference-body"></tbody></table></div>
  </section>

  <section class="section-panel" data-panel="gaps" hidden>
    <div class="section-heading"><div><h2>Representation coverage</h2><p class="section-kicker">Shortlist presence compared with the full book.</p></div></div>
    <div class="viz-controls gap-toolbar"><label class="form-label">Dimension<select id="gap-select" class="form-select"></select></label></div>
    <div class="gap-list" id="gap-list"></div>
  </section>

  <section class="section-panel" data-panel="method" hidden>
    <div class="section-heading"><div><h2>Method and operating notes</h2><p class="section-kicker">Source, currency correction, selection logic, validation work, and brand provenance.</p></div></div>
    <div class="method-stack" id="method-stack"></div>
  </section>
</main>

<script>
(() => {
  "use strict";
  const root = document.getElementById("align-top30-living");
  if (!root) return;
  const data = __DATA__;
  const state = { selectedRank: 1, stories: data.stories.slice() };
  const money = value => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(value || 0));
  const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

  const metrics = [
    ["True USD", money(data.totals.value), "Restated portfolio value"],
    ["Narratives", data.totals.narratives + "/30", "Ready in source data"],
    ["Raven quotes", data.totals.quotes + "/30", "Public-review signal"],
    ["Industries", String(data.totals.industries), "Representation spread"]
  ];
  root.querySelector("#living-metrics").innerHTML = metrics.map(item => `<div class="card viz-stat"><div class="text-muted">${esc(item[0])}</div><div class="viz-stat-value">${esc(item[1])}</div><div class="text-small text-muted">${esc(item[2])}</div></div>`).join("");

  const doubled = data.stories.concat(data.stories);
  root.querySelector("#living-logo-river").innerHTML = doubled.map(story => `<div class="river-logo" aria-hidden="true"><img src="${story.logo}" alt=""></div>`).join("");

  const platform = root.querySelector("#platform-filter");
  [...new Set(data.stories.map(story => story.Platform))].sort().forEach(value => platform.insertAdjacentHTML("beforeend", `<option value="${esc(value)}">${esc(value)}</option>`));

  function filteredStories() {
    const term = root.querySelector("#story-search").value.trim().toLowerCase();
    const platformValue = platform.value;
    const readiness = root.querySelector("#readiness-filter").value;
    const sort = root.querySelector("#story-sort").value;
    const rows = data.stories.filter(story => {
      const haystack = [story.Client, story.Industry, story["CRM Deal Owner"], story["Story Type"], story.Geo].join(" ").toLowerCase();
      const platformMatch = platformValue === "all" || story.Platform === platformValue;
      const ready = story["Narrative?"] === "Yes" && story["Quote?"] === "Raven";
      const readinessMatch = readiness === "all" || (readiness === "ready" ? ready : !ready);
      return (!term || haystack.includes(term)) && platformMatch && readinessMatch;
    });
    rows.sort((a, b) => sort === "value" ? b["Value (true USD)"] - a["Value (true USD)"] : sort === "year" ? b["Start Yr"] - a["Start Yr"] || a.Rank - b.Rank : a.Rank - b.Rank);
    return rows;
  }

  function renderSelected(story) {
    if (!story) {
      root.querySelector("#selected-story").innerHTML = `<p class="text-muted">No stories match this view.</p>`;
      return;
    }
    state.selectedRank = story.Rank;
    const ready = story["Narrative?"] === "Yes" && story["Quote?"] === "Raven";
    root.querySelector("#selected-story").innerHTML = `
      <div class="selected-top">
        <div class="selected-logo"><img src="${story.logo}" alt="${esc(story.Client)} logo"></div>
        <div class="selected-client"><div class="text-small text-muted">RANK ${String(story.Rank).padStart(2, "0")} · ${esc(story["Story ID"])}</div><h3>${esc(story.Client)}</h3><p>${esc(story.Website || story.Geo)}</p></div>
        <div class="selected-value"><strong>${money(story["Value (true USD)"])}</strong><span class="text-small">True USD</span></div>
      </div>
      <dl class="story-meta">
        <div><dt>Story</dt><dd>${esc(story["Story Type"])} · ${esc(story["Start Yr"])}</dd></div>
        <div><dt>Portfolio</dt><dd>${esc(story.Industry)} · ${esc(story["Size (HC)"])} · ${esc(story.Platform)}</dd></div>
        <div><dt>CRM owner</dt><dd>${esc(story["CRM Deal Owner"] || "Not in CRM")}</dd></div>
        <div><dt>HQ</dt><dd>${esc(story["HQ (CRM)"] || story.Geo)}</dd></div>
        <div><dt>Employees</dt><dd>${story["Employees (CRM)"] ? Number(story["Employees (CRM)"]).toLocaleString("en-US") : "Not recorded"}</dd></div>
        <div><dt>Next move</dt><dd>${esc(story["What it still needs"] || "Validation")}</dd></div>
      </dl>
      <div class="readiness">
        <div class="readiness-item"><span class="text-small text-muted">Narrative</span><strong>${story["Narrative?"] === "Yes" ? "Ready" : "Needed"}</strong></div>
        <div class="readiness-item"><span class="text-small text-muted">Quote</span><strong>${story["Quote?"] === "Raven" ? "Raven" : "Needed"}</strong></div>
        <div class="readiness-item"><span class="text-small text-muted">Reference</span><strong>${esc(story["Reference Status"] || "Pending")}</strong></div>
      </div>
      <div class="viz-row" style="margin-top:16px"><span class="viz-badge">${ready ? "Narrative + quote ready" : "Editorial work open"}</span><span class="text-small text-muted">${esc(story.Geo)} · ${esc(story["Start Yr"])}</span></div>`;
  }

  function renderStories() {
    const rows = filteredStories();
    root.querySelector("#story-count").textContent = `${rows.length} of 30 stories in view`;
    const grid = root.querySelector("#story-grid");
    grid.innerHTML = rows.map(story => {
      const ready = story["Narrative?"] === "Yes" && story["Quote?"] === "Raven";
      return `<button type="button" class="btn viz-tile story-tile${story.Rank === state.selectedRank ? " is-selected" : ""}" data-rank="${story.Rank}" data-ready="${ready}" aria-pressed="${story.Rank === state.selectedRank}"><span class="rank">${String(story.Rank).padStart(2, "0")}</span><span class="logo-box"><img src="${story.logo}" alt=""></span><span class="tile-copy"><span class="tile-name">${esc(story.Client)}</span><span class="tile-meta text-small">${esc(story.Platform)} · ${money(story["Value (true USD)"])}</span></span></button>`;
    }).join("");
    grid.querySelectorAll("button").forEach(button => button.addEventListener("click", () => {
      state.selectedRank = Number(button.dataset.rank);
      renderStories();
    }));
    const selected = rows.find(story => story.Rank === state.selectedRank) || rows[0];
    if (selected) state.selectedRank = selected.Rank;
    renderSelected(selected);
    renderValueBars(rows);
  }

  function renderValueBars(rows) {
    const top = rows.slice().sort((a, b) => b["Value (true USD)"] - a["Value (true USD)"]).slice(0, 8);
    const max = Math.max(...top.map(story => story["Value (true USD)"]), 1);
    const container = root.querySelector("#value-bars");
    container.innerHTML = top.map(story => `<div class="value-row"><span>${esc(story.Client)}</span><div class="value-track"><div class="value-bar" data-width="${Math.max(2, story["Value (true USD)"] / max * 100).toFixed(2)}"></div></div><span class="value-number">${money(story["Value (true USD)"])}</span></div>`).join("") || `<p class="text-muted">No value bars for this view.</p>`;
    requestAnimationFrame(() => container.querySelectorAll(".value-bar").forEach(bar => { bar.style.width = bar.dataset.width + "%"; }));
  }

  ["story-search", "platform-filter", "readiness-filter", "story-sort"].forEach(id => root.querySelector("#" + id).addEventListener(id === "story-search" ? "input" : "change", renderStories));

  root.querySelector("#reference-body").innerHTML = data.references.map(row => {
    const tier = String(row.Tier || "");
    return `<tr><td class="${tier.startsWith("A") ? "tier-a" : "tier-b"}">${esc(tier)}</td><td>${esc(row.Client)}</td><td>${esc(row.Industry)}</td><td>${esc(row["Size (HC)"])}</td><td>${esc(row.Geo)}</td><td class="text-center">${esc(row.Engagements)}</td><td>${money(row["Value (true USD)"])}</td><td class="text-center">${esc(row["Latest yr"])}</td><td>${esc(row["Reference Status"] || "Pending")}</td></tr>`;
  }).join("");

  const gapSelect = root.querySelector("#gap-select");
  data.gaps.forEach((section, index) => gapSelect.insertAdjacentHTML("beforeend", `<option value="${index}">${esc(section.title)}</option>`));
  function renderGaps() {
    const section = data.gaps[Number(gapSelect.value) || 0];
    const max = Math.max(...section.rows.map(row => Number(row[2] || 0)), 1);
    const list = root.querySelector("#gap-list");
    list.innerHTML = section.rows.map(row => {
      const shortlisted = Number(row[1] || 0);
      const book = Number(row[2] || 0);
      const width = Math.max(1, book ? shortlisted / book * 100 : 0);
      const flag = String(row[4] || "").startsWith("GAP") ? "GAP" : (row[4] ? "LOW VALUE" : "Covered");
      return `<div class="gap-row"><div class="gap-label"><strong>${esc(row[0])}</strong><span class="text-small">${shortlisted} shortlist · ${book} book · ${money(row[3])}</span></div><div class="gap-track" aria-label="${esc(row[0])}: ${shortlisted} of ${book}"><div class="gap-fill" data-width="${Math.min(100, Math.max(2, width)).toFixed(2)}"></div></div><span class="viz-badge gap-flag">${esc(flag)}</span></div>`;
    }).join("");
    requestAnimationFrame(() => list.querySelectorAll(".gap-fill").forEach(bar => { bar.style.width = bar.dataset.width + "%"; }));
  }
  gapSelect.addEventListener("change", renderGaps);

  root.querySelector("#method-stack").innerHTML = data.methods.map((section, index) => `<details${index === 0 ? " open" : ""}><summary>${esc(section.title)}</summary>${section.paragraphs.map(text => `<p>${esc(text)}</p>`).join("")}</details>`).join("");

  root.querySelectorAll("[data-section]").forEach(button => button.addEventListener("click", () => {
    const section = button.dataset.section;
    root.querySelectorAll("[data-section]").forEach(item => {
      const active = item === button;
      item.setAttribute("aria-pressed", String(active));
      item.classList.toggle("btn-ghost", !active);
    });
    root.querySelectorAll("[data-panel]").forEach(panel => { panel.hidden = panel.dataset.panel !== section; });
    if (section === "gaps") renderGaps();
  }));

  renderStories();
  renderGaps();
})();
</script>
</div>
'''


def main():
    payload = build_payload()
    align_logo = compact_image_uri(extract_align_logo(), max_size=(536, 216), quality=88)
    fragment = FRAGMENT.replace("__ALIGN_LOGO__", align_logo).replace(
        "__DATA__", json.dumps(payload, separators=(",", ":"), ensure_ascii=True)
    )
    OUTPUT.write_text(fragment, encoding="utf-8")
    print(f"{OUTPUT} {OUTPUT.stat().st_size} bytes")


if __name__ == "__main__":
    main()
