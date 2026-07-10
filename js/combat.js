'use strict';
// ---------------------------------------------------------------------------
// Wildmask — combat.js : mask fighting styles, projectiles, the Poachers Guild
// ---------------------------------------------------------------------------

// ================= projectiles =================
G.projectiles = [];
G.spawnProjectile = function (x, y, z, dx, dz, opts) {
  const m = new THREE.Mesh(G.geo.sphere, G.mat(opts.color, { emissive: opts.glow || 0 }));
  m.scale.setScalar(opts.size || 0.16);
  m.position.set(x, y, z);
  G.scene.add(m);
  const d = Math.hypot(dx, dz) || 1;
  G.projectiles.push({
    mesh: m, vx: dx / d * opts.speed, vz: dz / d * opts.speed,
    dmg: opts.dmg, stun: opts.stun || 0, friendly: !!opts.friendly,
    life: opts.life || 2.2, kb: opts.kb || 0.5
  });
};
G.updateProjectiles = function (dt) {
  const P = G.player;
  for (let i = G.projectiles.length - 1; i >= 0; i--) {
    const pr = G.projectiles[i];
    pr.life -= dt;
    const m = pr.mesh;
    m.position.x += pr.vx * dt;
    m.position.z += pr.vz * dt;
    let dead = pr.life <= 0 || m.position.y < G.heightAt(m.position.x, m.position.z) - 0.2;
    if (!dead && pr.friendly) {
      // hit animals / poachers
      for (const a of G.animals) {
        if (!a.alive || a.caged) continue;
        if (Math.hypot(a.pos.x - m.position.x, a.pos.z - m.position.z) < 1.0 + (a.mesh.scale.x - 0.3)) {
          if (pr.stun) { a.stun = Math.max(a.stun, pr.stun); G.toast(a.sp.name + ' is stunned!'); }
          a.hurt(pr.dmg, { x: pr.vx / 20, z: pr.vz / 20 }, pr.kb);
          dead = true; break;
        }
      }
      if (!dead) for (const p of G.poachers) {
        if (p.state === 'ko') continue;
        if (Math.hypot(p.pos.x - m.position.x, p.pos.z - m.position.z) < 1.0) {
          G.damagePoacher(p, pr.dmg, { x: pr.vx / 20, z: pr.vz / 20 }, pr.kb);
          dead = true; break;
        }
      }
    } else if (!dead && !pr.friendly) {
      if (Math.hypot(P.pos.x - m.position.x, P.pos.z - m.position.z) < 0.9 &&
          Math.abs(P.pos.y + 0.8 - m.position.y) < 1.6) {
        P.hurt(pr.dmg, m.position);
        dead = true;
      }
    }
    if (dead) { G.scene.remove(m); G.projectiles.splice(i, 1); }
  }
};

