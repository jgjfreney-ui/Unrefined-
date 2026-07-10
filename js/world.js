'use strict';
// ---------------------------------------------------------------------------
// Wildmask — world.js : procedural island, biomes, camp hub, props, obstacles
// biomes: plains, forest, desert (mesas), swamp (pools), rock (terraces), ocean
// ---------------------------------------------------------------------------
G.WATER_Y = 0;
G.MAP = 520;          // terrain plane size
G.RADIUS = 245;       // hard travel limit
G.tentPos = new THREE.Vector3(0, 0, 0);

// -------- terrain sampling (analytic, shared by render + gameplay) --------
// The island is SECTORED: camp sits in a central plains ring, and each biome
// is a region you must journey to — forest to the north, desert to the south,
// swamp to the west, wild plains east. Rocky border ridges divide the sectors;
// cross them at mountain passes, hop them as the frog/goat/scorpion, or swim
// around the coast where the ridges sink into the sea.
const wrapA = a => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; };
G.sample = function (x, z) {
  const s = G.seed;
  const raw = (G.fbm(x * 0.013, z * 0.013, 4, s) - 0.35) * 16;
  const r = Math.hypot(x, z);

  // --- warped angular sectors ---
  const warp = (G.fbm(x * 0.005 + 77, z * 0.005 - 77, 3, s + 400) - 0.5) * 1.1;
  const wa = wrapA(Math.atan2(z, x) + warp);
  const gate = G.smoothstep(36, 56, r);                            // hub ring stays gentle plains
  const HALF = Math.PI / 4;
  const sect = c => {
    const d = Math.abs(wrapA(wa - c));
    return (1 - G.smoothstep(HALF - 0.22, HALF + 0.22, d)) * gate;
  };
  let fF = sect(Math.PI / 2);                                      // forest — north
  let dF = sect(-Math.PI / 2);                                     // desert — south
  let sF = sect(Math.PI);                                          // swamp — west
  const tot = fF + dF + sF;
  if (tot > 1) { fF /= tot; dF /= tot; sF /= tot; }

  // --- per-biome height targets ---
  let hd = raw * 0.45 + 2.4;
  const mm = G.fbm(x * 0.02 - 50, z * 0.02 + 50, 2, s + 300);
  if (mm > 0.545) hd += G.smoothstep(0.545, 0.565, mm) * 9;        // mesas (bigger now, climb-only)
  const hs = raw * 0.35 - 1.1;                                     // deeper murky pools
  const hf = raw * 0.7 + 1.2;                                      // gentle forest floor
  let h = raw * (1 - dF - sF - fF) + hd * dF + hs * sF + hf * fF;

  // --- rocky border ridges with mountain passes ---
  let ridge = 0;
  if (r > 40) {
    let bd = Math.PI;
    for (const b of [HALF, 3 * HALF, -HALF, -3 * HALF])
      bd = Math.min(bd, Math.abs(wrapA(wa - b)));
    const bdArc = bd * Math.max(r, 30);                            // metres from the boundary line
    const rg = G.smoothstep(48, 62, r) * (1 - G.smoothstep(180, 200, r));
    const pass = G.smoothstep(0.56, 0.63, G.fbm(x * 0.025 + 900, z * 0.025, 2, s + 800));
    ridge = (1 - G.smoothstep(3, 7.5, bdArc)) * rg * (1 - pass) * 7.5;
    ridge *= G.smoothstep(0.3, 1.2, h);                            // ridges sink at the coast — swim around!
    h += ridge;
  }

  // --- biome label ---
  let biome = 'plains';
  const mx = Math.max(fF, dF, sF);
  if (mx > 0.5) biome = (mx === fF) ? 'forest' : (mx === dF ? 'desert' : 'swamp');
  if (ridge > 2.5) biome = 'rock';
  else if (biome === 'plains' && mx < 0.02 && h > 5.0) {
    biome = 'rock';
    h = 5.0 + Math.floor((h - 5.0) / 2.0) * 2.0;                   // terraces (frog hops)
  }
  // flatten the camp hub
  const f = 1 - G.smoothstep(26, 48, r);
  if (f > 0) { h = h * (1 - f) + 1.6 * f; if (f > 0.55) biome = 'plains'; }
  // island falls into the ocean
  if (r > 210) h -= (r - 210) * 0.18;
  return { h: h, biome: biome };
};
G.heightAt = (x, z) => G.sample(x, z).h;
G.deepWater = function (x, z) { return G.WATER_Y - G.heightAt(x, z) > 1.4; };

