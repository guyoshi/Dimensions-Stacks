// Equilíbrio entre atributos: (1) distribuição de valores nas cartas base; (2) em partidas reais de CPU: quanto cada atributo é escolhido e a taxa de vitória de quem escolhe cada um, por faixa de valor.
const E = require('../../engine.js'); const N = +process.argv[2] || 150; const AID = ['pod', 'def', 'int', 'vel'];
const base = Object.values(E.CARDS).filter(c => c.raridade !== 'quasar');
console.log('== cartas base:', base.length);
for (const a of AID) { const v = base.map(c => c.stats[a]).sort((x, y) => x - y), n = v.length, q = p => v[Math.floor(p * (n - 1))], top = base.filter(c => AID.every(b => c.stats[a] >= c.stats[b])).length;
  console.log(a, 'média', (v.reduce((s, x) => s + x, 0) / n).toFixed(1), 'p25', q(.25), 'p50', q(.5), 'p75', q(.75), 'p90', q(.9), 'máx', v[n - 1], '≥75:', v.filter(x => x >= 75).length, '≥80:', v.filter(x => x >= 80).length, 'é o melhor atributo da carta:', top); }
const faixas = [[0, 40], [40, 55], [55, 70], [70, 85], [85, 200]];
(async () => {
  const st = {}; AID.forEach(a => { st[a] = { n: 0, w: 0, f: faixas.map(() => ({ n: 0, w: 0 })) }; });
  for (const NP of [2, 3, 4]) for (let k = 0; k < N; k++) {
    const pl = [...Array(NP)].map((_, i) => ({ name: 'B' + i, bot: true, avatar: i }));
    const g = new E.Game({ players: pl, perPlayer: 10, difficulty: 'dificil', seed: 91000 + k * 17 + NP, io: { notify: async (t, d) => {
      if (t === 'combatEnd' && d.combat) { const c = d.combat, w = g.evaluate(c, true); if (w.none || w.tie) return;
        c.entries.forEach(e => { if (!e.attr || e.withdrawn) return; const v = e.stats[e.attr] + e.bonus, win = w.winners.includes(e), s = st[e.attr]; s.n++; if (win) s.w++; const f = faixas.findIndex(([lo, hi]) => v >= lo && v < hi); s.f[f].n++; if (win) s.f[f].w++; }); } } } });
    await g.run();
  }
  console.log('== partidas de CPU (2/3/4 jogadores):');
  for (const a of AID) { const s = st[a]; console.log(a, 'escolhido', s.n, 'vitória', (100 * s.w / s.n).toFixed(1) + '%', '| por faixa de valor:', s.f.map((x, i) => `${faixas[i][0]}+:${x.n ? (100 * x.w / x.n).toFixed(0) : '-'}%(${x.n})`).join(' ')); }
})();
