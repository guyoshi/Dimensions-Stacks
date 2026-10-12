// Valor de cada especial para o bot: todas as cartas ganham o especial X; um bot o usa, o outro nunca. Mostra % de vitórias de quem usa.
const E = require('../engine.js'); const N = +process.argv[2] || 60; const only = process.argv[3] && process.argv[3] !== '*' ? process.argv[3].split(',') : null; const NP = +process.argv[4] || 2; const diffArg = process.argv[5] || 'dificil';
const orig = {}; Object.values(E.CARDS).forEach(c => orig[c.id] = c.especial);
(async () => {
  const used = [...new Set(Object.values(orig))].sort(); const res = [];
  for (const id of used) {
    if (only && !only.includes(id)) continue;
    Object.values(E.CARDS).forEach(c => { c.especial = id; });
    let w = 0, act = 0, comb = 0;
    for (let k = 0; k < N; k++) {
      const rot = k % NP; const pl = [...Array(NP).keys()].map(i => ({ name: 'B' + i, bot: true, avatar: i, noSpecial: i !== rot }));
      const g = new E.Game({ players: pl, perPlayer: 10, difficulty: diffArg, seed: 4000 + k * 13, io: { notify: async (t, d) => { if (t === 'effectStart' && d.act.pid === rot) act++; } } });
      const win = await g.run(); if (win === rot) w++; comb += g.s.combats;
    }
    res.push({ id, nome: E.SPECIALS[id].nome, win: Math.round(100 * w / N), uso: +(act / (comb / NP)).toFixed(2) });
  }
  Object.values(E.CARDS).forEach(c => { c.especial = orig[c.id]; });
  res.sort((a, b) => a.win - b.win);
  res.forEach(r => console.log(r.id, String(r.win).padStart(3) + '%', 'usos/disputa', r.uso, r.nome));
  console.log('média', Math.round(res.reduce((t, r) => t + r.win, 0) / res.length) + '%');
})();
