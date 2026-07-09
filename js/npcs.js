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
// dialogue system (DOM, panel-styled)
// ---------------------------------------------------------------------------
G.dialog = {
  open(name, emoji, lines, choices) {
    G.paused = true;
    this.lines = Array.isArray(lines) ? lines.slice() : [lines];
    this.choices = choices || null;
    document.getElementById('dlgname').textContent = emoji + ' ' + name;
    document.getElementById('dialog').classList.remove('hidden');
    this.next();
  },
  next() {
    const txtEl = document.getElementById('dlgtext');
    const chEl = document.getElementById('dlgchoices');
    if (this.lines.length) {
      txtEl.innerHTML = this.lines.shift();
      chEl.innerHTML = '';
      if (!this.lines.length && this.choices) this.renderChoices();
      else {
        const b = document.createElement('button');
        b.textContent = this.lines.length ? '▶ ...' : 'okay';
        b.onclick = () => this.lines.length ? this.next() : this.close();
        chEl.appendChild(b);
      }
    } else this.close();
  },
  renderChoices() {
    const chEl = document.getElementById('dlgchoices');
    chEl.innerHTML = '';
    for (const c of this.choices) {
      const b = document.createElement('button');
      b.innerHTML = c.label;
      if (c.disabled) b.disabled = true;
      b.onclick = () => { const act = c.action; this.close(); if (act) act(); };
      chEl.appendChild(b);
    }
    const x = document.createElement('button');
    x.textContent = 'see ya';
    x.onclick = () => this.close();
    chEl.appendChild(x);
  },
  close() {
    document.getElementById('dialog').classList.add('hidden');
    G.paused = false;
  }
};

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
      case 1: return 'Study the fox in the forest near camp (crouch [C], get close, hold E).';
      case 2: return 'Return to Tia and craft the Fox Mask, then wear it (press G for the mask dial).';
      case 3: return 'Wearing the fox mask, knock out a poacher with your dash-strike [F].';
      default: return null; // fall through to progression hints
    }
  }
};

// ----- Tia -----
function talkTia() {
  const s = G.quest.stage;
  if (s === 0) {
    G.dialog.open('Tia', '🧪', [
      'Stuart Diver. Finally. I\'ve read your field record — you\'re exactly the diver-turned-ranger this island needs.',
      'Short version: the <b>Poachers Guild</b> has moved in. Rifles, cages, quotas. They strip islands bare and sell what\'s left.',
      'My counter-measure is this rig — I call it the <b>DNA mask press</b>. Study an animal long enough and I can press its DNA into a wearable mask. Wear it, and you don\'t just look the part... you <i>fight</i> the part.',
      'Start small. There\'s a <b>fox</b> denning at the forest edge just past camp. Crouch, keep quiet, hold <b>E</b> and watch it until the meter fills.',
      'Every animal you fully study also gets a safe home in our <b>zoo</b> here — the one place the Guild can\'t touch them. Now go. And Stuart — don\'t let the Guild reach them first.'
    ]);
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
  ]);
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
  ], choices);
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
const PREDATOR_ING = ['wolf', 'bear', 'badger', 'croc', 'cobra', 'fox'];
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
  ], choices);
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