// -------- terrain mesh with vertex colors --------
const BIOME_COL = {
  plains: new THREE.Color(0x7cc95e),
  forest: new THREE.Color(0x549e48),
  desert: new THREE.Color(0xecd489),
  swamp:  new THREE.Color(0x7a9150),
  rock:   new THREE.Color(0xa8a29a)
};
const SAND = new THREE.Color(0xe9d79b), MUD = new THREE.Color(0x8a7a52),
      DEEPSAND = new THREE.Color(0xc0a96e);

function terrainColor(x, z, h, biome, out) {
  out.copy(BIOME_COL[biome]);
  if (biome === 'rock') {
    const step = Math.floor((h - 5.0) / 2.0);
    if (step % 2 === 0) out.offsetHSL(0, 0, 0.04);
    if (h < 5.5) out.lerp(BIOME_COL.plains, 0.4);
  }
  if (biome === 'swamp' && h < 0.5) out.lerp(MUD, 0.5);
  if (h < 0.55 && biome !== 'swamp') out.lerp(SAND, 1 - G.smoothstep(0.1, 0.55, h)); // beaches
  if (h < -1.5) out.lerp(DEEPSAND, 0.6);
  const j = G.vnoise(x * 0.31, z * 0.31, G.seed + 5) - 0.5;
  out.offsetHSL(0, 0, j * 0.06);
}

G.buildTerrain = function (scene) {
  const seg = 256;
  const geo = new THREE.PlaneGeometry(G.MAP, G.MAP, seg, seg);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const smp = G.sample(x, z);
    pos.setY(i, smp.h);
    terrainColor(x, z, smp.h, smp.biome, c);
    colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const mat = G.curve(new THREE.MeshLambertMaterial({ vertexColors: true }));
  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  scene.add(mesh);

  const wgeo = new THREE.CircleGeometry(G.MAP * 0.72, 48);
  wgeo.rotateX(-Math.PI / 2);
  const wmat = G.curve(new THREE.MeshLambertMaterial({
    color: 0x4db3d4, transparent: true, opacity: 0.72
  }));
  G.water = new THREE.Mesh(wgeo, wmat);
  G.water.position.y = G.WATER_Y;
  scene.add(G.water);
};

// -------- prop registries --------
G.boulders = [];   // breakable: {mesh, x, z, hp}
G.burrows = [];    // mouse-holes: {x, z, mesh}
G.coins = [];      // pickups: {mesh, x, z, y, t}
G.bushes = [];     // stealth spots: {x, z, r}
G.plantNodes = []; // gatherables: {mesh, x, z, type, taken}
G.drops = [];      // ingredient/gear pickups: {mesh, x, z, kind, species, t}

// -------- collectible plants (for Cheryl) --------
G.PLANTS = {
  bloom:  { name: 'Meadow Bloom',    emoji: '🌼', color: 0xffd94d, biome: 'plains' },
  fern:   { name: 'Moon Fern',       emoji: '🌿', color: 0x4fd18a, biome: 'forest' },
  cactusflower: { name: 'Prickle Blossom', emoji: '🌵', color: 0xf27ba0, biome: 'desert' },
  reed:   { name: 'Marsh Reed',      emoji: '🎋', color: 0x9bc06a, biome: 'swamp' },
  moss:   { name: 'Crag Moss',       emoji: '🍀', color: 0x6fae5a, biome: 'rock' },
  lily:   { name: 'Pond Lily',       emoji: '🌸', color: 0xf2a9c4, biome: 'shore' }
};

function rngPoint(rand) {
  const a = rand() * Math.PI * 2, r = 30 + rand() * 190;
  return { x: Math.cos(a) * r, z: Math.sin(a) * r };
}

