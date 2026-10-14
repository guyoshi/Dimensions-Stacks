import sys, os, time, subprocess
from playwright.sync_api import sync_playwright
proj = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
idx = open(os.path.join(proj, 'index.html'), encoding='utf-8').read()
open(os.path.join(proj, '_page.html'), 'w', encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + idx + '</body></html>')
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8770', '--directory', proj], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(.8)
try:
  with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 390, 'height': 780}, has_touch=True); pg = ctx.new_page(); errs=[]
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.add_init_script("localStorage.setItem('dsstacks.opts', JSON.stringify({musicOn:false,help:false}));")
    pg.goto('http://localhost:8770/_page.html'); pg.wait_for_timeout(800)
    pg.click('[data-go=setup]'); pg.click('[data-a=start]')
    pg.wait_for_timeout(2500); pg.screenshot(path='tests/shots/drag0.png'); print(pg.evaluate("document.querySelector('.order') ? 'order' : (document.querySelector('.cover button')?'cover':'none')")); pg.wait_for_selector('.order .oc', timeout=15000)
    ids = lambda: pg.evaluate("Array.from(document.querySelectorAll('.order .oc')).map(n=>n.dataset.id).join(',')")
    before = ids(); print('antes ', before)
    # toque: não reordena, mostra info
    pg.click('.order .oc:nth-child(3)'); pg.wait_for_timeout(200)
    print('toque ', ids() == before, pg.evaluate("document.querySelector('.order .info b').textContent"))
    # arrastar carta 1 -> posição 4 (mouse)
    bx = lambda i: pg.eval_on_selector(f'.order .oc:nth-child({i})', "n=>{const r=n.getBoundingClientRect();return [r.left+r.width/2, r.top+r.height/2]}")
    a = bx(1); t = bx(4)
    pg.mouse.move(*a); pg.mouse.down(); pg.mouse.move(a[0]+20, a[1]+5, steps=3); pg.mouse.move(*t, steps=12); pg.screenshot(path='tests/shots/drag_mid.png'); pg.mouse.up(); pg.wait_for_timeout(300)
    after = ids(); print('depois', after)
    L = before.split(','); exp = L[1:4] + [L[0]] + L[4:]
    print('ok mouse', after.split(',') == exp)
    # arrastar por toque (CDP touch)
    cdp = ctx.new_cdp_session(pg); a = bx(4); t = bx(1); cur = ids().split(',')
    def tp(type, x, y): cdp.send('Input.dispatchTouchEvent', {'type': type, 'touchPoints': [{'x': x, 'y': y}] if type != 'touchEnd' else []})
    tp('touchStart', *a); 
    for k in range(1, 13): tp('touchMove', a[0] + (t[0]-a[0])*k/12, a[1] + (t[1]-a[1])*k/12); pg.wait_for_timeout(15)
    tp('touchEnd', 0, 0); pg.wait_for_timeout(300)
    after2 = ids().split(','); print('toque-arrasto', after2, 'ok', after2 == [cur[3]] + cur[:3] + cur[4:])
    pg.click('[data-a=ok]'); pg.wait_for_timeout(500); print('erros', errs)
finally: srv.terminate()
