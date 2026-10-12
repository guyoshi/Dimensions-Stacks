// Mede uso de especiais pelos bots (IA padrão) por dificuldade.
const E = require('../engine.js');
const N = +process.argv[2] || 30;
(async()=>{
  for (const diff of ['facil','normal','dificil']) {
    let games=0, combats=0, prep=0, used=0, elimPrep=0; const byId={}, prepId={};
    for (let k=0;k<N;k++) for (const n of [2,3,4]) {
      const players=[...Array(n)].map((_,i)=>({name:'B'+i,bot:true,avatar:i}));
      const g=new E.Game({players, perPlayer:10, difficulty:diff, seed:300+k*13+n, io:{notify:async(t,d)=>{
        if(t==='prepare'){prep++; const id=E.CARDS[d.card].especial; prepId[id]=(prepId[id]||0)+1;}
        if(t==='effectStart'){used++; const id=d.spec.id; byId[id]=(byId[id]||0)+1;}
      }}});
      await g.run(); games++; combats+=g.s.combats;
    }
    console.log(diff.padEnd(8),'jogos',games,'disputas',combats,'preparos',prep,'ativações',used,'prep/disputa',(prep/combats).toFixed(3),'ativ/disputa',(used/combats).toFixed(3),'ativ/preparo',(used/Math.max(1,prep)).toFixed(2),'tipos usados',Object.keys(byId).length);
  }
})();