G.buildProps = function (scene) {
  const rand = G.mulberry(G.seed + 42);
  const dummy = new THREE.Object3D();

  // --- gather scatter spots ---
  const treeSpots = [], forestTreeSpots = [], cactusSpots = [], swampSpots = [],
        tuftSpots = [], bushSpots = [];
  for (let i = 0; i < 9000; i++) {
    const p = rngPoint(rand), smp = G.sample(p.x, p.z);
    if (smp.h < 0.5 || Math.hypot(p.x, p.z) < 30) continue;
    if (smp.biome === 'plains') {
      if (treeSpots.length < 220 && rand() < 0.15) treeSpots.push({ p, h: smp.h, s: 0.8 + rand() * 0.7 });
      else if (bushSpots.length < 160 && rand() < 0.06) bushSpots.push({ p, h: smp.h, s: 0.8 + rand() * 0.5 });
      else if (tuftSpots.length < 650) tuftSpots.push({ p, h: smp.h, s: 0.6 + rand() * 0.8 });
    } else if (smp.biome === 'forest') {
      if (forestTreeSpots.length < 420 && rand() < 0.5) forestTreeSpots.push({ p, h: smp.h, s: 0.9 + rand() * 0.9 });
      else if (bushSpots.length < 160 && rand() < 0.35) bushSpots.push({ p, h: smp.h, s: 0.9 + rand() * 0.6 });
    } else if (smp.biome === 'desert' && cactusSpots.length < 110 && rand() < 0.3) {
      cactusSpots.push({ p, h: smp.h, s: 0.7 + rand() * 0.8 });
    } else if (smp.biome === 'swamp' && smp.h > 0.2 && swampSpots.length < 100 && rand() < 0.3) {
      swampSpots.push({ p, h: smp.h, s: 0.8 + rand() * 0.6 });
    }
  }
  // instanced scatter with optional wind sway + per-instance color variation
  const jitCol = new THREE.Color();
  function instanced(geoFn, colorHex, spots, place, opts) {
    if (!spots.length) return;
    opts = opts || {};
    const g = geoFn();
    const m = new THREE.InstancedMesh(g,
      G.mat(colorHex, { key: 'inst' + colorHex + g.uuid, wind: opts.wind || 0 }), spots.length);
    m.castShadow = true;
    spots.forEach((sp, i) => {
      place(sp, dummy); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix);
      if (opts.jitter) {
        jitCol.setRGB(1, 1, 1).offsetHSL((rand() - 0.5) * 0.03, 0, (rand() - 0.5) * opts.jitter);
        m.setColorAt(i, jitCol);
      }
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    scene.add(m);
  }
  // plains trees: trunk + layered two-blob canopy
  instanced(() => new THREE.CylinderGeometry(0.28, 0.4, 2.4, 7), 0x8a6239, treeSpots, (sp, d) => {
    d.position.set(sp.p.x, sp.h + 1.1, sp.p.z); d.scale.setScalar(sp.s); d.rotation.set(0, sp.s * 9, 0);
  });
  instanced(() => new THREE.SphereGeometry(1.7, 9, 7), 0x58ab4a, treeSpots, (sp, d) => {
    d.position.set(sp.p.x, sp.h + 2.4 + sp.s, sp.p.z); d.scale.set(sp.s * 1.15, sp.s, sp.s * 1.15); d.rotation.set(0, 0, 0);
  }, { wind: 0.06, jitter: 0.16 });
  instanced(() => new THREE.SphereGeometry(1.0, 8, 6), 0x6cbf58, treeSpots, (sp, d) => {
    d.position.set(sp.p.x + sp.s * 0.7, sp.h + 3.1 + sp.s, sp.p.z + sp.s * 0.3);
    d.scale.setScalar(sp.s * 0.8); d.rotation.set(0, 0, 0);
  }, { wind: 0.09, jitter: 0.16 });
  // forest trees: taller, darker, layered
  instanced(() => new THREE.CylinderGeometry(0.3, 0.45, 3.4, 7), 0x6f4e2c, forestTreeSpots, (sp, d) => {
    d.position.set(sp.p.x, sp.h + 1.6, sp.p.z); d.scale.setScalar(sp.s); d.rotation.set(0, sp.s * 9, 0);
  });
  instanced(() => new THREE.SphereGeometry(1.8, 9, 7), 0x3f8f3a, forestTreeSpots, (sp, d) => {
    d.position.set(sp.p.x, sp.h + 3.3 + sp.s, sp.p.z); d.scale.set(sp.s * 1.1, sp.s * 1.15, sp.s * 1.1); d.rotation.set(0, 0, 0);
  }, { wind: 0.06, jitter: 0.18 });
  instanced(() => new THREE.SphereGeometry(1.1, 8, 6), 0x4da045, forestTreeSpots, (sp, d) => {
    d.position.set(sp.p.x - sp.s * 0.6, sp.h + 4.4 + sp.s, sp.p.z + sp.s * 0.4);
    d.scale.setScalar(sp.s * 0.75); d.rotation.set(0, 0, 0);
  }, { wind: 0.1, jitter: 0.18 });
  // cacti
  instanced(() => THREE.CapsuleGeometry ? new THREE.CapsuleGeometry(0.45, 1.6, 4, 8) : new THREE.CylinderGeometry(0.45, 0.5, 2.2, 8), 0x4f9948, cactusSpots, (sp, d) => {
    d.position.set(sp.p.x, sp.h + 1.0 * sp.s, sp.p.z); d.scale.setScalar(sp.s); d.rotation.set(0, sp.s * 7, 0);
  }, { jitter: 0.12 });
  // swamp trees
  instanced(() => new THREE.CylinderGeometry(0.18, 0.3, 3.2, 6), 0x5d4a33, swampSpots, (sp, d) => {
    d.position.set(sp.p.x, sp.h + 1.5, sp.p.z); d.scale.setScalar(sp.s); d.rotation.set(0, 0, 0);
  });
  instanced(() => new THREE.SphereGeometry(1.5, 8, 6), 0x46703c, swampSpots, (sp, d) => {
    d.position.set(sp.p.x, sp.h + 3.0 * sp.s, sp.p.z); d.scale.set(sp.s * 1.3, sp.s * 0.7, sp.s * 1.3); d.rotation.set(0, 0, 0);
  }, { wind: 0.07, jitter: 0.15 });
  // grass tufts — the whole meadow breathes in the wind
  instanced(() => new THREE.ConeGeometry(0.16, 0.55, 5), 0x66b84e, tuftSpots, (sp, d) => {
    d.position.set(sp.p.x, sp.h + 0.22, sp.p.z); d.scale.setScalar(sp.s); d.rotation.set(rand() * 0.3, rand() * 6, 0);
  }, { wind: 0.3, jitter: 0.22 });
  // wildflowers
  const flowerSpots = tuftSpots.filter((s, i) => i % 5 === 0);
  instanced(() => new THREE.CylinderGeometry(0.03, 0.04, 0.4, 4), 0x4c8a3e, flowerSpots, (sp, d) => {
    d.position.set(sp.p.x + 0.4, sp.h + 0.2, sp.p.z + 0.2); d.scale.setScalar(sp.s); d.rotation.set(0, 0, 0);
  }, { wind: 0.3 });
  instanced(() => new THREE.SphereGeometry(0.14, 6, 5), 0xffffff, flowerSpots, (sp, d) => {
    d.position.set(sp.p.x + 0.4, sp.h + 0.42 * sp.s, sp.p.z + 0.2); d.scale.set(sp.s, sp.s * 0.7, sp.s); d.rotation.set(0, 0, 0);
  }, { wind: 0.3, jitter: 0, hue: true, place2: true });
  // hand-hue the flower heads
  {
    const fl = scene.children[scene.children.length - 1];
    if (fl && fl.isInstancedMesh) {
      for (let i = 0; i < flowerSpots.length; i++) {
        jitCol.setHSL(rand(), 0.75, 0.72);
        fl.setColorAt(i, jitCol);
      }
      if (fl.instanceColor) fl.instanceColor.needsUpdate = true;
    }
  }
  // bushes (stealth!)
  instanced(() => new THREE.SphereGeometry(1.0, 8, 6), 0x468a3e, bushSpots, (sp, d) => {
    d.position.set(sp.p.x, sp.h + 0.55 * sp.s, sp.p.z);
    d.scale.set(sp.s * 1.25, sp.s * 0.75, sp.s * 1.25); d.rotation.set(0, rand() * 6, 0);
  }, { wind: 0.12, jitter: 0.15 });
  bushSpots.forEach(sp => G.bushes.push({ x: sp.p.x, z: sp.p.z, r: sp.s * 1.3 }));

  // --- gatherable plants for Cheryl ---
  const plantGeoStem = new THREE.CylinderGeometry(0.05, 0.07, 0.5, 5);
  const plantGeoHead = new THREE.SphereGeometry(0.22, 7, 6);
  const keys = Object.keys(G.PLANTS);
  let placedPlants = 0;
  for (let i = 0; i < 3500 && placedPlants < 60; i++) {
    const p = rngPoint(rand), smp = G.sample(p.x, p.z);
    if (Math.hypot(p.x, p.z) < 30) continue;
    let type = null;
    for (const k of keys) {
      const pl = G.PLANTS[k];
      if (pl.biome === 'shore') { if (smp.h > 0.15 && smp.h < 0.7 && rand() < 0.5) { type = k; break; } }
      else if (pl.biome === smp.biome && smp.h > 0.4 && rand() < 0.4) { type = k; break; }
    }
    if (!type) continue;
    const grp = new THREE.Group();
    G.part(grp, plantGeoStem, 0x4c8a3e, 0, 0.25, 0, 1);
    G.part(grp, plantGeoHead, G.PLANTS[type].color, 0, 0.55, 0, 1, 0.8, 1, { emissive: 0x1a1408 });
    G.part(grp, plantGeoHead, 0x5fae4c, 0.15, 0.18, 0.1, 0.7, 0.3, 0.7);
    grp.position.set(p.x, smp.h, p.z);
    scene.add(grp);
    G.plantNodes.push({ mesh: grp, x: p.x, z: p.z, type, taken: false });
    placedPlants++;
  }

  // --- breakable cracked boulders (frog kick / bear swipe) ---
  const bgeo = new THREE.DodecahedronGeometry(1.15, 0);
  for (let i = 0; i < 14; i++) {
    for (let tries = 0; tries < 40; tries++) {
      const p = rngPoint(rand), smp = G.sample(p.x, p.z);
      if (smp.h < 0.6 || smp.biome === 'swamp') continue;
      const mesh = new THREE.Mesh(bgeo, G.mat(0x7d7468));
      mesh.position.set(p.x, smp.h + 0.7, p.z);
      mesh.rotation.set(rand() * 3, rand() * 3, rand() * 3);
      mesh.castShadow = true;
      G.part(mesh, bgeo, 0x4c463e, 0.28, 0.2, 0.15, 0.55);
      scene.add(mesh);
      G.boulders.push({ mesh, x: p.x, z: p.z, hp: 2 });
      break;
    }
  }

  // --- mouse burrows (small-size fast travel) ---
  const holeGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.25, 10);
  for (let i = 0; i < 7; i++) {
    for (let tries = 0; tries < 60; tries++) {
      const p = rngPoint(rand), smp = G.sample(p.x, p.z);
      if ((smp.biome !== 'plains' && smp.biome !== 'desert' && smp.biome !== 'forest') || smp.h < 0.8) continue;
      const grp = new THREE.Group();
      G.part(grp, G.geo.sphere, 0x9c7c4e, 0, 0.05, 0, 0.9, 0.35, 0.9);
      const hole = new THREE.Mesh(holeGeo, G.mat(0x241a10));
      hole.position.y = 0.28; grp.add(hole);
      grp.position.set(p.x, smp.h, p.z);
      scene.add(grp);
      G.burrows.push({ x: p.x, z: p.z, mesh: grp });
      break;
    }
  }
};

