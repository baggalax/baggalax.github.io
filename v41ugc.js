// ===== BAGGA LAX V41 UGC SAFETY (v41ugc.js) - App Store guideline 1.2 (user-generated content) =====
// 1. ONE FILTER for every name a player types or another player can see: UGC41.bad(text) -> true/false. It runs the game's own two
//    in-house filters (c30.js badName, names31b.js nameProblem) PLUS the extra list below (slurs, sexual words, hate symbols / numbers,
//    leet + spaced + repeated-letter spellings). Every word list here was written for this game (no third-party list, no license needed).
//    The SAME list is in server/server41.js so the server refuses bad usernames too (a hacked phone can't skip it).
// 2. WHAT THE OTHER PLAYER SENT is checked on arrival: names in online lobby / game / season answers (hname, gname, team + card names) that
//    fail the filter show as PLAYER; usernames in the friends list, friend requests and the invite banner show as PLAYER (the button still
//    acts on the real account).
// 3. REPORT + BLOCK: every friend row and friend request gets a "..." button (REPORT / BLOCK); the online lobby + the end of an online game get
//    a small REPORT / BLOCK button for the player you're facing. BLOCK = he leaves your friends list, his requests + invites are hidden on this
//    phone right away and refused by the server (POST /api/app41/block); BLOCKED PLAYERS (bottom of FRIENDS) has UNBLOCK. REPORT posts to
//    /api/app41/report (logged for Charlie to review; support.html promises a look within 24 hours).
// Ids, save keys and the online protocol are unchanged (the block list is a device key rlx_block41 + the server). Off: window.__rl_no41ugc
// (and always off in FISH, __rl_v124gb).
(function () {
  'use strict';
  var W = window;
  if (W.__rl_no41ugc || W.__rl_v124gb) return;
  var LEET = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b', '9': 'g', '2': 'z', '6': 'g', '@': 'a', '$': 's', '!': 'i', '|': 'i', '+': 't', '(': 'c', '<': 'c' };
  // substrings: refused anywhere inside the letters (spaces / dots / repeats removed)
  var SUB = ['fuck', 'fvck', 'phuck', 'fukk', 'shit', 'bitch', 'biatch', 'cunt', 'nigg', 'niga', 'nigr', 'nlgg', 'negro', 'fagot', 'faggot', 'retard', 'whore', 'slut',
    'pussy', 'penis', 'vagina', 'dildo', 'porn', 'jizz', 'wetback', 'tranny', 'shemale', 'hitler', 'siegheil', 'kkk', 'twat', 'bastard', 'asshole', 'dickhead',
    'motherf', 'cocksuck', 'blowjob', 'handjob', 'rimjob', 'boob', 'molest', 'pedophil', 'paedo', 'beaner', 'lesbo', 'chink', 'kike', 'raghead', 'towelhead', 'sandnig',
    'cumshot', 'cumslut', 'cumming', 'orgasm', 'erection', 'masturb', 'testicl', 'scrotum', 'bollock', 'buttplug', 'butthole', 'shithead', 'jackass', 'dumbass', 'fatass',
    'killyourself', 'kilyourself', 'rapist', 'wanker', 'hentai', 'bukkake', 'gangbang', 'deepthroat', 'incest', 'bestiality', 'zoophil', 'spastic', 'mongoloid',
    'clitoris', 'nipple', 'dickface', 'cockface', 'pornhub', 'onlyfans', 'xvideos', 'gaschamber', 'whitepower', 'whitepride', 'kukluxklan', 'goatse', 'tubgirl'];
  // whole words / tokens: refused when a word IS one of these (+ a plural s)
  var WORD = ['ass', 'asses', 'arse', 'cum', 'cock', 'cocks', 'dick', 'dicks', 'tit', 'tits', 'titty', 'titties', 'rape', 'raped', 'raping', 'spic', 'spick', 'coon', 'coons',
    'homo', 'dyke', 'fag', 'fags', 'hoe', 'hoes', 'sex', 'sexy', 'anal', 'anus', 'piss', 'boner', 'horny', 'nude', 'nudes', 'naked', 'jap', 'japs', 'nonce', 'thot', 'skank',
    'slag', 'prick', 'milf', 'dilf', 'nig', 'nigs', 'sht', 'fk', 'fkn', 'fuk', 'fck', 'fu', 'stfu', 'gtfo', 'wtf', 'heil', 'sieg', 'incel', 'semen', 'pedo', 'pedos', 'wank',
    'kys', 'gook', 'spaz', 'loli', 'xxx', 'nsfw', 'clit', 'vulva', 'labia', 'nazi', 'nazis'];
  var NUM = ['1488', '14 88', '14/88'];   // hate numbers (checked on the raw text)
  var coll = function (s) { return s.replace(/(.)\1+/g, '$1'); };
  var c2 = function (s) { return s.replace(/(.)\1{2,}/g, '$1$1'); };
  function norm(raw) { return String(raw == null ? '' : raw).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split('').map(function (c) { return LEET[c] || c; }).join(''); }
  function own(raw) {   // the extra list
    var s = String(raw == null ? '' : raw);
    for (var i = 0; i < NUM.length; i++) if (s.indexOf(NUM[i]) >= 0) return true;
    var lt = norm(s), letters = lt.replace(/[^a-z]/g, ''), cl = coll(letters), l2 = c2(letters);
    for (var j = 0; j < SUB.length; j++) { var b = SUB[j]; if (letters.indexOf(b) >= 0 || l2.indexOf(b) >= 0 || (coll(b).length >= 4 && cl.indexOf(coll(b)) >= 0)) return true; }
    var toks = lt.split(/[^a-z]+/).filter(Boolean);
    // spaced-out spellings (f u c k / f.u.c.k): runs of single letters joined
    var run = '', runs = []; toks.forEach(function (w) { if (w.length === 1) run += w; else { if (run.length > 1) runs.push(run); run = ''; } }); if (run.length > 1) runs.push(run);
    toks = toks.concat(runs); if (toks.length > 1) toks.push(letters);
    // camel / underscore words (BigDick_99): split on case changes too
    String(raw).replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase().split(/[^a-z0-9@$!|]+/).forEach(function (w) { var x = norm(w).replace(/[^a-z]/g, ''); if (x) toks.push(x); });
    for (var k = 0; k < toks.length; k++) {
      var t = toks[k], t2 = c2(t), t1 = coll(t);
      for (var m = 0; m < WORD.length; m++) { var w = WORD[m]; if (t === w || t === w + 's' || t2 === w || t2 === w + 's' || (coll(w) === w && (t1 === w || t1 === w + 's'))) return true; }
    }
    return false;
  }
  function bad(raw) {
    if (raw == null) return false; var s = String(raw); if (!s.trim()) return false;
    if (own(s)) return true;
    try { if (W.C30 && C30.badName) { var r = C30.badName(s); if (r && /NOT ALLOWED/.test(r)) return true; } } catch (e) { }
    try { if (W.ED31_nameProblem) { var r2 = ED31_nameProblem(s); if (r2 && /NOT ALLOWED/.test(r2)) return true; } } catch (e) { }
    return false;
  }
  var MASK = 'PLAYER';
  var U = W.UGC41 = { bad: bad, own: own, SUB: SUB, WORD: WORD, NUM: NUM, MASK: MASK, log: [], masked: 0 };
  U.show = function (s) { return bad(s) ? MASK : s; };
  // ---------- names a player types: the V35 hook (V35.nameBad) now also runs the extra list ----------
  function hookV35() {
    if (!W.V35 || !V35.nameBad || V35.nameBad.__u41) return;
    var nb = V35.nameBad; V35.nameBad = function (raw) { var r = nb.apply(this, arguments); if (r) return r; return raw != null && String(raw).trim() && own(raw) ? 'THAT NAME IS NOT ALLOWED - TRY ANOTHER' : null; }; V35.nameBad.__u41 = true;
  }
  function hookC30() {
    if (!W.C30 || !C30.badName || C30.badName.__u41) return;
    var b0 = C30.badName; C30.badName = function (raw) { var r = b0.apply(this, arguments); if (r) return r; return own(raw) ? 'THAT NAME IS NOT ALLOWED - TRY ANOTHER' : null; }; C30.badName.__u41 = true;
  }
  function hookED31() {
    if (!W.ED31_nameProblem || W.ED31_nameProblem.__u41) return;
    var e0 = W.ED31_nameProblem; W.ED31_nameProblem = function (raw) { var r = e0.apply(this, arguments); if (r) return r; return own(raw) ? 'THAT NAME IS NOT ALLOWED' : null; }; W.ED31_nameProblem.__u41 = true;
  }
  // ---------- what the other phone sent: online answers ----------
  // only the fields a player can type: the usernames (hname / gname) and the EDIT NAMES payload that rides online (hszn / gszn .nm33 =
  // { t: team name, f: full name, a: short name, p: { playerId: name } }, v33.js). A bad team / player name is DROPPED (his phone then shows
  // the game's own name for it); a bad username shows as PLAYER. Online seasons: the same two keys anywhere in the season state.
  function scrubNm(d) {
    var c = 0; if (!d || typeof d !== 'object') return 0;
    ['t', 'f', 'a'].forEach(function (k) { if (typeof d[k] === 'string' && bad(d[k])) { delete d[k]; c++; } });
    if (d.p && typeof d.p === 'object') for (var id in d.p) if (typeof d.p[id] === 'string' && bad(d.p[id])) { delete d.p[id]; c++; }
    return c;
  }
  function scrub(o, depth) {
    if (!o || typeof o !== 'object' || depth > 8) return 0; var c = 0;
    for (var k in o) {
      var v = o[k];
      if (typeof v === 'string') { if ((k === 'hname' || k === 'gname' || k === 'uname') && v.length <= 40 && bad(v)) { o[k] = MASK; c++; } }
      else if (v && typeof v === 'object') { if (k === 'nm33') c += scrubNm(v); else c += scrub(v, depth + 1); }
    }
    return c;
  }
  U.scrub = scrub;
  var F0 = W.fetch;
  W.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    var p = F0.apply(this, arguments);
    if (!/\/api\/(room|season)\b/.test(url)) return p;
    return p.then(function (r) {
      try {
        var ct = r.headers.get('content-type') || ''; if (!/json/.test(ct)) return r;
        return r.clone().json().then(function (j) {
          var n = scrub(j, 0); if (!n) return r; U.masked += n;
          return new Response(JSON.stringify(j), { status: r.status, statusText: r.statusText, headers: r.headers });
        }).catch(function () { return r; });
      } catch (e) { return r; }
    });
  };
  // ---------- block list (this phone) + the server ----------
  var BK = 'rlx_block41';
  function blocks() { try { var a = JSON.parse(localStorage.getItem(BK) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
  function setBlocks(a) { try { localStorage.setItem(BK, JSON.stringify(a.slice(-200))); } catch (e) { } }
  function isBlocked(u) { u = String(u || '').toLowerCase(); return !!u && blocks().indexOf(u) >= 0; }
  U.blocks = blocks; U.isBlocked = isBlocked;
  function tok() { try { return (W.V23 && V23.A && V23.A().tok) || ''; } catch (e) { return ''; } }
  function dev() { try { return (W.RLNET && RLNET.dev) || localStorage.getItem('rl_dev') || ''; } catch (e) { return ''; } }
  function post(path, body) {
    return fetch('/api/app41/' + path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(Object.assign({ dev: dev(), tok: tok() }, body || {})) })
      .then(function (r) { return r.json().catch(function () { return { ok: false, error: 'NOT AVAILABLE YET (' + r.status + ')' }; }); })
      .catch(function () { return { ok: false, error: 'NO CONNECTION', net: true }; });
  }
  U.post = post;
  U.block = function (u, where) {
    u = String(u || '').toLowerCase(); if (!u) return Promise.resolve({ ok: false });
    var a = blocks(); if (a.indexOf(u) < 0) { a.push(u); setBlocks(a); }
    U.log.push('block ' + u + ' ' + (where || ''));
    return post('block', { u: u, where: where || '' }).then(function (r) { try { if (W.V23 && V23.isOpen && V23.isOpen()) V23.render(); } catch (e) { } return r; });
  };
  U.unblock = function (u) {
    u = String(u || '').toLowerCase(); setBlocks(blocks().filter(function (x) { return x !== u; }));
    return post('unblock', { u: u });
  };
  U.report = function (u, why, where, extra) {
    U.log.push('report ' + u + ' ' + why + ' ' + where);
    return post('report', Object.assign({ u: String(u || ''), why: why, where: where || '' }, extra || {}));
  };
  // ---------- the REPORT / BLOCK popup ----------
  var css = '#ugc41{position:fixed;inset:0;z-index:60;background:rgba(0,0,0,.74);display:none;align-items:center;justify-content:center;font:bold 12px/1.3 "Courier New",ui-monospace,monospace;color:#cfe;text-transform:uppercase}' +
    '#ugc41 .box{background:#13202b;border:3px solid #ff8a7a;box-shadow:4px 4px 0 #000;padding:10px 12px;max-width:520px;width:92%;max-height:92%;overflow:auto}#ugc41 h2{margin:0 0 6px;color:#ffe14d;font-size:15px}' +
    '#ugc41 .sm{font-size:10px;color:#8fe3f0;margin:4px 0}#ugc41 .ok{color:#7dff7a}#ugc41 .err{color:#ff8a7a}' +
    '#ugc41 button{font:inherit;text-transform:uppercase;border:0;padding:8px 10px;margin:3px 4px 0 0;box-shadow:0 2px 0 #000;cursor:pointer;color:#0b1a20;background:#c9d6d9;touch-action:manipulation}' +
    '#ugc41 button.r{background:#ff8a7a}#ugc41 button.y{background:#ffd23a}#ugc41 button.g{background:#7dff7a}' +
    '#acct23 button.u41{padding:6px 7px;background:#c9d6d9}#acct23 .b41 .n{color:#8a9aa3}' +
    '#ugc41lb{position:fixed;z-index:30;right:max(6px,env(safe-area-inset-right));top:max(6px,env(safe-area-inset-top));display:none;font:bold 10px "Courier New",ui-monospace,monospace;text-transform:uppercase;border:0;padding:5px 7px;background:rgba(19,32,43,.9);color:#ff8a7a;box-shadow:0 2px 0 #000;outline:2px solid #ff8a7a;cursor:pointer;touch-action:manipulation}';
  var box = null;
  function el(tag, attrs, kids) { var e = document.createElement(tag); for (var k in attrs || {}) { if (k === 'on') e.addEventListener('click', attrs.on); else if (k === 'text') e.textContent = attrs[k]; else e.setAttribute(k, attrs[k]); } (kids || []).forEach(function (c) { if (c) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); }); return e; }
  function bt(label, cls, fn, id) { return el('button', { 'class': cls || '', id: id || '', on: function (e) { e.preventDefault(); e.stopPropagation(); fn(); } }, [label]); }
  function mount() {
    if (box) return;
    var s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
    box = el('div', { id: 'ugc41' }); document.body.appendChild(box);
    ['touchstart', 'touchend', 'pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'keydown'].forEach(function (ev) { box.addEventListener(ev, function (e) { e.stopPropagation(); }); });
  }
  function close() { if (box) { box.style.display = 'none'; box.textContent = ''; } U.open = false; }
  var REASONS = [['name', 'BAD NAME'], ['bully', 'BULLYING / MEAN'], ['cheat', 'CHEATING'], ['other', 'SOMETHING ELSE']];
  // u = the account username (may be ''), shown = what the screen shows, where = 'friends' | 'request' | 'invite' | 'lobby' | 'game', extra = { code, side }
  U.menu = function (u, shown, where, extra, after) {
    mount(); U.open = true; box.textContent = ''; box.style.display = 'flex';
    var b = el('div', { 'class': 'box' }); box.appendChild(b);
    var who = shown || u || 'THIS PLAYER';
    function main() {
      b.textContent = '';
      b.appendChild(el('h2', { text: who }));
      b.appendChild(el('div', { 'class': 'sm', text: 'REPORT = TELL US ABOUT A BAD NAME, BULLYING OR CHEATING. BLOCK = HE CAN\'T ADD YOU, INVITE YOU OR SHOW UP IN YOUR LISTS.' }));
      b.appendChild(el('div', {}, [bt('REPORT', 'y', report, 'u41rep'), bt(isBlocked(u) ? 'UNBLOCK' : 'BLOCK', 'r', isBlocked(u) ? unblock : block, 'u41blk'), bt('CANCEL', '', close, 'u41x')]));
    }
    function report() {
      b.textContent = '';
      b.appendChild(el('h2', { text: 'REPORT ' + who }));
      b.appendChild(el('div', { 'class': 'sm', text: 'WHAT HAPPENED?' }));
      var row = el('div'); REASONS.forEach(function (r) { row.appendChild(bt(r[1], 'y', function () { send(r[0]); }, 'u41r_' + r[0])); }); b.appendChild(row);
      b.appendChild(bt('BACK', '', main));
    }
    function send(why) {
      b.textContent = ''; b.appendChild(el('h2', { text: 'SENDING...' }));
      U.report(u, why, where, extra).then(function (r) {
        b.textContent = '';
        b.appendChild(el('h2', { text: r && r.ok ? 'THANKS - REPORT SENT' : 'REPORT SAVED' }));
        b.appendChild(el('div', { 'class': 'sm' + (r && r.ok ? ' ok' : ''), text: r && r.ok ? 'WE LOOK AT EVERY REPORT WITHIN 24 HOURS.' : 'NO CONNECTION RIGHT NOW (' + ((r && r.error) || '?') + '). YOU CAN ALSO EMAIL US FROM SUPPORT.' }));
        b.appendChild(el('div', {}, [isBlocked(u) ? null : bt('BLOCK HIM TOO', 'r', block, 'u41blk2'), bt('DONE', 'g', function () { close(); if (after) after('report'); }, 'u41done')]));
      });
    }
    function block() {
      b.textContent = ''; b.appendChild(el('h2', { text: 'BLOCKING...' }));
      U.block(u || shown, where).then(function (r) {
        b.textContent = '';
        b.appendChild(el('h2', { text: who + ' IS BLOCKED' }));
        b.appendChild(el('div', { 'class': 'sm', text: 'HE IS OFF YOUR FRIENDS LIST AND CAN\'T ADD OR INVITE YOU. UNBLOCK ANY TIME: FRIENDS > BLOCKED PLAYERS.' + (r && r.ok ? '' : ' (THIS PHONE HIDES HIM NOW; THE SERVER GETS IT NEXT TIME YOU\'RE ONLINE)') }));
        b.appendChild(bt('DONE', 'g', function () { close(); if (after) after('block'); }, 'u41done'));
      });
    }
    function unblock() { U.unblock(u || shown).then(function () { close(); try { if (W.V23 && V23.isOpen && V23.isOpen()) V23.render(); } catch (e) { } if (after) after('unblock'); }); }
    main();
  };
  // ---------- the friends panel (acct23.js) ----------
  function nameIn(row) { var n = row.querySelector('.n'); return n ? n.textContent : ''; }
  function decorate(root) {
    if (!root || root.__u41busy) return; root.__u41busy = true;
    try {
      var rows = root.querySelectorAll('.row.fr23, .row.inc23, .row.out23');
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i]; if (r.__u41) continue; r.__u41 = true;
        var isInc = r.classList.contains('inc23'), isOut = r.classList.contains('out23');
        var txt = nameIn(r), u = r.getAttribute('data-u') || (isInc ? txt.replace(/ WANTS TO BE FRIENDS$/, '') : isOut ? txt.replace(/^WAITING FOR /, '') : txt);
        if (isBlocked(u)) { r.style.display = 'none'; if (isInc) { var no = r.querySelectorAll('button')[1]; if (no) setTimeout(function (b) { return function () { b.click(); }; }(no), 0); } continue; }
        var nEl = r.querySelector('.n');
        var shown = bad(u) ? MASK : u.toUpperCase();
        if (nEl && bad(u)) { nEl.textContent = isInc ? MASK + ' WANTS TO BE FRIENDS' : isOut ? 'WAITING FOR ' + MASK : MASK; U.masked++; }
        if (isOut) continue;
        (function (u, shown, isInc) { r.appendChild(bt('...', 'u41', function () { U.menu(u, shown, isInc ? 'request' : 'friends'); }, '')); })(u, shown, isInc);
      }
      // BLOCKED PLAYERS (with UNBLOCK) under the friends list
      var lst = blocks(), f = root.querySelector('#f23');
      if (f && lst.length && !root.querySelector('#u41bl')) {
        var col = f.closest('.col') || f.parentNode.parentNode, wrap = el('div', { id: 'u41bl', style: 'margin-top:8px' });
        wrap.appendChild(el('h2', { text: 'BLOCKED PLAYERS (' + lst.length + ')' }));
        lst.forEach(function (u) { wrap.appendChild(el('div', { 'class': 'row b41' }, [el('span', { 'class': 'n', text: bad(u) ? MASK : u.toUpperCase() }), bt('UNBLOCK', 'w', function () { U.unblock(u).then(function () { try { V23.render(); } catch (e) { } }); }, '')])); });
        col.appendChild(wrap);
      }
    } finally { root.__u41busy = false; }
  }
  function invBanner() {
    var ib = document.getElementById('i23'); if (!ib || ib.style.display === 'none') return;
    var sp = ib.querySelector('span'); if (!sp) return;
    var m = /^(.*?) INVITED YOU /.exec(sp.textContent); if (!m) return;
    var u = m[1];
    if (isBlocked(u)) { var no = document.getElementById('i23no'); if (no && !ib.__u41n) { ib.__u41n = true; setTimeout(function () { ib.__u41n = false; no.click(); }, 0); } return; }
    if (bad(u)) { sp.textContent = sp.textContent.replace(u, MASK); U.masked++; }
  }
  // ---------- the online lobby / end of an online game: REPORT / BLOCK the player you're facing ----------
  var lb = null;
  var LOBBY = { onLobby: 1, onTeam: 1, final: 1 };
  function lobbyBtn() {
    var N = W.RLNET; var sc = (typeof screen === 'string') ? screen : '';
    try { if (N && N.code) { if (N.lobby && N.lobby.state) U.masked += scrub(N.lobby.state, 0); if (N.st) U.masked += scrub(N.st, 0); } } catch (e) { }   // whatever reached the game by another road (the live link) too
    var opp = '', show = false;
    try { if (N && N.code && LOBBY[sc] && (sc !== 'final' || N.inGame || N.code)) { opp = N.oppName ? N.oppName() : ''; show = !!opp; } } catch (e) { }
    if (!lb) {
      if (!show) return;
      lb = el('button', { id: 'ugc41lb', on: function (e) { e.preventDefault(); e.stopPropagation(); var N2 = W.RLNET, o = N2 && N2.oppName ? N2.oppName() : ''; U.menu(o, bad(o) ? MASK : String(o).toUpperCase().replace(/_/g, '-'), sc === 'final' ? 'game' : 'lobby', { code: N2 && N2.code, side: N2 && N2.side === 'h' ? 'g' : 'h' }, function (what) { if (what === 'block') { try { if (N2 && N2.leave && N2.code && !N2.inGame) N2.leave(); } catch (e2) { } } }); } }, ['REPORT / BLOCK']);
      ['touchstart', 'touchend', 'pointerdown', 'pointerup', 'mousedown', 'mouseup'].forEach(function (ev) { lb.addEventListener(ev, function (e) { e.stopPropagation(); }); });
      document.body.appendChild(lb);
    }
    lb.style.display = show && !U.open ? 'block' : 'none';
  }
  U.lobbyBtn = lobbyBtn;
  function boot() {
    hookV35(); hookC30(); hookED31();
    var root = document.getElementById('acct23');
    if (root) { decorate(root); new MutationObserver(function () { decorate(root); }).observe(root, { childList: true, subtree: true }); }
    var ib = document.getElementById('i23');
    if (ib) new MutationObserver(invBanner).observe(ib, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });
    if (!root || !ib) { setTimeout(boot, 700); return; }
    setInterval(function () { try { lobbyBtn(); } catch (e) { } }, 400);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 50); }); else setTimeout(boot, 50);
})();
