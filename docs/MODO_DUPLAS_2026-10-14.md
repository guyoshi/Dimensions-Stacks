# Modo em duplas (2×2) — protótipo e simulação (14/10/2026)

**Status:** regra aprovada pelo autor (14/10/2026) e disponível na interface: botão "Duplas 2×2" na tela de nova partida (contra CPU) e na sala online. Motor: `cfg.teams = [[0,2],[1,3]]`, desligado no modo todos contra todos. Os modos todos contra todos não mudaram (30 partidas com semente fixa dão o mesmo resultado antes e depois).

## Regras testadas
- 4 jogadores, assentos alternados (A1, B1, A2, B2): os vizinhos são sempre adversários.
- Disputa igual à atual com os 4 jogando. Se o vencedor tem o parceiro na mesa, a carta do parceiro volta ao fim do baralho do dono (nunca é capturada nem vai ao Buraco Negro). Só as cartas dos adversários são capturadas/descartadas.
- Um jogador sem cartas (baralho + reserva) é eliminado; o parceiro segue sozinho. A dupla vence quando os dois adversários caem.
- Limite de 400 disputas: vence a dupla com mais cartas.
- Especiais: alvos hostis, "cada adversário", "esquerda/direita" e cancelamentos nunca atingem o parceiro. Efeitos "todos os jogadores" (incluindo quem usa) continuam atingindo o parceiro (confirmado pelo autor em 14/10/2026).
- "Sem montar": opção `cfg.semMontar` (cartas entram na ordem sorteada, sem a etapa de montagem/reordenação, também na compra da reserva).

## Resultados (1.500 partidas por linha, bots difíceis, 10 cartas/jogador)
| Modo | Especiais | Disputas/partida | Rodadas | Dupla A × B | Correl. vitória×poder | Faixa média por série |
|---|---|---|---|---|---|---|
| 4 jogadores todos contra todos | off | 58 | 24,0 | — | 0,93 | 32,9–34,4 |
| 4 jogadores todos contra todos | on | 30 | 11,7 | — | 0,91 | 32,2–33,1 |
| **Duplas** | off | 46 | 14,9 | 764 × 736 | 0,92 | 26,8–28,1 |
| **Duplas** | on | 25 | 7,9 | 764 × 736 | 0,92 | 27,1–29,3 |
| Duplas sem montar | off | 46 | 14,9 | 723 × 777 | 0,95 | 26,5–28,7 |
| Duplas sem montar | on | 24 | 7,9 | 754 × 746 | 0,96 | 28,3–29,5 |

- Nenhuma partida chegou ao limite de 400 disputas; nenhum empate.
- A ordem de raridade das cartas se mantém (Lendária > Épica > Rara > Comum) e as cartas mais fortes são as mesmas do todos contra todos (A Besta, Korvo, Velho-Sábio, Bruno, Releuz).
- A taxa de vitória por carta é menor (≈28% contra ≈33%) porque o parceiro divide as vitórias; a escala relativa é a mesma.
- Sem montar não quebra: a correlação com o poder sobe (0,92 → 0,95), ou seja, a montagem acrescenta habilidade, e sem ela decide só a força das cartas.

## Ponto de atenção: bola de neve
A dupla que perde o primeiro jogador vence só ~14% das partidas (bots difíceis; 13–16% em outros testes). 28% das partidas terminam com 1 sobrevivente. Testada a "ajuda do parceiro" (entregar 3–5 cartas uma vez, em vez de o jogador cair): não melhorou (descartada, não está no código).

## Limitações
- Bots não coordenam com o parceiro (não sacrificam especiais por ele, não escolhem atributo em função da carta dele).
- Especiais que citam "todos" foram tratados de forma simples; revisão completa dos 138 pendente.
- Falta tela de mesa (dupla), bots online e salas.

Scripts: `prototipo/tests/sim_duplas.js`, `sim_duplas_an.js`, `sim_duplas_bola_de_neve.js`.

