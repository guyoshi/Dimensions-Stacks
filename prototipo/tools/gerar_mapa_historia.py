#!/usr/bin/env python3
"""Gera o mapa do modo história "A União" (teia assimétrica de 100 batalhas + 5 lojas).

Saída: prototipo/historia_mapa.js (dados fixos: a posição, o tipo e as ligações de cada ponto NUNCA mudam entre execuções
com a mesma semente). Use --png para conferir o desenho. Depois de aprovado o mapa, NÃO regenere: os ids dos pontos são
a referência dos baralhos dos inimigos (etapa 2). Para mudar um ponto, edite o JSON de ajustes (dados/historia_ajustes.json).

Regras do desenho (autor, 28/10/2026): mapa grande e assimétrico, boss no centro, 4 guardiões em volta do boss, 4 pontos de
partida (esquerda, cima, direita, baixo), nós com 1, 2 ou 3 caminhos de saída, 100 batalhas + 5 lojas.
"""
import json, math, random, sys, os, heapq
import numpy as np
from scipy.spatial import Delaunay

SEED = int(os.environ.get('SEED', '0')) or None
R = 1000.0
N_BATALHAS, N_LOJAS = 100, 5
QUOTA = {'miniboss': 8, 'elite': 10, 'evento': 24, 'guardiao': 4, 'boss': 1}   # o resto é normal (53)
LADOS = ['esq', 'cima', 'dir', 'baixo']
ANG = {'esq': math.pi, 'cima': -math.pi / 2, 'dir': 0.0, 'baixo': math.pi / 2}


def dist(a, b): return math.hypot(a[0] - b[0], a[1] - b[1])


def gerar(seed):
    rnd = random.Random(seed)
    P = []   # (x, y, papel)
    P.append((0.0, 0.0, 'boss'))
    for l in LADOS:                                             # guardiões em volta do boss (assimétricos)
        a = ANG[l] + rnd.uniform(-.28, .28); r = rnd.uniform(165, 215)
        P.append((r * math.cos(a), r * math.sin(a), 'guardiao:' + l))
    for l in LADOS:                                             # pontos de partida nas extremidades
        a = ANG[l] + rnd.uniform(-.22, .22); r = rnd.uniform(905, 960)
        P.append((r * math.cos(a), r * math.sin(a), 'start:' + l))
    total = 1 + 4 + N_BATALHAS - 1 - 4 - 4 + 4 + N_LOJAS + 0   # boss + guardiões + (100 - boss - guardiões - starts) + starts + lojas
    total = N_BATALHAS + N_LOJAS
    tries = 0
    while len(P) < total and tries < 200000:
        tries += 1
        r = R * math.sqrt(rnd.random()) * (0.97 if rnd.random() < .85 else 0.8)
        a = rnd.uniform(0, 2 * math.pi); x, y = r * math.cos(a), r * math.sin(a)
        dmin = 118 + 28 * (1 - r / R) * rnd.random()
        if all(dist((x, y), (p[0], p[1])) >= dmin for p in P): P.append((x, y, 'livre'))
    if len(P) < total: return None
    pts = np.array([[p[0], p[1]] for p in P]); tri = Delaunay(pts)
    E = set()
    for s in tri.simplices:
        for i in range(3):
            a, b = int(s[i]), int(s[(i + 1) % 3]); E.add((min(a, b), max(a, b)))
    L = {e: dist(P[e[0]], P[e[1]]) for e in E}
    boss = 0; guard = [1, 2, 3, 4]; starts = [5, 6, 7, 8]
    # o boss só se liga aos guardiões; guardiões só ligam ao boss e a nós comuns (nunca entre si)
    cand = {e: l for e, l in L.items() if l <= 330 and not (boss in e and not (set(e) - {boss}) <= set(guard)) and not (set(e) <= set(guard))}
    for g in guard: cand[(0, g)] = dist(P[0], P[g])
    # árvore geradora com ruído (caminhos sinuosos, becos sem saída)
    par = list(range(len(P)))
    def f(x):
        while par[x] != x: par[x] = par[par[x]]; x = par[x]
        return x
    adj = {i: set() for i in range(len(P))}
    for g in guard: adj[0].add(g); adj[g].add(0); par[f(g)] = f(0)
    for e, l in sorted(cand.items(), key=lambda kv: kv[1] * rnd.uniform(.6, 2.4)):
        if f(e[0]) != f(e[1]) and len(adj[e[0]]) < 4 and len(adj[e[1]]) < 4:
            adj[e[0]].add(e[1]); adj[e[1]].add(e[0]); par[f(e[0])] = f(e[1])
    if len({f(i) for i in range(len(P))}) != 1: return None
    # arestas extras: laços para dar escolha (alvo: ~1,22 aresta por nó)
    ne = sum(len(a) for a in adj.values()) // 2; alvo = int(1.07 * len(P))
    extra = [e for e in cand if e[1] not in adj[e[0]] and 0 not in e]
    rnd.shuffle(extra)
    for e in sorted(extra, key=lambda e: cand[e] + rnd.uniform(0, 60)):
        if ne >= alvo: break
        if len(adj[e[0]]) < 4 and len(adj[e[1]]) < 4 and (e[0] not in starts or len(adj[e[0]]) < 2) and (e[1] not in starts or len(adj[e[1]]) < 2):
            adj[e[0]].add(e[1]); adj[e[1]].add(e[0]); ne += 1
    return P, adj, boss, guard, starts, rnd


