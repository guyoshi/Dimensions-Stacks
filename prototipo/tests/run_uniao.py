# Chamado da União (Estírio): regras da simulação e jogo aberto em Normal e Hard.
import sys, os, time, subprocess
from playwright.sync_api import sync_playwright
proj = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
idx = open(os.path.join(proj, 'index.html'), encoding='utf-8').read()
open(os.path.join(proj, '_page.html'), 'w', encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + idx + '</body></html>')
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8786', '--directory', proj], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(.8)
bad = 0; errs = []
def chk(c, m):
    global bad
    print(('ok  ' if c else 'FALHA '), m, flush=True); bad += 0 if c else 1
try:
  with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_context(viewport={'width': 400, 'height': 850}).new_page()
    pg.route('**/fonts.g*/**', lambda r: r.abort()); pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.add_init_script("localStorage.setItem('dsstacks.opts', JSON.stringify({musicOn:false,help:false}));")
    pg.goto('http://localhost:8786/_page.html', wait_until='commit'); pg.wait_for_timeout(1500)
    r = pg.evaluate("""() => { const U = window.DSMini._uniao, out = {};
      let S = U(1, Math.random, {hard:false}); out.est = !!S.est && S.est.x === 190;
      S.moveEst(100, 100); for (let i = 0; i < 6; i++) S.step(.05); out.moveu = S.est.x < 190 && S.est.x > 100;   // velocidade limitada
      S = U(1, Math.random, {hard:false}); S.es.push({ x: S.est.x + 5, y: S.est.y, tp: 'n', r: 9, hp: 1, vb: 50, v: 50, ae: true }); S.step(.05); out.perdeu = S.perdeu && S.done && S.resultado() <= .3;
      S = U(1, Math.random, {hard:true}); for (let i = 0; i < 400 && S.wave < 3; i++) S.step(.05); out.hardTodos = S.es.length > 0 && S.es.every(e => e.ae);
      S = U(1, Math.random, {hard:false}); for (let i = 0; i < 700 && S.wave < 5; i++) S.step(.05); out.normalMisto = S.es.some(e => e.ae) && S.es.some(e => !e.ae);
      S = U(1, Math.random, {hard:false}); out.vitoria = (S.perdeu = false, S.resultado() >= .99);
      return out; }""")
    chk(r['est'], 'estírio existe no centro'); chk(r['moveu'], 'estírio anda com velocidade limitada'); chk(r['perdeu'], 'inimigo tocando o estírio encerra (máx 30%)')
    chk(r['hardTodos'], 'hard: todos os inimigos vão ao estírio'); chk(r['normalMisto'], 'normal: prioridade dividida entre heróis e estírio'); chk(r['vitoria'], 'sobreviver com 8 heróis = 100%')
    for hard in (False, True):
        pg.evaluate("(h) => { window.__r = null; window.DSMini.play('formacao', {teste:true, hardUnlocked:true}).then(r => window.__r = r); }", hard)
        pg.wait_for_selector('.mg-modepick', timeout=4000)
        if hard: pg.click('[data-mode=hard]')
        pg.click('.mg-begin'); pg.wait_for_selector('canvas.mg-cv', timeout=9000); pg.wait_for_timeout(2500)
        pg.click('.mg-x'); pg.wait_for_selector('.mg-ok', timeout=3000); pg.click('.mg-ok'); pg.wait_for_function('window.__r', timeout=3000)
        chk(True, 'jogo abre e fecha em ' + ('Hard' if hard else 'Normal'))
    chk(not errs, 'sem erros de página %s' % errs[:3])
finally:
  srv.kill()
  try: os.remove(os.path.join(proj, '_page.html'))
  except Exception: pass
print('FALHAS:', bad)
