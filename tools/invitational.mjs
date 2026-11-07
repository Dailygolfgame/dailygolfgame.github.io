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


  const body = `<h1>Internet Invitational 2026: Handicaps, Teams &amp; Schedule</h1>
<p class="lead">Every player's handicap, the four teams and the episode schedule for the 2026 Internet Invitational, the YouTube golf team event run by Barstool Sports and Bob Does Sports.</p>
<a class="ii-play" href="/#invitational"><span>▶ Guess the Internet Invitational Player</span><small>A new mystery player every day. Five guesses, with team, handicap and 2025 appearance as clues.</small><b>Play &rarr;</b></a>
<p class="ii-jump"><a href="#handicap-list">Handicap list ↓</a><a href="#teams">Teams ↓</a><a href="#schedule">Schedule ↓</a><a href="/draft/">Draft simulator</a></p>

<h2 id="handicap-list">Internet Invitational 2026 handicap list</h2>
<p>All ${players.length} players sorted from the best handicap down. Plus handicaps (+) are better than scratch. Handicaps come from <a href="https://handicap-tracker.com" rel="noopener">handicap-tracker.com</a> where listed (November 2026), otherwise estimates by <a href="https://www.instagram.com/yt_golfstats/" rel="noopener">YT Golf Stats</a>, not official numbers. Tap a name for the player's page.</p>
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
<p>The field is split into four teams of 16. Handicaps come from <a href="https://handicap-tracker.com" rel="noopener">handicap-tracker.com</a> where listed (November 2026), otherwise estimates by <a href="https://www.instagram.com/yt_golfstats/" rel="noopener">YT Golf Stats</a> (@yt_golfstats), not official numbers; plus handicaps (+) are better than scratch. ✓ = also played in 2025. This page has no results, so it is safe to read before you watch.</p>
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
<p>Find the handicaps of more golf creators on our <a href="/youtubers/">YouTube golfer handicaps</a> page, or play the daily <a href="/#invitational">Guess the Internet Invitational Player</a> and <a href="/#youtube">Guess the YouTube Golfer</a>.</p>
<p class="meta">Teams and 2025 appearances from public roster pages; handicaps from <a href="https://handicap-tracker.com" rel="noopener">handicap-tracker.com</a> where listed, otherwise estimates by <a href="https://ytgolfstats.com/internet-invitational/2026/" rel="noopener">YT Golf Stats</a>. Dailygolf is an independent fan project, not affiliated with Barstool Sports, Bob Does Sports or the Internet Invitational.</p>`;

  const css = `<style>
.ii-play{display:grid;grid-template-columns:1fr auto;align-items:center;gap:2px 12px;margin:4px 0 16px;padding:16px;border-radius:14px;border:1px solid #16a34a;background:rgba(22,163,74,.12);text-decoration:none;text-align:left}
.ii-play span{color:#fff;font-weight:800;font-size:1.05rem}.ii-play small{grid-column:1;color:var(--mut);font-size:.85rem;line-height:1.35}
.ii-play b{grid-column:2;grid-row:1/3;background:#16a34a;color:#fff;border-radius:10px;padding:10px 16px;white-space:nowrap}.ii-play:hover b{background:#22c55e}
.dot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:6px;vertical-align:0}
#ii-end{text-align:center;margin-top:14px}#ii-end .big{font-size:1.5rem;font-weight:900;color:#fff}
#ii-end .nav{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:10px}#ii-end .cta{margin:0;border:0;cursor:pointer;font:inherit;font-weight:700}
#ii-end .alt{background:#1e293b;box-shadow:none}
.ii-next{display:grid;grid-template-columns:1fr auto;align-items:center;gap:2px 12px;margin-top:16px;padding:14px 16px;border-radius:14px;border:1px solid #16a34a;background:linear-gradient(135deg,rgba(22,163,74,.22),rgba(22,163,74,.06));text-decoration:none;text-align:left}
.ii-next span{color:#fff;font-weight:800}.ii-next small{grid-column:1;color:var(--mut);font-size:.8rem;line-height:1.35}
.ii-next b{grid-column:2;grid-row:1/3;background:#16a34a;color:#fff;border-radius:10px;padding:8px 14px;white-space:nowrap}.ii-next:hover b{background:#22c55e}
h2.ii-gameh{font-size:1.1rem;margin:22px 0 4px}
.ii-jump{display:flex;flex-wrap:wrap;gap:8px;margin:-8px 0 14px}.ii-jump a{background:var(--card);border:1px solid var(--line);border-radius:999px;padding:4px 12px;text-decoration:none;font-size:.9rem;color:var(--txt)}
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
document.querySelectorAll('time.ep').forEach(function (t) {
  try { t.textContent = new Date(t.getAttribute('datetime')).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); } catch (e) {}
});
</script>`;

  return page({
    howto: 'invitational',
    urlPath: '/internet-invitational/',
    title: 'Internet Invitational 2026: Handicaps, Teams & Schedule',
    description: `The handicap list for all ${players.length} Internet Invitational 2026 players, the four teams and the episode schedule, plus a daily guess-the-player game.`,
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
<p><a class="cta" href="/#invitational">Play Guess the Internet Invitational Player &rarr;</a></p>
<p class="meta">${p.hcpSource === 'scores' ? 'Handicap estimate based on recent tournament scores' : p.hcpSource ? 'Handicap from <a href="https://handicap-tracker.com" rel="noopener">handicap-tracker.com</a> (November 2026)' : 'Handicap estimate by <a href="https://www.instagram.com/yt_golfstats/" rel="noopener">YT Golf Stats</a>'}, not an official number. Teams from public roster pages. <a href="/internet-invitational/#handicap-list">Full Internet Invitational handicap list</a></p>`;
    out.push([s, page({
      howto: 'invitational',
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
