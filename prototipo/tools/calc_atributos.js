/* Calcula atributos a partir dos rankings do app de classificação.
   uso: node tools/calc_atributos.js <serie> <ranking.json> [saida.json]
   Método: valor por posição (quantil da distribuição atual de cada atributo) + ajuste pelo total (lista "geral"),
   ordem por atributo preservada (estritamente decrescente). Não aplica nada no jogo. */
global.window = undefined; require('../data.js'); const D = globalThis.DS_DATA;
const fs = require('fs');
const [serie, rank, out] = process.argv.slice(2);
const R = JSON.parse(fs.readFileSync(rank, 'utf8')).orders;
const AT = ['pod', 'def', 'int', 'vel'];
const all = D.CARTAS;
const q = (arr, p) => { const s = arr.slice().sort((a, b) => a - b); const x = p * (s.length - 1), i = Math.floor(x), f = x - i; return s[i] + (s[Math.min(i + 1, s.length - 1)] - s[i]) * f; };
// escala de referência congelada (as 98 cartas de 14/10/2026 antes de aplicar qualquer série): mantém todas as séries na mesma régua
const REF = JSON.parse(fs.readFileSync(require('path').join(__dirname, '..', '..', 'dados', 'escala_referencia_2026-10-14.json'), 'utf8'));
const dist = {}; AT.forEach((a, i) => dist[a] = REF.map(c => c.s[i]));
const sums = REF.map(c => c.s[0] + c.s[1] + c.s[2] + c.s[3]);
const ids = R.geral, n = ids.length;
const pct = (list, id) => (n - list.indexOf(id) - 0.5) / n;
const KAPPA = 0.35, CAP = 95, FLOOR = 6;
const val = {}; ids.forEach(id => val[id] = {});
const raw = {}, tgt = {};
ids.forEach(id => { raw[id] = {}; AT.forEach(a => raw[id][a] = q(dist[a], pct(R[a], id))); tgt[id] = q(sums, pct(R.geral, id)); });
ids.forEach(id => { const s = AT.reduce((t, a) => t + raw[id][a], 0), d = KAPPA * (tgt[id] - s) / 4; AT.forEach(a => val[id][a] = Math.max(FLOOR, Math.min(CAP, raw[id][a] + d))); });
// ordem por atributo: não crescente (PAVA = média nos blocos em conflito) e depois desempate de 1 ponto
const inv = {};
AT.forEach(a => {
  const xs = R[a].map(id => val[id][a]); const blocks = [];
  xs.forEach(x => { blocks.push({ sum: x, n: 1 }); while (blocks.length > 1) { const L = blocks[blocks.length - 2], T = blocks[blocks.length - 1]; if (L.sum / L.n < T.sum / T.n) { L.sum += T.sum; L.n += T.n; blocks.pop(); } else break; } });
  let k = 0; inv[a] = 0;
  blocks.forEach(B => { const m = B.sum / B.n; if (B.n > 1) inv[a] += B.n; for (let j = 0; j < B.n; j++) val[R[a][k++]][a] = m + ((B.n - 1) / 2 - j) * 1.5; });
  let prev = 1e9; R[a].forEach(id => { let v = Math.min(CAP, Math.max(FLOOR, val[id][a])); if (v >= prev) v = prev - 1; val[id][a] = v; prev = v; });
});
const res = ids.map(id => {
  const c = all.find(x => x.id === id), s = c.stats, bruto = AT.map(a => Math.round(val[id][a]));
  const cur = AT.map(a => s[a]);
  const par1 = bruto[0] + bruto[1], par2 = bruto[2] + bruto[3];
  const forte = par1 >= par2 ? 'FOR/RES' : 'INT/VEL', fraco = par1 >= par2 ? [2, 3] : [0, 1];
  const fracoMax = Math.max(bruto[fraco[0]], bruto[fraco[1]]);
  const conflito = !c.uniao && fracoMax > 70;
  // regra do par forte (autor, 14/10/2026: aplicar sempre): par fraco no máximo 70, valores acima de 60 comprimidos proporcionalmente
  const v = bruto.slice(); if (conflito) fraco.forEach(i => { if (v[i] > 60) v[i] = Math.round(60 + (v[i] - 60) * 10 / (fracoMax - 60)); });
  const soma = v.reduce((x, y) => x + y, 0);
  return { id, nome: c.nome, uniao: c.uniao, atual: cur, prop: v, bruto: conflito ? bruto : null, soma, pico: Math.max(...v), poder: D.poder(v), rar: ((p) => p >= 1810 ? 'lendaria' : p >= 1710 ? 'epica' : p >= 1560 ? 'rara' : 'comum')(D.poder(v)), rarAtual: c.raridade, forte, fracoMax, conflito, ranks: AT.concat('geral').map(a => R[a].indexOf(id) + 1) };
});
// raridade proposta por posição de poder na série (proporção 11% / 21% / 33% / resto)
{ const o = res.slice().sort((a, b) => b.poder - a.poder), cut = [Math.round(n * .11), Math.round(n * .32), Math.round(n * .65)]; o.forEach((r, i) => r.rarP = i < cut[0] ? 'lendaria' : i < cut[1] ? 'epica' : i < cut[2] ? 'rara' : 'comum'); }
if (out) fs.writeFileSync(out, JSON.stringify(res));
console.error('ajustes de ordem:', JSON.stringify(inv));
res.sort((a, b) => b.poder - a.poder).forEach(r => console.log(r.id, r.nome.padEnd(16), 'atual', r.atual.join('/').padEnd(13), 'prop', r.prop.join('/').padEnd(13), 'soma', r.soma, 'pico', r.pico, 'poder', r.poder, r.rarAtual, '->', r.rar, 'P:' + r.rarP, r.forte, r.conflito ? 'CONFLITO(' + r.fracoMax + ')' : '', r.uniao ? 'UNIAO' : ''));
