// Testa cada especial isoladamente: todas as cartas ganham a habilidade; bots preparam e viram sempre; 1 "humano" simulado responde aleatoriamente.
const E = require('../engine.js'); const D = globalThis.DS_DATA;
const only = process.argv[2];
function total(g){ const s=g.s; let n=s.bh.length; s.players.forEach(p=>{n+=p.deck.length+p.reserve.length+p.prepared.length;}); return n; }
const rnd=(a)=>a[Math.floor(Math.random()*a.length)];
const orig = {}; Object.values(E.CARDS).forEach(c=>orig[c.id]=c.especial);
E.Game.prototype.bot_prepare = async function(p){ return p.prepared.length<2 && p.deck.length>=3; };
E.Game.prototype.bot_special = async function(p, usable){ return usable.length ? usable[0] : null; };
async function one(id, n, seed, withHuman){
  // reativos só são virados depois que um rival vira algo: metade das cartas leva um especial normal (AE-001) para acionar a janela de reação
  Object.values(E.CARDS).forEach((c,i)=>{ c.especial = (E.SPECIALS[id] && E.SPECIALS[id].react && i%2) ? 'AE-001' : id; });
  const players=[...Array(n)].map((_,i)=>({name:'B'+i,bot: !(withHuman && i===0),avatar:i}));
  let expected=null; const ev={};
  const io = { notify: async (t)=>{ ev[t]=(ev[t]||0)+1;
      if(t==='ready') expected=total(g);
      if(t==='combatStart'||t==='combatEnd'||t==='end'){ const tt=total(g); if(expected!=null && tt!==expected) throw new Error(`conservacao ${t}: ${tt} != ${expected}`);
        const all=[]; g.s.players.forEach(p=>all.push(...p.deck,...p.reserve,...p.prepared)); g.s.bh.forEach(x=>all.push(x.id)); if(new Set(all).size!==all.length) throw new Error('duplicada '+t); } },
    orderHand: async (p,h)=>h, prepare: async()=>Math.random()<.6,
    attr: async (p,e,opts,c,canPrep)=> (canPrep && Math.random()<.4) ? '@prep' : rnd(opts),
    special: async (p,usable,c,ctx,stage)=> Math.random()<.8 ? usable[0] : null,
    chooseTarget: async (p,c)=>rnd(c),
    pickCards: async (p,spec)=>{ const n=spec.min+Math.floor(Math.random()*(spec.max-spec.min+1)); return spec.cards.slice().sort(()=>Math.random()-.5).slice(0,n); },
    pickAttr: async (p,spec)=>rnd(spec.options) };
  const g=new E.Game({players, perPlayer:10, difficulty:'normal', seed, specialsFrom:1, maxCombats:60, io});
  await g.run(); return {combats:g.s.combats, ev};
}
(async()=>{
  const ids=Object.keys(E.SPECIALS).sort(); let fails=0; const used={};
  for(const id of ids){ if(only && id!==only) continue;
    let eff=0, combats=0;
    for(const n of [2,3,4]) for(let k=0;k<4;k++) for(const h of [false,true]){
      try{ const r=await one(id,n,500+k*11+n,h); combats+=r.combats; eff+=(r.ev.effectStart||0); }catch(e){ fails++; console.log('FALHA',id,n,k,h,e.message,(e.stack||'').split('\n')[1]); if(fails>12) process.exit(1); }
    }
    used[id]=eff; if(!eff) console.log('sem ativações:',id);
  }
  Object.entries(orig).forEach(([k,v])=>E.CARDS[k].especial=v);
  console.log('especiais testados',Object.keys(used).length,'falhas',fails);
})();
