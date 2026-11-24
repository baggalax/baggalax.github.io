// ===== BAGGA LAX v600shopart.js - 1.5 B70: SHOP ART FOR EVERY LIVE-OPS ITEM + SLOT RESPECTED =====
// Bug (Charlie, TestFlight): WALK THE PLANK put in a BIG banner slot of the Live-Ops panel showed at the very bottom of the
//        shop, under "BROUGHT BACK", with no image.
// Cause: v502live drew single items (not packs) as a separate "BROUGHT BACK" list AFTER #shopList, so the v580 Yard Sale
//        (which reads the panel's layout = big / med / small slots) never saw them; and those rows had no <img>.
// Fix:   (v502live) single items now go INTO #shopList as tiles with art, so v580 puts them in the slot the panel chose
//        (no slot = the ITEMS row). This file makes the art: SHOPART600.art(id, big)
//        - celly_wplank: the real celly scene (Flying Dutchman + the scorer on the plank over the ghost sea), drawn by the
//          game's own WP600 code, LEGENDARY gold frame + glow
//        - any other item: its real in-game icon / celly preview in the Yard Sale's framed, glowing art box - never blank
//        SHOPART600.look(id) = the tile's rarity background, which the big banner copies (special look per rarity).
// Kill switch: window.__rl_no600slot (old BROUGHT BACK list, no art).
(function () {
 'use strict';
 const Wn = window;
 const CACHE = {};
 const RAR = it => it && (it.leg20 ? 3 : it.rar | 0) || 0;
 const COL = [ [ '#6a7a86', '#22303a' ], [ '#3f8cff', '#10224a' ], [ '#ffcc33', '#3a2400' ], [ '#c77dff', '#2a1040' ] ]; // common, rare, legendary, special
 const NAME = [ 'COMMON', 'RARE', 'LEGENDARY', 'SPECIAL' ];
 function iconOf(id) {
  try {
   if (Wn.PLANK600 && id === 'celly_wplank') return PLANK600.iconFor(false);
   if (Wn.VI491 && VI491.iconFor) { const u = VI491.iconFor(id, false); if (u) return u; }
   if (Wn.V17 && V17.iconUrl) return V17.iconUrl(id, false);
  } catch (e) {}
  return null;
 }
 function frame(x, w, h, c) { // pixel rarity frame + inner glow
  x.fillStyle = '#0b1a20'; x.fillRect(0, 0, w, h);
  x.fillStyle = c[0]; x.fillRect(1, 1, w - 2, 1); x.fillRect(1, h - 2, w - 2, 1); x.fillRect(1, 1, 1, h - 2); x.fillRect(w - 2, 1, 1, h - 2);
  const gr = x.createRadialGradient(w / 2, h * .45, 2, w / 2, h * .45, Math.max(w, h) * .7);
  gr.addColorStop(0, c[0] + '66'); gr.addColorStop(1, c[1]);
  x.fillStyle = gr; x.fillRect(2, 2, w - 4, h - 4);
 }
 // WALK THE PLANK: the celly itself at the cocky moment (end of the plank, arms up), drawn by WP600 over the ghost sea
 function plank(big) {
  const w = big ? 84 : 48, h = big ? 100 : 48, S = 2;
  const cv = document.createElement('canvas'); cv.width = w * S; cv.height = h * S; const x = cv.getContext('2d'); x.imageSmoothingEnabled = false;
  if (!Wn.WP600 || typeof g === 'undefined' || typeof W === 'undefined') return null;
  const c = COL[2], fx = 400, fy = typeof CY !== 'undefined' ? CY : 90;
  let kit = { jersey: '#2c6bd8', trim: '#ffffff', helm: '#2c6bd8' };
  try { const tid = typeof lobbyTeam === 'function' && lobbyTeam() || (typeof season !== 'undefined' && season && season.team); if (tid && typeof lobbyKit === 'function') kit = lobbyKit(tid) || kit; } catch (e) {}
  const t = 2.45, cel = { ck: 'wplank', t: t, dur: WP600.dur, sx: fx, sy: fy, face: 1, actors: [], wp: [] };
  for (let i = 0; i < 4; i++) cel.wp.push({ src: null, pl: null, x0: fx, y0: fy, kit: kit });
  const kk = g, G0 = typeof game !== 'undefined' ? game : null;
  try {
   x.setTransform(1, 0, 0, 1, 0, 0);
   const sky = x.createLinearGradient(0, 0, 0, h * S); sky.addColorStop(0, '#06140f'); sky.addColorStop(.62, '#10302a'); sky.addColorStop(1, '#0e3329');
   x.fillStyle = sky; x.fillRect(0, 0, w * S, h * S);
   for (let i = 0; i < 18; i++) { x.fillStyle = i % 3 ? 'rgba(125,255,176,.55)' : '#e9fff2'; x.fillRect((i * 37) % (w * S), (i * 53) % Math.round(h * S * .5), S, S); } // ghost-sea stars
   // world -> banner: the plank tip a bit right of centre, waterline at 70 % height
   const G1 = WP600.geo(cel, { l: fx - 400, r: fx + 400, top: fy - 200 }), tipX = G1.WX(-28), k = big ? .95 : .6;
   x.setTransform(k * S, 0, 0, k * S, Math.round(w * S * .93 - tipX * k * S), Math.round(h * S * .86 - G1.wl * k * S));
   g = x; game = { c17: cel, g17: null, t: t };
   WP600.draw(cel, t, { l: fx - 400, r: fx + 400, top: fy - 400 });
  } catch (e) { (Wn.__shopart600err = Wn.__shopart600err || []).push(String(e)); } finally { game = G0; g = kk; x.setTransform(1, 0, 0, 1, 0, 0); }
  const out = document.createElement('canvas'); out.width = w; out.height = h; const o = out.getContext('2d'); o.imageSmoothingEnabled = false;
  frame(o, w, h, c);
  o.drawImage(cv, 0, 0, w * S, h * S, 2, 2, w - 4, h - 4);
  o.fillStyle = c[0]; o.fillRect(1, 1, w - 2, 1); o.fillRect(1, h - 2, w - 2, 1); o.fillRect(1, 1, 1, h - 2); o.fillRect(w - 2, 1, 1, h - 2);
  return out.toDataURL();
 }
 // art(id, big): WALK THE PLANK = its own scene card; anything else = its real in-game icon / celly preview (the Yard Sale
 // frame + glow around it), so no tile is ever blank
 function art(id, big) {
  const k = id + (big ? ':b' : ':s');
  if (CACHE[k]) return CACHE[k];
  if (id === 'celly_wplank') { const u = plank(big); if (u) return (CACHE[k] = u); }
  const u = iconOf(id) || '';
  if (u) CACHE[k] = u;
  return u;
 }
 function look(id) {
  const it = Wn.V17 && V17.BY[id], r = Math.min(3, RAR(it)), c = COL[r];
  return { bg: 'linear-gradient(110deg,' + c[1] + ' 0%,#0b1a20 55%,' + c[1] + ' 100%)', border: c[0], rar: NAME[r], title: c[0] };
 }
 Wn.SHOPART600 = { art: art, look: look, iconOf: iconOf };
})();
