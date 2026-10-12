#!/usr/bin/env python3
"""Gera propostas.js a partir de dados/propostas/*.json do repositório (cartas_79 + habilidades_129).
Uso: python3 tools/importar_propostas.py [pasta_dados_propostas]   (padrão: ../dados/propostas)
Cartas com status APROVADA saem do modo prévia; as demais aparecem marcadas como prévia."""
import json, sys, os
base = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), '..', '..', 'dados', 'propostas')
c = json.load(open(os.path.join(base, 'cartas_79.json'), encoding='utf-8'))
h = json.load(open(os.path.join(base, 'habilidades_129.json'), encoding='utf-8'))
cartas = {}
for x in c['cartas']:
    a = x['atributos_propostos']
    cartas[x['id']] = {'d': x['descricao_curta'], 's': [a['ATQ'], a['DEF'], a['INT'], a['VEL']],
                       'p': x['perfil_sugerido'], 'e': x['habilidade_especial_sugerida_id'], 'a': 1 if str(x.get('status', '')).upper() == 'APROVADA' else 0}
hab = {x['id']: [x['nome'], x['efeito_integral_proposto'], x['grupo']] for x in h['habilidades']}
out = os.path.join(os.path.dirname(__file__), '..', 'propostas.js')
js = ('/* GERADO por tools/importar_propostas.py — dados PROPOSTA_NAO_APROVADA (prévia). Não edite à mão. */\n'
      '(function (r) { r.DS_PROPOSTAS = %s; })(typeof window !== "undefined" ? window : globalThis);\n'
      % json.dumps({'cartas': cartas, 'hab': hab}, ensure_ascii=False, separators=(',', ':')))
open(out, 'w', encoding='utf-8').write(js)
print('ok', len(cartas), 'cartas', len(hab), 'habilidades', os.path.getsize(out), 'bytes')
