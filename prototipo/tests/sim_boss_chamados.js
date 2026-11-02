// Quanto cada Chamado da União pesa: uso por partida e queda de vitórias ao trocar a carta por uma comum de força parecida.
const E = require('../engine.js'); const D = globalThis.DS_DATA; const N = +process.argv[2] || 40;
const EXC = new Set(['S11', 'V26', 'J30']), UNI = ['V02','J03','M10','S01','B01','M01','D06','V15'], BOSS_N = [16, 22, 28], BOSS_B = [0, 4, 8];
const FORCA = id => Object.values(E.CARDS[id].stats).reduce((a, b) => a + b, 0);
function deckBoss(fase, usadas) { const w = fase === 1 ? { pod: .45, def: 1.25, int: .95, vel: .35 } : fase === 2 ? { pod: .8, def: .35, int: .55, vel: 1.35 } : { pod: .45, def: .8, int: 1.35, vel: .45 };
  const score = c => Object.keys(w).reduce((t, k) => t + c.stats[k] * w[k], 0) + FORCA(c.id) * .16 + (c.especial ? 8 : 0);
  const ranked = D.CARTAS.filter(c => !c.uniao && !EXC.has(c.id) && !usadas.has(c.id)).sort((a, b) => score(b) - score(a) || a.id.localeCompare(b.id)), n = BOSS_N[fase - 1] - 1, faixa = ranked.slice(0, Math.max(n, 48));
  return Array.from({ length: n }, (_, i) => faixa[Math.floor(i * faixa.length / n)].id); }
const rest = D.CARTAS.filter(c => !c.uniao && !EXC.has(c.id) && c.raridade !== 'lendaria' && c.raridade !== 'quasar').sort((a, b) => FORCA(b.id) - FORCA(a.id));
function mao(sem) { const top = rest.slice(0, 40).map(c => c.id); const uni = UNI.filter(u => u !== sem); let m = uni.concat(top.slice(0, 22 + (sem ? 1 : 0)));
  if (sem) { const alvo = FORCA(sem); const sub = rest.filter(c => !m.includes(c.id)).sort((a, b) => Math.abs(FORCA(a.id) - alvo) - Math.abs(FORCA(b.id) - alvo))[0].id; m = uni.concat([sub], top.slice(0, 21)); } return m.slice(0, 30); }
const uso = {};
async function fase(F, m, seed) { const usadas = new Set(m), besta = ['S11'].concat(deckBoss(F, usadas)), bonus = BOSS_B[F - 1];
  const g = new E.Game({ players: [{ name: 'Você', bot: true, diff: 'dificil' }, { name: 'A Besta', bot: true, diff: 'dificil' }], perPlayer: 7, difficulty: 'normal', specialsFrom: 2, events: false, maxCombats: 400, maos: [m.slice(), besta], bonusPids: [1], bonusVal: bonus, boss: { fase: F, bestaPid: 1, salva: .7 }, seed,
    io: { notify: async (t, d) => { if (t === 'effectStart' && d && d.spec && d.spec.chamado && d.act.pid === 0) uso[d.spec.id] = (uso[d.spec.id] || 0) + 1; } } });
  const w = await g.run(); g.restoreCards && g.restoreCards(); return w === 0; }
async function serie(sem) { let ok3 = 0, f = [0, 0, 0]; for (let k = 0; k < N; k++) { const m = mao(sem); let ok = true; for (let F = 1; F <= 3 && ok; F++) { ok = await fase(F, m, 7000 + k * 31 + F); if (ok) f[F - 1]++; } if (ok) ok3++; } return { tudo: 100 * ok3 / N, f: f.map(x => (100 * x / N).toFixed(0)) }; }
(async () => { const base = await serie(null); console.log('base (8 União)', base.tudo.toFixed(0) + '% tudo', base.f.join('/'));
  console.log('uso por partida-de-3-fases:', Object.entries(uso).map(([k, v]) => k + ' ' + (v / N).toFixed(1)).join(' · '));
  for (const u of UNI) { const r = await serie(u); console.log(('sem ' + u + ' (' + E.CARDS[u].nome + ')').padEnd(34), r.tudo.toFixed(0) + '% tudo', r.f.join('/'), ' Δ', (r.tudo - base.tudo).toFixed(0)); } })();
