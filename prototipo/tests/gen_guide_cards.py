import sys, os, time, subprocess
from playwright.sync_api import sync_playwright
proj = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
idx = open(os.path.join(proj, 'index.html'), encoding='utf-8').read()
open(os.path.join(proj, '_page.html'), 'w', encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + idx + '</body></html>')
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8774', '--directory', proj], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(.8)
ids = sys.argv[1:] or ['J08']
try:
  with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_context(viewport={'width': 600, 'height': 700}, device_scale_factor=2).new_page()
    pg.goto('http://localhost:8774/_page.html'); pg.wait_for_timeout(1200)
    for cid in ids:
      pg.evaluate("""(id)=>{document.querySelectorAll('.__g').forEach(e=>e.remove());const w=document.createElement('div');w.className='__g';w.style.cssText='position:fixed;left:40px;top:40px;z-index:99999;padding:0;background:transparent';const c=DSUI.cardEl(id,{up:true,noanim:true,cw:230});w.appendChild(c);document.body.appendChild(w);}""", cid)
      pg.wait_for_timeout(900)
      el = pg.query_selector('.__g .card')
      print(cid, el.bounding_box())
      el.screenshot(path=f'{proj}/guia_{cid}.png', omit_background=True)
finally: srv.terminate()
