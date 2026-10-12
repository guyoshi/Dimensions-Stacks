// Taxa de preparo por força da carta do topo, por nível: o fácil gasta carta forte mais que o difícil.
const E = require('../engine.js'); const nm = { facil: 'fácil', normal: 'médio', dificil: 'difícil' };
const S = Object.values(E.CARDS).map(c => E.sum4(c.stats)).sort((a, b) => a - b); const pc = s => S.filter(x => x <= s).length / S.length;
(async () => {
  for (const d of ['facil', 'normal', 'dificil']) {
    const b = { fraca: [0, 0], media: [0, 0], forte: [0, 0] };
    for (let k = 0; k < 150; k++) {
      const pl = [0, 1, 2].map(i => ({ name: 'B' + i, bot: true, avatar: i, diff: d }));
      const g = new E.Game({ players: pl, perPlayer: 12, difficulty: d, seed: 91000 + k * 5, io: { notify: async () => {} } });
      const orig = g.bot_prepare.bind(g); g.bot_prepare = async (p, top) => { const r = await orig(p, top); const q = pc(E.sum4(E.CARDS[top].stats)); const key = q < 0.33 ? 'fraca' : q < 0.66 ? 'media' : 'forte'; b[key][0]++; if (r) b[key][1]++; return r; };
      await g.run();
    }
    console.log(nm[d].padEnd(7), Object.entries(b).map(([k, v]) => `${k}: prepara ${(100 * v[1] / v[0]).toFixed(0)}%`).join(' · '));
  }
})();
