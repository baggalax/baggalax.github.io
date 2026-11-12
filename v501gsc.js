/* v501gsc.js - Good Stick Co. collab (Bagga Lax 1.3).
   Team id GSC lives in the COLLAB group (quick play and every uniform tab).
   Pack visibility and the roster come from LIVEOPS (config/liveops.json). Hidden unless that config lists pack_goodstick.
   Kill switch: window.__rl_no501gsc = true */
(function () {
 'use strict';
 const win = window;
 if (win.__rl_no501gsc || win.GSC501 || typeof GH_REG === 'undefined' || !win.V17) return;
 const ID = 'GSC';
 const V = win.GSC501 = { log: [], err: [] };
 const note = s => { V.log.push(s); if (V.log.length > 40) V.log.shift(); };
 const fail = (w, e) => { V.err.push(w + ': ' + (e && e.message || e)); };
 const off = () => !!win.__rl_no501gsc;
 const on = () => !off();
 V.on = on;
 V.ids = () => off() || !GH_REG[ID] ? [] : [ ID ];

 // Petr's roster is final. O maps to attack. Pimpi is the faceoff man. Brian and Gecko are midfield.
 // The on-field unit needs 3 attack, 3 midfield, 3 defense, a long-stick mid, two short-stick d-middies, a faceoff man and a goalie,
 // and the other special teams carry 20 so subs have a bench. The 10 names below fill that out. filler:true is not a real Good Stick player.
 const REAL = [
  { name: 'PEPCA', number: 7, position: 'A', starter: true },
  { name: 'JACK', number: 9, position: 'A', starter: true },
  { name: 'TOPPER', number: 11, position: 'A', starter: true },
  { name: 'BRIAN', number: 22, position: 'M', starter: true },
  { name: 'GECKO', number: 23, position: 'M', starter: true },
  { name: 'PIMPI', number: 4, position: 'FO', starter: true },
  { name: 'STUCKIE', number: 33, position: 'D', starter: true },
  { name: 'BARKY', number: 44, position: 'D', starter: true },
  { name: 'MAXIM', number: 55, position: 'D', starter: true },
  { name: 'KACKA', number: 1, position: 'G', starter: true }
 ];
 // Made-up nicknames, same spots and numbers as the old bench fillers. Not real players.
 const FILL = [
  { name: 'RICO', number: 80, position: 'A', filler: true },
  { name: 'NICO', number: 81, position: 'A', filler: true },
  { name: 'THEO', number: 82, position: 'A', filler: true },
  { name: 'LENNY', number: 83, position: 'M', filler: true },
  { name: 'CRUZ', number: 84, position: 'M', filler: true },
  { name: 'REMY', number: 85, position: 'M', filler: true },
  { name: 'HANK', number: 86, position: 'D', filler: true },
  { name: 'DAX', number: 87, position: 'D', filler: true },
  { name: 'SULLY', number: 88, position: 'LSM', filler: true },
  { name: 'OTTO', number: 89, position: 'G', filler: true }
 ];
 const posOf = s => {
  const p = String(s || '').toUpperCase().trim();
  if (p === 'A' || p === 'O' || p === 'OFFENSE' || p === 'ATTACK') return 'A';
  if (p === 'M' || p === 'MID' || p === 'MIDFIELD') return 'M';
  if (p === 'D' || p === 'DEFENSE' || p === 'DEFENCE') return 'D';
  if (p === 'FO' || p === 'F' || p === 'FACEOFF') return 'FO';
  if (p === 'G' || p === 'GOALIE') return 'G';
  if (p === 'LSM') return 'LSM';
  return '';
 };
 function defaultRoster() {
  return REAL.concat(FILL).map(r => ({ name: r.name, number: r.number, position: r.position, filler: !!r.filler, starter: !!r.starter }));
 }
 V.defaultRoster = defaultRoster;
 V.fillers = () => defaultRoster().filter(r => r.filler).map(r => r.name);
 function rosterRows() {
  const base = defaultRoster();
  let rows = base.slice();
  try {
   const g = win.LIVEOPS && LIVEOPS.goodstick && LIVEOPS.goodstick();
   const r = g && Array.isArray(g.roster) ? g.roster : null;
   if (r && r.length) {
    const ok = [];
    for (const row of r) {
     if (!row || typeof row !== 'object') continue;
     const name = String(row.name || row.n || '').trim().slice(0, 16).toUpperCase();
     const position = posOf(row.position || row.pos);
     if (!name || !position) continue;
     const num = row.number != null ? row.number : row.num;
     const item = { name: name, number: Math.max(0, Math.min(99, num | 0)), position: position, filler: !!row.filler };
     if (row.starter === true) item.starter = true;
     else if (row.starter === false) item.starter = false;
     ok.push(item);
     if (ok.length >= 20) break;
    }
    if (ok.length) {
     const used = new Set(ok.map(x => x.name));
     for (const extra of base) if (ok.length < 20 && !used.has(extra.name)) ok.push(Object.assign({}, extra));
     rows = ok.slice(0, 20);
    }
   }
  } catch (e) { fail('roster', e); }
  return withStarters(rows);
 }
 // starter:true wins. With no flags at all, roster order picks the first 3 attack, first 2 midfield, first 3 defense, first faceoff and first goalie.
 function withStarters(rows) {
  const explicit = rows.some(r => r.starter === true || r.starter === false);
  const seen = { A: 0, M: 0, D: 0, G: 0, FO: 0, LSM: 0 };
  const cap = { A: 3, M: 2, D: 3, G: 1, FO: 1, LSM: 0 };
  return rows.map(r => {
   let starter;
   if (r.starter === true) starter = true;
   else if (r.starter === false) starter = false;
   else if (!explicit) { starter = seen[r.position] < cap[r.position]; seen[r.position]++; }
   else starter = false;
   return Object.assign({}, r, { starter: starter });
  });
 }
 function lineupFrom(rows) {
  const players = rows.map((r, i) => ({ id: ID + '-' + i, i: i, position: r.position, starter: !!r.starter }));
  const used = new Set();
  const rank = list => list.slice().sort((a, b) => a.starter === b.starter ? a.i - b.i : a.starter ? -1 : 1);
  const pool = pos => players.filter(p => p.position === pos);
  const take = (n, positions) => {
   const out = [];
   for (const pos of positions) for (const p of rank(pool(pos))) {
    if (out.length >= n) return out;
    if (used.has(p.id)) continue;
    out.push(p.id);
    used.add(p.id);
   }
   for (const p of rank(players)) {
    if (out.length >= n) break;
    if (used.has(p.id) || p.position === 'G') continue;
    out.push(p.id);
    used.add(p.id);
   }
   return out;
  };
  const Gid = take(1, [ 'G' ])[0];
  const A = take(3, [ 'A' ]);
  const M = take(3, [ 'M' ]);
  const D = take(3, [ 'D' ]);
  const LSM = take(1, [ 'LSM', 'D' ])[0];
  const ss = take(2, [ 'M', 'A', 'FO', 'D' ]);
  const FO = take(1, [ 'FO', 'M' ])[0];
  return { A: A, M: M, D: D, LSM: LSM, SSDM: ss[0], SSDM2: ss[1], FO: FO, G: Gid };
 }
 V.lineup = () => lineupFrom(rosterRows());
 function rateGsc(p, starter) {
  if (!p || !p.gscBase || typeof SKILLS === 'undefined') return;
  SKILLS.forEach(k => { p.r[k] = Math.max(35, (p.gscBase[k] || 70) - (starter ? 0 : 8)); });
  p.ovr = typeof ovrOf === 'function' ? ovrOf(p) : 72;
 }
 function buildTeam() {
  try {
   if (GH_REG[ID]) return;
   const rows = rosterRows();
   let src = [];
   try {
    const ovr = t => { const ps = (t.roster || []).map(id => PLAYERS[id]).filter(Boolean); return ps.length ? ps.reduce((a, p) => a + (p.ovr || 0), 0) / ps.length : 0; };
    const mid = TEAMS.slice().sort((a, b) => ovr(a) - ovr(b))[Math.floor(TEAMS.length / 2)];
    src = (mid && mid.roster || []).map(id => PLAYERS[id]).filter(Boolean);
   } catch (e) {}
   const by = {};
   for (const p of src) (by[p.pos] = by[p.pos] || []).push(p);
   const tm = {
    id: ID, abbr: 'GSC', name: 'GOOD STICK CO.', full: 'The Good Stick Co.', city: 'COLLAB', lg: 'COLLAB', era: 'COLLAB',
    c1: '#c5c8ce', c2: '#141418', icon: [ '..#..', '.###.', '..#..', '..#..', '.###.', '##.##', '.###.' ],
    coach: '', off: 4, def: 4, gsc501: true, roster: []
   };
   const used = {};
   tm.roster = rows.map((row, i) => {
    const pool = by[row.position] && by[row.position].length ? by[row.position] : src;
    const sp = pool.length ? pool[(used[row.position] = (used[row.position] || 0) + 1) % pool.length] : null;
    const p = { id: ID + '-' + i, n: row.name, pos: row.position, r: {}, real: false, team: ID, gsc501: true, gscFiller: !!row.filler, gscStarter: !!row.starter, nocard486: true, wnum: row.number, skin: i % 6 };
    p.gscBase = {};
    if (typeof SKILLS !== 'undefined') SKILLS.forEach(k => { p.gscBase[k] = p.r[k] = sp && sp.r && sp.r[k] != null ? sp.r[k] : 72; });
    rateGsc(p, !!row.starter);
    PLAYERS[p.id] = p;
    return p.id;
   });
   GH_REG[ID] = tm;
   V.team = tm;
   note('team ' + tm.roster.length);
  } catch (e) { fail('team', e); }
 }
 buildTeam();
 V.applyRoster = () => {
  try {
   const tm = GH_REG[ID];
   if (!tm) return;
   const rows = rosterRows();
   rows.forEach((row, i) => {
    const p = PLAYERS[ID + '-' + i];
    if (!p) return;
    p.n = row.name;
    p.pos = row.position;
    p.wnum = row.number;
    p.gscFiller = !!row.filler;
    p.gscStarter = !!row.starter;
    rateGsc(p, !!row.starter);
    try {
     const card = V17.BY && V17.BY['gscard_' + i];
     if (card) {
      card.n = row.name;
      card.d = 'GOOD STICK CO. PLAYER CARD. ' + row.position + ' #' + row.number + '. COLLAB - LEGENDARY LOOK.';
     }
    } catch (e) {}
   });
  } catch (e) { fail('apply', e); }
 };

 const HOME = { jersey: '#c5c8ce', trim: '#141418', helm: '#f7f7f8', shorts: '#141418', acc: '#f4f4f4', g27: 'gscH' };
 const AWAY = { jersey: '#f7f7f8', trim: '#141418', helm: '#f7f7f8', shorts: '#f4f4f4', acc: '#141418', g27: 'gscA' };
 function kitOf(k) { return Object.assign({}, (k | 0) === 1 ? AWAY : HOME); }
 const prevX = win.UNI21X;
 win.UNI21X = {
  own: tid => !!(prevX && prevX.own && prevX.own(tid)) || (!off() && tid === ID && !!GH_REG[ID]),
  nK: tid => tid === ID ? 2 : prevX && prevX.nK ? prevX.nK(tid) : 2,
  styN: (tid, k) => tid === ID ? ((k | 0) === 1 ? 'AWAY' : 'HOME') : prevX && prevX.styN ? prevX.styN(tid, k) : 'BASIC',
  kitOf: (tid, k) => tid === ID ? kitOf(k) : prevX && prevX.kitOf ? prevX.kitOf(tid, k) : null,
  lockerTeams: () => {
   const a = prevX && prevX.lockerTeams ? prevX.lockerTeams() : [];
   if (!off() && GH_REG[ID] && a.indexOf(ID) < 0) a.push(ID);
   return a;
  },
  icon: (it, sil) => prevX && prevX.icon ? prevX.icon(it, sil) : null
 };

 try {
  const B0 = win.badge;
  if (typeof B0 === 'function') win.badge = function (team, x, y, sc) {
   if (off() || !team || team.id !== ID) return B0.apply(this, arguments);
   sc = sc || 1;
   const w = 13, h = 15;
   for (let r = 0; r < h; r++) {
    const inset = r < 9 ? 0 : r - 8;
    for (let c = inset; c < w - inset; c++) {
     const edge = r === 0 || c === inset || c === w - 1 - inset || r === h - 1;
     g.fillStyle = edge ? '#f4f4f4' : '#141418';
     g.fillRect(Math.round(x) + c * sc, Math.round(y) + r * sc, sc, sc);
    }
   }
   g.fillStyle = '#f4f4f4';
   const ix = Math.round(x) + 6 * sc, iy = Math.round(y) + 2 * sc;
   g.fillRect(ix, iy, sc, 6 * sc);
   g.fillRect(ix - 2 * sc, iy, 5 * sc, sc);
   g.fillRect(ix - sc, iy + 5 * sc, 3 * sc, sc);
   if (sc >= 2) drawText('GSC', Math.round(x) + 6.5 * sc - textW('GSC', 1) / 2, Math.round(y) + 8 * sc, 1, '#f4f4f4');
  };
 } catch (e) { fail('badge', e); }

 try {
  if (win.RL12) {
   const g0 = RL12.g27;
   RL12.g27 = function (kit, ch, q, r, rows) {
    try {
     if (!off() && kit && (kit.g27 === 'gscH' || kit.g27 === 'gscA') && rows && ch && ch !== '.') {
      const sleeve = kit.g27 === 'gscH' ? '#b7bcc4' : '#e6e8ec';
      const jersey = kit.g27 === 'gscH' ? '#c5c8ce' : '#f7f7f8';
      let jTop = 0;
      for (let i = 0; i < rows.length; i++) if (/[Jj]/.test(rows[i])) { jTop = i; break; }
      const skin = ch === 'S' || ch === 's' || ch === 'Z';
      if (skin && r >= jTop && r < jTop + 7) {
       const row = rows[r] || '';
       const left = row[q - 1], right = row[q + 1];
       if (left === 'J' || left === 'j' || right === 'J' || right === 'j' || ch === 'S') return ch === 's' ? '#9aa1ab' : sleeve;
      }
      if ((ch === 'J' || ch === 'j') && r >= jTop + 1 && r <= jTop + 4 && q >= 5 && q <= 11) {
       const cx = 8, cy = jTop + 2;
       const d = Math.abs(q - cx) + Math.abs(r - cy);
       if (d <= 2) return '#141418';
       if (q === cx && r >= cy - 1 && r <= cy + 1) return '#f4f4f4';
       if (r === cy - 1 && q >= cx - 1 && q <= cx + 1) return '#f4f4f4';
      }
      if (ch === 'K' || ch === 'k') return kit.g27 === 'gscH' ? '#141418' : '#1b1b1f';
      if (ch === 'W' || ch === 'v') return '#f4f4f4';
      void jersey;
     }
    } catch (e) {}
    return g0 ? g0.apply(this, arguments) : null;
   };
  }
 } catch (e) { fail('g27', e); }

 const ST = () => { try { return V17.ST(); } catch (e) { return null; } };
 const owned = () => {
  try { if (win.LS && LS.get('gsc501own', null)) return true; } catch (e) {}
  const s = ST();
  return !!(s && s.inv && s.inv.gsc_team > 0);
 };
 V.owned = owned;
 const followed = () => { try { return !!(win.LS && LS.get('gsc501follow', null)); } catch (e) { return false; } };
 V.price = () => {
  try {
   const p = win.LIVEOPS && LIVEOPS.price && LIVEOPS.price('pack_goodstick');
   if (p != null) return p;
  } catch (e) {}
  return followed() ? 15 : 20;
 };
 const packOn = () => {
  try { if (win.LIVEOPS && LIVEOPS.ready && LIVEOPS.shopOn) return !!LIVEOPS.shopOn('pack_goodstick'); } catch (e) {}
  return false;
 };
 V.packOn = packOn;

 function addGear() {
  const BY = V17.BY;
  if (!BY) return;
  const put = it => { it.collab = 1; it.gsc501 = 1; it.b2504 = 1; it.dispRar = 'COLLAB'; BY[it.id] = it; };
  put({ id: 'stick_gsc_shortie', n: 'GOOD STICK SHORTIE', sec: 'stick', slot: 'stick', rar: 1, art: 'cstick', col: '#f4f4f4', col2: '#1b1b1f', brk: 0.012, gscField: 1, d: 'FIELD PLAYERS ONLY - NOT GOALIES. DURABILITY: RARE - BREAKS ON 1.2% OF CHECKS THAT HIT HIM. BY THE GOOD STICK CO.' });
  put({ id: 'stick_gsc_goalie', n: 'GOOD STICK GOALIE STICK', sec: 'stick', slot: 'stick', rar: 1, art: 'cstick', col: '#e8eaee', col2: '#2a2e33', brk: 0.012, gscGk: 1, d: 'GOALIES ONLY. DURABILITY: RARE - BREAKS ON 1.2% OF CHECKS THAT HIT HIM. BY THE GOOD STICK CO.' });
  put({ id: 'tape_gsc', n: 'GOOD STICK TAPE', sec: 'tape', slot: 'tape', rar: 1, art: 'tape', col: '#141418', eff: { stk: 2 }, d: 'ANY PLAYER. BY THE GOOD STICK CO. SLIGHT STICKWORK BOOST.' });
  put({ id: 'gsc_team', n: 'GOOD STICK CO. TEAM', sec: 'crew', rar: 1, art: 'gsc', d: 'TEAM UNLOCK. QUICK PLAY. PICK THEM IN THE COLLAB TAB.' });
  const rows = rosterRows();
  rows.forEach((row, i) => put({
   id: 'gscard_' + i, n: row.name, sec: 'crew', rar: 2, art: 'gscard', gscCard: 1, d: 'GOOD STICK CO. PLAYER CARD. ' + row.position + ' #' + row.number + '. COLLAB - LEGENDARY LOOK.'
  }));
  V.cards = rows.length;
 }
 try { addGear(); } catch (e) { fail('gear', e); }

 try {
  const iu = V17.iconUrl;
  if (typeof iu === 'function') V17.iconUrl = function (id) {
   const it = V17.BY && V17.BY[id];
   if (it && it.gsc501) return pix(it);
   return iu.apply(this, arguments);
  };
 } catch (e) { fail('icon', e); }
 const pixCache = {};
 function pix(it) {
  if (pixCache[it.id]) return pixCache[it.id];
  const c = document.createElement('canvas'); c.width = 20; c.height = 20;
  const x = c.getContext('2d');
  x.fillStyle = '#d7dbe0'; x.fillRect(0, 0, 20, 20);
  x.fillStyle = '#111'; x.fillRect(1, 1, 18, 18);
  x.fillStyle = '#f4f4f4';
  if (it.art === 'tape') { x.fillRect(4, 8, 12, 4); x.fillStyle = '#111'; x.fillRect(8, 8, 2, 4); }
  else if (it.gscCard) { x.fillRect(6, 3, 8, 6); x.fillRect(5, 10, 10, 6); x.fillStyle = '#111'; x.fillRect(8, 5, 2, 2); }
  else if (it.id === 'gsc_team') { x.fillRect(9, 3, 2, 10); x.fillRect(6, 3, 8, 2); }
  else { x.fillRect(9, 2, 2, 12); x.fillRect(6, 2, 8, 3); x.fillStyle = '#cfd3d8'; x.fillRect(7, 3, 6, 1); }
  pixCache[it.id] = c.toDataURL();
  return pixCache[it.id];
 }

 try {
  const ch = V17.cardHtml;
  if (typeof ch === 'function') V17.cardHtml = function (id) {
   let h = ch.apply(this, arguments);
   const it = V17.BY && V17.BY[id];
   if (!off() && it && it.collab && typeof h === 'string') h = h.replace(/(<div class="rr">)(?!LOCKED)[^<]*/, '$1COLLAB');
   return h;
  };
 } catch (e) { fail('card', e); }

 const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
 function shopBlock() {
  if (!packOn() && !owned()) return '';
  const price = V.price(), own = owned();
  const icons = [ 'stick_gsc_shortie', 'stick_gsc_goalie', 'tape_gsc', 'gsc_team' ].map(id => '<span class="hwi16" style="border-color:#111;background:#e8eaee"><img alt="" src="' + V17.iconUrl(id) + '"></span>').join('');
  const follow = own ? '' : '<div class="gscFollow" style="margin:8px 0;padding:8px;border:2px solid #111;background:#14181e;text-align:center"><s style="color:#e23b3b">20</s> <b style="color:#ffe14d">FOLLOW = 15 DIMES</b> <button type="button" class="y" data-a="gsc501follow">FOLLOW</button></div>';
  const about = '<div class="gscAbout" style="margin-top:8px;padding:8px;background:#d5d8de;color:#111;border:2px solid #111"><b>ABOUT THE GOOD STICK CO.</b><div style="font-size:10px;letter-spacing:1px">COLLAB SERIES PARTNER</div><div style="font-size:11px;line-height:1.35">WE ONLY MANUFACTURE STICKS.<br>HEADS ARE MOLDED AT A SMALL SHOP IN LIBEREC, CZECH REPUBLIC.<br>EVERY STICK IS STRUNG BY HAND BY YOUNG CZECH PLAYERS.<br>LOCALLY SOURCED. AFFORDABLE TO EVERYONE.<br>"WE WANT A MILLION NEW PLAYERS, AND WE WANT EVERY SINGLE ONE OF THEM TO HAVE A GOOD STICK."<br>IN BAGGA LAX: THE GOOD STICK SHORTIE, THE GOALIE STICK, GOOD STICK TAPE AND THE GOOD STICK CO. TEAM.</div></div>';
  return '<div class="hw16 gsc501" id="gsc501tile" style="border-color:#111;background:linear-gradient(90deg,#1b1b1f,#2a2e33)"><div class="hwp16" style="width:64px;height:72px;background:#f4f4f4;border:2px solid #111;display:flex;align-items:center;justify-content:center"><img alt="" src="' + V17.iconUrl('gsc_team') + '" style="width:40px;height:40px;image-rendering:pixelated"></div><div class="hwb16"><b style="color:#fff">GOOD STICK PACK</b><small style="color:#d7dbe0">COLLAB - THE GOOD STICK CO. YOU GET: GOOD STICK SHORTIE + GOALIE STICK + GOOD STICK TAPE + THE GOOD STICK CO. TEAM. NO PLAYER CARDS IN THE PACK.</small><div class="hwr16">' + icons + '</div><small style="color:#ffe14d">GOOD STICK CO. PLAYER CARDS: EARN 2 EACH GAME YOU PLAY AS THE TEAM</small></div><div class="hwc16"><button type="button" class="g" data-a="gsc501inside">SEE WHAT\'S INSIDE</button>' + (own ? '<button type="button" class="d">OWNED</button>' : '<button type="button" class="y" data-a="gsc501buy"><span class="coin17"></span>' + price + '</button>') + '</div></div>' + promoHtml() + follow + about;
 }
 const PROMO0 = { enabled: true, text: 'Use code "{code}" at thegoodstick.co for {percent}% off', code: '____', percent: '__', url: 'https://thegoodstick.co' };
 function promo() {
  const d = PROMO0;
  try {
   const g = win.LIVEOPS && LIVEOPS.goodstick && LIVEOPS.goodstick();
   const p = g && g.promo;
   if (!p || typeof p !== 'object') return d;
   const url = typeof p.url === 'string' && /^https?:\/\//i.test(p.url.trim()) ? p.url.trim() : d.url;
   return {
    enabled: p.enabled !== false,
    text: typeof p.text === 'string' && p.text.trim() ? p.text : d.text,
    code: p.code == null ? d.code : String(p.code),
    percent: p.percent == null ? d.percent : String(p.percent),
    url: url
   };
  } catch (e) { return d; }
 }
 V.promo = promo;
 function promoHtml() {
  const p = promo();
  if (!p.enabled) return '';
  const line = String(p.text).replace(/\{code\}/g, p.code).replace(/\{percent\}/g, p.percent);
  return '<button type="button" class="gscPromo" id="gscPromo" data-a="gsc501promo" data-url="' + esc(p.url) + '" style="display:block;width:100%;margin:8px 0;padding:8px;border:2px solid #ffe14d;background:#14181e;color:#ffe14d;text-align:center;font:inherit;cursor:pointer">' + esc(line) + '</button>';
 }
 V.promoHtml = promoHtml;
 V.shopBlock = shopBlock;
 function insideHtml() {
  const price = V.price();
  const card = (id, sub) => '<div class="c17 r1" data-a="gsc501item" data-v="' + id + '" style="cursor:pointer"><div class="art"><img alt="" src="' + V17.iconUrl(id) + '"></div><div class="nm">' + esc(V17.BY[id].n) + '</div><div class="rr">COLLAB</div><div class="role17">' + esc(sub) + '</div></div>';
  return '<div class="hd"><div><div class="tt">GOOD STICK PACK</div><div class="st">YOU GET ALL OF THESE - 3 ITEMS + THE TEAM, ONE PRICE. PIECES YOU ALREADY HAVE STAY YOURS.</div></div><div class="sp"></div><button type="button" class="g" data-a="v17shop">BACK</button></div>' + promoHtml() + '<div class="scroll"><div class="grid17">' + card('stick_gsc_shortie', 'FIELD PLAYERS ONLY - NOT GOALIES') + card('stick_gsc_goalie', 'GOALIES ONLY') + card('tape_gsc', 'ANY PLAYER') + card('gsc_team', 'TEAM UNLOCK, QUICK PLAY') + '</div></div><div class="row" style="justify-content:center"><button type="button" class="y" data-a="gsc501buy">BUY ALL 3 + TEAM - ' + price + '</button></div>';
 }
 function pullHtml() {
  const tag = id => '<div class="c17 r' + (V17.BY[id].rar) + '"><div class="art"><img alt="" src="' + V17.iconUrl(id) + '"></div><div class="nm">' + esc(V17.BY[id].n) + '</div><div class="rr">COLLAB</div>' + (id === 'gsc_team' ? '' : '<div class="role17" style="color:#7dff7a">NEW!</div>') + '</div>';
  return '<div class="hd"><div><div class="tt">NICE PULL!</div><div class="st">EVERY CARD IS IN YOUR LOCKER ROOM</div></div></div><div class="grid17">' + [ 'stick_gsc_shortie', 'stick_gsc_goalie', 'tape_gsc', 'gsc_team' ].map(tag).join('') + '</div><div class="row" style="justify-content:center"><button type="button" data-a="v17shop">YARD SALE</button><button type="button" class="g" data-a="v17locker">LOCKER ROOM</button></div><div class="note">GOOD STICK CO. TEAM UNLOCKED - PICK THEM IN QUICK PLAY</div>' + shopBlock();
 }
 function itemPop(id) {
  const it = V17.BY[id];
  if (!it) return '';
  return '<div class="pop17" data-a="gsc501close" data-v="bg"><div class="pbox17" data-a="v17noop"><div class="pt17">' + esc(it.n) + '</div><div class="c17 r' + it.rar + '" style="margin:8px auto"><div class="art"><img alt="" src="' + V17.iconUrl(id) + '"></div><div class="nm">' + esc(it.n) + '</div><div class="rr">COLLAB</div></div><div>BY THE GOOD STICK CO.</div><div style="color:#ffe14d">' + esc(it.d) + '</div><button type="button" class="y" data-a="gsc501close">CLOSE</button></div></div>';
 }
 let view = null;
 function buy() {
  if (off() || !packOn()) return;
  if (owned()) { try { V17.toast('YOU ALREADY HAVE THE GOOD STICK PACK', '#7dff7a'); } catch (e) {} return; }
  const s = ST();
  const price = V.price();
  if (!s || (s.chinos | 0) < price) { try { V17.toast('NOT ENOUGH DIMES', '#ff9a8a'); } catch (e) {} return; }
  s.chinos -= price;
  if (s.stats) s.stats.spent = (s.stats.spent || 0) + price;
  [ 'stick_gsc_shortie', 'stick_gsc_goalie', 'tape_gsc', 'gsc_team' ].forEach(id => { try { if (!(s.inv[id] > 0)) V17.grant(id, 1); } catch (e) { s.inv[id] = (s.inv[id] || 0) + 1; } });
  try { LS.set('gsc501own', Date.now()); } catch (e) {}
  try { V17.save(); } catch (e) {}
  view = 'pull';
  try { panelDirty(); } catch (e) {}
 }
 try {
  if (typeof PANEL_ACT === 'object') {
   PANEL_ACT.gsc501buy = () => { buy(); return win.PANEL_KEEP; };
   PANEL_ACT.gsc501inside = () => { view = 'inside'; try { panelDirty(); } catch (e) {} return win.PANEL_KEEP; };
   PANEL_ACT.gsc501follow = () => { try { LS.set('gsc501follow', 1); } catch (e) {} try { V17.toast('FOLLOW = 15 DIMES', '#ffe14d'); } catch (e) {} try { panelDirty(); } catch (e) {} return win.PANEL_KEEP; };
   PANEL_ACT.gsc501item = v => { view = 'item:' + v; try { panelDirty(); } catch (e) {} return win.PANEL_KEEP; };
   PANEL_ACT.gsc501close = () => { view = null; try { panelDirty(); } catch (e) {} };
   PANEL_ACT.gsc501promo = () => {
    const url = promo().url;
    try { win.open(url, '_blank', 'noopener'); } catch (e) {}
    return win.PANEL_KEEP;
   };
   PANEL_ACT.gsc501kit = v => {
    try {
     const parts = String(v || '').split('|');
     const tid = parts[0], k = parts[1] | 0;
     if (win.UNI21 && UNI21.save) UNI21.save(tid, k);
     if (win.V33 && V33.E) { V33.E.uni = tid; V33.E.msg = ''; }
     try { V17.toast('WEARING ' + (k ? 'AWAY' : 'HOME'), '#7dff7a'); } catch (e) {}
    } catch (e) { fail('kit', e); }
    return win.PANEL_KEEP;
   };
  }
  if (typeof PANEL_RENDER === 'object' && typeof PANEL_RENDER.shop17 === 'function') {
   const r0 = PANEL_RENDER.shop17;
   PANEL_RENDER.shop17 = function () {
    let h = r0.apply(this, arguments);
    try {
     if (view === 'inside') return insideHtml();
     if (view === 'pull') return pullHtml();
     if (view && view.indexOf('item:') === 0) return (typeof h === 'string' ? h : '') + itemPop(view.slice(5));
    } catch (e) { fail('shop', e); }
    return h;
   };
  }
  if (typeof PANEL_RENDER === 'object' && typeof PANEL_RENDER.ct33 === 'function') {
   const c0 = PANEL_RENDER.ct33;
   PANEL_RENDER.ct33 = function () {
    let h = c0.apply(this, arguments);
    try {
     if (off() || typeof h !== 'string' || h.indexOf('data-v="' + ID + '"') < 0) return h;
     const wear = win.UNI21 && UNI21.savedK ? UNI21.savedK(ID) : 0;
     h = h.replace(/<div class="c17 uni17"><div class="art"><img src="([^"]*)" alt=""><\/div><div class="nm">HOME<\/div><\/div>/, '<button type="button" class="c17 uni17' + (wear === 0 ? ' wr17' : '') + '" data-a="gsc501kit" data-v="' + ID + '|0"><div class="art"><img src="$1" alt=""></div><div class="nm">HOME</div><div class="rr">' + (wear === 0 ? 'WEARING' : 'TAP TO WEAR') + '</div></button>');
     h = h.replace(/<div class="c17 uni17"><div class="art"><img src="([^"]*)" alt=""><\/div><div class="nm">AWAY<\/div><\/div>/, '<button type="button" class="c17 uni17' + (wear === 1 ? ' wr17' : '') + '" data-a="gsc501kit" data-v="' + ID + '|1"><div class="art"><img src="$1" alt=""></div><div class="nm">AWAY</div><div class="rr">' + (wear === 1 ? 'WEARING' : 'TAP TO WEAR') + '</div></button>');
    } catch (e) { fail('ct', e); }
    return h;
   };
  }
 } catch (e) { fail('panel', e); }

 V.drawPick = function (onPick, opts) {
  if (typeof bgStripes === 'function') bgStripes(true);
  text('QUICK PLAY', W / 2, 4, 2, '#fff', 'center', '#000');
  const tabs = [ [ 'PRO', '#ffe14d' ], [ 'WORLD', '#7dff7a' ], [ 'COLLEGE', '#ff9a3d' ], [ 'N/A', '#b48aff' ], [ 'COLLAB', '#f4f4f4' ] ];
  tabs.forEach((t, i) => button(t[0], 2 + i * 52, 16, 50, 11, () => { if (typeof gscTab501 === 'function') gscTab501(t[0]); }, { bg: t[0] === 'COLLAB' ? '#f4f4f4' : '#3a4a55', fg: t[0] === 'COLLAB' ? '#111' : '#cfe' }));
  const tm = GH_REG[ID];
  if (!tm) return;
  const cx = 8, cy = 34, cw = 120, chh = 78, own = owned();
  rect(cx, cy + 2, cw, chh, '#000');
  rect(cx, cy, cw, chh, '#1a2430');
  rect(cx, cy, cw, 2, '#f4f4f4');
  badge(tm, cx + cw / 2 - 20, cy + 6, 3);
  text('GOOD STICK CO.', cx + cw / 2, cy + 56, 1, '#fff', 'center');
  text(own ? 'COLLAB' : 'LOCKED', cx + cw / 2, cy + 66, 1, own ? '#7dff7a' : '#ff9a8a', 'center');
  hit('TEAM-' + ID, cx, cy, cw, chh, () => {
   if (!own) { try { V17.toast('GOOD STICK CO. IS IN THE COLLAB PACK', '#ffd23a'); } catch (e) {} return; }
   onPick(ID);
  }, tm.name);
  const by = H - 27;
  if (opts && opts.extra) opts.extra(by);
  button('BACK', 8, by, 56, 19, opts && opts.back || (() => { screen = 'menu'; }), { bg: '#c9d6d9' });
 };

 try {
  const q0 = win.qTeam16;
  if (typeof q0 === 'function') win.qTeam16 = function () {
   const r = q0.apply(this, arguments);
   if (r) return r;
   try {
    const t = LS.get('qteam16', null);
    if (t === ID && owned()) return t;
   } catch (e) {}
   return r;
  };
 } catch (e) { fail('q', e); }

 try {
  const d0 = win.drawField;
  if (typeof d0 === 'function') win.drawField = function () {
   const r = d0.apply(this, arguments);
   try {
    const G = win.game;
    if (off() || !G || (G.user !== ID && G.opp !== ID)) return r;
    const t = typeof menuT === 'number' ? menuT : 0;
    for (let x = 8, i = 0; x < FL - 20; x += 92, i++) text((Math.floor(t / 4) + i) % 2 ? 'THE GOOD STICK CO' : 'BAGGA LAX', x, Math.max(2, FT - 12), 1, '#ffffff');
    for (let x = 8; x < FL - 20; x += 110) text('GOOD STICK CO.', x, FB + 2, 1, '#ffe14d');
    g.globalAlpha = .35;
    if (typeof badge === 'function' && GH_REG[ID]) badge(GH_REG[ID], MIDX - 19, CY - 40, 3);
    g.globalAlpha = 1;
    text('GOOD STICK CO.', MIDX, CY + 36, 1, 'rgba(255,255,255,.7)', 'center');
   } catch (e) {}
   return r;
  };
 } catch (e) { fail('field', e); }

 let paid = null;
 setInterval(() => {
  try {
   const G = win.game;
   if (!G || !G.over || G.user !== ID || !owned()) return;
   const key = (G.user || '') + '|' + (G.opp || '') + '|' + (G.t0 || G.seed || 0);
   if (paid === key) return;
   paid = key;
   const s = ST();
   if (!s) return;
   const n = V.cards || 1;
   for (let i = 0; i < 2; i++) {
    const id = 'gscard_' + ((Math.floor(Math.random() * n)) % n);
    try { V17.grant(id, 1); } catch (e) { s.inv[id] = (s.inv[id] || 0) + 1; }
   }
   try { V17.save(); } catch (e) {}
   note('cards +2');
  } catch (e) {}
 }, 1500);

 function lineupFromPlayers(ps) {
  const players = ps.filter(Boolean).map(p => ({ id: p.id, i: +String(p.id).split('-').pop() || 0, position: p.pos, starter: !!p.gscStarter }));
  const used = new Set();
  const rank = list => list.slice().sort((a, b) => a.starter === b.starter ? a.i - b.i : a.starter ? -1 : 1);
  const pool = pos => players.filter(p => p.position === pos);
  const take = (n, positions) => {
   const out = [];
   for (const pos of positions) for (const p of rank(pool(pos))) {
    if (out.length >= n) return out;
    if (used.has(p.id)) continue;
    out.push(p.id);
    used.add(p.id);
   }
   for (const p of rank(players)) {
    if (out.length >= n) break;
    if (used.has(p.id) || p.position === 'G') continue;
    out.push(p.id);
    used.add(p.id);
   }
   return out;
  };
  const ss = () => take(2, [ 'M', 'A', 'FO', 'D' ]);
  const Gid = take(1, [ 'G' ])[0];
  const A = take(3, [ 'A' ]);
  const M = take(3, [ 'M' ]);
  const D = take(3, [ 'D' ]);
  const LSM = take(1, [ 'LSM', 'D' ])[0];
  const ssdm = ss();
  const FO = take(1, [ 'FO', 'M' ])[0];
  return { A: A, M: M, D: D, LSM: LSM, SSDM: ssdm[0], SSDM2: ssdm[1], FO: FO, G: Gid };
 }
 try {
  if (typeof autoLineup === 'function' && !autoLineup.__gsc) {
   const a0 = autoLineup;
   const wrapped = function (ids) {
    try {
     const ps = (ids || []).map(id => typeof PP === 'function' ? PP(id) : null).filter(p => p && p.gsc501);
     if (ps.length && ps.length === (ids || []).length) {
      const lu = lineupFromPlayers(ps);
      if (typeof lineupValid !== 'function' || lineupValid(lu, ids)) return lu;
     }
    } catch (e) { fail('auto', e); }
    return a0.apply(this, arguments);
   };
   wrapped.__gsc = true;
   window.autoLineup = wrapped;
  }
  if (typeof lineupFor === 'function' && !lineupFor.__gsc) {
   const l0 = lineupFor;
   const wrapped = function (teamId, src) {
    try {
     const tm = typeof T === 'function' ? T(teamId) : null;
     if (!off() && tm && tm.gsc501 && typeof availIds === 'function') {
      const ids = availIds(teamId, src);
      const ps = ids.map(id => PP(id)).filter(p => p && p.gsc501);
      if (ps.length) {
       const lu = lineupFromPlayers(ps);
       if (typeof lineupValid !== 'function' || lineupValid(lu, ids)) return JSON.parse(JSON.stringify(lu));
      }
     }
    } catch (e) { fail('for', e); }
    return l0.apply(this, arguments);
   };
   wrapped.__gsc = true;
   window.lineupFor = wrapped;
  }
 } catch (e) { fail('hooklu', e); }
 note('on');
})();
