// uso: node sim_duplas_variantes.js [N]  — compara variantes do modo em duplas (bots difíceis, especiais ligados)
const E = require('../engine.js'); const N = +process.argv[2] || 1000;
const V = { 'base': {}, 'reserva compartilhada': { teamShare: true }, 'doação 2': { teamGive: 2 }, 'doação 3': { teamGive: 3 }, 'compartilhada+doação 2': { teamShare: true, teamGive: 2 }, 'queda derrota a dupla': { teamFall: true } };
(async () => {
  for (const [name, ex] of Object.entries(V)) {
    let len = 0, rounds = 0, a = 0, crisisWin = 0, crisisN = 0, gave = 0, lim = 0, solo = 0;
    for (let k = 0; k < N; k++) {
      const pl = [...Array(4)].map((_, i) => ({ name: 'B' + i, bot: true, avatar: i }));
      const g = new E.Game(Object.assign({ players: pl, perPlayer: 10, difficulty: 'dificil', seed: 61000 + k * 37, teams: [[0, 2], [1, 3]], io: {} }, ex));
      await g.run(); len += g.s.combats; rounds += g.s.round; if (g.s.winnerTeam === 't0') a++; if (g.s.byLimit) lim++; gave += g.s.gave || 0;
      if (g.s.crisis != null) { crisisN++; if (g.s.winnerTeam === g.s.crisis) crisisWin++; }
      if (g.alive().length === 1) solo++;
    }
    console.log(name.padEnd(24), 'disputas', (len / N).toFixed(0), 'rodadas', (rounds / N).toFixed(1), '| dupla A', (a / N * 100).toFixed(1) + '%', '| 1ª queda vence', crisisN ? (crisisWin / crisisN * 100).toFixed(1) + '%' : '—', '(' + crisisN + ')', '| doações/partida', (gave / N).toFixed(2), '| fim com 1 vivo', (solo / N * 100).toFixed(0) + '%', '| limite', lim);
  }
})();
