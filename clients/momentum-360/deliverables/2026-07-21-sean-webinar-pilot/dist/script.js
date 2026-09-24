const KEYS = {
  event: "momentum-workshop-event-v4",
  registrations: "momentum-workshop-registrations-v2",
};
const defaults = {
  title: "Build a Business That Grows Without You",
  date: "2026-08-27",
  time: "12:00",
  duration: "60",
  timezone: "America/New_York",
  meeting_url: "",
  public_url:
    "https://momentum-workshop-pilot.netlify.app/?utm_source=calendar&utm_medium=event&utm_campaign=growth-workshop",
  host: "Sean and Mac",
};
const MOTION = {
  stagger: 0.08,
  snap: 0.16,
  ui: 0.32,
  gentle: 0.72,
  lively: 0.52,
  ambient: 3.8,
  enter: 24,
};
let eventConfig = normalizeEventConfig(read(KEYS.event, defaults));
let registrations = read(KEYS.registrations, []);

const views = [...document.querySelectorAll("[data-view]")];
const registrationForm = document.querySelector("#registration");
const configForm = document.querySelector("#event-config");
const error = document.querySelector("#form-error");
const previewDialog = document.querySelector("#message-preview");
const submitButton = registrationForm.querySelector(".command-submit");

document.querySelectorAll("[data-route]").forEach((control) =>
  control.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.hash = control.dataset.route;
    showView(control.dataset.route);
  }),
);

registrationForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!registrationForm.checkValidity()) {
    setSubmitState("error", "Check the required fields", "!");
    error.textContent = "Please complete each required field.";
    error.hidden = false;
    registrationForm.reportValidity();
    return;
  }
  const form = new FormData(registrationForm);
  const record = {
    id: crypto.randomUUID(),
    firstName: clean(form.get("first_name")),
    lastName: clean(form.get("last_name")),
    email: clean(form.get("email")),
    company: clean(form.get("company")),
    constraint: clean(form.get("constraint")),
    reminders: form.get("reminders") === "on",
    calendarConsent: form.get("calendar_open") === "on",
    calendarProvider: clean(form.get("calendar_provider")),
    createdAt: new Date().toISOString(),
  };
  const search = new URLSearchParams(window.location.search);
  form.set("registration_id", record.id);
  form.set("registration_status", "registered");
  form.set("registered_at", record.createdAt);
  form.set("event_title", eventConfig.title);
  form.set("event_date", eventConfig.date);
  form.set("event_time", eventConfig.time);
  form.set("event_timezone", eventConfig.timezone);
  form.set("page_url", window.location.href);
  form.set("referrer", document.referrer || "direct");
  ["utm_source", "utm_medium", "utm_campaign", "utm_content"].forEach((key) =>
    form.set(key, clean(search.get(key))),
  );
  const prospectId = clean(search.get("utm_content"));
  form.set(
    "source_prospect_id",
    /^PHL-WORKSHOP-\d{3}$/.test(prospectId) ? prospectId : "",
  );
  form.set(
    "source_list",
    /^PHL-WORKSHOP-\d{3}$/.test(prospectId)
      ? "philadelphia_workshop_250_2026_07"
      : "",
  );
  const hostedSubmission = isHostedSubmission();
  const calendarWindow = record.calendarConsent
    ? window.open("about:blank", "_blank")
    : null;
  if (calendarWindow) {
    calendarWindow.opener = null;
  }
  setSubmitState("loading", "Saving your registration", "…");
  try {
    if (hostedSubmission) {
      await submitRegistration(form);
    }
  } catch {
    calendarWindow?.close();
    setSubmitState("error", "Try registration again", "↻");
    error.textContent =
      "We could not save your registration. Please try again in a moment.";
    error.hidden = false;
    return;
  }
  if (calendarWindow) {
    calendarWindow.location.href = calendarTargetUrl(record.calendarProvider);
  }
  registrations = [record, ...registrations].slice(0, 25);
  if (!hostedSubmission) {
    write(KEYS.registrations, registrations);
  }
  error.hidden = true;
  updateConfirmation(
    record.firstName,
    record.calendarConsent,
    record.calendarProvider,
  );
  updateMetrics();
  renderRegistrants();
  setSubmitState("success", "Seat reserved", "✓");
  showView("confirmation");
});

