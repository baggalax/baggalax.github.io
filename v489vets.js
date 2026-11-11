/* v489vets: VETERANS DAY - six service teams, the HONOR PACK and the VETERANS TOURNAMENT (Bagga Lax, the update after 1.2).
   Charlie (Nov 10 2026): "can you work on a team called navy veterans army veterans and airforce veterans?" then: ARMY, NAVY,
   AIR\u00a0FORCE, MARINES, COAST GUARD, SPACE FORCE; a VETERANS DAY HONOR PACK (10 dimes) that unlocks them + the tournament;
   a 2-day VETERANS TOURNAMENT with an HONOR MEDAL trophy; primary + alternate uniforms for every team, ARMY camo + combat
   helmet, AIR\u00a0FORCE fighter pilot (flight suit + visor helmet), SPACE FORCE astronaut suit (main) + animated GALAXY (alt).
   - Teams live in GH_REG (like the New Orleans Ghosts / Good Stick Co.): quick match only (team grid PRO tab), never
     seasons, world games, online or franchise. Playing AS them needs the pack; anyone can play AGAINST them while the
     event runs. Made-up players (generic names), ratings copied from the middle pro team; never card-pack players.
   - Crests are our own simple pixel art (star, anchor, wings, sword, lighthouse, rocket) on the game's shield shape.
     No official seal, emblem, logo or insignia is used or imitated.
   - Uniforms: UNI21 asks window.UNI21X (2 small hooks in uni21.js: nK/okK/styN/kitOf; 5 in items17.js: locker N/A teams,
     tile/toast names, where-to-get line, icon art). Special looks are per-pixel recolours through RL12.g27 (the same
     path the Ghosts' skeleton kit uses), so equipped store items (helmets, visors, gloves, sticks, cleats...) still draw
     ON TOP: the gear bake paints item pixels first and only asks g27 for the rest -> the ITEM WINS over the uniform helmet.
   - Time limit: the pack + tournament show for 96 h (the original 48 h plus 2 days in 1.3) from the first time this device opens the game with this file
     (rl_vets489start), or until VETS_END_ABS when that constant is set. After that they are hidden; teams, uniforms and
     the HONOR MEDAL already earned stay.
   New save keys: rl_vets489start, rl_vets489own, rl_vets489trophy, rl_vets489tour (bracket), rl_vets489pop (popup seen).
   Ids, other rl_* keys, __rl_* flags and the net protocol are unchanged.
   Kill switch: window.__rl_no489vets = true (set before this file loads). */
