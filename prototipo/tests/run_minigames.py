# Minigames: cada um abre, aceita toques, termina (abandono ou fim) e entrega resultado; jogos jogáveis por bot terminam sozinhos.
import sys, os, time, subprocess
from playwright.sync_api import sync_playwright
proj = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
idx = open(os.path.join(proj, 'index.html'), encoding='utf-8').read()
open(os.path.join(proj, '_page.html'), 'w', encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + idx + '</body></html>')
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8781', '--directory', proj], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(.8)
errs = []; bad = 0
def chk(c, m):
    global bad
    print(('ok  ' if c else 'FALHA '), m); bad += 0 if c else 1
shots = os.path.join(proj, 'tests', 'shots'); os.makedirs(shots, exist_ok=True)
try:
  with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_context(viewport={'width': 400, 'height': 850}, has_touch=False).new_page()
    pg.add_init_script("localStorage.setItem('dsstacks.opts', JSON.stringify({musicOn:false,help:false}));localStorage.setItem('dsstacks.historia.prefs', JSON.stringify({aberto:true,v2:1}));")
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'fonts' not in m.text and 'ERR_' not in m.text else None)
    pg.goto('http://localhost:8781/_page.html'); pg.wait_for_timeout(900)
    ids = pg.evaluate("window.DSMini.LISTA.map(m=>m.id)"); chk(len(ids) == 17, '17 minigames (10 + 7 por série)')
    def start(i): pg.evaluate("id => { window.__r = null; window.DSMini.play(id, {teste:true}).then(r => window.__r = r); }", i); pg.wait_for_selector('.mg-body', timeout=3000); pg.wait_for_timeout(300)
    def fim(i, msg):
        pg.wait_for_selector('.mg-ok', timeout=4000); pg.click('.mg-ok'); pg.wait_for_function('window.__r', timeout=3000)
        r = pg.evaluate('window.__r'); chk(r['id'] == i and 0 <= r['pct'] <= 1 and r['tier'] in (0, 1, 2, 3), '%s: %s (pct %.2f tier %d +%d)' % (i, msg, r['pct'], r['tier'], r['reward'])); return r
    for i in ids:   # abandono
        start(i); pg.screenshot(path=shots + '/mg_%s.png' % i); pg.click('.mg-x'); fim(i, 'abandono')
    start('elos'); chk(pg.evaluate("document.querySelectorAll('.mg-cell.elo').length") == 6, 'elos: 6 sentidos'); pg.click('.mg-x'); fim('elos', 'abandono')
    start('culpado'); chk(pg.evaluate("document.querySelectorAll('.mg-sus [data-i]').length") == 4 and pg.evaluate("document.querySelectorAll('.mg-pistas li').length") >= 1, 'culpado: 4 suspeitos e pistas')
    for _ in range(3):
        pg.wait_for_selector('.mg-sus'); pg.evaluate("window.__acha = 1"); ok = False
        for i in range(4):
            if pg.query_selector('.mg-ok'): break
            pg.click('.mg-sus [data-i="%d"]' % i, force=True); pg.wait_for_timeout(1000)
            if not pg.query_selector('.mg-sus [data-i="%d"]:disabled' % i, ) : break
        if pg.query_selector('.mg-ok'): break
    pg.click('.mg-x') if not pg.query_selector('.mg-ok') else None; fim('culpado', 'jogado')
    # jogos de toque jogados de verdade
    start('maiormenor')
    for _ in range(3):
        if pg.query_selector('.mg-ok'): break
        pg.click('.mg-porta', force=True); pg.wait_for_timeout(1300)
    fim('maiormenor', 'portas jogadas')
    start('caracoroa'); pg.wait_for_function("document.querySelector('#mq') && document.querySelector('#mq').textContent === 'Sua vez'", timeout=6000)
    chk(pg.evaluate("document.querySelectorAll('.mg-cell.elo').length") == 4, 'sons: 4 instrumentos'); pg.click('.mg-x'); fim('caracoroa', 'sequência')
    start('ordem')
    for _ in range(8):
        if pg.query_selector('.mg-ok'): break
        pg.click('.mg-grid .mg-cell', force=True); pg.wait_for_timeout(750)
    fim('ordem', 'agilidade jogada')
    start('gancho'); pg.wait_for_timeout(1500)
    for _ in range(4): pg.evaluate("[...document.querySelectorAll('.sim')].forEach(b => b.dataset.k && b.click())"); pg.wait_for_timeout(300)
    pg.click('.mg-x'); fim('gancho', 'símbolos')
    start('raspadinha')
    for k in range(3): pg.click('.mg-cell.scr:not(.open)'); pg.wait_for_timeout(120)
    fim('raspadinha', 'jogado')
    start('cofre')
    for _ in range(6):
        for s in range(4): pg.click('[data-s="%d"]' % s)
        pg.click('[data-a=ok]'); pg.wait_for_timeout(60)
        if pg.query_selector('.mg-ok'): break
    fim('cofre', 'jogado')
    start('memoria'); cells = pg.query_selector_all('.mg-cell'); chk(len(cells) == 12, 'memória: 12 cartas'); pg.click('.mg-x'); fim('memoria', 'abandono')
    start('mineracao'); chk(pg.evaluate("!!document.querySelector('canvas.mg-cv')"), 'contágio: canvas'); pg.wait_for_timeout(1500)
    bx = pg.query_selector('canvas.mg-cv').bounding_box(); pg.mouse.move(bx['x'] + 50, bx['y'] + 50); pg.mouse.down(); pg.mouse.move(bx['x'] + 150, bx['y'] + 150); pg.mouse.up(); pg.click('.mg-x'); fim('mineracao', 'contágio')
    # painel de calibragem
    pg.evaluate("window.DSMini.setCfg('cofre', {premios:[0,1,2,3], dif:1.5})"); c = pg.evaluate("window.DSMini.cfg('cofre')"); chk(c['premios'] == [0, 1, 2, 3] and c['dif'] == 1.5, 'calibragem salva')
    st = pg.evaluate("window.DSMini.stats()"); chk(st['cofre']['n'] >= 2, 'registro de resultados: %d' % st['cofre']['n'])
    b.close()
finally:
  srv.terminate(); os.remove(os.path.join(proj, '_page.html'))
print('erros de página:', errs[:3]); print('FALHAS:', bad + len(errs)); sys.exit(1 if bad or errs else 0)
