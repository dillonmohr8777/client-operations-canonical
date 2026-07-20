const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const state = {
  mode: new URLSearchParams(location.search).get("mode") === "ranker" ? "ranker" : "audit",
  screenshotUrl: null,
  audit: null,
};

const elements = {
  form: $("#audit-form"),
  city: $("#city"),
  practice: $("#practice"),
  firm: $("#firm"),
  website: $("#website"),
  profileUrl: $("#profile-url"),
  screenshot: $("#screenshot"),
  screenshotPreview: $("#screenshot-preview"),
  mapPlaceholder: $("#map-placeholder"),
  clearScreenshot: $("#clear-screenshot"),
  runAudit: $("#run-audit"),
  downloadPdf: $("#download-pdf"),
  statusPanel: $("#status-panel"),
  statusTitle: $("#status-title"),
  statusCopy: $("#status-copy"),
  previewTitle: $("#preview-title"),
  previewSummary: $("#preview-summary"),
  previewPractice: $("#preview-practice"),
  previewPracticeCard: $("#preview-practice-card"),
  previewFirm: $("#preview-firm"),
  previewCity: $("#preview-city"),
  scoreValue: $("#score-value"),
  scoreLabel: $("#score-label"),
  observation: $("#audit-observation"),
  findingGrid: $("#finding-grid"),
  ctaKicker: $("#cta-kicker"),
  ctaTitle: $("#cta-title"),
  profileLink: $("#profile-link"),
  previewStage: $(".preview-stage"),
  printSheet: $("#print-sheet"),
};

function safeText(value, fallback) {
  const clean = String(value || "").replace(/\s+/g, " ").trim();
  return clean || fallback;
}

function setStatus(type, title, copy) {
  elements.statusPanel.dataset.state = type;
  elements.statusTitle.textContent = title;
  elements.statusCopy.textContent = copy;
}

function modeCopy() {
  const city = safeText(elements.city.value, "your city");
  const practice = safeText(elements.practice.value, "Law");
  const firm = safeText(elements.firm.value, "YOUR LAW FIRM");

  elements.previewPractice.textContent = practice;
  elements.previewPracticeCard.textContent = practice;
  elements.previewFirm.textContent = firm;
  elements.previewCity.textContent = city;

  if (state.mode === "ranker") {
    elements.previewTitle.innerHTML = `Build a stronger path toward <span>top local visibility in ${escapeHtml(city)}</span>`;
    elements.previewSummary.textContent = `Turn verified website findings and the real local-pack screenshot into a focused ${practice} growth plan.`;
    elements.ctaKicker.textContent = "Turn the audit into action";
    elements.ctaTitle.textContent = `Strengthen ${firm}'s local profile`;
  } else {
    elements.previewTitle.innerHTML = `Local SEO audit for lawyers in <span>${escapeHtml(city)}</span>`;
    elements.previewSummary.textContent = "See the website and local-profile signals that can strengthen visibility, trust, and qualified consultations.";
    elements.ctaKicker.textContent = "Your next local growth move";
    elements.ctaTitle.textContent = "Get the law-firm local SEO action plan";
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);
}

