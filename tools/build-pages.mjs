#!/usr/bin/env node
// Builds the generated pages of dailygolfgame.com from the game data:
//   /golfers/ + /golfers/<slug>/       one page per pro golfer in the game
//   /youtubers/ + /youtubers/<slug>/   one page per YouTube creator
//   /answers/ + /answers/<day>/        daily answers, published once a day is over everywhere
//   /sitemap.xml
// Run from the repo root:  node tools/build-pages.mjs
// No dependencies. A GitHub Action runs it daily (see .github/workflows/daily-pages.yml).

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { renderInvitational } from './invitational.mjs';

const ROOT = process.cwd();
const SITE = 'https://dailygolfgame.com';
const NOW = process.env.BUILD_NOW ? new Date(process.env.BUILD_NOW) : new Date();
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

// ---------- Game data (the same data the game uses) ----------
const indexHtml = read('index.html');
const PLAYERS = new Function('return ' + indexHtml.match(/const PLAYERS = (\[[\s\S]*?\n\s*\]);/)[1])();
const NO_DAILY = new Set(new Function('return ' + indexHtml.match(/const NO_DAILY = new Set\((\[[^\]]*\])\)/)[1])());
const CREATORS = JSON.parse(read('handicaps.json')).players.map(p => ({
  name: p.name, countries: p.countries, hcp: p.hcp, subs: p.subs ?? null, channel: p.channel || p.name, born: p.born ? String(p.born) : null
}));
const POOL = CREATORS.filter(p => p.subs !== null && p.subs >= 100 && !NO_DAILY.has(p.name));

