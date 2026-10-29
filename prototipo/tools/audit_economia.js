// Auditoria da economia de pêndulos do modo História (mapa atual). Uso: node tools/audit_economia.js
const vm = require('vm'), fs = require('fs'); const w = {}; vm.createContext(w); w.window = w; vm.runInContext(fs.readFileSync(__dirname + '/../historia_mapa.js', 'utf8'), w); const M = w.DS_MAPA;
require('../data.js'); const D = globalThis.DS_DATA;
const PREMIO = { normal: 10, evento: 14, elite: 22, miniboss: 35, guardiao: 50, boss: 0 }, premioDe = n => Math.round((PREMIO[n.tipo] || 10) * (1 + .5 * ((n.tipo === 'guardiao' ? 4 : n.tier || 1) - 1)));
const PRECO = { comum: 40, rara: 90, epica: 200, lendaria: 450 }, CANSA = { comum: 1, rara: 2, epica: 3, lendaria: 4 }, CUSTO_DESC = 6;
const by = {}; M.nos.forEach(n => { const k = n.tipo; (by[k] = by[k] || []).push(n); });
const cnt = {}, soma = {}; M.nos.forEach(n => { if (n.tipo === 'loja' || n.tipo === 'boss') return; cnt[n.tipo] = (cnt[n.tipo] || 0) + 1; soma[n.tipo] = (soma[n.tipo] || 0) + premioDe(n); });
console.log('Batalhas por tipo (qtd · pêndulos se todas vencidas):'); Object.keys(cnt).forEach(k => console.log(' ', k.padEnd(9), String(cnt[k]).padStart(3), '·', String(soma[k]).padStart(5)));
const totBat = Object.values(soma).reduce((a, b) => a + b, 0); console.log('Total das batalhas (completista):', totBat);
const arau = by.miniboss.reduce((t, n) => t + premioDe(n), 0), guar = by.guardiao.reduce((t, n) => t + premioDe(n), 0);
const outras = M.nos.filter(n => !['loja', 'boss', 'miniboss', 'guardiao'].includes(n.tipo)); const mediaOutra = outras.reduce((t, n) => t + premioDe(n), 0) / outras.length;
const medioBat = arau + guar + mediaOutra * 0.4 * outras.length; console.log('Médio (8 arautos + 4 guardiões + 40% das demais):', Math.round(medioBat), '· demais:', outras.length, '· prêmio médio das demais', mediaOutra.toFixed(1));
const MINI = { serie: 7, base: 10 }, mini = { medio: MINI.serie * 7.5 + MINI.base * 0.5 * 7.5, completo: (MINI.serie + MINI.base) * 20, completoOtimo: (MINI.serie + MINI.base) * 10 };
console.log('Minigames: completista (Perfeito) =', mini.completo, '· completista (Ótimo) =', mini.completoOtimo, '· médio (Bom/Ótimo, metade dos de beco) ≈', Math.round(mini.medio));
const folhas = M.nos.filter(n => n.viz.length === 1 && !['boss', 'loja'].includes(n.tipo)).length; console.log('Becos (folhas):', folhas);
const raz = {}; D.CARTAS.filter(c => !c.uniao && c.id !== 'S11').forEach(c => { raz[c.raridade] = (raz[c.raridade] || 0) + 1; }); const tot = Object.keys(raz).reduce((t, r) => t + raz[r] * PRECO[r], 0);
console.log('Cartas compráveis:', JSON.stringify(raz), '· custo de comprar todas:', tot);
const ini = 7; console.log('Descanso: custo de descansar 1 ponto =', CUSTO_DESC, '· 1 vitória com 7 cartas (mix) ≈', (7 * (0.35 * 1 + 0.3 * 2 + 0.2 * 3 + 0.15 * 4)).toFixed(1), 'pontos ≈', (6 * 7 * (0.35 + 0.6 + 0.6 + 0.6)).toFixed(0), 'pêndulos para descansar tudo');
