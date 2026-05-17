# Disney+ Speed Controller Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Tampermonkey userscript that injects a floating speed-control panel into Disney+ player pages, with discrete preset buttons (0.5×–2×) and native-style fade-on-inactivity behavior.

**Architecture:** Single file (`disneyplus-speed.user.js`) with three concerns: a polling video finder that attaches to the `<video>` element; a fixed-position floating UI injected once at startup; and a SPA navigation watcher that re-attaches when the URL changes.

**Tech Stack:** Vanilla JavaScript, Tampermonkey userscript API (no external dependencies)

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `disneyplus-speed.user.js` | Create | The complete userscript |

---

### Task 1: Tampermonkey header + empty skeleton

**Files:**
- Create: `disneyplus-speed.user.js`

- [ ] **Step 1: Create the file with the userscript metadata header**

```javascript
// ==UserScript==
// @name         Disney+ Speed Controller
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Floating playback speed controls for Disney+
// @author       You
// @match        https://www.disneyplus.com/video/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';
})();
```

- [ ] **Step 2: Install the script in Tampermonkey**

Open Tampermonkey → Dashboard → New script. Paste the file contents and click Save (or use the tampermonkey MCP if available: `tampermonkey_create_script`).

- [ ] **Step 3: Verify it appears in the Tampermonkey dashboard**

Navigate to `https://www.disneyplus.com/video/` (any video URL). Open DevTools → Console. No errors expected. Tampermonkey icon in toolbar should show a green badge (script active).

- [ ] **Step 4: Commit**

```bash
git add disneyplus-speed.user.js
git commit -m "feat: add userscript skeleton with Tampermonkey header"
```

---

### Task 2: Inject the floating UI panel

**Files:**
- Modify: `disneyplus-speed.user.js`

- [ ] **Step 1: Add the `injectUI` function inside the IIFE**

Replace the contents of the `(function () { 'use strict'; })();` wrapper with:

```javascript
(function () {
  'use strict';

  const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

  function injectUI() {
    if (document.getElementById('dplus-speed-ui')) return;

    const panel = document.createElement('div');
    panel.id = 'dplus-speed-ui';
    panel.style.cssText = [
      'position: fixed',
      'bottom: 20px',
      'right: 20px',
      'z-index: 99999',
      'background: rgba(0,0,0,0.75)',
      'border-radius: 8px',
      'padding: 6px 10px',
      'display: flex',
      'gap: 4px',
      'align-items: center',
      'font-family: sans-serif',
      'font-size: 13px',
      'opacity: 0',
      'pointer-events: none',
      'transition: opacity 0.5s ease',
    ].join(';');

    SPEEDS.forEach(function (speed) {
      const btn = document.createElement('button');
      btn.dataset.speed = speed;
      btn.textContent = speed + '×';
      btn.style.cssText = [
        'background: transparent',
        'border: none',
        'color: white',
        'cursor: pointer',
        'padding: 2px 6px',
        'border-radius: 4px',
        'font-size: 13px',
        'font-family: sans-serif',
      ].join(';');
      panel.appendChild(btn);
    });

    document.body.appendChild(panel);
  }

  injectUI();
})();
```

- [ ] **Step 2: Save and reload the script in Tampermonkey, then verify the panel exists in the DOM**

Navigate to a Disney+ video page. Open DevTools → Console and run:
```javascript
document.getElementById('dplus-speed-ui')
```
Expected: the `<div>` element (not `null`). It won't be visible yet (opacity: 0).

- [ ] **Step 3: Commit**

```bash
git add disneyplus-speed.user.js
git commit -m "feat: inject floating speed panel into Disney+ player"
```

---

### Task 3: Fade behavior on mouse movement

**Files:**
- Modify: `disneyplus-speed.user.js`

- [ ] **Step 1: Add fade logic after `injectUI()` is called**

Add these lines inside the IIFE, after `injectUI();`:

```javascript
  let fadeTimer = null;

  function showPanel() {
    const panel = document.getElementById('dplus-speed-ui');
    if (!panel) return;
    panel.style.opacity = '1';
    panel.style.pointerEvents = 'auto';
    clearTimeout(fadeTimer);
    fadeTimer = setTimeout(function () {
      panel.style.opacity = '0';
      panel.style.pointerEvents = 'none';
    }, 3000);
  }

  document.addEventListener('mousemove', showPanel);
```

- [ ] **Step 2: Save, reload, and verify fade behavior**

