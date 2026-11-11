/* v490entr.js - Veterans Day branch ENTRANCES (Bagga Lax). Charlie (Nov 10 2026): "The branches should show up to the
 * game in their own style, for example Air Force flys in and out on a jet, army comes in on tanks, space force by rocket etc."
 * Before the opening faceoff of an OFFLINE match where a branch team plays, a ~3.8 s pixel cutscene runs on the field:
 *   AIR FORCE   - a fighter jet swoops in, hovers low with gear down, the team hops out, the jet climbs away
 *   ARMY        - two tanks roll on, hatches pop, the team climbs out, the tanks back off
 *   SPACE FORCE - a rocket comes down on its flame, lands in a cloud of smoke, the team walks out, it lifts off
 *   NAVY        - a landing ship slides in along the sideline on its own wake, the bow ramp drops, the team runs off
 *   MARINES     - a twin-rotor transport helicopter hovers, the team fast-ropes down
 *   COAST GUARD - a rescue helicopter hovers, the team climbs down its rescue ladder
 * After the final whistle (after the goal celebration, before the FINAL card) the same vehicle comes back and the team
 * boards and leaves (jet flies out, tanks roll out, rocket lifts off, ship sails off, helicopters lift out).
 * Both teams branches? Both play at once, one per half. Tap anywhere (or SKIP >) to skip. Players are the game's own
 * sprites drawn through drawPlayer, so uniforms and shop items show exactly as in play.
 * Original generic pixel vehicles drawn in code: no real insignia, markings or seals.
 * Hooks (all wrappers, game.js untouched): startFaceoff(true) + walkTick2314 (held while the entrance plays, then
 * handed back untouched), drawGear (world layer), drawPregame / drawFinal (caption + skip), drawPlayers / drawBall
 * (hidden only while the exit plays).
 * Team detection: a team whose id or name says ARMY / NAVY / AIR FORCE / MARINE(S) / COAST GUARD / SPACE FORCE
 * (case-insensitive), the v489vets ids VTARM/VTNAV/VTAF/VTMAR/VTCG/VTSF, or a team object flag vet489 / branch. Test hook: window.__rl490force = 'airforce'|'army'|
 * 'spaceforce'|'navy'|'marines'|'coastguard' plays it for YOUR team whatever it is; window.__rl490force2 for the CPU team.
 * Off in online games, the tutorial, and when no branch team plays. No storage keys, no net protocol.
 * Kill switch: window.__rl_no490entr = true.
 */
