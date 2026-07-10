'use strict';
// ---------------------------------------------------------------------------
// Wildmask — main.js : boot, loop, studying, interactions, expeditions
// ---------------------------------------------------------------------------

// ----- meta progression (survives death & new islands) -----
G.meta = {
  coins: 0, dna: {}, masks: {}, zoo: {}, study: {}, upg: {},
  plants: {}, ingredients: {}, decor: {}, quest: 0, poachersKO: 0
};
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
G.buildCamps(scene);
G.spawnAnimals(scene);
G.buildNPCs(scene);
const P = G.player = G.buildPlayer(scene);
for (const k in G.meta.zoo) if (G.meta.zoo[k]) G.addZooResident(scene, k);
for (const z of G.zones) G.buildZoneDecor(z);
G.ui.init();

// guide beacon: a golden pillar of light reaching into the sky
const beacon = new THREE.Group();
{
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.8, 70, 10, 1, true),
    G.curve(new THREE.MeshLambertMaterial({
      color: 0xffe27a, emissive: 0xc9a428, transparent: true, opacity: 0.32,
      side: THREE.DoubleSide, depthWrite: false
    })));
  pillar.position.y = 35;
  beacon.add(pillar);
  const c = new THREE.Mesh(G.geo.cone, G.mat(0xffd94d, { emissive: 0x8a6a00, key: 'beacon' }));
  c.scale.set(0.5, 0.9, 0.5);
  c.rotation.x = Math.PI;
  beacon.add(c);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.08, 6, 14), G.mat(0xffd94d, { emissive: 0x8a6a00, key: 'beacon' }));
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -0.6;
  beacon.add(ring);
}
beacon.visible = false;
scene.add(beacon);
G.setBeacon = t => { G._beaconT = t; };

// ----- little FX pool: dust puffs, water ripples -----
G.fx = (() => {
  const items = [];
  const puffGeo = new THREE.SphereGeometry(1, 6, 5);
  const ringGeo = new THREE.TorusGeometry(1, 0.06, 5, 16);
  function spawn(geo, color, opacity) {
    const mat = G.curve(new THREE.MeshLambertMaterial({ color, transparent: true, opacity }));
    const m = new THREE.Mesh(geo, mat);
    scene.add(m);
    return m;
  }
  return {
    dust(pos, n) {
      for (let i = 0; i < (n || 1); i++) {
        const m = spawn(puffGeo, 0xd9cba4, 0.65);
        m.position.set(pos.x + (Math.random() - 0.5) * 0.6, pos.y + 0.15, pos.z + (Math.random() - 0.5) * 0.6);
        m.scale.setScalar(0.12 + Math.random() * 0.1);
        items.push({ m, life: 0.55, max: 0.55, vy: 0.8 + Math.random() * 0.6, grow: 1.6 });
      }
    },
    ripple(pos) {
      const m = spawn(ringGeo, 0xeaf8ff, 0.55);
      m.rotation.x = -Math.PI / 2;
      m.position.set(pos.x, G.WATER_Y + 0.03, pos.z);
      m.scale.setScalar(0.35);
      items.push({ m, life: 0.9, max: 0.9, vy: 0, grow: 2.2 });
    },
    spark(pos) { // firefly glimmer drifting upward
      const m = spawn(puffGeo, 0xd8f2a0, 0.9);
      m.material.emissive = new THREE.Color(0x6a8a1d);
      m.position.set(pos.x + (Math.random() - 0.5) * 16, pos.y + 0.4 + Math.random() * 2.5, pos.z + (Math.random() - 0.5) * 16);
      m.scale.setScalar(0.06);
      items.push({ m, life: 2.8, max: 2.8, vy: 0.35, grow: 0, vx: (Math.random() - 0.5) * 0.8, vz: (Math.random() - 0.5) * 0.8 });
    },
    petal(pos) { // drifting cherry-blossom petal
      const m = spawn(puffGeo, 0xf2a9c4, 0.9);
      m.position.set(pos.x + (Math.random() - 0.5) * 14, pos.y + 4 + Math.random() * 5, pos.z + (Math.random() - 0.5) * 14);
      m.scale.set(0.09, 0.03, 0.06);
      items.push({ m, life: 3.2, max: 3.2, vy: -1.1, grow: 0, vx: 0.6 + Math.random(), vz: (Math.random() - 0.5) });
    },
    burst(pos, color) { // impact pop (cutscene hits, dive slams)
      for (let i = 0; i < 6; i++) {
        const m = spawn(puffGeo, color || 0xffe08a, 0.85);
        m.position.set(pos.x, pos.y + 0.8, pos.z);
        m.scale.setScalar(0.15);
        items.push({
          m, life: 0.45, max: 0.45, grow: 1.2,
          vx: (Math.random() - 0.5) * 5, vy: 1 + Math.random() * 3, vz: (Math.random() - 0.5) * 5
        });
      }
    },
    update(dt) {
      for (let i = items.length - 1; i >= 0; i--) {
        const it = items[i];
        it.life -= dt;
        if (it.life <= 0) { scene.remove(it.m); it.m.material.dispose(); items.splice(i, 1); continue; }
        const k = it.life / it.max;
        it.m.material.opacity = k * 0.65;
        it.m.scale.multiplyScalar(1 + it.grow * dt);
        it.m.position.y += (it.vy || 0) * dt;
        if (it.vx) { it.m.position.x += it.vx * dt; it.m.position.z += it.vz * dt; }
      }
    }
  };
})();
// KO stars: dizzy halo for knocked-out poachers (and cutscene victims)
G.makeKOStars = function () {
  const g = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const s = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 0), G.mat(0xffd94d, { emissive: 0x8a6a00, key: 'star' }));
    const a = i / 3 * Math.PI * 2;
    s.position.set(Math.cos(a) * 0.5, 0, Math.sin(a) * 0.5);
    g.add(s);
  }
  scene.add(g);
  return g;
};

