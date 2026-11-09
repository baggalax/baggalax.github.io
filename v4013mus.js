(function() {
 'use strict';
 const off = () => !!window.__rl_no4013mus || !!window.__rl_v124gb;
 if (off()) {
  window.V4013MUS = {
   on: () => false
  };
  return;
 }
 const SRC = 'audio/music/lobby.m4a', SR0 = 44100, N = 3681280, PRE = 2048, FP0 = 46148;
 const FP = [ -3444, -3433, -3416, -3392, -3363, -3330, -3295, -3257, -3213, -3162, -3105, -3044, -2978, -2909, -2837, -2761, -2683, -2601, -2514, -2422, -2329, -2234, -2140, -2044, -1946, -1848, -1749, -1650, -1552, -1457, -1361, -1265, -1167, -1070, -974, -874, -768, -659, -547, -434, -319, -201, -78, 47, 176, 308, 442, 579, 717, 857, 995, 1130, 1263, 1396, 1524, 1646, 1761, 1869, 1970, 2064, 2150, 2226, 2293, 2351, 2400, 2437, 2464, 2482, 2492, 2495, 2488, 2469, 2441, 2404, 2359, 2305, 2243, 2176, 2103, 2027, 1948, 1864, 1777, 1686, 1594, 1501, 1405, 1309, 1214, 1120, 1024, 927, 832, 739, 645, 551, 458, 367, 280, 196, 113, 32, -49, -126, -201, -275, -349, -423, -496, -566, -635, -703, -769, -833, -896, -956, -1015, -1072, -1122, -1169, -1215, -1258, -1295, -1324, -1346, -1362, -1374, -1380, -1379, -1372, -1359, -1340, -1315, -1282, -1241, -1193, -1139, -1079, -1011, -935, -852, -763, -665, -559, -446, -326, -198, -62, 80, 228, 383, 546, 719, 900, 1086, 1274, 1468, 1665, 1859, 2055, 2253, 2449, 2642, 2834, 3024, 3212, 3397, 3577, 3753, 3927, 4097, 4260, 4413, 4560, 4702, 4837, 4963, 5084, 5199, 5305, 5402, 5492, 5574, 5649, 5716, 5773, 5822, 5861, 5893, 5917, 5935, 5947, 5951, 5948, 5941, 5927, 5903, 5872, 5835, 5793, 5743, 5684, 5615, 5539, 5458, 5369, 5270, 5161, 5042, 4915, 4782, 4642, 4494, 4337, 4175, 4009, 3838, 3663, 3484, 3300, 3116, 2933, 2749, 2564, 2377, 2193, 2010, 1825, 1639, 1452, 1264, 1075, 887, 698, 510, 320, 129, -62, -256, -452, -646, -839, -1030, -1224, -1420, -1618, -1815, -2009, -2201, -2391, -2579, -2766, -2949, -3126, -3294, -3457, -3615, -3766, -3907, -4036, -4154, -4261, -4359, -4444, -4515, -4570, -4613, -4644, -4663, -4673, -4674, -4664, -4644, -4615, -4577, -4532, -4482, -4428, -4371, -4311, -4250, -4190, -4130, -4071, -4015, -3963, -3914, -3870, -3828, -3787, -3749, -3712, -3675, -3638, -3602, -3565, -3530, -3495, -3459, -3419, -3376, -3330, -3279, -3224, -3168, -3107, -3041, -2972, -2901, -2826, -2748, -2666, -2584, -2500, -2415, -2328, -2239, -2153, -2070, -1988, -1907, -1829, -1758, -1691, -1626, -1566, -1512, -1461, -1414, -1373, -1340, -1311, -1286, -1266, -1249, -1234, -1219, -1204, -1191, -1180, -1168, -1155, -1142, -1127, -1111, -1094, -1079, -1063, -1044, -1024, -1002, -983, -964, -946, -927, -910, -896, -882, -871, -863, -859, -858, -859, -861, -866, -874, -884, -894, -904, -913, -921, -928, -932, -934, -930, -921, -908, -889, -866, -838, -805, -767, -721, -671, -616, -558, -498, -437, -374, -309, -245, -181, -115, -50, 15, 77, 135, 190, 242, 289, 332, 371, 408, 441, 468, 490, 507, 518, 525, 527, 526, 521, 513, 502, 490, 476, 459, 441, 424, 409, 397, 387, 380, 373, 369, 368, 370, 373, 379, 389, 400, 412, 423, 435, 446, 459, 474, 490, 505, 517, 528, 538, 547, 555, 564, 574, 582, 589, 597, 605, 612, 616, 619, 623, 626, 626, 625, 621, 616, 611, 606, 600, 595, 591, 587, 585, 582, 581, 581, 582, 585, 589, 595, 604, 614, 628, 644, 663, 686, 711, 738, 768, 803, 842, 886, 932, 984, 1041, 1101, 1165, 1234, 1306, 1381, 1461, 1545, 1632, 1721, 1811, 1904, 1997, 2088, 2177, 2267, 2358, 2449, 2538, 2624, 2707, 2785, 2858, 2928, 2995 ];
 const FADE_IN = 1.5, FADE_OUT = .6, VOL0 = .25;
 const KEY = 'mus4013';
 const S = (() => {
  let s = null;
  try {
   s = LS.get(KEY, null);
  } catch (e) {}
  s = s && typeof s === 'object' ? s : {};
  return {
   on: s.on !== false,
   vol: typeof s.vol === 'number' && s.vol >= 0 && s.vol <= 1 ? s.vol : VOL0
  };
 })();
 const save = () => {
  try {
   LS.set(KEY, {
    on: S.on,
    vol: S.vol
   });
  } catch (e) {}
 };
 const M = {
  buf: null,
  loading: false,
  failed: 0,
  tapped: false,
  ctx: null,
  src: null,
  gain: null,
  ls: 0,
  le: 0,
  off: 0,
  match: null,
  t0: 0,
  p0: 0,
  level: 0,
  rampFrom: 0,
  rampTo: 0,
  rampT0: 0,
  rampT1: 0,
  target: 0,
  playing: false,
  pos: null,
  starts: 0,
  stops: 0,
  why: ''
 };
 const ac = () => {
  try {
   return typeof AC !== 'undefined' ? AC : null;
  } catch (e) {
   return null;
  }
 };
 const isMuted = () => {
  try {
   return !!muted;
  } catch (e) {
   return false;
  }
 };
 const masterVol = () => {
  try {
   return MASTER_VOL;
  } catch (e) {
   return .58;
  }
 };
 const vis = () => !document.hidden && document.visibilityState !== 'hidden';
 function lobby() {
  try {
   if (typeof game !== 'undefined' && game) return false;
   if (typeof screen !== 'string') return false;
   if (screen === 'netview' || typeof GAME_SCREENS !== 'undefined' && GAME_SCREENS.includes(screen)) return false;
   if (window.RLNET && RLNET.inGame) return false;
   if (window.TUT26 && TUT26.active && TUT26.active()) return false;
   return true;
  } catch (e) {
   return false;
  }
 }
 function want() {
  const a = ac();
  return S.on && !isMuted() && vis() && lobby() && !!a && a.state === 'running';
 }
 function findStart(b) {
  const r = b.sampleRate / SR0, d0 = b.getChannelData(0), d1 = b.numberOfChannels > 1 ? b.getChannelData(1) : d0;
  const at = i => {
   const x = i * r, k = Math.floor(x), f = x - k;
   if (k < 0 || k + 1 >= d0.length) return 0;
   return ((d0[k] + d1[k]) * (1 - f) + (d0[k + 1] + d1[k + 1]) * f) / 2;
  };
  let best = 0, bestE = Infinity, ref = 0;
  for (let j = 0; j < FP.length; j++) ref += FP[j] / 32767 * (FP[j] / 32767);
  for (let o = -2600; o <= 2600; o++) {
   let e = 0;
   for (let j = 0; j < FP.length; j += 2) {
    const v = at(FP0 + o + j) - FP[j] / 32767;
    e += v * v;
    if (e > bestE) break;
   }
   if (e < bestE) {
    bestE = e;
    best = o;
   }
  }
  M.match = {
   o: best,
   err: +(bestE / (ref / 2 || 1)).toFixed(5)
  };
  if (!(M.match.err < .05)) best = 0;
  M.off = best;
  return (PRE + best) / SR0;
 }
 function load() {
  const a = ac();
  if (M.buf || M.loading || !a || M.failed > 2) return;
  M.loading = true;
  fetch(SRC).then(r => {
   if (!r.ok) throw new Error('HTTP ' + r.status);
   return r.arrayBuffer();
  }).then(ab => new Promise((res, rej) => {
   let done = false;
   const ok = b => {
    if (!done) {
     done = true;
     res(b);
    }
   }, no = e => {
    if (!done) {
     done = true;
     rej(e || new Error('decode'));
    }
   };
   try {
    const p = a.decodeAudioData(ab, ok, no);
    if (p && p.then) p.then(ok, no);
   } catch (e) {
    no(e);
   }
  })).then(b => {
   M.ls = findStart(b);
   M.le = M.ls + N / SR0;
   if (M.le > b.duration) {
    M.le = b.duration;
   }
   M.buf = b;
   M.loading = false;
  }).catch(e => {
   M.loading = false;
   M.failed++;
   M.why = String(e && e.message || e);
  });
 }
 function now() {
  const a = M.ctx;
  return a ? a.currentTime : 0;
 }
 function levelAt(t) {
  if (t >= M.rampT1) return M.rampTo;
  if (t <= M.rampT0) return M.rampFrom;
  return M.rampFrom + (M.rampTo - M.rampFrom) * (t - M.rampT0) / (M.rampT1 - M.rampT0);
 }
 function ramp(to, dur) {
  const t = now(), from = levelAt(t);
  M.rampFrom = from;
  M.rampTo = to;
  M.rampT0 = t;
  M.rampT1 = t + dur;
  M.target = to;
  try {
   const g = M.gain.gain;
   if (g.cancelScheduledValues) g.cancelScheduledValues(t);
   g.setValueAtTime(Math.max(0, from), t);
   g.linearRampToValueAtTime(Math.max(0, to), t + dur);
  } catch (e) {}
 }
 function posNow() {
  if (!M.src) return M.pos;
  const L = M.le - M.ls, p = M.p0 + (now() - M.t0);
  if (p < M.le) return p;
  return M.ls + (p - M.ls) % L;
 }
 function start() {
  const a = ac();
  if (!a || !M.buf) return;
  if (M.ctx !== a) {
   kill();
   M.ctx = a;
  }
  try {
   if (!M.gain) {
    M.gain = a.createGain();
    M.gain.gain.value = 0;
    M.gain.connect(a.destination);
    M.level = 0;
    M.rampFrom = M.rampTo = 0;
    M.rampT0 = M.rampT1 = 0;
   }
   const s = a.createBufferSource();
   s.buffer = M.buf;
   s.loop = true;
   s.loopStart = M.ls;
   s.loopEnd = M.le;
   s.connect(M.gain);
   let p = M.pos == null ? M.ls : M.pos;
   if (!(p >= M.ls && p < M.le)) p = M.ls;
   M.t0 = a.currentTime;
   M.p0 = p;
   s.start(M.t0, p);
   M.src = s;
   M.playing = true;
   M.starts++;
   ramp(S.vol * masterVol(), FADE_IN);
  } catch (e) {
   M.why = String(e && e.message || e);
   kill();
  }
 }
 function stop() {
  if (!M.src) return;
  M.pos = posNow();
  try {
   M.src.stop();
  } catch (e) {}
  try {
   M.src.disconnect();
  } catch (e) {}
  M.src = null;
  M.playing = false;
  M.stops++;
 }
 function kill() {
  if (M.src) {
   try {
    M.pos = posNow();
   } catch (e) {}
   try {
    M.src.stop();
   } catch (e) {}
   try {
    M.src.disconnect();
   } catch (e) {}
  }
  try {
   if (M.gain) M.gain.disconnect();
  } catch (e) {}
  M.src = null;
  M.gain = null;
  M.ctx = null;
  M.playing = false;
  M.target = 0;
  M.rampFrom = M.rampTo = 0;
 }
 function frame() {
  try {
   const a = ac();
   if (M.ctx && M.ctx !== a) kill();
   if (M.tapped && a && !M.buf && S.on) load();
   const w = want() && !!M.buf;
   if (w) {
    const goal = S.vol * masterVol();
    if (!M.src) start(); else if (Math.abs(M.target - goal) > 1e-4) ramp(goal, M.target < 1e-4 ? FADE_IN : .25);
   } else if (M.src) {
    if (M.ctx && M.ctx.state !== 'running') {
     stop();
    } else if (M.target > 1e-4) ramp(0, FADE_OUT); else if (now() >= M.rampT1 + .05) stop();
   }
   M.level = M.src ? levelAt(now()) : 0;
  } catch (e) {}
 }
 const loop = () => {
  frame();
  requestAnimationFrame(loop);
 };
 requestAnimationFrame(loop);
 setInterval(frame, 250);
 [ 'touchend', 'click', 'pointerup', 'keydown' ].forEach(ev => window.addEventListener(ev, e => {
  if (e && e.isTrusted === false) return;
  M.tapped = true;
  setTimeout(frame, 0);
 }, true));
 document.addEventListener('visibilitychange', () => setTimeout(frame, 0));
 window.addEventListener('pagehide', () => {
  if (M.src && M.target > 1e-4) ramp(0, FADE_OUT);
 });
 function setOn(v) {
  S.on = !!v;
  save();
  if (S.on) {
   M.tapped = true;
   try {
    audioInit();
   } catch (e) {}
  }
  frame();
  return S.on;
 }
 const DS0 = window.drawSettings;
 if (typeof DS0 === 'function') window.drawSettings = function(inGame) {
  const r = DS0.apply(this, arguments);
  try {
   if (!off() && !window.__rl_no32cp) {
    const w = Math.max(110, Math.min(148, Math.floor(W / 2 - 42))), h = 17, x = W - 6 - w, y = 1, on = S.on, mu = isMuted();
    const bg = on ? '#7dff7a' : '#3a4a55', fg = on ? '#0b1a20' : '#cfe';
    hit(on ? 'MUSIC: ON' : 'MUSIC: OFF', x, y, w, h, () => {
     setOn(!S.on);
    });
    rect(x, y + 2, w, h, '#000');
    rect(x, y, w, h, bg);
    rect(x, y, w, 1, 'rgba(255,255,255,.35)');
    text(on ? 'MUSIC: ON' : 'MUSIC: OFF', x + w / 2, y + 2, 1, on ? '#0b1a20' : '#ffe14d', 'center');
    const subs = !on ? [ 'TAP TO TURN ON' ] : mu ? [ 'SOUND IS OFF', 'SOUND OFF' ] : [ 'HOME + MENUS ONLY', 'MENUS ONLY' ];
    const sub = subs.find(s => textW(s) <= w - 4) || subs[subs.length - 1];
    text(sub, x + w / 2, y + 10, 1, on ? mu ? '#7a3a00' : '#1d4a2a' : '#cfe', 'center');
   }
  } catch (e) {
   console.error(e);
  }
  return r;
 };
 const DP0 = window.drawPause;
 if (typeof DP0 === 'function') window.drawPause = function() {
  let sp = false;
  try {
   sp = !!pauseSet;
  } catch (e) {}
  if (off() || sp) return DP0.apply(this, arguments);
  const B0 = window.button;
  let sb = null, r;
  window.button = function(label, x, y, w, h, fn, opt) {
   if (!sb && typeof label === 'string' && /^SOUND: /.test(label)) {
    const hw = Math.floor((w - 3) / 2);
    if (textW(label) + 4 <= hw && textW('MUSIC: OFF') + 4 <= w - hw - 3) {
     sb = {
      x: x,
      y: y,
      w: w,
      h: h,
      hw: hw
     };
     return B0.call(this, label, x, y, hw, h, fn, opt);
    }
   }
   return B0.apply(this, arguments);
  };
  try {
   r = DP0.apply(this, arguments);
  } finally {
   window.button = B0;
  }
  if (sb) {
   const on = S.on;
   B0(on ? 'MUSIC: ON' : 'MUSIC: OFF', sb.x + sb.hw + 3, sb.y, sb.w - sb.hw - 3, sb.h, () => {
    setOn(!S.on);
   }, {
    bg: on ? '#7dff7a' : '#5a6670'
   });
  }
  return r;
 };
 window.V4013MUS = {
  on: () => !off(),
  S: S,
  M: M,
  setOn: setOn,
  lobby: lobby,
  want: want,
  frame: frame,
  state() {
   const a = ac();
   return {
    on: S.on,
    vol: S.vol,
    tapped: M.tapped,
    loaded: !!M.buf,
    loading: M.loading,
    failed: M.failed,
    why: M.why,
    playing: !!M.src,
    level: M.src ? levelAt(now()) : 0,
    target: M.target,
    gainValue: M.gain ? M.gain.gain.value : null,
    connected: !!(M.gain && M.src),
    ctxState: a ? a.state : null,
    sameCtx: !!(M.ctx && M.ctx === a),
    lobby: lobby(),
    want: want(),
    ls: M.ls,
    le: M.le,
    off: M.off,
    match: M.match,
    pos: M.src ? posNow() : M.pos,
    bufLen: M.buf ? M.buf.length : 0,
    bufRate: M.buf ? M.buf.sampleRate : 0,
    starts: M.starts,
    stops: M.stops
   };
  }
 };
})();
