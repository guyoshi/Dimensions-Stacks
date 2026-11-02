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
    const MEANSUM = (() => { const l = Object.keys(CARDS).filter(id => CARDS[id].raridade !== 'quasar' && !CARDS[id].principe); return l.reduce((t, id) => t + sum(id), 0) / l.length; })();
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
      apply(ctx, act) { const ctl = ctx.combat.ctl; if (ctl.typeAll) return ctx.say('O tipo de atributo já foi imposto: este efeito é ignorado.'); ctl.typeAll = tipo; ctx.say(`Todos devem usar atributo de ${tipo}.`); const me = ctx.entry(act.pid); if (me) { ctx.addMod(me, act.pid, 'Imposição', x => { for (const k of AID) if (ATTR[k].tipo === tipo) x.stats[k] += 12; }); ctx.say(`${nm(ctx, act.pid)} ganha +12 nos atributos de ${tipo}.`); } },
      ai(ctx, pid) { const mine = AID.filter(a => ATTR[a].tipo === tipo), oth = AID.filter(a => ATTR[a].tipo !== tipo); const m = bestVs(ctx, pid, mine).p; return m > bestVs(ctx, pid, oth).p ? ctrlU(m) : 0.03; },
    }));
    [['AE-026', 'force', 'ataque'], ['AE-027', 'force', 'defesa'], ['AE-028', 'ban', 'ataque'], ['AE-029', 'ban', 'defesa']].forEach(([id, k, tipo]) => D(id, 'Controle', {
      phase: 'ctrl',
      async apply(ctx, act) {
        const t = await ctx.target(act.pid, ctx.opps(act.pid), k === 'force' ? `Quem será obrigado a usar ${tipo}?` : `Quem fica proibido de usar ${tipo}?`, c => forceGain(ctx, act.pid, k, tipo).t ?? c[0]); if (t == null) return;
        const per = ctx.combat.ctl.per[t] || (ctx.combat.ctl.per[t] = {}); per[k] = tipo;
        if (id === 'AE-026' || id === 'AE-029') { const te = ctx.entry(t); if (te) { ctx.addMod(te, act.pid, 'Pressão', x => { for (const q of AID) if (ATTR[q].tipo === 'ataque') x.stats[q] = Math.max(0, x.stats[q] - 8); }); ctx.say(`${nm(ctx, t)} perde 8 nos atributos de ataque.`); } }
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

    // ---- [NOVO 28/10/2026, pedido do autor] Névoa de Dados: os rivais escolhem o atributo sem ver os números da própria carta
    D('AE-143', 'Controle', {
      phase: 'ctrl',
      apply(ctx, act) {
        const ctl = ctx.combat.ctl; if (ctl.fog) return ctx.say('Já há uma névoa de dados: este efeito é ignorado (vale o primeiro).');
        ctl.fog = { pid: act.pid }; ctx.say(`Névoa de Dados: só ${nm(ctx, act.pid)}${ctx.g.cfg.teams ? ' e o parceiro' : ''} vê${ctx.g.cfg.teams ? 'em' : ''} os números das cartas desta disputa; os rivais escolhem o atributo às cegas.`);
        ctx.emit('fogFx', { pid: act.pid });
      },
      ai(ctx, pid) { return ctx.opps(pid).length ? 0.45 : 0.03; }, val: 0.6,
    });
    // ---- [NOVO 28/10/2026] Clone: copia a carta vencedora do rival para o fim do seu baralho (legenda CLONE)
    const cloneable = (ctx, pid) => { const w = winnerOf(ctx); return !!w && w.pid !== pid && !ctx.sameTeam(w.pid, pid) && !String(w.card).includes('*'); };
    D('AE-144', 'Captura', {
      can: (ctx, pid) => cloneable(ctx, pid),
      apply(ctx, act) {
        ctx.combat.after.push({ pid: act.pid, async run(c2, res) {
          const g = ctx.g, wp = res.winnerPid, me = act.pid;
          if (wp == null || wp === me || g.sameTeam(wp, me)) return ctx.say(`${nm(ctx, me)} venceu (ou não houve vencedor): o Clone não pode ser usado.`);
          const we = ctx.combat.entries.find(e => e.pid === wp); if (!we || String(we.card).includes('*')) return ctx.say('Não é possível clonar uma carta clone.');
          const id = g.makeClone(we.card, me); g.p(me).deck.push(id);
          ctx.say(`${nm(ctx, me)} clona ${CARDS[we.card].nome} (vai ao fim do baralho).`);
          await ctx.emit('cloneMade', { pid: me, from: wp, card: we.card, clone: id });
        } });
        ctx.say(`${nm(ctx, act.pid)} prepara um clone da carta vencedora.`);
      },
      ai(ctx, pid) { return cloneable(ctx, pid) ? 0.6 : 0.02; }, val: 0.8, noWant: true,
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
        const [give] = await ctx.askCards(act.pid, { title: `Troca escolhida: qual carta sua vai para ${nm(ctx, t)}?`, hint: 'Depois você escolhe entre 2 cartas sorteadas do baralho dele.', cards: mine.slice(), min: 1, max: 1 }, () => lowest(mine, 1));
        if (await ctx.blocked(act.pid, t, 'deck', 1, 'swap')) return;
        const tl = ctx.player(t).deck; if (!tl.length) return;
        const pool = tl.slice(), duas = []; for (let n = 0; n < 2 && pool.length; n++) duas.push(pool.splice(Math.floor(ctx.rand() * pool.length), 1)[0]);
        const [got] = duas.length > 1 ? await ctx.askCards(act.pid, { title: `Troca escolhida: qual carta de ${nm(ctx, t)} você recebe?`, hint: 'Duas cartas sorteadas do baralho dele.', cards: duas, min: 1, max: 1 }, () => highest(duas, 1)) : duas;
        tl.splice(tl.indexOf(got), 1); mine.splice(mine.indexOf(give), 1);
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
          for (const pk of picks) { ctx.player(pk.to).deck.push(pk.card); await ctx.emit('steal', { from: pk.from, to: pk.to, card: pk.card }); const en = ctx.entry(pk.from); if (en) ctx.addMod(en, pk.from, 'Passe', x => { for (const k of AID) x.stats[k] += 10; }); }
          ctx.say('Todos passam uma carta; quem passou ganha +10 em tudo nesta disputa.');
        },
        ai: () => 0.2,
      });
    }
    pass('AE-057', 'L'); pass('AE-058', 'R');
    function permReserve(id, dir) {
      const side = (ctx, pid) => dir === 'R' ? ctx.right(pid) : ctx.left(pid);
      D(id, 'Troca', {
        can(ctx, pid) { const t = side(ctx, pid); return t != null && (ctx.player(t).reserve.length > 0 || ctx.player(pid).reserve.length > 0); },   // 15/10/2026: troca até 3 cartas de cada reserva (as 3 primeiras); quem tem menos entrega só o que tem, e a troca vale mesmo assim
        async apply(ctx, act) {
          let t = side(ctx, act.pid); if (t == null) return; t = await ctx.hit(act.pid, t); if (t == null) return;
          if (await ctx.blocked(act.pid, t, 'reserve', 2, 'swap')) return;
          const a = ctx.player(act.pid), b = ctx.player(t); const ga = a.reserve.splice(0, 3), gb = b.reserve.splice(0, 3); a.reserve.unshift(...gb); b.reserve.unshift(...ga);
          ctx.say(`${nm(ctx, act.pid)} troca até 3 cartas da reserva com ${nm(ctx, t)} (entrega ${ga.length}, recebe ${gb.length}).`); await ctx.emit('reserveSwap', { a: act.pid, b: t, na: ga.length, nb: gb.length });
        },
        ai(ctx, pid) { const t = dir === 'R' ? ctx.right(pid) : ctx.left(pid); if (t == null) return 0; const g = Math.min(3, ctx.player(t).reserve.length) - Math.min(3, ctx.player(pid).reserve.length); return g >= 2 ? 0.55 : g === 1 ? 0.3 : 0.05; },
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
        if (L == null || R == null) return ctx.say('Sem vizinhos para a troca: o especial é gasto.');
        const dl = ctx.player(L).deck, dr = ctx.player(R).deck; if (!dl.length || !dr.length || (L === R && dl.length < 2)) return ctx.say('Um dos vizinhos não tem cartas ativas.');
        const tot = q => ctx.g.totalCards(ctx.player(q)); const strongL = tot(L) >= tot(R);
        const kL = ctx.mem(act.pid, L).slice(), kR = ctx.mem(act.pid, R).slice();
        const choose = (k, deck, strong) => () => { const kn = k.filter(c => deck.includes(c)); if (kn.length) return [strong ? highest(kn, 1)[0] : lowest(kn, 1)[0]]; return [deck[Math.floor(ctx.rand() * deck.length)]]; };
        const [cl] = await ctx.askCards(act.pid, { title: `Troca entre vizinhos: escolha 1 carta do baralho de ${nm(ctx, L)}`, hint: 'Estão viradas para baixo: escolha pela posição.', cards: dl.slice(), blind: true, min: 1, max: 1 }, choose(kL, dl, strongL));
        const drc = L === R ? dr.filter(c => c !== cl) : dr.slice();
        const [cr] = await ctx.askCards(act.pid, { title: `Troca entre vizinhos: escolha 1 carta do baralho de ${nm(ctx, R)}`, hint: 'Estão viradas para baixo: escolha pela posição.', cards: drc, blind: true, min: 1, max: 1 }, choose(kR.filter(c => drc.includes(c)), drc, !strongL));
        const [fica] = await ctx.askCards(act.pid, { title: 'Troca entre vizinhos: qual das duas cartas fica na SUA reserva?', hint: 'A outra segue para o vizinho oposto.', cards: [cl, cr], min: 1, max: 1 }, () => highest([cl, cr], 1));
        dl.splice(dl.indexOf(cl), 1); dr.splice(dr.indexOf(cr), 1); const mr = ctx.player(act.pid).reserve;
        if (fica === cl) { mr.push(cl); dl.push(cr); await ctx.emit('steal', { from: L, to: act.pid, card: cl, zone: 'deck', dzone: 'reserve' }); await ctx.emit('steal', { from: R, to: L, card: cr }); }
        else { mr.push(cr); dr.push(cl); await ctx.emit('steal', { from: R, to: act.pid, card: cr, zone: 'deck', dzone: 'reserve' }); await ctx.emit('steal', { from: L, to: R, card: cl }); }
        ctx.say(`${nm(ctx, act.pid)} faz ${nm(ctx, L)} e ${nm(ctx, R)} trocarem cartas e fica com uma delas na reserva.`);
        ctx.learn(act.pid, L, kL.filter(c => c !== cl)); ctx.learn(act.pid, R, kR.filter(c => c !== cr));   // quem escolheu sabe o que mudou de lugar
      },
      ai(ctx, pid) {
        if (ctx.g.cfg && ctx.g.cfg.teams) return 0; const L = ctx.left(pid), R = ctx.right(pid); if (L == null || R == null || L === R) return 0.02;
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
        const L = ctx.left(act.pid); if (L == null) return ctx.say('Sem rival à esquerda: o especial é gasto.');
        const t = await ctx.hit(act.pid, L); if (t == null) return; if (await ctx.blocked(act.pid, t, 'reserve', 1, 'swap')) return;
        const rl = ctx.player(t).reserve; if (!rl.length) return ctx.say('Reserva vazia.');
        const c = rl.splice(Math.floor(ctx.rand() * rl.length), 1)[0]; ctx.player(act.pid).reserve.push(c);
        ctx.say(`${nm(ctx, act.pid)} pega uma carta da reserva de ${nm(ctx, t)} para a própria reserva.`); await ctx.emit('steal', { from: t, to: act.pid, card: c, zone: 'reserve', dzone: 'reserve' });
      },
      // só em 3+: tira da reserva do líder (à esquerda) e dá a quem está atrás de mim (à direita)
      ai(ctx, pid) { const L = ctx.left(pid); if (L == null) return 0.02; return ctx.player(L).reserve.length ? 0.55 : 0.03; }, prep: 0.5, val: 0.6,
    });
    D('AE-065', 'Redistribuição', {
      async apply(ctx, act) {
        const L = ctx.left(act.pid), R = ctx.right(act.pid); if (L == null || R == null) return ctx.say('Sem rival à esquerda: o especial é gasto.');
        const t = await ctx.hit(act.pid, L); if (t == null) return; if (await ctx.blocked(act.pid, t, 'deck', 3, 'swap')) return;
        const dl = ctx.player(t).deck; for (let n = 0; n < 3 && dl.length; n++) { const c = dl.splice(Math.floor(ctx.rand() * dl.length), 1)[0]; if (n === 0) { ctx.player(act.pid).reserve.push(c); await ctx.emit('steal', { from: t, to: act.pid, card: c, zone: 'deck', dzone: 'reserve' }); } else { ctx.player(R).deck.push(c); await ctx.emit('steal', { from: t, to: R, card: c }); } }
        ctx.say(`${nm(ctx, act.pid)} tira cartas de ${nm(ctx, t)}: 1 vai para a sua reserva e as outras para ${nm(ctx, R)}.`);
      },
      ai(ctx, pid) { const L = ctx.left(pid); if (L == null) return 0.02; return ctx.player(L).deck.length >= 2 ? 0.55 : 0.05; }, prep: 0.5, val: 0.6,
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
            const d = c2.player(act.pid).reserve; if (!d.length) break;
            const [c] = await c2.askCards(act.pid, { title: `Conquista compensada: entregue 1 carta da reserva a ${nm(c2, o)}`, cards: d.slice(), min: 1, max: 1 }, () => lowest(d, 1));
            d.splice(d.indexOf(c), 1); c2.player(o).reserve.push(c); await c2.emit('steal', { from: act.pid, to: o, card: c, zone: 'reserve', dzone: 'reserve' });
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
        const te = ctx.entry(t); if (te) { ctx.addMod(te, act.pid, 'Mão revelada', x => { for (const k of AID) x.stats[k] = Math.max(0, x.stats[k] - 10); }); ctx.say(`${nm(ctx, t)} perde 10 em todos os atributos.`); }
      },
      ai: (ctx, pid) => ctx.opps(pid).some(o => ctx.player(o).deck.length > 0 && ctx.mem(pid, o).length < 2) ? 0.55 : 0.05, prep: 0.4, val: 1.0, want: needMem,
    });
    D('AE-092', 'Informação', {
      can(ctx, pid) { return ctx.player(pid).deck.length >= 2; },
      async apply(ctx, act) {
        const p = ctx.player(act.pid); const m5 = Math.min(5, p.deck.length), n = Math.min(3, m5); const v = p.deck.slice(0, m5);
        const o = await ctx.askCards(act.pid, { title: 'Escolha e ordene 3 das próximas 5 cartas (1ª = topo)', hint: 'Toque nas cartas na ordem em que quer que entrem em disputa. As outras ficam depois, na ordem original.', cards: v, min: n, max: n, ordered: true }, () => orderVs(ctx, act.pid, v.slice().sort((a, b) => sum(b) - sum(a)).slice(0, n)));
        p.deck.splice(0, m5, ...o, ...v.filter(c => !o.includes(c))); ctx.say(`${nm(ctx, act.pid)} reordena as próximas cartas.`); await ctx.emit('reorder', { pid: act.pid });
      },
      ai(ctx, pid) { const v = ctx.player(pid).deck.slice(0, 3); if (v.length < 2) return 0; if (foeSeqs(ctx, pid).some(q => q.length)) return 0.6; const sp = Math.max(...v.map(sum)) - Math.min(...v.map(sum)); return sp >= 60 ? 0.3 : 0.1; }, prep: 0.5, val: 0.8,
    });
    D('AE-094', 'Informação', {
      can(ctx, pid) { return ctx.player(pid).deck.length >= 2; },
      async apply(ctx, act) { const p = ctx.player(act.pid); const n = Math.min(5, p.deck.length); p.deck.splice(0, n, ...p.deck.slice(0, n).reverse()); ctx.say(`${nm(ctx, act.pid)} inverte a fila das próximas ${n} cartas.`); await ctx.emit('peek', { pid: act.pid, target: act.pid, cards: p.deck.slice(0, n), title: 'Fila invertida', hint: 'Novas próximas cartas (topo → fundo).' }); await ctx.emit('reorder', { pid: act.pid }); },
      ai(ctx, pid) { const v = ctx.player(pid).deck.slice(0, 5); if (v.length < 2) return 0; const g = orderScore(ctx, pid, v.slice().reverse()) - orderScore(ctx, pid, v); return g >= 40 ? 0.7 : g >= 20 ? 0.4 : 0.04; }, prep: 0.4, val: 0.5,
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
      can(ctx, pid) { return ctx.player(pid).reserve.length >= 1; },
      async apply(ctx, act) {
        const p = ctx.player(act.pid); const n = p.reserve.length, v = p.reserve.slice();
        if (n > 1) { const o = await ctx.askCards(act.pid, { title: 'Reorganize a reserva', hint: 'A 1ª será a primeira a entrar no baralho.', cards: v, min: n, max: n, ordered: true }, () => highest(v, n)); p.reserve.splice(0, n, ...o); }
        const [top] = await ctx.askCards(act.pid, { title: 'Qual carta da reserva vai para o topo do baralho?', hint: 'Ela será a próxima a entrar em disputa.', cards: p.reserve.slice(), min: 1, max: 1 }, () => highest(p.reserve, 1));
        p.reserve.splice(p.reserve.indexOf(top), 1); p.deck.unshift(top);
        ctx.say(`${nm(ctx, act.pid)} organiza a reserva e coloca uma carta no topo do baralho.`); await ctx.emit('reorder', { pid: act.pid });
      },
      ai(ctx, pid) { const p = ctx.player(pid); return p.reserve.length >= 1 && (p.deck.length <= 3 || avgSum(highest(p.reserve, 1)) > avgSum(p.deck) + 20) ? 0.4 : 0.06; }, prep: 0.4, val: 0.3,
    });
    D('AE-099', 'Informação', {
      can(ctx, pid) { return ctx.player(pid).reserve.length > 0; },
      async apply(ctx, act) {
        const p = ctx.player(act.pid); if (!p.reserve.length) return; const duas = p.reserve.slice(0, 2);
        const [c] = duas.length > 1 ? await ctx.askCards(act.pid, { title: 'Reforçar o fim: qual das duas vai para o fim do baralho?', hint: 'São as duas primeiras cartas da reserva.', cards: duas, min: 1, max: 1 }, () => highest(duas, 1)) : duas;
        p.reserve.splice(p.reserve.indexOf(c), 1); p.deck.push(c); ctx.say(`${nm(ctx, act.pid)} reforça o fim do baralho.`); await ctx.emit('reorder', { pid: act.pid });
      },
      ai(ctx, pid) { const p = ctx.player(pid); return p.deck.length <= 3 && p.reserve.length && sum(highest(p.reserve.slice(0, 2), 1)[0]) > avgSum(p.deck) + 15 ? 0.4 : 0.05; }, prep: 0.5, val: 0.3,
    });
    D('AE-100', 'Informação', {
      can(ctx, pid) { return ctx.opps(pid).some(o => ctx.player(o).deck.length >= 2); },
      async apply(ctx, act) {
        const cand = ctx.opps(act.pid).filter(o => ctx.player(o).deck.length >= 2); if (!cand.length) return;
        const t = await ctx.target(act.pid, cand, 'Confundir o próximo turno de quem?'); if (t == null) return;
        const d = ctx.player(t).deck; const v = d.slice(0, 3); if (!v.length) return;
        const [c] = await ctx.askCards(act.pid, { title: `Qual carta de ${nm(ctx, t)} ficará no topo?`, hint: 'As demais mantêm a ordem relativa.', cards: v, min: 1, max: 1 }, () => lowest(v, 1));
        d.splice(d.indexOf(c), 1); d.unshift(c); (ctx.g.s.marks || (ctx.g.s.marks = [])).push({ card: c, v: -10, src: act.pid }); ctx.say(`${nm(ctx, act.pid)} confunde o próximo turno de ${nm(ctx, t)}: a carta de cima entra marcada (−10).`); await ctx.emit('reorder', { pid: t }); ctx.learn(act.pid, t, d.slice());
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
    D('AE-107', 'Conversão', {
      fx: st => { const ks = Object.keys(st).sort((x, y) => st[x] - st[y]); return Object.assign({}, st, { [ks[0]]: st[ks[ks.length - 1]] }); },
      apply(ctx, act) { const e = ctx.entry(act.pid); ctx.addMod(e, act.pid, 'Conversão', x => { const ks = AID.slice().sort((p, q) => x.stats[p] - x.stats[q]); x.stats[ks[0]] = x.stats[ks[3]]; }); ctx.say(`${nm(ctx, act.pid)} troca o pior atributo pelo melhor.`); },
      ai(ctx, pid) { const e = ctx.entry(pid); const ks = AID.slice().sort((p, q) => e.stats[p] - e.stats[q]); const d = e.stats[ks[3]] - e.stats[ks[0]]; return e.attr === ks[0] ? ctx.flipChance(pid, d) : 0.03; },
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
      can(ctx, pid) { return ctx.alive().some(o => o !== pid && ctx.player(o).deck.length >= 2); },
      async apply(ctx, act) {
        for (const o of ctx.alive()) { if (o === act.pid) continue; const d = ctx.player(o).deck; for (let i = d.length - 1; i > 0; i--) { const k = Math.floor(ctx.rand() * (i + 1)); [d[i], d[k]] = [d[k], d[i]]; } }
        ctx.say(`${nm(ctx, act.pid)} embaralha a ordem das cartas de todos os outros jogadores.`); for (const o of ctx.alive()) if (o !== act.pid) await ctx.emit('reorder', { pid: o });
      },
      // vale quando o bot lembra sequências dos rivais que lhe são desfavoráveis
      ai(ctx, pid) { return foeSeqs(ctx, pid).some(q => q.length >= 2 && avgSum(q) > avgSum(ctx.player(pid).deck)) ? 0.35 : 0.06; }, prep: 0.4, val: 0.4,
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
    // ================= NOVAS HABILIDADES (lote 1: bônus, conversão, controle) — aprovadas em 02/11/2026 =================
    const N = (id, nome, texto, cat, o) => def(id, nome, texto, cat, o);
    const weakest = st => AID.reduce((b, a) => (st[a] < st[b] ? a : b), AID[0]), strongest = st => AID.reduce((b, a) => (st[a] > st[b] ? a : b), AID[0]);
    const lostLast = (ctx, pid) => { const r = ctx.g.s.lastRes; return !!r && r.winner != null && r.pids.includes(pid) && r.winner !== pid && !ctx.sameTeam(r.winner, pid); };
    N('AE-146', 'Maré alta', 'Sua carta de combate recebe +15 no atributo mais fraco dela nesta disputa.', 'Bônus', {
      fx: st => { const o = Object.assign({}, st); o[weakest(st)] += 15; return o; },
      apply(ctx, act) { const e = ctx.entry(act.pid), a = weakest(e.stats); ctx.addMod(e, act.pid, 'Maré alta', x => { x.stats[weakest(x.stats)] += 15; }); ctx.say(`${nm(ctx, act.pid)} ergue o atributo mais fraco (${ATTR[a].nome}).`); },
      ai(ctx, pid) { const e = ctx.entry(pid); return e.attr === weakest(e.stats) ? ctx.flipChance(pid, 15) : 0.03; },
    });
    N('AE-147', 'Segundo fôlego', 'Se você perdeu a disputa anterior, sua carta recebe +20 no atributo que está usando.', 'Bônus', {
      fx: (st, at) => { const o = Object.assign({}, st); if (at) o[at] += 20; return o; },
      can: (ctx, pid) => lostLast(ctx, pid),
      apply(ctx, act) { const e = ctx.entry(act.pid), a = e.attr; ctx.addMod(e, act.pid, 'Segundo fôlego', x => { x.stats[a] += 20; }); ctx.say(`${nm(ctx, act.pid)} recupera o fôlego (+20).`); },
      ai(ctx, pid) { return ctx.flipChance(pid, 20); },
    });
    N('AE-148', 'Foco duplo', 'Sua carta de combate recebe +12 em dois atributos à sua escolha.', 'Bônus', {
      async apply(ctx, act) {
        const e = ctx.entry(act.pid); const a1 = await ctx.askAttr(act.pid, { title: 'Foco duplo: primeiro atributo (+12)', options: AID }, () => e.attr);
        const a2 = await ctx.askAttr(act.pid, { title: 'Foco duplo: segundo atributo (+12)', options: AID.filter(a => a !== a1) }, () => AID.filter(a => a !== a1).sort((x, y) => e.stats[y] - e.stats[x])[0]);
        ctx.addMod(e, act.pid, 'Foco duplo', x => { x.stats[a1] += 12; x.stats[a2] += 12; }); ctx.say(`${nm(ctx, act.pid)} foca ${ATTR[a1].nome} e ${ATTR[a2].nome}.`);
      },
      ai(ctx, pid) { return ctx.flipChance(pid, 12); },
    });
    N('AE-149', 'Último suspiro', 'Se seu baralho ativo tem 3 cartas ou menos, sua carta recebe +25 no atributo que está usando.', 'Bônus', {
      fx: (st, at) => { const o = Object.assign({}, st); if (at) o[at] += 25; return o; },
      can: (ctx, pid) => ctx.player(pid).deck.length <= 3,
      apply(ctx, act) { const e = ctx.entry(act.pid), a = e.attr; ctx.addMod(e, act.pid, 'Último suspiro', x => { x.stats[a] += 25; }); ctx.say(`${nm(ctx, act.pid)} dá o último suspiro (+25).`); },
      ai(ctx, pid) { return ctx.flipChance(pid, 25); },
    });
    N('AE-150', 'Veterano', 'Sua carta recebe +2 no atributo que está usando por carta que você já capturou (máximo +20).', 'Bônus', {
      fx: (st, at) => { const o = Object.assign({}, st); if (at) o[at] += 6; return o; },
      can: (ctx, pid) => (ctx.g.s.caps[pid] || 0) > 0,
      apply(ctx, act) { const e = ctx.entry(act.pid), a = e.attr, v = Math.min(20, 2 * (ctx.g.s.caps[act.pid] || 0)); ctx.addMod(e, act.pid, 'Veterano', x => { x.stats[a] += v; }); ctx.say(`${nm(ctx, act.pid)} usa a experiência (+${v}).`); },
      ai(ctx, pid) { return ctx.flipChance(pid, Math.min(20, 2 * (ctx.g.s.caps[pid] || 0))); },
    });
    N('AE-151', 'Aposta', 'Sua carta recebe +25 no atributo que está usando; se você perder a disputa, a carta do topo do seu baralho vai ao Buraco Negro.', 'Bônus', {
      fx: (st, at) => { const o = Object.assign({}, st); if (at) o[at] += 25; return o; },
      apply(ctx, act) { const e = ctx.entry(act.pid), a = e.attr; e.betLoss = true; ctx.addMod(e, act.pid, 'Aposta', x => { x.stats[a] += 25; }); ctx.say(`${nm(ctx, act.pid)} aposta alto (+25).`); },
      ai(ctx, pid) { return ctx.flipChance(pid, 25) * 0.8; },
    });
    N('AE-152', 'Fúria', 'Sua carta recebe +30 em Força e −15 em Resistência nesta disputa.', 'Bônus', {
      fx: st => Object.assign({}, st, { pod: st.pod + 30, def: Math.max(0, st.def - 15) }),
      apply(ctx, act) { const e = ctx.entry(act.pid); ctx.addMod(e, act.pid, 'Fúria', x => { x.stats.pod += 30; x.stats.def = Math.max(0, x.stats.def - 15); }); ctx.say(`${nm(ctx, act.pid)} entra em fúria.`); },
      ai(ctx, pid) { const e = ctx.entry(pid); return e.attr === 'pod' ? ctx.flipChance(pid, 30) : e.attr === 'def' ? 0.02 : 0.04; },
    });
    N('AE-153', 'Inversão do rival', 'Na carta de combate de um rival, o maior e o menor atributo trocam de valor.', 'Conversão', {
      can: ctx => ctx.entries().some(e => e.pid >= 0),
      async apply(ctx, act) {
        const cand = ctx.entries().filter(e => e.pid !== act.pid && !ctx.sameTeam(e.pid, act.pid)).map(e => e.pid); const t = await ctx.target(act.pid, cand, 'Inverter a carta de quem?', c => c.slice().sort((a, b) => { const x = ctx.entry(a), y = ctx.entry(b); return (y.stats[y.attr] - y.stats[weakest(y.stats)]) - (x.stats[x.attr] - x.stats[weakest(x.stats)]); })[0]); if (t == null) return;
        const te = ctx.entry(t); ctx.addMod(te, act.pid, 'Inversão', x => { const hi = strongest(x.stats), lo = weakest(x.stats); const v = x.stats[hi]; x.stats[hi] = x.stats[lo]; x.stats[lo] = v; }); ctx.say(`${nm(ctx, act.pid)} inverte o maior e o menor atributo de ${nm(ctx, t)}.`);
      },
      ai(ctx, pid) { return ctx.entries().some(e => e.pid !== pid && !ctx.sameTeam(e.pid, pid) && e.attr === strongest(e.stats) && e.stats[e.attr] - e.stats[weakest(e.stats)] >= 30) ? 0.65 : 0.12; }, prep: 0.5, val: 0.6,
    });
    N('AE-154', 'Reciclagem', 'O maior atributo da sua carta perde 10 e os outros três ganham 6 nesta disputa.', 'Conversão', {
      fx: st => { const hi = strongest(st), o = {}; AID.forEach(a => { o[a] = a === hi ? st[a] - 10 : st[a] + 6; }); return o; },
      apply(ctx, act) { const e = ctx.entry(act.pid); ctx.addMod(e, act.pid, 'Reciclagem', x => { const hi = strongest(x.stats); AID.forEach(a => { x.stats[a] += a === hi ? -10 : 6; }); }); ctx.say(`${nm(ctx, act.pid)} recicla a carta.`); },
      ai(ctx, pid) { const e = ctx.entry(pid); return e.attr === strongest(e.stats) ? 0.03 : ctx.flipChance(pid, 6); },
    });
    N('AE-155', 'Atributo vetado', 'O melhor atributo da carta de combate de um rival não pode ser escolhido por ele nesta disputa.', 'Controle', {
      phase: 'ctrl',
      async apply(ctx, act) {
        const t = await ctx.target(act.pid, ctx.opps(act.pid), 'De quem vetar o melhor atributo?', c => c.find(o => ctx.foe(act.pid, o)) ?? c[0]); if (t == null) return;
        const te = ctx.entry(t), c = ctx.foe(act.pid, t) || (te && te.card); if (!te) return;
        const st = te.stats, hi = strongest(st); const per = ctx.combat.ctl.per[t] || (ctx.combat.ctl.per[t] = {}); (per.banAttr = per.banAttr || []).push(hi); ctx.say(`${nm(ctx, t)} não pode usar ${ATTR[hi].nome}.`);
      },
      ai(ctx, pid) { return ctx.opps(pid).some(o => ctx.foe(pid, o)) ? 0.7 : 0.3; }, val: 0.6,
    });
    N('AE-156', 'Sorteio viciado', 'Um atributo é sorteado e sua carta recebe +15 nele nesta disputa.', 'Controle', {
      apply(ctx, act) { const a = AID[Math.floor(ctx.rand() * 4)], e = ctx.entry(act.pid); ctx.addMod(e, act.pid, 'Sorteio viciado', x => { x.stats[a] += 15; }); ctx.say(`${nm(ctx, act.pid)} sorteia ${ATTR[a].nome}: +15.`); },
      ai(ctx, pid) { return 0.3 * ctx.flipChance(pid, 15) + 0.05; },
    });
    N('AE-157', 'Silêncio de Força', 'A Força de todas as cartas em combate perde 10 nesta disputa.', 'Controle', {
      apply(ctx, act) { for (const e of ctx.entries()) ctx.addMod(e, act.pid, 'Silêncio de Força', x => { x.stats.pod = Math.max(0, x.stats.pod - 10); }); ctx.say('A Força de todos cai 10.'); },
      ai(ctx, pid) { const me = ctx.entry(pid); if (me.attr === 'pod') return 0.02; const o = ctx.entries().filter(e => e.pid !== pid && !ctx.sameTeam(e.pid, pid)); return o.some(e => e.attr === 'pod') ? 0.5 : 0.05; },
    });
    N('AE-158', 'Mesa dos vizinhos (direita)', 'Só você e o jogador à direita disputam; as demais cartas saem da disputa e voltam ao fim dos baralhos.', 'Controle', {
      can: (ctx, pid) => ctx.entries().length >= 3 && ctx.right(pid) != null,
      apply(ctx, act) { const r = ctx.right(act.pid); for (const e of ctx.entries()) if (e.pid !== act.pid && e.pid !== r) e.withdrawn = true; ctx.say(`${nm(ctx, act.pid)} chama só ${nm(ctx, r)} para a mesa.`); },
      ai(ctx, pid) { const r = ctx.right(pid), me = ctx.entry(pid), re = ctx.entry(r); if (!me || !re) return 0; return ctx.isLosing(pid) && ctx.entries().length >= 3 ? 0.6 : 0.1; },
    });
    N('AE-159', 'Mesa dos vizinhos (esquerda)', 'Só você e o jogador à esquerda disputam; as demais cartas saem da disputa e voltam ao fim dos baralhos.', 'Controle', {
      can: (ctx, pid) => ctx.entries().length >= 3 && ctx.left(pid) != null,
      apply(ctx, act) { const r = ctx.left(act.pid); for (const e of ctx.entries()) if (e.pid !== act.pid && e.pid !== r) e.withdrawn = true; ctx.say(`${nm(ctx, act.pid)} chama só ${nm(ctx, r)} para a mesa.`); },
      ai(ctx, pid) { return ctx.isLosing(pid) && ctx.entries().length >= 3 ? 0.6 : 0.1; },
    });
    N('AE-160', 'Pular a rodada', 'Você não participa desta disputa: sua carta volta ao fim do baralho. Com 2 jogadores, a carta do rival também vai ao fim do baralho dele, como empate.', 'Controle', {
      can: ctx => ctx.entries().length >= 2,
      apply(ctx, act) { const es = ctx.entries(); ctx.entry(act.pid).withdrawn = true; if (es.length <= 2) es.forEach(e => { e.withdrawn = true; }); ctx.say(`${nm(ctx, act.pid)} pula esta disputa.`); },
      ai(ctx, pid) { return ctx.isLosing(pid) ? 0.7 : 0.03; },
    });
    // ---- lote 2: roubo, defesa, Buraco Negro ----
    const withDeck = (ctx, pid) => ctx.opps(pid).filter(o => ctx.player(o).deck.length > 0);
    N('AE-161', 'Furto do líder', 'Pegue a carta do topo do baralho do jogador que tem mais cartas.', 'Roubo', {
      can: (ctx, pid) => withDeck(ctx, pid).length > 0,
      async apply(ctx, act) {
        const cand = withDeck(ctx, act.pid); if (!cand.length) return ctx.say('Sem alvo: o furto falha.');
        let t = richest(ctx, cand); t = await ctx.hit(act.pid, t); if (t == null) return;
        const got = await ctx.take(act.pid, t, 'deck', () => [0]); if (got.length) ctx.say(`${nm(ctx, act.pid)} furta a carta do topo de ${nm(ctx, t)}, o líder.`);
      },
      ai: () => 0.7,
    });
    N('AE-162', 'Taxa do vencedor', 'Pegue 1 carta aleatória do baralho ativo de quem venceu a disputa anterior.', 'Roubo', {
      can(ctx, pid) { const r = ctx.g.s.lastRes; return !!r && r.winner != null && r.winner !== pid && !ctx.sameTeam(r.winner, pid) && ctx.player(r.winner).alive !== false && ctx.player(r.winner).deck.length > 0; },
      async apply(ctx, act) {
        let t = ctx.g.s.lastRes.winner; t = await ctx.hit(act.pid, t); if (t == null) return;
        const got = await ctx.take(act.pid, t, 'deck', ctx.rndIdx(1)); if (got.length) ctx.say(`${nm(ctx, act.pid)} cobra a taxa de ${nm(ctx, t)}, vencedor da disputa anterior.`);
      },
      ai: () => 0.65,
    });
    N('AE-163', 'Mão leve', 'Pegue 1 carta aleatória da reserva de um rival, sem ver qual.', 'Roubo', {
      can: (ctx, pid) => ctx.opps(pid).some(o => ctx.player(o).reserve.length > 0),
      async apply(ctx, act) {
        const cand = ctx.opps(act.pid).filter(o => ctx.player(o).reserve.length > 0); if (!cand.length) return ctx.say('Sem reserva para tomar.');
        const t = await ctx.target(act.pid, cand, 'Passar a mão na reserva de quem?', c => c.slice().sort((a, b) => ctx.player(b).reserve.length - ctx.player(a).reserve.length)[0]); if (t == null) return;
        const got = await ctx.take(act.pid, t, 'reserve', ctx.rndIdx(1)); if (got.length) ctx.say(`${nm(ctx, act.pid)} surrupia uma carta da reserva de ${nm(ctx, t)}.`);
      },
      ai: () => 0.6,
    });
    N('AE-164', 'Troca justa', 'Troque 1 carta do seu baralho ativo (à sua escolha) por 1 carta aleatória do baralho do jogador que tem mais cartas.', 'Roubo', {
      can: (ctx, pid) => ctx.player(pid).deck.length > 0 && withDeck(ctx, pid).length > 0,
      async apply(ctx, act) {
        const cand = withDeck(ctx, act.pid), mine = ctx.player(act.pid).deck; if (!cand.length || !mine.length) return ctx.say('Sem troca possível.');
        let t = richest(ctx, cand); t = await ctx.hit(act.pid, t); if (t == null) return;
        if (await ctx.blocked(act.pid, t, 'deck', 1, 'steal')) return;
        const td = ctx.player(t).deck; if (!td.length) return;
        const [give] = await ctx.askCards(act.pid, { title: `Troca justa: qual carta sua vai a ${nm(ctx, t)}?`, cards: mine.slice(), min: 1, max: 1 }, () => lowest(mine, 1));
        const i = Math.floor(ctx.rand() * td.length), [got] = td.splice(i, 1); mine.splice(mine.indexOf(give), 1); td.push(give); mine.push(got);
        ctx.say(`${nm(ctx, act.pid)} troca uma carta com ${nm(ctx, t)}.`); await ctx.emit('steal', { from: t, to: act.pid, card: got }); await ctx.emit('steal', { from: act.pid, to: t, card: give });
      },
      ai: () => 0.4, val: 0.5,
    });
    N('AE-165', 'Fortaleza', 'Sua carta de combate fica imune a reduções vindas de outros jogadores nesta disputa.', 'Defesa', {
      apply(ctx, act) { const e = ctx.entry(act.pid); e.fortress = true; ctx.recalc(e); ctx.say(`${nm(ctx, act.pid)} ergue uma fortaleza: sem reduções.`); },
      ai(ctx, pid) { return ctx.g.foeActs && ctx.combat.react ? (ctx.g.foeActs(ctx.combat, pid).some(a => SP[CARDS[a.card].especial].cat === 'Redução') ? 0.9 : 0.1) : 0.15 + 0.3 * oppFlip(ctx, pid); }, val: 0.4,
    });
    N('AE-166', 'Armadilha', 'Se alguém capturar sua carta nesta disputa, perde a carta do topo do próprio baralho para o Buraco Negro.', 'Defesa', {
      apply(ctx, act) { ctx.entry(act.pid).trap = true; ctx.say(`${nm(ctx, act.pid)} arma uma armadilha na própria carta.`); },
      ai(ctx, pid) { const w = winnerOf(ctx); return w && w.pid !== pid && !ctx.sameTeam(w.pid, pid) && ATTR[w.attr].tipo === 'ataque' ? 0.6 : 0.05; },
    });
    N('AE-167', 'Eco protetor', 'Se sua carta fosse capturada nesta disputa, ela volta ao fundo do seu baralho.', 'Defesa', {
      apply(ctx, act) { ctx.entry(act.pid).echoProt = true; ctx.say(`${nm(ctx, act.pid)} cerca a carta de eco protetor.`); },
      ai(ctx, pid) { const w = winnerOf(ctx); return w && w.pid !== pid && !ctx.sameTeam(w.pid, pid) && ATTR[w.attr].tipo === 'ataque' ? 0.75 : 0.05; },
    });
    N('AE-168', 'Casca grossa', 'Se algum rival usa atributo de ataque, sua carta recebe +15 em Resistência nesta disputa.', 'Defesa', {
      fx: (st, at) => Object.assign({}, st, { def: st.def + 15 }),
      apply(ctx, act) { const e = ctx.entry(act.pid); if (!ctx.entries().some(x => x.pid !== act.pid && !ctx.sameTeam(x.pid, act.pid) && x.attr && ATTR[x.attr].tipo === 'ataque')) return ctx.say('Nenhum rival ataca: a casca fica sem efeito.'); ctx.addMod(e, act.pid, 'Casca grossa', x => { x.stats.def += 15; }); ctx.say(`${nm(ctx, act.pid)} endurece a casca (+15 Resistência).`); },
      ai(ctx, pid) { const e = ctx.entry(pid); return e.attr === 'def' && ctx.entries().some(x => x.pid !== pid && x.attr && ATTR[x.attr].tipo === 'ataque') ? ctx.flipChance(pid, 15) : 0.03; },
    });
    N('AE-169', 'Retirada', 'Devolva sua carta de combate ao topo do baralho e jogue a próxima no lugar; você escolhe se vale o ataque ou a defesa do par do atributo.', 'Defesa', {
      can: (ctx, pid) => ctx.player(pid).deck.length >= 1,
      async apply(ctx, act) {
        const p = ctx.player(act.pid), e = ctx.entry(act.pid); if (!p.deck.length) return ctx.say('Sem carta para entrar no lugar.');
        const nova = p.deck.shift(), velha = ctx.swapEntryCard(e, nova); p.deck.unshift(velha);
        const par = ATTR[e.attr].par, opts = AID.filter(a => ATTR[a].par === par);
        const a = await ctx.askAttr(act.pid, { title: `Retirada: ${CARDS[nova].nome} entra. Ataque ou defesa?`, options: opts }, () => opts.slice().sort((x, y) => e.stats[y] - e.stats[x])[0]);
        e.attr = a; ctx.recalc(e); ctx.say(`${nm(ctx, act.pid)} recua e joga outra carta em ${ATTR[a].nome}.`); await ctx.emit('extra', { pid: act.pid, card: nova });
      },
      ai(ctx, pid) { const p = ctx.player(pid); return ctx.isLosing(pid) && p.deck.length ? 0.55 : 0.04; },
    });
    N('AE-170', 'Ressonância', 'Traga do Buraco Negro as 2 cartas normais de maior valor no atributo desta disputa, para o fim do seu baralho.', 'Buraco Negro', {
      can: ctx => ctx.bhNormal().length > 0,
      async apply(ctx, act) {
        const a = ctx.entry(act.pid).attr; const l = ctx.bhNormal().sort((x, y) => CARDS[y].stats[a] - CARDS[x].stats[a]).slice(0, 2);
        for (const c of l) { ctx.fromBH(c); ctx.player(act.pid).deck.push(c); await ctx.emit('rescue', { pid: act.pid, card: c }); }
        ctx.say(`${nm(ctx, act.pid)} ressoa com o Buraco Negro em ${ATTR[a].nome}.`);
      },
      ai(ctx, pid, c) { const l = ctx.bhNormal(); if (!l.length) return 0; return gainU(Math.min(2, l.length) * bhAvg(ctx) - costC(c)); },
    });
    N('AE-171', 'Oferenda', 'Mande 1 carta da sua reserva ao Buraco Negro e traga 2 cartas normais de lá para o fim do seu baralho.', 'Buraco Negro', {
      can: (ctx, pid) => ctx.player(pid).reserve.length > 0 && ctx.bhNormal().length > 0,
      async apply(ctx, act) {
        const p = ctx.player(act.pid); if (!p.reserve.length) return ctx.say('Sem carta na reserva para ofertar.');
        const [off] = await ctx.askCards(act.pid, { title: 'Oferenda: qual carta da reserva vai ao Buraco Negro?', cards: p.reserve.slice(), min: 1, max: 1 }, () => lowest(p.reserve, 1));
        p.reserve.splice(p.reserve.indexOf(off), 1); const pool = ctx.bhNormal(); ctx.toBH(off, 'normal'); await ctx.emit('discard', { pid: act.pid, card: off });
        const n = Math.min(2, pool.length); if (!n) return;
        const got = await ctx.askCards(act.pid, { title: 'Oferenda: traga 2 cartas do Buraco Negro', cards: pool, min: n, max: n }, () => highest(pool, n));
        for (const c of got) { ctx.fromBH(c); p.deck.push(c); await ctx.emit('rescue', { pid: act.pid, card: c }); }
        ctx.say(`${nm(ctx, act.pid)} faz uma oferenda e recebe ${got.length} cartas.`);
      },
      ai(ctx, pid, c) { const p = ctx.player(pid), l = ctx.bhNormal(); if (!l.length || !p.reserve.length) return 0; return gainU(2 * bhAvg(ctx) - avgSum(lowest(p.reserve, 1)) - costC(c)); },
    });
    N('AE-172', 'Colapso', 'A carta do topo do baralho ativo de um rival vai ao Buraco Negro, sem disputa.', 'Buraco Negro', {
      can: (ctx, pid) => withDeck(ctx, pid).length > 0,
      async apply(ctx, act) {
        const cand = withDeck(ctx, act.pid); if (!cand.length) return ctx.say('Sem alvo para o colapso.');
        const t = await ctx.target(act.pid, cand, 'Colapsar o topo do baralho de quem?', c => c.slice().sort((a, b) => ctx.player(b).deck.length - ctx.player(a).deck.length)[0]); if (t == null) return;
        if (await ctx.blocked(act.pid, t, 'deck', 1, 'discard')) return;
        const c = ctx.player(t).deck.shift(); ctx.toBH(c, 'normal'); ctx.say(`${nm(ctx, act.pid)} faz a carta do topo de ${nm(ctx, t)} colapsar no Buraco Negro.`); await ctx.emit('discard', { pid: t, card: c });
      },
      ai: () => 0.55,
    });
    // ---- lote 3: informação, interação, captura, troca, tempo, misto ----
    N('AE-173', 'Marca', 'A próxima carta de um rival (a do topo do baralho dele) entra na próxima disputa com −10 em todos os atributos.', 'Informação', {
      can: (ctx, pid) => withDeck(ctx, pid).length > 0,
      async apply(ctx, act) {
        const cand = withDeck(ctx, act.pid); if (!cand.length) return;
        const t = await ctx.target(act.pid, cand, 'Marcar a próxima carta de quem?', c => c.slice().sort((a, b) => ctx.player(b).deck.length - ctx.player(a).deck.length)[0]); if (t == null) return;
        const c = ctx.player(t).deck[0]; (ctx.g.s.marks || (ctx.g.s.marks = [])).push({ card: c, v: -10, src: act.pid }); ctx.say(`${nm(ctx, act.pid)} marca a próxima carta de ${nm(ctx, t)} (−10).`);
      },
      ai: () => 0.5,
    });
    N('AE-174', 'Rastreio', 'Veja a reserva de um rival.', 'Informação', {
      can: (ctx, pid) => ctx.opps(pid).some(o => ctx.player(o).reserve.length > 0),
      async apply(ctx, act) {
        const cand = ctx.opps(act.pid).filter(o => ctx.player(o).reserve.length > 0); const t = await ctx.target(act.pid, cand, 'Rastrear a reserva de quem?'); if (t == null) return;
        await ctx.emit('peek', { pid: act.pid, target: t, cards: ctx.player(t).reserve.slice(), title: 'Rastreio', hint: `Reserva de ${nm(ctx, t)}.` }); ctx.say(`${nm(ctx, act.pid)} rastreia a reserva de ${nm(ctx, t)}.`);
      },
      ai: () => 0.1, prep: 0.2, val: 0.2,
    });
    N('AE-175', 'Espiar especiais', 'Veja os especiais preparados de todos os rivais (eles continuam preparados).', 'Informação', {
      can: (ctx, pid) => ctx.opps(pid).some(o => ctx.player(o).prepared.length > 0),
      async apply(ctx, act) {
        for (const t of ctx.opps(act.pid)) { const cs = ctx.player(t).prepared.slice(0, 2); if (!cs.length) continue; await ctx.emit('peek', { pid: act.pid, target: t, cards: cs, title: 'Especiais espiados', hint: `Especiais preparados de ${nm(ctx, t)}.` }); ctx.learn(act.pid, t, cs, 'prep'); }
        ctx.say(`${nm(ctx, act.pid)} espia os especiais preparados dos rivais.`);
      },
      ai: (ctx, pid) => ctx.opps(pid).some(o => ctx.player(o).prepared.length > 0) ? 0.4 : 0.04, prep: 0.4, val: 0.4,
    });
    N('AE-176', 'Roubo de preparo', 'Pegue 1 carta preparada (com especial ainda fechado) de um rival e ponha-a no fim do seu baralho.', 'Interação', {
      can: (ctx, pid) => ctx.opps(pid).some(o => ctx.player(o).prepared.length > 0),
      async apply(ctx, act) {
        const cand = ctx.opps(act.pid).filter(o => ctx.player(o).prepared.length > 0); const t = await ctx.target(act.pid, cand, 'Roubar a carta preparada de quem?'); if (t == null) return;
        if (await ctx.blocked(act.pid, t, 'deck', 1, 'steal')) return;
        const pr = ctx.player(t).prepared; if (!pr.length) return; const [c] = pr.splice(Math.floor(ctx.rand() * pr.length), 1); ctx.player(act.pid).deck.push(c);
        ctx.g.s.caps[act.pid] = (ctx.g.s.caps[act.pid] || 0) + 1; ctx.say(`${nm(ctx, act.pid)} rouba uma carta preparada de ${nm(ctx, t)}.`); await ctx.emit('steal', { from: t, to: act.pid, card: c });
      },
      ai: (ctx, pid) => ctx.opps(pid).some(o => ctx.player(o).prepared.length > 0) ? 0.5 : 0.04,
    });
    N('AE-177', 'Atraso', 'Ninguém pode usar habilidades especiais nesta disputa.', 'Interação', {
      phase: 'ctrl',
      apply(ctx, act) { ctx.combat.noSpecials = true; ctx.say('Atraso: nenhuma habilidade será usada nesta disputa.'); },
      ai(ctx, pid) { return 0.25 + 0.4 * oppFlip(ctx, pid); }, val: 0.5,
    });
    N('AE-178', 'Dividir o butim', 'O jogador com mais cartas entrega 3 cartas aleatórias do baralho ao jogador com menos cartas (podendo ser você). Em empate numérico, você pega 2 e o rival com mais cartas dá 1 ao outro.', 'Troca', {
      can: ctx => ctx.alive().length >= 2,
      async apply(ctx, act) {
        const al = ctx.alive(), tot = q => ctx.g.totalCards(ctx.player(q)); const mx = Math.max(...al.map(tot)), mn = Math.min(...al.map(tot));
        const give = async (from, to, n) => { for (let i = 0; i < n; i++) { const d = ctx.player(from).deck; if (!d.length) break; if (await ctx.blocked(act.pid, from, 'deck', 1, 'steal')) break; const [c] = d.splice(Math.floor(ctx.rand() * d.length), 1); ctx.player(to).deck.push(c); await ctx.emit('steal', { from, to, card: c }); } };
        if (mx === mn) { const o = richest(ctx, ctx.opps(act.pid).filter(q => ctx.player(q).deck.length)); if (o == null) return; const rest = ctx.opps(act.pid).filter(q => q !== o)[0]; await give(o, act.pid, 2); if (rest != null) await give(o, rest, 1); else await give(o, act.pid, 1); ctx.say('Empate numérico: o butim é dividido.'); return; }
        const strong = al.filter(q => tot(q) === mx)[0], weak = al.filter(q => tot(q) === mn && q !== strong)[0]; if (strong == null || weak == null) return;
        await give(strong, weak, 3); ctx.say(`${nm(ctx, strong)} entrega 3 cartas a ${nm(ctx, weak)}.`);
      },
      ai(ctx, pid) { const al = ctx.alive(), tot = q => ctx.g.totalCards(ctx.player(q)); const mx = Math.max(...al.map(tot)), mn = Math.min(...al.map(tot)); return tot(pid) === mn && mx > mn ? 0.85 : tot(pid) === mx && mx > mn ? 0.02 : 0.15; }, val: 0.6,
    });
    N('AE-179', 'Contragolpe', 'Se sua carta for capturada nesta disputa, você captura a carta do topo do baralho do vencedor.', 'Captura', {
      apply(ctx, act) { ctx.entry(act.pid).counter = true; ctx.say(`${nm(ctx, act.pid)} prepara um contragolpe.`); },
      ai(ctx, pid) { const w = winnerOf(ctx); return w && w.pid !== pid && !ctx.sameTeam(w.pid, pid) && ATTR[w.attr].tipo === 'ataque' ? 0.7 : 0.05; },
    });
    N('AE-180', 'Margem larga', 'Se você vencer por 30 pontos ou mais, captura (ataque) ou manda ao Buraco Negro (defesa) mais 1 carta do topo de um derrotado.', 'Captura', {
      apply(ctx, act) { ctx.entry(act.pid).wideMargin = true; ctx.say(`${nm(ctx, act.pid)} mira uma margem larga.`); },
      ai(ctx, pid) { const w = winnerOf(ctx); return w && w.pid === pid ? 0.5 : 0.08; },
    });
    N('AE-181', 'Embaralhar reservas', 'Cada jogador fica com 4 cartas no baralho ativo; as que passam de 4 vão à reserva, que é embaralhada (quem tem menos de 4 completa pela reserva).', 'Troca', {
      can: ctx => ctx.alive().length >= 2,
      async apply(ctx, act) {
        for (const q of ctx.alive()) { const p = ctx.player(q); let pool = p.reserve.slice(); if (p.deck.length > 4) pool.push(...p.deck.splice(4)); for (let i = pool.length - 1; i > 0; i--) { const k = Math.floor(ctx.rand() * (i + 1)); [pool[i], pool[k]] = [pool[k], pool[i]]; } while (p.deck.length < 4 && pool.length) p.deck.push(pool.shift()); p.reserve = pool; await ctx.emit('reorder', { pid: q }); }
        ctx.say(`${nm(ctx, act.pid)} embaralha as reservas: todos ficam com 4 cartas ativas.`);
      },
      ai: (ctx, pid) => { const p = ctx.player(pid); return p.deck.length > 4 ? 0.1 : p.deck.length < 4 && p.reserve.length ? 0.45 : 0.1; }, val: 0.3,
    });
    N('AE-182', 'Pausa', 'Um rival pula a vez na próxima disputa: a carta dele não entra e vai ao fim do baralho.', 'Tempo', {
      can: (ctx, pid) => ctx.opps(pid).length > 0,
      async apply(ctx, act) {
        const t = await ctx.target(act.pid, ctx.opps(act.pid), 'Quem pula a próxima disputa?', c => c.slice().sort((a, b) => ctx.player(b).deck.length - ctx.player(a).deck.length)[0]); if (t == null) return;
        (ctx.g.s.skip || (ctx.g.s.skip = new Set())).add(t); ctx.say(`${nm(ctx, t)} pulará a próxima disputa.`);
      },
      ai: () => 0.45,
    });
    const evIds = ctx => Object.keys(api.EVENTOS || {});
    N('AE-183', 'Convocar fenômeno', 'Um fenômeno aleatório acontece na próxima rodada.', 'Tempo', {
      can: ctx => !!ctx.g.s.events,
      apply(ctx, act) {
        const g = ctx.g, ids = evIds(ctx).filter(i => i !== 'buraco' || ctx.alive().length > 1); const id = ids[Math.floor(ctx.rand() * ids.length)]; const o = { id }; if (id === 'troca') o.pair = ['pod', 'int'];
        g.s.events[g.s.round + 1] = o; ctx.say(`${nm(ctx, act.pid)} convoca um fenômeno para a próxima rodada: ${(api.EVENTOS[id] || {}).nome}.`);
      },
      ai: () => 0.3,
    });
    N('AE-184', 'Cancelar fenômeno', 'Anula os efeitos do fenômeno nesta disputa.', 'Tempo', {
      phase: 'ctrl',
      can: ctx => !!ctx.g.curEv() && !ctx.g.rg,
      apply(ctx, act) {
        const g = ctx.g; ctx.combat.noEv = true; ctx.combat.blocked = null; ctx.combat.eco = false;
        for (const e of ctx.combat.entries) { const eb = g.evBase(e.card, e.pid); e.base = Object.assign({}, eb.st); e.evm = eb.mark; for (const c of e.extra) e.extraStats[c] = g.evBase(c, e.pid).st; ctx.recalc(e); }
        ctx.say('O fenômeno é anulado nesta disputa.');
      },
      ai: () => 0.35,
    });
    N('AE-185', 'Escolher fenômeno', 'Veja 2 fenômenos sorteados e escolha qual acontece na próxima rodada.', 'Tempo', {
      can: ctx => !!ctx.g.s.events,
      async apply(ctx, act) {
        const g = ctx.g, ids = evIds(ctx).filter(i => i !== 'buraco' || ctx.alive().length > 1).sort(() => ctx.rand() - 0.5).slice(0, 2);
        const id = await ctx.askAttr(act.pid, { title: 'Escolha o fenômeno da próxima rodada', options: ids, names: ids.reduce((o, i) => (o[i] = api.EVENTOS[i], o), {}) }, () => ids[0]);
        const o = { id }; if (id === 'troca') o.pair = ['pod', 'int']; g.s.events[g.s.round + 1] = o; ctx.say(`${nm(ctx, act.pid)} escolhe o fenômeno: ${(api.EVENTOS[id] || {}).nome}.`);
      },
      ai: () => 0.3,
    });
    N('AE-186', 'Carta fantasma', 'Crie um clone da carta de combate de um rival com −10 em todos os atributos; o clone vai ao fim do seu baralho.', 'Misto', {
      can: ctx => ctx.entries().some(e => !String(e.card).includes('*')),
      async apply(ctx, act) {
        const cand = ctx.entries().filter(e => e.pid !== act.pid && !String(e.card).includes('*')).map(e => e.pid); const t = await ctx.target(act.pid, cand, 'Clonar a carta de quem?', c => c.slice().sort((a, b) => sum(ctx.entry(b).card) - sum(ctx.entry(a).card))[0]); if (t == null) return;
        const g = ctx.g, id = g.makeClone(ctx.entry(t).card, act.pid); const st = Object.assign({}, CARDS[id].stats); AID.forEach(a => { st[a] = Math.max(0, st[a] - 10); }); CARDS[id].stats = st;
        g.p(act.pid).deck.push(id); ctx.say(`${nm(ctx, act.pid)} cria uma carta fantasma de ${CARDS[CARDS[id].orig].nome} (−10).`); await ctx.emit('cloneMade', { pid: act.pid, from: t, card: ctx.entry(t).card, clone: id });
      },
      ai: () => 0.45,
    });
    N('AE-187', 'Sacrifício heroico', 'Descarte 1 carta da sua reserva no Buraco Negro: sua carta recebe +30 no atributo que está usando.', 'Misto', {
      fx: (st, at) => { const o = Object.assign({}, st); if (at) o[at] += 30; return o; },
      can: (ctx, pid) => ctx.player(pid).reserve.length > 0,
      async apply(ctx, act) {
        const p = ctx.player(act.pid); if (!p.reserve.length) return ctx.say('Sem carta na reserva para sacrificar.');
        const [c] = await ctx.askCards(act.pid, { title: 'Sacrifício heroico: qual carta da reserva vai ao Buraco Negro?', cards: p.reserve.slice(), min: 1, max: 1 }, () => lowest(p.reserve, 1));
        p.reserve.splice(p.reserve.indexOf(c), 1); ctx.toBH(c, 'normal'); await ctx.emit('discard', { pid: act.pid, card: c });
        const e = ctx.entry(act.pid), a = e.attr; ctx.addMod(e, act.pid, 'Sacrifício heroico', x => { x.stats[a] += 30; }); ctx.say(`${nm(ctx, act.pid)} sacrifica uma carta: +30.`);
      },
      ai(ctx, pid) { return ctx.flipChance(pid, 30) * 0.7; },
    });
    N('AE-188', 'Reflexo', 'Devolve ao rival a primeira redução que sua carta de combate receber nesta disputa.', 'Misto', {
      phase: 'shield',
      apply(ctx, act) { const e = ctx.entry(act.pid); e.reflect = true; ctx.recalc(e); ctx.say(`${nm(ctx, act.pid)} arma um reflexo.`); },
      ai(ctx, pid) { return 0.15 + 0.35 * oppFlip(ctx, pid); }, val: 0.4,
    });
    // ---- lote 4: pedidos novos de 02/11/2026 (embaralhar, anti-roubo, inversões, caos de atributos) ----
    const shuf = (ctx, d) => { for (let i = d.length - 1; i > 0; i--) { const k = Math.floor(ctx.rand() * (i + 1)); [d[i], d[k]] = [d[k], d[i]]; } };
    N('AE-189', 'Mistura pessoal', 'Embaralhe a ordem do baralho ativo de um jogador à sua escolha (você inclusive).', 'Interação', {
      can: ctx => ctx.alive().some(q => ctx.player(q).deck.length >= 2),
      async apply(ctx, act) {
        const cand = ctx.alive().filter(q => ctx.player(q).deck.length >= 2); const t = await ctx.pick(act.pid, cand, 'Embaralhar o baralho de quem?', c => c.find(o => o !== act.pid && ctx.foe(act.pid, o)) ?? c.find(o => o !== act.pid) ?? c[0]); if (t == null) return;
        if (t !== act.pid && await ctx.blocked(act.pid, t, 'deck', 1, 'discard')) return;
        shuf(ctx, ctx.player(t).deck); ctx.say(`${nm(ctx, act.pid)} embaralha o baralho de ${nm(ctx, t)}.`); await ctx.emit('reorder', { pid: t });
      },
      ai(ctx, pid) { return foeSeqs(ctx, pid).some(q => q.length >= 2 && avgSum(q) > avgSum(ctx.player(pid).deck)) ? 0.35 : 0.06; }, prep: 0.4, val: 0.4,
    });
    N('AE-190', 'Mistura geral', 'Embaralhe a ordem do baralho ativo de todos os jogadores (você inclusive); depois cada um reorganiza as próprias cartas como quiser.', 'Interação', {
      can: ctx => ctx.alive().some(q => ctx.player(q).deck.length >= 2),
      async apply(ctx, act) {
        for (const q of ctx.alive()) { const p = ctx.player(q); if (p.deck.length < 2) continue; shuf(ctx, p.deck); await ctx.emit('reorder', { pid: q }); }
        for (const q of ctx.order()) { const p = ctx.player(q), v = p.deck.slice(); if (v.length < 2) continue; const o = await ctx.askCards(q, { title: 'Mistura geral: reorganize seu baralho', hint: 'A 1ª carta será a primeira a entrar em disputa.', cards: v, min: v.length, max: v.length, ordered: true }, () => orderVs(ctx, q, v)); p.deck.splice(0, v.length, ...o); await ctx.emit('reorder', { pid: q }); }
        ctx.say(`${nm(ctx, act.pid)} embaralha todos os baralhos; cada um reorganiza o seu.`);
      },
      ai(ctx, pid) { return 0.3; }, prep: 0.4, val: 0.4,
    });
    const guardSpec = (id, nome, texto, dk, rs) => N(id, nome, texto, 'Defesa', {
      phase: 'guard',
      apply(ctx, act) { const d = ctx.def(act.pid); d.guardDeck += dk; d.guardRes += rs; ctx.say(`${nm(ctx, act.pid)} ergue uma barreira contra roubos.`); },
      ai(ctx, pid) { return 0.15 + 0.45 * oppFlip(ctx, pid); }, val: 0.4,
    });
    guardSpec('AE-191', 'Cofre do baralho', 'Anula as 2 próximas tentativas de tomar cartas do seu baralho ativo nesta disputa.', 2, 0);
    guardSpec('AE-192', 'Cofre da reserva', 'Anula as 2 próximas tentativas de tomar cartas da sua reserva nesta disputa.', 0, 2);
    guardSpec('AE-193', 'Barreira total', 'Anula a próxima tentativa de tomar cartas do seu baralho e a próxima de tomar da sua reserva nesta disputa.', 1, 1);
    const invSpec = (id, nome, a, b) => N(id, nome, `${ATTR[a].nome} e ${ATTR[b].nome} da carta de combate de um rival trocam de valor nesta disputa.`, 'Conversão', {
      can: ctx => ctx.entries().length >= 2,
      async apply(ctx, act) {
        const cand = ctx.entries().filter(e => e.pid !== act.pid && !ctx.sameTeam(e.pid, act.pid)).map(e => e.pid); const t = await ctx.target(act.pid, cand, 'Inverter a carta de quem?', c => c.slice().sort((x, y) => Math.abs(ctx.entry(y).stats[a] - ctx.entry(y).stats[b]) - Math.abs(ctx.entry(x).stats[a] - ctx.entry(x).stats[b]))[0]); if (t == null) return;
        ctx.addMod(ctx.entry(t), act.pid, 'Inversão', x => { const v = x.stats[a]; x.stats[a] = x.stats[b]; x.stats[b] = v; }); ctx.say(`${nm(ctx, act.pid)} troca ${ATTR[a].nome} e ${ATTR[b].nome} de ${nm(ctx, t)}.`);
      },
      ai(ctx, pid) { return ctx.entries().some(e => e.pid !== pid && !ctx.sameTeam(e.pid, pid) && e.attr && (e.attr === a || e.attr === b) && Math.abs(e.stats[a] - e.stats[b]) >= 25) ? 0.65 : 0.05; },
    });
    invSpec('AE-194', 'Ataque invertido', 'pod', 'def'); invSpec('AE-195', 'Mente invertida', 'int', 'vel');
    N('AE-196', 'Caos de atributos', 'Os quatro atributos de cada carta em combate são embaralhados ao acaso antes de os jogadores escolherem.', 'Controle', {
      phase: 'ctrl',
      apply(ctx, act) {
        for (const e of ctx.entries()) { const perm = AID.slice(); shuf(ctx, perm); ctx.addMod(e, act.pid, 'Caos', x => { const o = Object.assign({}, x.stats); AID.forEach((k, i) => { x.stats[k] = o[perm[i]]; }); }); }
        ctx.say('Os atributos de todas as cartas foram embaralhados!');
      },
      ai(ctx, pid) { return 0.25; }, val: 0.3,
    });
    N('AE-197', 'Troca do destino', 'No fim da disputa, antes do vencedor, as cartas de dois jogadores sorteados (você pode estar entre eles) trocam todos os valores de atributo.', 'Troca', {
      phase: 'late',
      can: ctx => ctx.entries().length >= 2,
      apply(ctx, act) {
        const es = ctx.entries().slice(); shuf(ctx, es); const [e1, e2] = es, s1 = Object.assign({}, e1.stats), s2 = Object.assign({}, e2.stats);
        ctx.addMod(e1, act.pid, 'Destino', x => { AID.forEach(k => { x.stats[k] = s2[k]; }); }); ctx.addMod(e2, act.pid, 'Destino', x => { AID.forEach(k => { x.stats[k] = s1[k]; }); });
        ctx.say(`O destino troca as cartas de ${nm(ctx, e1.pid)} e ${nm(ctx, e2.pid)}.`);
      },
      ai(ctx, pid) { return ctx.isLosing(pid) ? 0.5 : 0.08; },
    });
    N('AE-198', 'Virada de tipo', 'Os valores de ataque/defesa e de inteligência/velocidade da sua carta trocam de lugar: Força ↔ Inteligência e Resistência ↔ Velocidade.', 'Conversão', {
      fx: st => ({ pod: st.int, int: st.pod, def: st.vel, vel: st.def }),
      apply(ctx, act) { const e = ctx.entry(act.pid); ctx.addMod(e, act.pid, 'Permuta', x => { const o = Object.assign({}, x.stats); x.stats.pod = o.int; x.stats.int = o.pod; x.stats.def = o.vel; x.stats.vel = o.def; }); ctx.say(`${nm(ctx, act.pid)} vira o tipo da carta.`); },
      ai(ctx, pid) { const e = ctx.entry(pid); const o = { pod: 'int', int: 'pod', def: 'vel', vel: 'def' }[e.attr]; const d = e.stats[o] - e.stats[e.attr]; return d <= 0 ? 0.02 : ctx.flipChance(pid, d); },
    });
    N('AE-199', 'Troca de reservas', 'Troque cartas da sua reserva pelas da reserva de outro jogador: a quantidade é a da menor reserva dos dois e as cartas que vão e vêm são aleatórias.', 'Troca', {
      can: (ctx, pid) => ctx.player(pid).reserve.length > 0 && ctx.opps(pid).some(o => ctx.player(o).reserve.length > 0),
      async apply(ctx, act) {
        const cand = ctx.opps(act.pid).filter(o => ctx.player(o).reserve.length > 0); if (!cand.length || !ctx.player(act.pid).reserve.length) return ctx.say('Sem reserva para trocar.');
        const t = await ctx.target(act.pid, cand, 'Trocar a reserva com quem?', c => c.slice().sort((a, b) => avgSum(ctx.player(b).reserve) - avgSum(ctx.player(a).reserve))[0]); if (t == null) return;
        if (await ctx.blocked(act.pid, t, 'reserve', 1, 'steal')) return;
        const mine = ctx.player(act.pid).reserve, theirs = ctx.player(t).reserve, n = Math.min(mine.length, theirs.length); if (!n) return;
        const pick = (l, k) => { const out = []; for (let i = 0; i < k; i++) out.push(l.splice(Math.floor(ctx.rand() * l.length), 1)[0]); return out; };
        const give = pick(mine, n), get = pick(theirs, n); mine.push(...get); theirs.push(...give);
        ctx.say(`${nm(ctx, act.pid)} troca ${n} carta${n > 1 ? 's' : ''} da reserva com ${nm(ctx, t)}.`);
        for (const c of get) await ctx.emit('steal', { from: t, to: act.pid, card: c, zone: 'reserve', dzone: 'reserve' }); for (const c of give) await ctx.emit('steal', { from: act.pid, to: t, card: c, zone: 'reserve', dzone: 'reserve' });
      },
      ai(ctx, pid) { const mine = ctx.player(pid).reserve; return ctx.opps(pid).some(o => ctx.player(o).reserve.length && avgSum(ctx.player(o).reserve) > avgSum(mine) + 5) ? 0.45 : 0.1; }, val: 0.4,
    });
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = install; else root.DS_ESPECIAIS = install;
})(typeof window !== 'undefined' ? window : globalThis);
