// Renders /internet-invitational/: the daily "Guess the Internet Invitational player" game
// plus spoiler-free facts about the event (teams, schedule, format, prize money).
// Data: data/internet-invitational-2026.json. Called from build-pages.mjs.

// Player slug used for /internet-invitational/<slug>/ pages.
export const iiSlug = (slug, p) => slug(p.name);

export function renderInvitational({ data, esc, slug, fmtHcp, creatorByName, page }) {
  const players = data.players;
  const sorted = players.slice().sort((a, b) => a.hcp - b.hcp || a.name.localeCompare(b.name));
  const teamNames = Object.keys(data.teams);
  const COLORS = { Red: '#ef4444', Green: '#22c55e', Blue: '#3b82f6', White: '#e2e8f0' };
  const withHcp = players.filter(p => p.hcp !== null).length;
  const link = p => `<a href="/internet-invitational/${iiSlug(slug, p)}/">${esc(p.name)}</a>`;
  // Episodes drop at 1 p.m. Eastern. The US leaves daylight saving time on Nov 1, 2026.
  const epUtc = d => d < '2026-11-01' ? `${d}T17:00:00Z` : `${d}T18:00:00Z`;
  const fmtDay = d => new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' });

  const gameData = {
    teams: data.teams,
    players: players.map(p => ({ n: p.name, t: p.team, h: p.hcp, y: p.played2025, c: p.captain || undefined }))
  };

  const body = `<h1>Guess the Internet Invitational Player</h1>
<p class="lead">A new mystery player from the 2026 Internet Invitational every day. Five guesses, with team, handicap and 2025 appearance as clues. Stuck? The full handicap list is right below the game.</p>
<a class="ii-promo" href="/internet-invitational/draft/"><span>🆕 Draft Simulator</span><small>Captain your own team in the 2026 draft vs AI captains, then simulate the tournament</small><b>Draft &rarr;</b></a>
<p class="ii-jump"><a href="#handicap-list">Handicap list ↓</a><a href="#teams">Teams ↓</a><a href="#schedule">Schedule ↓</a></p>
<div class="card" id="ii-game">
  <div class="ii-top"><span class="tag" id="ii-mode">Daily</span><span class="mut">Guesses: <b id="ii-count">0</b>/5</span></div>
  <div class="ii-search" id="ii-search">
    <input id="ii-inp" type="text" autocomplete="off" placeholder="Type a player (e.g. Grant Horvat, Riggs)" aria-label="Player name">
    <button class="cta" id="ii-go" type="button">Guess</button>
    <div id="ii-ac" class="ii-ac" hidden></div>
  </div>
  <div class="ii-head"><span>Player</span><span>Team</span><span>Handicap</span><span>Played 2025</span></div>
  <div id="ii-rows"></div>
  <div id="ii-end" hidden></div>
  <p class="mut small">Green = match. Yellow = handicap within 1.5. ▲ / ▼ = the mystery player's handicap number is higher / lower (plus handicaps count below zero).</p>
</div>
<noscript><p>The game needs JavaScript.</p></noscript>
<p class="ii-more"><a href="/internet-invitational/draft/">Draft Simulator</a> · More daily golf games: <a href="/">YouTube Golfer</a> · <a href="/#pro">Pro Golfer</a> · <a href="/trivia/">Golf Trivia</a></p>

<h2 id="handicap-list">Internet Invitational 2026 handicap list</h2>
<p>All ${players.length} players sorted from the best handicap down. Plus handicaps (+) are better than scratch. Handicaps are estimates by <a href="https://www.instagram.com/yt_golfstats/" rel="noopener">YT Golf Stats</a>, not official numbers. Tap a name for the player's page.</p>
<div class="tbl"><table class="roster"><thead><tr><th>#</th><th>Player</th><th>Handicap</th><th>Team</th></tr></thead><tbody>
${sorted.map((p, i) => `<tr><td>${i + 1}</td><td>${link(p)}${p.captain ? ' <span class="mut">(C)</span>' : ''}</td><td>${fmtHcp(p.hcp)}</td><td>${esc(p.team.replace('Team ', ''))}</td></tr>`).join('\n')}
</tbody></table></div>

<h2>Internet Invitational 2026: the essentials</h2>
<div class="facts">
<div><span>Players</span><b>${players.length}</b></div>
<div><span>Teams</span><b>${teamNames.length} × ${players.length / teamNames.length}</b></div>
<div><span>Purse</span><b>$4 million+</b></div>
<div><span>Episodes</span><b>${data.episodes.length}</b></div>
<div><span>Venue</span><b>Big Cedar Lodge, Missouri</b></div>
<div><span>Hosts</span><b>Barstool & Bob Does Sports</b></div>
</div>
<p>The Internet Invitational is a team golf tournament for YouTube golfers, creators and famous athletes, run by Barstool Sports and Bob Does Sports with Dave Portnoy as host. Season 2 grew from 48 to ${players.length} players, split into four teams of ${players.length / teamNames.length} led by Brad Dalke, Wesley Bryan, Peter Finch and Ryan Ruffels. The purse rose from $1 million in 2025 to at least $4 million. The episodes were filmed at Big Cedar Lodge in Missouri in August.</p>

<h2 id="schedule">Episode schedule and where to watch</h2>
<p>Six episodes, released on Mondays and Thursdays at 1 p.m. Eastern on the YouTube channels of Fore Play, Bob Does Sports and the Internet Invitational. Times below are shown in your own time zone.</p>
<div class="tbl"><table><thead><tr><th>Episode</th><th>Release</th></tr></thead><tbody>
${data.episodes.map((d, i) => `<tr><td>${i === data.episodes.length - 1 ? 'Finale' : 'Episode ' + (i + 1)}</td><td><time class="ep" datetime="${epUtc(d)}">${fmtDay(d)}, 1 p.m. ET</time></td></tr>`).join('\n')}
</tbody></table></div>

<h2 id="teams">The four teams (groups)</h2>
<p>The field is split into four teams of 16. Handicaps are estimates by <a href="https://www.instagram.com/yt_golfstats/" rel="noopener">YT Golf Stats</a> (@yt_golfstats), not official numbers; plus handicaps (+) are better than scratch. ✓ = also played in 2025. This page has no results, so it is safe to read before you watch.</p>
${teamNames.map(t => {
    const team = data.teams[t];
    const roster = players.filter(p => p.team === t);
    return `<h3><span class="dot" style="background:${COLORS[team.color] || '#94a3b8'}"></span>${esc(t)} <span class="mut">(captain ${esc(team.captain)}, ${esc(team.color.toLowerCase())})</span></h3>
<div class="tbl"><table class="roster"><thead><tr><th>Player</th><th>Handicap</th><th>2025</th></tr></thead><tbody>
${roster.map(p => `<tr><td>${link(p)}${p.captain ? ' <span class="mut">(C)</span>' : ''}</td><td>${p.hcp === null ? '—' : fmtHcp(p.hcp)}</td><td>${p.played2025 ? '✓' : ''}</td></tr>`).join('\n')}
</tbody></table></div>`;
  }).join('\n')}

<h2>Season 1 in short</h2>
<p>The first Internet Invitational in 2025 had 48 players in two teams, captained by Bob Does Sports' Robby Berger and Fore Play's Riggs, and a $1 million prize. Brad Dalke, Francis Ellis and Cody "Beef" Franke won it. Dalke and Ellis are back as defending champions, now on different teams.</p>
<p>Find the handicaps of more golf creators on our <a href="/youtubers/">YouTube golfer handicaps</a> page, or play the daily <a href="/#youtube">Guess the YouTube Golfer</a>.</p>
<p class="meta">Teams and 2025 appearances from public roster pages; handicap estimates by <a href="https://ytgolfstats.com/internet-invitational/2026/" rel="noopener">YT Golf Stats</a>. Dailygolf is an independent fan project, not affiliated with Barstool Sports, Bob Does Sports or the Internet Invitational.</p>`;

  const css = `<style>
#ii-game{padding:16px}
.ii-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
.tag{font-size:.75rem;letter-spacing:.08em;text-transform:uppercase;color:var(--acc);font-weight:800}
.mut{color:var(--mut)}.small{font-size:.8rem;margin:12px 0 0}
.ii-search{position:relative;display:flex;gap:8px;margin-bottom:12px}
.ii-search input{flex:1;min-width:0}.ii-search .cta{margin:0;border:0;cursor:pointer;font:inherit;font-weight:700;padding:10px 16px}
.ii-ac{position:absolute;left:0;right:0;top:100%;margin-top:6px;background:#0b1325;border:1px solid var(--line);border-radius:12px;max-height:260px;overflow:auto;z-index:20}
.ii-ac div{padding:10px 12px;cursor:pointer;display:flex;justify-content:space-between;gap:8px;border-bottom:1px solid var(--line)}
.ii-ac div:hover,.ii-ac div.on{background:#1e293b}.ii-ac small{color:var(--mut)}
.ii-head,.ii-row{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:6px}
.ii-head span{font-size:.68rem;text-transform:uppercase;letter-spacing:.06em;color:var(--mut);font-weight:700;text-align:center;padding:4px 0}
.ii-row{margin-top:6px}
.ii-row div{border:1px solid var(--line);background:#0b1325;border-radius:10px;padding:8px 4px;text-align:center;font-size:.82rem;font-weight:700;color:#fff;line-height:1.25;display:flex;align-items:center;justify-content:center;min-height:52px;word-break:break-word}
.ii-row .g{background:#059669;border-color:#10b981}.ii-row .y{background:#d97706;border-color:#f59e0b}
.dot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:6px;vertical-align:0}
#ii-end{text-align:center;margin-top:14px}#ii-end .big{font-size:1.5rem;font-weight:900;color:#fff}
#ii-end .nav{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:10px}#ii-end .cta{margin:0;border:0;cursor:pointer;font:inherit;font-weight:700}
#ii-end .alt{background:#1e293b;box-shadow:none}
.ii-next{display:grid;grid-template-columns:1fr auto;align-items:center;gap:2px 12px;margin-top:16px;padding:14px 16px;border-radius:14px;border:1px solid #16a34a;background:linear-gradient(135deg,rgba(22,163,74,.22),rgba(22,163,74,.06));text-decoration:none;text-align:left}
.ii-next span{color:#fff;font-weight:800}.ii-next small{grid-column:1;color:var(--mut);font-size:.8rem;line-height:1.35}
.ii-next b{grid-column:2;grid-row:1/3;background:#16a34a;color:#fff;border-radius:10px;padding:8px 14px;white-space:nowrap}.ii-next:hover b{background:#22c55e}
h2.ii-gameh{font-size:1.1rem;margin:22px 0 4px}
.ii-jump{display:flex;flex-wrap:wrap;gap:8px;margin:-8px 0 14px}.ii-jump a{background:var(--card);border:1px solid var(--line);border-radius:999px;padding:4px 12px;text-decoration:none;font-size:.9rem;color:var(--txt)}
.ii-promo{display:grid;grid-template-columns:1fr auto;align-items:center;gap:2px 12px;margin:0 0 14px;padding:12px 14px;border-radius:14px;border:1px solid #f59e0b;background:rgba(245,158,11,.1);text-decoration:none}
.ii-promo span{color:#fde68a;font-weight:800}.ii-promo small{grid-column:1;color:var(--mut);font-size:.8rem;line-height:1.35}
.ii-promo b{grid-column:2;grid-row:1/3;background:#d97706;color:#fff;border-radius:10px;padding:8px 14px;white-space:nowrap}
.ii-more{text-align:center;font-size:.9rem;color:var(--mut);margin:-6px 0 8px}
table.roster{min-width:0}
.ii-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:14px 0 10px}
.ii-stats div{background:#0b1325;border:1px solid var(--line);border-radius:12px;padding:10px 4px;font-size:.68rem;text-transform:uppercase;color:var(--mut);font-weight:700}
.ii-stats b{display:block;font-size:1.4rem;color:#fff}
.ii-dist div{display:flex;align-items:center;gap:8px;margin:5px 0;font-size:.78rem}.ii-dist span{width:92px;text-align:left;color:var(--mut)}
.ii-dist i{font-style:normal;background:#334155;color:#fff;font-weight:700;border-radius:4px;padding:1px 6px;text-align:right}.ii-dist i.me{background:#16a34a}
#toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#1e293b;border:1px solid #334155;color:#fff;font-weight:600;font-size:.9rem;padding:10px 16px;border-radius:12px;opacity:0;transition:opacity .2s;pointer-events:none;z-index:60}#toast.show{opacity:1}
</style>`;

  const script = `<script>
(function () {
var D = ${JSON.stringify(gameData)};
var P = D.players, MAX = 5, SITE = 'https://dailygolfgame.com/internet-invitational/';
var POOL = P.filter(function (p) { return p.h !== null; });
function dayNumber(d) { d = d || new Date(); return Math.round((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(2026, 0, 1)) / 864e5) + 1; }
function hashStr(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function shuffle(a, seed) { a = a.slice(); var t = seed >>> 0; function r() { t = (t + 0x6D2B79F5) >>> 0; var x = Math.imul(t ^ (t >>> 15), 1 | t); x ^= x + Math.imul(x ^ (x >>> 7), 61 | x); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }
  for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var k = a[i]; a[i] = a[j]; a[j] = k; } return a; }
function dailySecret(day) { var names = POOL.map(function (p) { return p.n; }).sort(), n = names.length, k = day - 302, c = Math.floor(k / n);
  var o = shuffle(names, hashStr('ii2026:' + c)); return find(o[((k % n) + n) % n]); }
function find(n) { for (var i = 0; i < P.length; i++) if (P[i].n === n) return P[i]; return null; }
function load(k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } }
function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function fh(h) { return h === null ? '—' : (h < 0 ? '+' + Math.abs(h).toFixed(1) : h.toFixed(1)); }
var el = function (id) { return document.getElementById(id); };
var day, secret, guesses, over, practice = false, stats = load('dg_ii_stats', { played: 0, wins: 0, streak: 0, max: 0, last: 0 });
if (!stats.dist || stats.dist.length !== 5) stats.dist = [0, 0, 0, 0, 0];
if (stats.last && stats.last < dayNumber() - 1) stats.streak = 0;

function cells(g) {
  var team = g.t === secret.t ? 'g' : '';
  var hc = '', ht = fh(g.h);
  if (g.h !== null) { var d = secret.h - g.h, ex = Math.abs(d) < 0.05; hc = ex ? 'g' : (Math.abs(d) <= 1.5 ? 'y' : ''); if (!ex) ht += d > 0 ? ' ▲' : ' ▼'; }
  return [[g === secret ? 'g' : '', g.n + (g.c ? ' (C)' : '')], [team, g.t.replace('Team ', '')], [hc, ht], [g.y === secret.y ? 'g' : '', g.y ? 'Yes' : 'No']];
}
function render() {
  el('ii-rows').innerHTML = guesses.slice().reverse().map(function (g) {
    return '<div class="ii-row">' + cells(g).map(function (c) { return '<div class="' + c[0] + '">' + esc(c[1]) + '</div>'; }).join('') + '</div>';
  }).join('');
  el('ii-count').textContent = guesses.length;
}
function persist() { if (!practice) save('dg_ii_day', { day: day, s: secret.n, g: guesses.map(function (g) { return g.n; }), over: !!over }); }
function start(isPractice) {
  practice = !!isPractice; day = dayNumber(); guesses = []; over = false;
  el('ii-end').hidden = true; el('ii-inp').disabled = el('ii-go').disabled = false;
  el('ii-mode').textContent = practice ? 'Practice (random player)' : 'Daily #' + day;
  if (practice) { secret = POOL[Math.floor(Math.random() * POOL.length)]; render(); return; }
  var s = load('dg_ii_day', null);
  if (s && s.day === day && find(s.s)) { secret = find(s.s); guesses = s.g.map(find).filter(Boolean); render(); if (s.over) finish(true); return; }
  secret = dailySecret(day); render();
}
function guess(name) {
  if (over) return;
  var v = (name || el('ii-inp').value).trim().toLowerCase(), p = null;
  for (var i = 0; i < P.length; i++) if (P[i].n.toLowerCase() === v) p = P[i];
  if (!p) { toast(v ? 'Pick a player from the list.' : 'Type a player name first.'); return; }
  if (guesses.indexOf(p) >= 0) { toast('You already guessed ' + p.n + '.'); return; }
  guesses.push(p); el('ii-inp').value = ''; hideAc(); render();
  if (p === secret || guesses.length >= MAX) finish(false); else persist();
}
function finish(restored) {
  over = true; el('ii-inp').disabled = el('ii-go').disabled = true;
  var won = guesses.indexOf(secret) >= 0;
  if (!practice && !restored) {
    stats.played++; if (won) { stats.wins++; stats.dist[guesses.length - 1]++; stats.streak = (!stats.last || stats.last === day - 1) ? stats.streak + 1 : 1; stats.max = Math.max(stats.max, stats.streak); } else stats.streak = 0;
    stats.last = day; save('dg_ii_stats', stats); persist();
  }
  el('ii-end').innerHTML = '<div class="big">' + (won ? 'Got it in ' + guesses.length + '!' : 'Out of bounds!') + '</div>' +
    '<p>The mystery player was <b>' + esc(secret.n) + '</b> (' + esc(secret.t) + ', handicap ' + fh(secret.h) + ').</p>' +
    (practice ? '' : statsHtml(won ? guesses.length - 1 : -1)) +
    '<div class="nav"><button class="cta" id="ii-share" type="button">Share result</button><button class="cta alt" id="ii-again" type="button">' + (practice ? 'Another player' : 'Practice round') + '</button></div>' +
    '<a class="ii-next" href="/"><span>▶ Next: today&rsquo;s YouTube Golfer</span><small>Guess the mystery golf YouTuber by handicap, subscribers and channel</small><b>Play &rarr;</b></a>';
  el('ii-end').hidden = false;
  el('ii-share').onclick = share; el('ii-again').onclick = function () { start(true); };
}
function statsHtml(mine) {
  var mx = Math.max.apply(null, stats.dist.concat(1)), names = ['Hole in One', 'Albatross', 'Eagle', 'Birdie', 'Par'];
  var tiles = [[stats.played, 'Played'], [(stats.played ? Math.round(stats.wins / stats.played * 100) : 0) + '%', 'Win %'], [stats.streak, 'Streak'], [stats.max, 'Max']];
  return '<div class="ii-stats">' + tiles.map(function (t) { return '<div><b>' + t[0] + '</b>' + t[1] + '</div>'; }).join('') + '</div>' +
    '<p class="mut small" style="text-align:left;margin-bottom:6px">GUESS DISTRIBUTION</p><div class="ii-dist">' +
    stats.dist.map(function (n, i) { return '<div><span>' + names[i] + '</span><i style="width:' + Math.max(8, n / mx * 100) + '%"' + (i === mine ? ' class="me"' : '') + '>' + n + '</i></div>'; }).join('') + '</div>';
}
function share() {
  var won = guesses.indexOf(secret) >= 0;
  var grid = guesses.map(function (g) { return cells(g).slice(1).map(function (c) { return c[0] === 'g' ? '🟩' : c[0] === 'y' ? '🟨' : '⬛'; }).join(''); }).join('\\n');
  var text = 'Guess the Internet Invitational player ' + (practice ? '(practice)' : '#' + day) + ' ⛳ ' + (won ? guesses.length : 'X') + '/' + MAX + '\\n' + grid + '\\n' + SITE;
  if (navigator.share && window.matchMedia && matchMedia('(pointer: coarse)').matches) { navigator.share({ text: text }).catch(function () {}); return; }
  var ok = function () { toast('Result copied – paste it anywhere!'); };
  if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(ok, function () { prompt('Copy your result:', text); });
  else prompt('Copy your result:', text);
}
function toast(m) { var t = el('toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.textContent = m; t.className = 'show'; clearTimeout(toast.t); toast.t = setTimeout(function () { t.className = ''; }, 2200); }
var ac = el('ii-ac');
function hideAc() { ac.hidden = true; }
el('ii-inp').addEventListener('input', function () {
  var q = this.value.trim().toLowerCase(); if (!q) { hideAc(); return; }
  var m = P.filter(function (p) { return guesses.indexOf(p) < 0 && p.n.toLowerCase().indexOf(q) >= 0; }).slice(0, 30);
  if (!m.length) { hideAc(); return; }
  ac.innerHTML = m.map(function (p) { return '<div data-n="' + esc(p.n) + '"><span>' + esc(p.n) + '</span><small>' + esc(p.t) + '</small></div>'; }).join('');
  ac.hidden = false;
});
ac.addEventListener('click', function (e) { var d = e.target.closest('[data-n]'); if (d) guess(d.getAttribute('data-n')); });
document.addEventListener('click', function (e) { if (!el('ii-search').contains(e.target)) hideAc(); });
el('ii-inp').addEventListener('keydown', function (e) { if (e.key === 'Enter') guess(); });
el('ii-go').onclick = function () { guess(); };
document.querySelectorAll('time.ep').forEach(function (t) {
  try { t.textContent = new Date(t.getAttribute('datetime')).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); } catch (e) {}
});
start(false);
})();
</script>`;

  return page({
    urlPath: '/internet-invitational/',
    title: 'Internet Invitational 2026: Handicaps, Teams & Daily Guessing Game',
    description: `Guess the mystery Internet Invitational player every day, with the handicap list for all ${players.length} players, the four teams and the episode schedule.`,
    crumbs: [['Home', '/'], ['Internet Invitational']],
    body: css + '\n' + body + '\n' + script,
    jsonld: { '@context': 'https://schema.org', '@type': 'SportsEvent', name: 'Internet Invitational 2026', sport: 'Golf', startDate: data.episodes[0], endDate: data.episodes[data.episodes.length - 1],
      eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode', eventStatus: 'https://schema.org/EventScheduled',
      location: { '@type': 'VirtualLocation', url: 'https://www.youtube.com/' }, organizer: { '@type': 'Organization', name: 'Barstool Sports' } }
  });
}

