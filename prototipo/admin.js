/* Dimensions Stacks — painel do administrador.
   - Registro compartilhado de partidas (capability db, coleção "matches": qualquer um escreve, só admin lê).
   - Simulador bot × bot no navegador (mesmo motor do jogo).
   - Tabelas de cartas (taxa de vitória, "apelonas"), duração, especiais, vantagem de quem começa.
   - Análise por IA (capability sample) sobre os números agregados. */
(function () {
  'use strict';
  const U = window.DSUI, ST = window.DSSTATS, E = U.E, D = U.D, CARDS = U.CARDS, SERIES = U.SERIES;
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const el = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  let C = null; // { db, user, sample, downloads, admin }
  async function caps() {
    if (C) return C;
    C = { db: null, user: null, sample: null, downloads: null, admin: false };
    const cl = window.claude; if (!cl || !cl.use) return C;
    const get = async n => { try { return await cl.use(n); } catch (e) { return null; } };
    [C.db, C.user, C.sample, C.downloads] = await Promise.all([get('db'), get('user'), get('sample'), get('downloads')]);
    try { C.admin = !!(C.user && await C.user.canEdit()); } catch (e) { }
    return C;
  }

  // ---------------------------------------------------------------- gravação compartilhada
  const pending = [];
  function slim(s) { const o = Object.assign({}, s); o.players = (s.players || []).map(p => ({ bot: !!p.bot })); return o; }
  async function push(s) {
    const c = await caps(); if (!c.db) return;
    try { await c.db.collection('matches').doc(s.id).set(slim(s)); } catch (e) { console.warn('log', e && e.code || e); }
  }
  ST.onMatch((s, ctx) => { if (ctx && ctx.shared) push(s); });

  // ---------------------------------------------------------------- agregação
  const ATN = { pod: 'Força', def: 'Resistência', int: 'Inteligência', vel: 'Velocidade' };
  function aggregate(list) {
    const A = { n: list.length, dur: 0, rounds: 0, combats: 0, spec: 0, ties: 0, limit: 0, cards: {}, att: { pod: 0, def: 0, int: 0, vel: 0 }, first: { g: 0, w: 0 }, modes: {}, winBy: {} };
    list.forEach(m => {
      A.dur += m.dur || 0; A.rounds += m.rounds || 0; A.combats += m.combats || 0; A.spec += m.spec || 0; A.ties += m.ties || 0; if (m.limit) A.limit++;
      const md = A.modes[m.mode] = A.modes[m.mode] || { n: 0, dur: 0, rounds: 0, combats: 0, spec: 0, limit: 0 }; md.n++; md.dur += m.dur || 0; md.rounds += m.rounds || 0; md.combats += m.combats || 0; md.spec += m.spec || 0; if (m.limit) md.limit++;
      Object.keys(m.att || {}).forEach(pid => Object.keys(m.att[pid]).forEach(a => { A.att[a] += m.att[pid][a]; }));
      Object.keys(m.cards || {}).forEach(id => { const c = A.cards[id] = A.cards[id] || { p: 0, w: 0, l: 0, s: 0 }; const x = m.cards[id]; c.p += x.p; c.w += x.w; c.l += x.l; c.s += x.s; });
      if (m.first != null && m.winner != null) { A.first.g++; if (m.first === m.winner) A.first.w++; }
      if (m.winner != null) { const k = m.n + 'j'; const b = A.winBy[k] = A.winBy[k] || { g: 0, first: 0 }; b.g++; if (m.first === m.winner) b.first++; }
    });
    let W = 0, L = 0; Object.values(A.cards).forEach(c => { W += c.w; L += c.l; }); A.base = W + L ? W / (W + L) : .5;
    A.rows = Object.keys(A.cards).map(id => {
      const c = A.cards[id], k = c.w + c.l, wr = k ? c.w / k : 0, z = k ? (wr - A.base) / Math.sqrt(A.base * (1 - A.base) / k) : 0;
      return { id, nome: CARDS[id] ? CARDS[id].nome : id, serie: CARDS[id] ? CARDS[id].serie : '', esp: CARDS[id] ? CARDS[id].especial : '', p: c.p, k, wr, z, s: c.s, sr: c.p ? c.s / c.p : 0 };
    });
    return A;
  }
  const avg = (v, n) => n ? v / n : 0;
  const fmtS = s => { s = Math.round(s); return s >= 60 ? Math.floor(s / 60) + 'm' + String(s % 60).padStart(2, '0') + 's' : s + 's'; };
  const MODE = { pvp: 'Pessoa × pessoa', pvb: 'Pessoa × CPU', bvb: 'CPU × CPU' };

  // ---------------------------------------------------------------- simulador
  async function simulate(o, prog, stop) {
    const out = [], st = ST;
    for (let i = 0; i < o.n; i++) {
      if (stop.on) break;
      const diff = o.diff === 'misto' ? ['facil', 'normal', 'dificil'][Math.floor(Math.random() * 3)] : o.diff;
      const players = [...Array(o.players)].map((_, k) => ({ name: 'CPU ' + (k + 1), bot: true, avatar: k }));
      const rec = st.recorder({ viewer: -1, online: false, humans: 0, n: o.players, diff, per: o.per, sf: o.sf, sim: true, duo: o.duo, ev: o.ev });
      let G, res = null;
      G = new E.Game({ players, perPlayer: o.per, difficulty: diff, specialsFrom: o.sf, events: o.ev, teams: o.duo ? [[0, 2], [1, 3]] : null, io: { notify: async (t, d) => { const r = rec.ev(t, d, G); if (r) res = r; } } });
      try { await G.run(); } catch (e) { console.warn('sim', e); }
      if (res && res.summary) { res.summary.dur = Math.round(res.summary.combats * 15); res.summary.durEst = true; out.push(res.summary); }
      if (i % 3 === 2) { prog(i + 1); await new Promise(r => setTimeout(r, 0)); }
    }
    prog(out.length); return out;
  }

  // ---------------------------------------------------------------- painel
  const S = { real: [], sims: [], src: 'todas', mode: 'todos', rules: 'todas', sort: 'z', dir: -1, minK: 20, busy: false, err: '', loaded: false };
  let root = null, stopSim = { on: false }, SV = {}, SVok = false, sov = null;

  function filtered() {
    const seen = new Set(); let L = []; if (S.src !== 'sim') L = L.concat(S.real.filter(m => !m.sim)); if (S.src !== 'real') L = L.concat(S.sims, S.real.filter(m => m.sim));
    L = L.filter(m => !seen.has(m.id) && seen.add(m.id));
    if (S.mode !== 'todos') L = L.filter(m => m.mode === S.mode);
    if (S.rules === 'ind') L = L.filter(m => !m.duo); else if (S.rules === 'duo') L = L.filter(m => m.duo); else if (S.rules === 'sev') L = L.filter(m => m.ev === false); else if (S.rules === 'ssp') L = L.filter(m => m.sf >= 99);
    return L;
  }
  async function loadReal() {
    const c = await caps(); S.err = '';
    if (!c.db) { S.err = 'Registro compartilhado indisponível (é preciso estar logado no claude.ai). Mostrando só partidas deste aparelho.'; S.real = ST.matches(); return; }
    try { const q = await c.db.collection('matches').limit(1000).get(); S.real = q.docs.map(d => d.data()); S.loaded = true; }
    catch (e) { S.err = 'Não foi possível ler o registro (' + (e && e.code || e) + '). Mostrando só este aparelho.'; S.real = ST.matches(); }
  }

  function html() {
    const L = filtered(), A = aggregate(L);
    const rows = A.rows.filter(r => r.k >= S.minK || r.p >= S.minK).slice().sort((a, b) => (a[S.sort] > b[S.sort] ? 1 : a[S.sort] < b[S.sort] ? -1 : 0) * S.dir);
    const th = (k, t) => `<th data-s="${k}" class="${S.sort === k ? 'on' : ''}">${t}${S.sort === k ? (S.dir < 0 ? ' ▾' : ' ▴') : ''}</th>`;
    const modes = Object.keys(A.modes).map(k => { const m = A.modes[k]; return `<tr><td>${MODE[k] || k}</td><td>${m.n}</td><td>${fmtS(avg(m.dur, m.n))}</td><td>${avg(m.rounds, m.n).toFixed(1)}</td><td>${avg(m.combats, m.n).toFixed(1)}</td><td>${avg(m.spec, m.n).toFixed(1)}</td><td>${Math.round(avg(m.limit, m.n) * 100)}%</td></tr>`; }).join('');
    const tot = Object.values(A.att).reduce((x, y) => x + y, 0) || 1;
    const fw = A.first.g ? Math.round(A.first.w / A.first.g * 100) : null;
    const hot = A.rows.filter(r => r.k >= S.minK && r.z > 2).sort((a, b) => b.z - a.z).slice(0, 8), cold = A.rows.filter(r => r.k >= S.minK && r.z < -2).sort((a, b) => a.z - b.z).slice(0, 8);
    const chip = r => `<span class="chip2" title="${esc(r.nome)}"><i style="background:${SERIES[r.serie] ? SERIES[r.serie].cor : '#888'}"></i>${esc(r.nome)} <b>${Math.round(r.wr * 100)}%</b></span>`;
    return `<div class="adm-in">
      <header class="adm-h"><h2>Painel do administrador</h2><button class="ibtn" data-a="close" aria-label="Fechar">✕</button></header>
      <nav class="adm-tabs">${[['dados', 'Dados'], ['sim', 'Simulador'], ['ferr', 'Ferramentas'], ['ia', 'Análise IA']].map(([k, t]) => `<button class="${(S.aba || 'dados') === k ? 'on' : ''}" data-a="aba" data-k="${k}">${t}</button>`).join('')}</nav>
      ${S.err ? `<p class="hint warn">${esc(S.err)}</p>` : ''}
      <section class="adm-box" data-t="dados"><div class="adm-f">
        <label>Origem <select data-f="src"><option value="todas"${S.src === 'todas' ? ' selected' : ''}>Real + simulada</option><option value="real"${S.src === 'real' ? ' selected' : ''}>Partidas reais</option><option value="sim"${S.src === 'sim' ? ' selected' : ''}>Simuladas</option></select></label>
        <label>Modo <select data-f="mode"><option value="todos">Todos</option>${Object.keys(MODE).map(k => `<option value="${k}"${S.mode === k ? ' selected' : ''}>${MODE[k]}</option>`).join('')}</select></label>
        <label>Regras <select data-f="rules">${[['todas', 'Todas'], ['ind', 'Todos contra todos'], ['duo', 'Duplas'], ['sev', 'Sem fenômenos'], ['ssp', 'Sem especiais']].map(([k, t]) => `<option value="${k}"${S.rules === k ? ' selected' : ''}>${t}</option>`).join('')}</select></label>
        <label>Mín. disputas/carta <select data-f="minK">${[1, 10, 20, 40, 80].map(v => `<option${S.minK === v ? ' selected' : ''}>${v}</option>`).join('')}</select></label>
        <button class="btn sm" data-a="reload">Atualizar</button><button class="btn sm" data-a="invite">Como convidar alguém</button></div>
        <div class="hint">${S.real.filter(m => !m.sim).length} partidas reais no registro · ${S.sims.length} simuladas nesta sessão · ${L.length} na análise</div></section>

      <section class="adm-box" data-t="sim"><h3>Simulador (CPU × CPU)</h3><div class="adm-f">
        <label>Partidas <select id="sN">${[20, 50, 100, 200, 500].map(v => `<option${v === 100 ? ' selected' : ''}>${v}</option>`).join('')}</select></label>
        <label>Jogadores <select id="sP"><option>2</option><option>3</option><option selected>4</option></select></label>
        <label>Modo <select id="sM"><option value="0">Todos contra todos</option><option value="1">Duplas (4 jogadores)</option></select></label>
        <label>Dificuldade <select id="sD"><option value="misto">Mista</option><option value="facil">Fácil</option><option value="normal" selected>Normal</option><option value="dificil">Difícil</option></select></label>
        <label>Cartas/jogador <select id="sC">${[7, 10, 14, 18, 21].map(v => `<option${v === 14 ? ' selected' : ''}>${v}</option>`).join('')}</select></label>
        <label>Especiais <select id="sS"><option value="2">Ligados (a partir da Rodada 2)</option><option value="99">Desligados</option></select></label>
        <label>Fenômenos <select id="sE"><option value="1">Ligados</option><option value="0">Desligados</option></select></label></div>
        <div class="adm-f"><button class="btn primary sm" data-a="sim">${S.busy ? 'Parar' : 'Rodar simulação'}</button><button class="btn ghost sm" data-a="clrsim">Limpar simuladas</button><button class="btn ghost sm" data-a="savesim">Salvar simuladas no registro</button><span class="hint" id="sProg"></span></div></section>

      <section class="adm-box" data-t="dados"><h3>Visão geral</h3><div class="adm-k">
        <div><b>${A.n}</b><small>partidas</small></div><div><b>${A.n ? fmtS(avg(A.dur, A.n)) : '—'}</b><small>duração média</small></div><div><b>${avg(A.rounds, A.n).toFixed(1)}</b><small>rodadas</small></div><div><b>${avg(A.combats, A.n).toFixed(1)}</b><small>disputas</small></div><div><b>${avg(A.spec, A.n).toFixed(1)}</b><small>especiais/partida</small></div><div><b>${A.n ? Math.round(A.limit / A.n * 100) : 0}%</b><small>fim por limite</small></div><div><b>${fw == null ? '—' : fw + '%'}</b><small>quem começa vence</small></div><div><b>${A.combats ? Math.round(A.ties / A.combats * 100) : 0}%</b><small>disputas empatadas</small></div></div>
        <div class="tblw"><table class="adm-t"><thead><tr><th>Modo</th><th>Partidas</th><th>Duração</th><th>Rodadas</th><th>Disputas</th><th>Especiais</th><th>Limite</th></tr></thead><tbody>${modes || '<tr><td colspan="7">Sem dados</td></tr>'}</tbody></table></div>
        <div class="adm-att">${Object.keys(ATN).map(a => `<div><span>${ATN[a]}</span><div class="bar"><i style="width:${Math.round(A.att[a] / tot * 100)}%"></i></div><em>${Math.round(A.att[a] / tot * 100)}%</em></div>`).join('')}</div>
        <div class="hint">Atributo vencedor nas disputas. Duração de partidas simuladas é estimada (≈15 s por disputa). Base de vitória por carta: ${Math.round(A.base * 100)}% (cada disputa tem vários participantes).</div></section>

      <section class="adm-box" data-t="dados"><h3>Cartas</h3>
        ${hot.length ? `<div class="hint">Acima do esperado (z > 2):</div><div class="chips2">${hot.map(chip).join('')}</div>` : ''}
        ${cold.length ? `<div class="hint">Abaixo do esperado (z < −2):</div><div class="chips2">${cold.map(chip).join('')}</div>` : ''}
        ${!hot.length && !cold.length ? '<div class="hint">Nenhuma carta fora do esperado ainda — rode mais partidas.</div>' : ''}
        <div class="tblw tall"><table class="adm-t" id="cardT"><thead><tr>${th('nome', 'Carta')}${th('p', 'Em jogo')}${th('k', 'Disputas')}${th('wr', 'Vitória')}${th('z', 'z')}${th('sr', 'Especial')}</tr></thead><tbody>${rows.map(r => `<tr class="${r.z > 2 ? 'hot' : r.z < -2 ? 'cold' : ''}"><td><i class="sdot" style="background:${SERIES[r.serie] ? SERIES[r.serie].cor : '#888'}"></i>${esc(r.nome)}</td><td>${r.p}</td><td>${r.k}</td><td>${Math.round(r.wr * 100)}%</td><td>${r.z.toFixed(1)}</td><td>${r.s ? Math.round(r.sr * 100) + '%' : '—'}</td></tr>`).join('') || '<tr><td colspan="6">Sem dados</td></tr>'}</tbody></table></div></section>

      <section class="adm-box" data-t="ferr"><h3>Sons do jogo</h3>
        <div class="adm-f"><button class="btn primary sm" data-a="sndopen">Abrir tela de sons</button></div>
        <p class="hint">Ouvir as 5 versões de cada efeito e gravar a escolha. A música para enquanto a tela de sons estiver aberta.</p></section>
      <section class="adm-box" data-t="ferr"><h3>Minigames do modo história</h3><div class="adm-f"><button class="btn primary sm" data-a="miniopen">Testar e calibrar minigames</button></div>
        <p class="hint">Teste cada minigame, ajuste dificuldade, cortes e prêmios e veja os resultados registrados.</p></section>
      <section class="adm-box" data-t="ia"><h3>Análise com IA</h3><div class="adm-f"><button class="btn primary sm" data-a="ai"${A.n ? '' : ' disabled'}>Analisar balanceamento</button><button class="btn ghost sm" data-a="dl"${A.n ? '' : ' disabled'}>Baixar dados (JSON)</button></div><div class="aiout" id="aiOut"></div></section>
    </div>`;
  }

  // tela de sons: 5 versões de cada efeito (e as trilhas). A música para enquanto ela está aberta e volta ao fechar.
  function sounds() {
    return `<div class="adm-in"><header class="adm-h"><h2>Sons do jogo</h2><button class="ibtn" data-a="sndclose" aria-label="Fechar">✕</button></header>
      <section class="adm-box">
        ${(() => { const SND = U.SND; if (!SND.escolha) SND.carregaEscolha(); if (!SVok) { SV = Object.assign({}, SND.escolha); SVok = true; } const nomes = SND.NOMES_VARIANTES || [];
          return `<p class="hint">Toque em 1–5 para ouvir e escolher a versão de cada efeito (${nomes.map((n, i) => `<b>${i + 1}</b> ${esc(n)}`).join(' · ')}). Depois toque em <b>Gravar escolhas</b>: a escolha vira o som oficial neste aparelho.</p>
          <div class="sfxl">${Object.entries(SND.SLOTS).filter(([k]) => k !== 'menu' && SND.variants && SND.variants[k]).map(([k, t]) => `<div class="sfxrow" data-k="${k}"><span class="sfxn">${esc(t)}</span><span class="sfxb">${[0, 1, 2, 3, 4].map(i => `<button class="btn sm sfxv${(SV[k] | 0) === i ? ' on' : ''}" data-a="sv" data-k="${k}" data-i="${i}" title="${esc(nomes[i] || '')}" aria-label="${esc(t)}, versão ${i + 1}">${i + 1}</button>`).join('')}</span></div>`).join('')}</div>
          <div class="adm-f" style="margin-top:8px"><button class="btn primary sm" data-a="svsave">Gravar escolhas</button><button class="btn ghost sm" data-a="svreset">Tudo no original</button><button class="btn ghost sm" data-a="svcopy">Copiar escolhas</button><span class="hint" id="svmsg" style="align-self:center"></span></div>`; })()}
        <div class="adm-f" style="margin-top:10px"><span class="hint" style="align-self:center">Trilhas:</span>
          <button class="btn sm" data-a="mus" data-v="menu">Ambiente do menu</button><button class="btn sm" data-a="mus" data-v="0">Partida · normal</button><button class="btn sm" data-a="mus" data-v="1">Partida · tensão</button><button class="btn sm" data-a="mus" data-v="2">Partida · clímax</button><button class="btn ghost sm" data-a="mus" data-v="stop">Parar</button></div>
        <div class="adm-f" style="margin-top:8px"><span class="hint" style="align-self:center">Modo História:</span>${[['mapa', 'Mapa'], ['batalha', 'Batalha'], ['arauto', 'Arauto'], ['guardiao', 'Guardião'], ['boss', 'Boss final'], ['intro', 'Abertura'], ['final', 'Final'], ['loja', 'Loja']].map(([k, n]) => `<button class="btn sm" data-a="mush" data-v="${k}">${n}</button>`).join('')}</div>
        <p class="hint">O Arauto tem trilha própria (<code>musica/historia_arauto.mp3</code>). O Guardião usa a trilha de miniboss até existir <code>musica/historia_guardiao.mp3</code>.</p>
        <p class="hint">A trilha da partida só toca com a música ligada nas opções. Na partida real, a tensão e o clímax duram um trecho e voltam ao normal.</p></section></div>`;
  }
  function openSounds() {
    if (sov) return; U.SND.init(); U.SND.stopMusic(); SVok = false;
    sov = el('<div class="adm sov" role="dialog" aria-label="Sons do jogo"></div>'); sov.innerHTML = sounds(); sov.onclick = root.onclick; U.layer().appendChild(sov);
  }
  function closeSounds() { if (!sov) return; sov.remove(); sov = null; try { U.SND.histStop(); } catch (e) { } if (U.SND) U.SND.setMode('menu'); }

  function digest(A) {
    const top = (arr) => arr.map(r => ({ carta: r.nome, serie: r.serie, especial: r.esp, disputas: r.k, vitoria: Math.round(r.wr * 100), z: +r.z.toFixed(1) }));
    const ok = A.rows.filter(r => r.k >= S.minK);
    return { partidas: A.n, duracaoMediaSeg: Math.round(avg(A.dur, A.n)), rodadasMedia: +avg(A.rounds, A.n).toFixed(1), disputasMedia: +avg(A.combats, A.n).toFixed(1), especiaisPorPartida: +avg(A.spec, A.n).toFixed(1), fimPorLimitePct: Math.round(A.limit / (A.n || 1) * 100), empatePctDisputas: Math.round(A.ties / (A.combats || 1) * 100),
      quemComecaVencePct: A.first.g ? Math.round(A.first.w / A.first.g * 100) : null, vencedorPorAtributoPct: Object.fromEntries(Object.keys(A.att).map(a => [ATN[a], Math.round(A.att[a] / (Object.values(A.att).reduce((x, y) => x + y, 0) || 1) * 100)])),
      porModo: Object.fromEntries(Object.keys(A.modes).map(k => [MODE[k] || k, { partidas: A.modes[k].n, duracaoSeg: Math.round(avg(A.modes[k].dur, A.modes[k].n)), rodadas: +avg(A.modes[k].rounds, A.modes[k].n).toFixed(1) }])),
      baseVitoriaPct: Math.round(A.base * 100), cartasMaisFortes: top(ok.slice().sort((a, b) => b.z - a.z).slice(0, 12)), cartasMaisFracas: top(ok.slice().sort((a, b) => a.z - b.z).slice(0, 12)),
      especiaisMaisUsados: ok.filter(r => r.s).sort((a, b) => b.sr - a.sr).slice(0, 8).map(r => ({ carta: r.nome, especial: r.esp, usoPct: Math.round(r.sr * 100) })) };
  }

  // minigames: testar cada um e calibrar dificuldade, cortes e prêmios (valem neste aparelho)
  let mov = null;
  function miniHtml() {
    const M = window.DSMini, st = M.stats();
    const linhas = M.LISTA.map(m => { const c = M.cfg(m.id), s = st[m.id], n = s.n || 0;
      return `<div class="mini-c" data-id="${m.id}"><div class="mini-top"><div><b>${esc(m.nome)}</b>${m.serie ? ' <small>(' + esc(m.serie) + ')</small>' : ''}<br><small>${esc(m.desc)}</small></div><button class="btn primary sm" data-a="miniplay" data-id="${m.id}">Testar</button></div>
        <div class="mini-f"><label>Dificuldade<input type="number" step="0.1" min="0.5" max="2" value="${c.dif}" data-m="dif"></label>
        <label>Cortes (tier 1 2 3)<input type="text" value="${c.cortes.join(' ')}" data-m="cortes"></label>
        <label>Prêmios (tier 0 1 2 3)<input type="text" value="${c.premios.join(' ')}" data-m="premios"></label></div>
        <div class="mini-s">${n ? `<span>${n} jogos</span><span>média ${Math.round(s.pct / n * 100)}%</span><span>tiers ${s.t.map(x => Math.round(x / n * 100)).join(' / ')}%</span><span>${(s.rw / n).toFixed(1)} pênd.</span><span>${Math.round(s.ms / n / 1000)}s</span>` : '<span>sem partidas de teste</span>'}</div></div>`; }).join('');
    const tot = M.LISTA.reduce((a, m) => a + (M.cfg(m.id).premios[3] | 0), 0);
    return `<div class="adm-in"><header class="adm-h"><h2>Minigames</h2><button class="ibtn" data-a="miniclose" aria-label="Fechar">✕</button></header>
      <section class="adm-box"><p class="hint">Teste cada minigame e ajuste: <b>dif</b> (dificuldade, 0,5 a 2), <b>cortes</b> (percentual mínimo para tier 1, 2 e 3) e <b>prêmios</b> (pêndulos nos tiers 0 a 3). As mudanças valem neste aparelho. Colunas à direita: partidas de teste, média, distribuição dos tiers (0/1/2/3), pêndulos médios e tempo médio. Se quase ninguém passa do tier 0 ou todo mundo faz tier 3, o minigame está mal calibrado.</p>
      <p class="hint">Prêmio máximo somado dos minigames: <b>${tot}</b> pêndulos.</p>
      <div class="mini-l">${linhas}</div>
      <div class="adm-f"><button class="btn ghost sm" data-a="minireset">Zerar resultados</button><button class="btn ghost sm" data-a="minicfgreset">Voltar calibragem ao padrão</button></div></section></div>`;
  }
  function paintMini() { if (!mov) return; const sc = mov.scrollTop; mov.innerHTML = miniHtml(); mov.scrollTop = sc; }
  function openMini() { if (mov || !window.DSMini) return; mov = el('<div class="adm sov" role="dialog" aria-label="Minigames"></div>'); mov.innerHTML = miniHtml(); mov.onclick = root.onclick;
    mov.onchange = e => { const m = e.target.dataset.m, tr = e.target.closest('.mini-c'); if (!m || !tr) return; const num = v => String(v).split(/[\s,;]+/).filter(Boolean).map(Number).filter(x => !isNaN(x));
      const v = m === 'dif' ? Math.max(.5, Math.min(2, +e.target.value || 1)) : num(e.target.value); if (m !== 'dif' && v.length !== (m === 'cortes' ? 3 : 4)) { paintMini(); return; } window.DSMini.setCfg(tr.dataset.id, { [m]: v }); paintMini(); };
    U.layer().appendChild(mov); }
  function closeMini() { if (mov) { mov.remove(); mov = null; } }

  function bind() {
    root.onclick = async e => {
      const b = e.target.closest('[data-a],th[data-s]'); if (!b) return;
      if (b.dataset.s) { if (S.sort === b.dataset.s) S.dir *= -1; else { S.sort = b.dataset.s; S.dir = b.dataset.s === 'nome' ? 1 : -1; } return paint(); }
      const a = b.dataset.a;
      if (a === 'aba') { S.aba = b.dataset.k; $$('.adm-tabs button', root).forEach(x => x.classList.toggle('on', x.dataset.k === S.aba)); $$('[data-t]', root).forEach(x => { x.hidden = x.dataset.t !== S.aba; }); return; }
      if (a === 'miniopen') openMini();
      else if (a === 'miniclose') closeMini();
      else if (a === 'miniplay') { const id = b.dataset.id; await window.DSMini.play(id, { teste: true }); paintMini(); }
      else if (a === 'minireset') { window.DSMini.resetLog(); paintMini(); }
      else if (a === 'minicfgreset') { window.DSMini.resetCfg(); paintMini(); }
      else if (a === 'sndopen') openSounds();
      else if (a === 'sndclose') closeSounds();
      else if (a === 'close') { closeSounds(); closeMini(); root.remove(); root = null; SVok = false; stopSim.on = true; U.SND.setMode('menu'); }
      else if (a === 'snd') { U.SND.init(); U.SND.play(b.dataset.k); }
      else if (a === 'sv') { const k = b.dataset.k, i = +b.dataset.i; U.SND.init(); U.SND.preview(k, i); SV[k] = i; $$('.sfxv', b.parentNode).forEach(x => x.classList.toggle('on', x === b)); const m = $('#svmsg'); if (m) m.textContent = 'Há escolhas não gravadas'; }
      else if (a === 'svsave') { const o = {}; Object.keys(SV).forEach(k => { if (SV[k]) o[k] = SV[k]; }); U.store.set('sfx', o); U.SND.escolha = o; const m = $('#svmsg'); if (m) m.textContent = 'Gravado ✓ (' + Object.keys(o).length + ' diferentes do original)'; }
      else if (a === 'svreset') { SV = {}; $$('.sfxrow', sov).forEach(r => $$('.sfxv', r).forEach((x, i) => x.classList.toggle('on', i === 0))); const m = $('#svmsg'); if (m) m.textContent = 'Tudo no original — toque em Gravar para confirmar'; }
      else if (a === 'svcopy') { const txt = Object.entries(U.SND.SLOTS).filter(([k]) => k !== 'menu' && U.SND.variants && U.SND.variants[k]).map(([k]) => k + '=' + ((SV[k] | 0) + 1)).join(', '); const m = $('#svmsg'); const done = () => { if (m) m.textContent = 'Copiado'; }; try { navigator.clipboard.writeText(txt).then(done, () => { if (m) m.textContent = txt; }); } catch (e) { if (m) m.textContent = txt; } }
      else if (a === 'mush') { const SND = U.SND; SND.init(); if (!SND.ctx) return; SND.stopMusic(); SND.histStop(); SND.histNow = null; SND.musicOn = true; SND.histPlay(b.dataset.v); }
      else if (a === 'mus') {
        const SND = U.SND, v = b.dataset.v; SND.init(); if (!SND.ctx) return;
        if (v === 'stop') { SND.stopMusic(); return; }
        if (v === 'menu') { SND.stopMusic(); SND.setMode('menu'); return; }
        SND.setMode('game'); const m = SND.matchNodes; if (!m) return;
        m.level = +v; m.req = +v; m.hold = v === '0' ? 0 : SND.ctx.currentTime + 40; m.cool = 0;
      }
      else if (a === 'invite') {
        const m = el(`<div class="modal"><div class="box"><h2>Como convidar alguém</h2>
          <ol class="invsteps">
            <li><b>Compartilhe o jogo.</b> Na página deste jogo no Claude, use o botão <b>Compartilhar</b> e deixe o acesso liberado para quem tiver o link.</li>
            <li><b>Copie o link</b> e envie à pessoa (mensagem, e-mail, grupo).</li>
            <li><b>Ela abre o link</b> e entra no jogo. Para manter o progresso, deve criar o perfil em <b>Perfil</b>.</li>
            <li><b>Para jogar junto:</b> você toca em <b>🌐 Jogar online → Criar sala</b> e passa o código de 4 letras/números.</li>
            <li><b>Ela entra</b> em <b>🌐 Jogar online → Entrar</b>, digita o código e aguarda o início.</li>
          </ol>
          <div class="row" style="justify-content:center"><button class="btn primary" data-x="1">Entendi</button></div></div></div>`);
        m.onclick = ev => { if (ev.target === m || ev.target.closest('[data-x]')) m.remove(); }; m.style.zIndex = 400; root.appendChild(m);
      }
      else if (a === 'reload') { b.disabled = true; await loadReal(); paint(); }
      else if (a === 'clrsim') { S.sims = []; paint(); }
      else if (a === 'savesim') {
        const c = await caps(); if (!c.db) return; b.disabled = true; let n = 0; const prog = $('#sProg', root);
        for (const s of S.sims) { if (s.saved) continue; try { await c.db.collection('matches').doc(s.id).set(slim(s)); s.saved = true; n++; if (prog) prog.textContent = 'Salvando… ' + n; } catch (er) { break; } }
        await loadReal(); paint();
      }
      else if (a === 'sim') {
        if (S.busy) { stopSim.on = true; return; }
        const g = id => $(id, root).value; const o = { n: +g('#sN'), players: +g('#sP'), diff: g('#sD'), per: +g('#sC'), sf: +g('#sS'), ev: g('#sE') !== '0', duo: g('#sM') === '1' }; if (o.duo) o.players = 4;
        if (o.per * o.players > D.CARTAS.length) o.per = Math.floor(D.CARTAS.length / o.players);
        S.busy = true; stopSim = { on: false }; b.textContent = 'Parar'; const prog = $('#sProg', root);
        const out = await simulate(o, n => { const p = $('#sProg', root); if (p) p.textContent = n + ' / ' + o.n; }, stopSim);
        S.sims = S.sims.concat(out); S.busy = false; if (root) paint();
      }
      else if (a === 'ai') {
        const c = await caps(); const out = $('#aiOut', root); if (!c.sample) { out.textContent = 'IA indisponível neste contexto.'; return; }
        const dg = digest(aggregate(filtered())); b.disabled = true; out.textContent = 'Analisando…';
        try {
          const r = await c.sample([{ role: 'user', content: 'Você é analista de balanceamento do jogo de cartas "Dimensions Stacks" (disputas simultâneas por atributos Força/Resistência/Inteligência/Velocidade; cada carta tem um especial; vence quem fica com todas as cartas). Com os números agregados abaixo (z = desvio da taxa de vitória da carta em relação à média), responda em português, objetivo e em tópicos curtos: 1) cartas apelonas e fracas, com hipótese do porquê (atributos/especial); 2) atributos ou especiais dominantes; 3) duração e ritmo das partidas, vantagem de quem começa; 4) 5 ajustes concretos sugeridos, em ordem de prioridade; 5) o que testar a seguir. Avise quando a amostra for pequena.\n\nDADOS:\n' + JSON.stringify(dg) }], { cache: false, modelTier: 'default', onText: u => { out.textContent = u.text; } });
          out.textContent = r.text;
        } catch (er) { out.textContent = 'Falha na análise: ' + (er && er.message || er && er.code || er); }
        b.disabled = false;
      }
      else if (a === 'dl') {
        const c = await caps(); const data = JSON.stringify({ geradoEm: new Date().toISOString(), resumo: digest(aggregate(filtered())), partidas: filtered() });
        if (c.downloads) { try { await c.downloads.save({ filename: 'dimensions-stacks-partidas.json', data }); } catch (er) { } }
      }
    };
    root.onchange = e => { const f = e.target.dataset.f; if (!f) return; S[f] = f === 'minK' ? +e.target.value : e.target.value; paint(); };
  }
  function paint() {
    if (!root) return; const sc = root.scrollTop, tw = $('.tblw.tall', root), tsc = tw ? tw.scrollTop : 0;
    const keep = {}; ['#sN', '#sP', '#sD', '#sC', '#sS'].forEach(k => { const x = $(k, root); if (x) keep[k] = x.value; });
    const ai = $('#aiOut', root), aiT = ai ? ai.textContent : '';
    root.innerHTML = html(); Object.keys(keep).forEach(k => { const x = $(k, root); if (x) x.value = keep[k]; });
    if (aiT) $('#aiOut', root).textContent = aiT; if (S.busy) { const sb = $('[data-a=sim]', root); if (sb) sb.textContent = 'Parar'; }
    $$('[data-t]', root).forEach(x => { x.hidden = x.dataset.t !== (S.aba || 'dados'); });
    root.scrollTop = sc; const t2 = $('.tblw.tall', root); if (t2) t2.scrollTop = tsc;
  }
  async function open() {
    if (root) return; root = el('<div class="adm" role="dialog" aria-label="Painel do administrador"></div>'); U.layer().appendChild(root);
    root.innerHTML = '<div class="adm-in"><p class="hint">Carregando…</p></div>'; bind();
    await loadReal(); paint();
  }
  U.adminOpen = open;

  U.adminHook = async function (host) {
    const c = await caps(); if (!c.admin || !host || !host.isConnected) return;
    const b = el('<button class="btn sm">Painel do administrador</button>'); b.onclick = () => { U.SND && 0; open(); }; host.appendChild(b);
  };
  // se o perfil já estiver desenhado quando as capacidades chegarem
  caps().then(c => { if (c.admin && U.profTab && document.getElementById('prof') && !document.getElementById('prof').hidden) U.profTab(); });
})();
