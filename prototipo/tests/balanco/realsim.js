const E = require(process.argv[3] || '/home/claude/ds-repo/prototipo/engine.js');
const N = +process.argv[2] || 1500;
(async () => {
  const out = {};
  for (const n of [2, 4]) {
    const st = {}; const get = c => st[c] || (st[c] = { p: 0, w: 0, prep: 0, act: 0 });
    for (let k = 0; k < N; k++) {
      const pl = [...Array(n)].map((_, i) => ({ name: 'B' + i, bot: true, avatar: i }));
      const g = new E.Game({ players: pl, perPlayer: n === 2 ? 20 : 10, difficulty: 'dificil', seed: 55000 + k * 19 + n, io: { notify: async (t, d) => {
        if (t === 'combatEnd') { const c = d.combat; const w = g.evaluate(c, true); const ws = new Set(w.winners.map(e => e.pid));
          c.entries.forEach(e => { if (e.withdrawn || !e.card) return; const s = get(e.card); s.p++; if (ws.has(e.pid) && !w.tie) s.w++; }); }
        if (t === 'prepare') get(d.card).prep++;
        if (t === 'effectStart' && d.act && d.act.card) get(d.act.card).act++;
      } } });
      await g.run();
    }
    out[n] = st;
  }
  require('fs').writeFileSync(process.argv[4] || '/tmp/bal/realsim.json', JSON.stringify(out)); console.log('ok');
})();
