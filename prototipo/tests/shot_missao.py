# Captura da tela de recompensa de missão (animação) para conferência visual.
import sys, os, time, subprocess
from playwright.sync_api import sync_playwright
proj = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
idx = open(os.path.join(proj, 'index.html'), encoding='utf-8').read()
open(os.path.join(proj, '_page.html'), 'w', encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + idx + '</body></html>')
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8779', '--directory', proj], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(.8)
try:
  with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 400, 'height': 850}, has_touch=True); pg = ctx.new_page(); errs = []
    pg.add_init_script("localStorage.setItem('dsstacks.opts', JSON.stringify({musicOn:false,help:false}));")
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('http://localhost:8779/_page.html'); pg.wait_for_timeout(900)
    pg.click('#nav [data-tab=uniao]'); pg.wait_for_timeout(400)
    pg.click('[data-a=novo]'); pg.wait_for_selector('.cin-skip', timeout=5000); pg.click('.cin-skip'); pg.click('.cin-qs button'); pg.wait_for_selector('.hs-svg', timeout=10000); pg.wait_for_timeout(1000)
    pg.evaluate("DSNpc.popup([{i:'moeda',h:'<b>+40</b> pêndulos'},{i:'cristal',h:'<b>+1</b> fragmento dimensional <b>(1)</b>'},{i:'registro',h:'Registro de <b>Brenda Koraveli</b>'}], 'Missão cumprida')")
    shots = os.path.join(proj, 'tests', 'shots'); os.makedirs(shots, exist_ok=True)
    for t in (500, 1200, 2200): pg.wait_for_timeout(t if t == 500 else 700); pg.screenshot(path=shots + '/missao_%d.png' % t)
    print('erros', errs)
    b.close()
finally:
  srv.terminate(); os.path.exists(os.path.join(proj, '_page.html')) and os.remove(os.path.join(proj, '_page.html'))
