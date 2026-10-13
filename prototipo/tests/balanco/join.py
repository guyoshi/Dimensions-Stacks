import json,re,statistics as st
C=json.load(open('/home/claude/ds-repo/dados/oficial/cartas_87.json'))['cartas']
H={x['id']:x for x in json.load(open('/home/claude/ds-repo/dados/oficial/habilidades_129.json'))['habilidades']}
sim=json.load(open('/tmp/bal/cardsim.json'))
def sp(f):
    d={}
    for l in open(f):
        m=re.match(r'(AE-\d+)\s+(\d+)%\s+usos/disputa\s+([\d.]+)\s+(.*)',l)
        if m: d[m[1]]=(int(m[2]),float(m[3]),m[4])
    return d
s2,s4=sp('/tmp/bal/sp2.txt'),sp('/tmp/bal/sp4.txt')
def wr(c,n):
    v=sim[n][c]; return 100*v['w']/v['p']
rows=[]
for c in C:
    i=c['id']; a=c['atributos']
    w2,w3,w4=wr(i,'2'),wr(i,'3'),wr(i,'4')
    rows.append(dict(id=i,nome=c['nome'],soma=sum(a.values()),perfil=c['perfil_balanceamento'],uni=c['uniao']!='NAO',a=a,ae=c['habilidade_especial_id'],w2=w2,w3=w3,w4=w4,
       sp2=s2.get(c['habilidade_especial_id'],(None,))[0],sp4=s4.get(c['habilidade_especial_id'],(None,))[0],uso2=s2.get(c['habilidade_especial_id'],(0,0))[1],uso4=s4.get(c['habilidade_especial_id'],(0,0))[1],
       sname=H[c['habilidade_especial_id']]['nome'],stext=H[c['habilidade_especial_id']]['texto_efeito'],risco=H[c['habilidade_especial_id']]['avaliacao_de_risco']))
# força da carta: média de win% em 2p/3p/4p
for r in rows: r['forca']=(r['w2']+r['w3']+r['w4'])/3
def pct(vals,v): return 100*sum(1 for x in vals if x<=v)/len(vals)
F=[r['forca'] for r in rows]
# força do especial: média dos dois testes normalizada (2p: 50 justo; 4p: 25 justo)
for r in rows: r['spf']=((r['sp2']-50)/50+(r['sp4']-25)/75)/2*100 if r['sp2'] is not None else None
SPF=[r['spf'] for r in rows]
for r in rows:
    r['pc']=pct(F,r['forca']); r['ps']=pct(SPF,r['spf']); r['gap']=r['ps']-r['pc']
json.dump(rows,open('/tmp/bal/joined.json','w'),ensure_ascii=False)
rows.sort(key=lambda r:-r['forca'])
print('id   nome                    soma perf  w2  w3  w4 FORÇA pc | spec sp2 sp4 ps gap')
for r in rows:
    print(r['id'],r['nome'][:20].ljust(20),r['soma'],r['perfil'][:4],'%2d %2d %2d  %4.1f %3d | %s %s %s %3d %+d'%(r['w2'],r['w3'],r['w4'],r['forca'],r['pc'],r['ae'],r['sp2'],r['sp4'],r['ps'],r['gap']), ('UNI' if r['uni'] else ''))