// -------- coins & drops --------
const coinGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.09, 12);
G.spawnCoin = function (scene, x, z, y) {
  const m = new THREE.Mesh(coinGeo, G.mat(0xf5c542, { emissive: 0x6b4d00 }));
  m.rotation.x = Math.PI / 2;
  m.position.set(x, y, z);
  m.castShadow = true;
  scene.add(m);
  G.coins.push({ mesh: m, x, z, y, t: Math.random() * 6 });
};
// ingredient crate / confiscated gear pickup
G.spawnDrop = function (scene, x, z, kind, species) {
  const grp = new THREE.Group();
  if (kind === 'ingredient') {
    G.part(grp, G.geo.box, 0xb98a52, 0, 0.3, 0, 0.7, 0.6, 0.7);
    G.part(grp, G.geo.box, 0x8a6239, 0, 0.32, 0, 0.74, 0.14, 0.74);
  } else { // gear
    G.part(grp, G.geo.box, 0x4a5340, 0, 0.25, 0, 0.8, 0.5, 0.5);
    G.part(grp, G.geo.cyl, 0x2c3328, 0, 0.55, 0, 0.1, 0.4, 0.1).rotation.z = 1.2;
  }
  grp.position.set(x, G.heightAt(x, z), z);
  G.scene.add(grp);
  G.drops.push({ mesh: grp, x, z, kind, species, t: 0 });
};

