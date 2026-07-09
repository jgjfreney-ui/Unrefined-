'use strict';
// ---------------------------------------------------------------------------
// Wildmask — player.js : explorer character, mask transformations, movement
// ---------------------------------------------------------------------------

// stats per mask (null key = bare human)
G.MASK_STATS = {
  none:     { speed: 5.5, sprint: 8.5, jump: 8.5,  slope: 1.7, swim: 1.8, breath: 8,   small: false, stamDrain: 14 },
  frog:     { speed: 5.5, sprint: 8.5, jump: 15.5, slope: 1.7, swim: 2.6, breath: 20,  small: false, stamDrain: 14, kick: true },
  horse:    { speed: 7.0, sprint: 16,  jump: 9,    slope: 1.7, swim: 1.8, breath: 8,   small: false, stamDrain: 2 },
  croc:     { speed: 4.8, sprint: 7,   jump: 7.5,  slope: 1.5, swim: 7.5, breath: 240, small: false, stamDrain: 14 },
  mouse:    { speed: 4.2, sprint: 6.5, jump: 6,    slope: 1.7, swim: 1.4, breath: 6,   small: true,  stamDrain: 10 },
  scorpion: { speed: 4.0, sprint: 6,   jump: 6,    slope: 999, swim: 1.2, breath: 6,   small: true,  stamDrain: 10, claw: true }
};
G.MASK_ORDER = ['frog', 'horse', 'croc', 'mouse', 'scorpion'];

