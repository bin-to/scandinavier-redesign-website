(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  const BLOCKS = [
    "main .section-head",
    "main .section-intro:not(.page-hero-copy)",
    "main .promise-inner",
    "main .nordic-grid > *",
    "main .feature-video",
    "main .size-compare",
    "main .quote-main",
    "main .contact-aside",
    "main .contact-form-panel",
    "main .guides-panel",
    "main .cart-panel",
    "main .checkout-shell",
    "main .order-promise",
    "main .order-cart",
    "main .order-panel",
    ".page-hero-copy",
    ".page-hero-aside > .page-hero-tile--featured",
    ".hero-visual",
    ".site-footer .legal",
  ].join(",");

  const STAGGER_GROUPS = [
    ".steps",
    ".bento",
    ".audiences",
    ".models",
    ".setup-track",
    ".setup-flow",
    ".faq-list",
    ".page-hero-tile-grid",
    ".page-hero-stats",
    ".support-quick-grid",
    ".shop-grid",
    ".scanner-grid",
    ".guide-list",
    ".quote-side",
    ".footer-grid",
    ".contact-facts",
  ];

  const MAX_STAGGER_MS = 420;
  const STAGGER_STEP_MS = 65;

  function staggerDelay(index) {
    return `${Math.min(index * STAGGER_STEP_MS, MAX_STAGGER_MS)}ms`;
  }

  function mark(el, type = "fade-up", delay) {
    if (el.classList.contains("reveal")) return;
    if (el.hasAttribute("data-animate")) return;
    el.setAttribute("data-animate", type);
    if (delay) el.style.setProperty("--motion-delay", delay);
  }

  function init() {
    document.querySelectorAll(BLOCKS).forEach((el) => {
      const type = el.classList.contains("hero-visual") ? "fade-in" : "fade-up";
      const delay = el.classList.contains("hero-visual") ? "0.12s" : undefined;
      mark(el, type, delay);
    });

    STAGGER_GROUPS.forEach((selector) => {
      document.querySelectorAll(selector).forEach((group) => {
        [...group.children].forEach((child, index) => {
          mark(child, "fade-up", staggerDelay(index));
        });
      });
    });

    document.querySelectorAll(".page-hero-aside > .page-hero-tile-grid").forEach((grid) => {
      [...grid.children].forEach((child, index) => {
        mark(child, "fade-up", staggerDelay(index + 1));
      });
    });

    // Reveal on entry, not when 12% of the element is visible. A ratio
    // threshold can never fire once the target is taller than the viewport
    // divided by that ratio, so the full guide list stayed at opacity: 0.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-inview");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0 }
    );

    document.querySelectorAll("[data-animate]").forEach((el) => observer.observe(el));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
