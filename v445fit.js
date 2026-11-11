/* v445fit.js - THE WHALE / THE CROWN choose-one uniform (Bagga Lax V40.1.11).
   Kill switch: window.__rl_no445fit = true (set before load) turns the whole feature off. */
(function(){
 'use strict';
 if (window.__rl_no445fit) return;
 if (typeof RL12 === 'undefined' || !window.V17 || !V17.bakeGear) return;
 const R = RL12, off = () => !!window.__rl_no445fit;
 const PRICE = 200, LSK = 'fit45', IDS = { whale: 'fit45_whale', crown: 'fit45_crown' };
 const NAME = { whale: 'THE WHALE', crown: 'THE CROWN' };
 const KH = '#d2bc8a', KHs = '#a8925f', KHz = '#e2d0a2';
 const FIT = { whale: { jersey: '#ff8cc6', navy: '#1d2a5e', navys: '#121a3e', white: '#f4f4f4', whites: '#c4c4cc', flop: '#7a4f2a' },
               crown: { jersey: '#a6d8f7', zip: '#4a6f8e', logo: '#ffffff', flop: '#7a4f2a' } };
 const mul = (hex, k) => { const n = parseInt(String(hex).slice(1), 16); if (isNaN(n)) return hex; const c = v => Math.max(0, Math.min(255, Math.round(v * k))).toString(16).padStart(2, '0'); return '#' + c(n >> 16 & 255) + c(n >> 8 & 255) + c(n & 255); };
 const lsGet = () => { try { const v = JSON.parse(localStorage.getItem('rl_' + LSK) || 'null'); return v && typeof v === 'object' ? v : {}; } catch (e) { return {}; } };
 const lsSet = v => { try { localStorage.setItem('rl_' + LSK, JSON.stringify(v)); } catch (e) {} };
 const ST = () => { try { return V17.ST ? V17.ST() : null; } catch (e) { return null; } };
 function pick() {
  const s = lsGet(); if (s.pick === 'whale' || s.pick === 'crown') return s.pick;
  const st = ST(), inv = st && st.inv || {};
  if ((inv[IDS.whale] | 0) > 0) return 'whale';
  if ((inv[IDS.crown] | 0) > 0) return 'crown';
  return null;
 }
 const wearing = () => { const p = pick(); return p && lsGet().wear === true ? p : null; };

 /* ---------- drawing ---------- */
 let act = null;   // {kit, fit, view, legs, cleat} while v445 bakes; the uni hooks pass through otherwise
 const U0 = { key: R.uniKey, mask: R.uniMask, color: R.uniColor, pal: R.palette };
 R.uniKey = function(kit) { if (act && kit === act.kit) return 'fit45|' + act.fit + '|' + act.view; return U0.key.apply(this, arguments); };
 R.uniMask = function(rows, name) { if (act && rows && Array.isArray(rows[0])) return fit(rows, act); return U0.mask.apply(this, arguments); };
 R.uniColor = function(kit, m, q, r, ch) { if (m && m.fit45) return m.T[q + ',' + r] || null; return U0.color.apply(this, arguments); };
 R.palette = function(kit, skin) { const p = U0.pal.apply(this, arguments); if (act && kit === act.kit && p) { const j = FIT[act.fit].jersey; p.J = j; p.j = mul(j, .72); } return p; };

 function fit(rows, A) {
  const F = FIT[A.fit], h = rows.length, w = rows[0].length, T = {}, at = (x, y) => y >= 0 && y < h && x >= 0 && x < w ? rows[y][x] : null, set = (x, y, c) => { if (y >= 0 && y < h && x >= 0 && x < w) rows[y][x] = c; };
  const isJ = c => c === 'J' || c === 'j', front = A.view === 'front', back = A.view === 'back', crown = A.fit === 'crown';
  let belt = -1; for (let y = 0; y < h; y++) { let j = 0, J = 0; for (const c of rows[y]) { if (c === 'j') j++; else if (c === 'J') J++; } if (j >= 5 && J <= 1) { belt = y; break; } }
  if (belt < 0) { for (let y = h - 1; y >= 0; y--) if (rows[y].some(isJ)) { belt = y - 3; break; } }
  for (let y = 0; y <= belt; y++) for (let x = 0; x < w; x++) { const c = rows[y][x]; if (!isJ(c)) continue;
   if (y === belt) { T[x + ',' + y] = F.jersey; continue; }
   if (!crown && y === belt - 2) T[x + ',' + y] = c === 'J' ? F.navy : F.navys;
   else if (!crown && y === belt - 1) T[x + ',' + y] = c === 'J' ? F.white : F.whites;
  }
  const pants = crown && A.legs !== 'short';
  // straight-leg khakis: every pant leg keeps the hem width from the shorts line down to the flops (no taper)
  if (pants) {
   let hem = -1; for (let y = h - 1; y > belt; y--) if (rows[y].some(isJ)) { hem = y; break; }
   if (hem > belt) {
    const segs = (y, ok) => { const out = []; let x = 0; while (x < w) { if (ok(rows[y][x])) { let e = x; while (e + 1 < w && ok(rows[y][e + 1])) e++; out.push([x, e]); x = e + 1; } else x++; } return out; };
    const legs = segs(hem, c => isJ(c) || c === 'X').map(([a, b]) => { while (a <= b && rows[hem][a] === 'X') a++; while (b >= a && rows[hem][b] === 'X') b--; return { a: a, b: b, n: b - a + 1 }; }).filter(l => l.n > 0);
    if (legs.length) {
     const L = Math.max(...legs.map(l => l.n)); legs.forEach(l => { l.b = l.a + L - 1; l.off = null; l.prev = null; l.done = false; l.top = hem; });
     const shin = c => c === 'S' || c === 's' || c === 'W' || c === 'v' || c === 'Z';
     const ov = (a, b, c, d) => Math.max(0, Math.min(b, d) - Math.max(a, c) + 1);
     const paint = [];
     for (let y = hem + 1; y < h; y++) {
      const nat = segs(y, shin), foot = segs(y, c => c === 'K' || c === 'k');
      for (const l of legs) { if (l.done) continue;
       const ref = l.prev || [l.a, l.b];
       let best = null, bo = 0; for (const s of nat) { const o = ov(s[0] - 1, s[1] + 1, ref[0], ref[1]); if (o > bo || (o === bo && o > 0 && Math.abs((s[0] + s[1]) - (ref[0] + ref[1])) < Math.abs((best[0] + best[1]) - (ref[0] + ref[1])))) { bo = o; best = s; } }
       const fo = foot.some(f => ov(f[0], f[1], l.prev ? l.prev[0] : l.a, l.prev ? l.prev[1] : l.b) > 0);
       if (fo || (!best && l.prev)) { l.done = true; continue; }
       if (!best) continue;
       if (l.off === null) { l.off = l.a - best[0]; for (let yy = l.top + 1; yy < y; yy++) paint.push([yy, l.a, l.a + L - 1, false]); }
       const lo = best[0] + l.off, low = rows[hem].slice(l.a, l.a + l.n).filter(c => c === 'j').length * 2 > l.n;
       paint.push([y, lo, lo + L - 1, low]); l.prev = best;
      }
     }
     const canPaint = c => c === '.' || c === 'o' || shin(c);
     paint.sort((p, q) => (q[3] ? 1 : 0) - (p[3] ? 1 : 0));
     for (const [y, a, b, low] of paint) for (let x = a; x <= b; x++) if (x >= 0 && x < w && canPaint(rows[y][x])) rows[y][x] = low ? 'v' : 'W';
     const pr = {}; for (const [y, a, b] of paint) { pr[y] = pr[y] || []; pr[y].push([a, b]); }
     for (const y in pr) { const lo = Math.min(...pr[y].map(p => p[0])), hi = Math.max(...pr[y].map(p => p[1])); for (let x = Math.max(0, lo); x <= Math.min(w - 1, hi); x++) if (shin(rows[y][x]) && !pr[y].some(p => x >= p[0] && x <= p[1])) rows[y][x] = 'o'; }
     for (const [y, a, b] of paint) { if (a - 1 >= 0 && rows[y][a - 1] === '.') rows[y][a - 1] = 'o'; if (b + 1 < w && rows[y][b + 1] === '.') rows[y][b + 1] = 'o'; }
    }
   }
  }
  for (let y = belt + 1; y < h; y++) for (let x = 0; x < w; x++) { const c = rows[y][x];
   if (isJ(c)) T[x + ',' + y] = c === 'J' ? KH : KHs;
   else if (pants && (c === 'S' || c === 'Z' || c === 's' || c === 'W' || c === 'v')) T[x + ',' + y] = (c === 's' || c === 'v') ? KHs : c === 'Z' ? KHz : KH;
   else if (!pants && (c === 'W' || c === 'v')) rows[y][x] = c === 'W' ? 'S' : 's';
  }
  // flip flops: shoe -> bare foot with toes, the sole under it -> brown flop
  const feet = [];
  for (let y = belt + 1; y < h; y++) { let x = 0; while (x < w) { if (rows[y][x] === 'K' || rows[y][x] === 'k') { let e = x; while (e + 1 < w && (rows[y][e + 1] === 'K' || rows[y][e + 1] === 'k')) e++; feet.push([y, x, e]); x = e + 1; } else x++; } }
  for (const [y, a, b] of feet) {
   for (let x = a; x <= b; x++) rows[y][x] = 'S';
   const n = b - a + 1;
   if (back) {} else if (front) { if (n >= 3) { rows[y][a] = 'Z'; rows[y][a + 1] = 's'; rows[y][b] = 'Z'; if (n >= 4) rows[y][b - 1] = 's'; } else rows[y][a] = 'Z'; }
   else { rows[y][b] = 'Z'; if (n >= 3) rows[y][b - 1] = 's'; if (n >= 4) rows[y][b - 2] = 'Z'; }
   for (let x = a; x <= b; x++) { const u = at(x, y + 1); if (u === 'o' || u === '.') { set(x, y + 1, 'K'); T[x + ',' + (y + 1)] = A.cleat && A.cleatCol ? A.cleatCol : F.flop; } }
  }
  if (crown && front) {
   let ty = -1; for (let y = 0; y < belt; y++) if (rows[y].filter(isJ).length >= 3) { ty = y; break; }
   if (ty >= 0) { const xs = rows[ty].map((c, x) => isJ(c) ? x : -1).filter(x => x >= 0), lo = Math.min(...xs), hi = Math.max(...xs), cx = Math.round((lo + hi) / 2);
    for (let x = lo; x <= hi; x++) if (rows[ty][x] === 'o') { rows[ty][x] = 'J'; T[x + ',' + ty] = F.jersey; }
    T[cx + ',' + ty] = F.zip; rows[ty][cx] = 'J'; T[cx + ',' + (ty + 1)] = F.zip;
    T[(cx + 3) + ',' + (ty + 1)] = F.logo; }
  }
  if (crown) {
   let hy = -1; for (let y = 0; y < h; y++) if (rows[y].some(c => c === 'H')) { hy = y; break; }
   const oy = hy - 1, run = []; if (oy >= 0) for (let x = 0; x < w; x++) if (rows[oy][x] === 'o') run.push(x);
   if (run.length) { const lo = Math.min(...run), hi = Math.max(...run), cx = Math.round((lo + hi) / 2), G = '#ffcc33', g = '#c98f12', J2 = '#e8344c', HI = '#fff0a8';
    const put = (x, y, c) => { if (y < 0) return; rows[y][x] = 'Y'; T[x + ',' + y] = c; };
    for (let x = lo; x <= hi; x++) { put(x, oy - 1, x === cx ? J2 : g); put(x, oy - 2, G); }
    put(lo, oy - 3, HI); put(cx, oy - 3, HI); put(hi, oy - 3, HI);
    const cr = []; for (let y = Math.max(0, oy - 3); y < oy; y++) for (let x = 0; x < w; x++) if (rows[y][x] === 'Y') cr.push([x, y]);
    for (const [x, y] of cr) for (const [dx, dy] of [[1, 0], [-1, 0], [0, -1]]) if (at(x + dx, y + dy) === '.') set(x + dx, y + dy, 'o');
   }
  }
  return { fit45: 1, T: T };
 }
 // padded copy of a frame: 4 empty rows on top (crown) and 2 px each side (straight khakis), same anchor point
 function padFrame(name) {
  const f = R.FR[name]; if (!f) return null;
  const nn = name + '__w45';
  if (!R.FR[nn]) { const wd = f[3][0].length + 4, rws = []; for (let i = 0; i < 4; i++) rws.push('.'.repeat(wd)); R.FR[nn] = [f[0] + 2, f[1] + 4, f[2], rws.concat(f[3].map(r => '..' + r + '..'))]; }
  return nn;
 }
 const viewOf = n => /^d8N_/.test(n) ? 'back' : /^bench|^lobby|^d8S_/.test(n) ? 'front' : 'side';
 function bakeFit(name, kit, flip, skin, gr, nostick, nopad) {
  const nn = padFrame(name); if (!nn) return null;
  const g2 = Object.assign({}, gr || {});
  if (kit.fit45 === 'whale' && !g2.legs) g2.legs = 'shorts_short';
  let cleatCol = null;
  try { if (g2.cleats && window.V17 && V17.BY && V17.BY[g2.cleats]) cleatCol = V17.BY[g2.cleats].col; } catch (e) {}
  act = { kit: kit, fit: kit.fit45, view: viewOf(name), legs: g2.legs === 'shorts_short' ? 'short' : g2.legs === 'shorts_baggy' ? 'baggy' : '', cleat: !!g2.cleats, cleatCol: cleatCol };
  try { return V17.bakeGear(nn, kit, flip, skin | 0, g2, false, nostick || nopad ? { nopad: true, nostick: !!nostick } : undefined); }
  finally { act = null; }
 }
 function blit(gx, c, name, x, y, faceRight, alpha) {
  const f = R.FR[name + '__w45'], w = f[3][0].length, pad = c.pad17 || 0, ax = faceRight ? f[0] : w - 1 - f[0];
  if (alpha != null) { const a = gx.globalAlpha; gx.globalAlpha = alpha; gx.drawImage(c, x - ax - pad, y - f[1] - pad); gx.globalAlpha = a; }
  else gx.drawImage(c, x - ax - pad, y - f[1] - pad);
 }
 const isFit = kit => !!(kit && (kit.fit45 === 'whale' || kit.fit45 === 'crown') && !kit.g27 && !off());
 const skinOfP = p => { try { return typeof skinOf === 'function' ? skinOf(p && p.pl) : 0; } catch (e) { return 0; } };

 const draw0 = R.draw;
 R.draw = function(gx, name, x, y, kit, faceRight, opts) {
  if (!isFit(kit) || !R.FR[name] || /^prop_|^coach|^ref|^ump/.test(name)) return draw0.apply(this, arguments);
  try {
   const o = opts || {}; x = Math.round(x); y = Math.round(y);
   let gr = {};
   try {
    const pid = window.__v17hp || (window.__v17p && window.__v17p.pl && window.__v17p.pl.id);
    if (pid && window.V17 && V17.heroGear) gr = V17.heroGear(pid, kit) || {};
    else if (window.__v17p && V17.gearOfP) gr = V17.gearOfP(window.__v17p.pl, kit) || {};
   } catch (e2) {}
   const c = bakeFit(name, kit, !faceRight, o.skin, gr, false, true);
   if (!c) return draw0.apply(this, arguments);
   if (o.shadow !== false) { gx.fillStyle = 'rgba(0,0,0,.25)'; gx.fillRect(x - 4, y, 9, 2); }
   blit(gx, c, name, x, y, faceRight, o.alpha);
  } catch (e) { return draw0.apply(this, arguments); }
 };
 const dp0 = V17.drawP;
 if (typeof dp0 === 'function') V17.drawP = function(gx, n, p, kit, faceRight) {
  if (!isFit(kit) || !R.FR[n]) return dp0.apply(this, arguments);
  try {
   const ns = !!(p && p.ns17), gr = V17.gearOfP(p && p.pl, kit) || (ns ? {} : null);
   if (!gr) return false;
   const c = bakeFit(n, kit, !faceRight, skinOfP(p), gr, ns, false);
   if (!c) return dp0.apply(this, arguments);
   const x = Math.round(p.x), y = Math.round(p.y);
   gx.fillStyle = 'rgba(0,0,0,.25)'; gx.fillRect(x - 4, y, 9, 2);
   blit(gx, c, n, x, y, faceRight);
   return true;
  } catch (e) { return dp0.apply(this, arguments); }
 };
 const ns0 = window.draw12ns;
 if (typeof ns0 === 'function') window.draw12ns = function(name, x, y, kit, faceRight, skin, shadow) {
  if (!isFit(kit) || !R.FR[name] || typeof g === 'undefined') return ns0.apply(this, arguments);
  try {
   const p = window.__v17p; let gr = null; try { gr = p && V17.gearOfP(p.pl, kit); } catch (e) {}
   const c = bakeFit(name, kit, !faceRight, skin, gr || {}, true, true);
   if (!c) return ns0.apply(this, arguments);
   x = Math.round(x); y = Math.round(y);
   if (shadow !== false) { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x - 4, y, 9, 2); }
   blit(g, c, name, x, y, faceRight);
  } catch (e) { return ns0.apply(this, arguments); }
 };

 /* ---------- which team wears it: the user's team in offline games, when switched on in the locker ---------- */
 const fitKit = (kit, w) => Object.assign({}, kit, { fit45: w });
 if (window.UNI21 && typeof UNI21.gameKits === 'function') {
  const gk0 = UNI21.gameKits;
  UNI21.gameKits = function(user, opp, userHome, mode, meta) {
   const r = gk0.apply(this, arguments);
   try { const w = wearing(); if (w && !off() && !(meta && meta.online) && mode !== 'online' && r && r[0] && !r[0].g27) r[0] = fitKit(r[0], w); } catch (e) {}
   return r;
  };
 }

 /* ---------- shared bits for the UI ---------- */
 const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
 const coin = '<span class="coin17"></span>';
 function myTeam() {
  try { if (typeof season !== 'undefined' && season && season.team) return season.team; } catch (e) {}
  try { const q = JSON.parse(localStorage.getItem('rl_qteam16') || 'null'); if (q) return q; } catch (e) {}
  try { if (typeof TEAMS !== 'undefined' && TEAMS[0]) return TEAMS[0].id; } catch (e) {}
  return null;
 }
 function teamKit(tid) {
  try { if (tid && window.UNI21 && UNI21.on && UNI21.on()) { const k = UNI21.kitOf(tid, UNI21.savedK(tid)); if (k && !k.g27) return k; } } catch (e) {}
  try { if (tid && typeof lobbyKit === 'function') return lobbyKit(tid); } catch (e) {}
  return { jersey: '#1d2a5e', trim: '#ffffff', helm: '#1d2a5e' };
 }
 const urls = new Map;
 function playerUrl(w, frame, tid) {
  const base = teamKit(tid), key = w + '|' + frame + '|' + tid + '|' + base.helm + base.trim + base.jersey;
  if (urls.has(key)) return urls.get(key);
  let u = null;
  try { const kit = fitKit(base, w), c = bakeFit(frame, kit, false, 1, {}, false, true); if (c) u = { u: c.toDataURL(), w: c.width }; } catch (e) {}
  if (urls.size > 60) urls.clear();
  urls.set(key, u);
  return u;
 }
 const ICON = {
  whale: ['.......aaaaaa.......', '......abbbbbbaa.....', '......abbbbbbbba....', '.......aaaaaaaa.....', '....................', '.....aaaccccaaa.....', '...aacccaccacccaa...', '..accccccaacccccca..', '.acccccccccccccccca.', 'accccaccccccccacccca', 'accca.adddddda.accca', '.aaa..aeeeeeea..aaa.', '......acccccca......', '......acccccca......', '......affffffa......', '......affffffa......', '......affaaffa......', '......aggaagga......', '......ahhaahha......', '....................'],
  crown: ['.......a.aa.a.......', '.......aaaaaa.......', '......bccccccbb.....', '......bccccccccb....', '.......bbbbbbbb.....', '.....bdddeedddb.....', '...bbddddeeddddbb...', '..bddddddddddddddb..', '.bddddddddddfdddddb.', 'bddddbddddddddbddddb', 'bdddbbddddddddbbdddb', 'bdddb.bddddddb.bdddb', '.bbb..bddddddb..bbb.', '......bggggggb......', '......bggbbggb......', '......bggbbggb......', '......bggbbggb......', '......bhhbbhhb......', '......biibbiib......', '....................']
 };
 const ICOL = { whale: { a: '#000000', c: '#ff8cc6', d: '#1d2a5e', e: '#f4f4f4', f: '#d2bc8a', g: '#e0ac7c', h: '#7a4f2a' },
                crown: { a: '#ffcc33', b: '#000000', d: '#a6d8f7', e: '#4a6f8e', f: '#ffffff', g: '#d2bc8a', h: '#e0ac7c', i: '#7a4f2a' } };
 function iconUrl(w, helm) {
  const key = 'ic|' + w + '|' + helm; if (urls.has(key)) return urls.get(key);
  const c = document.createElement('canvas'); c.width = 20; c.height = 20; const x = c.getContext('2d');
  const pal = Object.assign({}, ICOL[w]); if (w === 'whale') pal.b = helm; else pal.c = helm;
  ICON[w].forEach((row, y) => { for (let i = 0; i < 20; i++) { const ch = row[i]; if (ch === '.' || !pal[ch]) continue; x.fillStyle = pal[ch]; x.fillRect(i, y, 1, 1); } });
  const u = c.toDataURL(); urls.set(key, u); return u;
 }
 function css() {
  if (document.getElementById('v445css')) return;
  const s = document.createElement('style'); s.id = 'v445css';
  s.textContent = '#panel .fit45{margin:2px 0 8px;padding:8px 10px;border:2px solid #ff8cc6;border-radius:6px;background:linear-gradient(90deg,rgba(255,140,198,.4),rgba(10,16,24,.92) 48%,rgba(10,16,24,.92) 52%,rgba(166,216,247,.4));box-shadow:0 0 10px rgba(255,140,198,.35)}' +
   '#panel .fit45 .ft45{text-align:center;color:#ffe14d;font-size:14px;letter-spacing:1px}#panel .fit45 .fs45{text-align:center;color:#e8f2ff;font-size:8px;margin:3px 0 6px}' +
   '#panel .fit45 .fr45{display:flex;gap:8px}#panel .fit45 .fh45{flex:1 1 0;display:flex;flex-direction:column;align-items:center;gap:5px;min-width:0}' +
   '#panel .fit45 .fn45{font-size:11px}#panel .fit45 .fw45 .fn45{color:#ff8cc6}#panel .fit45 .fc45 .fn45{color:#a6d8f7}' +
   '#panel .fld45{display:flex;align-items:flex-end;justify-content:center;gap:10px;padding:4px 10px 3px;border:2px solid #05080b;background:repeating-linear-gradient(90deg,#2f8a3a 0 12px,#2a7f35 12px 24px);border-radius:3px}' +
   '#panel .fld45 img{image-rendering:pixelated;image-rendering:crisp-edges;display:block}' +
   '#panel .fit45 .fb45{display:flex;gap:5px;flex-wrap:wrap;justify-content:center}#panel .fit45 .fk45{font-size:8px;color:#ffe14d;text-align:center;padding:4px 0}#panel .fit45 .fl45{font-size:8px;color:#ff9a8a;text-align:center;padding:4px 0}' +
   '#panel .pv45 .fld45{gap:16px;padding:8px 12px 6px}#panel .pv45 .pt45{text-align:center;font-size:14px;color:#ffe14d}#panel .pv45 .pl45{display:flex;justify-content:space-around;font-size:7px;color:#9fb2bd}#panel .pv45 .pd45{font-size:8px;color:#e8f2ff;text-align:center;line-height:1.4}';
  document.head.appendChild(s);
 }
 const btnH = (label, a, v, cls, inner) => '<button type="button" data-a="' + a + '"' + (v != null ? ' data-v="' + esc(v) + '"' : '') + (cls ? ' class="' + cls + '"' : '') + ' aria-label="' + esc(label) + '">' + (inner != null ? inner : esc(label)) + '</button>';
 const DESC = { whale: 'PINK POLO, NAVY + WHITE STRIPE, KHAKI SHORTS, BROWN FLOPS', crown: 'LIGHT BLUE QUARTER ZIP, STRAIGHT KHAKIS, BROWN FLOPS, GOLD CROWN' };
 const SH = { whale: 'WHALE', crown: 'CROWN' };

 /* ---------- buying: choose one, the other locks for good (checked here, not only in the UI) ---------- */
 function buy(w) {
  if (off() || !FIT[w]) return false;
  const st = ST(); if (!st) return false;
  const have = pick();
  if (have) { (V17.toast || (() => {}))(have === w ? 'YOU ALREADY OWN ' + NAME[w] : 'YOU PICKED ' + NAME[have] + ' - ' + NAME[w] + ' IS LOCKED', '#ff9a8a'); return false; }
  if ((st.chinos | 0) < PRICE) { (V17.toast || (() => {}))('NOT ENOUGH DIMES - ' + NAME[w] + ' IS ' + PRICE, '#ff9a8a'); return false; }
  st.chinos -= PRICE;
  if (st.stats) st.stats.spent = (st.stats.spent || 0) + PRICE;
  st.inv = st.inv || {}; st.inv[IDS[w]] = 1;
  lsSet({ pick: w, t: Date.now(), wear: false });
  try { V17.save(); } catch (e) {}
  try { V17.toast(NAME[w] + ' IS YOURS - WEAR IT IN LOCKER ROOM > UNIFORMS > N/A', '#ffcc33'); } catch (e) {}
  return true;
 }
 function setWear(w) {
  const have = pick();
  if (have !== w) { try { V17.toast(have ? 'YOU PICKED ' + NAME[have] : 'GET ' + NAME[w] + ' IN THE SHOP - ' + PRICE + ' DIMES', '#ff9a8a'); } catch (e) {} return; }
  const s = lsGet(); s.pick = have; s.t = s.t || Date.now(); s.wear = !(s.wear === true); lsSet(s);
  try { V17.toast(s.wear ? 'YOUR TEAM WEARS ' + NAME[w] + ' - TEAM HELMET + GLOVES STAY' : NAME[w] + ' OFF - BACK TO THE TEAM UNIFORM', '#7dff7a'); } catch (e) {}
 }

 /* ---------- shop card + preview ---------- */
 let pop = null; // {k:'prev'|'conf', w}
 function half(w, have, ok, tid) {
  const front = playerUrl(w, 'd8S_idle_R', tid), side = playerUrl(w, 'idle', tid);
  let low;
  if (have === w) low = '<div class="fk45">OWNED - ' + (wearing() === w ? 'YOUR TEAM WEARS IT' : 'WEAR IT IN THE LOCKER ROOM') + '</div>';
  else if (have) low = '<div class="fl45">YOU PICKED ' + NAME[have] + '</div>';
  else low = '<div class="fb45">' + btnH('PREVIEW ' + SH[w], 'v45prev', w, 'g', 'PREVIEW') + btnH('PICK ' + SH[w] + ' 200', 'v45pick', w, ok ? 'y' : 'd', 'PICK ' + SH[w] + ' – ' + coin + PRICE) + '</div>';
  return '<div class="fh45 ' + (w === 'whale' ? 'fw45' : 'fc45') + '"><b class="fn45">' + NAME[w] + '</b><div class="fld45">' +
   [front, side].map(im => im ? '<img alt="" src="' + im.u + '" style="width:' + im.w * 3 + 'px">' : '').join('') + '</div>' + low + '</div>';
 }
 function card() {
  const st = ST(); if (!st) return '';
  css();
  const have = pick(), ok = !have && (st.chinos | 0) >= PRICE, tid = myTeam();
  return '<div class="fit45" id="fit45tile"><div class="ft45">THE WHALE OR THE CROWN</div><div class="fs45">PICK ONE FOR ' + PRICE + ' DIMES. YOU CAN ONLY EVER OWN ONE - THE OTHER LOCKS FOR GOOD. YOUR TEAM KEEPS ITS HELMET + GLOVES.</div><div class="fr45">' + half('whale', have, ok, tid) + half('crown', have, ok, tid) + '</div></div>';
 }
 function popHtml() {
  if (!pop || !FIT[pop.w]) return '';
  const w = pop.w, o = w === 'whale' ? 'crown' : 'whale', tid = myTeam(), st = ST(), have = pick(), ok = !have && st && (st.chinos | 0) >= PRICE;
  let inner;
  if (pop.k === 'prev') {
   const fr = ['d8S_idle_R', 'idle', 'run1'].map(n => playerUrl(w, n, tid));
   inner = '<div class="pv45"><div class="pt45" style="color:' + FIT[w].jersey + '">' + NAME[w] + '</div><div class="fld45">' + fr.map(im => im ? '<img alt="" src="' + im.u + '" style="width:' + im.w * 5 + 'px">' : '').join('') + '</div><div class="pl45"><span>FRONT</span><span>SIDE</span><span>RUNNING</span></div><div class="pd45">' + DESC[w] + '</div></div>';
   inner += '<div class="row" style="justify-content:center;gap:8px">' + btnH('BACK', 'v45close', null, 'g') + (have ? '' : btnH('PICK ' + SH[w] + ' 200', 'v45pick', w, ok ? 'y' : 'd', 'PICK ' + SH[w] + ' – ' + coin + PRICE)) + '</div>';
  } else {
   inner = '<div class="pv45"><div class="pt45">PICK ' + NAME[w] + '?</div><div class="pd45">YOU CAN ONLY OWN ONE. ' + NAME[o] + ' LOCKS FOR GOOD.<br>COSTS ' + PRICE + ' DIMES.</div></div>' +
    '<div class="row" style="justify-content:center;gap:8px">' + btnH('BACK', 'v45close', null, 'g') + btnH('YES PICK ' + SH[w], 'v45yes', w, ok ? 'y' : 'd', 'YES, PICK ' + SH[w]) + '</div>';
  }
  return '<div class="pop17" data-a="v45close" data-v="bg"><div class="pbox17 pv45" data-a="v17noop">' + inner + '</div></div>';
 }
 /* ---------- locker room: N/A uniforms get a WHALE / CROWN block, uniform only (no player) ---------- */
 function lockerBlock() {
  css();
  const have = pick(), wr = wearing(), tk = teamKit(myTeam());
  const tile = w => {
   const own = have === w, lk = !own, rr = own ? (wr === w ? 'WEARING' : 'TAP TO WEAR') : 'LOCKED';
   const sub = own ? '' : '<small class="wh17">' + (have ? 'YOU PICKED ' + NAME[have] : 'SHOP - ' + PRICE + ' DIMES') + '</small>';
   return '<button type="button" class="c17 uni17' + (lk ? ' lk' : '') + (own && wr === w ? ' wr17' : '') + '" data-a="v45wear" data-v="' + w + '" aria-label="' + esc(NAME[w] + (own ? wr === w ? ' (WEARING)' : '' : ' (LOCKED)')) + '"><div class="art"><img src="' + iconUrl(w, tk.helm || '#1d2a5e') + '" alt=""></div><div class="nm">' + NAME[w] + '</div><div class="rr">' + rr + '</div>' + sub + '</button>';
  };
  return '<div class="sec17 uni2319 fit45sec"><div class="sh17">WHALE / CROWN <span>' + (have ? 1 : 0) + ' / 1</span></div><div class="grid17">' + tile('whale') + tile('crown') + '</div></div>';
 }
 if (typeof PANEL_RENDER !== 'undefined' && typeof PANEL_ACT !== 'undefined') {
  const shop0 = PANEL_RENDER.shop17;
  if (typeof shop0 === 'function') PANEL_RENDER.shop17 = function() {
   let h = shop0.apply(this, arguments);
   if (off()) return h;
   try { const m = '<div class="scroll" id="shopList">'; if (h.indexOf(m) >= 0) h = h.replace(m, m + card()) + popHtml(); } catch (e) {}
   return h;
  };
  const lk0 = PANEL_RENDER.locker17;
  if (typeof lk0 === 'function') PANEL_RENDER.locker17 = function() {
   let h = lk0.apply(this, arguments);
   if (off()) return h;
   try { const m = '<div class="scroll" id="lockList">';
    if (h.indexOf('data-a="v17unig" data-v="na" class="on"') >= 0 && h.indexOf(m) >= 0) h = h.replace(m, m + lockerBlock()); } catch (e) {}
   return h;
  };
  Object.assign(PANEL_ACT, {
   v45prev(v) { if (FIT[v]) pop = { k: 'prev', w: v }; },
   v45pick(v) { if (!FIT[v]) return; if (pick()) { pop = null; buy(v); return; } pop = { k: 'conf', w: v }; },
   v45yes(v) { pop = null; buy(v); },
   v45close() { pop = null; },
   v45wear(v) { if (FIT[v]) setWear(v); }
  });
 }
 window.V445 = { on: () => !off(), pick: pick, wearing: wearing, buy: buy, setWear: setWear, bakeFit: bakeFit, padFrame: padFrame, fit: fit, FIT: FIT, PRICE: PRICE };
})();