def bfs(adj, s, block=()):
    d = {s: 0}; q = [s]
    while q:
        n = q.pop(0)
        for m in adj[n]:
            if m not in d and m not in block: d[m] = d[n] + 1; q.append(m)
    return d


def pontuar(P, adj, boss, guard, starts):
    g = [len(adj[i]) for i in range(len(P))]
    folhas = sum(1 for i in range(len(P)) if g[i] == 1) / len(P)
    deg3 = sum(1 for i in range(len(P)) if g[i] >= 3) / len(P)
    if max(g) > 4: return -1
    dist_boss = [bfs(adj, s)[boss] for s in starts]
    if min(dist_boss) < 10: return -1
    if not (0.20 <= folhas <= 0.42 and 0.16 <= deg3 <= 0.40): return -1
    return 100 - abs(folhas - .32) * 100 - abs(deg3 - .28) * 100 + min(dist_boss)


def montar(seed):
    r = gerar(seed)
    if not r: return None
    P, adj, boss, guard, starts, rnd = r
    sc = pontuar(P, adj, boss, guard, starts)
    if sc < 0: return None
    return sc, P, adj, boss, guard, starts, rnd


def classificar(P, adj, boss, guard, starts, rnd):
    n = len(P); raio = [dist(P[i], (0, 0)) / R for i in range(n)]
    tier = [1 if r > .74 else 2 if r > .5 else 3 if r > .27 else 4 for r in raio]
    tipo = {boss: 'boss'}
    for g in guard: tipo[g] = 'guardiao'
    perto_start = set()
    for s in starts:
        for k, v in bfs(adj, s).items():
            if v <= 2: perto_start.add(k)
    livres = [i for i in range(n) if i not in tipo]
    # lojas: becos sem saída (ou nós de 2 caminhos), espalhadas, longe dos pontos de partida
    cl = [i for i in livres if i not in starts and i not in perto_start and tier[i] <= 3 and len(adj[i]) <= 2]
    cl.sort(key=lambda i: (len(adj[i]), rnd.random()))
    lojas = []
    for i in cl:
        if len(lojas) >= N_LOJAS: break
        if all(dist(P[i], P[j]) > 520 for j in lojas) and all(len(adj[i]) <= 1 or len(lojas) >= 3 for _ in [0]): lojas.append(i)
    if len(lojas) < N_LOJAS:
        for i in cl:
            if len(lojas) >= N_LOJAS: break
            if i not in lojas and all(dist(P[i], P[j]) > 380 for j in lojas): lojas.append(i)
    if len(lojas) < N_LOJAS: return None
    for i in lojas: tipo[i] = 'loja'
    bat = [i for i in livres if i not in lojas]
    pool = [i for i in bat if i not in starts and i not in perto_start]
    def pesos(cat, i):
        t = tier[i]; g = len(adj[i])
        if cat == 'miniboss': return {1: 0, 2: 3, 3: 4, 4: 0}[t] * (2.2 if g == 2 else 1)
        if cat == 'elite': return {1: .3, 2: 2, 3: 3, 4: 3}[t] * (1.8 if g == 1 else 1)
        if cat == 'evento': return {1: 1, 2: 1.5, 3: 1.5, 4: 1.2}[t]
    for cat in ['miniboss', 'elite', 'evento']:
        q = QUOTA[cat]
        escolhidos = []
        for _ in range(q):
            ps = [(i, pesos(cat, i)) for i in pool if i not in tipo and (cat != 'miniboss' or all(dist(P[i], P[j]) > 230 for j in escolhidos))]
            ps = [(i, w) for i, w in ps if w > 0]
            tot = sum(w for _, w in ps); x = rnd.random() * tot
            for i, w in ps:
                x -= w
                if x <= 0: tipo[i] = cat; escolhidos.append(i); break
    for i in bat:
        tipo.setdefault(i, 'normal')
    return tipo, tier, lojas


