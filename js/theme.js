function applyTheme(mode) {
  document.documentElement.setAttribute("data-mode", mode);
  localStorage.setItem("nexus_theme", mode);
}

function getTheme() {
  return localStorage.getItem("nexus_theme") || "minimal";
}

function updateToggleUI(mode) {
  const toggle = document.getElementById("theme-toggle");
  if (!toggle) return;
  toggle.textContent = mode === "minimal" ? "MINIMAL ● CYBER" : "CYBER ● MINIMAL";
}

function updateRouletteLabel(mode) {
  const label = document.getElementById("roulette-label");
  if (!label) return;
  label.textContent = mode === "cyber" ? "MISSION ROULETTE" : "Pick for me";
}

document.addEventListener("DOMContentLoaded", function () {
  applyTheme(getTheme());
  updateToggleUI(getTheme());
  updateRouletteLabel(getTheme());

  const toggleBtn = document.getElementById("theme-toggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      const current = getTheme();
      const next = current === "minimal" ? "cyber" : "minimal";
      applyTheme(next);
      updateToggleUI(next);
      updateRouletteLabel(next);
      window.dispatchEvent(new CustomEvent("nexus-theme-change", { detail: { mode: next } }));
    });
  }

  const links = document.querySelectorAll(".nav-link");
  const page = document.body.getAttribute("data-page");
  links.forEach((link) => {
    if (link.dataset.page === page) link.classList.add("active");
  });

  const burger = document.getElementById("hamburger");
  const navLinks = document.getElementById("nav-links");
  if (burger && navLinks) {
    burger.addEventListener("click", function () {
      navLinks.classList.toggle("open");
    });
  }
});