function setSubmitState(state, label, glyph) {
  submitButton.dataset.state = state;
  submitButton.disabled = state === "loading" || state === "success";
  registrationForm.setAttribute("aria-busy", String(state === "loading"));
  submitButton.querySelector(".submit-label").textContent = label;
  submitButton.querySelector(".submit-glyph").textContent = glyph;
}

function isHostedSubmission() {
  return (
    registrationForm.dataset.submitMode === "netlify" &&
    !["localhost", "127.0.0.1"].includes(window.location.hostname)
  );
}

async function submitRegistration(formData) {
  formData.set("form-name", registrationForm.getAttribute("name"));
  const response = await fetch(registrationForm.action, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(formData).toString(),
  });
  if (!response.ok) {
    throw new Error(`Registration failed with ${response.status}`);
  }
}

configForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!configForm.checkValidity()) {
    configForm.reportValidity();
    return;
  }
  eventConfig = Object.fromEntries(new FormData(configForm).entries());
  eventConfig = normalizeEventConfig(eventConfig);
  write(KEYS.event, eventConfig);
  document.querySelector("#save-status").textContent = "Saved just now";
  updateEventDetails();
});

document.querySelector("#download-ics").addEventListener("click", downloadIcs);
document.querySelector("#clear-tests").addEventListener("click", () => {
  registrations = [];
  write(KEYS.registrations, registrations);
  renderRegistrants();
  updateMetrics();
});
document
  .querySelectorAll("[data-preview]")
  .forEach((button) =>
    button.addEventListener("click", () => openPreview(button.dataset.preview)),
  );
document
  .querySelector(".dialog-close")
  .addEventListener("click", () => previewDialog.close());

setupShell();
setupEmbedMode();
setupReveal();
setupExperience();
setupAgendaControls();
setupAgendaExperience();
setupFormProgress();
setupMobileDock();
hydrateConfig();
updateEventDetails();
renderRegistrants();
updateMetrics();
showView(window.location.hash === "#operator" ? "operator" : "register");

function setupEmbedMode() {
  if (new URLSearchParams(window.location.search).get("embed") !== "1") return;
  document.documentElement.classList.add("embed-mode");
  document.querySelectorAll('[data-route="operator"]').forEach((control) => {
    control.hidden = true;
  });
}

function showView(name) {
  const updateView = () => {
    views.forEach((view) => {
      const active = view.dataset.view === name;
      view.hidden = !active;
      view.classList.toggle("active", active);
    });
    document.querySelector("#mobileNav").classList.remove("open");
    document.querySelector("#menuButton").setAttribute("aria-expanded", "false");
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.querySelector("#mobileDock")?.classList.toggle("hidden", name !== "register");
    if (name === "register" && submitButton.dataset.state === "success") {
      setSubmitState("idle", "Register and open my calendar", "→");
    }
  };
  if (document.startViewTransition) {
    document.startViewTransition(updateView);
  } else {
    updateView();
  }
}

function hydrateConfig() {
  Object.entries(eventConfig).forEach(([name, value]) => {
    const field = configForm.elements.namedItem(name);
    if (field) field.value = value;
  });
}

function updateEventDetails() {
  const date = formatDate(eventConfig.date);
  const time = formatTime(eventConfig.time);
  const zone = zoneLabel(eventConfig.timezone);
  document.querySelector("#hero-date").textContent = date;
  document.querySelector("#hero-time").textContent = `${time} ${zone}`;
  document.querySelector("#rail-date").textContent = date;
  document.querySelector("#rail-time").textContent = `${time} ${zone}`;
  document.querySelector("#dock-date").textContent = `${shortDate(eventConfig.date)} · ${time} ${zone}`;
  document.querySelector("#ticket-title").textContent = eventConfig.title;
  document.querySelector("#ticket-date").textContent = date;
  document.querySelector("#ticket-time").textContent =
    `${time} ${zone} · ${eventConfig.duration} minutes`;
  const orbitDate = new Date(`${eventConfig.date}T12:00:00`);
  document.querySelector("#orbit-month").textContent = orbitDate
    .toLocaleDateString("en-US", { month: "short" })
    .toUpperCase();
  document.querySelector("#orbit-day").textContent = String(orbitDate.getDate()).padStart(2, "0");
  document.querySelector("#google-calendar").href = googleCalendarUrl();
  document.querySelector("#outlook-calendar").href = outlookCalendarUrl();
}

