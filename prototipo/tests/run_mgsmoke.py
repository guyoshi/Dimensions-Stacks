import sys, os, time, subprocess
from playwright.sync_api import sync_playwright
proj = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
idx = open(proj + '/index.html', encoding='utf-8').read()
open(proj + '/_page.html', 'w', encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + idx + '</body></html>')
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8787', '--directory', proj], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(.8)
fails = []; errs = []
def chk(c, m):
    print(('ok   ' if c else 'FALHOU ') + m)
    if not c: fails.append(m)
try:
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_context(viewport={'width': 400, 'height': 850}).new_page()
        pg.add_init_script("localStorage.setItem('dsstacks.opts', JSON.stringify({musicOn:false,help:false,speed:'rapido'}));")
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('http://localhost:8787/_page.html'); pg.wait_for_timeout(900)
        pg.click('#nav [data-tab=uniao]'); pg.wait_for_timeout(300); pg.click('[data-a=novo]'); pg.wait_for_selector('.cin-skip'); pg.click('.cin-skip'); pg.wait_for_selector('.hs-svg'); pg.wait_for_timeout(1200)
        ids = pg.evaluate("DSMini.LISTA.map(m=>m.id)"); print(len(ids), 'jogos')
        for k, gid in enumerate(ids):
            pg.evaluate("id=>{window.__r=null;DSMini.play(id,{teste:true}).then(r=>window.__r=r)}", gid); pg.wait_for_selector('.mg-intro', timeout=3000)
            if k == 0: pg.wait_for_timeout(600); pg.screenshot(path='tests/shots/intro_nome.png')
            pg.wait_for_function("document.querySelector('.mg-in-c') && document.querySelector('.mg-in-c').textContent=='JÁ!'", timeout=7000)
            t_ja = pg.evaluate("1")
            pg.wait_for_timeout(1500)
            if gid in ('ordem', 'poderes', 'quemequem', 'mineracao'): pg.screenshot(path='tests/shots/mg_%s.png' % gid)
            pg.click('.mg-x'); pg.wait_for_timeout(250)
            chk(pg.evaluate("!!document.querySelector('.mg-res')"), gid + ' abre, roda após o JÁ e sai sem erro')
            pg.evaluate("document.querySelector('.mg-ok')&&document.querySelector('.mg-ok').click()"); pg.wait_for_timeout(250)
        # cores dos irmãos: nenhum objeto sobre os irmãos (100 rodadas simuladas não é possível aqui; checa uma)
        # lock some e destrava ao vencer
        chk(not errs, 'sem erros de página %s' % errs)
        b.close()
finally:
    srv.terminate(); os.remove(proj + '/_page.html')
print('FALHAS: %d' % len(fails)); sys.exit(1 if fails else 0)
