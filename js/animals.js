'use strict';
// ---------------------------------------------------------------------------
// Wildmask — animals.js : species, builders, field AI, zoo residents & guests
// ---------------------------------------------------------------------------

// ----- species table -----
G.SPECIES = {
  horse: {
    name: 'Horse', emoji: '🐴', count: 5, speed: 3.2, fleeSpeed: 9,
    wary: 11, studyR: 9, needSmall: false,
    traits: 'Gallop: sprint at incredible speed with endless stamina.',
    hint: 'Grazes in the open plains. Skittish — crouch and approach slowly.',
    place: s => s.biome === 'plains' && s.h > 1 && s.h < 4.8
  },
  frog: {
    name: 'Frog', emoji: '🐸', count: 6, speed: 1.6, fleeSpeed: 4.5, hop: true,
    wary: 6, studyR: 6, needSmall: false,
    traits: 'Spring Legs: jump sky-high. Power Kick [F]: smash cracked boulders.',
    hint: 'Lives at pond and swamp shorelines.',
    place: s => (s.biome === 'plains' || s.biome === 'swamp') && s.h > 0.15 && s.h < 1.0
  },
  croc: {
    name: 'Crocodile', emoji: '🐊', count: 4, speed: 1.4, fleeSpeed: 0, aggro: true,
    wary: 0, studyR: 9, needSmall: false,
    traits: 'Amphibian: swim fast, near-endless breath, still walks on land.',
    hint: 'Lurks in swamp water. Study it from dry land — it bites swimmers!',
    place: s => s.biome === 'swamp' && s.h < 0.2
  },
  mouse: {
    name: 'Mouse', emoji: '🐭', count: 6, speed: 2.2, fleeSpeed: 6.5,
    wary: 8, studyR: 5, needSmall: false, tiny: 0.45,
    traits: 'Shrink: become tiny — study small creatures, squeeze into burrows.',
    hint: 'Scurries around the plains. Very wary; sneak up crouched.',
    place: s => s.biome === 'plains' && s.h > 0.8
  },
  scorpion: {
    name: 'Scorpion', emoji: '🦂', count: 6, speed: 1.1, fleeSpeed: 3, stinger: true,
    wary: 2.6, studyR: 3.5, needSmall: true, tiny: 0.4,
    traits: 'Venom Claws [F]: stun creatures. Wall Crawl: scale sheer cliffs. Tiny size.',
    hint: 'Too small to observe... shrink down with the Mouse Mask first.',
    place: s => s.biome === 'desert' && s.h > 1.2
  }
};

