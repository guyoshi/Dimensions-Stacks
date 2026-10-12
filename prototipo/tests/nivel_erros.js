// Mostra os erros típicos de cada nível: carta forte sacrificada em especial e entrega da carta errada quando é roubado.
const E = require('../engine.js'); const nm = { facil: 'fácil', normal: 'médio', dificil: 'difícil' };
const S = Object.values(E.CARDS).map(c => E.sum4(c.stats)).sort((a, b) => a - b); const pc = s => S.filter(x => x <= s).length / S.length;
(async () => {
  for (const d of ['facil', 'normal', 'dificil']) {
    let prep = 0, strong = 0, sumP = 0, give = 0, lowest = 0, bad = 0, badStrong = 0;
    for (let k = 0; k < 120; k++) {
      const pl = [0, 1, 2].map(i => ({ name: 'B' + i, bot: true, avatar: i, diff: d }));
      const g = new E.Game({ players: pl, perPlayer: 12, difficulty: d, seed: 88000 + k * 5, io: { notify: async (t, x) => { if (t === 'prepare') { const p = pc(E.sum4(E.CARDS[x.card].stats)); prep++; sumP += p; if (p > 0.66) strong++; const sp = E.SPECIALS[E.CARDS[x.card].especial]; if ((sp.val || 0) - 1.2 * p < -0.45) { bad++; if (p > 0.66) badStrong++; } } } } });
      await g.run();
      for (let j = 0; j < 40; j++) { // entrega de carta quando é roubado (o bot escolhe qual dar; o certo é a mais fraca)
        const cards = g.s.bh.slice(0, 5).map(x => x.id).concat(Object.keys(E.CARDS).sort(() => g.rand() - 0.5).slice(0, 4)).slice(0, 5);
        const dif = [...new Set(cards)]; if (dif.length < 3) continue; const low = dif.slice().sort((a, b) => E.sum4(E.CARDS[a].stats) - E.sum4(E.CARDS[b].stats))[0];
        const r = await g.askCards(0, { title: 'x', cards: dif, min: 1, max: 1 }, () => [low]); give++; if (r[0] === low) lowest++;
      }
    }
    console.log(nm[d].padEnd(7), `preparos ${prep} · carta preparada com força média (percentil) ${(100 * sumP / prep).toFixed(0)} · preparos ruins (carta vale bem mais que o especial) ${(100 * bad / prep).toFixed(0)}% · ${(100 * badStrong / prep).toFixed(0)}% sacrificam carta do terço mais forte por especial fraco · entrega a mais fraca em ${(100 * lowest / give).toFixed(0)}% das vezes`);
  }
})();
