(function() {
 'use strict';
 if (typeof window.hudName27 !== 'function' || typeof window.drawHUD !== 'function') return;
 const O27 = window.hudName27, OHUD = window.drawHUD, MIN_K = .75;
 let Q = null;
 const off = () => !!(window.__rl_no35sb || window.__rl_no27hudfit || window.__rl_no27);
 const avail = bw => bw - 2 - textW('00', 2) - 2 - 17;
 function fitSize(n, av) {
  const lim = av * RR, minC = Math.max(1, Math.ceil(MIN_K * RR));
  for (let c = RR; c >= minC; c--) for (let gp = c; gp >= Math.max(1, Math.ceil(c / 2)); gp--) if (n * 3 * c + (n - 1) * gp <= lim) return {
   C: c,
   Gp: gp
  };
  return null;
 }
 function plan(nm, av) {
  const s0 = fold2318(String(nm || '')).toUpperCase().replace(/\s+/g, ' ').trim();
  let s = s0.replace(/^(PAST SEASON|SEASON|WORLD)\s+/, '');
  let f = fitSize(s.length, av);
  if (f) return Object.assign({
   s: s,
   abbr: false
  }, f);
  const w = s.split(' ');
  for (let i = 0; i < w.length - 1; i++) {
   if (w[i].length <= 2) continue;
   w[i] = w[i].slice(0, 2);
   const t = w.join(' ');
   f = fitSize(t.length, av);
   if (f) return Object.assign({
    s: t,
    abbr: true
   }, f);
  }
  let t = w.join(' ');
  const minC = Math.max(1, Math.ceil(MIN_K * RR)), mg = Math.max(1, Math.ceil(minC / 2));
  while (t.length > 1 && t.length * 3 * minC + (t.length - 1) * mg > av * RR) t = t.slice(0, -2).trimEnd() + '.';
  return {
   s: t,
   abbr: true,
   C: minC,
   Gp: mg
  };
 }
 window.hudName27 = function(nm, bw) {
  if (!Q || off()) return O27.apply(this, arguments);
  const av = avail(bw), s1 = O27.call(this, nm, bw), full = String(nm || ''), strip = full.replace(/^(PAST SEASON|SEASON|WORLD)\s+/, '');
  if (s1 === full || s1 === strip) {
   Q.push(null);
   return s1;
  }
  Q.push(plan(nm, av));
  return '';
 };
 function draw(P, xa, right, col, y) {
  y = y == null ? 3 : y;
  if (typeof SA2403B !== 'undefined' && SA2403B && typeof sa2403By === 'function') y = sa2403By(y);
  const n = P.s.length, cell = P.C / RR, adv = (3 * P.C + P.Gp) / RR, w = (n * 3 * P.C + (n - 1) * P.Gp) / RR;
  const x0 = Math.round((right ? xa - w : xa) * RR) / RR, y0 = Math.round((y + (5 - 5 * cell) / 2) * RR) / RR;
  if (window.__rlTextLog) window.__rlTextLog.push(screen + '|' + P.s);
  g.fillStyle = col;
  for (let i = 0; i < n; i++) {
   const gl = FONT[P.s[i]] || FONT['?'];
   for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) if (gl[r][c] === '#') g.fillRect(x0 + i * adv + c * cell, y0 + r * cell, cell, cell);
  }
  return {
   s: P.s,
   x0: x0,
   x1: x0 + w,
   y0: y0,
   h: 5 * cell,
   cell: cell,
   gap: P.Gp / RR,
   abbr: P.abbr,
   RR: RR
  };
 }
 window.drawHUD = function() {
  if (off()) return OHUD.apply(this, arguments);
  Q = [];
  let r;
  try {
   r = OHUD.apply(this, arguments);
  } finally {
   const q = Q;
   Q = null;
   const out = {};
   try {
    const G = game;
    if (G && q.length >= 1 && q[0]) out.L = draw(q[0], 17, false, textOn(G.uk.jersey));
    if (G && q.length >= 2 && q[1]) out.R = draw(q[1], W - 17, true, textOn(G.ok.jersey));
   } catch (e) {
    console.warn('v35sb', e);
   }
   window.__sb35 = out;
  }
  return r;
 };
 function seasonLine(nm, s, av) {
  const yr = s.slice(nm.length).replace(/ SEASON$/, ''), c = [ s, nm + yr ], w = nm.split(' ');
  for (let i = 0; i < w.length - 1; i++) {
   if (w[i].length <= 2) continue;
   w[i] = w[i].slice(0, 2);
   c.push(w.join(' ') + yr);
  }
  for (const t of c) {
   const f = fitSize(t.length, av);
   if (f) return Object.assign({
    s: t,
    abbr: t !== s
   }, f);
  }
  return plan(nm, av);
 }
 if (typeof window.drawSeason === 'function') {
  const ODS = window.drawSeason;
  window.drawSeason = function() {
   if (off() || typeof season === 'undefined' || !season) return ODS.apply(this, arguments);
   let me = null;
   try {
    me = T(season.team);
   } catch (e) {}
   if (!me) return ODS.apply(this, arguments);
   const want = me.name + '  ' + season.year + ' SEASON', av = W - 188 - 2 - 20, TX = window.text;
   let hit = null;
   window.text = function(s, x, y, sc) {
    if (!hit && s === want && x === 20 && y === 3 && (sc == null || sc === 1) && textW(fold2318(s)) > av) {
     try {
      hit = draw(seasonLine(fold2318(me.name).toUpperCase(), fold2318(s).toUpperCase(), av), 20, false, '#fff', 3);
      return hit.x1 - hit.x0;
     } catch (e) {
      console.warn('v35sb', e);
     }
    }
    return TX.apply(this, arguments);
   };
   try {
    return ODS.apply(this, arguments);
   } finally {
    if (window.text !== TX) window.text = TX;
    window.__sb35s = hit;
   }
  };
 }
 window.V35SB = {
  plan: plan,
  fitSize: fitSize,
  avail: avail,
  seasonLine: seasonLine
 };
})();