G.buildPlayer = function (scene) {
  const S = G.geo.sphere, X = G.geo.box, C = G.geo.cyl;
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  G.part(body, S, 0xe8a13c, 0, 0.62, 0, 0.34, 0.42, 0.28);              // shirt
  G.part(body, X, 0x8a6239, 0, 0.62, -0.3, 0.4, 0.5, 0.16);             // backpack
  G.part(body, S, 0x6b4c2c, 0.13, 0.1, 0.02, 0.13, 0.09, 0.17);         // feet
  G.part(body, S, 0x6b4c2c, -0.13, 0.1, 0.02, 0.13, 0.09, 0.17);
  const head = G.part(body, S, 0xffd9a6, 0, 1.28, 0, 0.42);
  G.part(head, S, 0x1c1c1c, 0.32, 0.05, 0.93, 0.11);                    // eyes
  G.part(head, S, 0x1c1c1c, -0.32, 0.05, 0.93, 0.11);
  const hands = [
    G.part(body, S, 0xffd9a6, 0.4, 0.62, 0.05, 0.11),
    G.part(body, S, 0xffd9a6, -0.4, 0.62, 0.05, 0.11)
  ];
  // safari hat (hidden when masked)
  const hat = new THREE.Group();
  G.part(hat, C, 0xcbb476, 0, 0.32, 0, 0.62, 0.1, 0.62);
  G.part(hat, S, 0xcbb476, 0, 0.38, 0, 0.4, 0.3, 0.4);
  head.add(hat);

  // ----- mask headgear (one group per mask, toggled) -----
  const masks = {};
  { // frog: green dome + goofy eyes
    const g = new THREE.Group();
    G.part(g, S, 0x62b64e, 0, 0.12, 0, 1.02, 0.95, 1.02).castShadow = false;
    const e1 = G.part(g, S, 0x62b64e, 0.45, 1.0, 0.2, 0.32);
    const e2 = G.part(g, S, 0x62b64e, -0.45, 1.0, 0.2, 0.32);
    G.part(e1, S, 0x1c1c1c, 0, 0.3, 0.5, 0.45);
    G.part(e2, S, 0x1c1c1c, 0, 0.3, 0.5, 0.45);
    masks.frog = g;
  }
  { // horse: ears + snout + mane
    const g = new THREE.Group();
    G.part(g, S, 0xb07845, 0, 0.1, 0, 1.02, 0.98, 1.02).castShadow = false;
    G.part(g, X, 0x8f5f36, 0, -0.1, 0.85, 0.55, 0.5, 0.6);
    G.part(g, G.geo.cone, 0x8f5f36, 0.5, 1.05, 0, 0.22, 0.55, 0.22);
    G.part(g, G.geo.cone, 0x8f5f36, -0.5, 1.05, 0, 0.22, 0.55, 0.22);
    G.part(g, X, 0x5c4326, 0, 0.75, -0.5, 0.3, 0.8, 0.7);
    masks.horse = g;
  }
  { // croc: long toothy snout + eye ridges
    const g = new THREE.Group();
    G.part(g, S, 0x5d8c46, 0, 0.1, 0, 1.02, 0.98, 1.02).castShadow = false;
    G.part(g, X, 0x6f9e55, 0, -0.15, 1.0, 0.7, 0.4, 1.4);
    G.part(g, X, 0xf5f2e3, 0, -0.38, 1.0, 0.62, 0.12, 1.3);
    G.part(g, S, 0xf7d83b, 0.35, 0.55, 0.55, 0.2);
    G.part(g, S, 0xf7d83b, -0.35, 0.55, 0.55, 0.2);
    masks.croc = g;
  }
  { // mouse: big round ears + whisker nose
    const g = new THREE.Group();
    G.part(g, S, 0xa8a29c, 0, 0.1, 0, 1.02, 0.98, 1.02).castShadow = false;
    G.part(g, S, 0xd9a7b2, 0.72, 0.85, 0, 0.5, 0.5, 0.16);
    G.part(g, S, 0xd9a7b2, -0.72, 0.85, 0, 0.5, 0.5, 0.16);
    G.part(g, S, 0xf0b9c4, 0, -0.05, 0.95, 0.22);
    masks.mouse = g;
  }
  { // scorpion: dark helm + tail arcing over head + claw gloves handled below
    const g = new THREE.Group();
    G.part(g, S, 0x8c3b26, 0, 0.15, 0, 1.04, 1.0, 1.04).castShadow = false;
    let ty = 0.7, tz = -0.7;
    for (let i = 0; i < 4; i++) {
      G.part(g, S, 0x8c3b26, 0, ty, tz, 0.28 - i * 0.03);
      ty += 0.42; tz += 0.28;
    }
    const sting = G.part(g, G.geo.cone, 0x3a1810, 0, ty + 0.1, tz + 0.15, 0.16, 0.5, 0.16);
    sting.rotation.x = 2.4;
    masks.scorpion = g;
  }
  for (const k in masks) { masks[k].visible = false; head.add(masks[k]); }
  // scorpion claw gloves on hands
  const claws = [
    G.part(hands[0], S, 0x6d2c1b, 0, 0, 0.5, 2.2, 1.6, 2.6),
    G.part(hands[1], S, 0x6d2c1b, 0, 0, 0.5, 2.2, 1.6, 2.6)
  ];
  claws.forEach(c => c.visible = false);

  scene.add(root);

  const P = {
    mesh: root, body, head, hat, masks, claws,
    pos: root.position,
    vy: 0, onGround: true,
    yaw: 0,
    mask: 'none',
    stats: G.MASK_STATS.none,
    small: false, crouch: false, swimming: false,
    stamina: 100, breath: 100,
    hp: 6, maxHp: 6,
    iframes: 0, attackCd: 0, attackAnim: 0,
    walkT: 0
  };
  P.pos.set(0, G.heightAt(0, 0), 3);

  P.setMask = function (name) {
    if (name !== 'none' && !G.meta.masks[name]) return false;
    if (name === P.mask) name = 'none';
    P.mask = name;
    P.stats = G.MASK_STATS[name];
    P.hat.visible = name === 'none';
    for (const k in P.masks) P.masks[k].visible = (k === name);
    P.claws.forEach(c => c.visible = name === 'scorpion');
    const wasSmall = P.small;
    P.small = P.stats.small;
    const target = P.small ? 0.38 : 1;
    P._scaleTarget = target;
    if (name === 'none') G.sfx.unmask(); else G.sfx.mask();
    if (P.small && !wasSmall) G.toast('You shrink down... the world towers above!');
    if (!P.small && wasSmall) G.toast('Back to full size.');
    G.ui.refreshHotbar();
    G.ui.showMaskBanner(name);
    return true;
  };
  P._scaleTarget = 1;

  P.hurt = function (n, fromPos) {
    if (P.iframes > 0) return;
    P.iframes = 1.2;
    P.hp -= n;
    G.sfx.hurt();
    G.ui.flashDamage();
    if (fromPos) { // knockback
      const dx = P.pos.x - fromPos.x, dz = P.pos.z - fromPos.z;
      const d = Math.hypot(dx, dz) || 1;
      P.pos.x += dx / d * 1.5; P.pos.z += dz / d * 1.5;
      P.vy = 5;
      P.onGround = false;
    }
    G.ui.refreshHearts();
    if (P.hp <= 0) G.expeditionOver();
  };

  return P;
};