// ----- cute low-poly builders -----
const B = {};
B.horse = function () {
  const g = new THREE.Group(), S = G.geo.sphere, C = G.geo.cyl, X = G.geo.box;
  G.part(g, S, 0xb07845, 0, 1.05, 0, 0.62, 0.58, 1.0);                 // body
  const head = G.part(g, S, 0xb07845, 0, 1.7, 0.95, 0.42, 0.42, 0.45); // head
  G.part(head, X, 0x8f5f36, 0, -0.12, 0.75, 0.55, 0.55, 0.8);          // snout
  G.part(head, S, 0x1c1c1c, 0.3, 0.18, 0.92, 0.1);                     // eyes
  G.part(head, S, 0x1c1c1c, -0.3, 0.18, 0.92, 0.1);
  G.part(head, G.geo.cone, 0x8f5f36, 0.22, 0.52, -0.1, 0.14, 0.4, 0.14);
  G.part(head, G.geo.cone, 0x8f5f36, -0.22, 0.52, -0.1, 0.14, 0.4, 0.14);
  G.part(g, X, 0x5c4326, 0, 1.55, 0.3, 0.16, 0.6, 1.1);                // mane
  const tail = G.part(g, S, 0x5c4326, 0, 1.15, -1.05, 0.16, 0.45, 0.16);
  tail.rotation.x = 0.6;
  for (const sx of [-0.32, 0.32]) for (const sz of [-0.6, 0.62])
    G.part(g, C, 0x8f5f36, sx, 0.42, sz, 0.13, 0.85, 0.13);
  return g;
};
B.frog = function () {
  const g = new THREE.Group(), S = G.geo.sphere;
  G.part(g, S, 0x62b64e, 0, 0.32, 0, 0.42, 0.32, 0.42);                // body
  G.part(g, S, 0xd8eec2, 0, 0.22, 0.24, 0.28, 0.2, 0.2);               // belly
  const e1 = G.part(g, S, 0x62b64e, 0.18, 0.62, 0.12, 0.13);           // eye mounts
  const e2 = G.part(g, S, 0x62b64e, -0.18, 0.62, 0.12, 0.13);
  G.part(e1, S, 0x1c1c1c, 0, 0.25, 0.45, 0.45);
  G.part(e2, S, 0x1c1c1c, 0, 0.25, 0.45, 0.45);
  G.part(g, S, 0x4c9440, 0.3, 0.14, -0.12, 0.18, 0.12, 0.28);          // legs
  G.part(g, S, 0x4c9440, -0.3, 0.14, -0.12, 0.18, 0.12, 0.28);
  return g;
};
B.croc = function () {
  const g = new THREE.Group(), S = G.geo.sphere, X = G.geo.box;
  G.part(g, S, 0x5d8c46, 0, 0.5, 0, 0.55, 0.4, 1.15);                  // body
  const head = G.part(g, S, 0x5d8c46, 0, 0.6, 1.2, 0.38, 0.3, 0.45);
  G.part(head, X, 0x6f9e55, 0, -0.15, 0.9, 0.75, 0.42, 1.3);           // snout
  G.part(head, X, 0xf5f2e3, 0, -0.42, 0.9, 0.68, 0.12, 1.2);           // teeth strip
  G.part(head, S, 0xf7d83b, 0.22, 0.28, 0.25, 0.11);                   // eyes
  G.part(head, S, 0xf7d83b, -0.22, 0.28, 0.25, 0.11);
  const tail = G.part(g, G.geo.cone, 0x527c3e, 0, 0.45, -1.55, 0.32, 1.4, 0.32);
  tail.rotation.x = -Math.PI / 2;
  for (let i = 0; i < 4; i++) G.part(g, G.geo.cone, 0x3f6330, 0, 0.95 - i * 0.06, 0.35 - i * 0.5, 0.13, 0.3, 0.13);
  for (const sx of [-0.5, 0.5]) for (const sz of [-0.5, 0.6])
    G.part(g, S, 0x527c3e, sx, 0.2, sz, 0.16, 0.2, 0.16);
  return g;
};
B.mouse = function () {
  const g = new THREE.Group(), S = G.geo.sphere;
  G.part(g, S, 0xa8a29c, 0, 0.22, 0, 0.24, 0.2, 0.3);                  // body
  const head = G.part(g, S, 0xa8a29c, 0, 0.32, 0.26, 0.17);
  G.part(head, S, 0xf0b9c4, 0, -0.1, 0.85, 0.3);                       // nose
  G.part(head, S, 0x1c1c1c, 0.42, 0.25, 0.85, 0.14);
  G.part(head, S, 0x1c1c1c, -0.42, 0.25, 0.85, 0.14);
  G.part(head, S, 0xd9a7b2, 0.7, 0.9, -0.2, 0.55, 0.55, 0.2);          // ears
  G.part(head, S, 0xd9a7b2, -0.7, 0.9, -0.2, 0.55, 0.55, 0.2);
  const tail = G.part(g, G.geo.cyl, 0xd9a7b2, 0, 0.16, -0.42, 0.03, 0.5, 0.03);
  tail.rotation.x = 1.2;
  return g;
};
B.scorpion = function () {
  const g = new THREE.Group(), S = G.geo.sphere;
  const bodyCol = 0x8c3b26;
  G.part(g, S, bodyCol, 0, 0.18, 0, 0.26, 0.16, 0.34);                 // body
  G.part(g, S, bodyCol, 0, 0.2, 0.3, 0.18, 0.14, 0.18);                // head
  G.part(g, S, 0x1c1c1c, 0.07, 0.3, 0.45, 0.05);                       // eyes
  G.part(g, S, 0x1c1c1c, -0.07, 0.3, 0.45, 0.05);
  // claws
  for (const sx of [-0.3, 0.3]) {
    const arm = G.part(g, S, 0x6d2c1b, sx, 0.16, 0.42, 0.13, 0.1, 0.2);
    G.part(arm, S, 0x6d2c1b, sx > 0 ? 0.4 : -0.4, 0.2, 0.9, 0.9, 0.7, 0.9);
  }
  // tail arc
  let ty = 0.3, tz = -0.3;
  for (let i = 0; i < 3; i++) {
    G.part(g, S, bodyCol, 0, ty, tz, 0.1 - i * 0.015);
    ty += 0.14; tz -= 0.06;
  }
  const sting = G.part(g, G.geo.cone, 0x3a1810, 0, ty + 0.08, tz + 0.08, 0.07, 0.2, 0.07);
  sting.rotation.x = 2.6;
  // legs
  for (const sx of [-0.28, 0.28]) for (let i = 0; i < 3; i++)
    G.part(g, G.geo.cyl, 0x6d2c1b, sx, 0.08, -0.15 + i * 0.16, 0.03, 0.18, 0.03);
  return g;
};
G.buildAnimalMesh = function (key, scale) {
  const m = B[key]();
  m.scale.setScalar(scale);
  return m;
};