function updateConfirmation(
  firstName,
  calendarRequested = false,
  calendarProvider = "google",
) {
  const provider =
    {
      google: "Google Calendar",
      outlook: "Outlook Calendar",
      apple: "your calendar app",
    }[calendarProvider] || "your calendar";
  document.querySelector("#confirmation-copy").textContent =
    calendarRequested
      ? `${firstName}, the organizer invitation is queued and ${provider} has opened with the event ready. Accept the invitation when it arrives to keep RSVP updates connected.`
      : `${firstName}, your seat is ready. Choose Google, Outlook, or Apple Calendar below to add the workshop.`;
  updateEventDetails();
}

function renderRegistrants() {
  const body = document.querySelector("#registrant-rows");
  if (!registrations.length) {
    body.innerHTML =
      '<tr class="empty-row"><td colspan="4">No local test registrations yet.</td></tr>';
    return;
  }
  body.replaceChildren(
    ...registrations.map((record) => {
      const row = document.createElement("tr");
      [
        `${record.firstName} ${record.lastName}`,
        record.company,
        record.constraint,
        record.reminders && record.calendarConsent
          ? "Both granted"
          : "Incomplete",
      ].forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.append(cell);
      });
      return row;
    }),
  );
}

function updateMetrics() {
  const count = 32 + registrations.length;
  document.querySelector("#registration-count").textContent = String(count);
  document.querySelector("#conversion-rate").textContent =
    `${((count / 248) * 100).toFixed(1)}%`;
}

function setupShell() {
  const header = document.querySelector("#siteHeader");
  const menuButton = document.querySelector("#menuButton");
  const mobileNav = document.querySelector("#mobileNav");
  menuButton.addEventListener("click", () => {
    const open = !mobileNav.classList.contains("open");
    mobileNav.classList.toggle("open", open);
    menuButton.setAttribute("aria-expanded", String(open));
  });
  mobileNav.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => {
      mobileNav.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    }),
  );
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      mobileNav.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    }
  });
  const top = document.querySelector("#top");
  if (top && "IntersectionObserver" in window) {
    new IntersectionObserver(
      ([entry]) => header.classList.toggle("scrolled", !entry.isIntersecting),
      { threshold: 0.05 },
    ).observe(top);
  }
}

function setupReveal() {
  const popTargets = document.querySelectorAll(
    ".system-track article, .outcome-line, .calendar-event-card, .faq-list details",
  );
  popTargets.forEach((element, index) => {
    element.classList.add("scroll-pop");
    element.style.setProperty("--reveal-delay", `${(index % 5) * 70}ms`);
  });
  const elements = document.querySelectorAll(".reveal, .scroll-pop");
  if (!("IntersectionObserver" in window)) return;
  document.documentElement.classList.add("reveal-ready");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.08 },
  );
  elements.forEach((element) => observer.observe(element));
}