// -------- camp hub: field tent, NPC stands, enclosure zones --------
// 5 themed enclosure zones replace the old pens; each hosts its biome's species.
G.ZONES = [
  { id: 'plains',   label: 'Plains Paddock',  col: 0xc9a84b, floor: 0x8fce6a },
  { id: 'forest',   label: 'Forest Grove',    col: 0x4f9948, floor: 0x63a854 },
  { id: 'desert',   label: 'Desert Dome',     col: 0xd9a45b, floor: 0xe6cf8d },
  { id: 'wetland',  label: 'Wetland Lagoon',  col: 0x5e97a8, floor: 0x86a86a },
  { id: 'highland', label: 'Highland Crag',   col: 0x8f8a82, floor: 0xa8a29a }
];
G.zones = [];
G.buildHub = function (scene) {
  // -- field tent (Tia's mask lab) --
  const tent = new THREE.Group();
  const th = G.heightAt(0, -8);
  G.tentPos.set(0, th, -8);
  G.part(tent, G.geo.box, 0xe8863c, -1.15, 1.1, 0, 0.12, 3.2, 4.2).rotation.z = -0.62;
  G.part(tent, G.geo.box, 0xf9a45b, 1.15, 1.1, 0, 0.12, 3.2, 4.2).rotation.z = 0.62;
  G.part(tent, G.geo.box, 0xd97430, 0, 2.18, 0, 0.14, 0.3, 4.3);
  G.part(tent, G.geo.box, 0x3d2c1c, 0, 0.05, 0, 3.0, 0.1, 4.0);
  const poleF = G.part(tent, G.geo.cyl, 0x6b4c2c, 0, 1.1, 2.0, 0.08, 2.2, 0.08);
  const flag = G.part(tent, G.geo.box, 0xffdf6b, 0.35, 2.35, 2.0, 0.7, 0.4, 0.05);
  flag.castShadow = false; poleF.castShadow = false;
  tent.position.copy(G.tentPos);
  scene.add(tent);
  G.tentMesh = tent;

  // campfire
  const fire = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * Math.PI * 2;
    G.part(fire, G.geo.sphere, 0x8d8579, Math.cos(a) * 0.7, 0.12, Math.sin(a) * 0.7, 0.24);
  }
  G.part(fire, G.geo.cone, 0xff8c3a, 0, 0.45, 0, 0.32, 0.8, 0.32, { emissive: 0xff5500 });
  fire.position.set(4.5, G.heightAt(4.5, -4), -4);
  scene.add(fire);
  G.fireMesh = fire;

  // -- Cheryl's botany stand (west) --
  const cherylStand = new THREE.Group();
  G.part(cherylStand, G.geo.box, 0xa4713d, 0, 0.75, 0, 2.4, 0.14, 1.0);
  G.part(cherylStand, G.geo.box, 0x8a6239, -1.0, 0.36, 0, 0.16, 0.72, 0.8);
  G.part(cherylStand, G.geo.box, 0x8a6239, 1.0, 0.36, 0, 0.16, 0.72, 0.8);
  for (let i = 0; i < 3; i++) {
    G.part(cherylStand, G.geo.cyl, 0xc96f4a, -0.7 + i * 0.7, 0.95, 0, 0.18, 0.25, 0.18);
    G.part(cherylStand, G.geo.sphere, [0xffd94d, 0xf27ba0, 0x9bc06a][i], -0.7 + i * 0.7, 1.2, 0, 0.2, 0.16, 0.2);
  }
  G.part(cherylStand, G.geo.box, 0x6fc45f, 0, 1.9, 0, 2.6, 0.4, 0.08); // awning sign
  cherylStand.position.set(-12, G.heightAt(-12, 2), 2);
  cherylStand.rotation.y = Math.PI / 2.4;
  scene.add(cherylStand);
  G.cherylStand = cherylStand;

  // -- Montana's kitchen (east) --
  const kitchen = new THREE.Group();
  G.part(kitchen, G.geo.box, 0x9c8468, 0, 0.75, 0, 2.4, 0.14, 1.0);
  G.part(kitchen, G.geo.box, 0x7d6a52, -1.0, 0.36, 0, 0.16, 0.72, 0.8);
  G.part(kitchen, G.geo.box, 0x7d6a52, 1.0, 0.36, 0, 0.16, 0.72, 0.8);
  G.part(kitchen, G.geo.cyl, 0x3d3d3d, 0.5, 1.05, 0, 0.34, 0.4, 0.34);  // pot
  G.part(kitchen, G.geo.sphere, 0xf2e6c6, 0.5, 1.25, 0, 0.26, 0.1, 0.26); // broth
  G.part(kitchen, G.geo.box, 0xe86a4a, 0, 1.9, 0, 2.6, 0.4, 0.08); // awning sign
  kitchen.position.set(12, G.heightAt(12, 2), 2);
  kitchen.rotation.y = -Math.PI / 2.4;
  scene.add(kitchen);
  G.kitchenStand = kitchen;

  // -- enclosure zones: 5 big themed squares in an arc behind camp --
  for (let i = 0; i < 5; i++) {
    const zdef = G.ZONES[i];
    const a = (-0.5 + i / 4) * Math.PI * 1.05 + Math.PI * 0.5;
    const px = Math.cos(a) * 30, pz = Math.sin(a) * 30 + 4;
    const py = G.heightAt(px, pz);
    const grp = new THREE.Group();
    const S = 6.2; // half-extent
    // themed floor slab
    G.part(grp, G.geo.box, zdef.floor, 0, 0.06, 0, S * 2, 0.12, S * 2).receiveShadow = true;
    // fence: posts every 2.5m + double rails, gate gap on the hub-facing side (-z local)
    const post = new THREE.CylinderGeometry(0.11, 0.11, 1.2, 7);
    for (let sideIdx = 0; sideIdx < 4; sideIdx++) {
      const horiz = sideIdx < 2;
      const fixed = (sideIdx % 2 === 0 ? -S : S);
      for (let k = -S; k <= S + 0.01; k += S / 2) {
        if (sideIdx === 0 && Math.abs(k) < S / 2 - 0.1) continue; // gate gap
        const x = horiz ? k : fixed, z = horiz ? fixed : k;
        G.part(grp, post, 0xa4713d, x, 0.6, z, 1);
      }
      for (const ry of [0.5, 0.95]) {
        if (sideIdx === 0) { // gate side: two short rails
          G.part(grp, G.geo.box, 0xbd8a52, -S * 0.75, ry, fixed, S * 0.5, 0.12, 0.12);
          G.part(grp, G.geo.box, 0xbd8a52, S * 0.75, ry, fixed, S * 0.5, 0.12, 0.12);
        } else {
          G.part(grp, G.geo.box, 0xbd8a52,
            horiz ? 0 : fixed, ry, horiz ? fixed : 0,
            horiz ? S * 2 : 0.12, 0.12, horiz ? 0.12 : S * 2);
        }
      }
    }
    // sign by the gate
    const sign = new THREE.Group();
    G.part(sign, G.geo.cyl, 0x8a6239, 0, 0.55, 0, 0.09, 1.1, 0.09);
    G.part(sign, G.geo.box, zdef.col, 0, 1.15, 0, 1.5, 0.65, 0.12);
    sign.position.set(0, 0, -S - 0.7);
    grp.add(sign);
    // wetland gets a pool
    if (zdef.id === 'wetland') {
      const pool = new THREE.Mesh(new THREE.CircleGeometry(2.4, 16),
        G.curve(new THREE.MeshLambertMaterial({ color: 0x4db3d4, transparent: true, opacity: 0.8, key: 'zpool' })));
      pool.rotation.x = -Math.PI / 2;
      pool.position.set(1.5, 0.14, 1.5);
      grp.add(pool);
    }
    // highland gets rock steps
    if (zdef.id === 'highland') {
      G.part(grp, G.geo.box, 0x9a948c, -1.5, 0.45, 1.5, 2.4, 0.9, 2.4);
      G.part(grp, G.geo.box, 0x8a847c, -1.5, 1.05, 1.5, 1.4, 0.9, 1.4);
    }
    const decor = new THREE.Group();
    grp.add(decor);
    grp.position.set(px, py, pz);
    grp.lookAt(0, py, 4);
    scene.add(grp);
    G.zones.push({
      id: zdef.id, label: zdef.label, x: px, z: pz, half: S - 0.8,
      group: grp, decorGroup: decor, residents: []
    });
  }

  // welcome arch at hub south
  const arch = new THREE.Group();
  G.part(arch, G.geo.cyl, 0xa4713d, -2, 1.4, 0, 0.18, 2.8, 0.18);
  G.part(arch, G.geo.cyl, 0xa4713d, 2, 1.4, 0, 0.18, 2.8, 0.18);
  G.part(arch, G.geo.box, 0xffd267, 0, 2.9, 0, 4.8, 0.7, 0.2);
  arch.position.set(0, G.heightAt(0, 14), 14);
  scene.add(arch);
};