function configureMode() {
  $$('[data-mode-link]').forEach((link) => {
    const active = link.dataset.modeLink === state.mode;
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  $("#builder-title").textContent = state.mode === "ranker" ? "Law Firm Local Ranker" : "Law Firm Local SEO Audit";
  elements.runAudit.textContent = state.mode === "ranker" ? "Run check and build plan" : "Run live site check";
  modeCopy();
}

function scoreLabel(score) {
  if (score >= 85) return "Strong foundation";
  if (score >= 68) return "Good, with gaps";
  if (score >= 48) return "Material gaps";
  return "Needs attention";
}

function renderFindings(findings) {
  const prioritized = [...findings]
    .sort((a, b) => ({ fail: 0, warn: 1, pass: 2 }[a.status] - ({ fail: 0, warn: 1, pass: 2 }[b.status])))
    .slice(0, 4);

  elements.findingGrid.innerHTML = "";
  prioritized.forEach((finding, index) => {
    const card = document.createElement("article");
    card.dataset.status = finding.status;
    const number = document.createElement("span");
    number.textContent = String(index + 1).padStart(2, "0");
    const heading = document.createElement("h3");
    heading.textContent = finding.label;
    const detail = document.createElement("p");
    detail.textContent = finding.detail;
    card.append(number, heading, detail);
    elements.findingGrid.append(card);
  });
}

function renderAudit(audit) {
  state.audit = audit;
  elements.scoreValue.textContent = String(audit.score);
  elements.scoreLabel.textContent = scoreLabel(audit.score);
  elements.observation.textContent = `Verified ${audit.finalUrl} on ${new Date(audit.observedAt).toLocaleDateString()}. ${audit.summary}`;
  renderFindings(audit.findings);
}

async function runAudit(event) {
  event.preventDefault();
  const website = safeText(elements.website.value, "");
  if (!website) {
    elements.website.focus();
    setStatus("error", "Website required", "Add the public law-firm website before running the check.");
    return;
  }

  elements.runAudit.disabled = true;
  elements.runAudit.textContent = "Checking public site...";
  setStatus("loading", "Running the website check", "Reviewing public technical and local-relevance signals. No profile or website changes are being made.");

  try {
    const response = await fetch("/.netlify/functions/audit-site", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        url: website,
        city: safeText(elements.city.value, ""),
        practice: safeText(elements.practice.value, ""),
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "The public website could not be checked.");
    renderAudit(payload);
    setStatus("success", `Website check complete: ${payload.score}/100`, payload.summary);
  } catch (error) {
    setStatus("error", "Website check could not finish", error.message || "Confirm the URL is public and try again.");
  } finally {
    elements.runAudit.disabled = false;
    elements.runAudit.textContent = state.mode === "ranker" ? "Run check and build plan" : "Run live site check";
  }
}

function updateProfileLink() {
  const value = safeText(elements.profileUrl.value, "");
  if (!value) {
    elements.profileLink.href = "https://www.needmomentum.com";
    elements.profileLink.textContent = "needmomentum.com";
    return;
  }
  try {
    const url = new URL(value);
    if (!/^https?:$/.test(url.protocol)) throw new Error("unsupported");
    elements.profileLink.href = url.href;
    elements.profileLink.textContent = "Open profile reference";
  } catch {
    elements.profileLink.href = "https://www.needmomentum.com";
    elements.profileLink.textContent = "needmomentum.com";
  }
}

function updateScreenshot(file) {
  if (state.screenshotUrl) URL.revokeObjectURL(state.screenshotUrl);
  state.screenshotUrl = file ? URL.createObjectURL(file) : null;
  elements.screenshotPreview.hidden = !file;
  elements.mapPlaceholder.hidden = Boolean(file);
  elements.clearScreenshot.hidden = !file;
  if (file) elements.screenshotPreview.src = state.screenshotUrl;
  else elements.screenshotPreview.removeAttribute("src");
}

function downloadPdf() {
  modeCopy();
  updateProfileLink();
  const firm = safeText(elements.firm.value, "law-firm").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const originalTitle = document.title;
  document.title = `${firm || "law-firm"}-${state.mode}-local-seo-brief`;
  window.addEventListener("afterprint", () => { document.title = originalTitle; }, { once: true });
  window.print();
}

function fitMobilePreview() {
  if (window.matchMedia("print").matches || window.innerWidth > 680) {
    elements.printSheet.style.removeProperty("transform");
    elements.previewStage.style.removeProperty("height");
    return;
  }
  const availableWidth = Math.max(296, elements.previewStage.clientWidth - 24);
  const scale = Math.min(1, availableWidth / 720);
  elements.printSheet.style.transform = `scale(${scale})`;
  elements.previewStage.style.height = `${Math.ceil(elements.printSheet.offsetHeight * scale + 24)}px`;
}

elements.form.addEventListener("submit", runAudit);
elements.downloadPdf.addEventListener("click", downloadPdf);
elements.clearScreenshot.addEventListener("click", () => {
  elements.screenshot.value = "";
  updateScreenshot(null);
});
elements.screenshot.addEventListener("change", () => updateScreenshot(elements.screenshot.files[0] || null));
[elements.city, elements.practice, elements.firm].forEach((input) => input.addEventListener("input", modeCopy));
elements.profileUrl.addEventListener("input", updateProfileLink);
window.addEventListener("beforeunload", () => { if (state.screenshotUrl) URL.revokeObjectURL(state.screenshotUrl); });
window.addEventListener("resize", fitMobilePreview);
window.addEventListener("beforeprint", () => {
  elements.printSheet.style.removeProperty("transform");
  elements.previewStage.style.removeProperty("height");
});
window.addEventListener("afterprint", fitMobilePreview);

configureMode();
updateProfileLink();
fitMobilePreview();
