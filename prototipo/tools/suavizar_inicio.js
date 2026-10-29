// Suaviza os decks inimigos perto dos 4 pontos de partida (29/10/2026, autor): decks fracos no início, com 1 carta boa para o jogador capturar; sobem aos poucos com a distância.
// Uso: node tools/suavizar_inicio.js [--aplicar]. Altera prototipo/historia_bat.js e dados/historia_batalhas.json. Lendárias, Átila, A Besta e cartas da União nunca são mexidas.
const fs = require('fs'), path = require('path'); const E = require('../engine.js'); global.window = global; require('../historia_bat.js'); require('../historia_mapa.js');
const B = window.DS_HIST_BAT, M = window.DS_MAPA, BY = Object.fromEntries(M.nos.map(n => [n.id, n])), C = E.CARDS, P4 = id => { const v = Object.values(C[id].stats); return v.reduce((a, b) => a + b, 0) + 16 * Math.max(...v); }, S = P4;   // força = poder (soma + 16 × pico), a mesma da raridade
const EXC = new Set(['S11', 'V26', 'J30']), DMAX = 8, aplicar = process.argv.includes('--aplicar');
const dist = {}; Object.values(M.starts).forEach(s => { const q = [[s, 0]], seen = new Set([s]); while (q.length) { const [u, d] = q.shift(); if (!(u in dist) || d < dist[u]) dist[u] = d; BY[u].viz.forEach(v => { if (!seen.has(v) && v !== M.boss) { seen.add(v); q.push([v, d + 1]); } }); } });
const base = Object.values(C).filter(c => !c.uniao && c.raridade !== 'lendaria' && c.raridade !== 'quasar' && !EXC.has(c.id)).map(c => S(c.id)).sort((a, b) => a - b), pct = p => base[Math.min(base.length - 1, Math.max(0, Math.round(p * (base.length - 1))))];
const CAP = d => pct(Math.min(.62, .12 + .07 * d)), PRIZE = d => pct(Math.min(.9, .62 + .035 * d));   // limite das cartas comuns do deck e da carta de prêmio, por distância do início
const livre = id => { const c = C[id]; return c && !c.uniao && c.raridade !== 'lendaria' && c.raridade !== 'quasar' && !EXC.has(id); };
const todas = Object.values(C).filter(c => livre(c.id));
let mudou = 0, nos = 0, antes = [], depois = [];
for (const id of Object.keys(B)) {
  const d = dist[id], tipo = BY[id].tipo; if (d == null || d > DMAX || ['loja', 'minigame', 'boss', 'miniboss', 'guardiao'].includes(tipo)) continue;
  B[id].i.forEach(en => {
    const deck = en.c.slice(), media0 = deck.reduce((t, x) => t + S(x), 0) / deck.length;
    // 1 carta de prêmio: a mais forte permitida (não lendária) até PRIZE(d); as demais ficam sob CAP(d)
    const ord = deck.map((x, k) => [x, k]).sort((a, b) => S(b[0]) - S(a[0]));
    const prizeK = (ord.find(([x]) => livre(x) && S(x) <= PRIZE(d)) || ord.find(([x]) => livre(x)) || [null, -1])[1];
    deck.forEach((x, k) => {
      if (!livre(x)) return; const lim = k === prizeK ? PRIZE(d) : CAP(d); if (S(x) <= lim) return;
      const serie = C[x].serie, cand = todas.filter(c => !deck.includes(c.id) && S(c.id) <= lim).sort((a, b) => (b.serie === serie) - (a.serie === serie) || S(b.id) - S(a.id));
      const cs = cand.filter(c => c.serie === serie), pick = (cs.length ? cs : cand)[0]; if (pick) { deck[k] = pick.id; mudou++; }
    });
    nos++; antes.push(media0); depois.push(deck.reduce((t, x) => t + S(x), 0) / deck.length); en.c = deck;
  });
}
const m = a => (a.reduce((t, x) => t + x, 0) / a.length).toFixed(0);
console.log('nós ajustados', nos, 'cartas trocadas', mudou, 'soma média por carta antes', m(antes), 'depois', m(depois));
if (aplicar) {
  const f = path.join(__dirname, '..', 'historia_bat.js'), js = fs.readFileSync(f, 'utf8'), i = js.indexOf('window.DS_HIST_BAT = ');
  fs.writeFileSync(f, js.slice(0, i) + 'window.DS_HIST_BAT = ' + JSON.stringify(B) + ';\n');
  const jf = path.join(__dirname, '..', '..', 'dados', 'historia_batalhas.json'), J = JSON.parse(fs.readFileSync(jf, 'utf8'));
  J.batalhas.forEach(b => { const x = B[b.id]; if (x) b.inimigos.forEach((en, k) => { en.cartas = x.i[k].c.slice(); }); });
  fs.writeFileSync(jf, JSON.stringify(J, null, 1));
  console.log('aplicado');
}
