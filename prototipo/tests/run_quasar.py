# Pós-game Quasar: Korvo no centro, 40 desafios "+", 8 príncipes (pagos em Estírio), recompensas, cartas Quasar fora dos duelos normais.
import sys, os, time, subprocess
from playwright.sync_api import sync_playwright
proj = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
idx = open(os.path.join(proj, 'index.html'), encoding='utf-8').read()
open(os.path.join(proj, '_page.html'), 'w', encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + idx + '</body></html>')
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8793', '--directory', proj], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(.8)
errs = []; bad = 0
def chk(c, m):
    global bad
    print(('ok  ' if c else 'FALHA '), m, flush=True); bad += 0 if c else 1
try:
  with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_context(viewport={'width': 400, 'height': 850}, has_touch=True).new_page()
    pg.route('**/fonts.g*/**', lambda r: r.abort())
    pg.add_init_script("localStorage.setItem('dsstacks.opts', JSON.stringify({musicOn:false,help:false}));localStorage.setItem('dsstacks.historia.prefs', JSON.stringify({aberto:true,escuro:false,v2:1}));")
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('http://localhost:8793/_page.html', wait_until='commit'); pg.wait_for_timeout(1500)
    pg.click('#nav [data-tab=uniao]'); pg.wait_for_timeout(500)
    pg.click('[data-a=novo]'); pg.wait_for_selector('.cin-skip', timeout=5000); pg.click('.cin-skip'); pg.click('.cin-qs button'); pg.wait_for_selector('.hs-svg', timeout=10000); pg.wait_for_timeout(1200)
    chk(pg.evaluate("document.querySelectorAll('.n.t-principe.hs-oculto').length") == 8, 'antes de vencer a Besta: 8 príncipes ocultos')
    chk(pg.evaluate("!document.querySelector('.n.t-boss.korvo')"), 'antes: boss sem a cor do Korvo')
    chk(pg.evaluate("document.querySelectorAll('.n.plusok').length") == 0, 'antes: nenhum desafio +')
    # simula o fim da Besta e todas as batalhas vencidas
    pg.evaluate("""() => { const k='dsstacks.historia', o=JSON.parse(localStorage.getItem(k)), M=window.DSHistoria.data; o.tutorial=1; o.cleared=o.cleared||{}; M.nos.forEach(n => { if (['normal','evento','elite','miniboss','guardiao','boss'].includes(n.tipo)) o.cleared[n.id]=1; }); o.est=6; o.pos=M.boss; localStorage.setItem(k, JSON.stringify(o)); }""")
    pg.reload(); pg.wait_for_timeout(900); pg.click('#nav [data-tab=uniao]'); pg.wait_for_timeout(500); pg.click('[data-a=cont]'); pg.wait_for_selector('.hs-svg'); pg.wait_for_timeout(1500)
    chk(pg.evaluate("document.querySelectorAll('.n.t-principe:not(.hs-oculto)').length") == 8, 'pós-game: 8 príncipes visíveis')
    chk(pg.evaluate("!!document.querySelector('.n.t-boss.korvo')"), 'pós-game: boss com a cor do Korvo')
    chk(pg.evaluate("document.querySelectorAll('.n.plusok').length") == 40, 'pós-game: 40 desafios + disponíveis: %s' % pg.evaluate("document.querySelectorAll('.n.plusok').length"))
    chk(pg.evaluate("getComputedStyle(document.querySelector('#hsEstP')).display") != 'none' and pg.evaluate("document.querySelector('#hsEst').textContent") == '6', 'contador de Estírio mostra 6')
    chk(pg.evaluate("window.DSHistoria.quasar.PLUS.size") == 40, '40 desafios + definidos')
    # painel do Korvo: sem botão de duelo
    pg.evaluate("window.DSHistoria.openNode('B100')"); pg.wait_for_timeout(400)
    chk(pg.evaluate("!document.querySelector('.hs-sheet [data-a=duelar]') && document.body.innerText.includes('Korvo')"), 'Korvo no centro: sem duelo ainda')
    # príncipe: pagar 5 e abrir a escolha de time
    pg.evaluate("window.DSHistoria.duelar('PR2', false)"); pg.wait_for_timeout(600)
    S = pg.evaluate("window.DSHistoria.state()"); chk(S['est'] == 1 and S['principePago'].get('PR2') == 1, 'príncipe cobra 5 fragmentos (restam %s)' % S['est'])
    chk(pg.evaluate("!!document.querySelector('.hs-esc')"), 'príncipe abre a escolha do time')
    pg.evaluate("document.querySelector('.hs-esc [data-a=x]') && document.querySelector('.hs-esc [data-a=x]').click()"); pg.wait_for_timeout(300)
    pg.evaluate("window.DSHistoria.duelar('PR3', false)"); pg.wait_for_timeout(500)
    S = pg.evaluate("window.DSHistoria.state()"); chk(S['est'] == 1 and not (S.get('principePago') or {}).get('PR3'), 'sem fragmentos suficientes não paga nem luta')
    # recompensas
    pg.evaluate("window.DSHistoria.quasar.darEstirio('B094')"); pg.evaluate("window.DSHistoria.quasar.darEstirio('B094')")
    chk(pg.evaluate("window.DSHistoria.state().est") == 2, 'fragmento + só uma vez por desafio')
    pg.evaluate("(()=>{const S=window.DSHistoria.state(); S.cleared['PR8']=1;})()"); pg.evaluate("window.DSHistoria.quasar.darPrincipe('PR8')"); pg.wait_for_timeout(500)
    own = pg.evaluate("window.DSHistoria.state().owned"); chk(all(c in own for c in ['P08', 'Q05', 'Q02']), 'Príncipe das Trevas dá a Lendária + Beatriz N2 + Édelin N2')
    # versão + : +2 cartas e uma raridade acima
    r = pg.evaluate("""() => { const q = window.DSHistoria.quasar, B = window.DS_HIST_BAT['B094'], m = q.plusBat(B); return [B.i[0].c.length, m.i[0].c.length]; }""")
    chk(r[1] == r[0] + 2, 'desafio +: +2 cartas (%s -> %s)' % tuple(r))
    # cartas Quasar nunca entram na escolha de time normal
    pg.evaluate("(()=>{const S=window.DSHistoria.state(); S.owned.push('Q01');})()")
    pg.evaluate("window.DSHistoria.duelar('B094', false)"); pg.wait_for_timeout(500)
    chk(pg.evaluate("![...document.querySelectorAll('.hs-esc *')].some(e => e.dataset && e.dataset.id === 'Q01')"), 'cartas Quasar fora da escolha de time')
    chk(not errs, 'sem erros de página %s' % errs[:2])
finally:
    srv.terminate()
print('FALHAS:', bad)
