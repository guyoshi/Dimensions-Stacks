// Auditoria das duplas: todos os especiais, forçados, em partidas 2×2. Confere conservação de cartas, término e se algum efeito hostil atingiu o parceiro.
// Uso: node tests/audit_duplas.js [partidas por especial] [AE-xxx]
const E = require('../engine.js');
const N = +process.argv[2] || 40, only = process.argv[3];
const ids = Object.keys(E.SPECIALS).filter(i => !E.SPECIALS[i].stub && (!only || i === only));
const orig = {}; Object.values(E.CARDS).forEach(c => orig[c.id] = c.especial);
const total = g => { let n = g.s.bh.filter(x => !String(x.id).includes('*')).length; g.s.players.forEach(p => { n += [...p.deck, ...p.reserve, ...p.prepared].filter(x => !String(x).includes('*')).length; }); return n; };
// efeitos que, por texto, atingem "todos, inclusive você" (podem tocar no parceiro) ou movem cartas entre os dois rivais (que são parceiros entre si)
const GLOBAL = new Set(['AE-063', 'AE-064', 'AE-065', 'AE-066', 'AE-021', 'AE-022', 'AE-023', 'AE-024', 'AE-025', 'AE-057', 'AE-058', 'AE-061', 'AE-062']);
(async () => {
  let fails = 0, hostile = {}, used = {}, games = 0;
  for (const id of ids) {
    Object.values(E.CARDS).forEach(c => c.especial = id);
    for (let k = 0; k < N; k++) {
      const players = [...Array(4)].map((_, i) => ({ name: 'B' + i, bot: true, avatar: i, pol: { val: 5, mul: 5 } }));
      let expected = null, g;
      const io = { notify: async (t, d) => {
        if (t === 'effectStart') used[id] = (used[id] || 0) + 1;
        if (t === 'ready') expected = total(g);
        if (t === 'steal' && d.from != null && d.to != null && g.sameTeam(d.from, d.to) && !GLOBAL.has(id)) hostile[id] = (hostile[id] || 0) + 1;
        if (t === 'combatEnd' || t === 'end') { if (expected != null && total(g) !== expected) throw new Error(`conservação ${total(g)}!=${expected}`);
          const all = []; g.s.players.forEach(p => all.push(...p.deck, ...p.reserve, ...p.prepared)); g.s.bh.forEach(x => all.push(x.id)); if (new Set(all).size !== all.length) throw new Error('carta duplicada'); } } };
      g = new E.Game({ players, perPlayer: 10, difficulty: 'dificil', teams: [[0, 2], [1, 3]], seed: 31000 + k * 7, specialsFrom: 1, maxCombats: 150, io });
      const H = g.hit.bind(g), T = g.take.bind(g), C = g.cancelAct.bind(g);
      g.hit = async (c, a, v) => { if (v != null && g.sameTeam(a, v)) hostile[id] = (hostile[id] || 0) + 1; return H(c, a, v); };
      g.take = async (c, th, v, ...r) => { if (g.sameTeam(th, v) && !GLOBAL.has(id)) hostile[id] = (hostile[id] || 0) + 1; return T(c, th, v, ...r); };
      g.cancelAct = async (c, a, by) => { if (a && by != null && g.sameTeam(a.pid, by)) hostile[id] = (hostile[id] || 0) + 1; return C(c, a, by); };
      try { await g.run(); games++; if (!g.s.over) throw new Error('não terminou'); } catch (e) { fails++; console.log('FALHA', id, k, e.message, (e.stack || '').split('\n')[1]); if (fails > 10) process.exit(1); }
    }
  }
  Object.entries(orig).forEach(([k, v]) => E.CARDS[k].especial = v);
  const h = Object.keys(hostile);
  console.log('especiais', ids.length, 'partidas', games, 'falhas', fails, '| usados', Object.keys(used).length, '| efeitos hostis contra o parceiro:', h.length ? h.map(i => i + '×' + hostile[i]).join(', ') : 'nenhum');
})();
