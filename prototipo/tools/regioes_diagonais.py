#!/usr/bin/env python3
"""Regiões diagonais do modo história: NW = Mistério Oculto, NE = Édelin Lys. Refaz os inimigos dos pontos nessas cunhas
(normal/evento/elite) e dos 8 Arautos (série = série do membro da União libertado). Mantém tipo, região e evento fixo 'e'.
Determinístico e idempotente. Uso: python3 prototipo/tools/regioes_diagonais.py"""
import json, os, re, math, random, subprocess, collections
aqui = os.path.dirname(os.path.abspath(__file__)); proj = os.path.dirname(aqui)
js = """global.window=global;['propostas','curtos','data','especiais','engine'].forEach(f=>require('%s/'+f+'.js'));require('%s/historia_mapa.js');const D=globalThis.DS_DATA;
console.log(JSON.stringify({cartas:D.CARTAS.map(c=>({id:c.id,nome:c.nome,serie:c.serie,rar:c.raridade,st:[c.stats.pod,c.stats.def,c.stats.int,c.stats.vel],uniao:!!c.uniao})),map:window.DS_MAPA}))""" % (proj, proj)
d = json.loads(subprocess.check_output(['node', '-e', js])); M = d['map']
C = {c['id']: c for c in d['cartas']}
poder = lambda c: sum(c['st']) + 16 * max(c['st'])
SERIE = {'Diário Sobrenatural': 'diario', 'Ciclo de Jesed': 'jesed', 'Viajantes Dimensionais': 'viajantes', 'Spacetheft': 'spacetheft', 'Mistério Oculto': 'misterio', 'Édelin Lys': 'belfex'}
TEMA_LADO = {'esq': 'Diário Sobrenatural', 'cima': 'Ciclo de Jesed', 'dir': 'Viajantes Dimensionais', 'baixo': 'Spacetheft'}
# Arautos: série do membro da União que libertam (S01 Jasmey=Spacetheft, M01 Hyde/M10 Releuz=Mistério, B01=Édelin, J03=Jesed, D06=Diário, V15/V02=Viajantes)
ARAUTO = {'B059': 'Diário Sobrenatural', 'B062': 'Mistério Oculto', 'B066': 'Ciclo de Jesed', 'B080': 'Édelin Lys', 'B072': 'Spacetheft', 'B064': 'Mistério Oculto', 'B057': 'Viajantes Dimensionais', 'B078': 'Viajantes Dimensionais'}
def cunha(n):
    a = math.degrees(math.atan2(n['y'], n['x']))
    if -65 <= a <= -25: return 'Édelin Lys'
    if -155 <= a <= -115: return 'Mistério Oculto'
    return None
REC = {('normal', 1): (6, 1, 0, 0), ('evento', 1): (5, 2, 0, 0), ('elite', 1): (3, 3, 1, 0), ('normal', 2): (4, 3, 0, 0), ('evento', 2): (3, 3, 1, 0), ('elite', 2): (2, 3, 2, 0), ('miniboss', 2): (2, 3, 2, 0),
       ('normal', 3): (2, 3, 2, 0), ('evento', 3): (2, 2, 2, 1), ('elite', 3): (1, 2, 3, 1), ('miniboss', 3): (1, 2, 3, 1), ('normal', 4): (1, 2, 3, 1), ('evento', 4): (0, 2, 3, 2), ('elite', 4): (0, 1, 3, 3)}
path = os.path.join(proj, 'historia_bat.js'); src = open(path, encoding='utf8').read()
m = re.search(r'window\.DS_HIST_BAT = (\{.*\});', src, re.S); B = json.loads(m.group(1))
rnd = random.Random(2821); uso = collections.Counter()
def escolhe(tema, tier, rec):
    ser = SERIE[tema]; deck = []; ja = set()
    for rar, k in zip(['comum', 'rara', 'epica', 'lendaria'], rec):
        for _ in range(k):
            p = [c for c in d['cartas'] if c['rar'] == rar and c['id'] != 'S11' and not c['uniao'] and c['id'] not in ja]
            tm = [c for c in p if c['serie'] == ser]; cross = [c for c in p if c['serie'] != ser]
            cand = tm if (tm and not (tier >= 2 and rnd.random() < .3)) else cross or tm
            if not cand: cand = [c for c in d['cartas'] if c['id'] not in ja and not c['uniao'] and c['id'] != 'S11']
            mn = min(uso[c['id']] for c in cand); c = rnd.choice([c for c in cand if uso[c['id']] == mn])
            deck.append(c['id']); ja.add(c['id']); uso[c['id']] += 1
    return sorted(deck, key=lambda i: poder(C[i]))
mudou = 0
starts = set(M['starts'].values())
for n in M['nos']:
    b = B.get(n['id'])
    if not b: continue
    if n['id'] in ARAUTO: tema = ARAUTO[n['id']]
    elif n['tipo'] in ('normal', 'evento', 'elite') and n['id'] not in starts: tema = cunha(n)
    else: tema = None
    if not tema or (b['tema'] == tema and n['id'] not in ARAUTO and any(x in ('M', 'B') for x in [b['i'][0]['a'][0]])): continue
    if b['tema'] == tema and n['id'] in ARAUTO: continue
    inims = []
    for _ in b['i']:
        deck = escolhe(tema, n['tier'], REC[(b['t'], n['tier'])]); lid = max(deck, key=lambda i: poder(C[i]))
        inims.append({'n': C[lid]['nome'], 'a': lid, 'c': deck})
    b['tema'] = tema; b['i'] = inims; mudou += 1
out = 'window.DS_HIST_BAT = ' + json.dumps(B, ensure_ascii=False, separators=(',', ':')) + ';'
open(path, 'w', encoding='utf8').write(src[:m.start()] + out + src[m.end():])
print('pontos refeitos:', mudou); print(collections.Counter(b['tema'] for b in B.values()))
