// "Ver cálculo": o resumo da disputa deve ser coerente (base + partes + extras = total; vencedor tem o maior total ou desempate/autoWin)
const E = require('../engine.js'); const N = +process.argv[2] || 80;
let disputes = 0, bad = 0, withParts = 0, other = 0, tbs = 0, canc = 0;
(async () => {
  for (let k = 0; k < N; k++) {
    const n = 2 + (k % 3), players = [...Array(n)].map((_, i) => ({ name: 'J' + i, bot: true, avatar: i, diff: ['facil', 'normal', 'dificil'][(k + i) % 3] }));
    const io = { notify: async (type, d) => { if (type !== 'resolved') return; const c = d.calc; disputes++;
      if (!c) { bad++; console.log('sem calc'); return; }
      for (const r of c.rows) { if (!r.attr || r.withdrawn) continue; const sum = r.base + r.parts.reduce((t, m) => t + m.d, 0) + r.bonus;
        if (sum !== r.total) { bad++; if (bad < 8) console.log('soma incoerente', JSON.stringify(r), sum); }
        if (r.parts.some(m => m.d)) withParts++; if (r.parts.some(m => m.other && m.d)) other++; }
      if (c.tb) tbs++; canc += c.acts.filter(a => a.cancelled).length;
      if (d.result.winnerPid != null) { const live = c.rows.filter(r => !r.withdrawn), w = live.find(r => r.pid === d.result.winnerPid);
        if (!w) { bad++; console.log('vencedor ausente'); return; }
        if (!w.autoWin && !c.tb && live.some(r => r.total > w.total + (r.margin ? 10 : 0))) { bad++; if (bad < 8) console.log('vencedor sem maior total', JSON.stringify(c.rows.map(r => [r.pid, r.total, r.margin]))); } } } };
    const G = new E.Game({ players, perPlayer: 8, difficulty: 'normal', seed: 4100 + k * 11, io }); await G.run();
  }
  console.log(`disputas ${disputes}, com bônus ${withParts}, de adversário ${other}, desempates ${tbs}, anulados ${canc}, incoerências ${bad}`); process.exit(bad ? 1 : 0);
})();