(function () {
 'use strict';
 const W0 = window;
 const off = () => !!(W0.__rl_no490entr || W0.__rl_v124gb);
 const V = W0.V490 = { log: [], errs: [], plays: 0, exits: 0, skips: 0, last: null, on: () => !off() };
 const err = (e, w) => { try { if (V.errs.length < 8) { V.errs.push((w || '') + ': ' + String(e && e.message || e).slice(0, 160)); console.warn('v490entr', w, e); } } catch (x) {} };
 const need = ['startFaceoff', 'drawGear', 'drawPregame', 'drawFinal', 'drawPlayer', 'drawPlayers', 'drawBall'];
 for (const n of need) if (typeof W0[n] !== 'function') { V.errs.push('missing ' + n); return; }
 const G0 = () => { try { return game; } catch (e) { return null; } };
 const SCR = () => { try { return screen; } catch (e) { return ''; } };
 const camx = () => { try { return camX; } catch (e) { return 0; } };
 const VW = () => { try { return W; } catch (e) { return 380; } };
 const isPaused = () => { try { return !!paused; } catch (e) { return false; } };
 const online = G => { try { return !!(G.online || G.meta && G.meta.online || W0.RLNET && RLNET.inGame); } catch (e) { return true; } };
 const cl = (v, a, b) => v < a ? a : v > b ? b : v;
 const ease = u => u * u * (3 - 2 * u), eo = u => 1 - (1 - u) * (1 - u), ei = u => u * u;
 const KINDS = ['airforce', 'army', 'spaceforce', 'navy', 'marines', 'coastguard'];
 const NAME = { airforce: 'AIR FORCE', army: 'ARMY', spaceforce: 'SPACE FORCE', navy: 'NAVY', marines: 'MARINES', coastguard: 'COAST GUARD' };
 const CAP_IN = { airforce: 'FLIES IN', army: 'ROLLS IN', spaceforce: 'HAS LANDED', navy: 'COMES ASHORE', marines: 'DROP IN', coastguard: 'TO THE RESCUE' };
 const CAP_OUT = { airforce: 'FLIES OUT', army: 'ROLLS OUT', spaceforce: 'BLASTS OFF', navy: 'SAILS OFF', marines: 'LIFT OUT', coastguard: 'HEADS OUT' };

 /* ---------- which branch is a team ---------- */
 function kindOfStr(s) {
  s = String(s || '').toUpperCase().replace(/[_\-.]+/g, ' ');
  if (/SPACE\s*FORCE/.test(s) || /^SPACE ?F/.test(s)) return 'spaceforce';
  if (/COAST\s*GUARD/.test(s) || /COAST\s*GAURD/.test(s)) return 'coastguard';
  if (/AIR\s*FORCE/.test(s)) return 'airforce';
  if (/\bMARINES?\b/.test(s)) return 'marines';
  if (/\bNAVY\b/.test(s)) return 'navy';
  if (/\bARMY\b/.test(s)) return 'army';
  return null;
 }
 function teamObj(id) { try { return typeof T === 'function' ? T(id) : null; } catch (e) { return null; } }
 const IDS = { VTARM: 'army', VTNAV: 'navy', VTAF: 'airforce', VTMAR: 'marines', VTCG: 'coastguard', VTSF: 'spaceforce' };
 function kindOf(id) {
  if (IDS[id]) return IDS[id];
  const t = teamObj(id);
  if (t) {
   for (const f of ['branch', 'vet489', 'branch489']) if (typeof t[f] === 'string' && KINDS.includes(t[f])) return t[f];
   for (const f of ['name', 'full', 'long', 'city', 'nick', 'mascot', 'short']) { const k = kindOfStr(t[f]); if (k) return k; }
  }
  return kindOfStr(id);
 }
 V.kindOf = kindOf;
 function forced(s) { const f = s === 0 ? W0.__rl490force : W0.__rl490force2; return KINDS.includes(f) ? f : null; }
 function sidesOf(G) {
  const r = [null, null];
  for (let s = 0; s < 2; s++) r[s] = forced(s) || kindOf(s === 0 ? G.user : G.opp);
  return r;
 }
 function eligible(G) { return !!G && !off() && !G.tutorial && !G.practice && !online(G) && !G.brave; }

 /* ---------- pixel art: rasterised once into small canvases (art px; drawn at 0.6 like the players) ---------- */
 const AS = 0.6;
 const VS = { airforce: 1, army: .8, spaceforce: .68, navy: 1.05, marines: .9, coastguard: .9 };
 let curS = 1;
 const cache = new Map;
 function art(key, w, h, fn) {
  let c = cache.get(key);
  if (c) return c;
  c = document.createElement('canvas'); c.width = w + 2; c.height = h + 2;
  const x = c.getContext('2d');
  const P = {
   r(a, b, ww, hh, col) { x.fillStyle = col; x.fillRect(a + 1, b + 1, ww, hh); },
   p(pts, col) {
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (const q of pts) { x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); }
    x.fillStyle = col;
    for (let yy = Math.floor(y0); yy <= Math.ceil(y1); yy++) for (let xx = Math.floor(x0); xx <= Math.ceil(x1); xx++) {
     const px0 = xx + .5, py0 = yy + .5; let ins = false;
     for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const a = pts[i], b = pts[j];
      if ((a[1] > py0) !== (b[1] > py0) && px0 < (b[0] - a[0]) * (py0 - a[1]) / (b[1] - a[1]) + a[0]) ins = !ins;
     }
     if (ins) x.fillRect(xx + 1, yy + 1, 1, 1);
    }
   },
   c(cx, cy, rr, col) { x.fillStyle = col; for (let yy = -rr; yy <= rr; yy++) for (let xx = -rr; xx <= rr; xx++) if (xx * xx + yy * yy <= rr * rr + rr * .6) x.fillRect(cx + xx + 1, cy + yy + 1, 1, 1); }
  };
  try { fn(P); } catch (e) { err(e, 'art ' + key); }
  // 1px dark outline around the silhouette
  try {
   const im = x.getImageData(0, 0, c.width, c.height), d = im.data, W2 = c.width, H2 = c.height, o = new Uint8Array(W2 * H2);
   for (let i = 0; i < W2 * H2; i++) o[i] = d[i * 4 + 3] > 0 ? 1 : 0;
   for (let yy = 0; yy < H2; yy++) for (let xx = 0; xx < W2; xx++) {
    const i = yy * W2 + xx; if (o[i]) continue;
    if ((xx > 0 && o[i - 1]) || (xx < W2 - 1 && o[i + 1]) || (yy > 0 && o[i - W2]) || (yy < H2 - 1 && o[i + W2])) { d[i * 4] = 16; d[i * 4 + 1] = 20; d[i * 4 + 2] = 24; d[i * 4 + 3] = 255; }
   }
   x.putImageData(im, 0, 0);
  } catch (e) { err(e, 'outline'); }
  const f = document.createElement('canvas'); f.width = c.width; f.height = c.height;
  const fx = f.getContext('2d'); fx.translate(c.width, 0); fx.scale(-1, 1); fx.drawImage(c, 0, 0);
  const out = { R: c, L: f, w: c.width, h: c.height };
  cache.set(key, out);
  return out;
 }
 const hex = (s, d) => /^#[0-9a-f]{6}$/i.test(String(s || '')) ? s : d;

 // fighter jet, side view, nose right. 98 x 36 art px. gear: landing gear down. tc: team stripe colour
 function jet(gear, tc) {
  return art('jet|' + gear + tc, 98, 36, P => {
   P.p([[8, 1], [16, 1], [30, 13], [6, 13]], '#7d8994');
   P.p([[10, 3], [15, 3], [22, 10], [10, 10]], '#93a0ab');
   P.p([[6, 12], [62, 11], [76, 12], [88, 15], [97, 19], [88, 22], [62, 24], [8, 24], [4, 20]], '#8f9ba6');
   P.p([[8, 19], [92, 19], [88, 22], [62, 24], [8, 24]], '#6f7a85');
   P.r(10, 13, 60, 1, '#b7c1ca');
   P.r(14, 17, 62, 2, tc);
   P.p([[64, 11], [72, 5], [80, 6], [86, 13], [76, 12]], '#4fc3f2');
   P.r(72, 7, 4, 2, '#d8f6ff'); P.r(70, 9, 2, 2, '#d8f6ff');
   P.p([[2, 19], [24, 18], [18, 27], [6, 27]], '#5f6a74');
   P.p([[30, 21], [60, 21], [48, 32], [35, 32]], '#66717c');
   P.r(36, 29, 12, 2, '#55606a');
   P.r(52, 16, 9, 5, '#2a2f35');
   P.r(0, 14, 5, 9, '#3a3f45'); P.r(0, 16, 2, 5, '#24282c');
   if (gear) {
    P.r(40, 25, 2, 7, '#3a3f45'); P.c(41, 33, 2, '#1d2024');
    P.r(80, 23, 2, 8, '#3a3f45'); P.c(81, 32, 2, '#1d2024');
   }
  });
 }
 // tank, side view, barrel right. 86 x 42. hatch: open lid. tr: tread phase
 function tank(hatch, tr) {
  return art('tank|' + hatch + tr, 88, 42, P => {
   P.p([[4, 28], [80, 28], [86, 34], [80, 41], [6, 41], [0, 34]], '#2b2d24');
   for (let i = 0; i < 8; i++) P.c(10 + i * 10, 35, 4, '#4d5240');
   for (let i = 0; i < 8; i++) P.c(10 + i * 10, 35, 1, '#2b2d24');
   for (let i = 0; i < 14; i++) P.r(3 + i * 6 + (tr ? 3 : 0), 28, 2, 1, '#6a6e5c');
   for (let i = 0; i < 14; i++) P.r(3 + i * 6 + (tr ? 0 : 3), 40, 2, 1, '#6a6e5c');
   P.p([[2, 28], [10, 19], [74, 19], [84, 28]], '#5b6b34');
   P.r(11, 20, 62, 2, '#738545');
   P.r(16, 23, 9, 3, '#46532a'); P.r(44, 22, 12, 3, '#46532a'); P.r(64, 24, 7, 2, '#46532a');
   P.p([[24, 19], [29, 9], [55, 9], [60, 19]], '#53632f');
   P.r(30, 11, 22, 2, '#6a7c3e');
   P.r(36, 14, 6, 3, '#3f4a24'); P.r(48, 15, 5, 2, '#3f4a24');
   P.r(58, 12, 26, 3, '#46542a'); P.r(83, 11, 4, 5, '#3a4521');
   if (hatch) { P.r(33, 6, 10, 3, '#3a4521'); P.p([[33, 6], [36, 0], [39, 0], [36, 6]], '#46542a'); }
   else P.r(33, 7, 10, 2, '#46542a');
   P.r(26, 15, 3, 2, '#2a3018');
  });
 }
 // rocket, vertical. 38 x 112. door: open. tc: nose / fin colour
 function rocket(door, tc) {
  return art('rkt|' + door + tc, 38, 112, P => {
   P.r(11, 22, 16, 72, '#e8edf2');
   P.r(22, 22, 5, 72, '#bcc5ce');
   P.r(12, 22, 2, 72, '#ffffff');
   P.p([[11, 23], [19, 0], [27, 23]], tc);
   P.p([[13, 21], [19, 4], [21, 8], [16, 21]], 'rgba(255,255,255,.35)');
   P.r(11, 30, 16, 2, '#8d97a1'); P.r(11, 84, 16, 2, '#8d97a1');
   P.c(19, 40, 4, '#7d8794'); P.c(19, 40, 3, '#2a6fd0'); P.r(17, 38, 2, 2, '#bfe2ff');
   P.r(14, 54, 10, 18, '#9aa4ae');
   if (door) { P.r(15, 55, 8, 16, '#1c2026'); P.r(15, 55, 8, 2, '#ffe68a'); }
   else { P.r(15, 55, 8, 16, '#c8d0d8'); P.r(21, 62, 1, 2, '#5a6068'); }
   P.p([[11, 70], [1, 96], [1, 103], [11, 93]], tc);
   P.p([[27, 70], [37, 96], [37, 103], [27, 93]], tc);
   P.p([[13, 94], [25, 94], [28, 102], [10, 102]], '#5a6068');
   P.r(13, 94, 12, 2, '#7a8088');
   P.r(5, 100, 2, 11, '#6a7078'); P.r(31, 100, 2, 11, '#6a7078');
   P.r(3, 109, 6, 2, '#4a5058'); P.r(29, 109, 6, 2, '#4a5058');
  });
 }
 // landing ship, bow (ramp) right. 124 x 46. ramp: lowered
 function ship(ramp) {
  return art('ship|' + ramp, 126, 46, P => {
   P.p([[0, 22], [108, 22], [120, 16], [116, 36], [8, 42], [0, 36]], '#7a8590');
   P.p([[2, 34], [116, 32], [116, 36], [8, 42], [0, 36]], '#5a646e');
   P.r(3, 36, 108, 2, '#8a3b33');
   P.r(2, 23, 106, 2, '#9aa5af');
   P.r(14, 9, 32, 14, '#9aa5af'); P.r(14, 9, 32, 2, '#b8c2cb');
   P.r(16, 13, 28, 3, '#26323c');
   for (let i = 0; i < 7; i++) P.r(17 + i * 4, 14, 2, 1, '#7fd6ff');
   P.r(26, 1, 2, 8, '#5a646e'); P.r(20, 3, 14, 1, '#5a646e'); P.r(33, 2, 2, 3, '#5a646e');
   P.r(50, 17, 40, 5, '#69737d');
   for (let i = 0; i < 10; i++) P.c(10 + i * 10, 29, 1, '#4b545d');
   if (ramp) P.p([[108, 22], [124, 34], [124, 38], [110, 30]], '#8d97a1');
   else P.p([[108, 22], [116, 17], [118, 32], [110, 30]], '#8d97a1');
  });
 }
 // twin-rotor transport helicopter (Marines), nose right. 112 x 40. ramp: rear ramp open
 function heliM(ramp) {
  return art('helm|' + ramp, 114, 40, P => {
   P.p([[6, 12], [96, 12], [108, 20], [102, 32], [10, 33], [2, 24]], '#4f5d33');
   P.p([[4, 25], [104, 25], [102, 32], [10, 33]], '#3f4b28');
   P.r(8, 13, 88, 2, '#64753f');
   P.p([[92, 14], [102, 17], [106, 23], [93, 23]], '#4fc3f2'); P.r(96, 17, 3, 2, '#d8f6ff');
   for (let i = 0; i < 6; i++) P.r(28 + i * 9, 17, 4, 3, '#26301a');
   P.r(46, 16, 12, 14, '#2f3820');
   P.r(14, 6, 10, 7, '#46542c'); P.r(84, 6, 10, 7, '#46542c');
   P.r(17, 3, 4, 3, '#2a3018'); P.r(87, 3, 4, 3, '#2a3018');
   P.r(18, 33, 2, 4, '#2a3018'); P.c(19, 37, 2, '#151812'); P.r(86, 33, 2, 4, '#2a3018'); P.c(87, 37, 2, '#151812');
   if (ramp) P.p([[4, 24], [10, 33], [0, 38], [-1, 30]], '#3a4526');
  });
 }
 // rescue helicopter (Coast Guard), nose right. 104 x 40
 function heliC() {
  return art('helc', 106, 40, P => {
   P.p([[0, 14], [40, 16], [40, 22], [0, 18]], '#e9edf0');
   P.p([[0, 6], [6, 6], [10, 15], [2, 15]], '#e9edf0');
   P.r(0, 8, 5, 6, '#e0472f');
   P.p([[36, 10], [82, 10], [98, 18], [102, 26], [94, 32], [44, 32], [36, 24]], '#eef1f4');
   P.p([[38, 26], [100, 26], [94, 32], [44, 32]], '#c9d0d6');
   P.r(36, 21, 66, 4, '#e0472f');
   P.p([[84, 12], [97, 18], [101, 25], [86, 25]], '#4fc3f2'); P.r(90, 16, 3, 2, '#d8f6ff');
   P.r(52, 13, 14, 12, '#2c3640'); P.r(53, 14, 12, 3, '#9fdcff');
   P.r(64, 6, 14, 5, '#c9d0d6'); P.r(69, 3, 4, 3, '#5a646e');
   P.r(44, 12, 6, 2, '#5a646e'); P.r(48, 12, 2, 6, '#5a646e');
   P.r(50, 33, 2, 3, '#5a646e'); P.r(86, 33, 2, 3, '#5a646e'); P.r(46, 36, 46, 2, '#5a646e');
  });
 }

 /* ---------- one side's show ---------- */
 const DUR = { arrive: 1.35, unload: 1.35, leave: 1.05, tail: .2 };
 const TOTAL = DUR.arrive + DUR.unload + DUR.leave + DUR.tail;
 function mkShow(G, kind, side, mode) {
  const vw = VW(), cx0 = camx(), dir = side === 0 ? 1 : -1;
  const lu = G.lu && G.lu[side], ids = lu ? [...(lu.A || []), ...(lu.M || []), ...(lu.D || []), lu.LSM, lu.G].filter(id => id && typeof PP === 'function' && PP(id)).slice(0, 10) : [];
  const stopX = cx0 + vw * (side === 0 ? .27 : .73), gy = (kind === 'navy' ? 172 : CY + 14);
  const S = { kind, side, mode, dir, stopX, gy, kit: side === 0 ? G.uk : G.ok, actors: [], fx: [], tc: '#3a6fd0', sndN: 0 };
  const kit = S.kit || {};
  S.tc = hex(kit.trim, hex(kit.jersey, '#3a6fd0'));
  if (S.tc.toLowerCase() === '#ffffff' || S.tc.toLowerCase() === '#eeeeee') S.tc = hex(kit.jersey, '#3a6fd0');
  ids.forEach((id, i) => {
   const col = i % 5, row = Math.floor(i / 5);
   const off0 = { airforce: 40, army: 44, spaceforce: 24, navy: 30, marines: 34, coastguard: 30 }[kind] || 34;
   const hx = stopX + dir * (off0 + col * 11 + (row ? 5 : 0)), hy = (kind === 'navy' ? CY + 30 : gy) - 14 + row * 26;
   S.actors.push({ p: { team: side === 0 ? 'O' : 'D', idx: 90 + i, x: hx, y: hy, tx: hx, ty: hy, anim: 0, pl: PP(id), e490: true }, i, hx, hy, h: 0, vis: mode === 'out', done: false });
  });
  return S;
 }
 // vehicle anchor at time t (x, ground y, altitude)
 function veh(S, t) {
  const k = S.kind, d = S.dir, vw = VW(), far = vw * .75 + 80, A = DUR.arrive, U = A + DUR.unload;
  let x = S.stopX, alt = 0, phase = 'arrive';
  const ua = cl(t / A, 0, 1), ul = cl((t - U) / DUR.leave, 0, 1);
  if (t < A) phase = 'arrive'; else if (t < U) phase = 'unload'; else phase = 'leave';
  if (k === 'airforce') {
   if (phase === 'arrive') { x = S.stopX - d * far * (1 - eo(ua)); alt = 6 + 74 * (1 - eo(ua)); }
   else if (phase === 'unload') alt = 6 + Math.sin(t * 5) * 1.2;
   else { x = S.stopX + d * far * ei(ul) * 1.2; alt = 6 + 95 * ei(ul); }
  } else if (k === 'army' || k === 'navy') {
   if (phase === 'arrive') x = S.stopX - d * far * (1 - eo(ua));
   else if (phase === 'leave') x = S.stopX - d * far * ei(ul);
  } else if (k === 'spaceforce') {
   if (phase === 'arrive') alt = 175 * Math.pow(1 - ua, 2.2);
   else if (phase === 'leave') alt = 200 * ei(ul);
  } else {
   const hov = k === 'marines' ? 40 : 36;
   if (phase === 'arrive') { x = S.stopX - d * far * (1 - eo(ua)); alt = hov + 40 * (1 - eo(ua)); }
   else if (phase === 'unload') alt = hov + Math.sin(t * 4) * 1.5;
   else { x = S.stopX + d * far * ei(ul) * 1.1; alt = hov + 80 * ei(ul); }
  }
  return { x, alt, phase };
 }
 // where players leave / board the vehicle: [x offset, height above ground]
 function door(S) {
  const d = S.dir;
  switch (S.kind) {
   case 'airforce': return [d * 14, 10];
   case 'army': return [d * 0, 20];
   case 'spaceforce': return [0, 0];
   case 'navy': return [d * 34, 0];
   case 'marines': return [d * 2, 0];
   default: return [d * 4, 0];
  }
 }
 function snd(S, n, fn) { if (S.sndN > n) return; S.sndN = n + 1; try { if (typeof tone === 'function') fn(); } catch (e) {} }
 function tickShow(S, t, dt) {
  const v = veh(S, t), A = DUR.arrive, U = A + DUR.unload, k = S.kind;
  S.v = v;
  // sounds
  if (S.mode === 'in' || S.mode === 'out') {
   if (k === 'airforce') { snd(S, 0, () => tone(520, .9, 'sawtooth', .025, 0, -360)); if (t > U) snd(S, 1, () => tone(220, .8, 'sawtooth', .025, 0, 700)); }
   else if (k === 'army') { snd(S, 0, () => { tone(55, .5, 'square', .04); tone(62, .5, 'square', .03, .5); }); }
   else if (k === 'spaceforce') { snd(S, 0, () => tone(90, 1.2, 'sawtooth', .03, 0, -40)); if (t > U) snd(S, 1, () => tone(80, 1, 'sawtooth', .035, 0, 300)); }
   else if (k === 'navy') { snd(S, 0, () => { tone(110, .45, 'square', .035, .3); tone(110, .7, 'square', .035, .9); }); }
   else { snd(S, 0, () => { for (let i = 0; i < 6; i++) tone(70, .06, 'square', .03, i * .14); }); }
  }
  // particles (bounded)
  const g0 = S.gy;
  if (S.fx.length < 70) {
   if (k === 'army' && v.phase !== 'unload' && Math.random() < .7) for (const ty of [-19, 17]) S.fx.push({ x: v.x - S.dir * 26, y: g0 + ty, vx: -S.dir * 10, vy: -4, t: 0, life: .7, c: '#b9a77a', r: 2 });
   if (k === 'spaceforce' && v.alt < 70 && v.phase !== 'unload' && Math.random() < .9) for (let i = 0; i < 2; i++) S.fx.push({ x: v.x + (Math.random() - .5) * 8, y: g0, vx: (Math.random() < .5 ? -1 : 1) * (20 + Math.random() * 30), vy: -3 - Math.random() * 4, t: 0, life: 1.4, c: Math.random() < .5 ? '#e4e4e4' : '#c4c4c4', r: 3 });
   if (k === 'navy' && v.phase !== 'unload' && Math.random() < .8) S.fx.push({ x: v.x - S.dir * 36, y: g0 - 2, vx: -S.dir * 8, vy: 0, t: 0, life: .8, c: '#ffffff', r: 1 });
   if ((k === 'marines' || k === 'coastguard') && v.alt < 60 && Math.random() < .5) S.fx.push({ x: v.x + (Math.random() - .5) * 50, y: g0 + (Math.random() - .5) * 10, vx: (Math.random() - .5) * 40, vy: 0, t: 0, life: .5, c: '#9fbf7a', r: 1 });
  }
  for (const f of S.fx) { f.t += dt; f.x += f.vx * dt; f.y += f.vy * dt; f.vx *= .97; }
  S.fx = S.fx.filter(f => f.t < f.life);
  // players
  const dr = door(S), n = S.actors.length, gap = n ? Math.min(.12, (DUR.unload - .5) / n) : .1, mv = .5;
  for (const a of S.actors) {
   const t0 = A + .08 + a.i * gap, u = cl((t - t0) / mv, 0, 1);
   const dx = v.x + dr[0], dy = S.gy + (k === 'navy' ? -6 : 0) + (a.i % 2 ? 3 : -3);
   let x, y, h;
   if (S.mode === 'in') {
    if (t < t0) { a.vis = false; continue; }
    a.vis = true;
    const ue = ease(u);
    x = dx + (a.hx - dx) * ue; y = dy + (a.hy - dy) * ue;
    if (k === 'marines' || k === 'coastguard') { const ud = cl(u / .55, 0, 1), alt0 = v.alt + 6; h = alt0 * (1 - ud); x = u < .55 ? dx : dx + (a.hx - dx) * ease((u - .55) / .45); y = u < .55 ? dy : dy + (a.hy - dy) * ease((u - .55) / .45); }
    else if (k === 'airforce') h = (v.alt + dr[1]) * (1 - u) + 10 * Math.sin(Math.PI * u);
    else if (k === 'army') h = dr[1] * (1 - u) + 8 * Math.sin(Math.PI * u);
    else h = 0;
   } else {
    if (a.done) { a.vis = false; continue; }
    a.vis = true;
    if (t < t0) { x = a.hx; y = a.hy; h = 0; }
    else {
     const ue = ease(u);
     x = a.hx + (dx - a.hx) * ue; y = a.hy + (dy - a.hy) * ue;
     if (k === 'marines' || k === 'coastguard') { const ur = cl((u - .45) / .55, 0, 1); x = u < .45 ? a.hx + (dx - a.hx) * ease(u / .45) : dx; y = u < .45 ? a.hy + (dy - a.hy) * ease(u / .45) : dy; h = (v.alt + 6) * ur; }
     else if (k === 'airforce') h = (v.alt + dr[1]) * u + 10 * Math.sin(Math.PI * u);
     else if (k === 'army') h = dr[1] * u + 8 * Math.sin(Math.PI * u);
     else h = 0;
     if (u >= 1) a.done = true;
    }
   }
   const p = a.p, ox = p.x, oy = p.y;
   p.x = x; p.y = y; a.h = h;
   if (x - ox > .05) a.fr = true; else if (x - ox < -.05) a.fr = false; else if (a.fr == null || (S.mode === 'in' && u >= 1)) a.fr = S.side === 0;
   const moved = Math.hypot(p.x - ox, p.y - oy) > .05 && h < 2;
   if (moved) p.anim = (p.anim || 0) + 1;
   p.tx = p.x; p.ty = p.y;
   S.face = S.dir;
  }
 }

 /* ---------- drawing (world coords) ---------- */
 function blit(a, x, y, flip, alpha) {
  const im = flip ? a.L : a.R;
  const ow = a.w * curS, oh = a.h * curS;
  if (alpha != null) g.globalAlpha = alpha;
  g.drawImage(im, Math.round(x - ow / 2), Math.round(y - oh), Math.round(ow), Math.round(oh));
  if (alpha != null) g.globalAlpha = 1;
 }
 function shadow(x, y, w, a) { g.fillStyle = 'rgba(0,0,0,' + a.toFixed(3) + ')'; g.fillRect(Math.round(x - w / 2), Math.round(y - 1), Math.round(w), 3); g.fillRect(Math.round(x - w / 2 + 2), Math.round(y - 2), Math.round(w - 4), 5); }
 function drawVehicle(S, t) {
  const v = S.v || veh(S, t), k = S.kind, flip = S.dir < 0, x = v.x, gy = S.gy, ft = Math.floor(t * 20), AS = curS = VS[k] || 1;
  if (k === 'airforce') {
   const gear = v.alt < 26, J = jet(gear, S.tc);
   shadow(x, gy, cl(56 - v.alt * .3, 18, 56), cl(.32 - v.alt * .003, .08, .32));
   const y = gy - v.alt, ow = J.w * AS;
   // afterburner
   const fl = 4 + (ft % 3) * 2 + (v.phase === 'leave' ? 8 : 0), ex = flip ? x + ow / 2 : x - ow / 2;
   g.fillStyle = '#ff9a2a'; g.fillRect(Math.round(flip ? ex : ex - fl), Math.round(y - 9), fl, 4);
   g.fillStyle = '#ffe46a'; g.fillRect(Math.round(flip ? ex : ex - fl * .6), Math.round(y - 8), Math.round(fl * .6), 2);
   blit(J, x, y + 3, flip);
  } else if (k === 'army') {
   for (const [oy, dx] of [[-19, 0], [17, -S.dir * 10]]) {
    const xx = x + dx, open = v.phase === 'unload' || (S.mode === 'out' && v.phase === 'leave' && false), Tk = tank(open ? 1 : 0, ft % 2);
    shadow(xx, gy + oy + 1, 52, .25);
    blit(Tk, xx, gy + oy + 2, flip);
   }
  } else if (k === 'spaceforce') {
   const open = v.phase === 'unload', R = rocket(open ? 1 : 0, S.tc), y = gy - v.alt;
   shadow(x, gy, cl(26 - v.alt * .08, 8, 26), cl(.3 - v.alt * .0015, .05, .3));
   if (v.phase !== 'unload') {
    const fl = 8 + (ft % 3) * 3 + (v.phase === 'leave' ? 6 : 0);
    g.fillStyle = '#ff7a1a'; g.fillRect(Math.round(x - 4), Math.round(y - 1), 8, fl);
    g.fillStyle = '#ffd23a'; g.fillRect(Math.round(x - 3), Math.round(y - 1), 6, Math.round(fl * .7));
    g.fillStyle = '#fff6c8'; g.fillRect(Math.round(x - 1), Math.round(y - 1), 3, Math.round(fl * .4));
   }
   blit(R, x, y + 1, false);
  } else if (k === 'navy') {
   const ramp = v.phase === 'unload', Sh = ship(ramp ? 1 : 0), ow = Sh.w * AS;
   // water under and behind the hull
   const wx0 = Math.min(x - ow / 2 - 30 * (S.dir > 0 ? 1 : 0), x - ow / 2), wx1 = Math.max(x + ow / 2 + 30 * (S.dir < 0 ? 1 : 0), x + ow / 2);
   g.fillStyle = '#2f6fb0'; g.fillRect(Math.round(wx0), gy - 9, Math.round(wx1 - wx0), 14);
   g.fillStyle = '#4f94d6';
   for (let i = Math.floor(wx0 / 6); i * 6 < wx1; i++) g.fillRect(i * 6 + ((ft + i) % 2) * 2, gy - 9 + (i % 2) * 5, 3, 1);
   blit(Sh, x, gy + 2, flip);
   g.fillStyle = '#ffffff'; g.fillRect(Math.round(x - ow / 2), gy - 2, Math.round(ow), 1);
  } else if (k === 'marines') {
   const H1 = heliM(v.phase === 'unload' ? 1 : 0), y = gy - v.alt, ow = H1.w * AS;
   shadow(x, gy, 52, .18);
   if (v.phase === 'unload') { // fast ropes
    g.fillStyle = '#2a2418';
    g.fillRect(Math.round(x + S.dir * 2), Math.round(y - 4), 1, Math.round(v.alt + 4));
    g.fillRect(Math.round(x - S.dir * 6), Math.round(y - 4), 1, Math.round(v.alt + 4));
   }
   blit(H1, x, y, flip);
   const top = y - H1.h * AS + 1, sp = ft % 2;
   for (const rx of [-ow / 2 + 11, ow / 2 - 17].map(q => flip ? -q : q)) {
    g.fillStyle = sp ? 'rgba(40,44,36,.85)' : 'rgba(120,128,110,.6)'; g.fillRect(Math.round(x + rx - 22), Math.round(top), 44, 1);
    g.fillStyle = 'rgba(200,210,190,.25)'; g.fillRect(Math.round(x + rx - 18 + sp * 4), Math.round(top - 1), 28, 1);
   }
  } else {
   const Hc = heliC(), y = gy - v.alt, ow = Hc.w * AS;
   shadow(x, gy, 44, .18);
   if (v.phase === 'unload') { // rescue ladder
    const lx = Math.round(x + S.dir * 4);
    g.fillStyle = '#d9c38a'; g.fillRect(lx - 2, Math.round(y - 3), 1, Math.round(v.alt + 3)); g.fillRect(lx + 2, Math.round(y - 3), 1, Math.round(v.alt + 3));
    for (let yy = Math.round(y); yy < gy; yy += 4) g.fillRect(lx - 2, yy, 5, 1);
   }
   blit(Hc, x, y, flip);
   const top = y - Hc.h * AS + 2, rx = flip ? -(ow * .13) : ow * .13, sp = ft % 2;
   g.fillStyle = sp ? 'rgba(40,44,48,.85)' : 'rgba(150,156,160,.6)'; g.fillRect(Math.round(x + rx - 30), Math.round(top), 60, 1);
   g.fillStyle = 'rgba(220,226,230,.3)'; g.fillRect(Math.round(x + rx - 24 + sp * 6), Math.round(top - 1), 40, 1);
   const tx = flip ? x + ow / 2 - 2 : x - ow / 2 + 2; // tail rotor
   g.fillStyle = 'rgba(60,64,68,.7)'; g.fillRect(Math.round(tx - 1), Math.round(y - 22 + sp), 2, 7);
  }
 }
 function drawFx(S) { for (const f of S.fx) { const k = f.t / f.life; g.globalAlpha = Math.max(0, .85 * (1 - k)); const r = Math.max(1, Math.round(f.r * (1 + k * 1.5))); g.fillStyle = f.c; g.fillRect(Math.round(f.x - r / 2), Math.round(f.y - r / 2), r, r); } g.globalAlpha = 1; }
 function drawActor(S, a) {
  const p = a.p, y0 = p.y;
  p.y = y0 - (a.h || 0);
  try { drawPlayer(p, S.kit, a.fr == null ? S.side === 0 : a.fr); } catch (e) { err(e, 'player'); }
  p.y = y0;
  try { if (tagQ) tagQ.delete(p); } catch (e) {}
 }
 function drawShows(R) {
  const t = R.t;
  for (const S of R.shows) {
   const v = S.v || veh(S, t);
   const behind = [], front = [];
   for (const a of S.actors) if (a.vis) (a.h > 1 || a.p.y >= S.gy - 4 ? front : behind).push(a);
   behind.sort((p, q) => p.p.y - q.p.y); front.sort((p, q) => p.p.y - q.p.y);
   for (const a of behind) drawActor(S, a);
   drawVehicle(S, t);
   drawFx(S);
   for (const a of front) drawActor(S, a);
  }
 }

 /* ---------- run state ---------- */
 let RUN = null, lastMs = 0;
 V.state = () => RUN ? { mode: RUN.mode, t: +RUN.t.toFixed(2), kinds: RUN.shows.map(s => s.kind) } : null;
 function start(G, mode) {
  const ks = sidesOf(G), shows = [];
  for (let s = 0; s < 2; s++) if (ks[s]) shows.push(mkShow(G, ks[s], s, mode));
  if (!shows.length) return false;
  RUN = { G, mode, t: 0, shows, cap: shows.map(S => NAME[S.kind] + ' ' + (mode === 'in' ? CAP_IN : CAP_OUT)[S.kind]).join('  -  ') };
  lastMs = performance.now();
  if (mode === 'in') V.plays++; else V.exits++;
  V.last = { mode, kinds: shows.map(S => S.kind), at: Date.now() };
  V.log.push(mode + ':' + V.last.kinds.join('+')); if (V.log.length > 20) V.log.shift();
  return true;
 }
 function finish(how) {
  const R = RUN; if (!R) return;
  RUN = null;
  if (how === 'skip') V.skips++;
  // hand back: the game's own pregame tick calls startFaceoff(true) / walkTick2314 again next frame and they now pass through
  if (R.mode === 'in') R.G.e490in = 'done'; else R.G.e490out = 'done';
 }
 V.skip = () => finish('skip');
 function step() {
  const R = RUN; if (!R) return;
  const G = G0();
  if (G !== R.G || off()) { const m = R.mode; RUN = null; if (G === R.G && m === 'in') { R.G.e490in = 'done'; } return; }
  const n = performance.now();
  let dt = (n - lastMs) / 1000; lastMs = n;
  if (isPaused()) return;
  dt = cl(dt, 0, .05);
  R.t += dt;
  for (const S of R.shows) try { tickShow(S, R.t, dt); } catch (e) { err(e, 'tick'); }
  if (R.t >= TOTAL) finish('done');
 }
 V.TOTAL = TOTAL;

 /* ---------- hooks ---------- */
 function holdIn(G, viaWalk) {
  if (!G || G.e490in === 'done' || !eligible(G) || SCR() !== 'pregame') return false;
  if (RUN && RUN.G === G && RUN.mode === 'in') return true;
  if (G.e490in === 'skip') return false;
  try { if (!start(G, 'in')) { G.e490in = 'done'; return false; } } catch (e) { err(e, 'start'); G.e490in = 'done'; return false; }
  RUN.viaWalk = !!viaWalk;
  return true;
 }
 const SF0 = W0.startFaceoff;
 W0.startFaceoff = function (opening) {
  try { if (opening === true && !off() && holdIn(G0(), false)) return; } catch (e) { err(e, 'sf'); }
  return SF0.apply(this, arguments);
 };
 if (typeof W0.walkTick2314 === 'function') {
  const WT0 = W0.walkTick2314;
  W0.walkTick2314 = function (G) {
   try { if (!off() && !G.walk && holdIn(G, true)) return; } catch (e) { err(e, 'wt'); }
   return WT0.apply(this, arguments);
  };
 }
 const DG0 = W0.drawGear;
 W0.drawGear = function () {
  const r = DG0.apply(this, arguments);
  try {
   const G = G0(), s = SCR();
   if (!off() && G && s === 'final' && !RUN && G.e490out !== 'done' && eligible(G) && G.over && !(G.celeb && !G.celeb.done)) { if (!start(G, 'out')) G.e490out = 'done'; }
   if (RUN && (s === 'pregame' || s === 'final')) { step(); if (RUN) { const sm = g.imageSmoothingEnabled; g.imageSmoothingEnabled = false; drawShows(RUN); g.imageSmoothingEnabled = sm; } }
  } catch (e) { err(e, 'draw'); RUN = null; }
  return r;
 };
 const hideOut = () => !!(RUN && RUN.mode === 'out' && SCR() === 'final');
 const DPL0 = W0.drawPlayers;
 W0.drawPlayers = function () { if (hideOut()) return; return DPL0.apply(this, arguments); };
 const DB0 = W0.drawBall;
 W0.drawBall = function () { if (hideOut()) return; return DB0.apply(this, arguments); };
 // captions are drawn without the real-name filter (names31b wraps fold2318 and turns "AIR FORCE" into a college name)
 function rawText(s, cx, y, col) {
  s = String(s).toUpperCase();
  try { if (SA2403B) y = sa2403By(y); } catch (e) {}
  const w = s.length * 4 - 1, x = Math.round(cx - w / 2);
  try { drawText(s, x + 1, y + 1, 1, '#000'); drawText(s, x, y, 1, col); } catch (e) { text(s, cx, y, 1, col, 'center', '#000'); }
 }
 function ui() {
  const R = RUN, vw = VW(), cx = vw / 2;
  rect(0, 0, vw, 16, 'rgba(0,0,0,.55)');
  rawText(R.cap, cx, 5, '#ffe14d');
  hit('E490 TAP', 0, 16, vw, H - 16, () => finish('skip'), 'SKIP ENTRANCE');
  const sx = vw - 46, sy = 2;
  hit('E490 SKIP', sx, sy, 42, 12, () => finish('skip'), 'SKIP');
  rect(sx, sy, 42, 12, 'rgba(0,0,0,.6)');
  text('SKIP >', sx + 21, sy + 4, 1, '#ffffff', 'center');
  text('TAP TO SKIP', cx, H - 9, 1, Math.floor(R.t * 2) % 2 ? '#8fa6b0' : '#5a6670', 'center');
 }
 const DPG0 = W0.drawPregame;
 W0.drawPregame = function () {
  if (RUN && RUN.mode === 'in' && !off()) { try { ui(); return; } catch (e) { err(e, 'ui'); } }
  return DPG0.apply(this, arguments);
 };
 const DF0 = W0.drawFinal;
 W0.drawFinal = function () {
  if (RUN && RUN.mode === 'out' && !off()) { try { ui(); return; } catch (e) { err(e, 'ui'); } }
  return DF0.apply(this, arguments);
 };
 V.ok = true;
})();
