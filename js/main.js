'use strict';
// ---------------------------------------------------------------------------
// Wildmask — main.js : boot, loop, studying, interactions, expeditions
// ---------------------------------------------------------------------------

// ----- meta progression (survives death & new islands) -----
G.meta = { coins: 0, dna: {}, masks: {}, zoo: {}, study: {}, upg: {} };
G.save = function () { try { localStorage.setItem('wildmask_meta', JSON.stringify(G.meta)); } catch (e) {} };
(function load() {
  try {
    const m = JSON.parse(localStorage.getItem('wildmask_meta'));
    if (m) Object.assign(G.meta, m);
  } catch (e) {}
  let s = parseInt(localStorage.getItem('wildmask_seed'), 10);
  if (!s) { s = Math.floor(Math.random() * 1e9) + 1; localStorage.setItem('wildmask_seed', s); }
  G.seed = s;
})();
G.newExpedition = function () {
  G.save();
  localStorage.setItem('wildmask_seed', Math.floor(Math.random() * 1e9) + 1);
  location.reload();
};
G.expeditionOver = function () {
  if (G._over) return;
  G._over = true;
  G.save();
  document.getElementById('gameover').classList.remove('hidden');
  localStorage.setItem('wildmask_seed', Math.floor(Math.random() * 1e9) + 1);
  setTimeout(() => location.reload(), 3400);
};
G.hurtPlayer = function (n, fromPos) { if (G.player) G.player.hurt(n, fromPos); };

// ----- three.js scene -----
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = G.scene = new THREE.Scene();
const SKY_DAY = new THREE.Color(0x9fd9f0), SKY_EVE = new THREE.Color(0xf0b98a), SKY_NIGHT = new THREE.Color(0x2a3558);
scene.background = SKY_DAY.clone();
scene.fog = new THREE.Fog(scene.background, 55, 150);

const camera = G.camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 600);
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

const hemi = new THREE.HemisphereLight(0xcfe8ff, 0x8a9a6a, 0.45);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff2d8, 0.8);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left = -30; sun.shadow.camera.right = 30;
sun.shadow.camera.top = 30; sun.shadow.camera.bottom = -30;
sun.shadow.camera.far = 120;
scene.add(sun); scene.add(sun.target);

// ----- build world -----
G.geo.init();
G.buildTerrain(scene);
G.buildProps(scene);
G.buildHub(scene);
G.buildClouds(scene);
G.spawnAnimals(scene);
const P = G.player = G.buildPlayer(scene);
// restore zoo residents from meta
for (const k in G.meta.zoo) if (G.meta.zoo[k]) G.addZooResident(scene, k);
G.ui.init();

// remove the individual field animal only for freshly completed species this run
// (species already in the zoo still roam the wild too — the zoo has "ambassadors")

// ----- input -----
const input = { f: 0, b: 0, l: 0, r: 0, sprint: 0, crouch: 0, study: 0, jumpEdge: 0, attackEdge: 0, interactEdge: 0 };
const KEYMAP = {
  KeyW: 'f', ArrowUp: 'f', KeyS: 'b', ArrowDown: 'b',
  KeyA: 'l', ArrowLeft: 'l', KeyD: 'r', ArrowRight: 'r',
  ShiftLeft: 'sprint', ShiftRight: 'sprint', KeyC: 'crouch', KeyE: 'study'
};
addEventListener('keydown', e => {
  if (e.repeat) return;
  G.audio.init();
  const k = KEYMAP[e.code];
  if (k) input[k] = 1;
  if (e.code === 'Space') { input.jumpEdge = 1; e.preventDefault(); }
  if (e.code === 'KeyF') input.attackEdge = 1;
  if (e.code === 'KeyE') input.interactEdge = 1;
  if (e.code === 'Tab' || e.code === 'KeyN') { G.ui.toggleNotebook(); e.preventDefault(); }
  if (e.code === 'KeyH') document.getElementById('help').classList.toggle('hidden');
  if (e.code === 'Escape') { G.ui.closeTent(); G.ui.toggleNotebook(false); }
  if (e.code.startsWith('Digit')) {
    const n = parseInt(e.code.slice(5), 10);
    if (n >= 1 && n <= 5) P.setMask(G.MASK_ORDER[n - 1]);
    if (n === 0) P.setMask('none');
  }
  if (e.code === 'KeyX') P.setMask('none');
});
addEventListener('keyup', e => { const k = KEYMAP[e.code]; if (k) input[k] = 0; });