function setupExperience() {
  const root = document.documentElement;
  const motionToggle = document.querySelector("#motionToggle");
  const storedPreference = localStorage.getItem("momentum-workshop-motion");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const motionOff = storedPreference === "off" || reduced;
  setMotion(motionOff);

  motionToggle?.addEventListener("click", () => {
    const next = !root.classList.contains("no-motion");
    setMotion(next);
    localStorage.setItem("momentum-workshop-motion", next ? "off" : "on");
  });

  const updateScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const progress = max > 0 ? Math.min(1, scrollY / max) : 0;
    document.querySelector("#scrollProgress").style.transform = `scaleX(${progress})`;
  };
  addEventListener("scroll", updateScroll, { passive: true });
  addEventListener("resize", updateScroll, { passive: true });
  updateScroll();

  if (!motionOff && window.gsap) {
    window.gsap.from(".hero-copy > *", {
      y: MOTION.enter,
      opacity: 0,
      duration: MOTION.gentle,
      stagger: MOTION.stagger,
      ease: "power3.out",
      delay: 0.12,
    });
    window.gsap.from(".founder-portrait", {
      x: 32,
      scale: 0.97,
      duration: MOTION.gentle,
      ease: "power3.out",
      delay: 0.2,
    });
    window.gsap.to(".founder-portrait", {
      y: -7,
      duration: MOTION.ambient,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }

  function setMotion(off) {
    root.classList.toggle("no-motion", off);
    if (!motionToggle) return;
    motionToggle.setAttribute("aria-pressed", String(off));
    motionToggle.querySelector("b").textContent = off ? "Motion off" : "Motion on";
  }
}

function setupAgendaControls() {
  const viewport = document.querySelector(".agenda-viewport");
  const chapters = [...document.querySelectorAll(".agenda-chapter")];
  const previous = document.querySelector("#agendaPrev");
  const next = document.querySelector("#agendaNext");
  const dots = document.querySelector("#agendaDots");
  const status = document.querySelector("#agendaStatus");
  if (!viewport || !chapters.length || !previous || !next || !dots || !status) {
    return;
  }

  dots.replaceChildren(
    ...chapters.map(() => {
      const dot = document.createElement("i");
      return dot;
    }),
  );
  const dotItems = [...dots.children];
  let activeIndex = 0;
  let ticking = false;

  const update = () => {
    const viewportCenter = viewport.scrollLeft + viewport.clientWidth / 2;
    activeIndex = chapters.reduce((closest, chapter, index) => {
      const chapterCenter = chapter.offsetLeft + chapter.offsetWidth / 2;
      const closestCenter =
        chapters[closest].offsetLeft + chapters[closest].offsetWidth / 2;
      return Math.abs(chapterCenter - viewportCenter) <
        Math.abs(closestCenter - viewportCenter)
        ? index
        : closest;
    }, 0);
    chapters.forEach((chapter, index) =>
      chapter.classList.toggle("is-active", index === activeIndex),
    );
    dotItems.forEach((dot, index) =>
      dot.classList.toggle("is-active", index === activeIndex),
    );
    previous.disabled = activeIndex === 0;
    next.disabled = activeIndex === chapters.length - 1;
    status.textContent = `Workshop chapter ${activeIndex + 1} of ${chapters.length}: ${chapters[activeIndex].querySelector("strong").textContent}`;
    ticking = false;
  };

  const goTo = (index) => {
    const target = Math.max(0, Math.min(chapters.length - 1, index));
    viewport.scrollTo({
      left: chapters[target].offsetLeft - viewport.offsetLeft,
      behavior: document.documentElement.classList.contains("no-motion")
        ? "auto"
        : "smooth",
    });
  };

  previous.addEventListener("click", () => goTo(activeIndex - 1));
  next.addEventListener("click", () => goTo(activeIndex + 1));
  viewport.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true },
  );
  addEventListener("resize", update, { passive: true });
  update();
}

