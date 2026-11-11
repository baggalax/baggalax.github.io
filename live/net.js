'use strict';

(function() {
 const API = '/api';
 const RTC_CFG = {
  iceServers: [ {
   urls: [ 'stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302' ]
  }, {
   urls: 'stun:stun.cloudflare.com:3478'
  } ]
 };
 const NETV = 'v14.0.3';
 const GAMEV = window.__rl_no26 || window.__rl_v124gb ? 'v24' : 'v28';
 const WS_BASE = window.__rlWS || 'wss://retrolax-net.sites.tab.bot';
 const NOREL = {
  au: 1,
  hb: 1,
  tp: 1,
  tq: 1,
  pi: 1,
  po: 1,
  sig: 1,
  ver: 1
 };
 const devId = (() => {
  let d = null;
  try {
   d = localStorage.getItem('rl_dev');
  } catch (e) {}
  if (!d || !/^[A-Za-z0-9_-]{8,40}$/.test(d)) {
   d = 'd' + (() => {
    try {
     const a = new Uint32Array(2);
     crypto.getRandomValues(a);
     return a[0].toString(36) + a[1].toString(36).slice(0, 2);
    } catch (e) {
     return String(performance.now()).replace('.', '').slice(-8);
    }
   })() + Date.now().toString(36);
   try {
    localStorage.setItem('rl_dev', d);
   } catch (e) {}
  }
  return d;
 })();
 const N = window.RLNET = {
  v: NETV,
  dev: devId,
  on: false,
  code: null,
  side: null,
  kind: null,
  lobby: null,
  err: null,
  msg: null,
  msgT: 0,
  inGame: false,
  auth: false,
  link: null,
  opp: null,
  stats: {
   sent: 0,
   recv: 0,
   snaps: 0,
   applied: 0,
   handoffs: 0,
   fo: 0
  },
  testHooks: {}
 };
 async function call(path, body, q) {
  const url = API + path + (q ? '?' + new URLSearchParams(Object.assign({
   dev: devId
  }, q)) : body ? '' : '?dev=' + devId);
  const opt = body ? {
   method: 'POST',
   headers: {
    'content-type': 'application/json'
   },
   body: JSON.stringify(Object.assign({
    dev: devId
   }, body))
  } : {
   cache: 'no-store'
  };
  const r = await fetch(url, opt);
  let j = null;
  try {
   j = await r.json();
  } catch (e) {
   j = {
    ok: false,
    error: 'bad answer (' + r.status + ')'
   };
  }
  if (!r.ok && j && j.ok !== false) j.ok = false;
  return j;
 }
 N.call = call;
 function flash(s, t) {
  N.msg = s;
  N.msgT = t || 2.5;
 }
 const CLK = N.clk = {
  srvOff: null,
  srvRtt: null,
  srvS: [],
  peerOff: null,
  peerRtt: null,
  peerAt: 0,
  peerS: [],
  wsOff: null,
  wsRtt: null,
  wsS: [],
  wsAt: 0
 };
 function bestOf(arr) {
  let b = null;
  for (const s of arr) if (!b || s.rtt < b.rtt) b = s;
  return b;
 }
 function clkSrv(st, p0, p1) {
  const rtt = p1 - p0, mid = performance.timeOrigin + (p0 + p1) / 2;
  CLK.srvS.push({
   off: st - mid,
   rtt: rtt
  });
  if (CLK.srvS.length > 60) CLK.srvS.shift();
  const b = bestOf(CLK.srvS);
  CLK.srvOff = b.off;
  CLK.srvRtt = b.rtt;
 }
 function clkWs(c, s) {
  const t1 = performance.now(), rtt = t1 - c, mid = performance.timeOrigin + (c + t1) / 2;
  if (!(rtt >= 0 && rtt < 5e3)) return;
  CLK.wsS.push({
   off: s - mid,
   rtt: rtt
  });
  if (CLK.wsS.length > 24) CLK.wsS.shift();
  const b = bestOf(CLK.wsS);
  CLK.wsOff = b.off;
  CLK.wsRtt = b.rtt;
  CLK.wsAt = performance.now();
 }
 function clkPeer(a, b) {
  const t1 = nowMs(), rtt = t1 - a;
  CLK.peerS.push({
   off: b - (a + t1) / 2,
   rtt: rtt
  });
  if (CLK.peerS.length > 12) CLK.peerS.shift();
  const s = bestOf(CLK.peerS);
  CLK.peerOff = s.off;
  CLK.peerRtt = s.rtt;
  CLK.peerAt = performance.now();
 }
 class Link {
  constructor(code, side) {
   this.code = code;
   this.side = side;
   this.out = [];
   this.latestOut = null;
   this.lseqOut = 0;
   this.lseqIn = 0;
   this.after = 0;
   this.seqOut = 0;
   this.sid = Math.random().toString(36).slice(2, 8);
   this.seen = new Set;
   this.heard = performance.now();
   this.alive = true;
   this.p2p = false;
   this.pc = null;
   this.dcR = null;
   this.dcU = null;
   this.onEvent = null;
   this.onLatest = null;
   this.pollBusy = false;
   this.flushBusy = false;
   this.lastFlush = 0;
   this.lastPoll = 0;
   this.rtcTried = false;
   this.relayOnly = !!window.__rlNoP2P;
   this.stats = {
    relaySent: 0,
    relayPolls: 0,
    p2pSent: 0,
    p2pRecv: 0,
    relayRecv: 0,
    rtt: null,
    wsSent: 0,
    wsRecv: 0,
    wsOpens: 0,
    wsFails: 0,
    backup: 0
   };
   this.ws = null;
   this.heardW = 0;
   this.wsNext = 0;
   this.wsFail = 0;
   this.noWS = !!window.__rlNoWS;
   this.ping = {
    DIRECT: null,
    WS: null,
    RELAY: null
   };
   this.piT = 0;
   this.syncT = 0;
   this.hbW = 0;
   this.timer = setInterval(() => this.tick(), 50);
   this.wsConnect();
  }
  close() {
   this.alive = false;
   clearInterval(this.timer);
   try {
    this.dcR && this.dcR.close();
    this.dcU && this.dcU.close();
    this.pc && this.pc.close();
   } catch (e) {}
   try {
    this.ws && this.ws.close();
   } catch (e) {}
   this.ws = null;
  }
  p2pOk() {
   return this.p2p && this.dcR && this.dcR.readyState === 'open' && performance.now() - (this.heardP || 0) < 2500;
  }
  wsOk() {
   return !!(this.ws && this.ws.readyState === 1 && performance.now() - this.heardW < 2500);
  }
  fastOk() {
   return this.p2pOk() || this.wsOk();
  }
  route() {
   return this.p2pOk() ? this.turn ? 'TURN' : 'DIRECT' : this.wsOk() ? 'WS' : 'RELAY';
  }
  pingMs() {
   const r = this.route(), k = r === 'TURN' ? 'DIRECT' : r;
   return this.ping[k] != null ? Math.round(this.ping[k]) : null;
  }
  oneWay() {
   const r = this.route(), p = this.pingMs();
   if (r === 'RELAY') return Math.max(600, p != null ? p / 2 : 1e3);
   return p != null ? p / 2 : r === 'WS' ? 120 : 60;
  }
  wsConnect() {
   if (!this.alive || this.noWS || typeof WebSocket === 'undefined' || this.ws) return;
   let ws;
   try {
    ws = new WebSocket(WS_BASE + '/r/rl' + this.code + '?s=' + this.side);
   } catch (e) {
    this.wsFail++;
    this.wsNext = performance.now() + Math.min(1e4, 1e3 * this.wsFail);
    return;
   }
   this.ws = ws;
   this.wsBorn = performance.now();
   ws.onopen = () => {
    this.stats.wsOpens++;
    this.wsFail = 0;
    N.wsAt = Date.now();
    for (let i = 0; i < 8; i++) setTimeout(() => this.wsSync(), i * 140);
    this.wsHb();
   };
   ws.onmessage = m => {
    let o = null;
    try {
     o = JSON.parse(m.data);
    } catch (e) {
     return;
    }
    if (o.rx) {
     if (o.t === 'st') clkWs(o.c, o.sv);
     return;
    }
    this.stats.wsRecv++;
    this.heardW = performance.now();
    if (o.L) this.gotLatest(o.L); else {
     o._ws = true;
     this.gotEvent(o);
    }
   };
   const down = () => {
    if (this.ws !== ws) return;
    this.ws = null;
    this.heardW = 0;
    this.wsFail++;
    this.stats.wsFails++;
    this.wsNext = performance.now() + Math.min(1e4, 700 * this.wsFail);
   };
   ws.onclose = down;
   ws.onerror = () => {
    try {
     ws.close();
    } catch (e) {}
    down();
   };
  }
  wsSync() {
   if (this.ws && this.ws.readyState === 1) try {
    this.ws.send('{"t":"sync","c":' + performance.now().toFixed(3) + '}');
   } catch (e) {}
  }
  wsHb() {
   if (this.ws && this.ws.readyState === 1) try {
    this.hbW = performance.now();
    this.ws.send(JSON.stringify({
     t: 'hb',
     q: ++this.seqOut,
     s: this.sid
    }));
   } catch (e) {}
  }
  send(e) {
   e.q = ++this.seqOut;
   e.s = this.sid;
   let sent = false;
   if (this.p2pOk() && this.dcR && this.dcR.readyState === 'open') {
    try {
     this.dcR.send(JSON.stringify(e));
     this.stats.p2pSent++;
     sent = true;
    } catch (er) {}
   }
   if (!sent && this.wsOk()) {
    try {
     this.ws.send(JSON.stringify(e));
     this.stats.wsSent++;
     sent = true;
    } catch (er) {}
   }
   if (!sent) this.out.push(e); else if (!NOREL[e.t]) {
    this.out.push(e);
    this.stats.backup++;
   }
  }
  latest(o) {
   o.lq = ++this.lseqOut;
   if (this.p2pOk() && this.dcU && this.dcU.readyState === 'open') {
    try {
     this.dcU.send(JSON.stringify({
      L: o
     }));
     this.stats.p2pSent++;
     return;
    } catch (er) {}
   }
   if (this.wsOk()) {
    try {
     this.ws.send(JSON.stringify({
      L: o
     }));
     this.stats.wsSent++;
     return;
    } catch (er) {}
   }
   this.latestOut = o;
  }
  gotEvent(e) {
   this.heard = performance.now();
   if (e.s && e.s !== this.peerSid) {
    const had = !!this.peerSid;
    this.peerSid = e.s;
    if (had) {
     this.resetRTC();
     if (this.side === 'h') setTimeout(() => {
      if (this.alive) this.startRTC();
     }, 300);
    }
   }
   if (e.q != null) {
    const dk = (e.s || '') + ':' + e.q;
    if (this.seen.has(dk)) return;
    this.seen.add(dk);
    if (this.seen.size > 4e3) {
     const a = [ ...this.seen ].slice(-2e3);
     this.seen = new Set(a);
    }
   }
   if (e.t === 'sig') return this.signal(e);
   if (e.t === 'hb') return;
   if (e.t === 'pi') {
    this.send({
     t: 'po',
     a: e.a,
     r: e.r
    });
    return;
   }
   if (e.t === 'po') {
    const rtt = performance.now() - e.a;
    if (rtt >= 0 && rtt < 2e4) {
     const k = e.r === 'TURN' ? 'DIRECT' : e.r;
     const p = this.ping[k];
     this.ping[k] = p == null ? rtt : p * .6 + rtt * .4;
     this.pingAt = performance.now();
    }
    return;
   }
   try {
    this.onEvent && this.onEvent(e);
   } catch (er) {
    console.error(er);
   }
  }
  gotLatest(o) {
   this.heard = performance.now();
   if (o.lq != null) {
    if (o.lq <= this.lseqIn) return;
    this.lseqIn = o.lq;
   }
   try {
    this.onLatest && this.onLatest(o);
   } catch (er) {
    console.error(er);
   }
  }
  tick() {
   if (!this.alive) return;
   const t = performance.now(), slow = !this.fastOk();
   if (!this.ws && !this.noWS && t >= this.wsNext) this.wsConnect();
   if (this.ws && this.ws.readyState === 0 && t - this.wsBorn > 8e3) {
    try {
     this.ws.close();
    } catch (e) {}
    this.ws = null;
    this.wsFail++;
    this.wsNext = t + Math.min(1e4, 700 * this.wsFail);
   }
   if (this.ws && this.ws.readyState === 1) {
    if (t - this.hbW > 500) this.wsHb();
    if (t - this.syncT > 2e3) {
     this.syncT = t;
     this.wsSync();
    }
   }
   const rt = this.route();
   if (t - this.piT > (rt === 'RELAY' ? 2e3 : 1e3)) {
    this.piT = t;
    this.send({
     t: 'pi',
     a: +t.toFixed(1),
     r: rt
    });
   }
   const fi = slow ? N.inGame ? 110 : 400 : this.out.length ? 250 : 1e3;
   if (!this.flushBusy && (this.out.length || this.latestOut || t - this.lastFlush > 1500) && t - this.lastFlush > fi) {
    this.flushBusy = true;
    this.lastFlush = t;
    const ev = this.out.splice(0, 60);
    if (t - (this.hbT || 0) > 1e3) {
     ev.push({
      t: 'hb',
      q: ++this.seqOut,
      s: this.sid
     });
     this.hbT = t;
    }
    const body = {
     ev: ev
    };
    if (this.latestOut) {
     body.latest = this.latestOut;
     body.lseq = this.latestOut.lq;
     this.latestOut = null;
    }
    this.stats.relaySent++;
    const s0 = performance.now();
    call('/room/' + this.code + '/send', body).then(r => {
     this.flushBusy = false;
     if (r && r.st) clkSrv(r.st, s0, performance.now());
     if (!r || !r.ok) this.out.unshift(...ev.filter(e => e.t !== 'hb'));
    }).catch(() => {
     this.flushBusy = false;
     this.out.unshift(...ev.filter(e => e.t !== 'hb'));
    });
   }
   const pi = slow ? N.inGame ? 110 : 500 : N.inGame ? 450 : 1e3;
   if (!this.pollBusy && t - this.lastPoll > pi) {
    this.pollBusy = true;
    this.lastPoll = t;
    this.stats.relayPolls++;
    const t0 = performance.now();
    call('/room/' + this.code + '/poll', null, {
     after: this.after,
     lseq: this.fastOk() ? 999999999 : this.lseqIn
    }).then(r => {
     this.pollBusy = false;
     this.stats.rtt = Math.round(performance.now() - t0);
     if (!r || !r.ok) return;
     if (r.st) clkSrv(r.st, t0, performance.now());
     if (r.oseen != null) this.oseen = r.oseen;
     for (const x of r.ev) {
      this.after = Math.max(this.after, x.id);
      this.stats.relayRecv++;
      this.gotEvent(x.b);
     }
     if (r.latest && !this.fastOk()) this.gotLatest(r.latest.b);
     if (r.oseen != null && r.oseen < 2500) this.heard = Math.max(this.heard, performance.now() - r.oseen);
    }).catch(() => {
     this.pollBusy = false;
    });
   }
   if (this.p2p && (!this.dcR || this.dcR.readyState !== 'open' || t - (this.heardP || 0) > 3e3)) {
    this.p2p = false;
   }
   if (this.side === 'g' && this.fastOk() && t - (this.tpT || 0) > 1500) {
    this.tpT = t;
    this.send({
     t: 'tp',
     a: nowMs()
    });
   }
   if (this.p2p && t - (this.hbP || 0) > 1e3) {
    this.hbP = t;
    try {
     this.dcR.send(JSON.stringify({
      t: 'hb',
      q: ++this.seqOut,
      s: this.sid
     }));
    } catch (e) {}
   }
  }
  startRTC() {
   if (this.rtcTried || this.relayOnly || typeof RTCPeerConnection === 'undefined') return;
   this.rtcTried = true;
   try {
    const pc = this.pc = new RTCPeerConnection(RTC_CFG);
    pc.onicecandidate = ev => {
     if (ev.candidate) this.send({
      t: 'sig',
      ice: ev.candidate.toJSON ? ev.candidate.toJSON() : ev.candidate
     });
    };
    pc.onconnectionstatechange = () => {
     N.rtcState = pc.connectionState;
     if (pc.connectionState === 'failed' || pc.connectionState === 'closed') this.p2p = false;
    };
    const setup = dc => {
     dc.onmessage = m => {
      let o = null;
      try {
       o = JSON.parse(m.data);
      } catch (e) {
       return;
      }
      this.stats.p2pRecv++;
      this.heardP = performance.now();
      if (o.L) this.gotLatest(o.L); else {
       o._p2p = true;
       this.gotEvent(o);
      }
     };
     dc.onopen = () => {
      if (this.dcR && this.dcR.readyState === 'open' && this.dcU && this.dcU.readyState === 'open') {
       this.p2p = true;
       this.heardP = performance.now();
       N.p2pAt = Date.now();
      }
     };
     dc.onclose = () => {
      this.p2p = false;
     };
    };
    if (this.side === 'h') {
     this.dcR = pc.createDataChannel('r', {
      ordered: true
     });
     this.dcU = pc.createDataChannel('u', {
      ordered: false,
      maxRetransmits: 0
     });
     setup(this.dcR);
     setup(this.dcU);
     pc.createOffer().then(o => pc.setLocalDescription(o)).then(() => this.send({
      t: 'sig',
      sdp: pc.localDescription.toJSON ? pc.localDescription.toJSON() : pc.localDescription
     })).catch(e => {
      N.rtcErr = String(e);
     });
    } else {
     pc.ondatachannel = ev => {
      const dc = ev.channel;
      if (dc.label === 'r') this.dcR = dc; else this.dcU = dc;
      setup(dc);
     };
    }
   } catch (e) {
    N.rtcErr = String(e);
   }
  }
  signal(e) {
   if (this.relayOnly || typeof RTCPeerConnection === 'undefined') return;
   if (!this.pc) {
    if (this.side === 'g') {
     this.rtcTried = false;
     this.startRTC();
    } else return;
   }
   const pc = this.pc;
   if (e.sdp) {
    pc.setRemoteDescription(e.sdp).then(() => {
     if (e.sdp.type === 'offer') return pc.createAnswer().then(a => pc.setLocalDescription(a)).then(() => this.send({
      t: 'sig',
      sdp: pc.localDescription.toJSON ? pc.localDescription.toJSON() : pc.localDescription
     }));
    }).then(() => {
     for (const c of this.iceQ || []) pc.addIceCandidate(c).catch(() => {});
     this.iceQ = [];
    }).catch(er => {
     N.rtcErr = String(er);
    });
   } else if (e.ice) {
    if (pc.remoteDescription) pc.addIceCandidate(e.ice).catch(() => {}); else (this.iceQ = this.iceQ || []).push(e.ice);
   }
  }
  get connected() {
   return performance.now() - this.heard < 15e3;
  }
  get weak() {
   return performance.now() - this.heard > 2500;
  }
 }
 N.Link = Link;
 function cleanName(s) {
  return String(s == null ? '' : s).replace(/[^A-Za-z0-9_]/g, '').slice(0, 14);
 }
 function uname() {
  try {
   return cleanName(localStorage.getItem('rl_user'));
  } catch (e) {
   return '';
  }
 }
 function setUname(s) {
  const v = cleanName(s);
  try {
   if (v) localStorage.setItem('rl_user', v); else localStorage.removeItem('rl_user');
  } catch (e) {}
  if (N.code && N.lobby && !N.inGame) patchLobby(N.side === 'h' ? {
   hname: v || null
  } : {
   gname: v || null
  });
  return v;
 }
 function askUname(first) {
  let v = null;
  try {
   v = window.prompt((first ? 'PICK A USERNAME FOR ONLINE (your friends see it in their notifications). ' : '') + 'Letters, numbers, _ - up to 14:', uname() || '');
  } catch (e) {}
  for (let i = 0; i < 3 && v != null; i++) {
   let bad = null;
   try {
    bad = window.V35 && V35.nameBad ? V35.nameBad(cleanName(v)) : null;
   } catch (e) {}
   if (!bad) break;
   v = null;
   try {
    v = window.prompt(bad + '. Letters, numbers, _ - up to 14:', '');
   } catch (e) {}
   if (i === 2 && v != null) {
    try {
     if (V35.nameBad(cleanName(v))) v = null;
    } catch (e) {}
   }
  }
  try {
   localStorage.setItem('rl_userAsked', '1');
  } catch (e) {}
  if (v != null) setUname(v);
  return uname();
 }
 function dn(s) {
  return String(s == null ? '' : s).toUpperCase().replace(/_/g, '-');
 }
 function who(team, name) {
  const t = team ? T(team).name : '';
  return name ? t ? name + ' (' + t + ')' : name : t;
 }
 N.uname = uname;
 N.setUname = setUname;
 N.cleanName = cleanName;
 N.who = who;
 function oppName() {
  const st = (N.inGame ? N.st : N.lobby && N.lobby.state) || {};
  return cleanName(N.side === 'h' ? st.gname : st.hname);
 }
 N.oppName = oppName;
 const ONLINE_SCREENS = [ 'online', 'onJoin', 'onTeam', 'onLobby', 'onSeason', 'onSeasonTeam' ];
 N.ONLINE_SCREENS = ONLINE_SCREENS;
 let joinBuf = '', joinFor = 'game', lobbyPollT = 0, lobbyBusy = false, startedFrom = null;
 const SAVE_KEY = 'rl_netGame';
 function saveNetGame(o) {
  try {
   if (o) localStorage.setItem(SAVE_KEY, JSON.stringify(Object.assign({
    t: Date.now()
   }, o))); else localStorage.removeItem(SAVE_KEY);
  } catch (e) {}
 }
 function loadNetGame() {
  try {
   const o = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
   if (o && Date.now() - o.t < 15 * 6e4) return o;
  } catch (e) {}
  return null;
 }
 N.loadNetGame = loadNetGame;
 function myLineup(teamId, src) {
  try {
   return lineupFor(teamId, src || 'real');
  } catch (e) {
   return null;
  }
 }
 function defaultSettings() {
  return {
   diff: SETTINGS.diff,
   qlen: SETTINGS.qlen,
   halves: !!SETTINGS.halves,
   twoPt: !!SETTINGS.twoPt,
   items17: window.V17 ? V17.itemFx() : true
  };
 }
 const on2312 = () => !window.__rl_no2312 && !!window.V23;
 const signed2312 = () => !!(window.V23 && V23.signedIn && V23.signedIn());
 N.on2312 = on2312;
 N.openOnline = function() {
  N.err = null;
  screen = 'online';
  if (on2312()) {
   if (!signed2312()) V23.open('in', {
    gate: true
   }); else if (!uname()) try {
    setUname(V23.A().u);
   } catch (e) {}
   return;
  }
  let asked = null;
  try {
   asked = localStorage.getItem('rl_userAsked');
  } catch (e) {}
  if (!uname() && !asked && !window.__rlNoNamePrompt) askUname(true);
 };
 async function createGame() {
  N.err = null;
  flash(on2312() ? 'MAKING YOUR GAME...' : 'MAKING A CODE...', 9);
  const team = LS.get('team', null) || TEAMS[0].id;
  N.invited = null;
  const r = await call('/room/open', {
   kind: 'game',
   team: team,
   settings: defaultSettings()
  });
  if (!r || !r.ok) {
   N.err = r && r.error || 'NO CONNECTION';
   N.msg = null;
   return;
  }
  enterLobby(r);
  N.msg = null;
  patchLobby({
   hlu: myLineup(team)
  });
 }
 async function joinGame(code) {
  N.err = null;
  flash(on2312() ? 'JOINING...' : 'JOINING ' + code + '...', 9);
  const r = await call('/room/open', {
   code: code
  });
  N.msg = null;
  if (!r || !r.ok) {
   N.err = r && r.error || 'NO CONNECTION';
   return false;
  }
  if (r.kind === 'season') {
   if (on2312()) return N.seasonJoin(code);
   N.err = 'THAT IS A SEASON CODE - USE JOIN SEASON';
   return false;
  }
  enterLobby(r);
  if (r.side === 'g') {
   let team = r.state.gteam || LS.get('team', null) || TEAMS[1].id;
   if (team === r.state.hteam) team = TEAMS.find(t => t.id !== r.state.hteam).id;
   if (!r.state.gteam) patchLobby({
    gteam: team,
    glu: myLineup(team)
   });
  }
  return true;
 }
 N.createGame = createGame;
 N.joinGame = joinGame;
 function enterLobby(r) {
  N.on = true;
  N.code = r.code;
  N.side = r.side;
  N.kind = r.kind;
  N.lobby = r;
  N.err = null;
  if (N.link && N.link.code !== r.code) {
   N.link.close();
   N.link = null;
  }
  if (!N.link) {
   N.link = new Link(r.code, r.side);
   N.link.onEvent = onEvent;
   N.link.onLatest = onLatest;
   N.oppVer = null;
   N.verBad = null;
   N.verT = 0;
  }
  screen = 'onLobby';
  lobbyPollT = 0;
  {
   const u = uname(), k = r.side === 'h' ? 'hname' : 'gname';
   if (u && (!r.state || r.state[k] !== u)) patchLobby({
    [k]: u
   });
  }
  saveNetGame({
   code: r.code,
   side: r.side,
   kind: r.kind,
   scode: r.state && r.state.season || null
  });
 }
 let patchQ = Promise.resolve();
 function patchLobby(patch, notify) {
  const run = () => patchLobbyNow(patch, notify);
  const p = patchQ.then(run, run);
  patchQ = p.catch(() => {});
  return p;
 }
 async function patchLobbyNow(patch, notify) {
  if (!N.code) return;
  let r = null;
  const code0 = N.code;
  for (let i = 0; i < 4; i++) {
   try {
    r = await call('/room/' + N.code + '/state', {
     patch: patch,
     notify: notify
    });
   } catch (e) {
    r = null;
   }
   if (r && (r.ok || r.error && !/^bad answer/.test(r.error))) break;
   await new Promise(res => setTimeout(res, 250 + 250 * i));
  }
  if (r && r.state && N.code === code0) {
   keepMine(r);
   N.lobby = r;
  }
  if (r && !r.ok && r.error === 'not_ready') flash('BOTH PLAYERS HAVE TO READY UP');
  return r;
 }
 N.patchLobby = patchLobby;
 function nextSseq() {
  N.sseq = Math.max(Date.now(), (N.sseq || 0) + 1);
  return N.sseq;
 }
 function keepMine(r) {
  if (N.side === 'h' && N.hostSet && r && r.state && performance.now() - N.hostSetT < 5e3 && JSON.stringify(r.state.settings) !== JSON.stringify(N.hostSet)) {
   r.state.settings = Object.assign({}, N.hostSet);
   r.state.hready = false;
   r.state.gready = false;
   if (!N.resendT || performance.now() - N.resendT > 900) {
    N.resendT = performance.now();
    call('/room/' + N.code + '/state', {
     patch: {
      settings: N.hostSet,
      sseq: nextSseq()
     }
    });
   }
  }
 }
 async function pollLobby() {
  if (lobbyBusy || !N.code) return;
  lobbyBusy = true;
  const code0 = N.code;
  try {
   const r = await call('/room/' + N.code + '/state');
   if (r && r.ok && N.code === code0) {
    keepMine(r);
    const was = N.lobby;
    N.lobby = r;
    onLobbyChange(was, r);
   }
  } catch (e) {}
  lobbyBusy = false;
 }
 function onLobbyChange(was, r) {
  const st = r.state || {};
  if (r.hasGuest && N.link && N.side === 'h' && !N.link.rtcTried) N.link.startRTC();
  if (was && was.state && r.state) {
   const o = N.side === 'h' ? 'g' : 'h';
   if (!was.hasGuest && r.hasGuest && N.side === 'h') {
    flash('OPPONENT JOINED!');
    notifyLocal('OPPONENT JOINED', on2312() ? 'YOUR FRIEND IS IN THE LOBBY' : 'CODE ' + N.code);
   }
   if (!was.state[o + 'ready'] && st[o + 'ready']) {
    flash((N.side === 'h' ? 'AWAY' : 'HOME') + ' TEAM IS READY');
    if (screen !== 'onLobby') notifyLocal('OPPONENT IS READY', dn(who(st[o + 'team'], cleanName(st[o + 'name']))) + ' IS READY TO PLAY');
   }
  }
  if (st.start && !N.inGame && (screen === 'onLobby' || screen === 'vsRoster' && PS.vs && PS.vs.back === 'onLobby') && !N.verBad) beginOnlineGame(st);
  if (N.side === 'h' && st.hready && st.gready && !st.start && !N.starting && N.oppVer && !N.verBad) {
   N.starting = true;
   patchLobby({
    start: {
     seed: Math.floor(Math.random() * 1e9),
     t: Date.now()
    }
   }).then(() => {
    N.starting = false;
   });
  }
 }
 function notifyLocal(title, body) {
  banner(title + (body ? ' - ' + body : ''));
 }
 function banner(s) {
  N.ban = {
   s: s,
   t: 4
  };
 }
 N.banner = banner;
 function lobbyTick(dt) {
  if (N.msgT > 0) {
   N.msgT -= dt;
   if (N.msgT <= 0) N.msg = null;
  }
  if (N.ban) {
   N.ban.t -= dt;
   if (N.ban.t <= 0) N.ban = null;
  }
  if ((screen === 'onLobby' || screen === 'vsRoster' && PS.vs && PS.vs.back === 'onLobby') && !N.inGame) {
   lobbyPollT -= dt;
   if (lobbyPollT <= 0) {
    lobbyPollT = .7;
    pollLobby();
   }
  }
  const Lk = N.link;
  if (Lk && !N.inGame) {
   const t = performance.now();
   if (!N.oppVer && t - (N.verT || 0) > 2500) {
    N.verT = t;
    Lk.send({
     t: 'ver',
     v: GAMEV
    });
   }
   if (Lk.peerSid && !Lk.peerSince) Lk.peerSince = t;
   if (screen === 'onLobby' && !N.oppVer && Lk.peerSince && t - Lk.peerSince > 9e3 && N.lobby && N.lobby.hasGuest) N.verBad = 'OLD';
  }
  const SNx = N.season;
  if (SNx && SNx.code && !N.inGame && (screen === 'onSeason' || screen === 'draft' || (screen === 'seasonStats' || screen === 'lineup' || screen === 'roster') && season && season.online)) {
   SNx.pollT -= dt;
   if (SNx.pollT <= 0) {
    SNx.pollT = screen === 'draft' ? 1.2 : 2.5;
    N.seasonFetch();
   }
  }
 }
 function bigCode(code, x, y) {
  text(code || '----', x, y, 4, '#ffe14d', 'center', '#000');
 }
 function uText(s, x, y, col, align) {
  s = String(s || '').toUpperCase();
  const w = textW(s, 1), x0 = align === 'center' ? x - w / 2 : x;
  text(s.replace(/_/g, ' '), x0, y, 1, col);
  for (let i = 0; i < s.length; i++) if (s[i] === '_') rect(x0 + i * 4, y + 4, 3, 1, col);
 }
 function invList2312() {
  const L = window.V23 && V23.st && V23.st.inv || [], now = Date.now();
  return L.filter(i => !i.t || now - i.t < 30 * 6e4 + 6e4).slice(0, 3);
 }
 N.invList2312 = invList2312;
 function drawOnline2312() {
  bgStripes(true);
  text('ONLINE', W / 2, 6, 3, '#2cc4dc', 'center', '#000');
  if (!signed2312()) {
   text('ONLINE IS INVITE-ONLY NOW', W / 2, 30, 1, '#8fe3f0', 'center');
   text('SIGN IN OR MAKE AN ACCOUNT, ADD YOUR FRIENDS, INVITE THEM', W / 2, 40, 1, '#cfe', 'center');
   button('SIGN IN / MAKE ACCOUNT', W / 2 - 80, 58, 160, 20, () => V23.open('in', {
    gate: true
   }), {
    bg: '#7dff7a'
   });
   button('BACK', 8, H - 27, 56, 19, () => {
    if (V23.isOpen()) V23.close();
    screen = 'menu';
   }, {
    bg: '#c9d6d9'
   });
   drawErr();
   return;
  }
  text('INVITE A FRIEND - HE TAPS JOIN ON HIS PHONE', W / 2, 26, 1, '#8fe3f0', 'center');
  const lx = 8, bw = Math.min(170, Math.floor(W / 2) - 12);
  let y = 38;
  const col30 = !!(window.T232 && T232.colOn && T232.colOn());
  let lim30 = 0;
  if (col30) {
   const sv = loadNetGame(), ms = N.mySeasons(), L30 = [];
   L30.push([ 'INVITE A FRIEND', () => V23.open(null, {
    pick: true
   }), {
    sc: 2,
    bg: '#7dff7a',
    fit: true
   }, 20, 4 ]);
   L30.push([ 'NEW ONLINE SEASON', () => N.seasonCreate(), {
    bg: '#ffd23a'
   }, 14, 3 ]);
   if (T232.on()) L30.push([ 'NEW ONLINE WORLD GAMES', () => T232.createWg(), {
    bg: '#ffb14d',
    fit: true
   }, 14, 3 ]);
   L30.push([ 'NEW ONLINE COLLEGE TOURNAMENT', () => T232.createCol(), {
    bg: '#ff8ad8',
    fit: true
   }, 14, 3 ]);
   L30.push([ ms.length ? 'MY SEASON' + (ms.length > 1 ? 'S' : '') : 'NO SEASON YET', () => {
    if (ms.length) N.seasonOpen(ms[0].code);
   }, {
    bg: ms.length ? '#ffe14d' : '#5a6670'
   }, 14, 3 ]);
   L30.push([ V23.label() === 'FRIENDS' ? 'FRIENDS + ACCOUNT' : V23.label(), () => V23.open(), {
    bg: '#b6ff3a'
   }, 14, 3 ]);
   if (sv && sv.kind === 'game') L30.push([ 'REJOIN LAST GAME', () => N.rejoin(sv), {
    bg: '#ff9a4a'
   }, 14, 3 ]);
   const db = typeof sa2403 === 'function' ? sa2403().db || 0 : 0;
   lim30 = H - 27 - Math.max(0, db - 8) - 4;
   let tot = 0;
   L30.forEach((b, i) => {
    tot += b[3] + (i < L30.length - 1 ? b[4] : 0);
   });
   const k = Math.min(1, (lim30 - y) / tot);
   L30.forEach((b, i) => {
    const h = Math.max(i === 0 ? 14 : 10, Math.floor(b[3] * k)), g = Math.max(1, Math.floor(b[4] * k));
    button(b[0], lx, y, bw, h, b[1], b[2]);
    y += h + g;
   });
  } else {
   button('INVITE A FRIEND', lx, y, bw, 20, () => V23.open(null, {
    pick: true
   }), {
    sc: 2,
    bg: '#7dff7a',
    fit: true
   });
   y += 24;
   button('NEW ONLINE SEASON', lx, y, bw, 14, () => N.seasonCreate(), {
    bg: '#ffd23a'
   });
   y += 17;
   if (window.T232 && T232.on()) {
    button('NEW ONLINE WORLD GAMES', lx, y, bw, 14, () => T232.createWg(), {
     bg: '#ffb14d',
     fit: true
    });
    y += 17;
   }
   const ms = N.mySeasons();
   button(ms.length ? 'MY SEASON' + (ms.length > 1 ? 'S' : '') : 'NO SEASON YET', lx, y, bw, 14, () => {
    if (ms.length) N.seasonOpen(ms[0].code);
   }, {
    bg: ms.length ? '#ffe14d' : '#5a6670'
   });
   y += 17;
   button(V23.label() === 'FRIENDS' ? 'FRIENDS + ACCOUNT' : V23.label(), lx, y, bw, 14, () => V23.open(), {
    bg: '#b6ff3a'
   });
   y += 17;
   const sv = loadNetGame();
   if (sv && sv.kind === 'game') {
    button('REJOIN LAST GAME', lx, y, bw, 14, () => N.rejoin(sv), {
     bg: '#ff9a4a'
    });
    y += 17;
   }
  }
  const rx = lx + bw + 8, rw = W - rx - 8;
  card(rx, 38, rw, col30 ? Math.max(98, lim30 - 38) : 98);
  text('INVITES', rx + 5, 42, 1, '#b6ff3a');
  textMini('LAST 30 MIN', rx + rw - 5 - 11 * 1.3, 43, '#7f9aa6');
  const inv = invList2312();
  if (!inv.length) {
   text('NO INVITES RIGHT NOW', rx + rw / 2, 70, 1, '#cfe', 'center');
   textMini('WHEN A FRIEND INVITES YOU', rx + rw / 2, 82, '#7f9aa6');
   textMini('IT SHOWS UP HERE', rx + rw / 2, 89, '#7f9aa6');
  }
  inv.forEach((i, k) => {
   const yy = 52 + k * 27, m = i.t ? Math.max(0, Math.floor((Date.now() - i.t) / 6e4)) : 0;
   rect(rx + 3, yy, rw - 6, 24, 'rgba(255,255,255,.06)');
   uText(String(i.fr || '').slice(0, 14), rx + 6, yy + 3, '#fff');
   const sub = (i.kind === 'season' ? 'SEASON' : 'GAME') + ' - ' + (m < 1 ? 'JUST NOW' : m + ' MIN AGO');
   textMini(sub, rx + 6 + sub.length * 1.3, yy + 15, '#8fe3f0');
   button('JOIN', rx + rw - 46, yy + 4, 40, 16, () => V23.joinInvite(i, true), {
    bg: '#b6ff3a',
    key: 'inv' + k
   });
  });
  uText('SIGNED IN AS ' + String(V23.A().u || ''), W / 2, H - 9, '#7f9aa6', 'center');
  button('BACK', 8, H - 27, 56, 19, () => {
   screen = 'menu';
  }, {
   bg: '#c9d6d9'
  });
  drawErr();
 }
 function drawOnline() {
  if (on2312()) return drawOnline2312();
  bgStripes(true);
  text('ONLINE', W / 2, 6, 3, '#2cc4dc', 'center', '#000');
  text('PLAY A FRIEND ON HIS OWN PHONE', W / 2, 26, 1, '#8fe3f0', 'center');
  const bw = 150, x = W / 2 - bw / 2;
  let y = 40;
  button('CREATE GAME', x, y, bw, 20, () => createGame(), {
   sc: 2,
   bg: '#7dff7a'
  });
  y += 24;
  button('JOIN GAME', x, y, bw, 20, () => {
   joinFor = 'game';
   joinBuf = '';
   N.err = null;
   screen = 'onJoin';
  }, {
   sc: 2
  });
  y += 24;
  const hw = Math.floor((bw - 3) / 2);
  button('NEW ONLINE SEASON', x, y, bw, 14, () => N.seasonCreate(), {
   bg: '#ffd23a'
  });
  y += 17;
  if (window.T232 && T232.on()) {
   button('NEW ONLINE WORLD GAMES', x, y, bw, 14, () => T232.createWg(), {
    bg: '#ffb14d'
   });
   y += 17;
  }
  if (window.T232 && T232.colOn && T232.colOn()) {
   button('NEW ONLINE COLLEGE TOURNAMENT', x, y, bw, 14, () => T232.createCol(), {
    bg: '#ff9a3d',
    fit: true
   });
   y += 17;
  }
  button('JOIN SEASON', x, y, hw, 14, () => {
   joinFor = 'season';
   joinBuf = '';
   N.err = null;
   screen = 'onJoin';
  }, {
   bg: '#ffb14d'
  });
  const ms = N.mySeasons();
  button(ms.length ? 'MY SEASON' + (ms.length > 1 ? 'S' : '') : 'NO SEASON YET', x + hw + 3, y, bw - hw - 3, 14, () => {
   if (ms.length) N.seasonOpen(ms[0].code);
  }, {
   bg: ms.length ? '#ffe14d' : '#5a6670'
  });
  y += 17;
  if (window.V23) {
   button(V23.label() === 'FRIENDS' ? 'FRIENDS - INVITE A FRIEND' : V23.label(), x, y, bw, 14, () => V23.open(), {
    bg: '#b6ff3a'
   });
   y += 17;
  }
  const sv = loadNetGame();
  if (sv && sv.kind === 'game') {
   button('REJOIN GAME ' + sv.code, x, y, bw, 14, () => N.rejoin(sv), {
    bg: '#ff9a4a'
   });
   y += 17;
  }
  button('BACK', 8, H - 27, 56, 19, () => {
   screen = 'menu';
  }, {
   bg: '#c9d6d9'
  });
  drawErr();
 }
 function drawErr() {
  const ey = screen === 'onLobby' ? 22 : H - 46;
  if (N.err) {
   const w = textW(N.err) + 12;
   rect(W / 2 - w / 2, ey, w, 12, 'rgba(0,0,0,.85)');
   text(N.err, W / 2, ey + 3, 1, '#ff9a8a', 'center');
  }
  if (N.msg) {
   const w = textW(N.msg) + 12;
   rect(W / 2 - w / 2, ey, w, 12, 'rgba(0,0,0,.85)');
   text(N.msg, W / 2, ey + 3, 1, '#7dff7a', 'center');
  }
 }
 const KEYS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
 function drawJoin() {
  if (on2312()) {
   screen = 'online';
   return drawOnline2312();
  }
  bgStripes(true);
  text(joinFor === 'season' ? 'JOIN AN ONLINE SEASON' : 'JOIN A GAME', W / 2, 5, 2, '#2cc4dc', 'center', '#000');
  text('TYPE THE 4-LETTER CODE FROM YOUR FRIEND', W / 2, 19, 1, '#8fe3f0', 'center');
  for (let i = 0; i < 4; i++) {
   const bx = W / 2 - 58 + i * 30;
   rect(bx, 30, 26, 26, '#0b0f14');
   rect(bx, 54, 26, 2, i === joinBuf.length ? '#ffe14d' : '#3a4a55');
   if (joinBuf[i]) text(joinBuf[i], bx + 13, 34, 3, '#ffe14d', 'center');
  }
  const cols = 12, kw = Math.floor((W - 16 - (cols - 1) * 2) / cols), kh = 20;
  KEYS.split('').forEach((ch, i) => {
   const kx = 8 + i % cols * (kw + 2), ky = 66 + Math.floor(i / cols) * (kh + 3);
   button(ch, kx, ky, kw, kh, () => {
    if (joinBuf.length < 4) joinBuf += ch;
    N.err = null;
   }, {
    sc: 2,
    bg: '#c9d6d9',
    key: 'K' + ch
   });
  });
  button('DEL', W - 120, 116, 52, 18, () => {
   joinBuf = joinBuf.slice(0, -1);
  }, {
   bg: '#ff8a7a'
  });
  button(joinFor === 'season' ? 'JOIN SEASON' : 'JOIN', W - 64, 116, 56, 18, () => {
   if (joinBuf.length === 4) {
    if (joinFor === 'season') N.seasonJoin(joinBuf); else joinGame(joinBuf);
   } else N.err = 'CODE IS 4 LETTERS';
  }, {
   bg: joinBuf.length === 4 ? '#7dff7a' : '#5a6670',
   sc: 1
  });
  button('BACK', 8, H - 27, 56, 19, () => {
   screen = 'online';
  }, {
   bg: '#c9d6d9'
  });
  drawErr();
 }
 N.typeCode = s => {
  joinBuf = String(s).toUpperCase().slice(0, 4);
 };
 function setRow(labels, y, h, sel, fn, cols, canEdit, key) {
  const x0 = 8, gw = W - 16, n = labels.length, gap = 3, w = Math.floor((gw - gap * (n - 1)) / n);
  labels.forEach((lb, i) => {
   const x = x0 + i * (w + gap), ww = i === n - 1 ? gw - (n - 1) * (w + gap) : w, on = sel === i;
   if (canEdit) button(lb, x, y, ww, h, () => {
    fn(i);
    SFX.tap && SFX.tap();
   }, {
    bg: on ? cols ? cols[i] : '#ffd23a' : '#3a4a55',
    fg: on ? '#0b1a20' : '#cfe'
   }); else {
    rect(x, y, ww, h, on ? cols ? cols[i] : '#ffd23a' : 'rgba(40,52,62,.6)');
    text(lb, x + ww / 2, y + Math.round((h - 5) / 2), 1, on ? '#0b1a20' : '#6c7f8a', 'center');
   }
  });
 }
 function szSync15(st) {
  if (!st || typeof szRegister15 !== 'function') return;
  for (const k of [ 'h', 'g' ]) {
   const d = st[k + 'szn'], id = st[k + 'team'];
   if (d && id && d.id === id && !(SZ_REG[id] && SZ_REG[id].mine) && (!SZ_REG[id] || SZ_REG[id]._raw !== d)) {
    const t = szRegister15(d, false);
    if (t) t._raw = d;
   }
  }
 }
 function drawLobby() {
  const L = N.lobby;
  bgStripes(true);
  if (!L) {
   text('CONNECTING...', W / 2, 80, 2, '#fff', 'center');
   return;
  }
  const st = L.state || {}, host = N.side === 'h', sg = !!st.season;
  szSync15(st);
  const S0 = st.settings || defaultSettings();
  if (typeof vsBegin === 'function') vsBegin();
  const myT = host ? st.hteam : st.gteam, opT = host ? st.gteam : st.hteam, src = sg ? 'season' : 'real';
  const myR = host ? st.hready : st.gready, opR = host ? st.gready : st.hready;
  const colW = 100, lx = 52, rx = W - 52, feetY = 92, k = 3;
  const tcard = (tid, cx, label, ready, mine) => {
   const x = cx - 47;
   rect(x, 2, 94, 24, mine ? '#1f4a52' : '#1a2430');
   rect(x, 2, 94, 2, tid ? accent(T(tid)) : '#3a4a55');
   const nm = dn(cleanName(label === 'HOME' ? st.hname : st.gname));
   text((nm || label) + (mine ? ' (YOU)' : ''), cx, 5, 1, '#8fe3f0', 'center');
   if (tid) text(T(tid).name, cx, 12, 1, '#fff', 'center'); else text(host && label === 'AWAY' ? 'WAITING...' : '-', cx, 12, 1, '#7f9aa6', 'center');
   text(ready ? 'READY' : 'NOT READY', cx, 19, 1, ready ? '#7dff7a' : '#ff9a8a', 'center');
  };
  tcard(myT, lx, host ? 'HOME' : 'AWAY', myR, true);
  tcard(opT, rx, host ? 'AWAY' : 'HOME', opR, false);
  const teams = [ [ myT, src ], [ opT, src ] ].filter(t => t[0]);
  const rosterFn = j => {
   if (teams.length) openVsRoster(teams, 'onLobby', Math.min(j, teams.length - 1));
  };
  if (typeof vsHeroCol === 'function') {
   vsHeroCol(0, myT, src, lx, feetY, k, true, {
    w: colW - 12,
    hw: 27,
    empty: 'PICK YOUR TEAM',
    onHero: rosterFn
   });
   vsHeroCol(1, opT, src, rx, feetY, k, true, {
    w: colW - 12,
    hw: 27,
    empty: L.hasGuest || !host ? 'PICKING...' : 'WAITING...',
    onHero: j => rosterFn(myT ? j : 0)
   });
  }
  const x0 = colW + 6, gw = W - 2 * x0;
  text(sg ? 'SEASON GAME - WEEK ' + (+String(st.wk).replace(/\D/g, '') + 1 || st.wk) : 'ONLINE GAME', W / 2, 1, 1, '#8fe3f0', 'center');
  if (!sg && on2312()) {
   if (host && !L.hasGuest) {
    uText(N.invited ? 'INVITED ' + N.invited : 'INVITE A FRIEND TO THIS GAME', W / 2, 9, N.invited ? '#7dff7a' : '#8fe3f0', 'center');
    button(N.invited ? 'INVITE ANOTHER FRIEND' : 'INVITE A FRIEND', W / 2 - Math.min(60, gw / 2), 18, Math.min(120, gw), 14, () => V23.open(null, {
     pick: true
    }), {
     bg: '#7dff7a',
     fit: true
    });
   } else text(host ? 'YOUR FRIEND IS IN' : 'YOU JOINED YOUR FRIEND', W / 2, 14, 1, '#7dff7a', 'center');
  } else if (!sg) {
   text('CODE', W / 2, 8, 1, '#8fe3f0', 'center');
   bigCode(L.code, W / 2, 15);
  } else text('HOME TEAM SETS THE RULES', W / 2, 12, 1, '#ffe14d', 'center');
  const lift = typeof sa2403Dy === 'function' ? sa2403Dy(H - 24, 20) : 0;
  const narrow = Math.floor((gw - 9) / 4) < 41, rh = narrow ? lift ? 8 : 9 : 11, rg = narrow ? 1 : 2, rp = rh + rg, gg = narrow ? 1 : 2;
  let y = narrow ? 36 : 38;
  text(host ? 'SETTINGS - YOU SET THEM' : 'SET BY THE HOME TEAM (READ ONLY)', W / 2, y, 1, host ? '#ffe14d' : '#ff9a4a', 'center');
  y += 8;
  const upd = (k, v) => {
   const s = Object.assign({}, S0, {
    [k]: v
   });
   N.hostSet = s;
   N.hostSetT = performance.now();
   patchLobby({
    settings: s,
    sseq: nextSseq()
   });
   N.lobby.state.settings = s;
   N.lobby.state.hready = false;
   N.lobby.state.gready = false;
  };
  y = setGrid(DIFF_NAMES, x0, gw, y, rh, 3, S0.diff, i => upd('diff', i), [ '#7dff7a', '#8fe3f0', '#ffd23a', '#ffb14d', '#ff8a5a', '#ff5a4a' ], host, rg) + gg;
  y = setGrid(QLEN_OPTS.map(fmtClock), x0, gw, y, rh, 3, QLEN_OPTS.indexOf(S0.qlen), i => upd('qlen', QLEN_OPTS[i]), null, host, rg) + gg;
  const FMT = [ '4 QUARTERS', '2 HALVES', '2PT OFF', '2PT ON' ], fpr = narrow ? 2 : 4;
  setGrid(FMT, x0, gw, y, rh, fpr, -1, i => {
   if (i < 2) upd('halves', i === 1); else upd('twoPt', i === 3);
  }, null, host, rg);
  {
   const w = Math.floor((gw - 3 * (fpr - 1)) / fpr);
   for (const i of [ S0.halves ? 1 : 0, S0.twoPt ? 3 : 2 ]) {
    const c = i % fpr, r = Math.floor(i / fpr), x = x0 + c * (w + 3), yy = y + r * rp, ww = c === fpr - 1 ? gw - (fpr - 1) * (w + 3) : w;
    rect(x, yy, ww, 1, '#ffe14d');
    rect(x, yy + rh - 1, ww, 1, '#ffe14d');
    if (!host) {
     rect(x, yy, ww, rh, '#ffd23a');
     text(FMT[i], x + ww / 2, yy + Math.round((rh - 5) / 2), 1, '#0b1a20', 'center');
    }
   }
  }
  if (narrow) {
   y += 2 * rp - rg + gg;
   y = setGrid([ 'DAY GAME', 'NIGHT GAME' ], x0, gw, y, rh, 2, S0.night ? 1 : 0, i => upd('night', i === 1), [ '#ffe14d', '#b9a8ff' ], host, rg) + gg;
   y = setGrid([ 'ITEMS ON', 'ITEMS OFF' ], x0, gw, y, rh, 2, S0.items17 === false ? 1 : 0, i => upd('items17', i === 0), [ '#7dff7a', '#c9d6d9' ], host, rg) + gg;
  } else {
   const hw2 = Math.floor((gw - 3) / 2);
   setGrid([ 'DAY GAME', 'NIGHT GAME' ], x0, hw2, y + 13, 10, 2, S0.night ? 1 : 0, i => upd('night', i === 1), [ '#ffe14d', '#b9a8ff' ], host);
   setGrid([ 'ITEMS ON', 'ITEMS OFF' ], x0 + hw2 + 3, gw - hw2 - 3, y + 13, 10, 2, S0.items17 === false ? 1 : 0, i => upd('items17', i === 0), [ '#7dff7a', '#c9d6d9' ], host);
   y = 124;
  }
  const info = DIFF_INFO[S0.diff] + '  -  ' + (S0.halves ? '2 HALVES OF ' + fmtClock(S0.qlen * 2) : '4 QUARTERS OF ' + fmtClock(S0.qlen)) + (S0.twoPt ? '  -  2PT ARC ON' : '') + (S0.items17 === false ? '  -  ITEMS = LOOKS ONLY' : '') + (window.V28 && V28.lobbyInfo ? V28.lobbyInfo(st, sg) : '');
  if (textW(info, 1) <= (narrow ? gw + 8 : W - 8)) text(info, W / 2, y, 1, '#cfe', 'center'); else textMini(info, W / 2, y + 1, '#cfe');
  y += lift ? 6 : narrow ? 7 : 8;
  const meR = myR, oR = opR;
  let stat = '';
  if (!L.hasGuest) stat = on2312() ? N.invited ? 'INVITE SENT - WAITING FOR HIM TO JOIN' : 'INVITE A FRIEND - WAITING FOR HIM TO JOIN' : 'SHARE CODE ' + L.code + ' - WAITING FOR YOUR FRIEND TO JOIN'; else if (!st.gteam) stat = 'AWAY TEAM IS PICKING...'; else if (st.start) stat = 'BOTH READY - FACE OFF!'; else if (meR && !oR) stat = 'WAITING FOR THE ' + (host ? 'AWAY' : 'HOME') + ' TEAM TO READY UP'; else if (!meR && oR) stat = (host ? 'AWAY' : 'HOME') + ' TEAM IS READY - READY UP!'; else if (!meR) stat = 'PICK YOUR TEAM, THEN READY UP';
  text(stat, W / 2, y, 1, '#ffe14d', 'center', '#000');
  const oSeen = L.seen && L.seen[host ? 'g' : 'h'];
  const nc = L.hasGuest && oSeen != null && oSeen > 6e3;
  if (nc) {
   if (narrow) text('NOT CONNECTED (' + Math.round(oSeen / 1e3) + 's)', rx, lift ? 120 : 128, 1, '#ff9a8a', 'center'); else text('OPPONENT NOT CONNECTED (' + Math.round(oSeen / 1e3) + 's)', W / 2, y + 8, 1, '#ff9a8a', 'center');
  }
  if (N.link && !(lift && narrow && nc)) text(N.link.p2p ? 'DIRECT LINK' : 'RELAY LINK', rx, lift ? 118 : narrow ? 120 : 117, 1, N.link.p2p ? '#7dff7a' : '#8fe3f0', 'center');
  const by = H - 24;
  const row = [ [ 'LEAVE', 50, () => N.leave(), {
   bg: '#c9d6d9'
  } ] ];
  if (!sg && myT && typeof openGear17 === 'function') row.push([ 'GEAR', 44, () => {
   if (meR) {
    N.lobby.state[host ? 'hready' : 'gready'] = false;
    patchLobby(host ? {
     hready: false
    } : {
     gready: false
    });
   }
   openGear17(myT, 'onLobby');
  }, {
   bg: '#ffcc33'
  } ]);
  if (!sg && myT && window.V22 && V22.lobbyLineup()) row.push([ 'LINEUP', 52, () => {
   if (meR) {
    N.lobby.state[host ? 'hready' : 'gready'] = false;
    patchLobby(host ? {
     hready: false
    } : {
     gready: false
    });
   }
   openLineup(myT, 'real', 'onLobby');
  }, {
   bg: '#2cc4dc'
  } ]);
  if (window.V28 && V28.lobbyBtn) {
   const b28 = V28.lobbyBtn(st, host, sg, upd);
   if (b28) row.push(b28);
  }
  if (!sg) row.push([ 'PICK TEAM', 70, () => {
   if (meR) patchLobby(host ? {
    hready: false
   } : {
    gready: false
   });
   screen = 'onTeam';
  }, {
   bg: '#8fe3f0'
  } ]);
  row.push([ 'ROSTER & STATS', 88, () => rosterFn(0), {
   bg: teams.length ? '#ffd23a' : '#5a6670'
  } ]);
  const nat = row.map(b => textW(b[0], 1) + 10), gaps = 4 * (row.length - 1), sumN = nat.reduce((a, b) => a + b, 0), sumO = row.reduce((a, b) => a + b[1], 0);
  const rw = Math.max(80, Math.min(112, W - 24 - sumN - gaps)), avail = W - 24 - rw - gaps;
  const kx = sumO <= avail ? 1 : Math.max(0, (avail - sumN) / Math.max(1, sumO - sumN));
  const fit30 = !window.__rl_no30lobfit && sumN > avail;
  let bx = 8;
  row.forEach((b, i) => {
   const w = fit30 ? Math.floor(nat[i] * avail / sumN) : Math.floor(sumO <= avail ? b[1] : nat[i] + (b[1] - nat[i]) * kx);
   button(b[0], bx, by, w, 18, b[2], fit30 ? Object.assign({
    fit: true
   }, b[3]) : b[3]);
   bx += w + 4;
  });
  const canReady = !!(host ? st.hteam : st.gteam);
  button(meR ? 'NOT READY' : 'READY UP', W - 8 - rw, by - 4, rw, 22, () => {
   if (!canReady) return;
   const k = host ? 'hready' : 'gready';
   const p = {
    [k]: !meR
   };
   N.lobby.state[k] = !meR;
   if (!meR && window.V17 && V17.lobPay) {
    const k17 = host ? 'h17' : 'g17';
    p[k17] = V17.lobPay(host ? st.hteam : st.gteam);
    N.lobby.state[k17] = p[k17];
   }
   if (!meR && window.UNI21 && UNI21.on()) {
    const ku = host ? 'hu21' : 'gu21', tm = host ? st.hteam : st.gteam;
    if (tm) {
     p[ku] = UNI21.viewK(0, tm);
     N.lobby.state[ku] = p[ku];
    }
   }
   patchLobby(p, !meR ? {
    title: 'BAGGA LAX',
    body: who(host ? st.hteam : st.gteam, uname()) + ' IS READY TO PLAY'
   } : null);
  }, {
   sc: 2,
   bg: meR ? '#ffb14d' : canReady ? '#7dff7a' : '#5a6670'
  });
  if (!sg && window.CP2319 && CP2319.on()) cpLobby2319(st, host, lx, rx, y, L, oSeen, narrow, lift);
  if (!sg && window.V232 && V232.crewOn()) V232.crewLobby(st, host, lx, rx, y, L, oSeen, narrow, lift);
  drawErr();
 }
 function cpLobby2319(st, host, lx, rx, statY, L, oSeen, narrow, lift) {
  const mk = host ? 'hcp19' : 'gcp19', ok = host ? 'gcp19' : 'hcp19', mine = st[mk], his = st[ok];
  if (mine == null && N.cp19Sent !== N.code + N.side) {
   N.cp19Sent = N.code + N.side;
   const v = CP2319.quick();
   st[mk] = v;
   patchLobby({
    [mk]: v
   });
  }
  const pick = v => {
   if (st.start || st[mk] === v) return;
   st[mk] = v;
   st.hready = false;
   st.gready = false;
   patchLobby({
    [mk]: v
   });
   try {
    SFX.tap();
   } catch (e) {}
  };
  const yn = v => v === true ? 'YES' : v === false ? 'NO' : '-', col = v => v === true ? '#7dff7a' : v === false ? '#ff9a4a' : '#7f9aa6';
  const bw = 40, lf = lift || 0, by2 = lf ? Math.min(133, H - 24 - lf - 22) : 133, bh = lf ? 9 : 11;
  if (!lf) text('CARD PLAYERS?', lx, by2 - 9, 1, '#ffe14d', 'center');
  button(lf ? 'CARDS YES' : 'YES', lx - bw - 1, by2, bw, bh, () => pick(true), {
   bg: st[mk] === true ? '#7dff7a' : '#3a4a55',
   fg: st[mk] === true ? '#0b1a20' : '#cfe',
   fit: true
  });
  button(lf ? 'CARDS NO' : 'NO', lx + 1, by2, bw, bh, () => pick(false), {
   bg: st[mk] === false ? '#ffb14d' : '#3a4a55',
   fg: st[mk] === false ? '#0b1a20' : '#cfe',
   fit: true
  });
  if (L.hasGuest) text('CARD PLAYERS: ' + yn(his), rx, lf ? by2 + 3 : 137, 1, col(his), 'center');
  if (!(L.hasGuest && oSeen != null && oSeen > 6e3 && !narrow)) {
   const on = CP2319.lobbyAll(st), wait = st.hcp19 == null || st.gcp19 == null || !L.hasGuest;
   const h = yn(st.hcp19), a = yn(L.hasGuest ? st.gcp19 : null), r = on ? 'ON' : 'OFF FOR BOTH', c = wait ? '#cfe' : on ? '#7dff7a' : '#ff9a4a';
   const opts = wait ? [ 'CARD PLAYERS: HOME ' + h + ' - AWAY ' + a, 'CARDS: HOME ' + h + ' - AWAY ' + a ] : [ 'HOME ' + h + ' + AWAY ' + a + ' = CARD PLAYERS ' + (on ? 'ON' : 'OFF FOR BOTH TEAMS'), 'HOME ' + h + ' + AWAY ' + a + ' = CARD PLAYERS ' + r, 'HOME ' + h + ' + AWAY ' + a + ' = CARDS ' + r, h + ' + ' + a + ' = CARDS ' + r ];
   const s = opts.find(q => textW(q, 1) <= W - 2 * 100);
   const dy = lift ? 7 : 9;
   if (s) text(s, W / 2, statY + dy, 1, c, 'center'); else textMini(opts[0], W / 2, statY + dy + 1, c);
  }
 }
 function setGrid(labels, x0, gw, y, h, perRow, sel, fn, cols, canEdit, rg) {
  const n = labels.length, gap = 3, w = Math.floor((gw - gap * (perRow - 1)) / perRow), g2 = rg == null ? 2 : rg;
  labels.forEach((lb, i) => {
   const r = Math.floor(i / perRow), c = i % perRow, x = x0 + c * (w + gap), yy = y + r * (h + g2), ww = c === perRow - 1 ? gw - (perRow - 1) * (w + gap) : w, on = sel === i;
   if (canEdit) button(lb, x, yy, ww, h, () => {
    fn(i);
    SFX.tap && SFX.tap();
   }, {
    bg: on ? cols ? cols[i] : '#ffd23a' : '#3a4a55',
    fg: on ? '#0b1a20' : '#cfe',
    fit: true
   }); else {
    rect(x, yy, ww, h, on ? cols ? cols[i] : '#ffd23a' : 'rgba(40,52,62,.6)');
    if (textW(lb, 1) > ww - 2) textMini(lb, x + ww / 2, yy + Math.round((h - 3) / 2), on ? '#0b1a20' : '#6c7f8a'); else text(lb, x + ww / 2, yy + Math.round((h - 5) / 2), 1, on ? '#0b1a20' : '#6c7f8a', 'center');
   }
  });
  return y + Math.ceil(n / perRow) * (h + g2) - g2;
 }
 function drawOnTeam() {
  const st = N.lobby && N.lobby.state || {}, host = N.side === 'h', other = host ? st.gteam : st.hteam;
  teamGrid('PICK YOUR TEAM', 'ONLINE GAME - ' + (host ? 'YOU ARE HOME' : 'YOU ARE AWAY'), id => {
   window.__w172pick = null;
   LS.set('team', id);
   const lu = myLineup(id);
   if (host) {
    N.lobby.state.hteam = id;
    N.lobby.state.hszn = null;
    patchLobby({
     hteam: id,
     hready: false,
     hlu: lu,
     hszn: null
    });
   } else {
    N.lobby.state.gteam = id;
    N.lobby.state.gszn = null;
    patchLobby({
     gteam: id,
     gready: false,
     glu: lu,
     gszn: null
    });
   }
   screen = 'onLobby';
  }, {
   exclude: other,
   world: true,
   back: () => {
    screen = 'onLobby';
   },
   extra: by => {
    if (typeof szButton15 === 'function') szButton15(by, id => {
     const lu = lineupFor(id, 'real'), pay = szPayload15(id);
     if (host) {
      N.lobby.state.hteam = id;
      N.lobby.state.hszn = pay;
      patchLobby({
       hteam: id,
       hready: false,
       hlu: lu,
       hszn: pay
      });
     } else {
      N.lobby.state.gteam = id;
      N.lobby.state.gszn = pay;
      patchLobby({
       gteam: id,
       gready: false,
       glu: lu,
       gszn: pay
      });
     }
     screen = 'onLobby';
    });
   }
  });
 }
 N.leave = function() {
  if (N.code && N.lobby && !N.inGame) {
   const host = N.side === 'h';
   patchLobby(host ? {
    hready: false
   } : {
    gready: false
   });
  }
  if (N.link) {
   N.link.close();
   N.link = null;
  }
  N.on = false;
  N.code = null;
  N.lobby = null;
  N.inGame = false;
  N.auth = false;
  saveNetGame(null);
  if (N.seasonBack) {
   const sb = N.seasonBack;
   N.seasonBack = null;
   sb();
   return;
  }
  screen = 'online';
 };
 N.rejoin = async function(sv) {
  const ok = await joinGame(sv.code);
  if (ok) {
   N.rejoining = true;
  }
 };
 let restoreFns = [];
 function beginOnlineGame(st) {
  if (N.inGame) return;
  const host = N.side === 'h';
  JB.dS = [];
  JB.gaps = [];
  JB.base = null;
  JB.newest = 0;
  JB.D = 90;
  JB.Dt = 90;
  N.inGame = true;
  N.auth = false;
  N.foN = 0;
  N.fo = null;
  N.view = null;
  N.dc = null;
  N.quitAsk = false;
  N.ended = false;
  N.ctlIdx = 0;
  N.manualSw = -9;
  N.st = st;
  N.myTeam = host ? st.hteam : st.gteam;
  N.oppTeam = host ? st.gteam : st.hteam;
  N.savedSettings = Object.assign({}, SETTINGS);
  Object.assign(SETTINGS, st.settings || {});
  settingsFix();
  N.savedFO = FO131.cpuViol;
  FO131.cpuViol = 0;
  const mode = st.season ? 'season' : 'online';
  if (st.season && N.seasonLocalFor) N.seasonLocalFor(st);
  szSync15(st);
  newGame(N.myTeam, N.oppTeam, mode, host, {
   label: st.season ? 'ONLINE - WEEK ' + st.wk : 'ONLINE',
   online: true,
   night: !!(st.settings && st.settings.night),
   crew232: window.V232 ? V232.crewAll(st) : true,
   items17: !(st.settings && st.settings.items17 === false),
   lob17: host ? [ st.h17 || null, st.g17 || null ] : [ st.g17 || null, st.h17 || null ],
   uni21: host ? [ st.hu21 != null ? st.hu21 : null, st.gu21 != null ? st.gu21 : 0 ] : [ st.gu21 != null ? st.gu21 : null, st.hu21 != null ? st.hu21 : 0 ]
  });
  const G = game;
  G.online = true;
  G.punchArmed = false;
  const src = mode === 'season' ? 'season' : 'real';
  const olu = host ? st.glu : st.hlu, mlu = host ? st.hlu : st.glu;
  try {
   if (olu && lineupValid(olu, teamRosterIds(N.oppTeam, src).concat(window.V22 ? V22.subIds(olu) : []))) G.lu[1] = JSON.parse(JSON.stringify(olu));
  } catch (e) {}
  try {
   if (mlu && lineupValid(mlu, teamRosterIds(N.myTeam, src))) G.lu[0] = JSON.parse(JSON.stringify(mlu));
  } catch (e) {}
  if (window.V22) V22.fixGame(G);
  if (window.CP2319) {
   G.cp2319 = CP2319.on() ? st.season ? false : CP2319.lobbyAll(st) : true;
   CP2319.stripGame(G);
  }
  screen = 'pregame';
  G.preT = 0;
  N.stats.games = (N.stats.games || 0) + 1;
  saveNetGame({
   code: N.code,
   side: N.side,
   kind: N.kind,
   scode: st.season || null,
   inGame: true
  });
  if (N.rejoining && N.resumeSh) {
   applyShared(N.resumeSh);
   N.resumeSh = null;
  }
  if (N.rejoining) G.coin = {
   phase: 'done',
   rejoin: true
  };
  N.rejoining = false;
 }
 N.beginOnlineGame = beginOnlineGame;
 function endOnlineGame(why) {
  if (!N.inGame) return;
  N.inGame = false;
  N.auth = false;
  N.view = null;
  N.dc = null;
  N.quitAsk = false;
  if (N.savedSettings) {
   Object.assign(SETTINGS, N.savedSettings);
   N.savedSettings = null;
   applyDiff();
  }
  if (N.savedFO != null) {
   FO131.cpuViol = N.savedFO;
   N.savedFO = null;
  }
  if (why) flash(why, 4);
 }
 N.endOnlineGame = endOnlineGame;
 function getShared() {
  const G = game, V = G.v14 || {};
  const pen = G.pen ? {
   side: G.pen.side,
   left: G.pen.left,
   foul: G.pen.foul,
   who: G.pen.who ? G.pen.who.id || null : null,
   at: G.pen.at
  } : null;
  return {
   score: G.score.slice(),
   pts2: (G.pts2 || [ 0, 0 ]).slice(),
   q: G.q,
   clock: G.clock,
   ot: !!G.ot,
   otq: G.otq || 0,
   brave: !!G.brave,
   pen: pen,
   pens: G.pens || 0,
   pf: G.pf || {},
   ejected: G.ejected || [],
   concOut: G.concOut || [],
   lu: [ G.lu[0], G.lu[1] ],
   tos: (G.tos || [ 2, 2 ]).slice(),
   fights: V.fights || 0,
   stats: {
    fow: G.stats.fow,
    fot: G.stats.fot
   }
  };
 }
 function applyShared(sh) {
  const G = game;
  if (!G || !sh) return;
  G.score = [ sh.score[1], sh.score[0] ];
  G.pts2 = [ sh.pts2[1], sh.pts2[0] ];
  G.q = sh.q;
  G.clock = sh.clock;
  G.ot = sh.ot;
  G.otq = sh.otq || 0;
  G.brave = !!sh.brave;
  if (sh.pen) {
   G.pen = {
    side: sh.pen.side === 'U' ? 'C' : 'U',
    left: sh.pen.left,
    foul: sh.pen.foul,
    who: sh.pen.who ? PP(sh.pen.who) : null,
    at: sh.pen.at
   };
   if (G.pen.side === 'C') G.emo = G.emo || '3-3 EMO'; else G.md = G.md || 'ZONE ROTATE';
  } else G.pen = null;
  G.pens = sh.pens;
  G.pf = Object.assign({}, sh.pf);
  G.ejected = (sh.ejected || []).slice();
  G.concOut = (sh.concOut || []).slice();
  if (sh.lu && sh.lu[0] && sh.lu[1]) G.lu = [ JSON.parse(JSON.stringify(sh.lu[1])), JSON.parse(JSON.stringify(sh.lu[0])) ];
  G.tos = [ sh.tos[1], sh.tos[0] ];
  if (G.v14) G.v14.fights = Math.max(G.v14.fights || 0, sh.fights || 0);
 }
 N.getShared = getShared;
 N.applyShared = applyShared;
 function handoff(spot, why) {
  const G = game;
  if (!N.inGame || !N.auth || !G) return false;
  const b = G.ball || {
   x: MIDX,
   y: CY
  };
  const s = spot || G.turnSpot || {
   x: b.x,
   y: b.y
  };
  G.turnSpot = null;
  N.stats.handoffs++;
  const lc = N.lc2318;
  N.lc2318 = null;
  N.lcSent = lc ? 1 : 0;
  N.link.send(Object.assign({
   t: 'poss',
   sh: getShared(),
   x: +s.x.toFixed(1),
   y: +s.y.toFixed(1),
   why: why || ''
  }, lc ? {
   lc: 1,
   gk: lc.gk ? 1 : 0
  } : null));
  becomeViewer();
  return true;
 }
 function becomeViewer() {
  N.pred = null;
  N.swLocal = null;
  N.vjoy = null;
  N.auth = false;
  stick = null;
  shootP = null;
  joy = null;
  const snap = makeSnap();
  N.view = {
   ents: new Map,
   last: null,
   lastAt: 0,
   iv: .1
  };
  applySnap(snap, true);
  screen = 'netview';
  N.vjoy = null;
  N.vact = null;
 }
 function lc2318(x, y, why, gk) {
  const G = game;
  N.lcWhy = 'start';
  if (!G || G.tutorial || G.penPending || window.__rl_no2318b || window.__rl_v124gb) {
   N.lcWhy = 'skip';
   return false;
  }
  const prev = (G.players || []).filter(p => !p.far), sx = clamp(FL - x, DGX + 14, MIDX - 8), sy = clamp(y, FT + 14, FB - 6);
  N.applying = true;
  try {
   startDefense();
  } catch (e) {
   console.error(e);
  } finally {
   N.applying = false;
  }
  if (screen !== 'defense' || !G.players) {
   N.lcWhy = 'nodef:' + screen;
   return false;
  }
  const used = new Set;
  for (const q of G.players) {
   const e = prev.find(o => o.team === q.team && (q.team === 'G' || q.team === 'G2' || o.idx === q.idx));
   if (!e) continue;
   q.x = e.x;
   q.y = e.y;
   q.anim = e.anim || 0;
   q.tx = e.x;
   q.ty = e.y;
   if (e.pl && (q.team === 'O' || q.team === 'D') && !G.players.some(o => o !== q && o.team === q.team && o.pl && o.pl.id === e.pl.id) && !used.has(q.team + e.pl.id)) {
    q.pl = e.pl;
    used.add(q.team + e.pl.id);
   }
  }
  const k2 = gk ? G.players.find(q => q.team === 'G2') : null;
  if (k2) {
   G.ball.x = k2.x + 5;
   G.ball.y = k2.y - 16;
   startClear(k2, 'SAVE! CLEAR IT!');
   G.lc2318 = (G.lc2318 || 0) + 1;
   N.lcWhy = screen === 'defense' && G.dclear ? 'ok-save' : 'scr:' + screen;
   return N.lcWhy === 'ok-save';
  }
  const p = nearestTo('O', sx, sy);
  if (!p) {
   N.lcWhy = 'nobody';
   return false;
  }
  p.x = sx;
  p.y = sy;
  G.dcar = null;
  G.carrier = null;
  G.ball = {
   x: p.x + BX,
   y: p.y + BY,
   state: 'held',
   vx: 0,
   vy: 0
  };
  toOffense(p, why && /SCOOP|PICKED|STRIP|CHECK/.test(why) ? why : 'CLEAR IT!');
  G.lc2318 = (G.lc2318 || 0) + 1;
  N.lcWhy = screen === 'live' ? 'ok' : 'scr:' + screen;
  return screen === 'live';
 }
 function becomeAuthority(x, y, why, lc) {
  N.rin = null;
  N.pred = null;
  N.lcGot = lc ? 1 : 0;
  let lcOk = false;
  if (lc) try {
   lcOk = lc2318(x, y, why, lc.gk);
  } catch (e) {
   console.error(e);
   N.applying = false;
  }
  if (lcOk) {
   N.auth = true;
   N.view = null;
   game.checkT = -1;
   game.ruleGrace = Math.max(game.ruleGrace || 0, 1);
   SFX.whistle();
   N.snapT = 0;
   return;
  }
  N.auth = true;
  N.view = null;
  const rx = x > MIDX ? MIDX + 12 : clamp(FL - x, MIDX + 6, GX - 60), ry = clamp(y, FT + 16, FB - 10);
  game.carrier = null;
  setupPossession(rx, ry);
  game.checkT = -1;
  game.ruleGrace = Math.max(game.ruleGrace || 0, 1);
  addFx('cue', 0, 0, {
   s: why && /SCOOP|PICKED|STRIP|CHECK/.test(why) ? why : 'YOUR BALL',
   col: '#7dff7a',
   life: 1.2
  });
  SFX.whistle();
  N.snapT = 0;
 }
 N.handoff = handoff;
 const FO_NET = {
  leadMin: 1500,
  leadMax: 2500,
  pressWait: 3.2,
  clockOk: 320
 };
 N.FO_NET = FO_NET;
 function nowMs() {
  return performance.timeOrigin + performance.now();
 }
 N.nowMs = nowMs;
 function foStartNet(n, opening) {
  N.foN = n;
  N.fo = {
   n: n,
   mine: null,
   theirs: null,
   res: null,
   t0: performance.now(),
   myDown: false,
   theirDown: false,
   go: null,
   setDur: null,
   opening: opening === true
  };
  N.auth = false;
  N.view = null;
  N.pred = null;
  N.applying = true;
  try {
   ORIG.startFaceoff(opening);
  } finally {
   N.applying = false;
  }
  const q = (N.foQ || []).filter(e => e.n === n);
  N.foQ = (N.foQ || []).filter(e => e.n > n);
  for (const e of q) onEvent(e);
 }
 function foHold(e) {
  if (N.fo && e.n < N.fo.n) return;
  (N.foQ = N.foQ || []).push(e);
  if (N.foQ.length > 12) N.foQ.shift();
 }
 function foNetDown(auto) {
  const f = N.fo, G = game, F = G && G.fo;
  if (!f || f.myDown || !F || F.phase !== 'form') return false;
  f.myDown = true;
  f.myAuto = !!auto;
  f.myDownAt = performance.now();
  N.stats.foDowns = (N.stats.foDowns || 0) + 1;
  addFx('txt', MIDX - 7, G.foMe.y - 26, {
   s: 'DOWN',
   col: '#ffe14d',
   life: .9
  });
  try {
   ORIG.SFX.tap();
  } catch (e) {}
  N.link.send({
   t: 'fod',
   n: f.n,
   auto: !!auto
  });
  if (N.side === 'h') foMaybeGo();
  return true;
 }
 function clockChoices() {
  const c = N.clk, t = performance.now(), out = {};
  if (c.wsOff != null && t - c.wsAt < 3e4 && c.wsS.length >= 3) out.ws = {
   off: c.wsOff,
   err: c.wsRtt / 2
  };
  if (c.srvOff != null) out.srv = {
   off: c.srvOff,
   err: c.srvRtt / 2
  };
  if (c.peerOff != null && t - c.peerAt < 6e4) out.peer = {
   off: c.peerOff,
   err: c.peerRtt / 2
  };
  return out;
 }
 N.clockChoices = clockChoices;
 function foMaybeGo() {
  const f = N.fo;
  if (!f || f.go || !f.myDown || !f.theirDown || N.side !== 'h') return;
  const L = N.link, ow = L ? L.oneWay() : 1e3;
  const lead = Math.round(clamp(700 + 2.5 * ow, FO_NET.leadMin, FO_NET.leadMax));
  const at = nowMs() + lead, sd = +(1.05 + Math.random() * .3).toFixed(3), C = clockChoices();
  const msg = {
   t: 'fogo',
   n: f.n,
   at: at,
   lead: lead,
   ow: Math.round(ow),
   sd: sd
  };
  if (C.ws) {
   msg.atW = at + C.ws.off;
   msg.wErr = +C.ws.err.toFixed(1);
  }
  if (C.srv) {
   msg.atS = at + C.srv.off;
   msg.sErr = +C.srv.err.toFixed(1);
  }
  msg.sentAt = nowMs();
  N.link.send(msg);
  foArm(at, sd, 'host');
 }
 function foArm(localAt, sd, how, err) {
  const f = N.fo;
  if (!f || f.go) return;
  f.go = localAt;
  f.setDur = sd;
  f.theirDown = true;
  f.how = how;
  f.armedAt = nowMs();
  N.foSync = {
   n: f.n,
   at: localAt,
   how: how,
   err: err != null ? Math.round(err) : null,
   lateMs: Math.max(0, Math.round(nowMs() - localAt))
  };
 }
 function foGuestArm(e) {
  const C = clockChoices();
  let best = null;
  const cand = (how, local, err) => {
   if (local != null && isFinite(local) && (!best || err < best.err)) best = {
    how: how,
    local: local,
    err: err
   };
  };
  if (C.ws && e.atW != null) cand('ws', e.atW - C.ws.off, C.ws.err + (e.wErr || 0));
  if (C.srv && e.atS != null) cand('server', e.atS - C.srv.off, C.srv.err + (e.sErr || 0));
  if (C.peer) cand('peer', e.at - C.peer.off, C.peer.err);
  if (!best || best.err > FO_NET.clockOk) {
   const ow = N.link ? N.link.oneWay() : e.ow || 150;
   best = {
    how: 'arrival',
    local: nowMs() + Math.max(0, (e.lead || 1500) - ow),
    err: ow / 2
   };
  }
  foArm(best.local, e.sd, best.how, best.err);
 }
 function foStartCount() {
  const f = N.fo, G = game, F = G && G.fo;
  if (!f || !F || F.phase !== 'form') return;
  N.applying = true;
  try {
   ORIG.foDown(!!f.myAuto);
  } finally {
   N.applying = false;
  }
  F.setDur = f.setDur || F.setDur;
  const e = Math.max(0, (nowMs() - f.go) / 1e3);
  if (e < F.readyDur) F.t = e; else {
   F.phase = 'set';
   F.t = Math.min(e - F.readyDur, F.setDur);
  }
  f.countAt = nowMs();
  N.stats.foCounts = (N.stats.foCounts || 0) + 1;
  f.whistleSched = f.go + (F.readyDur + F.setDur) * 1e3;
 }
 function foNetTick(dt) {
  const f = N.fo, G = game, F = G && G.fo;
  if (!f || !F) return;
  const el = (performance.now() - f.t0) / 1e3;
  if (F.phase === 'form') {
   if (f.go && nowMs() >= f.go) foStartCount();
  } else if (f.countAt && (F.phase === 'ready' || F.phase === 'set' || F.phase === 'go')) {
   const e = (nowMs() - f.go) / 1e3 - dt;
   if (F.phase === 'ready') F.t = Math.max(F.t, e); else F.t = Math.max(F.t, e - F.readyDur);
  }
 }
 function foNetPose() {
  const f = N.fo, G = game, F = G && G.fo;
  if (!f || !F || F.phase !== 'form') return;
  if (f.myDown && G.foMe) G.foMe.x = MIDX - 7;
  if (f.theirDown && G.foThem) G.foThem.x = MIDX + 7;
 }
 function foLocalPress(p) {
  if (!N.fo || N.fo.mine) return;
  N.fo.mine = p;
  N.fo.pressAt = performance.now();
  const F = game.fo;
  if (F) {
   F.phase = 'wait';
   F.waitT = 0;
  }
  N.stats.fo++;
  if (N.fo.res) {
   foApply(N.fo.res);
   return;
  }
  if (N.side === 'h') foDecide(); else N.link.send({
   t: 'fop',
   n: N.fo.n,
   p: p
  });
 }
 function foDecide() {
  const f = N.fo;
  if (!f || f.res || !f.mine) return;
  const a = f.mine, b = f.theirs;
  if (!b) return;
  let hostWins;
  if (a.viol && b.viol) hostWins = Math.random() < .5; else if (a.viol || b.viol) hostWins = !a.viol; else {
   const p = clamp(.5 + ((a.rate || 0) - (b.rate || 0)) * .07 + ((b.react == null ? 1.6 : b.react) - (a.react == null ? 1.6 : a.react)) * 1.2 + .11 * ((a.fo || 0) - (b.fo || 0)), .08, .92);
   hostWins = Math.random() < p;
   f.p = p;
  }
  f.res = hostWins ? 'h' : 'g';
  N.link.send({
   t: 'for',
   n: f.n,
   w: f.res,
   p: f.p
  });
  foApply(f.res);
 }
 function foApply(w) {
  const f = N.fo;
  if (!f) return;
  f.res = w;
  const G = game, F = G && G.fo;
  if (!F) return;
  if (f.applied) return;
  f.applied = true;
  const iWin = w === N.side, my = f.mine || {
   slow: true,
   late: true
  };
  N.foLast = {
   n: f.n,
   win: iWin,
   mine: f.mine,
   theirs: f.theirs,
   p: f.p,
   how: f.how || null,
   lateMs: N.foSync && N.foSync.n === f.n ? N.foSync.lateMs : null
  };
  if (iWin) {
   N.auth = true;
   F.phase = 'set';
   F.whistleT = F.t;
   F.taps = F.taps || 0;
   if (my.viol || my.slow) {
    G.ball.x = MIDX;
    G.ball.y = CY;
    G.ball.state = 'fo';
    addFx('cue', 0, 0, {
     s: 'THEY JUMPED IT - YOUR BALL',
     col: '#7dff7a',
     life: 1.2
    });
    F.phase = 'scrum';
    F.win = true;
    F.st = 0;
    G.ball.state = 'loose';
    G.ball.vx = 70;
    G.ball.vy = (Math.random() - .5) * 40;
    G.stats.fot++;
    G.stats.fow++;
   } else {
    const mr = Math.random;
    let first = true;
    Math.random = () => {
     if (first) {
      first = false;
      return 0;
     }
     return mr();
    };
    try {
     ORIG.foResolve(my.dx || 1, my.dy || 0);
    } finally {
     Math.random = mr;
    }
   }
  } else {
   G.stats.fot++;
   becomeViewer();
   if (my.viol) addFx('cue', 0, 0, {
    s: 'TOO EARLY - THEIR BALL',
    col: '#ff9a8a',
    life: 1.4
   }); else if (my.late || my.slow) addFx('cue', 0, 0, {
    s: 'TOO SLOW - THEIR BALL',
    col: '#ff9a8a',
    life: 1.4
   });
  }
 }
 N.foDecideForTest = foDecide;
 const AGE_KEYS = [ 'chirpT0', 'saveT0', 'shootT0', 'bullT0', 'hitT0', 'chkT0' ];
 function packP(p) {
  const o = [ p.team, p.idx, +p.x.toFixed(1), +p.y.toFixed(1), +(p.anim || 0).toFixed(1), p.pl ? p.pl.id : null, p.down > 0 ? +p.down.toFixed(2) : 0, p.down > 0 ? +(p.downT0 || .9).toFixed(2) : 0, p.fallDir || 0, p.gk ? 1 : 0, p.rr || null ];
  let a = null;
  for (const k of AGE_KEYS) if (p[k] != null && menuT - p[k] < 1.2 && menuT >= p[k]) (a = a || {})[k] = +(menuT - p[k]).toFixed(2);
  if (p.saveFr) (a = a || {}).saveFr = p.saveFr;
  if (p.hand === -1) (a = a || {}).hand = -1;
  if (p.dodgeA) (a = a || {}).dA = {
   kind: p.dodgeA.kind,
   t: p.dodgeA.t,
   dur: p.dodgeA.dur,
   from: p.dodgeA.from
  };
  o.push(a);
  return o;
 }
 function sceneOut(sc) {
  const prim = o => {
   const r = {};
   for (const k in o) {
    const v = o[k];
    if (v == null || typeof v === 'number' || typeof v === 'boolean' || typeof v === 'string') r[k] = typeof v === 'number' ? +v.toFixed(2) : v;
   }
   return r;
  };
  const s = prim(sc);
  s.actors = (sc.actors || []).map(a => {
   const r = prim(a);
   r.pl = a.pl ? a.pl.id : null;
   return r;
  });
  s.pows = (sc.pows || []).map(p => prim(p));
  if (sc.who) s.who = sc.who.id || null;
  if (sc.vic) {
   s.vicI = (sc.actors || []).indexOf(sc.vic);
   if (sc.vic.helmFly) s.helmFly = prim(sc.vic.helmFly);
   s.helmLanded = !!sc.vic.helmLanded;
  }
  return s;
 }
 function makeSnap() {
  const G = game;
  N.snapSeq = (N.snapSeq || 0) + 1;
  const P = G.players.map(packP);
  const F = [ ...(G.farU || []).map(f => [ 'U', f.role, +f.x.toFixed(1), +f.y.toFixed(1), +(f.anim || 0).toFixed(1), f.pl ? f.pl.id : null ]), ...(G.farC || []).map(f => [ 'C', f.role, +f.x.toFixed(1), +f.y.toFixed(1), +(f.anim || 0).toFixed(1), f.pl ? f.pl.id : null ]) ];
  const b = G.ball || {
   x: MIDX,
   y: CY,
   state: 'dead'
  };
  const s = {
   k: 's',
   n: N.snapSeq,
   tm: +nowMs().toFixed(1),
   scr: screen,
   cam: +(camX + W / 2).toFixed(1),
   sc: G.score.slice(),
   q: G.q,
   clk: +(+G.clock).toFixed(2),
   sclk: +(+G.shotClock || 0).toFixed(2),
   ot: !!G.ot,
   otq: G.otq || 0,
   bh: G.brave ? 1 : 0,
   pen: G.pen ? {
    side: G.pen.side,
    left: +G.pen.left.toFixed(1)
   } : null,
   P: P,
   F: F,
   b: [ +b.x.toFixed(1), +b.y.toFixed(1), +(b.z || 0).toFixed(1), b.state, +(b.vx || 0).toFixed(0), +(b.vy || 0).toFixed(0) ],
   car: G.carrier ? G.players.indexOf(G.carrier) : -1,
   ctl: N.ctlIdx,
   cs: +(N.ctlSpd || 0).toFixed(2),
   swn: N.swnIn || 0,
   uchk: G.uchk && G.uchk.who === G.carrier ? G.uchk.n : 0,
   fx: fx.filter(f => f.type === 'txt' || f.type === 'cue' || f.type === 'pop' || f.type === 'catch' || f.type === 'tap').slice(-12).map(f => ({
    type: f.type,
    x: f.x,
    y: f.y,
    t: +f.t.toFixed(2),
    life: f.life,
    s: f.s,
    col: f.col,
    bub: f.bub
   }))
  };
  if (screen === 'banner' && G.banner) s.bn = {
   txt: G.banner.txt,
   sub: G.banner.sub,
   kind: G.banner.kind,
   t: +G.bannerT.toFixed(2)
  };
  if (screen === 'scene' && G.scene) s.scene = sceneOut(G.scene);
  if (screen === 'penalty') s.penPick = true;
  if (screen === 'live' && G.readyT > 0) s.rdy = 1;
  if (G.injBanner) s.injB = {
   txt: G.injBanner.txt,
   sub: G.injBanner.sub,
   t: G.injBanner.t
  };
  if (G.ejBanner) s.ejB = {
   txt: G.ejBanner.txt,
   sub: G.ejBanner.sub,
   t: G.ejBanner.t
  };
  if (window.SHOT26 && SHOT26.on()) s.sl = SHOT26.slow();
  return s;
 }
 N.makeSnap = makeSnap;
 const TM = {
  O: 'D',
  D: 'O',
  G: 'G2',
  G2: 'G'
 };
 function sets26On() {
  return !window.__rl_no26 && !window.__rl_no26sets;
 }
 function sets26Tick(G) {
  if (!N.inGame || !G || !sets26On() || G.tutorial || G.practice) return;
  const L = N.link, d = G.dset || 'man', k = d + '|' + (d === 'custom' ? G.dPlay || '' : '');
  if (L && L.connected && (k !== N.ds26Sent || performance.now() - (N.ds26At || 0) > 5e3)) {
   let z = null;
   if (d === 'custom' && typeof dCustomOn === 'function' && dCustomOn()) {
    try {
     dCustomKind();
     z = (ZONES.__dc || []).map(q => [ +q[0].toFixed(1), +q[1].toFixed(1) ]);
    } catch (e) {
     z = null;
    }
   }
   try {
    L.send(Object.assign({
     t: 'ds26',
     d: d
    }, z ? {
     z: z
    } : null));
    N.ds26Sent = k;
    N.ds26At = performance.now();
   } catch (e) {}
  }
  if (N.auth && N.hisD26) G.cpuDef = N.hisD26.d === 'zone' || N.hisD26.d === 'custom' ? 'zone' : N.hisD26.d === 'black' ? 'black' : 'man';
 }
 N.sets26Tick = sets26Tick;
 const POV26 = {
  YOUR: 'THEIR',
  THEIR: 'YOUR',
  OUR: 'THEIR',
  YOU: 'THEY',
  THEY: 'YOU'
 };
 function pov26(s) {
  if (typeof s !== 'string' || window.__rl_no26 || window.__rl_no26ball || !/\bBALL\b/.test(s)) return s;
  return s.replace(/\b(YOUR|THEIR|OUR|YOU|THEY)\b/g, w => POV26[w]);
 }
 N.pov26 = pov26;
 function applySnap(s, instant) {
  const V = N.view;
  if (!V || !game) return;
  const G = game, nowT = performance.now();
  if (V.last && !instant) {
   const d = (nowT - V.lastAt) / 1e3;
   V.iv = clamp(V.iv * .7 + d * .3, .03, .4);
  }
  V.last = s;
  V.lastAt = nowT;
  N.stats.applied++;
  const tm = !instant && s.tm != null ? s.tm : null;
  if (tm != null) jbArrive(tm, V);
  const seen = new Set, list = [];
  s.P.forEach((o, i) => {
   const key = o[0] + o[1] + (o[9] ? 'k' : '');
   seen.add(key);
   let p = V.ents.get(key);
   const tx = FL - o[2], ty = o[3];
   if (!p) {
    p = {
     team: TM[o[0]] || o[0],
     idx: o[1],
     x: tx,
     y: ty,
     tx: tx,
     ty: ty,
     anim: o[4]
    };
    V.ents.set(key, p);
    instant = instant || false;
   }
   p.team = TM[o[0]] || o[0];
   p.idx = o[1];
   if (instant || Math.hypot(tx - p.x, ty - p.y) > 60) {
    p.x = tx;
    p.y = ty;
    p.fx0 = tx;
    p.fy0 = ty;
   } else {
    p.fx0 = p.x;
    p.fy0 = p.y;
   }
   p.ttx = tx;
   p.tty = ty;
   p.a0 = p.anim || 0;
   p.a1 = o[4];
   jbPush(p, tm, tx, ty, o[4], instant, V);
   p.pl = o[5] ? PP(o[5]) : null;
   p.down = o[6];
   p.downT0 = o[7];
   p.fallDir = -(o[8] || 0);
   p.gk = !!o[9];
   p.rr = o[10];
   const a = o[11] || {};
   for (const k of AGE_KEYS) p[k] = a[k] != null ? menuT - a[k] : null;
   p.saveFr = a.saveFr || null;
   p.hand = a.hand || 1;
   p.dodgeA = a.dA || null;
   if (p.dodgeA) p.dodgeA = Object.assign({}, p.dodgeA, {
    from: -(p.dodgeA.from || 1)
   });
   p.si = i;
   list.push(p);
  });
  (s.F || []).forEach(f => {
   const key = 'F' + f[0] + f[1] + (f[5] || '');
   seen.add(key);
   let p = V.ents.get(key);
   const tx = FL - f[2], ty = f[3];
   if (!p) {
    p = {
     far: true,
     x: tx,
     y: ty,
     anim: f[4]
    };
    V.ents.set(key, p);
   }
   p.far = true;
   p.team = f[0] === 'U' ? 'C' : 'U';
   p.role = f[1];
   p.pl = f[5] ? PP(f[5]) : null;
   if (instant || Math.hypot(tx - p.x, ty - p.y) > 60) {
    p.x = tx;
    p.y = ty;
   }
   p.fx0 = p.x;
   p.fy0 = p.y;
   p.ttx = tx;
   p.tty = ty;
   p.a0 = p.anim || 0;
   p.a1 = f[4];
   jbPush(p, tm, tx, ty, f[4], instant, V);
   list.push(p);
  });
  for (const k of [ ...V.ents.keys() ]) if (!seen.has(k)) V.ents.delete(k);
  V.t0 = nowT;
  G.players = list.filter(p => !p.far).concat(list.filter(p => p.far));
  G.farU = null;
  G.farC = null;
  G.carrier = s.car >= 0 ? list.find(p => p.si === s.car && !p.far) || null : null;
  const bb = s.b;
  G.ball = G.ball || {};
  const bx = FL - bb[0];
  if (instant || !G.ball.x || Math.hypot(bx - G.ball.x, bb[1] - G.ball.y) > 80) {
   G.ball.x = bx;
   G.ball.y = bb[1];
  }
  V.b0 = [ G.ball.x, G.ball.y ];
  V.b1 = [ bx, bb[1] ];
  V.bp = V.bp || {
   x: G.ball.x,
   y: G.ball.y,
   anim: 0
  };
  jbPush(V.bp, tm, bx, bb[1], 0, instant || Math.hypot(bx - V.bp.x, bb[1] - V.bp.y) > 80 && bb[3] !== 'air', V);
  G.ball.z = bb[2];
  G.ball.state = bb[3];
  G.ball.vx = -bb[4];
  G.ball.vy = bb[5];
  G.score = [ s.sc[1], s.sc[0] ];
  G.q = s.q;
  G.clock = s.clk;
  G.shotClock = s.sclk;
  G.ot = s.ot;
  G.otq = s.otq || 0;
  G.brave = !!s.bh;
  G.pen = s.pen ? {
   side: s.pen.side === 'U' ? 'C' : 'U',
   left: s.pen.left
  } : null;
  G.vUchk = s.uchk || 0;
  fx = (s.fx || []).map(f => Object.assign({}, f, {
   x: f.type === 'cue' ? f.x : FL - f.x
  }, instant ? null : {
   s: pov26(f.s)
  }));
  G.banner = s.bn ? {
   txt: instant ? s.bn.txt : pov26(s.bn.txt),
   sub: instant ? s.bn.sub : pov26(s.bn.sub),
   kind: {
    goal: 'cgoal',
    fowin: 'folose',
    folose: 'fowin',
    keep: 'turnover',
    ours: 'turnover'
   }[s.bn.kind] || 'ours'
  } : null;
  G.bannerT = s.bn ? s.bn.t : 0;
  if (s.bn && s.bn.kind === 'goal') {
   G.banner.txt = s.bn.txt;
   G.banner.sub = s.bn.sub;
  }
  G.scene = s.scene ? sceneIn(s.scene) : null;
  G.injBanner = s.injB || null;
  G.ejBanner = s.ejB || null;
  V.camT = clamp(FL - s.cam - W / 2, 0, FL - W + PADW);
  if (instant) camX = V.camT;
  V.scr = s.scr;
  V.penPick = !!s.penPick;
  if (s.ctl != null) {
   const sl = N.swLocal;
   if (sl && (s.swn || 0) < sl.n && performance.now() - sl.at < 3e3) {} else {
    N.ctlIdx = s.ctl;
    if (sl && (s.swn || 0) >= sl.n) N.swLocal = null;
   }
  }
 }
 const JB = N.jb = {
  dS: [],
  D: 90,
  gaps: [],
  lastArr: 0
 };
 function jbArrive(tm, V) {
  const now = nowMs(), d = now - tm;
  JB.dS.push(d);
  if (JB.dS.length > 50) JB.dS.shift();
  if (JB.lastArr) {
   JB.gaps.push(now - JB.lastArr);
   if (JB.gaps.length > 80) JB.gaps.shift();
  }
  JB.lastArr = now;
  let base = Infinity;
  for (const x of JB.dS) if (x < base) base = x;
  JB.base = base;
  const dev = JB.dS.map(x => x - base).sort((a, b) => a - b), p90 = dev[Math.floor(dev.length * .9)] || 0;
  const iv = N.link && N.link.fastOk() ? 50 : 100;
  JB.Dt = clamp(p90 + iv * 1.15 + 12, 45, 650);
  V.D = JB.D;
  JB.newest = Math.max(JB.newest || 0, tm);
 }
 function jbClock(V, dt) {
  if (JB.base == null || !isFinite(JB.base) || !JB.newest) return null;
  JB.D += ((JB.Dt || JB.D) - JB.D) * Math.min(1, dt * (JB.Dt > JB.D ? 3 : .7));
  const tgt = nowMs() - JB.base - JB.D;
  if (V.rt == null || Math.abs(tgt - V.rt) > 500) V.rt = tgt; else V.rt += dt * 1e3 * clamp(1 + (tgt - V.rt) / 300, .85, 1.15);
  JB.ahead = V.rt - JB.newest;
  N.stats.jbExt = (N.stats.jbExt || 0) + (JB.ahead > 0 ? dt : 0);
  return V.rt;
 }
 function jbPush(p, tm, x, y, a, instant, V) {
  if (tm == null || instant) {
   p.h = [ {
    t: tm != null ? tm : -Infinity,
    x: x,
    y: y,
    a: a
   } ];
   if (instant) {
    p.x = x;
    p.y = y;
   }
   return;
  }
  const h = p.h || (p.h = []);
  if (!h.length || h[0].t === -Infinity) {
   h.length = 0;
   h.push({
    t: Math.min(tm - 1, V.rt != null ? V.rt : tm - JB.D),
    x: p.x,
    y: p.y,
    a: p.anim || 0
   });
  }
  const L = h[h.length - 1];
  if (tm <= L.t) return;
  if (Math.hypot(x - L.x, y - L.y) > 70) {
   h.length = 0;
   p.x = x;
   p.y = y;
  }
  h.push({
   t: tm,
   x: x,
   y: y,
   a: a
  });
  const keep = (V.rt != null ? V.rt : tm) - 400;
  while (h.length > 3 && h[1].t < keep) h.shift();
  if (h.length > 40) h.splice(0, h.length - 40);
 }
 function jbAt(p, t) {
  const h = p.h, n = h.length;
  if (n === 1 || t <= h[0].t) {
   const s = h[0];
   p.x = s.x;
   p.y = s.y;
   if (s.a != null) p.anim = s.a;
   return;
  }
  for (let i = n - 2; i >= 0; i--) {
   const a = h[i], b = h[i + 1];
   if (t >= a.t && t <= b.t) {
    const k = (t - a.t) / Math.max(1, b.t - a.t);
    p.x = a.x + (b.x - a.x) * k;
    p.y = a.y + (b.y - a.y) * k;
    p.anim = a.a + (b.a - a.a) * k;
    return;
   }
  }
  const a = h[n - 2], b = h[n - 1], span = Math.max(16, b.t - a.t), ex = Math.min(t - b.t, 220), k = ex * (1 - ex / 660) / span;
  p.x = b.x + (b.x - a.x) * k;
  p.y = b.y + (b.y - a.y) * k;
  p.anim = b.a + Math.max(0, b.a - a.a) * ex / span;
 }
 function sceneIn(s) {
  const G = game, sc = Object.assign({}, s);
  sc.actors = (s.actors || []).map(a => Object.assign({}, a, {
   x: FL - a.x,
   tx: FL - (a.tx || a.x),
   ty: a.ty,
   side: 1 - (a.side || 0),
   face: -(a.face || 1),
   kit: 1 - (a.side || 0) === 0 ? G.uk : G.ok,
   pl: a.pl ? PP(a.pl) : null,
   skin: a.pl ? skinOf(PP(a.pl)) : 0
  }));
  sc.pows = (s.pows || []).map(p => Object.assign({}, p, {
   x: FL - p.x
  }));
  sc.cx = FL - (s.cx || MIDX);
  sc.who = s.who ? PP(s.who) : null;
  if (s.vicI >= 0 && sc.actors[s.vicI]) {
   const v = sc.actors[s.vicI];
   sc.vic = v;
   if (s.helmFly) v.helmFly = Object.assign({}, s.helmFly, {
    x0: FL - s.helmFly.x0,
    x1: FL - s.helmFly.x1
   });
   v.helmLanded = s.helmLanded;
  }
  return sc;
 }
 function viewTick(dt) {
  const V = N.view, G = game;
  if (!V || !G) return;
  const k = clamp((performance.now() - V.t0) / 1e3 / Math.max(.03, V.iv), 0, 1);
  const rt = jbClock(V, dt);
  if (rt != null) {
   for (const p of V.ents.values()) if (p.h && p.h.length) jbAt(p, rt);
   if (V.bp && V.bp.h && V.bp.h.length) {
    jbAt(V.bp, rt);
    G.ball.x = V.bp.x;
    G.ball.y = V.bp.y;
   }
  } else {
   for (const p of V.ents.values()) {
    if (p.ttx == null) continue;
    p.x = p.fx0 + (p.ttx - p.fx0) * k;
    p.y = p.fy0 + (p.tty - p.fy0) * k;
    p.anim = p.a0 + (p.a1 - p.a0) * k;
   }
   if (V.b0) {
    G.ball.x = V.b0[0] + (V.b1[0] - V.b0[0]) * k;
    G.ball.y = V.b0[1] + (V.b1[1] - V.b0[1]) * k;
   }
  }
  G.t += dt;
  menuT += 0;
  for (const f of fx) f.t += dt;
  fx = fx.filter(f => f.t < (f.life || .5));
  if (G.injBanner) G.injBanner.t += dt;
  if (G.ejBanner) G.ejBanner.t += dt;
  if (G.scene) G.scene.t += dt;
  if (G.banner) G.bannerT += dt;
  try {
   pelletTick(dt);
  } catch (e) {}
  try {
   if (G.players && G.players.length) updateRefs(G, dt);
  } catch (e) {}
  camX += ((V.camT != null ? V.camT : camX) - camX) * Math.min(1, dt * 5);
  predTick(dt * (window.SHOT26 && SHOT26.netSlow ? SHOT26.netSlow() : 1));
  N.inT = (N.inT || 0) - dt;
  const j = N.vjoy, cur = j && j.m > 0 ? [ +j.ux.toFixed(2), +j.uy.toFixed(2), +j.m.toFixed(2) ] : [ 0, 0, 0 ];
  const P = N.pred, pos = P && P.live ? [ +(FL - P.x).toFixed(1), +P.y.toFixed(1) ] : null;
  const key = cur.join(',');
  if (key !== N.inKey || N.inT <= 0) {
   N.inKey = key;
   N.inT = pos ? N.link.fastOk() ? .04 : .1 : .25;
   N.link.latest({
    k: 'i',
    j: [ -cur[0], cur[1], cur[2] ],
    ctl: N.ctlIdx,
    swn: N.swn || 0,
    pos: pos
   });
   N.stats.inSent = (N.stats.inSent || 0) + 1;
  }
 }
 function predTick(dt) {
  const G = game, me = myGuy(), j = N.vjoy, act = !!(j && j.m > 0 && !G.scene && N.view && N.view.scr === 'live');
  let P = N.pred;
  if (!me) {
   N.pred = null;
   return;
  }
  if (P && P.idx !== me.idx) P = N.pred = null;
  if (act) {
   if (!P) P = N.pred = {
    idx: me.idx,
    x: me.x,
    y: me.y,
    live: true,
    moved: 0
   };
   P.live = true;
   P.relAt = 0;
   if (!(me.down > 0)) {
    const sp = N.view.last && N.view.last.cs || PACE.dBall * DZ.ctrlSpd, s = sp * (.55 + .45 * j.m) * dt;
    P.x = clamp(P.x + j.ux * s, FL - ENDX + 3, FL - DEND - 8);
    P.y = clamp(P.y + j.uy * s, FT + 12, FB - 2);
    P.moved += s;
    me.anim = (me.anim || 0) + s;
   }
  } else if (P) {
   if (!P.relAt) P.relAt = performance.now();
   const hold = 750 + Math.min(900, 2 * N.link.oneWay());
   if (performance.now() - P.relAt > hold) {
    P.live = false;
    const k = Math.min(1, dt * 8);
    P.x += (me.x - P.x) * k;
    P.y += (me.y - P.y) * k;
    if (Math.hypot(me.x - P.x, me.y - P.y) < 1.5) {
     N.pred = null;
     return;
    }
   }
  }
  if (N.pred) {
   me.x = P.x;
   me.y = P.y;
  }
 }
 function onEvent(e) {
  N.stats.recv++;
  if (!N.inGame && N.rejoining && e.t !== 'resume' && e.t !== 'leave' && e.t !== 'lobby') {
   if (e._p2p) {
    (N.preQ = N.preQ || []).push(e);
    if (N.preQ.length > 40) N.preQ.shift();
   }
   return;
  }
  const G = game;
  switch (e.t) {
  case 'ds26':
   N.hisD26 = {
    d: String(e.d || 'man'),
    z: Array.isArray(e.z) && e.z.length >= 6 ? e.z : null
   };
   if (N.hisD26.z) ZONES.__dc26 = N.hisD26.z;
   return;

  case 'slo':
   if (!N.auth) {
    N.slo26 = +e.f || 1;
    N.slo26At = performance.now();
   }
   return;

  case 'poss':
   if (!N.inGame || !G) return;
   applyShared(e.sh);
   becomeAuthority(e.x, e.y, e.why, e.lc ? {
    gk: !!e.gk
   } : null);
   return;

  case 'fo':
   if (!N.inGame || !G) return;
   if (e.sh) applyShared(e.sh);
   foStartNet(e.n, e.opening);
   return;

  case 'fop':
   if (!N.fo || e.n !== N.fo.n) {
    foHold(e);
    return;
   }
   N.fo.theirs = e.p;
   if (!N.fo.theirDown) {
    N.fo.theirDown = true;
    if (N.side === 'h') foMaybeGo();
   }
   if (N.side === 'h') foDecide();
   return;

  case 'for':
   if (!N.fo || e.n !== N.fo.n) {
    foHold(e);
    return;
   }
   N.fo.res = e.w;
   if (e.p != null) N.fo.p = e.p;
   if (N.fo.mine) foApply(e.w); else if (game && game.fo) {
    N.fo.mine = {
     slow: true,
     late: true
    };
    foApply(e.w);
   }
   return;

  case 'fod':
   if (!N.fo || e.n !== N.fo.n) {
    foHold(e);
    return;
   }
   N.fo.theirDown = true;
   N.fo.theirAuto = !!e.auto;
   if (N.side === 'h') foMaybeGo();
   return;

  case 'fogo':
   if (!N.fo || e.n !== N.fo.n) {
    foHold(e);
    return;
   }
   if (N.side !== 'h') foGuestArm(e);
   return;

  case 'tp':
   if (N.side === 'h') N.link.send({
    t: 'tq',
    a: e.a,
    b: nowMs()
   });
   return;

  case 'tq':
   if (e._p2p || e._ws) clkPeer(e.a, e.b);
   return;

  case 'qend':
   if (!N.inGame || !G) return;
   applyShared(e.sh);
   N.auth = false;
   N.view = null;
   N.applying = true;
   try {
    ORIG.endQuarter();
   } finally {
    N.applying = false;
   }
   return;

  case 'final':
   if (!N.inGame || !G) return;
   applyShared(e.sh);
   N.auth = false;
   N.view = null;
   N.applying = true;
   try {
    ORIG.finishGame();
   } finally {
    N.applying = false;
   }
   return;

  case 'chk':
   if (N.auth && screen === 'live') N.lastChk = remoteCheck(e.vd);
   return;

  case 'hit':
   if (N.auth && screen === 'live') N.lastHit = remoteHit(e.vd);
   return;

  case 'sw':
   if (N.auth) {
    if (e.swn != null) {
     if (e.swn <= (N.swnIn || 0)) return;
     N.swnIn = e.swn;
    }
    N.ctlIdx = e.i;
    N.manualSw = G ? G.t : 0;
   }
   return;

  case 'skip':
   if (N.auth && screen === 'scene') {
    N.skipReq = performance.now();
    N.applying = true;
    try {
     ORIG.sceneSkip();
    } finally {
     N.applying = false;
    }
   }
   return;

  case 'au':
   playAudio(e);
   return;

  case 'hello':
   if (N.inGame && G && e.rejoin) {
    N.link.send({
     t: 'resume',
     sh: getShared(),
     st: N.st
    });
    N.auth = false;
    N.view = null;
    N.dc = null;
    if (N.side === 'h') {
     screen = 'pregame';
     G.preT = 1.5;
    } else {
     screen = 'pregame';
     G.preT = 0;
    }
    flash('OPPONENT IS BACK', 3);
   }
   return;

  case 'resume':
   if (!N.inGame && e.st) {
    N.resumeSh = e.sh ? {
     ...e.sh
    } : null;
    if (N.resumeSh) {}
    beginOnlineGame(e.st);
    if (game) game.preT = N.side === 'h' ? 1.5 : 0;
    const q = N.preQ || [];
    N.preQ = null;
    for (const x of q) onEvent(x);
   }
   return;

  case 'leave':
   if (N.inGame) {
    endOnlineGame();
    screen = 'menu';
    game = null;
    banner('OPPONENT LEFT THE GAME - NO RESULT');
   }
   return;

  case 'lobby':
   pollLobby();
   return;

  case 'coin':
   if (!N.inGame || !G || N.side === 'h' || screen !== 'pregame') return;
   if (G.coin && G.coin.phase !== 'netwait') return;
   G.coin = {
    phase: 'flip',
    t: 0,
    call: null,
    res: e.res,
    win: e.res === 'H' ? 1 : 0,
    end: null,
    picker: null,
    caller: null,
    online: true
   };
   return;

  case 'coinp':
   if (!N.inGame || !G || !G.coin) return;
   {
    const who = e.by === N.side ? 0 : 1;
    if (G.coin.phase === 'flip' || G.coin.phase === 'netwait') {
     G.coin.pend = {
      end: e.end,
      who: who
     };
     return;
    }
    N.applying = true;
    try {
     coinPick15(G, e.end, who);
    } finally {
     N.applying = false;
    }
   }
   return;

  case 'ver':
   N.oppVer = e.v;
   N.verBad = e.v !== GAMEV ? e.v : null;
   if (!e.re) N.link.send({
    t: 'ver',
    v: GAMEV,
    re: 1
   });
   return;

  case 'to':
   if (!N.inGame || !G || window.__rl_no2318d) return;
   G.toReq18 = 0;
   if (e.left != null) G.tos[1] = e.left;
   to18Hold();
   return;

  case 'toq':
   if (!N.inGame || !G) return;
   {
    const ok = !window.__rl_no2318d && N.auth && !G.toHold18 && toDead() && !G.over && G.tos[1] > 0;
    if (ok) {
     G.tos[1]--;
     G.toLog = G.toLog || [];
     G.toLog.push({
      side: 'C',
      q: G.q,
      clock: +G.clock.toFixed(1),
      why: 'net'
     });
     to18Hold();
    }
    N.link.send({
     t: 'toa',
     ok: ok ? 1 : 0,
     left: G.tos[1]
    });
   }
   return;

  case 'toa':
   if (!N.inGame || !G) return;
   if (!e.ok) {
    G.toReq18 = 0;
    return;
   }
   if (!G.toReq18) {
    N.link.send({
     t: 'tor',
     undo: 1
    });
    return;
   }
   to18Open(e.left);
   return;

  case 'tor':
   if (!N.inGame || !G) return;
   if (e.d19) {
    if (on2319d()) to19Him(e);
    return;
   }
   if (e.undo && G.toHold18) G.tos[1]++;
   to18Release(e);
   return;
  }
 }
 N.t26 = {
  onEvent: e => onEvent(e),
  onLatest: o => onLatest(o),
  applySnap: (s, i) => applySnap(s, i)
 };
 function onLatest(o) {
  if (o.k === 's') {
   N.stats.snaps++;
   if (!N.auth && N.inGame && screen === 'netview' && N.view) {
    if (o.sl != null) {
     N.slo26 = +o.sl || 1;
     N.slo26At = performance.now();
    }
    applySnap(o);
   }
  } else if (o.k === 'i') {
   N.rin = o;
   N.rinAt = performance.now();
   if (o.j && o.j[2] > 0) N.rinMoveAt = N.rinAt;
  }
 }
 N.liveD = function(G, dt, c, b) {
  if (!N.inGame || !N.auth) return;
  const D = G.players.filter(p => p.team === 'D');
  if (!D.length) return;
  const r = N.rin, fresh = r && performance.now() - (N.rinAt || 0) < 1500;
  if (fresh && r.swn != null && r.swn > (N.swnIn || 0)) {
   N.swnIn = r.swn;
   if (D.some(p => p.idx === r.ctl)) {
    N.ctlIdx = r.ctl;
    N.manualSw = G.t;
   }
  }
  if (c && c !== N.lastCar) {
   N.lastCar = c;
   if (G.t - (N.manualSw || -9) > 1.5) {
    const m = D.find(d => d.mark === c) || D.slice().sort((p, q) => Math.hypot(p.x - c.x, p.y - c.y) - Math.hypot(q.x - c.x, q.y - c.y))[0];
    if (m) N.ctlIdx = m.idx;
   }
  }
  let d = D.find(p => p.idx === N.ctlIdx);
  if (!d) {
   const ref = c || b;
   d = D.slice().sort((p, q) => Math.hypot(p.x - ref.x, p.y - ref.y) - Math.hypot(q.x - ref.x, q.y - ref.y))[0];
   N.ctlIdx = d.idx;
  }
  for (const p of D) p.netCtl = p === d;
  const mul = Math.max(.5, spdMul(d) * (DF.dSpd || 1)), base = PACE.dBall * DZ.ctrlSpd;
  N.ctlSpd = base * mul;
  if (d.down > 0) return;
  if (d.netStun > 0) {
   d.netStun -= dt;
   d.tx = d.x;
   d.ty = d.y;
   d.spd = 0;
   return;
  }
  if (fresh && r.pos && r.ctl === d.idx && (r.j[2] > 0 || performance.now() - (N.rinMoveAt || 0) < 750)) {
   const lead = r.j[2] > 0 ? clamp((N.link ? N.link.oneWay() : 80) / 1e3 + (performance.now() - N.rinAt) / 1e3, .03, .5) * (.55 + .45 * r.j[2]) * (window.SHOT26 && SHOT26.on() ? SHOT26.slow() : 1) : 0, tx = r.pos[0] + r.j[0] * base * lead, ty = r.pos[1] + r.j[1] * base * lead;
   const dist = Math.hypot(tx - d.x, ty - d.y);
   d.tx = tx;
   d.ty = ty;
   d.spd = clamp(dist / .12, base * .5, base * 1.8) / mul;
   d.react = 0;
   d.netMoveT = G.t;
   N.stats.posIn = (N.stats.posIn || 0) + 1;
   return;
  }
  if (fresh && r.j && r.j[2] > 0) {
   d.tx = d.x + r.j[0] * 30;
   d.ty = d.y + r.j[1] * 30;
   d.spd = base * (.55 + .45 * r.j[2]);
   d.react = 0;
   d.netMoveT = G.t;
  }
 };
 function remoteD() {
  const G = game;
  return G && G.players.find(p => p.team === 'D' && p.netCtl);
 }
 function lagSlack() {
  return N.link ? clamp(6 + (N.link.oneWay() + (N.view && N.view.D || 0)) * .05, 8, 22) : 16;
 }
 function remoteCheck(vd) {
  const G = game, c = G.carrier, d = remoteD(), b = G.ball;
  if (!d || d.down > 0) return;
  if ((d.netChkCd || 0) > G.t || d.netStun > 0) return;
  d.netChkCd = G.t + DZ.checkCd;
  d.chkT0 = menuT;
  G.netChecks = (G.netChecks || 0) + 1;
  if (typeof setSag17 === 'function' && setSag17()) {
   G.net17 = (G.net17 || 0) + 1;
   addFx('txt', d.x, d.y - 24, {
    s: 'THEY\'RE SETTING UP',
    col: '#ffe14d',
    life: .6
   });
   return 'set17';
  }
  if (!c || b.state !== 'held') {
   addFx('txt', d.x, d.y - 24, {
    s: 'NOBODY HAS IT',
    col: '#ffe14d',
    life: .6
   });
   return 'none';
  }
  const dd = Math.hypot(c.x - d.x, c.y - d.y);
  if (dd > DZ.checkR && !(vd != null && vd <= DZ.checkR && dd <= DZ.checkR + lagSlack())) {
   d.netStun = .3;
   addFx('txt', d.x, d.y - 30, {
    s: 'WHIFF - TOO FAR',
    col: '#ff9a8a',
    life: .7
   });
   return 'far';
  }
  if (penaltyRoll('check', d)) return 'flag';
  let land = clamp(.6 + .1 * pr(d, 'def') - .08 * pr(c, 'stk'), .3, .88) * (DF.uLand || 1);
  const sd110 = typeof chk110 === 'function' && chk110(G) ? side110(c, d, GX) : null;
  if (sd110 === 'off' && !inZone110(c, 'U')) land *= CHK110.offLand;
  if (sd110) {
   G.netChkSide = G.netChkSide || {};
   G.netChkSide[sd110] = (G.netChkSide[sd110] || 0) + 1;
  }
  if (Math.random() >= land) {
   d.netStun = .45;
   G.beatT = Math.max(G.beatT || 0, .5);
   addFx('txt', d.x, d.y - 24, {
    s: 'WHIFF!',
    col: '#ff9a8a',
    life: .7
   });
   return 'whiff';
  }
  if (!G.uchk || G.uchk.who !== c) G.uchk = {
   who: c,
   n: 0,
   lastLand: G.t
  };
  G.uchk.n++;
  G.uchk.lastLand = G.t;
  G.netLanded = (G.netLanded || 0) + 1;
  G.uSlow = Math.max(G.uSlow || 0, .22);
  sfx12('check_clack', .75);
  addFx('pop', c.x + 6, c.y - 9);
  try {
   v14Check(c, d);
  } catch (e) {}
  const pOut = clamp(.16 + .1 * pr(d, 'def') - .1 * pr(c, 'stk'), .05, .45) * (DF.uLand || 1);
  const one110 = !!sd110 && sd110 !== 'off' && inZone110(c, 'U');
  if (one110) G.netStripZone = (G.netStripZone || 0) + 1;
  if (G.uchk.n >= 3 || one110 || Math.random() < pOut) {
   G.uchk.n = 0;
   G.netStrips = (G.netStrips || 0) + 1;
   try {
    st14('ct', d.pl);
   } catch (e) {}
   checkPop();
   return 'strip';
  }
  addFx('txt', c.x, c.y - 26, {
   s: 'CHECKED ' + G.uchk.n + '/3',
   col: '#ffb14d',
   life: .6
  });
  return 'land';
 }
 function remoteHit(vd) {
  const G = game, c = G.carrier, d = remoteD(), b = G.ball;
  if (!d || d.down > 0 || d.netStun > 0) return;
  d.hitT0 = menuT;
  G.netHits = (G.netHits || 0) + 1;
  if (typeof setSag17 === 'function' && setSag17()) {
   G.net17 = (G.net17 || 0) + 1;
   return 'set17';
  }
  if (!c || b.state !== 'held') return 'none';
  const dd = Math.hypot(c.x - d.x, c.y - d.y);
  if (dd > DZ.hitR && !(vd != null && vd <= DZ.hitR && dd <= DZ.hitR + lagSlack())) {
   d.netStun = .6;
   G.beatT = Math.max(G.beatT || 0, .8);
   SFX.bad();
   addFx('txt', d.x, d.y - 30, {
    s: 'MISSED HIM - TOO FAR',
    col: '#ff9a8a',
    life: .8
   });
   return 'far';
  }
  const face = G.run ? [ G.run.x, G.run.y ] : facingOf({
   x: c.x,
   y: c.y
  }, GX);
  if (fromBehind(d, c, face)) {
   knockDown(c, d);
   if (foulCall('PUSHING', 'HIT FROM BEHIND', 'C', d)) return 'foul';
   return 'foul';
  }
  if (penaltyRoll('hit', d)) return 'flag';
  if (!hasRunUp(d, c, PACE.dBall * DZ.ctrlSpd)) {
   shove(c, d);
   d.netStun = .35;
   return 'shove';
  }
  if (Math.random() < hitChance(d, c)) {
   knockDown(c, d);
   G.netLevels = (G.netLevels || 0) + 1;
   try {
    st14('ct', d.pl);
   } catch (e) {}
   const a = Math.atan2(c.y - d.y, c.x - d.x) + rnd(-1.2, 1.2), v = rnd(42, 60);
   popLoose(c.x + BX, c.y + 1, Math.cos(a) * v, Math.sin(a) * v, 'hit');
   c.down = .9;
   c.stun = .9;
   return 'level';
  }
  d.netStun = .7;
  G.beatT = 1;
  addFx('txt', d.x, d.y - 24, {
   s: 'MISSED HIM!',
   col: '#ff9a8a',
   life: .8
  });
  SFX.bad();
  return 'whiff';
 }
 N.remoteCheck = remoteCheck;
 N.remoteHit = remoteHit;
 let audioIn = false, audioQ = 0;
 function playAudio(e) {
  audioIn = true;
  try {
   if (e.f === 's') ORIG.sfx12(...e.a); else if (e.f === 'S' && ORIG.SFX[e.a]) ORIG.SFX[e.a]();
  } catch (er) {} finally {
   audioIn = false;
  }
 }
 function relayAudio(f, a) {
  if (!N.inGame || audioIn || !N.link) return;
  if (!(N.auth || N.chirping)) return;
  if (audioQ > 30) return;
  audioQ++;
  N.link.send({
   t: 'au',
   f: f,
   a: a
  });
 }
 setInterval(() => {
  audioQ = 0;
 }, 1e3);
 const ORIG = N.ORIG = {};
 function wrap(name, fn) {
  const o = window[name];
  if (typeof o !== 'function') {
   console.warn('RLNET: no ' + name);
   return;
  }
  ORIG[name] = o;
  window[name] = function(...a) {
   return fn.call(this, o, ...a);
  };
 }
 wrap('startDefense', (o, ...a) => {
  if (N.inGame && N.auth && !N.applying) {
   handoff(a[0] && a[0].x != null ? {
    x: FL - a[0].x,
    y: a[0].y
   } : null, 'THEIR BALL');
   return;
  }
  if (N.inGame && !N.applying) return;
  return o(...a);
 });
 wrap('startDefenseLive', (o, ...a) => {
  if (N.inGame && N.auth && !N.applying) {
   {
    const G = game, b = G && (G.turnSpot || G.ball) || null;
    N.lc2318 = !window.__rl_no2318b && !window.__rl_v124gb && G && !G.tutorial && !G.penPending && b && b.x > MIDX + 4 ? {
     gk: screen === 'banner' && !!G.banner && G.banner.txt === 'SAVED!'
    } : null;
   }
   handoff(null, 'THEIR BALL');
   return true;
  }
  if (N.inGame && !N.applying) return true;
  return o(...a);
 });
 wrap('startCpu', (o, ...a) => {
  if (N.inGame && N.auth && !N.applying) {
   handoff(null, 'THEIR BALL');
   return;
  }
  if (N.inGame && !N.applying) return;
  return o(...a);
 });
 wrap('cpuZoneKind181', (o, G, dl) => N.inGame && N.auth && sets26On() && N.hisD26 && N.hisD26.d === 'custom' && N.hisD26.z && dl && dl.length >= 6 && ZONES.__dc26 ? '__dc26' : o(G, dl));
 wrap('startFaceoff', (o, ...a) => {
  if (!N.inGame || N.applying) return o(...a);
  const host = N.side === 'h';
  const mayStart = screen === 'pregame' || screen === 'qbreak' ? host : N.auth || host && !N.auth && screen !== 'netview';
  if (!mayStart) return;
  const n = (N.foN || 0) + 1, opening = a[0];
  N.link.send({
   t: 'fo',
   n: n,
   opening: opening,
   sh: getShared()
  });
  foStartNet(n, opening);
 });
 wrap('foResolve', (o, dx, dy) => {
  if (!N.inGame || N.applying) return o(dx, dy);
  const G = game, F = G.fo;
  if (!F || F.phase === 'wait') return;
  foLocalPress({
   react: +(F.t - F.whistleT).toFixed(3),
   rate: +(F.taps / F.setDur).toFixed(3),
   fo: +rf(G.foMe.pl, 'fo').toFixed(3),
   dx: dx,
   dy: dy
  });
 });
 wrap('foDown', (o, auto) => {
  if (!N.inGame || N.applying || !N.fo) return o(auto);
  if (auto) return false;
  return foNetDown(false);
 });
 wrap('foDraw131', (o, F, B) => {
  if (!N.inGame || !N.fo || !F || F.phase !== 'form') return o(F, B);
  const f = N.fo, mid = W / 2;
  if (!f.myDown) {
   const keep = F.formIdle;
   F.formIdle = FO131.autoDown;
   try {
    o(F, B);
   } finally {
    F.formIdle = keep;
   }
   const s = f.theirDown ? 'OPPONENT IS DOWN - TAP DOWN WHEN READY' : 'TAP DOWN WHEN READY';
   const w = textW(s) + 12;
   rect(mid - w / 2, 82, w, 11, 'rgba(0,0,0,.75)');
   text(s, mid, 84, 1, f.theirDown ? '#7dff7a' : '#ffe14d', 'center');
   N.stats.tapDownDrawn = (N.stats.tapDownDrawn || 0) + 1;
   return;
  }
  for (let y = FT; y < FB; y += 4) {
   rect(RL_R - Math.round(camX), y, 1, 2, '#ffe14d');
   rect(RL_L - Math.round(camX), y, 1, 2, '#ffe14d');
  }
  const by = 56;
  rect(mid - 96, by, 192, 24, 'rgba(0,0,0,.7)');
  if (!f.go) {
   text('WAITING FOR OPPONENT...', mid, by + 3, 1, Math.floor(menuT * 3) % 2 ? '#ffe14d' : '#fff3a0', 'center', '#000');
   text('THE COUNT STARTS WHEN YOU ARE BOTH DOWN', mid, by + 12, 1, '#ffffff', 'center');
   G_waitDrawn();
  } else {
   text('BOTH DOWN', mid, by + 3, 1, '#7dff7a', 'center', '#000');
   text('GET READY...', mid, by + 12, 1, '#ffffff', 'center');
  }
 });
 function G_waitDrawn() {
  N.stats.waitDrawn = (N.stats.waitDrawn || 0) + 1;
 }
 wrap('endPossession', (o, kind, txt, sub) => {
  if (N.inGame && !N.applying && screen === 'faceoff' && (kind === 'folose' || kind === 'fowin')) {
   const F = game.fo;
   if (F && F.phase !== 'wait' && kind === 'folose') foLocalPress(txt === 'TOO SLOW!' ? {
    react: 2.2,
    slow: true,
    rate: 0,
    fo: rf(game.foMe.pl, 'fo')
   } : {
    viol: true
   });
   return;
  }
  return o(kind, txt, sub);
 });
 wrap('endQuarter', (o, ...a) => {
  if (N.inGame && !N.applying) {
   if (!N.auth) return;
   N.link.send({
    t: 'qend',
    sh: getShared()
   });
   N.auth = false;
   return o(...a);
  }
  return o(...a);
 });
 wrap('finishGame', (o, ...a) => {
  if (N.inGame && !N.applying && N.auth) N.link.send({
   t: 'final',
   sh: getShared()
  });
  const r = o(...a);
  if (N.inGame) {
   N.gameOver = {
    score: game.score.slice(),
    t: Date.now()
   };
   N.auth = false;
   saveNetGame(null);
  }
  return r;
 });
 wrap('coinTick15', (o, G, dt) => {
  if (!N.inGame || !G || !G.online) return o(G, dt);
  const host = N.side === 'h';
  if (!G.coin) {
   if (!host) return;
   const res = Math.random() < .5 ? 'H' : 'T';
   G.coin = {
    phase: 'flip',
    t: 0,
    call: null,
    res: res,
    win: res === 'H' ? 0 : 1,
    end: null,
    picker: null,
    caller: null,
    online: true
   };
   N.link.send({
    t: 'coin',
    res: res
   });
   return;
  }
  const c = G.coin;
  if (host && (c.phase === 'pick' || c.phase === 'cpupick') && c.t > COIN15.auto) {
   const end = ENDS15[Math.random() < .5 ? 0 : 1];
   if (c.phase === 'pick') coinPick15(G, end, 0); else if (coinPick15(G, end, 1)) N.link.send({
    t: 'coinp',
    end: end,
    by: 'g',
    auto: 1
   });
  }
  return o(G, dt);
 });
 wrap('coinPick15', (o, G, end, who) => {
  const r = o(G, end, who);
  if (r && N.inGame && G && G.online && who === 0 && !N.applying) N.link.send({
   t: 'coinp',
   end: end,
   by: N.side
  });
  return r;
 });
 wrap('sceneSkip', (o, ...a) => {
  if (N.inGame && !N.auth && !N.applying) {
   N.link.send({
    t: 'skip'
   });
   flash('SKIP SENT', 1);
   return;
  }
  return o(...a);
 });
 wrap('canTimeout', (o, ...a) => N.inGame ? window.__rl_no2318d ? false : to18Can(o, a) : o(...a));
 const TO18_NO = [ 'flag', 'buzzer', 'tutdone', 'cputo' ];
 function to18Can(o, a) {
  const G = game;
  if (!G || G.toHold18 || G.over || !(G.tos[0] > 0)) return false;
  if (G.toReq18 && performance.now() - G.toReq18 < 4e3) return false;
  if (N.auth) return o(...a);
  const s = N.view && N.view.last;
  if (screen !== 'netview' || !s || G.scene || G.tutorial) return false;
  return s.scr === 'banner' && !!s.bn && !TO18_NO.includes(s.bn.kind) || s.scr === 'live' && !!s.rdy;
 }
 function to18Mute(f) {
  const v = window.voice12, w = SFX.whistle;
  window.voice12 = () => null;
  SFX.whistle = () => {};
  try {
   f();
  } finally {
   window.voice12 = v;
   SFX.whistle = w;
  }
 }
 function to18Hold() {
  const G = game;
  if (!G || G.toHold18) return;
  G.toHold18 = {
   scr: screen,
   banner: G.banner,
   bannerT: G.bannerT,
   bannerAuto: G.bannerAuto,
   clock: G.clock,
   shot: G.shotClock
  };
  N.vjoy = null;
  N.vact = null;
  stick = null;
  shootP = null;
  joy = null;
  G.run = null;
  G.banner = {
   txt: 'TIMEOUT',
   sub: T(G.opp).name + ' CALLED TIMEOUT - ' + G.tos[1] + ' LEFT',
   kind: 'cputo',
   net18: 1
  };
  G.bannerT = 0;
  G.bannerAuto = 0;
  screen = 'banner';
  if (N.auth) {
   SFX.whistle();
   startHuddle('c');
  } else to18Mute(() => startHuddle('c'));
  if (on2319d()) to19Panel();
 }
 function to18Release(e) {
  const G = game, h = G && G.toHold18;
  if (!h) return;
  G.toHold18 = null;
  if (G.to19) {
   G.to19 = null;
   if (G.toCtx && G.toCtx.net19) G.toCtx = null;
  }
  if (e && e.lu) G.lu[1] = JSON.parse(JSON.stringify(e.lu));
  G.clock = h.clock;
  G.shotClock = h.shot;
  if (h.scr === 'netview') {
   G.huddle = null;
   G.banner = null;
   screen = 'netview';
   return;
  }
  screen = h.scr;
  G.banner = h.banner;
  G.bannerAuto = h.bannerAuto;
  G.bannerT = h.scr === 'banner' ? 99 : h.bannerT;
 }
 function to18Open(left) {
  const G = game;
  G.toReq18 = 0;
  if (screen !== 'netview') {
   N.link.send({
    t: 'tor',
    undo: 1
   });
   return;
  }
  G.tos[0] = left;
  G.toLog = G.toLog || [];
  G.toLog.push({
   side: 'U',
   q: G.q,
   clock: +G.clock.toFixed(1),
   shot: +(+G.shotClock || 0).toFixed(1),
   at: 'netview'
  });
  G.toCtx = {
   net18: true
  };
  N.vjoy = null;
  N.vact = null;
  stick = null;
  joy = null;
  screen = 'timeout';
  panelDirty();
  to18Mute(() => startHuddle('u'));
  if (on2319d()) game.to19 = {
   me: 0,
   him: 0
  };
 }
 wrap('callTimeout', (o, ...a) => {
  if (!N.inGame || window.__rl_no2318d || !game) return o(...a);
  if (!canTimeout()) return false;
  if (!N.auth) {
   game.toReq18 = performance.now();
   N.link.send({
    t: 'toq'
   });
   return true;
  }
  const r = o(...a);
  if (r) {
   N.link.send({
    t: 'to',
    left: game.tos[0]
   });
   if (on2319d()) game.to19 = {
    me: 0,
    him: 0
   };
  }
  return r;
 });
 wrap('resumeFromTimeout', (o, ...a) => {
  const G = game;
  if (!N.inGame || window.__rl_no2318d || !G) return o(...a);
  if (G.toCtx && G.toCtx.net18) {
   G.toCtx = null;
   G.huddle = null;
   screen = 'netview';
   if (G.toStart) G.toStart18 = performance.now();
   N.link.send({
    t: 'tor',
    lu: G.lu[0]
   });
   return;
  }
  const r = o(...a);
  N.link.send({
   t: 'tor',
   lu: G.lu[0]
  });
  return r;
 });
 function on2319d() {
  return !window.__rl_no2319d && !window.__rl_v124gb && !window.__rl_no2318d;
 }
 N.on2319d = on2319d;
 function to19Panel() {
  const G = game;
  if (!G) return;
  G.to19 = {
   me: 0,
   him: 0,
   hold: 1
  };
  G.toCtx = {
   net19: true
  };
  N.vjoy = null;
  N.vact = null;
  stick = null;
  joy = null;
  flash(T(G.opp).name + ' CALLED TIMEOUT - ' + G.tos[1] + ' LEFT', 3);
  screen = 'timeout';
  panelDirty();
 }
 function to19Him(e) {
  const G = game, X = G && G.to19;
  if (!X || X.hold) return;
  if (e.lu) G.lu[1] = JSON.parse(JSON.stringify(e.lu));
  X.him = 1;
  panelDirty();
  if (X.me) {
   X.go = 1;
   resumeFromTimeout();
  }
 }
 wrap('resumeFromTimeout', (o, ...a) => {
  const G = game, X = G && G.to19;
  if (!N.inGame || !G || !X || !on2319d()) return o(...a);
  if (X.go) {
   G.to19 = null;
   return o(...a);
  }
  if (X.me) return;
  X.me = 1;
  panelDirty();
  if (X.hold) {
   N.link.send({
    t: 'tor',
    d19: 1,
    lu: G.lu[0]
   });
   return;
  }
  if (X.him) {
   X.go = 1;
   return resumeFromTimeout();
  }
 });
 function to19Note(G, X) {
  const s = X.me ? X.him || X.hold ? 'DONE - WAITING FOR ' + T(G.opp).name + ' TO TAP RESUME...' : 'DONE - WAITING FOR ' + T(G.opp).name + ' TO PICK HIS PLAY...' : X.hold ? T(G.opp).name + ' CALLED TIMEOUT - PICK YOUR PLAY, THEN RESUME' : X.him ? T(G.opp).name + ' IS DONE - TAP RESUME WHEN YOU ARE READY' : 'BOTH PLAYERS PICK THEIR PLAYS - PLAY STARTS WHEN BOTH TAP RESUME';
  return '<div class="note" id="to19" style="color:' + (X.me ? '#ffb14d' : '#7dff7a') + ';text-align:center">' + esc(s) + '</div>';
 }
 {
  const rt0 = PANEL_RENDER.timeout;
  PANEL_RENDER.timeout = function(...a) {
   const h = rt0.apply(this, a), G = game, X = G && G.to19;
   return N.inGame && X && on2319d() ? to19Note(G, X) + h : h;
  };
 }
 wrap('cpuTimeoutMaybe', (o, ...a) => N.inGame ? false : o(...a));
 wrap('punchStart', (o, ...a) => {
  if (N.inGame) {
   game.punchArmed = false;
   return false;
  }
  return o(...a);
 });
 wrap('sfx12', (o, ...a) => {
  const r = o(...a);
  relayAudio('s', a);
  return r;
 });
 ORIG.SFX = {};
 for (const k of Object.keys(SFX)) {
  if (typeof SFX[k] !== 'function' || k === 'tap') continue;
  const f = SFX[k];
  ORIG.SFX[k] = f;
  SFX[k] = function(...a) {
   const r = f.apply(this, a);
   relayAudio('S', k);
   return r;
  };
 }
 wrap('isBallCarrier', (o, p) => {
  if (screen === 'netview' && game) return !!(game.ball && game.ball.state === 'held' && p === game.carrier);
  return o(p);
 });
 wrap('ballCarrier', o => {
  if (screen === 'netview' && game) return game.ball && game.ball.state === 'held' ? game.carrier : null;
  return o();
 });
 const on2318f = () => !window.__rl_no2318f && !window.__rl_v124gb;
 let to18fDown = null;
 ui.addEventListener('pointerdown', e => {
  if (!on2318f() || e.pointerType === 'mouse') return;
  const el = e.target && e.target.closest ? e.target.closest('.hb') : null, k = el && el.dataset.k;
  if (!k || !/\|TIMEOUT$/.test(k)) return;
  const r = uiEls.get(k);
  watchScreen();
  if (!r || r.scr !== screenKey()) return;
  to18fDown = {
   k: k,
   t: performance.now()
  };
  try {
   audioInit();
   SFX.tap();
  } catch (_) {}
  r.fn();
  watchScreen();
 }, true);
 ui.addEventListener('click', e => {
  const d = to18fDown, el = e.target && e.target.closest ? e.target.closest('.hb') : null;
  if (!d || !el || el.dataset.k !== d.k || performance.now() - d.t > 1500) return;
  to18fDown = null;
  e.preventDefault();
  e.stopPropagation();
 }, true);
 function to18fWhy() {
  const G = game;
  if (!G || G.over || G.tutorial || G.toHold18) return null;
  if (!(G.tos[0] > 0)) return 'NO TIMEOUTS LEFT';
  if (G.toReq18) return 'TIMEOUT ASKED - WAITING...';
  if (screen === 'defense') return G.dclear || G.ball.state === 'clear' || G.ball.state === 'pass' && G.ball.clear ? 'NO TIMEOUT UNTIL THE CLEAR IS CAUGHT' : 'NO TIMEOUT ON DEFENSE';
  if (screen === 'netview') {
   const s = N.view && N.view.last;
   return s && s.scr === 'live' && !s.rdy && !(G.ball && G.ball.state === 'held' && G.carrier && G.carrier.team === 'D') ? 'TIMEOUT: ONLY WITH THE BALL OR A DEAD BALL' : 'NO TIMEOUT ON DEFENSE';
  }
  return 'TIMEOUT: ONLY WITH THE BALL OR A DEAD BALL';
 }
 wrap('callTimeout', (o, ...a) => {
  const G = game;
  if (!on2318f() || !G || G.tutorial) return o(...a);
  const can = !!canTimeout(), r = o(...a);
  if (!r && !can) {
   const w = to18fWhy();
   if (w) addFx('cue', 0, 0, {
    s: w,
    col: '#ffb14d',
    life: 1.6
   });
  }
  if (r && N.inGame && !N.auth && screen === 'netview') to18fWatch();
  return r;
 });
 function to18fWatch() {
  const t0 = performance.now(), tick = () => {
   const G = game;
   if (!G || !N.inGame || !on2318f() || screen === 'timeout' || G.toHold18) return;
   if (!G.toReq18) return addFx('cue', 0, 0, {
    s: 'TOO LATE - PLAY STARTED',
    col: '#ffb14d',
    life: 1.6
   });
   if (performance.now() - t0 > 4200) {
    G.toReq18 = 0;
    return addFx('cue', 0, 0, {
     s: 'NO ANSWER - TRY AGAIN',
     col: '#ffb14d',
     life: 1.6
    });
   }
   setTimeout(tick, 100);
  };
  setTimeout(tick, 100);
 }
 wrap('drawSettings', (o, inGame) => {
  const r = o(inGame);
  if (inGame) return r;
  const u = uname();
  const lay332 = window.V17 && !window.__rl_v124gb && !window.__rl_no332set;
  text('USERNAME', 8, lay332 ? 137 : H - 40, 1, '#ffe14d');
  button(u ? dn(u) : 'TAP TO SET', 8, lay332 ? 147 : H - 31, Math.min(150, W / 2 - 62), lay332 ? 31 : 18, () => {
   askUname(false);
  }, {
   bg: u ? '#8fe3f0' : '#3a4a55',
   fg: u ? '#0b1a20' : '#cfe'
  });
  return r;
 });
 GAME_SCREENS.push('netview');
 wrap('step', (o, dt) => {
  lobbyTick(dt);
  if (!N.inGame || !game) return o(dt);
  const G = game, L = N.link;
  if (paused) {
   paused = false;
   N.quitAsk = true;
  }
  if (L && !L.connected && screen !== 'final') {
   if (!N.dc) {
    N.dc = {
     t0: performance.now()
    };
    if (N.auth) N.dcAuth = true;
   }
   if ((performance.now() - N.dc.t0) / 1e3 > 60) {
    endOnlineGame('OPPONENT DISCONNECTED - NO RESULT');
    game = null;
    screen = 'online';
    N.leave();
    banner('OPPONENT DISCONNECTED - GAME OVER, NO RESULT');
   }
   return;
  }
  if (N.dc) {
   N.dc = null;
   flash('RECONNECTED', 2);
  }
  if (G.toHold18) {
   if (screen === 'banner') G.bannerT = 0; else if (!(G.to19 && G.to19.hold && on2319d() && (screen === 'timeout' || screen === 'lineup' || screen === 'playbook' || screen === 'playmaker'))) G.toHold18 = null;
  }
  if (G.toStart18) {
   if (N.auth) {
    G.toStart18 = 0;
    applyStarter();
   } else if (performance.now() - G.toStart18 > 6e3) {
    G.toStart18 = 0;
    G.toStart = null;
   }
  }
  if (N.skipReq && N.auth) {
   if (screen !== 'scene' || performance.now() - N.skipReq > 4e3) N.skipReq = 0; else {
    N.applying = true;
    try {
     ORIG.sceneSkip();
    } finally {
     N.applying = false;
    }
   }
  }
  try {
   sets26Tick(G);
  } catch (e) {}
  if (screen === 'netview') {
   viewTick(dt);
   return;
  }
  if (screen === 'faceoff' && G.fo && N.fo) foNetTick(dt);
  if (screen === 'faceoff' && G.fo && G.fo.phase === 'wait') {
   G.fo.waitT = (G.fo.waitT || 0) + dt;
   if (N.side === 'h' && N.fo && N.fo.mine && !N.fo.theirs && G.fo.waitT > FO_NET.pressWait + .4 + 2 * (L ? L.oneWay() : 1e3) / 1e3) {
    N.fo.theirs = {
     react: 2.4,
     slow: true,
     rate: 0,
     fo: 0
    };
    foDecide();
   }
  }
  if (screen === 'pregame' && N.side === 'h' && G.preT > 2.2) G.preT = 99;
  if (screen === 'pregame' && N.side !== 'h') G.preT = Math.min(G.preT, 50);
  if (screen === 'pregame' && N.side !== 'h' && G.coin && G.coin.phase === 'done' && typeof haka2318 === 'function' && haka2318(G) && walkOn2314(G)) walkTick2314(G, dt);
  if (screen === 'qbreak' && N.side !== 'h') G.qT = Math.min(G.qT, 2.5);
  const r = o(dt);
  if (screen === 'faceoff' && game === G && N.fo) {
   foNetPose();
   if (G.fo && G.fo.phase === 'go' && !N.fo.whistleAt) N.fo.whistleAt = nowMs();
  }
  if (N.auth && game === G && N.inGame) {
   if (window.SHOT26 && SHOT26.on() && L) {
    const f = SHOT26.slow();
    if (f !== N.slo26Sent) {
     N.slo26Sent = f;
     try {
      L.send({
       t: 'slo',
       f: f
      });
     } catch (e) {}
    }
   }
   N.snapT = (N.snapT || 0) - dt;
   if (N.snapT <= 0) {
    N.snapT = L && L.fastOk() ? .05 : .1;
    try {
     L.latest(makeSnap());
     N.stats.sent++;
    } catch (e) {
     console.error(e);
    }
   }
  }
  return r;
 });
 wrap('render', o => {
  if (ONLINE_SCREENS.includes(screen)) {
   if (screen === 'online') drawOnline(); else if (screen === 'onJoin') drawJoin(); else if (screen === 'onLobby') {
    drawLobby();
    drawVer();
   } else if (screen === 'onTeam') drawOnTeam(); else if (screen === 'onSeason') N.drawSeasonHome(); else if (screen === 'onSeasonTeam') N.drawSeasonTeam();
   drawBan();
   return;
  }
  const G = game;
  if (N.inGame && G && screen === 'netview' && G.scene) {
   const keep = G.players;
   G.players = [];
   try {
    o();
   } finally {
    G.players = keep;
   }
  } else o();
  if (!N.inGame || !game) {
   drawBan();
   return;
  }
  if (screen === 'netview') drawViewer();
  if (screen === 'faceoff' && G.fo && G.fo.phase === 'wait') {
   rect(W / 2 - 60, 40, 120, 14, 'rgba(0,0,0,.75)');
   text('WAITING ON THE OTHER FOGO...', W / 2, 44, 1, '#ffe14d', 'center');
  }
  if (N.dc) {
   rect(0, 0, W, H, 'rgba(0,0,0,.72)');
   const left = Math.max(0, 60 - Math.floor((performance.now() - N.dc.t0) / 1e3));
   text('OPPONENT DISCONNECTED', W / 2, 60, 2, '#ff9a8a', 'center', '#000');
   text('WAITING FOR HIM TO COME BACK - ' + left + 's', W / 2, 80, 1, '#fff', 'center');
   text('SAME CODE: ' + N.code, W / 2, 92, 1, '#ffe14d', 'center');
   button('LEAVE GAME', W / 2 - 50, 110, 100, 16, () => quitOnline(), {
    bg: '#ff8a7a'
   });
  } else if (N.quitAsk) {
   rect(0, 0, W, H, 'rgba(0,0,0,.72)');
   text('LEAVE THIS ONLINE GAME?', W / 2, 54, 2, '#fff', 'center', '#000');
   text('THE GAME KEEPS GOING FOR YOUR OPPONENT UNTIL YOU LEAVE', W / 2, 72, 1, '#cfe', 'center');
   button('KEEP PLAYING', W / 2 - 110, 90, 104, 18, () => {
    N.quitAsk = false;
   }, {
    sc: 1,
    bg: '#7dff7a'
   });
   button('LEAVE GAME', W / 2 + 6, 90, 104, 18, () => quitOnline(), {
    sc: 1,
    bg: '#ff8a7a'
   });
   button(muted ? 'SOUND: OFF' : 'SOUND: ON', W / 2 - 50, 116, 100, 14, () => {
    muted = !muted;
    LS.set('muted', muted);
   }, {
    bg: muted ? '#5a6670' : '#7dff7a'
   });
  }
  if (N.link && screen !== 'final') drawNet();
  if (N.inGame && screen !== 'final') {
   const on = oppName();
   if (on) text('VS ' + dn(on), W - 4, H - 31, 1, '#cfe', 'right');
  }
  if (N.link && N.link.weak && !N.dc && screen !== 'final') {
   const s = 'CONNECTION SLOW - HOLD ON...';
   const w = textW(s) + 10;
   rect(W / 2 - w / 2, 18, w, 10, 'rgba(0,0,0,.7)');
   text(s, W / 2, 20, 1, '#ffb44d', 'center');
  }
  drawBan();
 });
 const ROUTE_COL = {
  DIRECT: '#7dff7a',
  TURN: '#b6ff7a',
  WS: '#8fe3f0',
  RELAY: '#ffb44d'
 };
 function netLabel() {
  const L = N.link;
  if (!L) return '';
  const r = L.route(), p = L.pingMs();
  return r + ' ' + (p != null ? p + 'MS' : '...');
 }
 N.netLabel = netLabel;
 function drawNet() {
  const L = N.link, r = L.route();
  if (N.netHide) {
   rect(W - 7, H - 18, 3, 3, ROUTE_COL[r] || '#fff');
   hit('NETSHOW', W - 46, H - 23, 44, 13, () => {
    N.netHide = false;
   }, 'NET');
   return;
  }
  const s = netLabel(), w = textW(s) + 8, x = W - w - 2, y = H - 21;
  rect(x, y, w, 9, 'rgba(0,0,0,.6)');
  text(s, x + w / 2, y + 2, 1, ROUTE_COL[r] || '#fff', 'center');
  hit('NETHIDE', x, y - 2, w, 13, () => {
   N.netHide = true;
  }, 'NET');
 }
 function drawVer() {
  if (!N.verBad) return;
  rect(0, 0, W, H, 'rgba(0,0,0,.6)');
  rect(W / 2 - 150, 52, 300, 50, '#3a0d0d');
  rect(W / 2 - 150, 52, 300, 2, '#ff6a5a');
  text('UPDATE: CLOSE AND REOPEN THE APP', W / 2, 60, 2, '#ffe14d', 'center', '#000');
  text('BOTH PHONES HAVE TO BE ON THE SAME VERSION TO PLAY ONLINE', W / 2, 78, 1, '#ffffff', 'center');
  text('YOU: ' + GAMEV.toUpperCase() + '   OPPONENT: ' + (N.verBad === 'OLD' ? 'OLDER' : String(N.verBad).toUpperCase()), W / 2, 89, 1, '#ff9a8a', 'center');
 }
 function drawBan() {
  if (N.ban) {
   const w = Math.min(W - 8, textW(N.ban.s) + 14);
   rect(W / 2 - w / 2, 2, w, 13, 'rgba(10,20,26,.94)');
   rect(W / 2 - w / 2, 14, w, 1, '#ffe14d');
   text(N.ban.s, W / 2, 6, 1, '#ffe14d', 'center');
  }
 }
 function quitOnline() {
  if (N.link) N.link.send({
   t: 'leave'
  });
  endOnlineGame();
  game = null;
  const sb = N.seasonBack;
  setTimeout(() => {
   N.leave();
  }, 300);
  screen = sb ? 'onSeason' : 'menu';
 }
 function drawOnlineFinal() {
  const G = game, cx = W / 2;
  const L = N.lobby && N.lobby.state;
  text('ONLINE GAME VS ' + T(G.opp).name + (G.userHome ? ' (YOU WERE HOME)' : ' (YOU WERE AWAY)'), cx, 108, 1, '#8fe3f0', 'center');
  if (L && L.season) {
   button('BACK TO SEASON', cx - 60, 122, 120, 18, () => {
    endOnlineGame();
    N.leave();
   }, {
    sc: 1,
    bg: '#ffd23a'
   });
   return;
  }
  button('REMATCH', cx - 110, 122, 104, 18, () => {
   endOnlineGame();
   screen = 'onLobby';
   patchLobby(N.side === 'h' ? {
    start: null,
    hready: false
   } : {
    gready: false
   });
   if (N.lobby) N.lobby.state.start = null;
  }, {
   sc: 1
  });
  button('MENU', cx + 6, 122, 104, 18, () => {
   endOnlineGame();
   N.leave();
   screen = 'menu';
   game = null;
  }, {
   bg: '#c9d6d9'
  });
 }
 function myGuy() {
  const G = game;
  return G && G.players.find(p => p.team === 'O' && p.idx === N.ctlIdx && !p.far);
 }
 function drawViewer() {
  const G = game, V = N.view, c = G.carrier, me = myGuy();
  g.save();
  g.translate(-Math.round(camX), 0);
  if (typeof f30Cam === 'function') f30Cam(Math.round(camX));
  if (c && G.ball.state === 'held') for (let a = 0; a < 6.28; a += .25) px(c.x + Math.cos(a) * 7, c.y + Math.sin(a) * 3.5, 'rgba(255,90,74,.9)');
  if (me && !G.scene) {
   const pr2 = 8 + Math.sin(G.t * 12) * 1.5;
   for (let a = 0; a < 6.28; a += .2) px(me.x + Math.cos(a) * pr2, me.y + Math.sin(a) * pr2 * .5, '#2cf0ff');
   text('YOU', me.x, me.y + 4, 1, '#2cf0ff', 'center', '#000');
   if (c) {
    const dd = Math.hypot(c.x - me.x, c.y - me.y);
    if (dd <= DZ.checkR) for (let a = 0; a < 6.28; a += .5) px(c.x + Math.cos(a) * 9, c.y - 6 + Math.sin(a) * 5, '#ffe14d');
   }
   if (N.vact && !N.vact.sw) {
    const e = performance.now() / 1e3 - N.vact.t0;
    if (e > .08) {
     const f = clamp(e / DZ.hitHold, 0, 1);
     ringPx(me.x, me.y - 6, 11, f, f >= 1 ? '#ff4a3a' : '#ffe14d');
    }
   }
  }
  if (c && G.vUchk > 0) {
   rect(c.x - 10, c.y - 35, 20, 9, 'rgba(0,0,0,.7)');
   text(G.vUchk + '/3', c.x, c.y - 33, 1, '#ffe14d', 'center');
  }
  if (G.scene) {
   try {
    drawScene();
   } catch (e) {}
  }
  for (const f of fx) {
   if (f.type === 'txt' && f.bub) continue;
   if (f.type === 'txt') text(f.s, f.x, f.y - f.t * 10, 1, f.col, 'center', '#000');
   if (f.type === 'pop') for (let i = 0; i < 8; i++) {
    const a = i / 8 * 6.28;
    px(f.x + Math.cos(a) * f.t * 30, f.y + Math.sin(a) * f.t * 30, '#fff');
   }
  }
  g.restore();
  try {
   drawDefense();
  } catch (e) {}
  if (!G.scene && V && V.scr === 'live') {
   const sc = Math.ceil(Math.max(0, G.shotClock));
   rect(W / 2 - 22, 9, 44, 7, '#0b0f14');
   text('SHOT :' + String(sc).padStart(2, '0'), W / 2, 10, 1, sc <= 5 && Math.floor(G.t * 4) % 2 ? '#ff4040' : '#8fe3f0', 'center');
  }
  if (G.scene) {
   try {
    drawSceneUI();
   } catch (e) {}
  } else if (G.banner && V && V.scr === 'banner') {
   try {
    drawBanner();
   } catch (e) {}
  }
  if (V && V.penPick) {
   rect(W / 2 - 80, 120, 160, 12, 'rgba(0,0,0,.8)');
   text('FLAG - THEY ARE PICKING A SET', W / 2, 123, 1, '#ffe14d', 'center');
  }
  if (sets26On()) {
   try {
    drawGameButtons();
   } catch (e) {}
  }
  const x = Math.round(W / 2 + CHIRP_BTN.x), y = H - 11 - (typeof sa2403Dy === 'function' ? sa2403Dy(H - 11, 11) : 0), w = CHIRP_BTN.w;
  hit('CHIRP', x, y, w, 11, () => {
   N.chirping = true;
   try {
    if (chirpReady()) {
     const k = voice12('userChirp', benchX('u') + 34, H - 34);
     if (k) G.chirpBtnAt = vt();
    }
   } finally {
    N.chirping = false;
   }
  }, 'CHIRP');
  rect(x, y + 1, w, 10, '#000');
  rect(x, y, w, 10, chirpReady() ? '#ff7ad1' : 'rgba(40,50,60,.9)');
  text('CHIRP', x + w / 2, y + 3, 1, chirpReady() ? '#2a0b20' : '#7a8a95', 'center');
  if (N.vjoy) {
   const j = N.vjoy;
   circle(j.ox, j.oy, 22, 'rgba(255,255,255,.25)', .2);
   disc(j.ox + j.ux * j.m * 22, j.oy + j.uy * j.m * 22, 6, 'rgba(255,255,255,.35)');
  }
  if (!V || !V.last) {
   rect(W / 2 - 70, 80, 140, 14, 'rgba(0,0,0,.7)');
   text('CONNECTING TO THE PLAY...', W / 2, 84, 1, '#ffe14d', 'center');
  }
 }
 wrap('inDown', (o, id, e) => {
  if (!(N.inGame && screen === 'netview')) return o(id, e);
  if (N.quitAsk || N.dc) return;
  const p = toLogical(e), G = game, wx = p.x + camX;
  let sw = null, bd = 13;
  for (const q of G.players) if (q.team === 'O' && !q.far && q.idx !== N.ctlIdx) {
   const d = Math.hypot(q.x - wx, q.y - 8 - p.y);
   if (d < bd) {
    bd = d;
    sw = q;
   }
  }
  if (sw) {
   N.vact = {
    id: id,
    sw: sw.idx,
    t0: performance.now() / 1e3,
    x: p.x,
    y: p.y
   };
   return;
  }
  if (p.x < W / 2) {
   N.vjoy = {
    id: id,
    ox: p.x,
    oy: p.y,
    ux: 0,
    uy: 0,
    m: 0
   };
   return;
  }
  N.vact = {
   id: id,
   t0: performance.now() / 1e3,
   x: p.x,
   y: p.y
  };
 });
 wrap('inMove', (o, id, e) => {
  if (!(N.inGame && screen === 'netview')) return o(id, e);
  const p = toLogical(e), j = N.vjoy;
  if (j && j.id === id) {
   let vx = p.x - j.ox, vy = p.y - j.oy, d = Math.hypot(vx, vy);
   const max = 22;
   if (d > max) {
    j.ox = p.x - vx / d * max;
    j.oy = p.y - vy / d * max;
    vx = p.x - j.ox;
    vy = p.y - j.oy;
    d = max;
   }
   if (d < 3) {
    j.m = 0;
    return;
   }
   j.ux = vx / d;
   j.uy = vy / d;
   j.m = .3 + .7 * clamp((d - 3) / (max - 3), 0, 1);
  } else if (N.vact && N.vact.id === id && N.vact.sw != null && Math.hypot(p.x - N.vact.x, p.y - N.vact.y) > 14) {
   N.vact = null;
   N.vjoy = {
    id: id,
    ox: p.x,
    oy: p.y,
    ux: 0,
    uy: 0,
    m: 0
   };
  }
 });
 wrap('inUp', (o, id, e, cancel) => {
  if (!(N.inGame && screen === 'netview')) return o(id, e, cancel);
  if (N.vjoy && N.vjoy.id === id) {
   N.vjoy = null;
   return;
  }
  const a = N.vact;
  if (!a || a.id !== id) return;
  N.vact = null;
  if (cancel) return;
  if (a.sw != null) {
   N.ctlIdx = a.sw;
   N.swn = (N.swn || 0) + 1;
   N.swLocal = {
    i: a.sw,
    n: N.swn,
    at: performance.now()
   };
   N.pred = null;
   N.inT = 0;
   N.link.send({
    t: 'sw',
    i: a.sw,
    swn: N.swn
   });
   addFx('tap', a.x + camX, a.y, {
    life: .35
   });
   N.lastIn = 'sw';
   return;
  }
  const dur = performance.now() / 1e3 - a.t0, me = myGuy(), c = game.carrier;
  const vd = me && c && game.ball && game.ball.state === 'held' ? +Math.hypot(c.x - me.x, c.y - me.y).toFixed(1) : null;
  if (dur >= DZ.hitHold) {
   N.link.send({
    t: 'hit',
    vd: vd
   });
   N.lastIn = 'hit';
  } else {
   N.link.send({
    t: 'chk',
    vd: vd
   });
   N.lastIn = 'chk';
  }
 });
 wrap('onTap', (o, x, y) => {
  if (N.inGame && (screen === 'pregame' || screen === 'qbreak') && N.side !== 'h') return;
  return o(x, y);
 });
 const SN = N.season = {
  code: null,
  side: null,
  ver: 0,
  S: null,
  lobby: null,
  pollT: 0,
  busy: false,
  lastNoteT: Date.now()
 };
 N.mySeasons = () => {
  try {
   return JSON.parse(localStorage.getItem('rl_onSeasons') || '[]');
  } catch (e) {
   return [];
  }
 };
 function rememberSeason(code, side) {
  const a = N.mySeasons().filter(x => x.code !== code);
  a.unshift({
   code: code,
   side: side,
   t: Date.now()
  });
  try {
   localStorage.setItem('rl_onSeasons', JSON.stringify(a.slice(0, 3)));
  } catch (e) {}
 }
 function forgetSeason(code) {
  try {
   localStorage.setItem('rl_onSeasons', JSON.stringify(N.mySeasons().filter(x => x.code !== code)));
  } catch (e) {}
 }
 let offSeason = undefined;
 function useOnline(S) {
  if (offSeason === undefined) offSeason = season && !season.online ? season : offSeason || null;
  if (!S) return null;
  const me = myTeamIn(S);
  const L = JSON.parse(JSON.stringify(S));
  L.team = me;
  L.online = true;
  L.code = SN.code;
  if (L.wk && me && L.wk[me] != null) L.week = L.wk[me];
  season = L;
  return L;
 }
 function leaveOnlineSeason() {
  if (season && season.online) season = offSeason === undefined ? LS.get('season', null) : offSeason;
  offSeason = undefined;
 }
 N.leaveOnlineSeason = leaveOnlineSeason;
 function myTeamIn(S) {
  return SN.lobby ? SN.lobby.me : null;
 }
 function humanTeams() {
  return SN.lobby ? SN.lobby.members.filter(m => m.team).map(m => m.team) : [];
 }
 function humanName(team) {
  return T(team).name;
 }
 N.seasonLocalFor = function(st) {
  if (SN.S) useOnline(SN.S);
 };
 async function askPush() {
  try {
   if (!('Notification' in window)) return 'none';
   let perm = Notification.permission;
   if (perm === 'default') perm = await Notification.requestPermission();
   N.pushPerm = perm;
   if (perm !== 'granted' || !('serviceWorker' in navigator) || !('PushManager' in window)) return perm;
   const reg = await navigator.serviceWorker.ready;
   try {
    const c = await caches.open('rl-dev');
    await c.put('/__dev', new Response(devId));
   } catch (e) {}
   let sub = await reg.pushManager.getSubscription();
   if (!sub) {
    const k = await call('/push/key');
    if (!k || !k.key) return 'nokey';
    const raw = Uint8Array.from(atob(k.key.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((k.key.length + 3) % 4)), c => c.charCodeAt(0));
    sub = await reg.pushManager.subscribe({
     userVisibleOnly: true,
     applicationServerKey: raw
    });
   }
   await call('/push/sub', {
    sub: sub.toJSON ? sub.toJSON() : sub,
    tz: (new Date).getTimezoneOffset()
   });
   N.pushOn = true;
   return 'subscribed';
  } catch (e) {
   N.pushErr = String(e);
   return 'error';
  }
 }
 N.askPush = askPush;
 N.seasonCreate = function() {
  const pp = askPush();
  SN.code = null;
  N.err = null;
  screen = 'onSeasonTeam';
  SN.mode = 'create';
  return pp;
 };
 N.seasonJoin = async function(code) {
  askPush();
  N.err = null;
  flash(on2312() ? 'JOINING THE SEASON...' : 'JOINING SEASON ' + code + '...', 9);
  let r = null;
  for (let i = 0; i < 3; i++) {
   r = await call('/season/join', {
    code: code
   });
   if (!(r && r.error === 'BUSY - TRY AGAIN')) break;
  }
  N.msg = null;
  if (!r || !r.ok) {
   N.err = r && r.error || 'NO CONNECTION';
   return false;
  }
  SN.code = r.code;
  SN.side = r.host ? 'h' : 'g';
  rememberSeason(r.code, SN.side);
  await seasonFetch();
  if (!myTeamIn(SN.S)) {
   SN.mode = 'join';
   screen = 'onSeasonTeam';
  } else screen = 'onSeason';
  return true;
 };
 N.seasonOpen = async function(code) {
  const m = N.mySeasons().find(x => x.code === code);
  SN.code = code;
  SN.side = m ? m.side : 'h';
  await seasonFetch();
  if (SN.err404) {
   forgetSeason(code);
   N.err = 'THAT SEASON IS GONE';
   screen = 'online';
   return;
  }
  screen = SN.S && SN.S.phase === 'draft' ? 'draft' : 'onSeason';
  if (screen === 'draft') panelDirty();
 };
 async function seasonFetch() {
  if (!SN.code) return null;
  if (SN.busy) return SN.S;
  SN.busy = true;
  try {
   const r = await call('/season/' + SN.code);
   if (r && r.ok) {
    SN.err404 = false;
    const was = SN.S, verWas = SN.ver;
    SN.lobby = r;
    SN.side = r.host ? 'h' : 'g';
    SN.ver = r.ver;
    SN.S = r.season;
    if (r.note && r.note.t > SN.lastNoteT) {
     SN.lastNoteT = r.note.t;
     banner(r.note.body || r.note.title);
    }
    if (SN.S && (r.ver !== verWas || !season || !season.online)) {
     const keepSel = PS.draftSel;
     if (screen === 'draft' || screen === 'onSeason' || screen === 'onSeasonTeam' || screen === 'seasonStats' || screen === 'roster' || screen === 'lineup' || season && season.online) useOnline(SN.S);
     if (screen === 'draft') {
      PS.draftSel = keepSel;
      panelDirty();
      if (SN.S.phase !== 'draft') screen = 'onSeason';
     }
     if (screen === 'onSeasonTeam' && SN.S.phase === 'draft') {
      screen = 'draft';
      PS.draftPos = 'ALL';
      PS.draftSel = null;
      panelDirty();
     }
     if (was && was.draft && SN.S.draft && SN.S.draft.n !== was.draft.n) {
      const me = myTeamIn(SN.S);
      if (draftTurn(SN.S.draft) === me && draftTurn(was.draft) !== me) banner('YOUR TURN TO DRAFT');
     }
    }
   } else if (r && r.error && /NO SEASON/.test(r.error)) SN.err404 = true;
  } catch (e) {}
  SN.busy = false;
  return SN.S;
 }
 N.seasonFetch = seasonFetch;
 async function seasonPut(mutate, notify) {
  for (let i = 0; i < 6; i++) {
   if (i > 0 || !SN.S) {
    SN.busy = false;
    await seasonFetch();
   }
   const S = JSON.parse(JSON.stringify(SN.S || {}));
   const ok = mutate(S);
   if (ok === false) return false;
   const r = await call('/season/' + SN.code + '/put', {
    ver: SN.ver,
    state: S,
    notify: notify
   });
   if (r && r.ok) {
    SN.ver = r.ver;
    SN.S = S;
    useOnline(S);
    return true;
   }
   if (r && r.conflict) {
    SN.ver = r.ver;
    SN.S = r.state;
    continue;
   }
   N.err = r && r.error || 'NO CONNECTION';
   return false;
  }
  return false;
 }
 N.seasonPut = seasonPut;
 function inPlay(S) {
  return S.humans || [];
 }
 function draftRunCpuOnline(D, humans) {
  const total = D.order.length * D.rounds;
  while (D.n < total && !humans.includes(draftTurn(D))) draftPick(D, draftTurn(D), cpuChoice(D, draftTurn(D)));
 }
 function buildSeason(humans) {
  const H = humans.slice();
  let best = null;
  for (let tries = 0; tries < 300; tries++) {
   const others = TEAMS.map(t => t.id).filter(id => !H.includes(id));
   const ids = [ ...H, ...others ].sort(() => Math.random() - .5);
   if (ids.length % 2) ids.push('BYE');
   const n = ids.length, rounds = [], arr = ids.slice();
   for (let r = 0; r < n - 1; r++) {
    const games = [];
    for (let i = 0; i < n / 2; i++) games.push(r % 2 ? [ arr[n - 1 - i], arr[i] ] : [ arr[i], arr[n - 1 - i] ]);
    rounds.push(games);
    arr.splice(1, 0, arr.pop());
   }
   rounds.length = Math.min(rounds.length, SEASON_GAMES);
   const meets = {};
   H.forEach(h => meets[h] = []);
   rounds.forEach((gs, w) => gs.forEach(([a, b]) => {
    if (H.includes(a) && H.includes(b)) {
     meets[a].push(w);
     meets[b].push(w);
    }
   }));
   const ok = H.every(h => meets[h].length && Math.min(...meets[h]) <= rounds.length - 2), score = H.reduce((s, h) => s + Math.min(2, meets[h].length), 0);
   const cand = {
    ids: ids,
    rounds: rounds,
    meets: meets
   };
   if (ok && (!best || score > best.score)) {
    best = Object.assign(cand, {
     score: score
    });
    if (score >= H.length * 2 || tries > 120) break;
   }
  }
  if (!best) return null;
  const {ids: ids, rounds: rounds} = best;
  const table = {};
  ids.filter(i => i !== 'BYE').forEach(i => table[i] = {
   w: 0,
   l: 0,
   gf: 0,
   ga: 0
  });
  const wk = {};
  H.forEach(h => wk[h] = 0);
  const first = rounds.findIndex(gs => gs.some(([a, b]) => H.includes(a) && H.includes(b)));
  const S = {
   v7: true,
   v8: true,
   online: true,
   humans: H,
   league: 'ALL',
   teams: ids.filter(i => i !== 'BYE'),
   week: 0,
   wk: wk,
   simmed: 0,
   rounds: rounds,
   table: table,
   results: [],
   played: {},
   pend: [],
   phase: 'draft',
   playoff: null,
   champ: null,
   year: (new Date).getFullYear(),
   rosters: null,
   lineups: {},
   h2hWeek: first
  };
  S.draft = makeDraft(S);
  S.draft.user = null;
  draftRunCpuOnline(S.draft, S.humans);
  return S;
 }
 N.buildSeason = buildSeason;
 N.drawSeasonTeam = function() {
  const taken = SN.lobby ? SN.lobby.members.filter(m => m.team && !m.me).map(m => m.team) : [];
  teamGrid(window.T232 && T232.isWg() ? 'PICK YOUR COUNTRY' : window.T232 && T232.isCol && T232.isCol() ? 'PICK YOUR SCHOOL' : 'PICK YOUR SEASON TEAM', SN.mode === 'create' ? on2312() ? 'ONLINE SEASON - UP TO 8 PLAYERS, INVITE YOUR FRIENDS' : 'ONLINE SEASON - UP TO 8 PLAYERS, YOU GET A CODE TO SHARE' : 'ONLINE SEASON ' + (on2312() ? '' : SN.code || '') + (taken.length ? ' - TAKEN TEAMS ARE NOT SHOWN' : ''), async id => {
   if (SN.mode === 'create' && !SN.code) {
    flash(on2312() ? 'MAKING YOUR SEASON...' : 'MAKING A SEASON CODE...', 9);
    const r = await call('/room/open', Object.assign({
     kind: 'season',
     team: id
    }, window.T232 ? T232.createExtra() : {}));
    N.msg = null;
    if (!r || !r.ok) {
     N.err = r && r.error || 'NO CONNECTION';
     return;
    }
    SN.code = r.code;
    SN.side = 'h';
    rememberSeason(r.code, 'h');
    await seasonFetch();
    screen = 'onSeason';
    return;
   }
   let r = null;
   for (let i = 0; i < 3; i++) {
    r = await call('/season/' + SN.code + '/team', Object.assign({
     team: id,
     leg: window.V20 ? V20.ownedLeg() : []
    }, cpTeam2319()));
    if (!(r && r.error === 'BUSY - TRY AGAIN')) break;
   }
   if (!r || !r.ok) {
    N.err = r && r.error === 'TAKEN' ? 'SOMEONE ALREADY HAS THAT TEAM' : r && r.error || 'NO CONNECTION';
    await seasonFetch();
    return;
   }
   SN.lobby = Object.assign(SN.lobby || {}, r);
   await seasonFetch();
   screen = 'onSeason';
  }, window.T232 && T232.pickOpts(taken) || {
   only: TEAMS.map(t => t.id).filter(id => !taken.includes(id)),
   back: () => {
    screen = SN.lobby && SN.lobby.me ? 'onSeason' : 'online';
   }
  });
  drawErr();
 };
 async function startDraft() {
  const hs = humanTeams();
  if (hs.length < 2) {
   N.err = 'NEED AT LEAST 2 PLAYERS WITH TEAMS';
   return;
  }
  let t232b = null;
  if (window.T232 && T232.on()) {
   const t = T232.startCheck(hs);
   if (t === false) return;
   if (t && t.S) return T232.startPut(t.S);
   if (t && t.build) t232b = t.build;
  }
  const leg20 = new Set(window.V20 ? V20.ownedLeg() : []);
  for (const m of SN.lobby && SN.lobby.members || []) for (const id of m.leg || []) if (PP(id) && PP(id).leg) leg20.add(id);
  window.__leg20Pool = [ ...leg20 ];
  if (window.CP2319 && CP2319.on()) {
   const ms = SN.lobby && SN.lobby.members || [], yes = CP2319.seasonAll(ms), gho = new Set(CP2319.ghostCards());
   for (const m of ms) for (const id of m.gho || []) if (PP(id) && PP(id).gho16) gho.add(id);
   window.__cp2319Pool = yes ? [ ...gho ] : false;
  }
  let S;
  try {
   S = t232b ? t232b(hs) : buildSeason(hs);
  } finally {
   window.__leg20Pool = null;
   window.__cp2319Pool = null;
  }
  if (!S) {
   N.err = 'COULD NOT MAKE A SCHEDULE';
   return;
  }
  const first = draftTurn(S.draft);
  const r = await call('/season/' + SN.code + '/put', {
   ver: SN.ver,
   state: S,
   notify: {
    title: 'BAGGA LAX',
    body: 'THE DRAFT IS ON - ' + T(first).name + ' PICKS FIRST'
   }
  });
  if (r && r.ok) {
   SN.ver = r.ver;
   SN.S = S;
   useOnline(S);
   PS.draftPos = 'ALL';
   PS.draftSel = null;
   screen = 'draft';
   panelDirty();
   if (first !== SN.lobby.me) call('/season/' + SN.code + '/ping', {
    teams: [ first ],
    title: 'BAGGA LAX',
    body: 'YOUR TURN TO DRAFT'
   });
  } else {
   N.err = r && r.error || null;
   await seasonFetch();
  }
 }
 N.startDraft = startDraft;
 function cpTeam2319() {
  if (!window.CP2319 || !CP2319.on()) return {};
  const me = SN.lobby && (SN.lobby.members || []).find(m => m.me);
  return {
   c19: me && typeof me.c19 === 'boolean' ? me.c19 : CP2319.draft(),
   gho: CP2319.ghostCards()
  };
 }
 async function cpPick2319(v) {
  const L0 = SN.lobby;
  if (!L0 || !L0.me || SN.S || SN.cpBusy) return;
  SN.cpBusy = true;
  try {
   const r = await call('/season/' + SN.code + '/team', {
    team: L0.me,
    leg: window.V20 ? V20.ownedLeg() : [],
    c19: v,
    gho: CP2319.ghostCards()
   });
   if (r && r.ok) SN.lobby = Object.assign(SN.lobby || {}, r); else N.err = r && r.error || 'NO CONNECTION';
  } finally {
   SN.cpBusy = false;
  }
  await seasonFetch();
 }
 function cpSeason2319(L0, me, y) {
  const x = W / 2 + 10, x1 = W / 2 + 146, yn = v => v === true ? 'YES' : v === false ? 'NO' : '-', col = v => v === true ? '#7dff7a' : v === false ? '#ff9a4a' : '#7f9aa6';
  text('CARDS', x1, 27, 1, '#8fe3f0', 'right');
  L0.members.forEach((m, i) => {
   const yy = 36 + 9 * i, s = m.team ? yn(m.c19) : '', w = textW(s, 1);
   if (!s) return;
   rect(x1 - w - 2, yy - 1, w + 3, 8, '#0b0f14');
   text(s, x1, yy, 1, col(m.c19), 'right');
  });
  const mm = L0.members.find(m => m.me), my = mm && mm.c19, ms = L0.members.filter(m => m.team), on = CP2319.seasonAll(L0.members);
  if (me && mm && typeof mm.c19 !== 'boolean' && SN.cpSent !== SN.code) {
   SN.cpSent = SN.code;
   cpPick2319(CP2319.draft());
  }
  y = Math.max(y + 2, 92);
  text('CARD PLAYERS IN THE DRAFT?', x, y, 1, '#ffe14d');
  y += 8;
  if (me) {
   button('YES', x, y, 40, 11, () => {
    if (my !== true) cpPick2319(true);
   }, {
    bg: my === true ? '#7dff7a' : '#3a4a55',
    fg: my === true ? '#0b1a20' : '#cfe'
   });
   button('NO', x + 43, y, 40, 11, () => {
    if (my !== false) cpPick2319(false);
   }, {
    bg: my === false ? '#ffb14d' : '#3a4a55',
    fg: my === false ? '#0b1a20' : '#cfe'
   });
   y += 14;
  }
  const s = !ms.length ? 'EVERYONE HAS TO SAY YES' : on ? 'ALL YES = LEGACY + GHOSTS ON' : ms.some(m => m.c19 === false) ? 'SOMEONE SAID NO = OFF FOR ALL' : 'WAITING - EVERYONE HAS TO SAY YES';
  text(s, x, y, 1, on ? '#7dff7a' : ms.some(m => m.c19 === false) ? '#ff9a4a' : '#cfe');
 }
 const PA0 = Object.assign({}, PANEL_ACT);
 async function onlinePick(id) {
  const me = season.team;
  const ok = await seasonPut(S => {
   const D = S.draft;
   if (!D || draftTurn(D) !== me) return false;
   const pid = id || cpuChoice(D, me);
   if (!pid || !D.pool.includes(pid) || draftNeeds(D, me)[PP(pid).pos] <= 0) return false;
   draftPick(D, me, pid);
   draftRunCpuOnline(D, S.humans);
   return true;
  }, null);
  PS.draftSel = null;
  if (!ok) {
   flash('NOT YOUR PICK YET');
   await seasonFetch();
  } else {
   const D = SN.S.draft, nxt = D && draftTurn(D);
   if (nxt && nxt !== me && SN.S.humans.includes(nxt)) call('/season/' + SN.code + '/ping', {
    teams: [ nxt ],
    title: 'BAGGA LAX',
    body: 'YOUR TURN TO DRAFT'
   });
  }
  panelDirty();
 }
 PANEL_ACT.draft = function() {
  if (season && season.online) {
   if (draftTurn(season.draft) !== season.team) {
    flash('WAIT FOR YOUR PICK');
    return;
   }
   if (!PS.draftSel) return;
   onlinePick(PS.draftSel);
   return;
  }
  return PA0.draft();
 };
 PANEL_ACT.dauto = function() {
  if (season && season.online) {
   if (draftTurn(season.draft) !== season.team) {
    flash('WAIT FOR YOUR PICK');
    return;
   }
   onlinePick(null);
   return;
  }
  return PA0.dauto();
 };
 PANEL_ACT.dsim = function() {
  if (season && season.online) {
   flash('ONLINE DRAFT: ONE PICK AT A TIME');
   return;
  }
  return PA0.dsim();
 };
 PANEL_ACT.startSeason = function() {
  if (season && season.online) {
   finishDraftOnline();
   return;
  }
  return PA0.startSeason();
 };
 PANEL_ACT.menu = function() {
  if (season && season.online) {
   leaveOnlineSeason();
   screen = 'online';
   return;
  }
  return PA0.menu();
 };
 PANEL_ACT.stBack = function() {
  if (season && season.online) {
   screen = 'onSeason';
   return;
  }
  return PA0.stBack();
 };
 async function finishDraftOnline() {
  await seasonPut(S => {
   if (!S.draft) return true;
   const D = S.draft;
   draftRunCpuOnline(D, []);
   S.rosters = D.rosters;
   S.lineups = S.lineups || {};
   for (const t of S.teams) if (!S.lineups[t]) S.lineups[t] = autoLineup(S.rosters[t]);
   S.draftLog = D.picks.slice(0, 40);
   delete S.draft;
   S.phase = 'reg';
   return true;
  });
  screen = 'onSeason';
 }
 const RD0 = PANEL_RENDER.draft;
 PANEL_RENDER.draft = function() {
  const h = RD0();
  if (!(season && season.online && season.draft)) return h;
  const D = season.draft, turn = draftTurn(D), me = season.team, total = D.order.length * D.rounds;
  const msg = D.n >= total ? 'DRAFT DONE' : turn === me ? 'YOUR PICK - ONLINE DRAFT' + (on2312() ? '' : ' ' + SN.code) : 'WAITING ON ' + T(turn).name + (inPlay(season).includes(turn) ? ' (HUMAN)' : ' (CPU)') + ' - ONLINE DRAFT' + (on2312() ? '' : ' ' + SN.code);
  return '<div class="note" style="background:' + (turn === me ? '#7dff7a' : '#ffb14d') + ';color:#0b1a20;padding:2px 6px;font-weight:bold" id="onDraftBar">' + msg + '</div>' + h;
 };
 const LSset0 = LS.set.bind(LS);
 LS.set = function(k, v) {
  if (k === 'season' && v && v.online) {
   const me = v.team;
   if (me && v.lineups && v.lineups[me]) {
    const lu = v.lineups[me];
    seasonPut(S => {
     S.lineups = S.lineups || {};
     S.lineups[me] = lu;
     return true;
    });
   }
   return;
  }
  return LSset0(k, v);
 };
 function gkey(w, a, b) {
  return w + ':' + a + '-' + b;
 }
 function nextFor(S, me) {
  if (!S || S.phase === 'draft') return null;
  if (S.w && window.T232) return T232.next(S, me);
  if (S.phase === 'reg') {
   let w = S.wk[me];
   if (w == null) w = 0;
   while (w < S.rounds.length) {
    const gm = S.rounds[w].find(x => x.includes(me));
    if (!gm) {
     w++;
     continue;
    }
    const k = gkey(w, gm[0], gm[1]);
    if (S.played[k] || S.pend.includes(k)) {
     w++;
     continue;
    }
    const opp = gm[0] === me ? gm[1] : gm[0];
    return {
     w: w,
     gm: gm,
     k: k,
     opp: opp,
     home: inPlay(S).includes(opp) ? gm[0] === me : w % 2 === 0,
     h2h: inPlay(S).includes(opp),
     label: 'WEEK ' + (w + 1) + ' OF ' + S.rounds.length
    };
   }
   return null;
  }
  if (S.phase === 'playoff' && S.playoff) {
   const P = S.playoff, gm = (P.games || []).find(x => x.includes(me));
   if (!gm) return null;
   const k = 'PO:' + P.round + ':' + gm[0] + '-' + gm[1];
   if ((S.poPlayed || {})[k]) return null;
   const opp = gm[0] === me ? gm[1] : gm[0], seed = id => P.seeds.indexOf(id);
   return {
    po: true,
    gm: gm,
    k: k,
    opp: opp,
    home: seed(me) < seed(opp),
    h2h: inPlay(S).includes(opp),
    label: {
     qf: 'PLAYOFF QUARTERFINAL',
     semi: 'PLAYOFF SEMIFINAL',
     final: 'CHAMPIONSHIP'
    }[P.round]
   };
  }
  return null;
 }
 N.nextFor = nextFor;
 function settleSeason(S) {
  if (S.w && window.T232) return T232.settle(S);
  if (S.phase === 'reg') {
   const hs = inPlay(S);
   for (const h of hs) {
    let w = S.wk[h] == null ? 0 : S.wk[h];
    while (w < S.rounds.length) {
     const gm = S.rounds[w].find(x => x.includes(h));
     if (gm && !S.played[gkey(w, gm[0], gm[1])] && !S.pend.includes(gkey(w, gm[0], gm[1]))) break;
     w++;
    }
    if (S.wk[h] == null || w > S.wk[h]) S.wk[h] = w;
   }
   const low = Math.min(...hs.map(h => S.wk[h] == null ? 0 : S.wk[h]));
   while (S.simmed < low && S.simmed < S.rounds.length) {
    const w = S.simmed;
    for (const [a, b] of S.rounds[w]) {
     if (a === 'BYE' || b === 'BYE' || hs.includes(a) || hs.includes(b)) continue;
     const [sa, sb] = simScore(a, b);
     applyResult(S, a, b, sa, sb);
     S.results.push([ a, b, sa, sb, 'WK ' + (w + 1) ]);
     try {
      injSimGame(S, a);
      injSimGame(S, b);
      concSim14(S, a);
      concSim14(S, b);
     } catch (e) {}
    }
    S.simmed++;
   }
   const humanGamesLeft = S.rounds.some((gs, w) => gs.some(x => !x.includes('BYE') && (hs.includes(x[0]) || hs.includes(x[1])) && !S.played[gkey(w, x[0], x[1])]));
   if (S.simmed >= S.rounds.length && !humanGamesLeft && !S.pend.length) {
    const top = standings(S).slice(0, PLAYOFF_N).map(x => x.id), s = i => top[i];
    S.phase = 'playoff';
    S.week = S.rounds.length;
    S.poPlayed = {};
    S.playoff = {
     seeds: top,
     round: 'qf',
     games: [ [ s(0), s(7) ], [ s(3), s(4) ], [ s(1), s(6) ], [ s(2), s(5) ] ],
     results: []
    };
   }
  }
  if (S.phase === 'playoff' && S.playoff) {
   for (let guard = 0; guard < 5 && S.playoff.round !== 'done'; guard++) {
    const P = S.playoff, hs = inPlay(S);
    const hg = P.games.filter(x => hs.includes(x[0]) || hs.includes(x[1]));
    const decided = [];
    let open = false;
    for (const gm of hg) {
     const k = 'PO:' + P.round + ':' + gm[0] + '-' + gm[1], r = (S.poPlayed || {})[k];
     if (r) decided.push({
      g: gm,
      w: r.w
     }); else open = true;
    }
    if (open) break;
    playoffAdvance(S, decided);
   }
  }
 }
 N.settleSeason = settleSeason;
 let pendingGame = null;
 function recordOnline(win, sc) {
  const G = game, me = season && season.team, nx = pendingGame;
  pendingGame = null;
  if (!nx || !me) return;
  const h2h = nx.h2h;
  if (h2h && N.side !== 'h') {
   setTimeout(() => seasonFetch(), 1500);
   return;
  }
  const opp = nx.opp, myScore = sc[0], oppScore = sc[1];
  const gStats = G ? {
   v14: G.v14,
   lu: G.lu,
   mode: G.mode,
   tutorial: G.tutorial
  } : null;
  seasonPut(S => {
   if (nx.t232) {
    if (!window.T232 || !T232.rec(S, nx, me, myScore, oppScore)) return false;
   } else if (nx.po) {
    S.poPlayed = S.poPlayed || {};
    if (S.poPlayed[nx.k]) return false;
    const [a, b] = nx.gm, sa = a === me ? myScore : oppScore, sb = a === me ? oppScore : myScore;
    S.poPlayed[nx.k] = {
     w: sa > sb ? a : b,
     sa: sa,
     sb: sb
    };
    S.playoff.results.push([ a, b, sa, sb, PO_LABEL[S.playoff.round] ]);
    injGameDone(S, a);
    injGameDone(S, b);
   } else {
    if (S.played[nx.k]) return false;
    const [a, b] = nx.gm, sa = a === me ? myScore : oppScore, sb = a === me ? oppScore : myScore;
    S.played[nx.k] = [ sa, sb ];
    applyResult(S, a, b, sa, sb);
    S.results.push([ a, b, sa, sb, 'WK ' + (nx.w + 1) + (h2h ? ' ONLINE' : '') ]);
    S.pend = S.pend.filter(k => k !== nx.k);
    for (const t of [ a, b ]) if (inPlay(S).includes(t) && S.wk[t] <= nx.w) S.wk[t] = nx.w + 1;
   }
   if (gStats && gStats.v14) {
    try {
     const Lm = JSON.parse(JSON.stringify(S));
     Lm.team = me;
     seasonGame14(Lm, Object.assign({}, G));
     S.stats = Lm.stats;
     S.dev = Lm.dev;
     S.ovr0 = Lm.ovr0;
     S.gp14 = Lm.gp14;
     S.concLog = Lm.concLog;
     S.fightLog = Lm.fightLog;
    } catch (e) {}
   }
   settleSeason(S);
   return true;
  }, h2h ? {
   teams: [ opp ],
   title: 'BAGGA LAX',
   body: (uname() ? uname() + ' played their ' + (nx.po ? 'playoff' : 'week ' + (nx.w + 1)) + ' game - ' : '') + 'FINAL: ' + T(nx.gm[0]).name + ' VS ' + T(nx.gm[1]).name + ' IS IN THE BOOKS'
  } : null);
 }
 let sg14Skip = false;
 wrap('seasonGame14', (o, S, G) => {
  if (S && S.online) return;
  return o(S, G);
 });
 wrap('seasonRecordGame', (o, win, sc) => {
  if (season && season.online) return recordOnline(win, sc);
  return o(win, sc);
 });
 function postpone(nx) {
  return seasonPut(S => {
   if (S.played[nx.k] || S.pend.includes(nx.k)) {
    const me = season.team;
    if (S.wk[me] <= nx.w) S.wk[me] = nx.w + 1;
    settleSeason(S);
    return true;
   }
   S.pend.push(nx.k);
   const me = season.team;
   if (S.wk[me] <= nx.w) S.wk[me] = nx.w + 1;
   settleSeason(S);
   return true;
  }, {
   teams: [ nx.opp ],
   title: 'BAGGA LAX',
   body: who(season.team, uname()) + ' WANTS TO PLAY YOUR WEEK ' + (nx.w + 1) + ' GAME LATER - IT STAYS PENDING'
  });
 }
 N.postpone = postpone;
 function playVsCpu(nx) {
  pendingGame = nx;
  useOnline(SN.S);
  newGame(season.team, nx.opp, 'season', nx.home, {
   label: nx.label + ' (ONLINE SEASON)'
  });
 }
 async function playH2H(nx) {
  const S = SN.S, me = season.team;
  const home = nx.gm[0], away = nx.gm[1];
  const wkKey = nx.po ? 'P' + S.playoff.round.toUpperCase() : String(nx.w);
  flash('OPENING THE GAME...', 9);
  const r = await call('/room/open', {
   scode: SN.code,
   wk: wkKey,
   home: home,
   away: away,
   settings: defaultSettings()
  });
  N.msg = null;
  if (!r || !r.ok) {
   N.err = r && r.error || 'NO CONNECTION';
   return;
  }
  pendingGame = nx;
  useOnline(S);
  N.seasonBack = () => {
   screen = 'onSeason';
   seasonFetch();
  };
  enterLobby(r);
  const lu = S.lineups && S.lineups[me] || null;
  patchLobby(r.side === 'h' ? {
   hlu: lu
  } : {
   glu: lu
  });
  call('/season/' + SN.code + '/ping', {
   teams: [ nx.opp ],
   title: 'BAGGA LAX',
   body: who(me, uname()) + ' IS IN THE LOBBY FOR YOUR ' + (nx.po ? 'PLAYOFF' : 'WEEK ' + (nx.w + 1)) + ' GAME - READY UP'
  });
 }
 N.playH2H = playH2H;
 N.playVsCpu = playVsCpu;
 function pendList(S) {
  const me = season && season.team;
  return (S.pend || []).filter(k => k.split(':')[1].split('-').includes(me)).map(k => {
   const [w, ab] = k.split(':');
   const [a, b] = ab.split('-');
   return {
    w: +w,
    gm: [ a, b ],
    k: k,
    opp: a === me ? b : a,
    home: a === me,
    h2h: true,
    label: 'WEEK ' + (+w + 1) + ' (PENDING)'
   };
  });
 }
 N.pendList = pendList;
 N.drawSeasonHome = function() {
  bgStripes(true);
  const S = SN.S, L0 = SN.lobby;
  rect(0, 0, W, 18, '#0b0f14');
  text(window.T232 && T232.title() || (on2312() ? 'ONLINE SEASON' : 'ONLINE SEASON  CODE ' + (SN.code || '----')), 4, 3, 1, '#ffe14d');
  button('MENU', W - 44, 2, 40, 13, () => {
   leaveOnlineSeason();
   screen = 'menu';
  }, {
   bg: '#c9d6d9'
  });
  if (!L0 || !L0.members) {
   text('LOADING...', W / 2, 80, 2, '#fff', 'center');
   return;
  }
  const me = L0.me, humans = S ? S.humans : humanTeams(), opp = null;
  text((me ? T(me).name : 'NO TEAM YET') + ' (YOU)  -  ' + L0.members.length + ' PLAYER' + (L0.members.length === 1 ? '' : 'S'), 4, 10, 1, '#cfe');
  if (!S) {
   card(W / 2 - 150, 22, 300, 150);
   if (on2312()) {
    text('INVITE-ONLY SEASON', W / 2 - 80, 27, 1, '#8fe3f0', 'center');
    if (signed2312()) button('INVITE FRIENDS', W / 2 - 140, 38, 120, 18, () => V23.open(null, {
     pick: true,
     season: SN.code
    }), {
     bg: '#7dff7a'
    }); else button('SIGN IN TO INVITE', W / 2 - 140, 38, 120, 18, () => V23.open('in'), {
     bg: '#ffd23a'
    });
    text('THEY TAP JOIN ON THE INVITE', W / 2 - 80, 64, 1, '#fff', 'center');
   } else {
    text('SEASON CODE', W / 2 - 80, 27, 1, '#8fe3f0', 'center');
    bigCode(SN.code, W / 2 - 80, 36);
    text('FRIENDS: ONLINE > JOIN SEASON', W / 2 - 80, 64, 1, '#fff', 'center');
   }
   text('UP TO ' + (L0.max || 8) + ' PLAYERS, ONE PER TEAM', W / 2 - 80, 72, 1, '#7f9aa6', 'center');
   let y = 27;
   text('PLAYERS', W / 2 + 70, y, 1, '#8fe3f0', 'center');
   y += 9;
   for (const m of L0.members) {
    text((m.team ? T(m.team).name : 'PICKING...') + (m.host ? ' (HOST)' : '') + (m.me ? ' - YOU' : ''), W / 2 + 10, y, 1, m.me ? '#ffe14d' : m.team ? '#fff' : '#7f9aa6');
    y += 9;
   }
   if (window.CP2319 && CP2319.on() && !(window.T232 && (T232.isWg() || T232.isCol && T232.isCol()))) cpSeason2319(L0, me, y);
   if (window.T232 && T232.on()) T232.lobby(L0, me, y);
   if (!me) button('PICK YOUR TEAM', W / 2 - 140, 84, 120, 16, () => {
    SN.mode = 'join';
    screen = 'onSeasonTeam';
   }, {
    bg: '#ffe14d'
   });
   const ready = humans.length >= 2;
   if (L0.host) button(ready ? window.T232 && T232.startLabel(humans.length) || 'START LIVE DRAFT (' + humans.length + ' PLAYERS)' : 'NEED 2+ PLAYERS...', W / 2 - 140, 108, 150, 20, () => {
    if (ready) startDraft();
   }, {
    sc: 1,
    bg: ready ? '#7dff7a' : '#5a6670'
   }); else text('THE HOST STARTS THE DRAFT', W / 2 - 80, 114, 1, '#7dff7a', 'center');
   text(window.T232 && T232.note() || 'OTHER TEAMS ARE CPU. HUMAN VS HUMAN GAMES ARE PLAYED ONLINE.', W / 2, 140, 1, '#cfe', 'center');
   text('NOTIFICATIONS: ' + (N.pushOn ? 'ON' : N.pushPerm === 'denied' ? 'BLOCKED (BANNERS IN THE APP)' : 'BANNERS IN THE APP'), W / 2, 152, 1, '#7f9aa6', 'center');
   drawErr();
   return;
  }
  if (!me) {
   text('THIS SEASON STARTED BEFORE YOU PICKED A TEAM', W / 2, 70, 1, '#ffb14d', 'center');
   button('FORGET IT', W / 2 - 40, 90, 80, 16, () => {
    forgetSeason(SN.code);
    screen = 'online';
   }, {
    bg: '#c9d6d9'
   });
   return;
  }
  if (S.phase === 'draft') {
   useOnline(S);
   screen = 'draft';
   panelDirty();
   return;
  }
  if (!season || !season.online) useOnline(S);
  if (S.w && window.T232) return T232.hub(S, me, L0);
  const L = season;
  const row = S.table[me] || {
   w: 0,
   l: 0
  };
  text(row.w + '-' + row.l, W - 60, 10, 1, '#ffd23a', 'right');
  button('LINEUP', W - 92, 2, 44, 13, () => openLineup(me, 'season', 'onSeason'), {
   bg: '#2cc4dc'
  });
  button('STATS', W - 140, 2, 44, 13, () => {
   PS.stSort = PS.stSort || 'pts';
   screen = 'seasonStats';
   panelDirty();
  }, {
   bg: '#ffe14d'
  });
  const lw = Math.round(W * .46), cx = 6 + lw / 2;
  card(6, 22, lw, 134);
  const nx = nextFor(S, me), pend = pendList(S);
  if (nx && nx.opp === 'BYE') {
   text(nx.label, cx, 28, 1, '#ffd23a', 'center');
   text('BYE WEEK', cx, 50, 3, '#fff', 'center', '#000');
   button('NEXT WEEK', cx - 40, 78, 80, 18, () => seasonPut(S2 => {
    if (S2.wk[me] <= nx.w) S2.wk[me] = nx.w + 1;
    settleSeason(S2);
    return true;
   }), {
    sc: 1
   });
  } else if (nx) {
   const o = T(nx.opp);
   text(nx.label, cx, 28, 1, '#ffd23a', 'center');
   badge(T(me), cx - 52, 38, 2);
   badge(o, cx + 26, 38, 2);
   text(nx.home ? 'VS' : 'AT', cx, 46, 2, '#fff', 'center');
   text(o.name + (nx.h2h ? ' - HUMAN' : ''), cx, 72, 1, nx.h2h ? '#ffe14d' : '#cfe', 'center');
   text(nx.h2h ? nx.home ? 'YOU ARE HOME - YOU SET THE RULES' : 'THEY ARE HOME - THEY SET THE RULES' : nx.home ? 'HOME GAME' : 'AWAY GAME', cx, 80, 1, '#7f9aa6', 'center');
   if (nx.h2h) {
    button('PLAY ONLINE', cx - 60, 90, 120, 18, () => playH2H(nx), {
     sc: 1,
     bg: '#7dff7a'
    });
    if (!nx.po) button('PLAY IT LATER', cx - 60, 112, 120, 14, () => postpone(nx), {
     bg: '#ffb14d'
    });
    text(nx.po ? 'PLAYOFF GAMES CANNOT WAIT' : 'NOT SIMMED - IT WAITS FOR YOU BOTH', cx, 130, 1, '#8fe3f0', 'center');
   } else button('PLAY', cx - 34, 96, 68, 20, () => playVsCpu(nx), {
    sc: 2
   });
   if (nx.po) text('LOSE AND YOU ARE OUT', cx, 142, 1, '#ff9a8a', 'center');
  } else if (S.phase === 'done') {
   const champ = S.champ ? T(S.champ) : null;
   text('SEASON OVER', cx, 30, 1, '#ffd23a', 'center');
   if (champ) {
    badge(champ, cx - 19, 40, 3);
    text(champ.id === me ? 'YOU WON IT ALL!' : champ.name + ' WIN IT ALL', cx, 92, 1, '#ffe14d', 'center');
   }
   if (champ && champ.id === me && window.V17) {
    V17.award('trophy_online');
    text('GOLD ONLINE TROPHY UNLOCKED', cx, 104, 1, '#7dff7a', 'center');
   }
   button('FORGET SEASON', cx - 50, 118, 100, 16, () => {
    forgetSeason(SN.code);
    leaveOnlineSeason();
    screen = 'online';
   }, {
    bg: '#c9d6d9'
   });
  } else {
   text(pend.length ? 'PENDING GAME LEFT' : S.phase === 'playoff' ? 'WAITING ON THE PLAYOFFS' : 'YOUR GAMES ARE DONE', cx, 34, 1, '#ffd23a', 'center');
   text(pend.length ? 'THE SEASON CANNOT FINISH UNTIL' : 'WAITING FOR THE OTHER PLAYERS', cx, 50, 1, '#cfe', 'center');
   if (pend.length) text('YOUR ONLINE GAME IS PLAYED', cx, 58, 1, '#cfe', 'center');
  }
  const right = lw + 12, rw = W - right - 6;
  let y = 24;
  if (pend.length) {
   rect(right, y, rw, 10, '#5a3a10');
   text('PENDING - NOT SIMMED, NOT FORFEITED', right + 3, y + 2, 1, '#ffe14d');
   y += 12;
   for (const p of pend.slice(0, 3)) {
    text(p.label + ' VS ' + T(p.opp).name, right + 3, y + 2, 1, '#fff');
    button('PLAY NOW', right + rw - 52, y, 50, 10, () => playH2H(p), {
     bg: '#7dff7a'
    });
    y += 12;
   }
   y += 2;
  }
  text('TEAM', right + 4, y, 1, '#7f9aa6');
  text('W', right + rw - 40, y, 1, '#7f9aa6', 'center');
  text('L', right + rw - 26, y, 1, '#7f9aa6', 'center');
  text('+/-', right + rw - 10, y, 1, '#7f9aa6', 'center');
  y += 8;
  const all = standings(S), meI = all.findIndex(r => r.id === me);
  const show = all.slice(0, 8);
  if (meI >= 8) show.push(all[meI]);
  for (const r of show) {
   const i = all.indexOf(r), tm = T(r.id), mine = r.id === me, fr = !mine && humans.includes(r.id);
   if (mine || fr) rect(right, y - 2, rw, 9, mine ? '#1f4a52' : '#4a3a1f');
   text(i + 1, right + 4, y, 1, '#7f9aa6');
   rect(right + 14, y - 1, 6, 7, accent(tm));
   text(tm.name, right + 24, y, 1, mine ? '#ffe14d' : fr ? '#ffb14d' : '#fff');
   text(r.w, right + rw - 40, y, 1, '#fff', 'center');
   text(r.l, right + rw - 26, y, 1, '#fff', 'center');
   const gd = r.gf - r.ga;
   text((gd > 0 ? '+' : '') + gd, right + rw - 10, y, 1, gd >= 0 ? '#7dff7a' : '#ff8a7a', 'center');
   y += 9;
   if (y > H - 14) break;
  }
  if (S.phase === 'reg') {
   const ow = Math.min(...humans.map(h => S.wk[h] || 0));
   text('SLOWEST PLAYER ON WEEK ' + Math.min(ow + 1, S.rounds.length) + ' - CPU GAMES SIMMED THRU WEEK ' + S.simmed, W / 2, H - 9, 1, '#7f9aa6', 'center');
  }
  drawErr();
 };
 wrap('drawMenu', o => {
  if (season && season.online && !N.inGame) leaveOnlineSeason();
  return o();
 });
 wrap('drawFinal', o => {
  const G = game;
  const onl = G && (G.mode === 'online' || season && season.online && G.mode === 'season');
  if (!onl) return o();
  const cx = W / 2, win = G.score[0] > G.score[1];
  rect(0, 0, W, H, 'rgba(0,0,0,.55)');
  card(cx - 120, 14, 240, 156);
  text('FINAL' + (typeof otTag173 === 'function' ? otTag173(G) : G.ot ? ' / OT' : '') + '  -  ' + DIFF_NAMES[G.diff != null ? G.diff : 1] + '  -  ONLINE', cx, 20, 1, '#9aa', 'center');
  text(win ? 'YOU WIN!' : 'TOUGH LOSS', cx, 30, 4, win ? '#ffe14d' : '#ff5a4a', 'center', '#000');
  scoreLine(cx, 64);
  text('VS ' + T(G.opp).name + (G.mode === 'season' ? ' - ' + (pendingGame && pendingGame.h2h || N.code ? 'ONLINE' : 'CPU') : ' - YOUR FRIEND'), cx, 98, 1, '#cfe', 'center');
  if (G.mode === 'season') {
   if (season && season.table && season.table[season.team]) {
    const r = season.table[season.team];
    text('SEASON RECORD ' + r.w + '-' + r.l, cx, 108, 1, '#8fe3f0', 'center');
   }
   button('BACK TO SEASON', cx - 60, 122, 120, 18, () => {
    if (N.inGame) endOnlineGame();
    if (N.code) N.leave();
    game = null;
    screen = 'onSeason';
    SN.pollT = 0;
    seasonFetch();
   }, {
    sc: 1,
    bg: '#ffd23a'
   });
  } else drawOnlineFinal();
  if (win) for (let i = 0; i < 40; i++) {
   const x = (i * 37 + G.finalT * 40 * (1 + i % 3)) % W, y = (i * 23 + G.finalT * 60 * (1 + i % 2)) % H;
   rect(x, y, 2, 2, [ '#2cc4dc', '#ffe14d', '#ff5a4a', '#ffffff' ][i % 4]);
  }
 });
 const lobbyChange0 = onLobbyChange;
 onLobbyChange = function(was, r) {
  const st = r.state || {};
  if (st.start && !N.inGame && (screen === 'onLobby' || screen === 'vsRoster' && PS.vs && PS.vs.back === 'onLobby') && (N.rejoining || st.startT && Date.now() - st.startT > 2e4)) {
   N.rejoining = true;
   if (!N.helloT || performance.now() - N.helloT > 3e3) {
    N.helloT = performance.now();
    N.link.send({
     t: 'hello',
     rejoin: true
    });
    flash('REJOINING...', 4);
   }
   return;
  }
  return lobbyChange0(was, r);
 };
 if ('serviceWorker' in navigator) {
  try {
   caches.open('rl-dev').then(c => c.put('/__dev', new Response(devId))).catch(() => {});
  } catch (e) {}
 }
 N.dbg = () => ({
  on: N.on,
  code: N.code,
  side: N.side,
  inGame: N.inGame,
  auth: N.auth,
  screen: screen,
  p2p: !!(N.link && N.link.p2p),
  connected: !!(N.link && N.link.connected),
  ctl: N.ctlIdx,
  score: game ? game.score.slice() : null,
  q: game ? game.q : null,
  clock: game ? game.clock : null,
  fo: N.foLast || null,
  stats: N.stats,
  link: N.link ? N.link.stats : null,
  dc: !!N.dc,
  quit: !!N.quitAsk,
  lobby: N.lobby ? N.lobby.state : null,
  seen: N.lobby ? N.lobby.seen : null,
  view: N.view ? {
   n: N.view.last ? N.view.last.n : 0,
   scr: N.view.scr
  } : null,
  myTeam: N.myTeam,
  oppTeam: N.oppTeam,
  lastIn: N.lastIn || null,
  route: N.link ? N.link.route() : null,
  ping: N.link ? N.link.pingMs() : null,
  pings: N.link ? N.link.ping : null,
  net: N.link ? netLabel() : null,
  ver: {
   me: GAMEV,
   opp: N.oppVer || null,
   bad: N.verBad || null
  },
  clk: {
   ws: N.clk.wsOff != null ? [ Math.round(N.clk.wsOff), Math.round(N.clk.wsRtt) ] : null,
   srv: N.clk.srvOff != null ? [ Math.round(N.clk.srvOff), Math.round(N.clk.srvRtt) ] : null,
   peer: N.clk.peerOff != null ? [ Math.round(N.clk.peerOff), Math.round(N.clk.peerRtt) ] : null
  },
  foSync: N.foSync || null,
  jb: {
   D: Math.round(JB.D),
   base: JB.base != null ? Math.round(JB.base) : null,
   ahead: JB.ahead != null ? Math.round(JB.ahead) : null
  }
 });
 N.sdbg = () => ({
  code: SN.code,
  side: SN.side,
  ver: SN.ver,
  phase: SN.S ? SN.S.phase : null,
  lobby: SN.lobby ? {
   me: SN.lobby.me,
   host: SN.lobby.host,
   members: SN.lobby.members
  } : null,
  turn: SN.S && SN.S.draft ? draftTurn(SN.S.draft) : null,
  n: SN.S && SN.S.draft ? SN.S.draft.n : null,
  wk: SN.S ? SN.S.wk : null,
  pend: SN.S ? SN.S.pend : null,
  simmed: SN.S ? SN.S.simmed : null,
  h2hWeek: SN.S ? SN.S.h2hWeek : null,
  screen: screen,
  team: season && season.online ? season.team : null,
  push: N.pushOn || false,
  perm: N.pushPerm || null
 });
})();
