(() => {
  const NAV = [
    { id: "einrichtung", label: "Einrichtung", href: "einrichtung.html" },
    { id: "modelle", label: "Modelle", hash: "#modelle" },
    { id: "faq", label: "FAQs", hash: "#faq" },
    { id: "support", label: "Support", href: "support.html" },
    { id: "bestellen", label: "Bestellen", href: "bestellformular.html" },
    { id: "kontakt", label: "Kontakt", href: "kontakt.html" },
  ];

  function navHref(item, home) {
    if (item.href) return item.href;
    return home ? item.hash : `index.html${item.hash}`;
  }

  function renderSiteHeader(el) {
    const home = el.hasAttribute("home");
    const active = el.getAttribute("active") || "";
    const ghostHref = el.getAttribute("cta-ghost-href") || (home ? "#modelle" : "support.html");
    const ghostLabel = el.getAttribute("cta-ghost-label") || (home ? "Modelle vergleichen" : "Support");
    const primaryHref = el.getAttribute("cta-primary-href") || "kontakt.html";
    const primaryLabel = el.getAttribute("cta-primary-label") || "Jetzt bestellen";
    const brandHref = home ? "#hero" : "index.html";

    const header = document.createElement("header");
    header.className = "site-header";

    const navLinks = NAV.map((item) => {
      const href = navHref(item, home);
      const isCurrent = item.id === active;
      const current = isCurrent ? ' class="is-current" aria-current="page"' : "";
      return `<a href="${href}"${current}>${item.label}</a>`;
    }).join("");

    header.innerHTML = `
      <div class="wrap">
        <a class="brand" href="${brandHref}" aria-label="SCANDINAVIER Start">
          <img class="brand-logo" src="media/homepage/logos/scandinavier-wordmark.png" alt="SCANDINAVIER">
        </a>
        <nav class="nav" aria-label="Hauptnavigation">${navLinks}</nav>
        <div class="header-cta">
          <a class="btn btn-ghost" href="${ghostHref}">${ghostLabel}</a>
          <a class="btn btn-primary" href="${primaryHref}">${primaryLabel}</a>
          <button class="nav-toggle" type="button" aria-expanded="false" aria-label="Menü öffnen"><span></span><span></span><span></span></button>
        </div>
      </div>
    `;

    el.replaceWith(header);
  }

  document.querySelectorAll("scandi-site-header").forEach(renderSiteHeader);
})();
