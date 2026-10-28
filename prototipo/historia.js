/* Dimensions Stacks — modo história "A União" (ETAPA 1: tela inicial e mapa navegável).
   Dados do mapa em historia_mapa.js (gerado; posições, tipos e ligações fixos). Aqui: tela inicial (Novo jogo / Continuar),
   sorteio do ponto de partida, mapa com arrastar e zoom, painel de cada ponto, progresso salvo no aparelho.
   Ainda sem duelos, baralhos de inimigos, lojas e recompensas (etapas 2 a 4). */
(function () {
  'use strict';
  const U = window.DSUI, M = window.DS_MAPA;
  if (!U || !M) return;
  const { $, $$, el, esc, SND } = U;
  const KEY = 'dsstacks.historia', PKEY = 'dsstacks.historia.prefs';
  const rd = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  const wr = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };

  const TIPOS = {
    normal:   { nome: 'Normal',    cor: '#6cc6ff', r: 19, desc: 'Duelo comum contra um inimigo.' },
    evento:   { nome: 'Evento',    cor: '#ffd25f', r: 19, desc: 'Duelo com uma regra especial (tempo, cartas, atributos...).' },
    elite:    { nome: 'Elite',     cor: '#c58cff', r: 23, desc: 'Inimigo mais forte, com cartas raras.' },
    miniboss: { nome: 'Miniboss',  cor: '#ff5a7a', r: 28, desc: 'Duelo de 3 ou 4 jogadores, com mais cartas. Pode trancar uma região.' },
    guardiao: { nome: 'Guardião',  cor: '#ff9a3c', r: 36, desc: 'Um dos 4 guardiões do centro. Vencer os 4 abre o Boss.' },
    loja:     { nome: 'Loja',      cor: '#7dffb0', r: 21, desc: 'Compre cartas com pêndulos.' },
    boss:     { nome: 'Boss final', cor: '#fbf9ff', r: 66, desc: 'O centro da teia.' },
  };
  const LADOS = { esq: 'Esquerda', cima: 'Cima', dir: 'Direita', baixo: 'Baixo' };
  const REGIAO = { 1: 'Região externa', 2: 'Região média', 3: 'Região interna', 4: 'Núcleo' };
  const NOS = M.nos, BY = {}; NOS.forEach(n => { BY[n.id] = n; });
  const BATALHAS = NOS.filter(n => n.tipo !== 'loja');
  const GUARD = Object.values(M.guardioes);
  // deixa o mapa menos redondo e mais orgânico: deformação suave por ângulo + pequeno desvio por ponto (determinístico; ids e ligações não mudam)
  (function organico() {
    if (M._org) return; M._org = 1;
    const h = (str) => { let x = 0; for (let i = 0; i < str.length; i++) x = (x * 31 + str.charCodeAt(i)) | 0; return x; };
    NOS.forEach(n => {
      if (n.id === M.boss) return;
      const r = Math.hypot(n.x, n.y), a = Math.atan2(n.y, n.x), f = 1 + .07 * Math.sin(2 * a + 1.1) + .05 * Math.sin(3 * a + .4) + .03 * Math.sin(5 * a + 2.2);
      const jx = ((h(n.id + 'x') & 1023) / 1023 - .5) * 44, jy = ((h(n.id + 'y') & 1023) / 1023 - .5) * 44;
      n.x = Math.round(n.x * f + jx); n.y = Math.round(n.y * f + jy);
    });
    M.raio = Math.max(M.raio, Math.ceil(Math.max(...NOS.map(n => Math.hypot(n.x, n.y)))) + 40);
  })();
  const R = M.raio;

  let S = null;                                   // jornada salva (ou null)
  let P = Object.assign({ aberto: true, escuro: true }, rd(PKEY, {}));   // preferências (ETAPA 1: mapa aberto para testes)
  const save = () => { if (S) wr(KEY, S); wr(PKEY, P); };
  const load = () => { const s = rd(KEY, null); S = s && s.v === 1 && BY[s.startId] ? s : null; return S; };

  // ---------------------------------------------------------------- regras do mapa
  const cleared = id => !!(S && S.cleared[id]);
  const bossOpen = () => GUARD.every(cleared);
  function available(id) {
    if (!S) return false;
    if (P.aberto) return true;
    if (cleared(id)) return true;
    if (id === M.boss) return bossOpen();
    if (id === S.startId) return true;
    return BY[id].viz.some(v => cleared(v) && v !== M.boss);
  }
  function edgeState(a, b) {
    if (cleared(a) && cleared(b)) return 'lit';
    if (cleared(a) || cleared(b) || a === S.startId || b === S.startId) return 'open';
    return P.aberto ? 'open' : 'dark';
  }
  const nBat = () => BATALHAS.filter(n => cleared(n.id)).length;

  // ---------------------------------------------------------------- ícones
  const ICON = {
    bolt: '<path d="M2 -9 L-5 2 H0 L-2 9 L5 -3 H0 Z" fill="currentColor"/>',
    star: '<path d="M0 -9 L2.6 -3 L9 -2.6 L4.2 1.6 L5.6 8 L0 4.7 L-5.6 8 L-4.2 1.6 L-9 -2.6 L-2.6 -3 Z" fill="currentColor"/>',
    swords: '<path d="M-7 -7 L5 5 M7 -7 L-5 5 M-8 6 L-4 2 M8 6 L4 2" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none"/>',
    crown: '<path d="M-9 6 V-5 L-4 0 L0 -8 L4 0 L9 -5 V6 Z" fill="currentColor"/>',
  };
  // pêndulo: moeda vermelha com furo hexagonal
  const coin = (r, id) => { const h = r * .42, pts = [0, 1, 2, 3, 4, 5].map(i => (h * Math.cos(Math.PI / 3 * i + Math.PI / 6)).toFixed(1) + ',' + (h * Math.sin(Math.PI / 3 * i + Math.PI / 6)).toFixed(1)).join(' ');
    return `<circle r="${r}" fill="url(#hsCoin)" stroke="#ffb3ad" stroke-width="${(r * .09).toFixed(1)}"/><circle r="${(r * .78).toFixed(1)}" fill="none" stroke="#7a1410" stroke-opacity=".55" stroke-width="${(r * .07).toFixed(1)}"/><polygon points="${pts}" fill="#0a0820" stroke="#7a1410" stroke-width="${(r * .06).toFixed(1)}"/>`; };
  const coinSvg = sz => `<svg viewBox="-12 -12 24 24" width="${sz}" height="${sz}" aria-hidden="true"><defs><radialGradient id="hsCoinH" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#ff8d80"/><stop offset=".55" stop-color="#d8332f"/><stop offset="1" stop-color="#8c1612"/></radialGradient></defs>${coin(11).replace('url(#hsCoin)', 'url(#hsCoinH)')}</svg>`;

  // ---------------------------------------------------------------- desenho do mapa
  const hash = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; };
  function edgePath(a, b) {
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1, sgn = (hash(a.id + b.id) & 1) ? 1 : -1, off = len * .09 * sgn;
    const mx = (a.x + b.x) / 2 - dy / len * off, my = (a.y + b.y) / 2 + dx / len * off;
    return `M${a.x} ${a.y} Q${mx.toFixed(1)} ${my.toFixed(1)} ${b.x} ${b.y}`;
  }
  const EDGES = []; NOS.forEach(a => a.viz.forEach(v => { if (a.id < v) EDGES.push([a, BY[v]]); }));
  function nodeSvg(n) {
    const T = TIPOS[n.tipo], r = T.r, num = n.id[0] === 'B' ? String(+n.id.slice(1)) : n.id.slice(1);
    let inner = '';
    if (n.tipo === 'boss') inner = `<circle class="hs-ring r1" r="${r + 18}"/><circle class="hs-ring r2" r="${r + 44}"/><circle r="${r}" class="body"/><image href="selo.png" x="${-r * .78}" y="${-r * 1.0}" width="${r * 1.56}" height="${r * 2.0}" preserveAspectRatio="xMidYMid meet"/>`;
    else if (n.tipo === 'loja') inner = `<circle class="halo" r="${r + 7}"/>${coin(r)}<text class="lbl" y="${r + 16}">${esc(num)}</text>`;
    else {
      const g = { evento: 'bolt', elite: 'star', miniboss: 'swords', guardiao: 'crown' }[n.tipo];
      inner = `<circle class="halo" r="${r + 8}"/><circle class="body" r="${r}"/>` +
        (g ? `<g class="glyph" transform="scale(${(r / 14).toFixed(2)})">${ICON[g]}</g><text class="lbl" y="${r + 16}">${esc(num)}</text>` : `<text class="num" y="5">${esc(num)}</text>`);
    }
    return `<g class="n t-${n.tipo}" data-id="${n.id}" transform="translate(${n.x} ${n.y})" style="--c:${T.cor}" tabindex="0" role="button" aria-label="${esc(nome(n))}">${inner}<g class="chk" transform="translate(${r * .72} ${-r * .72})"><circle r="9"/><path d="M-4 0 L-1 3 L5 -3.5" fill="none" stroke="#1d1400" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></g></g>`;
  }
  function nome(n) {
    if (n.tipo === 'boss') return 'Boss final: A União';
    if (n.tipo === 'guardiao') return 'Guardião da ' + LADOS[n.lado];
    if (n.tipo === 'loja') return 'Loja ' + n.id.slice(1);
    return 'Batalha ' + String(+n.id.slice(1)).padStart(3, '0');
  }

  // ---------------------------------------------------------------- telas
  let root = null, view = 'hub', cam = { x: 0, y: 0, k: .7 }, svg = null, camG = null, sheet = null;

  function mount(s) {
    root = s; load();
    s.innerHTML = `<div class="hs"><div class="hs-hub" id="hsHub"></div><div class="hs-map" id="hsMap" hidden></div></div>`;
    hub();
  }

  // ---- tela inicial: só o selo, "Novo jogo" e "Continuar"
  function hub() {
    view = 'hub'; load();
    const h = $('#hsHub', root), mp = $('#hsMap', root); mp.hidden = true; h.hidden = false;
    const c = S;
    h.innerHTML = `      <button class="hs-back ibtn" data-a="sair" aria-label="Sair do modo história">←</button>
      <div class="hs-hubin"><div class="hs-seal"></div><h1>A União</h1><p class="hs-sub">Modo história</p>
        <div class="hs-btns"><button class="btn primary big" data-a="novo">Novo jogo</button>
        <button class="btn big" data-a="cont" ${c ? '' : 'disabled'}>Continuar${c ? `<small>${nBat()} / ${BATALHAS.length} batalhas · partida pela ${LADOS[c.start].toLowerCase()}</small>` : ''}</button></div></div>`;
    h.onclick = e => {
      const b = e.target.closest('[data-a]'); if (!b || b.disabled) return; SND.init(); SND.play('click');
      if (b.dataset.a === 'sair') U.show('menu');
      else if (b.dataset.a === 'cont') openMap();
      else if (b.dataset.a === 'novo') { if (S) confirmNovo(); else sortear(); }
    };
  }
  function confirmNovo() {
    const box = el(`<div class="hs-conf"><h3>Começar uma nova jornada?</h3><p>O progresso atual (${nBat()} batalhas vencidas) será apagado.</p><div class="row"><button class="btn" data-a="n">Cancelar</button><button class="btn primary" data-a="s">Nova jornada</button></div></div>`);
    const m = U.modal(box, { cls: 'hs-modal' });
    box.onclick = e => { const b = e.target.closest('[data-a]'); if (!b) return; SND.play('click'); m.close(); if (b.dataset.a === 's') sortear(); };
  }
  // ---- ponto de partida: uma das 4 extremidades, sorteada em silêncio (sem tela de sorteio)
  function sortear() {
    const ladoSel = ['esq', 'cima', 'dir', 'baixo'][Math.floor(Math.random() * 4)];
    S = { v: 1, start: ladoSel, startId: M.starts[ladoSel], pos: M.starts[ladoSel], cleared: {}, pend: 0, owned: [], created: Date.now() }; save();
    if (window.DSCinema) window.DSCinema.play(() => openMap(true, true)); else openMap(true);
  }

  // ---- mapa
  function openMap(novo, intro) {
    if (!S) return; view = 'map';
    const h = $('#hsHub', root), mp = $('#hsMap', root); h.hidden = true; mp.hidden = false;
    mp.innerHTML = `<svg class="hs-svg" id="hsSvg" aria-label="Mapa da jornada"><defs><radialGradient id="hsCoin" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#ff8d80"/><stop offset=".55" stop-color="#d8332f"/><stop offset="1" stop-color="#8c1612"/></radialGradient>
        <radialGradient id="hsLight"><stop offset="0" stop-color="#d9c8ff" stop-opacity=".34"/><stop offset=".45" stop-color="#8f6cff" stop-opacity=".14"/><stop offset="1" stop-color="#8f6cff" stop-opacity="0"/></radialGradient><radialGradient id="hsLightH"><stop offset="0" stop-color="#ffe9b0" stop-opacity=".5"/><stop offset=".4" stop-color="#ffc46b" stop-opacity=".2"/><stop offset="1" stop-color="#ffc46b" stop-opacity="0"/></radialGradient>
        <filter id="hsGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter></defs>
        <g id="hsCam"><g class="hs-edges">${EDGES.map(([a, b]) => `<path class="e" data-a="${a.id}" data-b="${b.id}" d="${edgePath(a, b)}"/>`).join('')}</g><g id="hsLights"></g><g class="hs-nodes">${NOS.map(nodeSvg).join('')}</g><g id="hsMarks"></g>${heroSvg()}</g></svg>
      <div class="hs-hud top"><button class="ibtn" data-a="back" aria-label="Voltar">←</button><div class="hs-ttl">A União</div>
        <div class="hs-pill" title="Pêndulos">${coinSvg(20)}<b id="hsPend">${S.pend}</b></div><div class="hs-pill" title="Cartas no bestiário"><span class="ci">▮</span><b id="hsCards">${S.owned.length}</b><small>/ ${U.D.CARTAS.length}</small></div></div>
      <div class="hs-hud ctl"><button class="ibtn" data-a="zin" aria-label="Aproximar">+</button><button class="ibtn" data-a="zout" aria-label="Afastar">−</button><button class="ibtn" data-a="start" aria-label="Ir ao ponto de partida">⌖</button><button class="ibtn" data-a="fit" aria-label="Ver o mapa inteiro">▣</button><button class="ibtn" data-a="leg" aria-label="Legenda e opções">?</button></div>
      <div class="hs-sheet" id="hsSheet" hidden></div><div class="hs-toast" id="hsToast" hidden></div><div class="hs-dark" id="hsDark"></div>`;
    svg = $('#hsSvg', root); camG = $('#hsCam', root); sheet = $('#hsSheet', root);
    paintAll(); bindMap(mp); heroPlace(posId(), false);
    try { SND.histPlay('mapa'); } catch (e) { }
    mp.classList.toggle('intro', !!intro);
    if (intro) {   // o mundo começa preto e vai clareando; o boneco aparece depois
      const dk = $('#hsDark', root), hr = $('#hsHero', root), red = document.body.classList.contains('reduce');
      if (!red) { dk.style.transition = 'none'; dk.classList.add('on'); hr.style.opacity = 0; void dk.offsetWidth; dk.style.transition = ''; setTimeout(() => { dk.classList.remove('on'); }, 700); setTimeout(() => { hr.style.transition = 'opacity 2s ease'; hr.style.opacity = 1; SND.play('banner'); }, 3600); setTimeout(() => { mp.classList.remove('intro'); }, 4200); }
      else mp.classList.remove('intro');
    }
    requestAnimationFrame(() => { const st = BY[S.startId]; const ps = BY[posId()]; if (novo) { fit(false); setTimeout(() => centerOn(ps.x, ps.y, .8, true), 450); } else centerOn(ps.x, ps.y, .7, false); });
  }
  function paintAll() {
    $$('.hs-edges .e', root).forEach(p => { p.setAttribute('class', 'e ' + edgeState(p.dataset.a, p.dataset.b)); });
    $$('.n', root).forEach(g => paintNode(g));
    svg.classList.toggle('aberto', !!P.aberto); paintLuz();
    const mk = $('#hsMarks', root), st = BY[S.startId];
    const flag = (n, txt, cls) => `<g class="flag ${cls}" transform="translate(${n.x} ${n.y - TIPOS[n.tipo].r - 30})"><path d="M0 22 V-6 L18 0 L0 6" fill="currentColor"/><text x="24" y="3">${txt}</text></g>`;
    mk.innerHTML = flag(st, 'Início', 'on') + (P.aberto ? Object.values(M.starts).filter(i => i !== S.startId).map(i => flag(BY[i], 'Partida', 'off')).join('') : '');
    const pe = $('#hsPend', root), pc = $('#hsCards', root); if (pe) pe.textContent = S.pend; if (pc) pc.textContent = S.owned.length;
  }
  // ---- escuridão: só o boneco, os pontos vencidos e os vizinhos deles aparecem; mais um anel apagado de silhuetas
  function paintLuz() {
    const esc_ = P.escuro !== false; svg.classList.toggle('escuro', esc_);
    const lg = $('#hsLights', root); if (lg) lg.innerHTML = '';
    const luz = new Set([posId()]); NOS.forEach(n => { if (cleared(n.id)) luz.add(n.id); });
    const perto = new Set(luz); luz.forEach(i => BY[i].viz.forEach(v => perto.add(v)));
    const longe = new Set(perto); perto.forEach(i => BY[i].viz.forEach(v => longe.add(v)));
    $$('.n', root).forEach(g => { const i = g.dataset.id; g.classList.toggle('fog', esc_ && !longe.has(i)); g.classList.toggle('far1', esc_ && longe.has(i) && !perto.has(i)); });
    $$('.hs-edges .e', root).forEach(p => { const a = p.dataset.a, b = p.dataset.b; p.classList.toggle('fog', esc_ && !(luz.has(a) || luz.has(b) || (perto.has(a) && perto.has(b)))); p.classList.toggle('far1', esc_ && !(luz.has(a) || luz.has(b)) && (perto.has(a) && perto.has(b))); });
    if (esc_ && lg) { const here = posId(); lg.innerHTML = [...luz].map(i => { const n = BY[i], hero = i === here, r = hero ? 330 : (cleared(i) ? 210 : 160); return `<circle class="hs-light" cx="${n.x}" cy="${n.y}" r="${r}" ${hero ? 'style="fill:url(#hsLightH)"' : ''}/>`; }).join(''); }
  }
  function paintNode(g) {
    const n = BY[g.dataset.id], ok = cleared(n.id), av = available(n.id);
    g.classList.toggle('done', ok); g.classList.toggle('avail', av && !ok); g.classList.toggle('lock', !av && !ok); g.classList.toggle('isstart', n.id === S.startId);
    if (n.tipo === 'boss') g.classList.toggle('opened', bossOpen());
  }

  // ---- câmera: arrastar, pinça, roda do mouse
  const view$ = () => { const r = svg.getBoundingClientRect(); return { w: r.width, h: r.height }; };
  function applyCam(anim) {
    const { w, h } = view$();
    const lim = (R + 260) * cam.k;   // não deixa o mapa sair da tela
    cam.x = Math.max(w / 2 - lim, Math.min(w / 2 + lim, cam.x)); cam.y = Math.max(h / 2 - lim, Math.min(h / 2 + lim, cam.y));
    camG.style.transition = anim ? 'transform .75s cubic-bezier(.3,.8,.3,1)' : 'none';
    camG.style.transform = `translate(${cam.x}px,${cam.y}px) scale(${cam.k})`;
    svg.classList.toggle('far', cam.k < .42);
  }
  function centerOn(mx, my, k, anim) { const { w, h } = view$(); cam.k = k == null ? cam.k : k; cam.x = w / 2 - mx * cam.k; cam.y = h / 2 - my * cam.k; applyCam(anim); }
  function fit(anim) { const { w, h } = view$(); const k = Math.min(w, h) / (2 * (R + 120)); cam.k = k; cam.x = w / 2; cam.y = h / 2; applyCam(anim); }
  function zoomAt(px, py, f, anim) { const k = Math.max(.25, Math.min(2.6, cam.k * f)); const r = k / cam.k; cam.x = px - (px - cam.x) * r; cam.y = py - (py - cam.y) * r; cam.k = k; applyCam(anim); }
  function bindMap(mp) {
    const ptrs = new Map(); let moved = 0, startPt = null, pinch0 = null;
    svg.style.touchAction = 'none';
    svg.addEventListener('pointerdown', e => { svg.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); moved = 0; startPt = { x: e.clientX, y: e.clientY, t: e.target }; if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch0 = { d: Math.hypot(a.x - b.x, a.y - b.y), k: cam.k }; } });
    svg.addEventListener('pointermove', e => {
      const p = ptrs.get(e.pointerId); if (!p) return;
      if (ptrs.size === 1) { const dx = e.clientX - p.x, dy = e.clientY - p.y; moved += Math.abs(dx) + Math.abs(dy); if (moved > 8) { cam.x += dx; cam.y += dy; applyCam(false); } p.x = e.clientX; p.y = e.clientY; }
      else if (ptrs.size === 2 && pinch0) { p.x = e.clientX; p.y = e.clientY; const [a, b] = [...ptrs.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y), r = svg.getBoundingClientRect(); zoomAt((a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top, (pinch0.k * d / pinch0.d) / cam.k, false); moved = 99; }
    });
    const up = e => { if (!ptrs.has(e.pointerId)) return; ptrs.delete(e.pointerId); if (ptrs.size < 2) pinch0 = null;
      if (!ptrs.size && moved <= 8 && startPt) { const g = (startPt.t.closest && startPt.t.closest('.n')); if (g) openNode(g.dataset.id); else closeSheet(); } };
    svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', e => { ptrs.delete(e.pointerId); pinch0 = null; });
    svg.addEventListener('wheel', e => { e.preventDefault(); const r = svg.getBoundingClientRect(); zoomAt(e.clientX - r.left, e.clientY - r.top, e.deltaY < 0 ? 1.15 : 1 / 1.15, false); }, { passive: false });
    svg.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.closest && e.target.closest('.n')) { e.preventDefault(); openNode(e.target.closest('.n').dataset.id); } });
    mp.addEventListener('click', e => {
      const b = e.target.closest('.hs-hud [data-a]'); if (!b) return; SND.init(); SND.play('click'); const { w, h } = view$();
      const a = b.dataset.a;
      if (a === 'back') hub();
      else if (a === 'zin') zoomAt(w / 2, h / 2, 1.35, true);
      else if (a === 'zout') zoomAt(w / 2, h / 2, 1 / 1.35, true);
      else if (a === 'start') { const st = BY[posId()]; centerOn(st.x, st.y, .8, true); }
      else if (a === 'fit') fit(true);
      else if (a === 'leg') legenda();
    });
    window.addEventListener('resize', () => { if (view === 'map' && svg && svg.isConnected) applyCam(false); });
  }


  // ---- o boneco anda casa por casa (como no mapa do modo história do Smash): nada de pular para um ponto distante
  const posId = () => (S && S.pos && BY[S.pos]) ? S.pos : S.startId;
  const passa = id => P.aberto || cleared(id) || BY[id].tipo === 'loja';   // pontos por onde se pode atravessar
  // caminhos possíveis a partir da posição: atravessa só pontos já vencidos (ou lojas); o último passo pode ser um ponto novo (aí o boneco para e é preciso duelar)
  function alcance() {
    const from = posId(), prev = { [from]: null }, q = [from];
    while (q.length) {
      const u = q.shift();
      if (u !== from && !passa(u)) continue;                        // ponto ainda não vencido: o boneco para ali
      if (u === from && !passa(u) && !P.aberto) { /* parado num duelo pendente: só pode recuar para pontos já vencidos */ }
      for (const v of BY[u].viz) {
        if (v in prev) continue;
        if (v === M.boss && !bossOpen() && !P.aberto) continue;
        if (u === from && !passa(u) && !P.aberto && !passa(v)) continue;
        prev[v] = u; q.push(v);
      }
    }
    return prev;
  }
  function caminho(to) { const prev = alcance(); if (!(to in prev)) return null; const p = []; for (let x = to; x != null; x = prev[x]) p.unshift(x); return p; }
  let andando = false;
  function heroSvg() {
    return `<g id="hsHero" class="hs-hero"><circle class="hr-sh" r="15" cy="13"/><circle class="hr-body" r="14" cy="-4"/><circle class="hr-core" r="5" cy="-4"/><path class="hr-pin" d="M0 12 L-6 0 H6 Z"/></g>`;
  }
  function heroPlace(id, anim) {
    const h = $('#hsHero', root); if (!h) return; const n = BY[id], r = TIPOS[n.tipo].r;
    h.style.transition = anim ? 'transform .34s linear' : 'none'; h.style.transform = `translate(${n.x}px,${n.y - r - 10}px)`;
  }
  async function andar(to) {
    if (andando) return; const p = caminho(to); if (!p || p.length < 2) return;
    andando = true; closeSheet(); const red = document.body.classList.contains('reduce');
    for (let i = 1; i < p.length; i++) {
      const n = BY[p[i]]; S.pos = n.id; heroPlace(n.id, !red); SND.play('tick'); paintLuz();
      centerOn(n.x, n.y, cam.k < .6 ? .75 : null, !red);
      await new Promise(r => setTimeout(r, red ? 60 : 360));
    }
    save(); andando = false; paintAll(); openNode(p[p.length - 1]);
  }

  // ---- painel de cada ponto
  let curId = null;
  function closeSheet() { if (sheet) { sheet.hidden = true; curId = null; $$('.n.sel', root).forEach(g => g.classList.remove('sel')); } }
  function openNode(id) {
    if (andando) return; const n = BY[id], T = TIPOS[n.tipo]; curId = id; SND.play('click');
    $$('.n.sel', root).forEach(g => g.classList.remove('sel')); const g = $('.n[data-id="' + id + '"]', root); if (g) g.classList.add('sel');
    const ok = cleared(id), av = available(id), aqui = id === posId(), cam_ = aqui ? null : caminho(id);
    const cartas = n.tipo === 'loja' ? '' : `<div class="hs-cards">${Array.from({ length: 7 }, () => '<span class="hs-cb"><b>?</b></span>').join('')}</div><p class="hint">As cartas do inimigo aparecem depois do primeiro duelo.</p>`;
    const jog = n.tipo === 'miniboss' ? 'Duelo de 3 ou 4 jogadores' : n.tipo === 'guardiao' ? 'Duelo de 3 jogadores' : n.tipo === 'boss' ? 'Você contra o Boss' : n.tipo === 'loja' ? 'Loja de cartas' : 'Você contra 1 inimigo';
    sheet.innerHTML = `<button class="ibtn x" data-a="x" aria-label="Fechar">✕</button>
      <div class="hs-sh-h"><span class="hs-dot" style="background:${T.cor}"></span><div><h3>${esc(nome(n))}</h3><small>${esc(T.nome)} · ${esc(REGIAO[n.tier])} · lado ${esc(LADOS[n.lado].toLowerCase())}</small></div></div>
      <p class="hs-st ${ok ? 'hs-ok' : av ? 'hs-av' : 'hs-lk'}">${ok ? '✓ Vencida' : av ? 'Disponível' : 'Caminho fechado'}</p>
      <p>${esc(T.desc)}</p><p class="hint">${esc(jog)}${n.id === M.boss && !bossOpen() ? ` · faltam ${GUARD.filter(x => !cleared(x)).length} guardiões` : ''}</p>${cartas}
      <div class="row">${aqui ? `<button class="btn primary" disabled>${n.tipo === 'loja' ? 'Entrar (em breve)' : ok ? 'Você está aqui' : 'Duelar (em breve)'}</button>` : cam_ ? `<button class="btn primary" data-a="go">Caminhar até aqui · ${cam_.length - 1} ${cam_.length === 2 ? 'passo' : 'passos'}</button>` : `<button class="btn" disabled>Fora de alcance</button>`}${P.aberto ? `<button class="btn" data-a="win">${ok ? 'Desfazer vitória (teste)' : 'Marcar vencida (teste)'}</button>` : ''}</div>`;
    sheet.hidden = false; ensureVisible(n);
    sheet.onclick = e => { const b = e.target.closest('[data-a]'); if (!b) return; if (b.dataset.a === 'x') closeSheet(); else if (b.dataset.a === 'win') toggleWin(id); else if (b.dataset.a === 'go') andar(id); };
  }
  function ensureVisible(n) {   // o painel cobre a parte de baixo: leva o ponto para a área livre de cima
    const { w, h } = view$(), sh = sheet.getBoundingClientRect().height, free = Math.max(120, h - sh), sy = n.y * cam.k + cam.y, sx = n.x * cam.k + cam.x;
    const want = Math.min(free / 2 + 30, free - 70);
    if (sy > free - 50 || sy < 60 || sx < 30 || sx > w - 30) { cam.y += want - sy; cam.x += Math.max(30, Math.min(w - 30, sx)) - sx; applyCam(true); }
  }
  function toggleWin(id) {
    const wasOpen = bossOpen(), ok = cleared(id);
    if (ok) delete S.cleared[id]; else S.cleared[id] = 1;
    save(); SND.play(ok ? 'tick' : 'capture'); paintAll(); openNode(id);
    const g = $('.n[data-id="' + id + '"]', root); if (g && !ok) { g.classList.remove('pop'); void g.getBoundingClientRect(); g.classList.add('pop'); }
    if (!wasOpen && bossOpen()) bossAbre();
  }
  function bossAbre() {
    closeSheet(); const b = BY[M.boss]; const red = document.body.classList.contains('reduce');
    centerOn(b.x, b.y, .75, !red);
    setTimeout(() => { SND.play('banner'); const bg = $('.n.t-boss', root); if (bg) { bg.classList.add('burst'); setTimeout(() => bg.classList.remove('burst'), 2600); } toast('Os 4 guardiões caíram. O centro da teia se abriu.'); }, red ? 50 : 800);
  }
  function toast(t) { const x = $('#hsToast', root); if (!x) return; x.textContent = t; x.hidden = false; clearTimeout(x._t); x._t = setTimeout(() => { x.hidden = true; }, 3200); }

  // ---- baú: tremida, tampa abre, luz, e a recompensa sobe (cartas novas ou pêndulos). premio = {pend:n} | {cartas:[ids]}
  function bauSvg() {
    return `<svg class="bau-svg" viewBox="-60 -60 120 110" aria-hidden="true"><defs><linearGradient id="bGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe29a"/><stop offset="1" stop-color="#b9791a"/></linearGradient><linearGradient id="bWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a5a34"/><stop offset="1" stop-color="#4a2c16"/></linearGradient></defs>
      <ellipse cx="0" cy="42" rx="48" ry="7" fill="#0008"/>
      <g class="bau-base"><rect x="-40" y="-6" width="80" height="46" rx="6" fill="url(#bWood)" stroke="#2a1608" stroke-width="2"/><rect x="-40" y="10" width="80" height="6" fill="url(#bGold)"/><rect x="-6" y="6" width="12" height="16" rx="2" fill="url(#bGold)" stroke="#6b430c"/></g>
      <g class="bau-lid"><path d="M-40 -6 V-22 Q-40 -42 0 -42 Q40 -42 40 -22 V-6 Z" fill="url(#bWood)" stroke="#2a1608" stroke-width="2"/><path d="M-40 -16 H40" stroke="url(#bGold)" stroke-width="5"/></g></svg>`;
  }
  function abrirBau(premio, done) {
    const red = document.body.classList.contains('reduce'), pend = premio.pend | 0, cartas = premio.cartas || [];
    const ov = el(`<div class="bau-ov"><div class="bau-stage"><div class="bau-glow"></div><div class="bau-box">${bauSvg()}</div><div class="bau-prize"></div></div><button class="btn primary bau-ok" hidden>Continuar</button></div>`);
    document.body.appendChild(ov);
    const box = $('.bau-box', ov), prize = $('.bau-prize', ov), ok = $('.bau-ok', ov); let fim = false;
    const T = (f, ms) => setTimeout(() => { if (!fim) f(); }, red ? Math.min(ms, 60) : ms);
    box.classList.add('shake'); SND.play('bauShake');
    T(() => { box.classList.remove('shake'); box.classList.add('open'); ov.classList.add('lit'); SND.play('bauOpen'); }, 1000);
    T(() => {
      if (pend > 0) {
        prize.innerHTML = Array.from({ length: Math.min(14, 4 + pend) }, (_, i) => `<span class="bau-coin" style="--dx:${(Math.random() * 220 - 110).toFixed(0)}px;--dy:${(-70 - Math.random() * 120).toFixed(0)}px;--d:${(i * 60)}ms">${coinSvg(30)}</span>`).join('') + `<div class="bau-amt">+${pend}</div>`; SND.play('bauCoin');
      }
      if (cartas.length) {
        prize.classList.add('cards'); cartas.forEach((id, i) => { const w = el('<div class="bau-card" style="--d:' + (i * 280) + 'ms"></div>'); w.append(U.cardEl(id, { up: true, noanim: true, cw: cartas.length > 2 ? 92 : 118 })); prize.append(w); setTimeout(() => { if (!fim) SND.play('bauCard'); }, red ? 0 : i * 280); });
        if (cartas.some(id => U.CARDS[id] && U.CARDS[id].raridade === 'lendaria')) T(() => SND.play('legend'), 400);
      }
      ok.hidden = false;
    }, 1700);
    const fechar = () => { if (fim) return; fim = true; ov.classList.add('out'); setTimeout(() => ov.remove(), 400); if (S) { S.pend = (S.pend | 0) + pend; cartas.forEach(id => { if (!S.owned.includes(id)) S.owned.push(id); }); save(); if (view === 'map' && svg && svg.isConnected) paintAll(); } done && done(); };
    ok.onclick = () => { SND.play('click'); fechar(); };
  }
  function sorteioBau() {   // teste: 60% pêndulos, 40% de 1 a 3 cartas novas (ainda não possuídas)
    const faltam = U.D.CARTAS.map(c => c.id).filter(id => !(S.owned || []).includes(id));
    if (Math.random() < .6 || !faltam.length) return { pend: 5 + Math.floor(Math.random() * 16) };
    const n = 1 + Math.floor(Math.random() * 3), pick = []; while (pick.length < n && faltam.length) pick.push(faltam.splice(Math.floor(Math.random() * faltam.length), 1)[0]);
    return { cartas: pick };
  }

  // ---- legenda e opções de teste
  function legenda() {
    const L = Object.keys(TIPOS).filter(k => k !== 'boss').map(k => `<li><span class="hs-dot" style="background:${TIPOS[k].cor}"></span><b>${TIPOS[k].nome}</b><span>${esc(TIPOS[k].desc)}</span></li>`).join('');
    const contagem = {}; NOS.forEach(n => { contagem[n.tipo] = (contagem[n.tipo] || 0) + 1; });
    const box = el(`<div class="hs-leg"><h3>Legenda</h3><ul>${L}<li><span class="hs-dot" style="background:#fbf9ff"></span><b>Boss final</b><span>No centro, protegido pelos 4 guardiões.</span></li></ul>
      <p class="hint">${BATALHAS.length} batalhas (${['normal', 'evento', 'elite', 'miniboss', 'guardiao', 'boss'].map(k => contagem[k] + ' ' + TIPOS[k].nome.toLowerCase()).join(', ')}) e ${contagem.loja} lojas.</p>
      <h3>Opções</h3><label class="hs-sw"><input type="checkbox" ${P.escuro !== false ? 'checked' : ''} data-a="escuro"> Mapa no escuro: só o que está perto do boneco aparece</label>
      <div class="row"><button class="btn sm" data-a="intro">Rever introdução</button><button class="btn sm" data-a="bau">Testar baú</button></div><h3>Teste (etapa 1)</h3><label class="hs-sw"><input type="checkbox" ${P.aberto ? 'checked' : ''} data-a="aberto"> Mapa aberto: todos os pontos liberados</label>
      <div class="row"><button class="btn sm" data-a="reset">Zerar vitórias</button><button class="btn sm primary" data-a="ok">Fechar</button></div></div>`);
    const m = U.modal(box, { cls: 'hs-modal' });
    box.onclick = e => {
      const b = e.target.closest('[data-a]'); if (!b) return;
      if (b.dataset.a === 'ok') { SND.play('click'); m.close(); }
      else if (b.dataset.a === 'bau') { SND.play('click'); m.close(); abrirBau(sorteioBau()); }
      else if (b.dataset.a === 'intro') { SND.play('click'); m.close(); if (window.DSCinema) window.DSCinema.play(() => { if (view === 'map') { try { SND.histPlay('mapa'); } catch (e) { } } }); }
      else if (b.dataset.a === 'reset') { SND.play('click'); S.cleared = {}; save(); paintAll(); closeSheet(); toast('Vitórias zeradas.'); }
    };
    box.addEventListener('change', e => { if (e.target.dataset.a === 'aberto') { P.aberto = e.target.checked; save(); paintAll(); closeSheet(); } else if (e.target.dataset.a === 'escuro') { P.escuro = e.target.checked; save(); paintAll(); } });
  }

  window.DSHistoria = { abrirBau, mount, show: hub, data: M, state: () => S };
})();
