'use strict';
// ---------------------------------------------------------------------------
// Wildmask — animal_builders.js : low-poly chunky builders for all 19 species
// plus the shared villager builder (guests / NPCs / poachers).
// Style rules: spheres, boxes, cones, cylinders only; flat pastel Lambert.
// ---------------------------------------------------------------------------
const B = G.builders = {};
const S_ = () => G.geo.sphere, X_ = () => G.geo.box, C_ = () => G.geo.cyl, K_ = () => G.geo.cone;

function quadLegs(g, color, sx, sz, r, h, y) {
  for (const a of [-sx, sx]) for (const b of [-sz, sz])
    G.part(g, G.geo.cyl, color, a, y || h / 2, b, r, h, r);
}

// ----- originals -----
B.horse = function () {
  const g = new THREE.Group();
  G.part(g, S_(), 0xb07845, 0, 1.05, 0, 0.62, 0.58, 1.0);
  const head = G.part(g, S_(), 0xb07845, 0, 1.7, 0.95, 0.42, 0.42, 0.45);
  G.part(head, X_(), 0x8f5f36, 0, -0.12, 0.75, 0.55, 0.55, 0.8);
  G.part(head, S_(), 0x1c1c1c, 0.3, 0.18, 0.92, 0.1);
  G.part(head, S_(), 0x1c1c1c, -0.3, 0.18, 0.92, 0.1);
  G.part(head, K_(), 0x8f5f36, 0.22, 0.52, -0.1, 0.14, 0.4, 0.14);
  G.part(head, K_(), 0x8f5f36, -0.22, 0.52, -0.1, 0.14, 0.4, 0.14);
  G.part(g, X_(), 0x5c4326, 0, 1.55, 0.3, 0.16, 0.6, 1.1);
  G.part(g, S_(), 0x5c4326, 0, 1.15, -1.05, 0.16, 0.45, 0.16).rotation.x = 0.6;
  quadLegs(g, 0x8f5f36, 0.32, 0.61, 0.13, 0.85, 0.42);
  return g;
};
B.frog = function () {
  const g = new THREE.Group();
  G.part(g, S_(), 0x62b64e, 0, 0.32, 0, 0.42, 0.32, 0.42);
  G.part(g, S_(), 0xd8eec2, 0, 0.22, 0.24, 0.28, 0.2, 0.2);
  const e1 = G.part(g, S_(), 0x62b64e, 0.18, 0.62, 0.12, 0.13);
  const e2 = G.part(g, S_(), 0x62b64e, -0.18, 0.62, 0.12, 0.13);
  G.part(e1, S_(), 0x1c1c1c, 0, 0.25, 0.45, 0.45);
  G.part(e2, S_(), 0x1c1c1c, 0, 0.25, 0.45, 0.45);
  G.part(g, S_(), 0x4c9440, 0.3, 0.14, -0.12, 0.18, 0.12, 0.28);
  G.part(g, S_(), 0x4c9440, -0.3, 0.14, -0.12, 0.18, 0.12, 0.28);
  return g;
};
B.croc = function () {
  const g = new THREE.Group();
  G.part(g, S_(), 0x5d8c46, 0, 0.5, 0, 0.55, 0.4, 1.15);
  const head = G.part(g, S_(), 0x5d8c46, 0, 0.6, 1.2, 0.38, 0.3, 0.45);
  G.part(head, X_(), 0x6f9e55, 0, -0.15, 0.9, 0.75, 0.42, 1.3);
  G.part(head, X_(), 0xf5f2e3, 0, -0.42, 0.9, 0.68, 0.12, 1.2);
  G.part(head, S_(), 0xf7d83b, 0.22, 0.28, 0.25, 0.11);
  G.part(head, S_(), 0xf7d83b, -0.22, 0.28, 0.25, 0.11);
  G.part(g, K_(), 0x527c3e, 0, 0.45, -1.55, 0.32, 1.4, 0.32).rotation.x = -Math.PI / 2;
  for (let i = 0; i < 4; i++) G.part(g, K_(), 0x3f6330, 0, 0.95 - i * 0.06, 0.35 - i * 0.5, 0.13, 0.3, 0.13);
  quadLegs(g, 0x527c3e, 0.5, 0.55, 0.14, 0.4, 0.2);
  return g;
};
B.mouse = function () {
  const g = new THREE.Group();
  G.part(g, S_(), 0xa8a29c, 0, 0.22, 0, 0.24, 0.2, 0.3);
  const head = G.part(g, S_(), 0xa8a29c, 0, 0.32, 0.26, 0.17);
  G.part(head, S_(), 0xf0b9c4, 0, -0.1, 0.85, 0.3);
  G.part(head, S_(), 0x1c1c1c, 0.42, 0.25, 0.85, 0.14);
  G.part(head, S_(), 0x1c1c1c, -0.42, 0.25, 0.85, 0.14);
  G.part(head, S_(), 0xd9a7b2, 0.7, 0.9, -0.2, 0.55, 0.55, 0.2);
  G.part(head, S_(), 0xd9a7b2, -0.7, 0.9, -0.2, 0.55, 0.55, 0.2);
  G.part(g, C_(), 0xd9a7b2, 0, 0.16, -0.42, 0.03, 0.5, 0.03).rotation.x = 1.2;
  return g;
};
B.scorpion = function () {
  const g = new THREE.Group();
  const bodyCol = 0x8c3b26;
  G.part(g, S_(), bodyCol, 0, 0.18, 0, 0.26, 0.16, 0.34);
  G.part(g, S_(), bodyCol, 0, 0.2, 0.3, 0.18, 0.14, 0.18);
  G.part(g, S_(), 0x1c1c1c, 0.07, 0.3, 0.45, 0.05);
  G.part(g, S_(), 0x1c1c1c, -0.07, 0.3, 0.45, 0.05);
  for (const sx of [-0.3, 0.3]) {
    const arm = G.part(g, S_(), 0x6d2c1b, sx, 0.16, 0.42, 0.13, 0.1, 0.2);
    G.part(arm, S_(), 0x6d2c1b, sx > 0 ? 0.4 : -0.4, 0.2, 0.9, 0.9, 0.7, 0.9);
  }
  let ty = 0.3, tz = -0.3;
  for (let i = 0; i < 3; i++) { G.part(g, S_(), bodyCol, 0, ty, tz, 0.1 - i * 0.015); ty += 0.14; tz -= 0.06; }
  G.part(g, K_(), 0x3a1810, 0, ty + 0.08, tz + 0.08, 0.07, 0.2, 0.07).rotation.x = 2.6;
  for (const sx of [-0.28, 0.28]) for (let i = 0; i < 3; i++)
    G.part(g, C_(), 0x6d2c1b, sx, 0.08, -0.15 + i * 0.16, 0.03, 0.18, 0.03);
  return g;
};

