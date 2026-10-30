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
    pg.add_init_script("localStorage.setItem('dsstacks.opts', JSON.stringify({musicOn:false,help:false}));localStorage.setItem('dsstacks.historia.prefs', JSON.stringify({aberto:true,v2:1,escuro:false}));")
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'fonts' not in m.text and 'ERR_' not in m.text else None)
    pg.goto('http://localhost:8777/_page.html'); pg.wait_for_timeout(900)
    pg.click('#nav [data-tab=uniao]'); pg.wait_for_timeout(500)
    chk(pg.evaluate("document.querySelector('#nav').hidden") is True, 'barra inferior oculta no modo história')
    chk(pg.evaluate("!document.querySelector('[data-a=cont]')"), 'sem Continuar sem jornada salva')
    pg.screenshot(path=shots + '/hist_hub.png')
    pg.click('[data-a=novo]'); pg.wait_for_selector('.cin-skip', timeout=5000); pg.click('.cin-skip'); pg.click('.cin-qs button'); pg.wait_for_selector('.hs-svg', timeout=10000); pg.wait_for_timeout(1200)
    M = pg.evaluate("window.DSHistoria.data"); S = pg.evaluate("window.DSHistoria.state()")
    chk(S['pos'] == 'I_' + S['startId'] and pg.evaluate("!!document.querySelector('#hsHero')"), 'boneco começa na casa inicial vazia')
    pg.evaluate("(()=>{const s=DSHistoria.state();s.pos=s.startId;})()")
    pos = lambda i: pg.evaluate("id => {const r=document.querySelector('.n[data-id=\"'+id+'\"]').getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]}", i)
    # distância em passos até o boss
    nodes = {x['id']: x for x in M['nos']}
    from collections import deque
    d = {S['startId']: 0}; q = deque([S['startId']])
    while q:
        u = q.popleft()
        for v in nodes[u]['viz']:
            if v not in d: d[v] = d[u] + 1; q.append(v)
    # caminho mais curto de 3 passos até 'far'
    prevn = {S['startId']: None}; q = deque([S['startId']])
    while q:
        u = q.popleft()
        for v in nodes[u]['viz']:
            if v not in prevn: prevn[v] = u; q.append(v)
    def cam(f):
        r = []; x = f
        while x is not None: r.insert(0, x); x = prevn[x]
        return r
    far = [i for i, k in d.items() if k == 3 and nodes[i]['tipo'] not in ('loja', 'casa') and nodes[cam(i)[1]]['tipo'] != 'casa'][0]; path = cam(far)
    # sem o modo aberto, a casa de partida ainda não foi vencida: nenhuma seta para frente
    pg.click('[data-a=leg]'); pg.wait_for_timeout(200); pg.uncheck('[data-a=aberto]'); pg.click('.hs-leg [data-a=ok]'); pg.wait_for_timeout(400)
    chk(pg.evaluate("document.querySelectorAll('.seta').length") == 0, 'sem setas no mapa')
    bx = pos(path[1]); pg.mouse.click(bx[0], bx[1]); pg.wait_for_timeout(700)
    chk(pg.evaluate("window.DSHistoria.state().pos") == S['startId'], 'sem vitória na casa atual, tocar na bolinha vizinha não anda')
    pg.click('#hsSheet [data-a=x]') if pg.evaluate("!document.querySelector('#hsSheet').hidden") else None
    pg.click('[data-a=leg]'); pg.wait_for_timeout(200); pg.check('[data-a=aberto]'); pg.click('.hs-leg [data-a=ok]'); pg.wait_for_timeout(400)
    for k, nx in enumerate(path[1:]):
        pg.click('[data-a=fit]'); pg.wait_for_timeout(700)
        bx = pos(nx); pg.mouse.click(bx[0], bx[1]); pg.wait_for_timeout(1200)
        chk(pg.evaluate("window.DSHistoria.state().pos") == nx, 'tocar na bolinha vizinha leva até ela: ' + nx)
        pg.click('#hsSheet [data-a=x]') if pg.evaluate("!document.querySelector('#hsSheet').hidden") else None
    pg.screenshot(path=shots + '/hist_andar.png')
    pg.reload(); pg.wait_for_timeout(900); pg.click('#nav [data-tab=uniao]'); pg.wait_for_timeout(400); pg.click('[data-a=cont]'); pg.wait_for_selector('.hs-svg'); pg.wait_for_timeout(500)
    chk(pg.evaluate("window.DSHistoria.state().pos") == far, 'posição salva depois de recarregar')
finally:
  srv.terminate(); os.remove(os.path.join(proj, '_page.html'))
print('erros de página:', errs); sys.exit(1 if bad or errs else 0)
