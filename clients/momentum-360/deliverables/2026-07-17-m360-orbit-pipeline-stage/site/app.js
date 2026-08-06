const squads = {
  capture: { name: "Capture & Showcase", short: "Capture" },
  found: { name: "Get Found", short: "Get found" },
  win: { name: "Win Customers", short: "Win customers" },
  run: { name: "Content & Operations", short: "Content & ops" },
};

const agents = [
  { id: "vera", name: "VERA", role: "360 Virtual Tour Architect", squad: "capture", signal: "Immersive experience", description: "Plans tours that build confidence before a customer ever walks through the door." },
  { id: "lens", name: "LENS", role: "Listing Photo Director", squad: "capture", signal: "Still-image proof", description: "Creates shot lists and image systems that make spaces feel clear, credible, and premium." },
  { id: "aero", name: "AERO", role: "Drone & Aerial Planner", squad: "capture", signal: "Scale and context", description: "Maps aerial sequences that show location, access, scale, and surrounding value." },
  { id: "frame", name: "FRAME", role: "Property Video Producer", squad: "capture", signal: "Motion and story", description: "Turns a property or service into a concise narrative built to hold attention." },
  { id: "wave", name: "WAVE", role: "Podcast Studio Producer", squad: "capture", signal: "Authority at scale", description: "Builds episodes that create trust once and feed every content channel afterward." },
  { id: "atlas", name: "ATLAS", role: "AI Search & SEO Strategist", squad: "found", signal: "Search demand", description: "Maps the topics, pages, and proof that earn rankings and AI citations." },
  { id: "maps", name: "MAPS", role: "Google Business Strategist", squad: "found", signal: "Map Pack presence", description: "Strengthens the local profile signals that turn nearby searches into calls and visits." },
  { id: "signal", name: "SIGNAL", role: "Local Service Ads Operator", squad: "found", signal: "High-intent calls", description: "Plans Local Service Ads around qualified leads, coverage, and booked-job economics." },
  { id: "grid", name: "GRID", role: "Local Listings Controller", squad: "found", signal: "Entity consistency", description: "Finds and fixes listing gaps that weaken trust across the local search ecosystem." },
  { id: "pulse", name: "PULSE", role: "Meta Ads Strategist", squad: "win", signal: "Paid demand", description: "Builds Meta campaigns around offers, creative learning, and qualified pipeline." },
  { id: "hook", name: "HOOK", role: "Conversion Copywriter", squad: "win", signal: "Message-market fit", description: "Writes ads and offers that turn a specific pain into a believable next step." },
  { id: "pin", name: "PIN", role: "Pinterest Demand Planner", squad: "win", signal: "Visual discovery", description: "Turns evergreen visual intent into campaigns and content that compound over time." },
  { id: "revive", name: "REVIVE", role: "Lead Reactivation Operator", squad: "win", signal: "Dormant pipeline", description: "Reopens old conversations with relevant, human follow-up instead of generic blasts." },
  { id: "echo", name: "ECHO", role: "Review & Reputation Manager", squad: "win", signal: "Trust at decision time", description: "Builds review systems and responses that sound human and reinforce the brand promise." },
  { id: "studio", name: "STUDIO", role: "Social Campaign Director", squad: "win", signal: "Consistent attention", description: "Plans social content that connects expertise, proof, personality, and offers." },
  { id: "forge", name: "FORGE", role: "Content Repurposing Engine", squad: "run", signal: "One idea, many assets", description: "Transforms one useful source into a complete, channel-ready content system." },
  { id: "prism", name: "PRISM", role: "Brand System Strategist", squad: "run", signal: "Recognition and trust", description: "Clarifies positioning, voice, identity, and the rules that keep every touchpoint coherent." },
  { id: "scope", name: "SCOPE", role: "Marketing Report Analyst", squad: "run", signal: "Decision clarity", description: "Turns channel data into a short answer: what changed, why it matters, and what to do next." },
  { id: "patch", name: "PATCH", role: "Website Conversion Auditor", squad: "run", signal: "Conversion leaks", description: "Finds the page-level friction that costs calls, forms, bookings, and trust." },
];

const byId = (id) => document.getElementById(id);
const questionForm = byId("questionForm");
const questionInput = byId("question");
const businessInput = byId("business");
const agentChoice = byId("agentChoice");
const thinking = byId("thinking");
const answerPanel = byId("answerPanel");
const errorPanel = byId("errorPanel");
const submitButton = questionForm.querySelector("button[type='submit']");
let lastQuestion = "";
let lastAgent = "";

