/* Dimensions Stacks — mesa de jogo: tabuleiro, animações, efeitos e ponte com o motor (io). */
(function () {
  'use strict';
  const U = window.DSUI;
  const { $, $$, el, esc, CARDS, ATT, AIDS, E, SND, S, cardEl, updateCard, ICON, PCOL } = U;
  const sleep = (ms, min) => U.sleep(ms, min);   // min = tempo mínimo em que o passo fica na tela mesmo com toque para pular
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
        this.ps.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (o.up || 0), life: 0, max: (o.life || 55) * (.6 + Math.random() * .8), s: (o.size || 3.2) * .5 * (.5 + Math.random()), c: cols[i % cols.length], g: o.g == null ? .12 : o.g, sq: o.sq });
      }
      if (!this.on) { this.on = true; requestAnimationFrame(() => this.loop()); }
    },
    confetti() {
      if (U.S.reduce) return;
      for (let k = 0; k < 8; k++) setTimeout(() => this.burst(Math.random() * window.innerWidth, -10, { n: 75, speed: 4.2, up: -3, g: .075, life: 170, size: 2, colors: ['#e9dfc0', '#6cb6ff', '#ff7ab0', '#86f5a4', '#c58cff', '#ffd25f'] }), k * 220);
    },
    loop() {
      const x = this.x; x.clearRect(0, 0, this.cv.width, this.cv.height);
      this.ps = this.ps.filter(p => p.life < p.max); if (this.ps.length > 900) this.ps.splice(0, this.ps.length - 900);
      const B = {};   // desenho em lote: uma pincelada por cor e faixa de transparência (leve para celulares)
      for (const p of this.ps) {
        p.life++; p.x += p.vx; p.y += p.vy; p.vy += p.g; p.vx *= .985;
        const a = Math.max(0, 1 - p.life / p.max);
        if (p.sq) { x.globalAlpha = a; x.fillStyle = p.c; x.fillRect(p.x, p.y, p.s, p.s * 1.6); continue; }
        const k = p.c + '|' + Math.ceil(a * 4); (B[k] = B[k] || []).push(p);
      }
      for (const k in B) { const L = B[k]; x.globalAlpha = Math.ceil(+k.split('|')[1]) / 4 * .95; x.fillStyle = k.split('|')[0]; x.beginPath(); for (const p of L) { x.moveTo(p.x + p.s, p.y); x.arc(p.x, p.y, p.s, 0, 6.3); } x.fill(); }
      x.globalAlpha = 1;
      if (this.ps.length) requestAnimationFrame(() => this.loop()); else this.on = false;
    },
  };

  U.FX = FX;
  // ---------------------------------------------------------------- helpers visuais
  function banner(title, sub, color, ms) {
    try { U.layer().querySelectorAll('.banner').forEach(x => x.remove()); } catch (e) { }
    SND.play('banner');
    const b = el(`<div class="banner" style="--d:${((ms || 1800) * S.k) / 1000}s;${color ? `--bc:${color}` : ''}"><b>${esc(title)}</b>${sub ? `<span>${esc(sub)}</span>` : ''}</div>`);
    U.layer().appendChild(b); setTimeout(() => b.remove(), (ms || 1800) * S.k + 100);
  }
  // dicas completas só nas primeiras 5 partidas do perfil; depois o texto fica reduzido
  function novice() { try { return !window.DSSTATS || window.DSSTATS.profile().t.g < 5; } catch (e) { return true; } }
  function caption(t, flash) { const c = $('#caption'); if (!c) return; c.textContent = t || ''; c.classList.toggle('flash', !!flash); }
  function spLine(cardId, combat, canPrep) {
    const c = CARDS[cardId], sp = E.SPECIALS[c.especial]; if (!sp) return '';
    const from = (G && G.cfg && G.cfg.specialsFrom) || 2;
    let act = '';
    if (combat && combat.specialsAllowed === false) act = !novice() ? '' : `<span class="splnote">Especiais a partir da rodada ${from}.</span>`;
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
        const b = e.target.closest(sel || '[data-v]'); if (!b || b.disabled) return;
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
    fxHide(true);   // o aviso do especial não pode ficar na frente das telas de escolha
    if (!V || V.humans < 2) return;
    const n = el(`<div class="cover"><div><div class="avatar" style="--pc:${PCOL[p.pid]}">${esc(p.name[0].toUpperCase())}</div><h2>Vez de ${esc(p.name)}</h2><p class="hint">Passe o aparelho. Os outros jogadores não devem olhar.</p><button class="btn primary">Sou ${esc(p.name)} — continuar</button></div></div>`);
    U.layer().appendChild(n);
    await new Promise((res, rej) => { const run = U.run; run.rej.add(rej); $('button', n).onclick = () => { run.rej.delete(rej); SND.play('click'); res(); }; });
    n.remove();
  }

  // avatar do próprio jogador (foto do perfil) no assento; os demais usam a inicial colorida
  function avInner(p) {
    try {
      if (p && !p.bot && p.pid === V.viewer && window.DSSTATS) { const a = window.DSSTATS.profile().avatar, IM = window.CARD_IMAGES || {}; if (a && a.t === 'card' && IM[a.id]) return { cls: ' img', html: `<img alt="" src="${IM[a.id]}">` }; }
    } catch (e) { }
    return { cls: '', html: esc(p.name[0].toUpperCase()) };
  }
  // ---------------------------------------------------------------- estrutura da mesa
  function shell() {
    $('#game').innerHTML = `<header class="hud"><button class="ibtn" id="bMenu" title="Menu">☰</button>
      <div class="mid"><b>DIMENSIONS STACKS</b><div id="hSub"></div></div>
      <button class="ibtn" id="bLog" title="Registro">📜</button><button class="ibtn" id="bSpd" title="Velocidade">⏩</button><button class="ibtn" id="bMore" title="Mais opções" aria-label="Mais opções" aria-expanded="false">⋯</button>
      <div class="hudmore" id="hudmore" hidden><button class="btn sm" id="bCalc" disabled>🧮 Ver cálculo da última disputa</button><button class="btn sm" id="bSnd">🔊 Som: ligado</button><button class="btn sm" id="bJoin" hidden>🚪 Permitir entrada: ligado</button></div></header>
      <div id="rtrack" hidden></div><main class="board" id="board"></main><div id="caption"></div><div id="dock" hidden></div>`;
    $('#bMenu').onclick = gameMenu; $('#rtrack').onclick = showEvents;
    $('#bLog').onclick = toggleLog;
    const hm = $('#hudmore'), mb = $('#bMore'), closeMore = () => { hm.hidden = true; mb.setAttribute('aria-expanded', 'false'); document.removeEventListener('pointerdown', outMore, true); };
    const outMore = e => { if (!hm.contains(e.target) && e.target !== mb) closeMore(); };
    mb.onclick = () => { SND.play('click'); if (!hm.hidden) return closeMore(); hm.hidden = false; mb.setAttribute('aria-expanded', 'true'); setTimeout(() => document.addEventListener('pointerdown', outMore, true), 0); };
    $('#bCalc').onclick = () => { closeMore(); showCalc(); };
    $('#bJoin').onclick = () => { V.allowJoin = V.allowJoin === false; $('#bJoin').textContent = '🚪 Permitir entrada: ' + (V.allowJoin ? 'ligado' : 'desligado'); if (V.republish) V.republish(); };
    $('#bSnd').onclick = () => { V.muted = !V.muted; SND.setVol('master', V.muted ? 0 : S.master); $('#bSnd').textContent = V.muted ? '🔇 Som: desligado' : '🔊 Som: ligado'; };
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

  // ---------------------------------------------------------------- "Ver cálculo" da última disputa
  function setCalc(calc) {
    V.calc = calc || null; const b = $('#bCalc'); if (b) b.disabled = !V.calc;
    const old = $('#calcpill'); if (old) old.remove();
    if (V.calc && !V.calc.none) { const pill = el(`<button class="calcpill" id="calcpill">🧮 ${V.humans === 1 && V.calc.winnerPid != null && V.calc.winnerPid !== V.viewer ? 'Por que perdi?' : 'Ver cálculo'}</button>`); pill.onclick = () => showCalc(); const g = $('#game'); if (g) g.appendChild(pill); }
  }
  const sgn = n => (n > 0 ? '+' : n < 0 ? '−' : '±') + Math.abs(n);
  const cname = id => (CARDS[id] ? CARDS[id].nome : 'carta oculta');
  function calcWhy(c) {
    const me = V.humans === 1 ? V.viewer : -1, N = pid => pid === me ? 'você' : nameOf(pid), Nc = pid => pid === me ? 'Você' : nameOf(pid);
    if (c.none) return 'Sem disputa: menos de duas cartas ficaram na mesa.';
    const live = c.rows.filter(r => !r.withdrawn);
    if (c.tie) return `Empate absoluto: mesmo valor e mesma soma dos 4 atributos. As cartas voltam aos donos.`;
    const w = live.find(r => r.pid === c.winnerPid); if (!w) return '';
    const others = live.filter(r => r !== w).sort((a, b) => (b.total || 0) - (a.total || 0)), L = others[0];
    const wa = ATT[w.attr].nome, out = [];
    const iWon = w.pid === me, iLost = me >= 0 && !iWon && live.some(r => r.pid === me);
    const bonusOf = r => r.parts.filter(m => m.d !== 0);
    if (w.autoWin) out.push(`${Nc(w.pid)} venceu automaticamente por efeito de um especial, sem comparar valores.`);
    else if (c.tb) out.push(`O ${c.inv ? 'menor' : 'maior'} valor (${c.tb.top}) empatou; o desempate pela soma dos 4 atributos deu a vitória a ${N(w.pid)} (${c.tb.list.map(x => N(x.pid) + ' ' + x.v).join(' × ')}).`);
    else if (L) {
      const lead = `${wa} ${w.total} de ${N(w.pid)} contra ${ATT[L.attr] ? ATT[L.attr].nome : '—'} ${L.total} de ${N(L.pid)}`;
      out.push((c.inv ? '(Mundo ao Avesso: vence o menor valor.) ' : '') + (iLost ? `Você perdeu porque ${lead}.` : iWon ? `Você venceu: ${lead}.` : `${Nc(w.pid)} venceu: ${lead}.`));
      if (w.margin !== true && L.margin) out.push(`${Nc(L.pid)} tinha uma regra de margem que o permitia disputar o desempate.`);
    }
    // causas por bônus
    if (!w.autoWin) {
      const wb = bonusOf(w).filter(m => m.d > 0), lb = bonusOf(L || {parts: []});
      wb.filter(m => m.other).forEach(m => out.push(`Habilidade de ${N(m.src)} (${m.label}) deu ${sgn(m.d)} ${wa} a ${N(w.pid)}.`));
      wb.filter(m => !m.other).forEach(m => out.push(`${Nc(w.pid)} ganhou ${sgn(m.d)} ${wa} com ${m.label}.`));
      if (w.bonus) out.push(`Cartas extras somaram ${sgn(w.bonus)} para ${N(w.pid)}.`);
      if (L) { lb.filter(m => m.d < 0).forEach(m => out.push(`${m.label}${m.other ? ' de ' + N(m.src) : ''} reduziu ${sgn(m.d)} o atributo de ${N(L.pid)}.`)); if (L.bonus) out.push(`${Nc(L.pid)} recebeu ${sgn(L.bonus)} de cartas extras, sem alcançar o valor.`); }
    }
    c.acts.filter(a => a.cancelled).forEach(a => out.push(`O especial ${a.nome} de ${N(a.pid)} foi anulado.`));
    return out.join(' ');
  }
  function showCalc() {
    const c = V.calc; if (!c) return; SND.play('click');
    const rows = c.rows.filter(r => !r.withdrawn || r.gone), rest = c.rows.filter(r => r.withdrawn && !r.gone);
    const html = rows.map(r => {
      const win = r.pid === c.winnerPid, a = r.attr && ATT[r.attr];
      const lines = [`<div class="cl"><span>Base · ${esc(cname(r.card))}</span><b>${r.base == null ? '—' : r.base}</b></div>`];
      r.parts.filter(m => m.d !== 0).forEach(m => lines.push(`<div class="cl ${m.d > 0 ? 'up' : 'dn'}"><span>${esc(m.label)}${m.other ? ' <i>(de ' + esc(nameOf(m.src)) + ')</i>' : ''}</span><b>${sgn(m.d)}</b></div>`));
      if (r.extra.length) lines.push(`<div class="cl up"><span>Cartas extras (${r.extra.map(x => esc(cname(x))).join(', ')})</span><b>${sgn(r.bonus)}</b></div>`);
      return `<div class="crow${win ? ' win' : ''}${r.gone ? ' gone' : ''}"><h4><span style="color:${PCOL[r.pid]}">${esc(nameOf(r.pid))}</span><em>${a ? esc(a.nome) : 'sem atributo'}${win ? ' · vencedor' : ''}${r.gone ? ' · carta removida' : ''}</em></h4>${lines.join('')}<div class="cl tot"><span>Total</span><b>${r.total == null ? '—' : r.total}</b></div></div>`;
    }).join('');
    const tb = c.tb ? `<p class="ctb">Empate em ${c.tb.top} → desempate pela soma dos 4 atributos: ${c.tb.list.map(x => esc(nameOf(x.pid)) + ' ' + x.v).join(' × ')}.</p>` : '';
    const acts = c.acts.length ? `<p class="cacts">Especiais: ${c.acts.map(a => `<span class="${a.cancelled ? 'x' : ''}">${esc(nameOf(a.pid))} · ${esc(a.nome)}${a.cancelled ? ' (anulado)' : ''}${a.forced ? ' (forçado)' : ''}</span>`).join(' ')}</p>` : '';
    const fx = (c.fx && c.fx.length) ? `<details class="cfx"><summary>Efeitos aplicados (${c.fx.length})</summary>${c.fx.map(t => `<p>${esc(t)}</p>`).join('')}</details>` : '';
    const wd = rest.length ? `<p class="cacts">Desistiram: ${rest.map(r => esc(nameOf(r.pid))).join(', ')}.</p>` : '';
    const n = el(`<div class="calc"><h2 style="color:var(--gold2)">Cálculo da disputa</h2><div class="crows">${html}</div>${tb}${acts}${wd}${fx}<p class="cwhy">${esc(calcWhy(c))}</p></div>`);
    U.modal(n);
  }
  function gameMenu() {
    SND.play('click');
    const n = el(`<div style="display:flex;flex-direction:column;gap:10px;margin-top:20px"><h2 style="color:var(--gold2)">Pausa</h2>${V.online && V.ctl && V.ctl.link ? `<div class="hint">Sala <b style="color:var(--gold2);letter-spacing:.2em">${esc(V.ctl.link.code)}</b> · se a conexão cair, abra Multiplayer e toque em "Voltar à sala" para retomar do ponto onde parou.</div>` : ''}
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
        ${(() => { const a = avInner(p); return `<div class="avatar${a.cls}" style="--pc:${PCOL[p.pid]}">${a.html}</div>`; })()}
        <div class="who"><div class="nm"><span class="nt">${esc(p.name)}</span><span class="turnflag" hidden>INICIA</span></div>
        <div class="cnt"><span title="Baralho ativo"><i class="mini"><b class="cd">0</b></i></span><span title="Reserva"><i class="mini res"><b class="cr">0</b></i></span><span class="prepslots" title="Especiais preparados"><i class="prepslot"></i><i class="prepslot"></i></span></div></div></div>`);
      seat.prepend(el(`<i class="stt on" title="Conectado"></i>`));
      V.seats[p.pid] = seat;
      const host = ps === 'b' ? '.r-bot' : '.r-top';   // todos os rivais ficam numa linha no topo
      $(host, b).append(seat);
      const slot = el(`<div class="slot pos-${ps}" data-pid="${p.pid}" data-name="${esc(p.name)}" style="--pc:${PCOL[p.pid]}"></div>`);
      V.slots[p.pid] = slot; arena.append(slot);
    });
    arena.append(el(`<div class="bh" id="bh" title="Buraco Negro"><div class="vortex"></div><div class="n"><span id="bhn">0</span><small>BURACO NEGRO</small></div></div>`));
    $('#bh').onclick = showBH;
    if (V.humans === 1) {
      V.seats[V.viewer].onclick = () => showMyDeck();
      const tm = G.cfg && G.cfg.teams && G.cfg.teams.find(t => t.includes(V.viewer));   // duplas: o parceiro mostra as próprias cartas ao toque
      if (tm) tm.filter(x => x !== V.viewer && V.seats[x]).forEach(x => { V.seats[x].onclick = () => showMyDeck(x); V.seats[x].style.cursor = 'pointer'; });
    }
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
    const s = G.s; renderTrack();
    { const al = s.players.filter(p => p.alive), mc = al.length ? Math.min(...al.map(p => p.deck.length + p.reserve.length)) : 99;   // trilha: acelera perto do fim
      SND.matchLevel && SND.matchLevel(al.length <= 2 && mc <= 2 ? 2 : (al.length <= 2 && mc <= 5) || mc <= 2 ? 1 : 0); }
    s.players.forEach(p => {
      const seat = V.seats[p.pid]; if (!seat) return;
      $('.cd', seat).textContent = p.deck.length; $('.cr', seat).textContent = p.reserve.length;
      $$('.prepslot', seat).forEach((x, i) => x.classList.toggle('on', i < p.prepared.length));
      seat.classList.toggle('dead', !p.alive); { const st = $('.stt', seat), away = !p.bot && (s.away || []).includes(p.pid), k = p.bot ? 'cpu' : away ? 'warn' : 'on'; if (st && st.dataset.k !== k) { st.dataset.k = k; st.className = 'stt ' + k; st.title = p.bot ? 'CPU' : away ? 'Sem conexão' : 'Conectado'; st.textContent = p.bot ? '⚙' : ''; } }
      const turn = V.init === p.pid && p.alive && !s.over;
      seat.classList.toggle('turn', turn); $('.turnflag', seat).hidden = !turn;
    });
    const bh = $('#bhn'); if (bh) bh.textContent = s.bh.length;
    { const bj = $('#bJoin'); if (bj) bj.hidden = !(V.online && V.ctl && V.ctl.role === 'host'); }
    s.players.forEach(p => { const seat = V.seats[p.pid]; if (!seat) return; const nt = $('.nt', seat); if (nt && nt.textContent !== p.name) { nt.textContent = p.name; nt.style.fontSize = ''; const av = $('.avatar', seat); if (av && !av.classList.contains('img')) av.textContent = p.name[0].toUpperCase(); const sl = V.slots[p.pid]; if (sl) sl.dataset.name = p.name; } });
    fitNames();
    const sub = $('#hSub'); if (sub) sub.textContent = `${s.events && Object.keys(s.events).length ? '' : 'Rodada ' + s.round + ' · '}Disputa ${Math.min(s.combats + 1, 9999)}${V.online && V.ctl && V.ctl.link ? ' · Sala ' + V.ctl.link.code : ''}`;
  }
  function pulseBH() { const b = $('#bh'); if (!b) return; b.classList.remove('pulse'); void b.offsetWidth; b.classList.add('pulse'); refresh(); }

  function showBH() {
    const list = G.s.bh; SND.play('click');
    const w = el(`<div><h2 style="color:var(--gold2)">Buraco Negro <span class="hint">(${list.length})</span></h2><p class="hint">Cartas fora de jogo. Especiais usados aparecem marcados.</p><div class="cgrid"></div></div>`);
    $('.cgrid', w).append(...list.map(x => { const c = cardEl(x.id, { up: true, noanim: true, cw: 96, click: true }); if (x.kind === 'especial') c.style.outline = '2px solid #b78cff'; return c; }));
    if (!list.length) $('.cgrid', w).outerHTML = '<p class="hint">Vazio por enquanto.</p>';
    U.modal(w);
  }
  // reserva própria, só leitura (sem ordem: a compra pega as primeiras da pilha, que não se conhecem)
  function showReserve(ids, who) {
    SND.play('click');
    const w = el(`<div><h2 style="color:var(--gold2)">${who ? 'Reserva de ' + esc(who) : 'Sua reserva'}</h2><p class="hint">${ids.length} carta(s), só para consultar. ${who ? '' : 'Quando seu baralho acabar você compra até 7 delas (as primeiras são sorteadas) e então reordena as que chegarem. '}Toque numa carta para ver os detalhes.</p><div class="cgrid"></div></div>`);
    $('.cgrid', w).append(...ids.map(id => cardEl(id, { up: true, noanim: true, cw: 96, click: true })));
    U.modal(w);
  }

  // baralho de quem olha, ou (nas duplas) do parceiro: só leitura
  function showMyDeck(pid) {
    const mate = typeof pid === 'number' && pid !== V.viewer, p = G.p(mate ? pid : V.viewer); SND.play('click');
    const w = el(`<div><h2 style="color:var(--gold2)">${mate ? 'Baralho de ' + esc(p.name) : 'Seu baralho'}</h2><p class="hint">Ordem de jogo (1ª = próxima a entrar). Reserva: ${p.reserve.length} carta(s).</p><div class="cgrid"></div>${p.prepared.length ? '<h3 style="margin:10px 0;color:var(--gold2)">Especiais preparados</h3><div class="cgrid" id="pp"></div>' : ''}</div>`);
    $('.cgrid', w).append(...p.deck.map((id, i) => { const c = cardEl(id, { up: true, noanim: true, cw: 96, click: true }); const t = el(`<div class="tag" style="position:absolute;top:-8px;left:4px;z-index:3;background:#08061a;border:1px solid var(--line);border-radius:99px;padding:0 7px;font-size:11px;font-weight:900">${i + 1}</div>`); c.append(t); return c; }));
    const pp = $('#pp', w); if (pp) { pp.className = 'pplist'; p.prepared.forEach(id => { const c = CARDS[id], sp = c && E.SPECIALS[c.especial], row = el(`<div class="prow"><div class="pcard"></div><div class="ptx"><b>✦ ${esc(sp ? sp.nome : '')}</b><p>${esc(sp ? sp.texto : '')}</p></div></div>`); $('.pcard', row).append(cardEl(id, { up: true, noanim: true, cw: 96, click: true })); pp.append(row); }); }
    if (p.reserve.length) { const rb = el(`<div class="row" style="justify-content:center;margin-top:12px"><button class="btn sm" type="button">Ver ${mate ? 'a reserva' : 'minha reserva'} (${p.reserve.length})</button></div>`); $('button', rb).onclick = () => showReserve(p.reserve.slice(), mate ? p.name : null); w.append(rb); }
    U.modal(w);
  }

  // ---------------------------------------------------------------- arena: atualização de cartas em campo
  function updateSlot(e) {
    const slot = V.slots[e.pid], card = $('.card', slot); if (!card) return;
    if (!e.attr || !card.classList.contains('up')) { return; }
    updateCard(card, e.stats, e.attr, e.evm);
    let b = $('.badge', slot); const val = e.stats[e.attr] + e.bonus;
    if (!b) { b = el('<div class="badge"></div>'); slot.append(b); }
    const prev = b.dataset.v; b.dataset.v = val; b.dataset.a = e.attr;
    b.innerHTML = `${ICON[e.attr]}<span>${val}</span>${e.bonus ? `<em>${e.bonus > 0 ? '+' : ''}${e.bonus}</em>` : ''}`;
    if (prev != null && +prev !== val) { b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); SND.play('bonus'); }
    slot.classList.toggle('withdrawn', !!e.withdrawn);
    let x = $('.xtra', slot);
    if (e.extra && e.extra.length) { if (!x) { x = el('<div class="xtra"></div>'); slot.append(x); } x.textContent = '+' + e.extra.length + (e.extra.length > 1 ? ' cartas' : ' carta'); }
  }
  // nome sempre inteiro e em uma linha nas caixas dos rivais: reduz a fonte até caber
  function fitNames() {
    try { $$('.r-top .seat .nt').forEach(nt => { nt.style.fontSize = ''; let f = parseFloat(getComputedStyle(nt).fontSize) || 12, g = 0; while (nt.scrollWidth > nt.clientWidth + 1 && f > 8.5 && g++ < 12) { f -= .5; nt.style.fontSize = f + 'px'; } }); } catch (e) { }
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
      let ci = cardIn(e.pid); if (ci && ci.dataset.hidden && e.card && e.card !== '?') { const real = cardEl(e.card, { stats: e.stats, mark: e.evm }); ci.replaceWith(real); ci = real; void ci.offsetWidth; }   // online: a carta do rival só chega agora
      ci.classList.add('up');
      const cd = e.card && e.card !== '?' ? CARDS[e.card] : null, big = cd && (cd.uniao || cd.raridade === 'lendaria');
      SND.play(big ? 'legend' : (last ? 'reveal' : 'flip'));
      if (big || (cd && cd.raridade === 'epica')) { ci.classList.add('flash'); if (!big) ci.classList.add('soft'); setTimeout(() => ci.classList.remove('flash', 'soft'), 1000); }
      await sleep(430, 430);
      updateSlot(e);
      const r = slot.getBoundingClientRect(); FX.burst(r.left + r.width / 2, r.top + r.height / 2, Object.assign({ n: last ? 36 : 14, speed: last ? 7 : 4, life: 40, size: 2.4 }, big ? { n: 48, speed: 8, colors: cd.uniao ? ['#ff7ab0', '#ffd25f', '#7dffb0', '#6cc6ff', '#b394ff'] : ['#fff3c8', '#ffd25f', '#ffb02e'] } : {}));
      await sleep(last ? 900 : 520, last ? 700 : 420);
    }
    arena.classList.remove('suspense');
    caption('');
  }

  // ---------------------------------------------------------------- fenômenos dimensionais: faixa de rodadas, aviso e animações
  const EVUI = {
    forca: { cor: '#ff8a5c', sim: '⚔' }, nevoa: { cor: '#c58cff', sim: '☁' }, eco: { cor: '#7fdcff', sim: '◎' },
    aberta: { cor: '#ffd25f', sim: '✶' }, tempestade: { cor: '#6cc6ff', sim: '↻' }, buraco: { cor: '#b78cff', sim: '●' },
    correnteza: { cor: '#7dffb0', sim: '≋' }, muralha: { cor: '#6cc6ff', sim: '▦' }, eclipse: { cor: '#ff6b6b', sim: '◐' }, avesso: { cor: '#8be0a6', sim: '⇅' }, troca: { cor: '#ff7ab0', sim: '⇄' }, bloqueio: { cor: '#ff5a5a', sim: '✕' }
  };
  const evOf = r => { const e = G && G.s && G.s.events; return e ? e[r] || null : null; };
  const evName = ev => E.EVENTOS[ev.id].nome + (ev.id === 'troca' && ev.pair ? ` (${ATT[ev.pair[0]].nome} ⇄ ${ATT[ev.pair[1]].nome})` : '');
  function renderTrack() {
    const t = $('#rtrack'); if (!t || !G) return; const r = G.s.round;
    if (!G.s.events || !Object.keys(G.s.events).length) { t.hidden = true; return; }
    t.hidden = false;
    const chip = (n, cur) => { const ev = evOf(n), ui = ev && EVUI[ev.id];
      return `<span class="rt${cur ? ' cur' : ''}${ev ? ' has' : ''}"${ev ? ` style="--ec:${ui.cor};--ecv:${ui.cor}"` : ''}><b>${cur ? 'Rodada ' + n : 'R' + n}</b>${ev ? `<em>${ui.sim} ${esc(cur ? evName(ev) : E.EVENTOS[ev.id].nome)}</em>` : ''}</span>`; };
    t.innerHTML = chip(r, true) + '<i>›</i>' + chip(r + 1) + '<i>›</i>' + chip(r + 2);
    t.title = 'Toque para ver os fenômenos dimensionais';
  }
  function showEvents() {
    SND.play('click'); const r = G.s.round, rows = [];
    for (let n = r; n <= r + 2; n++) { const ev = evOf(n); rows.push(`<div class="evrow${ev ? '' : ' none'}"${ev ? ` style="--ec:${EVUI[ev.id].cor}"` : ''}><b>${n === r ? 'Rodada ' + n + ' (agora)' : 'Rodada ' + n}</b>${ev ? `<span class="evn">${EVUI[ev.id].sim} ${esc(evName(ev))}</span><p>${esc(E.EVENTOS[ev.id].txt)}</p>` : '<span class="hint">Sem fenômeno.</span>'}</div>`); }
    U.modal(el(`<div class="evbox"><h2 style="color:var(--gold2)">Fenômenos dimensionais</h2><p class="hint">Algumas rodadas têm uma regra especial, avisada aqui com duas rodadas de antecedência.</p>${rows.join('')}</div>`));
  }
  // animação de tela cheia de cada fenômeno (não bloqueia o jogo)
  function evFx(ev) {
    const ly = U.layer(), ui = EVUI[ev.id], n = el(`<div class="evfx ev-${ev.id}" style="--ec:${ui.cor}"></div>`);
    if (ev.id === 'forca') n.innerHTML = '<i class="wv"></i><i class="wv w2"></i><i class="sh"></i>';
    else if (ev.id === 'nevoa') n.innerHTML = '<i class="fg"></i><i class="fg f2"></i><i class="fg f3"></i>';
    else if (ev.id === 'eco') n.innerHTML = '<i class="rg"></i><i class="rg r2"></i><i class="rg r3"></i><i class="rg r4"></i>';
    else if (ev.id === 'aberta') n.innerHTML = AIDS.map((a, i) => `<i class="ln l${i}" data-a="${a}"></i>`).join('') + '<i class="fl"></i>';
    else if (ev.id === 'tempestade') n.innerHTML = Array.from({ length: 16 }, (_, i) => `<i class="wd" style="top:${4 + i * 6}%;animation-delay:${(i * 83) % 700}ms;width:${28 + (i * 37) % 40}%"></i>`).join('');
    else if (ev.id === 'buraco') n.innerHTML = '<i class="vx"></i><i class="vx v2"></i>';
    else if (ev.id === 'correnteza') n.innerHTML = Array.from({ length: 12 }, (_, i) => `<i class="cr" style="top:${6 + i * 8}%;animation-delay:${(i * 97) % 600}ms;width:${35 + (i * 29) % 40}%"></i>`).join('');
    else if (ev.id === 'muralha') n.innerHTML = '<i class="mu"></i><i class="mu m2"></i><i class="mg">🛡</i>';
    else if (ev.id === 'eclipse') n.innerHTML = '<i class="co"></i><i class="dk"></i>';
    else if (ev.id === 'avesso') n.innerHTML = '<i class="ar">⇅</i>';
    else if (ev.id === 'bloqueio') n.innerHTML = '<i class="bx">✕</i>';
    else if (ev.id === 'troca') { const [a, b] = ev.pair || ['pod', 'def']; n.innerHTML = `<div class="sw"><span class="sa" data-a="${a}">${ICON[a]}<small>${ATT[a].nome}</small></span><b>⇄</b><span class="sb" data-a="${b}">${ICON[b]}<small>${ATT[b].nome}</small></span></div>`; }
    ly.appendChild(n); setTimeout(() => n.remove(), 3200 * S.k);
  }
  const EVSND = { forca: 'slash', nevoa: 'suspense', eco: 'bonus', aberta: 'legend', tempestade: 'steal', buraco: 'blackhole', eclipse: 'suspense', correnteza: 'slash', muralha: 'shield', avesso: 'round', troca: 'capture', bloqueio: 'shield' };

  // ---------------------------------------------------------------- desempate animado: atributos de cada empatado somados na tela
  async function tieBreak(tb, winner) {
    if (!tb || !tb.rows || tb.rows.length < 2) return;
    const rows = tb.rows, N = rows.length, ly = U.layer(), dl = N > 2 ? 170 : 260;
    const box = el(`<div class="tbk"><h3>Empate em ${tb.top}!</h3><p class="tbs">Desempate: ${tb.inv ? 'a MENOR soma vence (Mundo ao Avesso)' : 'soma dos 4 atributos'}</p><div class="tbc" style="--n:${N}">${rows.map(r => `<div class="tbp" data-pid="${r.pid}" style="--pc:${PCOL[r.pid]}"><b class="tbn">${esc(nameOf(r.pid))}</b><div class="tba">${AIDS.map(a => `<span class="tbv" data-a="${a}">${ICON[a]}<em>${r.stats[a]}</em></span>`).join('')}</div><div class="tbt"><small>TOTAL</small><strong>0</strong></div></div>`).join('')}</div></div>`);
    ly.appendChild(box);
    const pn = pid => $(`.tbp[data-pid="${pid}"]`, box), sub = $('.tbs', box);
    const pop = el2 => { el2.classList.remove('pop'); void el2.offsetWidth; el2.classList.add('pop'); };
    async function sum(attrs, pids) {
      for (const r of rows) {
        if (!pids.includes(r.pid)) continue;
        const p = pn(r.pid), tot = $('strong', p); let run = 0; tot.textContent = '0';
        for (const a of attrs) { const c = $(`.tbv[data-a="${a}"]`, p); c.classList.add('on'); run += r.stats[a]; tot.textContent = run; pop(tot); SND.play('tick'); await sleep(dl); }
        p.classList.add('done'); await sleep(dl);
      }
    }
    const inv = !!tb.inv, best = (list) => (inv ? Math.min : Math.max)(...list.map(x => x.v));
    await sleep(500);
    await sum(AIDS, rows.map(r => r.pid));
    const b1 = best(tb.list);
    tb.list.forEach(x => { if (inv ? x.v > b1 : x.v < b1) pn(x.pid).classList.add('lose'); });
    await sleep(700);
    if (winner != null) { const w = pn(winner); if (w) { w.classList.add('win'); SND.play('win'); } sub.textContent = nameOf(winner) + ' leva o desempate'; }
    else { sub.textContent = 'Empate absoluto: ninguém vence'; SND.play('tick'); }
    await sleep(1300, 900);
    box.classList.add('out'); await sleep(350); box.remove();
  }

  // ---------------------------------------------------------------- manipuladores de eventos do motor
  const H = {
    async setup() {
      buildBoard(); SND.play('deal'); banner('Preparando a mesa', 'Embaralhando as dimensões', null, 1400); await sleep(900);
    },
    async initiative({ initiator }) {
      V.init = initiator; const n = V.n, seats = G.s.players.map(p => V.seats[p.pid]).filter(Boolean);
      if (!seats.length) return;
      const start = Math.floor(Math.random() * n), steps = n * 3 + ((initiator - start + n) % n);
      banner('Quem começa?', 'Sorteando a iniciativa', null, 1300); await sleep(1100);
      let cur = -1;
      for (let i = 0; i <= steps; i++) {
        const pid = (start + i) % n; if (cur >= 0 && V.seats[cur]) V.seats[cur].classList.remove('spot');
        cur = pid; const s = V.seats[pid]; if (s) s.classList.add('spot');
        SND.play('tick');
        const t = i / steps; await sleep(Math.round(55 + 430 * t * t * t));
      }
      const s = V.seats[initiator]; if (s) { s.classList.remove('spot'); s.classList.add('winspot'); }
      SND.play('legend'); await sleep(1500);
      if (s) s.classList.remove('winspot');
      banner(`${nameOf(initiator)} começa!`, 'Agora monte seu baralho', null, 1400); await sleep(1100);
    },
    async eventStart({ round, ev }) {
      const d = E.EVENTOS[ev.id], ui = EVUI[ev.id]; refresh();
      evFx(ev); SND.play('phenom'); setTimeout(() => SND.play(EVSND[ev.id] || 'round'), 380);
      if (ev.id === 'forca' || ev.id === 'nevoa' || ev.id === 'eco' || ev.id === 'correnteza' || ev.id === 'muralha') { const r = innerHeight / 2; FX.burst(innerWidth / 2, r, { n: 50, speed: 7, life: 55, colors: [ui.cor, '#fff'] }); }
      banner(d.nome, ev.id === 'troca' && ev.pair ? `${ATT[ev.pair[0]].nome} ⇄ ${ATT[ev.pair[1]].nome}` : d.curto, ui.cor, 2600); caption(`Fenômeno dimensional: ${evName(ev)}. ${d.txt}`, true);
      await sleep(2400, 1200);
      if (U.tip) { if (V.online) U.tip('evento', ev); else await U.tip('evento', ev); }
    },
    async eventFx({ id, moves, pid, cards, attr }) {
      if (id === 'bloqueio') {
        if (!attr) return; const ly = U.layer(), n = el(`<div class="evfx ev-bloqueio one" style="--ec:${EVUI.bloqueio.cor}"><div class="bk"><span class="bi" data-a="${attr}">${ICON[attr]}<i>✕</i></span><b>${ATT[attr].nome} bloqueada</b></div></div>`);
        ly.appendChild(n); setTimeout(() => n.remove(), 1500 * S.k); SND.play('shield');
        caption(`Bloqueio Dimensional: ${ATT[attr].nome} está bloqueado nesta disputa.`, true); await sleep(1300, 700);
      } else if (id === 'tempestade') {
        { const d = (moves && moves[0] && moves[0].dir) || 1; caption(`Tempestade: as cartas do topo passam para a ${d > 0 ? 'esquerda' : 'direita'}.`, true); }
        await Promise.all((moves || []).map((m, i) => sleep(i * 160).then(() => { SND.play('deal'); return fly(seatDeck(m.from), seatDeck(m.to), { ms: 900, cw: 62, r0: -10, r1: 12, arc: 40, }); })));
        refresh(); const me = (moves || []).find(m => m.to === V.viewer && V.humans === 1 && m.card && m.card !== '?');
        if (me) { const c = CARDS[me.card]; caption(`Você recebeu ${c.nome} e vai jogar com ela.`, true); await sleep(900); }
      } else if (id === 'buraco') {
        if (pid == null) return;
        for (const c of cards || []) { SND.play('steal'); await fly($('#bh'), seatDeck(pid), { id: c, ms: 800, cw: 62, r0: 360, s0: .1, arc: 30 }); pulseBH(); await sleep(120); }
        refresh(); banner(nameOf(pid), `por último: recebe ${(cards || []).length} carta(s) do Buraco Negro`, EVUI.buraco.cor, 1500); await sleep(1000);
      }
    },
    async ready() {
      V.init = G.s.initiator; refresh();
      for (let i = 0; i < 4; i++) { SND.play('deal'); await sleep(110); }
      banner('Que comece!', `${nameOf(G.s.initiator)} inicia`, null, 1500); await sleep(900); refresh(); if (U.tip && !V.online) await U.tip('mesa');
    },
    async combatStart({ initiator, round }) {
      V.init = initiator; V.win = {}; { const cp = $('#calcpill'); if (cp) cp.remove(); } refresh();
      caption(`Disputa ${G.s.combats + 1} — ${nameOf(initiator)} inicia` + (round < 2 && V.humans > 0 ? ' · especiais liberam na Rodada 2' : '')); await sleep(350);
      if (G.combat && G.combat.alvo != null) { banner('Alvo do dia: ' + G.combat.alvo, 'vence o valor mais próximo', '#ffd25f', 1600); await sleep(900); }
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
        const slot = V.slots[e.pid]; const c = cardEl(e.card, { stats: e.stats, mark: e.evm }); c.style.visibility = 'hidden'; slot.append(c); slot.classList.add('has');
        await fly(seatDeck(e.pid), slot, { ms: 420, ease: 'cubic-bezier(.2,.8,.3,1)' });
        c.style.visibility = ''; SND.play('place'); slot.classList.add('pending'); await sleep(90);
      }
      refresh(); caption('Cartas na mesa. Escolham seus atributos.'); await sleep(250);
    },
    async initiatorAttr({ pid, attr }) {
      const slot = V.slots[pid]; slot.classList.remove('pending');
      slot.append(el(`<div class="tag" data-a="${attr}" style="color:var(--ac)">${ICON[attr]}<span style="color:var(--ink)">${ATT[attr].nome} · ${ATT[attr].tipo}</span></div>`));
      SND.play('bonus'); const par = AIDS.filter(a => ATT[a].par === ATT[attr].par).map(a => ATT[a].nome).join(' ou ');
      caption(`${nameOf(pid)} iniciou em ${ATT[attr].nome}. Os demais escolhem ${V.combat && V.combat.ev && V.combat.ev.id === 'aberta' ? 'qualquer atributo' : par} em segredo.`, true); await sleep(700);
    },
    async reveal({ combat }) { await revealCards(combat); },
    async specialWindow({ stage }) {
      stage = stage || 'main'; V.win = V.win || {}; if (V.win[stage]) return; V.win[stage] = true;
      if (stage === 'ctrl') { banner('Controle de atributos', 'especiais antes de declarar', '#7dd3ff', 1400); caption('Janela de especiais de controle…'); }
      else if (stage === 'react') { banner('Janela de reação', 'decida sabendo o que foi virado', '#ff9ec7', 1400); caption('Janela de reação: especiais reativos…'); }
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
      await sleep(2300, 1300); st.remove();
      let strip = $('.strip'); if (!strip) { strip = el('<div class="strip"></div>'); $('.arenaWrap').append(strip); }
      acts.forEach(a => { const sp = E.SPECIALS[CARDS[a.card].especial]; strip.append(el(`<div class="chip" data-card="${a.card}" style="--pc:${PCOL[a.pid]}"><i></i>${esc(nameOf(a.pid))}: ${esc(sp.nome)}</div>`)); });
    },
    async effectStart({ act, spec }) {
      const chip = $(`.chip[data-card="${act.card}"]`); if (chip) chip.classList.add('run');
      caption(''); fxShow(act, spec); SND.play('special'); await sleep(850);
    },
    async effectEnd({ act }) {
      const chip = $(`.chip[data-card="${act.card}"]`); if (chip) chip.classList.remove('run');
      updateAll(); refresh(); fxResult(); await sleep(V.fxHold || 1300, 800); fxHide();
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
    async reserveSwap({ a, b, na, nb }) {
      SND.play('steal'); await Promise.all([na !== 0 && fly(seatRes(a), seatRes(b), { ms: 700, cw: 50, arc: 40 }), nb !== 0 && fly(seatRes(b), seatRes(a), { ms: 700, cw: 50, arc: -40 })]); refresh(); await sleep(120);
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
    async resolved({ combat, result, moves, calc }) {
      updateAll(); let tipId = null; setCalc(calc);
      if (result.type === 'tie' || result.type === 'none') {
        if (result.tb) await tieBreak(result.tb, null);
        banner('Empate', 'As cartas voltam aos donos', '#b9b2ea', 1800); SND.play('tick'); caption('Ninguém vence esta disputa.'); await sleep(1700, 900);
      } else {
        const w = result.winnerPid, slot = V.slots[w], atk = result.type === 'attack';
        if (result.tb) await tieBreak(result.tb, w);
        combat.entries.forEach(e => { if (e.pid === w) slot.classList.add('winner'); else if (!e.withdrawn) V.slots[e.pid].classList.add('loser'); });
        SND.play('win'); setTimeout(() => SND.play(atk ? 'slash' : 'shield'), 150);
        slot.append(el(atk ? '<div class="fx-slash"></div>' : '<div class="fx-shield"></div>'));
        const r = slot.getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        FX.burst(cx, cy, { n: 80, speed: 9, life: 70, up: 2 });
        setTimeout(() => FX.burst(cx, cy, { n: 40, speed: 5, life: 60, colors: atk ? ['#ff7a45', '#fff', '#e9dfc0'] : ['#8fd6ff', '#fff', '#4aa8ff'] }), 300);
        tipId = U.tip ? ['reveal', atk ? 'capture' : 'bh'].find(x => !U.tipSeen(x)) : null;
        const tb = result.tb, tbTxt = tb ? `Empate em ${tb.top} → desempate pela soma dos 4 atributos: ${tb.list.map(x => nameOf(x.pid) + ' ' + x.v).join(' × ')}` : '';
        banner(`${nameOf(w)} vence!`, `${atk ? 'Ataque' : 'Defesa'} · ${ATT[result.attr].nome} ${result.value}`, atk ? '#ffd25f' : '#8fd6ff', tb ? 2100 : 2100);
        caption(tb ? tbTxt + '.' : `${nameOf(w)} vence ${atk ? 'atacando' : 'defendendo'} com ${ATT[result.attr].nome} ${result.value}.`, true);
        await sleep(2100, 1000);
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
      if (U.tip && calc && !calc.none && !tipId) U.tip('calc');
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
      refresh(); SND.play('elim'); banner(`${nameOf(pid)} eliminado`, 'sem cartas', '#ff6b6b', 2000); await sleep(1700); if (U.tip) U.tip('elim');
    },
    async round({ round }) { refresh(); SND.play('round'); banner(`Rodada ${round}`, round === 2 && V.humans > 0 ? 'Especiais liberados' : null, null, 1500); await sleep(1000); if (U.tip && round === 2) { if (V.online) U.tip('round2'); else await U.tip('round2'); } },
    async end({ winner }) {
      SND.matchEnd && SND.matchEnd(); refresh(); const s = G.s; const sameT = (a, b) => a === b || !!(G.cfg && G.cfg.teams && G.cfg.teams.some(t => t.includes(a) && t.includes(b))); const human = winner != null && (V.online ? sameT(winner, V.viewer) : (G.cfg && G.cfg.teams ? G.cfg.teams.some(t => t.includes(winner) && t.some(x => !G.p(x).bot)) : !G.p(winner).bot)); const anyHuman = V.humans > 0;
      const lost = winner == null || !(human || !anyHuman);
      if (G.cfg.historia) {   // modo história: resultado próprio, cartas capturadas e volta ao mapa
        const H = G.cfg.historia, me = G.p(V.viewer), mine = [...me.deck, ...me.reserve, ...me.prepared], inim = new Set((G.cfg.maos || []).slice(1).flat());
        const cap = lost ? [] : mine.filter(c => inim.has(c));
        SND.play(lost ? 'defeat' : 'victory'); if (!lost) FX.confetti();
        const nn = el(`<div class="modal"><div class="box"><div class="final"><h1>${lost ? 'Derrota' : 'Vitória!'}</h1>
          <div class="hint">${lost ? 'Seu baralho acabou. Reorganize as cartas e tente de novo.' : cap.length ? 'Cartas capturadas:' : 'Nenhuma carta capturada.'}</div><div class="row hcap" style="justify-content:center;flex-wrap:wrap"></div>
          <div class="stats"><div><b>${G.s.combats}</b>disputas</div><div><b>${G.s.round}</b>rodadas</div></div>
          <div class="row" style="justify-content:center"><button class="btn primary" data-a="go">Continuar</button></div></div></div></div>`);
        cap.forEach(c => $('.hcap', nn).append(cardEl(c, { up: true, noanim: true, cw: cap.length > 3 ? 76 : 96 })));
        nn.onclick = e => { const b = e.target.closest('[data-a]'); if (!b) return; SND.play('click'); nn.remove(); U.killRun(); H.aoFim({ venceu: !lost, capturadas: cap, disputas: G.s.combats }); };
        U.layer().appendChild(nn); return;
      }
      SND.play(lost ? 'defeat' : 'victory'); if (lost && SND.defeatMusic) SND.defeatMusic();
      if (winner != null && (human || !anyHuman)) FX.confetti();
      const w = winner != null ? G.p(winner) : null;
      const teams = G.cfg && G.cfg.teams, mates = teams && w ? teams.find(t => t.includes(w.pid)) : null;   // duplas: vence a dupla inteira
      const n = el(`<div class="modal"><div class="box"><div class="final">
        ${mates ? `<div class="row" style="justify-content:center;gap:10px">${mates.map(pid => `<div class="avatar" style="--pc:${PCOL[pid]};width:72px;height:72px;font-size:34px">${esc(G.p(pid).name[0].toUpperCase())}</div>`).join('')}</div>`
          : w ? `<div class="avatar" style="--pc:${PCOL[w.pid]};width:84px;height:84px;font-size:40px">${esc(w.name[0].toUpperCase())}</div>` : ''}
        <h1>${mates ? esc(mates.map(pid => G.p(pid).name).join(' e ')) + ' vencem!' : w ? esc(w.name) + ' vence!' : 'Empate!'}</h1>
        <div class="hint">${s.byLimit ? (mates ? 'Limite de disputas atingido: vence a dupla com mais cartas.' : 'Limite de disputas atingido: vence quem tem mais cartas.') : w ? (mates ? 'A dupla adversária ficou sem cartas.' : 'Todos os adversários foram eliminados.') : ''}</div>
        <div class="stats"><div><b>${s.combats}</b>disputas</div><div><b>${s.round}</b>rodadas</div><div><b>${s.bh.length}</b>no Buraco Negro</div></div>
        ${unlockHTML()}
        <div class="row" style="justify-content:center">${V.online ? (V.ctl.again ? '<button class="btn primary" data-a="again">Nova partida (mesmos jogadores)</button>' : '<div class="hint" style="width:100%;text-align:center">Aguardando o anfitrião começar outra partida…</div>') : '<button class="btn primary" data-a="again">Jogar de novo</button>'}<button class="btn" data-a="menu">${V.online ? 'Sair da sala' : 'Menu'}</button></div></div></div></div>`);
      n.onclick = e => { const b = e.target.closest('[data-a]'); if (!b) return; SND.play('click'); if (V.online) { if (b.dataset.a === 'again') { n.remove(); V.ctl.again(); } else { n.remove(); U.killRun(); U.onlineOff && U.onlineOff(); V.ctl.leave(); } return; } n.remove(); if (b.dataset.a === 'again') { U.rerollBotNames && U.rerollBotNames(lastCfg.players); U.startGame(lastCfg); } else U.show('menu'); };
      U.layer().appendChild(n); animMast(n);
    },
  };

  function unlockHTML() {
    const r = U.lastRec; U.lastRec = null; U.lastMastData = r && r.xp ? r.xp.slice().sort((x, y) => (y.b.xp - y.a.xp) - (x.b.xp - x.a.xp)).slice(0, 6) : []; if (!r) return ''; const I = U.ICO || {}; const L = [];
    if (r.daily) L.push(`<div class="u">${I.medal || ''}Desafio do dia concluído</div>`);
    (r.ach || []).forEach(a => L.push(`<div class="u">${I.medal || ''}Conquista: ${esc(a.nome)}</div>`));
    (r.mast || []).forEach(m => L.push(`<div class="u mu">${U.emblem(m.to, 20)}Maestria: ${esc(CARDS[m.id] ? CARDS[m.id].nome : m.id)} → ${esc(m.nome)}</div>`));
    const xp = (r.xp || []).slice().sort((x, y) => (y.b.xp - y.a.xp) - (x.b.xp - x.a.xp)).slice(0, 6);
    const pct = (m, x) => m.to == null ? 100 : Math.max(0, Math.min(100, Math.round((x - m.from) / (m.to - m.from) * 100)));
    const bars = xp.length ? `<div class="gmbars">${xp.map(({ id, a, b }) => { const up = b.lv > a.lv;
      return `<div class="gmrow${up ? ' up' : ''}" data-p0="${pct(a, a.xp)}" data-p1="${pct(b, b.xp)}" data-up="${up ? 1 : 0}"><div class="gmth"></div><div class="gmmid"><div class="gmnm"><b>${esc(CARDS[id] ? CARDS[id].nome : id)}</b><span class="gmem">${U.emblem(a.lv, 16)}</span></div><div class="gmbar"><i style="width:${pct(a, a.xp)}%"></i></div></div><span class="gmxp">+${b.xp - a.xp} XP</span></div>`; }).join('')}</div>` : '';
    return (bars ? `<div class="hint gmhead">Maestria das cartas</div>${bars}` : '') + (L.length ? `<div class="unlocks">${L.join('')}</div>` : '');
  }
  // anima as barras de maestria: do valor anterior ao novo; ao subir de nível, enche, troca o emblema e recomeça no novo nível
  function animMast(root) {
    const rec = U.lastMastData || []; $$('.gmrow', root).forEach((row, i) => {
      const d = rec[i]; if (d && d.b) { const th = $('.gmth', row); th.append(cardEl(d.id, { up: true, noanim: true, cw: 30 })); }
      const bar = $('.gmbar i', row), p1 = +row.dataset.p1, up = row.dataset.up === '1';
      setTimeout(() => {
        if (!up) { bar.style.width = p1 + '%'; return; }
        bar.style.width = '100%';
        setTimeout(() => { row.classList.add('pop'); SND.play('win'); const em = $('.gmem', row); if (d) em.innerHTML = U.emblem(d.b.lv, 16); bar.style.transition = 'none'; bar.style.width = '0%'; void bar.offsetWidth; bar.style.transition = ''; bar.style.width = p1 + '%'; }, 650);
      }, 500 + i * 160);
    });
  }
  function newRec(ctx) {
    U.lastRec = null; const S = window.DSSTATS; U.rec = S ? S.recorder(ctx) : null;
  }

  // ---------------------------------------------------------------- decisões humanas
  function makeIO() {
    return {
      notify: async (type, data) => { if (TM.el && TM.el.classList.contains('passive')) tmrStop(); if (U.rec) { try { const r = U.rec.ev(type, data, G); if (r) U.lastRec = r; } catch (e) { console.error('rec', e); } } const f = H[type]; if (f) { try { await f(data || {}); } catch (e) { if (e === 'abort') throw e; console.error('UI', type, e); } } },
      log: (text, cls) => { V.logs.push({ text, cls }); if (V.fxLines && cls === 'efeito') V.fxLines.push(text); if (cls !== 'prep' && !(FXB && cls === 'efeito')) caption(text, cls === 'vit'); const d = $('.logdrawer .lg'); if (d) d.append(el(`<p class="${cls}">${esc(text)}</p>`)); },
      orderHand: (p, hand, o) => orderHand(p, hand, o),
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
      async bet(p) {   // modo história, evento Aposta: 1 pêndulo antes de cada rodada
        const A = G.cfg.historia && G.cfg.historia.aposta; if (!A || p.bot || A.saldo() < 1) return false;
        const node = el(`<div class="sheet"><div class="txt"><h3>Aposta: 1 pêndulo?</h3><div class="hint">Vencer a rodada paga 2; perder custa 1; empate devolve. Você tem <b>${A.saldo()}</b>.</div><div class="row"><button class="btn primary sm" data-v="1">Apostar 1</button><button class="btn sm" data-v="0">Passar</button></div></div></div>`);
        const v = await ask(node, '[data-v]'); if (v === '1') { A.paga(); return true; } return false;
      },
      attr(p, entry, options, combat, canPrep) {   // modo história: Pressa cósmica (3 s) e Contagem final (5 s, −0,3 s por rodada)
        const rg = G.cfg.regra, sec = rg && rg.id === 'pressa' ? 3 : rg && rg.id === 'contagem' ? Math.max(1.5, 5 - 0.3 * (G.s.round - 1)) : 0;
        if (!sec || p.bot) return this.attr0(p, entry, options, combat, canPrep);
        return timed(sec, () => this.attr0(p, entry, options, combat, canPrep), () => options[Math.floor(Math.random() * options.length)]);
      },
      async attr0(p, entry, options, combat, canPrep) {
        await cover(p);
        const init = combat.initiator === p.pid; const ia = combat.entries.find(e => e.pid === combat.initiator).attr;
        if (U.tip) await U.tip(init ? 'attr_init' : 'attr_follow');
        const lst = options.map(a => '<b>' + ATT[a].nome + '</b>').join(options.length === 2 ? ' e ' : ', ');
        const blk = combat.blocked && !(combat.ctl && combat.ctl.universal) ? combat.blocked : null;   // atributo bloqueado pelo evento (só aparece se estaria disponível)
        const blkShow = blk && !options.includes(blk) && (init || ATT[blk].par === ATT[ia].par) ? blk : null;
        const txt = combat.ctl && combat.ctl.universal ? `Atributo universal: todos disputam em ${lst}.`
          : blkShow && options.length === (init ? 3 : 1) ? (init ? `Você inicia: <b>${ATT[blk].nome}</b> está bloqueado nesta disputa. Escolha entre ${lst}.` : `${esc(nameOf(combat.initiator))} iniciou em <b>${ATT[ia].nome}</b>. <b>${ATT[blk].nome}</b> está bloqueado: você usa ${lst}.`)
          : init ? (options.length < 4 ? `Você inicia, mas um especial limitou suas opções: ${lst}.` : 'Você inicia: escolha <b>qualquer</b> atributo.')
          : options.length === 1 ? `${esc(nameOf(combat.initiator))} iniciou em <b>${ATT[ia].nome}</b>. Por causa de um especial, você deve usar ${lst}.`
          : novice() ? `${esc(nameOf(combat.initiator))} iniciou em <b>${ATT[ia].nome}</b>. Escolha entre ${lst} — em segredo.`
          : `${esc(nameOf(combat.initiator))} iniciou em <b>${ATT[ia].nome}</b> · escolha: ${lst}`;
        const fog = (() => { const f = combat.ctl && combat.ctl.fog; return !!f && f.pid !== p.pid && (f.pid < 0 || !(G && G.sameTeam && G.sameTeam(f.pid, p.pid))); })();   // Névoa de Dados: rivais escolhem sem ver os números
        const evsum = (() => { if (!combat.ev || !entry.evm || fog) return ''; const b = CARDS[entry.card].stats; const ch = AIDS.filter(a => entry.stats[a] !== b[a]); return ch.length ? `<div class="evsum">Sua carta nesta rodada: ${ch.map(a => `${ATT[a].nome} ${b[a]} → <b>${entry.stats[a]}</b>`).join(' · ')}</div>` : ''; })();
        const evn = combat.ev ? `<div class="evnote" style="--ec:${EVUI[combat.ev.id].cor}">${EVUI[combat.ev.id].sim} <b>${esc(evName(combat.ev))}</b>: ${esc(E.EVENTOS[combat.ev.id].curto)}${evsum}</div>` : '';
        const em = entry.evm || {};
        const fogTxt = fog ? (combat.ctl.fog.pid < 0 ? `<div class="evnote" style="--ec:#c58cff">☁ <b>Névoa estelar</b>: os números estão ocultos. Escolha às cegas.</div>` : `<div class="evnote" style="--ec:#c58cff">☁ <b>Névoa de Dados</b>: ${esc(nameOf(combat.ctl.fog.pid))} é o único que vê os números. Escolha às cegas.</div>`) : '';
        const mk = () => { const node = el(`<div class="sheet pick1"><div class="cardbox"></div><div class="txt"><h3>${esc(p.name)}</h3><div class="hint">${txt}</div>${evn}${fogTxt}</div>
          <div class="attrs">${AIDS.filter(a => options.includes(a) || a === blkShow).map(a => a === blkShow ? `<button class="attrbtn blocked" data-a="${a}" disabled>${ICON[a]}<span><b>${ATT[a].nome}</b><small>bloqueado</small></span><span class="v">✕</span></button>` : `<button class="attrbtn${em.zero === a ? ' ecl' : ''}${em.swap && em.swap.includes(a) ? ' swp' : ''}${em[a] ? (em[a] > 0 ? ' evup' : ' evdn') : ''}" data-a="${a}" data-v="${a}">${ICON[a]}<span><b>${ATT[a].nome}</b><small>${ATT[a].tipo}</small></span><span class="v">${fog ? '?' : entry.stats[a]}</span></button>`).join('')}</div>
          ${spLine(entry.card, combat, canPrep)}</div>`);
          const big = window.matchMedia && window.matchMedia('(min-width: 900px) and (min-height: 640px)').matches;
          $('.cardbox', node).append(cardEl(entry.card, { up: true, noanim: true, cw: big ? Math.round(Math.min(200, Math.max(130, window.innerHeight * .24))) : Math.min(96, V.cw || 96), stats: entry.stats, mark: entry.evm, hide: fog }));
          return node; };
        for (;;) {
          const v = await ask(mk(), '.attrbtn, .prepbtn');
          if (v !== '@prep') return v;
          // mostra o que o especial faz e só então confirma
          const sp = E.SPECIALS[CARDS[entry.card].especial];
          const cf = el(`<div class="sheet"><div class="txt"><h3>✦ ${esc(sp.nome)}</h3><div class="hint">${esc(sp.texto)}</div>
            ${sp.stub ? '<div class="hint">⚠ Efeito ainda não implementado: ao virar, nada acontece e a carta vai ao Buraco Negro.</div>' : ''}
            <div class="hint">A carta sai do combate, fica fechada ao seu lado e a próxima do baralho entra no lugar.</div>
            <div class="row"><button class="btn primary sm" data-v="go">Usar como especial</button><button class="btn sm" data-v="back">Voltar</button></div></div></div>`);
          if (await ask(cf, '[data-v]') === 'go') return v;
        }
      },
      async special(p, usable, combat, ctx, stage) {
        // alvo lateral do especial ("à esquerda"/"à direita"): esquerda = o rival que aparece à esquerda na tela de quem joga (mesma lógica do motor)
        const sideOf = sp => { const t = (sp.texto || ''), d = /esquerda/.test(t) ? 'L' : /direita/.test(t) ? 'R' : null; if (!d || !G || !G.s) return null;
          const pl = G.s.players, n = pl.length; for (let k = 1; k < n; k++) { const x = (p.pid + (d === 'L' ? k : -k) + n * 2) % n; if (!pl[x].alive || (G.sameTeam && G.sameTeam(x, p.pid))) continue; return { d, pl: pl[x] }; } return null; };
        const sideTag = sp => { const s = sideOf(sp); return s ? `<div class="spt prev">Alvo (${s.d === 'L' ? 'esquerda' : 'direita'}): <b>${esc(s.pl.name)}</b></div>` : ''; };
        await cover(p); if (U.tip) await U.tip(stage === 'react' ? 'react' : 'special');
        const T = stage === 'ctrl' ? ['virar um especial de controle?', '']
          : stage === 'second' ? ['virar também um segundo especial?', '']
          : stage === 'react' ? ['reagir com um especial?', '']
          : ['virar um especial?', ''];
        const node = el(`<div class="sheet"><div class="txt" style="flex:1 1 100%"><h3>${esc(p.name)}: ${T[0]}</h3></div></div>`);
        if (stage === 'react' || stage === 'second') {
          const seen = ((combat && (combat.acts || (combat.ctrlActs || []).concat(combat.activations || []))) || []).filter(a => a.pid !== p.pid && CARDS[a.card]);
          if (stage === 'react' && seen.length) node.append(el(`<div class="txt why" style="flex:1 1 100%"><div class="hint">Virados pelos rivais: ${seen.map(a => `<b>${esc(nameOf(a.pid))}</b>: ${esc(E.SPECIALS[CARDS[a.card].especial].nome)}`).join(' · ')}. Você decide agora, sabendo disso. As escolhas dos reagentes são secretas e simultâneas.</div></div>`));
        }
        const me = combat && combat.entries && combat.entries.find(x => x.pid === p.pid);
        // prévia do que o especial faz na carta de combate (bônus e conversões): o jogador vê o resultado antes de escolher
        const preview = sp => {
          if (!me || !sp.fx || !me.stats) return '';
          let nx; try { nx = sp.fx(me.stats, me.attr); } catch (e) { return ''; }
          const eco = !!(combat && combat.ev && combat.ev.id === 'eco') && sp.cat !== 'Conversão';   // Eco dos Especiais: bônus e reduções valem o dobro (a prévia já mostra o valor dobrado)
          if (eco) nx = AIDS.reduce((o, a) => { o[a] = Math.max(0, me.stats[a] + 2 * (nx[a] - me.stats[a])); return o; }, Object.assign({}, nx));
          const ch = AIDS.filter(a => nx[a] !== me.stats[a]); if (!ch.length) return '<div class="spt prev">Sem efeito na sua carta agora.</div>';
          const parts = ch.map(a => a === me.attr ? `<b>${ATT[a].nome} (usado): ${me.stats[a]} → ${nx[a]}</b>` : `${ATT[a].nome} ${me.stats[a]} → ${nx[a]}`);
          return `<div class="spt prev">Sua carta: ${parts.join(' · ')}${eco ? ' <i>(dobrado pelo Eco)</i>' : ''}</div>`;
        };
        usable.forEach(id => {
          const sp = E.SPECIALS[CARDS[id].especial];
          const pk = el(`<div class="specpick"><div class="cb"></div><div class="spx"><div class="spn">✦ ${esc(sp.nome)}</div><div class="spt">${esc(sp.texto)}</div>${sideTag(sp)}${preview(sp)}<button class="btn primary sm" data-v="${id}">Virar</button></div></div>`);
          $('.cb', pk).append(cardEl(id, { up: true, noanim: true, cw: 72 })); node.append(pk);
        });
        // outros especiais preparados que não aparecem como opção: explica por que
        (p.prepared || []).filter(id => CARDS[id] && !usable.includes(id)).forEach(id => {
          const sp = E.SPECIALS[CARDS[id].especial]; if (!sp) return;
          const why = combat && combat.locked && combat.locked.has(id) ? 'Bloqueado nesta disputa.'
            : sp.phase === 'ctrl' && stage !== 'ctrl' ? 'Especial de controle: só podia ser virado antes da escolha dos atributos.'
            : sp.reactAlways && stage !== 'react' && stage !== 'second' ? 'Especial reativo: você poderá virar depois que todas as cartas forem reveladas, já sabendo o resultado.'
            : sp.react && stage !== 'react' && stage !== 'second' ? 'Especial reativo: você poderá virar depois que os rivais revelarem os especiais deles (se algum rival virar um).'
            : !sp.react && stage === 'react' ? 'Especial normal: só podia ser virado na janela anterior, antes da reação.'
            : sp.phase !== 'ctrl' && stage === 'ctrl' ? 'Você poderá virar esta depois da revelação (só 1 especial por disputa).'
            : stage === 'second' ? 'Não combina como segundo especial.'
            : (() => { const s = sideOf(sp); if (s && /reservas?/i.test(sp.nome) && Array.isArray(p.reserve) && Array.isArray(s.pl.reserve) && !p.reserve.length && !s.pl.reserve.length) return `Sua reserva e a de ${esc(s.pl.name)} (${s.d === 'L' ? 'esquerda' : 'direita'}) estão vazias: nada a trocar.`;
              return (s ? `Alvo (${s.d === 'L' ? 'esquerda' : 'direita'}): ${esc(s.pl.name)}. ` : '') + 'Não pode ser virado agora: a condição do efeito não é atendida nesta disputa.'; })();
          const pk = el(`<div class="specpick off"><div class="cb"></div><div class="spx"><div class="spn">✦ ${esc(sp.nome)}</div><div class="spt">${esc(sp.texto)}</div><div class="spt why">${why}</div></div></div>`);
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

  function orderHand(p, hand, o) {
    const rf = !!(o && o.refill), st = o && o.start != null ? o.start : null, N = G.s.players.length;
    const ini = k => st != null && (st + k) % N === p.pid;
    const lab = k => (k === 0 ? '1 · TOPO' : String(k + 1)) + (ini(k) ? ' <i class="ini">★</i>' : '');
    const seq = st != null ? Array.from({ length: N }, (_, i) => G.s.players[(st + i) % N].name).join(' → ') : '';
    return (async () => {
      await cover(p);
      return new Promise((res, rej) => {
        const run = U.run; run.rej.add(rej);
        let arr = hand.slice(), sel = -1, last = 0;
        const ov = el(`<div class="order"><div><h2 style="color:var(--gold2)">${esc(p.name)}: ${rf ? 'reordene as cartas da reserva' : 'monte seu baralho'}</h2>
          <div class="hint">${rf ? 'Seu baralho acabou: estas cartas vieram da reserva. ' : ''}<b>Arraste</b> as cartas para reordenar; toque numa carta para ver os detalhes. A carta <b>nº 1</b> é a primeira a entrar em disputa.${st != null ? `<br>Iniciativa: <b>${esc(seq)}</b>. <i class="ini">★</i> = disputa em que você inicia (declara o atributo).` : ''}</div></div>
          ${(() => { const rg = G.cfg.regra, ab = rg && (rg.id === 'abertas' || rg.id === 'clarividente' || rg.id === 'espelho' || rg.id === 'memoria') && !rf && G.cfg.maos ? G.cfg.maos.slice(1).flat() : null; return ab ? `<div class="hint" style="margin-top:4px"><b>Cartas do inimigo</b> (na ordem em que entram)</div><div class="row abertas" style="justify-content:center;flex-wrap:wrap;gap:3px">${ab.map(c => `<span data-c="${c}"></span>`).join('')}</div>` : ''; })()}
          <div class="grid"></div><div class="info"></div>
          <div class="row" style="justify-content:center"><button class="btn sm" data-a="best">Melhores primeiro</button><button class="btn sm" data-a="mix">Embaralhar</button>${!rf && o && o.reserve && o.reserve.length ? `<button class="btn sm" data-a="res">Ver reserva (${o.reserve.length})</button>` : ''}</div>
          <div class="row" style="justify-content:center"><button class="btn primary" data-a="ok">Confirmar ordem ▶</button></div></div>`);
        $$('.abertas [data-c]', ov).forEach(sp => sp.append(cardEl(sp.dataset.c, { up: true, noanim: true, cw: 40 })));
        const W = window.innerWidth - 32;
        let cw = Math.floor((W - 6 * 10) / 7); if (cw < 70) cw = Math.floor((W - 3 * 10) / 4); cw = Math.max(64, Math.min(112, cw));
        function renum() { $$('.oc', $('.grid', ov)).forEach((n, k) => { $('.no', n).innerHTML = lab(k); }); }
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
            const w = el(`<div class="oc${sel === i ? ' sel' : ''}"><div class="no">${lab(i)}</div></div>`);
            w.dataset.id = id; w.append(cardEl(id, { up: true, noanim: true, cw })); w.addEventListener('pointerdown', ev => dragStart(ev, w, i)); return w;
          }));
          const id = arr[last], c = CARDS[id], sp = E.SPECIALS[c.especial];
          $('.info', ov).innerHTML = `<b>${esc(c.nome)}</b> · ${AIDS.map(a => `<span class="ico" data-a="${a}" title="${ATT[a].nome}">${ICON[a]}${c.stats[a]}</span>`).join(' ')}<br>✦ <b>${esc(sp.nome)}</b> — ${esc(sp.texto)}`;
        }
        ov.onclick = e => {
          const b = e.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a; SND.play('click');
          if (a === 'best') { arr.sort((x, y) => E.sum4(CARDS[y].stats) - E.sum4(CARDS[x].stats)); sel = -1; }
          else if (a === 'mix') { arr.sort(() => Math.random() - .5); sel = -1; }
          else if (a === 'res') { showReserve(o.reserve); return; }
          else if (a === 'ok') { run.rej.delete(rej); ov.remove(); return res(arr); }
          draw();
        };
        $('#game').append(ov); draw(); if (U.tip) U.tip('order');
      });
    })();
  }

  // duplas: parceiros dividem a cor da dupla (ciano / violeta); sem duplas, cada jogador volta à sua cor
  const PCOL0 = PCOL.slice();
  function teamColors(teams) { PCOL.forEach((_, i) => { PCOL[i] = teams ? (teams.findIndex(t => t.includes(i)) === 0 ? 'var(--nexus)' : 'var(--nexus2)') : PCOL0[i]; }); }
  U.teamColors = teamColors;
  // ---------------------------------------------------------------- iniciar
  U.__tb = tieBreak;   // gancho de teste
  U.startGame = async function (cfg) {
    lastCfg = cfg; SND.init(); U.killRun(); U.newRun(); $$('#layer > *').forEach(x => x.remove()); teamColors(cfg.teams);
    if (!FX.cv) FX.init();
    V = { n: cfg.players.length, humans: cfg.players.filter(p => !p.bot).length, viewer: Math.max(0, cfg.players.findIndex(p => !p.bot)), noPrep: {}, seats: {}, slots: {}, pos: {}, combat: null, logs: [], init: null, muted: false };
    SND.histLock = cfg.historia ? cfg.historia.musica : null; U.show('game'); shell();
    if (cfg.historia && cfg.historia.evento) { const ev = cfg.historia.evento, host = $('#game'); const chip = el(`<button class="evchip" type="button" aria-label="Evento: ${esc(ev.nome)}">⚡ Evento</button>`); chip.onclick = () => { SND.play('click'); U.modal(el(`<div class="evbox"><h2 style="color:var(--gold2)">⚡ ${esc(ev.nome)}</h2><p>${esc(ev.regra)}</p></div>`)); }; if (host) host.append(chip); setTimeout(() => banner(ev.nome, ev.regra, '#ffd25f', 3600), 500); }
    newRec({ viewer: V.humans ? V.viewer : -1, online: false, humans: V.humans, n: V.n, diff: recDiff(cfg.players, cfg.difficulty), per: cfg.perPlayer, sf: cfg.specialsFrom, duo: !!cfg.teams, ev: cfg.events !== false, shared: true });
    G = new E.Game({ players: cfg.players, perPlayer: cfg.perPlayer, difficulty: cfg.difficulty, specialsFrom: cfg.specialsFrom, events: cfg.events !== false, teams: cfg.teams || null, maos: cfg.maos || null, regra: cfg.regra || null, bonusPids: cfg.bonusPids || null, bonusVal: cfg.bonusVal || 0, bonusCards: cfg.bonusCards || null, semMontar: !!cfg.semMontar, maxCombats: cfg.maxCombats || 400, historia: cfg.historia || null, io: makeIO() });
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

  // dificuldade registrada: a comum a todos os bots; se forem mistas, 'misto' (não conta para a conquista de nível Difícil)
  const recDiff = (list, dflt) => { const d = [...new Set((list || []).filter(p => p.bot).map(p => p.diff || dflt || 'normal'))]; return d.length === 1 ? d[0] : d.length ? 'misto' : (dflt || 'normal'); };
  U.startOnline = async function (ctl) {
    lastCfg = null; SND.init(); U.killRun(); U.newRun(); U.onlineOff && U.onlineOff(); $$('#layer > *').forEach(x => x.remove());
    if (!FX.cv) FX.init();
    const seats = ctl.seats, host = ctl.role === 'host', link = ctl.link, cfg = ctl.cfg;
    V = { n: seats.length, humans: 1, online: true, ctl, viewer: ctl.viewer, noPrep: {}, seats: {}, slots: {}, pos: {}, combat: null, logs: [], init: null, muted: false };
    U.show('game'); shell();
    newRec({ viewer: ctl.viewer, online: true, humans: seats.filter(s => !s.bot).length, n: seats.length, diff: recDiff(seats, cfg.diff), per: cfg.per, sf: cfg.sf, duo: !!cfg.teams, ev: cfg.ev !== false, shared: host });
    const local = makeIO(), off = [], pending = new Map(); let seq = 0, closed = false;
    U.onlineOff = () => { closed = true; off.forEach(f => { try { f(); } catch (e) { } }); pending.forEach(q => q.finish(undefined)); pending.clear(); };
    const send = (o, to) => { if (!closed) link.send('ev', o, to).catch(() => { }); };
    const leaveNow = (msg) => { U.killRun(); U.onlineOff(); const n = el(`<div class="modal"><div class="box"><div class="final"><h1>${esc(msg)}</h1><div class="row" style="justify-content:center"><button class="btn primary">Voltar ao menu</button></div></div></div></div>`); $('button', n).onclick = () => { n.remove(); V.ctl.leave(); }; U.layer().appendChild(n); };

    if (host) {
      const P = window.DSPriv.create({ get s() { return G.s; }, teams: cfg.teams || null });   // visão por jogador: só as próprias cartas privadas saem do anfitrião
      let logq = [], flushing = false;
      let askSeq = 0;
      const fbOf = (kind, p, a) => kind === 'orderHand' ? G.botOrderHand(a[0], p, a[1] && a[1].start) : (G['bot_' + kind] ? G['bot_' + kind](p, ...a) : undefined);
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
        return remoteAsk(p, kind, mk(p, ...a), () => fbOf(kind, p, a));
      };
      const io = {
        notify: async (type, data) => {
          P.note(type); const n = ++seq; data = data || {};
          const view = i => { const o = { n, t: type, d: P.ev(type, data, i), st: P.state(i) }; if (P.f.combatOn && G.combat && type !== 'combatEnd') o.cb = P.cb(G.combat, i); else if (type === 'combatEnd') o.cb = null; return o; };
          if (type === 'peek') { const to = seats[data.pid] && seats[data.pid].peer; if (to && to !== link.me) send(view(data.pid), to); }
          else seats.forEach((s, i) => { if (s.peer && s.peer !== link.me && !s.bot) send(view(i), s.peer); });
          if (type === 'combatEnd') P.f.combatOn = false;
          return local.notify(type, data);
        },
        log: (text, cls) => { local.log(text, cls); logq.push([text, cls || '']); if (!flushing) { flushing = true; queueMicrotask(() => { flushing = false; send({ n: ++seq, t: 'log', lg: logq.splice(0) }); }); } },
        orderHand: wrap('orderHand', (p, hand, o) => [hand, o]),
        prepare: wrap('prepare', (p, top) => [top]),
        attr: wrap('attr', (p, entry, options, combat, canPrep) => [{ card: entry.card, stats: entry.stats }, options, P.cb(combat, p.pid), canPrep]),
        special: wrap('special', (p, usable, combat, ctx, stage) => [usable, Object.assign({}, P.cb(combat, p.pid), { acts: (combat.ctrlActs || []).concat(combat.activations || []).map(x => ({ pid: x.pid, card: x.card })) }), null, stage]),   // acts: especiais já virados (públicos), para a janela de reação
        pickCards: async (p, spec) => {
          const peer = seats[p.pid].peer, w = wrap('pickCards', (q, sp) => [plain(sp)]);
          if (!spec.blind || !peer || peer === link.me) return w(p, spec);
          const b = P.blind(spec);   // escolha às cegas: o convidado só vê posições
          const r = await remoteAsk(p, 'pickCards', [plain(b.spec)], () => fbOf('pickCards', p, [spec]));
          return Array.isArray(r) ? r.map(x => b.map[x] || x) : r;
        },
        pickAttr: wrap('pickAttr', (p, spec) => [plain(spec)]),
        chooseTarget: wrap('chooseTarget', (p, cands, label) => [cands, label]),
      };
      const players = seats.map((s, i) => ({ name: s.name, bot: s.bot, avatar: i, diff: s.bot ? s.diff : undefined }));
      teamColors(cfg.teams); G = new E.Game({ players, perPlayer: cfg.per, difficulty: cfg.diff, specialsFrom: cfg.sf, events: cfg.ev !== false, teams: cfg.teams || null, seed: cfg.seed, io });
      U.game = G;
      // queda de conexão: carência de 25 s (reconexões rápidas são normais); depois um CPU assume, com aviso na tela. O jogador pode voltar ao lugar.
      const grace = new Map(), present = peer => !!peer && link.peers().some(p => p.peer === peer);
      const notice = (title, sub) => { banner(title, sub, '#ffd25f', 3200); send({ n: ++seq, t: 'notice', title, sub }); };
      const publishRj = () => { if (closed) return; const rj = seats.map((s, i) => ({ s, i })).filter(x => x.s.u && x.s.peer !== link.me && G.p(x.i) && (G.p(x.i).bot || !present(x.s.peer))).map(x => ({ i: x.i, u: x.s.u, n: x.s.name }));
        const open = V.allowJoin === false ? [] : seats.map((s, i) => ({ s, i })).filter(x => x.s.peer !== link.me && G.p(x.i) && G.p(x.i).bot && G.p(x.i).alive && !rj.some(r => r.i === x.i)).map(x => ({ i: x.i, n: x.s.name }));
        link.presence({ rj, open }).catch(() => { }); };
      V.republish = publishRj;
      const away = (i, on) => { const a = G.s.away = (G.s.away || []).filter(x => x !== i); if (on) a.push(i); try { refresh(); } catch (e) { } };
      const toBot = i => {
        const p = G.p(i); if (!p || p.bot || closed) return; const old = seats[i].peer;
        p.bot = true; away(i, false); G.log(`${p.name} saiu da partida. Um CPU assumiu o lugar.`, 'efeito');
        notice(`${p.name} saiu`, 'Um CPU assumiu o lugar');
        pending.forEach(q => { if (q.peer === old) q.finish(undefined); }); publishRj();
      };
      const sync = i => { const peer = seats[i].peer; if (!peer || closed) return; send({ n: ++seq, t: 'sync', st: P.state(i), cb: P.f.combatOn && G.combat ? P.cb(G.combat, i) : null }, peer); };
      off.push(link.onPeers(ch => {
        ch.left.forEach(pe => {
          const i = seats.findIndex(s => s.peer === pe.peer); if (i < 0 || !G.p(i) || G.p(i).bot || grace.has(pe.peer)) return;
          away(i, true); notice(`${G.p(i).name} perdeu a conexão`, 'Aguardando 25 s antes de passar para o CPU');
          grace.set(pe.peer, setTimeout(() => { grace.delete(pe.peer); if (!closed && seats[i].peer === pe.peer && !present(pe.peer)) toBot(i); }, 25000));
        });
        ch.joined.forEach(pe => { if (grace.has(pe.peer)) { clearTimeout(grace.get(pe.peer)); grace.delete(pe.peer); const i = seats.findIndex(s => s.peer === pe.peer); if (i >= 0) { away(i, false); notice(`${G.p(i).name} voltou`, 'Conexão restabelecida'); sync(i); } } });
        publishRj();
      }));
      off.push(() => grace.forEach(t => clearTimeout(t)));
      off.push(link.on('msg', (d, m) => {
        if (!d || d.t !== 'rejoin') return;
        if (d.take) {   // pessoa nova assume o lugar de uma CPU
          const k = d.i, p = G.p(k), sk = seats[k];
          const again = sk && sk.peer === m.peer && p && !p.bot;   // pedido repetido: só reenvia
          const ok = again || (V.allowJoin !== false && p && sk && p.bot && p.alive && sk.peer !== link.me && !seats.some(x => x.peer === m.peer));
          if (!ok) { link.send('msg', { t: 'rejoinNo' }, m.peer).catch(() => { }); return; }
          if (!again) {
            const was = p.name; sk.peer = m.peer; sk.u = d.u || ''; sk.name = String(d.n || was).slice(0, 14); sk.bot = false; p.name = sk.name; p.bot = false;
            G.log(`${p.name} entrou e assumiu o lugar de ${was}.`, 'efeito'); notice(`${p.name} entrou`, `Assumiu o lugar de ${was}`); publishRj(); refresh();
          }
          link.send('go', Object.assign({}, cfg, { seats: seats.map(x => ({ name: x.name, bot: x.bot, peer: x.peer, u: x.u })), rejoin: k }), m.peer).catch(() => { });
          setTimeout(() => sync(k), 900); setTimeout(() => sync(k), 3000); return;
        }
        const i = seats.findIndex((s, k) => k === d.i && s.peer !== link.me && ((s.u && s.u === d.u) || s.name === d.n)); if (i < 0 || !G.p(i)) return;
        const old = seats[i].peer; if (old && old !== m.peer && present(old)) return;   // o dono original ainda está conectado
        if (grace.has(old)) { clearTimeout(grace.get(old)); grace.delete(old); } away(i, false);
        pending.forEach(q => { if (q.peer === old) q.finish(undefined); });
        const was = G.p(i).bot || old !== m.peer; seats[i].peer = m.peer; G.p(i).bot = false;
        if (was) { G.log(`${G.p(i).name} voltou e reassumiu o lugar do CPU.`, 'efeito'); notice(`${G.p(i).name} voltou`, 'Reassumiu o lugar do CPU'); }
        publishRj();
        link.send('go', Object.assign({}, cfg, { seats: seats.map(s => ({ name: s.name, bot: s.bot, peer: s.peer, u: s.u })), rejoin: i }), m.peer).catch(() => { });
        setTimeout(() => sync(i), 900); setTimeout(() => sync(i), 3000);
      }));
      try { await G.run(); } catch (e) { if (e !== 'abort') { console.error(e); caption('Erro: ' + (e && e.message || e)); } }
      return;
    }

    // ----- convidado: espelha o estado e executa as decisões pedidas
    teamColors(cfg.teams); G = { cfg: { specialsFrom: cfg.sf, teams: cfg.teams || null }, teamOf(pid) { const t = this.cfg.teams; if (!t) return pid; const i = t.findIndex(g => g.includes(pid)); return i < 0 ? pid : 't' + i; }, logs: [], s: { players: seats.map((s, i) => ({ pid: i, name: s.name, bot: s.bot, avatar: i, alive: true, deck: [], reserve: [], prepared: [] })), bh: [], round: 1, combats: 0, initiator: 0, over: false, winner: null },
      p(pid) { return this.s.players[pid]; }, alive() { return this.s.players.filter(p => p.alive).map(p => p.pid); } };
    U.game = G;
    const applyState = st => { G.s.players = st.players; G.s.bh = st.bh.map(x => { const i = x.indexOf(':'); return i < 0 ? { id: x, kind: 'normal' } : { id: x.slice(0, i), kind: x.slice(i + 1) }; }); ['round', 'combats', 'initiator', 'over', 'winner', 'winnerTeam', 'byLimit', 'events', 'away'].forEach(k => { G.s[k] = st[k]; }); };
    let last = 0, synced = !ctl.rejoin, queue = Promise.resolve(); const answered = new Map(), inflight = new Set();
    const enqueue = fn => { queue = queue.then(fn).catch(e => { if (e !== 'abort') console.error('online', e); }); };
    off.push(link.on('ev', (m, msg) => {
      if (msg.peer !== ctl.hostPeer || m.n <= last) return; last = m.n;
      if (m.t === 'notice') { banner(m.title, m.sub, '#ffd25f', 3200); return; }
      if (ctl.rejoin && !synced && m.t !== 'sync') return;   // reentrada: só acompanha depois do primeiro retrato da mesa
      enqueue(async () => {
        if (m.st) applyState(m.st); if (m.cb !== undefined) V.combat = m.cb;
        if (m.t === 'sync') { synced = true; if (!Object.keys(V.seats).length) buildBoard(); V.init = G.s.initiator; refresh(); banner('Você voltou à partida', V.online && V.ctl ? 'Sala ' + V.ctl.link.code : '', '#7dffb0', 2600); caption('Você voltou à partida.'); return; }
        if (m.t === 'log') { m.lg.forEach(([t, c]) => local.log(t, c)); return; }
        if (m.t === 'waiting') { const p = G.p(m.pid); if (p) { caption(m.pid === V.viewer ? 'Sua vez de decidir.' : `Aguardando ${p.name}…`); if (m.pid !== V.viewer && m.tl) tmrStart(m.tl + 2, { label: p.name }); } return; }
        await local.notify(m.t, m.d || {});
      });
    }));
    off.push(link.on('ask', (m, msg) => {
      if (msg.peer !== ctl.hostPeer || (ctl.rejoin && !synced)) return;
      if (answered.has(m.id)) { link.send('ans', { id: m.id, v: answered.get(m.id) }).catch(() => { }); return; }
      if (inflight.has(m.id)) return; inflight.add(m.id);
      enqueue(async () => {
        let v; try { v = await timed(m.tl || tlOf(m.kind), () => local[m.kind](G.p(m.pid), ...m.args), null); } catch (e) { if (e === 'abort') return; console.error(e); }
        const out = v === undefined ? null : v; answered.set(m.id, out); inflight.delete(m.id);
        link.send('ans', { id: m.id, v: out }).catch(() => { });
      });
    }));
    let hostGone = null;   // carência: queda curta de conexão não derruba a partida
    off.push(link.onPeers(() => {
      if (closed || G.s.over) return; const has = link.peers().some(p => p.peer === ctl.hostPeer);
      if (has) { if (hostGone) { clearTimeout(hostGone); hostGone = null; caption('Conexão restabelecida.'); } }
      else if (!hostGone) { caption('Reconectando à sala…'); hostGone = setTimeout(() => { hostGone = null; if (!closed && !G.s.over && !link.peers().some(p => p.peer === ctl.hostPeer)) leaveNow('O anfitrião saiu da partida. Sala ' + link.code + ': se ele voltar, use "Voltar à sala".'); }, 25000); }
    }));
    off.push(() => { if (hostGone) clearTimeout(hostGone); });
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
