#!/usr/bin/env python3
"""Aplica em dados/oficial/cartas_87.json os atributos calculados por calc_atributos.js (JSON de saída).
Uso: python3 tools/aplicar_atributos.py <saida_calc.json>   (recalcula soma e perfil; depois rode importar_propostas.py)"""
import json, sys, os
P = os.path.join(os.path.dirname(__file__), '..', '..', 'dados', 'oficial', 'cartas_87.json')
perfil = lambda s: 'Azar' if s < 150 else 'Frágil' if s < 192 else 'Modesta' if s < 237 else 'Padrão' if s < 285 else 'Forte' if s < 318 else 'Elite'
d = json.load(open(P, encoding='utf-8')); prop = {r['id']: r for r in json.load(open(sys.argv[1]))}; n = 0
for c in d['cartas']:
    r = prop.get(c['id'])
    if r:
        f, rs, i, v = r['prop']; c['atributos'] = {'FOR': f, 'RES': rs, 'INT': i, 'VEL': v}; c['soma_atributos'] = f + rs + i + v; c['perfil_balanceamento'] = perfil(c['soma_atributos']); n += 1
open(P, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=2)); print(n, 'cartas atualizadas')
