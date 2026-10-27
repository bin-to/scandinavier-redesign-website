(() => {
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

  const html = guides.map((guide) => {
    const href = guide.href || `anleitung.html?a=${encodeURIComponent(guide.id)}`;
    const label = CATS[guide.category] || guide.category;
    return `<a class="guide-link" data-category="${guide.category}" href="${href}">
      <span class="guide-link-main">
        <span class="guide-link-cat">${label}</span>
        <span class="guide-link-title">${escapeHtml(guide.title)}</span>
      </span>
      <span class="guide-link-action">Anleitung</span>
    </a>`;
  }).join("");

  roots.forEach((root) => {
    root.innerHTML = html;
  });

  function apply() {
    const cat = document.querySelector(".guide-filter.is-active")?.dataset.filter || "all";
    const query = (document.querySelector("#guide-search")?.value || "").trim().toLowerCase();
    let visible = 0;
    document.querySelectorAll("[data-guide-list] .guide-link").forEach((link) => {
      const catOk = cat === "all" || link.dataset.category === cat;
      const text = link.querySelector(".guide-link-title")?.textContent.toLowerCase() || "";
      const queryOk = query.length < 2 || text.includes(query);
      const show = catOk && queryOk;
      link.classList.toggle("is-hidden", !show);
      if (show) visible += 1;
    });
    document.querySelectorAll("[data-guide-empty]").forEach((node) => {
      node.hidden = visible !== 0;
    });
  }

  document.querySelectorAll(".guide-filter").forEach((filter) => {
    filter.addEventListener("click", () => {
      document.querySelectorAll(".guide-filter").forEach((item) => {
        const on = item === filter;
        item.classList.toggle("is-active", on);
        item.setAttribute("aria-selected", String(on));
      });
      apply();
    });
  });

  document.querySelector("#guide-search")?.addEventListener("input", apply);
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
