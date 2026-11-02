// Boss final no motor real (3 fases, bots). Uso: node tools/sim_boss_real.js [partidas] [cenario: cheia|sem|meia] [N1,N2,N3] [b1,b2,b3] [guardioesVivos]
const E = require('../engine.js'); const D = global.DS_DATA || globalThis.DS_DATA || (require('../data.js'), globalThis.DS_DATA);
const AT = ['pod', 'def', 'int', 'vel'], sum = c => AT.reduce((t, a) => t + c.stats[a], 0);
const NU = D.CARTAS.filter(c => !c.uniao && c.id !== 'S11').sort((a, b) => sum(b) - sum(a)), UN = D.CARTAS.filter(c => c.uniao).map(c => c.id);
const rngF = s => { let a = s >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const total = g => { let n = g.s.bh.length; g.s.players.forEach(p => { n += p.deck.length + p.reserve.length + p.prepared.length; }); return n; };
const força = c => sum(c) + 16 * Math.max(...AT.map(a => c.stats[a]));
function deckBoss(F, usadas, N) { const w = F === 1 ? { pod: .45, def: 1.25, int: .95, vel: .35 } : F === 2 ? { pod: .8, def: .35, int: .55, vel: 1.35 } : { pod: .45, def: .8, int: 1.35, vel: .45 }, score = c => AT.reduce((t, a) => t + c.stats[a] * w[a], 0) + força(c) * .16 + (c.especial ? 8 : 0), ranked = NU.filter(c => !usadas.has(c.id)).sort((a, b) => score(b) - score(a) || a.id.localeCompare(b.id)), n = N - 1, faixa = ranked.slice(0, Math.max(n, 48)); return Array.from({ length: n }, (_, i) => faixa[Math.floor(i * faixa.length / n)].id); }
function montaMao(P, R) { const pick = (a, n) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b.slice(0, n); }, uni = P.uniao === false ? [] : P.nuniao != null ? pick(UN, P.nuniao) : UN, outros = pick(NU.slice(0, P.pool || 50), 30 - uni.length).sort((a, b) => sum(b) - sum(a)).map(c => c.id), mao = []; outros.forEach((c, i) => { mao.push(c); if (i % 3 === 2 && uni[mao.filter(x => UN.includes(x)).length]) mao.push(uni[mao.filter(x => UN.includes(x)).length]); }); uni.forEach(u => { if (!mao.includes(u)) mao.push(u); }); return mao.slice(0, 30); }
async function fase(F, k, P, R, mao) {
  const pick = (a, n) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b.slice(0, n); };
  const N = P.N[F - 1], usadas = new Set(mao), besta = ['S11'].concat(deckBoss(F, usadas, N));   // mesmos perfis temáticos usados no jogo
  const bonus = 30 * (P.vivos || 0) + P.b[F - 1];
  let exp = null, err = null;
  let ordem = mao.slice(); const g = new E.Game({ players: [{ name: 'Você', bot: true, diff: 'dificil' }, { name: 'Besta', bot: true, diff: 'dificil' }], perPlayer: 30, difficulty: 'dificil', specialsFrom: 2, events: false, maxCombats: 400, seed: 7000 + k * 31 + F, maos: [mao, besta], fixedOrderPids: F > 1 ? [0] : [], onOrder: (pid, ord) => { if (pid === 0) ordem = ord; }, bonusPids: [1], bonusVal: bonus, boss: { fase: F, bestaPid: 1, q: P.q, salva: P.salva }, io: { notify: async t => { if (t === 'ready') exp = total(g); if (exp != null && ['combatEnd', 'end'].includes(t) && total(g) !== exp) err = err || ('conservação F' + F + ' ' + total(g) + '!=' + exp + ' | ' + g.logs.slice(-8).map(l => l.text || l).join(' / ')); } } });
  const w = await g.run(); return { w, rounds: g.s.round, combats: g.s.combats, order: ordem.slice(), err, left: g.totalCards(g.p(0)) };
}
(async () => {
  const n = +process.argv[2] || 200, cen = process.argv[3] || 'cheia', N = (process.argv[4] || '16,22,28').split(',').map(Number), b = (process.argv[5] || '0,4,8').split(',').map(Number), vivos = +process.argv[6] || 0;
  const P = Object.assign({ N, b, vivos, q: .7, salva: .7 }, cen === 'sem' ? { uniao: false } : cen === 'media' ? { nuniao: 4 } : cen === 'meia' ? { nuniao: 4, pool: 30 } : {});
  let win = 0, fail = [0, 0, 0, 0], rod = [0, 0, 0, 0], comb = [0, 0, 0, 0], reach = [0, 0, 0, 0], errs = 0, falhas = 0;
  for (let k = 0; k < n; k++) { const R = rngF(500 + k * 13); let ok = true, mao = montaMao(P, R);
    for (let F = 1; F <= 3; F++) { reach[F]++; try { const r = await fase(F, k, P, R, mao); rod[F] += r.rounds; comb[F] += r.combats; mao = r.order; if (r.err) { errs++; if (errs === 1) console.log(' ', r.err); } if (r.w !== 0) { fail[F]++; ok = false; break; } } catch (e) { falhas++; if (falhas === 1) console.log(' erro', e.stack.split('\n').slice(0, 3).join(' | ')); ok = false; break; } }
    if (ok) win++; }
  const secs = f => { const c = comb[f] / Math.max(1, reach[f]), r = rod[f] / Math.max(1, reach[f]); return c * 8.5 + r * 2.2 + (f === 1 ? Math.floor(r / 2) * 1.5 : f === 2 ? Math.min(8, Math.floor(c / 2)) * 4.5 : r * 1.2); };
  console.log(cen, 'N' + N, 'b' + b, 'vivos' + vivos, `vitória ${(100 * win / n).toFixed(0)}% · derrotas F1/F2/F3 ${fail.slice(1).join('/')} · rodadas médias ${[1, 2, 3].map(f => reach[f] ? (rod[f] / reach[f]).toFixed(1) : '-').join('/')} · disputas ${[1, 2, 3].map(f => reach[f] ? (comb[f] / reach[f]).toFixed(1) : '-').join('/')} · tempo estimado ${[1, 2, 3].map(f => (secs(f) / 60).toFixed(1) + 'min').join('/')} · conservação ${errs} · falhas ${falhas}`);
})();
