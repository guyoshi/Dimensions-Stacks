/* Dimensions Stacks — modo história "A União" (ETAPA 1: tela inicial e mapa navegável).
   Dados do mapa em historia_mapa.js (gerado; posições, tipos e ligações fixos). Aqui: tela inicial (Novo jogo / Continuar),
   sorteio do ponto de partida, mapa com arrastar e zoom, painel de cada ponto, progresso salvo no aparelho.
   Ainda sem duelos, baralhos de inimigos, lojas e recompensas (etapas 2 a 4). */
(function () {
  'use strict';
  const U = window.DSUI, M = window.DS_MAPA;
  if (!U || !M) return;
  const { $, $$, el, esc, SND } = U;
  const KEY0 = 'dsstacks.historia', kSlot = n => n > 1 ? KEY0 + '.' + n : KEY0, PKEY = 'dsstacks.historia.prefs';
  const rd = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  const wr = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };

  const TIPOS = {
    normal:   { nome: 'Normal',    cor: '#6cc6ff', r: 19, desc: 'Duelo comum contra um inimigo.' },
    evento:   { nome: 'Evento',    cor: '#ffd25f', r: 19, desc: 'Duelo com uma regra especial (tempo, cartas, atributos...).' },
    elite:    { nome: 'Elite',     cor: '#c58cff', r: 23, desc: 'Inimigo mais forte, com cartas raras.' },
    miniboss: { nome: 'Arauto',  cor: '#ff5a7a', r: 28, desc: 'Duelo de 3 ou 4 jogadores. Prende um membro da União: vencer liberta o herói para a sua equipe e abre o minigame do setor.' },
    guardiao: { nome: 'Guardião',  cor: '#ff9a3c', r: 36, desc: 'Um dos 4 guardiões espalhados pelo mapa. Cada um vencido tira 30 pontos de cada atributo das cartas da Besta.' },
    loja:     { nome: 'Loja',      cor: '#7dffb0', r: 21, desc: 'Compre cartas com pêndulos.' },
    minigame: { nome: 'Minigame', cor: '#ff8ad8', r: 21, desc: 'Um desafio. Passe com ao menos "Bom" para abrir o caminho; se falhar, pague um pouco para tentar de novo.' },
    boss:     { nome: 'Boss final', cor: '#fbf9ff', r: 66, desc: 'A Besta, no núcleo da galáxia.' },
  };
  const LADOS = { esq: 'Vila Velha', cima: 'Kaeliran', dir: 'Belfex', baixo: 'Braço de Origem', nw: 'Cidade Crepúsculo', ne: 'Promessas do Mar' };   // setores: lugares dos livros (Diário Sobrenatural, Ciclo de Jesed, Viajantes, Spacetheft, Mistério Oculto, Édelin Lys)
  const REGIAO = { 1: 'Orla', 2: 'Margem', 3: 'Umbral', 4: 'Núcleo' };
  const STARTS = new Set(Object.values(M.starts || {}));
  // Poeira cósmica leve e determinística: é ambiente, não participa dos toques no mapa.
  function particulasMapa() {
    return Array.from({ length: 22 }, (_, i) => {
      const x = (i * 37 + 11) % 100, y = (i * 61 + 17) % 100, s = 1 + (i % 3), d = 10 + (i % 6) * 2, dl = -(i % 7) * 1.7;
      const dx = (i % 2 ? 1 : -1) * (12 + (i % 4) * 7), dy = -18 - (i % 5) * 8;
      return `<i style="--x:${x}%;--y:${y}%;--s:${s}px;--d:${d}s;--dl:${dl}s;--dx:${dx}px;--dy:${dy}px"></i>`;
    }).join('');
  }
  function setor(n) {   // cunhas diagonais: NW = Mistério Oculto, NE = Édelin Lys (mesmas faixas de tools/regioes_diagonais.py)
    if (!['normal', 'evento', 'elite', 'miniboss'].includes(n.tipo) || STARTS.has(n.id)) return n.lado;
    const g = Math.atan2(n.y, n.x) * 180 / Math.PI;
    return g >= -65 && g <= -25 ? 'ne' : g >= -155 && g <= -115 ? 'nw' : n.lado;
  }
  const NOS = M.nos, BY = {}; NOS.forEach(n => { BY[n.id] = n; });
  const EX = 1.4, EYT = .62, EYB = .8, EY = EYB;   // o mapa gerado é quadrado; a arte de fundo é 2:1: pontos esticados na horizontal e mais comprimidos em cima do que embaixo (o Boss continua em 0,0, sobre o buraco negro)
  if (!M._lay) { M._lay = 1; NOS.forEach(n => { n.x = Math.round(n.x * EX); n.y = Math.round(n.y * (n.y < 0 ? EYT : EYB)); }); }
  // Minigames no mapa (autor, 29/10/2026): 7 de série (dão 1 broche) + 10 base, em pontos que fecham caminhos; é preciso passar (nível "Bom" ou mais) para abrir a área seguinte.
  // Ao falhar o ponto fica bloqueado até pagar MG_CUSTO pêndulos; o prêmio máximo é para quem quer desafio (pode rejogar depois de passar para melhorar o prêmio).
  const MG = { B082: ['elos', 'diario'], B088: ['culpado', 'misterio'], B089: ['luas', 'jesed'], B052: ['ritmo', 'belfex'], B077: ['poderes', 'viajantes'], B065: ['gancho', 'spacetheft'], B081: ['formacao', 'uniao'],
    B018: ['maiormenor'], B037: ['mineracao'], B061: ['raspadinha'], B076: ['caracoroa'], B074: ['cacapendulo'], B056: ['ordem'], B053: ['memoria'], B046: ['quemequem'], B054: ['asteroides'], B073: ['cofre'] };
  const MG_CUSTO = 10;
  Object.values(M.starts).forEach(id => { if (BY[id]) { BY[id].tipo = 'normal'; const b = window.DS_HIST_BAT && window.DS_HIST_BAT[id]; if (b) { b.t = 'normal'; delete b.e; } } });   // a primeira batalha de cada caminho é sempre normal, nunca um evento
  Object.keys(MG).forEach(id => { if (BY[id]) { BY[id].tipo = 'minigame'; BY[id].mg = MG[id][0]; BY[id].serieMg = MG[id][1] || null; } });
  if (!M._mgsp) { M._mgsp = 1;   // minigames mais afastados entre si, sem encostar nos outros pontos
    const L = NOS.filter(n => n.tipo === 'minigame'), O = NOS.filter(n => n.tipo !== 'minigame'), D = 240;
    for (let it = 0; it < 80; it++) { let mv = 0; L.forEach(a => { L.forEach(b => { if (a === b) return; const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1; if (d < D) { const f = (D - d) / 2 / d; a.x = Math.round(a.x - dx * f); a.y = Math.round(a.y - dy * f); b.x = Math.round(b.x + dx * f); b.y = Math.round(b.y + dy * f); mv++; } }); O.forEach(o => { const dx = a.x - o.x, dy = a.y - o.y, d = Math.hypot(dx, dy) || 1; if (d < 85) { a.x = Math.round(a.x + dx / d * (85 - d)); a.y = Math.round(a.y + dy / d * (85 - d)); mv++; } }); }); if (!mv) break; } }
  const mgInfo = n => (window.DSMini && window.DSMini.LISTA.find(m => m.id === n.mg)) || { nome: 'Minigame', desc: '' };
  const BATALHAS = NOS.filter(n => n.tipo !== 'loja');
  const GUARD = Object.values(M.guardioes);
  // Guardiões (autor, 29/10): cada ponto sorteia um dos 4 no começo da partida. Cartas por guardião calibradas por simulação (jogador médio: 4 da União + boas cartas ≈ 55–60%).
  const GUARDAS = {   // nomes de constelação (cada um ligado ao personagem da carta): Órion/Cassiopeia (Orionus Polar, Sumo Vigia), Corvus (Korvo), Lince (Breno Lins), Escorpião (Raukhar)
    G1: { nome: 'Dupla somada', nomes: ['Cassiopeia', 'Órion'], av: ['J26', 'J31'], regra: 'g_duo', m: [2, 1], fraco: true, txt: 'Dois guardiões: cada um joga uma carta e o poder das duas se soma contra a sua. Se vencerem, a carta vai para quem tinha o maior atributo; se um cair, o outro segue sozinho.' },
    G2: { nome: 'Roubo duplo', nomes: ['Corvus'], av: ['V10'], regra: 'g_roubo', simbolos: true, m: 9, txt: 'Quem vence leva mais uma carta do topo do perdedor: captura se atacou, Buraco Negro se defendeu. Em toda disputa surgem símbolos de atributo: toque nos verdes (+5 na próxima disputa) e evite os vermelhos (−5).' },
    G3: { nome: 'Blocos de três', nomes: ['Lince'], av: ['V01'], regra: 'g_bloco', m: 12, txt: 'As disputas valem em blocos de 3. Quem vencer mais leva as cartas do outro: captura se atacou mais, Buraco Negro se defendeu mais.' },
    G4: { nome: 'Fenômeno a cada disputa', nomes: ['Escorpião'], av: ['J32'], evTodas: true, m: 6, txt: 'Um fenômeno diferente em toda disputa. Ao ficar sem cartas, o guardião puxa até 7 do Buraco Negro, uma vez.' },
  };
  function guardaDe(id) {   // sorteio guardado no save: a posição é fixa, o guardião varia
    S.guardas = S.guardas || {}; if (!Object.keys(S.guardas).length || GUARD.some(x => !S.guardas[x])) { const ids = ['G1', 'G2', 'G3', 'G4']; for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; } GUARD.forEach((x, k) => { S.guardas[x] = ids[k]; }); save(); }
    return S.guardas[id];
  }
  // cada arauto (tipo 'miniboss') prende um membro da União; vencê-lo o liberta e abre o minigame do setor/série
  const EXC = new Set(['S11', 'V26', 'J30']);   // fora de decks inimigos, baús, lojas, capturas e mão inicial: a Besta só no Boss; Átila só como recompensa final da cadeia de NPCs
  const LIBERTA = { B059: 'D06', B062: 'M01', B066: 'J03', B080: 'B01', B072: 'S01', B064: 'M10', B057: 'V15', B078: 'V02' };
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
  const NPC = window.DSNpc;   // NPCs, missões, fragmentos e registros (historia_npcs.js)
  let lastVis = null;

  let S = null;                                   // jornada salva (ou null)
  let P = Object.assign({ aberto: false, escuro: true, numeros: true, slot: 1 }, rd(PKEY, {}));   // preferências (mapa aberto = modo teste, desligado por padrão: só se avança vencendo)
  if (P.v2 !== 1) { P.aberto = false; P.v2 = 1; try { wr(PKEY, P); } catch (e) { } }   // migração: o mapa aberto (teste) passa a vir desligado
  const save = () => { if (S) wr(kSlot(P.slot), S); wr(PKEY, P); };   // 3 saves: o 1 usa a chave antiga
  const slotOk = n => { const s = rd(kSlot(n), null); return s && s.v === 1 && BY[s.startId] ? s : null; };
  const load = () => { const s = rd(kSlot(P.slot), null); S = s && s.v === 1 && BY[s.startId] ? s : null; return S; };

  // ---------------------------------------------------------------- regras do mapa
  const cleared = id => !!(S && S.cleared[id]);
  const bossOpen = () => true;   // REGRA (autor, 29/10): a Besta pode ser enfrentada desde o início; cada guardião vivo dá +30 em todos os atributos às cartas dela
  const nBroches = () => Object.keys((S && S.broches) || {}).length;   // um broche por série (7); só o contador aparece, o uso é segredo
  const guardVivos = () => GUARD.filter(x => !cleared(x)).length, bonusBoss = () => 30 * guardVivos();
  // liberados: vizinhos de pontos vencidos, mais o ponto de partida. Loja não bloqueia: ao alcançá-la, o que vem depois também fica liberado.
  let libKey = '', libSet = new Set();
  const pulado = id => !!(S && S.atalhos && S.atalhos[id]);   // batalha opcional após a ajuda por derrotas
  function liberados() {
    const key = Object.keys(S.cleared).sort().join() + '|' + Object.keys(S.atalhos || {}).sort().join() + '|' + S.startId; if (key === libKey) return libSet;
    const A = new Set([S.startId]), pilha = Object.keys(S.cleared).concat(Object.keys(S.atalhos || {})), vistos = new Set();
    while (pilha.length) { const id = pilha.pop(); if (vistos.has(id)) continue; vistos.add(id); BY[id].viz.forEach(v => { if (v === M.boss) return; A.add(v); if (BY[v].tipo === 'loja') pilha.push(v); }); }
    libKey = key; libSet = A; return A;
  }
  const aberto_ = id => cleared(id) || pulado(id) || (BY[id].tipo === 'loja' && liberados().has(id));   // ponto "aberto": venceu, foi liberado pela ajuda, ou é loja já alcançada
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
    dice: '<rect x="-9" y="-9" width="18" height="18" rx="4" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="-3.5" cy="-3.5" r="1.8" fill="currentColor"/><circle cx="3.5" cy="3.5" r="1.8" fill="currentColor"/><circle cx="3.5" cy="-3.5" r="1.8" fill="currentColor"/><circle cx="-3.5" cy="3.5" r="1.8" fill="currentColor"/>',
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
    const arquivo = { normal: 'normal', evento: 'evento', elite: 'elite', miniboss: 'miniboss', guardiao: 'guardiao', loja: 'loja', minigame: 'minigame', boss: 'boss' }[n.tipo];
    const tam = r * (n.tipo === 'boss' ? 2.7 : 2.55);
    const arte = `<image class="node-art" href="cena/icones-mapa/${arquivo}.png" x="${(-tam / 2).toFixed(1)}" y="${(-tam / 2).toFixed(1)}" width="${tam.toFixed(1)}" height="${tam.toFixed(1)}" preserveAspectRatio="xMidYMid meet"/>`;
    let inner = '';
    if (n.tipo === 'boss') inner = `<circle class="hs-ring r1" r="${r + 18}"/><circle class="hs-ring r2" r="${r + 44}"/><circle class="win-ring" r="${r + 9}"/><circle r="${r}" class="body"/>${arte}`;
    else inner = `<circle class="halo" r="${r + 10}"/><circle class="win-ring" r="${r + 7}"/><circle class="body" r="${r}"/>${arte}<text class="lbl" y="${r + 18}">${esc(num)}</text>`;
    return `<g class="n t-${n.tipo}" data-id="${n.id}" transform="translate(${n.x} ${n.y})" style="--c:${T.cor}" tabindex="0" role="button" aria-label="${esc(nome(n))}">${inner}<g class="chk" transform="translate(${r * .72} ${-r * .72})"><circle r="9"/><path d="M-4 0 L-1 3 L5 -3.5" fill="none" stroke="#1d1400" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></g></g>`;
  }
  function nome(n) {
    if (n.tipo === 'boss') return 'Boss final: A Besta';
    if (n.tipo === 'guardiao') return 'Guardião: ' + LADOS[n.lado];
    if (n.tipo === 'loja') return 'Loja ' + n.id.slice(1);
    if (n.tipo === 'minigame') return mgInfo(n).nome;
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
    const linhas = [1, 2, 3].map(n => { const s = slotOk(n), nb = s ? Object.keys(s.cleared || {}).length : 0;
      return `<div class="hs-slot${s ? ' on' : ''}"><b>${n}</b>${s ? `<span class="hs-sn">${esc(s.nome || 'Viajante')}<small>${nb} / ${BATALHAS.length}</small></span><button class="btn primary" data-a="cont" data-s="${n}">Continuar</button><button class="btn ibtn" data-a="del" data-s="${n}" aria-label="Apagar save ${n}">✕</button>` : `<span class="hs-sn"><small>Vazio</small></span><button class="btn primary" data-a="novo" data-s="${n}">Novo jogo</button>`}</div>`; }).join('');
    h.innerHTML = `      <button class="hs-back ibtn" data-a="sair" aria-label="Sair do modo história">←</button>
      <div class="hs-hubin"><div class="hs-seal"></div><h1>${U.uniaoLogo('uniao-logo-hero')}</h1><div class="hs-slots">${linhas}</div></div>`;
    h.onclick = e => {
      const b = e.target.closest('[data-a]'); if (!b || b.disabled) return; SND.init(); SND.play('click'); const n = +b.dataset.s || 1;
      if (b.dataset.a === 'sair') U.show('menu');
      else if (b.dataset.a === 'cont') { P.slot = n; save(); load(); openMap(false, false, true); }
      else if (b.dataset.a === 'novo') { P.slot = n; S = null; sortear(); }
      else if (b.dataset.a === 'del') confirmDel(n);
    };
  }
  function confirmDel(n) {
    const box = el(`<div class="hs-conf"><h3>Apagar o save ${n}?</h3><p>O progresso será perdido.</p><div class="row"><button class="btn" data-a="n">Cancelar</button><button class="btn primary" data-a="s">Apagar</button></div></div>`);
    const m = U.modal(box, { cls: 'hs-modal' });
    box.onclick = e => { const b = e.target.closest('[data-a]'); if (!b) return; SND.play('click'); m.close(); if (b.dataset.a === 's') { try { localStorage.removeItem(kSlot(n)); } catch (x) { } if (P.slot === n) S = null; hub(); } };
  }
  function confirmNovo() {
    const box = el(`<div class="hs-conf"><h3>Começar uma nova jornada?</h3><p>O progresso atual (${nBat()} batalhas vencidas) será apagado.</p><div class="row"><button class="btn" data-a="n">Cancelar</button><button class="btn primary" data-a="s">Nova jornada</button></div></div>`);
    const m = U.modal(box, { cls: 'hs-modal' });
    box.onclick = e => { const b = e.target.closest('[data-a]'); if (!b) return; SND.play('click'); m.close(); if (b.dataset.a === 's') sortear(); };
  }
  // cartas iniciais: 6 comuns + 1 épica (sem a Besta nem a União)
  function iniciais() {
    const pool = U.D.CARTAS.filter(c => !c.uniao && !EXC.has(c.id)), sh = a => a.map(x => [Math.random(), x]).sort((x, y) => x[0] - y[0]).map(x => x[1]);
    return sh(pool.filter(c => c.raridade === 'comum')).slice(0, 6).concat(sh(pool.filter(c => c.raridade === 'epica')).slice(0, 1)).map(c => c.id);
  }
  // ---- ponto de partida: uma das 4 extremidades, sorteada em silêncio (sem tela de sorteio)
  function sortear() {
    const ladoSel = ['esq', 'cima', 'dir', 'baixo'][Math.floor(Math.random() * 4)];
    S = { v: 1, start: ladoSel, startId: M.starts[ladoSel], pos: M.starts[ladoSel], cleared: {}, pend: 0, owned: iniciais(), created: Date.now() }; S.npc = S.owned[Math.floor(Math.random() * S.owned.length)]; save();
    if (window.DSCinema) window.DSCinema.play((pulou, v) => { if (v && v.nome) { S.nome = v.nome; save(); } openMap(true, true); }); else openMap(true);
  }

  // ---- mapa
  function openMap(novo, intro, comFade) {
    if (!S) return; view = 'map';
    const h = $('#hsHub', root), mp = $('#hsMap', root); h.hidden = true; mp.hidden = false;
    mp.innerHTML = `<div class="hs-particles" aria-hidden="true">${particulasMapa()}</div><svg class="hs-svg" id="hsSvg" aria-label="Mapa da jornada"><defs><filter id="hsGalB" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="90"/></filter><mask id="hsGalM" maskUnits="userSpaceOnUse" x="-1392" y="-612" width="2800" height="1400"><rect x="-1292" y="-512" width="2600" height="1200" fill="#fff" filter="url(#hsGalB)"/></mask><radialGradient id="hsCoin" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#ff8d80"/><stop offset=".55" stop-color="#d8332f"/><stop offset="1" stop-color="#8c1612"/></radialGradient>
        <radialGradient id="hsLight"><stop offset="0" stop-color="#d9c8ff" stop-opacity=".34"/><stop offset=".45" stop-color="#8f6cff" stop-opacity=".14"/><stop offset="1" stop-color="#8f6cff" stop-opacity="0"/></radialGradient><radialGradient id="hsLightH"><stop offset="0" stop-color="#ffe9b0" stop-opacity=".5"/><stop offset=".4" stop-color="#ffc46b" stop-opacity=".2"/><stop offset="1" stop-color="#ffc46b" stop-opacity="0"/></radialGradient>
        <filter id="hsGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter></defs>
        <g id="hsCam"><image class="hs-gal" href="cena/mapa-galaxia.png" x="-1392" y="-612" width="2800" height="1400" preserveAspectRatio="none" mask="url(#hsGalM)"/><g class="hs-edges">${EDGES.map(([a, b]) => `<path class="e" data-a="${a.id}" data-b="${b.id}" d="${edgePath(a, b)}"/>`).join('')}</g><g id="hsLights"></g><g class="hs-nodes">${NOS.map(nodeSvg).join('')}</g><g id="hsNpcs"></g><g id="hsMarks"></g>${heroSvg()}<g id="hsArrows"></g></g></svg>
      <div class="hs-hud top"><button class="ibtn" data-a="back" aria-label="Voltar">←</button><div class="hs-ttl">${U.uniaoLogo('uniao-logo-map')}</div>
        <div class="hs-pill" title="Pêndulos">${coinSvg(20)}<b id="hsPend">${S.pend}</b></div><div class="hs-pill hs-frg" id="hsFrgP" title="Fragmentos dimensionais"${NPC && NPC.nFrag() ? '' : ' hidden'}>${NPC ? NPC.cristal(true) : ''}<b id="hsFrag">${NPC ? NPC.nFrag() : 0}</b></div><button class="hs-pill hs-bro" data-a="broches" title="Broches" aria-label="Broches"><span class="ci">◈</span><b id="hsBro">${nBroches()}</b><small>/ 7</small></button><button class="hs-pill" data-a="cartas" title="Minhas cartas" aria-label="Minhas cartas"><span class="ci">▮</span><b id="hsCards">${S.owned.length}</b><small>/ ${U.D.CARTAS.length}</small></button></div>
      <div class="hs-hud ctl"><button class="ibtn" data-a="start" aria-label="Ir à sua posição" title="Minha posição">⌖</button><button class="ibtn" data-a="fit" aria-label="Ver o mapa inteiro" title="Visão geral">▣</button><button class="ibtn" data-a="missoes" aria-label="Missões" title="Missões">☰<i class="dot" hidden></i></button><button class="ibtn" data-a="colecao" aria-label="Coleção" title="Coleção">✦</button><button class="ibtn" data-a="aluguel" id="hsAlug" aria-label="Aluguel de cartas"${S.alug ? '' : ' hidden'}>⇄</button><button class="ibtn" data-a="opts" aria-label="Configurações" title="Configurações">⚙</button><button class="ibtn map-help" data-a="leg" aria-label="Legenda e opções" title="Ajuda">?</button></div>
      <div class="hs-sheet" id="hsSheet" hidden></div><div class="hs-toast" id="hsToast" hidden></div><div class="hs-dark" id="hsDark"></div>`;
    svg = $('#hsSvg', root); camG = $('#hsCam', root); sheet = $('#hsSheet', root); svg.classList.toggle('no-nums', P.numeros === false);
    paintAll(); bindMap(mp); heroPlace(posId(), false);
    let pm = null; try { pm = SND.histPlay('mapa'); } catch (e) { }
    mp.classList.toggle('intro', !!intro);
    const abreComMusica = (ms) => { const dk = $('#hsDark', root); if (!dk) return; Promise.race([Promise.resolve(pm), new Promise(r => setTimeout(r, 4000))]).then(() => setTimeout(() => dk.classList.remove('on'), ms)); };   // a tela só abre quando a música começa
    if (comFade && !intro && !document.body.classList.contains('reduce')) { const dk = $('#hsDark', root); dk.style.transition = 'none'; dk.classList.add('on'); void dk.offsetWidth; dk.style.transition = 'opacity 1.8s ease'; abreComMusica(250); }
    if (intro) {   // o mundo começa preto e vai clareando; o boneco aparece depois
      const dk = $('#hsDark', root), hr = $('#hsHero', root), red = document.body.classList.contains('reduce');
      if (!red) { dk.style.transition = 'none'; dk.classList.add('on'); hr.style.opacity = 0; void dk.offsetWidth; dk.style.transition = 'opacity 2.4s ease'; abreComMusica(300); setTimeout(() => { hr.style.transition = 'opacity 2s ease'; hr.style.opacity = 1; SND.play('banner'); }, 3600); setTimeout(() => { mp.classList.remove('intro'); }, 4200); }
      else mp.classList.remove('intro');
    }
    requestAnimationFrame(() => { const st = BY[S.startId]; const ps = BY[posId()]; if (novo) { fit(false); setTimeout(() => centerOn(ps.x, ps.y, .8, true), 450); } else centerOn(ps.x, ps.y, .7, false); });
  }
  function paintAll() {
    $$('.hs-edges .e', root).forEach(p => { p.setAttribute('class', 'e ' + edgeState(p.dataset.a, p.dataset.b)); });
    $$('.n', root).forEach(g => paintNode(g));
    svg.classList.toggle('aberto', !!P.aberto); paintLuz(); paintSetas();
    const mk = $('#hsMarks', root); if (mk) mk.innerHTML = '';
    const pb = $('#hsBro', root); if (pb) pb.textContent = nBroches(); const pe = $('#hsPend', root), pc = $('#hsCards', root); if (NPC) { const fg = $('#hsFrag', root), fp = $('#hsFrgP', root), nf = NPC.nFrag(); if (fg) fg.textContent = nf; if (fp) fp.hidden = !nf; } const ba = $('#hsAlug', root); if (ba) ba.hidden = !S.alug; if (pe) pe.textContent = S.pend; if (pc) pc.textContent = S.owned.length;
  }
  // ---- o que aparece: só o que foi vencido ilumina. Caminhos e bifurcações surgem ao vencer uma fase; os vizinhos aparecem (abertos ou trancados) mesmo com o boneco longe. O núcleo está sempre visível.
  const NUCLEO = new Set(NOS.filter(n => n.tier === 4).map(n => n.id));
  function paintLuz() {   // visibilidade: só se vê o ponto onde está, o que já venceu e os PRÓXIMOS pontos (ramos cinza). O que está além fica escondido; o núcleo é sempre visível.
    const ocultar = P.escuro !== false && !(NPC && NPC.tem('mapa')); svg.classList.toggle('escuro', ocultar);
    const rev = new Set([posId()]); NOS.forEach(n => { if (aberto_(n.id)) rev.add(n.id); });   // quem revela os vizinhos: onde estou, o que venci e lojas já alcançadas
    const vis = new Set(NUCLEO); rev.forEach(i => { vis.add(i); BY[i].viz.forEach(v => vis.add(v)); });
    $$('.n', root).forEach(g => g.classList.toggle('fog', ocultar && !vis.has(g.dataset.id)));
    $$('.hs-edges .e', root).forEach(p => { const a = p.dataset.a, b = p.dataset.b; p.classList.toggle('fog', ocultar && !(rev.has(a) || rev.has(b) || (NUCLEO.has(a) && NUCLEO.has(b)))); });
    lastVis = vis; if (NPC) NPC.paint(rev, ocultar);
  }
  function paintNode(g) {
    const n = BY[g.dataset.id], ok = cleared(n.id), skip = pulado(n.id), av = available(n.id);
    g.classList.toggle('done', ok); g.classList.toggle('skip', skip); g.classList.toggle('avail', av && !ok); g.classList.toggle('lock', !av && !ok); g.classList.toggle('isstart', n.id === S.startId);
    if (n.tipo === 'boss') g.classList.toggle('opened', guardVivos() === 0);
    if (n.tipo === 'minigame') g.classList.toggle('mglock', !!(S.mgLock && S.mgLock[n.id]) && !ok);
  }

  // ---- câmera: arrastar, pinça, roda do mouse
  const view$ = () => { const r = svg.getBoundingClientRect(); return { w: r.width, h: r.height }; };
  let movT = null;
  function applyCam(anim) {
    const { w, h } = view$();
    const limX = (R * EX + 260) * cam.k, limY = (R * EY + 260) * cam.k;   // não deixa o mapa sair da tela
    cam.x = Math.max(w / 2 - limX, Math.min(w / 2 + limX, cam.x)); cam.y = Math.max(h / 2 - limY, Math.min(h / 2 + limY, cam.y));
    camG.style.transition = anim ? 'transform .75s cubic-bezier(.3,.8,.3,1)' : 'none';
    if (svg) { svg.classList.add('mov'); clearTimeout(movT); movT = setTimeout(() => svg && svg.classList.remove('mov'), anim ? 850 : 220); }   // em movimento: animações pausadas (mapa mais leve)
    camG.style.transform = `translate(${cam.x}px,${cam.y}px) scale(${cam.k})`;
    svg.classList.toggle('far', cam.k < .42);
  }
  function centerOn(mx, my, k, anim) { const { w, h } = view$(); cam.k = k == null ? cam.k : k; cam.x = w / 2 - mx * cam.k; cam.y = h / 2 - my * cam.k; applyCam(anim); }
  function fit(anim) { const { w, h } = view$(); const k = Math.min(w / (2 * (R * EX + 120)), h / (R * (EYT + EYB) + 240)); cam.k = k; cam.x = w / 2; cam.y = h / 2 - R * (EYB - EYT) / 2 * k; applyCam(anim); }
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
      if (!ptrs.size && moved <= 8 && startPt) { const g = (startPt.t.closest && startPt.t.closest('.n')), q = (startPt.t.closest && startPt.t.closest('.npcm')); if (q && NPC) NPC.toque(q.dataset.id); else if (g) toque(g.dataset.id); else closeSheet(); } };
    svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', e => { ptrs.delete(e.pointerId); pinch0 = null; });
    svg.addEventListener('wheel', e => { e.preventDefault(); const r = svg.getBoundingClientRect(); zoomAt(e.clientX - r.left, e.clientY - r.top, e.deltaY < 0 ? 1.15 : 1 / 1.15, false); }, { passive: false });
    svg.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.closest && e.target.closest('.seta')) { e.preventDefault(); passo(e.target.closest('.seta').dataset.to); } else if ((e.key === 'Enter' || e.key === ' ') && e.target.closest && e.target.closest('.n')) { e.preventDefault(); toque(e.target.closest('.n').dataset.id); } });
    mp.addEventListener('click', e => {
      const b = e.target.closest('.hs-hud [data-a]'); if (!b) return; SND.init(); SND.play('click'); const { w, h } = view$();
      const a = b.dataset.a;
      if (a === 'back') hub();
      else if (a === 'start') { const st = BY[posId()]; centerOn(st.x, st.y, .8, true); }
      else if (a === 'fit') fit(true);
      else if (a === 'leg') legenda();
      else if (a === 'opts') U.options();
      else if (a === 'cartas') minhasCartas(); else if (a === 'aluguel') aluguel();
      else if (a === 'missoes' && NPC) NPC.missoes();
      else if (a === 'colecao' && NPC) NPC.colecao();
      else if (a === 'broches') toast(nBroches() ? 'Os broches brilham quando estão juntos. Para que será que servem?' : 'Algo guarda os broches de cada série. Para que será que servem?');
    });
    window.addEventListener('resize', () => { if (view === 'map' && svg && svg.isConnected) applyCam(false); });
  }


  // ---- o boneco anda casa por casa (como no mapa do modo história do Smash): nada de pular para um ponto distante
  const posId = () => (S && S.pos && BY[S.pos]) ? S.pos : S.startId;
  const passa = id => P.aberto || cleared(id) || pulado(id) || BY[id].tipo === 'loja';   // pontos por onde se pode atravessar
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
  // toque numa bolinha: se o caminho até ela está aberto, o boneco anda até lá; senão só mostra o painel
  function toque(id) {   // ponto no alcance de nada: 1º toque abre o painel (sem ações, o boneco está longe); 2º toque traça a rota até lá
    if (andando) return; if (id !== posId() && passos().includes(id)) return passo(id);
    if (id !== posId() && curId === id && sheet && !sheet.hidden && caminho(id)) return andar(id); openNode(id);
  }
  // (sem setas) parado numa casa, cada direção possível aparece como seta; clicar na seta dá UM passo (clicar na bolinha só mostra o painel)
  function passos() {
    const u = posId(), n = BY[u], pass = passa(u);
    return n.viz.filter(v => !(v === M.boss && !bossOpen() && !P.aberto) && (pass || passa(v)));
  }
  function paintSetas() {
    const g = $('#hsArrows', root); if (!g) return; g.innerHTML = ''; return;   // setas removidas: toque direto na bolinha
    if (andando) { g.innerHTML = ''; return; }
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
    casa = null; h.style.transition = anim ? 'transform .34s linear' : 'none'; h.style.transform = `translate(${n.x}px,${n.y - r - 10}px)`;
  }
  let casa = null;   // NPC em cuja casa o boneco está parado (null = em um ponto)
  async function andarNpc(to, pt, via, id) {   // anda até a casa do NPC (marcador sobre a ligação) e PARA ali; falar é um segundo toque
    if (andando) return; let p = caminho(to) || [to]; if (p.length >= 2 && p[p.length - 2] === via) p = p.slice(0, -1);
    andando = true; closeSheet(); const red = document.body.classList.contains('reduce');
    for (let i = 1; i < p.length; i++) { const n = BY[p[i]]; S.pos = n.id; heroPlace(n.id, !red); SND.play('tick'); paintLuz(); centerOn(n.x, n.y, cam.k < .6 ? .75 : null, !red); await new Promise(r => setTimeout(r, red ? 60 : 360)); }
    const hh = $('#hsHero', root); if (hh) { hh.style.transition = red ? 'none' : 'transform .45s linear'; hh.style.transform = `translate(${pt.x}px,${pt.y - 22}px)`; }
    SND.play('tick'); centerOn(pt.x, pt.y, cam.k < .6 ? .75 : null, !red); await new Promise(r => setTimeout(r, red ? 60 : 480));
    save(); andando = false; paintAll(); casa = id; abrirCasa(id);
  }
  function abrirCasa(id) {   // a casa do NPC é um ponto como os outros: o boneco fica aqui e o painel oferece a conversa
    const c = NPC && NPC.casaSheet(id); if (!c) return; curId = 'casa:' + id; SND.play('click'); $$('.n.sel', root).forEach(g => g.classList.remove('sel'));
    sheet.innerHTML = c.html; sheet.hidden = false; ensureVisible(c.pt);
    sheet.onclick = e => { const b = e.target.closest('[data-a]'); if (!b) return; if (b.dataset.a === 'x') closeSheet(); else if (b.dataset.a === 'conv') NPC.falar(id); };
  }
  let refr = false;
  const refrescaCasa = () => { if (refr || !casa || !sheet || sheet.hidden || curId !== 'casa:' + casa) return; refr = true; try { const c = NPC.casaSheet(casa); if (c) sheet.innerHTML = c.html; } finally { refr = false; } };   // só troca o conteúdo do painel (sem reabrir: evita laço com paint)
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
    const ok = cleared(id), av = available(id), aqui = id === posId(), cam_ = aqui ? null : caminho(id), lockMg = n.tipo === 'minigame' && !!(S.mgLock && S.mgLock[id]) && !ok;
    const bat0 = window.DS_HIST_BAT && window.DS_HIST_BAT[id], et = bat0 && bat0.e && n.tipo !== 'minigame' && textoEvento(bat0.e), evLinha = et ? `<p class="hs-ev">⚡ <b>${esc(et.nome)}</b>: ${esc(et.regra)}</p>` : '';
    const gdn = n.tipo === 'guardiao' ? GUARDAS[guardaDe(id)] : null, inimL = bat0 && !['loja', 'minigame', 'boss'].includes(n.tipo) ? (gdn ? [{ n: gdn.nome, c: gdn.av }] : bat0.i) : null;   // melhoria "Olho vivo"
    const conhece = !!(NPC && NPC.tem('olho')) || !!(S.vistos && S.vistos[id]);   // cartas do inimigo: "?" até duelar uma vez (ganhando ou perdendo) ou comprar o Olho vivo
    const cartas = inimL ? '<div class="hs-olho"></div>' : '';
    const jog = n.tipo === 'miniboss' ? 'Duelo de 3 ou 4 jogadores' : n.tipo === 'guardiao' ? 'Duelo contra o guardião' : n.tipo === 'boss' ? 'Você contra o Boss' : n.tipo === 'loja' ? 'Loja de cartas' : n.tipo === 'minigame' ? 'Minigame' + (n.serieMg ? ' · dá 1 broche' : '') : 'Você contra 1 inimigo';
    sheet.innerHTML = `<button class="ibtn x" data-a="x" aria-label="Fechar">✕</button>
      <div class="hs-sh-h"><span class="hs-dot" style="background:${T.cor}"></span><div><h3>${esc(nome(n))}</h3><small>${esc(T.nome)} · ${esc(REGIAO[n.tier])}</small></div></div>
      <p class="hs-st ${ok ? 'hs-ok' : pulado(id) ? 'hs-skip' : lockMg ? 'hs-lk' : av ? 'hs-av' : 'hs-lk'}">${ok ? (n.tipo === 'minigame' ? '✓ Passou' : '✓ Vencida') : pulado(id) ? 'Caminho liberado · duelo opcional' : lockMg ? 'Bloqueado: vença a próxima batalha ou pague' : av ? 'Disponível' : 'Caminho fechado'}</p>
      ${evLinha}${n.tipo === 'minigame' ? mgTiers(n) : n.tipo !== 'loja' && n.tipo !== 'boss' ? `<p class="hs-rec">${coinSvg(15)}<b>${premioDe(n)}</b>${BAUS[n.id] && !(S.baus && S.baus[n.id]) ? ' · baú' : ''}</p>` : ''}${n.id === M.boss ? `<p class="hint">Besta +${bonusBoss()} em tudo (${guardVivos()} guardiões vivos)</p>` : ''}${cartas}${NPC ? '' : ''}
      <div class="row">${aqui ? (n.tipo === 'loja' ? '<button class="btn primary" data-a="loja">Entrar</button>' : n.tipo === 'minigame' ? (lockMg ? `<button class="btn primary" data-a="desbloq">${NPC && NPC.tem('segunda') && !(S.mgGratis && S.mgGratis[n.mg]) ? 'Desbloquear de graça (1×)' : 'Desbloquear por ' + Math.min(MG_CUSTO, S.pend | 0) + ' pêndulos'}</button>` : `<button class="btn primary" data-a="mini">${ok ? 'Jogar de novo' : 'Jogar'}</button>`) : ok ? '<button class="btn primary" disabled>Você está aqui</button>' : '<button class="btn primary" data-a="duelar">Duelar</button>') : ''}${!aqui && cam_ ? '<span class="hint hs-go">Toque de novo no ponto para ir até lá.</span>' : ''}${P.aberto ? `<button class="btn" data-a="win">${ok ? 'Desfazer vitória (teste)' : 'Marcar vencida (teste)'}</button>` : ''}</div>`;
    if (inimL) { const ol = $('.hs-olho', sheet); if (ol) inimL.forEach(x => { const r = el('<div class="hs-orow"><small></small><div></div></div>'); $('small', r).textContent = x.n + (gdn ? ' · cartas principais' : ''); x.c.forEach(c => { if (!U.CARDS[c]) return; const w = el('<span class="hs-oc"></span>'); if (conhece) { w.append(U.cardEl(c, { up: true, noanim: true, cw: 44 })); if (!(S.owned || []).includes(c)) w.classList.add('nova'); } else w.innerHTML = '<i class="hs-q">?</i>'; $('div', r).append(w); }); ol.append(r); }); }
    sheet.hidden = false; ensureVisible(n);
    sheet.onclick = e => { const b = e.target.closest('[data-a]'); if (!b) return; if (b.dataset.a === 'x') closeSheet(); else if (b.dataset.a === 'win') toggleWin(id); else if (b.dataset.a === 'duelar') duelar(id); else if (b.dataset.a === 'mini') jogarMini(id); else if (b.dataset.a === 'desbloq') desbloquearMini(id); else if (b.dataset.a === 'loja') loja(id); else if (b.dataset.a.startsWith('npc:') && NPC) NPC.falar(b.dataset.a.slice(4)); };
  }
  function ensureVisible(n) {   // o painel cobre a parte de baixo: leva o ponto para a área livre de cima
    const { w, h } = view$(), sh = sheet.getBoundingClientRect().height, free = Math.max(120, h - sh), sy = n.y * cam.k + cam.y, sx = n.x * cam.k + cam.x;
    const want = Math.min(free / 2 + 30, free - 70);
    if (sy > free - 50 || sy < 60 || sx < 30 || sx > w - 30) { cam.y += want - sy; cam.x += Math.max(30, Math.min(w - 30, sx)) - sx; applyCam(true); }
  }
  const mgTiers = n => { const c = window.DSMini ? window.DSMini.cfg(n.mg) : { cortes: [.34, .67, .95], premios: [0, 5, 10, 20] }, best = (S.mgBest && S.mgBest[n.id]) | 0;   // pontuação necessária e prêmio de cada nível; ✓ nos já conquistados
    return '<div class="hs-tiers">' + ['Bom', 'Ótimo', 'Perfeito'].map((nm, i) => `<div class="${best > i ? 'on' : ''}"><i>${best > i ? '✓' : ''}</i><b>${nm}</b><span>${Math.round(c.cortes[i] * 100)}% ou mais</span><em>${coinSvg(13)}${c.premios[i + 1]}</em></div>`).join('') + '</div>'; };
  const mgPremios = n => { const c = window.DSMini ? window.DSMini.cfg(n.mg).premios : [0, 5, 10, 20]; return [c[1], c[2], c[3]]; };
  function desbloquearMini(id) {
    if (!S.mgLock || !S.mgLock[id]) return; S.mgGratis = S.mgGratis || {}; const g1 = NPC && NPC.tem('segunda') && !S.mgGratis[BY[id].mg]; if (g1) S.mgGratis[BY[id].mg] = 1;   // melhoria "Segunda tentativa": 1 desbloqueio grátis por minigame
    const c = g1 ? 0 : Math.min(MG_CUSTO, S.pend | 0);   // sem pêndulos suficientes paga o que tiver, para nunca travar o jogador
    S.pend -= c; delete S.mgLock[id]; save(); SND.play('capture'); paintAll(); openNode(id);
  }
  async function jogarMini(id) {
    const n = BY[id]; if (!window.DSMini || (S.mgLock && S.mgLock[id])) return; closeSheet();
    const primeira = !cleared(id), ant = (S.mgBest && S.mgBest[id]) || 0, res = await window.DSMini.play(n.mg, {}); if (!res) return;
    S.mgBest = S.mgBest || {}; S.mgLock = S.mgLock || {}; let ganho = 0;
    if (res.tier >= 1) {
      const pr = window.DSMini.cfg(n.mg).premios, antR = ant ? pr[ant] | 0 : 0; ganho = Math.max(0, (pr[res.tier] | 0) - antR); S.mgBest[id] = Math.max(ant, res.tier); S.pend = (S.pend | 0) + ganho; S.ganho = (S.ganho | 0) + ganho;
      if (primeira && n.serieMg && window.DSHistoria) window.DSHistoria.darBroche(n.serieMg);
      if (NPC) NPC.fragMini(n.mg, res.tier);
    } else if (primeira) S.mgLock[id] = 1;
    let cartaMg = null; if (res.tier >= 1 && res.carta) { const em = new Set((S.owned || []).concat(alugadas())), pool = U.D.CARTAS.filter(x => !x.uniao && !EXC.has(x.id) && x.raridade !== 'lendaria' && !em.has(x.id)); if (pool.length) { cartaMg = pool[Math.floor(Math.random() * pool.length)].id; S.owned.push(cartaMg); } }
    save(); paintAll(); try { SND.histPlay('mapa'); } catch (e) { }
    if (cartaMg) { await new Promise(r => revelarCarta([cartaMg], r)); try { SND.histPlay('mapa'); } catch (e) { } }
    if (res.tier >= 1 && primeira) { toggleWin(id); if (n.serieMg) toast('Broche conquistado (' + nBroches() + '/7)'); } else if (res.tier < 1 && primeira) { toast('Bloqueado até vencer a próxima batalha, ou pague ' + MG_CUSTO + ' pêndulos.'); openNode(id); } else openNode(id);
  }
  function toggleWin(id) {
    const ok = cleared(id);
    if (ok) delete S.cleared[id]; else S.cleared[id] = 1;
    const mem = LIBERTA[id]; if (mem) { S.owned = S.owned || []; if (ok) S.owned = S.owned.filter(x => x !== mem); else if (!S.owned.includes(mem)) S.owned.push(mem); }
    save(); SND.play(ok ? 'tick' : 'capture'); paintAll();
    if (!ok) { const no = $('.n[data-id="' + id + '"]', root); if (no) { no.classList.add('winflash'); setTimeout(() => no.classList.remove('winflash'), 1100); } }
    openNode(id);
    if (mem && !ok) setTimeout(() => libertar(mem, () => { const f = (window.DS_FALAS_UNIAO || {})[mem]; if (f) npcFala(mem, f); }), 500);
    if (GUARD.includes(id) && !ok) setTimeout(() => quandoLivre(() => golpeBoss()), 500);
    if (!ok && Object.keys(S.cleared).length === 1 && !mem) setTimeout(tutorial, 900);
    if (id === M.boss && !ok) setTimeout(finalCena, 900);
    const g = $('.n[data-id="' + id + '"]', root); if (g && !ok) { g.classList.remove('pop'); void g.getBoundingClientRect(); g.classList.add('pop'); }
  }
  // ---- duelo de verdade: mãos fixas (7 cartas por lado), captura, pêndulos e volta ao mapa
  const FORCA = id => { const c = U.CARDS[id]; return c ? Object.values(c.stats).reduce((a, b) => a + b, 0) : 0; };
  // DIFICULDADE DA CPU (autor, 29/10): sobe de forma contínua com as batalhas vencidas, em todos os tipos de ponto; as cartas de cada inimigo são fixas, só a atenção/erros da CPU mudam.
  // 0 = Fácil (erra bastante), 0,5 = Normal, 1 = Difícil. A rota mínima até os quatro Guardiões pede 30–32 vitórias (31 = marco): ali a CPU já está em ~0,85; depois sobe até 1 por volta de 46.
  const MARCO_GUARDIOES = 31, OFF_NIVEL = { normal: 0, evento: .04, elite: .1, miniboss: .18 };
  const nivelBot = n => { if (n.tipo === 'boss') return 1; const v = nBat(), b = v <= MARCO_GUARDIOES ? .85 * Math.pow(v / MARCO_GUARDIOES, 1.2) : .85 + .15 * Math.min(1, (v - MARCO_GUARDIOES) / 15); return n.tipo === 'guardiao' ? Math.max(.9, b) : Math.min(1, b + (OFF_NIVEL[n.tipo] || 0)); };
  const PREMIO = { normal: 10, evento: 14, elite: 22, miniboss: 35, guardiao: 50, boss: 0 };   // PROPOSTA: pêndulos por vitória (× 1 + 0,5 por região acima da 1ª)
  const premioBase = n => Math.round((PREMIO[n.tipo] || 10) * (1 + .5 * ((n.tipo === "guardiao" ? 4 : n.tier || 1) - 1)));
  const premioDe = n => Math.round(premioBase(n) * (NPC && NPC.tem('bolsa') ? 1.2 : 1));   // melhoria "Bolsa cheia": +20%
  // ---- cansaço das cartas (PROPOSTA, a calibrar): só vale com 21 ou mais cartas. Carta usada numa vitória cansa conforme a raridade; as não usadas descansam 1 ponto por vitória; derrota não cansa. Carta cansada não entra no duelo; pêndulos descansam.
  const CANSA = { comum: 1, rara: 2, epica: 3, lendaria: 4 }, CUSTO_DESC = 4;
  const fadigaOn = () => (S.owned || []).length >= 14 || UNIAO.some(c => (S.owned || []).includes(c));   // REGRA (autor, 29/10): cansaço a partir de 14 cartas ou da primeira carta da União
  const fad = id => (S.fadiga && S.fadiga[id]) | 0;
  const pesoCansa = id => CANSA[(U.CARDS[id] || {}).raridade] || 1;
  function aplicaCansaco(usadas) {   // chamado depois de uma vitória
    if (!fadigaOn()) return 0; S.fadiga = S.fadiga || {}; const us = new Set(usadas); let n = 0;
    Object.keys(S.fadiga).forEach(id => { if (!us.has(id)) { S.fadiga[id] = Math.max(0, S.fadiga[id] - (NPC && NPC.tem('descanso') ? 2 : 1)); if (!S.fadiga[id]) delete S.fadiga[id]; } });
    usadas.forEach(id => { S.fadiga[id] = (S.fadiga[id] | 0) + pesoCansa(id); n++; }); return n;
  }
  const pontosFad = id => '<span class="hs-fad">' + '●'.repeat(Math.min(6, fad(id))) + '</span>';
  // filtro de cartas (raridade, cansadas e série) usado em Minhas cartas e na escolha do time
  function filtros(onChange) {
    const st = { r: '', s: '' };
    const bar = el(`<div class="hs-fil"><div class="hs-fr">${[['', 'Todas']].concat((S.owned || []).some(id => U.CARDS[id] && U.CARDS[id].raridade === 'quasar') ? [['quasar', 'Quasar']] : [], [['lendaria', 'Lend.'], ['epica', 'Épica'], ['rara', 'Rara'], ['comum', 'Comum'], ['cans', 'Cansadas']]).map(([k, t]) => `<button data-r="${k}" class="${k === '' ? 'on' : ''}">${t}</button>`).join('')}</div><select aria-label="Série"><option value="">Todas as séries</option>${Object.keys(U.SERIES || {}).map(k => `<option value="${k}">${esc(U.SERIES[k].nome)}</option>`).join('')}</select></div>`);
    bar.onclick = e => { const b = e.target.closest('[data-r]'); if (!b) return; st.r = b.dataset.r; $$('[data-r]', bar).forEach(x => x.classList.toggle('on', x === b)); onChange(); };
    $('select', bar).onchange = e => { st.s = e.target.value; onChange(); };
    return { bar, ok: id => { const c = U.CARDS[id]; if (!c) return false; if (st.r === 'cans') { if (!fad(id)) return false; } else if (st.r && c.raridade !== st.r) return false; return !st.s || c.serie === st.s; } };
  }
  function escolher7(bat, ok, opt) {   // o jogador escolhe as cartas do duelo (7, ou menos em alguns eventos)
    opt = opt || {}; if (opt.so && !(S.owned || []).some(c => (U.CARDS[c] || {}).raridade === opt.so)) opt = { n: opt.n }; const N = opt.n || 7;   // sem carta da raridade pedida: vale a melhor
    const todas = (S.owned || []).concat(alugadas().filter(c => !(S.owned || []).includes(c))).filter(c => !opt.so || (U.CARDS[c] || {}).raridade === opt.so).sort((a, b) => FORCA(b) - FORCA(a));
    const NN = Math.min(N, todas.length);   // sem cartas suficientes, o time completo é o que há
    const livres = () => todas.filter(id => !fadigaOn() || !fad(id));
    const box = el(`<div class="hs-esc"><h3>Seu time${opt.so ? ' (lendária)' : ''}</h3><div class="hs-deck"></div><p class="hint"><b class="hs-cnt"></b> <span class="hs-msg"></span></p><div class="hs-escg"></div><div class="row"><button class="btn" data-a="melhores">Melhores ${N}</button><button class="btn" data-a="x">Cancelar</button><button class="btn primary" data-a="go">Iniciar</button></div></div>`);
    const g = $('.hs-escg', box), cnt = $('.hs-cnt', box), msg = $('.hs-msg', box), go = $('[data-a=go]', box);
    const sel = new Set(); let forcadas = new Set(); const F = filtros(() => { montar(); upd(); }); g.before(F.bar);
    const auto = () => { sel.clear(); forcadas = new Set(); (opt.prefer || []).filter(x => todas.includes(x) && (!fadigaOn() || !fad(x))).forEach(x => sel.add(x)); const L = livres(); L.slice(0, N).forEach(x => { if (sel.size < N) sel.add(x); });
      if (sel.size < N) todas.filter(x => !sel.has(x)).sort((a, b) => fad(a) - fad(b)).forEach(x => { if (sel.size < N) { sel.add(x); forcadas.add(x); } }); };   // sem 7 descansadas, completa com as menos cansadas (nunca trava)
    const montar = () => { g.innerHTML = ''; todas.filter(F.ok).forEach(id => { const w = el(`<div class="hs-escc${fadigaOn() && fad(id) ? ' tired' : ''}" data-id="${id}"></div>`); w.append(U.cardEl(id, { up: true, noanim: true, cw: 72 })); if (fadigaOn() && fad(id)) w.append(el(`<div class="hs-fadb">${pontosFad(id)}</div>`)); if (alugadas().includes(id)) w.append(el('<div class="hs-alugsel">ALUGADA</div>')); g.append(w); }); };
    const upd = () => { cnt.textContent = sel.size + ' / ' + (opt.livre ? 'até ' : '') + N; go.disabled = opt.livre ? !sel.size : sel.size !== NN;
      const dk = $('.hs-deck', box), cwD = N > 10 ? 34 : N > 8 ? 40 : 48; dk.innerHTML = ''; [...sel].forEach(id => { const w = el('<div class="hs-escc on" data-id="' + id + '"></div>'); w.append(U.cardEl(id, { up: true, noanim: true, cw: cwD })); dk.append(w); }); for (let q = sel.size; q < Math.min(N, 40); q++) dk.append(el('<span class="hs-slot" style="width:' + cwD + 'px;height:' + Math.round(cwD * 1.5) + 'px"></span>')); $$('.hs-escc', g).forEach(w => w.classList.toggle('on', sel.has(w.dataset.id)));
      msg.textContent = forcadas.size ? forcadas.size + ' cansada(s) entraram.' : fadigaOn() && todas.some(x => fad(x)) ? 'Toque numa cansada para descansar (' + CUSTO_DESC + ' por ponto).' : ''; };
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
      else if (b.dataset.a === 'x') m.close(); else if (b.dataset.a === 'go' && (opt.livre ? sel.size > 0 : sel.size === NN)) { m.close(); ok(todas.filter(x => sel.has(x))); }
    };
    upd();
  }
  const embaralha = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const textoEvento = ev => { const c = (window.DS_EVENTOS_H || {})[ev.id]; if (!c) return null; return { nome: c.nome, regra: c.regra.replace('{A}', ev.attr && U.ATT[ev.attr] ? U.ATT[ev.attr].nome : '') }; };
  function duelar(id, auto) {   // auto: gancho de teste, o jogador vira bot e a partida roda sozinha
    const n = BY[id], bat0 = window.DS_HIST_BAT && window.DS_HIST_BAT[id]; if (!bat0 || n.tipo === 'loja') return;
    if (n.tipo === 'boss') return duelarBoss(id, auto);
    const gd = n.tipo === 'guardiao' ? GUARDAS[guardaDe(id)] : null;
    const bat = gd ? Object.assign({}, bat0, { i: gd.nomes.map((nm, k) => { const R = (() => { let a = (id.charCodeAt(3) * 131 + k * 977 + gd.m * 31) >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; })();
      const m = Array.isArray(gd.m) ? gd.m[k] : gd.m, deck = gd.fraco ? [] : [gd.av[k]], used = new Set(gd.av); for (let q = gd.fraco ? 0 : 1; q < m; q++) { const r = gd.fraco ? 'comum' : q === 1 ? 'rara' : q % 2 ? 'epica' : 'lendaria', pool = U.D.CARTAS.filter(c => !c.uniao && !EXC.has(c.id) && c.raridade === r && !used.has(c.id)); if (gd.fraco) pool.sort((x, y) => FORCA(x.id) - FORCA(y.id)); if (!pool.length) break; const c = gd.fraco ? pool[Math.floor(R() * Math.min(6, pool.length))] : pool[Math.floor(R() * pool.length)]; deck.push(c.id); used.add(c.id); }
      return { n: nm, a: gd.av[k], c: deck.sort((x, y) => FORCA(x) - FORCA(y)) }; }) }) : bat0;
    const ev = bat.e || null, mais = NPC && NPC.tem('maos') && n.tipo !== 'boss' && !gd ? 2 : 0;   // melhoria "Mão ampliada": +2 cartas (não vale no Boss nem nos guardiões)
    const opt0 = n.tipo === 'boss' && UNIAO.every(c => (S.owned || []).includes(c)) ? { n: 8 } : n.tipo === 'miniboss' ? { n: Math.max(7, ...bat.i.map(x => x.c.length)) + mais, livre: true } : gd ? { n: 14, livre: true } : mais ? { n: 7 + mais } : {}, opt = ev ? ({ desvantagem: { n: 5 }, curto: { n: 3 }, davi: { n: 1, so: 'lendaria' } }[ev.id] || {}) : opt0;
    const autoMao = () => { const o = (S.owned || []).filter(c => !opt.so || (U.CARDS[c] || {}).raridade === opt.so); return (o.length ? o : (S.owned || [])).slice(0, opt.n || 7); };
    const emprestadas = () => {   // Baralho emprestado: as 7 cartas mais fortes do tema (não são suas e não cansam)
      const tm = (bat.tema || '').toLowerCase(), noTema = c => { const sr = U.SERIES[c.serie]; return sr && sr.nome.toLowerCase() === tm; };
      const fortes = U.D.CARTAS.filter(c => !c.uniao && !EXC.has(c.id)).sort((a, b) => FORCA(b.id) - FORCA(a.id));
      return fortes.filter(noTema).concat(fortes.filter(c => !noTema(c))).slice(0, 7).map(c => c.id);
    };
    (auto ? (b, f) => f(ev && ev.id === 'emprestado' ? emprestadas() : autoMao()) : ev && ev.id === 'emprestado' ? (b, f) => f(emprestadas()) : (b, f) => escolher7(b, f, opt))(bat, mao0 => {
      const alug0 = consumirAlugadas(mao0); let mao = mao0.slice(); const usadas = new Set(mao), inims = bat.i.map(x => x.c.slice()), conf = new Set(mao);
      inims.forEach(l => l.forEach(c => conf.add(c)));
      const mudou = new Set(mao);   // cartas do inimigo que o jogador já tem em mãos são trocadas por outras da mesma raridade
      inims.forEach(l => l.forEach((c, k) => { if (mudou.has(c) || usadas.has(c)) {
        const raridade = U.CARDS[c].raridade, pool = U.D.CARTAS.filter(x => x.raridade === raridade && !x.uniao && !EXC.has(x.id) && !conf.has(x.id));
        const novo = pool.length ? pool[Math.floor(Math.random() * pool.length)].id : c; l[k] = novo; conf.add(novo); } else mudou.add(c); }));
      const livres = (f, k) => { const pool = embaralha(U.D.CARTAS.filter(x => !x.uniao && !EXC.has(x.id) && !conf.has(x.id) && f(x))).slice(0, k); pool.forEach(x => conf.add(x.id)); return pool.map(x => x.id); };
      const reg = ev ? Object.assign({}, ev) : gd && gd.regra ? { id: gd.regra } : null; let semMontar = false;
      if (ev) {   // regras que mexem nas cartas (as de motor ficam em engine.js)
        if (ev.id === 'desvantagem') inims.forEach(l => l.push(...livres(x => x.raridade === U.CARDS[l[0]].raridade || x.raridade === 'comum', 2)));
        else if (ev.id === 'horda') inims.forEach((l, k) => { const c = livres(x => x.raridade === 'comum', 10); if (c.length) inims[k] = c; });
        else if (ev.id === 'curto') inims.forEach((l, k) => { inims[k] = l.slice().sort((a, b) => FORCA(b) - FORCA(a)).slice(0, 3); });
        else if (ev.id === 'troca') { const mx = l => l.reduce((b, c) => FORCA(c) > FORCA(b) ? c : b, l[0]); const l0 = inims[0], a = mx(mao), b = mx(l0); mao[mao.indexOf(a)] = b; l0[l0.indexOf(b)] = a; }
        else if (ev.id === 'espelho') inims.forEach((l, k) => { inims[k] = embaralha(mao).map(c => c + '*' + (k + 1)); });
        else if (ev.id === 'aleatoria') { semMontar = true; mao = embaralha(mao); inims.forEach((l, k) => { inims[k] = embaralha(l); }); }
        else if (ev.id === 'reforcos') reg.pool = livres(x => x.raridade === 'comum', 8);
      }
      const bots = bat.i.map(x => ({ name: x.n, bot: true, diff: ev && ev.id === 'clarividente' ? 'dificil' : nivelBot(n) }));
      const players = [{ name: S.nome || 'Você', bot: !!auto, diff: 'dificil' }].concat(bots);
      const musica = n.tipo === 'boss' ? 'boss' : n.tipo === 'miniboss' ? 'arauto' : n.tipo === 'guardiao' ? 'guardiao' : 'batalha';
      try { SND.histStop(true); } catch (e) { }
      const besta = n.tipo === 'boss' ? bonusBoss() : 0, bonusPids = bat.i.map((_, k) => k + 1);
      const uni = n.tipo === 'boss' ? mao.filter(c => UNIAO.includes(c)) : [], uniTodas = uni.length === UNIAO.length;
      const hist = { musica, id, fundo: ({ normal: 'normal', miniboss: 'arauto', guardiao: 'guardiao', boss: 'boss' })[n.tipo] || null, aposta: ev && ev.id === 'aposta' ? { saldo: () => S.pend | 0, paga: () => { S.pend = Math.max(0, (S.pend | 0) - 1); save(); }, resolve: r => { S.pend = (S.pend | 0) + (r === 'win' ? 3 : r === 'tie' ? 1 : 0); save(); } } : null, evento: gd ? { nome: gd.nome, regra: gd.txt } : ev ? textoEvento(ev) : besta ? { nome: 'Poder da Besta', regra: 'As cartas da Besta ganham +' + besta + ' em todos os atributos (' + guardVivos() + ' guardiões vivos).' } : null, aoFim: res => {
        SND.histLock = null; const ganhou = res.venceu && !cleared(id); try { if (ganhou) { SND.histStop(true); SND.histPlay('vitoria'); setTimeout(() => quandoLivre(() => { try { SND.histPlay('mapa'); } catch (e) { } }), 6000); } else SND.histStop(); } catch (e) { }
        voltarMapa = true; U.show('uniao');
        S.vistos = S.vistos || {}; S.vistos[id] = 1;
        S.seq = res.venceu ? (S.seq | 0) + 1 : 0; S.seqMax = Math.max(S.seqMax | 0, S.seq); if (res.venceu && !(res.espUsos | 0)) S.semHab = (S.semHab | 0) + 1; save();
        if (res.venceu && !cleared(id)) {
          if (S.mgLock && Object.keys(S.mgLock).length) { S.mgLock = {}; setTimeout(() => toast('Minigames desbloqueados'), 1800); }   // vencer uma batalha destrava os minigames em que você falhou
          S.pend = (S.pend | 0) + premioDe(n); S.ganho = (S.ganho | 0) + premioDe(n); S.capt = (S.capt | 0) + res.capturadas.length; const cn = aplicaCansaco(ev && ev.id === 'emprestado' ? [] : mao0.filter(c => !alug0.has(c))); const primeira = cn && fadigaOn() && !S.tutCansaco; if (primeira) S.tutCansaco = 1; save();
          if (primeira) quandoLivre(() => { const nar = mao0[Math.floor(Math.random() * mao0.length)]; npcFala(nar, ['Vencemos, {nome}, mas estamos cansadas. As mais raras cansam mais.', 'Cada vitória sem nós descansa 1 ponto. Ou pague pêndulos ao escolher o time.']); });
          else if (cn && fadigaOn()) setTimeout(() => toast(cn + ' cartas ficaram cansadas'), 1200);
          setTimeout(() => { toggleWin(id); if (NPC) NPC.vitoria(id); const bp = premioBau(id); if (bp) setTimeout(() => abrirBau(bp, () => { if (NPC) NPC.fragBau(id); }), res.capturadas.length ? 2600 : 700); if (res.capturadas.length) { setTimeout(() => abrirBau({ cartas: res.capturadas, semDica: true }), 700); dica('captura'); } if (NPC) setTimeout(() => NPC.check(), 1500); }, 450);
        } else { try { SND.histPlay('mapa'); } catch (e) { } if (!res.venceu) dica('derrota'); }
      } };
      const lanca = () => U.startGame({ players, perPlayer: 7, difficulty: 'normal', specialsFrom: 2, escolheSempre: NPC && NPC.tem('atr') && n.tipo !== 'boss' && !gd ? 0 : null, sorte: NPC && NPC.tem('sorte') && n.tipo !== 'boss' && !gd ? { pid: 0, p: NPC.val.sorteP, v: NPC.val.sorteV } : null, events: !!(gd && gd.evTodas), evTodas: !!(gd && gd.evTodas), simbolos: gd && gd.simbolos ? { val: 5 } : null, bhRefill: gd && gd.evTodas ? [1] : null, teams: gd && gd.regra === 'g_duo' ? [[0], [1, 2]] : null, teamPool: gd && gd.regra === 'g_duo' ? false : undefined, maxCombats: 100, maos: [mao].concat(inims), regra: reg, semMontar, bonusPids: besta ? bonusPids : null, bonusVal: besta, bonusCards: uniTodas ? { pid: 0, cards: uni, val: 5 } : null, historia: hist });
      if (uni.length && !auto) entradaUniao(uni, uniTodas, lanca); else lanca();
    });
  }
  // ---- Boss final: 3 fases seguidas contra a Besta (calibrado por simulação com CPUs). Você recomeça cada fase com as mesmas 30 cartas (8 da União + 22); a Besta recomeça com um baralho novo.
  const BOSS_N = [16, 22, 28], BOSS_B = [0, 6, 12];   // cartas da Besta por fase e bônus extra por fase (além de +30 por guardião vivo)
  const BOSS_FASES = [['Cerco', 'A Besta usa Movimentos a cada duas rodadas. Os Chamados da União (cartas preparadas) respondem.'], ['Agilidade', 'Antes de cada disputa há um desafio relâmpago: acertar dá +10 nas suas cartas, errar tira 10.'], ['Buraco negro', 'O buraco negro puxa cartas do fundo de cada baralho a cada rodada. Salve as da União nos desafios.']];
  function duelarBoss(id, auto) {
    const n = BY[id], opt = { n: 30, livre: true, prefer: UNIAO.filter(c => (S.owned || []).includes(c)) };
    const autoMao = () => { const o = S.owned || []; return UNIAO.filter(c => o.includes(c)).concat(o.filter(c => !UNIAO.includes(c)).sort((a, b) => FORCA(b) - FORCA(a))).slice(0, 30); };
    (auto ? (b, f) => f(autoMao()) : (b, f) => escolher7(b, f, opt))(null, mao0 => {
      consumirAlugadas(mao0); try { SND.histStop(true); } catch (e) { }
      const vivos = guardVivos(), pids = [1];
      const lanca = F => {
        const mao = mao0.slice(), usadas = new Set(mao), pool = embaralha(U.D.CARTAS.filter(c => !c.uniao && !EXC.has(c.id) && !usadas.has(c.id)).sort((a, b) => FORCA(b.id) - FORCA(a.id)).slice(0, 40)).slice(0, BOSS_N[F - 1] - 1);
        const besta = ['S11'].concat(pool.map(c => c.id)), bonus = 30 * vivos + BOSS_B[F - 1];
        const hist = { musica: 'boss', id, fundo: 'boss', evento: { nome: 'Fase ' + F + ' · ' + BOSS_FASES[F - 1][0], regra: BOSS_FASES[F - 1][1] + (bonus ? ' As cartas da Besta ganham +' + bonus + ' em todos os atributos' + (vivos ? ' (' + vivos + ' guardiões vivos).' : '.') : '') }, notaVit: F < 3 ? 'Fase ' + F + ' vencida. A próxima fase começa com um novo baralho da Besta e as suas 30 cartas de volta.' : null,
          aoFim: res => {
            if (res.venceu && F < 3) { setTimeout(() => lanca(F + 1), 200); return; }
            SND.histLock = null; try { SND.histStop(); } catch (e) { }
            voltarMapa = true; U.show('uniao');
            if (res.venceu && !cleared(id)) { setTimeout(() => toggleWin(id), 450); } else { try { SND.histPlay('mapa'); } catch (e) { } if (!res.venceu) dica('derrota'); }
          } };
        U.startGame({ players: [{ name: S.nome || 'Você', bot: !!auto, diff: 'dificil' }, { name: 'A Besta', bot: true, diff: 'dificil' }], perPlayer: 7, difficulty: 'normal', specialsFrom: 2, events: false, maxCombats: 400, maos: [mao, besta], bonusPids: pids, bonusVal: bonus, boss: { fase: F, bestaPid: 1 }, historia: hist });
      };
      if (!auto && UNIAO.some(c => mao0.includes(c))) entradaUniao(mao0.filter(c => UNIAO.includes(c)), mao0.filter(c => UNIAO.includes(c)).length === UNIAO.length, () => lanca(1)); else lanca(1);
    });
  }
  function quandoLivre(fn, n, calmo) { n = n || 0; if (n > 60) return; if ($('.bau-ov, .rv-ov, .npc, .cin, .modal')) { setTimeout(() => quandoLivre(fn, n + 1, false), 700); return; } if (!calmo) { setTimeout(() => quandoLivre(fn, n + 1, true), 1200); return; } fn(); }   // ordem pós-batalha: baús e animações primeiro, uma pausa, e só então os diálogos
  // ---- NPC: um personagem das primeiras cartas do jogador fala com ele (usado também para vendedores, desafios e cobranças)
  function npcFala(cid, linhas, done) {
    const reab = curId, mods = $$('.modal').filter(m => m.style.display !== 'none'); mods.forEach(m => { m.style.display = 'none'; });   // o diálogo tem prioridade: esconde menus e os devolve no fim
    closeSheet(); const obj = cid && typeof cid === 'object', nomeN = obj ? cid.nome : null; if (obj) cid = cid.card; const c = cid ? U.CARDS[cid] : null; let i = 0, tm = null, pronto = false;
    const corNpc = c && U.SERIES[c.serie] ? U.SERIES[c.serie].cor : '#b394ff';
    const ov = el(`<div class="npc" role="dialog" aria-modal="true" aria-label="Diálogo com ${esc(nomeN || (c ? c.nome : 'Viajante'))}"><div class="npc-box" style="--npc-c:${corNpc}"><div class="npc-p"></div><div class="npc-b"><div class="npc-head"><div><small class="npc-channel">Canal dimensional</small><b>${esc(nomeN || (c ? c.nome : 'Viajante'))}</b></div><small class="npc-step"></small></div><p aria-live="polite"></p><div class="npc-foot"><span>Toque para continuar</span><i class="cin-next on">▾</i></div></div></div></div>`);
    if (c) $('.npc-p', ov).append(U.cardEl(cid, { up: true, noanim: true, cw: 84 })); else $('.npc-p', ov).append(el('<div class="npc-av2">' + esc((nomeN || '?')[0]) + '</div>'));
    document.body.appendChild(ov); const P_ = $('p', ov), red = document.body.classList.contains('reduce');
    const fala = () => { const t = linhas[i].replace(/\{nome\}/g, (S && S.nome) || 'viajante'); $('.npc-step', ov).textContent = (i + 1) + ' / ' + linhas.length; pronto = false; P_.textContent = ''; clearInterval(tm); let k = 0; const fim = () => { clearInterval(tm); P_.textContent = t; pronto = true; };
      if (red) return fim(); tm = setInterval(() => { k += 2; P_.textContent = t.slice(0, k); if (k >= t.length) fim(); }, 22); };
    ov.onclick = () => { SND.play('click'); if (!pronto) { clearInterval(tm); P_.textContent = linhas[i].replace(/\{nome\}/g, (S && S.nome) || 'viajante'); pronto = true; return; } i++; if (i >= linhas.length) { ov.remove(); mods.forEach(m => { m.style.display = ''; }); done && done(); if (reab) setTimeout(() => { if (view === 'map' && !andando && sheet && sheet.hidden && !$('.npc, .bau-ov, .cin')) openNode(reab); }, 150); } else fala(); };
    fala();
  }
  function tutorial() {
    if (!S || S.tutorial || !S.npc) return; S.tutorial = 1; save();
    npcFala(S.npc, ['Primeira vitória, {nome}! Cada vitória ilumina os caminhos à frente. Toque numa bolinha ao lado do seu boneco para caminhar.',
      'Pêndulos compram e descansam cartas nas lojas. Liberte os oito arautos e derrote os guardiões para enfraquecer a Besta.']);
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
    const ov = el(`<div class="uni-ov${todas ? ' gold' : ''}"><div class="uni-t">${U.uniaoLogo('uniao-logo-announce')}<span>${todas ? 'completa!' : 'entra no duelo'}</span></div><div class="uni-r"></div><div class="uni-s">${todas ? 'Os oito Chamados estão prontos: prepare as cartas da União para responder à Besta' : cartas.length + ' / ' + UNIAO.length + ' da União. Cada carta da União vira um Chamado quando preparada.'}</div></div>`);
    const r = $('.uni-r', ov); cartas.forEach((c, i) => { const w = el('<div class="uni-c" style="--i:' + i + '"></div>'); w.append(U.cardEl(c, { up: true, noanim: true, cw: todas ? 78 : 92 })); r.append(w); });
    document.body.appendChild(ov); SND.play(todas ? 'legend' : 'capture'); let fim = false;
    const sai = () => { if (fim) return; fim = true; ov.classList.add('out'); setTimeout(() => { ov.remove(); depois(); }, 350); };
    ov.onclick = sai; setTimeout(sai, red ? 1200 : todas ? 4200 : 2600);
  }
  function finalCena() {
    if (!window.DSCinema || !window.DS_CINEMATICA_FINAL) return;
    const vars = { nome: (S && S.nome) || 'Viajante' }, volta = () => { try { SND.histPlay('mapa'); } catch (e) { } };
    window.DSCinema.play(() => { if (nBroches() >= 7 && window.DS_CINEMATICA_SECRETA) window.DSCinema.play(volta, window.DS_CINEMATICA_SECRETA, vars); else volta(); }, window.DS_CINEMATICA_FINAL, vars);
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
    evento: ['Evento: regra especial só nesta batalha. Reveja no botão ⚡ durante o duelo.'],
    elite: ['Elite: mais forte e paga mais.'],
    miniboss: ['Arauto: vencer liberta uma carta da União e abre o minigame do setor.'],
    guardiao: ['Guardião: cada um vencido tira 30 de cada atributo da Besta.'],
    boss: ['A Besta ganha +30 por guardião vivo. Com a União inteira, algo especial acontece.'],
    loja: ['Loja: compre e descanse cartas com pêndulos.'],
    derrota: ['Derrota não custa nada. Reorganize e tente de novo.'],
    captura: ['Carta capturada agora é sua.'],
    bau: ['Baús guardam pêndulos ou cartas, em becos sem saída.'],
    minigame: ['Passe com ao menos "Bom" para abrir o caminho. Falhou? Vença uma batalha ou pague para tentar de novo.'],
    broche: ['Um broche. Vale juntar todos.'],
  };

  function dica(chave, quem) {
    if (!S || (S.dicas && S.dicas[chave]) || !DICAS[chave]) return; S.dicas = S.dicas || {}; S.dicas[chave] = 1; save();
    quandoLivre(() => npcFala(quem || S.npc || (S.owned || [])[0], DICAS[chave]));
  }
  function chegada(id) {   // o boneco está neste ponto: diálogo da primeira vez
    const n = BY[id]; if (!n || !S.tutorial) return;   // antes do tutorial, a primeira vitória tem a vez
    if (n.tipo === 'evento') dica('evento'); else if (n.tipo === 'elite') dica('elite'); else if (n.tipo === 'miniboss') dica('miniboss'); else if (n.tipo === 'guardiao') dica('guardiao'); else if (n.tipo === 'boss') dica('boss'); else if (n.tipo === 'loja') dica('loja'); else if (n.tipo === 'minigame') dica('minigame');
  }
  function bossAbre() {
    closeSheet(); const b = BY[M.boss]; const red = document.body.classList.contains('reduce');
    centerOn(b.x, b.y, .75, !red);
    setTimeout(() => { SND.play('banner'); const bg = $('.n.t-boss', root); if (bg) { bg.classList.add('burst'); setTimeout(() => bg.classList.remove('burst'), 2600); } toast('Os guardiões caíram e a União está completa. O núcleo da galáxia se abriu.'); }, red ? 50 : 800);
  }
  function avisoMissao(titulo, txt, ok) {   // faixa na tela + som quando uma missão nova começa
    const r = root; if (!r) return; const x = el(`<div class="hs-aviso${ok ? ' ok' : ''}" role="status"><i>${ok ? '✓' : '!'}</i><div><b>${esc(titulo)}</b><span>${esc(txt)}</span></div></div>`); r.appendChild(x); try { SND.play('banner'); } catch (e) { }
    requestAnimationFrame(() => x.classList.add('on')); setTimeout(() => { x.classList.remove('on'); setTimeout(() => x.remove(), 500); }, 4200);
  }
  function toast(t) { const x = $('#hsToast', root); if (!x) return; x.textContent = t; x.hidden = false; clearTimeout(x._t); x._t = setTimeout(() => { x.hidden = true; }, 3200); }

  // ---- baú: tremida, tampa abre, luz, e a recompensa sobe (cartas novas ou pêndulos). premio = {pend:n} | {cartas:[ids]}
  function bauSvg() {
    return `<svg class="bau-svg" viewBox="-60 -60 120 110" aria-hidden="true"><defs><linearGradient id="bGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe29a"/><stop offset="1" stop-color="#b9791a"/></linearGradient><linearGradient id="bWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a5a34"/><stop offset="1" stop-color="#4a2c16"/></linearGradient></defs>
      <ellipse cx="0" cy="42" rx="48" ry="7" fill="#0008"/>
      <g class="bau-base"><rect x="-40" y="-6" width="80" height="46" rx="6" fill="url(#bWood)" stroke="#2a1608" stroke-width="2"/><rect x="-40" y="10" width="80" height="6" fill="url(#bGold)"/><rect x="-6" y="6" width="12" height="16" rx="2" fill="url(#bGold)" stroke="#6b430c"/></g>
      <g class="bau-lid"><path d="M-40 -6 V-22 Q-40 -42 0 -42 Q40 -42 40 -22 V-6 Z" fill="url(#bWood)" stroke="#2a1608" stroke-width="2"/><path d="M-40 -16 H40" stroke="url(#bGold)" stroke-width="5"/></g></svg>`;
  }
  // ---- animação de carta desbloqueada: o verso treme, vira e revela a carta com brilho da raridade
  function revelarCarta(ids, done) {
    ids = (ids || []).filter(id => U.CARDS[id]); if (!ids.length) { done && done(); return; }
    const red = document.body.classList.contains('reduce'), RAR = { comum: 'Comum', rara: 'Rara', epica: 'Épica', lendaria: 'Lendária' }; let i = 0;
    const passo = () => {
      if (i >= ids.length) { done && done(); return; }
      const id = ids[i++], c = U.CARDS[id], r = c.raridade;
      const ov = el(`<div class="rv-ov r-${r}"><div class="rv-rays"></div><div class="rv-glow"></div><div class="rv-card"><div class="rv-face"></div><div class="rv-back"><i></i></div></div><div class="rv-info"><small>${RAR[r] || ''}</small><b>${esc(c.nome)}</b><span>Carta desbloqueada</span></div><button class="btn primary rv-ok" hidden>Continuar</button></div>`);
      $('.rv-face', ov).append(U.cardEl(id, { up: true, noanim: true, cw: 190 })); document.body.appendChild(ov); SND.play('bauShake');
      const T = (f, ms) => setTimeout(f, red ? 40 : ms);
      T(() => { ov.classList.add('flip'); SND.play(r === 'lendaria' ? 'legend' : 'bauCard'); }, 1000);
      T(() => { ov.classList.add('done'); $('.rv-ok', ov).hidden = false; }, 1900);
      $('.rv-ok', ov).onclick = () => { SND.play('click'); ov.classList.add('out'); setTimeout(() => { ov.remove(); passo(); }, 280); };
    };
    passo();
  }
  // ---- aluguel de cartas (melhoria "Aluguel de cartas"): um mercador aparece no mapa; carta alugada vale uma batalha, não é lendária nem repetida
  const PRECO_ALUG = { comum: 8, rara: 18, epica: 40 };
  const alugadas = () => (S.alugadas = S.alugadas || []);
  function consumirAlugadas(mao) { const us = new Set(); const a = alugadas(); mao.forEach(c => { const k = a.indexOf(c); if (k >= 0) { a.splice(k, 1); us.add(c); } }); if (us.size) save(); return us; }
  function apresentarAluguel() {
    if (S.alug) return; const pool = U.D.CARTAS.filter(x => !x.uniao && !EXC.has(x.id) && x.raridade !== 'lendaria'), c = pool[Math.floor(Math.random() * pool.length)];
    S.alug = { nome: c.nome, card: c.id, estoque: null, marca: -1 }; save(); paintAll();
    npcFala({ nome: c.nome, card: c.id }, ['Psiu, {nome}! Sou ' + c.nome + ', e acabo de chegar a este mapa.', 'Tenho cartas de sobra e alugo por pêndulos. Cada uma vale uma batalha só e leva o selo ALUGADA.', 'Não alugo lendárias, nem cartas que você já tem. Me procure no botão ⇄ ao lado do mapa.']);
  }
  function estoqueAlug() {
    const a = S.alug, marca = Object.keys(S.cleared || {}).length, em = new Set((S.owned || []).concat(alugadas()));
    if (!a.estoque || a.marca !== marca) { const pool = embaralha(U.D.CARTAS.filter(x => !x.uniao && !EXC.has(x.id) && x.raridade !== 'lendaria' && !em.has(x.id)));
      const por = r => pool.filter(x => x.raridade === r); a.estoque = por('comum').slice(0, 4).concat(por('rara').slice(0, 3), por('epica').slice(0, 1)).map(x => x.id); a.marca = marca; save(); }
    return a.estoque.filter(id => !em.has(id));
  }
  function aluguel() {
    if (!S.alug) return; closeSheet(); let msg = '';
    const box = el(`<div class="hs-esc hs-alug"><div class="al-h"><div class="al-p"></div><div><small>MERCADOR</small><h3></h3></div></div><p class="hint"><span class="al-m"></span> Pêndulos: <b class="al-b"></b></p><div class="hs-escg"></div><div class="row"><button class="btn primary" data-a="x">Fechar</button></div></div>`);
    $('h3', box).textContent = S.alug.nome; $('.al-p', box).append(U.cardEl(S.alug.card, { up: true, noanim: true, cw: 46 }));
    const g = $('.hs-escg', box);
    const render = () => { g.innerHTML = ''; $('.al-b', box).textContent = S.pend | 0; $('.al-m', box).textContent = msg || 'Aluguel vale para uma batalha.';
      alugadas().forEach(id => { const w = el('<div class="hs-escc al-own"></div>'); w.append(U.cardEl(id, { up: true, noanim: true, cw: 72 })); w.append(el('<div class="hs-alugsel">ALUGADA</div>')); g.append(w); });
      const est = estoqueAlug(); est.forEach(id => { const p = PRECO_ALUG[U.CARDS[id].raridade] || 20, w = el('<div class="hs-escc al-buy" data-id="' + id + '"></div>'); w.append(U.cardEl(id, { up: true, noanim: true, cw: 72 })); w.append(el('<div class="al-pr">' + coinSvg(12) + '<b>' + p + '</b></div>')); if (p > (S.pend | 0)) w.classList.add('no'); g.append(w); });
      if (!est.length && !alugadas().length) g.append(el('<p class="loja-vz">Sem cartas para alugar agora. Volte depois de vencer mais um ponto.</p>')); };
    const m = U.modal(box, { cls: 'hs-modal' });
    box.onclick = e => { const b = e.target.closest('[data-a]'), c = e.target.closest('.al-buy');
      if (b && b.dataset.a === 'x') { SND.play('click'); m.close(); paintAll(); return; }
      if (c) { const id = c.dataset.id, p = PRECO_ALUG[U.CARDS[id].raridade] || 20; if ((S.pend | 0) < p) { SND.play('tick'); msg = 'Faltam pêndulos: este aluguel custa ' + p + '.'; render(); return; }
        S.pend -= p; S.gasto = (S.gasto | 0) + p; alugadas().push(id); S.alug.estoque = S.alug.estoque.filter(x => x !== id); save(); SND.play('capture'); msg = U.CARDS[id].nome + ' alugada (−' + p + ').'; paintAll(); render(); } };
    render();
  }
  function abrirBau(premio, done) {
    closeSheet(); const red = document.body.classList.contains('reduce'), pend = premio.pend | 0, pick = !!premio.opcoes, cartas = premio.opcoes || premio.cartas || []; let escolhida = null;
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
        prize.classList.add('cards'); if (pick) prize.classList.add('pick'); cartas.forEach((id, i) => { const w = el('<div class="bau-card" data-id="' + id + '" style="--d:' + (i * 280) + 'ms"></div>'); w.append(U.cardEl(id, { up: true, noanim: true, cw: cartas.length > 2 ? 92 : 118 })); if (!(S.owned || []).includes(id)) w.append(el('<span class="bau-new">NOVA</span>')); prize.append(w); setTimeout(() => { if (!fim) SND.play('bauCard'); }, red ? 0 : i * 280); });
        if (cartas.some(id => U.CARDS[id] && U.CARDS[id].raridade === 'lendaria')) T(() => SND.play('legend'), 400);
      }
      ok.hidden = false; if (pick) { ok.disabled = true; ok.textContent = 'Escolha uma'; prize.onclick = e => { const w = e.target.closest('.bau-card'); if (!w) return; escolhida = w.dataset.id; $$('.bau-card', prize).forEach(x => { x.classList.toggle('sel', x === w); x.classList.toggle('no', x !== w); }); ok.disabled = false; ok.textContent = 'Pegar'; SND.play('tick'); }; }
    }, 1700);
    const fechar = () => { if (fim) return; fim = true; if (!premio.semDica) setTimeout(() => dica('bau'), 600); ov.classList.add('out'); setTimeout(() => ov.remove(), 400); if (S) { S.pend = (S.pend | 0) + pend; S.ganho = (S.ganho | 0) + pend; (pick ? [escolhida] : cartas).forEach(id => { if (id && !S.owned.includes(id)) S.owned.push(id); }); save(); if (view === 'map' && svg && svg.isConnected) paintAll(); } done && done(); if (NPC) setTimeout(() => NPC.check(), 600); };
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
  const PRECO = { comum: 25, rara: 60, epica: 130, lendaria: 300 };   // preços das cartas nas lojas em pêndulos (autor aprovou 29/10)
  // Baús (autor aprovou 29/10): ficam em becos sem saída e abrem ao vencer o ponto pela primeira vez. {pend:n} ou {carta:raridade}
  const BAUS = { B003: { pend: 25 }, B006: { carta: 'comum' }, B010: { pend: 15 }, B022: { pend: 20 }, B028: { pend: 20 }, B034: { carta: 'comum' }, B049: { pend: 25 },
    B042: { pend: 40 }, B044: { carta: 'rara', opcoes: 2 }, B070: { pend: 50 }, B085: { pend: 75 }, B087: { carta: 'epica', opcoes: 2 }, B096: { pend: 140 }, B099: { fixa: 'J30' } };
  function premioBau(id) {
    const b = BAUS[id]; if (!b || !S || (S.baus && S.baus[id])) return null;
    let p = b; if (b.fixa) p = (S.owned || []).includes(b.fixa) ? { pend: 150 } : { cartas: [b.fixa] }; else if (b.carta) { const em = new Set(S.owned || []); const pool = U.D.CARTAS.filter(x => x.raridade === b.carta && !x.uniao && !EXC.has(x.id) && !em.has(x.id));
      const alt = ['lendaria', 'epica', 'rara', 'comum'].slice(['lendaria', 'epica', 'rara', 'comum'].indexOf(b.carta)); let q = pool;
      for (const r of alt) { if (q.length) break; q = U.D.CARTAS.filter(x => x.raridade === r && !x.uniao && !EXC.has(x.id) && !em.has(x.id)); }
      p = q.length >= 2 && b.opcoes ? { opcoes: embaralha(q).slice(0, 2).map(x => x.id) } : q.length ? { cartas: [q[Math.floor(Math.random() * q.length)].id] } : { pend: 60 }; }   // alguns baús oferecem 2 cartas: leva só a escolhida
    S.baus = S.baus || {}; S.baus[id] = 1; save(); return p;
  }
  function descansar(id) {   // paga e descansa uma carta; devolve o custo ou 0 se faltar
    const custo = fad(id) * CUSTO_DESC; if (!custo || (S.pend | 0) < custo) return 0;
    S.pend -= custo; S.gasto = (S.gasto | 0) + custo; delete S.fadiga[id]; save(); return custo;
  }
  function minhasCartas(emLoja) {
    closeSheet(); const box = el('<div class="hs-esc hs-mc"><h3>Minhas cartas</h3><p class="hint hs-info"></p><div class="hs-escg"></div><div class="row"><button class="btn" data-a="todas">Descansar todas</button><button class="btn primary" data-a="x">Fechar</button></div></div>');
    const g = $('.hs-escg', box), info = $('.hs-info', box), bt = $('[data-a=todas]', box); let msg = ''; const F = filtros(() => render()); g.before(F.bar);
    const lista = () => (S.owned || []).slice().sort((a, b) => (ORD[(U.CARDS[a] || {}).raridade] - ORD[(U.CARDS[b] || {}).raridade]) || FORCA(b) - FORCA(a));
    const render = () => {
      const L = lista(), cans = L.filter(id => fad(id)), total = cans.reduce((t, id) => t + fad(id) * CUSTO_DESC, 0);
      info.textContent = msg || (fadigaOn() ? (cans.length ? cans.length + ' cansada(s). Toque para descansar (' + CUSTO_DESC + ' por ponto).' : 'Todas descansadas.') : '') + ' Pêndulos: ' + (S.pend | 0);
      g.innerHTML = ''; L.filter(F.ok).forEach(id => { const w = el('<div class="hs-escc on' + (fad(id) ? ' tired' : '') + '" data-id="' + id + '"></div>'); w.append(U.cardEl(id, { up: true, noanim: true, cw: 72 })); if (fad(id)) w.append(el('<div class="hs-fadb">' + pontosFad(id) + '</div>')); g.append(w); });
      bt.hidden = !cans.length; bt.textContent = 'Descansar todas (' + total + ')'; bt.disabled = total > (S.pend | 0); paintAll();
    };
    const m = U.modal(box, { cls: 'hs-modal' }); render();
    box.onclick = e => {
      const c = e.target.closest('.hs-escc'), b = e.target.closest('[data-a]');
      if (c && fad(c.dataset.id)) { const id = c.dataset.id, custo = descansar(id); if (custo) { SND.play('capture'); msg = U.CARDS[id].nome + ' descansou (−' + custo + ' pêndulos).'; } else { SND.play('tick'); msg = 'Faltam pêndulos: descansar custa ' + fad(id) * CUSTO_DESC + '.'; } render(); return; }
      if (!b) return; SND.play('click');
      if (b.dataset.a === 'x') m.close();
      else if (b.dataset.a === 'todas') { let t = 0; Object.keys(S.fadiga || {}).forEach(id => { const k = fad(id) * CUSTO_DESC; if ((S.pend | 0) >= k) { S.pend -= k; S.gasto = (S.gasto | 0) + k; delete S.fadiga[id]; t += k; } }); save(); SND.play('capture'); msg = t ? 'Descansadas (−' + t + ' pêndulos).' : 'Faltam pêndulos.'; render(); }
    };
  }
  // estoque fixo por loja (sorteado uma vez e guardado): 6 cartas que o jogador ainda não tem; raridade sobe com a região
  function estoque(id) {
    S.lojas = S.lojas || {}; if (S.lojas[id]) return S.lojas[id];
    const tier = BY[id].tier || 1, plano = [['comum', 'comum', 'comum', 'rara', 'rara', 'epica'], ['comum', 'comum', 'rara', 'rara', 'epica', 'epica'], ['comum', 'rara', 'rara', 'epica', 'epica', 'epica'], ['rara', 'rara', 'epica', 'epica', 'epica', 'epica']][Math.min(3, tier - 1)];
    const em = new Set(S.owned || []); S.lojas[id] = { itens: [], comprados: [] };
    plano.forEach(r => { const pool = embaralha(U.D.CARTAS.filter(x => x.raridade === r && !x.uniao && !EXC.has(x.id) && !em.has(x.id))); const x = pool[0]; if (x) { em.add(x.id); S.lojas[id].itens.push(x.id); } });
    save(); return S.lojas[id];
  }
  const rnd0 = a => a[Math.floor(Math.random() * a.length)];
  function loja(id) {
    closeSheet(); const est = estoque(id), RAR = { comum: 'Comum', rara: 'Rara', epica: 'Épica', lendaria: 'Lendária' }; let aba = 'comprar', msg = '', saldo = S.pend | 0;
    const ov = el(`<div class="hs-loja loja-ov"><div class="loja-top"><button class="ibtn" data-a="x" aria-label="Sair">←</button><div class="loja-tt"><small>LOJA</small><b>Bazar dos Viajantes</b></div><div class="loja-bal">${coinSvg(26)}<b id="lojaBal">${saldo}</b></div></div><div class="loja-tabs"><button class="on" data-a="t:comprar">Comprar</button><button data-a="t:descansar">Descansar</button></div><div class="loja-vend" hidden><div class="lv-p"></div><div class="lv-t"><b></b><span></span></div></div><p class="loja-msg"></p><div class="loja-g"></div></div>`);
    document.body.appendChild(ov); const g = $('.loja-g', ov), bal = $('#lojaBal', ov), ms = $('.loja-msg', ov);
    const V = NPC ? NPC.vend(id) : null, vd = $('.loja-vend', ov);
    const diz = t => { if (!V) return; $('.lv-t span', ov).textContent = t; vd.classList.remove('fala'); void vd.offsetWidth; vd.classList.add('fala'); };
    if (V) { vd.hidden = false; $('.lv-p', ov).append(U.cardEl(V.card, { up: true, noanim: true, cw: 46 })); $('.lv-t b', ov).textContent = V.nome; diz(V.oi); }
    const extras = () => NPC ? NPC.lojaExtras(id).map(x => x.tipo === 'reg' ? Object.assign({}, x, { p: dsc(x.p) }) : x) : [];
    const conta = alvo => { const de = saldo; saldo = alvo; const t0 = performance.now(), dur = document.body.classList.contains('reduce') ? 0 : 600; const f = t => { const k = dur ? Math.min(1, (t - t0) / dur) : 1; bal.textContent = Math.round(de + (alvo - de) * k); if (k < 1) requestAnimationFrame(f); }; bal.parentNode.classList.remove('gasta'); void bal.offsetWidth; bal.parentNode.classList.add('gasta'); requestAnimationFrame(f); };
    const flutua = (el0, txt) => { const r = el0.getBoundingClientRect(), f = el(`<div class="loja-fl">−${txt}</div>`); f.style.left = r.left + r.width / 2 + 'px'; f.style.top = r.top + 'px'; document.body.appendChild(f); setTimeout(() => f.remove(), 1100); };
    if (est.promo === undefined) { const q = est.itens.filter(c => !est.comprados.includes(c)); est.promo = q.length ? q[[...id].reduce((a, ch) => a + ch.charCodeAt(0), 0) % q.length] : null; save(); }   // 1 item por loja com −30% fixo
    const dsc = p => NPC && NPC.tem('preco') ? Math.max(1, Math.round(p * (1 - NPC.val.preco))) : p;   // melhoria "Preços menores"
    const base = c => dsc(PRECO[U.CARDS[c].raridade] || 50);
    const ajudaId = () => {   // quem está sem saldo para nada na loja ganha −20% na carta mais barata (uma vez por loja)
      if (est.ajuda) return null; const q = est.itens.filter(c => !est.comprados.includes(c) && c !== est.promo); if (!q.length) return null;
      const pr = c => c === est.promo ? Math.round(base(c) * .7) : base(c), todos = est.itens.filter(c => !est.comprados.includes(c)), min = Math.min(...todos.map(pr));
      if ((S.pend | 0) >= min) return null; return q.sort((a, b) => base(a) - base(b))[0];
    };
    const preco = c => c === est.promo && !est.comprados.includes(c) ? Math.round(base(c) * .7) : c === ajudaId() ? Math.round(base(c) * .8) : base(c);
    const tag = c => c === est.promo ? '−30%' : c === ajudaId() ? '−20%' : '';
    const render = () => {
      ms.textContent = msg; $$('.loja-tabs button', ov).forEach(b => b.classList.toggle('on', b.dataset.a === 't:' + aba)); g.innerHTML = '';
      if (aba === 'comprar') est.itens.forEach(c => { const got = est.comprados.includes(c), p = preco(c), pobre = !got && p > saldo;
        const w = el(`<div class="loja-it hs-item${got ? ' got' : ''}${pobre ? ' pobre' : ''}" data-id="${c}"></div>`); w.append(U.cardEl(c, { up: true, noanim: true, cw: 92 }));
        w.append(el(`<div class="loja-pr">${got ? '<span>Vendida</span>' : coinSvg(16) + '<b>' + p + '</b>' + (tag(c) && !got ? '<i class="loja-off">' + tag(c) + '</i>' : '')}</div>`)); w.append(el(`<small class="loja-rar r-${U.CARDS[c].raridade}">${RAR[U.CARDS[c].raridade] || ''}</small>`)); g.append(w); });
      if (aba === 'comprar') extras().forEach(x => { const pobre = !x.got && x.p > (x.tipo === 'melh' ? NPC.nFrag() : saldo), w = el(`<div class="loja-it loja-x${x.got ? ' got' : ''}${pobre ? ' pobre' : ''}" data-x="${x.k}"></div>`);
        if (x.tipo === 'melh') w.append(el(`<div class="lx-art">${NPC.cristal(true)}</div>`)); else { const a = el('<div class="lx-art reg"></div>'); a.append(U.cardEl(x.card, { up: true, noanim: true, cw: 92 })); w.append(a); }
        w.append(el(`<div class="loja-pr">${x.got ? '<span>Comprado</span>' : (x.tipo === 'melh' ? NPC.cristal(true) : coinSvg(16)) + '<b>' + x.p + '</b>'}</div>`)); w.append(el(`<small class="loja-rar r-x">${x.tipo === 'melh' ? esc(x.nome) : 'Registro'}</small>`)); if (x.txt) w.append(el(`<small class="lx-txt">${esc(x.txt)}</small>`)); g.append(w); });
      if (aba !== 'comprar') { const L = (S.owned || []).filter(c => fad(c)); if (!fadigaOn() || !L.length) g.append(el('<p class="loja-vz">Nenhuma carta cansada.</p>'));
        else L.forEach(c => { const p = dsc(fad(c) * CUSTO_DESC), w = el(`<div class="loja-it tired${p > saldo ? ' pobre' : ''}" data-id="${c}" data-rest="1"></div>`); w.append(U.cardEl(c, { up: true, noanim: true, cw: 92 })); w.append(el(`<div class="loja-pr">${coinSvg(16)}<b>${p}</b></div>`)); w.append(el(`<div class="hs-fadb">${pontosFad(c)}</div>`)); g.append(w); }); }
    };
    const sai = () => { ov.classList.add('out'); setTimeout(() => ov.remove(), 250); if (view === 'map') paintAll(); if (NPC) NPC.check(); };
    ov.onclick = e => {
      const b = e.target.closest('[data-a]'), c = e.target.closest('.loja-it');
      if (b) { SND.play('click'); if (b.dataset.a === 'x') return sai(); if (b.dataset.a.startsWith('t:')) { aba = b.dataset.a.slice(2); msg = ''; render(); } return; }
      if (!c) return; const k = c.dataset.id;
      if (c.dataset.x) { const x = extras().find(q => q.k === c.dataset.x); if (!x || x.got) return;
        if (x.tipo === 'melh') { if (x.p > NPC.nFrag()) { SND.play('tick'); c.classList.add('no'); setTimeout(() => c.classList.remove('no'), 400); msg = 'Faltam fragmentos: custa ' + x.p + '.'; ms.textContent = msg; return; }
          if (!NPC.compraExtra(x.k)) return; save(); SND.play('legend'); flutua(c, x.p); paintAll(); msg = x.nome + ': melhoria adquirida.'; if (V) diz(rnd0(V.obr)); render(); return; }
        if (x.p > saldo) { SND.play('tick'); c.classList.add('no'); setTimeout(() => c.classList.remove('no'), 400); msg = 'Faltam pêndulos: custa ' + x.p + '.'; ms.textContent = msg; return; }
        S.pend -= x.p; S.gasto = (S.gasto | 0) + x.p; NPC.compraExtra(x.k); save(); SND.play('legend'); flutua(c, x.p); conta(S.pend | 0); msg = 'Registro de ' + U.CARDS[x.card].nome; if (V) diz(rnd0(V.obr)); render(); return; }
      if (c.dataset.rest) { const p = dsc(fad(k) * CUSTO_DESC); if (p > saldo) { SND.play('tick'); c.classList.add('no'); setTimeout(() => c.classList.remove('no'), 400); msg = 'Faltam pêndulos: descansar custa ' + p + '.'; ms.textContent = msg; return; }
        S.pend -= p; S.gasto = (S.gasto | 0) + p; delete S.fadiga[k]; save(); SND.play('capture'); flutua(c, p); conta(S.pend | 0); msg = U.CARDS[k].nome + ' descansou.'; render(); return; }
      if (est.comprados.includes(k)) return; const p = preco(k), usouAjuda = k === ajudaId();
      if (p > saldo) { SND.play('tick'); c.classList.add('no'); setTimeout(() => c.classList.remove('no'), 400); msg = 'Faltam pêndulos: ' + U.CARDS[k].nome + ' custa ' + p + '.'; ms.textContent = msg; return; }
      S.pend -= p; S.gasto = (S.gasto | 0) + p; S.compras = (S.compras | 0) + 1; if (usouAjuda) est.ajuda = 1; est.comprados.push(k); if (!S.owned.includes(k)) S.owned.push(k); save(); SND.play('legend'); flutua(c, p); conta(S.pend | 0); msg = U.CARDS[k].nome + ' é sua!'; if (V) diz(rnd0(V.obr)); render();
      const nw = $('.loja-it[data-id="' + k + '"]', g); if (nw) nw.classList.add('comprou');
    };
    render();
  }
  function legenda() {
    const icones = { normal: 'normal', evento: 'evento', elite: 'elite', miniboss: 'miniboss', guardiao: 'guardiao', loja: 'loja', minigame: 'minigame', boss: 'boss' };
    const L = Object.keys(TIPOS).filter(k => k !== 'boss').map(k => `<li><img class="hs-leg-ico" src="cena/icones-mapa/${icones[k]}.png" alt=""><b>${TIPOS[k].nome}</b></li>`).join('');
    const contagem = {}; NOS.forEach(n => { contagem[n.tipo] = (contagem[n.tipo] || 0) + 1; });
    const box = el(`<div class="hs-leg"><h3>Legenda</h3><ul>${L}<li><img class="hs-leg-ico boss" src="cena/icones-mapa/boss.png" alt=""><b>Boss final</b></li></ul>
      <label class="hs-sw"><input type="checkbox" ${P.numeros !== false ? 'checked' : ''} data-a="numeros"> Exibir números das fases</label>
      <h3>Teste</h3><label class="hs-sw"><input type="checkbox" ${P.escuro !== false ? 'checked' : ''} data-a="escuro"> Esconder o não liberado</label>
      <div class="row"><button class="btn sm" data-a="intro">Rever introdução</button><button class="btn sm" data-a="fim">Ver final</button><button class="btn sm" data-a="bau">Testar baú</button></div><label class="hs-sw"><input type="checkbox" ${P.aberto ? 'checked' : ''} data-a="aberto"> Mapa aberto</label>
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
    box.addEventListener('change', e => { if (e.target.dataset.a === 'aberto') { P.aberto = e.target.checked; save(); paintAll(); closeSheet(); } else if (e.target.dataset.a === 'escuro') { P.escuro = e.target.checked; save(); paintAll(); } else if (e.target.dataset.a === 'numeros') { P.numeros = e.target.checked; if (svg) svg.classList.toggle('no-nums', !P.numeros); save(); } });
  }

  if (NPC) NPC.init({ aoMelhoria: id => { if (id === 'aluguel') quandoLivre(apresentarAluguel); }, S: () => S, save, BY, NOS, M, U, $, $$, el, esc, SND, root: () => root, npcFala, toast, centerOn, andar, andarNpc, avisoMissao, abrirCasa, refrescaCasa, casa: () => casa, casaAberta: id => curId === 'casa:' + id && !!sheet && !sheet.hidden, caminho, posId, openNode, closeSheet, paintAll, quandoLivre, nBat, GUARD, MINIS, UNIAO, LADOS, bonusBoss, available, andando: () => andando });
  window.DSHistoria = { npc: NPC, darBroche: (serie) => { if (!S) return; S.broches = S.broches || {}; S.broches[serie] = 1; save(); if (view === 'map') paintAll(); }, loja, minhasCartas, dica, golpeBoss, escolher7, aplicaCansaco, duelar, abrirBau, mount, show: hub, data: M, state: () => S, openNode };
})();
