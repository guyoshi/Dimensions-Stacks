// Simulador do painel admin: variantes (duplas, sem fenômenos, sem especiais) rodam e o gravador registra as flags.
const E = require('../engine.js'); require('../stats.js'); const ST = globalThis.DSSTATS;
async function run(o, seed) {
  const players = [...Array(o.players)].map((_, k) => ({ name: 'CPU ' + (k + 1), bot: true, avatar: k }));
  const rec = ST.recorder({ viewer: -1, online: false, humans: 0, n: o.players, diff: 'normal', per: o.per, sf: o.sf, sim: true, duo: o.duo, ev: o.ev });
  let res = null, G; G = new E.Game({ players, perPlayer: o.per, difficulty: 'normal', specialsFrom: o.sf, events: o.ev, teams: o.duo ? [[0, 2], [1, 3]] : null, seed, io: { notify: async (t, d) => { const r = rec.ev(t, d, G); if (r) res = r; } } });
  await G.run(); return res && res.summary;
}
(async () => {
  let bad = 0; const chk = (c, m) => { console.log(c ? 'ok  ' : 'FALHA', m); if (!c) bad++; };
  for (const [nome, o] of [['todos×todos', { players: 4, per: 14, sf: 2, ev: true, duo: false }], ['duplas', { players: 4, per: 14, sf: 2, ev: true, duo: true }], ['sem fenômenos', { players: 3, per: 14, sf: 2, ev: false, duo: false }], ['sem especiais', { players: 2, per: 14, sf: 99, ev: true, duo: false }]]) {
    let n = 0, spec = 0, evs = 0;
    for (let k = 0; k < 6; k++) { const s = await run(o, 100 + k); if (s) { n++; spec += s.spec; chk(s.duo === o.duo && s.ev === o.ev, nome + ' flags registradas'); } }
    chk(n === 6, nome + ': 6 partidas concluídas'); if (o.sf === 99) chk(spec === 0, 'sem especiais: 0 usos (' + spec + ')'); else chk(spec > 0, nome + ': especiais usados (' + spec + ')');
  }
  process.exit(bad ? 1 : 0);
})();
