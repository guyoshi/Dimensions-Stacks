// Win rate de cartas portadoras (Quasar, Príncipes, Guardiões): mão fixa 7x7, 1v1 e 3 jogadores, com o especial vs sem o especial.
const E = require('../engine.js'); const N = +process.argv[2] || 200; const diff = process.argv[3] || 'dificil';
const only = process.argv[4] ? process.argv[4].split(',') : null;
const all = Object.values(E.CARDS); const norm = all.filter(c => /^[A-Z]\d+$/.test(c.id) && !/^(Q|P|G)\d/.test(c.id) && !c.uniao);
const car = all.filter(c => /^(Q|P|G)\d/.test(c.id) && (!only || only.includes(c.id)));
function rng(s) { return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
async function run(c, esp, np) {
  const orig = c.especial; c.especial = esp; let w = 0, act = 0, comb = 0;
  for (let k = 0; k < N; k++) {
    const r = rng(777 + k * 31); const pool = norm.map(x => x.id).sort(() => r() - .5); const rot = k % np;
    const maos = []; let q = 0; for (let i = 0; i < np; i++) maos.push(pool.slice(q, q += 7));
    maos[rot][6] = c.id;
    const pl = [...Array(np).keys()].map(i => ({ name: 'B' + i, bot: true, avatar: i, diff }));
    const g = new E.Game({ players: pl, maos, difficulty: diff, seed: 9000 + k * 17, io: { notify: async (t, d) => { if (t === 'effectStart' && d.act.pid === rot && d.act.card === c.id) act++; } } });
    const win = await g.run(); if (win === rot) w++; comb += g.s.combats;
  }
  c.especial = orig; return { w: 100 * w / N, act: act / N };
}
(async () => {
  for (const np of [2, 3]) {
    console.log('--- ' + np + ' jogadores, N=' + N + ', ' + diff + ' (base ' + Math.round(100 / np) + '%)');
    for (const c of car) {
      const a = await run(c, c.especial, np), b = await run(c, null, np);
      console.log(c.id.padEnd(4), (c.nome || '').slice(0, 22).padEnd(23), c.especial, 'com', a.w.toFixed(0).padStart(3) + '%', 'sem', b.w.toFixed(0).padStart(3) + '%', 'Δ', (a.w - b.w >= 0 ? '+' : '') + (a.w - b.w).toFixed(0), 'usos/jogo', a.act.toFixed(2), E.SPECIALS[c.especial] ? E.SPECIALS[c.especial].nome : '');
    }
  }
})();
