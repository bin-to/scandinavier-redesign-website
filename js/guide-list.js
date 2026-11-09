(() => {
  const PAGE_SIZE = 12;
  const CATS = {
    inbetriebnahme: "Inbetriebnahme",
    handhabung: "Handhabung",
    wartung: "Wartung",
    scanner: "Scanner",
    schnittstellen: "Schnittstellen",
  };

  const roots = document.querySelectorAll("[data-guide-list]");
  const guides = window.SCANDI_GUIDES || [];
  if (!roots.length || !guides.length) return;

  let page = 1;

  roots.forEach((root) => {
    const panel = root.closest(".guides-panel") || root.parentElement;
    const empty = panel.querySelector("[data-guide-empty]");
    const pager = document.createElement("nav");
    pager.className = "guide-pager";
    pager.hidden = true;
    pager.setAttribute("aria-label", "Weitere Anleitungen");
    (empty || root).insertAdjacentElement("afterend", pager);
    pager.addEventListener("click", (event) => {
      const button = event.target.closest("[data-page]");
      if (!button || button.disabled) return;
      const value = button.dataset.page;
      if (value === "prev") page -= 1;
      else if (value === "next") page += 1;
      else page = Number(value);
      render(true);
    });
  });

  function matches(guide, category, query) {
    if (category !== "all" && guide.category !== category) return false;
    if (query.length < 2) return true;
    const label = CATS[guide.category] || guide.category || "";
    return `${guide.title} ${label}`.toLowerCase().includes(query);
  }

  function render(scrollToList) {
    const section = document.querySelector(".guides") || document;
    const category = section.querySelector(".guide-filter.is-active")?.dataset.filter || "all";
    const query = (section.querySelector("#guide-search")?.value || "").trim().toLowerCase();
    const matched = guides.filter((guide) => matches(guide, category, query));
    const paginate = category === "all" && query.length < 2 && matched.length > PAGE_SIZE;
    const pageSize = paginate ? PAGE_SIZE : matched.length || 1;
    const pages = Math.max(1, Math.ceil(matched.length / pageSize));
    page = Math.min(Math.max(page, 1), pages);
    const start = (page - 1) * pageSize;
    const slice = matched.slice(start, start + pageSize);

    roots.forEach((root) => {
      root.innerHTML = slice.map(cardHtml).join("");
      const panel = root.closest(".guides-panel") || root.parentElement;
      const empty = panel.querySelector("[data-guide-empty]");
      if (empty) empty.hidden = matched.length !== 0;
      const pager = panel.querySelector(".guide-pager");
      if (pager) fillPager(pager, { paginate, page, pages, total: matched.length, start, count: slice.length });
    });

    if (scrollToList) {
      document.querySelector(".guides-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function cardHtml(guide) {
    const href = guide.href || `anleitung.html?a=${encodeURIComponent(guide.id)}`;
    const label = CATS[guide.category] || guide.category;
    return `<a class="guide-link" data-category="${escapeHtml(guide.category)}" href="${href}">
      <span class="guide-link-main">
        <span class="guide-link-cat">${escapeHtml(label)}</span>
        <span class="guide-link-title">${escapeHtml(guide.title)}</span>
      </span>
      <span class="guide-link-action">Anleitung</span>
    </a>`;
  }

  function fillPager(pager, state) {
    if (!state.paginate) {
      pager.hidden = true;
      pager.innerHTML = "";
      return;
    }
    const from = state.start + 1;
    const to = state.start + state.count;
    const numbers = Array.from({ length: state.pages }, (_, index) => {
      const number = index + 1;
      const current = number === state.page ? ' aria-current="page"' : "";
      return `<button type="button" data-page="${number}"${current}>${number}</button>`;
    }).join("");
    pager.hidden = false;
    pager.innerHTML = `
      <p class="guide-pager-status">${from}–${to} von ${state.total} Anleitungen</p>
      <div class="guide-pager-controls">
        <button type="button" data-page="prev"${state.page === 1 ? " disabled" : ""}>Zurück</button>
        ${numbers}
        <button type="button" data-page="next"${state.page === state.pages ? " disabled" : ""}>Weiter</button>
      </div>`;
  }

  document.querySelectorAll(".guide-filter").forEach((filter) => {
    filter.addEventListener("click", () => {
      document.querySelectorAll(".guide-filter").forEach((item) => {
        const on = item === filter;
        item.classList.toggle("is-active", on);
        item.setAttribute("aria-selected", String(on));
      });
      page = 1;
      render(false);
    });
  });

  document.querySelector("#guide-search")?.addEventListener("input", () => {
    page = 1;
    render(false);
  });

  render(false);
})();

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char]));
}
