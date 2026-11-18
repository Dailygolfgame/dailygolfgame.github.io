// Scramble Draft: build a 4-player scramble team of golf YouTubers and get a team rating. Same picks for everyone each day.
export function renderScramble({ esc, page }) {
  const css = `<style>
#sd .kick{color:var(--acc);font-weight:800;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase}
#sd h1.sdh{color:#fff;font-size:1.35rem;margin:4px 0 2px}
#sd .sub{color:var(--mut);font-size:.88rem;margin:0 0 12px}
#sd /* team bar */
.team{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:10px 0 6px;position:relative}
#sd .slot{background:var(--card);border:1.5px dashed #334155;border-radius:14px;min-height:78px;padding:8px 6px;text-align:center;position:relative;z-index:1}
#sd .slot.f{border-style:solid;border-color:#334155}
#sd .slot .av{width:30px;height:30px;border-radius:50%;margin:0 auto 4px;display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;font-size:.78rem}
#sd .slot b{display:block;color:#fff;font-size:.72rem;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#sd .slot small{color:var(--mut);font-size:.66rem}
#sd .slot .n{color:#475569;font-weight:800;font-size:1.1rem;line-height:60px}
#sd .links{display:flex;gap:6px;flex-wrap:wrap;min-height:22px;margin-bottom:6px}
#sd .chip{font-size:.7rem;font-weight:800;border-radius:999px;padding:3px 8px;background:#14532d;color:#bbf7d0}
#sd .chip.y{background:#422006;color:#fde68a}
#sd .meter{display:flex;gap:8px;margin:2px 0 12px}
#sd .meter div{flex:1;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:6px 8px}
#sd .meter small{display:block;color:var(--mut);font-size:.66rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em}
#sd .meter b{color:#fff;font-size:1.05rem}
#sd /* offers */
.offers{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
#sd .pc{position:relative;text-align:left;background:var(--card);border:1.5px solid var(--line);border-radius:18px;padding:12px;color:var(--txt);min-width:0}
#sd .pc:active{transform:scale(.98)}
#sd .pc .hc{position:absolute;right:10px;top:10px;text-align:right}
#sd .pc .hc b{display:block;color:#fff;font-size:1.35rem;font-weight:900;line-height:1}
#sd .pc .hc small{color:var(--mut);font-size:.62rem;font-weight:700;letter-spacing:.06em}
#sd .pc .av{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-weight:900;color:#fff;font-size:1rem}
#sd .pc .nm{display:block;color:#fff;font-weight:800;font-size:1rem;margin-top:10px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#sd .pc .ch{display:block;color:var(--mut);font-size:.78rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#sd .pc .row{display:flex;justify-content:space-between;margin-top:8px;font-size:.75rem;color:var(--mut)}
#sd .pc .row b{color:#e2e8f0}
#sd .pc .tag{position:absolute;left:10px;bottom:-9px;font-size:.62rem;font-weight:800;border-radius:999px;padding:2px 7px;background:#16a34a;color:#fff;letter-spacing:.04em}
#sd .pc .tag.y{background:#b45309}
#sd .big{display:block;width:100%;margin:10px 0 0;padding:14px;border:0;border-radius:14px;background:#16a34a;color:#fff;font-weight:800;font-size:1.02rem}
#sd .big.sec{background:#1e293b}
#sd .card{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:16px;margin-top:10px}
#sd .grade{display:flex;align-items:center;gap:16px}
#sd .grade .g{width:92px;height:92px;border-radius:24px;display:flex;align-items:center;justify-content:center;font-size:2.6rem;font-weight:900;color:#04230f;background:var(--acc);flex:0 0 auto}
#sd .grade .g.b{background:#38bdf8}
#sd .grade .g.c{background:#facc15}
#sd .grade .g.d{background:#f87171}
#sd .grade h2{margin:0;color:#fff;font-size:1.3rem}
#sd .grade p{margin:4px 0 0;color:var(--mut);font-size:.88rem}
#sd .bar{margin-top:12px}
#sd .bar .l{display:flex;justify-content:space-between;font-size:.8rem;font-weight:700;color:#e2e8f0}
#sd .bar .t{height:8px;border-radius:9px;background:#1e293b;margin-top:4px;overflow:hidden}
#sd .bar .t i{display:block;height:100%;border-radius:9px}
#sd .roster{margin-top:12px}
#sd .roster div{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--line);font-size:.88rem}
#sd .roster b{color:#fff}
#sd{max-width:560px}
#sd .sdh{color:#fff;font-size:1.3rem;margin:4px 0 2px}
#sd button{font:inherit;cursor:pointer}
</style>`;
  const body = `<h1>Scramble Draft</h1>
<p class="lead">Build a four-player scramble team of golf YouTubers. You get four picks, each from four players. Low handicaps win scrambles, players from the same channel bring chemistry and big channels bring star power. Then see your team rating. The picks are the same for everyone each day.</p>
<div id="sd" class="card"><div id="view"><p>Loading today's draft…</p></div></div>
<h2>How the rating works</h2>
<ul>
<li><b>Golf (60%)</b> comes from your team's scramble handicap: 25% of the best player's handicap, 20% of the second, 15% of the third and 10% of the fourth.</li>
<li><b>Chemistry (25%)</b>: two players from the same channel, like Good Good or Big Wedge Golf, form a strong link. Two players from the same country form a light link.</li>
<li><b>Star power (15%)</b> grows with the total YouTube subscribers of your team.</li>
</ul>
<p>Your daily draft earns 🪙 20 to 40 coins depending on the grade. Spend them on gear and club upgrades in <a href="/tour/">Dailygolf Tour</a>. Handicaps and subscribers come from our <a href="/youtubers/">golf YouTuber handicap list</a>.</p>`;
  const script = `<script src="/assets/coins.js"></script>
<script>
(function(){

var PLAYERS=[];
/* ---------- helpers ---------- */
function rng(seed){ var a=seed>>>0; return function(){ a=(a+0x6D2B79F5)|0; var t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }
function hash(s){ var h=2166136261; for(var i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; }
function $(id){ return document.getElementById(id); }
function coinsFor(o){ return o>=90?40:o>=82?30:o>=72?25:20; }
function esc(s){ return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
function fmtHcp(h){ return h<0?'+'+(-h).toFixed(1):h.toFixed(1); }
function fmtSubs(k){ return k>=1000?(k/1000).toFixed(k>=10000?0:1)+'M':Math.round(k)+'K'; }
function initials(n){ return n.replace(/\\(.*?\\)/g,'').trim().split(/\\s+/).map(function(w){return w[0];}).slice(0,2).join('').toUpperCase(); }
var COLS=['#dc2626','#2563eb','#16a34a','#d97706','#7c3aed','#0d9488','#db2777','#4f46e5'];
function colOf(p){ return COLS[hash(p.channel)%COLS.length]; }
var CH_SIZE={};
var EPOCH=Date.UTC(2026,10,1);
function dayNo(){ var d=new Date(); return Math.floor((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())-EPOCH)/864e5)+1; }
function load(k){ try{ return JSON.parse(localStorage.getItem(k)); }catch(e){ return null; } }
function store(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }

/* ---------- scoring ---------- */
function links(team){ // pairs that share a channel (strong) or a country (light)
  var L=[]; for(var i=0;i<team.length;i++) for(var j=i+1;j<team.length;j++){
    var a=team[i], b=team[j];
    if(a.channel===b.channel && CH_SIZE[a.channel]>1) L.push({a:a,b:b,k:'ch',v:34,label:a.channel});
    else if(a.countries.some(function(c){ return b.countries.indexOf(c)>=0; })) L.push({a:a,b:b,k:'co',v:10,label:a.countries.filter(function(c){ return b.countries.indexOf(c)>=0; })[0]});
  } return L;
}
function teamHcp(team){ var h=team.map(function(p){return p.hcp;}).sort(function(a,b){return a-b;}), w=[.25,.2,.15,.1], t=0; h.forEach(function(x,i){ t+=x*w[i]; }); return t; }
function rate(team){
  var t=teamHcp(team), L=links(team);
  var golf=Math.max(0,Math.min(99,Math.round(99-(t+4.8)*2.4)));
  var chem=Math.min(100,L.reduce(function(a,l){return a+l.v;},0));
  var subs=team.reduce(function(a,p){return a+(p.subs||0);},0);
  var star=Math.max(0,Math.min(99,Math.round((Math.log10(Math.max(subs,1))-1.8)/(4.0-1.8)*99)));
  var ovr=Math.round(.6*golf+.25*chem+.15*star);
  var proj=Math.round(64+t*0.8-chem/50);
  return {t:t, L:L, golf:golf, chem:chem, star:star, ovr:ovr, subs:subs, proj:proj};
}
function grade(o){ return o>=94?'A+':o>=90?'A':o>=86?'A−':o>=82?'B+':o>=77?'B':o>=72?'B−':o>=67?'C+':o>=62?'C':o>=56?'C−':'D'; }
function gcls(g){ return g[0]==='A'?'':g[0]==='B'?'b':g[0]==='C'?'c':'d'; }
function fmtPar(n){ return n===0?'E':(n>0?'+'+n:'−'+(-n)); }

/* ---------- offers ---------- */
function offers(seedKey, picks){
  var R=rng(hash(seedKey+'#'+picks.length+'#'+picks.join('|'))), taken=picks.slice(), pool=PLAYERS.filter(function(p){ return taken.indexOf(p.name)<0; });
  var byH=pool.slice().sort(function(a,b){return a.hcp-b.hcp;}), out=[];
  function pick(list){ list=list.filter(function(p){ return out.indexOf(p)<0; }); if(!list.length) return; out.push(list[Math.floor(R()*list.length)]); }
  pick(byH.slice(0,16));                       // one strong player
  var team=PLAYERS.filter(function(p){ return picks.indexOf(p.name)>=0; });
  var chemList=pool.filter(function(p){ return team.some(function(t){ return t.channel===p.channel && CH_SIZE[p.channel]>1; }); });
  if(chemList.length) pick(chemList); else pick(byH.slice(16,40)); // a chemistry option when there is one
  pick(pool.filter(function(p){ return (p.subs||0)>=900; })); // a big name
  while(out.length<4) pick(pool);
  for(var i=out.length-1;i>0;i--){ var j=Math.floor(R()*(i+1)), t=out[i]; out[i]=out[j]; out[j]=t; }
  return out;
}

/* ---------- state ---------- */
var S={daily:true, seed:'', picks:[]};
function startDaily(){ var no=dayNo(), d=load('dg_scr_day'); S={daily:true, no:no, seed:'scr'+no, picks:(d&&d.no===no)?d.picks:[]}; render(); }
function startPractice(){ S={daily:false, seed:'prac'+Date.now(), picks:[]}; render(); }
function teamOf(){ return S.picks.map(function(n){ return PLAYERS.find(function(p){return p.name===n;}); }); }

function render(){
  
  var team=teamOf();
  if(team.length>=4) return renderResult(team);
  var r=team.length?rate(team):null, L=team.length?links(team):[];
  var h='<div class="kick">Pick '+(team.length+1)+' of 4</div><h1>'+(S.daily?'Today\\'s draft':'Practice draft')+'</h1>';
  h+='<div class="team">'; for(var i=0;i<4;i++){ var p=team[i];
    h+=p?'<div class="slot f"><div class="av" style="background:'+colOf(p)+'">'+initials(p.name)+'</div><b>'+esc(p.name)+'</b><small>'+fmtHcp(p.hcp)+'</small></div>':'<div class="slot"><div class="n">'+(i+1)+'</div></div>'; }
  h+='</div><div class="links">'+L.map(function(l){ return '<span class="chip'+(l.k==='co'?' y':'')+'">'+(l.k==='ch'?'🔗 ':'🌍 ')+esc(l.label)+'</span>'; }).join('')+'</div>';
  if(r) h+='<div class="meter"><div><small>Team hcp</small><b>'+fmtHcp(r.t)+'</b></div><div><small>Chemistry</small><b>'+r.chem+'</b></div><div><small>Rating</small><b>'+r.ovr+'</b></div></div>';
  var off=offers(S.seed, S.picks);
  h+='<div class="offers">'+off.map(function(p){
    var ch=team.some(function(t){ return t.channel===p.channel && CH_SIZE[p.channel]>1; }), co=!ch&&team.some(function(t){ return t.countries.some(function(c){return p.countries.indexOf(c)>=0;}); });
    return '<button class="pc" data-n="'+esc(p.name)+'"><span class="hc"><b>'+fmtHcp(p.hcp)+'</b><small>HCP</small></span><span class="av" style="background:'+colOf(p)+'">'+initials(p.name)+'</span><span class="nm">'+esc(p.name)+'</span><span class="ch">'+esc(p.channel)+'</span><span class="row"><span>'+p.countries.join(' / ')+'</span><b>'+fmtSubs(p.subs||0)+' subs</b></span>'+(ch?'<span class="tag">+ CHEMISTRY</span>':co?'<span class="tag y">+ COUNTRY</span>':'')+'</button>';
  }).join('')+'</div>';
  $('view').innerHTML=h;
  document.querySelectorAll('.pc').forEach(function(b){ b.onclick=function(){ S.picks.push(b.dataset.n); if(S.daily) store('dg_scr_day',{no:S.no,picks:S.picks}); render(); document.getElementById('sd').scrollIntoView({block:'start'}); }; });
}
function bar(label,v,col){ return '<div class="bar"><div class="l"><span>'+label+'</span><span>'+v+'</span></div><div class="t"><i style="width:'+v+'%;background:'+col+'"></i></div></div>'; }
function renderResult(team){
  var r=rate(team), g=grade(r.ovr);
  var h='<div class="kick">'+(S.daily?'Scramble Draft #'+S.no:'Practice draft')+'</div>'+
    '<div class="card"><div class="grade"><div class="g '+gcls(g)+'">'+g+'</div><div><h2>Team rating '+r.ovr+'</h2><p>Team handicap '+fmtHcp(r.t)+' · projected scramble '+r.proj+' ('+fmtPar(r.proj-72)+')</p></div></div>'+
    bar('Golf',r.golf,'#4ade80')+bar('Chemistry',r.chem,'#38bdf8')+bar('Star power',r.star,'#facc15')+
    '<div class="roster">'+team.map(function(p){ return '<div><span><b>'+esc(p.name)+'</b> · '+esc(p.channel)+'</span><span>'+fmtHcp(p.hcp)+'</span></div>'; }).join('')+'</div>'+
    (r.L.length?'<div class="links" style="margin-top:10px">'+r.L.map(function(l){ return '<span class="chip'+(l.k==='co'?' y':'')+'">'+(l.k==='ch'?'🔗 ':'🌍 ')+esc(l.a.name.split(' ')[0])+' + '+esc(l.b.name.split(' ')[0])+'</span>'; }).join('')+'</div>':'<p class="sub" style="margin-top:10px">No chemistry links. Players from the same channel give the biggest boost.</p>')+
    '</div>';
  if(S.daily){ var got=window.DGCoins?DGCoins.award('scramble:'+S.no, coinsFor(r.ovr)):0; if(got) h=h.replace('</h2><p>','</h2><p>+🪙 '+got+' coins · '); h+='<button class="big" id="share">Share my team</button>'; }
  h+='<button class="big sec" id="prac">'+(S.daily?'Practice draft':'Draft again')+'</button>';
  if(!S.daily) h+='<button class="big sec" id="back">Back to today\\'s draft</button>';
  $('view').innerHTML=h;
  if($('share')) $('share').onclick=function(){
    var sq=function(v){ return v>=80?'🟩':v>=60?'🟨':v>=40?'🟧':'🟥'; };
    var txt='Scramble Draft #'+S.no+' ⛳ '+g+' ('+r.ovr+')\\nGolf '+sq(r.golf)+' Chemistry '+sq(r.chem)+' Stars '+sq(r.star)+'\\nProjected '+r.proj+' ('+fmtPar(r.proj-72)+')\\ndailygolfgame.com';
    if(navigator.share) navigator.share({text:txt}).catch(function(){}); else if(navigator.clipboard) navigator.clipboard.writeText(txt).then(function(){ $('share').textContent='Copied!'; });
  };
  $('prac').onclick=startPractice; if($('back')) $('back').onclick=startDaily;
  window.__R=r;
}
fetch('/handicaps.json',{cache:'no-cache'}).then(function(r){return r.json();}).then(function(d){ PLAYERS=(d.players||[]).filter(function(p){ return typeof p.hcp==='number'; }).map(function(p){ return {name:p.name, countries:p.countries||[], hcp:p.hcp, subs:p.subs||0, channel:p.channel||p.name}; }); PLAYERS.forEach(function(p){ CH_SIZE[p.channel]=(CH_SIZE[p.channel]||0)+1; }); startDaily(); }).catch(function(){ $('view').innerHTML='<p>Could not load the players. Please reload the page.</p>'; });

})();
</script>`;
  return page({ image: 'og-draft.png', howto: 'draft', urlPath: '/draft/',
    title: 'Scramble Draft: Build a Golf YouTuber Scramble Team | Dailygolf',
    description: 'Draft four golf YouTubers into a scramble team every day. Handicaps, channel chemistry and star power decide your team rating. Free daily golf game.',
    crumbs: [['Home', '/'], ['Scramble Draft']],
    body: css + '\n' + body + '\n' + script,
    jsonld: { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Scramble Draft', applicationCategory: 'GameApplication', operatingSystem: 'Any', url: 'https://dailygolfgame.com/draft/', isAccessibleForFree: true } });
}
