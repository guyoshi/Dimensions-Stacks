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
    elif m and m.group(1) not in H and m.group(1) != 'AE-104':
        continue   # habilidade retirada do catálogo: a linha sai do documento
    elif l == '' and out and out[-1].startswith('| AE-103') is False and i + 1 < len(lines) and lines[i + 1].startswith('| AE-105'):
        continue   # linha em branco que quebrava a tabela do grupo K
    else:
        out.append(l)
# contagem de linhas de cada seção no título "## X. Nome (N)"
import re as _re
hs = [i for i, l in enumerate(out) if _re.match(r'^## [A-Z]\. .*\(\d+\)$', l)]
for k, i in enumerate(hs):
    j = hs[k + 1] if k + 1 < len(hs) else len(out)
    cnt = sum(1 for l in out[i:j] if _re.match(r'^\| AE-\d{3} \|', l) and not l.startswith('| AE-104'))
    out[i] = _re.sub(r'\(\d+\)$', '(%d)' % cnt, out[i])
# habilidades criadas depois do catálogo original (AE-131 em diante): seção própria
novas = [h for i, h in sorted(H.items()) if i > 'AE-130']
if novas and not any(l.startswith('## O. ') for l in out):
    k = next(i for i, l in enumerate(out) if l.startswith('## Regras propostas de integridade'))
    sec = ['## O. Novas habilidades criadas em 13 e 14/10/2026 (%d)' % len(novas), '',
           'Criadas a pedido do autor: as primeiras que **reduzem atributos do rival** (AE-131 a AE-134 e AE-141), o conjunto de bônus de AE-135 a AE-140 e AE-142, que substituiu especiais com valor medido abaixo de 47%. Os números de vitórias vêm de `tests/bot_per_special.js` e estão em [BALANCEAMENTO_GERAL_2026-10-13.md](BALANCEAMENTO_GERAL_2026-10-13.md).', '',
           '| ID | Nome da habilidade | Efeito definido no catálogo (requer testes) | Referência física | Situação | Carta atribuída (ID) |', '| --- | --- | --- | --- | --- | --- |']
    sec += [row(h) for h in novas] + ['']
    out[k:k] = sec
open(P, 'w', encoding='utf8').write('\n'.join(out))
print('linhas regeneradas:', n)
