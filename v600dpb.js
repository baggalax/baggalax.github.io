// ===== BAGGA LAX v600dpb.js - 1.5 B69: PLAYBOOK BUTTON ON DEFENSE (offline + online) =====
// Ask (Charlie): a PLAYBOOK button on D, same HUD spot + style as the offense one, mainly to call a LOCK-OFF live without
//        a timeout. Before: drawPlaybookBtn only drew on screen 'live' (your ball); on D (offline 'defense', online
//        'netview' while they have it) there was none.
// Fix:   the offense button is drawn on D too (v39pb's own spot + look; its tap opens the SAME playbook panel). Opened from
//        D the panel gets a DEFENSE NOW row on top: MAN / ZONE / NO SLIDE (black) / LOCK OFF THEIR BEST (auto: their best
//        attacker, your best pole on him) / LOCK OFF (pick: the v411l screen). Its PLAYS tab already lists the D plays and
//        RIDES (custom ones too). BACK / DONE go back to D. Offline the game holds while the panel is open (same as the
//        offense playbook); online the defending phone never runs the sim, so the game keeps going for both.
// Online: the picks live where they always did (G.dset / G.dPlay / G.lk411 / rideCall) and reach the phone running the
//        play through the existing D sync (v558 'n558d', ~0.7 s); no new message. Kill switch: window.__rl_no600dpb
(function () {
 'use strict';
 const Wn = window;
 if (typeof Wn.drawPlaybookBtn !== 'function' || typeof Wn.render !== 'function' || typeof PANEL_ACT === 'undefined' || typeof PANEL_RENDER === 'undefined') return;
 const off = () => !!Wn.__rl_no600dpb;
 const LOG = Wn.__dpb600log = { open: 0, auto: [], err: [] };
 const G0 = () => { try { return typeof game !== 'undefined' ? game : null; } catch (e) { return null; } };
 const online = G => !!(G && (G.online || G.meta && G.meta.online) && Wn.RLNET && RLNET.inGame);
 const D = { from: null };
 function onD(G) {
  if (!G || G.tutorial || G.over || G.brave || paused) return false;
  if (screen === 'defense') return true;
  if (screen === 'netview' && online(G)) { const c = G.carrier; return !(c && c.team === 'O'); }
  return false;
 }
 function openD(from) {
  const G = G0(); if (!G) return;
  D.from = from; LOG.open++;
  try { PS.pbTab = 'PLAYS'; } catch (e) {}
  screen = 'playbook';
  try { panelDirty(); } catch (e) {}
 }
 const back = () => { const f = D.from; D.from = null; screen = f === 'netview' && !(Wn.RLNET && RLNET.inGame) ? 'menu' : f || 'live'; try { panelDirty(); } catch (e) {} };
 // ---- the button on D: v39pb draws it (spot + style); only its key / tap are made ours ----
 const R0 = Wn.render;
 Wn.render = function () {
  const r = R0.apply(this, arguments);
  try {
   const G = G0();
   if (off() || !onD(G)) return r;
   const real = screen, H0 = Wn.hit;
   Wn.hit = function (key, x, y, w, h, fn, label) {
    const s = screen; screen = real;
    try { return key === 'PLAYBOOK' ? H0.call(this, key, x, y, w, h, () => openD(real), label) : H0.apply(this, arguments); } finally { screen = s; }
   };
   const sel = G.playSel; G.playSel = null; // the D button never shows an offense play name
   screen = 'live';
   try { Wn.drawPlaybookBtn(); } finally { screen = real; Wn.hit = H0; G.playSel = sel; }
  } catch (e) { if (LOG.err.length < 20) LOG.err.push(String(e && e.message || e)); }
  return r;
 };
 // ---- panel: DEFENSE NOW row when opened from D; BACK / DONE return to D ----
 const P0 = PANEL_RENDER.playbook;
 PANEL_RENDER.playbook = function () {
  let h = P0.apply(this, arguments);
  try {
   const G = G0();
   if (!off() && D.from && G && (!PS.pbTab || PS.pbTab === 'PLAYS' || PS.pbTab === 'SETS')) {
    const n = Array.isArray(G.lk411) ? G.lk411.length : 0, ds = G.dset;
    const row = '<div class="box" id="dpb600"><div class="row tabs"><span class="note">DEFENSE NOW</span>' +
     btn('MAN', 'dset', 'man', ds === 'man' ? 'on' : 'd') + btn('ZONE', 'dset', 'zone', ds === 'zone' ? 'on' : 'd') + btn('NO SLIDE', 'dset', 'black', ds === 'black' ? 'on' : 'd') +
     btn('LOCK OFF THEIR BEST', 'dpb600lk', 'best', 'y') + btn(n ? 'LOCK OFF (' + n + ')' : 'LOCK OFF', 'lk411Open', 'pb', n ? 'on' : 'd') + '</div></div>';
    const i = h.indexOf('<div class="row tabs">');
    h = i >= 0 ? h.slice(0, i) + row + h.slice(i) : row + h;
    h = h.replace('PICK A PLAY - YOUR GUYS RUN IT, YOU MAKE THE PASSES + THE SHOT', 'DEFENSE - TAP A CALL, IT IS ON RIGHT AWAY');
   }
  } catch (e) {}
  return h;
 };
 const wrapAct = (k, f) => { const o = PANEL_ACT[k]; if (typeof o === 'function') PANEL_ACT[k] = function () { return f.call(this, o, arguments); }; };
 wrapAct('pbBack', (o, a) => { if (D.from && !off()) return back(); return o.apply(null, a); });
 wrapAct('pbPick', (o, a) => { const r = o.apply(null, a); if (D.from && !off() && screen === 'live') back(); return r; });
 wrapAct('lk411Done', (o, a) => { const r = o.apply(null, a); if (D.from && !off() && screen === 'live') back(); return r; });
 wrapAct('dset', (o, a) => { const r = o.apply(null, a); try { if (D.from) panelDirty(); } catch (e) {} return r; });
 // LOCK OFF THEIR BEST: their best attacker on the field, your best pole (D, LSM, SSDM, then anyone) face-guards him
 PANEL_ACT.dpb600lk = function () {
  const G = G0(); if (!G || !G.players) return;
  const ov = p => { try { return ovrOf(p.pl); } catch (e) { return 0; } };
  const hasBall = p => p === G.dcar || p === G.carrier; // lock-off denies the ball: never the guy who already has it
  const atk0 = G.players.filter(p => p.team === 'D' && p.pl && !p.gk && p.pl.pos !== 'G'), atk = atk0.filter(p => !hasBall(p)).length ? atk0.filter(p => !hasBall(p)) : atk0;
  const def = G.players.filter(p => p.team === 'O' && p.pl && !p.gk && p.pl.pos !== 'G');
  if (!atk.length || !def.length) return;
  const L = Array.isArray(G.lk411) ? G.lk411 : [];
  // never the defender you are steering yourself (offline G.dctl; online the snapshot's ctl idx): the AI can't face-guard with him
  const N = Wn.RLNET, mineCtl = d => d === G.dctl || (online(G) && N && N.ctlIdx != null && d.idx === N.ctlIdx);
  const free = def.filter(d => !mineCtl(d) && !L.some(q => String(q.d) === String(d.pl.id)));
  const best = atk.slice().sort((a, b) => ov(b) - ov(a))[0];
  const rank = p => ({ D: 3, LSM: 2, SSDM: 1 }[p.pl.pos] || 0);
  const pool = free.length ? free : def.filter(d => !mineCtl(d)).length ? def.filter(d => !mineCtl(d)) : def;
  const mine = pool.slice().sort((a, b) => rank(b) - rank(a) || ov(b) - ov(a) || Math.hypot(a.x - best.x, a.y - best.y) - Math.hypot(b.x - best.x, b.y - best.y))[0];
  try { PANEL_ACT.lk411O(String(best.pl.id)); PANEL_ACT.lk411D(String(mine.pl.id)); } catch (e) { LOG.err.push('lk ' + e); return; }
  LOG.auto.push([ best.pl.id, mine.pl.id ]);
  try { if (Wn.V17 && V17.toast) V17.toast('LOCK OFF: ' + lastName(mine.pl) + ' ON ' + lastName(best.pl), '#ffe14d'); } catch (e) {}
  back();
 };
})();
