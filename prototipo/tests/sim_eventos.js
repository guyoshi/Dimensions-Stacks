// Balanceamento dos fenômenos: força cada evento em TODAS as rodadas (estresse) e compara com a base sem eventos.
// Mede: falhas/conservação, duração, vitória por nível de bot, vantagem de quem inicia, empates, captura x defesa.
const E = require('../engine.js'); const N = +process.argv[2] || 150;
const total = g => { const s = g.s; let n = s.bh.length; s.players.forEach(p => { n += p.deck.length + p.reserve.length + p.prepared.length; }); return n; };
const IDS = ['base', 'forca', 'nevoa', 'eco', 'aberta', 'tempestade', 'buraco', 'correnteza', 'muralha', 'eclipse', 'avesso', 'troca', 'bloqueio'];
const LV = ['facil', 'normal', 'dificil', 'dificil'];
async function game(id, k, force) {
  const players = LV.map((d, i) => ({ name: 'B' + i, bot: true, avatar: i, diff: d }));
  const st = { ci: 0, ini: 0, att: 0, def: 0, tie: 0, none: 0, byLimit: 0 }; let exp = null;
  const g = new E.Game({ players, perPlayer: 14, difficulty: 'normal', seed: 7000 + k * 31, events: id !== 'base', io: { notify: async (t, d) => {
    if (t === 'ready') { exp = total(g); if (id !== 'base') { const o = {}; for (let r = 1; r <= 200; r++) { if (id === 'buraco' && r % 5 !== 3) continue; o[r] = id === 'troca' ? { id, pair: E.EV_PARES ? E.EV_PARES[r % E.EV_PARES.length] : ['pod', 'def'] } : { id }; } g.s.events = o; } }
    if (exp != null && ['combatStart', 'combatEnd', 'end'].includes(t)) {
      const all = []; g.s.players.forEach(p => all.push(...p.deck, ...p.reserve, ...p.prepared)); g.s.bh.forEach(x => all.push(x.id));
      if (all.length !== exp) throw new Error(`conservação ${t}: ${all.length} != ${exp}`); if (new Set(all).size !== all.length) throw new Error('duplicada ' + t);
    }
    if (t === 'combatEnd') { const r = d.combat.result || {}; st.ci++; if (r.type === 'attack') st.att++; else if (r.type === 'defense') st.def++; else if (r.type === 'tie') st.tie++; else st.none++; if (r.winnerPid != null && r.winnerPid === d.combat.initiator) st.ini++; }
  } } });
  const w = await g.run(); st.byLimit = g.s.byLimit ? 1 : 0; return { w, st, rounds: g.s.round, combats: g.s.combats, lv: w != null ? LV[w] : null };
}
(async () => {
  console.log('evento'.padEnd(11), 'jogos falhas  disp.med  rod.med limite | vence: facil normal dificil | ini%  atk%  def%  empate%');
  for (const id of IDS) {
    let fails = 0, n = 0, disp = 0, rod = 0, lim = 0, wl = { facil: 0, normal: 0, dificil: 0, nulo: 0 }, S = { ci: 0, ini: 0, att: 0, def: 0, tie: 0 };
    for (let k = 0; k < N; k++) {
      try { const r = await game(id, k); n++; disp += r.combats; rod += r.rounds; lim += r.st.byLimit; wl[r.lv || 'nulo']++; for (const x in S) S[x] += r.st[x]; }
      catch (e) { fails++; if (fails < 3) console.log('FALHA', id, k, e.message); }
    }
    const pc = x => (100 * x / Math.max(1, S.ci)).toFixed(0).padStart(3) + '%';
    const wp = x => (100 * x / Math.max(1, n)).toFixed(0).padStart(3) + '%';
    console.log(id.padEnd(11), String(n).padStart(5), String(fails).padStart(6), String((disp / Math.max(1, n)).toFixed(0)).padStart(8), String((rod / Math.max(1, n)).toFixed(1)).padStart(8), String(lim).padStart(6), '|', wp(wl.facil).padStart(11), wp(wl.normal).padStart(6), wp(wl.dificil).padStart(7), '|', pc(S.ini), pc(S.att), pc(S.def), pc(S.tie));
  }
})();
