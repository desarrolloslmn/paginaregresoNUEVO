(() => {
  const root = document.querySelector(".rac-landing");
  if (!root) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const revealItems = root.querySelectorAll(".rac-reveal");
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -40px 0px" });

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const checklist = document.getElementById("rac-school-checklist");
  const progressText = document.getElementById("rac-progress-text");
  const progressBar = document.getElementById("rac-progress-bar");

  function updateProgress() {
    if (!checklist || !progressText || !progressBar) return;
    const boxes = Array.from(checklist.querySelectorAll('input[type="checkbox"]'));
    const completed = boxes.filter((box) => box.checked).length;
    const progress = boxes.length ? Math.round((completed / boxes.length) * 100) : 0;
    progressText.textContent = `${progress}%`;
    progressBar.style.width = `${progress}%`;
  }

  checklist?.addEventListener("change", updateProgress);
  updateProgress();

  function setExternalLinksTarget() {
    const links = root.querySelectorAll('a[href]:not([href^="#"]):not([target])');
    links.forEach((link) => {
      link.setAttribute("target", "_parent");
      link.setAttribute("rel", "noopener");
    });
  }

  setExternalLinksTarget();

  const productCarousel = root.querySelector(".bannerProductosLandingSection");
  if (productCarousel && "MutationObserver" in window) {
    const productObserver = new MutationObserver(() => setExternalLinksTarget());
    productObserver.observe(productCarousel, { childList: true, subtree: true });
  }

  let frameMessageTimer = 0;
  function postHeightToParent() {
    window.clearTimeout(frameMessageTimer);
    frameMessageTimer = window.setTimeout(() => {
      const height = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        root.scrollHeight
      );

      try {
        window.parent?.postMessage({ type: "regresoClasesLandingHeight", height }, "*");
      } catch (error) {
        // Si el navegador bloquea el postMessage, la landing sigue funcionando normal.
      }
    }, 80);
  }

  window.addEventListener("load", postHeightToParent, { once: true });
  window.addEventListener("resize", postHeightToParent, { passive: true });

  if ("ResizeObserver" in window) {
    const resizeObserver = new ResizeObserver(postHeightToParent);
    resizeObserver.observe(document.body);
  }
})();
