'use strict';
// ---------------------------------------------------------------------------
// Wildmask — ui.js : HUD, mask dial, tent menu, notebook, minimap, toasts
// ---------------------------------------------------------------------------
G.ui = {};
const $ = id => document.getElementById(id);

G.toast = function (msg, ms) {
  const box = $('toasts');
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = msg;
  box.appendChild(el);
  while (box.children.length > 4) box.removeChild(box.firstChild);
  setTimeout(() => el.classList.add('show'), 20);
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 400); }, ms || 3600);
};

G.ui.init = function () {
  G.ui.refreshHearts();
  G.ui.refreshHotbar();
  G.ui.refreshCoins();
  G.paintMinimap($('mapbase'));

  $('btnStart').onclick = () => {
    G.audio.init();
    G.music.start();
    $('intro').classList.add('hidden');
    G.started = true;
    if ((G.meta.quest || 0) === 0) G.toast('Find Tia by the orange tent — she has your briefing.');
  };
  $('musicbtn').onclick = () => {
    const m = G.music.toggleMute();
    $('musicbtn').textContent = m ? '🔇' : '🎵';
  };
  $('btnHelp').onclick = () => $('help').classList.toggle('hidden');
  $('helpClose').onclick = () => $('help').classList.add('hidden');
  $('tentClose').onclick = () => G.ui.closeTent();
  $('dialclose').onclick = () => G.ui.toggleDial(false);
  $('btnNewRun').onclick = () => {
    if (confirm('Set off on a new expedition? A fresh island forms — you keep your masks, zoo, coins and research.')) G.newExpedition();
  };
};

// ----- hearts / stamina / breath / buffs -----
G.ui.refreshHearts = function () {
  const P = G.player; if (!P) return;
  let s = '';
  for (let i = 0; i < P.maxHp; i++) s += i < P.hp ? '❤️' : '🖤';
  $('hearts').textContent = s;
};
G.ui.flashDamage = function () {
  const f = $('dmgflash');
  f.classList.remove('on'); void f.offsetWidth; f.classList.add('on');
  G.ui.refreshHearts();
};
G.ui.updateBars = function (P) {
  $('stamfill').style.width = P.stamina + '%';
  $('stambar').style.opacity = P.stamina < 99.5 ? 1 : 0;
  const showBreath = P.swimming && P.breath < 99.5;
  $('breathbar').style.opacity = showBreath ? 1 : 0;
  $('breathfill').style.width = P.breath + '%';
  // buff chip
  const b = $('buffchip');
  if (G.buffs && G.buffs.timer > 0) {
    b.classList.remove('hidden');
    b.textContent = '🍲 ' + Math.ceil(G.buffs.timer) + 's';
  } else b.classList.add('hidden');
  // stealth chip
  $('stealthchip').classList.toggle('hidden', !P.hidden);
};

// ----- coins -----
G.addCoins = function (n, worldPos) {
  G.meta.coins += n;
  G.ui.refreshCoins();
  G.sfx.coin();
  if (worldPos) G.ui.popup('+' + n, worldPos);
  G.save();
};
G.ui.refreshCoins = function () { $('coins').textContent = G.meta.coins; };

G.ui.popup = function (text, worldPos) {
  const v = worldPos.clone ? worldPos.clone() : new THREE.Vector3(worldPos.x, worldPos.y, worldPos.z);
  v.y += 1.5;
  v.project(G.camera);
  if (v.z > 1) return;
  const el = document.createElement('div');
  el.className = 'popup';
  el.textContent = text;
  el.style.left = ((v.x * 0.5 + 0.5) * innerWidth) + 'px';
  el.style.top = ((-v.y * 0.5 + 0.5) * innerHeight) + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1100);
};

