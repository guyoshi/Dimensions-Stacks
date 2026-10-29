#!/usr/bin/env python3
"""Tamanho dos baralhos dos Arautos (autor, 29/10): cartas por inimigo. Completa o baralho de cada inimigo com cartas da mesma série/raridade. Idempotente.
Uso: python3 prototipo/tools/arautos_tamanho.py"""
import json, os, re, random, subprocess
aqui = os.path.dirname(os.path.abspath(__file__)); proj = os.path.dirname(aqui)
TAM = {'B059': 9, 'B057': 10, 'B064': 9, 'B072': 10, 'B062': 11, 'B066': 11, 'B078': 12, 'B080': 12}
SERIE = {'Diário Sobrenatural': 'diario', 'Ciclo de Jesed': 'jesed', 'Viajantes Dimensionais': 'viajantes', 'Spacetheft': 'spacetheft', 'Mistério Oculto': 'misterio', 'Édelin Lys': 'belfex'}
js = """global.window=global;['propostas','curtos','data','especiais','engine'].forEach(f=>require('%s/'+f+'.js'));console.log(JSON.stringify(globalThis.DS_DATA.CARTAS.map(c=>({id:c.id,serie:c.serie,rar:c.raridade,st:[c.stats.pod,c.stats.def,c.stats.int,c.stats.vel],uniao:!!c.uniao}))))""" % proj
cs = json.loads(subprocess.check_output(['node', '-e', js])); C = {c['id']: c for c in cs}
poder = lambda c: sum(c['st']) + 16 * max(c['st'])
path = os.path.join(proj, 'historia_bat.js'); src = open(path, encoding='utf8').read()
m = re.search(r'window\.DS_HIST_BAT = (\{.*\});', src, re.S); B = json.loads(m.group(1)); rnd = random.Random(2822)
for bid, tam in TAM.items():
    b = B[bid]; ser = SERIE[b['tema']]
    for e in b['i']:
        deck = list(e['c'])
        while len(deck) < tam:
            rar = ['rara', 'epica', 'comum', 'rara'][len(deck) % 4]
            cand = [c for c in cs if c['id'] not in deck and not c['uniao'] and c['id'] != 'S11' and c['rar'] == rar and c['serie'] == ser] or [c for c in cs if c['id'] not in deck and not c['uniao'] and c['id'] != 'S11' and c['rar'] == rar]
            deck.append(rnd.choice(cand)['id'])
        e['c'] = sorted(deck, key=lambda i: poder(C[i]))
open(path, 'w', encoding='utf8').write(src[:m.start()] + 'window.DS_HIST_BAT = ' + json.dumps(B, ensure_ascii=False, separators=(',', ':')) + ';' + src[m.end():])
print({k: [len(e['c']) for e in B[k]['i']] for k in TAM})
