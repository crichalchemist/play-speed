# Keyboard Speed Shortcuts — Design Spec

**Date:** 2026-05-17  
**Delivery:** Addition to `disneyplus-speed.user.js`  
**Status:** Approved

---

## Overview

Add `[` and `]` keyboard shortcuts to step playback speed down and up by 0.25× increments. Pressing a shortcut flashes the floating panel so the user can see the current speed.

---

## Behavior

| Key | Action | Clamp |
|---|---|---|
| `[` | `currentSpeed -= 0.25` | min 0.5× |
| `]` | `currentSpeed += 0.25` | max 2.0× |

- Speed is applied immediately to `videoEl.playbackRate`
- `setActiveButton(currentSpeed)` is called — highlights the matching preset button if one exists; no button is highlighted for in-between values (e.g. 1.75×, which falls in the 1.5×–2× gap)
- `showPanel()` is called on each keypress to flash the panel visible

---

## Implementation

A single `keydown` listener on `document`, added alongside the existing `mousemove` listener. No new functions required.

```javascript
document.addEventListener('keydown', function (e) {
  const tag = document.activeElement && document.activeElement.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  if (e.key === '[') {
    currentSpeed = Math.max(0.5, currentSpeed - 0.25);
  } else if (e.key === ']') {
    currentSpeed = Math.min(2, currentSpeed + 0.25);
  } else {
    return;
  }
  if (videoEl) videoEl.playbackRate = currentSpeed;
  setActiveButton(currentSpeed);
  showPanel();
});
```

---

## Edge Cases

| Scenario | Behavior |
|---|---|
| `[` at 0.5× | No change (clamped) |
| `]` at 2.0× | No change (clamped) |
| Speed at 1.75× (between presets) | No button highlighted |
| Focus on search input | Listener returns early — no speed change |
| `videoEl` is null | Speed variable updates; `playbackRate` not set (same guard as click handler) |

---

## Out of Scope

- Arrow key shortcuts (conflict with Disney+'s seek and volume controls)
- Visual indicator for in-between speeds (e.g. 1.75×)
- Configurable key bindings
- On-screen toast showing current speed
