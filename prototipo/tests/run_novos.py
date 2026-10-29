# Duelo do modo história: partida automática (jogador vira bot), resultado, captura e volta ao mapa.
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
        pg.on('pageerror', lambda e: (errs.append(str(e)), print('ERRO', e, flush=True))); pg.on('console', lambda m: print('LOG', m.text[:150], flush=True) if m.type=='error' else None)
        pg.goto('http://localhost:8777/_page.html'.replace('8777', '8786')); pg.wait_for_timeout(900)
        pg.click('#nav [data-tab=uniao]'); pg.wait_for_timeout(300); pg.click('[data-a=novo]'); pg.wait_for_selector('.cin-skip'); pg.click('.cin-skip'); pg.click('.cin-qs button'); pg.wait_for_selector('.hs-svg'); pg.wait_for_timeout(1200)
        pg.evaluate("(()=>{const k='dsstacks.historia',o=JSON.parse(localStorage.getItem(k));o.tutorial=1;localStorage.setItem(k,JSON.stringify(o));})()"); pg.reload(); pg.wait_for_timeout(900)
        pg.click('#nav [data-tab=uniao]'); pg.wait_for_timeout(300); pg.click('[data-a=cont]'); pg.wait_for_selector('.hs-svg'); pg.wait_for_timeout(1000)
        import json,re
        bat=open(proj+'/historia_bat.js',encoding='utf-8').read(); B=json.loads(bat[bat.index('{',bat.index('DS_HIST_BAT')):bat.rindex('}')+1])
        for regra in sys.argv[1:]:
            sid=[k for k,v in B.items() if v.get('e',{}).get('id')==regra][0]
            pg.evaluate("window.DSHistoria.duelar('%s', true)" % sid)
            pg.wait_for_timeout(12000); print('DOM', pg.evaluate("document.body.innerText.slice(0,300).replace(/\\n/g,' | ')"), flush=True); print(pg.evaluate("[...document.querySelectorAll('.modal,.npc,.sheet,.bau-ov')].map(x=>x.className)"), flush=True)
            pg.wait_for_selector('.hcap, .final', timeout=40000)
            chk(pg.evaluate("!!document.querySelector('.final h1')"), regra + ' termina: ' + pg.evaluate("document.querySelector('.final h1').textContent"))
            pg.click('.final [data-a=go]'); pg.wait_for_timeout(2500)
            pg.evaluate("document.querySelectorAll('.npc,.bau-ov').forEach(x=>x.remove())")
        chk(not errs, 'sem erros de página %s' % errs)
finally:
    srv.terminate(); os.remove(proj + '/_page.html')
sys.exit(1 if fails else 0)
