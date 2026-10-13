/* Dimensions Stacks — identidade "Nexo Dimensional": logotipo, tela inicial, barra inferior e abas (Coleção, Desafios, Perfil). */
(function () {
  'use strict';
  const U = window.DSUI, ST = window.DSSTATS;
  const { $, $$, el, esc, CARDS, SERIES, IMG, SND, cardEl } = U;
  const CARTAS = U.D.CARTAS;

  // ---------------------------------------------------------------- logotipo: cartas sobrepostas dentro de um portal
  let lid = 0;
  U.logoMark = function (size, still) {
    const i = ++lid;
    return `<svg class="mark${still ? ' still' : ''}" viewBox="0 0 120 120" width="${size}" height="${size}" role="img" aria-label="Dimensions Stacks">
      <defs>
        <linearGradient id="lr${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7fdcff"/><stop offset=".5" stop-color="#b394ff"/><stop offset="1" stop-color="#7fdcff"/></linearGradient>
        <radialGradient id="lg${i}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#7fdcff" stop-opacity=".32"/><stop offset=".6" stop-color="#b394ff" stop-opacity=".12"/><stop offset="1" stop-color="#b394ff" stop-opacity="0"/></radialGradient>
        <linearGradient id="lm${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6f1e2"/><stop offset="1" stop-color="#8b8576"/></linearGradient>
      </defs>
      <circle cx="60" cy="60" r="56" fill="url(#lg${i})"/>
      <g class="ring"><circle cx="60" cy="60" r="54" fill="none" stroke="url(#lr${i})" stroke-width="3" stroke-linecap="round" stroke-dasharray="250 90"/></g>
      <g class="ring2"><circle cx="60" cy="60" r="47" fill="none" stroke="#f6f1e2" stroke-opacity=".5" stroke-width="1" stroke-dasharray="1.5 7" stroke-linecap="round"/></g>
      <image href="selo.png" x="30.5" y="22" width="59" height="76" preserveAspectRatio="xMidYMid meet"/></svg>`;
  };
  const wordmark = () => `<b class="wm" data-t="Dimensions Stacks">Dimensions Stacks</b>`;

  // ---------------------------------------------------------------- ícones da barra inferior
  const NAVI = {
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"><path d="M3.5 11.2 12 4l8.5 7.2V20a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z"/></svg>',
    coll: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"><path d="M12 3 3 7.5 12 12l9-4.5z"/><path d="m3 12 9 4.5 9-4.5"/><path d="m3 16.5 9 4.5 9-4.5"/></svg>',
    chal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"><path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H4.5v1.5A3.5 3.5 0 0 0 8 11M16 6h3.5v1.5A3.5 3.5 0 0 1 16 11"/><path d="M12 13v4M8.5 20h7M10 17h4"/></svg>',
    prof: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"><circle cx="12" cy="8.5" r="3.6"/><path d="M4.5 20.5c.6-4 3.6-6 7.5-6s6.9 2 7.5 6"/></svg>',
  };
  const ICO = {
    swords: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l9 9M4 4v4l1.5 1.5M4 4h4"/><path d="M20 4l-9 9M20 4v4l-1.5 1.5M20 4h-4"/><path d="M8.5 14.5 6 17M15.5 14.5 18 17M5 18l2 2M19 18l-2 2"/></svg>',
    bot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="8" width="16" height="11" rx="3"/><path d="M12 8V5M9.5 13.5v.01M14.5 13.5v.01M9 16.5h6"/><circle cx="12" cy="4" r="1"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8.5" r="3.2"/><path d="M3 19c.5-3.4 3-5 6-5s5.5 1.6 6 5"/><circle cx="17" cy="9.5" r="2.5"/><path d="M16.5 14.2c2.6-.1 4.2 1.3 4.5 4.3"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
    help: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.3A2.6 2.6 0 0 1 12 7.5c1.5 0 2.6 1 2.6 2.3 0 1.8-2.6 2-2.6 3.9M12 17v.01"/></svg>',
    medal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="14" r="5.5"/><path d="m8.5 3.5 3.5 6 3.5-6M12 11.5l1 2 2.2.3-1.6 1.5.4 2.2-2-1.1-2 1.1.4-2.2-1.6-1.5 2.2-.3z"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
    flame: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c1 3.5 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>',
    starO: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>',
  };
  U.ICO = ICO;

  // ---------------------------------------------------------------- estrutura: seções e barra inferior
  const TABS = [['menu', 'Início'], ['coll', 'Coleção'], ['chal', 'Desafios'], ['prof', 'Perfil']];
  U.tabsInit = function () {
    const app = $('#app');
    ['coll', 'chal', 'prof'].forEach(id => { if (!$('#' + id)) { const s = el(`<section id="${id}" class="screen tab" hidden></section>`); app.insertBefore(s, $('#layer')); } });
    $('#menu').classList.add('tab');
    if (!$('#nav')) app.appendChild(el(`<nav id="nav" hidden aria-label="Navegação principal">${TABS.map(([k, t]) => `<button data-tab="${k}" aria-label="${t}">${NAVI[k]}<span>${t}</span></button>`).join('')}</nav>`));
    $('#nav').onclick = e => { const b = e.target.closest('[data-tab]'); if (!b) return; SND.init(); SND.play('click'); U.show(b.dataset.tab); };
  };
  const render = { menu: () => home(), coll: () => collTab(), chal: () => chalTab(), prof: () => profTab() };
  U.afterShow = function (name) {
    const nav = $('#nav'); if (!nav) return;
    const tab = name in render; nav.hidden = !tab;
    $$('button', nav).forEach(b => b.classList.toggle('on', b.dataset.tab === name));
    $('#app').classList.toggle('hasnav', tab);
    if (tab) { render[name](); const s = $('#' + name); if (s) s.scrollTop = 0; }
  };

  function topbar(title, sub) {
    return `<header class="topbar"><div class="tb-l">${U.logoMark(30, true)}<div class="tb-t"><b>${esc(title || 'Dimensions Stacks')}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</div></div>
      <div class="tb-r"><button class="ibtn" data-top="rules" aria-label="Como jogar">${ICO.help}</button><button class="ibtn" data-top="opts" aria-label="Opções e sons">${ICO.gear}</button></div></header>`;
  }
  function bindTop(s) { $$('[data-top]', s).forEach(b => { b.onclick = () => { SND.init(); SND.play('click'); if (b.dataset.top === 'rules') U.rules(); else U.options(); }; }); }

  // ---------------------------------------------------------------- início
  function home() {
    const s = $('#menu'); const d = ST.dailyToday(); const p = ST.profile();
    s.innerHTML = `<div class="tabwrap home">
      ${topbar()}
      <section class="brand"><div class="brandmark">${U.logoMark(112)}</div>${`<div class="wmbox"><small>Dimensões Infinitas</small>${wordmark()}</div>`}</section>
      <section class="hero"><div class="eyebrow">O Nexo está aberto</div><h1>Cada dimensão tem seus campeões.</h1>
        <p>${CARTAS.length} cartas. Um universo. Infinitas possibilidades de confronto.</p>
        ${p.t.g ? `<div class="tagrow"><span class="tag soft">${p.t.w} vitória${p.t.w === 1 ? '' : 's'} · ${p.t.g} partida${p.t.g === 1 ? '' : 's'}</span></div>` : ''}</section>
      <button class="playbig" data-go="quick"><span class="pi">${ICO.swords}</span><span class="pt"><b>Jogar</b><small>Partida rápida contra um bot</small></span><span class="pa">${ICO.arrow}</span></button>
      <div class="tiles">
        <button class="tile" data-go="setup"><span class="ti">${ICO.bot}</span><b>Contra bots</b><small>Treinar e competir</small></button>
        <button class="tile" data-go="online"><span class="ti">${ICO.users}</span><b>Multiplayer</b><small>Criar ou entrar na sala</small></button>
      </div>
      <button class="daily" data-tab="chal"><span class="dl"><small>Desafio do dia${d.streak > 1 ? ` · ${d.streak} dias seguidos` : ''}</small><b>${d.done ? 'Concluído' : 'Desafio do dia'}</b><span>${esc(d.texto)}</span></span><span class="dc ${d.done ? 'ok' : ''}">${d.done ? '✓' : ICO.chev}</span></button>
    </div>`;
    bindTop(s); fxInto(s);
    s.onclick = e => {
      const b = e.target.closest('[data-go],[data-tab]'); if (!b) return; SND.init(); SND.play('click');
      if (b.dataset.tab) return U.show(b.dataset.tab);
      const g = b.dataset.go; if (g === 'quick') U.quick(); else if (g === 'setup') U.openSetup(); else if (g === 'online') U.online.open();
    };
  }
  function fxInto(s) { const old = $('.menu-bg', s); if (old) old.remove(); s.prepend(U.menuFx()); }

  // ---------------------------------------------------------------- coleção (aba)
  const filtState = { k: 'todas', q: '', sort: 'num', att: '' };
  const norm = t => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const sumOf = c => c.stats.pod + c.stats.def + c.stats.int + c.stats.vel;
  const SORTS = [['num', 'Ordem padrão'], ['soma', 'Força total'], ['pod', 'Ataque'], ['def', 'Defesa'], ['int', 'Inteligência'], ['vel', 'Velocidade'], ['nome', 'Nome (A–Z)'], ['esp', 'Especial (A–Z)'], ['mast', 'Maestria']];
  const spOf = c => (U.E.SPECIALS[c.especial] || {});
  const hay = c => norm([c.nome, c.id, SERIES[c.serie].nome, SERIES[c.serie].marca, c.descricao, spOf(c).nome, spOf(c).texto, c.raridade, c.uniao ? 'uniao' : ''].join(' '));
  const topAtt = c => U.AIDS.slice().sort((a, b) => c.stats[b] - c.stats[a])[0];
  U.collFilter = function (list, st, fav) {   // exposto para teste
    const q = norm(st.q).split(/\s+/).filter(Boolean);
    let r = list.filter(c => (st.k === 'todas' || (st.k === 'fav' ? fav.has(c.id) : st.k === 'uniao' ? c.uniao : c.serie === st.k)) && (!st.att || topAtt(c) === st.att) && q.every(t => hay(c).includes(t)));
    const by = { soma: (a, b) => sumOf(b) - sumOf(a), nome: (a, b) => a.nome.localeCompare(b.nome, 'pt'), esp: (a, b) => (spOf(a).nome || '').localeCompare(spOf(b).nome || '', 'pt') };
    by.mast = (a, b) => { const x = U.mastery(a.id), y = U.mastery(b.id); return ((y && y.xp) || 0) - ((x && x.xp) || 0); };
    U.AIDS.forEach(a => { by[a] = (x, y) => y.stats[a] - x.stats[a] || sumOf(y) - sumOf(x); });
    if (st.sort !== 'num' && by[st.sort]) r = r.slice().sort(by[st.sort]);
    return r;
  };
  function collTab() {
    const s = $('#coll'); const fav = new Set(ST.profile().fav);
    const keys = ['todas', 'fav', ...Object.keys(SERIES), 'uniao'];
    const label = k => k === 'todas' ? 'Todas' : k === 'fav' ? '★ Favoritas' : k === 'uniao' ? 'A União' : SERIES[k].marca;
    s.innerHTML = `<div class="tabwrap">${topbar('Coleção', `${CARTAS.length} cartas · ${Object.keys(IMG).length} com foto`)}
      <div class="cfilter"><input id="cq" type="search" placeholder="Nome, série ou especial…" aria-label="Buscar cartas" autocomplete="off" value="${esc(filtState.q)}">
        <select id="csort" aria-label="Ordenar">${SORTS.map(([v, t]) => `<option value="${v}"${filtState.sort === v ? ' selected' : ''}>${v === 'num' ? t : 'Ordenar: ' + t}</option>`).join('')}</select></div>
      <div class="chips" id="cchips"></div><div class="chips" id="cattr" aria-label="Atributo mais forte"></div><p class="hint" id="ccount"></p><div class="cgrid" id="cgrid" data-mast="1"></div></div>`;
    bindTop(s);
    const chips = $('#cchips', s), grid = $('#cgrid', s), attr = $('#cattr', s), cnt = $('#ccount', s);
    function draw() {
      chips.innerHTML = keys.map(k => `<button data-k="${k}" class="${filtState.k === k ? 'on' : ''}"${SERIES[k] ? ` style="--sc:${SERIES[k].cor}"` : ''}>${SERIES[k] ? '<i class="sdot"></i>' : ''}${esc(label(k))}</button>`).join('');
      attr.innerHTML = '<span class="hint">Maior atributo:</span>' + [['', 'Qualquer'], ...U.AIDS.map(a => [a, U.ATT[a].nome])].map(([a, t]) => `<button data-a="${a}" class="${filtState.att === a ? 'on' : ''}">${esc(t)}</button>`).join('');
      const list = U.collFilter(CARTAS, filtState, fav);
      { const mc = ST.masteryCount(1); cnt.textContent = (list.length === CARTAS.length ? '' : `${list.length} de ${CARTAS.length} cartas`) + (mc ? `${list.length === CARTAS.length ? '' : ' · '}${mc} ${mc === 1 ? 'carta com emblema' : 'cartas com emblema'} de maestria` : ''); }
      grid.replaceChildren(...(list.length ? list.map(c => { const n = cardEl(c.id, { up: true, noanim: true, cw: 104, click: true }); if (fav.has(c.id)) n.classList.add('isfav'); const m = U.mastery(c.id); if (m && m.lv) { n.append(el(`<span class="memb" title="Maestria: ${esc(m.nome)} (${m.xp} XP)">${U.emblem(m.lv, 26)}</span>`)); } return n; }) : [el(`<p class="hint" style="grid-column:1/-1">${filtState.k === 'fav' && !filtState.q && !filtState.att ? 'Nenhuma carta favorita ainda. Abra uma carta e toque em ☆ para favoritar.' : 'Nenhuma carta encontrada com esses filtros.'}</p>`)]));
    }
    chips.onclick = e => { const b = e.target.closest('button'); if (!b) return; filtState.k = b.dataset.k; SND.play('tick'); draw(); };
    attr.onclick = e => { const b = e.target.closest('button'); if (!b) return; filtState.att = b.dataset.a; SND.play('tick'); draw(); };
    let t = 0; $('#cq', s).oninput = e => { filtState.q = e.target.value; clearTimeout(t); t = setTimeout(draw, 120); };
    $('#csort', s).onchange = e => { filtState.sort = e.target.value; SND.play('tick'); draw(); };
    draw();
  }

  // ---------------------------------------------------------------- desafios (aba)
  function chalTab() {
    const s = $('#chal'); const d = ST.dailyToday(); const wk = ST.weekly(); ST.save();
    s.innerHTML = `<div class="tabwrap">${topbar('Desafios', 'Renovam todo dia e toda semana')}
      <section class="card-d big ${d.done ? 'done' : ''}"><div class="cd-h"><span class="pill">Desafio do dia</span>${d.streak ? `<span class="streak">${ICO.flame}${d.streak} ${d.streak === 1 ? 'dia' : 'dias seguidos'}</span>` : ''}</div>
        <h2>${esc(d.texto)}</h2><div class="cd-f">${d.done ? '<span class="okpill">✓ Concluído hoje</span>' : '<span class="hint">Vale em partidas contra bots ou online. Volta amanhã com um novo.</span>'}</div>
        ${d.done ? '' : '<div class="row"><button class="btn primary" data-go="quick">Jogar agora</button></div>'}</section>
      <h3 class="sec">Missões da semana</h3>
      <div class="missions">${wk.map(w => `<div class="mission ${w.val >= w.meta ? 'done' : ''}"><div class="mt"><b>${esc(w.texto)}</b><span>${w.val}/${w.meta}</span></div><div class="bar"><i style="width:${w.val / w.meta * 100}%"></i></div></div>`).join('')}</div>
      <h3 class="sec">Conquistas</h3><div class="hint">${ST.achievements().filter(a => a.done).length} de ${ST.ACH.length} desbloqueadas. Veja todas no seu Perfil.</div>
      <div class="row"><button class="btn" data-tab="prof">Ver conquistas</button></div></div>`;
    bindTop(s);
    s.onclick = e => { const b = e.target.closest('[data-go],[data-tab]'); if (!b) return; SND.init(); SND.play('click'); if (b.dataset.tab) return U.show(b.dataset.tab); if (b.dataset.go === 'quick') U.quick(); };
  }

  // ---------------------------------------------------------------- perfil (aba)
  function avatarHTML(a, name, size) {
    const init = esc((name || '?')[0].toUpperCase());
    if (a && a.t === 'card' && IMG[a.id]) return `<span class="av" style="--s:${size}px"><img alt="" src="${IMG[a.id]}"></span>`;
    const col = a && a.t === 'serie' && SERIES[a.k] ? SERIES[a.k].cor : null;
    return `<span class="av ini" style="--s:${size}px${col ? `;--ac:${col}` : ''}">${init}</span>`;
  }
  U.avatarHTML = avatarHTML;
  function fmtDur(sec) { sec = Math.round(sec); const m = Math.floor(sec / 60); return m ? m + ' min ' + String(sec % 60).padStart(2, '0') + ' s' : sec + ' s'; }
  function profTab() {
    const s = $('#prof'); const p = ST.profile(), t = p.t; const ach = ST.achievements();
    const pct = t.g ? Math.round(t.w / t.g * 100) : 0;
    const since = new Date(p.since).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    const stat = (v, l) => `<div class="stat"><b>${v}</b><small>${l}</small></div>`;
    s.innerHTML = `<div class="tabwrap">${topbar('Perfil')}
      <section class="pf-head"><button class="pf-av" id="pfAv" aria-label="Trocar avatar">${avatarHTML(p.avatar, p.name || 'Jogador', 84)}<i>✎</i></button>
        <div class="pf-id"><small class="hint">Seu nome</small><div class="pfn" id="pfnRow"><b id="pfNameTxt">${esc(p.name) || 'Sem nome'}</b><button class="ibtn sm" id="pfEdit" aria-label="Editar nome" title="Editar nome">✎</button></div><input type="text" id="pfName" class="txtin" maxlength="14" placeholder="Como você quer aparecer" aria-label="Seu nome" value="${esc(p.name)}" autocomplete="off" hidden><div class="pf-uid"><small class="hint">Seu ID</small><code id="pfUid">${esc(ST.uid())}</code><button class="btn sm ghost" id="pfCopy">Copiar</button></div><small class="hint">Jogando desde ${esc(since)}</small></div></section>
      <section class="stats">${stat(t.g, 'Partidas')}${stat(t.w, 'Vitórias')}${stat(t.g ? pct + '%' : '—', 'Aproveitamento')}${stat(t.best, 'Maior sequência')}${stat(t.dispW, 'Disputas ganhas')}${stat(t.esp, 'Especiais usados')}</section>
      <section class="modes"><div><b>Contra bots</b><span>${t.pvb.w}/${t.pvb.g} vitórias</span></div><div><b>Contra pessoas</b><span>${t.pvp.w}/${t.pvp.g} vitórias</span></div><div><b>Online</b><span>${t.online.w}/${t.online.g} vitórias</span></div>${t.g ? `<div><b>Partida média</b><span>${fmtDur(t.dur / t.g)} · ${(t.rounds / t.g).toFixed(1)} rodadas</span></div>` : ''}</section>
      <h3 class="sec">Maestria das cartas <span class="hint">${ST.masteryCount(1)} com emblema</span></h3><div class="mastsec" id="mastsec"></div>
      <h3 class="sec">Buscar jogador</h3><div class="find" id="pfFind"></div>
      <h3 class="sec">Cartas favoritas</h3><div class="favrow" id="favrow"></div>
      <h3 class="sec">Conquistas <span class="hint">${ach.filter(a => a.done).length}/${ach.length}</span></h3>
      <div class="achs">${ach.map(a => `<div class="ach ${a.done ? 'on' : ''}"><span class="ai">${a.done ? ICO.medal : ICO.lock}</span><div class="at"><b>${esc(a.nome)}</b><small>${esc(a.desc)}</small>${a.done ? '' : (a.meta > 1 ? `<div class="bar"><i style="width:${a.val / a.meta * 100}%"></i></div><em>${a.val}/${a.meta}</em>` : '')}</div></div>`).join('')}</div>
      <div class="row" id="pfAdmin"></div>
      <div class="row" style="margin-top:12px"><button class="btn ghost sm" id="pfReset">Apagar dados deste aparelho</button></div>
    </div>`;
    bindTop(s);
    { const ms = $('#mastsec', s), top = ST.masteryList().slice(0, 6);
      ms.innerHTML = `<div class="mlegend">${ST.MAST_NOME.slice(1).map((n, i) => `<span>${U.emblem(i + 1, 22)}<b>${esc(n)}</b><small>${ST.MAST_AT[i]} XP</small></span>`).join('')}</div>`
        + (top.length ? `<div class="mtop">${top.map(m => `<button class="mrow" data-id="${m.id}">${U.emblem(m.lv, 30) || '<span class="memp"></span>'}<span class="mn"><b>${esc(CARTAS.find(c => c.id === m.id).nome)}</b><small>${m.xp} XP · ${m.u} usos · ${m.w} vitórias · ${m.s} especiais</small></span></button>`).join('')}</div>` : '<p class="hint">Cada uso, disputa vencida e especial resolvido rende XP à carta. Os emblemas são só reconhecimento: não alteram atributos.</p>')
        + '<p class="hint">XP: 1 por uso · 3 por disputa vencida · 2 por especial resolvido.</p>';
      ms.onclick = e => { const b = e.target.closest('.mrow'); if (b) { SND.play('click'); U.zoom(b.dataset.id, { list: top.map(m => m.id), mastery: true }); } }; }
    const fr = $('#favrow', s);
    if (p.fav.length) fr.append(...p.fav.slice(0, 12).map(id => cardEl(id, { up: true, noanim: true, cw: 76, click: true }))); else fr.innerHTML = '<p class="hint">Abra uma carta na Coleção e toque em ☆ para favoritá-la.</p>';
    const nm = $('#pfName', s), row = $('#pfnRow', s);   // o nome só se edita aqui: toque no lápis, digite e confirme com Enter (ou ao sair do campo)
    const commit = () => { ST.setName(nm.value); const n = ST.profile().name; $('#pfNameTxt', s).textContent = n || 'Sem nome'; const av = $('#pfAv', s); av.innerHTML = avatarHTML(ST.profile().avatar, n || 'Jogador', 84) + '<i>✎</i>'; nm.hidden = true; row.hidden = false; };
    $('#pfEdit', s).onclick = () => { SND.play('click'); row.hidden = true; nm.hidden = false; nm.value = ST.profile().name || ''; nm.focus(); nm.select(); };
    nm.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); nm.blur(); } else if (e.key === 'Escape') { nm.value = ST.profile().name || ''; nm.blur(); } };
    nm.onblur = commit;
    $('#pfAv', s).onclick = () => { SND.play('click'); avatarPicker(() => profTab()); };
    let sure = false; const rb = $('#pfReset', s); rb.onclick = () => { if (!sure) { sure = true; rb.textContent = 'Toque de novo para apagar tudo'; return; } ST.reset(); profTab(); };
    const cp = $('#pfCopy', s); cp.onclick = async () => { try { await navigator.clipboard.writeText(ST.uid()); cp.textContent = 'Copiado'; } catch (e) { cp.textContent = ST.uid(); } };
    if (U.findHook) U.findHook($('#pfFind', s)); else $('#pfFind', s).innerHTML = '<p class="hint">Busca disponível ao abrir pelo claude.ai.</p>';
    if (U.adminHook) U.adminHook($('#pfAdmin', s));
  }
  function avatarPicker(done) {
    const withImg = CARTAS.filter(c => IMG[c.id]);
    const w = el(`<div><h2 style="color:var(--gold2);margin-bottom:8px">Escolha seu avatar</h2><div class="lbl">Cor de série</div><div class="avopts">${Object.keys(SERIES).map(k => `<button class="avopt" data-t="serie" data-k="${k}" style="--ac:${SERIES[k].cor}" aria-label="${esc(SERIES[k].nome)}"><span class="av ini" style="--s:46px;--ac:${SERIES[k].cor}">${esc((ST.profile().name || 'J')[0].toUpperCase())}</span></button>`).join('')}</div>
      <div class="lbl" style="margin-top:12px">Ou um personagem</div><div class="avopts big">${withImg.map(c => `<button class="avopt" data-t="card" data-id="${c.id}" aria-label="${esc(c.nome)}"><span class="av" style="--s:56px"><img alt="" src="${IMG[c.id]}"></span></button>`).join('')}</div></div>`);
    const m = U.modal(w);
    w.onclick = e => { const b = e.target.closest('.avopt'); if (!b) return; SND.play('click'); ST.setAvatar(b.dataset.t === 'card' ? { t: 'card', id: b.dataset.id } : { t: 'serie', k: b.dataset.k }); m.close(); done(); };
  }
  U.toast = function (text, ms) {
    const t = el(`<div class="toast" role="status">${ICO.medal}<span>${esc(text)}</span></div>`); (U.layer() || document.body).appendChild(t);
    setTimeout(() => t.classList.add('out'), ms || 3200); setTimeout(() => t.remove(), (ms || 3200) + 400);
  };
  U.profTab = profTab;
  U.renderHome = home;
})();
