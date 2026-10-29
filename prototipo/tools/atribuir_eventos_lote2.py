#!/usr/bin/env python3
"""Lote 2 de eventos do modo história: coloca as 7 regras novas (Relógio de Gerbe, Espelho, Memória curta, Dupla soma, Maioria vence, Baralho emprestado, Aposta)
trocando eventos das regras mais repetidas, sem mexer nas demais atribuições. Idempotente. Atualiza historia_bat.js, historia_eventos.js e dados/historia_eventos.json."""
import json, os, re, random, collections
aqui = os.path.dirname(os.path.abspath(__file__)); proj = os.path.dirname(aqui); raiz = os.path.dirname(proj)
NOVAS = {  # id: (nome, regra, regiões, usos)
 'relogio': ('Relógio de Gerbe', 'A batalha dura 4 minutos; ao fim, vence quem tem mais cartas', (1, 2, 3), 2),
 'espelho': ('Espelho', 'O inimigo joga com cópias das suas cartas, e as dele aparecem abertas', (2, 3), 2),
 'memoria': ('Memória curta', 'Você vê as cartas do inimigo só antes de começar; depois todos os números ficam ocultos', (2, 3), 2),
 'dupla': ('Dupla soma', 'Cada atributo vale a média do par: Força com Defesa, Inteligência com Velocidade', (2, 3), 2),
 'maioria': ('Maioria vence', 'Vence quem ganhar em mais dos quatro atributos (sem escolher atributo)', (3, 4), 2),
 'emprestado': ('Baralho emprestado', 'Você joga com 7 cartas emprestadas do tema, não as suas', (1, 2, 3), 2),
 'aposta': ('Aposta', 'Antes de cada rodada você pode apostar 1 pêndulo: ganha 2 se vencer, perde 1 se perder', (1, 2, 3), 2),
}
mp = os.path.join(proj, 'historia_mapa.js'); mapa = json.loads(re.search(r'DS_MAPA = (\{.*\}); \}\)\(', open(mp, encoding='utf-8').read(), re.S).group(1)); byid = {n['id']: n for n in mapa['nos']}
bp = os.path.join(proj, 'historia_bat.js'); bt = open(bp, encoding='utf-8').read(); i = bt.index('{', bt.index('DS_HIST_BAT')); j = bt.rindex('}') + 1; bat = json.loads(bt[i:j])
ep = os.path.join(proj, 'historia_eventos.js'); et = open(ep, encoding='utf-8').read(); k = et.index('{', et.index('DS_EVENTOS_H')); l = et.rindex('}') + 1; cat = json.loads(et[k:l])
rnd = random.Random(3011)
uso = collections.Counter(b['e']['id'] for b in bat.values() if 'e' in b)
for e, (nome, regra, regs, n) in NOVAS.items():
    cat[e] = {'nome': nome, 'regra': regra}
    ja = sum(1 for b in bat.values() if b.get('e', {}).get('id') == e)
    for _ in range(n - ja):
        cand = [x for x, b in bat.items() if 'e' in b and byid[x]['tier'] in regs and b['t'] == 'evento' and b['e']['id'] not in NOVAS and uso[b['e']['id']] >= 2 and not any(bat.get(v, {}).get('e', {}).get('id') == e for v in byid[x]['viz'])]
        if not cand: break
        x = max(cand, key=lambda x: (uso[bat[x]['e']['id']], rnd.random())); uso[bat[x]['e']['id']] -= 1; bat[x]['e'] = {'id': e}; uso[e] += 1
open(bp, 'w', encoding='utf-8').write(bt[:i] + json.dumps(bat, ensure_ascii=False, separators=(',', ':')) + bt[j:])
open(ep, 'w', encoding='utf-8').write(et[:k] + json.dumps(cat, ensure_ascii=False, separators=(',', ':')) + et[l:])
jp = os.path.join(raiz, 'dados', 'historia_eventos.json'); js = json.load(open(jp, encoding='utf-8')); js['eventos'] = {x: b['e'] for x, b in bat.items() if 'e' in b}; js['aviso'] = 'Lotes 1 e 2 aplicados (atribuir_eventos_historia.py + atribuir_eventos_lote2.py): 35 regras no motor.'
json.dump(js, open(jp, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(dict(uso.most_common()))
