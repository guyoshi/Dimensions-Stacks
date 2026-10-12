import sys, os, time, subprocess
from playwright.sync_api import sync_playwright
proj = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
idx = open(os.path.join(proj, 'index.html'), encoding='utf-8').read()
open(os.path.join(proj, '_page.html'), 'w', encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + idx + '</body></html>')
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8777', '--directory', proj], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(.8)
errs = []
try:
  with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_context(viewport={'width': 390, 'height': 780}).new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.add_init_script("localStorage.setItem('dsstacks.opts', JSON.stringify({musicOn:false,speed:'rapido'}));")
    pg.goto('http://localhost:8777/_page.html'); pg.wait_for_timeout(900)
    bb = pg.query_selector('.playbig').bounding_box(); pg.mouse.move(bb['x'] + 40, bb['y'] + 20); pg.mouse.down(); pg.wait_for_timeout(150)
    print('pressing:', pg.evaluate("(()=>{const e=document.querySelector('.playbig');return [e.classList.contains('pressing'), getComputedStyle(e).transform]})()"))
    pg.mouse.up(); pg.wait_for_timeout(80); print('depois do clique (pode ter mudado de tela):', errs)
    pg.goto('http://localhost:8777/_page.html'); pg.wait_for_timeout(900)
    pg.click('[data-top=options]') if pg.query_selector('[data-top=options]') else pg.click('.topbar .ibtn >> nth=1')
    pg.wait_for_selector('[data-sounds]'); print('opcoes tem lista de sons inline?', pg.query_selector('.slots') is not None, '| texto "substitu" nas opcoes:', 'substitu' in pg.inner_text('.modal').lower())
    pg.click('[data-sounds]'); pg.wait_for_selector('.slots'); t = pg.inner_text('.modal'); print('lista:', t.split('\n')[0], '| itens', len(pg.query_selector_all('.slots button')), '| "substitu":', 'substitu' in t.lower(), '| "embutir":', 'embutir' in t.lower())
    pg.screenshot(path=os.path.join(proj, 'tests/shots/sons.png'))
    pg.click('.slots button >> nth=0'); pg.wait_for_timeout(100); print('pop:', pg.evaluate("document.querySelector('.slots button').classList.contains('pop')"))
    pg.click('[data-back]'); pg.wait_for_selector('[data-sounds]'); print('voltou para opcoes ok')
    print('erros', errs)
finally: srv.terminate()
