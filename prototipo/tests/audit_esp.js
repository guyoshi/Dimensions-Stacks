// Auditoria determinística: cada especial (AE-001..AE-130) é executado numa disputa montada e o efeito é conferido contra o texto.
// Uso: node tests/audit_esp.js [AE-xxx]
const E = require('../engine.js');
const only = process.argv[2];
const ids = Object.keys(E.CARDS); let ci = 0, fails = 0, total = 0; const covered = new Set();
const mk = (a, b, c, d) => { const x = ids[ci++]; E.CARDS[x].stats = { pod: a, def: b, int: c, vel: d }; E.CARDS[x].especial = 'AE-001'; return x; };
const SPC = (ab, st) => { const x = mk(...(st || [50, 50, 50, 50])); E.CARDS[x].especial = ab; return x; };
const where = (g, c) => { for (const p of g.s.players) { for (const z of ['deck', 'reserve', 'prepared']) { const i = p[z].indexOf(c); if (i >= 0) return `P${p.pid}.${z}[${i}]`; } } const b = g.s.bh.find(x => x.id === c); return b ? `BH.${b.kind}` : '?'; };
const inD = (g, pid, c) => g.p(pid).deck.includes(c), inR = (g, pid, c) => g.p(pid).reserve.includes(c), inBH = (g, c) => g.s.bh.some(x => x.id === c);

