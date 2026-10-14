const E=require('../engine.js'); const r=require(process.argv[2]); const C=E.CARDS;
const poder=c=>{const s=Object.values(c.stats);return s.reduce((a,b)=>a+b,0)+16*Math.max(...s)};
const corr=(x,y)=>{const n=x.length,mx=x.reduce((a,b)=>a+b)/n,my=y.reduce((a,b)=>a+b)/n;let sxy=0,sx=0,sy=0;for(let i=0;i<n;i++){sxy+=(x[i]-mx)*(y[i]-my);sx+=(x[i]-mx)**2;sy+=(y[i]-my)**2}return sxy/Math.sqrt(sx*sy)};
for(const k of Object.keys(r)){const {st,agg}=r[k];const ids=Object.keys(st).filter(i=>C[i]&&st[i].p>=40);
 const wr=ids.map(i=>st[i].w/st[i].p*100);const pw=ids.map(i=>poder(C[i]));
 const ser={};ids.forEach(i=>{(ser[C[i].serie]=ser[C[i].serie]||[]).push(st[i].w/st[i].p*100)});
 const sm=Object.values(ser).map(a=>a.reduce((x,y)=>x+y)/a.length);
 const rar={};ids.forEach(i=>{(rar[C[i].raridade]=rar[C[i].raridade]||[]).push(st[i].w/st[i].p*100)});
 const rm=Object.fromEntries(Object.entries(rar).map(([a,b])=>[a,(b.reduce((x,y)=>x+y)/b.length).toFixed(1)]));
 const mean=wr.reduce((a,b)=>a+b)/wr.length,sd=Math.sqrt(wr.reduce((a,b)=>a+(b-mean)**2,0)/wr.length);
 const top=ids.slice().sort((a,b)=>st[b].w/st[b].p-st[a].w/st[a].p);
 console.log(k.padEnd(12),'corr',corr(wr,pw).toFixed(2),'| série (min-max)',Math.min(...sm).toFixed(1),'-',Math.max(...sm).toFixed(1),'| média',mean.toFixed(1),'sd',sd.toFixed(1),'| raridade',JSON.stringify(rm),'| len',(agg.combats/agg.games).toFixed(0),'rod',(agg.rounds/agg.games).toFixed(1),'lim',agg.limit,'| A/B',agg.teamA,agg.teamB,'empates',agg.draw);
 console.log('    top5',top.slice(0,5).map(i=>C[i].nome.split(' ')[0]+' '+(st[i].w/st[i].p*100).toFixed(0)).join(', '),'| bottom3',top.slice(-3).map(i=>C[i].nome.split(' ')[0]+' '+(st[i].w/st[i].p*100).toFixed(0)).join(', '));}