// ----- field animal -----
const SCALES = { horse: 1, frog: 0.5, croc: 1, mouse: 0.42, scorpion: 0.34 };

class Animal {
  constructor(key, x, z) {
    this.key = key;
    this.sp = G.SPECIES[key];
    this.mesh = G.buildAnimalMesh(key, SCALES[key]);
    this.pos = this.mesh.position;
    this.pos.set(x, G.heightAt(x, z), z);
    this.home = new THREE.Vector2(x, z);
    this.state = 'idle';
    this.timer = Math.random() * 3;
    this.target = new THREE.Vector2(x, z);
    this.stun = 0;
    this.biteCd = 0;
    this.bob = Math.random() * 9;
    this.alive = true;
  }
  retarget(rand) {
    for (let i = 0; i < 8; i++) {
      const a = Math.random() * Math.PI * 2, r = 3 + Math.random() * 10;
      const tx = this.home.x + Math.cos(a) * r, tz = this.home.y + Math.sin(a) * r;
      if (this.sp.place(G.sample(tx, tz))) { this.target.set(tx, tz); return; }
    }
    this.target.set(this.home.x, this.home.y);
  }
  update(dt, player) {
    if (!this.alive) return;
    this.bob += dt;
    if (this.stun > 0) {
      this.stun -= dt;
      this.mesh.rotation.z = Math.sin(this.bob * 30) * 0.12;
      if (this.stun <= 0) this.mesh.rotation.z = 0;
      this.settleY(dt);
      return;
    }
    const dx = player.pos.x - this.pos.x, dz = player.pos.z - this.pos.z;
    const dist = Math.hypot(dx, dz);

    // crocodile aggression: chases anything swimming nearby (unless croc-masked kin)
    if (this.sp.aggro) {
      const kin = player.mask === 'croc';
      if (!kin && player.swimming && dist < 11) this.state = 'chase';
      else if (this.state === 'chase') this.state = 'idle';
      if (this.state === 'chase') {
        const sp = 5.2;
        this.pos.x += dx / dist * sp * dt;
        this.pos.z += dz / dist * sp * dt;
        this.face(dx, dz, dt);
        this.biteCd -= dt;
        if (dist < 1.6 && this.biteCd <= 0) {
          this.biteCd = 1.3;
          G.hurtPlayer(2, this.pos);
        }
        this.settleY(dt);
        return;
      }
    }

    // scorpion sting: only threatens a shrunken player
    if (this.sp.stinger && player.small && player.mask !== 'scorpion' && dist < 1.4) {
      this.biteCd -= dt;
      if (this.biteCd <= 0) { this.biteCd = 1.5; G.hurtPlayer(1, this.pos); G.sfx.sting(); }
    }

    // wariness: crouching and being tiny make you less scary
    let threat = this.sp.wary;
    if (player.crouch) threat *= 0.55;
    if (player.small) threat *= 0.6;
    if (G.meta.upg.boots) threat *= 0.7;
    if (this.sp.fleeSpeed > 0 && dist < threat && this.state !== 'flee') {
      this.state = 'flee';
      this.timer = 2.5;
    }

    if (this.state === 'flee') {
      this.timer -= dt;
      const sp = this.sp.fleeSpeed;
      if (dist > 0.1) {
        this.move(-dx / dist * sp * dt, -dz / dist * sp * dt);
        this.face(-dx, -dz, dt);
      }
      if (this.timer <= 0) this.state = 'idle';
    } else if (this.state === 'walk') {
      const tx = this.target.x - this.pos.x, tz = this.target.y - this.pos.z;
      const td = Math.hypot(tx, tz);
      if (td < 0.5) { this.state = 'idle'; this.timer = 1 + Math.random() * 3; }
      else {
        const sp = this.sp.speed;
        this.move(tx / td * sp * dt, tz / td * sp * dt);
        this.face(tx, tz, dt);
      }
    } else { // idle
      this.timer -= dt;
      if (this.timer <= 0) { this.retarget(); this.state = 'walk'; }
    }
    this.settleY(dt);
  }
  move(mx, mz) {
    const nx = this.pos.x + mx, nz = this.pos.z + mz;
    const smp = G.sample(nx, nz);
    // stay out of deep water unless croc; stay in roughly-valid ground
    if (this.key !== 'croc' && smp.h < G.WATER_Y - 0.3) { this.state = 'idle'; this.timer = 0.5; return; }
    if (Math.hypot(nx, nz) > G.RADIUS - 4) { this.state = 'idle'; return; }
    this.pos.x = nx; this.pos.z = nz;
  }
  face(dx, dz, dt) {
    const want = Math.atan2(dx, dz);
    let d = want - this.mesh.rotation.y;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    this.mesh.rotation.y += d * Math.min(1, dt * 8);
  }
  settleY(dt) {
    const ground = G.heightAt(this.pos.x, this.pos.z);
    let y = ground;
    if (this.key === 'croc' && ground < G.WATER_Y - 0.2) y = G.WATER_Y - 0.35; // buoyant
    // hop bounce for frogs, gentle bob for others while moving
    if (this.sp.hop && this.state !== 'idle') y += Math.abs(Math.sin(this.bob * 6)) * 0.5;
    else if (this.state === 'walk' || this.state === 'flee' || this.state === 'chase')
      y += Math.abs(Math.sin(this.bob * 10)) * 0.06;
    this.pos.y += (y - this.pos.y) * Math.min(1, dt * 12);
  }
}