Navigate to a Disney+ video page. Move the mouse — the panel should appear in the bottom-right. Stop moving — after 3 seconds the panel should fade out smoothly. Confirm `pointer-events: none` when hidden by running in DevTools console:
```javascript
document.getElementById('dplus-speed-ui').style.pointerEvents
```
Expected after 3s of no movement: `"none"`

- [ ] **Step 3: Commit**

```bash
git add disneyplus-speed.user.js
git commit -m "feat: fade panel in/out on mouse movement (3s timeout)"
```

---

### Task 4: Speed state and active button highlight

**Files:**
- Modify: `disneyplus-speed.user.js`

- [ ] **Step 1: Add `currentSpeed` variable and `setActiveButton` function**

Add near the top of the IIFE (after `const SPEEDS = ...`):

```javascript
  let currentSpeed = 1;

  function setActiveButton(speed) {
    const panel = document.getElementById('dplus-speed-ui');
    if (!panel) return;
    panel.querySelectorAll('button').forEach(function (btn) {
      const isActive = parseFloat(btn.dataset.speed) === speed;
      btn.style.background = isActive ? 'white' : 'transparent';
      btn.style.color = isActive ? '#000' : 'white';
    });
  }
```

- [ ] **Step 2: Call `setActiveButton` after `injectUI()`**

Replace `injectUI();` with:
```javascript
  injectUI();
  setActiveButton(currentSpeed);
```

- [ ] **Step 3: Save, reload, and verify the 1× button is highlighted**

Navigate to a Disney+ video page. Move the mouse to reveal the panel. The `1×` button should have a white background with dark text. All other buttons should have white text on transparent.

- [ ] **Step 4: Commit**

```bash
git add disneyplus-speed.user.js
git commit -m "feat: highlight active speed button on panel"
```

---

### Task 5: Video finder — poll and attach

**Files:**
- Modify: `disneyplus-speed.user.js`

- [ ] **Step 1: Add `videoEl` variable and `attachVideo` function**

Add after `let currentSpeed = 1;`:

```javascript
  let videoEl = null;
  let attachInterval = null;

  function attachVideo() {
    clearInterval(attachInterval);
    attachInterval = setInterval(function () {
      const el = document.querySelector('video');
      if (el) {
        videoEl = el;
        videoEl.playbackRate = currentSpeed;
        clearInterval(attachInterval);
      }
    }, 500);
  }
```

- [ ] **Step 2: Call `attachVideo()` after `setActiveButton(currentSpeed)`**

```javascript
  injectUI();
  setActiveButton(currentSpeed);
  attachVideo();
```

- [ ] **Step 3: Save, reload, and verify the video element is found**

Navigate to a Disney+ video player and start playback. Open DevTools → Console:
```javascript
document.querySelector('video').playbackRate
```
Expected: `1` (default speed, confirms attach ran without error). If `currentSpeed` was previously changed to e.g. 1.5, it would be `1.5`.

- [ ] **Step 4: Commit**

```bash
git add disneyplus-speed.user.js
git commit -m "feat: poll for video element and apply current speed on attach"
```

---

### Task 6: Button click handlers — apply speed to video

**Files:**
- Modify: `disneyplus-speed.user.js`

- [ ] **Step 1: Add a click handler on the panel using event delegation**

Inside `injectUI()`, add this line just before `document.body.appendChild(panel);`:

```javascript
    panel.addEventListener('click', function (e) {
      const btn = e.target.closest('button[data-speed]');
      if (!btn) return;
      currentSpeed = parseFloat(btn.dataset.speed);
      if (videoEl) videoEl.playbackRate = currentSpeed;
      setActiveButton(currentSpeed);
    });
```

- [ ] **Step 2: Save, reload, and test clicking each speed button**

Navigate to a Disney+ video, start playback, reveal the panel (mousemove). Click `1.5×`. Verify:
1. The `1.5×` button turns white/dark (active style)
2. In DevTools Console: `document.querySelector('video').playbackRate` → `1.5`

Click `1×` to restore normal speed. Verify `playbackRate` returns to `1`.

- [ ] **Step 3: Commit**

```bash
git add disneyplus-speed.user.js
git commit -m "feat: wire button clicks to set video playback rate"
```

---

### Task 7: SPA navigation watcher — re-attach on episode change

**Files:**
- Modify: `disneyplus-speed.user.js`

- [ ] **Step 1: Add the URL watcher after `attachVideo()`**

```javascript
  let lastUrl = location.href;
  setInterval(function () {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      videoEl = null;
      attachVideo();
    }
  }, 1000);
```

- [ ] **Step 2: Save, reload, and test navigation between episodes**

