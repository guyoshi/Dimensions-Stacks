// Auditoria das cartas novas (J24–J37) no jogo normal: vitória por atributo, taxa de vitória por carta e uso dos especiais. Uso: node tools/audit_novas.js [jogos]
const E = require('../engine.js'); const N = +process.argv[2] || 60; const NOVAS = []; for (let i = 24; i <= 37; i++) NOVAS.push('J' + i);
if (process.env.NOJ) { const D = globalThis.DS_DATA; for (let i = D.CARTAS.length - 1; i >= 0; i--) if (NOVAS.includes(D.CARTAS[i].id)) D.CARTAS.splice(i, 1); }   // NOJ=1: sem as cartas novas (referência)
const AT = ['pod', 'def', 'int', 'vel'], sum = c => AT.reduce((t, a) => t + c.stats[a], 0);
(async () => {
  const attr = { pod: 0, def: 0, int: 0, vel: 0 }, st = {}; let comb = 0;
  const S = id => st[id] || (st[id] = { ent: 0, win: 0, prep: 0, used: 0 });
  for (let k = 0; k < N; k++) for (const n of [2, 3, 4]) {
    const players = [...Array(n)].map((_, i) => ({ name: 'B' + i, bot: true, avatar: i, diff: 'dificil' }));
    const g = new E.Game({ players, perPlayer: 14, difficulty: 'dificil', seed: 900 + k * 17 + n, io: { notify: async (t, d) => {
      if (t === 'prepare') S(d.card).prep++;
      if (t === 'effectStart') S(d.act.card).used++;
      if (t === 'combatEnd' && d.combat) { const c = d.combat, r = c.result; comb++; c.entries.forEach(e => { if (!e.gone) S(e.card).ent++; }); if (r && r.winnerPid != null && r.attr) { attr[r.attr]++; const w = c.entries.find(e => e.pid === r.winnerPid); if (w) S(w.card).win++; } }
    } } });
    await g.run();
  }
  const tot = AT.reduce((t, a) => t + attr[a], 0); console.log('Disputas', comb, '· vitória por atributo:', AT.map(a => a + ' ' + (100 * attr[a] / tot).toFixed(1) + '%').join(' · '));
  const all = Object.keys(E.CARDS).filter(id => st[id]), base = all.filter(id => !NOVAS.includes(id)), avg = f => base.reduce((t, id) => t + f(st[id]), 0) / base.length;
  const bw = base.reduce((t, id) => t + st[id].win, 0) / base.reduce((t, id) => t + st[id].ent, 0), bu = base.reduce((t, id) => t + st[id].used, 0) / Math.max(1, base.reduce((t, id) => t + st[id].prep, 0));
  console.log('Referência (demais cartas): vitória por aparição ' + (100 * bw).toFixed(1) + '% · uso/preparo ' + bu.toFixed(2));
  NOVAS.forEach(id => { const s = st[id] || { ent: 0, win: 0, prep: 0, used: 0 }, c = E.CARDS[id], sp = E.SPECIALS[c.especial]; console.log(id, (c.nome || '').padEnd(14), String(sum(c)).padStart(3), (c.especial || '') + ' ' + (sp ? sp.nome : '?').slice(0, 26).padEnd(26), 'aparições', String(s.ent).padStart(4), 'vitória', (100 * s.win / Math.max(1, s.ent)).toFixed(0).padStart(3) + '%', 'preparos', String(s.prep).padStart(3), 'usos', String(s.used).padStart(3), 'uso/prep', (s.used / Math.max(1, s.prep)).toFixed(2)); });
})();
