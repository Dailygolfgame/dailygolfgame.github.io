// Renders /internet-invitational/draft/: an Internet Invitational draft simulator.
// Captain 1-4 teams; AI captains draft the rest in the real snake order. Then a draw,
// semifinals and a final, each 8 pairs a side in scramble + alt shot.
// Data: data/internet-invitational-2026.json. Called from build-pages.mjs.

export function renderDraft({ data, esc, page }) {
  const teams = Object.keys(data.teams); // real snake order: Dalke, Bryan, Finch, Ruffels
  const COLORS = { Red: '#ef4444', Green: '#22c55e', Blue: '#3b82f6', White: '#e2e8f0' };
  const D = {
    teams: teams.map(t => ({ name: t, short: t.replace('Team ', ''), captain: data.teams[t].captain, color: COLORS[data.teams[t].color] || '#94a3b8' })),
    players: data.players.map(p => ({ n: p.name, h: p.hcp, t: p.team, y: p.played2025, c: !!p.captain }))
  };

  const body = `<h1>Internet Invitational Draft Simulator</h1>
<p class="lead">Run the 2026 Internet Invitational draft. Captain one team, two, three or all four (pass the phone to a friend), and AI captains draft the rest. Then a draw decides the semifinals: set your pairs and play a scramble and an alt-shot round, winners meet in the final.</p>
<div id="dr" class="card dr-card">
  <div id="dr-start">
    <h2 class="dr-h">Which teams do you draft?</h2>
    <p class="mut" style="margin:-4px 0 10px;font-size:.88rem">Tap one or more captains. The AI drafts the teams you leave out.</p>
    <div class="dr-caps">${D.teams.map((t, i) => `<button class="dr-cap" data-i="${i}" type="button" aria-pressed="false" style="--c:${t.color}"><b>${esc(t.captain)}</b><span>${esc(t.name)} · picks ${ordinalSmall(i + 1)}</span><i class="dr-chk">✓</i></button>`).join('')}</div>
    <div class="dr-nav"><button class="cta" type="button" id="dr-go" disabled>Start draft</button><button class="dr-link" type="button" id="dr-all">Select all</button></div>
    <p class="mut small">Snake draft: the pick order reverses every round (${D.teams.map(t => esc(t.short)).join(', ')}, then back). 60 picks, 15 per team. Handicaps are estimates by YT Golf Stats.</p>
  </div>
  <div id="dr-draft" hidden>
    <div class="dr-status"><span id="dr-round"></span><span id="dr-clock"></span></div>
    <div class="dr-tabs"><button type="button" class="on" data-tab="avail">Available</button><button type="button" data-tab="board">Teams</button></div>
    <div id="dr-avail">
      <input id="dr-q" type="search" placeholder="Search players" autocomplete="off" aria-label="Search players">
      <div id="dr-list"></div>
    </div>
    <div id="dr-board" hidden></div>
    <div class="dr-foot"><span id="dr-last" class="mut"></span><button type="button" id="dr-auto" class="dr-link">Let the AI finish the draft</button></div>
  </div>
  <div id="dr-result" hidden></div>
</div>
<p class="ii-more">Also try: <a href="/internet-invitational/">Guess the Internet Invitational Player</a> · <a href="/internet-invitational/#handicap-list">Handicap list</a> · <a href="/">YouTube Golfer</a></p>
<h2>How the simulator works</h2>
<p>The four captains are fixed, as in the real event: Brad Dalke, Wesley Bryan, Peter Finch and Ryan Ruffels. AI captains mostly take the best available handicap but sometimes reach for someone else, so no two drafts are the same. When the draft is done, one team is drawn at random and picks its semifinal opponent. Every match is eight two-player pairs against eight: one round of scramble and one of alternate shot, a point per pairing, 16 points in total, with a sudden-death playoff at 8–8. You set the pairs for your teams; AI captains set theirs. The winners meet in the final with the same format. Better pairs win more often, but upsets happen, just like on the course.</p>
<p class="meta">Fan-made simulation, not affiliated with Barstool Sports, Bob Does Sports or the Internet Invitational. Handicap estimates by <a href="https://www.instagram.com/yt_golfstats/" rel="noopener">YT Golf Stats</a>.</p>`;

  const css = `<style>
.dr-card{padding:16px}
.dr-h{font-size:1.1rem;margin:0 0 10px}
.mut{color:var(--mut)}.small{font-size:.82rem;margin:12px 0 0}
.dr-caps{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.dr-cap{text-align:left;padding:12px;border-radius:12px;border:1px solid var(--line);border-left:5px solid var(--c);background:#0b1325;color:var(--txt);font:inherit;cursor:pointer}
.dr-cap{position:relative}.dr-cap:hover{border-color:var(--c)}
.dr-cap .dr-chk{position:absolute;top:8px;right:10px;font-style:normal;font-weight:900;color:var(--c);opacity:0}
.dr-cap[aria-pressed="true"]{background:#13213a;border-color:var(--c)}.dr-cap[aria-pressed="true"] .dr-chk{opacity:1}
#dr-go:disabled{opacity:.45;cursor:default}.dr-cap b{display:block;color:#fff}.dr-cap span{font-size:.8rem;color:var(--mut)}
.dr-status{display:flex;justify-content:space-between;gap:8px;font-size:.85rem;margin-bottom:10px;flex-wrap:wrap}
.dr-status #dr-clock{font-weight:800;color:#fff}.dr-status #dr-clock.you{color:var(--acc)}
.dr-tabs{display:flex;gap:6px;margin-bottom:10px}.dr-tabs button{flex:1;padding:8px;border-radius:10px;border:1px solid var(--line);background:#0b1325;color:var(--txt);font:inherit;font-weight:700;cursor:pointer}.dr-tabs button.on{background:#16a34a;border-color:#16a34a;color:#fff}
#dr-q{margin-bottom:8px}
#dr-list{max-height:420px;overflow:auto;border:1px solid var(--line);border-radius:12px}
.dr-row{display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:8px;padding:9px 10px;border-bottom:1px solid var(--line)}
.dr-row:last-child{border-bottom:0}.dr-row b{color:#fff;font-weight:700}.dr-row small{display:block;color:var(--mut);font-size:.75rem}
.dr-row .h{font-weight:800;color:#fff;min-width:44px;text-align:right}
.dr-row button{border:0;border-radius:8px;padding:6px 12px;background:#16a34a;color:#fff;font:inherit;font-weight:700;cursor:pointer}.dr-row button:disabled{background:#1e293b;color:#64748b;cursor:default}
.dr-board{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.dr-team{border:1px solid var(--line);border-top:4px solid var(--c);border-radius:10px;padding:8px;background:#0b1325;font-size:.8rem}
.dr-team h4{margin:0 0 4px;color:#fff;font-size:.88rem}.dr-team h4 small{color:var(--mut);font-weight:600}
.dr-team ol{margin:0;padding-left:18px}.dr-team li{margin:0;line-height:1.45}.dr-team li span{color:var(--mut)}
.dr-team.you{box-shadow:0 0 0 2px var(--acc)}
.dr-foot{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:10px;font-size:.82rem;flex-wrap:wrap}
.dr-link{background:none;border:0;color:var(--acc);font:inherit;font-weight:700;cursor:pointer;text-decoration:underline;padding:0}
.dr-res h2{margin:0 0 4px;font-size:1.5rem}.dr-res .champ{font-size:1.05rem;margin:0 0 12px}
.dr-res table{margin:10px 0}.dr-res td.you,.dr-res tr.you td{color:var(--acc);font-weight:800}
.dr-match{display:flex;justify-content:space-between;gap:8px;padding:6px 0;border-bottom:1px solid var(--line);font-size:.88rem}.dr-match b{color:#fff}
.dr-odds{background:#0b1325;border:1px solid var(--line);border-radius:12px;padding:10px 12px;margin:12px 0;font-size:.9rem}
.dr-nav{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}.dr-nav .cta{margin:0;border:0;cursor:pointer;font:inherit;font-weight:700}.dr-nav .alt{background:#1e293b;box-shadow:none}
.dr-opp{display:grid;gap:10px}
.dr-pairs{display:grid;gap:6px}
.dr-pair{display:grid;grid-template-columns:18px 1fr 1fr 52px;gap:6px;align-items:center}
.dr-pair .n{color:var(--mut);font-weight:800;font-size:.8rem}.dr-pair .r{font-size:.66rem;color:var(--mut);line-height:1.3;text-align:right}
.dr-pair button{min-width:0;padding:7px 6px;border-radius:9px;border:1px solid var(--line);background:#0b1325;color:#fff;font:inherit;font-size:.78rem;font-weight:700;text-align:left;cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dr-pair button small{display:block;color:var(--mut);font-weight:600;font-size:.7rem}.dr-pair button.on{border-color:var(--acc);background:#14532d}
.dr-mt{border:1px solid var(--line);border-radius:12px;padding:8px 10px;margin:10px 0;background:#0b1325}
.dr-mt summary{display:flex;justify-content:space-between;gap:8px;cursor:pointer;font-size:.9rem;flex-wrap:wrap}.dr-mt summary b{color:#fff}
.dr-mt h4{margin:10px 0 4px;font-size:.85rem;color:#fff}.dr-mt h4 small{color:var(--mut);font-weight:600;margin-left:6px}
.dr-g{display:grid;grid-template-columns:1fr auto 1fr;gap:6px;font-size:.76rem;padding:4px 0;border-bottom:1px solid var(--line);align-items:center}
.dr-g span:last-child{text-align:right}.dr-g span{color:var(--mut);min-width:0;overflow-wrap:anywhere}.dr-g span.w{color:#fff;font-weight:700}.dr-g i{font-style:normal;font-weight:700;color:var(--acc);white-space:nowrap}
.ii-more{text-align:center;font-size:.9rem;color:var(--mut)}
#toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#1e293b;border:1px solid #334155;color:#fff;font-weight:600;font-size:.9rem;padding:10px 16px;border-radius:12px;opacity:0;transition:opacity .2s;pointer-events:none;z-index:60}#toast.show{opacity:1}
</style>`;

  const script = `<script>
(function () {
var D = ${JSON.stringify(D)};
var T = D.teams, NT = T.length, PER = 16, PICKS = NT * (PER - 1);
var el = function (id) { return document.getElementById(id); };
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function fh(h) { return h < 0 ? '+' + Math.abs(h).toFixed(1) : h.toFixed(1); }
var mine = [false, false, false, false], pairs, rosters, avail, pick, timer, q = '', auto = false;
function isMine(i) { return mine[i]; }
function mineList() { return [0, 1, 2, 3].filter(isMine); }

// Snake order: round 1 = 0,1,2,3; round 2 = 3,2,1,0; ...
function teamFor(k) { var r = Math.floor(k / NT), i = k % NT; return r % 2 === 0 ? i : NT - 1 - i; }

function start() {
  pick = 0; auto = false; q = ''; el('dr-q').value = '';
  rosters = T.map(function (t) { return [D.players.filter(function (p) { return p.c && p.t === t.name; })[0]]; });
  avail = D.players.filter(function (p) { return !p.c; }).sort(function (a, b) { return a.h - b.h || a.n.localeCompare(b.n); });
  el('dr-start').hidden = true; el('dr-result').hidden = true; el('dr-draft').hidden = false;
  tab('avail'); el('dr-last').textContent = ''; step();
}
function aiChoice(list) {
  // Mostly the best handicap available, sometimes a reach among the next few.
  var w = [0.5, 0.2, 0.12, 0.08, 0.06, 0.04], r = Math.random(), acc = 0;
  for (var i = 0; i < Math.min(w.length, list.length); i++) { acc += w[i]; if (r < acc) return list[i]; }
  return list[0];
}
function take(p) {
  var t = teamFor(pick);
  avail.splice(avail.indexOf(p), 1); rosters[t].push(p);
  el('dr-last').textContent = 'Pick ' + (pick + 1) + ': ' + T[t].short + ' took ' + p.n + ' (' + fh(p.h) + ')';
  pick++; step();
}
function step() {
  clearTimeout(timer);
  if (pick >= PICKS) { finish(); return; }
  var t = teamFor(pick), round = Math.floor(pick / NT) + 1, you = isMine(t) && !auto;
  el('dr-round').textContent = 'Round ' + round + '/' + (PER - 1) + ' · Pick ' + (pick + 1) + '/' + PICKS;
  el('dr-clock').textContent = you ? (mineList().length > 1 ? 'Your pick: Team ' + T[t].short : 'Your pick!') : 'On the clock: ' + T[t].captain;
  el('dr-clock').className = you ? 'you' : '';
  render();
  if (!you) timer = setTimeout(function () { take(aiChoice(avail)); }, auto ? 10 : 380);
}
function render() {
  var yourTurn = pick < PICKS && isMine(teamFor(pick)) && !auto, f = q.toLowerCase();
  el('dr-list').innerHTML = avail.filter(function (p) { return !f || p.n.toLowerCase().indexOf(f) >= 0; }).map(function (p) {
    return '<div class="dr-row"><div><b>' + esc(p.n) + '</b><small>' + (p.y ? 'Played 2025' : 'Debut') + ' · real team: ' + esc(p.t.replace('Team ', '')) + '</small></div><span class="h">' + fh(p.h) + '</span><button type="button" data-n="' + esc(p.n) + '"' + (yourTurn ? '' : ' disabled') + '>Draft</button></div>';
  }).join('') || '<p class="mut" style="padding:10px">No players match.</p>';
  el('dr-board').innerHTML = board();
}
function avg(r) { return r.reduce(function (a, p) { return a + p.h; }, 0) / r.length; }
function board() {
  return '<div class="dr-board">' + T.map(function (t, i) {
    var r = rosters[i];
    return '<div class="dr-team' + (isMine(i) ? ' you' : '') + '" style="--c:' + t.color + '"><h4>' + esc(t.short) + (isMine(i) ? ' (you)' : '') + ' <small>avg ' + fh(avg(r)) + '</small></h4><ol>' +
      r.map(function (p) { return '<li>' + esc(p.n) + ' <span>' + fh(p.h) + '</span></li>'; }).join('') + '</ol></div>';
  }).join('') + '</div>';
}
function tab(name) {
  document.querySelectorAll('.dr-tabs button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-tab') === name); });
  el('dr-avail').hidden = name !== 'avail'; el('dr-board').hidden = name !== 'board';
}

// ---- Tournament: draw, semifinals and final ----
// A match = 8 two-player pairs per team, pair 1 against pair 1 and so on. Each pair plays
// a scramble round and an alternate-shot round: 16 points. 8-8 goes to a sudden-death playoff.
var FMT = [['scr', 'Scramble'], ['alt', 'Alt shot']], K = 0.4;
var MARGINS = ['1 up', '2 & 1', '3 & 2', '4 & 3', '5 & 4'];
function strength(r) {
  var s = r.map(function (p) { return p.h; }).sort(function (a, b) { return a - b; }), w = 1, sw = 0, sum = 0;
  for (var i = 0; i < s.length; i++) { sum += s[i] * w; sw += w; w *= 0.88; }
  return sum / sw;
}
// Pair rating in strokes (lower is better). Scramble leans on the better player; alt shot needs both.
function pairVal(pr, f) { var a = Math.min(pr[0].h, pr[1].h), b = Math.max(pr[0].h, pr[1].h); return f === 'scr' ? 0.7 * a + 0.3 * b : (a + b) / 2; }
function pairSum(pr) { return pairVal(pr, 'scr') + pairVal(pr, 'alt'); }
function autoPairs(r, jitter) {
  var s = r.slice().sort(function (a, b) { return a.h - b.h; });
  if (jitter) for (var k = 0; k < 3; k++) { var i = Math.floor(Math.random() * 15), x = s[i]; s[i] = s[i + 1]; s[i + 1] = x; }
  var P = []; for (var j = 0; j < PER / 2; j++) P.push([s[j], s[PER - 1 - j]]);
  return P.sort(function (x, y) { return pairSum(x) - pairSum(y); });
}
function short(n) { var w = n.split(' '); return w.length > 1 ? w[w.length - 1] : n; }
function pairName(pr) { return esc(short(pr[0].n)) + ' &amp; ' + esc(short(pr[1].n)); }
function pts(x) { var f = Math.floor(x), h = x % 1 ? '½' : ''; return (f || !h ? f : '') + h; }
function logi(d) { return 1 / (1 + Math.exp(-K * d)); }
function playMatch(i, j) {
  var A = pairs[i], B = pairs[j], res = { t: [i, j], p: [0, 0], rounds: [] };
  FMT.forEach(function (f) {
    var games = [];
    for (var k = 0; k < A.length; k++) {
      var pA = logi(pairVal(B[k], f[0]) - pairVal(A[k], f[0])), g = { a: A[k], b: B[k] };
      if (Math.random() < 0.12 * (1 - Math.abs(2 * pA - 1))) { g.w = -1; g.m = 'Halved'; res.p[0] += 0.5; res.p[1] += 0.5; }
      else { var aw = Math.random() < pA, fav = aw ? pA : 1 - pA; g.w = aw ? 0 : 1; g.m = MARGINS[Math.min(4, Math.floor(Math.random() * (1 + fav * 4)))]; res.p[g.w]++; }
      games.push(g);
    }
    res.rounds.push({ f: f[1], games: games });
  });
  if (res.p[0] === res.p[1]) { res.po = Math.random() < logi(2 * (pairVal(B[0], 'scr') - pairVal(A[0], 'scr'))) ? 0 : 1; res.w = res.t[res.po]; }
  else res.w = res.p[0] > res.p[1] ? i : j;
  res.l = res.w === i ? j : i;
  return res;
}
function score(m, side) { return pts(m.p[side]); }
function line(m) { return esc(T[m.t[0]].short) + ' ' + score(m, 0) + '–' + score(m, 1) + ' ' + esc(T[m.t[1]].short) + (m.po !== undefined ? ' (' + esc(T[m.w].short) + ' won playoff)' : ''); }

var stage, semis, drawn, semiRes, finalRes, queue;
function finish() {
  el('dr-draft').hidden = true; el('dr-result').hidden = false;
  pairs = rosters.map(function (r, i) { return autoPairs(r, !isMine(i)); });
  draw();
}
function show(h) { el('dr-result').innerHTML = '<div class="dr-res">' + h + '</div>'; window.scrollTo({ top: el('dr').offsetTop - 80, behavior: 'smooth' }); }
function teamTag(i) { return '<b style="color:' + T[i].color + '">' + esc(T[i].short) + '</b>' + (isMine(i) ? ' (you)' : ''); }

function draw() {
  stage = 'semi'; semiRes = finalRes = null;
  drawn = Math.floor(Math.random() * NT);
  var others = [0, 1, 2, 3].filter(function (i) { return i !== drawn; });
  var h = '<h2>🎲 The draw</h2><p class="champ">' + teamTag(drawn) + ' was drawn and picks its semifinal opponent.</p>';
  if (isMine(drawn)) {
    h += '<p class="mut small" style="margin:0 0 8px">Team rating = weighted handicap, lower is stronger.</p><div class="dr-opp">' + others.map(function (i) {
      return '<button type="button" class="dr-cap" data-o="' + i + '" style="--c:' + T[i].color + '"><b>' + esc(T[i].name) + (isMine(i) ? ' (you)' : '') + '</b><span>Team rating ' + fh(strength(rosters[i])) + '</span></button>';
    }).join('') + '</div><p class="mut small">Your team rating: ' + fh(strength(rosters[drawn])) + '</p>';
    show(h);
    document.querySelectorAll('[data-o]').forEach(function (b) { b.onclick = function () { setSemis(+b.getAttribute('data-o')); }; });
  } else {
    // AI usually picks the weakest-looking opponent, sometimes a grudge match.
    var byS = others.slice().sort(function (a, b) { return strength(rosters[b]) - strength(rosters[a]); });
    var opp = Math.random() < 0.65 ? byS[0] : others[Math.floor(Math.random() * 3)];
    show(h); setSemis(opp, true);
  }
}
function setSemis(opp, ai) {
  var rest = [0, 1, 2, 3].filter(function (i) { return i !== drawn && i !== opp; });
  semis = [[drawn, opp], rest];
  var h = '<h2>🎲 The draw</h2><p class="champ">' + teamTag(drawn) + (ai ? ' chose ' : ' takes on ') + teamTag(opp) + '.</p>' +
    '<div class="dr-odds"><b>Semifinal 1:</b> ' + teamTag(semis[0][0]) + ' vs ' + teamTag(semis[0][1]) + '<br><b>Semifinal 2:</b> ' + teamTag(semis[1][0]) + ' vs ' + teamTag(semis[1][1]) + '</div>' +
    '<p class="mut small">Each match: 8 pairs play a scramble and an alt-shot round, 16 points in total. Tied 8–8 means a sudden-death playoff.</p>';
  lineups(h, [].concat(semis[0], semis[1]));
}
function lineups(intro, teamsIn) {
  queue = teamsIn.filter(isMine);
  intro = intro || '';
  if (!queue.length) { show(intro + '<div class="dr-nav"><button class="cta" type="button" id="dr-play">Play ' + (stage === 'semi' ? 'the semifinals' : 'the final') + '</button></div>'); el('dr-play').onclick = play; return; }
  editor(intro);
}
var sel = null;
function editor(intro) {
  var t = queue[0], P = pairs[t], last = queue.length === 1, opp = opponent(t);
  var h = (intro || '') + '<h3>' + (stage === 'semi' ? 'Semifinal' : 'Final') + ' pairs: ' + teamTag(t) + ' vs ' + teamTag(opp) + '</h3>' +
    '<p class="mut small" style="margin:0 0 8px">Tap two players to swap them. Pair 1 plays their pair 1, and so on. Pairs play both rounds. AI captains put their strongest pairs on top.</p><div class="dr-pairs">' +
    P.map(function (pr, k) {
      return '<div class="dr-pair"><span class="n">' + (k + 1) + '</span>' + pr.map(function (p, s) {
        var id = k + ':' + s; return '<button type="button" data-p="' + id + '"' + (sel === id ? ' class="on"' : '') + '>' + esc(p.n) + '<small>' + fh(p.h) + '</small></button>';
      }).join('') + '<span class="r">SCR ' + fh(pairVal(pr, 'scr')) + '<br>ALT ' + fh(pairVal(pr, 'alt')) + '</span></div>';
    }).join('') + '</div><div class="dr-nav"><button class="cta" type="button" id="dr-ok">' + (last ? 'Play ' + (stage === 'semi' ? 'the semifinals' : 'the final') : 'Next team') + '</button><button class="cta alt" type="button" id="dr-autop">Auto pairs</button></div>';
  el('dr-result').innerHTML = '<div class="dr-res">' + h + '</div>';
  el('dr-result').querySelectorAll('[data-p]').forEach(function (b) {
    b.onclick = function () {
      var id = b.getAttribute('data-p');
      if (sel === null) sel = id;
      else if (sel === id) sel = null;
      else { var a = sel.split(':'), c = id.split(':'), x = P[a[0]][a[1]]; P[a[0]][a[1]] = P[c[0]][c[1]]; P[c[0]][c[1]] = x; sel = null; }
      editor(intro);
    };
  });
  el('dr-autop').onclick = function () { pairs[t] = autoPairs(rosters[t]); sel = null; editor(intro); };
  el('dr-ok').onclick = function () { sel = null; queue.shift(); if (queue.length) { editor(''); window.scrollTo({ top: el('dr').offsetTop - 80, behavior: 'smooth' }); } else play(); };
}
function opponent(t) {
  if (stage === 'final') return finalists()[0] === t ? finalists()[1] : finalists()[0];
  var s = semis[0].indexOf(t) >= 0 ? semis[0] : semis[1]; return s[0] === t ? s[1] : s[0];
}
function finalists() { return [semiRes[0].w, semiRes[1].w]; }
function matchHtml(m, title, open) {
  var h = '<details class="dr-mt"' + (open ? ' open' : '') + '><summary><span>' + title + '</span><b>' + line(m) + '</b></summary>';
  m.rounds.forEach(function (r) {
    var a = 0, b = 0; r.games.forEach(function (g) { if (g.w === 0) a++; else if (g.w === 1) b++; else { a += .5; b += .5; } });
    h += '<h4>' + r.f + ' <small>' + esc(T[m.t[0]].short) + ' ' + pts(a) + '–' + pts(b) + ' ' + esc(T[m.t[1]].short) + '</small></h4>' + r.games.map(function (g) {
      return '<div class="dr-g"><span' + (g.w === 0 ? ' class="w"' : '') + '>' + pairName(g.a) + '</span><i>' + (g.w === -1 ? 'Halved' : esc(T[m.t[g.w]].short) + ' ' + g.m) + '</i><span' + (g.w === 1 ? ' class="w"' : '') + '>' + pairName(g.b) + '</span></div>';
    }).join('');
  });
  if (m.po !== undefined) h += '<p class="mut small">Tied 8–8. ' + esc(T[m.w].short) + ' won the sudden-death scramble playoff.</p>';
  return h + '</details>';
}
function play() {
  pairs.forEach(function (P, i) { if (!isMine(i)) pairs[i] = autoPairs(rosters[i], true); });
  if (stage === 'semi') {
    semiRes = [playMatch(semis[0][0], semis[0][1]), playMatch(semis[1][0], semis[1][1])];
    var f = finalists();
    var h = '<h2>Semifinal results</h2>' + matchHtml(semiRes[0], 'Semifinal 1', true) + matchHtml(semiRes[1], 'Semifinal 2', true) +
      '<p class="champ" style="margin-top:14px">🏆 Final: ' + teamTag(f[0]) + ' vs ' + teamTag(f[1]) + '</p>';
    stage = 'final';
    var outIntro = h;
    if (f.some(isMine)) {
      show(h + '<div class="dr-nav"><button class="cta" type="button" id="dr-next">Set final pairs</button></div>');
      el('dr-next').onclick = function () { lineups('', f); window.scrollTo({ top: el('dr').offsetTop - 80, behavior: 'smooth' }); };
    } else {
      show(h + '<div class="dr-nav"><button class="cta" type="button" id="dr-play">Play the final</button></div>'); el('dr-play').onclick = play;
    }
    return;
  }
  var fs = finalists(); finalRes = playMatch(fs[0], fs[1]); results();
}
function results() {
  var m = finalRes, ml = mineList(), won = isMine(m.w), all = ml.length === 4;
  var inFinal = ml.indexOf(m.l) >= 0;
  var head = all ? '🏆 ' + esc(T[m.w].name) + ' wins' : won ? '🏆 Champions!' : inFinal ? 'Lost in the final' : 'Out in the semis';
  var h = '<h2>' + head + '</h2><p class="champ">' + esc(T[m.w].name) + ' won the simulated Internet Invitational, beating ' + esc(T[m.l].short) + ' ' + pts(m.p[m.t.indexOf(m.w)]) + '–' + pts(m.p[m.t.indexOf(m.l)]) + (m.po !== undefined ? ' after a playoff' : '') + ' in the final.</p>' +
    matchHtml(m, 'Final', true) + matchHtml(semiRes[0], 'Semifinal 1', false) + matchHtml(semiRes[1], 'Semifinal 2', false) +
    '<h3>The teams</h3>' + board() +
    '<div class="dr-nav"><button class="cta" type="button" id="dr-share">Share my draft</button><button class="cta alt" type="button" id="dr-resim">Replay from the draw</button><button class="cta alt" type="button" id="dr-new">New draft</button></div>';
  show(h);
  el('dr-resim').onclick = draw;
  el('dr-new').onclick = function () { auto = false; el('dr-result').hidden = true; el('dr-start').hidden = false; el('dr-draft').hidden = true; window.scrollTo({ top: el('dr').offsetTop - 80, behavior: 'smooth' }); };
  el('dr-share').onclick = share;
}
function share() {
  var ml = mineList(), m = finalRes, text;
  if (ml.length === 1) {
    var me = ml[0], r = rosters[me].slice().sort(function (a, b) { return a.h - b.h; }).slice(1, 6).map(function (p) { return p.n; }).join(', ');
    var sm = semiRes[0].t.indexOf(me) >= 0 ? semiRes[0] : semiRes[1];
    text = 'I drafted Team ' + T[me].short + ' in the Internet Invitational draft simulator ' + (m.w === me ? '🏆 and won the title!' : '⛳') +
      '\\nTop picks: ' + r + '\\nSemi: ' + line(sm) + (sm.w === me ? '\\nFinal: ' + line(m) : '');
  } else {
    text = 'I ran the Internet Invitational draft simulator ⛳\\n🏆 ' + T[m.w].name + ' won the final, ' + line(m);
  }
  text += '\\nhttps://dailygolfgame.com/internet-invitational/draft/';
  if (navigator.share && window.matchMedia && matchMedia('(pointer: coarse)').matches) { navigator.share({ text: text }).catch(function () {}); return; }
  var ok = function () { toast('Copied – paste it anywhere!'); };
  if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(ok, function () { prompt('Copy your draft:', text); });
  else prompt('Copy your draft:', text);
}
function toast(m) { var x = el('toast'); if (!x) { x = document.createElement('div'); x.id = 'toast'; x.setAttribute('role', 'status'); document.body.appendChild(x); }
  x.textContent = m; x.className = 'show'; clearTimeout(toast.t); toast.t = setTimeout(function () { x.className = ''; }, 2200); }

function syncCaps() {
  document.querySelectorAll('.dr-cap').forEach(function (b) { b.setAttribute('aria-pressed', mine[+b.getAttribute('data-i')] ? 'true' : 'false'); });
  el('dr-go').disabled = !mineList().length;
  el('dr-go').textContent = mineList().length > 1 ? 'Start draft (' + mineList().length + ' teams)' : 'Start draft';
}
document.querySelectorAll('.dr-cap').forEach(function (b) { b.onclick = function () { var i = +b.getAttribute('data-i'); mine[i] = !mine[i]; syncCaps(); }; });
el('dr-all').onclick = function () { var all = mineList().length === 4; mine = [!all, !all, !all, !all]; syncCaps(); };
el('dr-go').onclick = function () { if (mineList().length) start(); };
document.querySelectorAll('.dr-tabs button').forEach(function (b) { b.onclick = function () { tab(b.getAttribute('data-tab')); }; });
el('dr-list').addEventListener('click', function (e) {
  var b = e.target.closest('button[data-n]'); if (!b || b.disabled) return;
  var n = b.getAttribute('data-n'); for (var i = 0; i < avail.length; i++) if (avail[i].n === n) { take(avail[i]); return; }
});
el('dr-q').addEventListener('input', function () { q = this.value.trim(); render(); });
el('dr-auto').onclick = function () { auto = true; step(); };
})();
</script>`;

  return page({
    urlPath: '/internet-invitational/draft/',
    title: 'Internet Invitational Draft Simulator 2026: Draft Your Team | Dailygolf',
    description: 'Be a captain in the 2026 Internet Invitational draft. Pick 15 players in the real snake order against AI captains, then pick your semifinal opponent, set your pairs and play scramble and alt shot for the title.',
    crumbs: [['Home', '/'], ['Internet Invitational', '/internet-invitational/'], ['Draft simulator']],
    body: css + '\n' + body + '\n' + script,
    jsonld: { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Internet Invitational Draft Simulator', applicationCategory: 'GameApplication', operatingSystem: 'Any', url: 'https://dailygolfgame.com/internet-invitational/draft/', isAccessibleForFree: true }
  });
}
function ordinalSmall(n) { return n + (['th', 'st', 'nd', 'rd'][n] || 'th'); }
