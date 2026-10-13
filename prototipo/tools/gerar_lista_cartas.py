#!/usr/bin/env python3
"""Gera docs/CARTAS_E_ESPECIAIS.md (nº, nome, descrição e especial de todas as cartas) a partir de dados/oficial.
Uso: python3 prototipo/tools/gerar_lista_cartas.py   (na raiz do repositório)"""
import json, os
raiz = os.path.join(os.path.dirname(__file__), '..', '..')
c = json.load(open(os.path.join(raiz, 'dados/oficial/cartas_87.json'), encoding='utf-8'))['cartas']
h = {x['id']: x for x in json.load(open(os.path.join(raiz, 'dados/oficial/habilidades_129.json'), encoding='utf-8'))['habilidades']}
antes_p = os.path.join(raiz, 'dados/historico/cartas_87_antes_2026-10-13.json')
antes = {x['id']: x['habilidade_especial_id'] for x in json.load(open(antes_p, encoding='utf-8'))['cartas']} if os.path.exists(antes_p) else {}
serie = {'J': 'Ciclo de Jesed', 'V': 'Viajantes Dimensionais', 'S': 'Spacetheft', 'D': 'Diário Sobrenatural', 'M': 'Mistério Oculto', 'B': 'Édelin / Belfex'}
o = ['# Dimensions Stacks — Cartas e Habilidades Especiais (%d cartas)' % len(c), '',
     '> Lista de todas as cartas com **número (ID)**, **nome**, **descrição** e **habilidade especial** (forma curta: **especial**). Gerada a partir de `dados/oficial/cartas_87.json` e `dados/oficial/habilidades_129.json`; para atualizar: `python3 prototipo/tools/gerar_lista_cartas.py`.', '',
     '**Reatribuição de 13/10/2026 (autorizada pelo autor):** o custo de usar um especial é a própria carta, então a força da carta passou a acompanhar o valor do especial. Especiais de informação e ordenação (espiar, reordenar, trocas sem ganho) ficam em cartas **fracas**; os mais poderosos ficam em cartas **fortes**. Os 8 integrantes da União mantiveram os especiais aprovados. A tabela de mudanças está no fim.', '',
     '| Nº | Carta | Série | Descrição | ATQ | DEF | INT | VEL | Soma | Especial | Efeito do especial |', '| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- |']
for x in c:
    a = x['atributos']; e = h[x['habilidade_especial_id']]; m = ' ⭐' if str(x.get('uniao', '')).upper() != 'NAO' else ''
    if not str(x.get('status', '')).upper().startswith('APROVADA'): m += ' 🆕'
    o.append('| %s | %s%s | %s | %s | %d | %d | %d | %d | %d | **%s** — %s | %s |' % (x['id'], x['nome'], m, serie.get(x['id'][0], x['id'][0]), x['descricao_curta'], a['ATQ'], a['DEF'], a['INT'], a['VEL'], x['soma_atributos'], x['habilidade_especial_id'], e['nome'], e['texto_efeito']))
o += ['', '⭐ = integrante da União (especial original mantido). 🆕 = carta proposta, aguardando aprovação do autor (aparece com a faixa PRÉVIA no jogo).']
if antes:
    o += ['', '## Mudanças de 13/10/2026 (especial anterior → novo)', '', '| Carta | Soma | Antes | Agora |', '| --- | ---: | --- | --- |']
    for x in c:
        if antes.get(x['id']) and antes[x['id']] != x['habilidade_especial_id']:
            o.append('| %s %s | %d | %s — %s | %s — %s |' % (x['id'], x['nome'], x['soma_atributos'], antes[x['id']], h[antes[x['id']]]['nome'], x['habilidade_especial_id'], h[x['habilidade_especial_id']]['nome']))
open(os.path.join(raiz, 'docs/CARTAS_E_ESPECIAIS.md'), 'w', encoding='utf-8').write('\n'.join(o) + '\n')
print('ok', len(c), 'cartas')
