# Minigames Hard (fase 1-2): estrutura de cada modo Hard e música do menu parando antes do 3-2-1.
import sys, os, time, subprocess
from playwright.sync_api import sync_playwright
proj = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
idx = open(os.path.join(proj, 'index.html'), encoding='utf-8').read()
open(os.path.join(proj, '_page.html'), 'w', encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + idx + '</body></html>')
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8784', '--directory', proj], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(.8)
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
    pg.goto('http://localhost:8784/_page.html', wait_until='commit'); pg.wait_for_timeout(1500)
    def abre(i, hard):
        pg.evaluate("([id,h]) => { window.__r = null; window.DSMini.play(id, {teste:true, hardUnlocked:true}).then(r => window.__r = r); }", [i, hard])
        pg.wait_for_selector('.mg-modepick', timeout=4000)
        chk(pg.evaluate("document.querySelectorAll('[data-mode]').length") == 2, i + ': abas Normal/Hard')
        if hard: pg.click('[data-mode=hard]')
        pg.click('.mg-begin'); pg.wait_for_selector('.mg-in-c', timeout=3000)
    def sai():
        pg.click('.mg-x'); pg.wait_for_selector('.mg-ok', timeout=3000); pg.click('.mg-ok'); pg.wait_for_function('window.__r', timeout=3000); return pg.evaluate('window.__r')
    abre('maiormenor', True); pg.wait_for_selector('.mg-porta', timeout=9000)
    chk(pg.evaluate("document.querySelectorAll('.mg-porta').length") == 4, 'portais: 4 portais no Hard'); r = sai(); chk(r['hard'] is True, 'portais: resultado marcado hard')
    abre('memoria', True); pg.wait_for_selector('.mg-cell', timeout=9000); chk(pg.evaluate("document.querySelectorAll('.mg-cell').length") == 16, 'ecos: 16 cartas'); sai()
    abre('quemequem', True); pg.wait_for_selector('#tl', timeout=9000); chk('/12' in pg.inner_text('#mq'), 'fragmentos: 12 cartas, tempo total'); sai()
    abre('ordem', True); pg.wait_for_selector('.mg-dc', timeout=9000); chk(pg.evaluate("document.querySelectorAll('.mg-dc').length") == 5, 'dança: 5 cartas na 1ª rodada do Hard'); sai()
    abre('raspadinha', True); pg.wait_for_selector('.mg-cell.scr', timeout=9000); chk(pg.evaluate("document.querySelectorAll('.mg-cell.scr').length") == 5, 'relâmpago: 5 cartas'); sai()
    abre('caracoroa', True); pg.wait_for_selector('#tmb', timeout=9000); chk(True, 'eco das notas: barra de tempo no Hard')
    pg.wait_for_function("document.querySelector('#mq').textContent.includes('Sua vez')", timeout=20000); chk(True, 'eco das notas: sequência de 3 tocou'); sai()
    abre('culpado', True); pg.wait_for_selector('.mg-olho', timeout=9000); pg.wait_for_timeout(2300)
    chk(pg.evaluate("document.querySelectorAll('.mg-olho.on,.mg-olho.tre,.mg-olho.red').length") >= 3, 'vigília: 3 ou mais olhos abertos no início do Hard'); sai()
    # Normal da dança: 3 cartas
    abre('ordem', False); pg.wait_for_selector('.mg-dc', timeout=9000); chk(pg.evaluate("document.querySelectorAll('.mg-dc').length") == 3, 'dança normal: começa com 3'); sai()
    # música do menu para
    pg.evaluate("window.DSUI.SND.init(); window.DSUI.SND.musicOn = true; try{window.DSUI.SND.startMenuMusic()}catch(e){}")
    abre('memoria', False); chk(pg.evaluate("!window.DSUI.SND.musicNodes"), 'menu: música do menu parada antes do 3-2-1'); sai()
    chk(not errs, 'sem erros de página %s' % errs[:2])
finally:
  srv.kill()
  try: os.remove(os.path.join(proj, '_page.html'))
  except Exception: pass
print('FALHAS:', bad)