def main():
    best = None
    for seed in ([SEED] if SEED else range(1, 4000)):
        m = montar(seed)
        if not m: continue
        sc, P, adj, boss, guard, starts, rnd = m
        c = classificar(P, adj, boss, guard, starts, rnd)
        if not c: continue
        if best is None or sc > best[0]: best = (sc, seed, P, adj, boss, guard, starts, c)
        if SEED or sc > 128: break
    if not best: sys.exit('nenhum mapa válido')
    sc, seed, P, adj, boss, guard, starts, (tipo, tier, lojas) = best
    n = len(P)
    # ids estáveis: batalhas B001.. ordenadas de fora para dentro e por ângulo; lojas L1..L5
    ordem = sorted([i for i in range(n) if tipo[i] != 'loja'], key=lambda i: (-dist(P[i], (0, 0)) // 40, math.atan2(P[i][1], P[i][0])))
    ordem = [i for i in ordem if i != boss] + [boss]
    ids = {}
    for k, i in enumerate(ordem): ids[i] = 'B%03d' % (k + 1)
    for k, i in enumerate(sorted(lojas, key=lambda i: math.atan2(P[i][1], P[i][0]))): ids[i] = 'L%d' % (k + 1)
    def lado(i):
        a = math.atan2(P[i][1], P[i][0]); best = min(LADOS, key=lambda l: abs(math.remainder(a - ANG[l], 2 * math.pi))); return best
    nos = []
    for i in range(n):
        nos.append({'id': ids[i], 'x': round(P[i][0]), 'y': round(P[i][1]), 'tipo': tipo[i], 'tier': tier[i], 'lado': lado(i), 'viz': sorted(ids[j] for j in adj[i])})
    nos.sort(key=lambda o: (o['id'][0] != 'B', o['id']))
    out = {'v': 1, 'semente': seed, 'raio': int(R), 'boss': ids[boss], 'guardioes': {lado(g): ids[g] for g in guard}, 'starts': {lado(s): ids[s] for s in starts}, 'nos': nos}
    aj = os.path.join(os.path.dirname(__file__), '..', '..', 'dados', 'historia_ajustes.json')
    if os.path.exists(aj):                                      # ajustes manuais do autor (tipo/posição por id) sobrepõem o gerador
        for k, v in json.load(open(aj, encoding='utf-8')).items():
            for o in nos:
                if o['id'] == k: o.update(v)
    dst = os.path.join(os.path.dirname(__file__), '..', 'historia_mapa.js')
    with open(dst, 'w', encoding='utf-8') as f:
        f.write('/* Mapa do modo história "A União" — GERADO por tools/gerar_mapa_historia.py (semente %d). Posição, tipo e ligações são fixos; não editar à mão (use dados/historia_ajustes.json). */\n' % seed)
        f.write('(function (r) { r.DS_MAPA = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + '; })(typeof window !== \'undefined\' ? window : globalThis);\n')
    cont = {}
    for o in nos: cont[o['tipo']] = cont.get(o['tipo'], 0) + 1
    gr = [len(o['viz']) for o in nos]
    print('semente', seed, 'pontuação', round(sc, 1), cont, 'graus', {d: gr.count(d) for d in sorted(set(gr))})
    if '--png' in sys.argv:
        import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
        cor = {'normal': '#6cc6ff', 'evento': '#ffd25f', 'elite': '#c58cff', 'miniboss': '#ff5a7a', 'guardiao': '#ff9a3c', 'loja': '#7dffb0', 'boss': '#ffffff'}
        fig, ax = plt.subplots(figsize=(11, 11)); ax.set_facecolor('#0a0820'); fig.patch.set_facecolor('#0a0820')
        byid = {o['id']: o for o in nos}
        for o in nos:
            for v in o['viz']:
                if o['id'] < v: ax.plot([o['x'], byid[v]['x']], [o['y'], byid[v]['y']], color='#5a4ea0', lw=1.2, zorder=1)
        for o in nos: ax.scatter(o['x'], o['y'], s=170 if o['tipo'] in ('miniboss', 'guardiao') else 90, color=cor[o['tipo']], zorder=2); ax.text(o['x'], o['y'], o['id'][1:], fontsize=5, ha='center', va='center', zorder=3)
        ax.set_aspect('equal'); ax.axis('off'); plt.savefig(sys.argv[sys.argv.index('--png') + 1] if len(sys.argv) > sys.argv.index('--png') + 1 and not sys.argv[sys.argv.index('--png') + 1].startswith('--') else '/tmp/mapa.png', dpi=90, facecolor=fig.get_facecolor())


main()
