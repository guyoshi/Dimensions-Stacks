# Guardiões: calibragem por simulação (29/10/2026)

Motor real, jogador = CPU difícil com 14 cartas na mão, guardiões = CPU difícil, 30 a 40 partidas por célula. Comando: `node tools/sim_guardioes.js 40 G1 14 2 <cenario>` (G1 usa `MM=2,1 RAR=comum WEAK=1`; os outros usam `AVS=<carta>`).

Cenários do jogador: **cheia** (8 da União + 30 melhores), **média** (4 da União + 20 cartas medianas), **meia** (União + 12), **sem** (14 melhores, sem União).

| Guardião | Baralho | média | cheia | meia | sem |
|---|---|---|---|---|---|
| G1 Dupla somada | 2 + 1 cartas comuns fracas | 50% | 75% | 65% | 63% |
| G2 Roubo duplo | Corvus + 8 | 67% | | | |
| G3 Blocos de três | Lince + 11 | 80% | | | |
| G4 Fenômeno a cada disputa | Escorpião + 5 | 63% | | | |

Conclusão: o G1 é hoje o guardião mais difícil para o jogador médio (50%, contra 63% a 80% dos outros), por isso **não foi alterado**. O Boss com os 4 guardiões derrotados dá 40% a 45% de vitória; com os 4 vivos, 0% (regra intencional).
