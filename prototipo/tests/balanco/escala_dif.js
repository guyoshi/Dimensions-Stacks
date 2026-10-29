// Escala de dificuldade da CPU no modo história (espelha historia.js). OLD=1 reproduz a regra antiga.
const NIVEIS = ['facil', 'normal', 'dificil'];
function antiga(n, v) { const esc = v < 9 ? 0 : v <= 31 ? 1 : 2; return n.tipo === 'normal' ? NIVEIS[esc] : NIVEIS[Math.min(2, [0, 1, 1, 2][Math.max(0, (n.tier || 1) - 1)] + (['elite', 'miniboss', 'guardiao'].includes(n.tipo) && n.tier < 3 ? 1 : 0))]; }
const MARCO = 31, OFF = { normal: 0, evento: .04, elite: .1, miniboss: .18 };
function nova(n, v) { if (n.tipo === 'boss') return 1; const b = v <= MARCO ? .85 * Math.pow(v / MARCO, 1.2) : .85 + .15 * Math.min(1, (v - MARCO) / 15); if (n.tipo === 'guardiao') return Math.max(.9, b); return Math.min(1, b + (OFF[n.tipo] || 0)); }
module.exports = { nivel: (n, v, old) => old ? antiga(n, v) : nova(n, v), nova, antiga };
