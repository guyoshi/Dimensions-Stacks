import sys, os, time, subprocess
from playwright.sync_api import sync_playwright
proj = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
idx = open(os.path.join(proj, 'index.html'), encoding='utf-8').read()
open(os.path.join(proj, '_page.html'), 'w', encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + idx + '</body></html>')
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8779', '--directory', proj], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(.8)
errs = []
try:
  with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_context(viewport={'width': 390, 'height': 780}, has_touch=True, is_mobile=True, device_scale_factor=2).new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.add_init_script("localStorage.setItem('dsstacks.opts', JSON.stringify({musicOn:false,speed:'rapido',help:false}));")
    pg.goto('http://localhost:8779/_page.html'); pg.wait_for_timeout(900)
    pg.click('[data-go=setup]'); pg.click('[data-act=go]'); pg.wait_for_selector('.order .oc', timeout=15000); pg.click('.order [data-a=best]'); pg.click('.order [data-a=ok]')
    pg.wait_for_selector('#dock:not([hidden]) .attrbtn', timeout=40000); pg.click('#dock .attrbtn >> nth=0')
    pg.wait_for_selector('.slot .card.up', timeout=40000); pg.wait_for_timeout(300)
    cards = pg.query_selector_all('.slot .card.up'); print('cartas viradas na mesa:', len(cards))
    # a do oponente
    opp = [c for c in cards if not pg.evaluate("c => c.closest('.slot').classList.contains('me') || c.closest('.slot').dataset.me", c)]
    cards[-1].click(); pg.wait_for_selector('.zoomwrap', timeout=3000); print('zoom aberto:', pg.inner_text('.zoomwrap h2'), '| navegacao ◀▶:', pg.query_selector('.zoomnav') is not None)
    pg.screenshot(path=os.path.join(proj, 'tests/shots/tablezoom.png'))
    pg.mouse.click(5, 5); pg.wait_for_timeout(400); print('fechou:', pg.query_selector('.zoomwrap') is None)
    print('erros', errs)
finally: srv.terminate()
