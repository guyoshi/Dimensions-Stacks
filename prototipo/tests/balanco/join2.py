import json
rows=json.load(open('/tmp/bal/joined.json'))
rs=json.load(open('/tmp/bal/realsim.json'))
for r in rows:
    for n in ('2','4'):
        v=rs[n].get(r['id'],{'p':1,'w':0,'prep':0,'act':0})
        r['sac'+n]=100*v['prep']/max(1,v['prep']+v['p']); r['rw'+n]=100*v['w']/max(1,v['p']); r['ap'+n]=100*v['act']/max(1,v['prep'])
json.dump(rows,open('/tmp/bal/joined2.json','w'),ensure_ascii=False)
rows.sort(key=lambda r:-r['forca'])
print('id nome forca | sac2 sac4 | rw2 rw4(real c/ especiais) | ativ/prep | spec')
for r in rows:
    print(r['id'],r['nome'][:18].ljust(18),'%4.1f'%r['forca'],'| %3d %3d |%3d %3d | %3d%% %3d%% | %s %s'%(r['sac2'],r['sac4'],r['rw2'],r['rw4'],r['ap2'],r['ap4'],r['ae'],r['sname'][:22]))
