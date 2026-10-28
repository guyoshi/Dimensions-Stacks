#!/usr/bin/env python3
"""Etapa 2 do modo história: PROPOSTA das 100 batalhas (inimigo, avatar, tema, 7 cartas), com contagem de repetições e batalhas substituíveis.
Determinístico (semente fixa). Lê o mapa (historia_mapa.js) e as cartas (data.js/propostas.js) via Node.
Uso: python3 prototipo/tools/gerar_batalhas_historia.py   → dados/historia_batalhas.json e docs/MODO_HISTORIA_BATALHAS_PROPOSTA_2026-10-28.md"""
import json, os, random, subprocess, collections
aqui = os.path.dirname(os.path.abspath(__file__)); proj = os.path.dirname(aqui); raiz = os.path.dirname(proj)
js = """global.window=global;['propostas','curtos','data','especiais','engine'].forEach(f=>require('%s/'+f+'.js'));require('%s/historia_mapa.js');const D=globalThis.DS_DATA;
console.log(JSON.stringify({cartas:D.CARTAS.map(c=>({id:c.id,nome:c.nome,serie:c.serie,rar:c.raridade,st:[c.stats.pod,c.stats.def,c.stats.int,c.stats.vel],uniao:!!c.uniao})),nos:window.DS_MAPA.nos.map(n=>({id:n.id,tipo:n.tipo,tier:n.tier,lado:n.lado})),boss:window.DS_MAPA.boss,guard:window.DS_MAPA.guardioes}))""" % (proj, proj)
d = json.loads(subprocess.check_output(['node', '-e', js]))
C = {c['id']: c for c in d['cartas']}
poder = lambda c: sum(c['st']) + 16 * max(c['st'])
TEMA = {'esq': ('diario', 'Diário Sobrenatural'), 'cima': ('jesed', 'Ciclo de Jesed'), 'dir': ('viajantes', 'Viajantes Dimensionais'), 'baixo': ('spacetheft', 'Spacetheft')}
OUTRAS = ['misterio', 'belfex']          # séries sem região própria: aparecem como "visitantes" nas regiões média e interna
BESTA = 'S11'                            # exclusiva do Boss
UNIAO = [c['id'] for c in d['cartas'] if c['uniao']]
# receita de raridades por tipo e região (comum, rara, épica, lendária) para cada inimigo de 7 cartas
REC = {('normal', 1): (6, 1, 0, 0), ('evento', 1): (5, 2, 0, 0), ('elite', 1): (3, 3, 1, 0),
       ('normal', 2): (4, 3, 0, 0), ('evento', 2): (3, 3, 1, 0), ('elite', 2): (2, 3, 2, 0), ('miniboss', 2): (2, 3, 2, 0),
       ('normal', 3): (2, 3, 2, 0), ('evento', 3): (2, 2, 2, 1), ('elite', 3): (1, 2, 3, 1), ('miniboss', 3): (1, 2, 3, 1),
       ('evento', 4): (0, 2, 3, 2), ('elite', 4): (0, 1, 3, 3), ('guardiao', 4): (0, 1, 3, 3)}
rnd = random.Random(2820)
uso = collections.Counter()
def pool(lado, tier, rar):
    ser = TEMA[lado][0]
    p = [c for c in d['cartas'] if c['rar'] == rar and c['id'] != BESTA and not c['uniao']]
    tema = [c for c in p if c['serie'] == ser]
    cross = [c for c in p if c['serie'] != ser and (c['serie'] in OUTRAS or tier >= 3)]
    return tema, cross
def escolhe(lado, tier, rec, ja):
    deck = []
    for rar, n in zip(['comum', 'rara', 'epica', 'lendaria'], rec):
        for _ in range(n):
            tema, cross = pool(lado, tier, rar)
            usarcross = (tier >= 2 and rnd.random() < (.25 if tier == 2 else .4)) and cross
            cand = [c for c in (cross if usarcross else tema) if c['id'] not in ja] or [c for c in tema + cross if c['id'] not in ja]
            m = min(uso[c['id']] for c in cand)
            c = rnd.choice([c for c in cand if uso[c['id']] == m])
            deck.append(c['id']); ja.add(c['id']); uso[c['id']] += 1
    return deck
def ordem(deck):   # ordem de jogo do inimigo: fracas primeiro, a mais forte no fim (proposta)
    return sorted(deck, key=lambda i: poder(C[i]))
