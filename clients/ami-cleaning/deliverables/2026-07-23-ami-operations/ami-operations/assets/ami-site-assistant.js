(() => {
  const settings = window.AMI_SITE_ASSISTANT;
  if (!settings?.endpoint || document.getElementById("ami-assistant")) return;

  const staticForm = document.getElementById("walkForm");
  if (staticForm && !staticForm.dataset.amiOpsBound) {
    staticForm.dataset.amiOpsBound = "true";

    const staticButton = staticForm.querySelector('button[type="submit"]');
    const staticStatus = document.createElement("p");
    staticStatus.className = "ami-ops-static-status";
    staticStatus.setAttribute("role", "status");
    staticForm.appendChild(staticStatus);

    let staticSending = false;
    const sendStaticForm = async (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (staticSending || !staticForm.reportValidity()) return;

      staticSending = true;
      staticButton.disabled = true;
      staticStatus.className = "ami-ops-static-status is-sending";
      staticStatus.textContent = "Sending your walkthrough request...";

      const payload = new FormData(staticForm);
      payload.set("source_path", window.location.pathname);

      try {
        const response = await fetch(settings.endpoint, {
          method: "POST",
          body: payload,
          credentials: "same-origin",
        });
        const result = await response.json();
        if (!response.ok || !result.ok) throw new Error("Request failed");

        staticForm.reset();
        staticStatus.className = "ami-ops-static-status is-success";
        staticStatus.textContent =
          "Walkthrough requested. AMI will follow up within one business day.";
        if (typeof window.gtag === "function") {
          window.gtag("event", "generate_lead", {
            form_name: "ami_walkthrough_form",
            page_path: window.location.pathname,
          });
        }
      } catch {
        staticStatus.className = "ami-ops-static-status is-error";
        staticStatus.textContent = `We could not send that request. Please call ${settings.phone}.`;
      } finally {
        staticSending = false;
        staticButton.disabled = false;
      }
    };

    staticButton.addEventListener("click", sendStaticForm, true);
    staticForm.addEventListener("submit", sendStaticForm, true);
  }

  const services = {
    "Office and janitorial":
      "AMI builds recurring cleaning plans around your rooms, traffic, schedule, surfaces, and standards.",
    "Floor care and VCT":
      "AMI handles stripping, waxing, buffing, carpet, tile, grout, stone, and specialty surface care.",
    "Day porter":
      "Day porter support covers lobbies, restrooms, supplies, spills, and daytime traffic.",
    "Sanitation and disinfection":
      "AMI plans touchpoint, breakroom, and restroom service around how your facility is used.",
    "Construction cleanup":
      "AMI provides final cleanup, dust removal, and turnover-ready presentation.",
    "Windows and exterior":
      "AMI handles interior glass, storefront presentation, entrances, and selected exterior areas.",
  };

  const areas =
    "AMI serves Delaware, Eastern Maryland, and Southeastern Pennsylvania, including Wilmington, Newark, New Castle, Bear, Middletown, Lewes, Rehoboth Beach, Milford, Millsboro, Milton, West Chester, and Exton.";

  const root = document.createElement("section");
  root.id = "ami-assistant";
  root.className = "ami-assistant";
  root.innerHTML = `
    <button class="ami-assistant__launcher" type="button" aria-expanded="false" aria-controls="ami-assistant-panel">
      <span aria-hidden="true">✦</span>
      <span>Ask AMI</span>
    </button>
    <div class="ami-assistant__panel" id="ami-assistant-panel" role="dialog" aria-modal="false" aria-labelledby="ami-assistant-title" hidden>
      <header class="ami-assistant__header">
        <div>
          <p class="ami-assistant__eyebrow">AMI Commercial Cleaning</p>
          <h2 id="ami-assistant-title">How can we help?</h2>
        </div>
        <button class="ami-assistant__close" type="button" aria-label="Close assistant">×</button>
      </header>
      <div class="ami-assistant__conversation" aria-live="polite">
        <p class="ami-assistant__message">I can help you choose a service, check coverage, or request a walkthrough.</p>
        <div class="ami-assistant__choices">
          <button type="button" data-action="services">Explore services</button>
          <button type="button" data-action="areas">Check service area</button>
          <button type="button" data-action="walkthrough">Request a walkthrough</button>
          <a href="${settings.phoneHref}">Call ${settings.phone}</a>
        </div>
        <div class="ami-assistant__answer" hidden></div>
        <form class="ami-assistant__form" hidden>
          <label>Full name<input name="name" autocomplete="name" maxlength="100" required></label>
          <label>Company<input name="company" autocomplete="organization" maxlength="120"></label>
          <label>Email<input name="email" type="email" autocomplete="email" maxlength="160" required></label>
          <label>Phone<input name="phone" type="tel" autocomplete="tel" maxlength="40"></label>
          <label>Facility city<input name="city" autocomplete="address-level2" maxlength="100"></label>
          <label>Service need
            <select name="need">
              <option value="">Choose a service</option>
              ${Object.keys(services).map((service) => `<option>${service}</option>`).join("")}
            </select>
          </label>
          <label>What should AMI look at first?<textarea name="notes" rows="3" maxlength="1200"></textarea></label>
          <input name="ami_company_website" tabindex="-1" autocomplete="off" class="ami-assistant__trap" aria-hidden="true">
          <input name="source_path" type="hidden" value="${window.location.pathname}">
          <button class="ami-assistant__submit" type="submit">Request walkthrough</button>
          <p class="ami-assistant__status" role="status"></p>
        </form>
      </div>
    </div>
  `;
  document.body.appendChild(root);

  const launcher = root.querySelector(".ami-assistant__launcher");
  const panel = root.querySelector(".ami-assistant__panel");
  const close = root.querySelector(".ami-assistant__close");
  const answer = root.querySelector(".ami-assistant__answer");
  const form = root.querySelector(".ami-assistant__form");
  const status = root.querySelector(".ami-assistant__status");

  function setOpen(open) {
    panel.hidden = !open;
    launcher.setAttribute("aria-expanded", String(open));
    if (open) close.focus();
    else launcher.focus();
  }

  launcher.addEventListener("click", () => setOpen(panel.hidden));
  close.addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) setOpen(false);
  });

  root.addEventListener("click", (event) => {
    const action = event.target.closest("[data-action]")?.dataset.action;
    if (!action) return;

    form.hidden = action !== "walkthrough";
    answer.hidden = action === "walkthrough";

    if (action === "services") {
      answer.innerHTML = Object.entries(services)
        .map(([name, detail]) => `<h3>${name}</h3><p>${detail}</p>`)
        .join("");
    }
    if (action === "areas") {
      answer.innerHTML = `<h3>Regional coverage</h3><p>${areas}</p><p>If your facility is near the edge of the region, submit a walkthrough request and AMI will confirm availability.</p>`;
    }
    if (action === "walkthrough") {
      form.querySelector("input[name='name']").focus();
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const button = form.querySelector(".ami-assistant__submit");
    button.disabled = true;
    status.textContent = "Sending your request…";

    try {
      const response = await fetch(settings.endpoint, {
        method: "POST",
        body: new FormData(form),
        credentials: "same-origin",
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error("Request failed");

      form.reset();
      status.textContent = "Walkthrough requested. AMI will follow up within one business day.";
      if (typeof window.gtag === "function") {
        window.gtag("event", "generate_lead", {
          form_name: "ami_site_assistant",
          page_path: window.location.pathname,
        });
      }
    } catch {
      status.textContent = `We could not send that request. Please call ${settings.phone}.`;
    } finally {
      button.disabled = false;
    }
  });
})();
