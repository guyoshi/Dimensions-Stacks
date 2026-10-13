const E = require('/home/claude/ds-repo/prototipo/engine.js');
const N = +process.argv[2] || 400;
(async () => {
  const out = {};
  for (const n of [2, 3, 4]) {
    const st = {};
    for (let k = 0; k < N; k++) {
      const pl = [...Array(n)].map((_, i) => ({ name: 'B' + i, bot: true, avatar: i, noSpecial: true }));
      const g = new E.Game({ players: pl, perPlayer: n === 2 ? 20 : n === 3 ? 14 : 10, difficulty: 'dificil', seed: 91000 + k * 17 + n, io: { notify: async (t, d) => {
        if (t === 'combatEnd') { const c = d.combat; const w = g.evaluate(c, true); const ws = new Set(w.winners.map(e => e.pid));
          c.entries.forEach(e => { if (e.withdrawn || !e.card) return; const s = st[e.card] || (st[e.card] = { p: 0, w: 0, ini: 0, iw: 0 }); s.p++; if (ws.has(e.pid) && !w.tie) s.w++; if (e.pid === c.initiator || e.initiator) { s.ini++; if (ws.has(e.pid) && !w.tie) s.iw++; } }); }
      } } });
      await g.run();
    }
    out[n] = st;
  }
  require('fs').writeFileSync('/tmp/bal/cardsim.json', JSON.stringify(out));
  console.log('ok');
})();
