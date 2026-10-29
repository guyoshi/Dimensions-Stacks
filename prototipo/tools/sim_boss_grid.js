const { taxa } = require('./sim_boss.js'); const NP = +process.argv[2] || 300;
function rel(P) { const r = taxa(P, NP, 3), f = r.f; let reach = NP, out = []; for (let i = 1; i <= 3; i++) { out.push(((reach - f[i]) / reach * 100).toFixed(0) + '%'); reach -= f[i]; } return 'total ' + (100 * r.w / NP).toFixed(0) + '% · passa F1/F2/F3 ' + out.join('/'); }
const base = { bonus: 0, q: .7, salva: .7, cansa: 3 };
const win = P => (100 * taxa(P, NP, 7).w / NP).toFixed(0) + '%';
const FULL = Object.assign({}, base, { N: [30, 30, 40], bonusF: [0, 8, 18], q: .7, salva: .7 });
console.log('== proposta completa (F1 30 cartas +0 · F2 30 cartas +8 · F3 40 cartas +18)'); console.log('jogador bom (q .7):', win(FULL), '· q .5:', win(Object.assign({}, FULL, { q: .5 })), '· q .9:', win(Object.assign({}, FULL, { q: .9 })), '· sem Chamados:', win(Object.assign({}, FULL, { semChamados: true })));
console.log('== sem cada Chamado'); for (const u of ['V02', 'J03', 'M10', 'S01', 'B01', 'M01', 'D06', 'V15']) console.log(u, win(Object.assign({}, FULL, { semUniao: [u] })));
console.log('== rodadas cansada (cansa)'); for (const c of [1, 3, 5, 8]) console.log('cansa=' + c, win(Object.assign({}, FULL, { cansa: c })));
console.log('== qualidade das 22 cartas do jogador (pool das N melhores)'); for (const p of [30, 50, 80]) console.log('top' + p, win(Object.assign({}, FULL, { pool: p })));
