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
      const cols = o.colors || ['#e9dfc0', '#fff', '#ffb02e', '#ff7a45'];
      for (let i = 0; i < (o.n || 50); i++) {
        const a = Math.random() * Math.PI * 2, sp = (o.speed || 6) * (.3 + Math.random());
        this.ps.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (o.up || 0), life: 0, max: (o.life || 55) * (.6 + Math.random() * .8), s: (o.size || 3.2) * (.5 + Math.random()), c: cols[i % cols.length], g: o.g == null ? .12 : o.g, sq: o.sq });
      }
      if (!this.on) { this.on = true; requestAnimationFrame(() => this.loop()); }
    },
    confetti() {
      if (U.S.reduce) return;
      for (let k = 0; k < 6; k++) setTimeout(() => this.burst(Math.random() * window.innerWidth, -10, { n: 40, speed: 4, up: -3, g: .09, life: 160, size: 5, sq: true, colors: ['#e9dfc0', '#6cb6ff', '#ff7ab0', '#86f5a4', '#c58cff'] }), k * 250);
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
  function spLine(cardId, combat, canPrep) {
    const c = CARDS[cardId], sp = E.SPECIALS[c.especial]; if (!sp) return '';
    const from = (G && G.cfg && G.cfg.specialsFrom) || 2;
    let act = '';
    if (combat && combat.specialsAllowed === false) act = `<span class="splnote">Especiais a partir da rodada ${from}.</span>`;
    else if (canPrep) act = `<button class="btn sm prepbtn" data-v="@prep">✦ ${esc(sp.nome)} · usar como especial</button>`;
    return act ? `<div class="splact">${act}</div>` : '';
  }
  // ---- apresentação de um especial em ação: quem usou, qual, e o que aconteceu
  let FXB = null;
  function fxShow(act, spec) {
    fxHide(true);
    const tag = act.copy ? 'cópia' : act.forced ? 'forçado' : '';
    const n = el(`<div class="fxb" style="--pc:${PCOL[act.pid]}"><div class="who"><i></i>${esc(nameOf(act.pid))}${tag ? ` <small>${tag}</small>` : ''}</div><div class="nm">✦ ${esc(spec.nome)}</div><div class="rs"></div></div>`);
    U.layer().appendChild(n); FXB = n; V.fxLines = [];
    try { let top = 0; Object.values(V.seats).forEach(x => { const r = x.getBoundingClientRect(); if (r.bottom < window.innerHeight * .45) top = Math.max(top, r.bottom); }); const lt = n.parentNode.getBoundingClientRect().top; if (top) n.style.top = Math.round(top + 6 - lt) + 'px'; } catch (e) { }
    const seat = V.seats && V.seats[act.pid]; if (seat) { seat.classList.add('pulse'); setTimeout(() => seat.classList.remove('pulse'), 900); }
  }
  function fxResult() {
    if (!FXB) return; const L = (V.fxLines || []).filter(Boolean); V.fxLines = null;
    if (L.length) { $('.rs', FXB).textContent = L.slice(-2).join(' · '); FXB.classList.add('done'); }
  }
  function fxHide(now) { const n = FXB; FXB = null; V.fxLines = null; if (!n) return; if (now) n.remove(); else { n.classList.add('out'); setTimeout(() => n.remove(), 450); } }
  function floatTag(pid, text, cls) {
    const t = V.slots[pid] || V.seats[pid]; if (!t) return; const r = t.getBoundingClientRect(); const lay = U.layer(); const lr = lay.getBoundingClientRect();
    const n = el(`<div class="ftag ${cls || ''}" style="left:${r.left - lr.left + r.width / 2}px;top:${r.top - lr.top}px">${esc(text)}</div>`); lay.appendChild(n); setTimeout(() => n.remove(), 1500);
  }
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
  // ---- tempo limite das decisões (só online)
  const TL = { orderHand: 75, prepare: 20, attr: 25, special: 20, pickCards: 40, pickAttr: 20, chooseTarget: 20 };
  const tlOf = k => TL[k] || 25; U.TL = TL;
  const TM = { el: null, iv: null };
  function tmrStop() { clearInterval(TM.iv); TM.iv = null; if (TM.el) { TM.el.remove(); TM.el = null; } }
  function tmrStart(sec, o) {
    tmrStop(); o = o || {}; const host = $('#game'); if (!host) return;
    const n = el(`<div class="tmr${o.label ? ' passive' : ''}"><span class="tl"></span><b></b><i><u></u></i></div>`); host.append(n); TM.el = n;
    const end = Date.now() + sec * 1000; let last = -1; $('.tl', n).textContent = o.label || 'Seu tempo';
    const upd = () => {
      const left = Math.max(0, end - Date.now()), s = Math.ceil(left / 1000); $('b', n).textContent = s + 's'; $('u', n).style.transform = `scaleX(${left / (sec * 1000)})`; n.classList.toggle('low', s <= 8);
      if (!o.label && s <= 5 && s > 0 && s !== last) SND.play('tick'); last = s;
      if (left <= 0) { const cb = o.onEnd; tmrStop(); if (cb) cb(); }
    };
    upd(); TM.iv = setInterval(upd, 250);
  }
  function cancelPrompt() { const d = $('#dock'); if (d) { d.hidden = true; d.replaceChildren(); } $$('.order, .cover, .coach.modal').forEach(x => x.remove()); }
  // roda uma decisão humana com contagem regressiva; no fim do tempo fecha a caixa e devolve o resultado automático
  function timed(tl, run, fb) {
    return new Promise((res, rej) => {
      let done = false;
      tmrStart(tl, { onEnd: () => { if (done) return; done = true; cancelPrompt(); caption('Tempo esgotado: jogada automática.', true); let v; try { v = fb ? fb() : undefined; } catch (e) { console.error(e); } res(v); } });
      run().then(v => { if (done) return; done = true; tmrStop(); res(v); }, e => { if (done) return; done = true; tmrStop(); rej(e); });
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
      <button class="btn primary" data-a="c">Continuar</button><button class="btn" data-a="r">📖 Como jogar</button><button class="btn" data-a="o">⚙ Opções e sons</button>${V.online ? '' : '<button class="btn" data-a="n">↻ Reiniciar partida</button>'}<button class="btn" data-a="q">${V.online ? 'Sair da partida' : 'Abandonar partida'}</button></div>`);
    const m = U.modal(n); let sure = false, sureN = false;
    n.onclick = e => { const b = e.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a;
      if (a === 'n') { if (!sureN) { sureN = true; b.textContent = 'Toque de novo para confirmar'; } else { m.close(); U.rerollBotNames && U.rerollBotNames(lastCfg.players); U.startGame(lastCfg); } }
      else if (a === 'c') m.close(); else if (a === 'r') U.rules(); else if (a === 'o') U.options();
      else if (a === 'q') { if (!sure) { sure = true; b.textContent = 'Toque de novo para confirmar'; } else { m.close(); U.killRun(); $$('#layer > *').forEach(x => x.remove()); if (V.online) { U.onlineOff && U.onlineOff(); V.ctl.leave(); } else U.show('menu'); } } };
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
    const cw = Math.max(26, Math.floor(Math.min(W / need.w, H / need.h, 150)));
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
    $('.cgrid', w).append(...p.deck.map((id, i) => { const c = cardEl(id, { up: true, noanim: true, cw: 96, click: true }); const t = el(`<div class="tag" style="position:absolute;top:-8px;left:4px;z-index:3;background:#0b0c10;border:1px solid var(--line);border-radius:99px;padding:0 7px;font-size:11px;font-weight:900">${i + 1}</div>`); c.append(t); return c; }));
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
      V.init = initiator; V.win = {}; refresh();
      caption(`Disputa ${G.s.combats + 1} — ${nameOf(initiator)} inicia` + (round < 2 && V.humans > 0 ? ' · especiais liberam na Rodada 2' : '')); await sleep(350);
    },
    async prepare({ pid }) {
      const to = seatPrep(pid); const from = seatDeck(pid);
      SND.play('special'); await fly(from, to, { ms: 500, cw: 60 }); refresh(); caption(`${nameOf(pid)} prepara um especial…`); await sleep(250);
    },
    async swapCard({ pid, old, card, combat }) {
      const slot = V.slots[pid]; const oldEl = $('.card', slot);
      SND.play('special');
      if (oldEl) { oldEl.style.visibility = 'hidden'; await fly(slot, seatPrep(pid), { ms: 480, cw: V.cw }); oldEl.remove(); }
      refresh();
      const e = combat.entries.find(x => x.pid === pid);
      const c = cardEl(card, { stats: e.stats }); c.style.visibility = 'hidden'; slot.append(c);
      await fly(seatDeck(pid), slot, { ms: 420, ease: 'cubic-bezier(.2,.8,.3,1)' });
      c.style.visibility = ''; SND.play('place'); refresh(); caption(`${nameOf(pid)} preparou um especial e colocou outra carta.`); await sleep(250);
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
    async specialWindow({ stage }) {
      stage = stage || 'main'; V.win = V.win || {}; if (V.win[stage]) return; V.win[stage] = true;
      if (stage === 'ctrl') { banner('Controle de atributos', 'especiais antes de declarar', '#7dd3ff', 1400); caption('Janela de especiais de controle…'); }
      else { banner('Janela de especiais', 'decida em segredo', '#c58cff', 1400); caption('Janela de especiais…'); }
      await sleep(900);
    },
    async specialsFlip({ combat, acts, forced }) {
      const st = el(`<div class="stage"><div class="acts"></div></div>`);
      const box = $('.acts', st);
      acts.forEach((a, i) => {
        const sp = E.SPECIALS[CARDS[a.card].especial];
        const n = el(`<div class="act" style="--pc:${PCOL[a.pid]};animation-delay:${i * .18}s"><div class="own">${esc(nameOf(a.pid))}${forced || a.forced ? ' (forçado)' : ''}</div><div class="cb"></div><div class="sn">✦ ${esc(sp.nome)}</div><div class="stx">${esc(sp.texto)}</div></div>`);
        $('.cb', n).append(cardEl(a.card, { cw: Math.min(150, (window.innerWidth - 60) / Math.max(1, acts.length) - 20) }));
        box.append(n);
      });
      U.layer().appendChild(st); SND.play('special');
      await sleep(500); $$('.card', st).forEach(c => c.classList.add('up')); SND.play('specialFlip');
      const r = st.getBoundingClientRect(); FX.burst(r.width / 2, r.height / 2, { n: 70, speed: 8, colors: ['#e9dfc0', '#c58cff', '#fff'], life: 60 });
      await sleep(2300); st.remove();
      let strip = $('.strip'); if (!strip) { strip = el('<div class="strip"></div>'); $('.arenaWrap').append(strip); }
      acts.forEach(a => { const sp = E.SPECIALS[CARDS[a.card].especial]; strip.append(el(`<div class="chip" data-card="${a.card}" style="--pc:${PCOL[a.pid]}"><i></i>${esc(nameOf(a.pid))}: ${esc(sp.nome)}</div>`)); });
    },
    async effectStart({ act, spec }) {
      const chip = $(`.chip[data-card="${act.card}"]`); if (chip) chip.classList.add('run');
      caption(''); fxShow(act, spec); SND.play('special'); await sleep(850);
    },
    async effectEnd({ act }) {
      const chip = $(`.chip[data-card="${act.card}"]`); if (chip) chip.classList.remove('run');
      updateAll(); refresh(); fxResult(); await sleep(V.fxHold || 1300); fxHide();
    },
    async cancel({ card, target }) {
      const chip = $(`.chip[data-card="${card}"]`); if (chip) chip.classList.add('dead');
      SND.play('lose'); const s = V.slots[target]; s.classList.add('cancelx'); floatTag(target, 'Especial anulado', 'bad'); await sleep(1000); s.classList.remove('cancelx');
    },
    async extra({ pid, card }) {
      const e = entryOf(pid); await fly(seatDeck(pid), V.slots[pid], { ms: 500 }); SND.play('place'); if (e) updateSlot(e); refresh(); await sleep(250);
    },
    async steal({ from, to, card, zone, dzone }) {
      SND.play('steal'); await fly(zone === 'reserve' ? seatRes(from) : seatDeck(from), dzone === 'reserve' ? seatRes(to) : seatDeck(to), { ms: 600, cw: 60, arc: 40 }); refresh(); await sleep(150);
    },
    async discard({ pid }) {
      SND.play('blackhole'); await fly(seatDeck(pid), $('#bh'), { ms: 800, cw: 60, r1: 540, s1: .05, fade: true, ease: 'cubic-bezier(.6,0,.9,.5)' }); pulseBH(); await sleep(100);
    },
    async rescue({ pid, dzone }) {
      SND.play('steal'); await fly($('#bh'), dzone === 'reserve' ? seatRes(pid) : seatDeck(pid), { ms: 700, cw: 60, r0: 360, s0: .1, arc: 30 }); pulseBH(); await sleep(150);
    },
    async block({ pid }) {
      const s = V.slots[pid]; SND.play('shield'); if (s) { s.classList.add('cancelx'); } const seat = V.seats[pid]; if (seat) { const r = seat.getBoundingClientRect(); FX.burst(r.left + r.width / 2, r.top + r.height / 2, { n: 30, speed: 5, life: 40, colors: ['#8fd6ff', '#fff', '#4aa8ff'] }); }
      floatTag(pid, 'Bloqueado', 'good'); await sleep(900); if (s) s.classList.remove('cancelx');
    },
    async combatSwap({ swaps }) {
      SND.play('special');
      for (const sw of swaps) {
        const slot = V.slots[sw.pid], e = entryOf(sw.pid); if (!slot || !e) continue;
        const old = $('.card', slot); const c = cardEl(sw.card, { up: true, noanim: true, stats: e.stats });
        if (old) old.replaceWith(c); else slot.append(c);
        updateSlot(e); const r = slot.getBoundingClientRect(); FX.burst(r.left + r.width / 2, r.top + r.height / 2, { n: 30, speed: 5, life: 45 });
      }
      await sleep(900);
    },
    async banish({ pid, cards }) {
      const slot = V.slots[pid], card = $('.card', slot); SND.play('blackhole');
      if (card) { card.style.visibility = 'hidden'; await fly(slot, $('#bh'), { id: cards[0], stats: (entryOf(pid) || {}).stats, cw: V.cw, ms: 900, r1: 540, s1: .04, fade: true, ease: 'cubic-bezier(.6,0,.9,.5)' }); }
      const x = $('.xtra', slot); if (x) x.remove(); const b = $('.badge', slot); if (b) b.remove(); pulseBH(); await sleep(150);
    },
    async reorder({ pid }) { SND.play('deal'); const s = V.seats[pid]; if (s) { s.classList.add('pulse'); setTimeout(() => s.classList.remove('pulse'), 600); } await sleep(450); },
    async reserveSwap({ a, b }) {
      SND.play('steal'); await Promise.all([fly(seatRes(a), seatRes(b), { ms: 700, cw: 50, arc: 40 }), fly(seatRes(b), seatRes(a), { ms: 700, cw: 50, arc: -40 })]); refresh(); await sleep(120);
    },
    async rotate({ list }) {
      SND.play('steal'); await Promise.all(list.filter(x => x.to != null && x.to !== x.from).map(x => fly(seatRes(x.from), seatRes(x.to), { ms: 750, cw: 50, arc: 30 }))); refresh(); await sleep(120);
    },
    async peek({ pid, target, cards, title, hint }) {
      const p = G.p(pid); if (p.bot || (V.online && pid !== V.viewer)) return;
      await cover(p);
      const w = el(`<div><h2 style="color:var(--gold2)">${esc(title || 'Espionagem')}</h2><p class="hint">${esc(hint || `Próximas cartas do baralho de ${nameOf(target)} (topo → fundo). Só você vê isto.`)} Só você vê isto.</p><div class="cgrid"></div></div>`);
      $('.cgrid', w).append(...cards.map(id => cardEl(id, { up: true, noanim: true, cw: 110, click: true })));
      await waitClose(w);
    },
    async specialsDone({ claimed }) {
      const cl = {}; (claimed || []).forEach(x => { cl[x.card] = x.pid; });
      const strip = $('.strip'); if (strip) { const chips = $$('.chip', strip); SND.play('blackhole');
        await Promise.all(chips.map((c, i) => sleep(i * 150).then(() => cl[c.dataset.card] != null ? fly(c, seatDeck(cl[c.dataset.card]), { ms: 800, id: c.dataset.card, cw: 70, arc: 40 }) : fly(c, $('#bh'), { ms: 700, id: c.dataset.card, cw: 70, s1: .05, r1: 420, fade: true })))); strip.remove(); }
      pulseBH(); await sleep(150);
    },
    async resolved({ combat, result, moves }) {
      updateAll(); let tipId = null;
      if (result.type === 'tie' || result.type === 'none') {
        banner('Empate', 'As cartas voltam aos donos', '#a9a595', 1800); SND.play('tick'); caption('Ninguém vence esta disputa.'); await sleep(1700);
      } else {
        const w = result.winnerPid, slot = V.slots[w], atk = result.type === 'attack';
        combat.entries.forEach(e => { if (e.pid === w) slot.classList.add('winner'); else if (!e.withdrawn) V.slots[e.pid].classList.add('loser'); });
        SND.play('win'); setTimeout(() => SND.play(atk ? 'slash' : 'shield'), 150);
        slot.append(el(atk ? '<div class="fx-slash"></div>' : '<div class="fx-shield"></div>'));
        const r = slot.getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        FX.burst(cx, cy, { n: 80, speed: 9, life: 70, up: 2 });
        setTimeout(() => FX.burst(cx, cy, { n: 40, speed: 5, life: 60, colors: atk ? ['#ff7a45', '#fff', '#e9dfc0'] : ['#8fd6ff', '#fff', '#4aa8ff'] }), 300);
        tipId = U.tip ? ['reveal', atk ? 'capture' : 'bh'].find(x => !U.tipSeen(x)) : null;
        const tb = result.tb, tbTxt = tb ? `Empate em ${tb.top} → desempate pela ${tb.stage === 1 ? 'soma dos 4 atributos' : 'soma Ataque + Inteligência'}: ${tb.list.map(x => nameOf(x.pid) + ' ' + x.v).join(' × ')}` : '';
        banner(`${nameOf(w)} vence!`, tb ? tbTxt : `${atk ? 'Ataque' : 'Defesa'} · ${ATT[result.attr].nome} ${result.value}`, atk ? '#ffd25f' : '#8fd6ff', tb ? 3600 : 2100);
        caption(tb ? tbTxt + '.' : `${nameOf(w)} vence ${atk ? 'atacando' : 'defendendo'} com ${ATT[result.attr].nome} ${result.value}.`, true);
        await sleep(tb ? 3400 : 2100);
      }
      if (tipId && !V.online) await U.tip(tipId); // offline: congela a mesa e explica antes das cartas se moverem
      // movimentação das cartas
      const jobs = moves.map((m, i) => sleep(i * 220).then(async () => {
        const src = V.slots[m.from], card = $('.card', src); if (!card) return;
        const e = entryOf(m.from); const dest = m.to === 'bh' ? $('#bh') : m.zone === 'reserve' ? seatRes(m.to) : seatDeck(m.to);
        card.style.visibility = 'hidden';
        if (m.to === 'bh') { SND.play('blackhole'); await fly(src, dest, { id: m.cards[0], stats: e && e.stats, cw: V.cw, ms: 1000, r1: 540, s1: .04, fade: true, ease: 'cubic-bezier(.6,0,.9,.5)' }); pulseBH(); }
        else { if (m.from !== m.to) SND.play('capture'); await fly(src, dest, { id: m.cards[0], stats: e && e.stats, cw: V.cw, ms: 800, arc: 30 }); }
      }));
      await Promise.all(jobs); refresh(); await sleep(250);
      if (tipId && V.online) U.tip(tipId); // online: só depois das animações, sem travar a mesa
    },
    async combatEnd() {
      Object.values(V.slots).forEach(s => { s.replaceChildren(); s.className = s.className.replace(/\b(has|pending|winner|loser|withdrawn|tremble|charging|cancelx)\b/g, '').replace(/\s+/g, ' ').trim(); });
      V.combat = null; refresh(); await sleep(250);
    },
    async refill({ pid, cards }) {
      SND.play('refill'); caption(`${nameOf(pid)} compra ${cards.length} carta(s) da reserva.`);
      for (let i = 0; i < cards.length; i++) { fly(seatRes(pid), seatDeck(pid), { ms: 450, cw: 50 }); await sleep(70); }
      await sleep(450); refresh();
      if (U.tip && pid === V.viewer) { if (V.online) U.tip('refill'); else await U.tip('refill'); }
    },
    async eliminated({ pid }) {
      refresh(); SND.play('elim'); banner(`${nameOf(pid)} eliminado`, 'sem cartas', '#ff6b6b', 2000); await sleep(1700);
    },
    async round({ round }) { refresh(); SND.play('round'); banner(`Rodada ${round}`, round === 2 && V.humans > 0 ? 'Especiais liberados' : null, null, 1500); await sleep(1000); if (U.tip && round === 2) { if (V.online) U.tip('round2'); else await U.tip('round2'); } },
    async end({ winner }) {
      refresh(); const s = G.s; const human = winner != null && (V.online ? winner === V.viewer : !G.p(winner).bot); const anyHuman = V.humans > 0;
      SND.play(winner == null ? 'defeat' : (human || !anyHuman) ? 'victory' : 'defeat');
      if (winner != null && (human || !anyHuman)) FX.confetti();
      const w = winner != null ? G.p(winner) : null;
      const n = el(`<div class="modal"><div class="box"><div class="final">
        ${w ? `<div class="avatar" style="--pc:${PCOL[w.pid]};width:84px;height:84px;font-size:40px">${esc(w.name[0].toUpperCase())}</div>` : ''}
        <h1>${w ? esc(w.name) + ' vence!' : 'Empate!'}</h1>
        <div class="hint">${s.byLimit ? 'Limite de disputas atingido: vence quem tem mais cartas.' : w ? 'Todos os adversários foram eliminados.' : ''}</div>
        <div class="stats"><div><b>${s.combats}</b>disputas</div><div><b>${s.round}</b>rodadas</div><div><b>${s.bh.length}</b>no Buraco Negro</div></div>
        ${unlockHTML()}
        <div class="row" style="justify-content:center">${V.online ? (V.ctl.again ? '<button class="btn primary" data-a="again">Nova partida (mesmos jogadores)</button>' : '<div class="hint" style="width:100%;text-align:center">Aguardando o anfitrião começar outra partida…</div>') : '<button class="btn primary" data-a="again">Jogar de novo</button>'}<button class="btn" data-a="menu">${V.online ? 'Sair da sala' : 'Menu'}</button></div></div></div></div>`);
      n.onclick = e => { const b = e.target.closest('[data-a]'); if (!b) return; SND.play('click'); if (V.online) { if (b.dataset.a === 'again') { n.remove(); V.ctl.again(); } else { n.remove(); U.killRun(); U.onlineOff && U.onlineOff(); V.ctl.leave(); } return; } n.remove(); if (b.dataset.a === 'again') { U.rerollBotNames && U.rerollBotNames(lastCfg.players); U.startGame(lastCfg); } else U.show('menu'); };
      U.layer().appendChild(n);
    },
  };

  function unlockHTML() {
    const r = U.lastRec; U.lastRec = null; if (!r) return ''; const I = U.ICO || {}; const L = [];
    if (r.daily) L.push(`<div class="u">${I.medal || ''}Desafio do dia concluído</div>`);
    (r.ach || []).forEach(a => L.push(`<div class="u">${I.medal || ''}Conquista: ${esc(a.nome)}</div>`));
    return L.length ? `<div class="unlocks">${L.join('')}</div>` : '';
  }
  function newRec(ctx) {
    U.lastRec = null; const S = window.DSSTATS; U.rec = S ? S.recorder(ctx) : null;
  }

  // ---------------------------------------------------------------- decisões humanas
  function makeIO() {
    return {
      notify: async (type, data) => { if (TM.el && TM.el.classList.contains('passive')) tmrStop(); if (U.rec) { try { const r = U.rec.ev(type, data, G); if (r) U.lastRec = r; } catch (e) { console.error('rec', e); } } const f = H[type]; if (f) { try { await f(data || {}); } catch (e) { if (e === 'abort') throw e; console.error('UI', type, e); } } },
      log: (text, cls) => { V.logs.push({ text, cls }); if (V.fxLines && cls === 'efeito') V.fxLines.push(text); if (cls !== 'prep' && !(FXB && cls === 'efeito')) caption(text, cls === 'vit'); const d = $('.logdrawer .lg'); if (d) d.append(el(`<p class="${cls}">${esc(text)}</p>`)); },
      orderHand: (p, hand) => orderHand(p, hand),
      async prepare(p, top) {
        const c = CARDS[top], sp = E.SPECIALS[c.especial];
        if (V.noPrep[p.pid]) return false;
        await cover(p);
        const node = el(`<div class="sheet"><div class="cardbox"></div><div class="txt"><h3>${esc(p.name)}: preparar especial?</h3>
          <div class="hint">Carta do topo: <b>${esc(c.nome)}</b><br>✦ <b>${esc(sp.nome)}</b> — ${esc(sp.texto)}</div>
          ${sp.stub ? '<div class="hint">⚠ Efeito ainda não implementado: ao virar, nada acontece e a carta vai ao Buraco Negro.</div>' : ''}
          <div class="row"><button class="btn primary sm" data-v="1">Preparar especial</button><button class="btn sm" data-v="0">Jogar normalmente</button><button class="btn ghost sm" data-v="n">Não perguntar mais</button></div></div></div>`);
        $('.cardbox', node).append(cardEl(top, { up: true, noanim: true, cw: Math.min(96, V.cw || 96) }));
        const v = await ask(node, '[data-v]'); if (v === 'n') V.noPrep[p.pid] = true; return v === '1';
      },
      async attr(p, entry, options, combat, canPrep) {
        await cover(p);
        const init = combat.initiator === p.pid; const ia = combat.entries.find(e => e.pid === combat.initiator).attr;
        if (U.tip) await U.tip(init ? 'attr_init' : 'attr_follow');
        const lst = options.map(a => '<b>' + ATT[a].nome + '</b>').join(options.length === 2 ? ' e ' : ', ');
        const txt = combat.ctl && combat.ctl.universal ? `Atributo universal: todos disputam em ${lst}.`
          : init ? (options.length < 4 ? `Você inicia, mas um especial limitou suas opções: ${lst}.` : 'Você inicia: escolha <b>qualquer</b> atributo.')
          : options.length === 1 ? `${esc(nameOf(combat.initiator))} iniciou em <b>${ATT[ia].nome}</b>. Por causa de um especial, você deve usar ${lst}.`
          : `${esc(nameOf(combat.initiator))} iniciou em <b>${ATT[ia].nome}</b>. Escolha entre ${lst} — em segredo.`;
        const node = el(`<div class="sheet pick1"><div class="cardbox"></div><div class="txt"><h3>${esc(p.name)}</h3><div class="hint">${txt}</div></div>
          <div class="attrs">${options.map(a => `<button class="attrbtn" data-a="${a}" data-v="${a}">${ICON[a]}<span><b>${ATT[a].nome}</b><small>${ATT[a].tipo}</small></span><span class="v">${entry.stats[a]}</span></button>`).join('')}</div>
          ${spLine(entry.card, combat, canPrep)}</div>`);
        $('.cardbox', node).append(cardEl(entry.card, { up: true, noanim: true, cw: Math.min(96, V.cw || 96), stats: entry.stats }));
        return ask(node, '.attrbtn, .prepbtn');
      },
      async special(p, usable, combat, ctx, stage) {
        await cover(p); if (U.tip) await U.tip('special');
        const T = stage === 'ctrl' ? ['virar um especial de controle?', '']
          : stage === 'second' ? ['virar também um segundo especial?', '']
          : ['virar um especial?', ''];
        const node = el(`<div class="sheet"><div class="txt" style="flex:1 1 100%"><h3>${esc(p.name)}: ${T[0]}</h3></div></div>`);
        usable.forEach(id => {
          const sp = E.SPECIALS[CARDS[id].especial];
          const pk = el(`<div class="specpick"><div class="cb"></div><div class="spx"><div class="spn">✦ ${esc(sp.nome)}</div><div class="spt">${esc(sp.texto)}</div><button class="btn primary sm" data-v="${id}">Virar</button></div></div>`);
          $('.cb', pk).append(cardEl(id, { up: true, noanim: true, cw: 72 })); node.append(pk);
        });
        node.append(el('<button class="btn" data-v="none">Manter fechado</button>'));
        const v = await ask(node, '[data-v]'); return v === 'none' ? null : v;
      },
      async pickCards(p, spec) {
        await cover(p);
        return new Promise((res, rej) => {
          const run = U.run; run.rej.add(rej); const min = spec.min, max = spec.max; let sel = [], last = spec.cards[0];
          const ov = el(`<div class="order pick"><div><h2 style="color:var(--gold2)">${esc(p.name)}: ${esc(spec.title)}</h2>
            <div class="hint">${esc(spec.hint || '')} ${spec.ordered && !/Toque/.test(spec.hint || '') ? 'Toque nas cartas na ordem desejada (1 = primeira). ' : ''}<b class="pcnt"></b></div></div>
            <div class="grid"></div><div class="info"></div>
            <div class="row" style="justify-content:center">${max > 1 || min === 0 ? '<button class="btn sm" data-a="clr">Limpar</button>' : ''}<button class="btn primary" data-a="ok">Confirmar ▶</button></div></div>`);
          const W = window.innerWidth - 32; let cw = Math.floor((W - 6 * 10) / 6); if (cw < 70) cw = Math.floor((W - 3 * 10) / 3); cw = Math.max(64, Math.min(104, cw));
          function info() { if (spec.blind) { $('.info', ov).textContent = 'Cartas viradas para baixo: escolha pela posição no baralho (1ª = topo).'; return; } const c = CARDS[last], sp = E.SPECIALS[c.especial]; $('.info', ov).innerHTML = `<b>${esc(c.nome)}</b> · ${AIDS.map(a => `<span class="ico" data-a="${a}" title="${ATT[a].nome}">${ICON[a]}${c.stats[a]}</span>`).join(' ')}<br>✦ <b>${esc(sp.nome)}</b> — ${esc(sp.texto)}`; }
          function draw() {
            const g = $('.grid', ov);
            g.replaceChildren(...spec.cards.map(id => {
              const i = sel.indexOf(id); const w = el(`<div class="oc${i >= 0 ? ' sel' : ''}">${i >= 0 ? `<div class="no">${spec.ordered ? i + 1 : '✓'}</div>` : ''}</div>`);
              w.append(cardEl(id, { up: !spec.blind, noanim: true, cw }));
              if (spec.blind) w.append(el(`<div class="pos" style="position:absolute;left:6px;bottom:6px;background:#000b;color:var(--gold2);border-radius:10px;padding:1px 8px;font-weight:800;font-size:12px">${spec.cards.indexOf(id) + 1}ª</div>`));
              w.onclick = () => { SND.play('tick'); last = id; if (i >= 0) sel.splice(i, 1); else if (max === 1) sel = [id]; else if (sel.length < max) sel.push(id); draw(); };
              return w;
            }));
            $('.pcnt', ov).textContent = `Selecionadas: ${sel.length}${max > 1 ? ' de ' + max : ''}${min > 0 ? ' (mín. ' + min + ')' : ''}`;
            $('[data-a=ok]', ov).disabled = sel.length < min || sel.length > max; info();
          }
          ov.onclick = e => { const b = e.target.closest('[data-a]'); if (!b || b.disabled) return; SND.play('click'); if (b.dataset.a === 'clr') { sel = []; draw(); } else if (b.dataset.a === 'ok') { run.rej.delete(rej); ov.remove(); res(sel.slice()); } };
          $('#game').append(ov); draw();
        });
      },
      async pickAttr(p, spec) {
        await cover(p);
        const node = el(`<div class="sheet"><div class="txt"><h3>${esc(p.name)}</h3><div class="hint"><b>${esc(spec.title)}</b><br>${esc(spec.hint || '')}</div>
          <div class="attrs">${spec.options.map(a => `<button class="attrbtn" data-a="${a}" data-v="${a}">${ICON[a]}<span><b>${ATT[a].nome}</b><small>${ATT[a].tipo}</small></span></button>`).join('')}</div></div></div>`);
        return ask(node, '.attrbtn');
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
          <div class="hint"><b>Arraste</b> as cartas para reordenar; toque numa carta para ver os detalhes. A carta <b>nº 1</b> é a primeira a entrar em disputa.</div></div>
          <div class="grid"></div><div class="info"></div>
          <div class="row" style="justify-content:center"><button class="btn sm" data-a="best">Melhores primeiro</button><button class="btn sm" data-a="mix">Embaralhar</button></div>
          <div class="row" style="justify-content:center"><button class="btn primary" data-a="ok">Confirmar ordem ▶</button></div></div>`);
        const W = window.innerWidth - 32;
        let cw = Math.floor((W - 6 * 10) / 7); if (cw < 70) cw = Math.floor((W - 3 * 10) / 4); cw = Math.max(64, Math.min(112, cw));
        function renum() { $$('.oc', $('.grid', ov)).forEach((n, k) => { $('.no', n).textContent = k === 0 ? '1 · TOPO' : k + 1; }); }
        function dragStart(ev, w, i0) {
          if (ev.button > 0) return; ev.preventDefault();
          const grid = $('.grid', ov), sx = ev.clientX, sy = ev.clientY; let moving = false, ghost = null;
          const mv = e => {
            if (!moving) { if (Math.hypot(e.clientX - sx, e.clientY - sy) < 8) return; moving = true; w.classList.add('drag'); SND.play('tick');
              ghost = el('<div class="ghost"></div>'); ghost.append(cardEl(w.dataset.id, { up: true, noanim: true, cw })); ov.append(ghost); }
            ghost.style.left = e.clientX + 'px'; ghost.style.top = e.clientY + 'px';
            const nodes = $$('.oc', grid); let best = null, bd = 1e9;
            nodes.forEach(n => { if (n === w) return; const r = n.getBoundingClientRect(); const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)); if (d < bd) { bd = d; best = n; } });
            if (best && bd < cw * 0.9) { if (nodes.indexOf(w) < nodes.indexOf(best)) best.after(w); else best.before(w); renum(); }
          };
          const up = e => {
            window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
            if (ghost) ghost.remove();
            if (moving) { arr = $$('.oc', grid).map(n => n.dataset.id); last = arr.indexOf(w.dataset.id); sel = last; SND.play('place'); }
            else { SND.play('tick'); last = i0; sel = sel === i0 ? -1 : i0; }
            draw();
          };
          window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
        }
        function draw() {
          const g = $('.grid', ov); g.replaceChildren(...arr.map((id, i) => {
            const w = el(`<div class="oc${sel === i ? ' sel' : ''}"><div class="no">${i === 0 ? '1 · TOPO' : i + 1}</div></div>`);
            w.dataset.id = id; w.append(cardEl(id, { up: true, noanim: true, cw })); w.addEventListener('pointerdown', ev => dragStart(ev, w, i)); return w;
          }));
          const id = arr[last], c = CARDS[id], sp = E.SPECIALS[c.especial];
          $('.info', ov).innerHTML = `<b>${esc(c.nome)}</b> · ${AIDS.map(a => `<span class="ico" data-a="${a}" title="${ATT[a].nome}">${ICON[a]}${c.stats[a]}</span>`).join(' ')}<br>✦ <b>${esc(sp.nome)}</b> — ${esc(sp.texto)}`;
        }
        ov.onclick = e => {
          const b = e.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a; SND.play('click');
          if (a === 'best') { arr.sort((x, y) => E.sum4(CARDS[y].stats) - E.sum4(CARDS[x].stats)); sel = -1; }
          else if (a === 'mix') { arr.sort(() => Math.random() - .5); sel = -1; }
          else if (a === 'ok') { run.rej.delete(rej); ov.remove(); return res(arr); }
          draw();
        };
        $('#game').append(ov); draw(); if (U.tip) U.tip('order');
      });
    })();
  }

  // ---------------------------------------------------------------- iniciar
  U.startGame = async function (cfg) {
    lastCfg = cfg; SND.init(); U.killRun(); U.newRun(); $$('#layer > *').forEach(x => x.remove());
    if (!FX.cv) FX.init();
    V = { n: cfg.players.length, humans: cfg.players.filter(p => !p.bot).length, viewer: Math.max(0, cfg.players.findIndex(p => !p.bot)), noPrep: {}, seats: {}, slots: {}, pos: {}, combat: null, logs: [], init: null, muted: false };
    U.show('game'); shell();
    newRec({ viewer: V.humans ? V.viewer : -1, online: false, humans: V.humans, n: V.n, diff: cfg.difficulty, per: cfg.perPlayer, sf: cfg.specialsFrom, shared: true });
    G = new E.Game({ players: cfg.players, perPlayer: cfg.perPlayer, difficulty: cfg.difficulty, specialsFrom: cfg.specialsFrom, io: makeIO() });
    U.game = G;
    try { await G.run(); } catch (e) { if (e !== 'abort') { console.error(e); caption('Erro: ' + (e && e.message || e)); } }
  };

  // ---------------------------------------------------------------- online (anfitrião roda o motor; convidados espelham)
  function plain(v, d) {
    d = d || 0; if (v == null || typeof v === 'function') return v === undefined ? undefined : (typeof v === 'function' ? undefined : v);
    if (typeof v !== 'object') return v; if (d > 4) return undefined;
    if (v instanceof Set) return Array.from(v).map(x => plain(x, d + 1));
    if (Array.isArray(v)) return v.map(x => plain(x, d + 1));
    const o = {}; for (const k in v) { if (k === 'mods' || k === 'g' || k === 'ctx' || k === 'combat') continue; const r = plain(v[k], d + 1); if (r !== undefined) o[k] = r; } return o;
  }
  U.plain = plain;

  U.startOnline = async function (ctl) {
    lastCfg = null; SND.init(); U.killRun(); U.newRun(); U.onlineOff && U.onlineOff(); $$('#layer > *').forEach(x => x.remove());
    if (!FX.cv) FX.init();
    const seats = ctl.seats, host = ctl.role === 'host', link = ctl.link, cfg = ctl.cfg;
    V = { n: seats.length, humans: 1, online: true, ctl, viewer: ctl.viewer, noPrep: {}, seats: {}, slots: {}, pos: {}, combat: null, logs: [], init: null, muted: false };
    U.show('game'); shell();
    newRec({ viewer: ctl.viewer, online: true, humans: seats.filter(s => !s.bot).length, n: seats.length, diff: cfg.diff, per: cfg.per, sf: cfg.sf, shared: host });
    const local = makeIO(), off = [], pending = new Map(); let seq = 0, closed = false;
    U.onlineOff = () => { closed = true; off.forEach(f => { try { f(); } catch (e) { } }); pending.forEach(q => q.finish(undefined)); pending.clear(); };
    const send = (o, to) => { if (!closed) link.send('ev', o, to).catch(() => { }); };
    const leaveNow = (msg) => { U.killRun(); U.onlineOff(); const n = el(`<div class="modal"><div class="box"><div class="final"><h1>${esc(msg)}</h1><div class="row" style="justify-content:center"><button class="btn primary">Voltar ao menu</button></div></div></div></div>`); $('button', n).onclick = () => { n.remove(); V.ctl.leave(); }; U.layer().appendChild(n); };

    if (host) {
      let combatOn = false, initAnn = false, revealed = false;
      const serCombat = c => c ? ({ initiator: c.initiator, order: c.order, specialsAllowed: c.specialsAllowed, ctl: { universal: !!(c.ctl && c.ctl.universal) },
        entries: c.entries.map(e => ({ pid: e.pid, card: e.card, stats: e.stats, bonus: e.bonus, extra: e.extra, attr: (revealed || (initAnn && e.pid === c.initiator)) ? e.attr : null, withdrawn: !!e.withdrawn, gone: !!e.gone })) }) : null;
      const serEvent = (type, data) => {
        const o = {}; for (const k in data) { const v = data[k];
          if (k === 'combat') o.combat = serCombat(v); else if (k === 'usable' || k === 'ctx') continue;
          else if (k === 'act') o.act = { pid: v.pid, card: v.card, forced: !!v.forced };
          else if (k === 'acts') o.acts = v.map(a => ({ pid: a.pid, card: a.card, forced: !!a.forced }));
          else if (k === 'spec') o.spec = { nome: v.nome, texto: v.texto };
          else { const r = plain(v); if (r !== undefined) o[k] = r; } }
        if (type === 'prepare') delete o.card; return o;
      };
      const state = () => ({ players: G.s.players.map(p => ({ pid: p.pid, name: p.name, bot: p.bot, avatar: p.avatar, alive: p.alive, deck: p.deck.slice(), reserve: p.reserve.slice(), prepared: p.prepared.slice() })),
        bh: G.s.bh.map(x => x.kind === 'normal' ? x.id : x.id + ':' + x.kind), round: G.s.round, combats: G.s.combats, initiator: G.s.initiator, over: G.s.over, winner: G.s.winner, byLimit: G.s.byLimit });
      let logq = [], flushing = false;
      let askSeq = 0;
      const fbOf = (kind, p, a) => kind === 'orderHand' ? G.botOrderHand(a[0]) : (G['bot_' + kind] ? G['bot_' + kind](p, ...a) : undefined);
      const remoteAsk = (p, kind, args, fb) => {
        const peer = seats[p.pid].peer; if (!peer || closed) return fb();
        const id = ++askSeq, tl = tlOf(kind); send({ n: ++seq, t: 'waiting', pid: p.pid, tl }); caption(`Aguardando ${p.name}…`); tmrStart(tl + 2, { label: p.name });
        return new Promise(res => {
          let done = false, iv, to;
          const finish = v => { if (done) return; done = true; clearInterval(iv); clearTimeout(to); pending.delete(id); tmrStop(); res(v); };
          pending.set(id, { peer, pid: p.pid, finish: v => finish(v === undefined ? fb() : v) });
          const msg = { id, pid: p.pid, kind, args, tl }; const go = () => link.send('ask', msg, peer).catch(() => { });
          go(); iv = setInterval(go, 7000); to = setTimeout(() => { G.log(`${p.name} demorou demais: jogada automática.`, 'efeito'); finish(fb()); }, (tl + 6) * 1000);
        });
      };
      off.push(link.on('ans', (d, m) => { const q = pending.get(d.id); if (q && q.peer === m.peer) q.finish(d.v == null ? undefined : d.v); }));
      const wrap = (kind, mk) => async (p, ...a) => {
        const peer = seats[p.pid].peer;
        if (!peer || peer === link.me) { send({ n: ++seq, t: 'waiting', pid: p.pid, tl: tlOf(kind) }); return timed(tlOf(kind), () => local[kind](p, ...a), () => fbOf(kind, p, a)); }
        return remoteAsk(p, kind, mk(...a), () => fbOf(kind, p, a));
      };
      const io = {
        notify: async (type, data) => {
          if (type === 'combatStart') { combatOn = true; initAnn = false; revealed = false; } else if (type === 'initiatorAttr') initAnn = true; else if (type === 'reveal') revealed = true;
          const o = { n: ++seq, t: type, d: serEvent(type, data || {}), st: state() }; if (combatOn && G.combat && type !== 'combatEnd') o.cb = serCombat(G.combat); else if (type === 'combatEnd') o.cb = null;
          let skip = false, to; if (type === 'peek') { to = seats[data.pid] && seats[data.pid].peer; if (!to || to === link.me) skip = true; }
          if (!skip) send(o, to);
          if (type === 'combatEnd') combatOn = false;
          return local.notify(type, data);
        },
        log: (text, cls) => { local.log(text, cls); logq.push([text, cls || '']); if (!flushing) { flushing = true; queueMicrotask(() => { flushing = false; send({ n: ++seq, t: 'log', lg: logq.splice(0) }); }); } },
        orderHand: wrap('orderHand', hand => [hand]),
        prepare: wrap('prepare', top => [top]),
        attr: wrap('attr', (entry, options, combat, canPrep) => [{ card: entry.card, stats: entry.stats }, options, serCombat(combat), canPrep]),
        special: wrap('special', (usable, combat, ctx, stage) => [usable, serCombat(combat), null, stage]),
        pickCards: wrap('pickCards', spec => [plain(spec)]),
        pickAttr: wrap('pickAttr', spec => [plain(spec)]),
        chooseTarget: wrap('chooseTarget', (cands, label) => [cands, label]),
      };
      const players = seats.map((s, i) => ({ name: s.name, bot: s.bot, avatar: i }));
      G = new E.Game({ players, perPlayer: cfg.per, difficulty: cfg.diff, specialsFrom: cfg.sf, seed: cfg.seed, io });
      U.game = G;
      off.push(link.onPeers(ch => ch.left.forEach(pe => {
        const i = seats.findIndex(s => s.peer === pe.peer); if (i < 0 || !G.p(i) || G.p(i).bot) return;
        G.p(i).bot = true; G.log(`${G.p(i).name} desconectou. Um bot assumiu o lugar.`, 'efeito');
        pending.forEach(q => { if (q.peer === pe.peer) q.finish(undefined); });
      })));
      try { await G.run(); } catch (e) { if (e !== 'abort') { console.error(e); caption('Erro: ' + (e && e.message || e)); } }
      return;
    }

    // ----- convidado: espelha o estado e executa as decisões pedidas
    G = { cfg: { specialsFrom: cfg.sf }, logs: [], s: { players: seats.map((s, i) => ({ pid: i, name: s.name, bot: s.bot, avatar: i, alive: true, deck: [], reserve: [], prepared: [] })), bh: [], round: 1, combats: 0, initiator: 0, over: false, winner: null },
      p(pid) { return this.s.players[pid]; }, alive() { return this.s.players.filter(p => p.alive).map(p => p.pid); } };
    U.game = G;
    const applyState = st => { G.s.players = st.players; G.s.bh = st.bh.map(x => { const i = x.indexOf(':'); return i < 0 ? { id: x, kind: 'normal' } : { id: x.slice(0, i), kind: x.slice(i + 1) }; }); ['round', 'combats', 'initiator', 'over', 'winner', 'byLimit'].forEach(k => { G.s[k] = st[k]; }); };
    let last = 0, queue = Promise.resolve(); const answered = new Map(), inflight = new Set();
    const enqueue = fn => { queue = queue.then(fn).catch(e => { if (e !== 'abort') console.error('online', e); }); };
    off.push(link.on('ev', (m, msg) => {
      if (msg.peer !== ctl.hostPeer || m.n <= last) return; last = m.n;
      enqueue(async () => {
        if (m.st) applyState(m.st); if (m.cb !== undefined) V.combat = m.cb;
        if (m.t === 'log') { m.lg.forEach(([t, c]) => local.log(t, c)); return; }
        if (m.t === 'waiting') { const p = G.p(m.pid); if (p) { caption(m.pid === V.viewer ? 'Sua vez de decidir.' : `Aguardando ${p.name}…`); if (m.pid !== V.viewer && m.tl) tmrStart(m.tl + 2, { label: p.name }); } return; }
        await local.notify(m.t, m.d || {});
      });
    }));
    off.push(link.on('ask', (m, msg) => {
      if (msg.peer !== ctl.hostPeer) return;
      if (answered.has(m.id)) { link.send('ans', { id: m.id, v: answered.get(m.id) }).catch(() => { }); return; }
      if (inflight.has(m.id)) return; inflight.add(m.id);
      enqueue(async () => {
        let v; try { v = await timed(m.tl || tlOf(m.kind), () => local[m.kind](G.p(m.pid), ...m.args), null); } catch (e) { if (e === 'abort') return; console.error(e); }
        const out = v === undefined ? null : v; answered.set(m.id, out); inflight.delete(m.id);
        link.send('ans', { id: m.id, v: out }).catch(() => { });
      });
    }));
    off.push(link.onPeers(() => { if (!closed && !link.peers().some(p => p.peer === ctl.hostPeer) && !G.s.over) leaveNow('O anfitrião saiu da partida.'); }));
  };

  // toque numa carta da mesa: abre a carta grande (a minha, ou as viradas dos outros), com os valores já alterados por efeitos
  document.addEventListener('click', e => {
    const gm = $('#game'); if (!V || !gm || gm.hidden || !G) return;
    const card = e.target.closest && e.target.closest('#game .slot .card, #game .seat .prepslot .card, #game .flyghost'); if (!card || card.classList.contains('flyghost') || card.closest('.modal, .order')) return;
    const slot = card.closest('.slot'), seat = card.closest('.seat'); let pid = -1;
    if (slot) pid = +Object.keys(V.slots).find(k => V.slots[k] === slot); else if (seat) pid = +Object.keys(V.seats).find(k => V.seats[k] === seat);
    if (!(card.classList.contains('up') || pid === V.viewer)) return; // cartas viradas para baixo dos outros continuam secretas
    const id = card.dataset.id; if (!id || !CARDS[id]) return;
    const ents = (V.combat && V.combat.entries || []).filter(x => x.card && (V.slots[x.pid] && $('.card', V.slots[x.pid]) && ($('.card', V.slots[x.pid]).classList.contains('up') || x.pid === V.viewer)));
    const list = ents.map(x => x.card), stats = {}; ents.forEach(x => { if (x.stats) stats[x.card] = x.stats; });
    e.stopPropagation(); SND.init(); U.zoom(id, { list: list.length > 1 && list.includes(id) ? list : null, stats });
  });

  U.dbg = () => ({ G, V });
})();
