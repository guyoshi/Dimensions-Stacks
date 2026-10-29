import sys, os, time, subprocess
from playwright.sync_api import sync_playwright
proj = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
idx = open(proj + '/index.html', encoding='utf-8').read()
open(proj + '/_page.html', 'w', encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + idx + '</body></html>')
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8786', '--directory', proj], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(.8)
fails = []; errs = []
def chk(c, m):
    print(('ok   ' if c else 'FALHOU ') + m)
    if not c: fails.append(m)
try:
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_context(viewport={'width': 400, 'height': 850}).new_page()
        pg.add_init_script("localStorage.setItem('dsstacks.opts', JSON.stringify({musicOn:false,help:false,speed:'rapido'}));")
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('http://localhost:8786/_page.html'); pg.wait_for_timeout(900)
        pg.click('#nav [data-tab=uniao]'); pg.wait_for_timeout(300); pg.click('[data-a=novo]'); pg.wait_for_selector('.cin-skip'); pg.click('.cin-skip'); pg.wait_for_selector('.hs-svg'); pg.wait_for_timeout(1200)
        pg.evaluate("(()=>{const k='dsstacks.historia',o=JSON.parse(localStorage.getItem(k));o.tutorial=1;o.pend=500;localStorage.setItem(k,JSON.stringify(o));})()")
        pg.reload(); pg.wait_for_timeout(900)
        pg.click('#nav [data-tab=uniao]'); pg.wait_for_timeout(300); pg.click('[data-a=cont]'); pg.wait_for_selector('.hs-svg'); pg.wait_for_timeout(1000)
        chk(pg.evaluate("document.querySelectorAll('.npcm').length") == 31, '31 marcadores de NPC')
        prim = pg.evaluate("DSNpc.primeiro()"); print('primeiro:', prim)
        def conv():
            for _ in range(12):
                if not pg.query_selector('.npc'): break
                pg.click('.npc'); pg.wait_for_timeout(60); pg.click('.npc'); pg.wait_for_timeout(80)
            pg.wait_for_timeout(500)
        def popup():
            if pg.query_selector('.hs-rec2'): pg.click('.hs-rec2 [data-a=x]'); pg.wait_for_timeout(200)
        # cadeia: primeiro NPC pede 3 vitórias
        pg.evaluate("DSNpc.falar('%s')" % prim); conv()
        chk(pg.evaluate("DSNpc.state().mis['%s'].st" % prim) == 'ativa', 'primeira conversa ativa a missão')
        pg.evaluate("DSNpc.falar('%s')" % prim); conv()
        chk(pg.evaluate("DSNpc.state().itens.length") == 0, 'sem vitórias: nada é entregue')
        ids = pg.evaluate("DSHistoria.data.nos.filter(n=>n.tipo!='loja'&&n.tipo!='boss').slice(0,3).map(n=>n.id)")
        pg.evaluate("(()=>{const s=DSHistoria.state();%s.forEach(i=>s.cleared[i]=1);})()" % ids)
        pg.evaluate("DSNpc.check()"); pg.wait_for_timeout(300)
        pg.evaluate("DSNpc.falar('%s')" % prim); conv(); popup()
        st = pg.evaluate("DSNpc.state()")
        chk(len(st['itens']) == 1 and st['mis'][prim]['st'] == 'entregue', 'após 3 vitórias recebe o 1º item: %s' % st['itens'])
        # segundo da cadeia
        D = pg.evaluate("DSNpc.dados.cadeia.map(n=>n.id)"); i = D.index(prim); nx = D[(i+1) % 12]
        pg.evaluate("DSNpc.falar('%s')" % nx); conv()
        chk(pg.evaluate("DSNpc.state().mis['%s'].st" % nx) == 'ativa', 'segundo NPC pede o item')
        pg.evaluate("DSNpc.falar('%s')" % nx); conv(); popup()
        st = pg.evaluate("DSNpc.state()")
        chk(st['mis'][nx]['st'] == 'entregue' and len(st['itens']) == 1, 'troca feita no segundo NPC; pend=%s' % pg.evaluate("DSHistoria.state().pend"))
        # missão de conquista
        pg.evaluate("DSNpc.falar('banjo')"); conv()
        pg.evaluate("DSHistoria.state().owned=DSUI.D.CARTAS.slice(0,20).map(c=>c.id)"); pg.evaluate("DSNpc.check()")
        pg.evaluate("DSNpc.falar('banjo')"); conv(); popup()
        chk(pg.evaluate("DSNpc.state().mis.banjo.st") == 'entregue', 'Banjo: 20 cartas cumpre')
        # menus
        pg.click('.hs-hud [data-a=missoes]'); pg.wait_for_selector('.hs-mis'); chk(pg.evaluate("document.querySelectorAll('.hs-mis .mis-row').length") >= 1, 'menu cadeia lista missões')
        pg.screenshot(path='/tmp/m1.png'); pg.click('.hs-mis [data-a="t:con"]'); chk(pg.evaluate("document.querySelectorAll('.hs-mis .mis-row').length") == 1, 'aba conquistas')
        pg.click('.hs-mis [data-a=x]'); pg.wait_for_timeout(200)
        pg.click('.hs-hud [data-a=colecao]'); pg.wait_for_selector('.hs-col'); pg.click('.hs-col [data-a="t:reg"]'); pg.click('.hs-col [data-a="t:selo"]'); pg.screenshot(path='/tmp/m2.png'); pg.click('.hs-col [data-a=x]')
        # loja com vendedor e extras
        pg.evaluate("DSHistoria.loja('L5')"); pg.wait_for_selector('.hs-loja .loja-x'); chk(pg.evaluate("document.querySelectorAll('.hs-loja .loja-x').length") == 2, 'loja 5: fragmento + registro')
        chk('Maria' in pg.evaluate("document.querySelector('.loja-vend').textContent"), 'vendedor aparece')
        pg.screenshot(path='/tmp/m3.png')
        pg.click('.hs-loja .loja-x'); pg.wait_for_timeout(300)
        chk(pg.evaluate("DSNpc.nFrag()") >= 1 or pg.evaluate("Object.keys(DSNpc.state().reg).length") >= 1, 'compra de extra funciona')
        pg.click('.hs-loja [data-a=x]'); pg.wait_for_timeout(400)
        # nó com NPC
        n = pg.evaluate("DSNpc.dados.quests[0].a"); pg.evaluate("DSHistoria.state().pos='%s'" % n)
        chk(not errs, 'sem erros %s' % errs)
finally:
    srv.terminate(); os.remove(proj + '/_page.html')
sys.exit(1 if fails else 0)
