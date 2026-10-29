import sys, os, time, subprocess
from playwright.sync_api import sync_playwright
proj = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
idx = open(proj + '/index.html', encoding='utf-8').read()
open(proj + '/_page.html', 'w', encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + idx + '</body></html>')
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8785', '--directory', proj], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(.8)
fails = []; errs = []
def chk(c, m):
    print(('ok   ' if c else 'FALHOU ') + m)
    if not c: fails.append(m)
try:
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_context(viewport={'width': 400, 'height': 850}).new_page()
        pg.add_init_script("localStorage.setItem('dsstacks.opts', JSON.stringify({musicOn:false,help:false,speed:'rapido'}));")
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('http://localhost:8785/_page.html'); pg.wait_for_timeout(900)
        pg.click('#nav [data-tab=uniao]'); pg.wait_for_timeout(300); pg.click('[data-a=novo]'); pg.wait_for_selector('.cin-skip'); pg.click('.cin-skip'); pg.click('.cin-qs button'); pg.wait_for_selector('.hs-svg'); pg.wait_for_timeout(1200)
        ids = pg.evaluate("window.DS_CARTAS_IDS || DSUI.D.CARTAS.filter(x=>!x.uniao).slice(0,30).map(x=>x.id)")
        pg.evaluate("(()=>{const k='dsstacks.historia',o=JSON.parse(localStorage.getItem(k));o.tutorial=1;o.pend=1000;o.owned=%s;o.fadiga={%s:3,%s:1};localStorage.setItem(k,JSON.stringify(o));})()" % (ids, '"'+ids[0]+'"', '"'+ids[1]+'"')); pg.reload(); pg.wait_for_timeout(900)
        pg.click('#nav [data-tab=uniao]'); pg.wait_for_timeout(300); pg.click('[data-a=cont]'); pg.wait_for_selector('.hs-svg'); pg.wait_for_timeout(1000)
        pg.click('.hs-pill[data-a=cartas]'); pg.wait_for_selector('.hs-mc')
        chk(pg.evaluate("document.querySelectorAll('.hs-mc .hs-escc.tired').length") == 2, 'menu mostra 2 cartas cansadas')
        pg.click('.hs-mc .hs-escc.tired'); pg.wait_for_selector('.dsc-conf'); pg.click('.dsc-conf [data-a=s]'); pg.wait_for_timeout(300)
        chk(pg.evaluate("document.querySelectorAll('.hs-mc .hs-escc.tired').length") == 1 and pg.evaluate("window.DSHistoria.state().pend") < 1000, 'tocar descansa e cobra')
        pg.click('.hs-mc [data-a=todas]'); pg.wait_for_selector('.dsc-conf'); pg.click('.dsc-conf [data-a=s]'); pg.wait_for_timeout(300)
        chk(pg.evaluate("document.querySelectorAll('.hs-mc .hs-escc.tired').length") == 0, 'descansar todas')
        pg.click('.hs-mc [data-a=x]'); pg.wait_for_timeout(300)
        pg.evaluate("window.DSHistoria.loja('L3')"); pg.wait_for_selector('.hs-loja .hs-item')
        n = pg.evaluate("document.querySelectorAll('.hs-loja .hs-item').length"); chk(n >= 5, 'loja tem estoque: %d' % n)
        antes = pg.evaluate("window.DSHistoria.state().owned.length"); pg.click('.hs-loja .hs-item'); pg.wait_for_timeout(200)
        chk(pg.evaluate("window.DSHistoria.state().owned.length") == antes + 1, 'comprar adiciona a carta')
        chk(not errs, 'sem erros %s' % errs)
finally:
    srv.terminate(); os.remove(proj + '/_page.html')
sys.exit(1 if fails else 0)
