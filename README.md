# Despresso

**Tagline:** Brew your focus. Grind through the chaos.

Despresso is a multi-page vanilla web application for task management, built for **CS343 Web Technologies (OEL)**.  
It combines two opposite design systems in one product:

- **Minimal Mode** (clean, light, simple)
- **Cyberpunk Mode** (dark, neon, immersive)

Both modes use the same app logic and data. The visual system changes globally using a single theme toggle.

---

## 1) Tech Stack

- HTML (multi-page)
- CSS (global + mode-specific styles)
- JavaScript (vanilla, modular files)
- `localStorage` for persistence

No frameworks, no build tools, no backend required.

---

## 2) Project Structure

```text
project/
├── index.html
├── tasks.html
├── achievements.html
├── stats.html
├── about.html
├── README.md
│
├── css/
│   ├── global.css
│   ├── minimal.css
│   └── cyber.css
│
├── js/
│   ├── theme.js
│   ├── tasks.js
│   ├── gamification.js
│   └── utils.js
│
└── assets/
```

---

## 3) How to Run

Open terminal in project folder:

```powershell
cd "c:\Users\hamza\Documents\NUST_DOCS_SEM_4\lab\web\oel"
python -m http.server 8080
```

Open in browser:

- [http://127.0.0.1:8080/index.html](http://127.0.0.1:8080/index.html)

Stop server with `Ctrl + C`.

> Note: Port `5500` may be blocked on some Windows setups. Use `8080`.

---

## 4) Main Features

## Theme Toggle System

- Toggle button appears in shared navbar.
- Theme is applied via `data-mode` on `<html>`.
- Modes:
  - `minimal`
  - `cyber`
- Preference stored in `localStorage` key: `nexus_theme`.

### Key file
- `js/theme.js`

---

## Task Management

Implemented in `tasks.html` + `js/tasks.js`.

### Supports

- Create task
- Edit task
- Delete task
- Mark complete / undo complete
- Search tasks
- Filter by priority/category
- Sort by date/priority/status
- Empty state when nothing matches

### Task model

```json
{
  "id": "task_1713000000000",
  "title": "Write lab report",
  "description": "Complete OEL writeup",
  "priority": "high",
  "category": "study",
  "status": "todo",
  "createdAt": "ISO string",
  "dueDate": "YYYY-MM-DD or null",
  "completedAt": "ISO string or null",
  "xpReward": 50
}
```

### Priority XP mapping

- `low` = 10
- `medium` = 25
- `high` = 50
- `critical` = 100

---

## Custom Dropdowns (No Native Select Popup)

All task-page dropdowns use custom components:

- Filter row:
  - priority
  - category
  - sort
- Modal:
  - priority
  - category

### Why
Native `<select>` popups break visual consistency in cyber mode.

### Implementation

- HTML structure: `.custom-select`
- CSS styling: `css/global.css` + cyber overrides in `css/cyber.css`
- JS behavior: `initCustomSelects()` in `js/utils.js`
- Selected value read from `data-value`

---

## Focus Mode (Pomodoro Overlay)

Implemented in `tasks.html`, `css/global.css`, `css/cyber.css`, and `js/tasks.js`.

### Behavior

- Each task card has a Focus button.
- Opens full-screen overlay with:
  - task title
  - countdown ring
  - timer display
  - pause/resume
  - end session
- Duration: **25 minutes**
- On completion: **+15 XP bonus**

---

## Mission Roulette

Implemented in task page as a decision-fatigue helper.

### Behavior

- Button label:
  - Minimal: `Pick for me`
  - Cyber: `MISSION ROULETTE`
- Picks random incomplete task
- Shows assignment overlay + countdown
- Auto-starts Focus Mode for selected task
- If no pending tasks: shows toast message

---

## Gamification

Core logic in `js/gamification.js`.

### Includes

- XP tracking
- Level system
- Streak tracking
- Longest streak
- Achievement unlock checks

### Level formula

```javascript
Math.floor(totalXP / 500) + 1
```

### XP to next level

```javascript
500 - (totalXP % 500)
```

---

## Achievements (12 Total)

Rendered on `achievements.html`.

Tracked in `localStorage` key `nexus_achievements`.

Examples:

- First Mission
- Booting Up
- On Fire
- Week Warrior
- Centurion
- Neon Legend

Page includes:

- unlocked/locked state
- completion progress bar
- difficulty indicator

---

## Stats Dashboard

Rendered in `stats.html` using task and gamification data.

Metrics include:

- total tasks
- completed tasks
- completion rate
- XP
- current level
- streak and longest streak
- weekly comparison
- productive category
- XP by category bars
- mission log (recent completions)

---

## Seed Data

On first load, `tasks.js` seeds data if missing:

- `nexus_tasks`: sample tasks
- `nexus_xp`: `175`
- `nexus_streak`: `3`
- `nexus_longest_streak`: `3`

This ensures pages are populated for demonstration.

---

## 5) localStorage Keys

Used keys (kept with `nexus_*` naming for compatibility):

- `nexus_tasks`
- `nexus_theme`
- `nexus_xp`
- `nexus_streak`
- `nexus_longest_streak`
- `nexus_last_completion_date`
- `nexus_achievements`

---

## 6) Page Overview

- `index.html` - landing page + hero + ticker
- `tasks.html` - task board + modal + roulette + focus mode
- `achievements.html` - achievements gallery and progress
- `stats.html` - analytics dashboard
- `about.html` - design and architecture documentation

---

## 7) Accessibility Notes

- Form fields are labeled
- Icon-only controls use `aria-label`
- Focus trap added for task modal
- Responsive layout for mobile and desktop

---

## 8) Design Notes

### Minimal mode

- clean spacing
- neutral backgrounds
- low visual noise

### Cyber mode

- neon accents
- grid overlay and scanlines
- glitch heading
- glow effects and terminal-like typography

---

## 9) Troubleshooting

## Page not opening

- Make sure server is running in project root
- Open exact URL: `http://127.0.0.1:8080/index.html`

## Old UI still showing

- Hard refresh browser (`Ctrl + Shift + R`)
- Clear `localStorage` for the site if needed

## Theme not changing

- Check if `theme.js` is loaded first in `<head>`
- Check `nexus_theme` key in browser storage

---

## 10) Author Notes

This project is intentionally built with plain HTML/CSS/JS to demonstrate:

- state persistence without backend
- modular front-end architecture
- design-system level theming with CSS variables
- interactive UX features (focus sessions, random mission assignment)

