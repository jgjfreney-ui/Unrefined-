'use strict';
// ---------------------------------------------------------------------------
// Wildmask — util.js : globals, rng/noise, curved-world materials, tiny synth
// ---------------------------------------------------------------------------
const G = window.G = {};

// ----- math helpers -----
G.clamp = (v, a, b) => v < a ? a : v > b ? b : v;
G.lerp = (a, b, t) => a + (b - a) * t;
G.smoothstep = (e0, e1, x) => {
  const t = G.clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

// ----- seeded rng -----
G.mulberry = function (seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
};

// ----- value noise + fbm (analytic: terrain & gameplay share it) -----
G.hash2 = function (ix, iz, s) {
  let h = Math.imul(ix, 374761393) ^ Math.imul(iz, 668265263) ^ Math.imul(s, 1274126177);
  h = Math.imul(h ^ h >>> 13, 1103515245);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
};
G.vnoise = function (x, z, s) {
  const ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz;
  const a = G.hash2(ix, iz, s), b = G.hash2(ix + 1, iz, s);
  const c = G.hash2(ix, iz + 1, s), d = G.hash2(ix + 1, iz + 1, s);
  const u = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz);
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
};
G.fbm = function (x, z, oct, s) {
  let amp = 0.5, f = 1, sum = 0, norm = 0;
  for (let i = 0; i < oct; i++) {
    sum += amp * G.vnoise(x * f, z * f, s + i * 57);
    norm += amp; amp *= 0.5; f *= 2;
  }
  return sum / norm;
};

// ----- curved world (the "rolling log" 3DS look) -----
// Every material gets its vertex shader patched so geometry drops away with
// view-space distance, like Animal Crossing's world curling over the horizon.
G.CURVE = 0.0016;
const CURVE_CHUNK = [
  'vec4 mvPosition = vec4( transformed, 1.0 );',
  '#ifdef USE_INSTANCING',
  '  mvPosition = instanceMatrix * mvPosition;',
  '#endif',
  'mvPosition = modelViewMatrix * mvPosition;',
  'mvPosition.y -= mvPosition.z * mvPosition.z * ' + G.CURVE.toFixed(5) + ';',
  'gl_Position = projectionMatrix * mvPosition;'
].join('\n');
G.curve = function (mat) {
  mat.onBeforeCompile = function (sh) {
    sh.vertexShader = sh.vertexShader.replace('#include <project_vertex>', CURVE_CHUNK);
  };
  return mat;
};

// ----- shared material cache (flat lambert colors = chunky toy look) -----
const _matCache = {};
G.mat = function (color, opts) {
  opts = opts || {};
  const key = color + '|' + (opts.key || '') + (opts.transparent ? 'T' + opts.opacity : '') + (opts.emissive || '');
  if (_matCache[key]) return _matCache[key];
  const m = new THREE.MeshLambertMaterial({
    color: color,
    transparent: !!opts.transparent,
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
    emissive: opts.emissive || 0x000000
  });
  G.curve(m);
  _matCache[key] = m;
  return m;
};

// ----- shared geometries -----
G.geo = {
  sphere: null, box: null, cyl: null, cone: null,
  init() {
    this.sphere = new THREE.SphereGeometry(1, 10, 8);
    this.box = new THREE.BoxGeometry(1, 1, 1);
    this.cyl = new THREE.CylinderGeometry(1, 1, 1, 8);
    this.cone = new THREE.ConeGeometry(1, 1, 8);
  }
};

// quick part builder: adds a mesh to parent, returns it
G.part = function (parent, geo, color, x, y, z, sx, sy, sz, opts) {
  const m = new THREE.Mesh(geo, G.mat(color, opts));
  m.position.set(x, y, z);
  m.scale.set(sx || 1, sy || sx || 1, sz || sx || 1);
  m.castShadow = true;
  parent.add(m);
  return m;
};

// ----- teeny synth sfx (no assets needed) -----
G.audio = {
  ctx: null,
  init() { if (!this.ctx) try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} },
  tone(freq, dur, type, vol, slide) {
    if (!this.ctx) return;
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.value = freq;
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, c.currentTime + dur);
    g.gain.value = vol || 0.12;
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    o.connect(g); g.connect(c.destination);
    o.start(); o.stop(c.currentTime + dur);
  }
};
G.sfx = {
  coin()   { G.audio.tone(920, 0.09, 'square', 0.06); setTimeout(() => G.audio.tone(1380, 0.14, 'square', 0.06), 70); },
  jingle() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => G.audio.tone(f, 0.22, 'triangle', 0.1), i * 110)); },
  mask()   { G.audio.tone(220, 0.3, 'sawtooth', 0.07, 440); },
  unmask() { G.audio.tone(440, 0.25, 'sawtooth', 0.05, 220); },
  hurt()   { G.audio.tone(140, 0.2, 'sawtooth', 0.12, 70); },
  thock()  { G.audio.tone(90, 0.1, 'square', 0.14); },
  splash() { G.audio.tone(500, 0.25, 'sine', 0.07, 120); },
  tick()   { G.audio.tone(1200, 0.03, 'sine', 0.025); },
  jump()   { G.audio.tone(300, 0.12, 'sine', 0.05, 520); },
  sting()  { G.audio.tone(1000, 0.15, 'sawtooth', 0.09, 300); },
  burrow() { G.audio.tone(600, 0.2, 'sine', 0.07, 150); setTimeout(() => G.audio.tone(150, 0.2, 'sine', 0.07, 600), 200); }
};