// ----- new: tier 1 -----
B.fox = function () {
  const g = new THREE.Group();
  G.part(g, S_(), 0xd97a3c, 0, 0.42, 0, 0.32, 0.3, 0.55);
  const head = G.part(g, S_(), 0xd97a3c, 0, 0.62, 0.52, 0.26);
  G.part(head, K_(), 0xd97a3c, 0, -0.1, 0.85, 0.5, 1.0, 0.5).rotation.x = 1.6;  // snout
  G.part(head, S_(), 0x2c2c2c, 0, -0.1, 1.35, 0.18);                            // nose
  G.part(head, S_(), 0x1c1c1c, 0.42, 0.25, 0.8, 0.13);
  G.part(head, S_(), 0x1c1c1c, -0.42, 0.25, 0.8, 0.13);
  G.part(head, K_(), 0x2c2c2c, 0.55, 0.95, -0.1, 0.3, 0.7, 0.3);                // ears
  G.part(head, K_(), 0x2c2c2c, -0.55, 0.95, -0.1, 0.3, 0.7, 0.3);
  G.part(g, S_(), 0xf2e6d4, 0, 0.3, 0.35, 0.2, 0.18, 0.2);                      // chest
  const tail = G.part(g, S_(), 0xd97a3c, 0, 0.45, -0.62, 0.16, 0.16, 0.42);     // bushy tail
  G.part(tail, S_(), 0xf2e6d4, 0, 0, -0.85, 0.55, 0.55, 0.45);                  // white tip
  quadLegs(g, 0x8c5226, 0.18, 0.3, 0.07, 0.32, 0.16);
  return g;
};
B.rabbit = function () {
  const g = new THREE.Group();
  G.part(g, S_(), 0xcfc4b4, 0, 0.3, 0, 0.26, 0.28, 0.34);
  const head = G.part(g, S_(), 0xcfc4b4, 0, 0.56, 0.28, 0.2);
  G.part(head, S_(), 0x1c1c1c, 0.4, 0.2, 0.8, 0.14);
  G.part(head, S_(), 0x1c1c1c, -0.4, 0.2, 0.8, 0.14);
  G.part(head, S_(), 0xf0b9c4, 0, -0.15, 0.95, 0.2);
  G.part(head, S_(), 0xcfc4b4, 0.35, 1.15, -0.15, 0.3, 0.95, 0.22);  // long ears
  G.part(head, S_(), 0xcfc4b4, -0.35, 1.15, -0.15, 0.3, 0.95, 0.22);
  G.part(g, S_(), 0xf5efe3, 0, 0.28, -0.36, 0.14);                    // puff tail
  G.part(g, S_(), 0xb8ab98, 0.16, 0.1, 0.14, 0.1, 0.08, 0.16);
  G.part(g, S_(), 0xb8ab98, -0.16, 0.1, 0.14, 0.1, 0.08, 0.16);
  return g;
};
B.deer = function () {
  const g = new THREE.Group();
  G.part(g, S_(), 0xb08a5c, 0, 0.95, 0, 0.45, 0.45, 0.75);
  const head = G.part(g, S_(), 0xb08a5c, 0, 1.55, 0.72, 0.3, 0.32, 0.34);
  G.part(head, X_(), 0x8f6b42, 0, -0.15, 0.8, 0.5, 0.45, 0.7);
  G.part(head, S_(), 0x1c1c1c, 0.35, 0.25, 0.8, 0.12);
  G.part(head, S_(), 0x1c1c1c, -0.35, 0.25, 0.8, 0.12);
  // antlers: stacked thin cylinders
  for (const sx of [-0.35, 0.35]) {
    const a = G.part(head, C_(), 0xe6d4b8, sx, 0.85, -0.1, 0.09, 1.0, 0.09);
    a.rotation.z = sx > 0 ? -0.4 : 0.4;
    G.part(head, C_(), 0xe6d4b8, sx * 1.9, 1.3, -0.1, 0.07, 0.6, 0.07).rotation.z = sx > 0 ? 0.5 : -0.5;
  }
  G.part(g, S_(), 0xf5efe3, 0, 1.0, -0.75, 0.12, 0.2, 0.12); // tail
  quadLegs(g, 0x8f6b42, 0.26, 0.45, 0.09, 0.9, 0.45);
  return g;
};

