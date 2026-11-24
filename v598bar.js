/* v598bar.js - Bagga Lax 1.5f: LOCKER SALES BAR (Charlie approved).
 * Bug: selling paid a flat 1 / 3 / 15 dimes per item (items17 SELL_PRICE), so 100 basic sticks = 100 dimes, and anything
 *  bought with dimes could be sold back for close to what it cost.
 * Fix: selling fills a bar instead. COMMON 1, RARE 3, EPIC 6, LEGENDARY 12 points; 50 points = 10 dimes, leftover points
 *  carry into the next fill. The level is kept in rl_lsb598 (every rl_ key rides in the cloud save, acct23).
 *  Anti-exploit: copies bought with dimes (any shop, pack, bundle or Yard Sale buy that takes dimes and adds items in the
 *  same moment) are remembered with their price per copy and give at most  price  points, so points x (10/50) <= 20% of
 *  what they cost: buying then selling always loses. Bought copies are sold first. Free / won / daily-pack copies give
 *  full points. items17 sell() + its sell popup call LSB598.sold / LSB598.preview (the only item sell path).
 *  UI: a slim LOCKER SALES bar at the top of the locker with "+N" on each sale, a fill animation and a coin burst.
 * No ids, existing rl_ keys or net changes. Kill switch: window.__rl_no598bar (back to the flat price).
 */
