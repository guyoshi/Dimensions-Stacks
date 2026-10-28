# Baú (animação/sons, pêndulos e cartas) e retomada da trilha do mapa depois de outra trilha.
import sys, os, time, subprocess
from playwright.sync_api import sync_playwright
proj = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
idx = open(os.path.join(proj, 'index.html'), encoding='utf-8').read()
open(os.path.join(proj, '_page.html'), 'w', encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + idx + '</body></html>')
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8779', '--directory', proj], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(.8)
errs = []; bad = 0
def chk(c, m):
    global bad
    print(('ok  ' if c else 'FALHA '), m); bad += 0 if c else 1
shots = os.path.join(proj, 'tests', 'shots'); os.makedirs(shots, exist_ok=True)
try:
  with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_context(viewport={'width': 400, 'height': 850}).new_page()
    pg.add_init_script("localStorage.setItem('dsstacks.opts', JSON.stringify({musicOn:false,help:false}));")
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'fonts' not in m.text and 'ERR_' not in m.text else None)
    pg.goto('http://localhost:8779/_page.html'); pg.wait_for_timeout(900)
    pg.click('#nav [data-tab=uniao]'); pg.wait_for_timeout(400); pg.click('[data-a=novo]'); pg.wait_for_selector('.cin-skip'); pg.click('.cin-skip'); pg.wait_for_selector('.hs-svg'); pg.wait_for_timeout(800)
    for nome, premio in (('pend', {'pend': 12}), ('cartas', {'cartas': ['J01', 'J02', 'J24']})):
        pg.evaluate("p => window.DSHistoria.abrirBau(p)", premio); pg.wait_for_timeout(1300); pg.screenshot(path=shots + '/bau_%s_a.png' % nome)
        pg.wait_for_timeout(2200); pg.screenshot(path=shots + '/bau_%s_b.png' % nome)
        chk(not pg.evaluate("document.querySelector('.bau-ok').hidden"), 'botão Continuar aparece (%s)' % nome)
        pg.click('.bau-ok'); pg.wait_for_timeout(600)
    S = pg.evaluate("window.DSHistoria.state()")
    chk(S['pend'] == 12 and set(S['owned']) == {'J01', 'J02', 'J24'}, 'prêmios entram no estado: %s %s' % (S['pend'], S['owned']))
    # retomada da trilha do mapa
    r = pg.evaluate("""() => { const A = window.DSUI.SND; let t = 100; A.ctx = { get currentTime() { return t; } }; A.histPos = {};
      A.histNodes = { s: { stop() {} }, g: { gain: { cancelScheduledValues() {}, setValueAtTime() {}, linearRampToValueAtTime() {}, value: 1 } }, k: 'mapa', t0: 100, off: 5, dur: 60 };
      t = 130; A.histStop(true); const a = A.histPos.mapa;
      A.histNodes = { s: { stop() {} }, g: { gain: { cancelScheduledValues() {}, setValueAtTime() {}, linearRampToValueAtTime() {}, value: 1 } }, k: 'loja', t0: 130, off: 0, dur: 60 }; A.histStop(true);
      return [a, A.histPos.loja === undefined]; }""")
    chk(r[0] == 35 and r[1], 'mapa guarda onde parou (35s) e a loja não retoma: %s' % r)
    b.close()
finally:
  srv.terminate(); os.remove(os.path.join(proj, '_page.html'))
print('erros de página:', errs[:3]); print('FALHAS:', bad + len(errs)); sys.exit(1 if bad or errs else 0)