// ----- new: tier 2 -----
B.tortoise = function () {
  const g = new THREE.Group();
  G.part(g, S_(), 0x6b8f4e, 0, 0.42, 0, 0.55, 0.4, 0.6);                       // shell
  G.part(g, S_(), 0x54713d, 0, 0.62, 0, 0.4, 0.28, 0.44);                      // shell top
  G.part(g, S_(), 0xa8b06a, 0, 0.28, 0.62, 0.18, 0.15, 0.22);                  // head
  G.part(g, S_(), 0x1c1c1c, 0.08, 0.34, 0.78, 0.05);
  G.part(g, S_(), 0x1c1c1c, -0.08, 0.34, 0.78, 0.05);
  quadLegs(g, 0xa8b06a, 0.42, 0.4, 0.1, 0.25, 0.12);
  return g;
};
B.otter = function () {
  const g = new THREE.Group();
  G.part(g, S_(), 0x7a5a3c, 0, 0.32, 0, 0.24, 0.24, 0.55);
  const head = G.part(g, S_(), 0x7a5a3c, 0, 0.5, 0.5, 0.2);
  G.part(head, S_(), 0xc9b499, 0, -0.2, 0.7, 0.55, 0.45, 0.5);                 // muzzle
  G.part(head, S_(), 0x2c2c2c, 0, -0.1, 1.1, 0.16);
  G.part(head, S_(), 0x1c1c1c, 0.4, 0.25, 0.75, 0.13);
  G.part(head, S_(), 0x1c1c1c, -0.4, 0.25, 0.75, 0.13);
  G.part(head, S_(), 0x6b4e33, 0.6, 0.6, -0.1, 0.25, 0.25, 0.15);
  G.part(head, S_(), 0x6b4e33, -0.6, 0.6, -0.1, 0.25, 0.25, 0.15);
  G.part(g, K_(), 0x6b4e33, 0, 0.25, -0.75, 0.14, 0.7, 0.14).rotation.x = -1.65; // tail
  return g;
};
B.cobra = function () {
  const g = new THREE.Group();
  // coiled body
  G.part(g, S_(), 0x8fa04c, 0, 0.16, 0, 0.4, 0.14, 0.4);
  G.part(g, S_(), 0x7d8c40, 0, 0.32, 0.05, 0.3, 0.12, 0.3);
  // raised neck + hood
  G.part(g, C_(), 0x8fa04c, 0, 0.62, 0.15, 0.11, 0.6, 0.11);
  const hood = G.part(g, S_(), 0x8fa04c, 0, 1.0, 0.15, 0.3, 0.36, 0.14);
  G.part(hood, S_(), 0xdec468, 0, 0, 0.5, 0.6, 0.6, 0.4);                       // hood front
  G.part(hood, S_(), 0x1c1c1c, 0.35, 0.3, 0.7, 0.14);
  G.part(hood, S_(), 0x1c1c1c, -0.35, 0.3, 0.7, 0.14);
  G.part(hood, C_(), 0xd94f4f, 0, -0.45, 0.75, 0.05, 0.4, 0.02).rotation.x = 0.6; // tongue
  return g;
};
B.monkey = function () {
  const g = new THREE.Group();
  G.part(g, S_(), 0x8a6a48, 0, 0.5, 0, 0.28, 0.32, 0.26);
  const head = G.part(g, S_(), 0x8a6a48, 0, 0.95, 0.05, 0.24);
  G.part(head, S_(), 0xd9bc9a, 0, -0.1, 0.6, 0.62, 0.5, 0.5);                   // face
  G.part(head, S_(), 0x1c1c1c, 0.3, 0.15, 0.85, 0.12);
  G.part(head, S_(), 0x1c1c1c, -0.3, 0.15, 0.85, 0.12);
  G.part(head, S_(), 0xd9bc9a, 0.85, 0.1, 0, 0.35, 0.35, 0.15);                 // ears
  G.part(head, S_(), 0xd9bc9a, -0.85, 0.1, 0, 0.35, 0.35, 0.15);
  G.part(g, C_(), 0x8a6a48, 0.3, 0.32, 0, 0.06, 0.5, 0.06).rotation.z = 0.5;    // arms
  G.part(g, C_(), 0x8a6a48, -0.3, 0.32, 0, 0.06, 0.5, 0.06).rotation.z = -0.5;
  const tail = G.part(g, C_(), 0x8a6a48, 0, 0.55, -0.35, 0.05, 0.8, 0.05);
  tail.rotation.x = 1.0;
  G.part(g, S_(), 0xd9a45b, 0.35, 0.55, 0.2, 0.1);                              // held fruit!
  return g;
};
B.goat = function () {
  const g = new THREE.Group();
  G.part(g, S_(), 0xd8d2c8, 0, 0.85, 0, 0.45, 0.42, 0.7);
  const head = G.part(g, S_(), 0xd8d2c8, 0, 1.3, 0.62, 0.28, 0.3, 0.32);
  G.part(head, X_(), 0xbab2a4, 0, -0.2, 0.7, 0.55, 0.5, 0.6);
  G.part(head, S_(), 0x1c1c1c, 0.38, 0.2, 0.75, 0.12);
  G.part(head, S_(), 0x1c1c1c, -0.38, 0.2, 0.75, 0.12);
  for (const sx of [-0.35, 0.35]) {                                              // curved horns
    G.part(head, C_(), 0x8f8474, sx, 0.75, -0.2, 0.1, 0.55, 0.08).rotation.x = -0.7;
    G.part(head, C_(), 0x8f8474, sx, 1.05, -0.55, 0.07, 0.45, 0.06).rotation.x = -1.6;
  }
  G.part(head, S_(), 0xf5efe3, 0, -0.55, 0.4, 0.18, 0.3, 0.14);                 // beard
  quadLegs(g, 0xbab2a4, 0.26, 0.42, 0.09, 0.8, 0.4);
  return g;
};
B.armadillo = function () {
  const g = new THREE.Group();
  // banded shell: overlapping squashed spheres
  for (let i = 0; i < 4; i++)
    G.part(g, S_(), i % 2 ? 0xb0988a : 0xa08878, 0, 0.36, 0.28 - i * 0.2, 0.34 - Math.abs(1.5 - i) * 0.03, 0.3, 0.16);
  const head = G.part(g, S_(), 0xc4aa96, 0, 0.32, 0.55, 0.17, 0.15, 0.24);
  G.part(head, S_(), 0x1c1c1c, 0.35, 0.3, 0.6, 0.12);
  G.part(head, S_(), 0x1c1c1c, -0.35, 0.3, 0.6, 0.12);
  G.part(head, S_(), 0xd9a7b2, 0.5, 0.85, -0.3, 0.3, 0.45, 0.14);
  G.part(head, S_(), 0xd9a7b2, -0.5, 0.85, -0.3, 0.3, 0.45, 0.14);
  G.part(g, K_(), 0xb0988a, 0, 0.25, -0.62, 0.1, 0.55, 0.1).rotation.x = -1.8;   // tail
  quadLegs(g, 0x8f7a68, 0.2, 0.28, 0.07, 0.24, 0.12);
  return g;
};
B.owl = function () {
  const g = new THREE.Group();
  G.part(g, S_(), 0x8a6f52, 0, 0.5, 0, 0.34, 0.45, 0.3);                        // body
  G.part(g, S_(), 0xd9c4a4, 0, 0.42, 0.2, 0.24, 0.3, 0.16);                     // belly
  const head = G.part(g, S_(), 0x8a6f52, 0, 0.95, 0.02, 0.3, 0.26, 0.28);
  G.part(head, S_(), 0xf7d83b, 0.35, 0.15, 0.75, 0.24);                         // big eyes
  G.part(head, S_(), 0xf7d83b, -0.35, 0.15, 0.75, 0.24);
  G.part(head, S_(), 0x1c1c1c, 0.35, 0.15, 0.95, 0.11);
  G.part(head, S_(), 0x1c1c1c, -0.35, 0.15, 0.95, 0.11);
  G.part(head, K_(), 0xdea842, 0, -0.1, 0.85, 0.16, 0.35, 0.16).rotation.x = 1.9; // beak
  G.part(head, K_(), 0x6b5540, 0.5, 0.85, 0, 0.22, 0.5, 0.22);                  // ear tufts
  G.part(head, K_(), 0x6b5540, -0.5, 0.85, 0, 0.22, 0.5, 0.22);
  G.part(g, S_(), 0x6b5540, 0.36, 0.5, -0.05, 0.1, 0.35, 0.2);                  // wings
  G.part(g, S_(), 0x6b5540, -0.36, 0.5, -0.05, 0.1, 0.35, 0.2);
  return g;
};

