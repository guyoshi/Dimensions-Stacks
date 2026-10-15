/* Dimensions Stacks — ajuda guiada.
   1) Dicas contextuais: cada regra nova é explicada na primeira vez que aparece (opção "Dicas durante a partida"); o que já foi visto fica registrado.
   2) Botão "?": passo a passo em telas curtas, com os mesmos símbolos do jogo. */
(function () {
  'use strict';
  const U = window.DSUI, SND = U.SND, ICON = U.ICON, ATT = U.ATT;
  const $ = U.$, $$ = U.$$, el = U.el, esc = U.esc;

  // ---------------------------------------------------------------- registro do que já foi visto
  const seen = () => U.store.get('seen', {});
  const mark = id => { const s = seen(); s[id] = 1; U.store.set('seen', s); };
  U.tipSeen = id => !!seen()[id];
  U.tipsReset = () => U.store.set('seen', {});
  const on = () => U.S.help !== false;
  const ai = (a, label) => `<span class="cico" data-a="${a}">${ICON[a]}<b>${label === undefined ? ATT[a].nome : label}</b></span>`;
  const OFF = ai('pod') + ' ' + ai('int'), DEF = ai('def') + ' ' + ai('vel');
  const back = (n, cw) => Array.from({ length: n }, () => U.cardEl('J08', { up: false, noanim: true, cw: cw || 44 }).outerHTML).join('');

  // ---------------------------------------------------------------- dicas (ícones primeiro; no máximo uma frase curta por dica)
  const tch = (ic, label) => `<span class="tch">${ic}${label ? `<b>${label}</b>` : ''}</span>`;
  const arr = '<span class="arr">➜</span>';
  const mini = (n, res) => `<i class="mini${res ? ' res' : ''}"><b>${n}</b></i>`;
  const tv = (...x) => `<div class="tv">${x.join('')}</div>`;
  const cap = t => `<p class="tl">${t}</p>`;
  const bhv = '<span class="bhv sm"></span>';
  const slot = on => `<i class="prepslot${on ? ' on' : ''}"></i>`;
  const me = '<span class="me">você</span>';
  const rch = (a, b) => `<span class="tch">${a}<b>${b}</b></span>`;
  const TIPS = {
    order: { t: 'Seu objetivo', b: () => tv(back(3, 30), arr, '<span class="big">🏆</span>') + cap('Ficar com <b>todas</b> as cartas do jogo.')
      + tv(mini(0), '<span class="plus">+</span>', mini(0, true), arr, '<b>eliminado</b>') + cap('Quem fica sem baralho e sem reserva sai da partida.')
      + `<div class="tv deckrow">${[1, 2, 3, 4, 5, 6, 7].map(i => `<div class="dk">${U.cardEl('J08', { up: false, noanim: true, cw: 26 }).outerHTML}<i>${i}</i></div>`).join('')}<div class="dk res">${back(1, 26)}<i>reserva</i></div></div>`
      + cap('<b>Arraste</b> as cartas para ordenar. A nº 1 sai primeiro.') },
    mesa: { t: 'A mesa', spot: true, b: () => `<ol class="leg2">
      <li><span class="n">1</span>${mini('7')}Baralho</li><li><span class="n">2</span>${mini('3', true)}Reserva</li>
      <li><span class="n">3</span>${slot(false)}${slot(true)}Especiais guardados</li><li><span class="n">4</span><span class="turnflag">INICIA</span>Começa a disputa</li>
      <li><span class="n">5</span>${bhv}Buraco Negro</li><li><span class="n">6</span><span class="tch"><b>R1 R2 R3</b></span>Rodadas</li></ol>` },
    attr_init: { t: 'Você inicia', b: () => `<div class="two"><div>${OFF}<em>Você <b>leva</b> as cartas dos outros.</em></div><div>${DEF}<em>Você só recupera a sua. As outras vão para o <b>Buraco Negro</b>.</em></div></div>`
      + cap('Escolha <b>qualquer</b> atributo. Os outros respondem em segredo.') },
    attr_follow: { t: 'Sua vez de responder', b: () => `<div class="two"><div><small>Par 1</small>${ai('pod')}<span class="plus">ou</span>${ai('def')}</div><div><small>Par 2</small>${ai('int')}<span class="plus">ou</span>${ai('vel')}</div></div>`
      + cap('Escolha no <b>mesmo par</b> do iniciador, em segredo.') },
    reveal: { t: 'Quem vence?', b: () => `<div class="duel"><div>${ai('int', '')}<b>82</b></div><span>›</span><div>${ai('vel', '')}<b>71</b></div></div>` + cap('Vence o <b>maior número</b>, mesmo com atributos diferentes.')
      + tv('<span class="mut2">Empate</span>', tch('Σ', 'soma dos 4'), arr, tch(ai('pod', '') + '+' + ai('int', ''), 'soma'), arr, '<b>devolve</b>') },
    capture: { t: 'Cartas capturadas', b: () => tv(OFF) + cap('O vencedor <b>leva</b> as cartas dos perdedores para o fim do seu baralho.'), hint: true },
    bh: { t: 'Buraco Negro', b: () => tv(DEF) + tv(back(3, 28), arr, bhv) + cap('Só o vencedor recupera a sua carta. As outras vão para o <b>Buraco Negro</b>.') + '<p class="tl mut">O Buraco Negro guarda as cartas descartadas. Alguns especiais podem resgatar cartas de lá.</p>', hint: true },
    calc: { t: 'Entenda o resultado', soft: true, b: () => tv('<span class="tch"><b>Ver cálculo</b></span>') + cap('Toque no botão para ver <b>por que</b> alguém ganhou.') },
    evento: { t: 'Fenômeno dimensional', b: ev => { const d = ev && window.DSUI.E.EVENTOS[ev.id]; return `${d ? `<div class="evone"><b>${esc(d.nome)}${ev.id === 'troca' && ev.pair ? ' (' + window.DSUI.ATT[ev.pair[0]].nome + ' ⇄ ' + window.DSUI.ATT[ev.pair[1]].nome + ')' : ''}</b><span>${esc(d.curto)}</span></div>` : ''}`
      + cap('Vale <b>só nesta rodada</b>. A faixa no alto avisa os próximos.'); }, hint: false },
    refill: { t: 'Reserva', b: () => tv(mini('3', true), arr, mini('3')) + cap('Baralho vazio: você compra até <b>7</b> cartas da <b>reserva</b> e reordena.'), hint: true },
    elim: { t: 'Eliminado', soft: true, b: () => tv(mini(0), '<span class="plus">+</span>', mini(0, true), arr, '<b>fora</b>') + cap('Sem baralho e sem reserva, o jogador sai da partida.') },
    round2: { t: 'Especiais liberados', b: () => tv('<button class="btn sm fake" tabindex="-1">✦ Usar como especial</button>', arr, slot(true)) + cap('A carta fica <b>fechada ao seu lado</b>; a próxima entra no lugar. Depois você decide se a vira.') },
    react: { t: 'Reagir?', b: () => tv(rch('', 'anular'), rch('', 'copiar'), rch('', 'apropriar'), rch('', 'proteger'), rch('', 'cortar par')) + cap('Alguém virou um especial. Reaja em segredo ou <b>mantenha fechado</b>.') },
    special: { t: 'Virar um especial?', b: () => tv(slot(true), arr, '<b>virar</b>') + cap('As cartas já foram reveladas. Vire em segredo, no máximo <b>1</b> por disputa.') },
  };
  function canTip() { const V = (U.dbg && U.dbg().V) || null; return on() && V && V.humans > 0; }

  // "mesa": números sobre os elementos reais da tela
  function pinsMesa(root) {
    const R = root.getBoundingClientRect(); $$('.pin', root).forEach(x => x.remove());
    { const box = $('.box', root), bh = document.querySelector('#bh'), me = document.querySelector('.seat.me');   // a caixa não pode cobrir o Buraco Negro nem o seu assento
      if (box && bh && me) { const b = bh.getBoundingClientRect(), m = me.getBoundingClientRect(), top = b.bottom - R.top + 16, room = m.top - R.top - 6 - top;
        Object.assign(box.style, { position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: top + 'px', maxHeight: Math.max(200, room) + 'px', overflow: 'auto' }); } }
    [['.seat.me .mini:not(.res)', 1], ['.seat.me .mini.res', 2], ['.seat.me .prepslot', 3], ['.seat .turnflag:not([hidden])', 4], ['#bh', 5], ['#rtrack .rt', 6]].forEach(([sel, k]) => {
      const t = document.querySelector(sel); if (!t) return; const r = t.getBoundingClientRect(); if (!r.width) return;
      const x = k === 4 ? r.right + 10 : k === 6 ? r.left - 10 : r.left + r.width / 2, y = k === 4 || k === 6 ? r.top + r.height / 2 : k === 5 ? r.top : r.bottom + 10;
      root.append(el(`<span class="pin" style="left:${x - R.left}px;top:${y - R.top}px">${k}</span>`));
    });
  }

  U.tip = function (id, extra) {
    const d0 = TIPS[id]; if (!d0 || !on() || seen()[id]) return Promise.resolve();
    const d = typeof d0.b === 'function' ? Object.assign({}, d0, { b: d0.b(extra) }) : d0;
    const V = (U.dbg && U.dbg().V) || null; if (V && V.humans < 1) return Promise.resolve();
    mark(id);
    const layer = U.layer();
    if ((V && V.online) || d0.soft) { // online não pode travar a mesa dos outros (e dicas "soft" nunca travam): cartão que some sozinho
      const n = el(`<div class="coach hint"><div class="ch"><b>💡 ${esc(d.t)}</b><button class="x" aria-label="Fechar">✕</button></div><div class="cb">${d.b}</div></div>`);
      layer.appendChild(n); const close = () => { n.classList.add('out'); setTimeout(() => n.remove(), 300); };
      n.querySelector('.x').onclick = close; setTimeout(close, d0.soft ? 7000 : 9000); return Promise.resolve();
    }
    return new Promise((res, rej) => { // offline: congela o jogo até "Entendi"
      const run = U.run; if (run) run.rej.add(rej);
      const n = el(`<div class="coach modal${d0.spot ? ' spot' : ''}"><div class="box"><div class="ch"><b>💡 ${esc(d.t)}</b></div><div class="cb">${d.b}</div><div class="row tipbar"><button class="btn ghost sm" data-a="off">Pular dicas</button><button class="btn primary sm" data-a="ok">Entendi</button></div></div></div>`);
      const done = () => { if (run) run.rej.delete(rej); n.remove(); res(); };
      n.querySelector('[data-a=ok]').onclick = () => { SND.play('click'); done(); };
      n.querySelector('[data-a=off]').onclick = () => { SND.play('click'); U.S.help = false; U.applyOpts && U.applyOpts(); done(); };
      layer.appendChild(n); if (d0.spot) { layer.querySelectorAll('.banner').forEach(x => x.remove()); pinsMesa(n); setTimeout(() => pinsMesa(n), 350); }
    });
  };

  // ---------------------------------------------------------------- passo a passo (botão ?)
  const cardImg = (w, cls) => `<img class="gimg ${cls || ''}" src="guia_carta.webp" width="${w}" alt="Carta de exemplo: Kaelina" draggable="false">`;
  const SL = [
    { t: 'O objetivo', ic: '🏆', b: () => `<div class="demo backs">${back(5, 50)}</div><p>Cada jogador começa com um monte de cartas. <b>Fique com todas</b>: quem perde todas as suas (baralho e reserva) é eliminado, e vence o último de pé.</p>` },
    { t: 'Seu baralho', ic: '🃏', b: () => `<div class="demo deck">${[1, 2, 3, 4, 5, 6, 7].map(i => `<div class="dk">${U.cardEl('J08', { up: false, noanim: true, cw: 40 }).outerHTML}<i>${i === 1 ? 'topo' : i}</i></div>`).join('')}<div class="dk res"><div class="stk">${back(1, 40)}</div><i>reserva</i></div></div>
      <p>Antes de começar você <b>arrasta as cartas</b> para escolher a ordem. As <b>7 primeiras</b> formam o baralho; o restante é a <b>reserva</b>, que entra quando o baralho esvazia.</p>` },
    { t: 'A carta', ic: '🎴', b: () => `<div class="anat"><div class="anatcard" data-pins>${U.cardEl('J08', { up: true, noanim: true, cw: 158 }).outerHTML}</div><ul class="leg"><li><span class="n">1</span>Série, no topo</li><li><span class="n">2</span>Nome do personagem</li><li><span class="n">3</span>Especial da carta</li><li><span class="n">4</span>Atributos: Força, Resistência, Inteligência e Velocidade</li><li><span class="n">5</span>Losangos: raridade. ◆ Comum (fosca) · ◆◆ Rara (borda prateada) · ◆◆◆ Épica (borda dourada e reflexo holográfico) · ◆◆◆◆ Lendária (moldura dourada ornamentada, losangos dourados)</li></ul></div><p class="mut">Toque numa carta, no jogo ou na coleção, para ver todos os detalhes. As cartas da <b>União</b> são únicas: fogem da regra, com aura e moldura arco-íris.</p>` },
    { t: 'Uma disputa', ic: '⚔️', b: () => `<ol class="steps"><li><span class="n">1</span><div class="mn">${back(1, 34)}</div><p>Todos põem a carta do topo <b>virada para baixo</b>.</p></li>
      <li><span class="n">2</span><div class="mn attrs">${ai('pod', '')}${ai('def', '')}${ai('int', '')}${ai('vel', '')}</div><p>O <b>iniciador</b> escolhe qualquer atributo.</p></li>
      <li><span class="n">3</span><div class="mn lock">🔒</div><p>Os outros escolhem <b>em segredo</b>, dentro do mesmo par.</p></li>
      <li><span class="n">4</span><div class="mn">${U.cardEl('J08', { up: true, noanim: true, cw: 46 }).outerHTML}</div><p>As cartas são viradas: <b>o maior valor vence</b>.</p></li></ol>` },
    { t: 'Os 4 atributos', ic: '✦', b: () => `<div class="grid2"><div class="pair"><small>Par 1</small>${ai('pod')}<span class="vs">ou</span>${ai('def')}</div><div class="pair"><small>Par 2</small>${ai('int')}<span class="vs">ou</span>${ai('vel')}</div></div>
      <div class="two"><div><small>Ofensivos</small>${OFF}<em>o vencedor <b>leva</b> as cartas dos perdedores</em></div><div><small>Defensivos</small>${DEF}<em>o vencedor só recupera a sua; as outras vão ao <b>Buraco Negro</b></em></div></div>
      <p class="mut">O iniciador escolhe entre os 4; quem responde fica no par do iniciador.</p>` },
    { t: 'Quem vence', ic: '⚖️', b: () => `<div class="duel"><div>${ai('int', '')}<b>82</b></div><span>×</span><div>${ai('vel', '')}<b>82</b></div></div>
      <p>Vence o <b>maior número</b>, mesmo que os atributos sejam diferentes. Empatou? Desempate em ordem:</p>
      <ol class="tb"><li>Maior <b>soma dos 4 atributos</b> da carta</li><li>Maior <b>Força + Inteligência</b></li><li>Ainda igual: ninguém vence e as cartas voltam aos donos</li></ol>` },
    { t: 'Buraco Negro e reserva', ic: '🌀', b: () => `<div class="demo bhd"><div class="bhv"></div><span>→</span><div class="mn" style="flex-wrap:nowrap;gap:6px">${back(2, 30)}</div></div>
      <p>Cartas perdidas em <b>Resistência ou Velocidade</b> vão ao <b>Buraco Negro</b>: saem do jogo.</p><p>Quando seu baralho esvazia, você compra até 7 da <b>reserva</b> e <b>reordena</b> as cartas que chegam. Sem baralho e sem reserva, você está eliminado.</p>` },
    { t: 'Habilidades especiais', ic: '✨', b: () => `<div class="demo"><button class="btn sm fake" tabindex="-1">✦ Usar como especial</button></div>
      <p>Liberados a partir da <b>Rodada 2</b>. Ao escolher o atributo, você pode tirar a carta da mesa e deixá-la <b>fechada ao seu lado</b>; a próxima do baralho entra no lugar.</p>
      <p>Depois da revelação, cada jogador decide <b>em segredo</b> se vira um especial (máximo 1 por disputa). Os efeitos são diferentes em cada carta.</p><p>Especiais <b>reativos</b> (anular, copiar, apropriar, proteger) são virados depois: se um rival virou um especial, você decide <b>sabendo qual foi</b>.</p>` },
    { t: 'Fenômenos dimensionais', ic: '🌌', b: () => `<p>De vez em quando uma rodada traz um <b>fenômeno</b>, avisado na <b>faixa de rodadas</b> no alto da mesa (a atual e as duas seguintes). Duram uma rodada; nunca há dois seguidos.</p>
      <ul class="evlist"><li><b>Maré de Força:</b> Força +10 para todos.</li><li><b>Névoa Mental:</b> Inteligência +10 e Velocidade −10.</li><li><b>Eco dos Especiais:</b> bônus e reduções dos especiais valem o dobro.</li><li><b>Batalha Aberta:</b> todos escolhem qualquer atributo e se enfrentam.</li><li><b>Tempestade Lateral:</b> cada um passa a carta do topo ao jogador da direita.</li><li><b>Maré do Buraco Negro:</b> 2 cartas voltam a quem está atrás (uma vez por partida).</li><li><b>Eclipse:</b> o maior atributo de cada carta perde 30 pontos (marcado na carta).</li><li><b>Mundo ao Avesso:</b> vence o menor valor.</li><li><b>Troca Dimensional:</b> dois atributos de cada carta trocam de valor.</li></ul>
      <p class="mut">Dá para ligar ou desligar os fenômenos antes da partida.</p>` },
    { t: 'Rodadas e fim', ic: '🏁', b: () => `<p>Uma <b>rodada</b> termina quando todos os jogadores vivos já iniciaram uma disputa; depois disso o iniciador gira em sentido horário.</p><p>Se a partida passar do limite de disputas, vence quem tiver <b>mais cartas</b>.</p><p class="mut">Durante as primeiras partidas, o jogo vai avisando cada regra nova na hora em que ela aparece.</p>` },
  ];
  // etiquetas numeradas sobre a carta real do slide "A carta": cada número aponta para o elemento certo (mesmos números da legenda)
  function pins(root) {
    const box = $('[data-pins]', root); if (!box) return; $$('.pinl, .pin', box).forEach(x => x.remove());
    const card = $('.card', box); if (!card) return; const b0 = box.getBoundingClientRect(), cr = card.getBoundingClientRect(); if (!cr.width) return;
    [['.cband .ser', 1], ['.nome', 2], ['.espc', 3], ['.stats', 4], ['.rar', 5]].forEach(([sel, k]) => {
      const t = $(sel, card); if (!t) return; const rg = document.createRange(); rg.selectNodeContents(t); const r = rg.getBoundingClientRect(); if (!r.width) return;
      const y = r.top + r.height / 2 - b0.top, x1 = r.right - b0.left + 3, x2 = cr.right - b0.left;
      const px = x2 + (k % 2 ? 8 : 34);   // números pares ficam mais afastados: etiquetas vizinhas não se sobrepõem
      if (px > x1) box.append(el(`<i class="pinl" style="left:${x1}px;top:${y}px;width:${px - x1}px"></i>`));
      box.append(el(`<span class="pin" style="left:${px}px;top:${y}px">${k}</span>`));
    });
  }
  U.rulesFull = U.rules;
  U.rules = function () {
    SND.play('click'); let i = 0;
    const slides = SL.map((s, k) => `<section class="gslide" data-k="${k}"><div class="gh"><span class="gic">${s.ic}</span><h2>${esc(s.t)}</h2><small>${k + 1} / ${SL.length}</small></div><div class="gc">${s.b()}</div></section>`).join('');
    const n = el(`<div class="guide"><div class="gbox"><header><b>Como jogar</b><button class="ibtn" data-a="x" aria-label="Fechar">✕</button></header><div class="gtrack" tabindex="0">${slides}</div><div class="gdots">${SL.map((_, k) => `<i data-k="${k}"></i>`).join('')}</div>
      <footer><button class="btn sm" data-a="prev" aria-label="Anterior">◀ Anterior</button><button class="btn ghost sm" data-a="full">Regras completas</button><button class="btn primary sm" data-a="next">Próximo ▶</button></footer></div></div>`);
    const box = $('.gbox', n), track = $('.gtrack', n), dots = $$('.gdots i', n), prev = $('[data-a=prev]', n), next = $('[data-a=next]', n);
    const paint = () => {
      dots.forEach((d, k) => d.classList.toggle('on', k === i));
      prev.disabled = i === 0; next.textContent = i === SL.length - 1 ? 'Concluir ✓' : 'Próximo ▶'; box.classList.toggle('last', i === SL.length - 1);
    };
    const goTo = (k, smooth) => { k = Math.max(0, Math.min(SL.length - 1, k)); track.scrollTo({ left: k * track.clientWidth, behavior: smooth === false ? 'auto' : 'smooth' }); };
    let raf = 0;
    track.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { const k = Math.round(track.scrollLeft / Math.max(1, track.clientWidth)); if (k !== i && k >= 0 && k < SL.length) { i = k; SND.play('tick'); paint(); } }); }, { passive: true });
    const close = () => { n.remove(); document.removeEventListener('keydown', key); };
    const key = e => { if (e.key === 'Escape') close(); else if (e.key === 'ArrowRight') goTo(i + 1); else if (e.key === 'ArrowLeft') goTo(i - 1); };
    document.addEventListener('keydown', key);
    n.addEventListener('click', e => {
      const b = e.target.closest('[data-a],[data-k]'); if (!b || b.closest('.gslide')) { if (e.target === n) close(); return; } SND.init();
      if (b.dataset.k != null) return goTo(+b.dataset.k);
      const a = b.dataset.a; if (a === 'x') close(); else if (a === 'prev') goTo(i - 1); else if (a === 'next') { if (i === SL.length - 1) close(); else goTo(i + 1); } else if (a === 'full') { close(); U.rulesFull(); }
    });
    // arrastar com o mouse (no toque o próprio scroll acompanha o dedo)
    let dr = null;
    track.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' || e.button !== 0) return; dr = { x: e.clientX, l: track.scrollLeft, moved: false }; });
    window.addEventListener('pointermove', mv);
    window.addEventListener('pointerup', up);
    function mv(e) { if (!dr) return; const dx = e.clientX - dr.x; if (!dr.moved && Math.abs(dx) > 5) { dr.moved = true; track.classList.add('drag'); } if (dr.moved) track.scrollLeft = dr.l - dx; }
    function up(e) { if (!dr) return; const d = dr; dr = null; track.classList.remove('drag'); if (d.moved) { const dx = e.clientX - d.x; const k = Math.abs(dx) > 50 ? i + (dx < 0 ? 1 : -1) : Math.round(track.scrollLeft / track.clientWidth); goTo(k); } }
    new MutationObserver(() => { if (!n.isConnected) { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); } }).observe(U.layer(), { childList: true });
    U.layer().appendChild(n); paint(); track.focus({ preventScroll: true }); requestAnimationFrame(() => pins(n)); setTimeout(() => pins(n), 400);
  };
})();
