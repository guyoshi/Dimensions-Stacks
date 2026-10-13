#!/usr/bin/env python3
"""Regenera as linhas de tabela de docs/BIBLIOTECA_ATAQUES_ESPECIAIS.md a partir de dados/oficial/habilidades_129.json
(nome, efeito, referência, situação e cartas atribuídas). O texto em prosa do documento não é alterado."""
import json, re, sys, os
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
H = {h['id']: h for h in json.load(open(R + '/dados/oficial/habilidades_129.json', encoding='utf8'))['habilidades']}
P = R + '/docs/BIBLIOTECA_ATAQUES_ESPECIAIS.md'
lines = open(P, encoding='utf8').read().split('\n')
def row(h):
    c = ', '.join(h['cartas_atribuidas']) if h['cartas_atribuidas'] else '—'
    return '| %s | %s | %s | %s | %s | %s |' % (h['id'], h['nome'], h['texto_efeito'].replace('|', '/'), h['origem_ideia'], h['avaliacao_de_risco'], c)
AP = '| AE-104 | *(aposentada)* | ID reservado e sem habilidade: o antigo efeito físico #52 foi excluído (ver registro de exclusão abaixo). | — | — | — |'
out = []; n = 0
for i, l in enumerate(lines):
    m = re.match(r'^\| (AE-\d{3}) \|', l)
    if m and m.group(1) in H:
        out.append(row(H[m.group(1)])); n += 1
        if m.group(1) == 'AE-103' and (i + 1 >= len(lines) or not lines[i + 1].startswith('| AE-104')):
            out.append(AP)
    elif l == '' and out and out[-1].startswith('| AE-103') is False and i + 1 < len(lines) and lines[i + 1].startswith('| AE-105'):
        continue   # linha em branco que quebrava a tabela do grupo K
    else:
        out.append(l)
open(P, 'w', encoding='utf8').write('\n'.join(out))
print('linhas regeneradas:', n)
