/* v572na.js - EDIT NAMES: every N/A team in the N/A tab, card teams in PRO / COLLEGE (Bagga Lax 1.4, Nov 2026).
 * Kill switch: window.__rl_no572na = true.
 * Charlie: the N/A tab only showed the Ghosts roster + legacy cards. Show ALL N/A teams there (and any N/A team added
 * later), each with name + skin editing, the same way the other tabs list teams. Legacy cards = their own "team" in N/A.
 * Your card teams show under PRO (BLL tab), college card teams under COLLEGE.
 * - N/A tab: a team grid built from GH_REG (so a new N/A team shows up by itself) + LEGACY CARDS.
 * - Tap a team: its players with a name box, a skin square (v571) and RESET SKIN TONES.
 * - Saving a name: base / college / legacy / Ghosts players use the normal names save (rl names key, N31);
 *   other N/A and card players use rl_na572 {pid: name}, put back on every start (and when a team loads later).
 * No ids, net or old keys changed. */
(function () {
 'use strict';
 const W = window;
 if (W.__rl_v572_loaded || W.__rl_no572na || W.__rl_v124gb) return;
 W.__rl_v572_loaded = 1;
 const V = W.V572NA = { err: [], n: 0 };
 const fail = (w, e) => { if (V.err.length < 20) V.err.push(w + ': ' + String(e && e.message || e)); };
 const lsGet = (k, d) => { try { return LS.get(k, d); } catch (e) { return d; } };
 const lsSet = (k, v) => { try { LS.set(k, v); } catch (e) {} };
 let NAMES = lsGet('na572', null);
 if (!NAMES || typeof NAMES !== 'object' || Array.isArray(NAMES)) NAMES = {};
 const P = id => { try { return PP(id); } catch (e) { return null; } };
 // put saved names back (teams load at different times, so keep checking)
 function applyNames() {
  for (const pid in NAMES) { const p = P(pid); if (p && NAMES[pid] && p.n !== NAMES[pid]) { if (p.n572 == null) p.n572 = p.n; p.n = NAMES[pid]; V.n++; } }
 }
 applyNames();
 setInterval(() => { try { if (!W.__rl_no572na) applyNames(); } catch (e) { fail('apply', e); } }, 1500);

 const N = () => W.N31 && N31.on ? N31 : null;
 const st = () => { try { return W.ED31 && ED31.state(); } catch (e) { return null; } };
 const okName = s => /^[A-Za-z0-9][A-Za-z0-9 .'\-]{0,17}$/.test(s);
 // collab teams (Good Stick Co. and any later lg: 'COLLAB' team) can't be edited at all: names, team name or skin
 const isCollabT = t => !!t && (t.lg === 'COLLAB' || t.era === 'COLLAB');
 const isCollabP = p => { try { return !!p && isCollabT(T(p.team)); } catch (e) { return false; } };
 V.isCollabP = isCollabP;
 const filt = s => { try { return W.ED31 && typeof ED31.nameProblem === 'function' ? ED31.nameProblem(s) : ''; } catch (e) { return ''; } };
 const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
 const tm = id => { try { return T(id); } catch (e) { return null; } };
 const badge = t => { try { return badgeUrl(t); } catch (e) { return ''; } };
 function naTeams() {
  const out = [];
  try { for (const id in (typeof GH_REG !== 'undefined' ? GH_REG : {})) { const t = tm(id); if (t && t.id === id && !isCollabT(t) && (t.roster || []).length) out.push({ id: id, name: t.name || id, t: t, roster: t.roster.slice() }); } } catch (e) { fail('na', e); }
  const n = N();
  const leg = n ? (n.DEF.legOrder || []).filter(id => /^LEG-/.test(id) && P(id)) : [];
  if (leg.length) out.push({ id: '__LEG', name: 'LEGACY CARDS', t: null, roster: leg });
  return out;
 }
 function cardTeams(kind) {
  try { return W.V33 && V33.list ? V33.list(kind).map(c => { const t = tm(c.id); return t && t.id === c.id ? { id: c.id, name: t.name || c.name || c.id, t: t, roster: (t.roster || []).slice() } : null; }).filter(Boolean) : []; } catch (e) { fail('ct', e); return []; }
 }
 V.naTeams = naTeams; V.cardTeams = cardTeams;
 function saveName(pid, nm) {
  const p = P(pid);
  if (!p) return 'NO PLAYER';
  if (isCollabP(p)) return 'COLLAB PLAYERS CAN\'T BE EDITED';
  nm = String(nm || '').trim();
  const n = N(), s = st();
  const orig = n && n.DEF.players[pid] ? n.DEF.players[pid].n : n && pid in n.DEF.legacy ? n.DEF.legacy[pid] : (p.n572 != null ? p.n572 : p.n);
  if (nm && !okName(nm)) return 'LETTERS, NUMBERS, SPACE . \' - (UP TO 18)';
  if (nm) { const why = filt(nm); if (why) return why; }
  if (n && s && s.W && (n.DEF.players[pid] || pid in n.DEF.legacy)) {
   const Wd = s.W;
   if (n.DEF.players[pid]) { Wd.p = Wd.p || {}; const e = Wd.p[pid] && typeof Wd.p[pid] === 'object' ? Wd.p[pid] : {}; if (!nm || nm === orig) delete e.n; else e.n = nm; if (Object.keys(e).length) Wd.p[pid] = e; else delete Wd.p[pid]; }
   else { Wd.g = Wd.g || {}; if (!nm || nm === orig) delete Wd.g[pid]; else Wd.g[pid] = nm; }
   try { localStorage.setItem(n.KEY, JSON.stringify(Wd)); } catch (e) { return 'COULD NOT SAVE'; }
  } else {
   if (!nm || nm === orig) delete NAMES[pid]; else NAMES[pid] = nm;
   lsSet('na572', NAMES);
  }
  if (p.n572 == null) p.n572 = p.n;
  p.n = nm || orig;
  return '';
 }
 V.saveName = saveName;
 // ---------- UI inside the EDIT NAMES overlay ----------
 let open = null; // team being edited in our view
 const skinCol = s => { try { return (RL12.SKIN[s] || RL12.SKIN[0]).base; } catch (e) { return '#c98'; } };
 const skinOfP = p => { try { return skinOf(p); } catch (e) { return p.skin | 0; } };
 function tabsRow(root) { return [ ...root.querySelectorAll('.row') ].find(r => /^LEAGUES/.test((r.querySelector('button') || {}).textContent || '')); }
 function teamBtn(t) {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'tm'; b.setAttribute('data-na572', t.id); b.setAttribute('aria-label', 'TEAM ' + t.name);
  b.innerHTML = (t.t ? '<img alt="" src="' + badge(t.t) + '">' : '') + '<span>' + esc(String(t.name).toUpperCase()) + '</span>';
  return b;
 }
 let list = []; // teams shown in the current grid, by id
 function drawGrid(root, after) {
  const box = document.createElement('div');
  box.className = 'scroll grid'; box.id = 'na572Grid';
  list = naTeams();
  list.forEach(t => box.appendChild(teamBtn(t)));
  after.after(box);
  return box;
 }
 function css() {
  if (document.getElementById('na572css')) return;
  const s = document.createElement('style');
  s.id = 'na572css';
  s.textContent = '#ed31 #na572Team .sk571{display:inline-block;width:22px;height:22px;border:2px solid #000;box-shadow:inset 0 0 0 1px rgba(255,255,255,.5);margin-left:6px;flex:none;cursor:pointer}';
  document.head.appendChild(s);
 }
 function drawTeam(root, after, t) {
  css();
  const box = document.createElement('div');
  box.className = 'scroll'; box.id = 'na572Team';
  const hd = document.createElement('div');
  hd.className = 'row';
  hd.innerHTML = (t.t ? '<img alt="" src="' + badge(t.t) + '" style="width:18px;height:21px;image-rendering:pixelated">' : '') + '<b>' + esc(String(t.name).toUpperCase()) + '</b><span style="flex:1"></span>' +
   '<button type="button" class="g" data-na572rs="1" aria-label="RESET SKIN TONES">RESET SKIN TONES</button><button type="button" class="g" data-na572back="1" aria-label="BACK">BACK</button>';
  box.appendChild(hd);
  const note = document.createElement('div');
  note.style.cssText = 'font-size:10px;opacity:.8;margin:2px 4px';
  note.textContent = 'TYPE A NAME AND TAP SAVE. TAP THE COLOR SQUARE TO CHANGE SKIN TONE.';
  box.appendChild(note);
  for (const pid of t.roster) {
   const p = P(pid);
   if (!p || isCollabP(p)) continue;
   const r = document.createElement('div');
   r.className = 'ef';
   r.innerHTML = '<span style="width:30px;color:#9fb">' + esc(p.pos || '') + '</span><input class="nm" maxlength="18" autocomplete="off" autocorrect="off" spellcheck="false" aria-label="NAME ' + esc(p.n) + '" value="' + esc(p.n) + '">' +
    '<button type="button" data-na572save="' + esc(pid) + '" aria-label="SAVE NAME">SAVE</button>' +
    '<span class="sk571" data-sk571="' + esc(pid) + '" role="button" aria-label="SKIN TONE - TAP TO CHANGE" style="background:' + skinCol(skinOfP(p)) + '"></span><span class="m" style="font-size:10px;color:#ff9a8a"></span>';
   box.appendChild(r);
  }
  after.after(box);
 }
 function decorate() {
  const root = document.getElementById('ed31');
  if (!root || !root.classList.contains('open')) { open = null; return; }
  const s = st();
  if (!s || !s.view || s.view.s !== 'list') return;
  const tabs = tabsRow(root);
  if (!tabs) return;
  // N/A tab label = number of N/A teams
  const naBtn = [ ...tabs.querySelectorAll('button') ].find(b => /^N\/A \(/.test(b.textContent));
  if (naBtn && !naBtn.__na572) { naBtn.__na572 = 1; naBtn.textContent = 'N/A (' + naTeams().length + ')'; }
  if (s.view.grp === 'LEGACY') {
   if (root.querySelector('#na572Grid,#na572Team')) return;
   let x = tabs.nextElementSibling;
   while (x) { const nx = x.nextElementSibling; if (!x.classList.contains('msg')) x.remove(); x = nx; }
   const t = open && naTeams().find(q => q.id === open);
   if (t) drawTeam(root, tabs, t); else drawGrid(root, tabs);
   return;
  }
  open = null;
  // card teams in PRO (BLL) and COLLEGE
  const grid = document.getElementById('ed31Grid');
  if (!grid || grid.__na572) return;
  grid.__na572 = 1;
  const kind = s.view.grp === 'RLL' ? 'pro' : s.view.grp === 'COLLEGE' ? 'col' : null;
  if (!kind) return;
  const cts = cardTeams(kind);
  if (!cts.length) return;
  const lab = document.createElement('div');
  lab.style.cssText = 'width:100%;font-size:10px;color:#ffd84d;margin-top:4px';
  lab.textContent = kind === 'pro' ? 'YOUR CARD TEAMS' : 'YOUR COLLEGE CARD TEAMS';
  grid.appendChild(lab);
  cts.forEach(t => grid.appendChild(teamBtn(t)));
 }
 function teamById(id) { return naTeams().concat(cardTeams('pro'), cardTeams('col')).find(t => t.id === id); }
 function showTeam(id) {
  const root = document.getElementById('ed31'); const tabs = root && tabsRow(root);
  const t = teamById(id);
  if (!root || !tabs || !t) return;
  root.querySelectorAll('#na572Grid,#na572Team,#ed31Grid').forEach(e => e.remove());
  open = t.id;
  drawTeam(root, tabs, t);
 }
 document.addEventListener('click', ev => {
  try {
   if (W.__rl_no572na) return;
   const t = ev.target, c = sel => t && t.closest && t.closest(sel);
   let b;
   if ((b = c('[data-na572]'))) { ev.preventDefault(); ev.stopPropagation(); showTeam(b.getAttribute('data-na572')); return; }
   if ((b = c('[data-na572back]'))) {
    ev.preventDefault(); ev.stopPropagation();
    const root = document.getElementById('ed31'), tabs = root && tabsRow(root), s = st();
    open = null;
    root.querySelectorAll('#na572Team').forEach(e => e.remove());
    if (s && s.view.grp === 'LEGACY') drawGrid(root, tabs);
    else { const btn = [ ...tabs.querySelectorAll('button') ].find(x => x.classList.contains('on')); if (btn) btn.click(); }
    return;
   }
   if ((b = c('[data-na572save]'))) {
    ev.preventDefault(); ev.stopPropagation();
    const row = b.closest('.ef'), inp = row.querySelector('input'), m = row.querySelector('.m');
    const why = saveName(b.getAttribute('data-na572save'), inp.value);
    m.style.color = why ? '#ff9a8a' : '#7dff7a';
    m.textContent = why || 'SAVED';
    if (!why) inp.value = P(b.getAttribute('data-na572save')).n;
    return;
   }
   if ((b = c('[data-na572rs]'))) {
    ev.preventDefault(); ev.stopPropagation();
    const tt = open && teamById(open);
    if (!tt) return;
    for (const pid of tt.roster) { const p = P(pid); if (!p || isCollabP(p)) continue; try { delete SKINS[pid]; } catch (e) {} p.skin = p.gho16 ? 6 : pid === 'LEG-2' ? 4 : (() => { try { return defaultSkin(p); } catch (e) { return 0; } })(); }
    try { LS.set('skins', SKINS); } catch (e) {}
    document.querySelectorAll('#na572Team [data-sk571]').forEach(e => { const p = P(e.getAttribute('data-sk571')); if (p) e.style.background = skinCol(skinOfP(p)); });
    b.textContent = 'SKIN TONES RESET';
   }
  } catch (e) { fail('click', e); }
 }, true);
 new MutationObserver(() => { try { if (!W.__rl_no572na) decorate(); } catch (e) { fail('dec', e); } }).observe(document.documentElement, { childList: true, subtree: true });
})();
