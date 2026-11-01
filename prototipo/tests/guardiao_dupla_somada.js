// Regra do Guardião Dupla somada: 2 Guardiões × 1 jogador, mas duas cartas por lado.
const E = require('../engine.js');
const D = globalThis.DS_DATA.CARTAS.filter(c => c.raridade !== 'quasar');
const ids = D.filter(c => !c.uniao).slice(0, 13).map(c => c.id);
const mao = [ids.slice(0, 7), ids.slice(7, 10), ids.slice(10, 13)];
let g, commits = 0, reveals = 0, failures = [];
const io = {
  log() {},
  notify: async (type, data) => {
    if (type === 'commit') {
      commits++;
      const es = data.combat.entries, pe = es.find(e => e.pid === 0), guardas = es.filter(e => e.pid >= 1);
      if (guardas.length === 2 && pe.extra.length !== 1) failures.push('com dois Guardiões, o jogador não lançou exatamente duas cartas');
      if (guardas.length === 1 && pe.extra.length !== 0) failures.push('com um Guardião, a disputa não voltou para uma carta por lado');
    }
    if (type === 'reveal') {
      reveals++;
      const es = data.combat.entries, pe = es.find(e => e.pid === 0), guardas = es.filter(e => e.pid >= 1);
      if (guardas.length === 2) {
        const a = pe.attr, ps = pe.stats[a] + pe.extra.reduce((t, c) => t + pe.extraStats[c][a], 0);
        const gs = guardas.reduce((t, e) => t + e.stats[e.attr] + e.bonus, 0);
        if (g.combatValue(data.combat, pe) !== ps) failures.push('a soma das duas cartas do jogador está incorreta');
        if (guardas.some(e => g.combatValue(data.combat, e) !== gs)) failures.push('a soma das cartas dos Guardiões está incorreta');
      }
    }
    if (type === 'resolved' && data.result.winnerPid != null) {
      const w = data.combat.entries.find(e => e.pid === data.result.winnerPid);
      if (data.result.value !== g.combatValue(data.combat, w)) failures.push('o resultado exibido não usa o total somado');
    }
  }
};
g = new E.Game({ players: [{ name: 'Você', bot: true, diff: 1 }, { name: 'Cassiopeia', bot: true, diff: .9 }, { name: 'Órion', bot: true, diff: .9 }], maos: mao, perPlayer: 7, teams: [[0], [1, 2]], teamPool: false, regra: { id: 'g_duo' }, events: false, maxCombats: 100, seed: 41027, io });
(async () => {
  await g.run();
  if (!commits || !reveals) failures.push('a batalha não chegou às disputas');
  const total = g.s.players.reduce((n, p) => n + p.deck.length + p.reserve.length + p.prepared.length, 0) + g.s.bh.length;
  if (total !== 13) failures.push(`conservação de cartas falhou: ${total}/13`);
  if (failures.length) { console.error([...new Set(failures)].join('\n')); process.exit(1); }
  console.log('Dupla somada: 2×1, duas cartas por lado, retorno ao 1×1 e totais verificados.');
})();
