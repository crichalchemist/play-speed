// ==UserScript==
// @name         Disney+ Speed Controller
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Floating playback speed controls for Disney+
// @author       crichalchemist 
// @match        https://www.disneyplus.com/play/*
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
      const el = [...document.querySelectorAll('video')].find(v => v.readyState > 0);
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
