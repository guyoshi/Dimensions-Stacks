// Simulação simplificada do Boss final em 3 fases (PROPOSTA). Uso: node tools/sim_boss.js [partidas]
require('../data.js'); const D = global.DS_DATA || globalThis.DS_DATA;
const AT = ['pod', 'def', 'int', 'vel'], PAR = { pod: 0, def: 0, int: 1, vel: 1 }, sum = c => AT.reduce((t, a) => t + c.stats[a], 0);
const UN = ['D06', 'M01', 'J03', 'B01', 'S01', 'M10', 'V15', 'V02'], BY = {}; D.CARTAS.forEach(c => { BY[c.id] = c; });
const NU = D.CARTAS.filter(c => !c.uniao && c.id !== 'S11').sort((a, b) => sum(b) - sum(a));
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
// Chamados: gelo(V02) muralha(J03) visao(M10) abordagem(S01) elemento(B01) inversao(M01) elo(D06) reforco(V15)
const CH = { V02: 'gelo', J03: 'muralha', M10: 'visao', S01: 'abordagem', B01: 'elemento', M01: 'inversao', D06: 'elo', V15: 'reforco' };
function jogo(P, R) {
  const rnd = R, shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  // jogador: 22 cartas sorteadas entre as 50 melhores + 8 da União, União espaçada
  const outros = shuffle(NU.slice(0, P.pool || 50)).slice(0, 22).sort((a, b) => sum(b) - sum(a)).map(c => c.id), deck = [];
  const uni = UN.filter(u => !(P.semUniao || []).includes(u)); let ui = 0;
  outros.forEach((c, i) => { deck.push(c); if (i % 3 === 2 && ui < uni.length) deck.push(uni[ui++]); }); while (ui < uni.length) deck.push(uni[ui++]);
  let me = { deck, prep: [], tired: [] };
  for (let fase = P.so || 1; fase <= (P.so || 3); fase++) {
    const N = P.N[fase - 1], pool = NU.slice(0, P.bestaPool || 40); let bd = shuffle(pool).slice(0, N).map(c => c.id), round = 0, mov = null, info = 0, cancel = false, init = fase === 1 ? 1 : rnd() < .5 ? 0 : 1, guard = 0;
    me.deck = deck.slice(); me.tired = []; me.prep = [];   // cada fase recomeça com as suas 30 cartas (capturadas saem, cansadas voltam)
    while (bd.length && guard++ < 100) {
      round++;
      // cansadas voltam
      me.tired = me.tired.filter(t => { if (--t.t <= 0) { me.deck.push(t.c); return false; } return true; });
      // buraco negro (fase 3): puxa do fundo
      if (fase === 3) { const k = round <= 4 ? 1 : round <= 8 ? 2 : 3; for (let i = 0; i < k; i++) { if (me.deck.length > 1) { const c = me.deck.pop(); if (UN.includes(c) && rnd() < (P.salva == null ? .7 : P.salva)) me.deck.unshift(c); } if (bd.length) bd.pop(); } if (!bd.length) break; }
      // Movimento da Besta (fases 1): a cada 2 rodadas, anunciado na rodada anterior
      if (fase === 1) mov = round % 2 === 0 ? ['garra', 'veu', 'mare'][Math.floor(rnd() * 3)] : null;
      // preparar União do topo
      if (!P.semChamados) while (me.prep.length < 2 && me.deck.length > 1 && CH[me.deck[0]]) me.prep.push(me.deck.shift());
      if (!me.deck.length) { if (me.prep.length) me.deck.push(me.prep.shift()); else return { fase, win: false, why: 'sem cartas' }; }
      const pc = me.deck.shift(), bc = bd.shift(), B = BY[bc], A = BY[pc];
      // usa Chamados
      let used = [], muralha = false, inv = false, reforco = 0, elemento = false, gelo = false;
      const usa = (n) => { const i = me.prep.findIndex(c => CH[c] === n); if (i >= 0) { used.push(me.prep.splice(i, 1)[0]); return true; } return false; };
      if (!P.semChamados) {
        if (mov && fase === 1) { if (mov === 'garra') { if (!usa('muralha')) usa('gelo'); } else { if (!usa('gelo')) { } } }
        if (used.some(c => CH[c] === 'gelo')) { mov = null; gelo = true; } if (used.some(c => CH[c] === 'muralha')) { muralha = true; mov = mov === 'garra' ? null : mov; }
        if (usa('visao')) info = 3; if (usa('reforco')) reforco = 20;
        if (usa('abordagem')) { /* captura a carta de cima da Besta sem disputa */ if (bd.length) { me.deck.push(bd.shift()); } }
        if (init === 0 && usa('elemento')) elemento = true; else if (init === 1 && me.prep.some(c => CH[c] === 'elemento') && rnd() < .5) { usa('elemento'); elemento = true; }
        if (me.tired.length || true) { /* elo: devolve carta capturada pela Besta (a mais recente do fundo do baralho dela) */ if (usa('elo')) { const i = bd.findIndex(c => !UN.includes(c) && !pool.some(p => p.id === c)); if (i >= 0) me.deck.push(bd.splice(i, 1)[0]); } }
        if (info > 0) info--;
      }
      // bônus
      const bb = P.bonusF ? P.bonusF[fase - 1] : (P.bonus || 0), bonA = fase === 2 ? (rnd() < (P.q == null ? .7 : P.q) ? 10 : -10) : 0;
      const sa = a => A.stats[a] + (fase === 2 ? bonA : 0) + reforco, sb = a => B.stats[a] + bb;
      // escolha do atributo
      let attr;
      const best = (f, set) => set.reduce((x, y) => f(y) > f(x) ? y : x);
      const timeout = fase === 2 && rnd() < (P.pressa == null ? .12 : P.pressa);
      if (init === 0) { attr = timeout || (mov === 'veu') ? AT[Math.floor(rnd() * 4)] : best(sa, AT); }
      else { const bAttr = best(sb, AT); attr = elemento || info > 0 ? (info > 0 ? best(a => sa(a) - sb(a), AT) : best(sa, AT)) : best(sa, AT.filter(a => PAR[a] === PAR[bAttr])); if (timeout) attr = AT.filter(a => PAR[a] === PAR[bAttr])[Math.floor(rnd() * 2)]; if (mov === 'veu' && !elemento) attr = AT.filter(a => PAR[a] === PAR[bAttr])[Math.floor(rnd() * 2)]; }
      if (!P.semChamados && sa(attr) < 58 && usa('inversao')) { inv = true; used.push(); }
      let va = sa(attr), vb = sb(attr) + (mov === 'mare' ? 25 : 0);
      if (init === 0 && PAR[attr] != null) { /* Besta responde no mesmo par: usa o melhor do par */ const o = best(a => sb(a), AT.filter(a => PAR[a] === PAR[attr])); vb = sb(o) + (mov === 'mare' ? 25 : 0); }
      let pw;
      if (inv) pw = va < vb ? 1 : va > vb ? 0 : (sum(A) < sum(B) ? 1 : 0); else pw = va > vb ? 1 : va < vb ? 0 : (sum(A) >= sum(B) ? 1 : 0);
      used.forEach(c => { if (!(c === pc)) me.deck.push(c); });   // Chamado usado volta ao fundo
      if (pw) { const extra = []; me.deck.push(pc); if (!UN.includes(bc)) me.deck.push(bc); }
      else {
        if (UN.includes(pc)) { me.tired.push({ c: pc, t: P.cansa == null ? 3 : P.cansa }); }
        else if (muralha) me.deck.push(pc);
        else bd.push(bc), bd.push(pc), (mov === 'garra' && me.deck.length > 1 && (() => { const x = me.deck.shift(); if (UN.includes(x)) me.tired.push({ c: x, t: P.cansa == null ? 3 : P.cansa }); else bd.push(x); })());
        if (!pw && !bd.includes(bc) && !UN.includes(pc)) { }
        if (UN.includes(pc)) bd.push(bc);
      }
      init = 1 - init;
      if (!me.deck.length && !me.prep.length) return { fase, win: false, why: me.tired.length ? 'só cansadas' : 'sem cartas' };
      if (!me.deck.length && me.prep.length) me.deck.push(me.prep.shift());
    }
    if (bd.length) { const tot = me.deck.length + me.prep.length + me.tired.length; if (tot > bd.length) continue; return { fase, win: false, why: 'limite de rodadas' }; }
  }
  return { fase: 3, win: true };
}
const NP = +process.argv[2] || 400;
function taxa(P, n = NP, seed = 1) { const r = { w: 0, f: [0, 0, 0, 0], why: {} }; for (let k = 0; k < n; k++) { const x = jogo(P, rng(seed * 7919 + k)); if (x.win) r.w++; else { r.f[x.fase]++; r.why[x.why] = (r.why[x.why] || 0) + 1; } } return r; }
module.exports = { taxa, jogo, rng };
if (require.main === module) {
  const base = { N: [20, 20, 20], bonus: 0, q: .7, salva: .7, cansa: 3 };
  console.log('== Besta N por fase (todas iguais), sem bônus, jogador bom');
  for (const N of [10, 14, 18, 22, 26, 30, 36]) { const r = taxa(Object.assign({}, base, { N: [N, N, N] })); console.log('N=' + N, 'vitória ' + (100 * r.w / NP).toFixed(0) + '%', 'derrota F1/F2/F3', r.f.slice(1).join('/'), JSON.stringify(r.why)); }
  console.log('== sem Chamados (N=22)'); { const r = taxa(Object.assign({}, base, { N: [22, 22, 22], semChamados: true })); console.log('vitória ' + (100 * r.w / NP).toFixed(0) + '%', r.f.slice(1).join('/')); }
  console.log('== bônus da Besta (+30 por guardião vivo), N=22');
  for (const b of [0, 30, 60, 120]) { const r = taxa(Object.assign({}, base, { N: [22, 22, 22], bonus: b })); console.log('+' + b, (100 * r.w / NP).toFixed(0) + '%'); }
  console.log('== sem cada União (N=22): queda de vitória');
  const r0 = taxa(Object.assign({}, base, { N: [22, 22, 22] })); console.log('com todas', (100 * r0.w / NP).toFixed(0) + '%');
  for (const u of Object.keys(CH)) { const r = taxa(Object.assign({}, base, { N: [22, 22, 22], semUniao: [u] })); console.log('sem ' + CH[u].padEnd(10), (100 * r.w / NP).toFixed(0) + '%'); }
}
