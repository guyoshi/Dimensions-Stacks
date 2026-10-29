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
        pg.click('#nav [data-tab=uniao]'); pg.wait_for_timeout(300); pg.click('[data-a=novo]'); pg.wait_for_selector('.cin-skip'); pg.click('.cin-skip'); pg.click('.cin-qs button'); pg.wait_for_selector('.hs-svg'); pg.wait_for_timeout(1200)
        pg.evaluate("(()=>{const k='dsstacks.historia',o=JSON.parse(localStorage.getItem(k));o.tutorial=1;o.pend=500;localStorage.setItem(k,JSON.stringify(o));})()")
        pg.reload(); pg.wait_for_timeout(900)
        pg.click('#nav [data-tab=uniao]'); pg.wait_for_timeout(300); pg.click('[data-a=cont]'); pg.wait_for_selector('.hs-svg'); pg.wait_for_timeout(1000)
        chk(pg.evaluate("document.querySelectorAll('.n.t-casa').length") == 31, '31 casas de NPC como pontos')
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
        ids = pg.evaluate("DSHistoria.data.nos.filter(n=>n.tipo!='loja'&&n.tipo!='boss'&&n.tipo!='casa').slice(0,3).map(n=>n.id)")
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
        pg.evaluate("DSHistoria.loja('L5')"); pg.wait_for_selector('.hs-loja .loja-x'); chk(pg.evaluate("document.querySelectorAll('.hs-loja .loja-x').length") == 3, 'loja 5: registro + 2 melhorias')
        chk('Maria' in pg.evaluate("document.querySelector('.loja-vend').textContent"), 'vendedor aparece')
        pg.screenshot(path='/tmp/m3.png')
        pg.click('.hs-loja .loja-x'); pg.wait_for_timeout(300)
        chk(pg.evaluate("Object.keys(DSNpc.state().reg).length") >= 1, 'compra de registro funciona')
        pg.click('.hs-loja [data-a=x]'); pg.wait_for_timeout(400)
        # fragmentos = moeda; carta do Átila só no último NPC da cadeia
        r = pg.evaluate("""(()=>{const s=DSNpc.state(),u=DSNpc.ultimo(),p=DSNpc.primeiro();const ch=DSNpc.dados.cadeia;
          const outro=ch.find(n=>n.id!==u&&n.id!==p&&!s.mis[n.id]);
          s.mis[outro.id]={st:'ativa',base:0,first:false}; if(outro.pede&&!s.itens.includes(outro.pede))s.itens.push(outro.pede);
          const f0=Object.keys(s.frag).length; DSNpc.entrega(DSNpc.byId(outro.id)); const f1=Object.keys(s.frag).length;
          const tinha=s.owned.includes('V26');
          const un=DSNpc.byId(u); s.mis[u]={st:'ativa',base:0,first:false}; if(un.pede&&!s.itens.includes(un.pede))s.itens.push(un.pede);
          const f2=Object.keys(s.frag).length; DSNpc.entrega(un);
          return {d1:f1-f0, tinha, d2:Object.keys(s.frag).length-f2, atila:s.owned.includes('V26'), saldo:DSNpc.nFrag()};})()""")
        chk(r['d1'] == 1 and not r['tinha'], 'NPC comum da cadeia dá 1 fragmento e não dá o Átila %s' % r)
        chk(r['d2'] == 0 and r['atila'], 'último NPC dá o Átila (sem fragmento)')
        chk(r['saldo'] >= 1, 'saldo de fragmentos conta')
        pg.evaluate("(()=>{const s=DSNpc.state();for(let i=0;i<40;i++)s.frag['T:'+i]=1;})()"); base = pg.evaluate("DSNpc.nFrag()")
        chk(pg.evaluate("document.querySelector('.hs-svg').classList.contains('escuro')"), 'sem a melhoria o mapa tem névoa')
        def compra(loja, nome):
            pg.evaluate("DSHistoria.loja('%s')" % loja); pg.wait_for_selector('.hs-loja .loja-x')
            ok = pg.evaluate("[...document.querySelectorAll('.hs-loja .loja-x')].some(e=>e.textContent.includes('%s'))" % nome)
            s0 = pg.evaluate("DSNpc.nFrag()")
            pg.evaluate("[...document.querySelectorAll('.hs-loja .loja-x')].find(e=>e.textContent.includes('%s')).click()" % nome); pg.wait_for_timeout(300)
            pg.click('.hs-loja [data-a=x]'); pg.wait_for_timeout(300)
            return ok, s0 - pg.evaluate("DSNpc.nFrag()")
        ok, gasto = compra('L2', 'Mapa revelado'); chk(ok and gasto > 0 and pg.evaluate("DSNpc.tem('mapa')"), 'comprar Mapa revelado gasta fragmentos (%s)' % gasto)
        chk(not pg.evaluate("document.querySelector('.hs-svg').classList.contains('escuro')"), 'Mapa revelado tira a névoa')
        pg.evaluate("DSHistoria.loja('L1')"); pg.wait_for_selector('.hs-loja .loja-it'); p0 = pg.evaluate("+document.querySelector('.hs-loja .loja-it:not(.loja-x) .loja-pr b').textContent"); pg.click('.hs-loja [data-a=x]'); pg.wait_for_timeout(300)
        ok, gasto = compra('L1', 'Preços menores'); chk(ok and pg.evaluate("DSNpc.tem('preco')"), 'comprar Preços menores')
        pg.evaluate("DSHistoria.loja('L1')"); pg.wait_for_selector('.hs-loja .loja-it'); p1 = pg.evaluate("+document.querySelector('.hs-loja .loja-it:not(.loja-x) .loja-pr b').textContent"); pg.click('.hs-loja [data-a=x]'); pg.wait_for_timeout(300)
        chk(p1 < p0, 'preço da carta caiu (%s -> %s)' % (p0, p1))
        for lj, nm, idm in [('L3', 'Iniciativa', 'atr'), ('L4', 'Sorte de combate', 'sorte'), ('L5', 'Mão ampliada', 'maos')]:
            ok, gasto = compra(lj, nm); chk(ok and pg.evaluate("DSNpc.tem('%s')" % idm), 'comprar ' + nm)
        chk(pg.evaluate("DSNpc.nFrag()") == base - (4 + 6 + 8 + 10 + 12), 'saldo = antes - preços provisórios (%s)' % pg.evaluate("DSNpc.nFrag()"))
        # fragmento de minigame só no prêmio máximo
        f0 = pg.evaluate("DSNpc.nFrag()"); pg.evaluate("DSNpc.fragMini('x',2)"); f1 = pg.evaluate("DSNpc.nFrag()"); pg.evaluate("DSNpc.fragMini('x',3)"); pg.evaluate("DSNpc.fragMini('x',3)"); f2 = pg.evaluate("DSNpc.nFrag()")
        chk(f1 == f0 and f2 == f0 + 1, 'minigame: só o Perfeito dá 1 fragmento (uma vez)')
        # casa do NPC é um ponto: 1º toque painel sem ação, 2º toque anda, parado na casa aparece Conversar
        pg.evaluate("(()=>{const k='dsstacks.historia.prefs',o=JSON.parse(localStorage.getItem(k)||'{}');o.aberto=false;localStorage.setItem(k,JSON.stringify(o));})()"); pg.reload(); pg.wait_for_timeout(900)
        pg.click('#nav [data-tab=uniao]'); pg.wait_for_timeout(300); pg.click('[data-a=cont]'); pg.wait_for_selector('.hs-svg'); pg.wait_for_timeout(900)
        hid = pg.evaluate("(()=>{const S=DSHistoria.state(),M=DSHistoria.data,B={};M.nos.forEach(n=>B[n.id]=n);return M.nos.find(n=>n.tipo=='casa'&&B[S.startId].viz.includes(n.id))?.id||null})()")
        print('casa ao lado do início:', hid)
        if hid:
            pg.evaluate("DSHistoria.state().pos=DSHistoria.state().startId"); pg.evaluate("DSHistoria.openNode('%s')" % hid); pg.wait_for_timeout(300)
            chk(pg.evaluate("!document.querySelector('[data-a=conv]')") and pg.evaluate("document.querySelector('#hsSheet h3').textContent.length>0"), 'casa longe: painel sem Conversar')
            pg.evaluate("DSHistoria.state().pos='%s'" % hid); pg.evaluate("DSHistoria.openNode('%s')" % hid); pg.wait_for_timeout(300)
            chk(pg.evaluate("!!document.querySelector('#hsSheet [data-a=conv]')"), 'parado na casa: Conversar')
        chk(not errs, 'sem erros %s' % errs)
finally:
    srv.terminate(); os.remove(proj + '/_page.html')
sys.exit(1 if fails else 0)
