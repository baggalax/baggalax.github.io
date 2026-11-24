/* v600clash.js - Bagga Lax 1.5f: uniform clash check compares the colours actually DRAWN
 * Bug: the CHOOSE ALTERNATE UNI check (v591alt) said a GREEN uni was too close to a WHITE bot uni.
 * Cause: v591alt compared kit DATA, not what is on screen: (1) "same uni" was an id test (base team / k21 / fit45) that
 *   calls two different-looking kits the same when the variant number is lost or two teams share a base (card teams,
 *   Locker League); (2) special unis (Whale / Crown fit45, ranked rk15, g27 patterns) keep their base team colours in
 *   .jersey/.helm/.shorts while drawing something else, so the colour math used the wrong colours.
 * Fix: each kit is drawn off screen with the real player drawer (drawPlayer, same code as the field), two poses.
 *   Masks from plain probe kits say which pixels are jersey (weight 3) and which are other kit parts (helmet, shorts,
 *   trim: weight 1). Distance = weighted mean RGB distance of those pixels. Clash only when that is below THR
 *   (same uni = 0 clashes, white vs light grey clashes, green vs white passes). Pure canvas fillRect / unsmoothed
 *   drawImage, so both phones get the same numbers. Every check is logged to window.__alt600log (colours + distance).
 * Kill switch: window.__rl_no600clash (back to v591alt's own test)
 */
(function () {
 const Wn = window;
 const THR = 100;
 const SZ = 48, POSES = [[24, 40, 0, true], [24, 40, 3, false]];
 const cache = new Map;
 const plain = k => { const o = Object.assign({}, k); delete o.g27; delete o.fit45; delete o.rk15; delete o.alt15; return o; };
 function draw(kit) {
  const c = document.createElement('canvas'); c.width = SZ * POSES.length; c.height = SZ; const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  const g0 = g;
  try { g = x; POSES.forEach((P, i) => { drawPlayer({ x: P[0] + i * SZ, y: P[1], anim: P[2], vx: 0, vy: 0, team: 0, role: 'm', state: 'idle' }, kit, P[3]); }); }
  finally { g = g0; }
  return x.getImageData(0, 0, c.width, c.height).data;
 }
 function px(kit) { const key = JSON.stringify(kit); let d = cache.get(key); if (!d) { d = draw(kit); if (cache.size > 200) cache.clear(); cache.set(key, d); } return d; }
 let MASK = null;
 function mask() {
  if (MASK) return MASK;
  const base = { jersey: '#808080', trim: '#808080', helm: '#808080', shorts: '#808080', gloves: '#808080', socks: '#808080' };
  const p0 = draw(base), pj = draw(Object.assign({}, base, { jersey: '#ff00ff' })), pa = draw({ jersey: '#808080', trim: '#00ffff', helm: '#00ffff', shorts: '#00ffff', gloves: '#00ffff', socks: '#00ffff' });
  const n = p0.length / 4, w = new Uint8Array(n);
  for (let i = 0; i < n; i++) { const o = i * 4; const dj = p0[o] !== pj[o] || p0[o + 1] !== pj[o + 1] || p0[o + 2] !== pj[o + 2]; const da = p0[o] !== pa[o] || p0[o + 1] !== pa[o + 1] || p0[o + 2] !== pa[o + 2]; w[i] = dj ? 3 : da ? 1 : 0; }
  return MASK = w;
 }
 function dist(a, b) {
  const A = px(a), B = px(b), M = mask(); let s = 0, n = 0;
  for (let i = 0; i < M.length; i++) { const w = M[i]; if (!w) continue; const o = i * 4; s += w * Math.hypot(A[o] - B[o], A[o + 1] - B[o + 1], A[o + 2] - B[o + 2]); n += w; }
  return n ? s / n : 999;
 }
 function main(kit) { const A = px(kit), M = mask(), h = {}; for (let i = 0; i < M.length; i++) if (M[i] === 3) { const o = i * 4, k = '#' + ((1 << 24) + (A[o] << 16) + (A[o + 1] << 8) + A[o + 2]).toString(16).slice(1); h[k] = (h[k] || 0) + 1; } return Object.keys(h).sort((p, q) => h[q] - h[p])[0] || null; }
 function clash(ta, a, tb, b) {
  const d = dist(a, b), r = d < THR;
  try { const L = Wn.__alt600log = Wn.__alt600log || []; L.push({ a: ta, b: tb, aj: main(a), bj: main(b), ad: a.jersey, bd: b.jersey, af: a.fit45 || a.rk15 || a.g27 || '', bf: b.fit45 || b.rk15 || b.g27 || '', d: Math.round(d), clash: r }); if (L.length > 40) L.shift(); } catch (e) {}
  return r;
 }
 const on = () => !Wn.__rl_no600clash && typeof drawPlayer === 'function';
 Wn.ALT600 = { on: on, dist: dist, clash: clash, main: main, THR: THR };
})();