## Variantes testadas (1.000 partidas cada, bots difíceis, especiais ligados)
Opções no motor (todas desligadas por padrão): `teamShare`, `teamGive`, `teamFall`. Script: `prototipo/tests/sim_duplas_variantes.js`.

| Variante | Disputas | Rodadas | Dupla A | Dupla da 1ª queda vence | Terminam com 1 vivo |
|---|---|---|---|---|---|
| Base | 25 | 7,9 | 52,2% | 15,6% | 27% |
| Reserva compartilhada (sem reserva, compra metade da do parceiro) | 23 | 7,0 | 50,5% | 11,8% | 19% |
| Doação 2 (com ≤2 cartas, o parceiro com ≥8 entrega 2) | 23 | 7,2 | 50,2% | 11,0% | 17% |
| Doação 3 | 24 | 7,4 | 50,3% | 11,0% | 19% |
| Compartilhada + doação 2 | 23 | 6,8 | 49,7% | 9,0% | 14% |
| A queda de um jogador derrota a dupla | 16 | 4,6 | 51,4% | 0% (por definição) | 0% |

Leitura: ajudar o parceiro reduz os finais "1 contra 2" (27% → 14%), mas não faz a dupla que cai primeiro virar (continua ≤12%): quem cai primeiro já era a mais fraca. "Queda derrota a dupla" elimina o 1×2 e encurta a partida em 1/3, mas faz cada jogador depender do parceiro. "Ver a carta do parceiro" não foi simulado (os bots não sabem usar a informação); beneficiaria humanos.

## Pool da dupla (`teamPool`) — 1.500 partidas
Regra: o jogador que fica sem baralho e sem reserva recebe metade das cartas do parceiro (reserva primeiro). Só é eliminado se o parceiro tiver menos de 2 cartas, ou seja, quando a dupla já está praticamente derrotada.

| Variante | Disputas | Rodadas | Dupla A | Terminam com 1 vivo |
|---|---|---|---|---|
| Base | 25 | 8,0 | 51,1% | 26% |
| Reserva compartilhada + doação 2 | 23 | 6,8 | 49,6% | 13% |
| **Pool da dupla** | 21 | 6,1 | 50,1% | **2%** |
| Pool + doação 2 | 21 | 6,1 | 49,7% | 2% |

Efeito: praticamente ninguém joga sozinho ou sai da mesa antes do fim; a partida encurta um pouco e o equilíbrio entre as duplas se mantém. A doação adicional não acrescenta nada ao pool.

## Especiais nas duplas (auditoria)
Teste `prototipo/tests/audit_duplas.js`: os 138 especiais, forçados, em 8.280 partidas 2×2 (60 por especial). Resultado: nenhuma falha de conservação de cartas, nenhuma partida travada e nenhum efeito hostil contra o parceiro.

Adaptações no motor:
- Alvos "adversário", "rival", "direita/esquerda", cancelamentos (Silêncio, Reação, Eco, Apropriação), troca de combatente, captura e desafios nunca escolhem o parceiro; cada "esquerda/direita" pula o parceiro.
- Rodízios e passes (Passe à esquerda/direita, Reservas giratórias) seguem o assento vizinho, que nas duplas é sempre adversário; antes, pular o parceiro quebrava a conservação das cartas quando alguém caía.
- Efeitos "todos, inclusive você" (Descarte coletivo, Atributo universal, pares/ataque/defesa obrigatórios) continuam valendo para o parceiro: decisão de design a confirmar.
- Bots: parceiro vencendo não conta como "estou perdendo", nem como carta rival a bater; o especial do parceiro não é tratado como ameaça.
- Fraqueza conhecida: Troca entre vizinhos, Transferência de reserva e Tríplice transferência movem cartas entre os dois adversários, que são parceiros entre si, então não geram ganho líquido nas duplas (mesmo caso do duelo).
