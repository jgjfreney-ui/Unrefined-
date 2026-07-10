'use strict';
// ---------------------------------------------------------------------------
// Wildmask — mobile.js : touch controls (virtual joystick + buttons), PWA glue
// ---------------------------------------------------------------------------
G.isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0 && matchMedia('(pointer: coarse)').matches);

G.initMobile = function (input) {
  // service worker for offline / installability (needs http(s), not file://)
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
  if (!G.isTouch) return;
  document.body.classList.add('touch');

  // ---------- virtual joystick (left half) ----------
  const joy = document.getElementById('joy');
  const knob = document.getElementById('joyknob');
  let joyId = null, jcx = 0, jcy = 0;
  const JR = 52;
  function setKnob(dx, dy) {
    knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
  }
  window.addEventListener('touchstart', e => {
    for (const t of e.changedTouches) {
      if (t.clientX < innerWidth * 0.45 && t.clientY > innerHeight * 0.3 && joyId === null) {
        joyId = t.identifier;
        jcx = t.clientX; jcy = t.clientY;
        joy.style.left = (jcx - 70) + 'px';
        joy.style.top = (jcy - 70) + 'px';
        joy.classList.remove('hidden');
      }
    }
  }, { passive: true });
  window.addEventListener('touchmove', e => {
    for (const t of e.changedTouches) {
      if (t.identifier === joyId) {
        let dx = t.clientX - jcx, dy = t.clientY - jcy;
        const d = Math.hypot(dx, dy);
        if (d > JR) { dx = dx / d * JR; dy = dy / d * JR; }
        setKnob(dx, dy);
        input.jx = dx / JR;
        input.jy = dy / JR;
        input.sprint = d > JR * 0.92 ? 1 : (input._sprintLock ? 1 : 0); // slam the stick = sprint
      } else if (t.identifier === G._camId) {
        camDrag(t);
      }
    }
  }, { passive: true });
  window.addEventListener('touchend', e => {
    for (const t of e.changedTouches) {
      if (t.identifier === joyId) {
        joyId = null;
        input.jx = 0; input.jy = 0;
        if (!input._sprintLock) input.sprint = 0;
        setKnob(0, 0);
        joy.classList.add('hidden');
      }
      if (t.identifier === G._camId) G._camId = null;
      if (t.identifier === G._pinchId) G._pinchId = null;
    }
  }, { passive: true });

  // ---------- camera drag + pinch zoom (right half) ----------
  G._camId = null; G._pinchId = null;
  let lastCX = 0, lastCY = 0, pinchDist = 0;
  function camDrag(t) {
    G.camInput.yaw -= (t.clientX - lastCX) * 0.006;
    G.camInput.pitch = G.clamp(G.camInput.pitch + (t.clientY - lastCY) * 0.004, 0.25, 1.1);
    lastCX = t.clientX; lastCY = t.clientY;
    G._lastCamInput = performance.now();
  }
  window.addEventListener('touchstart', e => {
    for (const t of e.changedTouches) {
      const onUI = t.target.closest && t.target.closest('.tbtn, .overlay, #hotbar, .panel, button');
      if (onUI) continue;
      if (t.clientX >= innerWidth * 0.45) {
        if (G._camId === null) { G._camId = t.identifier; lastCX = t.clientX; lastCY = t.clientY; }
        else if (G._pinchId === null) {
          G._pinchId = t.identifier;
          pinchDist = 0;
        }
      }
    }
  }, { passive: true });
  window.addEventListener('touchmove', e => {
    if (G._camId !== null && G._pinchId !== null) {
      let a = null, b = null;
      for (const t of e.touches) {
        if (t.identifier === G._camId) a = t;
        if (t.identifier === G._pinchId) b = t;
      }
      if (a && b) {
        const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        if (pinchDist) G.camInput.dist = G.clamp(G.camInput.dist - (d - pinchDist) * 0.03, 6, 20);
        pinchDist = d;
      }
    }
  }, { passive: true });

  // ---------- action buttons ----------
  const bind = (id, down, up) => {
    const el = document.getElementById(id);
    el.addEventListener('touchstart', e => { e.preventDefault(); down(); el.classList.add('pressed'); }, { passive: false });
    el.addEventListener('touchend', e => { e.preventDefault(); up && up(); el.classList.remove('pressed'); }, { passive: false });
  };
  bind('tbJump', () => { input.jumpEdge = 1; input.jump = 1; }, () => { input.jump = 0; });
  bind('tbAtk', () => { input.attackEdge = 1; });
  bind('tbAct', () => { input.interactEdge = 1; input.study = 1; }, () => { input.study = 0; });
  bind('tbMask', () => G.ui.toggleDial());
  bind('tbCrouch', () => {
    input.crouch = input.crouch ? 0 : 1;
    document.getElementById('tbCrouch').classList.toggle('latched', !!input.crouch);
  });
  bind('tbHowl', () => { input.specialEdge = 1; });
  bind('tbMap', () => G.ui.toggleNotebook());

  // block double-tap zoom / context menu
  document.addEventListener('dblclick', e => e.preventDefault());
  document.addEventListener('contextmenu', e => { if (G.isTouch) e.preventDefault(); });
};

// contextual label on the interact button
G.mobileInteractLabel = function (txt) {
  const el = document.getElementById('tbAct');
  if (!el) return;
  el.querySelector('span').textContent = txt ? '❗' : '👁';
};
