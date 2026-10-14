# Maestria: emblemas na coleção, ordenação, zoom e perfil.
import sys, os, time, subprocess
from playwright.sync_api import sync_playwright
proj = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
idx = open(os.path.join(proj, 'index.html'), encoding='utf-8').read()
open(os.path.join(proj, '_page.html'), 'w', encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + idx + '</body></html>')
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8769', '--directory', proj], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(.8)
errs = []; bad = 0
def chk(c, m):
    global bad
    print(('ok  ' if c else 'FALHA '), m); bad += 0 if c else 1
try:
  with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 420, 'height': 800})
    pg.add_init_script("localStorage.setItem('dsstacks.opts', JSON.stringify({musicOn:false,help:false}));localStorage.setItem('dsstacks.profile', JSON.stringify({v:1,uid:'DS-ACDEFG',name:'T',fav:[],since:1,t:{},cards:{},ach:{},daily:{},weekly:{},hist:[],mast:{J08:{u:160,w:100,s:60},D01:{u:20,w:6,s:0},D02:{u:12,w:0,s:0},J01:{u:70,w:40,s:10},J02:{u:140,w:80,s:40},J03:{u:1,w:0,s:0}}}));")
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'fonts' not in m.text and 'ERR_' not in m.text else None)
    pg.goto('http://localhost:8769/_page.html'); pg.wait_for_timeout(900)
    pg.click('[data-tab=coll], [data-go=coll]'); pg.wait_for_selector('#cgrid .card')
    emb = lambda: pg.evaluate("[...document.querySelectorAll('#cgrid .card')].filter(c => c.querySelector('.memb svg')).map(c => c.dataset.id + ':' + c.querySelector('.memb svg').getAttribute('class'))")
    e = emb(); print(e)
    chk(len(e) == 5 and 'J08:emb e5' in e and 'D01:emb e2' in e and 'J01:emb e4' in e and 'J02:emb e5' in e and 'D02:emb e1' in e, 'emblemas por nível na coleção (J03 com 1 XP sem emblema)')
    pg.select_option('#csort', 'mast'); pg.wait_for_timeout(250)
    top = pg.evaluate("[...document.querySelectorAll('#cgrid .card')].slice(0, 6).map(c => c.dataset.id)"); chk(top[:5] == ['J08', 'J02', 'J01', 'D01', 'D02'] and top[5] == 'J03', 'ordenar por maestria: %s' % top)
    chk('5 cartas com emblema' in pg.inner_text('#ccount'), 'contagem de emblemas: %s' % pg.inner_text('#ccount'))
    pg.screenshot(path=os.path.join(proj, 'tests', 'shots', 'mast_colecao.png'))
    pg.click('#cgrid .card[data-id=J08]'); pg.wait_for_selector('.mast'); txt = pg.inner_text('.mast'); print(txt.replace('\n', ' | '))
    chk('Dimensional' in txt and '160 usos' in txt and '100 disputas vencidas' in txt and '60 especiais resolvidos' in txt, 'zoom mostra maestria e contadores')
    pg.screenshot(path=os.path.join(proj, 'tests', 'shots', 'mast_zoom.png')); pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
    pg.click('#cgrid .card[data-id=J03]'); pg.wait_for_selector('.mast'); t3 = pg.inner_text('.mast'); chk('ainda sem emblema' in t3 and '1/12 XP' in t3, 'carta sem emblema mostra progresso: ' + t3.replace('\n', ' | ')); pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
    pg.click('#nav [data-tab=prof]'); pg.wait_for_selector('#mastsec .mrow'); rows = pg.evaluate("document.querySelectorAll('#mastsec .mrow').length"); chk(rows == 6, 'perfil lista top de maestria: %d' % rows)
    chk(pg.evaluate("document.querySelectorAll('#mastsec .mlegend svg').length") == 5, 'legenda com 5 emblemas')
    pg.evaluate("document.querySelector('#mastsec').scrollIntoView()"); pg.wait_for_timeout(300); pg.screenshot(path=os.path.join(proj, 'tests', 'shots', 'mast_perfil.png'))
    pg.click('#mastsec .mrow'); pg.wait_for_selector('.mast'); chk(True, 'abre zoom a partir do perfil'); b.close()
finally:
  srv.terminate()
print('erros de página:', errs[:3]); sys.exit(1 if bad or errs else 0)
