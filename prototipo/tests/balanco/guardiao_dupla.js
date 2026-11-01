// Simula o Guardião Dupla somada com um time plausível do Nv 14 (4 da União + 3 boas cartas).
const E = require('../../engine.js');
const D = globalThis.DS_DATA.CARTAS.filter(c => c.raridade !== 'quasar');
const C = E.CARDS, N = +process.argv[2] || 500;
const forca = id => Object.values(C[id].stats).reduce((a, b) => a + b, 0) + 12 * Math.max(...Object.values(C[id].stats));
const uniao = D.filter(c => c.uniao).sort((a, b) => forca(b.id) - forca(a.id));
const comuns = D.filter(c => !c.uniao && c.raridade === 'comum').sort((a, b) => forca(a.id) - forca(b.id));
const raras = D.filter(c => !c.uniao && c.raridade === 'rara').sort((a, b) => forca(a.id) - forca(b.id));
const boas = D.filter(c => !c.uniao && ['rara', 'epica', 'lendaria'].includes(c.raridade)).sort((a, b) => forca(b.id) - forca(a.id));
const av = ['J26', 'J31'];
const rng = s => { let a = s >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
const pick = (l, n, r, used) => { const a = l.filter(x => !used.has(x.id)).slice(); for (let i = a.length - 1; i; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, n).map(x => (used.add(x.id), x.id)); };
async function sim(modo) {
  let win = 0, lim = 0, rounds = 0;
  for (let k = 0; k < N; k++) {
    const r = rng(7001 + k * 41), used = new Set();
    const mine = pick(uniao, 4, r, used).concat(pick(boas.slice(0, Math.max(12, Math.floor(boas.length * .35))), 3, r, used));
    const gs = [0, 1].map(i => modo === 'fraco' ? pick(comuns.slice(0, 12), 3, r, used)
      : modo === 'comuns' ? [av[i], ...pick(comuns.slice(Math.floor(comuns.length * .35), Math.floor(comuns.length * .8)), 2, r, used)]
      : modo === 'meio' ? [av[i], ...pick(comuns.slice(Math.floor(comuns.length * .45), Math.floor(comuns.length * .85)), 1, r, used), ...pick(raras.slice(Math.floor(raras.length * .15), Math.floor(raras.length * .55)), 1, r, used)]
      : [av[i], ...pick(boas.slice(Math.floor(boas.length * .15), Math.floor(boas.length * .65)), 2, r, used)].filter((x, q, a) => x && a.indexOf(x) === q));
    gs.flat().forEach(x => used.add(x));
    const io = { orderHand: async (p, hand) => hand, attr: async (p, e, options) => options.slice().sort((a, b) => (e.stats[b] + e.extra.reduce((t, c) => t + e.extraStats[c][b], 0)) - (e.stats[a] + e.extra.reduce((t, c) => t + e.extraStats[c][a], 0)))[0] };
    const g = new E.Game({ players: [{ name: 'Você', bot: false, diff: 1 }, { name: 'Cassiopeia', bot: true, diff: .9 }, { name: 'Órion', bot: true, diff: .9 }], perPlayer: 7, maos: [mine, gs[0], gs[1]], teams: [[0], [1, 2]], teamPool: false, regra: { id: 'g_duo' }, events: false, specialsFrom: 99, maxCombats: 100, seed: 93000 + k * 17, io });
    await g.run(); if (g.s.winner != null && g.teamOf(g.s.winner) === g.teamOf(0)) win++; if (g.s.byLimit) lim++; rounds += g.s.combats;
  }
  return { win: 100 * win / N, lim, rounds: rounds / N };
}
(async () => {
  const weak = await sim('fraco'), common = await sim('comuns'), middle = await sim('meio'), mixed = await sim('forte');
  console.log(`comuns fracas: ${weak.win.toFixed(1)}% · disputas ${weak.rounds.toFixed(1)} · limite ${weak.lim}`);
  console.log(`avatar + comuns: ${common.win.toFixed(1)}% · disputas ${common.rounds.toFixed(1)} · limite ${common.lim}`);
  console.log(`avatar + comum + rara: ${middle.win.toFixed(1)}% · disputas ${middle.rounds.toFixed(1)} · limite ${middle.lim}`);
  console.log(`baralho misto: ${mixed.win.toFixed(1)}% · disputas ${mixed.rounds.toFixed(1)} · limite ${mixed.lim}`);
})();