function populateAgents() {
  const agentGrid = byId("agentGrid");
  const options = document.createDocumentFragment();
  const cards = document.createDocumentFragment();

  for (const agent of agents) {
    const option = document.createElement("option");
    option.value = agent.id;
    option.textContent = `${agent.name} — ${agent.role}`;
    options.append(option);

    const card = document.createElement("article");
    card.className = "agent-card reveal";
    card.dataset.squad = agent.squad;
    card.innerHTML = `
      <div class="agent-top">
        <span class="agent-code">${squads[agent.squad].short.toUpperCase()} / ${agent.id.toUpperCase()}</span>
        <span class="agent-status">Online</span>
      </div>
      <h3>${agent.name}</h3>
      <span class="role">${agent.role}</span>
      <p>${agent.description}</p>
      <button type="button" data-agent-id="${agent.id}">Brief ${agent.name} <span aria-hidden="true">↗</span></button>
    `;
    cards.append(card);
  }

  agentChoice.append(options);
  agentGrid.append(cards);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, "<code>$1</code>");
}

function renderMarkdown(markdown) {
  const lines = String(markdown || "").replace(/\r/g, "").split("\n");
  const html = [];
  let listType = "";

  const closeList = () => {
    if (!listType) return;
    html.push(`</${listType}>`);
    listType = "";
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      closeList();
      continue;
    }

    const heading = line.match(/^(#{2,3})\s+(.+)$/);
    if (heading) {
      closeList();
      const level = heading[1].length;
      html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }

    const ordered = line.match(/^\d+[.)]\s+(.+)$/);
    const bullet = line.match(/^[-*]\s+(.+)$/);
    if (ordered || bullet) {
      const nextType = ordered ? "ol" : "ul";
      if (listType && listType !== nextType) closeList();
      if (!listType) {
        listType = nextType;
        html.push(`<${listType}>`);
      }
      html.push(`<li>${inlineMarkdown((ordered || bullet)[1])}</li>`);
      continue;
    }

    closeList();
    html.push(`<p>${inlineMarkdown(line)}</p>`);
  }

  closeList();
  return html.join("");
}

function safeHttpUrl(value) {
  try {
    const url = new URL(String(value || ""), window.location.href);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function renderSources(container, sourceItems) {
  container.replaceChildren();
  const validSources = (Array.isArray(sourceItems) ? sourceItems : [])
    .map((source) => ({
      title: String(source?.title || "Source").trim().slice(0, 180),
      url: safeHttpUrl(source?.url),
    }))
    .filter((source) => source.url);

  if (!validSources.length) {
    container.hidden = true;
    return;
  }

  const label = document.createElement("strong");
  label.textContent = "Live sources";
  const list = document.createElement("ul");
  for (const source of validSources) {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = source.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = source.title || new URL(source.url).hostname;
    item.append(link);
    list.append(item);
  }
  container.append(label, list);
  container.hidden = false;
}

function setLoading(isLoading) {
  submitButton.disabled = isLoading;
  submitButton.querySelector("span").textContent = isLoading ? "Routing…" : "Route my question";
  questionForm.hidden = isLoading;
  thinking.hidden = !isLoading;
  if (isLoading) {
    answerPanel.hidden = true;
    errorPanel.hidden = true;
  }
}

async function askOrbit() {
  const question = questionInput.value.trim();
  if (question.length < 12) {
    questionInput.setCustomValidity("Add a little more detail so Orbit can route the work.");
    questionInput.reportValidity();
    return;
  }
  questionInput.setCustomValidity("");
  lastQuestion = question;
  setLoading(true);

  try {
    const response = await fetch("/api/ask", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        question,
        business: businessInput.value.trim(),
        agentId: agentChoice.value,
        website: questionForm.elements.website?.value || "",
      }),
    });
    const rawPayload = await response.text();
    let payload;
    try {
      payload = JSON.parse(rawPayload);
    } catch {
      throw new Error("Orbit returned an unreadable response.");
    }
    if (!response.ok) throw new Error(payload.error || "Orbit could not answer right now.");
    if (!payload?.agent?.name || typeof payload.answer !== "string") {
      throw new Error("Orbit returned an incomplete response.");
    }

    lastAgent = payload.agent.name;
    byId("answerMonogram").textContent = payload.agent.name.charAt(0);
    byId("answerSquad").textContent = payload.agent.squad;
    byId("answerAgent").textContent = payload.agent.name;
    byId("answerRole").textContent = payload.agent.role;
    const collaborators = Array.isArray(payload.collaborators) ? payload.collaborators : [];
    const collaboratorLine = byId("answerCollaborators");
    if (collaborators.length) {
      collaboratorLine.innerHTML = `Coordinated with <strong>${collaborators.map((agent) => escapeHtml(agent.name)).join(", ")}</strong>`;
      collaboratorLine.hidden = false;
    } else {
      collaboratorLine.innerHTML = "";
      collaboratorLine.hidden = true;
    }
    byId("answerMode").textContent = payload.mode === "deep-multi"
      ? `${collaborators.length + 1} AGENTS COORDINATED`
      : payload.mode === "deep-live"
        ? "DEEP + AI LIVE"
        : payload.mode === "deep-plan"
          ? "DEEP PLAN"
          : "STARTER";
    byId("answerBody").innerHTML = renderMarkdown(payload.answer);
    const sources = byId("answerSources");
    renderSources(sources, payload.sources);
    byId("leadQuestion").value = lastQuestion;
    byId("leadAgent").value = `${payload.agent.name} — ${payload.agent.role}`;
    answerPanel.hidden = false;
  } catch (error) {
    console.error("Orbit request failed", { name: error?.name, message: error?.message });
    byId("errorMessage").textContent = "Orbit could not finish that response. Your question is safe; please try again.";
    errorPanel.hidden = false;
  } finally {
    thinking.hidden = true;
    submitButton.disabled = false;
  }
}

