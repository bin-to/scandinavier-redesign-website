(() => {

  const products = new Map();

  document.querySelectorAll("[data-part]").forEach((card) => {

    products.set(card.dataset.part, {

      id: card.dataset.part,

      title: card.dataset.title,

      price: Number(card.dataset.price),

      image: card.querySelector(".part-media img")?.getAttribute("src") || "",

      card,

      orderRow: document.querySelector(`[data-order-row="${card.dataset.part}"]`),

    });

  });



  const cartLines = document.querySelector("#cart-lines");

  const cartTotal = document.querySelector("#cart-total");

  const cartEmpty = document.querySelector("#cart-empty");

  const orderFormTotal = document.querySelector("#order-form-total");

  const orderEmptyHint = document.querySelector("#order-empty-hint");

  const checkoutBtn = document.querySelector("#checkout-scroll");

  const form = document.querySelector("#parts-form");



  const state = new Map();



  function formatEuro(cents) {

    return new Intl.NumberFormat("de-DE", {

      style: "currency",

      currency: "EUR",

    }).format(cents / 100);

  }



  function updateOrderSums(total) {

    products.forEach((product, id) => {

      const sumEl = document.querySelector(`[data-order-sum="${id}"]`);

      const qty = state.get(id) || 0;

      if (sumEl) {

        sumEl.textContent = qty > 0 ? formatEuro(product.price * qty) : "—";

      }

    });

    if (orderFormTotal) orderFormTotal.textContent = formatEuro(total);

    if (orderEmptyHint) orderEmptyHint.classList.toggle("is-hidden", state.size > 0);

  }



  function renderCart() {

    cartLines.innerHTML = "";

    let total = 0;

    const entries = [...state.entries()].filter(([, qty]) => qty > 0);



    if (!entries.length) {

      cartEmpty.hidden = false;

      cartTotal.textContent = formatEuro(0);

      products.forEach((product) => {

        const toggle = product.card.querySelector("[data-part-toggle]");

        if (toggle) toggle.textContent = "Hinzufügen";

        product.card.classList.remove("is-selected");

        product.orderRow?.classList.remove("is-visible");

        syncQtyField(product.orderRow, 0);

      });

      updateOrderSums(0);

      return;

    }



    cartEmpty.hidden = true;



    entries.forEach(([id, qty]) => {

      const product = products.get(id);

      total += product.price * qty;



      const line = document.createElement("div");

      line.className = "cart-line";

      line.innerHTML = `

        <div class="cart-line-thumb">

          <img src="${product.image}" alt="">

        </div>

        <div class="cart-line-copy">

          <strong>${product.title}</strong>

          ${formatEuro(product.price)} · ${qty}×

        </div>

      `;



      const stepper = document.createElement("div");

      stepper.className = "qty-stepper";

      stepper.innerHTML = `

        <button type="button" data-qty-dec="${id}" aria-label="Menge verringern">−</button>

        <span>${qty}</span>

        <button type="button" data-qty-inc="${id}" aria-label="Menge erhöhen">+</button>

      `;

      line.appendChild(stepper);

      cartLines.appendChild(line);



      product.card.classList.add("is-selected");

      product.orderRow?.classList.add("is-visible");

      syncQtyField(product.orderRow, qty);

    });



    products.forEach((product, id) => {

      const qty = state.get(id) || 0;

      const toggle = product.card.querySelector("[data-part-toggle]");

      if (toggle) toggle.textContent = qty > 0 ? "Entfernen" : "Hinzufügen";

      if (!qty) {

        product.card.classList.remove("is-selected");

        product.orderRow?.classList.remove("is-visible");

        syncQtyField(product.orderRow, 0);

      }

    });



    cartTotal.textContent = formatEuro(total);

    updateOrderSums(total);

  }



  function syncQtyField(row, qty) {

    const input = row?.querySelector("[data-qty-field]");

    const display = row?.querySelector("[data-qty-display]");

    if (input) input.value = String(qty);

    if (display) display.textContent = String(qty);

  }



  function setQty(id, qty) {

    const next = Math.max(0, Math.min(4, qty));

    if (next === 0) state.delete(id);

    else state.set(id, next);

    renderCart();

  }



  document.querySelectorAll("[data-part-toggle]").forEach((btn) => {

    btn.addEventListener("click", () => {

      const id = btn.dataset.partToggle;

      const current = state.get(id) || 0;

      setQty(id, current > 0 ? 0 : 1);

    });

  });



  document.addEventListener("click", (event) => {

    const dec = event.target.closest("[data-qty-dec]");

    const inc = event.target.closest("[data-qty-inc]");

    if (dec) setQty(dec.dataset.qtyDec, (state.get(dec.dataset.qtyDec) || 0) - 1);

    if (inc) setQty(inc.dataset.qtyInc, (state.get(inc.dataset.qtyInc) || 0) + 1);

  });



  checkoutBtn?.addEventListener("click", () => {

    document.querySelector("#bestellung")?.scrollIntoView({ behavior: "smooth" });

  });



  form?.addEventListener("submit", (event) => {

    event.preventDefault();

    if (!state.size) {

      document.querySelector("#ersatzteile")?.scrollIntoView({ behavior: "smooth" });

      return;

    }

    form.classList.add("is-sent");

  });



  renderCart();

})();

