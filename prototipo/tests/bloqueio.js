// Bloqueio Dimensional: em toda disputa da rodada com o evento há um atributo bloqueado, diferente do da disputa anterior, e ninguém o escolhe.
const E = require('../engine.js'); const N = +process.argv[2] || 60;
(async () => {
  let jogos = 0, disputas = 0, falhas = 0, vistos = new Set();
  for (let k = 0; k < N; k++) {
    const players = ['facil', 'normal', 'dificil', 'dificil'].map((d, i) => ({ name: 'B' + i, bot: true, avatar: i, diff: d }));
    let last = null;
    const g = new E.Game({ players, perPlayer: 14, difficulty: 'normal', seed: 9100 + k * 17, events: true, io: { notify: async (t, d) => {
      if (t === 'ready') { const o = {}; for (let r = 1; r <= 200; r++) o[r] = { id: 'bloqueio' }; g.s.events = o; }
      if (t === 'combatEnd') {
        const c = d.combat; disputas++;
        if (!c.blocked) { falhas++; console.log('sem bloqueado', k); return; }
        vistos.add(c.blocked);
        if (c.blocked === last) { falhas++; console.log('repetiu bloqueado', k, c.blocked); }
        last = c.blocked;
        const uni = c.ctl && c.ctl.universal;
        c.entries.forEach(e => { if (!e.withdrawn && e.attr === c.blocked && !uni) { falhas++; console.log('escolheu o bloqueado', k, e.pid, e.attr); } });
      }
    } } });
    await g.run(); jogos++;
  }
  console.log('jogos', jogos, 'disputas', disputas, 'atributos vistos', [...vistos].join(','), 'falhas', falhas);
  process.exit(falhas ? 1 : 0);
})();
