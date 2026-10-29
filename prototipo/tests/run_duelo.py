# Duelo do modo história: partida automática (jogador vira bot), resultado, captura e volta ao mapa.
import sys, os, time, subprocess
from playwright.sync_api import sync_playwright
proj = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
idx = open(proj + '/index.html', encoding='utf-8').read()
open(proj + '/_page.html', 'w', encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + idx + '</body></html>')
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8783', '--directory', proj], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(.8)
fails = []; errs = []
def chk(c, m):
    print(('ok   ' if c else 'FALHOU ') + m)
    if not c: fails.append(m)
try:
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_context(viewport={'width': 400, 'height': 850}).new_page()
        pg.add_init_script("localStorage.setItem('dsstacks.opts', JSON.stringify({musicOn:false,help:false,speed:'rapido'}));")
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('http://localhost:8777/_page.html'.replace('8777', '8783')); pg.wait_for_timeout(900)
        pg.click('#nav [data-tab=uniao]'); pg.wait_for_timeout(300); pg.click('[data-a=novo]'); pg.wait_for_selector('.cin-skip'); pg.click('.cin-skip'); pg.click('.cin-qs button'); pg.wait_for_selector('.hs-svg'); pg.wait_for_timeout(1200)
        pg.evaluate("(()=>{const k='dsstacks.historia',o=JSON.parse(localStorage.getItem(k));o.tutorial=1;localStorage.setItem(k,JSON.stringify(o));})()"); pg.reload(); pg.wait_for_timeout(900)
        pg.click('#nav [data-tab=uniao]'); pg.wait_for_timeout(300); pg.click('[data-a=cont]'); pg.wait_for_selector('.hs-svg'); pg.wait_for_timeout(1000)
        sid = pg.evaluate("window.DSHistoria.state().pos")
        pg.mouse.click(1, 1)
        # botão Duelar do painel (jogador humano) abre a montagem do baralho
        pg.evaluate("document.querySelector('.n[data-id=\"%s\"]').dispatchEvent(new PointerEvent('pointerup',{bubbles:true}))" % sid) if False else None
        pg.evaluate("window.DSHistoria.duelar('%s', true)" % sid)
        pg.wait_for_selector('.hcap, .final', timeout=400000)
        chk(pg.evaluate("!!document.querySelector('.final h1')"), 'fim da partida mostra o resultado: ' + pg.evaluate("document.querySelector('.final h1').textContent"))
        venceu = 'Vit' in pg.evaluate("document.querySelector('.final h1').textContent")
        pg.click('.final [data-a=go]'); pg.wait_for_timeout(2500)
        chk(pg.evaluate("!!document.querySelector('.hs-svg')"), 'volta direto ao mapa (sem passar pelo menu)')
        S = pg.evaluate("window.DSHistoria.state()")
        if venceu:
            chk(S['cleared'].get(sid) == 1, 'ponto vencido registrado'); chk(S['pend'] > 0, 'pêndulos ganhos: %d' % S['pend'])
        else:
            chk(not S['cleared'].get(sid), 'derrota não marca o ponto')
        chk(pg.evaluate("window.DSUI.game && true") is not None, 'sem erro de estado')
        chk(not errs, 'erros de página: %s' % errs[:2])
        b.close()
finally:
    srv.terminate(); os.remove(proj + '/_page.html')
print('FALHAS: %d' % len(fails)); sys.exit(1 if fails else 0)
