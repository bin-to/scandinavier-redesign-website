(() => {
  const CATS = {
    inbetriebnahme: "Inbetriebnahme",
    handhabung: "Handhabung",
    wartung: "Wartung",
    scanner: "Fragen zum Scanner",
    schnittstellen: "Schnittstellen",
  };

  const article = document.querySelector("#guide-article");
  const guides = window.SCANDI_GUIDES || [];
  if (!article) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("a") || "";
  const guide = guides.find((item) => item.id === id && (item.blocks || item.href));
  const lightbox = document.querySelector(".guide-lightbox");
  const lightboxImg = lightbox?.querySelector("img");

  if (!guide || !guide.blocks) {
    const target = guide?.href;
    if (target) {
      window.location.replace(target);
      return;
    }
    document.title = "Anleitung nicht gefunden – SCANDINAVIER";
    article.innerHTML = `<div class="wrap guide-missing">
      <p class="eyebrow">Kurzanleitungen</p>
      <h1>Diese Anleitung gibt es hier nicht</h1>
      <p class="lede">Wählen Sie ein Thema aus der Übersicht.</p>
      <p><a class="btn btn-primary" href="support.html#anleitungen">Alle Anleitungen</a></p>
    </div>`;
    return;
  }

  document.title = `${guide.title} – SCANDINAVIER`;
  const cat = CATS[guide.category] || "";
  const related = guides.filter((item) => item.category === guide.category && item.id !== guide.id).slice(0, 4);

  article.innerHTML = `
    <div class="wrap">
      <header class="guide-hero">
        <p class="guide-crumb">
          <a href="support.html#anleitungen">Anleitungen</a>
          <span aria-hidden="true">/</span>
          <a href="support.html#anleitungen">${escapeHtml(cat)}</a>
        </p>
        <p class="eyebrow">${escapeHtml(cat)}</p>
        <h1>${escapeHtml(guide.title)}</h1>
        ${guide.tagline ? `<p class="lede">${escapeHtml(guide.tagline)}</p>` : ""}
      </header>
      <div class="guide-sheet">
        ${guide.blocks.map(renderBlock).join("")}
      </div>
      ${related.length ? `<section class="guide-related" aria-label="Weitere Anleitungen">
        <h2>Weitere Anleitungen</h2>
        <div class="guide-list">${related.map(card).join("")}</div>
      </section>` : ""}
    </div>`;

  article.querySelectorAll(".guide-shot").forEach((button) => {
    button.addEventListener("click", () => {
      if (!lightbox || !lightboxImg) return;
      lightboxImg.src = button.dataset.full || "";
      lightboxImg.alt = button.dataset.alt || "";
      if (typeof lightbox.showModal === "function") lightbox.showModal();
    });
  });
})();

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char]));
}

function rich(segments) {
  return (segments || []).map((segment, index) => {
    const text = escapeHtml(segment.text);
    const html = segment.href
      ? `<a href="${escapeHtml(segment.href)}"${/^https?:/i.test(segment.href) ? ' target="_blank" rel="noreferrer"' : ""}>${text}</a>`
      : text;
    if (!index) return html;
    const previous = segments[index - 1].text || "";
    const gap = /\s$/.test(previous) || /^\s/.test(segment.text || "") ? "" : " ";
    return gap + html;
  }).join("");
}

function imageSource(image) {
  if (typeof image === "string") return image;
  if (image && typeof image === "object") return image.src || "";
  return "";
}

function imageAlt(image, fallback) {
  if (image && typeof image === "object" && image.alt) return String(image.alt);
  return fallback || "";
}

function shotLayout(images, layout) {
  if (layout === "single" || layout === "pair" || layout === "compact") return layout;
  const count = Array.isArray(images) ? images.length : 0;
  if (count <= 1) return "single";
  if (count === 2) return "pair";
  return "compact";
}

function shotButton(image, fallbackAlt) {
  const src = imageSource(image);
  const alt = imageAlt(image, fallbackAlt);
  return `<button class="guide-shot" type="button" data-full="${escapeHtml(src)}" data-alt="${escapeHtml(alt)}">
    <img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async">
  </button>`;
}

function shots(images, alt, layout) {
  if (!images?.length) return "";
  const kind = shotLayout(images, layout);
  return `<div class="guide-shots guide-shots--${kind}">${images.map((image) => shotButton(image, alt)).join("")}</div>`;
}

function renderBlock(block) {
  if (block.type === "h2" || block.type === "h3") {
    const tag = block.type === "h3" ? "h3" : "h2";
    return `<${tag} class="guide-heading">${rich(block.segments)}</${tag}>`;
  }
  if (block.type === "p") return `<p class="guide-copy">${rich(block.segments)}</p>`;
  if (block.type === "list") {
    return `<ul class="guide-points">${block.items.map((item) => `<li>${rich(item)}</li>`).join("")}</ul>`;
  }
  if (block.type === "figures") {
    const kind = shotLayout(block.images, block.layout);
    return `<div class="guide-figures guide-figures--${kind}">${(block.images || []).map((image) => shotButton(image, "")).join("")}</div>`;
  }
  if (block.type === "steps") {
    return `<ol class="guide-flow">${block.items.map((step) => {
      const text = (step.segments || []).map((segment) => segment.text).join(" ");
      return `<li class="guide-flow__step">
        <div class="guide-flow__marker" aria-hidden="true">${escapeHtml(step.n)}</div>
        <div class="guide-flow__body">
          ${step.segments?.length ? `<p>${rich(step.segments)}</p>` : ""}
          ${shots(step.images, text, step.layout)}
        </div>
      </li>`;
    }).join("")}</ol>`;
  }
  return "";
}

function card(guide) {
  const cats = {
    inbetriebnahme: "Inbetriebnahme",
    handhabung: "Handhabung",
    wartung: "Wartung",
    scanner: "Scanner",
    schnittstellen: "Schnittstellen",
  };
  const href = guide.href || `anleitung.html?a=${encodeURIComponent(guide.id)}`;
  return `<a class="guide-link" data-category="${guide.category}" href="${href}">
    <span class="guide-link-main">
      <span class="guide-link-cat">${cats[guide.category] || ""}</span>
      <span class="guide-link-title">${escapeHtml(guide.title)}</span>
    </span>
    <span class="guide-link-action">Anleitung</span>
  </a>`;
}
