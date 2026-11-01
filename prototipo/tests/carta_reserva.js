// Carta de reserva: aparece como decisão na tela de atributo, troca uma vez e manda a carta ao fim.
const E = require('../engine.js');
const ids = globalThis.DS_DATA.CARTAS.filter(c => !c.uniao && c.raridade !== 'quasar').slice(0, 14).map(c => c.id);
let game, asked = 0, swaps = 0, valid = false;
const io = {
  notify: async (type, data) => {
    if (type === 'swapCard' && data.skip) { swaps++; const p = game.p(data.pid); valid = game.s.skipUsed && p.deck[p.deck.length - 1] === data.old && data.card !== data.old; }
  },
  log: () => {},
  orderHand: async (p, hand) => hand,
  attr: async (p, entry, options, combat, canPrep, canSkip) => { asked++; return canSkip && swaps === 0 ? '@skip' : options[0]; },
};
game = new E.Game({ players: [{ name: 'Você', bot: false }, { name: 'CPU', bot: true, diff: 'normal', noSpecial: true }], perPlayer: 7, maos: [ids.slice(0, 7), ids.slice(7, 14)], events: false, specialsFrom: 99, maxCombats: 100, skipOnce: { pid: 0 }, seed: 7751, io });
(async () => {
  await game.run();
  const failures = [];
  if (swaps !== 1) failures.push('deveria trocar exatamente uma vez, trocou ' + swaps);
  if (!valid) failures.push('a carta antiga não foi para o fim do baralho');
  if (!game.s.skipUsed) failures.push('o uso não ficou marcado na partida');
  if (asked < 1) failures.push('a decisão não apareceu na escolha de atributo');
  if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
  console.log('Carta de reserva: botão contextual, troca única e envio ao fim verificados.');
})();
