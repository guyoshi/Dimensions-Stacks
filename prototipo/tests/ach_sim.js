// Viabilidade das conquistas/desafios: bots jogam como "jogador 0" e medimos com que frequência as condições valem.
const store = {}; globalThis.localStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = v; }, removeItem: k => { delete store[k]; } };
const E = require('../engine.js'); require('../stats.js'); const ST = globalThis.DSSTATS;
const N = +process.argv[2] || 300;
async function run(n, per, diff, sf) {
  ST.reset();
  const players = [...Array(n)].map((_, k) => ({ name: 'B' + k, bot: true, avatar: k }));
  const rec = ST.recorder({ viewer: 0, online: false, humans: 1, n, diff, per, sf });
  let G, res; G = new E.Game({ players, perPlayer: per, difficulty: diff, specialsFrom: sf, io: { notify: async (t, d) => { const r = rec.ev(t, d, G); if (r) res = r; } } });
  await G.run(); return res.mm;
}
(async () => {
  const cfgs = [[2, 12, 'normal'], [3, 12, 'normal'], [4, 12, 'normal'], [2, 12, 'dificil'], [2, 7, 'normal'], [2, 18, 'normal']];
  for (const [n, per, diff] of cfgs) {
    const rows = []; for (let i = 0; i < N; i++) rows.push(await run(n, per, diff, 2));
    const pct = f => Math.round(rows.filter(f).length / rows.length * 100) + '%';
    const avg = f => (rows.reduce((a, r) => a + f(r), 0) / rows.length).toFixed(1);
    const out = { jogo: `${n}j/${per}/${diff}`, vitoria: pct(r => r.won), rodadasMed: avg(r => r.rounds), disputasGanhasMed: avg(r => r.my.disp), especiaisMed: avg(r => r.my.esp),
      fast6: pct(r => r.won && r.rounds <= 6), fast8: pct(r => r.won && r.rounds <= 8), comeback: pct(r => r.won && r.my.min <= 3),
      int2: pct(r => r.won && r.my.att.int >= 2), pod2: pct(r => r.won && r.my.att.pod >= 2), esp1win: pct(r => r.won && r.my.esp >= 1),
      vd: pct(r => r.my.att.vel >= 1 && r.my.att.def >= 1), d5: pct(r => r.my.disp >= 5), esp3: pct(r => r.my.esp >= 3), todosAttr: pct(r => ['pod', 'def', 'int', 'vel'].every(a => r.my.att[a] > 0)) };
    console.log(JSON.stringify(out));
  }
})();
