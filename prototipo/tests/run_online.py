import sys, os, time, subprocess, random, re
from playwright.sync_api import sync_playwright
proj = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
fast = float(os.environ.get('FAST', '6')); nguest = int(os.environ.get('GUESTS', '1')); seatsN = int(os.environ.get('SEATS', str(nguest + 1)))
out = os.path.join(proj, 'tests', 'shots'); os.makedirs(out, exist_ok=True)
idx = open(os.path.join(proj, 'index.html'), encoding='utf-8').read()
open(os.path.join(proj, '_page.html'), 'w', encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + idx + '</body></html>')
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8766', '--directory', proj], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(.8)
errs = []
STATE = """() => ({
  order: !!document.querySelector('.order:not(.pick)'), pick: !!document.querySelector('.order.pick'),
  dock: !!document.querySelector('#dock:not([hidden]) [data-v]'), dockText: (document.querySelector('#dock:not([hidden]) h3')||{}).textContent||'',
  final: !!document.querySelector('.final'), finalText: (document.querySelector('.final h1')||{}).textContent||'',
  modal: !!document.querySelector('.modal:not(:has(.final))'), game: !document.querySelector('#game')?.hidden,
  hsub: (document.querySelector('#hSub')||{}).textContent||'' })"""
def step(pg, name, log):
    st = pg.evaluate(STATE)
    if st['final']: return 'final', st
    try:
        if st['order']:
            pg.click('.order [data-a=best]', timeout=800); pg.click('.order [data-a=ok]', timeout=800); return 'ok', st
        if st['pick']:
            for _ in range(12):
                if not pg.is_disabled('.order.pick [data-a=ok]'): break
                els = pg.query_selector_all('.order.pick .oc:not(.sel)')
                if not els: break
                els[0].click(timeout=800)
            pg.click('.order.pick [data-a=ok]', timeout=800); return 'ok', st
        if st['dock']:
            btns = pg.query_selector_all('#dock [data-v]'); dt = st['dockText']
            if 'virar' in dt: ys = [x for x in btns if x.get_attribute('data-v') != 'none']; pick = random.choice(ys) if ys and random.random() < .7 else btns[-1]
            elif 'preparar' in dt: pick = btns[0] if random.random() < .5 else btns[1]
            else:
                pre = [x for x in btns if x.get_attribute('data-v') == '@prep']
                pick = pre[0] if pre and random.random() < .4 else random.choice([x for x in btns if x.get_attribute('data-v') != '@prep'] or btns)
            pick.click(timeout=800); log.append(name + ':' + dt[:20]); return 'ok', st
        if st['modal']: pg.keyboard.press('Escape')
    except Exception as e:
        pass
    return 'idle', st
try:
  with sync_playwright() as p:
    b = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    ctx = b.new_context(viewport={'width': 1100, 'height': 760})
    init = "localStorage.setItem('dsstacks.opts', JSON.stringify({speed:'rapido',musicOn:false,help:false}));(()=>{const st=window.setTimeout;window.setTimeout=(f,d,...a)=>st(f,(d||0)/%s,...a);})();" % fast
    pages = []
    for i in range(nguest + 1):
        pg = ctx.new_page(); pg.add_init_script(init + "localStorage.setItem('dsstacks.profile', JSON.stringify({v:1,name:'%s'}));" % ('Anfitriao' if i == 0 else f'Convidado{i}'))
        pg.on('console', lambda m, i=i: errs.append((i, 'console.' + m.type, m.text)) if m.type in ('error',) else None)
        pg.on('pageerror', lambda e, i=i: errs.append((i, 'pageerror', str(e))))
        pg.goto('http://localhost:8766/_page.html'); pg.wait_for_timeout(900)
        if os.environ.get('ABIL'): pg.evaluate("a => DS_DATA.CARTAS.forEach(c => { c.especial = a; })", os.environ['ABIL'])
        pages.append(pg)
    host = pages[0]
    host.click('[data-go=online]'); host.evaluate('window.__dsSf = 1'); host.click('[data-a=create]')
    host.wait_for_selector('.roomcode', timeout=8000); code = host.inner_text('.roomcode').strip(); print('codigo', code)
    for i, pg in enumerate(pages[1:], 1):
        pg.click('[data-go=online]'); pg.fill('#onCode', code); pg.click('[data-a=join]')
        pg.wait_for_selector('.onwait', timeout=9000)
    host.wait_for_function("()=>document.querySelectorAll('.onseat .pill.me').length>=1", timeout=5000)
    host.wait_for_function("n=>[...document.querySelectorAll('.onseat .avatar')].filter(a=>a.textContent!=='🤖').length>=n", arg=nguest+1, timeout=8000)
    host.screenshot(path=f'{out}/online_lobby_host.png'); pages[1].screenshot(path=f'{out}/online_lobby_guest.png')
    if seatsN > nguest + 1: host.click(f'.seg[data-k=n] [data-v="{seatsN}"]')
    host.wait_for_timeout(300)
    host.click('[data-a=start]')
    t0 = time.time(); log = []; done = set(); maxs = float(os.environ.get('MAXS', '300')); shot = False
    texts = {}; dropped = False; drop = os.environ.get('DROP')
    while time.time() - t0 < maxs and len(done) < len(pages):
        if drop and not dropped and time.time() - t0 > 12:
            dropped = True; k = 1 if drop == 'guest' else 0; pages[k].close(); done.add(k); print('fechou', drop)
        if drop == 'host' and dropped:
            try:
                tx = pages[1].evaluate("()=>(document.querySelector('.final h1')||{}).textContent||''")
                if 'anfitri' in tx.lower(): print('convidado viu:', tx); break
            except Exception: pass
        for i, pg in enumerate(pages):
            if i in done: continue
            r, st = step(pg, 'H' if i == 0 else f'G{i}', log)
            if r == 'final': done.add(i); texts[i] = st['finalText']
            if not shot and time.time() - t0 > 8: shot = True; [q.screenshot(path=f'{out}/online_game_{j}.png') for j, q in enumerate(pages)]
        pg0 = pages[0].wait_for_timeout(60)
    for i, pg in enumerate(pages):
        try: pg.screenshot(path=f'{out}/online_final_{i}.png')
        except Exception: pass
    print('terminou', len(done), '/', len(pages), 'tempo', round(time.time() - t0, 1)); print('finais', texts)
    
    b.close()
finally:
  srv.terminate()
  seen = {}
  for i, t, m in errs:
    if 'fonts' in m or 'TUNNEL' in m: continue
    seen[(i, t, m[:200])] = seen.get((i, t, m[:200]), 0) + 1
  for k, c in seen.items(): print('ERR', c, k)
  print('erros distintos:', len(seen))
