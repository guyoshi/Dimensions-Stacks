// Primeiras batalhas do modo história: taxa de vitória de um jogador inicial (6 comuns + 1 épica) por distância do ponto de partida.
const E = require('../../engine.js'); global.window = global; require('../../historia_bat.js'); require('../../historia_mapa.js');
const B = window.DS_HIST_BAT, M = window.DS_MAPA, BY = Object.fromEntries(M.nos.map(n => [n.id, n])); const N = +process.argv[2] || 20, PD = process.argv[3] || 'normal';
const C = E.CARDS; const comuns = Object.values(C).filter(c => c.raridade === 'comum' && !c.uniao && c.raridade !== 'quasar').map(c => c.id), epicas = Object.values(C).filter(c => c.raridade === 'epica' && !c.uniao).map(c => c.id);
const soma = id => { const v = Object.values(C[id].stats); return v.reduce((a, b) => a + b, 0) + 16 * Math.max(...v); };
function rng(s) { let a = s >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const escala = require('./escala_dif.js');
(async () => {
  const dist = {}; // distância mínima a partir de qualquer ponto de partida
  Object.values(M.starts).forEach(s => { const q = [[s, 0]], seen = new Set([s]); while (q.length) { const [u, d] = q.shift(); if (!(u in dist) || d < dist[u]) dist[u] = d; BY[u].viz.forEach(v => { if (!seen.has(v) && v !== M.boss) { seen.add(v); q.push([v, d + 1]); } }); } });
  const por = {};
  for (const id of Object.keys(B)) { const b = B[id], d = dist[id]; if (d == null || d > 7 || !b.i || b.i.length !== 1 || ['loja', 'minigame', 'boss', 'miniboss', 'guardiao'].includes(BY[id].tipo)) continue;
    const enemy = b.i[0].c.slice(0, 7); const diff = escala.nivel(BY[id], d, process.env.OLD === '1'); let w = 0;
    for (let k = 0; k < N; k++) { const r = rng(k * 31 + 7), sh = a => a.map(x => [r(), x]).sort((p, q) => p[0] - q[0]).map(x => x[1]); const mine = sh(comuns).slice(0, 6).concat(sh(epicas).slice(0, 1));
      const g = new E.Game({ players: [{ name: 'V', bot: true, diff: PD }, { name: 'I', bot: true, diff }], perPlayer: 7, difficulty: 'normal', maos: [mine, enemy], io: { notify: async () => {} }, seed: 500 + k }); try { if ((await g.run()) === 0) w++; } catch (e) { } }
    (por[d] = por[d] || []).push({ id, w: w / N, s: enemy.reduce((t, x) => t + soma(x), 0) / 7, diff: typeof diff === 'number' ? diff.toFixed(2) : diff, tipo: BY[id].tipo }); }
  for (const d of Object.keys(por).sort((a, b) => a - b)) { const L = por[d]; console.log('dist', d, 'nós', L.length, 'vitória do jogador', (100 * L.reduce((t, x) => t + x.w, 0) / L.length).toFixed(0) + '%', 'soma média das cartas inimigas', (L.reduce((t, x) => t + x.s, 0) / L.length).toFixed(0), 'nível', L[0].diff); }
})();
