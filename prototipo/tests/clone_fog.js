// Névoa de Dados (AE-143) e Clone (AE-144): invariantes. Uso: node tests/clone_fog.js [N] [jogadores] [duplas]
const E = require('../engine.js'); const N = +process.argv[2] || 200, NP = +process.argv[3] || 2, DUO = process.argv[4] === 'duo';
(async () => {
  let clones = 0, fogs = 0, errs = 0, uses = { c: 0, f: 0 }; const orig = {};
  Object.values(E.CARDS).forEach(c => orig[c.id] = c.especial);
  for (let k = 0; k < N; k++) {
    // todas as cartas ganham os dois especiais para estressar (metade cada)
    Object.values(E.CARDS).forEach((c, i) => { c.especial = i % 2 ? 'AE-143' : 'AE-144'; });
    const pl = [...Array(NP).keys()].map(i => ({ name: 'B' + i, bot: true, avatar: i }));
    const seen = { };
    const g = new E.Game({ players: pl, perPlayer: 10, difficulty: 'normal', seed: 900 + k, teams: DUO && NP === 4 ? [[0, 2], [1, 3]] : null, io: { notify: async (t, d) => {
      if (t === 'cloneMade') { clones++; if (String(d.card).includes('*')) { errs++; console.log('clone de clone', k); } }
      if (t === 'fogFx') fogs++;
      if (t === 'combatEnd') {
        const s = g.s, all = []; s.players.forEach(p => all.push(...p.deck, ...p.reserve, ...p.prepared)); s.bh.forEach(x => all.push(x.id));
        const dup = all.length - new Set(all).size; if (dup) { errs++; console.log('duplicada', k, all.filter((x, i) => all.indexOf(x) !== i)); }
        if (s.bh.some(x => String(x.id).includes('*'))) { errs++; console.log('clone no BH', k); }
        s.players.forEach(p => [...p.deck, ...p.reserve, ...p.prepared].forEach(c => { if (String(c).includes('*') && !(s.clones[c] && s.clones[c].owner === p.pid)) { errs++; console.log('clone com não-dono', k, c, p.pid); } }));
        const real = all.filter(x => !String(x).includes('*')).length; if (seen.real != null && real !== seen.real) { errs++; console.log('cartas reais mudaram', k, seen.real, real); } seen.real = real;
      }
    } } });
    const w = await g.run();
    if (g.s.combats < 1) errs++;
  }
  Object.values(E.CARDS).forEach(c => { c.especial = orig[c.id]; });
  console.log({ N, NP, DUO, clones, fogs, errs });
  process.exit(errs ? 1 : 0);
})();
