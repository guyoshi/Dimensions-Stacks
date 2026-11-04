# Modo história (etapa 1): tela inicial, sorteio de partida, mapa com 179 pontos, painel, vitórias de teste, boss abrindo, continuar após recarregar.
import sys, os, time, subprocess, json
from playwright.sync_api import sync_playwright
proj = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
idx = open(os.path.join(proj, 'index.html'), encoding='utf-8').read()
open(os.path.join(proj, '_page.html'), 'w', encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + idx + '</body></html>')
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8777', '--directory', proj], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(.8)
errs = []; bad = 0
def chk(c, m):
    global bad
    print(('ok  ' if c else 'FALHA '), m); bad += 0 if c else 1
def drain_story(pg, timeout=7000):
    """Consome a fila real pós-batalha (baú -> pausa -> NPC), sem apagar o diálogo atrasado."""
    end = time.time() + timeout / 1000; quiet = None
    while time.time() < end:
        acted = False
        npc = pg.query_selector('.npc')
        if npc:
            npc.click(); pg.wait_for_timeout(60); npc = pg.query_selector('.npc')
            if npc: npc.click()
            acted = True
        ok = pg.query_selector('.bau-ov .bau-ok:not([hidden])')
        if ok: ok.click(); acted = True
        if acted: quiet = None
        elif not pg.query_selector('.npc,.bau-ov'):
            quiet = quiet or time.time()
            if time.time() - quiet >= 1.0: return
        pg.wait_for_timeout(120)
