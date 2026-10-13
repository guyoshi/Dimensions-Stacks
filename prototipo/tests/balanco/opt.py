import json,numpy as np,copy
C=json.load(open('/home/claude/ds-repo/dados/oficial/cartas_87.json'))['cartas']
ids=[c['id'] for c in C]; n=len(C)
K=['ATQ','DEF','INT','VEL']
V0=np.array([[c['atributos'][k] for k in K] for c in C],dtype=float)
S=V0.sum(1)
def meds(V):
    PM=np.stack([np.maximum(V[:,0],V[:,1]),np.maximum(V[:,2],V[:,3])],1)  # (n,2)
    pairof=[0,0,1,1]
    sums=V.sum(1)
    def beat(a,b):  # a (k,), b (m,) -> (k,m) prob a wins
        return (a[:,None]>b[None,:])*1.0+(a[:,None]==b[None,:])*0.5
    # iniciador: P(vencer) por atributo contra o par do oponente aleatório
    P=np.zeros((n,4)); 
    for x in range(4):
        B=beat(V[:,x],PM[:,pairof[x]]); np.fill_diagonal(B,0); P[:,x]=B.sum(1)/(n-1)
    xs=P.argmax(1)
    ini=np.zeros(n); fol=np.zeros(n)
    for i in range(n):
        x=xs[i]; w=(V[i,x]>PM[:,pairof[x]])*1.0+(V[i,x]==PM[:,pairof[x]])*0.5; w[i]=0; ini[i]=w.sum()/(n-1)
    # seguidor i contra iniciador o (que usa xs[o])
    for i in range(n):
        tot=0
        for o in range(n):
            if o==i: continue
            x=xs[o]; fv=PM[i,pairof[x]]; a=V[o,x]
            tot+= 1.0 if fv>a else (0.5 if fv==a else 0.0)
        fol[i]=tot/(n-1)
    return 100*(ini+fol)/2
if __name__=='__main__':
    m=meds(V0); print(np.round(m[:10],1))
