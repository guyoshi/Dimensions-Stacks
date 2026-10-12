import sys, os, time, subprocess
from playwright.sync_api import sync_playwright
proj = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
idx = open(os.path.join(proj, 'index.html'), encoding='utf-8').read()
open(os.path.join(proj, '_page.html'), 'w', encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + idx + '</body></html>')
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8778', '--directory', proj], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(.8)
errs = []
try:
  with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_context(viewport={'width': 400, 'height': 640}, device_scale_factor=2).new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('http://localhost:8778/_page.html'); pg.wait_for_timeout(1200)
    pg.evaluate("""()=>{const w=document.createElement('div');w.id='__t';w.style.cssText='position:fixed;inset:0;z-index:99999;background:#14161b;padding:10px;display:flex;flex-wrap:wrap;gap:10px;align-items:flex-start;overflow:auto';
      [[230,'J08'],[150,'V16'],[96,'J08'],[70,'S09'],[56,'D15'],[44,'J01'],[34,'J08']].forEach(([cw,id],i)=>{const c=DSUI.cardEl(id,{up:true,noanim:true,cw});w.appendChild(c)});
      const back=DSUI.cardEl('J08',{up:false,noanim:true,cw:70});w.appendChild(back);
      document.body.appendChild(w)}""")
    pg.wait_for_timeout(900); pg.screenshot(path=os.path.join(proj, 'tests/shots/cardsizes.png'))
    print('erros', errs)
finally: srv.terminate()
