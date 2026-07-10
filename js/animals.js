'use strict';
// ---------------------------------------------------------------------------
// Wildmask — animals.js : species table (19), field AI, zoo residents, guests
// ---------------------------------------------------------------------------
// tiers: 1 = common (quick study), 2 = uncommon, 3 = rare/strong (long study)
// aggressive species defend themselves; defeating one drops an ingredient.

G.SPECIES = {
  // ---------- tier 1 ----------
  fox: {
    name: 'Fox', emoji: '🦊', zone: 'forest', tier: 1, studyNeed: 60,
    count: 4, speed: 3.4, fleeSpeed: 8, wary: 8, studyR: 8,
    traits: 'Dash Strike [F]: lightning lunge. Full-speed stealth inside bushes.',
    hint: 'Tia\'s pick for your first study — prowls the forest edge near camp.',
    ingredient: 'fox meat',
    place: s => s.biome === 'forest' && s.h > 0.8
  },
  rabbit: {
    name: 'Rabbit', emoji: '🐰', zone: 'plains', tier: 1, studyNeed: 80,
    count: 5, speed: 2.6, fleeSpeed: 7.5, wary: 9, studyR: 6, hop: true,
    traits: 'Double Jump: kick off thin air. Quick, weak kicks in a scrap.',
    hint: 'Bounces around the open plains.',
    ingredient: 'rabbit meat',
    place: s => s.biome === 'plains' && s.h > 0.8
  },
  deer: {
    name: 'Deer', emoji: '🦌', zone: 'forest', tier: 1, studyNeed: 90,
    count: 4, speed: 3.2, fleeSpeed: 9.5, wary: 12, studyR: 9,
    traits: 'Bounding Stride: long graceful leaps. Antler Charge knocks foes flat.',
    hint: 'Grazes between the forest trees. Extremely alert.',
    ingredient: 'venison',
    place: s => s.biome === 'forest' && s.h > 0.8
  },
  frog: {
    name: 'Frog', emoji: '🐸', zone: 'wetland', tier: 1, studyNeed: 80,
    count: 5, speed: 1.6, fleeSpeed: 4.5, hop: true, wary: 6, studyR: 6,
    traits: 'Spring Legs: jump sky-high. Power Kick [F] smashes cracked boulders.',
    hint: 'Lives at pond and swamp shorelines.',
    ingredient: 'frog legs',
    place: s => (s.biome === 'plains' || s.biome === 'swamp') && s.h > 0.15 && s.h < 1.0
  },
  horse: {
    name: 'Horse', emoji: '🐴', zone: 'plains', tier: 1, studyNeed: 100,
    count: 4, speed: 3.2, fleeSpeed: 9, wary: 11, studyR: 9,
    traits: 'Gallop: sprint at incredible speed with endless stamina. Trample kick.',
    hint: 'Grazes in the open plains. Skittish — crouch and approach slowly.',
    ingredient: 'oat bundle',
    place: s => s.biome === 'plains' && s.h > 1 && s.h < 4.8
  },
  // ---------- tier 2 ----------
  mouse: {
    name: 'Mouse', emoji: '🐭', zone: 'plains', tier: 2, studyNeed: 120,
    count: 5, speed: 2.2, fleeSpeed: 6.5, wary: 8, studyR: 5, tiny: 0.45,
    traits: 'Shrink: become tiny — study small creatures, squeeze into burrows.',
    hint: 'Scurries around the plains. Very wary; sneak up crouched.',
    ingredient: 'wild grain',
    place: s => s.biome === 'plains' && s.h > 0.8
  },
  tortoise: {
    name: 'Tortoise', emoji: '🐢', zone: 'wetland', tier: 2, studyNeed: 150,
    count: 3, speed: 0.7, fleeSpeed: 1.2, wary: 3, studyR: 6,
    traits: 'Shell Guard: crouch to block almost all damage. Heavy shell bash.',
    hint: 'Trundles along sunny shorelines. Not in a hurry.',
    ingredient: 'shore greens',
    place: s => s.biome !== 'swamp' && s.h > 0.15 && s.h < 0.9
  },
  otter: {
    name: 'Otter', emoji: '🦦', zone: 'wetland', tier: 2, studyNeed: 150,
    count: 3, speed: 2.4, fleeSpeed: 6, wary: 7, studyR: 7,
    traits: 'River King: swim fast and slippery. Rapid paw combo.',
    hint: 'Plays near ponds and river mouths.',
    ingredient: 'fresh fish',
    place: s => s.biome !== 'desert' && s.h > 0.1 && s.h < 0.8
  },
  cobra: {
    name: 'Cobra', emoji: '🐍', zone: 'desert', tier: 2, studyNeed: 170,
    count: 4, speed: 1.6, fleeSpeed: 0, wary: 0, studyR: 8,
    aggressive: { hp: 5, dmg: 1, aggroR: 3, atkR: 1.6, atkCd: 1.4 },
    traits: 'Venom Spit [F]: ranged poison glob that stuns.',
    hint: 'Coiled in the hot sand. Strikes anyone who steps too close.',
    ingredient: 'cobra fillet',
    place: s => s.biome === 'desert' && s.h > 1.0
  },
  monkey: {
    name: 'Monkey', emoji: '🐒', zone: 'forest', tier: 2, studyNeed: 150,
    count: 4, speed: 3.0, fleeSpeed: 7, wary: 8, studyR: 8,
    traits: 'Fruit Fling [F]: ranged thrown fruit. Springy climber\'s jump.',
    hint: 'Chatters in the deep forest.',
    ingredient: 'jungle fruit',
    place: s => s.biome === 'forest' && s.h > 1.0
  },
  goat: {
    name: 'Mountain Goat', emoji: '🐐', zone: 'highland', tier: 2, studyNeed: 170,
    count: 3, speed: 2.6, fleeSpeed: 7, wary: 8, studyR: 8,
    traits: 'Sure Hooves: walk straight up cliffs and terraces. Skull-ringing ram.',
    hint: 'Perches on the rocky terraces. Follow it up if you can.',
    ingredient: 'goat cheese',
    place: s => s.biome === 'rock' && s.h > 4.5
  },
  armadillo: {
    name: 'Armadillo', emoji: '🛡️', zone: 'desert', tier: 2, studyNeed: 150,
    count: 3, speed: 1.8, fleeSpeed: 6.5, wary: 6, studyR: 6,
    traits: 'Roll Out: sprint becomes an armored cannonball roll.',
    hint: 'Snuffles between the cacti.',
    ingredient: 'root veggies',
    place: s => s.biome === 'desert' && s.h > 1.0
  },
  owl: {
    name: 'Owl', emoji: '🦉', zone: 'forest', tier: 2, studyNeed: 180,
    count: 3, speed: 2.0, fleeSpeed: 8, wary: 10, studyR: 8, nocturnal: true,
    traits: 'Night Wings: glide on the wind and see clearly in the dark.',
    hint: 'Only appears after sundown, deep in the forest.',
    ingredient: 'forest herbs',
    place: s => s.biome === 'forest' && s.h > 1.0
  },
  scorpion: {
    name: 'Scorpion', emoji: '🦂', zone: 'desert', tier: 2, studyNeed: 170,
    count: 5, speed: 1.1, fleeSpeed: 3, wary: 2.6, studyR: 3.5,
    needSmall: true, tiny: 0.4, stinger: true,
    traits: 'Venom Claws [F]: stun creatures. Wall Crawl: scale sheer cliffs. Tiny size.',
    hint: 'Too small to observe... shrink down with the Mouse Mask first.',
    ingredient: 'chili pepper',
    place: s => s.biome === 'desert' && s.h > 1.2
  },
  croc: {
    name: 'Crocodile', emoji: '🐊', zone: 'wetland', tier: 2, studyNeed: 170,
    count: 4, speed: 1.4, fleeSpeed: 0, wary: 0, studyR: 9,
    aggressive: { hp: 10, dmg: 2, aggroR: 11, atkR: 1.6, atkCd: 1.3, waterOnly: true },
    traits: 'Amphibian: swim fast, near-endless breath. Vice-grip bite.',
    hint: 'Lurks in swamp water. Study it from dry land — it bites swimmers!',
    ingredient: 'croc tail cut',
    place: s => s.biome === 'swamp' && s.h < 0.2
  },
  // ---------- tier 3 ----------
  wolf: {
    name: 'Wolf', emoji: '🐺', zone: 'forest', tier: 3, studyNeed: 240,
    count: 3, speed: 3.4, fleeSpeed: 0, wary: 0, studyR: 9, nocturnal: true,
    aggressive: { hp: 8, dmg: 2, aggroR: 9, atkR: 1.7, atkCd: 1.1 },
    traits: 'Moon Runner: tireless sprint. Howl [V] scatters poachers in terror.',
    hint: 'Hunts the forest at night. It will find you first.',
    ingredient: 'wolf meat',
    place: s => s.biome === 'forest' && s.h > 1.0
  },
  eagle: {
    name: 'Eagle', emoji: '🦅', zone: 'highland', tier: 3, studyNeed: 240,
    count: 2, speed: 2.2, fleeSpeed: 11, wary: 14, studyR: 10,
    traits: 'Sky Lord: glide from any height; attack mid-air to dive-bomb.',
    hint: 'Roosts on mesa tops and high crags. Approach from above... somehow.',
    ingredient: 'giant egg',
    place: s => (s.biome === 'desert' && s.h > 9) || (s.biome === 'rock' && s.h > 8)
  },
  bear: {
    name: 'Bear', emoji: '🐻', zone: 'forest', tier: 3, studyNeed: 260,
    count: 2, speed: 2.4, fleeSpeed: 0, wary: 0, studyR: 10,
    aggressive: { hp: 14, dmg: 3, aggroR: 7, atkR: 2.1, atkCd: 1.5 },
    traits: 'Juggernaut: massive swipes with huge knockback; smash boulders bare-handed.',
    hint: 'The forest\'s heavyweight. Keep your distance while it\'s grumpy.',
    ingredient: 'bear shank',
    place: s => s.biome === 'forest' && s.h > 1.2
  },
  badger: {
    name: 'Honey Badger', emoji: '🦡', zone: 'desert', tier: 3, studyNeed: 320,
    count: 2, speed: 2.8, fleeSpeed: 0, wary: 0, studyR: 9,
    aggressive: { hp: 16, dmg: 2, aggroR: 6, atkR: 1.6, atkCd: 0.7 },
    traits: 'Fear Nothing: blinding flurry of claws, iron hide, immune to venom.',
    hint: 'Rare, fearless, and famously does not care. The hardest study on the island.',
    ingredient: 'honeycomb',
    place: s => s.biome === 'desert' && s.h > 1.0
  }
};
G.MASK_ORDER = Object.keys(G.SPECIES);

