(() => {
  const steps = [...document.querySelectorAll(".setup-flow__step")];
  if (!steps.length) return;

  const setActive = (index) => {
    steps.forEach((step, i) => {
      step.classList.toggle("is-current", i === index);
      step.classList.toggle("is-passed", i < index);
    });
  };

  const update = () => {
    const anchor = window.innerHeight * 0.38;
    let index = 0;
    steps.forEach((step, i) => {
      if (step.getBoundingClientRect().top <= anchor) index = i;
    });
    setActive(index);
  };

  setActive(0);
  update();

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    },
    { passive: true }
  );

  window.addEventListener("resize", update, { passive: true });
})();
