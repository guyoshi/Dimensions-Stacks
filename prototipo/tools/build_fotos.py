#!/usr/bin/env python3
"""Converte as fotos listadas em fotos_map.json (já copiadas da pasta do OneDrive para STAGE_ROOT)
em photos/<ID>.webp e gera photos/manifest.json + images.js.
Uso: python3 -I tools/build_fotos.py <STAGE_ROOT_da_pasta_raiz> [--w 720] [--q 82]"""
import json, sys, os, hashlib
from PIL import Image
here = os.path.dirname(os.path.abspath(__file__)); proj = os.path.dirname(here)
stage = sys.argv[1]; W = 720; Q = 82
if '--w' in sys.argv: W = int(sys.argv[sys.argv.index('--w') + 1])
if '--q' in sys.argv: Q = int(sys.argv[sys.argv.index('--q') + 1])
mp = json.load(open(os.path.join(here, 'fotos_map.json'), encoding='utf-8'))
out = os.path.join(proj, 'photos'); os.makedirs(out, exist_ok=True)
man = {}; imgs = {}; missing = []
for cid, v in mp.items():
    if cid.startswith('_'): continue
    p = os.path.join(stage, v['src'])
    if not os.path.exists(p): missing.append((cid, v['src'])); continue
    raw = open(p, 'rb').read(); h = hashlib.sha1(raw).hexdigest()[:10]
    im = Image.open(p).convert('RGB')
    if im.width > W: im = im.resize((W, round(im.height * W / im.width)), Image.LANCZOS)
    dst = os.path.join(out, cid + '.webp'); im.save(dst, 'WEBP', quality=Q, method=6)
    man[cid] = {'src': v['src'], 'mtimeMs': v['mtimeMs'], 'bytes': len(raw), 'sha1': h, 'w': im.width, 'h': im.height, 'webp': os.path.getsize(dst)}
    imgs[cid] = f'photos/{cid}.webp?v={h}'
json.dump({'raiz': mp['_raiz'], 'fotos': man}, open(os.path.join(out, 'manifest.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
open(os.path.join(proj, 'images.js'), 'w').write('/* gerado por tools/build_fotos.py — não editar */\nwindow.CARD_IMAGES = ' + json.dumps(imgs, indent=1) + ';\n')
print(len(man), 'fotos;', 'faltando:', missing, '; total webp KB', sum(m['webp'] for m in man.values()) // 1024)
