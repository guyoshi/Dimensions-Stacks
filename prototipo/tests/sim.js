const E = require('../engine.js');
const D = globalThis.DS_DATA;
function total(g){ const s=g.s; let n=s.bh.length; s.players.forEach(p=>{n+=p.deck.length+p.reserve.length+p.prepared.length;}); return n; }
async function one(n, per, diff, seed){
  const players=[...Array(n)].map((_,i)=>({name:'B'+i,bot:true,avatar:i}));
  let expected=null, err=null, events={};
  const g=new E.Game({players, perPlayer:per, difficulty:diff, seed,
    io:{ notify: async (t,d)=>{ events[t]=(events[t]||0)+1;
      if(t==='ready'){ expected=total(g); }
      if(t==='combatStart'||t==='combatEnd'||t==='end'){ const tt=total(g); if(expected!=null && tt!==expected){ err=`conservacao ${t}: ${tt} != ${expected}`; throw new Error(err);} 
        const all=[]; g.s.players.forEach(p=>all.push(...p.deck,...p.reserve,...p.prepared)); g.s.bh.forEach(x=>all.push(x.id)); if(new Set(all).size!==all.length){err='duplicada '+t; throw new Error(err);} }
    }}});
  const w=await g.run();
  return {w, combats:g.s.combats, rounds:g.s.round, byLimit:!!g.s.byLimit, err, events, bh:g.s.bh.length};
}
(async()=>{
  const t0=Date.now(); const res=[]; let fails=0;
  for(const n of [2,3,4]) for(const per of [7,8,12,18,24]) { if(per*n>D.CARTAS.length) continue; for(const diff of ['facil','normal','dificil']) for(let k=0;k<12;k++){
    try{ const r=await one(n,per,diff,1000+k*7+n*100+per); res.push({n,per,diff,...r}); }catch(e){ fails++; console.log('FALHA',n,per,diff,k,e.message); if(fails>5) process.exit(1);} } }
  const by={}; res.forEach(r=>{const key=`${r.n}p/${r.per}`; (by[key]=by[key]||[]).push(r);});
  for(const k in by){ const a=by[k]; const lim=a.filter(x=>x.byLimit).length; const c=a.map(x=>x.combats); console.log(k.padEnd(7), 'jogos',a.length,'limite',lim,'disputas med',Math.round(c.reduce((x,y)=>x+y,0)/c.length),'max',Math.max(...c)); }
  const ev={}; res.forEach(r=>{for(const t in r.events) ev[t]=(ev[t]||0)+r.events[t];}); console.log(ev);
  console.log('total',res.length,'falhas',fails,'ms',Date.now()-t0);
})();