// ----- input -----
const input = {
  f: 0, b: 0, l: 0, r: 0, jx: 0, jy: 0,
  sprint: 0, crouch: 0, study: 0, jump: 0,
  jumpEdge: 0, attackEdge: 0, interactEdge: 0, specialEdge: 0
};
G.input = input;
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
  if (e.code === 'Space') { input.jumpEdge = 1; input.jump = 1; e.preventDefault(); }
  if (e.code === 'KeyF') input.attackEdge = 1;
  if (e.code === 'KeyE') input.interactEdge = 1;
  if (e.code === 'KeyV') input.specialEdge = 1;
  if (e.code === 'KeyG') G.ui.toggleDial();
  if (e.code === 'Tab' || e.code === 'KeyN') { G.ui.toggleNotebook(); e.preventDefault(); }
  if (e.code === 'KeyH') document.getElementById('help').classList.toggle('hidden');
  if (e.code === 'KeyM') { const m = G.music.toggleMute(); G.toast(m ? '🔇 music off' : '🎵 music on'); }
  if (e.code === 'Escape') { G.ui.closeTent(); G.ui.toggleNotebook(false); G.ui.toggleDial(false); G.dialog.close(); }
  if (e.code.startsWith('Digit')) {
    const n = parseInt(e.code.slice(5), 10);
    if (n >= 1 && n <= 9 && G.ownedMasks && G.ownedMasks[n - 1]) P.setMask(G.ownedMasks[n - 1]);
    if (n === 0) P.setMask('none');
  }
  if (e.code === 'KeyX') P.setMask('none');
});
addEventListener('keyup', e => {
  const k = KEYMAP[e.code];
  if (k) input[k] = 0;
  if (e.code === 'Space') input.jump = 0;
});

// ----- camera (shared with touch controls via G.camInput) -----
G.camInput = { yaw: 0, pitch: 0.58, dist: 12 };
let dragging = false, lastX = 0, lastY = 0;
addEventListener('mousedown', e => { if (e.target.tagName === 'CANVAS') { dragging = true; lastX = e.clientX; lastY = e.clientY; } });
addEventListener('mouseup', () => dragging = false);
addEventListener('mousemove', e => {
  if (!dragging) return;
  G.camInput.yaw -= (e.clientX - lastX) * 0.005;
  G.camInput.pitch = G.clamp(G.camInput.pitch + (e.clientY - lastY) * 0.003, 0.25, 1.1);
  lastX = e.clientX; lastY = e.clientY;
  G._lastCamInput = performance.now();
});
addEventListener('wheel', e => { G.camInput.dist = G.clamp(G.camInput.dist + e.deltaY * 0.01, 6, 20); G._lastCamInput = performance.now(); }, { passive: true });
addEventListener('keydown', e => {
  if (e.code === 'KeyQ') { G.camInput.yaw += 0.5; G._lastCamInput = performance.now(); }
  if (e.code === 'KeyR') { G.camInput.yaw -= 0.5; G._lastCamInput = performance.now(); }
});
G.initMobile(input);

