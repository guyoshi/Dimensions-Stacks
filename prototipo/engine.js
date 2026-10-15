/* Dimensions Stacks — motor de regras (sem DOM). Roda no navegador e no Node.
   Regras: docs/REGRAS.md (GDD v0.8). Onde o GDD diz PENDENTE, o motor adota uma PROPOSTA
   (marcadas com [PROPOSTA] nos comentários e listadas em PROPOSTAS abaixo). */
(function (root) {
  'use strict';
  const D = root.DS_DATA || (typeof require !== 'undefined' ? (require('./data.js'), globalThis.DS_DATA) : null);
  const ATTRS = D.ATRIBUTOS;
  const AID = ATTRS.map(a => a.id);
  const ATTR = Object.fromEntries(ATTRS.map(a => [a.id, a]));
  const CARDS = Object.fromEntries(D.CARTAS.map(c => [c.id, c]));

  const PROPOSTAS = [
    'Sorteio decide quem inicia a primeira disputa.',
    'Preparar um especial retira a carta do TOPO do baralho ativo (ela deixa de combater); só se restar ao menos 1 carta para combater.',
    'Preparação acontece antes de cada disputa (a partir da 2ª rodada), em segredo, e é revelada só ao virar.',
    'Janela de especiais: depois da revelação de todas as cartas e atributos; cada jogador decide em segredo (no máximo 1 voluntário) e as cartas viradas são reveladas juntas.',
    'Ordem de resolução dos especiais: sentido horário a partir de quem iniciou a disputa.',
    'Especiais usados vão ao Buraco Negro depois que todos os efeitos resolvem (não podem ser recuperados na mesma disputa).',
    'Captura: carta do vencedor primeiro, depois as dos adversários em sentido horário a partir dele.',
    'Empate absoluto (valor e soma dos 4 atributos iguais): sem vencedor; cada carta volta ao fim do baralho do dono.',
    'Baralho vazio: compra até 7 da reserva e o jogador reordena as cartas recebidas; sem reserva nem baralho, o jogador é eliminado e seus especiais preparados vão ao Buraco Negro.',
    'À direita = próximo jogador ativo no sentido horário; à esquerda = o anterior. Em duelo, ambos são o único adversário.',
    'Especial só é oferecido quando há alvo válido (exceto Interrupção, que depende dos especiais dos outros).',
    'Limite de segurança: após 400 disputas vence quem tiver mais cartas.',
  ];

  // ---------------------------------------------------------------- util
  function mkRng(seed) { return D.rng(seed >>> 0); }
  function shuffle(arr, r) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const sum4 = s => s.pod + s.def + s.int + s.vel;
  const pause = ms => new Promise(res => setTimeout(res, ms));

  // percentis dos valores para a IA
  const DIST = {}; AID.forEach(a => { DIST[a] = D.CARTAS.map(c => c.stats[a]).sort((x, y) => x - y); });
  function pct(a, v) { const d = DIST[a]; let n = 0; for (const x of d) if (x <= v) n++; return n / d.length; }

  // ---------------------------------------------------------------- especiais
  // Cada especial: {id, nome, texto, cat, phase:'main'|'pre', can(ctx,pid), apply(ctx,act), ai(ctx,pid)->0..1}
  const SP = {};
  function def(id, nome, texto, cat, o) { SP[id] = Object.assign({ id, nome, texto, cat, phase: 'main', can: () => true, ai: null }, o); }

  const winnerOf = ctx => { const w = ctx.g.evaluate(ctx.combat, true); return w.winners && w.winners.length === 1 ? w.winners[0] : null; };
  const bhU = ctx => Math.min(0.85, 0.3 + 0.15 * ctx.bhNormal().length);
  function modSpec(id, nome, texto, mods, extra) {
    def(id, nome, texto, 'Bônus', Object.assign({
      fx: st => { const o = Object.assign({}, st); for (const k in mods) o[k] += mods[k]; return o; },   // prévia mostrada ao jogador
      apply(ctx, act) { const e = ctx.entry(act.pid); ctx.addMod(e, act.pid, nome, x => { for (const k in mods) x.stats[k] += mods[k]; }); ctx.say(`${ctx.name(act.pid)} ganha bônus de atributo.`); },
      ai(ctx, pid) { const e = ctx.entry(pid); let b = 0; const k = e.attr; b = mods[k] || 0; if (!b) return 0.05; return ctx.flipChance(pid, b); },
    }, extra || {}));
  }
  modSpec('AE-001', 'Impulso de Força', 'Sua carta de combate recebe +15 em Força nesta disputa.', { pod: 15 });
  modSpec('AE-002', 'Muralha de Resistência', 'Sua carta de combate recebe +15 em Resistência nesta disputa.', { def: 15 });
  modSpec('AE-003', 'Clarividência', 'Sua carta de combate recebe +15 em Inteligência nesta disputa.', { int: 15 });
  modSpec('AE-004', 'Arrancada', 'Sua carta de combate recebe +15 em Velocidade nesta disputa.', { vel: 15 });
  def('AE-005', 'Reforço flexível', 'Sua carta de combate recebe +10 no atributo que você está usando nesta disputa.', 'Bônus', {
    fx: (st, at) => { const o = Object.assign({}, st); if (at) o[at] += 10; return o; },
    apply(ctx, act) { const e = ctx.entry(act.pid), a = e.attr; ctx.addMod(e, act.pid, 'Reforço flexível', x => { x.stats[a] += 10; }); ctx.say(`${ctx.name(act.pid)} reforça ${ATTR[a].nome}.`); },
    ai(ctx, pid) { return ctx.flipChance(pid, 10); },
  });
  modSpec('AE-006', 'Dupla resistência', 'Sua carta de combate recebe +15 Resistência e +20 Velocidade nesta disputa.', { def: 15, vel: 20 });
  modSpec('AE-007', 'Ímpeto ofensivo', 'Sua carta de combate recebe +7 Força e +7 Inteligência nesta disputa.', { pod: 7, int: 7 });
  modSpec('AE-008', 'Guarda equilibrada', 'Sua carta de combate recebe +10 Resistência e +10 Velocidade nesta disputa.', { def: 10, vel: 10 });
  modSpec('AE-135', 'Vigor', 'Sua carta de combate recebe +12 em Força e +12 em Resistência nesta disputa.', { pod: 12, def: 12 });
  modSpec('AE-136', 'Lucidez veloz', 'Sua carta de combate recebe +12 em Inteligência e +12 em Velocidade nesta disputa.', { int: 12, vel: 12 });
  modSpec('AE-137', 'Golpe pesado', 'Sua carta de combate recebe +20 em Força nesta disputa.', { pod: 20 });
  modSpec('AE-138', 'Rocha', 'Sua carta de combate recebe +20 em Resistência nesta disputa.', { def: 20 });
  modSpec('AE-139', 'Disparada', 'Sua carta de combate recebe +20 em Velocidade nesta disputa.', { vel: 20 });
  modSpec('AE-140', 'Mente afiada', 'Sua carta de combate recebe +20 em Inteligência nesta disputa.', { int: 20 });
  modSpec('AE-142', 'Reflexos de aço', 'Sua carta de combate recebe +15 em Resistência e +15 em Velocidade nesta disputa.', { def: 15, vel: 15 });
  def('AE-009', 'Superação', 'Se o valor original que você escolheu for 40 ou menos, adicione +25 a esse atributo.', 'Bônus', {
    fx: (st, at) => { const o = Object.assign({}, st); if (at && st[at] <= 40) o[at] += 25; return o; },
    can(ctx, pid) { const e = ctx.entry(pid); return !!e && e.base[e.attr] <= 40; },
    apply(ctx, act) { const e = ctx.entry(act.pid), a = e.attr; ctx.addMod(e, act.pid, 'Superação', x => { x.stats[a] += 25; }); ctx.say(`${ctx.name(act.pid)} supera a própria fraqueza (+25).`); },
    ai(ctx, pid) { return ctx.flipChance(pid, 25); },
  });
  def('AE-010', 'Ataque em dupla', 'Jogue também a próxima carta do seu baralho: some o mesmo atributo das duas num único valor.', 'Bônus', {
    can(ctx, pid) { return ctx.player(pid).deck.length >= 1; },
    async apply(ctx, act) {
      const p = ctx.player(act.pid), e = ctx.entry(act.pid); if (!p.deck.length || !e || e.gone) return ctx.say('Sem carta para lançar: o especial é gasto.'); const c = p.deck.shift(); e.extra.push(c);
      ctx.recalc(e);
      ctx.say(`${ctx.name(act.pid)} lança uma segunda carta: ${CARDS[c].nome} (+${CARDS[c].stats[e.attr]}).`);
      await ctx.emit('extra', { pid: act.pid, card: c });
    },
    ai(ctx, pid) { const p = ctx.player(pid); const c = p.deck[0]; if (c == null) return 0; const e = ctx.entry(pid); return ctx.flipChance(pid, CARDS[c].stats[e.attr]); },
  });

  const CONV = [
    ['AE-011', 'pod', 'int'], ['AE-012', 'int', 'pod'], ['AE-013', 'pod', 'vel'], ['AE-014', 'vel', 'pod'], ['AE-015', 'def', 'int'],
    ['AE-016', 'int', 'def'], ['AE-017', 'pod', 'def'], ['AE-018', 'def', 'pod'], ['AE-019', 'int', 'vel'], ['AE-020', 'vel', 'int'],
  ];
  CONV.forEach(([id, from, to]) => {
    def(id, `${ATTR[from].nome} → ${ATTR[to].nome}`, `Substitua o valor de ${ATTR[to].nome} da sua carta de combate pelo de ${ATTR[from].nome}; o de ${ATTR[from].nome} não muda.`, 'Conversão', {
      fx: st => Object.assign({}, st, { [to]: st[from] }),
      apply(ctx, act) { const e = ctx.entry(act.pid); ctx.addMod(e, act.pid, 'Conversão', x => { x.stats[to] = x.stats[from]; }); ctx.say(`${ctx.name(act.pid)} converte ${ATTR[from].nome} em ${ATTR[to].nome}.`); },
      ai(ctx, pid) { const e = ctx.entry(pid); if (e.attr !== to) return 0.03; const d = e.stats[from] - e.stats[to]; return d <= 0 ? 0 : ctx.flipChance(pid, d); },
    });
  });

  def('AE-035', 'Saque livre', 'Escolha um adversário e tome 1 carta aleatória do baralho ativo dele.', 'Roubo', {
    can(ctx, pid) { return ctx.opps(pid).some(o => ctx.player(o).deck.length > 0); },
    async apply(ctx, act) {
      const cand = ctx.opps(act.pid).filter(o => ctx.player(o).deck.length > 0); if (!cand.length) return ctx.say('Sem alvo: o saque falha.');
      const t = await ctx.target(act.pid, cand, 'Roubar do baralho de quem?'); if (t == null) return;
      const got = await ctx.take(act.pid, t, 'deck', ctx.rndIdx(1)); if (got.length) ctx.say(`${ctx.name(act.pid)} toma uma carta de ${ctx.name(t)}.`);
    },
    ai: () => 0.78,
  });
  def('AE-041', 'Última da direita', 'Pegue a última carta do meio de reserva do adversário à direita.', 'Roubo', {
    can(ctx, pid) { const r = ctx.right(pid); return r != null && ctx.player(r).reserve.length > 0; },
    async apply(ctx, act) {
      let r = ctx.right(act.pid); const rp = r != null && ctx.player(r); if (!rp || !rp.reserve.length) return ctx.say('Reserva vazia: nada a tomar.');
      r = await ctx.hit(act.pid, r); if (r == null) return;
      const got = await ctx.take(act.pid, r, 'reserve', l => [l.length - 1]); if (got.length) ctx.say(`${ctx.name(act.pid)} toma a última carta da reserva de ${ctx.name(r)}.`);
    },
    ai: () => 0.6,
  });
  def('AE-049', 'Escolha da reserva', 'Escolha um adversário e pegue até 2 cartas aleatórias da reserva dele.', 'Roubo', {
    can(ctx, pid) { return ctx.opps(pid).some(o => ctx.player(o).reserve.length > 0); },
    async apply(ctx, act) {
      const cand = ctx.opps(act.pid).filter(o => ctx.player(o).reserve.length > 0); if (!cand.length) return ctx.say('Sem reserva para tomar.');
      const t = await ctx.target(act.pid, cand, 'Tomar da reserva de quem?'); if (t == null) return;
      const got = await ctx.take(act.pid, t, 'reserve', ctx.rndIdx(2), { n: 2 }); if (got.length) ctx.say(`${ctx.name(act.pid)} esvazia parte da reserva de ${ctx.name(t)}.`);
    },
    ai: () => 0.65,
  });
  def('AE-066', 'Descarte coletivo', 'Cada jogador ativo, inclusive você, envia 1 carta aleatória do baralho ativo ao Buraco Negro.', 'Roubo', {
    can(ctx, pid) { return ctx.alive().some(p => ctx.player(p).deck.length > 0); },
    async apply(ctx, act) {
      for (const pid of ctx.order()) { const p = ctx.player(pid); if (!p.deck.length) continue; const i = Math.floor(ctx.rand() * p.deck.length); const [c] = p.deck.splice(i, 1); ctx.toBH(c, 'normal'); await ctx.emit('discard', { pid, card: c }); }
      ctx.say('Todos descartam uma carta ao Buraco Negro.');
    },
    // vale quando um rival está a uma carta de cair e eu tenho folga; ou quando tenho mais cartas que todos (a perda igual pesa mais neles)
    ai(ctx, pid) { const me = ctx.player(pid).deck.length, os = ctx.opps(pid).map(o => ctx.player(o)); if (!os.length) return 0; if (os.some(o => o.deck.length === 1 && !o.reserve.length) && me >= 3) return 0.8; return me >= 4 && os.every(o => o.deck.length + o.reserve.length <= me - 2) ? 0.35 : 0.03; }, val: 0.5,
  });
  def('AE-071', 'Ausência tática', 'Retire só a sua carta desta disputa: ela volta ao fim do seu baralho, sem vitória nem derrota.', 'Defesa', {
    can(ctx, pid) { return ctx.entries().length >= 2; },
    apply(ctx, act) { ctx.entry(act.pid).withdrawn = true; ctx.say(`${ctx.name(act.pid)} retira a carta da disputa.`); },
    ai(ctx, pid) { return ctx.isLosing(pid) ? 0.8 : 0.03; },
  });
  def('AE-072', 'Não perder a carta', 'Mesmo que perca, sua carta de combate volta ao fim do seu próprio baralho.', 'Defesa', {
    apply(ctx, act) { ctx.entry(act.pid).saveOnLoss = true; ctx.say(`${ctx.name(act.pid)} protege a própria carta.`); },
    ai(ctx, pid) { return ctx.isLosing(pid) ? 0.88 : 0.06; },
  });
  def('AE-082', 'Resgate aleatório duplo', 'Recupere até 2 cartas normais aleatórias do Buraco Negro para o fim do seu baralho.', 'Buraco Negro', {
    can(ctx) { return ctx.bhNormal().length > 0; },
    async apply(ctx, act) {
      for (let n = 0; n < 2; n++) { const l = ctx.bhNormal(); if (!l.length) break; const pick = l[Math.floor(ctx.rand() * l.length)]; ctx.fromBH(pick); ctx.player(act.pid).deck.push(pick); await ctx.emit('rescue', { pid: act.pid, card: pick }); }
      ctx.say(`${ctx.name(act.pid)} resgata cartas do Buraco Negro.`);
    },
    ai(ctx, pid, c) { const l = ctx.bhNormal(); if (!l.length) return 0; const n = Math.min(2, l.length); return Math.max(0.03, Math.min(0.85, 0.15 + 0.45 * ((n * l.reduce((t, x) => t + sum4(CARDS[x].stats), 0) / l.length - (c ? sum4(CARDS[c].stats) : 130)) / 210))); },
  });
  def('AE-083', 'Resgate do topo', 'Recupere a carta normal mais recente do Buraco Negro para o fim do seu baralho.', 'Buraco Negro', {
    can(ctx) { return ctx.bhNormal().length > 0; },
    async apply(ctx, act) { const l = ctx.bhNormal(); if (!l.length) return; const c = l[l.length - 1]; ctx.fromBH(c); ctx.player(act.pid).deck.push(c); ctx.say(`${ctx.name(act.pid)} resgata ${CARDS[c].nome}.`); await ctx.emit('rescue', { pid: act.pid, card: c }); },
    ai(ctx, pid, c) { const l = ctx.bhNormal(); if (!l.length) return 0; return Math.max(0.03, Math.min(0.85, 0.15 + 0.45 * ((sum4(CARDS[l[l.length - 1]].stats) - (c ? sum4(CARDS[c].stats) : 130)) / 210))); },
  });
  def('AE-090', 'Segunda chance', 'Se sua carta de combate fosse ao Buraco Negro nesta disputa, ela vai ao fim da sua reserva.', 'Defesa', {
    apply(ctx, act) { ctx.entry(act.pid).toReserve = true; ctx.say(`${ctx.name(act.pid)} se prepara para uma segunda chance.`); },
    ai(ctx, pid) { const w = winnerOf(ctx); return w && w.pid !== pid && !ctx.sameTeam(w.pid, pid) && ATTR[w.attr].tipo === 'defesa' ? 0.7 : 0.04; },
  });
  def('AE-093', 'Espionagem tripla', 'Veja as 3 próximas cartas do baralho ativo de um adversário, sem alterá-las.', 'Informação', {
    can(ctx, pid) { return ctx.opps(pid).some(o => ctx.player(o).deck.length > 0); },
    async apply(ctx, act) {
      const cand = ctx.opps(act.pid).filter(o => ctx.player(o).deck.length > 0); if (!cand.length) return;
      const t = await ctx.target(act.pid, cand, 'Espionar o baralho de quem?', c => c.find(o => !ctx.mem(act.pid, o).length) ?? c[0]); if (t == null) return; const cards = ctx.player(t).deck.slice(0, 3);
      await ctx.emit('peek', { pid: act.pid, target: t, cards }); ctx.learn(act.pid, t, cards); ctx.say(`${ctx.name(act.pid)} espia o baralho de ${ctx.name(t)}.`);
    },
    ai: (ctx, pid) => ctx.opps(pid).some(o => ctx.player(o).deck.length > 0 && !ctx.mem(pid, o).length) ? 0.5 : 0.06, val: 0.9, want: (g, p) => g.alive().some(o => o !== p.pid && g.p(o).deck.length > 0 && !g.memKnown(p, o).length),
  });
  def('AE-105', 'Defesa que captura', 'Se vencer usando Resistência ou Velocidade, capture a carta de 1 adversário derrotado em vez de descartá-la.', 'Resolução', {
    apply(ctx, act) { ctx.entry(act.pid).defCapture = true; ctx.say(`${ctx.name(act.pid)} prepara uma defesa que captura.`); },
    ai(ctx, pid) { const e = ctx.entry(pid); return ATTR[e.attr].tipo === 'defesa' && !ctx.isLosing(pid) ? 0.8 : 0.05; },
  });
  def('AE-106', 'Ataque que bane', 'Se vencer usando Força ou Inteligência, capture normalmente e escolha 1 adversário derrotado: as 2 cartas do topo do baralho ativo dele vão ao Buraco Negro.', 'Resolução', {
    apply(ctx, act) { ctx.entry(act.pid).atkBanish = true; ctx.say(`${ctx.name(act.pid)} prepara um ataque que bane.`); },
    // [PROPOSTA 13/10/2026] a versão antiga (banir em vez de capturar) era pior que capturar. Agora a captura é mantida e o derrotado perde, além disso, as 2 cartas do topo (com 1 só o especial rendia menos que a carta gasta: medido em tests/calib_mirror2.js).
    ai(ctx, pid) { const w = winnerOf(ctx); return w && w.pid === pid && ATTR[w.attr].tipo === 'ataque' && ctx.opps(pid).some(o => ctx.player(o).deck.length >= 2) ? 0.7 : 0.04; }, val: 0.6,
  });
  def('AE-108', 'Negar captura inimiga', 'Se perder para um atributo de ataque, sua carta vai ao Buraco Negro, não ao baralho do vencedor.', 'Resolução', {
    apply(ctx, act) { ctx.entry(act.pid).negateCapture = true; ctx.say(`${ctx.name(act.pid)} nega a captura da própria carta.`); },
    ai(ctx, pid) { const w = winnerOf(ctx); return w && w.pid !== pid && !ctx.sameTeam(w.pid, pid) && ATTR[w.attr].tipo === 'ataque' ? 0.5 : 0.04; },
  });
  def('AE-111', 'Ativação forçada', 'Escolha um adversário: ele é obrigado a ativar todas as suas cartas especiais já preparadas (até 2) nesta disputa.', 'Interação', {
    can(ctx, pid) { return ctx.opps(pid).some(o => ctx.player(o).prepared.length > 0); },
    async apply(ctx, act) {
      const cand = ctx.opps(act.pid).filter(o => ctx.player(o).prepared.length > 0); if (!cand.length) return ctx.say('Ninguém tem especiais preparados.');
      const t = await ctx.target(act.pid, cand, 'Forçar quem a ativar os especiais?'); if (t == null) return; await ctx.force(t, act);
    },
    ai: (ctx, pid) => Math.min(0.7, 0.2 + 0.2 * ctx.opps(pid).reduce((t, o) => t + ctx.player(o).prepared.length, 0)),
  });
  def('AE-113', 'Interrupção precisa', 'Cancele 1 especial de um adversário antes da resolução; o especial cancelado é descartado normalmente. (Se ninguém ativar, é desperdiçada.)', 'Interação', {
    phase: 'pre',
    can(ctx, pid) { return ctx.opps(pid).some(o => ctx.player(o).prepared.length > 0) || ctx.activations.some(a => a.pid !== pid && !ctx.sameTeam(a.pid, pid) && !a.cancelled); },
    async apply(ctx, act) {
      const list = ctx.activations.filter(a => a.pid !== act.pid && !a.cancelled && a.card !== act.card && !ctx.sameTeam(a.pid, act.pid));
      if (!list.length) return ctx.say('Interrupção sem alvo: nada a cancelar.');
      const pids = [...new Set(list.map(a => a.pid))]; const t = pids.length === 1 ? pids[0] : await ctx.pickTarget(act.pid, pids, 'Cancelar o especial de quem?');
      const a = list.find(x => x.pid === t); if (await ctx.cancelAct(a, act.pid)) ctx.say(`${ctx.name(act.pid)} cancela o especial de ${ctx.name(t)}!`);
    },
    ai: (ctx, pid) => 0.05 + 0.7 * ctx.g.botOppFlip(pid),
  });

  // ordem de resolução dos efeitos: blindagem → cancelamentos → proteções → principais → cópias/repetições → ajustes finais
  const PHASES = ['shield', 'pre', 'guard', 'main', 'echo', 'late'];

  // ---------------------------------------------------------------- fenômenos dimensionais (eventos de rodada)
  const EVENTOS = {
    forca: { nome: 'Maré de Força', txt: 'Todas as cartas ganham +10 em Força nesta rodada.', curto: 'Força +10 para todos' },
    nevoa: { nome: 'Névoa Mental', txt: 'Todas as cartas ganham +10 em Inteligência e perdem 10 em Velocidade nesta rodada.', curto: 'Inteligência +10, Velocidade −10' },
    eco: { nome: 'Eco dos Especiais', txt: 'Nesta rodada, bônus e reduções dos especiais valem o dobro.', curto: 'Especiais valem o dobro' },
    aberta: { nome: 'Batalha Aberta', txt: 'Nesta rodada todos escolhem qualquer atributo e se enfrentam mesmo em atributos diferentes (Força contra Inteligência etc.). Ataque vencedor captura; defesa vencedora manda as outras ao Buraco Negro.', curto: 'Todos escolhem qualquer atributo' },
    tempestade: { nome: 'Tempestade Lateral', txt: 'Antes de cada disputa desta rodada, cada jogador passa a carta do topo do baralho para o jogador da direita ou da esquerda (sorteado a cada disputa) e joga com a que recebe. A tempestade vem antes de qualquer escolha.', curto: 'Carta do topo passa para a direita ou esquerda a cada disputa' },
    buraco: { nome: 'Maré do Buraco Negro', txt: 'Em cada disputa desta rodada, o jogador que está com menos cartas recebe 1 carta do Buraco Negro (2 por disputa numa partida de 2 jogadores). Quem estiver por último muda a cada disputa. Só acontece uma vez por partida.', curto: 'Quem está por último ganha carta a cada disputa' },
    correnteza: { nome: 'Correnteza', txt: 'Todas as cartas ganham +10 em Velocidade e perdem 5 em Força, Defesa e Inteligência nesta rodada.', curto: 'Velocidade +10, os demais −5' },
    muralha: { nome: 'Muralha Dimensional', txt: 'Nesta rodada, a Defesa de cada carta passa a valer a média entre a sua Defesa e o seu maior atributo (arredondada para cima). Cartas fortes em outro atributo ganham uma muralha; quem já é forte em Defesa não muda.', curto: 'Defesa = média com o maior atributo' },
    eclipse: { nome: 'Eclipse', txt: 'Nesta rodada, o maior atributo de cada carta vale 0.', curto: 'O maior atributo vale 0' },
    avesso: { nome: 'Mundo ao Avesso', txt: 'Nesta rodada vence o MENOR valor, em vez do maior. Ataque vencedor captura; defesa vencedora manda as outras ao Buraco Negro.', curto: 'Vence o menor valor' },
    bloqueio: { nome: 'Bloqueio Dimensional', txt: 'Em cada disputa desta rodada um atributo fica bloqueado (marcado com ✕) e ninguém pode escolhê-lo. O atributo bloqueado muda a cada disputa.', curto: 'Um atributo bloqueado por disputa' },
    troca: { nome: 'Troca Dimensional', txt: 'Nesta rodada dois atributos de cada carta trocam de valor entre si.', curto: 'Dois atributos trocam de valor' },
  };
  const EV_PESOS = [['forca', 1], ['nevoa', 1], ['eco', 1], ['aberta', 1], ['tempestade', 1], ['buraco', 1], ['correnteza', 0.5], ['muralha', 1], ['eclipse', 0.5], ['avesso', 2], ['troca', 1], ['bloqueio', 1]];
  const EV_PARES = [['pod', 'def'], ['pod', 'int'], ['pod', 'vel'], ['def', 'int'], ['def', 'vel'], ['int', 'vel']];

  // ---------------------------------------------------------------- jogo
  class Game {
    constructor(cfg) {
      this.cfg = Object.assign({ perPlayer: 14, difficulty: 'normal', maxCombats: 400, seed: (Math.random() * 2 ** 32) >>> 0 }, cfg);
      this.io = cfg.io || {};
      this.rand = mkRng(this.cfg.seed);
      this.logs = [];
      this.s = { players: [], bh: [], round: 1, combats: 0, initiator: 0, initiated: new Set(), over: false, winner: null };
      this.cards = CARDS; this.specials = SP;
    }
    // agenda determinística (pela semente): no máximo um fenômeno por rodada, nunca em rodadas seguidas, a partir da Rodada 2
    genEvents() {
      // distância entre fenômenos: 2 (um sim, um não, um sim), 3 ou 4 rodadas, com chance igual (média 3 = 1/3 das rodadas); nunca em rodadas seguidas
      const rng = mkRng((this.cfg.seed ^ 0x5eed) >>> 0), out = {}; let last = null, usedBH = false, r = 2 + Math.floor(rng() * 3);
      for (; r <= 80; r += 2 + Math.floor(rng() * 3)) {
        const ws = EV_PESOS.filter(([id]) => id !== last && !(id === 'buraco' && (usedBH || r < 3)));
        let t = ws.reduce((s, x) => s + x[1], 0) * rng(), id = ws[ws.length - 1][0];
        for (const [i, w] of ws) { t -= w; if (t < 0) { id = i; break; } }
        const o = { id }; if (id === 'troca') o.pair = EV_PARES[Math.floor(rng() * EV_PARES.length)];
        if (id === 'buraco') usedBH = true;
        out[r] = o; last = id;
      }
      return out;
    }
    curEv() { return (this.s.events && this.s.events[this.s.round]) || null; }
    // atributos da carta já com o efeito do fenômeno da rodada; "mark" diz à interface o que mudou
    evBase(card) {
      const st = Object.assign({}, CARDS[card].stats), ev = this.curEv(); if (!ev) return { st, mark: null };
      const m = {}, chg = (k, d) => { const v = Math.max(0, st[k] + d); m[k] = v - st[k]; st[k] = v; };
      if (ev.id === 'forca') chg('pod', 10);
      else if (ev.id === 'nevoa') { chg('int', 10); chg('vel', -10); }
      else if (ev.id === 'correnteza') { chg('vel', 10); chg('pod', -5); chg('def', -5); chg('int', -5); }
      else if (ev.id === 'muralha') { const mx = Math.max(...AID.map(a => st[a])); chg('def', Math.ceil((st.def + mx) / 2) - st.def); }
      else if (ev.id === 'eclipse') { const k = AID.reduce((b, a) => (st[a] > st[b] ? a : b), AID[0]); m.zero = k; st[k] = 0; }
      else if (ev.id === 'troca' && ev.pair) { const [a, b] = ev.pair; const t = st[a]; st[a] = st[b]; st[b] = t; m.swap = [a, b]; }
      return { st, mark: Object.keys(m).length ? m : null };
    }
    // efeitos físicos no início da rodada (primeira disputa)
    async roundEventStart() {
      const ev = this.curEv(); if (!ev) return;
      this.log(`Fenômeno dimensional: ${EVENTOS[ev.id].nome}.`, 'rodada');
      await this.emit('eventStart', { round: this.s.round, ev });
    }
    // Tempestade Lateral: antes de CADA disputa da rodada (antes de qualquer escolha), a carta do topo de todos passa para a direita ou para a esquerda (sorteado)
    async stormPass() {
      const al = this.alive().filter(pid => this.p(pid).deck.length > 0); if (al.length < 2) return;
      const dir = this.rand() < 0.5 ? 1 : -1, n = al.length;
      const tops = {}; al.forEach(pid => { tops[pid] = this.p(pid).deck.shift(); });
      const moves = al.map((pid, i) => { const to = al[(i + dir + n) % n]; this.p(to).deck.unshift(tops[pid]); return { from: pid, to, card: tops[pid], dir }; });
      this.memInit(); this.log(`A tempestade passa a carta do topo de cada jogador para a ${dir > 0 ? 'esquerda' : 'direita'}.`, 'rodada');
      await this.emit('eventFx', { id: 'tempestade', moves });
    }
    // Maré do Buraco Negro: a CADA disputa da rodada, quem está por último em cartas (recalculado na hora) recebe cartas do Buraco Negro.
    // 3 ou 4 jogadores: 1 carta por disputa (3 ou 4 na rodada); 2 jogadores: 2 cartas por disputa (4 na rodada). Em duplas conta a dupla.
    async blackholeTide() {
      const al = this.alive(), per = al.length === 2 ? 2 : 1;
      const score = pid => { const t = this.cfg.teams; const grp = t ? (t.find(g => g.includes(pid)) || [pid]).filter(x => this.p(x).alive) : [pid]; return grp.reduce((s, x) => s + this.totalCards(this.p(x)), 0); };
      const sc = al.map(score), mn = Math.min(...sc), mx = Math.max(...sc);
      const pool = () => this.s.bh.filter(x => x.kind === 'normal').map(x => x.id);
      if (mn === mx || !pool().length) { this.log('A maré do Buraco Negro não beneficia ninguém nesta disputa.', 'rodada'); return; }
      const low = al.filter(pid => score(pid) === mn), mm = Math.min(...low.map(pid => this.totalCards(this.p(pid))));
      const cands = low.filter(pid => this.totalCards(this.p(pid)) === mm), pid = cands[Math.floor(this.rand() * cands.length)];
      const got = [];
      for (let n = 0; n < per; n++) { const l = pool(); if (!l.length) break; const pick = l[Math.floor(this.rand() * l.length)]; const i = this.s.bh.findIndex(x => x.id === pick); if (i >= 0) this.s.bh.splice(i, 1); this.p(pid).deck.push(pick); got.push(pick); }
      this.memInit(); this.log(`${this.p(pid).name} está por último e recebe ${got.length} carta(s) do Buraco Negro.`, 'rodada');
      await this.emit('eventFx', { id: 'buraco', pid, cards: got });
    }
    get players() { return this.s.players; }
    // ---- modo em duplas (cfg.teams = [[0,2],[1,3]]); sem cfg.teams tudo funciona como antes (todos contra todos)
    teamOf(pid) { const t = this.cfg.teams; if (!t) return pid; const i = t.findIndex(g => g.includes(pid)); return i < 0 ? pid : 't' + i; }
    sameTeam(a, b) { return !!this.cfg.teams && a !== b && this.teamOf(a) === this.teamOf(b); }
    foesOf(pid) { return this.alive().filter(x => x !== pid && !this.sameTeam(x, pid)); }
    p(pid) { return this.s.players[pid]; }
    alive() { return this.s.players.filter(p => p.alive).map(p => p.pid); }
    order(from) { const al = this.alive(); if (from == null) return al; const n = this.s.players.length; const out = []; for (let k = 0; k < n; k++) { const pid = (from + k) % n; if (this.p(pid).alive) out.push(pid); } return out; }
    nextAlive(pid) { const n = this.s.players.length; for (let k = 1; k <= n; k++) { const x = (pid + k) % n; if (this.p(x).alive) return x; } return pid; }
    prevAlive(pid) { const n = this.s.players.length; for (let k = 1; k <= n; k++) { const x = (pid - k + n * 2) % n; if (this.p(x).alive) return x; } return pid; }
    async emit(type, data) { if (type === 'steal' || type === 'discard' || type === 'reorder' || type === 'extra' || type === 'swapCard') this.memTouch(data || {}, type); if (this.io.notify) await this.io.notify(type, data || {}); }
    log(text, cls) { if (cls === 'efeito' && this.combat) (this.combat.fx = this.combat.fx || []).push(text); this.logs.push({ text, cls: cls || '' }); if (this.io.log) this.io.log(text, cls || ''); }
    totalCards(p) { return p.deck.length + p.reserve.length + p.prepared.length; }

    async setup() {
      const cfg = this.cfg, n = cfg.players.length;
      const per = Math.max(7, cfg.perPlayer);
      const ids = shuffle(D.CARTAS.map(c => c.id), this.rand).slice(0, per * n);
      this.s.players = cfg.players.map((pc, i) => ({ pid: i, name: pc.name, bot: !!pc.bot, avatar: pc.avatar, diff: pc.diff, noSpecial: !!pc.noSpecial, pol: pc.pol, deck: [], reserve: [], prepared: [], alive: true }));
      const hands = []; let k = 0;
      for (let i = 0; i < n; i++) hands.push(ids.slice(k, k += 7));
      const rest = ids.slice(k); const rs = n ? Math.floor(rest.length / n) : 0;
      for (let i = 0; i < n; i++) this.p(i).reserve = rest.slice(i * rs, (i + 1) * rs);
      await this.emit('setup', {});
      this.s.events = this.cfg.events === false ? {} : this.genEvents();
      this.s.initiator = Math.floor(this.rand() * n);   // sorteada antes da montagem: o jogador planeja a ordem sabendo quem inicia
      this.log(`${this.p(this.s.initiator).name} sorteia a iniciativa.`);
      await this.emit('initiative', { initiator: this.s.initiator });
      for (let i = 0; i < n; i++) {
        const p = this.p(i); let ord;
        if (this.cfg.semMontar) ord = hands[i]; else if (p.bot) ord = this.botOrderHand(hands[i], p, this.s.initiator); else ord = await this.io.orderHand(p, hands[i].slice(), { start: this.s.initiator, reserve: p.reserve.slice() });
        if (!ord || ord.length !== hands[i].length || ord.slice().sort().join() !== hands[i].slice().sort().join()) ord = hands[i];
        p.deck = ord.slice();
      }
      this.memInit();
      await this.emit('ready', {});
    }
    botOrderHand(hand, p, start) { // fácil: melhores primeiro, com ruído; normal/difícil: planejam pela iniciativa e pelo valor dos especiais
      const L = this.lvl(p), nz = L.ord, n = this.s.players.length, r = () => this.rand() * nz;
      const diff = (p && p.diff) || this.cfg.difficulty; p = p || {};
      if (diff === 'facil' || (p && p.ordOld)) return hand.slice().sort((a, b) => (sum4(CARDS[b].stats) + r()) - (sum4(CARDS[a].stats) + r()));
      const sv = id => { const s = SP[CARDS[id].especial]; return (s && !s.stub && !p.noSpecial ? (s.val || 0) : 0); };
      const mx = id => Math.max(...Object.values(CARDS[id].stats));
      if (start == null) return hand.map(id => ({ id, s: sum4(CARDS[id].stats) + 20 * sv(id) + r() })).sort((a, b) => b.s - a.s).map(x => x.id);   // compra da reserva: especiais já valem
      const first = Math.min(n, hand.length);   // especiais só valem a partir da Rodada 2: as primeiras n cartas entram sem especial
      const f = hand.map(id => ({ id, s: sum4(CARDS[id].stats) + 0.6 * mx(id) - 30 * sv(id) + r() })).sort((a, b) => b.s - a.s).slice(0, first).map(x => x.id);
      const rest = hand.filter(id => !f.includes(id)).map(id => ({ id, s: 30 * sv(id) + 0.5 * sum4(CARDS[id].stats) + r() })).sort((a, b) => b.s - a.s).map(x => x.id);
      // nas posições em que o bot inicia, a carta de maior atributo; nas demais, a mais equilibrada
      let slots = f.slice();
      if (start != null && p.pid != null) {
        const ini = []; for (let k = 0; k < f.length; k++) if ((start + k) % n === p.pid) ini.push(k);
        const byMax = f.slice().sort((a, b) => mx(b) - mx(a) + (this.rand() - 0.5) * nz * 0.3), out = new Array(f.length);
        ini.forEach(k => { out[k] = byMax.shift(); });
        const others = byMax.sort((a, b) => sum4(CARDS[b].stats) - sum4(CARDS[a].stats));
        for (let k = 0; k < out.length; k++) if (!out[k]) out[k] = others.shift();
        slots = out;
      }
      return slots.concat(rest);
    }

    ctxFor(combat) {
      const g = this;
      const ctx = {
        g, combat, activations: combat.activations,
        player: pid => g.p(pid), entry: pid => combat.entries.find(e => e.pid === pid),
        entries: () => combat.entries.filter(e => !e.withdrawn), name: pid => g.p(pid).name,
        alive: () => g.alive(), order: () => g.order(combat.initiator),
        opps: pid => g.foesOf(pid),
        right: pid => { let r = g.prevAlive(pid), k = 0; while (r !== pid && g.sameTeam(r, pid) && k++ < 8) r = g.prevAlive(r); return r === pid || g.sameTeam(r, pid) ? null : r; },
        ringR: pid => { const r = g.prevAlive(pid); return r === pid ? null : r; }, ringL: pid => { const r = g.nextAlive(pid); return r === pid ? null : r; },   // vizinho de assento (sem pular parceiro): rodízios precisam ser permutações
        left: pid => { let r = g.nextAlive(pid), k = 0; while (r !== pid && g.sameTeam(r, pid) && k++ < 8) r = g.nextAlive(r); return r === pid || g.sameTeam(r, pid) ? null : r; },
        rand: () => g.rand(), say: (t) => g.log(t, 'efeito'), emit: (t, d) => g.emit(t, d),
        sameTeam: (a, b) => g.sameTeam(a, b),
        bhNormal: () => g.s.bh.filter(x => x.kind === 'normal').map(x => x.id),
        bhAll: () => g.s.bh.map(x => x.id),
        toBH: (id, kind) => g.s.bh.push({ id, kind }),
        fromBH: id => { const i = g.s.bh.findIndex(x => x.id === id); if (i >= 0) g.s.bh.splice(i, 1); },
        value: e => e.stats[e.attr] + e.bonus,
        pickTarget: (pid, cand, label) => g.pickTarget(pid, cand, label),
        pick: (pid, cand, label, bot) => g.pickTarget(pid, cand, label, bot),
        target: async (pid, cand, label, bot) => { if (!cand.length) return null; const t = await g.pickTarget(pid, cand, label, bot); return g.hit(combat, pid, t); },
        learn: (pid, t, cards, kind) => g.learn(g.p(pid), t, cards, kind),
        mem: (pid, t) => g.memKnown(g.p(pid), t),
        foe: (pid, t) => g.foeNow(g.p(pid), t), foeNext: (pid, t) => g.foeNext(g.p(pid), t),
        pWin: (pid, a) => { const e = combat.entries.find(x => x.pid === pid); return e ? g.pWin(g.p(pid), e, a, combat) : { P: 0.5, known: 0 }; },
        lvl: pid => g.lvl(g.p(pid)),
        hit: (actor, victim) => g.hit(combat, actor, victim),
        take: (thief, victim, zone, sel, o) => g.take(combat, thief, victim, zone, sel, o),
        blocked: (thief, victim, zone, n, kind) => g.blocked(combat, thief, victim, zone, n, kind),
        cancelAct: (a, by) => g.cancelAct(combat, a, by),
        addMod: (e, src, label, fn) => g.addMod(e, src, label, fn), recalc: e => g.recalc(e),
        swapEntryCard: (e, card) => g.swapEntryCard(e, card),
        askCards: (pid, spec, bot) => g.askCards(pid, spec, bot), askAttr: (pid, spec, bot) => g.askAttr(pid, spec, bot),
        def: pid => g.defOf(combat, pid),
        rndIdx: n => (l, rnd) => { const idx = shuffle([...l.keys()], rnd || (() => g.rand())); return idx.slice(0, n); },
        sum: id => sum4(CARDS[id].stats),
        bestAttr: pid => { const e = combat.entries.find(x => x.pid === pid); let b = null, bp = -1; AID.forEach(a => { const v = pct(a, e.stats[a]); if (v > bp) { bp = v; b = a; } }); return { a: b, p: bp }; },
        force: (t, act) => g.forceActivate(combat, t, act),
        isLosing: pid => { const w = g.evaluate(combat, true); return !w.winners.some(e => e.pid === pid || g.sameTeam(e.pid, pid)); },   // nas duplas, se o parceiro vence a carta volta ao dono: não está perdendo
        flipChance: (pid, bonus) => g.flipChance(combat, pid, bonus),
      };
      return ctx;
    }
    // ---- estado de defesa por jogador na disputa
    defOf(combat, pid) { return combat.def[pid] || (combat.def[pid] = { guardDeck: 0, guardRes: 0, reflect: 0, immune: 0, redirect: 0 }); }
    // alvo único de um especial: imunidade pessoal cancela; desvio redireciona
    async hit(combat, actor, victim) {
      if (victim == null) return null;
      const d = this.defOf(combat, victim);
      if (d.immune > 0) { d.immune--; this.log(`${this.p(victim).name} está imune: o efeito de ${this.p(actor).name} é cancelado!`, 'efeito'); await this.emit('block', { pid: victim }); return null; }
      if (d.redirect > 0) {
        d.redirect--;
        const cand = this.alive().filter(x => x !== actor && x !== victim);
        if (cand.length) {
          const nv = await this.pickTarget(victim, cand, `Desviar o efeito de ${this.p(actor).name} para quem?`);
          this.log(`${this.p(victim).name} desvia o efeito para ${this.p(nv).name}!`, 'efeito'); await this.emit('block', { pid: victim });
          const d2 = this.defOf(combat, nv);
          if (d2.immune > 0) { d2.immune--; this.log(`${this.p(nv).name} está imune: o efeito é cancelado!`, 'efeito'); return null; }
          return nv;
        }
        this.log(`${this.p(victim).name} não tem para quem desviar.`, 'efeito');
      }
      return victim;
    }
    // tentativa de tomar cartas da zona de alguém: guardiões e reflexo podem cancelar. true = cancelada
    async blocked(combat, thief, victim, zone, n, kind) {
      const pr = combat.pierce[thief];
      if (pr && pr.has(victim)) { pr.delete(victim); return false; }
      const d = this.defOf(combat, victim);
      if (kind === 'steal' && n === 1 && d.reflect > 0) {
        d.reflect--; this.log(`${this.p(victim).name} reflete o roubo!`, 'efeito'); await this.emit('block', { pid: victim });
        const tp = this.p(thief);
        if (tp.deck.length) { const i = Math.floor(this.rand() * tp.deck.length); const [c] = tp.deck.splice(i, 1); this.p(victim).deck.push(c); await this.emit('steal', { from: thief, to: victim, card: c }); }
        return true;
      }
      if (zone === 'deck' && d.guardDeck > 0) { d.guardDeck--; this.log(`${this.p(victim).name} protege o baralho: o efeito é anulado.`, 'efeito'); await this.emit('block', { pid: victim }); return true; }
      if (zone === 'reserve' && d.guardRes > 0) { d.guardRes--; this.log(`${this.p(victim).name} protege a reserva: o efeito é anulado.`, 'efeito'); await this.emit('block', { pid: victim }); return true; }
      return false;
    }
    // toma cartas da zona do alvo para o fim da zona de destino do ladrão; sel(lista, rnd) devolve índices
    async take(combat, thief, victim, zone, sel, o) {
      o = o || {}; const vp = this.p(victim), list = vp[zone]; if (!list.length) return [];
      if (await this.blocked(combat, thief, victim, zone, o.n || 1, o.kind || 'steal')) return [];
      const idx = sel(list, () => this.rand()).filter((i, k, a) => i >= 0 && i < list.length && a.indexOf(i) === k);
      const got = []; idx.slice().sort((x, y) => y - x).forEach(i => got.push(list.splice(i, 1)[0])); got.reverse();
      const dz = o.dest || 'deck';
      for (const c of got) { this.p(thief)[dz].push(c); await this.emit('steal', { from: victim, to: thief, card: c, zone, dzone: dz }); }
      return got;
    }
    async cancelAct(combat, a, by) {
      if (combat.shield[a.pid] > 0) { combat.shield[a.pid]--; this.log(`A blindagem de ${this.p(a.pid).name} resiste ao cancelamento!`, 'efeito'); await this.emit('block', { pid: a.pid }); return false; }
      a.cancelled = true; await this.emit('cancel', { pid: by, target: a.pid, card: a.card }); return true;
    }
    // ---- modificadores numéricos da carta de combate (reaplicáveis)
    recalc(e) {
      e.stats = Object.assign({}, e.base);
      for (const m of e.mods) if (!m.off) m.fn(e);
      e.bonus = e.attr ? e.extra.reduce((t, c) => t + CARDS[c].stats[e.attr], 0) : 0;
    }
    addMod(e, src, label, fn) {
      if (this.combat && this.combat.eco && typeof src === 'number' && label !== 'Conversão' && label !== 'Permuta') {   // Eco dos Especiais: bônus e reduções valem o dobro
        const f0 = fn; fn = x => { const b = Object.assign({}, x.stats); f0(x); for (const k in x.stats) x.stats[k] = Math.max(0, x.stats[k] + (x.stats[k] - b[k])); };
      }
      e.mods.push({ src, label, fn, off: false }); fn(e);
    }
    swapEntryCard(e, card) { const old = e.card; e.card = card; const eb = this.evBase(card); e.base = Object.assign({}, eb.st); e.evm = eb.mark; this.recalc(e); return old; }
    async askCards(pid, spec, bot) {
      const p = this.p(pid); const min = spec.min == null ? 1 : spec.min, max = spec.max == null ? 1 : spec.max;
      const fallback = () => { let r = bot && !this.blindNow(p) ? bot() : (p.bot && bot ? shuffle(spec.cards.slice(), () => this.rand()).slice(0, Math.max(min, Math.min(max, spec.cards.length))) : spec.cards.slice(0, max)); r = (r || []).filter((c, i, a) => spec.cards.includes(c) && a.indexOf(c) === i).slice(0, max); if (r.length < min) r = spec.cards.slice(0, min); return r; };
      if (p.bot || !this.io.pickCards) return fallback();
      const r = await this.io.pickCards(p, Object.assign({}, spec, { min, max }));
      if (!Array.isArray(r) || r.length < min || r.length > max || r.some((c, i) => !spec.cards.includes(c) || r.indexOf(c) !== i)) return fallback();
      return r;
    }
    async askAttr(pid, spec, bot) {
      const p = this.p(pid); const opts = spec.options;
      if (p.bot || !this.io.pickAttr) return bot && !this.blindNow(p) ? bot() : (p.bot ? opts[Math.floor(this.rand() * opts.length)] : opts[0]);
      const r = await this.io.pickAttr(p, spec); return opts.includes(r) ? r : opts[0];
    }
    async pickTarget(pid, cand, label, bot) {
      if (this.cfg.teams) { const f = cand.filter(x => !this.sameTeam(x, pid)); if (f.length) cand = f; }
      if (cand.length === 1) return cand[0];
      const p = this.p(pid);
      if (p.bot && this.blindNow(p)) return cand[Math.floor(this.rand() * cand.length)];
      if (p.bot && bot) { const r = bot(cand); return cand.includes(r) ? r : cand[0]; }
      if (p.bot) { return cand.slice().sort((a, b) => this.totalCards(this.p(b)) - this.totalCards(this.p(a)))[0]; }
      const r = await this.io.chooseTarget(p, cand, label); return cand.includes(r) ? r : cand[0];
    }
    // chance (0..1) de um bônus +b mudar o resultado a favor
    flipChance(combat, pid, bonus) {
      if (combat.ev && combat.ev.id === 'avesso') return 0.02;   // no avesso, somar ao próprio valor só atrapalha
      const me = combat.entries.find(e => e.pid === pid); const v = me.stats[me.attr] + me.bonus;
      let bestOpp = -1; combat.entries.forEach(e => { if (e.pid !== pid && !e.withdrawn && !this.sameTeam(e.pid, pid)) bestOpp = Math.max(bestOpp, e.stats[e.attr] + e.bonus); });
      if (bestOpp < 0) return 0.02;
      if (v > bestOpp) return 0.04; if (v + bonus >= bestOpp) return 0.93; return 0.02;
    }

    // ---- avaliação do vencedor (empates: valor → soma dos 4 atributos) ----
    evaluate(combat, quiet) {
      const es = combat.entries.filter(e => !e.withdrawn);
      if (es.length < 2) return { winners: [], tie: false, none: true, top: 0 };
      const val = e => e.stats[e.attr] + e.bonus;
      const aw = es.find(e => e.autoWin); if (aw) return { winners: [aw], tie: false, none: false, top: val(aw) };
      const inv = !!(combat.ev && combat.ev.id === 'avesso');   // Mundo ao Avesso: vence o menor
      const top = inv ? Math.min(...es.map(val)) : Math.max(...es.map(val));
      let pool = es.filter(e => val(e) === top);
      es.forEach(e => { if (e.margin && (inv ? val(e) > top && val(e) - top <= 10 : val(e) < top && top - val(e) <= 10) && !pool.includes(e)) pool.push(e); });
      let tie = false, tb = null;
      if (pool.length > 1) {
        tb = { stage: 1, inv, top, list: pool.map(e => ({ pid: e.pid, v: sum4(e.stats) })), rows: pool.map(e => ({ pid: e.pid, card: e.card, stats: Object.assign({}, e.stats) })) };
        const pk = inv ? Math.min : Math.max; let best = pk(...pool.map(e => sum4(e.stats))); pool = pool.filter(e => sum4(e.stats) === best);
        if (pool.length > 1) tie = true;
      }
      return { winners: pool, tie, none: false, top, tb };
    }

    // ---------------------------------------------------------------- combate
    async refill() {
      if (this.cfg.teams && this.cfg.teamGive) this.teamGive();
      for (const pid of this.order()) {
        const p = this.p(pid);
        if (p.deck.length === 0) {
          if (p.reserve.length === 0 && this.cfg.teams && this.cfg.teamShare) {   // [teste] compra da reserva do parceiro
            const mate = this.alive().find(x => this.sameTeam(x, pid)); const m = mate != null ? this.p(mate) : null;
            if (m && m.reserve.length > 0) { const n = Math.min(7, Math.ceil(m.reserve.length / 2)); p.reserve.push(...m.reserve.splice(0, n)); this.log(`${p.name} compra ${n} cartas da reserva do parceiro ${m.name}.`, 'efeito'); this.memInit(); }
          }
          if (p.reserve.length === 0 && this.cfg.teams && this.cfg.teamPool !== false) {   // pool da dupla (regra das duplas): só cai quem não tem de quem receber (parceiro com <2 cartas)
            const mate = this.alive().find(x => this.sameTeam(x, pid)); const m = mate != null ? this.p(mate) : null;
            if (m && this.totalCards(m) >= 2) {
              const n = Math.floor(this.totalCards(m) / 2), got = [];
              for (let i = 0; i < n; i++) got.push(m.reserve.length ? m.reserve.shift() : m.deck.length > 1 ? m.deck.pop() : null);
              const ok = got.filter(c => c != null); p.reserve.push(...ok); this.memInit(); this.s.pooled = (this.s.pooled || 0) + 1;
              this.log(`${m.name} divide ${ok.length} cartas com ${p.name}: a dupla joga com o que tem.`, 'efeito');
            }
          }
          if (p.reserve.length > 0) {
            let take = p.reserve.splice(0, 7);
            // quem compra da reserva reordena as cartas que entram: sempre há estratégia, nunca sorte
            if (take.length > 1 && !this.cfg.semMontar) { let ord = p.bot ? this.botOrderHand(take, p) : (this.io.orderHand ? await this.io.orderHand(p, take.slice(), { refill: true }) : take); if (!ord || ord.length !== take.length || ord.slice().sort().join() !== take.slice().sort().join()) ord = take; take = ord.slice(); }
            p.deck.push(...take); this.log(`${p.name} compra ${take.length} cartas da reserva.`); await this.emit('refill', { pid, cards: take });
          }
          else { await this.eliminate(pid); }
        }
      }
    }
    // [teste] doação (cfg.teamGive = n): quem está com ≤2 cartas recebe n do parceiro, se este tiver ≥ 6+n (reserva primeiro)
    teamGive() {
      const n = this.cfg.teamGive;
      for (const pid of this.alive()) {
        const p = this.p(pid), mate = this.alive().find(x => this.sameTeam(x, pid)); if (mate == null) continue; const m = this.p(mate);
        if (this.totalCards(p) <= 2 && this.totalCards(m) >= 6 + n) {
          const give = []; for (let i = 0; i < n; i++) give.push(m.reserve.length ? m.reserve.pop() : m.deck.pop());
          p.reserve.push(...give); this.memInit(); this.s.gave = (this.s.gave || 0) + 1; this.log(`${m.name} entrega ${n} cartas ao parceiro ${p.name}.`, 'efeito');
        }
      }
    }
    async eliminate(pid) {
      const p = this.p(pid); if (this.s.crisis == null) this.s.crisis = this.teamOf(pid);
      p.alive = false;
      p.prepared.forEach(c => this.s.bh.push({ id: c, kind: 'especial' })); p.prepared = [];
      this.log(`${p.name} foi eliminado!`, 'elim'); await this.emit('eliminated', { pid });
    }
    checkEnd() {
      const al = this.alive();
      if (this.cfg.teams) {
        let teams = [...new Set(al.map(x => this.teamOf(x)))];
        if (this.cfg.teamFall) { const dead = new Set(this.s.players.filter(q => !q.alive).map(q => this.teamOf(q.pid))); teams = teams.filter(t => !dead.has(t)); }
        if (teams.length <= 1) { this.s.over = true; this.s.winner = teams.length ? al.find(x => this.teamOf(x) === teams[0]) : null; this.s.winnerTeam = teams[0] ?? null; return true; }
        if (this.s.combats >= this.cfg.maxCombats) {
          this.s.over = true; const tot = {}; al.forEach(pid => { const k = this.teamOf(pid); tot[k] = (tot[k] || 0) + this.totalCards(this.p(pid)); });
          const ks = Object.keys(tot).sort((a, b) => tot[b] - tot[a]); const tie = tot[ks[0]] === tot[ks[1]];
          this.s.winnerTeam = tie ? null : ks[0]; this.s.winner = tie ? null : al.find(x => this.teamOf(x) === ks[0]); this.s.byLimit = true; return true;
        }
        return false;
      }
      if (al.length <= 1) { this.s.over = true; this.s.winner = al.length ? al[0] : null; return true; }
      if (this.s.combats >= this.cfg.maxCombats) {
        this.s.over = true; let best = -1, w = null, tie = false;
        al.forEach(pid => { const t = this.totalCards(this.p(pid)); if (t > best) { best = t; w = pid; tie = false; } else if (t === best) tie = true; });
        this.s.winner = tie ? null : w; this.s.byLimit = true; return true;
      }
      return false;
    }

    async run() {
      await this.setup();
      while (!this.s.over) {
        await this.refill(); if (this.checkEnd()) break;
        if (!this.p(this.s.initiator).alive) this.s.initiator = this.nextAlive(this.s.initiator);
        await this.playCombat(this.s.initiator);
        this.s.combats++;
        // rodada: todos os ativos iniciaram uma vez
        this.s.initiated.add(this.s.initiator);
        const roundDone = this.alive().every(pid => this.s.initiated.has(pid));
        await this.refill();   // compras e eliminações aparecem ANTES do aviso de nova rodada (a contagem da rodada não muda)
        if (roundDone) { this.s.round++; this.s.initiated = new Set(); if (!this.checkEnd()) { this.log(`— Rodada ${this.s.round} —`, 'rodada'); await this.emit('round', { round: this.s.round }); } }
        this.s.initiator = this.nextAlive(this.s.initiator);
        if (this.checkEnd()) break;
      }
      this.log(this.s.winner != null ? `${this.p(this.s.winner).name} vence a partida!` : 'A partida termina empatada.', 'fim');
      await this.emit('end', { winner: this.s.winner });
      return this.s.winner;
    }

    async decide(p, kind, ...args) {
      if (p.bot) return this['bot_' + kind](p, ...args);
      return this.io[kind](p, ...args);
    }

    async playCombat(init) {
      if (this.s.initiated.size === 0) await this.roundEventStart();
      { const e0 = this.curEv(); if (e0 && e0.id === 'buraco') await this.blackholeTide(); if (e0 && e0.id === 'tempestade') await this.stormPass(); }
      // Bloqueio Dimensional: um atributo sorteado por disputa, diferente do bloqueado na disputa anterior
      let blocked = null; { const e1 = this.curEv(); if (e1 && e1.id === 'bloqueio') { const op = AID.filter(a => a !== this.s.lastBlock); blocked = op[Math.floor(this.rand() * op.length)]; this.s.lastBlock = blocked; } }
      const g = this, order = this.order(init);
      const combat = { initiator: init, order, entries: [], activations: [], ctrlActs: [], specialsAllowed: this.s.round >= (this.cfg.specialsFrom || 2),
        def: {}, ctl: { per: {} }, claims: [], onWin: [], pierce: {}, shield: {}, used: {}, locked: new Set() };
      { const ev0 = this.curEv(); combat.eco = !!ev0 && ev0.id === 'eco'; combat.ev = ev0; }
      combat.blocked = blocked; this.combat = combat; this.memTick();
      await this.emit('combatStart', { initiator: init, round: this.s.round });
      if (blocked) { this.log(`Bloqueio Dimensional: ${ATTR[blocked].nome} está bloqueado nesta disputa.`, 'rodada'); await this.emit('eventFx', { id: 'bloqueio', attr: blocked }); }
      // 1) preparação dos bots [PROPOSTA]
      if (combat.specialsAllowed) {
        const prep = [];
        for (const pid of order) { const p = this.p(pid); if (p.bot && p.prepared.length < 2 && p.deck.length >= 2) { const sp0 = SP[CARDS[p.deck[0]].especial]; if (!sp0) continue; const yes = await this.decide(p, 'prepare', p.deck[0]); if (yes) prep.push(pid); } }
        for (const pid of prep) { const p = this.p(pid); const c = p.deck.shift(); p.prepared.push(c); this.log(`${p.name} prepara um especial.`, 'prep'); await this.emit('prepare', { pid, card: c }); }
      }
      // 2) cartas em campo
      for (const pid of order) {
        const p = this.p(pid); const c = p.deck.shift();
        const eb = this.evBase(c);
        combat.entries.push({ pid, card: c, base: Object.assign({}, eb.st), stats: Object.assign({}, eb.st), evm: eb.mark, bonus: 0, extra: [], mods: [], attr: null, withdrawn: false, gone: false, noCaptureBy: new Set() });
      }
      this.memCommit(combat);
      await this.emit('commit', { combat });
      // 2b) especiais de controle (antes de declarar atributos)
      if (combat.specialsAllowed) await this.ctrlWindow(combat);
      // 3) atributos: iniciador escolhe (dentro do que os controles permitem); os demais no mesmo par
      const ie = combat.entries.find(e => e.pid === init);
      ie.attr = await this.chooseAttr(combat, ie, this.attrOptions(combat, ie, AID));
      if (!AID.includes(ie.attr)) ie.attr = AID[0];
      this.log(`${this.p(init).name} inicia em ${ATTR[ie.attr].nome}.`, 'attr');
      await this.emit('initiatorAttr', { combat, pid: init, attr: ie.attr });
      const pair = combat.ev && combat.ev.id === 'aberta' ? AID.slice() : AID.filter(a => ATTR[a].par === ATTR[ie.attr].par);
      for (const e of combat.entries) {
        if (e.pid === init) continue;
        const opts = this.attrOptions(combat, e, pair);
        e.attr = await this.chooseAttr(combat, e, opts);
        if (!opts.includes(e.attr)) e.attr = opts[0];
      }
      combat.entries.forEach(e => this.recalc(e));
      // 4) revelação
      await this.emit('reveal', { combat });
      // 5) janela de especiais
      if (combat.specialsAllowed) await this.mainWindow(combat);
      // 6) resolução
      await this.resolve(combat);
      await this.runHooks(combat);
      await this.emit('combatEnd', { combat });
      this.combat = null;
    }
    // opções de atributo conforme os especiais de controle
    attrOptions(combat, e, base) {
      const ctl = combat.ctl; if (ctl.universal) return [ctl.universal];
      let opts = base.slice();
      if (combat.blocked) { const nb = opts.filter(a => a !== combat.blocked); if (nb.length) opts = nb; }
     // (atributo bloqueado pelo evento removido acima)
     const tryF = f => { const r = opts.filter(f); if (r.length) opts = r; };
      if (ctl.pair != null) tryF(a => ATTR[a].par === ctl.pair);
      if (ctl.typeAll) tryF(a => ATTR[a].tipo === ctl.typeAll);
      const per = ctl.per[e.pid];
      if (per) { if (per.force) tryF(a => ATTR[a].tipo === per.force); if (per.ban) tryF(a => ATTR[a].tipo !== per.ban); }
      return opts;
    }
    async ctrlWindow(combat) {
      const ctx = this.ctxFor(combat); const picks = [];
      for (const pid of combat.order) {
        const p = this.p(pid);
        const usable = p.prepared.filter(c => { const sp = SP[CARDS[c].especial]; return sp && sp.phase === 'ctrl' && sp.can(ctx, pid); });
        if (!usable.length) continue;
        await this.emit('specialWindow', { pid, usable, stage: 'ctrl' });
        const c = await this.decide(p, 'special', usable, combat, ctx, 'ctrl');
        if (c != null && usable.includes(c)) { picks.push({ pid, card: c }); combat.used[pid] = (combat.used[pid] || 0) + 1; }
      }
      if (!picks.length) return;
      const acts = picks.map(pk => this.activate(combat, pk.pid, pk.card, false, combat.ctrlActs)).filter(Boolean);
      await this.emit('specialsFlip', { combat, acts: acts.slice(), stage: 'ctrl' });
      for (const a of acts) {
        const sp = SP[CARDS[a.card].especial]; a.done = true; this.log(`${this.p(a.pid).name} ativa ${sp.nome}.`, 'efeito');
        await this.emit('effectStart', { act: a, spec: sp }); await sp.apply(ctx, a); await this.emit('effectEnd', { act: a, spec: sp });
      }
    }
    async mainWindow(combat) {
      const ctx = this.ctxFor(combat); const picks = [];
      const comp = x => !!SP[CARDS[x].especial].companion;
      for (const pid of combat.order) {
        const p = this.p(pid); const isMain = c => { const sp = SP[CARDS[c].especial]; return sp && sp.phase !== 'ctrl' && !sp.react && !combat.locked.has(c) && sp.can(ctx, pid); };
        let usable = p.prepared.filter(isMain);
        if (!usable.length || (combat.used[pid] || 0) >= 1) continue;
        await this.emit('specialWindow', { pid, usable, stage: 'main' });
        const c = await this.decide(p, 'special', usable, combat, ctx, 'main');
        if (c == null || !usable.includes(c)) continue;
        picks.push({ pid, card: c }); combat.used[pid] = 1;
        // companheiras: um segundo especial só se uma das duas cartas for "companheira"
        const second = p.prepared.filter(x => x !== c && isMain(x) && (comp(c) ? true : comp(x)));
        if (second.length) { const c2 = await this.decide(p, 'special', second, combat, ctx, 'second'); if (c2 != null && second.includes(c2)) picks.push({ pid, card: c2 }); }
      }
      for (const pk of picks) this.activate(combat, pk.pid, pk.card, false);
      if (combat.activations.length) await this.emit('specialsFlip', { combat, acts: combat.activations.slice() });
      // janela de reação: quem tem especial reativo decide já sabendo o que foi virado (regra de 13/10/2026, autorizada pelo autor)
      await this.reactWindow(combat);
      for (const ph of PHASES) {
        for (let i = 0; i < combat.activations.length; i++) {
          const a = combat.activations[i]; if (a.done) continue;
          const sp = SP[CARDS[a.card].especial]; if ((sp.phase || 'main') !== ph) continue; a.done = true;
          if (a.cancelled) { this.log(`O especial de ${this.p(a.pid).name} foi cancelado.`, 'efeito'); continue; }
          this.log(`${this.p(a.pid).name} ativa ${sp.nome}.`, 'efeito');
          await this.emit('effectStart', { act: a, spec: sp }); await sp.apply(ctx, a); await this.emit('effectEnd', { act: a, spec: sp });
        }
      }
      combat.entries.forEach(e => { if (!e.gone) this.recalc(e); });
    }
    // Janela de reação: depois que os especiais normais (e de controle) foram revelados, quem tem um especial REATIVO
    // (que responde a especiais dos rivais: anular, copiar, apropriar, proteger) decide sabendo o que apareceu.
    // Só abre para quem tem algum especial reativo utilizável e se ALGUM RIVAL virou um especial; as escolhas são secretas e
    // simultâneas entre os reagentes (um reativo não reage a outro reativo). Vale a regra de um especial por jogador (companheiras à parte).
    foeActs(combat, pid) { return combat.ctrlActs.concat(combat.activations).filter(a => a.pid !== pid && !this.sameTeam(a.pid, pid) && !a.cancelled); }
    async reactWindow(combat) {
      if (!combat.specialsAllowed) return;
      const ctx = this.ctxFor(combat); const picks = []; const comp = x => !!SP[CARDS[x].especial].companion;
      combat.react = true;
      try {
        for (const pid of combat.order) {
          const p = this.p(pid);
          const foeSp = this.foeActs(combat, pid).length > 0;   // sem especial rival virado, só abrem a janela os de reação que não dependem dele (reactAlways)
          const mine = combat.activations.filter(a => a.pid === pid);
          if ((combat.used[pid] || 0) >= 1 && (!mine.length || mine.length >= 2)) continue;
          const first = mine[0];
          const usable = p.prepared.filter(c => { const sp = SP[CARDS[c].especial]; return sp && sp.react && (foeSp || sp.reactAlways) && !combat.locked.has(c) && sp.can(ctx, pid) && (!first || comp(first.card) || comp(c)); });
          if (!usable.length) continue;
          await this.emit('specialWindow', { pid, usable, stage: 'react' });
          const c = await this.decide(p, 'special', usable, combat, ctx, 'react');
          if (c == null || !usable.includes(c)) continue;
          picks.push({ pid, card: c }); combat.used[pid] = (combat.used[pid] || 0) + 1;
          const second = first ? [] : p.prepared.filter(x => x !== c && SP[CARDS[x].especial] && SP[CARDS[x].especial].react && (foeSp || SP[CARDS[x].especial].reactAlways) && !combat.locked.has(x) && SP[CARDS[x].especial].can(ctx, pid) && (comp(c) || comp(x)));
          if (second.length) { const c2 = await this.decide(p, 'special', second, combat, ctx, 'second'); if (c2 != null && second.includes(c2)) picks.push({ pid, card: c2 }); }
        }
      } finally { combat.react = false; }
      if (!picks.length) return;
      const acts = picks.map(pk => this.activate(combat, pk.pid, pk.card, false)).filter(Boolean);
      await this.emit('specialsFlip', { combat, acts: acts.slice(), stage: 'react' });
    }
    // efeitos que dependem do resultado (recompensas, pagamentos) e destino dos especiais usados
    async runHooks(combat) {
      const ctx = this.ctxFor(combat), res = combat.result || {};
      for (const h of combat.onWin) {
        if (res.winnerPid !== h.pid) continue;
        if (h.when === 'attack' && res.type !== 'attack') continue; if (h.when === 'defense' && res.type !== 'defense') continue;
        await h.run(ctx, res);
      }
      const all = combat.ctrlActs.concat(combat.activations);
      const claimed = all.filter(a => a.claimedBy != null);
      all.forEach(a => { if (a.claimedBy != null) this.p(a.claimedBy).deck.push(a.card); else this.s.bh.push({ id: a.card, kind: 'especial' }); });
      if (all.length) await this.emit('specialsDone', { combat, claimed: claimed.map(a => ({ card: a.card, pid: a.claimedBy })) });
    }
    // Escolha de atributo. O humano também pode "preparar" a carta da mesa como especial: ela sai do combate
    // e a próxima do baralho entra no lugar (nova escolha). Proposta de fluxo pedida pelo autor.
    async chooseAttr(combat, e, options) {
      const p = this.p(e.pid); const per = combat.ctl.per[e.pid];
      if (per && per.chooser != null && options.length > 1) {
        const ch = per.chooser; const pick = await this.askAttr(ch, { title: `Escolha o atributo que ${p.name} vai usar`, hint: 'A carta dele está fechada: a escolha é às cegas.', options }, () => { const k = this.foeNow(this.p(ch), e.pid); return k ? options.slice().sort((a, b) => CARDS[k].stats[a] - CARDS[k].stats[b])[0] : options[Math.floor(this.rand() * options.length)]; });
        this.log(`${this.p(ch).name} escolhe o atributo de ${p.name}.`, 'efeito'); return pick;
      }
      for (let guard = 0; guard < 4; guard++) {
        const canPrep = !p.bot && combat.specialsAllowed && p.prepared.length < 2 && p.deck.length >= 1;
        if (options.length === 1 && !canPrep) return options[0];
        const r = await this.decide(p, 'attr', e, options, combat, canPrep);
        if (r === '@prep' && canPrep) {
          const old = e.card; p.prepared.push(old);
          const c2 = p.deck.shift(); e.card = c2; { const eb = this.evBase(c2); e.base = Object.assign({}, eb.st); e.evm = eb.mark; } e.mods = []; e.extra = []; e.attr = null; this.recalc(e);
          this.log(`${p.name} prepara um especial.`, 'prep');
          await this.emit('swapCard', { pid: e.pid, old, card: c2, combat });
          continue;
        }
        return r;
      }
      return options[0];
    }
    activate(combat, pid, card, forced, list) {
      const p = this.p(pid); const i = p.prepared.indexOf(card); if (i < 0) return null;
      p.prepared.splice(i, 1); const a = { pid, card, forced, cancelled: false, done: false }; (list || combat.activations).push(a); return a;
    }
    async forceActivate(combat, target, src) {
      const p = this.p(target); const cards = p.prepared.filter(c => !combat.locked.has(c)); if (!cards.length) return;
      this.log(`${p.name} é forçado a virar seus especiais!`, 'efeito');
      const acts = cards.map(c => this.activate(combat, target, c, true)).filter(Boolean);
      acts.sort((x, y) => PHASES.indexOf(SP[CARDS[x.card].especial].phase || 'main') - PHASES.indexOf(SP[CARDS[y.card].especial].phase || 'main'));
      await this.emit('specialsFlip', { combat, acts, forced: true });
      const ctx = this.ctxFor(combat);
      for (const a of acts) {
        const sp = SP[CARDS[a.card].especial]; a.done = true; this.log(`${p.name} ativa ${sp.nome}.`, 'efeito');
        await this.emit('effectStart', { act: a, spec: sp }); await sp.apply(ctx, a); await this.emit('effectEnd', { act: a, spec: sp });
      }
    }

    async resolve(combat) {
      const ev = this.evaluate(combat);
      const es = combat.entries;
      const give = (pid, cards) => { this.p(pid).deck.push(...cards); };
      const cardsOf = e => [e.card, ...e.extra];
      const moves = []; // para animação
      const toBH = (e) => {
        if (e.toReserve) { this.p(e.pid).reserve.push(...cardsOf(e)); moves.push({ cards: cardsOf(e), from: e.pid, to: e.pid, zone: 'reserve' }); }
        else { cardsOf(e).forEach(c => this.s.bh.push({ id: c, kind: 'normal' })); moves.push({ cards: cardsOf(e), from: e.pid, to: 'bh' }); }
      };
      const back = (e) => { give(e.pid, cardsOf(e)); moves.push({ cards: cardsOf(e), from: e.pid, to: e.pid }); };
      const capture = (e, pid) => { give(pid, cardsOf(e)); moves.push({ cards: cardsOf(e), from: e.pid, to: pid }); };
      let result = { type: 'none', winners: [], winnerPid: null };
      const live = es.filter(e => !e.withdrawn);
      es.filter(e => e.withdrawn && !e.gone).forEach(back);
      // cartas banidas (Ruína de campo) já foram ao Buraco Negro no momento do efeito; um resgate posterior pode tê-las tirado de lá
      // rede de segurança: carta que ficou presa a uma carta banida (ex.: trocada ou lançada depois do banimento) e não está em nenhuma zona vai ao Buraco Negro
      {
        const seen = new Set(); this.s.bh.forEach(x => seen.add(x.id)); this.s.players.forEach(q => [...q.deck, ...q.reserve, ...q.prepared].forEach(c => seen.add(c)));
        es.filter(e => !e.gone).forEach(e => cardsOf(e).forEach(c => seen.add(c)));
        es.filter(e => e.gone).forEach(e => cardsOf(e).forEach(c => { if (!seen.has(c)) { seen.add(c); this.s.bh.push({ id: c, kind: 'normal' }); } }));
      }
      // capturas condicionais (Capturar atacante/defensor, Duelo condicionado): a carta é tomada ao fim do combate
      const claimed = new Set();
      for (const cl of combat.claims) {
        const t = es.find(e => e.pid === cl.target); if (!t || t.withdrawn || claimed.has(t)) continue;
        if (!cl.cond(t)) { this.log(`A condição de captura não se cumpre para ${this.p(t.pid).name}.`, 'res'); continue; }
        if (t.noCaptureBy.has(cl.pid)) { this.log(`${this.p(t.pid).name} impede a captura.`, 'res'); continue; }
        claimed.add(t); capture(t, cl.pid); this.log(`${this.p(cl.pid).name} captura a carta de ${this.p(t.pid).name}.`, 'res');
      }
      if (ev.none) { live.filter(e => !claimed.has(e)).forEach(back); this.log('Sem disputa: as cartas voltam.', 'res'); }
      else if (ev.tie) { live.filter(e => !claimed.has(e)).forEach(back); this.log('Empate absoluto: as cartas voltam aos donos.', 'res'); result = { type: 'tie', winners: ev.winners.map(e => e.pid), winnerPid: null, tb: ev.tb || null }; }
      else {
        const w = ev.winners[0]; const attack = ATTR[w.attr].tipo === 'ataque';
        const mates = live.filter(e => e !== w && !claimed.has(e) && this.sameTeam(e.pid, w.pid));
        const losers = live.filter(e => e !== w && !claimed.has(e) && !this.sameTeam(e.pid, w.pid));
        mates.forEach(back); if (mates.length) this.log(`A carta de ${mates.map(m => this.p(m.pid).name).join(', ')} (parceiro) volta ao dono.`, 'res');
        const clock = (pid) => this.order(w.pid).indexOf(pid);
        losers.sort((a, b) => clock(a.pid) - clock(b.pid));
        if (!claimed.has(w)) back(w);
        let special = null; // um perdedor escolhido por 105
        if (!attack && w.defCapture && losers.length) { const cand = losers.filter(l => !l.saveOnLoss); if (cand.length) special = await this.chooseLoser(w, cand, 'Qual carta capturar?'); }
        for (const l of losers) {
          if (l.saveOnLoss) { back(l); continue; }
          const blocked = l.noCaptureBy.has(w.pid);
          if (attack || w.compCapture) {
            if (attack && l.negateCapture) { toBH(l); continue; }
            if (blocked) { back(l); this.log(`${this.p(l.pid).name} impede a captura da própria carta.`, 'res'); continue; }
            capture(l, w.pid);
          } else {
            if (w.defCapture && special === l) { if (blocked) toBH(l); else capture(l, w.pid); continue; }
            toBH(l);
          }
        }
        if (attack && w.atkBanish) {   // AE-106: depois de capturar, a carta do topo do baralho de 1 derrotado vai ao Buraco Negro
          const cand = losers.filter(l => !l.saveOnLoss && !l.noBHBySpecial && this.p(l.pid).deck.length > 0);
          if (cand.length) { const l = await this.chooseLoser(w, cand, 'De quem a carta do topo vai ao Buraco Negro?'); const nb = (this.cfg && this.cfg.ban106) || 2; for (let n = 0; n < nb && this.p(l.pid).deck.length; n++) { const c = this.p(l.pid).deck.shift(); this.s.bh.push({ id: c, kind: 'normal' }); } this.memTouch({ target: l.pid }, 'discard'); this.log(`${this.p(w.pid).name} bane ${nb > 1 ? 'as ' + nb + ' cartas do topo' : 'a carta do topo'} do baralho de ${this.p(l.pid).name}.`, 'efeito'); }
        }
        result = { type: attack ? 'attack' : 'defense', winners: [w.pid], winnerPid: w.pid, attr: w.attr, value: w.stats[w.attr] + w.bonus, tb: ev.tb || null };
        if (ev.tb) this.log(`Empate em ${ev.tb.top}! Desempate pela soma dos 4 atributos: ${ev.tb.list.map(x => this.p(x.pid).name + ' ' + x.v).join(' × ')}.`, 'efeito');
        this.log(`${this.p(w.pid).name} vence ${attack ? 'atacando' : 'defendendo'} com ${ATTR[w.attr].nome} ${result.value}.`, 'vit');
      }
      combat.result = result; combat.moves = moves; this.memResolved(moves);
      let calc = null; try { calc = this.calcSummary(combat, ev, result); } catch (err) { calc = null; }
      await this.emit('resolved', { combat, result, moves, calc });
    }
    // resumo público da disputa (para "Ver cálculo"): valores, bônus por origem, anulações e desempate
    calcSummary(combat, ev, result) {
      const rows = [];
      for (const e of combat.entries) {
        const a = e.attr, r = { pid: e.pid, card: e.card, attr: a, base: a ? e.base[a] : null, withdrawn: !!e.withdrawn, gone: !!e.gone, autoWin: !!e.autoWin, margin: !!e.margin, parts: [], extra: (e.extra || []).slice(), bonus: e.bonus || 0, total: a ? e.stats[a] + (e.bonus || 0) : null, sum4: sum4(e.stats) };
        if (a) {
          const t = { stats: Object.assign({}, e.base) }; let prev = t.stats[a];
          for (const m of e.mods) { if (m.off) continue; const probe = Object.assign({}, e, { stats: t.stats }); try { m.fn(probe); } catch (err) { /* ignora */ }
            const d = t.stats[a] - prev; prev = t.stats[a]; r.parts.push({ src: m.src, label: m.label, d, other: m.src !== e.pid }); }
          r.statsAfter = e.stats[a];
        }
        rows.push(r);
      }
      const acts = (combat.activations || []).map(a => ({ pid: a.pid, card: a.card, nome: (SP[CARDS[a.card].especial] || {}).nome || '', cancelled: !!a.cancelled, forced: !!a.forced }));
      return { rows, acts, fx: (combat.fx || []).slice(0, 14), top: ev && ev.top, tb: ev && ev.tb || null, none: !!(ev && ev.none), tie: !!(ev && ev.tie), inv: !!(combat.ev && combat.ev.id === 'avesso'), evId: combat.ev ? combat.ev.id : null, type: result.type, winnerPid: result.winnerPid, attr: result.attr || null };
    }
    async chooseLoser(w, cand, label) {
      if (cand.length === 1) return cand[0];
      const p = this.p(w.pid);
      if (p.bot) return this.blindNow(p) ? cand[Math.floor(this.rand() * cand.length)] : cand.slice().sort((a, b) => sum4(CARDS[b.card].stats) - sum4(CARDS[a.card].stats))[0];
      const pid = await this.io.chooseTarget(p, cand.map(c => c.pid), label); return cand.find(c => c.pid === pid) || cand[0];
    }

    // ---------------------------------------------------------------- IA
    skill(p) { const d = (p && p.diff) || this.cfg.difficulty; return { facil: 0.1, normal: 0.6, dificil: 1 }[d] ?? 0.6; }
    // Nível do bot: blind = chance de NÃO ler o estado da mesa (escolhe sem olhar adversários/cartas); lapse = chance de errar a escolha do atributo; ord = ruído ao ordenar a mão.
    // cap = quantas cartas seguintes de um rival ele consegue guardar de uma espiada; forget = chance de esquecer o que viu a cada disputa; mist = chance de errar o custo ao decidir se sacrifica a carta como especial
    lvl(p) { const d = (p && p.diff) || this.cfg.difficulty; return { facil: { blind: 0.25, lapse: 0.14, ord: 80, cap: 3, forget: 0.08, mist: 0.4 }, normal: { blind: 0.12, lapse: 0.06, ord: 50, cap: 5, forget: 0.03, mist: 0.15 }, dificil: { blind: 0, lapse: 0.01, ord: 30, cap: 10, forget: 0.002, mist: 0.01 } }[d] || { blind: 0.12, lapse: 0.06, ord: 50, cap: 5, forget: 0.03, mist: 0.15 }; }
    // ---- memória do bot (modelo de fila). Para cada rival, a ordem do baralho que ele conhece; null = carta que não viu.
    // Cartas jogadas voltam ao fim do baralho de quem as ganha: depois de uma volta o bot já sabe a ordem, sem gastar especial.
    // Espiadas preenchem o início mais cedo. Níveis baixos guardam menos cartas (cap) e esquecem mais (forget).
    memInit() { this.s.players.forEach(p => { if (!p.bot) return; p.mem = { q: {}, prep: {}, cur: {} }; this.s.players.forEach(o => { if (o.pid !== p.pid) p.mem.q[o.pid] = Array(o.deck.length).fill(null); }); }); }
    memQ(p, t) { const n = this.p(t).deck.length; let q = p.mem.q[t]; if (!q || q.length > n) q = p.mem.q[t] = Array(n).fill(null); while (q.length < n) q.push(null); return q; }
    memKnown(p, t) { if (!p || !p.mem) return []; const q = this.memQ(p, t), out = []; for (const c of q) { if (c == null) break; out.push(c); } return out; }
    memTrim(p, t) { const q = p.mem.q[t], cap = this.lvl(p).cap; let n = 0; for (let i = 0; i < q.length; i++) if (q[i] != null && ++n > cap) q[i] = null; }
    learn(p, t, cards, kind) {
      if (!p || !p.bot || !p.mem || t == null) return;
      if (kind === 'prep') { p.mem.prep[t] = cards.slice(0, 2); return; }
      const q = this.memQ(p, t); cards.forEach((c, i) => { if (i < q.length) q[i] = c; }); this.memTrim(p, t);
    }
    memTick() { // início da disputa: esquece um pouco (mais no fácil) e limpa a carta prevista da mesa
      this.s.players.forEach(p => { if (!p.bot || !p.mem) return; p.mem.cur = {}; const f = this.lvl(p).forget;
        Object.keys(p.mem.q).forEach(t => { const q = p.mem.q[t]; for (let i = 0; i < q.length; i++) if (q[i] != null && this.rand() < f) q[i] = null; });
        Object.keys(p.mem.prep).forEach(k => { if (this.rand() < f) delete p.mem.prep[k]; }); });
    }
    memCommit(combat) { // as cartas foram à mesa (viradas para baixo): o bot prevê a de cada rival pela fila e acompanha quantas saíram do topo
      this.s.players.forEach(p => { if (!p.bot || !p.mem) return; combat.entries.forEach(e => {
        if (e.pid === p.pid) return; const q = p.mem.q[e.pid]; if (!q) return; const L = this.p(e.pid).deck.length, removed = q.length - L;
        if (removed < 1) { p.mem.q[e.pid] = Array(L).fill(null); return; }         // não bate: perdeu o fio
        if (q[removed - 1] != null) p.mem.cur[e.pid] = q[removed - 1];
        q.splice(0, removed);
      }); });
    }
    memResolved(moves) { // fim da disputa: toda carta que mudou de baralho foi vista; entra no fim da fila de quem a recebeu
      this.s.players.forEach(p => { if (!p.bot || !p.mem) return;
        (moves || []).forEach(m => { if (m.zone === 'reserve' || typeof m.to !== 'number' || m.to === p.pid) return; const q = p.mem.q[m.to]; if (q) q.push(...m.cards); });
        Object.keys(p.mem.q).forEach(t => { this.memQ(p, +t); this.memTrim(p, +t); }); });
    }
    memTouch(d, type) { // algo mexeu no baralho de alguém à vista de todos: quem só viu acontecer perde a fila dele
      const ids = [d.from, d.to, d.pid, d.target].filter(x => x != null);
      this.s.players.forEach(p => { if (p.bot && p.mem) ids.forEach(i => { const q = p.mem.q[i]; if (i === p.pid || !q) return;
        if (type === 'extra' && q.length === this.p(i).deck.length + 1) { q.shift(); return; }             // a carta extra saiu do topo, à vista
        p.mem.q[i] = Array(this.p(i).deck.length).fill(null); }); });
    }
    foeNow(p, t) { // carta que o bot SABE (pela fila) que o rival t joga nesta disputa
      if (!p || !p.mem) return null; const c = this.combat; if (c && c.entries.length) return p.mem.cur[t] || null;
      return this.memKnown(p, t)[0] || null;
    }
    foeNext(p, t) { // a seguinte de t, se sabe
      if (!p || !p.mem) return null; const c = this.combat, k = this.memKnown(p, t); return (c && c.entries.length ? k[0] : k[1]) || null;
    }
    // chance (0..1) de ganhar com o atributo a contra os rivais cujas cartas ele conhece; os desconhecidos entram pelo percentil
    pWin(p, entry, a, combat) {
      const v = entry.stats[a], inv = !!(combat && combat.ev && combat.ev.id === 'avesso'), ab = !!(combat && combat.ev && combat.ev.id === 'aberta'); let P = 1, known = 0;
      (combat ? combat.entries : []).forEach(x => {
        if (x.pid === p.pid || x.withdrawn || this.sameTeam(x.pid, p.pid)) return; const c = this.foeNow(p, x.pid);
        if (!c) { P *= inv ? 1 - pct(a, v) : pct(a, v); return; } known++;
        const st = CARDS[c].stats, cand = x.attr ? [x.attr] : ab ? AID : AID.filter(k => ATTR[k].par === ATTR[a].par);
        const ov = inv ? Math.min(...cand.map(k => st[k])) : Math.max(...cand.map(k => st[k])); P *= 1 / (1 + Math.exp(-(inv ? ov - v : v - ov) / 7));
      });
      return { P, known };
    }
    blindNow(p) { return !!(p && p.bot) && this.rand() < this.lvl(p).blind; }
    async bot_attr(p, entry, options, combat) {
      const sk = this.skill(p); let best = null, bs = -1;
      if (options.length > 1 && this.rand() < this.lvl(p).lapse) return options[Math.floor(this.rand() * options.length)];   // deslize
      options.forEach(a => {
        const v = entry.stats[a], w = this.pWin(p, entry, a, combat);
        let s = w.known ? w.P * 1.1 + (this.rand() - 0.5) * (0.35 - 0.3 * sk) : (combat && combat.ev && combat.ev.id === 'avesso' ? 1 - pct(a, v) : pct(a, v)) * (0.6 + 0.4 * sk) + (this.rand() - 0.5) * (0.5 - 0.4 * sk);   // com a carta do rival na memória, prevê o resultado
        s += ATTR[a].tipo === 'ataque' ? 0.03 : 0; if (s > bs) { bs = s; best = a; }
      });
      return best;
    }
    // ---- IA dos especiais ----
    // Valor típico de cada especial para quem o prepara (0..1). Define quanto vale gastar uma carta de combate como especial.
    botVal(sp, p) {
      if (p && p.pol && p.pol.val != null) return p.pol.val;                           // (testes) política individual para medir um especial contra espelhos
      if (sp.val != null) return sp.val;
      const byCat = { 'Bônus': 1.6, 'Conversão': 1.2, 'Controle': 1, 'Roubo': 3, 'Troca': 1, 'Redistribuição': 0.8, 'Defesa': 1.2, 'Buraco Negro': 1.4, 'Informação': 0.2, 'Captura': 1.5, 'Interação': 1 };
      return byCat[sp.cat] ?? 1;
    }
    // chance de o adversário o virar um especial nesta disputa (para especiais reativos)
    botOppFlip(pid) {
      if (this.combat && this.combat.react) return this.foeActs(this.combat, pid).length ? 1 : 0;   // na janela de reação o bot SABE o que foi virado
      let none = 1; this.alive().forEach(o => { if (o === pid || this.sameTeam(o, pid)) return; const n = this.p(o).prepared.length; none *= 1 - (n >= 2 ? 0.5 : n === 1 ? 0.33 : 0); });
      return 1 - none;
    }
    // partidas longas (ciclos de capturas) pedem mais ousadia: sobe depois da rodada 12
    botUrgency() { return Math.max(0, Math.min(1, (this.s.round - 12) / 20)); }
    botPrepWant(p, sp) {
      if (sp.want) { try { if (!sp.want(this, p)) return 0; } catch (e) { /* segue */ } }
      if (sp.noWant) return 1;
      try { const ctx = this.ctxFor(this.combat); return sp.can(ctx, p.pid) ? 1 : 0; } catch (e) { return 1; }
    }
    async bot_prepare(p, topCard) {
      const sp = SP[CARDS[topCard].especial]; if (!sp) return false;
      if (p.prepared.length >= 2 || p.noSpecial) return false;
      if (p.deck.length < 3 && p.reserve.length < 3) return false;
      if (sp.minOpps && this.alive().length - 1 < sp.minOpps) return false;
      if (this.botVal(sp, p) < 0.15 * (1 - this.botUrgency()) || !this.botPrepWant(p, sp)) return false;
      const sk = this.skill(p), urg = this.botUrgency(), V = this.botVal(sp, p) * (sp.prep == null ? 1 : 0.5 + 0.5 * Math.min(1, sp.prep * 2)) + 1.5 * urg;
      // carta como combatente vale ~ (2·P(vencer) − 1) cartas; como especial vale V. Carta fraca rende mais virando especial.
      const mine = sum4(CARDS[topCard].stats), pc0 = SUMS.filter(x => x <= mine).length / SUMS.length;
      let pcs = 0, nf = 0; this.alive().forEach(o => { if (o === p.pid || this.sameTeam(o, p.pid)) return; nf++; const k = this.foeNow(p, o); pcs += k ? 1 / (1 + Math.exp(-(mine - sum4(CARDS[k].stats)) / 35)) : pc0; });   // rival conhecido: compara de verdade
      const pc1 = nf ? pcs / nf : pc0, pc = this.combat && this.combat.ev && this.combat.ev.id === 'avesso' ? 1 - pc1 : pc1, lv = this.lvl(p), T = this.rand() < lv.mist ? this.rand() * 0.7 : 1.2 * pc;               // às vezes erra o custo: gasta carta forte, guarda fraca (mais no fácil)
      let ch = 1 / (1 + Math.exp(-(V - T) * 3));                     // vale a pena quando o especial rende mais que a carta lutando
      ch *= 0.85 + 0.15 * sk;                                        // dificuldade: o fácil prepara com menos critério
      if (p.prepared.length) ch *= 0.6;
      return this.rand() < Math.max(0, Math.min(0.95, ch * BOT_RATE * (1 + 2 * urg)));
    }
    async bot_special(p, usable, combat, ctx, stage) {
      const sk = this.skill(p), urg = this.botUrgency(); const thr = 0.46 - 0.16 * sk - 0.25 * urg, noise = 0.3 - 0.22 * sk;
      p._held = (p._held || 0);
      let best = null, bs = -1;
      usable.forEach(c => {
        const sp = SP[CARDS[c].especial]; let u = 0; try { const f = stage === 'react' && sp.ai0 ? sp.ai0 : sp.ai; u = f ? f(ctx, p.pid, c) : 0.4; } catch (e) { u = 0.3; }
        if (p.pol && p.pol.mul != null) u *= p.pol.mul;
        if (combat.ev && combat.ev.id === 'avesso' && sp.cat === 'Redução') u *= 0.1;   // no avesso, reduzir o rival o ajuda
        if (u < 0.12 - 0.08 * urg) return;                                                // sem utilidade nesta situação: nem o fácil gasta
        if (this.blindNow(p)) u = 0.5 * u + 0.5 * (0.15 + this.rand() * 0.55);            // leu mal a mesa: avalia com ruído, mas dentro do que faz sentido
        u += Math.min(0.2, 0.06 * p._held);                           // carta parada na mão: vale usar
        u += (this.rand() - 0.5) * 2 * noise;
        if (u > bs) { bs = u; best = c; }
      });
      if (best != null && bs >= thr) { p._held = 0; return best; }
      if (stage !== 'second') p._held++;
      return null;
    }
  }

  // Nomes/textos oficiais da PROPOSTA (habilidades_129.json) sobrepõem os de cada especial implementado.
  const HAB = (D && D.HABILIDADES) || {};
  // especiais cuja condição só existe durante a disputa (não dá para checar na preparação)
  const NOWANT = ['AE-131', 'AE-132', 'AE-133', 'AE-134', 'AE-141', 'AE-009', 'AE-052', 'AE-053', 'AE-054', 'AE-071', 'AE-101', 'AE-102', 'AE-103', 'AE-109', 'AE-107', 'AE-112', 'AE-111', 'AE-113', 'AE-117', 'AE-130', 'AE-115', 'AE-116', 'AE-073', 'AE-074', 'AE-114'];
  // Calibração dos bots (medida com tests/calib_val.js: varre val e aiMul de cada especial em duelo e em 3 jogadores; reativos/informação usam estimativa de projeto)
  // [antiga] (tests/bot_per_special.js): val = quanto vale gastar uma carta de combate para preparar; aiMul = escala da vontade de virar.
  // Valor de cada especial em "cartas de diferença" (medido com tests/bot_per_special.js: % de vitórias do bot que usa × o que nunca usa, (v-38)/12).
  const BOT_VAL = { 'AE-002': 0.6, 'AE-004': 0.6, 'AE-006': 0.6, 'AE-008': 0.6, 'AE-010': 1.6, 'AE-012': 0.6, 'AE-017': 0.5, 'AE-021': 0.15, 'AE-022': 0.3, 'AE-024': 0.3, 'AE-026': 0.3, 'AE-028': 0.15, 'AE-030': 0.6, 'AE-031': 2.5, 'AE-032': 1.6, 'AE-037': 0.6, 'AE-039': 2.5, 'AE-041': 0.15, 'AE-046': 1, 'AE-047': 1.6, 'AE-048': 1.6, 'AE-051': 0.4, 'AE-053': 1, 'AE-055': 0.15, 'AE-056': 0.15, 'AE-059': 1, 'AE-061': 1, 'AE-062': 1, 'AE-063': 0.4, 'AE-064': 0.05, 'AE-065': 0.1, 'AE-066': 0.2, 'AE-067': 0.5, 'AE-068': 0.3, 'AE-069': 1, 'AE-071': 0.15, 'AE-072': 0.15, 'AE-073': 0.8, 'AE-074': 0.9, 'AE-075': 0.15, 'AE-076': 0.7, 'AE-077': 0.6, 'AE-078': 0.7, 'AE-079': 0.7, 'AE-080': 0.3, 'AE-081': 1, 'AE-082': 0.3, 'AE-083': 0.3, 'AE-084': 0.2, 'AE-085': 0.3, 'AE-086': 0.6, 'AE-087': 2.5, 'AE-089': 0.3, 'AE-090': 0.7, 'AE-091': 0.3, 'AE-092': 0.1, 'AE-093': 0.25, 'AE-094': 0.1, 'AE-095': 0.25, 'AE-096': 0.4, 'AE-097': 0.2, 'AE-098': 0.1, 'AE-099': 0.1, 'AE-100': 0.3, 'AE-101': 0.3, 'AE-103': 1, 'AE-105': 0.9, 'AE-106': 0.6, 'AE-108': 0.8, 'AE-110': 0.3, 'AE-111': 0.9, 'AE-112': 0.8, 'AE-113': 0.9, 'AE-114': 0.8, 'AE-115': 0.9, 'AE-116': 0.9, 'AE-117': 0.15, 'AE-118': 0.6, 'AE-119': 0.15, 'AE-120': 0.3, 'AE-129': 2.5, 'AE-130': 1 };
  // sem utilidade para o bot (ele não consegue tirar proveito): nunca prepara
  const BOT_RATE = 1;
  const SUMS = D.CARTAS.map(c => sum4(c.stats)).sort((x, y) => x - y);
  const BOT_JUNK = [];
  const TUNE = { 'AE-002': { aiMul: 0.65 }, 'AE-004': { aiMul: 0.65 }, 'AE-006': { aiMul: 0.65 }, 'AE-008': { aiMul: 0.65 }, 'AE-010': { aiMul: 0.65 }, 'AE-012': { aiMul: 0.65 }, 'AE-021': { aiMul: 0.65 }, 'AE-022': { aiMul: 0.35 }, 'AE-030': { aiMul: 0.65 }, 'AE-031': { aiMul: 0.65 }, 'AE-032': { aiMul: 0.65 }, 'AE-037': { aiMul: 0.65 }, 'AE-039': { aiMul: 0.65 }, 'AE-041': { aiMul: 0.65 }, 'AE-046': { aiMul: 0.65 }, 'AE-047': { aiMul: 0.65 }, 'AE-048': { aiMul: 0.65 }, 'AE-059': { aiMul: 0.65 }, 'AE-061': { aiMul: 0.35 }, 'AE-062': { aiMul: 0.35 }, 'AE-069': { aiMul: 0.65 }, 'AE-071': { aiMul: 0.35 }, 'AE-072': { aiMul: 0.35 }, 'AE-075': { aiMul: 0.65 }, 'AE-081': { aiMul: 0.65 }, 'AE-082': { aiMul: 0.35 }, 'AE-101': { aiMul: 0.65 }, 'AE-103': { aiMul: 0.65 }, 'AE-110': { aiMul: 0.65 }, 'AE-129': { aiMul: 0.35 } };
  // Calibração de DOIS LADOS (tests/calib_mirror2.js, 13/10/2026): todas as cartas = X e todos os jogadores o usam (reações incluídas); o focal varre val × aiMul em duelo, 3 e 4 jogadores.
  // [val, mul] só onde superou a política anterior por margem; val 0 = gastar uma carta para prepará-lo rende menos que lutar com ela (o especial é fraco como habilidade).
  const MIRROR = {'AE-009': [0, 1], 'AE-018': [0, 1], 'AE-020': [0, 1], 'AE-024': [0, 1], 'AE-025': [0, 1], 'AE-026': [0, 1], 'AE-027': [0.15, 1.3], 'AE-029': [0, 1], 'AE-040': [1, 0.8], 'AE-051': [0, 1], 'AE-052': [0.15, 1], 'AE-057': [0, 1], 'AE-058': [0, 1], 'AE-063': [0, 1], 'AE-070': [0, 1], 'AE-073': [0.15, 0.3], 'AE-074': [1, 0.3], 'AE-076': [0.3, 0.3], 'AE-077': [0.3, 0.3], 'AE-078': [0.3, 0.3], 'AE-079': [0.6, 0.3], 'AE-080': [1.6, 0.3], 'AE-082': [0.6, 1], 'AE-085': [0.6, 1.3], 'AE-090': [0.3, 0.5], 'AE-091': [0, 1], 'AE-095': [0, 1], 'AE-096': [0, 1], 'AE-100': [0, 1], 'AE-102': [0, 1], 'AE-105': [0.15, 0.5], 'AE-107': [0, 1], 'AE-108': [0, 0.5], 'AE-111': [0, 1], 'AE-112': [0, 1], 'AE-113': [0.15, 0.3], 'AE-114': [0, 1], 'AE-115': [1, 0.3], 'AE-116': [0.3, 0.3], 'AE-118': [0.3, 0.3], 'AE-119': [0, 1], 'AE-120': [0.3, 0.3], 'AE-121': [0, 1], 'AE-122': [0, 1], 'AE-125': [0, 1], 'AE-128': [0, 1], 'AE-130': [0.15, 0.3]};
  // Especiais REATIVOS (respondem a especiais dos rivais): só são virados na janela de reação, depois da revelação dos demais.
  const REACT = ['AE-073', 'AE-074', 'AE-076', 'AE-077', 'AE-078', 'AE-079', 'AE-080', 'AE-113', 'AE-114', 'AE-115', 'AE-116', 'AE-120', 'AE-130', 'AE-134'];
  function finalize() {
    REACT.forEach(id => { if (SP[id]) { SP[id].react = true; SP[id].ai0 = SP[id].ai; } });
    if (SP['AE-134']) SP['AE-134'].reactAlways = true;
    NOWANT.forEach(id => { if (SP[id]) SP[id].noWant = true; });
    Object.keys(BOT_VAL).forEach(id => { if (SP[id]) SP[id].val = BOT_VAL[id]; });
    BOT_JUNK.forEach(id => { if (SP[id]) SP[id].val = 0; });
    Object.keys(SP).forEach(id => { if (SP[id].val == null && BOT_VAL[id] == null) SP[id].val = 4 * (SP[id]._v0 ?? 0.4); });
    Object.keys(MIRROR).forEach(id => { const sp = SP[id]; if (!sp || sp.react) return; const [v, m] = MIRROR[id]; sp.val = v; if (m !== 1 && sp.ai) { const f = sp.ai; sp.ai = (ctx, pid, c) => f(ctx, pid, c) * m; } });
    Object.keys(TUNE).forEach(id => { const sp = SP[id]; if (!sp) return; const t = TUNE[id]; if (t.val != null) sp.val = t.val; if (t.aiMul != null && sp.ai) { const f = sp.ai; sp.ai = (ctx, pid, c) => f(ctx, pid, c) * t.aiMul; } });
    const CUR = root.DS_CURTOS || {};
    Object.keys(HAB).forEach(id => {
      const h = HAB[id], tx = CUR[id] || h[1];
      if (SP[id]) { SP[id].nome = h[0]; SP[id].texto = tx; SP[id].grupo = h[2]; }
      else SP[id] = { id, nome: h[0], texto: tx, cat: h[2], grupo: h[2], stub: true, phase: 'main', can: () => true, ai: () => 0.03, apply(ctx, act) { ctx.say(`${ctx.name(act.pid)} virou “${h[0]}”, mas esse efeito ainda não foi implementado: nada acontece.`); } };
    });
  }

  const api = { Game, EVENTOS, SPECIALS: SP, CARDS, ATTRS, AID, ATTR, PROPOSTAS, sum4, pause, shuffle, mkRng, pct, def, PHASES };
  // especiais adicionais (especiais.js) são instalados aqui; depois aplicam-se os nomes oficiais
  const install = root.DS_ESPECIAIS || (typeof require !== 'undefined' && typeof module !== 'undefined' ? require('./especiais.js') : null);
  if (install) install(api);
  finalize();
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.DS_ENGINE = api;
})(typeof window !== 'undefined' ? window : globalThis);