// ----- new: tier 3 -----
B.wolf = function () {
  const g = new THREE.Group();
  G.part(g, S_(), 0x6f7278, 0, 0.62, 0, 0.4, 0.38, 0.72);
  const head = G.part(g, S_(), 0x6f7278, 0, 0.95, 0.68, 0.3);
  G.part(head, K_(), 0x5a5d63, 0, -0.1, 0.8, 0.55, 1.0, 0.55).rotation.x = 1.6;
  G.part(head, S_(), 0x2c2c2c, 0, -0.1, 1.3, 0.18);
  G.part(head, S_(), 0xf7d83b, 0.4, 0.25, 0.75, 0.12);                          // yellow eyes
  G.part(head, S_(), 0xf7d83b, -0.4, 0.25, 0.75, 0.12);
  G.part(head, K_(), 0x5a5d63, 0.5, 0.9, -0.1, 0.28, 0.6, 0.28);
  G.part(head, K_(), 0x5a5d63, -0.5, 0.9, -0.1, 0.28, 0.6, 0.28);
  G.part(g, S_(), 0xc9ccd1, 0, 0.45, 0.45, 0.24, 0.22, 0.24);                   // chest
  G.part(g, S_(), 0x5a5d63, 0, 0.68, -0.82, 0.14, 0.16, 0.42).rotation.x = 0.5; // tail
  quadLegs(g, 0x5a5d63, 0.24, 0.45, 0.09, 0.6, 0.3);
  return g;
};
B.eagle = function () {
  const g = new THREE.Group();
  G.part(g, S_(), 0x6b4e33, 0, 0.55, 0, 0.32, 0.4, 0.5);                        // body
  const head = G.part(g, S_(), 0xf5f2e3, 0, 1.0, 0.3, 0.24);                    // white head
  G.part(head, S_(), 0x1c1c1c, 0.4, 0.2, 0.75, 0.13);
  G.part(head, S_(), 0x1c1c1c, -0.4, 0.2, 0.75, 0.13);
  G.part(head, K_(), 0xdea842, 0, -0.05, 0.9, 0.2, 0.5, 0.2).rotation.x = 1.8;  // hooked beak
  // spread wings: flattened spheres
  G.part(g, S_(), 0x5a4128, 0.75, 0.7, -0.05, 0.7, 0.08, 0.35).rotation.z = 0.25;
  G.part(g, S_(), 0x5a4128, -0.75, 0.7, -0.05, 0.7, 0.08, 0.35).rotation.z = -0.25;
  G.part(g, S_(), 0xf5f2e3, 0, 0.45, -0.6, 0.2, 0.08, 0.35);                    // tail feathers
  G.part(g, C_(), 0xdea842, 0.12, 0.15, 0.1, 0.05, 0.3, 0.05);
  G.part(g, C_(), 0xdea842, -0.12, 0.15, 0.1, 0.05, 0.3, 0.05);
  return g;
};
B.bear = function () {
  const g = new THREE.Group();
  G.part(g, S_(), 0x6f4e33, 0, 1.0, 0, 0.75, 0.72, 1.0);                        // big body
  const head = G.part(g, S_(), 0x6f4e33, 0, 1.75, 0.75, 0.45);
  G.part(head, S_(), 0xa8825c, 0, -0.15, 0.7, 0.5, 0.4, 0.45);                  // muzzle
  G.part(head, S_(), 0x2c2c2c, 0, -0.1, 1.05, 0.16);
  G.part(head, S_(), 0x1c1c1c, 0.35, 0.2, 0.8, 0.11);
  G.part(head, S_(), 0x1c1c1c, -0.35, 0.2, 0.8, 0.11);
  G.part(head, S_(), 0x5a3e28, 0.6, 0.75, 0, 0.3, 0.3, 0.15);                   // round ears
  G.part(head, S_(), 0x5a3e28, -0.6, 0.75, 0, 0.3, 0.3, 0.15);
  quadLegs(g, 0x5a3e28, 0.45, 0.55, 0.2, 0.7, 0.35);
  G.part(g, S_(), 0x5a3e28, 0, 1.0, -1.0, 0.15);                                // stub tail
  return g;
};
B.badger = function () {
  const g = new THREE.Group();
  G.part(g, S_(), 0x3d3d40, 0, 0.42, 0, 0.36, 0.32, 0.6);                       // dark body
  G.part(g, S_(), 0xd8d2c8, 0, 0.62, 0, 0.3, 0.18, 0.55);                       // white back stripe
  const head = G.part(g, S_(), 0x3d3d40, 0, 0.55, 0.58, 0.24, 0.22, 0.28);
  G.part(head, S_(), 0xd8d2c8, 0, 0.55, 0.3, 0.5, 0.5, 0.7);                    // white crown stripe
  G.part(head, S_(), 0x1c1c1c, 0.4, 0.15, 0.8, 0.13);
  G.part(head, S_(), 0x1c1c1c, -0.4, 0.15, 0.8, 0.13);
  G.part(head, S_(), 0x2c2c2c, 0, -0.15, 0.95, 0.16);                           // nose
  G.part(head, S_(), 0x5a5a5e, 0.55, 0.6, -0.1, 0.2, 0.2, 0.12);
  G.part(head, S_(), 0x5a5a5e, -0.55, 0.6, -0.1, 0.2, 0.2, 0.12);
  // little claws forward
  G.part(g, S_(), 0xd8d2c8, 0.22, 0.14, 0.42, 0.1, 0.06, 0.16);
  G.part(g, S_(), 0xd8d2c8, -0.22, 0.14, 0.42, 0.1, 0.06, 0.16);
  quadLegs(g, 0x2c2c30, 0.2, 0.32, 0.08, 0.26, 0.13);
  return g;
};