// ---------- Daily answer logic: must match index.html exactly ----------
const DAY_MS = 864e5;
function dayNumber(d) { return Math.round((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(2026, 0, 1)) / DAY_MS) + 1; }
function dayNumberUTC(d) { return Math.round((Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - Date.UTC(2026, 0, 1)) / DAY_MS) + 1; }
function dateOfDay(n) { return new Date(Date.UTC(2026, 0, 1) + (n - 1) * DAY_MS); }
const SHUFFLE_FROM = Number(indexHtml.match(/const SHUFFLE_FROM = (\d+);/)[1]);
function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function seededShuffle(arr, seed) {
  const a = arr.slice(); let t = seed >>> 0;
  const rnd = () => { t = (t + 0x6D2B79F5) >>> 0; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function dailyPick(list, day, salt, legacy) {
  if (day < SHUFFLE_FROM) return legacy();
  const names = list.map(p => p.name).sort();
  const n = names.length, k = day - SHUFFLE_FROM, cycle = Math.floor(k / n);
  const order = c => seededShuffle(names, hashStr(salt + ':' + c));
  const o = order(cycle);
  if (cycle > 0 && n > 1 && o[0] === order(cycle - 1)[n - 1]) [o[0], o[1]] = [o[1], o[0]];
  return list.find(p => p.name === o[k % n]);
}
const proAnswer = day => dailyPick(PLAYERS, day, 'pro', () => PLAYERS[day % PLAYERS.length]).name;
const ytAnswer = day => dailyPick(POOL, day, 'yt', () => POOL[(day * 7) % POOL.length]).name;

// ---------- Helpers ----------
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const slug = s => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/ø/g, 'o').replace(/æ/g, 'ae').replace(/å/g, 'a')
  .toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
function ageOn(born, on) {
  const [y, m, d] = born.split('-').map(Number);
  let a = on.getUTCFullYear() - y;
  if (m && (on.getUTCMonth() + 1 < m || (on.getUTCMonth() + 1 === m && on.getUTCDate() < (d || 1)))) a--;
  return a;
}
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const fmtDate = s => { const [y, m, d] = s.split('-').map(Number); return d ? `${MONTHS[m - 1]} ${d}, ${y}` : String(y); };
const fmtDay = n => { const d = dateOfDay(n); return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`; };
const isoDay = n => dateOfDay(n).toISOString().slice(0, 10);
const fmtHcp = h => h < 0 ? '+' + Math.abs(h).toFixed(1) : h.toFixed(1);
const fmtSubs = k => k === null ? 'unknown' : (k >= 1000 ? (k / 1000).toFixed(1).replace(/\.0$/, '') + 'M' : Math.round(k) + 'K');
const ordinal = n => n + (['th', 'st', 'nd', 'rd'][(n % 100 - 20) % 10] || ['th', 'st', 'nd', 'rd'][n % 100] || 'th');
const list = items => items.length < 2 ? items.join('') : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
const TOUR_TEXT = { 'PGA Tour': 'the PGA Tour', 'LIV Golf': 'LIV Golf', 'PGA / DP World': 'the PGA Tour and DP World Tour', 'DP World Tour': 'the DP World Tour' };
const tourText = t => TOUR_TEXT[t] || t;
const rankOf = (arr, val, key) => 1 + arr.filter(x => key(x) > val).length;

PLAYERS.forEach(p => { p.slug = slug(p.name); p.age = ageOn(p.born, p.died ? new Date(p.died + 'T12:00:00Z') : NOW); });
CREATORS.forEach(c => { c.slug = slug(c.name); c.age = c.born ? ageOn(c.born, NOW) : null; });
for (const group of [PLAYERS, CREATORS]) {
  const seen = new Set(); group.forEach(x => { if (seen.has(x.slug)) throw new Error('Duplicate slug ' + x.slug); seen.add(x.slug); });
}
const byName = Object.fromEntries(PLAYERS.map(p => [p.name, p]));
const creatorByName = Object.fromEntries(CREATORS.map(c => [c.name, c]));

// ---------- Page template (head, header and footer copied from /about/) ----------
const tpl = read('about/index.html');
const headTail = tpl.slice(tpl.indexOf('<meta name="theme-color"'), tpl.indexOf('</head>'));
const header = tpl.match(/<header class="site">[\s\S]*?<\/header>/)[0];
const footer = tpl.match(/<footer class="site">[\s\S]*?<\/footer>/)[0];
const EXTRA_CSS = `<style>
.facts{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin:18px 0}
.facts div{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px 12px}
.facts span{display:block;font-size:.72rem;letter-spacing:.06em;text-transform:uppercase;color:var(--mut);font-weight:700}
.facts b{display:block;color:#fff;font-size:1.15rem;line-height:1.35}
.crumbs{font-size:.85rem;color:var(--mut);margin-bottom:10px}.crumbs a{color:var(--mut)}
.tbl{overflow-x:auto}.tbl table{min-width:520px}td a{text-decoration:none}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 18px}.chips a{background:var(--card);border:1px solid var(--line);border-radius:999px;padding:4px 12px;text-decoration:none;font-size:.9rem;color:var(--txt)}.chips a:hover{border-color:var(--acc)}
.answer{font-size:1.5rem;font-weight:800;color:#fff}
</style>`;

function page({ urlPath, title, description, body, jsonld, crumbs }) {
  const url = SITE + urlPath;
  const ld = jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>\n` : '';
  const bc = crumbs ? `<div class="crumbs">${crumbs.map(([t, h]) => h ? `<a href="${h}">${esc(t)}</a>` : esc(t)).join(' › ')}</div>\n` : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow, max-image-preview:large">
${headTail.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(title)}">`)
  .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(description)}">`)
  .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url}">`).trim()}
${EXTRA_CSS}
${ld}</head>
<body>
${header}
<main><div class="wrap">
${bc}${body}
</div></main>
${footer}
</body>
</html>
`;
}
const written = [], changed = new Set();
function write(urlPath, html) {
  const file = path.join(ROOT, urlPath, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const old = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
  if (old !== html) { fs.writeFileSync(file, html); changed.add(urlPath); }
  written.push(urlPath);
}
function cleanDir(dir, keep) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return;
  for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
    if (e.isDirectory() && !keep.has(e.name)) fs.rmSync(path.join(abs, e.name), { recursive: true });
  }
}
const PLAY_CTA = `<p><a class="cta" href="/">Play today's Dailygolf &rarr;</a></p>`;

// ---------- Golfer pages ----------
const golfersSorted = PLAYERS.slice().sort((a, b) => b.majors - a.majors || b.wins - a.wins || a.name.localeCompare(b.name));
for (const p of PLAYERS) {
  const majorsRank = rankOf(PLAYERS, p.majors, x => x.majors), winsRank = rankOf(PLAYERS, p.wins, x => x.wins);
  const sameCountry = PLAYERS.filter(x => x !== p && x.country === p.country);
  const similar = PLAYERS.filter(x => x !== p && !sameCountry.includes(x))
    .map(x => [x, Math.abs(x.majors - p.majors) * 3 + Math.abs(x.wins - p.wins) / 3 + Math.abs(x.age - p.age) / 4])
    .sort((a, b) => a[1] - b[1]).slice(0, 6).map(x => x[0]);
  const agePart = p.died ? `${p.name} was born on ${fmtDate(p.born)} and died on ${fmtDate(p.died)}, aged ${p.age}.` : `${p.name} was born on ${fmtDate(p.born)} and is ${p.age} years old.`;
  const majorsPart = p.majors === 0 ? `He has not won a major championship${p.died ? '' : ' yet'}` : `He has won ${p.majors} major championship${p.majors === 1 ? '' : 's'}, ${majorsRank === 1 ? 'the most' : 'the ' + ordinal(majorsRank) + ' most'} of the ${PLAYERS.length} golfers in Dailygolf`;
  const body = `<h1>${esc(p.name)}</h1>
<p class="lead">${esc(p.name)} is a professional golfer from ${esc(p.country)}${p.died ? '' : ' who plays on ' + esc(tourText(p.tour))}. Here are the facts we use as clues in Dailygolf.</p>
<div class="facts">
<div><span>Country</span><b>${esc(p.country)}</b></div>
<div><span>${p.died ? 'Tour' : 'Tour'}</span><b>${esc(p.tour)}</b></div>
<div><span>${p.died ? 'Age at death' : 'Age'}</span><b>${p.age}</b></div>
<div><span>Major wins</span><b>${p.majors}</b></div>
<div><span>PGA Tour wins</span><b>${p.wins}</b></div>
<div><span>Born</span><b>${fmtDate(p.born)}</b></div>
</div>
<h2>Career in numbers</h2>
<p>${esc(agePart)} ${esc(majorsPart)}. He has ${p.wins} official PGA Tour win${p.wins === 1 ? '' : 's'} (majors included), which ranks ${ordinal(winsRank)} in the game.</p>
${sameCountry.length ? `<h2>Other golfers from ${esc(p.country)}</h2>
<div class="chips">${sameCountry.map(x => `<a href="/golfers/${x.slug}/">${esc(x.name)}</a>`).join('')}</div>` : ''}
<h2>Golfers with similar numbers</h2>
<div class="chips">${similar.map(x => `<a href="/golfers/${x.slug}/">${esc(x.name)}</a>`).join('')}</div>
<h2>Can you guess ${esc(p.name)}?</h2>
<p>In Guess the Pro Golfer you get five tries to find the mystery golfer. Every guess compares country, tour, age, majors and PGA Tour wins with the answer. ${esc(p.name)} is one of the possible answers.</p>
${PLAY_CTA}
<p class="meta">Numbers checked October 2026. Wins are official PGA Tour victories, majors included. <a href="/golfers/">All golfers in the game</a></p>`;
  write(`/golfers/${p.slug}/`, page({
    urlPath: `/golfers/${p.slug}/`,
    title: `${p.name}: Age, Majors, PGA Tour Wins & Country | Dailygolf`,
    description: `${p.name} (${p.country}, ${p.tour}): ${p.died ? 'age at death ' + p.age : 'age ' + p.age}, ${p.majors} major${p.majors === 1 ? '' : 's'} and ${p.wins} PGA Tour win${p.wins === 1 ? '' : 's'}. Quick facts and similar golfers.`,
    crumbs: [['Home', '/'], ['Golfers', '/golfers/'], [p.name]],
    body,
    jsonld: { '@context': 'https://schema.org', '@type': 'Person', name: p.name, birthDate: p.born, ...(p.died ? { deathDate: p.died } : {}), nationality: p.country, jobTitle: 'Professional golfer', url: `${SITE}/golfers/${p.slug}/` }
  }));
}
write('/golfers/', page({
  urlPath: '/golfers/',
  title: `All ${PLAYERS.length} Pro Golfers in Dailygolf: Majors, Wins & Age`,
  description: `Every pro golfer in the Dailygolf guessing game, from Scottie Scheffler and Rory McIlroy to Jack Nicklaus: country, tour, age, majors and PGA Tour wins.`,
  crumbs: [['Home', '/'], ['Golfers']],
  body: `<h1>Pro golfers in Dailygolf</h1>
<p class="lead">All ${PLAYERS.length} golfers who can be the answer in Guess the Pro Golfer, sorted by major wins. Tap a name for the full facts.</p>
<div class="tbl"><table><thead><tr><th>Golfer</th><th>Country</th><th>Tour</th><th>Age</th><th>Majors</th><th>PGA Tour wins</th></tr></thead><tbody>
${golfersSorted.map(p => `<tr><td><a href="/golfers/${p.slug}/">${esc(p.name)}</a></td><td>${esc(p.country)}</td><td>${esc(p.tour)}</td><td>${p.age}${p.died ? '†' : ''}</td><td>${p.majors}</td><td>${p.wins}</td></tr>`).join('\n')}
</tbody></table></div>
<p class="meta">† age at death. Looking for golf YouTubers? See <a href="/youtubers/">all YouTube golfers in the game</a>.</p>
${PLAY_CTA}`
}));
cleanDir('golfers', new Set(PLAYERS.map(p => p.slug)));

// ---------- YouTuber pages ----------
const creatorsSorted = CREATORS.slice().sort((a, b) => a.hcp - b.hcp || a.name.localeCompare(b.name));
for (const c of CREATORS) {
  const hcpRank = 1 + CREATORS.filter(x => x.hcp < c.hcp).length;
  const mates = CREATORS.filter(x => x !== c && x.channel === c.channel);
  const near = creatorsSorted.filter(x => x !== c && !mates.includes(x))
    .map(x => [x, Math.abs(x.hcp - c.hcp)]).sort((a, b) => a[1] - b[1]).slice(0, 6).map(x => x[0]);
  const country = list(c.countries);
  const own = c.channel === c.name || c.channel.toLowerCase().startsWith(c.name.toLowerCase());
  const body = `<h1>${esc(c.name)}</h1>
<p class="lead">${esc(c.name)} is a golf YouTuber from ${esc(country)}${own ? '' : ', seen on the ' + esc(c.channel) + ' channel'}. Here are the facts we use as clues in Guess the YouTube Golfer.</p>
<div class="facts">
<div><span>Handicap</span><b>${fmtHcp(c.hcp)}</b></div>
<div><span>Country</span><b>${esc(c.countries.join(' / '))}</b></div>
<div><span>Channel</span><b>${esc(c.channel)}</b></div>
<div><span>Subscribers</span><b>${fmtSubs(c.subs)}</b></div>
<div><span>Age</span><b>${c.age ?? 'Unknown'}</b></div>
</div>
<h2>How good is ${esc(c.name)}?</h2>
<p>${esc(c.name)} plays off ${c.hcp < 0 ? 'a plus ' + Math.abs(c.hcp).toFixed(1) + ' handicap, better than scratch' : 'a ' + c.hcp.toFixed(1) + ' handicap'}. That is the ${ordinal(hcpRank)} best handicap of the ${CREATORS.length} creators in the game${c.born ? `. ${esc(c.name)} was born on ${fmtDate(c.born)}` : ''}.</p>
${mates.length ? `<h2>Also on ${esc(c.channel)}</h2>
<div class="chips">${mates.map(x => `<a href="/youtubers/${x.slug}/">${esc(x.name)}</a>`).join('')}</div>` : ''}
<h2>Creators with a similar handicap</h2>
<div class="chips">${near.map(x => `<a href="/youtubers/${x.slug}/">${esc(x.name)} (${fmtHcp(x.hcp)})</a>`).join('')}</div>
<h2>Can you guess ${esc(c.name)}?</h2>
<p>In Guess the YouTube Golfer you get five tries to find the mystery creator, with handicap, subscribers, age, country and channel as clues.</p>
<p><a class="cta" href="/#youtube">Play Guess the YouTube Golfer &rarr;</a></p>
<p class="meta">Handicaps from a public YouTube golf handicap leaderboard, subscribers from public channel statistics (October 2026). Numbers change over time. <a href="/youtubers/">All YouTube golfers</a></p>`;
  write(`/youtubers/${c.slug}/`, page({
    urlPath: `/youtubers/${c.slug}/`,
    title: `${c.name} Handicap, Age & Channel | Golf YouTuber | Dailygolf`,
    description: `${c.name}'s golf handicap is ${fmtHcp(c.hcp)}. Country: ${country}. Channel: ${c.channel}${c.subs !== null ? ' (' + fmtSubs(c.subs) + ' subscribers)' : ''}${c.age !== null ? ', age ' + c.age : ''}. See similar golf YouTubers.`,
    crumbs: [['Home', '/'], ['YouTube golfers', '/youtubers/'], [c.name]],
    body,
    jsonld: { '@context': 'https://schema.org', '@type': 'Person', name: c.name, ...(c.born ? { birthDate: c.born } : {}), nationality: c.countries.join(', '), jobTitle: 'Golf YouTuber', url: `${SITE}/youtubers/${c.slug}/` }
  }));
}
write('/youtubers/', page({
  urlPath: '/youtubers/',
  title: `Golf YouTuber Handicaps: All ${CREATORS.length} Creators in Dailygolf`,
  description: `Handicaps, countries, channels and subscribers of ${CREATORS.length} golf YouTubers, from Good Good and Bryan Bros to Rick Shiels, sorted from best handicap down.`,
  crumbs: [['Home', '/'], ['YouTube golfers']],
  body: `<h1>Golf YouTuber handicaps</h1>
<p class="lead">All ${CREATORS.length} golf YouTubers in Guess the YouTube Golfer, from the best handicap down. Plus handicaps (+) are better than scratch.</p>
<div class="tbl"><table><thead><tr><th>Creator</th><th>Handicap</th><th>Country</th><th>Channel</th><th>Subscribers</th></tr></thead><tbody>
${creatorsSorted.map(c => `<tr><td><a href="/youtubers/${c.slug}/">${esc(c.name)}</a></td><td>${fmtHcp(c.hcp)}</td><td>${esc(c.countries.join(' / '))}</td><td>${esc(c.channel)}</td><td>${fmtSubs(c.subs)}</td></tr>`).join('\n')}
</tbody></table></div>
<p class="meta">Handicaps from a public YouTube golf handicap leaderboard and subscribers from public channel statistics (October 2026). See also <a href="/golfers/">all pro golfers in the game</a>.</p>
<p><a class="cta" href="/#youtube">Play Guess the YouTube Golfer &rarr;</a></p>`
}));
cleanDir('youtubers', new Set(CREATORS.map(c => c.slug)));

// ---------- Internet Invitational ----------
const iiFile = 'data/internet-invitational-2026.json';
const hasII = fs.existsSync(path.join(ROOT, iiFile));
if (hasII) write('/internet-invitational/', renderInvitational({ data: JSON.parse(read(iiFile)), esc, slug, fmtHcp, creatorByName, page }));

// ---------- Answer archive ----------
// A day is published once it is over in every time zone (UTC-12), so answers never spoil a game in progress.
// Published answers are frozen in data/answers.json, so later data changes never rewrite history.
const ARCHIVE_FROM = 301; // 2026-10-28, first day of the current game logic
const lastDone = dayNumberUTC(new Date(NOW.getTime() - 12 * 3600e3)) - 1;
const answersFile = path.join(ROOT, 'data/answers.json');
const answers = fs.existsSync(answersFile) ? JSON.parse(fs.readFileSync(answersFile, 'utf8')) : {};
for (let d = ARCHIVE_FROM; d <= lastDone; d++) if (!answers[d]) answers[d] = { pro: proAnswer(d), yt: ytAnswer(d) };
fs.mkdirSync(path.dirname(answersFile), { recursive: true });
fs.writeFileSync(answersFile, JSON.stringify(answers, null, 1) + '\n');
const days = Object.keys(answers).map(Number).filter(d => d <= lastDone).sort((a, b) => b - a);
const proLink = n => byName[n] ? `<a href="/golfers/${byName[n].slug}/">${esc(n)}</a>` : esc(n);
const ytLink = n => creatorByName[n] ? `<a href="/youtubers/${creatorByName[n].slug}/">${esc(n)}</a>` : esc(n);
for (const d of days) {
  const a = answers[d], p = byName[a.pro], c = creatorByName[a.yt];
  const prev = days.find(x => x < d), next = days.slice().reverse().find(x => x > d);
  const body = `<h1>Dailygolf #${d} answers</h1>
<p class="lead">The answers for ${fmtDay(d)}. Haven't played today yet? <a href="/">Today's game</a> has a new golfer.</p>
<div class="card"><p class="meta" style="margin:0">Guess the Pro Golfer #${d}</p><p class="answer">${proLink(a.pro)}</p>
${p ? `<p style="margin:0">${esc(p.country)} · ${esc(p.tour)} · ${p.majors} major${p.majors === 1 ? '' : 's'} · ${p.wins} PGA Tour win${p.wins === 1 ? '' : 's'}</p>` : ''}</div>
<div class="card"><p class="meta" style="margin:0">Guess the YouTube Golfer #${d}</p><p class="answer">${ytLink(a.yt)}</p>
${c ? `<p style="margin:0">Handicap ${fmtHcp(c.hcp)} · ${esc(c.countries.join(' / '))} · ${esc(c.channel)}</p>` : ''}</div>
<p>${prev ? `<a href="/answers/${prev}/">&larr; #${prev}</a>` : ''}${prev && next ? ' &nbsp;·&nbsp; ' : ''}${next ? `<a href="/answers/${next}/">#${next} &rarr;</a>` : ''}${prev || next ? ' &nbsp;·&nbsp; ' : ''}<a href="/answers/">All answers</a></p>
${PLAY_CTA}`;
  write(`/answers/${d}/`, page({
    urlPath: `/answers/${d}/`,
    title: `Dailygolf #${d} Answer (${fmtDay(d)}) | Pro Golfer & YouTube Golfer`,
    description: `Dailygolf #${d} answers for ${fmtDay(d)}: the mystery pro golfer was ${a.pro} and the mystery YouTube golfer was ${a.yt}.`,
    crumbs: [['Home', '/'], ['Answers', '/answers/'], ['#' + d]],
    body
  }));
}
write('/answers/', page({
  urlPath: '/answers/',
  title: 'Dailygolf Answers: Every Past Mystery Golfer | Dailygolf',
  description: 'All past Dailygolf answers: the mystery pro golfer and YouTube golfer of every day. New answers appear once each day is over everywhere.',
  crumbs: [['Home', '/'], ['Answers']],
  body: `<h1>Past Dailygolf answers</h1>
<p class="lead">Every past mystery golfer. A day's answers appear here once that day is over in every time zone, so today's game is never spoiled.</p>
${days.length ? `<div class="tbl"><table><thead><tr><th>Game</th><th>Date</th><th>Pro golfer</th><th>YouTube golfer</th></tr></thead><tbody>
${days.map(d => `<tr><td><a href="/answers/${d}/">#${d}</a></td><td>${fmtDay(d)}</td><td>${proLink(answers[d].pro)}</td><td>${ytLink(answers[d].yt)}</td></tr>`).join('\n')}
</tbody></table></div>` : '<p>The first answers appear tomorrow.</p>'}
${PLAY_CTA}`
}));
cleanDir('answers', new Set(days.map(String)));

