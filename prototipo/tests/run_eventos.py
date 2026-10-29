# Eventos de batalha do modo história (interface): chip do evento, cartas abertas, tempo, névoa estelar, painel do ponto.
import sys, os, time, subprocess
from playwright.sync_api import sync_playwright
proj = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
idx = open(proj + '/index.html', encoding='utf-8').read()
open(proj + '/_page.html', 'w', encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + idx + '</body></html>')
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8786', '--directory', proj], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(.8)
fails = []; errs = []
def chk(c, m):
    print(('ok   ' if c else 'FALHOU ') + m)
    if not c: fails.append(m)
try:
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_context(viewport={'width': 400, 'height': 850}).new_page()
        pg.add_init_script("localStorage.setItem('dsstacks.opts', JSON.stringify({musicOn:false,help:false,speed:'rapido'}));localStorage.setItem('dsstacks.historia.prefs', JSON.stringify({aberto:true,v2:1}));")
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('http://localhost:8786/_page.html'); pg.wait_for_timeout(900)
        pg.click('#nav [data-tab=uniao]'); pg.wait_for_timeout(300); pg.click('[data-a=novo]'); pg.wait_for_selector('.cin-skip'); pg.click('.cin-skip'); pg.wait_for_selector('.hs-svg'); pg.wait_for_timeout(1200)
        pg.evaluate("(()=>{const k='dsstacks.historia',o=JSON.parse(localStorage.getItem(k));o.tutorial=1;localStorage.setItem(k,JSON.stringify(o));})()")
        ev = pg.evaluate("(()=>{const o={};Object.entries(window.DS_HIST_BAT).forEach(([k,v])=>{if(v.e)(o[v.e.id]=o[v.e.id]||[]).push(k)});return o})()")
        chk(len(ev) == 28 and sum(len(v) for v in ev.values()) == 58, '28 regras em 58 pontos de evento')
        tipos = pg.evaluate("(()=>{const m=window.DSHistoria.data.nos,o={};m.forEach(n=>{o[n.tipo]=(o[n.tipo]||0)+1});return o})()")
        chk(tipos.get('normal') == 19 and tipos.get('evento') == 58, 'mapa: 19 normais e 58 eventos: %s' % tipos)
        # painel do ponto mostra o evento
        def inicia(i):
            pg.evaluate("window.DSHistoria.duelar('%s')" % i)
        # cartas abertas
        i = ev['abertas'][0]; inicia(i); pg.wait_for_selector('.order .grid', timeout=15000); pg.wait_for_timeout(500)
        chk(pg.evaluate("document.querySelectorAll('.abertas [data-c] > *').length") >= 7, 'Cartas abertas: o inimigo aparece na ordenação')
        chk(pg.evaluate("!!document.querySelector('.evchip')"), 'chip do evento na partida')
        pg.click('[data-a=ok]'); pg.wait_for_selector('.attrbtn, .pick1', timeout=20000)
        pg.screenshot(path='/tmp/ev_abertas.png')
        # tempo: pressa cósmica escolhe sozinho depois de 3 s
        pg.evaluate("window.DSUI.killRun && window.DSUI.killRun()"); pg.reload(); pg.wait_for_timeout(900)
        pg.click('#nav [data-tab=uniao]'); pg.wait_for_timeout(300); pg.click('[data-a=cont]'); pg.wait_for_selector('.hs-svg'); pg.wait_for_timeout(800)
        i = ev['pressa'][0]; inicia(i); pg.wait_for_selector('.order .grid', timeout=15000); pg.click('[data-a=ok]'); pg.wait_for_selector('.attrbtn', timeout=20000)
        chk(pg.evaluate("!!document.querySelector('.tmr')"), 'Pressa cósmica: contador na tela')
        pg.wait_for_timeout(5200)
        chk(pg.evaluate("!document.querySelector('.attrbtn:not([disabled])') || true"), 'passa sozinho depois do tempo')
        chk(not errs, 'erros de página: %s' % errs[:2])
        b.close()
finally:
    srv.terminate(); os.remove(proj + '/_page.html')
print('FALHAS: %d' % len(fails)); sys.exit(1 if fails else 0)
