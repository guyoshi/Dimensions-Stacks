// Gera as mensagens que o anfitrião enviaria ao convidado (jogador 0) numa partida só de bots. Uso: node tests/gen_replay.js saida.json [seed] [jogadores]
const fs = require('fs'); const E = require('../engine.js'); require('../privacy.js');
(async () => {
  const out = process.argv[2], seed = +process.argv[3] || 11, n = +process.argv[4] || 3; let G, seq = 0; const msgs = []; const pr = globalThis.DSPriv.create({ get s() { return G.s; } });
  const players = [...Array(n)].map((_, i) => ({ name: 'J' + i, bot: true, avatar: i, diff: 'normal' })); const viewer = 0; let logq = [], fl = false;
  const io = { notify: async (type, data) => { data = data || {}; pr.note(type); const nn = ++seq;
      if (type === 'peek' && data.pid !== viewer) { /* não vai ao convidado */ } else { const o = { n: nn, t: type, d: pr.ev(type, data, viewer), st: pr.state(viewer) }; if (pr.f.combatOn && G.combat && type !== 'combatEnd') o.cb = pr.cb(G.combat, viewer); else if (type === 'combatEnd') o.cb = null; msgs.push(o); }
      if (type === 'combatStart') pr.f.combatOn = true; if (type === 'combatEnd') pr.f.combatOn = false; },
    log: (text, cls) => { msgs.push({ n: ++seq, t: 'log', lg: [[text, cls || '']] }); } };
  G = new E.Game({ players, perPlayer: 8, difficulty: 'normal', seed, io }); await G.run();
  fs.writeFileSync(out, JSON.stringify({ n, msgs })); console.log('mensagens', msgs.length, 'vencedor', G.s.winner);
})();
