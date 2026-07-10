'use strict';
// ---------------------------------------------------------------------------
// Wildmask — npcs.js : Tia, Cheryl, Montana; dialogue; tutorial quest chain
// You are Stuart Diver, field agent of the Wildmask Sanctuary Project.
// ---------------------------------------------------------------------------

G.npcs = [];

G.buildNPCs = function (scene) {
  // Tia — mask-tech scientist, by the lab tent
  const tia = G.buildVillager({ shirt: 0xf5f2e3, skin: 0xc98a5c, hat: 'goggles', hair: 0x2c2320 });
  tia.position.set(2.6, G.heightAt(2.6, -7), -7);
  scene.add(tia);
  G.npcs.push({ id: 'tia', name: 'Tia', emoji: '🧪', mesh: tia, t: 0 });

  // Cheryl — botanist, at her flower stand
  const cheryl = G.buildVillager({ shirt: 0x8fc48a, skin: 0xffd9a6, hat: 'flower', apron: 0x6fc45f, hair: 0xb0642e });
  cheryl.position.set(-11, G.heightAt(-11, 3.5), 3.5);
  cheryl.rotation.y = Math.PI / 2.4;
  scene.add(cheryl);
  G.npcs.push({ id: 'cheryl', name: 'Cheryl', emoji: '🌼', mesh: cheryl, t: 3 });

  // Montana — chef, at the camp kitchen
  const montana = G.buildVillager({ shirt: 0xe8e0d0, skin: 0xd9a06a, hat: 'chef', apron: 0xe86a4a, mustache: true });
  montana.position.set(11, G.heightAt(11, 3.5), 3.5);
  montana.rotation.y = -Math.PI / 2.4;
  scene.add(montana);
  G.npcs.push({ id: 'montana', name: 'Montana', emoji: '🍲', mesh: montana, t: 6 });
};

G.updateNPCs = function (dt, P) {
  for (const n of G.npcs) {
    n.t += dt;
    n.mesh.position.y = G.heightAt(n.mesh.position.x, n.mesh.position.z) + Math.abs(Math.sin(n.t * 2)) * 0.03;
    const d = Math.hypot(P.pos.x - n.mesh.position.x, P.pos.z - n.mesh.position.z);
    if (d < 6) { // face Stuart when he's near
      const want = Math.atan2(P.pos.x - n.mesh.position.x, P.pos.z - n.mesh.position.z);
      let dd = want - n.mesh.rotation.y;
      while (dd > Math.PI) dd -= Math.PI * 2;
      while (dd < -Math.PI) dd += Math.PI * 2;
      n.mesh.rotation.y += dd * Math.min(1, dt * 5);
    }
  }
};
G.nearestNPC = function (P, radius) {
  let best = null, bd = radius || 3.2;
  for (const n of G.npcs) {
    const d = Math.hypot(P.pos.x - n.mesh.position.x, P.pos.z - n.mesh.position.z);
    if (d < bd) { best = n; bd = d; }
  }
  return best;
};

// ---------------------------------------------------------------------------
// dialogue system: typewriter text + per-character voice blips (AC style)
// ---------------------------------------------------------------------------
G.dialog = {
  typing: false,
  open(name, emoji, lines, choices, voice) {
    G.paused = true;
    this.lines = Array.isArray(lines) ? lines.slice() : [lines];
    this.choices = choices || null;
    this.voice = voice || 440;
    document.getElementById('dlgname').textContent = emoji + ' ' + name;
    document.getElementById('dialog').classList.remove('hidden');
    this.advance();
  },
  advance() {
    if (this.typing) return this.finishType();
    if (!this.lines.length) return this.close();
    this.full = this.lines.shift();
    this.plain = this.full.replace(/<[^>]+>/g, '');
    this.i = 0;
    this.typing = true;
    const chEl = document.getElementById('dlgchoices');
    chEl.innerHTML = '';
    const b = document.createElement('button');
    b.textContent = '▶';
    b.onclick = e => { e.stopPropagation(); this.advance(); };
    chEl.appendChild(b);
    clearInterval(this._t);
    this._t = setInterval(() => {
      this.i++;
      document.getElementById('dlgtext').textContent = this.plain.slice(0, this.i);
      if (this.i % 3 === 1) G.sfx.blip(this.voice);
      if (this.i >= this.plain.length) this.finishType();
    }, 22);
  },
  finishType() {
    clearInterval(this._t);
    this.typing = false;
    document.getElementById('dlgtext').innerHTML = this.full;
    if (!this.lines.length) this.renderEnd();
  },
  renderEnd() {
    const chEl = document.getElementById('dlgchoices');
    chEl.innerHTML = '';
    if (this.choices) {
      for (const c of this.choices) {
        const b = document.createElement('button');
        b.innerHTML = c.label;
        if (c.disabled) b.disabled = true;
        b.onclick = e => { e.stopPropagation(); const act = c.action; this.close(); if (act) act(); };
        chEl.appendChild(b);
      }
      const x = document.createElement('button');
      x.textContent = 'see ya';
      x.onclick = e => { e.stopPropagation(); this.close(); };
      chEl.appendChild(x);
    } else {
      const b = document.createElement('button');
      b.textContent = 'okay';
      b.onclick = e => { e.stopPropagation(); this.close(); };
      chEl.appendChild(b);
    }
  },
  close() {
    clearInterval(this._t);
    this.typing = false;
    document.getElementById('dialog').classList.add('hidden');
    G.paused = false;
  }
};
// tapping anywhere on the dialogue panel advances / skips the typewriter
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('dialog').addEventListener('click', () => {
    if (!document.getElementById('dialog').classList.contains('hidden')) G.dialog.advance();
  });
});
const VOICES = { tia: 640, cheryl: 520, montana: 280 };

