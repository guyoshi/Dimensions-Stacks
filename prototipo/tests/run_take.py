# Queda e reentrada: o convidado perde a conexão no meio da partida, o CPU assume (com aviso) e ele volta ao lugar.
import sys, os, time, subprocess
from playwright.sync_api import sync_playwright
proj = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FAST = 6
idx = open(os.path.join(proj, 'index.html'), encoding='utf-8').read()
open(os.path.join(proj, '_page.html'), 'w', encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + idx + '</body></html>')
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8768', '--directory', proj], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(.8)
errs = []
try:
  with sync_playwright() as p:
    b = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    ctx = b.new_context(viewport={'width': 420, 'height': 800})
    init = "localStorage.setItem('dsstacks.opts', JSON.stringify({speed:'normal',musicOn:false,help:false}));(()=>{const st=window.setTimeout;window.setTimeout=(f,d,...a)=>st(f,(d||0)/%d,...a);})();" % FAST
    def mk(name):
        pg = ctx.new_page(); pg.add_init_script(init + "localStorage.setItem('dsstacks.profile', JSON.stringify({v:1,name:'%s'}));" % name)
        pg.on('pageerror', lambda e: errs.append(('pageerror', str(e)))); pg.on('console', lambda m: errs.append(('console', m.text)) if m.type == 'error' and 'ERR_' not in m.text and 'fonts' not in m.text else None)
        pg.goto('http://localhost:8768/_page.html'); pg.wait_for_timeout(900); return pg
    host = mk('Anfitriao')
    host.click('[data-go=online]'); host.evaluate('window.__dsSf = 1'); host.click('[data-a=create]')
    host.wait_for_selector('.roomcode', timeout=8000); code = host.inner_text('.roomcode').strip(); print('codigo', code)
    host.click('.seg[data-k=n] [data-v="3"]'); host.wait_for_timeout(300)
    host.click('[data-a=start]'); host.wait_for_selector('#hSub', timeout=8000); time.sleep(1.5)
    for _ in range(20):
        try:
            if host.query_selector('.order:not(.pick)'): host.click('.order [data-a=best]', timeout=800); host.click('.order [data-a=ok]', timeout=800); break
        except Exception: pass
        time.sleep(.5)
    time.sleep(3)
    print('botao Permitir entrada visivel:', host.evaluate("()=>{const b=document.querySelector('#bJoin');return b&&!b.hidden&&b.textContent}"))
    # 1) entrada desligada: convidado novo é recusado
    host.click('#bMore'); host.click('#bJoin'); print(host.inner_text('#bJoin')); host.wait_for_timeout(700)
    g = mk('Novato'); g.click('[data-go=online]'); g.fill('#onCode', code); g.click('[data-a=join]'); g.wait_for_timeout(3500)
    print('msg com entrada desligada:', g.evaluate("()=>(document.querySelector('#onMsg')||{}).textContent"))
    assert 'não há lugar' in (g.evaluate("()=>(document.querySelector('#onMsg')||{}).textContent") or ''), 'devia recusar'
    # 2) liga e entra
    host.click('#bJoin'); print(host.inner_text('#bJoin')); host.wait_for_timeout(700)
    g.fill('#onCode', code); g.click('[data-a=join]'); g.wait_for_selector('.modal [data-i], [data-i]', timeout=8000)
    print('opcoes:', g.evaluate("()=>[...document.querySelectorAll('[data-i]')].map(b=>b.textContent)"))
    g.click('button[data-i="1"]'); g.wait_for_selector('#hSub', timeout=12000); print('novato entrou no jogo')
    host.wait_for_function("()=>DSUI.dbg().G.p(1).name==='Novato'", timeout=6000); print('lugar assumido (nome Novato)')
    assert host.evaluate("()=>DSUI.dbg().G.p(1).bot") is False
    print('nome do lugar 1 no anfitriao:', host.evaluate("()=>DSUI.dbg().G.p(1).name"), '| seat:', host.evaluate("()=>document.querySelector('.seat[data-pid=\"1\"] .nt').textContent"))
    got = False
    for _ in range(60):
        try:
            if host.query_selector('.order:not(.pick)'): host.click('.order [data-a=best]', timeout=800); host.click('.order [data-a=ok]', timeout=800)
        except Exception: pass
        st = g.evaluate("()=>({deck:DSUI.dbg().G.p(DSUI.dbg().V.viewer).deck.length, prompt: !!document.querySelector('.order, #dock:not([hidden]) [data-v]')})")
        if st['prompt'] or st['deck']: got = True; break
        time.sleep(.5)
    print('novato recebe decisoes/baralho:', got, st); assert got
    print('erros:', errs)
finally:
    srv.terminate()
