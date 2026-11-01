// Simula o Guardião Dupla somada com um time plausível do Nv 14 (4 da União + 8 boas cartas).
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
async function sim(qtd) {
  let win = 0, lim = 0, rounds = 0;
  for (let k = 0; k < N; k++) {
    const r = rng(7001 + k * 41), used = new Set();
    const mine = pick(uniao, 4, r, used).concat(pick(boas.slice(0, Math.max(20, Math.floor(boas.length * .45))), 8, r, used));
    const gs = [0, 1].map(i => {
      const deck = [av[i]]; used.add(av[i]);
      for (let q = 1; q < qtd; q++) {
        const src = q % 2 ? comuns.slice(Math.floor(comuns.length * .45), Math.floor(comuns.length * .85)) : raras.slice(Math.floor(raras.length * .15), Math.floor(raras.length * .55));
        deck.push(...pick(src, 1, r, used));
      }
      return deck;
    });
    gs.flat().forEach(x => used.add(x));
    const io = { orderHand: async (p, hand) => hand, attr: async (p, e, options) => options.slice().sort((a, b) => (e.stats[b] + e.extra.reduce((t, c) => t + e.extraStats[c][b], 0)) - (e.stats[a] + e.extra.reduce((t, c) => t + e.extraStats[c][a], 0)))[0] };
    const g = new E.Game({ players: [{ name: 'Você', bot: false, diff: 1 }, { name: 'Cassiopeia', bot: true, diff: .9 }, { name: 'Órion', bot: true, diff: .9 }], perPlayer: 12, maos: [mine, gs[0], gs[1]], teams: [[0], [1, 2]], teamPool: false, regra: { id: 'g_duo' }, events: false, specialsFrom: 99, maxCombats: 100, seed: 93000 + k * 17, io });
    await g.run(); if (g.s.winner != null && g.teamOf(g.s.winner) === g.teamOf(0)) win++; if (g.s.byLimit) lim++; rounds += g.s.combats;
  }
  return { win: 100 * win / N, lim, rounds: rounds / N };
}
(async () => {
  for (const qtd of [5, 6, 7, 8, 9, 10]) { const r = await sim(qtd); console.log(`${qtd}+${qtd} cartas: ${r.win.toFixed(1)}% · disputas ${r.rounds.toFixed(1)} · limite ${r.lim}`); }
})();