G.animals = [];
G.spawnAnimals = function (scene) {
  const rand = G.mulberry(G.seed + 1234);
  for (const key in G.SPECIES) {
    const sp = G.SPECIES[key];
    let placed = 0, tries = 0;
    while (placed < sp.count && tries++ < 900) {
      const a = rand() * Math.PI * 2, r = 35 + rand() * 175;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (!sp.place(G.sample(x, z))) continue;
      const an = new Animal(key, x, z);
      scene.add(an.mesh);
      G.animals.push(an);
      placed++;
    }
  }
};

// ----- zoo residents (fully studied species live at camp) -----
G.zooResidents = [];
G.addZooResident = function (scene, key) {
  const pen = G.pens.find(p => p.species === key);
  if (!pen || pen.resident) return;
  const m = G.buildAnimalMesh(key, SCALES[key] * (key === 'horse' || key === 'croc' ? 0.8 : 1));
  m.position.set(pen.x, G.heightAt(pen.x, pen.z), pen.z);
  scene.add(m);
  pen.resident = { mesh: m, t: Math.random() * 9, cx: pen.x, cz: pen.z };
  G.zooResidents.push(pen.resident);
};
G.updateZoo = function (dt) {
  for (const r of G.zooResidents) {
    r.t += dt;
    const wob = r.t * 0.5;
    const x = r.cx + Math.cos(wob) * 1.6, z = r.cz + Math.sin(wob * 0.7) * 1.6;
    r.mesh.rotation.y = Math.atan2(x - r.mesh.position.x, z - r.mesh.position.z);
    r.mesh.position.set(x, G.heightAt(x, z) + Math.abs(Math.sin(r.t * 6)) * 0.05, z);
  }
};

