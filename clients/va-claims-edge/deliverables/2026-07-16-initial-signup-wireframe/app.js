const form = document.querySelector("#signup-form");
const formTitle = document.querySelector("#form-title");
const stepLabel = document.querySelector("#step-label");
const successState = document.querySelector("#success-state");
const toast = document.querySelector("#toast");
let currentStep = 1;
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 3200);
}

function fieldError(id, message) {
  const input = document.querySelector(`#${id}`);
  const target = document.querySelector(`#${id === "full-name" ? "name" : id}-error`);
  input.setAttribute("aria-invalid", message ? "true" : "false");
  if (target) target.textContent = message;
  return !message;
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateStepOne() {
  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value;
  const emailOkay = fieldError("email", validEmail(email) ? "" : "Enter a valid email address.");
  const passwordOkay = fieldError(
    "password",
    password.length >= 10 && /\d/.test(password) && /[^A-Za-z0-9]/.test(password)
      ? ""
      : "Use at least 10 characters with a number and a symbol.",
  );
  if (!emailOkay) document.querySelector("#email").focus();
  else if (!passwordOkay) document.querySelector("#password").focus();
  return emailOkay && passwordOkay;
}

function validateStepTwo() {
  const name = document.querySelector("#full-name").value.trim();
  const phone = document.querySelector("#phone").value.trim();
  const terms = document.querySelector("#terms").checked;
  const nameOkay = fieldError("full-name", name.length >= 2 ? "" : "Enter your full name.");
  const phoneOkay = fieldError("phone", !phone || /[0-9]{7,}/.test(phone.replace(/\D/g, "")) ? "" : "Enter a complete phone number or leave it blank.");
  document.querySelector("#terms-error").textContent = terms ? "" : "Confirm the terms and prototype notice to continue.";
  if (!nameOkay) document.querySelector("#full-name").focus();
  else if (!phoneOkay) document.querySelector("#phone").focus();
  else if (!terms) document.querySelector("#terms").focus();
  return nameOkay && phoneOkay && terms;
}

function renderStep(step) {
  currentStep = step;
  document.querySelectorAll("[data-step]").forEach((panel) => {
    const active = Number(panel.dataset.step) === step;
    panel.hidden = !active;
    panel.classList.toggle("is-active", active);
  });
  document.querySelectorAll("[data-progress]").forEach((item) => item.classList.toggle("is-active", Number(item.dataset.progress) <= step));
  stepLabel.textContent = `Step ${step} of 2`;
  formTitle.textContent = step === 1 ? "Create your account" : "Confirm your profile";
  const focusTarget = step === 1 ? "#email" : "#full-name";
  document.querySelector(focusTarget).focus();
}

document.querySelector("#continue-button").addEventListener("click", () => {
  if (validateStepOne()) renderStep(2);
});

document.querySelector("#back-button").addEventListener("click", () => renderStep(1));

document.querySelector("#reveal-password").addEventListener("click", (event) => {
  const password = document.querySelector("#password");
  const revealing = password.type === "password";
  password.type = revealing ? "text" : "password";
  event.currentTarget.textContent = revealing ? "Hide" : "Show";
  event.currentTarget.setAttribute("aria-pressed", String(revealing));
});

document.querySelector("#signin-button").addEventListener("click", () => {
  showToast("Sign-in will connect to Obaid's production authentication flow. This review prototype stays offline.");
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!validateStepTwo()) return;
  form.reset();
  form.hidden = true;
  document.querySelector(".form-heading").hidden = true;
  successState.hidden = false;
  successState.querySelector("a").focus();
});

document.querySelector("#restart-button").addEventListener("click", () => {
  successState.hidden = true;
  document.querySelector(".form-heading").hidden = false;
  form.hidden = false;
  renderStep(1);
});

document.querySelectorAll("input").forEach((input) => {
  input.addEventListener("input", () => {
    input.setAttribute("aria-invalid", "false");
    const id = input.id === "full-name" ? "name" : input.id;
    const error = document.querySelector(`#${id}-error`);
    if (error) error.textContent = "";
  });
});

window.addEventListener("pageshow", () => {
  if (currentStep !== 1) renderStep(currentStep);
});
