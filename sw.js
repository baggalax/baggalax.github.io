const C = 'retrolax-v41-1-55w';

const FILES = [ './', 'index.html', 'style.css?v=4002', 'v41ios.js?v=4100', 'roster.js?v=4002', 'names31.js?v=4002', 'v401names.js?v=4002', 'v4011pc.js?v=4002', 'v401h.js?v=4002', 'sprites12.js?v=4002', 'dir211.js?v=4002', 'audio12.js?v=4002', 'game.js?v=4002', 'intro30.js?v=4002', 'ghosts16.js?v=4002', 'items17.js?v=4089', 'uni21.js?v=4089', 'net.js?v=4002', 'practice18.js?v=4002', 'v20.js?v=4002', 'cards22.js?v=4002', 'acct23.js?v=4002', 'tour2317.js?v=4002', 'v232.js?v=4002', 'trade24.js?v=4002', 'col25data.js?v=4002', 'v38col.js?v=4002', 'v4011rn.js?v=4002', 'names31b.js?v=4002', 'college25.js?v=4002', 'v29r.js?v=4002', 'honors25.js?v=4036', 'show25.js?v=4002', 'shot26.js?v=4002', 'tut26.js?v=4002', 'v27.js?v=4002', 'v28.js?v=4002', 'c30.js?v=4002', 'd30.js?v=4002', 'v33.js?v=4002', 'v331.js?v=4002', 'v333.js?v=4002', 'v332.js?v=4002', 'v34.js?v=4002', 'v35.js?v=4002', 'v35u.js?v=4002', 'v35s.js?v=4002', 'v35st.js?v=4002', 'v35na.js?v=4002', 'v35sc.js?v=4002', 'v35dr.js?v=4002', 'v35ct.js?v=4002', 'v35sb.js?v=4002', 'v35ag.js?v=4002', 'v36ai.js?v=4002', 'v36dg.js?v=4002', 'v36dr.js?v=4002', 'v361.js?v=4002', 'v361d.js?v=4002', 'v361s.js?v=4002', 'v361p.js?v=4002', 'v37m.js?v=4029', 'v37a.js?v=4002', 'v37s.js?v=4002', 'v37c.js?v=4002', 'v38d.js?v=4002', 'v38g.js?v=4002', 'v38p.js?v=4002', 'v38a.js?v=4002', 'v38h.js?v=4002', 'v38t.js?v=4002', 'v38art.js?v=4002', 'ads39.js?v=4002', 'v39b.js?v=4002', 'v39fd.js?v=4002', 'v39aw.js?v=4002', 'v39cur.js?v=4002', 'v39d.js?v=4002', 'v39fo.js?v=4002', 'v39pb.js?v=4002', 'v40home.js?v=4002', 'v40card.js?v=4002', 'v40letty.js?v=4002', 'v40promo.js?v=4002', 'v40ref.js?v=4002', 'v40nm.js?v=4002', 'v40cr.js?v=4002', 'v40msg.js?v=4002', 'v40odds.js?v=4002', 'v40coin.js?v=4002', 'v401coin.js?v=4002', 'v401nm.js?v=4002', 'v401ed.js?v=4002', 'v401fld.js?v=4002', 'v4011set.js?v=4002', 'v4012tut.js?v=4008', 'v4013mus.js?v=4002', 'audio/music/lobby.m4a', 'v406m.js?v=4007', 'v4014coach.js?v=40144', 'v4015dime.js?v=4002', 'v4021disc.js?v=4002', 'v4023bl.js?v=4002', 'v42crew.js?v=4003', 'v42pd.js?v=4029', 'v404g.js?v=4005', 'v404d.js?v=4004', 'v404t.js?v=4005', 'v406b.js?v=4008', 'v409s.js?v=4009', 'v410d.js?v=4010', 'v411l.js?v=4011', 'v413m.js?v=4013', 'v415r.js?v=4015', 'v414b.js?v=4014', 'v416p.js?v=4016', 'v417k.js?v=4017', 'v418t.js?v=4018', 'v419c.js?v=4019', 'v420c.js?v=4029', 'v421s.js?v=4031', 'v422st.js?v=4028', 'v423ob.js?v=4023', 'v424rs.js?v=4029', 'v425sp.js?v=4029', 'v428as.js?v=4031', 'v431dh.js?v=4031', 'v432cq.js?v=4032', 'v433np.js?v=4033', 'v434at.js?v=4034', 'v435ig.js?v=4035', 'v436hb.js?v=4036', 'v437qa.js?v=4037', 'v438ol.js?v=4038', 'v427pm.js?v=4029', 'v41ugc.js?v=4100', 'v41del.js?v=4100', 'v41iap.js?v=4100', 'v429st.js?v=4029', 'v430mt.js?v=4030','v439pv.js?v=4039', 'v440md.js?v=4040', 'v441num.js?v=4042', 'v442anim.js?v=4046', 'v444ball.js?v=4044', 'v445fit.js?v=4045', 'v446fitpick.js?v=4047', 'v441dg.js?v=4041', 'v447out.js?v=4047', 'v448ai.js?v=4048', 'v449ride.js?v=4049', 'v450slow.js?v=4050', 'v451ridefix.js?v=4051', 'v452hard.js?v=4052', 'v453fo.js?v=4053', 'v454force.js?v=4054', 'v455gk.js?v=4055', 'v456ult.js?v=4056', 'v457shot.js?v=4057', 'v458fr.js?v=4058', 'v458fru.js?v=4064', 'v459car.js?v=4061', 'v459caru.js?v=4061', 'v460fm.js?v=4063', 'v460fmu.js?v=4063', 'v461lk.js?v=4061', 'v462tr.js?v=4062', 'v463pz.js?v=4064', 'v464wd.js?v=4064', 'v465dg2.js?v=4065', 'v466ul.js?v=4066', 'v467keys.js?v=4067','v468ctl.js?v=4068', 'v469menu.js?v=4069', 'v470ads.js?v=5141', 'v471sep.js?v=4071', 'v472pass.js?v=4072', 'v473safe.js?v=4074', 'v474passfix.js?v=4074', 'v477teams.js?v=4077', 'v478lvl.js?v=4078', 'v479carshop.js?v=4096', 'v480carplay.js?v=4080', 'v487dg2.js?v=4087', 'v488oob.js?v=4088', 'v492fix.js?v=4092', 'v495ride.js?v=4095', 'v489vets.js?v=4089', 'v490entr.js?v=4090', 'v491vetsitems.js?v=4091', 'v493shop.js?v=4097', 'v494vcards.js?v=4099', 'v498vgear.js?v=4098', 'v500v13.js?v=5001', 'v501gsc.js?v=5010', 'v502live.js?v=5020', 'v504gs.js?v=5040', 'gs486logo96.png', 'gs486pack.png', 'ads/gs486-board.png', 'v503fix.js?v=5030', 'v505clear.js?v=5050', 'v506goalie.js?v=5060','v507fake.js?v=5071', 'v514adfree.js?v=5141', 'v509spd.js?v=5093', 'v509calls.js?v=5091', 'v509rules.js?v=5092', 'v510pracfake.js?v=5100', 'v511fakeset.js?v=5110', 'v512netspd.js?v=5120', 'v513chk.js?v=5130', 'gh1api.js?v=1', 'privacy.html', 'support.html', 'terms.html', 'ads/bagga-lax.png?v=4002', 'ads/your-ad-here.png?v=4002', 'manifest.webmanifest', 'icon-180.png?v=4002', 'icon-192.png?v=4002', 'icon-512.png?v=4002', 'icon-180.png', 'icon-192.png', 'icon-512.png', 'audio/sfx/check_clack.mp3', 'audio/voices/c17_save_01.mp3', 'audio/voices/c17_save_02.mp3', 'audio/voices/c17_save_03.mp3', 'audio/voices/c17_save_04.mp3', 'audio/voices/c17_hit_01.mp3', 'audio/voices/c17_hit_02.mp3', 'audio/voices/c17_hit_03.mp3', 'audio/voices/c17_hit_04.mp3', 'audio/voices/c17_goal_01.mp3', 'audio/voices/c17_goal_02.mp3', 'audio/voices/c17_goal_03.mp3', 'audio/voices/c17_goal_04.mp3', 'audio/voices/c17_ankle_01.mp3', 'audio/voices/c17_ankle_02.mp3', 'audio/voices/c17_ankle_03.mp3', 'audio/voices/c17_dodge_01.mp3', 'audio/voices/c17_dodge_02.mp3', 'audio/voices/c17_dodge_03.mp3', 'audio/voices/c17_fo_01.mp3', 'audio/voices/c17_fo_02.mp3', 'audio/voices/c17_fo_03.mp3', 'audio/voices/c17_cto_01.mp3', 'audio/voices/c17_cto_02.mp3', 'audio/voices/c17_cto_03.mp3', 'audio/voices/c17_pen_01.mp3', 'audio/voices/c17_pen_02.mp3', 'audio/voices/c17_pen_03.mp3', 'audio/voices/c17_miss_01.mp3', 'audio/voices/c17_miss_02.mp3', 'audio/voices/c17_miss_03.mp3', 'audio/voices/c17_gb_01.mp3', 'audio/voices/c17_gb_02.mp3', 'audio/voices/c17_end_01.mp3', 'audio/voices/c17_end_02.mp3', 'audio/voices/c17_end_03.mp3', 'audio/voices/c17_bench_01.mp3', 'audio/voices/c17_bench_02.mp3', 'audio/voices/c17_bench_03.mp3', 'audio/voices/c17_bench_04.mp3', 'audio/sfx/crowd_cheer.mp3', 'audio/sfx/crowd_cheer_big.mp3', 'audio/sfx/hit_big.mp3', 'audio/sfx/hit_light.mp3', 'audio/voices/save_01_goalie.mp3', 'audio/voices/save_02_goalie.mp3', 'audio/voices/save_03_goalie.mp3', 'audio/voices/save_04_goalie.mp3', 'audio/voices/save_05_goalie.mp3', 'audio/voices/save_06_goalie.mp3', 'audio/voices/save_muffin_01.mp3', 'audio/voices/save_muffin_02.mp3', 'audio/voices/save_muffin_03.mp3', 'audio/voices/save_muffin_04.mp3', 'audio/voices/save_muffin_05.mp3', 'audio/voices/ankle_01_knox.mp3', 'audio/voices/ankle_02_kael.mp3', 'audio/voices/ankle_03_knox.mp3', 'audio/voices/ankle_04_kael.mp3', 'audio/voices/ankle_05_knox.mp3', 'audio/voices/ankle_06_kael.mp3', 'audio/voices/hit_01_kael.mp3', 'audio/voices/hit_02_knox.mp3', 'audio/voices/hit_03_kael.mp3', 'audio/voices/hit_04_knox.mp3', 'audio/voices/hit_05_kael.mp3', 'audio/voices/goal_us_01_knox.mp3', 'audio/voices/goal_us_02_kael.mp3', 'audio/voices/goal_us_03_goalie.mp3', 'audio/voices/goal_us_04_kael.mp3', 'audio/voices/goal_us_05_knox.mp3', 'audio/voices/miss_01_kael.mp3', 'audio/voices/miss_02_knox.mp3', 'audio/voices/miss_03_goalie.mp3', 'audio/voices/miss_04_kael.mp3', 'audio/voices/penalty_01_knox.mp3', 'audio/voices/penalty_02_kael.mp3', 'audio/voices/penalty_03_goalie.mp3', 'audio/voices/faceoff_win_01_kael.mp3', 'audio/voices/faceoff_win_02_knox.mp3', 'audio/voices/faceoff_win_03_kael.mp3', 'audio/voices/timeout_01_knox.mp3', 'audio/voices/timeout_02_kael.mp3', 'audio/voices/bench_01_knox.mp3', 'audio/voices/bench_02_kael.mp3', 'audio/voices/bench_03_knox.mp3', 'audio/voices/bench_04_goalie.mp3', 'audio/voices/bench_05_kael.mp3', 'audio/voices/bench_06_knox.mp3', 'audio/voices/fire_01_goalie.mp3', 'audio/voices/fire_02_goalie.mp3', 'audio/voices/fire_03_goalie.mp3', 'audio/voices/coach_ref_01.mp3', 'audio/voices/coach_ref_02.mp3', 'audio/voices/coach_ref_03.mp3', 'audio/voices/coach_ref_04.mp3', 'audio/voices/coach_ref_05.mp3', 'audio/voices/coach_ref_06.mp3', 'audio/voices/goalie_level_01.mp3', 'audio/voices/goalie_level_02.mp3', 'audio/voices/goalie_level_03.mp3', 'audio/voices/goalie_level_04.mp3', 'audio/voices/goalie_level_05.mp3', 'audio/voices/goalie_level_06.mp3', 'audio/voices/faking_01.mp3', 'audio/voices/faking_02.mp3', 'audio/voices/faking_03.mp3', 'audio/voices/faking_04.mp3', 'audio/voices/faking_05.mp3', 'audio/sfx/crowd_ewww_1.mp3', 'audio/sfx/crowd_ewww_2.mp3', 'audio/voices/oldman_groan_1.mp3', 'audio/voices/oldman_ohmyback_1.mp3', 'audio/voices/oldman_ohmyback_2.mp3', 'audio/voices/knox_detwigged_1.mp3', 'audio/voices/knox_detwigged_2.mp3', 'audio/voices/knox_lostsomething_1.mp3', 'audio/voices/knox_lostsomething_2.mp3', 'audio/voices/knox_relaxpal_1.mp3', 'audio/voices/knox_relaxpal_2.mp3', 'audio/voices/knox_topcheddar_1.mp3', 'audio/voices/knox_topcheddar_2.mp3' ];