(function() {
 'use strict';
 const off = () => !!(window.__rl_no489vets || window.__rl_v124gb);
 if (off() || !window.V17 || !V17.BY || window.VETS489) return;

 // ---------- constants Charlie can change ----------
 const PACK_COST = 10;               // dimes
 const VETS_HOURS = 96;              // 1.3: the same per-device clock, plus 2 days (was 48 h)
 const VETS_END_ABS = null;          // e.g. new Date(2026, 10, 14, 23, 59, 59).getTime(): wins over the 48 h when set
 const PACK_KEY = 'vets489', TOKEN = 'vets489_teams', TROPHY = 'trophy_vets489';
 const EXTRAS = 'RWB STICKS, CHOPPER EXTRACT CELLY, FIREWORKS CELLY';

 const V = window.VETS489 = { log: [], err: [], ids: [], teams: {} };
 const note = s => { V.log.push(s); if (V.log.length > 40) V.log.shift(); };
 const fail = (w, e) => { V.err.push(w + ': ' + String(e && e.message || e)); try { console.warn('v489', w, e); } catch (x) {} };
 const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
 const dirty = () => { try { panelDirty(); } catch (e) {} };
 const ST = () => { try { return V17.ST(); } catch (e) { return null; } };
 const toast17 = (s, c) => { try { V17.toast(s, c || '#ffd23a'); } catch (e) { try { toast(s, c); } catch (x) {} } };

 // the old college team CAF is shown as BLACK FOREST by the real-name filter (N31.sub matches 'AIR FORCE' with a plain space);
 // our team writes AIR + no-break space + FORCE, which the filter leaves alone; the pixel font draws it as a space
 try { if (typeof FONT === 'object' && FONT && FONT[' '] && !FONT['\u00a0']) FONT['\u00a0'] = FONT[' ']; } catch (e) {}
 const AF = 'AIR\u00a0FORCE';

 // ---------- the clock ----------
 let start = null;
 try { start = LS.get('vets489start', null); if (!start) { start = Date.now(); LS.set('vets489start', start); } } catch (e) { start = Date.now(); }
 const endAt = () => window.__rl489endTest != null ? +window.__rl489endTest : VETS_END_ABS != null ? +VETS_END_ABS : (+start || Date.now()) + VETS_HOURS * 3600e3;
 const live = () => !off() && Date.now() < endAt();
 function leftTxt() {
  const ms = Math.max(0, endAt() - Date.now()), m = Math.floor(ms / 60000), d = Math.floor(m / 1440), h = Math.floor(m % 1440 / 60), mm = m % 60;
  return 'LEAVES IN ' + (d > 0 ? d + 'D ' + h + 'H' : h > 0 ? h + 'H ' + mm + 'M' : Math.max(1, mm) + 'M');
 }
 V.endAt = endAt; V.live = live; V.leftTxt = leftTxt;

 // ---------- ownership ----------
 const owns = () => {
  try { if (LS.get('vets489own', null)) return true; } catch (e) {}
  const S = ST();
  return !!(S && S.inv && S.inv[TOKEN] > 0);
 };
 V.owns = owns;

 // ---------- the six teams ----------
 // crest icons: 9 x 7 pixels on the game's shield. a = main icon colour, b = light, c = dark/blue, r = red/orange
 const CREST = {
  star: [ '....a....', '...aaa...', 'aaaaaaaaa', '.aaaaaaa.', '..aaaaa..', '.aaa.aaa.', '.aa...aa.' ],
  anchor: [ '...aaa...', '...a.a...', '..aaaaa..', '....a....', 'a...a...a', '.a..a..a.', '..aaaaa..' ],
  wings: [ 'b.......b', 'bb.....bb', 'bbb.a.bbb', '.bbbabbb.', '..bbbbb..', '...b.b...', '.........' ],
  sword: [ '....b....', '....b....', '....b....', '....b....', '.aaaaaaa.', '....a....', '...aaa...' ],
  light: [ '....c....', 'c..rrr..c', '.c.ccc.c.', '...rrr...', '...ccc...', '..rrrrr..', '.ccccccc.' ],
  rocket: [ '....b....', '...bbb...', '...bcb...', '...bbb...', '..bbbbb..', '..b.r.b..', '...rrr...' ]
 };
 const DEF = [
  { id: 'VTARM', abbr: 'ARM', name: 'ARMY', full: 'Army', c1: '#1b1b1b', c2: '#ffcc33', crest: 'star', cp: { a: '#ffcc33', b: '#fff2b0', c: '#000', r: '#c8102e' } },
  { id: 'VTNAV', abbr: 'NAV', name: 'NAVY', full: 'Navy', c1: '#14254d', c2: '#d4a537', crest: 'anchor', cp: { a: '#e3b542', b: '#ffffff', c: '#0a1430', r: '#c8102e' } },
  { id: 'VTAF', abbr: 'AF', name: 'AIR\u00a0FORCE', full: 'Air\u00a0Force', c1: '#1d4f9c', c2: '#c0c6cc', crest: 'wings', cp: { a: '#ffffff', b: '#d9dee3', c: '#0d2c5c', r: '#c8102e' } },
  { id: 'VTMAR', abbr: 'MAR', name: 'MARINES', full: 'Marines', c1: '#b3162a', c2: '#ffcc33', crest: 'sword', cp: { a: '#ffcc33', b: '#f4f4f4', c: '#3a0008', r: '#ffcc33' } },
  { id: 'VTCG', abbr: 'CG', name: 'COAST GUARD', full: 'Coast Guard', c1: '#f4f4f4', c2: '#e8641c', crest: 'light', cp: { a: '#e8641c', b: '#ffffff', c: '#1c3f8c', r: '#e8641c' } },
  { id: 'VTSF', abbr: 'SF', name: 'SPACE FORCE', full: 'Space Force', c1: '#0d1430', c2: '#c8ccd2', crest: 'rocket', cp: { a: '#c8ccd2', b: '#e8ecf0', c: '#5aa0ff', r: '#ff7a1a' } }
 ];
 const IDS = V.ids = DEF.map(d => d.id), isVet = id => !!id && IDS.indexOf(id) >= 0;
 V.isVet = isVet;
 // made-up, generic names (no real people)
 const FIRST = [ 'Mike', 'Dan', 'Ben', 'Sam', 'Tyler', 'Josh', 'Matt', 'Luke', 'Ryan', 'Nate', 'Eric', 'Owen', 'Jake', 'Cole', 'Drew', 'Evan', 'Grant', 'Sean', 'Troy', 'Wes',
  'Zach', 'Brett', 'Caleb', 'Derek', 'Gavin', 'Hank', 'Ian', 'Jared', 'Kurt', 'Levi', 'Marcus', 'Noah', 'Pete', 'Reid', 'Seth', 'Trent', 'Vic', 'Wade', 'Abe', 'Cody' ];
 const LAST = [ 'Hollis', 'Brandt', 'Mercer', 'Calloway', 'Dunmore', 'Ashby', 'Pruitt', 'Lowell', 'Strand', 'Kessler', 'Garrity', 'Holcomb', 'Whitlow', 'Ramsdell', 'Tolliver', 'Blevins',
  'Corbin', 'Danforth', 'Easley', 'Fenwick', 'Galloway', 'Hensley', 'Ingram', 'Jessup', 'Kincaid', 'Lattimer', 'Maddox', 'Nolan', 'Overby', 'Pickett', 'Quarles', 'Rowan', 'Sutter',
  'Thayer', 'Upton', 'Vance', 'Weller', 'Yancey', 'Abbott', 'Barlow', 'Crane', 'Dorsey', 'Ellery', 'Fairley', 'Gentry', 'Harlan', 'Iverson', 'Judd', 'Keane', 'Lyle', 'Marsh',
  'Norwood', 'Oakes', 'Pryor', 'Radford', 'Sloane', 'Tate', 'Varner', 'Whitcomb', 'Yates', 'Archer', 'Bishop', 'Carver', 'Dalton', 'Emery', 'Foley', 'Gaines', 'Hodges',
  'Irwin', 'Jett', 'Kemper', 'Landry', 'Mabry', 'Nash', 'Orton', 'Paxton', 'Redd', 'Sheehan', 'Talley', 'Vickers', 'Wilder', 'Ayers', 'Boone', 'Colby', 'Deane', 'Ewell',
  'Finch', 'Grady', 'Hayes', 'Ives', 'Jansen', 'Kirby', 'Lund', 'Morrow', 'Neal', 'Ogden', 'Parrish', 'Reese', 'Sims', 'Tanner', 'Voss', 'Wyatt', 'Banks', 'Cobb', 'Drury',
  'Eason', 'Ford', 'Gill', 'Hurst', 'Jolley', 'Kidd', 'Lacey', 'Monroe', 'Nix', 'Pope', 'Rhodes', 'Stokes', 'Toomey', 'Vail', 'Wren', 'Bly' ];
 const POS = [ 'A', 'A', 'A', 'A', 'A', 'A', 'M', 'M', 'M', 'M', 'M', 'FO', 'D', 'D', 'D', 'D', 'D', 'LSM', 'G', 'G' ];
 const NUMS = [ 1, 2, 7, 12, 19, 22, 3, 8, 11, 15, 27, 4, 33, 41, 44, 46, 52, 37, 30, 31 ];
 const teams = [];
 try {
  try { if (window.V27 && V27.pool) V27.pool(); } catch (e) { fail('pool', e); }  // card pool first: these players never come from packs
  const ovr = t => { const ps = (t.roster || []).map(id => PLAYERS[id]).filter(Boolean); return ps.length ? ps.reduce((a, p) => a + (p.ovr || 0), 0) / ps.length : 0; };
  const sorted = TEAMS.slice().sort((a, b) => ovr(a) - ovr(b)), mid = sorted[Math.floor(sorted.length / 2)];
  const byPos = {};
  for (const id of mid.roster || []) { const p = PLAYERS[id]; if (p) (byPos[p.pos] = byPos[p.pos] || []).push(p); }
  let fi = 0, li = 0;
  DEF.forEach((d, ti) => {
   if (GH_REG[d.id] || TEAMS.some(t => t.id === d.id)) return;
   const icon5 = [ '.###.', '#####', '.###.', '..#..', '..#..', '..#..', '.###.' ];
   const tm = { id: d.id, abbr: d.abbr, name: d.name, full: d.full, city: 'VETERANS DAY', lg: 'N/A', era: 'VETERANS DAY', c1: d.c1, c2: d.c2, icon: icon5,
    coach: '', coachNote: '', off: 4, def: 4, vets489: true, crest489: d.crest, cp489: d.cp, roster: [] };
   const used = {};
   tm.roster = POS.map((pos, i) => {
    const n = FIRST[(fi++ * 7 + ti * 3) % FIRST.length] + ' ' + LAST[(li++ * 11 + ti * 5) % LAST.length];
    const src = byPos[pos] && byPos[pos].length ? byPos[pos] : (byPos.M || Object.values(byPos)[0] || []);
    const j = used[pos] = (used[pos] || 0) + 1, sp = src[(j - 1) % Math.max(1, src.length)];
    const p = { id: d.id + '-' + i, n: n, pos: pos, r: {}, real: false, team: d.id, vets489: true, nocard486: true, wnum: NUMS[i], skin: [ 0, 1, 2, 3, 1, 4, 0, 2 ][(i + ti) % 8] };
    SKILLS.forEach(k => p.r[k] = sp && sp.r && sp.r[k] != null ? sp.r[k] : 70);
    p.ovr = typeof ovrOf === 'function' ? ovrOf(p) : 70;
    PLAYERS[p.id] = p;
    return p.id;
   });
   GH_REG[d.id] = tm;
   V.teams[d.id] = tm;
   teams.push(tm);
  });
  note('teams ' + teams.length);
 } catch (e) { fail('teams', e); }
 if (!teams.length) return;

 // ---------- the crest: the game's shield, our own 9x7 pixel icon ----------
 try {
  const B0 = window.badge;
  if (typeof B0 === 'function') {
   window.badge = function(team, x, y, sc) {
    if (off() || !team || !team.vets489 || !CREST[team.crest489]) return B0.apply(this, arguments);
    sc = sc || 1;
    const w = 13, h = 15, fillCol = team.c1;
    const edgeCol = cdist(team.c1, team.c2) < 60 ? lum(team.c1) > 128 ? '#111111' : '#ffffff' : team.c2;
    for (let r = 0; r < h; r++) {
     const inset = r < 9 ? 0 : r - 8;
     for (let c = inset; c < w - inset; c++) {
      const edge = r === 0 || c === inset || c === w - 1 - inset || r === h - 1 || r >= 9 && (c === inset + 1 || c === w - 2 - inset);
      g.fillStyle = edge ? edgeCol : fillCol;
      g.fillRect(Math.round(x) + c * sc, Math.round(y) + r * sc, sc, sc);
     }
    }
    const ic = CREST[team.crest489], cp = team.cp489 || {}, ix = Math.round(x) + 2 * sc, iy = Math.round(y) + 1 * sc;
    for (let r = 0; r < 7; r++) for (let c = 0; c < 9; c++) {
     const ch = ic[r][c];
     if (ch === '.') continue;
     g.fillStyle = cp[ch] || team.c2;
     g.fillRect(ix + c * sc, iy + r * sc, sc, sc);
    }
    if (sc >= 2) {
     const s = team.abbr || team.id, tc = textOn(team.c1);
     drawText(s, Math.round(x) + 6.5 * sc - textW(s, 1) / 2, iy + 8 * sc + 1, 1, tc);
    }
   };
  }
 } catch (e) { fail('badge', e); }

 // ---------- uniforms ----------
 const KITS = {
  VTARM: [ [ 'ARMY BLACK', { jersey: '#1b1b1b', trim: '#ffcc33', helm: '#1b1b1b', shorts: '#1b1b1b', acc: '#ffcc33' }, 'BLACK + GOLD' ],
   [ 'ARMY GOLD', { jersey: '#e8b923', trim: '#1b1b1b', helm: '#1b1b1b', shorts: '#1b1b1b', acc: '#1b1b1b' }, 'GOLD JERSEY, BLACK HELMET + SHORTS' ],
   [ 'CAMO', { jersey: '#4b5320', trim: '#2e3318', helm: '#4f5a2a', shorts: '#4b5320', acc: '#3d3324', g27: 'v489camo' }, 'WOODLAND CAMO UNIFORM + OLIVE COMBAT HELMET' ] ],
  VTNAV: [ [ 'NAVY BLUE', { jersey: '#14254d', trim: '#d4a537', helm: '#d4a537', shorts: '#14254d', acc: '#d4a537' }, 'NAVY BLUE + GOLD, GOLD HELMET' ],
   [ 'NAVY GOLD', { jersey: '#d4a537', trim: '#14254d', helm: '#14254d', shorts: '#14254d', acc: '#14254d' }, 'GOLD JERSEY, NAVY HELMET + SHORTS' ] ],
  VTAF: [ [ 'AIR\u00a0FORCE BLUE', { jersey: '#1d4f9c', trim: '#c0c6cc', helm: '#c0c6cc', shorts: '#1d4f9c', acc: '#c0c6cc' }, 'BLUE + SILVER, SILVER HELMET' ],
   [ 'AIR\u00a0FORCE SILVER', { jersey: '#c9cfd5', trim: '#1d4f9c', helm: '#1d4f9c', shorts: '#1d4f9c', acc: '#1d4f9c' }, 'SILVER JERSEY, BLUE HELMET + SHORTS' ],
   [ 'FIGHTER PILOT', { jersey: '#7b8660', trim: '#4a5436', helm: '#e4e6e8', shorts: '#7b8660', acc: '#4a5436', g27: 'v489pilot' }, 'FLIGHT SUIT + PILOT HELMET WITH DARK VISOR' ] ],
  VTMAR: [ [ 'MARINES SCARLET', { jersey: '#b3162a', trim: '#ffcc33', helm: '#b3162a', shorts: '#b3162a', acc: '#ffcc33' }, 'SCARLET + GOLD' ],
   [ 'MARINES GOLD', { jersey: '#f0bf2e', trim: '#b3162a', helm: '#b3162a', shorts: '#b3162a', acc: '#b3162a' }, 'GOLD JERSEY, SCARLET HELMET + SHORTS' ] ],
  VTCG: [ [ 'COAST GUARD WHITE', { jersey: '#f4f4f4', trim: '#e8641c', helm: '#1c3f8c', shorts: '#1c3f8c', acc: '#e8641c', g27: 'v489cg' }, 'WHITE WITH AN ORANGE + BLUE CHEST BAND, BLUE HELMET' ],
   [ 'COAST GUARD BLUE', { jersey: '#1c3f8c', trim: '#e8641c', helm: '#f4f4f4', shorts: '#1c3f8c', acc: '#e8641c' }, 'BLUE + ORANGE, WHITE HELMET' ] ],
  VTSF: [ [ 'ASTRONAUT', { jersey: '#e6e8ec', trim: '#9aa3ad', helm: '#f2f3f5', shorts: '#e6e8ec', acc: '#9aa3ad', g27: 'v489astro' }, 'WHITE SPACE SUIT + SPACE HELMET WITH A GOLD VISOR' ],
   [ 'GALAXY', { jersey: '#1b1040', trim: '#8a6cff', helm: '#0b0820', shorts: '#1b1040', acc: '#8a6cff', g27: 'v489gal' }, 'A MOVING GALAXY: DRIFTING, TWINKLING STARS HEAD TO TOE' ] ]
 };
 const GAL_PH = 6;
 const galPh = () => Math.floor((typeof performance !== 'undefined' ? performance.now() : Date.now()) / 170) % GAL_PH;
 function kitOf(tid, k) {
  const L = KITS[tid];
  if (!L) return null;
  const e = L[k | 0] || L[0], o = Object.assign({}, e[1]);
  if (o.g27 === 'v489gal') Object.defineProperty(o, 'g27', { enumerable: true, configurable: true, get: () => off() ? undefined : 'v489gal' + galPh() });
  else if (o.g27 && off()) delete o.g27;
  return o;
 }
 V.kitOf = kitOf;
 const uniItem = (tid, k) => 'uni21|' + tid + '|' + k;
 const PACK_UNIS = [];
 for (const tid of IDS) for (let k = 2; k < KITS[tid].length; k++) PACK_UNIS.push(uniItem(tid, k));
 window.UNI21X = {
  own: tid => !off() && isVet(tid) && !!GH_REG[tid],
  nK: tid => KITS[tid] ? KITS[tid].length : 2,
  styN: (tid, k) => KITS[tid] && KITS[tid][k | 0] ? KITS[tid][k | 0][0] : 'BASIC',
  kitOf: kitOf,
  lockerTeams: () => off() || !owns() ? [] : IDS.slice(),
  icon: (it, sil) => artFor(it, sil)
 };
 try {
  for (const id of PACK_UNIS) {
   const a = id.split('|'), tid = a[1], k = +a[2], t = V.teams[tid];
   V17.BY[id] = { id: id, n: (t.name + ' ' + KITS[tid][k][0]).toUpperCase(), sec: 'uni21', rar: 2, art: 'uni21', uni21: { tid: tid, k: k }, col: KITS[tid][k][1].jersey,
    vets489: 1, d: 'HONOR PACK. A ' + t.name + ' UNIFORM: ' + KITS[tid][k][2] + '. PICK IT BEFORE A GAME. LOOKS ONLY.' };
  }
 } catch (e) { fail('uniitems', e); }

 // per-pixel looks (RL12.g27): camo, pilot, astronaut, galaxy, coast guard band
 const ana = new Map;
 function analyse(rows, name) {
  const key = name + '|' + rows.length + '|' + (rows[0] || '').length;
  let a = ana.get(key);
  if (a) return a;
  let jTop = -1, faceTop = -1;
  for (let r = 0; r < rows.length; r++) if (jTop < 0 && /[Jj]/.test(rows[r])) jTop = r;
  if (jTop < 0) jTop = rows.length;
  for (let r = 0; r < jTop; r++) if (faceTop < 0 && /[SsZ]/.test(rows[r])) faceTop = r;
  a = { jTop: jTop, faceTop: faceTop };
  if (ana.size > 800) ana.clear();
  ana.set(key, a);
  return a;
 }
 const hsh = (x, y) => { let h = (x * 374761393 + y * 668265263) | 0; h = (h ^ h >>> 13) * 1274126177 | 0; return (h ^ h >>> 16) >>> 0; };
 const CAMO = [ '#4b5320', '#6b6b3a', '#3d3324', '#262b17' ], CAMO2 = [ '#3a4019', '#53532d', '#2e261b', '#1b1f10' ];
 const GAL = [ '#0b0820', '#160f3a', '#24145a', '#3a1f78', '#4a1f6e' ], GAL2 = [ '#07051a', '#100a2c', '#1a0e44', '#2a165a', '#36174f' ];
 const isSkin = ch => ch === 'S' || ch === 's' || ch === 'Z';
 const isJ = ch => ch === 'J' || ch === 'j';
 function galaxyAt(q, r, ph, dark) {
  const star = (x, y) => hsh(x - ph, y + (ph >> 1)) % 19 === 0;
  if (star(q, r)) return (q + r + ph) % 3 === 0 ? '#bfe8ff' : '#ffffff';
  if (star(q - 1, r) || star(q + 1, r) || star(q, r - 1) || star(q, r + 1)) return dark ? '#5a4cc8' : '#7a6cff';
  const n = hsh(q >> 2, r >> 2) % 5;
  return (dark ? GAL2 : GAL)[n];
 }
 function px489(kit, ch, q, r, rows, name) {
  const mode = kit.g27;
  if (!rows || ch === '.' || ch === 'X' || ch === 'M' || ch === 'm' || ch === 'n') return null;
  const a = analyse(rows, name), below = r >= a.jTop, face = !below && isSkin(ch);
  if (mode === 'v489camo') {
   if (isJ(ch)) { const i = hsh(q >> 1, r >> 1) % 4; return ch === 'J' ? CAMO[i] : CAMO2[i]; }
   if (ch === 'H') return hsh(q >> 1, r >> 1) % 3 === 0 ? '#3d4a1f' : '#55602c';
   if (ch === 'h') return '#3a4420';
   if (ch === 'w') return '#6f7a40';
   return null;
  }
  if (mode === 'v489pilot') {
   if (ch === 'J') return q === 0 ? '#7b8660' : '#7b8660';
   if (ch === 'j') return '#5c6646';
   if (below && isSkin(ch)) return ch === 's' ? '#5c6646' : '#7b8660';
   if (!below && a.faceTop >= 0 && r >= a.faceTop && (face || ch === 'C' || ch === 'c')) {
    if (r <= a.faceTop + 1) return ch === 'Z' || (q + r) % 5 === 0 ? '#6a8cb0' : r === a.faceTop ? '#2c3e52' : '#1a2430';
    if (ch === 'C' || ch === 'c') return ch === 'C' ? '#4a5058' : '#30353b';
   }
   if (ch === 'H') return '#e4e6e8';
   if (ch === 'h') return '#b5b9be';
   if (ch === 'w') return '#ffffff';
   return null;
  }
  if (mode === 'v489astro') {
   if (ch === 'J') return r === a.jTop + 2 && q % 3 === 0 ? '#5aa0ff' : '#e6e8ec';
   if (ch === 'j') return '#b8bec6';
   if (below && isSkin(ch)) return ch === 's' ? '#b8bec6' : '#e6e8ec';
   if (!below && a.faceTop >= 0 && r >= a.faceTop && (face || ch === 'C' || ch === 'c')) return ch === 'Z' || (q + r) % 6 === 0 ? '#ffe08a' : ch === 's' || ch === 'c' ? '#8a5c1a' : '#c8902e';
   if (ch === 'H') return '#f2f3f5';
   if (ch === 'h') return '#c9ced4';
   if (ch === 'w') return '#ffffff';
   if (ch === 'C') return '#dfe3e8';
   if (ch === 'c') return '#9aa3ad';
   return null;
  }
  if (typeof mode === 'string' && mode.indexOf('v489gal') === 0) {
   const ph = +mode.slice(7) || 0;
   if (isJ(ch) || below && isSkin(ch)) return galaxyAt(q, r, ph, ch === 'j' || ch === 's');
   if (ch === 'H' || ch === 'h') return galaxyAt(q + 3, r, ph, ch === 'h');
   if (ch === 'w') return '#bfe8ff';
   return null;
  }
  if (mode === 'v489cg') {
   if (isJ(ch) && r === a.jTop + 2) return ch === 'J' ? '#e8641c' : '#b44d14';
   if (isJ(ch) && r === a.jTop + 3) return ch === 'J' ? '#1c3f8c' : '#142e66';
   return null;
  }
  return null;
 }
 V.px = px489;
 try {
  if (typeof RL12 !== 'undefined') {
   const G0 = RL12.g27;
   RL12.g27 = function(kit, ch) {
    if (kit && typeof kit.g27 === 'string' && kit.g27.indexOf('v489') === 0) {
     if (off()) return null;
     try { return px489.apply(this, arguments); } catch (e) { return null; }
    }
    return typeof G0 === 'function' ? G0.apply(this, arguments) : null;
   };
  }
 } catch (e) { fail('g27', e); }

 // the user's kit and the CPU's kit in a game: re-read through our kitOf (uni21's own gameKits/heroKit call its kitOf,
 // which asks UNI21X first, so this only keeps the galaxy getter live)
 // ---------- art: pack, team token, honor medal ----------
 function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [ c, c.getContext('2d') ]; }
 function grid(x, rows, pal, ox, oy) { rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const col = pal[r[i]]; if (!col) continue; x.fillStyle = col; x.fillRect(ox + i, oy + j, 1, 1); } }); }
 const MEDAL = [
  '.......rrwwbb.......', '.......rrwwbb.......', '.......rrwwbb.......', '.......rrwwbb.......', '.......rrwwbb.......', '........rwwb........', '.........gg.........',
  '.......oGGGGo.......', '.....oGGGGGGGGo.....', '....oGGgggggGGGo....', '....oGgGGYYGGgGo....', '...oGGgGYYYYGgGGo...', '...oGGgGYYYYGgGGo...', '....oGgGGYYGGgGo....',
  '....oGGgggggGGGo....', '.....oGGGGGGGGo.....', '.......oGGGGo.......', '....................', '....................', '....................' ];
 const MPAL = { r: '#c8102e', w: '#ffffff', b: '#1c3f8c', g: '#c99400', G: '#ffcc33', Y: '#fff2a0', o: '#5a4200' };
 function artFor(it, sil) {
  try {
   const [c, x] = mk(20, 20);
   if (it.x489 === 'medal') {
    grid(x, MEDAL, sil ? { r: '#333', w: '#333', b: '#333', g: '#222', G: '#333', Y: '#444', o: '#111' } : MPAL, 0, 0);
    return c;
   }
   if (it.x489 === 'teams') {
    x.fillStyle = sil ? '#222' : '#0c1520';
    x.fillRect(0, 0, 20, 20);
    teams.slice(0, 6).forEach((t, i) => {
     const ox = 1 + i % 3 * 6, oy = 2 + Math.floor(i / 3) * 9;
     for (let r = 0; r < 7; r++) for (let q = 0; q < 5; q++) {
      const inset = r < 5 ? 0 : r - 4;
      if (q < inset || q > 4 - inset) continue;
      x.fillStyle = sil ? '#444' : (r === 0 || q === inset || q === 4 - inset || r === 6) ? t.c2 : t.c1;
      x.fillRect(ox + q, oy + r, 1, 1);
     }
     x.fillStyle = sil ? '#555' : (t.cp489 && t.cp489.a) || t.c2;
     x.fillRect(ox + 2, oy + 2, 1, 2);
    });
    return c;
   }
  } catch (e) { fail('art', e); }
  return null;
 }
 let packArt = null;
 function packUrl() {
  if (packArt) return packArt;
  const [c, x] = mk(36, 48);
  x.fillStyle = '#000'; x.fillRect(1, 1, 35, 47);
  x.fillStyle = '#1c3f8c'; x.fillRect(0, 0, 34, 46);
  for (let i = 0; i < 5; i++) { x.fillStyle = i % 2 ? '#ffffff' : '#c8102e'; x.fillRect(0, 22 + i * 5, 34, 5); }
  x.fillStyle = '#ffcc33'; x.fillRect(0, 0, 34, 2); x.fillRect(0, 44, 34, 2);
  const st = [ '....#....', '...###...', '#########', '.#######.', '..#####..', '.###.###.', '.##...##.' ];
  grid(x, st, { '#': '#ffcc33' }, 12, 5);
  const kk = g; g = x;
  try { drawText('HONOR', 17 - textW('HONOR', 1) / 2, 14, 1, '#ffffff'); } catch (e) {} finally { g = kk; }
  return packArt = c.toDataURL();
 }
 V.packUrl = packUrl;

 // ---------- items: team token + HONOR MEDAL trophy ----------
 try {
  V17.BY[TOKEN] = { id: TOKEN, n: 'SIX SERVICE TEAMS', sec: 'x489', rar: 2, art: 'x489', x489: 'teams', vets489: 1,
   d: 'PLAY AS ARMY, NAVY, AIR\u00a0FORCE, MARINES, COAST GUARD + SPACE FORCE IN QUICK MATCH. YOURS FOREVER.' };
  V17.BY[TROPHY] = { id: TROPHY, n: 'HONOR MEDAL', sec: 'trophy', rar: 2, art: 'x489', x489: 'medal', trophy: true, vets489: 1,
   d: 'WIN THE VETERANS TOURNAMENT (VETERANS DAY).' };
  const S = ST(), have = !!(S && S.trophies && S.trophies[TROPHY]);
  if (Array.isArray(V17.I) && (live() || have) && !V17.I.some(it => it.id === TROPHY)) V17.I.push(V17.BY[TROPHY]);
 } catch (e) { fail('items', e); }

 // ---------- the HONOR PACK (a bundle: the game's own bundle buy + reveal) ----------
 const packOk = () => !off() && !window.__rl_no2504 && !!V17.PACKS;
 try {
  if (packOk()) V17.PACKS[PACK_KEY] = { n: 'VETERANS DAY HONOR PACK', cost: PACK_COST, bundle: [ TOKEN ].concat(PACK_UNIS) };
 } catch (e) { fail('pack', e); }
 function markOwned() {
  try {
   const S = ST();
   if (S && S.inv && S.inv[TOKEN] > 0 && !LS.get('vets489own', null)) {
    LS.set('vets489own', Date.now());
    try { if (window.__rl491grant) window.__rl491grant(); } catch (e) { fail('491', e); }
    note('owned');
   }
  } catch (e) { fail('own', e); }
 }
 V.markOwned = markOwned;
 const contents = () => 'SIX SERVICE TEAMS (ARMY, NAVY, AIR\u00a0FORCE, MARINES, COAST GUARD, SPACE FORCE) + ALL THEIR UNIFORMS: ARMY CAMO, AIR\u00a0FORCE FIGHTER PILOT, SPACE FORCE ASTRONAUT + GALAXY + ' + EXTRAS + ' + THE VETERANS TOURNAMENT';
 function tileHtml() {
  if (!packOk() || !V17.PACKS[PACK_KEY]) return '';
  const own = owns();
  if (!live() && !own) return '';
  if (!live()) return '';
  const P = V17.PACKS[PACK_KEY], S = ST(), ok = !own && S && S.chinos >= P.cost;
  const minis = [ TOKEN ].concat(PACK_UNIS).map(id => '<span class="hwi16" style="border-color:#ffcc33"><img alt="" src="' + V17.iconUrl(id) + '"></span>').join('');
  return '<div class="hw16 b2504 vt489" id="vets489tile" style="border-color:#ffcc33;background:linear-gradient(90deg,rgba(200,16,46,.5),rgba(10,16,24,.92) 45%,rgba(28,63,140,.6));box-shadow:0 0 10px rgba(255,204,51,.5)">' +
   '<img class="hwp16" alt="" src="' + packUrl() + '" style="filter:drop-shadow(0 0 6px #ffcc33)"><div class="hwb16"><b style="color:#ffd84d">VETERANS DAY HONOR PACK <i class="lt489">' + leftTxt() + '</i></b>' +
   '<small style="color:#eef3ff">YOU GET: ' + contents() + '. LIMITED TIME.</small><div class="hwr16">' + minis + '</div></div>' +
   '<div class="hwc16"><button type="button" class="g" data-a="v17b2504" data-v="' + PACK_KEY + '" aria-label="SEE WHAT\'S INSIDE THE HONOR PACK">SEE WHAT\'S INSIDE</button>' +
   (own ? '<button type="button" class="y" data-a="vets489tour" aria-label="PLAY THE VETERANS TOURNAMENT">TOURNAMENT</button>'
    : '<button type="button" data-a="v17buy" data-v="' + PACK_KEY + '" class="' + (ok ? 'y' : 'd') + '" aria-label="BUY VETERANS DAY HONOR PACK"><span class="coin17"></span>' + P.cost + '</button>') + '</div></div>';
 }
 V.tileHtml = tileHtml;
 try {
  const css = '.vt489 .lt489{display:inline-block;margin-left:6px;padding:1px 4px;background:#c8102e;color:#fff;font-style:normal;font-size:9px;border:1px solid #ffcc33;vertical-align:middle}' +
   '.x489note{margin:6px 8px;padding:5px 7px;border:1px solid #ffcc33;background:rgba(28,63,140,.55);color:#fff;font-size:10px;line-height:1.35}' +
   '#vets489pop{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.66);padding:10px max(14px,env(safe-area-inset-right)) 10px max(14px,env(safe-area-inset-left));font-family:inherit}' +
   '#vets489pop .bx{max-width:420px;width:100%;background:linear-gradient(180deg,#1c3f8c,#0a1530 70%);border:3px solid #ffcc33;box-shadow:0 0 0 3px #000,0 0 18px rgba(255,204,51,.6);padding:12px 14px;text-align:center;color:#fff}' +
   '#vets489pop .st{height:8px;background:linear-gradient(90deg,#c8102e 0 33%,#fff 33% 66%,#c8102e 66%);margin:-12px -14px 10px}' +
   '#vets489pop b{display:block;font-size:17px;color:#ffd84d;letter-spacing:1px;margin-bottom:6px}#vets489pop p{margin:0 0 10px;font-size:11px;color:#dfe8ff}' +
   '#vets489pop button{font:inherit;font-size:13px;padding:8px 14px;margin:0 4px;border:2px solid #000;background:#ffd23a;color:#0b1a20;cursor:pointer}#vets489pop button.g{background:#c9d6d9}' +
   '.tr489 .bk{display:flex;gap:6px;justify-content:center;align-items:stretch;margin:4px 6px}.tr489 .col{display:flex;flex-direction:column;justify-content:space-around;gap:6px;min-width:110px}' +
   '.tr489 .col h4{margin:0;font-size:9px;color:#ffd84d;text-align:center}.tr489 .m{border:2px solid #34506a;background:#0e1a26;padding:2px 4px;font-size:10px}' +
   '.tr489 .m div{display:flex;align-items:center;gap:4px;padding:1px 0;color:#cfe}.tr489 .m div.w{color:#7dff7a}.tr489 .m div.l{color:#7f8c96;text-decoration:line-through}.tr489 .m div.me{font-weight:bold}' +
   '.tr489 .m img{width:13px;height:15px;image-rendering:pixelated}.tr489 .m i{margin-left:auto;font-style:normal;color:#ffd84d}' +
   '.tr489 .pick{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:6px 8px}.tr489 .pick button{display:flex;align-items:center;gap:6px;font:inherit;font-size:11px;padding:5px;border:2px solid #000;background:#1a2430;color:#fff}' +
   '.tr489 .pick img{width:26px;height:30px;image-rendering:pixelated}.tr489 .go{display:flex;justify-content:center;gap:8px;margin:8px}.tr489 .md{text-align:center;margin:6px}' +
   '.tr489 .md img{width:80px;height:80px;image-rendering:pixelated;filter:drop-shadow(0 0 10px #ffcc33)}.tr489 .md b{display:block;font-size:20px;color:#ffd84d}.tr489 .tg{color:#fff;background:#c8102e;padding:1px 5px;border:1px solid #ffcc33;font-size:9px}';
  const st = document.createElement('style');
  st.id = 'v489css';
  st.textContent = css;
  (document.head || document.documentElement).appendChild(st);
 } catch (e) { fail('css', e); }
 try {
  const R0 = PANEL_RENDER.shop17;
  if (typeof R0 === 'function') PANEL_RENDER.shop17 = function() {
   const h = R0.apply(this, arguments);
   if (off() || typeof h !== 'string') return h;
   try {
    const t = tileHtml(), mark = '<div class="scroll" id="shopList">';
    if (t && h.indexOf(mark) >= 0) return h.replace(mark, mark + t);
   } catch (e) { fail('shop', e); }
   return h;
  };
  const RB = PANEL_RENDER.bnd17;
  if (typeof RB === 'function') PANEL_RENDER.bnd17 = function() {
   const h = RB.apply(this, arguments);
   if (off() || typeof h !== 'string' || h.indexOf('VETERANS DAY HONOR PACK') < 0) return h;
   const add = '<div class="x489note">ALSO IN THE PACK: ' + EXTRAS + ' + THE VETERANS TOURNAMENT (WIN IT FOR THE HONOR MEDAL). THE SERVICE TEAMS + UNIFORMS STAY YOURS AFTER THE EVENT. ' + (live() ? leftTxt() : '') + '</div>';
   const i = h.indexOf('<div class="scroll"');
   return i >= 0 ? h.slice(0, i) + add + h.slice(i) : h + add;
  };
 } catch (e) { fail('render', e); }
 try {
  const BUY0 = PANEL_ACT.v17buy;
  if (typeof BUY0 === 'function') PANEL_ACT.v17buy = function(v) {
   if (v === PACK_KEY && (off() || !live())) { toast17('THE HONOR PACK IS GONE - THANKS FOR PLAYING', '#ff9a8a'); return; }
   const r = BUY0.apply(this, arguments);
   if (v === PACK_KEY) markOwned();
   return r;
  };
  const B25 = PANEL_ACT.v17b2504;
  if (typeof B25 === 'function') PANEL_ACT.v17b2504 = function(v) {
   if (v === PACK_KEY && (off() || !live())) return;
   return B25.apply(this, arguments);
  };
 } catch (e) { fail('buy', e); }

 // ---------- team grid: quick play only; locked until the pack ----------
 const gridOk = () => { try { return (screen === 'pickTeam' || screen === 'pickOpp') && menuSel && menuSel.mode !== 'season' && !(window.RLNET && RLNET.lobby); } catch (e) { return false; } };
 const showTeams = () => owns() || live();
 const lockedHere = () => { try { return screen === 'pickTeam' && menuSel.mode !== 'browse' && !owns(); } catch (e) { return false; } };
 let shown = false;
 try {
  if (window.V33 && V33.proTiles) {
   const P0 = V33.proTiles;
   V33.proTiles = function(opts) {
    const r = P0.apply(this, arguments);
    shown = false;
    if (off() || !gridOk() || !Array.isArray(r) || !showTeams()) return r;
    try {
     const o = opts || {};
     if (o.pool) return r;
     const add = teams.filter(t => t.id !== o.exclude && (!o.only || o.only.includes(t.id)));
     if (!add.length) return r;
     shown = true;
     return r.concat(add);
    } catch (e) { return r; }
   };
   const E0 = V33.proExtra;
   V33.proExtra = function(by, opts, wv) {
    const r = E0 ? E0.apply(this, arguments) : undefined;
    if (off() || !shown || wv) return r;
    try {
     const lk = lockedHere();
     for (const t of teams) {
      const s = (typeof uiSpecs !== 'undefined' ? uiSpecs : []).find(q => q && typeof q.key === 'string' && (q.key === 'TEAM-' + t.id || q.key.slice(-(t.id.length + 6)) === '|TEAM-' + t.id));
      if (!s) continue;
      // VETERANS DAY ribbon in the tile corner (red / white / blue)
      rect(s.x + s.w - 7, s.y + 2, 2, 5, '#c8102e');
      rect(s.x + s.w - 5, s.y + 2, 2, 5, '#ffffff');
      rect(s.x + s.w - 3, s.y + 2, 2, 5, '#1c3f8c');
      if (lk) {
       g.globalAlpha = .55;
       rect(s.x, s.y, s.w, s.h, '#05060a');
       g.globalAlpha = 1;
       const cx = Math.round(s.x + s.w / 2), ly = s.y + Math.max(2, Math.round(s.h / 2) - 5);
       rect(cx - 3, ly + 3, 7, 5, '#ffcc33');
       rect(cx - 2, ly, 5, 1, '#ffcc33');
       rect(cx - 2, ly, 1, 3, '#ffcc33');
       rect(cx + 2, ly, 1, 3, '#ffcc33');
      }
     }
     if (screen === 'pickTeam') text(lk ? 'VETERANS DAY TEAMS: IN THE HONOR PACK' : 'VETERANS DAY TEAMS', Math.round((72 + W - 8) / 2), by + 7, 1, '#ffd84d', 'center', '#000');
    } catch (e) { fail('tile', e); }
    return r;
   };
  }
 } catch (e) { fail('grid', e); }

 // tile names: tileNames32 folds every whitespace (the no-break space too) back to a plain space; keep ours
 try {
  const TN0 = window.tileNames32;
  if (typeof TN0 === 'function') window.tileNames32 = function(list) {
   const out = TN0.apply(this, arguments);
   try { if (!off() && out) for (const t of list || []) if (t && t.vets489 && out[t.id] != null) out[t.id] = String(out[t.id]).replace(/^AIR FORCE/, AF); } catch (e) {}
   return out;
  };
 } catch (e) { fail('tn32', e); }
 // a pick of a locked team: put everything back and say where the teams are
 let keep = null;
 function guard() {
  try {
   if (off() || typeof screen === 'undefined') return;
   if (screen === 'pickTeam' && !isVet(menuSel.team)) keep = { team: menuSel.team, t: LS.get('team', null), q: LS.get('qteam16', null), qp: LS.get('qplay26', null) };
   if (screen === 'pickOpp' && isVet(menuSel.team) && menuSel.mode !== 'browse' && !owns() && keep) {
    menuSel.team = keep.team;
    LS.set('team', keep.t);
    LS.set('qteam16', keep.q);
    if (keep.qp == null) { try { localStorage.removeItem('rl_qplay26'); } catch (e) {} } else LS.set('qplay26', keep.qp);
    screen = 'pickTeam';
    toast17('VETERANS DAY TEAMS: IN THE HONOR PACK (YARD SALE)', '#ffd84d');
   }
  } catch (e) {}
 }

 // ---------- day / night: the Ghosts' "night only" rule is theirs, not ours ----------
 const ghoOff = (home, away, fn, self, args) => {
  const G = window.GHO16;
  if (off() || !G || !isVet(home) || away === 'GHO' || typeof G.on !== 'function') return fn.apply(self, args);
  const on0 = G.on;
  G.on = () => false;
  try { return fn.apply(self, args); } finally { G.on = on0; }
 };
 try {
  const NG0 = window.newGame;
  if (typeof NG0 === 'function') window.newGame = function(user, opp, mode, userHome) {
   const home = userHome ? user : opp, away = userHome ? opp : user;
   return ghoOff(home, away, NG0, this, arguments);
  };
  const DM0 = window.drawMatchup;
  if (typeof DM0 === 'function') window.drawMatchup = function() {
   let home = null, away = null;
   try { home = menuSel.home ? menuSel.team : menuSel.opp; away = menuSel.home ? menuSel.opp : menuSel.team; } catch (e) {}
   return ghoOff(home, away, DM0, this, arguments);
  };
 } catch (e) { fail('night', e); }

 // ---------- the VETERANS TOURNAMENT ----------
 const TK = 'vets489tour';
 let TR = null;
 try { TR = LS.get(TK, null); } catch (e) {}
 const saveTR = () => { try { LS.set(TK, TR); } catch (e) {} };
 const tm = id => V.teams[id] || T(id);
 const strength = id => { try { const ps = (tm(id).roster || []).map(i => PLAYERS[i]).filter(Boolean); return ps.reduce((a, p) => a + (p.ovr || 70), 0) / Math.max(1, ps.length); } catch (e) { return 70; } };
 function sim(a, b) { const pa = .5 + (strength(a) - strength(b)) / 60; return Math.random() < Math.max(.2, Math.min(.8, pa)) ? a : b; }
 function newRun(team) {
  const others = IDS.filter(id => id !== team);
  for (let i = others.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = others[i]; others[i] = others[j]; others[j] = t; }
  // seeds 1..6, you are seed 3: ROUND 1 = 3 v 6 + 4 v 5, SEMIS = 1 v (4/5) + 2 v (3/6), FINAL
  const s = [ others[0], others[1], team, others[2], others[3], others[4] ];
  TR = { team: team, s: s, m: { r1a: [ s[2], s[5], null ], r1b: [ s[3], s[4], null ], sf1: [ s[0], null, null ], sf2: [ s[1], null, null ], f: [ null, null, null ] }, step: 'r1a', at: Date.now(), out: false, won: false };
  saveTR();
 }
 const myMatch = () => TR && !TR.out && !TR.won ? TR.m[TR.step] : null;
 function oppOf(m) { return m[0] === TR.team ? m[1] : m[0]; }
 function record(win) {
  if (!TR || !TR.step) return;
  const m = TR.m[TR.step], me = TR.team, op = oppOf(m), W1 = win ? me : op;
  m[2] = W1;
  if (TR.step === 'r1a') {
   TR.m.r1b[2] = sim(TR.m.r1b[0], TR.m.r1b[1]);
   TR.m.sf1[1] = TR.m.r1b[2];
   TR.m.sf2[1] = W1;
   TR.step = win ? 'sf2' : null;
  } else if (TR.step === 'sf2') {
   TR.m.sf1[2] = sim(TR.m.sf1[0], TR.m.sf1[1]);
   TR.m.f = [ TR.m.sf1[2], W1, null ];
   TR.step = win ? 'f' : null;
  } else if (TR.step === 'f') {
   TR.step = null;
   if (win) TR.won = true;
  }
  if (!win) TR.out = true;
  saveTR();
  if (TR.won) giveMedal();
 }
 function giveMedal() {
  try {
   const first = !(ST() && ST().trophies && ST().trophies[TROPHY]);
   if (Array.isArray(V17.I) && !V17.I.some(it => it.id === TROPHY)) V17.I.push(V17.BY[TROPHY]);
   V17.award(TROPHY);
   const t0 = LS.get('vets489trophy', null);
   LS.set('vets489trophy', { at: t0 && t0.at || Date.now(), team: TR.team, wins: (t0 && t0.wins || 0) + 1 });
   note('medal ' + (first ? 'new' : 'again'));
  } catch (e) { fail('medal', e); }
 }
 V.record = record; V.newRun = newRun; V.state = () => TR;
 let liveGame = null, back489 = false;
 function playStep() {
  const m = myMatch();
  if (!m || !live()) return;
  const op = oppOf(m);
  try {
   menuSel.team = TR.team;
   menuSel.opp = op;
   menuSel.home = true;
  } catch (e) {}
  try {
   newGame(TR.team, op, 'quick', true, { night: TR.step === 'f' });
   if (typeof game !== 'undefined' && game) { game.vets489 = { step: TR.step }; liveGame = game; }
  } catch (e) { fail('play', e); }
 }
 V.playStep = playStep;
 try {
  const GO0 = V17.gameOver;
  if (typeof GO0 === 'function') V17.gameOver = function(G, win) {
   const r = GO0.apply(this, arguments);
   try {
    if (!off() && G && G.vets489 && G === liveGame && TR && TR.step === G.vets489.step) { record(!!win); back489 = true; liveGame = null; }
   } catch (e) { fail('over', e); }
   return r;
  };
 } catch (e) { fail('gameover', e); }
 const STEPN = { r1a: 'ROUND 1', sf2: 'SEMIFINAL', f: 'FINAL' };
 function teamRow(id, m) {
  if (!id) return '<div><span style="opacity:.5">TBD</span></div>';
  const cls = m[2] ? m[2] === id ? 'w' : 'l' : '';
  return '<div class="' + cls + (TR && id === TR.team ? ' me' : '') + '"><img alt="" src="' + badgeUrl(tm(id)) + '">' + esc(tm(id).name) + (m[2] === id ? '<i>W</i>' : '') + '</div>';
 }
 const box = m => '<div class="m">' + teamRow(m[0], m) + teamRow(m[1], m) + '</div>';
 function renderTour() {
  const hd = (t, s) => '<div class="hd"><div><div class="tt">' + t + '</div><div class="st">' + s + '</div></div><div class="sp"></div><button type="button" class="g" data-a="vets489back" aria-label="BACK">BACK</button></div>';
  const tag = live() ? ' <span class="tg">' + leftTxt() + '</span>' : '';
  if (off()) return hd('VETERANS TOURNAMENT', '');
  if (!live() && !(TR && TR.won)) return hd('VETERANS TOURNAMENT', 'THE VETERANS DAY EVENT IS OVER - THANKS FOR PLAYING. YOUR TEAMS, UNIFORMS + MEDALS STAY YOURS.');
  if (!owns()) return hd('VETERANS TOURNAMENT' + tag, 'LOCKED - GET THE VETERANS DAY HONOR PACK IN THE YARD SALE') + '<div class="tr489"><div class="go"><button type="button" class="y" data-a="vets489shop" aria-label="GO TO THE HONOR PACK">SEE THE HONOR PACK</button></div></div>';
  if (TR && TR.won) {
   return hd('VETERANS TOURNAMENT' + tag, 'CHAMPIONS!') + '<div class="tr489"><div class="md"><img alt="" src="' + V17.iconUrl(TROPHY) + '"><b>HONOR MEDAL</b><div>' + esc(tm(TR.team).name) + ' WON THE VETERANS TOURNAMENT - THE HONOR MEDAL IS IN YOUR TROPHY CASE</div></div>' +
    bracket() + (live() ? '<div class="go"><button type="button" class="y" data-a="vets489new" aria-label="PLAY AGAIN">PLAY AGAIN</button></div>' : '') + '</div>';
  }
  if (!TR || !TR.team) {
   const pick = teams.map(t => '<button type="button" data-a="vets489pick" data-v="' + t.id + '" aria-label="PLAY AS ' + esc(t.name) + '"><img alt="" src="' + badgeUrl(t) + '">' + esc(t.name) + '</button>').join('');
   return hd('VETERANS TOURNAMENT' + tag, 'PICK YOUR SERVICE TEAM - WIN 3 GAMES (ROUND 1, SEMIFINAL, FINAL) FOR THE HONOR MEDAL') + '<div class="tr489"><div class="pick">' + pick + '</div></div>';
  }
  const m = myMatch();
  const btns = TR.out ? '<div class="go"><span style="align-self:center;color:#ff9a8a">KNOCKED OUT</span><button type="button" class="y" data-a="vets489new" aria-label="TRY AGAIN">TRY AGAIN</button></div>'
   : m ? '<div class="go"><button type="button" class="y" data-a="vets489play" aria-label="PLAY ' + STEPN[TR.step] + '">PLAY ' + STEPN[TR.step] + ' VS ' + esc(tm(oppOf(m)).name) + '</button><button type="button" class="d" data-a="vets489new" aria-label="NEW TEAM">NEW TEAM</button></div>' : '';
  return hd('VETERANS TOURNAMENT' + tag, esc(tm(TR.team).name) + (TR.out ? ' - YOUR RUN IS OVER' : ' - NEXT: ' + STEPN[TR.step])) + '<div class="tr489">' + bracket() + btns + '</div>';
 }
 function bracket() {
  const M = TR.m;
  return '<div class="bk"><div class="col"><h4>ROUND 1</h4>' + box(M.r1a) + box(M.r1b) + '</div><div class="col"><h4>SEMIFINALS</h4>' + box(M.sf1) + box(M.sf2) + '</div><div class="col"><h4>FINAL</h4>' + box(M.f) + '</div></div>';
 }
 let tourBack = 'menu';
 function openTour() {
  if (off()) return;
  try { if (screen !== 'vets489') tourBack = /17$/.test(screen) ? 'shop17' : 'menu'; } catch (e) {}
  screen = 'vets489';
  dirty();
 }
 V.openTour = openTour;
 try {
  PANEL_RENDER.vets489 = renderTour;
  if (Array.isArray(PANEL_SCREENS) && PANEL_SCREENS.indexOf('vets489') < 0) PANEL_SCREENS.push('vets489');
  Object.assign(PANEL_ACT, {
   vets489tour() { openTour(); },
   vets489back() { screen = tourBack === 'shop17' ? 'shop17' : 'menu'; },
   vets489shop() { try { V17.openShop(); } catch (e) { screen = 'shop17'; } },
   vets489pick(v) { if (isVet(v) && owns() && live()) newRun(v); },
   vets489new() { TR = null; saveTR(); },
   vets489play() { playStep(); }
  });
 } catch (e) { fail('panel', e); }
 // PLAY screen: a third big button while the event runs
 try {
  const MB0 = window.menuBars;
  if (typeof MB0 === 'function') window.menuBars = function() {
   const rows = MB0.apply(this, arguments);
   try {
    if (off() || !live() || !Array.isArray(rows) || !window.M37 || M37.page !== 'play' || !window.V469 || V469.page !== 'pick') return rows;
    if (!rows.some(r => r && r[0] && r[0].big469) || rows.some(r => r && r[0] && r[0].v489)) return rows;
    const i = rows.findIndex(r => r && r[0] && r[0].m37 === 'back');
    const row = [ { label: 'VETERANS TOURNAMENT', fn: openTour, bg: '#5aa0ff', m37: 1, h37: 28, t469: 'pick', big469: 1, v489: 1 } ];
    if (i >= 0) rows.splice(i, 0, row); else rows.push(row);
   } catch (e) { fail('bars', e); }
   return rows;
  };
  const MBar0 = window.menuBar;
  if (typeof MBar0 === 'function') window.menuBar = function(b, liveB) {
   const r = MBar0.apply(this, arguments);
   try {
    if (!off() && b && b.v489) {
     const s = owns() ? leftTxt() : 'LOCKED - ' + leftTxt();
     const tw = textW(s, 1) + 6;
     rect(b.x + b.w - tw - 3, b.y + 2, tw, 9, '#c8102e');
     text(s, b.x + b.w - tw / 2 - 3, b.y + 4, 1, '#ffffff', 'center');
    }
   } catch (e) { fail('bar', e); }
   return r;
  };
 } catch (e) { fail('menu', e); }

 // ---------- the one-time hello ----------
 function popup() {
  try {
   if (off() || !live() || LS.get('vets489pop', null) || document.getElementById('vets489pop')) return false;
   if (typeof screen === 'undefined' || screen !== 'menu') return false;
   // merge fix: main menu only - never over a pre-game entrance, a match, or a sub-menu
   try { if (typeof game !== 'undefined' && game) return false; } catch (e) {}
   try { if (window.M37 && M37.page && M37.page !== 'home') return false; } catch (e) {}
   try { if (window.V490 && V490.active && V490.active()) return false; } catch (e) {}
   if (window.__rl_safeTest == null && document.querySelector('.intro,#intro30')) return false;
   LS.set('vets489pop', Date.now());
   const d = document.createElement('div');
   d.id = 'vets489pop';
   d.setAttribute('role', 'dialog');
   d.setAttribute('aria-label', 'VETERANS DAY TOURNAMENT');
   d.innerHTML = '<div class="bx"><div class="st"></div><img alt="" src="' + packUrl() + '" style="width:54px;height:72px;image-rendering:pixelated"><b>VETERANS DAY TOURNAMENT IS HERE - LEAVING IN 2 DAYS</b>' +
    '<p>SIX SERVICE TEAMS - ARMY, NAVY, AIR\u00a0FORCE, MARINES, COAST GUARD + SPACE FORCE. GET THE HONOR PACK, WIN THE TOURNAMENT, EARN THE HONOR MEDAL. ' + leftTxt() + '.</p>' +
    '<button type="button" data-p="shop">SEE THE HONOR PACK</button><button type="button" class="g" data-p="ok">OK</button></div>';
   d.addEventListener('click', ev => {
    const b = ev.target.closest && ev.target.closest('button');
    if (!b && ev.target !== d) return;
    ev.preventDefault(); ev.stopPropagation();
    d.remove();
    if (b && b.dataset.p === 'shop') { try { V17.openShop(); } catch (e) { screen = 'shop17'; } }
   });
   document.body.appendChild(d);
   return true;
  } catch (e) { fail('pop', e); return false; }
 }
 V.popup = popup;
 // ---------- one light loop: locked-pick guard, owned flag, back to the bracket after a tournament game, the hello ----------
 let popT = 0;
 (function loop() {
  try {
   if (!off()) {
    guard();
    markOwned();
    if (back489 && typeof screen !== 'undefined' && screen === 'menu') { back489 = false; tourBack = 'menu'; screen = 'vets489'; dirty(); }
    if (!popT) popT = Date.now();
    if (Date.now() - popT > 1500) popup();
    // merge fix: a hello still up when the menu is left (a match / entrance starting) goes away and comes back next time on the menu
    { const d = document.getElementById('vets489pop'); let away = false; try { away = screen !== 'menu' || (typeof game !== 'undefined' && !!game); } catch (e) {}
      if (d && away) { d.remove(); LS.set('vets489pop', null); } }
    if (screen === 'vets489' && live() && (Date.now() / 1000 | 0) % 30 === 0) dirty();
   } else {
    const d = document.getElementById('vets489pop');
    if (d) d.remove();
   }
  } catch (e) {}
  requestAnimationFrame(loop);
 })();
 note('ready');
})();
