#!/usr/bin/env python3
"""Gera propostas.js a partir de dados/oficial (cartas_87.json + habilidades_129.json), fonte aprovada pelo autor.
Uso: python3 tools/importar_propostas.py [pasta_dados_oficial]   (padrão: ../../dados/oficial)
Cartas com status APROVADA* saem do modo prévia; as demais aparecem marcadas como prévia."""
import json, sys, os
base = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), '..', '..', 'dados', 'oficial')
c = json.load(open(os.path.join(base, 'cartas_87.json'), encoding='utf-8'))
h = json.load(open(os.path.join(base, 'habilidades_129.json'), encoding='utf-8'))
cartas = {}
for x in c['cartas']:
    a = x['atributos']
    cartas[x['id']] = {'d': x['descricao_curta'], 's': [a['ATQ'], a['DEF'], a['INT'], a['VEL']],
                       'p': x['perfil_balanceamento'], 'e': x['habilidade_especial_id'],
                       'a': 1 if str(x.get('status', '')).upper().startswith('APROVADA') else 0,
                       'u': 1 if str(x.get('uniao', '')).upper() != 'NAO' else 0}
hab = {x['id']: [x['nome'], x['texto_efeito'], x['categoria']] for x in h['habilidades']}
out = os.path.join(os.path.dirname(__file__), '..', 'propostas.js')
js = ('/* GERADO por tools/importar_propostas.py a partir de dados/oficial (aprovado pelo autor). Não edite à mão. */\n'
      '(function (r) { r.DS_PROPOSTAS = %s; })(typeof window !== "undefined" ? window : globalThis);\n'
      % json.dumps({'cartas': cartas, 'hab': hab}, ensure_ascii=False, separators=(',', ':')))
open(out, 'w', encoding='utf-8').write(js)
print('ok', len(cartas), 'cartas', sum(v['a'] for v in cartas.values()), 'aprovadas', len(hab), 'habilidades', os.path.getsize(out), 'bytes')
