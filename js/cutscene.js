'use strict';
// ---------------------------------------------------------------------------
// Wildmask — cutscene.js : the opening. Stuart Diver, Anti-Poaching Division,
// arrives by jeep just as two Guild poachers corner a fox. Yo-yo time.
// ---------------------------------------------------------------------------

function buildJeep() {
  const g = new THREE.Group(), X = G.geo.box, C = G.geo.cyl, S = G.geo.sphere;
  G.part(g, X, 0x7a8456, 0, 0.75, 0, 2.6, 0.55, 1.3);                 // hull
  G.part(g, X, 0x6b7449, 0, 1.05, 0.75, 2.2, 0.3, 0.15);              // hood lip
  G.part(g, X, 0x5d6640, -0.4, 1.25, 0, 1.1, 0.45, 1.1);              // cab
  const glass = G.part(g, X, 0xbfe6f2, 0.35, 1.35, 0, 0.06, 0.5, 1.05);
  glass.material = G.curve(new THREE.MeshLambertMaterial({ color: 0xbfe6f2, transparent: true, opacity: 0.6 }));
  G.part(g, C, 0x5d6640, -0.15, 1.6, 0.5, 0.05, 0.9, 0.05).rotation.z = 0.25;  // roll bar
  G.part(g, C, 0x5d6640, -0.15, 1.6, -0.5, 0.05, 0.9, 0.05).rotation.z = 0.25;
  G.part(g, S, 0xffe9a3, 1.32, 0.8, 0.4, 0.12, 0.12, 0.06);           // headlights
  G.part(g, S, 0xffe9a3, 1.32, 0.8, -0.4, 0.12, 0.12, 0.06);
  const spare = G.part(g, C, 0x2c2c30, -1.42, 0.9, 0, 0.35, 0.16, 0.35);
  spare.rotation.z = Math.PI / 2;
  const wheels = [];
  for (const wx of [0.85, -0.85]) for (const wz of [0.72, -0.72]) {
    const w = G.part(g, C, 0x2c2c30, wx, 0.35, wz, 0.38, 0.26, 0.38);
    w.rotation.x = Math.PI / 2;
    G.part(w, C, 0x8f8a82, 0, 0, 0, 0.5, 1.05, 0.5);
    wheels.push(w);
  }
  g.userData.wheels = wheels;
  return g;
}

