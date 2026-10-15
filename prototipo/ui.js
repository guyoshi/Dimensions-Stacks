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
  const S = Object.assign({ master: .8, sfx: 1, music: .35, musicOn: true, speed: 'normal', reduce: false }, store.get('opts', {}));
  U.S = S;
  Object.defineProperty(S, 'k', { enumerable: false, get() { return { lento: 1.5, normal: 1, rapido: .55 }[S.speed] || 1; } });
  function applyOpts() {
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
  U.pend = new Set(); U.graceUntil = 0;
  U.sleep = (ms, min) => { const r = U.run; return new Promise((res, rej) => {
    if (!min && ms * S.k < 450 && performance.now() < U.graceUntil) { r.dead ? rej('abort') : res(); return; }   // micro-pausas logo após um toque: não contam como um passo
    let t; const e = { minAt: performance.now() + (min || 0) * S.k, fin: () => { clearTimeout(t); U.pend.delete(e); r.dead ? rej('abort') : res(); } };
    t = setTimeout(e.fin, ms * S.k); U.pend.add(e); }); };
  // um toque pula UMA ação: encerra a espera e as animações em curso (e corta o som atrasado); o passo seguinte toca normalmente.
  // Passos com tempo mínimo (carta virada, resultado) só podem ser pulados depois desse tempo na tela.
  U.skip = () => {
    const now = performance.now(), due = [...U.pend].filter(e => now >= e.minAt);
    if (U.pend.size && !due.length) return;   // só há passos protegidos: o toque não faz nada
    U.graceUntil = now + 250; due.forEach(e => e.fin());
    try { document.getAnimations().forEach(a => { try { const t = a.effect && a.effect.getComputedTiming(); if (t && t.iterations !== Infinity && t.endTime !== Infinity) a.finish(); } catch (er) { } }); } catch (er) { }
    try { SND.cut && SND.cut(); } catch (er) { }
  };

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
  function statsHTML(base, st, attr, mark) {
    return AIDS.map(a => {
      const d = st[a] - base[a], ec = mark && mark.zero === a, sw = mark && mark.swap && mark.swap.includes(a);
      return `<div class="st${d > 0 ? ' mod' : d < 0 ? ' modn' : ''}${ec ? ' ecl' : ''}${sw ? ' swp' : ''}" data-a="${a}" title="${ATT[a].nome}">${ICON[a]}<b>${st[a]}</b></div>`;
    }).join('');
  }
  // brilhinhos dourados ao redor das cartas de A União (posições fixas por carta; o CSS os mostra só com a carta virada)
  // enquadramento vertical da arte (0 = topo da foto, 100 = base): cartas cujo personagem fica baixo na foto
  const FOCO = { V16: 100, V19: 100, D01: 100, D06: 65 };
  const SOBE = { D01: 3.4 };   // sobe a arte além do limite da foto (em em), o fundo fica sob o painel escuro
  function uniSparks(id, rainbow) {
    const r = DS_DATA.rng(DS_DATA.hash('uni' + id)), box = el('<div class="usp" aria-hidden="true"></div>');
    for (let i = 0; i < 26; i++) {
      const side = i % 4, p = r() * 100, o = -6 + r() * 12;   // ao longo da borda, um pouco para fora/dentro
      const x = side === 0 ? p : side === 2 ? p : side === 1 ? 100 - o : o, y = side === 1 || side === 3 ? p : side === 0 ? o : 100 - o;
      const hue = Math.round(r() * 360), s = el(`<i style="${rainbow ? '--sc:hsl(' + hue + ' 100% 72%);--sc2:hsl(' + hue + ' 100% 62%);' : ''}left:${x.toFixed(1)}%;top:${y.toFixed(1)}%;--s:${(.016 + r() * .022).toFixed(3)};--d:${(2.4 + r() * 3).toFixed(1)}s;--dl:${(-r() * 6).toFixed(1)}s;--dx:${((r() - .5) * 16).toFixed(0)}%;--dy:${(-8 - r() * 18).toFixed(0)}%"></i>`);
      box.append(s);
    }
    return box;
  }
  function cardEl(id, o) {
    o = o || {};
    if (typeof id === 'string' && id[0] === '?') {   // carta oculta (online): só o verso, sem nenhum dado da carta
      const h = el('<div class="card' + (o.noanim ? ' noanim' : '') + '" data-hidden="1" data-id="?"><div class="zm"><div class="flip"><div class="face back"><i class="seal"></i></div><div class="face front"></div></div></div></div>');
      if (o.cw) h.style.setProperty('--cw', o.cw + 'px'); return h;
    }
    const c = CARDS[id], s = SERIES[c.serie], st = o.stats || c.stats;
    const sp = E.SPECIALS[c.especial];
    const n = { comum: 1, rara: 2, epica: 3, lendaria: 4 }[c.raridade] || 1;
    const art = IMG[id] ? `<div class="art" style="--im:url('${IMG[id]}')"><img alt="${esc(c.nome)}" src="${IMG[id]}" loading="lazy" decoding="async" draggable="false"${FOCO[id] != null ? ' style="object-position:50% ' + FOCO[id] + '%' + (SOBE[id] ? ';transform:translateY(-' + SOBE[id] + 'em)' : '') + '"' : ''}></div>`
      : `<div class="ph">${SIL}<i>sem foto</i></div>`;
    const node = el(`<div class="card rar-${c.raridade}${o.up ? ' up' : ''}${o.noanim ? ' noanim' : ''}" data-id="${id}">
      <div class="zm"><div class="flip"><div class="face back"><i class="seal"></i></div>
      <div class="face front"><div class="in">${art}<div class="shade"></div>
        <div class="cband"><span class="ser">${esc(s.titulo || s.marca)}</span><span class="cno"><small>Nº</small>${esc(id.slice(1))}</span></div>
        ${c.uniao ? '<div class="uni" title="A União"></div>' : ''}
        <div class="bot"><div class="nome">${esc(c.nome)}</div><div class="espc">${esc(sp ? sp.nome : '—')}</div>
        <div class="stats">${statsHTML(c.stats, st, null, o.mark)}</div><div class="rar" title="${RARIDADES[c.raridade].nome}">${'<i>◆</i>'.repeat(n)}</div></div></div>
      </div></div></div></div>`);
    node.dataset.serie = c.serie; if (c.uniao) node.dataset.uni = '1';
    if (c.uniao || c.raridade === 'lendaria') { node.dataset.aura = c.uniao ? 'rainbow' : 'gold'; node.append(uniSparks(id, c.uniao)); } node.style.setProperty('--c', s.cor); node.style.setProperty('--c2', s.cor2); node.style.setProperty('--cd', s.escuro); node.style.setProperty('--t', s.texto);
    if (o.cw) node.style.setProperty('--cw', o.cw + 'px');
    if (o.attr) node.dataset.attr = o.attr;
    if (o.click) { node.classList.add('click'); node.addEventListener('click', () => { const g = node.closest('.cgrid'); U.zoom(id, g ? { list: [...g.querySelectorAll('.card[data-id]')].map(x => x.dataset.id), mastery: g.dataset.mast === '1' } : null); }); }
    return node;
  }
  function updateCard(node, stats, attr, mark) {
    const c = CARDS[node.dataset.id];
    const box = $('.stats', node); if (box) box.innerHTML = statsHTML(c.stats, stats, null, mark);
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

  // ---------------------------------------------------------------- emblemas de maestria (arte própria em SVG)
  // 1 Iniciado (bronze, 1 divisa) · 2 Veterano (prata, 2) · 3 Mestre (ouro, 3) · 4 Lenda (platina, estrela e asas) · 5 Dimensional (losango com órbita)
  const EMB = [null,
    { a: '#d99a66', b: '#6b3f22', ink: '#2b1608' }, { a: '#eef2f8', b: '#7b8594', ink: '#262c36' }, { a: '#ffe08a', b: '#a8741a', ink: '#3a2606' },
    { a: '#d6f7ff', b: '#2f9bc0', ink: '#06303f' }, { a: '#7fdcff', b: '#b394ff', ink: '#120a2e' }];
  let embN = 0;
  U.emblem = function (lv, size) {
    lv = Math.max(0, Math.min(5, lv | 0)); if (!lv) return ''; const c = EMB[lv], id = 'emb' + (++embN), sz = size || 24;
    const chev = n => Array.from({ length: n }, (_, i) => { const y = 25 + i * 6 - (n - 1) * 3; return `<path d="M15 ${y} L24 ${y - 6} L33 ${y}" fill="none" stroke="${c.ink}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`; }).join('');
    let inner;
    if (lv <= 3) inner = chev(lv);
    else if (lv === 4) inner = `<path d="M24 12 L26.9 19.6 L35 20 L28.7 25.2 L30.8 33 L24 28.6 L17.2 33 L19.3 25.2 L13 20 L21.1 19.6 Z" fill="${c.ink}"/><path d="M5 20 L1.5 14 L1.5 30 L5 29 Z M43 20 L46.5 14 L46.5 30 L43 29 Z" fill="${c.b}"/>`;
    else inner = `<ellipse cx="24" cy="24" rx="17" ry="6.5" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="1.4" transform="rotate(-24 24 24)"/><path d="M24 11 L33 24 L24 37 L15 24 Z" fill="${c.ink}"/><path d="M24 16 L29 24 L24 32 L19 24 Z" fill="url(#${id}g)"/><circle cx="38" cy="14" r="1.8" fill="#fff"/><circle cx="9" cy="34" r="1.3" fill="#fff"/>`;
    return `<svg class="emb e${lv}" viewBox="0 0 48 48" width="${sz}" height="${sz}" role="img" aria-label="Maestria: ${esc(window.DSSTATS ? window.DSSTATS.MAST_NOME[lv] : '')}"><defs><linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c.a}"/><stop offset="1" stop-color="${c.b}"/></linearGradient></defs>`
      + `<path d="M24 2.5 L43.5 13.5 L43.5 34.5 L24 45.5 L4.5 34.5 L4.5 13.5 Z" fill="url(#${id}g)" stroke="${c.ink}" stroke-opacity=".55" stroke-width="1.4"/>`
      + `<path d="M24 6.5 L40 15.5 L40 32.5 L24 41.5 L8 32.5 L8 15.5 Z" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1"/>${inner}</svg>`;
  };
  U.mastery = id => window.DSSTATS ? window.DSSTATS.mastery(id) : null;
  U.zoom = function (id, opts) {
    opts = opts || {};
    const list = opts.list && opts.list.length > 1 ? opts.list : null;
    let idx = list ? Math.max(0, list.indexOf(id)) : 0;
    const w = Math.min(280, window.innerWidth - 60);
    const stage = el('<div class="zoomstage"></div>');
    function build(cid) {
      const c = CARDS[cid], s = SERIES[c.serie], sp = E.SPECIALS[c.especial], cs = (opts.stats && opts.stats[cid]) || c.stats;
      const wrap = el(`<div class="zoomwrap"></div>`);
      wrap.append(cardEl(cid, { up: true, cw: w, stats: cs }));
      const max = 100;
      wrap.append(el(`<div class="meta">
        <h2>${esc(c.nome)}</h2>
        <div class="row"><span class="pill" style="background:${s.cor};color:${s.texto}">${esc(s.nome)}</span><span class="pill">${c.perfil ? 'Perfil: ' + esc(c.perfil) : RARIDADES[c.raridade].nome}</span>${c.uniao ? '<span class="pill">A União</span>' : ''}${c.provisorio ? '<span class="pill" style="background:#ff5a7a">proposta · não aprovada</span>' : ''}${IMG[cid] ? '' : '<span class="pill">sem foto</span>'}</div>
        <div class="spbox"><b>✦ ${esc(sp ? sp.nome : '—')}</b><br><span>${esc(sp ? sp.texto : '')}</span>${sp && sp.stub ? '<br><span class="hint">⚠ Efeito ainda não implementado neste protótipo.</span>' : ''}</div>
        <div class="stbars">${AIDS.map(a => `<div class="stbar" data-a="${a}">${ICON[a]}<i><s style="width:${Math.min(100, cs[a] / max * 100)}%"></s></i><b>${cs[a]}${cs[a] !== c.stats[a] ? ` <small class="hint">(base ${c.stats[a]})</small>` : ''}</b></div>`).join('')}</div>
        ${c.descricao ? `<p>${esc(c.descricao)}</p>` : ''}
        </div>`));
      if (opts.mastery && window.DSSTATS) {
        const m = window.DSSTATS.mastery(cid), pct = m.to ? Math.min(100, Math.round((m.xp - m.from) / (m.to - m.from) * 100)) : 100;
        wrap.querySelector('.meta').append(el(`<div class="mast"><div class="mh">${m.lv ? U.emblem(m.lv, 44) : '<span class="memp"></span>'}<div><b>${m.lv ? 'Maestria: ' + esc(m.nome) : 'Maestria: ainda sem emblema'}</b><small class="hint">${m.to ? `${m.xp}/${m.to} XP para ${esc(window.DSSTATS.MAST_NOME[m.lv + 1])}` : `${m.xp} XP · nível máximo`}</small></div></div><div class="bar"><i style="width:${pct}%"></i></div><small class="hint">${m.u} ${m.u === 1 ? 'uso' : 'usos'} · ${m.w} ${m.w === 1 ? 'disputa vencida' : 'disputas vencidas'} · ${m.s} ${m.s === 1 ? 'especial resolvido' : 'especiais resolvidos'}</small></div>`));
      }
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
    SND.setMode && SND.setMode(name === 'game' ? 'game' : 'menu');
  };
  function screens() {
    const app = $('#app');
    app.innerHTML = `<section id="menu" class="screen"></section><section id="setup" class="screen" hidden></section><section id="online" class="screen" hidden></section><section id="game" class="screen" hidden></section><div id="layer"></div>`;
  }


  // fundo da tela inicial: cartas flutuando (profundidades diferentes) e brilhos que crescem e somem
  // fundo da tela inicial: montado uma vez e reaproveitado; no celular, menos cartas e menos brilhos
  let MENU_BG = null;
  function menuFx() {
    if (MENU_BG) return MENU_BG;
    const rnd = (a, b) => a + Math.random() * (b - a);
    const lite = (window.matchMedia && window.matchMedia('(pointer: coarse), (max-width: 720px)').matches);
    const bg = el('<div class="menu-bg" aria-hidden="true"><div class="fcards"></div><div class="sparks"></div><div class="vig"></div></div>');
    const pool = Object.keys(CARDS); const withImg = pool.filter(id => IMG[id]); const ids = withImg.length >= 12 ? withImg : withImg.concat(pool.filter(id => !IMG[id]));
    const fc = $('.fcards', bg), N = lite ? 5 : 9;
    const order = ids.sort(() => Math.random() - .5);
    for (let i = 0; i < N; i++) {
      const depth = rnd(0, 1); const cw = Math.round(54 + depth * 78); const dur = rnd(46, 90) - depth * 22;
      const w = el(`<div class="fc" style="--x:${((i + rnd(.1, .9)) / N * 100).toFixed(1)}%;--cw:${cw}px;--dur:${dur.toFixed(1)}s;--delay:${(-rnd(0, dur)).toFixed(1)}s;--rot:${rnd(-24, 24).toFixed(1)}deg;--rot2:${rnd(-24, 24).toFixed(1)}deg;--sway:${rnd(-70, 70).toFixed(0)}px;--op:${(.28 + depth * .3).toFixed(2)};--bl:${((1 - depth) * 2.2).toFixed(1)}px"></div>`);
      w.append(cardEl(order[i % order.length], { up: true, noanim: true, cw })); fc.append(w);
    }
    const sp = $('.sparks', bg), cols = ['#ffffff', '#f1ecdc', '#cfe6ff', '#ffffff', '#e8d9ff'];
    for (let i = 0; i < (lite ? 20 : 64); i++) {
      const sz = rnd(3, 10), big = sz > 7.5;
      sp.append(el(`<span class="sp${big ? ' big' : ''}" style="left:${rnd(1, 99).toFixed(1)}%;top:${rnd(2, 98).toFixed(1)}%;--s:${sz.toFixed(0)}px;--d:${rnd(2.6, 7).toFixed(1)}s;--dl:${(-rnd(0, 7)).toFixed(1)}s;--c:${cols[i % cols.length]};--rt:${rnd(-35, 35).toFixed(0)}deg"><i></i></span>`));
    }
    MENU_BG = bg;
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
        <button class="btn primary" data-go="setup">▶ Jogar contra a CPU</button>
        <button class="btn" data-go="online">🌐 Jogar online</button>
        <button class="btn" data-go="rules">📖 Como jogar</button>
        <button class="btn" data-go="coll">🃏 Coleção</button>
        <button class="btn" data-go="opts">⚙ Opções e sons</button>
      </div>
    </div>`;
    s.prepend(menuFx());
    const fan = $('.logo-fan', s);
    fanIds().forEach((id, i) => { const c = cardEl(id, { up: true, noanim: true, cw: 108 }); c.style.setProperty('--r', (i - 1) * 9 + 'deg'); c.style.setProperty('--y', (i === 1 ? -10 : 4) + 'px'); fan.append(c); });
    s.onclick = e => { const b = e.target.closest('[data-go]'); if (!b) return; SND.init(); SND.play('click'); const g = b.dataset.go; if (g === 'setup') { rollBots(CFG.seats, CFG.n); setup(); U.show('setup'); } else if (g === 'online') U.online.open(); else if (g === 'rules') rules(); else if (g === 'coll') collection(); else if (g === 'opts') options(); };
  }

  // ---- configuração da partida
  const CFG = Object.assign({ n: 2, seats: [{ name: 'Você', bot: false }, { name: 'CPU Alfa', bot: true }, { name: 'CPU Beta', bot: true }, { name: 'CPU Gama', bot: true }], per: 14, diff: 'normal', sf: 2 }, store.get('cfg', {})); CFG.sf = 2; if (CFG.perV !== 2) { CFG.per = 14; CFG.perV = 2; }   // padrão 14 (7 no baralho + 7 na reserva); migra a config antiga U.CFG = CFG;
  // 100 nomes aleatórios para os bots (sorteados sem repetir na mesa)
  const BOT_NAMES = ['Aldrin Vex','Brisa Tormenta','Cael Duskmoor','Dara Quill','Elric Nox','Fenna Ashgrove','Gorin Pedralta','Hana Zephyr','Ivo Brasa','Jessa Corvin','Kito Marlow','Lysa Rime','Maro Tavish','Nilo Ventura','Orla Fenwick','Pavel Strix','Quira Solen','Rurik Vale','Sabra Lumen','Tobias Wren','Ula Marén','Vesper Kade','Wilmer Dusk','Xara Pell','Yago Brandt','Zelda Moura','Anselmo Rocha','Bianca Nimbus','Caio Mirante','Dalila Orvalho','Eron Faísca','Fabrício Lamar','Gaia Trindade','Heitor Brumas','Iara Solstício','Jorge Calhau','Kira Vento','Leandro Éter','Maya Sombria','Nuno Ferrão','Olívia Cinza','Pietro Arco','Quintino Rio','Rafaela Prisma','Silas Orbe','Tânia Gelo','Ulisses Faro','Vânia Âmbar','Wagner Lótus','Ximena Brasil','Yuri Cometa','Zaíra Nuvem','Abel Quasar','Beca Lunar','Cosme Nebuloso','Duda Cintila','Elio Penumbra','Flora Astral','Gil Meteoro','Hera Zênite','Inácio Vórtice','Jade Eclipse','Kleber Nova','Lia Órbita','Mateus Plasma','Nara Aurora','Otto Pulsar','Pérola Abismo','Rômulo Fóton','Sara Galáxia','Tomé Cósmico','Úrsula Halo','Vicente Ônix','Wanda Brisa','Xavier Opala','Yara Safira','Zeca Turmalina','Alma Ciclone','Bento Granizo','Cíntia Relâmpago','Davi Trovão','Estela Névoa','Fausto Geada','Gisele Ressaca','Hugo Maré','Ísis Orvalho','Jonas Tempestade','Karina Bruma','Lucas Furacão','Mônica Brasa','Nando Rajada','Odete Cinzeiro','Plínio Vendaval','Quitéria Garoa','Ravi Alvorada','Sônia Poente','Túlio Crepúsculo','Vera Zéfiro','Wesley Aurora','Zuri Cintilante'];
  const isAutoName = n => /^(Bot|CPU)( |$)/.test(n || '') || BOT_NAMES.includes(n);
  function randBot(used) { const free = BOT_NAMES.filter(n => !used.includes(n)); const a = free.length ? free : BOT_NAMES; return a[Math.floor(Math.random() * a.length)]; }
  U.randBot = randBot;
  U.rerollBotNames = function (players) { const used = players.filter(p => !p.bot).map(p => p.name); players.forEach(p => { if (p.bot && isAutoName(p.name)) { p.name = randBot(used); used.push(p.name); } }); return players; };
  function rollBots(seats, n) { const used = seats.slice(0, n).filter(p => !(p.bot && isAutoName(p.name))).map(p => p.name); seats.slice(0, n).forEach(p => { if (p.bot && isAutoName(p.name)) { p.name = randBot(used); used.push(p.name); } }); }
  const seatDiff = p => (p && p.diff) || 'normal';   // dificuldade individual de cada bot
  const LS = { sel: null, swap: false, pop: null };   // estado da tela (seleção, modo trocar)
  function setup() {
    const s = $('#setup');
    CFG.seats.forEach((p, i) => { if (i > 0 && !p.bot) { p.bot = true; p.name = 'CPU'; } });
    if (CFG.seats[0] && !CFG.seats[0].bot) CFG.seats[0].name = U.profileName() || 'Você';   // o nome só se edita no Perfil
    if (CFG.mode !== 'duo') CFG.mode = 'ffa';
    const duo = CFG.mode === 'duo', N = duo ? 4 : CFG.n;
    { const used = CFG.seats.slice(0, N).filter(p => !(p.bot && /^(Bot|CPU)( |$)/.test(p.name))).map(p => p.name); CFG.seats.slice(0, N).forEach(p => { if (p.bot && /^(Bot|CPU)( |$)/.test(p.name)) { p.name = randBot(used); used.push(p.name); } }); }   // só dá nome a quem ainda não tem (nunca re-sorteia a cada toque)
    const maxPer = Math.min(24, Math.floor(CARTAS.length / N));
    CFG.per = Math.max(7, Math.min(CFG.per, maxPer));
    if (LS.sel == null || LS.sel >= N) { const k = CFG.seats.slice(0, N).findIndex(p => p.bot); LS.swap = false; LS.sel = k < 0 ? 0 : k; }
    const me = U.profileName();
    const m = {
      role: 'local', title: 'Nova partida', mode: CFG.mode, N, hum: 1, per: CFG.per, ev: CFG.ev !== 0, sel: LS.sel, swap: LS.swap, pop: LS.pop, watchable: true,
      seats: CFG.seats.slice(0, N).map((p, i) => ({ name: p.name, cpu: !!p.bot, diff: seatDiff(p), me: i === 0 && !p.bot, tag: i === 0 && !p.bot && me ? me : '', fixed: i === 0 })),
    };
    LS.pop = null;
    const save = () => { store.set('cfg', CFG); setup(); };
    U.lobby.mount(s, m, (a, v) => {
      if (a === 'back') { LS.sel = null; return U.show('menu'); }
      if (a === 'mode') { CFG.mode = v; LS.sel = null; LS.pop = [0, 1, 2, 3]; return save(); }
      if (a === 'n') { CFG.n = v; LS.sel = null; return save(); }
      if (a === 'per') { CFG.per = Math.max(7, Math.min(maxPer, CFG.per + v)); return save(); }
      if (a === 'ev') { CFG.ev = CFG.ev === 0 ? 1 : 0; return save(); }
      if (a === 'seat') { LS.sel = v; return save(); }
      if (a === 'move') { const [x, y] = v; if (x === 0 || y === 0) return; const S = CFG.seats; [S[x], S[y]] = [S[y], S[x]]; LS.pop = [x, y]; LS.swap = false; LS.sel = y; return save(); }
      if (a === 'shuffle') { const r = CFG.seats.slice(1, 4); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } CFG.seats.splice(1, 3, ...r); LS.pop = [1, 2, 3]; LS.swap = false; return save(); }
      if (a === 'dice') { const used = CFG.seats.slice(0, N).map(p => p.name); CFG.seats[LS.sel].name = randBot(used); CFG.seats[LS.sel].bot = true; return save(); }
      if (a === 'diff') { CFG.seats[LS.sel].diff = v; return save(); }
      if (a === 'watch') { const p = CFG.seats[0]; p.bot = v; p.name = v ? randBot(CFG.seats.slice(1, N).map(x => x.name)) : (U.profileName() || 'Você'); return save(); }
      if (a === 'start') {
        const players = CFG.seats.slice(0, N).map((p, i) => ({ name: (p.name || '').trim() || (p.bot ? randBot([]) : 'Jogador ' + (i + 1)), bot: !!p.bot, avatar: i, diff: p.bot ? seatDiff(p) : undefined }));
        store.set('cfg', CFG); LS.sel = null;
        U.startGame({ players, perPlayer: CFG.per, difficulty: CFG.diff, specialsFrom: CFG.sf === 1 ? 1 : 2, events: CFG.ev !== 0, teams: duo ? [[0, 2], [1, 3]] : null });
      }
    });
  }

  U.profileName = () => (window.DSSTATS && window.DSSTATS.profile().name) || '';
  U.openSetup = function () { LS.sel = null; LS.swap = false; if (CFG.seats[0] && !CFG.seats[0].bot && (CFG.seats[0].name === 'Você' || !CFG.seats[0].name) && U.profileName()) CFG.seats[0].name = U.profileName(); rollBots(CFG.seats, CFG.n); setup(); U.show('setup'); };
  U.quick = function () {
    SND.init(); const me = U.profileName() || 'Você';
    const players = [{ name: me, bot: false, avatar: 0 }, { name: randBot([me]), bot: true, avatar: 1, diff: CFG.diff || 'normal' }];
    U.startGame({ players, perPlayer: CFG.per, difficulty: CFG.diff, specialsFrom: CFG.sf === 1 ? 1 : 2, events: CFG.ev !== 0 });
  };

  // ---- regras
  function rules() {
    const sp = Object.values(E.SPECIALS).filter(x => !x.stub);
    const n = el(`<div class="rules"><h2 style="color:var(--gold2)">Como jogar</h2>
      <h3>Objetivo</h3><p>Derrotar todos os adversários. Quem fica sem cartas (baralho e reserva) é eliminado.</p>
      <h3>Montagem</h3><p>Cada jogador recebe o mesmo número de cartas. <b>7 formam o baralho ativo</b>, na ordem que você escolher (a 1ª é jogada primeiro). O restante vira a <b>reserva</b>: quando seu baralho esvazia, você compra até 7 dela.</p>
      <h3>Disputa</h3><ol><li>Todos colocam a carta do topo <b>virada para baixo</b>.</li>
      <li>O <b>iniciador</b> (sorteado na 1ª; depois, em sentido horário) escolhe <i>qualquer</i> atributo: Força, Resistência, Inteligência ou Velocidade.</li>
      <li>Os demais escolhem, <b>em segredo</b>, um dos dois atributos do mesmo par: <b>Força / Resistência</b> ou <b>Inteligência / Velocidade</b>.</li>
      <li>As cartas são viradas. O <b>maior valor</b> no atributo escolhido vence.</li></ol>
      <h3>Ofensivos × Defensivos</h3><ul><li><b>Força e Inteligência são ofensivos:</b> o vencedor leva as cartas dos perdedores para o fim do seu baralho.</li>
      <li><b>Resistência e Velocidade são defensivos:</b> o vencedor só recupera a própria carta; as dos perdedores vão para o <b>Buraco Negro</b>, fora do jogo.</li></ul>
      <h3>Raridade (losangos)</h3><p>Os losangos no pé da carta mostram a raridade: <b>◆ Comum</b> (fosca), <b>◆◆ Rara</b> (borda prateada), <b>◆◆◆ Épica</b> (borda dourada com reflexo holográfico) e <b>◆◆◆◆ Lendária</b> (moldura dourada ornamentada, losangos dourados). A raridade segue o poder real da carta (soma dos atributos mais o maior atributo, que pesa muito). As cartas da <b>União</b> são únicas e fogem da regra: aura e moldura arco-íris. Ao virar uma Lendária ou da União, a mesa recebe um clarão e um som próprio.</p>
      <h3>Empates</h3><p>Maior valor do atributo → maior soma dos 4 atributos → maior Força + Inteligência. Se ainda empatar, ninguém vence e as cartas voltam aos donos.</p>
      <h3>Habilidades especiais</h3><p>A partir da 2ª rodada, na hora de escolher o atributo você pode clicar em <b>Usar como especial</b>: a carta da mesa sai do combate e fica fechada ao seu lado (até 2 por vez), e a próxima do baralho entra no lugar. Depois que as cartas são reveladas, cada jogador decide em segredo se <b>vira</b> um especial (no máximo 1 por disputa, mais um especial <i>companheiro</i> quando houver); os virados são revelados juntos, resolvem em sentido horário (proteções e cancelamentos primeiro) e depois vão ao Buraco Negro. Os especiais de <b>controle</b> (Atributo universal, Par ofensivo, Ataque obrigatório…) são virados <i>antes</i> de declarar os atributos. Os especiais <b>reativos</b> (anular, copiar, apropriar, proteger) só abrem depois que algum rival virou um especial: quem os tem decide sabendo o que foi virado. Os especiais mudam números, roubam, trocam, espiam, protegem, cancelam…</p>
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
      chips.innerHTML = keys.map(k => `<button data-k="${k}" class="${filt === k ? 'on' : ''}">${k === 'todas' ? 'Todas' : k === 'uniao' ? 'A União' : SERIES[k].nome}</button>`).join('');
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
      <div class="optrow"><span>Menos movimento</span><div class="seg" data-o="reduce"><button data-v="0" class="${!S.reduce ? 'on' : ''}">Não</button><button data-v="1" class="${S.reduce ? 'on' : ''}">Sim</button></div></div></div>`);
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
    const PRESS = 'button,[data-act],[data-go],[data-tab],[data-top],.playbig,.daily';
    const prs = e => { const b = e.target.closest && e.target.closest(PRESS); if (!b || b.disabled || b.matches('input')) return; b.classList.add('pressing'); const rel = () => { b.classList.remove('pressing'); ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => b.removeEventListener(t, rel)); }; ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => b.addEventListener(t, rel)); };
    window.addEventListener('pointerdown', prs, true);
    // toque na mesa durante as animações da partida (sem decisão ou janela aberta): pula o passo, para o jogador com pressa
    window.addEventListener('pointerdown', e => {
      const g = document.getElementById('game'); if (!g || g.hidden || !U.run || U.run.dead) return;
      if (e.target.closest && e.target.closest('button,a,input,#dock,.modal,.order,.cover,.coach,.evbox,.sheet')) return;
      const dock = document.getElementById('dock'); if (dock && !dock.hidden) return;
      if (document.querySelector('.modal, .order, .cover, .coach')) return;
      U.skip();
      // o toque que pula não deve também abrir o que estiver embaixo (Buraco Negro, baralhos...): engole o click desse mesmo toque
      const eat = ev => { ev.stopPropagation(); ev.preventDefault(); window.removeEventListener('click', eat, true); };
      window.addEventListener('click', eat, true); setTimeout(() => window.removeEventListener('click', eat, true), 450);
    }, true);
    window.addEventListener('click', e => { const b = e.target.closest && e.target.closest(PRESS); if (!b || b.disabled) return; b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); setTimeout(() => b.classList.remove('pop'), 340); try { if (!S.reduce && navigator.vibrate) navigator.vibrate(8); } catch (er) { } }, true);
    // o navegador só libera o áudio após um gesto válido: no toque, é o pointerup/touchend/click (pointerdown não vale); tenta em todos até o áudio estar rodando
    const EVS = ['pointerup', 'touchend', 'click', 'keydown'];
    const unlock = () => { SND.init(); if (SND.ctx && SND.ctx.state === 'running') EVS.forEach(ev => window.removeEventListener(ev, unlock, true)); else if (SND.ctx) SND.ctx.resume().then(() => { if (SND.ctx.state === 'running') EVS.forEach(ev => window.removeEventListener(ev, unlock, true)); }).catch(() => { }); };
    EVS.forEach(ev => window.addEventListener(ev, unlock, true));
  };
  U.setupScreen = setup;
})();
