// v427pm.js - V42.7 PLAYMAKER SUBS YOU CAN SEE + CLEAR LSM SLOT (kill switch: window.__rl_no427pm = true -> exactly like before)
// Charlie (Nov 3): "i wanted to sub my guy out of box and pass to him but it never actually shows the subbed guy in the playmaker.
// Have it so in the preview when the ball is in he actually comes out the box so you can pass to him" + "there's no LSM in this
// have it be an LSM instead of the third Middie" + "On rides in playmaker it should be m3 not LSM ... just in clears".
// (1) PLAY (the ball part) + PREVIEW: a SUB step's OFF guy jogs his drawn run into the sub box at his OFF time, the ON guy
//     waits in the box, then comes out at his ON time and runs his drawn ON run. He is a real piece: his name is on him, you
//     tap him to pass (the ball flies to where he really is), he catches and you move him. No pass to a guy on his way off /
//     still in the box. The recorded play keeps all of it, so PREVIEW shows the same thing and SAVE keeps the pass to him.
//     In games the sub runs on the play's own sub machinery (v421s.js) - same player object, so the pass goes to the subbed-in guy.
//     Before PLAY / after it, the ON guy stands (faded) at the end of his ON run so you always see who comes on and where.
// (2) CLEARS: the 3rd middie dot is the LSM (G, D1 D2 D3, M1 M2, LSM, A1 A2 A3). Rides keep M1 M2 M3. No LSM on the team in a
//     game -> the 3rd middie takes the LSM spot and a play's LSM sub uses him (v421s.js / v420c.js / v424rs.js).
// Hooks: v42pd.js calls window.PM427 (start / tick / passOk / busy / done / strip). Offline only (the playmaker is offline).
(function () {
 'use strict';
 const W0 = window;
 if (W0.__rl_v427pm_loaded) return;
 W0.__rl_v427pm_loaded = 1;
 const off = () => !!(W0.__rl_no427pm || W0.__rl_v124gb || W0.__rl_no421s || W0.__rl_no421pm);
 const LOG = { ev: [], err: 0, ticks: 0, blocked: 0, held: 0, swapLbl: 0, ghost: 0, strip: 0 };
 const lg = o => { LOG.ev.push(o); if (LOG.ev.length > 200) LOG.ev.shift(); };
 const er = e => { LOG.err++; if (LOG.err < 4) try { console.error(e); } catch (x) {} };
 const scr = () => { try { return screen; } catch (e) { return ''; } };
 const PMo = () => { try { return typeof PM !== 'undefined' ? PM : null; } catch (e) { return null; } };
 const S4 = () => W0.S421 && W0.S421.pm && typeof W0.S421.pm.offPts === 'function' ? W0.S421 : null;
 const catNow = pl => { try { return pmCat(pl || (PMo() && PMo().play)); } catch (e) { return 'OFFENSE'; } };
 const steps = () => { const P = PMo(); return P && P.play && Array.isArray(P.play.sub421) ? P.play.sub421.filter(s => s && s.off && s.dot != null && s.mode !== 'mid') : []; };
 const key = () => { const P = PMo(); return JSON.stringify(P && P.play && P.play.sub421 || []); };
 const pAt = (path, t) => {
  if (!path || !path.length) return null;
  if (t <= path[0][0]) return [ path[0][1], path[0][2] ];
  const L = path[path.length - 1]; if (t >= L[0]) return [ L[1], L[2] ];
  let k = 0; while (k < path.length - 1 && path[k + 1][0] <= t) k++;
  const a = path[k], b = path[k + 1], f = (t - a[0]) / (b[0] - a[0] || 1);
  return [ a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f ];
 };
 const tmOf = st => ({ id: st.team, src: st.src || 'real' });
 const whoOn = st => { try { return S4().pm.who(st.on.id, tmOf(st)); } catch (e) { return 'SUB'; } };

 // ---------- (2) the clear's 3rd middie dot is the LSM (rides keep M3) ----------
 const LB0 = W0.pmLbl;
 if (typeof LB0 === 'function') {
  W0.pmLbl = function (i, pl) {
   const l = LB0.apply(this, arguments);
   if (off()) return l;
   try {
    if (pl === undefined || (PMo() && pl === PMo().play)) { const s = swapLbl(i); if (s) { LOG.swapLbl++; return s; } }
    if (l === 'M3' && i === 6 && catNow(pl) === 'CLEAR') return 'LSM';
   } catch (e) { er(e); }
   return l;
  };
 }

 // ---------- (1) the sub timeline while you run the ball part ----------
 function mk(d, st) { return { st, i: st.dot, t0: Math.max(0, +st.at || 0), offTL: null, onTL: null, tArr: null, tOn: null, tEnd: null, user: null, waitMsg: 0 }; }
 function build(E, p0) {
  const S = S4(); if (!S) return false;
  const v = S.pm.vrun(), box = S.pm.box(), op = S.pm.offPts(E.st);
  E.offTL = S.pm.tl([ p0 ].concat(op && op.length > 1 ? op.slice(1) : [ box ]), E.t0, v);
  E.tArr = E.offTL[E.offTL.length - 1][0];
  const np = E.st.on ? S.pm.onPts(E.st) : null;
  if (np && np.length) { E.tOn = Math.max(E.tArr, E.st.onAt != null && isFinite(+E.st.onAt) ? +E.st.onAt : E.tArr); E.onTL = S.pm.tl(np, E.tOn, v); E.tEnd = E.onTL[E.onTL.length - 1][0]; }
  else { E.tOn = null; E.onTL = null; E.tEnd = E.tArr; }
  return true;
 }
 function where(E, T) {
  if (T <= E.tArr) return pAt(E.offTL, T);
  if (!E.onTL || T < E.tOn) return S4().pm.box();
  return pAt(E.onTL, T);
 }
 const evOf = (L, i) => L && L.s427 ? L.s427.find(E => E.i === i) : null;
 const PM427 = W0.PM427 = {
  LOG,
  on: () => !off(),
  start(d) {
   if (off() || !d.live || !S4()) return;
   const seen = new Set(), ev = [];
   for (const st of steps()) { if (seen.has(st.dot)) continue; seen.add(st.dot); ev.push(mk(d, st)); }
   d.live.s427 = ev.length ? ev : null; d.live.k427 = key();
   if (ev.length) lg({ ev: 'start', n: ev.length, dots: ev.map(E => E.i) });
  },
  tick(d, L, dt) {
   if (off() || !L || !L.s427 || L.cd > 0) return;
   LOG.ticks++;
   const T = L.T;
   for (const E of L.s427) {
    const i = E.i, p = L.pos[i]; if (!p) continue;
    if (T + 1e-6 < E.t0) continue;
    if (!E.offTL) {
     if (i === L.car || (L.fly && L.fly.to === i)) { E.t0 = T + dt; if (!E.waitMsg) { E.waitMsg = 1; d.msg = 'HE HAS THE BALL - PASS IT, THEN HE SUBS OFF'; d.flash = 1.4; } LOG.held++; continue; }
     if (!build(E, p.slice())) continue;
     lg({ ev: 'off', dot: i, t0: +E.t0.toFixed(2), tArr: +E.tArr.toFixed(2), tOn: E.tOn == null ? null : +E.tOn.toFixed(2), tEnd: +E.tEnd.toFixed(2) });
    }
    // the ON guy has the ball and you move him: he stays where you take him
    if (i === L.car && L.lastJoy === L.T && E.tOn != null && T >= E.tOn) { E.user = p.slice(); continue; }
    if (i === L.car && T < (E.tOn == null ? 1e9 : E.tOn)) { continue; }
    const q = E.user || where(E, T);
    if (!q) continue;
    const dd = Math.hypot(q[0] - p[0], q[1] - p[1]);
    if (d.anim && dd < 30) d.anim[i] = (d.anim[i] || 0) + dd;
    L.pos[i] = [ q[0], q[1] ];
    L.off[i] = 0;
    if (T <= E.tEnd + .05) L.lastRun = T;
   }
  },
  passOk(d, i) {
   if (off()) return true;
   const L = d.live, E = evOf(L, i);
   if (!E || L.T + 1e-6 < E.t0) return true;
   if (E.onTL && E.tOn != null && L.T >= E.tOn - .05) return true;
   LOG.blocked++;
   d.msg = E.st.on ? (L.T <= (E.tArr || 0) ? 'HE IS SUBBING OFF - ' + whoOn(E.st) + ' COMES OUT OF THE BOX' + (E.tOn != null ? ' AT ' + E.tOn.toFixed(1) + 'S' : '') : whoOn(E.st) + ' IS STILL IN THE BOX') : 'HE IS SUBBING OFF';
   d.flash = 1.3;
   try { SFX.bad(); } catch (e) {}
   return false;
  },
  busy(d, L) {
   if (off() || !L || !L.s427) return false;
   return L.s427.some(E => E.st.on && (E.tEnd == null ? L.T < E.t0 + 8 : L.T < E.tEnd + .1));
  },
  done(d, L) {
   if (off() || !d.play || !L || !L.s427) return;
   d.play.sub427 = L.k427;
   d.play.s427 = L.s427.filter(E => E.offTL).map(E => ({ i: E.i, t0: +E.t0.toFixed(2), tArr: +E.tArr.toFixed(2), tOn: E.tOn == null ? null : +E.tOn.toFixed(2), tEnd: +E.tEnd.toFixed(2), on: E.st.on ? E.st.on.id : null }));
   lg({ ev: 'done', s427: d.play.s427 });
  },
  // the saved routes (pl.steps) must not send the dot's guy to the box and back: the sub machinery runs that part in games
  strip(d, out) {
   if (off()) return;
   const P = d.play; if (!P || !P.s427 || P.sub427 !== key()) return;
   let n = 0;
   for (let k = out.length - 1; k >= 0; k--) {
    const s = out[k][2], t = out[k][1];
    if (!s || s.t !== 'move') continue;
    const E = P.s427.find(e => e.i === s.p);
    if (E && t >= E.t0 - .05 && t <= E.tEnd + .05) { out.splice(k, 1); n++; }
   }
   LOG.strip += n; if (n) lg({ ev: 'strip', n });
  }
  ,
  hasSubs() { return !off() && !!S4() && steps().some(s => s.on); },
  // shape plays (rides, D sets) have no ball part: PREVIEW = everyone holds his spot while the subs run off and on
  shapePreview(d) {
   if (off() || !S4()) return false;
   const P = PMo(), S = S4(), v = S.pm.vrun();
   let T = 1;
   for (const st of steps()) { const op = S.pm.offPts(st); if (!op) continue; let t = (+st.at || 0) + S.pm.tl(op, 0, v).slice(-1)[0][0]; const np = st.on ? S.pm.onPts(st) : null; if (np) { t = Math.max(t, st.onAt != null ? +st.onAt : t); t += S.pm.tl(np, 0, v).slice(-1)[0][0]; } T = Math.max(T, t + .6); }
   T = Math.min(30, T);
   const pos = P.play.start.map(q => [ q[0], q[1] ]), frames = [];
   for (let t = 0; t <= T + 1e-6; t += .1) frames.push([ Math.round(t * 100) / 100, pos.map(q => q.slice()), null, null ]);
   d.play = { T: Math.round(T * 100) / 100, frames, passes: [], car0: null, shape427: 1 };
   d.pv = { t: -.4 };
   LOG.shapePv = (LOG.shapePv || 0) + 1; lg({ ev: 'shapePreview', T: d.play.T, n: steps().length });
   return true;
  }
 };
 // live time of the editor (PLAY or PREVIEW), and the sub events that time applies to
 function nowEv() {
  const P = PMo(), d = P && P.pd42; if (!d || scr() !== 'playmaker') return null;
  if (d.pv && d.play) {
   const t = Math.max(0, d.pv.t);
   if (d.play.s427 && d.play.sub427 === key()) return { t, ev: d.play.s427.map(e => Object.assign({ st: steps().find(s => s.dot === e.i) }, e)).filter(e => e.st) };
   const S = S4(); const pe = S && S.PMS && S.PMS.pvEv;
   if (pe && pe.length) return { t, ev: pe.map(e => ({ st: e.st, i: e.st.dot, t0: e.t0, tArr: e.tArr, tOn: e.tOn, tEnd: e.tEnd, onTL: e.onTL })) };
   return null;
  }
  if (d.phase === 'play' && d.live && d.live.s427) return { t: d.live.T, ev: d.live.s427.filter(E => E.offTL), live: d.live };
  return null;
 }
 function swapLbl(i) {
  const N = nowEv(); if (!N) return null;
  const E = N.ev.find(e => e.i === i); if (!E || !E.st || !E.st.on || E.tOn == null) return null;
  return N.t >= E.tArr - .05 ? whoOn(E.st) : null;
 }
 // ---------- drawing: the ON guy waiting in the box during PLAY, and (faded) at the end of his run before / after PLAY ----------
 function tagS(x, y, s, bg) { try { const w = Math.round(s.length * 2.7 + 6); rect(Math.round(x - w / 2), Math.round(y), w, 7, 'rgba(0,0,0,.78)'); rect(Math.round(x - w / 2), Math.round(y), 1, 7, bg); textMini(s, x, y + 1.5, bg); } catch (e) {} }
 function ghost(x, y, kit, k, a) { try { g.save(); g.globalAlpha = a; g.translate(Math.round(x), Math.round(y)); g.scale(k, k); drawPlayer({ x: 0, y: 0, anim: 0 }, kit, true); g.restore(); } catch (e) { try { g.restore(); } catch (x2) {} } }
 const DP0 = W0.drawPlaymaker;
 if (typeof DP0 === 'function') {
  W0.drawPlaymaker = function () {
   const r = DP0.apply(this, arguments);
   try {
    if (off() || scr() !== 'playmaker') return r;
    const P = PMo(), d = P && P.pd42, S = S4(); if (!d || !S || !P.play) return r;
    const kit = S.pm.kit(), k = S.pm.vk();
    if (d.phase === 'play' && d.live && !d.pv) {
     const L = d.live;
     for (const E of L.s427 || []) {
      if (!E.st.on || !E.offTL || L.T < E.t0 || (E.tOn != null && L.T >= E.tOn)) continue;
      const b = S.pm.box(), s = S.pm.w2s(b[0] + 6, b[1]);
      ghost(s[0], s[1], kit, k * .9, 1);
      tagS(s[0], s[1] - 20 * Math.max(.7, k), whoOn(E.st) + (E.tOn != null ? ' ON AT ' + E.tOn.toFixed(1) + 'S' : ''), '#7dff7a');
     }
     PM427.LOG.drawPlay = (PM427.LOG.drawPlay || 0) + 1;
    } else if (!d.pv && !S.PMS.open && d.phase !== 'play') {
     for (const st of steps()) {
      if (!st.on) continue;
      const np = S.pm.onPts(st); if (!np || !np.length) continue;
      const e = np[np.length - 1], s = S.pm.w2s(e[0], e[1]);
      ghost(s[0], s[1], kit, k, .55);
      LOG.ghost++;
     }
    }
   } catch (e) { er(e); }
   return r;
  };
 }
})();
