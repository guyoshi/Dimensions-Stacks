# Modo história: boneco anda casa por casa (etapa 1): tela inicial, sorteio de partida, mapa com 105 pontos, painel, vitórias de teste, boss abrindo, continuar após recarregar.
import sys, os, time, subprocess, json
from playwright.sync_api import sync_playwright
proj = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
idx = open(os.path.join(proj, 'index.html'), encoding='utf-8').read()
open(os.path.join(proj, '_page.html'), 'w', encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + idx + '</body></html>')
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8777', '--directory', proj], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(.8)
errs = []; bad = 0
def chk(c, m):
    global bad
    print(('ok  ' if c else 'FALHA '), m); bad += 0 if c else 1
shots = os.path.join(proj, 'tests', 'shots'); os.makedirs(shots, exist_ok=True)
try:
  with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 400, 'height': 850}, has_touch=True); pg = ctx.new_page()
    pg.add_init_script("localStorage.setItem('dsstacks.opts', JSON.stringify({musicOn:false,help:false}));")
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'fonts' not in m.text and 'ERR_' not in m.text else None)
    pg.goto('http://localhost:8777/_page.html'); pg.wait_for_timeout(900)
    pg.click('#nav [data-tab=uniao]'); pg.wait_for_timeout(500)
    chk(pg.evaluate("document.querySelector('#nav').hidden") is True, 'barra inferior oculta no modo história')
    chk(pg.evaluate("document.querySelector('[data-a=cont]').disabled") is True, 'Continuar desativado sem jornada salva')
    pg.screenshot(path=shots + '/hist_hub.png')
    pg.click('[data-a=novo]'); pg.wait_for_selector('.hs-svg', timeout=10000); pg.wait_for_timeout(1200)
    M = pg.evaluate("window.DSHistoria.data"); S = pg.evaluate("window.DSHistoria.state()")
    chk(S['pos'] == S['startId'] and pg.evaluate("!!document.querySelector('#hsHero')"), 'boneco começa no ponto de partida')
    pos = lambda i: pg.evaluate("id => {const r=document.querySelector('.n[data-id=\"'+id+'\"]').getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]}", i)
    # distância em passos até o boss
    nodes = {x['id']: x for x in M['nos']}
    from collections import deque
    d = {S['startId']: 0}; q = deque([S['startId']])
    while q:
        u = q.popleft()
        for v in nodes[u]['viz']:
            if v not in d: d[v] = d[u] + 1; q.append(v)
    far = [i for i, k in d.items() if k == 3 and nodes[i]['tipo'] != 'loja'][0]
    pg.click('[data-a=leg]'); pg.wait_for_timeout(200); pg.uncheck('[data-a=aberto]'); pg.click('.hs-leg [data-a=ok]'); pg.wait_for_timeout(300)
    pg.click('[data-a=fit]'); pg.wait_for_timeout(800)
    bx = pos(far); pg.mouse.click(bx[0], bx[1]); pg.wait_for_timeout(700)
    chk('Fora de alcance' in pg.inner_text('#hsSheet'), 'sem o modo aberto, ponto a 3 passos está fora de alcance')
    pg.click('#hsSheet [data-a=x]'); pg.click('[data-a=leg]'); pg.wait_for_timeout(200); pg.check('[data-a=aberto]'); pg.click('.hs-leg [data-a=ok]'); pg.wait_for_timeout(300)
    pg.click('[data-a=fit]'); pg.wait_for_timeout(800)
    bx = pos(far); pg.mouse.click(bx[0], bx[1]); pg.wait_for_timeout(700)
    chk('Caminhar até aqui · 3 passos' in pg.inner_text('#hsSheet'), 'modo aberto: botão mostra 3 passos')
    pg.click('#hsSheet [data-a=go]'); pg.wait_for_timeout(450)
    mid = pg.evaluate("window.DSHistoria.state().pos"); chk(mid != S['startId'] and mid != far, 'a meio do caminho o boneco está num ponto intermediário: ' + mid)
    pg.wait_for_timeout(1500)
    chk(pg.evaluate("window.DSHistoria.state().pos") == far, 'chegou ao destino casa por casa')
    chk(pg.evaluate("!document.querySelector('#hsSheet').hidden"), 'painel do destino abre ao chegar')
    pg.screenshot(path=shots + '/hist_andar.png')
    pg.reload(); pg.wait_for_timeout(900); pg.click('#nav [data-tab=uniao]'); pg.wait_for_timeout(400); pg.click('[data-a=cont]'); pg.wait_for_selector('.hs-svg'); pg.wait_for_timeout(500)
    chk(pg.evaluate("window.DSHistoria.state().pos") == far, 'posição salva depois de recarregar')
finally:
  srv.terminate(); os.remove(os.path.join(proj, '_page.html'))
print('erros de página:', errs); sys.exit(1 if bad or errs else 0)
