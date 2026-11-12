/* v505clear.js - Bagga Lax 1.3: nobody pops into existence at the sideline / midline (kill switch: window.__rl_no505clr = true).
 * Charlie (Nov 11): "you clear up the left side, 3 attackmen from the other team spawn in at midline on the left sideline.
 * Everyone's noticing it."
 * Root cause (reproduced headless): a pass to a far teammate during your clear rebuilds the clear (game.js liveClear
 * 'OUTLET') and the CPU's three far riders were dropped; v440md's 9-man safety net then re-added them one by one at a fixed
 * spot on screen (1.2: top sideline at midline, 254,44; 1.3 far path: x 216 on the ride lanes; the near path still uses
 * the top-sideline box at MIDX+-20, FT+12). v495ride keeps the riders through that rebuild and stays in.
 * This file covers every restore that still has to happen (any cause): the frame v440md adds a player back, he is moved
 * OFF SCREEN on his own half - past the camera edge on the side away from midline (behind his own end) - on his own lane
 * (never the sideline row), and from there he runs on to the spot v440md gave him (far riders: their ride lane; near
 * players: their home/mark). Never across midline, so offside counts are unchanged. If his spot is already off screen he
 * is put straight on it. Offline only (v440md itself is offline only); ids, rl_* keys, __rl_* flags, net protocol unchanged.
 * Telemetry: window.V505CLR { moved:[{t,id,side,where,from,to,cam}], errs }.
 */
(function () {
 'use strict';
 const W0 = window;
 if (W0.__rl_v505clr_loaded) return;
 W0.__rl_v505clr_loaded = 1;
 const LOG = W0.V505CLR = { moved: [], n: 0, errs: 0, err: [] };
 const off = () => !!W0.__rl_no505clr || !!W0.__rl_v124gb;
 const G_ = () => { try { return game; } catch (e) { return null; } };
 const camL = () => { try { return typeof camX === 'number' && isFinite(camX) ? camX : null; } catch (e) { return null; } };
 const viewW = () => { try { return typeof W === 'number' && W > 0 ? W : 380; } catch (e) { return 380; } };
 const ST0 = W0.step;
 if (typeof ST0 !== 'function') { LOG.why = 'no step'; return; }
 const seen = new WeakSet();
 const ents = G => G.players.concat(G.farU || [], G.farC || []);
 const idOf = x => x && x.pl && x.pl.id != null ? String(x.pl.id) : null;
 const M = 24;
 function place(G, p, rec) {
  const cam = camL();
  if (cam == null) return;
  const vw = viewW();
  const far = !!p.far;
  const mk = p.mark && typeof p.mark.x === 'number' ? [p.mark.x, p.mark.y] : null;
  const dest = far ? (p.rest || [p.x, p.y]) : (p.home || p.tgt || (mk && [p.x, mk[1]]) || [p.x, p.y]);
  const dx = +dest[0], dy = +dest[1];
  if (!isFinite(dx) || !isFinite(dy)) return;
  const right = dx > MIDX;
  const L0 = cam - M, R0 = cam + vw + M;
  let x;
  if (dx < L0 || dx > R0) x = dx;                 // his spot is already off screen: go straight to it
  else x = right ? Math.max(R0, MIDX + 6) : Math.min(L0, MIDX - 6);
  const y = Math.max(FT + 16, Math.min(FB - 10, dy));
  const from = [Math.round(p.x), Math.round(p.y)];
  p.x = x; p.y = y;
  if (far) { if (p.tx != null) { p.tx = x; p.ty = y; } }
  else if (p.kb) p.kb = null;
  if (p.h7v) p.h7v = 0;
  LOG.n++;
  const m = { t: +(+G.t || 0).toFixed(2), id: idOf(p), side: rec && rec.side, where: far ? 'far' : 'near', from: from, to: [Math.round(x), Math.round(y)], dest: [Math.round(dx), Math.round(dy)], cam: [Math.round(cam), Math.round(cam + vw)] };
  LOG.moved.push(m);
  if (LOG.moved.length > 60) LOG.moved.shift();
 }
 W0.step = function (dt) {
  const G = G_();
  const L = W0.V440MD && W0.V440MD.LOG;
  let before = null;
  try { if (!off() && L && G && G.players) before = new Set(ents(G)); } catch (e) { before = null; }
  const r = ST0.apply(this, arguments);
  try {
   if (before && L && L.restored && L.restored.length) {
    const fresh = [];
    for (let i = L.restored.length - 1; i >= 0; i--) { const rc = L.restored[i]; if (seen.has(rc)) break; seen.add(rc); fresh.push(rc); }
    if (fresh.length && G_() === G && G.players) {
     for (const rc of fresh) {
      const p = ents(G).find(q => !before.has(q) && idOf(q) === String(rc.id));
      if (p) place(G, p, rc);
     }
    }
   } else if (L && L.restored) { for (const rc of L.restored) seen.add(rc); }
  } catch (e) { LOG.errs++; if (LOG.err.length < 6) LOG.err.push(String(e && e.message || e)); }
  return r;
 };
})();
