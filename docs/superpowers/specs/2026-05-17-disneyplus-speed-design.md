# Disney+ Playback Speed Controller — Design Spec

**Date:** 2026-05-17  
**Delivery:** Tampermonkey userscript  
**Status:** Approved

---

## Overview

A single Tampermonkey userscript that injects a floating speed-control panel into Disney+ player pages. The panel shows discrete preset speed buttons and fades with the native controls on inactivity.

---

## Architecture

One file: `disneyplus-speed.user.js`

Three logical parts:

1. **Video finder** — polls for the `<video>` element and applies the current speed on attach
2. **Floating UI** — a fixed-position panel injected once at startup
3. **Speed state** — a single module-level variable tracking the active speed

---

## Components

### Video Finder

- `setInterval` at 500ms scans all `<video>` elements for one with `readyState > 0`
- Disney+ has a hidden stub `<video>` element (display:none, readyState 0) that loads first — `readyState > 0` selects the real player
- On first match: stores reference, applies `currentSpeed`, clears interval
- A second 1000ms interval watches `location.href` for SPA navigation
- On URL change: nulls the stored video reference and restarts the attach interval

### Floating UI

- Injected once at script startup into `document.body`
- Guard: checks `document.getElementById('dplus-speed-ui')` before injecting to prevent duplicates
- Six buttons in a horizontal row: `0.5×`, `0.75×`, `1×`, `1.25×`, `1.5×`, `2×`
- Active button highlighted (white background, dark text)
- Inactive buttons: white text, transparent background

### Speed State

- `currentSpeed` variable, default `1`
- On button click: update `currentSpeed`, set `videoEl.playbackRate`, update button highlight
- Speed persists across SPA navigation — re-applied when new video element is found

---

## UI Layout & Styling

**Position:** Fixed, bottom-right corner (`bottom: 20px; right: 20px`)  
**Z-index:** 99999  
**Appearance:** Semi-transparent dark pill (`rgba(0,0,0,0.75)`, `border-radius: 8px`, `padding: 6px 10px`)  
**Font:** Small, sans-serif  
**Matches URL:** `https://www.disneyplus.com/play/*`

```
╭─────────────────────────────────╮
│ 0.5×  0.75×  1×  1.25×  1.5×  2× │
╰─────────────────────────────────╯
```

---

## Fade Behavior

- Panel starts hidden (`opacity: 0`, `pointer-events: none`)
- `mousemove` on `document` → set `opacity: 1`, `pointer-events: auto`, reset timer
- After **3 seconds** of no mouse movement → fade to `opacity: 0`, `pointer-events: none`
- CSS `transition: opacity 0.5s ease` for smooth fade
- Mirrors Disney+'s native control fade behavior

---

## Error Handling

| Scenario | Behavior |
|---|---|
| No `<video>` found (browse pages, home) | Attach loop polls silently; no error |
| SPA navigation to new episode | URL watcher detects change, restarts attach loop |
| Duplicate UI injection | Guard on element ID prevents stacking |
| Speed clamped by browser/DRM | Not expected within 0.5–2× range; no special handling |
| Speed preference across episodes | `currentSpeed` persists; re-applied on new video attach |

---

## Out of Scope

- Keyboard shortcuts
- Speeds above 2× or below 0.5×
- Slider-based speed control
- Persistence across browser sessions (localStorage)
