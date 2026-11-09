/* V40.1.5r RIDES - (1) NORMAL RIDE is the default (attack + middies ride, D stays back, goalie stays home), and it is
   pickable everywhere rides are picked: PLAYBOOK > RIDES (new built-in NORMAL RIDE next to 10-MAN RIDE) and TIMEOUT > RIDE.
   Saved in the existing 'rl_ride' key (value 'STANDARD RIDE' = NORMAL, shown as NORMAL RIDE). Old saves: the old build
   auto-highlighted 10-MAN as the only ride in the playbook, so a stored '10-MAN RIDE' is reset ONCE to NORMAL (marker
   'rl_ride415'); custom rides are kept; anything picked after that sticks.
   (2) 10-MAN RIDE is real: the goalie takes the HIGHEST attackman (the one nearest midfield), his D steps up to midfield,
   and the goalie plays out at the top of the box, ball-side of his man (denies the long outlet). Ball reaches midfield,
   a shot, a turnover or the clear ends -> he sprints back to the cage. Same for the CPU's 10-man ride (mirror).
   Off-screen arrow "GOALIE OUT" shows while yours is out. (3) One HOW TO line: NORMAL vs 10-MAN.
   Kill switch: window.__rl_no415r = true -> exactly like before. */
(function () {
 'use strict';
 if (window.__rl_v415r_loaded) return;
 window.__rl_v415r_loaded = 1;
 const off = () => !!window.__rl_no415r || !!window.__rl_v124gb;
 const LOG = { errs: [], migrated: null, outs: 0, picks: [] };
 window.V415R = { on: false, LOG: LOG };
 if (off()) return;
 const G0 = () => (typeof game !== 'undefined' ? game : null);
 const err = (e, w) => { try { LOG.errs.push((w || '') + ': ' + String(e && e.message || e).slice(0, 160)); console.error(e); } catch (x) {} };
 const wrapG = (n, f) => {
  const o = window[n];
  if (typeof o !== 'function') return false;
  window[n] = function () { return f.call(this, o, arguments); };
  return true;
 };
 const TEN = '10-MAN RIDE', STD = 'STANDARD RIDE', NORM_LBL = 'NORMAL RIDE';
 const HOWTO = 'NORMAL = YOUR ATTACK + MIDDIES RIDE, GOALIE STAYS HOME. 10-MAN = YOUR GOALIE COMES OUT TOO SO A D CAN STEP UP.';
 const okG = G => !!G && !G.tutorial && !G.online && !(G.meta && G.meta.online);

 /* ---------------- (1) default + one-time reset ---------------- */
 try {
  const k = 'rl_ride', mk = 'rl_ride415';
  let cur = null;
  try { cur = JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { cur = null; }
  if (!localStorage.getItem(mk)) {
   if (cur == null || cur === TEN) { localStorage.setItem(k, JSON.stringify(STD)); LOG.migrated = cur == null ? 'fresh->NORMAL' : '10-MAN->NORMAL (once)'; }
   else LOG.migrated = 'kept ' + String(cur).slice(0, 40);
   localStorage.setItem(mk, '1');
  } else if (cur == null) { localStorage.setItem(k, JSON.stringify(STD)); LOG.migrated = 'missing->NORMAL'; }
 } catch (e) { err(e, 'migrate'); }
 // a game object built before this file ran (should not happen) also gets NORMAL when it carried the old default
 try { const G = G0(); if (G && G.rideU_call === TEN && !G.r415pick) G.rideU_call = STD; } catch (e) {}
 // a stale / missing pick (deleted custom ride, no key) falls back to NORMAL, not 10-MAN; the CPU side is untouched
 wrapG('rideCall', function (o, a) {
  const r = o.apply(this, a);
  try { if (!off() && a[0] === 'U' && r === TEN) { const G = G0(); if (G && G.rideU_call !== TEN) return STD; } } catch (e) {}
  return r;
 });
 wrapG('setRide', function (o, a) {
  const r = o.apply(this, a);
  try { const G = G0(); if (G) G.r415pick = 1; LOG.picks.push(String(a[0])); } catch (e) {}
  return r;
 });

 /* ---------------- playbook: NORMAL RIDE built-in ---------------- */
 try {
  if (typeof PM_BUILTIN !== 'undefined' && Array.isArray(PM_BUILTIN) && !PM_BUILTIN.some(p => p && p.id === 'bi-ridestd')) {
   const i10 = PM_BUILTIN.findIndex(p => p && p.id === 'bi-ride10');
   const base = (typeof RIDE10_DEMO !== 'undefined' ? RIDE10_DEMO : PM_STARTS.RIDES).map(q => q.slice());
   // goalie home, all 3 D back in front of the cage; middies + attack ride like the 10-man demo
   base[0] = [ DGX + 5, CY ]; base[1] = [ DGX + 70, CY ]; base[2] = [ DGX + 62, CY - 38 ]; base[3] = [ DGX + 62, CY + 40 ];
   const P = { id: 'bi-ridestd', name: NORM_LBL, cat: 'RIDES', builtin: true, ride: STD, start: base, car: -2, steps: [] };
   if (i10 >= 0) PM_BUILTIN.splice(i10, 0, P); else PM_BUILTIN.push(P);
  }
 } catch (e) { err(e, 'pb'); }

 const relabel = h => h.split('>' + STD + '<').join('>' + NORM_LBL + '<').split('aria-label="' + STD + '"').join('aria-label="' + NORM_LBL + '"');
 try {
  if (typeof PANEL_RENDER !== 'undefined') {
   if (PANEL_RENDER.playbook) {
    const R0 = PANEL_RENDER.playbook;
    PANEL_RENDER.playbook = function () {
     let h = R0.apply(this, arguments);
     if (off()) return h;
     try {
      const at = h.indexOf('<div class="note">RIDES</div>');
      if (at >= 0) {
       const rowEnd = h.indexOf('</div>', h.indexOf('<div class="row">', at) + 1);
       if (rowEnd > 0) h = h.slice(0, rowEnd + 6) + '<div class="dim2" data-r415="howto">' + HOWTO + '</div>' + h.slice(rowEnd + 6);
      }
     } catch (e) { err(e, 'pbInject'); }
     return h;
    };
   }
   if (PANEL_RENDER.timeout) {
    const RT = PANEL_RENDER.timeout;
    PANEL_RENDER.timeout = function () {
     let h = RT.apply(this, arguments);
     if (off()) return h;
     try {
      h = relabel(h).replace('YOUR ATTACK RIDE, EVERYONE ELSE GETS BACK', 'NORMAL: ATTACK + MIDDIES RIDE, D + GOALIE STAY HOME. 10-MAN: GOALIE COMES OUT TOO')
       .replace('ALL 10 MAN-TO-MAN - YOUR GOALIE TAKES AN ATTACKMAN, A D STEPS UP', 'ALL 10 RIDE - YOUR GOALIE COMES OUT TO THE TOP OF THE BOX ON THEIR HIGH ATTACKMAN, HIS D STEPS UP');
      // NORMAL first, then 10-MAN
      const a = h.indexOf('data-a="rideSet" data-v="' + TEN + '"'), b = h.indexOf('data-a="rideSet" data-v="' + STD + '"');
      if (a >= 0 && b > a) {
       const s1 = h.lastIndexOf('<button', a), e1 = h.indexOf('</button>', a) + 9, s2 = h.lastIndexOf('<button', b), e2 = h.indexOf('</button>', b) + 9;
       if (e1 === s2) h = h.slice(0, s1) + h.slice(s2, e2) + h.slice(s1, e1) + h.slice(e2);
      }
     } catch (e) { err(e, 'toInject'); }
     return h;
    };
   }
  }
 } catch (e) { err(e, 'panels'); }

 /* ---------------- tutorial words ---------------- */
 try {
  if (typeof TUT_V13 !== 'undefined' && Array.isArray(TUT_V13)) for (const r of TUT_V13) if (r && r[0] === TEN) { r[0] = 'RIDES'; r[1] = 'NORMAL RIDE IS YOUR DEFAULT. 10-MAN = GOALIE COMES OUT TOO. TAP TO GO ON.'; }
  if (typeof TUT_RIDE13 !== 'undefined' && Array.isArray(TUT_RIDE13) && TUT_RIDE13.length >= 6) {
   const L = [ 'RIDES: NORMAL (YOUR DEFAULT) OR 10-MAN.', 'NORMAL: ATTACK + MIDDIES RIDE, GOALIE STAYS HOME.', '10-MAN: YOUR GOALIE COMES OUT ON THEIR HIGH ATTACKMAN,', 'HIS D STEPS UP TO MIDFIELD FOR THE EXTRA MAN.', 'BALL HITS MIDFIELD: YOUR GOALIE SPRINTS BACK TO THE CAGE.', 'PLAYBOOK OR TIMEOUT > RIDE TO SWITCH. TAP TO GO ON.' ];
   for (let i = 0; i < 6; i++) TUT_RIDE13[i] = L[i];
  }
 } catch (e) { err(e, 'tut'); }

 /* ---------------- (2) a real 10-man: who the goalie takes ---------------- */
 // the goalie takes the attackman nearest midfield (his D is the one who steps up), not the one on the crease
 wrapG('rideStep', function (o, a) {
  try {
   const G = G0(), key = a[0], find = a[4];
   if (!off() && okG(G) && typeof find === 'function') {
    a = Array.prototype.slice.call(a);
    a[4] = function () {
     const f = find.apply(this, arguments);
     try {
      if (!f || !f.gk) return f;
      let cand = [];
      if (key === 'rideU') {
       cand = dAtk().filter(x => x !== G.dcar && rrOf(x) === 'A' && x.x < MIDX).map(m => ({ m: m, d: dDef().find(d => d.mark === m && d !== G.dctl && !(d.down > 0)) })).filter(c => c.d);
       cand.sort((p, q) => q.m.x - p.m.x);
      } else if (f.mode === 'far') {
       const ds = (G.farC || []).filter(x => x.role === 'D');
       cand = (G.farU || []).filter(x => x.role === 'A' || x.role === 'R').map(m => ({ m: m, d: ds.find(d => d.mk === m) })).filter(c => c.d);
       cand.sort((p, q) => p.m.x - q.m.x);
      } else if (f.mode === 'live') {
       cand = G.players.filter(x => x.team === 'O' && x !== G.carrier && rrOf(x) === 'A' && x.x > MIDX).map(m => ({ m: m, d: G.players.find(d => d.team === 'D' && d.mark === m && !(d.down > 0)) })).filter(c => c.d);
       cand.sort((p, q) => p.m.x - q.m.x);
      }
      if (cand.length) { f.mk = cand[0].m; f.cd = cand[0].d; }
      f.r415 = 1;
      if (key === 'rideU') LOG.outs++;
     } catch (e) { err(e, 'find'); }
     return f;
    };
   }
  } catch (e) { err(e, 'rideStep'); }
  return o.apply(this, a);
 });

 /* ---------------- where the goalie plays on a 10-man ---------------- */
 const BOX_U = () => (typeof RL_L !== 'undefined' ? RL_L : DGX + 150), BOX_C = () => (typeof RL_R !== 'undefined' ? RL_R : GX - 150);
 wrapG('rideGkTarget', function (o, a) {
  const R = a[0], gx = a[2], G = G0();
  try {
   if (!off() && okG(G) && R && R.phase === 'out' && R.mk && G.ball) {
    const b = G.ball, m = R.mk, mine = gx < MIDX;
    const dx = b.x - m.x, dy = b.y - m.y, L = Math.hypot(dx, dy) || 1;
    let x = m.x + dx / L * 9, y = m.y + dy / L * 9;
    // out of the cage for real: at least ~3 crease-widths out, at most the top of the box (restraining line)
    x = mine ? clamp(x, DGX + 52, BOX_U() - 6) : clamp(x, BOX_C() + 6, GX - 52);
    y = clamp(y, FT + 10, FB - 8);
    return [ x, y, (RIDE.sprint || 62) * .92 ];
   }
  } catch (e) { err(e, 'gkT'); }
  return o.apply(this, a);
 });

 /* ---------------- cue + off-screen marker for YOUR goalie ---------------- */
 wrapG('addFx', function (o, a) {
  try {
   if (!off() && a[0] === 'cue' && a[3] && a[3].s === 'THEY CLEAR IT - RIDE!' && typeof rideCall === 'function') {
    const G = G0();
    if (okG(G) && rideCall('U') === TEN) a = [ a[0], a[1], a[2], Object.assign({}, a[3], { s: 'THEY CLEAR IT - 10-MAN RIDE!' }) ];
   }
  } catch (e) {}
  return o.apply(this, a);
 });
 wrapG('drawHUD', function (o, a) {
  const r = o.apply(this, a);
  try {
   const G = G0();
   if (!off() && okG(G) && screen === 'defense' && G.rideU && (G.rideU.phase === 'out' || G.rideU.phase === 'back') && G.rideU.gk) {
    const sx = G.rideU.gk.x - camX;
    if (sx < 4) {
     const s = G.rideU.phase === 'out' ? '< GOALIE OUT' : '< GOALIE BACK';
     rect(1, H / 2 - 7, textW(s) + 6, 11, 'rgba(0,0,0,.6)');
     text(s, 4, H / 2 - 5, 1, G.rideU.phase === 'out' ? '#ffe14d' : '#9fe6ff', 'left', '#000');
    }
   }
  } catch (e) { err(e, 'hud'); }
  return r;
 });

 window.V415R = { on: true, LOG: LOG, HOWTO: HOWTO };
})();