// ----- zoo guests: little visitors who pay to see your animals -----
G.guests = [];
const GUEST_COLORS = [0xf28fb1, 0x8fc7f2, 0xf2d38f, 0xb28ff2, 0x8ff2b6, 0xf2a58f];
function buildGuest(color) {
  const g = new THREE.Group(), S = G.geo.sphere;
  G.part(g, S, color, 0, 0.55, 0, 0.32, 0.4, 0.26);                   // body
  const head = G.part(g, S, 0xffd9a6, 0, 1.15, 0, 0.3);
  G.part(head, S, 0x1c1c1c, 0.35, 0.1, 0.92, 0.13);
  G.part(head, S, 0x1c1c1c, -0.35, 0.1, 0.92, 0.13);
  G.part(head, S, color, 0, 0.75, 0, 0.85, 0.5, 0.85);                // cap
  G.part(g, S, 0x4a3828, 0.12, 0.08, 0, 0.11, 0.08, 0.14);            // feet
  G.part(g, S, 0x4a3828, -0.12, 0.08, 0, 0.11, 0.08, 0.14);
  return g;
}
G.guestTimer = 5;
G.updateGuests = function (dt, scene) {
  const zooCount = G.zooResidents.length;
  if (zooCount === 0) return;
  const maxGuests = zooCount * (G.meta.upg.poster ? 3 : 2);
  G.guestTimer -= dt;
  if (G.guestTimer <= 0 && G.guests.length < maxGuests) {
    G.guestTimer = 6 + Math.random() * 8;
    const mesh = buildGuest(GUEST_COLORS[Math.floor(Math.random() * GUEST_COLORS.length)]);
    const sx = (Math.random() - 0.5) * 6, sz = 24;
    mesh.position.set(sx, G.heightAt(sx, sz), sz);
    scene.add(mesh);
    const pens = G.pens.filter(p => p.resident);
    const pen = pens[Math.floor(Math.random() * pens.length)];
    G.guests.push({ mesh, pen, state: 'walk', t: 0, payT: 4, life: 40 + Math.random() * 30 });
  }
  for (let i = G.guests.length - 1; i >= 0; i--) {
    const g = G.guests[i];
    g.t += dt; g.life -= dt;
    const p = g.mesh.position;
    let tx, tz;
    if (g.life <= 0) g.state = 'leave';
    if (g.state === 'walk') {
      tx = g.pen.x + 4.5 - p.x; tz = g.pen.z + (Math.sin(g.t) * 1) - p.z;
      const d = Math.hypot(tx, tz);
      if (d < 1.2) g.state = 'watch';
      else { p.x += tx / d * 2.4 * dt; p.z += tz / d * 2.4 * dt; g.mesh.rotation.y = Math.atan2(tx, tz); }
    } else if (g.state === 'watch') {
      g.mesh.rotation.y = Math.atan2(g.pen.x - p.x, g.pen.z - p.z);
      g.payT -= dt;
      if (g.payT <= 0) {
        g.payT = 5 + Math.random() * 3;
        G.addCoins(G.meta.upg.poster ? 2 : 1, p);
        // occasionally wander to a different pen
        if (Math.random() < 0.3) {
          const pens = G.pens.filter(pp => pp.resident);
          g.pen = pens[Math.floor(Math.random() * pens.length)];
          g.state = 'walk';
        }
      }
    } else { // leave
      tx = 0 - p.x; tz = 30 - p.z;
      const d = Math.hypot(tx, tz);
      if (d < 2) { scene.remove(g.mesh); G.guests.splice(i, 1); continue; }
      p.x += tx / d * 2.8 * dt; p.z += tz / d * 2.8 * dt;
      g.mesh.rotation.y = Math.atan2(tx, tz);
    }
    p.y = G.heightAt(p.x, p.z) + Math.abs(Math.sin(g.t * 8)) * 0.06;
  }
};
