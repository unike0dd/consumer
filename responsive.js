(() => {
  const root = document.documentElement;
  const queries = {
    compact: matchMedia("(max-width: 560px)"),
    tablet: matchMedia("(min-width: 561px) and (max-width: 820px)"),
    laptop: matchMedia("(min-width: 821px) and (max-width: 1439px)"),
    wide: matchMedia("(min-width: 1440px)")
  };
  let frame = 0;

  const applyLayout = () => {
    frame = 0;
    const layout = Object.entries(queries).find(([, query]) => query.matches)?.[0] || "laptop";
    root.dataset.layout = layout;
    root.dataset.input = matchMedia("(pointer: coarse)").matches ? "touch" : "pointer";
    root.style.setProperty("--viewport-width", `${document.documentElement.clientWidth}px`);
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(applyLayout);
  };

  Object.values(queries).forEach(query => query.addEventListener?.("change", schedule));
  window.addEventListener("resize", schedule, { passive: true });
  window.visualViewport?.addEventListener("resize", schedule, { passive: true });
  applyLayout();
})();