const SCALES = {
  horse: 1, frog: 0.5, croc: 1, mouse: 0.42, scorpion: 0.34,
  fox: 0.8, rabbit: 0.55, deer: 1, tortoise: 0.6, otter: 0.6,
  cobra: 0.7, monkey: 0.65, goat: 0.95, armadillo: 0.6, owl: 0.55,
  wolf: 0.95, eagle: 0.7, bear: 1.15, badger: 0.7
};
G.SPECIES_SCALE = SCALES;

// ---------------------------------------------------------------------------
// field animal
// ---------------------------------------------------------------------------
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
    this.fear = 0;
    this.biteCd = 0;
    this.bob = Math.random() * 9;
    this.alive = true;
    this.caged = false;
    this.hp = this.sp.aggressive ? this.sp.aggressive.hp : 0;
  }
  retarget() {
    for (let i = 0; i < 8; i++) {
      const a = Math.random() * Math.PI * 2, r = 3 + Math.random() * 10;
      const tx = this.home.x + Math.cos(a) * r, tz = this.home.y + Math.sin(a) * r;
      if (this.sp.place(G.sample(tx, tz))) { this.target.set(tx, tz); return; }
    }
    this.target.set(this.home.x, this.home.y);
  }
  hurt(dmg, kbDir, kb) {
    if (!this.sp.aggressive) { // peaceful animals just get knocked about
      this.stun = Math.max(this.stun, 1.0);
      if (kbDir) { this.pos.x += kbDir.x * (kb || 2); this.pos.z += kbDir.z * (kb || 2); }
      return false;
    }
    this.hp -= dmg;
    this.stun = Math.max(this.stun, 0.25);
    if (kbDir) { this.pos.x += kbDir.x * (kb || 1.5); this.pos.z += kbDir.z * (kb || 1.5); }
    G.ui.popup('-' + dmg, this.pos);
    if (this.hp <= 0) {
      this.alive = false;
      this.mesh.visible = false;
      G.spawnDrop(G.scene, this.pos.x, this.pos.z, 'ingredient', this.key);
      G.toast('The ' + this.sp.name.toLowerCase() + ' is subdued. It dropped ' + this.sp.ingredient + ' — Montana can cook that.');
      G.respawnQueue.push({ key: this.key, t: 120 });
      if (G.quest && G.quest.onAnimalDefeat) G.quest.onAnimalDefeat(this.key);
      return true;
    }
    return false;
  }
  update(dt, player) {
    if (!this.alive || this.caged) return;
    // nocturnal creatures only exist after dark
    if (this.sp.nocturnal && !G.isNight) { this.mesh.visible = false; return; }
    this.mesh.visible = true;
    this.bob += dt;
    if (this.stun > 0) {
      this.stun -= dt;
      this.mesh.rotation.z = Math.sin(this.bob * 30) * 0.12;
      if (this.stun <= 0) this.mesh.rotation.z = 0;
      this.settleY(dt);
      return;
    }
    if (this.fear > 0) this.fear -= dt;
    const dx = player.pos.x - this.pos.x, dz = player.pos.z - this.pos.z;
    let dist = Math.hypot(dx, dz);
    if (player.hidden) dist *= 3; // stealth: you read as much farther away

    // -- aggression --
    const ag = this.sp.aggressive;
    if (ag && this.fear <= 0) {
      const kin = (this.key === 'croc' && player.mask === 'croc');
      const validTarget = ag.waterOnly ? player.swimming : !player.hidden;
      if (!kin && validTarget && dist < ag.aggroR) this.state = 'chase';
      else if (this.state === 'chase' && dist > ag.aggroR * 2.2) this.state = 'idle';
      if (this.state === 'chase') {
        const d = Math.hypot(dx, dz) || 1;
        const sp = this.sp.speed * 2.2;
        this.move(dx / d * sp * dt, dz / d * sp * dt);
        this.face(dx, dz, dt);
        this.biteCd -= dt;
        if (d < ag.atkR && this.biteCd <= 0) {
          this.biteCd = ag.atkCd;
          G.hurtPlayer(ag.dmg, this.pos);
        }
        this.settleY(dt);
        return;
      }
    }

    // scorpion sting: only threatens a shrunken player
    if (this.sp.stinger && player.small && player.mask !== 'scorpion' && player.mask !== 'badger' && dist < 1.4) {
      this.biteCd -= dt;
      if (this.biteCd <= 0) { this.biteCd = 1.5; G.hurtPlayer(1, this.pos); G.sfx.sting(); }
    }

    // -- wariness --
    let threat = this.sp.wary;
    if (player.crouch) threat *= 0.55;
    if (player.small) threat *= 0.6;
    if (G.meta.upg.boots) threat *= 0.7;
    if ((this.sp.fleeSpeed > 0 && dist < threat && this.state !== 'flee') || this.fear > 0) {
      if (this.sp.fleeSpeed > 0) { this.state = 'flee'; this.timer = 2.5; }
    }

    if (this.state === 'flee') {
      this.timer -= dt;
      const sp = this.sp.fleeSpeed || this.sp.speed * 2;
      const d = Math.hypot(dx, dz) || 1;
      this.move(-dx / d * sp * dt, -dz / d * sp * dt);
      this.face(-dx, -dz, dt);
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
    } else {
      this.timer -= dt;
      if (this.timer <= 0) { this.retarget(); this.state = 'walk'; }
    }
    this.settleY(dt);
  }
  move(mx, mz) {
    const nx = this.pos.x + mx, nz = this.pos.z + mz;
    const smp = G.sample(nx, nz);
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
    if (this.key === 'croc' && ground < G.WATER_Y - 0.2) y = G.WATER_Y - 0.35;
    if (this.sp.hop && this.state !== 'idle') y += Math.abs(Math.sin(this.bob * 6)) * 0.5;
    else if (this.state !== 'idle')
      y += Math.abs(Math.sin(this.bob * 10)) * 0.06;
    this.pos.y += (y - this.pos.y) * Math.min(1, dt * 12);
    // waddle while trotting, ease flat when settled
    if (this.stun <= 0) {
      const target = (this.state === 'walk' || this.state === 'flee' || this.state === 'chase')
        ? Math.sin(this.bob * 12) * 0.06 : 0;
      this.mesh.rotation.z += (target - this.mesh.rotation.z) * Math.min(1, dt * 10);
    }
  }
}
G.Animal = Animal;

