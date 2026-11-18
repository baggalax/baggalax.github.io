/* v561fix.js - Bagga Lax 1.3 gameplay fixes (loaded after every other file by the v361p.js loader).
   1) AUTO-SWITCH (defense): the defender the game jumps to on a pass is the one closest to the ball AND in front of it
      (between the ball and your goal), with sideways drift from the ball-to-goal line counted against him.
      No defender in front -> the game's old pick. Overrides c7Pick. Kill switch: window.__rl_no561sw
   2) PULL-TO-SHOOT BOUNDARY (offense): no shot pull from behind the goal line extended (carrier x past the goal line).
      Finish-circle taps and the over-the-shoulder shot (V28.otsOk) are unchanged. Wraps SHOT26.down. Kill switch: window.__rl_no561gle
   3) CPU OFFENSE: a CPU carrier right in front of your net, with your goalie out of the crease or nobody pressing him,
      shoots instead of passing. Wraps off110Decide. Kill switch: window.__rl_no561cpu
   No ids, rl_* keys, saves or net protocol change. */
(function () {
 'use strict';
 const W = window;
 if (W.__rl561) return;
 const S = W.__rl561 = { err: [], sw: 0, gle: 0, cpu: 0 };
 const fail = (w, e) => { if (S.err.length < 20) S.err.push(w + ': ' + String(e && e.message || e)); };
 function wrapGlobal(name, make) {
  try {
   const f0 = W[name];
   if (typeof f0 !== 'function') return false;
   if (f0.__rl561) return true;
   const f1 = make(f0);
   for (const k in f0) { try { f1[k] = f0[k]; } catch (e) {} }
   f1.__rl561 = true;
   W[name] = f1;
   return true;
  } catch (e) { fail('wrap ' + name, e); return false; }
 }

 // ---------- 1) auto-switch: closest AND in front of the ball ----------
 wrapGlobal('c7Pick', o => function (c, def, skip) {
  if (W.__rl_no561sw || !c || !Array.isArray(def)) return o.apply(this, arguments);
  try {
   const cg = Math.hypot(c.x - DGX, c.y - CY);
   const ux = DGX - c.x, uy = CY - c.y, L = Math.hypot(ux, uy) || 1;
   let best = null, bs = 1e9;
   for (const d of def) {
    if (!d || d.team !== 'O' || d.down > 0 || d === skip || d.far) continue;
    if (Math.hypot(d.x - DGX, d.y - CY) >= cg - 1) continue;           // not between the ball and the goal
    const rx = d.x - c.x, ry = d.y - c.y;
    const along = (rx * ux + ry * uy) / L, lat = Math.abs((rx * uy - ry * ux) / L);
    if (along <= 0) continue;
    const s = Math.hypot(rx, ry) + .9 * lat;                           // close, and directly in line with the ball
    if (s < bs) { bs = s; best = d; }
   }
   if (best) { S.sw++; return best; }
  } catch (e) { fail('sw', e); }
  return o.apply(this, arguments);
 });

 // ---------- 3) CPU offense: shoot when open in front of the net ----------
 wrapGlobal('off110Decide', o => function (G, c, atk, def, dGoal, pres) {
  if (!W.__rl_no561cpu && G && c && !G.tutorial) {
   try {
    const gk = G.gk2;
    const gkOut = !gk || gk.down > 0 || Math.hypot(gk.x - DGX, gk.y - CY) > CREASE - 2;
    const front = c.x > DGX + 4 && dGoal < 46 && Math.abs(c.y - CY) < MOUTH + 12;
    if (front && (gkOut || pres === 0) && Math.random() < (gkOut ? .95 : .8)) {
     S.cpu++;
     dShoot(c);
     return true;
    }
   } catch (e) { fail('cpu', e); }
  }
  return o.apply(this, arguments);
 });

 // ---------- 2) no pull-to-shoot from behind the goal line extended ----------
 function wrapShot() {
  const SH = W.SHOT26;
  if (!SH || typeof SH.down !== 'function') return false;
  if (SH.down.__rl561) return true;
  const D0 = SH.down;
  const D1 = function (pt, p) {
   if (!W.__rl_no561gle) {
    try {
     const G = game, c = G && G.carrier;
     if (c && screen === 'live' && G.ball && G.ball.state === 'held' && c.x > GX + .5) {
      const wx = p.x + Math.round(camX), wy = p.y;
      const circle = SH.circlesOn && SH.circlesOn() ? SH.quad(wx, wy, true) : null;
      const ots = !!(W.V28 && V28.otsOk && V28.otsOk(c));
      if (!circle && !ots) { S.gle++; return false; }
     }
    } catch (e) { fail('gle', e); }
   }
   return D0.apply(this, arguments);
  };
  D1.__rl561 = true;
  SH.down = D1;
  return true;
 }
 if (!wrapShot()) { let n = 0; const iv = setInterval(() => { if (wrapShot() || ++n > 40) clearInterval(iv); }, 250); }
 S.on = true;
})();
