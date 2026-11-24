'use strict';
/* v582gear - Bagga Lax 1.4 sprite fixes (Friday). Gameplay unchanged; drawing only.
   FIX 1  Bug: New Orleans Ghosts on the SIDELINE wore plain black helmets.
          Cause: game.js drawBench draws bench + sub-run sprites with plain RL12.draw (no gear bake), so the ghost
          leather-helmet look (V17.gearOfP) never applied there.
          Fix: while drawBench runs, the player being drawn is known from its skinOf(PP(id)) call; for a ghost
          (FLIP2403.gho) the frame is drawn from V17.bakeGear with that player's ghost gear instead.
   FIX 2  Bug: a ghost (or any leather-helmet player) flickered a black helmet during the spin dodge.
          Cause: drawDodger12s roll frame 1 paints a 9x4 "back of helmet" box in kit.helm over the sprite.
          Fix: during drawDodger12s for a leather-helmet player, that one box is painted leather brown.
   FIX 3  Bug: Turkey Trotters lost the tail fan while dodging / carrying one-handed.
          Cause: those poses use draw12ns, whose plain (no-gear) path bakes its own canvas and skips the RL12.draw /
          bakeGear hooks that add the tail (v565turkey).
          Fix: when draw12ns took the plain path (seen via the noStick12 cache lookup, which also gives the real
          frame name after v442 remaps it) the tail/gobble deco (TK565.deco) is painted on top, same place.
   Fail safe: every hook try/catch, falls back to the original. Kill switches: window.__rl_no582gear (all),
   __rl_no582bench, __rl_no582dodge, __rl_no582tail. No ids, storage keys or net protocol touched. */
