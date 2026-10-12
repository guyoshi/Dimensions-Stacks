import sys, os, time, subprocess
from playwright.sync_api import sync_playwright
proj = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
idx = open(os.path.join(proj, 'index.html'), encoding='utf-8').read()
open(os.path.join(proj, '_page.html'), 'w', encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + idx + '</body></html>')
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8775', '--directory', proj], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(.8)
out = os.path.join(proj, 'tests', 'shots'); errs = []
cur = "pg.evaluate(\"(()=>{const t=document.querySelector('.gtrack');return Math.round(t.scrollLeft/t.clientWidth)})()\")"
try:
  with sync_playwright() as p:
    b = p.chromium.launch()
    # PC: mouse drag + botões + teclado
    pg = b.new_context(viewport={'width': 1100, 'height': 800}).new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.add_init_script("localStorage.setItem('dsstacks.opts', JSON.stringify({musicOn:false,speed:'rapido'}));")
    pg.goto('http://localhost:8775/_page.html'); pg.wait_for_timeout(900); pg.click('[data-top=rules]'); pg.wait_for_timeout(400)
    box = pg.query_selector('.gtrack').bounding_box(); y = box['y'] + 150; x0 = box['x'] + box['width'] * .8
    pg.mouse.move(x0, y); pg.mouse.down(); pg.mouse.move(x0 - 120, y, steps=6); pg.mouse.move(x0 - 300, y, steps=6); pg.mouse.up(); pg.wait_for_timeout(700)
    print('PC apos arrastar mouse ->', eval(cur))
    pg.click('.guide [data-a=next]'); pg.wait_for_timeout(600); print('PC apos Proximo ->', eval(cur))
    pg.keyboard.press('ArrowLeft'); pg.wait_for_timeout(600); print('PC apos seta esquerda ->', eval(cur))
    pg.click('.gdots i[data-k="5"]'); pg.wait_for_timeout(700); print('PC apos ponto 5 ->', eval(cur), 'botoes visiveis:', pg.is_visible('.guide [data-a=prev]'), pg.is_visible('.guide [data-a=next]'))
    # celular: toque, sem botões prev/next, gesto de scroll
    ctx = b.new_context(viewport={'width': 390, 'height': 780}, has_touch=True, is_mobile=True, device_scale_factor=2); pm = ctx.new_page(); pm.on('pageerror', lambda e: errs.append(str(e)))
    pm.add_init_script("localStorage.setItem('dsstacks.opts', JSON.stringify({musicOn:false,speed:'rapido'}));")
    pm.goto('http://localhost:8775/_page.html'); pm.wait_for_timeout(900); pm.click('[data-top=rules]'); pm.wait_for_timeout(400)
    print('cel botoes visiveis (prev,next):', pm.is_visible('.guide [data-a=prev]'), pm.is_visible('.guide [data-a=next]'), 'regras completas:', pm.is_visible('.guide [data-a=full]'))
    cdp = ctx.new_cdp_session(pm)
    def swipe(x0, x1, y=400, steps=12):
        cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x0, 'y': y}]})
        for k in range(1, steps + 1):
            cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': x0 + (x1 - x0) * k / steps, 'y': y}]}); pm.wait_for_timeout(16)
        cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []}); pm.wait_for_timeout(700)
    for k in range(3):
        swipe(330, 80)
    cur2 = cur.replace('pg.', 'pm.'); print('cel apos 3 gestos ->', eval(cur2))
    pm.screenshot(path=f'{out}/carousel_cel.png')
    for k in range(6):
        swipe(330, 80)
    print('cel final ->', eval(cur2), 'botao concluir visivel:', pm.is_visible('.guide [data-a=next]'), pm.inner_text('.guide [data-a=next]')); pm.screenshot(path=f'{out}/carousel_cel_fim.png')
    pm.click('.guide [data-a=next]'); pm.wait_for_timeout(300); print('fechou:', pm.query_selector('.guide') is None)
    print('erros', errs)
finally: srv.terminate()
