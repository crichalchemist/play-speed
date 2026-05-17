# Disney+ Speed Controller

A Tampermonkey userscript that adds a floating playback speed panel to Disney+.

![speeds: 0.5× 0.75× 1× 1.25× 1.5× 2×]

## Features

- Six preset speeds: **0.5×, 0.75×, 1×, 1.25×, 1.5×, 2×**
- Fades in/out with mouse movement, just like Disney+'s native controls
- Speed persists when navigating between episodes
- No external dependencies — vanilla JS only

## Installation

1. Install the [Tampermonkey](https://www.tampermonkey.net/) browser extension
2. Open the Tampermonkey dashboard → click **+** to create a new script
3. Replace all contents with [`disneyplus-speed.user.js`](./disneyplus-speed.user.js)
4. Save (`Ctrl+S` / `Cmd+S`)

## Usage

Navigate to any Disney+ video (`https://www.disneyplus.com/play/...`). Move your mouse to reveal the speed panel in the bottom-right corner. Click a speed to apply it. The panel fades after 3 seconds of inactivity.

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `]` | Speed up (+ 0.25×, max 2×) |
| `[` | Slow down (− 0.25×, min 0.5×) |

Shortcuts have no effect while a text input is focused (e.g. Disney+'s search box).

## Notes

- Disney+ has a hidden `<video>` stub element that loads first in the DOM — the script identifies the real player by `readyState > 0`
- Speed selection persists across SPA navigation (episode changes without page reload)
- Tested on Chrome with Tampermonkey v5+