shots = os.path.join(proj, 'tests', 'shots'); os.makedirs(shots, exist_ok=True)
try:
  with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 400, 'height': 850}, has_touch=True); pg = ctx.new_page()
    _click = pg.click
    def _click2(sel, *a, **k):   # diálogos de NPC atrasados (após baú/vitória) cobrem a tela: fecha-os antes de cada toque
        if not str(sel).startswith('.npc'):
            for _ in range(8):
                n = pg.query_selector('.npc')
                if not n: break
                try: n.click(timeout=800)
                except Exception: break
                pg.wait_for_timeout(60)
        return _click(sel, *a, **k)
    pg.click = _click2
    pg.add_init_script("localStorage.setItem('dsstacks.opts', JSON.stringify({musicOn:false,help:false}));localStorage.setItem('dsstacks.historia.prefs', JSON.stringify({aberto:true,escuro:false,v2:1,escuro:false}));")
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'fonts' not in m.text and 'ERR_' not in m.text and 'Failed to load resource' not in m.text else None)
    pg.goto('http://localhost:8777/_page.html'); pg.wait_for_timeout(900)
    pg.click('#nav [data-tab=uniao]'); pg.wait_for_timeout(500)
    chk(pg.evaluate("document.querySelector('#nav').hidden") is False, 'barra inferior visível na tela inicial do modo história')
    chk(pg.evaluate("!document.querySelector('[data-a=cont]')"), 'sem Continuar sem jornada salva')
    pg.screenshot(path=shots + '/hist_hub.png')
    pg.click('[data-a=novo]'); pg.wait_for_selector('.cin-skip', timeout=5000); pg.click('.cin-skip'); pg.click('.cin-qs button'); pg.wait_for_selector('.hs-svg', timeout=10000); pg.wait_for_timeout(1500)
    n = pg.evaluate("document.querySelectorAll('.n').length"); e = pg.evaluate("document.querySelectorAll('.hs-edges .e').length")
    chk(n == 187, 'mapa com 187 pontos (100 batalhas + 5 lojas + 31 casas + 22 baús + 17 minigames + 4 inícios + 8 príncipes): %d' % n)
    M = pg.evaluate("window.DSHistoria.data"); chk(e == sum(len(x['viz']) for x in M['nos']) // 2, 'arestas desenhadas: %d' % e)
    pg.evaluate("(()=>{const k='dsstacks.historia',o=JSON.parse(localStorage.getItem(k));o.tutorial=1;localStorage.setItem(k,JSON.stringify(o));})()"); pg.reload(); pg.wait_for_timeout(900); pg.click('#nav [data-tab=uniao]'); pg.wait_for_timeout(500); pg.click('[data-a=cont]'); pg.wait_for_selector('.hs-svg'); pg.wait_for_timeout(1200)
    S = pg.evaluate("window.DSHistoria.state()"); chk(S and S['startId'] in M['starts'].values(), 'ponto de partida sorteado: ' + S['start'])
    pg.screenshot(path=shots + '/hist_mapa.png')
    pg.click('[data-a=fit]'); pg.wait_for_timeout(900); pg.screenshot(path=shots + '/hist_mapa_inteiro.png')
    pos = lambda i: pg.evaluate("id => {const r=document.querySelector('.n[data-id=\"'+id+'\"]').getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]}", i)
    bx = pos('B050'); pg.mouse.click(bx[0], bx[1]); pg.wait_for_timeout(900)
    chk(pg.evaluate("!document.querySelector('#hsSheet').hidden"), 'toque no ponto abre o painel')
    chk(pg.evaluate("(()=>{const r=document.querySelector('.n[data-id=B050]').getBoundingClientRect(),s=document.querySelector('#hsSheet').getBoundingClientRect();return r.bottom<s.top&&r.top>0})()"), 'o ponto tocado fica visível acima do painel')
    pg.screenshot(path=shots + '/hist_painel.png')
    chk(not pg.evaluate("document.querySelector('.n.t-boss').classList.contains('opened')"), 'ponto da Besta ainda não dourado com guardiões vivos')
    for gi, g in enumerate(M['guardioes'].values()):
        drain_story(pg, 4000)   # NPCs podem abrir diálogo após o baú
        pg.click('#hsSheet [data-a=x]') if pg.evaluate("!document.querySelector('#hsSheet').hidden") else None
        pg.click('[data-a=fit]'); pg.wait_for_timeout(1400)
        for _t in range(10):   # vizinho do boneco: o 1º toque anda; repete até abrir o painel
            bx = pos(g); pg.mouse.click(bx[0], bx[1]); pg.wait_for_timeout(1500)
            if pg.evaluate("(document.querySelector('.n.sel')||{dataset:{}}).dataset.id") == g and pg.evaluate("!document.querySelector('#hsSheet').hidden"): break
        if 'Desfazer' not in pg.inner_text('#hsSheet [data-a=win]'): pg.click('#hsSheet [data-a=win]'); pg.wait_for_timeout(3500)
        if gi == 0: chk('Besta' in pg.evaluate("document.querySelector('#hsToast').textContent"), 'ao derrotar guardião a Besta é atingida (aviso do bônus)')
        drain_story(pg); pg.evaluate("document.querySelectorAll('.rv-ov,.modal').forEach(e=>e.remove())"); pg.wait_for_timeout(250)
    pg.wait_for_timeout(600)
    for n in [x['id'] for x in M['nos'] if x['tipo'] == 'miniboss']:
        drain_story(pg, 4000)   # NPCs podem abrir diálogo após o baú
        pg.click('#hsSheet [data-a=x]') if pg.evaluate("!document.querySelector('#hsSheet').hidden") else None
        pg.click('[data-a=fit]'); pg.wait_for_timeout(1400)
        for _t in range(10):   # vizinho do boneco: o 1º toque anda; repete até abrir o painel
            bx = pos(n); pg.mouse.click(bx[0], bx[1]); pg.wait_for_timeout(1500)
            if pg.evaluate("(document.querySelector('.n.sel')||{dataset:{}}).dataset.id") == n and pg.evaluate("!document.querySelector('#hsSheet').hidden"): break
        pg.click('#hsSheet [data-a=win]'); pg.wait_for_selector('.lib .bau-ok', timeout=4000); pg.click('.lib .bau-ok'); pg.wait_for_timeout(700)
        for _ in range(14):
            if not pg.query_selector('.npc'): break
            pg.evaluate("(()=>{const n=document.querySelector('.npc');if(n)n.click()})()"); pg.wait_for_timeout(120); pg.evaluate("(()=>{const n=document.querySelector('.npc');if(n)n.click()})()"); pg.wait_for_timeout(250)
        pg.wait_for_timeout(900)
    pg.wait_for_timeout(1800)
    chk(set(['D06','M01','J03','B01','S01','M10','V15','V02']) <= set(pg.evaluate("window.DSHistoria.state().owned")), 'os 8 membros da União foram libertados')
    chk(pg.evaluate("document.querySelector('.n.t-boss').classList.contains('opened')"), 'sem guardião vivo o ponto da Besta fica dourado')
    pg.screenshot(path=shots + '/hist_boss_aberto.png')
    # mapa fechado: caminhos escuros
    pg.click('[data-a=leg]'); pg.wait_for_timeout(200); pg.uncheck('[data-a=aberto]'); pg.click('.hs-leg [data-a=ok]'); pg.wait_for_timeout(300)
    dark = pg.evaluate("document.querySelectorAll('.hs-edges .e.dark').length"); chk(dark > 60, 'sem o modo aberto, a maioria dos caminhos fica escura: %d' % dark)
    pg.click('[data-a=fit]'); pg.wait_for_timeout(900); pg.screenshot(path=shots + '/hist_mapa_fechado.png')
    # continuar após recarregar
    pg.reload(); pg.wait_for_timeout(900); pg.click('#nav [data-tab=uniao]'); pg.wait_for_timeout(400)
    chk(pg.evaluate("!document.querySelector('[data-a=cont]').disabled"), 'Continuar disponível depois de recarregar')
    pg.click('[data-a=cont]'); pg.wait_for_selector('.hs-svg'); pg.wait_for_timeout(500)
    chk(pg.evaluate("document.querySelectorAll('.n.done').length") == 12, 'vitórias preservadas: %d' % pg.evaluate("document.querySelectorAll('.n.done').length"))
    pg.click('[data-a=back]'); pg.wait_for_timeout(300); pg.click('[data-a=sair]'); pg.wait_for_timeout(500)
    chk(pg.evaluate("document.querySelector('#nav').hidden") is False, 'barra inferior volta ao sair')
finally:
  srv.terminate(); os.remove(os.path.join(proj, '_page.html'))
print('erros de página:', errs); sys.exit(1 if bad or errs else 0)
