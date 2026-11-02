// Para cada portadora, testa habilidades candidatas do banco: win rate médio (2 e 3 jogadores) vs sem especial.
const E = require('../engine.js'); const N = +process.argv[2] || 300; const diff = 'dificil';
const car = process.argv[3].split(','); const cand = process.argv[4].split(',');
const all = Object.values(E.CARDS); const norm = all.filter(c => /^[A-Z]\d+$/.test(c.id) && !/^(Q|P|G)\d/.test(c.id) && !c.uniao);
function rng(s) { return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
async function run(c, esp, np) {
  const orig = c.especial; c.especial = esp; let w = 0, act = 0;
  for (let k = 0; k < N; k++) {
    const r = rng(777 + k * 31); const pool = norm.map(x => x.id).sort(() => r() - .5); const rot = k % np;
    const maos = []; let q = 0; for (let i = 0; i < np; i++) maos.push(pool.slice(q, q += 7)); maos[rot][6] = c.id;
    const pl = [...Array(np).keys()].map(i => ({ name: 'B' + i, bot: true, avatar: i, diff }));
    const g = new E.Game({ players: pl, maos, difficulty: diff, seed: 9000 + k * 17, io: { notify: async (t, d) => { if (t === 'effectStart' && d.act.pid === rot && d.act.card === c.id) act++; } } });
    if ((await g.run()) === rot) w++;
  }
  c.especial = orig; return [100 * w / N, act / N];
}
(async () => {
  for (const id of car) {
    const c = E.CARDS[id]; const base = [await run(c, null, 2), await run(c, null, 3)]; const b = (base[0][0] + base[1][0]) / 2;
    const cur = [await run(c, c.especial, 2), await run(c, c.especial, 3)];
    console.log('\n' + id, c.nome, 'atual', c.especial, E.SPECIALS[c.especial].nome, 'média', ((cur[0][0] + cur[1][0]) / 2).toFixed(0), '| sem', b.toFixed(0));
    const rs = [];
    for (const e of cand) { if (!E.SPECIALS[e]) continue; const a = [await run(c, e, 2), await run(c, e, 3)]; rs.push({ e, m: (a[0][0] + a[1][0]) / 2, u: (a[0][1] + a[1][1]) / 2 }); }
    rs.sort((x, y) => y.m - x.m).slice(0, 8).forEach(r => console.log('  ', r.e, E.SPECIALS[r.e].nome.padEnd(24), r.m.toFixed(0).padStart(3) + '%', 'Δ', (r.m - b >= 0 ? '+' : '') + (r.m - b).toFixed(0), 'uso', r.u.toFixed(2)));
  }
})();
