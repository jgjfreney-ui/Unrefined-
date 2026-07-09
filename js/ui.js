'use strict';
// ---------------------------------------------------------------------------
// Wildmask — ui.js : HUD, tent menu, notebook, minimap, toasts
// ---------------------------------------------------------------------------
G.ui = {};
const $ = id => document.getElementById(id);

G.toast = function (msg, ms) {
  const box = $('toasts');
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  box.appendChild(el);
  setTimeout(() => el.classList.add('show'), 20);
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 400); }, ms || 3200);
};

G.ui.init = function () {
  G.ui.refreshHearts();
  G.ui.refreshHotbar();
  G.ui.refreshCoins();
  G.paintMinimap($('mapbase'));

  $('btnStart').onclick = () => {
    G.audio.init();
    $('intro').classList.add('hidden');
    G.started = true;
  };
  $('btnHelp').onclick = () => $('help').classList.toggle('hidden');
  $('helpClose').onclick = () => $('help').classList.add('hidden');
  $('tentClose').onclick = () => G.ui.closeTent();
  $('btnNewRun').onclick = () => {
    if (confirm('Set off on a new expedition? A fresh island forms — you keep your masks, zoo, coins and research.')) G.newExpedition();
  };
};

// ----- hearts / stamina / breath -----
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

// floating "+1" popups projected from world space
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

// ----- mask hotbar -----
const MASK_EMOJI = { frog: '🐸', horse: '🐴', croc: '🐊', mouse: '🐭', scorpion: '🦂' };
G.ui.refreshHotbar = function () {
  const bar = $('hotbar');
  bar.innerHTML = '';
  G.MASK_ORDER.forEach((k, i) => {
    const d = document.createElement('div');
    d.className = 'slot';
    const owned = G.meta.masks[k];
    d.innerHTML = '<span class="key">' + (i + 1) + '</span>' + (owned ? MASK_EMOJI[k] : '<span class="unknown">?</span>');
    if (G.player && G.player.mask === k) d.classList.add('active');
    if (!owned) d.classList.add('locked');
    d.onclick = () => G.player.setMask(k);
    bar.appendChild(d);
  });
};
G.ui.showMaskBanner = function (name) {
  const b = $('maskbanner');
  if (name === 'none') { b.classList.remove('show'); return; }
  b.textContent = MASK_EMOJI[name] + ' ' + G.SPECIES[name].name + ' form — ' + G.SPECIES[name].traits;
  b.classList.add('show');
  clearTimeout(G.ui._bt);
  G.ui._bt = setTimeout(() => b.classList.remove('show'), 4000);
};

// ----- study panel (floats over the animal) -----
G.ui.study = function (animal, pct, active) {
  const el = $('studypanel');
  if (!animal) { el.classList.add('hidden'); return; }
  const v = animal.pos.clone(); v.y += 1.6 * animal.mesh.scale.x + 0.8;
  v.project(G.camera);
  if (v.z > 1) { el.classList.add('hidden'); return; }
  el.classList.remove('hidden');
  el.style.left = ((v.x * 0.5 + 0.5) * innerWidth) + 'px';
  el.style.top = ((-v.y * 0.5 + 0.5) * innerHeight) + 'px';
  $('studyname').textContent = animal.sp.emoji + ' ' + animal.sp.name + (animal.stun > 0 ? ' (stunned!)' : '');
  $('studyfill').style.width = pct + '%';
  $('studyhint').textContent = active ? 'studying...' : 'hold E to study';
  el.classList.toggle('active', !!active);
};

// ----- objective line -----
G.ui.objective = function () {
  const m = G.meta;
  let txt;
  if (!m.masks.frog && !m.masks.horse) {
    if ((m.study.horse || 0) > 0 || (m.study.frog || 0) > 0) txt = 'Keep studying! Fill the meter to earn DNA.';
    else txt = 'Explore! Study the horses in the plains or frogs by the ponds (hold E near them).';
  } else if (!m.masks.frog) txt = 'Frogs live by pond shores — their legs would let you smash boulders and reach high ledges.';
  else if (!m.masks.croc) txt = 'The swamp hides crocodiles. Study one from DRY LAND... then craft its mask to rule the water.';
  else if (!m.masks.mouse) txt = 'Mice scurry in the plains. Crouch [C] and be patient — their mask lets you shrink!';
  else if (!m.masks.scorpion) txt = 'Wear the Mouse Mask in the desert to finally study the tiny scorpions.';
  else if (G.zooResidents.length < 5) txt = 'Fully study every species to fill the zoo.';
  else txt = 'The zoo is complete! Guests are pouring in. Explore, or start a new expedition at the tent.';
  $('objective').textContent = txt;
};

// ----- notebook (Tab) -----
G.ui.toggleNotebook = function (force) {
  const nb = $('notebook');
  const show = force !== undefined ? force : nb.classList.contains('hidden');
  nb.classList.toggle('hidden', !show);
  if (!show) return;
  const rows = Object.keys(G.SPECIES).map(k => {
    const sp = G.SPECIES[k];
    const pct = Math.floor(G.meta.study[k] || 0);
    const done = pct >= 100;
    return '<div class="nb-row' + (done ? ' done' : '') + '">' +
      '<div class="nb-head">' + sp.emoji + ' <b>' + sp.name + '</b>' +
      '<span class="nb-pct">' + (done ? '✓ in zoo' : pct + '%') + '</span></div>' +
      '<div class="nb-bar"><div style="width:' + Math.min(100, pct) + '%"></div></div>' +
      '<div class="nb-hint">' + (done ? sp.traits : sp.hint) + '</div>' +
      '</div>';
  }).join('');
  $('nbcontent').innerHTML = rows;
};

