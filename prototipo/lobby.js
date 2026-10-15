/* Dimensions Stacks — tela única de montagem da mesa (contra CPU e sala online): modo, jogadores, duplas, regras.
   Só desenha e despacha ações; quem usa (ui.js / online.js) guarda os dados e chama de novo ao mudar. */
(function () {
  'use strict';
  const U = window.DSUI;
  const { $, esc } = U;
  const PCOL = ['var(--p0)', 'var(--p1)', 'var(--p2)', 'var(--p3)'];   // cores fixas dos jogadores (U.PCOL muda durante partidas de duplas)

  const I = {
    back: '<path d="m15 5-7 7 7 7"/>',
    all: '<circle cx="12" cy="5.5" r="2.4"/><circle cx="5.5" cy="17" r="2.4"/><circle cx="18.5" cy="17" r="2.4"/><path d="M10.6 7.7 6.9 14.9M13.4 7.7l3.7 7.2M8 17h8"/>',
    duo: '<circle cx="6.5" cy="7" r="2.4"/><circle cx="6.5" cy="17" r="2.4"/><circle cx="17.5" cy="7" r="2.4"/><circle cx="17.5" cy="17" r="2.4"/><path d="M6.5 9.4v5.2M17.5 9.4v5.2" stroke-dasharray="1.5 3"/>',
    dice: '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8.5 8.5v.01M15.5 8.5v.01M12 12v.01M8.5 15.5v.01M15.5 15.5v.01"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4H6.5A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8"/>',
    ck: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    bot: '<rect x="4" y="8" width="16" height="11" rx="3"/><path d="M12 8V5M9.5 13.5v.01M14.5 13.5v.01M9 16.5h6"/>',
    swap: '<path d="M7 4 3.5 7.5 7 11M3.5 7.5h14M17 13l3.5 3.5L17 20M20.5 16.5h-14"/>',
    shuf: '<path d="M3 7h3.5c4 0 5 10 9 10H21M3 17h3.5c1.6 0 2.7-1.6 3.7-3.4M21 7h-5.5c-1.6 0-2.7 1.6-3.7 3.4M18.5 4.5 21 7l-2.5 2.5M18.5 14.5 21 17l-2.5 2.5"/>',
    play: '<path d="M7 4.5v15l13-7.5z" style="fill:currentColor;stroke:none"/>',
    eye: '<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.8"/>',
  };
  const ic = k => `<svg class="lb-i" viewBox="0 0 24 24" aria-hidden="true">${I[k]}</svg>`;
  U.lobbyIcon = ic;
  const DF = [['facil', 'Fácil'], ['normal', 'Normal'], ['dificil', 'Difícil']];
  const dfName = d => (DF.find(x => x[0] === d) || DF[1])[1];
  const POS = { 2: ['b', 't'], 3: ['b3', 'tl', 'tr'], 4: ['b', 'l', 't', 'r'] };
  const tcol = i => (i % 2 === 0 ? 'var(--nexus)' : 'var(--nexus2)');   // assentos alternam: dupla A = 0 e 2, dupla B = 1 e 3

  const av = (p, col, cls) => `<span class="lb-avw"><span class="lb-av ${cls || ''}" style="--c:${col}">${p.cpu ? ic('bot') : esc((p.name || '?')[0].toUpperCase())}</span>${p.live ? '<i class="lb-dot"></i>' : ''}</span>`;

  function table(m, interactive) {
    const duo = m.mode === 'duo', n = duo ? 4 : m.N, pos = POS[n] || POS[4];
    const links = duo ? `<svg class="lb-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><line x1="50" y1="30" x2="50" y2="70" stroke="var(--nexus)"/><line x1="30" y1="50" x2="70" y2="50" stroke="var(--nexus2)"/></svg>` : '';
    const seats = m.seats.slice(0, n).map((p, i) => {
      const col = duo ? tcol(i) : PCOL[i];
      const sel = interactive && m.sel === i, tgt = false;
      const tag = p.cpu ? dfName(p.diff) : (p.tag || '');
      return `<button type="button" class="lb-sit lb-${pos[i]}${sel ? ' sel' : ''}${tgt ? ' tgt' : ''}${m.pop && m.pop.includes(i) ? ' lbpop' : ''}" data-seat="${i}" style="--sc:${col}" ${interactive ? '' : 'disabled'}>${av(p, col)}<span class="lb-nm">${p.me ? 'Você' : esc(p.name)}</span>${tag ? `<span class="lb-tag">${esc(tag)}</span>` : ''}</button>`;
    }).join('');
    return `<div class="lb-table">${links}${seats}</div>`;
  }
  function panel(m) {
    const duo = m.mode === 'duo';
    const p = m.seats[m.sel];
    if (!p) return `<div class="lb-panel empty"></div>`;
    const col = duo ? tcol(m.sel) : PCOL[m.sel];
    const wat = m.watchable && m.sel === 0 ? `<div class="lb-seg sm" role="group" aria-label="Seu lugar"><button type="button" data-watch="0" class="${p.cpu ? '' : 'on'}">Jogar</button><button type="button" data-watch="1" class="${p.cpu ? 'on' : ''}">Só assistir</button></div>` : '';
    const head = `<div class="lb-pl">${av(p, col, 'xs')}<div class="lb-who"><b>${p.me ? 'Você' : esc(p.name)}${p.host ? '<span class="lb-pill host">anfitrião</span>' : ''}</b></div>${wat}
      ${p.cpu ? `<button type="button" class="lb-ibtn" data-a="dice" aria-label="Sortear outro nome">${ic('dice')}</button>` : ''}</div>`;
    const diff = p.cpu ? `<div class="lb-seg sm">${DF.map(([v, t]) => `<button type="button" data-d="${v}" class="${p.diff === v ? 'on' : ''}">${t}</button>`).join('')}</div>`
      : '';
    return `<div class="lb-panel fade">${head}${diff}</div>`;
  }
  /* m: { role:'local'|'host'|'guest', title, code, mode:'ffa'|'duo', N, hum (humanos na mesa), seats:[{name,cpu,diff,me,host,live,fixed,tag}],
          sel, swap, pop, per, ev, canStart, wait, watchable } */
  function html(m) {
    const guest = m.role === 'guest', duo = m.mode === 'duo', n = duo ? 4 : m.N;
    const modeSeg = guest
      ? `<div class="lb-chips"><span class="lb-chip"><b>${duo ? 'Duplas 2×2' : 'Todos contra todos'}</b></span><span class="lb-chip"><b>${n}</b> jogadores</span><span class="lb-chip"><b>${m.per}</b> cartas</span><span class="lb-chip">${m.ev ? 'Fenômenos' : 'Sem fenômenos'}</span></div>`
      : `<div class="lb-seg"><button type="button" data-mode="ffa" class="${!duo ? 'on' : ''}">${ic('all')} Todos contra todos</button><button type="button" data-mode="duo" class="duo ${duo ? 'on' : ''}">${ic('duo')} Duplas 2×2</button></div>`;
    const sub = guest ? ''
      : duo ? `<div class="lb-subrow"><button type="button" class="lb-btn wide" data-a="shuffle">${ic('shuf')} Sortear duplas</button></div>`
        : `<div class="lb-subrow"><div class="lb-seg">${[2, 3, 4].map(k => `<button type="button" data-n="${k}" class="${n === k ? 'on' : ''}" ${m.hum > k ? 'disabled' : ''}>${k} jogadores</button>`).join('')}</div></div>`;
    const rules = guest ? '' : `<div class="lb-rules"><div class="lb-opt"><b>Cartas</b><div class="lb-step"><button type="button" data-per="-1" aria-label="Menos cartas">−</button><output>${m.per}</output><button type="button" data-per="1" aria-label="Mais cartas">+</button></div></div>
      <div class="lb-opt"><b>Fenômenos</b><button type="button" class="lb-sw${m.ev ? ' on' : ''}" data-ev role="switch" aria-checked="${!!m.ev}" aria-label="Fenômenos dimensionais"></button></div></div>`;
    const bottom = guest
      ? `<div class="lb-wait onwait"><b>${esc(m.wait || 'Aguardando o anfitrião')}<span class="lb-dots"><span>.</span><span>.</span><span>.</span></span></b></div><div class="lb-cta"><button type="button" class="lb-go ghost" data-a="leave">Sair da sala</button></div>`
      : `<div class="lb-cta"><button type="button" class="lb-go" data-a="start" ${m.canStart === false ? 'disabled' : ''}>${ic('play')} Começar partida</button><div class="lb-sum">${n} jogadores · ${duo ? 'Duplas 2×2' : 'Todos contra todos'} · ${m.per} cartas</div></div>`;
    const pn = guest ? '' : panel(m);
    return `<div class="lb-app"><div class="lb-hd"><button type="button" class="lb-back" data-a="${m.role === 'local' ? 'back' : 'leave'}" aria-label="Voltar">${ic('back')}</button><h1>${esc(m.title)}</h1>${m.code ? `<button type="button" class="lb-code" data-a="copy" aria-label="Copiar código da sala"><b class="roomcode">${esc(m.code)}</b>${ic('copy')}</button>` : ''}</div>
      ${modeSeg}${sub}${table(m, !guest)}${pn}${rules}${bottom}</div>`;
  }

  // desenha em root e liga os cliques; act(nome, valor) é chamado pelo dono dos dados
  function mount(root, m, act) {
    root.classList.add('lbs');
    root.innerHTML = html(m);
    // arrastar um assento sobre outro troca os dois (CPU ou anfitrião; "Você" na partida local é fixo)
    document.querySelectorAll('.lb-ghost').forEach(x => x.remove());
    let drag = null, justDragged = false;
    const seatAt = (x, y) => { const o = document.elementFromPoint(x, y); return o && o.closest ? o.closest('.lb-sit') : null; };
    root.oncontextmenu = e => { if (e.target.closest('.lb-sit')) e.preventDefault(); };   // toque longo não abre menu nem cancela o arrasto
    root.onpointerdown = e => {
      const st = e.target.closest('.lb-sit'); if (!st || st.disabled || e.button > 0) return;
      const i = +st.dataset.seat; if ((m.seats[i] || {}).fixed) return;
      drag = { i, st, x: e.clientX, y: e.clientY, on: false, ghost: null, over: null, id: e.pointerId };
    };
    root.onpointermove = e => {
      if (!drag || e.pointerId !== drag.id) return;
      if (drag.on && e.pointerType === 'mouse' && e.buttons === 0) return endDrag(e, true);
      if (!drag.on) {
        if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 18) return;   // toque com dedo tremendo não vira arrasto
        drag.on = true; try { drag.st.setPointerCapture(e.pointerId); } catch (er) { }
        const fin = ev => endDrag(ev, ev.type === 'pointercancel' || ev.type === 'touchcancel' || ev.type === 'blur');   // garante que o fantasma nunca fica preso
        const evs = ['pointerup', 'pointercancel', 'touchend', 'touchcancel', 'blur'];
        evs.forEach(n => window.addEventListener(n, fin, true)); drag.off = () => evs.forEach(n => window.removeEventListener(n, fin, true));
        const g = drag.st.cloneNode(true); g.className = 'lb-ghost'; g.removeAttribute('data-seat'); document.body.append(g); drag.ghost = g;
        drag.st.classList.add('lifted'); root.classList.add('dragging');
        root.querySelectorAll('.lb-sit').forEach(x => { if (x !== drag.st && !(m.seats[+x.dataset.seat] || {}).fixed) x.classList.add('tgt'); });
      }
      drag.ghost.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      const o = seatAt(e.clientX, e.clientY); const ok = o && o !== drag.st && !(m.seats[+o.dataset.seat] || {}).fixed ? o : null;
      if (ok !== drag.over) { if (drag.over) drag.over.classList.remove('hot'); if (ok) ok.classList.add('hot'); drag.over = ok; }
    };
    const endDrag = (e, cancel) => {
      const d = drag; drag = null; if (!d) return;
      if (!d.on) { if (!cancel) { justDragged = true; setTimeout(() => { justDragged = false; }, 60); act('seat', d.i); } return; }   // toque (mesmo com dedo tremendo): seleciona direto, sem depender do click
      if (d.off) d.off();
      justDragged = true; setTimeout(() => { justDragged = false; }, 60);
      if (d.ghost) d.ghost.remove(); d.st.classList.remove('lifted'); root.classList.remove('dragging');
      root.querySelectorAll('.lb-sit.tgt,.lb-sit.hot').forEach(x => x.classList.remove('tgt', 'hot'));
      document.querySelectorAll('.lb-ghost').forEach(x => x.remove());
      const o = cancel ? null : seatAt(e.clientX, e.clientY);
      if (o && o !== d.st && !(m.seats[+o.dataset.seat] || {}).fixed) { U.SND && U.SND.play && U.SND.play('click'); act('move', [d.i, +o.dataset.seat]); }
      else if (!cancel) act('seat', d.i);   // soltou no mesmo lugar ou fora: conta como toque (seleciona)
    };
    root.onpointerup = e => endDrag(e, false);
    root.onpointercancel = e => endDrag(e, true);
    root.onclick = e => {
      if (justDragged) return;
      const b = e.target.closest('button'); if (!b || b.disabled) return;
      const d = b.dataset; let a = null, v = null;
      if (d.mode) { a = 'mode'; v = d.mode; } else if (d.n) { a = 'n'; v = +d.n; } else if (d.per) { a = 'per'; v = +d.per; }
      else if (b.hasAttribute('data-ev')) a = 'ev'; else if (d.d) { a = 'diff'; v = d.d; } else if (d.watch != null) { a = 'watch'; v = d.watch === '1'; }
      else if (d.seat != null) { a = 'seat'; v = +d.seat; } else if (d.a) a = d.a;
      if (!a) return;
      U.SND && U.SND.init && U.SND.init(); U.SND && U.SND.play && U.SND.play('click');
      if (a === 'copy') { const o = b.innerHTML; try { navigator.clipboard.writeText(m.code); } catch (er) { } b.innerHTML = `<b class="roomcode">${esc(m.code)}</b>${ic('ck')}`; setTimeout(() => { if (b.isConnected) b.innerHTML = o; }, 1200); return; }
      act(a, v);
    };
  }

  U.lobby = { mount, html, tcol, DF };
})();