batalhas = {}
nos = [n for n in d['nos'] if n['tipo'] not in ('loja', 'boss')]
# primeiro os pontos raros (mais difíceis de balancear), depois os comuns
for n in sorted(nos, key=lambda n: (-n['tier'], n['id'])):
    t = n['tipo']; nopp = 3 if t == 'miniboss' and int(n['id'][1:]) % 2 == 0 else 2 if t == 'miniboss' else 2 if t == 'guardiao' else 1
    inims = []
    for k in range(nopp):
        deck = escolhe(n['lado'], n['tier'], REC[(t, n['tier'])], set())
        lider = max(deck, key=lambda i: poder(C[i])) if t in ('miniboss', 'guardiao', 'elite') else min(deck, key=lambda i: -poder(C[i]) if False else poder(C[i])) if False else max(deck, key=lambda i: poder(C[i]))
        inims.append({'nome': C[lider]['nome'], 'avatar': lider, 'cartas': ordem(deck)})
    batalhas[n['id']] = {'id': n['id'], 'tipo': t, 'regiao': n['tier'], 'lado': n['lado'], 'tema': TEMA[n['lado']][1], 'inimigos': inims}
# Boss: A Besta + 6 cartas da União (exclusivo)
uni6 = sorted(UNIAO, key=lambda i: -poder(C[i]))[:6]
batalhas[d['boss']] = {'id': d['boss'], 'tipo': 'boss', 'regiao': 4, 'lado': 'centro', 'tema': 'A União', 'inimigos': [{'nome': 'A Besta', 'avatar': BESTA, 'cartas': ordem([BESTA] + uni6)}]}
for i in [BESTA] + uni6: uso[i] += 1
# reparo: toda carta que não é da União (nem a Besta) aparece em pelo menos MIN batalhas; troca por uma carta da mesma raridade que apareça demais
MIN = 3
def conta():
    t = collections.Counter()
    for b in batalhas.values():
        for e in b['inimigos']:
            for c in e['cartas']: t[c] += 1
    return t
regulares = [c for c in d['cartas'] if not c['uniao'] and c['id'] != BESTA]
semdoador = set()
for _ in range(2000):
    t = conta(); falta = sorted([c for c in regulares if t[c['id']] < MIN], key=lambda c: t[c['id']])
    falta = [x for x in falta if t[x['id']] < 99] if False else falta
    if not falta: break
    c = next((x for x in falta if x['id'] not in semdoador), None)
    if c is None: break
    doadores = sorted([x for x in regulares if x['rar'] == c['rar'] and t[x['id']] > MIN and x['id'] != c['id']], key=lambda x: -t[x['id']])
    feito = False
    for dn in doadores:
        alvos = [(b, e) for b in batalhas.values() if b['tipo'] != 'boss' for e in b['inimigos'] if dn['id'] in e['cartas'] and c['id'] not in e['cartas']]
        if alvos:
            b, e = rnd.choice(alvos); e['cartas'][e['cartas'].index(dn['id'])] = c['id']; e['cartas'] = ordem(e['cartas'])
            e['avatar'] = max(e['cartas'], key=lambda i: poder(C[i])); e['nome'] = C[e['avatar']]['nome']; feito = True; break
    if not feito: semdoador.add(c['id'])   # sem doador: segue para a próxima carta
# repetições
tot = collections.Counter(); onde = collections.defaultdict(list)
for b in batalhas.values():
    for e in b['inimigos']:
        for c in e['cartas']: tot[c] += 1; onde[c].append(b['id'])
for b in batalhas.values():
    fixo = b['tipo'] in ('miniboss', 'guardiao', 'boss')
    b['poder_medio'] = round(sum(poder(C[c]) for e in b['inimigos'] for c in e['cartas']) / sum(len(e['cartas']) for e in b['inimigos']))
    b['substituivel'] = (not fixo) and all(tot[c] >= 3 for e in b['inimigos'] for c in e['cartas'])
