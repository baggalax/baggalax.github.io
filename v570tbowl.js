/* v570tbowl.js - TURKEY BOWL special game (Bagga Lax 1.4, Thanksgiving 2026). Kill switch: window.__rl_no570 = true.
 * Charlie: play as the Turkey Trotters, pick 4 other teams from all teams, a small tournament between those 5 teams.
 * Win it for the TURKEY BOWL trophy. Only playable if you bought the Turkey Trotters pack.
 * Format (council): round robin - you play each of your 4 teams once (the other games are simmed), then the top 2 in the
 * table play the TURKEY BOWL final. Win the final = TURKEY BOWL trophy in your trophy case.
 * Switch: Live-Ops specials id mode_tbowl570 (admin). While it is on, the Turkey Trotters team is on too (mode_turkey565).
 * PLAY > SPECIAL GAMES opens it (v569evtbtn themes that button). Test: window.__rl570test = true.
 * New save keys only: rl_tbowl570 (the current run), rl_tbowl570trophy. No ids, old keys or net changes. */
(function () {
 'use strict';
 const W = window;
 if (W.__rl_v570_loaded || W.__rl_no570 || W.__rl_v124gb) return;
 W.__rl_v570_loaded = 1;
 const MID = 'mode_tbowl570', TROPHY = 'trophy_tbowl570', ME = 'TKT', SCR = 'tbowl570';
 const V = W.TBOWL570 = { log: [], err: [], MID: MID, TROPHY: TROPHY };
 const off = () => !!W.__rl_no570;
 const note = s => { V.log.push(s); if (V.log.length > 40) V.log.shift(); };
 const fail = (w, e) => { if (V.err.length < 30) V.err.push(w + ': ' + String(e && e.message || e)); };
 const lsGet = (k, d) => { try { return LS.get(k, d); } catch (e) { return d; } };
 const lsSet = (k, v) => { try { LS.set(k, v); } catch (e) {} };
 const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
 const L = () => W.LIVEOPS && LIVEOPS.ready ? LIVEOPS : null;
 const live = () => { if (off()) return false; if (W.__rl570test) return true; try { const l = L(); return !!(l && l.specialOn(MID)); } catch (e) { return false; } };
 const owns = () => !!lsGet('tk565own', null);
 const ready = () => { try { return typeof GH_REG !== 'undefined' && !!GH_REG[ME]; } catch (e) { return false; } };
 const leftTxt = () => { try { return W.LIVEOPS ? LIVEOPS.leftText(MID) || '' : ''; } catch (e) { return ''; } };
 V.live = live; V.owns = owns;

 // the Turkey Bowl needs the Turkey Trotters: switching the bowl on switches the team on too
 (function hookOn() {
  const l = W.LIVEOPS;
  if (!l || typeof l.specialOn !== 'function') { setTimeout(hookOn, 300); return; }
  if (l.specialOn.__v570) return;
  const s0 = l.specialOn;
  const f = function (id) { const r = s0.apply(this, arguments); if (r || off() || id !== 'mode_turkey565') return r; try { return s0.call(this, MID); } catch (e) { return r; } };
  f.__v570 = 1;
  l.specialOn = f;
 })();

 // ---------- teams ----------
 const tm = id => { try { return T(id); } catch (e) { return { id: id, name: id }; } };
 function pools() {
  const seen = new Set([ ME ]), grp = [];
  const mk = (name, list) => { const out = []; for (const x of list) { const id = x && (x.id || x); if (!id || seen.has(id)) continue; const t = tm(id); if (!t || t.id !== id || !t.name) continue; seen.add(id); out.push(t); } if (out.length) grp.push([ name, out ]); };
  try { mk('PRO', typeof TEAMS !== 'undefined' && Array.isArray(TEAMS) ? TEAMS : []); } catch (e) {}
  try { mk('N/A', Object.keys(typeof GH_REG !== 'undefined' ? GH_REG : {})); } catch (e) {}
  try { mk('COLLEGE', W.COL25 && Array.isArray(COL25.TEAMS) ? COL25.TEAMS : []); } catch (e) {}
  return grp;
 }
 const pool = () => [].concat(...pools().map(g => g[1]));
 V.pool = pool;
 const strength = id => { try { const ps = (tm(id).roster || []).map(i => PLAYERS[i]).filter(Boolean); return ps.reduce((a, p) => a + (p.ovr || 70), 0) / Math.max(1, ps.length); } catch (e) { return 70; } };
 const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
 function simGame(a, b) {
  const pa = Math.max(.2, Math.min(.8, .5 + (strength(a) - strength(b)) / 60));
  const w = Math.random() < pa ? a : b, l = w === a ? b : a;
  const gw = rnd(5, 13), gl = rnd(Math.max(1, gw - 6), gw - 1);
  return { a: a, b: b, ga: w === a ? gw : gl, gb: w === a ? gl : gw };
 }

 // ---------- the run ----------
 let TR = lsGet('tbowl570', null);
 const saveTR = () => lsSet('tbowl570', TR);
 V.state = () => TR;
 function newRun(picks) {
  const [ a, b, c, d ] = picks;
  // rounds: you play a, b, c, d in order; the other games run alongside (5 teams, 10 games)
  TR = { picks: picks.slice(), step: 0, res: [], side: [ [ [ b, c ] ], [ [ c, d ] ], [ [ d, a ] ], [ [ a, b ], [ a, c ], [ b, d ] ] ], fin: null, out: false, won: false, at: Date.now() };
  saveTR();
  note('run ' + picks.join(','));
 }
 function table() {
  const ids = [ ME ].concat(TR.picks), row = {};
  ids.forEach(id => { row[id] = { id: id, w: 0, l: 0, gf: 0, ga: 0 }; });
  for (const g of TR.res) {
   const A = row[g.a], B = row[g.b];
   if (!A || !B) continue;
   A.gf += g.ga; A.ga += g.gb; B.gf += g.gb; B.ga += g.ga;
   if (g.ga > g.gb) { A.w++; B.l++; } else { B.w++; A.l++; }
  }
  return ids.map(id => row[id]).sort((x, y) => y.w - x.w || (y.gf - y.ga) - (x.gf - x.ga) || y.gf - x.gf || (x.id === ME ? -1 : y.id === ME ? 1 : 0));
 }
 V.table = () => TR ? table() : [];
 const rrDone = () => TR && TR.step >= 4;
 function record(win, su, so) {
  if (!TR || TR.won || TR.out) return;
  if (!rrDone()) {
   const op = TR.picks[TR.step];
   let gu = su | 0, go = so | 0;
   if (win && gu <= go) gu = go + 1;
   if (!win && go <= gu) go = gu + 1;
   TR.res.push({ a: ME, b: op, ga: gu, gb: go, me: 1 });
   for (const p of TR.side[TR.step] || []) TR.res.push(simGame(p[0], p[1]));
   TR.step++;
   if (rrDone()) {
    const t = table(), top = [ t[0].id, t[1].id ];
    TR.fin = { a: top[0], b: top[1], ga: null, gb: null };
    if (top.indexOf(ME) < 0) {
     const g = simGame(top[0], top[1]);
     TR.fin.ga = g.ga; TR.fin.gb = g.gb; TR.out = true;
    }
   }
  } else if (TR.fin && TR.fin.ga == null) {
   const meA = TR.fin.a === ME;
   let gu = su | 0, go = so | 0;
   if (win && gu <= go) gu = go + 1;
   if (!win && go <= gu) go = gu + 1;
   TR.fin.ga = meA ? gu : go; TR.fin.gb = meA ? go : gu;
   if (win) TR.won = true; else TR.out = true;
  }
  saveTR();
  if (TR.won) giveTrophy();
 }
 V.record = record;
 function giveTrophy() {
  try {
   if (Array.isArray(V17.I) && !V17.I.some(it => it.id === TROPHY)) V17.I.push(V17.BY[TROPHY]);
   V17.award(TROPHY);
   const t0 = lsGet('tbowl570trophy', null);
   lsSet('tbowl570trophy', { at: t0 && t0.at || Date.now(), wins: (t0 && t0.wins || 0) + 1 });
   note('trophy');
  } catch (e) { fail('trophy', e); }
 }
 function nextOpp() {
  if (!TR || TR.won || TR.out) return null;
  if (!rrDone()) return TR.picks[TR.step];
  if (TR.fin && TR.fin.ga == null) return TR.fin.a === ME ? TR.fin.b : TR.fin.a;
  return null;
 }
 let liveGame = null, back = false;
 function playStep() {
  const op = nextOpp();
  if (!op || !live() || !owns() || !ready()) return;
  const step = rrDone() ? 'f' : TR.step;
  try { menuSel.team = ME; menuSel.opp = op; menuSel.home = true; } catch (e) {}
  try {
   newGame(ME, op, 'quick', true);
   if (typeof game !== 'undefined' && game) { game.tbowl570 = { step: step }; liveGame = game; }
  } catch (e) { fail('play', e); }
 }
 V.playStep = playStep;
 try {
  const GO0 = V17.gameOver;
  if (typeof GO0 === 'function') V17.gameOver = function (G, win) {
   const r = GO0.apply(this, arguments);
   try {
    if (!off() && G && G.tbowl570 && G === liveGame && TR) {
     const step = rrDone() ? 'f' : TR.step;
     if (step === G.tbowl570.step) { record(!!win, G.score && G.score[0], G.score && G.score[1]); back = true; liveGame = null; }
    }
   } catch (e) { fail('over', e); }
   return r;
  };
 } catch (e) { fail('gameover', e); }

 // ---------- trophy item + icon ----------
 function trophyIcon(sil) {
  const cv = document.createElement('canvas'); cv.width = 20; cv.height = 20;
  const x = cv.getContext('2d');
  const r = (a, b, w, h, c) => { x.fillStyle = sil ? '#06080c' : c; x.fillRect(a, b, w, h); };
  const O = '#2a1606', G = '#f2c230', H = '#fff2a8', D = '#b07a12', R = '#c8102e', B = '#8a5a2b', Bn = '#f4ecd8';
  // the bowl
  r(2, 6, 16, 1, O); r(3, 7, 14, 4, O); r(4, 11, 12, 2, O); r(6, 13, 8, 1, O);
  r(3, 7, 14, 3, G); r(4, 10, 12, 2, G); r(6, 12, 8, 1, D); r(4, 7, 3, 1, H); r(4, 8, 1, 2, H); r(14, 8, 2, 3, D);
  // red ribbon band
  r(3, 9, 14, 1, R);
  // stem + base
  r(9, 14, 2, 2, O); r(9, 14, 2, 1, D); r(6, 16, 8, 3, O); r(7, 16, 6, 2, G); r(7, 16, 3, 1, H);
  // a drumstick resting in the bowl
  r(7, 3, 5, 4, O); r(8, 3, 3, 3, B); r(8, 3, 1, 1, '#c9733a'); r(12, 2, 2, 2, O); r(12, 2, 1, 1, Bn); r(13, 1, 2, 2, Bn); r(11, 4, 2, 1, Bn);
  return cv;
 }
 function items() {
  try {
   if (!W.V17 || !V17.BY) return false;
   if (!V17.BY[TROPHY]) V17.BY[TROPHY] = { id: TROPHY, n: 'TURKEY BOWL', sec: 'trophy', rar: 2, x489: 1, trophy: true, b2504: 1, tbowl570: 1,
    d: 'THANKSGIVING. WON THE TURKEY BOWL WITH THE TURKEY TROTTERS - 4 ROUND ROBIN GAMES, THEN THE FINAL.' };
   const S = V17.ST && V17.ST(), have = !!(S && S.trophies && S.trophies[TROPHY]);
   if (Array.isArray(V17.I) && (live() || have) && !V17.I.some(it => it.id === TROPHY)) V17.I.push(V17.BY[TROPHY]);
   const X = W.UNI21X;
   if (X && X.icon && !X.icon.__v570) {
    const i0 = X.icon;
    X.icon = function (it, sil) { return it && it.id === TROPHY ? trophyIcon(sil) : i0.apply(this, arguments); };
    X.icon.__v570 = 1;
   }
   return true;
  } catch (e) { fail('items', e); return false; }
 }

 // ---------- the screen ----------
 let pickSel = [];
 const badge = t => { try { return badgeUrl(t); } catch (e) { return ''; } };
 const nm = id => esc(tm(id).name || id);
 function css() {
  if (document.getElementById('tb570css')) return;
  const s = document.createElement('style');
  s.id = 'tb570css';
  s.textContent = '.tb570{margin:4px 8px}.tb570 .pick{display:grid;grid-template-columns:repeat(4,1fr);gap:5px}' +
   '.tb570 .pick button{display:flex;align-items:center;gap:5px;font:inherit;font-size:10px;padding:4px;border:2px solid #000;background:#2a1a0e;color:#f4ecd8;text-align:left}' +
   '.tb570 .pick button.on{background:#c8641e;color:#fff3c4;box-shadow:inset 0 0 0 2px #f2c230}.tb570 img{image-rendering:pixelated}.tb570 .pick img{width:22px;height:26px}' +
   '.tb570 .row{display:flex;gap:8px;align-items:flex-start;justify-content:center;flex-wrap:wrap}.tb570 table{border-collapse:collapse;font-size:10px;background:#1e140b;border:2px solid #8a3a12}' +
   '.tb570 th{color:#f2c230;font-weight:normal;padding:2px 5px;background:#3a2210}.tb570 td{padding:2px 5px;color:#f4ecd8;text-align:center}.tb570 td.t{text-align:left;display:flex;align-items:center;gap:4px}' +
   '.tb570 td img{width:12px;height:14px}.tb570 tr.me td{color:#fff3c4;font-weight:bold}.tb570 tr.top td:first-child{color:#7dff7a}' +
   '.tb570 .gm{font-size:10px;color:#f4ecd8;background:#1e140b;border:2px solid #8a3a12;padding:3px 6px;min-width:150px}.tb570 .gm h4{margin:0 0 2px;font-size:9px;color:#f2c230}' +
   '.tb570 .gm div{display:flex;justify-content:space-between;gap:6px}.tb570 .gm .w{color:#7dff7a}.tb570 .go{display:flex;justify-content:center;gap:8px;margin:7px}' +
   '.tb570 .fin{text-align:center;margin:4px}.tb570 .fin b{color:#f2c230;font-size:14px}.tb570 .fin img{width:44px;height:44px}.tb570 .lk{text-align:center;color:#f4ecd8;margin:8px;font-size:11px}' +
   '.tg570{color:#f2c230}';
  document.head.appendChild(s);
 }
 const trophyUrl = () => { try { return V17.iconUrl(TROPHY); } catch (e) { return ''; } };
 function hd(sub) {
  const tag = live() && leftTxt() ? ' <span class="tg570">' + leftTxt() + '</span>' : '';
  return '<div class="hd"><div><div class="tt">TURKEY BOWL' + tag + '</div><div class="st">' + sub + '</div></div><div class="sp"></div><button type="button" class="g" data-a="tb570back" aria-label="BACK">BACK</button></div>';
 }
 function tableHtml() {
  const t = table();
  return '<table><tr><th>#</th><th style="text-align:left">TEAM</th><th>W</th><th>L</th><th>GF</th><th>GA</th></tr>' + t.map((r, i) =>
   '<tr class="' + (r.id === ME ? 'me ' : '') + (i < 2 && rrDone() ? 'top' : '') + '"><td>' + (i + 1) + '</td><td class="t"><img alt="" src="' + badge(tm(r.id)) + '">' + nm(r.id) + '</td><td>' + r.w + '</td><td>' + r.l + '</td><td>' + r.gf + '</td><td>' + r.ga + '</td></tr>').join('') + '</table>';
 }
 function gamesHtml() {
  const mine = TR.res.filter(g => g.me);
  const rows = TR.picks.map((op, i) => {
   const g = mine[i];
   return '<div><span>' + (i + 1) + '. VS ' + nm(op) + '</span>' + (g ? '<span class="' + (g.ga > g.gb ? 'w' : '') + '">' + (g.ga > g.gb ? 'W ' : 'L ') + g.ga + '-' + g.gb + '</span>' : '<span style="opacity:.5">' + (i === TR.step ? 'NEXT' : '-') + '</span>') + '</div>';
  }).join('');
  let fin = '<div><span>FINAL</span><span style="opacity:.5">TOP 2</span></div>';
  if (TR.fin) {
   const f = TR.fin, done = f.ga != null, wa = done && f.ga > f.gb;
   fin = '<div><span>FINAL: ' + nm(f.a) + ' VS ' + nm(f.b) + '</span>' + (done ? '<span class="w">' + nm(wa ? f.a : f.b) + ' ' + Math.max(f.ga, f.gb) + '-' + Math.min(f.ga, f.gb) + '</span>' : '<span style="opacity:.5">NEXT</span>') + '</div>';
  }
  return '<div class="gm"><h4>YOUR GAMES</h4>' + rows + fin + '</div>';
 }
 function render() {
  css();
  if (off()) return hd('');
  if (!live() && !(TR && TR.won)) return hd('THE TURKEY BOWL IS OVER - THANKS FOR PLAYING. YOUR TROPHY STAYS YOURS.');
  if (!owns()) return hd('LOCKED - ONLY FOR TURKEY TROTTERS PACK OWNERS') + '<div class="tb570"><div class="lk">GET THE TURKEY TROTTERS PACK IN THE YARD SALE TO PLAY THE TURKEY BOWL.</div><div class="go"><button type="button" class="y" data-a="tb570shop" aria-label="GET THE TURKEY TROTTERS PACK">GET THE TURKEY TROTTERS PACK</button></div></div>';
  if (!ready()) return hd('LOADING THE TURKEY TROTTERS...');
  if (TR && TR.won) return hd('CHAMPIONS!') + '<div class="scroll tb570"><div class="fin"><img alt="" src="' + trophyUrl() + '"><br><b>TURKEY BOWL CHAMPIONS</b><div>THE TURKEY BOWL TROPHY IS IN YOUR TROPHY CASE</div></div><div class="row">' + tableHtml() + gamesHtml() + '</div>' +
   (live() ? '<div class="go"><button type="button" class="y" data-a="tb570new" aria-label="PLAY AGAIN">PLAY AGAIN</button></div>' : '') + '</div>';
  if (!TR) {
   const btn = t => '<button type="button" class="' + (pickSel.indexOf(t.id) >= 0 ? 'on' : '') + '" data-a="tb570pick" data-v="' + esc(t.id) + '" aria-label="' + esc(t.name) + '"><img alt="" src="' + badge(t) + '">' + esc(t.name) + '</button>';
   const btns = pools().map(g => '<div class="sh17">' + g[0] + '</div><div class="pick">' + g[1].map(btn).join('') + '</div>').join('');
   const n = pickSel.length;
   return hd('YOU ARE THE TURKEY TROTTERS. PICK 4 TEAMS (' + n + '/4) - PLAY EACH ONCE, TOP 2 PLAY THE TURKEY BOWL FINAL') +
    '<div class="tb570"><div class="go"><button type="button" class="' + (n === 4 ? 'y' : 'd') + '" data-a="tb570start" aria-label="START THE TURKEY BOWL">START</button>' + (n ? '<button type="button" class="g" data-a="tb570clear" aria-label="CLEAR">CLEAR</button>' : '') + '</div></div><div class="scroll tb570">' + btns + '</div>';
  }
  const op = nextOpp();
  let sub, go;
  if (TR.out) {
   sub = rrDone() && TR.fin && TR.fin.a !== ME && TR.fin.b !== ME ? 'NOT IN THE TOP 2 - NO FINAL THIS TIME' : 'LOST THE FINAL - SO CLOSE';
   go = '<button type="button" class="y" data-a="tb570new" aria-label="TRY AGAIN">TRY AGAIN</button>';
  } else {
   const what = rrDone() ? 'THE TURKEY BOWL FINAL' : 'GAME ' + (TR.step + 1) + ' OF 4';
   sub = 'NEXT: ' + what + ' VS ' + nm(op);
   go = '<button type="button" class="y" data-a="tb570play" aria-label="PLAY">PLAY ' + (rrDone() ? 'THE FINAL' : 'GAME ' + (TR.step + 1)) + '</button><button type="button" class="d" data-a="tb570new" aria-label="NEW TEAMS">NEW TEAMS</button>';
  }
  return hd(sub) + '<div class="scroll tb570"><div class="row">' + tableHtml() + gamesHtml() + '</div><div class="go">' + go + '</div></div>';
 }
 V.render = render;
 let backTo = 'menu';
 function open() {
  if (off()) return;
  try { if (screen !== SCR) backTo = /17$/.test(screen) ? 'shop17' : 'menu'; } catch (e) {}
  screen = SCR;
  try { panelDirty(); } catch (e) {}
 }
 V.open = open;
 function panel() {
  try {
   if (typeof PANEL_RENDER !== 'object' || typeof PANEL_ACT !== 'object') return false;
   PANEL_RENDER[SCR] = render;
   if (typeof PANEL_SCREENS !== 'undefined' && Array.isArray(PANEL_SCREENS) && PANEL_SCREENS.indexOf(SCR) < 0) PANEL_SCREENS.push(SCR);
   Object.assign(PANEL_ACT, {
    tb570back() { screen = backTo === 'shop17' ? 'shop17' : 'menu'; },
    tb570shop() { try { V17.openShop(); } catch (e) { screen = 'shop17'; } },
    tb570pick(v) { const i = pickSel.indexOf(v); if (i >= 0) pickSel.splice(i, 1); else if (pickSel.length < 4) pickSel.push(v); else { try { V17.toast('4 TEAMS PICKED - TAP ONE TO SWAP IT OUT', '#f2c230'); } catch (e) {} } },
    tb570clear() { pickSel = []; },
    tb570start() { if (pickSel.length === 4 && owns() && live()) { newRun(pickSel); pickSel = []; } else { try { V17.toast('PICK 4 TEAMS FIRST', '#f2c230'); } catch (e) {} } },
    tb570new() { TR = null; saveTR(); },
    tb570play() { playStep(); }
   });
   return true;
  } catch (e) { fail('panel', e); return false; }
 }
 // theme for the SPECIAL GAMES button (v569evtbtn)
 function theme() {
  if (!W.EVT569 || EVT569.get(MID)) return !!W.EVT569;
  EVT569.reg(MID, { name: 'TURKEY BOWL', short: 'TURKEY BOWL', bg: '#c8641e', bg2: '#a84c12', fg: '#fff3c4', shadow: '#4a1e06', sub: '#ffe9a8', pattern: 'plaid', icon: 'drumstick', open: open });
  return true;
 }
 // ---------- hello when the app opens: the pack in the shop + the Turkey Bowl (once each per event) ----------
 function hello() {
  try {
   if (off() || document.getElementById('tb570pop') || document.getElementById('vets489pop')) return;
   if (typeof screen === 'undefined' || screen !== 'menu') return;
   try { if (typeof game !== 'undefined' && game) return; } catch (e) {}
   try { if (W.M37 && M37.page && M37.page !== 'home') return; } catch (e) {}
   try { if (W.V490 && V490.active && V490.active()) return; } catch (e) {}
   if (W.__rl_safeTest == null && document.querySelector('.intro,#intro30')) return;
   const l = L(); if (!l) return;
   const bowl = live(), pack = !owns() && (() => { try { return l.shopOn('pack_turkey565'); } catch (e) { return false; } })();
   const seen = lsGet('tbowl570pop', null) || {};
   const what = bowl && !seen.bowl ? 'bowl' : pack && !seen.pack && !bowl ? 'pack' : null;
   if (!what) return;
   seen[what] = Date.now(); if (what === 'bowl' && !owns()) seen.pack = Date.now();
   lsSet('tbowl570pop', seen);
   const art = (() => { try { return W.TK565 && TK565.packArt ? TK565.packArt() : ''; } catch (e) { return ''; } })();
   const d = document.createElement('div');
   d.id = 'tb570pop'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', what === 'bowl' ? 'TURKEY BOWL' : 'TURKEY TROTTERS PACK');
   const own = owns(), t = leftTxt();
   const title = what === 'bowl' ? 'THANKSGIVING: THE TURKEY BOWL IS HERE!' : 'THANKSGIVING: TURKEY TROTTERS PACK!';
   const body = what === 'bowl'
    ? 'PLAY AS THE TURKEY TROTTERS VS 4 TEAMS YOU PICK. PLAY EACH ONCE, TOP 2 PLAY THE FINAL. WIN IT FOR THE TURKEY BOWL TROPHY. ' + (own ? 'PLAY > SPECIAL GAMES.' : 'GET THE TURKEY TROTTERS PACK IN THE YARD SALE TO PLAY.')
    : 'NEW IN THE YARD SALE: THE TURKEY TROTTERS N/A TEAM, TURKEY LEG STICK, CHICKEN DANCE CELLY + 6 PLAYER CARDS.';
   const go = what === 'bowl' && own ? '<button type="button" data-p="bowl">PLAY TURKEY BOWL</button>' : '<button type="button" data-p="shop">SEE THE PACK</button>';
   d.innerHTML = '<div class="bx"><div class="st"></div>' + (art ? '<img alt="" src="' + art + '" style="width:54px;height:72px;image-rendering:pixelated">' : '') + '<b>' + title + '</b><p>' + body + (t ? ' ' + esc(t) + '.' : '') + '</p>' + go + '<button type="button" class="g" data-p="ok">OK</button></div>';
   const st = document.createElement('style');
   st.textContent = '#tb570pop{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.66);padding:10px max(14px,env(safe-area-inset-right)) 10px max(14px,env(safe-area-inset-left));font:bold 12px/1.3 ui-monospace,Menlo,Consolas,monospace}' +
    '#tb570pop .bx{max-width:420px;width:100%;background:linear-gradient(180deg,#8a3a12,#2a1606 75%);border:3px solid #f2c230;box-shadow:0 0 0 3px #000,0 0 18px rgba(242,194,48,.55);padding:12px 14px;text-align:center;color:#fff3c4}' +
    '#tb570pop .st{height:8px;background:repeating-linear-gradient(90deg,#c8641e 0 12px,#f2c230 12px 18px,#a84c12 18px 30px);margin:-12px -14px 10px}' +
    '#tb570pop b{display:block;font-size:16px;color:#f2c230;letter-spacing:1px;margin:6px 0}#tb570pop p{margin:0 0 10px;font-size:11px;color:#ffe9c4}' +
    '#tb570pop button{font:inherit;font-weight:bold;font-size:13px;padding:8px 14px;margin:0 4px;border:2px solid #000;background:#f2c230;color:#2a1606;cursor:pointer}#tb570pop button.g{background:#c9d6d9}';
   d.appendChild(st);
   d.addEventListener('click', ev => {
    const b = ev.target.closest && ev.target.closest('button');
    if (!b && ev.target !== d) return;
    ev.preventDefault(); ev.stopPropagation();
    d.remove();
    if (b && b.dataset.p === 'shop') { try { V17.openShop(); } catch (e) { screen = 'shop17'; } }
    if (b && b.dataset.p === 'bowl') open();
   });
   document.body.appendChild(d);
  } catch (e) { fail('hello', e); }
 }
 V.hello = hello;
 let okP = false, okT = false;
 (function loop() {
  try {
   if (!okP) okP = panel();
   if (!okT) okT = theme();
   items();
   hello();
   if (back && typeof screen !== 'undefined' && screen === 'menu') { back = false; backTo = 'menu'; screen = SCR; try { panelDirty(); } catch (e) {} }
  } catch (e) { fail('loop', e); }
  setTimeout(loop, 300);
 })();
 note('ready');
})();