// ================= player attack (called from player.js) =================
function hitArc(P, st, cb) {
  const fx = Math.sin(P.body.rotation.y), fz = Math.cos(P.body.rotation.y);
  const reach = st.range * (P.small ? 0.6 : 1);
  const hx = P.pos.x + fx * reach * 0.7, hz = P.pos.z + fz * reach * 0.7;
  cb(hx, hz, reach, fx, fz);
}
G.playerAttack = function (P, st) {
  G.sfx.thock();
  const dmgMul = (G.buffs && G.buffs.atkMul) || 1;

  // ranged forms fire instead of swinging
  if (st.spit || st.fruit) {
    const fx = Math.sin(P.body.rotation.y), fz = Math.cos(P.body.rotation.y);
    G.spawnProjectile(P.pos.x + fx * 0.6, P.pos.y + 1.1 * P.mesh.scale.x, P.pos.z + fz * 0.6, fx, fz,
      st.spit ? { color: 0x9be04c, glow: 0x2a4a08, speed: 16, dmg: st.dmg * dmgMul, stun: 2.5, friendly: true }
              : { color: 0xd9a45b, speed: 18, dmg: st.dmg * dmgMul, friendly: true, size: 0.2 });
    return;
  }
  // fox dash-strike: lunge forward, i-frames, damage along the way
  if (st.dash) {
    const fx = Math.sin(P.body.rotation.y), fz = Math.cos(P.body.rotation.y);
    P.dashT = 0.18;
    P.dashVX = fx * 32; P.dashVZ = fz * 32;
  }
  // eagle dive-bomb: attack while airborne
  if (st.dive && !P.onGround && !P.swimming) {
    P.diving = true;
    P.vy = -22;
    return;
  }

  hitArc(P, st, (hx, hz, reach) => {
    // breakable boulders (frog kick / bear paws)
    if (st.kick) {
      for (const b of G.boulders) {
        if (b.hp <= 0) continue;
        if (Math.hypot(b.x - hx, b.z - hz) < reach + 0.6) {
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
    // cages: free captured animals
    for (const c of G.cages) {
      if (c.freed) continue;
      if (Math.hypot(c.mesh.position.x - hx, c.mesh.position.z - hz) < reach + 0.8) {
        G.freeCage(c);
      }
    }
    // animals
    for (const a of G.animals) {
      if (!a.alive || a.caged) continue;
      const r = reach + 0.5 + a.mesh.scale.x * 0.5;
      if (Math.hypot(a.pos.x - hx, a.pos.z - hz) < r) {
        const dx = a.pos.x - P.pos.x, dz = a.pos.z - P.pos.z, d = Math.hypot(dx, dz) || 1;
        if (st.claw) { a.stun = 7; G.toast(a.sp.name + ' is stunned by venom! Study it while it wobbles.'); }
        a.hurt(st.dmg * dmgMul, { x: dx / d, z: dz / d }, st.kb);
      }
    }
    // poachers
    for (const p of G.poachers) {
      if (p.state === 'ko') continue;
      if (Math.hypot(p.pos.x - hx, p.pos.z - hz) < reach + 0.7) {
        const dx = p.pos.x - P.pos.x, dz = p.pos.z - P.pos.z, d = Math.hypot(dx, dz) || 1;
        G.damagePoacher(p, st.dmg * dmgMul, { x: dx / d, z: dz / d }, st.kb);
      }
    }
  });
};
// eagle landing impact
G.diveImpact = function (P) {
  G.sfx.thock();
  G.ui.popup('BOOM', P.pos);
  for (const a of G.animals) {
    if (!a.alive || a.caged) continue;
    const d = Math.hypot(a.pos.x - P.pos.x, a.pos.z - P.pos.z);
    if (d < 4) {
      const dx = (a.pos.x - P.pos.x) / (d || 1), dz = (a.pos.z - P.pos.z) / (d || 1);
      a.hurt(4, { x: dx, z: dz }, 3);
    }
  }
  for (const p of G.poachers) {
    if (p.state === 'ko') continue;
    const d = Math.hypot(p.pos.x - P.pos.x, p.pos.z - P.pos.z);
    if (d < 4) G.damagePoacher(p, 4, { x: (p.pos.x - P.pos.x) / (d || 1), z: (p.pos.z - P.pos.z) / (d || 1) }, 3);
  }
};

// ================= the Poachers Guild =================
G.poachers = [];
G.cages = [];
G.camps = [];
G.poacherTimer = 20;

G.buildCamps = function (scene) {
  const rand = G.mulberry(G.seed + 6660);
  for (let i = 0; i < 3; i++) {
    for (let tries = 0; tries < 80; tries++) {
      const a = rand() * Math.PI * 2, r = 90 + rand() * 110;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      const smp = G.sample(x, z);
      if (smp.h < 1 || smp.biome === 'swamp') continue;
      const grp = new THREE.Group();
      // dark guild tent
      G.part(grp, G.geo.box, 0x4a5340, -0.9, 0.9, 0, 0.1, 2.6, 3.2).rotation.z = -0.62;
      G.part(grp, G.geo.box, 0x3c4434, 0.9, 0.9, 0, 0.1, 2.6, 3.2).rotation.z = 0.62;
      G.part(grp, G.geo.box, 0x2c3328, 0, 1.75, 0, 0.12, 0.25, 3.3);
      // skull-ish sign: pale sphere on a post
      G.part(grp, G.geo.cyl, 0x5a4a38, 2.2, 0.8, 1.5, 0.1, 1.6, 0.1);
      G.part(grp, G.geo.sphere, 0xe8e0d0, 2.2, 1.75, 1.5, 0.3, 0.34, 0.3);
      // supply crates
      G.part(grp, G.geo.box, 0x6b5a42, -2.2, 0.35, 1.2, 0.8, 0.7, 0.8);
      G.part(grp, G.geo.box, 0x7a6850, -2.2, 0.95, 1.1, 0.55, 0.5, 0.55);
      grp.position.set(x, smp.h, z);
      scene.add(grp);
      G.camps.push({ x, z, mesh: grp });
      break;
    }
  }
};

function buildCageMesh() {
  const g = new THREE.Group();
  G.part(g, G.geo.box, 0x4a4a4e, 0, 0.05, 0, 1.3, 0.1, 1.3);
  G.part(g, G.geo.box, 0x4a4a4e, 0, 1.15, 0, 1.3, 0.1, 1.3);
  for (const sx of [-0.6, 0, 0.6]) for (const sz of [-0.6, 0.6])
    G.part(g, G.geo.cyl, 0x5a5a5e, sx, 0.6, sz, 0.05, 1.1, 0.05);
  for (const sz of [0]) for (const sx of [-0.6, 0.6])
    G.part(g, G.geo.cyl, 0x5a5a5e, sx, 0.6, sz, 0.05, 1.1, 0.05);
  return g;
}

class Poacher {
  constructor(camp, type) {
    this.type = type; // 'netter' | 'rifleman'
    this.camp = camp;
    this.mesh = G.buildVillager({
      shirt: type === 'rifleman' ? 0x4a5340 : 0x5d5346,
      skin: 0xe8b98a, hat: 'ranger', hatCol: 0x3c4434,
      rifle: type === 'rifleman', net: type === 'netter'
    });
    this.pos = this.mesh.position;
    const a = Math.random() * Math.PI * 2;
    this.pos.set(camp.x + Math.cos(a) * 4, G.heightAt(camp.x, camp.z), camp.z + Math.sin(a) * 4);
    this.hp = type === 'rifleman' ? 4 : 6;
    this.state = 'patrol';
    this.timer = 0;
    this.aimT = 0; this.shotCd = 0;
    this.target = null;       // hunted animal
    this.carryCage = null;
    this.fearT = 0;
    this.walkT = Math.random() * 9;
    // rifle aim beam
    if (type === 'rifleman') {
      const bg = new THREE.BoxGeometry(0.03, 0.03, 1);
      this.beam = new THREE.Mesh(bg, G.mat(0xff4a3c, { emissive: 0xaa1500, key: 'beam' }));
      this.beam.visible = false;
      G.scene.add(this.beam);
    }
    G.scene.add(this.mesh);
  }
  frighten(t) { this.fearT = t; this.state = 'flee'; this.dropCage(); }
  dropCage() {
    if (!this.carryCage) return;
    const c = this.carryCage;
    c.carrier = null;
    c.mesh.position.set(this.pos.x, G.heightAt(this.pos.x, this.pos.z), this.pos.z);
    this.carryCage = null;
  }
  moveToward(tx, tz, sp, dt) {
    const dx = tx - this.pos.x, dz = tz - this.pos.z;
    const d = Math.hypot(dx, dz);
    if (d < 0.3) return true;
    const nx = this.pos.x + dx / d * sp * dt, nz = this.pos.z + dz / d * sp * dt;
    if (G.heightAt(nx, nz) > G.WATER_Y - 0.2 && Math.hypot(nx, nz) < G.RADIUS - 4) {
      this.pos.x = nx; this.pos.z = nz;
    }
    this.mesh.rotation.y = Math.atan2(dx, dz);
    this.walkT += dt * 9;
    return d < 1.2;
  }
  update(dt, P) {
    if (this.state === 'ko') {
      this.timer -= dt;
      if (this.timer <= 0) {
        G.scene.remove(this.mesh);
        if (this.beam) G.scene.remove(this.beam);
        this.dead = true;
      }
      return;
    }
    const pd = Math.hypot(P.pos.x - this.pos.x, P.pos.z - this.pos.z);
    const seesPlayer = pd < 16 && !P.hidden;

    if (this.state === 'flee') {
      this.fearT -= dt;
      this.moveToward(this.camp.x, this.camp.z, 6.5, dt);
      if (this.fearT <= 0) this.state = 'patrol';
    } else if (this.type === 'rifleman' && seesPlayer && pd < 15) {
      // keep distance and shoot
      this.dropCage();
      if (pd < 7) this.moveToward(this.pos.x * 2 - P.pos.x, this.pos.z * 2 - P.pos.z, 3.2, dt);
      this.mesh.rotation.y = Math.atan2(P.pos.x - this.pos.x, P.pos.z - this.pos.z);
      this.shotCd -= dt;
      if (this.shotCd <= 0) {
        this.aimT += dt;
        // show telegraph beam
        const from = new THREE.Vector3(this.pos.x, this.pos.y + 1.0, this.pos.z);
        const to = new THREE.Vector3(P.pos.x, P.pos.y + 0.8 * P.mesh.scale.x, P.pos.z);
        const mid = from.clone().lerp(to, 0.5);
        this.beam.visible = true;
        this.beam.position.copy(mid);
        this.beam.lookAt(to);
        this.beam.scale.z = from.distanceTo(to);
        if (this.aimT > 0.8) {
          this.aimT = 0;
          this.shotCd = 2.4;
          this.beam.visible = false;
          G.audio.tone(180, 0.12, 'square', 0.12, 60);
          const dx = P.pos.x - this.pos.x, dz = P.pos.z - this.pos.z;
          G.spawnProjectile(this.pos.x, this.pos.y + 1.0, this.pos.z, dx, dz,
            { color: 0xffe08a, glow: 0x553300, speed: 26, dmg: 2, friendly: false, size: 0.12, life: 1.2 });
        }
      } else { this.aimT = 0; if (this.beam) this.beam.visible = false; }
    } else if (this.type === 'netter' && seesPlayer && pd < 9) {
      // confront Stuart and swing the net
      this.timer -= dt;
      this.mesh.rotation.y = Math.atan2(P.pos.x - this.pos.x, P.pos.z - this.pos.z);
      if (pd > 1.6) this.moveToward(P.pos.x, P.pos.z, 4.2, dt);
      else if (this.timer <= 0) { this.timer = 1.4; G.hurtPlayer(1, this.pos); }
    } else if (this.carryCage) {
      // haul the catch back to camp
      if (this.beam) this.beam.visible = false;
      const arrived = this.moveToward(this.camp.x, this.camp.z, 2.6, dt);
      const c = this.carryCage;
      c.mesh.position.set(this.pos.x - Math.sin(this.mesh.rotation.y) * 0.9,
        this.pos.y + 0.4, this.pos.z - Math.cos(this.mesh.rotation.y) * 0.9);
      if (arrived) {
        c.carrier = null;
        c.atCamp = true;
        c.shipT = 90;
        c.mesh.position.set(this.camp.x + (Math.random() - 0.5) * 3, G.heightAt(this.camp.x, this.camp.z), this.camp.z + (Math.random() - 0.5) * 3);
        this.carryCage = null;
        G.toast('⚠ A poacher caged a ' + c.animal.sp.name.toLowerCase() + ' at their camp! Break it out before it\'s shipped.');
      }
    } else if (this.state === 'hunt' && this.target && this.target.alive && !this.target.caged) {
      if (this.beam) this.beam.visible = false;
      const t = this.target;
      const reached = this.moveToward(t.pos.x, t.pos.z, 3.4, dt);
      if (reached) {
        // capture!
        t.caged = true;
        t.mesh.visible = false;
        const cage = { mesh: buildCageMesh(), animal: t, carrier: this, atCamp: false, shipT: 0, freed: false };
        G.scene.add(cage.mesh);
        G.cages.push(cage);
        this.carryCage = cage;
        this.state = 'patrol';
        G.toast('⚠ The Guild netted a ' + t.sp.name.toLowerCase() + '! Stop them before it reaches camp.');
      }
    } else {
      // patrol; acquire a target occasionally
      if (this.beam) this.beam.visible = false;
      this.timer -= dt;
      if (this.timer <= 0) {
        this.timer = 3 + Math.random() * 4;
        // hunt nearest catchable animal
        let best = null, bd = 55;
        for (const a of G.animals) {
          if (!a.alive || a.caged || a.sp.aggressive || (a.sp.nocturnal && !G.isNight)) continue;
          if (a.sp.needSmall) continue; // too small to bother
          const d = Math.hypot(a.pos.x - this.pos.x, a.pos.z - this.pos.z);
          if (d < bd) { best = a; bd = d; }
        }
        if (best && Math.random() < 0.7) { this.target = best; this.state = 'hunt'; }
        else {
          const a = Math.random() * Math.PI * 2;
          this._px = this.pos.x + Math.cos(a) * 14;
          this._pz = this.pos.z + Math.sin(a) * 14;
        }
      }
      if (this._px !== undefined) this.moveToward(this._px, this._pz, 2.2, dt);
    }
    this.pos.y = G.heightAt(this.pos.x, this.pos.z) + Math.abs(Math.sin(this.walkT)) * 0.05;
  }
}

// spawn a specific poacher at a location (tutorial scout, scripted events)
G.spawnPoacher = function (x, z, type) {
  const p = new Poacher({ x, z }, type);
  p.pos.set(x, G.heightAt(x, z), z);
  G.poachers.push(p);
  return p;
};

G.damagePoacher = function (p, dmg, kbDir, kb) {
  if (p.state === 'ko') return;
  p.hp -= dmg;
  if (kbDir) { p.pos.x += kbDir.x * (kb || 1.5); p.pos.z += kbDir.z * (kb || 1.5); }
  G.ui.popup('-' + Math.round(dmg * 10) / 10, p.pos);
  G.sfx.hurt();
  if (p.hp <= 0) {
    p.state = 'ko';
    p.timer = 8;
    p.dropCage();
    if (p.beam) p.beam.visible = false;
    p.mesh.rotation.x = Math.PI / 2 * 0.9; // out cold
    const n = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++)
      G.spawnCoin(G.scene, p.pos.x + (Math.random() - 0.5) * 2, p.pos.z + (Math.random() - 0.5) * 2, p.pos.y + 0.5);
    if (Math.random() < 0.3) G.spawnDrop(G.scene, p.pos.x + 1, p.pos.z, 'gear');
    G.toast('Poacher down — out cold. The Guild will think twice.');
    G.meta.poachersKO = (G.meta.poachersKO || 0) + 1;
    if (G.quest && G.quest.onPoacherKO) G.quest.onPoacherKO();
    G.save();
  } else {
    // fight back / panic
    if (p.type === 'netter') p.state = 'patrol';
  }
};

G.freeCage = function (c) {
  c.freed = true;
  const a = c.animal;
  a.caged = false;
  a.alive = true;
  a.mesh.visible = true;
  a.pos.set(c.mesh.position.x + 1, G.heightAt(c.mesh.position.x + 1, c.mesh.position.z), c.mesh.position.z);
  a.state = 'flee'; a.timer = 3;
  G.scene.remove(c.mesh);
  if (c.carrier) c.carrier.carryCage = null;
  G.toast('You broke the cage open — the ' + a.sp.name.toLowerCase() + ' bolts to freedom! (+5 🪙 bounty)');
  G.addCoins(5, c.mesh.position);
  if (G.quest && G.quest.onRescue) G.quest.onRescue();
};

G.updatePoachers = function (dt, P) {
  // escalation: the fuller your zoo, the more the Guild pushes back
  const pressure = 1 + G.zooResidents.length * 0.35;
  const cap = Math.min(7, 2 + Math.floor(G.zooResidents.length * 0.6));
  G.poacherTimer -= dt * pressure;
  if (G.poacherTimer <= 0 && G.camps.length) {
    G.poacherTimer = 30 + Math.random() * 25;
    const alive = G.poachers.filter(p => !p.dead && p.state !== 'ko').length;
    if (alive < cap) {
      const camp = G.camps[Math.floor(Math.random() * G.camps.length)];
      G.poachers.push(new Poacher(camp, Math.random() < 0.45 ? 'rifleman' : 'netter'));
    }
  }
  for (let i = G.poachers.length - 1; i >= 0; i--) {
    const p = G.poachers[i];
    p.update(dt, P);
    if (p.dead) G.poachers.splice(i, 1);
  }
  // cages at camp tick toward being shipped
  for (let i = G.cages.length - 1; i >= 0; i--) {
    const c = G.cages[i];
    if (c.freed) { G.cages.splice(i, 1); continue; }
    if (c.atCamp) {
      c.shipT -= dt;
      if (c.shipT <= 0) {
        const a = c.animal;
        a.alive = false; a.caged = false;
        G.scene.remove(c.mesh);
        G.cages.splice(i, 1);
        G.spawnDrop(G.scene, c.mesh.position.x, c.mesh.position.z, 'ingredient', a.key);
        G.respawnQueue.push({ key: a.key, t: 150 });
        G.toast('The Guild processed the ' + a.sp.name.toLowerCase() + '... all that\'s left is a crate of ' + a.sp.ingredient + '. Montana can at least honor it.');
      }
    }
  }
};
