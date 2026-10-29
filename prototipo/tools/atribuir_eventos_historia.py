#!/usr/bin/env python3
"""Etapa 3 do modo história: converte 34 batalhas normais em eventos (19 normais + 58 eventos) e atribui a cada evento uma regra fixa.
Determinístico (semente fixa). Ids e ligações do mapa NÃO mudam; só o tipo de 34 pontos. Lê/gera:
  dados/historia_eventos.json (conversões e atribuições) · historia_mapa.js (tipos) · dados/historia_batalhas.json (tipo) · historia_bat.js (batalhas + evento) · historia_eventos.js (catálogo para a interface)
Uso: python3 prototipo/tools/atribuir_eventos_historia.py   (idempotente: parte sempre do mapa gerado e das batalhas aprovadas)"""
import json, os, random, re, subprocess, collections
aqui = os.path.dirname(os.path.abspath(__file__)); proj = os.path.dirname(aqui); raiz = os.path.dirname(proj)
mapa_js = os.path.join(proj, 'historia_mapa.js')
txt = open(mapa_js, encoding='utf-8').read()
m = re.search(r'DS_MAPA = (\{.*\}); \}\)\(', txt, re.S); mapa = json.loads(m.group(1)); byid = {n['id']: n for n in mapa['nos']}
bat = json.load(open(os.path.join(raiz, 'dados', 'historia_batalhas.json'), encoding='utf-8'))
orig = json.load(open(os.path.join(raiz, 'dados', 'historia_eventos.json'), encoding='utf-8')) if os.path.exists(os.path.join(raiz, 'dados', 'historia_eventos.json')) else None
# tipos originais (antes das conversões): vêm do arquivo de conversões, se existir
tipo0 = {n['id']: n['tipo'] for n in mapa['nos']}
if orig:
    for i in orig['convertidos']: tipo0[i] = 'normal'
# catálogo implementado: id → (nome, regra, regiões, máx usos)
CAT = {
 'pressa': ('Pressa cósmica', '3 segundos para escolher o atributo; sem escolha, sai um aleatório', (1, 2), 3),
 'contagem': ('Contagem final', 'Começa com 5 s para escolher e cai 0,3 s por rodada, até 1,5 s', (2, 3), 2),
 'limite': ('Limite de rodadas', '15 rodadas; ao fim, vence quem tem mais cartas', (1, 2), 2),
 'estelar': ('Névoa estelar', 'Todos os números ficam ocultos: escolha às cegas', (1, 2, 3), 2),
 'abertas': ('Cartas abertas', 'Você vê as cartas do inimigo antes de organizar as suas', (1, 2), 3),
 'avesso': ('Inversão', 'Vence o menor valor', (1, 2, 3), 3),
 'meio': ('Meio-termo', 'Vence o valor mais próximo de 50', (1, 2, 3), 3),
 'alvo': ('Alvo do dia', 'A cada disputa sorteia-se um alvo (30 a 70); vence o mais próximo', (2, 3), 2),
 'invertidos': ('Status invertidos', 'Ataque e Defesa trocam de valor; Inteligência e Velocidade também', (1, 2, 3), 2),
 'proibido': ('Atributo proibido', '{A} não pode ser escolhido por ninguém', (1, 2, 3), 3),
 'unico': ('Atributo único', 'Só {A} vale na batalha toda', (1, 2), 2),
 'rodizio': ('Rodízio', 'O atributo é imposto na ordem Força, Defesa, Inteligência, Velocidade', (1, 2, 3), 2),
 'magnetico': ('Campo magnético', 'Se os dois escolherem o mesmo atributo, o vencedor captura também a próxima carta do inimigo', (2, 3), 2),
 'desvantagem': ('Desvantagem', 'Você joga com 5 cartas; o inimigo com 9', (2, 3), 2),
 'horda': ('Horda', 'O inimigo tem 10 cartas, todas comuns', (1, 2), 2),
 'curto': ('Duelo curto', 'Cada lado joga só com 3 cartas', (1, 2, 3), 3),
 'aleatoria': ('Ordem aleatória', 'Os baralhos dos dois são embaralhados; ninguém organiza', (1, 2, 3), 3),
 'mare': ('Maré de Gerbe', 'Todos os valores de Defesa ganham +15', (1, 2, 3), 2),
 'sobrecarga': ('Sobrecarga', 'A carta mais forte de cada baralho perde 20 de Velocidade', (2, 3), 2),
 'tregua': ('Trégua', 'Na primeira rodada nada é capturado', (1, 2), 2),
 'morte': ('Morte súbita', 'Vence quem capturar 3 cartas primeiro', (1, 2, 3), 3),
 'reforcos': ('Reforços', 'A cada 3 rodadas o inimigo ganha 1 carta comum no fim do baralho (máx. 4)', (2, 3, 4), 2),
 'silencio': ('Silêncio', 'Ninguém usa habilidades especiais', (1, 2, 3), 3),
 'arsenal': ('Arsenal', 'Os dois começam com 2 especiais já preparados', (2, 3, 4), 2),
 'davi': ('Davi e Golias', 'Você joga com 1 carta lendária contra as 7 do inimigo', (3, 4), 1),
 'troca': ('Troca de campeãs', 'Antes de começar, trocam-se a carta mais forte de cada lado', (2, 3), 2),
 'clarividente': ('Inimigo clarividente', 'O inimigo conhece a ordem das suas cartas e você vê as dele', (3, 4), 1),
 'solar': ('Tempestade solar', 'A cada 3 rodadas, todas as cartas em campo perdem 10 em todos os atributos', (2, 3), 2),
}
rnd = random.Random(2910)
# 1) conversões: 19 normais ficam (13 na região 1, 5 na 2, 1 na 3); o resto vira evento
ficam = {1: 13, 2: 5, 3: 1}; conv = []
for t in (1, 2, 3):
    ns = sorted(n['id'] for n in mapa['nos'] if tipo0[n['id']] == 'normal' and n['tier'] == t); rnd.shuffle(ns)
    # espalha por lado: fica quem alterna os lados
    por = collections.defaultdict(list)
    for i in ns: por[byid[i]['lado']].append(i)
    ficar = []; lados = list(por); k = 0
    while len(ficar) < ficam[t] and any(por.values()):
        l = lados[k % len(lados)]; k += 1
        if por[l]: ficar.append(por[l].pop())
    conv += [i for i in ns if i not in ficar]
