'use strict';
// ---------------------------------------------------------------------------
// Wildmask — player.js : Stuart Diver, mask transformations, movement, abilities
// ---------------------------------------------------------------------------
// Movement fields: speed/sprint/jump/slope/swim/breath/small/stamDrain
// Combat fields:   dmg/atkCd/range/kb/def (damage taken multiplier)
// Ability flags:   kick (smash boulders), claw (venom stun), dash, doubleJump,
//                  glide, dive, block, roll, howl, spit, fruit, stealth, nightVision
G.MASK_STATS = {
  // bare Stuart fights with his heavy yo-yo: solid reach and a good wallop
  none:     { speed: 5.5, sprint: 8.5, jump: 8.5,  slope: 1.7, swim: 1.8, breath: 8,   stamDrain: 14, dmg: 2,   atkCd: 0.7,  range: 2.7, kb: 2.5, def: 1, yoyo: true },
  fox:      { speed: 7.0, sprint: 10,  jump: 8.5,  slope: 1.7, swim: 2.0, breath: 10,  stamDrain: 10, dmg: 2,   atkCd: 0.5,  range: 2.0, kb: 1,   def: 1,    dash: true, stealth: true },
  rabbit:   { speed: 6.0, sprint: 9,   jump: 9.5,  slope: 1.7, swim: 1.6, breath: 8,   stamDrain: 10, dmg: 1,   atkCd: 0.3,  range: 1.6, kb: 0.6, def: 1,    doubleJump: true },
  deer:     { speed: 7.5, sprint: 11,  jump: 11,   slope: 1.8, swim: 1.8, breath: 8,   stamDrain: 9,  dmg: 2,   atkCd: 0.8,  range: 2.0, kb: 3,   def: 1 },
  frog:     { speed: 5.5, sprint: 8.5, jump: 15.5, slope: 1.7, swim: 2.6, breath: 20,  stamDrain: 14, dmg: 2,   atkCd: 0.6,  range: 2.0, kb: 4,   def: 1,    kick: true },
  horse:    { speed: 7.0, sprint: 16,  jump: 9,    slope: 1.7, swim: 1.8, breath: 8,   stamDrain: 2,  dmg: 2,   atkCd: 0.9,  range: 2.0, kb: 5,   def: 1 },
  croc:     { speed: 4.8, sprint: 7,   jump: 7.5,  slope: 1.5, swim: 7.5, breath: 240, stamDrain: 14, dmg: 4,   atkCd: 1.1,  range: 2.1, kb: 1.5, def: 0.85 },
  mouse:    { speed: 4.2, sprint: 6.5, jump: 6,    slope: 1.7, swim: 1.4, breath: 6,   stamDrain: 10, dmg: 0.5, atkCd: 0.3,  range: 1.2, kb: 0.4, def: 0.85, small: true },
  tortoise: { speed: 4.0, sprint: 5.5, jump: 6.5,  slope: 1.5, swim: 3.0, breath: 60,  stamDrain: 12, dmg: 2.5, atkCd: 1.2,  range: 1.9, kb: 3,   def: 0.6,  block: true },
  otter:    { speed: 5.5, sprint: 8.5, jump: 8,    slope: 1.7, swim: 9,   breath: 60,  stamDrain: 10, dmg: 1.5, atkCd: 0.35, range: 1.7, kb: 0.6, def: 1 },
  cobra:    { speed: 5.0, sprint: 7.5, jump: 7,    slope: 1.7, swim: 2.2, breath: 12,  stamDrain: 12, dmg: 2,   atkCd: 0.9,  range: 2.0, kb: 0.5, def: 0.95, spit: true, venomImmune: true },
  monkey:   { speed: 6.0, sprint: 9,   jump: 10.5, slope: 2.2, swim: 1.8, breath: 8,   stamDrain: 10, dmg: 1.5, atkCd: 0.6,  range: 1.8, kb: 1,   def: 1,    fruit: true },
  goat:     { speed: 6.0, sprint: 8.5, jump: 9,    slope: 999, swim: 1.6, breath: 8,   stamDrain: 8,  dmg: 2.5, atkCd: 0.9,  range: 2.0, kb: 6,   def: 0.9 },
  armadillo:{ speed: 5.0, sprint: 12,  jump: 6.5,  slope: 1.7, swim: 1.4, breath: 8,   stamDrain: 8,  dmg: 2,   atkCd: 0.8,  range: 1.8, kb: 4,   def: 0.75, roll: true },
  owl:      { speed: 5.5, sprint: 8,   jump: 9,    slope: 1.7, swim: 1.4, breath: 8,   stamDrain: 11, dmg: 2,   atkCd: 0.7,  range: 1.9, kb: 1,   def: 1,    glide: 0.55, nightVision: true },
  scorpion: { speed: 4.0, sprint: 6,   jump: 6,    slope: 999, swim: 1.2, breath: 6,   stamDrain: 10, dmg: 1,   atkCd: 0.7,  range: 1.4, kb: 0.5, def: 0.9,  small: true, claw: true, venomImmune: true },
  wolf:     { speed: 8.0, sprint: 12,  jump: 9,    slope: 1.8, swim: 2.2, breath: 10,  stamDrain: 6,  dmg: 2.5, atkCd: 0.45, range: 2.0, kb: 1.5, def: 0.9,  howl: true },
  eagle:    { speed: 6.0, sprint: 9,   jump: 9,    slope: 1.7, swim: 1.4, breath: 8,   stamDrain: 10, dmg: 2,   atkCd: 0.6,  range: 1.9, kb: 1,   def: 1,    glide: 0.8, dive: true },
  bear:     { speed: 5.0, sprint: 7.5, jump: 7.5,  slope: 1.7, swim: 2.4, breath: 20,  stamDrain: 12, dmg: 5,   atkCd: 1.3,  range: 2.3, kb: 8,   def: 0.7,  kick: true },
  badger:   { speed: 5.8, sprint: 8.5, jump: 7.5,  slope: 1.7, swim: 2.0, breath: 12,  stamDrain: 9,  dmg: 3.5, atkCd: 0.22, range: 1.8, kb: 1,   def: 0.5,  venomImmune: true }
};

