// Conservação e duplicação de cartas com bots de níveis misturados (os erros do fácil exploram caminhos raros).
const E = require('../engine.js'); const N = +process.argv[2] || 600;
const total = g => { const s = g.s; let n = s.bh.filter(x => !String(x.id).includes('*')).length; s.players.forEach(p => { n += [...p.deck, ...p.reserve, ...p.prepared].filter(x => !String(x).includes('*')).length; }); return n; };
(async () => {
  let fails = 0; const ds = ['facil', 'normal', 'dificil'];
  for (let k = 0; k < N && fails < 6; k++) {
    const n = 2 + (k % 3), per = [7, 12, 18][k % 3]; if (per * n > 100) continue;
    const players = [...Array(n)].map((_, i) => ({ name: 'B' + i, bot: true, avatar: i, diff: ds[(k + i * 5 + (k >> 2)) % 3] }));
    let exp = null, err = null;
    const g = new E.Game({ players, perPlayer: per, difficulty: 'normal', seed: 50000 + k * 17, io: { notify: async t => {
      if (t === 'ready') exp = total(g);
      if (exp != null && ['combatStart', 'combatEnd', 'end'].includes(t)) {
        const all = []; g.s.players.forEach(p => all.push(...p.deck, ...p.reserve, ...p.prepared)); g.s.bh.forEach(x => all.push(x.id));
        if (all.length !== exp) throw new Error(`conservação ${t}: ${all.length} != ${exp}`); if (new Set(all).size !== all.length) throw new Error('duplicada ' + t);
      } } } });
    try { await g.run(); } catch (e) { fails++; console.log('FALHA jogo', k, n + 'p', per, players.map(p => p.diff).join('/'), e.message); }
  }
  console.log(`jogos ${N} falhas ${fails}`);
})();
