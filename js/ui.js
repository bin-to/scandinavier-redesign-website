(() => {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  const contactForms = document.querySelectorAll(".contact-form");
  const modal = document.querySelector(".modal");
  const modalFrame = document.querySelector(".modal iframe");

  window.addEventListener("scroll", () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 8);
  });

  toggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => nav.classList.remove("is-open"));
  });

  document.querySelectorAll("[data-topic-picker]").forEach((picker) => {
    const field = picker.querySelector("[data-topic-field]");
    const options = [...picker.querySelectorAll(".topic-option")];

    const select = (btn) => {
      options.forEach((option) => {
        const active = option === btn;
        option.classList.toggle("is-active", active);
        option.setAttribute("aria-checked", String(active));
      });
      if (field) field.value = btn.dataset.topicValue || "";
    };

    options.forEach((btn, index) => {
      btn.addEventListener("click", () => select(btn));
      btn.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
        event.preventDefault();
        const delta = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
        const next = options[(index + delta + options.length) % options.length];
        next.focus();
        select(next);
      });
    });
  });

  contactForms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const consent = form.querySelector("[data-consent]");
      if (consent && !consent.checked) {
        consent.focus();
        return;
      }
      form.classList.add("is-sent");
    });
  });

  function closeModal() {
    modal?.classList.remove("is-open");
    if (modalFrame) modalFrame.src = "";
  }

  document.querySelectorAll("[data-video]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.video;
      modalFrame.src = `https://www.youtube.com/embed/${id}?autoplay=1`;
      modal.classList.add("is-open");
    });
  });

  document.querySelector(".modal-close")?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });
})();
