// Calibra, por especial, o "val" (quanto vale gastar uma carta para prepará-lo) e a escala da vontade de virar (aiMul).
// Todas as cartas ganham o especial X; um bot o usa, o outro nunca. Escolhe a combinação com mais vitórias (média de duelo e 3 jogadores).
const E = require('../engine.js'); const N = +process.argv[2] || 300; const only = (process.argv[3] || '').split(',').filter(Boolean);
const VALS = [0, 0.15, 0.3, 0.6, 1.0, 1.6, 2.5, 4], MULS = [0.35, 0.65, 1];
const orig = {}; Object.values(E.CARDS).forEach(c => orig[c.id] = c.especial);
async function run(id, NP, val, mul) {
  const sp = E.SPECIALS[id]; sp.val = val; const ai0 = sp._ai0 || (sp._ai0 = sp.ai); sp.ai = ai0 ? (ctx, pid, c) => ai0(ctx, pid, c) * mul : ai0;
  Object.values(E.CARDS).forEach(c => { c.especial = id; }); let w = 0, act = 0, comb = 0;
  for (let k = 0; k < N; k++) {
    const rot = k % NP; const pl = [...Array(NP).keys()].map(i => ({ name: 'B' + i, bot: true, avatar: i, noSpecial: i !== rot }));
    const g = new E.Game({ players: pl, perPlayer: 10, difficulty: 'dificil', seed: 12000 + k * 13, io: { notify: async (t, d) => { if (t === 'effectStart' && d.act.pid === rot) act++; } } });
    const win = await g.run(); if (win === rot) w++; comb += g.s.combats;
  }
  return { w: 100 * w / N, u: act / (comb / NP) };
}
(async () => {
  const out = {};
  for (const id of only) {
    const rows = [];
    for (const val of VALS) for (const mul of MULS) { if (val === 0 && mul !== 1) continue; const a = await run(id, 2, val, mul), b = await run(id, 3, val, mul); rows.push({ val, mul, w2: a.w, w3: b.w, u2: a.u, u3: b.u, score: a.w + (b.w * 1.5) }); }
    if (process.env.V) rows.forEach(r => console.log('   val', r.val, '×' + r.mul, 'duelo', r.w2.toFixed(0) + '%', 'usos', r.u2.toFixed(2), '3j', r.w3.toFixed(0) + '%', 'usos', r.u3.toFixed(2)));
    const base = rows.find(r => r.val === 0); const best = rows.slice().sort((x, y) => y.score - x.score)[0];
    const use = best.score > base.score + 10 ? best : base;   // só adota se superar claramente o "nunca usar"
    out[id] = { val: use.val, mul: use.mul, w2: use.w2.toFixed(0), w3: use.w3.toFixed(0), u2: use.u2.toFixed(2), base2: base.w2.toFixed(0), base3: base.w3.toFixed(0) };
    console.log(id, E.SPECIALS[id].nome.padEnd(26), `val ${use.val} ×${use.mul}  duelo ${out[id].w2}% (base ${out[id].base2}%)  3j ${out[id].w3}% (base ${out[id].base3}%)  usos ${out[id].u2}`);
  }
  Object.values(E.CARDS).forEach(c => { c.especial = orig[c.id]; });
  console.log(JSON.stringify(Object.fromEntries(Object.entries(out).map(([k, v]) => [k, [v.val, v.mul]]))));
})();