self.addEventListener('install', e => {
 self.skipWaiting();
 e.waitUntil(caches.open(C).then(c => c.addAll(FILES.map(f => new Request(f, {
  cache: 'reload'
 })))).catch(() => {}));
});

self.addEventListener('activate', e => {
 e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C && k !== 'rl-dev').map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
 const req = e.request;
 if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
 if (new URL(req.url).pathname.startsWith('/api/')) return;
 if (/\/minver\.json$/.test(new URL(req.url).pathname)) return; // v454force: the update check is never cached
 const net = req.mode === 'navigate' ? fetch(req.url, {
  cache: 'no-store',
  credentials: 'same-origin'
 }) : fetch(req, {
  cache: 'no-store'
 });
 e.respondWith(net.then(r => {
  if (r && r.ok) {
   const cp = r.clone();
   caches.open(C).then(c => c.put(req, cp)).catch(() => {});
  }
  return r;
 }).catch(() => caches.match(req).then(r => r || caches.match(req, {
  ignoreSearch: true
 })).then(r => r || caches.match('index.html')).then(r => r || caches.match('./'))));
});

self.addEventListener('push', e => {
 e.waitUntil((async () => {
  let title = 'BAGGA LAX', body = 'OPEN BAGGA LAX TO SEE WHAT IS NEW';
  try {
   const c = await caches.open('rl-dev');
   const r = await c.match('/__dev');
   const dev = r ? await r.text() : '';
   if (dev) {
    const lr = await c.match('/__lastnote');
    const af = lr ? await lr.text() : '';
    const j = await (await fetch((location.hostname === 'baggalax.github.io' ? 'https://retrolax.sites.tab.bot' : '') + '/api/push/note?dev=' + encodeURIComponent(dev) + (af ? '&after=' + encodeURIComponent(af) : ''), {
     cache: 'no-store'
    })).json();
    if (j && j.note) {
     title = j.note.title || title;
     body = j.note.body || body;
     if (j.note.t) await c.put('/__lastnote', new Response(String(j.note.t)));
    }
   }
  } catch (er) {}
  await self.registration.showNotification(title, {
   body: body,
   icon: 'icon-192.png',
   badge: 'icon-192.png',
   tag: /INVITE/.test(title + body) ? 'rl-invite' : /UPDATE|LIVE/.test(title) ? 'rl-update' : /WEEKLY/.test(title) ? 'rl-weekly' : 'rl-online'
  });
 })());
});

self.addEventListener('notificationclick', e => {
 e.notification.close();
 e.waitUntil(self.clients.matchAll({
  type: 'window',
  includeUncontrolled: true
 }).then(cs => {
  for (const c of cs) {
   if ('focus' in c) return c.focus();
  }
  return self.clients.openWindow('./');
 }));
});