// ----- lake dwellers -----
B.duck = function () {
  const g = new THREE.Group();
  G.part(g, S_(), 0x8a6a48, 0, 0.3, 0, 0.32, 0.24, 0.42);                       // body
  G.part(g, S_(), 0xd9c4a4, 0, 0.26, 0.16, 0.24, 0.16, 0.26);                   // breast
  const head = G.part(g, S_(), 0x2c7a4a, 0, 0.62, 0.32, 0.18);                  // mallard-green head
  G.part(head, S_(), 0x1c1c1c, 0.42, 0.2, 0.8, 0.14);
  G.part(head, S_(), 0x1c1c1c, -0.42, 0.2, 0.8, 0.14);
  G.part(head, X_(), 0xf2b035, 0, -0.15, 0.95, 0.7, 0.25, 0.8);                 // bill
  G.part(g, S_(), 0x6b4e33, 0.28, 0.35, -0.05, 0.1, 0.16, 0.28);                // wings
  G.part(g, S_(), 0x6b4e33, -0.28, 0.35, -0.05, 0.1, 0.16, 0.28);
  G.part(g, K_(), 0x8a6a48, 0, 0.36, -0.42, 0.12, 0.3, 0.08).rotation.x = -2.2; // tail-up
  return g;
};
B.koi = function () {
  const g = new THREE.Group();
  G.part(g, S_(), 0xe8863c, 0, 0.3, 0, 0.24, 0.3, 0.55);                        // body
  G.part(g, S_(), 0xf5f2e3, 0, 0.32, 0.15, 0.22, 0.26, 0.3);                    // white patch
  G.part(g, S_(), 0x1c1c1c, 0.3, 0.4, 0.75, 0.12);
  G.part(g, S_(), 0x1c1c1c, -0.3, 0.4, 0.75, 0.12);
  const tail = G.part(g, K_(), 0xe8863c, 0, 0.3, -0.65, 0.3, 0.5, 0.06);        // tail fin
  tail.rotation.x = Math.PI / 2;
  G.part(g, K_(), 0xd97a3c, 0, 0.62, -0.1, 0.2, 0.35, 0.05);                    // dorsal fin
  G.part(g, S_(), 0xd97a3c, 0.26, 0.22, 0.1, 0.06, 0.14, 0.2);                  // side fins
  G.part(g, S_(), 0xd97a3c, -0.26, 0.22, 0.1, 0.06, 0.14, 0.2);
  return g;
};
B.beaver = function () {
  const g = new THREE.Group();
  G.part(g, S_(), 0x6b4a2c, 0, 0.42, 0, 0.4, 0.36, 0.5);                        // chunky body
  const head = G.part(g, S_(), 0x6b4a2c, 0, 0.68, 0.42, 0.26);
  G.part(head, S_(), 0x8a6239, 0, -0.15, 0.7, 0.5, 0.4, 0.4);                   // muzzle
  G.part(head, X_(), 0xf5f2e3, 0, -0.35, 0.85, 0.28, 0.3, 0.1);                 // buck teeth!
  G.part(head, S_(), 0x1c1c1c, 0.38, 0.2, 0.78, 0.12);
  G.part(head, S_(), 0x1c1c1c, -0.38, 0.2, 0.78, 0.12);
  G.part(head, S_(), 0x543a22, 0.6, 0.65, -0.05, 0.2, 0.2, 0.12);               // ears
  G.part(head, S_(), 0x543a22, -0.6, 0.65, -0.05, 0.2, 0.2, 0.12);
  const tail = G.part(g, X_(), 0x3d3d40, 0, 0.25, -0.62, 0.4, 0.08, 0.55);      // flat tail
  tail.rotation.x = 0.25;
  quadLegs(g, 0x543a22, 0.24, 0.3, 0.09, 0.28, 0.14);
  return g;
};

