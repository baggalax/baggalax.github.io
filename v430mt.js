'use strict';
// v430mt: Quick game PICK OPPONENT (COLLEGE tab) dead screen fix.
// The "CHANGING TEAM - keep your items?" ask (items17 drawAsk2403) is drawn on the canvas, but the
// college team list (#qpc26) is a DOM layer above the canvas, so the ask was hidden behind the list
// while its full-screen tap blocker (a hit box added after the list) swallowed every tap:
// no opponent could be picked, BACK / HOME / AWAY / RANDOM / tabs all dead.
// Fix: while a full-screen canvas ask/blocker is up on the screen that shows the list, hide the list
// (same way the season dropdowns already hide it), so the ask is visible and answerable; the list
// comes back the moment the ask is answered. Kill switch: window.__rl_no430mt = true.
(function() {
  const off = () => !!window.__rl_no430mt || !!window.__rl_v124gb;
  const LOG = window.__rl430mt = { hid: 0, shown: 0, last: null, errs: [] };
  let hidden = false;
  function el() {
    try { return typeof qpc26El !== 'undefined' ? qpc26El : null; } catch (e) { return null; }
  }
  function askUp() {
    // explicit: the quick-game items ask (pickOpp)
    try {
      if (window.I2403 && I2403.on && I2403.on() && I2403.quickAsk && I2403.quickAsk()) return 'items2403';
    } catch (e) {}
    // generic: any full-screen canvas BLOCK hit on this screen (not the season dropdowns, which hide the list themselves)
    try {
      const pre = screenKey() + '|';
      for (const s of uiSpecs) {
        if (!s || !s.key || s.key.indexOf(pre) !== 0) continue;
        const lb = String(s.label || '');
        if (!/BLOCK$/.test(lb) || /^DD/.test(lb)) continue;
        if (s.x <= 1 && s.y <= 1 && s.w >= W - 2 && s.h >= H - 2) return lb;
      }
    } catch (e) {}
    return null;
  }
  function apply(seen) {
    const q = el();
    if (!q) return;
    const why = !off() && seen ? askUp() : null;
    if (why) {
      if (!hidden || q.style.visibility !== 'hidden') {
        q.style.visibility = 'hidden';
        q.style.pointerEvents = 'none';
        if (!hidden) { LOG.hid++; LOG.last = why; }
        hidden = true;
      }
    } else if (hidden) {
      hidden = false;
      LOG.shown++;
      // hand the element back to qpc26Show/qpc26Sync exactly as they last styled it
      const st = q.dataset.st;
      q.style.cssText = st && st !== 'none' ? st : 'display:none';
    }
  }
  const S0 = window.qpc26Sync;
  if (typeof S0 === 'function') {
    window.qpc26Sync = function() {
      let seen = false;
      try { seen = typeof qpc26Seen !== 'undefined' ? !!qpc26Seen : false; } catch (e) {}
      try { apply(seen); } catch (e) { LOG.errs.push(String(e && e.message || e).slice(0, 120)); }
      return S0.apply(this, arguments);
    };
  }
  const SH0 = window.qpc26Show;
  if (typeof SH0 === 'function') {
    window.qpc26Show = function() {
      const r = SH0.apply(this, arguments);
      // qpc26Show rewrites cssText only when its style key changes; keep the list hidden while the ask is up
      try { if (hidden && !off()) { const q = el(); if (q && q.style.visibility !== 'hidden') { q.style.visibility = 'hidden'; q.style.pointerEvents = 'none'; } } } catch (e) {}
      return r;
    };
  }
})();
