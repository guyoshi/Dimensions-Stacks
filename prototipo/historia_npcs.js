/* Modo história: NPCs (cadeia da Encomenda com 12, 19 missões de conquista), vendedores das lojas, fragmentos dimensionais (30),
   registros (8) e selos de contenção. Aprovado pelo autor em 29/10/2026. Dados em historia_npcs_dados.js (tabela: mudar o mapa é editar a linha).
   A recompensa final da cadeia é PROVISÓRIA (o autor ainda vai definir): 50 pêndulos + 1 fragmento. */
(function () {
  'use strict';
  const D = window.DS_NPCS; if (!D) return;
  let A = null;                                   // API entregue por historia.js
  const CH = D.cadeia, QS = D.quests, ALL = CH.concat(QS), BYID = {}; ALL.forEach(n => { BYID[n.id] = n; });
  const isCh = n => CH.includes(n);
  const FRAG_TOTAL = 30, PEND_CADEIA = 15, FINAL = { pend: 50, frag: 'N:final' };
  const rnd = a => a[Math.floor(Math.random() * a.length)];
  const S = () => A.S();
  const ini = () => { const s = S(); if (!s) return null; s.mis = s.mis || {}; s.itens = s.itens || []; s.frag = s.frag || {}; s.reg = s.reg || {}; ['ganho', 'gasto', 'compras', 'capt', 'seq', 'seqMax', 'semHab'].forEach(k => { s[k] = s[k] | 0; }); return s; };
  const nFrag = () => Math.min(FRAG_TOTAL, Object.keys(ini().frag).length);

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
    if (r.frag && darFrag(r.frag)) L.push(`Fragmento dimensional <b>(${nFrag()}/${FRAG_TOTAL})</b>`);
    if (r.reg && darReg(r.reg)) L.push('Registro de <b>' + A.esc(A.U.CARDS[r.reg].nome) + '</b>');
    A.save(); A.paintAll(); setTimeout(() => popup(L, titulo), 250);
  }

  // ---- conversa
  function falar(id) {
    const n = BYID[id], s = ini(); if (!n || !s) return;
    const m = s.mis[id], ch = isCh(n), quem = { nome: n.nome, card: n.card }, f = n.f;
    if (!m) {   // primeira conversa
      const first = ch && primeiro() === id && f.abrir;
      A.npcFala(quem, first ? f.abrir : f.pedir, () => { s.mis[id] = { st: 'ativa', base: A.nBat(), first: !!first }; A.save(); check(); paint(); });
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
      if (n.id === ultimo()) { r.pend = (r.pend | 0) + FINAL.pend; r.frag = FINAL.frag; }   // PROVISÓRIO
      recebe(r, 'Missão cumprida');
    } else recebe({ pend: n.pend, frag: n.frag, reg: n.reg }, 'Missão cumprida');
    A.SND.play('capture');
  }
  // avisa quando uma missão ativa fica pronta
  function check() {
    const s = ini(); if (!s) return;
    ALL.forEach(n => { const m = s.mis[n.id]; if (m && m.st === 'ativa' && !isCh(n) && feita(n) && !m.avisou) { m.avisou = 1; A.save(); A.toast(n.nome + ' espera por você: missão cumprida.'); } else if (m && m.st === 'ativa' && isCh(n) && m.first && feita(n) && !m.avisou) { m.avisou = 1; A.save(); A.toast(n.nome + ' espera por você: missão cumprida.'); } });
    paint();
  }

  // ---- ganchos de fragmentos
  function fragEvento(key) { if (darFrag(key)) A.quandoLivre(() => popup([`Fragmento dimensional <b>(${nFrag()}/${FRAG_TOTAL})</b>`], 'Fragmento encontrado')); }
  function vitoria(id) { ini(); if (A.MINIS.includes(id)) fragEvento('A:' + id); else if (A.GUARD.includes(id)) fragEvento('G:' + id); }
  function fragBau(id) { if (D.fragBaus.includes(id)) fragEvento('B:' + id); }

  // ---- marcadores no mapa (sobre a ligação entre dois pontos)
  const hash = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; };
  function pos(n) {   // ponto médio da curva da ligação (mesma fórmula de edgePath)
    let a = A.BY[n.a], b = A.BY[n.b]; if (a.id > b.id) { const t = a; a = b; b = t; }
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1, off = len * .09 * ((hash(a.id + b.id) & 1) ? 1 : -1);
    const cx = (a.x + b.x) / 2 - dy / len * off, cy = (a.y + b.y) / 2 + dx / len * off;
    return { x: .25 * a.x + .5 * cx + .25 * b.x, y: .25 * a.y + .5 * cy + .25 * b.y };
  }
  const ini1 = n => n.nome.replace(/^(Sra\.|Dra\.|Capitão|Capitã|Professor|Tio|Agente)\s+/, '')[0].toUpperCase();
  function paint(vis, ocultar) {
    if (!A || !S()) return; const g = A.$('#hsNpcs', A.root()); if (!g) return;
    if (!g.firstChild) {
      g.innerHTML = ALL.map(n => { const p = pos(n); return `<g class="npcm ${isCh(n) ? 'ch' : 'cq'}" data-id="${n.id}" transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})" role="button" tabindex="0" aria-label="${A.esc(n.nome)}"><circle class="np-h" r="21"/><circle class="np-b" r="14"/><text class="np-t" y="5.5">${A.esc(ini1(n))}</text><g class="np-bang"><circle cx="12" cy="-12" r="8"/><text x="12" y="-8.5">!</text></g></g>`; }).join('');
    }
    if (vis) paint.vis = vis, paint.oc = ocultar; vis = paint.vis; ocultar = paint.oc;
    let aviso = false;
    ALL.forEach(n => {
      const e = A.$('.npcm[data-id="' + n.id + '"]', g); if (!e) return;
      const st = estado(n), pr = pronta(n), nova = !st && A.available(n.a) || !st && A.available(n.b);
      e.classList.toggle('fog', !!ocultar && vis && !(vis.has(n.a) || vis.has(n.b)));
      e.classList.toggle('done', st === 'entregue'); e.classList.toggle('bang', pr || (!st && !!nova));
      if (pr) aviso = true;
    });
    const b = A.$('.hs-hud [data-a="missoes"] .dot', A.root()); if (b) b.hidden = !aviso;
  }
  function toque(id) {
    const n = BYID[id]; if (!n || A.andando()) return; const p = A.posId();
    if (p === n.a || p === n.b) return falar(id);
    const pa = A.caminho(n.a), pb = A.caminho(n.b), pick = pa && pb ? (pa.length <= pb.length ? n.a : n.b) : pa ? n.a : pb ? n.b : null;
    if (!pick) return A.toast('Ainda não dá para chegar lá.');
    A.andar(pick);
  }

  // ---- bloco no painel do ponto (quem está nesse cruzamento, com barra de progresso)
  function sheetHtml(nodeId, aqui) {
    const s = ini(); if (!s) return '';
    const L = ALL.filter(n => n.a === nodeId || n.b === nodeId); if (!L.length) return '';
    return L.map(n => {
      const st = estado(n), pr = prog(n), pron = pronta(n);
      let linha;
      if (!st) linha = 'Tem algo a dizer.';
      else if (st === 'entregue') linha = 'Missão concluída.';
      else if (isCh(n)) linha = pron ? 'Cumprida: fale com ' + n.nome.split(' ')[0] + '.' : (s.mis[n.id].first ? 'Vença 3 batalhas.' : 'Procura: ' + n.pede + '.');
      else linha = n.d + (pron ? '. Cumprida: fale com ' + n.nome.split(' ')[0] + '.' : '');
      const barra = st === 'ativa' && pr && pr.m > 1 ? bar(pr.v, pr.m) : '';
      return `<div class="npc-row${st === 'entregue' ? ' done' : ''}"><span class="npc-av ${isCh(n) ? 'ch' : 'cq'}">${A.esc(ini1(n))}</span><div class="npc-tx"><b>${A.esc(n.nome)}</b><span>${A.esc(linha)}</span>${barra}</div>${aqui ? `<button class="btn sm primary" data-a="npc:${n.id}">Falar</button>` : ''}</div>`;
    }).join('');
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
          const quer = first ? 'Vença 3 batalhas' : n.pede, tag = st === 'entregue' ? 'Entregue' : pron ? 'Cumprida: fale com ' + n.nome.split(' ')[0] : 'Em andamento';
          return row(n, `<span>${first ? 'Pede' : 'Procura'}: ${A.esc(quer)}</span><span>Em troca: ${A.esc(n.da)}</span>${st === 'ativa' && pr ? bar(pr.v, pr.m) : ''}<em>${A.esc(tag)}</em>`, st === 'entregue' ? 'done' : pron ? 'ok' : '');
        }).join('') : '<p class="mis-vz">Nenhuma missão ainda.</p>');
      } else {
        const L = QS.filter(n => estado(n)).sort((a, b) => (estado(a) === 'entregue') - (estado(b) === 'entregue'));
        h = L.length ? L.map(n => {
          const st = estado(n), pr = prog(n), pron = pronta(n), ex = [n.pend + ' pêndulos'].concat(n.frag ? ['fragmento'] : [], n.reg ? ['registro'] : []).join(' + ');
          return row(n, `<span>${A.esc(n.d)}</span>${st === 'ativa' && pr && pr.m > 1 ? bar(pr.v, pr.m) : ''}<small>${ex}</small><em>${st === 'entregue' ? 'Entregue' : pron ? 'Cumprida: fale com ' + A.esc(n.nome.split(' ')[0]) : 'Em andamento'}</em>`, st === 'entregue' ? 'done' : pron ? 'ok' : '');
        }).join('') : '<p class="mis-vz">Nenhuma missão ainda.</p>';
      }
      lista.innerHTML = h;
    };
    render();
    box.onclick = e => {
      const b = e.target.closest('[data-a]'), r = e.target.closest('.mis-row');
      if (b) { A.SND.play('click'); if (b.dataset.a === 'x') m.close(); else if (b.dataset.a.startsWith('t:')) { aba = b.dataset.a.slice(2); render(); } return; }
      if (r) { const n = BYID[r.dataset.id], p = pos(n); A.SND.play('click'); m.close(); A.closeSheet(); A.centerOn(p.x, p.y, .95, true); const g = A.$('.npcm[data-id="' + n.id + '"]', A.root()); if (g) { g.classList.remove('pulse'); void g.getBoundingClientRect(); g.classList.add('pulse'); } }
    };
  }

  // ---- coleção: fragmentos, registros e selos de contenção
  const cristal = on => `<svg viewBox="-12 -14 24 28" class="cr ${on ? 'on' : ''}" aria-hidden="true"><polygon points="0,-12 8,-3 5,11 -5,11 -8,-3" /><polygon class="f" points="0,-12 8,-3 0,1 -8,-3"/></svg>`;
  function colecao(aba) {
    const U = A.U, s = ini(); aba = aba || 'frag';
    const box = U.el('<div class="hs-esc hs-col"><h3>Coleção</h3><div class="mis-tabs"><button data-a="t:frag">Fragmentos</button><button data-a="t:reg">Registros</button><button data-a="t:selo">Selos</button></div><div class="col-body"></div><div class="row"><button class="btn primary" data-a="x">Fechar</button></div></div>');
    const body = U.$('.col-body', box), m = U.modal(box, { cls: 'hs-modal' });
    const render = () => {
      U.$$('.mis-tabs button', box).forEach(b => b.classList.toggle('on', b.dataset.a === 't:' + aba));
      if (aba === 'frag') { const n = nFrag(); body.innerHTML = `<p class="col-n"><b>${n}</b> / ${FRAG_TOTAL} fragmentos dimensionais</p><div class="col-frag">${Array.from({ length: FRAG_TOTAL }, (_, i) => cristal(i < n)).join('')}</div>`; }
      else if (aba === 'reg') { const regs = Object.keys(s.reg).length; body.innerHTML = `<p class="col-n"><b>${regs}</b> / 8 registros</p><div class="col-reg">${REGS.map(c => s.reg[c] ? `<button class="reg-it" data-r="${c}"><b>${A.esc(U.CARDS[c].nome)}</b><small>Toque para ler</small></button>` : `<div class="reg-it lock"><b>?</b><small>Não encontrado</small></div>`).join('')}</div>`; }
      else { const G = A.GUARD, v = G.filter(g => s.cleared[g]).length; body.innerHTML = `<p class="col-n"><b>${v}</b> / ${G.length} selos de contenção</p><div class="col-selo">${G.map(g => `<div class="selo ${s.cleared[g] ? 'on' : ''}"><svg viewBox="-20 -20 40 40"><polygon points="0,-18 16,-9 16,9 0,18 -16,9 -16,-9"/><path d="M-6 0 L-2 4 L7 -5"/></svg><small>${A.esc(A.LADOS[A.BY[g].lado])}</small></div>`).join('')}</div><p class="col-nota">Poder da Besta: +${A.bonusBoss()}</p>`; }
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
    const e = D.lojasExtra[lid]; if (!e) return []; const s = ini(), out = [];
    e.frag.forEach((p, i) => { const k = 'L:' + lid + ':' + i; out.push({ k, tipo: 'frag', p, got: !!s.frag[k] }); });
    e.reg.forEach(([c, p]) => out.push({ k: 'R:' + c, tipo: 'reg', card: c, p, got: !!s.reg[c] }));
    return out;
  }
  function compraExtra(k) { const s = ini(); if (k[0] === 'L') s.frag[k] = 1; else s.reg[k.slice(2)] = 1; A.save(); }

  window.DSNpc = { init: a => { A = a; }, paint, toque, falar, sheetHtml, missoes, colecao, check, vitoria, fragBau, vend, lojaExtras, compraExtra, cristal, nFrag, state: () => ini(), primeiro, dados: D };
})();