G.cutscene = {
  active: false, t: 0, done: null,
  actors: {},

  start(done) {
    this.active = true;
    this.t = 0;
    this.done = done;
    this._fired = {};
    G.paused = true;
    document.getElementById('cinebars').classList.remove('hidden');
    document.getElementById('cineskip').classList.remove('hidden');
    document.body.classList.add('cine');

    const y = (x, z) => G.heightAt(x, z);
    const A = this.actors;
    // jeep with Stuart aboard, roaring in along the camp flat
    A.jeep = buildJeep();
    A.jeep.position.set(-34, y(-34, 10), 10);
    G.scene.add(A.jeep);
    const P = G.player;
    P.pos.set(-34, y(-34, 10) + 0.9, 10);
    P.body.rotation.y = Math.PI / 2;
    // the fox, cornered
    A.fox = G.buildAnimalMesh('fox', 0.8);
    A.fox.position.set(-8, y(-8, 8), 8);
    A.fox.rotation.y = -Math.PI / 2;
    G.scene.add(A.fox);
    // two poachers closing in
    A.p1 = G.buildVillager({ shirt: 0x5d5346, skin: 0xe8b98a, hat: 'ranger', hatCol: 0x3c4434, net: true });
    A.p1.position.set(-11, y(-11, 8), 8);
    A.p1.rotation.y = Math.PI / 2;
    G.scene.add(A.p1);
    A.p2 = G.buildVillager({ shirt: 0x4a5340, skin: 0xd9a06a, hat: 'ranger', hatCol: 0x3c4434, rifle: true });
    A.p2.position.set(-6, y(-6, 11), 11);
    A.p2.rotation.y = Math.PI;
    G.scene.add(A.p2);
  },

  fire(id, fn) { if (!this._fired[id]) { this._fired[id] = 1; fn(); } },

  // simple keyframed direction; t in seconds
  update(dt, camera) {
    this.t += dt;
    const t = this.t, A = this.actors, P = G.player;
    const y = (x, z) => G.heightAt(x, z);
    const lerp = G.lerp, ss = G.smoothstep;

    // ---- phase 1 (0–3.5s): jeep races in, fox cornered ----
    if (t < 3.5) {
      const k = ss(0, 3.2, t);
      const jx = lerp(-34, -16, k);
      A.jeep.position.set(jx, y(jx, 10) + Math.sin(t * 22) * 0.03, 10);
      A.jeep.userData.wheels.forEach(w => w.rotation.y += dt * 14);
      P.pos.set(jx - 0.2, A.jeep.position.y + 0.95, 10);
      P.body.rotation.y = Math.PI / 2;
      // fox darts back and forth, poachers loom
      A.fox.position.x = -8 + Math.sin(t * 5) * 0.4;
      A.p1.position.x = lerp(-11, -9.6, ss(0, 3.5, t));
      this.fire('dust1', () => {});
      if (G.fx && Math.random() < 0.3) G.fx.dust(A.jeep.position, 1);
      // camera: low tracking shot alongside the jeep
      camera.position.set(jx - 4, A.jeep.position.y + 2.2, 16.5);
      camera.lookAt(jx + 2, A.jeep.position.y + 1, 9);
    }
    // ---- phase 2 (3.5–4.5s): skid stop ----
    else if (t < 4.5) {
      const k = ss(3.5, 4.4, t);
      const jx = lerp(-16, -13, k);
      A.jeep.position.x = jx;
      A.jeep.rotation.y = lerp(0, -0.5, k);
      P.pos.set(jx - 0.2, A.jeep.position.y + 0.95, 10);
      this.fire('skid', () => { G.sfx.thock(); for (let i = 0; i < 6; i++) G.fx.dust(A.jeep.position, 2); });
      camera.position.set(jx - 3, A.jeep.position.y + 2.5, 15);
      camera.lookAt(jx, A.jeep.position.y + 1, 9);
    }
    // ---- phase 3 (4.5–6s): Stuart front-flips out ----
    else if (t < 6) {
      const k = ss(4.5, 5.8, t);
      P.pos.x = lerp(-13.2, -11.5, k);
      P.pos.z = lerp(10, 8.6, k);
      P.pos.y = y(P.pos.x, P.pos.z) + Math.sin(k * Math.PI) * 2.2;
      P.body.rotation.x = k * Math.PI * 2;            // full front flip!
      P.body.rotation.y = Math.PI / 2;
      this.fire('leap', () => G.sfx.jump());
      if (k > 0.95) { P.body.rotation.x = 0; this.fire('land', () => G.fx.dust(P.pos, 4)); }
      camera.position.set(P.pos.x - 2.5, P.pos.y + 1.8, P.pos.z + 5.5);
      camera.lookAt(P.pos.x + 1, P.pos.y + 1, P.pos.z);
    }
    // ---- phase 4 (6–8s): yo-yo bonk on the netter ----
    else if (t < 8) {
      const k = ss(6.2, 7.0, t);
      P.body.rotation.y = Math.atan2(A.p1.position.x - P.pos.x, A.p1.position.z - P.pos.z);
      // yo-yo flies out
      P.yoyo.visible = k > 0 && k < 1;
      P.beltYoyo.visible = false;
      const dist = Math.sin(Math.min(1, k) * Math.PI) * 3.2;
      P.yoyo.position.set(0.4, 0.62, 0.05 + dist);
      P.yoyoString.position.z = -dist / 2;
      P.yoyoString.scale.y = Math.max(0.01, dist);
      if (k > 0.45) this.fire('bonk1', () => {
        G.sfx.thock();
        G.fx.burst(A.p1.position);
        A.stars1 = G.makeKOStars();
      });
      if (A.stars1) {
        A.p1.rotation.x = Math.min(Math.PI / 2 * 0.9, (A.p1.rotation.x || 0) + dt * 6);
        A.p1.position.x += dt * 2.5; // knocked back
        A.stars1.position.set(A.p1.position.x, A.p1.position.y + 0.9, A.p1.position.z);
        A.stars1.rotation.y += dt * 5;
      }
      camera.position.set(P.pos.x + 1, P.pos.y + 2.2, P.pos.z + 4.5);
      camera.lookAt(A.p1.position.x, A.p1.position.y + 0.8, A.p1.position.z);
    }
    // ---- phase 5 (8–10s): backflip kick on the rifleman ----
    else if (t < 10) {
      const k = ss(8.1, 9.3, t);
      const sx = P.pos.x, sz = P.pos.z;
      P.pos.x = lerp(sx, A.p2.position.x - 0.8, Math.min(1, k * 1.4));
      P.pos.z = lerp(sz, A.p2.position.z - 0.4, Math.min(1, k * 1.4));
      P.pos.y = y(P.pos.x, P.pos.z) + Math.sin(Math.min(1, k) * Math.PI) * 1.9;
      P.body.rotation.x = -k * Math.PI * 2;           // backflip!
      P.body.rotation.y = Math.atan2(A.p2.position.x - P.pos.x, A.p2.position.z - P.pos.z);
      if (k > 0.55) this.fire('bonk2', () => {
        G.sfx.thock();
        G.fx.burst(A.p2.position);
        A.stars2 = G.makeKOStars();
        if (A.p2.userData.rifle) A.p2.userData.rifle.visible = false;
      });
      if (A.stars2) {
        A.p2.rotation.x = Math.min(Math.PI / 2 * 0.9, (A.p2.rotation.x || 0) + dt * 6);
        A.p2.position.z += dt * 3;
        A.stars2.position.set(A.p2.position.x, A.p2.position.y + 0.9, A.p2.position.z);
        A.stars2.rotation.y += dt * 5;
      }
      if (k >= 1) P.body.rotation.x = 0;
      camera.position.set(P.pos.x - 4, P.pos.y + 2.6, P.pos.z + 3.5);
      camera.lookAt(P.pos.x, P.pos.y + 1, P.pos.z);
    }
    // ---- phase 6 (10–12.5s): fox bounds free, hero orbit ----
    else if (t < 12.5) {
      const k = ss(10, 12.3, t);
      A.fox.position.x = lerp(-8, 6, k);
      A.fox.position.z = lerp(8, 30, k);
      A.fox.position.y = y(A.fox.position.x, A.fox.position.z) + Math.abs(Math.sin(t * 9)) * 0.4;
      A.fox.rotation.y = Math.atan2(6 - -8, 30 - 8);
      this.fire('foxfree', () => G.sfx.jingle());
      P.body.rotation.y = Math.PI;
      const a = Math.PI * 0.4 + k * 1.4;
      camera.position.set(P.pos.x + Math.sin(a) * 5, P.pos.y + 2 + k, P.pos.z + Math.cos(a) * 5);
      camera.lookAt(P.pos.x, P.pos.y + 1.1, P.pos.z);
    }
    // ---- end ----
    else this.finish();
  },

  finish() {
    if (!this.active) return;
    this.active = false;
    const A = this.actors, P = G.player;
    // park the jeep by camp as a keepsake; clear the rest
    if (A.jeep) { A.jeep.position.set(-10, G.heightAt(-10, 12), 12); A.jeep.rotation.y = -0.4; }
    for (const k of ['fox', 'p1', 'p2', 'stars1', 'stars2']) {
      if (A[k]) { G.scene.remove(A[k]); delete A[k]; }
    }
    P.yoyo.visible = false;
    P.body.rotation.x = 0;
    P.pos.set(2, G.heightAt(2, -2), -2);
    document.getElementById('cinebars').classList.add('hidden');
    document.getElementById('cineskip').classList.add('hidden');
    document.body.classList.remove('cine');
    G.paused = false;
    G.meta.seenIntro = true;
    G.save();
    if (this.done) this.done();
  }
};
