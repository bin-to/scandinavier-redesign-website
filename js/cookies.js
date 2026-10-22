(() => {
  const KEY = "scandi_consent";
  const VERSION = 1;
  const MAX_AGE = 60 * 60 * 24 * 180;

  const banner = document.createElement("div");
  banner.className = "cookie-banner";
  banner.hidden = true;
  banner.setAttribute("role", "dialog");
  banner.setAttribute("aria-labelledby", "cookie-title");
  banner.setAttribute("aria-describedby", "cookie-text");
  banner.innerHTML = `
    <div class="cookie-banner__card">
      <p class="eyebrow">Datenschutz</p>
      <h2 id="cookie-title">Cookies</h2>
      <p class="cookie-banner__text" id="cookie-text">
        Wir speichern Ihre Auswahl in einem notwendigen Cookie. Statistik-Cookies werden erst gesetzt, wenn Sie zustimmen.
        Details stehen in der <a href="datenschutz.html">Datenschutzerklärung</a>.
      </p>
      <div class="cookie-banner__actions">
        <button class="btn btn-primary" type="button" data-cookie-accept>Alle akzeptieren</button>
        <button class="btn btn-ghost" type="button" data-cookie-reject>Nur notwendige</button>
      </div>
      <div class="cookie-banner__tools">
        <button class="cookie-text-btn" type="button" data-cookie-toggle aria-expanded="false" aria-controls="cookie-panel">Einstellungen</button>
        <button class="cookie-text-btn" type="button" data-cookie-close hidden>Schließen</button>
      </div>
      <div class="cookie-banner__panel" id="cookie-panel" hidden>
        <div class="cookie-choice">
          <div>
            <strong>Notwendig</strong>
            <p>Speichert nur diese Entscheidung, damit wir Sie nicht erneut fragen. Immer aktiv.</p>
          </div>
          <label class="cookie-switch">
            <input type="checkbox" checked disabled aria-label="Notwendige Cookies, immer aktiv">
            <span class="cookie-switch__track"></span>
          </label>
        </div>
        <div class="cookie-choice">
          <div>
            <strong>Statistik</strong>
            <p>Auswertung der Seitennutzung, zum Beispiel Google Analytics. Skripte dieser Kategorie laden erst nach Ihrer Einwilligung.</p>
          </div>
          <label class="cookie-switch">
            <input type="checkbox" data-cookie-statistik aria-label="Statistik-Cookies erlauben">
            <span class="cookie-switch__track"></span>
          </label>
        </div>
        <table class="cookie-table">
          <thead>
            <tr><th>Name</th><th>Zweck</th><th>Dauer</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>scandi_consent</td>
              <td>Speichert, ob Statistik-Cookies erlaubt sind.</td>
              <td>180 Tage</td>
            </tr>
          </tbody>
        </table>
        <button class="btn btn-dark cookie-banner__save" type="button" data-cookie-save>Auswahl speichern</button>
      </div>
    </div>
  `;

  const panel = banner.querySelector("#cookie-panel");
  const toggleBtn = banner.querySelector("[data-cookie-toggle]");
  const closeBtn = banner.querySelector("[data-cookie-close]");
  const statistikInput = banner.querySelector("[data-cookie-statistik]");

  function readRaw() {
    const fromCookie = document.cookie.split("; ").find((row) => row.startsWith(`${KEY}=`));
    if (fromCookie) return decodeURIComponent(fromCookie.slice(KEY.length + 1));
    try {
      return window.localStorage.getItem(KEY);
    } catch {
      return null;
    }
  }

  function readStored() {
    const raw = readRaw();
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.v !== VERSION || typeof parsed.statistik !== "boolean") return null;
      return parsed;
    } catch {
      return null;
    }
  }

  function writeStored(consent) {
    const value = encodeURIComponent(JSON.stringify(consent));
    const secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${KEY}=${value}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax${secure}`;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(consent));
    } catch {
      /* private mode */
    }
  }

  function activate(consent) {
    document.documentElement.dataset.cookieStatistik = consent.statistik ? "on" : "off";
    document.querySelectorAll("[data-cookie-src]").forEach((node) => {
      const category = node.getAttribute("data-cookie-category") || "necessary";
      const allowed = category === "necessary" || (category === "statistik" && consent.statistik);
      if (!allowed || node.dataset.cookieLoaded === "true") return;
      const src = node.getAttribute("data-cookie-src");
      if (!src) return;
      if (node.tagName === "SCRIPT") {
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        node.dataset.cookieLoaded = "true";
        node.replaceWith(script);
        return;
      }
      node.setAttribute("src", src);
      node.dataset.cookieLoaded = "true";
    });
    window.dispatchEvent(new CustomEvent("scandi:consent", { detail: consent }));
  }

  function save(statistik) {
    const consent = { v: VERSION, statistik: Boolean(statistik), ts: new Date().toISOString() };
    writeStored(consent);
    activate(consent);
    close();
    return consent;
  }

  function setPanel(open) {
    panel.hidden = !open;
    toggleBtn.setAttribute("aria-expanded", String(open));
    toggleBtn.textContent = open ? "Einstellungen ausblenden" : "Einstellungen";
  }

  function open(options = {}) {
    const stored = readStored();
    statistikInput.checked = Boolean(stored?.statistik);
    closeBtn.hidden = !stored;
    setPanel(Boolean(options.settings) || Boolean(stored));
    banner.hidden = false;
    document.body.classList.add("cookie-open");
    if (options.focus) banner.querySelector("[data-cookie-accept]").focus();
  }

  function close() {
    banner.hidden = true;
    document.body.classList.remove("cookie-open");
  }

  banner.querySelector("[data-cookie-accept]").addEventListener("click", () => save(true));
  banner.querySelector("[data-cookie-reject]").addEventListener("click", () => save(false));
  banner.querySelector("[data-cookie-save]").addEventListener("click", () => save(statistikInput.checked));
  toggleBtn.addEventListener("click", () => setPanel(panel.hidden));
  closeBtn.addEventListener("click", close);

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-cookie-settings]");
    if (!trigger) return;
    event.preventDefault();
    open({ settings: true, focus: true });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !banner.hidden && readStored()) close();
  });

  function mountSettingsLink() {
    document.querySelectorAll(".legal").forEach((bar) => {
      if (bar.querySelector("[data-cookie-settings]")) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "cookie-settings-link";
      button.setAttribute("data-cookie-settings", "");
      button.textContent = "Cookie-Einstellungen";
      bar.appendChild(button);
    });
  }

  document.body.appendChild(banner);
  mountSettingsLink();

  const stored = readStored();
  if (stored) activate(stored);
  else open();

  window.ScandiConsent = {
    get: readStored,
    open: () => open({ settings: true, focus: true }),
    allows(category) {
      if (category === "necessary") return true;
      const current = readStored();
      return Boolean(current && current[category]);
    },
  };
})();