function setupAgendaExperience() {
  const root = document.documentElement;
  const agenda = document.querySelector(".agenda-section");
  const viewport = document.querySelector(".agenda-viewport");
  const track = document.querySelector("#agendaTrack");
  const progress = document.querySelector("#agendaProgress");
  if (
    !agenda ||
    !viewport ||
    !track ||
    root.classList.contains("no-motion") ||
    !window.gsap ||
    !window.ScrollTrigger ||
    innerWidth <= 760
  ) {
    return;
  }

  window.gsap.registerPlugin(window.ScrollTrigger);
  root.classList.add("motion-enhanced");
  const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
  window.gsap.to(track, {
    x: () => -distance(),
    ease: "none",
    scrollTrigger: {
      trigger: agenda,
      start: "top top",
      end: () => `+=${Math.max(1100, distance() * 1.35)}`,
      pin: true,
      scrub: 0.85,
      invalidateOnRefresh: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        progress.style.transform = `scaleX(${self.progress})`;
      },
    },
  });

  window.gsap.to(".founder-story-lead", {
    opacity: 0.18,
    y: -120,
    filter: "blur(6px)",
    ease: "none",
    scrollTrigger: {
      trigger: ".founder-story",
      start: "top top",
      end: "35% top",
      scrub: true,
    },
  });
  window.gsap.fromTo(
    ".founder-beat-mac .founder-crop",
    { clipPath: "polygon(42% 0, 100% 0, 96% 100%, 36% 94%)" },
    {
      clipPath: "polygon(4% 0, 100% 0, 96% 100%, 0 94%)",
      ease: "none",
      scrollTrigger: {
        trigger: ".founder-beat-mac",
        start: "top 85%",
        end: "center 42%",
        scrub: true,
      },
    },
  );
  window.gsap.fromTo(
    ".founder-beat-sean .founder-crop",
    { clipPath: "polygon(0 0, 58% 3%, 62% 94%, 4% 100%)" },
    {
      clipPath: "polygon(0 0, 96% 3%, 100% 94%, 4% 100%)",
      ease: "none",
      scrollTrigger: {
        trigger: ".founder-beat-sean",
        start: "top 85%",
        end: "center 42%",
        scrub: true,
      },
    },
  );
  window.gsap.fromTo(
    ".closing-portrait",
    { scale: 1.03, filter: "saturate(.78) contrast(1.03) brightness(.78)" },
    {
      scale: 1.13,
      filter: "saturate(.98) contrast(1.05) brightness(.92)",
      ease: "none",
      scrollTrigger: {
        trigger: ".closing-portal",
        start: "top bottom",
        end: "bottom bottom",
        scrub: true,
      },
    },
  );
}

function setupFormProgress() {
  const required = [...registrationForm.querySelectorAll("[required]")];
  const update = () => {
    if (submitButton.dataset.state === "error") {
      setSubmitState("idle", "Register and open my calendar", "→");
      error.hidden = true;
    }
    const complete = required.filter((field) =>
      field.type === "checkbox" ? field.checked : field.value.trim() && field.checkValidity(),
    ).length;
    const total = required.length;
    document.querySelector("#formProgressText").textContent = `${complete} of ${total} complete`;
    document.querySelector("#formProgressBar").style.transform = `scaleX(${complete / total})`;
  };
  registrationForm.addEventListener("input", update);
  registrationForm.addEventListener("change", update);
  update();
}

function setupMobileDock() {
  const dock = document.querySelector("#mobileDock");
  const registration = document.querySelector("#register");
  if (!dock || !registration || !("IntersectionObserver" in window)) return;
  new IntersectionObserver(
    ([entry]) => dock.classList.toggle("hidden", entry.isIntersecting),
    { threshold: 0.12 },
  ).observe(registration);
}

function openPreview(type) {
  const messages = {
    confirmation: [
      "Your workshop seat is confirmed",
      `You are registered for ${eventConfig.title}. The event begins ${formatDate(eventConfig.date)} at ${formatTime(eventConfig.time)} ${zoneLabel(eventConfig.timezone)}. Calendar options are available by choice.`,
    ],
    "24-hour": [
      "Tomorrow: bring one growth constraint",
      `Your workshop starts tomorrow. Bring one active offer and the constraint limiting growth. Host: ${eventConfig.host}.`,
    ],
    "1-hour": [
      "Starting in one hour",
      `The workshop begins in one hour. Join when ready using: ${eventConfig.meeting_url}`,
    ],
    replay: [
      "Workshop replay and your next step",
      "The replay link and an optional strategy conversation would appear here after a real delivery integration is approved.",
    ],
  };
  const [subject, body] = messages[type];
  document.querySelector("#preview-subject").textContent = subject;
  const content = document.querySelector("#preview-body");
  const paragraph = document.createElement("p");
  paragraph.className = "preview-message";
  paragraph.textContent = body;
  content.replaceChildren(paragraph);
  previewDialog.showModal();
}

