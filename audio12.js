const RL12A = (() => {
 const BASE = 'audio/';
 const VOICES = [ {
  "id": "save_01_goalie",
  "cat": "save",
  "text": "GET THAT WEAK STUFF OUTTA HERE, BUDDY!",
  "d": 2.12
 }, {
  "id": "save_02_goalie",
  "cat": "save",
  "text": "NOT IN MY HOUSE!",
  "d": 1.62
 }, {
  "id": "save_03_goalie",
  "cat": "save",
  "text": "NOT TODAY, BUD!",
  "d": 1.38
 }, {
  "id": "save_04_goalie",
  "cat": "save",
  "text": "NOPE! DENIED!",
  "d": 2.04
 }, {
  "id": "save_05_goalie",
  "cat": "save",
  "text": "RIGHT IN THE CHEST, BABY!",
  "d": 1.65
 }, {
  "id": "save_06_goalie",
  "cat": "save",
  "text": "TRY AGAIN, BUDDD!",
  "d": 2.14
 }, {
  "id": "save_muffin_01",
  "cat": "save",
  "text": "MUFFIN! THANKS, BUD!",
  "d": 2.04
 }, {
  "id": "save_muffin_02",
  "cat": "save",
  "text": "THAT'S A MUFFIN, BUDDD!",
  "d": 2.01
 }, {
  "id": "save_muffin_03",
  "cat": "save",
  "text": "MUFFIN CITY, EH!",
  "d": 1.62
 }, {
  "id": "save_muffin_04",
  "cat": "save",
  "text": "WHO ORDERED THE MUFFIN?!",
  "d": 1.85
 }, {
  "id": "save_muffin_05",
  "cat": "save",
  "text": "MUFFIN! GET THAT OUTTA HERE, BUD!",
  "d": 2.12
 }, {
  "id": "ankle_01_knox",
  "cat": "ankle",
  "text": "ANKLES, BUDDD.",
  "d": 1.57
 }, {
  "id": "ankle_02_kael",
  "cat": "ankle",
  "text": "SIT DOWN, BUD.",
  "d": 1.18
 }, {
  "id": "ankle_03_knox",
  "cat": "ankle",
  "text": "YOU'RE COOKED, BUDDY.",
  "d": 1.7
 }, {
  "id": "ankle_04_kael",
  "cat": "ankle",
  "text": "SEE YA, BUDDD.",
  "d": 1.36
 }, {
  "id": "ankle_05_knox",
  "cat": "ankle",
  "text": "WHERE YA GOIN', BUD?",
  "d": 1.88
 }, {
  "id": "ankle_06_kael",
  "cat": "ankle",
  "text": "TOO EASY, EH.",
  "d": 1.62
 }, {
  "id": "hit_01_kael",
  "cat": "hit",
  "text": "GET OUTTA HERE, BUD.",
  "d": 1.72
 }, {
  "id": "hit_02_knox",
  "cat": "hit",
  "text": "OOH, FELT THAT ONE, BUD.",
  "d": 2.12
 }, {
  "id": "hit_03_kael",
  "cat": "hit",
  "text": "STAY DOWN, BUDDY.",
  "d": 1.83
 }, {
  "id": "hit_04_knox",
  "cat": "hit",
  "text": "WELCOME TO THE LEAGUE, BUDDD.",
  "d": 1.99
 }, {
  "id": "hit_05_kael",
  "cat": "hit",
  "text": "LIGHTS OUT, BUD.",
  "d": 1.23
 }, {
  "id": "goal_us_01_knox",
  "cat": "goal_us",
  "text": "THAT'S A BEAUTY, EH?",
  "d": 1.38
 }, {
  "id": "goal_us_02_kael",
  "cat": "goal_us",
  "text": "ABSOLUTE BEAUTY.",
  "d": 1.99
 }, {
  "id": "goal_us_03_goalie",
  "cat": "goal_us",
  "text": "WHEEL, SNIPE, CELLY, BUD.",
  "d": 2.09
 }, {
  "id": "goal_us_04_kael",
  "cat": "goal_us",
  "text": "TOP CHEDDAR, BUD.",
  "d": 1.85
 }, {
  "id": "goal_us_05_knox",
  "cat": "goal_us",
  "text": "TWINE TIME, BUDDD.",
  "d": 1.78
 }, {
  "id": "miss_01_kael",
  "cat": "miss",
  "text": "PIPE CITY, BUD.",
  "d": 1.1
 }, {
  "id": "miss_02_knox",
  "cat": "miss",
  "text": "NICE TRY, BUD.",
  "d": 1.83
 }, {
  "id": "miss_03_goalie",
  "cat": "miss",
  "text": "HIT THE NET, BUDDY.",
  "d": 1.12
 }, {
  "id": "miss_04_kael",
  "cat": "miss",
  "text": "PARKING LOT, BUDDD.",
  "d": 1.88
 }, {
  "id": "penalty_01_knox",
  "cat": "penalty",
  "text": "ENJOY THE BOX, BUD.",
  "d": 1.83
 }, {
  "id": "penalty_02_kael",
  "cat": "penalty",
  "text": "GO SIT IN THE BOX, BUDDY.",
  "d": 2.12
 }, {
  "id": "penalty_03_goalie",
  "cat": "penalty",
  "text": "SEE YA IN TWO, BUD.",
  "d": 1.07
 }, {
  "id": "faceoff_win_01_kael",
  "cat": "faceoff_win",
  "text": "CLAMPED, BUD.",
  "d": 1.31
 }, {
  "id": "faceoff_win_02_knox",
  "cat": "faceoff_win",
  "text": "TOO EASY AT THE X, EH.",
  "d": 1.99
 }, {
  "id": "faceoff_win_03_kael",
  "cat": "faceoff_win",
  "text": "OUR BALL, BUDDD.",
  "d": 1.2
 }, {
  "id": "timeout_01_knox",
  "cat": "timeout",
  "text": "TAKE A BREATHER, BOYS, EH.",
  "d": 1.57
 }, {
  "id": "timeout_02_kael",
  "cat": "timeout",
  "text": "RELAX, BOYS. WE GOT THIS, BUD.",
  "d": 2.01
 }, {
  "id": "bench_01_knox",
  "cat": "bench",
  "text": "LET'S GO, BOYS, WAKE UP, EH.",
  "d": 1.78
 }, {
  "id": "bench_02_kael",
  "cat": "bench",
  "text": "YOU CAN'T GUARD HIM, BUDDD.",
  "d": 1.99
 }, {
  "id": "bench_03_knox",
  "cat": "bench",
  "text": "HE'S GOT NOTHING, BUD.",
  "d": 1.57
 }, {
  "id": "bench_04_goalie",
  "cat": "bench",
  "text": "BEAUTY, KEEP IT ROLLING, BOYS.",
  "d": 1.96
 }, {
  "id": "bench_05_kael",
  "cat": "bench",
  "text": "SHOOT IT, BUD. SHOOT IT.",
  "d": 1.7
 }, {
  "id": "bench_06_knox",
  "cat": "bench",
  "text": "ABSOLUTE BEAUTY, BUDDY.",
  "d": 2.09
 }, {
  "id": "fire_01_goalie",
  "cat": "fire",
  "text": "FIRE! FIRE!",
  "d": 1.59
 }, {
  "id": "fire_02_goalie",
  "cat": "fire",
  "text": "FIRE! FIRE! FIRE!",
  "d": 2.01
 }, {
  "id": "fire_03_goalie",
  "cat": "fire",
  "text": "FIRE, FIRE!",
  "d": 1.83
 }, {
  "id": "coach_ref_01",
  "cat": "coach_ref",
  "text": "ARE YOU BLIND, REF?!",
  "d": 1.46
 }, {
  "id": "coach_ref_02",
  "cat": "coach_ref",
  "text": "THAT'S A TERRIBLE CALL!",
  "d": 1.91
 }, {
  "id": "coach_ref_03",
  "cat": "coach_ref",
  "text": "GET SOME GLASSES, STRIPES!",
  "d": 1.85
 }, {
  "id": "coach_ref_04",
  "cat": "coach_ref",
  "text": "HE DIDN'T EVEN TOUCH HIM!",
  "d": 1.78
 }, {
  "id": "coach_ref_05",
  "cat": "coach_ref",
  "text": "YOU'RE KILLING ME, REF!",
  "d": 1.93
 }, {
  "id": "coach_ref_06",
  "cat": "coach_ref",
  "text": "C'MON, THAT'S GARBAGE!",
  "d": 1.88
 }, {
  "id": "goalie_level_01",
  "cat": "goalie_level",
  "text": "STAY OUTTA MY CREASE, BUDDD!",
  "d": 1.93
 }, {
  "id": "goalie_level_02",
  "cat": "goalie_level",
  "text": "WELCOME TO MY HOUSE, BUD!",
  "d": 2.09
 }, {
  "id": "goalie_level_03",
  "cat": "goalie_level",
  "text": "THAT'S MY CREASE, BUD!",
  "d": 1.99
 }, {
  "id": "goalie_level_04",
  "cat": "goalie_level",
  "text": "KNOCK KNOCK! NOBODY'S HOME, BUDDD!",
  "d": 2.4
 }, {
  "id": "goalie_level_05",
  "cat": "goalie_level",
  "text": "GET OUTTA HERE, BUD!",
  "d": 1.36
 }, {
  "id": "goalie_level_06",
  "cat": "goalie_level",
  "text": "NOT IN MY HOUSE, BUDDD!",
  "d": 1.88
 }, {
  "id": "faking_01",
  "cat": "faking_it",
  "text": "HE'S FAKING IT, BUD.",
  "d": 1.75
 }, {
  "id": "faking_02",
  "cat": "faking_it",
  "text": "GET UP, YOU'RE FINE, BUDDD.",
  "d": 2.12
 }, {
  "id": "faking_03",
  "cat": "faking_it",
  "text": "OSCAR GOES TO NUMBER NINE, BUD.",
  "d": 2.35
 }, {
  "id": "faking_04",
  "cat": "faking_it",
  "text": "WALK IT OFF, BUD.",
  "d": 1.67
 }, {
  "id": "faking_05",
  "cat": "faking_it",
  "text": "HE'S FINE, HE'S MILKING IT, BUDDD.",
  "d": 2.3
 } ];
 const FILES = {
  "crowd_cheer": "sfx/crowd_cheer.mp3",
  "crowd_cheer_big": "sfx/crowd_cheer_big.mp3",
  "check_clack": "sfx/check_clack.mp3",
  "hit_light": "sfx/hit_light.mp3",
  "hit_big": "sfx/hit_big.mp3"
 };
 const CAT = {};
 for (const v of VOICES) {
  FILES[v.id] = 'voices/' + v.id + '.mp3';
  (CAT[v.cat] = CAT[v.cat] || []).push(v.id);
 }
 const TEXT = {}, DUR = {};
 for (const v of VOICES) {
  TEXT[v.id] = v.text;
  DUR[v.id] = v.d;
 }
 const buf = {}, pending = {};
 function load(ac) {
  if (!ac) return;
  for (const k in FILES) {
   if (buf[k] || pending[k]) continue;
   pending[k] = fetch(BASE + FILES[k]).then(r => r.arrayBuffer()).then(a => new Promise((res, rej) => ac.decodeAudioData(a, res, rej))).then(b => {
    buf[k] = b;
   }).catch(() => {
    delete pending[k];
   });
  }
 }
 function play(ac, name, vol, rate) {
  try {
   if (!ac || typeof muted !== 'undefined' && muted || !buf[name]) return null;
   const s = ac.createBufferSource(), g = ac.createGain();
   s.buffer = buf[name];
   s.playbackRate.value = rate || 1;
   g.gain.value = vol == null ? 1 : vol;
   s.connect(g);
   g.connect(ac.destination);
   s.start();
   return s;
  } catch (e) {
   return null;
  }
 }
 const TAKES = {
  c172_stick_01: [ 'knox_detwigged_1', 'knox_detwigged_2' ],
  c172_stick_02: [ 'knox_lostsomething_1', 'knox_lostsomething_2' ],
  c173_relax_01: [ 'knox_relaxpal_1', 'knox_relaxpal_2' ],
  oldman_back: [ 'oldman_ohmyback_1', 'oldman_ohmyback_2' ],
  oldman_groan: [ 'oldman_groan_1' ],
  crowd_ewww: [ 'crowd_ewww_1', 'crowd_ewww_2' ],
  top_cheddar: [ 'knox_topcheddar_1', 'knox_topcheddar_2' ]
 };
 const TDUR = {
  "crowd_ewww_1": 1.65,
  "crowd_ewww_2": 1.65,
  "oldman_groan_1": 2.9,
  "oldman_ohmyback_1": 4.34,
  "oldman_ohmyback_2": 4.31,
  "knox_detwigged_1": 1.96,
  "knox_detwigged_2": 2.66,
  "knox_lostsomething_1": 1.62,
  "knox_lostsomething_2": 1.31,
  "knox_relaxpal_1": 2.35,
  "knox_relaxpal_2": 1.99,
  "knox_topcheddar_1": 1.57,
  "knox_topcheddar_2": 2.19
 };
 for (const k in TAKES) for (const f of TAKES[k]) FILES[f] = (/^crowd_/.test(f) ? 'sfx/' : 'voices/') + f + '.mp3';
 const CUT287 = {
  knox_relaxpal_1: 1.75,
  knox_relaxpal_2: 1.34
 };
 const on206 = () => typeof window === 'undefined' || !(window.__rl_no206 || window.__rl_v124gb);
 const rnd206 = (() => {
  const b = new Uint32Array(1);
  let q = 206;
  return () => {
   try {
    crypto.getRandomValues(b);
    return b[0] / 4294967296;
   } catch (e) {
    q = Math.imul(q, 1103515245) + 12345 & 2147483647;
    return q / 2147483648;
   }
  };
 })();
 const last206 = {};
 const play0 = play;
 function play206(ac, name, vol, rate) {
  const T = TAKES[name];
  if (!T) return play0(ac, name, vol, rate);
  if (!on206()) return null;
  const ok = T.filter(f => buf[f]);
  if (!ok.length) return null;
  let j = Math.floor(rnd206() * ok.length);
  if (ok.length > 1 && ok[j] === last206[name]) j = (j + 1) % ok.length;
  const f = ok[j], s = play0(ac, f, vol, rate);
  if (s) {
   last206[name] = f;
   DUR[name] = TDUR[f] || DUR[name];
  }
  if (s && CUT287[f] && !(typeof window !== 'undefined' && window.__rl_no287relax)) {
   try {
    s.stop(ac.currentTime + CUT287[f] / (rate || 1));
    DUR[name] = CUT287[f];
   } catch (e) {}
  }
  return s;
 }
 return {
  FILES: FILES,
  TEXT: TEXT,
  DUR: DUR,
  CAT: CAT,
  VOICES: VOICES,
  load: load,
  play: play206,
  loaded: () => Object.keys(buf).length,
  TAKES: TAKES,
  TDUR: TDUR,
  on206: on206,
  CUT287: CUT287
 };
})();

if (typeof module !== 'undefined') module.exports = RL12A;
