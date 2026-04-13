window.NexusGamification = (function () {
  const U = window.NexusUtils;
  const ACHIEVEMENTS = [
    { id: "first_blood", name: "First Mission", description: "Complete your first task", difficulty: 1 },
    { id: "getting_started", name: "Booting Up", description: "Add 5 tasks", difficulty: 1 },
    { id: "focused", name: "Focused Mode", description: "Complete 3 tasks in one day", difficulty: 2 },
    { id: "on_fire", name: "On Fire", description: "Maintain a 3-day streak", difficulty: 2 },
    { id: "week_warrior", name: "Week Warrior", description: "Maintain a 7-day streak", difficulty: 4 },
    { id: "speed_runner", name: "Speed Runner", description: "Complete within 1 hour", difficulty: 3 },
    { id: "critical_thinker", name: "Critical Thinker", description: "Complete 5 critical tasks", difficulty: 3 },
    { id: "completionist", name: "Completionist", description: "Complete 25 tasks total", difficulty: 4 },
    { id: "centurion", name: "Centurion", description: "Reach 1000 XP", difficulty: 4 },
    { id: "night_owl", name: "Night Owl", description: "Complete after midnight", difficulty: 2 },
    { id: "early_bird", name: "Early Bird", description: "Complete before 7am", difficulty: 3 },
    { id: "legend", name: "Neon Legend", description: "Unlock all 11 other achievements", difficulty: 5 }
  ];

  function getTasks() {
    return U.readJSON("nexus_tasks", []);
  }
  function getXP() { return parseInt(localStorage.getItem("nexus_xp") || "0", 10); }
  function setXP(v) { localStorage.setItem("nexus_xp", String(Math.max(0, v))); }
  function getLevel() { return Math.floor(getXP() / 500) + 1; }
  function getXPToNextLevel() { return 500 - (getXP() % 500 || 500); }
  function getXPProgressPercent() { return ((getXP() % 500) / 500) * 100; }
  function getStreak() { return parseInt(localStorage.getItem("nexus_streak") || "0", 10); }
  function getLongestStreak() { return parseInt(localStorage.getItem("nexus_longest_streak") || "0", 10); }

  function showToast(message, className) {
    const toast = document.createElement("div");
    toast.className = `nexus-toast ${className || ""}`;
    toast.textContent = message;
    Object.assign(toast.style, {
      position: "fixed", right: "16px", bottom: "16px", zIndex: "999", padding: "10px 14px",
      border: "1px solid var(--border)", borderRadius: "8px", background: "var(--bg-secondary)"
    });
    if (getTheme() === "cyber") toast.style.boxShadow = "0 0 12px rgba(255,214,10,0.5)";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  function addXP(amount) {
    const oldLevel = getLevel();
    setXP(getXP() + amount);
    if (getLevel() > oldLevel && getTheme() === "cyber") showToast("LEVEL UP ACHIEVED");
  }
  function deductXP(amount) { setXP(getXP() - amount); }

  function updateStreak() {
    const today = U.toDateKey();
    const last = localStorage.getItem("nexus_last_completion_date");
    const yesterday = U.toDateKey(Date.now() - 86400000);
    let streak = getStreak();
    if (last === today) return streak;
    if (last === yesterday) streak += 1;
    else streak = 1;
    localStorage.setItem("nexus_streak", String(streak));
    localStorage.setItem("nexus_last_completion_date", today);
    if (streak > getLongestStreak()) localStorage.setItem("nexus_longest_streak", String(streak));
    return streak;
  }

  function getAchievementsState() {
    return U.readJSON("nexus_achievements", {});
  }

  function unlock(id) {
    const state = getAchievementsState();
    if (!state[id]) {
      state[id] = { unlocked: true, date: new Date().toISOString() };
      U.writeJSON("nexus_achievements", state);
      const meta = ACHIEVEMENTS.find((a) => a.id === id);
      if (meta) showToast(`Achievement Unlocked: ${meta.name}`);
    }
  }

  function checkAchievements() {
    const tasks = getTasks();
    const done = tasks.filter((t) => t.status === "done");
    const state = getAchievementsState();
    const byDay = {};
    done.forEach((d) => {
      const key = U.toDateKey(d.completedAt);
      byDay[key] = (byDay[key] || 0) + 1;
    });
    const has3SameDay = Object.values(byDay).some((v) => v >= 3);
    const criticalDone = done.filter((t) => t.priority === "critical").length;
    const speed = done.some((t) => new Date(t.completedAt).getTime() - new Date(t.createdAt).getTime() < 3600000);
    const night = done.some((t) => {
      const h = new Date(t.completedAt).getHours();
      return h >= 0 && h < 4;
    });
    const early = done.some((t) => {
      const h = new Date(t.completedAt).getHours();
      return h >= 5 && h < 7;
    });
    const conditions = {
      first_blood: done.length >= 1,
      getting_started: tasks.length >= 5,
      focused: has3SameDay,
      on_fire: getStreak() >= 3,
      week_warrior: getStreak() >= 7,
      speed_runner: speed,
      critical_thinker: criticalDone >= 5,
      completionist: done.length >= 25,
      centurion: getXP() >= 1000,
      night_owl: night,
      early_bird: early
    };
    Object.keys(conditions).forEach((id) => { if (conditions[id]) unlock(id); });
    const updated = getAchievementsState();
    const others = ACHIEVEMENTS.filter((a) => a.id !== "legend").every((a) => updated[a.id]?.unlocked);
    if (others) unlock("legend");
    return getAchievementsState();
  }

  function getTheme() { return localStorage.getItem("nexus_theme") || "minimal"; }

  return {
    ACHIEVEMENTS, getXP, addXP, deductXP, getLevel, getXPToNextLevel, getXPProgressPercent,
    getStreak, getLongestStreak, updateStreak, checkAchievements, getAchievementsState
  };
})();
