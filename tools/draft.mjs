// Renders /internet-invitational/draft/: an Internet Invitational draft simulator.
// You captain one of the four teams; AI captains draft the other three in the real
// snake order, then a simulated tournament decides the champion.
// Data: data/internet-invitational-2026.json. Called from build-pages.mjs.

export function renderDraft({ data, esc, page }) {
  const teams = Object.keys(data.teams); // real snake order: Dalke, Bryan, Finch, Ruffels
  const COLORS = { Red: '#ef4444', Green: '#22c55e', Blue: '#3b82f6', White: '#e2e8f0' };
  const D = {
    teams: teams.map(t => ({ name: t, short: t.replace('Team ', ''), captain: data.teams[t].captain, color: COLORS[data.teams[t].color] || '#94a3b8' })),
    players: data.players.map(p => ({ n: p.name, h: p.hcp, t: p.team, y: p.played2025, c: !!p.captain }))
  };

  const body = `<h1>Internet Invitational Draft Simulator</h1>
<p class="lead">Run the 2026 Internet Invitational draft. Captain one team, two, three or all four (pass the phone to a friend), and AI captains draft the rest. Then see who wins the simulated tournament.</p>
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
<p>The four captains are fixed, as in the real event: Brad Dalke, Wesley Bryan, Peter Finch and Ryan Ruffels. AI captains mostly take the best available handicap but sometimes reach for someone else, so no two drafts are the same. When the draft is done, every team plays every other team once and the top two meet in the final. Better teams win more often, but upsets happen, just like on the course.</p>
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
var mine = [false, false, false, false], rosters, avail, pick, timer, q = '', auto = false;
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

// ---- Tournament simulation ----
// Team strength: weighted handicap average, better players count more (scramble/alt-shot formats).
function strength(r) {
  var s = r.map(function (p) { return p.h; }).sort(function (a, b) { return a - b; }), w = 1, sw = 0, sum = 0;
  for (var i = 0; i < s.length; i++) { sum += s[i] * w; sw += w; w *= 0.88; }
  return sum / sw;
}
// Win probability: logistic on the strength gap. 1 stroke better = ~66%, 2 strokes = ~79%.
function pWin(a, b) { return 1 / (1 + Math.exp(0.68 * (a - b))); }
var MARGINS = ['1 up', '2 & 1', '3 & 2', '4 & 3', '5 & 4'];
function play(i, j, S, rnd) {
  var p = pWin(S[i], S[j]), aWins = rnd() < p, fav = aWins ? p : 1 - p;
  var m = Math.min(4, Math.floor(rnd() * (1 + fav * 4)));
  return { w: aWins ? i : j, l: aWins ? j : i, m: m };
}
function tournament(rnd) {
  var S = rosters.map(strength), wins = [0, 0, 0, 0], diff = [0, 0, 0, 0], games = [];
  for (var i = 0; i < NT; i++) for (var j = i + 1; j < NT; j++) {
    var g = play(i, j, S, rnd); games.push(g); wins[g.w]++; diff[g.w] += g.m + 1; diff[g.l] -= g.m + 1;
  }
  var order = [0, 1, 2, 3].sort(function (a, b) { return wins[b] - wins[a] || diff[b] - diff[a] || S[a] - S[b]; });
  var fin = play(order[0], order[1], S, rnd);
  return { S: S, wins: wins, diff: diff, games: games, order: order, final: fin, champ: fin.w };
}
function titleOdds() {
  var n = 3000, c = [0, 0, 0, 0];
  for (var k = 0; k < n; k++) c[tournament(Math.random).champ]++;
  return c.map(function (x) { return Math.round(x / n * 100); });
}

function finish() {
  el('dr-draft').hidden = true;
  var t = tournament(Math.random), odds = titleOdds(), ml = mineList(), won = isMine(t.champ);
  var byS = [0, 1, 2, 3].sort(function (a, b) { return t.S[a] - t.S[b]; });
  var head = ml.length === 0 ? '🏆 ' + esc(T[t.champ].name) + ' wins'
    : ml.length === 4 ? '🏆 ' + esc(T[t.champ].name) + ' wins'
    : won ? '🏆 Champions!' : ml.indexOf(t.final.l) >= 0 ? 'Lost in the final' : 'Knocked out';
  var sub = ml.length === 1 ? (won ? 'Your Team ' + esc(T[ml[0]].short) + ' won the simulated Internet Invitational.' : esc(T[t.champ].name) + ' won the title.')
    : (won ? 'Your Team ' + esc(T[t.champ].short) + ' won the simulated Internet Invitational, beating ' + esc(T[t.final.l].short) + ' in the final.' : esc(T[t.champ].name) + ' won the title, beating ' + esc(T[t.final.l].short) + ' in the final.');
  var h = '<div class="dr-res"><h2>' + head + '</h2><p class="champ">' + sub + '</p>' +
    '<div class="dr-odds">Title odds over 3,000 simulated tournaments: ' + byS.map(function (i) { return (isMine(i) ? '<b>' : '') + esc(T[i].short) + ' ' + odds[i] + '%' + (isMine(i) ? '</b>' : ''); }).join(' · ') + '</div>' +
    '<h3>Round robin</h3>' + t.games.map(function (g) { return '<div class="dr-match"><span><b>' + esc(T[g.w].short) + '</b> beat ' + esc(T[g.l].short) + '</span><span>' + MARGINS[g.m] + '</span></div>'; }).join('') +
    '<div class="tbl"><table><thead><tr><th>Team</th><th>W</th><th>L</th><th>Strength</th></tr></thead><tbody>' +
    t.order.map(function (i) { return '<tr' + (isMine(i) ? ' class="you"' : '') + '><td>' + esc(T[i].short) + (isMine(i) ? ' (you)' : '') + '</td><td>' + t.wins[i] + '</td><td>' + (3 - t.wins[i]) + '</td><td>' + fh(t.S[i]) + '</td></tr>'; }).join('') +
    '</tbody></table></div>' +
    '<h3>Final</h3><div class="dr-match"><span><b>' + esc(T[t.final.w].short) + '</b> beat ' + esc(T[t.final.l].short) + '</span><span>' + MARGINS[t.final.m] + '</span></div>' +
    '<h3>The teams</h3>' + board() +
    '<div class="dr-nav"><button class="cta" type="button" id="dr-share">Share my draft</button><button class="cta alt" type="button" id="dr-resim">Simulate again</button><button class="cta alt" type="button" id="dr-new">New draft</button></div></div>';
  el('dr-result').innerHTML = h; el('dr-result').hidden = false;
  el('dr-resim').onclick = finish;
  el('dr-new').onclick = function () { auto = false; el('dr-result').hidden = true; el('dr-start').hidden = false; el('dr-draft').hidden = true; window.scrollTo({ top: el('dr').offsetTop - 80, behavior: 'smooth' }); };
  el('dr-share').onclick = function () { share(t, odds, won); };
  window.scrollTo({ top: el('dr').offsetTop - 80, behavior: 'smooth' });
}
function share(t, odds, won) {
  var ml = mineList(), text;
  if (ml.length === 1) {
    var r = rosters[ml[0]].slice().sort(function (a, b) { return a.h - b.h; }).slice(1, 6).map(function (p) { return p.n; }).join(', ');
    text = 'I drafted Team ' + T[ml[0]].short + ' in the Internet Invitational draft simulator ' + (won ? '🏆 and won the title!' : '⛳') +
      '\\nTop picks: ' + r + '\\nTitle odds: ' + odds[ml[0]] + '%';
  } else {
    text = 'I ran the Internet Invitational draft simulator ⛳\\n🏆 ' + T[t.champ].name + ' won, beating ' + T[t.final.l].short + ' in the final';
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
    description: 'Be a captain in the 2026 Internet Invitational draft. Pick 15 players in the real snake order against AI captains, then see if your team wins the simulated tournament.',
    crumbs: [['Home', '/'], ['Internet Invitational', '/internet-invitational/'], ['Draft simulator']],
    body: css + '\n' + body + '\n' + script,
    jsonld: { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Internet Invitational Draft Simulator', applicationCategory: 'GameApplication', operatingSystem: 'Any', url: 'https://dailygolfgame.com/internet-invitational/draft/', isAccessibleForFree: true }
  });
}
function ordinalSmall(n) { return n + (['th', 'st', 'nd', 'rd'][n] || 'th'); }
