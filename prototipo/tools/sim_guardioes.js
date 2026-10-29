// Simulação dos 4 guardiões (jogador = bot difícil com as melhores cartas disponíveis; guardiões = bots difíceis com baralhos épicos/lendários).
// Uso: node tools/sim_guardioes.js [partidas] [N jogador] [M guardião]
const E = require('../engine.js'); const D = global.DS_DATA || globalThis.DS_DATA || (require('../data.js'), globalThis.DS_DATA);
const AT = ['pod', 'def', 'int', 'vel'], sum = c => AT.reduce((t, a) => t + c.stats[a], 0), pw = c => sum(c) + 16 * Math.max(...AT.map(a => c.stats[a]));
const NU = D.CARTAS.filter(c => !c.uniao && c.id !== 'S11').sort((a, b) => pw(b) - pw(a)), UN = D.CARTAS.filter(c => c.uniao);
const rngF = s => { let a = s >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const CFGS = {
  G1: { regra: { id: 'g_duo' }, teams: [[0], [1, 2]], teamPool: false },
  G2: { regra: { id: 'g_roubo' }, simbolos: { val: 5 } },
  G3: { regra: { id: 'g_bloco' } },
  G4: { events: true, evTodas: true, bhRefill: [1] },
};
const total = g => { let n = g.s.bh.length; g.s.players.forEach(p => { n += p.deck.length + p.reserve.length + p.prepared.length; }); if (g.s.blk) Object.values(g.s.blk.held).forEach(h => { n += h.length; }); return n; };
async function jogo(id, k, N, M, P) {
  const R = rngF(900 + k * 7), pick = (a, n) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b.slice(0, n); };
  const dono = P.nuniao != null ? pick(UN.map(c => c.id), P.nuniao) : P.uniao ? UN.map(c => c.id) : []; const mao = dono.concat(NU.slice(P.off || 0, (P.off || 0) + (P.pool || 30)).map(c => c.id)).sort((a, b) => pw(D.CARTAS.find(c => c.id === b)) - pw(D.CARTAS.find(c => c.id === a))).slice(0, N);
  const used = new Set(mao), RARO = r => D.CARTAS.filter(c => !c.uniao && c.id !== 'S11' && c.raridade === r && !used.has(c.id));
  const deckG = (ix) => { const d = []; const av = (process.env.AVS || '').split(',')[ix || 0]; if (av) { d.push(av); used.add(av); } const rec = ['rara'].concat(Array(3).fill('epica'), Array(3).fill('lendaria')); for (let i = d.length; i < M; i++) { const r = process.env.RAR ? process.env.RAR : i < 1 ? 'rara' : i % 2 ? 'epica' : 'lendaria'; const c = process.env.WEAK ? RARO(r).filter(x => !d.includes(x.id)).sort((x, y) => sum(x) - sum(y))[Math.floor(R() * 6)] : pick(RARO(r).filter(x => !d.includes(x.id)), 1)[0]; if (c) { d.push(c.id); used.add(c.id); } } return d; };
  const g1 = deckG(0), g2 = id === 'G1' ? deckG(1) : null;
  const players = [{ name: 'Você', bot: true, diff: P.diff || 'dificil' }, { name: 'G1', bot: true, diff: 'dificil' }].concat(g2 ? [{ name: 'G2', bot: true, diff: 'dificil' }] : []);
  let exp = null, err = null;
  const g = new E.Game(Object.assign({ players, perPlayer: N, difficulty: 'dificil', specialsFrom: 2, events: false, maxCombats: 100, seed: 3000 + k * 17, maos: g2 ? [mao, g1, g2] : [mao, g1], io: { notify: async (t) => {
    if (t === 'ready') exp = total(g); if (exp != null && ['combatEnd', 'end'].includes(t) && total(g) !== exp) err = err || ('conservação ' + t + ' ' + total(g) + '!=' + exp); } } }, CFGS[id]));
  const w = await g.run(); return { w, rounds: g.s.round, combats: g.s.combats, lim: !!g.s.byLimit, err, mine: g.totalCards(g.p(0)) };
}
(async () => {
  const n = +process.argv[2] || 60, ids = (process.argv[3] || 'G1,G2,G3,G4').split(','), Ns = (process.argv[4] || '10').split(',').map(Number), Ms = (process.argv[5] || '7').split(',').map(Number), cen = process.argv[6] || 'cheia';
  const P = cen === 'media' ? { nuniao: 4, off: 5, pool: 20 } : cen === 'sem' ? { uniao: false, off: 25, pool: 20 } : cen === 'meia' ? { uniao: false, off: 8, pool: 20 } : { uniao: true, pool: 30 };   // cheia: 8 da União + 30 melhores; meia: União + 12; sem: 14 melhores sem União
  for (const id of ids) for (const N of Ns) for (const M of Ms) {
    let v = 0, rod = 0, lim = 0, errs = 0, fail = 0; for (let k = 0; k < n; k++) { try { const r = await jogo(id, k, N, M, P); if (r.w === 0) v++; rod += r.rounds; if (r.lim) lim++; if (r.err) { errs++; if (errs === 1) console.log(' ', r.err); } } catch (e) { fail++; if (fail === 1) console.log(' erro', e.message.slice(0, 160)); } }
    console.log(id, cen, `N${N} M${M}: vitória ${(100 * v / n).toFixed(0)}% · rodadas ${(rod / n).toFixed(1)} · limite ${lim} · conservação ${errs} · falhas ${fail}`);
  }
})();
