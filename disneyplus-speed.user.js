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