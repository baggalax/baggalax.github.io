/* v590stick.js - 1.5 new STICK HEAD everywhere + Ranked Uni chest badge / Jade crown on every player sprite (board 1.5-9, 1.5-7).
 * Bug/ask: Charlie approved the new stick head (10x14 half-pixel art); the old 5x7 head must be gone everywhere a stick shows
 *   (lobby, matches, cellys, cards, crew cards); Turkey Leg keeps its drumstick. Ranked Unis need the real tier badge on the
 *   chest on whole sprite pixels (the mockup drew it at half scale, which is how it landed on a face / broke an eye).
 * Cause: every player is a baked sprite canvas drawn with drawImage; the head is the frame's M/m/n pixels.
 * Fix: the same proven way the game already fixes eyes (v232 EYES2403): drawImage is wrapped; each sprite canvas is matched
 *   ONCE to its RL12 frame (size + opaque mask, cached in a WeakMap); its old head pixels are cleared once; on every draw the
 *   new head (pre-rendered per colour + angle, 1 drawImage) goes on the shaft end, and - if the jersey colour belongs to a
 *   Ranked Uni (v590uni RK15U.chestFor) - its 5x6 badge is stamped on whole sprite pixels at the top-centre of the jersey.
 *   Item stick icons get the new head in items17.js stickIcon (core edit behind the same switch).
 * Kill switch: window.__rl_no590stick = true (old head back; badges stay) / window.__rl_no590chest (no chest badges).
 */
