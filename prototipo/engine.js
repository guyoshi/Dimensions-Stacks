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
    'Empate absoluto (soma e Ataque+Inteligência iguais): sem vencedor; cada carta volta ao fim do baralho do dono.',
    'Baralho vazio: compra até 7 da reserva; sem reserva nem baralho, o jogador é eliminado e seus especiais preparados vão ao Buraco Negro.',
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
      apply(ctx, act) { const e = ctx.entry(act.pid); ctx.addMod(e, act.pid, nome, x => { for (const k in mods) x.stats[k] += mods[k]; }); ctx.say(`${ctx.name(act.pid)} ganha bônus de atributo.`); },
      ai(ctx, pid) { const e = ctx.entry(pid); let b = 0; const k = e.attr; b = mods[k] || 0; if (!b) return 0.05; return ctx.flipChance(pid, b); },
    }, extra || {}));
  }
  modSpec('AE-001', 'Impulso de Ataque', 'Sua carta de combate recebe +15 em Ataque nesta disputa.', { pod: 15 });
  modSpec('AE-002', 'Muralha de Defesa', 'Sua carta de combate recebe +15 em Defesa nesta disputa.', { def: 15 });
  modSpec('AE-003', 'Clarividência', 'Sua carta de combate recebe +15 em Inteligência nesta disputa.', { int: 15 });
  modSpec('AE-004', 'Arrancada', 'Sua carta de combate recebe +15 em Velocidade nesta disputa.', { vel: 15 });
  def('AE-005', 'Reforço flexível', 'Sua carta de combate recebe +15 no atributo que você está usando nesta disputa.', 'Bônus', {
    apply(ctx, act) { const e = ctx.entry(act.pid), a = e.attr; ctx.addMod(e, act.pid, 'Reforço flexível', x => { x.stats[a] += 15; }); ctx.say(`${ctx.name(act.pid)} reforça ${ATTR[a].nome}.`); },
    ai(ctx, pid) { return ctx.flipChance(pid, 15); },
  });
  modSpec('AE-006', 'Dupla resistência', 'Sua carta de combate recebe +15 Defesa e +20 Velocidade nesta disputa.', { def: 15, vel: 20 });
  modSpec('AE-007', 'Ímpeto ofensivo', 'Sua carta de combate recebe +10 Ataque e +10 Inteligência nesta disputa.', { pod: 10, int: 10 });
  modSpec('AE-008', 'Guarda equilibrada', 'Sua carta de combate recebe +10 Defesa e +10 Velocidade nesta disputa.', { def: 10, vel: 10 });
  def('AE-009', 'Superação', 'Se o valor original que você escolheu for 40 ou menos, adicione +25 a esse atributo.', 'Bônus', {
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
    ai: () => 0.1, val: 0.1,
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
    ai: ctx => bhU(ctx),
  });
  def('AE-083', 'Resgate do topo', 'Recupere a carta normal mais recente do Buraco Negro para o fim do seu baralho.', 'Buraco Negro', {
    can(ctx) { return ctx.bhNormal().length > 0; },
    async apply(ctx, act) { const l = ctx.bhNormal(); if (!l.length) return; const c = l[l.length - 1]; ctx.fromBH(c); ctx.player(act.pid).deck.push(c); ctx.say(`${ctx.name(act.pid)} resgata ${CARDS[c].nome}.`); await ctx.emit('rescue', { pid: act.pid, card: c }); },
    ai: ctx => bhU(ctx),
  });
  def('AE-090', 'Segunda chance', 'Se sua carta de combate fosse ao Buraco Negro nesta disputa, ela vai ao fim da sua reserva.', 'Defesa', {
    apply(ctx, act) { ctx.entry(act.pid).toReserve = true; ctx.say(`${ctx.name(act.pid)} se prepara para uma segunda chance.`); },
    ai(ctx, pid) { const w = winnerOf(ctx); return w && w.pid !== pid && ATTR[w.attr].tipo === 'defesa' ? 0.7 : 0.04; },
  });
  def('AE-093', 'Espionagem tripla', 'Veja as 3 próximas cartas do baralho ativo de um adversário, sem alterá-las.', 'Informação', {
    can(ctx, pid) { return ctx.opps(pid).some(o => ctx.player(o).deck.length > 0); },
    async apply(ctx, act) {
      const cand = ctx.opps(act.pid).filter(o => ctx.player(o).deck.length > 0); if (!cand.length) return;
      const t = await ctx.target(act.pid, cand, 'Espionar o baralho de quem?'); if (t == null) return; const cards = ctx.player(t).deck.slice(0, 3);
      await ctx.emit('peek', { pid: act.pid, target: t, cards }); ctx.say(`${ctx.name(act.pid)} espia o baralho de ${ctx.name(t)}.`);
    },
    ai: () => 0.08, val: 0.1,
  });
  def('AE-105', 'Defesa que captura', 'Se vencer usando Defesa ou Velocidade, capture a carta de 1 adversário derrotado em vez de descartá-la.', 'Resolução', {
    apply(ctx, act) { ctx.entry(act.pid).defCapture = true; ctx.say(`${ctx.name(act.pid)} prepara uma defesa que captura.`); },
    ai(ctx, pid) { const e = ctx.entry(pid); return ATTR[e.attr].tipo === 'defesa' && !ctx.isLosing(pid) ? 0.8 : 0.05; },
  });
  def('AE-106', 'Ataque que bane', 'Se vencer usando Ataque ou Inteligência, escolha 1 adversário derrotado: a carta dele vai ao Buraco Negro em vez de ser capturada.', 'Resolução', {
    apply(ctx, act) { ctx.entry(act.pid).atkBanish = true; ctx.say(`${ctx.name(act.pid)} prepara um ataque que bane.`); },
    // Banir só tira do vencedor a carta que ele capturaria: nenhum bot escolhe isso de propósito.
    val: 0.04, ai() { return 0.03; },
  });
  def('AE-108', 'Negar captura inimiga', 'Se perder para um atributo de ataque, sua carta vai ao Buraco Negro, não ao baralho do vencedor.', 'Resolução', {
    apply(ctx, act) { ctx.entry(act.pid).negateCapture = true; ctx.say(`${ctx.name(act.pid)} nega a captura da própria carta.`); },
    ai(ctx, pid) { const w = winnerOf(ctx); return w && w.pid !== pid && ATTR[w.attr].tipo === 'ataque' ? 0.5 : 0.04; },
  });
  def('AE-111', 'Ativação forçada', 'Escolha um adversário: ele é obrigado a ativar todas as suas cartas especiais já preparadas (até 2) nesta disputa.', 'Interação', {
    can(ctx, pid) { return ctx.opps(pid).some(o => ctx.player(o).prepared.length > 0); },
    async apply(ctx, act) {
      const cand = ctx.opps(act.pid).filter(o => ctx.player(o).prepared.length > 0); if (!cand.length) return ctx.say('Ninguém tem especiais preparados.');
      const t = await ctx.target(act.pid, cand, 'Forçar quem a ativar os especiais?'); if (t == null) return; await ctx.force(t, act);
    },
    ai: (ctx, pid) => Math.min(0.7, 0.2 + 0.2 * ctx.opps(pid).reduce((t, o) => t + ctx.player(o).prepared.length, 0)),
  });
  def('AE-113', 'Interrupção precisa', 'Cancele 1 ataque especial de um adversário antes da resolução; o especial cancelado é descartado normalmente. (Se ninguém ativar, é desperdiçada.)', 'Interação', {
    phase: 'pre',
    can(ctx, pid) { return ctx.opps(pid).some(o => ctx.player(o).prepared.length > 0); },
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

  // ---------------------------------------------------------------- jogo
  class Game {
    constructor(cfg) {
      this.cfg = Object.assign({ perPlayer: 12, difficulty: 'normal', maxCombats: 400, seed: (Math.random() * 2 ** 32) >>> 0 }, cfg);
      this.io = cfg.io || {};
      this.rand = mkRng(this.cfg.seed);
      this.logs = [];
      this.s = { players: [], bh: [], round: 1, combats: 0, initiator: 0, initiated: new Set(), over: false, winner: null };
      this.cards = CARDS; this.specials = SP;
    }
    get players() { return this.s.players; }
    p(pid) { return this.s.players[pid]; }
    alive() { return this.s.players.filter(p => p.alive).map(p => p.pid); }
    order(from) { const al = this.alive(); if (from == null) return al; const n = this.s.players.length; const out = []; for (let k = 0; k < n; k++) { const pid = (from + k) % n; if (this.p(pid).alive) out.push(pid); } return out; }
    nextAlive(pid) { const n = this.s.players.length; for (let k = 1; k <= n; k++) { const x = (pid + k) % n; if (this.p(x).alive) return x; } return pid; }
    prevAlive(pid) { const n = this.s.players.length; for (let k = 1; k <= n; k++) { const x = (pid - k + n * 2) % n; if (this.p(x).alive) return x; } return pid; }
    async emit(type, data) { if (this.io.notify) await this.io.notify(type, data || {}); }
    log(text, cls) { this.logs.push({ text, cls: cls || '' }); if (this.io.log) this.io.log(text, cls || ''); }
    totalCards(p) { return p.deck.length + p.reserve.length + p.prepared.length; }

    async setup() {
      const cfg = this.cfg, n = cfg.players.length;
      const per = Math.max(7, cfg.perPlayer);
      const ids = shuffle(D.CARTAS.map(c => c.id), this.rand).slice(0, per * n);
      this.s.players = cfg.players.map((pc, i) => ({ pid: i, name: pc.name, bot: !!pc.bot, avatar: pc.avatar, diff: pc.diff, noSpecial: !!pc.noSpecial, deck: [], reserve: [], prepared: [], alive: true }));
      const hands = []; let k = 0;
      for (let i = 0; i < n; i++) hands.push(ids.slice(k, k += 7));
      const rest = ids.slice(k); const rs = n ? Math.floor(rest.length / n) : 0;
      for (let i = 0; i < n; i++) this.p(i).reserve = rest.slice(i * rs, (i + 1) * rs);
      await this.emit('setup', {});
      for (let i = 0; i < n; i++) {
        const p = this.p(i); let ord;
        if (p.bot) ord = this.botOrderHand(hands[i], p); else ord = await this.io.orderHand(p, hands[i].slice());
        if (!ord || ord.length !== hands[i].length || ord.slice().sort().join() !== hands[i].slice().sort().join()) ord = hands[i];
        p.deck = ord.slice();
      }
      this.s.initiator = Math.floor(this.rand() * n);
      this.log(`${this.p(this.s.initiator).name} sorteia a iniciativa.`);
      await this.emit('ready', {});
    }
    botOrderHand(hand, p) { // melhores primeiro, com ruído (maior no fácil)
      const nz = this.lvl(p).ord;
      return hand.slice().sort((a, b) => (sum4(CARDS[b].stats) + this.rand() * nz) - (sum4(CARDS[a].stats) + this.rand() * nz));
    }

    ctxFor(combat) {
      const g = this;
      const ctx = {
        g, combat, activations: combat.activations,
        player: pid => g.p(pid), entry: pid => combat.entries.find(e => e.pid === pid),
        entries: () => combat.entries.filter(e => !e.withdrawn), name: pid => g.p(pid).name,
        alive: () => g.alive(), order: () => g.order(combat.initiator),
        opps: pid => g.alive().filter(x => x !== pid),
        right: pid => { const r = g.nextAlive(pid); return r === pid ? null : r; },
        left: pid => { const r = g.prevAlive(pid); return r === pid ? null : r; },
        rand: () => g.rand(), say: (t) => g.log(t, 'efeito'), emit: (t, d) => g.emit(t, d),
        sameTeam: () => false,
        bhNormal: () => g.s.bh.filter(x => x.kind === 'normal').map(x => x.id),
        bhAll: () => g.s.bh.map(x => x.id),
        toBH: (id, kind) => g.s.bh.push({ id, kind }),
        fromBH: id => { const i = g.s.bh.findIndex(x => x.id === id); if (i >= 0) g.s.bh.splice(i, 1); },
        value: e => e.stats[e.attr] + e.bonus,
        pickTarget: (pid, cand, label) => g.pickTarget(pid, cand, label),
        pick: (pid, cand, label, bot) => g.pickTarget(pid, cand, label, bot),
        target: async (pid, cand, label) => { if (!cand.length) return null; const t = await g.pickTarget(pid, cand, label); return g.hit(combat, pid, t); },
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
        isLosing: pid => { const w = g.evaluate(combat, true); return !w.winners.some(e => e.pid === pid); },
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
    addMod(e, src, label, fn) { e.mods.push({ src, label, fn, off: false }); fn(e); }
    swapEntryCard(e, card) { const old = e.card; e.card = card; e.base = Object.assign({}, CARDS[card].stats); this.recalc(e); return old; }
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
      if (cand.length === 1) return cand[0];
      const p = this.p(pid);
      if (p.bot && this.blindNow(p)) return cand[Math.floor(this.rand() * cand.length)];
      if (p.bot && bot) { const r = bot(cand); return cand.includes(r) ? r : cand[0]; }
      if (p.bot) { return cand.slice().sort((a, b) => this.totalCards(this.p(b)) - this.totalCards(this.p(a)))[0]; }
      const r = await this.io.chooseTarget(p, cand, label); return cand.includes(r) ? r : cand[0];
    }
    // chance (0..1) de um bônus +b mudar o resultado a favor
    flipChance(combat, pid, bonus) {
      const me = combat.entries.find(e => e.pid === pid); const v = me.stats[me.attr] + me.bonus;
      let bestOpp = -1; combat.entries.forEach(e => { if (e.pid !== pid && !e.withdrawn) bestOpp = Math.max(bestOpp, e.stats[e.attr] + e.bonus); });
      if (bestOpp < 0) return 0.02;
      if (v > bestOpp) return 0.04; if (v + bonus >= bestOpp) return 0.93; return 0.02;
    }

    // ---- avaliação do vencedor (empates: valor → soma 4 → Ataque+Inteligência) ----
    evaluate(combat, quiet) {
      const es = combat.entries.filter(e => !e.withdrawn);
      if (es.length < 2) return { winners: [], tie: false, none: true, top: 0 };
      const val = e => e.stats[e.attr] + e.bonus;
      const aw = es.find(e => e.autoWin); if (aw) return { winners: [aw], tie: false, none: false, top: val(aw) };
      const top = Math.max(...es.map(val));
      let pool = es.filter(e => val(e) === top);
      es.forEach(e => { if (e.margin && val(e) < top && top - val(e) <= 10 && !pool.includes(e)) pool.push(e); });
      let tie = false, tb = null;
      if (pool.length > 1) {
        tb = { stage: 1, top, list: pool.map(e => ({ pid: e.pid, v: sum4(e.stats) })) };
        let best = Math.max(...pool.map(e => sum4(e.stats))); pool = pool.filter(e => sum4(e.stats) === best);
        if (pool.length > 1) { tb = { stage: 2, top, list: pool.map(e => ({ pid: e.pid, v: e.stats.pod + e.stats.int })) }; best = Math.max(...pool.map(e => e.stats.pod + e.stats.int)); pool = pool.filter(e => e.stats.pod + e.stats.int === best); }
        if (pool.length > 1) tie = true;
      }
      return { winners: pool, tie, none: false, top, tb };
    }

    // ---------------------------------------------------------------- combate
    async refill() {
      for (const pid of this.order()) {
        const p = this.p(pid);
        if (p.deck.length === 0) {
          if (p.reserve.length > 0) { const take = p.reserve.splice(0, 7); p.deck.push(...take); this.log(`${p.name} compra ${take.length} cartas da reserva.`); await this.emit('refill', { pid, cards: take }); }
          else { await this.eliminate(pid); }
        }
      }
    }
    async eliminate(pid) {
      const p = this.p(pid); p.alive = false;
      p.prepared.forEach(c => this.s.bh.push({ id: c, kind: 'especial' })); p.prepared = [];
      this.log(`${p.name} foi eliminado!`, 'elim'); await this.emit('eliminated', { pid });
    }
    checkEnd() {
      const al = this.alive();
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
        if (this.alive().every(pid => this.s.initiated.has(pid))) { this.s.round++; this.s.initiated = new Set(); this.log(`— Rodada ${this.s.round} —`, 'rodada'); await this.emit('round', { round: this.s.round }); }
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
      const g = this, order = this.order(init);
      const combat = { initiator: init, order, entries: [], activations: [], ctrlActs: [], specialsAllowed: this.s.round >= (this.cfg.specialsFrom || 2),
        def: {}, ctl: { per: {} }, claims: [], onWin: [], pierce: {}, shield: {}, used: {}, locked: new Set() };
      this.combat = combat;
      await this.emit('combatStart', { initiator: init, round: this.s.round });
      // 1) preparação dos bots [PROPOSTA]
      if (combat.specialsAllowed) {
        const prep = [];
        for (const pid of order) { const p = this.p(pid); if (p.bot && p.prepared.length < 2 && p.deck.length >= 2) { const sp0 = SP[CARDS[p.deck[0]].especial]; if (!sp0) continue; const yes = await this.decide(p, 'prepare', p.deck[0]); if (yes) prep.push(pid); } }
        for (const pid of prep) { const p = this.p(pid); const c = p.deck.shift(); p.prepared.push(c); this.log(`${p.name} prepara um ataque especial.`, 'prep'); await this.emit('prepare', { pid, card: c }); }
      }
      // 2) cartas em campo
      for (const pid of order) {
        const p = this.p(pid); const c = p.deck.shift();
        combat.entries.push({ pid, card: c, base: Object.assign({}, CARDS[c].stats), stats: Object.assign({}, CARDS[c].stats), bonus: 0, extra: [], mods: [], attr: null, withdrawn: false, gone: false, noCaptureBy: new Set() });
      }
      await this.emit('commit', { combat });
      // 2b) especiais de controle (antes de declarar atributos)
      if (combat.specialsAllowed) await this.ctrlWindow(combat);
      // 3) atributos: iniciador escolhe (dentro do que os controles permitem); os demais no mesmo par
      const ie = combat.entries.find(e => e.pid === init);
      ie.attr = await this.chooseAttr(combat, ie, this.attrOptions(combat, ie, AID));
      if (!AID.includes(ie.attr)) ie.attr = AID[0];
      this.log(`${this.p(init).name} inicia em ${ATTR[ie.attr].nome}.`, 'attr');
      await this.emit('initiatorAttr', { combat, pid: init, attr: ie.attr });
      const pair = AID.filter(a => ATTR[a].par === ATTR[ie.attr].par);
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
      let opts = base.slice(); const tryF = f => { const r = opts.filter(f); if (r.length) opts = r; };
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
      for (const pid of combat.order) {
        const p = this.p(pid); const isMain = c => { const sp = SP[CARDS[c].especial]; return sp && sp.phase !== 'ctrl' && !combat.locked.has(c) && sp.can(ctx, pid); };
        let usable = p.prepared.filter(isMain);
        if (!usable.length || (combat.used[pid] || 0) >= 1) continue;
        await this.emit('specialWindow', { pid, usable, stage: 'main' });
        const c = await this.decide(p, 'special', usable, combat, ctx, 'main');
        if (c == null || !usable.includes(c)) continue;
        picks.push({ pid, card: c }); combat.used[pid] = 1;
        // companheiras: um segundo especial só se uma das duas cartas for "companheira"
        const comp = x => !!SP[CARDS[x].especial].companion;
        const second = p.prepared.filter(x => x !== c && isMain(x) && (comp(c) ? true : comp(x)));
        if (second.length) { const c2 = await this.decide(p, 'special', second, combat, ctx, 'second'); if (c2 != null && second.includes(c2)) picks.push({ pid, card: c2 }); }
      }
      for (const pk of picks) this.activate(combat, pk.pid, pk.card, false);
      if (combat.activations.length) await this.emit('specialsFlip', { combat, acts: combat.activations.slice() });
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
        const ch = per.chooser; const pick = await this.askAttr(ch, { title: `Escolha o atributo que ${p.name} vai usar`, hint: 'A carta dele está fechada: a escolha é às cegas.', options }, () => options[Math.floor(this.rand() * options.length)]);
        this.log(`${this.p(ch).name} escolhe o atributo de ${p.name}.`, 'efeito'); return pick;
      }
      for (let guard = 0; guard < 4; guard++) {
        const canPrep = !p.bot && combat.specialsAllowed && p.prepared.length < 2 && p.deck.length >= 1;
        if (options.length === 1 && !canPrep) return options[0];
        const r = await this.decide(p, 'attr', e, options, combat, canPrep);
        if (r === '@prep' && canPrep) {
          const old = e.card; p.prepared.push(old);
          const c2 = p.deck.shift(); e.card = c2; e.base = Object.assign({}, CARDS[c2].stats); e.mods = []; e.extra = []; e.attr = null; this.recalc(e);
          this.log(`${p.name} prepara um ataque especial.`, 'prep');
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
      else if (ev.tie) { live.filter(e => !claimed.has(e)).forEach(back); this.log('Empate absoluto: as cartas voltam aos donos.', 'res'); result = { type: 'tie', winners: ev.winners.map(e => e.pid), winnerPid: null }; }
      else {
        const w = ev.winners[0]; const attack = ATTR[w.attr].tipo === 'ataque';
        const losers = live.filter(e => e !== w && !claimed.has(e));
        const clock = (pid) => this.order(w.pid).indexOf(pid);
        losers.sort((a, b) => clock(a.pid) - clock(b.pid));
        if (!claimed.has(w)) back(w);
        let special = null; // um perdedor escolhido por 105/106
        if (attack && w.atkBanish && losers.length) { const cand = losers.filter(l => !l.saveOnLoss); if (cand.length) special = await this.chooseLoser(w, cand, 'Qual carta vai ao Buraco Negro?'); }
        if (!attack && w.defCapture && losers.length) { const cand = losers.filter(l => !l.saveOnLoss); if (cand.length) special = await this.chooseLoser(w, cand, 'Qual carta capturar?'); }
        for (const l of losers) {
          if (l.saveOnLoss) { back(l); continue; }
          const blocked = l.noCaptureBy.has(w.pid);
          if (attack || w.compCapture) {
            if (attack && w.atkBanish && special === l && !l.noBHBySpecial) { toBH(l); continue; }
            if (attack && l.negateCapture) { toBH(l); continue; }
            if (blocked) { back(l); this.log(`${this.p(l.pid).name} impede a captura da própria carta.`, 'res'); continue; }
            capture(l, w.pid);
          } else {
            if (w.defCapture && special === l) { if (blocked) toBH(l); else capture(l, w.pid); continue; }
            toBH(l);
          }
        }
        result = { type: attack ? 'attack' : 'defense', winners: [w.pid], winnerPid: w.pid, attr: w.attr, value: w.stats[w.attr] + w.bonus, tb: ev.tb || null };
        if (ev.tb) this.log(`Empate em ${ev.tb.top}! Desempate pela ${ev.tb.stage === 1 ? 'soma dos 4 atributos' : 'soma de Ataque + Inteligência'}: ${ev.tb.list.map(x => this.p(x.pid).name + ' ' + x.v).join(' × ')}.`, 'efeito');
        this.log(`${this.p(w.pid).name} vence ${attack ? 'atacando' : 'defendendo'} com ${ATTR[w.attr].nome} ${result.value}.`, 'vit');
      }
      combat.result = result; combat.moves = moves;
      await this.emit('resolved', { combat, result, moves });
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
    lvl(p) { const d = (p && p.diff) || this.cfg.difficulty; return { facil: { blind: 0.35, lapse: 0.2, ord: 100 }, normal: { blind: 0.12, lapse: 0.06, ord: 50 }, dificil: { blind: 0, lapse: 0.01, ord: 30 } }[d] || { blind: 0.12, lapse: 0.06, ord: 50 }; }
    blindNow(p) { return !!(p && p.bot) && this.rand() < this.lvl(p).blind; }
    async bot_attr(p, entry, options, combat) {
      const sk = this.skill(p); let best = null, bs = -1;
      if (options.length > 1 && this.rand() < this.lvl(p).lapse) return options[Math.floor(this.rand() * options.length)];   // deslize
      options.forEach(a => { const v = entry.stats[a]; let s = pct(a, v) * (0.6 + 0.4 * sk) + (ATTR[a].tipo === 'ataque' ? 0.03 : 0) + (this.rand() - 0.5) * (0.5 - 0.4 * sk); if (s > bs) { bs = s; best = a; } });
      return best;
    }
    // ---- IA dos especiais ----
    // Valor típico de cada especial para quem o prepara (0..1). Define quanto vale gastar uma carta de combate como especial.
    botVal(sp) {
      if (sp.val != null) return sp.val;
      const byCat = { 'Bônus': 1.6, 'Conversão': 1.2, 'Controle': 1, 'Roubo': 3, 'Troca': 1, 'Redistribuição': 0.8, 'Defesa': 1.2, 'Buraco Negro': 1.4, 'Informação': 0.2, 'Captura': 1.5, 'Interação': 1 };
      return byCat[sp.cat] ?? 1;
    }
    // chance de o adversário o virar um especial nesta disputa (para especiais reativos)
    botOppFlip(pid) {
      let none = 1; this.alive().forEach(o => { if (o === pid) return; const n = this.p(o).prepared.length; none *= 1 - (n >= 2 ? 0.5 : n === 1 ? 0.33 : 0); });
      return 1 - none;
    }
    // partidas longas (ciclos de capturas) pedem mais ousadia: sobe depois da rodada 12
    botUrgency() { return Math.max(0, Math.min(1, (this.s.round - 12) / 20)); }
    botPrepWant(p, sp) {
      if (sp.noWant) return 1;
      try { const ctx = this.ctxFor(this.combat); return sp.can(ctx, p.pid) ? 1 : 0; } catch (e) { return 1; }
    }
    async bot_prepare(p, topCard) {
      const sp = SP[CARDS[topCard].especial]; if (!sp) return false;
      if (p.prepared.length >= 2 || p.noSpecial) return false;
      if (p.deck.length < 3 && p.reserve.length < 3) return false;
      if (sp.minOpps && this.alive().length - 1 < sp.minOpps) return false;
      if (this.botVal(sp) < 0.15 * (1 - this.botUrgency()) || !this.botPrepWant(p, sp)) return false;
      const sk = this.skill(p), urg = this.botUrgency(), V = this.botVal(sp) * (sp.prep == null ? 1 : 0.5 + 0.5 * Math.min(1, sp.prep * 2)) + 1.5 * urg;
      // carta como combatente vale ~ (2·P(vencer) − 1) cartas; como especial vale V. Carta fraca rende mais virando especial.
      const pc = SUMS.filter(x => x <= sum4(CARDS[topCard].stats)).length / SUMS.length, T = 1.2 * pc;
      let ch = 0.55 + (V - T) * 0.35;
      ch *= 0.55 + 0.45 * sk;                                        // dificuldade: o fácil prepara com menos critério
      if (p.prepared.length) ch *= 0.6;
      return this.rand() < Math.max(0, Math.min(0.95, ch * BOT_RATE * (1 + 2 * urg)));
    }
    async bot_special(p, usable, combat, ctx, stage) {
      const sk = this.skill(p), urg = this.botUrgency(); const thr = 0.46 - 0.16 * sk - 0.25 * urg, noise = 0.3 - 0.22 * sk;
      p._held = (p._held || 0);
      let best = null, bs = -1;
      usable.forEach(c => {
        const sp = SP[CARDS[c].especial]; let u = 0; try { u = sp.ai ? sp.ai(ctx, p.pid) : 0.4; } catch (e) { u = 0.3; }
        if (this.blindNow(p)) u = 0.1 + this.rand() * 0.6;                              // não leu a mesa: decide quase às cegas
        if (u < 0.12 - 0.08 * urg) return;                                          // sem utilidade nesta situação: nunca gasta
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
  const NOWANT = ['AE-009', 'AE-052', 'AE-053', 'AE-054', 'AE-071', 'AE-101', 'AE-102', 'AE-103', 'AE-109', 'AE-107', 'AE-112', 'AE-111', 'AE-113', 'AE-117', 'AE-130', 'AE-115', 'AE-116', 'AE-073', 'AE-074', 'AE-114'];
  // Calibração dos bots (medida com tests/bot_per_special.js): val = quanto vale gastar uma carta de combate para preparar; aiMul = escala da vontade de virar.
  // Valor de cada especial em "cartas de diferença" (medido com tests/bot_per_special.js: % de vitórias do bot que usa × o que nunca usa, (v-38)/12).
  const BOT_VAL = { 'AE-002': 1.2, 'AE-004': 1.2, 'AE-006': 2.2, 'AE-008': 1.6, 'AE-010': 4.8, 'AE-012': 1.1, 'AE-017': 0.2, 'AE-021': 0.9, 'AE-022': 0.5, 'AE-024': 0, 'AE-026': 0, 'AE-028': 0.9, 'AE-030': 0.4, 'AE-031': 4.1, 'AE-032': 4.1, 'AE-037': 2.8, 'AE-039': 4.0, 'AE-041': 2.2, 'AE-046': 2.4, 'AE-047': 2.3, 'AE-048': 2.2, 'AE-051': 0.2, 'AE-053': 4.5, 'AE-055': 0.4, 'AE-059': 1.0, 'AE-061': 0.7, 'AE-062': 0.7, 'AE-063': 0.8, 'AE-066': 0.4, 'AE-067': 1.4, 'AE-068': 0.2, 'AE-069': 2.4, 'AE-071': 1.5, 'AE-072': 1.5, 'AE-073': 0.9, 'AE-074': 0.9, 'AE-075': 1.7, 'AE-076': 0.9, 'AE-077': 0.9, 'AE-078': 0.9, 'AE-079': 0.9, 'AE-080': 0.5, 'AE-081': 0.1, 'AE-082': 0.2, 'AE-083': 0.2, 'AE-084': 0, 'AE-085': 0.2, 'AE-086': 0, 'AE-087': 3.6, 'AE-089': 0, 'AE-090': 0.9, 'AE-091': 0.5, 'AE-092': 0.4, 'AE-093': 0.4, 'AE-094': 0.7, 'AE-095': 0, 'AE-096': 0, 'AE-097': 0.3, 'AE-098': 0.7, 'AE-099': 0.2, 'AE-100': 0, 'AE-101': 3.3, 'AE-103': 4.3, 'AE-105': 0.9, 'AE-106': 0.7, 'AE-108': 0.9, 'AE-110': 1.7, 'AE-111': 0.9, 'AE-112': 0.9, 'AE-113': 0.9, 'AE-114': 0.9, 'AE-115': 0.9, 'AE-116': 0.9, 'AE-117': 0.4, 'AE-118': 0.9, 'AE-120': 0.3, 'AE-129': 4.9, 'AE-130': 0.9 };
  // sem utilidade para o bot (ele não consegue tirar proveito): nunca prepara
  const BOT_RATE = 2.2;
  const SUMS = D.CARTAS.map(c => sum4(c.stats)).sort((x, y) => x - y);
  const BOT_JUNK = ['AE-066', 'AE-061', 'AE-062', 'AE-098', 'AE-106', 'AE-055', 'AE-056', 'AE-063', 'AE-064', 'AE-065', 'AE-091', 'AE-080', 'AE-093', 'AE-094', 'AE-092', 'AE-120', 'AE-117', 'AE-017', 'AE-099'];
  const TUNE = {
    'AE-055': { aiMul: 0.4 }, 'AE-056': { aiMul: 0.4 },
    'AE-061': { aiMul: 0.3 }, 'AE-062': { aiMul: 0.3 }, 'AE-063': { aiMul: 0.2 }, 'AE-064': { aiMul: 0.2 }, 'AE-065': { aiMul: 0.2 },
    'AE-051': { aiMul: 0.5 }, 'AE-095': { aiMul: 0.3 }, 'AE-100': { aiMul: 0.5 },
    'AE-081': { aiMul: 0.6 }, 'AE-066': { aiMul: 0.5 },
  };
  function finalize() {
    NOWANT.forEach(id => { if (SP[id]) SP[id].noWant = true; });
    Object.keys(BOT_VAL).forEach(id => { if (SP[id]) SP[id].val = BOT_VAL[id]; });
    BOT_JUNK.forEach(id => { if (SP[id]) SP[id].val = 0; });
    Object.keys(SP).forEach(id => { if (SP[id].val == null && BOT_VAL[id] == null) SP[id].val = 4 * (SP[id]._v0 ?? 0.4); });
    Object.keys(TUNE).forEach(id => { const sp = SP[id]; if (!sp) return; const t = TUNE[id]; if (t.val != null) sp.val = t.val; if (t.aiMul != null && sp.ai) { const f = sp.ai; sp.ai = (ctx, pid) => f(ctx, pid) * t.aiMul; } });
    const CUR = root.DS_CURTOS || {};
    Object.keys(HAB).forEach(id => {
      const h = HAB[id], tx = CUR[id] || h[1];
      if (SP[id]) { SP[id].nome = h[0]; SP[id].texto = tx; SP[id].grupo = h[2]; }
      else SP[id] = { id, nome: h[0], texto: tx, cat: h[2], grupo: h[2], stub: true, phase: 'main', can: () => true, ai: () => 0.03, apply(ctx, act) { ctx.say(`${ctx.name(act.pid)} virou “${h[0]}”, mas esse efeito ainda não foi implementado: nada acontece.`); } };
    });
  }

  const api = { Game, SPECIALS: SP, CARDS, ATTRS, AID, ATTR, PROPOSTAS, sum4, pause, shuffle, mkRng, pct, def, PHASES };
  // especiais adicionais (especiais.js) são instalados aqui; depois aplicam-se os nomes oficiais
  const install = root.DS_ESPECIAIS || (typeof require !== 'undefined' && typeof module !== 'undefined' ? require('./especiais.js') : null);
  if (install) install(api);
  finalize();
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.DS_ENGINE = api;
})(typeof window !== 'undefined' ? window : globalThis);
