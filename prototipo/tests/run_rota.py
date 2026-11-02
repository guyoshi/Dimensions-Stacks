# Rota Hard: parado no lugar a nave morre -> explosão, FIM, pontuação; 
import sys, os, time, subprocess
from playwright.sync_api import sync_playwright
proj = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
idx = open(os.path.join(proj, 'index.html'), encoding='utf-8').read()
open(os.path.join(proj, '_page.html'), 'w', encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + idx + '</body></html>')
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8791', '--directory', proj], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(.8)
bad = 0; errs = []
def chk(c, m):
    global bad
    print(('ok  ' if c else 'FALHA '), m, flush=True); bad += 0 if c else 1
try:
  with sync_playwright() as p:
    print('launch', flush=True); b = p.chromium.launch(); pg = b.new_context(viewport={'width': 400, 'height': 850}).new_page()
    pg.route('**/fonts.g*/**', lambda r: r.abort()); pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.add_init_script("localStorage.setItem('dsstacks.opts', JSON.stringify({musicOn:false,help:false}));")
    pg.goto('http://localhost:8791/_page.html', wait_until='commit'); pg.wait_for_timeout(1500)
    pg.evaluate("() => { window.DSMini.play('asteroides', {teste:true, hardUnlocked:true}).then(r => window.__r = r); }")
    print('start', flush=True); pg.wait_for_selector('.mg-modepick', timeout=4000); pg.click('[data-mode=hard]'); pg.click('.mg-begin'); pg.wait_for_selector('canvas.mg-cv', timeout=6000)
    print('canvas ok', flush=True); bb = pg.locator('canvas.mg-cv').bounding_box()
    # arrasta a nave de um lado a outro para atrair pedras
    for k in range(300):
        if k % 20 == 0: print("k", k, flush=True)
        pg.mouse.move(bb['x'] + (30 if k % 2 else bb['width'] - 30), bb['y'] + 400); pg.wait_for_timeout(60)
        if pg.evaluate("!!document.querySelector('.mg-fim')"): break
    chk(pg.evaluate("!!document.querySelector('.mg-fim')"), 'FIM aparece quando a nave é destruída')
    chk(pg.evaluate("!document.querySelector('.mg-res')"), 'pontuação ainda não apareceu no FIM')
    pg.wait_for_selector('.mg-ok', timeout=5000); chk(True, 'pontuação aparece depois')
    chk(not errs, 'sem erros de página %s' % errs[:2])
finally:
    srv.terminate()
print('FALHAS:', bad)