(function () {
 const W = window;
 const off = k => !!(W.__rl_no582gear || W.__rl_v124gb || (k && W[k]));
 const LOG = W.V582G = { err: [], bench: 0, dodge: 0, tail: 0 };
 const fail = (w, e) => { try { if (LOG.err.length < 30) LOG.err.push(w + ': ' + String(e && e.message || e).slice(0, 140)); } catch (_) {} };
 if (typeof RL12 === 'undefined' || !RL12.draw || !W.V17) return;

 /* ---------- FIX 1: sideline ghosts ---------- */
 let inBench = false, benchPl = null;
 try {
  if (typeof W.drawBench === 'function' && typeof W.skinOf === 'function') {
   const DB0 = W.drawBench, SK0 = W.skinOf;
   W.skinOf = function (p) { if (inBench) benchPl = p || null; return SK0.apply(this, arguments); };
   W.drawBench = function () {
    if (off('__rl_no582bench')) return DB0.apply(this, arguments);
    inBench = true; benchPl = null;
    try { return DB0.apply(this, arguments); } finally { inBench = false; benchPl = null; }
   };
   const D0 = RL12.draw;
   RL12.draw = function (gg, name, x, y, kit, faceRight, opts) {
    if (inBench && benchPl && kit && /^(bench_|run)/.test(name)) {
     const pl = benchPl;
     benchPl = null;
     try {
      if (W.FLIP2403 && FLIP2403.gho && FLIP2403.gho(pl) && V17.gearOfP && V17.bakeGear) {
       const gr = V17.gearOfP(pl, kit), f = RL12.FR[name];
       if (gr && f) {
        const c = V17.bakeGear(name, kit, !faceRight, (opts && opts.skin) | 0, gr, false, {});
        if (c) {
         const pad = c.pad17 || 0, w = f[3][0].length, ax = faceRight ? f[0] : w - 1 - f[0];
         const a0 = gg.globalAlpha;
         if (opts && opts.alpha != null) gg.globalAlpha = opts.alpha;
         if (!opts || opts.shadow !== false) { gg.fillStyle = 'rgba(0,0,0,.25)'; gg.fillRect(Math.round(x) - 4, Math.round(y), 9, 2); }
         gg.drawImage(c, Math.round(x) - ax - pad, Math.round(y) - f[1] - pad);
         gg.globalAlpha = a0;
         LOG.bench++;
         return;
        }
       }
      }
     } catch (e) { fail('bench', e); }
    }
    return D0.apply(this, arguments);
   };
  }
 } catch (e) { fail('bench0', e); }

 /* ---------- FIX 2: leather helmet during the spin dodge ---------- */
 let dodgeHc = null;
 try {
  if (typeof W.drawDodger12s === 'function' && typeof W.rect === 'function') {
   const DD0 = W.drawDodger12s, R0 = W.rect;
   W.rect = function (x, y, w, h, c) {
    if (dodgeHc && w === 9 && h === 4 && c === dodgeHc) {
     try {
      R0.call(this, x, y, w, h, '#8a5a2a');
      R0.call(this, x + 1, y, w - 2, 1, '#a8743e');
      R0.call(this, x, y + h - 1, w, 1, '#4a2c12');
      LOG.dodge++;
      return;
     } catch (e) { fail('rect', e); }
    }
    return R0.apply(this, arguments);
   };
   W.drawDodger12s = function (p, kit, faceRight) {
    if (off('__rl_no582dodge') || !p || !kit || !p.dodgeA) return DD0.apply(this, arguments);
    let hc = null;
    try {
     const gr = V17.gearOfP ? V17.gearOfP(p.pl, kit) : null;
     if (gr && gr.helmet === 'helm_leather') hc = kit.helm === '#111111' || kit.helm === '#1b1b1b' ? '#262626' : kit.helm;
    } catch (e) { fail('dodge', e); }
    const prev = dodgeHc;
    dodgeHc = hc;
    try { return DD0.apply(this, arguments); } finally { dodgeHc = prev; }
   };
  }
 } catch (e) { fail('dodge0', e); }

 /* ---------- FIX 2b + 3b: roll / split / shot bodies drawn by v442anim keep the player's gear + turkey tail ----------
    Cause: v442anim draws those bodies with draw0 (the raw sprites12 RL12.draw it captured at load), so EVERY gear item,
    the ghost leather helmet and the turkey tail vanished for those frames (the "flicker"). v464wd fixed this for the
    Whale/Crown fits only. Same method here for gear players + turkey kits: the kit handed to v442 carries a private g27
    marker; sprites12 asks RL12.g27 per pixel while baking, which names the frame; when that canvas is drawn, the
    gear bake (V17.bakeGear, which also adds the turkey tail) of the same frame is drawn instead. */
 try {
  const R = RL12, FR = R.FR, MK = 'g582|';
  const orig = new WeakMap, marked = new Map;
  const markOf = kit => { let m = marked.get(kit); if (!m) { m = Object.assign({}, kit, { g27: MK }); orig.set(m, kit); if (marked.size > 40) marked.clear(); marked.set(kit, m); } return m; };
  const isFit = kit => !!(kit && (kit.fit45 === 'whale' || kit.fit45 === 'crown'));
  const isTk = kit => !!kit && (kit.g27 === 'tk565H' || kit.g27 === 'tk565A') && !W.__rl_no565;
  function v442body(p) {
   const A = p && p.dodgeA, S = W.__rl442;
   if (!S || !S.on || W.__rl_no442anim) return false;
   if (A) return A.kind === 'roll' || (A.kind === 'split' && !A.k286);
   try { if (p.shot20 && S.shotOf && S.shotOf(p)) return true; } catch (e) {}
   try { if (S.windOf && S.windOf(p) >= 0) return true; } catch (e) {}
   return false;
  }
  let pend = null;
  const g270 = R.g27;
  R.g27 = function (kit, ch, q, r, rows, name) {
   if (kit && kit.g27 === MK) { if (!pend || pend.name !== name || pend.rows !== rows) pend = { name: name, rows: rows }; return null; }
   return typeof g270 === 'function' ? g270.apply(this, arguments) : null;
  };
  const canv = new WeakMap;
  function learn(c) {
   let k = canv.get(c);
   if (k) return k;
   const P = pend; pend = null;
   if (!P || !P.rows || !P.rows.length) return null;
   const rows = P.rows, h = rows.length, w = rows[0].length;
   if (c.width !== w || c.height !== h) return null;
   let a = 0, b = 0;
   const d = c.getContext('2d').getImageData(0, 0, w, h).data;
   for (let r = 0; r < h; r++) for (let q = 0; q < w; q++) {
    const on = rows[r][q] !== '.';
    if ((d[(r * w + q) * 4 + 3] > 0) === on) a++;
    if ((d[(r * w + (w - 1 - q)) * 4 + 3] > 0) === on) b++;
   }
   k = { name: P.name, flip: b > a };
   canv.set(c, k);
   return k;
  }
  function swapDraw(gx, real, cur, gr) {
   const di0 = gx.drawImage, own = Object.prototype.hasOwnProperty.call(gx, 'drawImage');
   gx.drawImage = function (c, X, Y) {
    if (arguments.length === 3 && c && c.tagName === 'CANVAS') {
     try {
      const k = learn(c), f = k && FR[k.name];
      if (f) {
       const sk = typeof skinOf === 'function' ? skinOf(cur.pl) : 0;
       const fc = V17.bakeGear(k.name, real, k.flip, sk, gr || {}, false, {});
       if (fc) {
        const pad = fc.pad17 || 0;
        LOG.swap = (LOG.swap || 0) + 1;
        return di0.call(this, fc, X - pad, Y - pad);
       }
      }
     } catch (e) { fail('swap', e); }
    }
    return di0.apply(this, arguments);
   };
   return () => { if (own) gx.drawImage = di0; else delete gx.drawImage; };
  }
  if (typeof W.drawDodger12s === 'function' && V17.bakeGear) {
   const DD1 = W.drawDodger12s;
   W.drawDodger12s = function (p, kit, faceRight) {
    if (off('__rl_no582dodge') || !p || !kit || isFit(kit) || typeof g === 'undefined' || !g || !v442body(p)) return DD1.apply(this, arguments);
    let gr = null, undo = null;
    try {
     gr = V17.gearOfP ? V17.gearOfP(p.pl, kit) : null;
     if (!gr && !isTk(kit)) return DD1.apply(this, arguments);
     undo = swapDraw(g, kit, p, gr);
    } catch (e) { fail('dd', e); return DD1.apply(this, arguments); }
    pend = null;
    try { return DD1.call(this, p, markOf(kit), faceRight); } finally { pend = null; try { undo(); } catch (e) {} }
   };
   // a marked kit that reaches the normal sprite doors (a v442 fallback) gets the real kit back
   const unmark = (fn, i) => function () { const r = orig.get(arguments[i]); if (r) { const a = Array.prototype.slice.call(arguments); a[i] = r; return fn.apply(this, a); } return fn.apply(this, arguments); };
   if (typeof W.draw12ns === 'function') W.draw12ns = unmark(W.draw12ns, 3);
   if (typeof V17.drawP === 'function') V17.drawP = unmark(V17.drawP, 3);
  }
 } catch (e) { fail('swap0', e); }

 /* ---------- FIX 3: turkey tail on draw12ns (dodges, one-hand carry) ---------- */
 try {
  const NS = typeof noStick12 !== 'undefined' ? noStick12 : null;
  if (NS && typeof NS.get === 'function' && typeof W.draw12ns === 'function') {
   let cur = null;
   const G0 = NS.get;
   NS.get = function (k) {
    if (cur && typeof k === 'string') cur.name = k.split('|')[0];
    return G0.apply(this, arguments);
   };
   const isTk = kit => !!kit && (kit.g27 === 'tk565H' || kit.g27 === 'tk565A') && !!(W.TK565 && TK565.deco) && !W.__rl_no565;
   const N0 = W.draw12ns;
   W.draw12ns = function (name, x, y, kit, faceRight, skin, shadow) {
    if (off('__rl_no582tail') || !isTk(kit)) return N0.apply(this, arguments);
    const prev = cur, me = cur = { name: null };
    let r;
    try { r = N0.apply(this, arguments); } finally { cur = prev; }
    try {
     const f = me.name && RL12.FR[me.name];
     if (f && typeof g !== 'undefined') {
      const w = f[3][0].length, bx = Math.round(x) - (faceRight ? f[0] : w - 1 - f[0]), by = Math.round(y) - f[1];
      TK565.deco((q, rr, c) => { g.fillStyle = c; g.fillRect(bx + q, by + rr, 1, 1); }, me.name, kit, !faceRight);
      LOG.tail++;
     }
    } catch (e) { fail('tail', e); }
    return r;
   };
  }
 } catch (e) { fail('tail0', e); }
})();
