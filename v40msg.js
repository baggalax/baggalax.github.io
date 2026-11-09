(function() {
 'use strict';
 const off = () => !!window.__rl_no40msg || !!window.__rl_v124gb;
 const isLive = s => s === 'live' || s === 'defense';
 const FADE = .15;
 const LIVE_CHIRPS = false;
 const LIVE_LINE = false;
 const ST = {
  liveFrom: -1,
  gone: 0,
  prev: null,
  lastLine: null,
  rc: 0
 };
 const hideNow = () => !off() && typeof game !== 'undefined' && !!game && isLive(typeof screen === 'string' ? screen : '');
 window.V40MSG = {
  ST: ST,
  on: () => !off(),
  line: () => ST.lastLine,
  hideNow: hideNow
 };
 function sync() {
  if (off() || typeof fx === 'undefined' || !Array.isArray(fx)) return;
  const now = typeof screen === 'string' ? screen : '', nowLive = isLive(now);
  for (const f of fx) if (f.type === 'cue' && f.s40 == null) f.s40 = nowLive ? 'live' : 'stop';
  if (nowLive && ST.prev != null && !isLive(ST.prev)) {
   ST.liveFrom = game ? game.t : 0;
   for (const f of fx) if (f.type === 'cue' && f.s40 === 'stop' && !f.gone40) {
    f.gone40 = true;
    ST.gone++;
   }
  }
  ST.prev = now;
 }
 const step0 = window.step;
 if (typeof step0 === 'function') window.step = function(dt) {
  const r = step0.apply(this, arguments);
  try {
   sync();
  } catch (e) {
   console.error(e);
  }
  return r;
 };
 const render0 = window.render;
 if (typeof render0 === 'function') window.render = function() {
  ST.lastLine = null;
  return render0.apply(this, arguments);
 };
 function line(G) {
  const c = [];
  for (const f of fx) if (f.type === 'cue' && !f.gone40 && f.s) c.push({
   s: String(f.s),
   col: f.col || '#ffe14d',
   age: f.t || 0,
   left: (f.life || .5) - (f.t || 0)
  });
  for (const B of [ G.injBanner, G.ejBanner ]) if (B && B.t != null && B.t < 3.2) c.push({
   s: B.txt + (B.sub ? ' - ' + B.sub : ''),
   col: B.txt === 'EJECTED' ? '#ff4a3a' : '#ffb14d',
   age: B.t,
   left: 3.2 - B.t
  });
  if (!c.length) return null;
  c.sort((a, b) => a.age - b.age);
  return c[0];
 }
 function drawLine(G, ruleCount) {
  const L = line(G);
  ST.lastLine = L ? {
   s: L.s,
   col: L.col
  } : null;
  if (!L) return;
  const BY = 18, BH = 11, maxW = W - 8;
  let s = L.s, w = s.length * 4 + 8;
  while (w > maxW && s.length > 4) {
   s = s.slice(0, -1);
   w = s.length * 4 + 8;
  }
  let cx = W / 2;
  if (ruleCount) cx = Math.min(W - w / 2 - 3, W / 2 + ruleCount / 2 + 4 + w / 2);
  const a = Math.max(0, Math.min(1, L.left / FADE));
  g.globalAlpha = a;
  rect(Math.round(cx - w / 2), BY, w, BH, 'rgba(5,7,11,.92)');
  rect(Math.round(cx - w / 2), BY, w, 1, L.col);
  text(s, Math.round(cx), BY + 4, 1, L.col, 'center');
  g.globalAlpha = 1;
  ST.lastLine.x = Math.round(cx - w / 2);
  ST.lastLine.w = w;
  ST.lastLine.alpha = a;
 }
 function wrapLive(name) {
  const f0 = window[name];
  if (typeof f0 !== 'function') return;
  window[name] = function() {
   if (off() || !isLive(screen) || !game) return f0.apply(this, arguments);
   try {
    sync();
   } catch (e) {
    console.error(e);
   }
   const all = fx;
   let r;
   fx = all.filter(f => f.type !== 'cue');
   try {
    r = f0.apply(this, arguments);
   } finally {
    fx = all;
   }
   if (LIVE_LINE) {
    try {
     drawLine(game, ST.rc || 0);
    } catch (e) {
     console.error(e);
    }
   } else ST.lastLine = null;
   return r;
  };
 }
 wrapLive('drawControls');
 wrapLive('drawDefense');
 const rc0 = window.drawRuleCounts;
 if (typeof rc0 === 'function') window.drawRuleCounts = function() {
  if (off()) return rc0.apply(this, arguments);
  const t0 = window.text;
  let drew = 0;
  window.text = function(s, x, y) {
   if (y === 19) drew = String(s).length * 4 + 6;
   return t0.apply(this, arguments);
  };
  try {
   return rc0.apply(this, arguments);
  } finally {
   window.text = t0;
   ST.rc = drew;
  }
 };
 const hud0 = window.drawHUD;
 if (typeof hud0 === 'function') window.drawHUD = function() {
  if (off() || !isLive(screen) || !game) return hud0.apply(this, arguments);
  const G = game, a = G.injBanner, b = G.ejBanner;
  G.injBanner = null;
  G.ejBanner = null;
  try {
   return hud0.apply(this, arguments);
  } finally {
   G.injBanner = a;
   G.ejBanner = b;
  }
 };
 function wrapWorld(name) {
  const f0 = window[name];
  if (typeof f0 !== 'function') return;
  window[name] = function() {
   if (!hideNow()) return f0.apply(this, arguments);
   const all = fx;
   let r;
   fx = all.filter(f => f.type !== 'txt' && f.type !== 'cue');
   try {
    r = f0.apply(this, arguments);
   } finally {
    fx = all;
   }
   return r;
  };
 }
 wrapWorld('drawLiveWorld');
 wrapWorld('drawDefWorld');
 const pops0 = window.drawPops;
 if (typeof pops0 === 'function') window.drawPops = function() {
  if (!hideNow() || LIVE_CHIRPS) return pops0.apply(this, arguments);
  const G = game;
  if (G && G.pops) G.pops = G.pops.filter(p => menuT - p.t0 < p.life);
 };
})();
