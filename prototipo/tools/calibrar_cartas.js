/* Calibra, com ajustes pequenos, a força relativa das cartas entre séries.
   Objetivo: cartas da mesma raridade (posição dentro da série) rendem parecido em qualquer série.
   Método: simula (especiais desligados, 2 e 4 jogadores), compara o rendimento de cada carta com a média da sua raridade
   e desloca os 4 atributos da carta por um valor pequeno (limite acumulado ±MAX). Teto 95, piso 5, par fraco <= 70 (exceto A União).
   uso: node tools/calibrar_cartas.js <saida.json> [N=700] [iteracoes=6] [MAX=8] */
const E = require('../engine.js'); const D = globalThis.DS_DATA;
const OUT = process.argv[2], N = +process.argv[3] || 700, IT = +process.argv[4] || 6, MAX = +process.argv[5] || 8;
const AT = ['pod', 'def', 'int', 'vel'], ids = Object.keys(E.CARDS).filter(id => E.CARDS[id].stats);
const base = {}, cur = {}; ids.forEach(id => { base[id] = AT.map(a => E.CARDS[id].stats[a]); cur[id] = base[id].slice(); });
const rar = {}; ids.forEach(id => rar[id] = E.CARDS[id].raridade);
const apply = () => ids.forEach(id => AT.forEach((a, i) => E.CARDS[id].stats[a] = cur[id][i]));
const mean = a => a.reduce((x, y) => x + y, 0) / a.length, sd = a => { const m = mean(a); return Math.sqrt(mean(a.map(x => (x - m) ** 2))); };
async function sim() {
  const out = {};
  for (const n of [2, 4]) {
    const st = {};
    for (let k = 0; k < N; k++) {
      const pl = [...Array(n)].map((_, i) => ({ name: 'B' + i, bot: true, avatar: i, noSpecial: true }));
      const g = new E.Game({ players: pl, perPlayer: n === 2 ? 20 : 10, difficulty: 'dificil', seed: 83000 + k * 29 + n, io: { notify: async (t, d) => {
        if (t === 'combatEnd') { const c = d.combat; const w = g.evaluate(c, true); const ws = new Set(w.winners.map(e => e.pid));
          c.entries.forEach(e => { if (e.withdrawn || !e.card) return; const s = st[e.card] || (st[e.card] = { p: 0, w: 0 }); s.p++; if (ws.has(e.pid) && !w.tie) s.w++; }); }
      } } });
      await g.run();
    }
    out[n] = st;
  }
  const ok = id => out[2][id] && out[4][id] && out[2][id].p >= 5 && out[4][id].p >= 5;
  const rate = (n, id) => out[n][id].w / out[n][id].p; const got = ids.filter(ok);
  const rel = {}; const m2 = mean(got.map(id => rate(2, id))), m4 = mean(got.map(id => rate(4, id)));
  got.forEach(id => rel[id] = (rate(2, id) / m2 + rate(4, id) / m4) / 2);
  return rel;
}
const fraco = (id, v) => { const s1 = v[0] + v[1], s2 = v[2] + v[3]; return s1 >= s2 ? [2, 3] : [0, 1]; };
// preserva a ordem de poder que o autor definiu dentro de cada série (regressão isotônica sobre o poder novo; ajuste da carta escalado até atingir o alvo)
function enforce() {
  const bySer = {}; ids.forEach(id => (bySer[E.CARDS[id].serie] = bySer[E.CARDS[id].serie] || []).push(id));
  Object.values(bySer).forEach(list => {
    list.sort((a, b) => D.poder(base[b]) - D.poder(base[a]) || (a < b ? -1 : 1));
    const y = list.map(id => D.poder(cur[id])); const blk = [];
    y.forEach(v => { blk.push({ s: v, n: 1 }); while (blk.length > 1 && blk[blk.length - 2].s / blk[blk.length - 2].n < blk[blk.length - 1].s / blk[blk.length - 1].n) { const b = blk.pop(); blk[blk.length - 1].s += b.s; blk[blk.length - 1].n += b.n; } });
    const tgt = []; blk.forEach(b => { for (let i = 0; i < b.n; i++) tgt.push(b.s / b.n); });
    list.forEach((id, i) => {
      let best = null;
      for (let u = -(MAX + 2); u <= MAX + 2; u++) {
        const v = cur[id].map((x, k) => Math.max(5, Math.min(95, x + u)));
        if (v.some((x, k) => Math.abs(x - base[id][k]) > MAX + 2)) continue;
        if (!E.CARDS[id].uniao) { const f = fraco(id, v); if (f.some(k => v[k] > 70 && v[k] > base[id][k])) continue; }
        const e = Math.abs(D.poder(v) - tgt[i]); if (!best || e < best.e - 1e-9 || (Math.abs(e - best.e) < 1e-9 && Math.abs(u) < Math.abs(best.u))) best = { e, v, u };
      }
      if (best) cur[id] = best.v;
    });
  });
}
const report = (rel, tag) => {
  const ids = Object.keys(rel);
  const bySer = {}, byRar = {}; ids.forEach(id => { const c = E.CARDS[id]; (bySer[c.serie] = bySer[c.serie] || []).push(rel[id]); (byRar[rar[id]] = byRar[rar[id]] || []).push(rel[id]); });
  const v = ids.map(id => rel[id]); const top = ids.slice().sort((a, b) => rel[b] - rel[a]);
  console.error(tag, 'dp', sd(v).toFixed(3), 'max', E.CARDS[top[0]].nome, rel[top[0]].toFixed(2), 'min', E.CARDS[top[top.length - 1]].nome, rel[top[top.length - 1]].toFixed(2),
    '| série', JSON.stringify(Object.fromEntries(Object.entries(bySer).map(([k, a]) => [k, +mean(a).toFixed(2)]))), '| raridade', JSON.stringify(Object.fromEntries(Object.entries(byRar).map(([k, a]) => [k, +mean(a).toFixed(2)]))));
  const within = Object.values(byRar).flatMap(a => { const m = mean(a); return a.map(x => x - m); }); console.error('   dp dentro da raridade', sd(within).toFixed(3)); return sd(within);
};
(async () => {
  let rel; const hist = [];
  for (let it = 0; it <= IT; it++) {
    apply(); rel = await sim(); hist.push(report(rel, 'it' + it));
    if (it === IT) break;
    const ids = Object.keys(rel); const cls = {}; ids.forEach(id => (cls[rar[id]] = cls[rar[id]] || []).push(rel[id])); const cm = {}; Object.keys(cls).forEach(k => cm[k] = mean(cls[k]));
    // inclinação rendimento relativo por ponto de poder (regressão simples)
    const pw = ids.map(id => D.poder(cur[id])), rv = ids.map(id => rel[id]); const mp = mean(pw), mr = mean(rv);
    let nn = 0, dd = 0; pw.forEach((p, i) => { nn += (p - mp) * (rv[i] - mr); dd += (p - mp) ** 2; }); const slope = nn / dd; // rel por unidade de poder
    ids.forEach(id => {
      const res = rel[id] - cm[rar[id]]; let dP = -0.6 * res / slope; // poder a mudar
      let d = dP / 20; d = Math.max(-3, Math.min(3, d));
      const c = E.CARDS[id]; const nv = cur[id].map((x, i) => { const tot = Math.max(-MAX, Math.min(MAX, x + d - base[id][i])); return Math.round(Math.max(5, Math.min(95, base[id][i] + tot))); });
      if (!c.uniao) { const f = fraco(id, nv); f.forEach(i => { if (nv[i] > 70) nv[i] = Math.max(70, Math.min(nv[i], base[id][i])); }); }
      cur[id] = nv;
    });
    enforce(); enforce();
  }
  const outj = {}; ids.forEach(id => { if (cur[id].some((x, i) => x !== base[id][i])) outj[id] = { de: base[id], para: cur[id] }; });
  let inv = 0; const bs = {}; ids.forEach(id => (bs[E.CARDS[id].serie] = bs[E.CARDS[id].serie] || []).push(id));
  Object.values(bs).forEach(l => { for (let i = 0; i < l.length; i++) for (let k = i + 1; k < l.length; k++) if ((D.poder(base[l[i]]) - D.poder(base[l[k]])) * (D.poder(cur[l[i]]) - D.poder(cur[l[k]])) < 0) inv++; });
  console.log('inversões de ordem de poder dentro das séries:', inv);
  require('fs').writeFileSync(OUT, JSON.stringify({ hist, mudancas: outj, rel }));
  console.log('cartas alteradas:', Object.keys(outj).length, '| dp por iteração:', hist.map(x => x.toFixed(3)).join(' → '));
})();