// ----- tent menu -----
const UPGRADES = [
  { id: 'journal', name: '📖 Field Journal', cost: 25, desc: 'Study animals 60% faster.' },
  { id: 'boots', name: '🥾 Padded Boots', cost: 30, desc: 'Animals notice you from much closer.' },
  { id: 'canteen', name: '🥤 Explorer Canteen', cost: 40, desc: '+2 max hearts, refills now.' },
  { id: 'poster', name: '🪧 Zoo Poster', cost: 60, desc: 'More guests visit and they pay double.' }
];
G.ui.openTent = function () {
  G.paused = true;
  $('tent').classList.remove('hidden');
  G.ui.renderTent();
};
G.ui.closeTent = function () {
  G.paused = false;
  $('tent').classList.add('hidden');
};
G.ui.renderTent = function () {
  const m = G.meta;
  // masks tab
  $('tentmasks').innerHTML = G.MASK_ORDER.map(k => {
    const sp = G.SPECIES[k];
    const hasDna = m.dna[k], has = m.masks[k];
    let btn;
    if (has) btn = '<span class="owned">crafted ✓</span>';
    else if (hasDna) btn = '<button data-craft="' + k + '">Craft Mask</button>';
    else btn = '<span class="missing">needs DNA — study a ' + sp.name.toLowerCase() + '</span>';
    return '<div class="craftrow' + (has ? ' done' : '') + '">' +
      '<div class="craft-ico">' + MASK_EMOJI[k] + '</div>' +
      '<div class="craft-mid"><b>' + sp.name + ' Mask</b><br><small>' + sp.traits + '</small></div>' +
      '<div class="craft-act">' + btn + '</div></div>';
  }).join('');
  // upgrades tab
  $('tentupgrades').innerHTML = UPGRADES.map(u => {
    const owned = m.upg[u.id];
    const afford = m.coins >= u.cost;
    const btn = owned ? '<span class="owned">owned ✓</span>' :
      '<button data-upg="' + u.id + '"' + (afford ? '' : ' disabled') + '>🪙 ' + u.cost + '</button>';
    return '<div class="craftrow' + (owned ? ' done' : '') + '">' +
      '<div class="craft-mid"><b>' + u.name + '</b><br><small>' + u.desc + '</small></div>' +
      '<div class="craft-act">' + btn + '</div></div>';
  }).join('');
  // zoo tab
  const zooCount = G.zooResidents.length;
  $('tentzoo').innerHTML =
    '<p>🎪 <b>' + zooCount + ' / 5</b> species exhibited &nbsp;•&nbsp; 👥 ' + G.guests.length + ' guests right now</p>' +
    '<p><small>Every fully-studied animal is sent here to the camp zoo. Guests wander in and drop coins while they watch. More species = more guests' + (m.upg.poster ? '' : ' (the Zoo Poster upgrade doubles income)') + '.</small></p>';
  // wire buttons
  $('tent').querySelectorAll('[data-craft]').forEach(b => b.onclick = () => {
    const k = b.dataset.craft;
    m.masks[k] = true;
    G.sfx.jingle();
    G.toast('You crafted the ' + G.SPECIES[k].name + ' Mask! Press ' + (G.MASK_ORDER.indexOf(k) + 1) + ' to wear it.');
    G.save();
    G.ui.refreshHotbar();
    G.ui.renderTent();
  });
  $('tent').querySelectorAll('[data-upg]').forEach(b => b.onclick = () => {
    const u = UPGRADES.find(x => x.id === b.dataset.upg);
    if (m.coins < u.cost) return;
    m.coins -= u.cost;
    m.upg[u.id] = true;
    if (u.id === 'canteen') { G.player.maxHp = 8; G.player.hp = 8; G.ui.refreshHearts(); }
    G.sfx.jingle();
    G.ui.refreshCoins();
    G.save();
    G.ui.renderTent();
  });
};

// ----- prompt line ("E: enter tent" etc) -----
G.ui.prompt = function (txt) {
  const el = $('prompt');
  if (!txt) { el.classList.add('hidden'); return; }
  el.textContent = txt;
  el.classList.remove('hidden');
};

// ----- minimap overlay -----
G.ui.drawMinimap = function (P) {
  const cv = $('map'), ctx = cv.getContext('2d'), N = cv.width;
  ctx.clearRect(0, 0, N, N);
  ctx.drawImage($('mapbase'), 0, 0);
  const toMap = (x, z) => [(x / G.MAP + 0.5) * N, (z / G.MAP + 0.5) * N];
  // tent
  let [tx, ty] = toMap(G.tentPos.x, G.tentPos.z);
  ctx.font = '10px sans-serif';
  ctx.fillText('⛺', tx - 5, ty + 4);
  // player
  const [px, py] = toMap(P.pos.x, P.pos.z);
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(px, py, 4, 0, 7); ctx.fill();
  ctx.fillStyle = '#e8482c';
  ctx.beginPath(); ctx.arc(px, py, 2.6, 0, 7); ctx.fill();
};

// ----- big unlock banner -----
G.ui.bigBanner = function (title, sub) {
  $('bigtitle').textContent = title;
  $('bigsub').textContent = sub;
  const b = $('bigbanner');
  b.classList.remove('hidden');
  b.classList.remove('anim'); void b.offsetWidth; b.classList.add('anim');
  clearTimeout(G.ui._bb);
  G.ui._bb = setTimeout(() => b.classList.add('hidden'), 4200);
};
