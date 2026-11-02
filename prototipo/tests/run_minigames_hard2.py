# Minigames Hard (fases 3-5): Fechadura 5 encaixes, Constelação 12 quadrados, Maré, Chama e Gelo 4 pistas; demais jogos rodam o Hard sem erros.
import sys, os, time, subprocess
from playwright.sync_api import sync_playwright
proj = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
idx = open(os.path.join(proj, 'index.html'), encoding='utf-8').read()
open(os.path.join(proj, '_page.html'), 'w', encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + idx + '</body></html>')
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8785', '--directory', proj], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(.8)
bad = 0; errs = []
def chk(c, m):
    global bad
    print(('ok  ' if c else 'FALHA '), m, flush=True); bad += 0 if c else 1
try:
  with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_context(viewport={'width': 400, 'height': 850}).new_page()
    pg.route('**/fonts.g*/**', lambda r: r.abort())
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.add_init_script("localStorage.setItem('dsstacks.opts', JSON.stringify({musicOn:false,help:false}));")
    pg.goto('http://localhost:8785/_page.html', wait_until='commit'); pg.wait_for_timeout(1500)
    def abre(i, hard=True):
        pg.evaluate("(id) => { window.__r = null; window.DSMini.play(id, {teste:true, hardUnlocked:true}).then(r => window.__r = r); }", i)
        pg.wait_for_selector('.mg-modepick', timeout=4000)
        if hard: pg.click('[data-mode=hard]')
        pg.click('.mg-begin'); pg.wait_for_selector('.mg-in-c', timeout=3000)
    def sai():
        pg.click('.mg-x'); pg.wait_for_selector('.mg-ok', timeout=3000); pg.click('.mg-ok'); pg.wait_for_function('window.__r', timeout=3000); return pg.evaluate('window.__r')
    abre('cofre'); pg.wait_for_selector('.cf-slot', timeout=9000)
    chk(pg.evaluate("document.querySelectorAll('.cf-slot').length") == 5 and pg.evaluate("document.querySelectorAll('.cf-n').length") == 5, 'fechadura: 5 encaixes numerados no Hard')
    chk('/7' in pg.inner_text('.cf-top'), 'fechadura: 7 tentativas no Hard')
    for k in range(5): pg.click('.cf-runa[data-s="%d"]' % (k % 6))
    pg.click('[data-a=ok]'); pg.wait_for_selector('.cf-tent', timeout=2000)
    chk(pg.evaluate("document.querySelectorAll('.cf-tent .cf-mini').length") == 5, 'fechadura: tentativa listada com 5 símbolos')
    chk(pg.evaluate("document.querySelector('.cf-hist').getBoundingClientRect().height") >= 90, 'fechadura: lista de tentativas com altura folgada')
    pg.screenshot(path=os.path.join(proj, 'tests', 'shots', 'mg_cofre_hard.png')); r = sai(); chk(r['hard'], 'fechadura: resultado hard')
    abre('cofre', False); pg.wait_for_selector('.cf-slot', timeout=9000); chk(pg.evaluate("document.querySelectorAll('.cf-slot').length") == 4 and '/6' in pg.inner_text('.cf-top'), 'fechadura normal: 4 encaixes e 6 tentativas'); sai()
    abre('gancho'); pg.wait_for_selector('.mg-cell.sim', timeout=9000); chk(pg.evaluate("document.querySelectorAll('.mg-cell.sim').length") == 12, 'constelação: 12 quadrados'); sai()
    abre('ritmo'); pg.wait_for_selector('[data-l]', timeout=9000); chk(pg.evaluate("document.querySelectorAll('[data-l]').length") == 4, 'maré, chama e gelo: 4 pistas'); pg.wait_for_timeout(1500); sai()
    for i in ['mineracao', 'asteroides', 'cacapendulo', 'elos', 'luas', 'poderes']:
        abre(i); pg.wait_for_selector('canvas.mg-cv', timeout=9000); pg.wait_for_timeout(2500); sai(); chk(True, i + ': Hard roda sem travar')
    abre('ordem'); pg.wait_for_selector('.mg-dc', timeout=9000); sai()
    chk(not errs, 'sem erros de página %s' % errs[:3])
finally:
  srv.kill()
  try: os.remove(os.path.join(proj, '_page.html'))
  except Exception: pass
print('FALHAS:', bad)