On Disney+, start a video at 1.5×. Navigate to a different episode (click "Next episode" or pick another from the series list). Verify:
1. The new video starts playing
2. In DevTools Console: `document.querySelector('video').playbackRate` → `1.5` (speed re-applied)
3. The `1.5×` button is still highlighted

- [ ] **Step 3: Commit**

```bash
git add disneyplus-speed.user.js
git commit -m "feat: re-attach video on SPA navigation to persist speed"
```

---

### Task 8: Final integration check and update Tampermonkey

**Files:**
- Read: `disneyplus-speed.user.js` (final state)

- [ ] **Step 1: Confirm the complete final file looks like this**

```javascript
// ==UserScript==
// @name         Disney+ Speed Controller
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Floating playback speed controls for Disney+
// @author       You
// @match        https://www.disneyplus.com/video/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
  let currentSpeed = 1;
  let videoEl = null;
  let attachInterval = null;

  function setActiveButton(speed) {
    const panel = document.getElementById('dplus-speed-ui');
    if (!panel) return;
    panel.querySelectorAll('button').forEach(function (btn) {
      const isActive = parseFloat(btn.dataset.speed) === speed;
      btn.style.background = isActive ? 'white' : 'transparent';
      btn.style.color = isActive ? '#000' : 'white';
    });
  }

  function injectUI() {
    if (document.getElementById('dplus-speed-ui')) return;

    const panel = document.createElement('div');
    panel.id = 'dplus-speed-ui';
    panel.style.cssText = [
      'position: fixed',
      'bottom: 20px',
      'right: 20px',
      'z-index: 99999',
      'background: rgba(0,0,0,0.75)',
      'border-radius: 8px',
      'padding: 6px 10px',
      'display: flex',
      'gap: 4px',
      'align-items: center',
      'font-family: sans-serif',
      'font-size: 13px',
      'opacity: 0',
      'pointer-events: none',
      'transition: opacity 0.5s ease',
    ].join(';');

    SPEEDS.forEach(function (speed) {
      const btn = document.createElement('button');
      btn.dataset.speed = speed;
      btn.textContent = speed + '×';
      btn.style.cssText = [
        'background: transparent',
        'border: none',
        'color: white',
        'cursor: pointer',
        'padding: 2px 6px',
        'border-radius: 4px',
        'font-size: 13px',
        'font-family: sans-serif',
      ].join(';');
      panel.appendChild(btn);
    });

    panel.addEventListener('click', function (e) {
      const btn = e.target.closest('button[data-speed]');
      if (!btn) return;
      currentSpeed = parseFloat(btn.dataset.speed);
      if (videoEl) videoEl.playbackRate = currentSpeed;
      setActiveButton(currentSpeed);
    });

    document.body.appendChild(panel);
  }

  function attachVideo() {
    clearInterval(attachInterval);
    attachInterval = setInterval(function () {
      const el = document.querySelector('video');
      if (el) {
        videoEl = el;
        videoEl.playbackRate = currentSpeed;
        clearInterval(attachInterval);
      }
    }, 500);
  }

  let fadeTimer = null;

  function showPanel() {
    const panel = document.getElementById('dplus-speed-ui');
    if (!panel) return;
    panel.style.opacity = '1';
    panel.style.pointerEvents = 'auto';
    clearTimeout(fadeTimer);
    fadeTimer = setTimeout(function () {
      panel.style.opacity = '0';
      panel.style.pointerEvents = 'none';
    }, 3000);
  }

  document.addEventListener('mousemove', showPanel);

  injectUI();
  setActiveButton(currentSpeed);
  attachVideo();

  let lastUrl = location.href;
  setInterval(function () {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      videoEl = null;
      attachVideo();
    }
  }, 1000);
})();
```

- [ ] **Step 2: End-to-end verification checklist**

On a Disney+ video page, verify all of the following:

| Check | How to verify |
|---|---|
| Panel hidden on load | Panel not visible until mouse moves |
| Panel appears on mousemove | Move mouse over page |
| Panel fades after 3s | Stop moving mouse, wait |
| 1× is highlighted by default | Check button styling |
| Clicking a speed updates the video | Click 1.5×, check `document.querySelector('video').playbackRate` |
| Active button updates | Clicked button turns white/dark |
| Speed persists to next episode | Navigate to new episode, check `playbackRate` |
| No duplicate panels | Navigate and return, check `document.querySelectorAll('#dplus-speed-ui').length === 1` |

- [ ] **Step 3: Final commit**

```bash
git add disneyplus-speed.user.js
git commit -m "feat: complete Disney+ speed controller userscript"
```
