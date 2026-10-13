import sys, os, json, time, subprocess, re, threading
from playwright.sync_api import sync_playwright
proj = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
mode = sys.argv[1] if len(sys.argv) > 1 else 'menu'
fast = float(os.environ.get('FAST', '1'))   # divisor dos setTimeout
w = int(os.environ.get('W', '1280')); h = int(os.environ.get('H', '800'))
out = os.path.join(proj, 'tests', 'shots'); os.makedirs(out, exist_ok=True)
# página de teste = esqueleto do publicador + index.html
idx = open(os.path.join(proj, 'index.html'), encoding='utf-8').read()
open(os.path.join(proj, '_page.html'), 'w', encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + idx + '</body></html>')
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8765', '--directory', proj], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(.8)
errs = []
try:
  with sync_playwright() as p:
    b = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1)
    pg = ctx.new_page()
    pg.on('console', lambda m: errs.append(('console.' + m.type, m.text)) if m.type in ('error', 'warning') else None)
    pg.on('pageerror', lambda e: errs.append(('pageerror', str(e))))
    pg.on('requestfailed', lambda r: errs.append(('reqfail', r.url)))
    init = "localStorage.setItem('dsstacks.opts', JSON.stringify({speed:'%s',musicOn:false,help:false}));" % ('rapido' if fast > 1 else 'normal')
    if fast > 1:
      init += "(()=>{const st=window.setTimeout;window.setTimeout=(f,d,...a)=>st(f,(d||0)/%s,...a);})();" % fast
    pg.add_init_script(init)
    pg.goto('http://localhost:8765/_page.html'); pg.wait_for_timeout(1200)
    tag = os.environ.get('TAG', mode)
    if mode == 'menu':
      pg.screenshot(path=f'{out}/menu_{tag}.png')
      pg.evaluate("document.querySelector('#menu').scrollTo(0, 9999)"); pg.wait_for_timeout(300); pg.screenshot(path=f'{out}/menu2_{tag}.png')
      pg.click('[data-go=setup]'); pg.wait_for_timeout(400); pg.screenshot(path=f'{out}/setup_{tag}.png')
      pg.click('[data-act=back]'); pg.wait_for_timeout(300)
      pg.click('#nav [data-tab=coll]'); pg.wait_for_timeout(700); pg.screenshot(path=f'{out}/coll_{tag}.png')
      pg.click('.cgrid .card[data-id=J08]'); pg.wait_for_timeout(500); pg.screenshot(path=f'{out}/zoom_{tag}.png')
      pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
      pg.click('#nav [data-tab=chal]'); pg.wait_for_timeout(500); pg.screenshot(path=f'{out}/chal_{tag}.png')
      pg.click('#nav [data-tab=prof]'); pg.wait_for_timeout(500); pg.screenshot(path=f'{out}/prof_{tag}.png')
      pg.evaluate("document.querySelector('#prof').scrollTo(0, 9999)"); pg.wait_for_timeout(300); pg.screenshot(path=f'{out}/prof2_{tag}.png')
      pg.click('#nav [data-tab=menu]'); pg.wait_for_timeout(300)
      pg.click('[data-top=rules]'); pg.wait_for_timeout(400); pg.screenshot(path=f'{out}/rules_{tag}.png')
    elif mode in ('bots', 'human'):
      pg.click('[data-go=setup]'); pg.wait_for_timeout(300)
      if mode == 'bots': pg.click('.seg[data-k=bot] [data-v="1"]')
      if os.environ.get('NP'): pg.click(f'.seg[data-k=n] [data-v="{os.environ["NP"]}"]')
      pg.wait_for_timeout(200)
      if os.environ.get('SF'): pg.evaluate("window.DSUI.CFG.sf = 1")
      if os.environ.get('ABIL'): pg.evaluate("a => DS_DATA.CARTAS.forEach(c => { c.especial = a; })", os.environ['ABIL'])
      pg.click('[data-act=go]')
      t0 = time.time(); shots = {}; n = 0; maxs = float(os.environ.get('MAXS', '240'))
      done = False
      while time.time() - t0 < maxs:
        pg.wait_for_timeout(150); n += 1
        st = pg.evaluate("""() => ({
          order: !!document.querySelector('.order:not(.pick)'),
          pick: !!document.querySelector('.order.pick'),
          dock: !!document.querySelector('#dock:not([hidden]) [data-v]'),
          dockText: (document.querySelector('#dock:not([hidden]) h3')||{}).textContent||'',
          cover: !!document.querySelector('.cover button'),
          final: !!document.querySelector('.final'),
          banner: (document.querySelector('.banner b')||{}).textContent||'',
          stage: !!document.querySelector('.stage'),
          fxb: !!document.querySelector('.fxb.done'),
          susp: !!document.querySelector('.arena.suspense'),
          modal: !!document.querySelector('.modal:not(:has(.final))'),
          calc: !!document.querySelector('#calcpill')
        })""")
        def snap(name, wait=600):
          if name not in shots:
            pg.wait_for_timeout(wait); print('scroll', name, pg.evaluate("[document.scrollingElement.scrollLeft,document.scrollingElement.scrollTop,...['#app','#game'].map(q=>{const e=document.querySelector(q);return e?[e.scrollLeft,e.scrollTop]:null})]")); print('dbg',name,pg.evaluate("(()=>{const w=document.querySelector('.arenaWrap'),a=document.querySelector('.arena');const r=a.getBoundingClientRect();return [w.clientWidth,w.clientHeight,a.style.getPropertyValue('--cw'),Math.round(r.height),getComputedStyle(a).gridTemplateRows]})()")); pg.screenshot(path=f'{out}/{tag}_{name}.png'); shots[name] = 1
        if st['final']: snap('final'); done = True; break
        if st['calc'] and not st['modal'] and shots.get('_calcn', 0) < 3:
          shots['_calcn'] = shots.get('_calcn', 0) + 1; k = shots['_calcn']
          pg.click('#calcpill'); pg.wait_for_timeout(400); pg.screenshot(path=f'{out}/calc{k}_{tag}.png'); print('CALC', k, pg.evaluate("document.querySelector('.calc').innerText.replace(/\\n+/g,' | ')")[:700]); pg.keyboard.press('Escape'); pg.wait_for_timeout(200); continue
        if st['order']:
          snap('order'); pg.click('.order [data-a=best]'); pg.wait_for_timeout(200); pg.click('.order [data-a=ok]'); continue
        if st['cover']: pg.click('.cover button'); continue
        if st['pick']:
          snap('pick')
          try:
            for i_ in range(12):
              if not pg.is_disabled('.order.pick [data-a=ok]'): break
              els_ = pg.query_selector_all('.order.pick .oc:not(.sel)')
              if not els_: break
              els_[0].click(timeout=1500); pg.wait_for_timeout(40)
            pg.wait_for_timeout(200)
            pg.click('.order.pick [data-a=ok]', timeout=1500); print('pick ok')
          except Exception as e_: print('pick retry', str(e_)[:60])
          continue
        if st['dock']:
          dt = st['dockText']
          if 'preparar' in dt: snap('prepare')
          elif 'virar' in dt: snap('special_choice')
          else: snap('attr')
          # escolhas variadas
          btns = pg.query_selector_all('#dock [data-v]')
          import random
          pick = None
          if os.environ.get('ABIL') and 'virar' in dt:
            pick = [x for x in btns if x.get_attribute('data-v') != 'none'][0]
          elif os.environ.get('ABIL') and 'preparar' not in dt and any(x.get_attribute('data-v') == '@prep' for x in btns):
            pick = [x for x in btns if x.get_attribute('data-v') == '@prep'][0]
          elif 'virar' in dt:
            ys = [x for x in btns if x.get_attribute('data-v') != 'none']
            pick = random.choice(ys) if ys and random.random() < .7 else btns[-1]
          elif 'preparar' in dt:
            pick = btns[0] if random.random() < .5 else btns[1]
          else:
            pre = [x for x in btns if x.get_attribute('data-v') == '@prep']
            pick = pre[0] if pre and random.random() < .5 else random.choice([x for x in btns if x.get_attribute('data-v') != '@prep'] or btns)
          pg.wait_for_timeout(250 if fast <= 1 else 30); 
          if fast <= 1 and 'attr' in shots and 'attr2' not in shots: pass
          pick.click(); continue
        if st['fxb']: snap('fxb' + str(len([k for k in shots if k.startswith('fxb')])), 0) if len([k for k in shots if k.startswith('fxb')]) < 3 else None
        if st['stage']: snap('special_stage')
        if st['susp']: snap('suspense')
        if st['banner']: snap('banner_' + re.sub(r'\W+', '', st['banner'])[:14])
        if st['modal']: pg.keyboard.press('Escape')
      info = pg.evaluate("()=>{const d=window.DSUI.dbg&&window.DSUI.dbg();return d&&d.G?{combats:d.G.s.combats,round:d.G.s.round,over:d.G.s.over,winner:d.G.s.winner,bh:d.G.s.bh.length}:null}")
      print('terminou:', done, 'polls', n, 'tempo', round(time.time() - t0, 1), info, 'shots', list(shots))
      print('LS', pg.evaluate("() => JSON.stringify({p: JSON.parse(localStorage.getItem('dsstacks.profile')||'null'), m: (JSON.parse(localStorage.getItem('dsstacks.matches')||'[]')).map(x=>({mode:x.mode,dur:x.dur,rounds:x.rounds,combats:x.combats,winner:x.winner,spec:x.spec,cards:Object.keys(x.cards).length}))})")[:1500])
    b.close()
finally:
  srv.terminate()
  seen = {}
  for t, m in errs: seen[(t, m[:200])] = seen.get((t, m[:200]), 0) + 1
  for (t, m), c in seen.items(): print('ERR', t, c, m)
  print('erros distintos:', len(seen))
