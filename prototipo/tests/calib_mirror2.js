// Calibração de dois lados, combinada: todas as cartas = X, todos usam X; o jogador focal varre (val, aiMul), os outros usam a política atual.
// score = média ponderada de (vitórias − parte justa) em duelo, 3 e 4 jogadores. Adota só se superar a política atual por margem.
// uso: node tests/calib_mirror2.js N ids   → imprime JSON {id:[val, mulExtra]} e um resumo
const E = require('../engine.js'); const N = +process.argv[2] || 200; const only = (process.argv[3] || '').split(',').filter(Boolean);
const NPS = [[2, 1], [3, 1.5], [4, 1]], VALS = [0, 0.15, 0.3, 0.6, 1.0, 1.6, 2.5], MULS = [0.5, 0.8, 1, 1.3], MARGIN = +process.env.MARGIN || 4;
const orig = {}; Object.values(E.CARDS).forEach(c => orig[c.id] = c.especial);
async function run(id, pol) {
  Object.values(E.CARDS).forEach(c => { c.especial = id; }); let sc = 0, wt = 0; const per = [];
  for (const [np, wgt] of NPS) {
    let w = 0; for (let k = 0; k < N; k++) {
      const rot = k % np; const pl = [...Array(np).keys()].map(i => ({ name: 'B' + i, bot: true, avatar: i, pol: i === rot && pol ? pol : undefined }));
      const g = new E.Game({ players: pl, perPlayer: 10, ban106: process.env.BAN ? +process.env.BAN : undefined, difficulty: 'dificil', seed: 52000 + k * 19 + np, io: { notify: async () => { } } });
      if ((await g.run()) === rot) w++;
    }
    const pct = 100 * w / N; per.push(pct.toFixed(0)); sc += wgt * (pct - 100 / np); wt += wgt;
  }
  return { s: sc / wt, per };
}
(async () => {
  const out = {};
  for (const id of only) {
    const cur = await run(id, null), rows = [];
    for (const val of VALS) for (const mul of MULS) { if (val === 0 && mul !== 1) continue; rows.push(Object.assign({ val, mul }, await run(id, { val, mul }))); }
    const never = rows.find(r => r.val === 0), best = rows.slice().sort((a, b) => b.s - a.s)[0], use = best.s > cur.s + MARGIN;
    out[id] = use ? [best.val, best.mul] : null;
    console.log(id, E.SPECIALS[id].nome.padEnd(26), `atual ${cur.s.toFixed(1)} [${cur.per}] (val ${E.SPECIALS[id].val})  nunca ${never.s.toFixed(1)}  melhor ${best.s.toFixed(1)} [${best.per}] val ${best.val} ×${best.mul}  ${use ? '→ ADOTA' : 'mantém'}`);
  }
  Object.values(E.CARDS).forEach(c => { c.especial = orig[c.id]; });
  console.log(JSON.stringify(out));
})();