// camera orbit: Q/E rotate... E is study — use Q/R? Use drag + Q/Z. Mouse drag preferred.
let camYaw = 0, camDist = 12, camPitch = 0.58;
let dragging = false, lastX = 0, lastY = 0;
addEventListener('mousedown', e => { if (e.target.tagName === 'CANVAS') { dragging = true; lastX = e.clientX; lastY = e.clientY; } });
addEventListener('mouseup', () => dragging = false);
addEventListener('mousemove', e => {
  if (!dragging) return;
  camYaw -= (e.clientX - lastX) * 0.005;
  camPitch = G.clamp(camPitch + (e.clientY - lastY) * 0.003, 0.25, 1.1);
  lastX = e.clientX; lastY = e.clientY;
});
addEventListener('wheel', e => { camDist = G.clamp(camDist + e.deltaY * 0.01, 6, 20); }, { passive: true });
addEventListener('keydown', e => {
  if (e.code === 'KeyQ') camYaw += 0.5;
  if (e.code === 'KeyR') camYaw -= 0.5;
});

// ----- studying -----
function findStudyTarget() {
  let best = null, bestD = 1e9;
  for (const a of G.animals) {
    if (!a.alive) continue;
    const d = Math.hypot(a.pos.x - P.pos.x, a.pos.z - P.pos.z);
    const maxR = a.sp.studyR * (P.small ? 1 : 1) + (G.meta.upg.journal ? 2 : 0);
    if (d > maxR) continue;
    if (a.sp.needSmall && !P.small) { if (d < maxR && d < bestD) { best = a; bestD = d; best._tooBig = true; } continue; }
    a._tooBig = false;
    if (d < bestD) { best = a; bestD = d; }
  }
  return best;
}

function completeStudy(a) {
  const k = a.key;
  G.meta.dna[k] = true;
  G.meta.zoo[k] = true;
  G.meta.study[k] = 100;
  G.sfx.jingle();
  G.ui.bigBanner(a.sp.emoji + ' ' + a.sp.name + ' fully studied!',
    'DNA acquired — craft its mask at the tent ⛺. The ' + a.sp.name.toLowerCase() + ' has been sent to your zoo!');
  // this individual heads to the zoo
  a.alive = false;
  a.mesh.visible = false;
  G.addZooResident(scene, k);
  G.save();
}

// ----- interactions (E) -----
function tryInteract() {
  // tent
  if (P.pos.distanceTo(G.tentPos) < 4.5) { G.ui.openTent(); return true; }
  // burrows (small only)
  if (P.small) {
    for (const b of G.burrows) {
      if (Math.hypot(b.x - P.pos.x, b.z - P.pos.z) < 1.2) {
        const others = G.burrows.filter(o => o !== b);
        const dest = others[Math.floor(Math.random() * others.length)];
        if (dest) {
          G.sfx.burrow();
          P.pos.set(dest.x, G.heightAt(dest.x, dest.z) + 0.2, dest.z);
          G.toast('You squeeze through the burrow network and pop out somewhere new!');
        }
        return true;
      }
    }
  }
  return false;
}

// ----- day/night -----
let dayT = 0.22; // start morning
const DAY_LEN = 300;

// ----- main loop -----
let last = performance.now();
let studyTickT = 0;
G.paused = false;
G.started = false;

