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
    { id: 'maiormenor', nome: 'Maior ou menor', desc: 'Adivinhe se a próxima carta tem o atributo maior ou menor.', cortes: [.37, .63, .88] },
    { id: 'memoria', nome: 'Memória estelar', desc: 'Encontre os 6 pares de cartas com o menor número de jogadas.', cortes: [.3, .6, .9] },
    { id: 'quemequem', nome: 'Quem é quem', desc: 'Descubra o personagem pela silhueta.', cortes: [.37, .63, .88] },
    { id: 'ordem', nome: 'Monte a ordem', desc: 'Toque nas cartas da mais fraca para a mais forte no atributo pedido.', cortes: [.4, .7, .95] },
    { id: 'mineracao', nome: 'Mineração de Gerbe', desc: 'Toque quando a agulha estiver na zona verde. Erros acordam a Besta.', cortes: [.37, .63, .88] },
    { id: 'asteroides', nome: 'Campo de asteroides', desc: 'Arraste a nave, desvie das rochas e pegue os pêndulos.', cortes: [.33, .6, .87] },
    { id: 'cofre', nome: 'Cofre de Jasmey', desc: 'Descubra o código de 4 símbolos em 6 tentativas.', cortes: [.34, .5, .83] },
    { id: 'caracoroa', nome: 'Cara ou coroa', desc: 'Acerte até 3 vezes seguidas. Pare quando quiser e leve o prêmio.', cortes: [.3, .6, .95] },
    { id: 'raspadinha', nome: 'Raspadinha estelar', desc: 'Raspe 3 quadrados e torça por símbolos iguais.', cortes: [.3, .6, .95] },
    { id: 'cacapendulo', nome: 'Caça ao pêndulo', desc: 'No escuro, toque nos pêndulos que passam sob a luz.', cortes: [.33, .6, .87] },
    // um por série de livros
    { id: 'elos', nome: 'Elos das Sombras', serie: 'Diário Sobrenatural', desc: 'Os seis Elos acendem em sequência: repita a ordem.', cortes: [.4, .7, 1] },
    { id: 'luas', nome: 'Duas luas', serie: 'Ciclo de Jesed', desc: 'Toque quando as duas luas de Jesed estiverem alinhadas.', cortes: [.35, .65, .9] },
    { id: 'poderes', nome: 'Poderes dos Lins', serie: 'Viajantes Dimensionais', desc: 'Cada obstáculo pede o poder certo de um dos irmãos.', cortes: [.4, .7, .9] },
    { id: 'gancho', nome: 'Gancho de abordagem', serie: 'Spacetheft', desc: 'Lance o gancho adiantado: a nave pirata não para.', cortes: [.34, .67, .84] },
    { id: 'culpado', nome: 'Quem é o culpado?', serie: 'Mistério Oculto', desc: 'Use as pistas para descobrir o culpado. 3 casos.', cortes: [.34, .67, .99] },
    { id: 'ritmo', nome: 'Mar, fogo e gelo', serie: 'Édelin Lys', desc: 'Toque nas notas quando chegarem à linha, na pista do elemento.', cortes: [.4, .7, .9] },
    { id: 'formacao', nome: 'Formação da União', serie: 'A União', desc: 'Escolha 3 heróis cujos atributos somados cubram o desafio.', cortes: [.34, .67, .99] },
  ];
  const BYID = {}; LISTA.forEach(m => { BYID[m.id] = m; });
  const cfgAll = () => rd(CFG_KEY, {});
  function cfg(id) { const c = cfgAll()[id] || {}, m = BYID[id]; return { dif: c.dif || DEF.dif, cortes: c.cortes || m.cortes || DEF.cortes, premios: c.premios || DEF.premios }; }
  function setCfg(id, patch) { const a = cfgAll(); a[id] = Object.assign({}, a[id] || {}, patch); wr(CFG_KEY, a); }
  const log = () => rd(LOG_KEY, []);
  const tierOf = (id, pct) => { const c = cfg(id).cortes; return pct >= c[2] ? 3 : pct >= c[1] ? 2 : pct >= c[0] ? 1 : 0; };

  // ---- casca comum: tela cheia, título, sair, resultado
  function shell(m) {
    const ov = mk(`<div class="mg"><header><b>${m.nome}</b><span class="mg-hint">${m.desc}</span><button class="ibtn mg-x" aria-label="Sair">✕</button></header><div class="mg-body"></div></div>`);
    document.body.appendChild(ov); return ov;
  }
  async function play(id, opts) {
    opts = opts || {}; const m = BYID[id], c = cfg(id); if (!m) return null; try { SND.init(); } catch (e) { }
    const ov = shell(m), body = $('.mg-body', ov); let ended = false, stop = () => { }, res; const t0 = Date.now();
    const out = await new Promise(resolve => {
      const fim = (pct, detail) => { if (ended) return; ended = true; stop(); pct = Math.max(0, Math.min(1, pct)); const tier = tierOf(id, pct), reward = c.premios[tier] | 0; res = { id, pct: +pct.toFixed(3), tier, reward, detail: detail || '', ms: Date.now() - t0 };
        body.innerHTML = `<div class="mg-res t${tier}"><div class="mg-tier">${['Sem prêmio', 'Bom', 'Ótimo', 'Perfeito'][tier]}</div><div class="mg-pct">${Math.round(pct * 100)}%</div><div class="mg-det">${detail || ''}</div><div class="mg-rw">${reward > 0 ? '+' + reward + ' pêndulos' : 'Nenhum pêndulo'}</div><button class="btn primary mg-ok">Continuar</button></div>`;
        try { SND.play(tier ? (tier === 3 ? 'bauOpen' : 'bauCoin') : 'lose'); } catch (e) { }
        const L = log(); L.push({ id, pct: res.pct, tier, reward, ms: res.ms, t: Date.now(), teste: !!opts.teste }); wr(LOG_KEY, L.slice(-500));
        $('.mg-ok', ov).onclick = () => { try { SND.play('click'); } catch (e) { } resolve(res); };
      };
      $('.mg-x', ov).onclick = () => { if (ended) { resolve(res); return; } fim(0, 'Abandonado'); };
      try { stop = GAMES[id](body, c, fim) || (() => { }); } catch (e) { console.error(e); fim(0, 'Erro'); }
    });
    ov.remove(); opts.onEnd && opts.onEnd(out); return out;
  }

  // ---- utilitários de carta
  const card = (id, cw) => U.cardEl(id, { up: true, noanim: true, cw: cw || 96 });
  const hidden = cw => U.cardEl('?', { noanim: true, cw: cw || 96 });
  const randCards = n => shuffle(CARTAS()).slice(0, n).map(c => c.id);

  const GAMES = {
    // 1. maior ou menor: 8 rodadas
    maiormenor(body, c, fim) {
      let n = 0, ok = 0, cur = randCards(1)[0], busy = false; const N = 8;
      const draw = () => { const a = pick(['pod', 'def', 'int', 'vel']); body.innerHTML = `<div class="mg-row"><div class="mg-c" id="mA"></div><div class="mg-c" id="mB"></div></div><p class="mg-q">Rodada ${n + 1}/${N} · Acertos ${ok}<br>A próxima carta tem <b>${NA(a)}</b>…</p><div class="mg-btns"><button class="btn" data-v="m">Maior</button><button class="btn" data-v="n">Menor</button></div>`;
        $('#mA', body).append(card(cur)); $('#mB', body).append(hidden()); busy = false;
        body.onclick = async e => { const b = e.target.closest('[data-v]'); if (!b || busy) return; busy = true;
          let nx; do { nx = randCards(1)[0]; } while (nx === cur || U.CARDS[nx].stats[a] === U.CARDS[cur].stats[a]);
          $('#mB', body).replaceChildren(card(nx)); const maior = U.CARDS[nx].stats[a] > U.CARDS[cur].stats[a], acertou = (b.dataset.v === 'm') === maior; if (acertou) ok++; SND.play(acertou ? 'win' : 'lose');
          await wait(900); n++; cur = nx; if (n >= N) fim(ok / N, ok + ' de ' + N + ' acertos'); else draw(); };
      };
      draw();
    },
    // 2. memória: 6 pares
    memoria(body, c, fim) {
      const P = 6, ids = randCards(P), deck = shuffle(ids.concat(ids)); let open = [], moves = 0, found = 0, lock = false;
      body.innerHTML = `<p class="mg-q" id="mq">Jogadas: 0</p><div class="mg-grid g4"></div>`; const g = $('.mg-grid', body);
      deck.forEach((id, i) => { const b = mk('<button class="mg-cell" aria-label="carta"></button>'); b.dataset.i = i; b.append(hidden(66)); g.append(b); });
      g.onclick = async e => { const b = e.target.closest('.mg-cell'); if (!b || lock || b.classList.contains('on') || b.classList.contains('ok')) return; const i = +b.dataset.i;
        b.classList.add('on'); b.replaceChildren(card(deck[i], 66)); SND.play('flip'); open.push(i);
        if (open.length === 2) { lock = true; moves++; $('#mq', body).textContent = 'Jogadas: ' + moves; const [x, y] = open; const cx = g.children[x], cy = g.children[y];
          await wait(750); if (deck[x] === deck[y]) { cx.classList.add('ok'); cy.classList.add('ok'); found++; SND.play('capture'); } else { [cx, cy].forEach(z => { z.classList.remove('on'); z.replaceChildren(hidden(66)); }); }
          open = []; lock = false; if (found === P) fim(1 - (moves - P) / (14 / c.dif), moves + ' jogadas (mínimo ' + P + ')'); } };
    },
    // 3. quem é quem: 8 perguntas, 10 s cada
    quemequem(body, c, fim) {
      const N = 8; let n = 0, ok = 0, tm = null, left = 0, done = false;
      const q = () => { const cs = randCards(4), alvo = cs[0], opts = shuffle(cs); left = Math.round(10 / c.dif);
        body.innerHTML = `<p class="mg-q" id="mq">Pergunta ${n + 1}/${N} · <span id="tl">${left}</span>s</p><div class="mg-c" id="mA"></div><div class="mg-btns col">${opts.map(o => `<button class="btn" data-id="${o}">${U.CARDS[o].nome}</button>`).join('')}</div>`;
        const ce = card(alvo, 150); ce.style.filter = 'brightness(0)'; ce.style.transition = 'filter .5s'; $('#mA', body).append(ce); done = false;
        const resp = async id => { if (done) return; done = true; clearInterval(tm); ce.style.filter = ''; const certo = id === alvo; if (certo) ok++; SND.play(certo ? 'win' : 'lose'); await wait(1100); n++; if (n >= N) fim(ok / N, ok + ' de ' + N + ' acertos'); else q(); };
        body.onclick = e => { const b = e.target.closest('[data-id]'); if (b) resp(b.dataset.id); };
        clearInterval(tm); tm = setInterval(() => { left--; const t = $('#tl', body); if (t) t.textContent = left; if (left <= 0) resp(null); }, 1000); };
      q(); return () => clearInterval(tm);
    },
    // 4. monte a ordem: 3 rodadas de 5 cartas
    ordem(body, c, fim) {
      let rodada = 0, pts = 0, tm = null; const R = 3;
      const go = () => { const a = pick(['pod', 'def', 'int', 'vel']); let cs; do { cs = randCards(5); } while (new Set(cs.map(i => U.CARDS[i].stats[a])).size < 5);
        const certo = cs.slice().sort((x, y) => U.CARDS[x].stats[a] - U.CARDS[y].stats[a]); let prox = 0, erros = 0, left = Math.round(18 / c.dif);
        body.innerHTML = `<p class="mg-q">Rodada ${rodada + 1}/${R} · <span id="tl">${left}</span>s<br>Do <b>menor</b> ao <b>maior</b> em <b>${NA(a)}</b></p><div class="mg-grid g5"></div>`; const g = $('.mg-grid', body);
        shuffle(cs).forEach(id => { const b = mk('<button class="mg-cell"></button>'); b.dataset.id = id; b.append(card(id, 98)); g.append(b); });
        const fecha = async () => { clearInterval(tm); pts += Math.max(0, 1 - .34 * erros) * (prox === 5 ? 1 : prox / 5 * .5); await wait(600); rodada++; if (rodada >= R) fim(pts / R, 'Erros e tempo contam'); else go(); };
        g.onclick = e => { const b = e.target.closest('.mg-cell'); if (!b || b.classList.contains('ok')) return; if (b.dataset.id === certo[prox]) { b.classList.add('ok'); prox++; SND.play('tick'); if (prox === 5) fecha(); } else { erros++; b.classList.add('err'); setTimeout(() => b.classList.remove('err'), 350); SND.play('lose'); } };
        clearInterval(tm); tm = setInterval(() => { left--; const t = $('#tl', body); if (t) t.textContent = left; if (left <= 0) fecha(); }, 1000); };
      go(); return () => clearInterval(tm);
    },
    // 5. mineração: agulha vai e volta; zona verde; 8 golpes; perigo
    mineracao(body, c, fim) {
      const N = 8; let golpes = 0, bons = 0, perigo = 0, pos = 0, dir = 1, zona = .5, raf = 0, last = 0, lock = false; const w = () => .26 / c.dif;
      body.innerHTML = `<p class="mg-q" id="mq"></p><div class="mg-bar"><i class="z"></i><i class="p"></i></div><div class="mg-dang"><b></b></div><button class="btn primary big mg-hit">Quebrar!</button>`;
      const z = $('.z', body), p = $('.p', body), db = $('.mg-dang b', body), q = $('#mq', body);
      const nova = () => { zona = .15 + Math.random() * .7; z.style.left = (zona - w() / 2) * 100 + '%'; z.style.width = w() * 100 + '%'; q.innerHTML = `Golpe ${golpes + 1}/${N} · Cristais ${bons}<br>Perigo da Besta: ${perigo}%`; db.style.width = perigo + '%'; };
      const loop = t => { const dt = Math.min(.05, (t - last) / 1000 || 0); last = t; pos += dir * dt * (.85 + golpes * .08) * c.dif; if (pos > 1) { pos = 1; dir = -1; } if (pos < 0) { pos = 0; dir = 1; } p.style.left = pos * 100 + '%'; raf = requestAnimationFrame(loop); };
      $('.mg-hit', body).onclick = async () => { if (lock) return; lock = true; const bom = Math.abs(pos - zona) <= w() / 2; golpes++; if (bom) { bons++; SND.play('capture'); p.classList.add('hit'); } else { perigo += 25; SND.play('lose'); p.classList.add('miss'); }
        await wait(450); p.classList.remove('hit', 'miss'); lock = false; if (perigo >= 100) return fim(bons / N, 'A Besta acordou! ' + bons + ' cristais'); if (golpes >= N) return fim(bons / N, bons + ' de ' + N + ' cristais'); nova(); };
      nova(); raf = requestAnimationFrame(loop); return () => cancelAnimationFrame(raf);
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
      const SYM = ['●', '▲', '■', '◆', '★', '✚'], COR = ['#ff8a5c', '#6cc6ff', '#c58cff', '#7dffb0', '#ffd25f', '#ff7ab0'], codigo = Array.from({ length: 4 }, () => rnd(6)); let tent = [], atual = [];
      const pinta = () => { body.innerHTML = `<p class="mg-q">Tentativa ${tent.length + 1}/6</p><div class="mg-hist">${tent.map(t => `<div class="mg-linha">${t.g.map(s => `<i style="color:${COR[s]}">${SYM[s]}</i>`).join('')}<span>${'●'.repeat(t.p)}<em>${'○'.repeat(t.q)}</em></span></div>`).join('')}</div>
        <div class="mg-linha cur">${[0, 1, 2, 3].map(i => `<i data-i="${i}" style="color:${atual[i] != null ? COR[atual[i]] : '#888'}">${atual[i] != null ? SYM[atual[i]] : '_'}</i>`).join('')}</div>
        <div class="mg-btns">${SYM.map((s, i) => `<button class="btn" data-s="${i}" style="color:${COR[i]}">${s}</button>`).join('')}</div><div class="mg-btns"><button class="btn" data-a="del">Apagar</button><button class="btn primary" data-a="ok" ${atual.length === 4 ? '' : 'disabled'}>Testar</button></div><p class="hint">● lugar certo · ○ símbolo certo no lugar errado</p>`; };
      body.onclick = e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.s != null && atual.length < 4) atual.push(+b.dataset.s); else if (b.dataset.a === 'del') atual.pop(); else if (b.dataset.a === 'ok' && atual.length === 4) {
          const p = atual.filter((s, i) => s === codigo[i]).length; const rest = codigo.filter((s, i) => s !== atual[i]), usadas = atual.filter((s, i) => s !== codigo[i]); let q = 0; usadas.forEach(s => { const k = rest.indexOf(s); if (k >= 0) { q++; rest.splice(k, 1); } });
          tent.push({ g: atual.slice(), p, q }); atual = []; SND.play(p === 4 ? 'win' : 'tick'); if (p === 4) return fim((7 - tent.length) / 6, 'Aberto na tentativa ' + tent.length); if (tent.length >= 6) return fim(0, 'O código era ' + codigo.map(s => SYM[s]).join(' ')); } SND.play('tick'); pinta(); };
      pinta();
    },
    // 9. cara ou coroa: até 3 acertos seguidos
    caracoroa(body, c, fim) {
      let streak = 0;
      const tela = (msg) => { body.innerHTML = `<div class="mg-coin" id="cn">?</div><p class="mg-q">${msg || 'Escolha o lado'}<br>Acertos seguidos: <b>${streak}</b>/3</p><div class="mg-btns"><button class="btn" data-l="0">Cara</button><button class="btn" data-l="1">Coroa</button></div>${streak > 0 ? '<div class="mg-btns"><button class="btn primary" data-a="stop">Parar e levar</button></div>' : ''}`; };
      body.onclick = async e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.a === 'stop') return fim(streak / 3, 'Parou com ' + streak + ' acertos');
        if (b.dataset.l == null) return; const r = Math.random() < .5 ? 0 : 1, cn = $('#cn', body); cn.classList.add('flip'); SND.play('flip'); await wait(900); cn.classList.remove('flip'); cn.textContent = r ? 'Coroa' : 'Cara';
        if (r === +b.dataset.l) { streak++; SND.play('capture'); await wait(700); if (streak >= 3) return fim(1, '3 acertos seguidos'); tela('Acertou! Continua ou para?'); } else { SND.play('lose'); await wait(900); fim(0, 'Errou na ' + (streak + 1) + 'ª'); } };
      tela();
    },
    // 10. raspadinha: resultado sorteado (sorte calibrável por dif: >1 = mais difícil)
    raspadinha(body, c, fim) {
      const SY = ['◆', '●', '▲', '★']; const pesos = [.4 * c.dif, .38, .17 / c.dif, .05 / c.dif], tot = pesos.reduce((a, b) => a + b, 0); let r = Math.random() * tot, tier = 0; for (let i = 0; i < 4; i++) { if (r < pesos[i]) { tier = i; break; } r -= pesos[i]; }
      const seq = tier === 3 ? ['★', '★', '★'] : tier === 2 ? ['●', '●', '●'] : tier === 1 ? shuffle(['▲', '▲', '◆']) : shuffle(['◆', '●', '▲']); const cells = shuffle([0, 1, 2, 3, 4, 5]); let k = 0, abertas = 0;
      body.innerHTML = `<p class="mg-q" id="mq">Raspe 3 quadrados</p><div class="mg-grid g3"></div>`; const g = $('.mg-grid', body); const fill = Array.from({ length: 6 }, () => pick(SY));
      cells.forEach((cellIdx, ord) => { }); for (let i = 0; i < 6; i++) { const b = mk('<button class="mg-cell scr">?</button>'); b.dataset.i = i; g.append(b); }
      g.onclick = async e => { const b = e.target.closest('.mg-cell'); if (!b || b.classList.contains('open') || abertas >= 3) return; b.classList.add('open'); b.textContent = seq[abertas]; abertas++; SND.play('tick');
        if (abertas === 3) { await wait(500); $$all(g).forEach(x => { if (!x.classList.contains('open')) { x.classList.add('open', 'dim'); x.textContent = pick(SY); } }); await wait(1000); fim([0, .4, .7, 1][tier], seq.join(' ')); } };
      const $$all = g => Array.from(g.children);
    },
    // 12. caça ao pêndulo: escuro, luz segue o dedo, 25 s
    cacapendulo(body, c, fim) {
      const cv = mk('<canvas class="mg-cv"></canvas>'); body.append(cv); const W = cv.width = Math.min(380, body.clientWidth || 360), H = cv.height = Math.min(520, (body.clientHeight || 560) - 10), g = cv.getContext('2d');
      let mx = W / 2, my = H / 2, t = 0, last = 0, raf = 0, pegos = 0, acabou = false; const moedas = [], T = 25, META = 12, R = 80;
      const mover = e => { const r = cv.getBoundingClientRect(); mx = (e.clientX - r.left) * W / r.width; my = (e.clientY - r.top) * H / r.height; }; cv.style.touchAction = 'none'; cv.addEventListener('pointermove', mover);
      cv.addEventListener('pointerdown', e => { mover(e); for (let i = moedas.length - 1; i >= 0; i--) { const o = moedas[i]; if (Math.hypot(o.x - mx, o.y - my) < R && Math.hypot(o.x - mx, o.y - my) < 26 + o.r) { moedas.splice(i, 1); pegos++; SND.play('bauCoin'); break; } } });
      const fin = () => { if (acabou) return; acabou = true; fim(pegos / META, pegos + ' pêndulos'); };
      const loop = ts => { const dt = Math.min(.05, (ts - last) / 1000 || 0); last = ts; t += dt; if (Math.random() < dt * 1.5 * c.dif) { const y = 20 + Math.random() * (H - 40), d = Math.random() < .5 ? 1 : -1; moedas.push({ x: d > 0 ? -12 : W + 12, y, vx: d * (90 + Math.random() * 90) * c.dif, r: 12 }); }
        g.fillStyle = '#000'; g.fillRect(0, 0, W, H); moedas.forEach(o => { o.x += o.vx * dt; }); for (let i = moedas.length - 1; i >= 0; i--) if (moedas[i].x < -30 || moedas[i].x > W + 30) moedas.splice(i, 1);
        g.save(); g.beginPath(); g.arc(mx, my, R, 0, 7); g.clip(); const gr = g.createRadialGradient(mx, my, 10, mx, my, R); gr.addColorStop(0, '#2b2260'); gr.addColorStop(1, '#0a0820'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
        moedas.forEach(o => { g.beginPath(); g.fillStyle = '#ff5a4f'; g.arc(o.x, o.y, o.r, 0, 7); g.fill(); g.fillStyle = '#0a0820'; g.beginPath(); g.arc(o.x, o.y, 4, 0, 7); g.fill(); }); g.restore();
        g.strokeStyle = '#ffffff44'; g.beginPath(); g.arc(mx, my, R, 0, 7); g.stroke(); g.fillStyle = '#fff'; g.font = '700 14px system-ui'; g.fillText('Pêndulos ' + pegos + '   ' + Math.max(0, Math.ceil(T - t)) + 's', 10, 20); if (t >= T) return fin(); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop); return () => { acabou = true; cancelAnimationFrame(raf); };
    },
  };

  // ---------------- minigames por série
  Object.assign(GAMES, {
    // Diário Sobrenatural: Simon com os seis sentidos (5 rodadas, 3 a 7 elos)
    elos(body, c, fim) {
      const NOMES = ['Visão', 'Audição', 'Olfato', 'Paladar', 'Tato', 'Intuição'], COR = ['#6cc6ff', '#ffd25f', '#7dffb0', '#ff8a5c', '#c58cff', '#ff7ab0'], SOM = ['click', 'tick', 'flip', 'deal', 'place', 'reveal'];
      let rodada = 0, seq = [], pos = 0, vez = false, ok = 0; const R = 5;
      body.innerHTML = `<p class="mg-q" id="mq"></p><div class="mg-grid g3" id="el"></div>`; const q = $('#mq', body), g = $('#el', body);
      NOMES.forEach((n, i) => { const b = mk(`<button class="mg-cell elo" data-i="${i}" style="--c:${COR[i]}">${n}</button>`); g.append(b); });
      const acende = async i => { const b = g.children[i]; b.classList.add('on'); SND.play(SOM[i]); await wait(380 / c.dif); b.classList.remove('on'); await wait(150 / c.dif); };
      const nova = async () => { vez = false; seq = Array.from({ length: 3 + rodada }, () => rnd(6)); pos = 0; q.textContent = 'Rodada ' + (rodada + 1) + '/' + R + ': observe'; await wait(700); for (const i of seq) await acende(i); q.textContent = 'Sua vez'; vez = true; };
      g.onclick = async e => { const b = e.target.closest('.elo'); if (!b || !vez) return; const i = +b.dataset.i; acende(i);
        if (i !== seq[pos]) { vez = false; SND.play('lose'); q.textContent = 'Errou!'; await wait(900); return fim(ok / R, ok + ' de ' + R + ' sequências'); }
        pos++; if (pos === seq.length) { vez = false; ok++; rodada++; SND.play('capture'); await wait(700); if (rodada >= R) return fim(1, 'Todas as sequências'); nova(); } };
      nova();
    },
    // Ciclo de Jesed: duas luas, alinhar (5 toques)
    luas(body, c, fim) {
      const cv = mk('<canvas class="mg-cv"></canvas>'); body.append(cv); const W = cv.width = Math.min(380, body.clientWidth || 360), H = cv.height = 380, g = cv.getContext('2d');
      let a1 = 0, a2 = 2, last = 0, raf = 0, toques = 0, pts = 0, msg = '', msgT = 0, travado = false; const N = 5, tol = .3 / c.dif, w1 = 1.1 * c.dif, w2 = .62 * c.dif;
      const dif = () => { let d = Math.abs(((a1 - a2) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI); return Math.PI - d; };   // 0 = alinhadas
      const loop = ts => { const dt = Math.min(.05, (ts - last) / 1000 || 0); last = ts; a1 += w1 * dt; a2 += w2 * dt; if (msgT > 0) msgT -= dt;
        g.fillStyle = '#05030f'; g.fillRect(0, 0, W, H); const cx = W / 2, cy = H / 2 + 6; g.strokeStyle = '#ffffff22'; [[120], [70]].forEach(([r]) => { g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke(); });
        g.fillStyle = '#3a6ea5'; g.beginPath(); g.arc(cx, cy, 20, 0, 7); g.fill(); const d = dif(), al = d < tol;
        const m = (a, r, rad, col) => { g.fillStyle = col; g.beginPath(); g.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, rad, 0, 7); g.fill(); }; m(a1, 70, 14, al ? '#fff6c9' : '#d7d2ee'); m(a2, 120, 9, al ? '#ffb3a0' : '#c7503a');
        g.fillStyle = '#fff'; g.font = '700 14px system-ui'; g.fillText('Toque ' + Math.min(toques + 1, N) + '/' + N, 10, 20); if (msgT > 0) { g.font = '800 22px system-ui'; g.textAlign = 'center'; g.fillText(msg, cx, 40); g.textAlign = 'left'; }
        raf = requestAnimationFrame(loop); };
      cv.style.touchAction = 'none';
      const bt = mk('<button class="btn primary big">Alinhar!</button>'); body.append(bt);
      bt.onclick = async () => { if (travado) return; const d = dif(); const v = d < tol ? 1 : d < tol * 2 ? .5 : 0; pts += v; toques++; msg = v === 1 ? 'Alinhadas!' : v ? 'Quase' : 'Errou'; msgT = 1; SND.play(v ? (v === 1 ? 'capture' : 'tick') : 'lose'); if (toques >= N) { travado = true; await wait(900); fim(pts / N, pts + ' de ' + N + ' pontos'); } };
      raf = requestAnimationFrame(loop); return () => cancelAnimationFrame(raf);
    },
    // Viajantes: poder certo para cada obstáculo (10 obstáculos)
    poderes(body, c, fim) {
      const P = [{ n: 'Breno', d: 'atravessa' }, { n: 'Bruno', d: 'congela' }, { n: 'Beatriz', d: 'queima' }, { n: 'Banjo', d: 'move à distância' }];
      const OB = [{ t: 'Parede de pedra', p: 0 }, { t: 'Fogueira', p: 1 }, { t: 'Bloco de gelo', p: 2 }, { t: 'Alavanca distante', p: 3 }, { t: 'Grade trancada', p: 0 }, { t: 'Lava no chão', p: 1 }, { t: 'Porta de gelo', p: 2 }, { t: 'Chave no alto', p: 3 }];
      const N = 10, seq = Array.from({ length: N }, () => pick(OB)); let n = 0, ok = 0, tm = null, left = 0, done = false;
      const q = () => { const o = seq[n]; left = 3 / c.dif; done = false;
        body.innerHTML = `<p class="mg-q">Obstáculo ${n + 1}/${N} · <span id="tl">${left.toFixed(1)}</span>s</p><div class="mg-obs">${o.t}</div><div class="mg-btns col">${P.map((x, i) => `<button class="btn" data-p="${i}">${x.n} <small>${x.d}</small></button>`).join('')}</div>`;
        const resp = async i => { if (done) return; done = true; clearInterval(tm); const certo = i === o.p; if (certo) ok++; SND.play(certo ? 'win' : 'lose'); await wait(500); n++; if (n >= N) fim(ok / N, ok + ' de ' + N + ' obstáculos'); else q(); };
        body.onclick = e => { const b = e.target.closest('[data-p]'); if (b) resp(+b.dataset.p); }; clearInterval(tm);
        tm = setInterval(() => { left -= .1; const t = $('#tl', body); if (t) t.textContent = Math.max(0, left).toFixed(1); if (left <= 0) resp(-1); }, 100); };
      q(); return () => clearInterval(tm);
    },
    // Spacetheft: gancho de abordagem contra nave em movimento (6 lançamentos)
    gancho(body, c, fim) {
      const cv = mk('<canvas class="mg-cv"></canvas>'); body.append(cv); const W = cv.width = Math.min(380, body.clientWidth || 360), H = cv.height = 420, g = cv.getContext('2d');
      let sx = 40, sv = 90 * c.dif, last = 0, raf = 0, ganchos = [], lanc = 0, acertos = 0, aim = W / 2, acabou = false; const N = 6, SY = 90, VG = 420;
      const mover = e => { const r = cv.getBoundingClientRect(); aim = (e.clientX - r.left) * W / r.width; }; cv.style.touchAction = 'none'; cv.addEventListener('pointermove', mover);
      const lanca = e => { mover(e); if (lanc >= N || ganchos.some(h => h.vivo)) return; lanc++; ganchos.push({ x: aim, y: H - 10, vivo: true }); SND.play('slash'); };
      cv.addEventListener('pointerdown', lanca);
      const loop = ts => { const dt = Math.min(.05, (ts - last) / 1000 || 0); last = ts; sx += sv * dt; if (sx > W - 30) { sx = W - 30; sv = -Math.abs(sv) * (.8 + Math.random() * .5); } if (sx < 30) { sx = 30; sv = Math.abs(sv) * (.8 + Math.random() * .5); } sv = Math.sign(sv) * Math.min(Math.abs(sv), 190 * c.dif);
        g.fillStyle = '#05030f'; g.fillRect(0, 0, W, H); g.fillStyle = '#ffffff44'; for (let i = 0; i < 24; i++) g.fillRect((i * 83) % W, (i * 47) % H, 1.5, 1.5);
        g.fillStyle = '#c7503a'; g.beginPath(); g.moveTo(sx + 26, SY); g.lineTo(sx - 18, SY - 13); g.lineTo(sx - 18, SY + 13); g.fill(); g.fillStyle = '#ffd25f'; g.fillRect(sx - 4, SY - 4, 8, 8);
        ganchos.forEach(h => { if (!h.vivo) return; h.y -= VG * dt; if (Math.abs(h.x - sx) < 24 && Math.abs(h.y - SY) < 14) { h.vivo = false; h.ok = true; acertos++; SND.play('capture'); } else if (h.y < 20) { h.vivo = false; SND.play('lose'); } });
        ganchos.forEach(h => { g.strokeStyle = h.ok ? '#7dffb0' : '#fff'; g.beginPath(); g.moveTo(h.x, H); g.lineTo(h.x, h.vivo ? h.y : (h.ok ? SY : 20)); g.stroke(); });
        g.strokeStyle = '#7dffb066'; g.beginPath(); g.moveTo(aim, H); g.lineTo(aim, H - 40); g.stroke(); g.fillStyle = '#7dffb0'; g.beginPath(); g.moveTo(aim, H - 56); g.lineTo(aim - 9, H - 38); g.lineTo(aim + 9, H - 38); g.fill();
        g.fillStyle = '#fff'; g.font = '700 14px system-ui'; g.fillText('Ganchos ' + (N - lanc) + '   Abordagens ' + acertos, 10, 20);
        if (lanc >= N && !ganchos.some(h => h.vivo) && !acabou) { acabou = true; setTimeout(() => fim(acertos / N, acertos + ' de ' + N + ' abordagens'), 600); }
        raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop); return () => { acabou = true; cancelAnimationFrame(raf); };
    },
    // Mistério Oculto: dedução por pistas (3 casos)
    culpado(body, c, fim) {
      const NOMES = ['Diana', 'Marta', 'Padre Tomas', 'Sete', 'Hyde', 'Lúcio', 'Vera', 'Caio'], COR = ['vermelho', 'azul', 'verde', 'preto'], LOC = ['Biblioteca', 'Cozinha', 'Jardim', 'Porão'], HEX = { vermelho: '#ff6a5c', azul: '#6cc6ff', verde: '#7dffb0', preto: '#8a84a8' };
      let caso = 0, pts = 0; const N = 3;
      const gera = () => { const nm = shuffle(NOMES).slice(0, 4), cs = shuffle(COR), ls = shuffle(LOC), S = nm.map((n, i) => ({ n, c: cs[i], l: ls[i] })), cul = rnd(4), pistas = [], vivos = new Set([0, 1, 2, 3]);
        const cand = []; COR.forEach(x => { if (x !== S[cul].c) cand.push({ t: 'O culpado não usava casaco ' + x + '.', f: s => s.c !== x }); }); LOC.forEach(x => { if (x !== S[cul].l) cand.push({ t: 'O culpado não estava na ' + (x === 'Porão' ? 'o Porão' : x).replace('na o', 'no') + '.', f: s => s.l !== x }); });
        cand.forEach(k => { if (k.t.includes('na o ')) k.t = k.t.replace('na o ', 'no '); }); LOC.forEach(x => { if (x !== S[cul].l) { const y = pick(LOC.filter(z => z !== x)); } });
        while (vivos.size > 1 && cand.length) { let melhor = null, mi = -1; cand.forEach((k, i) => { const e = [...vivos].filter(v => v !== cul && !k.f(S[v])).length; if (e > (melhor === null ? 0 : melhor)) { melhor = e; mi = i; } }); if (mi < 0) break; const k = cand.splice(mi, 1)[0]; pistas.push(k.t); [...vivos].forEach(v => { if (v !== cul && !k.f(S[v])) vivos.delete(v); }); }
        return { S, cul, pistas }; };
      const tela = () => { const P = gera(); let tent = 0;
        body.innerHTML = `<p class="mg-q">Caso ${caso + 1}/${N}</p><div class="mg-sus">${P.S.map((s, i) => `<button class="btn" data-i="${i}"><b>${s.n}</b><br><small style="color:${HEX[s.c]}">casaco ${s.c}</small><br><small>${s.l}</small></button>`).join('')}</div><ul class="mg-pistas">${P.pistas.map(t => `<li>${t}</li>`).join('')}</ul><p class="hint" id="mm">Quem é o culpado?</p>`;
        body.onclick = async e => { const b = e.target.closest('[data-i]'); if (!b || b.disabled) return; const i = +b.dataset.i; tent++;
          if (i === P.cul) { pts += tent === 1 ? 1 : .5; SND.play('win'); await wait(900); caso++; if (caso >= N) return fim(pts / N, pts + ' de ' + N + ' pontos'); tela(); } else { b.disabled = true; b.style.opacity = .4; SND.play('lose'); if (tent >= 2) { await wait(700); caso++; if (caso >= N) return fim(pts / N, pts + ' de ' + N + ' pontos'); tela(); } } }; };
      tela();
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
