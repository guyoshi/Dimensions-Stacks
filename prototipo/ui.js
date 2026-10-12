/* Dimensions Stacks — UI base: helpers, cartas, telas (menu, config, regras, coleção, opções). */
(function () {
  'use strict';
  const D = window.DS_DATA, E = window.DS_ENGINE;
  const { SERIES, ATRIBUTOS, RARIDADES, CARTAS } = D;
  const CARDS = Object.fromEntries(CARTAS.map(c => [c.id, c]));
  const ATT = Object.fromEntries(ATRIBUTOS.map(a => [a.id, a]));
  const AIDS = ATRIBUTOS.map(a => a.id);
  const IMG = window.CARD_IMAGES || {};
  const SND = window.Sound;
  const U = window.DSUI = { CARDS, ATT, AIDS, SERIES, IMG, E, D, SND };

  // ---------------------------------------------------------------- util
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const el = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  Object.assign(U, { $, $$, el, esc });
  const store = {
    get(k, d) { try { const v = localStorage.getItem('dsstacks.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('dsstacks.' + k, JSON.stringify(v)); } catch (e) { } },
  };
  U.store = store;

  // ---------------------------------------------------------------- opções
  const S = Object.assign({ master: .8, sfx: 1, music: .35, musicOn: true, speed: 'normal', showTest: true, reduce: false }, store.get('opts', {}));
  U.S = S;
  Object.defineProperty(S, 'k', { enumerable: false, get() { return { lento: 1.5, normal: 1, rapido: .55 }[S.speed] || 1; } });
  function applyOpts() {
    document.body.classList.toggle('noteste', !S.showTest);
    document.body.classList.toggle('reduce', !!S.reduce);
    SND.vol.master = S.master; SND.vol.sfx = S.sfx; SND.vol.music = S.music; SND.musicOn = S.musicOn;
    if (SND.ctx) { SND.setVol('master', S.master); SND.setVol('sfx', S.sfx); SND.setVol('music', S.music); SND.setMusic(S.musicOn); }
    store.set('opts', S);
  }
  U.applyOpts = applyOpts;

  // controle de execução (para abortar partida)
  U.run = { dead: false, rej: new Set() };
  U.newRun = () => { U.run = { dead: false, rej: new Set() }; return U.run; };
  U.killRun = () => { const r = U.run; r.dead = true; r.rej.forEach(f => f('abort')); r.rej.clear(); };
  U.sleep = ms => { const r = U.run; return new Promise((res, rej) => { setTimeout(() => (r.dead ? rej('abort') : res()), ms * S.k); }); };

  // ---------------------------------------------------------------- ícones
  const ICON = {
    pod: '<svg viewBox="0 0 24 24"><path d="M12 1l2.6 6.4L21 5l-2.4 6.6L23 14l-6.5 1.6L18 22l-6-3.6L6 22l1.5-6.4L1 14l4.4-2.4L3 5l6.4 2.4z"/></svg>',
    def: '<svg viewBox="0 0 24 24"><path d="M12 2l8 3v6c0 5.2-3.4 9.4-8 11-4.6-1.6-8-5.8-8-11V5z"/></svg>',
    int: '<svg viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12 5C6 5 2 12 2 12s4 7 10 7 10-7 10-7-4-7-10-7zm0 11a4 4 0 110-8 4 4 0 010 8zm0-2.2a1.8 1.8 0 100-3.6 1.8 1.8 0 000 3.6z"/></svg>',
    vel: '<svg viewBox="0 0 24 24"><path d="M13 2L4 14h6l-1 8 10-13h-6z"/></svg>',
  };
  U.ICON = ICON;
  const PCOL = ['var(--p0)', 'var(--p1)', 'var(--p2)', 'var(--p3)'];
  U.PCOL = PCOL;

  // ---------------------------------------------------------------- cartas
  const SIL = '<svg viewBox="0 0 100 100"><circle cx="50" cy="34" r="18"/><path d="M12 100c0-26 16-40 38-40s38 14 38 40z"/></svg>';
  function statsHTML(base, st, attr) {
    return AIDS.map(a => {
      const d = st[a] - base[a];
      return `<div class="st${d > 0 ? ' mod' : d < 0 ? ' modn' : ''}" data-a="${a}" title="${ATT[a].nome}">${ICON[a]}<b>${st[a]}</b></div>`;
    }).join('');
  }
  function cardEl(id, o) {
    o = o || {};
    const c = CARDS[id], s = SERIES[c.serie], st = o.stats || c.stats;
    const sp = E.SPECIALS[c.especial];
    const n = { comum: 1, rara: 2, epica: 3, lendaria: 4 }[c.raridade] || 1;
    const art = IMG[id] ? `<div class="art"><img alt="${esc(c.nome)}" src="${IMG[id]}" draggable="false"></div>`
      : `<div class="ph">${SIL}<i>sem foto</i></div>`;
    const node = el(`<div class="card rar-${c.raridade}${o.up ? ' up' : ''}${o.noanim ? ' noanim' : ''}" data-id="${id}">
      <div class="flip"><div class="face back"><i class="seal"></i></div>
      <div class="face front"><div class="in">${art}<div class="shade"></div>
        <div class="mark"><span class="ser">${esc(s.titulo || s.marca)}</span></div>
        ${c.uniao ? '<div class="uni" title="A União"></div>' : ''}
        <div class="bot"><div class="nome">${esc(c.nome)}</div><div class="espc">${esc(sp ? sp.nome : '—')}</div>
        <div class="stats">${statsHTML(c.stats, st)}</div><div class="rar" title="${RARIDADES[c.raridade].nome}">${'<i>◆</i>'.repeat(n)}</div></div></div>
        ${c.provisorio ? '<div class="teste">PRÉVIA</div>' : ''}
      </div></div></div>`);
    node.dataset.serie = c.serie; node.style.setProperty('--c', s.cor); node.style.setProperty('--c2', s.cor2); node.style.setProperty('--cd', s.escuro); node.style.setProperty('--t', s.texto);
    if (o.cw) node.style.setProperty('--cw', o.cw + 'px');
    if (o.attr) node.dataset.attr = o.attr;
    if (o.click) { node.classList.add('click'); node.addEventListener('click', () => { const g = node.closest('.cgrid'); U.zoom(id, g ? { list: [...g.querySelectorAll('.card[data-id]')].map(x => x.dataset.id) } : null); }); }
    return node;
  }
  function updateCard(node, stats, attr) {
    const c = CARDS[node.dataset.id];
    const box = $('.stats', node); if (box) box.innerHTML = statsHTML(c.stats, stats);
    if (attr) node.dataset.attr = attr; else delete node.dataset.attr;
  }
  Object.assign(U, { cardEl, updateCard });

  // ---------------------------------------------------------------- camadas
  U.layer = () => $('#layer');
  U.modal = function (content, o) {
    o = o || {};
    const m = el(`<div class="modal"><div class="box ${o.cls || ''}"><button class="btn ghost sm x" aria-label="Fechar">✕</button></div></div>`);
    $('.box', m).append(content);
    const close = () => { m.remove(); document.removeEventListener('keydown', key); if (o.onclose) o.onclose(); };
    const key = e => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', key);
    m.addEventListener('click', e => { if (e.target === m) close(); });
    $('.x', m).onclick = () => { SND.play('click'); close(); };
    U.layer().appendChild(m);
    return { node: m, close };
  };
  U.zoom = function (id, opts) {
    opts = opts || {};
    const list = opts.list && opts.list.length > 1 ? opts.list : null;
    let idx = list ? Math.max(0, list.indexOf(id)) : 0;
    const w = Math.min(280, window.innerWidth - 60);
    const stage = el('<div class="zoomstage"></div>');
    function build(cid) {
      const c = CARDS[cid], s = SERIES[c.serie], sp = E.SPECIALS[c.especial];
      const wrap = el(`<div class="zoomwrap"></div>`);
      wrap.append(cardEl(cid, { up: true, noanim: true, cw: w }));
      const max = 100;
      wrap.append(el(`<div class="meta">
        <h2>${esc(c.nome)}</h2>
        <div class="row"><span class="pill" style="background:${s.cor};color:${s.texto}">${esc(s.nome)}</span><span class="pill">${c.perfil ? 'Perfil: ' + esc(c.perfil) : RARIDADES[c.raridade].nome}</span>${c.uniao ? '<span class="pill">A União</span>' : ''}${c.provisorio ? '<span class="pill" style="background:#ff5a7a">proposta · não aprovada</span>' : ''}${IMG[cid] ? '' : '<span class="pill">sem foto</span>'}</div>
        <div class="stbars">${AIDS.map(a => `<div class="stbar" data-a="${a}">${ICON[a]}<i><s style="width:${Math.min(100, c.stats[a] / max * 100)}%"></s></i><b>${c.stats[a]}</b></div>`).join('')}</div>
        <div><b>✦ ${esc(sp ? sp.nome : '—')}</b><br><span class="hint">${esc(sp ? sp.texto : '')}</span>${sp && sp.stub ? '<br><span class="hint">⚠ Efeito ainda não implementado neste protótipo.</span>' : ''}</div>
        ${c.descricao ? `<p>${esc(c.descricao)}</p>` : ''}
        ${c.nota ? `<div class="hint">Nota do elenco: ${esc(c.nota)}</div>` : ''}</div>`));
      const meta = $('.meta', wrap), fb = el('<button class="btn sm favbtn" type="button"></button>');
      const paint = () => { const f = window.DSSTATS && window.DSSTATS.isFav(cid); fb.innerHTML = (f ? U.ICO.star : U.ICO.starO) + (f ? 'Favorita' : 'Favoritar'); fb.classList.toggle('on', !!f); };
      fb.onclick = () => { SND.play('click'); const r = window.DSSTATS.toggleFav(cid); paint(); document.querySelectorAll('.card[data-id="' + cid + '"]').forEach(x => { if (!x.closest('.zoomwrap')) x.classList.toggle('isfav', r.fav); }); if (r.unlocked && r.unlocked.length) U.toast('Conquista: ' + r.unlocked.map(a => a.nome).join(', ')); };
      paint(); meta.insertBefore(fb, meta.children[1]);
      return wrap;
    }
    stage.append(build(id));
    const root = el('<div class="zoomroot"></div>');
    root.append(stage);
    let counter = null, busy = false;
    function go(dir) {
      if (!list || busy) return; busy = true;
      idx = (idx + dir + list.length) % list.length;
      const old = stage.firstElementChild, nw = build(list[idx]);
      const red = document.body.classList.contains('reduce');
      nw.classList.add(red ? 'zin-fade' : dir > 0 ? 'zin-r' : 'zin-l');
      if (old) { old.classList.add(red ? 'zout-fade' : dir > 0 ? 'zout-l' : 'zout-r'); setTimeout(() => old.remove(), 260); }
      stage.append(nw);
      SND.play(dir > 0 ? 'flip' : 'tick');
      if (counter) counter.textContent = (idx + 1) + ' / ' + list.length;
      setTimeout(() => { busy = false; nw.classList.remove('zin-r', 'zin-l', 'zin-fade'); }, 280);
    }
    let m;
    if (list) {
      const prev = el('<button class="btn zoomnav prev" aria-label="Carta anterior">◀</button>');
      const next = el('<button class="btn zoomnav next" aria-label="Próxima carta">▶</button>');
      counter = el(`<div class="zoomcount">${idx + 1} / ${list.length}</div>`);
      prev.onclick = () => go(-1); next.onclick = () => go(1);
      root.append(prev, next, counter);
      const key = e => { if (e.key === 'ArrowLeft') go(-1); else if (e.key === 'ArrowRight') go(1); };
      document.addEventListener('keydown', key);
      let x0 = null;
      root.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
      root.addEventListener('touchend', e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); });
      m = U.modal(root, { cls: 'zoombox', onclose: () => document.removeEventListener('keydown', key) });
    } else m = U.modal(root, { cls: 'zoombox' });
    SND.play('click');
    return m;
  };

  // ---------------------------------------------------------------- telas
  U.show = function (name) {
    $$('.screen').forEach(s => { s.hidden = s.id !== name; });
    if (U.afterShow) U.afterShow(name);
    if (name !== 'game') SND.setMusic && S.musicOn && SND.ctx && SND.startMusic();
  };
  function screens() {
    const app = $('#app');
    app.innerHTML = `<section id="menu" class="screen"></section><section id="setup" class="screen" hidden></section><section id="online" class="screen" hidden></section><section id="game" class="screen" hidden></section><div id="layer"></div>`;
  }


  // fundo da tela inicial: cartas flutuando (profundidades diferentes) e brilhos que crescem e somem
  function menuFx() {
    const rnd = (a, b) => a + Math.random() * (b - a);
    const bg = el('<div class="menu-bg" aria-hidden="true"><div class="fcards"></div><div class="sparks"></div><div class="vig"></div></div>');
    const pool = Object.keys(CARDS); const withImg = pool.filter(id => IMG[id]); const ids = withImg.concat(pool.filter(id => !IMG[id])).slice(0, 40);
    const fc = $('.fcards', bg), N = 9;
    const order = ids.sort(() => Math.random() - .5);
    for (let i = 0; i < N; i++) {
      const depth = rnd(0, 1); const cw = Math.round(54 + depth * 78); const dur = rnd(46, 90) - depth * 22;
      const w = el(`<div class="fc" style="--x:${((i + rnd(.1, .9)) / N * 100).toFixed(1)}%;--cw:${cw}px;--dur:${dur.toFixed(1)}s;--delay:${(-rnd(0, dur)).toFixed(1)}s;--rot:${rnd(-24, 24).toFixed(1)}deg;--rot2:${rnd(-24, 24).toFixed(1)}deg;--sway:${rnd(-70, 70).toFixed(0)}px;--op:${(.28 + depth * .3).toFixed(2)};--bl:${((1 - depth) * 2.2).toFixed(1)}px"></div>`);
      w.append(cardEl(order[i % order.length], { up: true, noanim: true, cw })); fc.append(w);
    }
    const sp = $('.sparks', bg), cols = ['#ffffff', '#f1ecdc', '#cfe6ff', '#ffffff', '#e8d9ff'];
    for (let i = 0; i < 24; i++) {
      const sz = rnd(7, 24), big = sz > 17;
      sp.append(el(`<span class="sp${big ? ' big' : ''}" style="left:${rnd(1, 99).toFixed(1)}%;top:${rnd(2, 98).toFixed(1)}%;--s:${sz.toFixed(0)}px;--d:${rnd(2.6, 7).toFixed(1)}s;--dl:${(-rnd(0, 7)).toFixed(1)}s;--c:${cols[i % cols.length]};--rt:${rnd(-35, 35).toFixed(0)}deg"><i></i></span>`));
    }
    return bg;
  }

  U.menuFx = menuFx;
  function fanIds() { const w = ['J08', 'J01', 'J09']; return w.filter(x => CARDS[x]); }
  function menu() {
    const s = $('#menu');
    s.innerHTML = `<div class="center">
      <div class="logo-fan"></div>
      <div class="logo"><small>Dimensões Infinitas</small><b data-t="Dimensions Stacks">Dimensions Stacks</b><i></i></div>
      <div class="menu-list">
        <button class="btn primary" data-go="setup">▶ Jogar contra bots</button>
        <button class="btn" data-go="online">🌐 Jogar online</button>
        <button class="btn" data-go="rules">📖 Como jogar</button>
        <button class="btn" data-go="coll">🃏 Coleção</button>
        <button class="btn" data-go="opts">⚙ Opções e sons</button>
      </div>
      <div class="foot">Atributos, perfis e especiais: dados oficiais v1.0 aprovados pelo autor (12/10/2026) · equilíbrio ainda sem testes rigorosos</div></div>`;
    s.prepend(menuFx());
    const fan = $('.logo-fan', s);
    fanIds().forEach((id, i) => { const c = cardEl(id, { up: true, noanim: true, cw: 108 }); c.style.setProperty('--r', (i - 1) * 9 + 'deg'); c.style.setProperty('--y', (i === 1 ? -10 : 4) + 'px'); fan.append(c); });
    s.onclick = e => { const b = e.target.closest('[data-go]'); if (!b) return; SND.init(); SND.play('click'); const g = b.dataset.go; if (g === 'setup') { rollBots(CFG.seats, CFG.n); setup(); U.show('setup'); } else if (g === 'online') U.online.open(); else if (g === 'rules') rules(); else if (g === 'coll') collection(); else if (g === 'opts') options(); };
  }

  // ---- configuração da partida
  const CFG = Object.assign({ n: 2, seats: [{ name: 'Você', bot: false }, { name: 'Bot Alfa', bot: true }, { name: 'Bot Beta', bot: true }, { name: 'Bot Gama', bot: true }], per: 12, diff: 'normal', sf: 2 }, store.get('cfg', {})); CFG.sf = 2; U.CFG = CFG;
  // 100 nomes aleatórios para os bots (sorteados sem repetir na mesa)
  const BOT_NAMES = ['Aldrin Vex','Brisa Tormenta','Cael Duskmoor','Dara Quill','Elric Nox','Fenna Ashgrove','Gorin Pedralta','Hana Zephyr','Ivo Brasa','Jessa Corvin','Kito Marlow','Lysa Rime','Maro Tavish','Nilo Ventura','Orla Fenwick','Pavel Strix','Quira Solen','Rurik Vale','Sabra Lumen','Tobias Wren','Ula Marén','Vesper Kade','Wilmer Dusk','Xara Pell','Yago Brandt','Zelda Moura','Anselmo Rocha','Bianca Nimbus','Caio Mirante','Dalila Orvalho','Eron Faísca','Fabrício Lamar','Gaia Trindade','Heitor Brumas','Iara Solstício','Jorge Calhau','Kira Vento','Leandro Éter','Maya Sombria','Nuno Ferrão','Olívia Cinza','Pietro Arco','Quintino Rio','Rafaela Prisma','Silas Orbe','Tânia Gelo','Ulisses Faro','Vânia Âmbar','Wagner Lótus','Ximena Brasil','Yuri Cometa','Zaíra Nuvem','Abel Quasar','Beca Lunar','Cosme Nebuloso','Duda Cintila','Elio Penumbra','Flora Astral','Gil Meteoro','Hera Zênite','Inácio Vórtice','Jade Eclipse','Kleber Nova','Lia Órbita','Mateus Plasma','Nara Aurora','Otto Pulsar','Pérola Abismo','Rômulo Fóton','Sara Galáxia','Tomé Cósmico','Úrsula Halo','Vicente Ônix','Wanda Brisa','Xavier Opala','Yara Safira','Zeca Turmalina','Alma Ciclone','Bento Granizo','Cíntia Relâmpago','Davi Trovão','Estela Névoa','Fausto Geada','Gisele Ressaca','Hugo Maré','Ísis Orvalho','Jonas Tempestade','Karina Bruma','Lucas Furacão','Mônica Brasa','Nando Rajada','Odete Cinzeiro','Plínio Vendaval','Quitéria Garoa','Ravi Alvorada','Sônia Poente','Túlio Crepúsculo','Vera Zéfiro','Wesley Aurora','Zuri Cintilante'];
  const isAutoName = n => /^Bot( |$)/.test(n || '') || BOT_NAMES.includes(n);
  function randBot(used) { const free = BOT_NAMES.filter(n => !used.includes(n)); const a = free.length ? free : BOT_NAMES; return a[Math.floor(Math.random() * a.length)]; }
  U.randBot = randBot;
  U.rerollBotNames = function (players) { const used = players.filter(p => !p.bot).map(p => p.name); players.forEach(p => { if (p.bot && isAutoName(p.name)) { p.name = randBot(used); used.push(p.name); } }); return players; };
  function rollBots(seats, n) { const used = seats.slice(0, n).filter(p => !(p.bot && isAutoName(p.name))).map(p => p.name); seats.slice(0, n).forEach(p => { if (p.bot && isAutoName(p.name)) { p.name = randBot(used); used.push(p.name); } }); }
  function setup() {
    const s = $('#setup');
    CFG.seats.forEach((p, i) => { if (i > 0 && !p.bot) { p.bot = true; p.name = 'Bot'; } });
    { const used = CFG.seats.slice(0, CFG.n).filter(p => !(p.bot && /^Bot( |$)/.test(p.name))).map(p => p.name); CFG.seats.slice(0, CFG.n).forEach(p => { if (p.bot && /^Bot( |$)/.test(p.name)) { p.name = randBot(used); used.push(p.name); } }); }
    const maxPer = Math.min(24, Math.floor(CARTAS.length / CFG.n));
    CFG.per = Math.max(7, Math.min(CFG.per, maxPer));
    const seats = CFG.seats.slice(0, CFG.n);
    s.innerHTML = `<div class="center"><div class="panel">
      <h2>Nova partida</h2>
      <div class="lbl">Jogadores</div>
      <div class="seg" data-k="n">${[2, 3, 4].map(n => `<button data-v="${n}" class="${CFG.n === n ? 'on' : ''}">${n}</button>`).join('')}</div>
      <div class="seats" style="margin-top:10px">${seats.map((p, i) => `<div class="seatcfg"><div class="avatar" style="--pc:${PCOL[i]}">${esc((p.name || '?')[0].toUpperCase())}</div>
        <input type="text" maxlength="14" value="${esc(p.name)}" data-i="${i}" aria-label="Nome do jogador ${i + 1}">
        ${i === 0 ? `<div class="seg" data-k="bot" data-i="0"><button data-v="0" class="${!p.bot ? 'on' : ''}">Jogar</button><button data-v="1" class="${p.bot ? 'on' : ''}">Assistir</button></div>` : '<span class="pill">🤖 Bot</span>'}</div>`).join('')}</div>
      <div class="lbl">Dificuldade dos bots</div>
      <div class="seg" data-k="diff">${[['facil', 'Fácil'], ['normal', 'Normal'], ['dificil', 'Difícil']].map(([v, t]) => `<button data-v="${v}" class="${CFG.diff === v ? 'on' : ''}">${t}</button>`).join('')}</div>
      <div class="lbl">Cartas por jogador: <b id="perv">${CFG.per}</b></div>
      <input type="range" min="7" max="${maxPer}" value="${CFG.per}" id="per" aria-label="Cartas por jogador">
      <div class="hint">7 formam o baralho ativo; o restante vai para a reserva. Mais cartas = partida mais longa.<br>Para jogar contra outras pessoas, cada uma no seu aparelho, use <b>Multiplayer</b> no Início.</div>
      <div class="row" style="margin-top:16px;justify-content:space-between"><button class="btn ghost" data-act="back">← Voltar</button><button class="btn primary" data-act="go">Começar ▶</button></div>
    </div></div>`;
    s.onclick = e => {
      const b = e.target.closest('button'); if (!b) return; SND.init(); SND.play('click');
      const seg = b.closest('.seg'); const pre = b.dataset.pre;
      if (pre) {
        if (pre === '1') { CFG.n = 2; CFG.seats[0] = { name: 'Você', bot: false }; CFG.seats[1] = { name: 'Bot', bot: true }; }
        else if (pre === '3') { CFG.n = 4; CFG.seats[0] = { name: 'Você', bot: false }; for (let i = 1; i < 4; i++) CFG.seats[i] = { name: 'Bot', bot: true }; }
        else { CFG.n = 3; for (let i = 0; i < 3; i++) CFG.seats[i] = { name: 'Bot', bot: true }; }
        store.set('cfg', CFG); return setup();
      }
      if (seg) {
        const k = seg.dataset.k, v = b.dataset.v;
        if (k === 'n') CFG.n = +v; else if (k === 'diff') CFG.diff = v; else if (k === 'sf') CFG.sf = +v;
        else if (k === 'bot') { const i = +seg.dataset.i; CFG.seats[i].bot = v === '1'; if (CFG.seats[i].bot && !isAutoName(CFG.seats[i].name)) CFG.seats[i].name = 'Bot'; if (!CFG.seats[i].bot && isAutoName(CFG.seats[i].name)) CFG.seats[i].name = 'Jogador ' + (i + 1); }
        store.set('cfg', CFG); return setup();
      }
      if (b.dataset.act === 'back') U.show('menu');
      if (b.dataset.act === 'go') {
        const players = CFG.seats.slice(0, CFG.n).map((p, i) => ({ name: (p.name || '').trim() || (p.bot ? randBot([]) : 'Jogador ' + (i + 1)), bot: !!p.bot, avatar: i }));
        store.set('cfg', CFG); U.startGame({ players, perPlayer: CFG.per, difficulty: CFG.diff, specialsFrom: CFG.sf === 1 ? 1 : 2 });
      }
    };
    s.oninput = e => {
      if (e.target.id === 'per') { CFG.per = +e.target.value; $('#perv', s).textContent = CFG.per; store.set('cfg', CFG); }
      else if (e.target.dataset.i != null && e.target.type === 'text') { CFG.seats[+e.target.dataset.i].name = e.target.value; const av = e.target.closest('.seatcfg').querySelector('.avatar'); av.textContent = (e.target.value[0] || '?').toUpperCase(); store.set('cfg', CFG); }
    };
  }

  U.profileName = () => (window.DSSTATS && window.DSSTATS.profile().name) || '';
  U.openSetup = function () { if (CFG.seats[0] && !CFG.seats[0].bot && (CFG.seats[0].name === 'Você' || !CFG.seats[0].name) && U.profileName()) CFG.seats[0].name = U.profileName(); rollBots(CFG.seats, CFG.n); setup(); U.show('setup'); };
  U.quick = function () {
    SND.init(); const me = U.profileName() || 'Você';
    const players = [{ name: me, bot: false, avatar: 0 }, { name: randBot([me]), bot: true, avatar: 1 }];
    U.startGame({ players, perPlayer: CFG.per, difficulty: CFG.diff, specialsFrom: CFG.sf === 1 ? 1 : 2 });
  };

  // ---- regras
  function rules() {
    const sp = Object.values(E.SPECIALS).filter(x => !x.stub);
    const n = el(`<div class="rules"><h2 style="color:var(--gold2)">Como jogar</h2>
      <h3>Objetivo</h3><p>Derrotar todos os adversários. Quem fica sem cartas (baralho e reserva) é eliminado.</p>
      <h3>Montagem</h3><p>Cada jogador recebe o mesmo número de cartas. <b>7 formam o baralho ativo</b>, na ordem que você escolher (a 1ª é jogada primeiro). O restante vira a <b>reserva</b>: quando seu baralho esvazia, você compra até 7 dela.</p>
      <h3>Disputa</h3><ol><li>Todos colocam a carta do topo <b>virada para baixo</b>.</li>
      <li>O <b>iniciador</b> (sorteado na 1ª; depois, em sentido horário) escolhe <i>qualquer</i> atributo: Ataque, Defesa, Inteligência ou Velocidade.</li>
      <li>Os demais escolhem, <b>em segredo</b>, um dos dois atributos do mesmo par: <b>Ataque / Defesa</b> ou <b>Inteligência / Velocidade</b>.</li>
      <li>As cartas são viradas. O <b>maior valor</b> no atributo escolhido vence.</li></ol>
      <h3>Ataque × Defesa</h3><ul><li><b>Ataque e Inteligência são ofensivos:</b> o vencedor leva as cartas dos perdedores para o fim do seu baralho.</li>
      <li><b>Defesa e Velocidade são defesa:</b> o vencedor só recupera a própria carta; as dos perdedores vão para o <b>Buraco Negro</b>, fora do jogo.</li></ul>
      <h3>Empates</h3><p>Maior valor do atributo → maior soma dos 4 atributos → maior Ataque + Inteligência. Se ainda empatar, ninguém vence e as cartas voltam aos donos.</p>
      <h3>Ataques especiais</h3><p>A partir da 2ª rodada, na hora de escolher o atributo você pode clicar em <b>Usar como ataque especial</b>: a carta da mesa sai do combate e fica fechada ao seu lado (até 2 por vez), e a próxima do baralho entra no lugar. Depois que as cartas são reveladas, cada jogador decide em segredo se <b>vira</b> um especial (no máximo 1 por disputa, mais um especial <i>companheiro</i> quando houver); os virados são revelados juntos, resolvem em sentido horário (proteções e cancelamentos primeiro) e depois vão ao Buraco Negro. Os especiais de <b>controle</b> (Atributo universal, Par ofensivo, Ataque obrigatório…) são virados <i>antes</i> de declarar os atributos. Os especiais mudam números, roubam, trocam, espiam, protegem, cancelam…</p>
      <h3>Rodadas</h3><p>Uma rodada termina quando todos os jogadores vivos já iniciaram uma disputa.</p>
      <details><summary>Regras provisórias adotadas (o GDD ainda não definiu)</summary><ul>${E.PROPOSTAS.map(p => `<li>${esc(p)}</li>`).join('')}</ul></details>
      <details><summary>Habilidades implementadas neste protótipo (${sp.length} de ${Object.keys(E.SPECIALS).length})</summary><ul>${sp.map(x => `<li><b>${esc(x.nome)}</b> <span class="hint">(${esc(x.id)})</span> — ${esc(x.texto)}</li>`).join('')}</ul></details>
    </div>`);
    SND.play('click'); U.modal(n, { cls: 'rulesbox' });
  }

  // ---- coleção
  function collection() {
    let filt = 'todas';
    const wrap = el(`<div><h2 style="color:var(--gold2);margin-bottom:8px">Coleção <span class="hint">(${CARTAS.length} cartas · ${Object.keys(IMG).length} com foto)</span></h2><div class="chips"></div><div class="cgrid"></div></div>`);
    const chips = $('.chips', wrap), grid = $('.cgrid', wrap);
    const keys = ['todas', ...Object.keys(SERIES), 'uniao'];
    function draw() {
      chips.innerHTML = keys.map(k => `<button data-k="${k}" class="${filt === k ? 'on' : ''}">${k === 'todas' ? 'Todas' : k === 'uniao' ? 'A União' : SERIES[k].marca}</button>`).join('');
      grid.replaceChildren(...CARTAS.filter(c => filt === 'todas' || (filt === 'uniao' ? c.uniao : c.serie === filt)).map(c => cardEl(c.id, { up: true, noanim: true, cw: 112, click: true })));
    }
    chips.onclick = e => { const b = e.target.closest('button'); if (!b) return; filt = b.dataset.k; SND.play('tick'); draw(); };
    draw(); SND.play('click'); U.modal(wrap);
  }

  // ---- opções
  function options() {
    const n = el(`<div><h2 style="color:var(--gold2);margin-bottom:6px">Opções</h2>
      <div class="optrow"><span>Volume geral</span><input type="range" min="0" max="1" step=".05" value="${S.master}" data-o="master"></div>
      <div class="optrow"><span>Efeitos</span><input type="range" min="0" max="1" step=".05" value="${S.sfx}" data-o="sfx"></div>
      <div class="optrow"><span>Música</span><input type="range" min="0" max="1" step=".05" value="${S.music}" data-o="music"></div>
      <div class="optrow"><span>Música ambiente</span><div class="seg" data-o="musicOn"><button data-v="1" class="${S.musicOn ? 'on' : ''}">Ligada</button><button data-v="0" class="${!S.musicOn ? 'on' : ''}">Desligada</button></div></div>
      <div class="optrow"><span>Dicas durante a partida</span><div class="seg" data-o="help"><button data-v="1" class="${S.help !== false ? 'on' : ''}">Ligadas</button><button data-v="0" class="${S.help === false ? 'on' : ''}">Desligadas</button></div></div>
      <div class="optrow"><span>Ver todas as dicas de novo</span><button class="btn sm" data-tipsreset>Reiniciar dicas</button></div>
      <div class="optrow"><span>Velocidade</span><div class="seg" data-o="speed">${[['lento', 'Lenta'], ['normal', 'Normal'], ['rapido', 'Rápida']].map(([v, t]) => `<button data-v="${v}" class="${S.speed === v ? 'on' : ''}">${t}</button>`).join('')}</div></div>
      <div class="optrow"><span>Faixa "PRÉVIA"</span><div class="seg" data-o="showTest"><button data-v="1" class="${S.showTest ? 'on' : ''}">Mostrar</button><button data-v="0" class="${!S.showTest ? 'on' : ''}">Ocultar</button></div></div>
      <div class="optrow"><span>Menos movimento</span><div class="seg" data-o="reduce"><button data-v="0" class="${!S.reduce ? 'on' : ''}">Não</button><button data-v="1" class="${S.reduce ? 'on' : ''}">Sim</button></div></div>
      <div class="lbl">Sons (sintetizados — substituíveis pelos seus arquivos)</div>
      <div class="slots">${Object.entries(SND.SLOTS).filter(([k]) => k !== 'menu').map(([k, t]) => `<div><button class="btn sm" data-snd="${k}" style="min-height:28px;padding:.2em .6em">▶</button><span><code>${k}</code> ${esc(t)}</span></div>`).join('')}</div>
      <p class="hint">Para usar sons seus, envie os arquivos pedindo "embutir sons": cada um entra no slot de mesmo nome e substitui o sintetizado.</p></div>`);
    n.addEventListener('input', e => { const o = e.target.dataset.o; if (!o) return; S[o] = +e.target.value; applyOpts(); });
    n.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return; SND.init();
      if (b.dataset.snd) return SND.play(b.dataset.snd);
      if (b.hasAttribute('data-tipsreset')) { U.tipsReset && U.tipsReset(); b.textContent = 'Pronto ✓'; return; }
      const seg = b.closest('.seg'); if (!seg) return; const o = seg.dataset.o, v = b.dataset.v;
      S[o] = (o === 'speed') ? v : v === '1'; applyOpts(); $$('button', seg).forEach(x => x.classList.toggle('on', x === b)); SND.play('click');
    });
    SND.play('click'); U.modal(n);
  }
  U.options = options; U.rules = rules; U.collection = collection;

  U.boot = function () {
    screens(); U.tabsInit(); applyOpts(); U.show('menu');
    const unlock = () => { SND.init(); window.removeEventListener('pointerdown', unlock); };
    window.addEventListener('pointerdown', unlock);
  };
  U.setupScreen = setup;
})();