// ---------------------------------------------------------------------------
// mask headgear builders: tinted dome + 1–2 signature features each
// ---------------------------------------------------------------------------
function buildMaskGear(head) {
  const S = G.geo.sphere, X = G.geo.box, C = G.geo.cyl, K = G.geo.cone;
  const masks = {};
  const dome = (g, col) => { G.part(g, S, col, 0, 0.12, 0, 1.02, 0.96, 1.02).castShadow = false; };
  { const g = new THREE.Group(); dome(g, 0xd97a3c);                                    // fox
    G.part(g, K, 0x2c2c2c, 0.5, 1.0, 0, 0.28, 0.6, 0.28);
    G.part(g, K, 0x2c2c2c, -0.5, 1.0, 0, 0.28, 0.6, 0.28);
    G.part(g, K, 0xd97a3c, 0, -0.1, 0.9, 0.4, 0.8, 0.4).rotation.x = 1.6;
    G.part(g, S, 0x2c2c2c, 0, -0.1, 1.3, 0.14);
    masks.fox = g; }
  { const g = new THREE.Group(); dome(g, 0xcfc4b4);                                    // rabbit
    G.part(g, S, 0xcfc4b4, 0.4, 1.4, -0.1, 0.28, 0.9, 0.2);
    G.part(g, S, 0xcfc4b4, -0.4, 1.4, -0.1, 0.28, 0.9, 0.2);
    G.part(g, S, 0xf0b9c4, 0, -0.1, 0.95, 0.18);
    masks.rabbit = g; }
  { const g = new THREE.Group(); dome(g, 0xb08a5c);                                    // deer
    for (const sx of [-0.4, 0.4]) {
      G.part(g, C, 0xe6d4b8, sx, 1.1, -0.15, 0.09, 0.9, 0.09).rotation.z = sx > 0 ? -0.4 : 0.4;
      G.part(g, C, 0xe6d4b8, sx * 2, 1.45, -0.15, 0.07, 0.5, 0.07).rotation.z = sx > 0 ? 0.5 : -0.5;
    }
    masks.deer = g; }
  { const g = new THREE.Group();                                                       // frog
    dome(g, 0x62b64e);
    const e1 = G.part(g, S, 0x62b64e, 0.45, 1.0, 0.2, 0.32);
    const e2 = G.part(g, S, 0x62b64e, -0.45, 1.0, 0.2, 0.32);
    G.part(e1, S, 0x1c1c1c, 0, 0.3, 0.5, 0.45);
    G.part(e2, S, 0x1c1c1c, 0, 0.3, 0.5, 0.45);
    masks.frog = g; }
  { const g = new THREE.Group(); dome(g, 0xb07845);                                    // horse
    G.part(g, X, 0x8f5f36, 0, -0.1, 0.85, 0.55, 0.5, 0.6);
    G.part(g, K, 0x8f5f36, 0.5, 1.05, 0, 0.22, 0.55, 0.22);
    G.part(g, K, 0x8f5f36, -0.5, 1.05, 0, 0.22, 0.55, 0.22);
    G.part(g, X, 0x5c4326, 0, 0.75, -0.5, 0.3, 0.8, 0.7);
    masks.horse = g; }
  { const g = new THREE.Group(); dome(g, 0x5d8c46);                                    // croc
    G.part(g, X, 0x6f9e55, 0, -0.15, 1.0, 0.7, 0.4, 1.4);
    G.part(g, X, 0xf5f2e3, 0, -0.38, 1.0, 0.62, 0.12, 1.3);
    G.part(g, S, 0xf7d83b, 0.35, 0.55, 0.55, 0.2);
    G.part(g, S, 0xf7d83b, -0.35, 0.55, 0.55, 0.2);
    masks.croc = g; }
  { const g = new THREE.Group(); dome(g, 0xa8a29c);                                    // mouse
    G.part(g, S, 0xd9a7b2, 0.72, 0.85, 0, 0.5, 0.5, 0.16);
    G.part(g, S, 0xd9a7b2, -0.72, 0.85, 0, 0.5, 0.5, 0.16);
    G.part(g, S, 0xf0b9c4, 0, -0.05, 0.95, 0.22);
    masks.mouse = g; }
  { const g = new THREE.Group(); dome(g, 0x6b8f4e);                                    // tortoise
    G.part(g, S, 0x54713d, 0, 0.55, 0, 0.75, 0.5, 0.75);
    G.part(g, S, 0xa8b06a, 0, -0.15, 0.9, 0.3, 0.22, 0.3);
    masks.tortoise = g; }
  { const g = new THREE.Group(); dome(g, 0x7a5a3c);                                    // otter
    G.part(g, S, 0x6b4e33, 0.6, 0.75, 0, 0.25, 0.25, 0.14);
    G.part(g, S, 0x6b4e33, -0.6, 0.75, 0, 0.25, 0.25, 0.14);
    G.part(g, S, 0xc9b499, 0, -0.15, 0.85, 0.35, 0.25, 0.3);
    G.part(g, S, 0x2c2c2c, 0, -0.05, 1.05, 0.12);
    masks.otter = g; }
  { const g = new THREE.Group(); dome(g, 0x8fa04c);                                    // cobra
    G.part(g, S, 0x8fa04c, 0, 0.55, -0.35, 1.0, 1.15, 0.4);                            // hood
    G.part(g, S, 0xdec468, 0, 0.55, -0.15, 0.75, 0.9, 0.3);
    G.part(g, K, 0xf5f2e3, 0.2, -0.3, 0.85, 0.09, 0.3, 0.09).rotation.x = Math.PI;
    G.part(g, K, 0xf5f2e3, -0.2, -0.3, 0.85, 0.09, 0.3, 0.09).rotation.x = Math.PI;
    masks.cobra = g; }
  { const g = new THREE.Group(); dome(g, 0x8a6a48);                                    // monkey
    G.part(g, S, 0xd9bc9a, 0.85, 0.3, 0, 0.32, 0.32, 0.14);
    G.part(g, S, 0xd9bc9a, -0.85, 0.3, 0, 0.32, 0.32, 0.14);
    G.part(g, S, 0xd9bc9a, 0, -0.05, 0.8, 0.5, 0.4, 0.35);
    masks.monkey = g; }
  { const g = new THREE.Group(); dome(g, 0xd8d2c8);                                    // goat
    for (const sx of [-0.42, 0.42]) {
      G.part(g, C, 0x8f8474, sx, 0.85, -0.25, 0.12, 0.6, 0.1).rotation.x = -0.7;
      G.part(g, C, 0x8f8474, sx, 1.15, -0.6, 0.08, 0.5, 0.07).rotation.x = -1.6;
    }
    G.part(g, S, 0xf5efe3, 0, -0.55, 0.6, 0.2, 0.35, 0.16);
    masks.goat = g; }
  { const g = new THREE.Group();                                                       // armadillo
    for (let i = 0; i < 3; i++)
      G.part(g, S, i % 2 ? 0xb0988a : 0xa08878, 0, 0.25 - i * 0.12, -0.1 - i * 0.12, 1.04 - i * 0.06, 0.75, 1.0);
    G.part(g, S, 0xd9a7b2, 0.5, 1.0, -0.2, 0.26, 0.4, 0.14);
    G.part(g, S, 0xd9a7b2, -0.5, 1.0, -0.2, 0.26, 0.4, 0.14);
    masks.armadillo = g; }
  { const g = new THREE.Group(); dome(g, 0x8a6f52);                                    // owl
    G.part(g, S, 0xf7d83b, 0.4, 0.2, 0.85, 0.3);
    G.part(g, S, 0xf7d83b, -0.4, 0.2, 0.85, 0.3);
    G.part(g, S, 0x1c1c1c, 0.4, 0.2, 1.1, 0.13);
    G.part(g, S, 0x1c1c1c, -0.4, 0.2, 1.1, 0.13);
    G.part(g, K, 0xdea842, 0, -0.15, 0.95, 0.16, 0.4, 0.16).rotation.x = 1.9;
    G.part(g, K, 0x6b5540, 0.55, 1.0, 0, 0.22, 0.5, 0.22);
    G.part(g, K, 0x6b5540, -0.55, 1.0, 0, 0.22, 0.5, 0.22);
    masks.owl = g; }
  { const g = new THREE.Group(); dome(g, 0x8c3b26);                                    // scorpion
    let ty = 0.7, tz = -0.7;
    for (let i = 0; i < 4; i++) { G.part(g, S, 0x8c3b26, 0, ty, tz, 0.28 - i * 0.03); ty += 0.42; tz += 0.28; }
    G.part(g, K, 0x3a1810, 0, ty + 0.1, tz + 0.15, 0.16, 0.5, 0.16).rotation.x = 2.4;
    masks.scorpion = g; }
  { const g = new THREE.Group(); dome(g, 0x6f7278);                                    // wolf
    G.part(g, K, 0x5a5d63, 0.5, 1.0, -0.1, 0.28, 0.6, 0.28);
    G.part(g, K, 0x5a5d63, -0.5, 1.0, -0.1, 0.28, 0.6, 0.28);
    G.part(g, K, 0x5a5d63, 0, -0.1, 0.9, 0.42, 0.85, 0.42).rotation.x = 1.6;
    G.part(g, S, 0x2c2c2c, 0, -0.1, 1.3, 0.14);
    masks.wolf = g; }
  { const g = new THREE.Group(); dome(g, 0xf5f2e3);                                    // eagle
    G.part(g, K, 0xdea842, 0, -0.1, 0.95, 0.24, 0.55, 0.24).rotation.x = 1.85;
    G.part(g, S, 0x6b4e33, 0, 0.75, -0.4, 0.85, 0.5, 0.7);
    masks.eagle = g; }
  { const g = new THREE.Group(); dome(g, 0x6f4e33);                                    // bear
    G.part(g, S, 0x5a3e28, 0.6, 0.85, 0, 0.32, 0.32, 0.16);
    G.part(g, S, 0x5a3e28, -0.6, 0.85, 0, 0.32, 0.32, 0.16);
    G.part(g, S, 0xa8825c, 0, -0.15, 0.85, 0.42, 0.32, 0.35);
    G.part(g, S, 0x2c2c2c, 0, -0.02, 1.12, 0.13);
    masks.bear = g; }
  { const g = new THREE.Group(); dome(g, 0x3d3d40);                                    // badger
    G.part(g, S, 0xd8d2c8, 0, 0.45, 0.25, 0.5, 0.75, 0.95);                            // head stripe
    G.part(g, S, 0x2c2c2c, 0, -0.1, 0.95, 0.15);
    masks.badger = g; }
  for (const k in masks) { masks[k].visible = false; head.add(masks[k]); }
  return masks;
}