// ---------------------------------------------------------------------------
// quest chain (meta.quest: 0 talk-to-tia, 1 study fox, 2 wear fox mask,
//              3 KO a poacher, 4 open-ended)
// ---------------------------------------------------------------------------
G.quest = {
  get stage() { return G.meta.quest || 0; },
  set stage(v) { G.meta.quest = v; G.save(); G.ui.objective(); },
  advance(to, banner, sub) {
    if (this.stage >= to) return;
    this.stage = to;
    if (banner) G.ui.bigBanner(banner, sub || '');
    G.sfx.jingle();
  },
  onStudyComplete(key) {
    if (key === 'fox') this.advance(2, '🦊 Fox studied!', 'See Tia at the tent — she\'ll press the DNA into your first mask.');
  },
  onMaskWorn(key) {
    if (key === 'fox') this.advance(3, '🦊 Fox form!', 'A Guild scout is prowling nearby. Dash-strike [F] and knock them out cold.');
  },
  onPoacherKO() {
    this.advance(4, '💪 First poacher down!', 'Tia: "That\'s the job, Stuart. Study everything. Fill the zoo. Starve the Guild."');
  },
  onRescue() {},
  onAnimalDefeat() {},
  objectiveText() {
    switch (this.stage) {
      case 0: return 'Talk to Tia at the field tent ⛺ — she\'s been waiting for you.';
      case 1: return [
        'Follow the golden beacon — Tia tagged a fox at the forest edge.',
        'Crouch (C / 🐾) before the fox spots you!',
        'Stay low and creep toward the fox...',
        'Hold E (👁) while facing the fox to study it.',
        'Keep watching — fill the meter!'
      ][G.tutorial.sub] || 'Study the fox!';
      case 2: return 'Follow the beacon back to Tia — she\'ll press your Fox Mask.';
      case 3: return 'Wear the fox mask (G / 🎭) and dash-strike [F / ⚔️] the Guild scout at the beacon.';
      default: return null; // fall through to progression hints
    }
  }
};

