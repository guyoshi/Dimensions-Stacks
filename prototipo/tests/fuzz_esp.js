// Mistura aleatória: cada carta recebe um especial aleatório (os 129). Checa conservação e término.
const E = require('../engine.js');
const ids = Object.keys(E.SPECIALS);
const rnd=a=>a[Math.floor(Math.random()*a.length)];
function total(g){ const s=g.s; let n=s.bh.filter(x=>!String(x.id).includes('*')).length; s.players.forEach(p=>{n+=[...p.deck,...p.reserve,...p.prepared].filter(x=>!String(x).includes('*')).length;}); return n; }
const orig={}; Object.values(E.CARDS).forEach(c=>orig[c.id]=c.especial);
const N=+process.argv[2]||300; let fails=0, acts=0, combats=0; const seen={};
(async()=>{
 for(let k=0;k<N;k++){
  Object.values(E.CARDS).forEach(c=>c.especial=rnd(ids));
  const n=2+k%3, human=k%2===0;
  const players=[...Array(n)].map((_,i)=>({name:'B'+i,bot:!(human&&i===0),avatar:i}));
  let expected=null;
  const io={ notify: async (t,d)=>{ if(t==='effectStart') seen[d.spec.id]=(seen[d.spec.id]||0)+1;
      if(t==='ready') expected=total(g);
      if(t==='combatStart'||t==='combatEnd'||t==='end'){ const tt=total(g); if(expected!=null&&tt!==expected) throw new Error(`conservacao ${t} ${tt}!=${expected}`);
        const all=[]; g.s.players.forEach(p=>all.push(...p.deck,...p.reserve,...p.prepared)); g.s.bh.forEach(x=>all.push(x.id)); if(new Set(all).size!==all.length) throw new Error('duplicada'); } },
    orderHand:async(p,h)=>h, prepare:async()=>Math.random()<.5, attr:async(p,e,o,c,cp)=>(cp&&Math.random()<.4)?'@prep':rnd(o),
    special:async(p,u)=>Math.random()<.8?rnd(u):null, chooseTarget:async(p,c)=>rnd(c),
    pickCards:async(p,s)=>{const m=s.min+Math.floor(Math.random()*(s.max-s.min+1)); return s.cards.slice().sort(()=>Math.random()-.5).slice(0,m);}, pickAttr:async(p,s)=>rnd(s.options) };
  const g=new E.Game({players,perPlayer:7+(k%6),difficulty:rnd(['facil','normal','dificil']),seed:9000+k,specialsFrom:k%3===0?1:2,maxCombats:120,io});
  try{ await g.run(); combats+=g.s.combats; }catch(e){ fails++; console.log('FALHA',k,e.message,(e.stack||'').split('\n').slice(1,3).join('|')); if(fails>8) process.exit(1); }
 }
 Object.entries(orig).forEach(([k,v])=>E.CARDS[k].especial=v);
 const miss=ids.filter(i=>!seen[i]); console.log('jogos',N,'disputas',combats,'falhas',fails,'especiais vistos',Object.keys(seen).length,'/',ids.length,'faltam',miss.join(','));
})();
