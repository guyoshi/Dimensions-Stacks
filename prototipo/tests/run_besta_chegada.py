# A Besta avisa ao chegar (nível abaixo do recomendado) uma vez só; o aviso da chegada só informa e não inicia o duelo.
import sys, os, time, subprocess
from playwright.sync_api import sync_playwright
proj = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
idx = open(os.path.join(proj, 'index.html'), encoding='utf-8').read()
open(os.path.join(proj, '_page.html'), 'w', encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + idx + '</body></html>')
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8778', '--directory', proj], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(.8)
bad = 0
def chk(c, m):
    global bad
    print(('ok  ' if c else 'FALHA '), m); bad += 0 if c else 1
try:
  with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 400, 'height': 850}, has_touch=True); pg = ctx.new_page(); errs = []
    pg.add_init_script("localStorage.setItem('dsstacks.opts', JSON.stringify({musicOn:false,help:false}));localStorage.setItem('dsstacks.historia.prefs', JSON.stringify({aberto:true,v2:1,escuro:false}));")
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('http://localhost:8778/_page.html'); pg.wait_for_timeout(900)
    pg.click('#nav [data-tab=uniao]'); pg.wait_for_timeout(400)
    pg.click('[data-a=novo]'); pg.wait_for_selector('.cin-skip', timeout=5000); pg.click('.cin-skip'); pg.click('.cin-qs button'); pg.wait_for_selector('.hs-svg', timeout=10000); pg.wait_for_timeout(1000)
    M = pg.evaluate("window.DSHistoria.data"); nodes = {x['id']: x for x in M['nos']}; boss = M['boss']
    viz = [v for v in nodes[boss]['viz']][0]
    pg.evaluate("(v)=>{const s=DSHistoria.state();s.pos=v;s.xp=0;s.avisosNivel={};}", viz)
    pg.evaluate("(id)=>DSHistoria.openNode(id)", boss); pg.wait_for_timeout(500)
    xy = pg.evaluate("id => {const r=document.querySelector('.n[data-id=\"'+id+'\"]').getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]}", boss)
    for _ in range(3):
        pg.mouse.click(xy[0], xy[1]); pg.wait_for_timeout(2500)
        if pg.evaluate("DSHistoria.state().pos") == boss: break
    pg.wait_for_timeout(2500)
    S = pg.evaluate("DSHistoria.state()")
    chk(S['pos'] == boss, 'boneco chegou na Besta')
    chk(pg.evaluate("!!document.querySelector('.hs-levelwarn')"), 'aviso do mentor aparece ao chegar')
    chk(pg.evaluate("document.querySelectorAll('.hs-levelwarn [data-a=fight]').length") == 0, 'aviso da chegada não tem botão de lutar')
    pg.click('.hs-levelwarn [data-a=back]'); pg.wait_for_timeout(500)
    chk(pg.evaluate("!document.querySelector('.hs-levelwarn')"), 'aviso fecha')
    chk(pg.evaluate("DSHistoria.state().avisosNivel['" + boss + "']") == 1, 'aviso registrado como visto')
    chk(not errs, 'sem erros de página ' + str(errs))
    b.close()
finally:
  srv.terminate(); os.remove(os.path.join(proj, '_page.html')) if os.path.exists(os.path.join(proj, '_page.html')) else None
print('FALHAS:', bad)
