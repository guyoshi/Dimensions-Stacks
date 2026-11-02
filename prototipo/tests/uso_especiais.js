// Conta quantas vezes cada especial é ativado em partidas normais de bots (2–4 jogadores). Lista os de uso zero e seu tipo (reativo/situacional).
const E = require('../engine.js'); const D = globalThis.DS_DATA; const N = +process.argv[2] || 200;
const uso = {}, deal = {}; let G0; const dif = ['facil', 'normal', 'dificil'];
(async () => {
  for (let k = 0; k < N; k++) { const n = 2 + k % 3;
    const players = [...Array(n)].map((_, i) => ({ name: 'B' + i, bot: true, avatar: i, diff: dif[(i + k) % 3] }));
    const g = new E.Game({ players, perPlayer: 10, difficulty: 'normal', seed: 30000 + k * 17, specialsFrom: 1, maxCombats: 80, io: { notify: async (t, d) => { if (t === 'ready') { const gg = G0; gg.s.players.forEach(pl => [...pl.deck, ...pl.reserve, ...pl.prepared].forEach(c => { const e = E.CARDS[c] && E.CARDS[c].especial; if (e) deal[e] = (deal[e] || 0) + 1; })); } if (t === 'effectStart' && d && d.spec) uso[d.spec.id] = (uso[d.spec.id] || 0) + 1; } } });
    G0 = g; try { await g.run(); } catch (e) { console.log('erro', k, e.message); } }
  const ids = Object.keys(E.SPECIALS).filter(i => /^AE-/.test(i)).sort();
  const zero = ids.filter(i => !uso[i] && (deal[i] || 0) > 0), baixo = ids.filter(i => uso[i] && uso[i] < 0.12 * (deal[i] || 1));
  const info = i => { const s = E.SPECIALS[i]; return i + ' ' + s.nome + (s.react ? ' [reativo]' : '') + (s.phase ? ' [' + s.phase + ']' : '') + ' dist:' + (deal[i] || 0) + ' uso:' + (uso[i] || 0) + ' cartas:' + Object.values(E.CARDS).filter(c => c.especial === i).map(c => c.id).join(','); };
  console.log('partidas', N, '· especiais', ids.length, '· uso zero', zero.length, '· uso < 2% das partidas', baixo.length);
  console.log('ZERO:\n' + zero.map(info).join('\n')); console.log('BAIXO:\n' + baixo.map(i => info(i) ).join('\n'));
})();