function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!G.started || G._over) { renderer.render(scene, camera); return; }

  if (!G.paused) {
    // interactions must resolve before study-hold
    if (input.interactEdge) {
      if (!tryInteract()) input._studyHeld = true;
    }
    if (!input.study) input._studyHeld = false;

    G.updatePlayer(P, input, dt, camYaw);

    for (const a of G.animals) a.update(dt, P);
    G.updateZoo(dt);
    G.updateGuests(dt, scene);

    // coins spin + pickup
    for (let i = G.coins.length - 1; i >= 0; i--) {
      const c = G.coins[i];
      c.t += dt;
      c.mesh.rotation.z = c.t * 3;
      c.mesh.position.y = c.y + Math.sin(c.t * 2) * 0.1;
      if (Math.hypot(c.x - P.pos.x, c.z - P.pos.z) < 1.1 && Math.abs(c.y - P.pos.y) < 2) {
        scene.remove(c.mesh);
        G.coins.splice(i, 1);
        G.addCoins(1, c.mesh.position);
      }
    }

    // studying
    const target = findStudyTarget();
    if (target && target._tooBig) {
      G.ui.study(target, Math.floor(G.meta.study[target.key] || 0), false);
      document.getElementById('studyhint').textContent = 'too small to observe — you\'d need to be tiny...';
    } else if (target && (G.meta.study[target.key] || 0) < 100) {
      const pct = G.meta.study[target.key] || 0;
      const held = input.study && input._studyHeld !== false && !G.paused;
      let active = false;
      if (input.study) {
        // must roughly face the animal
        const fx = Math.sin(P.body.rotation.y), fz = Math.cos(P.body.rotation.y);
        const dx = target.pos.x - P.pos.x, dz = target.pos.z - P.pos.z;
        const d = Math.hypot(dx, dz) || 1;
        if ((fx * dx + fz * dz) / d > 0.2 || d < 2.5) {
          active = true;
          let rate = 15;
          if (G.meta.upg.journal) rate *= 1.6;
          if (target.stun > 0) rate *= 2;
          if (P.crouch) rate *= 1.3;
          const next = pct + rate * dt;
          G.meta.study[target.key] = next;
          studyTickT += dt;
          if (studyTickT > 0.33) { studyTickT = 0; G.sfx.tick(); }
          if (next >= 100) completeStudy(target);
        }
      }
      G.ui.study(target, Math.min(100, Math.floor(G.meta.study[target.key] || 0)), active);
    } else if (target) {
      G.ui.study(target, 100, false);
      document.getElementById('studyhint').textContent = 'fully studied ✓';
    } else {
      G.ui.study(null);
    }

    // prompts
    if (P.pos.distanceTo(G.tentPos) < 4.5) G.ui.prompt('E — enter field tent  ⛺  (craft masks · upgrades · zoo)');
    else if (P.small && G.burrows.some(b => Math.hypot(b.x - P.pos.x, b.z - P.pos.z) < 1.2)) G.ui.prompt('E — squeeze into the burrow');
    else G.ui.prompt(null);

    // clouds drift
    if (G.clouds) { G.clouds.position.x += dt * 0.7; if (G.clouds.position.x > 260) G.clouds.position.x = -260; }
    // campfire flicker
    if (G.fireMesh) G.fireMesh.children[6].scale.setScalar(0.9 + Math.sin(now * 0.01) * 0.15);
    // water shimmer
    if (G.water) G.water.position.y = G.WATER_Y + Math.sin(now * 0.0012) * 0.05;

    // day/night tint
    dayT = (dayT + dt / DAY_LEN) % 1;
    const sunA = dayT * Math.PI * 2;
    const daylight = G.clamp(Math.sin(sunA) * 1.4 + 0.55, 0.16, 1);
    sun.intensity = 0.8 * daylight;
    hemi.intensity = 0.2 + 0.3 * daylight;
    const sky = scene.background;
    if (daylight > 0.85) sky.copy(SKY_DAY);
    else if (daylight > 0.4) sky.copy(SKY_EVE).lerp(SKY_DAY, (daylight - 0.4) / 0.45);
    else sky.copy(SKY_NIGHT).lerp(SKY_EVE, daylight / 0.4);
    scene.fog.color.copy(sky);
    sun.position.set(P.pos.x + Math.cos(sunA) * 40, Math.max(8, Math.sin(sunA) * 60), P.pos.z + 25);
    sun.target.position.copy(P.pos);

    // HUD
    G.ui.updateBars(P);
    G.ui.drawMinimap(P);
    G.ui.objective();
  }

  // camera follow (curved-world friendly: modest distance, gentle pitch)
  const cd = camDist * (P.small ? 0.45 : 1);
  const cx = P.pos.x + Math.sin(camYaw) * cd * Math.cos(camPitch);
  const cz = P.pos.z + Math.cos(camYaw) * cd * Math.cos(camPitch);
  let cy = P.pos.y + cd * Math.sin(camPitch) + 1.2;
  const camGround = G.heightAt(cx, cz) + 0.6;
  if (cy < camGround) cy = camGround;
  camera.position.lerp(new THREE.Vector3(cx, cy, cz), Math.min(1, dt * 7));
  const look = new THREE.Vector3(P.pos.x, P.pos.y + 1.4 * P.mesh.scale.x, P.pos.z);
  camera.lookAt(look);

  // reset edges
  input.jumpEdge = 0; input.attackEdge = 0; input.interactEdge = 0;

  renderer.render(scene, camera);
}
requestAnimationFrame(frame);
