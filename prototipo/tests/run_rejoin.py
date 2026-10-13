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
    host = mk('Anfitriao'); g = mk('Convidado1')
    host.click('[data-go=online]'); host.evaluate('window.__dsSf = 1'); host.click('[data-a=create]')
    host.wait_for_selector('.roomcode', timeout=8000); code = host.inner_text('.roomcode').strip(); print('codigo', code)
    g.click('[data-go=online]'); g.fill('#onCode', code); g.click('[data-a=join]'); g.wait_for_selector('.onwait', timeout=9000)
    host.wait_for_function("n=>[...document.querySelectorAll('.onseat .avatar')].filter(a=>a.textContent!=='🤖').length>=n", arg=2, timeout=8000)
    host.click('[data-a=start]'); host.wait_for_selector('#hSub', timeout=8000); g.wait_for_selector('#hSub', timeout=8000)
    time.sleep(1.5)
    print('HUD host:', host.inner_text('#hSub'), '| guest:', g.inner_text('#hSub'))
    assert code in host.inner_text('#hSub') and code in g.inner_text('#hSub'), 'codigo da sala nao aparece no HUD'
    g.close(); print('convidado caiu')
    host.wait_for_function("()=>[...document.querySelectorAll('.banner')].some(b=>/perdeu a conex/.test(b.textContent))", timeout=6000); print('aviso 1 (perdeu a conexao) ok')
    host.wait_for_function("()=>[...document.querySelectorAll('.banner')].some(b=>/Um CPU assumiu/.test(b.textContent))", timeout=12000); print('aviso 2 (CPU assumiu) ok')
    print('bot?', host.evaluate("()=>DSUI.dbg().G.p(1).bot"))
    assert host.evaluate("()=>DSUI.dbg().G.p(1).bot") is True
    g2 = mk('Convidado1')
    g2.click('[data-go=online]'); g2.wait_for_selector('[data-a=back2]', timeout=4000); print('botao Voltar a sala:', g2.inner_text('[data-a=back2]')); g2.click('[data-a=back2]')
    g2.wait_for_selector('#hSub', timeout=12000); print('convidado voltou ao jogo')
    host.wait_for_function("()=>[...document.querySelectorAll('.banner')].some(b=>/voltou/.test(b.textContent))", timeout=6000); print('aviso 3 (voltou) ok no anfitriao')
    g2.wait_for_function("()=>[...document.querySelectorAll('.banner,#caption')].some(b=>/voltou/.test(b.textContent))", timeout=8000); print('aviso de volta ok no convidado')
    assert host.evaluate("()=>DSUI.dbg().G.p(1).bot") is False
    print('G.p(1).bot depois:', host.evaluate("()=>DSUI.dbg().G.p(1).bot"))
    time.sleep(4)
    print('estado convidado:', g2.evaluate("()=>({seats:Object.keys(DSUI.dbg().V.seats).length, hsub:document.querySelector('#hSub').textContent, deck:DSUI.dbg().G.p(DSUI.dbg().V.viewer).deck.length})"))
    got = False
    for _ in range(60):
        try:
            if host.query_selector('.order:not(.pick)'): host.click('.order [data-a=best]', timeout=800); host.click('.order [data-a=ok]', timeout=800)
        except Exception: pass
        st = g2.evaluate("()=>({deck:DSUI.dbg().G.p(DSUI.dbg().V.viewer).deck.length, prompt: !!document.querySelector('.order, #dock:not([hidden]) [data-v]')})")
        if st['prompt'] or st['deck']: got = True; break
        time.sleep(.5)
    print('convidado reassumiu as decisoes:', got, st); assert got, 'convidado nao foi chamado a jogar depois de voltar'
    print('erros:', errs)
finally:
    srv.terminate()