// ---------------------------------------------------------------------------
// guided tutorial sequencer: beacon + step-by-step coaching
// ---------------------------------------------------------------------------
G.tutorial = { sub: 0, seen: {} };
function coach(id, msg) {
  if (G.tutorial.seen[id]) return;
  G.tutorial.seen[id] = 1;
  G.toast(msg, 4500);
  G.audio.tone(880, 0.12, 'sine', 0.06, 1200);
}
G.updateTutorial = function (dt, P) {
  const st = G.quest.stage;
  let pulse = null;
  if (st === 1) {
    const f = G.tutorialFox;
    if (!f || !f.alive) { G.setBeacon(null); return; }
    G.setBeacon(f);
    const d = Math.hypot(f.pos.x - P.pos.x, f.pos.z - P.pos.z);
    const t = G.tutorial;
    if (t.sub === 0 && d < 20) { t.sub = 1; coach('spot', '🦊 There it is! Crouch (C / 🐾) so it doesn\'t bolt.'); }
    if (t.sub === 1 && P.crouch) { t.sub = 2; coach('creep', 'Nice and low. Now creep in close — slowly.'); }
    if (t.sub === 2 && d < f.sp.studyR) { t.sub = 3; coach('range', 'In range! Hold E (👁) and keep your eyes on it.'); }
    if (t.sub === 3 && (G.meta.study.fox || 0) > 15) { t.sub = 4; coach('meter', 'That\'s DNA sequencing! Stay with it until the meter fills.'); }
    if (t.sub >= 1 && G.tutorial.seen.spot && d > 26 && f.state === 'flee') coach('fled', 'It bolted! No worries — your progress is saved. Sneak back in.');
    if (t.sub === 1) pulse = 'tbCrouch';
    else if (t.sub >= 3) pulse = 'tbAct';
  } else if (st === 2) {
    const tia = G.npcs.find(n => n.id === 'tia');
    G.setBeacon(tia ? { pos: tia.mesh.position } : null);
    if (G.meta.masks.fox) pulse = 'tbMask';
  } else if (st === 3) {
    if (!G._tutPoacherSpawned) {
      G._tutPoacherSpawned = true;
      const a = Math.PI / 2 + 0.4;
      const x = Math.cos(a) * 26, z = Math.sin(a) * 26;
      G._tutPoacher = G.spawnPoacher(x, z, 'netter');
      coach('scout', '⚠ Tia: "A Guild scout is snooping north of camp — the beacon\'s on him. Dash-strike [F / ⚔️]!"');
    }
    const p = G._tutPoacher;
    G.setBeacon(p && !p.dead && p.state !== 'ko' ? p : null);
    if (P.mask !== 'fox') pulse = 'tbMask';
    else pulse = 'tbAtk';
  } else {
    G.setBeacon(null);
  }
  if (pulse !== G._pulsed) { G._pulsed = pulse; G.ui.pulseBtn(pulse); }
};

// ----- Tia -----
function talkTia() {
  const s = G.quest.stage;
  if (s === 0) {
    G.dialog.open('Tia', '🧪', [
      'Thank god. The <b>Anti-Poaching Division</b> is here.',
      'That flip out of the jeep? The yo-yo? ...Okay, Stuart Diver, you\'ll do nicely. I\'m <b>Tia</b> — sanctuary tech lead.',
      'That fox you just saved is exactly why I called for you. The <b>Poachers Guild</b> is stripping this island bare — and while your yo-yo is impressive, I can offer you something better.',
      'My invention: the <b>DNA mask press</b>. Study an animal long enough and I can press its DNA into a mask. Wear it, and you move like it — you <i>fight</i> like it.',
      'And you\'re going to be my test pilot. See that <b>pillar of light</b>? I tagged that same fox as it ran for the trees. Follow the beacon.',
      'When you get close: <b>crouch</b> so it doesn\'t bolt, creep in, then <b>hold E</b> while you watch it. Fill the meter and its DNA is ours — and the fox earns a safe pen in our zoo, where the Guild can never touch it.',
      'Off you go, ranger. I\'ll press your first mask the moment you\'re back.'
    ], null, VOICES.tia);
    G.quest.advance(1);
    return;
  }
  const lines = s === 2
    ? ['You got the fox DNA! Give me two seconds with the press... There. Craft it below, put it on, and go introduce the Guild to your new reflexes.']
    : ['The press is warm and the zoo has room, Stuart. What do you need?'];
  G.dialog.open('Tia', '🧪', lines, [
    { label: '🎭 Craft masks', action: () => G.ui.openTent('tentmasks') },
    { label: '🛠 Field upgrades', action: () => G.ui.openTent('tentupgrades') },
    { label: '🎪 Zoo report', action: () => G.ui.openTent('tentzoo') }
  ], VOICES.tia);
}

// ----- Cheryl -----
function talkCheryl() {
  const total = Object.values(G.meta.plants || {}).reduce((a, b) => a + b, 0);
  const choices = [];
  for (const z of G.zones) {
    const lvl = (G.meta.decor && G.meta.decor[z.id]) || 0;
    if (lvl >= 3) { choices.push({ label: '✓ ' + z.label + ' (fully decorated)', disabled: true }); continue; }
    const cost = 6 + lvl * 4;
    choices.push({
      label: '🌷 Decorate ' + z.label + ' → lv' + (lvl + 1) + ' (' + cost + ' plants)',
      disabled: total < cost,
      action: () => {
        // spend plants greedily across types
        let need = cost;
        for (const k in G.meta.plants) {
          const take = Math.min(need, G.meta.plants[k]);
          G.meta.plants[k] -= take; need -= take;
          if (!need) break;
        }
        G.meta.decor = G.meta.decor || {};
        G.meta.decor[z.id] = lvl + 1;
        G.buildZoneDecor(z);
        G.sfx.jingle();
        G.toast('Cheryl planted up the ' + z.label + '! Zoo appeal is now ×' + G.zooAppeal().toFixed(2));
        G.save();
      }
    });
  }
  G.dialog.open('Cheryl', '🌼', [
    total > 0
      ? 'Ooh, Stuart! You\'ve got <b>' + total + ' plants</b> in that pack — I can smell the moon ferns from here. Let me pretty up an enclosure for you?'
      : 'Stuart! Bring me wildflowers, ferns, reeds — anything green and lovely. I\'ll turn these bare enclosures into little paradises. (Look for glowing plants out in each biome.)'
  ], choices, VOICES.cheryl);
}

