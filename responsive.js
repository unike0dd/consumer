(() => {
  "use strict";
  const root = document.documentElement;
  const queries = {
    mobile: window.matchMedia("(max-width: 599px)"),
    tablet: window.matchMedia("(min-width: 600px) and (max-width: 1023px)"),
    wide: window.matchMedia("(min-width: 1440px)")
  };
  let frame = 0;
  function applyLayout() {
    frame = 0;
    const layout = queries.mobile.matches
      ? "mobile"
      : queries.tablet.matches
        ? "tablet"
        : queries.wide.matches
          ? "wide"
          : "desktop";
    const width = Math.round(window.visualViewport ? window.visualViewport.width : window.innerWidth);
    const height = Math.round(window.visualViewport ? window.visualViewport.height : window.innerHeight);
    root.dataset.layout = layout;
    root.dataset.orientation = width >= height ? "landscape" : "portrait";
    root.dataset.input = window.matchMedia("(pointer: coarse)").matches ? "touch" : "pointer";
    root.style.setProperty("--gs-available-height", height + "px");
    root.style.setProperty("--viewport-width", width + "px");
  }
  function scheduleLayout() {
    if (frame) return;
    frame = window.requestAnimationFrame(applyLayout);
  }
  Object.values(queries).forEach(query => query.addEventListener?.("change", scheduleLayout));
  window.addEventListener("resize", scheduleLayout, { passive: true });
  window.addEventListener("orientationchange", scheduleLayout, { passive: true });
  window.visualViewport?.addEventListener("resize", scheduleLayout, { passive: true });
  applyLayout();
})();
