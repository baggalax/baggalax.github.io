/* v583ct.js - 1.4 CARD TEAMS IN SPECIAL UNIFORMS (Bagga Lax 1.4, Nov 20 2026). Kill switch: window.__rl_no583 = true.
 * Charlie: "my card team disappeared and I can't see it in any teams menu, ratings or edit teams. It still exists because
 *   all my cards say they are on a team. Also the Turkey Trotters have no tail until you click switch on their uniform."
 * Cause 1: v33 registers card teams (SZ_REG) once at load, and a card team whose UNIFORM SET is a team that turns on
 *   later (Turkey Trotters TKT from v565, Veterans, Good Stick...) fails build() (T(uni) not there yet) and is skipped.
 *   It stays saved (cards still on it) but no menu can see it until something re-registers. Repro'd in the harness.
 *   Fix: whenever a saved card team is missing from SZ_REG and its uniform team now exists, re-run V33.regAll().
 * Cause 2: uni21 asks UNI21X (v489 / v504 / v565 chain) for the special kits by the CARD TEAM id, which none of them own,
 *   so a card team in the Turkey uniform got plain team colors (no g27 tag = no tail / legs / gobble).
 *   Fix: UNI21X answers for a card team with its uniform team's answers (own / nK / styN / kitOf by szBase).
 * No ids, rl_ keys or net changes. */
(function () {
 'use strict';
 const W = window;
 if (W.__rl_v583_loaded || W.__rl_v124gb) return;
 W.__rl_v583_loaded = 1;
 const V = W.V583 = { err: [], regs: 0 };
 const off = () => !!W.__rl_no583;
 const fail = (w, e) => { if (V.err.length < 20) V.err.push(w + ': ' + String(e && e.message || e)); };
 const reg = () => typeof SZ_REG !== 'undefined' ? SZ_REG : {};
 const baseOf = tid => { const s = tid && reg()[tid]; return s && s.sz && s.szBase ? s.szBase : null; };
 // 1. re-register card teams whose uniform team came online late
 function fixReg() {
  if (off() || !W.V33 || !V33.D || !V33.regAll) return;
  let miss = false;
  for (const k of [ 'pro', 'col' ]) for (const t of (V33.D[k] || [])) {
   if (!t || reg()[t.id]) continue;
   let b = null; try { b = T(t.uni); } catch (e) {}
   if (b && b.id === t.uni) { miss = true; break; }
  }
  if (!miss) return;
  try { V33.regAll(); V.regs++; if (typeof panelDirty === 'function') panelDirty(); } catch (e) { fail('reg', e); }
 }
 V.fixReg = fixReg;
 // 2. special kits for card teams wearing a special uniform set
 function wrapX() {
  const X = W.UNI21X;
  if (!X || X.__v583) return;
  const call = (f, tid, a) => { try { return f ? f.apply(X, [ tid ].concat(a)) : undefined; } catch (e) { fail('x', e); return undefined; } };
  const W2 = Object.assign({}, X, {
   __v583: 1,
   own: tid => { if (call(X.own, tid, [])) return true; if (off()) return false; const b = baseOf(tid); return !!(b && call(X.own, b, [])); },
   nK: (tid, ...a) => { const b = !off() && !call(X.own, tid, []) && baseOf(tid); return call(X.nK, b || tid, a); },
   styN: (tid, ...a) => { const b = !off() && !call(X.own, tid, []) && baseOf(tid); return call(X.styN, b || tid, a); },
   kitOf: (tid, ...a) => { const b = !off() && !call(X.own, tid, []) && baseOf(tid); return call(X.kitOf, b || tid, a); }
  });
  W.UNI21X = W2;
 }
 function tick() { try { fixReg(); } catch (e) { fail('tick', e); } try { wrapX(); } catch (e) { fail('wrap', e); } }
 tick();
 setTimeout(tick, 300);
 setInterval(tick, 1500);
})();