G.animals = [];
G.respawnQueue = [];
G.spawnAnimalAt = function (key, x, z) {
  const an = new Animal(key, x, z);
  G.scene.add(an.mesh);
  G.animals.push(an);
  return an;
};
G.spawnAnimals = function (scene) {
  const rand = G.mulberry(G.seed + 1234);
  for (const key in G.SPECIES) {
    const sp = G.SPECIES[key];
    let placed = 0, tries = 0;
    while (placed < sp.count && tries++ < 1200) {
      const a = rand() * Math.PI * 2, r = 40 + rand() * 170;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (!sp.place(G.sample(x, z))) continue;
      const an = new Animal(key, x, z);
      scene.add(an.mesh);
      G.animals.push(an);
      placed++;
    }
  }
  // tutorial fox: guaranteed, close to camp, half as wary
  let fx = 0, fz = 0, found = false;
  for (let r = 30; r < 120 && !found; r += 4) for (let a = 0; a < 6.28; a += 0.25) {
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (G.SPECIES.fox.place(G.sample(x, z))) { fx = x; fz = z; found = true; break; }
  }
  if (found) {
    const tut = new Animal('fox', fx, fz);
    tut.tutorial = true;
    scene.add(tut.mesh);
    G.animals.push(tut);
    G.tutorialFox = tut;
  }
};
G.tickRespawns = function (dt) {
  for (let i = G.respawnQueue.length - 1; i >= 0; i--) {
    const r = G.respawnQueue[i];
    r.t -= dt;
    if (r.t > 0) continue;
    G.respawnQueue.splice(i, 1);
    const rand = Math.random;
    for (let tries = 0; tries < 300; tries++) {
      const a = rand() * Math.PI * 2, rr = 60 + rand() * 150;
      const x = Math.cos(a) * rr, z = Math.sin(a) * rr;
      if (G.SPECIES[r.key].place(G.sample(x, z))) { G.spawnAnimalAt(r.key, x, z); break; }
    }
  }
};

