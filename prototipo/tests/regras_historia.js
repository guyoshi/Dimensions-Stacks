// Termina e equilíbrio das regras de batalha do modo história: 2 bots (7 cartas cada) × N partidas por regra.
const E = require('../engine.js'); require('../data.js'); const D = globalThis.DS_DATA || global.DS_DATA || (typeof window !== 'undefined' && window.DS_DATA);
const N = +process.argv[2] || 60, only = process.argv[3];
const ids = D.CARTAS.filter(c => !c.uniao && c.id !== 'S11').map(c => c.id);
const comuns = D.CARTAS.filter(c => c.raridade === 'comum').map(c => c.id);
const REGRAS = [{ id: 'nenhuma' }, { id: 'relogio' }, { id: 'espelho' }, { id: 'memoria' }, { id: 'dupla' }, { id: 'maioria' }, { id: 'emprestado' }, { id: 'aposta' }, { id: 'avesso' }, { id: 'meio' }, { id: 'alvo' }, { id: 'invertidos' }, { id: 'proibido', attr: 'vel' }, { id: 'unico', attr: 'int' }, { id: 'rodizio' }, { id: 'magnetico' }, { id: 'mare' }, { id: 'sobrecarga' }, { id: 'solar' }, { id: 'tregua' }, { id: 'morte', n: 3 }, { id: 'silencio' }, { id: 'arsenal' }, { id: 'reforcos' }, { id: 'limite', n: 15 }, { id: 'estelar' }];
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
(async () => {
  for (const R of REGRAS) {
    if (only && R.id !== only) continue;
    let lim = 0, win = [0, 0], draw = 0, rounds = 0, bad = 0, maxR = 0;
    for (let k = 0; k < N; k++) {
      const r = rng(1000 + k), sh = ids.slice().sort(() => r() - .5), a = sh.slice(0, 7), b = sh.slice(7, 14);
      const reg = R.id === 'nenhuma' ? null : Object.assign({}, R, R.id === 'reforcos' ? { pool: comuns.filter(c => !a.includes(c) && !b.includes(c)).slice(0, 8) } : {});
      const g = new E.Game({ players: [{ name: 'V', bot: true, diff: 'normal' }, { name: 'I', bot: true, diff: 'normal' }], perPlayer: 7, difficulty: 'normal', maos: [a, R.id === 'espelho' ? a.map(c => c + '*1') : b], regra: reg, maxCombats: 100, events: false, seed: 777 + k * 31, io: { notify: async () => {} } });
      try { const w = await g.run(); if (w == null) draw++; else win[w]++; rounds += g.s.round; maxR = Math.max(maxR, g.s.round); if (g.s.byLimit && g.s.combats >= 100) lim++; } catch (e) { console.log('ERRO', R.id, e.message); bad++; }
    }
    console.log(R.id.padEnd(11), 'V ' + win[0], 'I ' + win[1], 'empate ' + draw, '· rodadas méd ' + (rounds / N).toFixed(1), 'máx ' + maxR, bad ? '· PROBLEMAS ' + bad : '', lim ? '· limite de disputas ' + lim : '');
  }
})();
