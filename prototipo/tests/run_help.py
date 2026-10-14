import sys, os, time, subprocess
from playwright.sync_api import sync_playwright
proj = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
idx = open(os.path.join(proj, 'index.html'), encoding='utf-8').read()
open(os.path.join(proj, '_page.html'), 'w', encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + idx + '</body></html>')
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8773', '--directory', proj], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(.8)
out = os.path.join(proj, 'tests', 'shots'); errs = []
try:
  with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_context(viewport={'width': 390, 'height': 780}).new_page()
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.add_init_script("localStorage.setItem('dsstacks.opts', JSON.stringify({musicOn:false,speed:'rapido'}));")
    pg.goto('http://localhost:8773/_page.html'); pg.wait_for_timeout(900)
    pg.click('[data-top=rules]'); pg.wait_for_timeout(400)
    for i in range(10):
        pg.screenshot(path=f'{out}/guide{i}.png')
        if i < 9: pg.click('.guide [data-a=next]'); pg.wait_for_timeout(350)
    pg.click('.guide [data-a=next]'); pg.wait_for_timeout(300); print('guide fechou', pg.query_selector('.guide') is None)
    # dicas na partida
    pg.click('[data-go=setup]'); pg.click('[data-act=go]'); pg.wait_for_selector('.coach .box', timeout=15000); print('tip order:', pg.inner_text('.coach .ch')); pg.screenshot(path=f'{out}/tip_order.png')
    pg.click('.coach [data-a=ok]'); pg.wait_for_selector('.order .oc'); pg.click('[data-a=ok]')
    pg.wait_for_selector('.coach .box', timeout=40000); print('tip 2:', pg.inner_text('.coach .ch')); assert 'mesa' in pg.inner_text('.coach .ch'); pg.screenshot(path=f'{out}/tip_attr.png')
    print('seen', pg.evaluate("localStorage.getItem('dsstacks.seen')"))
    print('erros', errs)
finally: srv.terminate()