// ----- studying -----
function findStudyTarget() {
  let best = null, bestD = 1e9;
  for (const a of G.animals) {
    if (!a.alive || a.caged || a.hiddenT > 0 || (a.sp.nocturnal && !G.isNight)) continue;
    const d = Math.hypot(a.pos.x - P.pos.x, a.pos.z - P.pos.z);
    const maxR = a.sp.studyR + (G.meta.upg.journal ? 2 : 0);
    if (d > maxR) continue;
    if (a.sp.needSmall && !P.small) { if (d < bestD) { best = a; bestD = d; best._tooBig = true; best._tooDeep = false; } continue; }
    if (a.sp.underwater && !P.underwater) { if (d < bestD) { best = a; bestD = d; best._tooDeep = true; best._tooBig = false; } continue; }
    a._tooBig = false; a._tooDeep = false;
    if (d < bestD) { best = a; bestD = d; }
  }
  return best;
}
function completeStudy(a) {
  const k = a.key;
  G.meta.dna[k] = true;
  G.meta.zoo[k] = true;
  G.meta.study[k] = G.SPECIES[k].studyNeed;
  G.sfx.jingle();
  G.ui.bigBanner(a.sp.emoji + ' ' + a.sp.name + ' fully studied!',
    'DNA acquired — Tia can press its mask. The ' + a.sp.name.toLowerCase() + ' has been sent to your zoo!');
  a.alive = false;
  a.mesh.visible = false;
  G.addZooResident(scene, k);
  if (G.quest) G.quest.onStudyComplete(k);
  G.save();
}

