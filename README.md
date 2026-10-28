# Dailygolf – dailygolfgame.com

Static site, hosted on GitHub Pages (`CNAME` = custom domain, `.nojekyll` = serve files as is).
Every push to `main` goes live; there is no build step on deploy.

## Pages

| Path | What it is |
|---|---|
| `index.html` | Both daily games (Pro Golfer + YouTube Golfer, `#youtube`) |
| `trivia/` | Daily golf trivia questions |
| `how-to-play/`, `articles/`, `about/`, `contact/`, `privacy/`, `thanks/` | Content pages (own inline CSS) |
| `contact/` | Contact form, sent through Formspree (form ID in the form's `action`) |
| `handicaps.json` | YouTube creator list; overrides the list embedded in `index.html` when present |

## Styles (`index.html` only)

`index.html` uses Tailwind classes, prebuilt into `assets/tailwind.css`. After adding or changing
Tailwind classes in `index.html`, rebuild it:

```sh
npx tailwindcss@3 -c tailwind.config.js -i assets/tailwind.src.css -o assets/tailwind.css --minify
```

Icons are inline SVG (the small script near the bottom of `index.html` swaps `<i class="fa-solid fa-…">`
for an SVG). To use a new icon, add its SVG paths to that script.

## Daily game logic

- **Day number**: day 1 = 2026-01-01, counted on the player's local calendar date (`dayNumber()`),
  so it changes at local midnight and is unaffected by daylight-saving time. Trivia uses the same rule.
- **Daily answer**: from day 305 (2026-11-01) the answer comes from a seeded shuffle of the list
  (`dailyPick()`): every golfer/creator appears once per cycle, in a new order each cycle. Names are
  sorted before shuffling, so reordering the list changes nothing; adding or removing entries
  reshuffles the current cycle.
- **Saved progress** (localStorage):
  - Pro Golfer: `dailygolf_stats`, `dailygolf_day` (today's answer, guesses, finished or not)
  - YouTube Golfer: `dailygolf_yt_stats`, `dailygolf_yt_done` (same shape)
  - Trivia: `dg_tq_stats_*`, `dg_tq_done_*`

  A saved game keeps its own answer, so deploying a change mid-day never alters a game in progress.
- **Streaks** reset when a day is skipped (`stats.last` = last finished daily game).
