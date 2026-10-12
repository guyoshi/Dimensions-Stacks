/* Dimensions Stacks — mesa de jogo: tabuleiro, animações, efeitos e ponte com o motor (io). */
(function () {
  'use strict';
  const U = window.DSUI;
  const { $, $$, el, esc, CARDS, ATT, AIDS, E, SND, S, cardEl, updateCard, ICON, PCOL } = U;
  const sleep = ms => U.sleep(ms);
  const LAYOUT = { 2: ['b', 't'], 3: ['b', 'tl', 'tr'], 4: ['b', 'l', 't', 'r'] };
  let G = null, V = null, lastCfg = null;

  // ---------------------------------------------------------------- efeitos de partículas
  const FX = {
    cv: null, x: null, ps: [], on: false,
    init() { this.cv = $('#fx'); this.x = this.cv.getContext('2d'); const rs = () => { this.cv.width = window.innerWidth; this.cv.height = window.innerHeight; }; rs(); window.addEventListener('resize', rs); },
    burst(x, y, o) {
      if (!this.cv || U.S.reduce) return; o = o || {};
      const cols = o.colors || ['#ffe08a', '#fff', '#ffb02e', '#ff7a45'];
      for (let i = 0; i < (o.n || 50); i++) {
        const a = Math.random() * Math.PI * 2, sp = (o.speed || 6) * (.3 + Math.random());
        this.ps.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (o.up || 0), life: 0, max: (o.life || 55) * (.6 + Math.random() * .8), s: (o.size || 3.2) * (.5 + Math.random()), c: cols[i % cols.length], g: o.g == null ? .12 : o.g, sq: o.sq });
      }
      if (!this.on) { this.on = true; requestAnimationFrame(() => this.loop()); }
    },
    confetti() {
      if (U.S.reduce) return;
      for (let k = 0; k < 6; k++) setTimeout(() => this.burst(Math.random() * window.innerWidth, -10, { n: 40, speed: 4, up: -3, g: .09, life: 160, size: 5, sq: true, colors: ['#ffe08a', '#6cb6ff', '#ff7ab0', '#86f5a4', '#c58cff'] }), k * 250);
    },
    loop() {
      const x = this.x; x.clearRect(0, 0, this.cv.width, this.cv.height);
      this.ps = this.ps.filter(p => p.life < p.max);
      for (const p of this.ps) {
        p.life++; p.x += p.vx; p.y += p.vy; p.vy += p.g; p.vx *= .985;
        x.globalAlpha = Math.max(0, 1 - p.life / p.max); x.fillStyle = p.c;
        if (p.sq) x.fillRect(p.x, p.y, p.s, p.s * 1.6); else { x.beginPath(); x.arc(p.x, p.y, p.s, 0, 6.3); x.fill(); }
      }
      x.globalAlpha = 1;
      if (this.ps.length) requestAnimationFrame(() => this.loop()); else this.on = false;
    },
  };

  // ---------------------------------------------------------------- helpers visuais
  function banner(title, sub, color, ms) {
    const b = el(`<div class="banner" style="--d:${((ms || 1800) * S.k) / 1000}s;${color ? `--bc:${color}` : ''}"><b>${esc(title)}</b>${sub ? `<span>${esc(sub)}</span>` : ''}</div>`);
    U.layer().appendChild(b); setTimeout(() => b.remove(), (ms || 1800) * S.k + 100);
  }
  function caption(t, flash) { const c = $('#caption'); if (!c) return; c.textContent = t || ''; c.classList.toggle('flash', !!flash); }
  function ghostCard(o) {
    const id = o.id || U.D.CARTAS[0].id;
    const g = cardEl(id, { up: !!o.id, noanim: true, stats: o.stats }); g.classList.add('flyghost'); return g;
  }
  async function fly(from, to, o) {
    o = o || {}; if (!from || !to) return;
    const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
    const cw = o.cw || (V && V.cw) || 90;
    const g = ghostCard(o); g.style.setProperty('--cw', cw + 'px');
    document.body.appendChild(g);
    const w = cw, h = cw * 1.4;
    const sx = a.left + a.width / 2 - w / 2, sy = a.top + a.height / 2 - h / 2, ex = b.left + b.width / 2 - w / 2, ey = b.top + b.height / 2 - h / 2;
    const s0 = o.s0 != null ? o.s0 : Math.max(.08, Math.min(1.2, a.width / w)), s1 = o.s1 != null ? o.s1 : Math.max(.08, Math.min(1.2, b.width / w));
    const mid = o.arc ? `translate(${(sx + ex) / 2}px,${(sy + ey) / 2 - o.arc}px) scale(${Math.max(s0, s1) * 1.1}) rotate(${(o.r1 || 0) / 2}deg)` : null;
    const kf = [{ transform: `translate(${sx}px,${sy}px) scale(${s0}) rotate(${o.r0 || 0}deg)`, opacity: 1 }];
    if (mid) kf.push({ transform: mid, opacity: 1, offset: .5 });
    kf.push({ transform: `translate(${ex}px,${ey}px) scale(${s1}) rotate(${o.r1 || 0}deg)`, opacity: o.fade ? 0 : 1 });
    const an = g.animate(kf, { duration: (o.ms || 600) * S.k, easing: o.ease || 'cubic-bezier(.3,.7,.2,1)', fill: 'forwards' });
    if (o.up) setTimeout(() => g.classList.add('up'), (o.ms || 600) * S.k * .3);
    try { await an.finished; } catch (e) { }
    g.remove();
  }
  U.fly = fly;
  const seatDeck = pid => $('.mini:not(.res)', V.seats[pid]);
  const seatRes = pid => $('.mini.res', V.seats[pid]);
  const seatPrep = pid => { const ps = $$('.prepslot', V.seats[pid]); return ps.find(x => !x.classList.contains('on')) || ps[1]; };
  const cardIn = pid => $('.card', V.slots[pid]);
  const entryOf = pid => V.combat && V.combat.entries.find(e => e.pid === pid);
  const nameOf = pid => G.p(pid).name;

  // ---------------------------------------------------------------- caixas de decisão
  function ask(node, sel) {
    return new Promise((res, rej) => {
      const run = U.run; run.rej.add(rej);
      const dock = $('#dock'); dock.hidden = false; dock.replaceChildren(node);
      node.addEventListener('click', e => {
        const b = e.target.closest(sel || '[data-v]'); if (!b) return;
        SND.play('click'); run.rej.delete(rej); dock.hidden = true; dock.replaceChildren(); res(b.dataset.v);
      });
    });
  }
  function waitClose(content, o) {
    return new Promise((res, rej) => { const run = U.run; run.rej.add(rej); U.modal(content, Object.assign({}, o, { onclose: () => { run.rej.delete(rej); res(); } })); });
  }
  async function cover(p) {
    if (!V || V.humans < 2) return;
    const n = el(`<div class="cover"><div><div class="avatar" style="--pc:${PCOL[p.pid]}">${esc(p.name[0].toUpperCase())}</div><h2>Vez de ${esc(p.name)}</h2><p class="hint">Passe o aparelho. Os outros jogadores não devem olhar.</p><button class="btn primary">Sou ${esc(p.name)} — continuar</button></div></div>`);
    U.layer().appendChild(n);
    await new Promise((res, rej) => { const run = U.run; run.rej.add(rej); $('button', n).onclick = () => { run.rej.delete(rej); SND.play('click'); res(); }; });
    n.remove();
  }

  // ---------------------------------------------------------------- estrutura da mesa
  function shell() {
    $('#game').innerHTML = `<header class="hud"><button class="ibtn" id="bMenu" title="Menu">☰</button>
      <div class="mid"><b>DIMENSIONS STACKS</b><div id="hSub"></div></div>
      <button class="ibtn" id="bLog" title="Registro">📜</button><button class="ibtn" id="bSnd" title="Som">🔊</button><button class="ibtn" id="bSpd" title="Velocidade">⏩</button></header>
      <main class="board" id="board"></main><div id="caption"></div><div id="dock" hidden></div>`;
    $('#bMenu').onclick = gameMenu;
    $('#bLog').onclick = toggleLog;
    $('#bSnd').onclick = () => { V.muted = !V.muted; SND.setVol('master', V.muted ? 0 : S.master); $('#bSnd').textContent = V.muted ? '🔇' : '🔊'; };
    $('#bSpd').onclick = () => { const o = ['lento', 'normal', 'rapido']; S.speed = o[(o.indexOf(S.speed) + 1) % 3]; U.applyOpts(); speedLbl(); };
    speedLbl();
  }
  function speedLbl() { const b = $('#bSpd'); if (b) b.textContent = { lento: '🐢', normal: '⏩', rapido: '⚡' }[S.speed]; }
  function toggleLog() {
    const old = $('.logdrawer'); if (old) return old.remove();
    const d = el(`<div class="logdrawer"><button class="btn ghost sm" style="float:right">✕</button><h3 style="color:var(--gold2);margin-bottom:10px">Registro</h3><div class="lg"></div></div>`);
    $('.lg', d).append(...V.logs.map(l => el(`<p class="${l.cls}">${esc(l.text)}</p>`)));
    $('button', d).onclick = () => d.remove(); U.layer().appendChild(d); d.scrollTop = d.scrollHeight;
  }
  function gameMenu() {
    SND.play('click');
    const n = el(`<div style="display:flex;flex-direction:column;gap:10px;margin-top:20px"><h2 style="color:var(--gold2)">Pausa</h2>
      <button class="btn primary" data-a="c">Continuar</button><button class="btn" data-a="r">📖 Como jogar</button><button class="btn" data-a="o">⚙ Opções e sons</button><button class="btn" data-a="q">Abandonar partida</button></div>`);
    const m = U.modal(n); let sure = false;
    n.onclick = e => { const b = e.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a;
      if (a === 'c') m.close(); else if (a === 'r') U.rules(); else if (a === 'o') U.options();
      else if (a === 'q') { if (!sure) { sure = true; b.textContent = 'Toque de novo para confirmar'; } else { m.close(); U.killRun(); $$('#layer > *').forEach(x => x.remove()); U.show('menu'); } } };
  }

  function buildBoard() {
    const n = V.n, pos = LAYOUT[n];
    G.s.players.forEach(p => { V.pos[p.pid] = pos[(p.pid - V.viewer + n) % n]; });
    const b = $('#board');
    b.innerHTML = `<div class="r-top"></div><div class="r-mid"><div class="sideL"></div><div class="arenaWrap"><div class="arena n${n}"></div></div><div class="sideR"></div></div><div class="r-bot"></div>`;
    const rel = G.s.players.slice().sort((a, c) => ((a.pid - V.viewer + n) % n) - ((c.pid - V.viewer + n) % n));
    const arena = $('.arena', b);
    rel.forEach(p => {
      const ps = V.pos[p.pid];
      const seat = el(`<div class="seat pos-${ps}${ps === 'b' ? ' me' : ''}" data-pid="${p.pid}" style="--pc:${PCOL[p.pid]}">
        <div class="avatar" style="--pc:${PCOL[p.pid]}">${esc(p.name[0].toUpperCase())}</div>
        <div class="who"><div class="nm">${esc(p.name)}${p.bot ? ' 🤖' : ''} <span class="turnflag" hidden>INICIA</span></div>
        <div class="cnt"><span title="Baralho ativo"><i class="mini"></i><b class="cd">0</b></span><span title="Reserva"><i class="mini res"></i><b class="cr">0</b></span><span class="prepslots" title="Especiais preparados"><i class="prepslot"></i><i class="prepslot"></i></span></div></div></div>`);
      V.seats[p.pid] = seat;
      const host = ps === 'b' ? '.r-bot' : ps === 'l' ? '.sideL' : ps === 'r' ? '.sideR' : '.r-top';
      $(host, b).append(seat);
      const slot = el(`<div class="slot pos-${ps}" data-pid="${p.pid}" data-name="${esc(p.name)}" style="--pc:${PCOL[p.pid]}"></div>`);
      V.slots[p.pid] = slot; arena.append(slot);
    });
    arena.append(el(`<div class="bh" id="bh" title="Buraco Negro"><div class="vortex"></div><div class="n"><span id="bhn">0</span><small>BURACO NEGRO</small></div></div>`));
    $('#bh').onclick = showBH;
    if (V.humans === 1) V.seats[V.viewer].onclick = showMyDeck;
    if (V.ro) V.ro.disconnect();
    V.ro = new ResizeObserver(fit); V.ro.observe($('.arenaWrap', b));
    fit(); refresh();
  }
  function fit() {
    const w = $('.arenaWrap'); if (!w || !V) return;
    const W = w.clientWidth, H = w.clientHeight, n = V.n;
    const need = n === 2 ? { w: 1.5, h: 4.6 } : n === 3 ? { w: 3.45, h: 3.6 } : { w: 3.5, h: 5.2 };
    const cw = Math.max(40, Math.floor(Math.min(W / need.w, H / need.h, 150)));
    V.cw = cw; $('.arena', w).style.setProperty('--cw', cw + 'px');
  }
  function refresh() {
    if (!G || !V.seats[0] && !Object.keys(V.seats).length) return;
    const s = G.s;
    s.players.forEach(p => {
      const seat = V.seats[p.pid]; if (!seat) return;
      $('.cd', seat).textContent = p.deck.length; $('.cr', seat).textContent = p.reserve.length;
      $$('.prepslot', seat).forEach((x, i) => x.classList.toggle('on', i < p.prepared.length));
      seat.classList.toggle('dead', !p.alive);
      const turn = V.init === p.pid && p.alive && !s.over;
      seat.classList.toggle('turn', turn); $('.turnflag', seat).hidden = !turn;
    });
    const bh = $('#bhn'); if (bh) bh.textContent = s.bh.length;
    const sub = $('#hSub'); if (sub) sub.textContent = `Rodada ${s.round} · Disputa ${Math.min(s.combats + 1, 9999)}${V.init != null ? ' · inicia ' + nameOf(V.init) : ''}`;
  }
  function pulseBH() { const b = $('#bh'); if (!b) return; b.classList.remove('pulse'); void b.offsetWidth; b.classList.add('pulse'); refresh(); }

  function showBH() {
    const list = G.s.bh; SND.play('click');
    const w = el(`<div><h2 style="color:var(--gold2)">Buraco Negro <span class="hint">(${list.length})</span></h2><p class="hint">Cartas fora de jogo. Especiais usados aparecem marcados.</p><div class="cgrid"></div></div>`);
    $('.cgrid', w).append(...list.map(x => { const c = cardEl(x.id, { up: true, noanim: true, cw: 96, click: true }); if (x.kind === 'especial') c.style.outline = '2px solid #b78cff'; return c; }));
    if (!list.length) $('.cgrid', w).outerHTML = '<p class="hint">Vazio por enquanto.</p>';
    U.modal(w);
  }
  function showMyDeck() {
    const p = G.p(V.viewer); SND.play('click');
    const w = el(`<div><h2 style="color:var(--gold2)">Seu baralho</h2><p class="hint">Ordem de jogo (1ª = próxima a entrar). Reserva: ${p.reserve.length} carta(s) fechadas.</p><div class="cgrid"></div>${p.prepared.length ? '<h3 style="margin:10px 0;color:var(--gold2)">Especiais preparados</h3><div class="cgrid" id="pp"></div>' : ''}</div>`);
    $('.cgrid', w).append(...p.deck.map((id, i) => { const c = cardEl(id, { up: true, noanim: true, cw: 96, click: true }); const t = el(`<div class="tag" style="position:absolute;top:-8px;left:4px;z-index:3;background:#0b0720;border:1px solid var(--line);border-radius:99px;padding:0 7px;font-size:11px;font-weight:900">${i + 1}</div>`); c.append(t); return c; }));
    const pp = $('#pp', w); if (pp) pp.append(...p.prepared.map(id => cardEl(id, { up: true, noanim: true, cw: 96, click: true })));
    U.modal(w);
  }

  // ---------------------------------------------------------------- arena: atualização de cartas em campo
  function updateSlot(e) {
    const slot = V.slots[e.pid], card = $('.card', slot); if (!card) return;
    if (!e.attr || !card.classList.contains('up')) { return; }
    updateCard(card, e.stats, e.attr);
    let b = $('.badge', slot); const val = e.stats[e.attr] + e.bonus;
    if (!b) { b = el('<div class="badge"></div>'); slot.append(b); }
    const prev = b.dataset.v; b.dataset.v = val; b.dataset.a = e.attr;
    b.innerHTML = `${ICON[e.attr]}<span>${val}</span>${e.bonus ? `<em>${e.bonus > 0 ? '+' : ''}${e.bonus}</em>` : ''}`;
    if (prev != null && +prev !== val) { b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); SND.play('bonus'); }
    slot.classList.toggle('withdrawn', !!e.withdrawn);
    let x = $('.xtra', slot);
    if (e.extra && e.extra.length) { if (!x) { x = el('<div class="xtra"></div>'); slot.append(x); } x.textContent = '+' + e.extra.length + (e.extra.length > 1 ? ' cartas' : ' carta'); }
  }
  function updateAll() { if (V.combat) V.combat.entries.forEach(updateSlot); }

  async function revealCards(combat) {
    const arena = $('.arena'); const ents = combat.entries;
    arena.classList.add('suspense'); SND.play('suspense');
    ents.forEach(e => { V.slots[e.pid].classList.remove('pending'); V.slots[e.pid].classList.add('tremble'); });
    caption('As cartas serão reveladas…', true);
    await sleep(1500);
    const order = ents.slice().sort(() => Math.random() - .5);
    for (let i = 0; i < order.length; i++) {
      const e = order[i], last = i === order.length - 1 && order.length > 1, slot = V.slots[e.pid];
      if (last) { slot.classList.remove('tremble'); slot.classList.add('charging'); await sleep(1300); }
      slot.classList.remove('tremble', 'charging');
      cardIn(e.pid).classList.add('up'); SND.play(last ? 'reveal' : 'flip');
      await sleep(430);
      updateSlot(e);
      const r = slot.getBoundingClientRect(); FX.burst(r.left + r.width / 2, r.top + r.height / 2, { n: last ? 36 : 14, speed: last ? 7 : 4, life: 40, size: 2.4 });
      await sleep(last ? 900 : 520);
    }
    arena.classList.remove('suspense');
    caption('');
  }

  // ---------------------------------------------------------------- manipuladores de eventos do motor
  const H = {
    async setup() {
      buildBoard(); SND.play('deal'); banner('Preparando a mesa', 'Embaralhando as dimensões', null, 1400); await sleep(900);
    },
    async ready() {
      V.init = G.s.initiator; refresh();
      for (let i = 0; i < 4; i++) { SND.play('deal'); await sleep(110); }
      banner('Que comece!', `${nameOf(G.s.initiator)} inicia`, null, 1500); await sleep(900);
    },
    async combatStart({ initiator, round }) {
      V.init = initiator; V.winShown = false; refresh();
      caption(`Disputa ${G.s.combats + 1} — ${nameOf(initiator)} inicia`); await sleep(350);
    },
    async prepare({ pid }) {
      const to = seatPrep(pid); const from = seatDeck(pid);
      SND.play('special'); await fly(from, to, { ms: 500, cw: 60 }); refresh(); caption(`${nameOf(pid)} prepara um ataque especial…`); await sleep(250);
    },
    async commit({ combat }) {
      V.combat = combat;
      for (const e of combat.entries) {
        const slot = V.slots[e.pid]; const c = cardEl(e.card, { stats: e.stats }); c.style.visibility = 'hidden'; slot.append(c); slot.classList.add('has');
        await fly(seatDeck(e.pid), slot, { ms: 420, ease: 'cubic-bezier(.2,.8,.3,1)' });
        c.style.visibility = ''; SND.play('place'); slot.classList.add('pending'); await sleep(90);
      }
      refresh(); caption('Cartas na mesa. Escolham seus atributos.'); await sleep(250);
    },
    async initiatorAttr({ pid, attr }) {
      const slot = V.slots[pid]; slot.classList.remove('pending');
      slot.append(el(`<div class="tag" data-a="${attr}" style="color:var(--ac)">${ICON[attr]}<span style="color:var(--ink)">${ATT[attr].nome} · ${ATT[attr].tipo}</span></div>`));
      SND.play('bonus'); const par = AIDS.filter(a => ATT[a].par === ATT[attr].par).map(a => ATT[a].nome).join(' ou ');
      caption(`${nameOf(pid)} iniciou em ${ATT[attr].nome}. Os demais escolhem ${par} em segredo.`, true); await sleep(700);
    },
    async reveal({ combat }) { await revealCards(combat); },
    async specialWindow() {
      if (V.winShown) return; V.winShown = true; banner('Janela de especiais', 'decida em segredo', '#c58cff', 1400); caption('Janela de ataques especiais…'); await sleep(900);
    },
    async specialsFlip({ combat, acts, forced }) {
      const st = el(`<div class="stage"><div class="acts"></div></div>`);
      const box = $('.acts', st);
      acts.forEach((a, i) => {
        const sp = E.SPECIALS[CARDS[a.card].especial];
        const n = el(`<div class="act" style="--pc:${PCOL[a.pid]};animation-delay:${i * .18}s"><div class="own">${esc(nameOf(a.pid))}${forced || a.forced ? ' (forçado)' : ''}</div><div class="cb"></div><div class="spn">✦ ${esc(sp.nome)}</div><div class="stx">${esc(sp.texto)}</div></div>`);
        $('.cb', n).append(cardEl(a.card, { cw: Math.min(150, (window.innerWidth - 60) / Math.max(1, acts.length) - 20) }));
        box.append(n);
      });
      U.layer().appendChild(st); SND.play('special');
      await sleep(500); $$('.card', st).forEach(c => c.classList.add('up')); SND.play('specialFlip');
      const r = st.getBoundingClientRect(); FX.burst(r.width / 2, r.height / 2, { n: 70, speed: 8, colors: ['#ffe08a', '#c58cff', '#fff'], life: 60 });
      await sleep(2300); st.remove();
      let strip = $('.strip'); if (!strip) { strip = el('<div class="strip"></div>'); $('.arenaWrap').append(strip); }
      acts.forEach(a => { const sp = E.SPECIALS[CARDS[a.card].especial]; strip.append(el(`<div class="chip" data-card="${a.card}" style="--pc:${PCOL[a.pid]}"><i></i>${esc(nameOf(a.pid))}: ${esc(sp.nome)}</div>`)); });
    },
    async effectStart({ act, spec }) {
      const chip = $(`.chip[data-card="${act.card}"]`); if (chip) chip.classList.add('run');
      caption(`${nameOf(act.pid)}: ${spec.nome} — ${spec.texto}`, true); SND.play('special'); await sleep(900);
    },
    async effectEnd({ act }) {
      const chip = $(`.chip[data-card="${act.card}"]`); if (chip) chip.classList.remove('run');
      updateAll(); refresh(); await sleep(600);
    },
    async cancel({ card, target }) {
      const chip = $(`.chip[data-card="${card}"]`); if (chip) chip.classList.add('dead');
      SND.play('lose'); const s = V.slots[target]; s.classList.add('cancelx'); await sleep(900); s.classList.remove('cancelx');
    },
    async extra({ pid, card }) {
      const e = entryOf(pid); await fly(seatDeck(pid), V.slots[pid], { ms: 500 }); SND.play('place'); if (e) updateSlot(e); refresh(); await sleep(250);
    },
    async steal({ from, to, card, zone }) {
      SND.play('steal'); await fly(zone === 'reserve' ? seatRes(from) : seatDeck(from), seatDeck(to), { ms: 600, cw: 60, arc: 40 }); refresh(); await sleep(150);
    },
    async discard({ pid }) {
      SND.play('blackhole'); await fly(seatDeck(pid), $('#bh'), { ms: 800, cw: 60, r1: 540, s1: .05, fade: true, ease: 'cubic-bezier(.6,0,.9,.5)' }); pulseBH(); await sleep(100);
    },
    async rescue({ pid }) {
      SND.play('steal'); await fly($('#bh'), seatDeck(pid), { ms: 700, cw: 60, r0: 360, s0: .1, arc: 30 }); refresh(); await sleep(150);
    },
    async peek({ pid, target, cards }) {
      const p = G.p(pid); if (p.bot) return;
      await cover(p);
      const w = el(`<div><h2 style="color:var(--gold2)">Espionagem</h2><p class="hint">Próximas cartas do baralho de ${esc(nameOf(target))} (topo → fundo). Só você vê isto.</p><div class="cgrid"></div></div>`);
      $('.cgrid', w).append(...cards.map(id => cardEl(id, { up: true, noanim: true, cw: 110, click: true })));
      await waitClose(w);
    },
    async specialsDone() {
      const strip = $('.strip'); if (strip) { const chips = $$('.chip', strip); SND.play('blackhole');
        await Promise.all(chips.map((c, i) => sleep(i * 150).then(() => fly(c, $('#bh'), { ms: 700, id: c.dataset.card, cw: 70, s1: .05, r1: 420, fade: true })))); strip.remove(); }
      pulseBH(); await sleep(150);
    },
    async resolved({ combat, result, moves }) {
      updateAll();
      if (result.type === 'tie' || result.type === 'none') {
        banner('Empate', 'As cartas voltam aos donos', '#b9aedb', 1800); SND.play('tick'); caption('Ninguém vence esta disputa.'); await sleep(1700);
      } else {
        const w = result.winnerPid, slot = V.slots[w], atk = result.type === 'attack';
        combat.entries.forEach(e => { if (e.pid === w) slot.classList.add('winner'); else if (!e.withdrawn) V.slots[e.pid].classList.add('loser'); });
        SND.play('win'); setTimeout(() => SND.play(atk ? 'slash' : 'shield'), 150);
        slot.append(el(atk ? '<div class="fx-slash"></div>' : '<div class="fx-shield"></div>'));
        const r = slot.getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        FX.burst(cx, cy, { n: 80, speed: 9, life: 70, up: 2 });
        setTimeout(() => FX.burst(cx, cy, { n: 40, speed: 5, life: 60, colors: atk ? ['#ff7a45', '#fff', '#ffe08a'] : ['#8fd6ff', '#fff', '#4aa8ff'] }), 300);
        banner(`${nameOf(w)} vence!`, `${atk ? 'Ataque' : 'Defesa'} · ${ATT[result.attr].nome} ${result.value}`, atk ? '#ffd25f' : '#8fd6ff', 2100);
        caption(`${nameOf(w)} vence ${atk ? 'atacando' : 'defendendo'} com ${ATT[result.attr].nome} ${result.value}.`, true);
        await sleep(2100);
      }
      // movimentação das cartas
      const jobs = moves.map((m, i) => sleep(i * 220).then(async () => {
        const src = V.slots[m.from], card = $('.card', src); if (!card) return;
        const e = entryOf(m.from); const dest = m.to === 'bh' ? $('#bh') : m.zone === 'reserve' ? seatRes(m.to) : seatDeck(m.to);
        card.style.visibility = 'hidden';
        if (m.to === 'bh') { SND.play('blackhole'); await fly(src, dest, { id: m.cards[0], stats: e && e.stats, cw: V.cw, ms: 1000, r1: 540, s1: .04, fade: true, ease: 'cubic-bezier(.6,0,.9,.5)' }); pulseBH(); }
        else { if (m.from !== m.to) SND.play('capture'); await fly(src, dest, { id: m.cards[0], stats: e && e.stats, cw: V.cw, ms: 800, arc: 30 }); }
      }));
      await Promise.all(jobs); refresh(); await sleep(250);
    },
    async combatEnd() {
      Object.values(V.slots).forEach(s => { s.replaceChildren(); s.className = s.className.replace(/\b(has|pending|winner|loser|withdrawn|tremble|charging|cancelx)\b/g, '').replace(/\s+/g, ' ').trim(); });
      V.combat = null; refresh(); await sleep(250);
    },
    async refill({ pid, cards }) {
      SND.play('refill'); caption(`${nameOf(pid)} compra ${cards.length} carta(s) da reserva.`);
      for (let i = 0; i < cards.length; i++) { fly(seatRes(pid), seatDeck(pid), { ms: 450, cw: 50 }); await sleep(70); }
      await sleep(450); refresh();
    },
    async eliminated({ pid }) {
      refresh(); SND.play('elim'); banner(`${nameOf(pid)} eliminado`, 'sem cartas', '#ff6b6b', 2000); await sleep(1700);
    },
    async round({ round }) { refresh(); SND.play('round'); banner(`Rodada ${round}`, null, null, 1500); await sleep(1000); },
    async end({ winner }) {
      refresh(); const s = G.s; const human = winner != null && !G.p(winner).bot; const anyHuman = V.humans > 0;
      SND.play(winner == null ? 'defeat' : (human || !anyHuman) ? 'victory' : 'defeat');
      if (winner != null && (human || !anyHuman)) FX.confetti();
      const w = winner != null ? G.p(winner) : null;
      const n = el(`<div class="modal"><div class="box"><div class="final">
        ${w ? `<div class="avatar" style="--pc:${PCOL[w.pid]};width:84px;height:84px;font-size:40px">${esc(w.name[0].toUpperCase())}</div>` : ''}
        <h1>${w ? esc(w.name) + ' vence!' : 'Empate!'}</h1>
        <div class="hint">${s.byLimit ? 'Limite de disputas atingido: vence quem tem mais cartas.' : w ? 'Todos os adversários foram eliminados.' : ''}</div>
        <div class="stats"><div><b>${s.combats}</b>disputas</div><div><b>${s.round}</b>rodadas</div><div><b>${s.bh.length}</b>no Buraco Negro</div></div>
        <div class="row" style="justify-content:center"><button class="btn primary" data-a="again">Jogar de novo</button><button class="btn" data-a="menu">Menu</button></div></div></div></div>`);
      n.onclick = e => { const b = e.target.closest('[data-a]'); if (!b) return; SND.play('click'); n.remove(); if (b.dataset.a === 'again') U.startGame(lastCfg); else U.show('menu'); };
      U.layer().appendChild(n);
    },
  };

  // ---------------------------------------------------------------- decisões humanas
  function makeIO() {
    return {
      notify: async (type, data) => { const f = H[type]; if (f) { try { await f(data || {}); } catch (e) { if (e === 'abort') throw e; console.error('UI', type, e); } } },
      log: (text, cls) => { V.logs.push({ text, cls }); if (cls !== 'prep') caption(text, cls === 'vit'); const d = $('.logdrawer .lg'); if (d) d.append(el(`<p class="${cls}">${esc(text)}</p>`)); },
      orderHand: (p, hand) => orderHand(p, hand),
      async prepare(p, top) {
        if (V.noPrep[p.pid]) return false;
        await cover(p);
        const c = CARDS[top], sp = E.SPECIALS[c.especial];
        const node = el(`<div class="sheet"><div class="cardbox"></div><div class="txt"><h3>${esc(p.name)}: preparar ataque especial?</h3>
          <div class="hint">Carta do topo: <b>${esc(c.nome)}</b><br>✦ <b>${esc(sp.nome)}</b> — ${esc(sp.texto)}</div>
          <div class="hint">Se preparar, a carta fica fechada ao seu lado (em vez de combater) e você decide virá-la depois da revelação.</div>
          <div class="row"><button class="btn primary sm" data-v="1">Preparar especial</button><button class="btn sm" data-v="0">Jogar normalmente</button><button class="btn ghost sm" data-v="n">Não perguntar mais</button></div></div></div>`);
        $('.cardbox', node).append(cardEl(top, { up: true, noanim: true, cw: Math.min(96, V.cw || 96) }));
        const v = await ask(node, '[data-v]'); if (v === 'n') V.noPrep[p.pid] = true; return v === '1';
      },
      async attr(p, entry, options, combat) {
        await cover(p);
        const init = combat.initiator === p.pid; const ia = combat.entries.find(e => e.pid === combat.initiator).attr;
        const txt = init ? 'Você inicia: escolha <b>qualquer</b> atributo.' : `${esc(nameOf(combat.initiator))} iniciou em <b>${ATT[ia].nome}</b>. Escolha entre ${options.map(a => '<b>' + ATT[a].nome + '</b>').join(' e ')} — em segredo.`;
        const node = el(`<div class="sheet"><div class="cardbox"></div><div class="txt"><h3>${esc(p.name)}</h3><div class="hint">${txt}</div>
          <div class="attrs">${options.map(a => `<button class="attrbtn" data-a="${a}" data-v="${a}">${ICON[a]}<span><b>${ATT[a].nome}</b><small>${ATT[a].tipo}</small></span><span class="v">${entry.stats[a]}</span></button>`).join('')}</div></div></div>`);
        $('.cardbox', node).append(cardEl(entry.card, { up: true, noanim: true, cw: Math.min(96, V.cw || 96), stats: entry.stats }));
        return ask(node, '.attrbtn');
      },
      async special(p, usable, combat, ctx) {
        await cover(p);
        const node = el(`<div class="sheet"><div class="txt" style="flex:1 1 100%"><h3>${esc(p.name)}: virar um ataque especial?</h3><div class="hint">Você pode virar no máximo 1. Os virados são revelados juntos, depois que todos decidirem.</div></div></div>`);
        usable.forEach(id => {
          const sp = E.SPECIALS[CARDS[id].especial];
          const pk = el(`<div class="specpick"><div class="cb"></div><div class="spx"><div class="spn">✦ ${esc(sp.nome)}</div><div class="spt">${esc(sp.texto)}</div><button class="btn primary sm" data-v="${id}">Virar</button></div></div>`);
          $('.cb', pk).append(cardEl(id, { up: true, noanim: true, cw: 72 })); node.append(pk);
        });
        node.append(el('<button class="btn" data-v="none">Manter fechado</button>'));
        const v = await ask(node, '[data-v]'); return v === 'none' ? null : v;
      },
      async chooseTarget(p, cands, label) {
        await cover(p);
        const node = el(`<div class="sheet"><div class="txt"><h3>${esc(p.name)}</h3><div class="hint">${esc(label)}</div><div class="row">${cands.map(pid => `<button class="btn" data-v="${pid}"><span class="avatar" style="--pc:${PCOL[pid]};width:30px;height:30px;font-size:14px">${esc(nameOf(pid)[0].toUpperCase())}</span>${esc(nameOf(pid))} <span class="hint">(${G.p(pid).deck.length}+${G.p(pid).reserve.length})</span></button>`).join('')}</div></div></div>`);
        return +(await ask(node, '[data-v]'));
      },
    };
  }

  function orderHand(p, hand) {
    return (async () => {
      await cover(p);
      return new Promise((res, rej) => {
        const run = U.run; run.rej.add(rej);
        let arr = hand.slice(), sel = -1, last = 0;
        const ov = el(`<div class="order"><div><h2 style="color:var(--gold2)">${esc(p.name)}: monte seu baralho</h2>
          <div class="hint">Toque numa carta e depois em outra para trocá-las de lugar. A carta <b>nº 1</b> é a primeira a entrar em disputa (e a que pode virar especial).</div></div>
          <div class="grid"></div><div class="info"></div>
          <div class="row" style="justify-content:center"><button class="btn sm" data-a="l">◀ Mover</button><button class="btn sm" data-a="r">Mover ▶</button><button class="btn sm" data-a="best">Melhores primeiro</button><button class="btn sm" data-a="mix">Embaralhar</button></div>
          <div class="row" style="justify-content:center"><button class="btn primary" data-a="ok">Confirmar ordem ▶</button></div></div>`);
        const W = window.innerWidth - 32;
        let cw = Math.floor((W - 6 * 10) / 7); if (cw < 70) cw = Math.floor((W - 3 * 10) / 4); cw = Math.max(64, Math.min(112, cw));
        function draw() {
          const g = $('.grid', ov); g.replaceChildren(...arr.map((id, i) => {
            const w = el(`<div class="oc${sel === i ? ' sel' : ''}"><div class="no">${i === 0 ? '1 · TOPO' : i + 1}</div></div>`);
            w.append(cardEl(id, { up: true, noanim: true, cw })); w.onclick = () => { SND.play('tick'); last = i; if (sel < 0) sel = i; else if (sel === i) sel = -1; else { [arr[sel], arr[i]] = [arr[i], arr[sel]]; sel = -1; SND.play('place'); } draw(); }; return w;
          }));
          const id = arr[last], c = CARDS[id], sp = E.SPECIALS[c.especial];
          $('.info', ov).innerHTML = `<b>${esc(c.nome)}</b> · ${AIDS.map(a => `${ATT[a].abre} ${c.stats[a]}`).join(' · ')}<br>✦ <b>${esc(sp.nome)}</b> — ${esc(sp.texto)}`;
        }
        ov.onclick = e => {
          const b = e.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a; SND.play('click');
          if (a === 'l' && sel > 0) { [arr[sel - 1], arr[sel]] = [arr[sel], arr[sel - 1]]; sel--; last = sel; }
          else if (a === 'r' && sel >= 0 && sel < arr.length - 1) { [arr[sel + 1], arr[sel]] = [arr[sel], arr[sel + 1]]; sel++; last = sel; }
          else if (a === 'best') { arr.sort((x, y) => E.sum4(CARDS[y].stats) - E.sum4(CARDS[x].stats)); sel = -1; }
          else if (a === 'mix') { arr.sort(() => Math.random() - .5); sel = -1; }
          else if (a === 'ok') { run.rej.delete(rej); ov.remove(); return res(arr); }
          draw();
        };
        $('#game').append(ov); draw();
      });
    })();
  }

  // ---------------------------------------------------------------- iniciar
  U.startGame = async function (cfg) {
    lastCfg = cfg; SND.init(); U.killRun(); U.newRun(); $$('#layer > *').forEach(x => x.remove());
    if (!FX.cv) FX.init();
    V = { n: cfg.players.length, humans: cfg.players.filter(p => !p.bot).length, viewer: Math.max(0, cfg.players.findIndex(p => !p.bot)), noPrep: {}, seats: {}, slots: {}, pos: {}, combat: null, logs: [], init: null, muted: false };
    U.show('game'); shell();
    G = new E.Game({ players: cfg.players, perPlayer: cfg.perPlayer, difficulty: cfg.difficulty, io: makeIO() });
    U.game = G;
    try { await G.run(); } catch (e) { if (e !== 'abort') { console.error(e); caption('Erro: ' + (e && e.message || e)); } }
  };
  U.dbg = () => ({ G, V });
})();
