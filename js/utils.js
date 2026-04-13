window.NexusUtils = (function () {
  function readJSON(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (_err) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function toDateKey(dateInput) {
    const d = dateInput ? new Date(dateInput) : new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function formatDate(dateInput) {
    if (!dateInput) return "No due date";
    return new Date(dateInput).toLocaleDateString("en-PK", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  function xpForPriority(priority) {
    const map = { low: 10, medium: 25, high: 50, critical: 100 };
    return map[priority] || 10;
  }

  function initCustomSelects() {
    document.querySelectorAll(".custom-select").forEach(function (selectEl) {
      const trigger = selectEl.querySelector(".custom-select__trigger");
      const options = selectEl.querySelectorAll(".custom-select__option");
      const label = selectEl.querySelector(".custom-select__label");
      if (!trigger || !label || options.length === 0) return;

      trigger.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = selectEl.classList.contains("open");
        document.querySelectorAll(".custom-select.open").forEach(function (el) {
          el.classList.remove("open");
          const openTrigger = el.querySelector(".custom-select__trigger");
          if (openTrigger) openTrigger.setAttribute("aria-expanded", "false");
        });
        if (!isOpen) {
          selectEl.classList.add("open");
          trigger.setAttribute("aria-expanded", "true");
        }
      });

      options.forEach(function (option) {
        option.addEventListener("click", function () {
          const value = option.getAttribute("data-value");
          const text = option.textContent;
          label.textContent = text;
          selectEl.setAttribute("data-value", value);
          options.forEach(function (o) { o.classList.remove("selected"); });
          option.classList.add("selected");
          selectEl.classList.remove("open");
          trigger.setAttribute("aria-expanded", "false");
          selectEl.dispatchEvent(new CustomEvent("change", { detail: { value: value } }));
        });
      });
    });

    document.addEventListener("click", function () {
      document.querySelectorAll(".custom-select.open").forEach(function (el) {
        el.classList.remove("open");
        const trigger = el.querySelector(".custom-select__trigger");
        if (trigger) trigger.setAttribute("aria-expanded", "false");
      });
    });
  }

  return { readJSON, writeJSON, toDateKey, formatDate, xpForPriority, initCustomSelects };
})();