// ----- mask hotbar (owned masks, digits 1-9) + full dial -----
G.ui.refreshHotbar = function () {
  const bar = $('hotbar');
  bar.innerHTML = '';
  const owned = G.MASK_ORDER.filter(k => G.meta.masks[k]);
  owned.slice(0, 9).forEach((k, i) => {
    const d = document.createElement('div');
    d.className = 'slot';
    d.innerHTML = '<span class="key">' + (i + 1) + '</span>' + G.SPECIES[k].emoji;
    if (G.player && G.player.mask === k) d.classList.add('active');
    d.onclick = () => G.player.setMask(k);
    bar.appendChild(d);
  });
  // dial button
  const dial = document.createElement('div');
  dial.className = 'slot dialbtn';
  dial.innerHTML = '<span class="key">G</span>🎭';
  dial.onclick = () => G.ui.toggleDial();
  bar.appendChild(dial);
  G.ownedMasks = owned;
};
G.ui.toggleDial = function (force) {
  const el = $('maskdial');
  const show = force !== undefined ? force : el.classList.contains('hidden');
  el.classList.toggle('hidden', !show);
  G.paused = show;
  if (!show) return;
  const grid = $('dialgrid');
  grid.innerHTML = '';
  for (const k of G.MASK_ORDER) {
    const sp = G.SPECIES[k];
    const owned = G.meta.masks[k];
    const d = document.createElement('div');
    d.className = 'dialslot' + (owned ? '' : ' locked') + (G.player.mask === k ? ' active' : '');
    d.innerHTML = '<div class="de">' + (owned ? sp.emoji : '❓') + '</div><div class="dn">' +
      (owned ? sp.name : '???') + '</div>' +
      (owned ? '<div class="dt">' + sp.traits + '</div>' : '<div class="dt">' + 'T' + sp.tier + ' — study to unlock</div>');
    if (owned) d.onclick = () => { G.ui.toggleDial(false); G.player.setMask(k); };
    grid.appendChild(d);
  }
  const off = document.createElement('div');
  off.className = 'dialslot' + (G.player.mask === 'none' ? ' active' : '');
  off.innerHTML = '<div class="de">🙂</div><div class="dn">Stuart</div><div class="dt">bare-faced and brave</div>';
  off.onclick = () => { G.ui.toggleDial(false); G.player.setMask('none'); };
  grid.appendChild(off);
};
G.ui.showMaskBanner = function (name) {
  const b = $('maskbanner');
  if (name === 'none') { b.classList.remove('show'); return; }
  b.textContent = G.SPECIES[name].emoji + ' ' + G.SPECIES[name].name + ' form — ' + G.SPECIES[name].traits;
  b.classList.add('show');
  clearTimeout(G.ui._bt);
  G.ui._bt = setTimeout(() => b.classList.remove('show'), 4000);
};

// ----- study panel -----
G.ui.study = function (animal, pct, active) {
  const el = $('studypanel');
  if (!animal) { el.classList.add('hidden'); return; }
  const v = animal.pos.clone(); v.y += 1.6 * animal.mesh.scale.x + 0.8;
  v.project(G.camera);
  if (v.z > 1) { el.classList.add('hidden'); return; }
  el.classList.remove('hidden');
  el.style.left = ((v.x * 0.5 + 0.5) * innerWidth) + 'px';
  el.style.top = ((-v.y * 0.5 + 0.5) * innerHeight) + 'px';
  $('studyname').textContent = animal.sp.emoji + ' ' + animal.sp.name +
    (animal.stun > 0 ? ' (stunned!)' : '') + ' ' + '⭐'.repeat(animal.sp.tier);
  $('studyfill').style.width = pct + '%';
  $('studyhint').textContent = active ? 'studying...' : 'hold E to study';
  el.classList.toggle('active', !!active);
};

// ----- objective line -----
G.ui.objective = function () {
  const m = G.meta;
  let txt = G.quest && G.quest.objectiveText();
  if (!txt) {
    const studied = Object.keys(G.SPECIES).filter(k => (m.study[k] || 0) >= G.SPECIES[k].studyNeed).length;
    if (!m.masks.croc) txt = 'The swamp crocs guard deep water. Study one from dry land to unlock the wetlands.';
    else if (!m.masks.mouse) txt = 'Mice in the plains hold the key to shrinking — and to studying scorpions.';
    else if (!m.masks.eagle && m.masks.scorpion) txt = 'Eagles roost on the mesa tops. Scorpion claws can climb those walls...';
    else if (studied < 19) txt = 'Zoo: ' + studied + '/19 species. Keep studying — and keep the Guild off their backs.';
    else txt = 'All 19 species safe in the zoo! The island is yours, Stuart.';
  }
  $('objective').textContent = txt;
};

