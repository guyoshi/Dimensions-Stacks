// Benchmark de DOIS LADOS: todas as cartas têm o especial X e TODOS os jogadores o usam (reações incluídas).
// Um jogador focal testa a política (val, aiMul); os demais usam a política atual do jogo. Compara com "nunca usar" e com a política atual.
// uso: node tests/calib_mirror.js N NP ids   (NP = 2, 3 ou 4)   V=1 mostra a grade.
const E = require('../engine.js'); const N = +process.argv[2] || 200; const NP = +process.argv[3] || 2; const only = (process.argv[4] || '').split(',').filter(Boolean);
const VALS = [0, 0.15, 0.3, 0.6, 1.0, 1.6, 2.5], MULS = [0.65, 1];
const orig = {}; Object.values(E.CARDS).forEach(c => orig[c.id] = c.especial);
async function run(id, pol, np) {
  Object.values(E.CARDS).forEach(c => { c.especial = id; }); let w = 0, act = 0, comb = 0;
  for (let k = 0; k < N; k++) {
    const rot = k % np; const pl = [...Array(np).keys()].map(i => ({ name: 'B' + i, bot: true, avatar: i, pol: i === rot && pol ? pol : undefined }));
    const g = new E.Game({ players: pl, perPlayer: 10, difficulty: 'dificil', seed: 31000 + k * 17, io: { notify: async (t, d) => { if (t === 'effectStart' && d.act.pid === rot) act++; } } });
    const win = await g.run(); if (win === rot) w++; comb += g.s.combats;
  }
  return { w: 100 * w / N, u: act / (comb / np) };
}
(async () => {
  const out = {};
  for (const id of only) {
    const cur = await run(id, null, NP), rows = [];
    for (const val of VALS) for (const mul of MULS) { if (val === 0 && mul !== 1) continue; rows.push(Object.assign({ val, mul }, await run(id, { val, mul }, NP))); }
    if (process.env.V) rows.forEach(r => console.log('   val', r.val, '×' + r.mul, r.w.toFixed(0) + '%', 'usos', r.u.toFixed(2)));
    const never = rows.find(r => r.val === 0), best = rows.slice().sort((a, b) => b.w - a.w)[0], fair = 100 / NP;
    out[id] = { cur: cur.w, never: never.w, best: best.w, bv: best.val, bm: best.mul };
    console.log(id, E.SPECIALS[id].nome.padEnd(26), `atual ${cur.w.toFixed(0)}% (val ${E.SPECIALS[id].val} usos ${cur.u.toFixed(2)})  nunca ${never.w.toFixed(0)}%  melhor ${best.w.toFixed(0)}% (val ${best.val} ×${best.mul})  justo ${fair.toFixed(0)}%`);
  }
  Object.values(E.CARDS).forEach(c => { c.especial = orig[c.id]; });
  console.log(JSON.stringify(out));
})();
