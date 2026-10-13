import sys,json,numpy as np; sys.path.insert(0,'/tmp/bal')
import opt
V0=opt.V0.copy(); n=opt.n; S=V0.sum(1)
# rank percentile da soma (empates = média)
order=np.argsort(S,kind='stable'); rk=np.zeros(n)
for v in np.unique(S):
    idx=np.where(S==v)[0]; rk[idx]=np.mean([np.where(order==i)[0][0] for i in idx])
q=rk/(n-1)
target=12+70*q
V=V0.copy()
lam=0.03
def J(V):
    m=opt.meds(V); return ((m-target)**2).sum()+lam*((V-V0)**2).sum(),m
best,m=J(V)
rank0=[np.argsort(-V0[i],kind='stable') for i in range(n)]
def order_ok(i,row):
    # mantém a ordem dos atributos (o melhor continua o melhor, etc.)
    r=np.argsort(-V0[i],kind='stable')
    vals=row[r]
    return all(vals[k]>=vals[k+1] for k in range(3))
for sweep in range(14):
    improved=0
    idxs=np.argsort(-np.abs(m-target))
    for i in idxs:
        bestmove=None
        for a in range(4):
            for b in range(4):
                if a==b: continue
                for k in (1,2,3,4,6):
                    row=V[i].copy(); row[a]-=k; row[b]+=k
                    if row.min()<4 or row.max()>100: continue
                    if np.abs(row-V0[i]).max()>14: continue
                    if not order_ok(i,row): continue
                    W=V.copy(); W[i]=row; j,mm=J(W)
                    if j<best-1e-6 and (bestmove is None or j<bestmove[0]): bestmove=(j,W,mm)
        if bestmove: best,V,m=bestmove; improved+=1
    print('sweep',sweep,'J',round(best,1),'melhorias',improved,flush=True)
    if not improved: break
np.save('/tmp/bal/Vnew.npy',V)
d=V-V0
print('cartas alteradas',int((np.abs(d).sum(1)>0).sum()))
print('erro médio antes',round(np.abs(opt.meds(V0)-target).mean(),1),'depois',round(np.abs(m-target).mean(),1))
