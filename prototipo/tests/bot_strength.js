// Usar especiais deve valer a pena: bot que usa especiais × bot que nunca usa (duelo e 3 jogadores).
const E = require('../engine.js'); const N = +process.argv[2] || 80; const diff = process.argv[3] || 'dificil';
(async () => {
  for (const n of [2, 3]) {
    let w = 0, l = 0, d = 0;
    for (let k = 0; k < N; k++) {
      const players = [...Array(n)].map((_, i) => ({ name: 'B' + i, bot: true, avatar: i, noSpecial: i > 0 }));
      const rot = k % n; const pl = players.map((p, i) => ({ ...p, noSpecial: i !== rot }));
      const g = new E.Game({ players: pl, perPlayer: 10, difficulty: diff, seed: 7000 + k * 11 + n, io: { notify: async () => {} } });
      const win = await g.run(); if (win == null) d++; else if (win === rot) w++; else l++;
    }
    console.log(`${n} jogadores · ${diff}: com especiais ${w} · sem especiais ${l} · empates ${d}  (esperado justo: ${(100 / n).toFixed(0)}% de vitórias do que usa)`);
  }
})();
