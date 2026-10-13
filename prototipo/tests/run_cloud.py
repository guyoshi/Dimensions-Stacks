import sys, os, time, subprocess
from playwright.sync_api import sync_playwright
proj = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
idx = open(os.path.join(proj, 'index.html'), encoding='utf-8').read()
open(os.path.join(proj, '_page.html'), 'w', encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + idx + '</body></html>')
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8774', '--directory', proj], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(.8)
errs = []
try:
  with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_context(viewport={'width': 390, 'height': 800}).new_page()
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.add_init_script("""
      const store = {}; window.__db = store;
      const col = (name) => { const c = store[name] = store[name] || {}; const mk = (flt) => { const q = { limit(){return q}, where(f,op,v){ return mk(flt.concat([[f,v]])); }, async get(){ const docs = Object.keys(c).filter(id => flt.every(([f,v]) => c[id][f] === v)).map(id => ({id, exists:true, data:()=>c[id]})); return {docs, size:docs.length, empty:!docs.length}; }, doc(id){ return { async set(d){ c[id] = JSON.parse(JSON.stringify(d)); } }; } }; return q; }; return mk([]); };
      window.claude = { async use(n){ if (n==='db') return { collection: col }; if (n==='user') return { async canEdit(){return false}, async id(){return 'u_me'} }; return null; } };
    """)
    pg.goto('http://localhost:8774/_page.html'); pg.wait_for_timeout(800)
    pg.click('#nav [data-tab=prof]'); pg.wait_for_timeout(400)
    uid = pg.inner_text('#pfUid'); print('uid', uid)
    pg.click('#pfEdit'); pg.fill('#pfName', 'Taina'); pg.keyboard.press('Enter'); pg.wait_for_timeout(3500)
    print('db', pg.evaluate("JSON.stringify(window.__db.players)"))
    pg.fill('#fq', uid); pg.click('#fgo'); pg.wait_for_timeout(600); print('busca id:', pg.inner_text('#fout')[:90].replace('\n', ' | '))
    pg.fill('#fq', 'taina'); pg.click('#fgo'); pg.wait_for_timeout(600); print('busca nome:', pg.inner_text('#fout')[:60].replace('\n', ' | '))
    # lobby usa o nome do perfil
    pg.click('#nav [data-tab=menu]'); pg.click('[data-go=online]'); pg.wait_for_timeout(400); print('lobby:', pg.inner_text('.who').replace('\n', ' | '), '| input nome?', pg.query_selector('#onName') is not None)
    pg.screenshot(path='tests/shots/online_entry.png'); print('erros', errs)
finally: srv.terminate()
