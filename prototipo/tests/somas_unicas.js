// Garante que nenhuma carta tem a mesma soma de atributos que outra (o desempate é só pela soma dos 4).
global.window = global; ['propostas', 'curtos', 'data'].forEach(f => require('../' + f + '.js'));
const C = Object.values(global.DS_DATA.CARTAS), by = {};
C.forEach(c => { const t = c.stats.pod + c.stats.def + c.stats.int + c.stats.vel; (by[t] = by[t] || []).push(c.id); });
const dup = Object.entries(by).filter(([, a]) => a.length > 1);
console.log('cartas', C.length, 'somas diferentes', Object.keys(by).length, dup.length ? 'REPETIDAS: ' + dup.map(([t, a]) => t + ':' + a.join(',')).join(' | ') : 'ok');
process.exit(dup.length ? 1 : 0);
