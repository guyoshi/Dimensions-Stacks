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
    miniboss: { nome: 'Arauto',  cor: '#ff5a7a', r: 28, desc: 'Duelo de 3 ou 4 jogadores. Prende um membro da União: vencer liberta o herói para a sua equipe e abre o minigame do setor.' },
    guardiao: { nome: 'Guardião',  cor: '#ff9a3c', r: 36, desc: 'Um dos 4 guardiões espalhados pelo mapa. Cada um vencido tira 30 pontos de cada atributo das cartas da Besta.' },
    loja:     { nome: 'Loja',      cor: '#7dffb0', r: 21, desc: 'Compre cartas com pêndulos.' },
    boss:     { nome: 'Boss final', cor: '#fbf9ff', r: 66, desc: 'A Besta, no núcleo da galáxia.' },
  };
  const LADOS = { esq: 'Esquerda', cima: 'Cima', dir: 'Direita', baixo: 'Baixo' };
  const REGIAO = { 1: 'Região externa', 2: 'Região média', 3: 'Região interna', 4: 'Núcleo' };
  const NOS = M.nos, BY = {}; NOS.forEach(n => { BY[n.id] = n; });
  const BATALHAS = NOS.filter(n => n.tipo !== 'loja');
  const GUARD = Object.values(M.guardioes);
  // cada arauto (tipo 'miniboss') prende um membro da União; vencê-lo o liberta e abre o minigame do setor/série
  const LIBERTA = { B059: 'D06', B066: 'M01', B062: 'J03', B080: 'B01', B064: 'S01', B072: 'M10', B057: 'V15', B078: 'V02' };
  const MINIS = Object.keys(LIBERTA), UNIAO = Object.values(LIBERTA);
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
  let P = Object.assign({ aberto: false, escuro: true }, rd(PKEY, {}));   // preferências (mapa aberto = modo teste, desligado por padrão: só se avança vencendo)
  if (P.v2 !== 1) { P.aberto = false; P.v2 = 1; try { wr(PKEY, P); } catch (e) { } }   // migração: o mapa aberto (teste) passa a vir desligado
  const save = () => { if (S) wr(KEY, S); wr(PKEY, P); };
  const load = () => { const s = rd(KEY, null); S = s && s.v === 1 && BY[s.startId] ? s : null; return S; };

  // ---------------------------------------------------------------- regras do mapa
  const cleared = id => !!(S && S.cleared[id]);
  const bossOpen = () => true;   // REGRA (autor, 29/10): a Besta pode ser enfrentada desde o início; cada guardião vivo dá +30 em todos os atributos às cartas dela
  const nBroches = () => Object.keys((S && S.broches) || {}).length;   // um broche por série (7); só o contador aparece, o uso é segredo
  const guardVivos = () => GUARD.filter(x => !cleared(x)).length, bonusBoss = () => 30 * guardVivos();
  // liberados: vizinhos de pontos vencidos, mais o ponto de partida. Loja não bloqueia: ao alcançá-la, o que vem depois também fica liberado.
  let libKey = '', libSet = new Set();
  function liberados() {
    const key = Object.keys(S.cleared).sort().join() + '|' + S.startId; if (key === libKey) return libSet;
    const A = new Set([S.startId]), pilha = Object.keys(S.cleared), vistos = new Set();
    while (pilha.length) { const id = pilha.pop(); if (vistos.has(id)) continue; vistos.add(id); BY[id].viz.forEach(v => { if (v === M.boss) return; A.add(v); if (BY[v].tipo === 'loja') pilha.push(v); }); }
    libKey = key; libSet = A; return A;
  }
  const aberto_ = id => cleared(id) || (BY[id].tipo === 'loja' && liberados().has(id));   // ponto "aberto": venceu, ou é loja já alcançada
  function available(id) {
    if (!S) return false;
    if (P.aberto) return true;
    if (cleared(id)) return true;
    if (id === M.boss) return bossOpen();
    return liberados().has(id);
  }
  function edgeState(a, b) {
    if (aberto_(a) && aberto_(b)) return 'lit';
    if (aberto_(a) || aberto_(b)) return 'open';
    return P.aberto ? 'open' : 'dark';   // cinza: ramo que sai de um ponto liberado, ainda por vencer
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
    if (n.tipo === 'boss') return 'Boss final: A Besta';
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
  let voltarMapa = false;
  function hub() {
    if (voltarMapa && S) { voltarMapa = false; openMap(); return; }
    view = 'hub'; load(); try { if (SND.histNow) SND.histStop(); } catch (e) { }   // tela inicial: volta a música normal do menu
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
  // cartas iniciais: 6 comuns + 1 épica (sem a Besta nem a União)
  function iniciais() {
    const pool = U.D.CARTAS.filter(c => !c.uniao && c.id !== 'S11'), sh = a => a.map(x => [Math.random(), x]).sort((x, y) => x[0] - y[0]).map(x => x[1]);
    return sh(pool.filter(c => c.raridade === 'comum')).slice(0, 6).concat(sh(pool.filter(c => c.raridade === 'epica')).slice(0, 1)).map(c => c.id);
  }
  // ---- ponto de partida: uma das 4 extremidades, sorteada em silêncio (sem tela de sorteio)
  function sortear() {
    const ladoSel = ['esq', 'cima', 'dir', 'baixo'][Math.floor(Math.random() * 4)];
    S = { v: 1, start: ladoSel, startId: M.starts[ladoSel], pos: M.starts[ladoSel], cleared: {}, pend: 0, owned: iniciais(), created: Date.now() }; S.npc = S.owned[Math.floor(Math.random() * S.owned.length)]; save();
    if (window.DSCinema) window.DSCinema.play((pulou, v) => { if (v && v.nome) { S.nome = v.nome; save(); } openMap(true, true); }); else openMap(true);
  }

  // ---- mapa
  function openMap(novo, intro) {
    if (!S) return; view = 'map';
    const h = $('#hsHub', root), mp = $('#hsMap', root); h.hidden = true; mp.hidden = false;
    mp.innerHTML = `<svg class="hs-svg" id="hsSvg" aria-label="Mapa da jornada"><defs><radialGradient id="hsCoin" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#ff8d80"/><stop offset=".55" stop-color="#d8332f"/><stop offset="1" stop-color="#8c1612"/></radialGradient>
        <radialGradient id="hsLight"><stop offset="0" stop-color="#d9c8ff" stop-opacity=".34"/><stop offset=".45" stop-color="#8f6cff" stop-opacity=".14"/><stop offset="1" stop-color="#8f6cff" stop-opacity="0"/></radialGradient><radialGradient id="hsLightH"><stop offset="0" stop-color="#ffe9b0" stop-opacity=".5"/><stop offset=".4" stop-color="#ffc46b" stop-opacity=".2"/><stop offset="1" stop-color="#ffc46b" stop-opacity="0"/></radialGradient>
        <filter id="hsGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter></defs>
        <g id="hsCam"><g class="hs-edges">${EDGES.map(([a, b]) => `<path class="e" data-a="${a.id}" data-b="${b.id}" d="${edgePath(a, b)}"/>`).join('')}</g><g id="hsLights"></g><g class="hs-nodes">${NOS.map(nodeSvg).join('')}</g><g id="hsMarks"></g>${heroSvg()}<g id="hsArrows"></g></g></svg>
      <div class="hs-hud top"><button class="ibtn" data-a="back" aria-label="Voltar">←</button><div class="hs-ttl">A União</div>
        <div class="hs-pill" title="Pêndulos">${coinSvg(20)}<b id="hsPend">${S.pend}</b></div><button class="hs-pill hs-bro" data-a="broches" title="Broches" aria-label="Broches"><span class="ci">◈</span><b id="hsBro">${nBroches()}</b><small>/ 7</small></button><button class="hs-pill" data-a="cartas" title="Minhas cartas" aria-label="Minhas cartas"><span class="ci">▮</span><b id="hsCards">${S.owned.length}</b><small>/ ${U.D.CARTAS.length}</small></button></div>
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
    svg.classList.toggle('aberto', !!P.aberto); paintLuz(); paintSetas();
    const mk = $('#hsMarks', root); if (mk) mk.innerHTML = '';
    const pb = $('#hsBro', root); if (pb) pb.textContent = nBroches(); const pe = $('#hsPend', root), pc = $('#hsCards', root); if (pe) pe.textContent = S.pend; if (pc) pc.textContent = S.owned.length;
  }
  // ---- o que aparece: só o que foi vencido ilumina. Caminhos e bifurcações surgem ao vencer uma fase; os vizinhos aparecem (abertos ou trancados) mesmo com o boneco longe. O núcleo está sempre visível.
  const NUCLEO = new Set(NOS.filter(n => n.tier === 4).map(n => n.id));
  function paintLuz() {   // visibilidade: só se vê o ponto onde está, o que já venceu e os PRÓXIMOS pontos (ramos cinza). O que está além fica escondido; o núcleo é sempre visível.
    const ocultar = P.escuro !== false; svg.classList.toggle('escuro', ocultar);
    const rev = new Set([posId()]); NOS.forEach(n => { if (aberto_(n.id)) rev.add(n.id); });   // quem revela os vizinhos: onde estou, o que venci e lojas já alcançadas
    const vis = new Set(NUCLEO); rev.forEach(i => { vis.add(i); BY[i].viz.forEach(v => vis.add(v)); });
    $$('.n', root).forEach(g => g.classList.toggle('fog', ocultar && !vis.has(g.dataset.id)));
    $$('.hs-edges .e', root).forEach(p => { const a = p.dataset.a, b = p.dataset.b; p.classList.toggle('fog', ocultar && !(rev.has(a) || rev.has(b) || (NUCLEO.has(a) && NUCLEO.has(b)))); });
  }
  function paintNode(g) {
    const n = BY[g.dataset.id], ok = cleared(n.id), av = available(n.id);
    g.classList.toggle('done', ok); g.classList.toggle('avail', av && !ok); g.classList.toggle('lock', !av && !ok); g.classList.toggle('isstart', n.id === S.startId);
    if (n.tipo === 'boss') g.classList.toggle('opened', guardVivos() === 0);
  }

  // ---- câmera: arrastar, pinça, roda do mouse
  const view$ = () => { const r = svg.getBoundingClientRect(); return { w: r.width, h: r.height }; };
  let movT = null;
  function applyCam(anim) {
    const { w, h } = view$();
    const lim = (R + 260) * cam.k;   // não deixa o mapa sair da tela
    cam.x = Math.max(w / 2 - lim, Math.min(w / 2 + lim, cam.x)); cam.y = Math.max(h / 2 - lim, Math.min(h / 2 + lim, cam.y));
    camG.style.transition = anim ? 'transform .75s cubic-bezier(.3,.8,.3,1)' : 'none';
    if (svg) { svg.classList.add('mov'); clearTimeout(movT); movT = setTimeout(() => svg && svg.classList.remove('mov'), anim ? 850 : 220); }   // em movimento: animações pausadas (mapa mais leve)
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
      if (!ptrs.size && moved <= 8 && startPt) { const sa = startPt.t.closest && startPt.t.closest('.seta'); if (sa) { passo(sa.dataset.to); return; } const g = (startPt.t.closest && startPt.t.closest('.n')); if (g) openNode(g.dataset.id); else closeSheet(); } };
    svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', e => { ptrs.delete(e.pointerId); pinch0 = null; });
    svg.addEventListener('wheel', e => { e.preventDefault(); const r = svg.getBoundingClientRect(); zoomAt(e.clientX - r.left, e.clientY - r.top, e.deltaY < 0 ? 1.15 : 1 / 1.15, false); }, { passive: false });
    svg.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.closest && e.target.closest('.seta')) { e.preventDefault(); passo(e.target.closest('.seta').dataset.to); } else if ((e.key === 'Enter' || e.key === ' ') && e.target.closest && e.target.closest('.n')) { e.preventDefault(); openNode(e.target.closest('.n').dataset.id); } });
    mp.addEventListener('click', e => {
      const b = e.target.closest('.hs-hud [data-a]'); if (!b) return; SND.init(); SND.play('click'); const { w, h } = view$();
      const a = b.dataset.a;
      if (a === 'back') hub();
      else if (a === 'zin') zoomAt(w / 2, h / 2, 1.35, true);
      else if (a === 'zout') zoomAt(w / 2, h / 2, 1 / 1.35, true);
      else if (a === 'start') { const st = BY[posId()]; centerOn(st.x, st.y, .8, true); }
      else if (a === 'fit') fit(true);
      else if (a === 'leg') legenda();
      else if (a === 'cartas') minhasCartas();
      else if (a === 'broches') toast(nBroches() ? 'Os broches brilham quando estão juntos. Para que será que servem?' : 'Algo guarda os broches de cada série. Para que será que servem?');
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
  // setas: parado numa casa, cada direção possível aparece como seta; clicar na seta dá UM passo (clicar na bolinha só mostra o painel)
  function passos() {
    const u = posId(), n = BY[u], pass = passa(u);
    return n.viz.filter(v => !(v === M.boss && !bossOpen() && !P.aberto) && (pass || passa(v)));
  }
  function paintSetas() {
    const g = $('#hsArrows', root); if (!g) return; if (andando) { g.innerHTML = ''; return; }
    const u = BY[posId()], r = TIPOS[u.tipo].r;
    g.innerHTML = passos().map(v => { const t = BY[v], dx = t.x - u.x, dy = t.y - u.y, d = Math.hypot(dx, dy) || 1, ang = Math.atan2(dy, dx) * 180 / Math.PI, dist = r + 40;
      return `<g class="seta" data-to="${v}" transform="translate(${(u.x + dx / d * dist).toFixed(1)} ${(u.y + dy / d * dist).toFixed(1)}) rotate(${ang.toFixed(1)})" role="button" tabindex="0" aria-label="Ir para ${esc(nome(t))}"><circle r="17"/><path d="M-5 -8 L6 0 L-5 8 Z"/></g>`; }).join('');
  }
  async function passo(to) {
    if (andando || !passos().includes(to)) return; andando = true; closeSheet(); paintSetas(); const red = document.body.classList.contains('reduce'), n = BY[to];
    S.pos = n.id; heroPlace(n.id, !red); SND.play('tick'); paintLuz(); centerOn(n.x, n.y, cam.k < .6 ? .75 : null, !red);
    await new Promise(r => setTimeout(r, red ? 60 : 380)); save(); andando = false; paintAll(); openNode(n.id);
  }
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
    if (andando) return; const n = BY[id], T = TIPOS[n.tipo]; curId = id; SND.play('click'); if (id === posId()) chegada(id);
    $$('.n.sel', root).forEach(g => g.classList.remove('sel')); const g = $('.n[data-id="' + id + '"]', root); if (g) g.classList.add('sel');
    const ok = cleared(id), av = available(id), aqui = id === posId(), cam_ = aqui ? null : caminho(id);
    const bat0 = window.DS_HIST_BAT && window.DS_HIST_BAT[id], et = bat0 && bat0.e && textoEvento(bat0.e), evLinha = et ? `<p class="hs-ev">⚡ <b>${esc(et.nome)}</b>: ${esc(et.regra)}</p>` : '';
    const cartas = n.tipo === 'loja' ? '' : `<div class="hs-cards">${Array.from({ length: 7 }, () => '<span class="hs-cb"><b>?</b></span>').join('')}</div><p class="hint">As cartas do inimigo aparecem depois do primeiro duelo.</p>`;
    const jog = n.tipo === 'miniboss' ? 'Duelo de 3 ou 4 jogadores' : n.tipo === 'guardiao' ? 'Duelo de 3 jogadores' : n.tipo === 'boss' ? 'Você contra o Boss' : n.tipo === 'loja' ? 'Loja de cartas' : 'Você contra 1 inimigo';
    sheet.innerHTML = `<button class="ibtn x" data-a="x" aria-label="Fechar">✕</button>
      <div class="hs-sh-h"><span class="hs-dot" style="background:${T.cor}"></span><div><h3>${esc(nome(n))}</h3><small>${esc(T.nome)} · ${esc(REGIAO[n.tier])} · lado ${esc(LADOS[n.lado].toLowerCase())}</small></div></div>
      <p class="hs-st ${ok ? 'hs-ok' : av ? 'hs-av' : 'hs-lk'}">${ok ? '✓ Vencida' : av ? 'Disponível' : 'Caminho fechado'}</p>
      <p>${esc(T.desc)}</p>${evLinha}<p class="hint">${esc(jog)}${n.id === M.boss ? ` · a Besta ganha +${bonusBoss()} em todos os atributos (${guardVivos()} guardiões vivos)` : ''}</p>${cartas}
      <div class="row">${aqui ? (n.tipo === 'loja' ? '<button class="btn primary" data-a="loja">Entrar</button>' : ok ? '<button class="btn primary" disabled>Você está aqui</button>' : '<button class="btn primary" data-a="duelar">Duelar</button>') : ''}${P.aberto ? `<button class="btn" data-a="win">${ok ? 'Desfazer vitória (teste)' : 'Marcar vencida (teste)'}</button>` : ''}</div>`;
    sheet.hidden = false; ensureVisible(n);
    sheet.onclick = e => { const b = e.target.closest('[data-a]'); if (!b) return; if (b.dataset.a === 'x') closeSheet(); else if (b.dataset.a === 'win') toggleWin(id); else if (b.dataset.a === 'duelar') duelar(id); else if (b.dataset.a === 'loja') loja(id); };
  }
  function ensureVisible(n) {   // o painel cobre a parte de baixo: leva o ponto para a área livre de cima
    const { w, h } = view$(), sh = sheet.getBoundingClientRect().height, free = Math.max(120, h - sh), sy = n.y * cam.k + cam.y, sx = n.x * cam.k + cam.x;
    const want = Math.min(free / 2 + 30, free - 70);
    if (sy > free - 50 || sy < 60 || sx < 30 || sx > w - 30) { cam.y += want - sy; cam.x += Math.max(30, Math.min(w - 30, sx)) - sx; applyCam(true); }
  }
  function toggleWin(id) {
    const ok = cleared(id);
    if (ok) delete S.cleared[id]; else S.cleared[id] = 1;
    const mem = LIBERTA[id]; if (mem) { S.owned = S.owned || []; if (ok) S.owned = S.owned.filter(x => x !== mem); else if (!S.owned.includes(mem)) S.owned.push(mem); }
    save(); SND.play(ok ? 'tick' : 'capture'); paintAll(); openNode(id);
    if (mem && !ok) setTimeout(() => libertar(mem, () => { const f = (window.DS_FALAS_UNIAO || {})[mem]; if (f) npcFala(mem, f); }), 500);
    if (GUARD.includes(id) && !ok) setTimeout(() => quandoLivre(() => golpeBoss()), 500);
    if (!ok && Object.keys(S.cleared).length === 1 && !mem) setTimeout(tutorial, 900);
    if (id === M.boss && !ok) setTimeout(finalCena, 900);
    const g = $('.n[data-id="' + id + '"]', root); if (g && !ok) { g.classList.remove('pop'); void g.getBoundingClientRect(); g.classList.add('pop'); }
  }
  // ---- duelo de verdade: mãos fixas (7 cartas por lado), captura, pêndulos e volta ao mapa
  const FORCA = id => { const c = U.CARDS[id]; return c ? Object.values(c.stats).reduce((a, b) => a + b, 0) : 0; };
  const NIVEIS = ['facil', 'normal', 'dificil'];
  const nivelBot = n => n.tipo === 'guardiao' ? 2 : Math.min(2, [0, 1, 1, 2][Math.max(0, (n.tier || 1) - 1)] + (['elite', 'miniboss', 'guardiao'].includes(n.tipo) && n.tier < 3 ? 1 : 0));   // PROPOSTA: dificuldade dos bots por região e tipo (a calibrar)
  const PREMIO = { normal: 10, evento: 14, elite: 22, miniboss: 35, guardiao: 50, boss: 0 };   // PROPOSTA: pêndulos por vitória (× 1 + 0,5 por região acima da 1ª)
  const premioDe = n => Math.round((PREMIO[n.tipo] || 10) * (1 + .5 * ((n.tipo === "guardiao" ? 4 : n.tier || 1) - 1)));
  // ---- cansaço das cartas (PROPOSTA, a calibrar): só vale com 21 ou mais cartas. Carta usada numa vitória cansa conforme a raridade; as não usadas descansam 1 ponto por vitória; derrota não cansa. Carta cansada não entra no duelo; pêndulos descansam.
  const CANSA = { comum: 1, rara: 2, epica: 3, lendaria: 4 }, CUSTO_DESC = 6;
  const fadigaOn = () => (S.owned || []).length >= 21;
  const fad = id => (S.fadiga && S.fadiga[id]) | 0;
  const pesoCansa = id => CANSA[(U.CARDS[id] || {}).raridade] || 1;
  function aplicaCansaco(usadas) {   // chamado depois de uma vitória
    if (!fadigaOn()) return 0; S.fadiga = S.fadiga || {}; const us = new Set(usadas); let n = 0;
    Object.keys(S.fadiga).forEach(id => { if (!us.has(id)) { S.fadiga[id] = Math.max(0, S.fadiga[id] - 1); if (!S.fadiga[id]) delete S.fadiga[id]; } });
    usadas.forEach(id => { S.fadiga[id] = (S.fadiga[id] | 0) + pesoCansa(id); n++; }); return n;
  }
  const pontosFad = id => '<span class="hs-fad">' + '●'.repeat(Math.min(6, fad(id))) + '</span>';
  function escolher7(bat, ok, opt) {   // o jogador escolhe as cartas do duelo (7, ou menos em alguns eventos)
    opt = opt || {}; if (opt.so && !(S.owned || []).some(c => (U.CARDS[c] || {}).raridade === opt.so)) opt = { n: opt.n }; const N = opt.n || 7;   // sem carta da raridade pedida: vale a melhor
    const todas = (S.owned || []).filter(c => !opt.so || (U.CARDS[c] || {}).raridade === opt.so).sort((a, b) => FORCA(b) - FORCA(a));
    if (todas.length <= N && !fadigaOn()) { ok(todas.slice(0, N)); return; }
    const livres = () => todas.filter(id => !fadigaOn() || !fad(id));
    const box = el(`<div class="hs-esc"><h3>Escolha ${N} ${N === 1 ? 'carta' : 'cartas'}${opt.so ? ' lendária' : ''}</h3><p class="hint"><b class="hs-cnt"></b> <span class="hs-msg"></span></p><div class="hs-escg"></div><div class="row"><button class="btn" data-a="melhores">Melhores 7</button><button class="btn" data-a="x">Cancelar</button><button class="btn primary" data-a="go">Lutar</button></div></div>`);
    const g = $('.hs-escg', box), cnt = $('.hs-cnt', box), msg = $('.hs-msg', box), go = $('[data-a=go]', box);
    const sel = new Set(); let forcadas = new Set();
    const auto = () => { sel.clear(); forcadas = new Set(); const L = livres(); L.slice(0, N).forEach(x => sel.add(x));
      if (sel.size < N) todas.filter(x => !sel.has(x)).sort((a, b) => fad(a) - fad(b)).forEach(x => { if (sel.size < N) { sel.add(x); forcadas.add(x); } }); };   // sem 7 descansadas, completa com as menos cansadas (nunca trava)
    const montar = () => { g.innerHTML = ''; todas.forEach(id => { const w = el(`<div class="hs-escc${fadigaOn() && fad(id) ? ' tired' : ''}" data-id="${id}"></div>`); w.append(U.cardEl(id, { up: true, noanim: true, cw: 72 })); if (fadigaOn() && fad(id)) w.append(el(`<div class="hs-fadb">${pontosFad(id)}</div>`)); g.append(w); }); };
    const upd = () => { cnt.textContent = sel.size + ' / ' + N; go.disabled = sel.size !== N; $$('.hs-escc', g).forEach(w => w.classList.toggle('on', sel.has(w.dataset.id)));
      msg.textContent = forcadas.size ? 'Faltam cartas descansadas: ' + forcadas.size + ' cansada(s) entraram.' : fadigaOn() && todas.some(x => fad(x)) ? 'Toque numa carta cansada para descansá-la (' + CUSTO_DESC + ' pêndulos por ponto).' : ''; };
    auto(); montar();
    const m = U.modal(box, { cls: 'hs-modal' });
    box.onclick = e => {
      const c = e.target.closest('.hs-escc'), b = e.target.closest('[data-a]');
      if (c) { const id = c.dataset.id;
        if (fadigaOn() && fad(id) && !sel.has(id)) {   // carta cansada: pagar para descansar
          const custo = fad(id) * CUSTO_DESC;
          if ((S.pend | 0) < custo) { msg.textContent = 'Faltam pêndulos: descansar custa ' + custo + ' (você tem ' + (S.pend | 0) + ').'; SND.play('tick'); return; }
          S.pend -= custo; delete S.fadiga[id]; save(); SND.play('capture'); if (sel.size < N) { sel.add(id); } montar(); upd(); msg.textContent = 'Carta descansada (−' + custo + ' pêndulos).'; return; }
        SND.play('tick'); forcadas.delete(id); if (sel.has(id)) sel.delete(id); else if (sel.size < N) sel.add(id); upd(); return; }
      if (!b) return; SND.play('click');
      if (b.dataset.a === 'melhores') { auto(); upd(); }
      else if (b.dataset.a === 'x') m.close(); else if (b.dataset.a === 'go' && sel.size === N) { m.close(); ok(todas.filter(x => sel.has(x))); }
    };
    upd();
  }
  const embaralha = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const textoEvento = ev => { const c = (window.DS_EVENTOS_H || {})[ev.id]; if (!c) return null; return { nome: c.nome, regra: c.regra.replace('{A}', ev.attr && U.ATT[ev.attr] ? U.ATT[ev.attr].nome : '') }; };
  function duelar(id, auto) {   // auto: gancho de teste, o jogador vira bot e a partida roda sozinha
    const n = BY[id], bat = window.DS_HIST_BAT && window.DS_HIST_BAT[id]; if (!bat || n.tipo === 'loja') return;
    const ev = bat.e || null, opt0 = n.tipo === 'boss' && UNIAO.every(c => (S.owned || []).includes(c)) ? { n: 8 } : {}, opt = ev ? ({ desvantagem: { n: 5 }, curto: { n: 3 }, davi: { n: 1, so: 'lendaria' } }[ev.id] || {}) : opt0;
    const autoMao = () => { const o = (S.owned || []).filter(c => !opt.so || (U.CARDS[c] || {}).raridade === opt.so); return (o.length ? o : (S.owned || [])).slice(0, opt.n || 7); };
    const emprestadas = () => {   // Baralho emprestado: as 7 cartas mais fortes do tema (não são suas e não cansam)
      const tm = (bat.tema || '').toLowerCase(), noTema = c => { const sr = U.SERIES[c.serie]; return sr && sr.nome.toLowerCase() === tm; };
      const fortes = U.D.CARTAS.filter(c => !c.uniao && c.id !== 'S11').sort((a, b) => FORCA(b.id) - FORCA(a.id));
      return fortes.filter(noTema).concat(fortes.filter(c => !noTema(c))).slice(0, 7).map(c => c.id);
    };
    (auto ? (b, f) => f(ev && ev.id === 'emprestado' ? emprestadas() : autoMao()) : ev && ev.id === 'emprestado' ? (b, f) => f(emprestadas()) : (b, f) => escolher7(b, f, opt))(bat, mao0 => {
      let mao = mao0.slice(); const usadas = new Set(mao), inims = bat.i.map(x => x.c.slice()), conf = new Set(mao);
      inims.forEach(l => l.forEach(c => conf.add(c)));
      const mudou = new Set(mao);   // cartas do inimigo que o jogador já tem em mãos são trocadas por outras da mesma raridade
      inims.forEach(l => l.forEach((c, k) => { if (mudou.has(c) || usadas.has(c)) {
        const raridade = U.CARDS[c].raridade, pool = U.D.CARTAS.filter(x => x.raridade === raridade && !x.uniao && x.id !== 'S11' && !conf.has(x.id));
        const novo = pool.length ? pool[Math.floor(Math.random() * pool.length)].id : c; l[k] = novo; conf.add(novo); } else mudou.add(c); }));
      const livres = (f, k) => { const pool = embaralha(U.D.CARTAS.filter(x => !x.uniao && x.id !== 'S11' && !conf.has(x.id) && f(x))).slice(0, k); pool.forEach(x => conf.add(x.id)); return pool.map(x => x.id); };
      const reg = ev ? Object.assign({}, ev) : null; let semMontar = false;
      if (ev) {   // regras que mexem nas cartas (as de motor ficam em engine.js)
        if (ev.id === 'desvantagem') inims.forEach(l => l.push(...livres(x => x.raridade === U.CARDS[l[0]].raridade || x.raridade === 'comum', 2)));
        else if (ev.id === 'horda') inims.forEach((l, k) => { const c = livres(x => x.raridade === 'comum', 10); if (c.length) inims[k] = c; });
        else if (ev.id === 'curto') inims.forEach((l, k) => { inims[k] = l.slice().sort((a, b) => FORCA(b) - FORCA(a)).slice(0, 3); });
        else if (ev.id === 'troca') { const mx = l => l.reduce((b, c) => FORCA(c) > FORCA(b) ? c : b, l[0]); const l0 = inims[0], a = mx(mao), b = mx(l0); mao[mao.indexOf(a)] = b; l0[l0.indexOf(b)] = a; }
        else if (ev.id === 'espelho') inims.forEach((l, k) => { inims[k] = embaralha(mao).map(c => c + '*' + (k + 1)); });
        else if (ev.id === 'aleatoria') { semMontar = true; mao = embaralha(mao); inims.forEach((l, k) => { inims[k] = embaralha(l); }); }
        else if (ev.id === 'reforcos') reg.pool = livres(x => x.raridade === 'comum', 8);
      }
      const bots = bat.i.map(x => ({ name: x.n, bot: true, diff: ev && ev.id === 'clarividente' ? 'dificil' : NIVEIS[nivelBot(n)] }));
      const players = [{ name: S.nome || 'Você', bot: !!auto, diff: 'dificil' }].concat(bots);
      const musica = n.tipo === 'boss' ? 'boss' : (n.tipo === 'miniboss' || n.tipo === 'guardiao') ? 'mini' : 'batalha';
      try { SND.histStop(true); } catch (e) { }
      const besta = n.tipo === 'boss' ? bonusBoss() : 0, bonusPids = bat.i.map((_, k) => k + 1);
      const uni = n.tipo === 'boss' ? mao.filter(c => UNIAO.includes(c)) : [], uniTodas = uni.length === UNIAO.length;
      const hist = { musica, id, aposta: ev && ev.id === 'aposta' ? { saldo: () => S.pend | 0, paga: () => { S.pend = Math.max(0, (S.pend | 0) - 1); save(); }, resolve: r => { S.pend = (S.pend | 0) + (r === 'win' ? 3 : r === 'tie' ? 1 : 0); save(); } } : null, evento: ev ? textoEvento(ev) : besta ? { nome: 'Poder da Besta', regra: 'As cartas da Besta ganham +' + besta + ' em todos os atributos (' + guardVivos() + ' guardiões vivos).' } : null, aoFim: res => {
        SND.histLock = null; try { SND.histStop(); } catch (e) { }
        voltarMapa = true; U.show('uniao');
        if (res.venceu && !cleared(id)) {
          S.pend = (S.pend | 0) + premioDe(n); const cn = aplicaCansaco(ev && ev.id === 'emprestado' ? [] : mao0); const primeira = cn && fadigaOn() && !S.tutCansaco; if (primeira) S.tutCansaco = 1; save();
          if (primeira) quandoLivre(() => { const nar = mao0[Math.floor(Math.random() * mao0.length)]; npcFala(nar, ['Ei, {nome}! Você nos levou à batalha e venceu, mas estamos exaustas.', 'Cartas usadas numa vitória ficam cansadas, e as mais raras cansam mais. As bolinhas laranja mostram quanto falta para descansar.', 'Cada vitória sem nós descansa 1 ponto. Se tiver pressa, os pêndulos descansam na hora: é só tocar numa carta cansada na hora de escolher.', 'Se faltarem cartas descansadas, as menos cansadas completam seu time. Derrota não cansa ninguém.']); });
          else if (cn && fadigaOn()) setTimeout(() => toast(cn + ' cartas ficaram cansadas'), 1200);
          setTimeout(() => { toggleWin(id); if (res.capturadas.length) { setTimeout(() => abrirBau({ cartas: res.capturadas, semDica: true }), 700); dica('captura'); } }, 450);
        } else { try { SND.histPlay('mapa'); } catch (e) { } if (!res.venceu) dica('derrota'); }
      } };
      const lanca = () => U.startGame({ players, perPlayer: 7, difficulty: 'normal', specialsFrom: 2, events: false, maxCombats: 100, maos: [mao].concat(inims), regra: reg, semMontar, bonusPids: besta ? bonusPids : null, bonusVal: besta, bonusCards: uniTodas ? { pid: 0, cards: uni, val: 5 } : null, historia: hist });
      if (uni.length && !auto) entradaUniao(uni, uniTodas, lanca); else lanca();
    });
  }
  function quandoLivre(fn, n) { n = n || 0; if (n > 40) return; if ($('.bau-ov, .npc, .cin, .modal')) { setTimeout(() => quandoLivre(fn, n + 1), 700); return; } fn(); }   // espera baús e outros diálogos fecharem
  // ---- NPC: um personagem das primeiras cartas do jogador fala com ele (usado também para vendedores, desafios e cobranças)
  function npcFala(cid, linhas, done) {
    closeSheet(); const c = U.CARDS[cid]; let i = 0, tm = null, pronto = false;
    const ov = el(`<div class="npc"><div class="npc-box"><div class="npc-p"></div><div class="npc-b"><b>${esc(c ? c.nome : 'Viajante')}</b><p></p><i class="cin-next on">▾</i></div></div></div>`);
    if (c) $('.npc-p', ov).append(U.cardEl(cid, { up: true, noanim: true, cw: 84 }));
    document.body.appendChild(ov); const P_ = $('p', ov), red = document.body.classList.contains('reduce');
    const fala = () => { const t = linhas[i].replace(/\{nome\}/g, (S && S.nome) || 'viajante'); pronto = false; P_.textContent = ''; clearInterval(tm); let k = 0; const fim = () => { clearInterval(tm); P_.textContent = t; pronto = true; };
      if (red) return fim(); tm = setInterval(() => { k += 2; P_.textContent = t.slice(0, k); if (k >= t.length) fim(); }, 22); };
    ov.onclick = () => { SND.play('click'); if (!pronto) { clearInterval(tm); P_.textContent = linhas[i].replace(/\{nome\}/g, (S && S.nome) || 'viajante'); pronto = true; return; } i++; if (i >= linhas.length) { ov.remove(); done && done(); } else fala(); };
    fala();
  }
  function tutorial() {
    if (!S || S.tutorial || !S.npc) return; S.tutorial = 1; save();
    npcFala(S.npc, ['Você venceu a primeira batalha. Eu estava na sua mão, lembra? Agora vou te mostrar como isso funciona.',
      'Cada vitória ilumina os caminhos à frente. Use as setas ao lado do seu boneco para andar, um passo de cada vez.',
      'Pêndulos compram cartas nas lojas e descansam as suas cartas. Baús e batalhas dão mais.',
      'Cada arauto prende um membro da União. Liberte os oito e derrote os guardiões para enfraquecer a Besta.',
      'Pelo caminho, alguns viajantes vendem atalhos. Boa sorte, {nome}.']);
  }
  // miniboss vencido: o membro da União preso por ele é libertado e entra na equipe
  function libertar(cid, depois) {
    closeSheet(); const c = U.CARDS[cid]; if (!c) return;
    const ov = el(`<div class="bau-ov lib"><div class="lib-t">Libertado!</div><div class="lib-c"></div><div class="lib-n">${esc(c.nome)} entrou para a sua equipe</div><div class="lib-k">${(S.owned || []).filter(x => Object.values(LIBERTA).includes(x)).length} / ${MINIS.length} da União</div><button class="btn primary bau-ok">Continuar</button></div>`);
    $('.lib-c', ov).append(U.cardEl(cid, { up: true, noanim: true, cw: 150 })); document.body.appendChild(ov); SND.play('legend');
    $('.bau-ok', ov).onclick = () => { SND.play('click'); ov.classList.add('out'); setTimeout(() => ov.remove(), 400); if (depois) setTimeout(depois, 450); };
  }
  // cartas da União entram no duelo contra a Besta: aparecem na tela; com as oito, a entrada é maior e elas ficam douradas (+5 em tudo)
  function entradaUniao(cartas, todas, depois) {
    closeSheet(); const red = document.body.classList.contains('reduce');
    const ov = el(`<div class="uni-ov${todas ? ' gold' : ''}"><div class="uni-t">${todas ? 'A União completa!' : 'A União entra no duelo'}</div><div class="uni-r"></div><div class="uni-s">${todas ? '+5 em todos os atributos de cada carta da União' : cartas.length + ' / ' + UNIAO.length + ' da União. Com as oito, algo especial acontece.'}</div></div>`);
    const r = $('.uni-r', ov); cartas.forEach((c, i) => { const w = el('<div class="uni-c" style="--i:' + i + '"></div>'); w.append(U.cardEl(c, { up: true, noanim: true, cw: todas ? 78 : 92 })); r.append(w); });
    document.body.appendChild(ov); SND.play(todas ? 'legend' : 'capture'); let fim = false;
    const sai = () => { if (fim) return; fim = true; ov.classList.add('out'); setTimeout(() => { ov.remove(); depois(); }, 350); };
    ov.onclick = sai; setTimeout(sai, red ? 1200 : todas ? 4200 : 2600);
  }
  function finalCena() {
    if (!window.DSCinema || !window.DS_CINEMATICA_FINAL) return;
    window.DSCinema.play(() => { try { SND.histPlay('mapa'); } catch (e) { } }, window.DS_CINEMATICA_FINAL, { nome: (S && S.nome) || 'Viajante' });
  }
  // ao derrotar um guardião: o ponto da Besta é "atingido" (tremor, clarão, golpe), mostrando quanto ela enfraqueceu
  function golpeBoss() {
    if (view !== 'map') return; closeSheet(); const b = BY[M.boss], red = document.body.classList.contains('reduce'), hs = $('.hs', root), nodo = $('.n.t-boss', root), vivos = guardVivos();
    centerOn(b.x, b.y, .75, !red);
    setTimeout(() => {
      SND.play('elim'); setTimeout(() => SND.play('defeat'), 140);
      if (!red) { if (hs) { hs.classList.remove('tremor'); void hs.offsetWidth; hs.classList.add('tremor'); setTimeout(() => hs.classList.remove('tremor'), 1000); }
        const fl = el('<div class="hs-flash"></div>'); (hs || document.body).append(fl); setTimeout(() => fl.remove(), 900);
        if (nodo) { nodo.classList.remove('hit'); void nodo.getBoundingClientRect(); nodo.classList.add('hit'); setTimeout(() => nodo.classList.remove('hit'), 1500); } }
      toast(vivos ? `A Besta foi atingida! Agora ela ganha +${30 * vivos} em todos os atributos (${vivos} guardiões vivos).` : 'A Besta está no seu momento mais fraco: nenhum guardião vivo.');
    }, red ? 100 : 700);
    setTimeout(() => { const ps = BY[posId()]; if (view === 'map') centerOn(ps.x, ps.y, null, !red); }, red ? 600 : 3600);
  }
  // ---- diálogos de carta, uma única vez cada (S.dicas)
  const DICAS = {
    evento: ['O raio marca um evento: uma regra especial que vale só naquela batalha.', 'Durante o duelo, toque no botão ⚡ Evento para rever a regra.'],
    elite: ['Cuidado: este inimigo é mais forte que os comuns. Em troca, paga mais pêndulos.'],
    miniboss: ['Este é um dos oito arautos. Ele prende uma carta da União: ao derrotá-lo, ela é libertada e entra para a sua equipe.', 'Cada arauto também guarda a entrada do minigame do setor dele. Há uma coisa que só a União completa vai poder fazer diante da Besta.'],
    guardiao: ['Um dos quatro guardiões da Besta. Ele é muito mais forte que os outros.', 'Cada guardião derrotado tira 30 pontos de cada atributo das cartas dela. Derrote todos e ela fica no seu momento mais fraco.'],
    boss: ['É aqui. A Besta.', 'Você pode enfrentá-la quando quiser, mas as cartas dela ganham 30 pontos em todos os atributos por cada guardião que ainda vive.', 'Se levar a União inteira para o duelo, algo especial acontece.'],
    loja: ['Uma loja! Aqui os pêndulos compram cartas e descansam as cansadas.', 'Lojas não bloqueiam o caminho: o que vem depois delas já fica liberado.'],
    derrota: ['Perdemos esta, mas calma. Derrota não custa nada: nem cartas, nem pêndulos.', 'Reorganize o time, descanse as cartas se precisar, e tente de novo.'],
    captura: ['Viu? Capturamos uma carta do inimigo e agora ela é nossa.', 'Só vale a carta realmente capturada: a que o inimigo usou como especial, ou que você derrotou sem capturar, não vem para cá.'],
    bau: ['Baús escondem pêndulos ou cartas novas.', 'Costumam ficar nos becos sem saída, então vale explorar os ramos que não levam a lugar nenhum.'],
    minigame: ['Um desafio extra! Não bloqueia o caminho.', 'Quem o vence leva um broche.'],
    broche: ['Um broche… Não sei para que serve.', 'Mas algo me diz que vale a pena juntá-los todos.'],
  };
  function dica(chave, quem) {
    if (!S || (S.dicas && S.dicas[chave]) || !DICAS[chave]) return; S.dicas = S.dicas || {}; S.dicas[chave] = 1; save();
    quandoLivre(() => npcFala(quem || S.npc || (S.owned || [])[0], DICAS[chave]));
  }
  function chegada(id) {   // o boneco está neste ponto: diálogo da primeira vez
    const n = BY[id]; if (!n || !S.tutorial) return;   // antes do tutorial, a primeira vitória tem a vez
    if (n.tipo === 'evento') dica('evento'); else if (n.tipo === 'elite') dica('elite'); else if (n.tipo === 'miniboss') dica('miniboss'); else if (n.tipo === 'guardiao') dica('guardiao'); else if (n.tipo === 'boss') dica('boss'); else if (n.tipo === 'loja') dica('loja');
  }
  function bossAbre() {
    closeSheet(); const b = BY[M.boss]; const red = document.body.classList.contains('reduce');
    centerOn(b.x, b.y, .75, !red);
    setTimeout(() => { SND.play('banner'); const bg = $('.n.t-boss', root); if (bg) { bg.classList.add('burst'); setTimeout(() => bg.classList.remove('burst'), 2600); } toast('Os guardiões caíram e a União está completa. O núcleo da galáxia se abriu.'); }, red ? 50 : 800);
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
    closeSheet(); const red = document.body.classList.contains('reduce'), pend = premio.pend | 0, cartas = premio.cartas || [];
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
    const fechar = () => { if (fim) return; fim = true; if (!premio.semDica) setTimeout(() => dica('bau'), 600); ov.classList.add('out'); setTimeout(() => ov.remove(), 400); if (S) { S.pend = (S.pend | 0) + pend; cartas.forEach(id => { if (!S.owned.includes(id)) S.owned.push(id); }); save(); if (view === 'map' && svg && svg.isConnected) paintAll(); } done && done(); };
    ok.onclick = () => { SND.play('click'); fechar(); };
  }
  function sorteioBau() {   // teste: 60% pêndulos, 40% de 1 a 3 cartas novas (ainda não possuídas)
    const faltam = U.D.CARTAS.map(c => c.id).filter(id => !(S.owned || []).includes(id));
    if (Math.random() < .6 || !faltam.length) return { pend: 5 + Math.floor(Math.random() * 16) };
    const n = 1 + Math.floor(Math.random() * 3), pick = []; while (pick.length < n && faltam.length) pick.push(faltam.splice(Math.floor(Math.random() * faltam.length), 1)[0]);
    return { cartas: pick };
  }

  // ---- legenda e opções de teste
  // ---- minhas cartas (menu) e lojas
  const ORD = { lendaria: 0, epica: 1, rara: 2, comum: 3 };
  const PRECO = { comum: 40, rara: 90, epica: 200, lendaria: 450 };   // PROPOSTA: preço das cartas nas lojas em pêndulos (a calibrar)
  function descansar(id) {   // paga e descansa uma carta; devolve o custo ou 0 se faltar
    const custo = fad(id) * CUSTO_DESC; if (!custo || (S.pend | 0) < custo) return 0;
    S.pend -= custo; delete S.fadiga[id]; save(); return custo;
  }
  function minhasCartas(emLoja) {
    closeSheet(); const box = el('<div class="hs-esc hs-mc"><h3>Minhas cartas</h3><p class="hint hs-info"></p><div class="hs-escg"></div><div class="row"><button class="btn" data-a="todas">Descansar todas</button><button class="btn primary" data-a="x">Fechar</button></div></div>');
    const g = $('.hs-escg', box), info = $('.hs-info', box), bt = $('[data-a=todas]', box); let msg = '';
    const lista = () => (S.owned || []).slice().sort((a, b) => (ORD[(U.CARDS[a] || {}).raridade] - ORD[(U.CARDS[b] || {}).raridade]) || FORCA(b) - FORCA(a));
    const render = () => {
      const L = lista(), cans = L.filter(id => fad(id)), total = cans.reduce((t, id) => t + fad(id) * CUSTO_DESC, 0);
      info.textContent = msg || (fadigaOn() ? (cans.length ? cans.length + ' cansada(s). Toque numa para descansar (' + CUSTO_DESC + ' pêndulos por ponto). Cada vitória sem usá-las descansa 1 ponto.' : 'Todas as cartas estão descansadas.') : 'O cansaço começa quando você tiver 21 cartas (' + L.length + ' agora).') + ' Pêndulos: ' + (S.pend | 0);
      g.innerHTML = ''; L.forEach(id => { const w = el('<div class="hs-escc on' + (fad(id) ? ' tired' : '') + '" data-id="' + id + '"></div>'); w.append(U.cardEl(id, { up: true, noanim: true, cw: 72 })); if (fad(id)) w.append(el('<div class="hs-fadb">' + pontosFad(id) + '</div>')); g.append(w); });
      bt.hidden = !cans.length; bt.textContent = 'Descansar todas (' + total + ')'; bt.disabled = total > (S.pend | 0); paintAll();
    };
    const m = U.modal(box, { cls: 'hs-modal' }); render();
    box.onclick = e => {
      const c = e.target.closest('.hs-escc'), b = e.target.closest('[data-a]');
      if (c && fad(c.dataset.id)) { const id = c.dataset.id, custo = descansar(id); if (custo) { SND.play('capture'); msg = U.CARDS[id].nome + ' descansou (−' + custo + ' pêndulos).'; } else { SND.play('tick'); msg = 'Faltam pêndulos: descansar custa ' + fad(id) * CUSTO_DESC + '.'; } render(); return; }
      if (!b) return; SND.play('click');
      if (b.dataset.a === 'x') m.close();
      else if (b.dataset.a === 'todas') { let t = 0; Object.keys(S.fadiga || {}).forEach(id => { const k = fad(id) * CUSTO_DESC; if ((S.pend | 0) >= k) { S.pend -= k; delete S.fadiga[id]; t += k; } }); save(); SND.play('capture'); msg = t ? 'Descansadas (−' + t + ' pêndulos).' : 'Faltam pêndulos.'; render(); }
    };
  }
  // estoque fixo por loja (sorteado uma vez e guardado): 6 cartas que o jogador ainda não tem; raridade sobe com a região
  function estoque(id) {
    S.lojas = S.lojas || {}; if (S.lojas[id]) return S.lojas[id];
    const tier = BY[id].tier || 1, plano = [['comum', 'comum', 'comum', 'rara', 'rara', 'epica'], ['comum', 'comum', 'rara', 'rara', 'epica', 'epica'], ['comum', 'rara', 'rara', 'epica', 'epica', 'lendaria'], ['rara', 'rara', 'epica', 'epica', 'lendaria', 'lendaria']][Math.min(3, tier - 1)];
    const em = new Set(S.owned || []); S.lojas[id] = { itens: [], comprados: [] };
    plano.forEach(r => { const pool = embaralha(U.D.CARTAS.filter(x => x.raridade === r && !x.uniao && x.id !== 'S11' && !em.has(x.id))); const x = pool[0]; if (x) { em.add(x.id); S.lojas[id].itens.push(x.id); } });
    save(); return S.lojas[id];
  }
  function loja(id) {
    closeSheet(); const est = estoque(id); const box = el('<div class="hs-esc hs-loja"><h3>Loja</h3><p class="hint hs-info"></p><div class="hs-escg"></div><div class="row"><button class="btn" data-a="mc">Minhas cartas</button><button class="btn primary" data-a="x">Sair</button></div></div>');
    const g = $('.hs-escg', box), info = $('.hs-info', box); let msg = '';
    const render = () => { info.textContent = (msg || 'Toque numa carta para comprar.') + ' Pêndulos: ' + (S.pend | 0); g.innerHTML = '';
      est.itens.forEach(c => { const got = est.comprados.includes(c), p = PRECO[U.CARDS[c].raridade] || 50; const w = el('<div class="hs-escc on hs-item' + (got ? ' got' : '') + '" data-id="' + c + '"></div>'); w.append(U.cardEl(c, { up: true, noanim: true, cw: 72 })); w.append(el('<div class="hs-preco">' + (got ? 'comprada' : p) + '</div>')); g.append(w); }); paintAll(); };
    const m = U.modal(box, { cls: 'hs-modal' }); render();
    box.onclick = e => {
      const c = e.target.closest('.hs-item'), b = e.target.closest('[data-a]');
      if (c) { const k = c.dataset.id; if (est.comprados.includes(k)) return; const p = PRECO[U.CARDS[k].raridade] || 50;
        if ((S.pend | 0) < p) { SND.play('tick'); msg = 'Faltam pêndulos: ' + U.CARDS[k].nome + ' custa ' + p + '.'; render(); return; }
        S.pend -= p; est.comprados.push(k); if (!S.owned.includes(k)) S.owned.push(k); save(); SND.play('legend'); msg = U.CARDS[k].nome + ' entrou para a sua coleção (−' + p + ').'; render(); return; }
      if (!b) return; SND.play('click'); if (b.dataset.a === 'x') m.close(); else if (b.dataset.a === 'mc') { m.close(); minhasCartas(); }
    };
  }
  function legenda() {
    const L = Object.keys(TIPOS).filter(k => k !== 'boss').map(k => `<li><span class="hs-dot" style="background:${TIPOS[k].cor}"></span><b>${TIPOS[k].nome}</b><span>${esc(TIPOS[k].desc)}</span></li>`).join('');
    const contagem = {}; NOS.forEach(n => { contagem[n.tipo] = (contagem[n.tipo] || 0) + 1; });
    const box = el(`<div class="hs-leg"><h3>Legenda</h3><ul>${L}<li><span class="hs-dot" style="background:#fbf9ff"></span><b>Boss final</b><span>A Besta, no núcleo da galáxia, protegida pelos 4 guardiões.</span></li></ul>
      <p class="hint">${BATALHAS.length} batalhas (${['normal', 'evento', 'elite', 'miniboss', 'guardiao', 'boss'].map(k => contagem[k] + ' ' + TIPOS[k].nome.toLowerCase()).join(', ')}) e ${contagem.loja} lojas.</p>
      <h3>Opções</h3><label class="hs-sw"><input type="checkbox" ${P.escuro !== false ? 'checked' : ''} data-a="escuro"> Esconder o que ainda não foi liberado</label>
      <div class="row"><button class="btn sm" data-a="intro">Rever introdução</button><button class="btn sm" data-a="fim">Ver final</button><button class="btn sm" data-a="bau">Testar baú</button></div><h3>Teste (etapa 1)</h3><label class="hs-sw"><input type="checkbox" ${P.aberto ? 'checked' : ''} data-a="aberto"> Mapa aberto: todos os pontos liberados</label>
      <div class="row"><button class="btn sm" data-a="reset">Zerar vitórias</button><button class="btn sm primary" data-a="ok">Fechar</button></div></div>`);
    const m = U.modal(box, { cls: 'hs-modal' });
    box.onclick = e => {
      const b = e.target.closest('[data-a]'); if (!b) return;
      if (b.dataset.a === 'ok') { SND.play('click'); m.close(); }
      else if (b.dataset.a === 'fim') { SND.play('click'); m.close(); finalCena(); }
      else if (b.dataset.a === 'bau') { SND.play('click'); m.close(); abrirBau(sorteioBau()); }
      else if (b.dataset.a === 'intro') { SND.play('click'); m.close(); if (window.DSCinema) window.DSCinema.play(() => { if (view === 'map') { try { SND.histPlay('mapa'); } catch (e) { } } }); }
      else if (b.dataset.a === 'reset') { SND.play('click'); S.cleared = {}; save(); paintAll(); closeSheet(); toast('Vitórias zeradas.'); }
    };
    box.addEventListener('change', e => { if (e.target.dataset.a === 'aberto') { P.aberto = e.target.checked; save(); paintAll(); closeSheet(); } else if (e.target.dataset.a === 'escuro') { P.escuro = e.target.checked; save(); paintAll(); } });
  }

  window.DSHistoria = { darBroche: (serie) => { if (!S) return; S.broches = S.broches || {}; S.broches[serie] = 1; save(); if (view === 'map') paintAll(); }, loja, minhasCartas, dica, golpeBoss, escolher7, aplicaCansaco, duelar, abrirBau, mount, show: hub, data: M, state: () => S };
})();
