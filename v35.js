'use strict';

const V35 = (() => {
 const OFF = () => !!window.__rl_v124gb;
 const clipOn = () => !OFF() && !window.__rl_no35clip;
 const askOn = () => !OFF() && !window.__rl_no35ask;
 const qbOn = () => !OFF() && !window.__rl_no35qb;
 const LOG = {
  cap: 0,
  capFail: 0,
  bad: [],
  taps: [],
  saves: [],
  errs: [],
  exp: [],
  share: [],
  ask: [],
  qb: [],
  na: [],
  del35: [],
  name35: []
 };
 const pnow = () => performance.now();
 const cnow = () => typeof window.__rl35t === 'number' ? window.__rl35t : performance.now();
 const clampN = (v, a, b) => v < a ? a : v > b ? b : v;
 const lerpN = (a, b, k) => a + (b - a) * k;
 const err = (e, w) => {
  try {
   LOG.errs.push((w || '') + ': ' + String(e && e.message || e).slice(0, 160));
   if (LOG.errs.length > 40) LOG.errs.shift();
  } catch (x) {}
 };
 const MAXC = 30;
 const CAP = {
  seq: 0,
  hz: 30,
  keep: 14e3,
  ring: [],
  last: 0,
  ema: 0,
  n: 0,
  gref: null,
  bad: new Set,
  pend: null,
  flash: null,
  warn: null,
  costs: []
 };
 const CAP_SCR = [ 'faceoff', 'live', 'banner', 'cpu', 'defense', 'netview', 'scene' ];
 const EXCL = new Set([ 'stats', 'lu', 'v14', 'scorers', 'st28log', 'meta' ]);
 const exKey = k => EXCL.has(k) || /log\d*$/i.test(k) || CAP.bad.has(k);
 function capOk() {
  const G = game;
  return clipOn() && !!G && !paused && !portrait && CAP_SCR.includes(screen) && !G.tutorial && G.mode !== 'practice' && G.mode !== 'tutorial' && !document.hidden;
 }
 function evOf(G) {
  const c = G.carrier, ps = G.players || [];
  let dn = 0;
  for (const p of ps) if (p && p.down > 0) dn++;
  return {
   s: G.score ? (+G.score[0] || 0) + (+G.score[1] || 0) : 0,
   s0: G.score ? +G.score[0] || 0 : 0,
   an: G.ankles || 0,
   dn: dn,
   dg: c && c.dodgeA ? c.dodgeA.kind || 'dodge' : null,
   c17: G.c17 ? 1 : 0,
   bn: G.banner ? G.banner.kind || '' : ''
  };
 }
 function cloneNow(G) {
  const sub = {};
  for (const k in G) if (!exKey(k)) sub[k] = G[k];
  let fxc = [];
  try {
   fxc = structuredClone(fx);
  } catch (e) {
   fxc = [];
  }
  let pel = [];
  try {
   for (const q of pellets) {
    const a = q.life ? q.t / q.life : 1;
    if (a < 1) pel.push({
     x: Math.round(q.x * 10) / 10,
     y: Math.round((q.y - (q.z || 0)) * 10) / 10,
     z: 0,
     s: q.s || 1,
     t: Math.round(a * 50) / 50,
     life: 1
    });
   }
  } catch (e) {
   pel = [];
  }
  try {
   return {
    G: structuredClone(sub),
    fx: fxc,
    pel: pel
   };
  } catch (e) {
   for (const k in sub) {
    try {
     structuredClone(sub[k]);
    } catch (e2) {
     CAP.bad.add(k);
     LOG.bad.push(k);
     delete sub[k];
    }
   }
   try {
    return {
     G: structuredClone(sub),
     fx: fxc,
     pel: pel
    };
   } catch (e3) {
    LOG.capFail++;
    return null;
   }
  }
 }
 function capture() {
  const t = cnow(), G = game;
  if (G !== CAP.gref) {
   CAP.ring = [];
   CAP.gref = G;
  }
  if (t - CAP.last < 1e3 / CAP.hz - 3) return;
  const t0 = pnow();
  const c = cloneNow(G);
  if (!c) return;
  CAP.last = t;
  CAP.ring.push({
   t: t,
   scr: screen,
   cam: camX,
   W: W,
   mt: menuT,
   c: c,
   ev: evOf(G)
  });
  while (CAP.ring.length && t - CAP.ring[0].t > CAP.keep) CAP.ring.shift();
  const dt = pnow() - t0;
  CAP.n++;
  LOG.cap++;
  CAP.ema = CAP.ema ? CAP.ema * .95 + dt * .05 : dt;
  CAP.costs.push(dt);
  if (CAP.costs.length > 600) CAP.costs.shift();
  if (CAP.n > 60) CAP.hz = CAP.ema > 4 ? 15 : CAP.ema > 2 ? 20 : 30;
 }
 function goalBanner(G) {
  return screen === 'banner' && G && G.banner && /goal/i.test(String(G.banner.kind || ''));
 }
 function tapClip() {
  const G = game;
  if (!clipOn() || !G) return;
  const t = cnow();
  LOG.taps.push({
   t: Math.round(t),
   scr: screen,
   n: CAP.ring.length
  });
  if (CAP.pend) {
   CAP.flash = {
    t: t,
    s: 'REC'
   };
   return;
  }
  if (CAP.ring.length < 8) {
   CAP.flash = {
    t: t,
    s: 'WAIT'
   };
   return;
  }
  const recent = CAP.ring.length > 2 && CAP.ring[CAP.ring.length - 1].ev.s > CAP.ring[Math.max(0, CAP.ring.length - 31)].ev.s;
  const celly = !!G.c17 || goalBanner(G) || recent;
  CAP.pend = {
   t0: t,
   until: t + (celly ? 6500 : 0),
   celly: celly,
   hdr: hdrNow(G),
   meta: metaNow(G)
  };
  CAP.flash = {
   t: t,
   s: celly ? 'REC' : 'SAVED'
  };
  if (!celly) finishPend();
 }
 function pendTick() {
  const P = CAP.pend;
  if (!P) return;
  const t = cnow(), G = game;
  const done = !G || G !== CAP.gref || t > P.until || !CAP_SCR.includes(screen) || t - P.t0 > 400 && !G.c17 && !goalBanner(G);
  if (done) finishPend();
 }
 function hdrNow(G) {
  const h = {};
  if (!G) return h;
  for (const k in G) if (exKey(k) && !CAP.bad.has(k)) {
   try {
    h[k] = structuredClone(G[k]);
   } catch (e) {}
  }
  return h;
 }
 function tname(id) {
  try {
   const t = T(id);
   return t ? {
    n: String(t.name || id),
    a: String(t.abbr || t.id || id).slice(0, 4)
   } : {
    n: String(id),
    a: String(id).slice(0, 4)
   };
  } catch (e) {
   return {
    n: String(id),
    a: String(id).slice(0, 4)
   };
  }
 }
 function metaNow(G) {
  const u = tname(G.user), o = tname(G.opp);
  return {
   user: G.user,
   opp: G.opp,
   un: u.n,
   ua: u.a,
   on: o.n,
   oa: o.a,
   uc: G.uk && G.uk.jersey || '#2cc4dc',
   oc: G.ok && G.ok.jersey || '#ff5a4a',
   mode: G.mode,
   online: !!(G.online || G.meta && G.meta.online || window.RLNET && RLNET.inGame),
   home: !!G.userHome
  };
 }
 function highlight(fr) {
  const ev = [];
  for (let i = 1; i < fr.length; i++) {
   const a = fr[i - 1].ev, b = fr[i].ev, t = fr[i].t;
   if (b.s > a.s) ev.push({
    k: 'goal',
    t: t,
    i: i,
    us: b.s0 > a.s0
   });
   if (b.an > a.an) ev.push({
    k: 'ankles',
    t: t,
    i: i
   }); else if (b.dn > a.dn) ev.push({
    k: 'hit',
    t: t,
    i: i
   });
   if (b.dg && !a.dg) ev.push({
    k: 'dodge',
    t: t,
    i: i,
    d: b.dg
   });
  }
  const last = k => {
   for (let j = ev.length - 1; j >= 0; j--) if (ev[j].k === k) return ev[j];
   return null;
  };
  const goal = last('goal');
  let main = goal || last('ankles') || last('hit') || last('dodge');
  let s0, s1, label;
  if (goal) {
   const pre = ev.filter(e => e.k !== 'goal' && e.t < goal.t && e.t > goal.t - 4200);
   const best = pre.find(e => e.k === 'ankles') || pre.find(e => e.k === 'hit') || pre[pre.length - 1];
   s0 = best ? Math.min(goal.t - 1600, best.t - 700) : goal.t - 2300;
   s1 = goal.t + 700;
   label = (best ? best.k === 'ankles' ? 'ANKLE BREAKER + ' : best.k === 'hit' ? 'BIG HIT + ' : 'DODGE + ' : '') + 'GOAL';
  } else if (main) {
   s0 = main.t - 1e3;
   s1 = main.t + 1400;
   label = main.k === 'ankles' ? 'ANKLE BREAKER' : main.k === 'hit' ? 'BIG HIT' : 'DODGE';
  }
  return {
   ev: ev,
   main: main,
   goal: goal,
   s0: s0,
   s1: s1,
   label: label || 'PLAY'
  };
 }
 function finishPend() {
  const P = CAP.pend;
  CAP.pend = null;
  if (!P) return;
  try {
   const all = CAP.ring.slice();
   if (all.length < 8) {
    CAP.flash = {
     t: cnow(),
     s: 'WAIT'
    };
    return;
   }
   let end = all.length - 1;
   let cut = 0;
   for (let i = end; i > 0; i--) if (all[i].t - all[i - 1].t > 600) {
    cut = i;
    break;
   }
   let fr = all.slice(cut);
   const h0 = highlight(fr);
   const tEnd = fr[fr.length - 1].t;
   let tA = tEnd - 8e3, tB = tEnd;
   if (h0.main) {
    tA = h0.main.t - (h0.goal ? 7e3 : 5500);
    if (h0.goal) {
     let ce = h0.goal.t + 1500;
     for (let i = h0.goal.i; i < fr.length; i++) if (fr[i].ev.c17 || /goal/i.test(fr[i].ev.bn)) ce = fr[i].t;
     tB = Math.min(tEnd, ce + 900);
    } else tB = Math.min(tEnd, h0.main.t + 4e3);
   }
   tA = Math.max(tA, tB - 16e3, fr[0].t);
   fr = fr.filter(f => f.t >= tA - 1 && f.t <= tB + 1);
   if (fr.length < 8) {
    CAP.flash = {
     t: cnow(),
     s: 'WAIT'
    };
    return;
   }
   const H2 = highlight(fr), base = fr[0].t, dur = fr[fr.length - 1].t - base;
   let s0 = H2.s0 != null ? H2.s0 - base : Math.max(0, dur - 2600), s1 = H2.s1 != null ? H2.s1 - base : dur;
   s0 = clampN(s0, 0, dur);
   s1 = clampN(s1, s0, dur);
   if (s1 - s0 < 800) {
    s0 = Math.max(0, s1 - 1800);
   }
   if (s1 - s0 > 3600) s0 = s1 - 3600;
   const last = fr[fr.length - 1].c.G;
   const meta = Object.assign({}, P.meta, {
    id: 'c' + Date.now().toString(36) + (++CAP.seq).toString(36),
    at: Date.now(),
    dur: Math.round(dur),
    n: fr.length,
    sc: [ last.score ? +last.score[0] || 0 : 0, last.score ? +last.score[1] || 0 : 0 ],
    moment: H2.label,
    hs: Math.round(s0),
    he: Math.round(s1),
    W: fr[0].W,
    evs: H2.ev.map(e => [ e.k, Math.round(e.t - base) ])
   });
   const frames = fr.map(f => ({
    c: f.c,
    t: f.t - base,
    scr: f.scr,
    cam: f.cam,
    W: f.W,
    mt: f.mt
   }));
   const clip = {
    meta: meta,
    frames: frames,
    hdr: P.hdr || {}
   };
   MEM.set(meta.id, clip);
   while (MEM.size > 2) MEM.delete(MEM.keys().next().value);
   LOG.saves.push({
    id: meta.id,
    n: fr.length,
    dur: meta.dur,
    moment: meta.moment,
    hs: meta.hs,
    he: meta.he
   });
   CAP.flash = {
    t: cnow(),
    s: 'SAVED'
   };
   storeClip(clip).catch(e => err(e, 'store'));
  } catch (e) {
   err(e, 'finish');
   console.error(e);
   CAP.flash = {
    t: cnow(),
    s: 'ERR'
   };
  }
 }
 const SEP = '\t', SG = '§';
 const MEM = new Map;
 const yieldF = () => new Promise(r => setTimeout(r, 0));
 function encV(v) {
  if (typeof v === 'number') return Number.isFinite(v) ? v : Number.isNaN(v) ? SG + 'N' : v > 0 ? SG + 'I' : SG + 'J';
  if (typeof v === 'string') return v.charCodeAt(0) === 167 ? SG + v : v;
  if (v === undefined) return SG + 'U';
  if (typeof v === 'bigint') return Number(v);
  return v;
 }
 function q2(v) {
  if (!Number.isFinite(v) || Number.isInteger(v)) return v;
  const r = Math.round(v * 100) / 100;
  return Object.is(r, -0) ? 0 : r;
 }
 function flat(root, quant) {
  const out = new Map, seen = new Map;
  const walk = (v, p) => {
   if (v === null || typeof v !== 'object') {
    if (typeof v !== 'function' && typeof v !== 'symbol') out.set(p, encV(quant && typeof v === 'number' ? q2(v) : v));
    return;
   }
   if (seen.has(v)) {
    const sp = seen.get(v);
    if (sp !== p) out.set(p, SG + 'R' + sp);
    return;
   }
   seen.set(v, p);
   if (Array.isArray(v)) {
    out.set(p, SG + 'A' + v.length);
    for (let i = 0; i < v.length; i++) walk(v[i], p + SEP + i);
    return;
   }
   if (v instanceof Map) {
    out.set(p, SG + 'M');
    let i = 0;
    for (const [k, x] of v) {
     walk(k, p + SEP + 'k' + i);
     walk(x, p + SEP + 'v' + i);
     i++;
    }
    return;
   }
   if (v instanceof Set) {
    out.set(p, SG + 'S');
    let i = 0;
    for (const x of v) {
     walk(x, p + SEP + i);
     i++;
    }
    return;
   }
   if (v instanceof Date) {
    out.set(p, SG + 'D' + v.getTime());
    return;
   }
   if (ArrayBuffer.isView(v)) {
    out.set(p, SG + 'A' + v.length);
    for (let i = 0; i < v.length; i++) out.set(p + SEP + i, encV(v[i]));
    return;
   }
   out.set(p, SG + 'O');
   for (const k in v) walk(v[k], p + SEP + k);
  };
  try {
   const G = root && root.c && root.c.G;
   if (G) {
    out.set('', SG + 'O');
    seen.set(root, '');
    out.set(SEP + 'c', SG + 'O');
    seen.set(root.c, SEP + 'c');
    out.set(SEP + 'c' + SEP + 'G', SG + 'O');
    seen.set(G, SEP + 'c' + SEP + 'G');
    for (const k of [ 'players', 'farU', 'farC' ]) {
     const a = G[k];
     if (Array.isArray(a) && !seen.has(a)) {
      const p = SEP + 'c' + SEP + 'G' + SEP + k;
      seen.set(a, p);
      out.set(p, SG + 'A' + a.length);
      for (let i = 0; i < a.length; i++) {
       const x = a[i];
       if (x && typeof x === 'object' && !seen.has(x)) {
        seen.set(x, p + SEP + i);
       }
      }
     }
    }
    for (const k of [ 'players', 'farU', 'farC' ]) {
     const a = G[k];
     if (Array.isArray(a)) for (let i = 0; i < a.length; i++) {
      const x = a[i], p = SEP + 'c' + SEP + 'G' + SEP + k + SEP + i;
      if (x && typeof x === 'object' && seen.get(x) === p) {
       out.set(p, SG + 'O');
       for (const kk in x) walk(x[kk], p + SEP + kk);
      } else walk(x, p);
     }
    }
    const kids = (o, p) => {
     for (const k in o) walk(o[k], p + SEP + k);
    };
    for (const k in root) if (k !== 'c') walk(root[k], SEP + k);
    for (const k in root.c) if (k !== 'G') walk(root.c[k], SEP + 'c' + SEP + k);
    kids(G, SEP + 'c' + SEP + 'G');
    return out;
   }
  } catch (e) {
   err(e, 'flat');
   out.clear();
   seen.clear();
  }
  walk(root, '');
  return out;
 }
 function build(map) {
  const objs = new Map;
  for (const [p, v] of map) if (typeof v === 'string' && v.charCodeAt(0) === 167 && 'AOMS'.indexOf(v[1]) >= 0) objs.set(p, v[1] === 'A' ? [] : v[1] === 'M' ? new Map : v[1] === 'S' ? new Set : {});
  const dec = (v, p) => {
   if (typeof v !== 'string' || v.charCodeAt(0) !== 167) return v;
   const c = v[1];
   if (c === 'A' || c === 'O' || c === 'M' || c === 'S') return objs.get(p);
   if (c === 'R') return objs.get(v.slice(2));
   if (c === 'N') return NaN;
   if (c === 'I') return Infinity;
   if (c === 'J') return -Infinity;
   if (c === 'U') return undefined;
   if (c === 'D') return new Date(+v.slice(2));
   return v.slice(1);
  };
  const coll = new Map;
  for (const [p, v] of map) {
   if (p === '') continue;
   const i = p.lastIndexOf(SEP), pp = p.slice(0, i), k = p.slice(i + 1), par = objs.get(pp);
   if (par === undefined) continue;
   const val = dec(v, p);
   if (Array.isArray(par)) par[+k] = val; else if (par instanceof Map) {
    let e = coll.get(pp);
    if (!e) coll.set(pp, e = {
     k: [],
     v: []
    });
    (k[0] === 'k' ? e.k : e.v)[+k.slice(1)] = val;
   } else if (par instanceof Set) {
    let e = coll.get(pp);
    if (!e) coll.set(pp, e = {
     s: []
    });
    e.s[+k] = val;
   } else par[k] = val;
  }
  for (const [pp, e] of coll) {
   const par = objs.get(pp);
   if (par instanceof Map) e.k.forEach((k, i) => par.set(k, e.v[i])); else if (e.s) e.s.forEach(x => par.add(x));
  }
  for (const [p, v] of map) if (typeof v === 'string' && v.charCodeAt(0) === 167 && v[1] === 'A') {
   const a = objs.get(p);
   if (a) a.length = +v.slice(2) || 0;
  }
  return objs.get('');
 }
 async function gz(text) {
  if (typeof CompressionStream === 'function') {
   try {
    return {
     enc: 'gz',
     buf: await new Response(new Blob([ text ]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer()
    };
   } catch (e) {
    err(e, 'gz');
   }
  }
  return {
   enc: 'txt',
   buf: (new TextEncoder).encode(text).buffer
  };
 }
 async function ungz(rec) {
  if (rec.enc === 'gz') return await new Response(new Blob([ rec.buf ]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
  return (new TextDecoder).decode(rec.buf);
 }
 async function encodeClip(clip) {
  const lines = [ JSON.stringify({
   v: 1,
   meta: clip.meta,
   hdr: [ ...flat(clip.hdr) ]
  }) ];
  let prev = new Map, t0 = pnow();
  for (const f of clip.frames) {
   const cur = flat(f, true), s = [], d = [];
   for (const [p, v] of cur) {
    const o = prev.get(p);
    if (o !== v || o === undefined && !prev.has(p)) s.push(p, v);
   }
   for (const p of prev.keys()) if (!cur.has(p)) d.push(p);
   lines.push(JSON.stringify(d.length ? [ s, d ] : [ s ]));
   prev = cur;
   if (pnow() - t0 > 3) {
    await yieldF();
    t0 = pnow();
   }
  }
  const text = lines.join('\n');
  const z = await gz(text);
  return {
   enc: z.enc,
   buf: z.buf,
   raw: text.length
  };
 }
 async function decodeClip(rec) {
  const text = await ungz(rec), lines = text.split('\n');
  const head = JSON.parse(lines[0]);
  const hdr = build(new Map(head.hdr)) || {};
  const frames = [];
  let cur = new Map, t0 = pnow();
  for (let i = 1; i < lines.length; i++) {
   const L = JSON.parse(lines[i]), s = L[0], d = L[1] || [];
   for (const p of d) cur.delete(p);
   for (let j = 0; j < s.length; j += 2) cur.set(s[j], s[j + 1]);
   frames.push(build(cur));
   if (pnow() - t0 > 8) {
    await yieldF();
    t0 = pnow();
   }
  }
  return {
   meta: head.meta,
   frames: frames,
   hdr: hdr
  };
 }
 const DB = {
  p: null,
  list: null,
  loading: null,
  bytes: 0
 };
 function db() {
  if (DB.p) return DB.p;
  DB.p = new Promise((res, rej) => {
   try {
    const r = indexedDB.open('baggalax35', 1);
    r.onupgradeneeded = () => {
     const d = r.result;
     if (!d.objectStoreNames.contains('meta')) d.createObjectStore('meta', {
      keyPath: 'id'
     });
     if (!d.objectStoreNames.contains('data')) d.createObjectStore('data', {
      keyPath: 'id'
     });
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
   } catch (e) {
    rej(e);
   }
  });
  DB.p.catch(() => {
   DB.p = null;
  });
  return DB.p;
 }
 function txp(stores, mode, fn) {
  return db().then(d => new Promise((res, rej) => {
   const tx = d.transaction(stores, mode);
   let out;
   try {
    out = fn(tx);
   } catch (e) {
    rej(e);
    return;
   }
   tx.oncomplete = () => res(out && out.result !== undefined ? out.result : out);
   tx.onerror = () => rej(tx.error);
   tx.onabort = () => rej(tx.error);
  }));
 }
 async function loadList() {
  const rows = await txp([ 'meta' ], 'readonly', tx => tx.objectStore('meta').getAll());
  DB.list = (rows || []).sort((a, b) => b.at - a.at);
  DB.bytes = DB.list.reduce((s, m) => s + (m.size || 0), 0);
  return DB.list;
 }
 function listNow() {
  if (!DB.list && !DB.loading) DB.loading = loadList().then(() => {
   DB.loading = null;
   try {
    panelDirty();
   } catch (e) {}
  }, e => {
   DB.loading = null;
   DB.list = DB.list || [];
   err(e, 'list');
  });
  return DB.list || [];
 }
 async function storeClip(clip) {
  const t0 = pnow();
  const z = await encodeClip(clip);
  const meta = Object.assign({}, clip.meta, {
   size: z.buf.byteLength,
   raw: z.raw,
   enc: z.enc
  });
  clip.meta.size = meta.size;
  clip.meta.enc = z.enc;
  if (!DB.list) await loadList();
  const drop = DB.list.slice(MAXC - 1);
  await txp([ 'meta', 'data' ], 'readwrite', tx => {
   tx.objectStore('meta').put(meta);
   tx.objectStore('data').put({
    id: meta.id,
    enc: z.enc,
    buf: z.buf
   });
   for (const m of drop) {
    tx.objectStore('meta').delete(m.id);
    tx.objectStore('data').delete(m.id);
   }
  });
  if (drop.length) {
   CAP.warn = {
    t: cnow(),
    n: drop.length
   };
   LOG.saves.push({
    dropped: drop.map(m => m.id)
   });
  }
  await loadList();
  const L = LOG.saves.find(s => s.id === meta.id);
  if (L) {
   L.size = meta.size;
   L.raw = z.raw;
   L.ms = Math.round(pnow() - t0);
  }
  try {
   panelDirty();
  } catch (e) {}
  return meta;
 }
 async function getClip(id) {
  if (MEM.has(id)) return MEM.get(id);
  const rec = await txp([ 'data' ], 'readonly', tx => tx.objectStore('data').get(id));
  if (!rec) return null;
  const c = await decodeClip(rec);
  MEM.set(id, c);
  while (MEM.size > 2) MEM.delete(MEM.keys().next().value);
  return c;
 }
 async function delClip(id) {
  await txp([ 'meta', 'data' ], 'readwrite', tx => {
   tx.objectStore('meta').delete(id);
   tx.objectStore('data').delete(id);
  });
  MEM.delete(id);
  await loadList();
  try {
   panelDirty();
  } catch (e) {}
 }
 const SLOW = .35, ZOOM = 1.55, CARD = 650, HOLD = 600;
 const PB = {
  sm: [],
  smT: null,
  smS: '',
  bj: null
 };
 function lcg(seed) {
  let s = seed >>> 0 || 1;
  return () => {
   s = Math.imul(s, 1664525) + 1013904223 >>> 0;
   return s / 4294967296;
  };
 }
 function plan(meta, frames) {
  const dur = frames.length ? frames[frames.length - 1].t : 0, hs = clampN(meta.hs || 0, 0, dur), he = clampN(meta.he || dur, hs, dur);
  const segs = [ {
   k: 'full',
   a: 0,
   b: dur,
   d: dur
  }, {
   k: 'card',
   d: CARD
  }, {
   k: 'slow',
   a: hs,
   b: he,
   d: (he - hs) / SLOW
  }, {
   k: 'hold',
   d: HOLD
  } ];
  let T0 = 0;
  for (const s of segs) {
   s.T0 = T0;
   T0 += s.d;
  }
  return {
   segs: segs,
   total: T0,
   dur: dur,
   hs: hs,
   he: he
  };
 }
 function idxAt(frames, t) {
  let lo = 0, hi = frames.length - 1;
  if (t <= frames[0].t) return 0;
  if (t >= frames[hi].t) return hi;
  while (hi - lo > 1) {
   const m = lo + hi >> 1;
   if (frames[m].t <= t) lo = m; else hi = m;
  }
  return lo;
 }
 function sameP(a, b) {
  return a && b && (a.pl && b.pl ? a.pl.id === b.pl.id && a.team === b.team : a.team === b.team && a.idx === b.idx);
 }
 function workFrame(frames, t) {
  const i = idxAt(frames, t), A = frames[i], B = frames[Math.min(i + 1, frames.length - 1)];
  const k = B === A || B.t <= A.t ? 0 : clampN((t - A.t) / (B.t - A.t), 0, 1);
  const base = k < .5 || B.scr !== A.scr ? A : B, C = structuredClone(base.c);
  const out = {
   c: C,
   scr: base.scr,
   cam: base.cam,
   W: base.W,
   mt: base.mt,
   t: t
  };
  if (B !== A && B.scr === A.scr && k > 0) {
   out.cam = lerpN(A.cam, B.cam, k);
   out.mt = lerpN(A.mt, B.mt, k);
   const GA = A.c.G, GB = B.c.G, GC = C.G;
   for (const key of [ 'players', 'farU', 'farC' ]) {
    const la = GA[key], lb = GB[key], lc = GC[key];
    if (!Array.isArray(la) || !Array.isArray(lb) || !Array.isArray(lc)) continue;
    for (let j = 0; j < lc.length; j++) {
     const pa = la[j], pb = lb[j], pc = lc[j];
     if (!pc || !sameP(pa, pb) || Math.hypot(pb.x - pa.x, pb.y - pa.y) > 40) continue;
     pc.x = lerpN(pa.x, pb.x, k);
     pc.y = lerpN(pa.y, pb.y, k);
    }
   }
   const ba = GA.ball, bb = GB.ball, bc = GC.ball;
   if (ba && bb && bc && Math.hypot(bb.x - ba.x, bb.y - ba.y) < 80) {
    bc.x = lerpN(ba.x, bb.x, k);
    bc.y = lerpN(ba.y, bb.y, k);
    if (typeof ba.z === 'number' && typeof bb.z === 'number') bc.z = lerpN(ba.z, bb.z, k);
   }
   if (GA.c17 && GB.c17 && GC.c17) GC.c17.t = lerpN(GA.c17.t, GB.c17.t, k);
   if (typeof GA.bannerT === 'number' && typeof GB.bannerT === 'number') GC.bannerT = lerpN(GA.bannerT, GB.bannerT, k);
   if (typeof GA.t === 'number' && typeof GB.t === 'number') GC.t = lerpN(GA.t, GB.t, k);
  }
  return out;
 }
 function focusOf(F) {
  const G = F.c.G;
  if (!G) return null;
  if (G.c17) {
   const a = G.c17.actors && G.c17.actors[0];
   const s = a && a.src;
   return {
    x: s ? s.x : G.c17.sx,
    y: (s ? s.y : G.c17.sy) - 8
   };
  }
  if (G.carrier && typeof G.carrier.x === 'number') return {
   x: G.carrier.x,
   y: G.carrier.y - 8
  };
  if (G.ball && typeof G.ball.x === 'number') return {
   x: G.ball.x,
   y: G.ball.y - 4
  };
  return null;
 }
 const call = f => {
  try {
   if (typeof f === 'function') f();
  } catch (e) {
   err(e, 'draw');
  }
 };
 function drawWorld35() {
  const G = game;
  g.save();
  g.translate(-Math.round(camX), 0);
  try {
   if (typeof f30Cam === 'function') f30Cam(Math.round(camX));
  } catch (e) {}
  tagQ = new Map;
  ballQ = false;
  topPass = true;
  call(drawStadium);
  call(drawField);
  call(drawBench);
  try {
   if (window.GHO16 && GHO16.on() && (homeTeam().gho16 || window.V28 && V28.stGho())) GHO16.fog();
  } catch (e) {}
  call(drawPenaltyBox);
  call(drawRefs);
  call(drawGear);
  const s = screen;
  if (s === 'scene') call(drawScene); else if (s === 'live') call(drawLiveWorld); else if (s === 'defense') call(drawDefWorld); else if (s === 'cpu') call(drawCpuWorld); else if (G.players && G.players.length) {
   call(drawPlayers);
   call(drawBall);
   try {
    for (const f of fx) if (f.type === 'pop') for (let i = 0; i < 8; i++) {
     const a = i / 8 * 6.28;
     px(f.x + Math.cos(a) * f.t * 30, f.y + Math.sin(a) * f.t * 30, '#fff');
    }
   } catch (e) {}
  }
  try {
   if (window.V20) V20.drawWorld();
  } catch (e) {}
  try {
   drawTopLayer();
  } catch (e) {
   topPass = false;
   tagQ = null;
  }
  call(drawPellets);
  call(drawLvlFx);
  g.restore();
  if (G.c17 && window.V17 && V17.drawCelly35) {
   g.save();
   g.translate(-Math.round(camX), 0);
   try {
    V17.drawCelly35();
   } catch (e) {
    err(e, 'celly');
   }
   g.restore();
  }
 }
 function bug(meta, G) {
  const bw = 58, uc = G.uk && G.uk.jersey || meta.uc, oc = G.ok && G.ok.jersey || meta.oc, sc = G.score || [ 0, 0 ];
  rect(2, 2, bw * 2 + 44, 11, 'rgba(8,12,16,.86)');
  rect(3, 3, bw, 9, uc);
  text(meta.ua, 5, 5, 1, textOn(uc));
  text(String(sc[0]), bw, 5, 1, textOn(uc), 'right');
  rect(bw + 4, 3, bw, 9, oc);
  text(meta.oa, bw + 6, 5, 1, textOn(oc));
  text(String(sc[1]), bw * 2 + 1, 5, 1, textOn(oc), 'right');
  let clk = '';
  try {
   clk = G.brave ? 'BRAVE' : perLabel(G) + ' ' + (G.ot ? 'OT' : fmtClock(G.clock));
  } catch (e) {
   clk = '';
  }
  text(clk.slice(0, 10), bw * 2 + 25, 5, 1, '#ffd23a', 'center');
 }
 function drawClipFrame(cv2, clip, F, o) {
  const meta = clip.meta, S = {
   game: game,
   screen: screen,
   camX: camX,
   fx: fx,
   paused: paused,
   menuT: menuT,
   g: g,
   W: W,
   uiSpecs: uiSpecs,
   tagQ: tagQ,
   ballQ: ballQ,
   topPass: topPass,
   pellets: pellets,
   muted: muted,
   rs18: rs18,
   rnd: Math.random,
   smE: [ ...SM211 ].map(([k, v]) => [ k, Object.assign({}, v) ]),
   smT: sm211T,
   smS: sm211S,
   bj: Object.assign({}, bj287),
   tl: window.__rlTextLog
  };
  const cw = Math.round(F.W * RR), ch = Math.round(H * RR);
  if (cv2.width !== cw) cv2.width = cw;
  if (cv2.height !== ch) cv2.height = ch;
  const x = cv2.getContext('2d');
  try {
   SM211.clear();
   for (const [k, v] of PB.sm) SM211.set(k, v);
   sm211T = PB.smT;
   sm211S = PB.smS;
   if (PB.bj) Object.assign(bj287, PB.bj);
   window.__rlTextLog = null;
   Math.random = lcg(Math.round(F.t) + 7);
   const G = F.c.G;
   for (const k in clip.hdr || {}) if (!(k in G)) G[k] = clip.hdr[k];
   game = G;
   screen = F.scr;
   camX = F.cam;
   fx = F.c.fx || [];
   pellets = F.c.pel || [];
   paused = false;
   menuT = F.mt;
   W = F.W;
   uiSpecs = [];
   muted = true;
   g = x;
   x.setTransform(RR, 0, 0, RR, 0, 0);
   x.imageSmoothingEnabled = false;
   x.globalAlpha = 1;
   x.fillStyle = '#0b0f14';
   x.fillRect(0, 0, W, H);
   const z = o.zoom || 1;
   if (z > 1.001 && o.fx != null) {
    const vw = W / z, vh = H / z, left = clampN(o.fx - camX - vw / 2, 0, W - vw), top = clampN(o.fy - vh / 2, 0, H - vh);
    x.scale(z, z);
    x.translate(-left, -top);
   }
   drawWorld35();
   x.setTransform(RR, 0, 0, RR, 0, 0);
   if (screen === 'banner' && G.banner && !o.card) call(drawBanner);
   bug(meta, G);
   if (o.tag) {
    const on = Math.floor(o.t / 400) % 2 === 0;
    rect(W - 64, 2, 62, 11, 'rgba(8,12,16,.86)');
    if (on) rect(W - 61, 5, 4, 4, '#ff3b30');
    text(o.tag, W - 31, 5, 1, '#ffe14d', 'center');
   }
   text('BAGGA LAX', W - 4, H - 8, 1, 'rgba(255,255,255,.55)', 'right');
   if (o.card) {
    const k = o.card;
    rect(0, 0, W, H, 'rgba(0,0,0,' + (.35 + .45 * Math.sin(Math.PI * k)).toFixed(3) + ')');
    rect(0, H / 2 - 16, W, 30, 'rgba(10,12,16,.85)');
    rect(0, H / 2 - 16, W, 2, '#ffcc33');
    rect(0, H / 2 + 12, W, 2, '#ffcc33');
    text('REPLAY', W / 2 + Math.round((1 - Math.min(1, k * 3)) * -120), H / 2 - 10, 3, '#ffe14d', 'center', '#000');
    text(meta.moment || '', W / 2, H / 2 + 6, 1, '#ffffff', 'center');
   }
  } catch (e) {
   err(e, 'frame');
  } finally {
   PB.sm = [ ...SM211 ];
   PB.smT = sm211T;
   PB.smS = sm211S;
   PB.bj = Object.assign({}, bj287);
   SM211.clear();
   for (const [k, v] of S.smE) SM211.set(k, v);
   sm211T = S.smT;
   sm211S = S.smS;
   Object.assign(bj287, S.bj);
   game = S.game;
   screen = S.screen;
   camX = S.camX;
   fx = S.fx;
   paused = S.paused;
   menuT = S.menuT;
   g = S.g;
   W = S.W;
   uiSpecs = S.uiSpecs;
   tagQ = S.tagQ;
   ballQ = S.ballQ;
   topPass = S.topPass;
   pellets = S.pellets;
   muted = S.muted;
   rs18 = S.rs18;
   Math.random = S.rnd;
   window.__rlTextLog = S.tl;
   try {
    g.setTransform(RR, 0, 0, RR, 0, 0);
   } catch (e) {}
  }
 }
 function stateAt(P, T, cam) {
  const {segs: segs} = P.pl;
  let s = segs[segs.length - 1];
  for (const x of segs) if (T < x.T0 + x.d) {
   s = x;
   break;
  }
  const u = T - s.T0;
  if (s.k === 'full') return {
   t: s.a + u,
   zoom: 1
  };
  if (s.k === 'card') return {
   t: P.pl.hs,
   zoom: 1,
   card: clampN(u / CARD, 0, 1)
  };
  if (s.k === 'slow') {
   const t = s.a + u * SLOW, e = clampN(Math.min(u, s.d - u) / 450, 0, 1);
   return {
    t: t,
    zoom: 1 + (ZOOM - 1) * e * e * (3 - 2 * e),
    tag: 'SLOW-MO'
   };
  }
  return {
   t: P.pl.he,
   zoom: 1,
   tag: 'REPLAY'
  };
 }
 function drawAt(P, T, cv2) {
  const st = stateAt(P, T), F = workFrame(P.clip.frames, st.t), f = focusOf(F);
  if (f) {
   if (P.fx == null || st.zoom <= 1.001) {
    P.fx = f.x;
    P.fy = f.y;
   } else {
    P.fx += (f.x - P.fx) * .18;
    P.fy += (f.y - P.fy) * .18;
   }
  }
  drawClipFrame(cv2, P.clip, F, {
   zoom: st.zoom,
   fx: P.fx,
   fy: P.fy,
   tag: st.tag,
   card: st.card,
   t: T
  });
  return st;
 }
 const UI = {
  el: null,
  cv: null,
  st: null,
  P: null,
  raf: 0,
  ids: [],
  i: 0,
  from: null,
  exp: null,
  file: null,
  url: null
 };
 const BTN = 'font:inherit;font-size:12px;min-height:44px;min-width:56px;padding:6px 10px;border:0;border-radius:3px;box-shadow:0 2px 0 #000;background:#3a4a55;color:#cfe;text-transform:uppercase;flex:0 0 auto;';
 function pcss() {
  if (document.getElementById('clip35css')) return;
  const s = document.createElement('style');
  s.id = 'clip35css';
  s.textContent = '#clip35{position:fixed;inset:0;z-index:96;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;background:#05080b;color:#cfe;font:bold 11px/1.2 "Courier New",ui-monospace,monospace;text-transform:uppercase;touch-action:manipulation;' + 'padding:calc(4px + env(safe-area-inset-top)) calc(6px + env(safe-area-inset-right)) max(4px, var(--sab2403,0px), env(safe-area-inset-bottom)) calc(6px + env(safe-area-inset-left));box-sizing:border-box;-webkit-user-select:none;user-select:none}' + '#clip35 canvas{image-rendering:pixelated;background:#000;flex:0 0 auto;border:1px solid #22313d}#clip35 .r{display:flex;gap:6px;align-items:center;justify-content:center;flex:0 0 auto;flex-wrap:nowrap;max-width:100%}' + '#clip35 .i{flex:0 0 auto;font-size:10px;color:#8fe3f0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}#clip35 button.y{background:#ffd23a;color:#0b1a20}#clip35 button.g{background:#7dff7a;color:#0b1a20}#clip35 button:disabled{opacity:.45}' + '#clip35 a.dl{color:#0b1a20;background:#8fe3f0;text-decoration:none;display:inline-flex;align-items:center}';
  document.head.appendChild(s);
 }
 function fit() {
  if (!UI.el || !UI.cv) return;
  const P = UI.P, cw = P && P.clip.meta.W || W, cs = getComputedStyle(UI.el);
  let used = 0;
  for (const c of UI.el.children) if (c !== UI.cv && c.offsetHeight) used += c.offsetHeight + 4;
  const vw = UI.el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 2, vh = UI.el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - used - 6;
  const k = Math.max(.1, Math.min(vw / cw, vh / H));
  UI.cv.style.width = Math.floor(cw * k) + 'px';
  UI.cv.style.height = Math.floor(H * k) + 'px';
 }
 function mk(tag, attrs, txt) {
  const e = document.createElement(tag);
  for (const k in attrs || {}) e.setAttribute(k, attrs[k]);
  if (txt != null) e.textContent = txt;
  return e;
 }
 function openPlayer(ids, i, from) {
  if (!clipOn()) return;
  pcss();
  closePlayer(true);
  UI.ids = ids.slice();
  UI.i = clampN(i || 0, 0, Math.max(0, ids.length - 1));
  UI.from = from || 'locker';
  const el = mk('div', {
   id: 'clip35',
   role: 'dialog',
   'aria-label': 'CLIP PLAYER'
  });
  const info = mk('div', {
   class: 'i',
   id: 'clip35i'
  }, 'LOADING CLIP...');
  const cv = mk('canvas', {
   id: 'clip35cv',
   width: '10',
   height: '10'
  });
  const row = mk('div', {
   class: 'r'
  });
  const b = (id, lab, fn, cls) => {
   const x = mk('button', {
    id: id,
    type: 'button',
    class: cls || ''
   }, lab);
   x.style.cssText = BTN;
   x.addEventListener('click', ev => {
    ev.preventDefault();
    ev.stopPropagation();
    try {
     SFX.tap && SFX.tap();
    } catch (e) {}
    fn();
   });
   row.appendChild(x);
   return x;
  };
  b('clip35x', 'X CLOSE', () => closePlayer());
  b('clip35r', 'REPLAY', () => {
   if (UI.P) {
    UI.P.T = 0;
    UI.P.t0 = pnow();
    UI.P.done = false;
    UI.P.fx = null;
   }
  });
  b('clip35p', '< OLDER', () => step(1));
  b('clip35n', 'NEWER >', () => step(-1));
  b('clip35v', 'SAVE VIDEO', () => exportNow(), 'y');
  const st = mk('div', {
   class: 'r',
   id: 'clip35s'
  });
  el.appendChild(info);
  el.appendChild(cv);
  el.appendChild(row);
  el.appendChild(st);
  el.addEventListener('pointerdown', ev => ev.stopPropagation());
  el.addEventListener('touchstart', ev => ev.stopPropagation(), {
   passive: true
  });
  document.body.appendChild(el);
  UI.el = el;
  UI.cv = cv;
  UI.st = st;
  window.addEventListener('resize', fit);
  show(UI.i);
 }
 function navState() {
  const p = document.getElementById('clip35p'), n = document.getElementById('clip35n');
  if (p) p.disabled = UI.i >= UI.ids.length - 1;
  if (n) n.disabled = UI.i <= 0;
 }
 function step(d) {
  const j = UI.i + d;
  if (j < 0 || j >= UI.ids.length || UI.exp && UI.exp.on) return;
  show(j);
 }
 async function show(i) {
  UI.i = i;
  navState();
  setFile(null);
  UI.P = null;
  const id = UI.ids[i], info = document.getElementById('clip35i');
  if (!id) {
   if (info) info.textContent = 'NO CLIPS YET - TAP CLIP (TOP BAR) IN A GAME';
   const v = document.getElementById('clip35v');
   if (v) v.disabled = true;
   return;
  }
  if (info) info.textContent = 'LOADING CLIP...';
  let clip = null;
  try {
   clip = await getClip(id);
  } catch (e) {
   err(e, 'load');
  }
  if (UI.ids[UI.i] !== id || !UI.el) return;
  if (!clip || !clip.frames || !clip.frames.length) {
   if (info) info.textContent = 'THIS CLIP COULD NOT BE LOADED';
   return;
  }
  const m = clip.meta;
  if (info) info.textContent = clipLine(m) + '  (' + (UI.i + 1) + '/' + UI.ids.length + ')';
  UI.P = {
   clip: clip,
   pl: plan(m, clip.frames),
   T: 0,
   t0: pnow(),
   done: false,
   fx: null,
   fy: null
  };
  const v = document.getElementById('clip35v');
  if (v) v.disabled = false;
  fit();
  loop();
 }
 function loop() {
  cancelAnimationFrame(UI.raf);
  const tick = () => {
   if (!UI.el || !UI.P) return;
   const P = UI.P;
   if (!(UI.exp && UI.exp.on)) {
    P.T = Math.min(P.pl.total, pnow() - P.t0);
    drawAt(P, P.T, UI.cv);
    P.last = P.T;
    if (P.T >= P.pl.total) P.done = true;
   }
   UI.raf = requestAnimationFrame(tick);
  };
  UI.raf = requestAnimationFrame(tick);
 }
 function closePlayer(quiet) {
  cancelAnimationFrame(UI.raf);
  UI.raf = 0;
  if (UI.exp && UI.exp.rec) {
   try {
    UI.exp.cancel = true;
    UI.exp.rec.state !== 'inactive' && UI.exp.rec.stop();
   } catch (e) {}
  }
  UI.exp = null;
  setFile(null);
  if (UI.el) {
   UI.el.remove();
   UI.el = null;
   UI.cv = null;
   UI.P = null;
   window.removeEventListener('resize', fit);
  }
  if (!quiet) {
   try {
    panelDirty();
   } catch (e) {}
  }
 }
 function fmtDate(t) {
  const d = new Date(t), mo = [ 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC' ][d.getMonth()];
  let h = d.getHours();
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return mo + ' ' + d.getDate() + ' ' + h + ':' + String(d.getMinutes()).padStart(2, '0') + ' ' + ap;
 }
 function clipLine(m) {
  return (m.ua || '?') + ' ' + ((m.sc || [])[0] || 0) + ' - ' + ((m.sc || [])[1] || 0) + ' ' + (m.oa || '?') + ' | ' + (m.moment || 'PLAY') + (m.online ? ' | ONLINE' : '') + ' | ' + fmtDate(m.at || Date.now());
 }
 function vtype() {
  if (typeof MediaRecorder === 'undefined' || typeof HTMLCanvasElement.prototype.captureStream !== 'function') return null;
  for (const t of [ 'video/mp4;codecs=avc1.42E01E', 'video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm' ]) {
   try {
    if (MediaRecorder.isTypeSupported(t)) return t;
   } catch (e) {}
  }
  return null;
 }
 function setStatus(nodes) {
  if (!UI.st) return;
  UI.st.textContent = '';
  for (const n of nodes) UI.st.appendChild(typeof n === 'string' ? mk('span', {
   class: 'i'
  }, n) : n);
  fit();
 }
 function setFile(f) {
  if (UI.url) {
   try {
    URL.revokeObjectURL(UI.url);
   } catch (e) {}
  }
  UI.url = null;
  UI.file = f;
  if (!f && UI.st) UI.st.textContent = '';
 }
 function exportNow() {
  const P = UI.P;
  if (!P || UI.exp && UI.exp.on) return;
  const type = vtype();
  if (!type) {
   setStatus([ 'THIS BROWSER CAN\'T MAKE VIDEOS - OPEN BAGGA LAX IN SAFARI ON YOUR IPHONE' ]);
   LOG.exp.push({
    ok: false,
    why: 'no MediaRecorder'
   });
   return;
  }
  const m = P.clip.meta, cw = Math.round((m.W || W) * RR), vw = 1280, vh = Math.round(vw * H / (m.W || W) / 2) * 2;
  const ex = document.createElement('canvas');
  ex.width = vw;
  ex.height = vh;
  const ec = ex.getContext('2d');
  const src = document.createElement('canvas');
  let stream, rec;
  const chunks = [];
  try {
   stream = ex.captureStream(30);
   rec = new MediaRecorder(stream, {
    mimeType: type,
    videoBitsPerSecond: 6e6
   });
  } catch (e) {
   setStatus([ 'VIDEO COULD NOT START: ' + String(e && e.message || e).slice(0, 60) ]);
   LOG.exp.push({
    ok: false,
    why: String(e)
   });
   return;
  }
  const E = UI.exp = {
   on: true,
   rec: rec,
   type: type,
   cancel: false,
   t0: pnow()
  };
  const vb = document.getElementById('clip35v');
  if (vb) vb.disabled = true;
  navState();
  rec.ondataavailable = ev => {
   if (ev.data && ev.data.size) chunks.push(ev.data);
  };
  rec.onstop = () => {
   E.on = false;
   if (vb) vb.disabled = false;
   try {
    stream.getTracks().forEach(t => t.stop());
   } catch (e) {}
   if (E.cancel || UI.exp !== E) return;
   const mime = type.split(';')[0], ext = /mp4/.test(mime) ? 'mp4' : 'webm', blob = new Blob(chunks, {
    type: mime
   });
   const name = 'bagga-lax-clip-' + new Date(m.at || Date.now()).toISOString().slice(0, 16).replace(/[-:T]/g, '') + '.' + ext;
   let file = null;
   try {
    file = new File([ blob ], name, {
     type: mime
    });
   } catch (e) {
    file = blob;
    file.name = name;
   }
   setFile(file);
   UI.url = URL.createObjectURL(blob);
   LOG.exp.push({
    ok: true,
    type: mime,
    bytes: blob.size,
    ms: Math.round(pnow() - E.t0),
    name: name
   });
   window.__v35lastVideo = {
    blob: blob,
    name: name,
    type: mime
   };
   const nodes = [], canShare = !!(navigator.share && navigator.canShare && (() => {
    try {
     return navigator.canShare({
      files: [ file ]
     });
    } catch (e) {
     return false;
    }
   })());
   if (canShare) {
    const s = mk('button', {
     id: 'clip35sh',
     type: 'button',
     class: 'g'
    }, 'SAVE TO PHOTOS / SHARE');
    s.style.cssText = BTN + 'background:#7dff7a;color:#0b1a20';
    s.addEventListener('click', ev => {
     ev.preventDefault();
     ev.stopPropagation();
     shareNow();
    });
    nodes.push(s);
   }
   const a = mk('a', {
    id: 'clip35dl',
    class: 'dl',
    href: UI.url,
    download: name
   }, 'DOWNLOAD');
   a.style.cssText = BTN + 'background:#8fe3f0;color:#0b1a20;text-decoration:none;display:inline-flex;align-items:center';
   nodes.push(a);
   a.addEventListener('click', () => {
    setTimeout(() => {
     try {
      savedAsk('download');
     } catch (e) {}
    }, 400);
   });
   nodes.push((ext === 'mp4' ? 'MP4' : 'WEBM') + ' ' + Math.max(1, Math.round(blob.size / 1024)) + ' KB' + (canShare ? '' : ' - TAP DOWNLOAD, THEN SAVE'));
   setStatus(nodes);
   UI.P.t0 = pnow() - UI.P.pl.total;
  };
  setStatus([ 'MAKING THE VIDEO... 0%' ]);
  rec.start(250);
  const t0 = pnow();
  let lastPct = -1;
  const tick = () => {
   if (UI.exp !== E || E.cancel) return;
   const T = pnow() - t0, done = T >= P.pl.total;
   drawAt(P, Math.min(T, P.pl.total), src);
   ec.imageSmoothingEnabled = true;
   ec.fillStyle = '#000';
   ec.fillRect(0, 0, vw, vh);
   ec.drawImage(src, 0, 0, src.width, src.height, 0, 0, vw, vh);
   if (UI.cv) {
    const c2 = UI.cv.getContext('2d');
    if (UI.cv.width !== src.width) UI.cv.width = src.width;
    if (UI.cv.height !== src.height) UI.cv.height = src.height;
    c2.drawImage(src, 0, 0);
   }
   const pct = Math.floor(Math.min(1, T / P.pl.total) * 100);
   if (pct !== lastPct && pct % 5 === 0) {
    lastPct = pct;
    setStatus([ 'MAKING THE VIDEO... ' + pct + '%' ]);
   }
   if (done) {
    setTimeout(() => {
     try {
      rec.state !== 'inactive' && rec.stop();
     } catch (e) {}
    }, 120);
    return;
   }
   requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
 }
 function shareNow() {
  const f = UI.file;
  if (!f) return;
  LOG.share.push({
   t: Math.round(pnow()),
   name: f.name,
   type: f.type,
   size: f.size
  });
  try {
   const p = navigator.share({
    files: [ f ],
    title: 'BAGGA LAX CLIP'
   });
   if (p && p.then) p.then(() => {
    savedAsk('share');
   }, e => {
    LOG.share.push({
     err: String(e && e.name || e)
    });
   });
  } catch (e) {
   LOG.share.push({
    err: String(e)
   });
  }
 }
 const delOn = () => clipOn() && !window.__rl_no35clipdel;
 function savedAsk(how) {
  if (!delOn() || !UI.el || !UI.st || !UI.P) return;
  const id = UI.ids[UI.i];
  if (!id || document.getElementById('clip35dq')) return;
  LOG.del35.push({
   ask: id,
   how: how
  });
  const prev = [ ...UI.st.childNodes ];
  const q = mk('span', {
   class: 'i',
   id: 'clip35dq'
  }, 'SAVED! DELETE FROM CLIPS?');
  const y = mk('button', {
   id: 'clip35dy',
   type: 'button'
  }, 'YES');
  y.style.cssText = BTN + 'background:#ff5a4a;color:#fff';
  const k = mk('button', {
   id: 'clip35dk',
   type: 'button'
  }, 'KEEP');
  k.style.cssText = BTN + 'background:#7dff7a;color:#0b1a20';
  y.addEventListener('click', ev => {
   ev.preventDefault();
   ev.stopPropagation();
   if (y.disabled) return;
   y.disabled = k.disabled = true;
   LOG.del35.push({
    yes: id
   });
   delClip(id).then(() => {
    if (UI.el && UI.ids[UI.i] === id) closePlayer();
   }, e => {
    err(e, 'del35');
    y.disabled = k.disabled = false;
   });
  });
  k.addEventListener('click', ev => {
   ev.preventDefault();
   ev.stopPropagation();
   LOG.del35.push({
    keep: id
   });
   setStatus(prev);
  });
  setStatus([ q, y, k ]);
 }
 const LK = {
  on: false,
  del: null
 };
 const escH = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
 }[c]));
 function lockBody() {
  const L = listNow(), kb = Math.round(DB.bytes / 1024);
  let h = '<div class="det17" id="clip35det"><b>CLIPS</b> ' + L.length + ' / ' + MAXC + (L.length ? ' - ' + (kb >= 1024 ? (kb / 1024).toFixed(1) + ' MB' : kb + ' KB') : '') + '. TAP CLIP (TOP BAR, NEXT TO THE SCORE) IN ANY GAME TO SAVE THE LAST PLAY. ' + MAXC + ' MAX - A NEW ONE REPLACES THE OLDEST.</div>';
  let b = '';
  if (!L.length) b = '<div class="cf" id="clip35none" style="padding:10px 4px;color:#8fe3f0">' + (DB.list ? 'NO CLIPS YET' : 'LOADING...') + '</div>'; else if (delOn()) {
   const by = DB.bytes || 0, sz = by >= 1048576 ? (by / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(by / 1024)) + ' KB';
   b = '<div id="clip35hdr" style="padding:4px 2px 5px;color:#ffe14d;font-size:12px;border-bottom:1px solid #22313d">' + L.length + ' CLIP' + (L.length === 1 ? '' : 'S') + ' · ' + sz + '</div>';
  }
  for (const m of L) {
   const sure = LK.del === m.id;
   b += '<div class="row" data-clip="' + escH(m.id) + '" style="display:flex;align-items:center;gap:6px;padding:3px 2px;border-bottom:1px solid #22313d;flex-wrap:nowrap">' + '<span class="note" style="flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + escH(clipLine(m)) + ' | ' + Math.max(1, Math.round((m.size || 0) / 1024)) + ' KB</span>' + '<button type="button" data-a="v35clip" data-v="play:' + escH(m.id) + '" class="y" style="min-height:40px;min-width:54px">PLAY</button>' + '<button type="button" data-a="v35clip" data-v="vid:' + escH(m.id) + '" style="min-height:40px;min-width:54px">VIDEO</button>' + '<button type="button" data-a="v35clip" data-v="' + (sure ? 'delok:' : 'del:') + escH(m.id) + '" style="min-height:40px;min-width:54px;' + (sure ? 'background:#ff5a4a;color:#fff' : delOn() ? 'background:#4a1414;color:#ff9a8a;box-shadow:inset 0 0 0 2px #ff5a4a' : '') + '">' + (sure ? 'SURE?' : 'DELETE') + '</button></div>';
  }
  return {
   det: h,
   body: b
  };
 }
 function hookLocker() {
  if (typeof PANEL_RENDER === 'undefined' || !PANEL_RENDER.locker17 || PANEL_RENDER.locker17.__v35) return;
  const R0 = PANEL_RENDER.locker17;
  const R1 = function() {
   let h = R0.apply(this, arguments);
   if (!clipOn()) {
    LK.on = false;
    return h;
   }
   try {
    const tb = '<button type="button" data-a="v35clip" data-v="tab" class="' + (LK.on ? 'on' : 'd') + '" aria-label="CLIPS">CLIPS</button>';
    const m = h.match(/<button type="button" data-a="v29myt"[^>]*>MY TEAMS<\/button>/) || h.match(/<button type="button" data-a="v17sec" data-v="all"[^>]*>ALL<\/button>/);
    if (!m) return h;
    h = h.replace(m[0], m[0] + tb);
    if (!LK.on) return h;
    h = h.replace(/(data-a="v17sec" data-v="[^"]*") class="on"/g, '$1 class="d"').replace(/(data-a="v29myt") class="on"/g, '$1 class="d"');
    const cut = h.indexOf('<div class="scroll" id="lockList">');
    if (cut < 0) return h;
    let pre = h.slice(0, cut);
    const r = lockBody();
    pre = pre.replace(/<div class="det17">[\s\S]*?<\/div>$/, '') + r.det;
    return pre + '<div class="scroll" id="lockList">' + r.body + '</div>';
   } catch (e) {
    err(e, 'locker');
    return h;
   }
  };
  R1.__v35 = true;
  PANEL_RENDER.locker17 = R1;
  if (typeof PANEL_ACT !== 'undefined') {
   for (const a of [ 'v17sec', 'v29myt' ]) {
    const s0 = PANEL_ACT[a];
    if (s0 && !s0.__v35) {
     const s1 = function() {
      LK.on = false;
      LK.del = null;
      return s0.apply(this, arguments);
     };
     s1.__v35 = true;
     PANEL_ACT[a] = s1;
    }
   }
   PANEL_ACT.v35clip = v => {
    const [k, id] = String(v).split(/:(.*)/s);
    if (k === 'tab') {
     try {
      if (PANEL_ACT.v17sec) PANEL_ACT.v17sec('all');
     } catch (e) {}
     LK.on = true;
     LK.del = null;
     listNow();
     try {
      const l = document.getElementById('lockList');
      if (l) l.scrollTop = 0;
     } catch (e) {}
     panelDirty();
     return;
    }
    const ids = allIds(), i = Math.max(0, ids.indexOf(id));
    if (k === 'play') {
     LK.del = null;
     openPlayer(ids, i, 'locker');
     return;
    }
    if (k === 'vid') {
     LK.del = null;
     openPlayer(ids, i, 'locker');
     const go = () => {
      if (UI.P && UI.ids[UI.i] === id) exportNow(); else if (UI.el) setTimeout(go, 120);
     };
     setTimeout(go, 60);
     return;
    }
    if (k === 'del') {
     LK.del = id;
     panelDirty();
     return;
    }
    if (k === 'delok') {
     LK.del = null;
     delClip(id).catch(e => err(e, 'del'));
     return;
    }
   };
  }
 }
 function allIds() {
  const ids = (DB.list || []).map(m => m.id), extra = [ ...MEM.values() ].filter(c => c.meta && !ids.includes(c.meta.id) && c.meta.size == null).sort((a, b) => b.meta.at - a.meta.at).map(c => c.meta.id);
  return extra.concat(ids);
 }
 const CB = {
  w: 22,
  h: 13,
  y: 2
 };
 function clipBtnX() {
  return W - 92 - 1 - 4 - CB.w;
 }
 function showBtn() {
  const G = game;
  return clipOn() && !!G && !paused && !G.tutorial && G.mode !== 'practice' && G.mode !== 'tutorial' && CAP_SCR.includes(screen);
 }
 function drawClipBtn() {
  const x = clipBtnX(), y = CB.y, w = CB.w, h = CB.h, t = cnow();
  hit('CLIP', x - 1, 0, w + 2, 16, () => tapClip(), 'CLIP');
  rect(x, y + 1, w, h - 1, '#000');
  rect(x, y, w, h - 1, 'rgba(40,50,60,.9)');
  const F = CAP.flash && t - CAP.flash.t < 1400 ? CAP.flash : null;
  if (CAP.pend) {
   if (Math.floor(t / 250) % 2) rect(x + 2, y + 4, 3, 3, '#ff3b30');
   text('REC', x + 7, y + 3, 1, '#ff9a8a');
  } else if (F && F.s === 'SAVED') text('SAVED', x + w / 2, y + 3, 1, '#7dff7a', 'center'); else if (F) text(F.s, x + w / 2, y + 3, 1, '#ffb14d', 'center'); else {
   rect(x + 2, y + 4, 3, 3, '#ff3b30');
   text('CLIP', x + 6, y + 3, 1, '#cfe');
  }
  if (CAP.warn && t - CAP.warn.t < 3e3) {
   const s = 'MAX ' + MAXC + ' CLIPS: OLDEST DELETED';
   rect(W - 2 - textW(s) - 4, 22, textW(s) + 4, 8, 'rgba(0,0,0,.7)');
   text(s, W - 4, 23, 1, '#ffb14d', 'right');
  }
 }
 const PERF = {
  on: false,
  rs: [],
  cs: []
 };
 function post35() {
  if (!clipOn()) return;
  pendTick();
  if (showBtn()) drawClipBtn();
  if (capOk()) capture();
 }
 function hookRender() {
  const R0 = window.render;
  if (typeof R0 !== 'function' || R0.__v35) return;
  const R1 = function() {
   const t0 = PERF.on ? pnow() : 0;
   const r = R0.apply(this, arguments);
   const t1 = PERF.on ? pnow() : 0;
   try {
    post35();
   } catch (e) {
    err(e, 'cap');
   }
   if (PERF.on) {
    PERF.rs.push(t1 - t0);
    PERF.cs.push(pnow() - t1);
    if (PERF.rs.length > 3e3) {
     PERF.rs.shift();
     PERF.cs.shift();
    }
   }
   try {
    if (askOn()) naTick();
   } catch (e) {
    err(e, 'na');
   }
   return r;
  };
  R1.__v35 = true;
  window.render = R1;
 }
 function hookPause() {
  const D0 = window.drawPause;
  if (typeof D0 !== 'function' || D0.__v35) return;
  const D1 = function() {
   const r = D0.apply(this, arguments);
   try {
    const G = game, online = !!(G && (G.online || G.meta && G.meta.online)) || !!(window.RLNET && RLNET.inGame);
    if (clipOn() && !pauseSet && G && !online && !G.tutorial && !(window.V38H && V38H.noPauseClips())) button('CLIPS', W / 2 + 66, 80, 50, 20, () => {
     listNow();
     const go = () => openPlayer(allIds(), 0, 'pause');
     if (DB.list) go(); else (DB.loading || loadList()).then(go, go);
    }, {
     bg: '#ff9a3d',
     sc: 1
    });
   } catch (e) {
    err(e, 'pause');
   }
   return r;
  };
  D1.__v35 = true;
  window.drawPause = D1;
 }
 function naInSeason() {
  try {
   if (!window.V232 || !V232.sChoice || !V232.naTeams) return [];
   const c = V232.sChoice();
   if (!c || !c.na) return [];
   let na = V232.naTeams().slice();
   if (window.V33 && V33.eff && V33.onPick && V33.onPick()) {
    const e = V33.eff('pro');
    if (e && Array.isArray(e.na)) na = na.filter(id => e.na.includes(id));
   }
   return na.filter(id => {
    try {
     return !!T(id);
    } catch (e) {
     return false;
    }
   });
  } catch (e) {
   err(e, 'naSeason');
   return [];
  }
 }
 function hookSeasonPick() {
  if (window.V232 && V232.seasonPickOpts && !V232.seasonPickOpts.__v35) {
   const S0 = V232.seasonPickOpts;
   V232.seasonPickOpts = function() {
    const o = S0.apply(this, arguments) || {};
    if (!askOn()) return o;
    const na = naInSeason();
    if (!na.length) return o;
    LOG.na.push([ 'season', na.join(',') ]);
    if (LOG.na.length > 20) LOG.na.shift();
    return Object.assign({}, o, {
     na35: na
    }, o.only ? {
     only: o.only.concat(na)
    } : {});
   };
   V232.seasonPickOpts.__v35 = true;
  }
  if (window.V33 && V33.proTiles && !V33.proTiles.__v35) {
   const P0 = V33.proTiles;
   V33.proTiles = function(opts) {
    const r = P0.apply(this, arguments) || [];
    if (!askOn() || !opts || !Array.isArray(opts.na35) || opts.pool) return r;
    return r.concat(opts.na35.map(id => T(id)).filter(t => t && !r.includes(t)));
   };
   V33.proTiles.__v35 = true;
  }
 }
 const NA = {
  scr: null,
  asked: null,
  pre: null,
  code: null,
  sent: null,
  busy: false
 };
 const SNx = () => window.RLNET && RLNET.season || null;
 function ghOwned35() {
  try {
   return !!(window.V17 && V17.hw16 && V17.hw16.owned());
  } catch (e) {
   return false;
  }
 }
 function naKind() {
  try {
   if (!window.T232 || !T232.on || !T232.on()) return null;
   const k = T232.kind();
   return k && (k.k === 'pro' || k.k === 'wg') ? k.k : null;
  } catch (e) {
   return null;
  }
 }
 function naTeams35() {
  try {
   return window.V232 && V232.naTeams ? V232.naTeams() : [];
  } catch (e) {
   return [];
  }
 }
 function myMem() {
  const SN = SNx(), L0 = SN && SN.lobby;
  return L0 && (L0.members || []).find(m => m.me) || null;
 }
 function others() {
  const SN = SNx(), L0 = SN && SN.lobby;
  return (L0 && L0.members || []).filter(m => m.team && !m.me);
 }
 function naVisitKey() {
  const SN = SNx();
  return SN && SN.code || 'new';
 }
 function naTick() {
  const s = screen;
  if (s !== NA.scr) {
   NA.scr = s;
   if (s === 'onSeasonTeam') NA.asked = null;
  }
  if (s === 'onSeasonTeam') {
   if (NA.asked || document.getElementById('na35')) return;
   const k = naKind();
   if (!k || !ghOwned35() || !naTeams35().length) return;
   const me = myMem();
   if (me && typeof me.na232 === 'boolean') {
    NA.asked = 'lobby';
    NA.pre = me.na232;
    NA.code = naVisitKey();
    return;
   }
   NA.asked = 'box';
   const def = NA.code === naVisitKey() && typeof NA.pre === 'boolean' ? NA.pre : false;
   askBox35('na35', 'N/A TEAMS?', 'THE NEW ORLEANS GHOSTS. YES = YOU CAN PICK ONE AS YOUR TEAM (EVERYONE IN THE ROOM HAS TO SAY YES). YOU CAN CHANGE IT IN THE LOBBY.', def, v => {
    NA.pre = v;
    NA.code = naVisitKey();
    NA.sent = null;
    LOG.ask.push([ 'na', v, NA.code ]);
   });
   return;
  }
  const SN = SNx();
  if (typeof NA.pre === 'boolean' && SN && !SN.S && SN.code && SN.lobby && SN.lobby.me && !NA.busy) {
   if (NA.code === 'new') NA.code = SN.code;
   if (NA.code !== SN.code) return;
   const me = myMem();
   if (!me || me.na232 === NA.pre || NA.sent === SN.code + '|' + NA.pre) return;
   NA.busy = true;
   NA.sent = SN.code + '|' + NA.pre;
   Promise.resolve(RLNET.call('/season/' + SN.code + '/team', {
    team: SN.lobby.me,
    na232: NA.pre
   })).then(r => {
    if (r && r.ok) SN.lobby = Object.assign(SN.lobby || {}, r);
    LOG.ask.push([ 'naSent', NA.pre, !!(r && r.ok) ]);
    return RLNET.seasonFetch && RLNET.seasonFetch();
   }).catch(e => err(e, 'naSend')).finally(() => {
    NA.busy = false;
   });
  }
 }
 function hookOnlinePick() {
  if (!window.T232 || !T232.pickOpts || T232.pickOpts.__v35) return;
  const P0 = T232.pickOpts;
  T232.pickOpts = function(taken) {
   const r = P0.apply(this, arguments);
   try {
    if (!askOn() || NA.pre !== true || NA.code !== naVisitKey() && !(NA.code === 'new' && !(SNx() || {}).code)) return r;
    const k = naKind();
    if (!k || !ghOwned35()) return r;
    if (T232.naAll && T232.naAll()) return r;
    if (!others().every(m => m.na232 === true)) return r;
    const na = naTeams35();
    if (!na.length) return r;
    const base = k === 'wg' ? WTEAMS.map(t => t.id) : TEAMS.map(t => t.id);
    const ids = base.concat(na).filter(id => !(taken || []).includes(id));
    LOG.na.push([ 'online', k, ids.length ]);
    return {
     pool: ids.map(id => T(id)).filter(Boolean),
     back: r && r.back || (() => {
      const SN = SNx();
      screen = SN && SN.lobby && SN.lobby.me ? 'onSeason' : 'online';
     })
    };
   } catch (e) {
    err(e, 'naPick');
    return r;
   }
  };
  T232.pickOpts.__v35 = true;
 }
 function askBox35(id, title, sub, def, onPick) {
  if (document.getElementById(id)) return null;
  const d = document.createElement('div');
  d.id = id;
  d.style.cssText = 'position:fixed;inset:0;z-index:87;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.66);font:bold 11px/1.25 "Courier New",ui-monospace,monospace;text-transform:uppercase;color:#cfe;touch-action:manipulation;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);box-sizing:border-box';
  const box = document.createElement('div');
  box.style.cssText = 'background:#14222b;border-top:2px solid #ffcc33;box-shadow:0 3px 0 #000;padding:8px 12px 10px;max-width:92%;text-align:center;box-sizing:border-box';
  const h = document.createElement('div');
  h.textContent = title;
  h.style.cssText = 'color:#ffcc33;font-size:15px;text-shadow:2px 2px 0 #000;margin-bottom:3px';
  box.appendChild(h);
  const s = document.createElement('div');
  s.textContent = sub;
  s.style.cssText = 'color:#cfe;font-size:10px;margin-bottom:8px';
  box.appendChild(s);
  const row = document.createElement('div');
  row.style.cssText = 'display:flex;gap:10px;justify-content:center';
  for (const [lab, v] of [ [ 'YES', true ], [ 'NO', false ] ]) {
   const b = document.createElement('button');
   b.id = id + (v ? 'y' : 'n');
   b.type = 'button';
   b.textContent = lab;
   b.style.cssText = 'font:inherit;font-size:13px;min-width:92px;min-height:44px;padding:8px 10px;border:0;box-shadow:0 2px 0 #000;' + (v === def ? 'background:#ffd23a;color:#0b1a20' : 'background:#3a4a55;color:#cfe');
   b.addEventListener('click', ev => {
    ev.preventDefault();
    ev.stopPropagation();
    d.remove();
    try {
     SFX.tap && SFX.tap();
    } catch (e) {}
    onPick(v);
   });
   row.appendChild(b);
  }
  box.appendChild(row);
  d.appendChild(box);
  document.body.appendChild(d);
  return d;
 }
 function qbOpen(needC, needQ, then, playLab) {
  if (document.getElementById('qb35')) return;
  const rows = [];
  if (needC) rows.push({
   k: 'cp',
   lab: 'CARD PLAYERS',
   sub: 'YOUR PLAYER + LEGACY CARDS CAN BE SUBBED IN',
   v: !!V332.cardsDef35()
  });
  if (needQ) {
   rows.push({
    k: 'fx',
    lab: 'ITEM EFFECTS',
    sub: 'GEAR, STICKS + TEAM CREW WORK (NO = LOOKS ONLY, BOTH TEAMS)',
    v: !!V333Q.fxGet()
   });
   rows.push({
    k: 'tp',
    lab: '2-POINTERS',
    sub: 'GOALS FROM OUTSIDE THE DOTTED ARC COUNT 2',
    v: !!V333Q.tpGet()
   });
  }
  const d = document.createElement('div');
  d.id = 'qb35';
  d.style.cssText = 'position:fixed;inset:0;z-index:87;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.66);font:bold 11px/1.25 "Courier New",ui-monospace,monospace;text-transform:uppercase;color:#cfe;touch-action:manipulation;padding:calc(4px + env(safe-area-inset-top)) env(safe-area-inset-right) max(4px, var(--sab2403,0px), env(safe-area-inset-bottom)) env(safe-area-inset-left);box-sizing:border-box';
  const box = document.createElement('div');
  box.style.cssText = 'background:#14222b;border-top:2px solid #ffcc33;box-shadow:0 3px 0 #000;padding:6px 12px 8px;max-width:96%;max-height:100%;overflow:auto;text-align:center;box-sizing:border-box';
  const h = document.createElement('div');
  h.textContent = 'QUICK GAME';
  h.style.cssText = 'color:#ffcc33;font-size:15px;text-shadow:2px 2px 0 #000;margin-bottom:4px';
  box.appendChild(h);
  const paint = r => {
   r.y.style.background = r.v ? '#ffd23a' : '#3a4a55';
   r.y.style.color = r.v ? '#0b1a20' : '#cfe';
   r.n.style.background = !r.v ? '#ffd23a' : '#3a4a55';
   r.n.style.color = !r.v ? '#0b1a20' : '#cfe';
   r.y.setAttribute('aria-pressed', r.v ? 'true' : 'false');
   r.n.setAttribute('aria-pressed', r.v ? 'false' : 'true');
  };
  for (const r of rows) {
   const line = document.createElement('div');
   line.className = 'qb35r';
   line.dataset.q = r.k;
   line.style.cssText = 'display:flex;align-items:center;gap:8px;justify-content:space-between;margin:3px 0;text-align:left';
   const L = document.createElement('div');
   L.style.cssText = 'flex:1 1 auto;min-width:0';
   L.innerHTML = '<div style="color:#fff;font-size:13px">' + r.lab + '</div><div style="font-size:9px;color:#8fe3f0">' + r.sub + '</div>';
   line.appendChild(L);
   for (const [lab, v] of [ [ 'YES', true ], [ 'NO', false ] ]) {
    const b = document.createElement('button');
    b.type = 'button';
    b.id = 'qb35' + r.k + (v ? 'y' : 'n');
    b.textContent = lab;
    b.style.cssText = 'font:inherit;font-size:13px;min-width:64px;min-height:44px;padding:6px 8px;border:0;box-shadow:0 2px 0 #000;flex:0 0 auto';
    b.addEventListener('click', ev => {
     ev.preventDefault();
     ev.stopPropagation();
     r.v = v;
     paint(r);
     try {
      SFX.tap && SFX.tap();
     } catch (e) {}
    });
    line.appendChild(b);
    if (v) r.y = b; else r.n = b;
   }
   paint(r);
   box.appendChild(line);
  }
  const play = document.createElement('button');
  play.type = 'button';
  play.id = 'qb35play';
  play.textContent = playLab || 'PLAY';
  play.style.cssText = 'font:inherit;font-size:15px;width:100%;min-height:44px;margin-top:6px;border:0;box-shadow:0 2px 0 #000;background:#7dff7a;color:#0b1a20';
  play.addEventListener('click', ev => {
   ev.preventDefault();
   ev.stopPropagation();
   try {
    SFX.tap && SFX.tap();
   } catch (e) {}
   const a = {};
   for (const r of rows) a[r.k] = r.v;
   try {
    if ('cp' in a) {
     V332.cardsSet35(a.cp);
     V332.markAsked35();
    }
   } catch (e) {
    err(e, 'qbcp');
   }
   try {
    if ('fx' in a) {
     V333Q.fxSet(a.fx);
     V333Q.tpSet(a.tp);
     V333Q.markAsked35();
    }
   } catch (e) {
    err(e, 'qbfx');
   }
   LOG.qb.push(a);
   d.remove();
   then();
  });
  box.appendChild(play);
  d.appendChild(box);
  document.body.appendChild(d);
 }
 function hookQuick() {
  if (typeof window.newGame !== 'function' || window.newGame.__a35) return;
  const NG = window.newGame;
  window.newGame = function(user, opp, mode, userHome, meta) {
   if (qbOn() && mode === 'quick' && !(meta && meta.online)) {
    if (document.getElementById('qb35')) return;
    let needC = false, needQ = false;
    try {
     needC = !!(window.V332 && V332.needAsk && V332.cardsSet35 && V332.needAsk());
    } catch (e) {}
    try {
     needQ = !!(window.V333Q && V333Q.need(mode, meta));
    } catch (e) {}
    if (needC || needQ) {
     const a = arguments, self = this;
     qbOpen(needC, needQ, () => NG.apply(self, a));
     return;
    }
   }
   return NG.apply(this, arguments);
  };
  window.newGame.__a35 = true;
  if (typeof window.openLineup === 'function' && !window.openLineup.__a35) {
   const OL = window.openLineup;
   window.openLineup = function(teamId, src, back) {
    if (qbOn() && back === 'matchup') {
     if (document.getElementById('qb35')) return;
     let needC = false, needQ = false;
     try {
      needC = !!(window.V332 && V332.needAsk && V332.cardsSet35 && V332.needAsk());
     } catch (e) {}
     try {
      needQ = !!(window.V333Q && V333Q.need('quick', null));
     } catch (e) {}
     if (needC || needQ) {
      const a = arguments, self = this;
      qbOpen(needC, needQ, () => OL.apply(self, a), 'NEXT');
      return;
     }
    }
    return OL.apply(this, arguments);
   };
   window.openLineup.__a35 = true;
  }
 }
 const artOn = () => !OFF() && !window.__rl_no35art;
 function artCss() {
  let tw = 'BAGGATWAAN';
  try {
   tw = window.ULT331 && ULT331.variant && ULT331.variant('TW25-x') || tw;
  } catch (e) {}
  tw = String(tw).replace(/["\\<>]/g, '');
  const B = '#panel .c17[data-pid^="U_AA25-"] .nm', Tw = '#panel .c17[data-pid^="U_TW25-"] .nm', box = 'display:block;align-self:center;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;word-break:normal;font-size:5px;line-height:1.3;letter-spacing:0;padding:0 2px;margin:0 0 1px 0;box-sizing:border-box;';
  return [ B + '::before{content:"ALL-AMERICAN";' + box + 'order:-2;color:#fff;background:#d4202c;border-top:1px solid #2a4bb8;border-bottom:1px solid #2a4bb8}', Tw + '::before{content:"' + tw + '";' + box + 'order:-2;color:#000;background:linear-gradient(#fff2a0,#ffcc33);border:0}', B + '::after,' + Tw + '::after{content:"ULTIMATE";' + box + 'order:-1;letter-spacing:.3px;color:#000;background:linear-gradient(90deg,#ffcc33,#fff3a8,#ffcc33);border-top:1px solid #000;border-bottom:1px solid #000}', '#panel .pcard17 .c17[data-pid^="U_AA25-"] .nm::before,#panel .pcard17 .c17[data-pid^="U_TW25-"] .nm::before,#panel .pcard17 .c17[data-pid^="U_AA25-"] .nm::after,#panel .pcard17 .c17[data-pid^="U_TW25-"] .nm::after{font-size:7px}' ].concat(platCss()).join('\n');
 }
 const PLAT = {
  gold: '#e2ad1c',
  red: '#d4202c',
  gap: '#f6f8fa',
  bg: 'linear-gradient(160deg,#ffffff 0%,#e4e8ec 26%,#b8c0c8 50%,#eef1f4 70%,#c2c9d0 100%)',
  art: 'radial-gradient(circle at 50% 40%,#ffffff,#cdd3d9 55%,#76808a)'
 };
 function platCss() {
  const U = '#panel .c17.c17[data-pid^="U_"]', UT = '#panel .c17.c17[data-pid^="U_TW25-"]', UA = '#panel .c17.c17[data-pid^="U_AA25-"]';
  const D = '#tr24 .cd[data-k^="c:U_"]', DT = '#tr24 .cd[data-k^="c:U_TW25-"]', DA = '#tr24 .cd[data-k^="c:U_AA25-"]';
  const out = ',0 0 0 1px #000,0 2px 0 #000', ring = c => 'inset 0 0 0 1px ' + PLAT.gap + ',inset 0 0 0 3px ' + c;
  return [ U + '{border-color:' + PLAT.gold + ';background:' + PLAT.bg + ';box-shadow:' + out.slice(1) + ';animation:none}', U + '::after{background:linear-gradient(115deg,transparent 40%,rgba(255,255,255,.5) 47%,rgba(214,232,255,.35) 51%,transparent 58%);animation:foil17 2.2s linear infinite}', U + ' .art{background:' + PLAT.art + ';border-color:' + PLAT.gold + '}', U + ' .nm{color:#11161b}' + U + ' .rr{color:#6a4f00;font-weight:bold}' + U + ' .role17{color:#34404b}' + U + ' .bst17{color:#11721a}', UT + '{box-shadow:' + ring(PLAT.gold) + out + '}', UA + '{box-shadow:' + ring(PLAT.red) + out + '}', '#panel .pop17:has(.pcard17 .c17[data-pid^="U_"]) .pt17::before{color:' + PLAT.gold + '}', D + '{border-color:' + PLAT.gold + '!important;background:' + PLAT.bg + '!important;box-shadow:0 0 0 1px #000!important}', DT + '{box-shadow:inset 0 0 0 1px ' + PLAT.gap + ',inset 0 0 0 2px ' + PLAT.gold + ',0 0 0 1px #000!important}', DA + '{box-shadow:inset 0 0 0 1px ' + PLAT.gap + ',inset 0 0 0 2px ' + PLAT.red + ',0 0 0 1px #000!important}', D + ' .nm{color:#11161b}' + D + ' .rr{color:#6a4f00}' ];
 }
 function platFace(pid) {
  if (!artOn() || typeof pid !== 'string' || pid.indexOf('U_') !== 0 || !(window.ULT331 && ULT331.on && ULT331.on())) return null;
  const ring = pid.indexOf('U_TW25-') === 0 ? PLAT.gold : pid.indexOf('U_AA25-') === 0 ? PLAT.red : null;
  return {
   trim: PLAT.gold,
   ring: ring,
   gap: PLAT.gap,
   fill: '#d9dee3',
   txt: '#11161b',
   rr: '#6a4f00'
  };
 }
 function platTile(el, pid) {
  const f = platFace(pid);
  if (!f || !el) return;
  el.style.background = PLAT.bg;
  el.style.border = '2px solid ' + PLAT.gold;
  el.style.boxShadow = (f.ring ? 'inset 0 0 0 1px ' + PLAT.gap + ',inset 0 0 0 3px ' + f.ring + ',' : '') + '0 0 0 1px #000';
  el.dataset.plat35 = f.ring === PLAT.red ? 'aa' : f.ring ? 'tw' : 'u';
  const k = el.children;
  for (let i = 0; i < k.length; i++) {
   if (k[i].tagName === 'IMG') continue;
   k[i].style.color = i === k.length - 1 && k.length > 2 ? f.rr : f.txt;
  }
 }
 function artTick() {
  let st = document.getElementById('art35css');
  const want = artOn() && window.ULT331 && ULT331.on && ULT331.on() ? artCss() : '';
  if (!st) {
   if (!want) return;
   st = document.createElement('style');
   st.id = 'art35css';
   document.head.appendChild(st);
  }
  if (st.textContent !== want) st.textContent = want;
 }
 const B35 = {
  aa: 'chest_aa35',
  ult: 'chest_ult35'
 }, B35T = {
  chest_aa35: 'aa',
  chest_ult35: 'ult'
 };
 const chestOn = () => !OFF() && !window.__rl_no35chest && !window.__rl_v124gb;
 const CS = (() => {
  let s0 = null;
  try {
   s0 = LS.get('v35chest', null);
  } catch (e) {}
  s0 = s0 && typeof s0 === 'object' ? s0 : {};
  if (!s0.ch || typeof s0.ch !== 'object' || Array.isArray(s0.ch)) s0.ch = {};
  return s0;
 })();
 const csSave = () => {
  try {
   LS.set('v35chest', CS);
  } catch (e) {}
 };
 const bKinds = pid => {
  const s0 = String(pid || ''), o = [];
  if (/^U_/.test(s0)) o.push('ult');
  if (/^(U_)?AA25-/.test(s0)) o.push('aa');
  if (!o.includes('aa') && window.V39AW && V39AW.aaKind(s0)) o.push('aa');
  return o;
 };
 function bChosen(pid) {
  if (!chestOn()) return null;
  const k = bKinds(pid);
  if (!k.length) return null;
  const c = CS.ch[pid];
  if (c === 'none') return null;
  return c && k.includes(c) ? c : k[0];
 }
 const ownedIds = () => {
  try {
   return Object.keys(V22.st && V22.st().cards || {});
  } catch (e) {
   return [];
  }
 };
 function bElig(t) {
  return ownedIds().filter(pid => bKinds(pid).includes(t));
 }
 const b35 = {
  LOG: {
   put: [],
   off: [],
   inv: 0,
   glowFix: null
  },
  isB: id => !!B35T[id],
  eqHook(pid, e) {
   if (!chestOn() || !pid) return e;
   const c = bChosen(pid), want = c ? B35[c] : null;
   let o = e;
   if (o && o.chest && B35T[o.chest] && o.chest !== want) {
    o = Object.assign({}, o);
    delete o.chest;
   }
   if (want && !(o && o.chest)) {
    o = Object.assign({}, o || {});
    o.chest = want;
   }
   return o;
  },
  free(id) {
   const t = B35T[id];
   if (!t || !chestOn()) return 0;
   const E = bElig(t);
   return E.length - E.filter(pid => bChosen(pid) === t).length;
  },
  canWear(pid, id) {
   const t = B35T[id];
   if (!chestOn()) return 'NOT GEAR';
   if (!t || !bKinds(pid).includes(t)) return t === 'ult' ? 'ONLY AN ULTIMATE CARD CAN WEAR THE ULTIMATE BADGE' : 'ONLY AN ALL-AMERICAN CARD CAN WEAR THE ALL-AMERICAN BADGE';
   return null;
  },
  put(pid, id) {
   const t = B35T[id];
   if (!t || !bKinds(pid).includes(t)) return false;
   CS.ch[pid] = t;
   csSave();
   b35.LOG.put.push([ pid, t ]);
   b35.inv();
   return true;
  },
  off(pid) {
   if (!bKinds(pid).length) return false;
   CS.ch[pid] = 'none';
   csSave();
   b35.LOG.off.push(pid);
   b35.inv();
   return true;
  },
  chosen: bChosen,
  kinds: bKinds,
  elig: bElig,
  st: () => CS,
  inv() {
   if (!chestOn() || !window.V17 || !V17.ST) return;
   const ST = V17.ST();
   if (!ST || !ST.inv) return;
   let ch = false;
   for (const t of [ 'aa', 'ult' ]) {
    const id = B35[t], n = bElig(t).length;
    if ((ST.inv[id] | 0) !== n) {
     if (n) ST.inv[id] = n; else delete ST.inv[id];
     ch = true;
    }
    if (n && ST.seen && !ST.seen[id]) {
     ST.seen[id] = true;
     ch = true;
    }
   }
   if (ch) {
    b35.LOG.inv++;
    try {
     V17.save();
    } catch (e) {}
   }
   const own = new Set(ownedIds());
   let pr = false;
   for (const pid of Object.keys(CS.ch)) if (!own.has(pid)) {
    delete CS.ch[pid];
    pr = true;
   }
   if (pr) csSave();
  },
  addItems() {
   if (!window.V17 || !V17.BY || !V17.I) return;
   const add = it => {
    if (!V17.BY[it.id]) {
     V17.I.push(it);
     V17.BY[it.id] = it;
    }
   };
   add({
    id: B35.aa,
    n: 'ALL-AMERICAN BADGE',
    sec: 'chest',
    slot: 'chest',
    rar: 2,
    art: 'b35',
    b35: 'aa',
    col: '#d4202c',
    d: 'A SMALL RED, WHITE + BLUE BADGE ON HIS CHEST. ONLY AN ALL-AMERICAN CARD CAN WEAR IT - EACH ONE COMES WITH ITS CARD. STYLE ONLY.'
   });
   add({
    id: B35.ult,
    n: 'ULTIMATE BADGE',
    sec: 'chest',
    slot: 'chest',
    rar: 2,
    art: 'b35',
    b35: 'ult',
    col: '#ffcc33',
    d: 'A SMALL GOLD BADGE ON HIS CHEST. ONLY AN ULTIMATE CARD CAN WEAR IT - EACH ONE COMES WITH ITS CARD. STYLE ONLY.'
   });
  },
  glowFix() {
   if (!chestOn() || !window.V17 || !window.HON25 || !HON25.isTew) return 0;
   const ST = V17.ST(), gid = HON25.GLOW_ID;
   let n = 0;
   const stores = [ ST.equip, ST.mequip, ST.wequip ].concat(Object.values(ST.tequip || {}), window.V28 && V28.cardStore ? [ V28.cardStore() ] : []);
   for (const S2 of stores) if (S2 && typeof S2 === 'object') for (const pid in S2) {
    const e = S2[pid];
    if (e && typeof e === 'object' && e.chest === gid && !HON25.isTew(pid)) {
     delete e.chest;
     n++;
    }
   }
   if (n) {
    try {
     V17.save();
    } catch (e) {}
    try {
     V28.save && V28.save();
    } catch (e) {}
   }
   b35.LOG.glowFix = n;
   return n;
  },
  icon(id, sil) {
   const t = B35T[id];
   if (!t) return null;
   const key = t + (sil ? 's' : '');
   b35.IC = b35.IC || {};
   if (b35.IC[key]) return b35.IC[key];
   const c = document.createElement('canvas');
   c.width = c.height = 20;
   const x = c.getContext('2d');
   const P = t === 'aa' ? {
    rib: [ '#2a4bb8', '#d4202c' ],
    ring: '#ffffff',
    disc: '#d4202c',
    mid: '#ffffff',
    dot: '#2a4bb8'
   } : {
    rib: [ '#b8860b', '#ffcc33' ],
    ring: '#fff3a8',
    disc: '#ffcc33',
    mid: '#fff3a8',
    dot: '#a87800'
   };
   const px = (q, r, col) => {
    x.fillStyle = sil ? '#06080c' : col;
    x.fillRect(q, r, 1, 1);
   };
   for (let r = 1; r <= 7; r++) {
    px(6 + Math.floor(r / 3), r, P.rib[0]);
    px(7 + Math.floor(r / 3), r, P.rib[1]);
    px(13 - Math.floor(r / 3), r, P.rib[1]);
    px(12 - Math.floor(r / 3), r, P.rib[0]);
   }
   for (let r = 0; r < 20; r++) for (let q = 0; q < 20; q++) {
    const d = Math.hypot(q - 9.5, r - 12.5);
    if (d <= 6.2) px(q, r, d > 5 ? '#05080b' : d > 4 ? P.ring : d > 2 ? P.disc : P.mid);
   }
   if (!sil) {
    px(9, 12, P.dot);
    px(10, 12, P.dot);
    px(9, 13, P.dot);
    px(10, 13, P.dot);
    x.fillStyle = 'rgba(255,255,255,.7)';
    x.fillRect(6, 9, 1, 2);
   }
   b35.IC[key] = c;
   return c;
  },
  dbg: {
   drawn: 0,
   last: null
  }
 };
 const BPIX = {
  aa: [ [ '#2a4bb8', '#d8202c', '#d8202c' ], [ '#2a4bb8', '#ffffff', '#ffffff' ] ],
  ult: [ [ '#fff3a8', '#ffcc33', '#fff3a8' ], [ '#d19a00', '#ffcc33', '#d19a00' ] ]
 };
 const BPIX2 = {
  aa: [ [ '#2a4bb8', '#d8202c' ], [ '#2a4bb8', '#ffffff' ] ],
  ult: [ [ '#fff3a8', '#ffcc33' ], [ '#d19a00', '#ffcc33' ] ]
 };
 function bMarks(pid) {
  if (!chestOn() || !pid) return [];
  const k = bKinds(pid);
  if (!k.length) return [];
  const c = bChosen(pid), m = c ? [ c ] : [];
  if (/^U_AA25-/.test(pid) && !m.includes('aa') && !(window.V39AW && V39AW.xOff(pid))) m.push('aa');
  return m.sort((a, b) => (a === 'ult' ? 0 : 1) - (b === 'ult' ? 0 : 1));
 }
 const mSpotC = new Map;
 function mSpots(rows, name, n) {
  const key = name + '|' + n;
  if (mSpotC.has(key)) return mSpotC.get(key);
  let out = [];
  try {
   const s1 = HON25.patchSpot(rows, name);
   if (s1 && n === 1) out = [ {
    q: s1[0],
    r: s1[1],
    w: 3
   } ]; else if (s1) {
    const m = RL12.uniMask(rows, name + '|h25'), at = (q, r) => (rows[r] || '')[q] || '.';
    const ok = (q, r, J) => {
     const ch = at(q, r);
     return (J ? ch === 'J' : ch === 'J' || ch === 'j') && !m.shorts.has(q + ',' + r) && !m.accent.has(q + ',' + r);
    };
    const run = J => {
     const r = s1[1], both = q => ok(q, r, J) && ok(q, r + 1, J);
     let lo = s1[0], hi = s1[0];
     if (!both(lo)) return null;
     while (both(lo - 1)) lo--;
     while (both(hi + 1)) hi++;
     return [ lo, hi ];
    };
    const R = [ run(true), run(false) ].filter(Boolean).sort((a, b) => b[1] - b[0] - (a[1] - a[0]))[0];
    const wd = R ? R[1] - R[0] + 1 : 0, r = s1[1];
    if (wd >= 7) out = [ {
     q: R[0],
     r: r,
     w: 3
    }, {
     q: R[1] - 2,
     r: r,
     w: 3
    } ]; else if (wd >= 5) out = [ {
     q: R[0],
     r: r,
     w: 2
    }, {
     q: R[1] - 1,
     r: r,
     w: 2
    } ]; else out = [ {
     q: s1[0],
     r: s1[1],
     w: 3
    } ];
   }
  } catch (e) {
   console.error(e);
  }
  mSpotC.set(key, out);
  return out;
 }
 const LEFT35 = 1;
 function bPlan(pid, rows, name) {
  const M = bMarks(pid);
  if (!M.length) return [];
  const S = mSpots(rows, name, M.length);
  if (!S.length) return [];
  if (S.length === 1) return [ Object.assign({
   t: M[0]
  }, S[0]) ];
  const order = LEFT35 === 0 ? S : [ S[1], S[0] ];
  return M.map((t, i) => Object.assign({
   t: t
  }, order[i]));
 }
 b35.ownsMarks = () => chestOn() && !!(window.HON25 && HON25.on && HON25.on() && HON25.patchSpot && typeof RL12 !== 'undefined' && RL12.uniMask);
 b35.marks = bMarks;
 b35.plan = (pid, name) => {
  const f = RL12.FR[name];
  return f ? bPlan(pid, f[3], name) : [];
 };
 function hookBadgeDraw() {
  const dp0 = window.drawPlayer12;
  if (typeof dp0 !== 'function' || dp0.__b35) return;
  const dp1 = function(p) {
   const r = dp0.apply(this, arguments);
   try {
    if (!b35.ownsMarks() || !p || !p.pl) return r;
    const n = p._fr, f = n && RL12.FR[n];
    if (!f) return r;
    const P = bPlan(p.pl.id, f[3], n);
    if (!P.length) return r;
    const fr = !!p._fright, x = Math.round(p.x), y = Math.round(p.y), X = q => fr ? x - f[0] + q : x + f[0] - q, Y = rr => y - f[1] + rr;
    scaled12(p.x, p.y, () => {
     for (const m of P) {
      const C = (m.w === 2 ? BPIX2 : BPIX)[m.t];
      for (let rr = 0; rr < 2; rr++) for (let q = 0; q < m.w; q++) {
       g.fillStyle = C[rr][q];
       g.fillRect(X(m.q + q), Y(m.r + rr), 1, 1);
      }
     }
     const probe = window.__b35probe && (window.__b35probe === true || window.__b35probe === p);
     if (probe) {
      try {
       const m0 = P[0], m = g.getTransform(), pt = m.transformPoint(new DOMPoint(X(m0.q + 1) + .5, Y(m0.r) + .5)), d = g.getImageData(Math.floor(pt.x), Math.floor(pt.y), 1, 1).data;
       b35.dbg.px = {
        x: pt.x,
        y: pt.y,
        rgb: [ d[0], d[1], d[2] ],
        dpr: g.canvas.width / g.canvas.getBoundingClientRect().width
       };
      } catch (e) {}
     }
     try {
      const U = window.ULT331 && ULT331.badge && ULT331.badge.dbg, ga = P.find(m => m.t === 'ult'), fa = P.find(m => m.t === 'aa');
      if (U && ga) {
       U.gold++;
       if (fa) U.both++;
       if (window.__ult331probe) U.last = {
        pid: p.pl.id,
        n: n,
        a: fa ? [ X(fa.q), Y(fa.r) ] : null,
        g: [ X(ga.q), Y(ga.r) ],
        fr: fr
       };
      }
      const H = window.HON25 && HON25.dbg;
      if (H && fa) {
       H.flag++;
       if (window.__hon25probe) {
        const px = (q, rr) => {
         try {
          const m = g.getTransform(), pt = m.transformPoint(new DOMPoint(X(q) + .5, Y(rr) + .5)), d = g.getImageData(Math.floor(pt.x), Math.floor(pt.y), 1, 1).data;
          return [ d[0], d[1], d[2] ];
         } catch (e) {
          return null;
         }
        };
        H.last = {
         pid: p.pl.id,
         n: n,
         rgb: [ px(fa.q, fa.r), px(fa.q + 1, fa.r), px(fa.q + 1, fa.r + 1) ]
        };
       }
      }
     } catch (e) {}
    });
    b35.dbg.drawn++;
    b35.dbg.last = {
     pid: p.pl.id,
     t: P[0].t,
     marks: P.map(m => [ m.t, m.q, m.r, m.w ]),
     flag: P.some(m => m.t === 'aa')
    };
   } catch (e) {}
   return r;
  };
  dp1.__b35 = true;
  window.drawPlayer12 = dp1;
  const lb0 = window.lobbyBake;
  if (typeof lb0 === 'function' && !lb0.__b35) {
   const baked = new WeakMap;
   const lb1 = function(name, kit, skin, gray, flip) {
    const c0 = lb0.apply(this, arguments);
    try {
     const pid = window.__v17hp;
     if (!pid || gray || !c0 || !b35.ownsMarks()) return c0;
     const f = RL12.FR[name];
     if (!f) return c0;
     const P = bPlan(pid, f[3], name);
     if (!P.length) return c0;
     b35.dbg.heroLast = {
      pid: pid,
      name: name,
      marks: P.map(mk => [ mk.t, mk.q, mk.r, mk.w ])
     };
     let m = baked.get(c0);
     if (!m) {
      m = {};
      baked.set(c0, m);
     }
     const key = name + '|' + (flip ? 1 : 0) + '|' + P.map(x => x.t + x.q + x.w).join(',');
     if (m[key]) return m[key];
     const c = document.createElement('canvas');
     c.width = c0.width;
     c.height = c0.height;
     const x = c.getContext('2d');
     x.drawImage(c0, 0, 0);
     const w = f[3][0].length;
     for (const mk of P) {
      const C = (mk.w === 2 ? BPIX2 : BPIX)[mk.t];
      for (let rr = 0; rr < 2; rr++) for (let q = 0; q < mk.w; q++) {
       const qq = mk.q + q;
       x.fillStyle = C[rr][q];
       x.fillRect(flip ? w - 1 - qq : qq, mk.r + rr, 1, 1);
      }
     }
     b35.dbg.hero = (b35.dbg.hero || 0) + 1;
     m[key] = c;
     return c;
    } catch (e) {
     console.error(e);
    }
    return c0;
   };
   lb1.__b35 = true;
   window.lobbyBake = lb1;
  }
 }
 const nameOn = () => !OFF() && !window.__rl_no35name;
 const BADMSG = 'THAT NAME IS NOT ALLOWED - TRY ANOTHER';
 function nameBad(raw) {
  if (!nameOn() || raw == null || !String(raw).trim()) return null;
  try {
   const r = window.C30 && C30.badName ? C30.badName(String(raw)) : null;
   if (r === BADMSG) return BADMSG;
  } catch (e) {}
  try {
   const r2 = window.ED31_nameProblem ? ED31_nameProblem(String(raw)) : null;
   if (r2 && /NOT ALLOWED/.test(r2)) return BADMSG;
  } catch (e) {}
  return null;
 }
 function hookNames() {
  if (typeof PANEL_ACT === 'undefined') return;
  const say = el => {
   LOG.name35.push(Date.now());
   el.value = '';
   let m = document.getElementById('n35msg');
   if (!m) {
    m = document.createElement('div');
    m.id = 'n35msg';
    m.className = 'note';
    m.style.color = '#ff9a8a';
    const row = el.closest('.row,.playrow') || el.parentNode;
    row.parentNode.insertBefore(m, row.nextSibling);
   }
   m.textContent = BADMSG;
   try {
    el.focus();
   } catch (e) {}
   return typeof PANEL_KEEP !== 'undefined' ? PANEL_KEEP : undefined;
  };
  const s0 = PANEL_ACT.pmSaveGo;
  if (s0 && !s0.__n35) {
   PANEL_ACT.pmSaveGo = function() {
    const el = document.getElementById('pmname');
    if (el && nameBad(el.value)) return say(el);
    return s0.apply(this, arguments);
   };
   PANEL_ACT.pmSaveGo.__n35 = true;
  }
  const r0 = PANEL_ACT.plRenGo;
  if (r0 && !r0.__n35) {
   PANEL_ACT.plRenGo = function() {
    const el = document.getElementById('plname');
    if (el && nameBad(el.value)) return say(el);
    return r0.apply(this, arguments);
   };
   PANEL_ACT.plRenGo.__n35 = true;
  }
 }
 function init() {
  try {
   hookRender();
  } catch (e) {
   console.error(e);
  }
  try {
   hookPause();
  } catch (e) {
   console.error(e);
  }
  try {
   hookLocker();
  } catch (e) {
   console.error(e);
  }
  try {
   hookSeasonPick();
  } catch (e) {
   console.error(e);
  }
  try {
   hookOnlinePick();
  } catch (e) {
   console.error(e);
  }
  try {
   hookQuick();
  } catch (e) {
   console.error(e);
  }
  try {
   hookNames();
  } catch (e) {
   console.error(e);
  }
  try {
   if (chestOn()) {
    b35.addItems();
    b35.glowFix();
    b35.inv();
    setInterval(() => {
     try {
      b35.inv();
     } catch (e) {}
    }, 2e3);
   }
   hookBadgeDraw();
  } catch (e) {
   console.error(e);
  }
  try {
   artTick();
   setInterval(() => {
    try {
     artTick();
    } catch (e) {}
   }, 2e3);
  } catch (e) {
   console.error(e);
  }
  if (clipOn()) setTimeout(() => {
   try {
    listNow();
   } catch (e) {}
  }, 1500);
  document.addEventListener('visibilitychange', () => {
   try {
    if (document.hidden && UI.exp && UI.exp.on) {
     UI.exp.cancel = true;
     try {
      UI.exp.rec.stop();
     } catch (e) {}
     UI.exp = null;
     setStatus([ 'VIDEO STOPPED (THE APP WENT TO THE BACKGROUND) - TAP SAVE VIDEO AGAIN' ]);
     const v = document.getElementById('clip35v');
     if (v) v.disabled = false;
    }
   } catch (e) {}
  });
 }
 init();
 return {
  LOG: LOG,
  CAP: CAP,
  PERF: PERF,
  MEM: MEM,
  DB: DB,
  UI: UI,
  NA: NA,
  LK: LK,
  post35: post35,
  clipOn: clipOn,
  askOn: askOn,
  qbOn: qbOn,
  tapClip: tapClip,
  finishPend: finishPend,
  highlight: highlight,
  flat: flat,
  build: build,
  encodeClip: encodeClip,
  decodeClip: decodeClip,
  storeClip: storeClip,
  getClip: getClip,
  delClip: delClip,
  loadList: loadList,
  listNow: listNow,
  allIds: allIds,
  openPlayer: openPlayer,
  closePlayer: closePlayer,
  exportNow: exportNow,
  shareNow: shareNow,
  platCss: platCss,
  PLAT: PLAT,
  platFace: platFace,
  platTile: platTile,
  savedAsk: savedAsk,
  delOn: delOn,
  b35: b35,
  nameBad: nameBad,
  nameOn: nameOn,
  vtype: vtype,
  plan: plan,
  drawAt: drawAt,
  workFrame: workFrame,
  drawClipFrame: drawClipFrame,
  clipBtn: () => ({
   x: clipBtnX(),
   y: CB.y,
   w: CB.w,
   h: CB.h
  }),
  naInSeason: naInSeason,
  qbOpen: qbOpen,
  MAXC: MAXC,
  SLOW: SLOW,
  ZOOM: ZOOM
 };
})();

window.V35 = V35;
