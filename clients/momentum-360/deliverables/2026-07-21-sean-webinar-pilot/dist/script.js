const KEYS = {
  event: "momentum-workshop-event-v2",
  registrations: "momentum-workshop-registrations-v2",
};
const defaults = {
  title: "Build a Business That Grows Without You",
  date: "2026-08-06",
  time: "12:00",
  duration: "60",
  timezone: "America/New_York",
  meeting_url: "https://example.com/pilot-room",
  host: "Sean and Mac",
};
let eventConfig = read(KEYS.event, defaults);
let registrations = read(KEYS.registrations, []);

const views = [...document.querySelectorAll("[data-view]")];
const registrationForm = document.querySelector("#registration");
const configForm = document.querySelector("#event-config");
const error = document.querySelector("#form-error");
const previewDialog = document.querySelector("#message-preview");

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
    calendarConsent: form.get("calendar_consent") === "on",
    createdAt: new Date().toISOString(),
  };
  const hostedSubmission = isHostedSubmission();
  const calendarWindow = record.calendarConsent
    ? window.open("about:blank", "_blank")
    : null;
  if (calendarWindow) {
    calendarWindow.opener = null;
  }
  try {
    if (hostedSubmission) {
      await submitRegistration(form);
    }
  } catch {
    calendarWindow?.close();
    error.textContent =
      "We could not save your registration. Please try again in a moment.";
    error.hidden = false;
    return;
  }
  if (calendarWindow) {
    calendarWindow.location.href = googleCalendarUrl();
  }
  registrations = [record, ...registrations].slice(0, 25);
  if (!hostedSubmission) {
    write(KEYS.registrations, registrations);
  }
  error.hidden = true;
  updateConfirmation(record.firstName, record.calendarConsent);
  updateMetrics();
  renderRegistrants();
  showView("confirmation");
});

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
setupReveal();
setupExperience();
setupAgendaExperience();
setupFormProgress();
setupMobileDock();
hydrateConfig();
updateEventDetails();
renderRegistrants();
updateMetrics();
showView(window.location.hash === "#operator" ? "operator" : "register");

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
}

function updateConfirmation(firstName, calendarRequested = false) {
  document.querySelector("#confirmation-copy").textContent =
    calendarRequested
      ? `${firstName}, your Google Calendar review has opened. Confirm the event there, or use either calendar action below.`
      : `${firstName}, your seat is ready. Use either calendar action below if you want the event on your calendar.`;
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
  const elements = document.querySelectorAll(".reveal");
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
      y: 22,
      opacity: 0,
      duration: 0.8,
      stagger: 0.08,
      ease: "power3.out",
      delay: 0.12,
    });
    window.gsap.from(".founder-portrait", {
      x: 32,
      scale: 0.97,
      duration: 1,
      ease: "power3.out",
      delay: 0.2,
    });
    window.gsap.to(".founder-portrait", {
      y: -7,
      duration: 3.8,
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
    details: `Live workshop hosted by ${eventConfig.host}. Join: ${eventConfig.meeting_url}`,
    location: eventConfig.meeting_url,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

function downloadIcs() {
  const { start, end } = eventTimes();
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Momentum Workshop Pilot//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${crypto.randomUUID()}@momentum-workshop.local`,
    `DTSTAMP:${calendarStamp(new Date())}`,
    `DTSTART:${calendarStamp(start)}`,
    `DTEND:${calendarStamp(end)}`,
    `SUMMARY:${icsEscape(eventConfig.title)}`,
    `DESCRIPTION:${icsEscape(`Live workshop hosted by ${eventConfig.host}. Join: ${eventConfig.meeting_url}`)}`,
    `LOCATION:${icsEscape(eventConfig.meeting_url)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(
    new Blob([body], { type: "text/calendar;charset=utf-8" }),
  );
  link.download = "momentum-workshop-pilot.ics";
  link.click();
  URL.revokeObjectURL(link.href);
}

function eventTimes() {
  const start = new Date(`${eventConfig.date}T${eventConfig.time}:00`);
  return {
    start,
    end: new Date(start.getTime() + Number(eventConfig.duration) * 60000),
  };
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
