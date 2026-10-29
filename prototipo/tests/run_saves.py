# 3 saves: criar em slots diferentes, continuar, apagar.
import sys, os, time, subprocess
from playwright.sync_api import sync_playwright
proj = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
idx = open(os.path.join(proj, 'index.html'), encoding='utf-8').read()
open(os.path.join(proj, '_page.html'), 'w', encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + idx + '</body></html>')
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8779', '--directory', proj], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(.8)
errs = []; bad = 0
def chk(c, m):
    global bad
    print(('ok  ' if c else 'FALHA '), m); bad += 0 if c else 1
shots = os.path.join(proj, 'tests', 'shots'); os.makedirs(shots, exist_ok=True)
try:
  with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_context(viewport={'width': 400, 'height': 850}).new_page()
    pg.add_init_script("localStorage.setItem('dsstacks.opts', JSON.stringify({musicOn:false,help:false}));localStorage.setItem('dsstacks.historia.prefs', JSON.stringify({aberto:true,v2:1}));")
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'fonts' not in m.text and 'ERR_' not in m.text else None)
    pg.goto('http://localhost:8779/_page.html'); pg.wait_for_timeout(900)
    pg.click('#nav [data-tab=uniao]'); pg.wait_for_timeout(400)
    chk(pg.locator('.hs-slot').count() == 3, '3 slots')
    pg.click('.hs-slot [data-a=novo][data-s="2"]'); pg.wait_for_selector('.cin-skip'); pg.click('.cin-skip'); pg.click('.cin-qs button'); pg.wait_for_selector('.hs-svg', timeout=20000); pg.wait_for_timeout(500)
    chk(pg.evaluate("!!localStorage.getItem('dsstacks.historia.2') && !localStorage.getItem('dsstacks.historia')"), 'save 2 criado, 1 vazio')
    pg.evaluate("window.DSHistoria.state().pend = 77; window.DSUI.show('menu')"); pg.wait_for_timeout(300)
    pg.click('#nav [data-tab=uniao]'); pg.wait_for_timeout(400)
    chk(pg.locator('.hs-slot.on').count() == 1 and pg.locator('.hs-slot [data-a=novo][data-s="1"]').count() == 1, 'slot 2 ocupado, 1 livre')
    pg.click('.hs-slot [data-a=del][data-s="2"]'); pg.wait_for_timeout(300); pg.click('.hs-conf [data-a=s]'); pg.wait_for_timeout(400)
    chk(pg.locator('.hs-slot.on').count() == 0 and pg.evaluate("!localStorage.getItem('dsstacks.historia.2')"), 'apagou o save 2')
    b.close()
finally:
  srv.terminate(); os.remove(os.path.join(proj, '_page.html'))
print('erros de página:', errs[:3]); print('FALHAS:', bad + len(errs)); sys.exit(1 if bad or errs else 0)