(function () {
 'use strict';
 const Wn = window;
 if (Wn.__rl_590stick || typeof RL12 === 'undefined' || !RL12.FR) return; Wn.__rl_590stick = 1;
 const offH = () => !!(Wn.__rl_no590stick || Wn.__rl_v124gb);
 const offC = () => !!(Wn.__rl_no590chest || Wn.__rl_no590 || Wn.__rl_v124gb);
 const HEAD = ['..WWWWWW..', '.WmnmnmnW.', 'Wmnmmmnmmg', 'Wwwwwwwwwg', 'Wmmmnmmmng', 'Wwwwwwwwwg', '.Wnmmmnmg.', '.Wmnmnmng.', '..Wmnmmg..', '..Wnnnng..', '...Wnng...', '...Wnng...', '....WW....', '....WW....'];
 const FR = RL12.FR, byWH = new Map; let frN = -1;
 function indexFrames() { // frames are added by later files too (8-direction runs, extra anims, long-pole poses): re-index when the set grows
  const n = Object.keys(FR).length; if (n === frN) return false; frN = n; byWH.clear();
  for (const name in FR) { const f = FR[name]; if (!f || !f[3] || /^prop_/.test(name)) continue; const rows = f[3], k = rows[0].length + 'x' + rows.length; if (!byWH.has(k)) byWH.set(k, []); byWH.get(k).push([name, rows]); }
  return true;
 }
 indexFrames();
 const info = new WeakMap, S = Wn.STICK590 = { n: 0, miss: 0, err: null }; setTimeout(() => { S.analyse = analyse; }, 0);
 S.analyse = c => analyse(c);
 // 1.5e (Charlie: 'the split dodge shows the OLD head at some angles'): hand-drawn sticks (v442anim stick2 - dodges, shots,
 // carries, checks; game.js drawHandStick) drew the old 5x6 head by hand. They call this instead: the new head, rotated with
 // the shaft (from -> tip), throat on the shaft tip, same colours / glow as the item.
 const toRgb = c => { c = String(c || ''); if (/^rgb/.test(c)) return c; const h = c.replace('#', ''); const v = h.length === 3 ? h.split('').map(x => parseInt(x + x, 16)) : [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16)); return v.some(isNaN) ? 'rgb(255,255,255)' : 'rgb(' + v.join(',') + ')'; };
 S.headAt = function (ctx, tx, ty, fx, fy, c, glow) {
  if (offH() || Wn.__rl_no597hs || (c && c.tkleg) || (Wn.__v17sc && Wn.__v17sc.tkleg)) return false; // Turkey Leg keeps its drumstick
  try {
   const dx = tx - fx, dy = ty - fy, ang = (dx || dy) ? Math.atan2(dx, -dy) : 0;
   const gl = glow ? (/^rgb/.test(glow) ? glow : toRgb(glow).replace('rgb(', 'rgba(').replace(')', ',.4)')) : null;
   const I = { M: toRgb(c && c.M || '#ffffff'), m: toRgb(c && c.m || '#cdd6da'), n: toRgb(c && c.n || '#96a0a6'), glow: gl, hx: tx + .5, hy: ty + .5, ang: ang };
   drawHead(ctx, I, 0, 0, 1); return true;
  } catch (e) { S.err = String(e); return false; }
 };
 // 1.5d: the lobby's top plates (team name, uni name + arrows) are drawn after the hero and cut the big player's stick head.
 // The head is drawn once more, last, clipped to the plates' band only (v596gfx calls this after the frame).
 S.heroOver = function (band) { if (!Wn.__rl_heroover) return false; /* 1.5 B77 (Charlie, iPhone: 'the stick head is drawn over the team name / WEEKLY bar, and a 2nd head behind it when he bobs down'): the head was drawn AGAIN after the UI at the position of the last frame - over the plate band and, on the idle bob's low frame, 1 px off the moved head (= a ghost head). The big player is drawn under the UI again, like 1.4. Old behaviour: window.__rl_heroover = true */ try { const h = S.hero; if (!h || !band || offH() || Wn.__rl_no597band || performance.now() - h.t > 60 || performance.now() - band.t > 60) return false; const c = typeof g !== 'undefined' ? g : null; if (!c) return false; c.save(); c.setTransform(band.m); c.beginPath(); c.rect(band.x0, band.y0, band.x1 - band.x0, band.y1 - band.y0); c.clip(); c.setTransform(h.m); if (!h.I.noHead) drawHead(c, h.I, h.ox, h.oy, h.s); c.restore(); S.hero = null; return true; } catch (e) { S.err = String(e); return false; } }; S.missL = [];
 const TURKEY = new Set(['181,96,31', '138,68,22', '234,165,92', '42,20,6']);
 function analyse(c) {
  if (info.has(c)) { const v = info.get(c); if (v || c.__f590n === frN) return v; info.delete(c); }
  indexFrames(); c.__f590n = frN;
  let res = null;
  try {
   const pad = c.pad17 != null ? [c.pad17 | 0] : [0, 1];
   for (const off of pad) {
    if (res) break;
    let L = byWH.get((c.width - 2 * off) + 'x' + (c.height - 2 * off)); if (!L) continue;
    // 1.5e: the bake tells us its frame (lobbyBake / bakeGear tag __f597) - no more guessing between same-size frames
    // (a lobby GOALIE matched a field frame, so it got a field stick head + glow on top of its goalie stick)
    let tagged = false; if (!Wn.__rl_no597fr && c.__f597 && FR[c.__f597]) { const tl = L.filter(x => x[0] === c.__f597); if (tl.length) { L = tl; tagged = true; } }
    const x = c.getContext('2d'), im = x.getImageData(0, 0, c.width, c.height), d = im.data, CW = c.width, Wd = c.width - 2 * off, Hd = c.height - 2 * off;
    const A = (q, r) => d[((r + off) * CW + q + off) * 4 + 3] > 0;
    let best = null;
    for (const [name, rows] of L) for (const flip of [false, true]) {
     let miss = 0, extra = 0;
     for (let r = 0; r < Hd; r++) { const row = rows[r]; for (let q = 0; q < Wd; q++) { const ch = row[flip ? Wd - 1 - q : q], op = A(q, r); if (ch !== '.' && !op) miss++; else if (ch === '.' && op) extra++; } }
     if (miss <= Math.max(2, Wd * Hd * (tagged ? .12 : .02)) && (!best || extra + miss * 3 < best[2])) best = [name, flip, extra + miss * 3, rows];
    }
    if (!best || best[2] >= Wd * Hd * (tagged ? .6 : .15)) continue; // 1.5e: a tagged bake is that frame - gear (baggy shorts, helmets) may change its outline a lot
    const [, flip, , rows] = best, ch = (q, r) => rows[r][flip ? Wd - 1 - q : q], I4 = (q, r) => ((r + off) * CW + q + off) * 4;
    const head = [], shaft = [], jj = [], hh = [];
    for (let r = 0; r < Hd; r++) for (let q = 0; q < Wd; q++) { const k = ch(q, r); if (k === 'M' || k === 'm' || k === 'n') head.push([q, r, k]); else if (k === 'X') shaft.push([q, r]); else if (k === 'J') jj.push([q, r]); else if (k === 'H' || k === 'h' || k === 'w') hh.push([q, r]); }
    const col = {}; head.forEach(([q, r, k]) => { const i = I4(q, r); if (!col[k]) col[k] = [d[i], d[i + 1], d[i + 2]]; });
    const turkey = head.some(([q, r]) => { const i = I4(q, r); return TURKEY.has(d[i] + ',' + d[i + 1] + ',' + d[i + 2]); });
    const goalie = !Wn.__rl_no595gk && /^g_|goalie/.test(best[0]); // 1.5c: goalies keep their own big goalie head
    const noHead = head.length < 6 || turkey || goalie;
    let ang = 0, hx = 0, hy = 0, anchored = 0;
    if (!noHead) {
     hx = head.reduce((a, p) => a + p[0], 0) / head.length; hy = Math.max(...head.map(p => p[1]));
     if (shaft.length >= 2) { shaft.sort((a, b) => a[1] - b[1] || a[0] - b[0]); const a0 = shaft[0], a1 = shaft[shaft.length - 1]; if (a1[1] !== a0[1]) ang = Math.atan2(a1[0] - a0[0], a1[1] - a0[1]); hx = a0[0]; hy = a0[1]; anchored = 1; } // 1.5b: the head's throat sits centred on the top of the shaft, along the whole shaft's line
     // clear the old head once in this cached canvas (and its 1px outline where nothing else is)
     const body = (q, r) => q >= 0 && r >= 0 && q < Wd && r < Hd && ch(q, r) !== '.' && !'Mmn'.includes(ch(q, r));
     if (!offH()) head.forEach(([q, r]) => { d[I4(q, r) + 3] = 0; });
     // 1.5d (root cause of the 'white + black frame behind the new head'): lobby / gear bakes add pixels round the old head
     // that are NOT in the frame's M/m/n cells - an outline pass (1px black ring), wider gear heads, the glow ring. Only the
     // M/m/n cells were cleared, so that ring + spill stayed and showed round the new head. Now every pixel in an empty frame
     // cell within 2 px of the old head goes too, except a dark outline pixel that belongs to the body (touches a body cell).
     if (!offH() && !Wn.__rl_no597ring) {
      const bodyC = (q, r) => q >= 0 && r >= 0 && q < Wd && r < Hd && ch(q, r) !== '.' && !'Mmn'.includes(ch(q, r)) && (Wn.__rl_no77ring || ch(q, r) !== 'X'); // 1.5 B77: the shaft is not 'body' - the outline beside the shaft top under the old head (a black block = the ghost head, Charlie) goes too
      const emptyC = (q, r) => !(q >= 0 && r >= 0 && q < Wd && r < Hd) || ch(q, r) === '.';
      const seen = new Set();
      head.forEach(([q, r]) => { for (let a = -2; a <= 2; a++) for (let b = -2; b <= 2; b++) {
       const qq = q + a, rr = r + b; if (qq < -off || rr < -off || qq > Wd - 1 + off || rr > Hd - 1 + off) continue;
       const key = qq + ',' + rr; if (seen.has(key) || !emptyC(qq, rr)) continue; seen.add(key);
       const i = I4(qq, rr); if (!d[i + 3]) continue;
       let nb = false; for (let e = -1; e <= 1 && !nb; e++) for (let f2 = -1; f2 <= 1; f2++) if (bodyC(qq + e, rr + f2)) { nb = true; break; }
       const dark = d[i] + d[i + 1] + d[i + 2] < 90 && d[i + 3] > 200;
       if (!(nb && dark)) d[i + 3] = 0;
      } });
     }
     if (!offH() && !Wn.__rl_no597crisp && (c.__glow597 || off)) { // strip the baked 1-sprite-px glow ring round the shaft (see glowRing)
      const xs = []; for (let r = 0; r < Hd; r++) for (let q = 0; q < Wd; q++) if (ch(q, r) === 'X') xs.push([q, r]);
      xs.forEach(([q, r]) => { for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const qq = q + a, rr = r + b; if (qq < -off || rr < -off || qq > Wd - 1 + off || rr > Hd - 1 + off) continue; const inR = qq >= 0 && rr >= 0 && qq < Wd && rr < Hd; if (inR && ch(qq, rr) !== '.') continue; const i = I4(qq, rr); if (d[i + 3] > 0 && d[i + 3] < 200) d[i + 3] = 0; } });
     }
     if (!offH()) x.putImageData(im, 0, 0);
    }
    let jcx = null, jr0 = null, jcol = null;
    if (jj.length) { jr0 = Math.min(...jj.map(p => p[1])); const top = jj.filter(p => p[1] <= jr0 + 1); jcx = Math.round((Math.min(...top.map(p => p[0])) + Math.max(...top.map(p => p[0]))) / 2) + off; const i0 = I4(jj[0][0], jj[0][1]); jcol = '#' + [d[i0], d[i0 + 1], d[i0 + 2]].map(v => v.toString(16).padStart(2, '0')).join(''); jr0 += off; }
    let jfill = null; if (jj.length && jcx != null) { const cand = jj.filter(p => p[1] === jr0 - off + 4 && Math.abs(p[0] + off - jcx) >= 3).concat(jj.filter(p => p[1] >= jr0 - off + 3)); for (const p of cand) { const i = I4(p[0], p[1]); if (d[i + 3] > 200) { jfill = '#' + [d[i], d[i + 1], d[i + 2]].map(v => v.toString(16).padStart(2, '0')).join(''); break; } } } // 1.5e: jersey colour BESIDE the badge (the first J cell can be under a collar item)
    let hcx = null, hr0 = null;
    if (hh.length) { hr0 = Math.min(...hh.map(p => p[1])); const top = hh.filter(p => p[1] <= hr0 + 1); hcx = Math.round((Math.min(...top.map(p => p[0])) + Math.max(...top.map(p => p[0]))) / 2) + off; hr0 += off; }
    let glowC = null;
    if (off) for (const [q, r] of shaft) { for (const [a, b] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { const qq = q + a, rr = r + b; if (qq >= 0 && rr >= 0 && qq < Wd && rr < Hd && ch(qq, rr) !== '.') continue; const i = I4(qq, rr); if (d[i + 3] > 20 && d[i + 3] < 200) { glowC = 'rgba(' + d[i] + ',' + d[i + 1] + ',' + d[i + 2] + ',' + (d[i + 3] / 255).toFixed(2) + ')'; break; } } if (glowC) break; }
    const rgb = a => a ? 'rgb(' + a.join(',') + ')' : null;
    // 1.5 B72 (Charlie, build 55: 'sticks are cutting off the right side of players' heads' - lobby heroes, bench, versus cards):
    // the new head (10x14 half-px + outline) is wider and hangs lower than the old 5x7 one, so on frames that hold the stick
    // beside the helmet it is drawn OVER the helmet / face edge. Fix: the player's own head pixels (body cells above the jersey,
    // never the stick) are kept as a mask and drawn again after the new head = the stick head sits BEHIND the head.
    let hm = null;
    if (!noHead && !Wn.__rl_no72head) try {
     const stickC = (q, r) => { if (q < 0 || r < 0 || q >= Wd || r >= Hd) return false; const k = ch(q, r); return k === 'X' || k === 'M' || k === 'm' || k === 'n'; };
     const jTop = jj.length ? Math.min(...jj.map(p => p[1])) : Math.floor(Hd / 2);
     let any = false; const md = new Uint8ClampedArray(d.length);
     for (let r = -off; r < jTop; r++) for (let q = -off; q < Wd + off; q++) {
      const inF = q >= 0 && r >= 0 && q < Wd && r < Hd, k = inF ? ch(q, r) : '.';
      if (k === 'X' || k === 'M' || k === 'm' || k === 'n') continue;
      if (k === '.' && !Wn.__rl_no73hm) continue; // 1.5 B73: frame body cells only (an empty cell can hold the old head's dark ring / glow -> a 2nd head on top)
      if (k === '.') { let nb = false; for (let a = -1; a <= 1 && !nb; a++) for (let b = -1; b <= 1; b++) if (stickC(q + a, r + b)) { nb = true; break; } if (nb) continue; let body = false; for (let a = -1; a <= 1 && !body; a++) for (let b = -1; b <= 1; b++) { const qq = q + a, rr = r + b; if (qq >= 0 && rr >= 0 && qq < Wd && rr < Hd && ch(qq, rr) !== '.' && !stickC(qq, rr)) { body = true; break; } } if (!body) continue; }
      const i = I4(q, r); if (d[i + 3] < 200) continue;
      md[i] = d[i]; md[i + 1] = d[i + 1]; md[i + 2] = d[i + 2]; md[i + 3] = d[i + 3]; any = true;
     }
     // only where the new head can reach (within 6 sprite px of the head's centre on the shaft line)
     if (any) { const cx = hx + .5, cy = hy + 1 - 4.3 * Math.cos(ang), cx2 = cx - 4.3 * Math.sin(ang); let near = false; for (let r = -off; r < jTop && !near; r++) for (let q = -off; q < Wd + off; q++) { if (md[I4(q, r) + 3] && Math.hypot(q + .5 - cx2, r + .5 - cy) < 6) { near = true; break; } } if (near) { hm = document.createElement('canvas'); hm.width = CW; hm.height = c.height; hm.getContext('2d').putImageData(new ImageData(md, CW, c.height), 0, 0); } }
    } catch (e) { hm = null; }
    res = { hm: hm, name: best[0], flip: best[1], wd: Wd, hd: Hd, off: off, noHead, jcx, jr0, jcol, hcx, hr0, hx: hx + .5 + off, hy: hy + (anchored ? 1 : 1) + off, jfill: jfill, glow: (!Wn.__rl_no597glow && c.__glow597) || glowC, /* 1.5d: the bake says it is a glow stick (unpadded hero / card bakes have no ring to read) */ ang: Math.abs(ang) < .2 ? 0 : -ang, M: rgb(col.M) || '#ffffff', m: rgb(col.m) || '#cdd6da', n: rgb(col.n) || '#96a0a6' };
   }
  } catch (e) { S.err = String(e); res = null; }
  info.set(c, res); if (res) S.n++; else { S.miss++; if (Wn.__f590log && S.missL && S.missL.length < 60) S.missL.push(c.width + 'x' + c.height + (c.pad17 != null ? 'p' + c.pad17 : '')); }
  return res;
 }
 // pre-rendered head per colour + angle: canvas in half-pixel units (12 x 16 incl. the dark outline)
 const glowSolid = c => { const m = String(c).match(/[\d.]+/g); return m && m.length >= 3 ? 'rgba(' + m[0] + ',' + m[1] + ',' + m[2] + ',.62)' : c; };
 // 1.5e (Charlie: 'a huge soft blurry cloud'): the baked glow was a whole SPRITE pixel round the shaft (5 screen-px in the
 // lobby) plus a 3-half-px ring round the head, both see-through and stacked. The baked ring is stripped once (analyse) and
 // a crisp 1 HALF-pixel ring is drawn round the shaft at the target scale, under the sprite; the head gets the same ring.
 const GRING = new WeakMap();
 function glowRing(img, I) {
  let G = GRING.get(img); if (G !== undefined) return G; G = null;
  try {
   const rows = RL12.FR[I.name][3], off = I.off | 0, ch = (q, r) => { const row = rows[r]; return row ? row[I.flip ? I.wd - 1 - q : q] : undefined; };
   const on = new Set(); for (let r = 0; r < I.hd; r++) for (let q = 0; q < I.wd; q++) if (ch(q, r) === 'X') for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) on.add(((q + off) * 2 + a) + ',' + ((r + off) * 2 + b));
   if (!on.size) { GRING.set(img, null); return null; }
   G = document.createElement('canvas'); G.width = img.width * 2; G.height = img.height * 2; const x = G.getContext('2d'); x.fillStyle = glowSolid(I.glow);
   const ring = new Set(); on.forEach(k => { const [X, Y] = k.split(',').map(Number); for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const kk = (X + a) + ',' + (Y + b); if (!on.has(kk)) ring.add(kk); } });
   ring.forEach(k => { const [X, Y] = k.split(',').map(Number); if (X >= 0 && Y >= 0 && X < G.width && Y < G.height) x.fillRect(X, Y, 1, 1); });
  } catch (e) { S.err = String(e); G = null; }
  GRING.set(img, G); return G;
 }
 function glowDraw(ctx, orig, img, a) {
  if (Wn.__rl_no597crisp || !img || img.tagName !== 'CANVAS' || !(img.width <= 64 && img.height <= 64)) return;
  const I = analyse(img); if (!I || !I.glow) return; const G = glowRing(img, I); if (!G) return; const n = a.length;
  const sm = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = false;
  if (n === 3) orig.call(ctx, G, a[1], a[2], img.width, img.height);
  else if (n === 5) orig.call(ctx, G, a[1], a[2], a[3], a[4]);
  else if (n === 9) orig.call(ctx, G, a[1] * 2, a[2] * 2, a[3] * 2, a[4] * 2, a[5], a[6], a[7], a[8]);
  ctx.imageSmoothingEnabled = sm;
 }
 const HC = new Map;
 const shade = (rgb, k) => { const v = rgb.match(/\d+/g).map(Number); return 'rgb(' + v.map(x => Math.round(x * k)).join(',') + ')'; };
 function headCanvas(I) {
  const key = I.M + I.m + I.n + (I.glow || ''); let c = HC.get(key); if (c) return c;
  const v = I.M.match(/\d+/g).map(Number), grayish = Math.max(...v) - Math.min(...v) < 28;
  const P = grayish ? { W: '#f4f4f4', w: '#e1e4e6', g: '#b0b0b0', m: '#a9b2b8', n: '#848b90' } : { W: I.M, w: shade(I.M, .93), g: shade(I.M, .72), m: I.m, n: I.n };
  const O = 3; c = document.createElement('canvas'); c.width = 10 + O * 2; c.height = 14 + O * 2; const x = c.getContext('2d');
  if (I.glow) { // same 1 sprite-px (= 2 half-px) ring and the same alpha as the shaft's glow
   const on = new Set(); HEAD.forEach((row, r) => { for (let q = 0; q < 10; q++) if (row[q] !== '.') { const R = Wn.__rl_no597crisp ? 3 : 1; for (let a = -R; a <= R; a++) for (let b = -R; b <= R; b++) on.add((q + a) + ',' + (r + b)); } });
   x.fillStyle = Wn.__rl_no597crisp ? I.glow : glowSolid(I.glow); /* 1.5e: crisp 1 half-px ring, one even layer (no soft cloud) */ on.forEach(k => { const [q, r] = k.split(',').map(Number); x.fillRect(q + O, r + O, 1, 1); });
   x.clearRect(O - 1, O - 1, 0, 0);
  }
  if (!I.glow || Wn.__rl_no595glow) { // 1.5c: glow sticks have no black outline - the glow wraps the head on every side (top too)
   x.fillStyle = '#0d0d0d'; HEAD.forEach((row, r) => { for (let q = 0; q < 10; q++) if (row[q] !== '.') { x.clearRect(q + O - 1, r + O - 1, 3, 3); } });
   HEAD.forEach((row, r) => { for (let q = 0; q < 10; q++) if (row[q] !== '.') x.fillRect(q + O - 1, r + O - 1, 3, 3); });
  }
  HEAD.forEach((row, r) => { for (let q = 0; q < 10; q++) { const ch = row[q]; if (ch === '.') continue; x.fillStyle = P[ch]; x.fillRect(q + O, r + O, 1, 1); } });
  HC.set(key, c); return c;
 }
 let di0 = null;
 // 1.5c (TestFlight 3): on low-res targets (card art 32x32, item slots, any canvas drawn at < 2 device px per sprite px) the
 // half-pixel head can't exist - it got squashed + rotated between pixels, so it never lined up. There a whole-pixel head
 // (7x9, the item-icon art) is inverse-mapped onto the shaft line, on the pixel grid.
 const H7 = ['.WWWWW.', 'WmnmnmW', 'WwwwwwW', 'WnmnmnW', 'WwwwwwW', '.WmnmW.', '..WnW..', '..WnW..', '...W...'];
 function drawHeadLow(ctx, I, ox, oy, s) {
  const v = I.M.match(/\d+/g).map(Number), grayish = Math.max(...v) - Math.min(...v) < 28;
  const P = grayish ? { W: '#f4f4f4', w: '#e1e4e6', m: '#a9b2b8', n: '#848b90' } : { W: I.M, w: shade(I.M, .9), m: I.m, n: I.n };
  const ax = ox + I.hx * s, ay = oy + I.hy * s, t = I.ang || 0, ux = Math.sin(t), uy = -Math.cos(t), px = Math.cos(t), py = Math.sin(t), on = new Map();
  try { if (ctx.getTransform) { const P = ctx.getTransform().transformPoint(new DOMPoint(ax + ux * 4.5 * s, ay + uy * 4.5 * s)); S.pk = { x: P.x, y: P.y, ctx: ctx }; } } catch (e) {}
  const X0 = Math.floor(ax - 11 * s), X1 = Math.ceil(ax + 11 * s), Y0 = Math.floor(ay - 11 * s), Y1 = Math.ceil(ay + 11 * s);
  for (let Y = Y0; Y <= Y1; Y++) for (let X = X0; X <= X1; X++) {
   const vx = (X + .5 - ax) / s, vy = (Y + .5 - ay) / s, al = vx * ux + vy * uy, ac = vx * px + vy * py, r = 8 - Math.floor(al), q = Math.floor(ac + 3.5);
   if (r >= 0 && r <= 8 && q >= 0 && q <= 6 && H7[r][q] !== '.') on.set(X + ',' + Y, H7[r][q]);
  }
  ctx.save();
  const ringC = I.glow || '#0d0d0d', seen = new Set(); ctx.fillStyle = ringC;
  on.forEach((_, k) => { const [X, Y] = k.split(',').map(Number); for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const kk = (X + a) + ',' + (Y + b); if (!on.has(kk) && !seen.has(kk)) { seen.add(kk); ctx.fillRect(X + a, Y + b, 1, 1); } } });
  on.forEach((ch, k) => { const [X, Y] = k.split(',').map(Number); ctx.fillStyle = P[ch]; ctx.fillRect(X, Y, 1, 1); });
  ctx.restore();
 }
 function drawHead(ctx, I, ox, oy, s) {
  try { if (s >= 4 && ctx.getTransform) { const m = ctx.getTransform(); if (m.a * s >= 8) S.hero = (typeof g !== 'undefined' && ctx !== g && !Wn.__rl_no597slam) ? null : { I, ox, oy, s, m, t: performance.now() }; } } catch (e) {} // 1.5e: a hero drawn into the idle-animation buffer (moved 1px after) is not redrawn on top - that drew a 2nd head
  try { const m = ctx.getTransform ? ctx.getTransform() : null, k = m ? Math.hypot(m.a, m.b) : 2; if (!Wn.__rl_no595low && k * s < 1.5) return drawHeadLow(ctx, I, ox, oy, s); } catch (e) {}
  const hc = headCanvas(I), hp = s / 2;
  ctx.save(); ctx.imageSmoothingEnabled = false; ctx.translate(ox + I.hx * s, oy + I.hy * s); if (I.ang) ctx.rotate(I.ang);
  di0.call(ctx, hc, -(3 + 5) * hp, -(3 + 14) * hp, 16 * hp, 20 * hp);
  try { if (ctx.getTransform) { const P = ctx.getTransform().transformPoint(new DOMPoint(0, -4.3 * s)); S.pk = { x: P.x, y: P.y, ctx: ctx }; } } catch (e) {} // 1.5f: where this head's mesh centre landed (v600pocket puts a dodging carrier's ball there) // throat (art col 5, bottom row) on the anchor
  ctx.restore();
 }
 // 1.5c (Jonny LOW): on BIG sprites (lobby / profile heroes) the baked 5x6 badge is a blocky smear - the crisp half-pixel
 // chest art goes over it, picked by the uni id the canvas was baked for (lobbyBake / bakeGear tag their canvases).
 function crispChest(ctx, img, I, dx, dy, s) {
  try {
   if (offC() || Wn.__rl_no596crisp || I.jcx == null || I.jr0 == null) return;
   const key = img.__rk15k || (curKit && curKit.rk15); if (!key || !Wn.RK15U || !RK15U.chestForKey) return;
   const m = ctx.getTransform ? ctx.getTransform() : null, k = (m ? Math.hypot(m.a, m.b) : 1) * s; if (k < 4) return;
   const C = RK15U.chestForKey(key); if (!C || !C.img || C.davy || !C.half) return;
   const im = C.img; if (!(im.tagName === 'CANVAS' || (im.complete && im.naturalWidth))) return;
   ctx.save(); ctx.imageSmoothingEnabled = false;
   if (!Wn.__rl_no597fill && (I.jfill || I.jcol)) { ctx.fillStyle = I.jfill || I.jcol; ctx.fillRect(dx + (I.jcx - 2) * s, dy + (I.jr0 + 2) * s, 5 * s, 6 * s); } // 1.5e: cover the baked whole-pixel badge first (its corners showed as stray pixels round the crisp art)
   di0.call(ctx, im, dx + (I.jcx - 2) * s, dy + (I.jr0 + 2) * s, 5 * s, 5.5 * s);
   ctx.restore();
  } catch (e) {}
 }
 const tag = (fn) => function (name, kit) { const c = fn.apply(this, arguments); try { if (c && typeof c === 'object') c.__rk15k = kit && kit.rk15 || null; } catch (e) {} return c; };
 try { if (typeof Wn.lobbyBake === 'function') Wn.lobbyBake = tag(Wn.lobbyBake); } catch (e) {}
 setTimeout(() => { try { if (Wn.V17 && typeof V17.bakeGear === 'function' && !V17.bakeGear.__t596) { const b = tag(V17.bakeGear); b.__t596 = 1; V17.bakeGear = b; } } catch (e) {} }, 0);
 let curKit = null; // the kit RL12.draw is drawing right now (set below): the badge/crown follow the uni id, not a colour read-back
 function drawChest(ctx, I, ox, oy, s) {
  if (offC() || !Wn.RK15U || !RK15U.chestFor) return;
  const C = curKit && curKit.rk15 && RK15U.chestForKey ? RK15U.chestForKey(curKit.rk15) : I.jcol ? RK15U.chestFor(I.jcol) : null; if (!C || C.davy) return;
  if (RK15U.baked && RK15U.baked() && !C.crown) return; // 1.5c: badges are painted into the sprite at bake time (v590uni) - only the crown is drawn here
  ctx.save(); ctx.imageSmoothingEnabled = false;
  try {
   const im = RK15U.baked && RK15U.baked() ? null : C.img, ok = im && (im.tagName === 'CANVAS' || (im.complete && im.naturalWidth)); if (ok) { const k = C.half ? .5 : 1, w = (im.naturalWidth || im.width) * k, h = (im.naturalHeight || im.height) * k; di0.call(ctx, im, ox + (I.jcx - Math.floor(w / 2)) * s, oy + (I.jr0 + 2) * s, w * s, h * s); } // origin on whole sprite pixels, 2 rows under the shoulders
   if (C.crown && I.hcx != null) { const P = ['s.g.s.g.s', 'sssssssss', 'sgsGsGsgs']; P.forEach((row, r) => { for (let q = 0; q < row.length; q++) { const k = row[q]; if (k === '.') continue; ctx.fillStyle = k === 's' ? '#e6eef4' : k === 'g' ? '#3dff8a' : Wn.__rl_no600jc ? '#ffd23a' : '#7dffb0'; ctx.fillRect(ox + (I.hcx - 4 + q) * s, oy + (I.hr0 - 3 + r) * s, s, s); } }); }
  } finally { ctx.restore(); }
 }
 // DAVY JONES: the real design sprites (front / side / run) replace the body sprite, feet on the same spot
 const DJ = {}; ['djF.png', 'djS.png', 'djR.png', 'jcF.png'].forEach(f => { const im = new Image(); im.src = 'rk15/' + f; DJ[f] = im; }); // half-pixel sprites cut from the approved DJ art
 const SIDEF = /^(cradle|shoot|check|hit|pole_|g_save_side|fall|down|getup)/;
 function drawDavy(ctx, I, dx, dy, s) {
  const im = DJ[/^(run|pole_run)/.test(I.name) ? 'djR.png' : SIDEF.test(I.name) ? 'djS.png' : 'djF.png'];
  if (!im || !im.complete || !im.naturalWidth) return false;
  const k = s / 2, w = im.naturalWidth * k, h = im.naturalHeight * k;
  const feetY = dy + (I.off + I.hd) * s, cx = Math.round(dx + (I.jcx != null ? I.jcx + .5 : I.off + I.wd / 2) * s);
  ctx.save(); ctx.imageSmoothingEnabled = false;
  if (I.flip) { ctx.translate(cx, 0); ctx.scale(-1, 1); di0.call(ctx, im, -Math.round(w / 2), feetY - h, w, h); }
  else di0.call(ctx, im, cx - Math.round(w / 2), feetY - h, w, h);
  ctx.restore(); return true;
 }
 // 1.5d DAVY JONES front view (lobby hero + bench, Charlie: 'compare against the mockup'): the per-pixel recolour can't show
 // the approved art (tricorn with gold tips + skull band, eye patch, gold collar, cream anchor, white cuffs) on a 16px body.
 // On the FRONT lobby frames only, and only for a canvas BAKED for the Davy uni (tag = uni id, never a colour guess), the
 // approved half-pixel djF art is drawn instead of the body; the player's own stick (gear, tape, glow) and skin colour stay.
 const DAVYF = new Set(['bench_idle0', 'lobby_pole', 'lobby_goalie']), DJA = new WeakMap(); // 1.5e: the goalie too (it showed the recoloured helmet + a gold band over the face)
 // 1.5f JADE CROWN, Chucks's per-frame art (rk15/jc/jc_<frame>.png, half-pixel, 6 extra rows on top for the crown).
 // Order (manifest): the normal bake x2 (skin, face, stick show through the art's holes) -> frame art (mirrored when the
 // bake is flipped) -> gold 1 on STRAIGHT FRONT frames only (view 'front', never d8SE) -> items + stick on top (steps 2-3
 // of davyArt below, shared). Returns undefined when this frame has no art (falls back), null while it is loading.
 const JCM = S.JCM = { meta: null, img: {}, one: null };
 try { fetch('rk15/jc/jc_frames.json').then(r => r.json()).then(j => { JCM.meta = j; }).catch(() => {}); const o = new Image(); o.src = 'rk15/jc/jc_one.png'; JCM.one = o; } catch (e) {}
 function jcPng(name) { let im = JCM.img[name]; if (!im) { im = new Image(); im.src = 'rk15/jc/jc_' + name + '.png'; JCM.img[name] = im; } return im; }
 // 1.5 B65: plain JADE = the same per-frame art with the crown taken off (crown box from jc_frames.json: cols x0..x1, rows y..y+3,
 // half-px units) and the helmet top closed with the outline colour; no gold 1. Kill switch: window.__rl_no600jade
 const JDP = {};
 const jadeOn = () => !Wn.__rl_no600jade && !Wn.__rl_no600jcf;
 function jadePng(name, png, m) {
  let c = JDP[name]; if (c) return c;
  c = document.createElement('canvas'); c.width = png.naturalWidth; c.height = png.naturalHeight; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; di0.call(x, png, 0, 0);
  const cr = m.crown; if (cr && cr.length >= 3) {
   const X0 = 2 * cr[0], X1 = 2 * cr[1] + 1, Y0 = 2 * cr[2], hy = Y0 + 8;
   x.clearRect(X0, Y0, X1 - X0 + 1, 8);
   if (hy + 1 < c.height) { const d = x.getImageData(X0, hy, X1 - X0 + 1, 2); for (let i = 0; i < d.data.length; i += 4) if (d.data[i + 3]) { d.data[i] = 13; d.data[i + 1] = 13; d.data[i + 2] = 13; d.data[i + 3] = 255; } x.putImageData(d, X0, hy); }
  }
  return (JDP[name] = c);
 }
 function jcFrameArt(img, I, plain) {
  const m = JCM.meta && JCM.meta[I.name]; if (!JCM.meta) { S.jcw = 'meta'; return null; } if (!m) { S.jcw = 'nometa ' + I.name; return undefined; }
  let png = jcPng(I.name); if (!png.complete) { S.jcw = 'loading ' + I.name; return null; } if (!png.naturalWidth) { S.jcw = 'broken ' + I.name; return undefined; }
  if (plain) png = jadePng(I.name, png, m);
  const off = I.off | 0, W2 = img.width * 2, H2 = img.height * 2, ex = 6;
  const A = document.createElement('canvas'); A.width = W2; A.height = H2 + ex; A.__ex = ex; const x = A.getContext('2d'); x.imageSmoothingEnabled = false; x.translate(0, ex);
  di0.call(x, img, 0, 0, W2, H2); // 1) the normal bake (the unhooked drawImage: the hooked one would recurse into this art): skin, face, stick, gear
  if (I.flip) { x.save(); x.translate(W2, 0); x.scale(-1, 1); }
  di0.call(x, png, 2 * off, 2 * off - ex); // 2) the art (its row 0 = 6 rows above the frame)
  if (I.flip) x.restore();
  const one = JCM.one; if (!plain && m.view === 'front' && m.one && one && one.complete && one.naturalWidth) { const ox = I.flip ? png.naturalWidth - m.one[0] - 8 : m.one[0]; di0.call(x, one, 2 * off + ox, 2 * off - ex + m.one[1]); } // 3) gold 1, straight front only
  A.__jc600 = 1; S.jcN = (S.jcN | 0) + 1; return jcTop(A, x, img, I, off);
 }
 function jcTop(A, x, img, I, off) { // davyArt steps 2-3 for the per-frame art: the player's stick, then every equipped item, on top
  try {
   const src = img.getContext('2d').getImageData(0, 0, img.width, img.height).data;
   const rows = RL12.FR[I.name][3], ch = (q, r) => { const row = rows[r]; return row ? row[I.flip ? I.wd - 1 - q : q] : undefined; };
   // 2) the player's own stick on top: shaft cells + the empty cells next to them (outline / tape / glow), doubled
   for (let r = -off; r < I.hd + off; r++) for (let q = -off; q < I.wd + off; q++) {
    const c = ch(q, r), stk = z => z === 'X' || (I.noHead && (z === 'M' || z === 'm' || z === 'n')); let keep = stk(c); // goalies keep their own goalie head
    if (!keep && (c === undefined || c === '.')) for (let a = -1; a <= 1 && !keep; a++) for (let b = -1; b <= 1; b++) if (stk(ch(q + a, r + b))) { keep = true; break; }
    if (!keep) continue; const i = ((r + off) * img.width + q + off) * 4; if (!src[i + 3]) continue;
    x.fillStyle = 'rgba(' + src[i] + ',' + src[i + 1] + ',' + src[i + 2] + ',' + (src[i + 3] / 255) + ')'; x.fillRect((q + off) * 2, (r + off) * 2, 2, 2);
   }
   // 3) every equipped item on top, in the normal layer order: the pixels where this bake differs from the same bake with no
   //    gear are the items (helmet, collar, chest, shorts, cleats, tape...). Stick cells were drawn in step 2.
   try {
    const lb = img.__lb597; if (!Wn.__rl_no597items && lb && img.pad17 != null && Wn.V17 && V17.bakeGear) {
     const plain = V17.bakeGear(lb.name, lb.kit, !!lb.flip, lb.skin | 0, {}, false, off ? undefined : { nopad: true });
     if (plain && plain.width === img.width && plain.height === img.height) {
      const p = plain.getContext('2d').getImageData(0, 0, plain.width, plain.height).data;
      for (let r = -off; r < I.hd + off; r++) for (let q = -off; q < I.wd + off; q++) {
       const c = ch(q, r); if (c === 'X' || c === 'M' || c === 'm' || c === 'n') continue;
       let nearStick = false; for (let a = -1; a <= 1 && !nearStick; a++) for (let b = -1; b <= 1; b++) { const z = ch(q + a, r + b); if (z === 'X' || z === 'M' || z === 'm' || z === 'n') { nearStick = true; break; } }
       if (nearStick && (c === undefined || c === '.')) continue;
       const i = ((r + off) * img.width + q + off) * 4; if (!src[i + 3]) continue;
       if (Math.abs(src[i] - p[i]) + Math.abs(src[i + 1] - p[i + 1]) + Math.abs(src[i + 2] - p[i + 2]) + Math.abs(src[i + 3] - p[i + 3]) < 12) continue;
       x.fillStyle = 'rgba(' + src[i] + ',' + src[i + 1] + ',' + src[i + 2] + ',' + (src[i + 3] / 255) + ')'; x.fillRect((q + off) * 2, (r + off) * 2, 2, 2);
      }
      shortLegs76(x, img, I, off, src, p, ch);
     }
    }
   } catch (e) { S.err = String(e); }
  } catch (e) { S.err = String(e); }
  return A;
 }
 // 1.5 B76 (Charlie: SHORT SHORTS on the DAVY JONES uni left a strip of the long Davy shorts at the knees): the custom art
 // (Davy djF, Jade / Jade Crown frame art) paints its own longer shorts / coat; step 3 only puts back the one row the short
 // shorts changed. Now with short shorts: every frame row from the shorts' bottom row down to the socks shows the player's
 // own legs (the normal bake, doubled) and the art outside the body there is cleared. Kill switch: window.__rl_no76ss
 function shortLegs76(x, img, I, off, src, p, ch) {
  try {
   if (Wn.__rl_no76ss) return;
   let sb = -1; for (let r = I.hd - 1; r >= 0 && sb < 0; r--) for (let q = 0; q < I.wd; q++) { const c = ch(q, r); if (c === 'J' || c === 'j') { sb = r; break; } }
   if (sb < 0) return;
   let short = false; // the short shorts turned the bottom shorts row into legs in this bake (not in the plain one)
   for (let q = 0; q < I.wd && !short; q++) { const c = ch(q, sb); if (c !== 'J' && c !== 'j') continue; const i = ((sb + off) * img.width + q + off) * 4; if (Math.abs(src[i] - p[i]) + Math.abs(src[i + 1] - p[i + 1]) + Math.abs(src[i + 2] - p[i + 2]) > 24) short = true; }
   if (!short) return;
   let r1 = I.hd; for (let r = sb + 1; r < I.hd; r++) { let hit = false; for (let q = 0; q < I.wd; q++) { const c = ch(q, r); if (c === 'W' || c === 'K' || c === 'v') { hit = true; break; } } if (hit) { r1 = r; break; } }
   for (let r = sb; r < r1; r++) for (let q = -off; q < I.wd + off; q++) {
    const c = ch(q, r), i = ((r + off) * img.width + q + off) * 4;
    if (c === 'X' || c === 'M' || c === 'm' || c === 'n') continue; // the stick stays
    let ns = false; for (let a = -1; a <= 1 && !ns; a++) for (let b = -1; b <= 1; b++) { const z = ch(q + a, r + b); if (z === 'X' || z === 'M' || z === 'm' || z === 'n') { ns = true; break; } } if (ns && (c === undefined || c === '.')) continue;
    x.clearRect((q + off) * 2, (r + off) * 2, 2, 2);
    if (c !== undefined && c !== '.' && src[i + 3]) { x.fillStyle = 'rgba(' + src[i] + ',' + src[i + 1] + ',' + src[i + 2] + ',' + (src[i + 3] / 255) + ')'; x.fillRect((q + off) * 2, (r + off) * 2, 2, 2); }
   }
   S.ss76 = (S.ss76 | 0) + 1;
  } catch (e) { S.err = String(e); }
 }
 function davyArt(img, I) {
  let A = DJA.get(img); if (A !== undefined) return A; A = null;
  try {
   if (img.__rk15k === 'jadecrown' && !Wn.__rl_no600jcf) { const r = jcFrameArt(img, I); if (r !== undefined) { if (r) DJA.set(img, r); return r; } }
   if (img.__rk15k === 'jade') { const r = jadeOn() ? jcFrameArt(img, I, true) : undefined; if (r) DJA.set(img, r); else if (r === undefined) DJA.set(img, null); return r || null; }
   const jc = img.__rk15k === 'jadecrown', dj = DJ[jc ? 'jcF.png' : 'djF.png']; if (!dj || !dj.complete || !dj.naturalWidth) return null; // 1.5f: JADE CROWN = the approved jcFront art (stick already cut out of jcF.png) // not cached: retried next draw
   const off = I.off | 0, W2 = img.width * 2, H2 = img.height * 2;
   const ex = jc && !Wn.__rl_no600jcex ? Math.max(0, dj.naturalHeight - (H2 - 2 * off + 2)) : 0; // 1.5f: the Jade Crown spikes stand above the frame: extra rows on top instead of cutting the crown
   A = document.createElement('canvas'); A.width = W2; A.height = H2 + ex; A.__ex = ex; const x = A.getContext('2d'); x.imageSmoothingEnabled = false; if (ex) x.translate(0, ex);
   // 1) the art, bottoms aligned (feet on the frame's last row), its own white stick removed (half-px cols >= 23 that are stick grey / white / shaft)
   const t = document.createElement('canvas'); t.width = dj.naturalWidth; t.height = dj.naturalHeight; const tx = t.getContext('2d'); tx.drawImage(dj, 0, 0);
   const id = tx.getImageData(0, 0, t.width, t.height), d = id.data, src = img.getContext('2d').getImageData(0, 0, img.width, img.height).data;
   const rows = RL12.FR[I.name][3], ch = (q, r) => { const row = rows[r]; return row ? row[I.flip ? I.wd - 1 - q : q] : undefined; };
   let skin = null; for (let r = 0; r < I.hd && !skin; r++) for (let q = 0; q < I.wd; q++) if (ch(q, r) === 'S') { const i = ((r + off) * img.width + q + off) * 4; if (src[i + 3] > 200) { skin = [src[i], src[i + 1], src[i + 2]]; break; } }
   for (let i = 0; i < d.length; i += 4) {
    if (!d[i + 3]) continue; const px = (i / 4) % t.width, R = d[i], G = d[i + 1], B = d[i + 2];
    const stickC = (R > 140 && Math.abs(R - G) < 30 && Math.abs(G - B) < 30) || (R < 50 && G < 50 && B < 60 && B > R + 4);
    if (!jc && px >= 23 && stickC) { d[i + 3] = 0; continue; }
    if (skin && R > 200 && G > 165 && G < 205 && B > 120 && B < 165) { d[i] = skin[0]; d[i + 1] = skin[1]; d[i + 2] = skin[2]; } // 1.5e: the player's exact skin (a brightness-scaled tint went muddy on darker skin)
   }
   tx.putImageData(id, 0, 0);
   if (I.flip) { x.save(); x.translate(W2, 0); x.scale(-1, 1); }
   x.drawImage(t, 2 * off, H2 - 2 * off - t.height + 2); // art bottom row = the frame's bottom row
   if (I.flip) x.restore();
   // 2) the player's own stick on top: shaft cells + the empty cells next to them (outline / tape / glow), doubled
   for (let r = -off; r < I.hd + off; r++) for (let q = -off; q < I.wd + off; q++) {
    const c = ch(q, r), stk = z => z === 'X' || (I.noHead && (z === 'M' || z === 'm' || z === 'n')); let keep = stk(c); // goalies keep their own goalie head
    if (!keep && (c === undefined || c === '.')) for (let a = -1; a <= 1 && !keep; a++) for (let b = -1; b <= 1; b++) if (stk(ch(q + a, r + b))) { keep = true; break; }
    if (!keep) continue; const i = ((r + off) * img.width + q + off) * 4; if (!src[i + 3]) continue;
    x.fillStyle = 'rgba(' + src[i] + ',' + src[i + 1] + ',' + src[i + 2] + ',' + (src[i + 3] / 255) + ')'; x.fillRect((q + off) * 2, (r + off) * 2, 2, 2);
   }
   // 3) every equipped item on top, in the normal layer order: the pixels where this bake differs from the same bake with no
   //    gear are the items (helmet, collar, chest, shorts, cleats, tape...). Stick cells were drawn in step 2.
   try {
    const lb = img.__lb597; if (!Wn.__rl_no597items && lb && img.pad17 != null && Wn.V17 && V17.bakeGear) {
     const plain = V17.bakeGear(lb.name, lb.kit, !!lb.flip, lb.skin | 0, {}, false, off ? undefined : { nopad: true });
     if (plain && plain.width === img.width && plain.height === img.height) {
      const p = plain.getContext('2d').getImageData(0, 0, plain.width, plain.height).data;
      for (let r = -off; r < I.hd + off; r++) for (let q = -off; q < I.wd + off; q++) {
       const c = ch(q, r); if (c === 'X' || c === 'M' || c === 'm' || c === 'n') continue;
       let nearStick = false; for (let a = -1; a <= 1 && !nearStick; a++) for (let b = -1; b <= 1; b++) { const z = ch(q + a, r + b); if (z === 'X' || z === 'M' || z === 'm' || z === 'n') { nearStick = true; break; } }
       if (nearStick && (c === undefined || c === '.')) continue;
       const i = ((r + off) * img.width + q + off) * 4; if (!src[i + 3]) continue;
       if (Math.abs(src[i] - p[i]) + Math.abs(src[i + 1] - p[i + 1]) + Math.abs(src[i + 2] - p[i + 2]) + Math.abs(src[i + 3] - p[i + 3]) < 12) continue;
       x.fillStyle = 'rgba(' + src[i] + ',' + src[i + 1] + ',' + src[i + 2] + ',' + (src[i + 3] / 255) + ')'; x.fillRect((q + off) * 2, (r + off) * 2, 2, 2);
      }
      shortLegs76(x, img, I, off, src, p, ch);
     }
    }
   } catch (e) { S.err = String(e); }
  } catch (e) { S.err = String(e); A = null; }
  DJA.set(img, A); return A;
 }
 function davyDraw(ctx, orig, img, a) {
  if (Wn.__rl_no597davy || offC() || !img || !(img.__rk15k === 'davy' || (img.__rk15k === 'jadecrown' && !Wn.__rl_no600jc) || (img.__rk15k === 'jade' && jadeOn())) || !(img.width <= 64)) return false;
  const I = analyse(img), jcf = !!(I && (img.__rk15k === 'jadecrown' || img.__rk15k === 'jade') && !Wn.__rl_no600jcf && JCM.meta && JCM.meta[I.name]); if (!I || (!DAVYF.has(I.name) && !jcf)) { S.dv = 'name ' + (I && I.name); return false; }
  const n = a.length, sc = n === 5 ? a[3] / img.width : n === 9 ? a[7] / a[3] : 1; if (sc < 2 && !jcf) { S.dv = 'sc ' + sc; return false; } // only big draws (lobby hero x5, bench x2); Jade Crown frame art at every size (field too)
  const A = davyArt(img, I); if (!A) { S.dv = 'art'; return false; } S.dv = 'ok ' + img.__rk15k;
  const ex = A.__ex | 0;
  if (n === 3) { orig.call(ctx, A, a[1], a[2] - ex / 2, img.width, img.height + ex / 2); return true; }
  if (n === 5) { const k = a[4] / img.height / 2; orig.call(ctx, A, a[1], a[2] - ex * k, a[3], a[4] + ex * k); }
  else if (ex && a[2] === 0) { const k = a[8] / a[4] / 2; orig.call(ctx, A, a[1] * 2, 0, a[3] * 2, a[4] * 2 + ex, a[5], a[6] - ex * k, a[7], a[8] + ex * k); }
  else orig.call(ctx, A, a[1] * 2, a[2] * 2 + ex, a[3] * 2, a[4] * 2, a[5], a[6], a[7], a[8]);
  return true;
 }
 // 1.5 B73 (Charlie: 'a normal stick head is drawn over the turkey leg'): sticks with their OWN head art (Turkey Leg: v565turkey
 // paints the drumstick over the old head cells after the sprite) never get the generic new head. The gear bake that carries
 // such a stick is tagged (V17.bakeGear below); the big hero (lobbyBake) is checked by the hero's gear. Item flag: tk565 or
 // ownHead73 (for any later novelty stick). Kill switch: window.__rl_no73own
 const ownId73 = id => { try { const it = id && Wn.V17 && V17.BY[id]; return !!(it && (it.ownHead73 || it.tk565) && it.slot === 'stick'); } catch (e) { return false; } };
 function ownHead73(img) {
  if (Wn.__rl_no73own || !img) return false;
  if (img.__oh73) return true;
  return !!(heroOwn73 && img.__lb597 && !img.__bg597);
 }
 let heroOwn73 = false;
 try { if (typeof Wn.lobbyHero === 'function' && !Wn.lobbyHero.__oh73) { const L0 = Wn.lobbyHero; const L1 = function (cx, feetY, pos, kit, skin, gray, k, t, alpha, slide, flip, side) { const was = heroOwn73; try { const pid = Wn.__v17hp, gr = pid && V17.heroGear ? V17.heroGear(pid, kit) : null; heroOwn73 = !!(!gray && !side && pid && gr && ownId73(gr.stick) && !(V17.heroNoStick && V17.heroNoStick(pid))); } catch (e) { heroOwn73 = false; } try { return L0.apply(this, arguments); } finally { heroOwn73 = was; } }; L1.__oh73 = 1; Object.keys(L0).forEach(k => { try { L1[k] = L0[k]; } catch (e) {} }); Wn.lobbyHero = L1; } } catch (e) { S.err = String(e); }
 S.ownHead73 = ownHead73;
 try { if (Wn.V17 && V17.bakeGear && !V17.bakeGear.__oh73) { const B0 = V17.bakeGear; const B1 = function (name, kit, flip, skin, gr) { const c = B0.apply(this, arguments); try { if (c && typeof c === 'object' && gr && ownId73(gr.stick) && !(arguments[6] && arguments[6].nostick)) c.__oh73 = 1; } catch (e) {} return c; }; B1.__oh73 = 1; Object.keys(B0).forEach(k => { try { B1[k] = B0[k]; } catch (e) {} }); V17.bakeGear = B1; } } catch (e) { S.err = String(e); }
 const hook = (orig) => function (img) {
  let r, done = false;
  try { glowDraw(this, orig, img, arguments); } catch (e) { S.err = String(e); }
  try { done = davyDraw(this, orig, img, arguments); } catch (e) { S.err = String(e); done = false; }
  if (!done) r = orig.apply(this, arguments);
  try {
   if (img && img.tagName === 'CANVAS' && img.width <= 64 && img.height <= 64) {
    const I = analyse(img);
    if (I) {
     let dx, dy, s = 1; const n = arguments.length;
     if (n === 3) { dx = arguments[1]; dy = arguments[2]; }
     else if (n === 5) { dx = arguments[1]; dy = arguments[2]; s = arguments[3] / img.width; }
     else if (n === 9 && arguments[1] === 0 && arguments[3] === img.width) { dx = arguments[5]; dy = arguments[6] - arguments[2] * (arguments[7] / img.width); s = arguments[7] / img.width; if (arguments[2] !== 0) return r; }
     const jc6 = !Wn.__rl_no600jc && ((curKit && curKit.rk15 === 'jadecrown') || img.__rk15k === 'jadecrown'); // 1.5f: Jade Crown art carries its own crown + gold 1; the field look paints the gold 1 itself
     const jd6 = jadeOn() && (img.__rk15k === 'jade' || (curKit && curKit.rk15 === 'jade')); // 1.5 B65: plain Jade has no chest badge / crown (its facet colours read back as the Jade Crown jersey)
     if (dx != null) { if (!(jc6 && done) && !jd6) drawChest(this, I, dx, dy, s); if (!jc6 && !jd6) crispChest(this, img, I, dx, dy, s); if (!I.noHead && !offH() && !ownHead73(img)) { drawHead(this, I, dx, dy, s); if (I.hm && !done && !Wn.__rl_no72head) di0.call(this, I.hm, dx, dy, img.width * s, img.height * s); } }
    }
   }
  } catch (e) { S.err = String(e); }
  return r;
 };
 try { const d0 = RL12.draw; RL12.draw = function (g, name, x, y, kit) { const k0 = curKit; curKit = kit || null; try { return d0.apply(this, arguments); } finally { curKit = k0; } }; } catch (e) {}
 di0 = CanvasRenderingContext2D.prototype.drawImage;
 CanvasRenderingContext2D.prototype.drawImage = hook(di0);
 // the main buffer's context carries its own drawImage (v473safe safe-area stretch) that calls the old prototype: wrap it too
 try { if (typeof off !== 'undefined' && off.getContext) { const gx = off.getContext('2d'); if (Object.prototype.hasOwnProperty.call(gx, 'drawImage')) gx.drawImage = hook(gx.drawImage); } } catch (e) { S.err = String(e); }
 // canvases analysed while the switch is on keep their cleared head; turning it off later only stops drawing new heads
})();
