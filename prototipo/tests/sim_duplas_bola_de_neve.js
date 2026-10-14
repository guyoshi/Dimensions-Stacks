const E=require('../engine.js');
(async()=>{ for (const sp of ['on']) for (const lvl of ['dificil']) { let n=0,firstOutWins=0,solo=0,both=0,aliveEnd={1:0,2:0}, hand={}, lone=0,loneWin=0;
 for(let k=0;k<1200;k++){ const pl=[...Array(4)].map((_,i)=>({name:'B'+i,bot:true,avatar:i,noSpecial:sp==='off'})); let first=null, g;
  g=new E.Game({players:pl,perPlayer:10,difficulty:lvl,teams:[[0,2],[1,3]],seed:77000+k*31,io:{notify:async(t,d)=>{ if(t==='eliminated'&&first==null){first=g.teamOf(d.pid);} }}});
  await g.run(); n++; if(first!=null&&g.s.winnerTeam===first)firstOutWins++; aliveEnd[g.alive().length]=(aliveEnd[g.alive().length]||0)+1; }
 console.log(sp,lvl,'1ª baixa vence:',(firstOutWins/n*100).toFixed(1)+'%','| sobreviventes no fim',JSON.stringify(aliveEnd)); } })();
