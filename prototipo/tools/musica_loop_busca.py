import numpy as np, wave, sys, subprocess
def load(p,sr=11025):
    subprocess.run(['ffmpeg','-loglevel','error','-y','-i',p,'-ac','1','-ar',str(sr),'t.wav'],check=True)
    w=wave.open('t.wav'); return np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(np.float32)/32768
def search(p,A_rng,B_rng,Nw,step=0.02,sr=11025):
    m=load(p,sr); W=int(Nw*sr); As=np.arange(*A_rng,step); Bs=np.arange(*B_rng,step)
    def win(T):
        out=[]
        for t in T:
            e=int(t*sr); v=m[e-W:e].copy(); v-=v.mean(); out.append(v/np.sqrt(v@v+1e-9))
        return np.array(out)
    WA,WB=win(As),win(Bs); C=WA@WB.T
    idx=np.dstack(np.unravel_index(np.argsort(-C.ravel())[:6],C.shape))[0]
    return [(round(float(C[i,j]),3),round(float(As[i]),2),round(float(Bs[j]),2),round(float(Bs[j]-As[i]),2)) for i,j in idx]
if __name__=='__main__':
    print(sys.argv[1], search(sys.argv[1],(float(sys.argv[2]),float(sys.argv[3])),(float(sys.argv[4]),float(sys.argv[5])),float(sys.argv[6])))
