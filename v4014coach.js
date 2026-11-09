(function() {
 'use strict';
 const OFF = () => !!window.__rl_no4014coach || !!window.__rl_v124gb;
 const LOG = {
  asks: [],
  demos: [],
  errs: [],
  frames: 0
 };
 window.V4014C = {
  on: false,
  LOG: LOG
 };
 if (OFF()) return;
 if (typeof window.drawHelp !== 'function' || typeof text !== 'function' || typeof button !== 'function' || typeof rect !== 'function') return;
 const err = (e, w) => {
  try {
   LOG.errs.push((w || '') + ': ' + String(e && e.message || e).slice(0, 160));
   console.error(e);
  } catch (x) {}
 };
 const rt = () => performance.now() / 1e3;
 const scr = () => {
  try {
   return screen;
  } catch (e) {
   return '';
  }
 };
 const G0 = () => {
  try {
   return game;
  } catch (e) {
   return null;
  }
 };
 const tw = (s, sc) => textW(s, sc || 1);
 function ST(k) {
  try {
   const s = window.V4012T && V4012T.ST;
   if (s && typeof s[k] === 'number' && s[k] >= 0) return s[k];
   const idx = n => TUTX.findIndex(x => x && x[0] === n);
   const m = {
    SHOT38: () => idx('SHOOTING'),
    FD38: () => idx('FACE DODGE'),
    BULL: () => TB.BULL,
    FO1: () => TUT_FO_STEP,
    CHECK: () => TD.CHECK,
    HIT: () => TD.HIT,
    OUTLET: () => TC.OUTLET,
    TAPSW: () => TD.TAP,
    OTS: () => TV28.OTS,
    SWIM: () => TV28.SWIM,
    TOE: () => TV28.TOE,
    AIR: () => TV20.AIR,
    CUT: () => TCUT181
   }[k];
   const v = m ? m() : -1;
   return typeof v === 'number' && v >= 0 ? v : -1;
  } catch (e) {
   return -1;
  }
 }
 const pick = (a, b) => a >= 0 ? a : b;
 const QA = [ {
  id: 'shoot',
  chip: 'SHOOT',
  pg: 1,
  kw: [ 'shoot', 'shot', 'shooting', 'score', 'scoring', 'snipe', 'rip', 'fire', 'goal', 'aim', 'power shot', 'hard shot', 'tap in', 'shoot harder' ],
  a: 'TOUCH THE GOAL, THEN DRAG YOUR THUMB BACK AWAY FROM THE NET. THAT LINE IS YOUR AIM - FARTHER BACK = HARDER. LET GO = SNIPE. RIGHT NEXT TO THE CREASE? JUST TAP A CIRCLE.',
  demo: () => pick(ST('SHOT38'), 2)
 }, {
  id: 'split',
  chip: 'SPLIT DODGE',
  pg: 1,
  kw: [ 'split dodge', 'split', 'splits', 'switch hands', 'change hands', 'crossover' ],
  a: 'LEFT THUMB RUNS. RIGHT THUMB: SWIPE STRAIGHT THE WAY YOU WANT TO GO = SPLIT DODGE. THE STICK SWITCHES HANDS - SPLIT RIGHT = RIGHT HAND. ANKLES: GONE.',
  demo: () => 14
 }, {
  id: 'roll',
  chip: 'ROLL DODGE',
  pg: 1,
  kw: [ 'roll dodge', 'roll', 'rolls', 'spin', 'spin move', 'turn back', 'roll back' ],
  a: 'RUN WITH YOUR LEFT THUMB, THEN DRAW A C WITH THAT SAME THUMB = ROLL DODGE. HE SPINS OFF HIS MAN. LEFT THUMB ONLY - A CURVE ON THE RIGHT IS A SWIM OR A TOE DRAG.',
  demo: () => 15
 }, {
  id: 'bull',
  chip: 'BULL DODGE',
  pg: 1,
  kw: [ 'bull dodge', 'bull', 'bulldoze', 'bull rush', 'power dodge', 'run through', 'run him over', 'truck him' ],
  a: 'LEFT THUMB RUNS STRAIGHT AT HIM. HOLD YOUR RIGHT THUMB DOWN = BULL DODGE. SHOULDER DOWN, RIGHT THROUGH HIM. I USED TO DO IT IN MY SLEEP.',
  demo: () => pick(ST('BULL'), 40)
 }, {
  id: 'fo',
  chip: 'FACE-OFF',
  pg: 1,
  kw: [ 'face off', 'faceoff', 'faceoffs', 'fo', 'fogo', 'draw', 'whistle', 'win the faceoff', 'clamp', 'wing', 'wings', 'violation' ],
  a: 'TAP DOWN (LEFT SIDE). PUT YOUR THUMB ON THE BUTTON (RIGHT SIDE) AND MASH IT ON SET. WHISTLE = SWIPE IN ANY DIRECTION, THE BALL POPS THAT WAY. HOLD A WING FIRST = IT POPS TO HIM.',
  demo: () => pick(ST('FO1'), 19)
 }, {
  id: 'pass',
  chip: 'PASS',
  pg: 1,
  kw: [ 'pass', 'passing', 'passes', 'throw', 'feed', 'assist', 'dish', 'open man', 'green ring' ],
  a: 'QUICK TAP A TEAMMATE = PASS. GREEN RING = HE IS OPEN. DRIVE, MAKE THE D SLIDE, HIT THE GUY THEY LEFT. OFF SCREEN? TAP HIS EDGE ARROW.',
  demo: () => 1
 }, {
  id: 'check',
  chip: 'CHECK + HIT',
  pg: 1,
  kw: [ 'defense', 'defence', 'defend', 'play d', 'd', 'check', 'checks', 'stick check', 'strip', 'take the ball', 'steal', 'poke', 'slap', 'hit', 'hits', 'body' ],
  a: 'LEFT THUMB MOVES. GET ON HIM (YELLOW DOTS = IN RANGE), TAP THE RIGHT SIDE = CHECK. 3 THAT LAND = IT POPS LOOSE. BIG HIT: RUN AT HIM, HOLD THE RIGHT SIDE, LET GO.',
  demo: () => pick(ST('CHECK'), -1)
 }, {
  id: 'ots',
  chip: 'OVER SHOULDER',
  pg: 1,
  kw: [ 'over the shoulder', 'over shoulder', 'overtheshoulder', 'ots', 'behind the back', 'gle', 'from x shot' ],
  a: 'CARRY IT FROM X (BEHIND THE CAGE) UP TO THE PINK RING BESIDE THE CAGE. TOUCH THE GOAL, DRAG YOUR THUMB BACK, LET GO = OVER THE SHOULDER. NO NEED TO SQUARE UP.',
  demo: () => ST('OTS')
 }, {
  id: 'air',
  chip: 'AIR DIVE',
  pg: 1,
  kw: [ 'air dive', 'airdive', 'dive', 'diving', 'jump', 'fly', 'flying', 'high flyer', 'legend card', 'dunk' ],
  a: 'YOU NEED THE AIR DIVE LEGEND CARD (GAME PASS LEVEL 21). PUT HIM AT X BEHIND THE CAGE, THEN TAP THE NET = HE FLIES OVER THE CREASE AND SHOOTS IN MID-AIR.',
  demo: () => ST('AIR')
 }, {
  id: 'packs',
  chip: 'PACKS + CARDS',
  pg: 1,
  kw: [ 'pack', 'packs', 'card pack', 'cards', 'card', 'open packs', 'yard sale', 'shop', 'store', 'free pack', 'legendary', 'rare', 'pull', 'player card' ],
  a: 'YARD SALE (TOP RIGHT OF HOME): A FREE PACK EVERY DAY, MORE FOR DIMES. TAP A CARD TO FLIP IT. GRAY = COMMON, BLUE = RARE, GOLD = LEGENDARY. IT ALL LANDS IN YOUR LOCKER ROOM.'
 }, {
  id: 'rename',
  chip: 'RENAME',
  pg: 1,
  kw: [ 'rename', 'renaming', 'edit names', 'edit name', 'change name', 'change names', 'players name', 'player name', 'player names', 'team name', 'name', 'names', 'jersey number', 'number', 'import' ],
  a: 'HOME > EDIT NAMES. PICK A TEAM, TAP A PLAYER, TYPE A NEW NAME + NUMBER, SAVE. TEAMS AND LEAGUES TOO. MAKE IT A GOOD ONE - NOBODY BEATS MINE.'
 }, {
  id: 'online',
  chip: 'PLAY ONLINE',
  pg: 1,
  kw: [ 'online', 'multiplayer', 'friend', 'friends', 'play friends', 'play my friend', 'invite', 'versus', 'vs', 'head to head', 'pvp', '1v1', 'join', 'online season' ],
  a: 'PLAY > ONLINE. SIGN IN, THEN INVITE A FRIEND HEAD-TO-HEAD (HE TAPS JOIN) OR RUN AN ONLINE SEASON. WIN IT = THE GOLD ONLINE TROPHY. I HAVE A FEW.'
 }, {
  id: 'swim',
  chip: 'SWIM MOVE',
  pg: 2,
  kw: [ 'swim', 'swim move', 'swimmove', 'over the top' ],
  a: 'LEFT THUMB RUNS. RIGHT THUMB: DRAW A BACKWARDS C = SWIM MOVE. STICK ARM OVER HIS HEAD AND YOU ARE BY HIM. SAME HAND. CLASSIC ME.',
  demo: () => ST('SWIM')
 }, {
  id: 'toe',
  chip: 'TOE DRAG',
  pg: 2,
  kw: [ 'toe drag', 'toedrag', 'toe', 'drag' ],
  a: 'LEFT THUMB RUNS. RIGHT THUMB: DRAW A C = TOE DRAG. BALL ACROSS THE TOES AND GONE - SAME HAND. GETS YOU A STEP ON YOUR MAN.',
  demo: () => ST('TOE')
 }, {
  id: 'fake',
  chip: 'FACE DODGE',
  pg: 2,
  kw: [ 'face dodge', 'facedodge', 'fake', 'fake shot', 'pump fake', 'shot fake', 'ball fake' ],
  a: 'PULL BACK LIKE A SHOT, THEN BRING YOUR THUMB BACK AND LET GO = FAKE. A CHARGING DEFENDER BITES AND FLIES RIGHT PAST. WORKS EVERY TIME ON ROOKIES.',
  demo: () => ST('FD38')
 }, {
  id: 'dodge',
  chip: '',
  pg: 0,
  kw: [ 'dodge', 'dodges', 'dodging', 'juke', 'beat my man', 'beat a defender', 'get past', 'get by' ],
  a: 'LEFT THUMB RUNS. SWIPE YOUR RIGHT THUMB ACROSS = DODGE. WANT IT FANCY? ASK ME ABOUT SPLIT, ROLL, BULL, SWIM, TOE DRAG OR FACE DODGE.',
  demo: () => 9
 }, {
  id: 'pick',
  chip: 'PICK',
  pg: 2,
  kw: [ 'pick', 'picks', 'screen', 'set a pick', 'pick and roll' ],
  a: 'HOLD YOUR THUMB ON A TEAMMATE = HE COMES OVER AND SETS A PICK. RUN YOUR GUY OFF IT. TEAMWORK. I ALLOW IT.',
  demo: () => 16
 }, {
  id: 'cut',
  chip: 'CUT',
  pg: 2,
  kw: [ 'cut', 'cuts', 'cutting', 'make him cut', 'run a cut', 'off ball' ],
  a: 'SWIPE A TEAMMATE = HE CUTS THAT WAY. THEN TAP HIM = PASS. GIVE AND GO, ROOKIE.',
  demo: () => pick(ST('CUT'), -1)
 }, {
  id: 'gb',
  chip: 'GROUND BALL',
  pg: 2,
  kw: [ 'ground ball', 'groundball', 'gb', 'gbs', 'scoop', 'loose ball', 'pick up the ball', 'grab the ball' ],
  a: 'DRAG YOUR LEFT THUMB TO RUN YOUR GUY (BLUE RING) OVER THE BALL. HE SCOOPS IT. MISSED SHOT? CLOSEST GUY WHEN IT GOES OUT GETS IT.',
  demo: () => 3
 }, {
  id: 'clear',
  chip: 'CLEARS',
  pg: 2,
  kw: [ 'clear', 'clears', 'clearing', 'outlet', 'goalie', 'save', 'cage to cage', 'ride', '10 second', 'ten second', 'count' ],
  a: 'GOALIE HAS IT: TAP AN OPEN TEAMMATE (GREEN RING) = OUTLET. OR DRAG HIM OUT, HE CAN GO CAGE TO CAGE. OVER MIDFIELD IN 10 SEC.',
  demo: () => pick(ST('OUTLET'), -1)
 }, {
  id: 'switch',
  chip: 'SWITCH D',
  pg: 2,
  kw: [ 'switch', 'switch players', 'switch defender', 'switch defenders', 'change defender', 'control', 'auto switch', 'slide', 'slides' ],
  a: 'ON D, TAP ANY OF YOUR DEFENDERS = NOW YOU RUN HIM. AUTO SWITCH JUMPS YOU TO THE BALL AFTER THEY PASS (TURN IT OFF IN SETTINGS).',
  demo: () => pick(ST('TAPSW'), -1)
 }, {
  id: 'chirp',
  chip: 'CHIRPS',
  pg: 2,
  kw: [ 'chirp', 'chirps', 'trash talk', 'talk', 'voice', 'celly', 'cellys', 'celebrate', 'celebration', 'dance' ],
  a: 'IN A GAME TAP CHIRP (BOTTOM MIDDLE) = YOUR BENCH LETS ONE FLY. PICK YOUR LINES IN CHIRP LOADOUT ON HOME. AFTER A GOAL, TAP CELLY.'
 }, {
  id: 'dimes',
  chip: 'DIMES',
  pg: 2,
  kw: [ 'dimes', 'dime', 'money', 'coins', 'coin', 'currency', 'cash', 'rich', 'get dimes', 'earn', 'sell' ],
  a: '+10 DIMES FOR EVERY WIN, ANY MODE. WEEKLY CHALLENGES PAY TOO. HOLD AN ITEM IN THE LOCKER ROOM TO SELL IT. SPEND THEM IN THE YARD SALE. ME? I SIT ON MINE.'
 }, {
  id: 'practice',
  chip: 'PRACTICE',
  pg: 2,
  kw: [ 'practice', 'drill', 'drills', 'train', 'training', 'get better', 'improve' ],
  a: 'PLAY, PICK A MODE, THEN PRACTICE. PICK OFFENSE OR D, A DRILL, SOME GHOSTS. TAP THE COACH ON THE SIDELINE FOR TIPS. HE IS NO ME, BUT HE TRIES.'
 }, {
  id: 'season',
  chip: 'SEASON',
  pg: 2,
  kw: [ 'season', 'pro season', 'playoffs', 'draft', 'schedule', 'franchise', 'career', 'title', 'championship' ],
  a: 'PLAY > PRO SEASON. DRAFT YOUR TEAM AND A HEAD COACH, PLAY THE SCHEDULE + PLAYOFFS. YOUR GEAR AND CREW COUNT HERE. WIN IT ALL - LIKE ME.'
 }, {
  id: 'move',
  pg: 0,
  kw: [ 'move', 'run', 'running', 'joystick', 'walk', 'sprint', 'run faster', 'controls', 'control my guy' ],
  a: 'LEFT THUMB = INVISIBLE JOYSTICK. PUT IT DOWN ANYWHERE AND DRAG. FARTHER = FASTER. LET GO = STOP. NOW YOU ARE MOVING. BARELY.',
  demo: () => 0
 }, {
  id: 'hit',
  pg: 0,
  kw: [ 'big hit', 'bighit', 'lay out', 'lay him out', 'level him', 'tackle', 'shove', 'hit stick', 'hit harder' ],
  a: 'RUN AT HIM, HOLD THE RIGHT SIDE (RING FILLS), LET GO = BIG HIT. LONGER RUN-UP = HARDER HIT. NO RUN-UP = JUST A SHOVE.',
  demo: () => pick(ST('HIT'), -1)
 }, {
  id: 'playbook',
  pg: 0,
  kw: [ 'playbook', 'plays', 'playmaker', 'run a play', 'make a play', 'set play', 'sets', 'formation', 'draw a play' ],
  a: 'IN A GAME TAP PLAYBOOK (TOP LEFT), PICK A PLAY. BUILD YOUR OWN IN PLAYMAKER: DRAG A ROUTE, ADD A PASS, PREVIEW, SAVE.'
 }, {
  id: 'timeout',
  pg: 0,
  kw: [ 'timeout', 'time out', 'timeouts' ],
  a: 'TIMEOUT (TOP BAR): PICK WHO STARTS AND DRAW A PLAY. TWO A GAME - USE THEM, I NEVER NEEDED ONE.'
 }, {
  id: 'settings',
  pg: 0,
  kw: [ 'settings', 'difficulty', 'level', 'harder', 'easier', 'hard mode', 'easy mode', 'sound', 'mute' ],
  a: 'HOME > SETTINGS (OR PAUSE > SETTINGS): PICK YOUR LEVEL, AUTO SWITCH, CHIRPS, AUTO CELLY. THE MUTE BUTTON IS BOTTOM RIGHT.'
 }, {
  id: 'rules',
  pg: 0,
  kw: [ 'rules', 'rule', 'penalty', 'penalties', 'flag', 'offsides', 'offside', 'shot clock', 'quarters', 'overtime', 'braveheart' ],
  a: '20 SEC SHOT CLOCK, 4 QUARTERS. OFFSIDES: 3 D + GOALIE BACK, 3 ATTACK UP. REFS FLAG REAL PENALTIES. TIED? OT, THEN BRAVEHEART 1 ON 1.'
 }, {
  id: 'gear',
  pg: 0,
  kw: [ 'gear', 'equip', 'items', 'item', 'locker room', 'locker', 'stick', 'sticks', 'tape', 'helmet', 'cleats', 'uniform', 'uniforms', 'visor' ],
  a: 'TAP A GEAR BOX NEXT TO YOUR BIG PLAYER ON HOME, THEN TAP AN ITEM. TAPE = +2 STICK SKILLS. GEAR COUNTS IN SEASON + WORLD GAMES.'
 }, {
  id: 'crew',
  pg: 0,
  kw: [ 'crew', 'team crew', 'staff', 'coach', 'head coach', 'hire' ],
  a: 'TEAM CREW ON HOME: 7 STAFF SPOTS. TAP ONE, HIRE A CREW CARD. THE BOOSTS BUILD UP AS YOUR SEASON GOES.'
 }, {
  id: 'pass2',
  pg: 0,
  kw: [ 'game pass', 'gamepass', 'battle pass', 'pass level', 'xp', 'levels' ],
  a: 'GAME PASS: 50 DIMES. +9 XP A WIN, +3 A LOSS. 21 LEVELS OF LOOT AND XP COUNTS EVEN BEFORE YOU BUY IT.'
 }, {
  id: 'weekly',
  pg: 0,
  kw: [ 'weekly', 'weekly challenges', 'challenge', 'challenges', 'achievements', 'achievement' ],
  a: 'WEEKLY ON HOME: 4 CHALLENGES A WEEK. EASY 10, MEDIUM 20 DIMES, THE HARD 3-STEP ONE PAYS A LEGENDARY ITEM.'
 }, {
  id: 'world',
  pg: 0,
  kw: [ 'world games', 'world', 'country', 'countries', 'national team', 'gold globe', 'college', 'ultimate' ],
  a: 'PLAY > WORLD GAMES: PICK A COUNTRY, WIN THE TOURNAMENT = GOLD GLOBE. COLLEGE AND ULTIMATE ARE IN PLAY TOO.'
 }, {
  id: 'hand',
  pg: 0,
  kw: [ 'lefty', 'righty', 'left handed', 'right handed', 'strong hand', 'weak hand', 'off hand' ],
  a: 'EVERY GUY IS A LEFTY OR A RIGHTY. STRONG HAND = HIS STICK SKILL. A SPLIT DODGE SWITCHES HANDS. SHOOT WITH THE STRONG ONE.'
 }, {
  id: 'custom',
  pg: 0,
  kw: [ 'custom card', 'custom player', 'create a player', 'create player', 'make my own player', 'my own guy', 'build a player' ],
  a: 'LOCKER ROOM > CARDS: TAP A CUSTOM CARD TO CREATE HIM. NAME, LOOK, THE WORKS. STILL WON\'T BE ME.'
 }, {
  id: 'tutorial',
  pg: 0,
  kw: [ 'tutorial', 'learn', 'teach me', 'basics', 'beginner', 'noob', 'noobs' ],
  a: 'HOME > TUTORIAL RUNS THE WHOLE THING. OR TAP A BUTTON DOWN THERE AND I SHOW YOU ONE MOVE. I AM FASTER.'
 }, {
  id: 'tips',
  pg: 0,
  kw: [ 'tips', 'tip', 'win', 'how to win', 'win more', 'strategy', 'get good', 'better' ],
  a: 'WIN FACE-OFFS. DRIVE, MAKE THEM SLIDE, HIT THE OPEN GUY. SHOOT FROM CLOSE, ALWAYS WITH HIS STRONG HAND. BASICALLY: BE ME.'
 }, {
  id: 'me',
  pg: 0,
  kw: [ 'who are you', 'mr bagga', 'bagga', 'your name', 'who r u', 'about you', 'trophies', 'throne', 'goat' ],
  a: 'WHO AM I?? MR. BAGGA. EVERY TROPHY YOU SEE: MINE. THIS THRONE? DIMES. ALL MINE. NOW ASK ME SOMETHING USEFUL, ROOKIE.'
 }, {
  id: 'hi',
  pg: 0,
  kw: [ 'hi', 'hello', 'hey', 'yo', 'sup', 'whats up' ],
  a: 'YEAH YEAH, HI. ASK ME HOW TO DO SOMETHING - DODGES, SHOTS, FACE-OFFS. I KNOW IT ALL.'
 }, {
  id: 'thanks',
  pg: 0,
  kw: [ 'thanks', 'thank you', 'thx', 'ty', 'appreciate' ],
  a: 'DON\'T THANK ME. GO WIN SOMETHING. THEN THANK ME.'
 } ];
 const BYID = {};
 for (const q of QA) BYID[q.id] = q;
 const W8 = {
  tips: .6,
  tutorial: .6,
  hi: .7,
  thanks: .8,
  me: .9,
  gear: .9,
  playbook: .9,
  settings: .9
 };
 const LINES = {
  hello: [ 'WATCH AND LEARN, ROOKIE. I\'VE DONE THIS A THOUSAND TIMES. ASK ME ANYTHING.', 'WELCOME TO THE THRONE. TYPE A QUESTION OR TAP ONE DOWN THERE.', 'YOU AGAIN? FINE. WHAT DO YOU WANT TO LEARN TODAY, ROOKIE?', 'EVERY TROPHY HERE IS MINE. ASK HOW I GOT THEM. OR HOW TO DODGE. WHATEVER.' ],
  miss: [ 'HUH? I ONLY ANSWER LAX QUESTIONS, ROOKIE. TRY: HOW DO I ROLL DODGE?', 'NEVER HEARD OF IT - AND I\'VE HEARD OF EVERYTHING. TAP A QUESTION BELOW.', 'SAY THAT AGAIN, BUT IN LACROSSE. LIKE: HOW DO I SHOOT?' ],
  back: [ 'NOT BAD, ROOKIE. NOT ME, BUT NOT BAD.', 'SEE? EASY WHEN I SHOW YOU.', 'I\'VE SEEN WORSE. I\'VE SEEN BETTER TOO - IN THE MIRROR.', 'THAT\'S HOW IT\'S DONE. WELL, CLOSE.' ]
 };
 let rot = 0;
 const line = k => {
  const L = LINES[k];
  rot++;
  return L[rot % L.length];
 };
 const norm = s => String(s || '').toLowerCase().replace(/[\u2018\u2019']/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
 function dist(a, b, max) {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const n = a.length, m = b.length;
  let p2 = null, p = new Array(m + 1), c;
  for (let j = 0; j <= m; j++) p[j] = j;
  for (let i = 1; i <= n; i++) {
   c = new Array(m + 1);
   c[0] = i;
   let lo = c[0];
   for (let j = 1; j <= m; j++) {
    const cost = a[i - 1] === b[j - 1] ? 0 : 1;
    c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + cost);
    if (p2 && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) c[j] = Math.min(c[j], p2[j - 2] + 1);
    if (c[j] < lo) lo = c[j];
   }
   if (lo > max) return max + 1;
   p2 = p;
   p = c;
  }
  return p[m];
 }
 const COMMON = new Set([ 'ball', 'play', 'game', 'team', 'goal', 'with', 'what', 'when', 'that', 'this', 'make', 'have', 'your', 'them', 'they', 'time', 'more', 'best', 'does', 'long', 'good', 'want', 'like', 'just', 'guys', 'some', 'into', 'from', 'take', 'away', 'then', 'there', 'where', 'how', 'do', 'to', 'the', 'can', 'get', 'out', 'off', 'all' ]);
 const tol = (k, ctx) => k.length >= 7 ? 2 : k.length >= 4 ? 1 : ctx && k.length === 3 ? 1 : 0;
 const near = (q, k, ctx) => {
  if (q === k) return true;
  if (ctx && q.length === 2 && k.length === 3 && k.startsWith(q)) return true;
  if (COMMON.has(q) || COMMON.has(k)) return false;
  const t = tol(k, ctx);
  if (!t || q.length < 3) return false;
  return dist(q, k, t) <= t;
 };
 const KW = QA.map(q => ({
  q: q,
  ks: q.kw.map(k => {
   const t = norm(k).split(' ').filter(Boolean);
   return {
    t: t,
    j: t.join('')
   };
  })
 }));
 function scoreEntry(e, T, J) {
  let best = 0, second = 0;
  for (const k of e.ks) {
   const n = k.t.length;
   let s = 0;
   if (n === 1) {
    const w = k.t[0];
    if (T.includes(w)) s = 10; else if (w.length >= 3 && T.some(q => near(q, w, false))) s = 7; else if (w.length >= 5 && J.some(q => q.length >= w.length + 3 && q.includes(w))) s = 6;
   } else {
    for (let i = 0; i + n <= T.length && s < 10 * n; i++) if (k.t.every((w, x) => T[i + x] === w)) s = 10 * n;
    if (!s && T.some(q => q === k.j)) s = 10 * n;
    if (!s) for (let i = 0; i + n <= T.length && !s; i++) if (k.t.every((w, x) => near(T[i + x], w, true))) s = 8 * n;
    if (!s) for (let i = 0; i + 1 <= T.length && !s; i++) for (let L = 1; L <= Math.min(4, T.length - i) && !s; L++) {
     const c = T.slice(i, i + L).join('');
     if (L !== n && (c === k.j || c.length >= 5 && dist(c, k.j, 1) <= 1)) s = 8 * n;
    }
    if (!s) {
     let i = 0, x = 0, gaps = 0;
     while (i < T.length && x < n) {
      if (near(T[i], k.t[x], true)) {
       x++;
      } else if (x > 0) {
       gaps++;
       if (gaps > 1) {
        x = 0;
        gaps = 0;
       }
      }
      i++;
     }
     if (x === n) s = 7 * n;
    }
    if (!s && k.j.length >= 6 && J.some(q => q.length > k.j.length && q.includes(k.j))) s = 8 * n;
   }
   if (s > best) {
    second = best;
    best = s;
   } else if (s > second) second = s;
  }
  return (best + second * .25) * (W8[e.q.id] || 1);
 }
 function match(question) {
  const T = norm(question).split(' ').filter(Boolean), J = T.length ? [ T.join('') ] : [];
  if (!T.length) return {
   id: null,
   score: 0
  };
  let top = null, ts = 0, sc = {};
  for (const e of KW) {
   const s = scoreEntry(e, T, J);
   if (s > 0) sc[e.q.id] = +s.toFixed(2);
   if (s > ts) {
    ts = s;
    top = e.q;
   }
  }
  return ts >= 6 ? {
   id: top.id,
   score: ts,
   all: sc
  } : {
   id: null,
   score: ts,
   all: sc
  };
 }
 const C = {
  classic: false,
  page: 1,
  q: '',
  a: '',
  id: null,
  t0: 0,
  demo: null,
  demoBack: false,
  opened: 0,
  input: null,
  form: null,
  seen: false,
  kb: false,
  lastScr: '',
  helmOn: !!window.__rl_4014helmon
 };
 window.V4014C = {
  on: true,
  LOG: LOG,
  QA: QA,
  match: match,
  C: C,
  ask: ask,
  demo: startDemo,
  open: () => {
   C.classic = false;
   screen = 'help';
  },
  ST: ST
 };
 function say(a, q, id) {
  C.a = a;
  C.q = q || '';
  C.id = id || null;
  C.t0 = rt();
 }
 function ask(question, how) {
  const m = match(question);
  LOG.asks.push({
   q: String(question).slice(0, 80),
   id: m.id,
   score: +m.score.toFixed(2),
   how: how || 'typed'
  });
  if (LOG.asks.length > 200) LOG.asks.shift();
  if (m.id) say(BYID[m.id].a, question, m.id); else say(line('miss'), question, null);
  return m.id;
 }
 const demoStep = id => {
  try {
   const q = BYID[id];
   if (!q || !q.demo) return -1;
   const s = q.demo();
   return typeof s === 'number' && s >= 0 && TUTX[s] && !(typeof tutIsCard === 'function' && tutIsCard(s)) ? s : -1;
  } catch (e) {
   return -1;
  }
 };
 const TRACK = 'mrb4014';
 function startDemo(id) {
  const s = demoStep(id);
  if (s < 0) return false;
  try {
   hideInput(true);
   TUT_TRACKS[TRACK] = [ s ];
   if (typeof TUT_TRACK_NAME !== 'undefined') TUT_TRACK_NAME[TRACK] = 'MR. BAGGA\'S DRILL';
   C.demo = {
    id: id,
    step: s,
    at: rt()
   };
   LOG.demos.push({
    id: id,
    step: s
   });
   let m0 = null;
   try {
    m0 = localStorage.getItem('rl_modes232');
   } catch (e) {}
   try {
    startTutorial(TRACK);
   } finally {
    try {
     if (m0 === null) localStorage.removeItem('rl_modes232'); else localStorage.setItem('rl_modes232', m0);
    } catch (e) {}
   }
   const G = G0();
   if (!G || !G.tutorial || G.tutorial.track !== TRACK) {
    C.demo = null;
    return false;
   }
   return true;
  } catch (e) {
   err(e, 'demo');
   C.demo = null;
   try {
    game = null;
    screen = 'help';
   } catch (x) {}
   return false;
  }
 }
 function demoWatch() {
  if (!C.demo) return;
  const G = G0(), Tt = G && G.tutorial;
  if (Tt && Tt.track === TRACK) return;
  if (!G && scr() === 'menu') {
   const id = C.demo.id;
   C.demo = null;
   C.classic = false;
   screen = 'help';
   say(line('back'), '', id);
   C.demoBack = true;
   LOG.demos.push({
    back: id
   });
   return;
  }
  if (G && !(Tt && Tt.track === TRACK)) C.demo = null;
 }
 function css() {
  if (document.getElementById('mrb4014css')) return;
  const s = document.createElement('style');
  s.id = 'mrb4014css';
  s.textContent = '#mrb4014f{position:absolute;display:none;margin:0;padding:0;pointer-events:auto;z-index:3}' + '#mrb4014{width:100%;height:100%;box-sizing:border-box;margin:0;padding:0 8px;border:2px solid #2cc4dc;border-radius:3px;background:#0f1a22;color:#fff;' + 'font:bold 16px/1 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.5px;text-transform:uppercase;-webkit-user-select:text;user-select:text;' + 'touch-action:manipulation;-webkit-appearance:none;appearance:none;outline:none;caret-color:#ffe14d}' + '#mrb4014:focus{border-color:#ffe14d;box-shadow:0 0 0 2px rgba(255,225,77,.35)}#mrb4014::placeholder{color:#6f8d99;opacity:1}';
  document.head.appendChild(s);
 }
 function mkInput() {
  if (C.input) return C.input;
  css();
  const f = document.createElement('form');
  f.id = 'mrb4014f';
  f.setAttribute('autocomplete', 'off');
  f.setAttribute('novalidate', '');
  const i = document.createElement('input');
  i.id = 'mrb4014';
  i.type = 'text';
  i.setAttribute('enterkeyhint', 'go');
  i.setAttribute('autocomplete', 'off');
  i.setAttribute('autocorrect', 'off');
  i.setAttribute('autocapitalize', 'characters');
  i.setAttribute('spellcheck', 'false');
  i.setAttribute('maxlength', '80');
  i.setAttribute('aria-label', 'ASK MR. BAGGA');
  i.placeholder = 'ASK ME ANYTHING, ROOKIE...';
  f.appendChild(i);
  f.addEventListener('submit', ev => {
   ev.preventDefault();
   submit();
  });
  i.addEventListener('keydown', ev => {
   ev.stopPropagation();
   if (ev.key === 'Enter') {
    ev.preventDefault();
    submit();
   }
  }, false);
  for (const ev of [ 'keyup', 'keypress' ]) i.addEventListener(ev, e => e.stopPropagation());
  i.addEventListener('focus', () => {
   C.kb = true;
  });
  i.addEventListener('blur', () => {
   C.kb = false;
   setTimeout(() => {
    try {
     if (typeof resize === 'function') resize();
    } catch (e) {}
   }, 120);
  });
  ui.appendChild(f);
  C.form = f;
  C.input = i;
  return i;
 }
 function submit() {
  const i = C.input;
  if (!i) return;
  const v = String(i.value || '').trim();
  if (!v) {
   try {
    i.focus();
   } catch (e) {}
   return;
  }
  ask(v, 'typed');
  i.value = '';
  try {
   i.blur();
  } catch (e) {}
 }
 function placeInput(x, y, w, h) {
  const i = mkInput(), f = C.form;
  C.seen = true;
  let yy = y;
  try {
   if (typeof SA2403B !== 'undefined' && SA2403B && typeof sa2403By === 'function') yy = sa2403By(y);
  } catch (e) {}
  const st = 'display:block;left:' + (x / W * 100).toFixed(3) + '%;top:' + (yy / H * 100).toFixed(3) + '%;width:' + (w / W * 100).toFixed(3) + '%;height:' + (h / H * 100).toFixed(3) + '%';
  if (f.dataset.st !== st) {
   f.style.cssText = st;
   f.dataset.st = st;
  }
  return i;
 }
 function hideInput(blur) {
  const f = C.form;
  if (!f) return;
  if (blur && C.input && document.activeElement === C.input) try {
   C.input.blur();
  } catch (e) {}
  if (f.dataset.st !== 'none') {
   f.style.cssText = 'display:none';
   f.dataset.st = 'none';
  }
 }
 if (typeof window.syncUI === 'function') {
  const s0 = window.syncUI;
  window.syncUI = function() {
   const r = s0.apply(this, arguments);
   try {
    if (!C.seen) hideInput(true);
    C.seen = false;
    demoWatch();
    if (![ 'help', 'help17' ].includes(scr()) && !C.demo) C.classic = false;
   } catch (e) {
    err(e, 'sync');
   }
   return r;
  };
 }
 const SPW = 100, SPH = 100, OX = 50, OY = 66;
 const P = {
  K: '#0b1a20',
  Wt: '#ffffff',
  g1: '#fff3a0',
  g2: '#ffd84a'
 };
 const PXS = 3;
 const KIT = {
  jersey: '#17171a',
  trim: '#ffcc33',
  helm: '#f2b51c'
 }, SKIN_I = 2;
 const HAIR = '#22160d', HAIR_L = '#6b4a30', TIE = '#c9a46b';
 const BX = OX - 9;
 let spC = null, spX = null;
 function sp() {
  if (!spC) {
   spC = document.createElement('canvas');
   spC.width = SPW;
   spC.height = SPH;
   spX = spC.getContext('2d');
  }
  return spX;
 }
 let X_ = null;
 const R = (x, y, w, h, c) => {
  X_.fillStyle = P[c] || c;
  X_.fillRect(OX + x, OY + y, w, h);
 };
 const Q = (x, y, c) => R(x, y, 1, 1, c);
 function twinkle(x, y, t, ph) {
  const k = (t * .9 + ph) % 3;
  if (k > .5) return;
  const a = k < .25 ? 1 : 2;
  Q(x, y, 'Wt');
  if (a > 1) {
   Q(x - 1, y, 'g1');
   Q(x + 1, y, 'g1');
   Q(x, y - 1, 'g1');
   Q(x, y + 1, 'g1');
  }
 }
 const FR_ = n => typeof RL12 !== 'undefined' && RL12.FR && RL12.FR[n] ? RL12.FR[n][3] : null;
 const strip = s => s.replace(/[MmnX]/g, '.');
 const put = (G, r, c, s, solid) => {
  if (!G[r]) return;
  const a = G[r].split('');
  for (let i = 0; i < s.length; i++) {
   const ch = s[i];
   if (ch === '.' && !solid) continue;
   if (c + i >= 0 && c + i < a.length) a[c + i] = ch;
  }
  G[r] = a.join('');
 };
 const GW = 21, GH = 23, SEAT = 13;
 let GRID = null;
 const LEGS = [ 'oJJJJJjJJJJJo', 'oJJJJJoJJJJJo', '.ojjjjoojjjjo.', '.oSSSo..oSSSo', '..oSSo..oSSo.', '..oSSo..oSSo.', '..oWWo..oWWo.', '..oJJo..oJJo.', '.oKKKo.oKKKo.', '..ooo...ooo..' ];
 const HELM = [ '..ooooo...', '.oAEEAAo..', 'oAAAAAAAoo', 'oAkAAAoooo', 'oaAAAoCCCo', '.oaaokkkCo', '..oooCCCo.' ];
 function grid(v) {
  const bench = FR_('bench_idle0'), coach = FR_('coach_idle0');
  if (!bench || !coach) return null;
  const key = (v.blink ? 1 : 0) + '' + (v.talk ? 1 : 0) + (v.kick ? 1 : 0) + (v.helmOn ? 1 : 0);
  GRID = GRID || {};
  if (GRID[key]) return GRID[key];
  const G = [];
  for (let r = 0; r < GH; r++) G.push('.'.repeat(GW));
  const C0 = 1;
  if (!v.helmOn) for (let r = 0; r < HELM.length; r++) put(G, 9 + r, 12, HELM[r]);
  for (let r = 9; r <= 13; r++) put(G, r - 1, C0, strip(bench[r]));
  for (let r = 0; r < LEGS.length; r++) put(G, 13 + r, C0, LEGS[r]);
  if (v.helmOn) {
   for (let r = 0; r <= 7; r++) put(G, r, C0, strip(bench[r]).replace(/^(.{11})M/, '$1o'));
   for (const q of [ 0, 12 ]) {
    for (let i = 0; i < 6; i++) if (G[5 + i][C0 + q] === '.') put(G, 5 + i, C0 + q, i % 2 ? 'b' : 'B');
    put(G, 11, C0 + q, 'T');
   }
  } else {
   for (let r = 0; r <= 7; r++) {
    let s = coach[r].slice(0, 13);
    if (r === 3) s = '..oHHHHHHHo..';
    put(G, r, C0, s);
   }
   put(G, 4, C0 + 2, 'H');
   put(G, 4, C0 + 10, 'H');
   if (v.blink) {
    put(G, 5, C0 + 4, 's');
    put(G, 5, C0 + 8, 's');
   }
   if (v.talk) put(G, 7, C0 + 4, 'ooo'); else {
    put(G, 6, C0 + 7, 's');
    put(G, 7, C0 + 5, 's');
   }
  }
  if (!v.helmOn) {
   G[12] = G[12].replace(/j/g, 't');
   G[15] = G[15].replace(/j/g, 't');
   G[20] = G[20].replace(/J/g, 'T');
   for (const r of [ 9, 10, 13, 14 ]) put(G, r, 2, 'L');
   put(G, 8, 5, 'oSSso', true);
   put(G, 9, 6, 'LSL', true);
  }
  if (v.kick) {
   put(G, 10, C0 + 11, 'oo', true);
   put(G, 10, C0 + 12, v.helmOn ? 'G' : 'S', true);
  }
  GRID[key] = G;
  return G;
 }
 window.V4014C._grid = () => grid({});
 const bakes = new Map;
 function bakeMan(v) {
  const G = grid(v);
  if (!G) return null;
  const key = (v.blink ? 1 : 0) + '' + (v.talk ? 1 : 0) + (v.kick ? 1 : 0) + (v.helmOn ? 1 : 0);
  let c = bakes.get(key);
  if (c) return c;
  const P0 = RL12.palette(KIT, SKIN_I), pal = Object.assign({}, P0, {
   B: HAIR,
   b: HAIR_L,
   T: TIE,
   A: P0.H,
   a: P0.h,
   E: P0.w,
   C: '#e6e6e6',
   J: '#17171a',
   j: '#0b0b0d',
   L: '#3a3a40',
   T: '#ffcc33',
   t: '#b88a12'
  });
  if (!v.helmOn) Object.assign(pal, {
   H: '#2a1b10',
   h: '#1a120c',
   w: '#4a3322',
   G: pal.S,
   g: pal.s
  });
  c = document.createElement('canvas');
  c.width = GW;
  c.height = GH;
  const x = c.getContext('2d');
  for (let r = 0; r < GH; r++) for (let q = 0; q < GW; q++) {
   const ch = G[r][q];
   if (ch === '.') continue;
   x.fillStyle = pal[ch] || '#ff00ff';
   x.fillRect(q, r, 1, 1);
  }
  bakes.set(key, c);
  return c;
 }
 const HAND = {
  c: 13,
  r: 10
 };
 const gx = c => BX + (c - 7.5) * PXS, gy = r => OY + (r - SEAT) * PXS;
 const FLICK = 1.5;
 function flick(t) {
  const p = t % FLICK / FLICK, up = .1, air = .8;
  if (p < up) return {
   kick: p > .05,
   y: 0,
   air: false,
   p: p
  };
  if (p < air) {
   const u = (p - up) / (air - up);
   return {
    kick: u < .1,
    y: 4 * 26 * u * (1 - u),
    air: true,
    u: u,
    p: p
   };
  }
  return {
   kick: false,
   y: 0,
   air: false,
   p: p
  };
 }
 let bkC = null;
 function sceneBack() {
  if (!bkC) {
   bkC = document.createElement('canvas');
   bkC.width = SPW;
   bkC.height = SPH;
   const x = bkC.getContext('2d');
   x.fillStyle = 'rgba(255,216,74,.10)';
   x.beginPath();
   x.ellipse(BX + 4, OY - 18, 48, 52, 0, 0, Math.PI * 2);
   x.fill();
   x.fillStyle = 'rgba(255,216,74,.08)';
   x.beginPath();
   x.ellipse(BX + 4, OY - 18, 36, 40, 0, 0, Math.PI * 2);
   x.fill();
   x.fillStyle = 'rgba(0,0,0,.40)';
   x.beginPath();
   x.ellipse(OX, OY + 31, 50, 4, 0, 0, Math.PI * 2);
   x.fill();
  }
  return bkC;
 }
 const TROPHIES = [ [ 'trophy_online', 1, 42 ], [ 'trophy_natty', 17, 78 ], [ 'trophy_pro', 0, 74 ], [ 'trophy_globe', 81, 77 ] ];
 const blCache = new Map;
 function blIcon(id, c) {
  if (id !== 'trophy_pro' && id !== 'trophy_mega') return c;
  let o = blCache.get(id);
  if (o && o.__src === c) return o;
  const x0 = c.getContext ? c.getContext('2d') : null;
  let d = null;
  try {
   d = x0 && x0.getImageData(0, 0, 20, 20).data;
  } catch (e) {
   d = null;
  }
  const dark = (q, r) => d && d[(r * 20 + q) * 4 + 3] > 0 && d[(r * 20 + q) * 4] < 40 && d[(r * 20 + q) * 4 + 1] < 40;
  if (!d || !(dark(6, 5) && dark(8, 8) && dark(10, 5) && dark(12, 8))) return c;
  o = document.createElement('canvas');
  o.width = o.height = 20;
  o.__src = c;
  const x = o.getContext('2d');
  x.drawImage(c, 0, 0);
  const bowl = id === 'trophy_mega' ? '#ffe066' : '#ffcc33', ink = '#0b1a20';
  x.fillStyle = bowl;
  x.fillRect(6, 5, 7, 4);
  const B = [ 'XX.', 'XXX', 'X.X', 'XX.' ], L = [ 'X..', 'X..', 'X..', 'XXX' ];
  x.fillStyle = ink;
  B.forEach((row, r) => [ ...row ].forEach((ch, q) => {
   if (ch === 'X') x.fillRect(6 + q, 5 + r, 1, 1);
  }));
  L.forEach((row, r) => [ ...row ].forEach((ch, q) => {
   if (ch === 'X') x.fillRect(10 + q, 5 + r, 1, 1);
  }));
  blCache.set(id, o);
  return o;
 }
 function trophies(x) {
  let n = 0;
  if (!window.V17 || typeof V17.icon !== 'function') return 0;
  for (const [id, tx, ty] of TROPHIES) {
   let c = null;
   try {
    c = V17.icon(id, false);
   } catch (e) {
    c = null;
   }
   if (!c) continue;
   c = blIcon(id, c);
   x.fillStyle = 'rgba(0,0,0,.35)';
   x.fillRect(Math.round(tx) + 3, Math.round(ty) + 19, 14, 2);
   x.drawImage(c, 0, 0, 20, 20, Math.round(tx), Math.round(ty), 20, 20);
   n++;
  }
  return n;
 }
 const FRONT_TROPHIES = [ [ 'trophy_ultimate', BX + 13, 77 ] ];
 function frontTrophies(dx, dy, k) {
  if (!window.V17 || typeof V17.icon !== 'function') return 0;
  let n = 0;
  for (const [id, tx, ty] of FRONT_TROPHIES) {
   let c = null;
   try {
    c = V17.icon(id, false);
   } catch (e) {
    c = null;
   }
   if (!c) continue;
   g.save();
   g.imageSmoothingEnabled = false;
   g.fillStyle = 'rgba(0,0,0,.35)';
   g.fillRect(dx + (tx + 3) * k, dy + (ty + 19) * k, 14 * k, 2 * k);
   g.drawImage(c, 0, 0, 20, 20, dx + tx * k, dy + ty * k, 20 * k, 20 * k);
   g.restore();
   n++;
  }
  return n;
 }
 function scene(t, talk) {
  const x = sp();
  X_ = x;
  x.clearRect(0, 0, SPW, SPH);
  x.imageSmoothingEnabled = false;
  LOG.trophies = trophies(x);
  const fl = flick(t), v = {
   blink: t % 3.7 < .12,
   talk: !!talk,
   kick: !!fl.kick,
   helmOn: !!C.helmOn
  };
  const man = bakeMan(v);
  if (man) {
   const br = Math.floor(t / 1.6) % 2 && !C.helmOn ? 1 : 0;
   const x0 = Math.round(gx(0)), y0 = Math.round(gy(0)), cut = SEAT - 1;
   x.drawImage(man, 0, 0, GW, GH, x0, y0, GW * PXS, GH * PXS);
   if (br) x.drawImage(man, 0, 0, GW, cut, x0, y0 - br, GW * PXS, cut * PXS);
   LOG.man = C.helmOn ? 'RL12:bench_idle0' : 'RL12:bench_idle0+coach_idle0';
   LOG.helmOn = v.helmOn;
  }
  twinkle(-46, 12, t, 0);
  twinkle(37, -2, t, 1.3);
  twinkle(-9, -64, t, 2.1);
  twinkle(-35, 4, t, .7);
  X_ = null;
  return spC;
 }
 function rng(seed) {
  let a = seed >>> 0;
  return () => {
   a = a + 1831565813 >>> 0;
   let t = a;
   t = Math.imul(t ^ t >>> 15, t | 1);
   t ^= t + Math.imul(t ^ t >>> 7, t | 61);
   return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
 }
 const TX = BX + 1;
 const PILE = function() {
  const rnd = rng(4014), back = [], front = [], J = a => (rnd() * 2 - 1) * a, ST = 1.35;
  const coin = (x, y, kind) => {
   if (kind === 'flat') return {
    x: x,
    y: y,
    f: 1
   };
   if (kind === 'tilt') return {
    x: x,
    y: y,
    a: J(.35),
    s: .42 + rnd() * .3
   };
   if (kind === 'diag') return {
    x: x,
    y: y,
    a: (rnd() < .5 ? -1 : 1) * (.45 + rnd() * .75),
    s: .45 + rnd() * .35
   };
   return {
    x: x,
    y: y,
    a: Math.PI / 2 + J(.25),
    s: .22 + rnd() * .12
   };
  };
  const pick = (pf, pt, pd) => {
   const u = rnd();
   return u < pf ? 'flat' : u < pf + pt ? 'tilt' : u < pf + pt + pd ? 'diag' : 'edge';
  };
  let zq = 0;
  const stack = (out, x, y, n, lean, z) => {
   const zz = (z == null ? y : z) + zq++ * 1e-4;
   for (let i = 0; i < n; i++) out.push({
    x: x + J(.35) + lean * i,
    y: y - i * ST,
    a: J(.06),
    s: .34 + rnd() * .04,
    st: i === n - 1 ? 2 : 1,
    z: zz,
    i: i
   });
  };
  const tower = (out, cx, baseY, topY, lean, z) => stack(out, TX + cx, baseY, Math.max(3, Math.round((baseY - topY) / ST)), lean, z);
  const FL = OY + 29;
  tower(back, -4, FL - 3, 23, 0, OY - 40);
  tower(back, -15, FL - 3, 30, -.04, OY - 39);
  tower(back, 7, FL - 3, 31, .05, OY - 39);
  tower(back, -27, FL - 2, 46, -.12, OY - 30);
  tower(back, 19, FL - 2, 44, .12, OY - 30);
  tower(back, -37, FL, 60, .06, OY - 20);
  tower(back, 31, FL, 58, -.16, OY - 20);
  tower(back, -24, FL - 1, OY - 4, 0, OY - 10);
  tower(back, 22, FL - 1, OY - 3, 0, OY - 10);
  for (const cx of [ -17, -6, 5, 15 ]) tower(back, cx, FL - 1, OY + 1, 0, OY - 5);
  for (let i = 0; i < 22; i++) {
   const x = TX + J(46), y = OY + 22 + rnd() * 8;
   if (rnd() < .1) {
    stack(back, x, y, 2 + Math.floor(rnd() * 2), J(.3));
    continue;
   }
   back.push(coin(x, y, pick(.3, .45, .2)));
  }
  tower(front, -23, FL + 2, OY + 8, .03, FL + 2);
  tower(front, 27, FL + 2, OY + 9, -.03, FL + 2);
  for (const [x, kind] of [ [ 3, 'tilt' ], [ 13, 'flat' ], [ 50, 'tilt' ], [ 74, 'edge' ], [ 84, 'diag' ], [ 97, 'tilt' ] ]) front.push(coin(x + J(1.5), FL + 2 + J(1), kind));
  stack(front, 88, FL + 3, 3, .4);
  const byZ = (a, b) => (a.z != null ? a.z : a.y) - (b.z != null ? b.z : b.y) || (a.i || 0) - (b.i || 0);
  back.sort(byZ);
  front.sort(byZ);
  return {
   back: back,
   front: front
  };
 }();
 function coinApi() {
  const C = window.V39C;
  return C && typeof C.drawCoin === 'function' ? C : null;
 }
 function coinArt() {
  const C = coinApi();
  if (!C) return null;
  try {
   if (C.FACE401 && C.FACE401.on()) return C.FACE401;
  } catch (e) {}
  try {
   if (C.FACE40 && C.FACE40.on()) return C.FACE40;
  } catch (e) {}
  return C.SMALL && C.sprite ? C : null;
 }
 const tipCache = new Map;
 let srcPx = null, srcArt = null;
 function tipped(F, a, s, cell, st) {
  const aq = Math.round(a / .13) * .13, sq = Math.round(s / .04) * .04, key = aq.toFixed(2) + '|' + sq.toFixed(2) + '|' + cell + '|' + (st || 0);
  if (srcArt !== F) {
   srcArt = F;
   srcPx = null;
   tipCache.clear();
  }
  let c = tipCache.get(key);
  if (c) return c;
  if (!srcPx) {
   const MAP = F.BIG || F.SMALL, im = F.sprite(MAP, 1), n = im.width, x = document.createElement('canvas').getContext('2d');
   x.canvas.width = n;
   x.canvas.height = n;
   x.drawImage(im, 0, 0);
   const d = x.getImageData(0, 0, n, n).data, col = {};
   MAP.forEach((row, j) => [ ...row ].forEach((ch, i) => {
    const o = (j * n + i) * 4;
    if (ch !== '.' && !col[ch] && d[o + 3]) col[ch] = 'rgb(' + d[o] + ',' + d[o + 1] + ',' + d[o + 2] + ')';
   }));
   srcPx = {
    n: n,
    d: d,
    col: col
   };
  }
  const n = srcPx.n, d = srcPx.d, K = srcPx.col, R0 = n / 2, ca = Math.cos(aq), sa = Math.sin(aq), thk = st ? st === 1 ? 1 : 2 : Math.max(1, Math.round((1 - sq) * 2.2));
  const bx = Math.ceil(Math.sqrt(Math.pow(R0 * ca, 2) + Math.pow(R0 * sq * sa, 2))), by = Math.ceil(Math.sqrt(Math.pow(R0 * sa, 2) + Math.pow(R0 * sq * ca, 2)));
  const w = bx * 2 + 1, h = by * 2 + 1 + thk;
  const at = (u, v) => {
   const p = u * ca + v * sa, q = (-u * sa + v * ca) / sq, i = Math.floor(p + R0), j = Math.floor(q + R0);
   if (i < 0 || j < 0 || i >= n || j >= n) return -1;
   const o = (j * n + i) * 4;
   return d[o + 3] > 0 ? o : -1;
  };
  const rgb = o => 'rgb(' + d[o] + ',' + d[o + 1] + ',' + d[o + 2] + ')';
  const cO = K.O || '#0d2842', cW = K.W || K.L || '#ffffff', cM = K.M || K.L || '#8cdeff', cD = K.D || '#2e96d6';
  c = document.createElement('canvas');
  c.width = w * cell;
  c.height = h * cell;
  const x = c.getContext('2d');
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
   const u = i - bx, v = j - by, o = at(u, v);
   let f = null;
   if (o >= 0) f = st === 1 ? at(u, v + 1) < 0 || at(u - 1, v) < 0 || at(u + 1, v) < 0 ? cO : u > bx * .4 ? i % 2 ? cM : cD : u < -bx * .3 ? i % 2 ? cW : cM : i % 2 ? cM : cW : rgb(o); else for (let k = 1; k <= thk; k++) if (at(u, v - k) >= 0) {
    f = k === thk ? cO : i % 2 ? cW : cM;
    break;
   }
   if (f) {
    x.fillStyle = f;
    x.fillRect(i * cell, j * cell, cell, cell);
   }
  }
  c.__cx = (bx + .5) * cell;
  c.__cy = (by + .5) * cell;
  tipCache.set(key, c);
  return c;
 }
 const pileCache = {
  key: '',
  c: null
 };
 function drawOne(x, F, p, lx, ly, cell, C) {
  if (p.f || !F) {
   const im = F ? F.sprite(F.BIG || F.SMALL, cell) : null;
   if (im) x.drawImage(im, Math.round(lx - im.width / 2), Math.round(ly - im.height / 2));
   return 'f';
  }
  const img = tipped(F, p.a, p.s, cell, p.st);
  x.drawImage(img, Math.round(lx - img.__cx), Math.round(ly - img.__cy));
  return 't';
 }
 function drawPile(list, dx, dy, k, t, front) {
  const C = coinApi();
  if (!C) return false;
  const F = coinArt();
  LOG.dimeArt = C.FACE401 && F === C.FACE401 ? 'FACE401' : C.FACE40 && F === C.FACE40 ? 'FACE40' : 'V39';
  const m = g.getTransform(), rr = Math.abs(m.a) || 1, cell = Math.max(1, Math.round(rr * .5)), kk = k * rr;
  const key = (front ? 'f' : 'b') + cell + '|' + kk + '|' + LOG.dimeArt;
  let pc = front ? null : pileCache.key === key ? pileCache.c : null;
  if (!front && !pc) {
   pc = document.createElement('canvas');
   pc.width = Math.ceil(SPW * kk) + 64;
   pc.height = Math.ceil(SPH * kk) + 64;
   const x = pc.getContext('2d');
   x.imageSmoothingEnabled = false;
   let nf = 0, nt = 0;
   for (const p of list) {
    drawOne(x, F, p, 32 + p.x * kk, 32 + p.y * kk, cell, C) === 'f' ? nf++ : nt++;
   }
   pileCache.key = key;
   pileCache.c = pc;
   LOG.pileBuilds = (LOG.pileBuilds || 0) + 1;
   LOG.flat = nf;
   LOG.tip = nt;
  }
  const ox = m.a * dx + m.e, oy = m.d * dy + m.f;
  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.imageSmoothingEnabled = false;
  if (pc) g.drawImage(pc, Math.round(ox) - 32, Math.round(oy) - 32); else for (const p of list) drawOne(g, F, p, Math.round(ox) + p.x * kk, Math.round(oy) + p.y * kk, cell, C);
  g.restore();
  if (!front) {
   let n = 0;
   for (let i = list.length - 1; i >= 0 && n < 4; i--) {
    const p = list[i];
    if (!p.f) continue;
    n++;
    C.drawCoin(dx + p.x * k - 4, dy + p.y * k - 4, true, t + i * .41);
   }
   LOG.shine = n;
  }
  return true;
 }
 function drawDimes(dx, dy, k, t, front) {
  if (!front) LOG.dimes = PILE.back.length + PILE.front.length;
  return drawPile(front ? PILE.front : PILE.back, dx, dy, k, t, front);
 }
 function drawFlick(dx, dy, k, t) {
  const F = coinArt();
  if (!F) return;
  const f = flick(t), rr = Math.abs(g.getTransform().a) || 1, cell = Math.max(1, Math.round(rr * .5)), img = F.sprite(F.BIG || F.SMALL, cell), size = img.width;
  const sx = gx(HAND.c), sy = gy(HAND.r) - 3 - (f.air ? f.y : 0) + (f.kick ? -PXS : 0);
  const m = g.getTransform(), cx = m.a * (dx + sx * k) + m.e, cy = m.d * (dy + sy * k) + m.f;
  const fl = f.air ? Math.abs(Math.cos(f.u * Math.PI * 5)) : .55, h = Math.max(cell, Math.round(size * fl));
  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.imageSmoothingEnabled = false;
  g.drawImage(img, 0, 0, size, size, Math.round(cx - size / 2), Math.round(cy - h / 2), size, h);
  g.restore();
  LOG.flickY = +(f.air ? f.y : 0).toFixed(1);
  LOG.flickH = h;
 }
 function wrap(s, maxW) {
  const words = String(s).split(' '), out = [];
  let cur = '';
  for (const w of words) {
   const t = cur ? cur + ' ' + w : w;
   if (tw(t) <= maxW || !cur) cur = t; else {
    out.push(cur);
    cur = w;
   }
  }
  if (cur) out.push(cur);
  return out;
 }
 function layout() {
  const sw = Math.max(118, Math.min(160, Math.round(W * .4)));
  const x0 = sw + 4, x1 = W - 5;
  return {
   sw: sw,
   x0: x0,
   x1: x1,
   pw: x1 - x0
  };
 }
 function drawCoach() {
  LOG.frames++;
  const t = rt(), L = layout();
  try {
   bgStripes(true);
  } catch (e) {
   rect(0, 0, W, H, '#0b0f14');
  }
  const typing = C.a && (t - C.t0) * 70 < C.a.length, talk = typing && Math.floor(t * 9) % 2 === 0;
  const img = scene(t, talk);
  const avail = H - 24 - 2;
  let k = Math.min((L.sw - 2) / SPW, avail / SPH);
  const rr = typeof RR === 'number' && RR > 0 ? RR : 1;
  k = Math.max(1 / rr, Math.floor(k * rr) / rr);
  const dw = SPW * k, dh = SPH * k, dx = Math.round((L.sw - dw) / 2 * rr) / rr, dy = Math.round((H - 2 - dh) * rr) / rr;
  try {
   g.imageSmoothingEnabled = false;
   g.drawImage(sceneBack(), 0, 0, SPW, SPH, dx, dy, dw, dh);
   drawDimes(dx, dy, k, t, false);
   g.drawImage(img, 0, 0, SPW, SPH, dx, dy, dw, dh);
   drawDimes(dx, dy, k, t, true);
   LOG.trophies = (LOG.trophies || 0) + frontTrophies(dx, dy, k);
   drawFlick(dx, dy, k, t);
  } catch (e) {
   err(e, 'blit');
  }
  C.headAt = {
   x: dx + (BX + 2) * k,
   y: dy + (OY - 34) * k
  };
  const ttl = 'HOW TO PLAY / CONTROLS', tsc = textW(ttl, 2) <= L.sw - 6 ? 2 : 1;
  LOG.title = {
   s: ttl,
   sc: tsc,
   w: textW(ttl, tsc),
   room: L.sw
  };
  text(ttl, Math.round(L.sw / 2), tsc === 2 ? 5 : 7, tsc, '#ffd84a', 'center', '#000');
  text('ASK MR. BAGGA ANYTHING.', Math.round(L.sw / 2), 18, 1, '#8fe3f0', 'center', '#000');
  const askW = 30, iy = 5, ih = 16;
  placeInput(L.x0, iy, L.pw - askW - 3, ih);
  button('ASK', L.x1 - askW, iy, askW, ih, () => {
   const i = C.input;
   if (i && String(i.value || '').trim()) submit(); else if (i) try {
    i.focus();
   } catch (e) {}
  }, {
   bg: '#ffe14d'
  });
  const nChips = QA.filter(q => q.pg === C.page).length, chipRows = Math.ceil(nChips / 4);
  const saDb = (typeof SA2403 !== 'undefined' && SA2403.db > 0 && !window.__rl_no4014sa) ? Math.ceil(SA2403.db) + 2 : 0;
  const by = iy + ih + 5, bh = Math.max(40, Math.min(74, (H - 21 - 3) - chipRows * 16 - 5 - (iy + ih + 5)) - saDb), bx = L.x0, bw = L.pw;
  rect(bx - 1, by - 1, bw + 2, bh + 2, '#0b1a20');
  rect(bx, by, bw, bh, '#fff6df');
  rect(bx, by + bh - 2, bw, 2, '#efdcae');
  const hy = Math.max(by + 10, Math.min(by + bh - 14, Math.round(C.headAt.y)));
  for (let i = 0; i < 12; i++) {
   const hh = Math.max(1, Math.round(9 * (1 - i / 12))), yy = hy - Math.round(hh / 2) + Math.round(i / 3);
   rect(bx - 1 - i, yy - 1, 1, hh + 2, '#0b1a20');
   if (hh > 1 || i < 11) rect(bx - i, yy, 1, hh, '#fff6df');
  }
  const hasDemo = !!C.id && demoStep(C.id) >= 0 && !C.demoBack;
  const tx0 = bx + 6, maxW = bw - 12;
  let y = by + 5;
  if (C.q) {
   let qq = 'YOU: ' + String(C.q).toUpperCase().replace(/\s+/g, ' ');
   if (tw(qq) > maxW) {
    while (qq.length > 6 && tw(qq + '...') > maxW) qq = qq.slice(0, -1);
    qq += '...';
   }
   text(qq, tx0, y, 1, '#7a8a95');
   y += 9;
  }
  const shown = C.a ? C.a.slice(0, Math.max(0, Math.floor((t - C.t0) * 70))) : '';
  const lines = wrap(C.a || '', maxW), lim = Math.max(2, Math.floor((bh - 10) / 8) - (C.q ? 1 : 0));
  let used = 0;
  for (const ln of lines.slice(0, lim)) {
   const vis = Math.max(0, Math.min(ln.length, shown.length - used));
   used += ln.length + 1;
   if (vis > 0) text(ln.slice(0, vis), tx0, y, 1, '#0b1a20');
   y += 8;
  }
  hit('MRB BUBBLE', bx, by, bw, bh - (hasDemo ? 18 : 0), () => {
   C.t0 = -1e6;
  }, 'MRB BUBBLE');
  if (hasDemo && !typing) {
   const sw2 = 58;
   button('SHOW ME', bx + bw - sw2 - 4, by + bh - 17, sw2, 13, () => startDemo(C.id), {
    bg: '#7dff7a'
   });
  }
  const chips = QA.filter(q => q.pg === C.page), cols = 4, gap = 3, ch = 13, cy0 = by + bh + 5;
  const cw = Math.floor((L.pw - gap * (cols - 1)) / cols);
  chips.forEach((q, i) => {
   const cx = L.x0 + i % cols * (cw + gap), cy = cy0 + Math.floor(i / cols) * (ch + gap);
   const on = C.id === q.id;
   button(q.chip, cx, cy, cw, ch, () => {
    ask('HOW DO I ' + (q.ask || q.chip).replace(' + ', ' AND ') + '?', 'chip');
    C.id = q.id;
    C.a = q.a;
   }, {
    bg: on ? '#ffe14d' : q.pg === 1 ? '#8fe3f0' : '#c9d6d9',
    fit: true
   });
  });
  const ry = H - 21, bw3 = Math.floor((L.pw - 6) / 3);
  button('BACK', L.x0, ry, bw3, 17, () => {
   hideInput(true);
   C.classic = false;
   screen = 'menu';
  }, {
   bg: '#c9d6d9'
  });
  button(C.page === 1 ? 'MORE >' : '< PAGE 1', L.x0 + bw3 + 3, ry, bw3, 17, () => {
   C.page = C.page === 1 ? 2 : 1;
  }, {
   bg: '#ffd84a',
   fit: true
  });
  button('ALL CONTROLS', L.x0 + 2 * (bw3 + 3), ry, bw3, 17, () => {
   hideInput(true);
   C.classic = true;
  }, {
   bg: '#2cc4dc',
   fit: true
  });
 }
 const help0 = window.drawHelp;
 window.drawHelp = function() {
  if (OFF()) return help0.apply(this, arguments);
  if (C.classic) {
   const r = help0.apply(this, arguments);
   try {
    for (const s of uiSpecs) if (s.key === screenKey() + '|BACK') s.fn = () => {
     C.classic = false;
    };
   } catch (e) {
    err(e, 'classicBack');
   }
   return r;
  }
  try {
   if (C.lastScr !== 'help') {
    C.lastScr = 'help';
    if (!C.demoBack && !C.a) say(line('hello'), '', null);
   }
   drawCoach();
  } catch (e) {
   err(e, 'draw');
   C.classic = true;
   return help0.apply(this, arguments);
  }
 };
 if (typeof window.syncUI === 'function') {
  const s1 = window.syncUI;
  window.syncUI = function() {
   const r = s1.apply(this, arguments);
   try {
    const s = scr();
    if (s !== 'help' && s !== 'help17' && C.lastScr === 'help' && !C.demo) {
     C.lastScr = s;
     C.a = '';
     C.q = '';
     C.id = null;
     C.demoBack = false;
     C.page = 1;
    }
   } catch (e) {
    err(e, 'leave');
   }
   return r;
  };
 }
 const NEWL = 'HOW TO PLAY / CONTROLS';
 if (typeof window.menuBar === 'function' && typeof window.hit === 'function') {
  const mb0 = window.menuBar;
  window.menuBar = function(b, live) {
   try {
    if (b && b.label === 'HOW TO PLAY' && !OFF() && scr() === 'menu') {
     const chev = b.big && !window.__rl_no281chev && !window.__rl_v124gb ? 14 : 0;
     if (textW(NEWL, 1) <= b.w - 6 - chev) {
      LOG.homeLabel = {
       s: NEWL,
       w: b.w,
       need: textW(NEWL, 1),
       sc: b.sc && b.h >= 16 && textW(NEWL, 2) <= b.w - 8 - chev ? 2 : 1
      };
      if (live) hit(b.label, b.x, b.y, b.w, b.h, b.fn, b.label);
      return mb0.call(this, Object.assign({}, b, {
       label: NEWL
      }), false);
     }
     LOG.homeLabel = {
      s: 'HOW TO PLAY',
      w: b.w,
      need: textW(NEWL, 1)
     };
    }
   } catch (e) {
    err(e, 'homebtn');
   }
   return mb0.apply(this, arguments);
  };
 }
 try {
  if (window.TOUR2317 && Array.isArray(TOUR2317.STEPS)) for (const s of TOUR2317.STEPS) if (s && s[0] === 'help') s[2] = 'ASK MR. BAGGA HOW TO DO ANYTHING';
 } catch (e) {}
 window.V4014C.LOG.ready = true;
})();
