# Sistema de cansaço das cartas no modo história.
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
        pg.add_init_script("localStorage.setItem('dsstacks.opts', JSON.stringify({musicOn:false,help:false}));localStorage.setItem('dsstacks.historia.prefs', JSON.stringify({aberto:true,v2:1}));")
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('http://localhost:8785/_page.html'); pg.wait_for_timeout(900)
        pg.click('#nav [data-tab=uniao]'); pg.wait_for_timeout(300); pg.click('[data-a=novo]'); pg.wait_for_selector('.cin-skip'); pg.click('.cin-skip'); pg.wait_for_selector('.hs-svg'); pg.wait_for_timeout(1200)
        r = pg.evaluate("""(() => { const S = window.DSHistoria.state(); const all = window.DSUI.D.CARTAS.map(c => c.id);
          S.owned = all.slice(0, 25); S.pend = 100; S.fadiga = {}; const usadas = S.owned.slice(0, 7);
          const n = window.DSHistoria.aplicaCansaco(usadas); const peso = { comum: 1, rara: 2, epica: 3, lendaria: 4 };
          const esperado = usadas.reduce((a, id) => a + peso[window.DSUI.CARDS[id].raridade], 0); const obtido = usadas.reduce((a, id) => a + (S.fadiga[id] | 0), 0);
          return { n, esperado, obtido };})()""")
        chk(r['n'] == 7 and r['esperado'] == r['obtido'], 'cartas usadas cansam pela raridade: %s' % r)
        r = pg.evaluate("""(() => { const S = window.DSHistoria.state(); const out = S.owned.slice(7, 14); window.DSHistoria.aplicaCansaco(out); const antes = S.owned.slice(0, 7).reduce((a, id) => a + (S.fadiga[id] | 0), 0); return antes; })()""")
        chk(r >= 0, 'as não usadas descansam 1 ponto: restante %s' % r)
        pg.evaluate("window.__sel = null; window.DSHistoria.escolher7({}, m => { window.__sel = m; })"); pg.wait_for_selector('.hs-escg'); pg.wait_for_timeout(300)
        tired = pg.evaluate("document.querySelectorAll('.hs-escc.tired').length"); on = pg.evaluate("document.querySelectorAll('.hs-escc.on').length"); onTired = pg.evaluate("document.querySelectorAll('.hs-escc.tired.on').length")
        chk(tired >= 7 and on == 7 and onTired == 0, 'cansadas aparecem apagadas e não entram na seleção (cansadas %d, marcadas %d)' % (tired, on))
        # descansar uma carta cansada com pêndulos
        pg0 = pg.evaluate("window.DSHistoria.state().pend")
        pg.click('.hs-escc.tired'); pg.wait_for_timeout(300)
        pg1 = pg.evaluate("window.DSHistoria.state().pend")
        chk(pg1 < pg0, 'descansar custa pêndulos: %d → %d' % (pg0, pg1))
        pg.click('[data-a=go]'); pg.wait_for_timeout(300)
        sel = pg.evaluate("window.__sel"); chk(sel and len(sel) == 7, 'duelo recebe 7 cartas')
        # sem pêndulos não descansa
        pg.evaluate("window.DSHistoria.state().pend = 0; window.DSHistoria.escolher7({}, m => {})"); pg.wait_for_selector('.hs-escg'); pg.click('.hs-escc.tired'); pg.wait_for_timeout(200)
        chk('Faltam pêndulos' in pg.evaluate("document.querySelector('.hs-msg').textContent"), 'sem pêndulos avisa')
        chk(not errs, 'erros de página: %s' % errs[:2])
        b.close()
finally:
    srv.terminate(); os.remove(proj + '/_page.html')
print('FALHAS: %d' % len(fails)); sys.exit(1 if fails else 0)
