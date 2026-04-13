/* eslint-disable no-use-before-define */
(function () {
  const U = window.NexusUtils;
  const G = window.NexusGamification;
  const page = document.body.getAttribute("data-page");
  const FOCUS_DURATION = 25 * 60;
  let focusInterval = null;
  let focusSecondsLeft = FOCUS_DURATION;
  let focusPaused = false;
  let focusTaskId = null;
  const SEED_TASKS = [
    { id: "task_seed_1", title: "Submit CS343 OEL Report", description: "Compress and upload to LMS before deadline.", priority: "critical", category: "study", status: "todo", createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), dueDate: "2026-04-20", completedAt: null, xpReward: 100 },
    { id: "task_seed_2", title: "Prepare for DSA Midterm", description: "Revise sorting algorithms and graph traversal.", priority: "high", category: "study", status: "inprogress", createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), dueDate: "2026-04-18", completedAt: null, xpReward: 50 },
    { id: "task_seed_3", title: "Fix NazRice Mills login bug", description: "Spring Boot — JWT token not refreshing correctly.", priority: "high", category: "work", status: "todo", createdAt: new Date(Date.now() - 86400000).toISOString(), dueDate: "2026-04-15", completedAt: null, xpReward: 50 },
    { id: "task_seed_4", title: "Morning workout — 30 min run", description: "Consistency is key. No excuses.", priority: "medium", category: "fitness", status: "done", createdAt: new Date(Date.now() - 86400000).toISOString(), dueDate: null, completedAt: new Date(Date.now() - 86400000).toISOString(), xpReward: 25 },
    { id: "task_seed_5", title: "Read Atomic Habits Chapter 5", description: "Focus on the Two Minute Rule.", priority: "low", category: "personal", status: "done", createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), dueDate: null, completedAt: new Date(Date.now() - 86400000 * 4).toISOString(), xpReward: 10 },
    { id: "task_seed_6", title: "Design AgriBlock admin dashboard", description: "Wireframe the admin panel layout in Figma.", priority: "medium", category: "creative", status: "todo", createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), dueDate: "2026-04-25", completedAt: null, xpReward: 25 },
    { id: "task_seed_7", title: "Push NazRice Mills seed script to GitHub", description: "Ensure PowerShell-compatible MySQL seeding command works.", priority: "medium", category: "work", status: "inprogress", createdAt: new Date(Date.now()).toISOString(), dueDate: "2026-04-14", completedAt: null, xpReward: 25 },
    { id: "task_seed_8", title: "Alkhidmat food drive coordination", description: "Confirm pickup schedule with team lead.", priority: "high", category: "personal", status: "todo", createdAt: new Date(Date.now()).toISOString(), dueDate: "2026-04-16", completedAt: null, xpReward: 50 }
  ];

  function ensureSeed() {
    if (!localStorage.getItem("nexus_tasks")) U.writeJSON("nexus_tasks", SEED_TASKS);
    if (!localStorage.getItem("nexus_xp")) localStorage.setItem("nexus_xp", "175");
    if (!localStorage.getItem("nexus_streak")) localStorage.setItem("nexus_streak", "3");
    if (!localStorage.getItem("nexus_longest_streak")) localStorage.setItem("nexus_longest_streak", "3");
  }

  function getTasks() { return U.readJSON("nexus_tasks", []); }
  function setTasks(tasks) { U.writeJSON("nexus_tasks", tasks); }
  function getTaskById(id) { return getTasks().find((t) => t.id === id); }
  function getSelectValue(id) {
    const el = document.getElementById(id);
    return el ? (el.getAttribute("data-value") || "") : "";
  }
  function setCustomSelectValue(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    const options = el.querySelectorAll(".custom-select__option");
    const label = el.querySelector(".custom-select__label");
    let selectedText = value;
    options.forEach((option) => {
      const isSelected = option.getAttribute("data-value") === value;
      option.classList.toggle("selected", isSelected);
      if (isSelected) selectedText = option.textContent;
    });
    el.setAttribute("data-value", value);
    if (label) label.textContent = selectedText;
  }

  function completeTask(id) {
    const tasks = getTasks();
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    if (t.status === "done") {
      t.status = "todo";
      t.completedAt = null;
      G.deductXP(t.xpReward);
    } else {
      t.status = "done";
      t.completedAt = new Date().toISOString();
      G.addXP(t.xpReward);
      G.updateStreak();
      showXPToast(id, t.xpReward);
    }
    setTasks(tasks);
    G.checkAchievements();
    renderByPage();
  }

  function showToast(message, type) {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.className = `toast-${type || "info"}`;
    Object.assign(toast.style, {
      position: "fixed",
      right: "16px",
      bottom: "16px",
      zIndex: "9999",
      padding: "10px 14px",
      borderRadius: "8px",
      border: "1px solid var(--border)",
      background: "var(--bg-secondary)",
      color: "var(--text-primary)",
      fontFamily: "var(--font-mono)"
    });
    if ((localStorage.getItem("nexus_theme") || "minimal") === "cyber") {
      toast.style.boxShadow = type === "success" ? "0 0 12px rgba(0,245,212,0.35)" : "0 0 12px rgba(255,214,10,0.35)";
    }
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2600);
  }

  function deleteTask(id) {
    if (!window.confirm("Delete this task?")) return;
    setTasks(getTasks().filter((t) => t.id !== id));
    G.checkAchievements();
    renderByPage();
  }

  function showXPToast(id, xp) {
    if ((localStorage.getItem("nexus_theme") || "minimal") !== "cyber") return;
    const card = document.querySelector(`[data-task-id="${id}"]`);
    if (!card) return;
    const toast = document.createElement("div");
    toast.textContent = `+${xp} XP`;
    Object.assign(toast.style, {
      position: "absolute", right: "12px", top: "12px", color: "var(--accent-yellow)",
      fontFamily: "var(--font-mono)", animation: "xpfloat 1.2s ease forwards"
    });
    card.style.position = "relative";
    card.appendChild(toast);
    const s = document.createElement("style");
    s.textContent = "@keyframes xpfloat{0%{transform:translateY(0);opacity:1}100%{transform:translateY(-28px);opacity:0}}";
    document.head.appendChild(s);
    setTimeout(() => { toast.remove(); s.remove(); }, 1300);
  }

  function renderTasksPage() {
    const list = document.getElementById("task-grid");
    if (!list) return;
    const pFilter = getSelectValue("priority-filter");
    const cFilter = getSelectValue("category-filter");
    const sFilter = (document.getElementById("search-input").value || "").toLowerCase();
    const sort = getSelectValue("sort-filter");

    let tasks = getTasks().filter((t) => (pFilter === "all" || t.priority === pFilter) && (cFilter === "all" || t.category === cFilter) && (`${t.title} ${t.description}`.toLowerCase().includes(sFilter)));
    tasks.sort((a, b) => {
      if (sort === "priority") return ["low", "medium", "high", "critical"].indexOf(b.priority) - ["low", "medium", "high", "critical"].indexOf(a.priority);
      if (sort === "status") return a.status.localeCompare(b.status);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    tasks.sort((a, b) => (a.status === "done") - (b.status === "done"));
    if (!tasks.length) {
      list.innerHTML = '<div class="card" style="padding:2rem;text-align:center;"><svg width="72" height="72" viewBox="0 0 72 72" aria-hidden="true"><rect x="16" y="12" width="40" height="50" rx="6" fill="none" stroke="currentColor"/><path d="M26 24h20M26 34h20M26 44h14" stroke="currentColor"/></svg><p>No tasks found</p></div>';
      return;
    }
    list.innerHTML = tasks.map((t) => `<article class="card task-card priority-${t.priority} ${t.status === "done" ? "done" : ""}" data-task-id="${t.id}" style="padding:1rem;opacity:${t.status === "done" ? "0.4" : "1"}">
      <div style="font-family:var(--font-mono);font-size:0.75rem;color:var(--text-muted)">#${t.id.replace("task_", "")}</div>
      <h3 style="margin:.4rem 0;${t.status === "done" ? "text-decoration:line-through;" : ""}">${t.title}</h3>
      <p style="color:var(--text-secondary)">${t.description || "No description"}</p>
      <div style="display:flex;gap:.45rem;flex-wrap:wrap;margin:.7rem 0">
        <span class="badge priority-${t.priority}">${t.priority.toUpperCase()}</span>
        <span class="badge" style="background:var(--bg-tertiary)">${t.category}</span>
      </div>
      <p style="font-size:.86rem;color:var(--text-secondary)">Due: ${U.formatDate(t.dueDate)}</p>
      <div style="display:flex;gap:.5rem;justify-content:space-between">
        <button class="btn toggle-complete" data-id="${t.id}" aria-label="Toggle completion">${t.status === "done" ? "UNDO" : "COMPLETE"}</button>
        <button class="btn edit-task" data-id="${t.id}" aria-label="Edit task">EDIT</button>
        <button class="task-btn task-btn--focus focus-task" data-id="${t.id}" aria-label="Start focus session for this task" title="Focus Mode">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
        </button>
        <button class="btn delete-task" data-id="${t.id}" aria-label="Delete task"><svg width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M9 3h6l1 2h4v2H4V5h4zm1 6h2v9h-2zm4 0h2v9h-2zM7 9h2v9H7z"/></svg></button>
      </div>
    </article>`).join("");
    bindTaskActions();
    renderTopStats();
  }

  function renderTopStats() {
    const xp = G.getXP();
    const xpFill = document.getElementById("xp-fill");
    const xpLabel = document.getElementById("xp-label");
    const levelBadge = document.getElementById("level-badge");
    const streakEl = document.getElementById("streak-value");
    if (xpFill) xpFill.style.width = `${G.getXPProgressPercent()}%`;
    if (xpLabel) xpLabel.textContent = `XP ${xp} / ${Math.ceil(xp / 500) * 500 || 500}`;
    if (levelBadge) levelBadge.textContent = `LV.${G.getLevel()}`;
    if (streakEl) streakEl.textContent = `🔥 ${G.getStreak()} DAY STREAK`;
  }

  function bindTaskActions() {
    document.querySelectorAll(".toggle-complete").forEach((b) => b.onclick = () => completeTask(b.dataset.id));
    document.querySelectorAll(".delete-task").forEach((b) => b.onclick = () => deleteTask(b.dataset.id));
    document.querySelectorAll(".edit-task").forEach((b) => b.onclick = () => openModal(b.dataset.id));
    document.querySelectorAll(".focus-task").forEach((b) => b.onclick = () => startFocusMode(b.dataset.id));
    document.querySelectorAll(".task-card h3").forEach((h) => h.onclick = () => openModal(h.closest(".task-card").dataset.taskId));
  }

  function openModal(id) {
    const modal = document.getElementById("task-modal");
    if (!modal) return;
    const form = document.getElementById("task-form");
    const task = id ? getTasks().find((t) => t.id === id) : null;
    form.dataset.editing = id || "";
    document.getElementById("modal-title").textContent = task ? "Edit Task" : "Add Task";
    document.getElementById("task-submit").textContent = task ? "SAVE CHANGES" : "CREATE TASK";
    document.getElementById("task-title").value = task ? (task.title || "") : "";
    document.getElementById("task-description").value = task ? (task.description || "") : "";
    document.getElementById("task-dueDate").value = task ? (task.dueDate || "") : "";
    setCustomSelectValue("task-priority", task ? task.priority : "medium");
    setCustomSelectValue("task-category", task ? task.category : "study");
    document.getElementById("xp-preview").textContent = `${U.xpForPriority(getSelectValue("task-priority"))} XP`;
    modal.classList.remove("hidden");
    trapFocus(modal);
    document.getElementById("task-title").focus();
  }

  function closeModal() {
    const modal = document.getElementById("task-modal");
    if (modal) modal.classList.add("hidden");
  }

  function submitTask(evt) {
    evt.preventDefault();
    const form = evt.currentTarget;
    const editing = form.dataset.editing;
    const payload = {
      title: document.getElementById("task-title").value.trim(),
      description: document.getElementById("task-description").value.trim(),
      priority: getSelectValue("task-priority"),
      category: getSelectValue("task-category"),
      dueDate: document.getElementById("task-dueDate").value || null
    };
    if (!payload.title) return;
    payload.xpReward = U.xpForPriority(payload.priority);
    const tasks = getTasks();
    if (editing) {
      const t = tasks.find((x) => x.id === editing);
      Object.assign(t, payload);
    } else {
      tasks.push({ id: `task_${Date.now()}`, status: "todo", createdAt: new Date().toISOString(), completedAt: null, ...payload });
    }
    setTasks(tasks);
    G.checkAchievements();
    closeModal();
    renderTasksPage();
  }

  function updateFocusDisplay() {
    const m = Math.floor(focusSecondsLeft / 60).toString().padStart(2, "0");
    const s = (focusSecondsLeft % 60).toString().padStart(2, "0");
    const display = document.getElementById("focus-timer-display");
    if (display) display.textContent = `${m}:${s}`;
  }

  function updateFocusRing() {
    const circumference = 339.29;
    const progress = focusSecondsLeft / FOCUS_DURATION;
    const offset = circumference * (1 - progress);
    const ring = document.getElementById("focus-ring-progress");
    if (ring) ring.setAttribute("stroke-dashoffset", String(offset));
  }

  function closeFocusMode() {
    clearInterval(focusInterval);
    const overlay = document.getElementById("focus-overlay");
    if (overlay) overlay.style.display = "none";
    document.body.style.overflow = "";
    focusTaskId = null;
  }

  function completeFocusSession() {
    closeFocusMode();
    G.addXP(15);
    renderTopStats();
    showToast("+15 XP - Focus session complete!", "success");
  }

  function startFocusMode(taskId) {
    const task = getTaskById(taskId);
    if (!task) return;
    focusTaskId = taskId;
    focusSecondsLeft = FOCUS_DURATION;
    focusPaused = false;

    document.getElementById("focus-task-title").textContent = task.title;
    document.getElementById("focus-xp-bonus").textContent = "+15 BONUS XP on completion";
    document.getElementById("focus-pause-btn").textContent = "PAUSE";
    updateFocusDisplay();
    updateFocusRing();

    document.getElementById("focus-overlay").style.display = "flex";
    document.body.style.overflow = "hidden";

    clearInterval(focusInterval);
    focusInterval = setInterval(function () {
      if (!focusPaused) {
        focusSecondsLeft -= 1;
        updateFocusDisplay();
        updateFocusRing();
        if (focusSecondsLeft <= 0) {
          clearInterval(focusInterval);
          completeFocusSession();
        }
      }
    }, 1000);

    document.getElementById("focus-pause-btn").onclick = function () {
      focusPaused = !focusPaused;
      this.textContent = focusPaused ? "RESUME" : "PAUSE";
    };
    document.getElementById("focus-end-btn").onclick = function () {
      clearInterval(focusInterval);
      closeFocusMode();
    };
  }

  function triggerMissionRoulette() {
    const allTasks = getTasks();
    const incomplete = allTasks.filter(function (t) { return t.status !== "done"; });
    if (incomplete.length === 0) {
      showToast("No pending tasks! You are all caught up.", "info");
      return;
    }
    const chosen = incomplete[Math.floor(Math.random() * incomplete.length)];
    const overlay = document.getElementById("roulette-overlay");
    document.getElementById("roulette-task-name").textContent = chosen.title;
    document.getElementById("roulette-priority-display").textContent = `Priority: ${chosen.priority.toUpperCase()}  |  Category: ${chosen.category.toUpperCase()}`;
    document.getElementById("roulette-countdown").textContent = "Starting in 3...";
    overlay.style.display = "flex";

    let count = 3;
    const countInterval = setInterval(function () {
      count -= 1;
      if (count > 0) {
        document.getElementById("roulette-countdown").textContent = `Starting in ${count}...`;
      } else {
        clearInterval(countInterval);
        overlay.style.display = "none";
        startFocusMode(chosen.id);
      }
    }, 1000);

    overlay.addEventListener("click", function handler() {
      clearInterval(countInterval);
      overlay.style.display = "none";
      overlay.removeEventListener("click", handler);
    }, { once: true });
  }

  function trapFocus(modal) {
    const focusables = modal.querySelectorAll("button,input,textarea,.custom-select__trigger");
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    modal.onkeydown = function (e) {
      if (e.key !== "Tab") return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
  }

  function renderAchievementsPage() {
    const container = document.getElementById("achievements-grid");
    if (!container) return;
    const state = G.checkAchievements();
    const all = G.ACHIEVEMENTS;
    const unlocked = all.filter((a) => state[a.id]?.unlocked).length;
    document.getElementById("achievements-summary").textContent = `ACHIEVEMENTS: ${unlocked}/12 UNLOCKED | COMPLETION: ${Math.round((unlocked / 12) * 100)}%`;
    document.getElementById("achieve-progress").style.width = `${(unlocked / 12) * 100}%`;
    container.innerHTML = all.map((a, i) => {
      const is = !!state[a.id]?.unlocked;
      return `<article class="card" style="padding:1rem;opacity:${is ? "1" : ".5"}">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <strong>${a.name}</strong><span class="badge" style="background:${is ? "rgba(0,245,212,.15)" : "rgba(247,37,133,.15)"}">${is ? "UNLOCKED" : "LOCKED"}</span>
        </div>
        <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="${8 + (i % 6)}" stroke="currentColor" fill="none"/></svg>
        <p>${a.description}</p>
        <p style="font-size:.85rem;color:var(--text-secondary)">Condition: ${a.description}</p>
        <p style="font-family:var(--font-mono)">Difficulty: ${"■".repeat(a.difficulty)}${"□".repeat(5 - a.difficulty)}</p>
        ${is ? `<small>${U.formatDate(state[a.id].date)}</small>` : ""}
      </article>`;
    }).join("");
  }

  function renderStatsPage() {
    const wrap = document.getElementById("stats-root");
    if (!wrap) return;
    const tasks = getTasks();
    const done = tasks.filter((t) => t.status === "done");
    const xp = G.getXP();
    const categoryMap = { study: 0, work: 0, personal: 0, fitness: 0, creative: 0 };
    done.forEach((t) => { categoryMap[t.category] += t.xpReward || 0; });
    const most = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0]?.[0] || "n/a";
    const thisWeek = done.filter((t) => new Date(t.completedAt) > new Date(Date.now() - 7 * 86400000)).length;
    const lastWeek = done.filter((t) => {
      const d = new Date(t.completedAt).getTime();
      return d <= Date.now() - 7 * 86400000 && d > Date.now() - 14 * 86400000;
    }).length;
    const avg = done.length ? (done.length / Math.max(1, new Set(done.map((t) => U.toDateKey(t.completedAt))).size)).toFixed(2) : "0.00";
    const completionRate = tasks.length ? Math.round((done.length / tasks.length) * 100) : 0;
    document.getElementById("stats-root").innerHTML = `
      <div class="stats-grid">
        <div class="card" style="padding:1rem"><h3>${tasks.length}</h3><p>Total Tasks</p></div>
        <div class="card" style="padding:1rem"><h3>${done.length}</h3><p>Completed</p></div>
        <div class="card" style="padding:1rem"><h3>${xp}</h3><p>Current XP</p></div>
        <div class="card" style="padding:1rem"><h3>${G.getLevel()}</h3><p>Current Level</p></div>
        <div class="card" style="padding:1rem"><h3>${G.getStreak()}</h3><p>Current Streak</p></div>
        <div class="card" style="padding:1rem"><h3>${completionRate}%</h3><p>Completion Rate</p></div>
      </div>
      <section class="card" style="padding:1rem;margin-top:1rem">
        <h3>This Week vs Last Week</h3><p>${thisWeek} vs ${lastWeek}</p>
        <p>Longest Streak: ${G.getLongestStreak()} days | Avg/day: ${avg}</p>
        <p>Most Productive Category: <strong>${most}</strong></p>
      </section>
      <section class="card" style="padding:1rem;margin-top:1rem">
        <h3>XP Breakdown by Category</h3>
        ${Object.keys(categoryMap).map((k) => {
          const max = Math.max(1, ...Object.values(categoryMap));
          const width = (categoryMap[k] / max) * 100;
          return `<div style="margin:.5rem 0"><div style="display:flex;justify-content:space-between"><span>${k}</span><span>${categoryMap[k]} XP</span></div><div style="height:10px;background:var(--bg-tertiary)"><div style="width:${width}%;height:100%;background:linear-gradient(90deg,var(--accent),var(--accent-secondary))"></div></div></div>`;
        }).join("")}
      </section>
      <section class="card" style="padding:1rem;margin-top:1rem">
        <h3>MISSION LOG</h3>
        <div style="font-family:var(--font-mono)">${done.slice().sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)).slice(0, 5).map((t) => `[${new Date(t.completedAt).toLocaleString()}] MISSION COMPLETE - "${t.title}" +${t.xpReward}XP [${t.priority.toUpperCase()} PRIORITY]`).join("<br>") || "No completion logs yet."}</div>
      </section>`;
  }

  function bindTaskPageEvents() {
    const ids = ["priority-filter", "category-filter", "sort-filter", "search-input"];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("input", renderTasksPage);
      if (el) el.addEventListener("change", renderTasksPage);
    });
    const addBtn = document.getElementById("open-modal");
    if (addBtn) addBtn.onclick = () => openModal("");
    const closeBtn = document.getElementById("close-modal");
    if (closeBtn) closeBtn.onclick = closeModal;
    const cancelBtn = document.getElementById("cancel-modal");
    if (cancelBtn) cancelBtn.onclick = closeModal;
    const form = document.getElementById("task-form");
    if (form) form.addEventListener("submit", submitTask);
    const p = document.getElementById("task-priority");
    if (p) p.onchange = () => document.getElementById("xp-preview").textContent = `${U.xpForPriority(getSelectValue("task-priority"))} XP`;
  }

  function renderByPage() {
    if (page === "tasks") renderTasksPage();
    if (page === "achievements") renderAchievementsPage();
    if (page === "stats") renderStatsPage();
  }

  document.addEventListener("DOMContentLoaded", function () {
    ensureSeed();
    if (U.initCustomSelects) U.initCustomSelects();
    bindTaskPageEvents();
    renderByPage();
  });
  window.startFocusMode = startFocusMode;
  window.triggerMissionRoulette = triggerMissionRoulette;
})();