// ---------------------------------------------------------------------------
// per-mask body kits: tint + tail/wings/shell so every form reads differently
// ---------------------------------------------------------------------------
const KIT_TINT = {
  fox: 0xd97a3c, rabbit: 0xcfc4b4, deer: 0xb08a5c, frog: 0x62b64e, horse: 0xb07845,
  croc: 0x5d8c46, mouse: 0xa8a29c, tortoise: 0x6b8f4e, otter: 0x7a5a3c, cobra: 0x8fa04c,
  monkey: 0x8a6a48, goat: 0xd8d2c8, armadillo: 0xb0988a, owl: 0x8a6f52, scorpion: 0x8c3b26,
  wolf: 0x6f7278, eagle: 0x6b4e33, bear: 0x6f4e33, badger: 0x3d3d40
};
function buildBodyKits(body) {
  const S = G.geo.sphere, C = G.geo.cyl, K = G.geo.cone;
  const kits = {};
  const kit = k => { const g = new THREE.Group(); g.visible = false; body.add(g); kits[k] = g; return g; };
  { const g = kit('fox');                                                   // bushy white-tipped tail
    const t = G.part(g, S, 0xd97a3c, 0, 0.48, -0.48, 0.15, 0.15, 0.4); t.rotation.x = -0.5;
    G.part(t, S, 0xf2e6d4, 0, 0, -0.8, 0.6, 0.6, 0.5); }
  { const g = kit('rabbit'); G.part(g, S, 0xf5efe3, 0, 0.42, -0.4, 0.14);   // puff tail
    G.part(g, S, 0xf5efe3, 0, 0.55, 0.26, 0.18, 0.24, 0.1); }              // fluffy chest
  { const g = kit('deer'); G.part(g, S, 0xf5efe3, 0, 0.5, -0.38, 0.1, 0.15, 0.08);
    G.part(g, S, 0xd9c4a4, 0, 0.55, 0.26, 0.17, 0.24, 0.1); }
  { const g = kit('frog'); G.part(g, S, 0xd8eec2, 0, 0.55, 0.26, 0.2, 0.26, 0.1);
    G.part(g, S, 0x4c9440, 0.15, 0.08, 0.06, 0.16, 0.07, 0.22);            // webbed feet
    G.part(g, S, 0x4c9440, -0.15, 0.08, 0.06, 0.16, 0.07, 0.22); }
  { const g = kit('horse');
    const t = G.part(g, C, 0x5c4326, 0, 0.4, -0.42, 0.07, 0.55, 0.07); t.rotation.x = 0.5; }
  { const g = kit('croc');                                                  // big tail + back ridges
    const t = G.part(g, K, 0x527c3e, 0, 0.35, -0.65, 0.18, 0.75, 0.18); t.rotation.x = -1.9;
    for (let i = 0; i < 3; i++) G.part(g, K, 0x3f6330, 0, 0.92 - i * 0.14, -0.28 - i * 0.1, 0.09, 0.2, 0.09); }
  { const g = kit('mouse');
    const t = G.part(g, C, 0xd9a7b2, 0, 0.28, -0.5, 0.035, 0.6, 0.035); t.rotation.x = 1.15; }
  { const g = kit('tortoise');                                              // shell!
    G.part(g, S, 0x54713d, 0, 0.62, -0.28, 0.42, 0.44, 0.26);
    G.part(g, S, 0x6b8f4e, 0, 0.62, -0.3, 0.34, 0.34, 0.2); }
  { const g = kit('otter');
    const t = G.part(g, K, 0x6b4e33, 0, 0.28, -0.55, 0.13, 0.65, 0.13); t.rotation.x = -1.75; }
  { const g = kit('cobra'); G.part(g, S, 0xdec468, 0, 0.55, 0.27, 0.2, 0.3, 0.08); }
  { const g = kit('monkey');                                                // curly tail
    const t1 = G.part(g, C, 0x8a6a48, 0, 0.45, -0.45, 0.05, 0.5, 0.05); t1.rotation.x = 0.9;
    const t2 = G.part(g, C, 0x8a6a48, 0, 0.75, -0.62, 0.045, 0.35, 0.045); t2.rotation.x = -0.6; }
  { const g = kit('goat'); G.part(g, S, 0xf5efe3, 0, 0.5, 0.26, 0.2, 0.3, 0.12);
    G.part(g, S, 0xf5efe3, 0, 0.5, -0.36, 0.1, 0.14, 0.08); }
  { const g = kit('armadillo');                                             // banded back plates
    for (let i = 0; i < 3; i++)
      G.part(g, S, i % 2 ? 0xa08878 : 0xb0988a, 0, 0.78 - i * 0.16, -0.26, 0.34 - i * 0.02, 0.14, 0.2); }
  { const g = kit('owl');                                                   // folded wings + tail feathers
    G.part(g, S, 0x6b5540, 0.4, 0.6, -0.08, 0.1, 0.34, 0.24);
    G.part(g, S, 0x6b5540, -0.4, 0.6, -0.08, 0.1, 0.34, 0.24);
    G.part(g, S, 0xd9c4a4, 0, 0.38, -0.36, 0.16, 0.08, 0.22); }
  { const g = kit('scorpion');
    for (let i = 0; i < 2; i++) G.part(g, S, 0x6d2c1b, 0, 0.82 - i * 0.2, -0.28, 0.3 - i * 0.04, 0.12, 0.18); }
  { const g = kit('wolf');
    const t = G.part(g, S, 0x5a5d63, 0, 0.45, -0.5, 0.13, 0.13, 0.36); t.rotation.x = -0.4;
    G.part(g, S, 0xc9ccd1, 0, 0.55, 0.26, 0.18, 0.26, 0.1); }
  { const g = kit('eagle');                                                 // proud wings + white tail
    const w1 = G.part(g, S, 0x5a4128, 0.5, 0.65, -0.05, 0.42, 0.07, 0.26); w1.rotation.z = 0.3;
    const w2 = G.part(g, S, 0x5a4128, -0.5, 0.65, -0.05, 0.42, 0.07, 0.26); w2.rotation.z = -0.3;
    G.part(g, S, 0xf5f2e3, 0, 0.38, -0.38, 0.18, 0.07, 0.26); }
  { const g = kit('bear'); G.part(g, S, 0xa8825c, 0, 0.52, 0.26, 0.22, 0.3, 0.1);
    G.part(g, S, 0x5a3e28, 0, 0.45, -0.38, 0.11); }
  { const g = kit('badger'); G.part(g, S, 0xd8d2c8, 0, 0.8, -0.12, 0.16, 0.5, 0.36); } // dorsal stripe
  return kits;
}

