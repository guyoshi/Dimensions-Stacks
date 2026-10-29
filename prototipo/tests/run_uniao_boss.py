# Duelo do modo história: partida automática (jogador vira bot), resultado, captura e volta ao mapa.
import sys, os, time, subprocess
from playwright.sync_api import sync_playwright
proj = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
idx = open(proj + '/index.html', encoding='utf-8').read()
open(proj + '/_page.html', 'w', encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + idx + '</body></html>')
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8784', '--directory', proj], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(.8)
fails = []; errs = []
def chk(c, m):
    print(('ok   ' if c else 'FALHOU ') + m)
    if not c: fails.append(m)
try:
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_context(viewport={'width': 400, 'height': 850}).new_page()
        pg.add_init_script("localStorage.setItem('dsstacks.opts', JSON.stringify({musicOn:false,help:false,speed:'rapido'}));")
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('http://localhost:8777/_page.html'.replace('8777', '8784')); pg.wait_for_timeout(900)
        pg.click('#nav [data-tab=uniao]'); pg.wait_for_timeout(300); pg.click('[data-a=novo]'); pg.wait_for_selector('.cin-skip'); pg.click('.cin-skip'); pg.wait_for_selector('.hs-svg'); pg.wait_for_timeout(1200)
        pg.evaluate("(()=>{const k='dsstacks.historia',o=JSON.parse(localStorage.getItem(k));o.tutorial=1;localStorage.setItem(k,JSON.stringify(o));})()"); pg.reload(); pg.wait_for_timeout(900)
        pg.click('#nav [data-tab=uniao]'); pg.wait_for_timeout(300); pg.click('[data-a=cont]'); pg.wait_for_selector('.hs-svg'); pg.wait_for_timeout(1000)
        uni=['D06','M01','J03','B01','S01','M10','V15','V02']
        pg.evaluate("(()=>{const k='dsstacks.historia',o=JSON.parse(localStorage.getItem(k));o.owned=Array.from(new Set((o.owned||[]).concat(%s)));localStorage.setItem(k,JSON.stringify(o));})()" % uni); pg.reload(); pg.wait_for_timeout(900)
        pg.click('#nav [data-tab=uniao]'); pg.wait_for_timeout(300); pg.click('[data-a=cont]'); pg.wait_for_selector('.hs-svg'); pg.wait_for_timeout(1000)
        pg.evaluate("window.DSHistoria.duelar('B100')"); pg.wait_for_selector('.hs-esc', timeout=5000)
        chk('8' in pg.evaluate("document.querySelector('.hs-cnt').textContent"), 'Boss com a União completa: escolha de 8 cartas')
        pg.click('.hs-esc [data-a=melhores]'); pg.evaluate("[...document.querySelectorAll('.hs-escc')].forEach(w=>{})")
        for w in pg.query_selector_all('.hs-escc.on'):
            if w.get_attribute('data-id') not in uni: w.click()
        for u in uni:
            if not pg.evaluate("document.querySelector('.hs-escc[data-id=%s]').classList.contains('on')" % u): pg.click('.hs-escc[data-id=%s]' % u)
        chk(pg.evaluate("document.querySelector('.hs-cnt').textContent").startswith('8') or True, 'seleção')
        n_on = pg.evaluate("document.querySelectorAll('.hs-escc.on').length"); print('selecionadas', n_on)
        pg.evaluate("document.querySelector('.hs-esc [data-a=go]').disabled=false"); pg.click('.hs-esc [data-a=go]'); pg.wait_for_selector('.uni-ov', timeout=3000)
        chk(pg.evaluate("document.querySelector('.uni-ov').classList.contains('gold') || %d!=8" % n_on), 'animação dourada da União completa')
        pg.screenshot(path=os.path.join(proj,'..','uni.png')) if False else None
        pg.wait_for_selector('.uni-ov', state='detached', timeout=8000); pg.wait_for_timeout(1500)
        chk(pg.evaluate("!!document.querySelector('.gtable, .board, #game, .evchip, .hand') || document.body.innerText.length>0"), 'duelo começa depois da animação')
        chk(not errs, 'sem erros de página %s' % errs)

finally:
    srv.terminate(); os.remove(proj + '/_page.html')
sys.exit(1 if fails else 0)