// ----- notebook -----
G.ui.toggleNotebook = function (force) {
  const nb = $('notebook');
  const show = force !== undefined ? force : nb.classList.contains('hidden');
  nb.classList.toggle('hidden', !show);
  if (!show) return;
  const tiers = { 1: [], 2: [], 3: [] };
  Object.keys(G.SPECIES).forEach(k => tiers[G.SPECIES[k].tier].push(k));
  let html = '';
  for (const t of [1, 2, 3]) {
    html += '<div class="nb-tier">' + '⭐'.repeat(t) + ' Tier ' + t + '</div>';
    html += tiers[t].map(k => {
      const sp = G.SPECIES[k];
      const raw = Math.floor(G.meta.study[k] || 0);
      const pct = Math.min(100, Math.floor(raw / sp.studyNeed * 100));
      const done = raw >= sp.studyNeed;
      return '<div class="nb-row' + (done ? ' done' : '') + '">' +
        '<div class="nb-head">' + sp.emoji + ' <b>' + sp.name + '</b>' +
        '<span class="nb-pct">' + (done ? '✓ in zoo' : pct + '%') + '</span></div>' +
        '<div class="nb-bar"><div style="width:' + pct + '%"></div></div>' +
        '<div class="nb-hint">' + (done ? sp.traits : sp.hint) + '</div>' +
        '</div>';
    }).join('');
  }
  $('nbcontent').innerHTML = html;
};

// ----- tent menu -----
const UPGRADES = [
  { id: 'journal', name: '📖 Field Journal', cost: 25, desc: 'Study animals 60% faster.' },
  { id: 'boots', name: '🥾 Padded Boots', cost: 30, desc: 'Animals notice you from much closer.' },
  { id: 'canteen', name: '🥤 Explorer Canteen', cost: 40, desc: '+2 max hearts, refills now.' },
  { id: 'poster', name: '🪧 Zoo Poster', cost: 60, desc: 'Big boost to zoo appeal and guest pay.' }
];
G.ui.openTent = function (tab) {
  G.paused = true;
  $('tent').classList.remove('hidden');
  G.ui.renderTent();
  if (tab) {
    document.querySelectorAll('.tenttabs button').forEach(x =>
      x.classList.toggle('sel', x.dataset.tab === tab));
    ['tentmasks', 'tentupgrades', 'tentzoo'].forEach(id =>
      $(id).classList.toggle('hidden', id !== tab));
  }
};
G.ui.closeTent = function () {
  G.paused = false;
  $('tent').classList.add('hidden');
};
G.ui.renderTent = function () {
  const m = G.meta;
  $('tentmasks').innerHTML = G.MASK_ORDER.map(k => {
    const sp = G.SPECIES[k];
    const hasDna = m.dna[k], has = m.masks[k];
    let btn;
    if (has) btn = '<span class="owned">crafted ✓</span>';
    else if (hasDna) btn = '<button data-craft="' + k + '">Craft Mask</button>';
    else btn = '<span class="missing">' + '⭐'.repeat(sp.tier) + ' — needs DNA</span>';
    return '<div class="craftrow' + (has ? ' done' : '') + '">' +
      '<div class="craft-ico">' + sp.emoji + '</div>' +
      '<div class="craft-mid"><b>' + sp.name + ' Mask</b><br><small>' + sp.traits + '</small></div>' +
      '<div class="craft-act">' + btn + '</div></div>';
  }).join('');
  $('tentupgrades').innerHTML = UPGRADES.map(u => {
    const owned = m.upg[u.id];
    const afford = m.coins >= u.cost;
    const btn = owned ? '<span class="owned">owned ✓</span>' :
      '<button data-upg="' + u.id + '"' + (afford ? '' : ' disabled') + '>🪙 ' + u.cost + '</button>';
    return '<div class="craftrow' + (owned ? ' done' : '') + '">' +
      '<div class="craft-mid"><b>' + u.name + '</b><br><small>' + u.desc + '</small></div>' +
      '<div class="craft-act">' + btn + '</div></div>';
  }).join('');
  // zoo tab: per-zone report
  const rows = G.zones.map(z => {
    const lvl = (m.decor && m.decor[z.id]) || 0;
    const names = z.residents.map(r => G.SPECIES[r.key].emoji).join(' ') || '<small>empty</small>';
    return '<div class="craftrow"><div class="craft-mid"><b>' + z.label + '</b> ' + names +
      '<br><small>decor ' + '🌷'.repeat(lvl) + (lvl ? '' : '— ask Cheryl') + '</small></div></div>';
  }).join('');
  $('tentzoo').innerHTML =
    '<p>🎪 <b>' + G.zooResidents.length + ' / 19</b> species exhibited · appeal ×' + G.zooAppeal().toFixed(2) +
    ' · 👥 ' + G.guests.length + ' guests · 😵 ' + (m.poachersKO || 0) + ' poachers stopped</p>' + rows;
  $('tent').querySelectorAll('[data-craft]').forEach(b => b.onclick = () => {
    const k = b.dataset.craft;
    m.masks[k] = true;
    G.sfx.jingle();
    G.toast('You crafted the ' + G.SPECIES[k].name + ' Mask! Open the dial [G] to wear it.');
    G.save();
    G.ui.refreshHotbar();
    G.ui.renderTent();
  });
  $('tent').querySelectorAll('[data-upg]').forEach(b => b.onclick = () => {
    const u = UPGRADES.find(x => x.id === b.dataset.upg);
    if (m.coins < u.cost) return;
    m.coins -= u.cost;
    m.upg[u.id] = true;
    if (u.id === 'canteen') { G.player.maxHp += 2; G.player.hp = G.player.maxHp; G.ui.refreshHearts(); }
    G.sfx.jingle();
    G.ui.refreshCoins();
    G.save();
    G.ui.renderTent();
  });
};

