/* v462tr: TEAMS + RATINGS button on the HOME screen (Charlie, Nov 9 2026: "Move teams/ratings to this page").
   A third button on the bottom row of the home's left panel (CLIPS / EDIT NAMES / TEAMS + RATINGS).
   Opens the same team browser as the PLAY menu entry (menuSel.mode = 'browse'; screen = 'pickTeam').
   BACK in the team browser sets screen = 'menu' and M37.page stays 'home', so it lands back on HOME.
   Kill switch: window.__rl_no462tr = true. */
(function() {
 'use strict';
 const off = () => !!(window.__rl_no462tr || window.__rl_v124gb);
 const V = window.V462TR = { log: [], n: 0 };
 if (!window.V40H || typeof V40H.layout !== 'function') return;
 const home = () => !!(window.M37 && M37.page === 'home');
 const open = () => {
  V.n++;
  V.log.push('open ' + Date.now());
  if (V.log.length > 20) V.log.shift();
  try { lobby.card = null; } catch (e) {}
  menuSel.mode = 'browse';
  screen = 'pickTeam';
 };
 V.open = open;
 const entry = () => ({
  key: 'HOME TEAMS + RATINGS',
  lab: 'TEAMS + RATINGS',
  label: 'TEAMS + RATINGS',
  sub: 'EVERY TEAM + PLAYER',
  fn: open,
  bg: '#8fe3f0',
  icon: 'jersey',
  ang: -1.3,
  kind: 'small',
  tr462: 1
 });
 const L0 = V40H.layout;
 V40H.layout = function(L) {
  const rows = L0.apply(this, arguments);
  if (off() || !home() || !Array.isArray(rows)) return rows;
  try {
   if (rows.some(r => r.some(b => b && b.tr462))) return rows;
   const last = rows[rows.length - 1];
   const lastKeys = last ? last.map(b => b && b.key) : [];
   // bottom row is CLIPS / EDIT NAMES (either or both): add as its 3rd (or 2nd) button
   if (last && last.length < 3 && !last.some(b => b && b.wf) && last.every(b => b && b.kind === 'small' && (b.key === 'CLIPS' || b.key === 'EDIT NAMES'))) {
    last.push(entry());
    // size each button to its label so TEAMS + RATINGS never clips on narrow screens
    // (equal widths when every label fits, like the rows above; label-sized widths otherwise)
    const tw = b => textW(b.lab, 1) + 10, sum = last.reduce((s, b) => s + tw(b), 0), per = Math.floor(((L || 0) - 16 - 6 * (last.length - 1)) / last.length);
    if (!last.every(b => tw(b) <= per)) last.forEach(b => { b.wf = tw(b) / sum; });
   } else rows.push([ entry() ]);
   V.rows = rows.map(r => r.map(b => b.key));
   V.lastKeys = lastKeys;
  } catch (e) {
   console.error(e);
  }
  return rows;
 };
})();
