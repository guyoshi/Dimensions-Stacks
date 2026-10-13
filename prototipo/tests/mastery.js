// Maestria: o gravador deve contar só as cartas do jogador local (usos, disputas vencidas, especiais resolvidos) e os níveis seguem os limiares.
const store = {}; globalThis.localStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
const E = require('../engine.js'); const S = require('../stats.js') && globalThis.DSSTATS; let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.log('FALHA', m); } };
(async () => {
  // níveis
  const p = S.profile(); p.mast = { X1: { u: 2, w: 0, s: 0 }, X2: { u: 1, w: 1, s: 0 }, X3: { u: 3, w: 2, s: 2 }, X4: { u: 10, w: 8, s: 4 }, X5: { u: 20, w: 15, s: 10 }, X6: { u: 100, w: 100, s: 100 } };
  const lv = id => S.mastery(id).lv; ok(lv('X1') === 0 && lv('X2') === 1 && lv('X3') === 2 && lv('X4') === 4 && lv('X5') === 5 && lv('X6') === 5, 'níveis ' + ['X1', 'X2', 'X3', 'X4', 'X5', 'X6'].map(lv));
  ok(S.mastery('Z').lv === 0 && S.mastery('Z').xp === 0, 'carta sem dados');
  S.reset();
  // partidas
  let gamesOk = 0; const seen = { u: {}, w: {}, s: {} };
  for (let k = 0; k < 12; k++) {
    const n = 2 + (k % 3), viewer = k % n, players = [...Array(n)].map((_, i) => ({ name: 'J' + i, bot: true, avatar: i, diff: 'normal' }));
    const rec = S.recorder({ viewer, online: false, humans: 1, n, diff: 'normal', per: 8, sf: 2, sim: true }); let G, last = null;
    const exp = { u: {}, w: {}, s: {} }; const inc = (o, id) => { o[id] = (o[id] || 0) + 1; }; const counted = new Set();
    const io = { notify: async (type, d) => { d = d || {}; const r = rec.ev(type, d, G); if (r) last = r;
      if (type === 'combatStart') counted.clear();
      if (type === 'commit' || type === 'reveal') d.combat.entries.forEach(e => { if (e.pid === viewer && !counted.has(e.pid)) { counted.add(e.pid); inc(exp.u, e.card); } });
      if (type === 'effectEnd' && d.act.pid === viewer && !d.act.forced) inc(exp.s, d.act.card);
      if (type === 'resolved' && d.result.winnerPid === viewer) d.combat.entries.forEach(e => { if (e.pid === viewer) inc(exp.w, e.card); }); } };
    // o recorder só devolve resumo no evento 'end': captura-o chamando ev('end') no fim
    G = new E.Game({ players, perPlayer: 8, difficulty: 'normal', seed: 7000 + k * 13, io }); await G.run();
    const res = last;
    ok(res && Array.isArray(res.mast), 'finish devolve mast'); const mast = S.profile().mast;
    // o 'end' já adicionou ao perfil: compara o acumulado desta partida (perfil novo a cada iteração)
    for (const id of new Set([...Object.keys(exp.u), ...Object.keys(exp.w), ...Object.keys(exp.s)])) { const m = mast[id] || { u: 0, w: 0, s: 0 }; ok(m.u === (exp.u[id] || 0) && m.w === (exp.w[id] || 0) && m.s === (exp.s[id] || 0), `contagem ${id} esperado ${exp.u[id] || 0}/${exp.w[id] || 0}/${exp.s[id] || 0} obtido ${m.u}/${m.w}/${m.s}`); }
    ok(Object.keys(mast).every(id => exp.u[id] || exp.w[id] || exp.s[id]), 'carta alheia contada'); gamesOk++; S.reset();
  }
  console.log(`partidas ${gamesOk}, falhas ${bad}`); process.exit(bad ? 1 : 0);
})();
