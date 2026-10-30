import sys, os, time, subprocess
from playwright.sync_api import sync_playwright
proj = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
idx = open(proj + '/index.html', encoding='utf-8').read()
open(proj + '/_page.html', 'w', encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + idx + '</body></html>')
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8787', '--directory', proj], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(.8)
fails = []; errs = []
def chk(c, m):
    print(('ok   ' if c else 'FALHOU ') + m)
    if not c: fails.append(m)
try:
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_context(viewport={'width': 400, 'height': 850}).new_page()
        pg.add_init_script("localStorage.setItem('dsstacks.opts', JSON.stringify({musicOn:false,help:false,speed:'rapido'}));")
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('http://localhost:8787/_page.html'); pg.wait_for_timeout(900)
        pg.click('#nav [data-tab=uniao]'); pg.wait_for_timeout(300); pg.click('[data-a=novo]'); pg.wait_for_selector('.cin-skip'); pg.click('.cin-skip'); pg.click('.cin-qs button'); pg.wait_for_selector('.hs-svg'); pg.wait_for_timeout(1200)
        mg = pg.evaluate("DSHistoria.data.nos.filter(n=>n.tipo=='minigame').map(n=>n.id)")
        chk(len(mg) == 17, '17 pontos de minigame: %d' % len(mg))
        idm = pg.evaluate("(()=>{const m=DSHistoria.data.nos.find(n=>n.id=='J_B018');return m.tipo+'|'+m.mg+'|'+DSHistoria.data.nos.find(n=>n.id=='B018').tipo})()"); chk(idm.startswith('minigame|maiormenor|') and not idm.endswith('minigame'), 'casa J_B018 = Três Portais e B018 voltou a ser batalha: %s' % idm)
        pg.evaluate("(()=>{const s=DSHistoria.state();s.tutorial=1;s.pend=100;s.pos='J_B018';s.dicas={minigame:1,evento:1,elite:1,miniboss:1,loja:1,guardiao:1,captura:1,derrota:1}})()")
        pg.evaluate("DSHistoria.openNode('J_B018')"); pg.wait_for_timeout(500)
        chk(pg.query_selector('[data-a=mini]') is not None, 'botão Jogar aparece na casa')
        # perder: bloqueia a casa; pagar destrava
        pg.evaluate("window.__play=DSMini.play;DSMini.play=async()=>({id:'maiormenor',pct:0,tier:0,reward:0})")
        pg.click('[data-a=mini]'); pg.wait_for_timeout(600)
        st = pg.evaluate("DSHistoria.state()"); chk(st['mgLock'].get('J_B018') == 1 and 'J_B018' not in st['cleared'], 'falhar bloqueia a casa')
        pg.evaluate("DSHistoria.openNode('J_B018')"); pg.wait_for_timeout(400)
        chk(pg.query_selector('[data-a=desbloq]') is not None and pg.query_selector('[data-a=mini]') is None, 'bloqueado mostra Desbloquear e não Jogar')
        pg.click('[data-a=desbloq]'); pg.wait_for_timeout(400)
        st = pg.evaluate("DSHistoria.state()"); chk(not st['mgLock'].get('J_B018') and st['pend'] == 90, 'desbloquear custa 10 pêndulos: %s' % st['pend'])
        pg.evaluate("DSMini.play=async()=>({id:'maiormenor',pct:.7,tier:2,reward:10})")
        pg.evaluate("DSHistoria.openNode('J_B018')"); pg.wait_for_timeout(400)
        pg.click('[data-a=mini]'); pg.wait_for_timeout(900)
        st = pg.evaluate("DSHistoria.state()"); chk('J_B018' in st['cleared'] and st['pend'] == 100 and st['mgBest']['J_B018'] == 2, 'passar abre a casa e paga o prêmio: %s' % st['pend'])
        # bloqueio de passagem: a casa só deixa passar depois de passar
        r = pg.evaluate("(()=>{const B=DSHistoria.data.nos,by={};B.forEach(n=>by[n.id]=n);const h=by['J_B018'];return h.viz.length})()"); chk(r == 2, 'casa de minigame liga dois pontos')
        # série dá broche
        pg.evaluate("(()=>{const s=DSHistoria.state();s.pos='J_B082'})()")
        pg.evaluate("DSHistoria.openNode('J_B082')"); pg.wait_for_timeout(400)
        pg.evaluate("DSMini.play=async()=>({id:'elos',pct:.5,tier:1,reward:5})"); pg.click('[data-a=mini]'); pg.wait_for_timeout(900)
        st = pg.evaluate("DSHistoria.state()"); chk(st['broches'].get('diario') == 1, 'minigame de série dá broche')
        chk(not errs, 'sem erros de página %s' % errs)
        b.close()
finally:
    srv.terminate(); os.remove(proj + '/_page.html')
print('FALHAS: %d' % len(fails)); sys.exit(1 if fails else 0)
