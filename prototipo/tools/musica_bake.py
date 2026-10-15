import numpy as np, wave, subprocess, json, sys
SR=44100
def run(*a): subprocess.run(a,check=True)
def load(p):
    w=wave.open(p); return np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(np.float32).reshape(-1,2)/32768
def save(p,x):
    x=np.clip(x,-1,1); w=wave.open(p,'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x*32767).astype(np.int16).tobytes()); w.close()
def env(x,hop=SR//200): m=np.abs(x).mean(1); n=len(m)//hop; return m[:n*hop].reshape(n,hop).mean(1)
def delay_vs_base(base,var,r,lo=25,hi=110):
    # atraso (s) da versão esticada em relação ao tempo esperado t/r
    eb=env(base); ev=env(var); best=None
    ts=np.arange(lo,hi-5,0.005)
    ref=np.interp(ts,np.arange(len(eb))/200,eb)
    for d in np.arange(-0.15,0.15,0.002):
        tt=ts/r+d; v=np.interp(tt,np.arange(len(ev))/200,ev)
        c=np.corrcoef(ref,v)[0,1]
        if best is None or c>best[0]: best=(c,d)
    return best
def bake(x,A,B,N,pad=0.6):
    a,b,n=int(A*SR),int(B*SR),int(N*SR); y=x[:b+int(pad*SR)].copy()
    t=np.arange(n)/n; wo=np.cos(np.pi/2*t)[:,None]; wi=np.sin(np.pi/2*t)[:,None]
    y[b-n:b]=x[b-n:b]*wo+x[a-n:a]*wi
    y[b:b+int(pad*SR)]=x[a:a+int(pad*SR)]
    f=int(0.03*SR); y[:f]*=np.linspace(0,1,f)[:,None]
    return y
def enc(y,name):
    save('tmp.wav',y); run('ffmpeg','-loglevel','error','-y','-i','tmp.wav','-c:a','libmp3lame','-b:a','128k','-ar','44100',name)
out={}
# menu
x=load('src.44.wav'); A,B,N=3.0,42.78,2.5
enc(bake(x,A,B,N),'menu.mp3'); out['menu']={'a':A,'b':B}
# partida
base=load('match.44.wav'); A,B,N=22.26,118.26,3.0
enc(bake(base,A,B,N),'partida.mp3'); out['partida']=[{'r':1.0,'a':A,'b':B}]
for r in (1.10,1.20):
    run('ffmpeg','-loglevel','error','-y','-i','match.44.wav','-af',f'rubberband=tempo={r}:pitch=1:pitchq=quality:transients=crisp','-ar','44100',f'm{int(r*100)}.wav')
    v=load(f'm{int(r*100)}.wav'); c,d=delay_vs_base(base,v,r); print('r',r,'len',len(v)/SR,len(base)/SR/r,'corr',round(c,3),'delay',d)
    Ak,Bk=A/r+d,B/r+d
    enc(bake(v,Ak,Bk,N/r),f'partida_{int(r*100)}.mp3'); out['partida'].append({'r':r,'a':round(Ak,4),'b':round(Bk,4)})
json.dump(out,open('loops.json','w'),indent=1); print(out)
