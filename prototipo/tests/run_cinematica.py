# Cinemática inicial + mapa no escuro: texto digitado, avanço por toque, pular, fade do preto, só perto do boneco visível.
import sys, os, time, subprocess
from playwright.sync_api import sync_playwright
proj = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
idx = open(os.path.join(proj, 'index.html'), encoding='utf-8').read()
open(os.path.join(proj, '_page.html'), 'w', encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + idx + '</body></html>')
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8778', '--directory', proj], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(.8)
errs = []; bad = 0
def chk(c, m):
    global bad
    print(('ok  ' if c else 'FALHA '), m); bad += 0 if c else 1
shots = os.path.join(proj, 'tests', 'shots'); os.makedirs(shots, exist_ok=True)
try:
  with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_context(viewport={'width': 400, 'height': 850}, has_touch=True).new_page()
    pg.add_init_script("localStorage.setItem('dsstacks.opts', JSON.stringify({musicOn:false,help:false}));")
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'fonts' not in m.text and 'ERR_' not in m.text else None)
    pg.goto('http://localhost:8778/_page.html'); pg.wait_for_timeout(900)
    pg.click('#nav [data-tab=uniao]'); pg.wait_for_timeout(400); pg.click('[data-a=novo]'); pg.wait_for_selector('.cin', timeout=5000)
    pg.wait_for_timeout(1500)
    t1 = pg.inner_text('.cin-txt p'); chk(0 < len(t1) < 60, 'texto aparece digitado (parcial): %r' % t1[:30])
    pg.click('.cin'); pg.wait_for_timeout(100)
    full = pg.inner_text('.cin-txt p'); chk(len(full) > len(t1) and pg.evaluate("document.querySelector('.cin-next').classList.contains('on')"), 'toque completa a fala')
    pg.screenshot(path=shots + '/cin1.png')
    pg.click('.cin'); pg.wait_for_timeout(300); chk(pg.inner_text('.cin-txt p') != full, 'toque seguinte avança a fala')
    nomeok = False
    for _ in range(60):
        if not pg.query_selector('.cin'): break
        if pg.query_selector('.cin-q input'):
            nomeok = True; pg.click('.cin-q button'); pg.wait_for_timeout(200); chk(pg.query_selector('.cin-q input') is not None, 'nome vazio não avança')
            pg.fill('.cin-q input', 'Zeno'); pg.click('.cin-q button'); pg.wait_for_timeout(200); continue
        pg.mouse.click(200, 300); pg.wait_for_timeout(150)
        pg.mouse.click(200, 300); pg.wait_for_timeout(100)
    pg.wait_for_selector('.hs-svg', timeout=5000)
    chk(nomeok and pg.query_selector('.cin') is None, 'cinemática termina e some')
    chk(pg.evaluate('window.DSHistoria.state().nome') == 'Zeno', 'nome do jogador salvo')
    pg.screenshot(path=shots + '/mapa_preto.png'); pg.wait_for_timeout(5500); pg.screenshot(path=shots + '/mapa_escuro.png')
    ns = pg.evaluate("[...document.querySelectorAll('.n')].map(g=>g.classList.contains('fog')).filter(x=>x).length")
    vis = pg.evaluate("[...document.querySelectorAll('.n')].filter(g=>!g.classList.contains('fog')&&!g.classList.contains('far1')).length")
    chk(ns > 80 and 1 <= vis <= 14, 'mapa escuro: %d pontos ocultos, %d visíveis' % (ns, vis))
    chk(pg.evaluate("getComputedStyle(document.querySelector('#hsHero')).opacity") == '1', 'boneco apareceu')
    # caminhos só depois de vencer: antes da vitória não há arestas visíveis fora do núcleo e da partida; depois da vitória surgem
    e0 = pg.evaluate("document.querySelectorAll('.hs-edges .e:not(.fog)').length")
    st = pg.evaluate('window.DSHistoria.state().startId'); bx = pg.evaluate("id => {const r=document.querySelector('.n[data-id=\"'+id+'\"]').getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]}", st)
    pg.mouse.click(bx[0], bx[1]); pg.wait_for_selector('#hsSheet [data-a=win]'); pg.click('#hsSheet [data-a=win]'); pg.wait_for_selector('.npc', timeout=4000)
    chk(True, 'NPC do tutorial aparece depois da primeira vitória')
    for _ in range(6):
        if not pg.query_selector('.npc'): break
        pg.click('.npc'); pg.wait_for_timeout(150); pg.click('.npc'); pg.wait_for_timeout(150)
    chk(pg.query_selector('.npc') is None and pg.evaluate('window.DSHistoria.state().tutorial') == 1, 'tutorial termina e não repete')
    e1 = pg.evaluate("document.querySelectorAll('.hs-edges .e:not(.fog)').length"); chk(e1 > e0, 'caminhos surgem ao vencer: %d antes, %d depois' % (e0, e1))
    chk(pg.evaluate("document.querySelectorAll('.flag').length") == 0, 'sem faixas Início/Partida')
    pg.keyboard.press('Escape')
    # pular
    pg.click('[data-a=leg]'); pg.wait_for_timeout(200); pg.click('[data-a=intro]'); pg.wait_for_selector('.cin'); pg.click('.cin-skip'); pg.wait_for_timeout(900)
    chk(pg.query_selector('.cin') is None, 'Pular fecha a cinemática')
    pg.click('[data-a=leg]'); pg.wait_for_timeout(200); pg.uncheck('[data-a=escuro]'); pg.wait_for_timeout(200)
    chk(pg.evaluate("document.querySelectorAll('.n.fog').length") == 0, 'opção desliga o escuro')
    b.close()
finally:
  srv.terminate(); os.remove(os.path.join(proj, '_page.html'))
print('erros de página:', errs[:3]); print('FALHAS:', bad + len(errs)); sys.exit(1 if bad or errs else 0)
