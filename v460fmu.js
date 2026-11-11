'use strict';
// v460fmu: FRANCHISE MODE screens (start, new coach, team pick, season hub, end of season + job offers, recruiting,
// pro offseason in 3 steps, coach resume) + the FRANCHISE MODE button on the play menu + the in-game final screen.
// Kill switch: window.__rl_no460fm = true. Storage: see v460fm.js (rl_fm460, rl_fm460fr).
(function () {
 const FM = window.FM460;
 if (!FM || !FM.on || FM.OFF()) return;
 const E = s => (typeof esc === 'function' ? esc(s) : String(s));
 const P = id => (typeof PP === 'function' ? PP(id) : PLAYERS[id]);
 const LVN = FM.LVN;
 const U = { v: null, f: null, msg: null, ok: null, tab: 'st', conf: null, pickLvl: 'col', pick: null };
 const DCOL = [ '#7dff7a', '#8fe3f0', '#ffd23a', '#ffb14d', '#ff8a5a', '#ff5a4a' ];
 const money = k => window.FR458 ? FR458.money(k) : '$' + k + 'K';

 try {
  const st = document.createElement('style');
  st.id = 'fm460css';
  st.textContent = [
   '#panel .fm6sub{font-size:11px;color:#e8f4f6;line-height:1.35}#panel .fm6sub b{color:#ffe14d}',
   '#panel .fm6main{font-size:14px!important;padding:9px 16px!important;min-height:38px!important}',
   '#panel .fm6cont{display:flex;align-items:center;gap:12px;padding:10px 12px;border:2px solid #ffd23a;border-radius:5px;background:linear-gradient(#2a2410,#14120a);box-shadow:0 3px 0 #000}',
   '#panel .fm6cont img{width:40px;height:46px;image-rendering:pixelated}',
   '#panel .fm6cont .t{font-size:16px;color:#ffe14d;line-height:1.15}#panel .fm6cont .d{font-size:10px;color:#cfe;margin-top:2px}',
   '#panel .fm6stars{color:#ffe14d;letter-spacing:2px;font-size:15px}#panel .fm6stars i{color:#2e3d48;font-style:normal}',
   '#panel .fm6choices{display:flex;gap:8px}',
   '#panel .fm6ch{flex:1 1 0;display:flex;flex-direction:column;align-items:flex-start;gap:3px;text-align:left;padding:8px 10px!important;min-height:58px!important;background:#14222c!important;color:#e8f4f6!important;border:2px solid #22313d!important}',
   '#panel .fm6ch b{font-size:14px;color:#fff}#panel .fm6ch small{font-size:9px;color:#8fe3f0;line-height:1.25;text-transform:uppercase}',
   '#panel .fm6ch.on{border-color:#ffe14d!important;background:#3a3210!important;outline:none}#panel .fm6ch.on b{color:#ffe14d}',
   '#panel .fm6form{display:flex;flex-direction:column;gap:7px;min-height:0;overflow-y:auto}',
   '#panel .fm6form .lab{flex:0 0 96px;font-size:10px;color:#7f9aa6}',
   '#panel .fm6form .row button{padding:5px 8px;min-height:26px}',
   '#panel .fm6grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(132px,1fr));gap:5px;padding:5px;align-content:start}',
   '#panel .fm6tm{display:flex!important;align-items:center;gap:6px;text-align:left;padding:4px 6px!important;min-height:36px!important;background:#14222c!important;color:#e8f4f6!important;box-shadow:0 2px 0 #000}',
   '#panel .fm6tm img{width:20px;height:24px;image-rendering:pixelated;flex:0 0 auto}#panel .fm6tm span{display:flex;flex-direction:column;min-width:0}#panel .fm6tm b{font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:96px}#panel .fm6tm small{font-size:9px;color:#8fe3f0}',
   '#panel .fm6tm.on{background:#5a4a12!important;outline:2px solid #ffe14d}',
   '#panel .fm6cols{display:flex;gap:8px;flex:1 1 auto;min-height:0}#panel .fm6cols>div{display:flex;flex-direction:column;gap:4px;min-height:0;min-width:0}',
   '#panel .fm6res{padding:4px 8px;border-radius:3px;background:#14222c;font-size:10px;color:#e8f4f6}#panel .fm6res.w{background:#1f5a2a}#panel .fm6res.l{background:#5a1f1f}',
   '#panel .fm6tag{display:inline-block;margin-left:4px;padding:0 3px;border-radius:2px;font-size:8px;background:#2cc4dc;color:#0b1a20;vertical-align:middle}#panel .fm6tag.r{background:#ffe14d}#panel .fm6tag.f{background:#ff9a3d}',
   '#panel tr.me td{background:#5a4a12}',
   '#panel .fm6recc>div{flex:1 1 0}#panel .fm6colh{font-size:9px;color:#8fe3f0;letter-spacing:1px}#panel .fm6recc td.fm6nm{max-width:150px;overflow:hidden;text-overflow:ellipsis}#panel .fm6recc td.fm6fr{max-width:96px;overflow:hidden;text-overflow:ellipsis;font-size:9px}#panel .fm6recc td button{padding:3px 6px;min-height:22px;font-size:9px}#panel .fm6recc tr.dimrow td:last-child{opacity:1}',
   '#panel .fm6cnt{font-size:13px;color:#e8f4f6;padding:5px 9px;border:2px solid #2e3d48;border-radius:4px;background:#14222c}#panel .fm6cnt b{color:#7dff7a}#panel .fm6cnt.over{border-color:#ff5a4a;background:#3a1414}#panel .fm6cnt.over b{color:#ff8a7a}#panel .fm6bad{color:#ff8a7a}',
   '#panel .fm6off{display:flex;flex-direction:column;gap:5px;min-height:0;overflow-y:auto}',
   '#panel .fm6promo{display:flex;align-items:center;gap:10px;padding:6px 10px;border:2px solid #7dff7a;border-radius:5px;background:#10261a}',
   '#panel .fm6promo img{width:30px;height:34px;image-rendering:pixelated}#panel .fm6promo .t{font-size:12px;color:#7dff7a}#panel .fm6promo .d{font-size:9px;color:#cfe}',
   '#panel .fm6pop{position:absolute;inset:0;background:rgba(4,8,12,.92);display:flex;align-items:center;justify-content:center;z-index:5}',
   '#panel .fm6pop .bx{display:flex;flex-direction:column;gap:10px;align-items:center;max-width:460px;padding:16px 18px;border:2px solid #ff8a7a;border-radius:6px;background:#141c22;text-align:center}',
   '#panel .fm6pop .q{font-size:15px;color:#fff;line-height:1.3}#panel .fm6pop .w{font-size:10px;color:#ff8a7a}',
   '#panel .fm6steps{display:flex;gap:4px}#panel .fm6steps span{font-size:9px;padding:2px 6px;border-radius:2px;background:#14222c;color:#56707c}#panel .fm6steps span.on{background:#ffe14d;color:#0b1a20}#panel .fm6steps span.dn{background:#1f5a2a;color:#cfe}'
  ].join('');
  document.head.appendChild(st);
 } catch (e) {}

 const b6 = (label, v, cls, dis) => btn(label, 'fm460', v, cls, dis);
 const starsH = n => '<span class="fm6stars" aria-label="' + n + ' OF 5 STARS">' + '&#9733;'.repeat(n) + '<i>' + '&#9733;'.repeat(5 - n) + '</i></span>';
 const badge = id => { try { return badgeUrl(T(id)); } catch (e) { return ''; } };
 const yearLine = M => M.yr + ' ' + (M.lvl === 'world' ? 'WORLD GAMES' : LVN[M.lvl] + ' SEASON');
 function head(title, sub, right) {
  const M = FM.get(), t = M && M.team ? T(M.team) : null;
  const r = (right || '') + b6('MENU', 'menu', 'g');
  if (!t || title) return '<div class="hd"><div><div class="tt">' + E(title || 'FRANCHISE MODE') + '</div><div class="st">' + E(sub || '') + '</div></div><div class="sp"></div>' + r + '</div>';
  return teamHead(t, sub, r);
 }
 const msg = () => U.msg ? '<div class="fm6res ' + (U.ok === true ? 'w' : U.ok === false ? 'l' : '') + '">' + E(U.msg) + '</div>' : '';
 const sentence = s => '<div class="fm6sub">' + s + '</div>';
 function pop() {
  if (!U.conf) return '';
  const C = U.conf;
  return '<div class="fm6pop"><div class="bx"><div class="q">' + E(C.q) + '</div><div class="w">' + E(C.w) + '</div><div class="row">' + b6(C.yes, 'confyes', 'r') + b6('CANCEL', 'confno', 'g') + '</div></div></div>';
 }
 const isForm = id => { const M = FM.get(); if (!M || !(M.form || []).includes(FM.wid(id))) return false; try { return !FM.rosterOf(M.team).includes(id); } catch (e) { return true; } };  // only on OTHER teams
 const tag = (id) => { const p = P(id); let s = ''; if (p && p.fm460b) s += '<span class="fm6tag r">REAL</span>'; if (isForm(id)) s += '<span class="fm6tag f">FORMER PLAYER</span>'; return s; };
 const ageOf = id => { const F = FM.world(), e = F && F.pl[FM.wid(id)]; return e ? e.a : null; };
 const clsOf = a => a == null ? '' : a <= 18 ? 'FR' : a === 19 ? 'SO' : a === 20 ? 'JR' : 'SR';

 // ---------- START: continue or new ----------
 function rStart() {
  const M = FM.get();
  if (!M) return rNew();
  const st = M.stage === 'season' ? (M.L ? (function () { const t = M.L.table[M.team] || { w: 0, l: 0 }; return yearLine(M) + ' - ' + t.w + '-' + t.l; })() : yearLine(M)) : M.stage === 'end' ? M.yr + ' SEASON OVER - JOB OFFERS' : M.stage === 'recruit' ? 'RECRUITING' : 'OFFSEASON';
  return head('FRANCHISE MODE', "YOU'RE THE COACH. WIN TO GET BIGGER JOBS.") +
   sentence('YOU HAVE A FRANCHISE SAVED. TAP <b>CONTINUE</b> TO PICK UP WHERE YOU LEFT OFF.') +
   '<div class="fm6cont"><img alt="" src="' + badge(M.team) + '"><div style="flex:1 1 auto"><div class="t">COACH ' + E(M.coach.n) + ' - ' + E(FM.tname(M.team)) + '</div><div class="d">' + E(LVN[M.lvl]) + ' - ' + E(st) + ' - ' + M.seasons.length + ' SEASON' + (M.seasons.length === 1 ? '' : 'S') + ' COACHED - ' + M.titles.length + ' TITLE' + (M.titles.length === 1 ? '' : 'S') + '</div><div class="d">' + starsH(FM.stars()) + ' COACH RATING - ' + E(FM.DIFFN(M.diff)) + '</div></div>' + b6('CONTINUE', 'cont', 'y fm6main') + '</div>' +
   '<div class="sp"></div><div class="row">' + b6('NEW FRANCHISE', 'newask', 'd') + '<span class="note">STARTS A NEW COACH. YOUR SAVED FRANCHISE WILL BE DELETED (WE ASK FIRST).</span></div>' + pop();
 }
 // ---------- NEW: coach name, difficulty, where to start ----------
 function fDraft() { return U.f || (U.f = { n: '', diff: 2, lvl: 'col' }); }
 function rNew() {
  const f = fDraft();
  const df = [ 0, 1, 2, 3, 4, 5 ].map(i => '<button type="button" data-a="fm460" data-v="diff:' + i + '" class="' + (f.diff === i ? 'on' : 'd') + '" style="' + (f.diff === i ? '' : 'color:' + DCOL[i]) + '" aria-label="DIFFICULTY ' + E(FM.DIFFN(i)) + '">' + E(FM.DIFFN(i)) + '</button>').join('');
  const ch = (k, t, d) => '<button type="button" data-a="fm460" data-v="lvl:' + k + '" class="fm6ch' + (f.lvl === k ? ' on' : '') + '" aria-label="START AT ' + t + '"><b>' + t + '</b><small>' + d + '</small></button>';
  return head('NEW FRANCHISE', "YOU'RE THE COACH. WIN TO GET BIGGER JOBS.", FM.get() ? b6('BACK', 'back', 'g') : '') +
   '<div class="fm6form">' +
   '<div class="row"><span class="lab">COACH NAME</span><input id="fm6name" maxlength="18" autocomplete="off" placeholder="TYPE YOUR NAME" value="' + E(f.n) + '" aria-label="COACH NAME"></div>' +
   '<div class="row"><span class="lab">DIFFICULTY</span>' + df + '</div>' +
   '<div class="row"><span class="lab">WHERE TO START</span><span class="note">PICK ONE. YOU CAN MOVE UP LATER BY WINNING.</span></div>' +
   '<div class="fm6choices">' + ch('col', 'COLLEGE', 'START SMALL. WIN GAMES AND TITLES TO GET PRO JOB OFFERS.') + ch('pro', 'PRO', 'COACH A REAL PRO TEAM RIGHT AWAY. WIN TO GET A WORLD GAMES OFFER.') + ch('world', 'WORLD', 'COACH A COUNTRY IN THE WORLD GAMES RIGHT AWAY.') + '</div>' +
   msg() + '<div class="row">' + b6('NEXT: PICK YOUR TEAM', 'topick', 'y fm6main') + '</div>' +
   '<div class="box fm6sub">HOW IT WORKS: <b>1</b> COACH YOUR TEAM: PLAY OR SIM EACH GAME. <b>2</b> AFTER EACH SEASON: STAY, OR TAKE A NEW JOB OFFER. <b>3</b> WIN BIG TO GET PRO OFFERS, THEN A WORLD GAMES OFFER.</div></div>';
 }
 // ---------- PICK A TEAM ----------
 function rPick() {
  const f = fDraft(), lv = f.lvl, ids = FM.rankBy(lv === 'col' ? FM.colIds() : lv === 'pro' ? FM.proIds() : FM.wIds());
  const lab = lv === 'col' ? 'COLLEGE' : lv === 'pro' ? 'PRO' : 'WORLD GAMES';
  const tiles = ids.map(id => { const t = T(id); return '<button type="button" data-a="fm460" data-v="team:' + id + '" class="fm6tm' + (U.pick === id ? ' on' : '') + '" aria-label="' + E(t.name) + '"><img alt="" src="' + badge(id) + '"><span><b>' + E(t.name) + '</b><small>OVR ' + FM.tOvr(id) + '</small></span></button>'; }).join('');
  const go = U.pick ? b6('START: COACH ' + T(U.pick).name, 'create', 'y fm6main') : b6('TAP A TEAM FIRST', 'none', 'd fm6main', true);
  return head('PICK YOUR ' + lab + ' TEAM', 'COACH ' + (f.n || '?') + ' - ' + FM.DIFFN(f.diff), b6('BACK', 'toNew', 'g')) +
   sentence('TAP THE TEAM YOU WANT TO COACH. STRONGER TEAMS (HIGHER OVR) ARE EASIER TO WIN WITH.') + msg() +
   '<div class="scroll" id="fm6grid"><div class="fm6grid">' + tiles + '</div></div><div class="row">' + go + '</div>';
 }

 // ---------- SEASON HUB ----------
 function stTable(M) {
  const L = M.L; if (!L) return '';
  const row = (x, i) => '<tr class="' + (x.id === M.team ? 'me' : '') + '"><td>' + (i + 1) + '</td><td class="n">' + E(FM.tname(x.id)) + '</td><td>' + x.w + '-' + x.l + '</td><td>' + (x.gf - x.ga > 0 ? '+' : '') + (x.gf - x.ga) + '</td></tr>';
  const th = '<tr><th>#</th><th class="n">TEAM</th><th>W-L</th><th>+/-</th></tr>';
  if (L.groups) return L.groups.map((g, k) => '<table><tr><th colspan="4">GROUP ' + 'AB'[k] + '</th></tr>' + th + FM.stand(g).map(row).join('') + '</table>').join('');
  const all = FM.stand(), mi = all.findIndex(x => x.id === M.team), top = all.slice(0, 10).map(row).join('');
  return '<table>' + th + top + (mi >= 10 ? '<tr><td colspan="4">...</td></tr>' + row(all[mi], mi) : '') + '</table>';
 }
 function gamesTable(M) {
  const L = M.L; if (!L || !L.mine.length) return '<div class="note" style="padding:6px">NO GAMES YET. HIT PLAY GAME OR SIM GAME.</div>';
  return '<table><tr><th class="n">GAME</th><th class="n">OPPONENT</th><th>SCORE</th></tr>' + L.mine.slice().reverse().map(g => '<tr><td class="n">' + E(g.label) + '</td><td class="n">' + (g.home ? 'VS ' : '@ ') + E(FM.tname(g.opp)) + '</td><td class="' + (g.s[0] > g.s[1] ? 'hi' : 'lo') + '">' + (g.s[0] > g.s[1] ? 'W ' : 'L ') + g.s[0] + '-' + g.s[1] + (g.real ? '' : ' (SIM)') + '</td></tr>').join('') + '</table>';
 }
 function rosterTable(id, mark) {
  const ids = FM.rosterOf(id).map(P).filter(Boolean).sort((a, b) => ({ A: 0, M: 1, FO: 2, LSM: 3, D: 4, G: 5 })[a.pos] - ({ A: 0, M: 1, FO: 2, LSM: 3, D: 4, G: 5 })[b.pos] || b.ovr - a.ovr);
  const lv = FM.lvlOf(id);
  return '<table><tr><th>POS</th><th class="n">NAME</th><th>OVR</th><th>' + (lv === 'col' ? 'CLASS' : 'AGE') + '</th></tr>' + ids.map(p => { const a = ageOf(p.id); return '<tr><td>' + posTag(p) + '</td><td class="n">' + E(p.n) + tag(p.id) + (mark && mark.has(p.id) ? '<span class="fm6tag">NEW</span>' : '') + '</td><td class="' + rc(p.ovr) + '">' + p.ovr + '</td><td>' + (lv === 'col' ? clsOf(a) : a == null ? '' : a) + '</td></tr>'; }).join('') + '</table>';
 }
 function rSeason() {
  const M = FM.get(), L = M.L, nx = FM.myGame(), me = L.table[M.team] || { w: 0, l: 0 };
  const sub = 'COACH ' + M.coach.n + ' - ' + yearLine(M) + ' - ' + me.w + '-' + me.l;
  let line, main;
  if (L.phase === 'done' || !nx || L.elim) {
   const fin = FM.finText(L);
   line = 'THE SEASON IS OVER: <b>' + E(fin) + '</b>. SEE YOUR RESULTS AND JOB OFFERS.';
   main = b6('SEASON OVER: SEE WHAT\u2019S NEXT', 'over', 'y fm6main');
   if (L.phase !== 'done') { line = 'YOUR SEASON IS OVER: <b>' + E(fin) + '</b>. THE REST OF THE PLAYOFFS PLAY OUT.'; }
  } else if (nx.bye) {
   line = E(nx.label) + ': YOUR TEAM HAS A BYE THIS WEEK.';
   main = b6('NEXT WEEK', 'sim', 'y fm6main');
  } else {
   const fp = FM.rosterOf(nx.opp).filter(isForm).length;
   line = E(nx.label) + ': NEXT GAME <b>' + (nx.home ? 'VS ' : '@ ') + E(FM.tname(nx.opp)) + '</b> (OVR ' + FM.tOvr(nx.opp) + ')' + (fp ? ' - ' + fp + ' OF YOUR FORMER PLAYERS' : '') + '. PLAY IT OR SIM IT.';
   main = b6('PLAY GAME', 'play', 'y fm6main') + b6('SIM GAME', 'sim', 'd') + b6('SIM TO END OF SEASON', 'simall', 'd');
  }
  const last = M.last ? '<div class="fm6res ' + (M.last.s[0] > M.last.s[1] ? 'w' : 'l') + '">LAST GAME: ' + (M.last.s[0] > M.last.s[1] ? 'WIN ' : 'LOSS ') + M.last.s[0] + '-' + M.last.s[1] + ' VS ' + E(FM.tname(M.last.opp)) + '</div>' : '';
  const tabs = '<div class="row tabs">' + [ [ 'st', 'STANDINGS' ], [ 'gm', 'MY GAMES' ], [ 'ro', 'MY ROSTER' ] ].map(([ k, l ]) => b6(l, 'tab:' + k, U.tab === k ? 'on' : 'd')).join('') + '<span class="sp"></span>' + b6('COACH RESUME', 'resume', 'd') + '</div>';
  const body = U.tab === 'gm' ? gamesTable(M) : U.tab === 'ro' ? rosterTable(M.team) : stTable(M);
  return head(null, sub, '<span class="note">COACH RATING</span>' + starsH(FM.stars())) + sentence(line) + '<div class="row">' + main + '</div>' + last + msg() + tabs + '<div class="scroll" id="fm6sc' + U.tab + '">' + body + '</div>' + pop();
 }

 // ---------- END OF SEASON: stay, take a promotion or another job, or start over ----------
 function rEnd() {
  const M = FM.get(), s = M.seasons[M.seasons.length - 1];
  const promo = M.offers.filter(o => o.promo), other = M.offers.filter(o => !o.promo);
  const rd = M.repD || 0;
  const promoH = promo.map(o => '<div class="fm6promo"><img alt="" src="' + badge(o.team) + '"><div style="flex:1 1 auto"><div class="t">PROMOTION: ' + E(FM.tname(o.team)) + ' WANTS YOU</div><div class="d">' + E(LVN[o.lvl]) + ' HEAD COACH - TEAM OVR ' + FM.tOvr(o.team) + '</div></div>' + b6('ACCEPT: COACH ' + FM.tname(o.team), 'take:' + o.team, 'y') + '</div>').join('');
  const otherH = other.length ? '<div class="row"><span class="note">OTHER OFFERS:</span>' + other.map(o => b6('TAKE ' + FM.tname(o.team) + ' (' + LVN[o.lvl] + ', OVR ' + FM.tOvr(o.team) + ')', 'take:' + o.team, 'd')).join('') + '</div>' : '<div class="note">NO OTHER JOB OFFERS THIS YEAR. WIN MORE TO GET THEM.</div>';
  const cards = M.cards ? '<div class="note">' + (M.cards.n ? 'TITLE CARDS: ' + M.cards.n + ' REAL PLAYER CARD' + (M.cards.n === 1 ? '' : 'S') + ' WENT TO YOUR COLLECTION.' : M.cards.real ? 'TITLE CARDS: YOUR ' + M.cards.real + ' REAL PLAYERS ARE WAITING IN THE TITLE CARD FLIP (ON THE MENU). MADE-UP PLAYERS NEVER GET CARDS.' : 'NO TITLE CARDS: YOUR ROSTER HAS NO REAL PLAYERS LEFT.') + '</div>' : '';
  const nextLbl = M.lvl === 'world' ? 'NEXT WORLD GAMES: STAY WITH ' + FM.tname(M.team) : 'NEXT SEASON: STAY AT ' + FM.tname(M.team);
  return head('END OF ' + s.yr + ' SEASON', 'COACH ' + M.coach.n + ' - ' + FM.tname(s.team) + ' (' + LVN[s.lvl] + ')', '') +
   '<div class="fm6off">' + sentence(E(M.sum)) +
   '<div class="row"><span class="note">COACH RATING</span>' + starsH(FM.stars()) + '<span class="note">' + (rd > 0 ? 'UP ' + rd : rd < 0 ? 'DOWN ' + (-rd) : 'NO CHANGE') + ' - WIN MORE TO GET BIGGER JOBS</span></div>' + cards +
   promoH + '<div class="row">' + b6(nextLbl, 'stay', promo.length ? 'g fm6main' : 'y fm6main') + '</div>' + otherH +
   '<div class="row" style="margin-top:4px">' + b6('COACH RESUME', 'resume', 'd') + '<span class="sp"></span>' + b6('START OVER', 'overask', 'r') + '</div></div>' + msg() + pop();
 }

 // ---------- RECRUITING ----------
 function rRecruit() {
  const M = FM.get(), Rc = M.rec || { need: 0, picked: [], cut: [] }, pool = FM.recruitPool(), RI = FM.recruitInfo() || { n: 0, max: 0, min: 0, over: 0, cur: [], cut: [] };
  const from = id => { const r = (Rc.real || []).find(x => x.id === id); return r ? FM.tname(r.c) : 'HIGH SCHOOL'; };
  const rows = pool.map(id => { const p = P(id), on = Rc.picked.includes(id); return '<tr class="' + (on ? 'pick' : '') + '"><td>' + posTag(p) + '</td><td class="n fm6nm">' + E(p.n) + tag(id) + '</td><td class="' + rc(p.ovr) + '">' + p.ovr + '</td><td class="n fm6fr">' + E(from(id)) + '</td><td>' + b6(on ? 'SIGNED (UNDO)' : 'SIGN', 'rec:' + id, on ? 'on' : 'y') + '</td></tr>'; }).join('');
  const ORD = { A: 0, M: 1, FO: 2, LSM: 3, D: 4, G: 5 };
  const mine = RI.cur.map(P).filter(Boolean).sort((a, b) => ORD[a.pos] - ORD[b.pos] || b.ovr - a.ovr);
  const mrows = mine.map(p => { const out = RI.cut.includes(p.id); return '<tr class="' + (out ? 'dimrow' : '') + '"><td>' + posTag(p) + '</td><td class="n fm6nm">' + E(p.n) + tag(p.id) + '</td><td class="' + rc(p.ovr) + '">' + p.ovr + '</td><td>' + clsOf(ageOf(p.id)) + '</td><td>' + b6(out ? 'LETTING GO (UNDO)' : 'LET GO', 'cut:' + p.id, out ? 'r' : 'd') + '</td></tr>'; }).join('');
  const line = 'SIGN ANY RECRUITS YOU WANT AND LET GO OF ANY PLAYERS YOU DON&#39;T WANT, THEN TAP DONE. NOBODY LEAVES UNLESS YOU SAY SO.';
  const cnt = '<span class="fm6cnt' + (RI.over ? ' over' : '') + '">ROSTER <b>' + RI.n + '/' + RI.max + '</b></span>' +
   '<span class="note">' + (RI.over ? '<span class="fm6bad">' + RI.over + ' TOO MANY: LET GO OF ' + RI.over + ' OR UNSIGN ' + RI.over + '</span>' : RI.n < RI.min ? 'UNDER ' + RI.min + ', WALK-ONS FILL THE OPEN SPOTS' : Rc.picked.length + ' SIGNED - ' + RI.cut.length + ' LET GO') + '</span>';
  const dn = (M.draftNews || []).map(x => (P(FM.PFX + x.id) ? P(FM.PFX + x.id).n : '?') + ' (#' + x.no + ', ' + FM.tname(x.t) + ')');
  const dnH = dn.length ? '<div class="note">DRAFTED TO THE PROS FROM YOUR TEAM: ' + E(dn.join(', ')) + '</div>' : '';
  return head(null, 'RECRUITING - ' + (M.yr + 1) + ' CLASS', '') + sentence(line) + dnH +
   '<div class="row">' + b6('DONE: START ' + (M.yr + 1) + ' SEASON', 'recdone', 'y fm6main') + cnt + '<span class="sp"></span>' + b6('LET MY STAFF HANDLE IT', 'recauto', 'd') + '</div>' + msg() +
   '<div class="fm6cols fm6recc"><div><div class="fm6colh">RECRUITS - REAL PLAYERS FIRST</div><div class="scroll" id="fm6rec"><table><tr><th>POS</th><th class="n">NAME</th><th>OVR</th><th class="n">FROM</th><th></th></tr>' + rows + '</table></div></div>' +
   '<div><div class="fm6colh">YOUR PLAYERS FOR NEXT SEASON</div><div class="scroll" id="fm6cut"><table><tr><th>POS</th><th class="n">NAME</th><th>OVR</th><th>CLASS</th><th></th></tr>' + mrows + '</table></div></div></div>';
 }

 // ---------- PRO OFFSEASON: 1 RE-SIGN, 2 DRAFT, 3 YOUR TEAM ----------
 function steps(k) { const ks = [ [ 'resign', '1 RE-SIGN' ], [ 'draft', '2 DRAFT' ], [ 'team', '3 YOUR TEAM' ] ], i = ks.findIndex(x => x[0] === k); return '<div class="fm6steps">' + ks.map((x, j) => '<span class="' + (j === i ? 'on' : j < i ? 'dn' : '') + '">' + x[1] + '</span>').join('') + '</div>'; }
 function payInfo() {
  const F = FM.world(), FR = window.FR458; if (!F || !FR) return { pay: 0, cap: 42000 };
  let s = 0;
  for (const x of F.ro[F.team] || []) { const c = F.ct[x]; if (c && c[0] > 0) s += c[1]; }
  if (F.off && F.off.rs) for (const x in F.off.rs) if (F.off.rs[x]) { const p = P(FM.PFX + x), e = F.pl[x]; if (p && e) s += FR.salaryFor(p.ovr, e.a); }
  return { pay: s, cap: FR.CAP };
 }
 function rResign() {
  const M = FM.get(), F = FM.world(), O = F && F.off, FR = window.FR458;
  const exp = O ? (O.expMine || []) : [], pi = payInfo();
  const rows = exp.map(x => { const id = FM.PFX + x, p = P(id), e = F.pl[x]; if (!p || !e) return ''; const sal = FR.salaryFor(p.ovr, e.a), k = O.rs[x]; return '<tr class="' + (k ? 'pick' : k === false ? 'dimrow' : '') + '"><td>' + posTag(p) + '</td><td class="n">' + E(p.n) + tag(id) + '</td><td class="' + rc(p.ovr) + '">' + p.ovr + '</td><td>' + e.a + '</td><td>' + money(sal) + '</td><td>' + b6(k ? 'KEEPING' : 'KEEP', 'rs:' + id + ':1', k ? 'on' : 'y') + ' ' + b6(k === false ? 'LETTING GO' : 'LET GO', 'rs:' + id + ':0', k === false ? 'r' : 'd') + '</td></tr>'; }).join('');
  const line = exp.length ? 'THESE PLAYERS\u2019 CONTRACTS ARE UP. TAP <b>KEEP</b> OR <b>LET GO</b> FOR EACH ONE, THEN TAP NEXT. (ANYONE YOU SKIP IS LET GO.)' : 'NO CONTRACTS ARE UP THIS YEAR. TAP NEXT.';
  return head(null, 'BEFORE THE ' + (M.yr + 1) + ' SEASON - STEP 1 OF 3: RE-SIGN', steps('resign')) + sentence(line) +
   '<div class="row">' + b6('NEXT: THE DRAFT', 'rsnext', 'y fm6main') + b6('LET MY STAFF HANDLE IT', 'rsauto', 'd') + '<span class="note">PAYROLL ' + money(pi.pay) + ' OF ' + money(pi.cap) + ' CAP</span></div>' + msg() +
   '<div class="scroll" id="fm6rs"><table><tr><th>POS</th><th class="n">NAME</th><th>OVR</th><th>AGE</th><th>ASKS</th><th></th></tr>' + rows + '</table></div>';
 }
 function rDraft() {
  const M = FM.get(), d = FM.draftState(), FR = window.FR458;
  if (!d) return head(null, 'DRAFT', '') + sentence('THE DRAFT IS DONE.') + '<div class="row">' + b6('NEXT: YOUR TEAM', 'drauto', 'y fm6main') + '</div>';
  const proj = o => FR && FR.proAdj ? o - FR.proAdj(o) : o;
  const rows = d.pool.slice(0, 40).map(id => { const p = P(id); return '<tr><td>' + posTag(p) + '</td><td class="n">' + E(p.n) + tag(id) + '</td><td class="' + rc(p.ovr) + '">' + p.ovr + '</td><td class="' + rc(proj(p.ovr)) + '">' + proj(p.ovr) + '</td><td class="n">' + E(FM.tname(d.from[FM.wid(id)] || '')) + '</td><td>' + (d.mine ? b6('DRAFT', 'dr:' + id, 'y') : '') + '</td></tr>'; }).join('');
  const mineLast = d.picks.filter(p => p.t === M.team).map(p => P(p.id) ? P(p.id).n : '?');
  const line = d.mine ? 'YOUR PICK! ROUND ' + d.rd + ', PICK ' + d.slot + '. TAP <b>DRAFT</b> ON THE COLLEGE PLAYER YOU WANT.' : 'THE DRAFT IS DONE.';
  return head(null, 'BEFORE THE ' + (M.yr + 1) + ' SEASON - STEP 2 OF 3: THE DRAFT', steps('draft')) + sentence(line + (mineLast.length ? ' YOU TOOK: ' + E(mineLast.join(', ')) + '.' : '')) +
   '<div class="row">' + b6('LET MY STAFF HANDLE IT', 'drauto', 'd') + '<span class="note">COLLEGE STARS START A LITTLE LOWER AS PRO ROOKIES</span></div>' + msg() +
   '<div class="scroll" id="fm6dr"><table><tr><th>POS</th><th class="n">NAME</th><th>COLLEGE OVR</th><th>AS A ROOKIE</th><th class="n">COLLEGE</th><th></th></tr>' + rows + '</table></div>';
 }
 function rTeam() {
  const M = FM.get(), F = FM.world(), pi = payInfo();
  const picks = new Set((F && F.off && F.off.dr ? F.off.dr.picks : []).filter(p => p[0] === M.team).map(p => FM.PFX + p[1]));
  return head(null, 'BEFORE THE ' + (M.yr + 1) + ' SEASON - STEP 3 OF 3: YOUR TEAM', steps('team')) +
   sentence('THIS IS YOUR TEAM FOR NEXT SEASON (TEAM OVR <b>' + FM.tOvr(M.team) + '</b>). YOUR STAFF FILLED ANY EMPTY SPOTS. TAP START SEASON.') +
   '<div class="row">' + b6('START ' + (M.yr + 1) + ' SEASON', 'tmdone', 'y fm6main') + '<span class="note">PAYROLL ' + money(pi.pay) + ' OF ' + money(pi.cap) + ' CAP - NEW = ROOKIE YOU DRAFTED</span></div>' +
   '<div class="scroll" id="fm6tm">' + rosterTable(M.team, picks) + '</div>';
 }

 // ---------- COACH RESUME ----------
 function rResume() {
  const M = FM.get(), cj = FM.curJob();
  const rows = M.jobs.map(j => '<tr class="' + (j === cj ? 'me' : '') + '"><td class="n">' + E(FM.tname(j.team)) + (j === cj ? '<span class="fm6tag">NOW</span>' : '') + '</td><td>' + E(LVN[j.lvl]) + '</td><td>' + (j.n ? j.y0 + (j.y1 !== j.y0 ? '-' + j.y1 : '') : 'STARTS ' + j.y0) + '</td><td>' + j.n + '</td><td>' + j.w + '-' + j.l + '</td><td>' + (j.t.length ? '&#9733; ' + j.t.join(' &#9733; ') : '-') + '</td></tr>').join('');
  const tw = M.seasons.reduce((a, s) => a + s.w, 0), tl = M.seasons.reduce((a, s) => a + s.l, 0);
  const sz = M.seasons.slice().reverse().map(s => '<tr><td>' + s.yr + '</td><td class="n">' + E(FM.tname(s.team)) + '</td><td>' + E(LVN[s.lvl]) + '</td><td>' + s.w + '-' + s.l + '</td><td class="n' + (s.champ ? ' hi' : '') + '">' + E(s.fin) + '</td></tr>').join('');
  return head('COACH RESUME', 'COACH ' + M.coach.n + ' - ' + FM.DIFFN(M.diff), b6('BACK', 'back', 'g')) +
   sentence('COACH ' + E(M.coach.n) + ' ' + starsH(FM.stars()) + ' - NOW: <b>' + E(FM.tname(M.team)) + '</b> (' + E(LVN[M.lvl]) + ') - ' + M.seasons.length + ' SEASONS, ' + tw + '-' + tl + ', ' + M.titles.length + ' TITLE' + (M.titles.length === 1 ? '' : 'S') + '.') +
   '<div class="scroll" id="fm6cv"><table><tr><th class="n">JOB</th><th>LEVEL</th><th>YEARS</th><th>SEASONS</th><th>RECORD</th><th>TITLES</th></tr>' + rows + '</table>' +
   (sz ? '<table style="margin-top:6px"><tr><th>YEAR</th><th class="n">TEAM</th><th>LEVEL</th><th>RECORD</th><th class="n">FINISH</th></tr>' + sz + '</table>' : '') + '</div>';
 }

 // ---------- render + actions ----------
 function view() {
  const M = FM.get();
  if (U.v === 'new' || (!M && U.v !== 'pick')) return 'new';
  if (U.v === 'pick') return 'pick';
  if (!M) return 'new';
  if (U.v === 'start') return 'start';
  if (U.v === 'resume') return 'resume';
  return { season: 'season', end: 'end', recruit: 'recruit', resign: 'resign', draft: 'draft', team: 'team' }[M.stage] || 'season';
 }
 function render() {
  if (FM.get()) FM.ensure();
  const v = view(); U.cur = v;
  return ({ start: rStart, new: rNew, pick: rPick, season: rSeason, end: rEnd, recruit: rRecruit, resign: rResign, draft: rDraft, team: rTeam, resume: rResume })[v]();
 }
 function open(v) { U.msg = null; U.ok = null; U.conf = null; U.v = v || 'start'; screen = 'fm460'; panelDirty(); }
 PANEL_SCREENS.push('fm460');
 PANEL_RENDER.fm460 = function () { try { return render(); } catch (e) { console.error(e); return '<div class="hd"><div class="tt">FRANCHISE MODE</div><div class="sp"></div>' + b6('MENU', 'menu', 'g') + '</div><div class="note">SOMETHING WENT WRONG LOADING YOUR FRANCHISE.</div>'; } };
 const say = (m, ok) => { U.msg = m; U.ok = ok; };
 // both recruiting lists keep their scroll spot when you tap SIGN / LET GO
 function keepScroll(fn) {
  const keep = {}; document.querySelectorAll('#panel .scroll[id^="fm6"]').forEach(n => keep[n.id] = n.scrollTop);
  const r = fn();
  const put = () => { for (const k in keep) { const n = document.getElementById(k); if (n) n.scrollTop = keep[k]; } };
  setTimeout(put, 0); setTimeout(put, 50); setTimeout(put, 140);
  return r;
 }
 function readForm() { const n = document.getElementById('fm6name'); if (n) fDraft().n = String(n.value || '').toUpperCase().replace(/[^A-Z0-9 .'-]/g, '').slice(0, 18); }
 try { panel.addEventListener('input', ev => { if (panel.dataset.scr !== 'fm460') return; readForm(); }); } catch (e) {}
 PANEL_ACT.fm460 = function (v) {
  const s = String(v), i = s.indexOf(':'), k = i < 0 ? s : s.slice(0, i), a = i < 0 ? '' : s.slice(i + 1);
  if (k !== 'confyes' && k !== 'confno') { U.msg = null; U.ok = null; }
  if (k === 'menu') { U.conf = null; screen = 'menu'; return; }
  if (k === 'none') return;
  if (k === 'confno') { U.conf = null; return; }
  if (k === 'confyes') { const c = U.conf; U.conf = null; if (c && c.k === 'new') { FM.startOver(); U.f = null; U.v = 'new'; } else if (c && c.k === 'over') { FM.startOver(); U.f = null; U.v = 'new'; } return; }
  // new coach
  if (U.cur === 'new' || U.cur === 'pick') {
   readForm();
   const f = fDraft();
   if (k === 'diff') { f.diff = +a; return; }
   if (k === 'lvl') { if (f.lvl !== a) U.pick = null; f.lvl = a; return; }
   if (k === 'back') { U.v = 'start'; return; }
   if (k === 'topick') { if (!f.n) { say('TYPE YOUR COACH NAME FIRST', false); return; } U.v = 'pick'; return; }
   if (k === 'toNew') { U.v = 'new'; return; }
   if (k === 'team') { U.pick = a; return; }
   if (k === 'create') { const r = FM.create({ n: f.n, diff: f.diff, lvl: f.lvl, team: U.pick }); if (!r.ok) { say(r.why, false); return; } U.v = null; U.f = null; U.pick = null; U.tab = 'st'; say('WELCOME, COACH ' + FM.get().coach.n + '. YOUR FIRST SEASON AT ' + FM.tname(FM.get().team) + ' STARTS NOW.', true); return; }
   return;
  }
  const M = FM.get(); if (!M) { U.v = 'new'; return; }
  if (k === 'cont') { U.v = null; return; }
  if (k === 'newask') { U.conf = { k: 'new', q: 'START OVER? COACH ' + M.coach.n + ' AT ' + FM.tname(M.team) + ' (' + M.yr + ') WILL BE DELETED.', w: 'THIS CANNOT BE UNDONE.', yes: 'YES, START OVER' }; return; }
  if (k === 'overask') { U.conf = { k: 'over', q: 'START OVER? YOUR WHOLE FRANCHISE (' + M.seasons.length + ' SEASONS, ' + M.titles.length + ' TITLES) WILL BE DELETED.', w: 'THIS CANNOT BE UNDONE.', yes: 'YES, START OVER' }; return; }
  if (k === 'resume') { U.back = U.v; U.v = 'resume'; return; }
  if (k === 'back') { U.v = U.back && U.back !== 'resume' ? U.back : null; return; }
  if (k === 'tab') { U.tab = a; return; }
  if (k === 'play') { if (!FM.play()) say('THAT GAME CANNOT BE PLAYED RIGHT NOW', false); return; }
  if (k === 'sim') { FM.simMine(); return; }
  if (k === 'simall') { FM.simSeason(); return; }
  if (k === 'over') { const L = M.L; if (L && L.phase !== 'done') { FM.simSeason(); } FM.seasonOver(); return; }
  if (k === 'stay') { FM.choose(null); U.tab = 'st'; return; }
  if (k === 'take') { const r = FM.choose(a); if (r && r.ok) say('YOU ARE THE NEW COACH OF ' + FM.tname(a) + '!', true); return; }
  if (k === 'rec') { keepScroll(() => { if (!FM.recruitToggle(a)) say('THAT RECRUIT IS NOT AVAILABLE ANY MORE.', false); }); return; }
  if (k === 'cut') { keepScroll(() => { if (!FM.recruitCut(a)) say('THAT PLAYER IS NOT ON YOUR TEAM.', false); }); return; }
  if (k === 'recdone') { const r = FM.recruitDone(false); if (!r || !r.ok) { say(r && r.why ? r.why : 'CANNOT FINISH RECRUITING RIGHT NOW.', false); return; } U.tab = 'ro'; say('RECRUITING DONE: ' + r.got + ' SIGNED, ' + r.gone + ' LET GO. HERE IS YOUR NEW TEAM.', true); return; }
  if (k === 'recauto') { const r = FM.recruitDone(true); if (!r || !r.ok) { say(r && r.why ? r.why : 'CANNOT FINISH RECRUITING RIGHT NOW.', false); return; } U.tab = 'ro'; say('YOUR STAFF PICKED THE BEST RECRUITS. HERE IS YOUR NEW TEAM.', true); return; }
  if (k === 'rs') { const [ id, kk ] = [ a.slice(0, a.lastIndexOf(':')), a.slice(a.lastIndexOf(':') + 1) ]; const r = FM.resignSet(id, kk === '1'); if (r && !r.ok && r.why) say(r.why, false); return; }
  if (k === 'rsnext') { FM.resignNext(false); return; }
  if (k === 'rsauto') { FM.resignNext(true); return; }
  if (k === 'dr') { FM.draftPick(a, false); return; }
  if (k === 'drauto') { FM.draftPick(null, true); return; }
  if (k === 'tmdone') { FM.teamDone(); U.tab = 'st'; say('NEW SEASON! GOOD LUCK, COACH.', true); return; }
 };

 // ---------- the PICK A MODE menu: QUICK GAME / ONLINE / PRO SEASON / WORLD GAMES / COLLEGE / [CAREER | ULTIMATE] / BACK
 // tapping CAREER swaps the buttons in place: CAREER CARD (v459car, you're the player) / FRANCHISE TEAM (Franchise Mode, you're the coach) / BACK
 const MENU = { fc: false };
 const MB0 = window.menuBars;
 window.menuBars = function () {
  const rows = MB0.apply(this, arguments);
  try {
   if (FM.OFF() || !Array.isArray(rows)) return rows;
   const has = lab => rows.findIndex(r => r && r.some && r.some(e => e && e.m37 && e.label === lab));
   const pi = has('PRO SEASON'), ci = has('COLLEGE');
   if (pi < 0 || ci < 0 || has('ONLINE') < 0) { MENU.fc = false; return rows; }
   let car = null;
   for (const r of rows) { const k = r.findIndex(e => e && e.m37 && e.label === 'CAREER'); if (k >= 0) { car = r[k]; r.splice(k, 1); } }
   for (let i = rows.length - 1; i >= 0; i--) { const r = rows[i], k = r.findIndex(e => e && e.m37 && e.label === 'TEAMS + RATINGS'); if (k >= 0) { r.splice(k, 1); if (!r.length) rows.splice(i, 1); } }
   const fmE = { label: 'FRANCHISE TEAM', sub6: "YOU'RE THE COACH", fn: () => { MENU.fc = false; open('start'); }, bg: '#ffb14d', m37: 1, h37: 30 };
   const carE = car ? { label: 'CAREER CARD', sub6: "YOU'RE THE PLAYER", fn: () => { MENU.fc = false; car.fn(); }, bg: car.bg || '#9dffd0', m37: 1, h37: 30 } : null;
   const back = rows.find(r => r.some(e => e && e.m37 === 'back'));
   if (MENU.fc && carE) {
    const bk = { label: 'BACK', fn: () => { MENU.fc = false; }, bg: '#c9d6d9', m37: 'back', h37: 15 };
    return [ [ carE ], [ fmE ], [ bk ] ];
   }
   const fc = carE ? { label: 'CAREER', fn: () => { MENU.fc = true; }, bg: '#ffb14d', m37: 1, h37: 14 } : Object.assign({}, fmE, { label: 'FRANCHISE MODE', sub6: null, h37: 14 });
   const ui = rows.findIndex(r => r.some(e => e && e.m37 && e.label === 'ULTIMATE'));
   if (ui >= 0) rows[ui].unshift(fc);
   else { const bi = back ? rows.indexOf(back) : rows.length; rows.splice(bi, 0, [ fc ]); }
  } catch (e) { console.error(e); }
  return rows;
 };
 // a menu bar with a second line ("YOU'RE THE COACH")
 const MBar0 = window.menuBar;
 window.menuBar = function (b, live) {
  if (!b || !b.sub6 || FM.OFF()) return MBar0.apply(this, arguments);
  if (live) hit(b.label, b.x, b.y, b.w, b.h, b.fn, b.label);
  rect(b.x, b.y + 3, b.w, b.h, '#000');
  rect(b.x, b.y, b.w, b.h, b.bg);
  rect(b.x, b.y, b.w, 2, 'rgba(255,255,255,.45)');
  rect(b.x, b.y + b.h - 3, b.w, 3, 'rgba(0,0,0,.2)');
  rect(b.x, b.y, 3, b.h, 'rgba(0,0,0,.22)');
  const cx = Math.round(b.x + b.w / 2), s1 = textW(b.label, 2) <= b.w - 12 ? 2 : 1, h1 = 5 * s1, h2 = 5, gp = 4, y0 = Math.round(b.y + (b.h - h1 - gp - h2) / 2);
  text(b.label, cx, y0, s1, '#0b1a20', 'center');
  text(b.sub6, cx, y0 + h1 + gp, 1, '#3a2a10', 'center');
 };

 // ---------- in-game: record the game + the final screen ----------
 const FG = window.finishGame;
 window.finishGame = function () {
  const r = FG.apply(this, arguments);
  try { if (game && game.fm460) FM.gameOver(game); } catch (e) { console.error(e); }
  return r;
 };
 const DF0 = window.drawFinal;
 window.drawFinal = function () {
  const G = game;
  if (!G || !G.fm460) return DF0.apply(this, arguments);
  const cx = W / 2, win = G.score[0] > G.score[1], M = FM.get();
  rect(0, 0, W, H, 'rgba(0,0,0,.55)');
  card(cx - 120, 14, 240, 150);
  text('FINAL' + (typeof otTag173 === 'function' ? otTag173(G) : '') + '  -  ' + DIFF_NAMES[G.diff != null ? G.diff : 1], cx, 20, 1, '#9aa', 'center');
  text(win ? 'YOU WIN!' : 'TOUGH LOSS', cx, 30, 4, win ? '#ffe14d' : '#ff5a4a', 'center', '#000');
  scoreLine(cx, 64);
  if (M) { const t = M.L ? M.L.table[M.team] : null; text(('COACH ' + M.coach.n + (t ? '  -  ' + t.w + '-' + t.l : '')).slice(0, 44), cx, 98, 1, '#cfe', 'center'); }
  button('FRANCHISE', cx - 110, 118, 104, 18, () => { FM.unregGame(); game = null; open(null); }, { sc: 1, bg: '#ffb14d' });
  button('MENU', cx + 6, 118, 104, 18, () => { FM.unregGame(); screen = 'menu'; }, { bg: '#c9d6d9' });
  if (win) for (let i = 0; i < 40; i++) { const x = (i * 37 + G.finalT * 40 * (1 + i % 3)) % W, y = (i * 23 + G.finalT * 60 * (1 + i % 2)) % H; rect(x, y, 2, 2, [ '#2cc4dc', '#ffe14d', '#ff5a4a', '#ffffff' ][i % 4]); }
 };
 const TX0 = window.text;
 if (typeof TX0 === 'function') window.text = function (s) {
  if (s === 'QUICK GAME' && screen === 'pregame') { const G = game; if (G && G.fm460 && G.meta && G.meta.label) { const a = Array.prototype.slice.call(arguments); a[0] = String(G.meta.label).slice(0, 34); return TX0.apply(this, a); } }
  return TX0.apply(this, arguments);
 };
 window.FM460U = { open: open, U: U };
})();
