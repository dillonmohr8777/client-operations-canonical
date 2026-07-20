const screens = [...document.querySelectorAll("[data-preview-screen]")];
const states = [...document.querySelectorAll("[data-dashboard-state]")];
const controls = [...document.querySelectorAll("[data-show]")];
const menu = document.querySelector("#preview-menu");
const sidebar = document.querySelector("#preview-navigation");
const scrim = document.querySelector(".sidebar-scrim");

if (new URLSearchParams(window.location.search).has("capture")) {
  document.documentElement.dataset.capture = "true";
}

function showPreview(target) {
  const login = target === "login";
  screens.forEach((screen) => { screen.hidden = screen.dataset.previewScreen === "login" ? !login : login; });
  if (!login) states.forEach((state) => { state.hidden = state.dataset.dashboardState !== target; });
  controls.forEach((control) => control.setAttribute("aria-pressed", String(control.dataset.show === target)));
  if (window.location.hash.slice(1) !== target) history.replaceState(null, "", `#${target}`);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

controls.forEach((control) => control.addEventListener("click", () => showPreview(control.dataset.show)));

document.querySelector("#preview-login-form").addEventListener("submit", (event) => {
  event.preventDefault();
  document.querySelector("#preview-login-note").hidden = false;
});

document.querySelector("#preview-reveal").addEventListener("click", (event) => {
  const password = document.querySelector("#preview-password");
  const visible = password.type === "text";
  password.type = visible ? "password" : "text";
  event.currentTarget.textContent = visible ? "Show" : "Hide";
  event.currentTarget.setAttribute("aria-pressed", String(!visible));
});

document.querySelector("#preview-signout").addEventListener("click", () => {
  document.querySelector("#preview-signout-note").hidden = false;
});

function setNavigation(open) {
  sidebar.dataset.open = String(open);
  scrim.dataset.open = String(open);
  menu.setAttribute("aria-expanded", String(open));
}

menu.addEventListener("click", () => setNavigation(sidebar.dataset.open !== "true"));
scrim.addEventListener("click", () => setNavigation(false));
document.addEventListener("keydown", (event) => { if (event.key === "Escape") setNavigation(false); });

document.querySelectorAll('a[href="#"]').forEach((link) => link.addEventListener("click", (event) => event.preventDefault()));

const initial = window.location.hash.slice(1);
if (["login", "ready", "loading", "empty", "error"].includes(initial)) showPreview(initial);
