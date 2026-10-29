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

  function stats() {   // para o admin: por minigame
    const L = log(), o = {}; LISTA.forEach(m => { o[m.id] = { n: 0, pct: 0, t: [0, 0, 0, 0], rw: 0, ms: 0 }; });
    L.forEach(r => { const s = o[r.id]; if (!s) return; s.n++; s.pct += r.pct; s.t[r.tier]++; s.rw += r.reward; s.ms += r.ms || 0; }); return o;
  }
  window.DSMini = { LISTA, play, cfg, setCfg, stats, resetLog: () => wr(LOG_KEY, []), resetCfg: () => wr(CFG_KEY, {}), tierOf };
})();
