'use strict';
// v458fru: PRO FRANCHISE screens + hooks into the existing season code (makeSeason, the season hub, the setup panel).
// Kill switch: window.__rl_no458fr = true. Own storage: rl_fr458 (league, via v458fr.js) + rl_fr458set (mode choice).
(function () {
 const FR = window.FR458;
 if (!FR) return;
 const OFF = () => FR.OFF();
 const SETK = 'fr458set';
 const NOFR = () => !window.__rl_no460fm && !!window.FM460; // v460fm: FRANCHISE MODE (coach) replaces the pro franchise; Pro Season is one season again
 const mode = () => { if (NOFR()) return 'one'; const s = LS.get(SETK, null); return s && s.m === 'one' ? 'one' : 'fr'; };
 const tap = () => { try { SFX.tap(); } catch (e) {} };
 const E = s => (typeof esc === 'function' ? esc(s) : String(s));
 const money = FR.money;
 const STEPS = [ [ 'age', 'PROGRESSION' ], [ 'resign', 'RE-SIGN' ], [ 'cpu', 'CPU MOVES' ], [ 'fa', 'FREE AGENCY' ], [ 'trade', 'TRADES' ], [ 'draft', 'DRAFT' ], [ 'final', 'ROSTER' ] ];
 const U = { pos: 'ALL', sel: null, mul: 1, yrs: null, msg: null, ok: null, tt: null, give: [], get: [], dsel: null, arm: 0, cutArm: null };
 const isFr = S => !!(S && S.fr458 && !S.online && FR.get() && S.fr458 === FR.get().id);

 // ---------- styles (scoped to the panel) ----------
 try {
  const st = document.createElement('style');
  st.id = 'fr458css';
  st.textContent = '#panel .fr8steps{display:flex;gap:3px;flex-wrap:wrap;flex:0 0 auto}#panel .fr8steps span{padding:3px 7px;border-radius:2px;background:#16222b;color:#56707c;font-size:9px}#panel .fr8steps span.on{background:#ffd23a;color:#0b1a20}#panel .fr8steps span.dn{background:#1f5a2a;color:#d6ffdc}' +
   '#panel .fr8bar{display:flex;gap:10px;align-items:center;flex:0 0 auto;font-size:10px;color:#cfe;flex-wrap:wrap}#panel .fr8bar b{color:#fff}#panel .fr8cap{position:relative;width:120px;height:8px;background:#22313d;border-radius:2px;overflow:hidden;display:inline-block;vertical-align:middle}#panel .fr8cap i{position:absolute;left:0;top:0;bottom:0;background:#7dff7a}#panel .fr8cap i.hot{background:#ff8a7a}' +
   '#panel .fr8ban{display:inline-flex;gap:3px;align-items:center}#panel .fr8pen{display:inline-block;background:#ffd23a;color:#0b1a20;padding:2px 9px 2px 6px;font-size:9px;clip-path:polygon(0 0,100% 0,88% 50%,100% 100%,0 100%);box-shadow:0 2px 0 #000}#panel .fr8pen.big{font-size:12px;padding:5px 18px 5px 10px}' +
   '#panel .fr8msg{flex:0 0 auto;padding:4px 8px;border-radius:3px;background:#14222c;color:#ffe14d;font-size:10px}#panel .fr8msg.ok{background:#1f5a2a;color:#d6ffdc}#panel .fr8msg.bad{background:#5a1f1f;color:#ffd6d6}' +
   '#panel .fr8cols{display:flex;gap:8px;flex:1 1 auto;min-height:0}#panel .fr8cols>div{display:flex;flex-direction:column;min-height:0;flex:1 1 0;gap:4px}#panel .fr8h{font-size:10px;color:#7f9aa6}' +
   '#panel .fr8news div{padding:3px 6px;border-top:1px solid #16222b;text-align:left;white-space:normal}#panel .fr8tag{display:inline-block;min-width:54px;text-align:center;padding:1px 4px;margin-right:6px;border-radius:2px;font-size:9px;background:#22313d;color:#cfe}#panel .fr8tag.trade{background:#12506a;color:#cff3ff}#panel .fr8tag.cut{background:#6a1f1f;color:#ffd6d6}#panel .fr8tag.walk{background:#6a5a12;color:#fff2b0}#panel .fr8tag.ret{background:#4a2a6a;color:#f0dcff}#panel .fr8tag.fa,#panel .fr8tag.resign{background:#1f5a2a;color:#d6ffdc}' +
   '#panel .up{color:#7dff7a}#panel .dn2{color:#ff8a7a}#panel .fr8new{display:inline-block;margin-left:5px;padding:0 4px;border-radius:2px;background:#2cc4dc;color:#0b1a20;font-size:8px}#panel .fr8new.rk{background:#ffd23a}#panel td.l{text-align:left}#panel button.sm{padding:4px 7px;min-height:24px;font-size:10px}#panel .fr8teams{display:flex;gap:3px;overflow-x:auto;flex:0 0 auto;-webkit-overflow-scrolling:touch}#panel .fr8teams button{padding:4px 6px;min-height:24px;font-size:10px;flex:0 0 auto}' +
   '#panel .fr8sec{padding:5px 6px 3px;font-size:9px;color:#ffd23a;background:#0e1820;position:sticky;top:0;z-index:1}#panel .fr8hero{display:flex;gap:12px;align-items:center;flex:0 0 auto}#panel .fr8hero .box{flex:1 1 0}';
  document.head.appendChild(st);
 } catch (e) {}

 // ---------- shared bits ----------
 function banners(F, big) {
  if (!F || !F.titles.length) return '';
  return '<span class="fr8ban">' + F.titles.slice().sort().map(y => '<span class="fr8pen' + (big ? ' big' : '') + '">&#9733; ' + y + ' CHAMPS</span>').join('') + '</span>';
 }
 function capBar(F) {
  const pay = FR.payroll(F.team), n = FR.roster(F.team).length, pct = Math.min(100, pay / FR.CAP * 100);
  return '<div class="fr8bar"><span>PAYROLL <b>' + money(pay) + '</b> / CAP ' + money(FR.CAP) + '</span><span class="fr8cap"><i class="' + (pay > FR.CAP ? 'hot' : '') + '" style="width:' + pct.toFixed(1) + '%"></i></span><span>ROOM <b class="' + (pay > FR.CAP ? 'dn2' : 'up') + '">' + money(FR.CAP - pay) + '</b></span><span>ROSTER <b>' + n + '</b> (' + FR.RMIN + '-' + FR.RMAX + ')</span><span class="sp" style="flex:1"></span>' + banners(F) + '</div>';
 }
 function steps(cur) {
  const i0 = STEPS.findIndex(s => s[0] === cur);
  return '<div class="fr8steps">' + STEPS.map((s, i) => '<span class="' + (i === i0 ? 'on' : i < i0 ? 'dn' : '') + '">' + (i + 1) + ' ' + s[1] + '</span>').join('') + '</div>';
 }
 const msg = () => U.msg ? '<div class="fr8msg ' + (U.ok === true ? 'ok' : U.ok === false ? 'bad' : '') + '">' + E(U.msg) + '</div>' : '';
 const say = (m, ok) => { U.msg = m; U.ok = ok; };
 const ovrCell = (p, d) => '<td class="' + rc(p.ovr) + '">' + p.ovr + (d ? ' <span class="' + (d > 0 ? 'up' : 'dn2') + '">' + (d > 0 ? '+' : '') + d + '</span>' : '') + '</td>';
 const ctCell = id => { const c = FR.contract(id); return '<td>' + (!c ? '-' : c[0] > 0 ? money(c[1]) + ' X ' + c[0] + ' YR' + (c[0] > 1 ? 'S' : '') : '<span class="star">EXPIRING</span>') + '</td>'; };
 const nameTd = (p, extra) => '<td class="n">' + (p.real ? '<span class="star">&#9733;</span> ' : '') + E(p.n) + (extra || '') + '</td>';
 const sortIds = ids => ids.map(PP).filter(Boolean).sort((a, b) => POS_ORDER[a.pos] - POS_ORDER[b.pos] || b.ovr - a.ovr);
 const colName = c => { try { return T(c).name; } catch (e) { return c; } };
 function head(F, sub, right) { return teamHead(T(F.team), sub, (right || '') + btn('MENU', 'fr458', 'menu', 'g')); }

 // ---------- the offseason panel ----------
 function render() {
  const F = FR.get();
  if (!F || !F.off) return '<div class="hd"><div class="tt">PRO FRANCHISE</div><div class="sp"></div>' + btn('MENU', 'fr458', 'menu', 'g') + '</div><div class="note">NO OFFSEASON RIGHT NOW.</div>';
  const O = F.off, y1 = O.y0 + 1, sub = (k, n) => 'OFFSEASON ' + O.y0 + ' > ' + y1 + '  -  STEP ' + (STEPS.findIndex(s => s[0] === k) + 1) + '/7: ' + n;
  const fn = { age: rAge, resign: rResign, cpu: rCpu, fa: rFa, trade: rTrade, draft: rDraft, final: rFinal }[O.step] || rAge;
  return fn(F, O, sub, y1);
 }
 function rAge(F, O, sub) {
  const h = F.hist[F.hist.length - 1] || { w: 0, l: 0, f: '' }, won = h.ch === F.team;
  const mine = FR.roster(F.team).map(PP).filter(Boolean).map(p => [ p, (O.prog[p.id] || [ p.ovr, 0 ])[1] ]).sort((a, b) => b[1] - a[1] || b[0].ovr - a[0].ovr);
  const ret = (O.ret || []).filter(r => PP(r[0])), myRet = ret.filter(r => r[1] === F.team), lgRet = ret.filter(r => r[1] !== F.team && PP(r[0]).ovr >= 70).slice(0, 6);
  const rows = mine.map(([ p, d ]) => '<tr><td>' + posTag(p) + '</td>' + nameTd(p) + '<td>' + FR.age(p.id) + '</td>' + ovrCell(p, d) + ctCell(p.id) + '</tr>').join('');
  const retL = myRet.map(r => '<div><span class="fr8tag ret">RETIRED</span>' + E(FR.nm(r[0])) + ', AGE ' + FR.age(r[0]) + ' <span class="dim2">(YOURS)</span></div>').join('') + lgRet.map(r => '<div><span class="fr8tag ret">RETIRED</span>' + E(FR.nm(r[0])) + (r[1] ? ' - ' + E(T(r[1]).abbr || T(r[1]).name) : '') + ', <span style="white-space:nowrap">AGE ' + FR.age(r[0]) + '</span></div>').join('');
  return head(F, sub('age', 'PROGRESSION'), btn('NEXT: RE-SIGN', 'fr458', 'go:resign', 'y')) + steps('age') + capBar(F) +
   '<div class="fr8hero"><div class="box">' + (won ? '<span class="fr8pen big">&#9733; ' + h.y + ' CHAMPIONS &#9733;</span> ' : '') + '<b>' + h.y + ' SEASON: ' + h.w + '-' + h.l + ', ' + E(h.f) + '</b>' + (h.ch && !won ? ' <span class="dim2">(' + E(T(h.ch).name) + ' WON IT ALL)</span>' : '') +
   '<div class="note">EVERYONE IS A YEAR OLDER. YOUNG PLAYERS IMPROVE, VETERANS SLOW DOWN, THE OLDEST RETIRE.' + (O.grad ? ' ' + O.grad + ' COLLEGE SENIORS GRADUATED AND FRESHMEN TOOK THEIR SPOTS.' : '') + ' CONTRACTS MARKED EXPIRING ARE UP NEXT.</div></div></div>' +
   '<div class="fr8cols"><div><div class="fr8h">YOUR PLAYERS - RATING CHANGE</div><div class="scroll" id="fr8a"><table><tr><th>POS</th><th class="n">NAME</th><th>AGE</th><th>OVR</th><th>CONTRACT</th></tr>' + rows + '</table></div></div>' +
   '<div style="flex:0 0 38%"><div class="fr8h">RETIREMENTS</div><div class="scroll fr8news">' + (retL || '<div class="dim2">NOBODY OF NOTE RETIRED.</div>') + '</div></div></div>';
 }
 function rResign(F, O, sub) {
  const ex = O.expMine.filter(id => PP(id));
  const pend = ex.filter(id => O.rs[id] == null).length;
  const rows = sortIds(ex).map(p => { const a = FR.ask(p.id), s = O.rs[p.id]; return '<tr class="' + (s === true ? 'pick' : '') + '"><td>' + posTag(p) + '</td>' + nameTd(p) + '<td>' + FR.age(p.id) + '</td><td class="' + rc(p.ovr) + '">' + p.ovr + '</td><td>' + money(a.sal) + ' X ' + a.yrs + (a.yrs > 1 ? ' YRS' : ' YR') + '</td><td>' + btn('KEEP', 'fr458', 'rs:' + p.id + ':1', s === true ? 'on sm' : 'sm') + ' ' + btn('LET GO', 'fr458', 'rs:' + p.id + ':0', s === false ? 'r sm' : 'd sm') + '</td><td>' + (s === true ? '<span class="up">RE-SIGNED</span>' : s === false ? '<span class="dn2">FREE AGENT</span>' : '<span class="dim2">DECIDE</span>') + '</td></tr>'; }).join('');
  return head(F, sub('resign', 'RE-SIGN'), (pend ? '<span class="note">' + pend + ' TO DECIDE</span>' : '') + btn('NEXT: CPU MOVES', 'fr458', 'go:cpu', 'y', pend > 0)) + steps('resign') + capBar(F) + msg() +
   '<div class="note">THESE CONTRACTS ARE UP. KEEP A PLAYER AT HIS ASKING PRICE OR LET HIM WALK INTO FREE AGENCY. RE-SIGNED DEALS MUST FIT UNDER THE ' + money(FR.CAP) + ' CAP.</div>' +
   '<div class="scroll" id="fr8r">' + (ex.length ? '<table><tr><th>POS</th><th class="n">NAME</th><th>AGE</th><th>OVR</th><th>ASKING</th><th></th><th></th></tr>' + rows + '</table>' : '<div class="note" style="padding:8px">NO EXPIRING CONTRACTS THIS YEAR.</div>') + '</div>';
 }
 function rCpu(F, O, sub) {
  const lab = { trade: 'TRADE', cut: 'CUT', walk: 'LET GO', ret: 'RETIRED', resign: 'RE-SIGNED', fa: 'SIGNED' };
  const L = (O.news || []).filter(n => n.k !== 'resign');
  const of = k => L.filter(n => n.k === k);
  const bd = t => t ? '<img alt="" src="' + badgeUrl(T(t)) + '" style="width:13px;height:15px;image-rendering:pixelated;vertical-align:middle;margin-right:5px">' : '';
  const line = n => '<div>' + bd(n.t) + (n.t2 ? '<span class="dim2">&#8644;</span> ' + bd(n.t2) : '') + '<span class="fr8tag ' + n.k + '">' + lab[n.k] + '</span>' + E(n.s) + '</div>';
  const sec = (h, ks) => { const a = ks.flatMap(of); return '<div class="fr8sec">' + h + ' (' + a.length + ')</div>' + (a.length ? a.map(line).join('') : '<div class="dim2">NONE THIS YEAR.</div>'); };
  const nT = of('trade').length, nC = of('cut').length, nW = of('walk').length;
  return head(F, sub('cpu', 'CPU MOVES'), btn('NEXT: FREE AGENCY', 'fr458', 'go:fa', 'y')) + steps('cpu') + capBar(F) +
   '<div class="note">AROUND THE LEAGUE: ' + nT + ' TRADE' + (nT === 1 ? '' : 'S') + ', ' + nC + ' CUT' + (nC === 1 ? '' : 'S') + ', ' + nW + ' LET GO. EVERYONE CUT OR LET GO IS NOW IN FREE AGENCY (' + F.fa.length + ' PLAYERS), NEXT STEP.</div>' +
   '<div class="fr8cols"><div style="flex:1.25 1 0"><div class="scroll fr8news" id="fr8c">' + sec('TRADES', [ 'trade' ]) + sec('CUTS', [ 'cut' ]) + '</div></div>' +
   '<div><div class="scroll fr8news" id="fr8c2">' + sec('LET GO: NOW FREE AGENTS', [ 'walk' ]) + sec('RETIRED', [ 'ret' ]) + '</div></div></div>';
 }
 const MULS = [ [ .9, 'ASK -10%' ], [ 1, 'ASKING' ], [ 1.15, '+15%' ], [ 1.3, '+30%' ] ];
 const intr = id => { const O = FR.get().off, b = O && O.bid && O.bid[id], a = FR.ask(id); return !b ? '<span class="dim2">NONE</span>' : b.sc > FR.offerScore(a.sal, a.yrs) ? '<span class="dn2">HOT</span>' : '<span class="up">SOME</span>'; };
 function rFa(F, O, sub) {
  const pool = F.fa.map(PP).filter(p => p && (U.pos === 'ALL' || p.pos === U.pos)).sort((a, b) => b.ovr - a.ovr);
  const sel = U.sel && F.fa.includes(U.sel) ? PP(U.sel) : null;
  let box = '<div class="box note">TAP A PLAYER TO MAKE AN OFFER. OTHER TEAMS BID TOO: THE BEST OFFER (MONEY + YEARS) WINS. HOT = A TEAM IS ALREADY OFFERING MORE THAN HIS ASKING PRICE.</div>';
  if (sel) {
   const a = FR.ask(sel.id), yrs = U.yrs || a.yrs, sal = Math.round(a.sal * U.mul / 10) * 10, b = O.bid[sel.id];
   box = '<div class="box"><div class="row" style="gap:12px"><b>' + posTag(sel) + ' ' + E(sel.n) + '</b><span>OVR ' + sel.ovr + ', AGE ' + FR.age(sel.id) + '</span><span class="note">ASKING ' + money(a.sal) + ' X ' + a.yrs + '</span><span class="note">OTHER TEAMS: ' + intr(sel.id) + '</span></div><div class="row">' +
    MULS.map(m => btn(m[1], 'fr458', 'mul:' + m[0], U.mul === m[0] ? 'on sm' : 'd sm')).join('') + '<span class="note">YEARS</span>' + [ 1, 2, 3, 4 ].map(y => btn(String(y), 'fr458', 'yrs:' + y, yrs === y ? 'on sm' : 'd sm')).join('') +
    btn('OFFER ' + money(sal) + ' X ' + yrs, 'fr458', 'offer:' + sel.id, 'y sm') + '</div></div>';
  }
  const tabs = [ 'ALL', 'A', 'M', 'FO', 'LSM', 'D', 'G' ].map(k => btn(k, 'fr458', 'pos:' + k, U.pos === k ? 'on' : 'd')).join('');
  const rows = pool.slice(0, 80).map(p => { const a = FR.ask(p.id); return '<tr data-a="fr458" data-v="sel:' + p.id + '" class="' + (sel && sel.id === p.id ? 'sel' : '') + '"><td>' + posTag(p) + '</td>' + nameTd(p) + '<td>' + FR.age(p.id) + '</td><td class="' + rc(p.ovr) + '">' + p.ovr + '</td><td>' + money(a.sal) + ' X ' + a.yrs + '</td><td>' + intr(p.id) + '</td></tr>'; }).join('');
  return head(F, sub('fa', 'FREE AGENCY'), btn('NEXT: TRADES', 'fr458', 'go:trade', 'y')) + steps('fa') + capBar(F) + msg() + box +
   '<div class="row tabs">' + tabs + '<span class="note">' + F.fa.length + ' FREE AGENTS</span></div><div class="scroll" id="fr8f"><table><tr><th>POS</th><th class="n">NAME</th><th>AGE</th><th>OVR</th><th>ASKING</th><th>OTHER TEAMS</th></tr>' + rows + '</table></div>';
 }
 function rTrade(F, O, sub) {
  const cpu = F.teams.filter(t => t !== F.team).sort((a, b) => (T(a).name < T(b).name ? -1 : 1));
  if (!U.tt || !cpu.includes(U.tt)) U.tt = cpu[0];
  const th = U.tt;
  U.give = U.give.filter(id => FR.roster(F.team).includes(id)); U.get = U.get.filter(id => FR.roster(th).includes(id));
  const ev = U.give.length && U.get.length ? FR.tradeEval(th, U.give, U.get) : null;
  const mv = U.moved || [], tbl = (ids, side) => '<table><tr><th>POS</th><th class="n">NAME</th><th>AGE</th><th>OVR</th><th>$</th></tr>' + sortIds(ids).sort((a, b) => (mv.includes(b.id) ? 1 : 0) - (mv.includes(a.id) ? 1 : 0)).map(p => '<tr data-a="fr458" data-v="' + side + ':' + p.id + '" class="' + ((side === 'g' ? U.give : U.get).includes(p.id) ? 'sel' : '') + '"><td>' + posTag(p) + '</td>' + nameTd(p, (U.moved || []).includes(p.id) ? '<span class="fr8new">' + (side === 'g' ? 'NEW' : 'TRADED') + '</span>' : '') + '<td>' + FR.age(p.id) + '</td><td class="' + rc(p.ovr) + '">' + p.ovr + '</td>' + ctCell(p.id) + '</tr>').join('') + '</table>';
  const vg = U.give.reduce((s, id) => s + FR.value(id), 0), vt = U.get.reduce((s, id) => s + FR.value(id), 0);
  const line = '<div class="row" style="gap:14px">' + (U.give.length || U.get.length ? '<span>YOU GIVE: <b>' + (U.give.map(id => E(FR.last(PP(id).n))).join(', ') || '-') + '</b></span><span>YOU GET: <b>' + (U.get.map(id => E(FR.last(PP(id).n))).join(', ') || '-') + '</b></span><span class="note">TRADE VALUE ' + vg + ' FOR ' + vt + (ev ? ev.ok ? ' - THEY LIKE IT' : ev.short ? ' - THEY WANT MORE' : '' : '') + '</span>' : '<span class="note">TAP UP TO 3 PLAYERS ON EACH SIDE. THEY ACCEPT IF THE VALUE (RATING + AGE) IS FAIR AND IT FITS THEIR CAP + ROSTER.</span>') + '<span class="sp" style="flex:1"></span>' + btn('PROPOSE TRADE', 'fr458', 'propose', 'y sm', !(U.give.length && U.get.length)) + btn('CLEAR', 'fr458', 'tclr', 'd sm') + '</div>';
  return head(F, sub('trade', 'TRADES'), btn('NEXT: DRAFT', 'fr458', 'go:draft', 'y')) + steps('trade') + capBar(F) + msg() +
   '<div class="fr8teams">' + cpu.map(t => btn(T(t).abbr || T(t).name, 'fr458', 'tt:' + t, t === th ? 'on' : 'd')).join('') + '</div>' + line +
   '<div class="fr8cols"><div><div class="fr8h">YOUR ROSTER - TAP TO OFFER</div><div class="scroll" id="fr8tg">' + tbl(FR.roster(F.team), 'g') + '</div></div><div><div class="fr8h">' + E(T(th).name) + ' - TAP TO ASK FOR (PAYROLL ' + money(FR.payroll(th)) + ')</div><div class="scroll" id="fr8tt">' + tbl(FR.roster(th), 't') + '</div></div></div>';
 }
 function rDraft(F, O, sub, y1) {
  const D = O.dr, total = D.ord.length * D.rounds, done = FR.draftDone(), turn = FR.draftTurn(), mine = turn === F.team;
  const sel = U.dsel && D.pool.includes(U.dsel) ? PP(U.dsel) : null;
  const pool = D.pool.map(PP).filter(p => p && (U.pos === 'ALL' || p.pos === U.pos)).sort((a, b) => b.ovr - a.ovr);
  const rows = pool.map(p => '<tr data-a="fr458" data-v="dsel:' + p.id + '" class="' + (sel && sel.id === p.id ? 'sel' : '') + '"><td>' + posTag(p) + '</td>' + nameTd(p) + '<td class="l">' + E(colName(D.from[p.id])) + '</td><td>' + FR.cls(FR.age(p.id)) + '</td><td class="' + rc(p.ovr) + '">' + p.ovr + '</td><td class="' + rc(FR.proProj(p.id)) + '">' + FR.proProj(p.id) + '</td></tr>').join('');
  const log = D.picks.slice().reverse().map(([ t, id, c, n ]) => '<div' + (t === F.team ? ' style="background:#5a4a12"' : '') + '><span class="dim2">' + n + '.</span> <b>' + E(T(t).abbr || T(t).name) + '</b> ' + E(PP(id).n) + ' <span class="dim2">' + PP(id).pos + ' ' + PP(id).ovr + ' - ' + E(colName(c)) + '</span></div>').join('');
  const next = []; for (let i = D.n; i < Math.min(total, D.n + 6); i++) next.push(D.ord[i % D.ord.length]);
  const myPicks = D.picks.filter(p => p[0] === F.team).length, slots = []; D.ord.forEach((t, i) => { if (t === F.team) for (let r = 0; r < D.rounds; r++) slots.push(r * D.ord.length + i + 1); });
  const st = done ? 'DRAFT COMPLETE' : 'ROUND ' + (Math.floor(D.n / D.ord.length) + 1) + '/' + D.rounds + ' - PICK ' + (D.n + 1) + '/' + total + (mine ? ' - YOU ARE ON THE CLOCK' : ' - ' + T(turn).name + ' PICKING');
  const right = done ? btn('NEXT: FINAL ROSTER', 'fr458', 'go:final', 'y') : btn(sel ? 'DRAFT ' + FR.last(sel.n) : 'DRAFT', 'fr458', 'dpick', 'y', !(mine && sel)) + btn('AUTO PICK', 'fr458', 'dauto', 'd', !mine) + btn('AUTO-DRAFT REST', 'fr458', 'dsim', 'd');
  const tabs = [ 'ALL', 'A', 'M', 'FO', 'LSM', 'D', 'G' ].map(k => btn(k, 'fr458', 'pos:' + k, U.pos === k ? 'on' : 'd')).join('');
  return head(F, sub('draft', 'DRAFT'), right) + steps('draft') + capBar(F) +
   '<div class="fr8msg' + (mine ? ' ok' : '') + '">' + E(st) + '</div><div class="note">' + y1 + ' DRAFT CLASS: THE TOP ' + total + ' COLLEGE PLAYERS IN THE GAME DECLARED. WORST RECORD PICKS FIRST. PRO OVR = HIS ROOKIE RATING. YOUR PICKS: #' + slots.join(', #') + ' (' + myPicks + ' MADE). UP NEXT: ' + next.map(t => E(T(t).abbr || T(t).name)).join(' > ') + '</div>' +
   '<div class="fr8cols"><div style="flex:1.5 1 0"><div class="row tabs">' + tabs + '<span class="note">' + D.pool.length + ' LEFT</span></div><div class="scroll" id="fr8d"><table><tr><th>POS</th><th class="n">NAME</th><th class="n">COLLEGE</th><th>CLASS</th><th>COLLEGE OVR</th><th>PRO OVR</th></tr>' + rows + '</table></div></div>' +
   '<div><div class="fr8h">PICKS</div><div class="scroll fr8news" id="fr8dl">' + (log || '<div class="dim2">NO PICKS YET.</div>') + '</div></div></div>';
 }
 function rFinal(F, O, sub, y1) {
  const ck = FR.rosterCheck(), ids = FR.roster(F.team), picks = new Set((O.dr ? O.dr.picks : []).filter(p => p[0] === F.team).map(p => p[1]));
  const was = new Set(O.start || []);
  const rows = sortIds(ids).map(p => { const d = (O.prog[p.id] || [ 0, 0 ])[1]; return '<tr><td>' + posTag(p) + '</td>' + nameTd(p, picks.has(p.id) ? '<span class="fr8new rk">ROOKIE</span>' : !was.has(p.id) ? '<span class="fr8new">NEW</span>' : '') + '<td>' + FR.age(p.id) + '</td>' + ovrCell(p, picks.has(p.id) ? 0 : d) + ctCell(p.id) + '<td>' + btn(U.cutArm === p.id ? 'TAP TO CONFIRM' : 'CUT', 'fr458', 'cut:' + p.id, U.cutArm === p.id ? 'r sm' : 'd sm') + '</td></tr>'; }).join('');
  let ovrN = 0; try { ovrN = luOvr(autoLineup(ids)); } catch (e) {}
  return head(F, sub('final', 'FINAL ROSTER') + '  -  TEAM OVR ' + ovrN, (ids.length < FR.RMIN ? btn('AUTO-SIGN TO ' + FR.RMIN, 'fr458', 'fill', 'd') : '') + btn('START ' + y1 + ' SEASON', 'fr458', 'start', 'y', !ck.ok)) + steps('final') + capBar(F) +
   (ck.ok ? '<div class="fr8msg ok">ROSTER IS SET. ' + ids.length + ' PLAYERS, ' + money(FR.CAP - FR.payroll(F.team)) + ' UNDER THE CAP. READY FOR ' + y1 + '.</div>' : '<div class="fr8msg bad">' + E(ck.why) + '</div>') + msg() +
   '<div class="scroll" id="fr8z"><table><tr><th>POS</th><th class="n">NAME</th><th>AGE</th><th>OVR</th><th>CONTRACT</th><th></th></tr>' + rows + '</table></div>';
 }

 // ---------- panel actions ----------
 function scrollKeep(fn) {
  const keep = {}; document.querySelectorAll('#panel .scroll[id^="fr8"]').forEach(n => keep[n.id] = n.scrollTop);
  const r = fn();
  const put = () => { for (const k in keep) { const n = document.getElementById(k); if (n) n.scrollTop = keep[k]; } };
  setTimeout(put, 0); setTimeout(put, 50); setTimeout(put, 140);
  return r;
 }
 function go(step) {
  const F = FR.get(), O = F.off;
  if (!O) return;
  const i0 = STEPS.findIndex(s => s[0] === O.step), i1 = STEPS.findIndex(s => s[0] === step);
  if (i1 !== i0 + 1) return;
  U.msg = null; U.ok = null; U.sel = null; U.dsel = null; U.give = []; U.get = []; U.pos = 'ALL'; U.cutArm = null;
  if (step === 'cpu' && O.step === 'resign') { if (O.expMine.some(id => O.rs[id] == null)) return; FR.resignDone(); FR.cpuMoves(); }
  if (step === 'trade' && O.step === 'fa') FR.faFinish();
  if (step === 'draft' && O.step === 'trade') { FR.draftStart(); FR.draftCpu(true); }
  if (step === 'final' && O.step === 'draft') { if (!FR.draftDone()) return; FR.cpuCutdown(); }
  if (step === 'resign' && O.step === 'age') O.start = FR.roster(F.team);
  O.step = step;
  FR.save();
 }
 PANEL_SCREENS.push('fr458');
 PANEL_RENDER.fr458 = function () { try { return render(); } catch (e) { console.error(e); return '<div class="hd"><div class="tt">PRO FRANCHISE</div><div class="sp"></div>' + btn('MENU', 'fr458', 'menu', 'g') + '</div>'; } };
 PANEL_ACT.fr458 = function (v) {
  const F = FR.get(); if (!F) { screen = 'menu'; return; }
  const [ k, a, b ] = String(v).split(':'), O = F.off;
  if (k === 'menu') { screen = 'menu'; return; }
  if (!O) return;
  return scrollKeep(() => {
   if (k === 'go') return go(a);
   if (k === 'rs') { const r = FR.resign(a, b === '1'); if (!r.ok) say(r.why || 'CAN\'T DO THAT', false); else U.msg = null; FR.save(); return; }
   if (k === 'pos') { U.pos = a; return; }
   if (k === 'sel') { U.sel = a; U.mul = 1; U.yrs = null; return; }
   if (k === 'mul') { U.mul = +a; return; }
   if (k === 'yrs') { U.yrs = +a; return; }
   if (k === 'offer') { const s = FR.ask(a), r = FR.faOffer(a, Math.round(s.sal * U.mul / 10) * 10, U.yrs || s.yrs); say(r.why, !!r.ok); if (r.ok || r.lost) U.sel = null; FR.save(); return; }
   if (k === 'tt') { U.tt = a; U.get = []; U.msg = null; U.moved = []; return; }
   if (k === 'g' || k === 't') { U.moved = []; const L = k === 'g' ? U.give : U.get, i = L.indexOf(a); if (i >= 0) L.splice(i, 1); else if (L.length < 3) L.push(a); U.msg = null; return; }
   if (k === 'tclr') { U.give = []; U.get = []; U.msg = null; return; }
   if (k === 'propose') { const r = FR.trade(U.tt, U.give, U.get); say(r.why, !!r.ok); if (r.ok) { U.moved = U.give.concat(U.get); U.give = []; U.get = []; } return; }
   if (k === 'dsel') { U.dsel = a; return; }
   if (k === 'dpick' || k === 'dauto') { const D = O.dr; if (FR.draftTurn() !== F.team) return; const id = k === 'dauto' ? FR.cpuPickFor(F.team) : U.dsel; if (!id || !D.pool.includes(id)) return; FR.draftPick(F.team, id); U.dsel = null; FR.draftCpu(true); FR.save(); return; }
   if (k === 'dsim') { FR.draftCpu(false); FR.save(); return; }
   if (k === 'cut') { if (U.cutArm !== a) { U.cutArm = a; return; } U.cutArm = null; const p = PP(a); FR.cut(a); say((p ? p.n : 'PLAYER') + ' WAS CUT. HE IS A FREE AGENT NOW.', null); FR.save(); return; }
   if (k === 'fill') { const r = FR.autoFill(); if (r && !r.ok) say(r.why, false); FR.save(); return; }
   if (k === 'start') { const r = FR.finishOffseason(); if (!r.ok) { say(r.why, false); return; } startNext(); return; }
  });
 };

 // ---------- seasons ----------
 function lineupsFor(S, F, prevLu) {
  S.lineups = {};
  for (const t of S.teams) S.lineups[t] = autoLineup(S.rosters[t]);
  try { if (prevLu && lineupValid(prevLu, S.rosters[F.team])) S.lineups[F.team] = prevLu; } catch (e) {}
 }
 function applyFr(S, F, opts) {
  S.fr458 = F.id; S.frYr458 = F.yr; S.year = F.year; S.base232 = true; delete S.draft; delete S.draftLog; S.phase = 'reg';
  if (opts && opts.build) {
   const others = F.teams.filter(t => t !== F.team).sort(() => Math.random() - .5), ids = [ F.team ].concat(others);
   const rounds = window.V232 && V232.schedule ? V232.schedule(ids) : S.rounds, table = {};
   ids.forEach(i => table[i] = { w: 0, l: 0, gf: 0, ga: 0 });
   Object.assign(S, { teams: ids, rounds: rounds, table: table, week: 0, results: [], playoff: null, champ: null });
   if (F.lg && F.lg !== 'ALL') S.lg232 = F.lg; if (F.na) S.na232 = true;
  }
  S.rosters = FR.seasonRosters();
  lineupsFor(S, F, opts && opts.lu);
 }
 const MS = window.makeSeason;
 window.makeSeason = function (teamId) {
  if (OFF()) return MS.apply(this, arguments);
  const build = !!window.__fr458build, fresh = !build && mode() === 'fr' && window.__fr458new === true;
  if (!build && !fresh) return MS.apply(this, arguments);
  const SET = window.V232 && V232.SET, b0 = SET ? SET.base : null;
  if (SET) SET.base = true;
  let S;
  try { S = MS.apply(this, arguments); } finally { if (SET) SET.base = b0; }
  if (!S) return S;
  try {
   if (fresh) { window.__fr458new = false; FR.newFranchise(teamId, { teams: S.teams, lg: S.lg232 || 'ALL', na: !!S.na232, year: S.year }); }
   applyFr(S, FR.get(), { build: build, lu: build ? window.__fr458lu : null });
  } catch (e) { console.error(e); }
  return S;
 };
 function startNext() {
  const F = FR.get(), prev = season && isFr(season) ? season : F.cur;
  const lu = prev && prev.lineups ? prev.lineups[F.team] : null;
  window.__fr458build = true; window.__fr458lu = lu;
  let S;
  try { S = makeSeason(F.team); } finally { window.__fr458build = false; window.__fr458lu = null; }
  if (!S) return;
  if (F.diff != null) S.diff2503 = F.diff;
  if (prev) { if (prev.hc17) S.hc17 = prev.hc17; if (prev.coach) S.coach = prev.coach; if (prev.items232 != null) S.items232 = prev.items232; }
  if (window.V17 && !S.hc17) S.hc17need = 1;
  season = S; F.cur = S;
  LS.set('season', S); FR.save();
  seasonTab = 0; screen = 'season'; panelDirty();
 }
 function continueFr() {
  const F = FR.get(); if (!F) return;
  if (!isFr(season) && F.cur && F.cur.fr458 === F.id) { try { if (season && typeof szArchPush2314 === 'function') szArchPush2314(season); } catch (e) {} season = F.cur; LS.set('season', season); }
  if (F.off) { screen = 'fr458'; panelDirty(); return; }
  if (isFr(season)) { screen = 'season'; panelDirty(); return; }
  // nothing to resume: start this year's season from the saved rosters
  startNext();
 }
 // mirror the live franchise season into the franchise save, so starting a one-off season never loses it
 { const set0 = LS.set; let sig0 = ''; LS.set = function (k, v) { const r = set0.apply(this, arguments); try { if (k === 'season' && !OFF() && v && v.fr458) { const F = FR.get(); if (F && v.fr458 === F.id) { const P0 = v.playoff, sig = [ v.fr458, v.year, v.week, v.phase, (v.results || []).length, P0 ? P0.round + (P0.results || []).length : '', v.diff2503, v.hc17 ? 1 : 0, v.lineups ? JSON.stringify(v.lineups[v.team] || '').length : 0, v.stats ? Object.keys(v.stats).length : 0, v.champ ].join('|'); F.cur = v; if (v.diff2503 != null) F.diff = v.diff2503; if (sig !== sig0) { sig0 = sig; FR.saveSoon(); } } } } catch (e) {} return r; }; }

 // ---------- title cards + saved-season archive: map franchise copies back to the real players ----------
 const baseIds = ids => (ids || []).map(id => { const p = PP(id); return p && p.fr458 !== undefined ? p.fr458 : id; }).filter(id => id && PLAYERS[id] && PLAYERS[id].fr458 === undefined);
 const mapLu = lu => { if (!lu) return lu; const f = id => { const p = PP(id); return p && p.fr458 !== undefined ? p.fr458 : id; }; const o = {}; for (const k in lu) o[k] = Array.isArray(lu[k]) ? lu[k].map(f) : f(lu[k]); return o; };
 function withBase(S, fn) {
  if (!S || !S.fr458 || !S.rosters || !S.rosters[S.team]) return fn();
  const r0 = S.rosters[S.team], l0 = S.lineups && S.lineups[S.team];
  S.rosters[S.team] = baseIds(r0); if (l0) S.lineups[S.team] = mapLu(l0);
  try { return fn(); } finally { S.rosters[S.team] = r0; if (l0) S.lineups[S.team] = l0; }
 }
 if (window.V22 && typeof V22.titleCheck === 'function') { const tc = V22.titleCheck; V22.titleCheck = function (Sz) { const a = arguments; return withBase(Sz, () => tc.apply(this, a)); }; }
 if (typeof window.szArchPush2314 === 'function') { const ap = window.szArchPush2314; window.szArchPush2314 = function (S) { const a = arguments; return withBase(S, () => ap.apply(this, a)); }; }

 // ---------- the season hub: OFFSEASON button, SIM button, banner wall ----------
 function simMine(S) {
  const nx = nextSeasonGame(S); if (!nx) return;
  if (nx.opp === 'BYE') { simWeekOthers(S); advanceWeek(S); LS.set('season', S); return; }
  const [ a, b ] = simScore(S.team, nx.opp);
  if (S.phase === 'reg') {
   applyResult(S, S.team, nx.opp, a, b); S.results.push([ S.team, nx.opp, a, b, 'WK ' + (S.week + 1) ]); simWeekOthers(S); advanceWeek(S);
  } else if (S.phase === 'playoff') {
   const P = S.playoff, gm = P.games.find(x => x.includes(S.team)); if (!gm) return;
   const wasFinal = P.round === 'final', win = a > b;
   P.results.push([ S.team, nx.opp, a, b, PO_LABEL[P.round] ]);
   playoffAdvance(S, [ { g: gm, w: win ? S.team : nx.opp } ]);
   if (!win) { S.elim = true; simPlayoffsRest(S); } else if (wasFinal && !(window.V33 && V33.np(S))) LS.set('titles', LS.get('titles', 0) + 1);
  }
  LS.set('season', S);
 }
 function goOff() { const F = FR.get(); if (!F) return; if (!F.off && isFr(season) && season.phase === 'done') FR.endSeason(season); if (FR.get().off) { U.msg = null; screen = 'fr458'; panelDirty(); } }
 function trophy(x, y, c) { rect(x, y, 7, 1, c); rect(x + 1, y + 1, 5, 3, c); rect(x, y + 1, 1, 2, c); rect(x + 6, y + 1, 1, 2, c); rect(x + 3, y + 4, 1, 2, c); rect(x + 1, y + 6, 5, 1, c); }
 const DS = window.drawSeason;
 window.drawSeason = function () {
  const S = typeof season !== 'undefined' ? season : null;
  if (OFF() || !isFr(S)) return DS.apply(this, arguments);
  const B = window.button, F = FR.get();
  window.button = function (label, x, y, w, h, fn, opt) {
   if (label === 'NEW SEASON') return B.call(this, 'OFFSEASON', x, y, w, h, goOff, Object.assign({}, opt, { bg: '#ffd23a' }));
   const r = B.apply(this, arguments);
   if (label === 'PLAY' && screen === 'season' && S.phase !== 'done') B.call(this, 'SIM', x + w + 4, y + 3, 28, 14, () => simMine(S), { bg: '#c9d6d9' });
   return r;
  };
  try { DS.apply(this, arguments); } finally { window.button = B; }
  try {
   if (screen !== 'season') return;
   const y = H - 18;
   let x = 8;
   text('FRANCHISE YEAR ' + F.yr, x, y + 2, 1, '#8fe3f0'); x += textW('FRANCHISE YEAR ' + F.yr) + 8;
   const tl = F.titles.slice(); if (S.phase === 'done' && S.champ === F.team && !tl.includes(S.year)) tl.push(S.year);
   for (const yr of tl.sort()) { trophy(x, y, '#ffd23a'); text(String(yr), x + 9, y + 2, 1, '#ffe14d'); x += 9 + textW(String(yr)) + 6; }
   if (!tl.length) text('NO TITLES YET', x, y + 2, 1, '#56707c');
  } catch (e) { console.error(e); }
 };

 // the roster panel calls a franchise roster what it is
 { const RR = PANEL_RENDER.roster; if (typeof RR === 'function') PANEL_RENDER.roster = function () { const h = RR.apply(this, arguments); try { if (!OFF() && isFr(season) && PS.rosterSrc === 'season' && PS.rosterTeam === season.team) {
    const F = FR.get(), L = F.lastOff && F.lastOff.y === F.year - 1 ? F.lastOff : null;
    let o = h.replace('YOUR DRAFTED SEASON ROSTER', 'YOUR FRANCHISE ROSTER (YEAR ' + F.yr + ')');
    if (L) {
     const rk = new Set((L.picks || []).filter(p => p[0] === F.team).map(p => p[1])), nw = new Set(L.add || []);
     const d = document.createElement('div'); d.innerHTML = o;
     d.querySelectorAll('tr[data-pid]').forEach(tr => { const id = tr.getAttribute('data-pid'), td = tr.querySelector('td.n'); if (!td) return; if (rk.has(id)) td.insertAdjacentHTML('beforeend', '<span class="fr8new rk">ROOKIE</span>'); else if (nw.has(id)) td.insertAdjacentHTML('beforeend', '<span class="fr8new">NEW</span>'); });
     o = d.innerHTML;
    }
    return o;
   } } catch (e) {} return h; }; }

 // ---------- setup panel: PRO FRANCHISE (default) or ONE SEASON (the old fantasy draft / base teams) ----------
 const RS = PANEL_RENDER.seasonSetup;
 PANEL_RENDER.seasonSetup = function () {
  const h = RS.apply(this, arguments);
  if (OFF() || NOFR()) return h;
  try {
   const d = document.createElement('div'); d.innerHTML = h;
   const m = mode(), F = FR.get();
   const row = document.createElement('div'); row.className = 'row'; row.id = 'fr458m';
   row.innerHTML = btn('PRO FRANCHISE', 'fr458set', 'fr', m === 'fr' ? 'y' : 'd') + btn('ONE SEASON', 'fr458set', 'one', m === 'one' ? 'y' : 'd') + '<span class="note" style="align-self:center">' + (m === 'fr' ? 'SAME TEAM YEAR AFTER YEAR' : 'ONE SEASON: FANTASY DRAFT OR BASE TEAMS') + '</span>';
   const hd = d.querySelector('.hd'), note0 = d.querySelector('#ss232note') || hd;
   note0.insertAdjacentElement('afterend', row);
   if (m === 'fr') {
    const tt = d.querySelector('.hd .tt'); if (tt) tt.textContent = tt.textContent.replace(/^NEW SEASON/, 'PRO FRANCHISE').replace(/ SEASON$/, ' LEAGUE');
    const dr = d.querySelector('#ss232dr');
    if (dr) { const nx = dr.nextElementSibling; if (nx && nx.classList.contains('note')) nx.remove(); dr.remove(); }
    const info = document.createElement('div'); info.className = 'note';
    info.textContent = 'EVERY TEAM USES ITS REAL ROSTER. PLAY THE SEASON + PLAYOFFS, THEN RUN THE OFFSEASON: RE-SIGN YOUR PLAYERS, WATCH CPU TRADES + CUTS, BID IN FREE AGENCY, MAKE TRADES, AND DRAFT THE TOP REAL COLLEGE PLAYERS. PLAYERS AGE, IMPROVE, DECLINE AND RETIRE. ' + money(FR.CAP) + ' SALARY CAP. PLAY AS MANY YEARS AS YOU WANT.';
    row.insertAdjacentElement('afterend', info);
    let at = info;
    if (F) {
     const h0 = F.hist[F.hist.length - 1];
     const box = document.createElement('div'); box.className = 'row'; box.id = 'fr458cont';
     box.innerHTML = '<span class="box" style="flex:1 1 auto"><b>YOUR FRANCHISE: ' + E(T(F.team).name) + '</b> - YEAR ' + F.yr + ' (' + (F.off ? F.off.y0 + ' OFFSEASON' : F.year + ' SEASON') + ')' + (h0 ? ' - LAST YEAR ' + h0.w + '-' + h0.l : '') + ' - ' + F.titles.length + ' TITLE' + (F.titles.length === 1 ? '' : 'S') + ' ' + banners(F) + '</span>' + btn('CONTINUE FRANCHISE', 'fr458cont', null, 'y');
     info.insertAdjacentElement('afterend', box); at = box;
    }
    const go = d.querySelector('[data-a="league"]');
    if (go) { go.setAttribute('data-a', 'fr458go'); const lab = F ? (U.arm ? 'TAP AGAIN: THIS REPLACES YOUR ' + T(F.team).name + ' FRANCHISE' : 'START A NEW FRANCHISE - PICK YOUR TEAM') : 'START FRANCHISE - PICK YOUR TEAM'; go.textContent = lab; go.setAttribute('aria-label', lab); if (U.arm) go.className = 'r'; }
   }
   return d.innerHTML;
  } catch (e) { console.error(e); return h; }
 };
 PANEL_ACT.fr458set = function (v) { LS.set(SETK, { m: v === 'one' ? 'one' : 'fr' }); U.arm = 0; tap(); };
 PANEL_ACT.fr458cont = function () { U.arm = 0; continueFr(); };
 PANEL_ACT.fr458go = function () {
  if (FR.get() && !U.arm) { U.arm = 1; return; }
  U.arm = 0; window.__fr458new = true;
  return PANEL_ACT.league('ALL');
 };
 // leaving the team pick without picking: no franchise starts by accident later
 { const sw = () => { if (window.__fr458new && screen !== 'pickTeam' && screen !== 'seasonSetup' && typeof screen !== 'undefined') window.__fr458new = false; }; setInterval(() => { try { sw(); } catch (e) {} }, 1000); }

 window.FR458UI = { render: render, go: go, startNext: startNext, continueFr: continueFr, simMine: simMine, goOff: goOff, U: U, mode: mode, isFr: isFr };
})();
