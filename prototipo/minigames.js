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
    { id: 'memoria', nome: 'Ecos Estelares', desc: 'Encontre os pares de cartas antes que o tempo acabe, com poucas jogadas.', cortes: [.3, .6, .9] },
    { id: 'quemequem', nome: 'Fragmentos de Rosto', desc: 'Só alguns trechos escuros da carta aparecem. Descubra quem é, com um tempo total para as 8 cartas.', cortes: [.37, .63, .88] },
    { id: 'ordem', nome: 'Dança das Cartas', desc: 'Uma carta é marcada, todas viram e trocam de lugar. Acerte onde ela foi parar. Você tem 3 vidas.', cortes: [.4, .7, .95] },
    { id: 'mineracao', nome: 'Maré Rubra', desc: 'As bolinhas vermelhas contagiam as azuis, que vagam pela tela. Afaste as vermelhas: uma azul salva já vence, cinco é o máximo.', cortes: [.37, .63, .88] },
    { id: 'asteroides', nome: 'Rota dos Meteoros', desc: 'Arraste a nave, desvie das rochas e pegue os pêndulos.', cortes: [.33, .6, .87] },
    { id: 'cofre', nome: 'Fechadura de Jasmey', desc: 'Descubra o código de símbolos nas tentativas, contra o relógio.', cortes: [.30, .45, .62] },
    { id: 'caracoroa', nome: 'Eco das Notas', desc: 'Ouça a sequência, que ganha um som a cada rodada, e repita.', cortes: [.3, .6, .95] },
    { id: 'raspadinha', nome: 'Relâmpago Dimensional', desc: 'Cartas viram num piscar: uma dá +1, outras tiram pontos. Toque no +1 o máximo que puder.', cortes: [.3, .6, .95] },
    { id: 'cacapendulo', nome: 'Pêndulos Fugitivos', desc: 'No escuro, toque nos pêndulos que cruzam sob a luz em todas as direções.', cortes: [.33, .6, .87] },
    // um por série de livros
    { id: 'elos', nome: 'Sussurro dos Elos', serie: 'Diário Sobrenatural', desc: 'No escuro, segure o dedo e siga o som: quanto mais perto do Elo, mais alto. Toque 2 vezes para confirmar.', cortes: [.4, .7, 1] },
    { id: 'luas', nome: 'Resgate no Céu', serie: 'Ciclo de Jesed', desc: 'Pessoas caem do céu, algumas em planadores que quebram. Mova o cesto e salve o máximo.', cortes: [.35, .65, .9] },
    { id: 'poderes', nome: 'Cores dos Irmãos', serie: 'Viajantes Dimensionais', desc: 'Leve cada irmão ao objeto da cor dele, o mais rápido possível. Encostar numa cor errada perde a rodada.', cortes: [.4, .7, .9] },
    { id: 'gancho', nome: 'Constelação Pirata', serie: 'Spacetheft', desc: 'Toque nos símbolos espaciais que aparecem. Cuidado com a caveira.', cortes: [.34, .67, .84] },
    { id: 'culpado', nome: 'Vigília Escura', serie: 'Mistério Oculto', desc: 'Feche os olhos que se abrem antes que ataquem. 3 corações.', cortes: [.5, .75, .96] },
    { id: 'ritmo', nome: 'Maré, Chama e Gelo', serie: 'Édelin Lys', desc: 'Toque nas notas quando chegarem à linha, na pista do elemento.', cortes: [.4, .7, .9] },
    { id: 'formacao', nome: 'Chamado da União', serie: 'A União', desc: 'Proteja o Estírio, a bolinha brilhante: as hordas vão atrás dele. Arraste o Estírio e os heróis, que atacam sozinhos. Se uma horda tocar o Estírio, acabou.', cortes: [.34, .6, .99] },
  ];
  const BYID = {}; LISTA.forEach(m => { BYID[m.id] = m; });
  const cfgAll = () => rd(CFG_KEY, {});
  function cfg(id) { const c = cfgAll()[id] || {}, m = BYID[id]; return { dif: c.dif || DEF.dif, cortes: c.cortes || m.cortes || DEF.cortes, premios: c.premios || DEF.premios }; }
  function setCfg(id, patch) { const a = cfgAll(); a[id] = Object.assign({}, a[id] || {}, patch); wr(CFG_KEY, a); }
  const log = () => rd(LOG_KEY, []);
  const tierOf = (id, pct) => { const c = cfg(id).cortes; return pct >= c[2] ? 3 : pct >= c[1] ? 2 : pct >= c[0] ? 1 : 0; };


  // ---- música dos minigames: 3 trilhas (divertida e tranquila, moderna, futurista e rápida) distribuídas entre os jogos; voltam à trilha anterior ao sair
  const TRILHA = { maiormenor: 'mgdiv', memoria: 'mgdiv', quemequem: 'mgdiv', cofre: 'mgdiv', poderes: 'mgdiv', ordem: 'mgmod', mineracao: 'mgmod', cacapendulo: 'mgmod', luas: 'mgmod', culpado: 'mgmod', raspadinha: 'mgfut', asteroides: 'mgfut', gancho: 'mgfut', formacao: 'mgfut' };
  const MUS = (() => { let ant = null, on = false;
    return {
      prep(id) { try { ant = SND.histNow || null; SND.histStop(true); SND.histNow = null; if (SND.musicNodes) { SND.musicNodes.stop(); SND.musicNodes = null; } const k = TRILHA[id]; if (k) SND.histLoad(k); on = true; } catch (e) { on = false; } },   // para a trilha do mapa e já carrega a do jogo; jogos sem trilha ficam em silêncio
      start(id) { const k = TRILHA[id]; if (!k) return; try { SND.histPlay(k); } catch (e) { } },
      stop() { if (!on) return; on = false; try { if (ant) SND.histPlay(ant); else SND.histStop(); } catch (e) { } },
    };
  })();
  const dor = () => { try { const ctx = SND.ctx; if (!ctx) return; const o = ctx.createOscillator(), o2 = ctx.createOscillator(), gn = ctx.createGain(), t = ctx.currentTime; o.type = 'sawtooth'; o2.type = 'square'; o.frequency.setValueAtTime(760, t); o.frequency.exponentialRampToValueAtTime(240, t + .28); o2.frequency.setValueAtTime(790, t); o2.frequency.exponentialRampToValueAtTime(250, t + .28); gn.gain.setValueAtTime(.0001, t); gn.gain.exponentialRampToValueAtTime(.16, t + .02); gn.gain.exponentialRampToValueAtTime(.0001, t + .32); o.connect(gn); o2.connect(gn); gn.connect(SND.master || ctx.destination); o.start(t); o2.start(t); o.stop(t + .34); o2.stop(t + .34); } catch (e) { } };   // gritinho de dor
  const bip = (f, d, v) => { try { const ctx = SND.ctx; if (!ctx) return; const o = ctx.createOscillator(), o2 = ctx.createOscillator(), gn = ctx.createGain(), t = ctx.currentTime; o.type = 'triangle'; o2.type = 'sine'; o.frequency.setValueAtTime(f, t); o2.frequency.setValueAtTime(f * 2, t); gn.gain.setValueAtTime(.0001, t); gn.gain.exponentialRampToValueAtTime(v || .2, t + .015); gn.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(gn); o2.connect(gn); gn.connect(SND.master || ctx.destination); o.start(t); o2.start(t); o.stop(t + d + .02); o2.stop(t + d + .02); } catch (e) { } };   // bip da contagem 3-2-1

  // sons oficiais dos minigames: nota agendada, estouro de dano, gongo do FIM e jingles por nível (0 perdeu, 1 Bom, 2 Ótimo, 3 Perfeito)
  const nota = (f, at, d, v, tipo, f2) => { try { const ctx = SND.ctx; if (!ctx) return; const o = ctx.createOscillator(), gn = ctx.createGain(), t = ctx.currentTime + at; o.type = tipo || 'triangle'; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d); gn.gain.setValueAtTime(.0001, t); gn.gain.exponentialRampToValueAtTime(v || .18, t + .02); gn.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(gn); gn.connect(SND.master || ctx.destination); o.start(t); o.stop(t + d + .03); } catch (e) { } };
  const ruido = (d, v, fi, ff) => { try { const ctx = SND.ctx; if (!ctx) return; const n = Math.floor(ctx.sampleRate * d), buf = ctx.createBuffer(1, n, ctx.sampleRate), ch = buf.getChannelData(0); for (let i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / n); const src = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), gn = ctx.createGain(), t = ctx.currentTime; src.buffer = buf; fl.type = 'lowpass'; fl.frequency.setValueAtTime(fi || 2400, t); fl.frequency.exponentialRampToValueAtTime(ff || 300, t + d); gn.gain.setValueAtTime(v || .3, t); gn.gain.exponentialRampToValueAtTime(.0001, t + d); src.connect(fl); fl.connect(gn); gn.connect(SND.master || ctx.destination); src.start(t); } catch (e) { } };
  const crash = () => { ruido(.28, .34, 3000, 200); nota(180, 0, .22, .2, 'sawtooth', 60); };
  const boom = () => { ruido(1.1, .45, 2200, 80); nota(120, 0, .9, .25, 'sawtooth', 35); nota(70, .05, .8, .2, 'square', 30); };
  const gongo = () => { nota(196, 0, 1.1, .2, 'triangle'); nota(392.5, 0, 1.0, .1, 'sine'); nota(98, 0, 1.2, .16, 'sine'); ruido(.18, .08, 5000, 1500); };
  const jingle = tier => { if (tier === 0) { nota(392, 0, .28, .17, 'sawtooth', 380); nota(349, .28, .28, .17, 'sawtooth', 340); nota(311, .56, .28, .17, 'sawtooth', 300); nota(220, .84, .7, .18, 'sawtooth', 150); }
    else if (tier === 1) { nota(523, 0, .2, .17); nota(659, .17, .5, .18); }
    else if (tier === 2) { [523, 659, 784].forEach((f, i) => nota(f, i * .13, .32, .17)); nota(1047, .4, .65, .17); nota(1319, .42, .6, .06, 'sine'); }
    else { [523, 659, 784, 1047].forEach((f, i) => nota(f, i * .11, .26, .17)); [523, 659, 784, 1047].forEach(f => nota(f, .5, 1.1, .12, 'square')); nota(1568, .52, .9, .08, 'sine'); nota(2093, .7, .7, .05, 'sine'); ruido(.35, .06, 7000, 3000); } };
  const HARD_CORTES = { cofre: [.42, .56, .71] };   // Hard da Fechadura: 7 tentativas; Bom ≤5, Ótimo ≤4, Perfeito ≤3
  const HARD_PROPRIO = new Set(['cofre', 'asteroides', 'mineracao', 'cacapendulo', 'gancho', 'elos', 'luas', 'poderes', 'ritmo', 'maiormenor', 'memoria', 'quemequem', 'ordem', 'caracoroa', 'raspadinha', 'culpado']);   // jogos com Hard desenhado; os demais usam o escalonamento genérico até a vez deles
  const hardCfg = (id, c0) => HARD_PROPRIO.has(id) ? { dif: c0.dif, cortes: HARD_CORTES[id] || c0.cortes, premios: c0.premios.map((x, i) => i ? Math.round(x * 1.5) : 0), hard: true } : { dif: c0.dif * 1.28, cortes: c0.cortes.map((x, i) => Math.min(.99, x + [.04, .05, .04][i])), premios: c0.premios.map((x, i) => i ? Math.round(x * 1.5) : 0), hard: true };
  const SEM_MUSICA = ['caracoroa', 'elos', 'ritmo'];

  // ---- casca comum: tela cheia, título, sair, resultado
  function shell(m, opts) {
    const fundos = { cofre: 'jasmey', gancho: 'jasmey', elos: 'diario', luas: 'jesed', poderes: 'viajantes', culpado: 'misterio', ritmo: 'edelin', formacao: 'uniao' };
    const modos = opts && opts.hardUnlocked && !opts.modo ? '<div class="mg-modes" aria-label="Dificuldade"><button class="on" data-mode="normal">Normal</button><button data-mode="hard">Hard</button></div>' : '';
    const ov = mk(`<div class="mg" data-fundo="${fundos[m.id] || 'geral'}"><header><b>${m.nome}</b><span class="mg-hint">${m.desc}</span>${modos}<button class="ibtn mg-x" aria-label="Sair">✕</button></header><div class="mg-body"></div></div>`);
    document.body.appendChild(ov); return ov;
  }
  // abertura: nome do jogo entra e sai, contagem 3-2-1 e JÁ; o jogo e a música começam no JÁ
  async function intro(ov, m, parar) {
    const w = mk(`<div class="mg-intro"><small>${m.serie || 'Minigame'}</small><div class="mg-in-n">${m.nome}</div><div class="mg-in-c"></div></div>`); ov.append(w); const ic = $('.mg-in-c', w), sn = (k) => { try { SND.play(k); } catch (e) { } };
    sn('bauShake'); await wait(1700); if (parar()) { w.remove(); return false; } w.classList.add('sai'); await wait(380);
    for (const t of ['3', '2', '1']) { if (parar()) { w.remove(); return false; } ic.textContent = t; ic.classList.remove('pop'); void ic.offsetWidth; ic.classList.add('pop'); bip(t === '1' ? 700 : t === '2' ? 620 : 540, .2); await wait(720); }
    if (parar()) { w.remove(); return false; } ic.textContent = 'JÁ!'; ic.classList.remove('pop'); void ic.offsetWidth; ic.classList.add('pop', 'ja'); bip(1050, .5, .26); w.classList.add('fim'); setTimeout(() => w.remove(), 650); return true;
  }
  async function play(id, opts) {
    opts = opts || {}; const m = BYID[id], c0 = cfg(id); if (!m) return null; try { SND.init(); } catch (e) { }
    const ov = shell(m, opts), body = $('.mg-body', ov); let ended = false, started = false, stop = () => { }, res, hard = opts.modo === 'hard', c = hard ? hardCfg(id, c0) : c0; let t0 = Date.now(); if (hard) ov.classList.add('hard');   // opts.modo ('normal'|'hard') pula a escolha de dificuldade (teste do admin)
    const modeBtns = ov.querySelectorAll('[data-mode]'); modeBtns.forEach(b => b.onclick = () => { if (started) return; hard = b.dataset.mode === 'hard'; c = hard ? hardCfg(id, c0) : c0; modeBtns.forEach(x => x.classList.toggle('on', x === b)); ov.classList.toggle('hard', hard); });
    const out = await new Promise(resolve => {
      const fim = (pct, detail, extra) => { if (ended) return; ended = true; stop(); MUS.stop(); pct = Math.max(0, Math.min(1, pct)); const tier = c.cortes.filter(x => pct >= x).length, reward = c.premios[tier] | 0; res = { id, pct: +pct.toFixed(3), tier, reward, hard, detail: detail || '', ms: Date.now() - t0 }; if (extra) Object.assign(res, extra);
        const mostra = () => { if (!body.isConnected) return; body.innerHTML = `<div class="mg-res t${tier}"><div class="mg-tier">${['Sem prêmio', 'Bom', 'Ótimo', 'Perfeito'][tier]}</div><div class="mg-pct">${Math.round(pct * 100)}%</div><div class="mg-det">${detail || ''}</div><div class="mg-rw">${reward > 0 ? '+' + reward + ' pêndulos' : 'Nenhum pêndulo'}${res.carta ? ' + 1 carta' : ''}</div><button class="btn primary mg-ok">Continuar</button></div>`; try { jingle(tier); } catch (e) { } const ok = $('.mg-ok', ov); if (ok) ok.onclick = () => { try { SND.play('click'); } catch (e) { } resolve(res); }; };
        if (detail === 'Abandonado' || detail === 'Erro') mostra(); else { const f = document.createElement('div'); f.className = 'mg-fim'; f.innerHTML = '<b>FIM!</b>'; body.style.position = body.style.position || 'relative'; body.append(f); try { gongo(); } catch (e) { } setTimeout(mostra, 1700); }
        const L = log(); L.push({ id, pct: res.pct, tier, reward, hard, ms: res.ms, t: Date.now(), teste: !!opts.teste }); wr(LOG_KEY, L.slice(-500));
      };
      $('.mg-x', ov).onclick = () => { if (ended) { resolve(res); return; } fim(0, 'Abandonado'); };
      const comecar = () => { if (started || ended) return; started = true; body.innerHTML = ''; MUS.prep(id); intro(ov, m, () => ended).then(go => { if (!go) return; t0 = Date.now(); MUS.start(id); try { stop = GAMES[id](body, c, fim) || (() => { }); } catch (e) { console.error(e); fim(0, 'Erro'); } }); };
      if (modeBtns.length) { body.innerHTML = '<div class="mg-modepick"><small>MODO DE JOGO</small><h2>Escolha a dificuldade</h2><p>Hard aumenta a pressão e os cortes de pontuação, mas paga 50% mais pêndulos.</p><button class="btn primary mg-begin">Iniciar</button></div>'; $('.mg-begin', body).onclick = comecar; } else comecar();
    });
    ov.remove(); opts.onEnd && opts.onEnd(out); return out;
  }

  // ---- utilitários de carta
  const card = (id, cw) => U.cardEl(id, { up: true, noanim: true, cw: cw || 96 });
  const hidden = cw => U.cardEl('?', { noanim: true, cw: cw || 96 });
  const randCards = n => shuffle(CARTAS()).slice(0, n).map(c => c.id);

  // ---- simulação do Chamado da União (lógica pura, testável): proteja o Estírio; 8 heróis atacam à distância. Normal: parte dos inimigos vai ao Estírio e o resto aos heróis; Hard: todos vão ao Estírio
  function uniaoSim(dif, rand, opts) {
    const HD = !!(opts && opts.hard), W = 380, H = 480, NM = 8, R = 11, RE = 9, RES = 11, RANGE = 100, CD = .6, WAVES = 7, GAP = 4.3, VEST = (opts && opts.vest) || 200, PEST = (opts && opts.pest != null) ? opts.pest : .4, CNT = (opts && opts.cnt) || (HD ? .55 : .45), SPD = (opts && opts.spd) || (HD ? .8 : .7);   // calibrado em simulação (tools/sim_uniao.js): bot de anel vence ~70% no Normal e ~35% no Hard
    const ms = Array.from({ length: NM }, (_, i) => ({ x: W / 2 + Math.cos(i / NM * 6.283) * 60, y: H / 2 + Math.sin(i / NM * 6.283) * 60, vivo: true, cd: rand() * CD }));
    const est = { x: W / 2, y: H / 2, tx: W / 2, ty: H / 2 }, es = [], atk = []; let t = 0, wave = 0, prox = 1.2, kills = 0; const sorteia = () => [Math.floor(rand() * 4), Math.floor(rand() * 4)]; let lados = sorteia();   // lados da próxima horda ficam definidos antes, para o jogo avisar
    const TP = { n: { r: RE, m: 1, hp: 1 }, f: { r: 7, m: 1.75, hp: 1 }, g: { r: 14, m: .72, hp: 2 }, h: { r: 19, m: .58, hp: 3 }, v: { r: 7, m: 2.1, hp: 1 } };   // normal, rápido, grande (divide em 2 normais), enorme (divide em 2 grandes), veloz (vai direto ao Estírio)
    const mk = (tp, x, y, vb, ae, split) => { const k = TP[tp]; es.push({ x, y, tp, r: k.r, hp: tp === 'n' && wave >= 3 && rand() < .18 ? 2 : k.hp, vb, v: vb * k.m, ae: tp === 'v' || (ae == null ? (HD || rand() < PEST) : ae), split: !!split }); };
    const borda = l0 => { const l = l0 != null ? l0 : Math.floor(rand() * 4), u = rand(); return l === 0 ? [u * W, -10 - rand() * 30] : l === 1 ? [W + 10 + rand() * 30, u * H] : l === 2 ? [u * W, H + 10 + rand() * 30] : [-10 - rand() * 30, u * H]; };
    const spawn = n => { const ls = lados; lados = sorteia(); let i = 0; while (n > 0) { i++; const l = ls[i % 2], u = rand(); let x, y; if (l === 0) { x = u * W; y = -10 - rand() * 30; } else if (l === 1) { x = W + 10 + rand() * 30; y = u * H; } else if (l === 2) { x = u * W; y = H + 10 + rand() * 30; } else { x = -10 - rand() * 30; y = u * H; }
      const vb = (46 + wave * 5) * dif * SPD * (.85 + rand() * .3), q = rand(); let tp = 'n'; if (wave >= 3 && n >= 4 && q < .1) tp = 'h'; else if (wave >= 2 && n >= 2 && q < .26) tp = 'g'; else if (wave >= 1 && q < .5) tp = 'f';
      n -= tp === 'h' ? 4 : tp === 'g' ? 2 : 1; mk(tp, x, y, vb); }
      const nv = HD ? (wave >= 1 ? 1 + (wave >= 4 ? 1 : 0) + (wave >= 6 ? 1 : 0) : 0) : (wave >= 3 ? 1 + (wave >= 5 ? 1 : 0) : 0); for (let k = 0; k < nv; k++) { const [x, y] = borda(ls[k % 2]); mk('v', x, y, (46 + wave * 5) * dif * SPD); } };
    const S = { W, H, R, RE, RES, RANGE, ms, es, atk, est, get t() { return t; }, get wave() { return wave; }, get aviso() { return wave < WAVES && prox - t < 2.4 ? lados : null; }, WAVES, get kills() { return kills; }, done: false, perdeu: false,
      vivos: () => ms.filter(m => m.vivo).length,
      move(i, x, y) { const m = ms[i]; if (m && m.vivo) { m.x = Math.max(R, Math.min(W - R, x)); m.y = Math.max(R, Math.min(H - R, y)); } },
      moveEst(x, y) { est.tx = Math.max(RES, Math.min(W - RES, x)); est.ty = Math.max(RES + 22, Math.min(H - RES, y)); },
      step(dt) { if (S.done) return; t += dt;
        const dx = est.tx - est.x, dy = est.ty - est.y, dd = Math.hypot(dx, dy), pass = Math.min(dd, VEST * dt); if (dd > .01) { est.x += dx / dd * pass; est.y += dy / dd * pass; }
        if (wave < WAVES && t >= prox) { spawn(Math.round((7 + wave * 5) * 1.2 * CNT)); wave++; prox += GAP / Math.sqrt(dif); }
        const vivos = ms.filter(m => m.vivo);
        es.forEach(e => { let tx, ty, d = 1e9; if (e.ae || !vivos.length) { tx = est.x; ty = est.y; d = Math.hypot(tx - e.x, ty - e.y); } else { let a = null; vivos.forEach(m => { const dd2 = Math.hypot(m.x - e.x, m.y - e.y); if (dd2 < d) { d = dd2; a = m; } }); tx = a.x; ty = a.y; } if (d > .01) { e.x += (tx - e.x) / d * e.v * dt; e.y += (ty - e.y) / d * e.v * dt; } });
        if (es.some(e => Math.hypot(est.x - e.x, est.y - e.y) < RES + e.r - 2)) { S.perdeu = true; S.done = true; return; }
        es.forEach(e => { vivos.forEach(m => { if (m.vivo && Math.hypot(m.x - e.x, m.y - e.y) < R + e.r - 3) { m.vivo = false; S.morreu = (S.morreu || 0) + 1; S.ultimaMorte = m; } }); });
        vivos.forEach(m => { if (!m.vivo) return; m.cd -= dt; if (m.cd > 0) return; let a = null, d = 1e9; es.forEach(e => { const dd = Math.hypot(m.x - e.x, m.y - e.y); if (dd < d) { d = dd; a = e; } }); if (a && d <= RANGE) { m.cd = CD; a.hp--; atk.push({ x1: m.x, y1: m.y, x2: a.x, y2: a.y, l: .14 }); if (a.hp <= 0) { es.splice(es.indexOf(a), 1); kills++; if (a.tp === 'g' || a.tp === 'h') { const f = a.tp === 'h' ? 'g' : 'n', vbFilho = a.vb * .62; mk(f, a.x - 8, a.y, vbFilho, a.ae, true); mk(f, a.x + 8, a.y, vbFilho, a.ae, true); } } } });
        for (let i = atk.length - 1; i >= 0; i--) { atk[i].l -= dt; if (atk[i].l <= 0) atk.splice(i, 1); }
        if ((wave >= WAVES && !es.length) || t > 90) S.done = true; },
      resultado() { const v = S.vivos(); return S.perdeu ? .3 * Math.min(1, S.wave / WAVES) : .4 + .6 * v / NM; } };   // perdeu o Estírio: no máximo 30%; sobreviveu: 40% + 60% pelos heróis vivos
    return S;
  }

  const GAMES = {
    // 1. portas: 3 rodadas, 3 portas cada; última porta pode dar uma carta
    maiormenor(body, c, fim) {
      let rod = 0, acum = 0, busy = false; const R = 3;
      const flash = () => { const el = mk('<div class="mg-portal-flash" aria-hidden="true"></div>'); body.append(el); setTimeout(() => el.remove(), 480); };
      const pendulos = () => { const el = mk('<div class="mg-portal-pendulos" aria-hidden="true">' + Array.from({ length: 7 }, (_, i) => `<i style="--i:${i}">◈</i>`).join('') + '</div>'); body.append(el); setTimeout(() => el.remove(), 1050); };
      const tier = a => c.cortes.filter(x => a >= x - 1e-9).length, prem = a => c.premios[tier(a)] | 0;
      const painel = () => `<div class="mg-prog"><div class="mg-bar"><i style="width:${Math.round(acum * 100)}%"></i>${c.cortes.map((x, i) => `<u style="left:${Math.round(x * 100)}%"><b>${['Bom', 'Ótimo', 'Perfeito'][i]}</b></u>`).join('')}</div><p>Prêmio atual: <b>${prem(acum)} ◈</b> · próximo nível: ${tier(acum) < 3 ? c.premios[tier(acum) + 1] + ' ◈ aos ' + Math.round(c.cortes[tier(acum)] * 100) + '%' : 'máximo'}</p></div>`;
      const tela = () => { const ult = rod === R - 1, res = shuffle(ult ? (c.hard ? ['pend', 'carta', 'perde', 'perde'] : ['pend', 'carta', 'perde']) : (c.hard ? ['pend', 'passa', 'perde', 'perde'] : ['pend', 'perde', 'passa']));
        const portais = c.hard ? ['ciano', 'violeta', 'dourado', 'verde'] : ['ciano', 'violeta', 'dourado'];
        body.innerHTML = `<p class="mg-q mg-porta-q">${ult ? 'Última porta' : 'Porta ' + (rod + 1) + '/' + R}<br><small>Escolha um portal${c.hard ? ' · 2 estão vazios' : ''}</small></p>${painel()}<div class="mg-portas${c.hard ? ' q4' : ''}">${portais.map((p, i) => `<button class="mg-porta" data-i="${i}" data-portal="${p}" style="--d:${i * 85}ms"><span>${i + 1}</span></button>`).join('')}</div>`; busy = false;
        body.onclick = async e => { const b = e.target.closest('.mg-porta'); if (!b || busy) return; busy = true; const r = res[+b.dataset.i]; b.classList.add('open'); SND.play('flip');
          body.querySelectorAll('.mg-porta').forEach(x => x !== b && x.classList.add('recuo'));
          b.innerHTML = r === 'pend' ? '<span>+' + (ult ? 50 : 25) + '% do prêmio</span>' : r === 'carta' ? '<span>Uma carta! Prêmio máximo</span>' : r === 'passa' ? '<span>Passagem livre (nada muda)</span>' : '<span>Vazia! Fim</span>';
          if (r === 'pend') pendulos();
          await wait(920);
          if (r === 'perde') { SND.play('lose'); return fim(0, 'A porta estava vazia'); }
          if (r === 'pend') { const a0 = prem(acum); acum += ult ? .5 : .25; SND.play('capture'); const gan = prem(acum) - a0; const bn = mk('<div class="mg-ganho">' + (gan > 0 ? '+' + gan + ' ◈ no prêmio!' : 'Prêmio sobe: ' + Math.round(acum * 100) + '%') + '</div>'); body.append(bn); setTimeout(() => bn.remove(), 900); await wait(700); }
          else if (r === 'carta') { SND.play('bauOpen'); flash(); await wait(520); return fim(1, 'Ganhou uma carta', { carta: pick(CARTAS().filter(x => !x.uniao && x.id !== 'S11')).id }); }
          flash(); await wait(520); rod++; if (rod >= R) return fim(Math.min(1, acum), 'Terminou as portas'); tela(); }; };
      tela();
    },
    // 2. Ecos Estelares (memória): 6 pares, com tempo limite; a nota máxima é possível com ~10 jogadas
    memoria(body, c, fim) {
      const P = c.hard ? 8 : 6, T0 = Math.round((c.hard ? 100 : 75) / c.dif), FOLGA = c.hard ? 24 : 18, ids = randCards(P), deck = shuffle(ids.concat(ids)); let open = [], moves = 0, found = 0, lock = false, acabou = false, left = T0;
      body.innerHTML = `<p class="mg-q" id="mq"></p><div class="mg-grid g4"></div>`; const g = $('.mg-grid', body), mq = $('#mq', body);
      const txt = () => { mq.innerHTML = 'Jogadas: ' + moves + ' · <b>' + left + ' s</b>'; }; txt();
      const tm = setInterval(() => { if (acabou) return; left--; txt(); if (left <= 0) { acabou = true; clearInterval(tm); fim(found / P * .45, found + ' de ' + P + ' pares (tempo esgotado)'); } }, 1000);
      deck.forEach((id, i) => { const b = mk('<button class="mg-cell" aria-label="carta"></button>'); b.dataset.i = i; b.append(hidden(66)); g.append(b); });
      g.onclick = async e => { const b = e.target.closest('.mg-cell'); if (!b || lock || acabou || b.classList.contains('on') || b.classList.contains('ok')) return; const i = +b.dataset.i;
        b.classList.add('on'); b.replaceChildren(card(deck[i], 66)); SND.play('flip'); open.push(i);
        if (open.length === 2) { lock = true; moves++; txt(); const [x, y] = open; const cx = g.children[x], cy = g.children[y];
          await wait(750); if (acabou) return; if (deck[x] === deck[y]) { cx.classList.add('ok'); cy.classList.add('ok'); found++; SND.play('capture'); } else { [cx, cy].forEach(z => { z.classList.remove('on'); z.replaceChildren(hidden(66)); }); }
          open = []; lock = false; if (found === P) { acabou = true; clearInterval(tm); fim(1 - (moves - P - (c.hard ? 6 : 4)) / (FOLGA / c.dif), moves + ' jogadas em ' + (T0 - left) + ' s'); } } };
      return () => { acabou = true; clearInterval(tm); };
    },
    // 3. Silhuetas (quem é quem): só alguns trechos escuros da imagem da carta aparecem; 8 perguntas, 10 s cada
    quemequem(body, c, fim) {
      const N = c.hard ? 12 : 8; let n = 0, ok = 0, tm = null, left = Math.round((c.hard ? 67 : 60) / c.dif), done = false, acabou = false;   // tempo total para as 8 cartas
      const trechos = id => { const src = (window.CARD_IMAGES || {})[id]; if (!src) return null; const W = 150, H = 200, k = c.hard ? 3 : 3 + (Math.random() < .5 ? 1 : 0), cs = [];
        for (let i = 0; i < k; i++) cs.push(`radial-gradient(circle ${c.hard ? 28 + rnd(10) : 34 + rnd(12)}px at ${22 + rnd(W - 44)}px ${22 + rnd(H - 44)}px, #000 55%, transparent 100%)`);
        const d = mk(`<div class="mg-frag" style="width:${W}px;height:${H}px;background-image:url(${src});-webkit-mask-image:${cs.join(',')};mask-image:${cs.join(',')}"></div>`); return d; };
      const q = () => { const cs = randCards(4), alvo = cs[0], opts = shuffle(cs);
        body.innerHTML = `<p class="mg-q" id="mq">Carta ${n + 1}/${N} · tempo total <span id="tl">${left}</span>s</p><div class="mg-c" id="mA"></div><div class="mg-btns col">${opts.map(o => `<button class="btn" data-id="${o}">${U.CARDS[o].nome}</button>`).join('')}</div>`;
        const A = $('#mA', body), fr = trechos(alvo); A.classList.add('mg-fragbox'); if (fr) A.append(fr); else { const ce0 = card(alvo, 150); ce0.style.filter = 'brightness(0)'; A.append(ce0); } done = false;
        const resp = async id => { if (done || acabou) return; done = true; A.classList.remove('mg-fragbox'); A.replaceChildren(card(alvo, 150)); const certo = id === alvo; if (certo) ok++; SND.play(certo ? 'win' : 'lose'); await wait(1100); if (acabou) return; n++; if (n >= N) { acabou = true; clearInterval(tm); fim(ok / N, ok + ' de ' + N + ' acertos'); } else q(); };
        body.onclick = e => { const b = e.target.closest('[data-id]'); if (b) resp(b.dataset.id); };
      };
      q(); tm = setInterval(() => { left--; const t = $('#tl', body); if (t) t.textContent = left; if (left <= 0) { acabou = true; clearInterval(tm); fim(ok / N, ok + ' de ' + N + ' acertos (tempo esgotado)'); } }, 1000); return () => { acabou = true; clearInterval(tm); };
    },
    // 4. Dança das Cartas: uma carta é marcada, todas viram e trocam de lugar à vista; acerte onde ela foi parar (6 rodadas)
    ordem(body, c, fim) {
      const R = 6, AV = Math.min(380, body.clientWidth || 360) - 12; let rodada = 0, ok = 0, acabou = false, vidas = 3;   // 3 vidas: errar a carta tira uma; sem vidas o jogo termina
      const cor = () => '<span class="mg-vd">' + '♥'.repeat(vidas) + '<i>' + '♥'.repeat(3 - vidas) + '</i></span>';
      const passa = (area, r) => { const tp = pick(['cometa', 'nebulosa', 'nave']), top = Math.round(Math.random() * 80) - 10, dir = Math.random() < .5 ? 1 : -1, dur = 1.1 + Math.random() * .9, e = mk(`<i class="mg-pass ${tp}" style="top:${top}%;--d:${dur.toFixed(2)}s;--dir:${dir}"></i>`); area.append(e); setTimeout(() => e.remove(), dur * 1000 + 100); };   // objetos do tema cruzando a mesa para atrapalhar
      const rod = async () => {
        const n = c.hard ? [5, 5, 6, 6, 7, 8][rodada] : [3, 3, 4, 4, 5, 5][rodada], GAP = 6, CW = Math.min(78, Math.floor((AV - (n - 1) * GAP) / n)), H = Math.round(CW * 1.5), trocas = 6 + rodada * 3, vh = c.hard ? 1.3 : 1, v0 = Math.max(220, 600 - rodada * 55) / c.dif / vh, v1 = Math.max(105, 230 - rodada * 26) / c.dif / vh, ids = randCards(n), alvo = rnd(n);
        body.innerHTML = `<p class="mg-q" id="mq">${cor()} Rodada ${rodada + 1}/${R} · ${n} cartas<br>Memorize a carta marcada</p><div class="mg-dance" style="width:${n * (CW + GAP) - GAP}px;height:${H + 56}px"></div>`;
        const area = $('.mg-dance', body), pos = Array.from({ length: n }, (_, i) => i), it = [], mq = $('#mq', body); let pronto = false;
        const x = p => p * (CW + GAP), base = 28;
        ids.forEach((id, i) => { const d = mk('<button class="mg-dc"></button>'); d.style.cssText = `width:${CW}px;height:${H}px;transform:translate(${x(i)}px,${base}px);transition:transform 300ms ease-in-out`; d.append(card(id, CW)); if (i === alvo) d.classList.add('mark'); d.dataset.i = i; area.append(d); it.push(d); });
        await wait(1700); if (acabou) return; it.forEach(d => { d.classList.remove('mark'); d.replaceChildren(hidden(CW)); }); SND.play('flip'); await wait(450);
        mq.innerHTML = cor() + ' Acompanhe com os olhos…';
        const tema = c.hard && rodada >= R - 2; let ult = 0;
        for (let k = 0; k < trocas; k++) { if (acabou) return;
          if (tema && Date.now() - ult > 650) { ult = Date.now(); passa(area, rodada); }
          const f = trocas > 1 ? k / (trocas - 1) : 1, vel = v0 + (v1 - v0) * f, pares = 1 + (n >= 5 && f > .35 ? 1 : 0) + (n >= 7 && f > .7 ? 1 : 0) + (c.hard && n >= 6 && f > .5 ? 1 : 0), slots = shuffle(pos.map((_, i) => i)), lift = new Map();   // começa lenta e acelera; nas últimas trocas vários pares dançam juntos
          for (let q = 0; q < pares && q * 2 + 1 < n; q++) { const sa = slots[q * 2], sb = slots[q * 2 + 1], ia = pos.indexOf(sa), ib = pos.indexOf(sb); pos[ia] = sb; pos[ib] = sa; const alt = 12 + f * 16, ang = 5 + f * 11, sg = (k + q) % 2 ? 1 : -1; lift.set(ia, { y: -sg * alt, a: sg * ang }); lift.set(ib, { y: sg * alt, a: -sg * ang }); }
          it.forEach((d, i) => { const l = lift.get(i); d.style.transition = `transform ${Math.round(vel)}ms cubic-bezier(.45,0,.25,1)`; d.style.transform = `translate(${x(pos[i])}px,${base + (l ? l.y : 0)}px) rotate(${l ? l.a : 0}deg)`; });
          if (vel > 110) SND.play('tick'); await wait(vel + 12); }
        it.forEach((d, i) => { d.style.transition = 'transform 260ms ease-out'; d.style.transform = `translate(${x(pos[i])}px,${base}px)`; }); await wait(300);
        if (acabou) return; mq.innerHTML = cor() + ' Onde está a carta marcada?'; pronto = true;
        area.onclick = async e => { const d = e.target.closest('.mg-dc'); if (!d || !pronto) return; pronto = false; const i = +d.dataset.i, certo = i === alvo; if (certo) ok++; else vidas--; SND.play(certo ? 'win' : 'lose');
          it.forEach((z, j) => { z.replaceChildren(card(ids[j], CW)); if (j === alvo) z.classList.add('mark'); }); d.classList.add(certo ? 'right' : 'wrong'); mq.innerHTML = cor() + (certo ? ' <b class="mg-acerto">Acertou!</b>' : ' <b class="mg-erro">Errou! Perdeu uma vida</b>'); await wait(1500); if (acabou) return; rodada++; if (vidas <= 0) { acabou = true; fim(ok / R, ok + ' de ' + R + ' rodadas (sem vidas)'); } else if (rodada >= R) { acabou = true; fim(ok / R, ok + ' de ' + R + ' rodadas'); } else rod(); };
      };
      rod(); return () => { acabou = true; };
    },
    // 5. Maré Rubra (contágio): as vermelhas começam longe das azuis, espalhadas pelos cantos; as azuis vagueiam
    mineracao(body, c, fim) {
      const cv = mk('<canvas class="mg-cv"></canvas>'); body.append(cv); const W = cv.width = Math.min(380, body.clientWidth || 360), H = cv.height = 440, g = cv.getContext('2d');
      const HH = c.hard, NB = 12, R = 11, T = Math.round(24 / c.dif), V = 26 * c.dif * (HH ? 1.12 : 1), VB = 24 * (HH ? 1.15 : 1), VY = V * .72, RY = R * 1.28; const bs = [];
      const cantos = shuffle([[0, 0], [1, 0], [0, 1], [1, 1]]);
      cantos.forEach(([cx, cy]) => bs.push({ x: 28 + cx * (W - 56) + (cx ? -1 : 1) * rnd(26), y: 36 + cy * (H - 72) + (cy ? -1 : 1) * rnd(26), r: true }));
      if (HH) { const lado = Math.random() < .5 ? 0 : 1; [0, 1].forEach(i => bs.push({ x: i ? W - 22 : 22, y: H / 2 + (i === lado ? -1 : 1) * (10 + rnd(50)), r: true, am: true, a: i ? Math.PI : 0 })); }   // Hard: 2 amarelas nas pontas laterais (dormem ~3 s e nascem longe das azuis)
      for (let i = 0; i < NB; i++) { let x, y, k = 0; do { x = 36 + Math.random() * (W - 72); y = 50 + Math.random() * (H - 100); k++; } while (k < 300 && bs.some(b => b.r && Math.hypot(b.x - x, b.y - y) < (b.am ? 115 : 150))); const a = Math.random() * 6.283; bs.push({ x, y, r: false, a }); }
      let drag = null, last = 0, raf = 0, t0 = 0, acabou = false;
      const pos = e => { const b = cv.getBoundingClientRect(); return { x: (e.clientX - b.left) * W / b.width, y: (e.clientY - b.top) * H / b.height }; };
      cv.onpointerdown = e => { const p = pos(e); let m = null, d = 1e9; bs.forEach(b => { const dd = Math.hypot(b.x - p.x, b.y - p.y); if (b.r && dd < 34 && dd < d) { d = dd; m = b; } }); if (m) { drag = m; cv.setPointerCapture(e.pointerId); } };
      cv.onpointermove = e => { if (!drag) return; const p = pos(e); drag.x = Math.max(R, Math.min(W - R, p.x)); drag.y = Math.max(R, Math.min(H - R, p.y)); };
      cv.onpointerup = cv.onpointercancel = () => { drag = null; };
      const fimJogo = () => { if (acabou) return; acabou = true; cancelAnimationFrame(raf); const az = bs.filter(b => !b.r).length; fim([0, .4, .55, .7, .8, 1][Math.min(5, az)], az + (az === 1 ? ' azul salva' : ' azuis salvas')); };   // 1 azul já vence; 5 ou mais é o máximo
      const loop = ts => { if (acabou) return; if (!t0) t0 = ts; const dt = Math.min(.05, (ts - (last || ts)) / 1000); last = ts;
        const azuis = bs.filter(b => !b.r);
        azuis.forEach(b => { b.a += (Math.random() - .5) * 5 * dt; b.x += Math.cos(b.a) * VB * dt; b.y += Math.sin(b.a) * VB * dt; if (b.x < R || b.x > W - R) { b.a = Math.PI - b.a; b.x = Math.max(R, Math.min(W - R, b.x)); } if (b.y < R + 22 || b.y > H - R) { b.a = -b.a; b.y = Math.max(R + 22, Math.min(H - R, b.y)); } });
        const dorme = ts - t0 < 3000; bs.forEach(b => { if (!b.r || b === drag || !azuis.length || (b.am && dorme)) return; let t = null, d = 1e9; azuis.forEach(z => { const dd = Math.hypot(z.x - b.x, z.y - b.y); if (dd < d) { d = dd; t = z; } }); const vv = b.am ? VY : V * (b.boost || 1); b.x += (t.x - b.x) / d * vv * dt; b.y += (t.y - b.y) / d * vv * dt; });
        bs.forEach(b => { if (!b.r || (b.am && dorme)) return; azuis.forEach(z => { if (!z.r && Math.hypot(z.x - b.x, z.y - b.y) < (b.am ? RY + R * .9 : R * 1.8)) { z.r = true; if (b.am) z.am = true; SND.play('lose'); } }); });
        bs.forEach(yl => { if (!yl.am || dorme) return; bs.forEach(rd => { if (rd.r && !rd.am && Math.hypot(rd.x - yl.x, rd.y - yl.y) < R + RY + 2 && (!rd.bt || ts - rd.bt > 900)) { rd.bt = ts; rd.boost = Math.min(1.7, (rd.boost || 1) * 1.25); SND.play('tick'); } }); });   // amarela encostando numa vermelha: ela fica mais rápida
        g.clearRect(0, 0, W, H); bs.forEach(b => { const cor = b.am ? '#ffd25f' : b.r ? '#ff3b4f' : '#4cc3ff', R = b.am ? RY : 11; g.save(); if (b.am && dorme) g.globalAlpha = .45; g.save(); g.globalAlpha=.28; g.strokeStyle=cor; g.lineWidth=3; g.beginPath(); g.moveTo(b.x-Math.cos(b.a||0)*18,b.y-Math.sin(b.a||0)*18); g.lineTo(b.x,b.y); g.stroke(); g.globalAlpha=(b.am&&dorme)?.45:1; g.beginPath(); g.arc(b.x,b.y,R+4,0,7); g.fillStyle=cor+'33'; g.fill(); g.beginPath(); g.arc(b.x,b.y,R,0,7); g.fillStyle=b.am?'#c9951a':b.r?'#b90f32':'#167fc9'; g.shadowColor=cor; g.shadowBlur=b===drag?24:13; g.fill(); g.shadowBlur=0; g.beginPath(); g.arc(b.x-R*.28,b.y-R*.3,R*.35,0,7); g.fillStyle='#ffffffb8'; g.fill(); g.restore(); g.restore(); });
        const rest = T - (ts - t0) / 1000; g.fillStyle = '#fff'; g.font = '700 14px sans-serif'; g.fillText(Math.max(0, rest).toFixed(0) + ' s · azuis ' + bs.filter(b => !b.r).length, 10, 18);
        if (!bs.some(b => !b.r)) return fimJogo(); if (rest <= 0) return fimJogo(); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop); return () => { acabou = true; cancelAnimationFrame(raf); };
    },
    // 6. asteroides: 30 s, 3 vidas
    asteroides(body, c, fim) {
      const cv = mk('<canvas class="mg-cv"></canvas>'); body.append(cv); const W = cv.width = Math.min(380, body.clientWidth || 360), H = cv.height = Math.min(520, (body.clientHeight || 560) - 10), g = cv.getContext('2d'), sprites = new Image(); sprites.src = 'cena/minigames/rota-meteoros-sprites.png';
      let x = W / 2, vidas = 3, moedas = 0, t = 0, last = 0, raf = 0, acabou = false, dano = 0, morto = 0, shake = 0; const parts = [], obs = [], T = 30, META = 14, HS = c.hard ? 1.3 : 1, YS = H - 40, FOLGA = 54;
      // vão garantido: antes de nascer uma rocha, confere se sobra espaço para a nave (28 px + margem) entre as rochas que chegam quase juntas
      const temVao = n => { const tn = (YS - n.y) / n.v, iv = [[n.x - n.r - 18, n.x + n.r + 18]]; obs.forEach(o => { if (o.k !== 'r') return; const to = (YS - o.y) / o.v; if (Math.abs(to - tn) < .55) iv.push([o.x - o.r - 18, o.x + o.r + 18]); }); iv.sort((a, b) => a[0] - b[0]); let cur = 18, melhor = 0; iv.forEach(([a, b]) => { if (a > cur) melhor = Math.max(melhor, a - cur); cur = Math.max(cur, b); }); melhor = Math.max(melhor, W - 18 - cur); return melhor >= FOLGA; }; const mover = e => { const r = cv.getBoundingClientRect(); x = Math.max(18, Math.min(W - 18, (e.clientX - r.left) * W / r.width)); };
      cv.addEventListener('pointermove', mover); cv.addEventListener('pointerdown', mover); cv.style.touchAction = 'none';
      const fin = () => { if (acabou) return; acabou = true; fim(moedas / META, moedas + ' pêndulos, ' + vidas + ' vidas'); };
      const faiscas = (px, py, n, cor, vel) => { for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, v = (.3 + Math.random()) * (vel || 160); parts.push({ x: px, y: py, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: .5 + Math.random() * .5, m: 1, cor }); } };
      const loop = ts => { const dt = Math.min(.05, (ts - last) / 1000 || 0); last = ts; t += dt; if (dano > 0) dano -= dt; if (shake > 0) shake -= dt; if (morto > 0) { morto -= dt; if (morto <= 0) return fin(); }
        if (!morto && Math.random() < dt * (2.2 + t / 12) * c.dif * (c.hard ? 1.12 : 1)) { const grande = c.hard && Math.random() < .16, r = grande ? 31 + Math.random() * 8 : 10 + Math.random() * 15, nr = { k: 'r', x: r + 4 + Math.random() * (W - r * 2 - 8), y: -r, r, v: (grande ? 95 + Math.random() * 40 : 120 + Math.random() * 90) * c.dif * HS, grande }; if (temVao(nr)) obs.push({ k: 'r', grande, x: nr.x, y: -r, r, v: nr.v, a: Math.random() * 6.28, spin: (Math.random() - .5) * 2.4, cor: pick(['#91819a', '#9a7161', '#667b92', '#876d88']), pts: 6 + rnd(4), sprite: 1 + rnd(3), tr: [] }); }
        if (!morto && Math.random() < dt * 1.1) obs.push({ k: 'c', x: 16 + Math.random() * (W - 32), y: -14, r: 10, v: 110 * HS, a: 0, sprite: 4 + rnd(2), tr: [] });
        g.save(); if (shake > 0) g.translate((Math.random() - .5) * 9 * shake / .35, (Math.random() - .5) * 9 * shake / .35); g.fillStyle = '#05030f'; g.fillRect(-10, -10, W + 20, H + 20); g.fillStyle = '#ffffff55'; for (let i = 0; i < 30; i++) g.fillRect((i * 97) % W, (i * 53 + t * 40 * (1 + i % 3)) % H, 1.5, 1.5);
        for (let i = obs.length - 1; i >= 0; i--) { const o = obs[i]; o.y += o.v * dt; if (o.vx) o.x += o.vx * dt; const hit = !morto && Math.hypot(o.x - x, o.y - (H - 40)) < o.r + 14 && (o.k === 'c' || dano <= 0);
          if (hit) { obs.splice(i, 1); if (o.k === 'c') { moedas++; SND.play('tick'); } else { vidas--; dano = 1.3; shake = .35; faiscas(x, H - 42, 14, '#ff9a5c', 200); if (vidas <= 0) { morto = 1.4; boom(); faiscas(x, H - 42, 60, '#ffd25f', 280); faiscas(x, H - 42, 40, '#ff4f4f', 200); } else crash(); if (o.grande) { [-1, 1].forEach(d => obs.push({ k: 'r', frag: true, x: o.x, y: o.y - 6, r: 9, v: 135 * HS, vx: d * (110 + Math.random() * 40), a: 0, spin: d * 4, cor: o.cor, pts: 6, sprite: 1 + rnd(3), tr: [] })); } } continue; } if (o.x < -40 || o.x > W + 40) { obs.splice(i, 1); continue; } if (o.y > H + 30) { obs.splice(i, 1); continue; } o.tr.unshift({ x:o.x, y:o.y }); o.tr.length = Math.min(o.tr.length, 5); o.a += o.spin * dt;
          g.save(); g.globalAlpha=.16; g.strokeStyle=o.k==='c'?'#ffcf5a':o.cor; g.lineWidth=o.k==='c'?3:4; g.beginPath(); o.tr.forEach((p,j)=>j?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y)); g.stroke(); g.globalAlpha=1; g.translate(o.x,o.y); const sx=(o.sprite%3)*256, sy=Math.floor(o.sprite/3)*256, sz=o.k==='c'?42:o.r*2.7; if(sprites.complete&&sprites.naturalWidth){ g.rotate(o.k==='r'?o.a:0); g.drawImage(sprites,sx,sy,256,256,-sz/2,-sz/2,sz,sz); } else if(o.k==='c'){ g.strokeStyle='#ffe899'; g.lineWidth=2; g.beginPath(); g.arc(0,0,7,0,7); g.stroke(); g.beginPath(); g.moveTo(0,7); g.lineTo(0,16); g.stroke(); g.fillStyle='#ffd25f'; g.beginPath(); g.arc(0,0,5,0,7); g.fill(); } else { g.rotate(o.a); g.beginPath(); for(let p=0;p<o.pts;p++){const a=p*6.283/o.pts, rr=o.r*(p%2?.74:1); p?g.lineTo(Math.cos(a)*rr,Math.sin(a)*rr):g.moveTo(Math.cos(a)*rr,Math.sin(a)*rr); } g.closePath(); g.fillStyle=o.cor; g.strokeStyle='#d7c6bd88'; g.lineWidth=1.5; g.fill(); g.stroke(); } g.restore(); }
        if (!morto) { const pisca = dano > 0 && Math.floor(t * 16) % 2; g.save(); if (pisca) g.globalAlpha = .35; g.save(); g.globalAlpha=.2; g.strokeStyle='#71eaff'; g.lineWidth=5; g.beginPath(); g.moveTo(x,H-17); g.lineTo(x,H-62); g.stroke(); g.restore(); g.save(); g.translate(x,H-42); if(sprites.complete&&sprites.naturalWidth) g.drawImage(sprites,0,0,256,256,-32,-32,64,64); else { g.fillStyle='#60dfff'; g.shadowColor='#60dfff'; g.shadowBlur=16; g.beginPath(); g.moveTo(0,-20); g.lineTo(-17,15); g.lineTo(0,9); g.lineTo(17,15); g.closePath(); g.fill(); g.fillStyle='#10284f'; g.beginPath(); g.moveTo(0,-12); g.lineTo(-6,5); g.lineTo(6,5); g.closePath(); g.fill(); } g.restore(); g.restore(); }
        parts.forEach(q => { q.x += q.vx * dt; q.y += q.vy * dt; q.l -= dt; }); for (let i = parts.length - 1; i >= 0; i--) if (parts[i].l <= 0) parts.splice(i, 1); parts.forEach(q => { g.globalAlpha = Math.max(0, q.l * 1.6); g.fillStyle = q.cor; g.beginPath(); g.arc(q.x, q.y, 2.5, 0, 7); g.fill(); }); g.globalAlpha = 1;
        if (morto > 0) { const pr = 1 - morto / 1.4; g.save(); g.globalAlpha = Math.max(0, 1 - pr); const gr = g.createRadialGradient(x, H - 42, 0, x, H - 42, 20 + pr * 90); gr.addColorStop(0, '#fff'); gr.addColorStop(.35, '#ffd25f'); gr.addColorStop(.7, '#ff5a2a'); gr.addColorStop(1, '#ff5a2a00'); g.fillStyle = gr; g.beginPath(); g.arc(x, H - 42, 20 + pr * 90, 0, 7); g.fill(); g.restore(); }
        if (dano > 0) { g.fillStyle = 'rgba(255,40,40,' + (Math.max(0, dano - 1.0) * .9) + ')'; g.fillRect(0, 0, W, H); }
        g.restore();
        g.fillStyle = '#fff'; g.font = '700 14px system-ui'; g.fillText('Pêndulos ' + moedas + '   Vidas ' + vidas + '   ' + Math.max(0, Math.ceil(T - t)) + 's', 10, 20);
        if (t >= T) return fin(); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop); return () => { acabou = true; cancelAnimationFrame(raf); };
    },
    // 8. cofre: mastermind 4 de 6, 6 tentativas
    cofre(body, c, fim) {
      const H = c.hard, NS = H ? 5 : 4, TMAX = H ? 7 : 6, SYM = ['✦', '☾', '◇', '≈', '✚', '☄'], NOME = ['Estrela', 'Lua', 'Cristal', 'Maré', 'Chave', 'Cometa'], COR = ['#ffd25f', '#9dbaff', '#c58cff', '#56dcff', '#7dffb0', '#ff8a5c'], codigo = Array.from({ length: NS }, () => rnd(6)); let tent = [], atual = Array(NS).fill(null), fixo = Array(NS).fill(false), left = Math.round((H ? 150 : 110) / c.dif), acabou = false;
      body.classList.add('cf-body');
      const tmC = setInterval(() => { if (acabou) return; left--; const t = $('#cft', body); if (t) t.textContent = left; if (left <= 0) { acabou = true; clearInterval(tmC); fim(0, 'Tempo esgotado: o código era ' + codigo.map(s => SYM[s]).join(' ')); } }, 1000);
      const pos5 = i => { const a = (-90 + i * 72) * Math.PI / 180; return `left:${(50 + 30.5 * Math.cos(a) - 9).toFixed(1)}%;top:${(50 + 30.5 * Math.sin(a) - 9).toFixed(1)}%;`; };
      const pinta = () => { const hs = $('.cf-hist', body), sc = hs ? hs.scrollTop : 0;
        body.innerHTML = `<div class="cf-top"><b>COFRE DE BORDO</b><span>Tentativa ${Math.min(tent.length + 1, TMAX)}/${TMAX} · <i id="cft">${left}</i> s</span></div><div class="mg-cofre${H ? ' c5' : ''}"><div class="cf-disc">${atual.map((v, i) => `<i class="cf-slot ${fixo[i] ? 'fixo' : ''}" data-i="${i}" style="--cor:${v != null ? COR[v] : '#9a865f'};${H ? pos5(i) : ''}">${v != null ? SYM[v] : '·'}<sup class="cf-n">${i + 1}</sup></i>`).join('')}<b class="cf-core">JASMEY</b></div></div><div class="mg-hist cf-hist">${tent.map((t, k) => `<div class="mg-linha cf-tent${t.p === NS ? ' cf-win' : ''}"><u class="cf-k">${k + 1}</u>${t.g.map((s, i) => `<i class="cf-mini ${t.st[i]}" style="--cor:${COR[s]}">${SYM[s]}</i>`).join('')}<span class="cf-ret"><b>◆ ${t.p}</b><em>◇ ${t.q}</em></span></div>`).join('')}</div><div class="cf-runas">${SYM.map((s, i) => `<button class="cf-runa" data-s="${i}" style="--cor:${COR[i]}" aria-label="${NOME[i]}"><b>${s}</b><small>${NOME[i]}</small></button>`).join('')}</div><div class="mg-btns cf-acoes"><button class="btn" data-a="del">Apagar</button><button class="btn primary" data-a="ok" ${atual.every(x => x != null) ? '' : 'disabled'}>Testar código</button></div><p class="hint cf-hint"><b>◆</b> símbolo e posição certos (brilho dourado) · <b>◇</b> símbolo certo em outro encaixe (anel azul)</p>`;
        const h2 = $('.cf-hist', body); if (h2) h2.scrollTop = sc || h2.scrollHeight; };
      body.onclick = e => { const b = e.target.closest('button'); if (!b || acabou) return; if (b.dataset.s != null) { const k = atual.findIndex((x, i) => x == null && !fixo[i]); if (k >= 0) atual[k] = +b.dataset.s; } else if (b.dataset.a === 'del') { for (let i = NS - 1; i >= 0; i--) if (atual[i] != null && !fixo[i]) { atual[i] = null; break; } } else if (b.dataset.a === 'ok' && atual.every(x => x != null)) {
          const st = atual.map((s, i) => s === codigo[i] ? 'p' : ''), p = st.filter(x => x).length, rest = codigo.filter((s, i) => s !== atual[i]); let q = 0; atual.forEach((s, i) => { if (st[i]) return; const k = rest.indexOf(s); if (k >= 0) { q++; rest.splice(k, 1); st[i] = 'q'; } });
          tent.push({ g: atual.slice(), p, q, st }); SND.play(p === NS ? 'win' : 'tick'); if (p === NS) { acabou = true; clearInterval(tmC); return fim((TMAX + 1 - tent.length) / TMAX, 'Aberto na tentativa ' + tent.length); } if (tent.length >= TMAX) { acabou = true; clearInterval(tmC); return fim(0, 'O código era ' + codigo.map(s => SYM[s]).join(' ')); }
          fixo = atual.map((x, i) => x === codigo[i]); atual = atual.map((x, i) => fixo[i] ? x : null); const hs = $('.cf-hist', body); if (hs) hs.scrollTop = 1e6; } SND.play('tick'); pinta(); };
      pinta(); return () => { acabou = true; clearInterval(tmC); };
    },
    // 9. sequência de sons: 4 instrumentos, cada rodada soma um som
    caracoroa(body, c, fim) {
      const MAX = 8, H = c.hard, SP = H ? 1.45 : 1, COR = H ? ['#ff8a5c', '#ffd25f', '#7dffb0', '#6cc6ff', '#c58cff', '#ff7ab0'] : ['#ff8a5c', '#6cc6ff', '#7dffb0', '#ffd25f'], NOTA = H ? [261.6, 293.7, 329.6, 392, 440, 523.3] : [261.6, 329.6, 392, 523.3], NOME = COR.map(() => ''), NN = COR.length;
      let ctx = null; const tom = (i, ms) => { try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); const o = ctx.createOscillator(), gn = ctx.createGain(); o.type = ['triangle', 'sine', 'square', 'sawtooth'][i % 4]; o.frequency.value = NOTA[i]; gn.gain.setValueAtTime(.0001, ctx.currentTime); gn.gain.exponentialRampToValueAtTime(.18, ctx.currentTime + .02); gn.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + ms / 1000); o.connect(gn); gn.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + ms / 1000 + .05); } catch (e) { } };
      let seq = [], pos = 0, vez = false, feitas = 0, tmo = null, esg = 0;
      const prox = () => { if (!H) return rnd(4); const ult = seq[seq.length - 1], pen = seq[seq.length - 2], usados = new Set(); for (let i = 1; i < seq.length; i++) usados.add(seq[i - 1] + '>' + seq[i]); const uso = Array(NN).fill(0); seq.forEach(v => uso[v]++);
        let cand = Array.from({ length: NN }, (_, i) => i).filter(n => n !== ult && !usados.has(ult + '>' + n) && !(pen != null && Math.abs(ult - pen) === 1 && n - ult === ult - pen)); if (!cand.length) cand = Array.from({ length: NN }, (_, i) => i).filter(n => n !== ult);
        const saltos = cand.filter(n => ult == null || Math.abs(n - ult) > 1); if (saltos.length) cand = saltos; const min = Math.min(...cand.map(n => uso[n])); cand = cand.filter(n => uso[n] <= min); return pick(cand); };   // Hard: usa as 6 notas por igual, sem repetir nota, par de notas, escadinha nem sequência já ouvida
      body.innerHTML = `<p class="mg-q" id="mq"></p>${H ? '<div class="mg-tmo"><i id="tmb" style="width:100%"></i></div>' : ''}<div class="mg-grid g3 sq" id="el"></div>`; const q = $('#mq', body), g = $('#el', body); g.style.gridTemplateColumns = H ? 'repeat(3, 100px)' : 'repeat(2, 120px)';
      NOME.forEach((n, i) => { g.append(mk(`<button class="mg-cell elo" data-i="${i}" style="--c:${COR[i]};height:${H ? 92 : 110}px">${n}</button>`)); });
      const acende = async i => { const b = g.children[i]; b.classList.add('on'); tom(i, 380 / c.dif / SP); await wait(400 / c.dif / SP); b.classList.remove('on'); await wait(160 / c.dif / SP); };
      const barra = $('#tmb', body), pare = () => { clearInterval(tmo); if (barra) barra.style.width = '0'; };
      const nova = async () => { vez = false; pare(); if (H && !seq.length) { while (seq.length < 3) seq.push(prox()); } else seq.push(prox()); pos = 0; q.textContent = 'Rodada ' + (feitas + 1) + '/' + MAX + ': ouça'; await wait(700); for (const i of seq) await acende(i); q.textContent = 'Sua vez'; vez = true;
        if (H) { const tot = (seq.length * .85 + 2.2) * 1000, t0 = Date.now(); if (barra) barra.style.width = '100%'; tmo = setInterval(async () => { const f = (Date.now() - t0) / tot; if (barra) barra.style.width = Math.max(0, 100 - f * 100) + '%'; if (f >= 1 && vez) { vez = false; pare(); SND.play('lose'); q.textContent = 'Tempo!'; await wait(900); fim(feitas / MAX, feitas + ' de ' + MAX + ' rodadas (tempo)'); } }, 80); } };
      g.onclick = async e => { const b = e.target.closest('.elo'); if (!b || !vez) return; const i = +b.dataset.i; acende(i);
        if (i !== seq[pos]) { vez = false; pare(); SND.play('lose'); q.textContent = 'Errou!'; await wait(900); return fim(feitas / MAX, feitas + ' de ' + MAX + ' rodadas'); }
        pos++; if (pos === seq.length) { vez = false; pare(); feitas++; SND.play('capture'); await wait(700); if (feitas >= MAX) return fim(1, 'Todas as rodadas'); nova(); } };
      nova();
    },
    // 11. Relâmpago dimensional (antiga raspadinha): três cartas viram e desviram rápido; uma dá +1, uma tira 1, uma nada. Toque o +1 o máximo de vezes
    raspadinha(body, c, fim) {
      const H = c.hard, NC = H ? 6 : 3, T = Math.round((H ? 24 : 22) / c.dif), META = H ? 13 : 16; let pts = 0, left = T, acabou = false, aberta = false, tocou = false, rodada = 0, tipos = [];
      body.innerHTML = `<p class="mg-q" id="mq"></p><div class="mg-grid g3"></div>`; const g = $('.mg-grid', body), mq = $('#mq', body);
      const txt = () => { mq.innerHTML = 'Pontos: <b>' + pts + '</b> · ' + left + ' s'; }; txt();
      for (let i = 0; i < NC; i++) { const b = mk('<button class="mg-cell scr">?</button>'); b.dataset.i = i; b.style.height = H ? '84px' : '110px'; g.append(b); }
      const tm = setInterval(() => { if (acabou) return; left--; txt(); if (left <= 0) { acabou = true; clearInterval(tm); fim(pts / META, pts + ' pontos'); } }, 1000);
      g.onclick = e => { const b = e.target.closest('.mg-cell'); if (!b || acabou || !aberta || tocou) return; tocou = true; const t = tipos[+b.dataset.i];
        if (t === 'mais') { pts++; SND.play('capture'); b.classList.add('rl-mais'); } else if (t === 'menos2') { pts = Math.max(0, pts - 2); SND.play('lose'); b.classList.add('rl-menos'); } else if (t === 'menos') { pts = Math.max(0, pts - 1); SND.play('lose'); b.classList.add('rl-menos'); } else SND.play('tick'); txt(); };
      (async () => { await wait(700); while (!acabou) {
        rodada++; tipos = shuffle(H ? ['mais', 'menos', 'menos2', 'nada', 'nada', 'nada'] : ['mais', 'nada', 'menos']); tocou = false; const dur = H ? Math.max(560, 1000 - rodada * 13) : Math.max(430, 720 - rodada * 8) / c.dif;
        [...g.children].forEach((b, i) => { b.classList.remove('rl-mais', 'rl-menos'); b.classList.add('open'); b.textContent = tipos[i] === 'mais' ? '+1' : tipos[i] === 'menos2' ? '−2' : tipos[i] === 'menos' ? '−1' : '·'; b.dataset.t = tipos[i]; });
        aberta = true; SND.play('flip'); await wait(dur); aberta = false;
        [...g.children].forEach(b => { b.classList.remove('open', 'rl-mais', 'rl-menos'); b.textContent = '?'; }); await wait(H ? Math.max(260, 400 - rodada * 4) : Math.max(230, 340 - rodada * 3) / c.dif); } })();
      return () => { acabou = true; clearInterval(tm); };
    },
    // 12. caça ao pêndulo: escuro, luz segue o dedo, 25 s
    cacapendulo(body, c, fim) {
      const cv = mk('<canvas class="mg-cv"></canvas>'); body.append(cv); const W = cv.width = Math.min(380, body.clientWidth || 360), H = cv.height = Math.min(520, (body.clientHeight || 560) - 10), g = cv.getContext('2d'), pendulo = new Image(), penduloSombrio = new Image(); pendulo.src = 'cena/minigames/pendulo-fugitivo.png'; penduloSombrio.src = 'cena/minigames/pendulo-fugitivo-sombrio.png';
      let mx = W / 2, my = H / 2, t = 0, last = 0, raf = 0, pegos = 0, acabou = false, apagao = 0; const moedas = [], T = 25, META = 12, HD = c.hard, R = 80;   // luz do Hard igual à do Normal
      const mal = () => { try { const ctx = SND.ctx; if (!ctx) return; const t0 = ctx.currentTime, gn = ctx.createGain(), o = ctx.createOscillator(), o2 = ctx.createOscillator(); o.type = 'sawtooth'; o2.type = 'square'; o.frequency.setValueAtTime(220, t0); o.frequency.exponentialRampToValueAtTime(48, t0 + 1.1); o2.frequency.setValueAtTime(233, t0); o2.frequency.exponentialRampToValueAtTime(51, t0 + 1.1); gn.gain.setValueAtTime(.0001, t0); gn.gain.exponentialRampToValueAtTime(.2, t0 + .04); gn.gain.exponentialRampToValueAtTime(.0001, t0 + 1.2); o.connect(gn); o2.connect(gn); gn.connect(SND.master || ctx.destination); o.start(t0); o2.start(t0); o.stop(t0 + 1.25); o2.stop(t0 + 1.25); } catch (e) { } };   // som de coisa ruim
      const mover = e => { const r = cv.getBoundingClientRect(); mx = (e.clientX - r.left) * W / r.width; my = (e.clientY - r.top) * H / r.height; }; cv.style.touchAction = 'none'; cv.addEventListener('pointermove', mover);
      cv.addEventListener('pointerdown', e => { mover(e); if (apagao > 0) return; for (let i = moedas.length - 1; i >= 0; i--) { const o = moedas[i]; if (Math.hypot(o.x - mx, o.y - my) < R && Math.hypot(o.x - mx, o.y - my) < 26 + o.r) { moedas.splice(i, 1); if (o.ruim) { apagao = 2.6; mal(); } else { pegos++; SND.play('bauCoin'); } break; } } });
      const fin = () => { if (acabou) return; acabou = true; fim(pegos / META, pegos + ' pêndulos'); };
      const loop = ts => { const dt = Math.min(.05, (ts - last) / 1000 || 0); last = ts; t += dt; if (Math.random() < dt * (HD ? 2 : 1.5) * c.dif) { const e = Math.floor(Math.random() * 4), x0 = e === 0 ? -12 : e === 1 ? W + 12 : Math.random() * W, y0 = e === 2 ? -12 : e === 3 ? H + 12 : Math.random() * H, ang = Math.atan2(H * (.2 + Math.random() * .6) - y0, W * (.2 + Math.random() * .6) - x0), v = (80 + Math.random() * 100) * c.dif * (HD ? 1.2 : 1); moedas.push({ x: x0, y: y0, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, r: 12, ruim: HD && Math.random() < .27 }); }
        if (apagao > 0) apagao -= dt;
        g.fillStyle = '#000'; g.fillRect(0, 0, W, H); moedas.forEach(o => { o.x += o.vx * dt; o.y += o.vy * dt; o.tr=(o.tr||[]); o.tr.unshift({x:o.x,y:o.y}); o.tr.length=5; }); for (let i = moedas.length - 1; i >= 0; i--) if (moedas[i].x < -40 || moedas[i].x > W + 40 || moedas[i].y < -40 || moedas[i].y > H + 40) moedas.splice(i, 1);
        g.save(); g.beginPath(); g.arc(mx, my, R, 0, 7); g.clip(); const gr = g.createRadialGradient(mx, my, 10, mx, my, R); gr.addColorStop(0, '#2b2260'); gr.addColorStop(1, '#0a0820'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
        moedas.forEach(o => { g.save(); g.globalAlpha=.25; g.strokeStyle=o.ruim?'#c04dff':'#ffd25f'; g.lineWidth=3; g.beginPath(); o.tr.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y)); g.stroke(); g.globalAlpha=1; g.translate(o.x,o.y); const art = o.ruim ? penduloSombrio : pendulo, tam = o.ruim ? 46 : 42; if (art.complete && art.naturalWidth) { g.drawImage(art, -tam / 2, -tam / 2, tam, tam); } else { g.shadowColor=o.ruim?'#c04dff':'#ffd25f'; g.shadowBlur=15; g.strokeStyle=o.ruim?'#d79bff':'#fff0ae'; g.fillStyle=o.ruim?'#4b1e7a':'#e7a735'; g.lineWidth=2; g.beginPath(); g.arc(0,0,7,0,7); g.fill(); g.stroke(); g.shadowBlur=0; g.strokeStyle='#d5a75a'; g.beginPath(); g.moveTo(0,7); g.lineTo(0,17); g.stroke(); g.beginPath(); g.moveTo(-7,17); g.lineTo(7,17); g.stroke(); } g.restore(); }); g.restore();
        if (apagao > 0) { g.fillStyle = '#000'; g.fillRect(0, 0, W, H); } else { g.strokeStyle = '#ffffff44'; g.beginPath(); g.arc(mx, my, R, 0, 7); g.stroke(); } g.fillStyle = apagao > 0 ? '#ff6a7a' : '#fff'; g.font = '700 14px system-ui'; g.fillText(apagao > 0 ? 'Escuridão… ' + Math.ceil(apagao) + 's' : 'Pêndulos ' + pegos + '   ' + Math.max(0, Math.ceil(T - t)) + 's', 10, 20); if (t >= T) return fin(); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop); return () => { acabou = true; cancelAnimationFrame(raf); };
    },
  };

  // ---------------- minigames por série
  Object.assign(GAMES, {
    // Diário Sobrenatural: Sussurro dos Elos — tela escura, segure o dedo e ouça: quanto mais perto do Elo, mais alto (mas sutil) o som. Toque duas vezes para confirmar
    elos(body, c, fim) {
      const HD = c.hard, R = 5, LIM = Math.round(30 / c.dif), HIT = HD ? 40 : 46 / Math.max(.7, c.dif), NBOMBA = HD ? 2 : 0; let bombas = [], bo1 = null, bo2 = null, bgn = null; let rodada = 0, pts = 0, acabou = false, travado = false, left = LIM, tm = 0, alvo = null, seg = false, ult = null, tap = null, last = null, rev = null;
      const cv = mk('<canvas class="mg-cv"></canvas>'); body.append(cv); const W = cv.width = Math.min(380, body.clientWidth || 360), H = cv.height = 440, g = cv.getContext('2d'), MAXD = Math.hypot(W, H) * .8;
      let ctx = null, osc = null, gn = null;
      const som = on => { try { if (on && !osc) { ctx = ctx || SND.ctx || new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); osc = ctx.createOscillator(); gn = ctx.createGain(); osc.type = 'sine'; osc.frequency.value = 170; gn.gain.value = 0; osc.connect(gn); gn.connect(ctx.destination); osc.start(); if (NBOMBA) { bo1 = ctx.createOscillator(); bo2 = ctx.createOscillator(); bgn = ctx.createGain(); bo1.type = bo2.type = 'sawtooth'; bo1.frequency.value = 74; bo2.frequency.value = 81; bgn.gain.value = 0; bo1.connect(bgn); bo2.connect(bgn); bgn.connect(ctx.destination); bo1.start(); bo2.start(); } } else if (!on && osc) { if (bo1) { const a = bo1, b2 = bo2; bo1 = bo2 = null; bgn.gain.setTargetAtTime(0, ctx.currentTime, .03); setTimeout(() => { try { a.stop(); b2.stop(); } catch (e) { } }, 160); } gn.gain.setTargetAtTime(0, ctx.currentTime, .03); const o = osc; osc = null; setTimeout(() => { try { o.stop(); } catch (e) { } }, 160); } } catch (e) { } };
      const ajusta = p => { if (!osc) return; const cl = Math.max(0, 1 - Math.hypot(p.x - alvo.x, p.y - alvo.y) / MAXD); try { osc.frequency.setTargetAtTime(150 + cl * 70, ctx.currentTime, .05); gn.gain.setTargetAtTime(.004 + .05 * cl * cl, ctx.currentTime, .05); if (bo1) { const cb = bombas.reduce((m, b) => Math.max(m, Math.max(0, 1 - Math.hypot(p.x - b.x, p.y - b.y) / MAXD)), 0); bo1.frequency.setTargetAtTime(66 + cb * 34, ctx.currentTime, .05); bo2.frequency.setTargetAtTime(73 + cb * 34, ctx.currentTime, .05); bgn.gain.setTargetAtTime(.003 + .05 * cb * cb, ctx.currentTime, .05); } } catch (e) { } };   // elo: seno limpo que sobe; bomba: zumbido grave e áspero
      const nova = () => { alvo = { x: 40 + Math.random() * (W - 80), y: 50 + Math.random() * (H - 100) }; bombas = []; for (let k = 0; k < NBOMBA; k++) { let b, n = 0; do { b = { x: 40 + Math.random() * (W - 80), y: 50 + Math.random() * (H - 100) }; n++; } while (n < 300 && (Math.hypot(b.x - alvo.x, b.y - alvo.y) < 110 || bombas.some(o => Math.hypot(b.x - o.x, b.y - o.y) < 110))); bombas.push(b); } left = LIM; travado = false; rev = null; tap = null; desenha(); };
      const desenha = () => { g.fillStyle = '#020108'; g.fillRect(0, 0, W, H); g.fillStyle = '#ffffff55'; g.font = '700 13px system-ui'; g.fillText('Elo ' + (rodada + 1) + '/' + R + ' · ' + left + ' s', 10, 20); g.fillStyle = '#ffffff30'; g.font = '12px system-ui'; g.fillText('segure o dedo e ouça · toque 2 vezes para confirmar' + (HD ? ' · cuidado com as bombas' : ''), 10, H - 12);
        if (ult && seg) { g.beginPath(); g.arc(ult.x, ult.y, 10, 0, 7); g.fillStyle = '#ffffff14'; g.fill(); }
        if (rev) bombas.forEach(b => { g.beginPath(); g.arc(b.x, b.y, 13, 0, 7); g.strokeStyle = '#ff9a3c'; g.lineWidth = 3; g.stroke(); g.fillStyle = '#ff9a3c'; g.font = '700 15px system-ui'; g.fillText('✕', b.x - 5, b.y + 5); });
        if (rev) { g.beginPath(); g.arc(alvo.x, alvo.y, 14, 0, 7); g.strokeStyle = rev.ok ? '#7dffb0' : '#ff5a4f'; g.lineWidth = 3; g.stroke(); g.beginPath(); g.arc(alvo.x, alvo.y, HIT, 0, 7); g.lineWidth = 1; g.strokeStyle = '#ffffff44'; g.stroke(); if (rev.p) { g.beginPath(); g.arc(rev.p.x, rev.p.y, 5, 0, 7); g.fillStyle = '#fff'; g.fill(); } } };
      const confirma = async p => { if (travado || acabou) return; travado = true; som(false); const d = Math.hypot(p.x - alvo.x, p.y - alvo.y), bm = bombas.some(b => Math.hypot(p.x - b.x, p.y - b.y) <= HIT), ok = d <= HIT && !bm, v = ok ? 1 - .5 * (d / HIT) : 0; pts += v; rev = { ok, p, bm }; SND.play(ok ? 'capture' : 'lose'); desenha(); await wait(1300); if (acabou) return; rodada++; if (rodada >= R) { acabou = true; clearInterval(tm); return fim(pts / R, Math.round(pts * 10) / 10 + ' de ' + R + ' pontos'); } nova(); };
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
      const cv = mk('<canvas class="mg-cv"></canvas>'); body.append(cv); const W = cv.width = Math.min(380, body.clientWidth || 360), H = cv.height = 470, g = cv.getContext('2d'), sprites = new Image(); sprites.src = 'cena/minigames/resgate-ceu-sprites.png';
      const HD = c.hard, TOTAL = HD ? 38 : 28, BW = 70, BY = H - 26, VMAX = 230 / c.dif; let bx = W / 2, alvoX = W / 2, last = 0, raf = 0, acabou = false, t = 0, nasc = 0, prox = .8, salvos = 0, perdidos = 0; const ps = [];
      const TIPOS = HD ? [['normal', .2], ['lento', .1], ['gordo', .26], ['diag', .26], ['plan', .18]] : [['normal', .32], ['lento', .16], ['gordo', .2], ['diag', .16], ['plan', .16]];   // o personagem gordo (sprite temporário) cai mais rápido; no Hard há mais deles
      const sorteia = () => { let r = Math.random(), a = 0; for (const [k, p] of TIPOS) { a += p; if (r < a) return k; } return 'normal'; };
      const nova = () => { const k = sorteia(), p = { k, x: 24 + Math.random() * (W - 48), y: -16, vx: 0, vy: 95, plan: false, quebra: 0, ok: true };
        if (k === 'lento') p.vy = 48 + Math.random() * 22; else if (k === 'gordo') p.vy = 190 + Math.random() * 60; else if (k === 'normal') p.vy = 85 + Math.random() * 50;
        else if (k === 'diag') { p.vy = 95 + Math.random() * 40; p.vx = (Math.random() < .5 ? -1 : 1) * (55 + Math.random() * 45); p.x = p.vx > 0 ? 20 + Math.random() * (W * .4) : W - 20 - Math.random() * (W * .4); }
        else { const d = Math.random() < .5 ? 1 : -1; p.plan = true; p.y = 50 + Math.random() * 90; p.x = d > 0 ? -16 : W + 16; p.vx = d * (105 + Math.random() * 40); p.vy = 8; p.quebra = 1.2 + Math.random() * 1.4; p.sx = p.x; }
        ps.push(p); nasc++; };
      cv.style.touchAction = 'none';
      const mv = e => { const b = cv.getBoundingClientRect(); alvoX = (e.clientX - b.left) * W / b.width; };
      cv.onpointerdown = e => { cv.setPointerCapture(e.pointerId); mv(e); }; cv.onpointermove = e => { if (e.buttons || e.pointerType === 'touch') mv(e); };
      const fimJogo = () => { if (acabou) return; acabou = true; cancelAnimationFrame(raf); fim(salvos / TOTAL, salvos + ' de ' + TOTAL + ' salvos'); };
      const loop = ts => { if (acabou) return; const dt = Math.min(.05, (ts - (last || ts)) / 1000); last = ts; t += dt;
        const d = alvoX - bx, mvx = Math.max(-VMAX * dt, Math.min(VMAX * dt, d)); bx = Math.max(BW / 2, Math.min(W - BW / 2, bx + mvx));
        if (nasc < TOTAL) { prox -= dt; if (prox <= 0) { nova(); const gap = (HD ? Math.max(.34, 1.1 - nasc * .03) : Math.max(.42, 1.35 - nasc * .035)) / Math.sqrt(c.dif); prox = gap * (.7 + Math.random() * .6); if (nasc > (HD ? 8 : 12) && Math.random() < (HD ? .42 : .3)) { nova(); } } }
        if (HD) for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) { const a = ps[i], b = ps[j]; if (a.plan || b.plan) continue; const dx = b.x - a.x, dy = b.y - a.y, dd = Math.hypot(dx, dy); if (dd < 26 && dd > 0) { const sg = dx >= 0 ? 1 : -1, ma = a.k === 'gordo' ? 2 : 1, mb = b.k === 'gordo' ? 2 : 1; a.vx = Math.max(-140, Math.min(140, a.vx - sg * 90 * mb / (ma + mb) * 1.6)); b.vx = Math.max(-140, Math.min(140, b.vx + sg * 90 * ma / (ma + mb) * 1.6)); a.x -= sg * (26 - dd) * .5; b.x += sg * (26 - dd) * .5; if (!a.colide) SND.play('tick'); a.colide = b.colide = 1; } }   // Hard: personagens que caem se chocam
        for (let i = ps.length - 1; i >= 0; i--) { const p = ps[i];
          if (p.plan) { p.x += p.vx * dt; p.y += p.vy * dt; p.quebra -= dt; if (p.quebra <= 0 && p.x > 30 && p.x < W - 30) { p.plan = false; p.vx *= .15; p.vy = 150; p.parte = .4; SND.play('lose'); } else if (p.x < -60 || p.x > W + 60) { ps.splice(i, 1); perdidos++; continue; } }
          else { p.x += p.vx * dt; p.y += p.vy * dt; if (p.parte > 0) p.parte -= dt; if (p.k === 'diag' && (p.x < 14 || p.x > W - 14)) p.vx *= -1; if (!p.plan && p.k === 'plan') p.vy = Math.min(190, p.vy + 120 * dt); }
          if (!p.plan && p.y >= BY - 10 && p.y <= BY + 14 && Math.abs(p.x - bx) < BW / 2 + 6 && p.vy > 0) { ps.splice(i, 1); salvos++; SND.play('capture'); continue; }
          if (p.y > H + 10) { ps.splice(i, 1); perdidos++; SND.play('tick'); } }
        const sky=g.createLinearGradient(0,0,0,H); sky.addColorStop(0,'#163c75'); sky.addColorStop(.55,'#5a78b2'); sky.addColorStop(1,'#d4a86d'); g.fillStyle=sky; g.fillRect(0,0,W,H); g.save(); g.globalAlpha=.18; g.strokeStyle='#efffff'; g.lineWidth=2; for(let w=0;w<6;w++){const yy=55+w*63, xx=(t*35+w*79)%(W+80)-40; g.beginPath(); g.moveTo(xx,yy); g.lineTo(xx+40,yy-9); g.stroke();} g.restore(); for(let n=0;n<5;n++){const cx=(n*91+18)%W,cy=55+(n%3)*73; g.fillStyle='#ffffff33'; g.beginPath(); g.arc(cx,cy,18,0,7);g.arc(cx+17,cy+3,14,0,7);g.arc(cx-15,cy+6,12,0,7);g.fill();} g.fillStyle='#30264d'; g.fillRect(0,H-10,W,10);
        ps.forEach(p => { const si = p.plan ? 1 : (p.k === 'plan' && p.parte > 0 ? 2 : p.k === 'gordo' ? 3 : 0); if (sprites.complete && sprites.naturalWidth) { const sx=(si%3)*256, sy=Math.floor(si/3)*256, sw=si===1?78:p.k==='gordo'?64:48, sh=si===1?58:p.k==='gordo'?58:50; g.save(); if(si===2){g.shadowColor='#ff7858';g.shadowBlur=12;} else if(p.k==='gordo'){g.shadowColor='#ff8a5c';g.shadowBlur=9;} g.drawImage(sprites,sx,sy,256,256,p.x-sw/2,p.y-sh/2,sw,sh); g.restore(); return; } g.save(); g.translate(p.x, p.y); g.fillStyle = '#ffd9b0'; g.beginPath(); g.arc(0, -8, 5, 0, 7); g.fill(); g.fillStyle='#5b3b82'; g.fillRect(-4,-2,8,12); g.strokeStyle = '#f5edff'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(0, -3); g.lineTo(0, 8); g.moveTo(-6, 0); g.lineTo(6, p.plan ? 0 : -6); g.moveTo(0, 8); g.lineTo(-4, 15); g.moveTo(0, 8); g.lineTo(4, 15); g.stroke();
          if (p.plan) { g.strokeStyle = '#7dffb0'; g.lineWidth = 4; g.beginPath(); g.moveTo(-22, -14); g.lineTo(22, -14); g.stroke(); } else if (p.k === 'plan' && p.parte > 0) { g.strokeStyle = '#ff5a4f'; g.lineWidth = 3; g.beginPath(); g.moveTo(-16, -18); g.lineTo(-6, -12); g.moveTo(16, -22); g.lineTo(8, -14); g.stroke(); }
          if (!p.plan && p.k === 'gordo') { g.strokeStyle = '#ff8a5c'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-3, -22); g.lineTo(-3, -34); g.moveTo(3, -22); g.lineTo(3, -34); g.stroke(); } g.restore(); });
        if (sprites.complete && sprites.naturalWidth) g.drawImage(sprites,256,256,256,256,bx-BW*.62,BY-38,BW*1.24,55); else { g.save(); g.shadowColor='#ffd25f';g.shadowBlur=13;g.fillStyle='#c88734';g.fillRect(bx-BW/2,BY,BW,15);g.strokeStyle='#fff0b0';g.lineWidth=2;g.strokeRect(bx-BW/2,BY,BW,15);g.beginPath();g.moveTo(bx-BW/2+4,BY);g.lineTo(bx-BW/2+13,BY-15);g.lineTo(bx+BW/2-13,BY-15);g.lineTo(bx+BW/2-4,BY);g.stroke();g.restore(); }
        g.fillStyle = '#fff'; g.font = '700 14px system-ui'; g.fillText('Salvos ' + salvos + ' / ' + TOTAL, 10, 20); g.fillText('Perdidos ' + perdidos, W - 100, 20);
        if (nasc >= TOTAL && !ps.length) return fimJogo(); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop); return () => { acabou = true; cancelAnimationFrame(raf); };
    },
    // Viajantes: Cores dos Irmãos — leve cada irmão (bolinha no centro) a um objeto da cor dele, nos dois lados; 5 rodadas, quanto mais rápido melhor
    poderes(body, c, fim) {
      const IR = [{ n: 'Breno', c: '#4aa3ff' }, { n: 'Bruno', c: '#f2f4ff' }, { n: 'Banjo', c: '#5dff9a' }, { n: 'Beatriz', c: '#ff4f5e' }, { n: 'Lia', c: '#ffc84f' }, { n: 'Noa', c: '#d478ff' }, { n: 'Iris', c: '#34ded7' }];
      const cv = mk('<canvas class="mg-cv"></canvas>'); body.append(cv); const W = cv.width = Math.min(380, body.clientWidth || 360), H = cv.height = 440, g = cv.getContext('2d');
      const HD = c.hard, RODS = 6, TOT = (HD ? 85 : 70) / c.dif, REF = HD ? 22 : 18, FAST = HD ? 11 : 8, OR = 22, BR = 15, CX = W / 2, CY = H / 2; let barreiras = [], gasto = 0, grace = 0;   // tempo TOTAL para as 6 rodadas (REF só mede a velocidade de cada uma)
      let rod = 0, itens = [], bolas = [], drag = null, t0 = 0, raf = 0, acabou = false, soma = 0, pausa = 0, msg = '', feitas = 0; const tempos = [];
      // Cada irmão recebe exatamente um destino único. A rodada cresce de 2 a 7 cores e encurta o relógio.
      const dRet = (x, y, r) => Math.hypot(x - Math.max(r.x, Math.min(x, r.x + r.w)), y - Math.max(r.y, Math.min(y, r.y + r.h)));
      const bate = (x, y) => barreiras.some(r => dRet(x, y, r) < BR);
      const mexeBarreiras = dt => { barreiras.forEach(r => { const nx = r.x + r.vx * dt, ny = r.y + r.vy * dt, t = { x: nx, y: ny, w: r.w, h: r.h }; const dc = Math.hypot(CX - Math.max(nx, Math.min(CX, nx + r.w)), CY - Math.max(ny, Math.min(CY, ny + r.h)));
          const ok = Math.abs(nx - r.x0) <= 55 && Math.abs(ny - r.y0) <= 55 && nx >= 14 && nx + r.w <= W - 14 && ny >= 40 && ny + r.h <= H - 14 && dc >= 96 && !itens.some(i => dRet(i.x, i.y, t) < OR + 8) && !bolas.some(b => dRet(b.x, b.y, t) < BR + 16) && !barreiras.some(o => o !== r && nx < o.x + o.w + 38 && nx + r.w + 38 > o.x && ny < o.y + o.h + 38 && ny + r.h + 38 > o.y);
          if (ok) { r.x = nx; r.y = ny; } else { r.vx = -r.vx; r.vy = -r.vy; } }); };   // barreiras deslizam entre as bolinhas e os alvos e nunca encostam em bolinha
      const alcanca = () => { const G = 8, gw = Math.ceil(W / G), gh = Math.ceil(H / G), vis = new Uint8Array(gw * gh), q = [[Math.round(CX / G), Math.round(CY / G)]]; vis[q[0][1] * gw + q[0][0]] = 1; while (q.length) { const [gx, gy] = q.pop(); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const nx = gx + dx, ny = gy + dy; if (nx < 0 || ny < 0 || nx >= gw || ny >= gh || vis[ny * gw + nx] || bate(nx * G, ny * G)) return; vis[ny * gw + nx] = 1; q.push([nx, ny]); }); } return itens.every(i => vis[Math.round(i.y / G) * gw + Math.round(i.x / G)]); };
      const geraBarreiras = () => { for (let t = 0; t < 120; t++) { const nb = 2 + (rod > 2 ? 1 : 0), rs = [], far = itens.map(i => ({ i, d: Math.hypot(i.x - CX, i.y - CY) })).filter(o => o.d >= 150).sort(() => Math.random() - .5);
          far.slice(0, nb).forEach(({ i, d }) => { const f = .5 + Math.random() * .12, mx = CX + (i.x - CX) * f, my = CY + (i.y - CY) * f, vert = Math.abs(i.x - CX) > Math.abs(i.y - CY), L = 70 + Math.random() * 40, w = vert ? 14 : L, hh = vert ? L : 14, x = mx - w / 2, y = my - hh / 2, sg = Math.random() < .5 ? -1 : 1, vel = sg * (24 + Math.random() * 16);
            if (x < 14 || x + w > W - 14 || y < 40 || y + hh > H - 14) return; if (Math.hypot(Math.max(x, Math.min(CX, x + w)) - CX, Math.max(y, Math.min(CY, y + hh)) - CY) < 100) return; if (itens.some(o => o.x > x - OR - 10 && o.x < x + w + OR + 10 && o.y > y - OR - 10 && o.y < y + hh + OR + 10)) return; if (rs.some(r => x < r.x + r.w + 40 && x + w + 40 > r.x && y < r.y + r.h + 40 && y + hh + 40 > r.y)) return;
            rs.push({ x, y, w, h: hh, x0: x, y0: y, vx: vert ? 0 : vel, vy: vert ? vel : 0 }); }); barreiras = rs; if (rs.length >= 1 && alcanca()) return; } barreiras = []; };   // barreiras ficam no caminho entre o centro (bolinhas) e cada alvo distante, nunca nos cantos
      const nova = () => { const n = Math.min(IR.length, (HD ? 4 : 2) + rod), cores = shuffle(IR.map((_,i)=>i)).slice(0, n); bolas = []; const ang0 = Math.random() * 6.283;
        cores.forEach((ir, i) => { const a = ang0 + i * 6.283 / n, x = CX + Math.cos(a) * (n > 4 ? 66 : 48), y = CY + Math.sin(a) * (n > 4 ? 66 : 48); bolas.push({ ir, hx: x, hy: y, x, y, feita: false }); });
        itens = []; const perto = Math.random() < .6;
        cores.forEach((ir, i) => { let x, y, k = 0, ok = false;
          while (!ok && k++ < 400) { if (perto && i === 0 && k < 300) { const a = Math.random() * 6.283, r = 80 + Math.random() * 40; x = CX + Math.cos(a) * r; y = CY + Math.sin(a) * r; } else { x = 34 + Math.random() * (W - 68); y = 50 + Math.random() * (H - 90); }
            ok = x > OR + 4 && x < W - OR - 4 && y > OR + 30 && y < H - OR - 4 && bolas.every(b => Math.hypot(b.hx - x, b.hy - y) >= OR + BR + 26) && itens.every(o => Math.hypot(o.x - x, o.y - y) >= OR * 2 + 14); }
          itens.push({ x, y, ir }); });
        barreiras = []; if (HD) geraBarreiras();
        drag = null; feitas = 0; grace = 2.5; t0 = performance.now(); };   // barreiras só começam a andar depois de 2,5 s
      const pos = e => { const b = cv.getBoundingClientRect(); return { x: (e.clientX - b.left) * W / b.width, y: (e.clientY - b.top) * H / b.height }; };
      cv.style.touchAction = 'none';
      const perde = m => { tempos.push(REF); pausa = .9; msg = m; drag = null; SND.play('lose'); };
      const toca = b => { const it = itens.find(i => Math.hypot(i.x - b.x, i.y - b.y) < OR + BR - 2); if (!it) return; if (it.ir === b.ir) { b.feita = true; b.x = it.x + (Math.random() - .5) * 14; b.y = it.y + (Math.random() - .5) * 14; drag = null; feitas++; SND.play('tick'); if (feitas === bolas.length) fecha((performance.now() - t0) / 1000); } else perde('Cor errada!'); };
      cv.onpointerdown = e => { if (pausa > 0) return; const p = pos(e); let m = null, d = 1e9; bolas.forEach(b => { const dd = Math.hypot(b.x - p.x, b.y - p.y); if (!b.feita && dd < 30 && dd < d) { d = dd; m = b; } }); if (m) { drag = m; cv.setPointerCapture(e.pointerId); } };
      cv.onpointermove = e => { if (!drag || pausa > 0) return; const p = pos(e), b = drag, nx = Math.max(BR, Math.min(W - BR, p.x)), ny = Math.max(BR, Math.min(H - BR, p.y)), dx = nx - b.x, dy = ny - b.y, st = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 6));
        for (let k = 1; k <= st && drag === b; k++) { const px = b.x, py = b.y; b.x += dx / st * 1; b.y += dy / st * 1; if (k === st) { b.x = nx; b.y = ny; } if (HD && bate(b.x, b.y)) { b.x = px; b.y = py; break; } if (HD && bolas.some(o => o !== b && !o.feita && Math.hypot(o.x - b.x, o.y - b.y) < 2 * BR - 2)) { perde('Bolas se encostaram!'); break; } toca(b); if (pausa > 0 || b.feita) break; } };   // o caminho inteiro conta: encostar na cor errada no meio do arrasto também perde
      cv.onpointerup = cv.onpointercancel = () => { if (!drag) return; const b = drag; drag = null; b.x = b.hx; b.y = b.hy; };
      const fecha = s => { tempos.push(s); soma += Math.max(0, Math.min(1, 1 - (s - FAST) / (REF - FAST))); pausa = .8; msg = s.toFixed(1) + ' s'; SND.play('capture'); };
      const fimJogo = () => { if (acabou) return; acabou = true; cancelAnimationFrame(raf); fim(soma / RODS, tempos.map(x => x.toFixed(1) + 's').join(' · ')); };
      let last = 0; const loop = ts => { if (acabou) return; const dt = Math.min(.05, (ts - (last || ts)) / 1000); last = ts;
        if (pausa > 0) { pausa -= dt; if (pausa <= 0) { rod++; if (rod >= RODS) return fimJogo(); nova(); } }
        else { gasto += dt; if (gasto >= TOT) return fimJogo(); if (HD && barreiras.length) { if (grace > 0) grace -= dt; else mexeBarreiras(dt); } }
        g.fillStyle = '#0a0820'; g.fillRect(0, 0, W, H);
        barreiras.forEach(r => { g.save(); g.fillStyle = '#2a2350'; g.strokeStyle = '#8f7dff'; g.lineWidth = 2; g.shadowColor = '#8f7dff'; g.shadowBlur = 8; g.beginPath(); g.roundRect ? g.roundRect(r.x, r.y, r.w, r.h, 6) : g.rect(r.x, r.y, r.w, r.h); g.fill(); g.stroke(); g.restore(); });
        itens.forEach(i => { g.save();g.shadowColor=IR[i.ir].c;g.shadowBlur=12;g.beginPath(); g.arc(i.x, i.y, OR, 0, 7); g.fillStyle = IR[i.ir].c + '30'; g.fill(); g.lineWidth = 3; g.strokeStyle = IR[i.ir].c; g.stroke();g.setLineDash([3,4]);g.beginPath();g.arc(i.x,i.y,OR-7,0,7);g.stroke();g.restore(); });
        bolas.forEach(b => { g.save();g.beginPath(); g.arc(b.x, b.y, BR, 0, 7); const gr=g.createRadialGradient(b.x-BR*.3,b.y-BR*.4,2,b.x,b.y,BR);gr.addColorStop(0,'#fff');gr.addColorStop(.25,IR[b.ir].c);gr.addColorStop(1,'#111');g.fillStyle=gr; g.shadowColor = IR[b.ir].c; g.shadowBlur = b === drag ? 22 : 10; g.fill(); g.shadowBlur = 0;g.restore(); if (b.feita) { g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke(); } });
        g.fillStyle = '#fff'; g.font = '700 14px system-ui'; g.fillText('Rodada ' + Math.min(rod + 1, RODS) + '/' + RODS + ' · ' + Math.max(0, TOT - gasto).toFixed(0) + ' s', 10, 20);
        if (pausa > 0) { g.font = '800 24px system-ui'; g.textAlign = 'center'; g.fillStyle = '#000a'; g.fillText(msg, W / 2 + 1, 37); g.fillStyle = '#fff'; g.fillText(msg, W / 2, 36); g.textAlign = 'left'; }
        raf = requestAnimationFrame(loop); };
      nova(); raf = requestAnimationFrame(loop); return () => { acabou = true; cancelAnimationFrame(raf); };
    },
    // Spacetheft: símbolos espaciais em 8 quadrados; caveira tira ponto (25 s)
    gancho(body, c, fim) {   // META 80: Bom ≈ 27 pontos, Ótimo ≈ 54, Perfeito ≈ 67 (quem fez 63 não chega ao Perfeito)
      const HD = c.hard, NC = HD ? 12 : 8, BOM = [
        '<span class="sg-icon"><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="22" fill="#102d50" stroke="#8ee9ff" stroke-width="3"/><path d="m32 13 7 16-7 22-7-22z" fill="#ffd25f"/><path d="m13 32 16-7 22 7-22 7z" fill="#57dfff"/><circle cx="32" cy="32" r="4" fill="#fff"/></svg></span>',
        '<span class="sg-icon"><svg viewBox="0 0 64 64" aria-hidden="true"><path d="m32 7 5 18 17-8-8 17 18 5-18 5 8 17-17-8-5 18-5-18-17 8 8-17-18-5 18-5-8-17 17 8z" fill="#83efff" stroke="#e8ffff" stroke-width="2"/><circle cx="32" cy="34" r="6" fill="#164c84"/></svg></span>',
        '<span class="sg-icon"><svg viewBox="0 0 64 64" aria-hidden="true"><path d="M42 9C25 12 18 27 24 40c5 11 18 15 29 8-11 1-20-7-20-18 0-9 4-16 9-21Z" fill="#d1c4ff" stroke="#8ee9ff" stroke-width="3"/><path d="m48 17 2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#fff2a8"/></svg></span>',
        '<span class="sg-icon"><svg viewBox="0 0 64 64" aria-hidden="true"><path d="m8 35 17-9 13-16 5 17 13 8-13 5-5 14-13-15z" fill="#a8eaff" stroke="#eafcff" stroke-width="3"/><path d="m13 35 14 2-8 7z" fill="#ffcf5f"/><circle cx="39" cy="29" r="3" fill="#173a65"/></svg></span>',
        '<span class="sg-icon"><svg viewBox="0 0 64 64" aria-hidden="true"><path d="m32 7 16 18-7 29H23l-7-29z" fill="#6fe8ff" stroke="#efffff" stroke-width="3"/><path d="m32 7v47M16 25l16 8 16-8" stroke="#317bd1" stroke-width="3" fill="none"/><circle cx="32" cy="39" r="6" fill="#fff4a8"/></svg></span>'
      ], T = 25, META = 80, tIni = Date.now(); let pts = 0, left = T, tm = null, sp = null, acabou = false;
      body.innerHTML = `<p class="mg-q" id="mq"></p><div class="mg-grid g4" id="sg"></div>`; const g = $('#sg', body), q = $('#mq', body);
      for (let i = 0; i < NC; i++) g.append(mk(`<button class="mg-cell sim" data-i="${i}" style="width:78px;height:78px"></button>`));
      const skull = '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="m13 16 11 7m16 0 11-7M11 47 53 17M11 17l42 30" stroke="#d7a94c" stroke-width="4" stroke-linecap="round"/><path d="M32 6C17 6 9 17 12 31c1 6 5 10 10 12l1 12h18l1-12c5-2 9-6 10-12C55 17 47 6 32 6Z" fill="#e8dfcf" stroke="#ff525f" stroke-width="3"/><path d="M22 29h9m2 0h9M23 42h18M26 43v8m6-8v8m6-8v8" stroke="#241325" stroke-width="4" stroke-linecap="round"/><path d="M21 27 28 24 30 34 22 33Zm22 0-7-3-2 10 8-1Z" fill="#ff334e"/><circle cx="26" cy="29" r="2" fill="#fff4ce"/><circle cx="38" cy="29" r="2" fill="#fff4ce"/></svg>';
      const mostra = () => { if (acabou) return; [...g.children].forEach(b => { b.innerHTML = ''; b.dataset.k = ''; b.classList.remove('in','out','skull'); }); clearTimeout(sp); sp = setTimeout(mostra2, 180); };
      const bomba = '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="30" cy="37" r="19" fill="#1b1226" stroke="#ff5a4f" stroke-width="3"/><path d="M40 21l7-8" stroke="#d7a94c" stroke-width="4" stroke-linecap="round"/><circle cx="49" cy="11" r="5" fill="#ffd25f"/><circle cx="23" cy="31" r="4" fill="#ffffff55"/></svg>';
      const vizinhos = i => { const col = i % 4, r = []; if (col > 0) r.push(i - 1); if (col < 3) r.push(i + 1); if (i >= 4) r.push(i - 4); if (i + 4 < NC) r.push(i + 4); return r; };
      const mostra2 = () => { if (acabou) return; const idx = [...Array(NC).keys()], cav = new Set(shuffle(idx).slice(0, (HD ? 4 : 3) + rnd(3))); const bbs = new Set();
        if (HD) { const prog = (Date.now() - tIni) / (T * 1000), pb = Math.max(0, Math.min(.95, (prog - .12) * 1.7)), liv = () => shuffle(idx.filter(i => !cav.has(i) && !bbs.has(i))).find(i => vizinhos(i).filter(j => !cav.has(j) && !bbs.has(j)).length >= 2); if (Math.random() < pb) { const ok = liv(); if (ok != null) bbs.add(ok); } if (prog > .55 && Math.random() < .55) { const ok = liv(); if (ok != null) bbs.add(ok); } }   // bombas: do começo ao fim, e uma segunda na metade final, sempre coladas em símbolos bons
        idx.forEach(i => { const caveira = cav.has(i), b = g.children[i]; b.innerHTML = bbs.has(i) ? bomba : caveira ? skull : `<b class="sg-icon">${pick(BOM)}</b>`; b.dataset.k = bbs.has(i) ? 'b' : caveira ? 'x' : 'o'; b.classList.add('in'); b.classList.toggle('skull', caveira); b.classList.toggle('bomba', bbs.has(i)); });
        clearTimeout(sp); sp = setTimeout(mostra, (HD ? 950 : 1100) / c.dif); };
      const pinta = () => { q.innerHTML = `Pontos <b>${pts}</b>/${META} · ${left}s<br><small>Toque nos símbolos; evite as caveiras${HD ? ' e as bombas' : ''}</small>`; };
      g.onclick = e => { const b = e.target.closest('.sim'); if (!b || acabou || !b.dataset.k) return; if (b.dataset.k === 'b') { SND.play('lose'); b.classList.add('boom'); acabou = true; clearInterval(tm); clearTimeout(sp); return setTimeout(() => fim(pts / META, 'Bomba! ' + pts + ' pontos'), 700); } if (b.dataset.k === 'o') { pts++; SND.play('tick'); } else { pts = Math.max(0, pts - 2); SND.play('lose'); } b.dataset.k = ''; b.classList.add('out'); setTimeout(()=>b.innerHTML='',150); pinta(); };
      const fimJ = () => { acabou = true; clearInterval(tm); clearTimeout(sp); fim(pts / META, pts + ' pontos'); };
      tm = setInterval(() => { left--; pinta(); if (left <= 0) fimJ(); }, 1000); pinta(); mostra();
      return () => { acabou = true; clearInterval(tm); clearTimeout(sp); };
    },
    // Mistério Oculto: olhos que se abrem no escuro; feche-os antes que ataquem (36 olhos, 3 corações)
    culpado(body, c, fim) {
      const N = c.hard ? 60 : 48, SPOTS = 12; let vidas = 3, nasc = 0, fechados = 0, perdidos = 0, tm = null, prox = 600, acabou = false; const pend = []; if (c.hard) for (let j = 0; j < 3 + rnd(2); j++) pend.push(150 + Math.random() * 1500);   // Hard: já abre com 3 ou mais olhos em instantes aleatórios
      const olhos = Array.from({ length: SPOTS }, () => null); const t0 = Date.now();
      body.innerHTML = `<p class="mg-q" id="mq"></p><div class="mg-olhos">${Array.from({ length: SPOTS }, (_, i) => `<button class="mg-olho" data-i="${i}" aria-label="olho"><i></i></button>`).join('')}</div>`; const q = $('#mq', body), g = $('.mg-olhos', body);
      const pinta = () => { q.innerHTML = `${'♥'.repeat(vidas)}<span style="opacity:.3">${'♥'.repeat(3 - vidas)}</span> · olhos ${Math.min(nasc, N)}/${N}`; };
      const ate = () => nasc / (N - 1);
      const fecha = (i, ataque) => { const b = g.children[i]; b.className = 'mg-olho'; olhos[i] = null; if (ataque) { perdidos++; vidas--; SND.play('lose'); g.classList.add('hit'); setTimeout(() => g.classList.remove('hit'), 250); } else { fechados++; dor(); } pinta();
        if (vidas <= 0) return fimJ(); if (nasc >= N && !pend.length && !olhos.some(Boolean)) fimJ(); };
      const fimJ = () => { if (acabou) return; acabou = true; clearInterval(tm); const morreu = vidas <= 0, pct = morreu ? Math.min(.7, fechados / N) : 1 - perdidos / N; fim(pct, morreu ? 'Os olhos venceram (' + fechados + ' fechados)' : fechados + ' de ' + N + ' olhos fechados'); };
      g.onclick = e => { const b = e.target.closest('.mg-olho'); if (!b || acabou) return; const i = +b.dataset.i; if (olhos[i]) fecha(i, false); };
      tm = setInterval(() => { if (acabou) return; const agora = Date.now() - t0;
        { const a = ate(), vivos = olhos.filter(Boolean).length, want = c.hard ? 3 + (a > .4 ? 1 : 0) + (a > .8 ? 1 : 0) : 2 + (a > .55 ? 1 : 0) + (a > .9 ? 1 : 0); if (nasc + pend.length < N && vivos + pend.length < want) pend.push(agora + 100 + Math.random() * 400); }   // fluxo contínuo: sempre que faltam olhos abertos, outro nasce logo (sem intervalo)
        for (let q = pend.length - 1; q >= 0; q--) { if (pend[q] > agora) continue; const livres = olhos.map((o, i) => o ? -1 : i).filter(i => i >= 0); if (!livres.length) { pend[q] = agora + 150; continue; } pend.splice(q, 1); const i = pick(livres), a = ate(), life = (c.hard ? 3200 - 1600 * a : 3500 - 1800 * a) / c.dif * (.92 + Math.random() * .24); olhos[i] = { ini: agora, life }; g.children[i].className = 'mg-olho on'; nasc++; pinta(); }
        olhos.forEach((o, i) => { if (!o) return; const f = (agora - o.ini) / o.life, b = g.children[i]; if (f >= 1) return fecha(i, true); b.classList.toggle('tre', f > .4); b.classList.toggle('red', f > .7); });
        if (nasc >= N && !pend.length && !olhos.some(Boolean)) fimJ(); }, 50);
      pinta(); return () => { acabou = true; clearInterval(tm); };
    },
    // Édelin Lys: ritmo de três elementos (20 notas)
    ritmo(body, c, fim) {
      const cv = mk('<canvas class="mg-cv"></canvas>'); body.append(cv); const W = cv.width = Math.min(380, body.clientWidth || 360), H = cv.height = 400, g = cv.getContext('2d');
      const HD = c.hard, NL = HD ? 4 : 3, COR = ['#5fb0ff', '#ff6a5c', '#e8f4ff', '#7dffb0'].slice(0, NL), NOME = ['Mar', 'Fogo', 'Gelo', 'Vento'].slice(0, NL), N = HD ? 50 : 42, GAP = (HD ? .8 : .86) / Math.sqrt(c.dif), FALL = (HD ? 1.25 : 1.55) / c.dif, LY = H - 70, VEL = (LY - 10) / FALL, RAIO_PERF = HD ? 18 : 24, RAIO_ACERTO = HD ? 46 : 68, JAN = RAIO_PERF / VEL, JG = RAIO_ACERTO / VEL;
      const artes = ['cena/notas-elementais/nota-mar.png', 'cena/notas-elementais/nota-fogo.png', 'cena/notas-elementais/nota-gelo.png', 'cena/notas-elementais/nota-vento.png'].slice(0, NL).map(src => { const im = new Image(); im.src = src; return im; });
      const notas = []; { let tt = 1.7, i = 0; while (notas.length < N) { const a = i / 34, pr = Math.min(1, a); tt += GAP * (1 - .32 * pr) * (.9 + Math.random() * .26); const l = rnd(NL); notas.push({ t: tt, l, est: 0 }); if (notas.length < N && i > 10 && Math.random() < .06 + .20 * pr) notas.push({ t: tt, l: (l + 1 + rnd(NL - 1)) % NL, est: 0 }); i++; } } let t0 = 0, raf = 0, hit = 0, msg = '', msgT = 0, acabou = false; const fl = Array(NL).fill(0);   // fl: brilho da pista ao acertar
      const tomEl = l => { if (l === 0) { nota(392, 0, .5, .2, 'sine'); nota(196, 0, .5, .1, 'triangle'); } else if (l === 1) { nota(523, 0, .28, .14, 'sawtooth', 500); ruido(.09, .05, 4000, 900); } else if (l === 2) { nota(1047, 0, .7, .14, 'sine'); nota(1568, 0, .45, .06, 'sine'); } else { nota(784, 0, .45, .14, 'triangle', 700); ruido(.3, .05, 3000, 700); } };   // um timbre musical por elemento: Mar, Fogo, Gelo, Vento
      const bar = mk('<div class="mg-btns">' + NOME.map((n, i) => `<button class="btn" data-l="${i}" style="border-color:${COR[i]}">${n}</button>`).join('') + '</div>'); body.append(bar);
      const toque = l => { const now = (performance.now() - t0) / 1000; let best = null; notas.forEach(n => { if (n.est === 0 && n.l === l && Math.abs(n.t - now) < JG && (!best || Math.abs(n.t - now) < Math.abs(best.t - now))) best = n; });
        if (best) { const ex = Math.abs(best.t - now) < JAN; best.est = ex ? 1 : 2; if (ex) hit++; else hit += .5; msg = ex ? 'Perfeito' : 'Bom'; tomEl(l); fl[l] = .3; const bt = bar.querySelector('[data-l="' + l + '"]'); if (bt) { bt.style.boxShadow = '0 0 18px ' + COR[l]; bt.style.background = COR[l] + '55'; setTimeout(() => { bt.style.boxShadow = ''; bt.style.background = ''; }, 180); } } else { msg = 'Errou'; SND.play('lose'); } msgT = .5; };
      bar.onclick = e => { const b = e.target.closest('[data-l]'); if (b) toque(+b.dataset.l); }; const key = e => { const k = { a: 0, s: 1, d: 2, f: 3, 1: 0, 2: 1, 3: 2, 4: 3 }[e.key]; if (k != null) toque(k); }; document.addEventListener('keydown', key);
      const loop = () => { const now = (performance.now() - t0) / 1000; g.fillStyle = '#05030f'; g.fillRect(0, 0, W, H); const lw = W / NL;
        for (let l = 0; l < NL; l++) { g.fillStyle = COR[l] + '14'; g.fillRect(l * lw, 0, lw - 2, H); if (fl[l] > 0) { const k = fl[l] / .3; fl[l] -= .016; g.fillStyle = COR[l] + Math.round(k * 90).toString(16).padStart(2, '0'); g.fillRect(l * lw, 0, lw - 2, H); g.strokeStyle = COR[l]; g.globalAlpha = k; g.lineWidth = 3; g.beginPath(); g.arc(l * lw + lw / 2, LY, 14 + (1 - k) * 30, 0, 7); g.stroke(); g.globalAlpha = 1; g.lineWidth = 1; } }
        g.fillStyle = '#3ddc84' + '2e'; g.fillRect(0, LY - RAIO_ACERTO, W, RAIO_ACERTO * 2); g.fillStyle = '#3ddc84' + '40'; g.fillRect(0, LY - RAIO_PERF, W, RAIO_PERF * 2); g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, LY); g.lineTo(W, LY); g.stroke(); g.lineWidth = 1;
        notas.forEach(n => { if (n.est) return; const y = LY - (n.t - now) / FALL * (LY - 10), x = n.l * lw + lw / 2; if (y > H + 20 && now > n.t + JG) { n.est = 3; msg = 'Perdeu'; msgT = .4; return; } if (y < -28) return; const im = artes[n.l]; if (im.complete && im.naturalWidth) g.drawImage(im, x - 25, y - 25, 50, 50); else { g.fillStyle = COR[n.l]; g.beginPath(); g.arc(x, y, 16, 0, 7); g.fill(); } });
        g.fillStyle = '#fff'; g.font = '700 14px system-ui'; g.fillText('Acertos ' + Math.floor(hit) + '/' + N, 10, 20); if (msgT > 0) { msgT -= .016; g.font = '800 22px system-ui'; g.textAlign = 'center'; g.fillText(msg, W / 2, 50); g.textAlign = 'left'; }
        if (now > notas[N - 1].t + 1 && !acabou) { acabou = true; fim(hit / N, Math.floor(hit) + ' de ' + N + ' notas'); } raf = requestAnimationFrame(loop); };
      t0 = performance.now(); raf = requestAnimationFrame(loop); return () => { acabou = true; cancelAnimationFrame(raf); document.removeEventListener('keydown', key); };
    },
    // A União: Chamado da União — controle cada herói com o dedo (arraste) para longe das hordas; eles atacam sozinhos à distância. Tocado, o herói morre
    formacao(body, c, fim) {
      const cv = mk('<canvas class="mg-cv"></canvas>'); body.append(cv); const W = cv.width = 380, H = cv.height = 480, g = cv.getContext('2d'); cv.style.width = '100%'; cv.style.maxWidth = '380px'; cv.style.touchAction = 'none';
      const S = uniaoSim(c.dif, Math.random, { hard: !!c.hard }), UN = ['D06', 'M01', 'J03', 'B01', 'S01', 'M10', 'V15', 'V02'], imgs = UN.map(id => { const im = new Image(); const src = (window.CARD_IMAGES || {})[id]; if (src) im.src = src.replace('photos/', 'photos/t/'); return im; }), horda = new Image(), hordaTipos = new Image(); horda.src = 'cena/minigames/horda-uniao.png'; hordaTipos.src = 'cena/minigames/horda-uniao-variantes.compacta.png';
      const cor = id => { const k = U.CARDS[id], sr = (U.SERIES || {})[k && k.serie]; return sr ? sr.cor : '#8f5cff'; };
      const ptr = new Map(); let raf = 0, last = 0, acabou = false, msgMorte = 0;
      const pos = e => { const b = cv.getBoundingClientRect(); return { x: (e.clientX - b.left) * W / b.width, y: (e.clientY - b.top) * H / b.height }; };
      cv.onpointerdown = e => { const p = pos(e); if (Math.hypot(S.est.x - p.x, S.est.y - p.y) < 40 && ![...ptr.values()].includes('E')) { ptr.set(e.pointerId, 'E'); try { cv.setPointerCapture(e.pointerId); } catch (er) { } S.moveEst(p.x, p.y); return; } let m = -1, d = 48; S.ms.forEach((x, i) => { const dd = Math.hypot(x.x - p.x, x.y - p.y); if (x.vivo && dd < d && ![...ptr.values()].includes(i)) { d = dd; m = i; } }); if (m >= 0) { ptr.set(e.pointerId, m); try { cv.setPointerCapture(e.pointerId); } catch (er) { } } };
      cv.onpointermove = e => { const i = ptr.get(e.pointerId); if (i == null) return; const p = pos(e); if (i === 'E') S.moveEst(p.x, p.y); else S.move(i, p.x, p.y); };
      cv.onpointerup = cv.onpointercancel = e => { ptr.delete(e.pointerId); };
      let mortos = 0;
      const fimJogo = () => { if (acabou) return; acabou = true; cancelAnimationFrame(raf); const v = S.vivos(); fim(S.resultado(), S.perdeu ? 'O Estírio caiu na onda ' + Math.min(S.wave, S.WAVES) : 'O Estírio sobreviveu com ' + v + ' de 8 heróis'); };
      const loop = ts => { if (acabou) return; const dt = Math.min(.05, (ts - (last || ts)) / 1000); last = ts; S.step(dt);
        const n = S.ms.filter(m => !m.vivo).length; if (n > mortos) { mortos = n; SND.play('lose'); }
        g.fillStyle = '#07040f'; g.fillRect(0, 0, W, H);
        { const av = S.aviso; if (av) { const pisca = .3 + .7 * Math.abs(Math.sin(S.t * 9)); g.save(); g.fillStyle = '#ff2b45'; g.shadowColor = '#ff2b45'; g.shadowBlur = 12; g.globalAlpha = pisca; [...new Set(av)].forEach(l => { for (let k = 0; k < 9; k++) { const u = (k + .5) / 9; g.beginPath(); g.arc(l === 0 ? u * W : l === 2 ? u * W : l === 1 ? W - 7 : 7, l === 1 || l === 3 ? u * H : l === 0 ? 7 : H - 7, 4.5, 0, 7); g.fill(); } }); g.restore(); } }   // bolinhas vermelhas piscando nas bordas de onde vem a próxima horda
        S.atk.forEach(a => { g.strokeStyle = '#ffd25f'; g.globalAlpha = Math.max(0, a.l / .14); g.lineWidth = 2; g.beginPath(); g.moveTo(a.x1, a.y1); g.lineTo(a.x2, a.y2); g.stroke(); g.globalAlpha = 1; });
        S.es.forEach(e => { const r = Math.max(18, e.r * 2.35), temTipo = e.tp !== 'n' && hordaTipos.complete && hordaTipos.naturalWidth; if ((temTipo || horda.complete && horda.naturalWidth)) { g.save(); g.globalAlpha = e.tp === 'h' ? 1 : .84; if (e.split) g.filter = 'hue-rotate(118deg) saturate(1.55) brightness(1.16)'; if (temTipo) { const cel = e.tp === 'f' ? [0, 0] : e.tp === 'g' ? [1, 0] : e.tp === 'h' ? [0, 1] : [1, 1]; g.drawImage(hordaTipos, cel[0] * 256, cel[1] * 256, 256, 256, e.x - r, e.y - r, r * 2, r * 2); } else g.drawImage(horda, e.x - r, e.y - r, r * 2, r * 2); g.restore(); } else { g.beginPath(); g.arc(e.x, e.y, e.r, 0, 7); g.fillStyle = e.split ? '#36bfe5' : e.tp === 'f' ? '#ff9a3b' : e.tp === 'g' ? '#c01838' : e.tp === 'h' ? '#7a0c2a' : e.hp > 1 ? '#a01030' : '#ff3b4f'; g.fill(); } if (e.split || e.hp > 1 || e.tp === 'g' || e.tp === 'h') { g.strokeStyle = e.split ? '#9af2ff' : e.tp === 'h' ? '#ff6a5c' : '#ffd25f'; g.lineWidth = e.split ? 2.5 : e.tp === 'h' ? 3 : 2; g.beginPath(); g.arc(e.x, e.y, r * .54, 0, 7); g.stroke(); } });
        S.ms.forEach((m, i) => { if (!m.vivo) { g.fillStyle = '#ffffff22'; g.font = '16px system-ui'; g.textAlign = 'center'; g.fillText('✕', m.x, m.y + 5); g.textAlign = 'left'; return; }
          const held = [...ptr.values()].includes(i); if (held) { g.beginPath(); g.arc(m.x, m.y, S.R + 10, 0, 7); g.strokeStyle = cor(UN[i]) + 'aa'; g.lineWidth = 2; g.stroke(); } g.save(); g.beginPath(); g.arc(m.x, m.y, S.R + (held ? 3 : 0), 0, 7); g.shadowColor = cor(UN[i]); g.shadowBlur = held ? 20 : 8; g.fillStyle = cor(UN[i]); g.fill(); g.shadowBlur = 0; g.clip();
          if (imgs[i].complete && imgs[i].naturalWidth) g.drawImage(imgs[i], m.x - S.R, m.y - S.R, S.R * 2, S.R * 2); g.restore(); g.beginPath(); g.arc(m.x, m.y, S.R + (held ? 3 : 0), 0, 7); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke(); });
        { const E = S.est, pu = 1 + .12 * Math.sin(S.t * 6), hl = [...ptr.values()].includes('E'); g.save(); const gr = g.createRadialGradient(E.x, E.y, 2, E.x, E.y, 30 * pu); gr.addColorStop(0, '#ffffff'); gr.addColorStop(.25, '#ffe9a0'); gr.addColorStop(1, '#ffd25f00'); g.fillStyle = gr; g.beginPath(); g.arc(E.x, E.y, 30 * pu, 0, 7); g.fill(); g.shadowColor = '#ffd25f'; g.shadowBlur = hl ? 26 : 16; g.fillStyle = '#fff6cf'; g.beginPath(); g.arc(E.x, E.y, S.RES, 0, 7); g.fill(); g.restore(); }
        g.fillStyle = '#fff'; g.font = '700 14px system-ui'; g.fillText('Heróis ' + S.vivos() + ' / 8', 10, 20); g.fillText('Onda ' + Math.min(S.wave, S.WAVES) + '/' + S.WAVES, W - 80, 20);
        if (S.done) return fimJogo(); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop); return () => { acabou = true; cancelAnimationFrame(raf); };
    },
  });

  function stats() {   // para o admin: por minigame
    const L = log(), o = {}; LISTA.forEach(m => { o[m.id] = { n: 0, pct: 0, t: [0, 0, 0, 0], rw: 0, ms: 0 }; });
    L.forEach(r => { const s = o[r.id]; if (!s) return; s.n++; s.pct += r.pct; s.t[r.tier]++; s.rw += r.reward; s.ms += r.ms || 0; }); return o;
  }
  window.DSMini = { _uniao: uniaoSim, LISTA, play, cfg, setCfg, stats, resetLog: () => wr(LOG_KEY, []), resetCfg: () => wr(CFG_KEY, {}), tierOf };
})();