// ---------- Sitemap ----------
function gitDate(rel) {
  try { return execFileSync('git', ['log', '-1', '--format=%cs', '--', rel], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() || null; } catch { return null; }
}
const today = NOW.toISOString().slice(0, 10);
const STATIC = ['/', '/trivia/', '/how-to-play/', '/articles/', ...fs.readdirSync(path.join(ROOT, 'articles'), { withFileTypes: true })
  .filter(e => e.isDirectory()).map(e => `/articles/${e.name}/`).sort(), '/about/', '/contact/', '/privacy/'];
// lastmod = when the page last really changed: today if this run changed it, else its last commit.
const lastmod = u => changed.has(u) ? today : (gitDate(u === '/' ? 'index.html' : u.slice(1) + 'index.html') || today);
const urls = [
  ...STATIC, '/golfers/', ...PLAYERS.map(p => `/golfers/${p.slug}/`),
  '/youtubers/', ...CREATORS.map(c => `/youtubers/${c.slug}/`),
  ...(hasII ? ['/internet-invitational/'] : []),
  '/answers/', ...days.map(d => `/answers/${d}/`)
].map(u => [u, lastmod(u)]);
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([u, d]) => `  <url><loc>${SITE}${u}</loc><lastmod>${d > today ? today : d}</lastmod></url>`).join('\n')}
</urlset>
`);

console.log(`Built ${written.length} pages (${PLAYERS.length} golfers, ${CREATORS.length} youtubers, ${days.length} answer days up to #${lastDone}); sitemap has ${urls.length} URLs.`);
