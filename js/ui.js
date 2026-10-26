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

  let menuScrollY = 0;

  const setMenuOpen = (open) => {
    nav?.classList.toggle("is-open", open);
    toggle?.setAttribute("aria-expanded", String(open));
    toggle?.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    document.body.classList.toggle("nav-open", open);
    if (open) {
      menuScrollY = window.scrollY;
      document.body.style.top = `-${menuScrollY}px`;
      return;
    }
    document.body.style.top = "";
    window.scrollTo(0, menuScrollY);
  };

  toggle?.addEventListener("click", () => {
    setMenuOpen(!nav?.classList.contains("is-open"));
  });

  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      setMenuOpen(false);
    });
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

  const modalVideo = document.querySelector(".modal video");

  function closeModal() {
    modal?.classList.remove("is-open");
    if (modalFrame) {
      modalFrame.src = "";
      modalFrame.hidden = true;
    }
    if (modalVideo) {
      modalVideo.pause();
      modalVideo.removeAttribute("src");
      modalVideo.load();
      modalVideo.hidden = true;
    }
  }

  document.querySelectorAll("[data-video], [data-video-file]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!modal) return;
      const file = btn.dataset.videoFile;
      if (file && modalVideo) {
        if (modalFrame) modalFrame.hidden = true;
        modal.classList.add("is-open");
        modalVideo.hidden = false;
        modalVideo.poster = btn.dataset.videoPoster || "";
        const start = () => {
          modalVideo.play().catch(() => {});
        };
        modalVideo.addEventListener("loadeddata", start, { once: true });
        if (modalVideo.getAttribute("src") !== file) {
          modalVideo.src = file;
          modalVideo.load();
        } else if (modalVideo.readyState >= 2) {
          start();
        }
        return;
      }
      const id = btn.dataset.video;
      if (!id || !modalFrame) return;
      if (modalVideo) modalVideo.hidden = true;
      modalFrame.hidden = false;
      modalFrame.src = `https://www.youtube.com/embed/${id}?autoplay=1`;
      modal.classList.add("is-open");
    });
  });

  document.querySelector(".modal-close")?.addEventListener("click", closeModal);

  const heroSlider = document.querySelector("[data-hero-slider]");
  if (heroSlider) {
    const slides = [...heroSlider.querySelectorAll(".hero-slide")];
    const dots = [...heroSlider.querySelectorAll("[data-hero-dot]")];
    let index = 0;
    let timer = 0;

    const show = (next) => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        const on = i === index;
        slide.classList.toggle("is-active", on);
        slide.hidden = !on;
      });
      dots.forEach((dot, i) => {
        const on = i === index;
        dot.classList.toggle("is-active", on);
        dot.setAttribute("aria-selected", String(on));
      });
    };

    const stop = () => window.clearInterval(timer);
    const start = () => {
      stop();
      timer = window.setInterval(() => show(index + 1), 5000);
    };

    heroSlider.querySelector("[data-hero-prev]")?.addEventListener("click", () => {
      show(index - 1);
      start();
    });
    heroSlider.querySelector("[data-hero-next]")?.addEventListener("click", () => {
      show(index + 1);
      start();
    });
    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        show(Number(dot.dataset.heroDot));
        start();
      });
    });
    heroSlider.addEventListener("mouseenter", stop);
    heroSlider.addEventListener("mouseleave", start);
    heroSlider.addEventListener("focusin", stop);
    heroSlider.addEventListener("focusout", (event) => {
      if (!heroSlider.contains(event.relatedTarget)) start();
    });
    show(0);
    start();
  }
  modal?.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });
})();
