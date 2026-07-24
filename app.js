(() => {
  const appEl = document.getElementById("app");
  const breadcrumbEl = document.getElementById("breadcrumb");
  const btnBack = document.getElementById("btn-back");
  const btnRestart = document.getElementById("btn-restart");
  const lightboxEl = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxClose = document.getElementById("lightbox-close");

  let currentId = "start";
  const history = [];
  let lightboxTrigger = null;

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function emphasizeStep(step, emphasis = []) {
    let html = escapeHtml(step);
    for (const phrase of emphasis) {
      const safe = escapeHtml(phrase);
      html = html.replace(
        safe,
        `<span class="emphasis">${safe}</span>`
      );
    }
    return html;
  }

  function renderSteps(node) {
    if (!node.steps?.length) return "";
    const items = node.steps
      .map((step) => {
        const text = typeof step === "string" ? step : step.text;
        const image =
          typeof step === "object" && step.image
            ? `<button
                type="button"
                class="step-image-btn"
                data-lightbox-src="${escapeHtml(step.image)}"
                data-lightbox-alt="${escapeHtml(step.imageAlt || "")}"
              >
                <img
                  class="step-image"
                  src="${escapeHtml(step.image)}"
                  alt="${escapeHtml(step.imageAlt || "")}"
                />
                <span class="step-image-hint">Tap to enlarge</span>
              </button>`
            : "";
        return `<li>${emphasizeStep(text, node.emphasis)}${image}</li>`;
      })
      .join("");
    return `<ol class="step-list">${items}</ol>`;
  }

  function openLightbox(src, alt, trigger) {
    if (!lightboxEl || !lightboxImage) return;
    lightboxTrigger = trigger || null;
    lightboxImage.src = src;
    lightboxImage.alt = alt || "";
    lightboxEl.hidden = false;
    document.body.classList.add("lightbox-open");
    lightboxClose?.focus();
  }

  function closeLightbox() {
    if (!lightboxEl || lightboxEl.hidden) return;
    lightboxEl.hidden = true;
    lightboxImage.removeAttribute("src");
    lightboxImage.alt = "";
    document.body.classList.remove("lightbox-open");
    if (lightboxTrigger) {
      lightboxTrigger.focus();
      lightboxTrigger = null;
    }
  }

  function renderExamples(node) {
    if (!node.examples?.length) return "";
    const items = node.examples
      .map((ex) => `<li>${escapeHtml(ex)}</li>`)
      .join("");
    return `
      <div class="examples">
        <p class="examples-label">Examples of contactable</p>
        <ul>${items}</ul>
      </div>
    `;
  }

  function renderOptions(node) {
    if (!node.options?.length) return "";
    const buttons = node.options
      .map(
        (opt, i) => `
        <button
          type="button"
          class="btn btn-choice"
          data-next="${escapeHtml(opt.next)}"
        >
          ${escapeHtml(opt.label)}
        </button>`
      )
      .join("");
    return `<div class="choices" role="group" aria-label="Options">${buttons}</div>`;
  }

  function renderContinue(node) {
    if (node.type === "actions" || !node.next) return "";
    const label = node.continueLabel || "Continue";
    return `
      <div class="continue-row">
        <button type="button" class="btn btn-primary" data-next="${escapeHtml(node.next)}">
          ${escapeHtml(label)}
        </button>
      </div>
    `;
  }

  function renderActionsFooter(node) {
    if (node.type !== "actions") return "";
    return `
      <div class="continue-row">
        <p class="done-label">Follow these steps, then you are done with this guide.</p>
        <button type="button" class="btn btn-primary" id="btn-done-restart">
          Start over
        </button>
      </div>
    `;
  }

  function buildBreadcrumb() {
    const trail = [...history, currentId]
      .map((id) => FLOW[id]?.breadcrumb)
      .filter(Boolean);

    const unique = [];
    for (const label of trail) {
      if (unique[unique.length - 1] !== label) unique.push(label);
    }

    if (!unique.length) {
      breadcrumbEl.innerHTML = "";
      return;
    }

    breadcrumbEl.innerHTML = unique
      .map((label, i) => {
        const current = i === unique.length - 1;
        return `<span class="crumb${current ? " crumb-current" : ""}">${escapeHtml(label)}</span>`;
      })
      .join('<span class="crumb-sep" aria-hidden="true">→</span>');
  }

  function render(nodeId) {
    const node = FLOW[nodeId];
    if (!node) {
      console.error(`Unknown node: ${nodeId}`);
      return;
    }

    currentId = nodeId;
    btnBack.disabled = history.length === 0;
    buildBreadcrumb();

    const typeClass = `screen screen-${node.type}`;
    const prompt = node.prompt
      ? `<p class="prompt">${escapeHtml(node.prompt)}</p>`
      : "";

    appEl.innerHTML = `
      <section class="${typeClass}">
        <h1 class="screen-title">${escapeHtml(node.title)}</h1>
        ${prompt}
        ${renderExamples(node)}
        ${renderSteps(node)}
        ${renderOptions(node)}
        ${renderContinue(node)}
        ${renderActionsFooter(node)}
      </section>
    `;

    appEl.querySelectorAll("[data-next]").forEach((btn) => {
      btn.addEventListener("click", () => goTo(btn.dataset.next));
    });

    appEl.querySelectorAll("[data-lightbox-src]").forEach((btn) => {
      btn.addEventListener("click", () => {
        openLightbox(btn.dataset.lightboxSrc, btn.dataset.lightboxAlt, btn);
      });
    });

    const doneRestart = document.getElementById("btn-done-restart");
    if (doneRestart) {
      doneRestart.addEventListener("click", restart);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goTo(nextId) {
    if (!FLOW[nextId]) return;
    history.push(currentId);
    render(nextId);
  }

  function goBack() {
    const prev = history.pop();
    if (prev) render(prev);
  }

  function restart() {
    history.length = 0;
    render("start");
  }

  btnBack.addEventListener("click", goBack);
  btnRestart.addEventListener("click", restart);

  lightboxClose?.addEventListener("click", (e) => {
    e.stopPropagation();
    closeLightbox();
  });

  lightboxEl?.addEventListener("click", (e) => {
    if (e.target === lightboxEl) closeLightbox();
  });

  lightboxImage?.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });

  render("start");
})();