// ----- shared villager builder (guests / NPCs / poachers) -----
// opts: {shirt, skin, hat:'cap'|'safari'|'ranger'|'chef'|'flower'|'goggles'|null,
//        hatCol, rifle, net, apron, hair}
G.buildVillager = function (opts) {
  opts = opts || {};
  const S = G.geo.sphere, X = G.geo.box, C = G.geo.cyl;
  const g = new THREE.Group();
  const shirt = opts.shirt || 0xf2d38f, skin = opts.skin || 0xffd9a6;
  G.part(g, S, shirt, 0, 0.55, 0, 0.32, 0.4, 0.26);
  const head = G.part(g, S, skin, 0, 1.15, 0, 0.3);
  G.part(head, S, 0x1c1c1c, 0.35, 0.1, 0.92, 0.13);
  G.part(head, S, 0x1c1c1c, -0.35, 0.1, 0.92, 0.13);
  if (opts.hair) G.part(head, S, opts.hair, 0, 0.45, -0.15, 0.95, 0.6, 0.95);
  const hatCol = opts.hatCol || shirt;
  if (opts.hat === 'cap') G.part(head, S, hatCol, 0, 0.75, 0, 0.85, 0.5, 0.85);
  else if (opts.hat === 'safari') {
    G.part(head, C, hatCol, 0, 0.6, 0, 1.5, 0.2, 1.5);
    G.part(head, S, hatCol, 0, 0.8, 0, 0.9, 0.6, 0.9);
  } else if (opts.hat === 'ranger') {
    G.part(head, C, hatCol, 0, 0.62, 0, 1.35, 0.18, 1.35);
    G.part(head, X, hatCol, 0, 0.9, 0, 1.1, 0.55, 1.1);
  } else if (opts.hat === 'chef') {
    G.part(head, C, 0xffffff, 0, 0.85, 0, 0.8, 0.9, 0.8);
    G.part(head, S, 0xffffff, 0, 1.3, 0, 0.95, 0.5, 0.95);
  } else if (opts.hat === 'flower') {
    G.part(head, C, 0xe8d9a4, 0, 0.6, 0, 1.5, 0.2, 1.5);
    G.part(head, S, 0xf27ba0, 0.6, 0.72, 0.4, 0.25, 0.2, 0.25);
  } else if (opts.hat === 'goggles') {
    G.part(head, C, 0x4a4a4a, 0, 0.4, 0.55, 0.9, 0.3, 0.5);
    G.part(head, S, 0x9fd9f0, 0.35, 0.42, 0.85, 0.22, 0.22, 0.12);
    G.part(head, S, 0x9fd9f0, -0.35, 0.42, 0.85, 0.22, 0.22, 0.12);
  }
  if (opts.apron) G.part(g, X, opts.apron, 0, 0.5, 0.24, 0.5, 0.6, 0.1);
  if (opts.mustache) G.part(head, X, 0x4a3828, 0, -0.12, 0.92, 0.5, 0.12, 0.1);
  const hands = [
    G.part(g, S, skin, 0.4, 0.55, 0.05, 0.11),
    G.part(g, S, skin, -0.4, 0.55, 0.05, 0.11)
  ];
  if (opts.rifle) {
    const r = new THREE.Group();
    G.part(r, X, 0x4a3a28, 0, 0, 0, 0.09, 0.14, 0.75);   // stock+body
    G.part(r, C, 0x3a3a3d, 0, 0.02, 0.55, 0.035, 0.55, 0.035).rotation.x = Math.PI / 2;
    r.position.set(0.42, 0.62, 0.3);
    r.rotation.y = -0.3;
    g.add(r);
    g.userData.rifle = r;
  }
  if (opts.net) {
    const n = new THREE.Group();
    G.part(n, C, 0x8a6239, 0, 0.35, 0, 0.04, 0.9, 0.04);
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.04, 6, 10), G.mat(0x6b4c2c));
    hoop.position.y = 0.9; hoop.rotation.x = Math.PI / 2;
    n.add(hoop);
    n.position.set(0.45, 0.5, 0.1);
    n.rotation.z = -0.4;
    g.add(n);
  }
  G.part(g, S, 0x4a3828, 0.12, 0.08, 0, 0.11, 0.08, 0.14);
  G.part(g, S, 0x4a3828, -0.12, 0.08, 0, 0.11, 0.08, 0.14);
  g.userData.head = head;
  g.userData.hands = hands;
  return g;
};

G.buildAnimalMesh = function (key, scale) {
  const m = B[key]();
  m.scale.setScalar(scale);
  return m;
};