// ----- prompt line -----
G.ui.prompt = function (txt) {
  const el = $('prompt');
  if (!txt) { el.classList.add('hidden'); return; }
  el.textContent = txt;
  el.classList.remove('hidden');
  if (G.isTouch) G.mobileInteractLabel && G.mobileInteractLabel(txt);
};

// ----- minimap -----
G.ui.drawMinimap = function (P) {
  const cv = $('map'), ctx = cv.getContext('2d'), N = cv.width;
  ctx.clearRect(0, 0, N, N);
  ctx.drawImage($('mapbase'), 0, 0);
  const toMap = (x, z) => [(x / G.MAP + 0.5) * N, (z / G.MAP + 0.5) * N];
  // poacher camps
  ctx.fillStyle = '#3d2c1c';
  for (const c of G.camps) {
    const [cx, cy] = toMap(c.x, c.z);
    ctx.beginPath(); ctx.arc(cx, cy, 3, 0, 7); ctx.fill();
  }
  let [tx, ty] = toMap(G.tentPos.x, G.tentPos.z);
  ctx.font = '10px sans-serif';
  ctx.fillText('⛺', tx - 5, ty + 4);
  const [px, py] = toMap(P.pos.x, P.pos.z);
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(px, py, 4, 0, 7); ctx.fill();
  ctx.fillStyle = '#e8482c';
  ctx.beginPath(); ctx.arc(px, py, 2.6, 0, 7); ctx.fill();
};

// ----- big banner -----
G.ui.bigBanner = function (title, sub) {
  $('bigtitle').textContent = title;
  $('bigsub').textContent = sub;
  const b = $('bigbanner');
  b.classList.remove('hidden');
  b.classList.remove('anim'); void b.offsetWidth; b.classList.add('anim');
  clearTimeout(G.ui._bb);
  G.ui._bb = setTimeout(() => b.classList.add('hidden'), 4200);
};
