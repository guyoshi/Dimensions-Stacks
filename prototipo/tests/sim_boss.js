// Boss final em 3 fases: simula o jogador (bot difícil) contra a Besta, com/sem Chamados da União. Uso: node tests/sim_boss.js [N]
const E = require('../engine.js'); const D = globalThis.DS_DATA; const N = +process.argv[2] || 60;
const EXC = new Set(['S11', 'V26', 'J30']), UNI = ['V02','J03','M10','S01','B01','M01','D06','V15'];
const BOSS_N = [16, 22, 28], BOSS_B = [0, 4, 8];
const FORCA = id => { const c = E.CARDS[id]; return Object.values(c.stats).reduce((a, b) => a + b, 0); };
function deckBoss(fase, usadas) {
  const w = fase === 1 ? { pod: .45, def: 1.25, int: .95, vel: .35 } : fase === 2 ? { pod: .8, def: .35, int: .55, vel: 1.35 } : { pod: .45, def: .8, int: 1.35, vel: .45 };
  const score = c => Object.keys(w).reduce((t, k) => t + c.stats[k] * w[k], 0) + FORCA(c.id) * .16 + (c.especial ? 8 : 0);
  const ranked = D.CARTAS.filter(c => !c.uniao && !EXC.has(c.id) && !usadas.has(c.id)).sort((a, b) => score(b) - score(a) || a.id.localeCompare(b.id)), n = BOSS_N[fase - 1] - 1, faixa = ranked.slice(0, Math.max(n, 48));
  return Array.from({ length: n }, (_, i) => faixa[Math.floor(i * faixa.length / n)].id);
}
function minhaMao(nUni, nivel) {   // nUni cartas da União + as melhores do resto (nivel: 'top' = melhores 22, 'media' = metade superior)
  const rest = D.CARTAS.filter(c => !c.uniao && !EXC.has(c.id) && c.raridade !== 'lendaria' && c.raridade !== 'quasar').sort((a, b) => FORCA(b.id) - FORCA(a.id));
  const pool = nivel === 'top' ? rest.slice(0, 22 + 10) : rest.slice(30, 80);
  const uni = UNI.slice(0, nUni), r = pool.slice(0, 30 - nUni).map(c => c.id);
  return uni.concat(r).slice(0, 30);
}
async function fase(F, mao, vivos, seed, diff, noSp, salva) {
  const usadas = new Set(mao), besta = ['S11'].concat(deckBoss(F, usadas)), bonus = 30 * vivos + BOSS_B[F - 1];
  const g = new E.Game({ players: [{ name: 'Você', bot: true, diff }, { name: 'A Besta', bot: true, diff: 'dificil' }], perPlayer: 7, difficulty: 'normal', specialsFrom: 2, events: false, maxCombats: 400, maos: [mao.slice(), besta], bonusPids: [1], bonusVal: bonus, boss: { fase: F, bestaPid: 1, salva }, seed, io: { notify: async () => {} } });
  const w = await g.run(); g.restoreCards && g.restoreCards(); return w === 0;
}
async function serie(label, nUni, nivel, vivos, diff, salva) {
  let ganhou = [0, 0, 0], jogou = [0, 0, 0], tudo = 0;
  for (let k = 0; k < N; k++) { const mao = minhaMao(nUni, nivel); let ok = true;
    for (let F = 1; F <= 3 && ok; F++) { jogou[F - 1]++; ok = await fase(F, mao, vivos, 7000 + k * 31 + F, diff, false, salva); if (ok) ganhou[F - 1]++; }
    if (ok) tudo++; }
  console.log(label.padEnd(44), ganhou.map((g, i) => (100 * g / jogou[i]).toFixed(0).padStart(3) + '%').join(' '), '| tudo ' + (100 * tudo / N).toFixed(0) + '%');
}
(async () => {
  console.log('fase1 fase2 fase3 (vitória por fase)', 'N=' + N);
  for (const [nUni, nivel, vivos, diff, lab] of [[8, 'top', 0, 'dificil', '8 União, cartas top, 0 vivos'], [0, 'top', 0, 'dificil', 'sem União, cartas top, 0 vivos'], [4, 'top', 0, 'dificil', '4 União'], [8, 'media', 0, 'dificil', '8 União, cartas médias'], [0, 'media', 0, 'dificil', 'sem União, cartas médias'], [8, 'top', 3, 'dificil', '8 União, 3 guardiões vivos'], [8, 'top', 0, 'normal', '8 União, jogador médio (normal)']])
    await serie(lab, nUni, nivel, vivos, diff, .7);
})();
