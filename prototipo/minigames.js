/* Dimensions Stacks — minigames do modo história (10). Interface única:
     DSMini.play(id, { onEnd }) → Promise<{ id, pct, tier, reward, detail }>   (pct 0..1 → tier 0..3 → pêndulos)
   Calibragem (editável no painel do administrador): dif (dificuldade, 0,5–2), cortes (pct mínimo para tier 1/2/3) e premios (pêndulos por tier 0..3).
   Os resultados ficam num registro local (dsstacks.mini.log) para o admin analisar. */
(function () {
  'use strict';
  const U = window.DSUI; if (!U) return;
  const { SND } = U;
  const CFG_KEY = 'dsstacks.mini.cfg', LOG_KEY = 'dsstacks.mini.log';
  const rd = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  const wr = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
  const $ = (s, r) => (r || document).querySelector(s);
  const mk = h => { const t = document.createElement('template'); t.innerHTML = h.trim(); return t.content.firstElementChild; };
  const rnd = n => Math.floor(Math.random() * n), pick = a => a[rnd(a.length)];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const CARTAS = () => U.D.CARTAS;
  const NA = a => U.ATT[a].nome;

  const DEF = { dif: 1, cortes: [.34, .67, .95], premios: [0, 5, 10, 20] };
  const LISTA = [
    { id: 'maiormenor', nome: 'Três Portais', desc: 'Escolha uma porta entre 3. Pêndulos, passagem livre ou nada; na última, talvez uma carta.', cortes: [.37, .63, .88] },
    { id: 'memoria', nome: 'Ecos Estelares', desc: 'Encontre os 6 pares de cartas antes que o tempo acabe, com poucas jogadas.', cortes: [.3, .6, .9] },
    { id: 'quemequem', nome: 'Fragmentos de Rosto', desc: 'Só alguns trechos escuros da carta aparecem. Descubra quem é.', cortes: [.37, .63, .88] },
    { id: 'ordem', nome: 'Dança das Cartas', desc: 'Uma carta é marcada, todas viram e trocam de lugar. Acerte onde ela foi parar.', cortes: [.4, .7, .95] },
    { id: 'mineracao', nome: 'Maré Rubra', desc: 'As bolinhas vermelhas contagiam as azuis, que vagam pela tela. Afaste as vermelhas.', cortes: [.37, .63, .88] },
    { id: 'asteroides', nome: 'Rota dos Meteoros', desc: 'Arraste a nave, desvie das rochas e pegue os pêndulos.', cortes: [.33, .6, .87] },
    { id: 'cofre', nome: 'Fechadura de Jasmey', desc: 'Descubra o código de 4 símbolos em 6 tentativas, contra o relógio.', cortes: [.34, .5, .83] },
    { id: 'caracoroa', nome: 'Eco das Notas', desc: 'Ouça a sequência, que ganha um som a cada rodada, e repita.', cortes: [.3, .6, .95] },
    { id: 'raspadinha', nome: 'Relâmpago Dimensional', desc: 'Três cartas viram num piscar: uma dá +1, uma tira 1. Toque no +1 o máximo que puder.', cortes: [.3, .6, .95] },
    { id: 'cacapendulo', nome: 'Pêndulos Fugitivos', desc: 'No escuro, toque nos pêndulos que cruzam sob a luz em todas as direções.', cortes: [.33, .6, .87] },
    // um por série de livros
    { id: 'elos', nome: 'Sussurro dos Elos', serie: 'Diário Sobrenatural', desc: 'No escuro, segure o dedo e siga o som: quanto mais perto do Elo, mais alto. Toque 2 vezes para confirmar.', cortes: [.4, .7, 1] },
    { id: 'luas', nome: 'Resgate no Céu', serie: 'Ciclo de Jesed', desc: 'Pessoas caem do céu, algumas em planadores que quebram. Mova o cesto e salve o máximo.', cortes: [.35, .65, .9] },
    { id: 'poderes', nome: 'Cores dos Irmãos', serie: 'Viajantes Dimensionais', desc: 'Leve cada irmão até um objeto da cor dele, o mais rápido possível.', cortes: [.4, .7, .9] },
    { id: 'gancho', nome: 'Constelação Pirata', serie: 'Spacetheft', desc: 'Toque nos símbolos espaciais que aparecem. Cuidado com a caveira.', cortes: [.34, .67, .84] },
    { id: 'culpado', nome: 'Vigília Escura', serie: 'Mistério Oculto', desc: 'Feche os olhos que se abrem antes que ataquem. 3 corações.', cortes: [.5, .75, .96] },
    { id: 'ritmo', nome: 'Maré, Chama e Gelo', serie: 'Édelin Lys', desc: 'Toque nas notas quando chegarem à linha, na pista do elemento.', cortes: [.4, .7, .9] },
    { id: 'formacao', nome: 'Chamado da União', serie: 'A União', desc: 'Escolha 3 heróis cujos atributos somados cubram o desafio.', cortes: [.34, .67, .99] },
  ];
  const BYID = {}; LISTA.forEach(m => { BYID[m.id] = m; });
  const cfgAll = () => rd(CFG_KEY, {});
  function cfg(id) { const c = cfgAll()[id] || {}, m = BYID[id]; return { dif: c.dif || DEF.dif, cortes: c.cortes || m.cortes || DEF.cortes, premios: c.premios || DEF.premios }; }
  function setCfg(id, patch) { const a = cfgAll(); a[id] = Object.assign({}, a[id] || {}, patch); wr(CFG_KEY, a); }
  const log = () => rd(LOG_KEY, []);
  const tierOf = (id, pct) => { const c = cfg(id).cortes; return pct >= c[2] ? 3 : pct >= c[1] ? 2 : pct >= c[0] ? 1 : 0; };


  // ---- música dos minigames: tema curto e animado, gerado pelo próprio navegador (sem arquivo)
  const MUS = (() => {
    const MEL = [72, 76, 79, 76, 74, 77, 81, 77, 72, 76, 79, 84, 83, 79, 76, null, 69, 72, 76, 72, 71, 74, 77, 74, 67, 71, 74, 79, 76, 74, 72, null], BAS = [48, 45, 41, 43], SP = 60 / 132 / 2;
    let ctx = null, out = null, timer = 0, step = 0, next = 0, on = false;
    const hz = m => 440 * Math.pow(2, (m - 69) / 12);
    const nota = (m, t, dur, tipo, vol) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = tipo; o.frequency.value = hz(m); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .015); g.gain.exponentialRampToValueAtTime(.0001, t + dur); o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + .05); };
    const agenda = () => { if (!on) return; while (next < ctx.currentTime + .35) { const i = step % 32, m = MEL[i]; if (m != null) nota(m, next, SP * 1.6, 'triangle', .05); if (i % 4 === 0) nota(BAS[Math.floor(i / 8)] , next, SP * 3.4, 'sine', .08); if (i % 2 === 1) nota(96, next, .03, 'square', .012); next += SP; step++; } };
    return {
      start() { try { SND.init(); ctx = SND.ctx || new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); out = ctx.createGain(); out.gain.value = .0001; out.connect(SND.master || ctx.destination); out.gain.linearRampToValueAtTime(1, ctx.currentTime + .6); on = true; step = 0; next = ctx.currentTime + .1; timer = setInterval(agenda, 90); try { SND.duckMusic && SND.duckMusic(.12, 7200, .8); } catch (e) { } } catch (e) { on = false; } },
      stop() { if (!on) return; on = false; clearInterval(timer); try { const o = out, t = ctx.currentTime; o.gain.setTargetAtTime(0, t, .15); setTimeout(() => { try { o.disconnect(); } catch (e) { } }, 900); SND.duckMusic && SND.duckMusic(1, 0, .6); } catch (e) { } },
    };
  })();
  const SEM_MUSICA = ['caracoroa', 'elos', 'ritmo'];

  // ---- casca comum: tela cheia, título, sair, resultado
  function shell(m) {
    const ov = mk(`<div class="mg"><header><b>${m.nome}</b><span class="mg-hint">${m.desc}</span><button class="ibtn mg-x" aria-label="Sair">✕</button></header><div class="mg-body"></div></div>`);
    document.body.appendChild(ov); return ov;
  }
  async function play(id, opts) {
    opts = opts || {}; const m = BYID[id], c = cfg(id); if (!m) return null; try { SND.init(); } catch (e) { }
    const ov = shell(m), body = $('.mg-body', ov); let ended = false, stop = () => { }, res; const t0 = Date.now();
    const out = await new Promise(resolve => {
      const fim = (pct, detail, extra) => { if (ended) return; ended = true; stop(); MUS.stop(); pct = Math.max(0, Math.min(1, pct)); const tier = tierOf(id, pct), reward = c.premios[tier] | 0; res = { id, pct: +pct.toFixed(3), tier, reward, detail: detail || '', ms: Date.now() - t0 }; if (extra) Object.assign(res, extra);
        body.innerHTML = `<div class="mg-res t${tier}"><div class="mg-tier">${['Sem prêmio', 'Bom', 'Ótimo', 'Perfeito'][tier]}</div><div class="mg-pct">${Math.round(pct * 100)}%</div><div class="mg-det">${detail || ''}</div><div class="mg-rw">${reward > 0 ? '+' + reward + ' pêndulos' : 'Nenhum pêndulo'}${res.carta ? ' + ' + U.CARDS[res.carta].nome : ''}</div><button class="btn primary mg-ok">Continuar</button></div>`;
        try { SND.play(tier ? (tier === 3 ? 'bauOpen' : 'bauCoin') : 'lose'); } catch (e) { }
        const L = log(); L.push({ id, pct: res.pct, tier, reward, ms: res.ms, t: Date.now(), teste: !!opts.teste }); wr(LOG_KEY, L.slice(-500));
        $('.mg-ok', ov).onclick = () => { try { SND.play('click'); } catch (e) { } resolve(res); };
      };
      $('.mg-x', ov).onclick = () => { if (ended) { resolve(res); return; } fim(0, 'Abandonado'); };
      if (!SEM_MUSICA.includes(id)) MUS.start(); try { stop = GAMES[id](body, c, fim) || (() => { }); } catch (e) { console.error(e); fim(0, 'Erro'); }
    });
    ov.remove(); opts.onEnd && opts.onEnd(out); return out;
  }

  // ---- utilitários de carta
  const card = (id, cw) => U.cardEl(id, { up: true, noanim: true, cw: cw || 96 });
  const hidden = cw => U.cardEl('?', { noanim: true, cw: cw || 96 });
  const randCards = n => shuffle(CARTAS()).slice(0, n).map(c => c.id);

  const GAMES = {
    // 1. portas: 3 rodadas, 3 portas cada; última porta pode dar uma carta
    maiormenor(body, c, fim) {
      let rod = 0, acum = 0, busy = false; const R = 3;
      const tela = () => { const ult = rod === R - 1, res = shuffle(ult ? ['pend', 'carta', 'perde'] : ['pend', 'perde', 'passa']);
        body.innerHTML = `<p class="mg-q">${ult ? 'Última porta' : 'Porta ' + (rod + 1) + '/' + R}<br>Escolha uma</p><div class="mg-portas">${[0, 1, 2].map(i => `<button class="mg-porta" data-i="${i}"><span>${i + 1}</span></button>`).join('')}</div>`; busy = false;
        body.onclick = async e => { const b = e.target.closest('.mg-porta'); if (!b || busy) return; busy = true; const r = res[+b.dataset.i]; b.classList.add('open'); SND.play('flip');
          b.innerHTML = r === 'pend' ? '<span>+ pêndulos</span>' : r === 'carta' ? '<span>Uma carta!</span>' : r === 'passa' ? '<span>Passagem livre</span>' : '<span>Nada</span>'; await wait(1100);
          if (r === 'perde') { SND.play('lose'); return fim(0, 'A porta estava vazia'); }
          if (r === 'pend') { acum += ult ? .5 : .25; SND.play('capture'); } else if (r === 'carta') { SND.play('bauOpen'); return fim(1, 'Ganhou uma carta', { carta: pick(CARTAS().filter(x => !x.uniao && x.id !== 'S11')).id }); }
          rod++; if (rod >= R) return fim(Math.min(1, acum), 'Terminou as portas'); tela(); }; };
      tela();
    },
    // 2. Ecos Estelares (memória): 6 pares, com tempo limite; a nota máxima é possível com ~10 jogadas
    memoria(body, c, fim) {
      const P = 6, ids = randCards(P), deck = shuffle(ids.concat(ids)); let open = [], moves = 0, found = 0, lock = false, acabou = false, left = Math.round(75 / c.dif);
      body.innerHTML = `<p class="mg-q" id="mq"></p><div class="mg-grid g4"></div>`; const g = $('.mg-grid', body), mq = $('#mq', body);
      const txt = () => { mq.innerHTML = 'Jogadas: ' + moves + ' · <b>' + left + ' s</b>'; }; txt();
      const tm = setInterval(() => { if (acabou) return; left--; txt(); if (left <= 0) { acabou = true; clearInterval(tm); fim(found / P * .45, found + ' de ' + P + ' pares (tempo esgotado)'); } }, 1000);
      deck.forEach((id, i) => { const b = mk('<button class="mg-cell" aria-label="carta"></button>'); b.dataset.i = i; b.append(hidden(66)); g.append(b); });
      g.onclick = async e => { const b = e.target.closest('.mg-cell'); if (!b || lock || acabou || b.classList.contains('on') || b.classList.contains('ok')) return; const i = +b.dataset.i;
        b.classList.add('on'); b.replaceChildren(card(deck[i], 66)); SND.play('flip'); open.push(i);
        if (open.length === 2) { lock = true; moves++; txt(); const [x, y] = open; const cx = g.children[x], cy = g.children[y];
          await wait(750); if (acabou) return; if (deck[x] === deck[y]) { cx.classList.add('ok'); cy.classList.add('ok'); found++; SND.play('capture'); } else { [cx, cy].forEach(z => { z.classList.remove('on'); z.replaceChildren(hidden(66)); }); }
          open = []; lock = false; if (found === P) { acabou = true; clearInterval(tm); fim(1 - (moves - P - 4) / (18 / c.dif), moves + ' jogadas em ' + (Math.round(75 / c.dif) - left) + ' s'); } } };
      return () => { acabou = true; clearInterval(tm); };
    },
    // 3. Silhuetas (quem é quem): só alguns trechos escuros da imagem da carta aparecem; 8 perguntas, 10 s cada
    quemequem(body, c, fim) {
      const N = 8; let n = 0, ok = 0, tm = null, left = 0, done = false;
      const trechos = id => { const src = (window.CARD_IMAGES || {})[id]; if (!src) return null; const W = 150, H = 200, k = 3 + (Math.random() < .5 ? 1 : 0), cs = [];
        for (let i = 0; i < k; i++) cs.push(`radial-gradient(circle ${34 + rnd(12)}px at ${22 + rnd(W - 44)}px ${22 + rnd(H - 44)}px, #000 55%, transparent 100%)`);
        const d = mk(`<div class="mg-frag" style="width:${W}px;height:${H}px;background-image:url(${src});-webkit-mask-image:${cs.join(',')};mask-image:${cs.join(',')}"></div>`); return d; };
      const q = () => { const cs = randCards(4), alvo = cs[0], opts = shuffle(cs); left = Math.round(10 / c.dif);
        body.innerHTML = `<p class="mg-q" id="mq">Pergunta ${n + 1}/${N} · <span id="tl">${left}</span>s</p><div class="mg-c" id="mA"></div><div class="mg-btns col">${opts.map(o => `<button class="btn" data-id="${o}">${U.CARDS[o].nome}</button>`).join('')}</div>`;
        const A = $('#mA', body), fr = trechos(alvo); A.classList.add('mg-fragbox'); if (fr) A.append(fr); else { const ce0 = card(alvo, 150); ce0.style.filter = 'brightness(0)'; A.append(ce0); } done = false;
        const resp = async id => { if (done) return; done = true; clearInterval(tm); A.classList.remove('mg-fragbox'); A.replaceChildren(card(alvo, 150)); const certo = id === alvo; if (certo) ok++; SND.play(certo ? 'win' : 'lose'); await wait(1100); n++; if (n >= N) fim(ok / N, ok + ' de ' + N + ' acertos'); else q(); };
        body.onclick = e => { const b = e.target.closest('[data-id]'); if (b) resp(b.dataset.id); };
        clearInterval(tm); tm = setInterval(() => { left--; const t = $('#tl', body); if (t) t.textContent = left; if (left <= 0) resp(null); }, 1000); };
      q(); return () => clearInterval(tm);
    },
    // 4. Dança das Cartas: uma carta é marcada, todas viram e trocam de lugar à vista; acerte onde ela foi parar (6 rodadas)
    ordem(body, c, fim) {
      const R = 6, CW = 78, GAP = 12, H = 118; let rodada = 0, ok = 0, acabou = false;
      const rod = async () => {
        const n = rodada < 2 ? 3 : 4, trocas = 4 + rodada * 2, vel = Math.max(170, 520 - rodada * 60) / c.dif, ids = randCards(n), alvo = rnd(n);
        body.innerHTML = `<p class="mg-q" id="mq">Rodada ${rodada + 1}/${R}<br>Memorize a carta marcada</p><div class="mg-dance" style="width:${n * (CW + GAP) - GAP}px;height:${H + 14}px"></div>`;
        const area = $('.mg-dance', body), pos = Array.from({ length: n }, (_, i) => i), it = [], mq = $('#mq', body); let pronto = false;
        const x = p => p * (CW + GAP);
        ids.forEach((id, i) => { const d = mk('<button class="mg-dc"></button>'); d.style.cssText = `width:${CW}px;height:${H}px;transform:translate(${x(i)}px,7px);transition:transform ${vel}ms ease-in-out`; d.append(card(id, CW)); if (i === alvo) d.classList.add('mark'); d.dataset.i = i; area.append(d); it.push(d); });
        await wait(1700); if (acabou) return; it.forEach(d => { d.classList.remove('mark'); d.replaceChildren(hidden(CW)); }); SND.play('flip'); await wait(450);
        mq.innerHTML = 'Acompanhe com os olhos…';
        for (let k = 0; k < trocas; k++) { if (acabou) return; let a = rnd(n), b; do { b = rnd(n); } while (b === a);
          const ia = pos.indexOf(a), ib = pos.indexOf(b); pos[ia] = b; pos[ib] = a;
          it.forEach((d, i) => { d.style.transform = `translate(${x(pos[i])}px,${(i === ia || i === ib) ? (k % 2 ? 24 : -8) : 7}px)`; }); SND.play('tick'); await wait(vel + 30);
          it.forEach((d, i) => { d.style.transform = `translate(${x(pos[i])}px,7px)`; }); await wait(vel * .45); }
        if (acabou) return; mq.innerHTML = 'Onde está a carta marcada?'; pronto = true;
        area.onclick = async e => { const d = e.target.closest('.mg-dc'); if (!d || !pronto) return; pronto = false; const i = +d.dataset.i, certo = i === alvo; if (certo) ok++; SND.play(certo ? 'win' : 'lose');
          it.forEach((z, j) => { z.replaceChildren(card(ids[j], CW)); if (j === alvo) z.classList.add('mark'); }); await wait(1100); if (acabou) return; rodada++; if (rodada >= R) { acabou = true; fim(ok / R, ok + ' de ' + R + ' rodadas'); } else rod(); };
      };
      rod(); return () => { acabou = true; };
    },
    // 5. Maré Rubra (contágio): as vermelhas começam longe das azuis, espalhadas pelos cantos; as azuis vagueiam
    mineracao(body, c, fim) {
      const cv = mk('<canvas class="mg-cv"></canvas>'); body.append(cv); const W = cv.width = Math.min(380, body.clientWidth || 360), H = cv.height = 440, g = cv.getContext('2d');
      const NB = 12, R = 11, T = Math.round(24 / c.dif), V = 26 * c.dif, VB = 24; const bs = [];
      const cantos = shuffle([[0, 0], [1, 0], [0, 1], [1, 1]]);
      cantos.forEach(([cx, cy]) => bs.push({ x: 28 + cx * (W - 56) + (cx ? -1 : 1) * rnd(26), y: 36 + cy * (H - 72) + (cy ? -1 : 1) * rnd(26), r: true }));
      for (let i = 0; i < NB; i++) { let x, y, k = 0; do { x = 36 + Math.random() * (W - 72); y = 50 + Math.random() * (H - 100); k++; } while (k < 300 && bs.some(b => b.r && Math.hypot(b.x - x, b.y - y) < 150)); const a = Math.random() * 6.283; bs.push({ x, y, r: false, a }); }
      let drag = null, last = 0, raf = 0, t0 = 0, acabou = false;
      const pos = e => { const b = cv.getBoundingClientRect(); return { x: (e.clientX - b.left) * W / b.width, y: (e.clientY - b.top) * H / b.height }; };
      cv.onpointerdown = e => { const p = pos(e); let m = null, d = 1e9; bs.forEach(b => { const dd = Math.hypot(b.x - p.x, b.y - p.y); if (b.r && dd < 34 && dd < d) { d = dd; m = b; } }); if (m) { drag = m; cv.setPointerCapture(e.pointerId); } };
      cv.onpointermove = e => { if (!drag) return; const p = pos(e); drag.x = Math.max(R, Math.min(W - R, p.x)); drag.y = Math.max(R, Math.min(H - R, p.y)); };
      cv.onpointerup = cv.onpointercancel = () => { drag = null; };
      const fimJogo = () => { if (acabou) return; acabou = true; cancelAnimationFrame(raf); const az = bs.filter(b => !b.r).length; fim(az / NB, az + ' de ' + NB + ' azuis salvas'); };
      const loop = ts => { if (acabou) return; if (!t0) t0 = ts; const dt = Math.min(.05, (ts - (last || ts)) / 1000); last = ts;
        const azuis = bs.filter(b => !b.r);
        azuis.forEach(b => { b.a += (Math.random() - .5) * 5 * dt; b.x += Math.cos(b.a) * VB * dt; b.y += Math.sin(b.a) * VB * dt; if (b.x < R || b.x > W - R) { b.a = Math.PI - b.a; b.x = Math.max(R, Math.min(W - R, b.x)); } if (b.y < R + 22 || b.y > H - R) { b.a = -b.a; b.y = Math.max(R + 22, Math.min(H - R, b.y)); } });
        bs.forEach(b => { if (!b.r || b === drag || !azuis.length) return; let t = null, d = 1e9; azuis.forEach(z => { const dd = Math.hypot(z.x - b.x, z.y - b.y); if (dd < d) { d = dd; t = z; } }); b.x += (t.x - b.x) / d * V * dt; b.y += (t.y - b.y) / d * V * dt; });
        bs.forEach(b => { if (!b.r) return; azuis.forEach(z => { if (!z.r && Math.hypot(z.x - b.x, z.y - b.y) < R * 1.8) { z.r = true; SND.play('lose'); } }); });
        g.clearRect(0, 0, W, H); bs.forEach(b => { g.beginPath(); g.arc(b.x, b.y, R, 0, 7); g.fillStyle = b.r ? '#ff3b4f' : '#4cc3ff'; g.shadowColor = g.fillStyle; g.shadowBlur = b === drag ? 18 : 8; g.fill(); }); g.shadowBlur = 0;
        const rest = T - (ts - t0) / 1000; g.fillStyle = '#fff'; g.font = '700 14px sans-serif'; g.fillText(Math.max(0, rest).toFixed(0) + ' s · azuis ' + bs.filter(b => !b.r).length, 10, 18);
        if (!bs.some(b => !b.r)) return fimJogo(); if (rest <= 0) return fimJogo(); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop); return () => { acabou = true; cancelAnimationFrame(raf); };
    },
    // 6. asteroides: 30 s, 3 vidas
    asteroides(body, c, fim) {
      const cv = mk('<canvas class="mg-cv"></canvas>'); body.append(cv); const W = cv.width = Math.min(380, body.clientWidth || 360), H = cv.height = Math.min(520, (body.clientHeight || 560) - 10), g = cv.getContext('2d');
      let x = W / 2, vidas = 3, moedas = 0, t = 0, last = 0, raf = 0, acabou = false; const obs = [], T = 30, META = 14; const mover = e => { const r = cv.getBoundingClientRect(); x = Math.max(16, Math.min(W - 16, (e.clientX - r.left) * W / r.width)); };
      cv.addEventListener('pointermove', mover); cv.addEventListener('pointerdown', mover); cv.style.touchAction = 'none';
      const fin = () => { if (acabou) return; acabou = true; fim(moedas / META, moedas + ' pêndulos, ' + vidas + ' vidas'); };
      const loop = ts => { const dt = Math.min(.05, (ts - last) / 1000 || 0); last = ts; t += dt;
        if (Math.random() < dt * (2.2 + t / 12) * c.dif) obs.push({ k: 'r', x: 12 + Math.random() * (W - 24), y: -14, r: 12 + Math.random() * 10, v: (120 + Math.random() * 90) * c.dif });
        if (Math.random() < dt * 1.1) obs.push({ k: 'c', x: 12 + Math.random() * (W - 24), y: -14, r: 9, v: 110 });
        g.fillStyle = '#05030f'; g.fillRect(0, 0, W, H); g.fillStyle = '#ffffff55'; for (let i = 0; i < 30; i++) g.fillRect((i * 97) % W, (i * 53 + t * 40 * (1 + i % 3)) % H, 1.5, 1.5);
        for (let i = obs.length - 1; i >= 0; i--) { const o = obs[i]; o.y += o.v * dt; const hit = Math.hypot(o.x - x, o.y - (H - 40)) < o.r + 14;
          if (hit) { obs.splice(i, 1); if (o.k === 'c') { moedas++; SND.play('tick'); } else { vidas--; SND.play('lose'); if (vidas <= 0) return fin(); } continue; } if (o.y > H + 30) { obs.splice(i, 1); continue; }
          g.beginPath(); g.fillStyle = o.k === 'c' ? '#ff5a4f' : '#8a7f9a'; g.arc(o.x, o.y, o.r, 0, 7); g.fill(); if (o.k === 'c') { g.fillStyle = '#05030f'; g.beginPath(); g.arc(o.x, o.y, 3, 0, 7); g.fill(); } }
        g.fillStyle = '#7dffb0'; g.beginPath(); g.moveTo(x, H - 58); g.lineTo(x - 14, H - 26); g.lineTo(x + 14, H - 26); g.fill();
        g.fillStyle = '#fff'; g.font = '700 14px system-ui'; g.fillText('Pêndulos ' + moedas + '   Vidas ' + vidas + '   ' + Math.max(0, Math.ceil(T - t)) + 's', 10, 20);
        if (t >= T) return fin(); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop); return () => { acabou = true; cancelAnimationFrame(raf); };
    },
    // 8. cofre: mastermind 4 de 6, 6 tentativas
    cofre(body, c, fim) {
      const SYM = ['●', '▲', '■', '◆', '★', '✚'], COR = ['#ff8a5c', '#6cc6ff', '#c58cff', '#7dffb0', '#ffd25f', '#ff7ab0'], codigo = Array.from({ length: 4 }, () => rnd(6)); let tent = [], atual = [null, null, null, null], fixo = [false, false, false, false], left = Math.round(110 / c.dif), acabou = false; const tmC = setInterval(() => { if (acabou) return; left--; const t = $('#cft', body); if (t) t.textContent = left; if (left <= 0) { acabou = true; clearInterval(tmC); fim(0, 'Tempo esgotado: o código era ' + codigo.map(s => SYM[s]).join(' ')); } }, 1000);
      const pinta = () => { body.innerHTML = `<p class="mg-q">Tentativa ${tent.length + 1}/6 · <span id="cft">${left}</span> s</p><div class="mg-hist">${tent.map(t => `<div class="mg-linha">${t.g.map(s => `<i style="color:${COR[s]}">${SYM[s]}</i>`).join('')}<span>${'●'.repeat(t.p)}<em>${'○'.repeat(t.q)}</em></span></div>`).join('')}</div>
        <div class="mg-linha cur">${[0, 1, 2, 3].map(i => `<i data-i="${i}" style="color:${atual[i] != null ? COR[atual[i]] : '#888'}${fixo[i] ? ';text-shadow:0 0 10px currentColor' : ''}">${atual[i] != null ? SYM[atual[i]] : '_'}</i>`).join('')}</div>
        <div class="mg-btns">${SYM.map((s, i) => `<button class="btn" data-s="${i}" style="color:${COR[i]}">${s}</button>`).join('')}</div><div class="mg-btns"><button class="btn" data-a="del">Apagar</button><button class="btn primary" data-a="ok" ${atual.every(x => x != null) ? '' : 'disabled'}>Testar</button></div><p class="hint">● lugar certo · ○ símbolo certo no lugar errado</p>`; };
      body.onclick = e => { const b = e.target.closest('button'); if (!b || acabou) return; if (b.dataset.s != null) { const k = atual.findIndex((x, i) => x == null && !fixo[i]); if (k >= 0) atual[k] = +b.dataset.s; } else if (b.dataset.a === 'del') { for (let i = 3; i >= 0; i--) if (atual[i] != null && !fixo[i]) { atual[i] = null; break; } } else if (b.dataset.a === 'ok' && atual.every(x => x != null)) {
          const p = atual.filter((s, i) => s === codigo[i]).length; const rest = codigo.filter((s, i) => s !== atual[i]), usadas = atual.filter((s, i) => s !== codigo[i]); let q = 0; usadas.forEach(s => { const k = rest.indexOf(s); if (k >= 0) { q++; rest.splice(k, 1); } });
          tent.push({ g: atual.slice(), p, q }); SND.play(p === 4 ? 'win' : 'tick'); if (p === 4) { acabou = true; clearInterval(tmC); return fim((7 - tent.length) / 6, 'Aberto na tentativa ' + tent.length); } if (tent.length >= 6) { acabou = true; clearInterval(tmC); return fim(0, 'O código era ' + codigo.map(s => SYM[s]).join(' ')); }
          fixo = atual.map((x, i) => x === codigo[i]); atual = atual.map((x, i) => fixo[i] ? x : null); } SND.play('tick'); pinta(); };
      pinta(); return () => { acabou = true; clearInterval(tmC); };
    },
    // 9. sequência de sons: 4 instrumentos, cada rodada soma um som
    caracoroa(body, c, fim) {
      const COR = ['#ff8a5c', '#6cc6ff', '#7dffb0', '#ffd25f'], NOTA = [261.6, 329.6, 392, 523.3], NOME = ['', '', '', '']; const MAX = 8;
      let ctx = null; const tom = (i, ms) => { try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); const o = ctx.createOscillator(), gn = ctx.createGain(); o.type = ['triangle', 'sine', 'square', 'sawtooth'][i]; o.frequency.value = NOTA[i]; gn.gain.setValueAtTime(.0001, ctx.currentTime); gn.gain.exponentialRampToValueAtTime(.18, ctx.currentTime + .02); gn.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + ms / 1000); o.connect(gn); gn.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + ms / 1000 + .05); } catch (e) { } };
      let seq = [], pos = 0, vez = false, feitas = 0;
      body.innerHTML = `<p class="mg-q" id="mq"></p><div class="mg-grid g3 sq" id="el"></div>`; const q = $('#mq', body), g = $('#el', body); g.style.gridTemplateColumns = 'repeat(2, 120px)';
      NOME.forEach((n, i) => { g.append(mk(`<button class="mg-cell elo" data-i="${i}" style="--c:${COR[i]};height:110px;background:${COR[i]}26">${n}</button>`)); });
      const acende = async i => { const b = g.children[i]; b.classList.add('on'); tom(i, 380 / c.dif); await wait(400 / c.dif); b.classList.remove('on'); await wait(160 / c.dif); };
      const nova = async () => { vez = false; seq.push(rnd(4)); pos = 0; q.textContent = 'Rodada ' + seq.length + '/' + MAX + ': ouça'; await wait(700); for (const i of seq) await acende(i); q.textContent = 'Sua vez'; vez = true; };
      g.onclick = async e => { const b = e.target.closest('.elo'); if (!b || !vez) return; const i = +b.dataset.i; acende(i);
        if (i !== seq[pos]) { vez = false; SND.play('lose'); q.textContent = 'Errou!'; await wait(900); return fim(feitas / MAX, feitas + ' de ' + MAX + ' rodadas'); }
        pos++; if (pos === seq.length) { vez = false; feitas++; SND.play('capture'); await wait(700); if (feitas >= MAX) return fim(1, 'Todas as rodadas'); nova(); } };
      nova();
    },
    // 11. Relâmpago dimensional (antiga raspadinha): três cartas viram e desviram rápido; uma dá +1, uma tira 1, uma nada. Toque o +1 o máximo de vezes
    raspadinha(body, c, fim) {
      const T = Math.round(22 / c.dif), META = 16; let pts = 0, left = T, acabou = false, aberta = false, tocou = false, rodada = 0, tipos = [];
      body.innerHTML = `<p class="mg-q" id="mq"></p><div class="mg-grid g3"></div>`; const g = $('.mg-grid', body), mq = $('#mq', body);
      const txt = () => { mq.innerHTML = 'Pontos: <b>' + pts + '</b> · ' + left + ' s'; }; txt();
      for (let i = 0; i < 3; i++) { const b = mk('<button class="mg-cell scr">?</button>'); b.dataset.i = i; b.style.height = '110px'; g.append(b); }
      const tm = setInterval(() => { if (acabou) return; left--; txt(); if (left <= 0) { acabou = true; clearInterval(tm); fim(pts / META, pts + ' pontos'); } }, 1000);
      g.onclick = e => { const b = e.target.closest('.mg-cell'); if (!b || acabou || !aberta || tocou) return; tocou = true; const t = tipos[+b.dataset.i];
        if (t === 'mais') { pts++; SND.play('capture'); b.classList.add('rl-mais'); } else if (t === 'menos') { pts = Math.max(0, pts - 1); SND.play('lose'); b.classList.add('rl-menos'); } else SND.play('tick'); txt(); };
      (async () => { await wait(700); while (!acabou) {
        rodada++; tipos = shuffle(['mais', 'nada', 'menos']); tocou = false; const dur = Math.max(300, 700 - rodada * 12) / c.dif;
        [...g.children].forEach((b, i) => { b.classList.remove('rl-mais', 'rl-menos'); b.classList.add('open'); b.textContent = tipos[i] === 'mais' ? '+1' : tipos[i] === 'menos' ? '−1' : '·'; b.dataset.t = tipos[i]; });
        aberta = true; SND.play('flip'); await wait(dur); aberta = false;
        [...g.children].forEach(b => { b.classList.remove('open', 'rl-mais', 'rl-menos'); b.textContent = '?'; }); await wait(Math.max(160, 320 - rodada * 5) / c.dif); } })();
      return () => { acabou = true; clearInterval(tm); };
    },
    // 12. caça ao pêndulo: escuro, luz segue o dedo, 25 s
    cacapendulo(body, c, fim) {
      const cv = mk('<canvas class="mg-cv"></canvas>'); body.append(cv); const W = cv.width = Math.min(380, body.clientWidth || 360), H = cv.height = Math.min(520, (body.clientHeight || 560) - 10), g = cv.getContext('2d');
      let mx = W / 2, my = H / 2, t = 0, last = 0, raf = 0, pegos = 0, acabou = false; const moedas = [], T = 25, META = 12, R = 80;
      const mover = e => { const r = cv.getBoundingClientRect(); mx = (e.clientX - r.left) * W / r.width; my = (e.clientY - r.top) * H / r.height; }; cv.style.touchAction = 'none'; cv.addEventListener('pointermove', mover);
      cv.addEventListener('pointerdown', e => { mover(e); for (let i = moedas.length - 1; i >= 0; i--) { const o = moedas[i]; if (Math.hypot(o.x - mx, o.y - my) < R && Math.hypot(o.x - mx, o.y - my) < 26 + o.r) { moedas.splice(i, 1); pegos++; SND.play('bauCoin'); break; } } });
      const fin = () => { if (acabou) return; acabou = true; fim(pegos / META, pegos + ' pêndulos'); };
      const loop = ts => { const dt = Math.min(.05, (ts - last) / 1000 || 0); last = ts; t += dt; if (Math.random() < dt * 1.5 * c.dif) { const e = Math.floor(Math.random() * 4), x0 = e === 0 ? -12 : e === 1 ? W + 12 : Math.random() * W, y0 = e === 2 ? -12 : e === 3 ? H + 12 : Math.random() * H, ang = Math.atan2(H * (.2 + Math.random() * .6) - y0, W * (.2 + Math.random() * .6) - x0), v = (80 + Math.random() * 100) * c.dif; moedas.push({ x: x0, y: y0, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, r: 12 }); }
        g.fillStyle = '#000'; g.fillRect(0, 0, W, H); moedas.forEach(o => { o.x += o.vx * dt; o.y += o.vy * dt; }); for (let i = moedas.length - 1; i >= 0; i--) if (moedas[i].x < -40 || moedas[i].x > W + 40 || moedas[i].y < -40 || moedas[i].y > H + 40) moedas.splice(i, 1);
        g.save(); g.beginPath(); g.arc(mx, my, R, 0, 7); g.clip(); const gr = g.createRadialGradient(mx, my, 10, mx, my, R); gr.addColorStop(0, '#2b2260'); gr.addColorStop(1, '#0a0820'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
        moedas.forEach(o => { g.beginPath(); g.fillStyle = '#ff5a4f'; g.arc(o.x, o.y, o.r, 0, 7); g.fill(); g.fillStyle = '#0a0820'; g.beginPath(); g.arc(o.x, o.y, 4, 0, 7); g.fill(); }); g.restore();
        g.strokeStyle = '#ffffff44'; g.beginPath(); g.arc(mx, my, R, 0, 7); g.stroke(); g.fillStyle = '#fff'; g.font = '700 14px system-ui'; g.fillText('Pêndulos ' + pegos + '   ' + Math.max(0, Math.ceil(T - t)) + 's', 10, 20); if (t >= T) return fin(); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop); return () => { acabou = true; cancelAnimationFrame(raf); };
    },
  };

  // ---------------- minigames por série
  Object.assign(GAMES, {
    // Diário Sobrenatural: Sussurro dos Elos — tela escura, segure o dedo e ouça: quanto mais perto do Elo, mais alto (mas sutil) o som. Toque duas vezes para confirmar
    elos(body, c, fim) {
      const R = 5, LIM = Math.round(30 / c.dif), HIT = 46 / Math.max(.7, c.dif); let rodada = 0, pts = 0, acabou = false, travado = false, left = LIM, tm = 0, alvo = null, seg = false, ult = null, tap = null, last = null, rev = null;
      const cv = mk('<canvas class="mg-cv"></canvas>'); body.append(cv); const W = cv.width = Math.min(380, body.clientWidth || 360), H = cv.height = 440, g = cv.getContext('2d'), MAXD = Math.hypot(W, H) * .8;
      let ctx = null, osc = null, gn = null;
      const som = on => { try { if (on && !osc) { ctx = ctx || SND.ctx || new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); osc = ctx.createOscillator(); gn = ctx.createGain(); osc.type = 'sine'; osc.frequency.value = 170; gn.gain.value = 0; osc.connect(gn); gn.connect(ctx.destination); osc.start(); } else if (!on && osc) { gn.gain.setTargetAtTime(0, ctx.currentTime, .03); const o = osc; osc = null; setTimeout(() => { try { o.stop(); } catch (e) { } }, 160); } } catch (e) { } };
      const ajusta = p => { if (!osc) return; const cl = Math.max(0, 1 - Math.hypot(p.x - alvo.x, p.y - alvo.y) / MAXD); try { osc.frequency.setTargetAtTime(150 + cl * 70, ctx.currentTime, .05); gn.gain.setTargetAtTime(.004 + .05 * cl * cl, ctx.currentTime, .05); } catch (e) { } };
      const nova = () => { alvo = { x: 40 + Math.random() * (W - 80), y: 50 + Math.random() * (H - 100) }; left = LIM; travado = false; rev = null; tap = null; desenha(); };
      const desenha = () => { g.fillStyle = '#020108'; g.fillRect(0, 0, W, H); g.fillStyle = '#ffffff55'; g.font = '700 13px system-ui'; g.fillText('Elo ' + (rodada + 1) + '/' + R + ' · ' + left + ' s', 10, 20); g.fillStyle = '#ffffff30'; g.font = '12px system-ui'; g.fillText('segure o dedo e ouça · toque 2 vezes para confirmar', 10, H - 12);
        if (ult && seg) { g.beginPath(); g.arc(ult.x, ult.y, 10, 0, 7); g.fillStyle = '#ffffff14'; g.fill(); }
        if (rev) { g.beginPath(); g.arc(alvo.x, alvo.y, 14, 0, 7); g.strokeStyle = rev.ok ? '#7dffb0' : '#ff5a4f'; g.lineWidth = 3; g.stroke(); g.beginPath(); g.arc(alvo.x, alvo.y, HIT, 0, 7); g.lineWidth = 1; g.strokeStyle = '#ffffff44'; g.stroke(); if (rev.p) { g.beginPath(); g.arc(rev.p.x, rev.p.y, 5, 0, 7); g.fillStyle = '#fff'; g.fill(); } } };
      const confirma = async p => { if (travado || acabou) return; travado = true; som(false); const d = Math.hypot(p.x - alvo.x, p.y - alvo.y), ok = d <= HIT, v = ok ? 1 - .5 * (d / HIT) : 0; pts += v; rev = { ok, p }; SND.play(ok ? 'capture' : 'lose'); desenha(); await wait(1300); if (acabou) return; rodada++; if (rodada >= R) { acabou = true; clearInterval(tm); return fim(pts / R, Math.round(pts * 10) / 10 + ' de ' + R + ' pontos'); } nova(); };
      const pos = e => { const b = cv.getBoundingClientRect(); return { x: (e.clientX - b.left) * W / b.width, y: (e.clientY - b.top) * H / b.height }; };
      cv.style.touchAction = 'none';
      cv.onpointerdown = e => { if (travado || acabou) return; cv.setPointerCapture(e.pointerId); const p = pos(e); seg = true; ult = p; last = { t: Date.now(), p, moved: false }; som(true); ajusta(p); desenha(); };
      cv.onpointermove = e => { if (!seg || travado) return; const p = pos(e); ult = p; if (last && Math.hypot(p.x - last.p.x, p.y - last.p.y) > 12) last.moved = true; ajusta(p); desenha(); };
      cv.onpointerup = cv.onpointercancel = e => { if (!seg) return; seg = false; som(false); const now = Date.now(); if (last && !last.moved && now - last.t < 260) { if (tap && now - tap.t < 550 && Math.hypot(tap.p.x - last.p.x, tap.p.y - last.p.y) < 32) { const p = last.p; tap = null; confirma(p); } else tap = { t: now, p: last.p }; } desenha(); };
      tm = setInterval(() => { if (acabou || travado) return; left--; desenha(); if (left <= 0) { travado = true; som(false); rev = { ok: false, p: null }; desenha(); SND.play('lose'); setTimeout(async () => { if (acabou) return; rodada++; if (rodada >= R) { acabou = true; clearInterval(tm); return fim(pts / R, Math.round(pts * 10) / 10 + ' de ' + R + ' pontos'); } nova(); }, 1300); } }, 1000);
      nova(); return () => { acabou = true; clearInterval(tm); som(false); };
    },
    // Ciclo de Jesed: Resgate no Céu — pessoas caem, algumas em planadores que quebram; mova o cesto (de velocidade limitada) para salvar o máximo
    luas(body, c, fim) {
      const cv = mk('<canvas class="mg-cv"></canvas>'); body.append(cv); const W = cv.width = Math.min(380, body.clientWidth || 360), H = cv.height = 470, g = cv.getContext('2d');
      const TOTAL = 28, BW = 70, BY = H - 26, VMAX = 230 / c.dif; let bx = W / 2, alvoX = W / 2, last = 0, raf = 0, acabou = false, t = 0, nasc = 0, prox = .8, salvos = 0, perdidos = 0; const ps = [];
      const TIPOS = [['normal', .32], ['lento', .16], ['rapido', .2], ['diag', .16], ['plan', .16]];
      const sorteia = () => { let r = Math.random(), a = 0; for (const [k, p] of TIPOS) { a += p; if (r < a) return k; } return 'normal'; };
      const nova = () => { const k = sorteia(), p = { k, x: 24 + Math.random() * (W - 48), y: -16, vx: 0, vy: 95, plan: false, quebra: 0, ok: true };
        if (k === 'lento') p.vy = 48 + Math.random() * 22; else if (k === 'rapido') p.vy = 190 + Math.random() * 60; else if (k === 'normal') p.vy = 85 + Math.random() * 50;
        else if (k === 'diag') { p.vy = 95 + Math.random() * 40; p.vx = (Math.random() < .5 ? -1 : 1) * (55 + Math.random() * 45); p.x = p.vx > 0 ? 20 + Math.random() * (W * .4) : W - 20 - Math.random() * (W * .4); }
        else { const d = Math.random() < .5 ? 1 : -1; p.plan = true; p.y = 50 + Math.random() * 90; p.x = d > 0 ? -16 : W + 16; p.vx = d * (105 + Math.random() * 40); p.vy = 8; p.quebra = 1.2 + Math.random() * 1.4; p.sx = p.x; }
        ps.push(p); nasc++; };
      cv.style.touchAction = 'none';
      const mv = e => { const b = cv.getBoundingClientRect(); alvoX = (e.clientX - b.left) * W / b.width; };
      cv.onpointerdown = e => { cv.setPointerCapture(e.pointerId); mv(e); }; cv.onpointermove = e => { if (e.buttons || e.pointerType === 'touch') mv(e); };
      const fimJogo = () => { if (acabou) return; acabou = true; cancelAnimationFrame(raf); fim(salvos / TOTAL, salvos + ' de ' + TOTAL + ' salvos'); };
      const loop = ts => { if (acabou) return; const dt = Math.min(.05, (ts - (last || ts)) / 1000); last = ts; t += dt;
        const d = alvoX - bx, mvx = Math.max(-VMAX * dt, Math.min(VMAX * dt, d)); bx = Math.max(BW / 2, Math.min(W - BW / 2, bx + mvx));
        if (nasc < TOTAL) { prox -= dt; if (prox <= 0) { nova(); const gap = Math.max(.42, 1.35 - nasc * .035) / Math.sqrt(c.dif); prox = gap * (.7 + Math.random() * .6); if (nasc > 12 && Math.random() < .3) { nova(); } } }
        for (let i = ps.length - 1; i >= 0; i--) { const p = ps[i];
          if (p.plan) { p.x += p.vx * dt; p.y += p.vy * dt; p.quebra -= dt; if (p.quebra <= 0 && p.x > 30 && p.x < W - 30) { p.plan = false; p.vx *= .15; p.vy = 150; p.parte = .4; SND.play('lose'); } else if (p.x < -60 || p.x > W + 60) { ps.splice(i, 1); perdidos++; continue; } }
          else { p.x += p.vx * dt; p.y += p.vy * dt; if (p.parte > 0) p.parte -= dt; if (p.k === 'diag' && (p.x < 14 || p.x > W - 14)) p.vx *= -1; if (!p.plan && p.k === 'plan') p.vy = Math.min(190, p.vy + 120 * dt); }
          if (!p.plan && p.y >= BY - 10 && p.y <= BY + 14 && Math.abs(p.x - bx) < BW / 2 + 6 && p.vy > 0) { ps.splice(i, 1); salvos++; SND.play('capture'); continue; }
          if (p.y > H + 10) { ps.splice(i, 1); perdidos++; SND.play('tick'); } }
        g.fillStyle = '#0a0820'; g.fillRect(0, 0, W, H); g.fillStyle = '#1c1650'; g.fillRect(0, H - 10, W, 10);
        ps.forEach(p => { g.save(); g.translate(p.x, p.y); g.fillStyle = '#ffd9b0'; g.beginPath(); g.arc(0, -8, 5, 0, 7); g.fill(); g.strokeStyle = '#e8e2ff'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, -3); g.lineTo(0, 8); g.moveTo(-6, 0); g.lineTo(6, p.plan ? 0 : -6); g.moveTo(0, 8); g.lineTo(-4, 15); g.moveTo(0, 8); g.lineTo(4, 15); g.stroke();
          if (p.plan) { g.strokeStyle = '#7dffb0'; g.lineWidth = 4; g.beginPath(); g.moveTo(-22, -14); g.lineTo(22, -14); g.stroke(); } else if (p.k === 'plan' && p.parte > 0) { g.strokeStyle = '#ff5a4f'; g.lineWidth = 3; g.beginPath(); g.moveTo(-16, -18); g.lineTo(-6, -12); g.moveTo(16, -22); g.lineTo(8, -14); g.stroke(); }
          if (!p.plan && p.k === 'rapido') { g.strokeStyle = '#ff8a5c'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-3, -22); g.lineTo(-3, -34); g.moveTo(3, -22); g.lineTo(3, -34); g.stroke(); } g.restore(); });
        g.fillStyle = '#c58cff'; g.fillRect(bx - BW / 2, BY, BW, 12); g.fillStyle = '#8f5cff'; g.fillRect(bx - BW / 2 - 3, BY - 8, 6, 20); g.fillRect(bx + BW / 2 - 3, BY - 8, 6, 20);
        g.fillStyle = '#fff'; g.font = '700 14px system-ui'; g.fillText('Salvos ' + salvos + ' / ' + TOTAL, 10, 20); g.fillText('Perdidos ' + perdidos, W - 100, 20);
        if (nasc >= TOTAL && !ps.length) return fimJogo(); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop); return () => { acabou = true; cancelAnimationFrame(raf); };
    },
    // Viajantes: Cores dos Irmãos — leve cada irmão (bolinha no centro) a um objeto da cor dele, nos dois lados; 5 rodadas, quanto mais rápido melhor
    poderes(body, c, fim) {
      const IR = [{ n: 'Breno', c: '#4aa3ff' }, { n: 'Bruno', c: '#b9bcc9' }, { n: 'Banjo', c: '#5dff9a' }, { n: 'Beatriz', c: '#ff4f5e' }];
      const cv = mk('<canvas class="mg-cv"></canvas>'); body.append(cv); const W = cv.width = Math.min(380, body.clientWidth || 360), H = cv.height = 440, g = cv.getContext('2d');
      const RODS = 5, LIM = 22 / c.dif, FAST = 6.5, YS = [70, 150, 230, 310].map(y => y + 25);
      let rod = 0, itens = [], bolas = [], drag = null, t0 = 0, raf = 0, acabou = false, soma = 0, pausa = 0, msg = '', feitas = 0; const tempos = [];
      const nova = () => { itens = []; ['E', 'D'].forEach(lado => shuffle([0, 1, 2, 3]).forEach((ir, i) => itens.push({ x: lado === 'E' ? 38 : W - 38, y: YS[i], ir, ok: false })));
        const pos = shuffle([[-34, -34], [34, -34], [-34, 34], [34, 34]]); bolas = IR.map((x, i) => ({ ir: i, hx: W / 2 + pos[i][0], hy: H / 2 + pos[i][1], x: W / 2 + pos[i][0], y: H / 2 + pos[i][1], feita: false })); drag = null; feitas = 0; t0 = performance.now(); };
      const pos = e => { const b = cv.getBoundingClientRect(); return { x: (e.clientX - b.left) * W / b.width, y: (e.clientY - b.top) * H / b.height }; };
      cv.style.touchAction = 'none';
      cv.onpointerdown = e => { if (pausa > 0) return; const p = pos(e); let m = null, d = 1e9; bolas.forEach(b => { const dd = Math.hypot(b.x - p.x, b.y - p.y); if (!b.feita && dd < 30 && dd < d) { d = dd; m = b; } }); if (m) { drag = m; cv.setPointerCapture(e.pointerId); } };
      cv.onpointermove = e => { if (!drag) return; const p = pos(e); drag.x = Math.max(14, Math.min(W - 14, p.x)); drag.y = Math.max(14, Math.min(H - 14, p.y)); };
      cv.onpointerup = cv.onpointercancel = () => { if (!drag) return; const b = drag; drag = null; const it = itens.find(i => !i.ok && Math.hypot(i.x - b.x, i.y - b.y) < 34);
        if (it && it.ir === b.ir) { it.ok = true; b.feita = true; b.x = it.x; b.y = it.y; feitas++; SND.play('tick'); } else { if (it) SND.play('lose'); b.x = b.hx; b.y = b.hy; }
        if (feitas === 4) { const s = (performance.now() - t0) / 1000; fecha(s); } };
      const fecha = s => { tempos.push(s); soma += Math.max(0, Math.min(1, 1 - (s - FAST) / (LIM - FAST))); pausa = .8; msg = s.toFixed(1) + ' s'; SND.play('capture'); };
      const fimJogo = () => { if (acabou) return; acabou = true; cancelAnimationFrame(raf); fim(soma / RODS, tempos.map(x => x.toFixed(1) + 's').join(' · ')); };
      let last = 0; const loop = ts => { if (acabou) return; const dt = Math.min(.05, (ts - (last || ts)) / 1000); last = ts;
        if (pausa > 0) { pausa -= dt; if (pausa <= 0) { rod++; if (rod >= RODS) return fimJogo(); nova(); } }
        else if ((performance.now() - t0) / 1000 > LIM) { tempos.push(LIM); pausa = .8; msg = 'Tempo!'; SND.play('lose'); }
        g.fillStyle = '#0a0820'; g.fillRect(0, 0, W, H);
        itens.forEach(i => { g.beginPath(); g.arc(i.x, i.y, 22, 0, 7); g.fillStyle = IR[i.ir].c + (i.ok ? '55' : ''); g.fill(); g.strokeStyle = '#ffffff55'; g.lineWidth = 2; g.stroke(); });
        bolas.forEach(b => { g.beginPath(); g.arc(b.x, b.y, 15, 0, 7); g.fillStyle = IR[b.ir].c; g.shadowColor = IR[b.ir].c; g.shadowBlur = b === drag ? 18 : 6; g.fill(); g.shadowBlur = 0; });
        g.fillStyle = '#fff'; g.font = '700 14px system-ui'; g.fillText('Rodada ' + Math.min(rod + 1, RODS) + '/' + RODS + ' · ' + Math.max(0, LIM - (performance.now() - t0) / 1000).toFixed(0) + ' s', 10, 20);
        if (pausa > 0) { g.font = '800 24px system-ui'; g.textAlign = 'center'; g.fillText(msg, W / 2, H / 2 + 6); g.textAlign = 'left'; }
        raf = requestAnimationFrame(loop); };
      nova(); raf = requestAnimationFrame(loop); return () => { acabou = true; cancelAnimationFrame(raf); };
    },
    // Spacetheft: símbolos espaciais em 8 quadrados; caveira tira ponto (25 s)
    gancho(body, c, fim) {
      const BOM = ['✦', '◍', '⬢', '✺'], T = 25, META = 24; let pts = 0, left = T, tm = null, sp = null, acabou = false;
      body.innerHTML = `<p class="mg-q" id="mq"></p><div class="mg-grid g4" id="sg"></div>`; const g = $('#sg', body), q = $('#mq', body);
      for (let i = 0; i < 8; i++) g.append(mk(`<button class="mg-cell sim" data-i="${i}" style="width:78px;height:78px"></button>`));
      const mostra = () => { if (acabou) return; [...g.children].forEach(b => { b.textContent = ''; b.dataset.k = ''; b.style.color = ''; }); const cav = new Set(shuffle([0, 1, 2, 3, 4, 5, 6, 7]).slice(0, 3 + rnd(3))); [0, 1, 2, 3, 4, 5, 6, 7].forEach(i => { const caveira = cav.has(i), b = g.children[i]; b.textContent = caveira ? '☠' : pick(BOM); b.dataset.k = caveira ? 'x' : 'o'; b.style.color = caveira ? '#ff5a4f' : '#ffd25f'; });
        clearTimeout(sp); sp = setTimeout(mostra, 1100 / c.dif); };
      const pinta = () => { q.innerHTML = `Pontos <b>${pts}</b>/${META} · ${left}s<br><small>Toque nos símbolos; evite as caveiras</small>`; };
      g.onclick = e => { const b = e.target.closest('.sim'); if (!b || acabou || !b.dataset.k) return; if (b.dataset.k === 'o') { pts++; SND.play('tick'); } else { pts = Math.max(0, pts - 2); SND.play('lose'); } b.dataset.k = ''; b.textContent = ''; pinta(); };
      const fimJ = () => { acabou = true; clearInterval(tm); clearTimeout(sp); fim(pts / META, pts + ' pontos'); };
      tm = setInterval(() => { left--; pinta(); if (left <= 0) fimJ(); }, 1000); pinta(); mostra();
      return () => { acabou = true; clearInterval(tm); clearTimeout(sp); };
    },
    // Mistério Oculto: olhos que se abrem no escuro; feche-os antes que ataquem (36 olhos, 3 corações)
    culpado(body, c, fim) {
      const N = 36, SPOTS = 12; let vidas = 3, nasc = 0, fechados = 0, perdidos = 0, tm = null, prox = 600, acabou = false; const olhos = Array.from({ length: SPOTS }, () => null); const t0 = Date.now();
      body.innerHTML = `<p class="mg-q" id="mq"></p><div class="mg-olhos">${Array.from({ length: SPOTS }, (_, i) => `<button class="mg-olho" data-i="${i}" aria-label="olho"><i></i></button>`).join('')}</div>`; const q = $('#mq', body), g = $('.mg-olhos', body);
      const pinta = () => { q.innerHTML = `${'♥'.repeat(vidas)}<span style="opacity:.3">${'♥'.repeat(3 - vidas)}</span> · olhos ${Math.min(nasc, N)}/${N}`; };
      const ate = () => nasc / (N - 1);
      const fecha = (i, ataque) => { const b = g.children[i]; b.className = 'mg-olho'; olhos[i] = null; if (ataque) { perdidos++; vidas--; SND.play('lose'); g.classList.add('hit'); setTimeout(() => g.classList.remove('hit'), 250); } else { fechados++; SND.play('flip'); } pinta();
        if (vidas <= 0) return fimJ(); if (nasc >= N && !olhos.some(Boolean)) fimJ(); };
      const fimJ = () => { if (acabou) return; acabou = true; clearInterval(tm); const morreu = vidas <= 0, pct = morreu ? Math.min(.7, fechados / N) : 1 - perdidos / N; fim(pct, morreu ? 'Os olhos venceram (' + fechados + ' fechados)' : fechados + ' de ' + N + ' olhos fechados'); };
      g.onclick = e => { const b = e.target.closest('.mg-olho'); if (!b || acabou) return; const i = +b.dataset.i; if (olhos[i]) fecha(i, false); };
      tm = setInterval(() => { if (acabou) return; const agora = Date.now() - t0;
        if (nasc < N && agora >= prox) { const livres = olhos.map((o, i) => o ? -1 : i).filter(i => i >= 0); if (livres.length) { const i = pick(livres); const life = (3000 - 1300 * ate()) / c.dif; olhos[i] = { ini: agora, life }; g.children[i].className = 'mg-olho on'; nasc++; pinta(); prox = agora + (1250 - 650 * ate()) / c.dif; } else prox = agora + 150; }
        olhos.forEach((o, i) => { if (!o) return; const f = (agora - o.ini) / o.life, b = g.children[i]; if (f >= 1) return fecha(i, true); b.classList.toggle('tre', f > .4); b.classList.toggle('red', f > .7); });
        if (nasc >= N && !olhos.some(Boolean)) fimJ(); }, 50);
      pinta(); return () => { acabou = true; clearInterval(tm); };
    },
    // Édelin Lys: ritmo de três elementos (20 notas)
    ritmo(body, c, fim) {
      const cv = mk('<canvas class="mg-cv"></canvas>'); body.append(cv); const W = cv.width = Math.min(380, body.clientWidth || 360), H = cv.height = 400, g = cv.getContext('2d');
      const COR = ['#5fb0ff', '#ff6a5c', '#e8f4ff'], NOME = ['Mar', 'Fogo', 'Gelo'], N = 20, GAP = .62 / Math.sqrt(c.dif), FALL = 1.5 / c.dif, LY = H - 70, JAN = .13 * (1.1 / c.dif);
      const notas = Array.from({ length: N }, (_, i) => ({ t: 1.5 + i * GAP + (i % 3 === 2 ? GAP * .3 : 0), l: rnd(3), est: 0 })); let t0 = 0, raf = 0, hit = 0, msg = '', msgT = 0, acabou = false;
      const bar = mk('<div class="mg-btns">' + NOME.map((n, i) => `<button class="btn" data-l="${i}" style="border-color:${COR[i]}">${n}</button>`).join('') + '</div>'); body.append(bar);
      const toque = l => { const now = (performance.now() - t0) / 1000; let best = null; notas.forEach(n => { if (n.est === 0 && n.l === l && Math.abs(n.t - now) < JAN * 2 && (!best || Math.abs(n.t - now) < Math.abs(best.t - now))) best = n; });
        if (best) { const ex = Math.abs(best.t - now) < JAN; best.est = ex ? 1 : 2; if (ex) hit++; else hit += .5; msg = ex ? 'Perfeito' : 'Bom'; SND.play('tick'); } else { msg = 'Errou'; SND.play('lose'); } msgT = .5; };
      bar.onclick = e => { const b = e.target.closest('[data-l]'); if (b) toque(+b.dataset.l); }; const key = e => { const k = { a: 0, s: 1, d: 2, 1: 0, 2: 1, 3: 2 }[e.key]; if (k != null) toque(k); }; document.addEventListener('keydown', key);
      const loop = () => { const now = (performance.now() - t0) / 1000; g.fillStyle = '#05030f'; g.fillRect(0, 0, W, H); const lw = W / 3;
        for (let l = 0; l < 3; l++) { g.fillStyle = COR[l] + '14'; g.fillRect(l * lw, 0, lw - 2, H); }
        g.strokeStyle = '#fff'; g.beginPath(); g.moveTo(0, LY); g.lineTo(W, LY); g.stroke();
        notas.forEach(n => { if (n.est) return; const y = LY - (n.t - now) / FALL * (LY - 10); if (y > H + 20 && now > n.t + JAN * 2) { n.est = 3; msg = 'Perdeu'; msgT = .4; return; } if (y < -20) return; g.fillStyle = COR[n.l]; g.beginPath(); g.arc(n.l * lw + lw / 2, y, 16, 0, 7); g.fill(); });
        g.fillStyle = '#fff'; g.font = '700 14px system-ui'; g.fillText('Acertos ' + Math.floor(hit) + '/' + N, 10, 20); if (msgT > 0) { msgT -= .016; g.font = '800 22px system-ui'; g.textAlign = 'center'; g.fillText(msg, W / 2, 50); g.textAlign = 'left'; }
        if (now > notas[N - 1].t + 1 && !acabou) { acabou = true; fim(hit / N, Math.floor(hit) + ' de ' + N + ' notas'); } raf = requestAnimationFrame(loop); };
      t0 = performance.now(); raf = requestAnimationFrame(loop); return () => { acabou = true; cancelAnimationFrame(raf); document.removeEventListener('keydown', key); };
    },
    // A União: escolha 3 heróis para cobrir o desafio (3 casos)
    formacao(body, c, fim) {
      const UN = CARTAS().filter(x => x.uniao).map(x => x.id), AT = ['pod', 'def', 'int', 'vel']; let caso = 0, ok = 0, tm = null; const N = 3;
      const tela = () => { const cand = shuffle(UN).slice(0, 6), combos = []; for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) for (let k = j + 1; k < 6; k++) combos.push([cand[i], cand[j], cand[k]]);
        const sum = (cs, a) => cs.reduce((t, id) => t + U.CARDS[id].stats[a], 0), alvo = pick(combos), a1 = pick(AT), a2 = pick(AT.filter(x => x !== a1)), r1 = Math.round(sum(alvo, a1) * (.93 / Math.sqrt(c.dif))), r2 = Math.round(sum(alvo, a2) * (.93 / Math.sqrt(c.dif)));
        let esc = [], left = Math.round(40 / c.dif);
        const pinta = () => { body.innerHTML = `<p class="mg-q">Desafio ${caso + 1}/${N} · <span id="tl">${left}</span>s<br>Some <b>${NA(a1)} ≥ ${r1}</b> e <b>${NA(a2)} ≥ ${r2}</b> com 3 heróis</p><div class="mg-grid g3">${cand.map(id => `<button class="mg-cell ${esc.includes(id) ? 'ok' : ''}" data-id="${id}" style="padding:2px"></button>`).join('')}</div>
          <p class="mg-q" id="so">${NA(a1)}: ${sum(esc, a1)} · ${NA(a2)}: ${sum(esc, a2)}</p><button class="btn primary" data-a="ok" ${esc.length === 3 ? '' : 'disabled'}>Confirmar</button>`; $$all('.mg-cell', body).forEach(b => b.append(card(b.dataset.id, 86))); };
        const $$all = (s, r) => Array.from((r || document).querySelectorAll(s));
        body.onclick = async e => { const b = e.target.closest('[data-id],[data-a]'); if (!b) return; if (b.dataset.id) { const id = b.dataset.id; esc = esc.includes(id) ? esc.filter(x => x !== id) : esc.length < 3 ? esc.concat(id) : esc; SND.play('tick'); pinta(); }
          else if (b.dataset.a === 'ok' && esc.length === 3) { if (sum(esc, a1) >= r1 && sum(esc, a2) >= r2) { clearInterval(tm); ok++; SND.play('win'); await wait(800); caso++; if (caso >= N) return fim(ok / N, ok + ' de ' + N + ' desafios'); tela(); } else { SND.play('lose'); esc = []; pinta(); } } };
        pinta(); clearInterval(tm); tm = setInterval(() => { left--; const t = $('#tl', body); if (t) t.textContent = left; if (left <= 0) { clearInterval(tm); caso++; if (caso >= N) fim(ok / N, ok + ' de ' + N + ' desafios'); else tela(); } }, 1000); };
      tela(); return () => clearInterval(tm);
    },
  });

  function stats() {   // para o admin: por minigame
    const L = log(), o = {}; LISTA.forEach(m => { o[m.id] = { n: 0, pct: 0, t: [0, 0, 0, 0], rw: 0, ms: 0 }; });
    L.forEach(r => { const s = o[r.id]; if (!s) return; s.n++; s.pct += r.pct; s.t[r.tier]++; s.rw += r.reward; s.ms += r.ms || 0; }); return o;
  }
  window.DSMini = { LISTA, play, cfg, setCfg, stats, resetLog: () => wr(LOG_KEY, []), resetCfg: () => wr(CFG_KEY, {}), tierOf };
})();
