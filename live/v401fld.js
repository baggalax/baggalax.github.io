(function() {
 'use strict';
 window.V401FLD = {
  on: false
 };
 if (window.__rl_v124gb || typeof window.drawField !== 'function') return;
 var LOG = {
  gold: 0,
  hid: 0
 };
 var DF0 = window.drawField;
 window.drawField = function() {
  var goldOn = false;
  try {
   goldOn = !window.__rl_no401fld && !!(window.V232 && V232.stadiumOn && V232.stadiumOn());
  } catch (e) {}
  if (!goldOn) return DF0.apply(this, arguments);
  var T0 = window.text, B0 = window.badge, ht = null;
  try {
   ht = homeTeam();
  } catch (e) {}
  LOG.gold++;
  try {
   window.badge = function(team, x, y, sc) {
    if (sc === 3 && Math.round(x) === MIDX - 19 && Math.round(y) === CY - 26) {
     LOG.hid++;
     return;
    }
    return B0.apply(this, arguments);
   };
   window.text = function(s, x, y, sc) {
    if (ht && s === ht.name && x === MIDX && y === CY + 25 && sc === 2) {
     LOG.hid++;
     return;
    }
    return T0.apply(this, arguments);
   };
   return DF0.apply(this, arguments);
  } finally {
   window.text = T0;
   window.badge = B0;
  }
 };
 window.V401FLD = {
  on: function() {
   return !window.__rl_no401fld;
  },
  LOG: LOG
 };
})();
