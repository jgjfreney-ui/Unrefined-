'use strict';
// ---------------------------------------------------------------------------
// Wildmask — world.js : procedural island, biomes, camp hub, props, obstacles
// ---------------------------------------------------------------------------
G.WATER_Y = 0;
G.MAP = 520;          // terrain plane size
G.RADIUS = 245;       // hard travel limit
G.tentPos = new THREE.Vector3(0, 0, 0);

// -------- terrain sampling (analytic, shared by render + gameplay) --------
// biomes: plains, desert (mesas), swamp (pools), rock (terraces), + ocean rim
G.sample = function (x, z) {
  const s = G.seed;
  const raw = (G.fbm(x * 0.013, z * 0.013, 4, s) - 0.35) * 16;
  const t = G.fbm(x * 0.006 + 100, z * 0.006 + 100, 3, s + 900);   // temperature
  const m = G.fbm(x * 0.007 + 200, z * 0.007 - 200, 3, s + 1700);  // moisture
  // biome height targets, blended smoothly so borders aren't cliffs
  const dF = G.smoothstep(0.56, 0.64, t);                          // desert factor
  const sF = G.smoothstep(0.56, 0.64, m) * (1 - dF);               // swamp factor
  let hd = raw * 0.45 + 2.4;
  const mm = G.fbm(x * 0.02 - 50, z * 0.02 + 50, 2, s + 300);
  if (mm > 0.575) hd += G.smoothstep(0.575, 0.595, mm) * 9;        // mesas (sheer walls, climb-only)
  const hs = raw * 0.35 - 0.7;                                     // murky pools
  let h = raw * (1 - dF - sF) + hd * dF + hs * sF;
  let biome = dF > 0.5 ? 'desert' : (sF > 0.5 ? 'swamp' : 'plains');
  if (biome === 'plains' && dF < 0.02 && sF < 0.02 && h > 5.0) {
    biome = 'rock';
    h = 5.0 + Math.floor((h - 5.0) / 2.0) * 2.0;                   // terraces (frog hops)
  }
  // flatten the camp hub
  const d = Math.hypot(x, z);
  const f = 1 - G.smoothstep(22, 42, d);
  if (f > 0) { h = h * (1 - f) + 1.6 * f; if (f > 0.55) biome = 'plains'; }
  // island falls into the ocean
  if (d > 210) h -= (d - 210) * 0.18;
  return { h: h, biome: biome };
};
G.heightAt = (x, z) => G.sample(x, z).h;

G.deepWater = function (x, z) { return G.WATER_Y - G.heightAt(x, z) > 1.4; };

// -------- terrain mesh with vertex colors --------
const BIOME_COL = {
  plains: new THREE.Color(0x7cc95e),
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

  // water disc
  const wgeo = new THREE.CircleGeometry(G.MAP * 0.72, 48);
  wgeo.rotateX(-Math.PI / 2);
  const wmat = G.curve(new THREE.MeshLambertMaterial({
    color: 0x4db3d4, transparent: true, opacity: 0.72
  }));
  G.water = new THREE.Mesh(wgeo, wmat);
  G.water.position.y = G.WATER_Y;
  scene.add(G.water);
};

// -------- prop scatter --------
G.boulders = [];   // breakable: {mesh, x, z, hp}
G.burrows = [];    // mouse-holes: {x, z, mesh}
G.coins = [];      // pickups: {mesh, x, z, y, t}

function rngPoint(rand) {
  const a = rand() * Math.PI * 2, r = 30 + rand() * 190;
  return { x: Math.cos(a) * r, z: Math.sin(a) * r };
}

