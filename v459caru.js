'use strict';
// v459caru: CAREER MODE screens (create, hub, signing day, draft night, contracts, world call-up, career card)
// + the CAREER button on the play menu + the in-game hooks (final screen, JUST ME control).
// v2 (Nov 9): FROM (heritage) picker, title-card flip after a college/pro title, HS team rename, no Ultimate stage, CAREER final card.
// Kill switch: window.__rl_no459car = true. Storage: see v459car.js (rl_car459, rl_car459h, rl_car459fr).
(function () {
 const CA = window.CAR459;
 if (!CA || !CA.on || CA.OFF()) return;
 const ME = CA.ME;
 const E = s => (typeof esc === 'function' ? esc(s) : String(s));
 const P = id => (typeof PP === 'function' ? PP(id) : PLAYERS[id]);
 const U = { v: null, f: null, msg: null, ok: null, dr: 0, drT: 0, tab: 'game', fa: false, cty: false, pick: null, flipBack: false };
 const DCOL = [ '#7dff7a', '#8fe3f0', '#ffd23a', '#ffb14d', '#ff8a5a', '#ff5a4a' ];
 const SKC = [ '#f0c090', '#dcac78', '#c48a56', '#a26a3e', '#7e4f2f', '#664029' ];
 const SKN = [ 'LIGHT', 'LIGHT-MED', 'MEDIUM', 'MED-DARK', 'DARK', 'DEEP' ];
 const POSN = { A: 'ATTACK', M: 'MIDFIELD', FO: 'FACEOFF', LSM: 'LONG STICK MID', D: 'DEFENSE', G: 'GOALIE' };
 const money = k => window.FR458 ? FR458.money(k) : '$' + k + 'K';

 // ---------- styles ----------
 try {
  const st = document.createElement('style');
  st.id = 'car459css';
  st.textContent = [
   '#panel .c9wrap{display:flex;gap:10px;flex:1 1 auto;min-height:0}',
   '#panel .c9side{flex:0 0 150px;display:flex;flex-direction:column;align-items:center;gap:6px}',
   '#panel .c9main{flex:1 1 auto;display:flex;flex-direction:column;gap:5px;min-width:0;min-height:0}',
   '#panel .c9card{position:relative;width:146px;height:206px;box-sizing:border-box;border-radius:8px;padding:6px 6px 5px;display:flex;flex-direction:column;align-items:center;border:3px solid var(--c);background:var(--bg);box-shadow:0 3px 0 #000,0 0 14px var(--gl,transparent);overflow:hidden}',
   '#panel .c9card .lv{font-size:9px;letter-spacing:1px;color:var(--c);width:100%;display:flex;justify-content:space-between}',
   '#panel .c9card .art{width:92px;height:92px;margin-top:3px;background:radial-gradient(circle,#2a3a46,#0d141a 70%);border:1px solid #05080b;border-radius:3px;display:flex;align-items:center;justify-content:center}',
   '#panel .c9card .art img{width:88px;height:88px;image-rendering:pixelated}',
   '#panel .c9card .ov{position:absolute;left:8px;top:22px;font-size:20px;color:#fff;text-shadow:2px 2px 0 #000;line-height:1}',
   '#panel .c9card .ov small{display:block;font-size:9px;color:var(--c)}',
   '#panel .c9card .no{position:absolute;right:8px;top:22px;font-size:14px;color:#fff;text-shadow:2px 2px 0 #000}',
   '#panel .c9card .nm{margin-top:4px;font-size:11px;color:#fff;text-align:center;line-height:1.1;max-width:132px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
   '#panel .c9card .ps{font-size:9px;color:#cfe;margin-top:1px}',
   '#panel .c9card .rr{margin-top:auto;font-size:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#0b1a20;background:var(--c);padding:2px 6px;border-radius:2px;width:100%;box-sizing:border-box;text-align:center}',
   '#panel .c9card .stp{position:absolute;right:-3px;top:86px;transform:rotate(-14deg);border:2px solid var(--dc);color:var(--dc);font-size:8px;padding:1px 4px;border-radius:3px;background:rgba(0,0,0,.55);letter-spacing:1px}',
   '#panel .c9card .ctl{font-size:8px;color:#8fe3f0;margin-top:2px}',
   '#panel .c9card .c9wins{flex:0 0 auto;font-size:8px;color:#ffe066;margin-top:2px;text-align:center;line-height:10px;max-width:134px;max-height:20px;overflow:hidden;word-break:break-word}',
   '#panel .c9card .c9wins.none{color:#7f9aa6}',
   '#panel .c9card .c9rec{font-weight:normal;color:#fff}',
   '#panel .c9card.t-final .lv span:first-child{background:var(--c);color:#03241f;padding:0 3px;border-radius:2px}',
   '#panel .c9pick{position:absolute;inset:0;background:rgba(4,8,12,.94);display:flex;flex-direction:column;gap:6px;padding:8px 10px;z-index:6;box-sizing:border-box}',
   '#panel .c9pick .grid{display:flex;flex-wrap:wrap;gap:4px;overflow-y:auto;min-height:0;align-content:flex-start}',
   '#panel .c9pick .grid button{flex:0 0 calc(20% - 4px);display:flex;align-items:center;gap:5px;min-height:30px;padding:3px 5px;font-size:9px;text-align:left;box-sizing:border-box}',
   '#panel .c9pick .grid button img,#panel .c9from img{width:18px;height:21px;image-rendering:pixelated;flex:0 0 auto}',
   '#panel .c9from{display:inline-flex;align-items:center;gap:5px}',
   '#panel table.c9ren{width:auto}#panel .c9ren td{padding:2px 6px}#panel .c9ren input{min-height:24px;padding:3px 5px;box-sizing:border-box}',
   '#panel .c9flip{background:linear-gradient(90deg,#5a4a12,#14222c);border:1px solid #ffe14d}',
   '#panel .c9card.glow{animation:c9g 1.8s ease-in-out infinite}',
   '@keyframes c9g{0%,100%{box-shadow:0 3px 0 #000,0 0 8px var(--gl)}50%{box-shadow:0 3px 0 #000,0 0 22px var(--gl)}}',
   '#panel .c9card.shine::after{content:"";position:absolute;inset:-40%;background:linear-gradient(115deg,transparent 40%,rgba(255,255,255,.28) 50%,transparent 60%);animation:c9s 2.6s linear infinite;pointer-events:none}',
   '@keyframes c9s{0%{transform:translateX(-60%)}100%{transform:translateX(60%)}}',
   '#panel .c9card.gross{background:linear-gradient(135deg,#0c3a12,#3f7a0a 40%,#0d2a08);--c:#b6ff3a;--gl:#b6ff3a}',
   '#panel .c9card.gross .rr{background:linear-gradient(90deg,#b6ff3a,#7dff7a,#e9ff7a,#b6ff3a);background-size:200% 100%;animation:c9r 2s linear infinite}',
   '@keyframes c9r{0%{background-position:0 0}100%{background-position:200% 0}}',
   '#panel .c9xp{width:146px;height:7px;background:#22313d;border-radius:2px;overflow:hidden}#panel .c9xp i{display:block;height:100%;background:#7dff7a}',
   '#panel .c9sm{font-size:9px;color:#7f9aa6;text-align:center}',
   '#panel .c9next{display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
   '#panel .c9next img{width:26px;height:30px;image-rendering:pixelated}',
   '#panel .c9vs{font-size:13px;color:#fff}#panel .c9vs small{display:block;font-size:9px;color:#8fe3f0}',
   '#panel .c9line{font-size:10px;color:#cfe}#panel .c9line b{color:#ffe14d}',
   '#panel .c9res{padding:4px 8px;border-radius:3px;background:#14222c;font-size:10px;color:#e8f4f6}#panel .c9res.w{background:#1f5a2a}#panel .c9res.l{background:#5a1f1f}',
   '#panel .c9up{color:#7dff7a}',
   '#panel .c9form{display:flex;flex-direction:column;gap:5px;min-height:0;overflow-y:auto}',
   '#panel .c9form .row{gap:4px}#panel .c9form .lab{flex:0 0 72px;font-size:10px;color:#7f9aa6}',
   '#panel .c9form button{padding:5px 7px;min-height:26px}',
   '#panel .c9form input{flex:0 1 auto;min-height:26px;padding:4px 6px}',
   '#panel .c9sw{width:22px;height:22px;padding:0!important;min-height:22px!important;border:2px solid #0b1a20}#panel .c9sw.on{outline:2px solid #ffe14d;border-color:#fff}',
   '#panel .c9offers{display:flex;gap:6px;flex-wrap:wrap;align-content:flex-start;overflow-y:auto;min-height:0}',
   '#panel .c9off{flex:1 1 150px;max-width:200px;display:flex;flex-direction:column;gap:3px;align-items:flex-start;padding:6px;background:#14222c;border:1px solid #22313d;border-radius:4px}',
   '#panel .c9off .hdr{display:flex;gap:6px;align-items:center}#panel .c9off img{width:22px;height:26px;image-rendering:pixelated}',
   '#panel .c9off .t{font-size:11px;color:#fff}#panel .c9off .d{font-size:9px;color:#8fe3f0}',
   '#panel .c9stars{font-size:22px;color:#ffe14d;letter-spacing:3px;text-shadow:2px 2px 0 #000}#panel .c9stars i{color:#2a3a46;font-style:normal}',
   '#panel .c9night{display:flex;flex-direction:column;gap:6px;flex:1 1 auto;min-height:0;margin:-6px -8px -34px;padding:6px 8px 34px;background:radial-gradient(ellipse at 50% 18%,rgba(120,150,210,.45),rgba(8,10,18,0) 55%),repeating-linear-gradient(90deg,rgba(255,255,255,.02) 0 2px,transparent 2px 24px)}',
   '#panel .c9dn{display:flex;gap:10px;flex:1 1 auto;min-height:0}',
   '#panel .c9tick{flex:0 0 250px;display:flex;flex-direction:column;min-height:0}',
   '#panel .c9tick .scroll div{padding:3px 6px;border-top:1px solid #16222b;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
   '#panel .c9tick .scroll div.me{background:#5a4a12;color:#ffe14d}',
   '#panel .c9stage{flex:1 1 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;text-align:center}',
   '#panel .c9pod{font-size:10px;color:#8fe3f0;letter-spacing:2px}',
   '#panel .c9call{font-size:15px;color:#fff;line-height:1.3;max-width:420px}#panel .c9call b{color:#ffe14d}',
   '#panel .c9name{font-size:26px;color:#ffe14d;text-shadow:3px 3px 0 #000;letter-spacing:1px}',
   '#panel .c9pop{position:absolute;inset:0;background:rgba(4,8,12,.9);display:flex;align-items:center;justify-content:center;gap:18px;z-index:5}',
   '#panel .c9pop .tx{display:flex;flex-direction:column;gap:6px;align-items:flex-start;max-width:330px}',
   '#panel .c9arrow{font-size:20px;color:#ffe14d}',
   '#panel .c9mini{transform:scale(.62);transform-origin:center;margin:-40px -28px}',
   '#panel .c9hall{display:flex;gap:4px;flex-wrap:wrap}',
   '#panel table.c9t td,#panel table.c9t th{padding:2px 4px;font-size:10px}'
  ].join('');
  document.head.appendChild(st);
 } catch (e) {}

 // ---------- the career card ----------
 const TIERS = { hs: 0, col: 1, pro: 2, world: 3, ult: 4, final: 5 };
 function artFor(pid, tid) {
  const h = CA.hsTeam(tid), had = h && SZ_REG[tid];
  try { if (h && !had) SZ_REG[tid] = CA.hsObj(tid); return window.V22 && V22.artUrl ? V22.artUrl(pid, tid) : ''; } catch (e) { console.error(e); return ''; } finally { if (h && !had) delete SZ_REG[tid]; }
 }
 function badge(tid) { try { const o = CA.tobj(tid); return badgeUrl(o); } catch (e) { return ''; } }
 // o: { n, num, pos, ovr, skin, lvl ('hs'..'ult' | 'final'), diff, ctl, team, title, tier, pid }
 function cardHtml(o) {
  const lv = o.lvl, K = CA.CARD[lv] || CA.CARD.hs;
  const fin = o.lvl === 'final';
  const c = K.c, bg = K.bg;
  const cls = 'c9card' + (fin ? ' t-final shine glow' : lv === 'ult' || lv === 'world' ? ' shine' : '');
  const dn = CA.DIFFN(o.diff | 0);
  const rar = fin ? (o.title || dn + ' CAREER') : K.rar;
  return '<div class="' + cls + '" style="--c:' + c + ';--bg:' + (bg || 'none') + ';--gl:' + c + ';--dc:' + DCOL[o.diff | 0] + '" aria-label="' + E(o.n + ' career card - ' + rar) + '">' +
   '<div class="lv"><span>' + E(fin ? 'CAREER' : K.nm) + '</span><span>' + E(o.team ? CA.tabbr(o.team) : '') + '</span></div>' +
   '<div class="art"><img alt="" src="' + artFor(o.pid || ME, o.team) + '"></div>' +
   '<div class="ov">' + o.ovr + '<small>OVR</small></div><div class="no">#' + o.num + '</div>' +
   '<div class="nm">' + E(String(o.n).toUpperCase()) + '</div><div class="ps">' + E(POSN[o.pos] || o.pos) + '</div>' +
   '<div class="ctl">' + (o.rec ? '<b class="c9rec">' + E(o.rec) + '</b> - ' : '') + '' + '</div>' + (o.wins != null ? '<div class="c9wins' + (o.wins ? '' : ' none') + '">' + (o.wins ? '&#9733; ' + E(o.wins) : 'NO TITLES YET') + '</div>' : '') +
   '<div class="stp">' + E(dn) + '</div>' +
   '<div class="rr">' + E(rar) + '</div></div>';
 }
 // the card face shows his WINS (titles + record), not where he is from (heritage only matters for the World Games call-up)
 const TABB = [ [ /^STATE CHAMPS/, 'STATE' ], [ /^NATIONAL CHAMPS/, 'NATTY' ], [ /^PRO CHAMPS/, 'PRO' ], [ /^WORLD (GAMES )?GOLD/, 'WORLD GOLD' ], [ /^ULTIMATE CHAMPS/, 'ULT' ], [ /^ONLINE SEASON CHAMPS/, 'ONLINE' ], [ /^SEASON CHAMPS/, 'SEASON' ] ];
 function winsShort(titles) {
  const n = {}, ord = [];
  for (const x of Array.isArray(titles) ? titles : []) { const s = String(x && typeof x === 'object' ? x.nm || '' : x || '').toUpperCase(); if (!s) continue; let k = null; for (const [ re, a ] of TABB) if (re.test(s)) { k = a; break; } if (!k) k = s.replace(/\s*\(.*$/, '').replace(/\s*\d{4}$/, '').slice(0, 12); if (!(k in n)) { n[k] = 0; ord.push(k); } n[k]++; }
  // each win stays on one line (no "PRO / X2" split); the card wraps between wins
  const nb = x => x.replace(/ /g, '\u00a0');
  let s = ord.map(k => nb(k + (n[k] > 1 ? ' X' + n[k] : ''))).join(' - ');
  // two short lines on the card at most: a long list tightens up, a huge one becomes a count
  if (s.length > 40) s = ord.map(k => nb((k === 'WORLD GOLD' ? 'GOLD' : k) + (n[k] > 1 ? ' X' + n[k] : ''))).join(' ');
  if (s.length > 40) { let c = 0; for (const k of ord) c += n[k]; s = c + ' TITLES' + (n['WORLD GOLD'] ? ' - WORLD GOLD' : ''); }
  return s;
 }
 const recShort = t => t && (t.w | 0) + (t.l | 0) > 0 ? (t.w | 0) + '-' + (t.l | 0) : '';
 function myCard(lvlOverride, team) {
  const C = CA.get(), p = P(ME);
  let tot = null; try { tot = CA.totals(); } catch (e) {}
  return cardHtml({ wins: winsShort(C.titles), rec: recShort(tot), n: C.me.n, num: C.me.num, pos: C.me.pos, ovr: p ? p.ovr : 0, skin: C.me.skin, lvl: lvlOverride || C.card, diff: C.diff, ctl: C.ctl, team: team || C.team, title: C.final && C.final.title, pid: artPid() });
 }
 function artPid() { const C = CA.get(); const id = 'CAR459-ART-' + C.id + '-' + C.me.skin; if (!PLAYERS[id] || PLAYERS[id] !== PLAYERS[ME]) PLAYERS[id] = PLAYERS[ME]; return id; }
 function xpBar() { const m = CA.get().me, need = CA.xpNeed(m.lv); return '<div class="c9xp" title="EXP"><i style="width:' + Math.min(100, m.xp / need * 100).toFixed(0) + '%"></i></div><div class="c9sm">LEVEL ' + m.lv + ' - ' + m.xp + '/' + need + ' EXP - AGE ' + m.age + '</div>'; }
 function side() { return '<div class="c9side">' + myCard() + xpBar() + '</div>'; }
 const btn9 = (label, v, cls, dis) => btn(label, 'car459', v, cls, dis);
 function head(sub, right) {
  const C = CA.get(), t = C && C.team ? CA.tobj(C.team) : null;
  if (!t) return '<div class="hd"><div><div class="tt">CAREER MODE</div><div class="st">' + E(sub) + '</div></div><div class="sp"></div>' + (right || '') + btn9('MENU', 'menu', 'g') + '</div>';
  return teamHead(t, sub, (right || '') + btn9('MENU', 'menu', 'g'));
 }
 const msg = () => U.msg ? '<div class="c9res ' + (U.ok === true ? 'w' : U.ok === false ? 'l' : '') + '">' + E(U.msg) + '</div>' : '';
 function statLine(s, pos) {
  if (!s) return '';
  const parts = [ s.gp + ' GP' ];
  if (pos === 'G') parts.push(s.sv + ' SV', (s.sa ? Math.round(s.sv / s.sa * 100) : 0) + ' SV%', s.gb + ' GB');
  else { parts.push(s.g + ' G', s.a + ' A', (s.g + s.a) + ' PTS', s.gb + ' GB'); if (pos === 'FO' || s.fot) parts.push(s.fow + '/' + s.fot + ' FO'); if (pos === 'D' || pos === 'LSM' || s.ct) parts.push(s.ct + ' CT'); }
  return parts.join('  ');
 }
 const boxLine = (b, pos) => { if (!b) return ''; const a = []; if (pos === 'G') a.push((b.sv || 0) + ' SAVES'); if (b.g) a.push(b.g + 'G'); if (b.a) a.push(b.a + 'A'); if (b.gb) a.push(b.gb + ' GB'); if (b.fot) a.push(b.fow + '/' + b.fot + ' FO'); if (b.ct) a.push(b.ct + ' CT'); return a.join(' ') || 'NO STATS'; };
 const SKN9 = { spd: 'SPEED', pow: 'POWER', acc: 'ACCURACY', fin: 'FINISHING', stk: 'STICK', str: 'STRENGTH', def: 'DEFENSE', gb: 'GROUND BALLS', fo: 'FACEOFFS', sav: 'SAVES' };
 const upLine = ups => { const t = {}; for (const u of ups || []) for (const k in u) t[k] = (t[k] || 0) + u[k]; const ks = Object.keys(t); return ks.length ? 'LEVEL UP! ' + ks.map(k => '+' + t[k] + ' ' + (SKN9[k] || k.toUpperCase())).join(' ') : ''; };

 // ---------- 1. create your player ----------
 function fDraft() { return U.f || (U.f = { n: '', num: 7, pos: 'M', skin: 0, diff: 2, ctl: 'me', from: defFrom(), dad: null, mom: null }); }
 function defFrom() { const l = CA.countries(); return l.includes('WUSA') ? 'WUSA' : l[0] || null; }
 // the World Games countries (the real World Games team list), as a picker
 function fromPick(cur, act, title, sub) {
  const l = CA.countries().slice().sort((a, b) => String(CA.tname(a)).localeCompare(String(CA.tname(b))));
  return '<div class="c9pick"><div class="hd"><div><div class="tt">' + E(title) + '</div><div class="st">' + E(sub) + '</div></div><div class="sp"></div>' + (act === 'from' ? btn9('BACK', 'pickx', 'g') : '') + '</div><div class="grid">' +
   l.map(id => '<button type="button" class="' + (id === cur ? 'on' : 'd') + '" data-a="car459" data-v="' + act + ':' + E(id) + '" aria-label="FROM ' + E(CA.tname(id)) + '"><img alt="" src="' + badge(id) + '"><span>' + E(CA.tname(id)) + '</span></button>').join('') + '</div></div>';
 }
 function prevPid(f) {
  const id = 'CAR459-PV-' + f.pos + '-' + f.skin;
  const p = { id: id, n: f.n || 'YOUR NAME', pos: f.pos, r: {}, real: false, team: '', wnum: f.num, skin: f.skin, car459: 1 };
  const r = (U.prevR = U.prevR || {})[f.pos] || (U.prevR[f.pos] = CA.startRatings(f.pos));
  (typeof SKILLS !== 'undefined' ? SKILLS : []).forEach((k, i) => p.r[k] = r[i]);
  p.ovr = ovrOf(p); PLAYERS[id] = p;
  return id;
 }
 function rCreate() {
  const f = fDraft(), pid = prevPid(f);
  const card = cardHtml({ n: f.n || 'YOUR NAME', num: f.num, pos: f.pos, ovr: P(pid).ovr, skin: f.skin, lvl: 'hs', diff: f.diff, ctl: f.ctl, team: '', pid: pid });
  const pos = CA.POSL.map(k => btn9(k, 'pos:' + k, f.pos === k ? 'on' : 'd')).join('');
  const sk = SKC.map((c, i) => '<button type="button" data-a="car459" data-v="skin:' + i + '" class="c9sw' + (f.skin === i ? ' on' : '') + '" style="background:' + c + '" aria-label="SKIN ' + SKN[i] + '"></button>').join('');
  const df = [ 0, 1, 2, 3, 4, 5 ].map(i => '<button type="button" data-a="car459" data-v="diff:' + i + '" class="' + (f.diff === i ? 'on' : 'd') + '" style="' + (f.diff === i ? '' : 'color:' + DCOL[i]) + '" aria-label="DIFFICULTY ' + E(CA.DIFFN(i)) + '">' + E(CA.DIFFN(i)) + '</button>').join('');
  const ctl = btn9('JUST ME', 'ctl:me', f.ctl === 'me' ? 'on' : 'd') + btn9('WHOLE TEAM', 'ctl:team', f.ctl === 'team' ? 'on' : 'd');
  // heritage: where he grows up + where his dad and mom are from (dad / mom follow where he grows up until you pick)
  const hb = (slot, lab, id) => '<button type="button" class="d c9from" data-a="car459" data-v="pick:' + slot + '" aria-label="' + E(lab + ' ' + (id ? CA.tname(id) : 'PICK')) + '"><span class="c9sm" style="color:#8fe3f0">' + E(lab) + '</span>' + (id ? '<img alt="" src="' + badge(id) + '">' + E(CA.tname(id)) : 'PICK') + ' &#9662;</button>';
  const ch = CA.wgChance([ f.from, f.dad || f.from, f.mom || f.from ]), warn = (f.dad && CA.topCountry(f.dad)) || (f.mom && CA.topCountry(f.mom));
  const fromB = hb('from', 'GROWS UP IN', f.from) + hb('dad', 'DAD FROM', f.dad || f.from) + hb('mom', 'MOM FROM', f.mom || f.from);
  return head('CREATE YOUR PLAYER - HIGH SCHOOL > COLLEGE > PRO > WORLD GAMES', btn9('START CAREER', 'create', 'y')) + msg() +
   '<div class="c9wrap"><div class="c9side">' + card + '<div class="c9sm">YOUR CAREER CARD STARTS AS A HIGH SCHOOL CARD</div></div><div class="c9main c9form">' +
   '<div class="row"><span class="lab">NAME</span><input id="c9name" maxlength="18" autocomplete="off" spellcheck="false" placeholder="YOUR NAME" aria-label="PLAYER NAME" value="' + E(f.n) + '"><span class="lab" style="flex-basis:20px;text-align:right">#</span><input id="c9num" type="number" min="0" max="99" inputmode="numeric" aria-label="JERSEY NUMBER" style="width:56px;flex:0 0 56px" value="' + f.num + '"></div>' +
   '<div class="row"><span class="lab">POSITION</span>' + pos + '<span class="c9sm" style="margin-left:4px">' + E(POSN[f.pos]) + '</span></div>' +
   '<div class="row"><span class="lab">LOOK</span>' + sk + '<span class="c9sm" style="margin-left:4px">' + SKN[f.skin] + '</span></div>' +
   '<div class="row"><span class="lab">FROM</span>' + fromB + '</div><div class="c9sm" style="margin:-2px 0 0 76px;text-align:left">HE CAN PLAY FOR ANY OF THESE COUNTRIES AT THE WORLD GAMES (IF THEY WANT HIM)' + (ch ? ' - WORLD GAMES CHANCE: <b style="color:' + (ch === 'HIGH' ? '#7dff7a' : ch === 'MEDIUM' ? '#ffd23a' : '#ff8a5a') + '">' + ch + '</b>' : '') + '</div>' +
   (warn ? '<div class="c9sm" style="margin:0 0 0 76px;text-align:left;color:#ffb14d">WARNING: USA AND CANADA ARE THE HARDEST TEAMS TO MAKE. PICKING THEM FOR HIS PARENTS MAKES THE WORLD GAMES MUCH LESS LIKELY.</div>' : '') +
   '<div class="row"><span class="lab">DIFFICULTY</span>' + df + '</div>' +
   '<div class="note">THE DIFFICULTY IS LOCKED FOR THE WHOLE CAREER AND STAMPED ON YOUR CARD. FINISH THE WORLD GAMES AND YOUR CAREER CARD (E.G. BAGGATWAAN CAREER) GOES IN YOUR LOCKER AS A REAL CARD.</div>' +
   /* 466: JUST ME removed (Charlie 11/9) */
   
   '<div class="fr8steps" style="margin-top:4px">' + [ 'HIGH SCHOOL', 'SIGNING DAY', 'COLLEGE', 'DRAFT NIGHT', 'PRO', 'WORLD GAMES', 'CAREER CARD' ].map((s, i) => '<span class="' + (i === 0 ? 'on' : '') + '">' + (i + 1) + ' ' + s + '</span>').join('') + '</div>' +
   '<div class="note">GOALS, ASSISTS, GROUND BALLS, SAVES AND FACEOFFS EARN EXP. EXP RAISES YOUR RATINGS BETWEEN GAMES. YOUR CARD UPGRADES AT EVERY LEVEL.</div>' +
   '</div></div>' + (U.pick ? fromPick(U.pick === 'from' ? f.from : (f[U.pick] || f.from), 'from', U.pick === 'from' ? 'WHERE DOES HE GROW UP?' : U.pick === 'dad' ? 'WHERE IS HIS DAD FROM?' : 'WHERE IS HIS MOM FROM?', U.pick === 'from' ? 'WHERE HE LIVES AND PLAYS. HIS WORLD GAMES OPTIONS = THIS + HIS DAD\'S + HIS MOM\'S COUNTRY.' : 'HIS FAMILY HERITAGE MAKES HIM ELIGIBLE FOR THIS COUNTRY TOO.') : '');
 }

 // ---------- 2. the hub (one level, one season) ----------
 function standRows(L) {
  const C = CA.get();
  if (L.groups) return L.groups.map((g, gi) => '<tr><th colspan="4" class="n">GROUP ' + 'AB'[gi] + '</th></tr>' + CA.stand(g).map(r => '<tr class="' + (r.id === C.team ? 'sel' : '') + '"><td class="n">' + E(CA.tname(r.id)) + '</td><td>' + r.w + '-' + r.l + '</td><td>' + r.gf + '</td><td>' + r.ga + '</td></tr>').join('')).join('');
  const st = CA.stand(), i = st.findIndex(r => r.id === C.team), keep = st.slice(0, 8);
  if (i >= 8) keep.push(st[i]);
  if (L.lvl === 'col' && L.confIds && L.confIds.length > 1) {
   const cf = CA.stand(L.confIds);
   return '<tr><th colspan="4" class="n">' + E(L.conf) + ' CONFERENCE</th></tr>' + cf.map(r => '<tr class="' + (r.id === C.team ? 'sel' : '') + '"><td class="n">' + E(CA.tname(r.id)) + ' <span class="dim2">#' + (st.findIndex(x => x.id === r.id) + 1) + ' NATIONAL</span></td><td>' + r.w + '-' + r.l + '</td><td>' + r.gf + '</td><td>' + r.ga + '</td></tr>').join('') +
    '<tr><th colspan="4" class="n">NATIONAL TOP 8 (THE TOURNAMENT FIELD)</th></tr>' + st.slice(0, 8).map(r => '<tr class="' + (r.id === C.team ? 'sel' : '') + '"><td class="n">' + (st.indexOf(r) + 1) + '. ' + E(CA.tname(r.id)) + '</td><td>' + r.w + '-' + r.l + '</td><td>' + r.gf + '</td><td>' + r.ga + '</td></tr>').join('');
  }
  return keep.map(r => '<tr class="' + (r.id === C.team ? 'sel' : '') + '"><td class="n">' + (st.indexOf(r) + 1) + '. ' + E(CA.tname(r.id)) + '</td><td>' + r.w + '-' + r.l + '</td><td>' + r.gf + '</td><td>' + r.ga + '</td></tr>').join('');
 }
 function bracket(L) {
  const C = CA.get();
  return L.po.rounds.map(R0 => '<tr><th colspan="3" class="n">' + E(R0.nm) + '</th></tr>' + R0.games.map(g => { const m = g.a === C.team || g.b === C.team; return '<tr class="' + (m ? 'sel' : '') + '"><td class="n">' + E(CA.tname(g.a)) + '</td><td>' + (g.s ? g.s[0] + '-' + g.s[1] : 'VS') + '</td><td class="n">' + E(CA.tname(g.b)) + '</td></tr>'; }).join('')).join('');
 }
 const DONE_FN = { hs: 'hsDone', col: 'colDone', pro: 'proDone', world: 'worldDone', ult: 'ultDone' };
 const LEVEL_SUB = { hs: 'HIGH SCHOOL', col: 'COLLEGE', pro: 'PRO', world: 'WORLD GAMES', ult: 'FINAL BRACKET' };
 function rHub() {
  const C = CA.get(), L = C.L, nx = CA.myGame();
  const sub = LEVEL_SUB[C.lvl] + ' - ' + L.nm + ' - ' + L.yr + ' - ' + CA.DIFFN(C.diff);
  let box = '';
  if (L.phase === 'done') {
   box = '<div class="box c9next"><div class="c9vs">' + (L.champ === C.team ? '&#9733; ' + E(CA.titleName(L.lvl)) + '! &#9733;' : 'SEASON OVER: ' + E(CA.finText(L))) + '<small>' + (L.champ && L.champ !== C.team ? E(CA.tname(L.champ)) + ' WON IT ALL' : '') + '</small></div><div class="sp"></div>' + btn9('CONTINUE', 'done', 'y') + '</div>';
  } else if (nx && nx.bye) {
   box = '<div class="box c9next"><div class="c9vs">BYE WEEK<small>' + E(nx.label) + '</small></div><div class="sp"></div>' + btn9('NEXT WEEK', 'sim', 'y') + '</div>';
  } else if (nx) {
   box = '<div class="box c9next"><img alt="" src="' + badge(nx.opp) + '"><div class="c9vs">' + (nx.home ? 'VS ' : '@ ') + E(CA.tname(nx.opp)) + '<small>' + E(nx.label) + ' - THEIR OVR ' + CA.teamOvr(nx.opp) + ' - YOURS ' + CA.teamOvr(C.team) + '</small></div><div class="sp"></div>' +
    btn9('PLAY GAME', 'play', 'y') + btn9('SIM GAME', 'sim', '') + btn9('SIM SEASON', 'simall', 'g') + '</div>';
  } else {
   box = '<div class="box c9next"><div class="c9vs">' + (L.elim ? 'ELIMINATED' : 'WAITING') + '<small>THE REST OF THE ' + (L.phase === 'po' ? 'PLAYOFFS' : 'SEASON') + ' PLAYS OUT</small></div><div class="sp"></div>' + btn9('SIM THE REST', 'rest', 'y') + '</div>';
  }
  const last = C.last && C.last.lvl === C.lvl ? C.last : null;
  const lastL = last ? '<div class="c9res ' + (last.s[0] > last.s[1] ? 'w' : 'l') + '">' + (last.s[0] > last.s[1] ? 'WIN ' : 'LOSS ') + last.s[0] + '-' + last.s[1] + ' VS ' + E(CA.tname(last.opp)) + (last.real ? ' (PLAYED)' : ' (SIM)') + ' - YOU: ' + E(boxLine(last.b, C.me.pos)) + ' - +' + last.xp + ' EXP' + (last.ups && last.ups.length ? ' <span class="c9up">' + E(upLine(last.ups)) + ' (OVR ' + CA.ovrMe() + ')</span>' : '') + '</div>' : '';
  const ctk = C.lvl === 'pro' && C.pro && C.pro.ct && C.pro.ct[ME];
  const seasonL = '<div class="c9line">THIS SEASON: <b>' + L.st.w + '-' + L.st.l + '</b>  ' + E(statLine(L.st, C.me.pos)) + (ctk ? '  -  CONTRACT <b>' + money(ctk[1]) + '</b> X ' + ctk[0] + ' YR' + (ctk[0] > 1 ? 'S' : '') : '') + '</div>';
  const tb = U.tab === 'career' ? careerTable() : '<table class="c9t">' + (L.phase === 'reg' ? '<tr><th class="n">' + (L.groups ? 'GROUPS' : 'STANDINGS') + '</th><th>W-L</th><th>GF</th><th>GA</th></tr>' + standRows(L) : bracket(L)) + '</table>';
  const tabs = '<div class="row tabs">' + btn9('TABLE', 'tab:game', U.tab !== 'career' ? 'on' : 'd') + btn9('CAREER STATS', 'tab:career', U.tab === 'career' ? 'on' : 'd') + '<span class="c9sm">' + 'PLAY A GAME FOR REAL OR SIM IT</span></div>';
  const ren = C.lvl === 'hs' && C.stage === 'hs' ? btn9('RENAME TEAMS', 'hsren', 'g') : '';
  return head(sub, ren) + msg() + '<div class="c9wrap">' + side() + '<div class="c9main">' + box + lastL + seasonL + tabs + '<div class="scroll" id="c9tb">' + tb + '</div></div></div>' + pop();
 }
 // ---------- rename the high school teams (school, mascot, abbreviation) ----------
 function rHsRen() {
  const C = CA.get(), ids = Object.keys(C.hs && C.hs.teams || {});
  const rows = ids.map(id => { const h = CA.hsTeam(id); return '<tr class="' + (id === C.team ? 'sel' : '') + '"><td><img alt="" src="' + badge(id) + '" style="width:18px;height:21px;image-rendering:pixelated"></td>' +
   '<td><input id="c9hn-' + id + '" maxlength="16" autocomplete="off" spellcheck="false" aria-label="SCHOOL NAME ' + E(h.name) + '" value="' + E(h.name) + '" style="width:200px"></td>' +
   '<td><input id="c9hk-' + id + '" maxlength="14" autocomplete="off" spellcheck="false" aria-label="MASCOT ' + E(h.nick) + '" value="' + E(h.nick) + '" style="width:170px"></td>' +
   '<td><input id="c9ha-' + id + '" maxlength="4" autocomplete="off" spellcheck="false" aria-label="ABBREVIATION ' + E(h.abbr) + '" value="' + E(h.abbr) + '" style="width:64px"></td>' +
   '<td class="n">' + (id === C.team ? '<span class="c9sm" style="color:#ffe14d">YOUR SCHOOL</span>' : '') + '</td></tr>'; }).join('');
  return head('HIGH SCHOOL - RENAME THE TEAMS', btn9('SAVE NAMES', 'hssave', 'y') + btn9('BACK', 'hsback', 'g')) + msg() +
   '<div class="note">NAME EVERY HIGH SCHOOL IN YOUR LEAGUE: SCHOOL, MASCOT AND A 2-4 LETTER ABBREVIATION. THE NAMES STAY IN YOUR CAREER (TABLE, CAREER STATS, YOUR CARD).</div>' +
   '<div class="scroll"><table class="c9t c9ren"><tr><th></th><th class="n">SCHOOL</th><th class="n">MASCOT</th><th class="n">ABBR</th><th></th></tr>' + rows + '</table></div>';
 }
 function saveHsNames() {
  const C = CA.get(), ids = Object.keys(C.hs && C.hs.teams || {}), g = id => document.getElementById(id);
  for (const id of ids) {
   const n = g('c9hn-' + id), k = g('c9hk-' + id), a = g('c9ha-' + id); if (!n || !k) continue;
   const r = CA.renameHS(id, { name: n.value, nick: k.value, abbr: a ? a.value : '' });
   if (!r.ok) { say(r.why + ' (' + CA.hsTeam(id).name + ')', false); return false; }
  }
  return true;
 }
 // a college / pro title: the normal title-card flip is waiting
 function flipBox() {
  const d = CA.flipPending(); if (!d) return '';
  const need = window.V22 && V22.flipNeed ? V22.flipNeed(d) : d.need, lvl = /\|col\|/.test(d.k) ? 'NATIONAL TITLE' : 'PRO TITLE';
  return '<div class="box c9next c9flip"><div class="c9vs">&#9733; ' + lvl + ' - TITLE CARDS!<small>FLIP ' + need + ' OF ' + d.ids.length + ' REAL PLAYERS FROM YOUR TITLE ROSTER (CARDS YOU DON\'T HAVE YET). THEY GO IN YOUR LOCKER.</small></div><div class="sp"></div>' + btn9('FLIP CARDS', 'flip', 'y') + '</div>';
 }
 function careerTable() {
  const C = CA.get(), rows = C.seasons.slice(), pos = C.me.pos;
  if (C.L && !rows.some(s => s.lvl === C.L.lvl && s.yr === C.L.yr)) rows.push(Object.assign({ lvl: C.L.lvl, yr: C.L.yr, team: C.L.team, ovr: CA.ovrMe(), fin: 'IN PROGRESS' }, C.L.st));
  const g = pos === 'G';
  const th = '<tr><th>YEAR</th><th>LEVEL</th><th class="n">TEAM</th><th>W-L</th><th>GP</th>' + (g ? '<th>SV</th><th>SV%</th>' : '<th>G</th><th>A</th><th>PTS</th>') + '<th>GB</th>' + (pos === 'FO' ? '<th>FO</th>' : '') + '<th>OVR</th><th class="n">FINISH</th></tr>';
  const tr = s => '<tr><td>' + s.yr + '</td><td>' + E(CA.LVN[s.lvl] || s.lvl) + '</td><td class="n">' + E(CA.tname(s.team)) + '</td><td>' + s.w + '-' + s.l + '</td><td>' + s.gp + '</td>' + (g ? '<td>' + s.sv + '</td><td>' + (s.sa ? Math.round(s.sv / s.sa * 100) : 0) + '</td>' : '<td>' + s.g + '</td><td>' + s.a + '</td><td>' + (s.g + s.a) + '</td>') + '<td>' + s.gb + '</td>' + (pos === 'FO' ? '<td>' + s.fow + '/' + s.fot + '</td>' : '') + '<td>' + (s.ovr || '') + '</td><td class="n">' + E(String(s.fin || '').replace(/ULTIMATE /g, '')) + '</td></tr>';
  const t = CA.totals();
  const tot = '<tr class="pick"><td colspan="3" class="n">CAREER TOTALS</td><td>' + t.w + '-' + t.l + '</td><td>' + t.gp + '</td>' + (g ? '<td>' + t.sv + '</td><td>' + (t.sa ? Math.round(t.sv / t.sa * 100) : 0) + '</td>' : '<td>' + t.g + '</td><td>' + t.a + '</td><td>' + (t.g + t.a) + '</td>') + '<td>' + t.gb + '</td>' + (pos === 'FO' ? '<td>' + t.fow + '/' + t.fot + '</td>' : '') + '<td></td><td></td></tr>';
  return '<table class="c9t">' + th + rows.map(tr).join('') + tot + '</table>';
 }
 // card upgrade pop-up
 function pop() {
  const C = CA.get(); if (!C.cardUp || U.v === 'draft') return '';
  const K = CA.CARD, to = C.cardUp.to, from = C.cardUp.from;
  const nm = to === 'final' ? (C.final ? C.final.title : 'CAREER') : (K[to] || K.hs).nm;
  const why = { col: 'YOU SIGNED WITH ' + CA.tname(C.team) + '.', pro: 'YOU MADE THE PROS.', world: CA.tname(C.team) + ' CALLED YOU UP FOR THE WORLD GAMES.', final: 'CAREER COMPLETE. YOUR CAREER CARD IS STAMPED ' + CA.DIFFN(C.diff) + ' AND IT IS IN YOUR LOCKER NOW: A REAL CARD (LOCKER > CARDS > CAREER).' }[to] || '';
  return '<div class="c9pop"><div class="c9mini">' + myCard(from, C.cardUp.ft) + '</div><div class="c9arrow">&#9654;</div>' + myCard(to) + '<div class="tx"><div class="big">CARD UPGRADE!</div><div class="c9vs">' + E((K[from] || K.hs).nm) + ' &#9654; ' + E(nm) + '</div><div class="note">' + E(why) + '</div>' + btn9('NICE', 'popok', 'y') + '</div></div>';
 }

 // ---------- 3. signing day ----------
 function rSign() {
  const C = CA.get(), s = C.stars | 0, hsS = C.seasons[C.seasons.length - 1];
  const stars = '<span class="c9stars">' + '&#9733;'.repeat(s) + '<i>' + '&#9733;'.repeat(5 - s) + '</i></span>';
  const offers = (C.offers || []).map(o => { const t = T(o.t), ct = (COL25.TEAMS.find(x => x.id === o.t) || {}); const ovrT = CA.teamOvr(o.t);
   return '<div class="c9off"><div class="hdr"><img alt="" src="' + badge(o.t) + '"><div><div class="t">' + E(t.name) + '</div><div class="d">' + E((ct.nick || '') + (ct.conf ? ' - ' + ct.conf : '')) + '</div></div></div><div class="d">NATIONAL RANK #' + o.rank + ' - TEAM OVR ' + ovrT + '</div><div class="d">' + E(ct.coach ? 'COACH ' + String(ct.coach).toUpperCase() : '') + '</div>' + depth(o.t) + btn9('SIGN WITH ' + (t.abbr || t.name), 'sign:' + o.t, 'y') + '</div>'; }).join('');
  return head('SIGNING DAY - ' + C.yr, '') + '<div class="c9wrap">' + side() + '<div class="c9main"><div class="box"><div class="c9line">SENIOR SEASON: <b>' + hsS.w + '-' + hsS.l + '</b> ' + E(statLine(hsS, C.me.pos)) + (hsS.champ ? ' - <b>STATE CHAMPS</b>' : '') + '</div><div class="row" style="margin-top:3px">' + stars + '<span class="c9line"><b>' + s + '-STAR RECRUIT</b> - ' + (C.offers || []).length + ' SCHOOLS OFFERED YOU</span></div></div>' +
   '<div class="note">PICK YOUR SCHOOL. THESE ARE THE REAL COLLEGE TEAMS + ROSTERS IN THE GAME. YOU TAKE A STARTING SPOT AT ' + E(POSN[C.me.pos]) + '.</div><div class="c9offers">' + offers + '</div>' +
   '<div class="note" style="margin-top:auto">STARS COME FROM YOUR RATING + YOUR SENIOR STATS (+1 FOR A STATE TITLE). 5 STARS = OFFERS FROM THE TOP 15 PROGRAMS. COLLEGE: UP TO 4 SEASONS + THE NATIONAL TOURNAMENT, THEN DRAFT NIGHT.</div></div></div>';
 }
 function depthW(t) { try { const ro = (T(t).roster || []).map(P).filter(Boolean).sort((a, b) => b.ovr - a.ovr); return ro[0] ? '<div class="d" style="color:#cfe">BEST PLAYER: ' + E(ro[0].n) + ' (' + ro[0].pos + ' ' + ro[0].ovr + ')</div>' : ''; } catch (e) { return ''; } }
 function depth(t) {
  const C = CA.get(), same = (T(t).roster || []).map(P).filter(p => p && p.pos === C.me.pos).sort((a, b) => b.ovr - a.ovr);
  if (!same.length) return '';
  return '<div class="d" style="color:#cfe">TOP ' + C.me.pos + ' ON THE ROSTER: ' + E(same[0].n) + ' (' + same[0].ovr + ')</div>';
 }
 // ---------- 4b. end of a college year ----------
 function rColEnd() {
  const C = CA.get(), s = C.seasons[C.seasons.length - 1], pj = C.proj, yr = C.col.yr, CLS = [ 'FRESHMAN', 'SOPHOMORE', 'JUNIOR', 'SENIOR' ];
  const pjt = !pj ? '' : pj.rd ? 'PROJECTED: ROUND ' + pj.rd + ', AROUND PICK ' + pj.pick : 'PROJECTED: UNDRAFTED (KEEP GROWING)';
  return head('COLLEGE - END OF ' + CLS[yr - 1] + ' YEAR - ' + s.yr) + '<div class="c9wrap">' + side() + '<div class="c9main"><div class="box"><div class="c9vs">' + E(s.fin) + '<small>' + s.w + '-' + s.l + ' - ' + E(statLine(s, C.me.pos)) + '</small></div></div>' + flipBox() +
   '<div class="box"><div class="c9line"><b>PRO DRAFT</b> - ' + E(pjt) + '</div><div class="note">THE TOP COLLEGE PLAYERS DECLARE AND THE WORST PRO TEAMS PICK FIRST. A COLLEGE STAR IS NOT AN INSTANT PRO STAR: ROOKIES LOSE A FEW POINTS ON DRAFT NIGHT.</div></div>' +
   '<div class="row">' + btn9('DECLARE FOR THE DRAFT', 'declare', 'y') + (yr < 4 ? btn9('RETURN FOR ' + CLS[yr] + ' YEAR', 'return', '') : '<span class="note">SENIOR YEAR DONE: TIME TO GO PRO.</span>') + '</div>' +
   '<div class="scroll" id="c9tb">' + careerTable() + '</div></div></div>' + pop();
 }
 // ---------- 5. draft night ----------
 const ord = n => n + (n % 100 >= 11 && n % 100 <= 13 ? 'TH' : [ 'TH', 'ST', 'ND', 'RD' ][n % 10] || 'TH');
 function rDraft() {
  const C = CA.get(), D = C.draft, mineI = D.picks.findIndex(p => p.id === ME), shown = Math.min(U.dr, D.picks.length);
  const reached = mineI >= 0 ? shown > mineI : shown >= D.picks.length;
  const list = D.picks.slice(0, shown).map((p, i) => '<div class="' + (p.id === ME ? 'me' : '') + '">' + p.no + '. ' + E(CA.tabbr(p.t)) + ' - ' + E(p.n) + ' (' + p.pos + ' ' + p.ovr + ') ' + '<span class="dim2">' + E(CA.tname(p.c)) + '</span></div>').reverse().join('');
  let stage;
  if (!reached) {
   const nx = D.picks[shown];
   stage = '<div class="c9pod">' + D.yr + ' PRO DRAFT - ROUND ' + (nx ? Math.ceil(nx.no / D.n) : '') + '</div><div class="c9call">' + (nx ? E(CA.tname(nx.t)) + ' IS ON THE CLOCK...<br><b>PICK ' + nx.no + '</b>' : '') + '</div><div class="note">YOUR PROJECTION: ' + (C.proj && C.proj.rd ? 'ROUND ' + C.proj.rd + ', ~PICK ' + C.proj.pick : 'UNDRAFTED') + '</div><div class="row">' + btn9('SKIP TO MY PICK', 'drskip', 'y') + '</div>';
  } else if (mineI >= 0) {
   stage = '<div class="c9pod">' + D.yr + ' PRO DRAFT - ROUND ' + D.rd + ', PICK ' + D.inRd + '</div><div class="c9call">WITH THE <b>' + ord(D.no) + ' PICK</b> IN THE ' + D.yr + ' PRO DRAFT,<br><b>' + E(CA.tname(D.team)) + '</b> SELECTS...</div><div class="c9name">' + E(String(C.me.n).toUpperCase()) + '</div><div class="c9line">' + E(POSN[C.me.pos]) + ' - ' + E(CA.tname(C.col.team)) + ' - ROOKIE DEAL <b>' + money(D.ct[1]) + ' X ' + D.ct[0] + ' YRS</b></div>' + btn9('PUT ON THE HAT', 'drok', 'y');
  } else {
   stage = '<div class="c9pod">' + D.yr + ' PRO DRAFT - OVER</div><div class="c9call">' + D.picks.length + ' PICKS. YOUR NAME WAS NOT CALLED.</div><div class="c9name">UNDRAFTED</div><div class="c9line"><b>' + E(CA.tname(D.team)) + '</b> SIGNS YOU AS A FREE AGENT - <b>' + money(D.ct[1]) + ' X ' + D.ct[0] + ' YRS</b>. PROVE THEM WRONG.</div>' + btn9('LET\'S GO', 'drok', 'y');
  }
  const col = C.col.team, cardH = reached ? myCard('pro') : cardHtml({ n: C.me.n, num: C.me.num, pos: C.me.pos, ovr: D.covr || CA.ovrMe(), lvl: 'col', diff: C.diff, ctl: C.ctl, team: col, pid: artPid() });
  const hd = reached ? head('DRAFT NIGHT - ' + D.yr) : '<div class="hd"><img alt="" src="' + badge(col) + '"><div><div class="tt">DRAFT NIGHT</div><div class="st">' + E(D.yr + ' PRO DRAFT - ' + CA.tname(col) + ' - ' + POSN[C.me.pos]) + '</div></div><div class="sp"></div>' + btn9('MENU', 'menu', 'g') + '</div>';
  return '<div class="c9night">' + hd + '<div class="c9dn"><div class="c9side">' + cardH + (reached ? '<div class="c9sm">PRO RATING ' + CA.ovrMe() + (D.covr ? ' (COLLEGE ' + D.covr + ')' : '') + '</div>' : '') + '</div><div class="c9stage">' + stage + '</div><div class="c9tick"><div class="note">THE BOARD</div><div class="scroll" id="c9dl">' + (list || '<div class="dim2">THE COMMISSIONER STEPS TO THE PODIUM...</div>') + '</div></div></div></div>';
 }
 // ---------- 6. pro season over: contract + free agency + offseason news + call-up ----------
 function rProEnd() {
  const C = CA.get(), s = C.seasons[C.seasons.length - 1], k = C.contract || {};
  let body = '<div class="box"><div class="c9vs">PRO YEAR ' + C.pro.yr + ': ' + E(s.fin) + '<small>' + s.w + '-' + s.l + ' - ' + E(statLine(s, C.me.pos)) + '</small></div></div>' + flipBox();
  if (!k.done) {
   if (k.exp) {
    const offers = CA.faOffers();
    body += '<div class="box"><div class="c9line"><b>CONTRACT YEAR.</b> YOUR DEAL WITH ' + E(CA.tname(C.team)) + ' IS UP.</div><div class="note">RE-SIGN AT YOUR ASKING PRICE, OR TEST FREE AGENCY: TEAMS WITH CAP ROOM BID AND YOU PICK.</div></div>' +
     '<div class="c9offers"><div class="c9off"><div class="hdr"><img alt="" src="' + badge(C.team) + '"><div><div class="t">RE-SIGN: ' + E(CA.tname(C.team)) + '</div><div class="d">' + money(k.ask.sal) + ' X ' + k.ask.yrs + ' YRS</div></div></div>' + btn9('RE-SIGN', 'stay', 'y') + '</div>' +
     offers.map(o => '<div class="c9off"><div class="hdr"><img alt="" src="' + badge(o.t) + '"><div><div class="t">' + E(CA.tname(o.t)) + '</div><div class="d">OFFER: ' + money(o.sal) + ' X ' + o.yrs + ' YRS</div></div></div><div class="d">TEAM OVR ' + CA.teamOvr(o.t) + '</div>' + btn9('SIGN', 'fa:' + o.t, '') + '</div>').join('') + '</div><div class="scroll" id="c9tb">' + careerTable() + '</div>';
   } else {
    body += '<div class="box"><div class="c9line">YOUR CONTRACT: <b>' + money(k.ct[1]) + ' A YEAR</b> - ' + k.ct[0] + ' YEAR' + (k.ct[0] > 1 ? 'S' : '') + ' LEFT WITH ' + E(CA.tname(C.team)) + '. NEXT DEAL ASK: <b>' + money(k.ask.sal) + ' X ' + k.ask.yrs + '</b></div><div class="note">TEAM PAYROLL ' + money(C.pro.pay[C.team] || 0) + ' / CAP ' + money(C.pro.cap || 42000) + '. THE OFFSEASON RUNS THROUGH THE PRO FRANCHISE LEAGUE: AGING, CPU TRADES + CUTS, FREE AGENCY AND THE DRAFT.</div></div>' + '<div class="row">' + btn9('ON TO THE OFFSEASON', 'stay', 'y') + '</div>' + payTable();
   }
   return head('PRO - SEASON OVER - ' + s.yr) + msg() + '<div class="c9wrap">' + side() + '<div class="c9main">' + body + '</div></div>' + pop();
  }
  const ct = k.now || [ 0, 0 ];
  body += '<div class="box"><div class="c9line">YOUR DEAL: <b>' + money(ct[1]) + ' X ' + ct[0] + ' YRS</b> WITH <b>' + E(CA.tname(C.team)) + '</b></div></div>';
  if (U.cty && C.callup && !CA.fromOf()) {
   // a career made before heritage existed: asked once, here
   return head('PRO - WORLD GAMES CALL-UP - ' + s.yr) + msg() + '<div class="c9wrap">' + side() + '<div class="c9main">' + body + '</div></div>' + fromPick(null, 'setfrom', 'WORLD GAMES CALL-UP: WHERE IS HE FROM?', 'YOUR CAREER WAS MADE BEFORE HERITAGE EXISTED. PICK IT ONCE: ONLY THAT COUNTRY CAN CALL HIM UP, NOW AND LATER.');
  }
  if (U.cty && C.callup) {
   const co = CA.countryOffers(), me = CA.ovrMe(), yes = co.filter(o => o.ok);
   const card = o => '<div class="c9off" style="max-width:260px' + (o.ok ? '' : ';opacity:.6') + '"><div class="hdr"><img alt="" src="' + badge(o.t) + '"><div><div class="t">' + E(CA.tname(o.t)) + '</div><div class="d">' + E(o.lab) + '</div></div></div><div class="d">WORLD RANK #' + o.rank + ' - NEEDS ~' + o.need + ' OVR (YOU\'RE ' + me + ')</div>' + depthW(o.t) + (o.ok ? btn9('PLAY FOR ' + CA.tname(o.t), 'cty:' + o.t, 'y') : '<div class="c9res l">NOT GOOD ENOUGH FOR ' + E(CA.tname(o.t)) + ' YET</div>') + '</div>';
   if (yes.length) body += '<div class="note">' + (yes.length > 1 ? yes.length + ' COUNTRIES WANT YOU FOR THE WORLD GAMES. PICK ONE.' : E(CA.tname(yes[0].t)) + ' WANTS YOU FOR THE WORLD GAMES.') + ' ONLY WHERE YOU GREW UP AND WHERE YOUR FAMILY IS FROM CAN CALL YOU UP.</div>';
   else body += '<div class="c9res l">NOT CALLED UP: ' + co.map(o => E(CA.tname(o.t)) + ' NEEDS ~' + o.need + ' OVR').join(', ') + ' (YOU\'RE ' + me + ')</div>';
   body += '<div class="c9offers">' + co.map(card).join('') + '</div>' + (yes.length ? '<div class="note">THE WORLD GAMES ARE THE LAST STOP: AFTER THE MEDAL ROUND YOUR CAREER CARD GOES IN YOUR LOCKER.</div>' : '<div class="note">KEEP PLAYING PRO AND TRY AGAIN NEXT YEAR, OR END YOUR CAREER NOW AND GET YOUR CAREER CARD.</div>') +
    '<div class="row">' + btn9('BACK', 'ctyback', 'g') + (yes.length ? '' : btn9('NEXT PRO SEASON', 'nextpro', 'y') + btn9('END CAREER', 'endcar', '')) + '</div>';
  } else {
   const KO = { trade: 0, cut: 1, walk: 2, ret: 3, resign: 4, fa: 5 }, TG = { trade: 'TRADE', cut: 'CUT', walk: 'WALKED', ret: 'RETIRED', resign: 'RE-SIGNED', fa: 'SIGNED' };
   const nl = (C.pro.news || []).map(n => typeof n === 'string' ? { k: 'fa', s: n } : n).sort((a, b) => (KO[a.k] != null ? KO[a.k] : 9) - (KO[b.k] != null ? KO[b.k] : 9));
   const news = nl.slice(0, 24).map(n => '<div><span class="fr8tag ' + E(n.k) + '">' + E(TG[n.k] || 'NEWS') + '</span>' + E(n.s) + '</div>').join('');
   const picks = (C.pro.picks || []).slice(0, 6).map(p => '<div>' + p.no + '. ' + E(CA.tabbr(p.t)) + ' - ' + E(p.n) + ' (' + p.pos + ') <span class="dim2">' + E(CA.tname(p.c)) + '</span></div>').join('');
   body += '<div class="row">' + btn9('NEXT PRO SEASON', 'nextpro', C.callup ? '' : 'y') + (C.callup ? btn9('WORLD GAMES CALL-UP!', 'callup', 'y') : '<span class="note">PLAY BETTER (OR HIT YEAR 3) TO GET A WORLD GAMES CALL-UP.</span>') + '</div>' +
    '<div class="fr8cols" style="display:flex;gap:8px;flex:1 1 auto;min-height:0"><div style="flex:1 1 0;display:flex;flex-direction:column;min-height:0"><div class="note">LEAGUE NEWS (CPU TRADES, CUTS, SIGNINGS)</div><div class="scroll fr8news" id="c9nw">' + (news || '<div class="dim2">QUIET OFFSEASON.</div>') + '</div></div><div style="flex:0 0 40%;display:flex;flex-direction:column;min-height:0"><div class="note">TOP ROOKIES IN THE DRAFT</div><div class="scroll fr8news" id="c9pk">' + picks + '</div></div></div>';
  }
  return head('PRO - OFFSEASON - ' + s.yr) + msg() + '<div class="c9wrap">' + side() + '<div class="c9main">' + body + '</div></div>' + pop();
 }
 function payTable() {
  const C = CA.get(), ids = (C.pro.ro && C.pro.ro[C.team] || []).filter(id => P(id)), ct = C.pro.ct || {};
  const rows = ids.map(P).sort((a, b) => ((ct[b.id] || [ 0, 0 ])[1]) - ((ct[a.id] || [ 0, 0 ])[1])).slice(0, 12).map(p => { const c = ct[p.id]; return '<tr class="' + (p.id === ME ? 'sel' : '') + '"><td>' + posTag(p) + '</td><td class="n">' + E(p.id === ME ? C.me.n : p.n) + '</td><td class="' + rc(p.ovr) + '">' + p.ovr + '</td><td>' + (c ? money(c[1]) + ' X ' + c[0] : '-') + '</td></tr>'; }).join('');
  return '<div class="note">' + E(CA.tname(C.team)) + ' - BIGGEST CONTRACTS</div><div class="scroll" id="c9pay"><table class="c9t"><tr><th>POS</th><th class="n">NAME</th><th>OVR</th><th>DEAL (YRS LEFT)</th></tr>' + rows + '</table></div>';
 }
 function rDone() {
  const C = CA.get(), f = C.final || CA.finalCard(), t = f.tot, h = CA.hall();
  const big = cardHtml({ wins: winsShort(f.titles), rec: recShort(t), n: f.n, num: f.num, pos: f.pos, ovr: f.ovr, lvl: 'final', diff: f.diff, ctl: f.ctl, team: f.team, title: f.title, pid: artPid() });
  const hallH = h.slice(0, 8).map(x => '<span class="c9sm" style="display:inline-block;padding:2px 5px;background:#14222c;border-radius:2px;margin:1px">' + E(x.n) + ' - ' + E(x.title) + '</span>').join('');
  return head('CAREER COMPLETE - ' + f.title, btn9('NEW CAREER', 'new', 'y')) + '<div class="c9wrap"><div class="c9side">' + big + '<div class="c9sm">' + E(f.title) + '</div></div><div class="c9main">' +
   '<div class="box"><div class="c9vs">' + E(String(f.n).toUpperCase()) + ' #' + f.num + ' - ' + E(POSN[f.pos]) + '<small>' + t.gp + ' GAMES - ' + E(statLine(t, f.pos)) + ' - ' + t.w + '-' + t.l + '</small></div><div class="c9line">' + (f.titles.length ? '&#9733; ' + f.titles.map(E).join('  &#9733; ') : 'NO TITLES. THE NEXT CAREER IS THE ONE.') + '</div></div>' +
   '<div class="box"><div class="c9line"><b style="color:#3dffc8">IN YOUR LOCKER:</b> YOUR ' + E(f.title) + ' CARD IS A REAL CARD NOW (LOCKER > CARDS > CAREER). USE HIM IN QUICK PLAY, CARD TEAMS AND ULTIMATE; HE EARNS ULTIMATE, ALL-AMERICAN AND BAGGATWAAN VERSIONS LIKE ANY CARD.</div><div class="row" style="margin-top:3px">' + btn9('SEE IT IN THE LOCKER', 'locker', 'y') + '</div></div>' +
   '<div class="scroll" id="c9tb">' + careerTable() + '</div><div class="note">YOUR CAREER CARDS (ALL IN YOUR LOCKER)</div><div class="c9hall">' + hallH + '</div></div></div>' + pop();
 }

 // ---------- render + actions ----------
 function view() {
  const C = CA.get();
  if (!C || U.v === 'create') return 'create';
  if (U.v === 'hsren' && C.stage === 'hs') return 'hsren';
  return { hs: 'hub', col: 'hub', pro: 'hub', world: 'hub', ult: 'done', sign: 'sign', colEnd: 'colEnd', draft: 'draft', proEnd: 'proEnd', worldEnd: 'done', done: 'done' }[C.stage] || 'hub';
 }
 function render() {
  const v = view();
  U.cur = v;
  if (v === 'draft') drTick();
  if (v === 'done') { const C = CA.get(); if (C && C.stage !== 'done' && CA.ultDone) CA.ultDone(); }
  return ({ create: rCreate, hub: rHub, hsren: rHsRen, sign: rSign, colEnd: rColEnd, draft: rDraft, proEnd: rProEnd, done: rDone })[v]();
 }
 let drTimer = 0;
 function drTick() {
  if (drTimer) return;
  drTimer = setInterval(() => {
   const C = CA.get();
   if (screen !== 'car459' || !C || C.stage !== 'draft') { clearInterval(drTimer); drTimer = 0; return; }
   const D = C.draft, mineI = D.picks.findIndex(p => p.id === ME), stop = mineI >= 0 ? mineI + 1 : D.picks.length;
   if (U.dr >= stop) { clearInterval(drTimer); drTimer = 0; return; }
   U.dr++; panelDirty();
  }, 520);
 }
 function open() { U.msg = null; U.ok = null; screen = 'car459'; panelDirty(); }
 PANEL_SCREENS.push('car459');
 PANEL_RENDER.car459 = function () { try { return render(); } catch (e) { console.error(e); return '<div class="hd"><div class="tt">CAREER MODE</div><div class="sp"></div>' + btn9('MENU', 'menu', 'g') + '</div><div class="note">SOMETHING WENT WRONG LOADING YOUR CAREER.</div>'; } };
 const say = (m, ok) => { U.msg = m; U.ok = ok; };
 PANEL_ACT.car459 = function (v) {
  const [ k, a ] = String(v).split(':'), C = CA.get();
  if (k === 'menu') { screen = 'menu'; U.pick = null; return; }
  if (U.cur === 'create' || !C) {
   const f = fDraft(); readForm(f);
   if (k === 'pos') f.pos = a; else if (k === 'skin') f.skin = +a; else if (k === 'diff') f.diff = +a; else if (k === 'ctl') f.ctl = a;
   else if (k === 'pick') U.pick = a; else if (k === 'pickx') U.pick = null; else if (k === 'from') { if (CA.fromOk(a)) { if (U.pick === 'dad') f.dad = a; else if (U.pick === 'mom') f.mom = a; else f.from = a; } U.pick = null; }
   else if (k === 'create') { const r = CA.create(f); if (!r.ok) { say(r.why, false); return; } U.v = null; U.f = null; U.tab = 'game'; say('WELCOME TO ' + CA.tname(CA.get().team) + '. SENIOR SEASON STARTS NOW.', true); }
   return;
  }
  U.msg = null; U.ok = null;
  if (k === 'popok') { C.cardUp = null; CA.save(); return; }
  if (k === 'tab') { U.tab = a; return; }
  if (k === 'play') { if (CA.play()) { U.tab = 'game'; } return; }
  if (k === 'sim') { CA.simMine(); return; }
  if (k === 'simall') { CA.simSeason(); return; }
  if (k === 'rest') { CA.simRest(); return; }
  if (k === 'done') { const fn = { hs: 'hsDone', col: 'colDone', pro: 'proDone', world: 'worldDone', ult: 'ultDone' }[C.stage]; if (fn) CA[fn](); U.cty = false; if (CA.flipPending()) goFlip(); return; }
  if (k === 'flip') { if (CA.flipPending()) goFlip(); return; }
  if (k === 'hsren') { U.v = 'hsren'; return; }
  if (k === 'hsback') { U.v = null; return; }
  if (k === 'hssave') { if (saveHsNames()) { U.v = null; say('TEAM NAMES SAVED.', true); } return; }
  if (k === 'setfrom') { if (CA.setFrom(a)) say('HERITAGE: ' + CA.tname(a) + '. ONLY ' + CA.tname(a) + ' CAN CALL YOU UP.', true); return; }
  if (k === 'locker') { openLocker(); return; }
  if (k === 'endcar') { U.cty = false; CA.endCareer(); return; }
  if (k === 'sign') { CA.sign(a); return; }
  if (k === 'declare') { U.dr = 0; CA.runDraft(); return; }
  if (k === 'return') { CA.colReturn(); return; }
  if (k === 'drskip') { const D = C.draft, i = D.picks.findIndex(p => p.id === ME); U.dr = i >= 0 ? i + 1 : D.picks.length; return; }
  if (k === 'drok') { CA.draftSeen(); return; }
  if (k === 'stay') { const r = CA.contract('stay'); if (r && !r.ok) say(r.why || 'TRY AGAIN', false); return; }
  if (k === 'fa') { const r = CA.contract(a); if (r && r.ok) say('YOU SIGNED WITH ' + CA.tname(r.team) + '!', true); return; }
  if (k === 'nextpro') { U.cty = false; CA.nextPro(); return; }
  if (k === 'callup') { U.cty = true; return; }
  if (k === 'ctyback') { U.cty = false; return; }
  if (k === 'cty') { U.cty = false; CA.callup(a); return; }
  if (k === 'new') { U.v = 'create'; U.f = null; return; }
 };
 // the title-card flip is the game's own one (it shows on the main menu); collecting it brings you back here
 function goFlip() { U.flipBack = true; U.pick = null; screen = 'menu'; try { panelDirty(); } catch (e) {} }
 CA.onFlipDone = function () { if (!U.flipBack) return; U.flipBack = false; setTimeout(() => { try { if (screen === 'menu' && CA.get()) open(); } catch (e) { console.error(e); } }, 900); };
 function openLocker() {
  try { screen = 'menu'; if (typeof PANEL_ACT.v17locker === 'function') PANEL_ACT.v17locker(); if (typeof PANEL_ACT.v17sec === 'function') PANEL_ACT.v17sec('legacy'); panelDirty(); } catch (e) { console.error(e); }
 }
 function readForm(f) {
  const n = document.getElementById('c9name'), m = document.getElementById('c9num');
  if (n) f.n = String(n.value || '').toUpperCase().replace(/[^A-Z0-9 .'-]/g, '').slice(0, 18);
  if (m) { const x = parseInt(m.value, 10); if (!isNaN(x)) f.num = Math.max(0, Math.min(99, x)); }
 }
 // keep what is typed (the panel re-renders only on taps)
 try { panel.addEventListener('input', ev => { if (panel.dataset.scr !== 'car459') return; const f = fDraft(); readForm(f); }); } catch (e) {}

 // ---------- the CAREER button on the play menu ----------
 const MB0 = window.menuBars;
 window.menuBars = function () {
  const rows = MB0.apply(this, arguments);
  try {
   if (CA.OFF() || !Array.isArray(rows)) return rows;
   const ci = rows.findIndex(r => r && r.some && r.some(e => e && e.m37 && e.label === 'COLLEGE'));
   const pi = rows.findIndex(r => r && r.some && r.some(e => e && e.m37 && e.label === 'PRO SEASON'));
   if (ci < 0 && pi < 0) return rows;
   const C = CA.get();
   const it = { label: 'CAREER', fn: () => { if (!CA.get()) { U.v = 'create'; } open(); }, bg: '#9dffd0', m37: 1, h37: 16 };
   // shares the COLLEGE row so the menu keeps its height (a 9th row ran into the account line)
   if (ci >= 0) rows[ci].push(it); else rows.splice(pi + 1, 0, [ it ]);
  } catch (e) { console.error(e); }
  return rows;
 };

 // ---------- in-game: the final screen + recording the game ----------
 const FG = window.finishGame;
 window.finishGame = function () {
  const r = FG.apply(this, arguments);
  try { if (game && game.car459) CA.gameOver(game); } catch (e) { console.error(e); }
  return r;
 };
 const DF0 = window.drawFinal;
 window.drawFinal = function () {
  const G = game;
  if (!G || !G.car459) return DF0.apply(this, arguments);
  const cx = W / 2, win = G.score[0] > G.score[1], C = CA.get(), last = C && C.last;
  rect(0, 0, W, H, 'rgba(0,0,0,.55)');
  card(cx - 120, 14, 240, 156);
  text('FINAL' + (typeof otTag173 === 'function' ? otTag173(G) : '') + '  -  ' + DIFF_NAMES[G.diff != null ? G.diff : 1], cx, 20, 1, '#9aa', 'center');
  text(win ? 'YOU WIN!' : 'TOUGH LOSS', cx, 30, 4, win ? '#ffe14d' : '#ff5a4a', 'center', '#000');
  scoreLine(cx, 64);
  if (last && last.real) {
   text((C.me.n + ': ' + boxLine(last.b, C.me.pos)).toUpperCase().slice(0, 44), cx, 96, 1, '#cfe', 'center');
   text('+' + last.xp + ' EXP' + (last.ups && last.ups.length ? '  -  LEVEL UP! OVR ' + CA.ovrMe() : ''), cx, 106, 1, last.ups && last.ups.length ? '#7dff7a' : '#8fe3f0', 'center');
  }
  button('CAREER', cx - 110, 122, 104, 18, () => { CA.unregGame(); game = null; open(); }, { sc: 1, bg: '#9dffd0' });
  button('MENU', cx + 6, 122, 104, 18, () => { CA.unregGame(); screen = 'menu'; }, { bg: '#c9d6d9' });
  if (win) for (let i = 0; i < 40; i++) { const x = (i * 37 + G.finalT * 40 * (1 + i % 3)) % W, y = (i * 23 + G.finalT * 60 * (1 + i % 2)) % H; rect(x, y, 2, 2, [ '#2cc4dc', '#ffe14d', '#ff5a4a', '#ffffff' ][i % 4]); }
 };

 // ---------- JUST ME: you control only your guy ----------
 // defense: the defender you control is locked to your player. Loose balls: you chase. Offense: when a CPU teammate has the
 // ball he holds it a beat and feeds you (tap anywhere to call for it right away); your touches never move him.
 const meOf = G => G && G.players ? G.players.find(p => (p.team === 'O' || p.team === 'G2') && p.pl && p.pl.id === ME && !p.far && !p.gk) : null;
 // your guy is off the field on this possession (a defenseman or LSM while you have the ball): the CPU runs the offense
 function autoOff(G, J) {
  const c = G.carrier; if (!c) return;
  if (!J.run && J.t > .5) { J.run = true; G.pAuto = [ GX - 46 + Math.random() * 14, CY + (Math.random() - .5) * 50, 1 ]; }
  const near = c.x > GX - 75 && c.x < GX - 8;
  if (near && J.t > 1.6) { G.pAuto = null; J.t = 0; J.run = false; J.shots = (J.shots || 0) + 1; releaseShot(.35 + Math.random() * .3, Math.floor(Math.random() * 4)); return; }
  if (J.t > 2.6) { const m = (liveMates() || []).filter(p => !p.far && !p.gk && p.team === 'O'); G.pAuto = null; J.t = 0; J.run = false; if (m.length) { J.autoP = (J.autoP || 0) + 1; throwPass(m[Math.floor(Math.random() * m.length)]); } }
 }
 const justMe = () => false; // 466: JUST ME removed
 const ST0 = window.step;
 window.step = function (dt) {
  const r = ST0.apply(this, arguments);
  try {
   if (justMe() && !paused) {
    const G = game, me = meOf(G), J = G.car459.j || (G.car459.j = { t: 0, call: false, passes: 0, locks: 0 });
    const ok = me && !(me.down > 0) && !(me.stun > 0);
    if (screen === 'defense') {
     // your guy is on the field: you are locked to him. He is not (an attackman stays home): your D plays on its own.
     if (ok && me.team === 'O') { if (G.dctl !== me) { G.dctl = me; J.locks++; } }
     else if (!me && G.dctl) { G.dctl = null; J.auto = (J.auto || 0) + 1; }
    }
    if (screen === 'live') {
     if (canShoot() && G.carrier !== me) {
      J.t += dt;
      if (ok) { if (J.call || J.t > .9) { throwPass(me); J.t = 0; J.call = false; J.passes++; } }
      else if (!me) autoOff(G, J);
     } else { J.t = 0; J.call = false; J.run = false; }
     if (ok && G.ball && (G.ball.state === 'loose' || G.ball.state === 'chase') && G.ctrl && G.ctrl !== me) G.ctrl = me;
    }
    J.on = !!me;
   }
   // the career teams leave the registry once the game is left
   if ((screen === 'menu' || screen === 'car459') && SZ_REG.C459U) { CA.unregGame(); if (game && game.car459 && !game.over) game.car459.left = true; }
  } catch (e) { console.error(e); }
  return r;
 };
 for (const nm of [ 'inDown', 'inMove', 'inUp' ]) {
  const f0 = window[nm];
  if (typeof f0 !== 'function') continue;
  window[nm] = function (id) {
   try {
    const G = game;
    if (justMe() && screen === 'defense' && !meOf(G)) { if (nm === 'inUp') { try { pointers.delete(id); } catch (e) {} } return; }
    if (justMe() && screen === 'live' && canShoot()) {
     const me = meOf(G);
     if (G.carrier !== me) { if (nm === 'inDown') G.car459.j && (G.car459.j.call = true); if (nm === 'inUp') { try { pointers.delete(id); } catch (e) {} } return; }
    }
   } catch (e) { console.error(e); }
   return f0.apply(this, arguments);
  };
 }
 function jmTip(s) { const w = textW(s, 1) + 8; rect(Math.round(W / 2 - w / 2), 37, w, 9, 'rgba(0,0,0,.6)'); text(s, W / 2, 39, 1, '#ffe14d', 'center'); }
 // an on-field tag so you can find your guy
 const DR0 = window.render;
 window.render = function () {
  const r = DR0.apply(this, arguments);
  try {
   const G = game;
   if (G && G.car459 && (screen === 'live' || screen === 'defense' || screen === 'faceoff') && G.players) {
    const me = G.players.find(p => p.pl && p.pl.id === ME);
    if (me && !me.far) { const x = Math.round(me.x - camX), y = Math.round(me.y - 40); if (x > -10 && x < W + 10) { text('YOU', x, y - 7, 1, '#ffe14d', 'center', '#000'); rect(x - 3, y, 7, 2, '#ffe14d'); rect(x - 2, y + 2, 5, 1, '#ffe14d'); rect(x - 1, y + 3, 3, 1, '#ffe14d'); rect(x, y + 4, 1, 1, '#ffe14d'); } }
    if (G.car459.ctl === 'me' && !G.over) {
     const on = meOf(G);
     if (screen === 'live' && canShoot() && G.carrier && G.carrier.pl && G.carrier.pl.id !== ME) jmTip(on ? 'JUST ME - TAP TO CALL FOR IT' : 'JUST ME - YOUR TEAM RUNS THE OFFENSE');
     else if (screen === 'defense' && !on) jmTip('JUST ME - YOUR D PLAYS ON ITS OWN');
    }
   }
  } catch (e) {}
  return r;
 };
 // the pre-game header says which career game this is (the engine prints QUICK GAME for any other mode)
 const TX0 = window.text;
 if (typeof TX0 === 'function') window.text = function (s) {
  if (s === 'QUICK GAME' && screen === 'pregame') { const G = game; if (G && G.car459 && G.meta && G.meta.label) { const a = Array.prototype.slice.call(arguments); a[0] = String(G.meta.label).toUpperCase(); return TX0.apply(this, a); } }
  return TX0.apply(this, arguments);
 };
 window.CAR459U = { open: open, U: U, cardHtml: cardHtml };
})();