function googleCalendarUrl() {
  const { start, end } = eventTimes();
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: eventConfig.title,
    dates: `${calendarStamp(start)}/${calendarStamp(end)}`,
    details: calendarDescription(),
    location: calendarLocation(),
    ctz: eventConfig.timezone,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

function outlookCalendarUrl() {
  const { start, end } = eventTimes();
  const params = new URLSearchParams({
    rru: "addevent",
    subject: eventConfig.title,
    startdt: start.toISOString(),
    enddt: end.toISOString(),
    body: calendarDescription(),
    location: calendarLocation(),
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params}`;
}

function calendarTargetUrl(provider) {
  if (provider === "outlook") return outlookCalendarUrl();
  if (provider === "apple") {
    return `${window.location.origin}/momentum-workshops.ics`;
  }
  return googleCalendarUrl();
}

function downloadIcs() {
  const { start, end } = eventTimes();
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Momentum Workshop Pilot//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${icsEscape(eventConfig.title)}`,
    `X-WR-TIMEZONE:${icsEscape(eventConfig.timezone)}`,
    "BEGIN:VEVENT",
    `UID:${crypto.randomUUID()}@momentum-workshop.local`,
    `DTSTAMP:${calendarStamp(new Date())}`,
    `DTSTART:${calendarStamp(start)}`,
    `DTEND:${calendarStamp(end)}`,
    `SUMMARY:${icsEscape(eventConfig.title)}`,
    `DESCRIPTION:${icsEscape(calendarDescription())}`,
    `LOCATION:${icsEscape(calendarLocation())}`,
    `URL:${icsEscape(eventConfig.public_url)}`,
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(
    new Blob([body], { type: "text/calendar;charset=utf-8" }),
  );
  link.download = "momentum-workshop-pilot.ics";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

function eventTimes() {
  const start = zonedDateTimeToUtc(
    eventConfig.date,
    eventConfig.time,
    eventConfig.timezone,
  );
  return {
    start,
    end: new Date(start.getTime() + Number(eventConfig.duration) * 60000),
  };
}

function zonedDateTimeToUtc(dateValue, timeValue, timeZone) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const [hour, minute] = timeValue.split(":").map(Number);
  const target = Date.UTC(year, month - 1, day, hour, minute);
  let guess = target;
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  for (let pass = 0; pass < 3; pass += 1) {
    const parts = Object.fromEntries(
      formatter
        .formatToParts(new Date(guess))
        .filter(({ type }) => type !== "literal")
        .map(({ type, value }) => [type, Number(value)]),
    );
    const rendered = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    );
    guess += target - rendered;
  }

  return new Date(guess);
}

function calendarDescription() {
  const access = validMeetingUrl(eventConfig.meeting_url)
    ? `Join the live workshop: ${eventConfig.meeting_url}`
    : `Workshop access and updates: ${eventConfig.public_url}`;
  return `Live Momentum 360 workshop hosted by ${eventConfig.host}. Bring one active offer and one growth constraint. ${access}`;
}

function calendarLocation() {
  return validMeetingUrl(eventConfig.meeting_url)
    ? eventConfig.meeting_url
    : "Online workshop — join details supplied after registration";
}

function validMeetingUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return (
      url.protocol === "https:" &&
      url.hostname !== "example.com" &&
      url.hostname !== "www.example.com"
    );
  } catch {
    return false;
  }
}

function normalizeEventConfig(value) {
  const config = { ...defaults, ...(value || {}) };
  if (!validMeetingUrl(config.meeting_url)) {
    config.meeting_url = "";
  }
  if (!validMeetingUrl(config.public_url)) {
    config.public_url = defaults.public_url;
  }
  return config;
}
function calendarStamp(date) {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}
function icsEscape(value) {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}
function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}
function shortDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}
function formatTime(value) {
  const [hour, minute] = value.split(":");
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(2026, 0, 1, Number(hour), Number(minute)));
}
function zoneLabel(value) {
  return (
    {
      "America/New_York": "ET",
      "America/Chicago": "CT",
      "America/Denver": "MT",
      "America/Los_Angeles": "PT",
    }[value] || "Local"
  );
}
function clean(value) {
  return String(value || "").trim();
}
function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
