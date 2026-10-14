# Coleção: busca por nome/série/especial, filtro por atributo mais forte e ordenações.
import sys, os, time, subprocess
from playwright.sync_api import sync_playwright
proj = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
idx = open(os.path.join(proj, 'index.html'), encoding='utf-8').read()
open(os.path.join(proj, '_page.html'), 'w', encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + idx + '</body></html>')
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8768', '--directory', proj], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(.8)
import unicodedata
k = lambda x: ''.join(c for c in unicodedata.normalize('NFD', x.lower()) if not unicodedata.combining(c)).replace("'", '')
errs = []; bad = 0
def chk(c, m):
    global bad
    print(('ok  ' if c else 'FALHA '), m); bad += 0 if c else 1
try:
  with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 420, 'height': 800})
    pg.add_init_script("localStorage.setItem('dsstacks.opts', JSON.stringify({musicOn:false,help:false}));")
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'fonts' not in m.text and 'ERR_' not in m.text else None)
    pg.goto('http://localhost:8768/_page.html'); pg.wait_for_timeout(900)
    pg.click('[data-tab=coll], [data-go=coll]'); pg.wait_for_selector('#cgrid .card')
    n = lambda: pg.evaluate("document.querySelectorAll('#cgrid .card').length")
    names = lambda: pg.evaluate("[...document.querySelectorAll('#cgrid .card')].map(c => c.dataset.id)")
    chk(n() == 102, "todas as 102 cartas")
    pg.fill('#cq', 'kaelina'); pg.wait_for_timeout(300); chk(names() == ['J08'], 'busca por nome (Kaelina → J08): %s' % names())
    pg.fill('#cq', 'DIARIO sobrenatural'); pg.wait_for_timeout(300); chk(n() == 18 and all(x.startswith('D') for x in names()), 'busca sem acento/caixa por série: %d' % n())
    pg.fill('#cq', 'buraco negro'); pg.wait_for_timeout(300); chk(0 < n() < 20, 'busca por texto de especial (buraco negro): %d cartas' % n())
    pg.fill('#cq', 'zzzz'); pg.wait_for_timeout(300); chk(n() == 0 and 'Nenhuma carta encontrada' in pg.inner_text('#cgrid'), 'sem resultados mostra aviso')
    pg.fill('#cq', ''); pg.wait_for_timeout(300)
    pg.select_option('#csort', 'soma'); pg.wait_for_timeout(200)
    sums = pg.evaluate("[...document.querySelectorAll('#cgrid .card')].map(c => { const st = DSUI.CARDS[c.dataset.id].stats; return st.pod + st.def + st.int + st.vel; })")
    chk(sums == sorted(sums, reverse=True), 'ordenar por força total (decrescente)')
    pg.select_option('#csort', 'int'); pg.wait_for_timeout(200)
    v = pg.evaluate("[...document.querySelectorAll('#cgrid .card')].map(c => DSUI.CARDS[c.dataset.id].stats.int)"); chk(v == sorted(v, reverse=True), 'ordenar por Inteligência')
    pg.select_option('#csort', 'nome'); pg.wait_for_timeout(200)
    nm = pg.evaluate("[...document.querySelectorAll('#cgrid .card')].map(c => DSUI.CARDS[c.dataset.id].nome)"); chk([k(x) for x in nm] == sorted(k(x) for x in nm), 'ordenar por nome')
    pg.select_option('#csort', 'num'); pg.click('#cattr [data-a=vel]'); pg.wait_for_timeout(200)
    chk(pg.evaluate("[...document.querySelectorAll('#cgrid .card')].every(c => { const s = DSUI.CARDS[c.dataset.id].stats; return s.vel >= Math.max(s.pod, s.def, s.int); })") and n() > 0, 'filtro por maior atributo = Velocidade: %d cartas' % n())
    pg.screenshot(path=os.path.join(proj, 'tests', 'shots', 'colecao_busca.png')); b.close()
finally:
  srv.terminate()
print('erros de página:', errs[:3]); sys.exit(1 if bad or errs else 0)