// ----- Montana -----
G.buffs = { atkMul: 1, atkCdMul: 1, speedMul: 1, breathMul: 1, timer: 0 };
const RECIPES = [
  { id: 'rations', name: '🍖 Trail Rations', cost: 1, desc: 'fully restores your hearts', any: true,
    eat: () => { G.player.hp = G.player.maxHp; G.ui.refreshHearts(); } },
  { id: 'stew', name: '🍲 Hearty Stew', cost: 2, desc: '+2 max hearts for this expedition', any: true,
    eat: () => { G.player.maxHp += 2; G.player.hp = G.player.maxHp; G.ui.refreshHearts(); } },
  { id: 'jerky', name: '🥩 Peppered Jerky', cost: 2, desc: 'attack +50% for 3 minutes', pred: true,
    eat: () => { G.buffs.atkMul = 1.5; G.buffs.timer = Math.max(G.buffs.timer, 180); } },
  { id: 'gumbo', name: '🥘 Swamp Gumbo', cost: 2, desc: 'speed +20% & breath ×2 for 3 minutes', any: true,
    eat: () => { G.buffs.speedMul = 1.2; G.buffs.breathMul = 2; G.buffs.timer = Math.max(G.buffs.timer, 180); } }
];
const PREDATOR_ING = ['wolf', 'bear', 'badger', 'croc', 'cobra', 'fox', 'boar'];
function ingCount(predOnly) {
  let n = 0;
  for (const k in (G.meta.ingredients || {})) {
    if (predOnly && !PREDATOR_ING.includes(k)) continue;
    n += G.meta.ingredients[k];
  }
  return n;
}
function spendIngredients(cost, predOnly) {
  let need = cost;
  const keys = Object.keys(G.meta.ingredients).sort((a, b) =>
    (PREDATOR_ING.includes(a) === predOnly ? -1 : 1) - (PREDATOR_ING.includes(b) === predOnly ? -1 : 1));
  for (const k of keys) {
    if (predOnly && !PREDATOR_ING.includes(k)) continue;
    const take = Math.min(need, G.meta.ingredients[k]);
    G.meta.ingredients[k] -= take;
    if (!G.meta.ingredients[k]) delete G.meta.ingredients[k];
    need -= take;
    if (!need) break;
  }
}
function talkMontana() {
  G.meta.ingredients = G.meta.ingredients || {};
  const inv = Object.entries(G.meta.ingredients)
    .map(([k, n]) => n + '× ' + (G.SPECIES[k] ? G.SPECIES[k].ingredient : k)).join(', ');
  const choices = RECIPES.map(r => {
    const have = ingCount(!!r.pred);
    return {
      label: r.name + ' — ' + r.desc + ' <small>(' + r.cost + (r.pred ? ' predator' : '') + ' ingredients)</small>',
      disabled: have < r.cost,
      action: () => {
        spendIngredients(r.cost, !!r.pred);
        r.eat();
        G.sfx.jingle();
        G.toast('Montana serves up ' + r.name + '. Down the hatch!');
        G.save();
      }
    };
  });
  G.dialog.open('Montana', '🍲', [
    inv
      ? 'Every animal the Guild takes, or that you drop defending yourself, deserves better than a warehouse shelf. I cook it with respect. You\'re carrying: <b>' + inv + '</b>.'
      : 'Empty-handed, eh? Bring me ingredients — crates the Guild leaves behind, or whatever you\'re forced to take in self-defense. Nothing goes to waste in my kitchen.'
  ], choices, VOICES.montana);
}

G.talkTo = function (npc) {
  G.audio.tone(500, 0.08, 'sine', 0.05);
  if (npc.id === 'tia') talkTia();
  else if (npc.id === 'cheryl') talkCheryl();
  else if (npc.id === 'montana') talkMontana();
};

G.updateBuffs = function (dt) {
  if (G.buffs.timer > 0) {
    G.buffs.timer -= dt;
    if (G.buffs.timer <= 0) {
      G.buffs.atkMul = 1; G.buffs.atkCdMul = 1; G.buffs.speedMul = 1; G.buffs.breathMul = 1;
      G.toast('The meal\'s effects wear off.');
    }
  }
};