(function () {
 'use strict';
 const Wn = window;
 if (Wn.__rl_no598bar || Wn.LSB598) return;
 const PTS_COMMON = 1, PTS_RARE = 3, PTS_EPIC = 6, PTS_LEGENDARY = 12;
 const BAR_POINTS = 50, BAR_DIMES = 10;
 const DIMES_PER_POINT = BAR_DIMES / BAR_POINTS;  // 0.2
 const BUY_RETURN_MAX = 0.20;                      // a bought copy may give back at most 20% of its price
 const KEY = 'rl_lsb598', SCAN_MS = 150;
 // items17 rarities are COMMON 0 / RARE 1 / LEGENDARY 2 (there is no EPIC item yet; PTS_EPIC is ready for one)
 const RAR_PTS = { 0: PTS_COMMON, 1: PTS_RARE, 2: PTS_LEGENDARY, epic: PTS_EPIC };
 const ptsFor = rar => RAR_PTS[rar] != null ? RAR_PTS[rar] : PTS_COMMON;
 const capFor = price => Math.max(0, price * BUY_RETURN_MAX / DIMES_PER_POINT); // points that pay back exactly 20% of price
 const r1 = x => Math.round(x * 10) / 10;
 const fmt = x => { const v = r1(x); return v % 1 ? v.toFixed(1) : String(v); };
 let S = { p: 0, b: {}, t: 0, n: 0 };
 function load() { try { const j = JSON.parse(localStorage.getItem(KEY) || 'null'); if (j && typeof j === 'object') S = { p: +j.p || 0, b: j.b && typeof j.b === 'object' ? j.b : {}, t: +j.t || 0, n: +j.n || 0 }; } catch (e) {} }
 function store() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
 load();
 const ST = () => { try { return Wn.V17 && V17.ST && V17.ST(); } catch (e) { return null; } };
 // ---- bought-copy tracking: a tick that both spends dimes and adds items = a purchase of those items ----
 let snapC = null, snapI = null;
 function snap() { const s = ST(); if (!s || !s.inv) return; snapC = s.chinos | 0; snapI = Object.assign({}, s.inv); }
 function scan() {
  const s = ST(); if (!s || !s.inv) return;
  if (snapI == null) return snap();
  const spent = snapC - (s.chinos | 0), got = [];
  let n = 0;
  for (const id in s.inv) { const d = (s.inv[id] | 0) - (snapI[id] | 0); if (d > 0) { got.push([id, d]); n += d; } }
  if (spent > 0 && n > 0) {
   const each = spent / n; // price per copy
   for (const [id, d] of got) { const L = S.b[id] = S.b[id] || []; L.push([d, r1(Math.min(ptsFor(V17.BY[id] ? V17.BY[id].rar : 0), capFor(each)))]); if (L.length > 40) L.splice(0, L.length - 40); }
   store();
  }
  snap();
 }
 // points for selling q copies of id (bought copies first); consume = really remove them from the bought list
 function pointsFor(id, q, rar, consume) {
  const full = ptsFor(rar), s = ST(), own = s && s.inv ? s.inv[id] | 0 : q;
  let L = (S.b[id] || []).map(x => x.slice()), boughtLeft = L.reduce((a, x) => a + x[0], 0);
  if (boughtLeft > own) { let over = boughtLeft - own; while (over > 0 && L.length) { const k = Math.min(over, L[0][0]); L[0][0] -= k; over -= k; if (!L[0][0]) L.shift(); } } // copies that left the locker another way
  let pts = 0, left = q;
  while (left > 0 && L.length) { const k = Math.min(left, L[0][0]); pts += k * Math.min(full, L[0][1]); L[0][0] -= k; left -= k; if (!L[0][0]) L.shift(); }
  pts += left * full;
  if (consume) { if (L.length) S.b[id] = L; else delete S.b[id]; }
  return r1(pts);
 }
 let anim = null; // { from, to, fills, add, t }
 function sold(id, q, rar) {
  scan();
  const pts = pointsFor(id, q, rar, true), from = S.p;
  let p = S.p + pts, fills = 0;
  while (p >= BAR_POINTS - 1e-9) { p -= BAR_POINTS; fills++; }
  S.p = r1(p); S.t += pts; S.n += fills; store();
  anim = { from: from, to: S.p, fills: fills, add: pts, t: Date.now() };
  setTimeout(play, 0);
  const dimes = fills * BAR_DIMES;
  return { dimes: dimes, pts: pts, ptsTxt: fmt(pts), fills: fills };
 }
 function preview(id, q, rar) {
  scan();
  const pts = pointsFor(id, q, rar, false), full = ptsFor(rar), tot = S.p + pts, fills = Math.floor((tot + 1e-9) / BAR_POINTS);
  const capped = pts < q * full - 1e-9;
  return {
   pts: pts,
   each: ['COMMON', 'RARE', 'LEGENDARY'][rar] + ' = ' + full + ' BAR POINT' + (full > 1 ? 'S' : '') + ' EACH' + (capped ? ' (BOUGHT ONES LESS)' : ''),
   pay: '+' + fmt(pts) + ' SALES BAR' + (fills ? ' = +' + fills * BAR_DIMES + ' DIMES' : ' (' + fmt(Math.min(tot, BAR_POINTS)) + '/' + BAR_POINTS + ')')
  };
 }
 // ---- UI: slim bar at the top of the locker ----
 const css = document.createElement('style');
 css.textContent = '#lsb598{position:relative;display:flex;align-items:center;gap:6px;margin:0 0 6px;padding:3px 6px;background:#0b1a20;border:2px solid #05080b;box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 2px 0 #000;font:bold 10px ui-monospace,Menlo,Consolas,monospace;text-transform:uppercase;color:#ffe14d;min-width:0}' +
  '#lsb598 .l{flex:none;letter-spacing:.5px}#lsb598 .tr{position:relative;flex:1;min-width:40px;height:9px;background:#05080b;border:1px solid #2c4452;overflow:hidden}' +
  '#lsb598 .f{position:absolute;left:0;top:0;bottom:0;background:repeating-linear-gradient(90deg,#7dff7a 0 6px,#5ad85a 6px 7px);box-shadow:inset 0 2px 0 rgba(255,255,255,.35);transition:width .45s steps(12)}' +
  '#lsb598 .n{flex:none;color:#cfe;font-size:9px}#lsb598 .r{flex:none;color:#9fb8c4;font-size:9px;white-space:nowrap}' +
  '#lsb598 .pl{position:absolute;right:46px;top:-2px;color:#7dff7a;text-shadow:1px 1px 0 #000;animation:lsb598u .9s steps(6) forwards;pointer-events:none}' +
  '#lsb598 .cn{position:absolute;width:6px;height:6px;background:#ffcc33;border:1px solid #5a3d00;animation:lsb598c .8s steps(8) forwards;pointer-events:none}' +
  '@keyframes lsb598u{from{transform:translateY(0);opacity:1}to{transform:translateY(-14px);opacity:0}}' +
  '@keyframes lsb598c{from{transform:translate(0,0);opacity:1}to{transform:translate(var(--dx),var(--dy));opacity:0}}' +
  '@media (max-width:700px){#lsb598 .r{display:none}}';
 document.head.appendChild(css);
 function html() {
  const w = Math.max(0, Math.min(100, S.p / BAR_POINTS * 100));
  return '<div id="lsb598" role="group" aria-label="LOCKER SALES ' + fmt(S.p) + ' OF ' + BAR_POINTS + '"><span class="l">LOCKER SALES</span><span class="tr"><span class="f" style="width:' + w + '%"></span></span><span class="n">' + fmt(S.p) + '/' + BAR_POINTS + '</span><span class="r">FULL = +' + BAR_DIMES + ' DIMES</span></div>';
 }
 function play() {
  const a = anim; if (!a) return; anim = null;
  const el = document.getElementById('lsb598'); if (!el) return;
  const f = el.querySelector('.f'), n = el.querySelector('.n');
  const pl = document.createElement('span'); pl.className = 'pl'; pl.textContent = '+' + fmt(a.add); el.appendChild(pl); setTimeout(() => pl.remove(), 1000);
  if (a.fills) {
   f.style.width = '100%';
   setTimeout(() => {
    for (let i = 0; i < 10; i++) { const c = document.createElement('span'); c.className = 'cn'; c.style.left = (el.clientWidth - 60) + 'px'; c.style.top = '2px'; c.style.setProperty('--dx', Math.round(Math.cos(i * .63) * 40) + 'px'); c.style.setProperty('--dy', Math.round(Math.sin(i * .63) * 22 - 10) + 'px'); el.appendChild(c); setTimeout(() => c.remove(), 900); }
    const t = document.createElement('span'); t.className = 'pl'; t.style.right = '6px'; t.style.color = '#ffcc33'; t.textContent = '+' + a.fills * BAR_DIMES + ' DIMES'; el.appendChild(t); setTimeout(() => t.remove(), 1000);
    f.style.transition = 'none'; f.style.width = '0%'; void f.offsetWidth; f.style.transition = ''; f.style.width = (a.to / BAR_POINTS * 100) + '%';
   }, 480);
  } else f.style.width = (a.to / BAR_POINTS * 100) + '%';
  if (n) n.textContent = fmt(a.to) + '/' + BAR_POINTS;
 }
 // the locker panel re-renders its HTML; the bar goes first, then the animation runs on the new element
 try {
  if (typeof PANEL_RENDER === 'object' && typeof PANEL_RENDER.locker17 === 'function') {
   const r0 = PANEL_RENDER.locker17;
   PANEL_RENDER.locker17 = function () {
    const h = r0.apply(this, arguments);
    if (Wn.__rl_no598bar) return h;
    const a = anim, from = a ? a.from : S.p, w = Math.max(0, Math.min(100, from / BAR_POINTS * 100));
    let bar = html(); if (a) bar = bar.replace(/width:[0-9.]+%/, 'width:' + w + '%');
    if (a) setTimeout(play, 30);
    return bar + h;
   };
  }
 } catch (e) {}
 // audit: what a full sell-back of every dime pack could ever return (logged once; LSB598.audit() for the full list)
 function audit() {
  const out = [];
  try {
   const P = V17.PACKS;
   for (const k in P) {
    const pk = P[k]; if (!pk || !(pk.cost > 0)) continue;
    const n = pk.bundle ? pk.bundle.length : (pk.slots ? pk.slots.length : 5), each = pk.cost / n, cap = capFor(each);
    const worst = n * Math.min(PTS_LEGENDARY, cap), back = worst * DIMES_PER_POINT, uncapped = n * PTS_LEGENDARY * DIMES_PER_POINT;
    out.push({ pack: k, cost: pk.cost, perCopy: r1(each), capPts: r1(cap), worstBackDimes: r1(back), ok: back <= pk.cost * BUY_RETURN_MAX + 1e-9 && back < pk.cost, wouldBreakWithoutCap: uncapped > pk.cost * BUY_RETURN_MAX });
   }
  } catch (e) {}
  return out;
 }
 setInterval(() => { try { if (!Wn.__rl_no598bar) scan(); } catch (e) {} }, SCAN_MS);
 Wn.LSB598 = { sold: sold, preview: preview, scan: scan, snap: snap, audit: audit, st: () => S, C: { PTS_COMMON, PTS_RARE, PTS_EPIC, PTS_LEGENDARY, BAR_POINTS, BAR_DIMES, BUY_RETURN_MAX } };
 setTimeout(() => { try { const a = audit(), bad = a.filter(x => x.wouldBreakWithoutCap); if (bad.length) console.log('[LSB598] packs capped by the 20% rule:', bad.map(x => x.pack + ' ' + x.cost + 'd cap ' + x.capPts + 'pt').join(', ')); } catch (e) {} }, 3000);
})();
