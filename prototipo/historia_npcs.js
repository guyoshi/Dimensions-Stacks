/* Modo história: NPCs (cadeia da Encomenda com 12, 19 missões de conquista), vendedores das lojas, fragmentos dimensionais (48 fontes; moeda das melhorias das lojas),
   registros (8) e selos de contenção. Aprovado pelo autor em 29/10/2026. Dados em historia_npcs_dados.js (tabela: mudar o mapa é editar a linha).
   A recompensa final da cadeia é a carta lendária Átila (V26) + 50 pêndulos; só ali ela existe. */
(function () {
  'use strict';
  const D = window.DS_NPCS; if (!D) return;
  let A = null;                                   // API entregue por historia.js
  const CH = D.cadeia, QS = D.quests, ALL = CH.concat(QS), BYID = {}; ALL.forEach(n => { BYID[n.id] = n; });
  const isCh = n => CH.includes(n);
  const FRAG_TOTAL = 48, PEND_CADEIA = 15, FINAL = { pend: 50, carta: 'V26' };   // 48 fontes de fragmentos; o último NPC da cadeia dá a carta Átila (V26) no lugar do fragmento
  // melhorias gerais: 1 por loja, compradas com fragmentos. Preenchidas quando o autor definir (nome, texto, preço em fragmentos); sem entrada, a loja não mostra nada.
  // 2 por loja (10 melhorias aprovadas em 29/10/2026). Preços em fragmentos: 62 no total para 48 fontes (não dá para comprar tudo).
  const MELH = {
    L1: [{ id: 'preco', nome: 'Preços menores', txt: 'Lojas cobram 15% menos.', preco: 6 }, { id: 'bolsa', nome: 'Bolsa cheia', txt: 'Batalhas vencidas pagam 20% mais pêndulos.', preco: 4 }],
    L2: [{ id: 'mapa', nome: 'Mapa revelado', txt: 'Todos os caminhos ficam visíveis.', preco: 4 }, { id: 'olho', nome: 'Olho vivo', txt: 'Veja as cartas de qualquer inimigo antes de entrar na batalha.', preco: 3 }],
    L3: [{ id: 'atr', nome: 'Iniciativa', txt: 'Você sempre escolhe o atributo primeiro.', preco: 8 }, { id: 'descanso', nome: 'Descanso veloz', txt: 'Cartas paradas descansam 2 pontos por vitória, em vez de 1.', preco: 4 }],
    L4: [{ id: 'sorte', nome: 'Sorte de combate', txt: 'Chance de a carta ganhar atributos na disputa.', preco: 10 }, { id: 'segunda', nome: 'Segunda tentativa', txt: 'Uma vez por minigame, desbloqueie de graça depois de falhar.', preco: 3 }],
    L5: [{ id: 'maos', nome: 'Mão ampliada', txt: 'Comece as batalhas com 2 cartas a mais.', preco: 12 }, { id: 'aluguel', nome: 'Aluguel de cartas', txt: 'Um mercador surge no mapa e aluga cartas por pêndulos. Valem uma batalha só.', preco: 8 }],
  };
  const MELH_ID = {}; Object.values(MELH).forEach(l => l.forEach(m => { if (m) MELH_ID[m.id] = m; }));
  // valores calibrados por simulação (ver docs): desconto de loja e sorte de combate
  const MELH_VAL = { preco: 0.15, sorteP: 0.10, sorteV: 0.10 };
  const rnd = a => a[Math.floor(Math.random() * a.length)];
  const S = () => A.S();
  const ini = () => { const s = S(); if (!s) return null; s.mis = s.mis || {}; s.itens = s.itens || []; s.frag = s.frag || {}; s.reg = s.reg || {}; s.melh = s.melh || {}; s.frGasto = s.frGasto | 0; ['ganho', 'gasto', 'compras', 'capt', 'seq', 'seqMax', 'semHab'].forEach(k => { s[k] = s[k] | 0; }); return s; };
  const nGanho = () => Object.keys(ini().frag).length;   // fragmentos já encontrados (cada fonte dá 1 só vez)
  const nFrag = () => Math.max(0, nGanho() - (ini().frGasto | 0));   // saldo: fragmentos são moeda das melhorias nas lojas
  const tem = id => { const s = S(); return !!(s && s.melh && s.melh[id]); };

  // ---- primeiro NPC da cadeia: o inicial (Pedro, Efepar, Kali ou Buni) mais perto do ponto de partida; fica guardado no save
  function primeiro() {
    const s = ini(); if (s.prim) return s.prim;
    const BY = A.BY, d = { [s.startId]: 0 }, q = [s.startId];
    while (q.length) { const a = q.shift(); BY[a].viz.forEach(v => { if (d[v] == null) { d[v] = d[a] + 1; q.push(v); } }); }
    let best = null, bd = 1e9;
    CH.filter(n => n.ini).forEach(n => { const k = Math.min(d[n.a] == null ? 1e9 : d[n.a], d[n.b] == null ? 1e9 : d[n.b]); if (k < bd) { bd = k; best = n.id; } });
    s.prim = best; A.save(); return best;
  }
  const ultimo = () => CH[(CH.findIndex(n => n.id === primeiro()) + CH.length - 1) % CH.length].id;

  // ---- progresso das missões
  const cont = tipo => { const s = S(); return A.NOS.filter(x => x.tipo === tipo && s.cleared[x.id]).length; };
  function prog(n) {
    const s = ini(), m = s.mis[n.id];
    if (isCh(n)) { if (m && m.first) return { v: Math.min(3, A.nBat() - (m.base | 0)), m: 3 }; return null; }
    const own = s.owned || [];
    switch (n.t) {
      case 'evento': return { v: cont('evento'), m: n.m };
      case 'elite': return { v: cont('elite'), m: n.m };
      case 'guard': return { v: A.GUARD.filter(g => s.cleared[g]).length, m: n.m };
      case 'libertar': return { v: A.MINIS.filter(g => s.cleared[g]).length, m: n.m };
      case 'uniao': return { v: A.UNIAO.filter(c => own.includes(c)).length, m: n.m };
      case 'cartas': return { v: own.length, m: n.m };
      case 'capt': return { v: s.capt, m: n.m };
      case 'semhab': return { v: s.semHab, m: n.m };
      case 'seq': return { v: s.seqMax, m: n.m };
      case 'ganho': return { v: s.ganho, m: n.m };
      case 'gasto': return { v: s.gasto, m: n.m };
      case 'compras': return { v: s.compras, m: n.m };
      case 'vit': return { v: A.nBat(), m: n.m };
      case 'derrota': return { v: s.cleared[n.n] ? 1 : 0, m: 1 };
      case 'lendaria': return { v: own.includes(n.c) ? 1 : 0, m: 1 };
    }
    return null;
  }
  const feita = n => { const p = prog(n); return !!p && p.v >= p.m; };
  const estado = n => { const m = ini().mis[n.id]; return m ? m.st : null; };
  function pronta(n) {   // pode ser entregue agora?
    const s = ini(), m = s.mis[n.id]; if (!m || m.st !== 'ativa') return false;
    if (isCh(n)) return m.first ? feita(n) : s.itens.includes(n.pede);
    return feita(n);
  }
  const bar = (v, m) => `<span class="pbar"><i style="width:${Math.round(100 * Math.min(1, v / m))}%"></i></span><small class="pnum">${Math.min(v, m)} / ${m}</small>`;

  // ---- recompensas
  const pu = (c, t) => `<li>${t}</li>`;
  function darFrag(key) { const s = ini(); if (s.frag[key]) return false; s.frag[key] = 1; A.save(); return true; }
  function darReg(c) { const s = ini(); if (s.reg[c]) return false; s.reg[c] = 1; A.save(); return true; }
  function popup(linhas, titulo) {
    const U = A.U, box = U.el(`<div class="hs-esc hs-rec2"><h3>${A.esc(titulo || 'Recompensa')}</h3><ul>${linhas.map(l => '<li>' + l + '</li>').join('')}</ul><div class="row"><button class="btn primary" data-a="x">Continuar</button></div></div>`);
    const m = U.modal(box, { cls: 'hs-modal' }); A.SND.play('legend');
    box.onclick = e => { if (e.target.closest('[data-a]')) { A.SND.play('click'); m.close(); } };
  }
  function recebe(r, titulo) {   // r: {pend, itens[], frag, reg}; recompensas de missão não contam como "ganho"
    const s = ini(), L = [];
    if (r.pend) { s.pend = (s.pend | 0) + r.pend; L.push(`<b>+${r.pend}</b> pêndulos`); }
    (r.itens || []).forEach(i => { if (!s.itens.includes(i)) s.itens.push(i); L.push('Item: <b>' + A.esc(i) + '</b>'); });
    if (r.frag && darFrag(r.frag)) L.push(`<b>+1</b> fragmento dimensional <b>(${nFrag()})</b>`);
    if (r.carta && !s.owned.includes(r.carta)) { s.owned.push(r.carta); L.push('Carta lendária: <b>' + A.esc(A.U.CARDS[r.carta].nome) + '</b>'); }
    if (r.reg && darReg(r.reg)) L.push('Registro de <b>' + A.esc(A.U.CARDS[r.reg].nome) + '</b>');
    A.save(); A.paintAll(); setTimeout(() => popup(L, titulo), 250);
  }

  // ---- conversa
  function falar(id) {
    const n = BYID[id], s = ini(); if (!n || !s) return;
    const m = s.mis[id], ch = isCh(n), quem = { nome: n.nome, card: n.card }, f = n.f;
    if (!m) {   // primeira conversa
      const first = ch && primeiro() === id && f.abrir;
      A.npcFala(quem, first ? f.abrir : f.pedir, () => { s.mis[id] = { st: 'ativa', base: A.nBat(), first: !!first }; A.save(); check(); paint(); A.avisoMissao('Nova missão', first ? 'Vença 3 batalhas' : isCh(n) ? 'Procura: ' + n.pede : n.d); });
    } else if (m.st === 'ativa') {
      if (pronta(n)) A.npcFala(quem, m.first ? f.abrirEntrega : f.entrega, () => entrega(n));
      else A.npcFala(quem, m.first ? f.abrirLembrar : f.lembrar);
    } else A.npcFala(quem, [rnd(f.depois)]);
  }
  function entrega(n) {
    const s = ini(), m = s.mis[n.id]; m.st = 'entregue'; delete m.avisou;
    if (isCh(n)) {
      const r = { itens: [n.da] };
      if (!m.first) { const i = s.itens.indexOf(n.pede); if (i >= 0) s.itens.splice(i, 1); r.pend = PEND_CADEIA; }
      if (n.reg) r.reg = n.reg;
      if (n.id === ultimo()) { r.pend = (r.pend | 0) + FINAL.pend; r.carta = FINAL.carta; } else r.frag = 'C:' + n.id;
      recebe(r, 'Missão cumprida');
    } else recebe({ pend: n.pend, frag: 'Q:' + n.id, reg: n.reg }, 'Missão cumprida');
    A.SND.play('capture'); A.avisoMissao('Missão concluída', n.nome, true);
  }
  // avisa quando uma missão ativa fica pronta
  function check() {
    const s = ini(); if (!s) return;
    ALL.forEach(n => { const m = s.mis[n.id]; if (m && m.st === 'ativa' && !isCh(n) && feita(n) && !m.avisou) { m.avisou = 1; A.save(); A.avisoMissao('Missão cumprida', n.nome + ' espera por você', true); } else if (m && m.st === 'ativa' && isCh(n) && m.first && feita(n) && !m.avisou) { m.avisou = 1; A.save(); A.avisoMissao('Missão cumprida', n.nome + ' espera por você', true); } });
    paint();
  }

  // ---- ganchos de fragmentos
  function avisoFrag() {   // fragmento: cristal que cai, estoura em brilho e mostra o total; som próprio
    const U = A.U, root = document.body, red = root.classList.contains('reduce'), tot = nFrag();
    const ov = U.el(`<div class="frg-ov"><div class="frg-rays"></div><div class="frg-st"><div class="frg-cr">${cristal(true)}</div><div class="frg-t">Fragmento dimensional</div><div class="frg-n">+1</div><div class="frg-s">Total: <b>${tot}</b></div><button class="btn primary frg-ok">Continuar</button></div></div>`);
    for (let i = 0; i < 18; i++) { const p = U.el('<i class="frg-p"></i>'), a = i / 18 * 6.283, d = 90 + (i % 3) * 36; p.style.setProperty('--dx', Math.cos(a) * d + 'px'); p.style.setProperty('--dy', Math.sin(a) * d + 'px'); p.style.animationDelay = (.55 + (i % 4) * .03) + 's'; $1('.frg-st', ov).append(p); }
    function $1(s, e) { return e.querySelector(s); }
    root.appendChild(ov); requestAnimationFrame(() => ov.classList.add('on'));
    try { const c = A.SND.ctx; if (c) { const t0 = c.currentTime, nt = [880, 1175, 1568, 2093]; nt.forEach((f, k) => { const o = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain(), t = t0 + .5 + k * .09; o.type = 'sine'; o2.type = 'triangle'; o.frequency.value = f; o2.frequency.value = f * 2.005; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.16, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + .9); o.connect(g); o2.connect(g); g.connect(A.SND.master || c.destination); o.start(t); o2.start(t); o.stop(t + .95); o2.stop(t + .95); }); const w = c.createOscillator(), wg = c.createGain(); w.type = 'sine'; w.frequency.setValueAtTime(1800, t0); w.frequency.exponentialRampToValueAtTime(300, t0 + .5); wg.gain.setValueAtTime(.0001, t0); wg.gain.exponentialRampToValueAtTime(.08, t0 + .05); wg.gain.exponentialRampToValueAtTime(.0001, t0 + .55); w.connect(wg); wg.connect(A.SND.master || c.destination); w.start(t0); w.stop(t0 + .6); } } catch (e) { }
    $1('.frg-ok', ov).onclick = () => { A.SND.play('click'); ov.classList.remove('on'); setTimeout(() => ov.remove(), 400); };
  }
  function fragEvento(key) { if (darFrag(key)) A.quandoLivre(() => avisoFrag()); }
  function vitoria(id) { ini(); if (A.MINIS.includes(id)) fragEvento('A:' + id); else if (A.GUARD.includes(id)) fragEvento('G:' + id); }
  function fragMini(id, tier) { if (tier >= 3) fragEvento('J:' + id); }   // minigame: o prêmio máximo (Perfeito) dá 1 fragmento, uma vez por minigame
  function fragBau(id) { if (D.fragBaus.includes(id)) fragEvento('B:' + id); }

  const curto = n => { const m = n.nome.match(/^(Sra\.|Dra\.|Dr\.|Capitão|Capitã|Professor|Tio|Agente)\s+(\S+)/); return m ? m[1] + ' ' + m[2] : n.nome.split(' ')[0]; };
  const ini1 = n => n.nome.replace(/^(Sra\.|Dra\.|Capitão|Capitã|Professor|Tio|Agente)\s+/, '')[0].toUpperCase();
  // A casa de cada NPC é um ponto do mapa (id 'H_<npc>'), como a loja. O NPC só pode ser visitado com a casa liberada.
  const casaId = n => 'H_' + n.id;
  const acessivel = n => !!A.available(casaId(n));
  function paint() {   // selo "!" e casa concluída direto no ponto do mapa
    if (!A || !S()) return; const root = A.root(); let aviso = false;
    ALL.forEach(n => {
      const e = A.$('.n[data-id="' + casaId(n) + '"]', root); if (!e) return;
      const st = estado(n), pr = pronta(n), podeFalar = acessivel(n);
      e.classList.toggle('ndone', st === 'entregue');
      // A exclamação representa algo para entregar, nunca uma conversa ainda bloqueada.
      e.classList.toggle('bang', podeFalar && (!st || pr));
      if (podeFalar && pr) aviso = true;
    });
    const b = A.$('.hs-hud [data-a="missoes"] .dot', root); if (b) b.hidden = !aviso;
    if (A.refrescaCasa) A.refrescaCasa();
  }
  function casaSheet(id, aqui) {   // painel da casa do NPC: nome em cima, "!" se há algo novo
    const n = BYID[id]; if (!n || !ini()) return null; const st = estado(n), pr = pronta(n), p1 = curto(n), alerta = !st || pr, ok = acessivel(n);
    const linha = !st ? p1 + ' quer falar com você.' : st === 'entregue' ? 'Missão concluída.' : pr ? 'Missão cumprida: fale com ' + p1 + '.' : 'Missão em andamento.';
    const acao = aqui ? `<button class="btn primary" data-a="conv">Conversar${alerta ? '<i class="casa-bang" aria-hidden="true">!</i>' : ''}</button>` : ok && A.caminho(casaId(n)) ? '<span class="hint hs-go">Toque de novo na casa para ir até lá.</span>' : '<span class="hint hs-go">Vença a batalha do caminho para chegar aqui.</span>';
    return { html: `<button class="ibtn x" data-a="x" aria-label="Fechar">✕</button><div class="hs-sh-h"><span class="npc-av ${isCh(n) ? 'ch' : 'cq'}">${A.esc(ini1(n))}</span><div><h3>${A.esc(n.nome)}</h3><small>Casa de ${A.esc(p1)}</small></div></div><p class="hs-st ${alerta ? 'hs-av' : 'hs-ok'}">${alerta ? '<i class="casa-bang" aria-hidden="true">!</i>' : ''}${A.esc(linha)}</p><div class="row">${acao}</div>` };
  }

  // ---- menu de missões
  function missoes(aba) {
    const U = A.U, s = ini(); aba = aba || 'cad';
    const box = U.el('<div class="hs-esc hs-mis"><h3>Missões</h3><div class="mis-tabs"><button data-a="t:cad">Cadeia</button><button data-a="t:con">Conquistas</button></div><div class="mis-list"></div><div class="row"><button class="btn primary" data-a="x">Fechar</button></div></div>');
    const lista = U.$('.mis-list', box), m = U.modal(box, { cls: 'hs-modal' });
    const row = (n, corpo, extra) => `<div class="mis-row ${extra || ''}" data-id="${n.id}"><span class="npc-av ${isCh(n) ? 'ch' : 'cq'}">${A.esc(ini1(n))}</span><div class="npc-tx"><b>${A.esc(n.nome)}</b>${corpo}</div></div>`;
    const render = () => {
      U.$$('.mis-tabs button', box).forEach(b => b.classList.toggle('on', b.dataset.a === 't:' + aba));
      let h = '';
      if (aba === 'cad') {
        const itens = s.itens.length ? `<div class="mis-itens">${s.itens.map(i => '<span>' + A.esc(i) + '</span>').join('')}</div>` : '';
        const L = CH.filter(n => estado(n)).sort((a, b) => (estado(a) === 'entregue') - (estado(b) === 'entregue'));
        h = itens + (L.length ? L.map(n => {
          const st = estado(n), pr = prog(n), first = s.mis[n.id].first, pron = pronta(n);
          const quer = first ? 'Vença 3 batalhas' : n.pede, tag = st === 'entregue' ? 'Entregue' : pron ? 'Cumprida: fale com ' + curto(n) : 'Em andamento';
          return row(n, `<span>${first ? 'Pede' : 'Procura'}: ${A.esc(quer)}</span><span>Em troca: ${A.esc(n.da)}</span>${st === 'ativa' && pr ? bar(pr.v, pr.m) : ''}<em>${A.esc(tag)}</em>`, st === 'entregue' ? 'done' : pron ? 'ok' : '');
        }).join('') : '<p class="mis-vz">Nenhuma missão ainda.</p>');
      } else {
        const L = QS.filter(n => estado(n)).sort((a, b) => (estado(a) === 'entregue') - (estado(b) === 'entregue'));
        h = L.length ? L.map(n => {
          const st = estado(n), pr = prog(n), pron = pronta(n), ex = [n.pend + ' pêndulos'].concat(['fragmento'], n.reg ? ['registro'] : []).join(' + ');
          return row(n, `<span>${A.esc(n.d)}</span>${st === 'ativa' && pr && pr.m > 1 ? bar(pr.v, pr.m) : ''}<small>${ex}</small><em>${st === 'entregue' ? 'Entregue' : pron ? 'Cumprida: fale com ' + A.esc(curto(n)) : 'Em andamento'}</em>`, st === 'entregue' ? 'done' : pron ? 'ok' : '');
        }).join('') : '<p class="mis-vz">Nenhuma missão ainda.</p>';
      }
      lista.innerHTML = h;
    };
    render();
    box.onclick = e => {
      const b = e.target.closest('[data-a]'), r = e.target.closest('.mis-row');
      if (b) { A.SND.play('click'); if (b.dataset.a === 'x') m.close(); else if (b.dataset.a.startsWith('t:')) { aba = b.dataset.a.slice(2); render(); } return; }
      if (r) { const n = BYID[r.dataset.id], h = A.BY[casaId(n)]; A.SND.play('click'); m.close(); A.closeSheet(); A.centerOn(h.x, h.y, .95, true); const g = A.$('.n[data-id="' + h.id + '"]', A.root()); if (g) { g.classList.remove('pulse'); void g.getBoundingClientRect(); g.classList.add('pulse'); } }
    };
  }

  // ---- coleção: fragmentos, registros e selos de contenção
  const cristal = on => `<svg viewBox="-12 -14 24 28" class="cr ${on ? 'on' : ''}" aria-hidden="true"><polygon points="0,-12 8,-3 5,11 -5,11 -8,-3" /><polygon class="f" points="0,-12 8,-3 0,1 -8,-3"/></svg>`;
  const icone = tipo => ({
    item: '<svg class="col-ico item" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></svg>',
    registro: '<svg class="col-ico registro" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l3 3v15H6z"/><path d="M15 3v4h4M9 11h6M9 15h6"/></svg>',
    selo: '<svg class="col-ico selo" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 8 4.7v10.6L12 22l-8-4.7V6.7z"/><path d="m8 12 2.5 2.5L16 9"/></svg>'
  })[tipo] || '';
  function colecao(aba) {
    const U = A.U, s = ini(); aba = aba || 'frag';
    const box = U.el('<div class="hs-esc hs-col"><h3>Coleção</h3><div class="mis-tabs"><button data-a="t:frag">Fragmentos</button><button data-a="t:reg">Registros</button><button data-a="t:selo">Selos</button></div><div class="col-body"></div><div class="row"><button class="btn primary" data-a="x">Fechar</button></div></div>');
    const body = U.$('.col-body', box), m = U.modal(box, { cls: 'hs-modal' });
    const render = () => {
      U.$$('.mis-tabs button', box).forEach(b => b.classList.toggle('on', b.dataset.a === 't:' + aba));
      if (aba === 'frag') { const n = nFrag(), g = nGanho(); body.innerHTML = `<p class="col-n"><b>${n}</b> fragmentos dimensionais</p><p class="col-n"><small>${g} de ${FRAG_TOTAL} encontrados</small></p><div class="col-frag">${cristal(n > 0)}</div>`; }
      else if (aba === 'reg') { const regs = Object.keys(s.reg).length; body.innerHTML = `<p class="col-n"><b>${regs}</b> / 8 registros</p><div class="col-reg">${REGS.map(c => s.reg[c] ? `<button class="reg-it" data-r="${c}">${icone('registro')}<span><b>${A.esc(U.CARDS[c].nome)}</b><small>Toque para ler</small></span></button>` : `<div class="reg-it lock">${icone('registro')}<span><b>?</b><small>Não encontrado</small></span></div>`).join('')}</div>`; }
      else { const G = A.GUARD, v = G.filter(g => s.cleared[g]).length; body.innerHTML = `<p class="col-n"><b>${v}</b> / ${G.length} selos de contenção</p><div class="col-selo">${G.map(g => `<div class="selo ${s.cleared[g] ? 'on' : ''}">${icone('selo')}<small>${A.esc(A.LADOS[A.BY[g].lado])}</small></div>`).join('')}</div><p class="col-nota">Poder da Besta: +${A.bonusBoss()}</p>`; }
    };
    render();
    box.onclick = e => {
      const b = e.target.closest('[data-a]'), r = e.target.closest('[data-r]');
      if (b) { A.SND.play('click'); if (b.dataset.a === 'x') m.close(); else if (b.dataset.a.startsWith('t:')) { aba = b.dataset.a.slice(2); render(); } return; }
      if (r) { A.SND.play('click'); lerReg(r.dataset.r); }
    };
  }
  const REGS = ['D06', 'J03', 'M01', 'S01', 'M10', 'B01', 'V15', 'V02'];
  function lerReg(c) {
    const U = A.U, k = U.CARDS[c], sr = (U.SERIES || {})[k.serie];
    const box = U.el(`<div class="hs-esc hs-lerreg"><div class="lr-p"></div><div class="lr-t"><small>REGISTRO</small><h3>${A.esc(k.nome)}</h3><p>${A.esc(k.descricao || '')}</p>${sr ? '<small>' + A.esc(sr.nome) + '</small>' : ''}</div><div class="row"><button class="btn primary" data-a="x">Fechar</button></div></div>`);
    U.$('.lr-p', box).append(U.cardEl(c, { up: true, noanim: true, cw: 120 }));
    const m = U.modal(box, { cls: 'hs-modal' }); box.onclick = e => { if (e.target.closest('[data-a]')) { A.SND.play('click'); m.close(); } };
  }

  // ---- lojas: vendedor e itens extras (fragmentos e registros)
  const vend = lid => D.vend[lid] || null;
  function lojaExtras(lid) {
    const e = D.lojasExtra[lid], s = ini(), out = [];
    if (e) e.reg.forEach(([c, p]) => out.push({ k: 'R:' + c, tipo: 'reg', card: c, p, got: !!s.reg[c] }));
    (MELH[lid] || []).forEach(m => { if (m) out.push({ k: 'M:' + m.id, tipo: 'melh', nome: m.nome, txt: m.txt, p: m.preco, got: tem(m.id) }); });
    return out;
  }
  function compraExtra(k) {
    const s = ini();
    if (k[0] === 'M') { const id = k.slice(2), m = MELH_ID[id]; if (!m || s.melh[id] || nFrag() < m.preco) return false; s.melh[id] = 1; s.frGasto += m.preco; if (A.aoMelhoria) setTimeout(() => A.aoMelhoria(id), 50); }
    else s.reg[k.slice(2)] = 1;
    A.save(); return true;
  }

  window.DSNpc = { init: a => { A = a; }, paint, casaSheet, falar, missoes, colecao, check, vitoria, fragBau, fragMini, vend, lojaExtras, compraExtra, cristal, nFrag, tem, val: MELH_VAL, entrega, ultimo, byId: id => BYID[id], melh: MELH_ID, state: () => ini(), primeiro, dados: D };
})();
