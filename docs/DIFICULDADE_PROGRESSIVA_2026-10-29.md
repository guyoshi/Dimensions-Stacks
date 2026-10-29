# Dificuldade progressiva do modo história (29/10/2026)

Pedido do autor: o início estava difícil demais. A CPU deve errar mais no começo e ficar atenta conforme o jogador vence batalhas; perto dos 31 combates necessários para chegar aos 4 Guardiões, bem difícil. Os decks perto dos 4 inícios devem ser fracos (com 1 carta boa para capturar).

## Dificuldade da CPU (engine.js + historia.js)
- `diff` aceita um número de 0 a 1 (0 Fácil, 0,5 Normal, 1 Difícil; interpola erros, memória e ruído).
- Progresso = batalhas vencidas (v). Marco = 31 (rota mínima até os 4 Guardiões, 30–32).
- Nível base: v ≤ 31 → 0,85 × (v/31)^1,2; depois sobe até 1 por volta de 46 vitórias.
- Acréscimo por tipo: evento +0,04 · elite +0,10 · Arauto +0,18 · Guardião no mínimo 0,90 · Boss 1.
- Valores: 0 vitórias ≈ 0 · 9 ≈ 0,19 · 15 ≈ 0,36 · 21 ≈ 0,53 · 31 ≈ 0,85.

## Decks perto dos inícios (`prototipo/tools/suavizar_inicio.js`)
- Pontos até 8 passos do início mais próximo (82 pontos, 227 cartas trocadas). Lendárias, Átila, A Besta e cartas da União não foram mexidas.
- Limite de poder (soma + 16 × pico) de cada carta: percentil 12% no início, +7 pontos percentuais por passo, até 62%. Uma carta de prêmio por deck: percentil 62% +3,5 por passo, até 90%.
- Trocas priorizam a mesma série (tema do inimigo).

## Medição (jogador inicial 6 comuns + 1 épica, CPU "normal" como jogador; `tests/balanco/inicio_historia.js`)
| Distância do início | Antes | Depois |
|---|---|---|
| 0 | 58% | 80% |
| 1 | 70% | 77% |
| 2 | 48% | 66% |
| 3 | 61% | 63% |
| 4 | 61% | 62% |
| 5 | 42% | 67% |
| 6 | 40% | 50% |
| 7 | 56% | 53% |
(10–12 partidas por ponto; sem capturas nem cansaço; jogador humano iniciante tende a ir pior que a CPU normal.)
