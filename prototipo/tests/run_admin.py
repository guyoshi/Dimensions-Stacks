import sys, os, time, subprocess
from playwright.sync_api import sync_playwright
proj = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
idx = open(os.path.join(proj, 'index.html'), encoding='utf-8').read()
open(os.path.join(proj, '_page.html'), 'w', encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + idx + '</body></html>')
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8766', '--directory', proj], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(.8)
errs = []
try:
  with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_context(viewport={'width': 390, 'height': 844}).new_page()
    pg.on('console', lambda m: print('C', m.type, m.text[:200]) if 'fonts' not in m.text and 'TUNNEL' not in m.text else None); pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'fonts' not in m.text and 'TUNNEL' not in m.text else None)
    # mock claude: db em memória, user admin, sample eco
    pg.add_init_script("""
      const store = {}; window.__db = store;
      const col = (name) => { const c = store[name] = store[name] || {}; const q = { limit(){return q}, orderBy(){return q}, where(){return q}, async get(){ const docs = Object.keys(c).map(id => ({id, exists:true, data:()=>c[id]})); return {docs, size:docs.length, empty:!docs.length}; }, doc(id){ return { async set(d){ c[id] = JSON.parse(JSON.stringify(d)); }, async get(){ return {id, exists: !!c[id], data:()=>c[id]}; } }; } }; return q; };
      window.claude = { async use(n){ if (n==='db') return { collection: col }; if (n==='user') return { async canEdit(){return true}, async isOwner(){return true}, async id(){return 'u1'} }; if (n==='sample') { const f = async (inp, o) => { const t = 'ANALISE-OK ' + inp[0].content.length; o && o.onText && o.onText({text:t}); return {text:t}; }; return f; } if (n==='downloads') return { async save(){ window.__dl = 1; } }; return null; } };
    """)
    pg.goto('http://localhost:8766/_page.html'); pg.wait_for_timeout(800)
    pg.click('#nav [data-tab=prof]'); pg.wait_for_timeout(600)
    pg.click('#pfAdmin button'); pg.wait_for_timeout(500)
    pg.select_option('#sN', '20'); pg.select_option('#sC', '7'); pg.click('[data-a=sim]')
    pg.wait_for_function("/20 simuladas/.test(document.querySelector('.adm').textContent)", timeout=60000)
    pg.wait_for_timeout(300)
    pg.screenshot(path='tests/shots/adm1.png')
    pg.click('[data-a=savesim]'); pg.wait_for_timeout(1500)
    print('db', pg.evaluate("Object.keys(window.__db.matches||{}).length"))
    pg.click('[data-a=ai]'); pg.wait_for_timeout(500); print('ai', pg.evaluate("document.querySelector('#aiOut').textContent"))
    pg.click('[data-a=dl]'); pg.wait_for_timeout(300); print('dl', pg.evaluate("window.__dl"))
    pg.evaluate("document.querySelector('.adm').scrollTo(0, 700)"); pg.wait_for_timeout(300); pg.screenshot(path='tests/shots/adm2.png')
    print('erros', errs)
finally: srv.terminate()
