import sys, os, time, subprocess
from playwright.sync_api import sync_playwright
proj = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
idx = open(os.path.join(proj, 'index.html'), encoding='utf-8').read()
open(os.path.join(proj, '_page.html'), 'w', encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + idx.replace('<title>Dimensions Stacks</title>', '') + '</body></html>')
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8778', '--directory', proj], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(.8)
errs = []
try:
  with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_context(viewport={'width': 390, 'height': 780}).new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.add_init_script("localStorage.setItem('dsstacks.opts', JSON.stringify({musicOn:false,speed:'rapido'}));")
    pg.goto('http://localhost:8778/_page.html'); pg.wait_for_timeout(900)
    pg.evaluate("setTimeout(() => DSUI.startGame({players:[{name:'Eu',bot:false,avatar:0},{name:'CPU',bot:true,avatar:1,diff:'normal'}],perPlayer:8,difficulty:'normal',specialsFrom:1}), 0)")
    pg.wait_for_selector('.order [data-a=ok]'); pg.wait_for_timeout(600)
    while pg.query_selector('.coach.modal button'):
      pg.click('.coach.modal button >> nth=-1'); pg.wait_for_timeout(300)
    pg.click('.order [data-a=ok]'); pg.wait_for_timeout(500)
    # chama o seletor de especiais diretamente, com uma disputa de mentira
    pg.evaluate("""(() => { const G = DSUI.game, id = G.p(0).deck[0]; DSUI.CARDS[id].especial = 'AE-016';
      const combat = { entries: [{ pid: 0, card: id, stats: { pod: 40, def: 20, int: 62, vel: 30 }, attr: 'def' }], locked: new Set() };
      window.__sp = G.io.special(G.p(0), [id], combat, null, 'main'); })()""")
    for _ in range(8):
      if pg.query_selector('.specpick'): break
      if pg.query_selector('.coach.modal button'): pg.click('.coach.modal button >> nth=-1')
      pg.wait_for_timeout(400)
    print('sheet?', bool(pg.query_selector('.specpick')), errs)
    pg.wait_for_selector('.specpick .prev', timeout=4000); t = pg.inner_text('.specpick .prev'); print('prévia:', t)
    pg.screenshot(path=os.path.join(proj, 'tests/shots/preview_especial.png'))
    assert 'Resistência (usado): 20 → 62' in t, t
    # bônus +10 no atributo usado
    print('erros', errs)
finally: srv.terminate()