// fear pulse (wolf howl): scatter animals + poachers
G.fearPulse = function (pos, radius) {
  for (const a of G.animals) {
    if (!a.alive || a.caged) continue;
    if (Math.hypot(a.pos.x - pos.x, a.pos.z - pos.z) < radius) {
      a.fear = 5; a.state = a.sp.fleeSpeed > 0 ? 'flee' : 'idle'; a.timer = 4;
    }
  }
  if (G.poachers) for (const p of G.poachers) {
    if (p.state === 'ko') continue;
    if (Math.hypot(p.pos.x - pos.x, p.pos.z - pos.z) < radius) p.frighten(6);
  }
};

// ---------------------------------------------------------------------------
// zoo residents live inside their themed enclosure zone
// ---------------------------------------------------------------------------
G.zooResidents = [];
G.addZooResident = function (scene, key) {
  const sp = G.SPECIES[key];
  const zone = G.zones.find(z => z.id === sp.zone);
  if (!zone || zone.residents.some(r => r.key === key)) return;
  const m = G.buildAnimalMesh(key, SCALES[key] * 0.85);
  const ox = (Math.random() - 0.5) * 6, oz = (Math.random() - 0.5) * 6;
  m.position.set(zone.x + ox, G.heightAt(zone.x + ox, zone.z + oz) + 0.15, zone.z + oz);
  scene.add(m);
  const res = { key, mesh: m, t: Math.random() * 9, zone, ph: Math.random() * 9 };
  zone.residents.push(res);
  G.zooResidents.push(res);
};
G.updateZoo = function (dt) {
  for (const r of G.zooResidents) {
    r.t += dt;
    const wob = r.t * 0.4 + r.ph;
    const x = r.zone.x + Math.cos(wob) * r.zone.half * 0.55 + Math.sin(r.ph * 3) * 1.2;
    const z = r.zone.z + Math.sin(wob * 0.8) * r.zone.half * 0.55;
    r.mesh.rotation.y = Math.atan2(x - r.mesh.position.x, z - r.mesh.position.z);
    r.mesh.position.set(x, G.heightAt(x, z) + 0.15 + Math.abs(Math.sin(r.t * 6)) * 0.04, z);
  }
};