for n in mapa['nos']:
    if n['id'] in conv: n['tipo'] = 'evento'
eventos = sorted(n['id'] for n in mapa['nos'] if n['tipo'] == 'evento' and n['id'][0] == 'B')
# 2) atribuição: cada regra ao menos 1 vez (as mais restritas primeiro), depois completa pelos menos usados
reg = lambda i: byid[i]['tier']; livre = collections.defaultdict(list)
for i in eventos: livre[reg(i)].append(i)
for r in livre: rnd.shuffle(livre[r])
uso = collections.Counter(); atr = {}
viz_igual = lambda i, e: any(atr.get(v, {}).get('id') == e for v in byid[i]['viz'])
def poe(e, r):
    cand = [i for i in livre[r] if not viz_igual(i, e)] or livre[r]
    if not cand: return False
    i = cand[0]; livre[r].remove(i); atr[i] = {'id': e}; uso[e] += 1; return True
ordem = sorted(CAT, key=lambda e: (len(CAT[e][2]), -min(CAT[e][2])))
for e in ordem:
    for r in sorted(CAT[e][2], key=lambda r: -len(livre[r])):
        if poe(e, r): break
restantes = sum(len(v) for v in livre.values())
while restantes:
    feito = False
    for r in sorted(livre, key=lambda r: len(livre[r]), reverse=True):
        if not livre[r]: continue
        cand = [e for e in CAT if r in CAT[e][2] and uso[e] < CAT[e][3]]
        if not cand:
            cand = [e for e in CAT if r in CAT[e][2]]
        e = min(cand, key=lambda e: (uso[e], rnd.random())); poe(e, r); feito = True
    restantes = sum(len(v) for v in livre.values())
    if not feito: break
# parâmetros por ponto
ATRS = ['pod', 'def', 'int', 'vel']; k = 0
for i in sorted(atr):
    e = atr[i]['id']
    if e in ('proibido', 'unico'): atr[i]['attr'] = ATRS[k % 4]; k += 1
    if e == 'limite': atr[i]['n'] = 15
    if e == 'morte': atr[i]['n'] = 3
sem = [e for e in CAT if uso[e] == 0]
# 3) grava
saida = {'v': 1, 'aviso': 'Etapa 3 aplicada (tools/atribuir_eventos_historia.py). Só regras já implementadas no motor; as demais ficam para os próximos lotes.', 'convertidos': sorted(conv), 'eventos': atr}
json.dump(saida, open(os.path.join(raiz, 'dados', 'historia_eventos.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
novo = txt[:m.start(1)] + json.dumps(mapa, ensure_ascii=False, separators=(',', ':')) + txt[m.end(1):]; open(mapa_js, 'w', encoding='utf-8').write(novo)
for b in bat['batalhas']:
    if b['id'] in conv: b['tipo'] = 'evento'
json.dump(bat, open(os.path.join(raiz, 'dados', 'historia_batalhas.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
o = {}
for b in bat['batalhas']:
    d = {'t': b['tipo'], 'r': b['regiao'], 'tema': b['tema'], 'i': [{'n': x['nome'], 'a': x['avatar'], 'c': x['cartas']} for x in b['inimigos']]}
    if b['id'] in atr: d['e'] = atr[b['id']]
    o[b['id']] = d
open(os.path.join(proj, 'historia_bat.js'), 'w', encoding='utf-8').write("/* Batalhas do modo história (gerado por tools/atribuir_eventos_historia.py): id do ponto → tipo, região, tema, inimigos (nome, avatar, 7 cartas) e evento fixo 'e'. */\nwindow.DS_HIST_BAT = " + json.dumps(o, ensure_ascii=False, separators=(',', ':')) + ";\n")
cat = {e: {'nome': v[0], 'regra': v[1]} for e, v in CAT.items()}
open(os.path.join(proj, 'historia_eventos.js'), 'w', encoding='utf-8').write("/* Catálogo dos eventos de batalha (nome e regra em uma linha). Gerado por tools/atribuir_eventos_historia.py. {A} = atributo do ponto. */\nwindow.DS_EVENTOS_H = " + json.dumps(cat, ensure_ascii=False, separators=(',', ':')) + ";\n")
print('convertidos', len(conv), 'eventos', len(eventos), 'atribuídos', len(atr), 'normais', sum(1 for n in mapa['nos'] if n['tipo'] == 'normal'))
print('uso', dict(sorted(uso.items(), key=lambda x: -x[1])), 'sem uso', sem)