// ----- interactions (E) -----
function tryInteract() {
  const npc = G.nearestNPC(P);
  if (npc) { G.talkTo(npc); return true; }
  if (P.pos.distanceTo(G.tentPos) < 4.5) { G.ui.openTent(); return true; }
  // plants
  for (const pl of G.plantNodes) {
    if (pl.taken) continue;
    if (Math.hypot(pl.x - P.pos.x, pl.z - P.pos.z) < 1.6) {
      pl.taken = true;
      pl.mesh.visible = false;
      G.meta.plants[pl.type] = (G.meta.plants[pl.type] || 0) + 1;
      G.toast(G.PLANTS[pl.type].emoji + ' Picked a ' + G.PLANTS[pl.type].name + ' — Cheryl will love this.');
      G.audio.tone(700, 0.12, 'sine', 0.06, 900);
      G.save();
      return true;
    }
  }
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
let dayT = 0.22;
const DAY_LEN = 300;
G.isNight = false;

// ----- main loop -----
let last = performance.now();
let studyTickT = 0;
G.paused = false;
G.started = false;

function frame(now) {
  requestAnimationFrame(frame);
  const rawDt = (now - last) / 1000;
  const dt = Math.min(0.05, rawDt);
  last = now;
  G.wind.value = now / 1000;
  if (!G.started || G._over) { renderer.render(scene, camera); return; }

  // scripted intro takes over the whole frame (real-time, so slow devices
  // don't stretch the choreography)
  if (G.cutscene.active) {
    G.cutscene.update(Math.min(0.25, rawDt), camera);
    if (G.fx) G.fx.update(dt);
    input.jumpEdge = 0; input.attackEdge = 0; input.interactEdge = 0; input.specialEdge = 0;
    renderer.render(scene, camera);
    return;
  }

  if (!G.paused) {
    if (input.interactEdge) tryInteract();

    // stealth: inside a bush + (crouching or fox mask)
    P.hidden = false;
    if (P.crouch || P.stats.stealth) {
      for (const b of G.bushes) {
        if (Math.hypot(b.x - P.pos.x, b.z - P.pos.z) < b.r) { P.hidden = true; break; }
      }
    }

    G.updatePlayer(P, input, dt, G.camInput.yaw);
    for (const a of G.animals) a.update(dt, P);
    G.tickRespawns(dt);
    G.updateZoo(dt);
    G.updateGuests(dt, scene);
    G.updatePoachers(dt, P);
    G.updateProjectiles(dt);
    G.updateNPCs(dt, P);
    G.updateBuffs(dt);
    G.updateTutorial(dt, P);
    G.fx.update(dt);

    // beacon follows its target
    const bt = G._beaconT;
    if (bt && bt.pos && bt.alive !== false) {
      beacon.visible = true;
      beacon.position.set(bt.pos.x, bt.pos.y + 2.8 + Math.sin(now * 0.005) * 0.35, bt.pos.z);
      beacon.rotation.y = now * 0.003;
    } else beacon.visible = false;

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
    // drops (ingredients / gear) pickup
    for (let i = G.drops.length - 1; i >= 0; i--) {
      const d = G.drops[i];
      d.t += dt;
      d.mesh.rotation.y = d.t;
      if (Math.hypot(d.x - P.pos.x, d.z - P.pos.z) < 1.4) {
        scene.remove(d.mesh);
        G.drops.splice(i, 1);
        if (d.kind === 'ingredient') {
          G.meta.ingredients[d.species] = (G.meta.ingredients[d.species] || 0) + 1;
          G.toast('📦 Collected ' + G.SPECIES[d.species].ingredient + '. Montana can work with this.');
        } else {
          G.addCoins(6, d.mesh.position);
          G.toast('Confiscated Guild gear — fenced it for 6 🪙.');
        }
        G.save();
      }
    }

    // studying
    const target = findStudyTarget();
    if (target && target._tooBig) {
      G.ui.study(target, Math.floor((G.meta.study[target.key] || 0) / target.sp.studyNeed * 100), false);
      document.getElementById('studyhint').textContent = 'too small to observe — you\'d need to be tiny...';
    } else if (target && target._tooDeep) {
      G.ui.study(target, Math.floor((G.meta.study[target.key] || 0) / target.sp.studyNeed * 100), false);
      document.getElementById('studyhint').textContent = 'you can\'t see it from up here — dive below the surface!';
    } else if (target && (G.meta.study[target.key] || 0) < target.sp.studyNeed) {
      const raw = G.meta.study[target.key] || 0;
      let active = false;
      if (input.study) {
        const fx = Math.sin(P.body.rotation.y), fz = Math.cos(P.body.rotation.y);
        const dx = target.pos.x - P.pos.x, dz = target.pos.z - P.pos.z;
        const d = Math.hypot(dx, dz) || 1;
        if ((fx * dx + fz * dz) / d > 0.2 || d < 2.5) {
          active = true;
          let rate = 15;
          if (G.meta.upg.journal) rate *= 1.6;
          if (target.stun > 0) rate *= 2;
          if (P.crouch) rate *= 1.3;
          if (target.tutorial) rate *= 1.5;
          const next = raw + rate * dt;
          G.meta.study[target.key] = next;
          studyTickT += dt;
          if (studyTickT > 0.33) { studyTickT = 0; G.sfx.tick(); }
          if (next >= target.sp.studyNeed) completeStudy(target);
        }
      }
      G.ui.study(target, Math.min(100, Math.floor((G.meta.study[target.key] || 0) / target.sp.studyNeed * 100)), active);
    } else if (target) {
      G.ui.study(target, 100, false);
      document.getElementById('studyhint').textContent = 'fully studied ✓';
    } else {
      G.ui.study(null);
    }

    // prompts
    const npc = G.nearestNPC(P);
    let nearPlant = null;
    for (const pl of G.plantNodes) {
      if (!pl.taken && Math.hypot(pl.x - P.pos.x, pl.z - P.pos.z) < 1.6) { nearPlant = pl; break; }
    }
    if (npc) G.ui.prompt('E — talk to ' + npc.name + ' ' + npc.emoji);
    else if (P.pos.distanceTo(G.tentPos) < 4.5) G.ui.prompt('E — enter field tent ⛺');
    else if (nearPlant) G.ui.prompt('E — pick ' + G.PLANTS[nearPlant.type].name + ' ' + G.PLANTS[nearPlant.type].emoji);
    else if (P.small && G.burrows.some(b => Math.hypot(b.x - P.pos.x, b.z - P.pos.z) < 1.2)) G.ui.prompt('E — squeeze into the burrow');
    else G.ui.prompt(null);

    // ambience
    if (G.clouds) { G.clouds.position.x += dt * 0.7; if (G.clouds.position.x > 260) G.clouds.position.x = -260; }
    if (G.fireMesh) G.fireMesh.children[6].scale.setScalar(0.9 + Math.sin(now * 0.01) * 0.15);
    if (G.water) G.water.position.y = G.WATER_Y + Math.sin(now * 0.0012) * 0.05;

    // day/night
    dayT = (dayT + dt / DAY_LEN) % 1;
    const sunA = dayT * Math.PI * 2;
    let daylight = G.clamp(Math.sin(sunA) * 1.4 + 0.55, 0.16, 1);
    G.isNight = daylight < 0.35;
    if (P.stats.nightVision && G.isNight) daylight = Math.max(daylight, 0.6); // owl eyes
    sun.intensity = 0.8 * daylight;
    hemi.intensity = 0.2 + 0.3 * daylight;
    const sky = scene.background;
    if (daylight > 0.85) sky.copy(SKY_DAY);
    else if (daylight > 0.4) sky.copy(SKY_EVE).lerp(SKY_DAY, (daylight - 0.4) / 0.45);
    else sky.copy(SKY_NIGHT).lerp(SKY_EVE, daylight / 0.4);
    scene.fog.color.copy(sky);
    scene.fog.near = 55; scene.fog.far = 150;
    // beneath the surface: deep teal murk (the duck & koi see much farther)
    if (camera.position.y < G.WATER_Y - 0.15) {
      scene.fog.color.set(0x1d5b74);
      sky.set(0x1d5b74);
      scene.fog.near = 2;
      scene.fog.far = P.stats.underSight ? 75 : 30;
    }
    sun.position.set(P.pos.x + Math.cos(sunA) * 40, Math.max(8, Math.sin(sunA) * 60), P.pos.z + 25);
    sun.target.position.copy(P.pos);

    // blossom-grove petals drift around Stuart
    if (G.groveC && Math.hypot(P.pos.x - G.groveC.x, P.pos.z - G.groveC.z) < 24 && Math.random() < dt * 7) {
      G.fx.petal(P.pos);
    }
    // region discoveries
    G.meta.seenRegions = G.meta.seenRegions || {};
    for (const rg of G.REGIONS) {
      if (!rg.discover || G.meta.seenRegions[rg.discover]) continue;
      if (Math.hypot(P.pos.x - rg.x, P.pos.z - rg.z) < rg.r) {
        G.meta.seenRegions[rg.discover] = true;
        G.save();
        G.ui.bigBanner(rg.emoji + ' ' + rg.name, rg.blurb);
      }
    }
    // firefly sparks dance in the Hollow after dark
    if (G.isNight && G.hollowC && Math.hypot(P.pos.x - G.hollowC.x, P.pos.z - G.hollowC.z) < 26 && Math.random() < dt * 6) {
      G.fx.spark(P.pos);
    }

    // HUD
    G.ui.updateBars(P);
    G.ui.drawMinimap(P);
    G.ui.objective();
  }

  // camera follow — drifts around behind Stuart when you haven't steered it
  const ci = G.camInput;
  if (!G.paused && P._moving && now - (G._lastCamInput || 0) > 1600) {
    const wantYaw = Math.atan2(-P._moveDirX, -P._moveDirZ);
    let dy = wantYaw - ci.yaw;
    while (dy > Math.PI) dy -= Math.PI * 2;
    while (dy < -Math.PI) dy += Math.PI * 2;
    ci.yaw += dy * Math.min(1, dt * 1.4);
  }
  // subtle FOV kick while sprinting
  const wantFov = (input.sprint && P._moving && !P.swimming) ? 56 : 50;
  if (Math.abs(camera.fov - wantFov) > 0.1) {
    camera.fov += (wantFov - camera.fov) * Math.min(1, dt * 5);
    camera.updateProjectionMatrix();
  }
  const cd = ci.dist * (P.small ? 0.45 : 1);
  const cx = P.pos.x + Math.sin(ci.yaw) * cd * Math.cos(ci.pitch);
  const cz = P.pos.z + Math.cos(ci.yaw) * cd * Math.cos(ci.pitch);
  let cy = P.pos.y + cd * Math.sin(ci.pitch) + 1.2;
  const camGround = G.heightAt(cx, cz) + 0.6;
  if (cy < camGround) cy = camGround;
  camera.position.lerp(new THREE.Vector3(cx, cy, cz), Math.min(1, dt * 7));
  const look = new THREE.Vector3(P.pos.x, P.pos.y + 1.4 * P.mesh.scale.x, P.pos.z);
  camera.lookAt(look);

  input.jumpEdge = 0; input.attackEdge = 0; input.interactEdge = 0; input.specialEdge = 0;

  renderer.render(scene, camera);
}
requestAnimationFrame(frame);
