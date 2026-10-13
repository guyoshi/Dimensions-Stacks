import json,statistics as st
C=json.load(open('/home/claude/ds-repo/dados/oficial/cartas_87.json'))['cartas']
K=['FOR','RES','INT','VEL']; PAIR={'FOR':('FOR','RES'),'RES':('FOR','RES'),'INT':('INT','VEL'),'VEL':('INT','VEL')}
V=[{k:c['atributos'][k] for k in K} for c in C]
n=len(C)
def tb(a,b):  # 1 se a vence b
    sa,sb=sum(a.values()),sum(b.values())
    if sa!=sb: return sa>sb
    return None
def beats(va,sa_card,vb,sb_card):
    if va!=vb: return 1 if va>vb else 0
    ta=sum(sa_card.values());tb_=sum(sb_card.values())
    if ta!=tb_: return 1 if ta>tb_ else 0
    ta=sa_card['FOR']+sa_card['INT'];tb_=sb_card['FOR']+sb_card['INT']
    if ta!=tb_: return 1 if ta>tb_ else 0
    return .5
def duel(i,j):
    A,B=V[i],V[j]
    # iniciador A escolhe atributo maximizando P(vitória) vs pair-max de oponente aleatório (média sobre todas)
    best=None
    for x in K:
        p=sum(beats(A[x],A,max(V[o][y] for y in PAIR[x]),V[o]) for o in range(n) if o!=i)/(n-1)
        if best is None or p>best[0]: best=(p,x)
    x=best[1]
    vb=max(B[y] for y in PAIR[x])
    return beats(A[x],A,vb,B),x
init=[0]*n;fol=[0]*n;ax=[None]*n
for i in range(n):
    s=0
    for j in range(n):
        if i==j: continue
        r,x=duel(i,j); s+=r; ax[i]=x
        fol[j]+= (1-r)
    init[i]=s/(n-1)
fol=[f/(n-1) for f in fol]
out=[]
for i,c in enumerate(C):
    out.append(dict(id=c['id'],nome=c['nome'],soma=sum(V[i].values()),perfil=c['perfil_balanceamento'],uniao=c['uniao'],ini=round(init[i]*100),fol=round(fol[i]*100),med=round((init[i]+fol[i])*50,1),x=ax[i],mx=max(V[i].values()),ae=c['habilidade_especial_id']))
json.dump(out,open('/tmp/bal/cardpower.json','w'),ensure_ascii=False)
out.sort(key=lambda r:-r['med'])
for r in out: print(r['id'],r['nome'][:22].ljust(22),r['soma'],r['perfil'][:5],'ini',r['ini'],'fol',r['fol'],'MED',r['med'],r['x'],r['mx'])
print()
import collections
byp=collections.defaultdict(list)
for r in out: byp[r['perfil']].append(r['med'])
for p,v in byp.items(): print(p,len(v),'média',round(st.mean(v),1),'min',min(v),'max',max(v))
print('corr soma×med', round(st.correlation([r['soma'] for r in out],[r['med'] for r in out]),3))
