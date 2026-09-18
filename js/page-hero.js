(() => {
  /**
   * Seiten-Helo wie auf der Support-Seite (css/page-hero.css).
   * Inhalt über <template data-part="actions|stats|aside">.
   * Siehe components/page-hero.html
   */
  class ScandiPageHero extends HTMLElement {
    connectedCallback() {
      if (this.hasAttribute("data-rendered")) return;
      this.setAttribute("data-rendered", "");

      const eyebrow = this.getAttribute("eyebrow") ?? "";
      const title = this.getAttribute("title") ?? "";
      const tagline = this.getAttribute("tagline") ?? "";
      const lede = this.getAttribute("lede") ?? "";
      const asideLabel = this.getAttribute("aside-label") ?? "Kurzinfo";

      const taglineHtml = tagline
        ? `<span class="page-hero-tagline">${tagline}</span>`
        : "";

      const section = document.createElement("section");
      section.className = "page-hero";
      section.innerHTML = `
        <div class="wrap page-hero-grid">
          <div class="section-intro section-intro--hero page-hero-copy">
            <p class="eyebrow">${eyebrow}</p>
            <h1>${title}${taglineHtml}</h1>
            <p class="section-intro__lede lede">${lede}</p>
            <div data-mount="actions"></div>
            <div data-mount="stats"></div>
          </div>
          <aside class="page-hero-aside" aria-label="${asideLabel}" data-mount="aside"></aside>
        </div>
      `;

      const mount = (name, appendInto) => {
        const target = section.querySelector(`[data-mount="${name}"]`);
        const tpl = this.querySelector(`template[data-part="${name}"]`);
        if (!target) return;
        if (!tpl || !tpl.content.firstChild) {
          target.remove();
          return;
        }
        const content = tpl.content.cloneNode(true);
        if (appendInto) {
          target.appendChild(content);
          return;
        }
        target.replaceWith(content);
      };

      mount("actions");
      mount("stats");
      mount("aside", true);

      this.replaceWith(section);
    }
  }

  customElements.define("scandi-page-hero", ScandiPageHero);
})();
