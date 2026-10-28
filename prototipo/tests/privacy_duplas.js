// (variante duplas 2x2: o parceiro pode ver as cartas do parceiro, os adversários não) Privacidade online: nenhuma visão enviada a um jogador pode conter carta oculta de outro (baralho, reserva, preparados, carta na mesa antes de revelar).
// Roda partidas completas com o motor real, monta a visão de cada jogador com DSPriv e procura os ids/nomes das cartas ocultas nas mensagens.
const E = require('../engine.js'); require('../privacy.js'); const P0 = globalThis.DSPriv; const CARDS = E.CARDS;
const N = +process.argv[2] || 60; let leaks = 0, checked = 0, evs = 0;
(async () => {
  for (let k = 0; k < N; k++) {
    const n = 4, players = [...Array(n)].map((_, i) => ({ name: 'J' + i, bot: true, avatar: i, diff: ['facil', 'normal', 'dificil'][(k + i) % 3] }));
    let G; const pr = P0.create({ get s() { return G.s; }, teams: [[0, 2], [1, 3]] }); const logs = [];
    const priv = r => { const set = new Set(); G.s.players.forEach(p => { if (p.pid === r || (r + 2) % 4 === p.pid) return; [...p.deck, ...p.reserve, ...p.prepared].forEach(c => { if (!String(c).includes('*')) set.add(c); }); });
      if (G.combat && !pr.f.revealed) G.combat.entries.forEach(e => { if (e.pid !== r) { [e.card, ...(e.extra || [])].forEach(c => { if (!String(c).includes('*')) set.add(c); }); } });
      G.s.bh.forEach(x => set.delete(x.id)); return set; };
    let pub = new Set(), mine = {}; const scan = (txt, r, what, type) => { checked++; const set = priv(r); pub.forEach(c => set.delete(c)); (mine[r] || []).forEach(c => set.delete(c)); for (const c of set) {
        if (txt.includes('"' + c + '"') || txt.includes('"' + c + ':')) { leaks++; if (leaks < 8) console.log('VAZOU id', c, 'para', r, 'em', what, type); }
        else if (new RegExp(CARDS[c].nome.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\p{L}])', 'u').test(txt)) { leaks++; if (leaks < 400) console.log('VAZOU nome', CARDS[c].nome, 'para', r, 'em', what, type); } } };
    const io = { notify: async (type, data) => {
      pr.note(type); evs++; data = data || {}; pub = new Set(); if (pr.f.revealed) { const cb = data.combat || G.combat; if (cb) cb.entries.forEach(e => { pub.add(e.card); (e.extra || []).forEach(c => pub.add(c)); }); } (data.moves || []).forEach(m => (m.cards || []).forEach(c => pub.add(c))); (data.acts || []).forEach(a => pub.add(a.card)); if (data.act) pub.add(data.act.card);
      if (type === 'eventFx' && data.cards) data.cards.forEach(c => pub.add(c));   // Maré do Buraco Negro: cartas que saíram do Buraco Negro (públicas)
      if (type === 'specialsDone') (data.claimed || []).forEach(x => pub.add(x.card));   // especial usado já foi revelado ao virar
      mine = {}; for (let r = 0; r < n; r++) { mine[r] = []; if (type === 'eventFx' && data.moves) data.moves.forEach(m => { if (m.from === r || m.to === r) mine[r].push(m.card); }); if (type === 'peek' && data.pid === r) mine[r].push(...(data.cards || [])); if (type === 'steal' && (data.from === r || data.to === r)) mine[r].push(data.card); if (type === 'discard' || type === 'rescue') mine[r].push(data.card); }
      for (let r = 0; r < n; r++) {
        if (type === 'peek' && data.pid !== r) continue;
        const o = { t: type, d: pr.ev(type, data, r), st: pr.state(r) }; if (pr.f.combatOn && G.combat && type !== 'combatEnd') o.cb = pr.cb(G.combat, r);
        if (o.d && o.d.calc && o.d.calc.fx) o.d.calc.fx = o.d.calc.fx.filter(t => !/(captura|resgata) /.test(t));   // mesmas linhas públicas do registro
        scan(JSON.stringify(o), r, 'evento', type);
      }
      if (type === 'combatStart') pr.f.combatOn = true; if (type === 'combatEnd') pr.f.combatOn = false;
    }, log: (text) => { if (/(captura|resgata) /.test(text)) return; /* públicos: cartas reveladas na disputa e Buraco Negro */ for (let r = 0; r < n; r++) scan(JSON.stringify({ lg: [[text, '']] }), r, 'log', text.slice(0, 40)); } };
    G = new E.Game({ players, perPlayer: 8, difficulty: 'normal', teams: [[0, 2], [1, 3]], seed: 9000 + k * 7, io }); await G.run();
  }
  console.log(`mensagens verificadas ${checked}, eventos ${evs}, vazamentos ${leaks}`); process.exit(leaks ? 1 : 0);
})();
