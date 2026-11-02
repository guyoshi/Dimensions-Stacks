// Simulação do Chamado da União (Estírio) com um bot que forma anel em volta do Estírio e foge das hordas.
// uso: node tools/sim_uniao.js [n] [dif] [pest] [vest]
const fs = require('fs'), vm = require('vm'); const src = fs.readFileSync(__dirname + '/../minigames.js', 'utf8');
const a = src.indexOf('  function uniaoSim'), b = src.indexOf('  const GAMES = {'); const uniaoSim = vm.runInNewContext(src.slice(a, b) + '; uniaoSim');
const N = +process.argv[2] || 300, DIF = +process.argv[3] || 1, PEST = process.argv[4] != null ? +process.argv[4] : undefined, VEST = +process.argv[5] || 200;
function jogo(hard, skill) { const S = uniaoSim(DIF, Math.random, { hard, pest: PEST, vest: VEST }); const dt = .05; let acc = 0;
  while (!S.done) { acc += dt;
    // Estírio foge das hordas próximas; "skill" < 1 reage com atraso/menos alcance (jogador humano)
    let vx = 0, vy = 0; S.es.forEach(e => { const d = Math.hypot(S.est.x - e.x, S.est.y - e.y); if (d < 150 * skill + 30) { vx += (S.est.x - e.x) / (d * d + 1); vy += (S.est.y - e.y) / (d * d + 1); } });
    const m = Math.hypot(vx, vy); if (m > 1e-4) S.moveEst(S.est.x + vx / m * 70, S.est.y + vy / m * 70); else S.moveEst(S.est.x, S.est.y);
    S.ms.forEach((h, i) => { if (!h.vivo) return; const ang = i / 8 * 6.283 + S.t * .3, rx = S.est.x + Math.cos(ang) * 38, ry = S.est.y + Math.sin(ang) * 38, dx = rx - h.x, dy = ry - h.y, d = Math.hypot(dx, dy), p = Math.min(d, 280 * skill * dt); if (d > .1) S.move(i, h.x + dx / d * p, h.y + dy / d * p); });
    S.step(dt); }
  return { win: !S.perdeu, v: S.vivos(), pct: S.resultado() }; }
for (const hard of [false, true]) for (const skill of [1, .6]) { let w = 0, v = 0, t3 = 0; const tiers = [0, 0, 0, 0]; for (let i = 0; i < N; i++) { const r = jogo(hard, skill); if (r.win) { w++; v += r.v; } tiers[[.34, .6, .99].filter(x => r.pct >= x).length]++; }
  console.log((hard ? 'Hard  ' : 'Normal') + ' habilidade ' + skill + ': vitória ' + Math.round(100 * w / N) + '% · heróis vivos (nas vitórias) ' + (w ? (v / w).toFixed(1) : '-') + ' · tiers 0/1/2/3 = ' + tiers.join('/')); }