function resetCommand() {
  answerPanel.hidden = true;
  errorPanel.hidden = true;
  questionForm.hidden = false;
  questionInput.value = "";
  agentChoice.value = "";
  byId("answerSources").hidden = true;
  byId("answerCollaborators").hidden = true;
  byId("answerCollaborators").innerHTML = "";
  questionInput.focus();
}

async function saveLead(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const status = byId("leadStatus");
  const button = form.querySelector("button[type='submit']");
  status.textContent = "";
  button.disabled = true;
  button.textContent = "Saving…";

  try {
    const data = new URLSearchParams(new FormData(form));
    const response = await fetch("/", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: data.toString(),
    });
    if (!response.ok) throw new Error("Could not save the plan.");
    status.textContent = "Follow-up requested. Momentum 360 can now review this handoff.";
    byId("leadEmail").disabled = true;
    button.textContent = "Follow-up requested";
  } catch {
    status.textContent = "We could not save it here. Call (215) 607-6482 and we will pick it up.";
    button.disabled = false;
    button.textContent = "Try again";
  }
}

function setupRoster() {
  document.querySelectorAll("[data-squad]").forEach((tab) => {
    if (!tab.matches(".squad-tabs button")) return;
    tab.addEventListener("click", () => {
      const selected = tab.dataset.squad;
      document.querySelectorAll(".squad-tabs button").forEach((button) => {
        const active = button === tab;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      document.querySelectorAll(".agent-card").forEach((card) => {
        card.hidden = selected !== "all" && card.dataset.squad !== selected;
      });
    });
  });

  byId("agentGrid").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-agent-id]");
    if (!button) return;
    const agent = agents.find((item) => item.id === button.dataset.agentId);
    agentChoice.value = agent.id;
    questionInput.placeholder = `Brief ${agent.name}: describe the job, business context, and the outcome you want.`;
    byId("command").scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => questionInput.focus(), 500);
  });
}

function setupNavigation() {
  const header = byId("siteHeader");
  const menuButton = byId("menuButton");
  const mobileNav = byId("mobileNav");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 20);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const closeMenu = ({ restoreFocus = false } = {}) => {
    mobileNav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
    if (restoreFocus) menuButton.focus();
  };

  menuButton.addEventListener("click", () => {
    const open = !mobileNav.classList.contains("open");
    mobileNav.classList.toggle("open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-open", open);
  });

  mobileNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => closeMenu()));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobileNav.classList.contains("open")) closeMenu({ restoreFocus: true });
  });
}

function setupExamples() {
  document.querySelectorAll("[data-prompt]").forEach((button) => {
    button.addEventListener("click", () => {
      questionInput.value = button.dataset.prompt;
      questionInput.focus();
    });
  });
}

function setupRoi() {
  const hours = byId("hoursRange");
  const value = byId("valueRange");
  const update = () => {
    const hoursValue = Number(hours.value);
    const rateValue = Number(value.value);
    byId("hoursOutput").textContent = `${hoursValue} hours`;
    byId("valueOutput").textContent = `$${rateValue}/hr`;
    byId("roiValue").textContent = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(hoursValue * rateValue);
  };
  hours.addEventListener("input", update);
  value.addEventListener("input", update);
  update();
}

function setupReveal() {
  const elements = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    return;
  }
  document.documentElement.classList.add("reveal-ready");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: .1 });
  elements.forEach((element) => observer.observe(element));
}

populateAgents();
setupNavigation();
setupExamples();
setupRoster();
setupRoi();
setupReveal();
byId("year").textContent = String(new Date().getFullYear());

questionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  askOrbit();
});
byId("askAgain").addEventListener("click", resetCommand);
byId("retryButton").addEventListener("click", () => {
  questionForm.hidden = false;
  questionInput.value = lastQuestion;
  askOrbit();
});
byId("leadForm").addEventListener("submit", saveLead);