// W: mundo padrão. F[pid] = carta de combate (50 em tudo → empate absoluto, isola o efeito); X[pid][0..3] = baralho (20,30,40,50: X[0] é a mais fraca); R[pid][0..2] = reserva.
function world(g, o) {
  o = o || {}; const n = g.s.players.length, W = { F: [], X: [], R: [], S: {} };
  for (let p = 0; p < n; p++) {
    W.F[p] = mk(...((o.f && o.f[p]) || [50, 50, 50, 50]));
    W.X[p] = [0, 1, 2, 3].slice(0, o.deckN == null ? 4 : o.deckN).map(k => mk(...((o.x && o.x[p] && o.x[p][k]) || [20 + 10 * k, 20 + 10 * k, 20 + 10 * k, 20 + 10 * k])));
    W.R[p] = [0, 1, 2].slice(0, o.resN == null ? 3 : o.resN).map(() => mk(5, 5, 5, 5));
    const prep = ((o.prep && o.prep[p]) || []).map(ab => { const c = SPC(ab); (W.S[p] = W.S[p] || []).push(c); return c; });
    g.p(p).deck = [W.F[p], ...W.X[p]]; g.p(p).reserve = W.R[p].slice(); g.p(p).prepared = prep;
  }
  return W;
}
async function scn(id, title, o) {
  if (only && id !== only) return; covered.add(id); ci = 0; total++;
  const n = o.n || 3; const players = [...Array(n)].map((_, i) => ({ name: 'P' + i, bot: true, avatar: i })); const logs = [], ev = []; let reveal = null, result = null;
  const flip = o.flip || {}, attrs = o.attrs || {};
  class G extends E.Game {
    async bot_special(p, usable, combat, ctx, stage) { const f = flip[p.pid]; if (!f) return null; const c = usable.find(x => !this._done.has(x) && (f === true || f.includes(E.CARDS[x].especial))); if (c) this._done.add(c); return c || null; }
    async bot_prepare() { return false; }
    async bot_attr(p, entry, options) { const w = attrs[p.pid]; return w && options.includes(w) ? w : options[0]; }
  }
  const g = new G({ players, perPlayer: 7, seed: o.seed || 5, specialsFrom: 1, io: { log: t => logs.push(t), notify: async (t, d) => { ev.push({ t, d }); if (t === 'reveal') reveal = d.combat.entries.map(e => ({ pid: e.pid, attr: e.attr, v: e.stats[e.attr] + e.bonus, card: e.card })); if (t === 'resolved') result = d.result; } } });
  g.blindNow = () => false; // sem falhas aleatórias de bot: o teste verifica o efeito, não a sorte do sorteio
  g._done = new Set(); await g.setup(); g.s.initiator = 0;
  const W = world(g, o.world); if (o.setup) o.setup(g, W);
  const tot = () => { const a = []; g.s.players.forEach(p => a.push(...p.deck, ...p.reserve, ...p.prepared)); g.s.bh.forEach(x => a.push(x.id)); return a.filter(x => !String(x).includes('*')); };
  const before = tot().length; const bad = []; const ok = (c, m) => { if (!c) bad.push(m); };
  try { await g.playCombat(0); const aft = tot(), esperado = before + (o.allowCreate || 0); ok(aft.length === esperado && new Set(aft).size === aft.length, `conservação de cartas: ${before} → ${aft.length} (esperado ${esperado}), únicas ${new Set(aft).size}`); o.check(g, W, { ok, logs, ev, reveal, result, has: re => logs.some(l => re.test(l)), evs: t => ev.filter(x => x.t === t) }); }
  catch (e) { bad.push('EXCEÇÃO ' + e.message + ' ' + (e.stack || '').split('\n')[1]); }
  if (bad.length) { fails++; console.log('✗', id, title); bad.forEach(m => console.log('    -', m)); logs.slice(-14).forEach(l => console.log('      ·', l)); }
  else if (process.env.V) console.log('✓', id, title);
}
const cnt = (g, pid, z) => g.p(pid)[z].length;
(async () => {
  // ---------- Bônus 001–010 ----------
  const spec1 = (id, title, p0stats, attr, expect, extra) => scn(id, title, Object.assign({ n: 2, flip: { 0: true }, attrs: { 0: attr, 1: attr }, world: { f: { 0: p0stats, 1: [30, 30, 30, 30] }, prep: { 0: [id] } },
    check(g, W, c) { c.ok(c.result && c.result.winnerPid === 0, 'P0 venceu: ' + JSON.stringify(c.result)); c.ok(c.result && c.result.value === expect, `valor ${expect}, veio ${c.result && c.result.value}`); } }, extra || {}));
  for (const [id, a] of [['AE-001', 'pod'], ['AE-002', 'def'], ['AE-003', 'int'], ['AE-004', 'vel']]) await spec1(id, `+15 ${a}`, [40, 40, 40, 40], a, 55);
  await spec1('AE-005', '+10 no atributo usado (vel)', [40, 40, 40, 40], 'vel', 50);
  await spec1('AE-006', '+15 def', [40, 40, 40, 40], 'def', 55); await spec1('AE-006', '+20 vel', [40, 40, 40, 40], 'vel', 60);
  await spec1('AE-007', '+7 pod', [40, 40, 40, 40], 'pod', 47); await spec1('AE-007', '+7 int', [40, 40, 40, 40], 'int', 47);
  await spec1('AE-008', '+10 def', [40, 40, 40, 40], 'def', 50); await spec1('AE-008', '+10 vel', [40, 40, 40, 40], 'vel', 50);
  await spec1('AE-009', '+30 se original ≤ 55', [35, 35, 35, 35], 'pod', 65);
  await scn('AE-009', 'não funciona com valor > 55 (não é oferecido)', { n: 2, flip: { 0: true }, attrs: { 0: 'pod', 1: 'pod' }, world: { f: { 0: [60, 60, 60, 60], 1: [30, 30, 30, 30] }, prep: { 0: ['AE-009'] } },
    check(g, W, c) { c.ok(c.result.value === 60, 'sem bônus'); c.ok(g.p(0).prepared.includes(W.S[0][0]), 'especial continua preparado (não foi consumido)'); } });
  await scn('AE-010', 'soma o mesmo atributo das duas cartas', { n: 2, flip: { 0: true }, attrs: { 0: 'pod', 1: 'pod' }, world: { f: { 0: [40, 40, 40, 40], 1: [30, 30, 30, 30] }, x: { 0: [[30, 30, 30, 30]] }, prep: { 0: ['AE-010'] } },
    check(g, W, c) { c.ok(c.result.value === 70, `70, veio ${c.result.value}`); c.ok(inD(g, 0, W.X[0][0]) && inD(g, 0, W.F[0]) && inD(g, 0, W.F[1]), 'as duas cartas voltam e a de P1 é capturada'); } });

  // ---------- Conversões 011–020 e 121–128; permutas ----------
  const CONV = [['AE-011', 'pod', 'int'], ['AE-012', 'int', 'pod'], ['AE-013', 'pod', 'vel'], ['AE-014', 'vel', 'pod'], ['AE-015', 'def', 'int'], ['AE-016', 'int', 'def'], ['AE-017', 'pod', 'def'], ['AE-018', 'def', 'pod'], ['AE-019', 'int', 'vel'], ['AE-020', 'vel', 'int'], ['AE-121', 'def', 'vel'], ['AE-122', 'vel', 'def']];
  for (const [id, from, to] of CONV) {
    const st = { pod: 20, def: 20, int: 20, vel: 20 }; st[from] = 90; const arr = [st.pod, st.def, st.int, st.vel];
    await scn(id, `${from} → ${to}`, { n: 2, flip: { 0: true }, attrs: { 0: to, 1: to }, world: { f: { 0: arr, 1: [60, 60, 60, 60] }, prep: { 0: [id] } },
      check(g, W, c) { c.ok(c.result && c.result.winnerPid === 0 && c.result.value === 90, `valor 90 em ${to}: ${JSON.stringify(c.result)}`); const s = E.CARDS[W.F[0]].stats; c.ok(s[from] === 90, 'origem preservada'); } });
  }
  const PERM = [['AE-123', 'pod', 'int'], ['AE-124', 'pod', 'vel'], ['AE-125', 'pod', 'def'], ['AE-126', 'int', 'vel'], ['AE-127', 'int', 'def'], ['AE-128', 'def', 'vel']];
  for (const [id, x, y] of PERM) {
    const st = { pod: 50, def: 50, int: 50, vel: 50 }; st[x] = 10; st[y] = 90; const arr = [st.pod, st.def, st.int, st.vel];
    await scn(id, `permuta ${x}↔${y}`, { n: 2, flip: { 0: true }, attrs: { 0: x, 1: x }, world: { f: { 0: arr, 1: [60, 60, 60, 60] }, prep: { 0: [id] } },
      check(g, W, c) { c.ok(c.result && c.result.winnerPid === 0 && c.result.value === 90, `valor 90 em ${x}: ${JSON.stringify(c.result)}`); } });
  }

  // ---------- Controle 021–030 ----------
  const first = (c, re) => c.logs.find(l => re.test(l));
  await scn('AE-021', 'todos disputam no melhor atributo do usuário', { flip: { 0: true }, world: { f: { 0: [40, 95, 40, 40] }, prep: { 0: ['AE-021'] } },
    check(g, W, c) { c.ok(c.has(/Todos disputam em Resistência/), 'universal = Resistência'); c.ok(c.reveal.every(e => e.attr === 'def'), 'todos em def: ' + JSON.stringify(c.reveal)); } });
  await scn('AE-022', 'par Força/Resistência', { flip: { 0: true }, attrs: { 0: 'int' }, world: { f: { 0: [40, 40, 90, 90] }, prep: { 0: ['AE-022'] } },
    check(g, W, c) { c.ok(c.reveal.every(e => e.attr === 'pod' || e.attr === 'def'), 'todos em pod/def: ' + JSON.stringify(c.reveal)); } });
  await scn('AE-023', 'par Inteligência/Velocidade', { flip: { 0: true }, attrs: { 0: 'pod' }, world: { f: { 0: [90, 90, 40, 40] }, prep: { 0: ['AE-023'] } },
    check(g, W, c) { c.ok(c.reveal.every(e => e.attr === 'int' || e.attr === 'vel'), 'todos em int/vel: ' + JSON.stringify(c.reveal)); } });
  await scn('AE-024', 'todos usam o ataque do par', { flip: { 0: true }, attrs: { 0: 'def', 1: 'def', 2: 'def' }, world: { f: { 0: [40, 90, 40, 40] }, prep: { 0: ['AE-024'] } },
    check(g, W, c) { c.ok(c.reveal.every(e => e.attr === 'pod'), 'todos em pod: ' + JSON.stringify(c.reveal)); } });
  await scn('AE-025', 'todos usam a defesa do par', { flip: { 0: true }, attrs: { 0: 'pod', 1: 'pod', 2: 'pod' }, world: { f: { 0: [90, 40, 40, 40] }, prep: { 0: ['AE-025'] } },
    check(g, W, c) { c.ok(c.reveal.every(e => e.attr === 'def'), 'todos em def: ' + JSON.stringify(c.reveal)); } });
  await scn('AE-026', 'rival forçado a atacar', { n: 2, flip: { 0: true }, attrs: { 0: 'pod', 1: 'def' }, world: { prep: { 0: ['AE-026'] } },
    check(g, W, c) { c.ok(c.reveal.find(e => e.pid === 1).attr === 'pod', 'P1 em pod: ' + JSON.stringify(c.reveal)); } });
  await scn('AE-027', 'rival forçado a defender', { n: 2, flip: { 0: true }, attrs: { 0: 'pod', 1: 'pod' }, world: { prep: { 0: ['AE-027'] } },
    check(g, W, c) { c.ok(c.reveal.find(e => e.pid === 1).attr === 'def', 'P1 em def: ' + JSON.stringify(c.reveal)); } });
  await scn('AE-028', 'rival proibido de atacar', { n: 2, flip: { 0: true }, attrs: { 0: 'pod', 1: 'pod' }, world: { prep: { 0: ['AE-028'] } },
    check(g, W, c) { c.ok(c.reveal.find(e => e.pid === 1).attr === 'def', 'P1 em def: ' + JSON.stringify(c.reveal)); } });
  await scn('AE-029', 'rival proibido de defender', { n: 2, flip: { 0: true }, attrs: { 0: 'pod', 1: 'def' }, world: { prep: { 0: ['AE-029'] } },
    check(g, W, c) { c.ok(c.reveal.find(e => e.pid === 1).attr === 'pod', 'P1 em pod: ' + JSON.stringify(c.reveal)); } });
  await scn('AE-030', 'usuário escolhe o atributo do rival (dentro do par)', { n: 2, flip: { 0: true }, attrs: { 0: 'pod', 1: 'pod' }, world: { prep: { 0: ['AE-030'] } },
    check(g, W, c) { c.ok(c.has(/escolhe o atributo de P1/), 'log da escolha'); c.ok(['pod', 'def'].includes(c.reveal.find(e => e.pid === 1).attr), 'dentro do par'); } });

  // ---------- Roubos 031–050 (+ 035, 041, 049) ----------
  const P = (...ab) => ({ prep: { 0: ab } });
  await scn('AE-031', 'topo do baralho do jogador à direita (P1)', { flip: { 0: true }, world: P('AE-031'), check(g, W, c) { c.ok(inD(g, 0, W.X[1][0]) && !inD(g, 1, W.X[1][0]), 'X1[0] foi para P0'); c.ok(cnt(g, 1, 'deck') === 4 && cnt(g, 0, 'deck') === 6, 'tamanhos 6/4: ' + cnt(g, 0, 'deck') + '/' + cnt(g, 1, 'deck')); } });
  await scn('AE-032', 'topo do baralho do jogador à esquerda (P2)', { flip: { 0: true }, world: P('AE-032'), check(g, W, c) { c.ok(inD(g, 0, W.X[2][0]) && !inD(g, 2, W.X[2][0]), 'X2[0] foi para P0'); } });
  await scn('AE-033', 'aleatória da direita (P1), nunca a de combate', { flip: { 0: true }, world: P('AE-033'), check(g, W, c) { const got = W.X[1].filter(x => inD(g, 0, x)); c.ok(got.length === 1, 'tomou 1 de P1: ' + got.length); c.ok(inD(g, 1, W.F[1]), 'F1 continua de P1'); } });
  await scn('AE-034', 'aleatória da esquerda (P2)', { flip: { 0: true }, world: P('AE-034'), check(g, W, c) { c.ok(W.X[2].filter(x => inD(g, 0, x)).length === 1, 'tomou 1 de P2'); c.ok(inD(g, 2, W.F[2]), 'F2 fica'); } });
  await scn('AE-035', 'aleatória de qualquer adversário', { flip: { 0: true }, world: P('AE-035'), check(g, W, c) { const got = [...W.X[1], ...W.X[2]].filter(x => inD(g, 0, x)); c.ok(got.length === 1, 'tomou 1: ' + got.length); } });
  await scn('AE-036', '1 carta de cada um de dois rivais', { flip: { 0: true }, world: P('AE-036'), check(g, W, c) { c.ok(W.X[1].filter(x => inD(g, 0, x)).length === 1 && W.X[2].filter(x => inD(g, 0, x)).length === 1, '1 de P1 e 1 de P2'); } });
  await scn('AE-036', 'em duelo a condição não é atendida (não é oferecido)', { n: 2, flip: { 0: true }, world: P('AE-036'), check(g, W, c) { c.ok(cnt(g, 1, 'deck') === 5 && g.p(0).prepared.length === 1, 'nada acontece, especial segue preparado'); } });
  const rw = { f: { 0: [90, 90, 90, 90], 1: [10, 10, 10, 10], 2: [10, 10, 10, 10] }, prep: { 0: ['AE-037'] } };
  await scn('AE-037', 'vencendo atacando: +1 do topo de um derrotado', { flip: { 0: true }, attrs: { 0: 'pod', 1: 'pod', 2: 'pod' }, world: rw, check(g, W, c) { c.ok(c.result.winnerPid === 0, 'P0 venceu'); c.ok(inD(g, 0, W.X[1][0]) || inD(g, 0, W.X[2][0]), 'recebeu o topo de um derrotado'); c.ok(inD(g, 0, W.F[1]) && inD(g, 0, W.F[2]), 'capturou as cartas'); } });
  await scn('AE-037', 'se não ganhar atacando, não cobra', { flip: { 0: true }, attrs: { 0: 'def', 1: 'def', 2: 'def' }, world: { f: { 0: [10, 90, 10, 10], 1: [10, 10, 10, 10], 2: [10, 10, 10, 10] }, prep: { 0: ['AE-037'] } }, check(g, W, c) { c.ok(cnt(g, 0, 'deck') === 5, 'sem recompensa (5 cartas): ' + cnt(g, 0, 'deck')); } });
  await scn('AE-038', 'vencendo defendendo: +1 do topo', { flip: { 0: true }, attrs: { 0: 'def', 1: 'def', 2: 'def' }, world: { f: { 0: [10, 90, 10, 10], 1: [10, 10, 10, 10], 2: [10, 10, 10, 10] }, prep: { 0: ['AE-038'] } }, check(g, W, c) { c.ok(c.result.winnerPid === 0, 'P0 venceu'); c.ok(inD(g, 0, W.X[1][0]) || inD(g, 0, W.X[2][0]), 'recebeu o topo'); c.ok(inBH(g, W.F[1]) && inBH(g, W.F[2]), 'derrotados vão ao Buraco Negro (defesa não captura)'); } });
  await scn('AE-039', 'vê 2 e captura a melhor; a outra fica no topo', { flip: { 0: true }, world: P('AE-039'), check(g, W, c) { const t = [1, 2].find(p => inD(g, 0, W.X[p][1])); c.ok(t != null, 'capturou X[1] (a mais forte das 2)'); if (t != null) c.ok(g.p(t).deck[0] === W.X[t][0], 'a outra permanece no topo'); } });
  await scn('AE-040', 'rival com ≥4 cartas: 1 aleatória', { flip: { 0: true }, world: P('AE-040'), check(g, W, c) { c.ok([...W.X[1], ...W.X[2]].filter(x => inD(g, 0, x)).length === 1, 'tomou 1'); } });
  await scn('AE-040', 'rival com poucas cartas não é alvo (não oferecido)', { flip: { 0: true }, world: { deckN: 2, prep: { 0: ['AE-040'] } }, check(g, W, c) { c.ok(g.p(0).prepared.length === 1, 'continua preparado'); } });
  const resT = (id, who, idx, title) => scn(id, title, { flip: { 0: true }, world: P(id), check(g, W, c) { const x = W.R[who][idx]; c.ok(inD(g, 0, x) && !inR(g, who, x), `R${who}[${idx}] foi para o baralho de P0 (${where(g, x)})`); c.ok(cnt(g, who, 'reserve') === 2, 'reserva do alvo 2'); } });
  await resT('AE-041', 1, 2, 'última da reserva da direita'); await resT('AE-042', 2, 2, 'última da reserva da esquerda');
  await resT('AE-043', 1, 0, 'primeira da reserva da direita'); await resT('AE-044', 2, 0, 'primeira da reserva da esquerda');
  await scn('AE-045', '2 aleatórias da reserva da direita', { flip: { 0: true }, world: P('AE-045'), check(g, W, c) { c.ok(W.R[1].filter(x => inD(g, 0, x)).length === 2 && cnt(g, 1, 'reserve') === 1, '2 de P1'); } });
  await scn('AE-046', '2 aleatórias da reserva da esquerda', { flip: { 0: true }, world: P('AE-046'), check(g, W, c) { c.ok(W.R[2].filter(x => inD(g, 0, x)).length === 2 && cnt(g, 2, 'reserve') === 1, '2 de P2'); } });
  await scn('AE-047', '1 aleatória da reserva de cada adversário', { flip: { 0: true }, world: P('AE-047'), check(g, W, c) { c.ok(W.R[1].filter(x => inD(g, 0, x)).length === 1 && W.R[2].filter(x => inD(g, 0, x)).length === 1, '1 de cada'); } });
  await scn('AE-048', 'última de cada reserva', { flip: { 0: true }, world: P('AE-048'), check(g, W, c) { c.ok(inD(g, 0, W.R[1][2]) && inD(g, 0, W.R[2][2]), 'últimas de P1 e P2'); } });
  await scn('AE-049', 'até 2 aleatórias da reserva de um adversário', { flip: { 0: true }, world: P('AE-049'), check(g, W, c) { c.ok([...W.R[1], ...W.R[2]].filter(x => inD(g, 0, x)).length === 2, 'tomou 2'); } });
  await scn('AE-050', 'adversário com ≤3 cartas: última da reserva', { flip: { 0: true }, world: { deckN: 2, prep: { 0: ['AE-050'] } }, check(g, W, c) { c.ok(inD(g, 0, W.R[1][2]) || inD(g, 0, W.R[2][2]), 'tomou a última da reserva de alguém'); } });
  await scn('AE-050', 'adversário com muitas cartas: não oferecido', { flip: { 0: true }, world: P('AE-050'), check(g, W, c) { c.ok(g.p(0).prepared.length === 1, 'segue preparado'); } });

  // ---------- Trocas 051–065 ----------
  await scn('AE-051', 'troca 1 carta escolhida por 1 aleatória do rival', { flip: { 0: true }, n: 2, world: P('AE-051'), check(g, W, c) { c.ok(inD(g, 1, W.X[0][0]), 'a mais fraca de P0 foi a P1'); c.ok(W.X[1].filter(x => inD(g, 0, x)).length === 1, 'P0 recebeu 1 carta de P1'); c.ok(cnt(g, 0, 'deck') === 5 && cnt(g, 1, 'deck') === 5, 'contagens iguais'); } });
  await scn('AE-052', 'toma a carta de combate do rival e entrega outra', { flip: { 0: true }, n: 2, world: P('AE-052'), check(g, W, c) { c.ok(inD(g, 0, W.F[1]), 'F1 foi parar com P0'); c.ok(c.evs('combatSwap').length === 1, 'animação de troca'); } });
  await scn('AE-053', 'troca de combatente com a direita', { flip: { 0: true }, world: P('AE-053'), check(g, W, c) { c.ok(inD(g, 0, W.F[1]) && inD(g, 1, W.F[0]), 'F0↔F1 (empate absoluto devolve a cada dono)'); } });
  await scn('AE-054', 'troca de combatente com a esquerda', { flip: { 0: true }, world: P('AE-054'), check(g, W, c) { c.ok(inD(g, 0, W.F[2]) && inD(g, 2, W.F[0]), 'F0↔F2'); } });
  await scn('AE-055', 'troca de topos com a direita', { flip: { 0: true }, world: P('AE-055'), check(g, W, c) { c.ok(inD(g, 0, W.X[1][0]) && inD(g, 1, W.X[0][0]), 'topos trocados'); } });
  await scn('AE-056', 'troca de topos com a esquerda', { flip: { 0: true }, world: P('AE-056'), check(g, W, c) { c.ok(inD(g, 0, W.X[2][0]) && inD(g, 2, W.X[0][0]), 'topos trocados'); } });
  await scn('AE-057', 'cada um passa 1 carta à esquerda', { flip: { 0: true }, world: P('AE-057'), check(g, W, c) { c.ok(inD(g, 2, W.X[0][0]) && inD(g, 0, W.X[1][0]) && inD(g, 1, W.X[2][0]), 'P0→P2, P1→P0, P2→P1'); } });
  await scn('AE-058', 'cada um passa 1 carta à direita', { flip: { 0: true }, world: P('AE-058'), check(g, W, c) { c.ok(inD(g, 1, W.X[0][0]) && inD(g, 2, W.X[1][0]) && inD(g, 0, W.X[2][0]), 'P0→P1, P1→P2, P2→P0'); } });
  await scn('AE-059', 'permuta de reservas com a esquerda', { flip: { 0: true }, world: P('AE-059'), check(g, W, c) { c.ok(W.R[1].slice(0, 3).every(x => inR(g, 0, x)) && W.R[0].slice(0, 3).every(x => inR(g, 1, x)) && W.R[1].slice(3).every(x => inR(g, 1, x)) && W.R[0].slice(3).every(x => inR(g, 0, x)), 'até 3 cartas trocadas P0↔P1 (esquerda = próximo jogador)'); } });
  await scn('AE-060', 'permuta de reservas com a direita', { flip: { 0: true }, world: P('AE-060'), check(g, W, c) { c.ok(W.R[2].slice(0, 3).every(x => inR(g, 0, x)) && W.R[0].slice(0, 3).every(x => inR(g, 2, x)) && W.R[2].slice(3).every(x => inR(g, 2, x)) && W.R[0].slice(3).every(x => inR(g, 0, x)), 'até 3 cartas trocadas P0↔P2 (direita = jogador anterior)'); } });
  await scn('AE-061', 'reservas giram à direita', { flip: { 0: true }, world: P('AE-061'), check(g, W, c) { c.ok(W.R[0].every(x => inR(g, 1, x)) && W.R[1].every(x => inR(g, 2, x)) && W.R[2].every(x => inR(g, 0, x)), 'P0→P1→P2→P0'); } });
  await scn('AE-062', 'reservas giram à esquerda', { flip: { 0: true }, world: P('AE-062'), check(g, W, c) { c.ok(W.R[0].every(x => inR(g, 2, x)) && W.R[2].every(x => inR(g, 1, x)) && W.R[1].every(x => inR(g, 0, x)), 'P0→P2→P1→P0'); } });
  await scn('AE-063', 'escolhe 1 carta de cada vizinho (às cegas): uma fica na sua reserva, a outra vai ao vizinho oposto', { flip: { 0: true }, world: P('AE-063'), check(g, W, c) { c.ok(cnt(g, 0, 'reserve') === 4, 'P0 ganhou 1 na reserva: ' + cnt(g, 0, 'reserve')); c.ok(cnt(g, 1, 'deck') + cnt(g, 2, 'deck') === 9, 'vizinhos somam 9 no baralho (um perdeu 1 e outro continua igual)'); c.ok(cnt(g, 0, 'deck') === 5, 'P0 deck igual'); } });
  await scn('AE-064', 'pega 1 aleatória da reserva da esquerda para a própria reserva', { flip: { 0: true }, world: P('AE-064'), check(g, W, c) { c.ok(cnt(g, 0, 'reserve') === 4 && cnt(g, 1, 'reserve') === 2 && cnt(g, 2, 'reserve') === 3, `P0 4, esquerda 2, outro 3; veio ${cnt(g, 0, 'reserve')}/${cnt(g, 1, 'reserve')}/${cnt(g, 2, 'reserve')}`); } });
  await scn('AE-065', 'até 3 do baralho da esquerda: 1 para a sua reserva, 2 ao baralho da direita', { flip: { 0: true }, world: P('AE-065'), check(g, W, c) { c.ok(cnt(g, 1, 'deck') === 2 && cnt(g, 2, 'deck') === 7 && cnt(g, 0, 'reserve') === 4, `esq 2, dir 7, reserva própria 4: ${cnt(g, 1, 'deck')}/${cnt(g, 2, 'deck')}/${cnt(g, 0, 'reserve')}`); } });
  await scn('AE-066', 'todos (inclusive o usuário) descartam 1 aleatória', { flip: { 0: true }, world: P('AE-066'), check(g, W, c) { c.ok([0, 1, 2].every(p => cnt(g, p, 'deck') === 4), 'cada um com 4'); c.ok(g.s.bh.filter(x => x.kind === 'normal').length === 3, '3 cartas ao Buraco Negro'); } });
  await scn('AE-067', 'cada adversário descarta 1; usuário não', { flip: { 0: true }, world: P('AE-067'), check(g, W, c) { c.ok(cnt(g, 0, 'deck') === 5 && cnt(g, 1, 'deck') === 4 && cnt(g, 2, 'deck') === 4, 'P0 5, rivais 4'); } });
  await scn('AE-068', 'sacrifica carta >90 e toma 1 de cada adversário', { flip: { 0: true }, world: { x: { 0: [[95, 20, 20, 20]] }, prep: { 0: ['AE-068'] } }, check(g, W, c) { c.ok(inBH(g, W.X[0][0]), 'sacrificada foi ao Buraco Negro'); c.ok(W.X[1].filter(x => inD(g, 0, x)).length === 1 && W.X[2].filter(x => inD(g, 0, x)).length === 1, '1 de cada rival'); } });
  await scn('AE-068', 'sem carta acima de 90 não é oferecido', { flip: { 0: true }, world: P('AE-068'), check(g, W, c) { c.ok(g.p(0).prepared.length === 1, 'segue preparado'); } });
  await scn('AE-069', 'rival entrega a mais fraca', { flip: { 0: true }, world: P('AE-069'), check(g, W, c) { c.ok((inD(g, 0, W.X[1][0]) && !inD(g, 0, W.X[2][0])) || (inD(g, 0, W.X[2][0]) && !inD(g, 0, W.X[1][0])), 'recebeu a mais fraca de UM rival'); c.ok(cnt(g, 0, 'deck') === 6, 'P0 com 6: ' + cnt(g, 0, 'deck')); } });
  await scn('AE-070', 'conquista compensada: captura mas paga 1 a cada rival', { flip: { 0: true }, attrs: { 0: 'pod', 1: 'pod', 2: 'pod' }, world: { f: { 0: [90, 90, 90, 90], 1: [10, 10, 10, 10], 2: [10, 10, 10, 10] }, prep: { 0: ['AE-070'] } },
    check(g, W, c) { c.ok(c.result.winnerPid === 0, 'P0 venceu'); c.ok(cnt(g, 0, 'deck') === 7 && cnt(g, 0, 'reserve') === 1 && cnt(g, 1, 'reserve') === 4 && cnt(g, 2, 'reserve') === 4, `P0 captura 2 (deck 7) e paga 1 da reserva a cada rival: reservas 1/4/4: ${cnt(g, 0, 'deck')}/${cnt(g, 0, 'reserve')}/${cnt(g, 1, 'reserve')}/${cnt(g, 2, 'reserve')}`); c.ok(c.has(/paga a compensação/), 'log do pagamento'); } });
  await scn('AE-070', 'defendendo também captura (compensada)', { flip: { 0: true }, attrs: { 0: 'def', 1: 'def', 2: 'def' }, n: 2, world: { f: { 0: [10, 90, 10, 10], 1: [10, 10, 10, 10] }, prep: { 0: ['AE-070'] } },
    check(g, W, c) { c.ok(!inBH(g, W.F[1]), 'F1 não foi ao Buraco Negro (defesa normal descartaria)'); c.ok(cnt(g, 0, 'deck') === 6 && cnt(g, 0, 'reserve') === 2 && cnt(g, 1, 'reserve') === 4, 'captura +1, paga 1 da reserva'); } });

  // ---------- Defesas 071–080 ----------
  await scn('AE-071', 'retira a carta: volta ao baralho sem vitória/derrota', { n: 2, flip: { 0: true }, attrs: { 0: 'pod', 1: 'pod' }, world: { f: { 0: [5, 5, 5, 5], 1: [90, 90, 90, 90] }, prep: { 0: ['AE-071'] } }, check(g, W, c) { c.ok(inD(g, 0, W.F[0]) && !inD(g, 1, W.F[0]), 'F0 segue com P0'); } });
  await scn('AE-072', 'perdendo, a carta volta ao próprio baralho', { n: 2, flip: { 0: true }, attrs: { 0: 'pod', 1: 'pod' }, world: { f: { 0: [5, 5, 5, 5], 1: [90, 90, 90, 90] }, prep: { 0: ['AE-072'] } }, check(g, W, c) { c.ok(c.result.winnerPid === 1, 'P1 venceu'); c.ok(inD(g, 0, W.F[0]) && !inD(g, 1, W.F[0]), 'F0 volta a P0'); } });
  await scn('AE-073', 'silêncio anula os especiais dos rivais', { n: 2, flip: { 0: true, 1: true }, attrs: { 0: 'pod', 1: 'pod' }, world: { f: { 0: [60, 60, 60, 60], 1: [55, 50, 50, 50] }, prep: { 0: ['AE-073'], 1: ['AE-001'] } }, check(g, W, c) { c.ok(c.result.winnerPid === 0 && c.result.value === 60, 'sem o +15 de P1, P0 vence com 60'); c.ok(inBH(g, W.S[1][0]), 'especial anulado vai ao Buraco Negro'); } });
  await scn('AE-074', 'imunidade cancela o roubo direcionado', { n: 2, flip: { 0: true, 1: true }, world: { prep: { 0: ['AE-074'], 1: ['AE-035'] } }, check(g, W, c) { c.ok(cnt(g, 0, 'deck') === 5 && cnt(g, 1, 'deck') === 5, 'ninguém perdeu carta'); } });
  await scn('AE-075', 'captura negada: rival vence mas não leva a carta', { n: 2, flip: { 0: true }, attrs: { 0: 'pod', 1: 'pod' }, world: { f: { 0: [5, 5, 5, 5], 1: [90, 90, 90, 90] }, prep: { 0: ['AE-075'] } }, check(g, W, c) { c.ok(c.result.winnerPid === 1, 'P1 venceu'); c.ok(inD(g, 0, W.F[0]) && !inD(g, 1, W.F[0]), 'F0 não foi capturada'); } });
  await scn('AE-076', 'guardião do baralho anula o roubo (P2 rouba de P0 via AE-031: direita de P2 é P0)', { flip: { 0: true, 2: true }, world: { prep: { 0: ['AE-076'], 2: ['AE-031'] } }, check(g, W, c) { c.ok(inD(g, 0, W.X[0][0]) && cnt(g, 0, 'deck') === 5 && cnt(g, 2, 'deck') === 5, 'P0 manteve a carta'); } });
  await scn('AE-077', 'guardião da reserva anula o roubo de reserva', { flip: { 0: true, 2: true }, world: { prep: { 0: ['AE-077'], 2: ['AE-043'] } }, check(g, W, c) { c.ok(cnt(g, 0, 'reserve') === 3, 'reserva de P0 intacta'); } });
  await scn('AE-078', 'reflexo: o roubo de 1 carta volta contra o ladrão', { flip: { 0: true, 2: true }, world: { prep: { 0: ['AE-078'], 2: ['AE-031'] } }, check(g, W, c) { c.ok(cnt(g, 0, 'deck') === 6 && cnt(g, 2, 'deck') === 4, `P0 6 / P2 4, veio ${cnt(g, 0, 'deck')}/${cnt(g, 2, 'deck')}`); } });
  await scn('AE-079', 'combatente não vai ao Buraco Negro por especial (Ruína de campo de P1)', { flip: { 0: true, 1: true }, world: { prep: { 0: ['AE-079'], 1: ['AE-103'] } }, check(g, W, c) { c.ok(!inBH(g, W.F[0]), 'F0 fora do Buraco Negro'); c.ok(inBH(g, W.F[2]), 'F2 foi (não protegido)'); } });
  // AE-080 de verdade: P1 força P0 a virar [permuta que reduz, anular]
  await scn('AE-080', 'permuta que reduz + anular (ativação forçada): volta a 90', { n: 2, flip: { 1: true }, attrs: { 0: 'pod', 1: 'pod' }, world: { f: { 0: [90, 10, 10, 10], 1: [60, 60, 60, 60] }, prep: { 0: ['AE-123', 'AE-080'], 1: ['AE-111'] } },
    check(g, W, c) { c.ok(c.result.winnerPid === 0 && c.result.value === 90, `P0 vence com 90 (veio ${JSON.stringify(c.result)})`); } });

  // ---------- Buraco Negro 081–090 ----------
  const bhSet = (g, W) => { const cs = [mk(1, 1, 1, 1), mk(2, 2, 2, 2), mk(3, 3, 3, 3), mk(4, 4, 4, 4)]; g.s.bh = cs.map(id => ({ id, kind: 'normal' })); g.s.bh.splice(2, 0, { id: mk(9, 9, 9, 9), kind: 'especial' }); W.B = cs; };
  const strongX = { x: { 0: [[95, 20, 20, 20]] } };
  await scn('AE-081', 'sacrifica >90 e recebe as 3 primeiras do Buraco Negro', { flip: { 0: true }, world: Object.assign({ prep: { 0: ['AE-081'] } }, strongX), setup: bhSet, check(g, W, c) { c.ok(inBH(g, W.X[0][0]), 'sacrifício no Buraco Negro'); c.ok(W.B.slice(0, 3).every(x => inD(g, 0, x)) && inBH(g, W.B[3]), 'recebeu B0..B2'); } });
  await scn('AE-082', 'recupera até 2 normais aleatórias', { flip: { 0: true }, world: P('AE-082'), setup: bhSet, check(g, W, c) { c.ok(W.B.filter(x => inD(g, 0, x)).length === 2, '2 normais'); } });
  await scn('AE-083', 'a normal mais recente', { flip: { 0: true }, world: P('AE-083'), setup: bhSet, check(g, W, c) { c.ok(inD(g, 0, W.B[3]) && W.B.filter(x => inD(g, 0, x)).length === 1, 'B3 (a última normal)'); } });
  await scn('AE-084', 'a normal mais antiga', { flip: { 0: true }, world: P('AE-084'), setup: bhSet, check(g, W, c) { c.ok(inD(g, 0, W.B[0]) && W.B.filter(x => inD(g, 0, x)).length === 1, 'B0 (a primeira)'); } });
  await scn('AE-085', 'escolhe 1 normal (bot: a melhor)', { flip: { 0: true }, world: P('AE-085'), setup: bhSet, check(g, W, c) { c.ok(inD(g, 0, W.B[3]) && W.B.filter(x => inD(g, 0, x)).length === 1, 'B3 (a mais forte)'); } });
  await scn('AE-087', 'até 2 do Buraco Negro para a reserva', { flip: { 0: true }, world: P('AE-087'), setup: bhSet, check(g, W, c) { c.ok(cnt(g, 0, 'reserve') === 5, 'reserva 3+2: ' + cnt(g, 0, 'reserve')); } });
  await scn('AE-088', '1 normal aleatória', { flip: { 0: true }, world: P('AE-088'), setup: bhSet, check(g, W, c) { c.ok(W.B.filter(x => inD(g, 0, x)).length === 1, '1 normal'); } });
  await scn('AE-089', 'envia 1 e recupera até 3', { flip: { 0: true }, world: P('AE-089'), setup: bhSet, check(g, W, c) { c.ok(inBH(g, W.X[0][0]), 'a mais fraca ao Buraco Negro'); c.ok(W.B.filter(x => inD(g, 0, x)).length === 3, 'recuperou 3'); } });
  await scn('AE-090', 'segunda chance: perdeu em defesa → reserva em vez de Buraco Negro', { n: 2, flip: { 0: true }, attrs: { 0: 'def', 1: 'def' }, world: { f: { 0: [5, 5, 5, 5], 1: [10, 90, 10, 10] }, prep: { 0: ['AE-090'] } }, check(g, W, c) { c.ok(c.result.winnerPid === 1 && c.result.type === 'defense', 'P1 venceu defendendo'); c.ok(inR(g, 0, W.F[0]) && !inBH(g, W.F[0]), 'F0 foi à reserva de P0'); } });

  await scn('AE-103', 'resgate depois da ruína não duplica cartas', { flip: { 0: true, 1: true }, world: { f: { 0: [10, 10, 10, 10], 1: [90, 90, 90, 90], 2: [90, 90, 90, 90] }, prep: { 0: ['AE-103'], 1: ['AE-083'] } }, setup: bhSet, check(g, W, c) { c.ok(inD(g, 1, W.F[2]), 'P1 resgatou a carta de P2 banida'); c.ok(!inBH(g, W.F[2]), 'e ela não ficou duplicada no Buraco Negro'); } });

  // ---------- Informação 091–100 ----------
  await scn('AE-091', 'revela a ordem do baralho de um rival', { flip: { 0: true }, world: P('AE-091'), check(g, W, c) { const pk = c.evs('peek'); c.ok(pk.length === 1 && pk[0].d.cards.length === 4, 'peek com 4 cartas: ' + pk.length); } });
  await scn('AE-092', 'vê 5, ordena 3 (bot: mais fortes primeiro)', { flip: { 0: true }, world: P('AE-092'), check(g, W, c) { const d = g.p(0).deck, sm = x => g.cardSum ? g.cardSum(x) : 0; c.ok(d.length === 5 || d.length === 4, 'baralho preservado: ' + d.length); const top = d.slice(0, 3).map(x => where(g, x)); c.ok(new Set(d).size === d.length, 'sem duplicadas'); c.ok(c.evs('reorder').length === 1, 'evento reorder'); } });
  await scn('AE-093', 'espia 3 cartas', { flip: { 0: true }, world: P('AE-093'), check(g, W, c) { const pk = c.evs('peek'); c.ok(pk.length === 1 && pk[0].d.cards.length === 3, 'peek com 3'); } });
  await scn('AE-094', 'inverte as próximas 5 (as disponíveis)', { flip: { 0: true }, world: P('AE-094'), check(g, W, c) { const d = g.p(0).deck.slice(); c.ok(d.slice(0, 4).join() === W.X[0].slice(0, 4).reverse().join(), 'ordem invertida: ' + d.map(x => where(g, x)).join() + ' | X: ' + W.X[0].map(x => where(g, x)).join()); } });
  await scn('AE-096', 'mistura baralho+reserva do rival; 5 ficam ativas', { flip: { 0: true }, world: P('AE-096'), check(g, W, c) { const t = [1, 2].find(p => cnt(g, p, 'reserve') === 2); c.ok(t != null, 'alguém ficou com reserva de 2 (de 3): ' + [1, 2].map(p => cnt(g, p, 'reserve')).join()); if (t != null) c.ok(cnt(g, t, 'deck') + cnt(g, t, 'reserve') === 8, 'total preservado'); } });
  await scn('AE-097', 'traz até 7 da reserva ao topo, na ordem escolhida', { flip: { 0: true }, world: P('AE-097'), check(g, W, c) { c.ok(cnt(g, 0, 'reserve') === 0 && W.R[0].every(x => inD(g, 0, x)), 'reserva toda no baralho'); c.ok(W.R[0].includes(g.p(0).deck[0]), 'no topo'); } });
  await scn('AE-098', 'reorganiza a reserva e manda 1 ao topo do baralho', { flip: { 0: true }, world: P('AE-098'), check(g, W, c) { c.ok(cnt(g, 0, 'reserve') === 2, 'reserva 3→2'); c.ok(W.R[0].includes(g.p(0).deck[0]), 'topo do baralho veio da reserva'); } });
  await scn('AE-099', 'primeira da reserva vai ao fim do baralho', { flip: { 0: true }, world: P('AE-099'), check(g, W, c) { c.ok(inD(g, 0, W.R[0][0]) && cnt(g, 0, 'reserve') === 2, 'R0[0] no baralho'); } });
  await scn('AE-100', 'escolhe qual das 3 do rival fica no topo (bot: a mais fraca)', { flip: { 0: true }, world: P('AE-100'), check(g, W, c) { c.ok([1, 2].some(p => g.p(p).deck[0] === W.X[p][0]), 'a mais fraca já era a primeira: ordem mantida'); } });
  await scn('AE-100', 'a escolhida sobe ao topo', { flip: { 0: true }, n: 2, world: P('AE-100'), setup(g, W) { /* inverte para a mais fraca estar no 3º lugar */ g.p(1).deck = [W.F[1], W.X[1][3], W.X[1][2], W.X[1][1], W.X[1][0]]; }, check(g, W, c) { c.ok(g.p(1).deck[0] === W.X[1][1], 'X1[1] (mais fraca das 3 primeiras) no topo: ' + g.p(1).deck.map(x => where(g, x)).slice(0, 3).join()); } });

  // ---------- Capturas 101–110 ----------
  await scn('AE-101', 'captura o atacante (pod+int > def+vel)', { n: 2, flip: { 0: true }, attrs: { 0: 'def', 1: 'pod' }, world: { f: { 0: [20, 90, 20, 20], 1: [80, 10, 50, 10] }, prep: { 0: ['AE-101'] } }, check(g, W, c) { c.ok(inD(g, 0, W.F[1]), 'P0 capturou F1'); } });
  await scn('AE-101', 'condição não cumprida (carta defensiva)', { n: 2, flip: { 0: true }, attrs: { 0: 'def', 1: 'def' }, world: { f: { 0: [20, 90, 20, 20], 1: [10, 80, 10, 50] }, prep: { 0: ['AE-101'] } }, check(g, W, c) { c.ok(!inD(g, 0, W.F[1]), 'não capturou'); } });
  await scn('AE-102', 'captura o defensor (def+vel ≥ pod+int)', { n: 2, flip: { 0: true }, attrs: { 0: 'def', 1: 'def' }, world: { f: { 0: [20, 90, 20, 20], 1: [10, 80, 10, 50] }, prep: { 0: ['AE-102'] } }, check(g, W, c) { c.ok(inD(g, 0, W.F[1]), 'capturou F1'); } });
  await scn('AE-010', 'ataque em dupla depois de ser banido por ruína: não perde a carta lançada', { flip: { 0: true, 1: true }, world: { f: { 0: [10, 10, 10, 10], 1: [90, 90, 90, 90], 2: [90, 90, 90, 90] }, prep: { 0: ['AE-103'], 1: ['AE-010'] } }, check(g, W, c) { c.ok(inBH(g, W.F[1]), 'F1 banido'); } });
  await scn('AE-103', 'ruína: cartas dos rivais ao Buraco Negro, a sua preservada', { flip: { 0: true }, world: { f: { 0: [10, 10, 10, 10], 1: [90, 90, 90, 90], 2: [90, 90, 90, 90] }, prep: { 0: ['AE-103'] } }, check(g, W, c) { c.ok(inBH(g, W.F[1]) && inBH(g, W.F[2]) && inD(g, 0, W.F[0]), 'F1/F2 no Buraco Negro; F0 com P0'); } });
  await scn('AE-105', 'defendendo: captura em vez de descartar', { flip: { 0: true }, attrs: { 0: 'def', 1: 'def', 2: 'def' }, world: { f: { 0: [10, 90, 10, 10], 1: [10, 10, 10, 10], 2: [10, 10, 10, 10] }, prep: { 0: ['AE-105'] } }, check(g, W, c) { c.ok(c.result.type === 'defense' && c.result.winnerPid === 0, 'P0 venceu defendendo'); const cap = [W.F[1], W.F[2]].filter(x => inD(g, 0, x)), bh = [W.F[1], W.F[2]].filter(x => inBH(g, x)); c.ok(cap.length === 1 && bh.length === 1, `captura 1, descarta 1: ${cap.length}/${bh.length}`); } });
  await scn('AE-106', 'atacando: captura os dois e as 2 cartas do topo de 1 derrotado vão ao Buraco Negro', { flip: { 0: true }, attrs: { 0: 'pod', 1: 'pod', 2: 'pod' }, world: { f: { 0: [90, 10, 10, 10], 1: [10, 10, 10, 10], 2: [10, 10, 10, 10] }, prep: { 0: ['AE-106'] } }, check(g, W, c) { const cap = [W.F[1], W.F[2]].filter(x => inD(g, 0, x)), bh = g.s.bh.filter(x => x.kind === 'normal'); c.ok(cap.length === 2 && bh.length === 2, `captura ${cap.length}/2, Buraco Negro ${bh.length}/2`); } });
  await scn('AE-107', 'troca o pior atributo pelo melhor', { n: 2, flip: { 0: true }, attrs: { 0: 'pod', 1: 'pod' }, world: { f: { 0: [10, 90, 40, 40], 1: [60, 60, 60, 60] }, prep: { 0: ['AE-107'] } }, check(g, W, c) { c.ok(c.result.winnerPid === 0 && c.result.value === 90, 'FOR 10 virou 90: ' + JSON.stringify(c.result)); } });
  await scn('AE-108', 'perdendo para ataque, a carta volta ao fundo do próprio baralho', { n: 2, flip: { 0: true }, attrs: { 0: 'pod', 1: 'pod' }, world: { f: { 0: [5, 5, 5, 5], 1: [90, 90, 90, 90] }, prep: { 0: ['AE-108'] } }, check(g, W, c) { c.ok(g.p(0).deck[g.p(0).deck.length - 1] === W.F[0] && !inD(g, 1, W.F[0]), 'F0 no fim do baralho de P0, não com P1'); } });
  await scn('AE-101', 'vitória prevalece: o marcador perde e NÃO captura (o vencedor leva)', { n: 2, flip: { 0: true }, attrs: { 0: 'def', 1: 'pod' }, world: { f: { 0: [20, 30, 20, 20], 1: [80, 10, 50, 10] }, prep: { 0: ['AE-101'] } }, check(g, W, c) { c.ok(c.result.winnerPid === 1, 'P1 venceu'); c.ok(inD(g, 1, W.F[0]) && !inD(g, 0, W.F[1]), 'P1 ficou com a carta de P0; P0 não capturou nada'); } });
  await scn('AE-109', 'vitória prevalece: quem desafia e perde não captura', { n: 2, flip: { 0: true }, attrs: { 0: 'pod', 1: 'pod' }, world: { f: { 0: [20, 20, 20, 20], 1: [85, 85, 85, 85] }, prep: { 0: ['AE-109'] } }, check(g, W, c) { c.ok(c.result.winnerPid === 1, 'P1 venceu'); c.ok(!inD(g, 0, W.F[1]), 'P0 não capturou F1'); } });
  await scn('AE-109', 'duelo condicionado: alvo com ≥80 no atributo escolhido', { n: 2, flip: { 0: true }, attrs: { 0: 'pod', 1: 'pod' }, world: { f: { 0: [95, 95, 95, 95], 1: [85, 85, 85, 85] }, prep: { 0: ['AE-109'] } }, check(g, W, c) { c.ok(inD(g, 0, W.F[1]), 'capturou F1 (85 em tudo, qualquer atributo serve)'); } });
  await scn('AE-109', 'condição não cumprida: nada acontece', { n: 2, flip: { 0: true }, world: { f: { 1: [50, 50, 50, 50] }, prep: { 0: ['AE-109'] } }, check(g, W, c) { c.ok(!inD(g, 0, W.F[1]) && inD(g, 1, W.F[1]), 'F1 fica com P1'); } });
  await scn('AE-110', 'perdeu por até 10: vira empate e desempata pela soma', { n: 2, flip: { 0: true }, attrs: { 0: 'pod', 1: 'pod' }, world: { f: { 0: [55, 90, 90, 90], 1: [60, 10, 10, 10] }, prep: { 0: ['AE-110'] } }, check(g, W, c) { c.ok(c.result.winnerPid === 0, 'P0 vence no desempate (soma): ' + JSON.stringify(c.result)); } });

  // ---------- Interações 111–120 ----------
  await scn('AE-111', 'força o rival a virar tudo', { n: 2, flip: { 0: true }, world: { prep: { 0: ['AE-111'], 1: ['AE-001', 'AE-002'] } }, check(g, W, c) { c.ok(g.p(1).prepared.length === 0 && inBH(g, W.S[1][0]) && inBH(g, W.S[1][1]), 'os 2 especiais de P1 foram virados e descartados'); } });
  await scn('AE-113', 'cancela o especial do rival', { n: 2, flip: { 0: true, 1: true }, attrs: { 0: 'pod', 1: 'pod' }, world: { f: { 0: [60, 60, 60, 60], 1: [50, 50, 50, 50] }, prep: { 0: ['AE-113'], 1: ['AE-001'] } }, check(g, W, c) { c.ok(c.result.winnerPid === 0, 'P0 vence (+15 de P1 cancelado)'); c.ok(inBH(g, W.S[1][0]), 'especial cancelado ao Buraco Negro'); } });
  await scn('AE-114', 'desvio: o roubo mirado em P0 vai para outro rival', { flip: { 0: true, 1: true }, world: { prep: { 0: ['AE-114'], 1: ['AE-032'] } }, check(g, W, c) { c.ok(cnt(g, 0, 'deck') === 5, 'P0 não perdeu'); c.ok(inD(g, 1, W.X[2][0]), 'P1 levou o topo de P2 (redirecionado)'); } });
  await scn('AE-115', 'eco: copia o efeito do rival', { n: 2, flip: { 0: true, 1: true }, attrs: { 0: 'pod', 1: 'pod' }, world: { prep: { 0: ['AE-115'], 1: ['AE-001'] } }, check(g, W, c) { c.ok(c.result.type === 'tie' || c.result.winnerPid == null, 'ambos 65 → empate: ' + JSON.stringify(c.result)); } });
  await scn('AE-116', 'apropria o especial usado do rival', { n: 2, flip: { 0: true, 1: true }, world: { prep: { 0: ['AE-116'], 1: ['AE-001'] } }, check(g, W, c) { c.ok(inD(g, 0, W.S[1][0]) && inBH(g, W.S[0][0]), 'P0 ficou com a carta de P1'); } });
  await scn('AE-117', 'expõe especiais preparados do rival', { n: 2, flip: { 0: true }, world: { prep: { 0: ['AE-117'], 1: ['AE-001', 'AE-002'] } }, check(g, W, c) { const pk = c.evs('peek'); c.ok(pk.length === 1 && pk[0].d.cards.length === 2, 'peek com 2 especiais'); c.ok(g.p(1).prepared.length === 2, 'continuam preparados'); } });
  await scn('AE-118', 'blindagem protege contra Interrupção', { n: 2, flip: { 0: ['AE-001', 'AE-118'], 1: ['AE-113'] }, attrs: { 0: 'pod', 1: 'pod' }, world: { f: { 0: [50, 50, 50, 50], 1: [60, 60, 60, 60] }, prep: { 0: ['AE-001', 'AE-118'], 1: ['AE-113'] } }, check(g, W, c) { c.ok(c.result.winnerPid === 0 && c.result.value === 65, '65 > 60: ' + JSON.stringify(c.result)); } });
  await scn('AE-119', 'embaralha a ordem dos baralhos de todos, menos o seu', { flip: { 0: true }, world: P('AE-119'), check(g, W, c) { c.ok(g.p(0).deck.slice(0, 4).join() === W.X[0].join(), 'baralho de P0 intacto'); c.ok(c.evs('reorder').length === 2, 'reorder para os 2 rivais'); } });
  await scn('AE-120', 'remove os bônus do rival', { n: 2, flip: { 0: true, 1: true }, attrs: { 0: 'pod', 1: 'pod' }, world: { f: { 0: [50, 50, 50, 50], 1: [45, 45, 45, 45] }, prep: { 0: ['AE-120'], 1: ['AE-001'] } }, check(g, W, c) { c.ok(c.result.winnerPid === 0 && c.result.value === 50, 'P0 50 > P1 45: ' + JSON.stringify(c.result)); } });

  // ---------- 129 e 130 ----------
  await scn('AE-129', 'vence a comparação', { n: 2, flip: { 0: true }, attrs: { 0: 'pod', 1: 'pod' }, world: { f: { 0: [5, 5, 5, 5], 1: [90, 90, 90, 90] }, prep: { 0: ['AE-129'] } }, check(g, W, c) { c.ok(c.result.winnerPid === 0, 'P0 venceu'); c.ok(inD(g, 0, W.F[1]), 'captura (ataque)'); } });
  await scn('AE-130', 'anula a última habilidade pendente', { n: 2, flip: { 0: true, 1: true }, attrs: { 0: 'pod', 1: 'pod' }, world: { f: { 0: [60, 60, 60, 60], 1: [50, 50, 50, 50] }, prep: { 0: ['AE-130'], 1: ['AE-001'] } }, check(g, W, c) { c.ok(c.result.winnerPid === 0, 'P0 vence'); c.ok(inBH(g, W.S[1][0]), 'especial de P1 consumido'); } });

  // ---------- redução de atributos do rival 131–134 ----------
  const rd = (id, title, f1, attr, expectV, who, extra) => scn(id, title, Object.assign({ n: 2, flip: { 0: true }, attrs: { 0: attr, 1: attr }, world: { f: { 0: [50, 50, 50, 50], 1: f1 }, prep: { 0: [id] } },
    check(g, W, c) { c.ok(c.result && c.result.winnerPid === who, `vencedor P${who}: ` + JSON.stringify(c.result)); c.ok(c.result && c.result.value === expectV, `valor ${expectV}, veio ${c.result && c.result.value}`); } }, extra || {}));
  await rd('AE-131', 'rival perde 15 em tudo', [60, 60, 60, 60], 'pod', 50, 0);
  await rd('AE-132', 'maior atributo do rival cai 25', [30, 40, 70, 30], 'int', 50, 0);
  await rd('AE-133', 'todos os rivais perdem 8 no atributo usado', [55, 55, 55, 55], 'vel', 50, 0);
  await scn('AE-134', 'reação: o rival perde 20 depois da revelação', { n: 2, flip: { 0: true }, attrs: { 0: 'pod', 1: 'pod' }, world: { f: { 0: [50, 50, 50, 50], 1: [65, 65, 65, 65] }, prep: { 0: ['AE-134'] } },
    check(g, W, c) { c.ok(c.result && c.result.winnerPid === 0 && c.result.value === 50, 'P0 50 > P1 45: ' + JSON.stringify(c.result)); } });

  await spec1('AE-135', '+12 pod', [40, 40, 40, 40], 'pod', 52); await spec1('AE-135', '+12 def', [40, 40, 40, 40], 'def', 52);
  await spec1('AE-136', '+12 int', [40, 40, 40, 40], 'int', 52); await spec1('AE-136', '+12 vel', [40, 40, 40, 40], 'vel', 52);
  for (const [id, a] of [['AE-137', 'pod'], ['AE-138', 'def'], ['AE-139', 'vel'], ['AE-140', 'int']]) await spec1(id, `+20 ${a}`, [40, 40, 40, 40], a, 60);
  await rd('AE-141', 'rival perde 12 em Força e Inteligência', [60, 60, 60, 60], 'pod', 50, 0);
  await spec1('AE-142', '+15 def', [40, 40, 40, 40], 'def', 55); await spec1('AE-142', '+15 vel', [40, 40, 40, 40], 'vel', 55);

  // ---------- Novas habilidades (AE-146…188), aprovadas em 02/11/2026 ----------
  const dm = (id, title, o) => scn(id, title, Object.assign({ n: 2, flip: { 0: true }, attrs: { 0: 'pod', 1: 'pod' } }, o));
  await dm('AE-146', '+25 no atributo mais fraco', { world: { f: { 0: [10, 60, 60, 60], 1: [20, 20, 20, 20] }, prep: { 0: ['AE-146'] } }, check(g, W, c) { c.ok(c.result.winnerPid === 0 && c.result.value === 35, 'valor 35: ' + JSON.stringify(c.result)); } });
  await dm('AE-148', '+12 em dois atributos', { world: { f: { 0: [40, 40, 40, 40], 1: [50, 50, 50, 50] }, prep: { 0: ['AE-148'] } }, check(g, W, c) { c.ok(c.result.winnerPid === 0 && c.result.value === 52, 'valor 52: ' + JSON.stringify(c.result)); } });
  await dm('AE-151', 'aposta vencida: +25', { world: { f: { 0: [30, 30, 30, 30], 1: [40, 40, 40, 40] }, prep: { 0: ['AE-151'] } }, check(g, W, c) { c.ok(c.result.winnerPid === 0 && c.result.value === 55, 'valor 55'); } });
  await dm('AE-151', 'aposta perdida: topo do baralho ao Buraco Negro', { world: { f: { 0: [10, 10, 10, 10], 1: [60, 60, 60, 60] }, prep: { 0: ['AE-151'] } }, check(g, W, c) { c.ok(c.result.winnerPid === 1 && inBH(g, W.X[0][0]), 'P1 venceu e X0[0] foi ao Buraco Negro'); } });
  await dm('AE-152', '+30 Força, −15 Resistência', { world: { f: { 0: [50, 50, 50, 50], 1: [60, 60, 60, 60] }, prep: { 0: ['AE-152'] } }, check(g, W, c) { c.ok(c.result.winnerPid === 0 && c.result.value === 80, 'valor 80'); } });
  await dm('AE-153', 'inverte maior e menor atributo do rival', { attrs: { 0: 'def', 1: 'def' }, world: { f: { 0: [50, 50, 50, 50], 1: [20, 90, 20, 20] }, prep: { 0: ['AE-153'] } }, check(g, W, c) { c.ok(c.result.winnerPid === 0, 'P1 perdeu o 90 de Resistência: ' + JSON.stringify(c.result)); } });
  await dm('AE-155', 'veta o melhor atributo do rival', { attrs: { 0: 'pod', 1: 'def' }, world: { f: { 0: [50, 50, 50, 50], 1: [20, 90, 20, 20] }, prep: { 0: ['AE-155'] } }, check(g, W, c) { c.ok(c.result.winnerPid === 0, 'P1 não pôde usar Resistência 90: ' + JSON.stringify(c.result)); } });
  await scn('AE-158', 'só a mesa vizinha disputa (o outro volta ao fim do baralho)', { flip: { 0: true }, attrs: { 0: 'pod', 1: 'pod', 2: 'pod' }, world: { f: { 0: [60, 60, 60, 60], 1: [99, 99, 99, 99], 2: [50, 50, 50, 50] }, prep: { 0: ['AE-158'] } }, check(g, W, c) { c.ok(c.result.winnerPid === 0 && g.p(1).deck[g.p(1).deck.length - 1] === W.F[1], 'P1 saiu da mesa e voltou ao fim do baralho'); } });
  await scn('AE-160', 'pular a rodada: carta ao fim do baralho', { flip: { 0: true }, attrs: { 0: 'pod', 1: 'pod', 2: 'pod' }, world: { f: { 0: [99, 99, 99, 99] }, prep: { 0: ['AE-160'] } }, check(g, W, c) { c.ok(c.result.winnerPid !== 0 && g.p(0).deck[g.p(0).deck.length - 1] === W.F[0], 'P0 não disputou e a carta foi ao fim'); } });
  await dm('AE-165', 'Fortaleza: imune a reduções', { world: { f: { 0: [50, 50, 50, 50], 1: [45, 45, 45, 45] }, prep: { 0: ['AE-165'], 1: ['AE-131'] } }, flip: { 0: true, 1: true }, check(g, W, c) { c.ok(c.result.winnerPid === 0, 'P0 manteve 50: ' + JSON.stringify(c.result)); } });
  await dm('AE-166', 'Armadilha: quem captura perde o topo do baralho', { world: { f: { 0: [10, 10, 10, 10], 1: [50, 50, 50, 50] }, prep: { 0: ['AE-166'] } }, check(g, W, c) { c.ok(c.result.winnerPid === 1 && inD(g, 1, W.F[0]) && inBH(g, W.X[1][0]), 'P1 capturou F0 e perdeu X1[0]'); } });
  await dm('AE-167', 'Eco protetor: carta capturada volta ao fundo do dono', { world: { f: { 0: [10, 10, 10, 10], 1: [50, 50, 50, 50] }, prep: { 0: ['AE-167'] } }, check(g, W, c) { c.ok(c.result.winnerPid === 1 && inD(g, 0, W.F[0]) && !inD(g, 1, W.F[0]), 'F0 voltou a P0'); } });
  await dm('AE-177', 'Atraso: ninguém usa habilidades', { flip: { 0: true, 1: true }, world: { f: { 0: [40, 40, 40, 40], 1: [30, 30, 30, 30] }, prep: { 0: ['AE-177'], 1: ['AE-001'] } }, check(g, W, c) { c.ok(c.result.winnerPid === 0 && c.result.value === 40, 'AE-001 de P1 ficou sem efeito: ' + JSON.stringify(c.result)); } });
  await dm('AE-179', 'Contragolpe: recaptura o topo do vencedor', { world: { f: { 0: [10, 10, 10, 10], 1: [50, 50, 50, 50] }, prep: { 0: ['AE-179'] } }, check(g, W, c) { c.ok(c.result.winnerPid === 1 && inD(g, 1, W.F[0]) && inD(g, 0, W.X[1][0]), 'P1 capturou F0 e P0 levou X1[0]'); } });
  await dm('AE-180', 'Margem larga: captura mais 1', { world: { f: { 0: [90, 90, 90, 90], 1: [30, 30, 30, 30] }, prep: { 0: ['AE-180'] } }, check(g, W, c) { c.ok(inD(g, 0, W.F[1]) && inD(g, 0, W.X[1][0]), 'P0 levou F1 e o topo de P1'); } });
  await dm('AE-182', 'Pausa: o rival pula a próxima', { world: { prep: { 0: ['AE-182'] } }, check(g, W, c) { c.ok(g.s.skip && g.s.skip.has(1), 'P1 marcado para pular'); } });
  await dm('AE-184', 'Cancelar fenômeno', { world: { f: { 0: [50, 50, 50, 50], 1: [40, 40, 40, 40] }, prep: { 0: ['AE-184'] } }, setup(g) { g.s.events = { [g.s.round]: { id: 'forca' } }; }, check(g, W, c) { c.ok(c.result.value === 50, 'sem +10 de Força: ' + JSON.stringify(c.result)); } });
  await dm('AE-186', 'Carta fantasma: clone −10 no baralho (a conservação conta +1 clone)', { allowClone: true, world: { f: { 1: [50, 50, 50, 50] }, prep: { 0: ['AE-186'] } }, check(g, W, c) { const d = g.p(0).deck, k = d[d.length - 1]; const cl = g.p(0).deck.find(x => String(x).includes('*')); c.ok(cl && E.CARDS[cl].stats.pod === 40, 'clone com Força 40 no baralho'); } });
  await dm('AE-187', 'Sacrifício heroico: +30 e a reserva paga', { world: { f: { 0: [50, 50, 50, 50], 1: [60, 60, 60, 60] }, prep: { 0: ['AE-187'] } }, check(g, W, c) { c.ok(c.result.winnerPid === 0 && c.result.value === 80 && inBH(g, W.R[0][0]), 'valor 80 e R0[0] no Buraco Negro'); } });
  await dm('AE-188', 'Reflexo: a redução volta ao autor', { flip: { 0: true, 1: true }, world: { f: { 0: [50, 50, 50, 50], 1: [60, 60, 60, 60] }, prep: { 0: ['AE-188'], 1: ['AE-131'] } }, check(g, W, c) { c.ok(c.result.winnerPid === 0, 'P1 sofreu −15 (45) e P0 manteve 50: ' + JSON.stringify(c.result)); } });
  await scn('AE-161', 'pega o topo do líder', { flip: { 0: true }, world: P('AE-161'), check(g, W, c) { c.ok(inD(g, 0, W.X[1][0]) || inD(g, 0, W.X[2][0]), 'P0 levou um topo'); } });
  await scn('AE-163', 'pega 1 da reserva do rival', { flip: { 0: true }, world: P('AE-163'), check(g, W, c) { c.ok(cnt(g, 1, 'reserve') + cnt(g, 2, 'reserve') === 5, 'um rival perdeu 1 da reserva'); } });
  await scn('AE-199', 'troca a reserva (quantidade da menor) às cegas', { flip: { 0: true }, world: { resN: 3, prep: { 0: ['AE-199'] } }, setup(g, W) { g.p(1).reserve = W.R[1].slice(0, 2); g.p(2).reserve = W.R[2].slice(0, 1); }, check(g, W, c) { c.ok(cnt(g, 0, 'reserve') === 3, 'P0 mantém 3'); c.ok(W.R[1].slice(0, 2).some(x => inR(g, 0, x)) || W.R[2].slice(0, 1).some(x => inR(g, 0, x)), 'P0 recebeu cartas de um rival'); } });
  // ---------- Guardiões de A União (200–203) ----------
  await scn('AE-200', 'Sacrifício astral bane duas cartas de cada outro jogador', { flip: { 0: true }, world: { prep: { 0: ['AE-200'] } }, check(g, W, c) { const d = c.evs('discard').filter(x => x.d.guardiao); c.ok(d.length === 4, 'quatro cartas descartadas: ' + d.length); c.ok(d.every(x => x.d.pid !== 0), 'o usuário não foi alvo'); } });
  await scn('AE-201', 'Troca de órbitas muda apenas os baralhos ativos', { n: 2, flip: { 0: true }, attrs: { 0: 'def', 1: 'def' }, world: { prep: { 0: ['AE-201'] } }, check(g, W, c) { c.ok(c.evs('swapDeck').length === 1, 'troca emitida'); c.ok(W.X[1].some(id => inD(g, 0, id)), 'P0 recebeu carta do baralho de P1'); } });
  await scn('AE-202', 'Pilhagem preparada toma todos os especiais adversários', { flip: { 0: true }, world: { prep: { 0: ['AE-202'], 1: ['AE-001'], 2: ['AE-002'] } }, check(g, W, c) { const d = c.evs('steal').filter(x => x.d.guardiao && x.d.zone === 'prepared'); c.ok(d.length === 2, 'dois especiais roubados: ' + d.length); c.ok(W.S[1].concat(W.S[2]).every(id => g.p(0).prepared.includes(id) || inBH(g, id)), 'especiais adversários saíram dos donos'); } });
  await scn('AE-203', 'Chamado da fenda recebe quatro cartas sem Guardião', { n: 2, flip: { 0: true }, allowCreate: 4, world: { prep: { 0: ['AE-203'] } }, check(g, W, c) { const e = c.evs('refill').find(x => x.d.guardiao); c.ok(!!e, 'reforço emitido'); c.ok(e && e.d.cards.length === 4, 'quatro cartas recebidas'); c.ok(e && e.d.cards.every(id => !/^G0/.test(id)), 'nenhuma carta de Guardião veio'); } });
  const all = Object.keys(E.SPECIALS).filter(k => !E.SPECIALS[k].stub); const miss = all.filter(k => !covered.has(k));
  if (!only) console.log('sem cenário:', miss.join(' ') || 'nenhum');
  console.log(`cenários ${total}, falhas ${fails}`);
  process.exit(fails ? 1 : 0);
})();
