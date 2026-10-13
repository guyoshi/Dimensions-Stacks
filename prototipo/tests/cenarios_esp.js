// Cenários determinísticos: verifica o efeito real de especiais-chave (1 disputa com mãos montadas).
const E = require('../engine.js');
const ids = Object.keys(E.CARDS); let ci = 0;
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('  ✗', m); } else console.log('  ✓', m); };
const plain = (pod, def, int, vel) => { const c = ids[ci++]; E.CARDS[c].stats = { pod, def, int, vel }; E.CARDS[c].especial = 'AE-001'; return c; };
const sp = (ab, stats) => { const c = plain(...(stats || [50, 50, 50, 50])); E.CARDS[c].especial = ab; return c; };
async function run(title, o) {
  console.log(title); ci = 0;
  const n = o.players || 2; const players = [...Array(n)].map((_, i) => ({ name: 'P' + i, bot: true, avatar: i })); const logs = [];
  const flip = o.flip || {}; const attrs = o.attrs || {};
  class G extends E.Game {
    async bot_special(p, usable, combat, ctx, stage) { const f = flip[p.pid]; if (!f) return null; const c = usable.find(x => !this._done.has(x) && (f === true || f.includes(E.CARDS[x].especial))); if (c) this._done.add(c); return c || null; }
    async bot_attr(p, entry, options) { const w = attrs[p.pid]; return w && options.includes(w) ? w : options[0]; }
    async bot_pickAttr() { return null; }
    async bot_prepare() { return false; }
  }
  const g = new G({ players, perPlayer: 7, seed: 5, specialsFrom: 1, io: { notify: async () => {}, log: t => logs.push(t) } }); g._done = new Set();
  await g.setup(); g.s.initiator = 0;
  const st = o.setup(g); await g.playCombat(0); o.check(g, st, logs);
}
const D = (g, i, deck, prep, res) => { g.p(i).deck = deck; g.p(i).prepared = prep || []; g.p(i).reserve = res || []; };
const has = (g, pid, c) => g.p(pid).deck.includes(c) || g.p(pid).reserve.includes(c);
(async () => {
  await run('guarda do baralho (AE-076) anula roubo do topo (AE-031)', { flip: { 0: true, 1: true },
    setup(g) { const a = plain(60, 60, 60, 60), b = plain(50, 50, 50, 50), x = plain(10, 10, 10, 10), z = plain(20, 20, 20, 20), s0 = sp('AE-076'), s1 = sp('AE-031'); D(g, 0, [a, x], [s0]); D(g, 1, [b, z], [s1]); return { z }; },
    check(g, { z }) { ok(has(g, 1, z), 'a carta do topo ficou com P1'); ok(!has(g, 0, z), 'P0 não recebeu'); } });
  await run('sem guarda: AE-031 rouba', { flip: { 1: true },
    setup(g) { const a = plain(60, 60, 60, 60), b = plain(50, 50, 50, 50), x = plain(10, 10, 10, 10), z = plain(20, 20, 20, 20), s1 = sp('AE-031'); D(g, 0, [a, x], []); D(g, 1, [b, z], [s1]); return { x }; },
    check(g, { x }) { ok(has(g, 1, x), 'P1 recebeu a carta do topo de P0'); } });
  await run('reflexo (AE-078): roubo de 1 carta volta contra o ladrão', { flip: { 0: true, 1: true },
    setup(g) { const a = plain(60, 60, 60, 60), b = plain(50, 50, 50, 50), x = plain(10, 10, 10, 10), z = plain(20, 20, 20, 20), w = plain(30, 30, 30, 30), s0 = sp('AE-078'), s1 = sp('AE-031'); D(g, 0, [a, x], [s0]); D(g, 1, [b, z, w], [s1]); return { x, z, w }; },
    check(g, { x, z, w }) { ok(has(g, 0, x), 'P0 manteve a própria carta'); ok([z, w].filter(c => has(g, 0, c)).length === 1, 'P0 tomou 1 carta aleatória de P1'); } });
  await run('imunidade (AE-074) cancela alvo único (AE-035)', { flip: { 0: true, 1: true },
    setup(g) { const a = plain(60, 60, 60, 60), b = plain(50, 50, 50, 50), x = plain(10, 10, 10, 10), s0 = sp('AE-074'), s1 = sp('AE-035'); D(g, 0, [a, x], [s0]); D(g, 1, [b], [s1]); return { x }; },
    check(g, { x }) { ok(has(g, 0, x), 'P0 não perdeu carta'); } });
  await run('silêncio (AE-073) anula o bônus do rival', { flip: { 0: true, 1: true }, attrs: { 0: 'pod', 1: 'pod' },
    setup(g) { const a = plain(60, 60, 60, 60), b = plain(55, 50, 50, 50), s0 = sp('AE-073'), s1 = sp('AE-001'); D(g, 0, [a, plain(1, 1, 1, 1)], [s0]); D(g, 1, [b, plain(1, 1, 1, 1)], [s1]); return { a, b }; },
    check(g, { a, b }) { ok(g.combat === null && g.p(0).deck.includes(a), 'P0 venceu (60 > 55) e ficou com a carta'); ok(g.p(0).deck.includes(b), 'P0 capturou a carta de P1'); } });
  await run('Triunfo raro (AE-129): vence mesmo com atributo menor', { flip: { 1: true }, attrs: { 0: 'pod', 1: 'pod' },
    setup(g) { const a = plain(90, 60, 60, 60), b = plain(10, 50, 50, 50), s1 = sp('AE-129'); D(g, 0, [a, plain(1, 1, 1, 1)], []); D(g, 1, [b, plain(1, 1, 1, 1)], [s1]); return { a, b }; },
    check(g, { a, b }) { ok(g.p(1).deck.includes(b) && g.p(1).deck.includes(a), 'P1 venceu e capturou (ataque)'); } });
  await run('Ruína de campo (AE-103): carta do rival vai ao Buraco Negro', { flip: { 0: true },
    setup(g) { const a = plain(10, 10, 10, 10), b = plain(90, 90, 90, 90), s0 = sp('AE-103'); D(g, 0, [a, plain(1, 1, 1, 1)], [s0]); D(g, 1, [b, plain(1, 1, 1, 1)], []); return { a, b }; },
    check(g, { a, b }) { ok(g.s.bh.some(x => x.id === b), 'carta de P1 no Buraco Negro'); ok(g.p(0).deck.includes(a), 'P0 manteve a sua'); } });
  await run('Atributo universal (AE-021) força todos', { flip: { 0: true }, players: 3,
    setup(g) { const cs = [0, 1, 2].map(() => plain(50, 50, 50, 50)); D(g, 0, [cs[0], plain(1, 1, 1, 1)], [sp('AE-021')]); D(g, 1, [cs[1], plain(1, 1, 1, 1)], []); D(g, 2, [cs[2], plain(1, 1, 1, 1)], []); return {}; },
    check(g, s, logs) { ok(logs.some(l => /Todos disputam em/.test(l)), 'log de atributo universal'); ok(logs.filter(l => /inicia em/.test(l)).length === 1, 'iniciou'); } });
  await run('Ataque obrigatório (AE-024): ninguém usa defesa', { flip: { 0: true }, players: 3, attrs: { 0: 'def', 1: 'def', 2: 'vel' },
    setup(g) { const cs = [0, 1, 2].map(() => plain(50, 50, 50, 50)); D(g, 0, [cs[0], plain(1, 1, 1, 1)], [sp('AE-024')]); D(g, 1, [cs[1], plain(1, 1, 1, 1)], []); D(g, 2, [cs[2], plain(1, 1, 1, 1)], []); return {}; },
    check(g, s, logs) { ok(logs.some(l => /inicia em (Força|Inteligência)/.test(l)), 'iniciador forçado a atacar'); ok(g.combat === null, 'terminou'); } });
  await run('Ativação forçada (AE-111) vira os 2 especiais do alvo', { flip: { 0: ['AE-111'] },
    setup(g) { const a = plain(50, 50, 50, 50), b = plain(50, 50, 50, 50), s0 = sp('AE-111'), t1 = sp('AE-001'), t2 = sp('AE-002'); D(g, 0, [a, plain(1, 1, 1, 1), plain(1, 1, 1, 1), plain(1, 1, 1, 1)], [s0]); D(g, 1, [b, plain(1, 1, 1, 1), plain(1, 1, 1, 1), plain(1, 1, 1, 1)], [t1, t2]); return { t1, t2 }; },
    check(g, { t1, t2 }, logs) { ok(g.p(1).prepared.length === 0, 'P1 teve os 2 especiais virados'); ok(g.s.bh.some(x => x.id === t1) && g.s.bh.some(x => x.id === t2), 'especiais foram ao Buraco Negro'); } });
  await run('Apropriar especial usado (AE-116) leva a carta ao baralho', { flip: { 0: true, 1: true },
    setup(g) { const a = plain(50, 50, 50, 50), b = plain(50, 50, 50, 50), s0 = sp('AE-116'), s1 = sp('AE-001'); D(g, 0, [a, plain(1, 1, 1, 1)], [s0]); D(g, 1, [b, plain(1, 1, 1, 1)], [s1]); return { s1, s0 }; },
    check(g, { s1, s0 }) { ok(g.p(0).deck.includes(s1), 'P0 ficou com o especial de P1'); ok(g.s.bh.some(x => x.id === s0), 'o próprio especial vai ao Buraco Negro'); ok(!g.s.bh.some(x => x.id === s1), 'não ficou no Buraco Negro'); } });
  await run('Capturar atacante (AE-101) toma a carta mesmo perdendo', { flip: { 0: true }, attrs: { 0: 'def', 1: 'pod' },
    setup(g) { const a = plain(20, 90, 20, 20), b = plain(80, 10, 50, 10), s0 = sp('AE-101'); D(g, 0, [a, plain(1, 1, 1, 1)], [s0]); D(g, 1, [b, plain(1, 1, 1, 1)], []); return { a, b }; },
    check(g, { a, b }) { ok(g.p(0).deck.includes(b), 'P0 capturou a carta atacante de P1'); } });
  await run('Margem estreita (AE-110): perder por 5 vira empate/desempate', { flip: { 1: true }, attrs: { 0: 'pod', 1: 'pod' },
    setup(g) { const a = plain(60, 60, 60, 60), b = plain(55, 90, 90, 90), s1 = sp('AE-110'); D(g, 0, [a, plain(1, 1, 1, 1)], []); D(g, 1, [b, plain(1, 1, 1, 1)], [s1]); return { a, b }; },
    check(g, { a, b }) { ok(g.p(1).deck.includes(a) && g.p(1).deck.includes(b), 'desempate pela soma: P1 vence'); } });
  await run('Remover alteração (AE-120) anula bônus do rival', { flip: { 0: true, 1: true }, attrs: { 0: 'pod', 1: 'pod' },
    setup(g) { const a = plain(60, 60, 60, 60), b = plain(55, 50, 50, 50), s0 = sp('AE-120'), s1 = sp('AE-001'); D(g, 0, [a, plain(1, 1, 1, 1)], [s0]); D(g, 1, [b, plain(1, 1, 1, 1)], [s1]); return { a, b }; },
    check(g, { a, b }) { ok(g.p(0).deck.includes(a) && g.p(0).deck.includes(b), 'P0 venceu depois de remover o +15 de P1'); } });
  await run('Blindagem (AE-118) protege contra Interrupção (AE-113)', { flip: { 0: ['AE-113'], 1: true }, attrs: { 0: 'pod', 1: 'pod' },
    setup(g) { const a = plain(60, 60, 60, 60), b = plain(55, 50, 50, 50), s0 = sp('AE-113'), s1 = sp('AE-001'), s2 = sp('AE-118'); D(g, 0, [a, plain(1, 1, 1, 1)], [s0]); D(g, 1, [b, plain(1, 1, 1, 1)], [s1, s2]); return { a, b }; },
    check(g, { a, b }, logs) { ok(logs.some(l => /blindagem/i.test(l)), 'blindagem resistiu'); ok(g.p(1).deck.includes(a), 'o +15 de P1 valeu (70 > 60)'); } });
  await run('Escolha de sete (AE-097) move cartas da reserva ao topo', { flip: { 1: true },
    setup(g) { const a = plain(50, 50, 50, 50), b = plain(50, 50, 50, 50), r1 = plain(1, 1, 1, 1), r2 = plain(2, 2, 2, 2), s1 = sp('AE-097'); D(g, 0, [a, plain(1, 1, 1, 1)], []); D(g, 1, [b, plain(1, 1, 1, 1)], [s1], [r1, r2]); return { r1, r2 }; },
    check(g, { r1, r2 }) { ok(g.p(1).deck.includes(r1) && g.p(1).deck.includes(r2) && g.p(1).reserve.length === 0, 'reserva foi ao baralho'); } });
  console.log(fails ? `FALHAS: ${fails}` : 'todos os cenários ok');
})();