G.buildProps = function (scene) {
  const rand = G.mulberry(G.seed + 42);
  const dummy = new THREE.Object3D();

  // --- trees (plains): trunk + blob canopy, instanced ---
  const treeSpots = [], cactusSpots = [], swampSpots = [], tuftSpots = [];
  for (let i = 0; i < 4200; i++) {
    const p = rngPoint(rand), smp = G.sample(p.x, p.z);
    if (smp.h < 0.5 || Math.hypot(p.x, p.z) < 26) continue;
    if (smp.biome === 'plains') {
      if (treeSpots.length < 260 && rand() < 0.18) treeSpots.push({ p, h: smp.h, s: 0.8 + rand() * 0.7 });
      else if (tuftSpots.length < 700) tuftSpots.push({ p, h: smp.h, s: 0.6 + rand() * 0.8 });
    } else if (smp.biome === 'desert' && cactusSpots.length < 120 && rand() < 0.3) {
      cactusSpots.push({ p, h: smp.h, s: 0.7 + rand() * 0.8 });
    } else if (smp.biome === 'swamp' && smp.h > 0.2 && swampSpots.length < 110 && rand() < 0.3) {
      swampSpots.push({ p, h: smp.h, s: 0.8 + rand() * 0.6 });
    }
  }
  function instanced(geoFn, colorHex, spots, place) {
    if (!spots.length) return;
    const g = geoFn();
    const m = new THREE.InstancedMesh(g, G.mat(colorHex, { key: 'inst' + colorHex + g.uuid }), spots.length);
    m.castShadow = true;
    spots.forEach((sp, i) => { place(sp, dummy); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); });
    m.instanceMatrix.needsUpdate = true;
    scene.add(m);
  }
  // trunks
  instanced(() => new THREE.CylinderGeometry(0.28, 0.4, 2.4, 7), 0x8a6239, treeSpots, (sp, d) => {
    d.position.set(sp.p.x, sp.h + 1.1, sp.p.z); d.scale.setScalar(sp.s); d.rotation.set(0, sp.s * 9, 0);
  });
  // canopies
  instanced(() => new THREE.SphereGeometry(1.7, 9, 7), 0x58ab4a, treeSpots, (sp, d) => {
    d.position.set(sp.p.x, sp.h + 2.4 + sp.s, sp.p.z); d.scale.set(sp.s * 1.15, sp.s, sp.s * 1.15); d.rotation.set(0, 0, 0);
  });
  // cacti
  instanced(() => THREE.CapsuleGeometry ? new THREE.CapsuleGeometry(0.45, 1.6, 4, 8) : new THREE.CylinderGeometry(0.45, 0.5, 2.2, 8), 0x4f9948, cactusSpots, (sp, d) => {
    d.position.set(sp.p.x, sp.h + 1.0 * sp.s, sp.p.z); d.scale.setScalar(sp.s); d.rotation.set(0, sp.s * 7, 0);
  });
  // swamp trees: dark droopy blobs on thin trunks
  instanced(() => new THREE.CylinderGeometry(0.18, 0.3, 3.2, 6), 0x5d4a33, swampSpots, (sp, d) => {
    d.position.set(sp.p.x, sp.h + 1.5, sp.p.z); d.scale.setScalar(sp.s); d.rotation.set(0, 0, 0);
  });
  instanced(() => new THREE.SphereGeometry(1.5, 8, 6), 0x46703c, swampSpots, (sp, d) => {
    d.position.set(sp.p.x, sp.h + 3.0 * sp.s, sp.p.z); d.scale.set(sp.s * 1.3, sp.s * 0.7, sp.s * 1.3); d.rotation.set(0, 0, 0);
  });
  // grass tufts
  instanced(() => new THREE.ConeGeometry(0.16, 0.55, 5), 0x66b84e, tuftSpots, (sp, d) => {
    d.position.set(sp.p.x, sp.h + 0.22, sp.p.z); d.scale.setScalar(sp.s); d.rotation.set(rand() * 0.3, rand() * 6, 0);
  });

  // --- breakable cracked boulders (frog kick) ---
  const bgeo = new THREE.DodecahedronGeometry(1.15, 0);
  for (let i = 0; i < 14; i++) {
    for (let tries = 0; tries < 40; tries++) {
      const p = rngPoint(rand), smp = G.sample(p.x, p.z);
      if (smp.h < 0.6 || smp.biome === 'swamp') continue;
      const mesh = new THREE.Mesh(bgeo, G.mat(0x7d7468));
      mesh.position.set(p.x, smp.h + 0.7, p.z);
      mesh.rotation.set(rand() * 3, rand() * 3, rand() * 3);
      mesh.castShadow = true;
      // crack lines: darker small dodeca poking through
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
      if ((smp.biome !== 'plains' && smp.biome !== 'desert') || smp.h < 0.8) continue;
      const grp = new THREE.Group();
      G.part(grp, G.geo.sphere, 0x9c7c4e, 0, 0.05, 0, 0.9, 0.35, 0.9); // mound
      const hole = new THREE.Mesh(holeGeo, G.mat(0x241a10));
      hole.position.y = 0.28; grp.add(hole);
      grp.position.set(p.x, smp.h, p.z);
      scene.add(grp);
      G.burrows.push({ x: p.x, z: p.z, mesh: grp });
      break;
    }
  }
};

// -------- coins --------
const coinGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.09, 12);
G.spawnCoin = function (scene, x, z, y) {
  const m = new THREE.Mesh(coinGeo, G.mat(0xf5c542, { emissive: 0x6b4d00 }));
  m.rotation.x = Math.PI / 2;
  m.position.set(x, y, z);
  m.castShadow = true;
  scene.add(m);
  G.coins.push({ mesh: m, x, z, y, t: Math.random() * 6 });
};

