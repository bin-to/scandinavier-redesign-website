(() => {
  const form = document.querySelector("#scanner-order-form");
  if (!form) return;

  const MAX_QTY = 4;
  const totalDesktop = document.querySelector("#order-live-total");
  const totalMobile = document.querySelector("#order-live-total-mobile");
  const cartLines = document.querySelector("#order-cart-lines");
  const cartEmpty = document.querySelector("#order-cart-empty");

  const SCANNERS = {
    a355: {
      title: "SCANDINAVIER comfort (A355 Pro)",
      price: 99500,
      image: "media/a355/a355-hero.png",
    },
    a350: {
      title: "SCANDINAVIER comfort (A350)",
      price: 97500,
      image: "media/order/a280-product.png",
    },
    a650: {
      title: "SCANDINAVIER kanzlei",
      price: 169900,
      image: "media/order/a650-product.jpg",
    },
    a450: {
      title: "SCANDINAVIER next",
      price: 119900,
      image: "media/order/a450-product.jpg",
    },
    a280: {
      title: "SCANDINAVIER classic",
      price: 78500,
      image: "media/order/a280-product.png",
    },
  };

  const PRICES = {
    personalakte: 9900,
    software: 9900,
    cable: 500,
    premium: 17500,
    remote: 3750,
  };

  const cards = new Map();
  form.querySelectorAll("[data-scanner-card]").forEach((card) => {
    const id = card.dataset.scannerCard;
    cards.set(id, {
      card,
      hidden: card.querySelector("[data-scanner-qty]"),
      display: card.querySelector("[data-qty-display]"),
      dec: card.querySelector(`[data-qty-dec="${id}"]`),
      inc: card.querySelector(`[data-qty-inc="${id}"]`),
    });
  });

  const personalakteChecks = form.querySelectorAll("[data-personalakte]");
  const softwareChecks = form.querySelectorAll("[data-software]");
  const premiumRadios = form.querySelectorAll('input[name="premium-plus"]');
  const softwareLaterRadios = form.querySelectorAll('input[name="software-nachtraeglich"]');
  const cableRadios = form.querySelectorAll('input[name="netzwerkkabel"]');
  const remoteRadios = form.querySelectorAll('input[name="fernwartung"]');
  const premiumOption = document.querySelector("#premium-option");
  const premiumHint = document.querySelector("#premium-hint");
  const garantieBtn = document.querySelector(".info-tip");
  const garantiePanel = document.querySelector("#garantie-info");

  const lieferToggle = document.querySelector("#liefer-wie-rechnung");
  const lieferBlock = document.querySelector("#lieferadresse-block");
  const notifyCheck = document.querySelector("#ansprechpartner-mail");
  const notifyEmail = document.querySelector("#email-ansprechpartner");

  const state = new Map();

  function formatEuro(cents) {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(cents / 100);
  }

  function getQty(id) {
    return state.get(id) || 0;
  }

  function syncCardUI(id, qty) {
    const entry = cards.get(id);
    if (!entry) return;
    if (entry.hidden) entry.hidden.value = String(qty);
    if (entry.display) entry.display.textContent = String(qty);
    entry.card.classList.toggle("is-active", qty > 0);
    if (entry.dec) entry.dec.disabled = qty <= 0;
    if (entry.inc) entry.inc.disabled = qty >= MAX_QTY;
  }

  function setQty(id, qty) {
    const next = Math.max(0, Math.min(MAX_QTY, qty));
    if (next === 0) state.delete(id);
    else state.set(id, next);
    cards.forEach((_, key) => syncCardUI(key, getQty(key)));
    render();
  }

  function radioYes(group) {
    const picked = [...group].find((r) => r.checked);
    return picked?.value === "ja";
  }

  function addonLines(checks, price, label) {
    const lines = [];
    checks.forEach((box) => {
      if (!box.checked) return;
      const id = box.dataset.personalakte || box.dataset.software;
      const qty = getQty(id);
      if (qty <= 0) return;
      const lineSum = price * qty;
      lines.push({
        title: `${label} · ${SCANNERS[id]?.title || id}`,
        qty,
        lineSum,
      });
    });
    return lines;
  }

  function onlyKanzlei() {
    const kanzlei = getQty("a650") > 0;
    const others = [...state.keys()].some((id) => id !== "a650");
    return kanzlei && !others;
  }

  function syncPremium() {
    const kanzlei = getQty("a650") > 0;
    const locked = onlyKanzlei();
    premiumOption?.classList.toggle("is-included", locked);
    premiumRadios.forEach((radio) => {
      radio.disabled = locked;
      if (locked && radio.value === "nein") radio.checked = true;
    });
    if (!premiumHint) return;
    if (!kanzlei) {
      premiumHint.hidden = true;
      return;
    }
    premiumHint.hidden = false;
    premiumHint.textContent = locked
      ? "Beim SCANDINAVIER kanzlei bereits inklusive."
      : "Beim kanzlei bereits inklusive. Die Option gilt für die weiteren Geräte.";
  }

  function computeTotal() {
    let total = 0;
    const lineItems = [];
    const extras = [];

    state.forEach((qty, id) => {
      const product = SCANNERS[id];
      if (!product || qty <= 0) return;
      const lineSum = product.price * qty;
      total += lineSum;
      lineItems.push({ id, qty, product, lineSum });
    });

    addonLines(softwareChecks, PRICES.software, "Software").forEach((line) => {
      total += line.lineSum;
      extras.push(line);
    });
    addonLines(personalakteChecks, PRICES.personalakte, "DATEV Personalakte").forEach((line) => {
      total += line.lineSum;
      extras.push(line);
    });

    if (radioYes(softwareLaterRadios)) {
      total += PRICES.software;
      extras.push({
        title: "Software nachträglich",
        qty: 1,
        lineSum: PRICES.software,
      });
    }
    if (radioYes(cableRadios)) total += PRICES.cable;
    if (radioYes(premiumRadios) && !onlyKanzlei()) total += PRICES.premium;
    if (radioYes(remoteRadios)) total += PRICES.remote;

    return { total, lineItems, extras };
  }

  function render() {
    syncPremium();
    const { total, lineItems, extras } = computeTotal();
    const formatted = formatEuro(total);

    if (totalDesktop) totalDesktop.textContent = formatted;
    if (totalMobile) totalMobile.textContent = formatted;

    if (!cartLines || !cartEmpty) return;

    if (!lineItems.length && !extras.length) {
      cartLines.hidden = true;
      cartLines.innerHTML = "";
      cartEmpty.hidden = false;
      return;
    }

    cartEmpty.hidden = true;
    cartLines.hidden = false;
    const scannerHtml = lineItems
      .map(
        ({ product, qty, lineSum }) => `
        <div class="order-cart__line">
          <div class="order-cart__line-thumb">
            <img src="${product.image}" alt="">
          </div>
          <div>
            <strong>${product.title}</strong>
            <span>${qty}× · ${formatEuro(lineSum)}</span>
          </div>
        </div>`,
      )
      .join("");
    const extraHtml = extras
      .map(
        ({ title, qty, lineSum }) => `
        <div class="order-cart__line order-cart__line--extra">
          <div>
            <strong>${title}</strong>
            <span>${qty}× · ${formatEuro(lineSum)}</span>
          </div>
        </div>`,
      )
      .join("");
    cartLines.innerHTML = scannerHtml + extraHtml;
  }

  function syncLiefer() {
    if (!lieferBlock || !lieferToggle) return;
    const hide = lieferToggle.checked;
    lieferBlock.hidden = hide;
    lieferBlock.querySelectorAll("input").forEach((input) => {
      input.required = !hide && input.dataset.lieferRequired === "true";
    });
  }

  function syncNotifyEmail() {
    if (!notifyEmail || !notifyCheck) return;
    notifyEmail.required = notifyCheck.checked;
  }

  document.addEventListener("click", (event) => {
    const dec = event.target.closest("[data-qty-dec]");
    const inc = event.target.closest("[data-qty-inc]");
    if (dec && form.contains(dec)) {
      setQty(dec.dataset.qtyDec, getQty(dec.dataset.qtyDec) - 1);
    }
    if (inc && form.contains(inc)) {
      setQty(inc.dataset.qtyInc, getQty(inc.dataset.qtyInc) + 1);
    }
  });

  [...personalakteChecks, ...softwareChecks, ...premiumRadios, ...softwareLaterRadios, ...cableRadios, ...remoteRadios].forEach(
    (el) => el.addEventListener("change", render),
  );

  garantieBtn?.addEventListener("click", () => {
    if (!garantiePanel) return;
    const open = garantiePanel.hidden;
    garantiePanel.hidden = !open;
    garantieBtn.setAttribute("aria-expanded", String(open));
  });

  lieferToggle?.addEventListener("change", syncLiefer);
  notifyCheck?.addEventListener("change", syncNotifyEmail);

  cards.forEach((_, id) => syncCardUI(id, 0));
  syncLiefer();
  syncNotifyEmail();
  render();

  const hashTarget = location.hash ? document.querySelector(location.hash) : null;
  if (hashTarget?.classList.contains("scanner-card")) {
    hashTarget.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (state.size === 0 && !radioYes(softwareLaterRadios)) {
      window.alert("Bitte wählen Sie mindestens einen Scanner oder die Software nachträglich.");
      document.querySelector(".scanner-grid")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    const agb = form.querySelector("#agb-akzeptiert");
    if (agb && !agb.checked) {
      agb.focus();
      return;
    }

    const consent = form.querySelector("[data-consent]");
    if (consent && !consent.checked) {
      consent.focus();
      return;
    }

    form.classList.add("is-sent");
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  });
})();