// -------- enclosure decorations (Cheryl) --------
// decor levels 1..3 per zone, persisted in meta.decor[zoneId]
G.buildZoneDecor = function (zone) {
  const lvl = (G.meta.decor && G.meta.decor[zone.id]) || 0;
  const dg = zone.decorGroup;
  while (dg.children.length) dg.remove(dg.children[0]);
  if (lvl >= 1) { // flower patches in the corners
    for (const [fx, fz] of [[-4, -4], [4, -4], [-4, 4], [4, 4]]) {
      G.part(dg, G.geo.sphere, 0x5fae4c, fx, 0.25, fz, 0.5, 0.25, 0.5);
      G.part(dg, G.geo.sphere, [0xffd94d, 0xf27ba0, 0xf2a9c4, 0x9bc06a][(fx > 0 ? 1 : 0) + (fz > 0 ? 2 : 0)],
        fx, 0.45, fz, 0.22, 0.18, 0.22, { emissive: 0x151005 });
    }
  }
  if (lvl >= 2) { // planter boxes along the back
    for (const px of [-2.5, 0, 2.5]) {
      G.part(dg, G.geo.box, 0xc96f4a, px, 0.35, 4.8, 1.4, 0.45, 0.7);
      G.part(dg, G.geo.sphere, 0x6fc45f, px, 0.65, 4.8, 0.55, 0.3, 0.3);
    }
  }
  if (lvl >= 3) { // centrepiece tree + festive arch over the gate
    G.part(dg, G.geo.cyl, 0x8a6239, 0, 0.9, 0, 0.22, 1.8, 0.22);
    G.part(dg, G.geo.sphere, 0x58ab4a, 0, 2.2, 0, 1.3, 1.0, 1.3);
    G.part(dg, G.geo.box, 0xf2a9c4, 0, 2.4, -5.6, 3.2, 0.35, 0.18);
  }
};

