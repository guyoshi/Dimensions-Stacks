/* Dimensions Stacks — habilidades especiais (AE-xxx) além das básicas do motor.
   Nomes e textos oficiais vêm de habilidades_129.json (engine.js sobrepõe depois); aqui está só a mecânica.
   Fases de resolução (engine.PHASES): ctrl (antes dos atributos) · shield · pre · guard · main · echo · late.
   Interpretações onde o texto é ambíguo estão marcadas com [PROPOSTA]. */
(function (root) {
  'use strict';
  function install(api) {
    const { SPECIALS: SP, CARDS, ATTR, AID, sum4, def } = api;
    const sum = id => sum4(CARDS[id].stats);
    const lowest = (cards, n) => cards.slice().sort((a, b) => sum(a) - sum(b)).slice(0, n);
    const highest = (cards, n) => cards.slice().sort((a, b) => sum(b) - sum(a)).slice(0, n);
    const top = () => [0];
    const last = l => [l.length - 1];
    const D = (id, cat, o) => def(id, id, id, cat, o);
    const hasDeck = (ctx, o) => ctx.player(o).deck.length > 0;
    const nm = (ctx, pid) => ctx.name(pid);
    const maxOf = (e, par) => AID.filter(a => ATTR[a].par === par).reduce((m, a) => Math.max(m, e.stats[a]), 0);
    // ---- apoio à IA ----
    const oppFlip = (ctx, pid) => ctx.g.botOppFlip(pid);
    // na janela de reação o bot sabe o que os rivais viraram: null fora dela; senão hit/miss conforme a categoria revelada
    const seenCat = (ctx, pid, cats, hit, miss) => { const c = ctx.g.combat; if (!c || !c.react) return null; return ctx.g.foeActs(c, pid).some(a => cats.includes(SP[CARDS[a.card].especial].cat)) ? hit : miss; };
    const ORR = (v, f) => v == null ? f() : v;                       // chance de algum rival virar especial
    const winnerOf = ctx => { const w = ctx.g.evaluate(ctx.combat, true); return w.winners && w.winners.length === 1 ? w.winners[0] : null; };
    const richest = (ctx, cand) => cand.slice().sort((a, b) => ctx.g.totalCards(ctx.player(b)) - ctx.g.totalCards(ctx.player(a)))[0];
    const pctOf = (e, list) => Math.max(...list.map(a => api.pct(a, e.stats[a])));
    const ctrlU = p => Math.max(0.03, Math.min(0.85, (p - 0.5) * 2));
    const needMem = (g, p) => g.alive().some(o => o !== p.pid && g.p(o).deck.length > 0 && g.memKnown(p, o).length < 2);
    const MEANSUM = (() => { const l = Object.keys(CARDS); return l.reduce((t, id) => t + sum(id), 0) / l.length; })();
    const bhAvg = ctx => avgSum(ctx.bhNormal());
    const clamp01 = x => Math.max(0.03, Math.min(0.85, x));
    // ganho em "cartas médias" de um resgate: o que volta menos o que se gasta (a carta do especial, mais o que for sacrificado)
    const gainU = (g) => clamp01(0.15 + 0.45 * (g / MEANSUM));
    const costC = c => c ? sum(c) : 0.6 * MEANSUM;
    // cartas seguintes dos rivais que o bot lembra (do topo para o fundo)
    const foeSeqs = (ctx, pid) => ctx.opps(pid).map(o => ctx.mem(pid, o));
    // ordem para minhas próximas cartas: cada posição enfrenta o rival que lembro; uso a MENOR carta que vence e entrego a pior onde já perdi
    const orderVs = (ctx, pid, v) => {
      const seqs = foeSeqs(ctx, pid); let rest = v.slice(); const out = [];
      for (let i = 0; i < v.length; i++) {
        const need = Math.max(0, ...seqs.map(q => q[i] ? sum(q[i]) : 0)); let pick;
        if (need > 0) { const win = rest.filter(c => sum(c) > need + 8).sort((a, b) => sum(a) - sum(b)); pick = win[0] || rest.slice().sort((a, b) => sum(a) - sum(b))[0]; }
        else pick = rest.slice().sort((a, b) => sum(b) - sum(a))[0];
        out.push(pick); rest.splice(rest.indexOf(pick), 1);
      }
      return out;
    };
    const orderScore = (ctx, pid, seq) => { const seqs = foeSeqs(ctx, pid); return seq.reduce((t, c, i) => { const need = Math.max(0, ...seqs.map(q => q[i] ? sum(q[i]) : 0)); return t + (need > 0 ? sigm((sum(c) - need) / 30) * 80 : sum(c) * (seq.length - i) / seq.length / 3); }, 0); };
    const sigm = x => 1 / (1 + Math.exp(-x));
    const avgSum = l => l.length ? l.reduce((t, c) => t + sum(c), 0) / l.length : 0;
    // melhor atributo do bot considerando as cartas de rivais que ele lembra (senão, percentil)
    const bestVs = (ctx, pid, list) => { let b = null, bp = -1; const e = ctx.entry(pid); list.forEach(a => { const w = ctx.pWin(pid, a); const sc = w.known ? w.P : api.pct(a, e.stats[a]); if (sc > bp) { bp = sc; b = a; } }); return { a: b, p: bp }; };
    // quanto um rival que conheço perde se só puder usar certos atributos (controle de tipo)
    const forceGain = (ctx, pid, k, tipo) => {
      let best = null, bg = 0;
      ctx.opps(pid).forEach(o => { const c = ctx.foe(pid, o); if (!c) return; const st = CARDS[c].stats, allowed = AID.filter(a => k === 'force' ? ATTR[a].tipo === tipo : ATTR[a].tipo !== tipo);
        const g = Math.max(...AID.map(a => st[a])) - Math.max(...allowed.map(a => st[a])); if (g > bg) { bg = g; best = o; } });
      return { t: best, g: bg };
    };
    const maxType = (e, tipo) => AID.filter(a => ATTR[a].tipo === tipo).reduce((m, a) => Math.max(m, e.stats[a]), 0);

    // ================================================================ controle do confronto e do atributo (fase ctrl)
    D('AE-021', 'Controle', {
      phase: 'ctrl',
      async apply(ctx, act) {
        const a = await ctx.askAttr(act.pid, { title: 'Atributo universal: todos disputam em qual?', hint: 'Você, inclusive. As cartas estão fechadas: a escolha é às cegas.', options: AID }, () => bestVs(ctx, act.pid, AID).a);
        const ctl = ctx.combat.ctl; if (ctl.universal) return ctx.say('Já há um atributo universal: este efeito é ignorado (vale o primeiro).');
        ctl.universal = a; ctx.say(`Todos disputam em ${ATTR[a].nome}.`);
      },
      ai(ctx, pid) { return ctrlU(bestVs(ctx, pid, AID).p); },
    });
    [['AE-022', 0], ['AE-023', 1]].forEach(([id, par]) => D(id, 'Controle', {
      phase: 'ctrl',
      apply(ctx, act) { const ctl = ctx.combat.ctl; if (ctl.pair != null) return ctx.say('O par já foi imposto: este efeito é ignorado (vale o primeiro).'); ctl.pair = par; ctx.say(`Todos usam o par ${AID.filter(a => ATTR[a].par === par).map(a => ATTR[a].nome).join('/')}.`); },
      ai(ctx, pid) { const mine = AID.filter(a => ATTR[a].par === par), oth = AID.filter(a => ATTR[a].par !== par); const m = bestVs(ctx, pid, mine).p; return m > bestVs(ctx, pid, oth).p ? ctrlU(m) : 0.03; },
    }));
    [['AE-024', 'ataque'], ['AE-025', 'defesa']].forEach(([id, tipo]) => D(id, 'Controle', {
      phase: 'ctrl',
      apply(ctx, act) { const ctl = ctx.combat.ctl; if (ctl.typeAll) return ctx.say('O tipo de atributo já foi imposto: este efeito é ignorado.'); ctl.typeAll = tipo; ctx.say(`Todos devem usar atributo de ${tipo}.`); },
      ai(ctx, pid) { const mine = AID.filter(a => ATTR[a].tipo === tipo), oth = AID.filter(a => ATTR[a].tipo !== tipo); const m = bestVs(ctx, pid, mine).p; return m > bestVs(ctx, pid, oth).p ? ctrlU(m) : 0.03; },
    }));
    [['AE-026', 'force', 'ataque'], ['AE-027', 'force', 'defesa'], ['AE-028', 'ban', 'ataque'], ['AE-029', 'ban', 'defesa']].forEach(([id, k, tipo]) => D(id, 'Controle', {
      phase: 'ctrl',
      async apply(ctx, act) {
        const t = await ctx.target(act.pid, ctx.opps(act.pid), k === 'force' ? `Quem será obrigado a usar ${tipo}?` : `Quem fica proibido de usar ${tipo}?`, c => forceGain(ctx, act.pid, k, tipo).t ?? c[0]); if (t == null) return;
        const per = ctx.combat.ctl.per[t] || (ctx.combat.ctl.per[t] = {}); per[k] = tipo;
        ctx.say(k === 'force' ? `${nm(ctx, t)} deve usar atributo de ${tipo}.` : `${nm(ctx, t)} não pode usar atributo de ${tipo}.`);
      },
      // só vale com a carta do rival na memória: força o tipo em que ele é mais fraco
      ai(ctx, pid) { const g = forceGain(ctx, pid, k, tipo).g; return g >= 30 ? 0.85 : g >= 15 ? 0.55 : g >= 5 ? 0.25 : 0.1; }, val: 0.7,
    }));
    D('AE-030', 'Controle', {
      phase: 'ctrl',
      async apply(ctx, act) {
        const t = await ctx.target(act.pid, ctx.opps(act.pid), 'De quem você escolherá o atributo?', c => c.find(o => ctx.foe(act.pid, o)) ?? c[0]); if (t == null) return;
        const per = ctx.combat.ctl.per[t] || (ctx.combat.ctl.per[t] = {}); per.chooser = act.pid; ctx.say(`${nm(ctx, act.pid)} vai escolher o atributo de ${nm(ctx, t)}.`);
      },
      ai(ctx, pid) { const k = ctx.opps(pid).some(o => ctx.foe(pid, o)); return k ? 0.8 : 0.3; }, val: 0.8,
    });

    // ================================================================ roubo do baralho ativo / reserva (vizinhos)
    function nb(id, dir, zone, sel, n) {
      const side = (ctx, pid) => dir === 'R' ? ctx.right(pid) : ctx.left(pid);
      D(id, 'Roubo', {
        can(ctx, pid) { const t = side(ctx, pid); return t != null && ctx.player(t)[zone].length > 0; },
        async apply(ctx, act) {
          let t = side(ctx, act.pid); if (t == null || !ctx.player(t)[zone].length) return ctx.say('Sem alvo: nada a tomar.');
          t = await ctx.hit(act.pid, t); if (t == null) return;
          const got = await ctx.take(act.pid, t, zone, sel, { n }); if (got.length) ctx.say(`${nm(ctx, act.pid)} toma ${got.length === 1 ? '1 carta' : got.length + ' cartas'} de ${nm(ctx, t)}.`);
        },
        ai(ctx, pid) { const t = side(ctx, pid); if (t == null || !ctx.player(t)[zone].length) return 0; return Math.max(0.3, (zone === 'deck' ? 0.8 : 0.62) - 0.1 * ctx.player(t).prepared.length); },
      });
    }
    const rnd = n => (l, r) => { const idx = [...l.keys()]; for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; } return idx.slice(0, n); };
    nb('AE-031', 'R', 'deck', top, 1); nb('AE-032', 'L', 'deck', top, 1);
    nb('AE-033', 'R', 'deck', rnd(1), 1); nb('AE-034', 'L', 'deck', rnd(1), 1);
    nb('AE-042', 'L', 'reserve', last, 1); nb('AE-043', 'R', 'reserve', top, 1); nb('AE-044', 'L', 'reserve', top, 1);
    nb('AE-045', 'R', 'reserve', rnd(2), 2); nb('AE-046', 'L', 'reserve', rnd(2), 2);

    D('AE-036', 'Roubo', {
      minOpps: 2,
      can(ctx, pid) { return ctx.opps(pid).filter(o => hasDeck(ctx, o)).length >= 2; },
      async apply(ctx, act) {
        const cand = ctx.opps(act.pid).filter(o => hasDeck(ctx, o)); if (cand.length < 2) return ctx.say('Sem dois adversários distintos: a condição não é atendida.');
        const p1 = await ctx.pick(act.pid, cand, 'Roubar do primeiro adversário…'); const p2 = await ctx.pick(act.pid, cand.filter(x => x !== p1), '…e do segundo adversário');
        for (const t0 of [p1, p2]) { const t = await ctx.hit(act.pid, t0); if (t != null) await ctx.take(act.pid, t, 'deck', rnd(1)); }
        ctx.say(`${nm(ctx, act.pid)} saqueia dois rivais.`);
      },
      ai: () => 0.85,
    });
    function reward(id, when, tipoTxt) {
      D(id, 'Roubo', {
        apply(ctx, act) {
          ctx.say(`${nm(ctx, act.pid)} cobra uma recompensa se vencer ${tipoTxt}.`);
          ctx.combat.onWin.push({ pid: act.pid, when, async run(c2, res) {
            const cand = c2.combat.entries.filter(e => !e.withdrawn && e.pid !== act.pid && !c2.sameTeam(e.pid, act.pid)).map(e => e.pid).filter(o => hasDeck(c2, o)); if (!cand.length) return c2.say('Sem adversário derrotado com baralho: sem recompensa.');
            const t = await c2.target(act.pid, cand, 'Tomar a próxima carta de qual derrotado?'); if (t == null) return;
            const got = await c2.take(act.pid, t, 'deck', top); if (got.length) c2.say(`${nm(c2, act.pid)} recebe a recompensa de ${nm(c2, t)}.`);
          } });
        },
        ai(ctx, pid) { const e = ctx.entry(pid); return ATTR[e.attr].tipo === (when === 'attack' ? 'ataque' : 'defesa') && !ctx.isLosing(pid) ? 0.75 : 0.05; },
      });
    }
    reward('AE-037', 'attack', 'atacando'); reward('AE-038', 'defense', 'defendendo');
    D('AE-039', 'Roubo', {
      can(ctx, pid) { return ctx.opps(pid).some(o => hasDeck(ctx, o)); },
      async apply(ctx, act) {
        const cand = ctx.opps(act.pid).filter(o => hasDeck(ctx, o)); const t = await ctx.target(act.pid, cand, 'Revelar o baralho de quem?'); if (t == null) return;
        const view = ctx.player(t).deck.slice(0, 2); if (!view.length) return;
        const [pick] = await ctx.askCards(act.pid, { title: `Capture 1 carta de ${nm(ctx, t)}`, hint: 'A outra volta ao topo, sem mudar a ordem.', cards: view, min: 1, max: 1 }, () => highest(view, 1));
        const got = await ctx.take(act.pid, t, 'deck', l => [l.indexOf(pick)]); if (got.length) ctx.say(`${nm(ctx, act.pid)} captura ${CARDS[pick].nome}.`);
      },
      ai: () => 0.78,
    });
    D('AE-040', 'Roubo', {
      can(ctx, pid) { return ctx.opps(pid).some(o => ctx.player(o).deck.length >= 4); },
      async apply(ctx, act) {
        const cand = ctx.opps(act.pid).filter(o => ctx.player(o).deck.length >= 4); if (!cand.length) return ctx.say('Nenhum adversário com 4 cartas ativas.');
        const t = await ctx.target(act.pid, cand, 'Apreender de quem?'); if (t == null) return; await ctx.take(act.pid, t, 'deck', rnd(1));
      },
      ai: () => 0.72,
    });
    function each(id, zone, sel, label) {
      D(id, 'Roubo', {
        can(ctx, pid) { return ctx.opps(pid).some(o => ctx.player(o)[zone].length > 0); },
        async apply(ctx, act) {
          const cand = ctx.order().filter(o => o !== act.pid && !ctx.sameTeam(o, act.pid) && ctx.player(o)[zone].length > 0); if (!cand.length) return ctx.say('Ninguém tem cartas nessa zona.');
          for (const t of cand) await ctx.take(act.pid, t, zone, sel, { n: 1 });
          ctx.say(`${nm(ctx, act.pid)} ${label}.`);
        },
        ai: (ctx, pid) => Math.min(0.85, 0.5 + 0.15 * ctx.opps(pid).filter(o => ctx.player(o)[zone].length > 0).length),
      });
    }
    each('AE-047', 'reserve', rnd(1), 'cobra tributo das reservas'); each('AE-048', 'reserve', last, 'toma a última carta de cada reserva');
    D('AE-050', 'Roubo', {
      can(ctx, pid) { return ctx.opps(pid).some(o => ctx.player(o).deck.length <= 3 && ctx.player(o).reserve.length > 0); },
      async apply(ctx, act) {
        const cand = ctx.opps(act.pid).filter(o => ctx.player(o).deck.length <= 3 && ctx.player(o).reserve.length > 0); if (!cand.length) return ctx.say('Nenhum adversário em perigo.');
        const t = await ctx.target(act.pid, cand, 'Tomar a última carta da reserva de quem?'); if (t == null) return; await ctx.take(act.pid, t, 'reserve', last);
      },
      ai: () => 0.7,
    });

    // ================================================================ trocas diretas e circulação
    D('AE-051', 'Troca', {
      can(ctx, pid) { return ctx.player(pid).deck.length >= 1 && ctx.opps(pid).some(o => hasDeck(ctx, o)); },
      async apply(ctx, act) {
        const cand = ctx.opps(act.pid).filter(o => hasDeck(ctx, o)); const t = await ctx.target(act.pid, cand, 'Trocar com o baralho de quem?', c => c.slice().sort((a, b) => avgSum(ctx.player(b).deck) - avgSum(ctx.player(a).deck))[0]); if (t == null) return;
        const mine = ctx.player(act.pid).deck; if (!mine.length) return;
        const [give] = await ctx.askCards(act.pid, { title: `Troca escolhida: qual carta sua vai para ${nm(ctx, t)}?`, hint: 'Você recebe uma carta aleatória do baralho dele.', cards: mine.slice(), min: 1, max: 1 }, () => lowest(mine, 1));
        if (await ctx.blocked(act.pid, t, 'deck', 1, 'swap')) return;
        const tl = ctx.player(t).deck; if (!tl.length) return;
        const got = tl.splice(Math.floor(ctx.rand() * tl.length), 1)[0]; mine.splice(mine.indexOf(give), 1);
        tl.push(give); mine.push(got);
        ctx.say(`${nm(ctx, act.pid)} troca cartas com ${nm(ctx, t)}.`);
        await ctx.emit('steal', { from: t, to: act.pid, card: got }); await ctx.emit('steal', { from: act.pid, to: t, card: give });
      },
      // troco minha pior por uma ao acaso do rival de baralho mais forte (média pública não é conhecida: uso a média geral)
      ai: (ctx, pid) => { const mine = ctx.player(pid).deck; if (!mine.length) return 0; const lo = Math.min(...mine.map(c => sum(c))); const g = MEANSUM - lo; return g >= 70 ? 0.8 : g >= 40 ? 0.55 : g >= 15 ? 0.25 : 0.04; },
    });
    D('AE-052', 'Troca', {
      can(ctx, pid) { return ctx.player(pid).deck.length >= 1 && ctx.entries().some(e => e.pid !== pid); },
      async apply(ctx, act) {
        const cand = ctx.entries().filter(e => e.pid !== act.pid && !ctx.sameTeam(e.pid, act.pid)).map(e => e.pid); const t = await ctx.target(act.pid, cand, 'Tomar a carta de combate de quem?'); if (t == null) return;
        const mine = ctx.player(act.pid).deck; const te = ctx.entry(t); if (!te || te.withdrawn || !mine.length) return ctx.say('Sem troca possível.');
        const c = mine.splice(Math.floor(ctx.rand() * mine.length), 1)[0]; const old = ctx.swapEntryCard(te, c); mine.push(old);
        ctx.say(`${nm(ctx, act.pid)} toma a carta de combate de ${nm(ctx, t)} e lhe entrega outra.`);
        await ctx.emit('combatSwap', { swaps: [{ pid: t, card: c, from: act.pid }] });
      },
      ai: () => 0.4,
    });
    function swapComb(id, dir) {
      const side = (ctx, pid) => dir === 'R' ? ctx.right(pid) : ctx.left(pid);
      D(id, 'Troca', {
        can(ctx, pid) { const t = side(ctx, pid); const e = t != null && ctx.entry(t); return !!e && !e.withdrawn; },
        async apply(ctx, act) {
          let t = side(ctx, act.pid); t = await ctx.hit(act.pid, t); if (t == null) return;
          const e1 = ctx.entry(act.pid), e2 = ctx.entry(t); if (!e1 || !e2 || e2.withdrawn || e1.withdrawn) return;
          const c1 = e1.card, c2 = e2.card; ctx.swapEntryCard(e1, c2); ctx.swapEntryCard(e2, c1);
          ctx.say(`${nm(ctx, act.pid)} troca de combatente com ${nm(ctx, t)}.`);
          await ctx.emit('combatSwap', { swaps: [{ pid: act.pid, card: c2 }, { pid: t, card: c1 }] });
        },
        ai(ctx, pid) { const t = dir === 'R' ? ctx.right(pid) : ctx.left(pid); const e1 = ctx.entry(pid), e2 = t != null && ctx.entry(t); if (!e2) return 0; const d = e2.base[e1.attr] - e1.base[e1.attr]; return d > 0 ? Math.min(0.85, 0.2 + d / 60) : 0.04; },
      });
    }
    swapComb('AE-053', 'R'); swapComb('AE-054', 'L');
    function swapTops(id, dir) {
      const side = (ctx, pid) => dir === 'R' ? ctx.right(pid) : ctx.left(pid);
      D(id, 'Troca', {
        can(ctx, pid) { const t = side(ctx, pid); return t != null && hasDeck(ctx, t) && hasDeck(ctx, pid); },
        async apply(ctx, act) {
          let t = side(ctx, act.pid); if (t == null) return; t = await ctx.hit(act.pid, t); if (t == null) return;
          if (await ctx.blocked(act.pid, t, 'deck', 1, 'swap')) return;
          const a = ctx.player(act.pid).deck, b = ctx.player(t).deck; if (!a.length || !b.length) return ctx.say('Sem cartas para trocar.');
          const x = a[0], y = b[0]; a[0] = y; b[0] = x; ctx.say(`${nm(ctx, act.pid)} troca os topos de baralho com ${nm(ctx, t)}.`);
          await ctx.emit('steal', { from: t, to: act.pid, card: y }); await ctx.emit('steal', { from: act.pid, to: t, card: x });
        },
        // troco o topo do meu baralho pelo do vizinho: vale se o meu é fraco (ou se lembro que o dele é melhor)
        ai(ctx, pid) { const t = side(ctx, pid); if (t == null || !hasDeck(ctx, t) || !hasDeck(ctx, pid)) return 0; const k = ctx.foeNext(pid, t); const mine = sum(ctx.player(pid).deck[0]); const g = k ? sum(k) - mine : 0.5 * (MEANSUM - mine); return g >= 45 ? 0.85 : g >= 25 ? 0.55 : g >= 10 ? 0.25 : 0.03; }, val: 0.6,
      });
    }
    swapTops('AE-055', 'R'); swapTops('AE-056', 'L');
    function pass(id, dir) {
      const side = (ctx, pid) => dir === 'R' ? ctx.ringR(pid) : ctx.ringL(pid);
      D(id, 'Troca', {
        can(ctx, pid) { return ctx.alive().length >= 2 && hasDeck(ctx, pid); },
        async apply(ctx, act) {
          const picks = [];
          for (const pid of ctx.order()) {
            const deck = ctx.player(pid).deck, to = side(ctx, pid); if (!deck.length || to == null) continue;
            const [c] = await ctx.askCards(pid, { title: `Passe 1 carta ao jogador ${dir === 'R' ? 'da direita' : 'da esquerda'} (${nm(ctx, to)})`, hint: 'Todos passam ao mesmo tempo.', cards: deck.slice(), min: 1, max: 1 }, () => lowest(deck, 1));
            picks.push({ from: pid, to, card: c });
          }
          picks.forEach(pk => { const d = ctx.player(pk.from).deck; d.splice(d.indexOf(pk.card), 1); });
          for (const pk of picks) { ctx.player(pk.to).deck.push(pk.card); await ctx.emit('steal', { from: pk.from, to: pk.to, card: pk.card }); }
          ctx.say('Todos passam uma carta.');
        },
        ai: () => 0.2,
      });
    }
    pass('AE-057', 'L'); pass('AE-058', 'R');
    function permReserve(id, dir) {
      const side = (ctx, pid) => dir === 'R' ? ctx.right(pid) : ctx.left(pid);
      D(id, 'Troca', {
        can(ctx, pid) { const t = side(ctx, pid); return t != null && (ctx.player(t).reserve.length > 0 || ctx.player(pid).reserve.length > 0); },
        async apply(ctx, act) {
          let t = side(ctx, act.pid); if (t == null) return; t = await ctx.hit(act.pid, t); if (t == null) return;
          if (await ctx.blocked(act.pid, t, 'reserve', 2, 'swap')) return;
          const a = ctx.player(act.pid), b = ctx.player(t); const r = a.reserve; a.reserve = b.reserve; b.reserve = r;
          ctx.say(`${nm(ctx, act.pid)} permuta as reservas com ${nm(ctx, t)}.`); await ctx.emit('reserveSwap', { a: act.pid, b: t });
        },
        ai(ctx, pid) { const t = dir === 'R' ? ctx.right(pid) : ctx.left(pid); if (t == null) return 0; return ctx.player(t).reserve.length > ctx.player(pid).reserve.length ? 0.55 : 0.05; },
      });
    }
    permReserve('AE-059', 'L'); permReserve('AE-060', 'R');
    function rotateRes(id, dir) {
      D(id, 'Redistribuição', {
        can(ctx) { return ctx.alive().length >= 2; },
        async apply(ctx, act) {
          const al = ctx.order(); const old = {}; al.forEach(pid => { old[pid] = ctx.player(pid).reserve; });
          const nw = {}; al.forEach(pid => { const to = dir === 'R' ? ctx.ringR(pid) : ctx.ringL(pid); nw[to == null ? pid : to] = old[pid]; });
          al.forEach(pid => { ctx.player(pid).reserve = nw[pid] || []; });
          ctx.say(`As reservas giram para a ${dir === 'R' ? 'direita' : 'esquerda'}.`); await ctx.emit('rotate', { dir, list: al.map(pid => ({ from: pid, to: dir === 'R' ? ctx.ringR(pid) : ctx.ringL(pid) })) });
        },
        // a reserva que chego a receber (do vizinho que passa para mim) contra a que entrego
        ai(ctx, pid) { const from = dir === 'R' ? ctx.ringL(pid) : ctx.ringR(pid); if (from == null) return 0; const g = ctx.player(from).reserve.length - ctx.player(pid).reserve.length; return g >= 3 ? 0.75 : g >= 2 ? 0.5 : g >= 1 ? 0.25 : 0.03; }, val: 0.5,
      });
    }
    rotateRes('AE-061', 'R'); rotateRes('AE-062', 'L');
    D('AE-063', 'Redistribuição', {
      // [PROPOSTA] "carta ativa escolhida": quem usa escolhe, às cegas (pela posição no baralho ativo), 1 carta de cada vizinho; as duas trocam de dono.
      // Quem lembra o que há nos baralhos (memória do bot) tira uma carta forte do líder e entrega uma fraca; sem memória, a escolha é ao acaso.
      async apply(ctx, act) {
        const L = ctx.left(act.pid), R = ctx.right(act.pid);
        if (L == null || R == null || L === R) return ctx.say('Em duelo a troca não produz ganho líquido: o especial é gasto.');
        const dl = ctx.player(L).deck, dr = ctx.player(R).deck; if (!dl.length || !dr.length) return ctx.say('Um dos vizinhos não tem cartas ativas.');
        const tot = q => ctx.g.totalCards(ctx.player(q)); const strongL = tot(L) >= tot(R);
        const kL = ctx.mem(act.pid, L).slice(), kR = ctx.mem(act.pid, R).slice();
        const choose = (k, deck, strong) => () => { const kn = k.filter(c => deck.includes(c)); if (kn.length) return [strong ? highest(kn, 1)[0] : lowest(kn, 1)[0]]; return [deck[Math.floor(ctx.rand() * deck.length)]]; };
        const [cl] = await ctx.askCards(act.pid, { title: `Troca entre vizinhos: escolha 1 carta do baralho de ${nm(ctx, L)}`, hint: 'Estão viradas para baixo: escolha pela posição.', cards: dl.slice(), blind: true, min: 1, max: 1 }, choose(kL, dl, strongL));
        const [cr] = await ctx.askCards(act.pid, { title: `Troca entre vizinhos: escolha 1 carta do baralho de ${nm(ctx, R)}`, hint: 'Estão viradas para baixo: escolha pela posição.', cards: dr.slice(), blind: true, min: 1, max: 1 }, choose(kR, dr, !strongL));
        dl.splice(dl.indexOf(cl), 1); dr.splice(dr.indexOf(cr), 1); dr.push(cl); dl.push(cr);
        ctx.say(`${nm(ctx, act.pid)} faz ${nm(ctx, L)} e ${nm(ctx, R)} trocarem cartas.`); await ctx.emit('steal', { from: L, to: R, card: cl }); await ctx.emit('steal', { from: R, to: L, card: cr });
        ctx.learn(act.pid, L, kL.filter(c => c !== cl)); ctx.learn(act.pid, R, kR.filter(c => c !== cr));   // quem escolheu sabe o que mudou de lugar
      },
      ai(ctx, pid) {
        const L = ctx.left(pid), R = ctx.right(pid); if (L == null || R == null || L === R) return 0.02;
        const tot = q => ctx.g.totalCards(ctx.player(q)); const strongL = tot(L) >= tot(R), S = strongL ? L : R, W = strongL ? R : L;
        if (Math.abs(tot(L) - tot(R)) < 2) return 0.04;
        const kS = ctx.mem(pid, S), kW = ctx.mem(pid, W); if (!kS.length && !kW.length) return 0.04;
        const best = kS.length ? Math.max(...kS.map(sum)) : MEANSUM, worst = kW.length ? Math.min(...kW.map(sum)) : MEANSUM, g = best - worst;
        return g >= 70 ? 0.8 : g >= 45 ? 0.55 : g >= 25 ? 0.3 : 0.04;
      },
      prep: 0.3, val: 0.4,
    });
    D('AE-064', 'Redistribuição', {
      async apply(ctx, act) {
        const L = ctx.left(act.pid), R = ctx.right(act.pid); if (L == null || R == null || L === R) return ctx.say('Em duelo a carta volta ao mesmo rival: sem vantagem. O especial é gasto.');
        const t = await ctx.hit(act.pid, L); if (t == null) return; if (await ctx.blocked(act.pid, t, 'reserve', 1, 'swap')) return;
        const rl = ctx.player(t).reserve; if (!rl.length) return ctx.say('Reserva vazia.');
        const c = rl.splice(Math.floor(ctx.rand() * rl.length), 1)[0]; ctx.player(R).reserve.push(c);
        ctx.say(`${nm(ctx, act.pid)} move uma carta da reserva de ${nm(ctx, t)} para a de ${nm(ctx, R)}.`); await ctx.emit('steal', { from: t, to: R, card: c, zone: 'reserve', dzone: 'reserve' });
      },
      // só em 3+: tira da reserva do líder (à esquerda) e dá a quem está atrás de mim (à direita)
      ai(ctx, pid) { const L = ctx.left(pid), R = ctx.right(pid); if (L == null || R == null || L === R) return 0.02; const tot = q => ctx.g.totalCards(ctx.player(q)); return tot(L) >= tot(pid) + 2 && tot(R) < tot(pid) && ctx.player(L).reserve.length ? 0.5 : 0.03; }, prep: 0.25, val: 0.4,
    });
    D('AE-065', 'Redistribuição', {
      async apply(ctx, act) {
        const L = ctx.left(act.pid), R = ctx.right(act.pid); if (L == null || R == null || L === R) return ctx.say('Em duelo a transferência não gera ganho líquido. O especial é gasto.');
        const t = await ctx.hit(act.pid, L); if (t == null) return; if (await ctx.blocked(act.pid, t, 'deck', 3, 'swap')) return;
        const dl = ctx.player(t).deck; for (let n = 0; n < 3 && dl.length; n++) { const c = dl.splice(Math.floor(ctx.rand() * dl.length), 1)[0]; ctx.player(R).deck.push(c); await ctx.emit('steal', { from: t, to: R, card: c }); }
        ctx.say(`${nm(ctx, act.pid)} transfere cartas de ${nm(ctx, t)} para ${nm(ctx, R)}.`);
      },
      ai(ctx, pid) { const L = ctx.left(pid), R = ctx.right(pid); if (L == null || R == null || L === R) return 0.02; const tot = q => ctx.g.totalCards(ctx.player(q)); return tot(L) >= tot(pid) + 3 && tot(R) < tot(pid) ? 0.6 : 0.03; }, prep: 0.25, val: 0.5,
    });
    D('AE-067', 'Redistribuição', {
      can(ctx, pid) { return ctx.opps(pid).some(o => hasDeck(ctx, o)); },
      async apply(ctx, act) {
        for (const o of ctx.order()) { if (o === act.pid || ctx.sameTeam(o, act.pid)) continue; const p = ctx.player(o); if (!p.deck.length) continue; const [c] = p.deck.splice(Math.floor(ctx.rand() * p.deck.length), 1); ctx.toBH(c, 'normal'); await ctx.emit('discard', { pid: o, card: c }); }
        ctx.say('Cada adversário descarta uma carta ao Buraco Negro.');
      },
      ai: (ctx, pid) => Math.min(0.8, 0.35 + 0.15 * ctx.opps(pid).length),
    });
    const strong = id => Math.max(...AID.map(a => CARDS[id].stats[a])) > 90;
    D('AE-068', 'Redistribuição', {
      can(ctx, pid) { return ctx.player(pid).deck.some(strong) && ctx.opps(pid).some(o => hasDeck(ctx, o)); },
      async apply(ctx, act) {
        const p = ctx.player(act.pid), el = p.deck.filter(strong); if (!el.length) return ctx.say('Sem carta com atributo acima de 90 para sacrificar.');
        const [c] = await ctx.askCards(act.pid, { title: 'Sacrifique uma carta com algum atributo acima de 90', hint: 'Ela vai ao Buraco Negro; em troca você toma 1 carta aleatória de cada adversário.', cards: el, min: 1, max: 1 }, () => lowest(el, 1));
        p.deck.splice(p.deck.indexOf(c), 1); ctx.toBH(c, 'normal'); await ctx.emit('discard', { pid: act.pid, card: c });
        for (const o of ctx.order()) { if (o !== act.pid && !ctx.sameTeam(o, act.pid) && hasDeck(ctx, o)) await ctx.take(act.pid, o, 'deck', rnd(1)); }
        ctx.say(`${nm(ctx, act.pid)} cobra tributo por sacrifício.`);
      },
      ai: (ctx, pid) => ctx.opps(pid).filter(o => hasDeck(ctx, o)).length >= 2 ? 0.5 : 0.1,
    });
    D('AE-069', 'Redistribuição', {
      can(ctx, pid) { return ctx.opps(pid).some(o => hasDeck(ctx, o)); },
      async apply(ctx, act) {
        const cand = ctx.opps(act.pid).filter(o => hasDeck(ctx, o)); const t = await ctx.target(act.pid, cand, 'Quem deve entregar uma carta?'); if (t == null) return;
        const d = ctx.player(t).deck; if (!d.length) return;
        const [c] = await ctx.askCards(t, { title: `Entregue 1 carta a ${nm(ctx, act.pid)}`, hint: 'Um especial obriga você a dar uma carta do baralho ativo.', cards: d.slice(), min: 1, max: 1 }, () => lowest(d, 1));
        d.splice(d.indexOf(c), 1); ctx.player(act.pid).deck.push(c); ctx.say(`${nm(ctx, t)} entrega uma carta a ${nm(ctx, act.pid)}.`); await ctx.emit('steal', { from: t, to: act.pid, card: c });
      },
      ai: () => 0.68,
    });
    D('AE-070', 'Redistribuição', {
      apply(ctx, act) {
        const e = ctx.entry(act.pid); e.compCapture = true; ctx.say(`${nm(ctx, act.pid)} prepara uma conquista compensada.`);
        ctx.combat.onWin.push({ pid: act.pid, when: 'any', async run(c2) {
          const inv = c2.combat.entries.filter(x => x.pid !== act.pid && !x.gone && !c2.sameTeam(x.pid, act.pid)).map(x => x.pid);
          for (const o of inv) {
            const d = c2.player(act.pid).deck; if (!d.length) break;
            const [c] = await c2.askCards(act.pid, { title: `Conquista compensada: entregue 1 carta a ${nm(c2, o)}`, cards: d.slice(), min: 1, max: 1 }, () => lowest(d, 1));
            d.splice(d.indexOf(c), 1); c2.player(o).deck.push(c); await c2.emit('steal', { from: act.pid, to: o, card: c });
          }
          c2.say(`${nm(c2, act.pid)} paga a compensação.`);
        } });
      },
      ai(ctx, pid) { return !ctx.isLosing(pid) && ctx.opps(pid).length >= 2 ? 0.4 : 0.05; }, prep: 0.5,
    });

    // ================================================================ defesas, bloqueios e salvamentos
    D('AE-073', 'Defesa', {
      phase: 'pre',
      async apply(ctx, act) {
        let n = 0; for (const a of ctx.activations) if (a.pid !== act.pid && !ctx.sameTeam(a.pid, act.pid) && !a.done && !a.cancelled && a !== act) { if (await ctx.cancelAct(a, act.pid)) n++; }
        ctx.say(n ? `${nm(ctx, act.pid)} faz silêncio: ${n === 1 ? '1 especial anulado' : n + ' especiais anulados'}.` : 'Silêncio sem efeito: nenhum especial adversário pendente.');
      },
      ai(ctx, pid) { return 0.05 + 0.75 * oppFlip(ctx, pid); },
    });
    D('AE-074', 'Defesa', { phase: 'guard', apply(ctx, act) { ctx.def(act.pid).immune++; ctx.say(`${nm(ctx, act.pid)} fica imune ao próximo efeito direcionado.`); }, ai(ctx, pid) { return ORR(seenCat(ctx, pid, ['Roubo', 'Redistribuição', 'Troca', 'Buraco Negro', 'Captura', 'Controle'], 0.6, 0.05), () => 0.08 + 0.45 * oppFlip(ctx, pid)); } });
    D('AE-075', 'Defesa', {
      async apply(ctx, act) {
        const cand = ctx.entries().filter(e => e.pid !== act.pid && !ctx.sameTeam(e.pid, act.pid)).map(e => e.pid); if (!cand.length) return;
        const t = await ctx.pick(act.pid, cand, 'Quem não poderá capturar a sua carta?', c => { const w = winnerOf(ctx); return w && c.includes(w.pid) ? w.pid : richest(ctx, c); }); ctx.entry(act.pid).noCaptureBy.add(t); ctx.say(`${nm(ctx, t)} não poderá capturar a carta de ${nm(ctx, act.pid)}.`);
      },
      ai(ctx, pid) { const w = winnerOf(ctx); return w && w.pid !== pid && !ctx.sameTeam(w.pid, pid) && ATTR[w.attr].tipo === 'ataque' ? 0.7 : 0.04; },
    });
    D('AE-076', 'Defesa', { phase: 'guard', apply(ctx, act) { ctx.def(act.pid).guardDeck++; ctx.say(`${nm(ctx, act.pid)} guarda o baralho.`); }, ai(ctx, pid) { return ORR(seenCat(ctx, pid, ['Roubo', 'Redistribuição'], 0.7, 0.04), () => 0.05 + 0.4 * oppFlip(ctx, pid)); } });
    D('AE-077', 'Defesa', { phase: 'guard', apply(ctx, act) { ctx.def(act.pid).guardRes++; ctx.say(`${nm(ctx, act.pid)} guarda a reserva.`); }, ai(ctx, pid) { return ORR(seenCat(ctx, pid, ['Roubo', 'Redistribuição'], 0.65, 0.04), () => 0.05 + 0.4 * oppFlip(ctx, pid)); } });
    D('AE-078', 'Defesa', { phase: 'guard', apply(ctx, act) { ctx.def(act.pid).reflect++; ctx.say(`${nm(ctx, act.pid)} prepara um reflexo de roubo.`); }, ai(ctx, pid) { return ORR(seenCat(ctx, pid, ['Roubo'], 0.7, 0.04), () => 0.05 + 0.4 * oppFlip(ctx, pid)); } });
    D('AE-079', 'Defesa', { phase: 'guard', apply(ctx, act) { ctx.entry(act.pid).noBHBySpecial = true; ctx.say(`${nm(ctx, act.pid)} protege o combatente do Buraco Negro.`); }, ai(ctx, pid) { return ORR(seenCat(ctx, pid, ['Buraco Negro'], 0.7, 0.04), () => 0.04 + 0.3 * oppFlip(ctx, pid)); } });
    D('AE-080', 'Defesa', {
      phase: 'late', prep: 0.2,
      apply(ctx, act) {
        const e = ctx.entry(act.pid); const val = x => x.stats[x.attr] + x.bonus; const cur = val(e); let best = null, bd = 0;
        e.mods.forEach(m => { if (m.off) return; m.off = true; ctx.recalc(e); const d = val(e) - cur; m.off = false; if (d > bd) { bd = d; best = m; } });
        if (best) { best.off = true; ctx.say(`${nm(ctx, act.pid)} anula uma redução numérica (+${bd}).`); } else ctx.say('Nenhuma redução numérica a anular.');
        ctx.recalc(e);
      },
      // seguro: vale quando estou ganhando e um rival pode virar algo que me reduza
      ai(ctx, pid) { return ctx.isLosing(pid) ? 0.03 : 0.05 + 0.4 * oppFlip(ctx, pid); }, val: 0.3,
    });

    // ================================================================ Buraco Negro
    const bhU = (ctx, d) => Math.min(0.85, 0.3 + 0.15 * ctx.bhNormal().length + (d || 0));
    const strongBase = id => Math.max(...AID.map(a => CARDS[id].stats[a])) > 90;
    D('AE-081', 'Buraco Negro', {
      can(ctx, pid) { return ctx.player(pid).deck.some(strongBase) && ctx.bhNormal().length > 0; },
      async apply(ctx, act) {
        const p = ctx.player(act.pid), el = p.deck.filter(strongBase); if (!el.length) return ctx.say('Sem carta com atributo original acima de 90.');
        const take = ctx.bhNormal().slice(0, 3);
        const [c] = await ctx.askCards(act.pid, { title: 'Sacrifique uma carta com atributo acima de 90', hint: 'Em troca você recebe as 3 primeiras cartas (normais) do Buraco Negro.', cards: el, min: 1, max: 1 }, () => lowest(el, 1));
        p.deck.splice(p.deck.indexOf(c), 1); ctx.toBH(c, 'normal'); await ctx.emit('discard', { pid: act.pid, card: c });
        for (const t of take) { ctx.fromBH(t); p.deck.push(t); await ctx.emit('rescue', { pid: act.pid, card: t }); }
        ctx.say(`${nm(ctx, act.pid)} faz um resgate extremo.`);
      },
      ai(ctx, pid, c) { const l = ctx.bhNormal(), el = ctx.player(pid).deck.filter(strongBase); if (l.length < 3 || !el.length) return 0.04; return gainU(l.slice(0, 3).reduce((t, x) => t + sum(x), 0) - sum(lowest(el, 1)[0]) - costC(c)); },
    });
    D('AE-084', 'Buraco Negro', {
      can(ctx) { return ctx.bhNormal().length > 0; },
      async apply(ctx, act) { const l = ctx.bhNormal(); if (!l.length) return; const c = l[0]; ctx.fromBH(c); ctx.player(act.pid).deck.push(c); ctx.say(`${nm(ctx, act.pid)} resgata ${CARDS[c].nome}.`); await ctx.emit('rescue', { pid: act.pid, card: c }); },
      ai(ctx, pid, c) { const l = ctx.bhNormal(); return l.length ? gainU(sum(l[0]) - costC(c)) : 0; },
    });
    D('AE-085', 'Buraco Negro', {
      can(ctx) { return ctx.bhNormal().length > 0; },
      async apply(ctx, act) {
        const l = ctx.bhNormal(); if (!l.length) return;
        const [c] = await ctx.askCards(act.pid, { title: 'Resgate escolhido: qual carta recuperar?', hint: 'Cartas normais do Buraco Negro.', cards: l, min: 1, max: 1 }, () => highest(l, 1));
        ctx.fromBH(c); ctx.player(act.pid).deck.push(c); ctx.say(`${nm(ctx, act.pid)} resgata ${CARDS[c].nome}.`); await ctx.emit('rescue', { pid: act.pid, card: c });
      },
      ai(ctx, pid, c) { const l = ctx.bhNormal(); return l.length ? gainU(Math.max(...l.map(sum)) - costC(c)) : 0; },
    });
    D('AE-087', 'Buraco Negro', {
      can(ctx) { return ctx.bhAll().length > 0; },
      async apply(ctx, act) {
        for (let n = 0; n < 2; n++) { const l = ctx.bhAll(); if (!l.length) break; const r = l[Math.floor(ctx.rand() * l.length)]; ctx.fromBH(r); ctx.player(act.pid).reserve.push(r); await ctx.emit('rescue', { pid: act.pid, card: r, dzone: 'reserve' }); }
        ctx.say(`${nm(ctx, act.pid)} reabastece a reserva.`);
      },
      ai: ctx => (ctx.bhAll().length >= 2 ? 0.55 : 0.2),
    });
    D('AE-088', 'Buraco Negro', {
      can(ctx) { return ctx.bhNormal().length > 0; },
      async apply(ctx, act) { const l = ctx.bhNormal(); if (!l.length) return; const r = l[Math.floor(ctx.rand() * l.length)]; ctx.fromBH(r); ctx.player(act.pid).deck.push(r); ctx.say(`${nm(ctx, act.pid)} recupera uma carta.`); await ctx.emit('rescue', { pid: act.pid, card: r }); },
      ai: ctx => bhU(ctx, 0.05),
    });
    D('AE-089', 'Buraco Negro', {
      can(ctx, pid) { return ctx.player(pid).deck.length >= 2 && ctx.bhNormal().length > 0; },
      async apply(ctx, act) {
        const p = ctx.player(act.pid); if (!p.deck.length) return;
        const cs = await ctx.askCards(act.pid, { title: 'Sacrifício por três: escolha 1 carta para o Buraco Negro', hint: 'Você recupera até 3 cartas normais aleatórias de lá.', cards: p.deck.slice(), min: 1, max: 1 }, () => lowest(p.deck, 1));
        for (const c of cs) { p.deck.splice(p.deck.indexOf(c), 1); ctx.toBH(c, 'normal'); await ctx.emit('discard', { pid: act.pid, card: c }); }
        for (let k = 0; k < 3; k++) { const l = ctx.bhNormal().filter(x => !cs.includes(x)); if (!l.length) break; const r = l[Math.floor(ctx.rand() * l.length)]; ctx.fromBH(r); p.deck.push(r); await ctx.emit('rescue', { pid: act.pid, card: r }); }
        ctx.say(`${nm(ctx, act.pid)} sacrifica uma carta e recupera outras do Buraco Negro.`);
      },
      ai(ctx, pid, c) { const l = ctx.bhNormal(), d = ctx.player(pid).deck; if (l.length < 2 || d.length < 2) return 0.04; return gainU(Math.min(3, l.length) * avgSum(l) - lowest(d, 1).reduce((t, x) => t + sum(x), 0) - costC(c)); },
    });

    // ================================================================ informação e manipulação de ordem
    D('AE-091', 'Informação', {
      can(ctx, pid) { return ctx.opps(pid).some(o => hasDeck(ctx, o)); },
      async apply(ctx, act) {
        const cand = ctx.opps(act.pid).filter(o => hasDeck(ctx, o)); const t = await ctx.target(act.pid, cand, 'Quem revela a ordem do baralho?', c => c.find(o => ctx.mem(act.pid, o).length < 2) ?? c[0]); if (t == null) return;
        await ctx.emit('peek', { pid: act.pid, target: t, cards: ctx.player(t).deck.slice(), title: 'Mão revelada', hint: `Ordem do baralho de ${nm(ctx, t)} (topo → fundo).` }); ctx.learn(act.pid, t, ctx.player(t).deck.slice()); ctx.say(`${nm(ctx, t)} revela a ordem do baralho a ${nm(ctx, act.pid)}.`);
      },
      ai: (ctx, pid) => ctx.opps(pid).some(o => ctx.player(o).deck.length > 0 && ctx.mem(pid, o).length < 2) ? 0.55 : 0.05, prep: 0.4, val: 1.0, want: needMem,
    });
    D('AE-092', 'Informação', {
      can(ctx, pid) { return ctx.player(pid).deck.length >= 2; },
      async apply(ctx, act) {
        const p = ctx.player(act.pid); const n = Math.min(3, p.deck.length); const v = p.deck.slice(0, n);
        const o = await ctx.askCards(act.pid, { title: 'Ordene as próximas cartas (1ª = topo)', hint: 'Toque nas cartas na ordem em que quer que entrem em disputa.', cards: v, min: n, max: n, ordered: true }, () => orderVs(ctx, act.pid, v));
        p.deck.splice(0, n, ...o); ctx.say(`${nm(ctx, act.pid)} reordena as próximas cartas.`); await ctx.emit('reorder', { pid: act.pid });
      },
      ai(ctx, pid) { const v = ctx.player(pid).deck.slice(0, 3); if (v.length < 2) return 0; if (foeSeqs(ctx, pid).some(q => q.length)) return 0.6; const sp = Math.max(...v.map(sum)) - Math.min(...v.map(sum)); return sp >= 60 ? 0.3 : 0.1; }, prep: 0.5, val: 0.8,
    });
    D('AE-094', 'Informação', {
      can(ctx, pid) { return ctx.player(pid).deck.length >= 2; },
      async apply(ctx, act) { const p = ctx.player(act.pid); const n = Math.min(3, p.deck.length); p.deck.splice(0, n, ...p.deck.slice(0, n).reverse()); ctx.say(`${nm(ctx, act.pid)} inverte a fila das próximas ${n} cartas.`); await ctx.emit('reorder', { pid: act.pid }); },
      ai(ctx, pid) { const v = ctx.player(pid).deck.slice(0, 3); if (v.length < 2) return 0; const g = orderScore(ctx, pid, v.slice().reverse()) - orderScore(ctx, pid, v); return g >= 40 ? 0.7 : g >= 20 ? 0.4 : 0.04; }, prep: 0.4, val: 0.5,
    });
    D('AE-096', 'Informação', {
      can(ctx, pid) { return ctx.opps(pid).some(o => ctx.player(o).deck.length + ctx.player(o).reserve.length > 0); },
      async apply(ctx, act) {
        const cand = ctx.opps(act.pid).filter(o => ctx.player(o).deck.length + ctx.player(o).reserve.length > 0); const t = await ctx.target(act.pid, cand, 'Quebrar o plano de quem?', c => c.slice().sort((a, b) => ctx.player(b).deck.length - ctx.player(a).deck.length)[0]); if (t == null) return;
        const p = ctx.player(t); const all = api.shuffle(p.deck.concat(p.reserve), () => ctx.rand()); p.deck = all.slice(0, 5); p.reserve = all.slice(5);
        ctx.say(`${nm(ctx, act.pid)} embaralha baralho e reserva de ${nm(ctx, t)}; só 5 cartas ficam ativas.`); await ctx.emit('reorder', { pid: t });
      },
      // quem tem baralho grande perde a vantagem: só 5 cartas ficam ativas, o resto vai à reserva
      val: 0.9, ai(ctx, pid) { const n = Math.max(0, ...ctx.opps(pid).map(o => ctx.player(o).deck.length)); return n >= 9 ? 0.85 : n >= 7 ? 0.55 : n >= 6 ? 0.25 : 0.04; },
    });
    D('AE-097', 'Informação', {
      can(ctx, pid) { return ctx.player(pid).reserve.length > 0; },
      async apply(ctx, act) {
        const p = ctx.player(act.pid); if (!p.reserve.length) return;
        const o = await ctx.askCards(act.pid, { title: 'Escolha até 7 cartas da reserva (a ordem escolhida será a do topo do baralho)', cards: p.reserve.slice(), min: 0, max: 7, ordered: true }, () => highest(p.reserve, Math.min(7, p.reserve.length)));
        o.forEach(c => p.reserve.splice(p.reserve.indexOf(c), 1)); p.deck.unshift(...o);
        ctx.say(`${nm(ctx, act.pid)} traz ${o.length === 1 ? '1 carta' : o.length + ' cartas'} da reserva ao topo.`); await ctx.emit('reorder', { pid: act.pid });
      },
      ai(ctx, pid) { const p = ctx.player(pid); if (p.deck.length <= 2) return 0.6; const top = highest(p.reserve, 7); return avgSum(top) > avgSum(p.deck) + 20 ? 0.4 : 0.06; }, prep: 0.5, val: 0.5,
    });
    D('AE-098', 'Informação', {
      can(ctx, pid) { return ctx.player(pid).reserve.length >= 2; },
      async apply(ctx, act) {
        const p = ctx.player(act.pid); const n = Math.min(4, p.reserve.length); const v = p.reserve.slice(0, n);
        const o = await ctx.askCards(act.pid, { title: 'Reorganize as primeiras cartas da reserva', hint: 'A 1ª será a primeira a entrar no baralho.', cards: v, min: n, max: n, ordered: true }, () => highest(v, n));
        p.reserve.splice(0, n, ...o); ctx.say(`${nm(ctx, act.pid)} organiza a reserva.`); await ctx.emit('reorder', { pid: act.pid });
      },
      ai(ctx, pid) { const p = ctx.player(pid); return p.reserve.length >= 4 && p.deck.length <= 3 ? 0.3 : 0.04; }, prep: 0.4, val: 0.15,
    });
    D('AE-099', 'Informação', {
      can(ctx, pid) { return ctx.player(pid).reserve.length > 0; },
      async apply(ctx, act) { const p = ctx.player(act.pid); if (!p.reserve.length) return; p.deck.push(p.reserve.shift()); ctx.say(`${nm(ctx, act.pid)} reforça o fim do baralho.`); await ctx.emit('reorder', { pid: act.pid }); },
      ai(ctx, pid) { const p = ctx.player(pid); return p.deck.length <= 3 && p.reserve.length && sum(p.reserve[0]) > avgSum(p.deck) + 15 ? 0.4 : 0.05; }, prep: 0.5, val: 0.15,
    });
    D('AE-100', 'Informação', {
      can(ctx, pid) { return ctx.opps(pid).some(o => ctx.player(o).deck.length >= 2); },
      async apply(ctx, act) {
        const cand = ctx.opps(act.pid).filter(o => ctx.player(o).deck.length >= 2); if (!cand.length) return;
        const t = await ctx.target(act.pid, cand, 'Confundir o próximo turno de quem?'); if (t == null) return;
        const d = ctx.player(t).deck; const v = d.slice(0, 3); if (!v.length) return;
        const [c] = await ctx.askCards(act.pid, { title: `Qual carta de ${nm(ctx, t)} ficará no topo?`, hint: 'As demais mantêm a ordem relativa.', cards: v, min: 1, max: 1 }, () => lowest(v, 1));
        d.splice(d.indexOf(c), 1); d.unshift(c); ctx.say(`${nm(ctx, act.pid)} confunde o próximo turno de ${nm(ctx, t)}.`); await ctx.emit('reorder', { pid: t }); ctx.learn(act.pid, t, d.slice());
      },
      // vejo as 3 próximas dele e deixo a pior no topo: depois sei exatamente o que ele joga
      ai: (ctx, pid) => ctx.opps(pid).some(o => ctx.player(o).deck.length >= 3) ? 0.65 : 0.25, val: 1.0, want: needMem,
    });

    // ================================================================ capturas condicionais e efeitos decisivos
    function claimSpec(id, cond, label) {
      D(id, 'Captura', {
        can(ctx, pid) { return ctx.entries().some(e => e.pid !== pid); },
        async apply(ctx, act) {
          const cand = ctx.entries().filter(e => e.pid !== act.pid && !ctx.sameTeam(e.pid, act.pid)).map(e => e.pid);
          const good = cand.filter(pid => cond(ctx.entry(pid)));
          const t = await ctx.target(act.pid, cand, label); if (t == null) return;
          ctx.combat.claims.push({ pid: act.pid, target: t, cond }); ctx.say(`${nm(ctx, act.pid)} mira a carta de ${nm(ctx, t)}.`);
        },
        ai(ctx, pid) { return ctx.entries().some(e => e.pid !== pid && cond(e)) ? 0.72 : 0.04; },
      });
    }
    claimSpec('AE-101', e => e.stats.pod + e.stats.int > e.stats.def + e.stats.vel, 'Capturar a carta de qual atacante?');
    claimSpec('AE-102', e => e.stats.def + e.stats.vel >= e.stats.pod + e.stats.int, 'Capturar a carta de qual defensor?');
    D('AE-103', 'Captura', {
      can(ctx, pid) { return ctx.entries().some(e => e.pid !== pid); },
      async apply(ctx, act) {
        const me = ctx.entry(act.pid); me.saveOnLoss = true;
        for (const o of ctx.entries()) {
          if (o.pid === act.pid || ctx.sameTeam(o.pid, act.pid)) continue;
          if (o.noBHBySpecial) { ctx.say(`${nm(ctx, o.pid)} está protegido do Buraco Negro.`); continue; }
          const cs = [o.card, ...o.extra]; cs.forEach(c => ctx.toBH(c, 'normal')); o.withdrawn = true; o.gone = true;
          await ctx.emit('banish', { pid: o.pid, cards: cs });
        }
        ctx.say(`${nm(ctx, act.pid)} arrasa o campo.`);
      },
      ai(ctx, pid) { return ctx.isLosing(pid) ? 0.85 : 0.04; },
    });
    D('AE-107', 'Captura', {
      companion: true, prep: 0.2,
      can(ctx, pid) { return ctx.player(pid).prepared.length >= 2 || ctx.activations.some(a => a.pid === pid); },
      apply(ctx, act) {
        const set = new Set(); ctx.entries().forEach(e => { if (e.pid !== act.pid && !ctx.sameTeam(e.pid, act.pid) && e.stats[e.attr] <= 30) set.add(e.pid); });
        ctx.combat.pierce[act.pid] = set; ctx.say(set.size ? 'Rivais fracos não poderão se proteger do próximo roubo.' : 'Nenhum rival com 30 ou menos no atributo escolhido.');
      },
      ai: () => 0.2,
    });
    D('AE-109', 'Captura', {
      can(ctx, pid) { return ctx.entries().some(e => e.pid !== pid); },
      async apply(ctx, act) {
        const cand = ctx.entries().filter(e => e.pid !== act.pid && !ctx.sameTeam(e.pid, act.pid)).map(e => e.pid); const t = await ctx.target(act.pid, cand, 'Desafiar qual adversário?'); if (t == null) return;
        const te = ctx.entry(t); const a = await ctx.askAttr(act.pid, { title: `Duelo condicionado: em qual atributo? (${nm(ctx, t)} precisa ter 80 ou mais)`, hint: 'A carta dele já está revelada.', options: AID }, () => AID.slice().sort((x, y) => te.stats[y] - te.stats[x])[0]);
        ctx.combat.claims.push({ pid: act.pid, target: t, cond: e => e.stats[a] >= 80 }); ctx.say(`${nm(ctx, act.pid)} desafia ${nm(ctx, t)} em ${ATTR[a].nome}.`);
      },
      ai(ctx, pid) { return ctx.entries().some(e => e.pid !== pid && Math.max(...AID.map(a => e.stats[a])) >= 80) ? 0.72 : 0.04; },
    });
    D('AE-110', 'Captura', {
      apply(ctx, act) { ctx.entry(act.pid).margin = true; ctx.say(`${nm(ctx, act.pid)} abre uma margem estreita.`); },
      ai(ctx, pid) { const w = winnerOf(ctx); if (!w || w.pid === pid || ctx.sameTeam(w.pid, pid)) return 0.03; const me = ctx.entry(pid); const d = (w.stats[w.attr] + w.bonus) - (me.stats[me.attr] + me.bonus); return d > 0 && d <= 10 ? 0.85 : 0.03; },
    });
    D('AE-129', 'Captura', {
      apply(ctx, act) { ctx.entry(act.pid).autoWin = true; ctx.say(`${nm(ctx, act.pid)} vence a comparação de atributos!`); },
      ai(ctx, pid) { return ctx.isLosing(pid) ? 0.95 : 0.06; },
    });
    // ================================================================ redução de atributos do rival (13/10/2026, autorizado pelo autor)
    const foeEntries = (ctx, pid) => ctx.entries().filter(e => e.pid !== pid && !e.withdrawn && !ctx.sameTeam(e.pid, pid));
    const aimWinner = (ctx, c) => { const w = winnerOf(ctx); return w && c.includes(w.pid) ? w.pid : c[0]; };   // o bot mira em quem está vencendo
    const cut = (e, k, n) => x => { x.stats[k] = Math.max(0, x.stats[k] - n); };
    D('AE-131', 'Redução', {
      can(ctx, pid) { return foeEntries(ctx, pid).length > 0; },
      async apply(ctx, act) {
        const t = await ctx.target(act.pid, foeEntries(ctx, act.pid).map(e => e.pid), 'Enfraquecer qual adversário?', c => aimWinner(ctx, c)); if (t == null) return;
        const te = ctx.entry(t); AID.forEach(k => ctx.addMod(te, act.pid, 'Enfraquecer', cut(te, k, 15)));
        ctx.say(`${nm(ctx, t)} perde 15 em todos os atributos.`);
      },
      ai(ctx, pid) { return ctx.isLosing(pid) ? clamp01(ctx.flipChance(pid, 15)) : 0.04; },
    });
    D('AE-132', 'Redução', {
      can(ctx, pid) { return foeEntries(ctx, pid).length > 0; },
      async apply(ctx, act) {
        const t = await ctx.target(act.pid, foeEntries(ctx, act.pid).map(e => e.pid), 'Quebrar o melhor atributo de qual adversário?', c => aimWinner(ctx, c)); if (t == null) return;
        const te = ctx.entry(t); const k = AID.slice().sort((a, b) => te.stats[b] - te.stats[a])[0];
        ctx.addMod(te, act.pid, 'Quebrar o melhor', cut(te, k, 25)); ctx.say(`${nm(ctx, t)} perde 25 em ${ATTR[k].nome}, o melhor atributo da carta.`);
      },
      ai(ctx, pid) { return ctx.isLosing(pid) ? clamp01(0.6 * ctx.flipChance(pid, 25)) : 0.04; },
    });
    D('AE-133', 'Redução', {
      can(ctx, pid) { return foeEntries(ctx, pid).length > 0 && !!ctx.entry(pid); },
      apply(ctx, act) {
        const k = ctx.entry(act.pid).attr; foeEntries(ctx, act.pid).forEach(te => ctx.addMod(te, act.pid, 'Desgaste coletivo', cut(te, k, 8)));
        ctx.say(`Todos os rivais perdem 8 em ${ATTR[k].nome}.`);
      },
      ai(ctx, pid) { return ctx.isLosing(pid) ? clamp01(0.7 * ctx.flipChance(pid, 8)) : 0.04; },
    });
    [['AE-141', ['pod', 'int'], 'Intimidar qual adversário?', 'Intimidar']].forEach(([id, ks, q, lab]) => D(id, 'Redução', {
      can(ctx, pid) { return foeEntries(ctx, pid).length > 0; },
      async apply(ctx, act) {
        const t = await ctx.target(act.pid, foeEntries(ctx, act.pid).map(e => e.pid), q, c => aimWinner(ctx, c)); if (t == null) return;
        const te = ctx.entry(t); ks.forEach(k => ctx.addMod(te, act.pid, lab, cut(te, k, 12))); ctx.say(`${nm(ctx, t)} perde 12 em ${ks.map(k => ATTR[k].nome).join(' e ')}.`);
      },
      ai(ctx, pid) { return ctx.isLosing(pid) ? clamp01(0.75 * ctx.flipChance(pid, 12)) : 0.04; },
    }));
    D('AE-134', 'Reação', {
      phase: 'late',
      can(ctx, pid) { return foeEntries(ctx, pid).some(e => e.attr); },
      async apply(ctx, act) {
        const cand = foeEntries(ctx, act.pid).filter(e => e.attr).map(e => e.pid); const t = await ctx.target(act.pid, cand, 'Cortar o atributo de qual adversário?', c => aimWinner(ctx, c)); if (t == null) return;
        const te = ctx.entry(t), k = te.attr; ctx.addMod(te, act.pid, 'Cortar o par', cut(te, k, 20)); ctx.say(`${nm(ctx, t)} perde 20 em ${ATTR[k].nome}.`);
      },
      // na janela de reação as cartas já estão viradas: o bot sabe se os 20 viram o resultado
      ai(ctx, pid) { return ctx.isLosing(pid) ? clamp01(ctx.flipChance(pid, 20)) : 0.03; },
    });
    D('AE-130', 'Reação', {
      phase: 'pre',
      async apply(ctx, act) {
        const list = ctx.activations.filter(a => !a.done && !a.cancelled && a !== act && a.pid !== act.pid && !ctx.sameTeam(a.pid, act.pid));
        if (!list.length) return ctx.say('Nenhuma habilidade pendente para anular.');
        const a = list[list.length - 1]; if (await ctx.cancelAct(a, act.pid)) ctx.say(`${nm(ctx, act.pid)} anula a última habilidade pendente (de ${nm(ctx, a.pid)}).`);
      },
      ai(ctx, pid) { return 0.05 + 0.7 * oppFlip(ctx, pid); },
    });

    // ================================================================ interações entre especiais
    D('AE-114', 'Interação', { phase: 'guard', apply(ctx, act) { ctx.def(act.pid).redirect++; ctx.say(`${nm(ctx, act.pid)} prepara um desvio de alvo.`); }, ai(ctx, pid) { return ORR(seenCat(ctx, pid, ['Roubo', 'Redistribuição', 'Troca', 'Buraco Negro', 'Captura', 'Controle'], 0.5, 0.05), () => ctx.opps(pid).some(o => ctx.player(o).prepared.length > 0) ? 0.3 : 0.06); } });
    D('AE-115', 'Interação', {
      phase: 'echo',
      async apply(ctx, act) {
        const list = ctx.activations.filter(a => a.pid !== act.pid && !ctx.sameTeam(a.pid, act.pid) && a.done && !a.cancelled && ['main', 'guard'].includes(SP[CARDS[a.card].especial].phase || 'main') && !['AE-115'].includes(SP[CARDS[a.card].especial].id));
        if (!list.length) return ctx.say('Eco sem efeito: nenhum especial adversário foi ativado.');
        const owners = [...new Set(list.map(a => a.pid))]; const o = owners.length === 1 ? owners[0] : await ctx.pick(act.pid, owners, 'Copiar o especial de quem?');
        const a2 = list.find(a => a.pid === o); const sp2 = SP[CARDS[a2.card].especial];
        ctx.say(`${nm(ctx, act.pid)} copia ${sp2.nome} de ${nm(ctx, o)}.`); await sp2.apply(ctx, { pid: act.pid, card: act.card, copy: true });
      },
      ai(ctx, pid) { return 0.05 + 0.5 * oppFlip(ctx, pid); }, val: 0.3,
    });
    D('AE-116', 'Interação', {
      phase: 'late',
      async apply(ctx, act) {
        const pool = ctx.combat.ctrlActs.concat(ctx.activations).filter(a => a.pid !== act.pid && !ctx.sameTeam(a.pid, act.pid) && !a.cancelled && a.claimedBy == null);
        if (!pool.length) return ctx.say('Nenhum especial adversário usado para apropriar.');
        const owners = [...new Set(pool.map(a => a.pid))]; const o = owners.length === 1 ? owners[0] : await ctx.pick(act.pid, owners, 'Apropriar o especial de quem?');
        const a2 = pool.find(a => a.pid === o); a2.claimedBy = act.pid; ctx.say(`${nm(ctx, act.pid)} se apropria do especial de ${nm(ctx, o)}.`);
      },
      ai(ctx, pid) { return 0.05 + 0.55 * oppFlip(ctx, pid); }, val: 0.35,
    });
    D('AE-117', 'Interação', {
      can(ctx, pid) { return ctx.opps(pid).some(o => ctx.player(o).prepared.length > 0); },
      async apply(ctx, act) {
        const cand = ctx.opps(act.pid).filter(o => ctx.player(o).prepared.length > 0); const t = await ctx.target(act.pid, cand, 'Quem expõe os especiais preparados?'); if (t == null) return;
        await ctx.emit('peek', { pid: act.pid, target: t, cards: ctx.player(t).prepared.slice(0, 2), title: 'Preparação exposta', hint: `Especiais preparados de ${nm(ctx, t)} (continuam preparados).` }); ctx.learn(act.pid, t, ctx.player(t).prepared.slice(0, 2), 'prep'); ctx.say(`${nm(ctx, t)} expõe seus especiais preparados.`);
      },
      ai: (ctx, pid) => ctx.opps(pid).some(o => ctx.player(o).prepared.length > 0) ? 0.4 : 0.04, prep: 0.5, val: 0.5, want: (g, p) => g.alive().some(o => o !== p.pid && g.p(o).prepared.length > 0 && !(p.mem.prep[o] || []).length),
    });
    D('AE-118', 'Interação', {
      phase: 'shield', companion: true,
      apply(ctx, act) { ctx.combat.shield[act.pid] = (ctx.combat.shield[act.pid] || 0) + 1; ctx.say(`${nm(ctx, act.pid)} blinda os próprios especiais.`); },
      ai(ctx, pid) { return 0.04 + 0.3 * oppFlip(ctx, pid); }, val: 0.15,
    });
    D('AE-119', 'Interação', {
      can(ctx, pid) { return ctx.player(pid).deck.length >= 1; },
      async apply(ctx, act) {
        const p = ctx.player(act.pid); if (p.prepared.length >= 2 || !p.deck.length) return ctx.say('Não há espaço ou carta para preparar.');
        const c = p.deck.shift(); p.prepared.push(c); ctx.combat.locked.add(c); ctx.say(`${nm(ctx, act.pid)} prepara outro especial na hora.`); await ctx.emit('prepare', { pid: act.pid, card: c });
      },
      // adianta o preparo: bom quando a próxima carta é fraca e o especial dela vale
      ai(ctx, pid) { const p = ctx.player(pid); if (p.deck.length < 3 || p.prepared.length > 2) return 0.02; const sp = SP[CARDS[p.deck[0]].especial]; return sp && ctx.g.botVal(sp) >= 1 && sum(p.deck[0]) < MEANSUM ? 0.5 : 0.04; }, prep: 0.5, val: 0.6,
    });
    D('AE-120', 'Interação', {
      phase: 'late',
      async apply(ctx, act) {
        const es = ctx.entries(); const cand = es.map(e => e.pid);
        const mods = e => e.mods.filter(m => !m.off).length;
        const t = await ctx.pick(act.pid, cand, 'Anular as alterações numéricas de qual carta de combate?', c => c.slice().sort((x, y) => (x === act.pid ? 1 : 0) - (y === act.pid ? 1 : 0) || mods(ctx.entry(y)) - mods(ctx.entry(x)))[0]);
        const e = ctx.entry(t); const n = mods(e); e.mods.forEach(m => { m.off = true; }); ctx.recalc(e);
        ctx.say(n ? `${nm(ctx, act.pid)} remove as alterações numéricas da carta de ${nm(ctx, t)}.` : 'Remoção sem efeito: a carta não tinha alterações.');
      },
      ai(ctx, pid) { return ctx.entries().some(e => e.pid !== pid && e.mods.length) ? 0.5 : ctx.isLosing(pid) ? 0.03 : 0.05 + 0.4 * oppFlip(ctx, pid); }, val: 0.3,
    });

    // ================================================================ conversões e permutas
    const conv = (id, from, to) => D(id, 'Conversão', {
      fx: st => Object.assign({}, st, { [to]: st[from] }),
      apply(ctx, act) { const e = ctx.entry(act.pid); ctx.addMod(e, act.pid, 'Conversão', x => { x.stats[to] = x.stats[from]; }); ctx.say(`${nm(ctx, act.pid)} converte ${ATTR[from].nome} em ${ATTR[to].nome}.`); },
      ai(ctx, pid) { const e = ctx.entry(pid); if (e.attr !== to) return 0.03; const d = e.stats[from] - e.stats[to]; return d <= 0 ? 0 : ctx.flipChance(pid, d); },
    });
    conv('AE-121', 'def', 'vel'); conv('AE-122', 'vel', 'def');
    const perm = (id, x, y) => D(id, 'Conversão', {
      fx: st => Object.assign({}, st, { [x]: st[y], [y]: st[x] }),
      apply(ctx, act) { const e = ctx.entry(act.pid); ctx.addMod(e, act.pid, 'Permuta', s => { const t = s.stats[x]; s.stats[x] = s.stats[y]; s.stats[y] = t; }); ctx.say(`${nm(ctx, act.pid)} permuta ${ATTR[x].nome} e ${ATTR[y].nome}.`); },
      ai(ctx, pid) { const e = ctx.entry(pid); if (e.attr !== x && e.attr !== y) return 0.03; const o = e.attr === x ? y : x; const d = e.stats[o] - e.stats[e.attr]; return d <= 0 ? 0 : ctx.flipChance(pid, d); },
    });
    perm('AE-123', 'pod', 'int'); perm('AE-124', 'pod', 'vel'); perm('AE-125', 'pod', 'def'); perm('AE-126', 'int', 'vel'); perm('AE-127', 'int', 'def'); perm('AE-128', 'def', 'vel');
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = install; else root.DS_ESPECIAIS = install;
})(typeof window !== 'undefined' ? window : globalThis);
