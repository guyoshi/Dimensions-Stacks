#!/usr/bin/env python3
"""Gera a página HTML (para publicar como artifact) da proposta das 100 batalhas. Uso: python3 prototipo/tools/gerar_pagina_batalhas.py SAIDA.html"""
import json, markdown, subprocess, html, sys, os
raiz = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
d = json.load(open(raiz + '/dados/historia_batalhas.json'))
cs = json.loads(subprocess.check_output(['node', '-e', "global.window=global;['propostas','curtos','data','especiais','engine'].forEach(f=>require('%s/prototipo/'+f+'.js'));console.log(JSON.stringify(globalThis.DS_DATA.CARTAS.map(c=>({id:c.id,n:c.nome,r:c.raridade,s:c.serie}))))" % raiz]))
C = {c['id']: c for c in cs}
md = open(raiz + '/docs/MODO_HISTORIA_BATALHAS_PROPOSTA_2026-10-28.md', encoding='utf-8').read()
head = markdown.markdown(md.split('## Repetições por carta')[0].split('\n', 2)[2], extensions=['tables'])
rar = {'comum': 'c', 'rara': 'r', 'epica': 'e', 'lendaria': 'l'}
chip = lambda i: f'<span class="k {rar[C[i]["r"]]}" title="{i} · {C[i]["r"]}">{html.escape(C[i]["n"])}</span>'
rows = ''
for b in sorted(d['batalhas'], key=lambda b: b['id']):
    inim = ''.join(f'<div class="en"><b>{html.escape(e["nome"])}</b><div class="dk">{"".join(chip(i) for i in e["cartas"])}</div></div>' for e in b['inimigos'])
    rows += f'<tr data-t="{b["tipo"]}" data-l="{b["lado"]}" data-s="{int(b["substituivel"])}"><td class="id">{b["id"]}</td><td>{b["tipo"]}<br><small>região {b["regiao"]} · {b["lado"]}</small></td><td>{inim}</td><td class="num">{b["poder_medio"]}</td><td>{"sim" if b["substituivel"] else "não"}</td></tr>'
rr = ''.join(f'<tr><td>{html.escape(C[i]["n"])} <small>{i}</small></td><td>{C[i]["s"]}</td><td>{C[i]["r"]}</td><td class="num">{n}</td></tr>' for i, n in sorted(d['repeticoes'].items(), key=lambda kv: (kv[1], kv[0])))
page = f'''<title>Proposta das 100 Batalhas</title>
<style>
:root{{--bg:#f6f4fb;--fg:#1d1a2e;--mut:#6a6585;--card:#fff;--line:#ddd8ee;--acc:#6b3fd4;--c:#8a8aa0;--r:#2d7ed8;--e:#a447d6;--l:#d68a0a}}
@media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{--bg:#0f0c24;--fg:#efeaff;--mut:#a9a2d4;--card:#17133a;--line:#2e2860;--acc:#b394ff;--c:#8d8ab0;--r:#5fb0ff;--e:#c98cff;--l:#ffc46b;color-scheme:dark}}}}
:root[data-theme="dark"]{{--bg:#0f0c24;--fg:#efeaff;--mut:#a9a2d4;--card:#17133a;--line:#2e2860;--acc:#b394ff;--c:#8d8ab0;--r:#5fb0ff;--e:#c98cff;--l:#ffc46b;color-scheme:dark}}
body{{background:var(--bg);color:var(--fg);font:15px/1.55 system-ui,sans-serif;padding:20px 16px 60px;max-width:1100px;margin:0 auto}}
h1{{font-size:26px;margin:0 0 6px}}h2{{margin-top:34px}}small{{color:var(--mut)}}
.sc{{overflow-x:auto;border:1px solid var(--line);border-radius:12px;background:var(--card)}}
table{{border-collapse:collapse;width:100%;font-size:13.5px}}th,td{{padding:8px 10px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}}th{{font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:var(--mut)}}
td.num{{text-align:right;font-variant-numeric:tabular-nums}}td.id{{font-weight:700}}
.en{{margin-bottom:6px}}.dk{{display:flex;flex-wrap:wrap;gap:4px;margin-top:3px}}
.k{{border:1px solid currentColor;border-radius:999px;padding:1px 8px;font-size:12px;white-space:nowrap}}.k.c{{color:var(--c)}}.k.r{{color:var(--r)}}.k.e{{color:var(--e)}}.k.l{{color:var(--l);font-weight:700}}
.f{{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0}}.f select,.f label{{padding:7px 10px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--fg);font:inherit}}
.intro table{{margin:10px 0}}.intro li{{margin:5px 0}}
</style>
<h1>Proposta das 100 batalhas</h1><small>Modo história · Etapa 2 · aguardando aprovação · cor da carta = raridade (cinza comum, azul rara, roxa épica, dourada lendária)</small>
<div class="intro">{head}</div>
<h2>Batalhas</h2>
<div class="f"><select id="ft"><option value="">Todos os tipos</option><option>normal</option><option>evento</option><option>elite</option><option>miniboss</option><option>guardiao</option><option>boss</option></select><select id="fl"><option value="">Todos os lados</option><option value="esq">Esquerda</option><option value="cima">Cima</option><option value="dir">Direita</option><option value="baixo">Baixo</option><option value="centro">Centro</option></select><label><input type="checkbox" id="fs"> só substituíveis</label></div>
<div class="sc"><table id="bt"><thead><tr><th>Ponto</th><th>Tipo</th><th>Inimigo(s) e cartas (ordem de jogo)</th><th>Poder</th><th>Subst.</th></tr></thead><tbody>{rows}</tbody></table></div>
<h2>Aparições por carta</h2><div class="sc"><table><thead><tr><th>Carta</th><th>Série</th><th>Raridade</th><th>Batalhas</th></tr></thead><tbody>{rr}</tbody></table></div>
<script>
const f=()=>{{const t=ft.value,l=fl.value,s=fs.checked;document.querySelectorAll('#bt tbody tr').forEach(r=>{{r.hidden=!((!t||r.dataset.t===t)&&(!l||r.dataset.l===l)&&(!s||r.dataset.s==='1'))}})}};
[ft,fl,fs].forEach(x=>x.onchange=f);
</script>'''
open(sys.argv[1], 'w', encoding='utf-8').write(page)