// ----- per-frame update -----
G.updatePlayer = function (P, input, dt, camYaw) {
  const st = P.stats;
  P.iframes -= dt;
  P.attackCd -= dt;

  // smooth shrink/grow
  const cur = P.mesh.scale.x;
  if (Math.abs(cur - P._scaleTarget) > 0.001)
    P.mesh.scale.setScalar(cur + (P._scaleTarget - cur) * Math.min(1, dt * 6));
  const sizeMul = P.small ? 0.55 : 1;

  P.crouch = input.crouch && !P.swimming;

  // --- movement input in camera space ---
  let mx = 0, mz = 0;
  if (input.f) mz -= 1; if (input.b) mz += 1;
  if (input.l) mx -= 1; if (input.r) mx += 1;
  const moving = mx !== 0 || mz !== 0;
  let wx = 0, wz = 0;
  if (moving) {
    const len = Math.hypot(mx, mz);
    mx /= len; mz /= len;
    const sin = Math.sin(camYaw), cos = Math.cos(camYaw);
    wx = mx * cos - mz * sin;
    wz = mx * sin + mz * cos;
  }

  // --- water check ---
  const ground = G.heightAt(P.pos.x, P.pos.z);
  const depth = G.WATER_Y - ground;
  const wasSwimming = P.swimming;
  P.swimming = depth > 0.5 * sizeMul && P.pos.y < G.WATER_Y + 0.4;
  if (P.swimming && !wasSwimming) G.sfx.splash();

  // --- speed ---
  let speed = st.speed * sizeMul;
  const wantSprint = input.sprint && moving && P.stamina > 0 && !P.swimming;
  if (wantSprint) { speed = st.sprint * sizeMul; P.stamina -= st.stamDrain * dt; }
  else P.stamina = Math.min(100, P.stamina + 10 * dt);
  if (P.crouch) speed *= 0.42;
  if (P.swimming) speed = st.swim;
  if (P.stamina < 0) P.stamina = 0;

  // --- horizontal move with slope rules ---
  if (moving) {
    const step = speed * dt;
    const tryMove = (dx, dz) => {
      const nx = P.pos.x + dx, nz = P.pos.z + dz;
      if (Math.hypot(nx, nz) > G.RADIUS) return false;
      const nh = G.heightAt(nx, nz);
      const rise = nh - (P.onGround ? ground : P.pos.y);
      if (rise > 0.05) {
        const slope = rise / (Math.hypot(dx, dz) + 0.001);
        const maxS = st.slope * (P.onGround ? 1 : 0.5);
        if (slope > maxS && rise > 0.45 * sizeMul) return false;
      }
      P.pos.x = nx; P.pos.z = nz;
      return true;
    };
    if (!tryMove(wx * step, wz * step)) {
      // slide along the blocked axis
      if (!tryMove(wx * step, 0)) tryMove(0, wz * step);
    }
    // face movement direction
    const want = Math.atan2(wx, wz);
    let d = want - P.body.rotation.y;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    P.body.rotation.y += d * Math.min(1, dt * 12);
    P.walkT += dt * (wantSprint ? 14 : 9);
  }

  // --- vertical ---
  const groundNow = G.heightAt(P.pos.x, P.pos.z);
  if (P.swimming) {
    // bob at surface
    const surfY = G.WATER_Y - 0.25 * sizeMul + Math.sin(P.walkT * 0.5 + performance.now() * 0.002) * 0.05;
    P.pos.y += (surfY - P.pos.y) * Math.min(1, dt * 6);
    P.vy = 0; P.onGround = false;
    // breath drains only in deep water
    if (depth > 1.4) {
      P.breath -= 100 / st.breath * dt;
      if (P.breath <= 0) { P.breath = 0; P._drownT = (P._drownT || 0) + dt; if (P._drownT > 1) { P._drownT = 0; P.hurt(1); } }
    } else P.breath = Math.min(100, P.breath + 25 * dt);
    if (input.jumpEdge) { P.vy = st.jump * 0.55; P.pos.y += 0.2; P.swimming = false; P.onGround = false; }
  } else {
    P.breath = Math.min(100, P.breath + 30 * dt);
    P.vy -= 26 * dt;
    P.pos.y += P.vy * dt;
    if (P.pos.y <= groundNow) {
      P.pos.y = groundNow;
      P.vy = 0;
      P.onGround = true;
    } else P.onGround = false;
    if (input.jumpEdge && P.onGround) {
      P.vy = st.jump * (P.small ? 0.75 : 1);
      P.onGround = false;
      G.sfx.jump();
    }
  }

  // --- posture / walk bounce ---
  const bounce = (moving && P.onGround) ? Math.abs(Math.sin(P.walkT)) * 0.1 : 0;
  P.body.position.y = bounce + (P.crouch ? -0.22 : 0) + (P.swimming ? -0.15 : 0);
  P.body.rotation.x = P.swimming ? 0.9 : (P.crouch ? 0.25 : 0);
  if (P.attackAnim > 0) {
    P.attackAnim -= dt * 5;
    P.body.rotation.x = -Math.sin(P.attackAnim * Math.PI) * 0.5;
  }

  // --- attack: frog kick / scorpion venom claws ---
  if (input.attackEdge && (st.kick || st.claw) && P.attackCd <= 0) {
    P.attackCd = 0.6;
    P.attackAnim = 1;
    G.sfx.thock();
    const fx = Math.sin(P.body.rotation.y), fz = Math.cos(P.body.rotation.y);
    const hx = P.pos.x + fx * 1.4, hz = P.pos.z + fz * 1.4;
    // boulders (frog kick only)
    if (st.kick) {
      for (const b of G.boulders) {
        if (b.hp <= 0) continue;
        if (Math.hypot(b.x - hx, b.z - hz) < 2.2) {
          b.hp--;
          b.mesh.scale.setScalar(1 - (2 - b.hp) * 0.12);
          b.mesh.rotation.x += 0.4;
          if (b.hp <= 0) {
            b.mesh.visible = false;
            const n = 3 + Math.floor(Math.random() * 3);
            for (let i = 0; i < n; i++)
              G.spawnCoin(G.scene, b.x + (Math.random() - 0.5) * 2, b.z + (Math.random() - 0.5) * 2, G.heightAt(b.x, b.z) + 0.5);
            G.toast('Boulder smashed! Coins scattered out.');
          }
        }
      }
    }
    // animals: kick knockback / venom stun
    const reach = P.small ? 1.2 : 2.2;
    for (const a of G.animals) {
      if (!a.alive) continue;
      if (Math.hypot(a.pos.x - hx, a.pos.z - hz) < reach + 0.5) {
        if (st.claw) {
          a.stun = 7;
          G.toast(a.sp.name + ' is stunned by venom! Study it while it wobbles.');
        } else {
          a.stun = 1.2;
          const dx = a.pos.x - P.pos.x, dz = a.pos.z - P.pos.z, d = Math.hypot(dx, dz) || 1;
          a.pos.x += dx / d * 3; a.pos.z += dz / d * 3;
        }
      }
    }
  }
};
