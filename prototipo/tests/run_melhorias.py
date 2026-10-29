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
        pg.evaluate("(()=>{const s=DSHistoria.state();s.tutorial=1;s.pend=200;s.dicas={minigame:1,evento:1,elite:1,miniboss:1,loja:1,guardiao:1,captura:1,derrota:1,bau:1,cansaco:1};s.owned=DSHistoria.data.cartasIds?[]:s.owned})()")
        # ---- Segunda tentativa
        pg.evaluate("(()=>{const s=DSHistoria.state();s.pos='B018';s.mgLock={B018:1};s.melh={segunda:1}})()")
        pg.evaluate("DSHistoria.openNode('B018')"); pg.wait_for_timeout(400)
        chk('de graça' in pg.inner_text('[data-a=desbloq]'), 'botão mostra desbloqueio grátis')
        pg.click('[data-a=desbloq]'); pg.wait_for_timeout(300)
        st = pg.evaluate("DSHistoria.state()"); chk(st['pend'] == 200 and st['mgGratis'].get('maiormenor') == 1, 'segunda tentativa não cobra: %s' % st['pend'])
        pg.evaluate("(()=>{const s=DSHistoria.state();s.mgLock={B018:1}})()"); pg.evaluate("DSHistoria.openNode('B018')"); pg.wait_for_timeout(300)
        pg.click('[data-a=desbloq]'); pg.wait_for_timeout(300)
        chk(pg.evaluate("DSHistoria.state().pend") == 190, 'segunda vez no mesmo minigame cobra 10')
        # ---- carta de minigame: animação de desbloqueio
        pg.evaluate("DSMini.play=async()=>({id:'maiormenor',pct:1,tier:3,reward:20,carta:'J01'})")
        pg.evaluate("DSHistoria.openNode('B018')"); pg.wait_for_timeout(300)
        n0 = pg.evaluate("DSHistoria.state().owned.length"); pg.click('[data-a=mini]'); pg.wait_for_selector('.rv-ov', timeout=4000)
        pg.wait_for_selector('.rv-ov.done', timeout=4000); pg.screenshot(path='tests/shots/rv.png')
        chk(pg.evaluate("DSHistoria.state().owned.length") == n0 + 1, 'carta do minigame entra na coleção')
        pg.click('.rv-ok'); pg.wait_for_timeout(700); chk(pg.query_selector('.rv-ov') is None, 'animação fecha')
        # ---- Olho vivo
        pg.evaluate("(()=>{const s=DSHistoria.state();s.melh.olho=1;const n=DSHistoria.data.nos.find(n=>n.tipo=='normal');s.pos=n.id;window.__nn=n.id})()")
        nn = pg.evaluate("window.__nn"); pg.evaluate("DSHistoria.openNode('%s')" % nn); pg.wait_for_timeout(400)
        chk(len(pg.query_selector_all('.hs-olho .card, .hs-olho [class*=card]')) >= 3, 'Olho vivo mostra cartas do inimigo')
        pg.screenshot(path='tests/shots/olho.png')
        # ---- Aluguel
        pg.evaluate("(()=>{const s=DSHistoria.state();s.frag={};for(let i=0;i<40;i++)s.frag['t'+i]=1;s.frGasto=0})()")
        pg.evaluate("document.querySelectorAll('.modal').forEach(m=>m.remove())"); pg.evaluate("DSNpc.compraExtra('M:aluguel')"); pg.wait_for_selector('.npc', timeout=5000)
        st = pg.evaluate("DSHistoria.state()"); chk(bool(st.get('alug')) and st['melh'].get('aluguel') == 1, 'comprar a melhoria apresenta o mercador')
        for i in range(14):
            pg.evaluate("(()=>{const n=document.querySelector('.npc');if(n)n.click()})()"); pg.wait_for_timeout(250)
        pg.wait_for_timeout(400); chk(pg.query_selector('.npc') is None, 'cutscene do mercador termina')
        chk(pg.evaluate("!document.getElementById('hsAlug').hidden"), 'botão de aluguel aparece')
        pg.click('#hsAlug'); pg.wait_for_selector('.hs-alug'); pg.wait_for_timeout(300); pg.screenshot(path='tests/shots/aluguel.png')
        ids = pg.evaluate("[...document.querySelectorAll('.al-buy')].map(x=>x.dataset.id)"); chk(len(ids) >= 5, 'estoque de aluguel: %d' % len(ids))
        raro = pg.evaluate("ids=>ids.filter(i=>DSUI.CARDS[i].raridade=='lendaria'||DSHistoria.state().owned.includes(i)).length", ids); chk(raro == 0, 'sem lendárias nem cartas que já tem')
        pend0 = pg.evaluate("DSHistoria.state().pend"); pg.click('.al-buy'); pg.wait_for_timeout(300)
        st = pg.evaluate("DSHistoria.state()"); chk(len(st['alugadas']) == 1 and st['pend'] < pend0, 'alugar cobra e guarda a carta')
        alug = st['alugadas'][0]
        pg.click('.hs-alug [data-a=x]'); pg.wait_for_timeout(300)
        # selo na escolha de cartas e consumo
        pg.evaluate("(()=>{const s=DSHistoria.state();const o=DSUI.D.CARTAS.filter(c=>!c.uniao&&c.id!='S11'&&c.id!='V26'&&!s.alugadas.includes(c.id)).slice(0,9).map(c=>c.id);s.owned=o})()")
        pg.evaluate("DSHistoria.openNode('%s')" % nn); pg.wait_for_timeout(300); pg.click('[data-a=duelar]'); pg.wait_for_selector('.hs-esc', timeout=3000); pg.wait_for_timeout(300)
        chk(pg.query_selector('.hs-alugsel') is not None, 'selo ALUGADA na escolha de cartas'); pg.screenshot(path='tests/shots/alug_sel.png')
        chk(pg.evaluate("DSHistoria.state().owned.includes('%s')" % alug) is False, 'alugada não entra no owned')
        pg.click('[data-a=melhores]'); pg.wait_for_timeout(200); pg.evaluate("(a=>{const on=document.querySelector('.hs-esc .hs-escc.on');on.click();document.querySelector('.hs-esc .hs-escc[data-id='+a+']').click()})('%s')" % alug); pg.wait_for_timeout(200); pg.click('[data-a=go]'); pg.wait_for_timeout(1500)
        chk(pg.evaluate("DSHistoria.state().alugadas.length") == 0, 'alugada some ao começar a batalha')
        chk(not errs, 'sem erros de página %s' % errs)
        b.close()
finally:
    srv.terminate(); os.remove(proj + '/_page.html')
print('FALHAS: %d' % len(fails)); sys.exit(1 if fails else 0)
