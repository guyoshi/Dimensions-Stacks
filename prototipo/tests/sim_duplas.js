// uso: node team.js <engine> <N> <out.json> ; modos 4p FFA vs 2x2 (com/sem montagem), especiais on/off
const E = require(process.argv[2]); const N = +process.argv[3] || 200; const OUT = process.argv[4];
const modes = { ffa4: {}, dup: { teams: [[0,2],[1,3]] }, dup_sm: { teams: [[0,2],[1,3]], semMontar: true }, ffa4_sm: { semMontar: true } };
(async () => {
  const res = {};
  for (const [name, extra] of Object.entries(modes)) for (const sp of ['off','on']) {
    const st = {}, get = c => st[c] || (st[c] = { p: 0, w: 0 });
    const agg = { games: 0, combats: 0, rounds: 0, limit: 0, draw: 0, teamA: 0, teamB: 0, seat: [0,0,0,0], firstOut: [], capt: 0 };
    for (let k = 0; k < N; k++) {
      const pl = [...Array(4)].map((_, i) => ({ name: 'B' + i, bot: true, avatar: i, noSpecial: sp === 'off' }));
      const g = new E.Game(Object.assign({ players: pl, perPlayer: 10, difficulty: 'dificil', seed: 52000 + k * 29, io: { notify: async (t, d) => {
        if (t === 'combatEnd') { const c = d.combat; const w = g.evaluate(c, true); const ws = new Set(w.winners.map(e => e.pid));
          c.entries.forEach(e => { if (e.withdrawn || !e.card) return; const s = get(e.card); s.p++; if (ws.has(e.pid) && !w.tie) s.w++; }); }
      } } }, extra));
      const win = await g.run(); agg.games++; agg.combats += g.s.combats; agg.rounds += g.s.round; if (g.s.byLimit) agg.limit++;
      if (win == null) agg.draw++; else { agg.seat[win]++; if (win % 2 === 0) agg.teamA++; else agg.teamB++; }
    }
    res[name + '_' + sp] = { st, agg };
  }
  require('fs').writeFileSync(OUT, JSON.stringify(res)); console.log('ok');
})();
