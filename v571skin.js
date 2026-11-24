/* v571skin.js - skin tones live in EDIT NAMES now (Bagga Lax 1.4, Nov 2026). Kill switch: window.__rl_no571 = true.
 * Charlie: skin tones were changed in the team STATS (roster) menu - move that to the EDIT NAMES menu. I changed my Ghost
 * player to white and can't get the green back - make GHOST (green) a skin option in the cycle. Add a reset that puts the
 * whole team's skin tones back to the originals.
 * - Roster (stats) screen: the skin bar is gone.
 * - EDIT NAMES > a team: every player row has a skin swatch; tap it to cycle LIGHT ... DEEP, GHOST. RESET SKIN TONES in the
 *   team header puts every player back to his original (Ghosts = GHOST green).
 * Same save key as before (rl_skins); GHOST is tone 6 (the Ghosts' own tone), now kept after a restart. No ids / net changes. */
(function () {
 'use strict';
 const W = window;
 if (W.__rl_v571_loaded || W.__rl_no571 || W.__rl_v124gb) return;
 W.__rl_v571_loaded = 1;
 const V = W.V571S = { err: [] };
 const fail = (w, e) => { if (V.err.length < 20) V.err.push(w + ': ' + String(e && e.message || e)); };
 if (typeof SKINS === 'undefined' || typeof setSkin !== 'function' || typeof RL12 === 'undefined' || !RL12.SKIN) return;
 const N = Math.min(7, RL12.SKIN.length);
 const NAMES = [ 'LIGHT', 'LIGHT-MEDIUM', 'MEDIUM', 'MEDIUM-DARK', 'DARK', 'DEEP', 'GHOST' ];
 const col = s => (RL12.SKIN[s] || RL12.SKIN[0]).base;
 // GHOST tone survives a restart (game.js only reloads 0-5)
 try { for (const id in SKINS) if (SKINS[id] === 6 && PP(id)) PP(id).skin = 6; } catch (e) { fail('load', e); }
 // cycle includes GHOST
 W.setSkin = function (id, s) {
  const p = PP(id);
  if (!p) return -1;
  p.skin = ((s | 0) % N + N) % N;
  SKINS[id] = p.skin;
  try { LS.set('skins', SKINS); } catch (e) {}
  return p.skin;
 };
 function original(p) {
  if (p.gho16) return 6;
  if (p.id === 'LEG-2') return 4;
  try { return defaultSkin(p); } catch (e) { return 0; }
 }
 function resetTeam(tid) {
  let n = 0;
  try {
   for (const pid of (T(tid).roster || [])) { const p = PP(pid); if (!p || W.V572NA && V572NA.isCollabP && V572NA.isCollabP(p)) continue; delete SKINS[pid]; p.skin = original(p); n++; }
   LS.set('skins', SKINS);
  } catch (e) { fail('reset', e); }
  return n;
 }
 V.resetTeam = resetTeam;
 // roster (stats) screen: no skin bar
 try {
  if (typeof PANEL_RENDER === 'object' && typeof PANEL_RENDER.roster === 'function') {
   const r0 = PANEL_RENDER.roster;
   PANEL_RENDER.roster = function () { const h = r0.apply(this, arguments); return typeof h === 'string' && !W.__rl_no571 ? h.replace(/<div class="skinbar">[\s\S]*?<\/div>/, '') : h; };
  }
 } catch (e) { fail('roster', e); }
 // EDIT NAMES: swatches + reset
 const css = () => {
  if (document.getElementById('sk571css')) return;
  const s = document.createElement('style');
  s.id = 'sk571css';
  s.textContent = '#ed31 .sk571{display:inline-block;width:18px;height:18px;border:2px solid #000;box-shadow:inset 0 0 0 1px rgba(255,255,255,.5);margin-left:6px;flex:none;cursor:pointer;vertical-align:middle}' +
   '#ed31 .skn571{font-size:10px;opacity:.8;margin:2px 4px}';
  document.head.appendChild(s);
 };
 function tidNow() { try { const v = W.ED31 && ED31.state && ED31.state().view; return v && v.s === 'team' ? v.tid : v && v.tid; } catch (e) { return null; } }
 function decorate() {
  const list = document.getElementById('ed31Roster');
  if (!list || list.__sk571) return;
  list.__sk571 = 1;
  css();
  list.querySelectorAll('[data-pid]').forEach(b => {
   const pid = b.getAttribute('data-pid'), p = PP(pid);
   if (!p || b.querySelector('.sk571')) return;
   const sw = document.createElement('span');
   sw.className = 'sk571';
   sw.setAttribute('data-sk571', pid);
   sw.setAttribute('role', 'button');
   sw.setAttribute('aria-label', 'SKIN TONE ' + NAMES[skinOf(p)] + ' - TAP TO CHANGE');
   sw.style.background = col(skinOf(p));
   b.appendChild(sw);
  });
  const note = document.createElement('div');
  note.className = 'skn571';
  note.textContent = 'TAP A COLOR SQUARE TO CHANGE THAT PLAYER\'S SKIN TONE.';
  const tid = tidNow();
  const rb = document.createElement('button');
  rb.type = 'button'; rb.className = 'g'; rb.textContent = 'RESET SKIN TONES'; rb.setAttribute('data-skr571', tid || '');
  rb.setAttribute('aria-label', 'RESET SKIN TONES');
  const row = document.createElement('div');
  row.className = 'row';
  row.appendChild(rb); row.appendChild(note);
  list.insertBefore(row, list.firstChild);
 }
 document.addEventListener('click', ev => {
  try {
   if (W.__rl_no571) return;
   const t = ev.target;
   const sw = t && t.closest && t.closest('[data-sk571]');
   if (sw) {
    ev.preventDefault(); ev.stopPropagation();
    const pid = sw.getAttribute('data-sk571'), p = PP(pid);
    if (!p || W.V572NA && V572NA.isCollabP && V572NA.isCollabP(p)) return;
    const s = W.setSkin(pid, skinOf(p) + 1);
    sw.style.background = col(s);
    sw.setAttribute('aria-label', 'SKIN TONE ' + NAMES[s] + ' - TAP TO CHANGE');
    return;
   }
   const rb = t && t.closest && t.closest('[data-skr571]');
   if (rb) {
    ev.preventDefault(); ev.stopPropagation();
    const tid = rb.getAttribute('data-skr571') || tidNow();
    if (!tid) return;
    resetTeam(tid);
    document.querySelectorAll('#ed31Roster [data-sk571]').forEach(e => { const p = PP(e.getAttribute('data-sk571')); if (p) e.style.background = col(skinOf(p)); });
    rb.textContent = 'SKIN TONES RESET';
   }
  } catch (e) { fail('click', e); }
 }, true);
 new MutationObserver(() => { try { if (!W.__rl_no571) decorate(); } catch (e) { fail('dec', e); } }).observe(document.documentElement, { childList: true, subtree: true });
})();