json.dump({'v': 1, 'semente': 2820, 'aviso': 'PROPOSTA (Etapa 2) aguardando aprovação do autor', 'batalhas': list(batalhas.values()), 'repeticoes': {c['id']: tot[c['id']] for c in d['cartas']}}, open(os.path.join(raiz, 'dados', 'historia_batalhas.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
# documento
L = ['# Modo história: proposta das 100 batalhas (Etapa 2, 28/10/2026)', '',
     '**PROPOSTA aguardando aprovação.** Gerada por `prototipo/tools/gerar_batalhas_historia.py` (semente fixa, `dados/historia_batalhas.json`). Os ids dos pontos são os do mapa; nada aqui muda o mapa.', '',
     '## Regras propostas', '',
     '- **Tema por região:** esquerda = Diário Sobrenatural · cima = Ciclo de Jesed · direita = Viajantes Dimensionais · baixo = Spacetheft. Mistério Oculto e Édelin Lys aparecem como visitantes nas regiões média e interna; da região 3 em diante também entram cartas de outras séries.',
     '- **Receita de raridades por inimigo (7 cartas)** cresce da região 1 (quase só comuns) à 4 (épicas e lendárias): ver tabela abaixo. O jogador começa com 6 comuns e 1 épica.',
     '- **Inimigo = um personagem das cartas**, o de maior poder do baralho dele; o avatar é a foto dessa carta. Miniboss: 2 ou 3 oponentes (duelo de 3 ou 4). Guardiões: 2 oponentes (duelo de 3). Boss: **A Besta + 6 cartas da União** (a Besta é exclusiva do Boss).',
     '- **Ordem de jogo do inimigo:** da mais fraca para a mais forte (a mais forte no fim). Proposta, ajustável.',
     '- **Cartas da União (8) e a Besta** só aparecem no Boss (as 6 de maior poder). Sobram **V15 e S01**, sem lugar no Boss: ficam para recompensa de baú/loja (a decidir).',
     '- **Distribuição equilibrada:** cada escolha pega a carta menos usada da raridade pedida, e um passo de reparo garante que **toda carta fora da União apareça em pelo menos 3 batalhas** (sem isso, o jogador nunca veria a carta).',
     '- **Substituível:** batalha comum, evento ou elite em que **todas as cartas do inimigo aparecem em pelo menos 3 batalhas**; dá para trocar o baralho dela sem sumir nenhuma carta do mapa.', '']
L += ['| Tipo | Região | Comum | Rara | Épica | Lendária |', '|---|---|---|---|---|---|']
for (t, r), v in sorted(REC.items(), key=lambda kv: (kv[0][1], kv[0][0])): L.append(f'| {t} | {r} | {v[0]} | {v[1]} | {v[2]} | {v[3]} |')
sub = sum(1 for b in batalhas.values() if b['substituivel'])
rar_tot = collections.Counter(C[c]['rar'] for c in tot)
L += ['', '## Resumo', '', f'- Batalhas: **{len(batalhas)}** ({collections.Counter(b["tipo"] for b in batalhas.values())}); substituíveis: **{sub}**.',
      f'- Cartas que aparecem em inimigos: **{len(tot)} de {len(C)}** (a Besta só no Boss).']
raras = sorted([(tot[c['id']], c['id'], c['nome']) for c in d['cartas']])
L += ['- Cartas com menos aparições (mais exclusivas): ' + ', '.join(f'{n} ({i}, {k}x)' for k, i, n in raras[:12]) + '.',
      '- Cartas com mais aparições: ' + ', '.join(f'{n} ({i}, {k}x)' for k, i, n in raras[-8:]) + '.', '',
      '## Repetições por carta', '', '| Carta | Nome | Série | Raridade | Aparições | Batalhas |', '|---|---|---|---|---|---|']
for c in d['cartas']: L.append(f"| {c['id']} | {c['nome']} | {c['serie']} | {c['rar']} | {tot[c['id']]} | {', '.join(onde[c['id']][:8])}{'…' if len(onde[c['id']]) > 8 else ''} |")
L += ['', '## Batalhas', '', '| Ponto | Tipo | Região | Lado | Inimigo(s) | Cartas (ordem de jogo) | Poder médio | Substituível |', '|---|---|---|---|---|---|---|---|']
for b in sorted(batalhas.values(), key=lambda b: b['id']):
    L.append(f"| {b['id']} | {b['tipo']} | {b['regiao']} | {b['lado']} | {' / '.join(e['nome'] for e in b['inimigos'])} | {' · '.join(' '.join(e['cartas']) for e in b['inimigos'])} | {b['poder_medio']} | {'sim' if b['substituivel'] else 'não'} |")
open(os.path.join(raiz, 'docs', 'MODO_HISTORIA_BATALHAS_PROPOSTA_2026-10-28.md'), 'w', encoding='utf-8').write('\n'.join(L) + '\n')
print(len(batalhas), 'batalhas; substituíveis', sub, '; cartas usadas', len(tot), '; mín/máx aparições', min(tot[c] for c in tot), max(tot.values()))
print('sem aparecer:', [i for i in C if tot[i] == 0])
