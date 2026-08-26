(() => {
  "use strict";
  const cards = [...document.querySelectorAll(".job-card")];
  function activateHash() {
    const id = window.location.hash.slice(1);
    const active = cards.find(card => card.id === id);
    cards.forEach(card => card.removeAttribute("aria-current"));
    if (!active) return;
    active.setAttribute("aria-current", "location");
    active.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    active.focus({ preventScroll: true });
  }
  window.addEventListener("hashchange", activateHash);
  if (window.location.hash) window.requestAnimationFrame(activateHash);
})();