// -------- camp hub: field tent + zoo pens --------
G.pens = []; // {x, z, species|null, sign}
G.buildHub = function (scene) {
  // -- field tent --
  const tent = new THREE.Group();
  const th = G.heightAt(0, -8);
  G.tentPos.set(0, th, -8);
  // canvas: two leaning planes -> use boxes
  G.part(tent, G.geo.box, 0xe8863c, -1.15, 1.1, 0, 0.12, 3.2, 4.2).rotation.z = -0.62;
  G.part(tent, G.geo.box, 0xf9a45b, 1.15, 1.1, 0, 0.12, 3.2, 4.2).rotation.z = 0.62;
  G.part(tent, G.geo.box, 0xd97430, 0, 2.18, 0, 0.14, 0.3, 4.3); // ridge
  G.part(tent, G.geo.box, 0x3d2c1c, 0, 0.05, 0, 3.0, 0.1, 4.0);  // ground mat
  const poleF = G.part(tent, G.geo.cyl, 0x6b4c2c, 0, 1.1, 2.0, 0.08, 2.2, 0.08);
  const flag = G.part(tent, G.geo.box, 0xffdf6b, 0.35, 2.35, 2.0, 0.7, 0.4, 0.05);
  flag.castShadow = false; poleF.castShadow = false;
  tent.position.copy(G.tentPos);
  scene.add(tent);
  G.tentMesh = tent;

  // campfire ring
  const fire = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * Math.PI * 2;
    G.part(fire, G.geo.sphere, 0x8d8579, Math.cos(a) * 0.7, 0.12, Math.sin(a) * 0.7, 0.24);
  }
  G.part(fire, G.geo.cone, 0xff8c3a, 0, 0.45, 0, 0.32, 0.8, 0.32, { emissive: 0xff5500 });
  fire.position.set(3.5, G.heightAt(3.5, -4), -4);
  scene.add(fire);
  G.fireMesh = fire;

  // -- zoo pens: 5 in an arc --
  const order = ['horse', 'frog', 'croc', 'mouse', 'scorpion'];
  const penCols = { horse: 0xc98a4b, frog: 0x6fc45f, croc: 0x5e9151, mouse: 0xb9b3ac, scorpion: 0xb0563a };
  for (let i = 0; i < 5; i++) {
    const a = (-0.5 + i / 4) * Math.PI * 0.9 + Math.PI * 0.5; // arc behind camp
    const px = Math.cos(a) * 19, pz = Math.sin(a) * 19 + 2;
    const py = G.heightAt(px, pz);
    const pen = new THREE.Group();
    // fence: posts + rails around 7x7
    const S = 3.4;
    for (let sx = -1; sx <= 1; sx += 2) for (let sz = -1; sz <= 1; sz += 2)
      G.part(pen, G.geo.cyl, 0xa4713d, sx * S, 0.55, sz * S, 0.12, 1.1, 0.12);
    for (let k = 0; k < 4; k++) {
      const horiz = k < 2;
      const rail = G.part(pen, G.geo.box, 0xbd8a52,
        horiz ? 0 : (k === 2 ? -S : S), 0.75, horiz ? (k === 0 ? -S : S) : 0,
        horiz ? S * 2 : 0.14, 0.14, horiz ? 0.14 : S * 2);
      const rail2 = rail.clone(); rail2.position.y = 0.35; pen.add(rail2);
    }
    // sign
    const sign = new THREE.Group();
    G.part(sign, G.geo.cyl, 0x8a6239, 0, 0.5, 0, 0.09, 1.0, 0.09);
    G.part(sign, G.geo.box, penCols[order[i]], 0, 1.05, 0, 1.1, 0.6, 0.12);
    sign.position.set(0, 0, -S - 0.6);
    pen.add(sign);
    pen.position.set(px, py, pz);
    pen.lookAt(0, py, 0);
    scene.add(pen);
    G.pens.push({ x: px, z: pz, species: order[i], group: pen, resident: null });
  }

  // welcome arch at hub south
  const arch = new THREE.Group();
  G.part(arch, G.geo.cyl, 0xa4713d, -2, 1.4, 0, 0.18, 2.8, 0.18);
  G.part(arch, G.geo.cyl, 0xa4713d, 2, 1.4, 0, 0.18, 2.8, 0.18);
  G.part(arch, G.geo.box, 0xffd267, 0, 2.9, 0, 4.8, 0.7, 0.2);
  arch.position.set(0, G.heightAt(0, 12), 12);
  scene.add(arch);
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
