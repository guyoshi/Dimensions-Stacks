import sys, os, time, subprocess
from playwright.sync_api import sync_playwright
proj = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
idx = open(os.path.join(proj, 'index.html'), encoding='utf-8').read()
open(os.path.join(proj, '_page.html'), 'w', encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + idx + '</body></html>')
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8767', '--directory', proj], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(.8)
try:
  with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2).new_page()
    cdp = pg.context.new_cdp_session(pg); cdp.send('Emulation.setCPUThrottlingRate', {'rate': 4})
    pg.goto('http://localhost:8767/_page.html'); pg.wait_for_timeout(2500)
    r = pg.evaluate("""() => new Promise(res => { let n = 0, t0 = performance.now(), worst = 0, last = t0; function f(t) { n++; worst = Math.max(worst, t - last); last = t; if (t - t0 < 4000) requestAnimationFrame(f); else res({fps: Math.round(n / ((t - t0) / 1000)), worstMs: Math.round(worst)}); } requestAnimationFrame(f); })""")
    print(sys.argv[1] if len(sys.argv) > 1 else '', r)
    m = cdp.send('Performance.getMetrics') if False else None
finally: srv.terminate()