G.buildPlayer = function (scene) {
  const S = G.geo.sphere, X = G.geo.box, C = G.geo.cyl;
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  // --- Stuart Diver, safari street punk ---
  // unique tee material so masks can tint him without touching shared mats
  const shirtMat = G.curve(new THREE.MeshLambertMaterial({ color: 0x3a3f4a }));
  const shirt = new THREE.Mesh(G.geo.sphere, shirtMat);       // dark tee
  shirt.position.set(0, 0.62, 0);
  shirt.scale.set(0.34, 0.42, 0.28);
  shirt.castShadow = true;
  body.add(shirt);
  // open khaki vest: back panel + two front lapels
  G.part(body, X, 0xb0a26a, 0, 0.66, -0.24, 0.52, 0.62, 0.14);
  G.part(body, X, 0xb0a26a, 0.21, 0.62, 0.2, 0.16, 0.55, 0.1).rotation.y = 0.25;
  G.part(body, X, 0xb0a26a, -0.21, 0.62, 0.2, 0.16, 0.55, 0.1).rotation.y = -0.25;
  G.part(body, X, 0x8a6239, 0, 0.6, -0.32, 0.34, 0.42, 0.1);  // slim field pack
  // belt + yo-yo holster
  G.part(body, X, 0x4a3828, 0, 0.32, 0, 0.62, 0.1, 0.5);
  G.part(body, X, 0xd9b44a, 0, 0.32, 0.14, 0.12, 0.09, 0.06);
  const beltYoyo = G.part(body, C, 0xd94f4f, 0.28, 0.3, 0.1, 0.09, 0.05, 0.09);
  beltYoyo.rotation.z = Math.PI / 2;
  // chunky boots
  G.part(body, S, 0x2c2c30, 0.13, 0.1, 0.03, 0.15, 0.11, 0.2);
  G.part(body, S, 0x2c2c30, -0.13, 0.1, 0.03, 0.15, 0.11, 0.2);
  const head = G.part(body, S, 0xffd9a6, 0, 1.28, 0, 0.42);
  G.part(head, S, 0x1c1c1c, 0.32, 0.05, 0.93, 0.11);
  G.part(head, S, 0x1c1c1c, -0.32, 0.05, 0.93, 0.11);
  // red bandana around the neck
  G.part(body, S, 0xd94f4f, 0, 0.92, 0.04, 0.24, 0.13, 0.22);
  G.part(body, X, 0xd94f4f, 0.1, 0.78, 0.16, 0.12, 0.22, 0.05).rotation.z = 0.3;
  // fingerless gloves
  const hands = [
    G.part(body, S, 0x2c2c30, 0.4, 0.62, 0.05, 0.12),
    G.part(body, S, 0x2c2c30, -0.4, 0.62, 0.05, 0.12)
  ];
  // "hat" group = punk hair + forehead goggles (hidden when a mask is on)
  const hat = new THREE.Group();
  for (let i = 0; i < 5; i++) {                                // spiky hair
    const a = -0.7 + i * 0.35;
    const spike = G.part(hat, G.geo.cone, 0x2c2320, Math.sin(a) * 0.5, 0.85, Math.cos(a) * 0.25 - 0.15, 0.22, 0.55, 0.22);
    spike.rotation.x = -0.35 + Math.abs(a) * 0.15;
    spike.rotation.z = -a * 0.5;
  }
  G.part(hat, S, 0x2c2320, 0, 0.55, -0.3, 0.72, 0.5, 0.6);     // hair base
  G.part(hat, X, 0x4a4a4a, 0, 0.42, 0.3, 1.6, 0.22, 1.3).rotation.x = -0.15; // goggle strap
  G.part(hat, S, 0x9fd9f0, 0.3, 0.5, 0.82, 0.2, 0.2, 0.1);     // lenses up on forehead
  G.part(hat, S, 0x9fd9f0, -0.3, 0.5, 0.82, 0.2, 0.2, 0.1);
  head.add(hat);
  // heavy yo-yo rig on the right hand (shown during bare-form attacks)
  const yoyo = new THREE.Group();
  const yoyoDisc = G.part(yoyo, C, 0xd94f4f, 0, 0, 0, 0.16, 0.1, 0.16);
  yoyoDisc.rotation.x = Math.PI / 2;
  G.part(yoyo, C, 0xf5f2e3, 0, 0, 0.02, 0.09, 0.12, 0.09).rotation.x = Math.PI / 2;
  const yoyoString = G.part(yoyo, C, 0xf5f2e3, 0, 0, 0, 0.015, 1, 0.015);
  yoyoString.rotation.x = Math.PI / 2;
  yoyo.visible = false;
  yoyo.position.set(0.4, 0.62, 0.05);
  body.add(yoyo);

  const masks = buildMaskGear(head);
  const kits = buildBodyKits(body);
  const claws = [
    G.part(hands[0], S, 0x6d2c1b, 0, 0, 0.5, 2.2, 1.6, 2.6),
    G.part(hands[1], S, 0x6d2c1b, 0, 0, 0.5, 2.2, 1.6, 2.6)
  ];
  claws.forEach(c => c.visible = false);

  scene.add(root);

  const P = {
    mesh: root, body, head, hat, masks, kits, shirtMat, claws,
    yoyo, yoyoString, hands, beltYoyo,
    pos: root.position,
    vy: 0, onGround: true,
    yaw: 0,
    mask: 'none',
    stats: G.MASK_STATS.none,
    small: false, crouch: false, swimming: false, hidden: false,
    stamina: 100, breath: 100,
    hp: 6, maxHp: 6,
    iframes: 0, attackCd: 0, attackAnim: 0,
    dashT: 0, dashVX: 0, dashVZ: 0,
    jumpsUsed: 0, gliding: false, diving: false,
    howlCd: 0,
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
    for (const k in P.kits) P.kits[k].visible = (k === name);
    P.shirtMat.color.set(KIT_TINT[name] || 0xe8a13c);
    P.claws.forEach(c => c.visible = (name === 'scorpion' || name === 'badger'));
    const wasSmall = P.small;
    P.small = !!P.stats.small;
    P._scaleTarget = P.small ? 0.38 : 1;
    if (name === 'none') G.sfx.unmask(); else G.sfx.mask();
    if (P.small && !wasSmall) G.toast('You shrink down... the world towers above!');
    if (!P.small && wasSmall) G.toast('Back to full size.');
    G.ui.refreshHotbar();
    G.ui.showMaskBanner(name);
    if (name !== 'none' && G.quest && G.quest.onMaskWorn) G.quest.onMaskWorn(name);
    return true;
  };
  P._scaleTarget = 1;

  P.hurt = function (n, fromPos) {
    if (P.iframes > 0 || P.dashT > 0) return;
    let def = P.stats.def;
    if (P.stats.block && P.crouch) def = 0.12;         // tortoise shell guard
    if (P.stats.roll && P._rolling) def = Math.min(def, 0.5);
    n = Math.max(0.5, Math.round(n * def * 2) / 2);
    P.iframes = 1.2;
    P.hp -= n;
    G.sfx.hurt();
    G.ui.flashDamage();
    if (fromPos) {
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
  P.howlCd -= dt;

  const cur = P.mesh.scale.x;
  if (Math.abs(cur - P._scaleTarget) > 0.001)
    P.mesh.scale.setScalar(cur + (P._scaleTarget - cur) * Math.min(1, dt * 6));
  const sizeMul = P.small ? 0.55 : 1;

  P.crouch = input.crouch && !P.swimming;

  // --- movement input in camera space ---
  let mx = 0, mz = 0;
  if (input.f) mz -= 1; if (input.b) mz += 1;
  if (input.l) mx -= 1; if (input.r) mx += 1;
  if (input.jx || input.jy) { mx = input.jx; mz = input.jy; } // touch joystick
  let moving = (mx !== 0 || mz !== 0);
  let wx = 0, wz = 0;
  if (moving) {
    const len = Math.hypot(mx, mz);
    if (len > 1) { mx /= len; mz /= len; }
    // camera sits at (+sin, +cos)·dist behind Stuart, so "forward" (W / stick up,
    // mz = -1) must be (-sin, -cos) and "right" is the camera's true right vector
    const sin = Math.sin(camYaw), cos = Math.cos(camYaw);
    wx = mx * cos + mz * sin;
    wz = -mx * sin + mz * cos;
    P._moveDirX = wx; P._moveDirZ = wz; // for the auto-follow camera
  }
  P._moving = moving;

  // --- water ---
  const ground = G.heightAt(P.pos.x, P.pos.z);
  const depth = G.WATER_Y - ground;
  const wasSwimming = P.swimming;
  P.swimming = depth > 0.5 * sizeMul && P.pos.y < G.WATER_Y + 0.4;
  if (P.swimming && !wasSwimming) G.sfx.splash();

  // --- speed ---
  let speed = st.speed * sizeMul;
  const wantSprint = input.sprint && moving && P.stamina > 0 && !P.swimming;
  P._rolling = false;
  if (wantSprint) {
    speed = st.sprint * sizeMul;
    P.stamina -= st.stamDrain * dt;
    if (st.roll) P._rolling = true;                    // armadillo cannonball
  } else P.stamina = Math.min(100, P.stamina + 10 * dt);
  if (P.crouch) speed *= st.block ? 0.05 : 0.42;       // shell guard roots you
  if (P.swimming) speed = st.swim;
  if (P.stamina < 0) P.stamina = 0;
  if (G.buffs && G.buffs.speedMul) speed *= G.buffs.speedMul;

  // --- fox dash ---
  if (P.dashT > 0) {
    P.dashT -= dt;
    P.pos.x += P.dashVX * dt;
    P.pos.z += P.dashVZ * dt;
  }

  // --- horizontal move with slope rules ---
  if (moving && P.dashT <= 0) {
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
      if (!tryMove(wx * step, 0)) tryMove(0, wz * step);
    }
    const want = Math.atan2(wx, wz);
    let d = want - P.body.rotation.y;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    P.body.rotation.y += d * Math.min(1, dt * 12);
    P.walkT += dt * (wantSprint ? 14 : 9);
  }

  // --- vertical ---
  const groundNow = G.heightAt(P.pos.x, P.pos.z);
  P.gliding = false;
  if (P.swimming) {
    const surfY = G.WATER_Y - 0.25 * sizeMul + Math.sin(P.walkT * 0.5 + performance.now() * 0.002) * 0.05;
    P.pos.y += (surfY - P.pos.y) * Math.min(1, dt * 6);
    P.vy = 0; P.onGround = false; P.jumpsUsed = 0;
    let breathMax = st.breath * ((G.buffs && G.buffs.breathMul) || 1);
    if (depth > 1.4) {
      P.breath -= 100 / breathMax * dt;
      if (P.breath <= 0) { P.breath = 0; P._drownT = (P._drownT || 0) + dt; if (P._drownT > 1) { P._drownT = 0; P.hurt(1); } }
    } else P.breath = Math.min(100, P.breath + 25 * dt);
    if (input.jumpEdge) { P.vy = st.jump * 0.55; P.pos.y += 0.2; P.swimming = false; P.onGround = false; }
  } else {
    P.breath = Math.min(100, P.breath + 30 * dt);
    P.vy -= 26 * dt;
    // glide: hold jump while falling (owl / eagle)
    if (st.glide && input.jump && P.vy < 0 && !P.onGround) {
      P.vy = Math.max(P.vy, -2.2 * (1 - st.glide * 0.5));
      P.gliding = true;
      // wind push forward
      const fx = Math.sin(P.body.rotation.y), fz = Math.cos(P.body.rotation.y);
      P.pos.x += fx * st.glide * 7 * dt;
      P.pos.z += fz * st.glide * 7 * dt;
      if (Math.hypot(P.pos.x, P.pos.z) > G.RADIUS) { P.pos.x *= 0.995; P.pos.z *= 0.995; }
    }
    P.pos.y += P.vy * dt;
    if (P.pos.y <= groundNow) {
      P.pos.y = groundNow;
      // eagle dive-bomb impact
      if (P.diving) { P.diving = false; G.diveImpact && G.diveImpact(P); }
      P.vy = 0;
      P.onGround = true;
      P.jumpsUsed = 0;
    } else P.onGround = false;
    if (input.jumpEdge) {
      const maxJumps = st.doubleJump ? 2 : 1;
      if (P.onGround || P.jumpsUsed < maxJumps && !P.onGround && st.doubleJump) {
        if (!P.onGround && P.jumpsUsed === 0) P.jumpsUsed = 1; // fell off a ledge
        P.vy = st.jump * (P.small ? 0.75 : 1) * (P.onGround ? 1 : 0.85);
        P.jumpsUsed++;
        P.onGround = false;
        G.sfx.jump();
      }
    }
  }

  // --- posture & juice ---
  const bounce = (moving && P.onGround) ? Math.abs(Math.sin(P.walkT)) * 0.1 : 0;
  // landing squash / jump stretch
  if (P.onGround && P._wasAir) { P._squash = 0.3; if (G.fx) G.fx.dust(P.pos, 3); }
  P._wasAir = !P.onGround && !P.swimming;
  P._squash = Math.max(0, (P._squash || 0) - dt * 2.2);
  const stretch = (!P.onGround && !P.swimming && Math.abs(P.vy) > 6) ? 0.12 : 0;
  P.body.scale.set(1 + P._squash * 0.5 - stretch * 0.5, 1 - P._squash + stretch, 1 + P._squash * 0.5 - stretch * 0.5);
  P.body.position.y = bounce + (P.crouch ? -0.22 : 0) + (P.swimming ? -0.15 : 0);
  P.body.rotation.x = P.swimming ? 0.9 : (P.crouch ? 0.25 : 0);
  // arms swing with the stride
  if (P.hands) {
    const sw = (moving && P.onGround) ? Math.sin(P.walkT) * 0.16 : 0;
    P.hands[0].position.z = 0.05 + sw;
    P.hands[1].position.z = 0.05 - sw;
    P.hands[0].position.y = 0.62 + (P.gliding ? 0.25 : 0);
    P.hands[1].position.y = 0.62 + (P.gliding ? 0.25 : 0);
  }
  // running kicks up dust
  if (moving && P.onGround && wantSprint) {
    P._dustT = (P._dustT || 0) - dt;
    if (P._dustT <= 0 && G.fx) { P._dustT = 0.14; G.fx.dust(P.pos, 1); }
  }
  // swimming leaves ripples
  if (P.swimming && moving && G.fx) {
    P._ripT = (P._ripT || 0) - dt;
    if (P._ripT <= 0) { P._ripT = 0.4; G.fx.ripple(P.pos); }
  }
  if (P._rolling) P.body.rotation.x = P.walkT * 2 % (Math.PI * 2); // tumble!
  if (P.gliding) P.body.rotation.x = 0.5;
  if (P.attackAnim > 0) {
    P.attackAnim -= dt * 5;
    P.body.rotation.x = -Math.sin(Math.max(0, P.attackAnim) * Math.PI) * 0.5;
  }
  // heavy yo-yo: flies out and snaps back during bare-form attacks
  if (P.yoyo) {
    const out = (st.yoyo && P.attackAnim > 0) ? Math.sin(Math.max(0, P.attackAnim) * Math.PI) : 0;
    P.yoyo.visible = out > 0.02;
    P.beltYoyo.visible = !P.yoyo.visible && P.mask === 'none';
    if (P.yoyo.visible) {
      const dist = out * 2.4;
      P.yoyo.position.set(0.4, 0.62, 0.05 + dist);
      P.yoyoString.position.z = -dist / 2;
      P.yoyoString.scale.y = Math.max(0.01, dist);
      P.yoyo.children[0].rotation.z += dt * 40; // spin!
    }
  }

  // --- wolf howl [V] ---
  if (input.specialEdge && st.howl && P.howlCd <= 0) {
    P.howlCd = 25;
    G.audio.tone(300, 1.2, 'sine', 0.15, 700);
    G.fearPulse(P.pos, 26);
    G.toast('AWOOOO! Everything nearby scatters in terror.');
  }

  // --- attack ---
  if (input.attackEdge && P.attackCd <= 0) {
    P.attackCd = st.atkCd * ((G.buffs && G.buffs.atkCdMul) || 1);
    P.attackAnim = 1;
    G.playerAttack(P, st);
  }
};
