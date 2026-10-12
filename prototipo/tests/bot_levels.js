// Equilíbrio entre dificuldades: confrontos diretos (fácil × médio × difícil), com e sem especiais.
const E = require('../engine.js'); const N = +process.argv[2] || 150;
const nm = { facil: 'fácil', normal: 'médio', dificil: 'difícil' };
async function match(diffs, noSpecial, k) {
  const n = diffs.length, rot = k % n; const order = diffs.map((_, i) => diffs[(i + rot) % n]);
  const players = order.map((d, i) => ({ name: 'B' + i, bot: true, avatar: i, diff: d, noSpecial }));
  const g = new E.Game({ players, perPlayer: 10, difficulty: 'normal', seed: 9100 + k * 13 + n, io: { notify: async () => {} } });
  const w = await g.run(); return w == null ? null : order[w];
}
(async () => {
  for (const noSpecial of [true, false]) {
    console.log(noSpecial ? '— SEM especiais (só leitura de atributos) —' : '— COM especiais —');
    for (const set of [['facil', 'normal'], ['normal', 'dificil'], ['facil', 'dificil'], ['facil', 'normal', 'dificil']]) {
      const c = {}; set.forEach(d => c[d] = 0); let draw = 0;
      for (let k = 0; k < N; k++) { const w = await match(set, noSpecial, k); if (w == null) draw++; else c[w]++; }
      console.log(set.map(d => `${nm[d]} ${(100 * c[d] / N).toFixed(0)}%`).join(' · '), draw ? `· sem vencedor ${draw}` : '', `(justo ${(100 / set.length).toFixed(0)}%)`);
    }
  }
})();