// ---------------------------------------------------------------------------
// zoo guests: little visitors who tour occupied zones and pay coins
// ---------------------------------------------------------------------------
G.guests = [];
const GUEST_COLORS = [0xf28fb1, 0x8fc7f2, 0xf2d38f, 0xb28ff2, 0x8ff2b6, 0xf2a58f];
G.zooAppeal = function () {
  let decor = 0;
  for (const z of G.zones) decor += (G.meta.decor && G.meta.decor[z.id]) || 0;
  return 1 + decor * 0.15 + (G.meta.upg.poster ? 0.5 : 0);
};
G.guestTimer = 5;
G.updateGuests = function (dt, scene) {
  const occupied = G.zones.filter(z => z.residents.length);
  if (!occupied.length) return;
  const maxGuests = Math.round((G.zooResidents.length + 1) * G.zooAppeal());
  G.guestTimer -= dt;
  if (G.guestTimer <= 0 && G.guests.length < maxGuests) {
    G.guestTimer = (7 + Math.random() * 8) / G.zooAppeal();
    const mesh = G.buildVillager({ shirt: GUEST_COLORS[Math.floor(Math.random() * GUEST_COLORS.length)], hat: 'cap' });
    const sx = (Math.random() - 0.5) * 6, sz = 26;
    mesh.position.set(sx, G.heightAt(sx, sz), sz);
    scene.add(mesh);
    const zone = occupied[Math.floor(Math.random() * occupied.length)];
    G.guests.push({ mesh, zone, state: 'walk', t: 0, payT: 4, life: 45 + Math.random() * 40 });
  }
  for (let i = G.guests.length - 1; i >= 0; i--) {
    const g = G.guests[i];
    g.t += dt; g.life -= dt;
    const p = g.mesh.position;
    let tx, tz;
    if (g.life <= 0) g.state = 'leave';
    if (g.state === 'walk') {
      const gx = g.zone.x * 0.82, gz = g.zone.z * 0.82; // stand outside the gate
      tx = gx - p.x; tz = gz - p.z;
      const d = Math.hypot(tx, tz);
      if (d < 1.4) g.state = 'watch';
      else { p.x += tx / d * 2.4 * dt; p.z += tz / d * 2.4 * dt; g.mesh.rotation.y = Math.atan2(tx, tz); }
    } else if (g.state === 'watch') {
      g.mesh.rotation.y = Math.atan2(g.zone.x - p.x, g.zone.z - p.z);
      g.payT -= dt;
      if (g.payT <= 0) {
        g.payT = 5 + Math.random() * 3;
        G.addCoins(Math.max(1, Math.round(G.zooAppeal())), p);
        const others = G.zones.filter(z => z.residents.length && z !== g.zone);
        if (others.length && Math.random() < 0.35) {
          g.zone = others[Math.floor(Math.random() * others.length)];
          g.state = 'walk';
        }
      }
    } else {
      tx = 0 - p.x; tz = 30 - p.z;
      const d = Math.hypot(tx, tz);
      if (d < 2.5) { scene.remove(g.mesh); G.guests.splice(i, 1); continue; }
      p.x += tx / d * 2.8 * dt; p.z += tz / d * 2.8 * dt;
      g.mesh.rotation.y = Math.atan2(tx, tz);
    }
    p.y = G.heightAt(p.x, p.z) + Math.abs(Math.sin(g.t * 8)) * 0.06;
  }
};
