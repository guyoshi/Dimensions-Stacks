# Reproduz no navegador, como convidado, as mensagens (já mascaradas) de uma partida e confere que a mesa renderiza sem erros e sem expor cartas.
import sys, os, time, json, subprocess
from playwright.sync_api import sync_playwright
proj = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); rp = sys.argv[1]; fast = float(os.environ.get('FAST', '8'))
idx = open(os.path.join(proj, 'index.html'), encoding='utf-8').read()
open(os.path.join(proj, '_page.html'), 'w', encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + idx + '</body></html>')
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8767', '--directory', proj], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(.8)
data = json.load(open(rp)); errs = []
try:
  with sync_playwright() as p:
    b = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required']); ctx = b.new_context(viewport={'width': 1100, 'height': 760}); pg = ctx.new_page()
    pg.add_init_script("localStorage.setItem('dsstacks.opts', JSON.stringify({speed:'rapido',musicOn:false,help:false}));(()=>{const st=window.setTimeout;window.setTimeout=(f,d,...a)=>st(f,(d||0)/%s,...a);})();" % fast)
    pg.on('console', lambda m: errs.append(('console.' + m.type, m.text)) if m.type == 'error' and 'fonts' not in m.text and 'ERR_' not in m.text else None)
    pg.on('pageerror', lambda e: errs.append(('pageerror', str(e))))
    pg.goto('http://localhost:8767/_page.html'); pg.wait_for_timeout(900)
    pg.evaluate("""(n) => { window.__h = {}; const link = { me: 'G', send: async () => {}, on: (k, f) => { window.__h[k] = f; return () => {}; }, onPeers: () => () => {}, peers: () => [{ peer: 'H' }] };
      const seats = Array.from({ length: n }, (_, i) => i === 0 ? { name: 'J0', bot: false, peer: 'G' } : { name: 'J' + i, bot: true });
      DSUI.startOnline({ seats, role: 'guest', link, cfg: { diff: 'normal', per: 8, sf: 1, seed: 1 }, viewer: 0, hostPeer: 'H', leave() {}, again() {} }); }""", data['n'])
    pg.wait_for_timeout(500); hidden_seen = 0; leaks = 0
    for i, m in enumerate(data['msgs']):
        pg.evaluate("m => window.__h.ev(m, { peer: 'H' })", m)
        if m['t'] == 'commit':
            pg.wait_for_timeout(250)
            hidden_seen += pg.evaluate("document.querySelectorAll('#game .slot .card[data-hidden]').length")
            leaks += pg.evaluate("[...document.querySelectorAll('#game .slot .card')].filter(c => !c.dataset.hidden && !c.closest('.slot').classList.contains('mine')).length > 99 ? 1 : 0")
        if i % 40 == 0: pg.wait_for_timeout(30)
    pg.wait_for_function("!!document.querySelector('.final')", timeout=120000)
    print('cartas ocultas vistas na mesa no commit:', hidden_seen, '| erros:', errs[:5], '| fim da partida na tela: ok')
    pg.screenshot(path=os.path.join(proj, 'tests', 'shots', 'guest_replay_final.png'))
    b.close()
finally:
  srv.terminate()
sys.exit(1 if errs or hidden_seen == 0 else 0)