// -------- clouds --------
G.buildClouds = function (scene) {
  const rand = G.mulberry(G.seed + 7);
  const geo = new THREE.SphereGeometry(1, 8, 6);
  const mat = G.curve(new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.92, key: 'cloud' }));
  const count = 70;
  const inst = new THREE.InstancedMesh(geo, mat, count);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < count; i += 3) {
    const x = (rand() - 0.5) * 500, z = (rand() - 0.5) * 500, y = 42 + rand() * 18, s = 3 + rand() * 4;
    for (let k = 0; k < 3 && i + k < count; k++) {
      dummy.position.set(x + k * s * 0.9 - s, y + (k === 1 ? s * 0.35 : 0), z + (rand() - 0.5) * 2);
      dummy.scale.set(s * (0.8 + rand() * 0.4), s * 0.55, s * 0.7);
      dummy.updateMatrix();
      inst.setMatrixAt(i + k, dummy.matrix);
    }
  }
  inst.instanceMatrix.needsUpdate = true;
  scene.add(inst);
  G.clouds = inst;
};

// -------- minimap backdrop --------
G.paintMinimap = function (canvas) {
  const ctx = canvas.getContext('2d'), N = canvas.width;
  const img = ctx.createImageData(N, N);
  const c = new THREE.Color();
  for (let py = 0; py < N; py++) for (let px = 0; px < N; px++) {
    const x = (px / N - 0.5) * G.MAP, z = (py / N - 0.5) * G.MAP;
    const smp = G.sample(x, z);
    if (smp.h < G.WATER_Y) c.set(0x3f9cc0);
    else terrainColor(x, z, smp.h, smp.biome, c);
    const o = (py * N + px) * 4;
    img.data[o] = c.r * 255; img.data[o + 1] = c.g * 255; img.data[o + 2] = c.b * 255; img.data[o + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
};