// One page per player: /internet-invitational/<slug>/ ("<name> handicap" searches).
export function renderInvitationalPlayers({ data, esc, slug, fmtHcp, creatorByName, page, ordinal }) {
  const players = data.players, n = players.length;
  const out = [];
  const teamAvg = t => { const r = players.filter(p => p.team === t); return r.reduce((a, p) => a + p.hcp, 0) / r.length; };
  for (const p of players) {
    const s = iiSlug(slug, p), team = data.teams[p.team];
    const rank = 1 + players.filter(x => x.hcp < p.hcp).length;
    const mates = players.filter(x => x !== p && x.team === p.team).sort((a, b) => a.hcp - b.hcp);
    const near = players.filter(x => x.team !== p.team).map(x => [x, Math.abs(x.hcp - p.hcp)]).sort((a, b) => a[1] - b[1]).slice(0, 6).map(x => x[0]);
    const chip = x => `<a href="/internet-invitational/${iiSlug(slug, x)}/">${esc(x.name)} (${fmtHcp(x.hcp)})</a>`;
    const hcpText = p.hcp < 0 ? `a plus ${Math.abs(p.hcp).toFixed(1)} handicap, better than scratch` : `a ${p.hcp.toFixed(1)} handicap`;
    const avg = teamAvg(p.team);
    const c = p.creator && creatorByName[p.creator];
    const body = `<h1>${esc(p.name)} Handicap</h1>
<p class="lead">${esc(p.name)} plays in the 2026 Internet Invitational for ${esc(p.team)}${p.captain ? ' as captain' : ` (captain ${esc(team.captain)})`}, with ${hcpText}.</p>
<div class="facts">
<div><span>Handicap (estimate)</span><b>${fmtHcp(p.hcp)}</b></div>
<div><span>Team</span><b>${esc(p.team.replace('Team ', ''))}</b></div>
<div><span>Captain</span><b>${esc(team.captain)}</b></div>
<div><span>Rank in field</span><b>${ordinal(rank)} of ${n}</b></div>
<div><span>2025 Invitational</span><b>${p.played2025 ? 'Played' : 'Debut in 2026'}</b></div>
</div>
<h2>How ${esc(p.name)} compares</h2>
<p>${esc(p.name)}'s handicap of ${fmtHcp(p.hcp)} is the ${ordinal(rank)} best of the ${n} players in the 2026 Internet Invitational. ${esc(p.team)} has an average handicap of ${fmtHcp(Math.round(avg * 10) / 10)}, so ${esc(p.name)} is ${Math.abs(p.hcp - avg) < 0.5 ? 'right at' : p.hcp < avg ? 'better than' : 'above'} the team average. ${p.played2025 ? `${esc(p.name)} also played the first Internet Invitational in 2025.` : `2026 is ${esc(p.name)}'s first Internet Invitational.`}</p>
${c ? `<p>${esc(p.name)} is also in our <a href="/youtubers/${c.slug}/">golf YouTuber list</a>, where the handicap from a public YouTube golf leaderboard is ${fmtHcp(c.hcp)}. Different sources and dates can give different numbers.</p>` : ''}
<h2>${esc(p.team)} teammates</h2>
<div class="chips">${mates.map(chip).join('')}</div>
<h2>Players with a similar handicap</h2>
<div class="chips">${near.map(chip).join('')}</div>
<h2>Can you guess ${esc(p.name)}?</h2>
<p>Every day there is a new mystery player from the Internet Invitational field. You get five guesses, with team, handicap and 2025 appearance as clues.</p>
<p><a class="cta" href="/internet-invitational/">Play Guess the Internet Invitational Player &rarr;</a></p>
<p class="meta">Handicap estimate by <a href="https://www.instagram.com/yt_golfstats/" rel="noopener">YT Golf Stats</a>, not an official number. Teams from public roster pages. <a href="/internet-invitational/#handicap-list">Full Internet Invitational handicap list</a></p>`;
    out.push([s, page({
      urlPath: `/internet-invitational/${s}/`,
      title: `${p.name} Handicap: Internet Invitational 2026 | Dailygolf`,
      description: `${p.name}'s handicap is ${fmtHcp(p.hcp)} (estimate) in the 2026 Internet Invitational, playing for ${p.team}. Rank ${rank} of ${n} in the field, teammates and similar handicaps.`,
      crumbs: [['Home', '/'], ['Internet Invitational', '/internet-invitational/'], [p.name]],
      body,
      jsonld: { '@context': 'https://schema.org', '@type': 'Person', name: p.name, url: `https://dailygolfgame.com/internet-invitational/${s}/` }
    })]);
  }
  return out;
}
