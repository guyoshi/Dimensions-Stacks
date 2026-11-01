// Percepção e força da barra Fortuna: espelhos pareados, sem especiais nem eventos.
const E = require('../../engine.js');
const D = globalThis.DS_DATA;
const N = +process.argv[2] || 300;
const rates = process.argv[3] ? process.argv[3].split(',').map(Number) : null;
const pool = D.CARTAS.filter(c => !c.uniao && c.raridade !== 'quasar').map(c => c.id);
function shuffle(seed) { let a = seed >>> 0; const rnd = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; return pool.slice().sort(() => rnd() - .5); }
async function play(seed, fortune) {
  const cards = shuffle(seed), seen = { confusao: 0, queda: 0, buraco: 0, terremoto: 0 };
  const io = { notify: async () => {}, log: text => { if (text.startsWith('Fortuna confunde')) seen.confusao++; else if (text.includes('deixa') && text.includes('cair sem lutar')) seen.queda++; else if (text.includes('escapa do Buraco Negro')) seen.buraco++; else if (text.startsWith('Terremoto:')) seen.terremoto++; } };
  const fortuna = fortune ? Object.assign({ pid: 0, n: 5 }, rates ? { p2: rates[0], p3: rates[1], p4: rates[2], p5: rates[3] } : {}) : null;
  const g = new E.Game({ players: [{ name: 'Fortuna', bot: true, diff: 'normal', noSpecial: true }, { name: 'Espelho', bot: true, diff: 'normal', noSpecial: true }], perPlayer: 7, maos: [cards.slice(0, 7), cards.slice(7, 14)], events: false, maxCombats: 100, seed, fortuna, io });
  const winner = await g.run(); return { winner, combats: g.s.combats, seen };
}
(async () => {
  let base = 0, full = 0, combats = 0; const events = { confusao: 0, queda: 0, buraco: 0, terremoto: 0 }, battles = { confusao: 0, queda: 0, buraco: 0, terremoto: 0 };
  for (let k = 0; k < N; k++) {
    const seed = 81000 + k * 37, a = await play(seed, false), b = await play(seed, true); if (a.winner === 0) base++; if (b.winner === 0) full++; combats += b.combats;
    Object.keys(events).forEach(x => { events[x] += b.seen[x]; if (b.seen[x]) battles[x]++; });
  }
  console.log(`espelho base: ${(100 * base / N).toFixed(1)}% · Fortuna completa: ${(100 * full / N).toFixed(1)}% · disputas médias: ${(combats / N).toFixed(1)}`);
  Object.keys(events).forEach(x => console.log(`${x.padEnd(10)} ${events[x]} ativações · em ${(100 * battles[x] / N).toFixed(1)}% das batalhas · ${(100 * events[x] / combats).toFixed(2)}% por disputa`));
})();
