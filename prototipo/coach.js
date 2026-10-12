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

  // ---------------------------------------------------------------- dicas
  const TIPS = {
    order: { t: 'Monte o seu baralho', b: `<p><b>Arraste</b> as cartas para mudar a ordem. A carta <b>nº 1</b> é a primeira a ir para a mesa.</p><p>As <b>7 primeiras</b> formam o baralho ativo; o resto fica na <b>reserva</b> e entra quando o baralho esvazia.</p>` },
    attr_init: { t: 'Você inicia a disputa', b: `<p>Escolha <b>qualquer</b> atributo da sua carta. Todos veem qual foi — mas só depois da revelação saberão os valores.</p>
      <div class="two"><div><small>Ofensivos</small>${OFF}<em>quem vence leva as cartas</em></div><div><small>Defensivos</small>${DEF}<em>as cartas perdedoras vão ao Buraco Negro</em></div></div>` },
    attr_follow: { t: 'Agora é a sua vez de responder', b: `<p>Você só pode escolher <b>dentro do mesmo par</b> do atributo iniciado — e em <b>segredo</b>:</p>
      <div class="two"><div><small>Par 1</small>${ai('pod')} ${ai('def')}</div><div><small>Par 2</small>${ai('int')} ${ai('vel')}</div></div><p class="mut">Ex.: se iniciaram em Inteligência, você escolhe entre Inteligência e Velocidade.</p>` },
    reveal: { t: 'Revelação', b: `<p>Vence o <b>maior valor</b> do atributo escolhido, mesmo que os atributos sejam diferentes do par (Inteligência 82 contra Velocidade 82, por exemplo).</p><p>Se houver empate, o desempate é a <b>soma dos 4 atributos</b> da carta; depois, <b>Ataque + Inteligência</b>.</p>`, hint: true },
    capture: { t: 'Ataque ou Inteligência venceu', b: `<p>O vencedor <b>leva as cartas</b> dos perdedores para o fim do seu baralho.</p>`, hint: true },
    bh: { t: 'Buraco Negro', b: `<p>Quando <b>Defesa ou Velocidade</b> vencem, só o vencedor recupera a própria carta. As cartas dos perdedores vão para o <b>Buraco Negro</b> e saem do jogo.</p>`, hint: true },
    refill: { t: 'Reserva', b: `<p>Seu baralho acabou: você comprou cartas da <b>reserva</b> (até 7). Sem baralho e sem reserva, você é eliminado.</p>`, hint: true },
    round2: { t: 'Rodada 2: especiais liberados', b: `<p>Agora, ao escolher o atributo, aparece o botão <b>✦ Usar como ataque especial</b>. A carta sai da disputa e fica <b>fechada ao seu lado</b>; outra entra no lugar.</p><p>Depois da revelação, você decide <b>em segredo</b> se vira o especial (no máximo 1 por disputa).</p>`, hint: true },
    special: { t: 'Virar um especial?', b: `<p>As cartas já foram reveladas. Se quiser, <b>vire um ataque especial</b> que você deixou fechado: o efeito altera a disputa.</p><p>Todos decidem em segredo e os especiais são virados juntos. Se não quiser, <b>mantenha fechado</b> — ele continua com você.</p>` },
  };
  function canTip() { const V = (U.dbg && U.dbg().V) || null; return on() && V && V.humans > 0; }

  U.tip = function (id, extra) {
    const d = TIPS[id]; if (!d || !on() || seen()[id]) return Promise.resolve();
    const V = (U.dbg && U.dbg().V) || null; if (V && V.humans < 1) return Promise.resolve();
    mark(id);
    const layer = U.layer();
    if (V && V.online) { // online não pode travar a mesa dos outros: cartão que some sozinho
      const n = el(`<div class="coach hint"><div class="ch"><b>💡 ${esc(d.t)}</b><button class="x" aria-label="Fechar">✕</button></div><div class="cb">${d.b}</div></div>`);
      layer.appendChild(n); const close = () => { n.classList.add('out'); setTimeout(() => n.remove(), 300); };
      n.querySelector('.x').onclick = close; setTimeout(close, 9000); return Promise.resolve();
    }
    return new Promise((res, rej) => { // offline: congela o jogo até "Entendi"
      const run = U.run; if (run) run.rej.add(rej);
      const n = el(`<div class="coach modal"><div class="box"><div class="ch"><b>💡 ${esc(d.t)}</b></div><div class="cb">${d.b}</div><div class="row" style="justify-content:flex-end"><button class="btn primary sm" data-a="ok">Entendi</button></div></div></div>`);
      n.querySelector('[data-a=ok]').onclick = () => { SND.play('click'); if (run) run.rej.delete(rej); n.remove(); res(); };
      layer.appendChild(n);
    });
  };

  // ---------------------------------------------------------------- passo a passo (botão ?)
  const cardImg = (w, cls) => `<img class="gimg ${cls || ''}" src="guia_carta.webp" width="${w}" alt="Carta de exemplo: Kaelina" draggable="false">`;
  const SL = [
    { t: 'O objetivo', ic: '🏆', b: () => `<div class="demo backs">${back(5, 50)}</div><p>Cada jogador começa com um monte de cartas. <b>Fique com todas</b>: quem perde todas as suas (baralho e reserva) é eliminado, e vence o último de pé.</p>` },
    { t: 'Seu baralho', ic: '🃏', b: () => `<div class="demo deck">${[1, 2, 3, 4, 5, 6, 7].map(i => `<div class="dk">${U.cardEl('J08', { up: false, noanim: true, cw: 40 }).outerHTML}<i>${i === 1 ? 'topo' : i}</i></div>`).join('')}<div class="dk res"><div class="stk">${back(1, 40)}</div><i>reserva</i></div></div>
      <p>Antes de começar você <b>arrasta as cartas</b> para escolher a ordem. As <b>7 primeiras</b> formam o baralho; o restante é a <b>reserva</b>, que entra quando o baralho esvazia.</p>` },
    { t: 'A carta', ic: '🎴', b: () => `<div class="anat">${cardImg(150)}<ul class="leg"><li><span class="n">1</span>Série, no topo</li><li><span class="n">2</span>Nome do personagem</li><li><span class="n">3</span>Ataque especial da carta</li><li><span class="n">4</span>Atributos: Ataque, Defesa, Inteligência e Velocidade</li><li><span class="n">5</span>Losangos: raridade (1 a 4)</li></ul></div><p class="mut">Toque numa carta, no jogo ou na coleção, para ver todos os detalhes.</p>` },
    { t: 'Uma disputa', ic: '⚔️', b: () => `<ol class="steps"><li><span class="n">1</span><div class="mn">${back(1, 34)}</div><p>Todos põem a carta do topo <b>virada para baixo</b>.</p></li>
      <li><span class="n">2</span><div class="mn attrs">${ai('pod', '')}${ai('def', '')}${ai('int', '')}${ai('vel', '')}</div><p>O <b>iniciador</b> escolhe qualquer atributo.</p></li>
      <li><span class="n">3</span><div class="mn lock">🔒</div><p>Os outros escolhem <b>em segredo</b>, dentro do mesmo par.</p></li>
      <li><span class="n">4</span><div class="mn">${cardImg(46)}</div><p>As cartas são viradas: <b>o maior valor vence</b>.</p></li></ol>` },
    { t: 'Os 4 atributos', ic: '✦', b: () => `<div class="grid2"><div class="pair"><small>Par 1</small>${ai('pod')}<span class="vs">ou</span>${ai('def')}</div><div class="pair"><small>Par 2</small>${ai('int')}<span class="vs">ou</span>${ai('vel')}</div></div>
      <div class="two"><div><small>Ofensivos</small>${OFF}<em>o vencedor <b>leva</b> as cartas dos perdedores</em></div><div><small>Defensivos</small>${DEF}<em>o vencedor só recupera a sua; as outras vão ao <b>Buraco Negro</b></em></div></div>
      <p class="mut">O iniciador escolhe entre os 4; quem responde fica no par do iniciador.</p>` },
    { t: 'Quem vence', ic: '⚖️', b: () => `<div class="duel"><div>${ai('int', '')}<b>82</b></div><span>×</span><div>${ai('vel', '')}<b>82</b></div></div>
      <p>Vence o <b>maior número</b>, mesmo que os atributos sejam diferentes. Empatou? Desempate em ordem:</p>
      <ol class="tb"><li>Maior <b>soma dos 4 atributos</b> da carta</li><li>Maior <b>Ataque + Inteligência</b></li><li>Ainda igual: ninguém vence e as cartas voltam aos donos</li></ol>` },
    { t: 'Buraco Negro e reserva', ic: '🌀', b: () => `<div class="demo bhd"><div class="bhv"></div><span>→</span><div class="mn" style="flex-wrap:nowrap;gap:6px">${back(2, 30)}</div></div>
      <p>Cartas perdidas em <b>Defesa ou Velocidade</b> vão ao <b>Buraco Negro</b>: saem do jogo.</p><p>Quando seu baralho esvazia, você compra até 7 da <b>reserva</b>. Sem baralho e sem reserva, você está eliminado.</p>` },
    { t: 'Ataques especiais', ic: '✨', b: () => `<div class="demo"><button class="btn sm fake" tabindex="-1">✦ Usar como ataque especial</button></div>
      <p>Liberados a partir da <b>Rodada 2</b>. Ao escolher o atributo, você pode tirar a carta da mesa e deixá-la <b>fechada ao seu lado</b>; a próxima do baralho entra no lugar.</p>
      <p>Depois da revelação, cada jogador decide <b>em segredo</b> se vira um especial (máximo 1 por disputa). Os efeitos são diferentes em cada carta.</p>` },
    { t: 'Rodadas e fim', ic: '🏁', b: () => `<p>Uma <b>rodada</b> termina quando todos os jogadores vivos já iniciaram uma disputa; depois disso o iniciador gira em sentido horário.</p><p>Se a partida passar do limite de disputas, vence quem tiver <b>mais cartas</b>.</p><p class="mut">Durante as primeiras partidas, o jogo vai avisando cada regra nova na hora em que ela aparece.</p>` },
  ];
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
    U.layer().appendChild(n); paint(); track.focus({ preventScroll: true });
  };
})();
