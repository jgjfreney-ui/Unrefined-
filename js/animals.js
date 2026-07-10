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
    count: 5, speed: 2.6, fleeSpeed: 7.5, wary: 9, studyR: 6, hop: true, herd: true, burrowHide: true,
    traits: 'Double Jump: kick off thin air. Quick, weak kicks in a scrap.',
    hint: 'Bounces around the open plains.',
    ingredient: 'rabbit meat',
    place: s => s.biome === 'plains' && s.h > 0.8
  },
  deer: {
    name: 'Deer', emoji: '🦌', zone: 'forest', tier: 1, studyNeed: 90,
    count: 4, speed: 3.2, fleeSpeed: 9.5, wary: 12, studyR: 9, herd: true,
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
  duck: {
    name: 'Duck', emoji: '🦆', zone: 'lake', tier: 1, studyNeed: 90,
    count: 5, speed: 1.8, fleeSpeed: 5, wary: 7, studyR: 7,
    floats: true, herd: true, nest: 'shore',
    traits: 'Dabbler: dive below the surface, see clearly underwater, paddle with ease. Wing flurry.',
    hint: 'Paddles on the Great Lake, east of camp. Its mask opens the world below the surface.',
    ingredient: 'duck egg',
    place: (s, x, z) => G.lakeD(x, z) < 44 && s.h < -0.6
  },
  crab: {
    name: 'Crab', emoji: '🦀', zone: 'lake', tier: 1, studyNeed: 80,
    count: 4, speed: 1.4, fleeSpeed: 4, wary: 5, studyR: 5, tiny: 0.5,
    traits: 'Iron Pinch: heavy claws and a hard shell. Walks the bottom of any water.',
    hint: 'Sidesteps along the shorelines and the Palm Coast surf.',
    ingredient: 'crab meat',
    place: s => s.biome !== 'swamp' && s.h > 0.08 && s.h < 0.6
  },
  horse: {
    name: 'Horse', emoji: '🐴', zone: 'plains', tier: 1, studyNeed: 100,
    count: 4, speed: 3.2, fleeSpeed: 9, wary: 11, studyR: 9, herd: true,
    traits: 'Gallop: sprint at incredible speed with endless stamina. Trample kick.',
    hint: 'Grazes in the open plains. Skittish — crouch and approach slowly.',
    ingredient: 'oat bundle',
    place: s => s.biome === 'plains' && s.h > 1 && s.h < 4.8
  },
  // ---------- tier 2 ----------
  mouse: {
    name: 'Mouse', emoji: '🐭', zone: 'plains', tier: 2, studyNeed: 120,
    count: 5, speed: 2.2, fleeSpeed: 6.5, wary: 8, studyR: 5, tiny: 0.45, burrowHide: true,
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
  beaver: {
    name: 'Beaver', emoji: '🦫', zone: 'lake', tier: 2, studyNeed: 140,
    count: 3, speed: 1.6, fleeSpeed: 4.5, wary: 7, studyR: 7, nest: 'lodge',
    traits: 'Tail Slap [F]: heavy splashing knockback. Master swimmer and builder.',
    hint: 'Hauls sticks along the Great Lake\'s shore — look for its lodge.',
    ingredient: 'crisp cattail',
    place: (s, x, z) => G.lakeD(x, z) < 54 && s.h > 0.05 && s.h < 0.8
  },
  koi: {
    name: 'Koi', emoji: '🐟', zone: 'lake', tier: 2, studyNeed: 160,
    count: 6, speed: 2.2, fleeSpeed: 6, wary: 6, studyR: 6,
    underwater: true, aquatic: true,
    traits: 'Waterborn: swim like a dream with endless breath... but you flop on land.',
    hint: 'Glides through the kelp deep beneath the Great Lake. Dive down to observe it.',
    ingredient: 'lake fish',
    place: (s, x, z) => G.lakeD(x, z) < 38 && s.h < -3.5
  },
  butterfly: {
    name: 'Butterfly', emoji: '🦋', zone: 'forest', tier: 2, studyNeed: 100,
    count: 5, speed: 1.2, fleeSpeed: 3.5, wary: 4, studyR: 3.5,
    needSmall: true, tiny: 0.4, flutter: true,
    traits: 'Featherweight: drift gently on the breeze — falls never hurt. Pollen Puff [F] dazes.',
    hint: 'Dances between the pink boughs of the Blossom Grove. Far too small to observe... unless you shrink.',
    ingredient: 'sweet nectar',
    place: (s, x, z) => G.groveC && Math.hypot(x - G.groveC.x, z - G.groveC.z) < 24 && s.h > 0.8
  },
  raccoon: {
    name: 'Raccoon', emoji: '🦝', zone: 'forest', tier: 2, studyNeed: 150,
    count: 3, speed: 2.6, fleeSpeed: 6.5, wary: 7, studyR: 7,
    traits: 'Sticky Fingers: your strikes pickpocket coins from poachers. Nimble scrapper.',
    hint: 'A little bandit snuffling around the Blossom Grove.',
    ingredient: 'wild berries',
    place: (s, x, z) => G.groveC && Math.hypot(x - G.groveC.x, z - G.groveC.z) < 30 && s.h > 0.8
  },
  seagull: {
    name: 'Seagull', emoji: '🐦', zone: 'lake', tier: 2, studyNeed: 130,
    count: 4, speed: 2.2, fleeSpeed: 8, wary: 8, studyR: 7, hop: true, nest: 'shore',
    traits: 'Sea Wings: glide the coastal winds; attack mid-air to dive-peck.',
    hint: 'Wheels and squabbles over the Palm Coast.',
    ingredient: 'gull egg',
    place: (s, x, z) => s.h > 0.1 && s.h < 0.8 && Math.hypot(x, z) > 140
  },
  firefly: {
    name: 'Firefly', emoji: '🪲', zone: 'forest', tier: 2, studyNeed: 180,
    count: 5, speed: 1.0, fleeSpeed: 3, wary: 3.5, studyR: 3.5,
    needSmall: true, tiny: 0.35, flutter: true, nocturnal: true,
    traits: 'Lantern Glow: drift on the air and light the dark around you. Flash [F] dazes everything close.',
    hint: 'The dancing lights of Mushroom Hollow — tiny, and only out after dark.',
    ingredient: 'morning dew',
    place: (s, x, z) => G.hollowC && Math.hypot(x - G.hollowC.x, z - G.hollowC.z) < 26 && s.h > 0.8
  },
  boar: {
    name: 'Boar', emoji: '🐗', zone: 'forest', tier: 2, studyNeed: 190,
    count: 3, speed: 2.4, fleeSpeed: 0, wary: 0, studyR: 8,
    aggressive: { hp: 7, dmg: 2, aggroR: 5, atkR: 1.7, atkCd: 1.2 },
    traits: 'Tusk Rush [F]: a thundering charge that bowls foes over. Thick hide.',
    hint: 'Roots through the Wildwood undergrowth. Short temper, shorter fuse.',
    ingredient: 'boar shank',
    place: s => s.biome === 'forest' && s.h > 1.0
  },
  heron: {
    name: 'Heron', emoji: '🪶', zone: 'lake', tier: 2, studyNeed: 150,
    count: 3, speed: 0.9, fleeSpeed: 7, wary: 9, studyR: 8,
    traits: 'Stilt Legs: wade shallow water without swimming. Spear Beak [F]: one precise, heavy strike.',
    hint: 'Stands statue-still in the Great Lake\'s shallows, waiting.',
    ingredient: 'reed fish',
    place: (s, x, z) => G.lakeD(x, z) < 56 && s.h > -0.8 && s.h < 0.25
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
    count: 3, speed: 1.8, fleeSpeed: 6.5, wary: 6, studyR: 6, ball: true,
    traits: 'Roll Out: sprint becomes an armored cannonball roll.',
    hint: 'Snuffles between the cacti.',
    ingredient: 'root veggies',
    place: s => s.biome === 'desert' && s.h > 1.0
  },
  owl: {
    name: 'Owl', emoji: '🦉', zone: 'forest', tier: 2, studyNeed: 180,
    count: 3, speed: 2.0, fleeSpeed: 8, wary: 10, studyR: 8, nocturnal: true, nest: 'ground',
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
    count: 3, speed: 3.4, fleeSpeed: 0, wary: 0, studyR: 9, nocturnal: true, hunts: true,
    aggressive: { hp: 8, dmg: 2, aggroR: 9, atkR: 1.7, atkCd: 1.1 },
    traits: 'Moon Runner: tireless sprint. Howl [V] scatters poachers in terror.',
    hint: 'Hunts the forest at night. It will find you first.',
    ingredient: 'wolf meat',
    place: s => s.biome === 'forest' && s.h > 1.0
  },
  eagle: {
    name: 'Eagle', emoji: '🦅', zone: 'highland', tier: 3, studyNeed: 240,
    count: 2, speed: 2.2, fleeSpeed: 11, wary: 14, studyR: 10, nest: 'ground',
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
  wolf: 0.95, eagle: 0.7, bear: 1.15, badger: 0.7,
  duck: 0.5, koi: 0.55, beaver: 0.65,
  crab: 0.45, butterfly: 0.5, raccoon: 0.7, seagull: 0.5, firefly: 0.45, boar: 0.9, heron: 0.75
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
    this.hiddenT = 0;      // hiding in a burrow / sunk in sand
    this.eatT = 0;         // wolf feeding pause
    this.dabbleT = 0;      // duck bottoms-up
    this.nest = null;      // {x, z} home to return to
    this.prey = null;      // wolf hunt target
    this.fleeSrc = null;   // what we're running from (player or predator)
  }
  retarget() {
    // herd cohesion: drift toward the middle of your buddies
    let cx = 0, cz = 0, n = 0;
    if (this.sp.herd) {
      for (const o of G.animals) {
        if (o === this || o.key !== this.key || !o.alive || o.caged) continue;
        const d = Math.hypot(o.pos.x - this.pos.x, o.pos.z - this.pos.z);
        if (d < 30) { cx += o.pos.x; cz += o.pos.z; n++; }
      }
    }
    for (let i = 0; i < 8; i++) {
      const a = Math.random() * Math.PI * 2, r = 3 + Math.random() * 10;
      let tx = this.home.x + Math.cos(a) * r, tz = this.home.y + Math.sin(a) * r;
      if (n) { tx = (tx + cx / n) / 2; tz = (tz + cz / n) / 2; }
      if (this.sp.place(G.sample(tx, tz), tx, tz)) { this.target.set(tx, tz); return; }
    }
    this.target.set(this.home.x, this.home.y);
  }
  startFlee(srcPos, spread) {
    if (this.sp.fleeSpeed <= 0) return;
    this.state = 'flee';
    this.timer = 2.5;
    this.fleeSrc = srcPos || null;
    // dive for the nearest burrow if that's our style
    if (this.sp.burrowHide) {
      let best = null, bd = 14;
      for (const b of G.burrows) {
        const d = Math.hypot(b.x - this.pos.x, b.z - this.pos.z);
        if (d < bd) { best = b; bd = d; }
      }
      if (best) { this.state = 'toBurrow'; this.burrow = best; }
    }
    // panic is contagious in a herd
    if (spread && this.sp.herd) {
      for (const o of G.animals) {
        if (o === this || o.key !== this.key || !o.alive || o.caged || o.state === 'flee') continue;
        if (Math.hypot(o.pos.x - this.pos.x, o.pos.z - this.pos.z) < 14) o.startFlee(srcPos, false);
      }
    }
  }
  despawnRespawn(delay) {
    this.alive = false;
    this.mesh.visible = false;
    G.respawnQueue.push({ key: this.key, t: delay || 90 });
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
    // hiding underground (burrow dive / sand sink)
    if (this.hiddenT > 0) {
      this.hiddenT -= dt;
      if (this.hiddenT <= 0) {
        this.mesh.visible = true;
        this.state = 'idle';
        this.timer = 1;
        if (G.fx) G.fx.dust(this.pos, 2);
      }
      return;
    }
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
    if (this.eatT > 0) { this.eatT -= dt; this.settleY(dt); return; } // wolf feeding
    const dx = player.pos.x - this.pos.x, dz = player.pos.z - this.pos.z;
    let dist = Math.hypot(dx, dz);
    if (player.hidden) dist *= 3; // stealth: you read as much farther away

    // armadillo: balls up instead of running
    if (this.sp.ball) {
      const near = dist < this.sp.wary + 2;
      if (near && this.state !== 'ball') { this.state = 'ball'; this.timer = 0; }
      if (this.state === 'ball') {
        this.timer = near ? 3 : this.timer - dt;
        this.mesh.scale.setScalar(G.SPECIES_SCALE[this.key]);
        this.mesh.scale.y *= 0.72;
        if (this.timer <= 0) { this.state = 'idle'; this.mesh.scale.setScalar(G.SPECIES_SCALE[this.key]); }
        this.settleY(dt);
        return;
      }
    }
    // scorpion: sinks under the sand when something huge stomps close
    if (this.sp.stinger && !player.small && dist < 4) {
      this.mesh.visible = false;
      this.hiddenT = 3.5;
      if (G.fx) G.fx.dust(this.pos, 2);
      return;
    }
    // wolves hunt at night
    if (this.sp.hunts && G.isNight && this.state !== 'chase') {
      if (!this.prey || !this.prey.alive || this.prey.caged || this.prey.hiddenT > 0) {
        this.prey = null;
        if (Math.random() < dt * 0.5) { // scan occasionally
          let best = null, bd = 28;
          for (const o of G.animals) {
            if (!o.alive || o.caged || o.hiddenT > 0) continue;
            if (!['rabbit', 'deer', 'mouse', 'duck'].includes(o.key)) continue;
            const d = Math.hypot(o.pos.x - this.pos.x, o.pos.z - this.pos.z);
            if (d < bd) { best = o; bd = d; }
          }
          if (best) this.prey = best;
        }
      }
      if (this.prey) {
        const p = this.prey;
        const pdx = p.pos.x - this.pos.x, pdz = p.pos.z - this.pos.z;
        const pd = Math.hypot(pdx, pdz) || 1;
        this.move(pdx / pd * this.sp.speed * 2.2 * dt, pdz / pd * this.sp.speed * 2.2 * dt);
        this.face(pdx, pdz, dt);
        if (p.state !== 'flee' && p.state !== 'toBurrow' && pd < 14) p.startFlee(this.pos, true);
        if (pd < 1.3) {
          p.despawnRespawn(90 + Math.random() * 60);
          this.prey = null;
          this.eatT = 3.5;
          if (G.fx) G.fx.burst(this.pos, 0xc9ccd1);
        }
        this.settleY(dt);
        return;
      }
    }
    // burrow dash: committed sprint for the hole
    if (this.state === 'toBurrow' && this.burrow) {
      const bdx = this.burrow.x - this.pos.x, bdz = this.burrow.z - this.pos.z;
      const bd = Math.hypot(bdx, bdz) || 1;
      this.move(bdx / bd * this.sp.fleeSpeed * dt, bdz / bd * this.sp.fleeSpeed * dt);
      this.face(bdx, bdz, dt);
      if (bd < 0.8) {
        this.pos.set(this.burrow.x, this.pos.y, this.burrow.z);
        this.mesh.visible = false;
        this.hiddenT = 4 + Math.random() * 3;
        if (G.fx) G.fx.dust(this.pos, 3);
        this.state = 'idle';
      }
      this.settleY(dt);
      return;
    }
    // homebody: return to the nest / lodge and settle for a while
    if (this.state === 'homing' && this.nest) {
      const ndx = this.nest.x - this.pos.x, ndz = this.nest.z - this.pos.z;
      const nd = Math.hypot(ndx, ndz) || 1;
      this.move(ndx / nd * this.sp.speed * dt, ndz / nd * this.sp.speed * dt);
      this.face(ndx, ndz, dt);
      if (nd < 1.1) { this.state = 'nesting'; this.timer = 6 + Math.random() * 5; }
      this.settleY(dt);
      return;
    }
    if (this.state === 'nesting') {
      this.timer -= dt;
      if (this.timer <= 0 || dist < this.sp.wary * 0.7) this.state = 'idle';
      this.pos.y += (G.heightAt(this.pos.x, this.pos.z) - 0.06 - this.pos.y) * Math.min(1, dt * 8);
      return;
    }

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
    if ((this.sp.fleeSpeed > 0 && dist < threat && this.state !== 'flee' && this.state !== 'toBurrow') || this.fear > 0) {
      if (this.sp.fleeSpeed > 0 && this.state !== 'flee' && this.state !== 'toBurrow')
        this.startFlee(player.pos, true);
    }

    if (this.state === 'flee') {
      this.timer -= dt;
      const src = this.fleeSrc || player.pos;
      const fdx = this.pos.x - src.x, fdz = this.pos.z - src.z;
      const d = Math.hypot(fdx, fdz) || 1;
      const sp = this.sp.fleeSpeed || this.sp.speed * 2;
      this.move(fdx / d * sp * dt, fdz / d * sp * dt);
      this.face(fdx, fdz, dt);
      if (this.timer <= 0) { this.state = 'idle'; this.fleeSrc = null; }
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
      if (this.timer <= 0) {
        // head home to the nest sometimes; otherwise wander
        if (this.nest && Math.random() < 0.3 &&
            Math.hypot(this.nest.x - this.pos.x, this.nest.z - this.pos.z) > 3) {
          this.state = 'homing';
        } else {
          this.retarget();
          this.state = 'walk';
        }
      }
      // ducks dabble: bottoms-up!
      if (this.sp.floats) {
        this.dabbleT -= dt;
        if (this.dabbleT < -1.2) this.dabbleT = 4 + Math.random() * 6;
        this.mesh.rotation.x = this.dabbleT < 0 ? 0.9 : 0;
      }
    }
    this.settleY(dt);
  }
  move(mx, mz) {
    const nx = this.pos.x + mx, nz = this.pos.z + mz;
    const smp = G.sample(nx, nz);
    const waterOK = this.key === 'croc' || this.sp.floats || this.sp.aquatic;
    if (!waterOK && smp.h < G.WATER_Y - 0.3) { this.state = 'idle'; this.timer = 0.5; return; }
    if (this.sp.aquatic && smp.h > G.WATER_Y - 2) { this.state = 'idle'; this.timer = 0.5; return; } // fish stay deep
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
    if (this.sp.floats && ground < G.WATER_Y - 0.35) y = G.WATER_Y - 0.1 + Math.sin(this.bob * 2) * 0.04;
    if (this.sp.aquatic) {
      // koi cruise mid-water above the lakebed
      y = Math.min(G.WATER_Y - 1.2, ground + 0.8 + Math.sin(this.bob * 1.5) * 0.6);
      this.mesh.rotation.x = Math.sin(this.bob * 3) * 0.12;
    }
    if (this.sp.flutter) y = ground + 0.7 + Math.sin(this.bob * 2.2) * 0.35; // airborne drift
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
// nest props: ground nest (twig ring + eggs) or beaver lodge (stick dome)
function buildNestProp(kind, x, z) {
  const g = new THREE.Group();
  const h = G.heightAt(x, z);
  if (kind === 'lodge') {
    for (let i = 0; i < 7; i++) {
      const a = i / 7 * Math.PI * 2;
      const stick = G.part(g, G.geo.cyl, 0x8a6239, Math.cos(a) * 0.5, 0.45, Math.sin(a) * 0.5, 0.08, 1.5, 0.08);
      stick.rotation.z = Math.cos(a) * 0.9;
      stick.rotation.x = -Math.sin(a) * 0.9;
    }
    G.part(g, G.geo.sphere, 0x6b4c2c, 0, 0.35, 0, 0.75, 0.5, 0.75);
  } else {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.14, 6, 12), G.mat(0x8a6239));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.12;
    g.add(ring);
    G.part(g, G.geo.sphere, 0xf2ecd9, 0.12, 0.16, 0.05, 0.13, 0.16, 0.13);
    G.part(g, G.geo.sphere, 0xf2ecd9, -0.12, 0.15, -0.08, 0.12, 0.15, 0.12);
  }
  g.position.set(x, h, z);
  G.scene.add(g);
  return g;
}
function giveNest(an, rand) {
  const kind = an.sp.nest;
  // find a dry-ish spot near home
  for (let i = 0; i < 40; i++) {
    const a = rand() * Math.PI * 2, r = 2 + rand() * 6;
    const x = an.home.x + Math.cos(a) * r, z = an.home.y + Math.sin(a) * r;
    const h = G.heightAt(x, z);
    if (kind === 'lodge' ? (h > -0.5 && h < 0.4) : h > 0.2) {
      buildNestProp(kind, x, z);
      an.nest = { x, z };
      return;
    }
  }
}

G.spawnAnimals = function (scene) {
  const rand = G.mulberry(G.seed + 1234);
  for (const key in G.SPECIES) {
    const sp = G.SPECIES[key];
    let placed = 0, tries = 0, lastX = null, lastZ = null;
    while (placed < sp.count && tries++ < 1400) {
      let x, z;
      if (sp.herd && lastX !== null && rand() < 0.65) {
        // herds spawn clustered around the first of their kind
        const a = rand() * Math.PI * 2, r = 3 + rand() * 8;
        x = lastX + Math.cos(a) * r; z = lastZ + Math.sin(a) * r;
      } else {
        const a = rand() * Math.PI * 2, r = 40 + rand() * 170;
        x = Math.cos(a) * r; z = Math.sin(a) * r;
      }
      if (!sp.place(G.sample(x, z), x, z)) continue;
      const an = new Animal(key, x, z);
      scene.add(an.mesh);
      G.animals.push(an);
      if (sp.nest) giveNest(an, rand);
      lastX = x; lastZ = z;
      placed++;
    }
  }
  // tutorial fox: guaranteed, close to camp, half as wary
  let fx = 0, fz = 0, found = false;
  for (let r = 30; r < 120 && !found; r += 4) for (let a = 0; a < 6.28; a += 0.25) {
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (G.SPECIES.fox.place(G.sample(x, z), x, z)) { fx = x; fz = z; found = true; break; }
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
      if (G.SPECIES[r.key].place(G.sample(x, z), x, z)) { G.spawnAnimalAt(r.key, x, z); break; }
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
